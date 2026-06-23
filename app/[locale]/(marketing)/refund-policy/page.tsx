import { createLegalPage } from "@/features/legal-pages/lib/create-legal-page";

const { generateMetadata, default: RefundPolicyPage } = createLegalPage({
  slug: "refund-policy",
  breadcrumbLabel: { en: "Refund Policy", ur: "واپسی کی پالیسی" },
});

export { generateMetadata };
export default RefundPolicyPage;
