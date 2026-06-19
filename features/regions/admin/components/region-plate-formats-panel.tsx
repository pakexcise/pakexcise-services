"use client";

import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { useMemo, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteRegionNumberPlateFormatAction,
  upsertRegionNumberPlateFormatAction,
  upsertRegionPlateFormatSectionAction,
} from "@/features/regions/admin/actions/region-plate-format-actions";
import { getPublicPlateFormatImagePath } from "@/features/regions/lib/plate-format-image-paths";
import { VEHICLE_PLATE_TYPES } from "@/features/regions/lib/vehicle-plate-types";
import type {
  AdminRegionNumberPlateFormat,
  AdminRegionPlateFormatSection,
} from "@/server/repositories/admin-region-plate-format-repository";

type RegionPlateFormatsPanelProps = {
  regionId: string;
  regionName: string;
  section: AdminRegionPlateFormatSection | null;
  formats: AdminRegionNumberPlateFormat[];
  schemaReady: boolean;
  labels: Record<string, string>;
};

type SectionDraft = {
  sectionTitleEn: string;
  sectionTitleUr: string;
  sectionDescEn: string;
  sectionDescUr: string;
  faqJson: string;
  isActive: boolean;
  showOnRegionPage: boolean;
};

type FormatDraft = {
  id?: string;
  vehicleType: AdminRegionNumberPlateFormat["vehicleType"];
  titleEn: string;
  titleUr: string;
  formatsText: string;
  descriptionEn: string;
  descriptionUr: string;
  relatedServiceSlugsText: string;
  imageAltEn: string;
  imageAltUr: string;
  imageCaptionEn: string;
  imageCaptionUr: string;
  isActive: boolean;
  isFeatured: boolean;
  showOnRegionPage: boolean;
  displayOrder: number;
};

function formatsToText(formatsJson: unknown): string {
  if (!Array.isArray(formatsJson)) {
    return "";
  }

  return formatsJson
    .filter((item): item is string => typeof item === "string")
    .join("\n");
}

function slugsToText(value: unknown): string {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .join(", ");
}

function parseLines(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function emptyFormatDraft(displayOrder: number): FormatDraft {
  return {
    vehicleType: "CAR",
    titleEn: "",
    titleUr: "",
    formatsText: "",
    descriptionEn: "",
    descriptionUr: "",
    relatedServiceSlugsText: "",
    imageAltEn: "",
    imageAltUr: "",
    imageCaptionEn: "",
    imageCaptionUr: "",
    isActive: true,
    isFeatured: false,
    showOnRegionPage: true,
    displayOrder,
  };
}

function sectionToDraft(section: AdminRegionPlateFormatSection | null): SectionDraft {
  return {
    sectionTitleEn: section?.sectionTitleEn ?? "",
    sectionTitleUr: section?.sectionTitleUr ?? "",
    sectionDescEn: section?.sectionDescEn ?? "",
    sectionDescUr: section?.sectionDescUr ?? "",
    faqJson: section?.faqJson ? JSON.stringify(section.faqJson, null, 2) : "",
    isActive: section?.isActive ?? true,
    showOnRegionPage: section?.showOnRegionPage ?? true,
  };
}

function formatToDraft(format: AdminRegionNumberPlateFormat): FormatDraft {
  return {
    id: format.id,
    vehicleType: format.vehicleType,
    titleEn: format.titleEn,
    titleUr: format.titleUr,
    formatsText: formatsToText(format.formatsJson),
    descriptionEn: format.descriptionEn ?? "",
    descriptionUr: format.descriptionUr ?? "",
    relatedServiceSlugsText: slugsToText(format.relatedServiceSlugs),
    imageAltEn: format.imageAltEn ?? "",
    imageAltUr: format.imageAltUr ?? "",
    imageCaptionEn: format.imageCaptionEn ?? "",
    imageCaptionUr: format.imageCaptionUr ?? "",
    isActive: format.isActive,
    isFeatured: format.isFeatured,
    showOnRegionPage: format.showOnRegionPage,
    displayOrder: format.displayOrder,
  };
}

export function RegionPlateFormatsPanel({
  regionId,
  regionName,
  section,
  formats,
  schemaReady,
  labels,
}: RegionPlateFormatsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sectionDraft, setSectionDraft] = useState<SectionDraft>(() =>
    sectionToDraft(section),
  );
  const [formatDraft, setFormatDraft] = useState<FormatDraft>(() =>
    emptyFormatDraft(formats.length + 1),
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  const vehicleTypeOptions = useMemo(
    () =>
      VEHICLE_PLATE_TYPES.map((type) => ({
        value: type,
        label: labels[`vehicleType.${type}`] ?? type,
      })),
    [labels],
  );

  function handleSaveSection() {
    startTransition(async () => {
      let faqJson: unknown = null;

      if (sectionDraft.faqJson.trim()) {
        try {
          faqJson = JSON.parse(sectionDraft.faqJson);
        } catch {
          setError(labels.invalidFaqJson ?? "Invalid FAQ JSON");
          return;
        }
      }

      const result = await upsertRegionPlateFormatSectionAction({
        regionId,
        sectionTitleEn: sectionDraft.sectionTitleEn || null,
        sectionTitleUr: sectionDraft.sectionTitleUr || null,
        sectionDescEn: sectionDraft.sectionDescEn || null,
        sectionDescUr: sectionDraft.sectionDescUr || null,
        faqJson,
        isActive: sectionDraft.isActive,
        showOnRegionPage: sectionDraft.showOnRegionPage,
      });

      if (!result.success) {
        setError(result.error ?? labels.saveFailed ?? "Save failed");
        return;
      }

      setError(null);
      router.refresh();
    });
  }

  function handleSaveFormat() {
    startTransition(async () => {
      const formatsList = parseLines(formatDraft.formatsText);

      if (formatsList.length === 0) {
        setError(labels.formatsRequired ?? "Add at least one format.");
        return;
      }

      const result = await upsertRegionNumberPlateFormatAction({
        id: formatDraft.id,
        regionId,
        vehicleType: formatDraft.vehicleType,
        titleEn: formatDraft.titleEn,
        titleUr: formatDraft.titleUr,
        formats: formatsList,
        descriptionEn: formatDraft.descriptionEn || null,
        descriptionUr: formatDraft.descriptionUr || null,
        relatedServiceSlugs: parseLines(formatDraft.relatedServiceSlugsText),
        imageAltEn: formatDraft.imageAltEn || null,
        imageAltUr: formatDraft.imageAltUr || null,
        imageCaptionEn: formatDraft.imageCaptionEn || null,
        imageCaptionUr: formatDraft.imageCaptionUr || null,
        isActive: formatDraft.isActive,
        isFeatured: formatDraft.isFeatured,
        showOnRegionPage: formatDraft.showOnRegionPage,
        displayOrder: formatDraft.displayOrder,
      });

      if (!result.success) {
        setError(result.error ?? labels.saveFailed ?? "Save failed");
        return;
      }

      setFormatDraft((current) => ({ ...current, id: result.data.id }));
      setError(null);
      router.refresh();
    });
  }

  function handleDeleteFormat(id: string) {
    if (!window.confirm(labels.confirmDelete)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteRegionNumberPlateFormatAction({ id });
      if (!result.success) {
        setError(result.error ?? labels.deleteFailed ?? "Delete failed");
        return;
      }

      setFormatDraft(emptyFormatDraft(formats.length));
      setError(null);
      router.refresh();
    });
  }

  async function handleImageUpload(file: File) {
    if (!formatDraft.id) {
      setError(labels.saveBeforeUpload ?? "Save the card before uploading.");
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/admin/regions/plate-formats/${formatDraft.id}/image-upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? labels.uploadFailed ?? "Upload failed");
        return;
      }

      router.refresh();
    } catch {
      setError(labels.uploadFailed ?? "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleRemoveImage() {
    if (!formatDraft.id) {
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/regions/plate-formats/${formatDraft.id}/image-upload`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? labels.uploadFailed ?? "Upload failed");
        return;
      }

      router.refresh();
    } catch {
      setError(labels.uploadFailed ?? "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  const selectedFormat = formatDraft.id
    ? formats.find((item) => item.id === formatDraft.id)
    : null;

  return (
    <div className="space-y-6 rounded-xl border p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{labels.title}</h2>
        <p className="text-sm text-muted-foreground">
          {labels.description?.replace("__REGION__", regionName) ??
            regionName}
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {!schemaReady ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100" role="status">
          {labels.schemaNotReady}
        </p>
      ) : null}

      <fieldset
        className="space-y-6"
        disabled={!schemaReady || isPending || uploadingImage}
      >
      <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
        <h3 className="font-medium">{labels.sectionSettings}</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{labels.sectionTitleEn}</Label>
            <Input
              value={sectionDraft.sectionTitleEn}
              onChange={(event) =>
                setSectionDraft((current) => ({
                  ...current,
                  sectionTitleEn: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.sectionTitleUr}</Label>
            <Input
              value={sectionDraft.sectionTitleUr}
              onChange={(event) =>
                setSectionDraft((current) => ({
                  ...current,
                  sectionTitleUr: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{labels.sectionDescEn}</Label>
            <Textarea
              rows={3}
              value={sectionDraft.sectionDescEn}
              onChange={(event) =>
                setSectionDraft((current) => ({
                  ...current,
                  sectionDescEn: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{labels.sectionDescUr}</Label>
            <Textarea
              rows={3}
              value={sectionDraft.sectionDescUr}
              onChange={(event) =>
                setSectionDraft((current) => ({
                  ...current,
                  sectionDescUr: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{labels.faqJson}</Label>
            <Textarea
              rows={4}
              value={sectionDraft.faqJson}
              onChange={(event) =>
                setSectionDraft((current) => ({
                  ...current,
                  faqJson: event.target.value,
                }))
              }
              placeholder={labels.faqJsonPlaceholder}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sectionDraft.isActive}
              onChange={(event) =>
                setSectionDraft((current) => ({
                  ...current,
                  isActive: event.target.checked,
                }))
              }
            />
            {labels.isActive}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sectionDraft.showOnRegionPage}
              onChange={(event) =>
                setSectionDraft((current) => ({
                  ...current,
                  showOnRegionPage: event.target.checked,
                }))
              }
            />
            {labels.showOnRegionPage}
          </label>
        </div>
        <Button type="button" onClick={handleSaveSection} disabled={isPending}>
          {isPending ? labels.saving : labels.saveSection}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-medium">{labels.formatsList}</h3>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setFormatDraft(emptyFormatDraft(formats.length + 1))}
          >
            {labels.addFormat}
          </Button>
        </div>

        {formats.length === 0 ? (
          <p className="text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          <div className="space-y-2">
            {formats.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.titleEn}</p>
                    <Badge variant="outline">
                      {labels[`vehicleType.${item.vehicleType}`] ?? item.vehicleType}
                    </Badge>
                    {!item.isActive ? (
                      <Badge variant="secondary">{labels.inactive}</Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatsToText(item.formatsJson).replace(/\n/g, ", ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setFormatDraft(formatToDraft(item))}
                  >
                    {labels.edit}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteFormat(item.id)}
                    disabled={isPending}
                  >
                    {labels.delete}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="font-medium">
          {formatDraft.id ? labels.editFormat : labels.newFormat}
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{labels.vehicleType}</Label>
            <select
              value={formatDraft.vehicleType}
              onChange={(event) =>
                setFormatDraft((current) => ({
                  ...current,
                  vehicleType: event.target.value as FormatDraft["vehicleType"],
                }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {vehicleTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>{labels.displayOrder}</Label>
            <Input
              type="number"
              min={0}
              value={formatDraft.displayOrder}
              onChange={(event) =>
                setFormatDraft((current) => ({
                  ...current,
                  displayOrder: Number(event.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.titleEn}</Label>
            <Input
              value={formatDraft.titleEn}
              onChange={(event) =>
                setFormatDraft((current) => ({
                  ...current,
                  titleEn: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.titleUr}</Label>
            <Input
              value={formatDraft.titleUr}
              onChange={(event) =>
                setFormatDraft((current) => ({
                  ...current,
                  titleUr: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{labels.formats}</Label>
            <Textarea
              rows={4}
              value={formatDraft.formatsText}
              onChange={(event) =>
                setFormatDraft((current) => ({
                  ...current,
                  formatsText: event.target.value,
                }))
              }
              placeholder={labels.formatsPlaceholder}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{labels.descriptionEn}</Label>
            <Textarea
              rows={3}
              value={formatDraft.descriptionEn}
              onChange={(event) =>
                setFormatDraft((current) => ({
                  ...current,
                  descriptionEn: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{labels.descriptionUr}</Label>
            <Textarea
              rows={3}
              value={formatDraft.descriptionUr}
              onChange={(event) =>
                setFormatDraft((current) => ({
                  ...current,
                  descriptionUr: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{labels.relatedServiceSlugs}</Label>
            <Input
              value={formatDraft.relatedServiceSlugsText}
              onChange={(event) =>
                setFormatDraft((current) => ({
                  ...current,
                  relatedServiceSlugsText: event.target.value,
                }))
              }
              placeholder={labels.relatedServiceSlugsPlaceholder}
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.imageAltEn}</Label>
            <Input
              value={formatDraft.imageAltEn}
              onChange={(event) =>
                setFormatDraft((current) => ({
                  ...current,
                  imageAltEn: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.imageAltUr}</Label>
            <Input
              value={formatDraft.imageAltUr}
              onChange={(event) =>
                setFormatDraft((current) => ({
                  ...current,
                  imageAltUr: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.imageCaptionEn}</Label>
            <Input
              value={formatDraft.imageCaptionEn}
              onChange={(event) =>
                setFormatDraft((current) => ({
                  ...current,
                  imageCaptionEn: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.imageCaptionUr}</Label>
            <Input
              value={formatDraft.imageCaptionUr}
              onChange={(event) =>
                setFormatDraft((current) => ({
                  ...current,
                  imageCaptionUr: event.target.value,
                }))
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formatDraft.isActive}
              onChange={(event) =>
                setFormatDraft((current) => ({
                  ...current,
                  isActive: event.target.checked,
                }))
              }
            />
            {labels.isActive}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formatDraft.isFeatured}
              onChange={(event) =>
                setFormatDraft((current) => ({
                  ...current,
                  isFeatured: event.target.checked,
                }))
              }
            />
            {labels.isFeatured}
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={formatDraft.showOnRegionPage}
              onChange={(event) =>
                setFormatDraft((current) => ({
                  ...current,
                  showOnRegionPage: event.target.checked,
                }))
              }
            />
            {labels.showOnRegionPage}
          </label>
        </div>

        <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
          <Label>{labels.imageUpload}</Label>
          {selectedFormat?.imageR2Key && formatDraft.id ? (
            <div className="relative aspect-[2/1] max-w-md overflow-hidden rounded-md border bg-background">
              <Image
                src={getPublicPlateFormatImagePath(formatDraft.id)}
                alt={formatDraft.imageAltEn || formatDraft.titleEn}
                fill
                className="object-contain p-2"
                sizes="400px"
              />
            </div>
          ) : null}
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={uploadingImage || isPending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleImageUpload(file);
              }
              event.target.value = "";
            }}
          />
          {selectedFormat?.imageR2Key ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploadingImage || isPending}
              onClick={() => void handleRemoveImage()}
            >
              {labels.removeImage}
            </Button>
          ) : null}
          <p className="text-xs text-muted-foreground">{labels.imageHint}</p>
        </div>

        <Button type="button" onClick={handleSaveFormat} disabled={isPending}>
          {isPending ? labels.saving : labels.saveFormat}
        </Button>
      </div>
      </fieldset>
    </div>
  );
}
