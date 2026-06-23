export type TextSelection = {
  start: number;
  end: number;
  value: string;
};

export function getTextSelection(
  element: HTMLTextAreaElement,
): TextSelection {
  return {
    start: element.selectionStart,
    end: element.selectionEnd,
    value: element.value,
  };
}

export function applyTextMutation(
  element: HTMLTextAreaElement,
  nextValue: string,
  selectionStart: number,
  selectionEnd: number,
  onChange: (value: string) => void,
) {
  onChange(nextValue);
  requestAnimationFrame(() => {
    element.focus();
    element.setSelectionRange(selectionStart, selectionEnd);
  });
}

export function wrapSelection(
  selection: TextSelection,
  before: string,
  after: string,
): { value: string; start: number; end: number } {
  const { start, end, value } = selection;
  const selected = value.slice(start, end);
  const content = selected || "text";
  const nextValue = value.slice(0, start) + before + content + after + value.slice(end);
  const cursorStart = start + before.length;
  const cursorEnd = cursorStart + content.length;

  return { value: nextValue, start: cursorStart, end: cursorEnd };
}

export function insertAtCursor(
  selection: TextSelection,
  insertText: string,
): { value: string; start: number; end: number } {
  const { start, end, value } = selection;
  const nextValue = value.slice(0, start) + insertText + value.slice(end);
  const cursor = start + insertText.length;

  return { value: nextValue, start: cursor, end: cursor };
}

export function prefixSelectedLines(
  selection: TextSelection,
  prefix: string,
  ordered = false,
): { value: string; start: number; end: number } {
  const { start, end, value } = selection;

  let lineStart = value.lastIndexOf("\n", start - 1) + 1;
  let lineEnd = value.indexOf("\n", end);
  if (lineEnd === -1) {
    lineEnd = value.length;
  }

  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n");
  const prefixed = lines
    .map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return line;
      }

      const cleaned = trimmed
        .replace(/^#{1,3}\s+/, "")
        .replace(/^-\s+/, "")
        .replace(/^\d+\.\s+/, "");

      if (ordered) {
        return `${index + 1}. ${cleaned}`;
      }

      return `- ${cleaned}`;
    })
    .join("\n");

  const nextValue = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
  const delta = prefixed.length - block.length;

  return {
    value: nextValue,
    start: start,
    end: end + delta,
  };
}

export function applyHeadingPrefix(
  selection: TextSelection,
  headingPrefix: string,
): { value: string; start: number; end: number } {
  const { start, end, value } = selection;

  let lineStart = value.lastIndexOf("\n", start - 1) + 1;
  let lineEnd = value.indexOf("\n", end);
  if (lineEnd === -1) {
    lineEnd = value.length;
  }

  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n").map((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return line;
    }

    const cleaned = trimmed
      .replace(/^#{1,3}\s+/, "")
      .replace(/^-\s+/, "")
      .replace(/^\d+\.\s+/, "");

    return `${headingPrefix}${cleaned}`;
  });

  const prefixed = lines.join("\n");
  const nextValue = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
  const delta = prefixed.length - block.length;

  return {
    value: nextValue,
    start: start,
    end: end + delta,
  };
}

export function buildMarkdownLink(label: string, url: string): string {
  const safeLabel = label.trim() || url.trim();
  const safeUrl = url.trim();
  return `[${safeLabel}](${safeUrl})`;
}
