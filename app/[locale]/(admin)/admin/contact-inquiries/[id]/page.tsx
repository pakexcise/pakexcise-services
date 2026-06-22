import type { ContactInquiryStatus } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { ContactInquiryStatusForm } from "@/features/contact-inquiries/admin/components/contact-inquiry-status-form";
import { ContactInquiryStatusBadge } from "@/features/contact-inquiries/admin/components/contact-inquiry-status-badge";
import { DeleteContactInquiryButton } from "@/features/contact-inquiries/admin/components/delete-contact-inquiry-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import { contactInquiryRepository } from "@/server/repositories/contact-inquiry-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { requireAdminPortal } from "@/server/permissions/guards";
import { isSuperAdminRole } from "@/server/permissions/admin-scope";

type AdminContactInquiryDetailPageProps = {
  params: Promise<{ id: string }>;
};

const statusOptions: ContactInquiryStatus[] = ["NEW", "CONTACTED", "CLOSED", "SPAM"];

export async function generateMetadata({
  params,
}: AdminContactInquiryDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("admin.contactInquiries");
  const inquiry = await contactInquiryRepository.findAdminById(id);
  return adminMetadata(
    inquiry ? `${t("title")} — ${inquiry.referenceId}` : t("title"),
  );
}

export default async function AdminContactInquiryDetailPage({
  params,
}: AdminContactInquiryDetailPageProps) {
  await enforcePermissionAccess("application:read")();

  const user = await requireAdminPortal();
  const isSuperAdmin = isSuperAdminRole(user.role);

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.contactInquiries");

  const { id } = await params;
  const inquiry = await contactInquiryRepository.findAdminById(id);

  if (!inquiry) {
    notFound();
  }

  const whatsappHref = buildWhatsAppUrl(
    inquiry.phone,
    `Hi ${inquiry.fullName}, this is PakExcise support regarding your contact inquiry ${inquiry.referenceId}.`,
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={inquiry.referenceId}
        description={t("detailDescription")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/contact-inquiries">{t("backToList")}</Link>
            </Button>
            {isSuperAdmin ? (
              <Button asChild>
                <Link href={`/admin/contact-inquiries/${inquiry.id}/edit`}>
                  <Pencil className="size-4" aria-hidden="true" />
                  {t("edit")}
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <ContactInquiryStatusBadge
          status={inquiry.status}
          label={t(`status.${inquiry.status}`)}
        />
        <Badge variant="outline">{inquiry.serviceInterest}</Badge>
        <span className="text-sm text-muted-foreground">
          {t("columns.created")}: {formatDate(inquiry.createdAt, locale)}
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="text-lg font-semibold">{t("detail.overview")}</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">{t("columns.name")}</dt>
                <dd className="font-medium">{inquiry.fullName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("columns.phone")}</dt>
                <dd className="font-medium">{inquiry.phone}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("detail.email")}</dt>
                <dd>{inquiry.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("columns.service")}</dt>
                <dd>{inquiry.serviceInterest}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("detail.region")}</dt>
                <dd>{inquiry.regionName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("detail.city")}</dt>
                <dd>{inquiry.cityName ?? "—"}</dd>
              </div>
            </dl>
          </section>

          {inquiry.message ? (
            <section className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">{t("detail.message")}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {inquiry.message}
              </p>
            </section>
          ) : null}

          {inquiry.adminNotes ? (
            <section className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">{t("detail.notesLabel")}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {inquiry.adminNotes}
              </p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="text-base font-semibold">{t("detail.contact")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("detail.contactDescription")}
            </p>
            <Button asChild className="mt-4 w-full bg-[#25D366] text-white hover:bg-[#20bd5a]">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-4" />
                {t("detail.whatsappCta")}
              </a>
            </Button>
          </section>

          <ContactInquiryStatusForm
            inquiryId={inquiry.id}
            currentStatus={inquiry.status}
            adminNotes={inquiry.adminNotes}
            statusOptions={statusOptions.map((value) => ({
              value,
              label: t(`status.${value}`),
            }))}
            labels={{
              status: t("detail.statusLabel"),
              notes: t("detail.notesLabel"),
              notesPlaceholder: t("detail.notesPlaceholder"),
              submit: t("detail.save"),
              submitting: t("detail.saving"),
              success: t("detail.saved"),
              error: t("detail.saveError"),
            }}
          />

          {isSuperAdmin ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
              <h2 className="text-base font-semibold text-destructive">
                {t("delete.title")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("delete.description")}
              </p>
              <div className="mt-4">
                <DeleteContactInquiryButton
                  inquiryId={inquiry.id}
                  labels={{
                    trigger: t("delete.trigger"),
                    confirm: t("delete.confirm", {
                      reference: inquiry.referenceId,
                    }),
                    deleting: t("delete.deleting"),
                    error: t("delete.error"),
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
