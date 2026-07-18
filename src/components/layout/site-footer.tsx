import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export function SiteFooter() {
  return (
    <footer className="border-t bg-primary py-12 text-primary-foreground">
      <div className="page-shell grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div><Logo className="text-primary-foreground [&_span:first-child]:border [&_span:first-child]:border-primary-foreground [&_span:first-child]:bg-secondary [&_span:first-child]:text-secondary-foreground" /><p className="mt-4 max-w-sm text-sm leading-6 text-primary-foreground">Единая цифровая платформа, где добрые дела становятся заметными, подтверждёнными и доступными каждому.</p></div>
        <div><h3 className="font-bold">Платформа</h3><div className="mt-4 grid gap-3 text-sm text-primary-foreground"><Link href="/projects">Каталог проектов</Link><Link href="/auth/register">Стать волонтёром</Link><Link href="/auth/register?role=coordinator">Создать проект</Link></div></div>
        <div><h3 className="font-bold">Qamqor</h3><div className="mt-4 grid gap-3 text-sm text-primary-foreground"><Link href="/#about">О нас</Link><Link href="/#advantages">Возможности</Link><a href="mailto:hello@qamqor.kz">hello@qamqor.kz</a></div></div>
      </div>
      <div className="page-shell mt-10 border-t border-primary-foreground/10 pt-6 text-xs text-primary-foreground">© {new Date().getFullYear()} Qamqor. Сделано для тех, кто помогает.</div>
    </footer>
  );
}
