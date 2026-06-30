import type { UserRole } from "@prisma/client";

import { getDashboardPathByRole } from "@/features/auth/lib/get-dashboard-path-by-role";

export type AccountMenuItemKey =
  | "dashboard"
  | "applications"
  | "track"
  | "profile"
  | "logout";

export type AccountMenuLink = {
  key: AccountMenuItemKey;
  href?: string;
};

export function getAccountMenuLinks(role: UserRole): AccountMenuLink[] {
  const dashboardHref = getDashboardPathByRole(role);
  const items: AccountMenuLink[] = [
    { key: "dashboard", href: dashboardHref },
  ];

  switch (role) {
    case "CUSTOMER":
      items.push(
        { key: "applications", href: "/customer/dashboard" },
        { key: "track", href: "/track" },
        { key: "profile", href: "/customer/profile" },
      );
      break;
    case "AGENT":
      items.push(
        { key: "applications", href: "/agent/applications" },
        { key: "profile", href: "/agent/profile" },
      );
      break;
    default:
      break;
  }

  items.push({ key: "logout" });
  return items;
}
