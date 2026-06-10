import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tripPlanSchema } from '@/lib/validations';
import { useGenerateTrip } from '@/hooks/useTrips';
import { useGeocode } from '@/hooks/useMaps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Loader2, ArrowRight, ArrowLeft, Plane, Sparkles, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const interestOptions = [
  'sightseeing', 'food', 'shopping', 'nature', 
  'history', 'museums', 'nightlife', 'adventure', 
  'beaches', 'culture', 'relaxation'
];

export default function PlanTrip() {
  const navigate = useNavigate();
  const generateTripMutation = useGenerateTrip();
  const [step, setStep] = useState(1);
  
  // Destination geocoding autocomplete
  const [searchVal, setSearchVal] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDestCoords, setSelectedDestCoords] = useState(null);

  // Debounce geocode input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchVal);
    }, 450);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const { data: suggestions, isLoading: suggestionsLoading } = useGeocode(debouncedSearch);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tripPlanSchema),
    defaultValues: {
      destination: '',
      startDate: '',
      endDate: '',
      travelers: 1,
      tripType: 'solo',
      budget: 'mid-range',
      interests: [],
      travelStyle: 'moderate',
      dietaryRestrictions: [],
    },
  });

  const formValues = watch();

  const handleSelectSuggestion = (place) => {
    setValue('destination', place.name);
    setSelectedDestCoords({
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lng),
    });
    setSearchVal(place.name);
    setShowSuggestions(false);
  };

  const nextStep = () => {
    if (step === 1 && !formValues.destination) {
      toast.error('Please specify a destination');
      return;
    }
    if (step === 2) {
      if (!formValues.startDate || !formValues.endDate) {
        toast.error('Please specify travel dates');
        return;
      }
      if (new Date(formValues.startDate) > new Date(formValues.endDate)) {
        toast.error('Start date cannot be after end date');
        return;
      }
    }
    if (step === 3 && formValues.interests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  // Loading state quotes to display during generation
  const [loadingQuoteIdx, setLoadingQuoteIdx] = useState(0);
  const loadingQuotes = [
    'Calling Gemini to map your destinations...',
    'Consulting local travel experts and databases...',
    'Generating standard routes and itinerary layouts...',
    'Sorting activities, restaurants, and sights...',
    'Estimating budget bounds and optimal timelines...',
    'Assembling a custom interactive Leaflet route...',
  ];

  useEffect(() => {
    let interval;
    if (generateTripMutation.isPending) {
      interval = setInterval(() => {
        setLoadingQuoteIdx((prev) => (prev + 1) % loadingQuotes.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [generateTripMutation.isPending]);

  const onSubmit = async (data) => {
    if (!selectedDestCoords) {
      toast.error('Please select a valid destination from the suggestions');
      return;
    }

    try {
      const planPayload = {
        ...data,
        coordinates: selectedDestCoords,
      };

      const trip = await generateTripMutation.mutateAsync(planPayload);
      navigate(`/trips/${trip._id}`);
    } catch (err) {
      toast.error('AI itinerary generation failed. Please try again.');
    }
  };

  const budgetOptions = ['backpacker', 'budget', 'mid-range', 'luxury'];

  return (
    <div className="max-w-2xl mx-auto py-6 font-sans select-none relative">
      {/* Loading Overlay */}
      {generateTripMutation.isPending && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin" />
            <Plane className="absolute w-8 h-8 text-teal-400 rotate-45 animate-pulse" />
          </div>
          <div className="text-center space-y-2 px-6">
            <h3 className="text-xl font-bold flex items-center justify-center gap-2">
              <Sparkles className="text-teal-400 animate-bounce" /> Generating Your Dream Trip
            </h3>
            <p className="text-sm text-slate-400 max-w-md animate-pulse">
              {loadingQuotes[loadingQuoteIdx]}
            </p>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 px-4">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                step >= s
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                  : 'bg-background text-muted-foreground border-border/80'
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${
                  step > s ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* STEP 1: DESTINATION */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-foreground">Where do you want to go?</h3>
                  <p className="text-xs text-muted-foreground">Search and select a destination coordinate</p>
                </div>
                <div className="relative">
                  <Label htmlFor="destination">Destination</Label>
                  <div className="relative mt-1">
                    <Input
                      id="destination"
                      type="text"
                      placeholder="e.g. Paris, Tokyo, Bali..."
                      value={searchVal}
                      onChange={(e) => {
                        setSearchVal(e.target.value);
                        setValue('destination', e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                    />
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* Geocode Autocomplete Suggestions */}
                  {showSuggestions && searchVal.length >= 3 && (
                    <div className="absolute left-0 right-0 mt-1.5 max-h-56 overflow-y-auto border border-border bg-popover rounded-lg shadow-lg dark:bg-slate-900/95 backdrop-blur-md z-40">
                      {suggestionsLoading ? (
                        <div className="p-3.5 text-xs text-muted-foreground flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Searching locations...
                        </div>
                      ) : !suggestions || suggestions.length === 0 ? (
                        <div className="p-3.5 text-xs text-muted-foreground">No destinations found.</div>
                      ) : (
                        suggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectSuggestion(item)}
                            className="p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer border-b border-border/40 last:border-0 truncate font-semibold text-foreground/80 hover:text-foreground transition-colors"
                          >
                            {item.name}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: DATES & TRAVELERS */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-1.5 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-foreground">Dates & Companions</h3>
                  <p className="text-xs text-muted-foreground">Tell us when and who you are traveling with</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" {...register('startDate')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" {...register('endDate')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="travelers">Number of Travelers</Label>
                    <Input
                      id="travelers"
                      type="number"
                      min={1}
                      max={20}
                      {...register('travelers', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tripType">Trip Type</Label>
                    <select
                      id="tripType"
                      {...register('tripType')}
                      className="flex h-10 w-full rounded-lg border border-border/80 bg-background/50 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent text-foreground/90 font-semibold transition-all duration-200"
                    >
                      <option value="solo">Solo Travel</option>
                      <option value="couple">Couple</option>
                      <option value="family">Family Trip</option>
                      <option value="group">Group Adventure</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: BUDGET, STYLE & INTERESTS */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="space-y-1.5 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-foreground">Budget & Style</h3>
                  <p className="text-xs text-muted-foreground">Choose preferences to style your trip recommendations</p>
                </div>

                {/* Budget Select */}
                <div className="space-y-1.5">
                  <Label htmlFor="budget">Budget Tier</Label>
                  <select
                    id="budget"
                    {...register('budget')}
                    className="flex h-10 w-full rounded-lg border border-border/80 bg-background/50 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent text-foreground/90 font-semibold transition-all duration-200 capitalize"
                  >
                    {budgetOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Travel Style */}
                <div className="space-y-1.5">
                  <Label htmlFor="travelStyle">Travel Pace</Label>
                  <select
                    id="travelStyle"
                    {...register('travelStyle')}
                    className="flex h-10 w-full rounded-lg border border-border/80 bg-background/50 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent text-foreground/90 font-semibold transition-all duration-200 capitalize"
                  >
                    <option value="relaxed">Relaxed (Easy pace)</option>
                    <option value="moderate">Moderate (Balanced plan)</option>
                    <option value="packed">Packed (Fast pace)</option>
                  </select>
                </div>

                {/* Interests Multi-Select Checkboxes */}
                <div className="space-y-2">
                  <Label>Interests</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1.5">
                    {interestOptions.map((interest) => (
                      <label
                        key={interest}
                        className="flex items-center space-x-2 p-2.5 rounded-lg border border-border/60 hover:bg-slate-50 dark:hover:bg-slate-900/35 cursor-pointer text-xs font-semibold capitalize select-none transition-colors"
                      >
                        <input
                          type="checkbox"
                          value={interest}
                          {...register('interests')}
                          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 bg-background/50"
                        />
                        <span>{interest}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW SUMMARY */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="space-y-1.5 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-foreground">Review & Generate</h3>
                  <p className="text-xs text-muted-foreground">Verify details before launching the Gemini generation</p>
                </div>

                <div className="rounded-xl border border-border/60 bg-slate-50/50 dark:bg-slate-900/40 p-5 space-y-3.5 text-xs sm:text-sm font-semibold text-foreground/85">
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Destination</span>
                    <span className="text-right max-w-[70%] truncate font-bold text-foreground">{formValues.destination}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Dates</span>
                    <span>
                      {formValues.startDate} to {formValues.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Travelers</span>
                    <span>{formValues.travelers} ({formValues.tripType})</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="capitalize">{formValues.budget}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Pace</span>
                    <span className="capitalize">{formValues.travelStyle}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Selected Interests</span>
                    <span className="text-xs text-primary capitalize flex flex-wrap gap-1 mt-1.5">
                      {formValues.interests.map((interest) => (
                        <span key={interest} className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                          {interest}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Footer Controls */}
            <div className="flex items-center justify-between border-t border-border/60 pt-5 mt-6">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft size={16} className="mr-1.5" /> Back
                </Button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button type="button" variant="default" onClick={nextStep}>
                  Next <ArrowRight size={16} className="ml-1.5" />
                </Button>
              ) : (
                <Button type="submit" variant="gradient" className="shadow-lg shadow-teal-500/10 hover:shadow-teal-500/25">
                  Generate Itinerary <Sparkles size={16} className="ml-1.5" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
