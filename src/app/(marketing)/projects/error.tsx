"use client";
import { Button } from "@/components/ui/button";
export default function ProjectsError({ reset }: { reset: () => void }) { return <div className="page-shell py-24 text-center"><h1 className="text-2xl font-black">Не удалось загрузить проекты</h1><p className="mt-3 text-muted-foreground">Проверьте соединение и попробуйте снова.</p><Button onClick={reset} className="mt-6">Повторить</Button></div>; }
