import { Onest } from "next/font/google";

// The brand font (see brand.font in src/config/brand.ts). next/font needs a
// static import, so swapping the font means editing this file and brand.font.
//
// Manrope was the first choice, but its Cyrillic set lacks the Kazakh letters
// ә ғ қ ң ұ (checked against the font's character map), so those would fall
// back to a system font. Onest covers the full Kazakh alphabet.
export const brandFont = Onest({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-brand",
});
