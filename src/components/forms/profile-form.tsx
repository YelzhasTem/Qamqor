"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { FormField, fieldA11y } from "@/components/forms/form-field";
import { useLanguage } from "@/components/i18n/language-provider";
import { FormMessage } from "@/components/shared/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/lib/actions/profile";
import { errorText } from "@/lib/errors";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Profile } from "@/types/app";

/** Same rules as profileSchema in src/lib/validations.ts, with translated messages. */
function schemaFor(t: Dictionary) {
  const messages = t.volunteer.profile.validation;
  return z.object({
    full_name: z.string().trim().min(2, messages.nameRequired).max(120, messages.nameTooLong),
    phone: z.string().trim().max(32, messages.phoneTooLong).optional().or(z.literal("")),
    bio: z.string().trim().max(1000, messages.bioTooLong).optional().or(z.literal("")),
  });
}

type Values = z.infer<ReturnType<typeof schemaFor>>;

export function ProfileForm({ profile }: { profile: Profile }) {
  const { t } = useLanguage();
  const copy = t.volunteer.profile;
  const schema = useMemo(() => schemaFor(t), [t]);
  const [message, setMessage] = useState<string>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: profile.full_name, phone: profile.phone ?? "", bio: profile.bio ?? "" },
  });

  return (
    <form
      noValidate
      className="grid gap-5"
      onSubmit={handleSubmit(async (values) => {
        setMessage(undefined);
        const result = await updateProfileAction(values);
        if (result.success) toast.success(copy.saved);
        else setMessage(errorText(result.error, t));
      })}
    >
      <FormField id="profile-full-name" label={copy.fullName} error={errors.full_name?.message}>
        <Input id="profile-full-name" autoComplete="name" {...register("full_name")} {...fieldA11y("profile-full-name", errors.full_name?.message)} />
      </FormField>
      <FormField id="profile-phone" label={copy.phone} error={errors.phone?.message}>
        <Input id="profile-phone" type="tel" autoComplete="tel" placeholder="+7 700 000 00 00" aria-describedby="profile-phone-hint" {...register("phone")} {...fieldA11y("profile-phone", errors.phone?.message)} />
        <p id="profile-phone-hint" className="text-sm leading-5 text-ink-secondary">{copy.phonePrivacy}</p>
      </FormField>
      <FormField id="profile-bio" label={copy.bio} error={errors.bio?.message}>
        <Textarea id="profile-bio" placeholder={copy.bioPlaceholder} {...register("bio")} {...fieldA11y("profile-bio", errors.bio?.message)} />
      </FormField>
      <FormMessage message={message} />
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-fit">
        {isSubmitting ? <Loader2 className="animate-spin" /> : null}
        {copy.save}
      </Button>
    </form>
  );
}
