import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface ListParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}

export function useCrudList<T>(resource: string, params: ListParams = {}) {
  return useQuery({
    queryKey: [resource, params],
    queryFn: async () => {
      const { data } = await api.get(`/${resource}`, { params });
      return data as { data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
    },
  });
}

export function useCrudGet<T>(resource: string, id: string | null) {
  return useQuery({
    queryKey: [resource, id],
    queryFn: async () => {
      const { data } = await api.get(`/${resource}/${id}`);
      return data.data as T;
    },
    enabled: !!id,
  });
}

export function useCrudCreate<T>(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      const { data } = await api.post(`/${resource}`, input);
      return data.data as T;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}

export function useCrudUpdate<T>(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: any }) => {
      const { data } = await api.put(`/${resource}/${id}`, input);
      return data.data as T;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}

export function useCrudDelete(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/${resource}/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}
