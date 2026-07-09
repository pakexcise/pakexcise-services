"use client";

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
      <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
        {title}
      </h2>
      <ol className="mt-4 space-y-2 text-sm">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(item.level === 3 && "ps-4")}
          >
            <a
              href={`#${item.id}`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
