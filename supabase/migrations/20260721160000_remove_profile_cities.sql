-- A city belongs to a project, not to a user account.
-- Remove previously stored profile cities and stop accepting them at signup.
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

  if coalesce(new.raw_user_meta_data, '{}'::jsonb) ? 'city' then
    update auth.users
    set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) - 'city'
    where id = new.id;
  end if;

  return new;
end;
$$;

update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) - 'city'
where coalesce(raw_user_meta_data, '{}'::jsonb) ? 'city';

drop function public.admin_list_users();
drop view public.public_volunteer_profiles;
drop view public.public_profiles;

alter table public.profiles drop column city;

create view public.public_profiles
with (security_invoker = false, security_barrier = true)
as
select id, role, full_name, avatar_url, bio, created_at
from public.profiles;

create view public.public_volunteer_profiles
with (security_invoker = false, security_barrier = true)
as
select
  p.id,
  p.full_name,
  p.avatar_url,
  p.bio,
  p.created_at,
  coalesce((
    select sum(vh.hours)
    from public.volunteer_hours vh
    where vh.volunteer_id = p.id and vh.status = 'confirmed'
  ), 0)::numeric(10, 2) as confirmed_hours,
  coalesce((
    select count(distinct pa.project_id)
    from public.project_applications pa
    where pa.volunteer_id = p.id and pa.status = 'completed'
  ), 0)::bigint as completed_projects
from public.profiles p
where p.role = 'volunteer';

create function public.admin_list_users()
returns table (
  id uuid,
  email text,
  full_name text,
  avatar_url text,
  role public.user_role,
  created_at timestamptz
)
language plpgsql
stable
security definer set search_path = ''
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  return query
  select p.id, u.email::text, p.full_name, p.avatar_url, p.role, p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  order by p.created_at desc;
end;
$$;

revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url, phone, bio, updated_at) on public.profiles to authenticated;
grant select on public.public_profiles, public.public_volunteer_profiles to anon, authenticated;
revoke all on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;

comment on view public.public_profiles is 'Privacy-safe public profile fields; excludes email, phone and user location.';
comment on view public.public_volunteer_profiles is 'Public volunteer profiles without user location, including confirmed activity aggregates.';
