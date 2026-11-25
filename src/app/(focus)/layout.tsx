/** Full-screen screens without the site header, footer or tab bar (project page, QR). */
export default function FocusLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-page">{children}</div>;
}
