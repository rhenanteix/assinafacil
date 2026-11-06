import * as React from "react";
import { cn } from "@/lib/utils/cn";
export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) =>
  <input ref={ref} className={cn("min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand", className)} {...props} />);
Input.displayName = "Input";
