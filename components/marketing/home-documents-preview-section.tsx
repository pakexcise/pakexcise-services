import { FileText } from "lucide-react";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { HomeSectionShell } from "@/components/marketing/home-section-shell";
import { SectionHeader } from "@/components/marketing/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicDocumentPreview } from "@/server/repositories/document-requirement-repository";

import Link from "next/link";
type HomeDocumentsPreviewSectionProps = {
  title: string;
  description: string;
  documents: PublicDocumentPreview[];
  locale: string;
  requiredLabel: string;
  optionalLabel: string;
  viewAllLabel: string;
  emptyMessage: string;
  tone?: "default" | "muted" | "accent";
  className?: string;
};

export function HomeDocumentsPreviewSection({
  title,
  description,
  documents,
  locale,
  requiredLabel,
  optionalLabel,
  viewAllLabel,
  emptyMessage,
  tone = "muted",
  className}: HomeDocumentsPreviewSectionProps) {
  return (
    <HomeSectionShell tone={tone} className={className}>
      <SectionHeader
        title={title}
        description={description}
        action={
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/documents">
              {viewAllLabel}
              <DirectionalArrow />
            </Link>
          </Button>
        }
      />

      {documents.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {documents.map((document) => {
            const label = document.labelEn ?? "";
            const serviceName = document.service.nameEn ?? "";

            return (
              <Link
                key={document.id}
                href={`/services/${document.service.slug}`}
                className={cn(
                  "group rounded-xl border border-border/70 bg-background/80 p-4",
                  "transition-colors hover:border-primary/25 hover:bg-primary/[0.03]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <FileText className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <Badge
                    variant={document.isRequired ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {document.isRequired ? requiredLabel : optionalLabel}
                  </Badge>
                </div>
                <p className="mt-3 text-sm font-medium leading-snug group-hover:text-primary">
                  {label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{serviceName}</p>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex justify-center sm:hidden">
        <Button asChild variant="outline">
          <Link href="/documents">
            {viewAllLabel}
            <DirectionalArrow />
          </Link>
        </Button>
      </div>
    </HomeSectionShell>
  );
}
