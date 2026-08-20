"use server";

import { importSeoCsvText } from "@/features/seo/admin/lib/seo-csv-import";
import {
  errorResult,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { requirePermission } from "@/server/permissions/guards";

const MAX_CSV_BYTES = 5 * 1024 * 1024;

export async function importSeoCsvAction(
  formData: FormData,
): Promise<
  ActionResult<{
    total: number;
    updated: number;
    unchanged: number;
    skipped: number;
    errors: string[];
  }>
> {
  const user = await requirePermission("platform:manage");
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
  if (!name.endsWith(".csv") && file.type !== "text/csv" && file.type !== "application/vnd.ms-excel") {
    return errorResult("Upload a .csv file.");
  }

  let csvText: string;
  try {
    csvText = await file.text();
  } catch {
    return errorResult("Could not read the CSV file.");
  }

  try {
    const result = await importSeoCsvText({
      csvText,
      actorId: user.id,
    });

    await auditAdminAction({
      actorId: user.id,
      action: "UPDATE",
      entityType: "seo_meta",
      entityId: "csv-import",
      after: {
        total: result.total,
        updated: result.updated,
        unchanged: result.unchanged,
        skipped: result.skipped,
        errorCount: result.errors.length,
      },
    });

    return successResult(result);
  } catch (error) {
    return errorResult(
      error instanceof Error ? error.message : "CSV import failed.",
    );
  }
}
