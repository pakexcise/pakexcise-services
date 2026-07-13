import type { Permission } from "@/server/permissions/roles";
import { hasPermissionInSet } from "@/server/permissions/roles";

import {
  QuickLinks,
  quickLinkIcons,
} from "@/features/admin/components/quick-links";

type DashboardQuickLinksProps = {
  effectivePermissions: readonly Permission[];
  labels: {
    operationsTitle: string;
    platformTitle: string;
    staffTitle: string;
    services: string;
    applicationQueue: string;
    paymentVerification: string;
    notifications: string;
    auditLogs: string;
    seo: string;
    redirects: string;
    blog: string;
    settings: string;
    users: string;
  };
};

type QuickLinkDef = {
  href: string;
  label: string;
  icon: React.ReactNode;
  permission?: Permission;
};

export function DashboardQuickLinks({
  effectivePermissions,
  labels,
}: DashboardQuickLinksProps) {
  const operationsLinks: QuickLinkDef[] = [
    {
      href: "/admin/services",
      label: labels.services,
      icon: quickLinkIcons.services,
      permission: "service:manage",
    },
    {
      href: "/admin/applications?status=REVIEW",
      label: labels.applicationQueue,
      icon: quickLinkIcons.applications,
      permission: "application:read",
    },
    {
      href: "/admin/applications?status=PAYMENT_UPLOADED",
      label: labels.paymentVerification,
      icon: quickLinkIcons.payments,
      permission: "payment:verify",
    },
    {
      href: "/admin/notifications",
      label: labels.notifications,
      icon: quickLinkIcons.notifications,
      permission: "application:read",
    },
    {
      href: "/admin/audit-logs",
      label: labels.auditLogs,
      icon: quickLinkIcons.audit,
      permission: "audit:read",
    },
  ];

  const platformLinks: QuickLinkDef[] = [
    {
      href: "/admin/seo",
      label: labels.seo,
      icon: quickLinkIcons.seo,
      permission: "platform:manage",
    },
    {
      href: "/admin/redirects",
      label: labels.redirects,
      icon: quickLinkIcons.redirects,
      permission: "platform:manage",
    },
    {
      href: "/admin/blog",
      label: labels.blog,
      icon: quickLinkIcons.blog,
      permission: "content:manage",
    },
    {
      href: "/admin/settings",
      label: labels.settings,
      icon: quickLinkIcons.settings,
      permission: "settings:manage",
    },
  ];

  const staffLinks: QuickLinkDef[] = [
    {
      href: "/admin/users",
      label: labels.users,
      icon: quickLinkIcons.users,
      permission: "users:manage",
    },
  ];

  function filterLinks(links: QuickLinkDef[]) {
    return links
      .filter(
        (link) =>
          !link.permission ||
          hasPermissionInSet(effectivePermissions, link.permission),
      )
      .map(({ href, label, icon }) => ({ href, label, icon }));
  }

  const visibleOperations = filterLinks(operationsLinks);
  const visiblePlatform = filterLinks(platformLinks);
  const visibleStaff = filterLinks(staffLinks);

  return (
    <div className="space-y-4">
      {visibleOperations.length > 0 ? (
        <QuickLinks title={labels.operationsTitle} links={visibleOperations} />
      ) : null}
      {visiblePlatform.length > 0 ? (
        <QuickLinks title={labels.platformTitle} links={visiblePlatform} />
      ) : null}
      {visibleStaff.length > 0 ? (
        <QuickLinks title={labels.staffTitle} links={visibleStaff} />
      ) : null}
    </div>
  );
}
