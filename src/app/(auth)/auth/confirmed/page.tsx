import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MonitorCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Email подтверждён" };

export default function ConfirmedPage() {
  return <div className="w-full text-center">
    <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-success/10 text-success">
      <CheckCircle2 className="size-8" />
    </div>
    <p className="mt-6 text-sm font-bold text-success">Email подтверждён</p>
    <h1 className="mt-2 text-3xl font-black tracking-tight">Всё готово</h1>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">Вернитесь к устройству, на котором начали регистрацию. Открытая вкладка Qamqor автоматически завершит вход.</p>
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 text-left">
      <MonitorCheck className="mt-0.5 size-5 shrink-0 text-primary" />
      <p className="text-sm leading-6 text-foreground">Повторно регистрироваться или вводить пароль на этом устройстве не нужно.</p>
    </div>
    <Button asChild variant="outline" className="mt-7 w-full"><Link href="/">На главную Qamqor</Link></Button>
  </div>;
}
