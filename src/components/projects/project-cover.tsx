"use client";

import Image from "next/image";
import { PhotoPlaceholder } from "@/components/shared/photo-placeholder";
import { cn } from "@/lib/utils";

/** Project cover image, or a neutral striped placeholder when there is none. */
export function ProjectCover({ src, title, className, priority = false }: { src?: string | null; title: string; className?: string; priority?: boolean }) {
  return <div className={cn("relative overflow-hidden bg-inset", className)}>
    {src ? <>
      <Image src={src} alt="" fill priority={priority} sizes="(max-width: 768px) 100vw, 50vw" aria-hidden className="scale-110 object-cover opacity-25 blur-2xl" />
      <Image src={src} alt={title} fill priority={priority} sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
    </> : <PhotoPlaceholder className="absolute inset-0" />}
  </div>;
}
