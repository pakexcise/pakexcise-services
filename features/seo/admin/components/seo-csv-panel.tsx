"use client";

import { useRef, useState, useTransition } from "react";
import { Download, Upload } from "lucide-react";

import {
  confirmSeoCsvImportAction,
  previewSeoCsvAction,
} from "@/features/seo/admin/actions/seo-csv-actions";
import {
  SEO_CSV_HEADERS,
  type SeoCsvCategory,
  type SeoCsvPreviewStats,
} from "@/features/seo/admin/lib/seo-csv-shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CategoryKey = Exclude<SeoCsvCategory, "all">;

type SeoCsvPanelLabels = {
  title: string;
  description: string;
  columnsHint: string;
  updateHint: string;
  exportAction: string;
  importAction: string;
  previewing: string;
  confirmAction: string;
  confirming: string;
  clearPreview: string;
  previewReady: string;
  importApplied: string;
  noChangesReady: string;
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
  categories: Record<
    CategoryKey,
    {
      title: string;
      description: string;
    }
  >;
};

type SeoCsvPanelProps = {
  labels: SeoCsvPanelLabels;
  exportQuery?: string;
  className?: string;
};

type CategoryImportState = {
  file: File | null;
  fileName: string | null;
  preview: (SeoCsvPreviewStats & { fileName: string }) | null;
  applied: boolean;
  error: string | null;
};

const CATEGORY_ORDER: CategoryKey[] = [
  "static",
  "services",
  "cities",
  "regions",
  "blog",
  "legal",
];

function buildExportHref(category: CategoryKey, exportQuery?: string): string {
  const params = new URLSearchParams(exportQuery ?? "");
  params.set("category", category);
  return `/api/admin/seo/export?${params.toString()}`;
}

function emptyState(): CategoryImportState {
  return {
    file: null,
    fileName: null,
    preview: null,
    applied: false,
    error: null,
  };
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

function CategoryCard({
  category,
  labels,
  exportQuery,
}: {
  category: CategoryKey;
  labels: SeoCsvPanelLabels;
  exportQuery?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<CategoryImportState>(emptyState);
  const [isPending, startTransition] = useTransition();
  const meta = labels.categories[category];

  function runPreview(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("category", category);

    startTransition(async () => {
      setState((prev) => ({
        ...prev,
        error: null,
        applied: false,
      }));

      const result = await previewSeoCsvAction(formData);
      if (!result.success) {
        setState((prev) => ({
          ...prev,
          preview: null,
          error: result.error,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        file,
        fileName: result.data.fileName,
        preview: result.data,
        error: null,
        applied: false,
      }));
    });
  }

  function onConfirm() {
    if (!state.file || !state.preview) {
      setState((prev) => ({ ...prev, error: labels.noFile }));
      return;
    }
    if (state.preview.ready <= 0) {
      setState((prev) => ({ ...prev, error: labels.noChangesReady }));
      return;
    }

    const formData = new FormData();
    formData.set("file", state.file);
    formData.set("category", category);

    startTransition(async () => {
      setState((prev) => ({ ...prev, error: null }));
      const result = await confirmSeoCsvImportAction(formData);
      if (!result.success) {
        setState((prev) => ({ ...prev, error: result.error }));
        return;
      }

      setState((prev) => ({
        ...prev,
        preview: {
          ...result.data,
          fileName: prev.fileName ?? result.data.category,
        },
        applied: result.data.applied,
        file: result.data.applied ? null : prev.file,
        fileName: result.data.applied ? null : prev.fileName,
      }));

      if (result.data.applied && inputRef.current) {
        inputRef.current.value = "";
      }
    });
  }

  return (
    <article className="space-y-4 rounded-xl border bg-card p-4 shadow-sm md:p-5">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{meta.title}</h3>
        <p className="text-sm text-muted-foreground">{meta.description}</p>
        <p className="text-xs text-muted-foreground">
          {labels.columnsHint}: {SEO_CSV_HEADERS.join(", ")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" asChild>
          <a href={buildExportHref(category, exportQuery)}>
            <Download className="size-3.5" aria-hidden="true" />
            {labels.exportAction}
          </a>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-3.5" aria-hidden="true" />
          {isPending && !state.preview ? labels.previewing : labels.importAction}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onConfirm}
          disabled={
            isPending || !state.preview || state.preview.ready <= 0 || state.applied
          }
        >
          {isPending && state.preview
            ? labels.confirming
            : labels.confirmAction.replace(
                "{count}",
                String(state.preview?.ready ?? 0),
              )}
        </Button>
        {state.preview ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isPending}
            onClick={() => {
              setState(emptyState());
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            {labels.clearPreview}
          </Button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          if (!file) {
            setState(emptyState());
            return;
          }
          setState({
            file,
            fileName: file.name,
            preview: null,
            applied: false,
            error: null,
          });
          runPreview(file);
        }}
      />

      {state.fileName ? (
        <p className="text-xs text-muted-foreground">{state.fileName}</p>
      ) : null}

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.preview ? (
        <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
          <p className="text-sm font-medium text-primary">
            {state.applied ? labels.importApplied : labels.previewReady}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatCard label={labels.statsTotal} value={state.preview.total} />
            <StatCard label={labels.statsReady} value={state.preview.ready} />
            <StatCard label={labels.statsSkipped} value={state.preview.skipped} />
            <StatCard
              label={labels.statsConflicts}
              value={state.preview.conflicts}
            />
            <StatCard label={labels.statsMissing} value={state.preview.missing} />
            <StatCard
              label={labels.statsDuplicates}
              value={state.preview.duplicates}
            />
            <StatCard label={labels.statsInvalid} value={state.preview.invalid} />
            <StatCard
              label={labels.statsChangedFields}
              value={state.preview.changedFields}
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {labels.rowLogTitle}
            </h4>
            <ul className="max-h-48 space-y-1 overflow-y-auto text-sm text-muted-foreground">
              {state.preview.rows.map((row) => (
                <li key={`${category}-${row.rowNumber}-${row.id || "invalid"}`}>
                  • Row {row.rowNumber}
                  {row.label ? ` — ${row.label}` : ""} — {row.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function SeoCsvPanel({
  labels,
  exportQuery,
  className,
}: SeoCsvPanelProps) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="space-y-1">
        <h2 className="text-sm font-semibold">{labels.title}</h2>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
        <p className="text-xs text-muted-foreground">{labels.updateHint}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {CATEGORY_ORDER.map((category) => (
          <CategoryCard
            key={category}
            category={category}
            labels={labels}
            exportQuery={exportQuery}
          />
        ))}
      </div>
    </section>
  );
}
