"use client";

import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  PAYMENT_METHOD_QR_MAX_BYTES,
  PAYMENT_METHOD_QR_MIME_TYPES,
} from "@/config/uploads";
import {
  validateClientUpload,
} from "@/features/applications/lib/validate-upload";
import { resolveClientFileMimeType } from "@/lib/utils/resolve-file-mime";

type PaymentMethodQrFieldProps = {
  paymentMethodId: string;
  hasQr: boolean;
  labels: {
    title: string;
    hint: string;
    upload: string;
    uploading: string;
    remove: string;
    removing: string;
    scanHint: string;
    saveFirst: string;
    uploadFailed: string;
    invalidType: string;
    tooLarge: string;
    invalidName: string;
    maxSize: string;
  };
};

export function PaymentMethodQrField({
  paymentMethodId,
  hasQr,
  labels,
}: PaymentMethodQrFieldProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [previewVersion, setPreviewVersion] = useState(0);
  const [qrPresent, setQrPresent] = useState(hasQr);

  useEffect(() => {
    setQrPresent(hasQr);
  }, [hasQr, paymentMethodId]);

  const previewUrl = qrPresent
    ? `/api/admin/payment-methods/${paymentMethodId}/qr-content?v=${previewVersion}`
    : null;

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
      acceptedMimeTypes: [...PAYMENT_METHOD_QR_MIME_TYPES],
      maxSizeBytes: PAYMENT_METHOD_QR_MAX_BYTES,
      invalidTypeMessage: labels.invalidType,
      tooLargeMessage: labels.tooLarge,
      invalidNameMessage: labels.invalidName,
    });

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    const resolvedMimeType = resolveClientFileMimeType(file, [
      ...PAYMENT_METHOD_QR_MIME_TYPES,
    ]);

    if (!resolvedMimeType) {
      setError(labels.invalidType);
      return;
    }

    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(
          `/api/admin/payment-methods/${paymentMethodId}/qr-upload`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          },
        );

        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          setError(data.error ?? labels.uploadFailed);
          return;
        }

        setQrPresent(true);
        setPreviewVersion((current) => current + 1);
        router.refresh();
      } catch {
        setError(labels.uploadFailed);
      }
    });
  }

  function handleRemove() {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/payment-methods/${paymentMethodId}/qr-upload`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          setError(data.error ?? labels.uploadFailed);
          return;
        }

        setQrPresent(false);
        setPreviewVersion((current) => current + 1);
        router.refresh();
      } catch {
        setError(labels.uploadFailed);
      }
    });
  }

  return (
    <div className="space-y-3 md:col-span-2">
      <div>
        <Label>{labels.title}</Label>
        <p className="mt-1 text-xs text-muted-foreground">{labels.hint}</p>
        <p className="mt-1 text-xs text-muted-foreground">{labels.maxSize}</p>
      </div>

      {previewUrl ? (
        <div className="rounded-xl border bg-muted/20 p-4">
          <p className="mb-3 text-xs text-muted-foreground">{labels.scanHint}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className="mx-auto max-h-80 w-auto max-w-full object-contain"
            width={512}
            height={512}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          <ImageIcon className="size-5 shrink-0" aria-hidden="true" />
          <span>{labels.upload}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
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
          {isPending ? labels.uploading : labels.upload}
        </Button>

        {qrPresent ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemove}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {isPending ? labels.removing : labels.remove}
          </Button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={PAYMENT_METHOD_QR_MIME_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function PaymentMethodQrSaveFirstHint({
  labels,
}: {
  labels: { saveFirst: string };
}) {
  return (
    <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground md:col-span-2">
      {labels.saveFirst}
    </div>
  );
}
