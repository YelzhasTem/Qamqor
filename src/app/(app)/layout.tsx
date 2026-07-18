import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { MobileDashboardNav } from "@/components/layout/mobile-dashboard-nav";
import { signOutAction } from "@/lib/actions/auth";
import { getCurrentProfile } from "@/lib/auth";
import { initials } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-68 border-r bg-surface p-5 md:flex md:flex-col">
        <Logo />
        <div className="mt-10"><DashboardNav role={profile.role} /></div>
        <div className="mt-auto border-t pt-5">
          <div className="flex items-center gap-3 px-2">
            <Avatar><AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} /><AvatarFallback>{initials(profile.full_name)}</AvatarFallback></Avatar>
            <div className="min-w-0"><p className="truncate text-sm font-bold">{profile.full_name}</p><p className="text-xs text-muted-foreground">{profile.role === "coordinator" ? "Координатор" : "Волонтёр"}</p></div>
          </div>
          <form action={signOutAction} className="mt-4"><Button type="submit" variant="ghost" className="w-full justify-start text-muted-foreground"><LogOut />Выйти</Button></form>
        </div>
      </aside>
      <div className="md:pl-68">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-surface/90 px-4 backdrop-blur md:px-8">
          <MobileDashboardNav role={profile.role} />
          <div className="ml-auto flex items-center gap-3"><span className="hidden text-sm text-muted-foreground sm:block">{profile.city || "Город не указан"}</span><Avatar className="size-9"><AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} /><AvatarFallback>{initials(profile.full_name)}</AvatarFallback></Avatar></div>
        </header>
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
