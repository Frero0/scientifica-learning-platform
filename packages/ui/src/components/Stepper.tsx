import { cn } from "../lib/cn";

export type StepperStep = {
  id: string;
  title: string;
  description?: string;
};

export type StepperProps = {
  steps: StepperStep[];
  currentStep: number;
  className?: string;
};

export function Stepper({ className, currentStep, steps }: StepperProps) {
  return (
    <ol className={cn("space-y-4", className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;

        return (
          <li className="flex gap-3" key={step.id}>
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition",
                isComplete && "border-teal-700 bg-teal-700 text-white",
                isActive && "border-ink bg-ink text-white",
                !isComplete && !isActive && "border-ink/15 bg-white text-ink/55"
              )}
            >
              {index + 1}
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">{step.title}</span>
              {step.description ? (
                <span className="mt-1 block text-sm leading-5 text-ink/60">{step.description}</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
