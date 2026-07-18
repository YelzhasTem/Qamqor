import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b bg-surface/90 backdrop-blur-xl">
      <div className="page-shell flex h-18 items-center justify-between gap-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground md:flex" aria-label="Основная навигация">
          <Link href="/projects" className="transition hover:text-primary">Проекты</Link>
          <Link href="/#advantages" className="transition hover:text-primary">Возможности</Link>
          <Link href="/#about" className="transition hover:text-primary">О платформе</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild><Link href="/dashboard"><LayoutDashboard />Кабинет</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex"><Link href="/auth/login">Войти</Link></Button>
              <Button asChild><Link href="/auth/register">Начать <ArrowRight /></Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
