-- New users may register as volunteers or coordinators. Administrator access
-- is never accepted from public signup metadata.
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

  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    requested_role,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates a volunteer or coordinator profile at signup; all other requested roles fall back to volunteer.';
