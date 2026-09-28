import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const textareaVariants = cva(
  cn(
    'flex w-full rounded-md border bg-background px-3 py-2 text-base',
    'placeholder:text-muted-foreground',
    'transition-colors',
    'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
    'focus-within:border-transparent',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'resize-y min-h-[80px]'
  ),
  {
    variants: {
      variant: {
        default: 'border-input',
        filled: 'border-0 bg-neutral-100 dark:bg-neutral-800',
      },
      error: {
        true: 'border-error-500 focus-within:ring-error-500',
        false: '',
      },
      size: {
        sm: 'px-2 py-1 text-sm',
        md: 'px-3 py-2 text-base',
        lg: 'px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      error: false,
      size: 'md',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, error, size, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, error, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
