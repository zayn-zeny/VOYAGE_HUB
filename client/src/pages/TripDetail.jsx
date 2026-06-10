import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip, useUpdateTrip, useDeleteTrip, useUpdateNotes, useOptimizeTrip } from '@/hooks/useTrips';
import { useNearby } from '@/hooks/useMaps';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline,
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Lucide Icons
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Plus, 
  Trash2, 
  Save, 
  Sparkles, 
  ArrowLeft,
  Activity,
  Compass,
  PieChart as ChartIcon,
  BookOpen
} from 'lucide-react';

// shadcn UI & layout components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  formatDate, 
  formatDateRange, 
  formatCurrency, 
  getDestinationGradient, 
  getCategoryIcon 
} from '@/lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import toast from 'react-hot-toast';

// Leaflet Default Icon Patch
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom sub-component to update map bounds dynamically
function ChangeMapCenter({ center, markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (center) {
      map.setView([center.lat, center.lng], 12);
    }
  }, [center, markers, map]);
  return null;
}

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Queries & Mutations
  const { data: trip, isLoading, error } = useTrip(id);
  const deleteTripMutation = useDeleteTrip();
  const updateNotesMutation = useUpdateNotes();
  const optimizeTripMutation = useOptimizeTrip();

  // Local States
  const [activeTab, setActiveTab] = useState('itinerary');
  const [notes, setNotes] = useState('');
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [isOptimizeOpen, setIsOptimizeOpen] = useState(false);
  const [optimizePrompt, setOptimizePrompt] = useState('');

  // Fetch Nearby Places using destination coords
  const { data: nearbyPlaces } = useNearby(
    trip?.destination?.coordinates,
    'tourism',
    2000,
    { enabled: !!trip?.destination?.coordinates }
  );

  useEffect(() => {
    if (trip) {
      setNotes(trip.notes || '');
    }
  }, [trip]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="text-center py-12">
        <p className="text-sm font-bold text-destructive">Failed to load trip details.</p>
        <Button onClick={() => navigate('/trips')} className="mt-4">
          Back to My Trips
        </Button>
      </div>
    );
  }

  const handleSaveNotes = async () => {
    try {
      await updateNotesMutation.mutateAsync({ id: trip._id, notes });
    } catch (err) {
      toast.error('Failed to save notes');
    }
  };

  const handleOptimizeSubmit = async () => {
    if (!optimizePrompt) return;
    setIsOptimizeOpen(false);
    
    // Set a loading toast
    const loadingToast = toast.loading('Gemini is optimizing your schedule...');
    
    try {
      await optimizeTripMutation.mutateAsync({
        id: trip._id,
        optimizeOptions: { prompt: optimizePrompt },
      });
      toast.dismiss(loadingToast);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Itinerary optimization failed');
    }
  };

  const handleDelete = async () => {
    if (confirm('Delete this itinerary permanently?')) {
      try {
        await deleteTripMutation.mutateAsync(trip._id);
        navigate('/trips');
      } catch (err) {
        toast.error('Failed to delete trip');
      }
    }
  };

  // Compile all marker objects across activities
  const mapMarkers = [];
  const mapPolyline = [];
  
  if (trip.itinerary && trip.itinerary.length > 0) {
    // If we have selected a specific day, map only that day's activities. Otherwise all.
    const selectedDayActivities = trip.itinerary[activeDayIdx]?.activities || [];
    selectedDayActivities.forEach((act) => {
      if (act.coordinates && act.coordinates.lat && act.coordinates.lng) {
        mapMarkers.push({
          lat: act.coordinates.lat,
          lng: act.coordinates.lng,
          name: act.name,
          category: act.category,
          time: act.time,
        });
        mapPolyline.push([act.coordinates.lat, act.coordinates.lng]);
      }
    });
  }

  // Budget data calculation
  let categoryCostData = [
    { category: 'Food', amount: 0, fill: '#ef4444' },
    { category: 'Attractions', amount: 0, fill: '#3b82f6' },
    { category: 'Transport', amount: 0, fill: '#10b981' },
    { category: 'Accommodation', amount: 0, fill: '#f59e0b' },
    { category: 'Activities', amount: 0, fill: '#8b5cf6' },
  ];

  let totalSpent = 0;
  if (trip.itinerary) {
    trip.itinerary.forEach((day) => {
      day.activities?.forEach((act) => {
        const cost = act.estimatedCost || 0;
        totalSpent += cost;
        if (act.category === 'food') categoryCostData[0].amount += cost;
        else if (act.category === 'attraction') categoryCostData[1].amount += cost;
        else if (act.category === 'transport') categoryCostData[2].amount += cost;
        else if (act.category === 'accommodation') categoryCostData[3].amount += cost;
        else categoryCostData[4].amount += cost;
      });
    });
  }

  // Filter out category nodes that have 0 spending
  categoryCostData = categoryCostData.filter(d => d.amount > 0);

  const destGradient = getDestinationGradient(trip.destination?.name || 'voyage');

  return (
    <div className="space-y-6 pb-12 font-sans select-none relative">
      {/* Back button */}
      <button 
        onClick={() => navigate('/trips')} 
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
      >
        <ArrowLeft size={14} /> Back to My Trips
      </button>

      {/* Hero Header */}
      <div className={`relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-tr ${destGradient} p-6 md:p-8 text-white shadow-md`}>
        <div className="absolute top-[-30%] right-[-10%] w-[350px] h-[350px] bg-white/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2.5">
            <Badge variant="outline" className="bg-black/35 backdrop-blur-sm border-white/20 text-white uppercase text-[9px] font-extrabold tracking-wide">
              {trip.status}
            </Badge>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight drop-shadow-md">
              {trip.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-semibold text-white/95">
              <span className="flex items-center gap-1">
                <MapPin size={15} /> {trip.destination?.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={15} /> {formatDateRange(trip.startDate, trip.endDate)}
              </span>
              <span>{trip.duration} days ({trip.travelers} traveler{trip.travelers > 1 ? 's' : ''})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsOptimizeOpen(true)} 
              className="border-white/30 text-white hover:bg-white/15 hover:text-white font-semibold flex items-center gap-1.5"
            >
              <Sparkles size={14} /> Optimize
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDelete} 
              className="border-white/30 text-white hover:bg-rose-500/25 hover:border-rose-500/50 hover:text-white font-semibold"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-lg mb-6">
          <TabsTrigger value="itinerary" className="flex items-center gap-1.5 font-bold"><Activity size={14} /> Schedule</TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-1.5 font-bold"><Compass size={14} /> Maps</TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-1.5 font-bold"><ChartIcon size={14} /> Expenses</TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-1.5 font-bold"><BookOpen size={14} /> Notebook</TabsTrigger>
        </TabsList>

        {/* TAB 1: ITINERARY DETAILS */}
        <TabsContent value="itinerary" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Days sidebar selector */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 lg:max-h-[500px]">
              {trip.itinerary?.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDayIdx(idx)}
                  className={`flex-shrink-0 text-left px-4 py-3 rounded-lg border transition-all duration-200 flex items-center justify-between gap-3 min-w-[120px] lg:w-full font-semibold ${
                    activeDayIdx === idx
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-card border-border hover:bg-slate-50 dark:hover:bg-slate-900/30 text-foreground/80'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs">Day {day.day}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{day.title || 'Sightseeing'}</span>
                  </div>
                  {day.dailyCost > 0 && (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      ${day.dailyCost}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Activities schedule timeline */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Day {activeDayIdx + 1} Schedule</span>
                    <span className="text-sm text-muted-foreground font-semibold">
                      Total day cost: {formatCurrency(trip.itinerary[activeDayIdx]?.dailyCost || 0)}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {trip.itinerary[activeDayIdx]?.title || 'Explore the best attractions nearby'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(!trip.itinerary[activeDayIdx]?.activities || trip.itinerary[activeDayIdx].activities.length === 0) ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No scheduled activities for this day.</p>
                  ) : (
                    <div className="relative border-l-2 border-slate-200 dark:border-slate-800 pl-6 ml-3.5 space-y-8">
                      {trip.itinerary[activeDayIdx].activities.map((act, idx) => (
                        <div key={act._id || idx} className="relative">
                          {/* Timeline node icon */}
                          <span className="absolute -left-[35px] top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-background text-sm shadow-sm">
                            {getCategoryIcon(act.category)}
                          </span>

                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                                  {act.time}
                                </span>
                                <h4 className="text-sm font-extrabold text-foreground ml-1.5 inline">
                                  {act.name}
                                </h4>
                              </div>
                              {act.estimatedCost > 0 && (
                                <Badge variant="outline" className="text-[10px] font-bold">
                                  {formatCurrency(act.estimatedCost)}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {act.description}
                            </p>
                            {act.location && (
                              <p className="text-[10px] text-muted-foreground/80 flex items-center gap-1 font-semibold">
                                <MapPin size={11} /> {act.location}
                              </p>
                            )}
                            {act.tips && (
                              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border-l-2 border-amber-500 text-[10px] text-muted-foreground italic leading-relaxed">
                                <span className="font-bold not-italic text-amber-600 block mb-0.5">Tip:</span>
                                {act.tips}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: INTERACTIVE MAP VIEW */}
        <TabsContent value="map" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Leaflet map */}
            <Card className="lg:col-span-2 border-border/60 overflow-hidden">
              <div className="h-[450px] w-full z-10">
                <MapContainer
                  center={[trip.destination?.coordinates?.lat || 0, trip.destination?.coordinates?.lng || 0]}
                  zoom={12}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {mapMarkers.map((marker, idx) => (
                    <Marker key={idx} position={[marker.lat, marker.lng]}>
                      <Popup>
                        <div className="text-xs font-semibold p-1">
                          <p className="font-bold text-primary">{marker.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Time: {marker.time}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {mapPolyline.length > 1 && (
                    <Polyline positions={mapPolyline} color="#0ea5e9" weight={3} dashArray="5, 10" />
                  )}
                  <ChangeMapCenter
                    center={trip.destination?.coordinates}
                    markers={mapMarkers}
                  />
                </MapContainer>
              </div>
            </Card>

            {/* Right sidebar: Nearby POIs */}
            <Card className="border-border/60 flex flex-col h-[450px]">
              <CardHeader className="pb-3">
                <CardTitle>Discover Nearby Attractions</CardTitle>
                <CardDescription>POI matches from OpenStreetMap</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto px-4 py-0">
                {!nearbyPlaces || nearbyPlaces.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">No nearby POIs loaded</p>
                ) : (
                  <div className="space-y-3 pb-4">
                    {nearbyPlaces.map((poi, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-border/40 hover:bg-slate-50 dark:hover:bg-slate-900/30 flex justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-bold truncate text-foreground/90">{poi.name || 'Local Attraction'}</p>
                          <p className="text-[10px] text-muted-foreground truncate capitalize mt-0.5">{poi.type}</p>
                        </div>
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${poi.lat}&mlon=${poi.lon}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-primary hover:underline font-bold shrink-0 self-center"
                        >
                          View Map
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: BUDGET ANALYSIS */}
        <TabsContent value="budget" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Budget summaries */}
            <div className="space-y-6">
              <Card className="border-border/60">
                <CardContent className="p-6 text-center space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">Estimated Budget Bounds</p>
                  <h3 className="text-3xl font-extrabold text-foreground">
                    {formatCurrency(trip.budget?.estimated || 0)}
                  </h3>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">
                    {trip.budget?.tier} tier
                  </span>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardContent className="p-6 text-center space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">Current Total Spent</p>
                  <h3 className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                    {formatCurrency(totalSpent)}
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    Summed from activities
                  </span>
                </CardContent>
              </Card>
            </div>

            {/* Recharts chart */}
            <Card className="md:col-span-2 border-border/60 flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Cost distribution parsed from scheduled activities</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                {categoryCostData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <DollarSign className="h-10 w-10 text-muted-foreground/35 mb-2" />
                    <p className="text-sm text-muted-foreground">No expenses registered yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryCostData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="category" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 8 }} />
                      <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                        {categoryCostData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: NOTEBOOK EDITING */}
        <TabsContent value="notes">
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Trip Notebook</CardTitle>
                <CardDescription>Store links, flight numbers, and custom offline thoughts</CardDescription>
              </div>
              <Button size="sm" onClick={handleSaveNotes} disabled={updateNotesMutation.isPending} className="font-semibold flex items-center gap-1">
                <Save size={14} /> Save Notes
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write flight details, pack checklists, accommodation codes, links to guides..."
                className="min-h-[350px] font-mono text-sm leading-relaxed"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Optimize Schedule Modal */}
      <Dialog open={isOptimizeOpen} onOpenChange={setIsOptimizeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-teal-500 animate-pulse" /> Optimize with Gemini AI
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-xs sm:text-sm font-semibold">
            <p className="text-muted-foreground leading-normal">
              Need to rewrite this schedule? Enter adjustments or style modifications, and Gemini will re-generate the itinerary in real time.
            </p>
            <div className="space-y-2">
              <Label htmlFor="optPrompt">Adjustment prompt</Label>
              <Textarea
                id="optPrompt"
                value={optimizePrompt}
                onChange={(e) => setOptimizePrompt(e.target.value)}
                placeholder="e.g. 'I want more local food tasting activities', 'Make Day 2 less packed', 'Budget is tight, suggest free entries'"
                className="h-28"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOptimizeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleOptimizeSubmit} variant="gradient">
              Rewrite Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
