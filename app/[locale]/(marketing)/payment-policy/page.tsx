import { createLegalPage } from "@/features/legal-pages/lib/create-legal-page";

const { generateMetadata, default: PaymentPolicyPage } = createLegalPage({
  slug: "payment-policy",
  breadcrumbLabel: { en: "Payment Policy", ur: "ادائیگی کی پالیسی" },
});

export { generateMetadata };
export default PaymentPolicyPage;
