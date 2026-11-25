import qrcode from "qrcode-generator";

/** Modules of white space around the code, as the QR specification requires. */
export const QR_QUIET_ZONE = 4;

/**
 * A QR code as one SVG path of dark modules, plus the viewBox size including
 * the quiet zone. Error correction M keeps the code readable on worn screens.
 */
export function qrSvgPath(text: string) {
  const code = qrcode(0, "M");
  code.addData(text, "Byte");
  code.make();
  const count = code.getModuleCount();
  const commands: string[] = [];
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (code.isDark(row, col)) commands.push(`M${col + QR_QUIET_ZONE} ${row + QR_QUIET_ZONE}h1v1h-1z`);
    }
  }
  return { size: count + QR_QUIET_ZONE * 2, path: commands.join("") };
}
