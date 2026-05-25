import { Beaker, BookOpenCheck, Eye, Lightbulb } from "lucide-react";

import { PendulumDiagram } from "@/components/PendulumDiagram";
import { ApiUnavailable } from "@/components/ApiUnavailable";
import { PageHeader } from "@/components/PageHeader";
import { getLessonPlayer, isApiConnectionError } from "@/lib/api";
import type { LessonPlayerContentStepDto } from "@/lib/api-contracts";
import { Card, ProgressBar } from "@scientifica/ui";

import { InteractiveLesson } from "./InteractiveLesson";

type LessonExperienceProps = {
  lessonId: string;
};

const demoUserId = "demo-user";

export async function LessonExperience({ lessonId }: LessonExperienceProps) {
  const lesson = await getLessonPlayer(lessonId, { userId: demoUserId }).catch((error: unknown) => {
    if (isApiConnectionError(error)) {
      return null;
    }

    throw error;
  });

  if (!lesson) {
    return <ApiUnavailable title="Lesson player is unavailable" />;
  }

  const contentSteps = lesson.steps.filter(
    (step): step is LessonPlayerContentStepDto => step.type === "content"
  );
  const introStep = contentSteps.find((step) => step.content.kind === "intro") ?? contentSteps[0];
  const visualStep = contentSteps.find((step) => step.content.visual);
  const keyIdeas = contentSteps.flatMap((step) => step.content.keyIdeas ?? []);
  const visualContent = {
    visualExplanation: visualStep?.content.visual ?? {
      title: "No visualization configured",
      description: "Add lesson visual content in the API seed or authoring workflow.",
      variables: []
    }
  };

  return (
    <section className="min-h-[calc(100svh-72px)] px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          description={lesson.summary}
          eyebrow={lesson.course.title}
          meta={
            <div className="w-full max-w-sm rounded-xl border border-ink/10 bg-white p-4 shadow-inset">
              <ProgressBar
                label={lesson.progress.completed ? "Lesson completed" : "Lesson progress"}
                showValue
                value={lesson.progress.percent}
              />
            </div>
          }
          title={lesson.title}
        />

        <div className="mt-9 space-y-6">
          <LearningFlow />
          <PendulumDiagram content={visualContent} />
          <Card className="bg-cream p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
              <div>
                <p className="text-sm font-semibold text-teal-800">Lab question</p>
                <p className="mt-2 text-sm leading-6 text-ink/58">
                  What can we claim from the motion we observe, and what still needs evidence?
                </p>
              </div>
              <p className="text-xl font-semibold leading-8 text-ink">
                {introStep?.content.body ?? lesson.summary}
              </p>
            </div>
          </Card>
          {keyIdeas.length > 0 ? (
            <div className="grid gap-px overflow-hidden rounded-xl border border-ink/10 bg-ink/10 sm:grid-cols-3">
              {keyIdeas.map((idea) => (
                <p className="bg-white/82 p-4 text-sm leading-6 text-ink/65" key={idea}>
                  {idea}
                </p>
              ))}
            </div>
          ) : null}
          <InteractiveLesson lesson={lesson} />
        </div>
      </div>
    </section>
  );
}

function LearningFlow() {
  const phases = [
    { label: "Observe", body: "Read the system before explaining it.", icon: Eye },
    { label: "Model", body: "Name the variables that matter.", icon: Beaker },
    { label: "Predict/Test", body: "Commit to an answer and check it.", icon: Lightbulb },
    { label: "Explain", body: "Turn feedback into a rule you can reuse.", icon: BookOpenCheck }
  ];

  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 md:grid-cols-4">
      {phases.map((phase, index) => {
        const Icon = phase.icon;

        return (
          <div className="bg-white/82 p-4" key={phase.label}>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-800">
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/42">
                  Step {index + 1}
                </p>
                <p className="font-semibold text-ink">{phase.label}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/58">{phase.body}</p>
          </div>
        );
      })}
    </div>
  );
}
