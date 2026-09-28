import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { Button, type ButtonProps } from './button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, title, description, action, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-12 px-4 text-center',
          className
        )}
        {...props}
      >
        {icon && <div className="mb-4">{icon}</div>}
        <h3 className="text-lg font-semibold">{title || 'No data found'}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">{description}</p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ className, title, description, onRetry, retryText = 'Retry', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-12 px-4 text-center',
          className
        )}
        {...props}
      >
        <div className="mb-4 rounded-full bg-error-50 p-3">
          <svg
            className="h-6 w-6 text-error-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.86 4.95l11.72-4.35a1 1 0 00-.36-1.85L6.14 7.05a1 1 0 01-.36-1.85L2.7 2.95a1 1 0 10-1.76.86L6.38 9.55a1 1 0 00.36 1.85L10.7 14.45a1 1 0 001.76-.86v-.04l-2.82-2.82"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">{title || 'Something went wrong'}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">{description}</p>
        )}
        {onRetry && (
          <Button
            variant="primary"
            size="md"
            className="mt-6"
            onClick={onRetry}
          >
            {retryText}
          </Button>
        )}
      </div>
    );
  }
);
ErrorState.displayName = 'ErrorState';

export { EmptyState, ErrorState };
