import { serializeJsonLd } from "@/components/shared/json-ld-script";
import { shouldAllowSearchIndexing } from "@/config/env.server";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: JsonLdProps) {
  if (!shouldAllowSearchIndexing()) {
    return null;
  }

  const payload = Array.isArray(data)
    ? data.filter((item) => item && Object.keys(item).length > 0)
    : data;

  if (Array.isArray(payload) && payload.length === 0) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(payload) }}
    />
  );
}
