"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, Search, SearchX } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Logo } from "@/components/layout/logo";
import { OrganizationAvatar } from "@/components/organizations/organization-avatar";
import { Chip } from "@/components/shared/chip";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fill, translateValue } from "@/lib/i18n/format";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type OrgRole = Database["public"]["Enums"]["org_role"];

export type PickerOrganization = {
  id: string;
  name: string;
  summary: string;
  category: string | null;
  logoUrl: string | null;
};

type RpcError = { code?: string; message?: string } | null;

function leaveErrorText(error: RpcError, t: Dictionary) {
  if (error?.code === "42501") return t.organizations.staffCannotLeave;
  return t.organizations.leaveError;
}

function joinErrorText(error: RpcError, t: Dictionary) {
  if (error?.code === "P0002") return t.organizations.notFoundError;
  return t.organizations.joinError;
}

export function OrganizationPicker({
  organizations,
  memberships: initialMemberships,
  next,
}: {
  organizations: PickerOrganization[];
  memberships: Record<string, OrgRole>;
  next: string;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const copy = t.organizations;
  const [memberships, setMemberships] = useState<Record<string, OrgRole>>(initialMemberships);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [continuing, setContinuing] = useState(false);

  const categories = useMemo(
    () => [...new Set(organizations.map((organization) => organization.category).filter((value): value is string => Boolean(value)))].sort(),
    [organizations],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return organizations.filter((organization) => {
      if (category && organization.category !== category) return false;
      if (!needle) return true;
      const haystack = [
        organization.name,
        organization.summary,
        organization.category ?? "",
        organization.category ? translateValue(organization.category, t.common.categories) : "",
      ].join(" ").toLocaleLowerCase();
      return haystack.includes(needle);
    });
  }, [organizations, query, category, t.common.categories]);

  const selectedCount = Object.keys(memberships).length;

  async function toggle(organization: PickerOrganization) {
    if (pending[organization.id]) return;
    const wasMember = organization.id in memberships;
    const previousRole = memberships[organization.id];

    // Optimistic update first; roll back with a toast if the database refuses.
    setPending((current) => ({ ...current, [organization.id]: true }));
    setMemberships((current) => {
      const nextState = { ...current };
      if (wasMember) delete nextState[organization.id];
      else nextState[organization.id] = "volunteer";
      return nextState;
    });

    const supabase = createClient();
    const { error } = wasMember
      ? await supabase.rpc("leave_organization", { target: organization.id })
      : await supabase.rpc("join_organization", { target: organization.id });

    if (error) {
      setMemberships((current) => {
        const nextState = { ...current };
        if (wasMember) nextState[organization.id] = previousRole;
        else delete nextState[organization.id];
        return nextState;
      });
      toast.error(wasMember ? leaveErrorText(error, t) : joinErrorText(error, t));
    }
    setPending((current) => {
      const nextState = { ...current };
      delete nextState[organization.id];
      return nextState;
    });
  }

  async function finish() {
    setContinuing(true);
    const { error } = await createClient().rpc("complete_onboarding");
    if (error) {
      setContinuing(false);
      toast.error(copy.continueError);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col pt-[var(--safe-top)]">
      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <Logo compact href="/landing" />
        <LanguageSwitcher />
      </div>

      <main className="flex-1 px-4 pt-6 pb-40">
        <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-[15px] leading-6 text-ink-secondary">{copy.lead}</p>

        <div className="relative mt-6">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-secondary" />
          <label htmlFor="organization-search" className="sr-only">{copy.searchLabel}</label>
          <Input
            id="organization-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            autoComplete="off"
            className="pl-11"
          />
        </div>

        {categories.length > 0 ? (
          <div role="group" aria-label={copy.categoriesLabel} className="scroll-row -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
            <Chip pressed={category === null} onClick={() => setCategory(null)}>{copy.all}</Chip>
            {categories.map((item) => (
              <Chip key={item} pressed={category === item} onClick={() => setCategory(category === item ? null : item)}>
                {translateValue(item, t.common.categories)}
              </Chip>
            ))}
          </div>
        ) : null}

        <div className="mt-5" aria-live="polite">
          {organizations.length === 0 ? (
            <EmptyState title={copy.noOrganizationsTitle} description={copy.noOrganizationsText} />
          ) : visible.length === 0 ? (
            <EmptyState icon={SearchX} title={copy.noResultsTitle} description={copy.noResultsText}>
              <Button variant="secondary" className="mt-5" onClick={() => { setQuery(""); setCategory(null); }}>{copy.resetSearch}</Button>
            </EmptyState>
          ) : (
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-3">
              {visible.map((organization) => {
                const role = memberships[organization.id];
                const joined = Boolean(role);
                const isStaff = role === "coordinator" || role === "head";
                const busy = Boolean(pending[organization.id]);
                return (
                  <li key={organization.id} className="flex min-w-0 items-center gap-3 rounded-row border border-hairline bg-surface p-3.5">
                    <OrganizationAvatar name={organization.name} logoUrl={organization.logoUrl} />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[15px] font-bold leading-5">{organization.name}</p>
                      <p className="mt-0.5 truncate text-sm text-ink-secondary">
                        {isStaff ? copy.staffRole[role] : organization.category ? translateValue(organization.category, t.common.categories) : organization.summary}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void toggle(organization)}
                      disabled={busy || isStaff}
                      aria-pressed={joined}
                      aria-label={fill(joined ? copy.leaveLabel : copy.joinLabel, { name: organization.name })}
                      className={cn(
                        "inline-flex h-11 min-w-[6.5rem] shrink-0 items-center justify-center gap-1.5 rounded-button px-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed",
                        joined ? "bg-ink text-white hover:bg-ink/85" : "border border-control bg-surface text-ink hover:bg-page",
                        isStaff && "opacity-70",
                      )}
                    >
                      {busy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : joined ? <Check aria-hidden="true" className="size-4" /> : <Plus aria-hidden="true" className="size-4" />}
                      <span aria-hidden="true">{joined ? copy.joined : copy.join}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-surface/95 backdrop-blur">
        <div className="safe-bottom mx-auto w-full max-w-[480px] px-4 pt-3">
          {selectedCount === 0 ? <p className="mb-2 text-sm leading-5 text-ink-secondary">{copy.emptySelectionHint}</p> : null}
          <div className="flex items-center justify-between gap-3">
            <p className="text-[15px] font-semibold" aria-live="polite">{fill(copy.selected, { count: selectedCount })}</p>
            <Button variant="brand" size="lg" onClick={() => void finish()} disabled={continuing} className="min-w-36">
              {continuing ? <Loader2 className="animate-spin" /> : null}
              {copy.continue}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
