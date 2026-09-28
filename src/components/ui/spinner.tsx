import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const spinnerVariants = cva(
  cn('inline-block animate-spin rounded-full border-2 border-current border-t-transparent'),
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, ...props }, ref) => (
    <div
      className={cn(spinnerVariants({ size, className }))}
      ref={ref}
      {...props}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
);
Spinner.displayName = 'Spinner';

export { Spinner, spinnerVariants };
