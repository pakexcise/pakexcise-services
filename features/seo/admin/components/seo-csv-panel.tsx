"use client";

import { useRef, useState, useTransition } from "react";
import { Download, Upload } from "lucide-react";

import { importSeoCsvAction } from "@/features/seo/admin/actions/seo-csv-actions";
import type { SeoCsvCategory } from "@/features/seo/admin/lib/seo-csv-shared";
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
  importing: string;
  exportAll: string;
  exportStatic: string;
  exportServices: string;
  exportCities: string;
  exportOther: string;
  successSummary: string;
  noFile: string;
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
    | "exportOther";
}> = [
  { category: "all", labelKey: "exportAll" },
  { category: "static", labelKey: "exportStatic" },
  { category: "services", labelKey: "exportServices" },
  { category: "cities", labelKey: "exportCities" },
  { category: "other", labelKey: "exportOther" },
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

export function SeoCsvPanel({
  labels,
  exportQuery,
  className,
}: SeoCsvPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onImport() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError(labels.noFile);
      setMessage(null);
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      setError(null);
      setMessage(null);
      const result = await importSeoCsvAction(formData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      const summary = labels.successSummary
        .replace("{total}", String(result.data.total))
        .replace("{updated}", String(result.data.updated))
        .replace("{unchanged}", String(result.data.unchanged))
        .replace("{skipped}", String(result.data.skipped));

      const detail =
        result.data.errors.length > 0
          ? `\n${result.data.errors.slice(0, 8).join("\n")}`
          : "";

      setMessage(`${summary}${detail}`);
      setFileName(null);
      if (inputRef.current) {
        inputRef.current.value = "";
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setFileName(file?.name ?? null);
              setError(null);
              setMessage(null);
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={onImport}
            disabled={isPending}
            className="shrink-0"
          >
            <Upload className="size-3.5" aria-hidden="true" />
            {isPending ? labels.importing : labels.importAction}
          </Button>
        </div>
        {fileName ? (
          <p className="text-xs text-muted-foreground">
            {labels.chooseFile}: {fileName}
          </p>
        ) : null}
        {error ? (
          <p className="whitespace-pre-wrap text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="whitespace-pre-wrap text-sm text-emerald-700 dark:text-emerald-400">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
