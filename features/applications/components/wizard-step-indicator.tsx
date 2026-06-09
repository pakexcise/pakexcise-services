import { cn } from "@/lib/utils";
import type { WizardStep } from "@/features/applications/types";

type WizardStepIndicatorProps = {
  currentStep: WizardStep;
  labels: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
};

const steps: Array<{ step: WizardStep; labelKey: keyof WizardStepIndicatorProps["labels"] }> =
  [
    { step: 1, labelKey: "step1" },
    { step: 2, labelKey: "step2" },
    { step: 3, labelKey: "step3" },
    { step: 4, labelKey: "step4" },
  ];

export function WizardStepIndicator({
  currentStep,
  labels,
}: WizardStepIndicatorProps) {
  return (
    <nav aria-label="Application progress" className="w-full">
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {steps.map(({ step, labelKey }) => {
          const isActive = step === currentStep;
          const isComplete = step < currentStep;

          return (
            <li
              key={step}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm transition-colors",
                isActive && "border-primary bg-primary/5 text-primary",
                isComplete && "border-primary/40 bg-muted/50",
                !isActive && !isComplete && "border-border text-muted-foreground",
              )}
            >
              <span className="block text-xs font-medium uppercase tracking-wide">
                {step}/4
              </span>
              <span className="mt-0.5 block font-medium leading-snug">
                {labels[labelKey]}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
