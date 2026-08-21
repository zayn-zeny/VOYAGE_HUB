import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import useAuth from './useAuth';
import toast from 'react-hot-toast';

import axios from 'axios';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const OSRM_BASE = 'https://router.project-osrm.org';

const headers = {
  'Accept-Language': 'en',
};

export function useGeocode(query, options = {}) {
  return useQuery({
    queryKey: ['geocode', query],
    queryFn: async () => {
      if (!query || query.length < 3) return [];
      const { data } = await axios.get(`${NOMINATIM_BASE}/search`, {
        params: { q: query, format: 'json', addressdetails: 1, limit: 5 },
        headers,
      });
      return data.map((item) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type,
        country: item.address?.country || '',
        city: item.address?.city || item.address?.town || item.address?.village || '',
        importance: item.importance,
      }));
    },
    enabled: !!query && query.length >= 3,
    staleTime: 1000 * 60 * 60,
    ...options,
  });
}

export function useNearby(coords, category, radius, options = {}) {
  const lat = coords?.lat;
  const lng = coords?.lng;
  return useQuery({
    queryKey: ['nearby', lat, lng, category, radius],
    queryFn: async () => {
      const { data } = await api.get('/maps/nearby', {
        params: { lat, lng, category, radius },
      });
      return data.places;
    },
    enabled: !!lat && !!lng,
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}

export function useRoute(fromCoords, toCoords, options = {}) {
  const fromStr = fromCoords ? `${fromCoords.lat},${fromCoords.lng}` : '';
  const toStr = toCoords ? `${toCoords.lat},${toCoords.lng}` : '';
  return useQuery({
    queryKey: ['route', fromStr, toStr],
    queryFn: async () => {
      const { data } = await axios.get(
        `${OSRM_BASE}/route/v1/driving/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}`,
        {
          params: { overview: 'full', geometries: 'geojson', steps: true },
        }
      );
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];
      return {
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry,
        steps: route.legs[0]?.steps?.map((step) => ({
          instruction: step.maneuver.type,
          distance: step.distance,
          duration: step.duration,
          name: step.name,
        })),
      };
    },
    enabled: !!fromStr && !!toStr,
    staleTime: 1000 * 60 * 30,
    ...options,
  });
}

export function useSaveLocation() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: async (locationData) => {
      const { data } = await api.post('/maps/locations', locationData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      updateUser((prev) => prev ? { ...prev, savedLocations: data.locations } : null);
      toast.success('Location saved to your dashboard!');
    },
    onError: () => {
      toast.error('Failed to save location');
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: async (locationId) => {
      const { data } = await api.delete(`/maps/locations/${locationId}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      updateUser((prev) => prev ? { ...prev, savedLocations: data.locations } : null);
      toast.success('Location removed');
    },
    onError: () => {
      toast.error('Failed to delete location');
    },
  });
}
