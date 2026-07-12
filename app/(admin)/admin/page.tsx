import { redirect } from "next/navigation";
export default async function AdminIndexPage() {
  const locale = "en";
  redirect("/admin/dashboard");
}
