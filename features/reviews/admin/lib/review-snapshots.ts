import type { AdminReviewItem } from "@/server/repositories/admin-review-repository";

export function reviewAuditSnapshot(review: AdminReviewItem | null) {
  if (!review) {
    return null;
  }

  return {
    id: review.id,
    authorNameEn: review.authorNameEn,
    authorRoleEn: review.authorRoleEn,
    contentEn: review.contentEn,
    rating: review.rating,
    status: review.status,
    source: review.source,
    isActive: review.isActive,
    displayOrder: review.displayOrder,
    customerConsent: review.customerConsent,
    moderationNote: review.moderationNote,
    serviceId: review.serviceId,
    applicationId: review.applicationId,
    userId: review.userId,
    externalId: review.externalId,
  };
}
