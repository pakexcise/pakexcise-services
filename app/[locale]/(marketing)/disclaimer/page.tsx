import { createContentPage } from "@/features/marketing/lib/content-page";

const { generateMetadata, default: DisclaimerPage } = createContentPage({
  pageKey: "disclaimer",
  path: "/disclaimer",
  breadcrumbLabel: { en: "Disclaimer", ur: "ڈس کلیمر" },
});

export { generateMetadata };
export default DisclaimerPage;
