import { NextResponse } from "next/server";
import { generateCertificatePdf } from "@/lib/certificate-pdf";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: certificate } = await supabase.from("certificates").select("id, issued_at, volunteer_id, project_id, projects(title,end_date), profiles!certificates_volunteer_id_fkey(full_name)").eq("id", id).eq("volunteer_id", user.id).maybeSingle();
  if (!certificate || !certificate.projects || !certificate.profiles) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  const { data: hourEntry } = await supabase.from("volunteer_hours").select("hours").eq("volunteer_id", user.id).eq("project_id", certificate.project_id).eq("status", "confirmed").maybeSingle();
  if (!hourEntry) return NextResponse.json({ error: "Confirmed hours not found" }, { status: 404 });
  const pdf = await generateCertificatePdf({ certificateId: certificate.id, volunteerName: certificate.profiles.full_name, projectTitle: certificate.projects.title, hours: Number(hourEntry?.hours ?? 0), issuedAt: certificate.issued_at, completedAt: certificate.projects.end_date });
  return new NextResponse(Buffer.from(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="qamqor-certificate-${certificate.id}.pdf"`, "Cache-Control": "private, no-store" } });
}
