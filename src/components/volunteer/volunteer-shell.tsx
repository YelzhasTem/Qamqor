import { VolunteerRail, VolunteerTabBar } from "@/components/volunteer/volunteer-nav";

/**
 * Phone-first shell for volunteers: page background, 16px side padding and a
 * bottom tab bar on phones; a left rail and a centred 640px column from 768px.
 */
export function VolunteerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-page md:pl-60">
      <VolunteerRail />
      <main className="mx-auto w-full max-w-[640px] px-4 pt-[calc(1.25rem+var(--safe-top))] pb-[calc(6.5rem+var(--safe-bottom))] md:px-6 md:pt-10 md:pb-16">
        {children}
      </main>
      <VolunteerTabBar />
    </div>
  );
}
