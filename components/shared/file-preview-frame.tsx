import { cn } from "@/lib/utils";

export const FILE_PREVIEW_FRAME_CLASS =
  "flex h-64 w-full items-center justify-center overflow-hidden rounded-lg border bg-muted/20 p-3";

export const FILE_PREVIEW_IMAGE_CLASS = "max-h-full max-w-full object-contain";

export const FILE_PREVIEW_PDF_CLASS = "h-64 w-full rounded-lg border bg-muted/20";

type FilePreviewFrameProps = {
  children: React.ReactNode;
  className?: string;
};

export function FilePreviewFrame({ children, className }: FilePreviewFrameProps) {
  return <div className={cn(FILE_PREVIEW_FRAME_CLASS, className)}>{children}</div>;
}
