import { ArrowRight, Clock3 } from "lucide-react";
import Link from "next/link";

import { Badge, Button, LessonCard } from "@scientifica/ui";

import { getCourseBySlug } from "@/lib/api";

export const dynamic = "force-dynamic";

type CourseDetailPageProps = {
  params: {
    slug: string;
  };
};

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const course = await getCourseBySlug(params.slug);

  return (
    <section className="min-h-[calc(100svh-72px)] bg-paper px-5 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Badge tone="teal">{course.level}</Badge>
            <h1 className="mt-5 text-5xl font-semibold leading-tight text-ink">{course.title}</h1>
            <p className="mt-5 text-lg leading-8 text-ink/65">{course.description}</p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-ink/60">
              <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-2">
                <Clock3 aria-hidden="true" className="h-4 w-4" />
                {course.estimatedMinutes} minutes
              </span>
              <span className="rounded-full border border-ink/10 bg-white px-3 py-2">
                {course.lessonCount} lessons
              </span>
              <span className="rounded-full border border-ink/10 bg-white px-3 py-2">
                {course.exerciseCount} exercises
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-ink p-6 text-white shadow-soft">
            <p className="text-sm font-medium text-white/60">Path principle</p>
            <p className="mt-4 text-2xl font-semibold leading-9">
              Observe first, model second, test always. Each lesson asks learners to act on the idea
              before reading a final explanation.
            </p>
          </div>
        </div>

        <div className="mt-14 space-y-10">
          {course.modules.map((module) => (
            <section key={module.id}>
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase text-copper">
                    Module {module.order}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-ink">{module.title}</h2>
                  <p className="mt-2 max-w-2xl text-base leading-7 text-ink/60">
                    {module.description}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {module.lessons.map((lesson) => (
                  <LessonCard
                    action={
                      <Button asChild>
                        <Link href={`/lessons/${lesson.id}`}>
                          Start
                          <ArrowRight aria-hidden="true" className="h-4 w-4" />
                        </Link>
                      </Button>
                    }
                    key={lesson.id}
                    meta={`${lesson.durationMinutes} min / ${lesson.exerciseCount} exercises`}
                    summary={lesson.summary}
                    title={lesson.title}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
