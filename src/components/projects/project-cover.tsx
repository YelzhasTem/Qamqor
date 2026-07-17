import Image from "next/image";
import { HandHeart } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProjectCover({ src, title, className, priority = false }: { src?: string | null; title: string; className?: string; priority?: boolean }) {
  if (src) return <div className={cn("relative overflow-hidden bg-green-100", className)}><Image src={src} alt={title} fill priority={priority} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" /></div>;
  return <div className={cn("hero-grid flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-100 via-emerald-50 to-lime-100", className)}><div className="flex size-20 items-center justify-center rounded-[1.6rem] bg-white/80 text-green-600 shadow-xl shadow-green-900/10 backdrop-blur"><HandHeart className="size-9" /></div></div>;
}
