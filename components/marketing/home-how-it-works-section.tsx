import {
  CheckCircle2,
  ClipboardList,
  FileText,
} from "lucide-react";

import { HomeSectionShell } from "@/components/marketing/home-section-shell";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { cn } from "@/lib/utils";

type HomeHowItWorksStep = {
  title: string;
  description: string;
};

type HomeHowItWorksSectionProps = {
  title: string;
  description: string;
  steps: HomeHowItWorksStep[];
  tone?: "default" | "muted" | "accent";
  className?: string;
};

const STEP_ICONS = [ClipboardList, FileText, CheckCircle2] as const;

export function HomeHowItWorksSection({
  title,
  description,
  steps,
  tone = "default",
  className,
}: HomeHowItWorksSectionProps) {
  return (
    <HomeSectionShell tone={tone} className={className}>
      <div className="mx-auto max-w-3xl space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const StepIcon = STEP_ICONS[index - 1] ?? CheckCircle2;

          return (
            <div
              key={step.title}
              className={cn(
                "rounded-xl border border-border/70 bg-background/80 p-4",
                "transition-colors hover:border-primary/20",
              )}
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </span>
                {index === 0 ? (
                  <WhatsAppIcon className="size-4 text-primary" />
                ) : (
                  <StepIcon className="size-4 text-primary" aria-hidden="true" />
                )}
              </div>
              <h3 className="text-base font-semibold leading-snug">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </HomeSectionShell>
  );
}
