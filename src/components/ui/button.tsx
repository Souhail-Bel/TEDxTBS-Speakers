"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-[#FF1E32] to-[#E31B2B] text-white border border-[#FF4655]/35 shadow-[0_0_20px_-4px_rgba(227,27,43,0.55),0_1px_0_0_rgba(255,255,255,0.18)_inset] hover:from-[#FF2D3F] hover:to-[#EE1F30] hover:shadow-[0_0_26px_-2px_rgba(255,20,40,0.7)]",
        secondary:
          "bg-surface-2/90 text-text-primary border border-border hover:bg-surface-3 hover:border-[#4A2E30]",
        ghost:
          "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
        danger:
          "bg-gradient-to-b from-[#EF4444] to-[#DC2626] text-white border border-red-400/30 shadow-[0_0_18px_-4px_rgba(239,68,68,0.45)] hover:from-[#F87171] hover:to-[#EF4444]",
        outline:
          "border border-border bg-[#140E0E]/85 text-text-primary hover:bg-surface-2 hover:border-[#4A2E30]",
        link:
          "text-red-400 hover:text-red-300 underline-offset-4 hover:underline p-0 h-auto font-medium",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
