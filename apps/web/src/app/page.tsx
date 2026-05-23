import { ArrowRight, CheckCircle2, FlaskConical, Route, Trophy } from "lucide-react";
import Link from "next/link";

import { Badge, Button } from "@scientifica/ui";

import { ScientificField } from "@/components/ScientificField";

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[calc(100svh-72px)] overflow-hidden bg-ink text-white">
        <ScientificField />
        <div className="relative mx-auto flex min-h-[calc(100svh-72px)] max-w-7xl items-center px-5 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl animate-rise-in">
            <Badge className="border-white/15 bg-white/10 text-white" tone="neutral">
              Interactive scientific learning
            </Badge>
            <h1 className="mt-8 text-6xl font-semibold leading-[0.96] sm:text-7xl lg:text-8xl">
              Scientifica
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-white/72 sm:text-2xl sm:leading-9">
              A premium learning platform for visual explanations, dynamic exercises, and
              progressive scientific problem solving.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-white text-ink hover:bg-white/90" size="lg">
                <Link href="/courses">
                  Explore courses
                  <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild className="border-white/20 bg-white/5 text-white hover:bg-white/10" size="lg" variant="secondary">
                <Link href="/lessons/demo">
                  Try the demo
                  <FlaskConical aria-hidden="true" className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-700">Learning paths</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Every concept moves from intuition to proof.
            </h2>
          </div>
          <div className="grid gap-0 divide-y divide-ink/10 border-y border-ink/10">
            {[
              {
                icon: Route,
                title: "Progressive paths",
                body: "Courses are organized into modules, lessons, and exercises that build measurable fluency."
              },
              {
                icon: CheckCircle2,
                title: "Problem-first learning",
                body: "Learners answer, receive feedback, and refine their model of the concept."
              },
              {
                icon: Trophy,
                title: "Intelligent gamification",
                body: "Progress and achievements reward mastery signals rather than distracting streak mechanics."
              }
            ].map((item) => (
              <div className="grid gap-4 py-7 sm:grid-cols-[2.5rem_minmax(0,1fr)]" key={item.title}>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-teal-700 shadow-soft">
                  <item.icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 max-w-2xl text-base leading-7 text-ink/65">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="rounded-lg border border-ink/10 bg-paper p-4 shadow-soft">
            <div className="rounded-lg bg-ink p-5 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/55">Demo lesson</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/70">12 min</span>
              </div>
              <div className="mt-10 space-y-4">
                <div className="h-3 w-24 rounded-full bg-teal-300" />
                <div className="h-4 w-4/5 rounded-full bg-white/85" />
                <div className="h-4 w-2/3 rounded-full bg-white/45" />
              </div>
              <div className="mt-10 grid grid-cols-3 gap-3">
                <div className="h-24 rounded-lg bg-white/10" />
                <div className="h-24 rounded-lg bg-copper/50" />
                <div className="h-24 rounded-lg bg-teal-500/60" />
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase text-copper">Interactive lesson engine</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Visual explanation and assessment live in one flow.
            </h2>
            <p className="mt-5 text-lg leading-8 text-ink/65">
              The demo lesson connects a pendulum visualization with answer submission, feedback,
              progress updates, and achievement unlocks through the API.
            </p>
            <Button asChild className="mt-8" size="lg">
              <Link href="/lessons/demo">
                Open lesson
                <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
