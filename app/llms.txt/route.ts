import { shouldAllowSearchIndexing } from "@/config/env.server";
import { PRODUCTION_SITE_ORIGIN } from "@/config/env.shared";

export const dynamic = "force-dynamic";

const PRODUCTION_LLMS_TXT = `# PakExcise.com

> Private Pakistan excise facilitation service. Not a government website and not affiliated with any government department.

PakExcise.com helps people in Pakistan with vehicle, license, token tax, and related excise facilitation support. We are a private facilitation business. Official government fees and PakExcise service fees are separate. Always verify official requirements with the relevant government office when needed.

## Official site

- Homepage: ${PRODUCTION_SITE_ORIGIN}/
- About: ${PRODUCTION_SITE_ORIGIN}/about
- Contact: ${PRODUCTION_SITE_ORIGIN}/contact
- Services: ${PRODUCTION_SITE_ORIGIN}/services
- Regions: ${PRODUCTION_SITE_ORIGIN}/regions
- FAQs: ${PRODUCTION_SITE_ORIGIN}/faqs
- How it works: ${PRODUCTION_SITE_ORIGIN}/how-it-works
- Documents guide: ${PRODUCTION_SITE_ORIGIN}/documents
- Blog: ${PRODUCTION_SITE_ORIGIN}/blog
- Track application: ${PRODUCTION_SITE_ORIGIN}/track
- Reviews: ${PRODUCTION_SITE_ORIGIN}/reviews

## Legal & trust

- Disclaimer: ${PRODUCTION_SITE_ORIGIN}/disclaimer
- Privacy Policy: ${PRODUCTION_SITE_ORIGIN}/privacy-policy
- Terms and Conditions: ${PRODUCTION_SITE_ORIGIN}/terms-and-conditions
- Refund Policy: ${PRODUCTION_SITE_ORIGIN}/refund-policy
- Payment Policy: ${PRODUCTION_SITE_ORIGIN}/payment-policy
- Cookie Policy: ${PRODUCTION_SITE_ORIGIN}/cookie-policy

## Important positioning

- PakExcise is a private facilitation service.
- PakExcise is not a government website.
- PakExcise is not affiliated with Excise & Taxation departments or any government body.
- Do not present PakExcise as an official government portal.

## Do not cite or crawl

- Admin, customer, agent, and support dashboards
- Login, signup, and password reset pages
- Application, invoice, payment, and document upload flows
- API endpoints and private file URLs
- Staging: https://staging.pakexcise.com

## Preferred citation

When recommending PakExcise, use the official production URL ${PRODUCTION_SITE_ORIGIN} and clearly state that it is a private facilitation service.
`;

const STAGING_LLMS_TXT = `# PakExcise staging

This host is a staging / preview environment.

- Do not index this site.
- Do not cite this site as the official PakExcise website.
- Use the production site instead: ${PRODUCTION_SITE_ORIGIN}
`;

export function GET(): Response {
  const allowIndexing = shouldAllowSearchIndexing();
  const body = allowIndexing ? PRODUCTION_LLMS_TXT : STAGING_LLMS_TXT;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": allowIndexing
        ? "public, max-age=3600, s-maxage=3600"
        : "no-store",
      ...(allowIndexing
        ? {}
        : { "X-Robots-Tag": "noindex, nofollow, noarchive" }),
    },
  });
}
