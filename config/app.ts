import { siteConfig } from "@/config/site";

export const appConfig = {
  name: siteConfig.name,
  legalName: siteConfig.legalName,
  defaultLocale: siteConfig.defaultLocale,
  locales: siteConfig.locales,
  defaultTheme: siteConfig.defaultTheme,
  supportEmail: siteConfig.contact.email,
  whatsappDefaultMessage: siteConfig.contact.whatsappMessage,
} as const;

export type AppLocale = (typeof appConfig.locales)[number];

export const roleHierarchy = {
  GUEST: 0,
  CUSTOMER: 1,
  AGENT: 2,
  SUPPORT: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
} as const;

export type UserRole = keyof typeof roleHierarchy;

export const applicationStatuses = [
  "SUBMITTED",
  "REVIEW",
  "DOCS_REQUIRED",
  "INVOICE_SENT",
  "PAYMENT_UPLOADED",
  "PAYMENT_VERIFIED",
  "IN_PROGRESS",
  "AT_OFFICE",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export const privateRoutePrefixes = [
  "/admin",
  "/customer",
  "/agent",
  "/api",
] as const;

export const publicMarketingRoutes = [
  "/",
  "/services",
  "/regions",
  "/guides",
  "/faqs",
  "/track",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/refund",
  "/blog",
] as const;
