import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn";

type BadgeTone = "neutral" | "teal" | "amber" | "success";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  neutral: "border-ink/10 bg-ink/[0.04] text-ink/70",
  teal: "border-teal-700/15 bg-teal-50 text-teal-800",
  amber: "border-amber-700/15 bg-amber-50 text-amber-800",
  success: "border-emerald-700/15 bg-emerald-50 text-emerald-800"
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-semibold uppercase tracking-[0.08em]",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
