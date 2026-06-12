import { createMarketingPage } from "@/features/marketing/lib/create-marketing-page";

const { generateMetadata, default: AgentsPage } = createMarketingPage({
  pageKey: "agents",
  path: "/agents",
  breadcrumbLabel: { en: "Agents", ur: "ایجنٹس" },
  applyHref: "/agent-register",
});

export { generateMetadata };
export default AgentsPage;
