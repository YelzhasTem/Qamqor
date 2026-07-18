import Link from "next/link";
import { ArrowRight, Award, CalendarCheck2, Check, Clock3, FolderHeart, Search, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getPlatformStats, getPopularProjects } from "@/lib/queries/projects";

const advantages = [
  { icon: Search, title: "Найдите своё дело", text: "Поиск и фильтры помогают быстро находить проекты по интересам, городу и формату." },
  { icon: CalendarCheck2, title: "Управляйте участием", text: "Заявки, статусы и ближайшие события собраны в одном понятном кабинете." },
  { icon: Award, title: "Сохраняйте результат", text: "Подтверждённые часы, достижения и сертификаты формируют вашу историю помощи." },
];

export default async function HomePage() {
  const [stats, projects] = await Promise.all([getPlatformStats(), getPopularProjects(3)]);
  return (
    <>
      <section className="hero-grid relative overflow-hidden border-b bg-gradient-to-b from-surface to-background py-18 sm:py-24 lg:py-28">
        <div className="page-shell grid items-center gap-14 lg:grid-cols-[1.04fr_.96fr]">
          <div>
            <Badge variant="secondary" className="gap-2 px-3 py-2"><Sparkles className="size-3.5" />Волонтёрство, которое видно</Badge>
            <h1 className="mt-7 max-w-3xl text-balance text-5xl font-black leading-[.98] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl">Помогайте людям. <span className="text-primary">Меняйте мир.</span></h1>
            <p className="mt-7 max-w-xl text-balance text-lg leading-8 text-muted-foreground sm:text-xl">Qamqor объединяет волонтёров и координаторов — от первой заявки до подтверждённых часов и сертификата.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button asChild size="lg"><Link href="/auth/register">Стать волонтёром <ArrowRight /></Link></Button><Button asChild size="lg" variant="outline"><Link href="/auth/register?role=coordinator">Создать проект</Link></Button></div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted-foreground">{["Бесплатная регистрация", "Подтверждённые часы", "PDF-сертификаты"].map((item) => <span key={item} className="flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="size-3" /></span>{item}</span>)}</div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-8 rounded-full bg-secondary/15 blur-3xl" />
            <div className="glass-card relative rounded-[2rem] border border-surface p-4 sm:p-6">
              <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-primary">Мой вклад</p><p className="mt-1 text-lg font-black">Панель волонтёра</p></div><div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><FolderHeart /></div></div>
              <div className="mt-6 grid grid-cols-3 gap-3"><MiniStat label="Часов" value="48" icon={Clock3} /><MiniStat label="Проектов" value="7" icon={CalendarCheck2} /><MiniStat label="Наград" value="3" icon={Award} /></div>
              <div className="mt-4 rounded-2xl border bg-surface p-4"><div className="flex items-center justify-between"><p className="text-sm font-bold">Ближайшее событие</p><Badge variant="success">Одобрено</Badge></div><div className="mt-4 flex items-center gap-4"><div className="flex size-13 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground"><UsersRound /></div><div><p className="font-bold">Зелёный двор</p><p className="mt-1 text-xs text-muted-foreground">20 июля · Алматы · 4 часа</p></div></div></div>
              <div className="mt-4 rounded-2xl bg-primary p-5 text-primary-foreground"><div className="flex items-end justify-between"><div><p className="text-xs text-primary-foreground">До новой награды</p><p className="mt-1 font-bold">Опора сообщества</p></div><span className="text-sm font-black">48 / 50 ч</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-foreground/15"><div className="h-full w-[96%] rounded-full bg-secondary" /></div></div>
            </div>
            <div className="animate-float absolute -right-3 -top-5 hidden rounded-2xl border bg-surface p-3 shadow-xl sm:flex"><ShieldCheck className="mr-2 size-5 text-primary" /><span className="text-xs font-bold">Часы подтверждены</span></div>
          </div>
        </div>
      </section>

      <section className="border-b bg-surface py-10"><div className="page-shell grid grid-cols-3 divide-x text-center"><Stat value={stats.volunteers} label="волонтёров" /><Stat value={stats.projects} label="проектов" /><Stat value={stats.confirmedHours} label="часов помощи" /></div></section>

      <section id="advantages" className="py-20 sm:py-24"><div className="page-shell"><div className="max-w-2xl"><p className="text-sm font-black uppercase tracking-[.18em] text-primary">Всё необходимое</p><h2 className="mt-3 text-balance text-4xl font-black tracking-tight sm:text-5xl">Одна платформа — весь путь волонтёра</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3">{advantages.map(({ icon: Icon, title, text }) => <Card key={title} className="border-0 bg-surface"><CardContent className="p-7"><div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon /></div><h3 className="mt-6 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p></CardContent></Card>)}</div></div></section>

      <section className="bg-surface py-20 sm:py-24"><div className="page-shell"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-black uppercase tracking-[.18em] text-primary">Актуально сейчас</p><h2 className="mt-3 text-4xl font-black tracking-tight">Популярные проекты</h2><p className="mt-3 text-muted-foreground">Выберите проект и отправьте заявку за пару минут.</p></div><Button asChild variant="outline"><Link href="/projects">Все проекты <ArrowRight /></Link></Button></div>{projects.length ? <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div> : <div className="mt-10"><EmptyState title="Скоро здесь появятся проекты" description="Координаторы уже могут создавать и публиковать первые инициативы." action={{ label: "Создать проект", href: "/auth/register?role=coordinator" }} /></div>}</div></section>

      <section id="about" className="py-20 sm:py-24"><div className="page-shell overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-primary-foreground sm:px-12 lg:px-16"><div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]"><div><p className="text-sm font-black uppercase tracking-[.18em] text-primary-foreground">Начните сегодня</p><h2 className="mt-4 max-w-3xl text-balance text-4xl font-black tracking-tight sm:text-5xl">Добрые дела начинаются с одного решения.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-primary-foreground">Присоединяйтесь к сообществу Qamqor, находите людей рядом и превращайте помощь в устойчивые изменения.</p></div><div className="flex flex-col gap-3"><Button asChild size="lg" className="border border-primary-foreground bg-secondary text-secondary-foreground hover:bg-secondary/85"><Link href="/auth/register">Стать волонтёром <ArrowRight /></Link></Button><Button asChild size="lg" variant="outline" className="border-primary-foreground/25 bg-surface/5 text-primary-foreground hover:bg-primary-foreground/10"><Link href="/auth/register?role=coordinator">Я координатор</Link></Button></div></div></div></section>
    </>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Clock3 }) { return <div className="rounded-2xl bg-primary/5 p-3"><Icon className="size-4 text-primary" /><p className="mt-3 text-xl font-black">{value}</p><p className="text-[11px] font-semibold text-muted-foreground">{label}</p></div>; }
function Stat({ value, label }: { value: number; label: string }) { return <div className="px-2"><p className="text-2xl font-black text-foreground sm:text-4xl">{new Intl.NumberFormat("ru-RU").format(value)}+</p><p className="mt-1 text-xs font-semibold text-muted-foreground sm:text-sm">{label}</p></div>; }
