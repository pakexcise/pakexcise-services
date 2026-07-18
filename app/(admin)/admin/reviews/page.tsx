import type { Metadata } from "next";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import {
  ReviewsPanel,
  type ReviewPanelLabels,
} from "@/features/reviews/admin/components/reviews-panel";
import { getGoogleReviewsSyncStatus } from "@/features/reviews/google/sync-google-reviews";
import { getTranslations } from "@/lib/i18n/t";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { adminReviewRepository } from "@/server/repositories/admin-review-repository";
import { serviceRepository } from "@/server/repositories/service-repository";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.reviews");
  return adminMetadata(t("title"));
}

export default async function AdminReviewsPage() {
  await enforcePermissionAccess("content:manage")();
  const t = await getTranslations("admin.reviews");

  const [reviews, nextDisplayOrder, services, syncStatus] = await Promise.all([
    adminReviewRepository.listAll(),
    adminReviewRepository.getNextDisplayOrder(),
    serviceRepository.listPublicReviewOptions(),
    getGoogleReviewsSyncStatus(),
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
    statusPending: t("statusPending"),
    statusApproved: t("statusApproved"),
    statusRejected: t("statusRejected"),
    approve: t("approve"),
    reject: t("reject"),
    rejectReason: t("rejectReason"),
    rejectReasonRequired: t("rejectReasonRequired"),
    source: t("source"),
    sourceManual: t("sourceManual"),
    sourceCustomer: t("sourceCustomer"),
    sourceGoogle: t("sourceGoogle"),
    service: t("service"),
    trackingId: t("trackingId"),
    syncNow: t("syncNow"),
    syncing: t("syncing"),
    syncSuccess: t("syncSuccess"),
    syncFailed: t("syncFailed"),
    lastSynced: t("lastSynced"),
    neverSynced: t("neverSynced"),
    previous: t("previous"),
    next: t("next"),
    results: t("results"),
    allRecordTypes: t("allRecordTypes"),
    recordTypeDummy: t("recordTypeDummy"),
    recordTypeReal: t("recordTypeReal"),
    labelDummy: t("labelDummy"),
    labelReal: t("labelReal"),
    isDummy: t("isDummy"),
    selectedCount: t("selectedCount"),
    bulkApprove: t("bulkApprove"),
    bulkReject: t("bulkReject"),
    bulkDelete: t("bulkDelete"),
    confirmBulkDelete: t("confirmBulkDelete"),
    bulkRejectReason: t("bulkRejectReason"),
    selectAll: t("selectAll"),
    clearSelection: t("clearSelection"),
    downloadCsv: t("downloadCsv"),
    allCategories: t("allCategories"),
    uncategorized: t("uncategorized"),
    sortBy: t("sortBy"),
    sortLatest: t("sortLatest"),
    sortDisplayOrder: t("sortDisplayOrder"),
    sortCategory: t("sortCategory"),
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <ReviewsPanel
        reviews={reviews}
        nextDisplayOrder={nextDisplayOrder}
        labels={labels}
        services={services}
        lastSyncedAt={syncStatus.syncedAt}
      />
    </div>
  );
}
