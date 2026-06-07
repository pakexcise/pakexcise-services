import { CheckCircle2, FileText, Search } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type HowItWorksStep = {
  title: string;
  description: string;
};

type HowItWorksProps = {
  title: string;
  steps: HowItWorksStep[];
};

const stepIcons = [Search, FileText, CheckCircle2] as const;

export function HowItWorks({ title, steps }: HowItWorksProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = stepIcons[index] ?? CheckCircle2;

          return (
            <Card key={step.title}>
              <CardHeader className="pb-2">
                <Icon className="mb-2 size-5 text-primary" aria-hidden="true" />
                <CardTitle className="text-base">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{step.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
