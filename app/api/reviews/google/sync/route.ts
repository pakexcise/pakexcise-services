import { NextResponse } from "next/server";

import { syncGoogleBusinessReviews } from "@/features/reviews/google/sync-google-reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.GOOGLE_REVIEW_SYNC_SECRET?.trim();

  if (!secret) {
    return process.env.NODE_ENV === "development";
  }

  const header = request.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const query = new URL(request.url).searchParams.get("secret");

  return bearer === secret || query === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncGoogleBusinessReviews();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Google sync failed",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}
