import Image from "next/image";
import { DEFAULT_PROJECT_COVER } from "@/lib/project-benefits";
import { cn } from "@/lib/utils";

export function ProjectCover({ src, title, className, priority = false }: { src?: string | null; title: string; className?: string; priority?: boolean }) {
  return <div className={cn("relative overflow-hidden bg-primary/10", className)}><Image src={src || DEFAULT_PROJECT_COVER} alt={src ? title : "Волонтёры Qamqor помогают сообществу"} fill priority={priority} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" /></div>;
}
