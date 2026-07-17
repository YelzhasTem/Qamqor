create view public.public_volunteer_projects
with (security_invoker = false, security_barrier = true)
as
select
  pa.volunteer_id,
  p.id as project_id,
  p.title,
  p.cover_url,
  p.category,
  p.city,
  p.start_date,
  p.end_date,
  coalesce(vh.hours, p.volunteer_hours)::numeric(8, 2) as hours
from public.project_applications pa
join public.projects p on p.id = pa.project_id
left join public.volunteer_hours vh
  on vh.project_id = p.id
  and vh.volunteer_id = pa.volunteer_id
  and vh.status = 'confirmed'
where pa.status = 'completed'
  and p.status = 'completed';

grant select on public.public_volunteer_projects to anon, authenticated;
comment on view public.public_volunteer_projects is 'Completed projects shown on public volunteer profiles.';
