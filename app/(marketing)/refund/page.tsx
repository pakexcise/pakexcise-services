import { createContentPage } from "@/features/marketing/lib/content-page";

const { generateMetadata, default: RefundPage } = createContentPage({
  pageKey: "refund",
  path: "/refund",
  breadcrumbLabel: { en: "Refund Policy"}});

export { generateMetadata };
export default RefundPage;
