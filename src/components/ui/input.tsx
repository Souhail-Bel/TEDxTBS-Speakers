import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border border-border bg-[#140E0E]/90 px-3.5 text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-150 outline-none",
        "hover:border-[#462C2E] focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-20 w-full rounded-xl border border-border bg-[#140E0E]/90 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-150 outline-none resize-y",
        "hover:border-[#462C2E] focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-xs font-medium tracking-wide text-text-secondary", className)}
    {...props}
  />
));
Label.displayName = "Label";
