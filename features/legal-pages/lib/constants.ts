import {
  COOKIE_POLICY_CONTENT_EN,
  COOKIE_POLICY_SEO} from "./content/cookie-policy-en";
import {
  DISCLAIMER_CONTENT_EN,
  DISCLAIMER_SEO} from "./content/disclaimer-en";
import {
  PAYMENT_POLICY_CONTENT_EN,
  PAYMENT_POLICY_SEO} from "./content/payment-policy-en";
import {
  PRIVACY_POLICY_CONTENT_EN,
  PRIVACY_POLICY_SEO} from "./content/privacy-policy-en";
import {
  REFUND_POLICY_CONTENT_EN,
  REFUND_POLICY_SEO} from "./content/refund-policy-en";
import {
  TERMS_AND_CONDITIONS_CONTENT_EN,
  TERMS_AND_CONDITIONS_SEO} from "./content/terms-and-conditions-en";

export const CANONICAL_LEGAL_PAGE_SLUGS = [
  "disclaimer",
  "privacy-policy",
  "terms-and-conditions",
  "refund-policy",
  "payment-policy",
  "cookie-policy"] as const;

export type CanonicalLegalPageSlug = (typeof CANONICAL_LEGAL_PAGE_SLUGS)[number];

export const LEGACY_LEGAL_PAGE_KEY_MAP: Record<string, CanonicalLegalPageSlug> = {
  privacy: "privacy-policy",
  terms: "terms-and-conditions",
  refund: "refund-policy",
  disclaimer: "disclaimer"};

export function legalPagePath(slug: string): string {
  return `/${slug}`;
}

export function isCanonicalLegalPageSlug(slug: string): slug is CanonicalLegalPageSlug {
  return (CANONICAL_LEGAL_PAGE_SLUGS as readonly string[]).includes(slug);
}

export type LegalPageSeedDefinition = {
  slug: CanonicalLegalPageSlug;
  titleEn: string;
  excerptEn: string;
  contentEn: string;
  displayOrder: number;
};

export const DEFAULT_LEGAL_PAGE_DEFINITIONS: LegalPageSeedDefinition[] = [
  {
    slug: "privacy-policy",
    titleEn: "Privacy Policy",
    excerptEn: PRIVACY_POLICY_SEO.excerptEn,
    contentEn: PRIVACY_POLICY_CONTENT_EN,
    displayOrder: 0},
  {
    slug: "terms-and-conditions",
    titleEn: "Terms and Conditions",
    excerptEn: TERMS_AND_CONDITIONS_SEO.excerptEn,
    contentEn: TERMS_AND_CONDITIONS_CONTENT_EN,
    displayOrder: 1},
  {
    slug: "disclaimer",
    titleEn: "Disclaimer",
    excerptEn: DISCLAIMER_SEO.excerptEn,
    contentEn: DISCLAIMER_CONTENT_EN,
    displayOrder: 2},
  {
    slug: "refund-policy",
    titleEn: "Refund Policy",
    excerptEn: REFUND_POLICY_SEO.excerptEn,
    contentEn: REFUND_POLICY_CONTENT_EN,
    displayOrder: 3},
  {
    slug: "payment-policy",
    titleEn: "Payment Policy",
    excerptEn: PAYMENT_POLICY_SEO.excerptEn,
    contentEn: PAYMENT_POLICY_CONTENT_EN,
    displayOrder: 4},
  {
    slug: "cookie-policy",
    titleEn: "Cookie Policy",
    excerptEn: COOKIE_POLICY_SEO.excerptEn,
    contentEn: COOKIE_POLICY_CONTENT_EN,
    displayOrder: 5}];
