import { buildBrandThemeCss } from "@/features/settings/lib/brand-theme-css";
import { getBrandingSettings } from "@/features/settings/lib/public-settings-cache";

export async function BrandThemeStyles() {
  const branding = await getBrandingSettings();
  const css = buildBrandThemeCss(branding);

  return (
    <style
      id="brand-theme-overrides"
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
