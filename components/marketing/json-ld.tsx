import { serializeJsonLd } from "@/components/shared/json-ld-script";
import { shouldAllowSearchIndexing } from "@/config/env.server";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: JsonLdProps) {
  if (!shouldAllowSearchIndexing()) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
