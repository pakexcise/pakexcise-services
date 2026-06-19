export function getPublicPlateFormatImagePath(formatId: string): string {
  return `/api/regions/plate-formats/${formatId}/image`;
}

export const DEFAULT_PLATE_FORMAT_IMAGE_PATH =
  "/images/marketing/vehicle-plate-placeholder.svg";
