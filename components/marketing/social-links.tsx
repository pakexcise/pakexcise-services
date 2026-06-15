import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { BrandSocialIcon } from "@/components/shared/brand-social-icon";
import { pickLocalized } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";

export type PublicSocialLink = {
  id: string;
  platform: string;
  labelEn: string;
  labelUr: string;
  url: string;
  iconName: string;
};

type SocialLinksProps = {
  links: PublicSocialLink[];
  locale: string;
  title?: string;
  emptyMessage?: string;
  variant?: "inline" | "cards" | "icons" | "footer";
  className?: string;
};

const BRAND_PLATFORMS = new Set([
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "linkedin",
  "x",
  "twitter",
]);

function resolveSocialIcon(iconName: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[iconName] ?? LucideIcons.Link;
}

function SocialIcon({
  platform,
  iconName,
  className,
}: {
  platform: string;
  iconName: string;
  className?: string;
}) {
  if (BRAND_PLATFORMS.has(platform.toLowerCase())) {
    return (
      <BrandSocialIcon
        platform={platform}
        className={className ?? "size-5 shrink-0 text-primary"}
      />
    );
  }

  const Icon = resolveSocialIcon(iconName);
  return <Icon className={className ?? "size-5 shrink-0 text-primary"} aria-hidden="true" />;
}

const FOOTER_PLATFORM_STYLES: Record<string, string> = {
  facebook: "hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10 hover:text-[#1877F2]",
  instagram: "hover:border-[#E4405F]/50 hover:bg-[#E4405F]/10 hover:text-[#E4405F]",
  tiktok: "hover:border-foreground/30 hover:bg-foreground/5 hover:text-foreground",
  youtube: "hover:border-[#FF0000]/50 hover:bg-[#FF0000]/10 hover:text-[#FF0000]",
  linkedin: "hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]",
  x: "hover:border-foreground/30 hover:bg-foreground/5 hover:text-foreground",
  twitter: "hover:border-foreground/30 hover:bg-foreground/5 hover:text-foreground",
  whatsapp: "hover:border-[#25D366]/50 hover:bg-[#25D366]/10 hover:text-[#25D366]",
};

function footerPlatformStyle(platform: string): string {
  return FOOTER_PLATFORM_STYLES[platform.toLowerCase()] ?? "hover:border-primary/40 hover:bg-primary/5 hover:text-primary";
}

export function SocialLinks({
  links,
  locale,
  title,
  emptyMessage,
  variant = "inline",
  className,
}: SocialLinksProps) {
  if (links.length === 0) {
    if (!emptyMessage) {
      return null;
    }

    return (
      <section className={className}>
        {title ? <h2 className="mb-3 text-sm font-semibold">{title}</h2> : null}
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </section>
    );
  }

  if (variant === "footer") {
    return (
      <section className={className}>
        {title ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
        ) : null}
        <ul className="flex flex-wrap gap-2.5">
          {links.map((link) => {
            const label = pickLocalized(locale, {
              en: link.labelEn,
              ur: link.labelUr,
            });

            return (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className={cn(
                    "group flex size-10 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-muted-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                    footerPlatformStyle(link.platform),
                  )}
                  data-analytics-event="click_social_link"
                  data-platform={link.platform}
                >
                  <SocialIcon
                    platform={link.platform}
                    iconName={link.iconName}
                    className="size-[18px] transition-transform duration-200 group-hover:scale-110"
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  if (variant === "icons") {
    return (
      <section className={className}>
        {title ? <h2 className="mb-2 text-lg font-semibold">{title}</h2> : null}
        {emptyMessage && links.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="flex flex-wrap gap-3">
            {links.map((link) => {
              const label = pickLocalized(locale, {
                en: link.labelEn,
                ur: link.labelUr,
              });

              return (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex size-11 items-center justify-center rounded-full border bg-background text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
                    data-analytics-event="click_social_link"
                    data-platform={link.platform}
                  >
                    <SocialIcon
                      platform={link.platform}
                      iconName={link.iconName}
                      className="size-5"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    );
  }

  if (variant === "cards") {
    return (
      <section className={className}>
        {title ? <h2 className="mb-4 text-lg font-semibold">{title}</h2> : null}
        <ul className="grid gap-3 sm:grid-cols-2">
          {links.map((link) => {
            const label = pickLocalized(locale, {
              en: link.labelEn,
              ur: link.labelUr,
            });

            return (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                  data-analytics-event="click_social_link"
                  data-platform={link.platform}
                >
                  <SocialIcon platform={link.platform} iconName={link.iconName} />
                  <span>{label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return (
    <section className={className}>
      {title ? <h2 className="mb-2 text-sm font-semibold">{title}</h2> : null}
      <ul className="flex flex-wrap gap-3 text-sm">
        {links.map((link) => {
          const label = pickLocalized(locale, {
            en: link.labelEn,
            ur: link.labelUr,
          });

          return (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                data-analytics-event="click_social_link"
                data-platform={link.platform}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
