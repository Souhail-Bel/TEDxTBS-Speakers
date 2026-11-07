"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils/cn";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export function PopoverContent({
  className,
  align = "start",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-xl border border-[#3B2527] bg-[#191112]/95 backdrop-blur-md p-3 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.85)] outline-none data-[state=open]:animate-scale-in",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
