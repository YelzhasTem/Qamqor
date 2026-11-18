"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardList, FileBadge2, ListChecks, MousePointerClick, UsersRound } from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { OrganizationAvatar } from "@/components/organizations/organization-avatar";
import { ProjectCover } from "@/components/projects/project-cover";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { fill, formatLocalizedDate, translateValue } from "@/lib/i18n/format";
import type { LandingProject, Organization } from "@/lib/queries/organizations";
import { cn } from "@/lib/utils";

type LandingPageProps = {
  organizations: Organization[];
  projects: LandingProject[];
  signedIn: boolean;
};

const stepIcons = [MousePointerClick, ClipboardList, FileBadge2];
const forOrganizationIcons = [ListChecks, FileBadge2];

export function LandingPage({ organizations, projects, signedIn }: LandingPageProps) {
  const { t } = useLanguage();
  const copy = t.marketing;
  const appHref = signedIn ? "/dashboard" : "/auth/register";
  const joinHref = signedIn ? "/organizations" : "/auth/register";
  const showStack = projects.length >= 2;

  return (
    <div className="overflow-x-clip">
      {/* 2. Hero */}
      <section className="page-shell py-10 sm:py-14 lg:py-20">
        <div className={cn("grid items-center gap-10", showStack && "lg:grid-cols-[1.05fr_1fr] lg:gap-14")}>
          <div className={cn(!showStack && "max-w-3xl")}>
            <h1 className="text-balance text-[34px] leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-5xl lg:text-[56px]">{copy.hero.title}</h1>
            <p className="mt-5 max-w-xl text-lg leading-7 text-ink-secondary">{copy.hero.lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <Button asChild variant="brand" size="lg" className="w-full sm:w-auto"><Link href={appHref}>{copy.hero.openApp}<ArrowRight /></Link></Button>
              <Link href="#for-organizations" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-control px-2 text-[15px] font-semibold text-ink underline decoration-control underline-offset-4 hover:decoration-ink">
                {copy.hero.forOrganizations}
              </Link>
            </div>
          </div>
          {showStack ? <HeroProjectStack projects={projects} /> : null}
        </div>
      </section>

      {/* 3. Organizations */}
      {organizations.length ? (
        <section id="organizations" className="scroll-mt-20 py-12 sm:py-16">
          <div className="page-shell">
            <div className="max-w-2xl">
              <h2 className="text-[28px] leading-tight font-extrabold tracking-tight sm:text-4xl">{copy.organizations.title}</h2>
              <p className="mt-3 text-[15px] leading-6 text-ink-secondary sm:text-base">{copy.organizations.lead}</p>
            </div>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {organizations.map((organization) => (
                <li key={organization.id} className="flex flex-col rounded-card border border-hairline bg-surface p-5">
                  <div className="flex items-center gap-3">
                    <OrganizationAvatar name={organization.name} logoUrl={organization.logo_url} />
                    <div className="min-w-0">
                      <h3 className="text-base font-extrabold leading-snug">{organization.name}</h3>
                      {organization.category ? <p className="text-sm text-ink-secondary">{translateValue(organization.category, t.common.categories)}</p> : null}
                    </div>
                  </div>
                  {organization.summary ? <p className="mt-4 flex-1 text-[15px] leading-6 text-ink-secondary">{organization.summary}</p> : <div className="flex-1" />}
                  <Button asChild variant="secondary" className="mt-5 self-start"><Link href={joinHref}>{copy.organizations.join}</Link></Button>
                </li>
              ))}
              <li className="flex flex-col rounded-card bg-inset p-5">
                <h3 className="text-base font-extrabold">{copy.organizations.yoursTitle}</h3>
                <p className="mt-2 flex-1 text-[15px] leading-6 text-ink-muted">{copy.organizations.yoursText}</p>
                <Link href="#for-organizations" className="mt-5 inline-flex min-h-11 items-center gap-1.5 self-start font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
                  {copy.organizations.yoursLink}<ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </li>
            </ul>
          </div>
        </section>
      ) : null}

      {/* 4. How it works */}
      <section id="how-it-works" className="scroll-mt-20 py-12 sm:py-16">
        <div className="page-shell">
          <h2 className="text-[28px] leading-tight font-extrabold tracking-tight sm:text-4xl">{copy.howItWorks.title}</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {copy.howItWorks.steps.map((step, index) => {
              const Icon = stepIcons[index];
              return (
                <li key={step.title} className="rounded-card border border-hairline bg-surface p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-ink text-sm font-extrabold text-white">{index + 1}</span>
                    <Icon aria-hidden="true" className="size-5 text-ink-secondary" />
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-6 text-ink-secondary">{step.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* 5. For organizations */}
      <section id="for-organizations" className="scroll-mt-20 bg-inset py-12 sm:py-16">
        <div className="page-shell">
          <div className="max-w-2xl">
            <h2 className="text-[28px] leading-tight font-extrabold tracking-tight sm:text-4xl">{copy.forOrganizations.title}</h2>
            <p className="mt-3 text-[15px] leading-6 text-ink-muted sm:text-base">{copy.forOrganizations.lead}</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {copy.forOrganizations.cards.map((card, index) => {
              const Icon = forOrganizationIcons[index];
              return (
                <article key={card.title} className="rounded-card bg-surface p-5 sm:p-6">
                  <span className="flex size-11 items-center justify-center rounded-full bg-inset text-ink"><Icon aria-hidden="true" className="size-5" /></span>
                  <h3 className="mt-5 text-lg font-extrabold">{card.title}</h3>
                  <p className="mt-2 text-[15px] leading-6 text-ink-secondary">{card.text}</p>
                </article>
              );
            })}
          </div>
          {brand.organizationsContactUrl ? (
            <Button asChild size="lg" className="mt-8 w-full sm:w-auto">
              <a href={brand.organizationsContactUrl} target={brand.organizationsContactUrl.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{copy.forOrganizations.connect}</a>
            </Button>
          ) : null}
        </div>
      </section>

      {/* 6. Call to action */}
      <section className="page-shell pt-12 sm:pt-16">
        <div className="rounded-card bg-brand px-6 py-10 text-brand-foreground sm:px-10 sm:py-12">
          <h2 className="max-w-2xl text-balance text-[28px] leading-tight font-extrabold tracking-tight sm:text-4xl">{copy.cta.title}</h2>
          <p className="mt-3 max-w-xl text-[15px] leading-6 text-brand-foreground/90 sm:text-base">{copy.cta.text}</p>
          <Button asChild size="lg" className="mt-7 w-full bg-white text-ink hover:bg-white/90 sm:w-auto"><Link href={appHref}>{copy.cta.button}</Link></Button>
        </div>
      </section>
    </div>
  );
}

function HeroProjectStack({ projects }: { projects: LandingProject[] }) {
  const { t } = useLanguage();
  const cards = projects.slice(0, 3);
  const left = cards.filter((_, index) => index % 2 === 0);
  const right = cards.filter((_, index) => index % 2 === 1);

  return (
    <div aria-label={t.marketing.hero.cardsLabel} role="region" className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="grid content-start gap-3 sm:gap-4">{left.map((project) => <HeroProjectCard key={project.id} project={project} />)}</div>
      <div className="mt-10 grid content-start gap-3 sm:mt-16 sm:gap-4">{right.map((project) => <HeroProjectCard key={project.id} project={project} />)}</div>
    </div>
  );
}

function HeroProjectCard({ project }: { project: LandingProject }) {
  const { locale, t } = useLanguage();
  const date = formatLocalizedDate(project.startDate, locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const places = project.availablePlaces > 0 ? fill(t.common.freePlaces, { count: project.availablePlaces }) : t.common.noPlaces;

  return (
    <article className="overflow-hidden rounded-card border border-hairline bg-surface">
      <ProjectCover src={project.coverUrl} title={project.title} className="aspect-[4/3]" />
      <div className="p-3.5 sm:p-4">
        <span className="inline-flex rounded-full bg-inset px-2.5 py-1 text-xs font-semibold text-ink-muted">{translateValue(project.category, t.common.categories)}</span>
        <h3 className="mt-2.5 line-clamp-2 text-[15px] leading-snug font-extrabold sm:text-base">{project.title}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-ink-secondary"><CalendarDays aria-hidden="true" className="size-3.5 shrink-0" />{date}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-secondary"><UsersRound aria-hidden="true" className="size-3.5 shrink-0" />{places}</p>
      </div>
    </article>
  );
}
