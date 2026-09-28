import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const skeletonVariants = cva('relative overflow-hidden rounded-md bg-neutral-200 dark:bg-neutral-700', {
  variants: {
    variant: {
      text: 'h-4 w-full',
      rounded: 'h-4 w-full',
      circular: 'h-10 w-10 rounded-full',
      card: 'h-24 w-full',
    },
    animated: {
      true: 'before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-neutral-300/50 dark:before:via-neutral-600/50 before:to-transparent before:animate-shimmer',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'text',
    animated: true,
  },
});

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, animated, ...props }, ref) => (
    <div
      className={cn(skeletonVariants({ variant, animated, className }))}
      ref={ref}
      {...props}
      aria-label="Loading"
    />
  )
);
Skeleton.displayName = 'Skeleton';

export { Skeleton, skeletonVariants };
