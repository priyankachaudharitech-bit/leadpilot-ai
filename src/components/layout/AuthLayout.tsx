import { PropsWithChildren } from 'react';

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="w-full max-w-md space-y-6 p-8">
        {children}
      </div>
    </div>
  );
}
