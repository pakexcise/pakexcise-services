export const DEFAULT_HOME_VEHICLE_VISUAL_IMAGE =
  "/images/home/vehicle-documents-support.jpg";

/** Native source dimensions — do not upscale beyond this in layout. */
export const HOME_VEHICLE_VISUAL_IMAGE_WIDTH = 1024;
export const HOME_VEHICLE_VISUAL_IMAGE_HEIGHT = 576;

/**
 * Prefer the correctly labeled JPEG over the misnamed PNG twin
 * (same bytes, JPEG content) so next/image can emit WebP/AVIF cleanly.
 */
export function resolveHomeVehicleVisualImagePath(
  imagePath: string | null | undefined,
): string {
  const trimmed = imagePath?.trim() || "";

  if (
    !trimmed ||
    trimmed === "/images/home/vehicle-documents-support.png"
  ) {
    return DEFAULT_HOME_VEHICLE_VISUAL_IMAGE;
  }

  return trimmed;
}

