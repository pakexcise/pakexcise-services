import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { isApprovedActiveAgent } from "@/features/agents/lib/is-approved-agent";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/server/auth/current-user";
import { listPublicServices } from "@/server/repositories/service-repository";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("agent.newApplication");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function AgentNewApplicationPage() {
  const locale = "en";
    const user = await getCurrentUser();

  if (!user || !isApprovedActiveAgent(user)) {
    redirect("/agent/dashboard");
    return;
  }

  const t = await getTranslations("agent.newApplication");
  const services = await listPublicServices(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {services.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => {
            const name = service.nameEn;
            const description =
              service.shortDescriptionEn;

            return (
              <div key={service.id} className="rounded-xl border p-5">
                <h2 className="font-semibold">{name}</h2>
                {description ? (
                  <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                ) : null}
                <Button asChild className="mt-4">
                  <Link href={`/apply/${service.slug}`}>{t("startApplication")}</Link>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
