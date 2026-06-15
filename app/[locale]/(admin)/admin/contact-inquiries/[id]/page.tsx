import type { ContactInquiryStatus } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { ContactInquiryStatusForm } from "@/features/contact-inquiries/admin/components/contact-inquiry-status-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import { contactInquiryRepository } from "@/server/repositories/contact-inquiry-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";

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
          <Button asChild variant="outline">
            <Link href="/admin/contact-inquiries">{t("backToList")}</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-6 rounded-lg border p-5">
          <h2 className="text-lg font-semibold">{t("detail.overview")}</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
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
              <dd className="font-medium">{inquiry.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("columns.service")}</dt>
              <dd className="font-medium">{inquiry.serviceInterest}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("detail.region")}</dt>
              <dd className="font-medium">{inquiry.regionName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("detail.city")}</dt>
              <dd className="font-medium">{inquiry.cityName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("columns.status")}</dt>
              <dd>
                <Badge>{t(`status.${inquiry.status}`)}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("columns.created")}</dt>
              <dd className="font-medium">{formatDate(inquiry.createdAt, locale)}</dd>
            </div>
          </dl>

          {inquiry.message ? (
            <div className="space-y-2 border-t pt-4">
              <h3 className="font-medium">{t("detail.message")}</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {inquiry.message}
              </p>
            </div>
          ) : null}
        </section>

        <div className="space-y-4">
          <section className="rounded-lg border p-4">
            <h2 className="text-base font-semibold">{t("detail.contact")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("detail.contactDescription")}
            </p>
            <Button asChild className="mt-4 w-full bg-[#25D366] text-white hover:bg-[#20bd5a]">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
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
        </div>
      </div>
    </div>
  );
}
