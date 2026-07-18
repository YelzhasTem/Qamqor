import Image from "next/image";
import { HandHeart } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProjectCover({ src, title, className, priority = false }: { src?: string | null; title: string; className?: string; priority?: boolean }) {
  if (src) return <div className={cn("relative overflow-hidden bg-primary/10", className)}><Image src={src} alt={title} fill priority={priority} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" /></div>;
  return <div className={cn("hero-grid flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10", className)}><div className="flex size-20 items-center justify-center rounded-[1.6rem] bg-surface/80 text-primary shadow-xl shadow-primary/10 backdrop-blur"><HandHeart className="size-9" /></div></div>;
}
