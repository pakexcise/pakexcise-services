import { createMarketingPage } from "@/features/marketing/lib/create-marketing-page";

const { generateMetadata, default: PaymentPolicyPage } = createMarketingPage({
  pageKey: "payment-policy",
  path: "/payment-policy",
  breadcrumbLabel: { en: "Payment policy", ur: "ادائیگی کی پالیسی" },
  showCta: false,
});

export { generateMetadata };
export default PaymentPolicyPage;
