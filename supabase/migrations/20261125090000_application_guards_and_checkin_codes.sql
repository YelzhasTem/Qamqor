-- Applications: always pending on insert, organization membership, check-in codes.
--
-- Error codes. Functions and triggers added from here on raise errors whose
-- message is a stable machine-readable code (snake_case) and whose SQLSTATE
-- is in the custom class QA. Clients map the message to translated text
-- (src/lib/errors.ts in the web app) and never show the raw error.
--
--   not_authenticated        QA401   no signed-in user
--   not_a_volunteer          QA403   profiles.role is not volunteer
--   project_not_open         QA409   not published, finished, or its organization is hidden
--   project_full             QA410   no free places
--   already_applied          QA411   an application for this project already exists
--   organization_not_active  QA412   the project's organization is hidden
--   not_a_member             QA413   the volunteer is not a member of the project's organization

-- a) Every inserted application starts as pending with no check-in code ------

-- Before this migration, the volunteers_apply insert policy and
-- validate_application() ignored the status column, so a volunteer could
-- insert a row with status approved straight through the API. The guard below
-- runs for every insert, whoever the caller is: status becomes pending and the
-- check-in code empty, whatever the client sends.

-- e) Check-in code: one per approved application ------------------------------

alter table public.project_applications
add column checkin_code text;

alter table public.project_applications
add constraint project_applications_checkin_code_key unique (checkin_code);

alter table public.project_applications
add constraint project_applications_checkin_code_format
check (checkin_code is null or checkin_code ~ '^[A-Za-z0-9_-]{24,}$');

comment on column public.project_applications.checkin_code is
  'Random URL-safe code (144 bits) shown as a QR code to the volunteer. Set by trigger on approval, kept for attended and completed, cleared otherwise. Never written by clients.';

-- 144 random bits from pgcrypto, base64url without padding (24 characters).
create or replace function public.new_checkin_code()
returns text
language sql
volatile
set search_path = ''
as $$
  select translate(encode(extensions.gen_random_bytes(18), 'base64'), '+/', '-_');
$$;

revoke all on function public.new_checkin_code() from public, anon, authenticated;

-- Existing approved applications get a code before the guard takes over.
update public.project_applications
set checkin_code = public.new_checkin_code()
where status = 'approved' and checkin_code is null;

create or replace function public.guard_application_row()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.checkin_code := null;
    return new;
  end if;

  -- Nobody writes the code directly, not even with the service role.
  new.checkin_code := old.checkin_code;

  if new.status = 'approved' then
    if new.checkin_code is null then
      new.checkin_code := public.new_checkin_code();
    end if;
  elsif new.status in ('attended', 'completed') then
    -- Kept as it was: a code exists only if the application was approved first.
    null;
  else
    -- pending or rejected
    new.checkin_code := null;
  end if;

  return new;
end;
$$;

revoke all on function public.guard_application_row() from public, anon, authenticated;

create trigger applications_guard_row
before insert or update on public.project_applications
for each row execute function public.guard_application_row();

-- Clients never write checkin_code, and never change who or what an
-- application is for. Volunteers insert (project_id, volunteer_id; status is
-- accepted but always forced to pending). Coordinators update the status only.
-- RLS policies stay exactly as they were.
revoke insert, update on table public.project_applications from anon, authenticated;
grant insert (project_id, volunteer_id, status) on table public.project_applications to authenticated;
grant update (status) on table public.project_applications to authenticated;

-- b) Membership rule ---------------------------------------------------------

-- When a project belongs to an organization, the organization must be active
-- and only its members can apply. Projects without an organization keep the
-- previous behaviour. The rule is checked when an application is created.
create or replace function public.validate_application()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  project_row public.projects;
begin
  if not exists (select 1 from public.profiles where id = new.volunteer_id and role = 'volunteer') then
    raise exception 'not_a_volunteer' using errcode = 'QA403', detail = 'Only volunteers can apply to projects';
  end if;

  select * into project_row from public.projects where id = new.project_id;
  if project_row.id is null or project_row.status <> 'published' or project_row.end_date < now() then
    raise exception 'project_not_open' using errcode = 'QA409', detail = 'Project is not accepting applications';
  end if;

  if project_row.organization_id is not null then
    if not exists (
      select 1 from public.organizations
      where id = project_row.organization_id and status = 'active'
    ) then
      raise exception 'organization_not_active' using errcode = 'QA412', detail = 'The project''s organization is not active';
    end if;

    if not exists (
      select 1 from public.organization_members
      where organization_id = project_row.organization_id and user_id = new.volunteer_id
    ) then
      raise exception 'not_a_member' using errcode = 'QA413', detail = 'Only members of the organization can apply';
    end if;
  end if;

  if not public.project_has_capacity(new.project_id) then
    raise exception 'project_full' using errcode = 'QA410', detail = 'Project has no available places';
  end if;
  return new;
end;
$$;
