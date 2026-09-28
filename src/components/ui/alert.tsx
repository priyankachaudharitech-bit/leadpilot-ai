import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const alertVariants = cva(
  cn(
    'relative w-full rounded-md border px-4 py-3 text-sm',
    '[&_svg+div]:contents, [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0',
  ),
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-transparent bg-error-50 text-error-700 dark:bg-error-950/30 dark:text-error-200',
        success:
          'border-transparent bg-success-50 text-success-700 dark:bg-success-950/30 dark:text-success-200',
        warning:
          'border-transparent bg-warning-50 text-warning-700 dark:bg-warning-950/30 dark:text-warning-200',
        info: 'border-transparent bg-info-50 text-info-700 dark:bg-info-950/30 dark:text-info-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(alertVariants({ variant }), className)}
      role="alert"
      {...props}
    />
  )
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-semibold leading-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
