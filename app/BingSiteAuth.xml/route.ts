import { shouldAllowSearchIndexing } from "@/config/env.server";

export const dynamic = "force-dynamic";

/**
 * Bing Webmaster XML verification fallback.
 * https://pakexcise.com/BingSiteAuth.xml
 */
export function GET(): Response {
  if (!shouldAllowSearchIndexing()) {
    return new Response("Not Found", { status: 404 });
  }

  const token = process.env.BING_SITE_VERIFICATION?.trim();
  if (!token) {
    return new Response("Not Found", { status: 404 });
  }

  const body = `<?xml version="1.0"?>\n<users>\n\t<user>${token}</user>\n</users>\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
