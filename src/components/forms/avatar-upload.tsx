"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/i18n/language-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { uploadAvatarAction } from "@/lib/actions/profile";
import { errorText } from "@/lib/errors";
import { initials } from "@/lib/utils";

export function AvatarUpload({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl ?? null);
  const router = useRouter();
  const { t } = useLanguage();
  const copy = t.volunteer.profile;

  async function upload(file: File) {
    const previous = preview;
    setPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.set("avatar", file);
    setPending(true);
    const result = await uploadAvatarAction(formData);
    setPending(false);
    if (result.success) {
      toast.success(copy.photoUpdated);
      setPreview(result.data?.url ?? null);
      router.refresh();
    } else {
      setPreview(previous);
      toast.error(errorText(result.error, t));
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-20 border border-hairline">
        <AvatarImage src={preview ?? undefined} alt="" />
        <AvatarFallback className="text-xl">{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <input
          ref={inputRef}
          id="avatar-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
        />
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Camera />}
          {copy.uploadPhoto}
        </Button>
        <p className="mt-1.5 text-sm text-ink-secondary">{copy.photoHint}</p>
      </div>
    </div>
  );
}
