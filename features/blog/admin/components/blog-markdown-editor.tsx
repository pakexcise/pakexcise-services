"use client";

import {
  Bold,
  Eye,
  Heading2,
  Heading3,
  ImagePlus,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Pencil,
} from "lucide-react";
import { useMemo, useRef, useState, useTransition } from "react";

import { ProseContent } from "@/components/marketing/prose-content";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BLOG_IMAGE_MAX_BYTES,
  BLOG_IMAGE_MIME_TYPES,
} from "@/config/uploads";
import { validateClientUpload } from "@/features/applications/lib/validate-upload";
import { resolveClientFileMimeType } from "@/lib/utils/resolve-file-mime";
import { cn } from "@/lib/utils";

type BlogMarkdownEditorProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
};

type EditorTab = "write" | "preview";

function wrapSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  before: string,
  after = "",
): { nextValue: string; cursor: number } {
  const selected = value.slice(selectionStart, selectionEnd);
  const nextValue =
    value.slice(0, selectionStart) +
    before +
    selected +
    after +
    value.slice(selectionEnd);
  const cursor = selectionStart + before.length + selected.length + after.length;
  return { nextValue, cursor };
}

function insertAtCursor(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  insertText: string,
): { nextValue: string; cursor: number } {
  const nextValue =
    value.slice(0, selectionStart) + insertText + value.slice(selectionEnd);
  return { nextValue, cursor: selectionStart + insertText.length };
}

export function BlogMarkdownEditor({
  id,
  label,
  value,
  onChange,
  rows = 16,
}: BlogMarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<EditorTab>("write");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();

  const previewContent = useMemo(() => value, [value]);

  function applyEdit(
    editor: (current: string, start: number, end: number) => {
      nextValue: string;
      cursor: number;
    },
  ) {
    const element = textareaRef.current;
    if (!element) {
      return;
    }

    const start = element.selectionStart;
    const end = element.selectionEnd;
    const { nextValue, cursor } = editor(value, start, end);
    onChange(nextValue);
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(cursor, cursor);
    });
  }

  function handleToolbar(action: string) {
    if (action === "h2") {
      applyEdit((current, start, end) =>
        insertAtCursor(current, start, end, "## Heading\n\n"),
      );
      return;
    }

    if (action === "h3") {
      applyEdit((current, start, end) =>
        insertAtCursor(current, start, end, "### Subheading\n\n"),
      );
      return;
    }

    if (action === "bold") {
      applyEdit((current, start, end) => wrapSelection(current, start, end, "**", "**"));
      return;
    }

    if (action === "ul") {
      applyEdit((current, start, end) =>
        insertAtCursor(current, start, end, "- List item\n- List item\n"),
      );
      return;
    }

    if (action === "ol") {
      applyEdit((current, start, end) =>
        insertAtCursor(current, start, end, "1. List item\n2. List item\n"),
      );
      return;
    }

    if (action === "link") {
      applyEdit((current, start, end) =>
        wrapSelection(current, start, end, "[", "](https://)"),
      );
    }
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const validation = validateClientUpload({
      file,
      acceptedMimeTypes: [...BLOG_IMAGE_MIME_TYPES],
      maxSizeBytes: BLOG_IMAGE_MAX_BYTES,
      invalidTypeMessage: "Only JPEG, PNG, or WebP images are allowed.",
      tooLargeMessage: "Image must be 2 MB or smaller.",
      invalidNameMessage: "Invalid file name.",
    });

    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    const resolvedMimeType = resolveClientFileMimeType(file, [
      ...BLOG_IMAGE_MIME_TYPES,
    ]);

    if (!resolvedMimeType) {
      setUploadError("Only JPEG, PNG, or WebP images are allowed.");
      return;
    }

    setUploadError(null);

    startUpload(async () => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/admin/blog/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        const data = (await response.json()) as { path?: string; error?: string };

        if (!response.ok || !data.path) {
          setUploadError(data.error ?? "Image upload failed");
          return;
        }

        const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        applyEdit((current, start, end) =>
          insertAtCursor(current, start, end, `\n\n![${alt}](${data.path})\n\n`),
        );
      } catch {
        setUploadError("Image upload failed");
      }
    });
  }

  return (
    <div className="space-y-3 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={tab === "write" ? "default" : "outline"}
            onClick={() => setTab("write")}
          >
            <Pencil className="size-4" />
            Write
          </Button>
          <Button
            type="button"
            size="sm"
            variant={tab === "preview" ? "default" : "outline"}
            onClick={() => setTab("preview")}
          >
            <Eye className="size-4" />
            Preview
          </Button>
        </div>
      </div>

      {tab === "write" ? (
        <>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => handleToolbar("h2")}>
              <Heading2 className="size-4" />
              H2
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => handleToolbar("h3")}>
              <Heading3 className="size-4" />
              H3
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => handleToolbar("bold")}>
              <Bold className="size-4" />
              Bold
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => handleToolbar("ul")}>
              <List className="size-4" />
              Bullets
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => handleToolbar("ol")}>
              <ListOrdered className="size-4" />
              Numbered
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => handleToolbar("link")}>
              <Link2 className="size-4" />
              Link
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              Image
            </Button>
          </div>
          <Textarea
            ref={textareaRef}
            id={id}
            rows={rows}
            dir="ltr"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn("font-mono text-sm")}
          />
          <p className="text-xs text-muted-foreground">
            Use the toolbar for headings, lists, bold, links, and image upload. Markdown is supported.
          </p>
          {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}
        </>
      ) : (
        <div className="rounded-xl border bg-card p-4 md:p-6">
          {previewContent.trim() ? (
            <ProseContent content={previewContent} />
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={BLOG_IMAGE_MIME_TYPES.join(",")}
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}
