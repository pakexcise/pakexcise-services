import type { Metadata, Route } from "next";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/page-hero";
import { getApplyAccess } from "@/server/permissions/apply-access";

import { buildLoginRedirectUrl } from "@/config/auth";

import Link from "next/link";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

type ApplySuccessPageProps = {
  params: Promise<{ serviceSlug: string }>;
  searchParams: Promise<{ trackingId?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
    return {
    title: "Application submitted | PakExcise.com",
    robots: { index: false, follow: false },
  };
}

export default async function ApplySuccessPage({
  params,
  searchParams,
}: ApplySuccessPageProps) {
  const { serviceSlug } = await params;
  const { trackingId } = await searchParams;
  const locale = "en";
const resolvedTrackingId = trackingId?.trim() ?? "";

  if (resolvedTrackingId.length === 0) {
    redirect(`/apply/${serviceSlug}` as Route);
  }

  const access = await getApplyAccess();

  if (!access.allowed) {
    redirect(
      buildLoginRedirectUrl(
        `/apply/${serviceSlug}/success?trackingId=${encodeURIComponent(resolvedTrackingId)}`,
      ) as Route,
    );
  }

  const user = access.allowed ? access.user : null;

  if (!user) {
    return null;
  }

      return (
    <>
      <PageHero
        title={"Application submitted"}
        description={"Thank you. We have received your application and will review it shortly."}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Submitted" },
        ]}
      />

      <div className="container-site py-10 md:py-14">
        <div className="mx-auto max-w-2xl space-y-8 rounded-xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {"Your tracking ID"}
            </p>
            <p className="font-mono text-2xl font-bold tracking-wide text-primary">
              {resolvedTrackingId}
            </p>
          </div>

          <ol className="space-y-3 text-start text-sm text-muted-foreground">
            <li className="rounded-lg border px-4 py-3">{"We will review your application and contact you if anything else is needed."}</li>
            <li className="rounded-lg border px-4 py-3">{"You will receive email and WhatsApp updates about status changes."}</li>
            <li className="rounded-lg border px-4 py-3">{"Keep your tracking ID safe — you can use it on the track page or in your dashboard."}</li>
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
                {"View my applications"}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link
                href={`/track?trackingId=${encodeURIComponent(resolvedTrackingId)}` as Route}
              >
                {"Track this application"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
