import { redirect } from "next/navigation";
export default async function CustomerIndexPage() {
  const locale = "en";
  redirect("/customer/dashboard");
}
