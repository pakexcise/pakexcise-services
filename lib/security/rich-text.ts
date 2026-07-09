import { slugifyHeading } from "@/features/blog/lib/toc";
import { escapeHtml, stripUnsafeMarkup } from "@/lib/security/sanitize-content";

const MARKDOWN_LINK =
  /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|tel:[^\s)]+|\/[^\s)]+)\)/g;
const MARKDOWN_BOLD = /\*\*([^*]+)\*\*/g;
const MARKDOWN_IMAGE = /^!\[([^\]]*)\]\((\/[^\s)]+|https?:\/\/[^\s)]+)\)$/;
const HEADING_PREFIX = /^(#{1,3})\s+(.+)$/;

export function sanitizeRichTextContent(text: string): string {
  return stripUnsafeMarkup(text);
}

type RichBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "image"; alt: string; src: string };

function parseListItems(lines: string[]): string[] {
  return lines
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());
}

function parseOrderedListItems(lines: string[]): string[] {
  return lines
    .filter((line) => /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^\d+\.\s+/, "").trim());
}

function isBulletListBlock(lines: string[]): boolean {
  return lines.length > 0 && lines.every((line) => line.startsWith("- "));
}

function isOrderedListBlock(lines: string[]): boolean {
  return lines.length > 0 && lines.every((line) => /^\d+\.\s+/.test(line));
}

function createHeadingId(text: string, usedIds: Set<string>): string {
  let id = slugifyHeading(text);
  if (!id) {
    id = `section-${usedIds.size + 1}`;
  }

  let uniqueId = id;
  let suffix = 2;
  while (usedIds.has(uniqueId)) {
    uniqueId = `${id}-${suffix}`;
    suffix += 1;
  }

  usedIds.add(uniqueId);
  return uniqueId;
}

function parseBlocks(content: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  const usedHeadingIds = new Set<string>();
  const chunks = content
    .split("\n\n")
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean);
    const firstLine = lines[0] ?? "";
    const imageMatch = firstLine.match(MARKDOWN_IMAGE);

    if (imageMatch && lines.length === 1) {
      blocks.push({
        type: "image",
        alt: imageMatch[1] ?? "",
        src: imageMatch[2] ?? "",
      });
      continue;
    }

    const headingMatch = firstLine.match(HEADING_PREFIX);

    if (headingMatch) {
      const hashCount = headingMatch[1]?.length ?? 2;
      const level: 2 | 3 = hashCount >= 3 ? 3 : 2;
      const text = headingMatch[2] ?? "";
      blocks.push({
        type: "heading",
        level,
        text,
        id: createHeadingId(text, usedHeadingIds),
      });

      const rest = lines.slice(1);

      if (rest.length > 0 && isBulletListBlock(rest)) {
        blocks.push({ type: "list", items: parseListItems(rest) });
      } else if (rest.length > 0 && isOrderedListBlock(rest)) {
        blocks.push({ type: "ordered-list", items: parseOrderedListItems(rest) });
      } else if (rest.length > 0) {
        blocks.push({ type: "paragraph", text: rest.join(" ") });
      }

      continue;
    }

    if (isBulletListBlock(lines)) {
      blocks.push({
        type: "list",
        items: parseListItems(lines),
      });
      continue;
    }

    if (isOrderedListBlock(lines)) {
      blocks.push({
        type: "ordered-list",
        items: parseOrderedListItems(lines),
      });
      continue;
    }

    blocks.push({ type: "paragraph", text: lines.join(" ") });
  }

  return blocks;
}

function renderInlineMarkdown(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(MARKDOWN_LINK, (_match, label, href) => {
      const isExternal = href.startsWith("http");
      const rel = isExternal ? ' rel="noopener noreferrer"' : "";
      const target = isExternal ? ' target="_blank"' : "";
      return `<a href="${href}"${rel}${target} class="text-primary hover:underline">${label}</a>`;
    })
    .replace(MARKDOWN_BOLD, "<strong>$1</strong>");
}

export function renderRichTextHtml(content: string): string {
  const sanitized = sanitizeRichTextContent(content);
  const blocks = parseBlocks(sanitized);

  return blocks
    .map((block) => {
      if (block.type === "heading") {
        const tag = block.level === 2 ? "h2" : "h3";
        const sizeClass =
          block.level === 2
            ? "scroll-mt-24 text-2xl font-bold text-foreground sm:text-3xl"
            : "scroll-mt-24 text-xl font-semibold text-foreground sm:text-2xl";
        return `<${tag} id="${block.id}" class="${sizeClass}">${renderInlineMarkdown(block.text)}</${tag}>`;
      }

      if (block.type === "list") {
        const items = block.items
          .map((item) => `<li>${renderInlineMarkdown(item)}</li>`)
          .join("");
        return `<ul class="list-disc space-y-2 ps-5">${items}</ul>`;
      }

      if (block.type === "ordered-list") {
        const items = block.items
          .map((item) => `<li>${renderInlineMarkdown(item)}</li>`)
          .join("");
        return `<ol class="list-decimal space-y-2 ps-5">${items}</ol>`;
      }

      if (block.type === "image") {
        const alt = escapeHtml(block.alt);
        const src = escapeHtml(block.src);
        return `<figure class="my-8 overflow-hidden rounded-2xl border bg-card shadow-sm"><img src="${src}" alt="${alt}" class="h-auto w-full" loading="lazy" decoding="async" /></figure>`;
      }

      return `<p class="text-sm leading-relaxed sm:text-base">${renderInlineMarkdown(block.text)}</p>`;
    })
    .join("");
}
