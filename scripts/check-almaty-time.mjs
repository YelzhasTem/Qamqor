// Proves the Almaty-time rule from section 1 of the volunteer-app brief:
// every date shown or typed in the UI is Almaty wall-clock time, whatever the
// time zone of the process. Runs itself once per time zone below. LOCAL only.
//
//   npm run test:time
//
// Checks, in every zone:
// - a demo seed project that starts at 10:00 Almaty renders as 10:00 in ru, kk, en;
// - the form value "09:00" becomes 04:00 UTC through the conversion the project
//   actions use, and reads back as "09:00" for the form;
// - a project row saved with that value by its coordinator (through the API,
//   under RLS) is stored as 04:00 UTC;
// - "today" and "tomorrow" are decided on the Almaty calendar.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const zones = ["UTC", "America/New_York", "Pacific/Kiritimati"];

if (!process.env.ALMATY_TIME_CHILD) {
  const script = fileURLToPath(import.meta.url);
  let failed = false;
  for (const zone of zones) {
    const result = spawnSync(process.execPath, ["--import", "./scripts/lib/register-ts-paths.mjs", script], {
      env: { ...process.env, TZ: zone, ALMATY_TIME_CHILD: "1" },
      encoding: "utf8",
    });
    process.stdout.write(result.stdout);
    if (result.status !== 0) {
      failed = true;
      process.stderr.write(result.stderr);
    }
  }
  if (failed) process.exit(1);
  console.log(`Almaty time checks passed in ${zones.length} process time zones.`);
  process.exit(0);
}

const { createClient } = await import("@supabase/supabase-js");
const { clientOptions, getLocalSupabaseConfig } = await import("./lib/local-supabase.mjs");
const time = await import("@/lib/datetime");

const zone = process.env.TZ;
const offsetMinutes = -new Date("2026-11-29T12:00:00Z").getTimezoneOffset();
const { url, anonKey, serviceKey } = getLocalSupabaseConfig();
const admin = createClient(url, serviceKey, clientOptions);

// 1. A seed project at 10:00 Almaty.
const { data: seedProject, error: seedError } = await admin
  .from("projects")
  .select("id, title, start_date")
  .eq("title", "Посадка деревьев в парке Демо")
  .single();
assert.ifError(seedError);
assert.equal(new Date(seedProject.start_date).getUTCHours(), 5, "seed project must be stored at 05:00 UTC");
for (const locale of ["ru", "kk", "en"]) {
  assert.equal(time.formatTime(seedProject.start_date), "10:00");
  assert.match(time.formatCardMoment(seedProject.start_date, locale), /· 10:00$/);
  assert.match(time.formatDateTime(seedProject.start_date, locale), /10:00$/);
}

// 2. The form value conversion used by createProjectAction and saveProjectAction.
assert.equal(time.almatyInputToIso("2026-11-29T09:00"), "2026-11-29T04:00:00.000Z");
assert.equal(time.isoToAlmatyInput("2026-11-29T04:00:00.000Z"), "2026-11-29T09:00");
assert.equal(time.almatyInputToIso("2026-12-31T23:30"), "2026-12-31T18:30:00.000Z");
assert.equal(time.almatyInputToIso("not a date"), null);

// 3. Saved by the project's coordinator under RLS, read back from the database.
const coordinator = createClient(url, anonKey, clientOptions);
assert.ifError((await coordinator.auth.signInWithPassword({ email: "coordinator.animals@demo.qamqor.test", password: "qamqor-demo-local" })).error);
const { data: draft, error: draftError } = await coordinator
  .from("projects")
  .select("id, start_date, end_date")
  .eq("title", "Фотосессия для котов из приюта")
  .single();
assert.ifError(draftError);
try {
  const start = time.almatyInputToIso("2026-12-12T09:00");
  const end = time.almatyInputToIso("2026-12-12T12:00");
  const { error: updateError } = await coordinator.from("projects").update({ start_date: start, end_date: end }).eq("id", draft.id);
  assert.ifError(updateError);
  const { data: stored } = await admin.from("projects").select("start_date").eq("id", draft.id).single();
  assert.equal(new Date(stored.start_date).toISOString(), "2026-12-12T04:00:00.000Z");
  assert.equal(time.isoToAlmatyInput(stored.start_date), "2026-12-12T09:00");
} finally {
  await admin.from("projects").update({ start_date: draft.start_date, end_date: draft.end_date }).eq("id", draft.id);
}

// 4. Today and tomorrow on the Almaty calendar: 23:59 and 00:30 Almaty are different days.
const lateEvening = "2026-11-28T18:59:00Z"; // 23:59 on 28 November in Almaty
const afterMidnight = "2026-11-28T19:30:00Z"; // 00:30 on 29 November in Almaty
assert.equal(time.relativeDayLabel(lateEvening, "ru", lateEvening), "Сегодня");
assert.equal(time.relativeDayLabel(afterMidnight, "ru", lateEvening), "Завтра");
assert.equal(time.relativeDayLabel(afterMidnight, "kk", lateEvening), "Ертең");
assert.equal(time.relativeDayLabel(afterMidnight, "en", lateEvening), "Tomorrow");
assert.equal(time.formatEventStart(afterMidnight, "ru", lateEvening), "Завтра, 00:30");

console.log(`  ok  TZ=${zone} (UTC${offsetMinutes >= 0 ? "+" : ""}${offsetMinutes / 60}): seed 10:00 shows 10:00, typed 09:00 is stored as 04:00 UTC`);
