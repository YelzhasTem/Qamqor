-- Qamqor initial schema
-- PostgreSQL, Supabase Auth, Storage and Row Level Security

create extension if not exists "pgcrypto";

create type public.user_role as enum ('volunteer', 'coordinator');
create type public.project_format as enum ('online', 'offline');
create type public.project_status as enum ('draft', 'published', 'completed', 'cancelled');
create type public.application_status as enum ('pending', 'approved', 'rejected', 'attended', 'completed');
create type public.hour_status as enum ('pending', 'confirmed', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'volunteer',
  full_name text not null default '',
  avatar_url text,
  city text,
  phone text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_name_length check (char_length(full_name) <= 120),
  constraint profiles_city_length check (char_length(city) <= 100),
  constraint profiles_phone_length check (char_length(phone) <= 32),
  constraint profiles_bio_length check (char_length(bio) <= 1000)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  coordinator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  cover_url text,
  category text not null,
  city text not null,
  address text,
  format public.project_format not null default 'offline',
  start_date timestamptz not null,
  end_date timestamptz not null,
  volunteer_hours numeric(6, 2) not null default 0,
  required_volunteers integer not null default 1,
  requirements text,
  status public.project_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_title_length check (char_length(title) between 3 and 160),
  constraint projects_description_length check (char_length(description) between 20 and 6000),
  constraint projects_date_order check (end_date >= start_date),
  constraint projects_hours_positive check (volunteer_hours >= 0 and volunteer_hours <= 1000),
  constraint projects_capacity_positive check (required_volunteers > 0 and required_volunteers <= 100000),
  constraint projects_offline_address check (format = 'online' or nullif(trim(address), '') is not null)
);

create table public.project_applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  volunteer_id uuid not null references public.profiles(id) on delete cascade,
  status public.application_status not null default 'pending',
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, volunteer_id)
);

create table public.volunteer_hours (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  hours numeric(6, 2) not null,
  confirmed_by uuid references public.profiles(id) on delete set null,
  status public.hour_status not null default 'pending',
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint volunteer_hours_positive check (hours >= 0 and hours <= 1000),
  unique (volunteer_id, project_id)
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  required_hours numeric(8, 2) not null unique,
  icon text not null default 'award',
  created_at timestamptz not null default now(),
  constraint achievements_hours_positive check (required_hours >= 0)
);

create table public.volunteer_achievements (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique (volunteer_id, achievement_id)
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  certificate_url text not null,
  issued_at timestamptz not null default now(),
  unique (volunteer_id, project_id)
);

create index projects_catalog_idx on public.projects (status, start_date desc);
create index projects_coordinator_idx on public.projects (coordinator_id, created_at desc);
create index projects_search_idx on public.projects using gin (to_tsvector('simple', title || ' ' || description || ' ' || city || ' ' || category));
create index applications_volunteer_idx on public.project_applications (volunteer_id, status, applied_at desc);
create index applications_project_idx on public.project_applications (project_id, status, applied_at desc);
create index hours_volunteer_idx on public.volunteer_hours (volunteer_id, status);
create index hours_project_idx on public.volunteer_hours (project_id, status);
create index certificates_volunteer_idx on public.certificates (volunteer_id, issued_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();
create trigger applications_set_updated_at before update on public.project_applications
for each row execute function public.set_updated_at();
create trigger hours_set_updated_at before update on public.volunteer_hours
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  requested_role public.user_role;
begin
  requested_role := case
    when new.raw_user_meta_data ->> 'role' = 'coordinator' then 'coordinator'::public.user_role
    else 'volunteer'::public.user_role
  end;

  insert into public.profiles (id, role, full_name, city)
  values (
    new.id,
    requested_role,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    nullif(trim(new.raw_user_meta_data ->> 'city'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_coordinator(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role = 'coordinator'
  );
$$;

create or replace function public.owns_project(target_project_id uuid, user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.projects
    where id = target_project_id and coordinator_id = user_id
  );
$$;

create or replace function public.project_has_capacity(target_project_id uuid)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select coalesce((
    select count(*) filter (where a.status in ('approved', 'attended', 'completed')) < p.required_volunteers
    from public.projects p
    left join public.project_applications a on a.project_id = p.id
    where p.id = target_project_id
    group by p.required_volunteers
  ), false);
$$;

create or replace function public.validate_application()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  project_row public.projects;
begin
  if not exists (select 1 from public.profiles where id = new.volunteer_id and role = 'volunteer') then
    raise exception 'Only volunteers can apply to projects';
  end if;

  select * into project_row from public.projects where id = new.project_id;
  if project_row.id is null or project_row.status <> 'published' or project_row.end_date < now() then
    raise exception 'Project is not accepting applications';
  end if;

  if not public.project_has_capacity(new.project_id) then
    raise exception 'Project has no available places';
  end if;
  return new;
end;
$$;

create trigger applications_validate before insert on public.project_applications
for each row execute function public.validate_application();

create or replace function public.process_confirmed_hours()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  total_hours numeric;
  certificate_id uuid;
begin
  if new.status = 'confirmed' then
    new.confirmed_at := coalesce(new.confirmed_at, now());

    select coalesce(sum(hours), 0) into total_hours
    from public.volunteer_hours
    where volunteer_id = new.volunteer_id
      and status = 'confirmed'
      and id <> new.id;
    total_hours := total_hours + new.hours;

    insert into public.volunteer_achievements (volunteer_id, achievement_id)
    select new.volunteer_id, id
    from public.achievements
    where required_hours <= total_hours
    on conflict (volunteer_id, achievement_id) do nothing;

    certificate_id := gen_random_uuid();
    insert into public.certificates (id, volunteer_id, project_id, certificate_url)
    values (certificate_id, new.volunteer_id, new.project_id, '/api/certificates/' || certificate_id::text)
    on conflict (volunteer_id, project_id)
    do update set issued_at = now();
  else
    new.confirmed_at := null;
  end if;
  return new;
end;
$$;

create trigger hours_process_confirmation
before insert or update of status, hours on public.volunteer_hours
for each row execute function public.process_confirmed_hours();

-- Public, privacy-safe read models. They never expose email or phone.
create view public.public_profiles
with (security_invoker = false, security_barrier = true)
as
select id, role, full_name, avatar_url, city, bio, created_at
from public.profiles;

create view public.public_volunteer_profiles
with (security_invoker = false, security_barrier = true)
as
select
  p.id,
  p.full_name,
  p.avatar_url,
  p.city,
  p.bio,
  p.created_at,
  coalesce(sum(vh.hours) filter (where vh.status = 'confirmed'), 0)::numeric(10, 2) as confirmed_hours,
  count(distinct pa.project_id) filter (where pa.status = 'completed')::bigint as completed_projects
from public.profiles p
left join public.volunteer_hours vh on vh.volunteer_id = p.id
left join public.project_applications pa on pa.volunteer_id = p.id
where p.role = 'volunteer'
group by p.id;

create view public.project_public_stats
with (security_invoker = false, security_barrier = true)
as
select
  p.id as project_id,
  count(a.id) filter (where a.status in ('approved', 'attended', 'completed'))::bigint as participant_count,
  greatest(p.required_volunteers - count(a.id) filter (where a.status in ('approved', 'attended', 'completed')), 0)::bigint as available_places
from public.projects p
left join public.project_applications a on a.project_id = p.id
group by p.id;

create view public.platform_stats
with (security_invoker = false, security_barrier = true)
as
select
  (select count(*) from public.profiles where role = 'volunteer')::bigint as volunteers,
  (select count(*) from public.projects where status in ('published', 'completed'))::bigint as projects,
  (select coalesce(sum(hours), 0) from public.volunteer_hours where status = 'confirmed')::numeric(12, 2) as confirmed_hours;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_applications enable row level security;
alter table public.volunteer_hours enable row level security;
alter table public.achievements enable row level security;
alter table public.volunteer_achievements enable row level security;
alter table public.certificates enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated
using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());

create policy "projects_public_read" on public.projects for select to anon, authenticated
using (status in ('published', 'completed') or coordinator_id = auth.uid());
create policy "coordinators_create_projects" on public.projects for insert to authenticated
with check (coordinator_id = auth.uid() and public.is_coordinator());
create policy "coordinators_update_own_projects" on public.projects for update to authenticated
using (coordinator_id = auth.uid() and public.is_coordinator())
with check (coordinator_id = auth.uid() and public.is_coordinator());
create policy "coordinators_delete_own_projects" on public.projects for delete to authenticated
using (coordinator_id = auth.uid() and public.is_coordinator());

create policy "volunteers_read_own_applications" on public.project_applications for select to authenticated
using (volunteer_id = auth.uid());
create policy "coordinators_read_project_applications" on public.project_applications for select to authenticated
using (public.owns_project(project_id));
create policy "volunteers_apply" on public.project_applications for insert to authenticated
with check (volunteer_id = auth.uid() and not public.is_coordinator());
create policy "coordinators_update_applications" on public.project_applications for update to authenticated
using (public.owns_project(project_id)) with check (public.owns_project(project_id));
create policy "volunteers_cancel_applications" on public.project_applications for delete to authenticated
using (volunteer_id = auth.uid() and status in ('pending', 'approved'));
create policy "coordinators_delete_applications" on public.project_applications for delete to authenticated
using (public.owns_project(project_id));

create policy "volunteers_read_own_hours" on public.volunteer_hours for select to authenticated
using (volunteer_id = auth.uid());
create policy "coordinators_read_project_hours" on public.volunteer_hours for select to authenticated
using (public.owns_project(project_id));
create policy "coordinators_add_hours" on public.volunteer_hours for insert to authenticated
with check (public.owns_project(project_id) and confirmed_by = auth.uid());
create policy "coordinators_update_hours" on public.volunteer_hours for update to authenticated
using (public.owns_project(project_id))
with check (public.owns_project(project_id) and confirmed_by = auth.uid());

create policy "achievements_public_read" on public.achievements for select to anon, authenticated using (true);
create policy "volunteer_achievements_public_read" on public.volunteer_achievements for select to anon, authenticated using (true);
create policy "volunteers_read_own_certificates" on public.certificates for select to authenticated
using (volunteer_id = auth.uid());
create policy "coordinators_read_project_certificates" on public.certificates for select to authenticated
using (public.owns_project(project_id));

revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url, city, phone, bio, updated_at) on public.profiles to authenticated;
grant select on public.public_profiles, public.public_volunteer_profiles, public.project_public_stats, public.platform_stats to anon, authenticated;

-- Storage buckets for public avatars and project covers.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('project-covers', 'project-covers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public_read_avatars" on storage.objects for select to public using (bucket_id = 'avatars');
create policy "users_upload_own_avatar" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users_update_own_avatar" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and owner_id = auth.uid()::text)
with check (bucket_id = 'avatars' and owner_id = auth.uid()::text);
create policy "users_delete_own_avatar" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and owner_id = auth.uid()::text);

create policy "public_read_project_covers" on storage.objects for select to public using (bucket_id = 'project-covers');
create policy "coordinators_upload_project_covers" on storage.objects for insert to authenticated
with check (bucket_id = 'project-covers' and (storage.foldername(name))[1] = auth.uid()::text and public.is_coordinator());
create policy "coordinators_update_project_covers" on storage.objects for update to authenticated
using (bucket_id = 'project-covers' and owner_id = auth.uid()::text and public.is_coordinator())
with check (bucket_id = 'project-covers' and owner_id = auth.uid()::text and public.is_coordinator());
create policy "coordinators_delete_project_covers" on storage.objects for delete to authenticated
using (bucket_id = 'project-covers' and owner_id = auth.uid()::text and public.is_coordinator());

comment on view public.public_profiles is 'Privacy-safe public profile fields; excludes email and phone.';
comment on view public.public_volunteer_profiles is 'Public volunteer profiles with aggregate confirmed activity.';
