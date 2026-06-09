import { escapeHtml, stripUnsafeMarkup } from "@/lib/security/sanitize-content";

const MARKDOWN_LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const MARKDOWN_BOLD = /\*\*([^*]+)\*\*/g;
const HEADING_PREFIX = /^#{1,3}\s+(.+)$/;

export function sanitizeRichTextContent(text: string): string {
  return stripUnsafeMarkup(text);
}

type RichBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: number; text: string }
  | { type: "list"; items: string[] };

function parseBlocks(content: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  const chunks = content.split("\n\n").map((chunk) => chunk.trim()).filter(Boolean);

  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean);

    if (lines.every((line) => line.startsWith("- "))) {
      blocks.push({
        type: "list",
        items: lines.map((line) => line.slice(2).trim()),
      });
      continue;
    }

    const firstLine = lines[0] ?? "";
    const headingMatch = firstLine.match(HEADING_PREFIX);

    if (headingMatch && lines.length === 1) {
      const level = firstLine.match(/^#+/)?.[0].length ?? 2;
      blocks.push({
        type: "heading",
        level: Math.min(level, 3),
        text: headingMatch[1],
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
    .replace(
      MARKDOWN_LINK,
      '<a href="$2" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>',
    )
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

      return `<p class="text-sm leading-relaxed sm:text-base">${renderInlineMarkdown(block.text)}</p>`;
    })
    .join("");
}
