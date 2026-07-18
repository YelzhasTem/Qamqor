import { readFile } from "node:fs/promises";
import { join } from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";

const certificateColors = {
  primary: pdfColor("#2563EB"),
  secondary: pdfColor("#22C55E"),
  accent: pdfColor("#F59E0B"),
  background: pdfColor("#F8FAFC"),
  surface: pdfColor("#FFFFFF"),
  text: pdfColor("#1E293B"),
  muted: pdfColor("#64748B"),
  border: pdfColor("#E2E8F0"),
};

export type CertificateData = {
  certificateId: string;
  volunteerName: string;
  projectTitle: string;
  hours: number;
  issuedAt: string;
  completedAt: string;
};

export async function generateCertificatePdf(data: CertificateData) {
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  document.setTitle(`Qamqor Certificate - ${data.volunteerName}`);
  document.setAuthor("Qamqor Volunteer Management Platform");
  document.setSubject(data.projectTitle);
  const fontBytes = await readFile(join(process.cwd(), "src/assets/fonts/NotoSans-Regular.ttf"));
  const font = await document.embedFont(fontBytes, { subset: true });
  const page = document.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  page.drawRectangle({ x: 0, y: 0, width, height, color: certificateColors.background });
  page.drawCircle({ x: width - 40, y: height - 20, size: 150, color: certificateColors.secondary, opacity: 0.12 });
  page.drawCircle({ x: 35, y: 30, size: 105, color: certificateColors.accent, opacity: 0.1 });
  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: certificateColors.primary, borderWidth: 2 });
  page.drawRectangle({ x: 33, y: 33, width: width - 66, height: height - 66, borderColor: certificateColors.border, borderWidth: 0.7 });

  page.drawCircle({ x: width / 2, y: height - 82, size: 25, color: certificateColors.primary });
  centered(page, "Q", font, 25, height - 91, certificateColors.surface);
  centered(page, "QAMQOR", font, 13, height - 122, certificateColors.text);
  centered(page, "VOLUNTEER MANAGEMENT PLATFORM", font, 7.5, height - 138, certificateColors.muted);

  centered(page, "СЕРТИФИКАТ", font, 35, height - 202, certificateColors.text);
  centered(page, "Настоящим подтверждается, что", font, 11, height - 235, certificateColors.muted);
  centered(page, data.volunteerName, font, fitSize(data.volunteerName, font, 32, width - 170), height - 286, certificateColors.primary);
  page.drawLine({ start: { x: 150, y: height - 297 }, end: { x: width - 150, y: height - 297 }, color: certificateColors.border, thickness: 0.8 });
  centered(page, "принял(а) участие в волонтёрском проекте", font, 10.5, height - 327, certificateColors.muted);
  drawWrappedCentered(page, `«${data.projectTitle}»`, font, 18, height - 365, width - 180, 23, certificateColors.text);

  const contributionY = height - 420;
  centered(page, `и внёс(ла) вклад в объёме ${formatHours(data.hours)} волонтёрских часов`, font, 11.5, contributionY, certificateColors.text);

  const dateText = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Almaty" }).format(new Date(data.completedAt));
  page.drawText("Дата завершения", { x: 95, y: 87, size: 8, font, color: certificateColors.muted });
  page.drawText(dateText, { x: 95, y: 67, size: 10, font, color: certificateColors.text });
  page.drawText("Qamqor", { x: width - 186, y: 67, size: 15, font, color: certificateColors.primary });
  page.drawLine({ start: { x: width - 205, y: 61 }, end: { x: width - 90, y: 61 }, color: certificateColors.secondary, thickness: 0.7 });
  centered(page, `ID: ${data.certificateId}`, font, 6.5, 42, certificateColors.muted);
  return document.save();
}

function centered(page: PDFPage, text: string, font: PDFFont, size: number, y: number, color: ReturnType<typeof rgb>) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (page.getWidth() - width) / 2, y, size, font, color });
}

function fitSize(text: string, font: PDFFont, desired: number, maxWidth: number) {
  const width = font.widthOfTextAtSize(text, desired);
  return width <= maxWidth ? desired : Math.max(18, desired * maxWidth / width);
}

function drawWrappedCentered(page: PDFPage, text: string, font: PDFFont, size: number, y: number, maxWidth: number, lineHeight: number, color: ReturnType<typeof rgb>) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
    else { if (line) lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  lines.slice(0, 2).forEach((item, index) => centered(page, item, font, size, y - index * lineHeight, color));
}

function formatHours(hours: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(hours);
}

function pdfColor(hex: string) {
  const value = hex.replace("#", "");
  return rgb(
    Number.parseInt(value.slice(0, 2), 16) / 255,
    Number.parseInt(value.slice(2, 4), 16) / 255,
    Number.parseInt(value.slice(4, 6), 16) / 255,
  );
}
