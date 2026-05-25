import type { ReactNode } from "react";

import { Badge } from "@scientifica/ui";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  meta?: ReactNode;
};

export function PageHeader({ action, description, eyebrow, meta, title }: PageHeaderProps) {
  return (
    <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="max-w-3xl">
        <Badge tone="teal">{eyebrow}</Badge>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description ? <p className="mt-5 text-lg leading-8 text-ink/64">{description}</p> : null}
        {meta ? <div className="mt-6">{meta}</div> : null}
      </div>
      {action ? <div className="lg:pb-2">{action}</div> : null}
    </header>
  );
}
