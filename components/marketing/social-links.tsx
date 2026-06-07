import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { pickLocalized } from "@/lib/i18n/content";

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
  variant?: "inline" | "cards";
  className?: string;
};

function resolveSocialIcon(iconName: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[iconName] ?? LucideIcons.Link;
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

  if (variant === "cards") {
    return (
      <section className={className}>
        {title ? <h2 className="mb-4 text-lg font-semibold">{title}</h2> : null}
        <ul className="grid gap-3 sm:grid-cols-2">
          {links.map((link) => {
            const Icon = resolveSocialIcon(link.iconName);
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
                  className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                  data-analytics-event="click_social_link"
                  data-platform={link.platform}
                >
                  <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
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
