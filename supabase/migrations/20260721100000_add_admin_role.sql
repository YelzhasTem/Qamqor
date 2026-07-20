-- Administrator is a privileged role that also inherits coordinator access.
alter type public.user_role add value if not exists 'admin';
