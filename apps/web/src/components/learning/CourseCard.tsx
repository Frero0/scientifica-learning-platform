import { ArrowRight, Beaker, BookOpen, CheckCircle2, Clock3, FlaskConical } from "lucide-react";
import Link from "next/link";

import { Badge, Button, Card, ProgressBar } from "@scientifica/ui";

import type { CourseSummary, ProgressItem } from "@/lib/types";

type CourseCardProps = {
  course: CourseSummary;
  progress?: ProgressItem;
};

export function CourseCard({ course, progress }: CourseCardProps) {
  const percent = progress?.percent ?? 0;
  const status = progress?.status ?? "available";

  return (
    <Card className="group overflow-hidden bg-white/88 p-0 transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <div className="grid min-h-full lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="flex min-h-full flex-col p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="teal">{course.level}</Badge>
            <span className="inline-flex items-center gap-2 rounded-full bg-ink/[0.04] px-3 py-1.5 text-sm font-medium text-ink/60">
              <Clock3 aria-hidden="true" className="h-4 w-4" />
              {course.estimatedMinutes} min
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900">
              <FlaskConical aria-hidden="true" className="h-4 w-4" />
              {course.exerciseCount} labs
            </span>
          </div>

          <h2 className="mt-7 text-2xl font-semibold leading-tight text-ink">{course.title}</h2>
          <p className="mt-3 text-base leading-7 text-ink/64">{course.description}</p>

          <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-ink/10 bg-ink/10 text-sm">
            <Metric label="Modules" value={course.moduleCount} />
            <Metric label="Lessons" value={course.lessonCount} />
            <Metric label="Labs" value={course.exerciseCount} />
          </div>

          <ProgressBar
            className="mt-7"
            label={status === "completed" ? "Mastered" : "Path progress"}
            showValue
            value={percent}
          />

          <div className="mt-7 flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-ink/56">
              <BookOpen aria-hidden="true" className="h-4 w-4" />
              Next: start the lab path
            </span>
            <Button asChild>
              <Link href={`/courses/${course.slug}`}>
                Continue
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="border-t border-ink/10 bg-[linear-gradient(180deg,#f8fbf6,#eef3ea)] p-6 lg:border-l lg:border-t-0">
          <div className="relative mx-auto flex max-w-52 flex-col items-center gap-5 py-2">
            <div aria-hidden="true" className="absolute bottom-12 top-12 w-px bg-teal-700/18" />
            <MiniNode active done={percent > 0} label="Observe" />
            <MiniNode active={percent > 0} done={percent >= 50} label="Model" />
            <MiniNode active={percent >= 50} done={percent >= 100} label="Test" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white px-4 py-4">
      <div className="flex items-center gap-2 font-semibold text-ink">
        <Beaker aria-hidden="true" className="h-4 w-4 text-teal-700" />
        {value}
      </div>
      <div className="mt-1 text-ink/52">{label}</div>
    </div>
  );
}

function MiniNode({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="relative z-10 flex w-full items-center gap-3 rounded-xl border border-ink/10 bg-white px-3 py-3 shadow-soft">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
          done
            ? "border-emerald-700/20 bg-emerald-50 text-emerald-700"
            : active
              ? "border-teal-700/20 bg-teal-50 text-teal-800"
              : "border-ink/10 bg-ink/[0.03] text-ink/35"
        }`}
      >
        {done ? (
          <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
        ) : (
          <Beaker aria-hidden="true" className="h-5 w-5" />
        )}
      </span>
      <span className="text-sm font-semibold text-ink/72">{label}</span>
    </div>
  );
}
