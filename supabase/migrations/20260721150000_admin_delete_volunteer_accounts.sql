-- Administrators may permanently delete volunteer accounts. Coordinators and
-- other authenticated users cannot execute this operation.
create or replace function public.admin_delete_volunteer_user(target_user_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  target_role public.user_role;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  select role into target_role
  from public.profiles
  where id = target_user_id;

  if target_role is null then
    raise exception 'User not found' using errcode = 'P0002';
  end if;

  if target_role <> 'volunteer' then
    raise exception 'Only volunteer accounts can be deleted' using errcode = '42501';
  end if;

  delete from auth.users
  where id = target_user_id;

  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.admin_delete_volunteer_user(uuid) from public, anon;
grant execute on function public.admin_delete_volunteer_user(uuid) to authenticated;
