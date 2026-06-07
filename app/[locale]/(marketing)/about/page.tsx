import { createContentPage } from "@/features/marketing/lib/content-page";

const { generateMetadata, default: AboutPage } = createContentPage({
  pageKey: "about",
  path: "/about",
  breadcrumbLabel: { en: "About", ur: "ہمارے بارے میں" },
  showSocialLinks: true,
});

export { generateMetadata };
export default AboutPage;
