'use client';

import { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils/cn';
import { Sidebar } from './SidebarNav';

export function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
