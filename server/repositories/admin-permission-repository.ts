import "server-only";

import { Repository } from "@/server/repositories/base/repository";
import { isValidPermission, type Permission as AppPermission } from "@/server/permissions/roles";

export class AdminPermissionRepository extends Repository {
  async listForUser(userId: string): Promise<AppPermission[]> {
    const rows = await this.db.adminPermissionGrant.findMany({
      where: { userId },
      select: { permission: true },
      orderBy: { permission: "asc" },
    });

    return rows
      .map((row) => row.permission)
      .filter(isValidPermission);
  }

  async replaceForUser(input: {
    userId: string;
    permissions: AppPermission[];
    grantedBy: string;
  }): Promise<void> {
    const uniquePermissions = [...new Set(input.permissions)];

    await this.db.$transaction(async (tx) => {
      await tx.adminPermissionGrant.deleteMany({
        where: { userId: input.userId },
      });

      if (uniquePermissions.length === 0) {
        return;
      }

      await tx.adminPermissionGrant.createMany({
        data: uniquePermissions.map((permission) => ({
          userId: input.userId,
          permission,
          grantedBy: input.grantedBy,
        })),
      });
    });
  }
}

export const adminPermissionRepository = new AdminPermissionRepository();
