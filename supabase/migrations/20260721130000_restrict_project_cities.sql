-- Project cities use the same controlled Kazakhstan city list as registration.
update public.projects
set city = case lower(trim(city))
  when 'almaty' then 'Алматы'
  when 'алматы' then 'Алматы'
  when 'astana' then 'Астана'
  when 'астана' then 'Астана'
  when 'shymkent' then 'Шымкент'
  when 'шымкент' then 'Шымкент'
  else city
end;

alter table public.projects
drop constraint if exists projects_city_allowed;

alter table public.projects
add constraint projects_city_allowed check (
  city = any(array['Алматы', 'Астана', 'Шымкент']::text[])
);
