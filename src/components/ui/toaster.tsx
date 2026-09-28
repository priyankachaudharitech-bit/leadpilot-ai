'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'group toast group',
          success: 'group bg-success-50 border-success-200 text-success-900',
          error: 'group bg-error-50 border-error-200 text-error-900',
          warning: 'group bg-warning-50 border-warning-200 text-warning-900',
          info: 'group bg-info-50 border-info-200 text-info-900',
          actionButton: 'group font-semibold',
          cancelButton: 'group font-semibold',
        },
      }}
    />
  );
}
