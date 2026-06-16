import "server-only";

import type { Prisma } from "@prisma/client";
import { Prisma as PrismaNamespace } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

const PADDING = 5;
const MAX_RETRIES = 5;

export const APPLICATION_TRACKING_SEQUENCE_KEY = "id-sequence:application";
export const CONTACT_INQUIRY_SEQUENCE_KEY = "id-sequence:contact-inquiry";
export const SERVICE_REQUEST_SEQUENCE_KEY = "id-sequence:service-request";

type DbClient = Prisma.TransactionClient | typeof prisma;

type IdSequenceValue = { next: number };

function isIdSequenceValue(value: unknown): value is IdSequenceValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "next" in value &&
    typeof (value as IdSequenceValue).next === "number" &&
    Number.isInteger((value as IdSequenceValue).next) &&
    (value as IdSequenceValue).next >= 1
  );
}

export function formatSequentialReferenceId(
  prefix: "PE" | "CI" | "SR",
  sequence: number,
): string {
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 99_999) {
    throw new Error("Sequence out of range for reference ID");
  }

  return `${prefix}-${String(sequence).padStart(PADDING, "0")}`;
}

export const NEW_APPLICATION_TRACKING_ID_PATTERN = /^PE-\d{5}$/;
export const NEW_CONTACT_INQUIRY_REFERENCE_ID_PATTERN = /^CI-\d{5}$/;
export const NEW_SERVICE_REQUEST_REFERENCE_ID_PATTERN = /^SR-\d{5}$/;

async function getMaxApplicationSequence(db: DbClient = prisma): Promise<number> {
  const rows = await db.$queryRaw<Array<{ max: number | null }>>`
    SELECT MAX(CAST(SUBSTRING("trackingId" FROM 4) AS INTEGER)) AS max
    FROM applications
    WHERE "trackingId" ~ '^PE-[0-9]{5}$'
  `;

  return rows[0]?.max ?? 0;
}

async function getMaxContactInquirySequence(
  db: DbClient = prisma,
): Promise<number> {
  const rows = await db.$queryRaw<Array<{ max: number | null }>>`
    SELECT MAX(CAST(SUBSTRING("referenceId" FROM 4) AS INTEGER)) AS max
    FROM contact_inquiries
    WHERE "referenceId" ~ '^CI-[0-9]{5}$'
  `;

  return rows[0]?.max ?? 0;
}

async function getMaxServiceRequestSequence(
  db: DbClient = prisma,
): Promise<number> {
  const rows = await db.$queryRaw<Array<{ max: number | null }>>`
    SELECT MAX(CAST(SUBSTRING("referenceId" FROM 4) AS INTEGER)) AS max
    FROM guest_leads
    WHERE "referenceId" ~ '^SR-[0-9]{5}$'
  `;

  return rows[0]?.max ?? 0;
}

function isTransactionConflictError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2034"
  );
}

async function allocateNextSequence(
  settingKey: string,
  bootstrapMax: (db: DbClient) => Promise<number>,
): Promise<number> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const existing = await tx.setting.findUnique({
            where: { key: settingKey },
          });

          let sequence: number;

          if (existing && isIdSequenceValue(existing.value)) {
            sequence = existing.value.next;
          } else {
            const maxInDb = await bootstrapMax(tx);
            sequence = maxInDb + 1;
          }

          if (sequence < 1 || sequence > 99_999) {
            throw new Error("Sequence exhausted for reference ID");
          }

          await tx.setting.upsert({
            where: { key: settingKey },
            create: {
              key: settingKey,
              value: { next: sequence + 1 },
            },
            update: {
              value: { next: sequence + 1 },
            },
          });

          return sequence;
        },
        {
          isolationLevel: PrismaNamespace.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      lastError = error;

      if (isTransactionConflictError(error) && attempt < MAX_RETRIES - 1) {
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? new Error("Failed to allocate sequence");
}

export async function allocateApplicationTrackingId(): Promise<string> {
  const sequence = await allocateNextSequence(
    APPLICATION_TRACKING_SEQUENCE_KEY,
    getMaxApplicationSequence,
  );

  return formatSequentialReferenceId("PE", sequence);
}

export async function allocateContactInquiryReferenceId(): Promise<string> {
  const sequence = await allocateNextSequence(
    CONTACT_INQUIRY_SEQUENCE_KEY,
    getMaxContactInquirySequence,
  );

  return formatSequentialReferenceId("CI", sequence);
}

export async function allocateServiceRequestReferenceId(): Promise<string> {
  const sequence = await allocateNextSequence(
    SERVICE_REQUEST_SEQUENCE_KEY,
    getMaxServiceRequestSequence,
  );

  return formatSequentialReferenceId("SR", sequence);
}
