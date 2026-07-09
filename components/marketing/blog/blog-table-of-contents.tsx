"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type BlogTableOfContentsProps = {
  items: Array<{ id: string; title: string; level: 2 | 3 }>;
  title: string;
  className?: string;
  /** Sidebar mode: fixed-height scroll area so CTA below is never overlapped. */
  compact?: boolean;
};

export function BlogTableOfContents({
  items,
  title,
  className,
  compact = false,
}: BlogTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const headingElements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    if (headingElements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const nextActiveId = visibleEntries[0]?.target.id;
        if (nextActiveId) {
          setActiveId(nextActiveId);
        }
      },
      {
        rootMargin: "-15% 0px -70% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 1],
      },
    );

    for (const element of headingElements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={title}
      className={cn(
        "rounded-2xl border bg-card shadow-sm",
        compact
          ? "flex max-h-[min(48vh,22rem)] flex-col overflow-hidden"
          : "p-5",
        className,
      )}
    >
      <div
        className={cn(
          "shrink-0",
          compact ? "border-b px-4 py-3.5" : "",
        )}
      >
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>

      <ol
        className={cn(
          "space-y-0.5 text-sm",
          compact
            ? "blog-toc-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2"
            : "mt-4",
        )}
      >
        {items.map((item) => {
          const isActive = activeId === item.id;

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={() => setActiveId(item.id)}
                className={cn(
                  "block rounded-lg px-3 py-2 leading-snug break-words transition-colors",
                  item.level === 3 && "ms-3 text-[0.8125rem]",
                  isActive
                    ? "bg-primary/10 font-medium text-primary ring-1 ring-inset ring-primary/20"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
                aria-current={isActive ? "location" : undefined}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
