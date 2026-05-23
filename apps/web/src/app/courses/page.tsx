import { ArrowRight, BookOpen, Clock3 } from "lucide-react";
import Link from "next/link";

import { Badge, Button, Card } from "@scientifica/ui";

import { getCourses } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <section className="min-h-[calc(100svh-72px)] bg-paper px-5 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-teal-700">Course catalog</p>
          <h1 className="mt-3 text-5xl font-semibold leading-tight text-ink">Build scientific fluency by solving.</h1>
          <p className="mt-5 text-lg leading-8 text-ink/65">
            Start with the seeded foundation path. The structure is ready for more courses,
            simulations, and adaptive practice.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {courses.map((course) => (
            <Card className="p-6" key={course.id}>
              <div className="flex min-h-full flex-col">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone="teal">{course.level}</Badge>
                  <span className="inline-flex items-center gap-2 text-sm text-ink/55">
                    <Clock3 aria-hidden="true" className="h-4 w-4" />
                    {course.estimatedMinutes} min
                  </span>
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-ink">{course.title}</h2>
                <p className="mt-3 text-base leading-7 text-ink/65">{course.description}</p>
                <div className="mt-8 grid grid-cols-3 gap-3 border-y border-ink/10 py-5 text-sm">
                  <div>
                    <div className="font-semibold text-ink">{course.moduleCount}</div>
                    <div className="text-ink/55">Modules</div>
                  </div>
                  <div>
                    <div className="font-semibold text-ink">{course.lessonCount}</div>
                    <div className="text-ink/55">Lessons</div>
                  </div>
                  <div>
                    <div className="font-semibold text-ink">{course.exerciseCount}</div>
                    <div className="text-ink/55">Exercises</div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-ink/60">
                    <BookOpen aria-hidden="true" className="h-4 w-4" />
                    Progressive path
                  </span>
                  <Button asChild>
                    <Link href={`/courses/${course.slug}`}>
                      View course
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
