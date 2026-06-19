import { NextResponse } from "next/server";

import { readPlateFormatImageContent } from "@/features/regions/lib/upload-plate-format-image";
import { regionPlateFormatIdSchema } from "@/lib/validations/admin-region-plate-format";
import { regionPlateFormatRepository } from "@/server/repositories/region-plate-format-repository";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { id } = await context.params;
  const idParsed = regionPlateFormatIdSchema.safeParse({ id });

  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid format id" }, { status: 400 });
  }

  const meta = await regionPlateFormatRepository.findPublicImageMeta(idParsed.data.id);

  if (
    !meta?.imageR2Key ||
    !meta.imageMimeType ||
    !meta.region.isActive ||
    meta.region.deletedAt
  ) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const result = await readPlateFormatImageContent(idParsed.data.id);

  if ("error" in result) {
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
