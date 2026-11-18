// Resolves connection settings for the LOCAL Supabase stack only.
// Values come from the environment first, then from `supabase status -o env`.
// Any URL that is not 127.0.0.1 or localhost is refused, so these scripts can
// never write demo data or test users into a hosted project.
import { execFileSync } from "node:child_process";

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

function readStatusEnv() {
  try {
    const output = execFileSync("npx", ["supabase", "status", "-o", "env"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const values = {};
    for (const line of output.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
      if (match) values[match[1]] = match[2];
    }
    return values;
  } catch {
    return {};
  }
}

export function assertLocalUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Supabase URL is not a valid URL: ${url}`);
  }
  if (!LOCAL_HOSTS.has(parsed.hostname)) {
    throw new Error(
      `Refusing to run against ${parsed.hostname}. This script only works with the local Supabase stack (127.0.0.1 or localhost).`,
    );
  }
}

export function getLocalSupabaseConfig() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    const status = readStatusEnv();
    url ??= status.API_URL;
    anonKey ??= status.ANON_KEY;
    serviceKey ??= status.SERVICE_ROLE_KEY;
  }

  if (!url || !anonKey || !serviceKey) {
    throw new Error(
      "Local Supabase settings not found. Start the stack with `npm run db:start`, or set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  assertLocalUrl(url);
  return { url, anonKey, serviceKey };
}

export const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};
