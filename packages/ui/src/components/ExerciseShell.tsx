import type { ReactNode } from "react";

import { cn } from "../lib/cn";
import { Badge } from "./Badge";

export type ExerciseShellProps = {
  eyebrow?: string;
  title: string;
  prompt: string;
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
};

export function ExerciseShell({
  aside,
  children,
  className,
  eyebrow,
  prompt,
  title
}: ExerciseShellProps) {
  return (
    <section className={cn("grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]", className)}>
      <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-[0_18px_50px_rgba(20,22,20,0.06)] sm:p-6">
        <div className="space-y-4">
          {eyebrow ? <Badge tone="teal">{eyebrow}</Badge> : null}
          <div>
            <h2 className="text-2xl font-semibold text-ink">{title}</h2>
            <p className="mt-3 text-base leading-7 text-ink/70">{prompt}</p>
          </div>
        </div>
        <div className="mt-6">{children}</div>
      </div>
      {aside ? (
        <aside className="rounded-lg border border-ink/10 bg-stone-50 p-5 text-sm leading-6 text-ink/70">
          {aside}
        </aside>
      ) : null}
    </section>
  );
}
