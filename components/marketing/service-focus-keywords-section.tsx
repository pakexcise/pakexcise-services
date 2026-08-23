import { cn } from "@/lib/utils";

export function parseFocusKeywords(
  value: string | null | undefined,
  maxItems = 24,
): string[] {
  if (!value?.trim()) {
    return [];
  }

  const seen = new Set<string>();
  const items: string[] = [];

  for (const part of value.split(/[,;|]+/)) {
    const keyword = part.trim().replace(/\s+/g, " ");
    if (!keyword) continue;

    const key = keyword.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    items.push(keyword);

    if (items.length >= maxItems) {
      break;
    }
  }

  return items;
}

type ServiceFocusKeywordsSectionProps = {
  title: string;
  description?: string;
  keywords: string[];
  className?: string;
};

/**
 * Visible topical terms from admin SEO focus keywords.
 * Uses a related-topics framing (not a raw keyword dump) for safer on-page SEO.
 */
export function ServiceFocusKeywordsSection({
  title,
  description,
  keywords,
  className,
}: ServiceFocusKeywordsSectionProps) {
  if (keywords.length === 0) {
    return null;
  }

  return (
    <section
      className={cn("space-y-3", className)}
      aria-labelledby="service-focus-keywords-heading"
    >
      <div className="space-y-1">
        <h2
          id="service-focus-keywords-heading"
          className="text-xl font-bold tracking-tight"
        >
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <ul className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <li key={keyword}>
            <span className="inline-flex rounded-md border bg-muted/40 px-3 py-1.5 text-sm text-foreground">
              {keyword}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
