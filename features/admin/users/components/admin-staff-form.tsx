"use client";

import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { AdminPermissionPicker } from "@/features/admin/users/components/admin-permission-picker";
import {
  createAdminStaffAction,
  updateAdminStaffAction,
} from "@/features/admin/users/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Permission } from "@/server/permissions/roles";

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

type StaffFormLabels = {
  name: string;
  email: string;
  password: string;
  role: string;
  submit: string;
  pending: string;
  permissionsTitle: string;
  permissionsDescription: string;
  roleAdmin: string;
  roleSupport: string;
  status: string;
  save: string;
  statusActive: string;
  statusDisabled: string;
  statusSuspended: string;
};

type CreateAdminStaffFormProps = {
  labels: StaffFormLabels;
};

export function CreateAdminStaffForm({ labels }: CreateAdminStaffFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [role, setRole] = useState<"ADMIN" | "SUPPORT">("ADMIN");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createAdminStaffAction({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        role,
        permissions: role === "ADMIN" ? permissions : [],
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(`/admin/users/${result.data.userId}/edit`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{labels.name}</Label>
          <Input id="name" name="name" required disabled={isPending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{labels.email}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{labels.password}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">{labels.role}</Label>
          <select
            id="role"
            className={selectClassName}
            value={role}
            disabled={isPending}
            onChange={(event) =>
              setRole(event.target.value as "ADMIN" | "SUPPORT")
            }
          >
            <option value="ADMIN">{labels.roleAdmin}</option>
            <option value="SUPPORT">{labels.roleSupport}</option>
          </select>
        </div>
      </div>

      {role === "ADMIN" ? (
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">{labels.permissionsTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {labels.permissionsDescription}
            </p>
          </div>
          <AdminPermissionPicker
            selected={permissions}
            onChange={setPermissions}
            disabled={isPending}
          />
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? labels.pending : labels.submit}
      </Button>
    </form>
  );
}

type EditAdminStaffFormProps = {
  userId: string;
  initialName: string;
  initialStatus: "ACTIVE" | "DISABLED" | "SUSPENDED";
  initialPermissions: Permission[];
  canEditPermissions: boolean;
  labels: StaffFormLabels;
};

export function EditAdminStaffForm({
  userId,
  initialName,
  initialStatus,
  initialPermissions,
  canEditPermissions,
  labels,
}: EditAdminStaffFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(initialStatus);
  const [permissions, setPermissions] =
    useState<Permission[]>(initialPermissions);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateAdminStaffAction({
        userId,
        name: String(formData.get("name") ?? ""),
        status,
        permissions: canEditPermissions ? permissions : [],
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{labels.name}</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialName}
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">{labels.status}</Label>
          <select
            id="status"
            className={selectClassName}
            value={status}
            disabled={isPending}
            onChange={(event) =>
              setStatus(
                event.target.value as "ACTIVE" | "DISABLED" | "SUSPENDED",
              )
            }
          >
            <option value="ACTIVE">{labels.statusActive}</option>
            <option value="DISABLED">{labels.statusDisabled}</option>
            <option value="SUSPENDED">{labels.statusSuspended}</option>
          </select>
        </div>
      </div>

      {canEditPermissions ? (
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">{labels.permissionsTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {labels.permissionsDescription}
            </p>
          </div>
          <AdminPermissionPicker
            selected={permissions}
            onChange={setPermissions}
            disabled={isPending}
          />
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? labels.pending : labels.save}
      </Button>
    </form>
  );
}
