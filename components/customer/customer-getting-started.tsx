import { ArrowRight, FileSearch, FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Route } from "next";
import Link from "next/link";

type CustomerGettingStartedProps = {
  title: string;
  description: string;
  cta: string;
  ctaHref: string;
  steps: Array<{
    title: string;
    description: string;
  }>;
};

const stepIcons = [FileText, Upload, FileSearch] as const;

export function CustomerGettingStarted({
  title,
  description,
  cta,
  ctaHref,
  steps,
}: CustomerGettingStartedProps) {
  return (
    <div className="px-5 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FileText className="size-8" aria-hidden="true" />
        </div>
        <h3 className="mt-5 text-xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          {description}
        </p>
      </div>

      <ol className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = stepIcons[index] ?? FileText;

          return (
            <li
              key={step.title}
              className="rounded-xl border bg-background/80 p-4 text-start shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <Icon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-4 font-medium">{step.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {step.description}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex justify-center">
        <Button asChild size="lg">
          <Link href={ctaHref as Route}>
            {cta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
