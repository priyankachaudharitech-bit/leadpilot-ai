'use client';

import { createClient } from '@/lib/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Lead, LeadWithInsights } from '@/types';
import { toast } from 'sonner';

const supabase = createClient();

export function useLeads({
  page = 1,
  limit = 25,
  sort = 'created_at',
  order = 'desc',
  search,
  status,
  minScore,
  maxScore,
  dateFrom,
  dateTo,
}: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  status?: string;
  minScore?: number;
  maxScore?: number;
  dateFrom?: string;
  dateTo?: string;
} = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['leads', { page, limit, sort, order, search, status, minScore, maxScore, dateFrom, dateTo }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort,
        order,
      });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (minScore !== undefined) params.set('minScore', String(minScore));
      if (maxScore !== undefined) params.set('maxScore', String(maxScore));
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const response = await fetch(`/api/leads?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch leads');
      }
      return response.json();
    },
    placeholderData: true,
  });

  const createMutation = useMutation({
    mutationFn: async (leadData: Partial<Lead>) => {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create lead');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create lead');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete lead');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted', {
        action: {
          label: 'Undo',
          onClick: () => {
            // TODO: Implement undo
          },
        },
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete lead');
    },
  });

  return {
    leads: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createLead: createMutation.mutateAsync,
    deleteLead: deleteMutation.mutateAsync,
  };
}

export function useLead(id: string) {
  const queryClient = useQueryClient();

  const { data: lead, isLoading, error, refetch } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const response = await fetch(`/api/leads/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch lead');
      }
      return response.json() as Promise<LeadWithInsights>;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Lead>) => {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update lead');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update lead');
    },
  });

  return {
    lead,
    isLoading,
    error,
    refetch,
    updateLead: updateMutation.mutateAsync,
  };
}
