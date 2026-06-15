import {
  Car,
  CreditCard,
  FileText,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { HomeSectionShell } from "@/components/marketing/home-section-shell";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  HOME_VEHICLE_VISUAL_IMAGE_HEIGHT,
  HOME_VEHICLE_VISUAL_IMAGE_WIDTH,
} from "@/features/home-page/lib/vehicle-visual";
import { cn } from "@/lib/utils";

type HomeVehicleVisualSectionProps = {
  title: string;
  description: string;
  imagePath: string;
  imageAlt: string;
  featurePoints: Array<{ title: string; description: string }>;
  browseCta: string;
  whatsappCta: string;
  requestCta: string;
  whatsappHref: string;
  tone?: "default" | "muted" | "accent";
  className?: string;
};

const FEATURE_ICONS = [FileText, Car, CreditCard, MessageCircle] as const;

export function HomeVehicleVisualSection({
  title,
  description,
  imagePath,
  imageAlt,
  featurePoints,
  browseCta,
  whatsappCta,
  requestCta,
  whatsappHref,
  tone = "muted",
  className,
}: HomeVehicleVisualSectionProps) {
  return (
    <HomeSectionShell tone={tone} className={className}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>

          <ul className="space-y-4">
            {featurePoints.map((point, index) => {
              const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length] ?? FileText;

              return (
                <li key={point.title} className="flex gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-4 text-primary" aria-hidden="true" />
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground sm:text-base">
                      {point.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {point.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="h-11">
              <Link href="/services">
                {browseCta}
                <DirectionalArrow />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-11 bg-[#25D366] text-white shadow-md shadow-[#25D366]/20 hover:bg-[#20bd5a]"
            >
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-event="click_whatsapp"
                data-analytics-placement="home_vehicle_visual_whatsapp"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                {whatsappCta}
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11">
              <Link href="/contact#contact-form">{requestCta}</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl lg:max-w-none lg:justify-self-end">
          <div
            className={cn(
              "overflow-hidden rounded-2xl border border-border/70 bg-background",
              "shadow-lg shadow-primary/5",
            )}
          >
            <Image
              src={imagePath}
              alt={imageAlt}
              width={HOME_VEHICLE_VISUAL_IMAGE_WIDTH}
              height={HOME_VEHICLE_VISUAL_IMAGE_HEIGHT}
              sizes="(max-width: 768px) 92vw, (max-width: 1200px) 46vw, 560px"
              className="h-auto w-full object-cover"
              priority={false}
            />
          </div>
        </div>
      </div>
    </HomeSectionShell>
  );
}
