import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-ink/10 bg-white shadow-[0_18px_50px_rgba(20,22,20,0.06)]",
        className
      )}
      {...props}
    />
  );
}
