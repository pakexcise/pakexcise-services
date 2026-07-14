import type { Metadata } from "next";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import {
  ReviewsPanel,
  type ReviewPanelLabels,
} from "@/features/reviews/admin/components/reviews-panel";
import { getTranslations } from "@/lib/i18n/t";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { adminReviewRepository } from "@/server/repositories/admin-review-repository";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.reviews");
  return adminMetadata(t("title"));
}

export default async function AdminReviewsPage() {
  await enforcePermissionAccess("content:manage")();
  const t = await getTranslations("admin.reviews");

  const [reviews, nextDisplayOrder] = await Promise.all([
    adminReviewRepository.listAll(),
    adminReviewRepository.getNextDisplayOrder(),
  ]);

  const labels: ReviewPanelLabels = {
    authenticityNotice: t("authenticityNotice"),
    existing: t("existing"),
    empty: t("empty"),
    add: t("add"),
    edit: t("edit"),
    author: t("author"),
    context: t("context"),
    content: t("content"),
    rating: t("rating"),
    displayOrder: t("displayOrder"),
    active: t("active"),
    inactive: t("inactive"),
    save: t("save"),
    clear: t("clear"),
    delete: t("delete"),
    confirmDelete: t("confirmDelete"),
    saveFailed: t("saveFailed"),
    moveUp: t("moveUp"),
    moveDown: t("moveDown"),
    searchPlaceholder: t("searchPlaceholder"),
    allStatuses: t("allStatuses"),
    previous: t("previous"),
    next: t("next"),
    results: t("results"),
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <ReviewsPanel
        reviews={reviews}
        nextDisplayOrder={nextDisplayOrder}
        labels={labels}
      />
    </div>
  );
}
