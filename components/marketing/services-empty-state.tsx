import { MapPin, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type ServicesEmptyStateProps = {
  title: string;
  description: string;
  browseRegionsLabel: string;
  contactLabel: string;
};

export function ServicesEmptyState({
  title,
  description,
  browseRegionsLabel,
  contactLabel,
}: ServicesEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
        <Search className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="default">
          <Link href="/regions">
            <MapPin className="size-4" aria-hidden="true" />
            {browseRegionsLabel}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">{contactLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
