import { createContentPage } from "@/features/marketing/lib/content-page";

const { generateMetadata, default: ContactPage } = createContentPage({
  pageKey: "contact",
  path: "/contact",
  breadcrumbLabel: { en: "Contact", ur: "رابطہ" },
  showSocialLinks: true,
});

export { generateMetadata };
export default ContactPage;
