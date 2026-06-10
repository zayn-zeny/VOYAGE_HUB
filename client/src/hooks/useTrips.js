import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export function useTrips(filters = {}) {
  return useQuery({
    queryKey: ['trips', filters],
    queryFn: async () => {
      const { data } = await api.get('/trips', { params: filters });
      return data.trips;
    },
  });
}

export function useTrip(id) {
  return useQuery({
    queryKey: ['trip', id],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${id}`);
      return data.trip;
    },
    enabled: !!id,
  });
}

export function useTripStats() {
  return useQuery({
    queryKey: ['tripStats'],
    queryFn: async () => {
      const { data } = await api.get('/trips/stats/summary');
      return data;
    },
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tripData) => {
      const { data } = await api.post('/trips', tripData);
      return data.trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['tripStats'] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tripData }) => {
      const { data } = await api.put(`/trips/${id}`, tripData);
      return data.trip;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', data._id] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/trips/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['tripStats'] });
      queryClient.removeQueries({ queryKey: ['trip', id] });
      toast.success('Trip deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete trip');
    },
  });
}

export function useUpdateNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }) => {
      const { data } = await api.put(`/trips/${id}/notes`, { notes });
      return data.trip;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trip', data._id] });
      toast.success('Notes saved');
    },
  });
}

export function useGenerateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planData) => {
      const { data } = await api.post('/ai/generate-itinerary', planData);
      return data.trip;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['tripStats'] });
      toast.success('AI Trip Itinerary Generated!');
    },
  });
}

export function useOptimizeTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, optimizeOptions }) => {
      const { data } = await api.post('/ai/optimize-itinerary', { tripId: id, instructions: optimizeOptions });
      return data.trip;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trip', data._id] });
      toast.success('Itinerary optimized!');
    },
  });
}

export function useGetSuggestions() {
  return useMutation({
    mutationFn: async ({ destination, category }) => {
      const { data } = await api.get('/ai/suggestions', {
        params: { destination, category },
      });
      return data.suggestions;
    },
  });
}
