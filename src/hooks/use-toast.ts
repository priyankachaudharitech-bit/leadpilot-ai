'use client';

import { toast as sonnerToast, type ToasterProps, type ExternalToast } from 'sonner';
import { useCallback } from 'react';

export type { ToasterProps, ExternalToast } from 'sonner';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export const toast = sonnerToast;

export function useToast() {
  const toastImpl = useCallback(
    (message: string, options?: ExternalToast) => {
      return sonnerToast(message, options);
    },
    []
  );

  return {
    toast: toastImpl,
    toastSuccess: (message: string, options?: ExternalToast) =>
      sonnerToast.success(message, options),
    toastError: (message: string, options?: ExternalToast) =>
      sonnerToast.error(message, options),
    toastWarning: (message: string, options?: ExternalToast) =>
      sonnerToast.warning(message, options),
    toastInfo: (message: string, options?: ExternalToast) =>
      sonnerToast.info(message, options),
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
    promise: (
      promise: Promise<unknown>,
      {
        loading,
        success,
        error,
      }: {
        loading: string;
        success: string | ((data: unknown) => string);
        error: string | ((error: unknown) => string);
      }
    ) => sonnerToast.promise(promise, { loading, success, error }),
  };
}
