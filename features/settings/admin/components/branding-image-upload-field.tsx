"use client";

import { ImageIcon, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BRANDING_IMAGE_MAX_BYTES,
  BRANDING_IMAGE_MIME_TYPES,
} from "@/config/uploads";
import { validateClientUpload } from "@/features/applications/lib/validate-upload";
import { resolveBrandingImageSrc } from "@/features/settings/lib/branding-image-paths";
import { resolveClientFileMimeType } from "@/lib/utils/resolve-file-mime";
import { cn } from "@/lib/utils";

type BrandingImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (path: string) => void;
  uploadLabel: string;
  uploadingLabel: string;
  hint: string;
  previewAlt: string;
  uploadErrorLabel: string;
  invalidTypeLabel: string;
  tooLargeLabel: string;
  invalidNameLabel: string;
  unresolvedPreviewLabel: string;
  previewClassName?: string;
};

export function BrandingImageUploadField({
  label,
  value,
  onChange,
  uploadLabel,
  uploadingLabel,
  hint,
  previewAlt,
  uploadErrorLabel,
  invalidTypeLabel,
  tooLargeLabel,
  invalidNameLabel,
  unresolvedPreviewLabel,
  previewClassName,
}: BrandingImageUploadFieldProps) {
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
      acceptedMimeTypes: [...BRANDING_IMAGE_MIME_TYPES],
      maxSizeBytes: BRANDING_IMAGE_MAX_BYTES,
      invalidTypeMessage: invalidTypeLabel,
      tooLargeMessage: tooLargeLabel,
      invalidNameMessage: invalidNameLabel,
    });

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    const resolvedMimeType = resolveClientFileMimeType(file, [
      ...BRANDING_IMAGE_MIME_TYPES,
    ]);

    if (!resolvedMimeType) {
      setError(invalidTypeLabel);
      return;
    }

    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/admin/branding/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const data = (await response.json()) as { path?: string; error?: string };

        if (!response.ok || !data.path) {
          setError(data.error ?? uploadErrorLabel);
          return;
        }

        onChange(data.path);
      } catch {
        setError(uploadErrorLabel);
      }
    });
  }

  const previewSrc = resolveBrandingImageSrc(value);

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/branding/logo.png"
          className="min-w-0 flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handlePickFile}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {isPending ? uploadingLabel : uploadLabel}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {previewSrc ? (
        <div
          className={cn(
            "relative flex h-24 max-w-md items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/40",
            previewClassName,
          )}
        >
          <Image
            src={previewSrc}
            alt={previewAlt}
            width={320}
            height={96}
            unoptimized
            className="max-h-20 w-auto object-contain p-2"
          />
        </div>
      ) : value ? (
        <p className="text-sm text-destructive">{unresolvedPreviewLabel}</p>
      ) : (
        <div className="flex max-w-md items-center justify-center rounded-xl border border-dashed bg-muted/10 p-8 text-muted-foreground">
          <ImageIcon className="size-8" aria-hidden="true" />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={BRANDING_IMAGE_MIME_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
