import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { CreateAdminStaffForm } from "@/features/admin/users/components/admin-staff-form";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.users");
  return adminMetadata(t("createTitle"));
}

export default async function AdminUsersNewPage() {
  await enforcePermissionAccess("users:manage")();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.users");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("createTitle")}
        description={t("createDescription")}
      />
      <CreateAdminStaffForm
        labels={{
          name: t("form.name"),
          email: t("form.email"),
          password: t("form.password"),
          role: t("form.role"),
          submit: t("form.create"),
          pending: t("form.pending"),
          permissionsTitle: t("form.permissionsTitle"),
          permissionsDescription: t("form.permissionsDescription"),
          roleAdmin: t("form.roleAdmin"),
          roleSupport: t("form.roleSupport"),
          status: t("form.status"),
          save: t("form.save"),
          statusActive: t("form.statusActive"),
          statusDisabled: t("form.statusDisabled"),
          statusSuspended: t("form.statusSuspended"),
        }}
      />
    </div>
  );
}
