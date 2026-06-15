import type { ServiceCardLabels } from "@/components/marketing/service-card";

type Translator = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export function buildServiceCardLabels(
  tCommon: Translator,
  tMarketing: Translator,
): ServiceCardLabels {
  return {
    learnMoreLabel: tCommon("learnMore"),
    allProvincesLabel: tMarketing("services.allProvinces"),
    conjunction: tMarketing("services.regionConjunction"),
    availableInTemplate: tMarketing("services.availableInTemplate"),
    summaryTemplate: tMarketing("services.summaryTemplate"),
  };
}
