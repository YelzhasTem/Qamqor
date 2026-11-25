"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Laptop, Loader2, MapPin, MessageCircle, QrCode, Users } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/i18n/language-provider";
import { OrganizationAvatar } from "@/components/organizations/organization-avatar";
import { benefitIcons } from "@/components/projects/project-benefits";
import { ProjectCover } from "@/components/projects/project-cover";
import { ChipLabel } from "@/components/shared/chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmSheet } from "@/components/volunteer/confirm-sheet";
import { applyToProjectAction, cancelApplicationAction } from "@/lib/actions/applications";
import { formatEventWhen } from "@/lib/datetime";
import { errorText } from "@/lib/errors";
import { fill, plural, translateValue } from "@/lib/i18n/format";
import { isProjectBenefit } from "@/lib/project-benefits";
import type { UserRole } from "@/types/roles";

export type ProjectView = {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  category: string;
  coverUrl: string | null;
  format: "online" | "offline";
  city: string;
  address: string | null;
  startDate: string;
  endDate: string;
  capacity: number;
  availablePlaces: number;
  volunteerHours: number;
  benefits: string[];
  /** Published, not ended, and its organization (if any) is active. */
  open: boolean;
};

type Application = { id: string; status: string };

/** Full-screen project page with a sticky bar whose content depends on the viewer. */
export function ProjectDetailsView({
  project,
  organization,
  viewer,
  initialApplication,
  whatsappGroupUrl,
}: {
  project: ProjectView;
  organization: { name: string; logoUrl: string | null } | null;
  viewer: { role: UserRole; isMember: boolean } | null;
  initialApplication: Application | null;
  whatsappGroupUrl: string | null;
}) {
  const { locale, t } = useLanguage();
  const copy = t.volunteer.project;
  const taken = Math.max(project.capacity - project.availablePlaces, 0);
  const benefits = project.benefits.filter(isProjectBenefit);
  const showBar = !viewer || viewer.role === "volunteer";

  return (
    <div className="mx-auto w-full max-w-[640px] bg-surface md:my-6 md:overflow-hidden md:rounded-card md:border md:border-hairline">
      <div className="relative">
        <ProjectCover src={project.coverUrl} title={project.title} priority className="h-[220px]" />
        <Link
          href={viewer ? "/dashboard" : "/"}
          aria-label={viewer ? copy.backToFeed : copy.backHome}
          className="absolute top-[calc(0.75rem+var(--safe-top))] left-3 flex size-11 items-center justify-center rounded-full bg-surface text-ink shadow-sm transition-colors hover:bg-page"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </Link>
      </div>

      <main className={showBar ? "px-4 pt-5 pb-[calc(9rem+var(--safe-bottom))] md:px-6" : "px-4 pt-5 pb-10 md:px-6"}>
        <ChipLabel>{translateValue(project.category, t.common.categories)}</ChipLabel>
        <h1 className="mt-3 text-[26px] leading-tight font-extrabold tracking-tight text-balance">{project.title}</h1>

        <ul className="mt-5 grid gap-4">
          <InfoRow icon={CalendarDays}>{formatEventWhen(project.startDate, project.endDate, locale)}</InfoRow>
          <InfoRow icon={project.format === "online" ? Laptop : MapPin}>
            {project.format === "online" ? copy.online : [translateValue(project.city, t.common.cities), project.address].filter(Boolean).join(", ")}
          </InfoRow>
          <InfoRow icon={Users}>
            <span>{plural(locale, project.capacity, copy.places, { free: project.availablePlaces, total: project.capacity })}</span>
            <span aria-hidden="true" className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-inset">
              <span className="block h-full rounded-full bg-brand" style={{ width: `${project.capacity ? Math.min(100, (taken / project.capacity) * 100) : 0}%` }} />
            </span>
          </InfoRow>
        </ul>

        <Section title={copy.about}><p className="whitespace-pre-line">{project.description}</p></Section>
        {project.requirements ? <Section title={copy.requirements}><p className="whitespace-pre-line">{project.requirements}</p></Section> : null}

        {benefits.length ? (
          <Section title={copy.benefits}>
            <ul className="flex flex-wrap gap-2">
              {benefits.map((benefit) => {
                const Icon = benefitIcons[benefit];
                return (
                  <li key={benefit}>
                    <ChipLabel className="min-h-9 px-3.5 text-sm">
                      <Icon aria-hidden="true" className="size-4 text-ink-secondary" />
                      {benefit === "volunteer_hours" ? fill(copy.hoursChip, { count: project.volunteerHours }) : t.common.benefits[benefit]}
                    </ChipLabel>
                  </li>
                );
              })}
            </ul>
          </Section>
        ) : null}

        {organization ? (
          <section className="mt-7 flex items-center gap-3 rounded-row border border-hairline p-3.5">
            <OrganizationAvatar name={organization.name} logoUrl={organization.logoUrl} />
            <div className="min-w-0">
              <p className="text-[13px] text-ink-secondary">{copy.organizer}</p>
              <p className="truncate font-bold">{organization.name}</p>
            </div>
          </section>
        ) : null}

        {whatsappGroupUrl ? (
          <Button asChild variant="secondary" size="lg" className="mt-4 w-full">
            <a href={whatsappGroupUrl} target="_blank" rel="noreferrer"><MessageCircle />{copy.whatsapp}</a>
          </Button>
        ) : null}
      </main>

      {showBar ? (
        <ApplyBar project={project} organization={organization} viewer={viewer} initialApplication={initialApplication} />
      ) : null}
    </div>
  );
}

function InfoRow({ icon: Icon, children }: { icon: typeof CalendarDays; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-inset text-ink"><Icon aria-hidden="true" className="size-5" /></span>
      <div className="min-w-0 flex-1 pt-2 text-[15px] leading-6 font-semibold">{children}</div>
    </li>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="text-lg font-extrabold">{title}</h2>
      <div className="mt-2.5 text-[15px] leading-6 text-ink-secondary">{children}</div>
    </section>
  );
}

function ApplyBar({
  project,
  organization,
  viewer,
  initialApplication,
}: {
  project: ProjectView;
  organization: { name: string } | null;
  viewer: { role: UserRole; isMember: boolean } | null;
  initialApplication: Application | null;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const copy = t.volunteer.bar;
  const [application, setApplication] = useState(initialApplication);
  const [member, setMember] = useState(viewer?.isMember ?? false);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function apply() {
    setBusy(true);
    const result = await applyToProjectAction(project.id);
    setBusy(false);
    if (!result.success) {
      toast.error(errorText(result.error, t));
      router.refresh();
      return;
    }
    setApplication({ id: result.data!.applicationId, status: result.data!.status });
    setMember(true);
    toast.success(copy.applied);
    router.refresh();
  }

  async function cancel() {
    if (!application) return;
    setBusy(true);
    const result = await cancelApplicationAction(application.id, project.id);
    setBusy(false);
    setConfirmOpen(false);
    if (!result.success) {
      toast.error(errorText(result.error, t));
      return;
    }
    setApplication(null);
    toast.success(copy.cancelled);
    router.refresh();
  }

  let content: React.ReactNode;
  if (!viewer) {
    content = (
      <Button asChild size="lg" className="w-full">
        <Link href={`/auth/login?next=${encodeURIComponent(`/projects/${project.id}`)}`}>{copy.signIn}</Link>
      </Button>
    );
  } else if (application) {
    const status = application.status;
    const cancellable = project.open && (status === "pending" || status === "approved");
    content = (
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge kind="application" status={status} />
        <div className="ml-auto flex flex-wrap justify-end gap-2">
          {status === "approved" && project.open ? (
            <Button asChild variant="brand"><Link href={`/qr?application=${application.id}`}><QrCode />{copy.myQr}</Link></Button>
          ) : null}
          {cancellable ? (
            <Button variant="secondary" onClick={() => setConfirmOpen(true)} disabled={busy}>
              {status === "pending" ? copy.cancelApplication : copy.cancel}
            </Button>
          ) : null}
          {status === "rejected" ? <Button asChild variant="link"><Link href="/dashboard">{copy.otherProjects}</Link></Button> : null}
          {status === "attended" || status === "completed" ? <Button asChild variant="link"><Link href="/hours">{copy.myHours}</Link></Button> : null}
          {(status === "pending" || status === "approved") && !project.open ? <span className="text-sm font-semibold text-ink-secondary">{copy.closed}</span> : null}
        </div>
      </div>
    );
  } else if (!project.open) {
    content = <p className="flex min-h-13 items-center justify-center rounded-button bg-inset px-4 text-[15px] font-semibold text-ink-muted">{copy.closed}</p>;
  } else if (project.availablePlaces <= 0) {
    content = <Button size="lg" className="w-full" disabled>{copy.noPlaces}</Button>;
  } else {
    content = (
      <div>
        {organization && !member ? <p className="mb-2.5 text-sm leading-5 text-ink-secondary">{fill(copy.joinNotice, { name: organization.name })}</p> : null}
        <Button size="lg" className="w-full" onClick={() => void apply()} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : null}
          {copy.apply}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-surface">
        <div className="safe-bottom mx-auto w-full max-w-[640px] px-4 pt-3 md:px-6" aria-live="polite">{content}</div>
      </div>
      <ConfirmSheet
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t.volunteer.confirmCancel.title}
        text={t.volunteer.confirmCancel.text}
        confirmLabel={t.volunteer.confirmCancel.confirm}
        cancelLabel={t.volunteer.confirmCancel.keep}
        onConfirm={() => void cancel()}
        pending={busy}
      />
    </>
  );
}
