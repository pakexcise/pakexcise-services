import type { GuestLeadStatus } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { GuestLeadStatusForm } from "@/features/guest-leads/admin/components/guest-lead-status-form";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";
import { formatDate } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import { guestLeadRepository } from "@/server/repositories/guest-lead-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

const basePath = "/support/guest-leads";

type SupportGuestLeadDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: SupportGuestLeadDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("admin");
  const lead = await guestLeadRepository.findAdminById(id);
  return adminMetadata(
    lead ? `${t("guestLeads.title")} — ${lead.referenceId}` : t("guestLeads.title"),
  );
}

const statusOptions: GuestLeadStatus[] = [
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "CONVERTED",
  "CLOSED",
  "SPAM",
];

export default async function SupportGuestLeadDetailPage({
  params,
}: SupportGuestLeadDetailPageProps) {
  const { id } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const lead = await guestLeadRepository.findAdminById(id);

  if (!lead) {
    notFound();
  }

  const serviceName = pickLocalized(locale, {
    en: lead.serviceNameEn,
    ur: lead.serviceNameUr,
  });
  const regionName = pickLocalized(locale, {
    en: lead.regionNameEn,
    ur: lead.regionNameUr,
  });
  const whatsappMessage = [
    `Hello ${lead.fullName},`,
    "",
    `This is PakExcise support regarding your request for ${serviceName}.`,
    lead.referenceId ? `Reference: ${lead.referenceId}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={lead.referenceId}
        description={t("guestLeads.detailDescription")}
        actions={
          <Button asChild variant="outline">
            <Link href={basePath}>{t("guestLeads.backToList")}</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold">{t("guestLeads.detail.overview")}</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">{t("guestLeads.columns.name")}</dt>
                <dd className="font-medium">{lead.fullName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("guestLeads.columns.phone")}</dt>
                <dd className="font-medium">{lead.phone}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("guestLeads.detail.email")}</dt>
                <dd>{lead.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("guestLeads.columns.service")}</dt>
                <dd>{serviceName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("guestLeads.detail.region")}</dt>
                <dd>{regionName || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("guestLeads.detail.city")}</dt>
                <dd>{lead.cityName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("guestLeads.columns.status")}</dt>
                <dd>
                  <Badge>{t(`guestLeads.status.${lead.status}`)}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("guestLeads.columns.created")}</dt>
                <dd>{formatDate(lead.createdAt, locale)}</dd>
              </div>
            </dl>
          </section>

          {lead.vehicleInfo || lead.licenseInfo || lead.message ? (
            <section className="rounded-lg border p-4">
              <h2 className="text-lg font-semibold">{t("guestLeads.detail.requestDetails")}</h2>
              <div className="mt-4 space-y-3 text-sm">
                {lead.vehicleInfo ? (
                  <div>
                    <p className="font-medium">{t("guestLeads.detail.vehicleInfo")}</p>
                    <p className="text-muted-foreground">{lead.vehicleInfo}</p>
                  </div>
                ) : null}
                {lead.licenseInfo ? (
                  <div>
                    <p className="font-medium">{t("guestLeads.detail.licenseInfo")}</p>
                    <p className="text-muted-foreground">{lead.licenseInfo}</p>
                  </div>
                ) : null}
                {lead.message ? (
                  <div>
                    <p className="font-medium">{t("guestLeads.detail.message")}</p>
                    <p className="whitespace-pre-wrap text-muted-foreground">{lead.message}</p>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="text-base font-semibold">{t("guestLeads.detail.contact")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("guestLeads.detail.contactDescription")}
            </p>
            <Button asChild className="mt-4 w-full bg-[#25D366] text-white hover:bg-[#20bd5a]">
              <a
                href={buildWhatsAppUrl(lead.phone, whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                {t("guestLeads.detail.whatsappCta")}
              </a>
            </Button>
          </div>

          <GuestLeadStatusForm
            leadId={lead.id}
            currentStatus={lead.status}
            adminNotes={lead.adminNotes}
            statusOptions={statusOptions.map((value) => ({
              value,
              label: t(`guestLeads.status.${value}`),
            }))}
            labels={{
              status: t("guestLeads.detail.statusLabel"),
              notes: t("guestLeads.detail.notesLabel"),
              notesPlaceholder: t("guestLeads.detail.notesPlaceholder"),
              submit: t("guestLeads.detail.save"),
              submitting: t("guestLeads.detail.saving"),
              success: t("guestLeads.detail.saved"),
              error: t("guestLeads.detail.saveError"),
            }}
          />
        </aside>
      </div>
    </div>
  );
}
