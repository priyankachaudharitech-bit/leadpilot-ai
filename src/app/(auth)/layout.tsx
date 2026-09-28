import type { ReactNode } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="animate-pulse h-8 w-40 bg-neutral-200 dark:bg-neutral-700 rounded" /></div>}>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
        <div className="w-full max-w-md space-y-8 p-8">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-xl bg-white dark:bg-neutral-800 p-2 shadow-lg">
                <svg
                  className="h-10 w-10 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-2.21 0-4.21.86-5.76 2.24l1.42 1.42C9.37 10.7 10.61 10 12 10c1.39 0 2.63.7 3.34 1.66l1.42-1.42A7.93 7.93 0 0012 4a8 8 0 01-8 0z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              LeadPilot AI
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              AI-powered lead intelligence for sales teams
            </p>
          </div>

          {children}
        </div>
      </div>
    </Suspense>
  );
}