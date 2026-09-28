import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const inputVariants = cva(
  cn(
    'flex w-full rounded-md border bg-background px-3 py-2 text-base',
    'transition-colors file:border-0 file:bg-transparent file:font-medium',
    'file:disabled:cursor-not-allowed file:disabled:opacity-50',
    'placeholder:text-muted-foreground',
    'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
    'focus-within:border-transparent',
    'disabled:cursor-not-allowed disabled:opacity-50'
  ),
  {
    variants: {
      variant: {
        default: 'border-input',
        filled: 'border-0 bg-neutral-100 dark:bg-neutral-800',
        subtle: 'border-0 border-b-2 border-neutral-200 dark:border-neutral-700 bg-transparent rounded-none px-0',
      },
      error: {
        true: 'border-error-500 focus-within:ring-error-500',
        false: '',
      },
      size: {
        sm: 'h-8 px-2 text-sm',
        md: 'h-10 px-3 text-base',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      error: false,
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, error, size, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, error, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
