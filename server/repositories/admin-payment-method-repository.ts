import "server-only";

import type { Prisma } from "@prisma/client";

import { Repository } from "@/server/repositories/base/repository";

export const adminPaymentMethodSelect = {
  id: true,
  code: true,
  type: true,
  nameEn: true,
  accountTitleEn: true,
  accountNumber: true,
  iban: true,
  bankNameEn: true,
  instructionsEn: true,
  qrCodeR2Key: true,
  qrCodeMimeType: true,
  isActive: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true} as const satisfies Prisma.PaymentMethodSelect;

export type AdminPaymentMethodItem = Prisma.PaymentMethodGetPayload<{
  select: typeof adminPaymentMethodSelect;
}>;

export class AdminPaymentMethodRepository extends Repository {
  async listAll(): Promise<AdminPaymentMethodItem[]> {
    return this.db.paymentMethod.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: adminPaymentMethodSelect});
  }

  async listActive(): Promise<AdminPaymentMethodItem[]> {
    return this.db.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: adminPaymentMethodSelect});
  }

  async findById(id: string): Promise<AdminPaymentMethodItem | null> {
    return this.db.paymentMethod.findUnique({
      where: { id },
      select: adminPaymentMethodSelect});
  }

  async findActiveByIds(ids: string[]): Promise<AdminPaymentMethodItem[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.db.paymentMethod.findMany({
      where: {
        id: { in: ids },
        isActive: true},
      select: adminPaymentMethodSelect});
  }

  async getNextDisplayOrder(): Promise<number> {
    const last = await this.db.paymentMethod.findFirst({
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true }});

    return (last?.displayOrder ?? 0) + 1;
  }
}

export const adminPaymentMethodRepository = new AdminPaymentMethodRepository();
