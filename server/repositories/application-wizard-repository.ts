import "server-only";

import type { ApplicationStatus, Prisma } from "@prisma/client";

import type { ApplicationDraftJson } from "@/features/applications/types";
import { Repository } from "@/server/repositories/base/repository";

export type WizardApplicationRecord = {
  id: string;
  trackingId: string;
  userId: string;
  agentId: string | null;
  serviceId: string;
  status: ApplicationStatus;
  currentStep: number;
  draftJson: Prisma.JsonValue | null;
  locale: string;
};

export class ApplicationWizardRepository extends Repository {
  async findDraftForUser(input: {
    applicationId: string;
    userId: string;
  }): Promise<WizardApplicationRecord | null> {
    return this.db.application.findFirst({
      where: {
        id: input.applicationId,
        userId: input.userId,
        status: "DRAFT",
      },
      select: {
        id: true,
        trackingId: true,
        userId: true,
        agentId: true,
        serviceId: true,
        status: true,
        currentStep: true,
        draftJson: true,
        locale: true,
      },
    });
  }

  async findDraftByServiceForUser(input: {
    serviceId: string;
    userId: string;
  }): Promise<WizardApplicationRecord | null> {
    return this.db.application.findFirst({
      where: {
        serviceId: input.serviceId,
        userId: input.userId,
        status: "DRAFT",
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        trackingId: true,
        userId: true,
        agentId: true,
        serviceId: true,
        status: true,
        currentStep: true,
        draftJson: true,
        locale: true,
      },
    });
  }

  async createDraft(input: {
    trackingId: string;
    userId: string;
    agentId?: string | null;
    serviceId: string;
    locale: string;
    draftJson: ApplicationDraftJson;
    currentStep: number;
  }): Promise<WizardApplicationRecord> {
    return this.db.application.create({
      data: {
        trackingId: input.trackingId,
        userId: input.userId,
        agentId: input.agentId ?? null,
        serviceId: input.serviceId,
        locale: input.locale,
        status: "DRAFT",
        currentStep: input.currentStep,
        draftJson: input.draftJson as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        trackingId: true,
        userId: true,
        agentId: true,
        serviceId: true,
        status: true,
        currentStep: true,
        draftJson: true,
        locale: true,
      },
    });
  }

  async updateDraftService(input: {
    applicationId: string;
    userId: string;
    serviceId: string;
    currentStep: number;
    draftJson: ApplicationDraftJson;
  }): Promise<WizardApplicationRecord | null> {
    const result = await this.db.application.updateMany({
      where: {
        id: input.applicationId,
        userId: input.userId,
        status: "DRAFT",
      },
      data: {
        serviceId: input.serviceId,
        currentStep: input.currentStep,
        draftJson: input.draftJson as Prisma.InputJsonValue,
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findDraftForUser({
      applicationId: input.applicationId,
      userId: input.userId,
    });
  }

  async updateDraft(input: {
    applicationId: string;
    userId: string;
    currentStep: number;
    draftJson: ApplicationDraftJson;
  }): Promise<WizardApplicationRecord | null> {
    const result = await this.db.application.updateMany({
      where: {
        id: input.applicationId,
        userId: input.userId,
        status: "DRAFT",
      },
      data: {
        currentStep: input.currentStep,
        draftJson: input.draftJson as Prisma.InputJsonValue,
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findDraftForUser({
      applicationId: input.applicationId,
      userId: input.userId,
    });
  }
}

export const applicationWizardRepository = new ApplicationWizardRepository();
