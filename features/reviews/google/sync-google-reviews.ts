import "server-only";

import { prisma } from "@/server/db/client";
import { settingsRepository } from "@/server/repositories/settings-repository";

const GOOGLE_SYNC_SETTING_KEY = "reviews:google-sync";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_REVIEWS_API =
  "https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews";
const PLACES_DETAILS_URL = "https://places.googleapis.com/v1/places/";
const PLACES_SEARCH_TEXT_URL = "https://places.googleapis.com/v1/places:searchText";
const DEFAULT_PLACES_SEARCH_QUERY = "PakExcise";

type NormalizedGoogleReview = {
  externalId: string;
  authorName: string;
  content: string;
  rating: number;
  reviewerPhotoUrl: string | null;
  submittedAt: Date;
  externalUpdatedAt: Date;
};

type GbpReviewer = {
  displayName?: string;
  profilePhotoUrl?: string;
  isAnonymous?: boolean;
};

type GbpReview = {
  reviewId?: string;
  name?: string;
  comment?: string;
  starRating?: string;
  createTime?: string;
  updateTime?: string;
  reviewer?: GbpReviewer;
};

type GbpReviewsResponse = {
  reviews?: GbpReview[];
  nextPageToken?: string;
};

type PlacesText = {
  text?: string;
  languageCode?: string;
};

type PlacesAuthorAttribution = {
  displayName?: string;
  uri?: string;
  photoUri?: string;
};

type PlacesReview = {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: PlacesText;
  originalText?: PlacesText;
  authorAttribution?: PlacesAuthorAttribution;
  publishTime?: string;
};

type PlacesDetailsResponse = {
  id?: string;
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  reviews?: PlacesReview[];
};

export type GoogleSyncProvider = "places" | "gbp";

export type GoogleSyncResult = {
  provider: GoogleSyncProvider;
  imported: number;
  updated: number;
  skipped: number;
  syncedAt: string;
  averageRating?: number | null;
  totalReviewCount?: number | null;
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

function sanitizeComment(comment?: string): string {
  if (!comment?.trim()) {
    return "Rated PakExcise on Google.";
  }

  return comment.replace(/\s+/g, " ").trim().slice(0, 1200);
}

function clampRating(value: number | undefined): number {
  if (!Number.isFinite(value)) return 5;
  return Math.max(1, Math.min(5, Math.round(value as number)));
}

/** Accepts raw Place ID (`ChIJ...`) or resource name (`places/ChIJ...`). */
export function normalizeGooglePlaceId(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("places/")) {
    return trimmed.slice("places/".length);
  }
  return trimmed;
}

/**
 * Extract a Places Place ID from a Google Maps URL when present as `!1sChIJ...`.
 * Hex CID forms (`0x...:0x...`) are not Place IDs and are ignored.
 */
export function extractPlaceIdFromMapsUrl(url: string): string | null {
  const decoded = decodeURIComponent(url.trim());
  const chij = decoded.match(/!1s(ChIJ[\w-]+)/i)?.[1];
  if (chij) return chij;

  const queryPlaceId = decoded.match(/[?&]place_id=(ChIJ[\w-]+)/i)?.[1];
  if (queryPlaceId) return queryPlaceId;

  return null;
}

function getPlacesApiKey(): string | null {
  return process.env.GOOGLE_PLACES_API_KEY?.trim() || null;
}

function getConfiguredPlaceIdHint(): string | null {
  const explicit =
    process.env.GOOGLE_PLACE_ID?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID?.trim();
  if (explicit) {
    return normalizeGooglePlaceId(explicit);
  }

  const mapsUrl =
    process.env.GOOGLE_MAPS_PLACE_URL?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL?.trim();
  if (mapsUrl) {
    return extractPlaceIdFromMapsUrl(mapsUrl);
  }

  return null;
}

async function resolvePlaceIdWithSearchText(apiKey: string): Promise<string> {
  const textQuery =
    process.env.GOOGLE_PLACES_SEARCH_QUERY?.trim() || DEFAULT_PLACES_SEARCH_QUERY;

  const response = await fetch(PLACES_SEARCH_TEXT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName",
    },
    body: JSON.stringify({
      textQuery,
      maxResultCount: 3,
      languageCode: "en",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Places API (New) searchText failed (${response.status})${body ? `: ${body.slice(0, 240)}` : "."}`,
    );
  }

  const json = (await response.json()) as {
    places?: Array<{ id?: string; displayName?: { text?: string } }>;
  };

  const match =
    json.places?.find((place) =>
      place.displayName?.text?.toLowerCase().includes("pakexcise"),
    ) ?? json.places?.[0];

  const placeId = match?.id?.trim();
  if (!placeId) {
    throw new Error(
      `Places API (New) could not resolve a Place ID for "${textQuery}". Set GOOGLE_PLACE_ID to a ChIJ... value from Google Maps (Business Profile ID / Shop code are not Place IDs).`,
    );
  }

  return normalizeGooglePlaceId(placeId);
}

async function resolvePlacesConfig(): Promise<{ apiKey: string; placeId: string }> {
  const apiKey = getPlacesApiKey();
  if (!apiKey) {
    throw new Error(
      "GOOGLE_PLACES_API_KEY is missing. Create a key restricted to Places API (New) in Google Cloud.",
    );
  }

  const hinted = getConfiguredPlaceIdHint();
  if (hinted) {
    return { apiKey, placeId: hinted };
  }

  const placeId = await resolvePlaceIdWithSearchText(apiKey);
  return { apiKey, placeId };
}

function getGbpConfig(): {
  accountId: string;
  locationId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
} | null {
  const accountId = process.env.GOOGLE_BUSINESS_PROFILE_ACCOUNT_ID?.trim();
  const locationId = process.env.GOOGLE_BUSINESS_PROFILE_LOCATION_ID?.trim();
  const clientId = process.env.GOOGLE_BUSINESS_PROFILE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_BUSINESS_PROFILE_REFRESH_TOKEN?.trim();

  if (!accountId || !locationId || !clientId || !clientSecret || !refreshToken) {
    return null;
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

async function fetchPlacesReviews(config: {
  apiKey: string;
  placeId: string;
}): Promise<{
  reviews: NormalizedGoogleReview[];
  averageRating: number | null;
  totalReviewCount: number | null;
}> {
  const response = await fetch(`${PLACES_DETAILS_URL}${config.placeId}`, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": config.apiKey,
      "X-Goog-FieldMask":
        "id,displayName,rating,userRatingCount,reviews",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Places API (New) place details failed (${response.status})${body ? `: ${body.slice(0, 240)}` : "."}`,
    );
  }

  const json = (await response.json()) as PlacesDetailsResponse;
  const reviews: NormalizedGoogleReview[] = [];

  for (const remote of json.reviews ?? []) {
    const externalId =
      remote.name?.trim() ||
      [
        remote.authorAttribution?.displayName?.trim() ?? "anonymous",
        remote.publishTime ?? "",
        remote.text?.text?.slice(0, 40) ?? "",
      ].join(":");

    if (!externalId.trim()) {
      continue;
    }

    const authorName = remote.authorAttribution?.displayName?.trim()
      ? remote.authorAttribution.displayName.trim().slice(0, 100)
      : "Google customer";
    const content = sanitizeComment(
      remote.originalText?.text?.trim() || remote.text?.text?.trim(),
    );
    const submittedAt = remote.publishTime
      ? new Date(remote.publishTime)
      : new Date();

    reviews.push({
      externalId: externalId.slice(0, 190),
      authorName,
      content,
      rating: clampRating(remote.rating),
      reviewerPhotoUrl: remote.authorAttribution?.photoUri?.trim() || null,
      submittedAt,
      externalUpdatedAt: submittedAt,
    });
  }

  return {
    reviews,
    averageRating:
      typeof json.rating === "number" && Number.isFinite(json.rating)
        ? json.rating
        : null,
    totalReviewCount:
      typeof json.userRatingCount === "number" &&
      Number.isFinite(json.userRatingCount)
        ? json.userRatingCount
        : null,
  };
}

async function fetchGbpReviews(config: {
  accountId: string;
  locationId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<NormalizedGoogleReview[]> {
  const accessToken = await getAccessToken(config);
  const reviews: NormalizedGoogleReview[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(
      GOOGLE_REVIEWS_API.replace("{accountId}", config.accountId).replace(
        "{locationId}",
        config.locationId,
      ),
    );
    url.searchParams.set("pageSize", "50");
    url.searchParams.set("orderBy", "updateTime desc");
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Google Business Profile reviews list failed (${response.status}).`);
    }

    const json = (await response.json()) as GbpReviewsResponse;
    for (const remote of json.reviews ?? []) {
      const externalId = remote.reviewId?.trim();
      if (!externalId) continue;

      const authorName =
        remote.reviewer?.isAnonymous || !remote.reviewer?.displayName?.trim()
          ? "Google customer"
          : remote.reviewer.displayName.trim().slice(0, 100);
      const submittedAt = remote.createTime
        ? new Date(remote.createTime)
        : new Date();
      const externalUpdatedAt = remote.updateTime
        ? new Date(remote.updateTime)
        : submittedAt;

      reviews.push({
        externalId,
        authorName,
        content: sanitizeComment(remote.comment),
        rating: starRatingToNumber(remote.starRating),
        reviewerPhotoUrl: remote.reviewer?.profilePhotoUrl ?? null,
        submittedAt,
        externalUpdatedAt,
      });
    }

    pageToken = json.nextPageToken;
  } while (pageToken);

  return reviews;
}

async function upsertNormalizedReviews(
  remoteReviews: NormalizedGoogleReview[],
): Promise<Pick<GoogleSyncResult, "imported" | "updated" | "skipped">> {
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  const nextOrderBase =
    ((
      await prisma.review.findFirst({
        orderBy: { displayOrder: "asc" },
        select: { displayOrder: true },
      })
    )?.displayOrder ?? 1) - 1;

  let orderOffset = 0;

  for (const remote of remoteReviews) {
    if (!remote.externalId.trim()) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.review.findFirst({
      where: {
        source: "GOOGLE",
        externalId: remote.externalId,
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.review.update({
        where: { id: existing.id },
        data: {
          authorNameEn: remote.authorName,
          contentEn: remote.content,
          rating: remote.rating,
          reviewerPhotoUrl: remote.reviewerPhotoUrl,
          externalUpdatedAt: remote.externalUpdatedAt,
          submittedAt: remote.submittedAt,
          status: "APPROVED",
          isActive: true,
          isDummy: false,
          customerConsent: true,
          authorRoleEn: "Google review",
          moderatedAt: remote.externalUpdatedAt,
        },
      });
      updated += 1;
      continue;
    }

    await prisma.review.create({
      data: {
        authorNameEn: remote.authorName,
        authorRoleEn: "Google review",
        contentEn: remote.content,
        rating: remote.rating,
        source: "GOOGLE",
        status: "APPROVED",
        isActive: true,
        isDummy: false,
        customerConsent: true,
        displayOrder: nextOrderBase - orderOffset,
        externalId: remote.externalId,
        externalUpdatedAt: remote.externalUpdatedAt,
        reviewerPhotoUrl: remote.reviewerPhotoUrl,
        submittedAt: remote.submittedAt,
        moderatedAt: remote.externalUpdatedAt,
      },
    });
    orderOffset += 1;
    imported += 1;
  }

  return { imported, updated, skipped };
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

/**
 * Sync Google reviews into PakExcise (one-way).
 * Prefers Places API (New) when `GOOGLE_PLACES_API_KEY` is set (Place ID optional;
 * resolved via GOOGLE_PLACE_ID, Maps URL, or searchText for "PakExcise").
 * Otherwise uses Google Business Profile OAuth credentials.
 */
export async function syncGoogleBusinessReviews(options?: {
  actorId?: string;
}): Promise<GoogleSyncResult> {
  void options?.actorId;

  const placesKey = getPlacesApiKey();
  const gbp = getGbpConfig();

  if (!placesKey && !gbp) {
    throw new Error(
      "Google review sync is not configured. Set GOOGLE_PLACES_API_KEY (Places API New). Optional: GOOGLE_PLACE_ID (ChIJ...), or rely on auto Place search for PakExcise. Business Profile ID / Shop code are not Place IDs. GBP OAuth vars remain supported as fallback.",
    );
  }

  let provider: GoogleSyncProvider;
  let remoteReviews: NormalizedGoogleReview[];
  let averageRating: number | null = null;
  let totalReviewCount: number | null = null;
  let resolvedPlaceId: string | null = null;

  if (placesKey) {
    provider = "places";
    const places = await resolvePlacesConfig();
    resolvedPlaceId = places.placeId;
    const placesResult = await fetchPlacesReviews(places);
    remoteReviews = placesResult.reviews;
    averageRating = placesResult.averageRating;
    totalReviewCount = placesResult.totalReviewCount;
  } else {
    provider = "gbp";
    remoteReviews = await fetchGbpReviews(gbp!);
  }

  const counts = await upsertNormalizedReviews(remoteReviews);

  const result: GoogleSyncResult = {
    provider,
    ...counts,
    syncedAt: new Date().toISOString(),
    averageRating,
    totalReviewCount,
  };

  await settingsRepository.setValue(GOOGLE_SYNC_SETTING_KEY, {
    syncedAt: result.syncedAt,
    lastResult: result,
    provider,
    placeId: resolvedPlaceId,
  });

  return result;
}
