'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { SidebarProvider } from '@/components/layout/Sidebar';
import { Toaster } from '@/components/ui';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SidebarProvider>
          {children}
          <Toaster />
        </SidebarProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
