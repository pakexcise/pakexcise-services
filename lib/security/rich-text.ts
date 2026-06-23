import { escapeHtml, stripUnsafeMarkup } from "@/lib/security/sanitize-content";

const MARKDOWN_LINK =
  /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|tel:[^\s)]+)\)/g;
const MARKDOWN_BOLD = /\*\*([^*]+)\*\*/g;
const HEADING_PREFIX = /^#{1,3}\s+(.+)$/;

export function sanitizeRichTextContent(text: string): string {
  return stripUnsafeMarkup(text);
}

type RichBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: number; text: string }
  | { type: "list"; items: string[] }
  | { type: "ordered-list"; items: string[] };

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

function parseBlocks(content: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  const chunks = content
    .split("\n\n")
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean);
    const firstLine = lines[0] ?? "";
    const headingMatch = firstLine.match(HEADING_PREFIX);

    if (headingMatch) {
      const level = firstLine.match(/^#+/)?.[0].length ?? 2;
      blocks.push({
        type: "heading",
        level: Math.min(level, 3),
        text: headingMatch[1] ?? "",
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
        const tag = block.level === 1 ? "h2" : block.level === 2 ? "h3" : "h4";
        return `<${tag} class="text-lg font-semibold text-foreground">${renderInlineMarkdown(block.text)}</${tag}>`;
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

      return `<p class="text-sm leading-relaxed sm:text-base">${renderInlineMarkdown(block.text)}</p>`;
    })
    .join("");
}
