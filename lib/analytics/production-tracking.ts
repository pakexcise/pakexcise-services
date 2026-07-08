import "server-only";

import { shouldAllowSearchIndexing } from "@/config/env.server";

export type ProductionTrackingIds = {
  ga4MeasurementId?: string;
  gtmId?: string;
};

export function getProductionTrackingIds(): ProductionTrackingIds | null {
  if (!shouldAllowSearchIndexing()) {
    return null;
  }

  const ga4MeasurementId =
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() || undefined;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim() || undefined;

  if (!ga4MeasurementId && !gtmId) {
    return null;
  }

  return { ga4MeasurementId, gtmId };
}
