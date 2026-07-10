"use client";

import { ImageIcon, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BLOG_IMAGE_MAX_BYTES,
  BLOG_IMAGE_MIME_TYPES,
} from "@/config/uploads";
import { validateClientUpload } from "@/features/applications/lib/validate-upload";
import { resolveBlogImageSrc } from "@/features/blog/lib/blog-image-paths";
import { BLOG_IMAGE_ADMIN_HINT } from "@/features/blog/lib/image-spec";
import { resolveClientFileMimeType } from "@/lib/utils/resolve-file-mime";

type BlogImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (path: string) => void;
  hint?: string;
};

export function BlogImageUploadField({
  label,
  value,
  onChange,
  hint = BLOG_IMAGE_ADMIN_HINT,
}: BlogImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePickFile() {
    inputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
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
      setError(validation.error);
      return;
    }

    const resolvedMimeType = resolveClientFileMimeType(file, [
      ...BLOG_IMAGE_MIME_TYPES,
    ]);

    if (!resolvedMimeType) {
      setError("Only JPEG, PNG, or WebP images are allowed.");
      return;
    }

    setError(null);

    startTransition(async () => {
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
          setError(data.error ?? "Upload failed");
          return;
        }

        onChange(data.path);
      } catch {
        setError("Upload failed");
      }
    });
  }

  const previewSrc = resolveBlogImageSrc(value);

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/api/blog/images/example.webp"
          className="max-w-xl"
        />
        <Button type="button" variant="outline" onClick={handlePickFile} disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Upload image
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {previewSrc ? (
        <div className="relative aspect-[16/9] max-w-md overflow-hidden rounded-xl border bg-muted/20">
          <Image
            src={previewSrc}
            alt="Uploaded preview"
            fill
            sizes="400px"
            quality={95}
            unoptimized
            className="object-contain p-2"
          />
        </div>
      ) : value ? (
        <p className="text-sm text-destructive">
          Image path is saved but the file could not be resolved for preview.
        </p>
      ) : (
        <div className="flex max-w-md items-center justify-center rounded-xl border border-dashed bg-muted/10 p-8 text-muted-foreground">
          <ImageIcon className="size-8" aria-hidden="true" />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={BLOG_IMAGE_MIME_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
