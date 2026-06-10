import React, { useState, useEffect } from 'react';
import { 
  useGeocode, 
  useNearby, 
  useSaveLocation 
} from '@/hooks/useMaps';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Lucide
import { 
  Search, 
  MapPin, 
  Bookmark, 
  Loader2, 
  Navigation,
  Sparkles
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCategoryIcon } from '@/lib/utils';
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

// Custom map controller to center map on coordinates
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 13);
    }
  }, [center, map]);
  return null;
}

const exploreCategories = [
  { value: 'attractions', label: 'Attractions', icon: '🏛️' },
  { value: 'food', label: 'Food', icon: '🍽️' },
  { value: 'parks', label: 'Parks', icon: '🌳' },
  { value: 'hotels', label: 'Hotels', icon: '🏨' },
  { value: 'transport', label: 'Transport', icon: '🚌' },
];

export default function Explore() {
  const saveLocationMutation = useSaveLocation();

  // Search autocomplete states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Map Coordinates & Filter States (Default to Paris)
  const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 });
  const [activeCategory, setActiveCategory] = useState('attractions');
  const [radius, setRadius] = useState(2500);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 450);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: searchResults, isLoading: geocodeLoading } = useGeocode(debouncedSearch);
  const { data: places, isLoading: placesLoading } = useNearby(mapCenter, activeCategory, radius);

  const handleSelectSuggestion = (place) => {
    const coords = {
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lng),
    };
    setMapCenter(coords);
    setSearchQuery(place.name);
    setShowSuggestions(false);
  };

  const handleSavePlace = async (poi) => {
    try {
      await saveLocationMutation.mutateAsync({
        name: poi.name,
        lat: poi.lat,
        lng: poi.lon,
      });
    } catch (err) {
      toast.error('Failed to save location');
    }
  };

  // Center on current geolocated position
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    toast.loading('Locating...', { duration: 1500 });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast.success('Centered on your current location!');
      },
      () => {
        toast.error('Unable to retrieve your location');
      }
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8.5rem)] pb-6 select-none font-sans">
      {/* Left panel: Search & Sidebar list */}
      <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0 h-full">
        {/* Search destination */}
        <Card className="border-border/60">
          <CardContent className="p-4 space-y-3">
            <Label htmlFor="searchDest" className="font-bold">Explore Destination</Label>
            <div className="relative">
              <Input
                id="searchDest"
                type="text"
                placeholder="Search a city to explore..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              
              {/* Autocomplete Suggestions */}
              {showSuggestions && searchQuery.length >= 3 && (
                <div className="absolute left-0 right-0 mt-1.5 max-h-56 overflow-y-auto border border-border bg-popover rounded-lg shadow-lg dark:bg-slate-900/95 backdrop-blur-md z-40">
                  {geocodeLoading ? (
                    <div className="p-3 text-xs text-muted-foreground flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Searching...
                    </div>
                  ) : !searchResults || searchResults.length === 0 ? (
                    <div className="p-3 text-xs text-muted-foreground">No places found.</div>
                  ) : (
                    searchResults.map((item, idx) => (
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
            
            <Button variant="outline" size="sm" onClick={handleGeolocation} className="w-full flex items-center gap-1.5 font-semibold">
              <Navigation size={13} /> Center to My Location
            </Button>
          </CardContent>
        </Card>

        {/* Categories & Results list */}
        <Card className="border-border/60 flex-1 flex flex-col min-h-0 overflow-hidden">
          <CardHeader className="pb-3 shrink-0">
            <CardTitle className="text-base">Nearby Attractions</CardTitle>
            <CardDescription>Select a category to filter landmarks</CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden p-0">
            {/* Category scroll row */}
            <div className="flex gap-1.5 overflow-x-auto px-4 pb-2.5 shrink-0 select-none scrollbar-thin">
              {exploreCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                    activeCategory === cat.value
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* List scroll panel */}
            <div className="flex-1 overflow-y-auto px-4 py-2 border-t border-border/40">
              {placesLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Querying OSM Overpass database...</p>
                </div>
              ) : !places || places.length === 0 ? (
                <p className="text-xs text-muted-foreground py-10 text-center">No landmarks found nearby.</p>
              ) : (
                <div className="space-y-3 pb-6">
                  {places.map((place, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-border/40 hover:bg-slate-50 dark:hover:bg-slate-900/30 flex justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold truncate text-foreground/90">{place.name || 'Local Landmark'}</p>
                        <p className="text-[10px] text-muted-foreground truncate capitalize mt-0.5">{place.type}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-primary shrink-0 self-center"
                        onClick={() => handleSavePlace(place)}
                      >
                        <Bookmark size={13} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right panel: Full screen Leaflet map */}
      <Card className="flex-1 border-border/60 overflow-hidden relative">
        <div className="h-full w-full z-10">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={13}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Render center point marker */}
            <Marker position={[mapCenter.lat, mapCenter.lng]}>
              <Popup>
                <div className="text-xs font-bold text-teal-600">Centered Location</div>
              </Popup>
            </Marker>

            {/* Render POI matching markers */}
            {places?.map((place, idx) => (
              <Marker key={idx} position={[place.lat, place.lon]}>
                <Popup>
                  <div className="text-xs p-1 space-y-1">
                    <p className="font-bold text-primary">{place.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{place.type}</p>
                    <button
                      onClick={() => handleSavePlace(place)}
                      className="text-[9px] text-teal-500 hover:underline font-bold focus:outline-none flex items-center gap-0.5 mt-1"
                    >
                      <Bookmark size={9} /> Save to Dashboard
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            <MapController center={mapCenter} />
          </MapContainer>
        </div>
      </Card>
    </div>
  );
}
