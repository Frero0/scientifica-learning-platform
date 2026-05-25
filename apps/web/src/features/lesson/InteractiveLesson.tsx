"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Send,
  XCircle
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { Badge, Button, FeedbackPanel, ProgressBar, Stepper, cn } from "@scientifica/ui";

import type {
  LessonPlayerDto,
  LessonPlayerExerciseDto,
  LessonPlayerInteractiveDto,
  LessonPlayerQuizDto,
  LessonPlayerStepDto
} from "@/lib/api-contracts";
import type { SubmitAttemptResult } from "@/lib/types";

import {
  getEmptyAnswer,
  getStoredAnswer,
  readStepAnswers,
  withExerciseAnswer,
  withStepAnswer,
  type AnswerState
} from "./answer-state";

type InteractiveLessonProps = {
  lesson: LessonPlayerDto;
};

type LessonPlayerActivityStep = Extract<
  LessonPlayerStepDto,
  { type: "quiz" | "exercise" | "interactive" }
>;

type LessonPlayerActivity =
  | LessonPlayerQuizDto
  | LessonPlayerExerciseDto
  | LessonPlayerInteractiveDto;

export function InteractiveLesson({ lesson }: InteractiveLessonProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>({});
  const [feedback, setFeedback] = useState<SubmitAttemptResult | null>(null);
  const [progress, setProgress] = useState(lesson.progress.percent);
  const [isPending, startTransition] = useTransition();

  const activitySteps = useMemo(() => lesson.steps.filter(isActivityStep), [lesson.steps]);
  const currentStep = activitySteps[currentIndex];
  const currentExercise = currentStep ? getStepActivity(currentStep) : undefined;
  const stepperItems = useMemo(
    () =>
      activitySteps.map((step, index) => ({
        id: step.id,
        title: step.title ?? `Exercise ${index + 1}`,
        description: getStepActivity(step).exerciseType.replaceAll("_", " ")
      })),
    [activitySteps]
  );

  if (!currentExercise) {
    return (
      <FeedbackPanel status="neutral" title="No exercises configured">
        Add exercises to this lesson in the content seed or authoring workflow.
      </FeedbackPanel>
    );
  }

  const selectedAnswer = getStoredAnswer(answerState, currentExercise);
  const canGoBack = currentIndex > 0;
  const canGoNext = currentIndex < activitySteps.length - 1;
  const hasAnswer = hasSubmittedAnswer(selectedAnswer, currentExercise);

  function submitAnswer() {
    const exercise = currentExercise!;

    startTransition(async () => {
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          exerciseId: exercise.id,
          userId: "demo-user",
          answer: selectedAnswer
        })
      });

      if (!response.ok) {
        setFeedback({
          attemptId: "failed",
          correct: false,
          score: 0,
          feedback: "The answer could not be submitted. Check that the API is running.",
          progress: {
            id: "local",
            userId: "demo-user",
            courseId: lesson.course.id,
            courseSlug: lesson.course.slug,
            courseTitle: lesson.course.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            completedExercises: 0,
            totalExercises: activitySteps.length,
            percent: progress,
            status: "in_progress",
            updatedAt: new Date().toISOString()
          }
        });
        return;
      }

      const result = (await response.json()) as SubmitAttemptResult;
      setFeedback(result);
      setProgress(result.progress.percent);
    });
  }

  function goToExercise(index: number) {
    setCurrentIndex(index);
    setFeedback(null);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[16rem_minmax(0,1fr)_16rem] xl:items-start">
      <aside className="rounded-xl border border-ink/10 bg-white/88 p-5 shadow-soft lg:sticky lg:top-24">
        <div className="flex items-center justify-between gap-3">
          <Badge tone="teal">Practice</Badge>
          <span className="text-sm font-medium tabular-nums text-ink/55">
            {currentIndex + 1}/{activitySteps.length}
          </span>
        </div>
        <ProgressBar className="mt-5" label="Lesson progress" showValue value={progress} />
        <Stepper className="mt-6" currentStep={currentIndex} steps={stepperItems} />
      </aside>

      <div className="space-y-5 xl:col-span-1">
        <section className="animate-soft-enter overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
          <div className="border-b border-ink/10 bg-cream p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="teal">{currentExercise.exerciseType.replaceAll("_", " ")}</Badge>
              <span className="rounded-full bg-ink/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-ink/45">
                Predict / test
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-ink">
              {currentStep?.title ?? `Exercise ${currentIndex + 1}`}
            </h2>
            <p className="mt-3 text-lg leading-8 text-ink/72">{currentExercise.prompt}</p>
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink/58">
              <Lightbulb aria-hidden="true" className="h-4 w-4 text-copper" />
              Choose the claim supported by the observation.
            </div>
            <ExerciseInput
              answer={selectedAnswer}
              exercise={currentExercise}
              feedback={feedback}
              onChange={(answer) => {
                setAnswerState((current) =>
                  withExerciseAnswer(current, currentExercise.id, answer)
                );
                setFeedback(null);
              }}
              onStepChange={(stepIndex, value) => {
                setAnswerState((current) =>
                  withStepAnswer(current, currentExercise, stepIndex, value)
                );
                setFeedback(null);
              }}
            />

            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-ink/10 bg-cream p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">Ready to check?</p>
                <p className="mt-1 text-sm text-ink/58">
                  {hasAnswer
                    ? "Submit once you can explain why this answer follows from the model."
                    : "Select or enter an answer to activate feedback."}
                </p>
              </div>
              <Button disabled={isPending || !hasAnswer} onClick={submitAnswer} size="lg">
                <Send aria-hidden="true" className="h-4 w-4" />
                {isPending ? "Checking" : "Check answer"}
              </Button>
            </div>
          </div>
        </section>

        {feedback ? (
          <FeedbackCard
            canGoNext={canGoNext}
            exercise={currentExercise}
            feedback={feedback}
            onNext={() => goToExercise(currentIndex + 1)}
          />
        ) : null}

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white/78 p-3 shadow-inset">
          <Button
            disabled={!canGoBack}
            onClick={() => goToExercise(currentIndex - 1)}
            variant="ghost"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Previous
          </Button>
          <div className="hidden flex-wrap justify-center gap-2 sm:flex">
            {activitySteps.map((step, index) => (
              <button
                aria-label={`Go to exercise ${index + 1}`}
                className={cn(
                  "h-2.5 w-8 rounded-full bg-ink/12 transition hover:bg-ink/24",
                  index === currentIndex && "bg-teal-600"
                )}
                key={step.id}
                onClick={() => goToExercise(index)}
                type="button"
              />
            ))}
          </div>
          <Button
            disabled={!canGoNext}
            onClick={() => goToExercise(currentIndex + 1)}
            variant="ghost"
          >
            Next
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <aside className="rounded-2xl border border-ink/10 bg-cream p-5 shadow-inset xl:sticky xl:top-24">
        <p className="font-semibold text-ink">Reasoning target</p>
        <p className="mt-2 text-sm leading-6 text-ink/62">
          Separate what the experiment shows from what a hypothesis claims. Feedback appears after
          checking the answer.
        </p>
        <div className="mt-5 grid gap-2 text-sm">
          <ReasoningStep active label="Observe" />
          <ReasoningStep active={hasAnswer} label="Commit" />
          <ReasoningStep active={Boolean(feedback)} label="Explain" />
        </div>
      </aside>
    </div>
  );
}

type ExerciseInputProps = {
  exercise: LessonPlayerActivity;
  answer: unknown;
  feedback: SubmitAttemptResult | null;
  onChange: (answer: unknown) => void;
  onStepChange: (stepIndex: number, value: string) => void;
};

function ExerciseInput({ answer, exercise, feedback, onChange, onStepChange }: ExerciseInputProps) {
  if (exercise.exerciseType === "multiple_choice") {
    return (
      <div className="grid gap-3" role="radiogroup">
        {exercise.options?.map((option) => {
          const checked = answer === option.value;
          const expected = isExpectedAnswer(feedback?.expectedAnswer, option.value);
          const answeredIncorrectly = Boolean(feedback && checked && !feedback.correct);
          const answeredCorrectly = Boolean(feedback && checked && feedback.correct);

          return (
            <button
              aria-checked={checked}
              className={cn(
                "flex min-h-14 items-center justify-between gap-4 rounded-xl border p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700",
                !checked &&
                  !expected &&
                  "border-ink/10 bg-white text-ink hover:-translate-y-0.5 hover:border-ink/20",
                checked && !feedback && "border-teal-700 bg-teal-50 text-teal-950",
                answeredCorrectly && "border-emerald-600 bg-emerald-50 text-emerald-950",
                answeredIncorrectly && "border-amber-600 bg-amber-50 text-amber-950",
                feedback && expected && !checked && "border-emerald-600/40 bg-emerald-50/60"
              )}
              key={option.id}
              onClick={() => onChange(option.value)}
              role="radio"
              type="button"
            >
              <span className="font-medium">{option.label}</span>
              {answeredCorrectly || expected ? (
                <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-700" />
              ) : null}
              {answeredIncorrectly ? (
                <XCircle aria-hidden="true" className="h-5 w-5 shrink-0 text-amber-700" />
              ) : null}
            </button>
          );
        })}
      </div>
    );
  }

  if (exercise.exerciseType === "numeric_input") {
    return (
      <label className="block">
        <span className="text-sm font-medium text-ink/70">Numeric answer</span>
        <input
          className="mt-2 h-12 w-full rounded-xl border border-ink/10 bg-white px-4 text-ink outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
          inputMode="decimal"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter a value"
          value={typeof answer === "string" ? answer : ""}
        />
      </label>
    );
  }

  if (exercise.exerciseType === "step_by_step") {
    const stepAnswers = readStepAnswers(answer || getEmptyAnswer(exercise));

    return (
      <div className="grid gap-4">
        {exercise.steps?.map((step, index) => (
          <label className="block" key={step.id}>
            <span className="text-sm font-semibold text-ink">{step.title}</span>
            <span className="mt-1 block text-sm leading-6 text-ink/60">{step.prompt}</span>
            <input
              className="mt-2 h-12 w-full rounded-xl border border-ink/10 bg-white px-4 text-ink outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
              onChange={(event) => onStepChange(index, event.target.value)}
              value={stepAnswers[index] ?? ""}
            />
          </label>
        ))}
      </div>
    );
  }

  return (
    <textarea
      className="min-h-32 w-full rounded-xl border border-ink/10 bg-white p-4 text-ink outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
      onChange={(event) => onChange(event.target.value)}
      placeholder="Describe your answer"
      value={typeof answer === "string" ? answer : ""}
    />
  );
}

function FeedbackCard({
  canGoNext,
  exercise,
  feedback,
  onNext
}: {
  canGoNext: boolean;
  exercise: LessonPlayerActivity;
  feedback: SubmitAttemptResult;
  onNext: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-soft",
        feedback.correct
          ? "border-emerald-700/20 bg-emerald-50 text-emerald-950"
          : "border-amber-700/20 bg-amber-50 text-amber-950"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70">
              {feedback.correct ? (
                <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-emerald-700" />
              ) : (
                <HelpCircle aria-hidden="true" className="h-5 w-5 text-amber-700" />
              )}
            </span>
            <div>
              <h3 className="text-lg font-semibold">
                {feedback.correct
                  ? "Correct. Lock in the idea."
                  : "Not quite. Re-read the evidence."}
              </h3>
              <p className="mt-1 text-sm opacity-75">Score {feedback.score} / +10 XP</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 opacity-85">{feedback.feedback}</p>
          {exercise.explanation && exercise.explanation !== feedback.feedback ? (
            <div className="mt-4 rounded-xl border border-white/60 bg-white/55 p-4">
              <p className="text-sm font-semibold">Why?</p>
              <p className="mt-2 text-sm leading-6 opacity-80">{exercise.explanation}</p>
            </div>
          ) : null}
        </div>
        {feedback.correct && canGoNext ? (
          <Button onClick={onNext}>
            Continue
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ReasoningStep({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-ink/42", active && "text-teal-800")}>
      <span className={cn("h-2.5 w-2.5 rounded-full bg-ink/18", active && "bg-teal-600")} />
      <span className="font-medium">{label}</span>
    </div>
  );
}

function hasSubmittedAnswer(answer: unknown, exercise: LessonPlayerActivity): boolean {
  if (exercise.exerciseType === "step_by_step") {
    return readStepAnswers(answer || getEmptyAnswer(exercise)).some(
      (value) => value.trim().length > 0
    );
  }

  return typeof answer === "string"
    ? answer.trim().length > 0
    : answer !== undefined && answer !== null;
}

function isExpectedAnswer(expectedAnswer: unknown, value: string): boolean {
  if (Array.isArray(expectedAnswer)) {
    return expectedAnswer.includes(value);
  }

  return expectedAnswer === value;
}

function isActivityStep(step: LessonPlayerStepDto): step is LessonPlayerActivityStep {
  return step.type === "quiz" || step.type === "exercise" || step.type === "interactive";
}

function getStepActivity(step: LessonPlayerActivityStep): LessonPlayerActivity {
  if (step.type === "quiz") {
    return step.quiz;
  }

  if (step.type === "interactive") {
    return step.interactive;
  }

  return step.exercise;
}
