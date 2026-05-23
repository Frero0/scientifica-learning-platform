import { BookOpen, FlaskConical } from "lucide-react";
import Link from "next/link";

import { Button } from "@scientifica/ui";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3 font-semibold text-ink" href="/">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-white">
            <FlaskConical aria-hidden="true" className="h-5 w-5" />
          </span>
          <span>Scientifica</span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm font-medium text-ink/70 sm:flex">
          <Link className="transition hover:text-ink" href="/courses">
            Courses
          </Link>
          <Link className="transition hover:text-ink" href="/lessons/demo">
            Demo lesson
          </Link>
        </nav>
        <Button asChild size="sm" variant="secondary">
          <Link href="/courses">
            <BookOpen aria-hidden="true" className="h-4 w-4" />
            Learn
          </Link>
        </Button>
      </div>
    </header>
  );
}
