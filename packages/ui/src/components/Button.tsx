import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-white shadow-[0_14px_30px_rgba(20,22,20,0.16)] hover:bg-black focus-visible:outline-ink",
  secondary:
    "border border-ink/10 bg-white text-ink hover:border-ink/20 hover:bg-stone-50 focus-visible:outline-ink",
  ghost: "text-ink hover:bg-ink/5 focus-visible:outline-ink",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-700"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-2 px-3 text-sm",
  md: "h-11 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-5 text-base",
  icon: "h-10 w-10 p-0"
};

export function Button({
  asChild = false,
  className,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        sizes[size],
        className
      )}
      type={asChild ? undefined : type}
      {...props}
    />
  );
}
