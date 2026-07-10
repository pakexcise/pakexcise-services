import { NextResponse } from "next/server";

import { readBlogImageContent } from "@/features/blog/lib/upload-blog-image";

type RouteContext = {
  params: Promise<{ filename: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { filename } = await context.params;
  const result = await readBlogImageContent(filename);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return new NextResponse(new Uint8Array(result.body), {
    status: 200,
    headers: {
      "Content-Type": result.mimeType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "Content-Disposition": "inline",
    },
  });
}
