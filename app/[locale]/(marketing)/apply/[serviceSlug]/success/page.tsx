import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/page-hero";
import { Link, redirect } from "@/i18n/navigation";
import { getApplyAccess } from "@/server/permissions/apply-access";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { buildLoginRedirectUrl } from "@/config/auth";

export const dynamic = "force-dynamic";

type ApplySuccessPageProps = {
  params: Promise<{ serviceSlug: string }>;
  searchParams: Promise<{ trackingId?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("apply.success");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function ApplySuccessPage({
  params,
  searchParams,
}: ApplySuccessPageProps) {
  const { serviceSlug } = await params;
  const { trackingId } = await searchParams;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const resolvedTrackingId = trackingId?.trim() ?? "";

  if (resolvedTrackingId.length === 0) {
    redirect({ href: `/apply/${serviceSlug}`, locale });
  }

  const access = await getApplyAccess();

  if (!access.allowed) {
    redirect({
      href: buildLoginRedirectUrl(
        `/apply/${serviceSlug}/success?trackingId=${encodeURIComponent(resolvedTrackingId)}`,
      ),
      locale,
    });
  }

  const user = access.allowed ? access.user : null;

  if (!user) {
    return null;
  }

  const t = await getTranslations("apply.success");
  const tNav = await getTranslations("nav");

  return (
    <>
      <PageHero
        title={t("title")}
        description={t("description")}
        breadcrumbs={[
          { label: tNav("home"), href: "/" },
          { label: t("breadcrumb") },
        ]}
      />

      <div className="container-site py-10 md:py-14">
        <div className="mx-auto max-w-2xl space-y-8 rounded-xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {t("trackingLabel")}
            </p>
            <p className="font-mono text-2xl font-bold tracking-wide text-primary">
              {resolvedTrackingId}
            </p>
          </div>

          <ol className="space-y-3 text-start text-sm text-muted-foreground">
            <li className="rounded-lg border px-4 py-3">{t("nextStep1")}</li>
            <li className="rounded-lg border px-4 py-3">{t("nextStep2")}</li>
            <li className="rounded-lg border px-4 py-3">{t("nextStep3")}</li>
          </ol>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link
                href={
                  user.role === "AGENT"
                    ? "/agent/dashboard"
                    : "/customer/dashboard"
                }
              >
                {t("viewDashboard")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link
                href={`/track?trackingId=${encodeURIComponent(resolvedTrackingId)}`}
              >
                {t("trackApplication")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
