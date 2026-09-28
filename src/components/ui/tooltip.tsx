import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils/cn';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset ?? 4}
      className={cn(
        'z-[1500] overflow-hidden rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-50',
        'data-[state=delayed-open]:animate-in data-[state=closed]:fade-out-0',
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
