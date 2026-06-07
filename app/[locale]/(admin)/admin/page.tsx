import { redirect } from "@/i18n/navigation";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export default async function AdminIndexPage() {
  const locale = await getCurrentLocale();
  redirect({ href: "/admin/dashboard", locale });
}
