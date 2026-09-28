'use client';

import { useRouter } from 'next/navigation';
import { Menu, Bell, Search } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useSidebar } from './Sidebar';

export function Header() {
  const router = useRouter();
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={toggle}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" aria-label="Search">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
