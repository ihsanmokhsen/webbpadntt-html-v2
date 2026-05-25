-- Optional migration: make every website post immediately public.
--
-- Run this if you no longer want draft/archived status in web_posts.
-- The admin dashboard already saves everything as published by default.

update public.web_posts
set status = 'published',
    updated_at = now()
where status <> 'published';

alter table public.web_posts
alter column status set default 'published';

alter table public.web_posts
drop constraint if exists web_posts_status_check;

alter table public.web_posts
add constraint web_posts_status_check
check (status = 'published');
