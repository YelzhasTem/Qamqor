-- New projects are intentionally disabled. Existing coordinators retain
-- update, delete, applicant management, and hour confirmation access.
drop policy if exists "coordinators_create_projects" on public.projects;

-- Public self-registration always creates a volunteer profile. Existing
-- coordinator profiles are not changed by this migration.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, role, full_name, city)
  values (
    new.id,
    'volunteer'::public.user_role,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    nullif(trim(new.raw_user_meta_data ->> 'city'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
