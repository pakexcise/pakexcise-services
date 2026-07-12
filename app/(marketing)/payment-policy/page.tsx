import { createLegalPage } from "@/features/legal-pages/lib/create-legal-page";

const { generateMetadata, default: PaymentPolicyPage } = createLegalPage({
  slug: "payment-policy",
  breadcrumbLabel: { en: "Payment Policy"}});

export { generateMetadata };
export default PaymentPolicyPage;
