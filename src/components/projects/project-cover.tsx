import Image from "next/image";
import { DEFAULT_PROJECT_COVER } from "@/lib/project-benefits";
import { cn } from "@/lib/utils";

export function ProjectCover({ src, title, className, priority = false }: { src?: string | null; title: string; className?: string; priority?: boolean }) {
  const imageSrc = src || DEFAULT_PROJECT_COVER;
  const alt = src ? title : "Волонтёры Qamqor помогают сообществу";

  return <div className={cn("relative overflow-hidden bg-primary/10", className)}>
    {src ? <>
      <Image src={imageSrc} alt="" fill priority={priority} sizes="(max-width: 768px) 100vw, 50vw" aria-hidden className="scale-110 object-cover opacity-25 blur-2xl" />
      <div className="absolute inset-0 bg-surface/20" aria-hidden />
      <Image src={imageSrc} alt={alt} fill priority={priority} sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
    </> : <Image src={imageSrc} alt={alt} fill priority={priority} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />}
  </div>;
}
