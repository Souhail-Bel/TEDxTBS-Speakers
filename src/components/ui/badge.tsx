import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-surface-2 text-text-secondary border border-border",
        red: "bg-red-500/15 text-red-300 border border-red-500/30",
        accepted: "bg-status-accepted-bg text-status-accepted border border-status-accepted/30",
        noReply: "bg-status-no-reply-bg text-status-no-reply border border-status-no-reply/30",
        refused: "bg-status-refused-bg text-status-refused border border-status-refused/40",
        unclear: "bg-status-unclear-bg text-status-unclear border border-status-unclear/30",
        tag: "bg-surface-3 text-text-primary border border-border hover:border-red-500/40 transition-colors",
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
