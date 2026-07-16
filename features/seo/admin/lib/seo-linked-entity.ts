import type { Route } from "next";

type SeoLinkSource = {
  serviceId?: string | null;
  regionId?: string | null;
  cityId?: string | null;
  blogPostId?: string | null;
  legalPageId?: string | null;
  service?: { slug: string; nameEn: string } | null;
  region?: { slug: string; nameEn: string } | null;
  city?: { slug: string; nameEn: string; region?: { slug: string } | null } | null;
  blogPost?: { slug: string; titleEn: string } | null;
  legalPage?: { slug: string; titleEn: string } | null;
  pageKey: string;
};

export function resolveSeoLinkedEntity(record: SeoLinkSource): {
  label: string;
  href: string | null;
  kind: "service" | "region" | "city" | "blog" | "legal" | "static";
} {
  if (record.serviceId && record.service) {
    return {
      kind: "service",
      label: `service:${record.service.slug}`,
      href: `/admin/services/${record.serviceId}/edit` as Route,
    };
  }
  if (record.regionId && record.region) {
    return {
      kind: "region",
      label: `region:${record.region.slug}`,
      href: `/admin/regions/${record.regionId}/edit` as Route,
    };
  }
  if (record.cityId && record.city) {
    return {
      kind: "city",
      label: `city:${record.city.region?.slug ?? "?"}:${record.city.slug}`,
      href: `/admin/cities/${record.cityId}/edit` as Route,
    };
  }
  if (record.blogPostId && record.blogPost) {
    return {
      kind: "blog",
      label: `blog:${record.blogPost.slug}`,
      href: `/admin/blog/${record.blogPostId}/edit` as Route,
    };
  }
  if (record.legalPageId && record.legalPage) {
    return {
      kind: "legal",
      label: `legal:${record.legalPage.slug}`,
      href: `/admin/legal-pages/${record.legalPageId}/edit` as Route,
    };
  }

  return {
    kind: "static",
    label: "static",
    href: null,
  };
}
