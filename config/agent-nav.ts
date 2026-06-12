export const agentNavItems = [
  { href: "/agent/dashboard", key: "dashboard", icon: "layout-dashboard" },
  { href: "/agent/applications", key: "applications", icon: "file-stack" },
  { href: "/agent/commissions", key: "commissions", icon: "wallet" },
  { href: "/agent/profile", key: "profile", icon: "user-round" },
] as const;

export type AgentNavItem = (typeof agentNavItems)[number];
