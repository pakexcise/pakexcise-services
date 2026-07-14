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
    isActive: review.isActive,
    displayOrder: review.displayOrder,
  };
}
