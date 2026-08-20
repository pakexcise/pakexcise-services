import { JsonLd } from "@/components/marketing/json-ld";
import {
  buildBusinessContactPoints,
  buildLocalBusinessJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/features/seo/lib/metadata";
import {
  getBusinessSettings,
  getSeoSettings,
} from "@/features/settings/lib/public-settings-cache";
import {
  resolvePhoneDisplayNumber,
  resolveSupportEmail,
  resolveWhatsappChannelUrl,
} from "@/features/settings/lib/resolve-public-contact";
import { absoluteUrl } from "@/lib/utils";
import { getActiveSocialLinks } from "@/server/repositories";

/** Site-wide Organization + WebSite schema on all marketing pages. */
export async function MarketingSiteJsonLd() {
  const baseUrl = absoluteUrl("/");
  const [seoSettings, business, socialLinks] = await Promise.all([
    getSeoSettings(),
    getBusinessSettings(),
    getActiveSocialLinks(),
  ]);

  const sameAs = socialLinks
    .map((link) => link.url?.trim())
    .filter((url): url is string => Boolean(url));

  const contactPoints = buildBusinessContactPoints({
    phone: resolvePhoneDisplayNumber(business),
    email: resolveSupportEmail(business),
    whatsappUrl: resolveWhatsappChannelUrl(business),
  });

  const organization = buildOrganizationJsonLd(
    baseUrl,
    seoSettings,
    undefined,
    { sameAs, contactPoints },
  );

  const website = buildWebSiteJsonLd(baseUrl, business.siteName);

  const localBusiness = buildLocalBusinessJsonLd(baseUrl, seoSettings, {
    telephone: resolvePhoneDisplayNumber(business),
  });

  return <JsonLd data={[organization, website, localBusiness]} />;
}
