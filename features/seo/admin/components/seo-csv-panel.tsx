"use client";

import { useRef, useState, useTransition } from "react";
import { Download, Upload } from "lucide-react";

import {
  confirmSeoCsvImportAction,
  previewSeoCsvAction,
} from "@/features/seo/admin/actions/seo-csv-actions";
import type { SeoCsvCategory } from "@/features/seo/admin/lib/seo-csv-shared";
import type { SeoCsvPreviewStats } from "@/features/seo/admin/lib/seo-csv-shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SeoCsvPanelLabels = {
  title: string;
  description: string;
  exportTitle: string;
  exportDescription: string;
  importTitle: string;
  importDescription: string;
  columnsHint: string;
  updateHint: string;
  chooseFile: string;
  importAction: string;
  previewAction: string;
  previewing: string;
  confirmAction: string;
  confirming: string;
  clearPreview: string;
  previewReady: string;
  importApplied: string;
  noChangesReady: string;
  exportAll: string;
  exportStatic: string;
  exportServices: string;
  exportCities: string;
  exportRegions: string;
  exportBlog: string;
  exportLegal: string;
  noFile: string;
  statsTotal: string;
  statsReady: string;
  statsSkipped: string;
  statsConflicts: string;
  statsMissing: string;
  statsDuplicates: string;
  statsInvalid: string;
  statsChangedFields: string;
  rowLogTitle: string;
};

type SeoCsvPanelProps = {
  labels: SeoCsvPanelLabels;
  exportQuery?: string;
  className?: string;
};

const EXPORT_CATEGORIES: Array<{
  category: SeoCsvCategory;
  labelKey:
    | "exportAll"
    | "exportStatic"
    | "exportServices"
    | "exportCities"
    | "exportRegions"
    | "exportBlog"
    | "exportLegal";
}> = [
  { category: "all", labelKey: "exportAll" },
  { category: "static", labelKey: "exportStatic" },
  { category: "services", labelKey: "exportServices" },
  { category: "cities", labelKey: "exportCities" },
  { category: "regions", labelKey: "exportRegions" },
  { category: "blog", labelKey: "exportBlog" },
  { category: "legal", labelKey: "exportLegal" },
];

function buildExportHref(category: SeoCsvCategory, exportQuery?: string): string {
  const params = new URLSearchParams(exportQuery ?? "");
  if (category !== "all") {
    params.set("category", category);
  } else {
    params.delete("category");
  }
  const query = params.toString();
  return query ? `/api/admin/seo/export?${query}` : "/api/admin/seo/export";
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-background px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function SeoCsvPanel({
  labels,
  exportQuery,
  className,
}: SeoCsvPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<
    (SeoCsvPreviewStats & { fileName: string }) | null
  >(null);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetImportState() {
    setPreview(null);
    setApplied(false);
    setError(null);
  }

  function onPreview() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError(labels.noFile);
      setPreview(null);
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      setError(null);
      setApplied(false);
      const result = await previewSeoCsvAction(formData);
      if (!result.success) {
        setError(result.error);
        setPreview(null);
        return;
      }
      setPreview(result.data);
      setFileName(result.data.fileName);
    });
  }

  function onConfirm() {
    const file = inputRef.current?.files?.[0];
    if (!file || !preview) {
      setError(labels.noFile);
      return;
    }

    if (preview.ready <= 0) {
      setError(labels.noChangesReady);
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      setError(null);
      const result = await confirmSeoCsvImportAction(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }

      setPreview({ ...result.data, fileName: preview.fileName });
      setApplied(result.data.applied);
      if (result.data.applied && inputRef.current) {
        inputRef.current.value = "";
        setFileName(null);
      }
    });
  }

  return (
    <section className={cn("space-y-5 rounded-xl border p-4 md:p-5", className)}>
      <div className="space-y-1">
        <h2 className="text-sm font-semibold">{labels.title}</h2>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
        <p className="text-xs text-muted-foreground">{labels.columnsHint}</p>
        <p className="text-xs text-muted-foreground">{labels.updateHint}</p>
      </div>

      <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
        <div>
          <h3 className="text-sm font-medium">{labels.exportTitle}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {labels.exportDescription}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXPORT_CATEGORIES.map((item) => (
            <Button key={item.category} size="sm" variant="outline" asChild>
              <a href={buildExportHref(item.category, exportQuery)}>
                <Download className="size-3.5" aria-hidden="true" />
                {labels[item.labelKey]}
              </a>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
        <div>
          <h3 className="text-sm font-medium">{labels.importTitle}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {labels.importDescription}
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setFileName(file?.name ?? null);
              resetImportState();
            }}
          />
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onPreview}
              disabled={isPending}
            >
              <Upload className="size-3.5" aria-hidden="true" />
              {isPending && !preview ? labels.previewing : labels.previewAction}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onConfirm}
              disabled={isPending || !preview || preview.ready <= 0 || applied}
            >
              {isPending && preview
                ? labels.confirming
                : labels.confirmAction.replace(
                    "{count}",
                    String(preview?.ready ?? 0),
                  )}
            </Button>
            {preview ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  resetImportState();
                  if (inputRef.current) inputRef.current.value = "";
                  setFileName(null);
                }}
                disabled={isPending}
              >
                {labels.clearPreview}
              </Button>
            ) : null}
          </div>
        </div>

        {fileName ? (
          <p className="text-xs text-muted-foreground">
            {labels.chooseFile}: {fileName}
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {preview ? (
          <div className="space-y-4 rounded-lg border bg-background p-4">
            <p className="text-sm font-medium text-primary">
              {applied ? labels.importApplied : labels.previewReady}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatCard label={labels.statsTotal} value={preview.total} />
              <StatCard label={labels.statsReady} value={preview.ready} />
              <StatCard label={labels.statsSkipped} value={preview.skipped} />
              <StatCard label={labels.statsConflicts} value={preview.conflicts} />
              <StatCard label={labels.statsMissing} value={preview.missing} />
              <StatCard label={labels.statsDuplicates} value={preview.duplicates} />
              <StatCard label={labels.statsInvalid} value={preview.invalid} />
              <StatCard
                label={labels.statsChangedFields}
                value={preview.changedFields}
              />
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {labels.rowLogTitle}
              </h4>
              <ul className="max-h-56 space-y-1 overflow-y-auto text-sm text-muted-foreground">
                {preview.rows.map((row) => (
                  <li key={`${row.rowNumber}-${row.id || "invalid"}`}>
                    • Row {row.rowNumber}
                    {row.label ? ` — ${row.label}` : ""} — {row.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
