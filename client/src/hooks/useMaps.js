import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import useAuth from './useAuth';
import toast from 'react-hot-toast';

export function useGeocode(query, options = {}) {
  return useQuery({
    queryKey: ['geocode', query],
    queryFn: async () => {
      if (!query || query.length < 3) return [];
      const { data } = await api.get('/maps/geocode', { params: { q: query } });
      return data.results;
    },
    enabled: !!query && query.length >= 3,
    staleTime: 1000 * 60 * 60, // Cache geocode results for an hour
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
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    ...options,
  });
}

export function useRoute(fromCoords, toCoords, options = {}) {
  const fromStr = fromCoords ? `${fromCoords.lat},${fromCoords.lng}` : '';
  const toStr = toCoords ? `${toCoords.lat},${toCoords.lng}` : '';
  return useQuery({
    queryKey: ['route', fromStr, toStr],
    queryFn: async () => {
      const { data } = await api.get('/maps/route', {
        params: { from: fromStr, to: toStr },
      });
      return data.route;
    },
    enabled: !!fromStr && !!toStr,
    staleTime: 1000 * 60 * 30, // Cache routes for 30 minutes
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
