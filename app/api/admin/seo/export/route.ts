import { NextResponse } from "next/server";

import {
  buildSeoCsv,
  filterSeoRowsByCategory,
  seoCsvFilename,
  type SeoCsvCategory,
} from "@/features/seo/admin/lib/seo-csv";
import { isAuthError } from "@/lib/errors/auth-errors";
import { adminSeoRepository } from "@/server/repositories/admin-seo-repository";
import { requirePermission } from "@/server/permissions/guards";

export const dynamic = "force-dynamic";

type MissingFilter = "title" | "description" | "h1" | "keywords";

function parseMissing(value: string | null): MissingFilter | undefined {
  if (
    value === "title" ||
    value === "description" ||
    value === "h1" ||
    value === "keywords"
  ) {
    return value;
  }
  return undefined;
}

function parseCategory(value: string | null): SeoCsvCategory {
  if (
    value === "static" ||
    value === "services" ||
    value === "cities" ||
    value === "other" ||
    value === "all"
  ) {
    return value;
  }
  return "all";
}

export async function GET(request: Request) {
  try {
    await requirePermission("platform:manage");
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "UNAUTHORIZED" ? 401 : 403 },
      );
    }
    throw error;
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || undefined;
  const missing = parseMissing(searchParams.get("missing"));
  const category = parseCategory(searchParams.get("category"));

  const allRows = await adminSeoRepository.listAllDetailed({ q, missing });
  const rows = filterSeoRowsByCategory(allRows, category);
  const csv = buildSeoCsv(rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${seoCsvFilename(category)}"`,
      "Cache-Control": "no-store",
    },
  });
}
