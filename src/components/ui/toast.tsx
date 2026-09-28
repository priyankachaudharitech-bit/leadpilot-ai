import { useToast as useToastBase } from '@/hooks/use-toast';
import { toast as toastBase } from 'sonner';

export const toast = toastBase;
export type { ToasterProps, ExternalToast } from 'sonner';
export { Toaster } from './toaster';
export { useToast } from '@/hooks/use-toast';
export type { ToastAction } from '@/hooks/use-toast';
