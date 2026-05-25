import { Beaker, Clock3, FlaskConical, Layers3, Route } from "lucide-react";

import { Badge, Card, ProgressBar } from "@scientifica/ui";

import { ApiUnavailable } from "@/components/ApiUnavailable";
import { PageHeader } from "@/components/PageHeader";
import { PathNode } from "@/components/learning/PathNode";
import { getCourseBySlug, getCoursePath, isApiConnectionError } from "@/lib/api";

export const dynamic = "force-dynamic";

const demoUserId = "demo-user";

type CourseDetailPageProps = {
  params: {
    slug: string;
  };
};

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const course = await getCourseBySlug(params.slug)
    .then((courseDetail) => getCoursePath(courseDetail.id, { userId: demoUserId }))
    .catch((error: unknown) => {
      if (isApiConnectionError(error)) {
        return null;
      }

      throw error;
    });

  if (!course) {
    return <ApiUnavailable title="Course path is unavailable" />;
  }

  const lessonCount = course.levels.reduce((total, level) => total + level.lessons.length, 0);
  const exerciseCount = course.levels.reduce(
    (total, level) =>
      total +
      level.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.requiredExerciseCount, 0),
    0
  );
  const completedLessons = course.levels.reduce(
    (total, level) =>
      total + level.lessons.filter((lesson) => lesson.progress.status === "completed").length,
    0
  );

  return (
    <section className="min-h-[calc(100svh-72px)] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          description={course.description}
          eyebrow={course.difficulty}
          meta={
            <div className="flex flex-wrap gap-3 text-sm font-medium text-ink/64">
              <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-2 shadow-inset">
                <Clock3 aria-hidden="true" className="h-4 w-4 text-teal-700" />
                {course.estimatedMinutes} minutes
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-2 shadow-inset">
                <Layers3 aria-hidden="true" className="h-4 w-4 text-copper" />
                {lessonCount} lessons
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-2 shadow-inset">
                <FlaskConical aria-hidden="true" className="h-4 w-4 text-teal-700" />
                {exerciseCount} exercises
              </span>
            </div>
          }
          title={course.title}
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Card className="overflow-hidden bg-white/82 p-0 shadow-soft">
            <div className="grid min-h-full gap-6 p-6 sm:p-7 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
                  <Beaker aria-hidden="true" className="h-4 w-4" />
                  Notebook brief
                </p>
                <p className="mt-3 max-w-3xl text-2xl font-semibold leading-9 text-ink">
                  Observe first, model second, test always. Each lesson asks learners to act on the
                  idea before reading a final explanation.
                </p>
              </div>
              <div className="rounded-xl border border-ink/10 bg-cream p-4">
                <ProgressBar label="Course progress" showValue value={course.progress.percent} />
              </div>
            </div>
          </Card>

          <Card className="bg-white/82 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink/52">Journey state</p>
                <h2 className="mt-2 text-3xl font-semibold text-ink">
                  {completedLessons}/{lessonCount}
                </h2>
                <p className="mt-1 text-sm text-ink/58">lessons completed</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                <Route aria-hidden="true" className="h-6 w-6" />
              </span>
            </div>
          </Card>
        </div>

        <div className="mt-14 space-y-10">
          {course.levels.map((level) => (
            <section className="relative" key={level.id}>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Badge tone="amber">Module {level.order}</Badge>
                  <h2 className="mt-3 text-3xl font-semibold text-ink">{level.title}</h2>
                  <p className="mt-2 max-w-2xl text-base leading-7 text-ink/60">
                    {level.description}
                  </p>
                </div>
                <div className="w-full sm:w-56">
                  <ProgressBar showValue value={level.progress.percent} />
                </div>
              </div>
              <div className="relative grid gap-5">
                <div
                  aria-hidden="true"
                  className="absolute left-10 top-8 hidden h-[calc(100%-4rem)] w-px bg-teal-700/16 sm:block"
                />
                {level.lessons.map((lesson, index) => (
                  <PathNode index={index} key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
