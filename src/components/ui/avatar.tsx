import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const avatarVariants = cva(
  cn(
    'relative flex shrink-0 overflow-hidden rounded-full',
    'border-2 border-white dark:border-neutral-800',
  ),
  {
    variants: {
      size: {
        xs: 'h-5 w-5',
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
        xl: 'h-12 w-12',
        '2xl': 'h-16 w-16',
        '3xl': 'h-20 w-20',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends React.HtmlHTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  name?: string;
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size, src, alt, name, ...props }, ref) => {
    const initials = name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '';

    return (
      <AvatarPrimitive.Root
        className={cn(avatarVariants({ size, className }))}
        ref={ref}
        {...props}
      >
        <AvatarPrimitive.Image src={src} alt={alt || name || undefined} />
        <AvatarPrimitive.Fallback
          className="flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400"
          delayMs={30}
        >
          {initials || <span className="sr-only">User</span>}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar, avatarVariants };
