import { createContentPage } from "@/features/marketing/lib/content-page";

const { generateMetadata, default: RefundPage } = createContentPage({
  pageKey: "refund",
  path: "/refund",
  breadcrumbLabel: { en: "Refund Policy", ur: "واپسی کی پالیسی" },
});

export { generateMetadata };
export default RefundPage;
