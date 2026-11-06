import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const variants = cva("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50", {
  variants: { variant: { default: "bg-brand text-white hover:bg-indigo-700", outline: "border border-slate-300 bg-white text-ink hover:bg-slate-50", ghost: "text-brand hover:bg-indigo-50" } },
  defaultVariants: { variant: "default" },
});
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof variants> { asChild?: boolean }
export const Button = React.forwardRef<HTMLButtonElement, Props>(({ asChild, className, variant, ...props }, ref) => {
  const Component = asChild ? Slot : "button";
  return <Component ref={ref} className={cn(variants({ variant }), className)} {...props} />;
});
Button.displayName = "Button";
