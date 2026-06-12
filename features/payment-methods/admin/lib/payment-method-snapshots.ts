import type { AdminPaymentMethodItem } from "@/server/repositories/admin-payment-method-repository";

export function paymentMethodAuditSnapshot(
  method: AdminPaymentMethodItem | null | undefined,
) {
  if (!method) {
    return null;
  }

  return {
    id: method.id,
    code: method.code,
    type: method.type,
    nameEn: method.nameEn,
    nameUr: method.nameUr,
    isActive: method.isActive,
    displayOrder: method.displayOrder,
  };
}
