import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EditAdminStaffForm } from "@/features/admin/users/components/admin-staff-form";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminPermissionRepository } from "@/server/repositories/admin-permission-repository";
import { adminStaffRepository } from "@/server/repositories/admin-staff-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type EditAdminUserPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.users");
  return adminMetadata(t("editTitle"));
}

export default async function AdminUsersEditPage({
  params,
}: EditAdminUserPageProps) {
  await enforcePermissionAccess("users:manage")();

  const { id } = await params;
  const locale = "en";
    const t = await getTranslations("admin.users");

  const user = await adminStaffRepository.findStaffById(id);
  if (!user) {
    notFound();
  }

  const permissions =
    user.role === "ADMIN"
      ? await adminPermissionRepository.listForUser(user.id)
      : [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("editTitle")}
        description={user.email}
      />
      <EditAdminStaffForm
        userId={user.id}
        initialName={user.name ?? ""}
        initialStatus={
          user.status === "ACTIVE" ||
          user.status === "DISABLED" ||
          user.status === "SUSPENDED"
            ? user.status
            : "ACTIVE"
        }
        initialPermissions={permissions}
        canEditPermissions={user.role === "ADMIN"}
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
