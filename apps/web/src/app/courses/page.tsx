import { ArrowRight, Beaker, Compass, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button, EmptyState, ProgressBar } from "@scientifica/ui";

import { ApiUnavailable } from "@/components/ApiUnavailable";
import { PageHeader } from "@/components/PageHeader";
import { CourseCard } from "@/components/learning/CourseCard";
import { getCourses, getUserProgress, isApiConnectionError } from "@/lib/api";

export const dynamic = "force-dynamic";

const demoUserId = "demo-user";

export default async function CoursesPage() {
  const [courses, progress] = await Promise.all([
    getCourses().catch((error: unknown) => {
      if (isApiConnectionError(error)) {
        return null;
      }

      throw error;
    }),
    getUserProgress(demoUserId).catch(() => null)
  ]);

  if (!courses) {
    return <ApiUnavailable title="Courses are unavailable" />;
  }

  const progressByCourseId = new Map((progress?.items ?? []).map((item) => [item.courseId, item]));
  const activeProgress = progress?.items.find((item) => item.percent > 0 && item.percent < 100);
  const completedCourses =
    progress?.items.filter((item) => item.status === "completed").length ?? 0;

  return (
    <section className="min-h-[calc(100svh-72px)] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          action={
            <Button asChild size="lg" variant="secondary">
              <Link href="/lessons/demo">
                Try demo lesson
                <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </Link>
            </Button>
          }
          description="Start with the seeded foundation path. Courses are designed as visual, problem-first journeys with measurable progress."
          eyebrow="Course catalog"
          meta={
            <div className="flex flex-wrap gap-3 text-sm font-medium text-ink/64">
              <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-2 shadow-inset">
                <Compass aria-hidden="true" className="h-4 w-4 text-teal-700" />
                {courses.length} available path{courses.length === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-2 shadow-inset">
                <Sparkles aria-hidden="true" className="h-4 w-4 text-copper" />
                {completedCourses} completed
              </span>
            </div>
          }
          title="Build scientific fluency by solving."
        />

        <div className="mt-10 grid gap-5 rounded-2xl border border-teal-700/14 bg-white/76 p-5 shadow-soft lg:grid-cols-[minmax(0,1fr)_20rem] lg:p-7">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
              <Beaker aria-hidden="true" className="h-4 w-4" />
              Next experiment
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-ink">
              {activeProgress?.lessonTitle ?? "Observation, hypotheses, and evidence"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/62">
              The learning model keeps the next action visible: observe a phenomenon, answer,
              receive feedback, and continue the path.
            </p>
          </div>
          <div className="rounded-xl border border-ink/10 bg-cream p-4">
            <ProgressBar
              label={activeProgress ? "Active lesson" : "Demo progress"}
              showValue
              value={activeProgress?.percent ?? 0}
            />
          </div>
        </div>

        {courses.length > 0 ? (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {courses.map((course) => (
              <CourseCard
                course={course}
                key={course.id}
                progress={progressByCourseId.get(course.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-10"
            description="The catalog endpoint responded, but no courses are available yet. Add seeded courses from the API side to populate this learning home."
            title="No courses published"
          />
        )}
      </div>
    </section>
  );
}
