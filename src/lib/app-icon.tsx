import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";

/**
 * Simple letter-mark app icon generated from the brand config. `maskable`
 * keeps the letter inside the safe zone and fills the whole square.
 */
export function renderAppIcon(size: number, { maskable = false, rounded = false }: { maskable?: boolean; rounded?: boolean } = {}) {
  const letterSize = Math.round(size * (maskable ? 0.42 : 0.56));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brand.accentColor,
          color: brand.accentForegroundColor,
          fontSize: letterSize,
          fontWeight: 800,
          borderRadius: rounded ? Math.round(size * 0.22) : 0,
          letterSpacing: "-0.04em",
        }}
      >
        {brand.monogram}
      </div>
    ),
    { width: size, height: size },
  );
}
