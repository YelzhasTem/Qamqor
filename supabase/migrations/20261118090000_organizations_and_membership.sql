-- Organizations and membership (minimal foundation).
--
-- A platform admin creates organizations; organizations do not self-register.
-- A volunteer joins one or several active organizations instantly through
-- public.join_organization(). Every permission rule lives in the database so
-- that any client (web or a future native app) gets the same behaviour.
--
-- profiles.role keeps driving the existing coordinator and admin screens for
-- now. organization_members.role is introduced here and becomes the source of
-- truth for per-organization access in later parts.

create type public.org_role as enum ('volunteer', 'coordinator', 'head');

-- Organizations -------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  summary text not null default '',
  category text,
  city text not null default 'Алматы',
  logo_url text,
  is_demo boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  constraint organizations_name_length check (char_length(trim(name)) between 2 and 120),
  constraint organizations_summary_length check (char_length(summary) <= 160),
  constraint organizations_category_length check (category is null or char_length(category) between 1 and 80),
  constraint organizations_city_length check (char_length(city) between 1 and 100),
  constraint organizations_status_allowed check (status in ('active', 'hidden'))
);

create index organizations_status_name_idx on public.organizations (status, name);

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;

create policy "organizations_read_active"
on public.organizations
for select
to anon, authenticated
using (status = 'active' or public.is_admin(auth.uid()));

create policy "organizations_admin_insert"
on public.organizations
for insert
to authenticated
with check (public.is_admin(auth.uid()));

create policy "organizations_admin_update"
on public.organizations
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "organizations_admin_delete"
on public.organizations
for delete
to authenticated
using (public.is_admin(auth.uid()));

revoke all on table public.organizations from anon, authenticated;
grant select on table public.organizations to anon;
grant select, insert, update, delete on table public.organizations to authenticated;

-- Membership ----------------------------------------------------------------

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.org_role not null default 'volunteer',
  joined_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index organization_members_user_idx on public.organization_members (user_id);

alter table public.organization_members enable row level security;

create policy "organization_members_read_own"
on public.organization_members
for select
to authenticated
using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- Only platform admins write membership rows directly. Ordinary users join and
-- leave through the security definer functions below.
create policy "organization_members_admin_insert"
on public.organization_members
for insert
to authenticated
with check (public.is_admin(auth.uid()));

create policy "organization_members_admin_update"
on public.organization_members
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "organization_members_admin_delete"
on public.organization_members
for delete
to authenticated
using (public.is_admin(auth.uid()));

revoke all on table public.organization_members from anon, authenticated;
grant select, insert, update, delete on table public.organization_members to authenticated;

-- Projects belong to an organization. Nullable for now: existing rows have no
-- organization, and project creation is not changed in this part.
alter table public.projects
add column organization_id uuid references public.organizations(id) on delete restrict;

create index projects_organization_idx on public.projects (organization_id);

-- Onboarding marker. Protected by the existing column-level grants: users
-- cannot update it directly, only through public.complete_onboarding().
alter table public.profiles
add column onboarded_at timestamptz;

-- Functions -----------------------------------------------------------------

create or replace function public.join_organization(target uuid)
returns public.organization_members
language plpgsql
security definer set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  membership public.organization_members;
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.organizations
    where id = target and status = 'active'
  ) then
    raise exception 'Organization not found' using errcode = 'P0002';
  end if;

  insert into public.organization_members (organization_id, user_id, role)
  values (target, caller, 'volunteer')
  on conflict (organization_id, user_id) do nothing;

  select * into membership
  from public.organization_members
  where organization_id = target and user_id = caller;

  return membership;
end;
$$;

create or replace function public.leave_organization(target uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  member_role public.org_role;
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select role into member_role
  from public.organization_members
  where organization_id = target and user_id = caller;

  if member_role is null then
    return;
  end if;

  if member_role <> 'volunteer' then
    raise exception 'Coordinators and heads cannot leave their organization here; ask a platform admin'
      using errcode = '42501';
  end if;

  delete from public.organization_members
  where organization_id = target and user_id = caller and role = 'volunteer';
end;
$$;

create or replace function public.complete_onboarding()
returns timestamptz
language plpgsql
security definer set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  result timestamptz;
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  update public.profiles
  set onboarded_at = now()
  where id = caller and onboarded_at is null;

  select onboarded_at into result from public.profiles where id = caller;
  return result;
end;
$$;

revoke all on function public.join_organization(uuid) from public, anon;
revoke all on function public.leave_organization(uuid) from public, anon;
revoke all on function public.complete_onboarding() from public, anon;
grant execute on function public.join_organization(uuid) to authenticated;
grant execute on function public.leave_organization(uuid) to authenticated;
grant execute on function public.complete_onboarding() to authenticated;

-- Sign-up -------------------------------------------------------------------

-- Public sign-up always creates a volunteer. The role in sign-up metadata is
-- ignored; coordinators are promoted by a platform admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    'volunteer'::public.user_role,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates a volunteer profile at sign-up. Any role in sign-up metadata is ignored.';
comment on table public.organizations is 'Volunteer organizations. Created and managed by platform admins only.';
comment on table public.organization_members is 'Membership of users in organizations. Users join and leave through security definer functions.';
