import {
  Car,
  CreditCard,
  FileText,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
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
  className,
}: HomeVehicleVisualSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-y border-border/50",
        "bg-linear-to-br from-primary/[0.06] via-background to-secondary/[0.08]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-32 top-0 size-96 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 size-72 rounded-full bg-secondary/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-site relative py-14 md:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 xl:gap-16">
          <div className="order-2 space-y-8 lg:order-1">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-[2rem] lg:leading-tight">
                {title}
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {description}
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              {featurePoints.map((point, index) => {
                const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length] ?? FileText;

                return (
                  <li
                    key={point.title}
                    className="flex gap-3 rounded-xl border border-border/50 bg-background/80 p-3.5 backdrop-blur-sm sm:p-4"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-4 text-primary" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <h3 className="text-sm font-semibold leading-snug">{point.title}</h3>
                      <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
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

          <div className="order-1 lg:order-2">
            <figure className="relative mx-auto w-full max-w-[640px] lg:max-w-none">
              <div
                className="pointer-events-none absolute -inset-3 rounded-3xl bg-primary/10 blur-2xl sm:-inset-4"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl shadow-primary/10 ring-1 ring-border/40">
                <Image
                  src={imagePath}
                  alt={imageAlt}
                  width={HOME_VEHICLE_VISUAL_IMAGE_WIDTH}
                  height={HOME_VEHICLE_VISUAL_IMAGE_HEIGHT}
                  unoptimized
                  sizes="(max-width: 1024px) min(100vw, 640px), 560px"
                  className="h-auto w-full max-w-[1024px] object-contain"
                  priority={false}
                />
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
