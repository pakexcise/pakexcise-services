import { CheckCircle2, Shield, Smartphone, Users } from "lucide-react";

import { HomeSectionShell } from "@/components/marketing/home-section-shell";
import { SectionHeader } from "@/components/marketing/section-header";

type HomeWhyChooseItem = {
  title: string;
  description: string;
};

type HomeWhyChooseSectionProps = {
  title: string;
  description: string;
  items: HomeWhyChooseItem[];
  tone?: "default" | "muted" | "accent";
  className?: string;
};

const ITEM_ICONS = [Shield, Smartphone, Users, CheckCircle2] as const;

export function HomeWhyChooseSection({
  title,
  description,
  items,
  tone = "accent",
  className,
}: HomeWhyChooseSectionProps) {
  return (
    <HomeSectionShell tone={tone} className={className}>
      <SectionHeader title={title} description={description} centered />

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const Icon = ITEM_ICONS[index % ITEM_ICONS.length] ?? CheckCircle2;

          return (
            <li
              key={item.title}
              className="rounded-xl border border-border/60 bg-background/80 p-5"
            >
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-4 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </li>
          );
        })}
      </ul>
    </HomeSectionShell>
  );
}
