import { createMarketingPage } from "@/features/marketing/lib/create-marketing-page";

const { generateMetadata, default: RefundPolicyPage } = createMarketingPage({
  pageKey: "refund-policy",
  path: "/refund-policy",
  breadcrumbLabel: { en: "Refund policy", ur: "واپسی کی پالیسی" },
  showCta: false,
});

export { generateMetadata };
export default RefundPolicyPage;
