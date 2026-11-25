import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AvatarUpload } from "@/components/forms/avatar-upload";
import { MyOrganizationsEntry } from "@/components/organizations/my-organizations-entry";
import { ProfileForm } from "@/components/forms/profile-form";
import { RoleBadges } from "@/components/shared/role-badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VolunteerProfile } from "@/components/volunteer/volunteer-profile";
import { brand } from "@/config/brand";
import { getCurrentProfile } from "@/lib/auth";
import { getServerDictionary } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.volunteer.profile.title };
}

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");
  if (profile.role === "volunteer") return <VolunteerProfile profile={profile} />;

  // Coordinators and admins keep the existing profile page (its volunteer-only
  // tabs moved to /hours and the volunteer profile).
  const supabase = await createClient();
  const { count: organizationCount } = await supabase.from("organization_members").select("organization_id", { count: "exact", head: true }).eq("user_id", profile.id);
  return <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-bold text-primary">Аккаунт</p><h1 className="mt-1 text-3xl font-black tracking-tight">Профиль</h1><p className="mt-2 text-sm text-muted-foreground">Управляйте личными данными и историей волонтёрства.</p></div></div><Card className="mt-7"><CardContent className="p-6"><AvatarUpload name={profile.full_name} avatarUrl={profile.avatar_url} /><div className="mt-6 border-t pt-5"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Роли в {brand.name}</p><RoleBadges role={profile.role} /></div></CardContent></Card><MyOrganizationsEntry count={organizationCount ?? 0} /><Tabs defaultValue="details" className="mt-7"><TabsList className="w-full justify-start overflow-x-auto sm:w-auto"><TabsTrigger value="details">Личные данные</TabsTrigger></TabsList><TabsContent value="details"><Card><CardHeader><CardTitle>Основная информация</CardTitle></CardHeader><CardContent><ProfileForm profile={profile} /></CardContent></Card></TabsContent></Tabs></div>;
}
