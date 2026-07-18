import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "Qamqor — волонтёрство рядом", template: "%s | Qamqor" },
  description: "Единая платформа для волонтёров и координаторов: проекты, заявки, часы, достижения и сертификаты.",
  keywords: ["волонтёрство", "волонтёры", "Казахстан", "социальные проекты", "Qamqor"],
  openGraph: {
    title: "Qamqor — Volunteer Management Platform",
    description: "Находите проекты, помогайте сообществу и сохраняйте подтверждённую историю волонтёрства.",
    type: "website",
    locale: "ru_KZ",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        {children}
        <Toaster
          richColors
          position="top-right"
          closeButton
          toastOptions={{
            classNames: {
              toast: "border-border! bg-surface! text-foreground!",
              success: "border-success/30! bg-success/10!",
              warning: "border-warning/30! bg-warning/10!",
              error: "border-danger/30! bg-danger/10!",
              info: "border-info/30! bg-info/10!",
              description: "text-muted-foreground!",
            },
          }}
        />
      </body>
    </html>
  );
}
