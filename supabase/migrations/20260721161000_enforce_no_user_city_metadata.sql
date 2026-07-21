-- Supabase Auth may write user metadata during a separate update. Strip city
-- metadata on every insert and metadata update, regardless of the API used.
create or replace function public.remove_user_city_metadata()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb) - 'city';
  return new;
end;
$$;

drop trigger if exists remove_user_city_metadata on auth.users;
create trigger remove_user_city_metadata
before insert or update of raw_user_meta_data on auth.users
for each row execute function public.remove_user_city_metadata();

update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) - 'city'
where coalesce(raw_user_meta_data, '{}'::jsonb) ? 'city';
