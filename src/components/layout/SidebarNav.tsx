'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  Avatar,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { useSidebar } from './Sidebar';
import {
  BarChart3,
  CalendarClock,
  ChevronLeft,
  Home,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, exact: true },
  { name: 'Leads', href: '/leads', icon: Users, exact: false },
  { name: 'Calendar', href: '/calendar', icon: CalendarClock, exact: true },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, exact: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { open, close } = useSidebar();

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-card border-r',
          'transition-transform duration-250 ease-in-out',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b">
          <Link href="/dashboard" className="font-bold text-xl text-primary">
            LeadPilot AI
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={close}
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                      'transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
                    )}
                    onClick={() => {
                      if (open) close();
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t p-4">
          <UserMenu />
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}
    </>
  );
}

function UserMenu() {
  const { user, profile, signOut } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2">
          <Avatar size="sm">
            {profile?.avatar_url ? (
              <Avatar src={profile.avatar_url} alt={profile?.name || user?.email || 'User'} />
            ) : (
              <Avatar name={profile?.name || user?.email || 'User'} />
            )}
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">
              {profile?.name || user?.email}
            </span>
            <span className="text-xs text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.name || user?.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="w-full cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive"
          onSelect={(e) => {
            e.preventDefault();
            void signOut();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
