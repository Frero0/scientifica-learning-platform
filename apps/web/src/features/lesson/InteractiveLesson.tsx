"use client";

import { ArrowRight, CheckCircle2, Send } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { Button, ExerciseShell, FeedbackPanel, ProgressBar, Stepper } from "@scientifica/ui";

import type { LessonDetail, ProgressItem, PublicExercise, SubmitAttemptResult } from "@/lib/types";

import {
  getEmptyAnswer,
  getStoredAnswer,
  readStepAnswers,
  withExerciseAnswer,
  withStepAnswer,
  type AnswerState
} from "./answer-state";

type InteractiveLessonProps = {
  lesson: LessonDetail;
  initialProgress?: ProgressItem;
};

export function InteractiveLesson({ initialProgress, lesson }: InteractiveLessonProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>({});
  const [feedback, setFeedback] = useState<SubmitAttemptResult | null>(null);
  const [progress, setProgress] = useState(initialProgress?.percent ?? 0);
  const [isPending, startTransition] = useTransition();

  const currentExercise = lesson.exercises[currentIndex];
  const stepperItems = useMemo(
    () =>
      lesson.exercises.map((exercise) => ({
        id: exercise.id,
        title: `Exercise ${exercise.order}`,
        description: exercise.type.replaceAll("_", " ")
      })),
    [lesson.exercises]
  );

  if (!currentExercise) {
    return (
      <FeedbackPanel status="neutral" title="No exercises configured">
        Add exercises to this lesson in the content seed or authoring workflow.
      </FeedbackPanel>
    );
  }

  const selectedAnswer = getStoredAnswer(answerState, currentExercise);

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
            totalExercises: lesson.exercises.length,
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
    <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <ProgressBar label="Lesson progress" value={progress} />
        <Stepper className="mt-6" currentStep={currentIndex} steps={stepperItems} />
      </aside>

      <div className="space-y-5">
        <ExerciseShell
          aside={
            <div>
              <p className="font-semibold text-ink">Reasoning target</p>
              <p className="mt-2">
                Separate what the experiment shows from what a hypothesis claims. Submit an answer
                to receive evaluated feedback from the API.
              </p>
            </div>
          }
          eyebrow={currentExercise.type.replaceAll("_", " ")}
          prompt={currentExercise.prompt}
          title={`Exercise ${currentExercise.order}`}
        >
          <ExerciseInput
            answer={selectedAnswer}
            exercise={currentExercise}
            onChange={(answer) => {
              setAnswerState((current) => withExerciseAnswer(current, currentExercise.id, answer));
              setFeedback(null);
            }}
            onStepChange={(stepIndex, value) => {
              setAnswerState((current) =>
                withStepAnswer(current, currentExercise, stepIndex, value)
              );
              setFeedback(null);
            }}
          />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button disabled={isPending} onClick={submitAnswer}>
              <Send aria-hidden="true" className="h-4 w-4" />
              {isPending ? "Submitting" : "Submit answer"}
            </Button>
            <div className="flex gap-2">
              {lesson.exercises.map((exercise, index) => (
                <Button
                  aria-label={`Go to exercise ${exercise.order}`}
                  key={exercise.id}
                  onClick={() => goToExercise(index)}
                  size="icon"
                  variant={index === currentIndex ? "primary" : "secondary"}
                >
                  {exercise.order}
                </Button>
              ))}
            </div>
          </div>
        </ExerciseShell>

        {feedback ? (
          <FeedbackPanel
            status={feedback.correct ? "correct" : "incorrect"}
            title={feedback.correct ? "Correct" : "Try another pass"}
          >
            <p>{feedback.feedback}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-sm">
                <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                Score {feedback.score}
              </span>
              {currentIndex < lesson.exercises.length - 1 && feedback.correct ? (
                <Button
                  onClick={() => goToExercise(currentIndex + 1)}
                  size="sm"
                  variant="secondary"
                >
                  Next exercise
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </FeedbackPanel>
        ) : null}
      </div>
    </div>
  );
}

type ExerciseInputProps = {
  exercise: PublicExercise;
  answer: unknown;
  onChange: (answer: unknown) => void;
  onStepChange: (stepIndex: number, value: string) => void;
};

function ExerciseInput({ answer, exercise, onChange, onStepChange }: ExerciseInputProps) {
  if (exercise.type === "multiple_choice") {
    return (
      <div className="grid gap-3" role="radiogroup">
        {exercise.options?.map((option) => {
          const checked = answer === option.value;

          return (
            <button
              aria-checked={checked}
              className={`rounded-lg border p-4 text-left transition ${
                checked
                  ? "border-teal-700 bg-teal-50 text-teal-950"
                  : "border-ink/10 bg-white text-ink hover:border-ink/20"
              }`}
              key={option.id}
              onClick={() => onChange(option.value)}
              role="radio"
              type="button"
            >
              <span className="font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (exercise.type === "numeric_input") {
    return (
      <label className="block">
        <span className="text-sm font-medium text-ink/70">Numeric answer</span>
        <input
          className="mt-2 h-12 w-full rounded-lg border border-ink/10 bg-white px-4 text-ink outline-none transition focus:border-teal-700"
          inputMode="decimal"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter a value"
          value={typeof answer === "string" ? answer : ""}
        />
      </label>
    );
  }

  if (exercise.type === "step_by_step") {
    const stepAnswers = readStepAnswers(answer || getEmptyAnswer(exercise));

    return (
      <div className="grid gap-4">
        {exercise.steps?.map((step, index) => (
          <label className="block" key={step.id}>
            <span className="text-sm font-semibold text-ink">{step.title}</span>
            <span className="mt-1 block text-sm leading-6 text-ink/60">{step.prompt}</span>
            <input
              className="mt-2 h-12 w-full rounded-lg border border-ink/10 bg-white px-4 text-ink outline-none transition focus:border-teal-700"
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
      className="min-h-32 w-full rounded-lg border border-ink/10 bg-white p-4 text-ink outline-none transition focus:border-teal-700"
      onChange={(event) => onChange(event.target.value)}
      placeholder="Describe your answer"
      value={typeof answer === "string" ? answer : ""}
    />
  );
}
