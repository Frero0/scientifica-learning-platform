import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn";

export type ProgressBarProps = HTMLAttributes<HTMLDivElement> & {
  value: number;
  label?: string;
  showValue?: boolean;
};

export function ProgressBar({
  className,
  label,
  showValue = false,
  value,
  ...props
}: ProgressBarProps) {
  const boundedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label || showValue ? (
        <div className="flex items-center justify-between gap-3 text-sm font-medium text-ink">
          {label ? <span>{label}</span> : <span>Progress</span>}
          {showValue ? <span className="tabular-nums text-ink/55">{boundedValue}%</span> : null}
        </div>
      ) : null}
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
