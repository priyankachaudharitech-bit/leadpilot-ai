'use client';

import { Header } from '@/components/layout/Header';
import { SidebarProvider, useSidebar } from '@/components/layout/Sidebar';
import { Sidebar } from '@/components/layout/SidebarNav';
import { Toaster } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main
            className={cn(
              'flex-1 overflow-y-auto',
              'transition-all duration-250 ease-in-out',
            )}
          >
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
