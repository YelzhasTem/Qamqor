import { mkdir, writeFile } from "node:fs/promises";
import { generateCertificatePdf } from "../src/lib/certificate-pdf";

async function main() {
  const outputDir = "tmp/pdfs";
  await mkdir(outputDir, { recursive: true });
  const pdf = await generateCertificatePdf({
    certificateId: "preview-qamqor-2026",
    volunteerName: "Әлия Сәрсенова",
    projectTitle: "Зелёный двор: большой городской субботник",
    hours: 12.5,
    issuedAt: new Date().toISOString(),
    completedAt: "2026-07-20T12:00:00+05:00",
  });
  await writeFile(`${outputDir}/qamqor-certificate-preview.pdf`, pdf);
}

void main();
