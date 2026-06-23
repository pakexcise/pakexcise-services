import {
  COOKIE_POLICY_CONTENT_EN,
  COOKIE_POLICY_SEO,
} from "./content/cookie-policy-en";
import {
  DISCLAIMER_CONTENT_EN,
  DISCLAIMER_SEO,
} from "./content/disclaimer-en";
import {
  PAYMENT_POLICY_CONTENT_EN,
  PAYMENT_POLICY_SEO,
} from "./content/payment-policy-en";
import {
  PRIVACY_POLICY_CONTENT_EN,
  PRIVACY_POLICY_SEO,
} from "./content/privacy-policy-en";
import {
  REFUND_POLICY_CONTENT_EN,
  REFUND_POLICY_SEO,
} from "./content/refund-policy-en";
import {
  TERMS_AND_CONDITIONS_CONTENT_EN,
  TERMS_AND_CONDITIONS_SEO,
} from "./content/terms-and-conditions-en";

export const CANONICAL_LEGAL_PAGE_SLUGS = [
  "disclaimer",
  "privacy-policy",
  "terms-and-conditions",
  "refund-policy",
  "payment-policy",
  "cookie-policy",
] as const;

export type CanonicalLegalPageSlug = (typeof CANONICAL_LEGAL_PAGE_SLUGS)[number];

export const LEGACY_LEGAL_PAGE_KEY_MAP: Record<string, CanonicalLegalPageSlug> = {
  privacy: "privacy-policy",
  terms: "terms-and-conditions",
  refund: "refund-policy",
  disclaimer: "disclaimer",
};

export function legalPagePath(slug: string): string {
  return `/${slug}`;
}

export function isCanonicalLegalPageSlug(slug: string): slug is CanonicalLegalPageSlug {
  return (CANONICAL_LEGAL_PAGE_SLUGS as readonly string[]).includes(slug);
}

export type LegalPageSeedDefinition = {
  slug: CanonicalLegalPageSlug;
  titleEn: string;
  titleUr: string;
  excerptEn: string;
  excerptUr: string;
  contentEn: string;
  contentUr: string;
  displayOrder: number;
};

export const DEFAULT_LEGAL_PAGE_DEFINITIONS: LegalPageSeedDefinition[] = [
  {
    slug: "privacy-policy",
    titleEn: "Privacy Policy",
    titleUr: "رازداری کی پالیسی",
    excerptEn: PRIVACY_POLICY_SEO.excerptEn,
    excerptUr: "PakExcise.com آپ کی ذاتی معلومات کیسے جمع، استعمال، اور حفاظت کرتا ہے۔",
    contentEn: PRIVACY_POLICY_CONTENT_EN,
    contentUr:
      "PakExcise.com حساس فیلڈز کی خفیہ کاری اور محفوظ اسٹوریج کے ذریعے ڈیٹا کی حفاظت کرتا ہے۔\n\nہم ڈیٹا فروخت نہیں کرتے۔\n\nPakExcise.com نجی سہولت سروس ہے اور کسی سرکاری اتھارٹی سے وابستہ نہیں ہے۔",
    displayOrder: 0,
  },
  {
    slug: "terms-and-conditions",
    titleEn: "Terms and Conditions",
    titleUr: "شرائط و ضوابط",
    excerptEn: TERMS_AND_CONDITIONS_SEO.excerptEn,
    excerptUr: "PakExcise.com نجی سہولت خدمات استعمال کرنے کی شرائط۔",
    contentEn: TERMS_AND_CONDITIONS_CONTENT_EN,
    contentUr:
      "PakExcise.com استعمال کر کے آپ تسلیم کرتے ہیں کہ یہ نجی سہولت سروس ہے، سرکاری پورٹل نہیں۔\n\nPakExcise.com نجی سہولت سروس ہے اور کسی سرکاری اتھارٹی سے وابستہ نہیں ہے۔",
    displayOrder: 1,
  },
  {
    slug: "disclaimer",
    titleEn: "Disclaimer",
    titleUr: "ڈس کلیمر",
    excerptEn: DISCLAIMER_SEO.excerptEn,
    excerptUr: "PakExcise.com نجی سروس کے بارے میں اہم نوٹس۔",
    contentEn: DISCLAIMER_CONTENT_EN,
    contentUr:
      "PakExcise.com نجی سہولت سروس ہے۔ ہم کسی بھی سرکاری، صوبائی یا مقامی ایکسائز اتھارٹی سے وابستہ نہیں ہیں۔",
    displayOrder: 2,
  },
  {
    slug: "refund-policy",
    titleEn: "Refund Policy",
    titleUr: "واپسی کی پالیسی",
    excerptEn: REFUND_POLICY_SEO.excerptEn,
    excerptUr: "PakExcise سہولت خدمات کے لیے واپسی کی شرائط۔",
    contentEn: REFUND_POLICY_CONTENT_EN,
    contentUr:
      "واپسی کی اہلیت درخواست کی حیثیت پر منحصر ہے۔ ٹریکنگ ID کے ساتھ سپورٹ سے رابطہ کریں۔\n\nPakExcise.com نجی سہولت سروس ہے۔",
    displayOrder: 3,
  },
  {
    slug: "payment-policy",
    titleEn: "Payment Policy",
    titleUr: "ادائیگی کی پالیسی",
    excerptEn: PAYMENT_POLICY_SEO.excerptEn,
    excerptUr: "PakExcise انوائس اور ادائیگی کی تصدیق کیسے کام کرتی ہے۔",
    contentEn: PAYMENT_POLICY_CONTENT_EN,
    contentUr:
      "PakExcise سہولت فیس صرف درخواست جائزے کے بعد انوائس کے ذریعے شیئر کی جاتی ہے۔\n\nPakExcise.com نجی سہولت سروس ہے۔",
    displayOrder: 4,
  },
  {
    slug: "cookie-policy",
    titleEn: "Cookie Policy",
    titleUr: "کوکی پالیسی",
    excerptEn: COOKIE_POLICY_SEO.excerptEn,
    excerptUr: "PakExcise.com کوکیز اور اسی طرح کی ٹیکنالوجیز کیسے استعمال کرتا ہے۔",
    contentEn: COOKIE_POLICY_CONTENT_EN,
    contentUr:
      "PakExcise تصدیق، زبان اور تھیم کے لیے ضروری کوکیز استعمال کرتا ہے۔ تجزیاتی کوکیز رضامندی کے مطابق۔\n\nPakExcise.com نجی سہولت سروس ہے۔",
    displayOrder: 5,
  },
];
