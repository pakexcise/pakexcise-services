import { createMarketingPage } from "@/features/marketing/lib/create-marketing-page";

const { generateMetadata, default: AgentRegisterPage } = createMarketingPage({
  pageKey: "agent-register",
  path: "/agent-register",
  breadcrumbLabel: { en: "Become an agent"},
  applyHref: "/signup?intent=agent"});

export { generateMetadata };
export default AgentRegisterPage;
