import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ action, className, description, title }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-ink/15 bg-white/70 p-8 text-center shadow-[0_18px_50px_rgba(20,22,20,0.05)]",
        className
      )}
    >
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-ink/60">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
