import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn";

export type FeedbackPanelProps = HTMLAttributes<HTMLDivElement> & {
  status: "correct" | "incorrect" | "neutral";
  title: string;
};

const statusStyles: Record<FeedbackPanelProps["status"], string> = {
  correct: "border-emerald-700/20 bg-emerald-50 text-emerald-950",
  incorrect: "border-amber-700/20 bg-amber-50 text-amber-950",
  neutral: "border-ink/10 bg-stone-50 text-ink"
};

export function FeedbackPanel({
  children,
  className,
  status,
  title,
  ...props
}: FeedbackPanelProps) {
  return (
    <div className={cn("rounded-xl border p-5", statusStyles[status], className)} {...props}>
      <h3 className="font-semibold">{title}</h3>
      {children ? <div className="mt-2 text-sm leading-6 opacity-80">{children}</div> : null}
    </div>
  );
}
