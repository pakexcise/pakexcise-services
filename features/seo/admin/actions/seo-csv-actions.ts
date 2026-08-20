"use server";

import {
  analyzeSeoCsvText,
  importSeoCsvText,
} from "@/features/seo/admin/lib/seo-csv-import";
import type {
  SeoCsvCategory,
  SeoCsvPreviewStats,
} from "@/features/seo/admin/lib/seo-csv-shared";
import {
  errorResult,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { requirePermission } from "@/server/permissions/guards";

const MAX_CSV_BYTES = 5 * 1024 * 1024;

const CATEGORIES = new Set<Exclude<SeoCsvCategory, "all">>([
  "static",
  "services",
  "cities",
  "regions",
  "blog",
  "legal",
]);

function parseCategory(
  value: FormDataEntryValue | null,
): Exclude<SeoCsvCategory, "all"> | null {
  if (typeof value !== "string") return null;
  if (!CATEGORIES.has(value as Exclude<SeoCsvCategory, "all">)) return null;
  return value as Exclude<SeoCsvCategory, "all">;
}

async function readCsvFile(formData: FormData): Promise<ActionResult<string>> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return errorResult("Choose a CSV file to import.");
  }

  if (file.size <= 0) {
    return errorResult("The CSV file is empty.");
  }

  if (file.size > MAX_CSV_BYTES) {
    return errorResult("CSV file is too large (max 5 MB).");
  }

  const name = file.name.toLowerCase();
  if (
    !name.endsWith(".csv") &&
    file.type !== "text/csv" &&
    file.type !== "application/vnd.ms-excel"
  ) {
    return errorResult("Upload a .csv file.");
  }

  try {
    return successResult(await file.text());
  } catch {
    return errorResult("Could not read the CSV file.");
  }
}

export async function previewSeoCsvAction(
  formData: FormData,
): Promise<ActionResult<SeoCsvPreviewStats & { fileName: string; category: string }>> {
  await requirePermission("platform:manage");

  const category = parseCategory(formData.get("category"));
  if (!category) {
    return errorResult("Choose a valid SEO category for this import.");
  }

  const file = formData.get("file");
  const fileName = file instanceof File ? file.name : "import.csv";
  const csv = await readCsvFile(formData);
  if (!csv.success) return csv;

  try {
    const preview = await analyzeSeoCsvText(csv.data, category);
    return successResult({ ...preview, fileName, category });
  } catch (error) {
    return errorResult(
      error instanceof Error ? error.message : "CSV preview failed.",
    );
  }
}

export async function confirmSeoCsvImportAction(
  formData: FormData,
): Promise<
  ActionResult<SeoCsvPreviewStats & { applied: boolean; category: string }>
> {
  const user = await requirePermission("platform:manage");
  const category = parseCategory(formData.get("category"));
  if (!category) {
    return errorResult("Choose a valid SEO category for this import.");
  }

  const csv = await readCsvFile(formData);
  if (!csv.success) return csv;

  try {
    const result = await importSeoCsvText({
      csvText: csv.data,
      actorId: user.id,
      expectedCategory: category,
    });

    await auditAdminAction({
      actorId: user.id,
      action: "UPDATE",
      entityType: "seo_meta",
      entityId: `csv-import:${category}`,
      after: {
        category,
        total: result.total,
        ready: result.ready,
        skipped: result.skipped,
        conflicts: result.conflicts,
        missing: result.missing,
        duplicates: result.duplicates,
        invalid: result.invalid,
        changedFields: result.changedFields,
        applied: result.applied,
      },
    });

    return successResult({ ...result, category });
  } catch (error) {
    return errorResult(
      error instanceof Error ? error.message : "CSV import failed.",
    );
  }
}
