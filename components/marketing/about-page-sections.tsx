import {
  Car,
  CheckCircle2,
  ClipboardList,
  FileText,
  MessageCircle,
  ShieldAlert,
  Users,
} from "lucide-react";

import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { SectionHeader } from "@/components/marketing/section-header";
import { ServiceCategorySection } from "@/components/marketing/service-category-section";
import type { ServiceCardLabels } from "@/components/marketing/service-card";
import { SocialLinks, type PublicSocialLink } from "@/components/marketing/social-links";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import type { PublicServiceCategoryGroup } from "@/server/repositories/service-category-repository";

import Link from "next/link";
type AboutDisclaimerBoxProps = {
  title: string;
  body: string;
};

export function AboutDisclaimerBox({ title, body }: AboutDisclaimerBoxProps) {
  return (
    <section
      aria-labelledby="about-disclaimer-title"
      className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6"
    >
      <div className="flex gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
          <ShieldAlert className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 space-y-2">
          <h2
            id="about-disclaimer-title"
            className="text-bidi-auto text-lg font-semibold text-foreground"
          >
            {title}
          </h2>
          <p className="text-bidi-auto text-sm leading-relaxed text-muted-foreground sm:text-base">
            {body}
          </p>
        </div>
      </div>
    </section>
  );
}

type AboutWhoWeAreSectionProps = {
  title: string;
  paragraphs: string[];
};

export function AboutWhoWeAreSection({ title, paragraphs }: AboutWhoWeAreSectionProps) {
  return (
    <section className="space-y-4">
      <SectionHeader title={title} />
      <div className="space-y-4 rounded-2xl border bg-card/60 p-5 sm:p-6">
        {paragraphs.map((paragraph) => (
          <p
            key={paragraph.slice(0, 40)}
            className="text-bidi-auto text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

type AboutServicesSectionProps = {
  title: string;
  description: string;
  emptyMessage: string;
  browseLabel: string;
  categoryGroups: PublicServiceCategoryGroup[];
  locale: string;
  labels: ServiceCardLabels;
};

export function AboutServicesSection({
  title,
  description,
  emptyMessage,
  browseLabel,
  categoryGroups,
  locale,
  labels,
}: AboutServicesSectionProps) {
  return (
    <section className="space-y-6">
      <SectionHeader
        title={title}
        description={description}
        action={
          <Button asChild variant="outline" className="hidden shrink-0 sm:inline-flex">
            <Link href="/services">
              {browseLabel}
              <DirectionalArrow />
            </Link>
          </Button>
        }
      />

      {categoryGroups.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{emptyMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/services">{browseLabel}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {categoryGroups.map((group) => (
            <ServiceCategorySection
              key={group.id}
              group={group}
              locale={locale}
              labels={labels}
              heading="h3"
              layout="compact"
            />
          ))}
        </div>
      )}
    </section>
  );
}

type AboutStep = {
  title: string;
  description: string;
};

const HOW_IT_WORKS_ICONS = [MessageCircle, ClipboardList, Users, CheckCircle2] as const;
const WHY_CHOOSE_ICONS = [ShieldAlert, Car, Users, CheckCircle2] as const;

type AboutHowItWorksSectionProps = {
  title: string;
  description: string;
  steps: AboutStep[];
};

export function AboutHowItWorksSection({
  title,
  description,
  steps,
}: AboutHowItWorksSectionProps) {
  return (
    <section className="space-y-6">
      <SectionHeader title={title} description={description} />
      <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = HOW_IT_WORKS_ICONS[index] ?? CheckCircle2;

          return (
            <li key={step.title}>
              <Card className="h-full border-border/80 shadow-sm">
                <CardHeader className="space-y-3 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {index + 1}
                    </span>
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-4 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <CardTitle className="text-bidi-auto text-base leading-relaxed">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-bidi-auto text-sm leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

type AboutWhyChooseSectionProps = {
  title: string;
  description: string;
  items: AboutStep[];
};

export function AboutWhyChooseSection({
  title,
  description,
  items,
}: AboutWhyChooseSectionProps) {
  return (
    <section className="space-y-6">
      <SectionHeader title={title} description={description} />
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((item, index) => {
          const Icon = WHY_CHOOSE_ICONS[index] ?? CheckCircle2;

          return (
            <li
              key={item.title}
              className="rounded-2xl border border-border/70 bg-muted/20 p-5"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-bidi-auto text-base font-semibold">{item.title}</h3>
              <p className="text-bidi-auto mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

type AboutConnectSectionProps = {
  title: string;
  description: string;
  emptyMessage: string;
  links: PublicSocialLink[];
  locale: string;
};

export function AboutConnectSection({
  title,
  description,
  emptyMessage,
  links,
  locale,
}: AboutConnectSectionProps) {
  return (
    <section className="space-y-4 rounded-2xl border bg-muted/20 p-5 sm:p-6">
      <SectionHeader title={title} description={description} />
      <SocialLinks
        links={links}
        variant="cards"
        emptyMessage={emptyMessage}
      />
    </section>
  );
}

type AboutFinalCtaSectionProps = {
  title: string;
  description: string;
  browseServicesLabel: string;
  submitRequestLabel: string;
  whatsappLabel: string;
  whatsappPhone?: string | null;
  whatsappMessage?: string | null;
};

export function AboutFinalCtaSection({
  title,
  description,
  browseServicesLabel,
  submitRequestLabel,
  whatsappLabel,
  whatsappPhone,
  whatsappMessage,
}: AboutFinalCtaSectionProps) {
  const whatsappHref = buildWhatsAppUrl(
    whatsappPhone ?? "",
    whatsappMessage ?? "",
  );

  return (
    <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 md:p-8">
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <h2 className="text-bidi-auto text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        <p className="text-bidi-auto text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <Button asChild size="lg" className="sm:min-w-[180px]">
          <Link href="/services">
            {browseServicesLabel}
            <DirectionalArrow />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="sm:min-w-[180px]">
          <Link href="/contact">
            <FileText className="size-4" aria-hidden="true" />
            {submitRequestLabel}
          </Link>
        </Button>
        {whatsappPhone ? (
          <Button
            asChild
            size="lg"
            className="bg-[#128C7E] text-white hover:bg-[#0f7a6c] sm:min-w-[180px]"
          >
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-event="click_whatsapp"
              data-analytics-placement="about_final_cta"
            >
              <WhatsAppIcon className="size-4" />
              {whatsappLabel}
            </a>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
