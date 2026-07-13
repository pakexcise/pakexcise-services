import "server-only";

import { upsertAutoRedirects } from "@/features/redirects/lib/upsert-auto-redirect";

/** @deprecated Prefer upsertAutoRedirects({ kind: "blog", ... }) */
export async function handleContentSlugRedirect(input: {
  prefix: "blog";
  oldSlug: string;
  newSlug: string;
  actorId: string;
}) {
  await upsertAutoRedirects({
    kind: input.prefix,
    oldSlug: input.oldSlug,
    newSlug: input.newSlug,
    actorId: input.actorId,
  });
}
