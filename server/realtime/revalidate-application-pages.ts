import "server-only";

import { revalidatePath } from "next/cache";

export function revalidateApplicationPages(applicationId: string): void {
  revalidatePath("/admin/applications", "layout");
  revalidatePath("/admin/dashboard", "layout");
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/customer/dashboard", "layout");
  revalidatePath(`/customer/applications/${applicationId}`);
  revalidatePath("/agent/applications", "layout");
  revalidatePath(`/agent/applications/${applicationId}`);
  revalidatePath("/support/applications", "layout");
  revalidatePath(`/support/applications/${applicationId}`);
}
