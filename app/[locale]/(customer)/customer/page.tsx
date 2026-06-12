import { redirect } from "@/i18n/navigation";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export default async function CustomerIndexPage() {
  const locale = await getCurrentLocale();
  redirect({ href: "/customer/dashboard", locale });
}
