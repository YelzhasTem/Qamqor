/** Full-screen, phone-first flows outside the dashboard sidebar layout. */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-page">{children}</div>;
}
