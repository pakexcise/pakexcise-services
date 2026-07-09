import type { BlogTocItem } from "@/features/blog/types";

const HEADING_LINE = /^(#{2,3})\s+(.+)$/;

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export function extractBlogTableOfContents(content: string): BlogTocItem[] {
  const items: BlogTocItem[] = [];
  const usedIds = new Set<string>();

  for (const line of content.split("\n")) {
    const match = line.trim().match(HEADING_LINE);
    if (!match) {
      continue;
    }

    const hashCount = match[1]?.length ?? 2;
    const level: 2 | 3 = hashCount >= 3 ? 3 : 2;
    const title = (match[2] ?? "").trim();
    if (!title) {
      continue;
    }

    let id = slugifyHeading(title);
    if (!id) {
      id = `section-${items.length + 1}`;
    }

    let uniqueId = id;
    let suffix = 2;
    while (usedIds.has(uniqueId)) {
      uniqueId = `${id}-${suffix}`;
      suffix += 1;
    }

    usedIds.add(uniqueId);
    items.push({ id: uniqueId, title, level });
  }

  return items;
}
