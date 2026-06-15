"use client";

import { useEffect } from "react";

import { pickLocalized } from "@/lib/i18n/content";
import type { PublicServiceCategoryGroup } from "@/server/repositories/service-category-repository";
import { cn } from "@/lib/utils";

type ServicesCategoryNavProps = {
  groups: PublicServiceCategoryGroup[];
  locale: string;
  label: string;
};

function categoryHash(slug: string): string {
  return `category-${slug}`;
}

function normalizeCategoryHash(rawHash: string): string | null {
  const segments = rawHash
    .split("#")
    .map((segment) => segment.trim())
    .filter(Boolean);

  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const segment = segments[index];
    if (segment?.startsWith("category-")) {
      return segment;
    }
  }

  return null;
}

function scrollToCategory(slug: string): void {
  const targetId = categoryHash(slug);
  const target = document.getElementById(targetId);

  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  history.replaceState(null, "", `#${targetId}`);
}

type CategoryNavLinkProps = {
  slug: string;
  className: string;
  children: React.ReactNode;
};

function CategoryNavLink({ slug, className, children }: CategoryNavLinkProps) {
  const hash = categoryHash(slug);

  return (
    <a
      href={`#${hash}`}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        scrollToCategory(slug);
      }}
    >
      {children}
    </a>
  );
}

export function ServicesCategoryNav({
  groups,
  locale,
  label,
}: ServicesCategoryNavProps) {
  useEffect(() => {
    const normalized = normalizeCategoryHash(window.location.hash);

    if (!normalized) {
      return;
    }

    if (window.location.hash !== `#${normalized}`) {
      history.replaceState(null, "", `#${normalized}`);
    }

    const target = document.getElementById(normalized);
    target?.scrollIntoView({ block: "start" });
  }, []);

  if (groups.length < 2) {
    return null;
  }

  return (
    <nav
      aria-label={label}
      className="sticky top-[var(--site-sticky-offset,0px)] z-10 -mx-1 overflow-x-auto border-b bg-background/95 pb-3 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <ul className="flex min-w-max gap-2 px-1">
        {groups.map((group) => {
          const name = pickLocalized(locale, {
            en: group.nameEn,
            ur: group.nameUr,
          });

          return (
            <li key={group.id}>
              <CategoryNavLink
                slug={group.slug}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium",
                  "transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary",
                )}
              >
                {name}
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {group.services.length}
                </span>
              </CategoryNavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
