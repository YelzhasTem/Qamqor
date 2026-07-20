-- Coordinators and administrators can create their own projects again.
-- Project benefits are stored as a constrained list of known values so the
-- creation form stays consistent and cannot receive arbitrary labels.

alter table public.projects
add column if not exists benefits text[] not null default '{}'::text[];

update public.projects
set benefits = array['volunteer_hours']::text[]
where volunteer_hours > 0
  and cardinality(benefits) = 0;

alter table public.projects
drop constraint if exists projects_benefits_allowed;

alter table public.projects
add constraint projects_benefits_allowed check (
  benefits <@ array[
    'thank_you_letter',
    'volunteer_hours',
    'meals',
    'transport',
    'merch',
    'recommendation_letter'
  ]::text[]
);
alter table public.projects
drop constraint if exists projects_benefit_hours_consistent;

alter table public.projects
add constraint projects_benefit_hours_consistent check (
  (
    'volunteer_hours' = any(benefits)
    and volunteer_hours > 0
  )
  or (
    not ('volunteer_hours' = any(benefits))
    and volunteer_hours = 0
  )
);

drop policy if exists "coordinators_create_projects" on public.projects;
create policy "coordinators_create_projects"
on public.projects
for insert
to authenticated
with check (
  coordinator_id = auth.uid()
  and public.is_coordinator(auth.uid())
);
