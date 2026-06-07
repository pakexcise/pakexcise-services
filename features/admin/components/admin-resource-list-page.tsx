import { Plus } from "lucide-react";

import { EmptyState } from "@/features/admin/components/empty-state";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { Button } from "@/components/ui/button";

type AdminResourceListPageProps = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  createLabel?: string;
  children?: React.ReactNode;
  hasItems?: boolean;
};

export function AdminResourceListPage({
  title,
  description,
  emptyTitle,
  emptyDescription,
  createLabel,
  children,
  hasItems = false,
}: AdminResourceListPageProps) {
  return (
    <>
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          createLabel ? (
            <Button type="button" disabled>
              <Plus className="size-4" aria-hidden="true" />
              {createLabel}
            </Button>
          ) : undefined
        }
      />
      {hasItems && children ? (
        children
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </>
  );
}
