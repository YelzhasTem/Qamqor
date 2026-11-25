-- Volunteer app: apply in one step, leave an organization, read the feed.
-- Error codes are listed in 20261125090000_application_guards_and_checkin_codes.sql.

-- c) Apply to a project ------------------------------------------------------

-- Applying to a project of an organization the volunteer has not joined makes
-- them a member in the same transaction. The inserted row goes through the
-- usual triggers, so it is always pending and validated again.
create or replace function public.apply_to_project(target uuid)
returns public.project_applications
language plpgsql
security definer set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  project_row public.projects;
  application public.project_applications;
begin
  if caller is null then
    raise exception 'not_authenticated' using errcode = 'QA401';
  end if;

  if not exists (select 1 from public.profiles where id = caller and role = 'volunteer') then
    raise exception 'not_a_volunteer' using errcode = 'QA403';
  end if;

  select * into project_row from public.projects where id = target;
  if project_row.id is null
    or project_row.status <> 'published'
    or project_row.end_date < now()
    or (
      project_row.organization_id is not null
      and not exists (
        select 1 from public.organizations
        where id = project_row.organization_id and status = 'active'
      )
    )
  then
    raise exception 'project_not_open' using errcode = 'QA409';
  end if;

  if exists (
    select 1 from public.project_applications
    where project_id = target and volunteer_id = caller
  ) then
    raise exception 'already_applied' using errcode = 'QA411';
  end if;

  if not public.project_has_capacity(target) then
    raise exception 'project_full' using errcode = 'QA410';
  end if;

  if project_row.organization_id is not null then
    insert into public.organization_members (organization_id, user_id, role)
    values (project_row.organization_id, caller, 'volunteer')
    on conflict (organization_id, user_id) do nothing;
  end if;

  begin
    insert into public.project_applications (project_id, volunteer_id)
    values (target, caller)
    returning * into application;
  exception when unique_violation then
    raise exception 'already_applied' using errcode = 'QA411';
  end;

  return application;
end;
$$;

revoke all on function public.apply_to_project(uuid) from public, anon;
grant execute on function public.apply_to_project(uuid) to authenticated;

comment on function public.apply_to_project(uuid) is
  'Creates a pending application for the signed-in volunteer, joining the project''s organization first when needed.';

-- d) Leave an organization ---------------------------------------------------

-- Leaving also cancels the caller's pending and approved applications to the
-- organization's projects that have not ended, and returns how many were
-- cancelled. Attended and completed applications, and past ones, are kept.
-- The return type changes from void to integer, so the function is recreated.
drop function public.leave_organization(uuid);

create function public.leave_organization(target uuid)
returns integer
language plpgsql
security definer set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  member_role public.org_role;
  cancelled integer := 0;
begin
  if caller is null then
    raise exception 'not_authenticated' using errcode = 'QA401';
  end if;

  select role into member_role
  from public.organization_members
  where organization_id = target and user_id = caller;

  if member_role is null then
    return 0;
  end if;

  if member_role <> 'volunteer' then
    -- Same SQLSTATE as before (the organization picker relies on it).
    raise exception 'staff_cannot_leave' using errcode = '42501',
      detail = 'Coordinators and heads cannot leave their organization here; ask a platform admin';
  end if;

  delete from public.project_applications a
  using public.projects p
  where a.project_id = p.id
    and p.organization_id = target
    and p.end_date > now()
    and a.volunteer_id = caller
    and a.status in ('pending', 'approved');
  get diagnostics cancelled = row_count;

  delete from public.organization_members
  where organization_id = target and user_id = caller and role = 'volunteer';

  return cancelled;
end;
$$;

revoke all on function public.leave_organization(uuid) from public, anon;
grant execute on function public.leave_organization(uuid) to authenticated;

comment on function public.leave_organization(uuid) is
  'Removes the caller''s volunteer membership and cancels their upcoming pending and approved applications in that organization. Returns the number cancelled.';

-- f) Feed --------------------------------------------------------------------

-- Published projects that have not ended and belong to active organizations,
-- either those of the caller's organizations (scope 'mine') or all of them
-- (scope 'all'). Security invoker: every table is read under the caller's RLS,
-- so the application columns can only ever be the caller's own application.
-- Free places come from project_public_stats, which exposes counts only.
create or replace function public.volunteer_feed(
  scope text default 'mine',
  page_size integer default 20,
  page_offset integer default 0
)
returns table (
  project_id uuid,
  title text,
  category text,
  cover_url text,
  format public.project_format,
  city text,
  address text,
  start_date timestamptz,
  end_date timestamptz,
  capacity integer,
  available_places bigint,
  organization_id uuid,
  organization_name text,
  organization_logo_url text,
  application_id uuid,
  application_status public.application_status
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    p.id,
    p.title,
    p.category,
    p.cover_url,
    p.format,
    p.city,
    p.address,
    p.start_date,
    p.end_date,
    p.required_volunteers,
    coalesce(s.available_places, p.required_volunteers::bigint),
    o.id,
    o.name,
    o.logo_url,
    a.id,
    a.status
  from public.projects p
  join public.organizations o on o.id = p.organization_id and o.status = 'active'
  left join public.project_public_stats s on s.project_id = p.id
  left join public.project_applications a on a.project_id = p.id and a.volunteer_id = auth.uid()
  where p.status = 'published'
    and p.end_date > now()
    and (
      scope = 'all'
      or exists (
        select 1 from public.organization_members m
        where m.organization_id = p.organization_id and m.user_id = auth.uid()
      )
    )
  order by p.start_date, p.id
  limit least(greatest(coalesce(page_size, 20), 1), 100)
  offset greatest(coalesce(page_offset, 0), 0);
$$;

revoke all on function public.volunteer_feed(text, integer, integer) from public, anon;
grant execute on function public.volunteer_feed(text, integer, integer) to authenticated;

comment on function public.volunteer_feed(text, integer, integer) is
  'Volunteer feed: open projects of active organizations, the caller''s own (scope mine) or all (scope all), with free places and the caller''s own application status.';
