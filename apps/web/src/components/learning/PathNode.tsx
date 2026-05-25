import { ArrowRight, Beaker, CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import Link from "next/link";

import { Badge, Button, Card, ProgressBar, cn } from "@scientifica/ui";

import type { CoursePathLessonDto } from "@/lib/api-contracts";

type PathNodeProps = {
  lesson: CoursePathLessonDto;
  index: number;
};

export function PathNode({ index, lesson }: PathNodeProps) {
  const status = lesson.progress.status;
  const locked = status === "locked";
  const Icon = status === "completed" ? CheckCircle2 : locked ? Lock : PlayCircle;

  return (
    <div className="relative grid gap-4 sm:grid-cols-[5rem_minmax(0,1fr)] sm:items-start">
      <div className="relative z-10 flex justify-center sm:pt-5">
        <div className="relative">
          <span
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full border-4 text-sm font-semibold shadow-soft",
              status === "completed" && "border-emerald-200 bg-emerald-50 text-emerald-800",
              status === "in_progress" && "border-teal-200 bg-white text-teal-800",
              status === "available" && "border-ink/10 bg-white text-ink",
              locked && "border-ink/10 bg-ink/[0.04] text-ink/38"
            )}
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">
            {index + 1}
          </span>
        </div>
      </div>

      <Card
        className={cn(
          "relative overflow-hidden p-5 transition duration-200",
          !locked && "hover:-translate-y-0.5 hover:shadow-lift",
          locked && "bg-white/58"
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={status === "completed" ? "success" : locked ? "neutral" : "teal"}>
              {status.replace("_", " ")}
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.08em] text-ink/45">
              <Circle aria-hidden="true" className="h-2.5 w-2.5 fill-current" />
              {lesson.durationMinutes} min / {lesson.requiredExerciseCount} exercises
            </span>
          </div>

          <h3 className={cn("mt-3 text-xl font-semibold text-ink", locked && "text-ink/55")}>
            {lesson.title}
          </h3>
          <p className={cn("mt-2 text-sm leading-6 text-ink/62", locked && "text-ink/45")}>
            {lesson.summary}
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                  <Beaker aria-hidden="true" className="h-3.5 w-3.5" />
                  Observe
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                  Model
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.04] px-3 py-1 text-xs font-semibold text-ink/60">
                  Test
                </span>
              </div>
              <ProgressBar showValue value={lesson.progress.percent} />
            </div>
            {locked ? (
              <Button disabled variant="secondary">
                Locked
              </Button>
            ) : (
              <Button asChild variant={status === "completed" ? "secondary" : "primary"}>
                <Link href={`/lessons/${lesson.id}`}>
                  {status === "completed" ? "Review" : "Start"}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
