"use client";

import { Atom, BookOpen, FlaskConical, Home, Route, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@scientifica/ui";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/lessons/demo", label: "Demo", icon: FlaskConical }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLesson = pathname.startsWith("/lessons");

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf6_0%,#f7f7ef_36rem,#f3f5ee_100%)] text-ink">
      <header className="sticky top-0 z-40 bg-cream/72 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link className="flex min-w-0 items-center gap-2.5 font-semibold text-ink" href="/">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink/10 bg-white text-teal-800 shadow-inset">
              <Atom aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="hidden truncate text-base sm:block">Scientifica</span>
          </Link>

          <nav
            aria-label="Primary"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center rounded-full border border-ink/10 bg-white/76 p-1 text-sm font-medium text-ink/62 shadow-[0_10px_35px_rgba(20,22,20,0.08)] md:flex"
          >
            {navItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  className={cn(
                    "rounded-full px-4 py-1.5 transition hover:bg-ink/5 hover:text-ink",
                    isActive && "bg-teal-50 text-teal-900 shadow-inset hover:bg-teal-50"
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-ink/10 bg-white/76 px-3 py-1.5 text-sm font-semibold text-ink/70 shadow-inset sm:flex">
              <Sparkles aria-hidden="true" className="h-4 w-4 text-copper" />1 XP
            </div>
            <Link
              className="inline-flex h-9 items-center gap-2 rounded-full border border-teal-700/15 bg-teal-50 px-3 text-sm font-semibold text-teal-900 transition hover:bg-teal-100"
              href="/courses"
            >
              <BookOpen aria-hidden="true" className="h-4 w-4" />
              Learn
            </Link>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100svh-56px)] lg:grid-cols-[4.25rem_minmax(0,1fr)]">
        <aside className="sticky top-14 hidden h-[calc(100svh-56px)] px-2 py-5 lg:block">
          <nav
            aria-label="Workspace"
            className="flex h-full flex-col items-center gap-2 rounded-full border border-ink/10 bg-white/60 py-3 shadow-inset backdrop-blur-xl"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  aria-label={item.label}
                  className={cn(
                    "group flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-ink/42 transition hover:border-ink/10 hover:bg-white hover:text-ink",
                    isActive && "border-teal-700/15 bg-teal-50 text-teal-800 shadow-inset"
                  )}
                  href={item.href}
                  key={item.href}
                  title={item.label}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </Link>
              );
            })}
            <div className="my-2 h-px w-7 bg-ink/10" />
            <span
              aria-label="Learning path energy"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-700/15 bg-amber-50 text-copper"
              title="Learning path energy"
            >
              <Route aria-hidden="true" className="h-5 w-5" />
            </span>
          </nav>
        </aside>

        <main className={cn("min-w-0 pb-20 lg:pb-0", isLesson && "bg-white")}>{children}</main>
      </div>

      <nav
        aria-label="Mobile workspace"
        className="fixed inset-x-4 bottom-4 z-40 grid grid-cols-3 rounded-2xl border border-ink/10 bg-white/92 p-1 shadow-lift backdrop-blur-xl lg:hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              className={cn(
                "flex h-12 items-center justify-center rounded-xl text-ink/58 transition hover:bg-ink/5 hover:text-ink",
                isActive && "bg-ink text-white hover:bg-ink hover:text-white"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
