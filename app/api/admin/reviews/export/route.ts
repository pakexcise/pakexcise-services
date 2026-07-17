import { NextResponse } from "next/server";

import { buildReviewsCsv } from "@/features/reviews/admin/lib/reviews-csv";
import { isAuthError } from "@/lib/errors/auth-errors";
import { adminReviewRepository } from "@/server/repositories/admin-review-repository";
import { requirePermission } from "@/server/permissions/guards";
import type { ReviewSource, ReviewStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

function parseStatus(
  value: string | null,
): ReviewStatus | "ALL" | undefined {
  if (!value || value === "ALL") return "ALL";
  if (value === "PENDING" || value === "APPROVED" || value === "REJECTED") {
    return value;
  }
  return undefined;
}

function parseSource(value: string | null): ReviewSource | "ALL" | undefined {
  if (!value || value === "ALL") return "ALL";
  if (value === "MANUAL" || value === "CUSTOMER" || value === "GOOGLE") {
    return value;
  }
  return undefined;
}

function parseRecordType(
  value: string | null,
): "ALL" | "DUMMY" | "REAL" | undefined {
  if (!value || value === "ALL") return "ALL";
  if (value === "DUMMY" || value === "REAL") return value;
  return undefined;
}

export async function GET(request: Request) {
  try {
    await requirePermission("content:manage");
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
  const query = searchParams.get("q")?.trim() || undefined;
  const status = parseStatus(searchParams.get("status")) ?? "ALL";
  const source = parseSource(searchParams.get("source")) ?? "ALL";
  const recordType = parseRecordType(searchParams.get("recordType")) ?? "ALL";

  const rows = await adminReviewRepository.listAll({
    query,
    status,
    source,
    recordType,
  });
  const csv = buildReviewsCsv(rows);
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pakexcise-reviews-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
