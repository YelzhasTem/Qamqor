-- WhatsApp invite links are private project data. They are visible only to
-- the project owner and volunteers with a current application.

create table public.project_whatsapp_groups (
  project_id uuid primary key references public.projects(id) on delete cascade,
  whatsapp_group_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_whatsapp_groups_url_format check (
    whatsapp_group_url ~ '^https://chat\.whatsapp\.com/[A-Za-z0-9_-]+([?].*)?$'
  )
);

create trigger project_whatsapp_groups_set_updated_at
before update on public.project_whatsapp_groups
for each row execute function public.set_updated_at();

create or replace function public.has_current_project_application(
  target_project_id uuid
)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.project_applications
    where project_id = target_project_id
      and volunteer_id = auth.uid()
      and status in ('pending', 'approved', 'attended', 'completed')
  );
$$;

revoke all on function public.has_current_project_application(uuid) from public, anon;
grant execute on function public.has_current_project_application(uuid) to authenticated;

revoke all on table public.project_whatsapp_groups from anon;
grant select, insert, update, delete on table public.project_whatsapp_groups to authenticated;

alter table public.project_whatsapp_groups enable row level security;

create policy "project_whatsapp_groups_read_allowed"
on public.project_whatsapp_groups
for select
to authenticated
using (
  public.owns_project(project_id, auth.uid())
  or public.has_current_project_application(project_id)
);

create policy "project_whatsapp_groups_create_own"
on public.project_whatsapp_groups
for insert
to authenticated
with check (public.owns_project(project_id, auth.uid()));

create policy "project_whatsapp_groups_update_own"
on public.project_whatsapp_groups
for update
to authenticated
using (public.owns_project(project_id, auth.uid()))
with check (public.owns_project(project_id, auth.uid()));

create policy "project_whatsapp_groups_delete_own"
on public.project_whatsapp_groups
for delete
to authenticated
using (public.owns_project(project_id, auth.uid()));

-- New projects start as drafts. Publishing is allowed only after the private
-- WhatsApp group row has been created.
drop policy if exists "coordinators_create_projects" on public.projects;
create policy "coordinators_create_projects"
on public.projects
for insert
to authenticated
with check (
  coordinator_id = auth.uid()
  and public.is_coordinator(auth.uid())
  and status = 'draft'
);

create or replace function public.ensure_project_has_whatsapp_group()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.status = 'published'
    and old.status is distinct from new.status
    and not exists (
      select 1
      from public.project_whatsapp_groups
      where project_id = new.id
    )
  then
    raise exception 'A WhatsApp group link is required before publishing';
  end if;
  return new;
end;
$$;

create trigger projects_require_whatsapp_before_publish
before update of status on public.projects
for each row execute function public.ensure_project_has_whatsapp_group();
