# Qamqor

Qamqor is a volunteer management platform that brings volunteers, project coordinators and administrators into one workspace. Guests see the public landing page, while signed-in users open a shared project dashboard. Volunteers can discover initiatives, apply, track participation, collect confirmed hours, earn achievements and download certificates. Coordinators create and manage their own projects, review applicants and confirm participation and hours. Administrators manage user roles and inherit coordinator access.

## Stack

- Next.js 15 with App Router
- React 19 and TypeScript
- Tailwind CSS and shadcn/ui-style components
- Supabase Auth, PostgreSQL, Storage and Row Level Security
- React Hook Form and Zod
- Lucide icons and Recharts
- PDF certificates generated with `pdf-lib`

## Features

### Volunteers

- Email registration, login, password recovery and persistent sessions
- Profile editing and avatar upload
- Public privacy-safe profile at `/volunteers/[id]`
- Project catalog with search, filters, sorting and pagination
- Applications with duplicate prevention and status tracking
- Active and completed project history
- Confirmed volunteer hours, achievements and PDF certificates

### Coordinators

- Project creation, publishing, editing and deletion
- Optional cover upload with a reusable Qamqor fallback illustration
- Fixed project-benefit options: letters, volunteer hours, meals, transport and merch
- Applicant review, approval, rejection and attendance marking
- Actual-hours confirmation
- Project and applicant statistics

### Administrators

- Private user and role management at `/admin/users`
- Promotion of volunteers to coordinators and coordinator-role removal
- Automatic inheritance of all coordinator permissions
- Administrator roles cannot be selected at registration or granted through the role manager

### Security and data

- RLS policies enforce role and ownership rules in PostgreSQL
- Public registration always creates a volunteer profile
- Only administrators can assign or remove coordinator access
- Private profile fields are never exposed by public views
- Profile rows are created automatically after Supabase signup
- Confirmed hours automatically award achievements and issue certificates
- Storage policies isolate avatar and project-cover uploads by owner

### Navigation

- `/` shows the landing page to guests and redirects signed-in users to `/dashboard`
- `/dashboard` is a shared scrollable feed of published projects for every role
- `/cabinet` contains the role-specific personal statistics that previously lived on the dashboard
- `/coordinator/projects/new` is available only to coordinators and administrators

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

3. Add your Supabase project URL and publishable (or legacy anon) key to `.env.local`.

4. Apply database migrations and seed data:

   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push --include-seed
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser-safe Supabase publishable or anon key |
| `NEXT_PUBLIC_APP_URL` | Recommended | Public application URL |

Never expose a Supabase secret or `service_role` key to the browser.

## Database

Migrations are stored in [`supabase/migrations`](./supabase/migrations). The schema includes:

- `profiles`
- `projects`
- `project_applications`
- `volunteer_hours`
- `achievements`
- `volunteer_achievements`
- `certificates`

Reference achievements are stored in [`supabase/seed.sql`](./supabase/seed.sql).

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

The optional Supabase smoke test creates isolated temporary users, validates the full RLS-protected workflow and removes the test data afterwards. It requires `SUPABASE_SERVICE_ROLE_KEY` only in the test process:

```bash
SUPABASE_SERVICE_ROLE_KEY=... npm run test:supabase
```

## Deployment

The project is ready for Vercel. Connect the GitHub repository, add the three public environment variables above and deploy the `main` branch. Supabase Auth redirect URLs must include the production domain and Vercel preview domains.

## Font license

PDF certificates embed Noto Sans. Its SIL Open Font License is included at [`src/assets/fonts/OFL.txt`](./src/assets/fonts/OFL.txt).
