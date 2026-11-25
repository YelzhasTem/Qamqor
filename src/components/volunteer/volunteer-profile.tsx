import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { AvatarUpload } from "@/components/forms/avatar-upload";
import { ProfileForm } from "@/components/forms/profile-form";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Button } from "@/components/ui/button";
import { ProfileOrganizations, type ProfileOrganization } from "@/components/volunteer/profile-organizations";
import { signOutAction } from "@/lib/actions/auth";
import { getServerDictionary } from "@/lib/i18n/server";
import { getMyApplications, isUpcoming } from "@/lib/queries/volunteer";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/app";

/** Profile screen for volunteers. Coordinators and admins keep the existing page. */
export async function VolunteerProfile({ profile }: { profile: Profile }) {
  const { t } = await getServerDictionary();
  const copy = t.volunteer.profile;
  const supabase = await createClient();
  const [{ data: memberships }, applications] = await Promise.all([
    supabase.from("organization_members").select("role, organization_id, organizations(name, logo_url)").eq("user_id", profile.id),
    getMyApplications(profile.id),
  ]);
  const now = Date.now();
  const upcoming = applications.filter((application) => (application.status === "pending" || application.status === "approved") && isUpcoming(application, now));

  const organizations: ProfileOrganization[] = (memberships ?? [])
    .filter((membership) => membership.organizations)
    .map((membership) => ({
      id: membership.organization_id,
      name: membership.organizations!.name,
      logoUrl: membership.organizations!.logo_url,
      role: membership.role,
      upcomingApplications: upcoming.filter((application) => application.project.organizationId === membership.organization_id).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">{copy.title}</h1>

      <section className="mt-5 rounded-card border border-hairline bg-surface p-4">
        <AvatarUpload name={profile.full_name} avatarUrl={profile.avatar_url} />
        <h2 className="mt-6 mb-4 text-lg font-extrabold">{copy.details}</h2>
        <ProfileForm profile={profile} />
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-lg font-extrabold">{copy.organizations}</h2>
        <ProfileOrganizations organizations={organizations} />
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-lg font-extrabold">{copy.language}</h2>
        <LanguageSwitcher />
      </section>

      <div className="mt-8 grid gap-3">
        <Button asChild variant="secondary" size="lg">
          <Link href={`/volunteers/${profile.id}`}>{copy.publicProfile}<ExternalLink /></Link>
        </Button>
        <form action={signOutAction}>
          <Button type="submit" variant="secondary" size="lg" className="w-full"><LogOut />{copy.signOut}</Button>
        </form>
      </div>
    </div>
  );
}
