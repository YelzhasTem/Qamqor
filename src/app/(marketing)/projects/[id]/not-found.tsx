import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function ProjectNotFound() { return <div className="page-shell py-24 text-center"><p className="text-sm font-black uppercase tracking-widest text-green-600">404</p><h1 className="mt-3 text-4xl font-black">Проект не найден</h1><p className="mt-4 text-muted-foreground">Возможно, он был удалён или ещё не опубликован.</p><Button asChild className="mt-7"><Link href="/projects">Перейти в каталог</Link></Button></div>; }
