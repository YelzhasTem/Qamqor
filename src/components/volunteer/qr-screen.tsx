"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Clock3, QrCode, X } from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { formatEventStart } from "@/lib/datetime";
import { fill } from "@/lib/i18n/format";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const REFRESH_MS = 15_000;

function CloseButton({ className }: { className?: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  return (
    <button
      type="button"
      aria-label={t.volunteer.qr.close}
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/dashboard"))}
      className={cn("flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-ink shadow-sm transition-colors hover:bg-page", className)}
    >
      <X aria-hidden="true" className="size-5" />
    </button>
  );
}

/** Keeps the screen on while the code is shown, where the browser allows it. */
function useWakeLock() {
  useEffect(() => {
    type Sentinel = { release: () => Promise<void> };
    const nav = navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<Sentinel> } };
    let sentinel: Sentinel | null = null;
    let disposed = false;
    const acquire = async () => {
      if (!nav.wakeLock || document.visibilityState !== "visible") return;
      try {
        const lock = await nav.wakeLock.request("screen");
        if (disposed) await lock.release().catch(() => undefined);
        else sentinel = lock;
      } catch {
        // Not supported, denied or low battery: the page works without it.
      }
    };
    const onVisibility = () => { if (document.visibilityState === "visible") void acquire(); };
    void acquire();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release().catch(() => undefined);
    };
  }, []);
}

export function QrScreen({
  application,
  volunteerName,
  qr,
  others,
}: {
  application: { id: string; status: string; title: string; startDate: string };
  volunteerName: string;
  qr: { size: number; path: string; content: string };
  others: { id: string; title: string; startDate: string }[];
}) {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const copy = t.volunteer.qr;
  const [status, setStatus] = useState(application.status);
  useWakeLock();

  const refresh = useCallback(async () => {
    const { data, error } = await createClient()
      .from("project_applications")
      .select("status")
      .eq("id", application.id)
      .maybeSingle();
    if (error) return;
    if (!data || (data.status !== "approved" && data.status !== "attended")) {
      // Cancelled, rejected or completed: let the server pick what to show.
      router.refresh();
      return;
    }
    setStatus(data.status);
  }, [application.id, router]);

  useEffect(() => {
    const timer = window.setInterval(() => void refresh(), REFRESH_MS);
    const onFocus = () => void refresh();
    const onVisibility = () => { if (document.visibilityState === "visible") void refresh(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  const attended = status === "attended";

  return (
    <div className="min-h-dvh bg-brand text-brand-foreground">
      <div className="mx-auto w-full max-w-[480px] px-4 pt-[calc(0.75rem+var(--safe-top))] pb-[calc(2rem+var(--safe-bottom))]">
        <div className="grid grid-cols-[44px_1fr_44px] items-center">
          <CloseButton />
          <h1 className="text-center text-lg font-extrabold">{copy.title}</h1>
        </div>

        <section className="mt-5 rounded-[28px] bg-surface px-5 pt-5 pb-6 text-center text-ink">
          <p className="text-sm font-semibold text-ink-secondary">{formatEventStart(application.startDate, locale)} · {application.title}</p>
          <h2 className="mt-2 text-2xl leading-tight font-extrabold">{volunteerName}</h2>
          <div className="mx-auto mt-4 w-full max-w-[280px]">
            <svg
              role="img"
              aria-label={fill(copy.codeLabel, { title: application.title })}
              data-checkin-url={qr.content}
              viewBox={`0 0 ${qr.size} ${qr.size}`}
              shapeRendering="crispEdges"
              className="block aspect-square w-full min-w-[232px]"
            >
              <rect width={qr.size} height={qr.size} fill="var(--qr-light)" />
              <path d={qr.path} fill="var(--qr-dark)" />
            </svg>
          </div>
          <p className="mt-4 text-[15px] leading-6 text-ink-secondary">{copy.hint}</p>
          <p
            aria-live="polite"
            className={cn(
              "mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold",
              attended ? "bg-positive text-positive-foreground" : "bg-waiting text-waiting-foreground",
            )}
          >
            {attended ? <CheckCircle2 aria-hidden="true" className="size-4" /> : <Clock3 aria-hidden="true" className="size-4" />}
            {attended ? copy.attended : copy.waiting}
          </p>
        </section>

        <p className="mt-4 text-center text-[15px] font-medium">{copy.onlyThisEvent}</p>

        {others.length ? (
          <section className="mt-8">
            <h2 className="text-base font-extrabold">{copy.otherEvents}</h2>
            <ul className="mt-3 grid gap-2">
              {others.map((other) => (
                <li key={other.id}>
                  <Link
                    href={`/qr?application=${other.id}`}
                    replace
                    className="flex min-h-14 items-center gap-3 rounded-row border border-brand-foreground/40 px-4 py-2.5 transition-colors hover:bg-brand-hover"
                  >
                    <QrCode aria-hidden="true" className="size-5 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{other.title}</span>
                      <span className="block text-sm">{formatEventStart(other.startDate, locale)}</span>
                    </span>
                    <ChevronRight aria-hidden="true" className="size-5 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

/** No approved application: a calm page on the normal background. */
export function QrEmpty() {
  const { t } = useLanguage();
  const copy = t.volunteer.qr;
  return (
    <div className="min-h-dvh bg-page">
      <div className="mx-auto w-full max-w-[480px] px-4 pt-[calc(0.75rem+var(--safe-top))]">
        <div className="grid grid-cols-[44px_1fr_44px] items-center">
          <CloseButton className="border border-hairline" />
          <h1 className="text-center text-lg font-extrabold">{copy.title}</h1>
        </div>
        <div className="mt-16 flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-inset text-ink-muted"><QrCode aria-hidden="true" className="size-8" /></span>
          <p className="mt-5 max-w-xs text-lg leading-snug font-extrabold">{copy.emptyTitle}</p>
          <Button asChild variant="secondary" size="lg" className="mt-6"><Link href="/dashboard">{copy.openFeed}</Link></Button>
        </div>
      </div>
    </div>
  );
}
