"use client";

import {
  Bold,
  Eye,
  Heading2,
  Heading3,
  Link2,
  List,
  ListOrdered,
  Pencil,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

import {
  applyHeadingPrefix,
  applyTextMutation,
  buildMarkdownLink,
  getTextSelection,
  insertAtCursor,
  prefixSelectedLines,
  wrapSelection,
} from "@/features/cms/lib/markdown-editor-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { renderRichTextHtml } from "@/lib/security/rich-text";
import { cn } from "@/lib/utils";

export type MarkdownContentEditorLabels = {
  write: string;
  preview: string;
  previewEmpty: string;
  bold: string;
  heading2: string;
  heading3: string;
  link: string;
  bulletList: string;
  orderedList: string;
  linkText: string;
  linkUrl: string;
  linkInsert: string;
  linkCancel: string;
  hint: string;
};

type MarkdownContentEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  labels: MarkdownContentEditorLabels;
  className?: string;
};

type EditorMode = "write" | "preview";

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="h-8 px-2.5"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function MarkdownContentEditor({
  id,
  value,
  onChange,
  rows = 16,
  labels,
  className,
}: MarkdownContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savedSelectionRef = useRef<{ start: number; end: number } | null>(null);
  const [mode, setMode] = useState<EditorMode>("write");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const mutate = useCallback(
    (mutator: (selection: ReturnType<typeof getTextSelection>) => {
      value: string;
      start: number;
      end: number;
    }) => {
      const element = textareaRef.current;
      if (!element) {
        return;
      }

      const selection = getTextSelection(element);
      const result = mutator(selection);
      applyTextMutation(
        element,
        result.value,
        result.start,
        result.end,
        onChange,
      );
    },
    [onChange],
  );

  function handleBold() {
    mutate((selection) => wrapSelection(selection, "**", "**"));
  }

  function handleHeading(level: "## " | "### ") {
    mutate((selection) => applyHeadingPrefix(selection, level));
  }

  function handleBulletList() {
    mutate((selection) => prefixSelectedLines(selection, "- "));
  }

  function handleOrderedList() {
    mutate((selection) => prefixSelectedLines(selection, "1. ", true));
  }

  function openLinkForm() {
    const element = textareaRef.current;
    if (!element) {
      return;
    }

    const selection = getTextSelection(element);
    savedSelectionRef.current = { start: selection.start, end: selection.end };
    const selected = selection.value.slice(selection.start, selection.end).trim();
    setLinkText(selected);
    setLinkUrl("");
    setShowLinkForm(true);
  }

  function handleInsertLink() {
    if (!linkUrl.trim()) {
      return;
    }

    const element = textareaRef.current;
    if (!element) {
      return;
    }

    const saved = savedSelectionRef.current;
    const selection =
      saved != null
        ? {
            start: saved.start,
            end: saved.end,
            value: element.value,
          }
        : getTextSelection(element);

    const markdown = buildMarkdownLink(linkText, linkUrl);
    const result = insertAtCursor(selection, markdown);
    applyTextMutation(element, result.value, result.start, result.end, onChange);

    savedSelectionRef.current = null;
    setShowLinkForm(false);
    setLinkText("");
    setLinkUrl("");
  }

  const previewHtml = value.trim() ? renderRichTextHtml(value) : "";

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-background", className)}>
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <ToolbarButton label={labels.bold} onClick={handleBold}>
            <Bold className="size-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label={labels.heading2} onClick={() => handleHeading("## ")}>
            <Heading2 className="size-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label={labels.heading3} onClick={() => handleHeading("### ")}>
            <Heading3 className="size-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label={labels.link} onClick={openLinkForm}>
            <Link2 className="size-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label={labels.bulletList} onClick={handleBulletList}>
            <List className="size-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label={labels.orderedList} onClick={handleOrderedList}>
            <ListOrdered className="size-4" aria-hidden="true" />
          </ToolbarButton>
        </div>

        <div className="ms-auto flex items-center gap-1 rounded-lg border bg-background p-0.5">
          <Button
            type="button"
            size="sm"
            variant={mode === "write" ? "default" : "ghost"}
            className="h-7 px-2.5"
            onClick={() => setMode("write")}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            {labels.write}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "preview" ? "default" : "ghost"}
            className="h-7 px-2.5"
            onClick={() => setMode("preview")}
          >
            <Eye className="size-3.5" aria-hidden="true" />
            {labels.preview}
          </Button>
        </div>
      </div>

      {showLinkForm ? (
        <div className="flex flex-col gap-2 border-b bg-muted/20 px-3 py-3 sm:flex-row sm:items-end">
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <Input
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder={labels.linkText}
              dir="ltr"
            />
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder={labels.linkUrl}
              dir="ltr"
              type="url"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleInsertLink}>
              {labels.linkInsert}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowLinkForm(false)}
            >
              {labels.linkCancel}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="p-3">
        <p className="mb-2 text-xs text-muted-foreground">{labels.hint}</p>

        {mode === "write" ? (
          <Textarea
            ref={textareaRef}
            id={id}
            rows={rows}
            dir="ltr"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[320px] resize-y font-mono text-sm leading-relaxed"
          />
        ) : previewHtml ? (
          <div
            className="prose-content min-h-[320px] space-y-4 rounded-lg border bg-muted/10 p-4 text-muted-foreground [&_a]:text-primary [&_strong]:text-foreground"
            dir="ltr"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <div
            className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed bg-muted/10 px-4 text-sm text-muted-foreground"
            dir="ltr"
          >
            {labels.previewEmpty}
          </div>
        )}
      </div>
    </div>
  );
}
