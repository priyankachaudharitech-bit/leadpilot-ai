import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  cn(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
    'transition-colors',
  ),
  {
    variants: {
      variant: {
        solid: 'border-transparent',
        outline: 'border bg-background',
        soft: 'border-transparent',
      },
      colorScheme: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-neutral-100 text-neutral-700',
        success: 'bg-success-500 text-white',
        warning: 'bg-warning-500 text-white',
        error: 'bg-error-500 text-white',
        info: 'bg-info-500 text-white',
        neutral: 'bg-neutral-100 text-neutral-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-2xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'solid',
      colorScheme: 'neutral',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, colorScheme, size, ...props }, ref) => (
    <span
      className={cn(badgeVariants({ variant, colorScheme, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
