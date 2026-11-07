import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#221818] text-text-secondary border border-[#382626]",
        red: "bg-red-500/15 text-[#FF6B78] border border-red-500/35",
        accepted: "bg-status-accepted-bg text-status-accepted border border-status-accepted/30",
        noReply: "bg-[#221D1D] text-[#A8A2A2] border border-[#362C2C]",
        refused: "bg-status-refused-bg text-status-refused border border-status-refused/35",
        unclear: "bg-status-unclear-bg text-status-unclear border border-status-unclear/35",
        tag: "bg-surface-3 text-text-primary border border-border hover:border-red-500/40",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />}
      {children}
    </span>
  );
}
