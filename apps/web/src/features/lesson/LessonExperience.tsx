import { PendulumDiagram } from "@/components/PendulumDiagram";
import { getLessonById, getUserProgress } from "@/lib/api";

import { InteractiveLesson } from "./InteractiveLesson";

type LessonExperienceProps = {
  lessonId: string;
};

export async function LessonExperience({ lessonId }: LessonExperienceProps) {
  const [lesson, progress] = await Promise.all([getLessonById(lessonId), getUserProgress("demo-user")]);
  const lessonProgress = progress.items.find((item) => item.lessonId === lesson.id);

  return (
    <section className="min-h-[calc(100svh-72px)] bg-paper px-5 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-700">{lesson.course.title}</p>
            <h1 className="mt-3 text-5xl font-semibold leading-tight text-ink">{lesson.title}</h1>
            <p className="mt-5 text-lg leading-8 text-ink/65">{lesson.summary}</p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <p className="text-sm font-medium text-ink/55">Core idea</p>
            <p className="mt-2 text-xl font-semibold leading-8 text-ink">{lesson.content.introduction}</p>
          </div>
        </div>

        <div className="space-y-6">
          <PendulumDiagram content={lesson.content} />
          <div className="grid gap-4 border-y border-ink/10 py-5 sm:grid-cols-3">
            {lesson.content.keyIdeas.map((idea) => (
              <p className="text-sm leading-6 text-ink/65" key={idea}>
                {idea}
              </p>
            ))}
          </div>
          <InteractiveLesson initialProgress={lessonProgress} lesson={lesson} />
        </div>
      </div>
    </section>
  );
}
