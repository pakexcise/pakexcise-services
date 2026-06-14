"use client";

import { useTranslations } from "next-intl";

import {
  grantableAdminPermissions,
  permissionGroups,
  type Permission,
  type PermissionGroupKey,
} from "@/server/permissions/roles";

type AdminPermissionPickerProps = {
  selected: Permission[];
  onChange: (permissions: Permission[]) => void;
  disabled?: boolean;
};

const grantableSet = new Set<string>(grantableAdminPermissions);

const pickerGroups = (
  Object.entries(permissionGroups) as Array<
    [PermissionGroupKey, (typeof permissionGroups)[PermissionGroupKey]]
  >
)
  .map(([key, group]) => ({
    key,
    labelKey: group.labelKey,
    permissions: group.permissions.filter((permission) =>
      grantableSet.has(permission),
    ),
  }))
  .filter((group) => group.permissions.length > 0);

export function AdminPermissionPicker({
  selected,
  onChange,
  disabled = false,
}: AdminPermissionPickerProps) {
  const t = useTranslations("admin.users.permissions");

  function togglePermission(permission: Permission, checked: boolean) {
    if (checked) {
      onChange([...new Set([...selected, permission])]);
      return;
    }

    onChange(selected.filter((value) => value !== permission));
  }

  return (
    <div className="space-y-4">
      {pickerGroups.map((group) => (
        <div key={group.key} className="rounded-lg border bg-muted/20 p-4">
          <p className="mb-3 text-sm font-semibold">
            {t(`groups.${group.labelKey}`)}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.permissions.map((permission) => {
              const checked = selected.includes(permission);

              return (
                <label
                  key={permission}
                  className="flex cursor-pointer items-start gap-3 rounded-md border bg-background px-3 py-2.5"
                >
                  <input
                    type="checkbox"
                    className="mt-1 size-4 rounded border"
                    checked={checked}
                    disabled={disabled}
                    onChange={(event) =>
                      togglePermission(permission, event.target.checked)
                    }
                  />
                  <span className="space-y-0.5">
                    <span className="block text-sm font-medium">
                      {t(`items.${permission}.title`)}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {t(`items.${permission}.description`)}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
