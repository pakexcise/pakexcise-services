"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type BlogTableOfContentsProps = {
  items: Array<{ id: string; title: string; level: 2 | 3 }>;
  title: string;
  className?: string;
};

export function BlogTableOfContents({
  items,
  title,
  className,
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
        "rounded-2xl border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <ol className="mt-4 max-h-[min(70vh,32rem)] space-y-1 overflow-y-auto overscroll-contain pe-1 text-sm">
        {items.map((item) => {
          const isActive = activeId === item.id;

          return (
            <li key={item.id} className={cn(item.level === 3 && "ps-3")}>
              <a
                href={`#${item.id}`}
                onClick={() => setActiveId(item.id)}
                className={cn(
                  "block rounded-lg px-3 py-2 leading-snug transition-colors",
                  isActive
                    ? "border-s-2 border-primary bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-primary",
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
