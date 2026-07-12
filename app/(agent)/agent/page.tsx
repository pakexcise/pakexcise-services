import { redirect } from "next/navigation";
export default async function AgentIndexPage() {
  const locale = "en";
  redirect("/agent/dashboard");
}
