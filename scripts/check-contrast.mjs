// WCAG 2.x contrast of every text/background token pair the screens use
// together. Reads the values from src/app/globals.css and src/config/brand.ts.
//
//   npm run test:contrast
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const brandSource = readFileSync(new URL("../src/config/brand.ts", import.meta.url), "utf8");
const root = css.slice(css.indexOf(":root {"), css.indexOf("}", css.indexOf(":root {")));
const tokens = Object.fromEntries([...root.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map((match) => [match[1], match[2]]));
const brandValue = (key) => brandSource.match(new RegExp(`${key}:\\s*"(#[0-9A-Fa-f]{6})"`))[1];
tokens.brand = brandValue("accentColor");
tokens["brand-hover"] = brandValue("accentHoverColor");
tokens["brand-foreground"] = brandValue("accentForegroundColor");
tokens.white = "#ffffff";

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function blend(foreground, background, alpha) {
  const channel = (hex, index) => Number.parseInt(hex.slice(index, index + 2), 16);
  return `#${[1, 3, 5].map((index) => Math.round(channel(foreground, index) * alpha + channel(background, index) * (1 - alpha)).toString(16).padStart(2, "0")).join("")}`;
}
function ratio(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// [text, background, where it is used]
const pairs = [
  ["ink", "page", "headings and body text on the page background"],
  ["ink", "surface", "card text, secondary buttons, chips"],
  ["ink", "inset", "active segmented option text sits on surface; ink on inset in icon circles"],
  ["ink-secondary", "surface", "secondary lines in cards, hints, tab bar labels"],
  ["ink-secondary", "page", "lead lines under page titles"],
  ["ink-muted", "inset", "inactive segmented options, avatar initials, category pills on the landing"],
  ["ink-muted", "surface", "placeholder icons"],
  ["white", "ink", "primary (ink) buttons, pressed chips"],
  ["brand-foreground", "brand", "brand buttons, QR tab, next-event card, QR screen"],
  ["brand-foreground", "brand-hover", "brand hover states, other-event rows on the QR screen"],
  ["waiting-foreground", "waiting", "pending / waiting badges"],
  ["waiting-foreground", "surface", "pending hours line on /hours"],
  ["positive-foreground", "positive", "approved, completed, confirmed badges"],
  ["negative-foreground", "negative", "rejected badges, destructive buttons, error messages"],
  ["negative-foreground", "surface", "form field errors"],
  ["informative-foreground", "informative", "attended and published badges"],
];

const rows = pairs.map(([text, background, usage]) => ({ text, background, usage, ratio: ratio(tokens[text], tokens[background]) }));
// Disabled buttons are drawn at 50% opacity over a white surface.
const disabledBg = blend(tokens.ink, tokens.surface, 0.5);
const disabledText = blend(tokens.white, tokens.surface, 0.5);
rows.push({ text: "white @50%", background: "ink @50% on surface", usage: "any disabled ink button while it waits (WCAG 1.4.3 exempts disabled controls; proposed fix: solid inset + ink-muted)", ratio: ratio(disabledText, disabledBg) });

for (const row of rows) {
  const flag = row.ratio >= 4.5 ? "ok  " : "LOW ";
  console.log(`${flag}${row.ratio.toFixed(2).padStart(6)}:1  ${row.text} on ${row.background}  (${row.usage})`);
}
const low = rows.filter((row) => row.ratio < 4.5);
console.log(low.length ? `${low.length} pair(s) under 4.5:1` : "Every pair is at least 4.5:1.");
