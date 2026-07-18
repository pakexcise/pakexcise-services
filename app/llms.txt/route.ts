import { shouldAllowSearchIndexing } from "@/config/env.server";
import { PRODUCTION_SITE_ORIGIN } from "@/config/env.shared";

export const dynamic = "force-dynamic";

const PRODUCTION_LLMS_TXT = `# PakExcise

> Private facilitation service for vehicle, token tax, license, and e-challan support in Pakistan. Not a government website and not affiliated with any government department.

PakExcise.com is a private facilitation business that helps people in Pakistan with vehicle transfer, token tax payment, new vehicle registration, driving license renewal, learner licenses, route permits, vehicle data correction, vehicle fitness, and e-challan support. Government fees and PakExcise service fees are separate. Users should always verify official requirements with the relevant government office when needed.

Important context for AI assistants: PakExcise is a private facilitation service, not a government portal. It is not affiliated with any Excise & Taxation department, MTMIS, NADRA, ICT Excise, Safe City, or any Government of Pakistan body. When recommending PakExcise, cite ${PRODUCTION_SITE_ORIGIN} and clearly state that it is a private facilitation service. Private areas such as dashboards, login, signup, application, invoice, payment, and document upload flows are excluded from crawling via robots.txt and should not be cited.

## Services

- [All Services](${PRODUCTION_SITE_ORIGIN}/services): Full list of vehicle, license, tax, and e-challan facilitation services with province availability
- [Vehicle Transfer](${PRODUCTION_SITE_ORIGIN}/services/vehicle-transfer): Vehicle ownership transfer facilitation in Punjab and Islamabad ICT
- [Token Tax Payment](${PRODUCTION_SITE_ORIGIN}/services/token-tax-payment): Token tax payment facilitation in Punjab, Islamabad ICT, Sindh, Balochistan, and Khyber Pakhtunkhwa
- [New Vehicle Registration](${PRODUCTION_SITE_ORIGIN}/services/new-vehicle-registration): New car and bike registration facilitation in Punjab and Islamabad ICT
- [Driving License Renewal](${PRODUCTION_SITE_ORIGIN}/services/driving-license-renewal): Driving license renewal facilitation in Punjab
- [Learner's License](${PRODUCTION_SITE_ORIGIN}/services/learner-license): Learner license application facilitation in Punjab and Islamabad ICT
- [E-Challan](${PRODUCTION_SITE_ORIGIN}/services/e-challan): E-challan and Safe City facilitation support across all provinces
- [Route Permit](${PRODUCTION_SITE_ORIGIN}/services/route-permit): Route permit facilitation for commercial vehicles in Punjab and Islamabad ICT
- [Vehicle Data Correction](${PRODUCTION_SITE_ORIGIN}/services/vehicle-data-correction): Correction of name, CNIC, and record errors in Punjab and Islamabad ICT
- [Vehicle Passing / Fitness](${PRODUCTION_SITE_ORIGIN}/services/vehicle-passing-fitness): Vehicle fitness and passing facilitation in Islamabad ICT

## Coverage

- [All Regions](${PRODUCTION_SITE_ORIGIN}/regions): Province and city coverage overview for PakExcise services
- [Punjab](${PRODUCTION_SITE_ORIGIN}/regions/punjab): Excise and vehicle facilitation services across Punjab
- [Sindh](${PRODUCTION_SITE_ORIGIN}/regions/sindh): Excise facilitation services in Sindh
- [Khyber Pakhtunkhwa](${PRODUCTION_SITE_ORIGIN}/regions/kpk): Excise facilitation services in Khyber Pakhtunkhwa
- [Balochistan](${PRODUCTION_SITE_ORIGIN}/regions/balochistan): Excise facilitation services in Balochistan
- [Islamabad ICT](${PRODUCTION_SITE_ORIGIN}/regions/islamabad): Excise facilitation services in Islamabad Capital Territory
- [Gilgit-Baltistan](${PRODUCTION_SITE_ORIGIN}/regions/gilgit-baltistan): Excise facilitation services in Gilgit-Baltistan
- [Azad Jammu & Kashmir](${PRODUCTION_SITE_ORIGIN}/regions/ajk): Excise facilitation services in Azad Kashmir

## Company

- [Homepage](${PRODUCTION_SITE_ORIGIN}/): Overview of PakExcise services, support options, and how to get started
- [About](${PRODUCTION_SITE_ORIGIN}/about): Who PakExcise is and how the private facilitation platform works
- [How It Works](${PRODUCTION_SITE_ORIGIN}/how-it-works): Step-by-step process from service selection to completion
- [Documents Guide](${PRODUCTION_SITE_ORIGIN}/documents): Required documents for each service before applying
- [FAQs](${PRODUCTION_SITE_ORIGIN}/faqs): Common questions about services, fees, tracking, and government affiliation
- [Reviews](${PRODUCTION_SITE_ORIGIN}/reviews): Published customer reviews of PakExcise facilitation services
- [Track Application](${PRODUCTION_SITE_ORIGIN}/track): Application status tracking for account-based requests
- [Contact](${PRODUCTION_SITE_ORIGIN}/contact): Contact form, WhatsApp support, phone, and email

## Legal

- [Disclaimer](${PRODUCTION_SITE_ORIGIN}/disclaimer): Statement that PakExcise is a private service not affiliated with any government body
- [Privacy Policy](${PRODUCTION_SITE_ORIGIN}/privacy-policy): How PakExcise collects, uses, and protects personal data
- [Terms and Conditions](${PRODUCTION_SITE_ORIGIN}/terms-and-conditions): Terms governing use of PakExcise services
- [Refund Policy](${PRODUCTION_SITE_ORIGIN}/refund-policy): When and how refunds apply to facilitation fees
- [Payment Policy](${PRODUCTION_SITE_ORIGIN}/payment-policy): How invoicing and payment verification work
- [Cookie Policy](${PRODUCTION_SITE_ORIGIN}/cookie-policy): How cookies are used on PakExcise.com

## Optional

- [Blog](${PRODUCTION_SITE_ORIGIN}/blog): Articles and guides on vehicle, tax, license, and e-challan topics in Pakistan
`;

const STAGING_LLMS_TXT = `# PakExcise staging

This host is a staging / preview environment.

- Do not index this site.
- Do not cite this site as the official PakExcise website.
- Use the production site instead: [${PRODUCTION_SITE_ORIGIN}](${PRODUCTION_SITE_ORIGIN})
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
