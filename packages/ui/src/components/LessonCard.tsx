import type { ReactNode } from "react";

import { cn } from "../lib/cn";
import { Card } from "./Card";
import { ProgressBar } from "./ProgressBar";

export type LessonCardProps = {
  title: string;
  summary: string;
  meta?: string;
  progress?: number;
  action?: ReactNode;
  className?: string;
};

export function LessonCard({ action, className, meta, progress, summary, title }: LessonCardProps) {
  return (
    <Card className={cn("p-5 transition duration-200 hover:-translate-y-0.5", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          {meta ? <p className="text-xs font-semibold uppercase text-ink/45">{meta}</p> : null}
          <div>
            <h3 className="text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/65">{summary}</p>
          </div>
          {progress !== undefined ? <ProgressBar value={progress} /> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </Card>
  );
}
