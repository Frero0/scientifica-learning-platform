import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn";

export type ProgressBarProps = HTMLAttributes<HTMLDivElement> & {
  value: number;
  label?: string;
};

export function ProgressBar({ className, label, value, ...props }: ProgressBarProps) {
  const boundedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label ? <div className="text-sm font-medium text-ink">{label}</div> : null}
      <div
        aria-label={label ?? "Progress"}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={boundedValue}
        className="h-2 overflow-hidden rounded-full bg-ink/10"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-teal-600 transition-[width] duration-500 ease-out"
          style={{ width: `${boundedValue}%` }}
        />
      </div>
    </div>
  );
}
