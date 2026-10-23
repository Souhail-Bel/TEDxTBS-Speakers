"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils/cn";

export function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border",
        className
      )}
      {...props}
    />
  );
}

export function AvatarImage(props: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image className="aspect-square h-full w-full object-cover" {...props} />;
}

export function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex h-full w-full items-center justify-center bg-surface-3 text-xs font-medium text-text-secondary",
        className
      )}
      {...props}
    />
  );
}

/** Deterministic initials-based avatar, used wherever we don't have a photo (team members, comment authors). */
export function InitialsAvatar({
  name,
  className,
  size = "sm",
}: {
  name: string;
  className?: string;
  size?: "xs" | "sm" | "md";
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Deterministic hue from the name so the same person always gets the same color.
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;

  const sizeClasses = {
    xs: "h-5 w-5 text-[9px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
  }[size];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-1 ring-black/20",
        sizeClasses,
        className
      )}
      style={{ backgroundColor: `hsl(${hue} 45% 32%)` }}
      title={name}
    >
      {initials || "?"}
    </div>
  );
}
