-- Role hierarchy and protected administrator operations.
create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
$$;

create or replace function public.is_coordinator(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role in ('coordinator', 'admin')
  );
$$;

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  full_name text,
  avatar_url text,
  city text,
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
  select p.id, u.email::text, p.full_name, p.avatar_url, p.city, p.role, p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  order by p.created_at desc;
end;
$$;

create or replace function public.admin_set_user_role(
  target_user_id uuid,
  new_role public.user_role
)
returns public.user_role
language plpgsql
security definer set search_path = ''
as $$
declare
  current_role public.user_role;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  if new_role not in ('volunteer', 'coordinator') then
    raise exception 'Administrators can only assign volunteer or coordinator roles' using errcode = '22023';
  end if;

  select role into current_role
  from public.profiles
  where id = target_user_id;

  if current_role is null then
    raise exception 'User not found' using errcode = 'P0002';
  end if;

  if current_role = 'admin' then
    raise exception 'Administrator role cannot be changed here' using errcode = '42501';
  end if;

  update public.profiles
  set role = new_role, updated_at = now()
  where id = target_user_id;

  return new_role;
end;
$$;

revoke all on function public.admin_list_users() from public, anon;
revoke all on function public.admin_set_user_role(uuid, public.user_role) from public, anon;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_set_user_role(uuid, public.user_role) to authenticated;

-- Bootstrap the first administrator. Public registration still always creates
-- volunteer profiles through public.handle_new_user().
update public.profiles p
set role = 'admin', updated_at = now()
from auth.users u
where p.id = u.id
  and lower(u.email) = 'okok0000m@gmail.com';

do $$
begin
  if not exists (
    select 1
    from public.profiles p
    join auth.users u on u.id = p.id
    where lower(u.email) = 'okok0000m@gmail.com'
      and p.role = 'admin'
  ) then
    raise exception 'Bootstrap administrator profile was not found';
  end if;
end;
$$;
