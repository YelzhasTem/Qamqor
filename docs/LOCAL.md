# Running Qamqor locally

Everything runs on your machine: a local Supabase stack in Docker (Postgres, Auth, Storage, a mail catcher) and the Next.js dev server. No hosted Supabase project and no real data are involved.

## Prerequisites

- **Docker Desktop** (or another Docker engine), running.
- **Node.js 20 or newer** and npm.

The Supabase CLI is a dev dependency of this repository, so `npx supabase …` and the npm scripts below work without a global install.

## Three commands

```bash
npm ci                # 1. install dependencies (includes the Supabase CLI)
npm run db:start      # 2. start the local Supabase stack
npm run demo:reset    # 3. rebuild the database and load the demo data
```

Then create `.env.local` (once) and start the app:

```bash
cp .env.local.example .env.local   # paste the local anon key, see below
npm run dev
```

Open <http://localhost:3000>.

The first `db:start` downloads several container images and can take a few minutes. Later starts take seconds.

## npm scripts

| Command | What it does |
| --- | --- |
| `npm run db:start` | Start the local Supabase stack (`npx supabase start`). |
| `npm run db:stop` | Stop it. Data is kept until the next reset. |
| `npm run db:reset` | Drop the local database, run every migration and `supabase/seed.sql` (reference achievements). |
| `npm run demo:reset` | `db:reset`, then create the demo organizations, accounts, projects, applications and hours (`scripts/seed-demo.mjs`). Same result every time. |
| `npm run types:gen` | Regenerate `src/types/database.ts` from the local database. Run it after adding a migration. |
| `npm run test:supabase` | End-to-end smoke test of the existing RLS workflow on temporary users. |
| `npm run test:access` | Access checks for organizations and membership (see below). |

The seed and test scripts read the local URL and keys from `npx supabase status` automatically, and refuse to run when the Supabase URL is anything other than `127.0.0.1` or `localhost`.

## Local keys

```bash
npx supabase status
```

prints the local **API URL** (`http://127.0.0.1:54321`), the **anon key** (also shown as the publishable key), the **service_role key** (also shown as the secret key), the Studio URL and the mail catcher URL. Put only the API URL and the anon key in `.env.local`. These keys belong to your local stack and are not secret, but never paste keys of a hosted project into any env file in this repository.

## Demo accounts

`npm run demo:reset` creates a platform admin, a head and a coordinator for each of three demo organizations, and about forty volunteers. The full list and the shared demo password are in [DEMO.md](DEMO.md). Sign in at <http://localhost:3000/auth/login>.

## Reading local e-mails

Sign-up confirmation and password-reset e-mails are not sent anywhere. They land in the local mail catcher (Mailpit) at <http://127.0.0.1:54324>; `npx supabase status` prints the same address. The links inside point back to `http://localhost:3000`.

## Making a user a platform admin

Public sign-up always creates a volunteer. To make an existing local account a platform admin, run this in Supabase Studio (<http://127.0.0.1:54323>, SQL editor) or with `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres`:

```sql
update public.profiles p
set role = 'admin', updated_at = now()
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('someone@example.com');
```

A platform admin can then promote volunteers to coordinators on the **Пользователи** screen.

## Troubleshooting

- **`supabase start` cannot pull images** (for example `Forbidden` from a CDN behind a corporate proxy): pull from Docker Hub instead with `SUPABASE_INTERNAL_IMAGE_REGISTRY=docker.io npm run db:start`.
- **Ports already in use**: another Supabase project is running. Stop it with `npx supabase stop --project-id <name>` or change the ports in `supabase/config.toml`.
- **Signed in but every page sends you to the organization picker**: that account has not finished onboarding yet. Pick organizations (or none) and press **Продолжить**.
