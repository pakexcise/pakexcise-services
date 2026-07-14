import type { Metadata } from "next";
import { getTranslations, type TFunction } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { SettingsPanel } from "@/features/settings/admin/components/settings-panel";
import type { SettingsPanelLabels } from "@/features/settings/admin/lib/labels";
import { requirePermission } from "@/server/permissions/guards";
import { loadAdminSettingsSnapshot } from "@/server/repositories/admin-settings-repository";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return adminMetadata(t("nav.settings"));
}

export default async function AdminSettingsPage() {
  await requirePermission("settings:manage");

  const t = await getTranslations("admin");

  const [settings, labels] = await Promise.all([
    loadAdminSettingsSnapshot(),
    buildLabels(t),
  ]);

  return (
    <div>
      <AdminPageHeader
        title={t("settingsPanel.title")}
        description={t("settingsPanel.description")}
      />
      <SettingsPanel initialValues={settings} labels={labels} />
    </div>
  );
}

async function buildLabels(
  t: TFunction,
): Promise<SettingsPanelLabels> {
  return {
    tabs: {
      business: t("settingsPanel.tabs.business"),
      payment: t("settingsPanel.tabs.payment"),
      seo: t("settingsPanel.tabs.seo"),
      tracking: t("settingsPanel.tabs.tracking"),
      features: t("settingsPanel.tabs.features"),
    },
    save: t("settingsPanel.save"),
    saving: t("settingsPanel.saving"),
    saved: t("settingsPanel.saved"),
    error: t("settingsPanel.error"),
    secretsNote: t("settingsPanel.secretsNote"),
    business: {
      siteName: t("settingsPanel.business.siteName"),
      addressEn: t("settingsPanel.business.addressEn"),
      globalSiteNote: t("settingsPanel.business.globalSiteNote"),
    },
    payment: {
      jazzCashInstructionsEn: t("settingsPanel.payment.jazzCashInstructionsEn"),
      easypaisaInstructionsEn: t("settingsPanel.payment.easypaisaInstructionsEn"),
      bankTransferInstructionsEn: t("settingsPanel.payment.bankTransferInstructionsEn"),
      paymentAccountDisplayName: t("settingsPanel.payment.paymentAccountDisplayName"),
      manualPaymentEnabled: t("settingsPanel.payment.manualPaymentEnabled"),
      jazzCashGatewayEnabled: t("settingsPanel.payment.jazzCashGatewayEnabled"),
      easypaisaGatewayEnabled: t("settingsPanel.payment.easypaisaGatewayEnabled"),
      cardGatewayEnabled: t("settingsPanel.payment.cardGatewayEnabled"),
      gatewayPhase2Note: t("settingsPanel.payment.gatewayPhase2Note"),
      phase2Hint: t("settingsPanel.payment.phase2Hint"),
      methodsTitle: t("settingsPanel.payment.methodsTitle"),
      methodsEmpty: t("settingsPanel.payment.methodsEmpty"),
      addMethod: t("settingsPanel.payment.addMethod"),
      removeMethod: t("settingsPanel.payment.removeMethod"),
      methodLabel: t("settingsPanel.payment.methodLabel"),
      methodNameEn: t("settingsPanel.payment.methodNameEn"),
      accountTitle: t("settingsPanel.payment.accountTitle"),
      accountNumber: t("settingsPanel.payment.accountNumber"),
      iban: t("settingsPanel.payment.iban"),
      methodInstructionsEn: t("settingsPanel.payment.methodInstructionsEn"),
      methodActive: t("settingsPanel.payment.methodActive"),
      displayOrder: t("settingsPanel.payment.displayOrder"),
    },
    seo: {
      defaultMetaTitleEn: t("settingsPanel.seo.defaultMetaTitleEn"),
      defaultMetaDescriptionEn: t("settingsPanel.seo.defaultMetaDescriptionEn"),
      defaultOgImage: t("settingsPanel.seo.defaultOgImage"),
      defaultTwitterImage: t("settingsPanel.seo.defaultTwitterImage"),
      canonicalDomain: t("settingsPanel.seo.canonicalDomain"),
      sitemapEnabled: t("settingsPanel.seo.sitemapEnabled"),
      organizationName: t("settingsPanel.seo.organizationName"),
      organizationDescriptionEn: t("settingsPanel.seo.organizationDescriptionEn"),
      organizationLogoPath: t("settingsPanel.seo.organizationLogoPath"),
      organizationAreaServed: t("settingsPanel.seo.organizationAreaServed"),
      localBusinessName: t("settingsPanel.seo.localBusinessName"),
      localBusinessDescriptionEn: t("settingsPanel.seo.localBusinessDescriptionEn"),
      localBusinessPriceRange: t("settingsPanel.seo.localBusinessPriceRange"),
      localBusinessPriceRangeOptional: t("settingsPanel.seo.localBusinessPriceRangeOptional"),
      localBusinessAreaServed: t("settingsPanel.seo.localBusinessAreaServed"),
      localBusinessTelephone: t("settingsPanel.seo.localBusinessTelephone"),
      localBusinessStreetAddress: t("settingsPanel.seo.localBusinessStreetAddress"),
      localBusinessAddressLocality: t("settingsPanel.seo.localBusinessAddressLocality"),
      localBusinessPostalCode: t("settingsPanel.seo.localBusinessPostalCode"),
      organizationSection: t("settingsPanel.seo.organizationSection"),
      localBusinessSection: t("settingsPanel.seo.localBusinessSection"),
    },
    tracking: {
      consentMode: t("settingsPanel.tracking.consentMode"),
      requireConsentBeforeScripts: t("settingsPanel.tracking.requireConsentBeforeScripts"),
      showConsentBanner: t("settingsPanel.tracking.showConsentBanner"),
      consentImplied: t("settingsPanel.tracking.consentImplied"),
      consentExplicit: t("settingsPanel.tracking.consentExplicit"),
      consentDisabled: t("settingsPanel.tracking.consentDisabled"),
      publicIdsNote: t("settingsPanel.tracking.publicIdsNote"),
    },
    features: {
      agentModuleEnabled: t("settingsPanel.features.agentModuleEnabled"),
      blogEnabled: t("settingsPanel.features.blogEnabled"),
      reviewsEnabled: t("settingsPanel.features.reviewsEnabled"),
      contactFormEnabled: t("settingsPanel.features.contactFormEnabled"),
      submitRequestEnabled: t("settingsPanel.features.submitRequestEnabled"),
      floatingWhatsappEnabled: t("settingsPanel.features.floatingWhatsappEnabled"),
      whatsappChannelEnabled: t("settingsPanel.features.whatsappChannelEnabled"),
      whatsappNotificationsEnabled: t("settingsPanel.features.whatsappNotificationsEnabled"),
      smsFallbackEnabled: t("settingsPanel.features.smsFallbackEnabled"),
      maintenanceMode: t("settingsPanel.features.maintenanceMode"),
      maintenanceMessageEn: t("settingsPanel.features.maintenanceMessageEn"),
    },
  };
}
