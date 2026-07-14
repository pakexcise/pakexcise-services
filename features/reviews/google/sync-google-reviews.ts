import "server-only";

import { prisma } from "@/server/db/client";
import { settingsRepository } from "@/server/repositories/settings-repository";

const GOOGLE_SYNC_SETTING_KEY = "reviews:google-sync";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_REVIEWS_API =
  "https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews";

type GoogleReviewer = {
  displayName?: string;
  profilePhotoUrl?: string;
  isAnonymous?: boolean;
};

type GoogleReview = {
  reviewId?: string;
  name?: string;
  comment?: string;
  starRating?: string;
  createTime?: string;
  updateTime?: string;
  reviewer?: GoogleReviewer;
};

type GoogleReviewsResponse = {
  reviews?: GoogleReview[];
  nextPageToken?: string;
  averageRating?: number;
  totalReviewCount?: number;
};

export type GoogleSyncResult = {
  imported: number;
  updated: number;
  skipped: number;
  syncedAt: string;
};

function starRatingToNumber(value?: string): number {
  switch (value) {
    case "ONE":
      return 1;
    case "TWO":
      return 2;
    case "THREE":
      return 3;
    case "FOUR":
      return 4;
    case "FIVE":
      return 5;
    default:
      return 5;
  }
}

function requireGoogleConfig() {
  const accountId = process.env.GOOGLE_BUSINESS_PROFILE_ACCOUNT_ID?.trim();
  const locationId = process.env.GOOGLE_BUSINESS_PROFILE_LOCATION_ID?.trim();
  const clientId = process.env.GOOGLE_BUSINESS_PROFILE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_BUSINESS_PROFILE_REFRESH_TOKEN?.trim();

  if (!accountId || !locationId || !clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Google Business Profile sync is not configured. Set GOOGLE_BUSINESS_PROFILE_ACCOUNT_ID, LOCATION_ID, CLIENT_ID, CLIENT_SECRET, and REFRESH_TOKEN.",
    );
  }

  return { accountId, locationId, clientId, clientSecret, refreshToken };
}

async function getAccessToken(config: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<string> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error(`Google OAuth token refresh failed (${response.status}).`);
  }

  const json = (await response.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("Google OAuth token response did not include access_token.");
  }

  return json.access_token;
}

async function listGoogleReviews(options: {
  accessToken: string;
  accountId: string;
  locationId: string;
}): Promise<GoogleReview[]> {
  const reviews: GoogleReview[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(
      GOOGLE_REVIEWS_API.replace("{accountId}", options.accountId).replace(
        "{locationId}",
        options.locationId,
      ),
    );
    url.searchParams.set("pageSize", "50");
    url.searchParams.set("orderBy", "updateTime desc");
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${options.accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Google reviews list failed (${response.status}).`);
    }

    const json = (await response.json()) as GoogleReviewsResponse;
    reviews.push(...(json.reviews ?? []));
    pageToken = json.nextPageToken;
  } while (pageToken);

  return reviews;
}

function sanitizeComment(comment?: string): string {
  if (!comment?.trim()) {
    return "Rated PakExcise on Google.";
  }

  return comment.replace(/\s+/g, " ").trim().slice(0, 1200);
}

export async function getGoogleReviewsSyncStatus(): Promise<{
  syncedAt: string | null;
  lastResult: GoogleSyncResult | null;
}> {
  const raw = await settingsRepository.getValue(GOOGLE_SYNC_SETTING_KEY);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { syncedAt: null, lastResult: null };
  }

  const record = raw as Record<string, unknown>;
  return {
    syncedAt: typeof record.syncedAt === "string" ? record.syncedAt : null,
    lastResult:
      record.lastResult && typeof record.lastResult === "object"
        ? (record.lastResult as GoogleSyncResult)
        : null,
  };
}

export async function syncGoogleBusinessReviews(options?: {
  actorId?: string;
}): Promise<GoogleSyncResult> {
  void options?.actorId;
  const config = requireGoogleConfig();
  const accessToken = await getAccessToken(config);
  const remoteReviews = await listGoogleReviews({
    accessToken,
    accountId: config.accountId,
    locationId: config.locationId,
  });

  let imported = 0;
  let updated = 0;
  let skipped = 0;

  const nextOrderBase =
    ((
      await prisma.review.findFirst({
        orderBy: { displayOrder: "desc" },
        select: { displayOrder: true },
      })
    )?.displayOrder ?? 0) + 1;

  let orderOffset = 0;

  for (const remote of remoteReviews) {
    const externalId = remote.reviewId?.trim();
    if (!externalId) {
      skipped += 1;
      continue;
    }

    const authorName =
      remote.reviewer?.isAnonymous || !remote.reviewer?.displayName?.trim()
        ? "Google customer"
        : remote.reviewer.displayName.trim().slice(0, 100);
    const content = sanitizeComment(remote.comment);
    const rating = starRatingToNumber(remote.starRating);
    const submittedAt = remote.createTime
      ? new Date(remote.createTime)
      : new Date();
    const externalUpdatedAt = remote.updateTime
      ? new Date(remote.updateTime)
      : submittedAt;

    const existing = await prisma.review.findFirst({
      where: {
        source: "GOOGLE",
        externalId,
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.review.update({
        where: { id: existing.id },
        data: {
          authorNameEn: authorName,
          contentEn: content,
          rating,
          reviewerPhotoUrl: remote.reviewer?.profilePhotoUrl ?? null,
          externalUpdatedAt,
          submittedAt,
          status: "APPROVED",
          isActive: true,
          customerConsent: true,
          authorRoleEn: "Google review",
        },
      });
      updated += 1;
      continue;
    }

    await prisma.review.create({
      data: {
        authorNameEn: authorName,
        authorRoleEn: "Google review",
        contentEn: content,
        rating,
        source: "GOOGLE",
        status: "APPROVED",
        isActive: true,
        customerConsent: true,
        displayOrder: nextOrderBase + orderOffset,
        externalId,
        externalUpdatedAt,
        reviewerPhotoUrl: remote.reviewer?.profilePhotoUrl ?? null,
        submittedAt,
      },
    });
    orderOffset += 1;
    imported += 1;
  }

  const result: GoogleSyncResult = {
    imported,
    updated,
    skipped,
    syncedAt: new Date().toISOString(),
  };

  await settingsRepository.setValue(GOOGLE_SYNC_SETTING_KEY, {
    syncedAt: result.syncedAt,
    lastResult: result,
  });

  return result;
}
