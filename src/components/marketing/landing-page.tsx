"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CalendarCheck2,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  HeartHandshake,
  Leaf,
  MapPin,
  PawPrint,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { ProjectCover } from "@/components/projects/project-cover";
import { Reveal } from "@/components/marketing/reveal";
import { useLanguage } from "@/components/marketing/language-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatLocalizedDate, translateValue } from "@/lib/i18n/marketing-copy";
import type { ProjectWithMeta } from "@/types/app";

type LandingPageProps = {
  stats: { volunteers: number; projects: number; confirmedHours: number };
  projects: ProjectWithMeta[];
};

const advantageIcons = [Search, CalendarCheck2, Award];
const activityIcons = [Leaf, PawPrint, HeartHandshake, UsersRound];

export function LandingPage({ stats, projects }: LandingPageProps) {
  const { locale, copy } = useLanguage();
  const numberLocale = locale === "kk" ? "kk-KZ" : locale === "en" ? "en-US" : "ru-RU";
  const numberFormatter = new Intl.NumberFormat(numberLocale);

  return (
    <div className="marketing-page overflow-hidden">
      <section className="landing-hero">
        <div className="hero-blob hero-blob-one" aria-hidden="true" />
        <div className="hero-blob hero-blob-two" aria-hidden="true" />
        <div className="page-shell relative grid items-center gap-12 py-14 sm:py-18 lg:min-h-[760px] lg:grid-cols-[.93fr_1.07fr] lg:gap-16 lg:py-20">
          <div className="relative z-10">
            <div className="story-pill"><Sparkles className="size-4" />{copy.hero.eyebrow}</div>
            <h1 className="marketing-heading mt-7 max-w-3xl text-[clamp(3.25rem,7.4vw,6.8rem)] leading-[.9] tracking-[-0.065em]">
              {copy.hero.title}<br /><span className="text-primary">{copy.hero.titleAccent}</span>
            </h1>
            <p className="mt-7 max-w-xl text-balance text-lg leading-8 text-muted-foreground sm:text-xl">{copy.hero.description}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-7 shadow-lg shadow-primary/20"><Link href="/auth/register">{copy.hero.volunteer}<ArrowRight /></Link></Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-muted-foreground">
              {copy.hero.trust.map((item) => <span key={item} className="flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="size-3" /></span>{item}</span>)}
            </div>
          </div>

          <div className="hero-visual-stage">
            <div className="hero-image-card">
              <Image src="/illustrations/qamqor-hero.png" alt={copy.hero.imageAlt} fill priority sizes="(max-width: 1024px) 100vw, 54vw" className="object-cover" />
            </div>
            <div className="hero-float-card hero-float-top"><span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary"><UsersRound className="size-4" /></span><span>{copy.hero.community}: {numberFormatter.format(stats.volunteers)}</span></div>
            <div className="hero-float-card hero-float-bottom">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><ShieldCheck className="size-5" /></span>
              <span><small>{copy.hero.metric}</small><strong>{numberFormatter.format(stats.confirmedHours)}</strong><em>{copy.hero.confirmed}</em></span>
            </div>
            <span className="hero-heart hero-heart-one" aria-hidden="true">♥</span>
            <span className="hero-heart hero-heart-two" aria-hidden="true">♥</span>
          </div>
        </div>
      </section>

      <section className="stats-wrap">
        <div className="page-shell">
          <div className="stats-panel">
            <div className="grid flex-1 grid-cols-3 gap-2">
              <LandingStat value={stats.volunteers} label={copy.stats.volunteers} locale={numberLocale} />
              <LandingStat value={stats.projects} label={copy.stats.projects} locale={numberLocale} />
              <LandingStat value={stats.confirmedHours} label={copy.stats.hours} locale={numberLocale} />
            </div>
            <p className="hidden max-w-[14rem] text-sm font-bold leading-6 text-primary-foreground/70 lg:block">{copy.stats.note}</p>
          </div>
        </div>
      </section>

      <section id="advantages" className="landing-section">
        <div className="page-shell">
          <Reveal className="mx-auto max-w-3xl text-center">
            <SectionEyebrow>{copy.advantages.eyebrow}</SectionEyebrow>
            <h2 className="marketing-heading mt-4 text-balance text-4xl tracking-[-0.04em] sm:text-5xl lg:text-6xl">{copy.advantages.title}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{copy.advantages.description}</p>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {copy.advantages.items.map((item, index) => {
              const Icon = advantageIcons[index];
              return (
                <Reveal key={item.title} delay={index * 90}>
                  <article className="advantage-card group">
                    <div className={`mini-scene mini-scene-${index + 1}`}><span className="mini-scene-disc" /><Icon className="relative z-10 size-8" /></div>
                    <span className="text-xs font-black tracking-[.2em] text-primary/55">0{index + 1}</span>
                    <h3 className="marketing-heading mt-4 text-2xl tracking-tight">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="activities" className="landing-section pt-4 sm:pt-8">
        <div className="page-shell">
          <Reveal>
            <div className="activity-panel">
              <div className="activity-copy">
                <SectionEyebrow>{copy.activities.eyebrow}</SectionEyebrow>
                <h2 className="marketing-heading mt-4 text-balance text-4xl tracking-[-0.04em] sm:text-5xl">{copy.activities.title}</h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground">{copy.activities.description}</p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {copy.activities.labels.map((label, index) => {
                    const Icon = activityIcons[index];
                    return <span key={label} className="activity-chip"><Icon className="size-4" />{label}</span>;
                  })}
                </div>
                <Button asChild variant="link" className="mt-6 h-auto p-0 text-base font-black"><Link href="/projects">{copy.activities.action}<ArrowRight /></Link></Button>
              </div>
              <div className="activity-illustration" role="img" aria-label={copy.activities.imageAlt}>
                {copy.activities.labels.map((label, index) => <div key={label} className={`activity-vignette activity-vignette-${index}`} aria-hidden="true" />)}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="landing-section">
        <div className="page-shell">
          <Reveal className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-2xl"><SectionEyebrow>{copy.steps.eyebrow}</SectionEyebrow><h2 className="marketing-heading mt-4 text-balance text-4xl tracking-[-0.04em] sm:text-5xl">{copy.steps.title}</h2></div>
            <div className="hidden size-20 items-center justify-center rounded-full border bg-surface text-primary shadow-lg shadow-primary/5 sm:flex"><HeartHandshake className="size-8" /></div>
          </Reveal>
          <div className="steps-line mt-12 grid gap-5 md:grid-cols-3">
            {copy.steps.items.map((item, index) => (
              <Reveal key={item.number} delay={index * 100}>
                <article className="step-card">
                  <span className="step-number">{item.number}</span>
                  <h3 className="marketing-heading mt-8 text-2xl tracking-tight">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
                  {index < 2 ? <ChevronRight className="step-arrow hidden size-6 text-primary/30 md:block" aria-hidden="true" /> : null}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {projects.length ? (
        <section className="projects-section landing-section">
          <div className="page-shell">
            <Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-2xl"><SectionEyebrow>{copy.projects.eyebrow}</SectionEyebrow><h2 className="marketing-heading mt-4 text-balance text-4xl tracking-[-0.04em] sm:text-5xl">{copy.projects.title}</h2><p className="mt-4 text-lg leading-8 text-muted-foreground">{copy.projects.description}</p></div>
              <Button asChild variant="outline" className="rounded-full"><Link href="/projects">{copy.projects.all}<ArrowRight /></Link></Button>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <LandingProjectCards projects={projects} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="landing-section pt-4">
        <div className="page-shell">
          <Reveal>
            <div className="cta-panel">
              <span className="cta-orbit cta-orbit-one" aria-hidden="true" />
              <span className="cta-orbit cta-orbit-two" aria-hidden="true" />
              <div className="relative z-10 mx-auto max-w-3xl text-center">
                <SectionEyebrow>{copy.cta.eyebrow}</SectionEyebrow>
                <h2 className="marketing-heading mt-5 text-balance text-4xl tracking-[-0.045em] sm:text-6xl">{copy.cta.title}</h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{copy.cta.description}</p>
                <div className="mt-8 flex justify-center"><Button asChild size="lg" className="rounded-full px-7"><Link href="/auth/register">{copy.cta.volunteer}<ArrowRight /></Link></Button></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function LandingProjectCards({ projects }: { projects: ProjectWithMeta[] }) {
  const { locale, copy } = useLanguage();
  const cards = projects.slice(0, 3).map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    category: translateValue(project.category, copy.categories),
    city: translateValue(project.city, copy.cities),
    date: formatLocalizedDate(project.start_date, locale, { day: "numeric", month: "long" }),
    hours: project.volunteer_hours,
    showsHours: project.benefits.includes("volunteer_hours"),
    places: project.availablePlaces ?? project.required_volunteers,
    format: project.format,
    cover: project.cover_url,
    href: `/projects/${project.id}`,
  }));

  return cards.map((project, index) => (
    <Reveal key={project.id} delay={index * 90}>
      <article className="landing-project-card group">
        <ProjectCover src={project.cover} title={project.title} className="aspect-[4/3]" />
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><Badge variant="secondary" className="rounded-full">{project.category}</Badge><span className="text-xs font-bold text-muted-foreground">{project.format === "online" ? copy.projects.online : copy.projects.offline}</span></div>
          <h3 className="marketing-heading mt-4 text-xl leading-7 tracking-tight"><Link href={project.href} className="transition hover:text-primary">{project.title}</Link></h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{project.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs font-bold text-muted-foreground"><span className="flex items-center gap-1.5"><CalendarDays className="size-4 text-primary" />{project.date}</span><span className="flex items-center gap-1.5"><MapPin className="size-4 text-primary" />{project.city}</span>{project.showsHours ? <span className="flex items-center gap-1.5"><Clock3 className="size-4 text-primary" />{project.hours} {copy.projects.hours}</span> : null}<span className="flex items-center gap-1.5"><UsersRound className="size-4 text-primary" />{project.places} {copy.projects.places}</span></div>
          <Link href={project.href} className="mt-5 flex items-center justify-between border-t pt-4 text-sm font-black text-foreground transition hover:text-primary"><span>{copy.projects.details}</span><span className="flex size-8 items-center justify-center rounded-full bg-primary/8 text-primary transition group-hover:translate-x-1"><ArrowRight className="size-4" /></span></Link>
        </div>
      </article>
    </Reveal>
  ));
}

function SectionEyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`text-xs font-black uppercase tracking-[.22em] ${light ? "text-primary-foreground/70" : "text-primary"}`}>{children}</p>;
}

function LandingStat({ value, label, locale }: { value: number; label: string; locale: string }) {
  return <div className="px-2 sm:px-5"><p className="marketing-heading text-2xl tracking-tight text-primary-foreground sm:text-5xl">{new Intl.NumberFormat(locale).format(value)}</p><p className="mt-1 text-[11px] font-bold leading-4 text-primary-foreground/70 sm:text-sm">{label}</p></div>;
}
