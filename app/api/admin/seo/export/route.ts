import { NextResponse } from "next/server";

import { buildSeoCsv } from "@/features/seo/admin/lib/seo-csv";
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

  const rows = await adminSeoRepository.listAllDetailed({ q, missing });
  const csv = buildSeoCsv(rows);
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pakexcise-seo-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
