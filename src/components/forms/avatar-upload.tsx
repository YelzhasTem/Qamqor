"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { uploadAvatarAction } from "@/lib/actions/profile";
import { initials } from "@/lib/utils";

export function AvatarUpload({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl ?? null);
  const router = useRouter();
  return <div className="flex flex-col items-center gap-4 sm:flex-row"><Avatar className="size-24 border-4 border-white shadow-lg"><AvatarImage src={preview ?? undefined} /><AvatarFallback className="text-xl">{initials(name)}</AvatarFallback></Avatar><div><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setPreview(URL.createObjectURL(file)); const formData = new FormData(); formData.set("avatar", file); setPending(true); const result = await uploadAvatarAction(formData); setPending(false); if (result.success) { toast.success("Фотография обновлена"); setPreview(result.data?.url ?? null); router.refresh(); } else toast.error(result.error); }} /><Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <Camera />}Загрузить фотографию</Button><p className="mt-2 text-xs text-muted-foreground">JPG, PNG или WebP · до 5 МБ</p></div></div>;
}
