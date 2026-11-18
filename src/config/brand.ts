// Single source of truth for the product identity. "Qamqor" is a working
// title: change the values here to rename or re-skin the product. UI code must
// read the name, accent colour and font from this file instead of hardcoding
// them. (Database content such as achievement titles is not covered.)
export const brand = {
  /** Full product name shown in headers, metadata and the web manifest. */
  name: "Qamqor",
  /** Short name for the home-screen icon label. */
  shortName: "Qamqor",
  /** Letter drawn on the generated app icon and the logo mark. */
  monogram: "Q",
  /** Brand accent: used sparingly for the single most important action. */
  accentColor: "#1D4ED8",
  accentHoverColor: "#1E3A8A",
  accentForegroundColor: "#FFFFFF",
  /** Page background, also used as the browser theme colour. */
  themeColor: "#F3F5F8",
  /**
   * Font family name. The font itself is loaded in src/config/font.ts because
   * next/font requires a static import; change both together.
   */
  font: "Onest",
  defaultLocale: "ru",
  city: "Алматы",
  /** Where organizations ask to be connected (mailto: or https:). Empty hides the button. */
  organizationsContactUrl: "" as string,
} as const;

export type Brand = typeof brand;

/** CSS custom properties injected on <html> so the stylesheet never hardcodes the accent. */
export const brandCssVariables = {
  "--brand": brand.accentColor,
  "--brand-hover": brand.accentHoverColor,
  "--brand-foreground": brand.accentForegroundColor,
} as Record<string, string>;
