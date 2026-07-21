"use client";

import { Award, CalendarCheck2, Medal } from "lucide-react";
import { useLanguage } from "@/components/marketing/language-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatLocalizedDate, translateValue } from "@/lib/i18n/marketing-copy";
import { initials } from "@/lib/utils";
import type { Achievement, PublicVolunteerProfile } from "@/types/app";
import type { Database } from "@/types/database";

type PublicVolunteerProject = Database["public"]["Views"]["public_volunteer_projects"]["Row"];
type AwardedAchievement = { awarded_at: string; achievements: Achievement | null };

export function PublicVolunteerView({ profile, projects, awarded }: { profile: PublicVolunteerProfile; projects: PublicVolunteerProject[]; awarded: AwardedAchievement[] }) {
  const { locale, copy } = useLanguage();

  return (
    <section className="py-14 sm:py-18">
      <div className="page-shell">
        <div className="overflow-hidden rounded-[2rem] border bg-surface">
          <div className="hero-grid h-36 bg-primary/10 sm:h-44" />
          <div className="px-6 pb-8 sm:px-10">
            <Avatar className="-mt-14 size-28 border-4 border-surface shadow-xl"><AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? copy.volunteerProfile.role} /><AvatarFallback className="text-2xl">{initials(profile.full_name)}</AvatarFallback></Avatar>
            <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div><Badge variant="secondary">{copy.volunteerProfile.role}</Badge><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{profile.full_name}</h1></div>
              <div className="flex gap-7">
                <div><p className="text-3xl font-black text-success-foreground">{Number(profile.confirmed_hours ?? 0)}</p><p className="text-xs text-muted-foreground">{copy.volunteerProfile.hours}</p></div>
                <div><p className="text-3xl font-black text-success-foreground">{Number(profile.completed_projects ?? 0)}</p><p className="text-xs text-muted-foreground">{copy.volunteerProfile.projects}</p></div>
              </div>
            </div>
            {profile.bio ? <p className="mt-7 max-w-3xl text-base leading-8 text-muted-foreground">{profile.bio}</p> : null}
          </div>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
          <div>
            <h2 className="text-2xl font-black">{copy.volunteerProfile.completedProjects}</h2>
            {projects.length ? (
              <div className="mt-5 grid gap-4">{projects.map((project) => (
                <Card key={project.project_id}>
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-success/15 text-success-foreground"><CalendarCheck2 /></div>
                    <div className="min-w-0 flex-1"><p className="truncate font-black">{project.title}</p><p className="mt-1 text-xs text-muted-foreground">{translateValue(project.city ?? "", copy.cities)} · {formatLocalizedDate(project.end_date!, locale, { day: "numeric", month: "long", year: "numeric" })}</p></div>
                    <div className="text-right"><p className="font-black text-success-foreground">{project.hours} {copy.common.hoursShort}</p><p className="text-xs text-muted-foreground">{copy.volunteerProfile.confirmed}</p></div>
                  </CardContent>
                </Card>
              ))}</div>
            ) : <div className="mt-5"><EmptyState title={copy.volunteerProfile.emptyHistoryTitle} description={copy.volunteerProfile.emptyHistoryDescription} /></div>}
          </div>
          <div>
            <h2 className="text-2xl font-black">{copy.volunteerProfile.achievements}</h2>
            {awarded.length ? (
              <div className="mt-5 grid gap-4">{awarded.map((item) => {
                const achievement = item.achievements;
                const key = String(achievement?.required_hours ?? "") as keyof typeof copy.achievements;
                const localized = copy.achievements[key];
                return (
                  <Card key={`${item.awarded_at}-${achievement?.id}`}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground"><Medal /></div><div><p className="font-black">{localized?.title ?? achievement?.title}</p><p className="mt-1 text-xs text-muted-foreground">{achievement?.required_hours}+ {copy.volunteerProfile.hours}</p></div></div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{localized?.description ?? achievement?.description}</p>
                    </CardContent>
                  </Card>
                );
              })}</div>
            ) : <div className="mt-5"><EmptyState icon={Award} title={copy.volunteerProfile.emptyAchievementsTitle} description={copy.volunteerProfile.emptyAchievementsDescription} /></div>}
          </div>
        </div>
      </div>
    </section>
  );
}
