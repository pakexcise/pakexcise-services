import type { GuestLeadStatus } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { DeleteSupportRequestButton } from "@/features/guest-leads/admin/components/delete-support-request-button";
import { GuestLeadStatusForm } from "@/features/guest-leads/admin/components/guest-lead-status-form";
import { SupportRequestStatusBadge } from "@/features/guest-leads/admin/components/support-request-status-badge";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";
import { formatDate } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import { guestLeadRepository } from "@/server/repositories/guest-lead-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { requireAdminPortal } from "@/server/permissions/guards";
import { isSuperAdminRole } from "@/server/permissions/admin-scope";

type AdminGuestLeadDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: AdminGuestLeadDetailPageProps): Promise<Metadata> {
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

export default async function AdminGuestLeadDetailPage({
  params,
}: AdminGuestLeadDetailPageProps) {
  await enforcePermissionAccess("application:read")();

  const user = await requireAdminPortal();
  const isSuperAdmin = isSuperAdminRole(user.role);

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
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/guest-leads">{t("guestLeads.backToList")}</Link>
            </Button>
            {isSuperAdmin ? (
              <Button asChild>
                <Link href={`/admin/guest-leads/${lead.id}/edit`}>
                  <Pencil className="size-4" aria-hidden="true" />
                  {t("guestLeads.edit")}
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <SupportRequestStatusBadge
          status={lead.status}
          label={t(`guestLeads.status.${lead.status}`)}
        />
        <Badge variant="outline">{t(`guestLeads.source.${lead.source}`)}</Badge>
        <span className="text-sm text-muted-foreground">
          {t("guestLeads.columns.created")}: {formatDate(lead.createdAt, locale)}
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="text-lg font-semibold">{t("guestLeads.detail.overview")}</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
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
            </dl>
          </section>

          {lead.vehicleInfo || lead.licenseInfo || lead.message ? (
            <section className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">
                {t("guestLeads.detail.requestDetails")}
              </h2>
              <div className="mt-4 space-y-4 text-sm">
                {lead.vehicleInfo ? (
                  <div>
                    <p className="font-medium">{t("guestLeads.detail.vehicleInfo")}</p>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                      {lead.vehicleInfo}
                    </p>
                  </div>
                ) : null}
                {lead.licenseInfo ? (
                  <div>
                    <p className="font-medium">{t("guestLeads.detail.licenseInfo")}</p>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                      {lead.licenseInfo}
                    </p>
                  </div>
                ) : null}
                {lead.message ? (
                  <div>
                    <p className="font-medium">{t("guestLeads.detail.message")}</p>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                      {lead.message}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {lead.adminNotes ? (
            <section className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">{t("guestLeads.detail.notesLabel")}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {lead.adminNotes}
              </p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
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
                <WhatsAppIcon className="size-4" />
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

          {isSuperAdmin ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
              <h2 className="text-base font-semibold text-destructive">
                {t("guestLeads.delete.title")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("guestLeads.delete.description")}
              </p>
              <div className="mt-4">
                <DeleteSupportRequestButton
                  leadId={lead.id}
                  labels={{
                    trigger: t("guestLeads.delete.trigger"),
                    confirm: t("guestLeads.delete.confirm", {
                      reference: lead.referenceId,
                    }),
                    deleting: t("guestLeads.delete.deleting"),
                    error: t("guestLeads.delete.error"),
                  }}
                />
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
