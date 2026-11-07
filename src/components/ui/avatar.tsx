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

/** Deterministic initials-based avatar, or photo avatar when `src` is provided. */
export function InitialsAvatar({
  name,
  src,
  className,
  size = "sm",
}: {
  name: string;
  src?: string | null;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-xs",
    lg: "h-14 w-14 text-base",
  }[size];

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        title={name}
        className={cn(
          "shrink-0 rounded-full object-cover ring-1 ring-white/15",
          sizeClasses,
          className
        )}
      />
    );
  }

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

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold tracking-wide text-white ring-1 ring-white/12 shadow-sm",
        sizeClasses,
        className
      )}
      style={{ backgroundColor: `hsl(${hue} 52% 36%)` }}
      title={name}
    >
      {initials || "?"}
    </div>
  );
}
