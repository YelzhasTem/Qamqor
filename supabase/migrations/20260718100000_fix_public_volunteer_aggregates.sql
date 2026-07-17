create or replace view public.public_volunteer_profiles
with (security_invoker = false, security_barrier = true)
as
select
  p.id,
  p.full_name,
  p.avatar_url,
  p.city,
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

grant select on public.public_volunteer_profiles to anon, authenticated;
