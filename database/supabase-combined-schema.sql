-- Combined Supabase schema for BPAD projects.
-- Naming rule:
-- - absen_* = attendance app tables
-- - web_*   = BPAD public website tables
--
-- Run this in Supabase SQL Editor or DBeaver after connecting to the
-- same Supabase PostgreSQL database.
--
-- This version intentionally avoids trigger functions/dollar-quoted blocks
-- so it is easier to paste and run in Supabase SQL Editor.

-- =========================================================
-- ABSEN APP TABLES
-- =========================================================

create table if not exists public.absen_attendance_records (
  date date not null,
  scope text not null,
  admin text not null default '',
  attendance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (date, scope)
);

create table if not exists public.absen_daily_reports (
  date date not null,
  scope text not null,
  admin text not null default '',
  summary jsonb not null default '{}'::jsonb,
  rows jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  saved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (date, scope)
);

create table if not exists public.absen_system_heartbeat (
  id text primary key,
  source text not null default 'github-actions',
  last_seen timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.absen_attendance_records enable row level security;
alter table public.absen_daily_reports enable row level security;
alter table public.absen_system_heartbeat enable row level security;

revoke all on public.absen_attendance_records from anon;
revoke all on public.absen_daily_reports from anon;
revoke all on public.absen_system_heartbeat from anon;
revoke all on public.absen_system_heartbeat from authenticated;

grant select, insert, update, delete on public.absen_attendance_records to authenticated;
grant select, insert, update, delete on public.absen_daily_reports to authenticated;
grant select, insert, update on public.absen_system_heartbeat to service_role;

drop policy if exists absen_system_heartbeat_anon_all on public.absen_system_heartbeat;
drop policy if exists absen_system_heartbeat_authenticated_all on public.absen_system_heartbeat;
drop policy if exists absen_system_heartbeat_select_authenticated on public.absen_system_heartbeat;
drop policy if exists absen_system_heartbeat_insert_authenticated on public.absen_system_heartbeat;
drop policy if exists absen_system_heartbeat_update_authenticated on public.absen_system_heartbeat;
drop policy if exists system_heartbeat_anon_all on public.absen_system_heartbeat;
drop policy if exists system_heartbeat_authenticated_all on public.absen_system_heartbeat;
drop policy if exists system_heartbeat_select_authenticated on public.absen_system_heartbeat;
drop policy if exists system_heartbeat_insert_authenticated on public.absen_system_heartbeat;
drop policy if exists system_heartbeat_update_authenticated on public.absen_system_heartbeat;

drop policy if exists absen_attendance_records_select_authenticated on public.absen_attendance_records;
drop policy if exists absen_attendance_records_insert_authenticated on public.absen_attendance_records;
drop policy if exists absen_attendance_records_update_authenticated on public.absen_attendance_records;
drop policy if exists absen_attendance_records_delete_authenticated on public.absen_attendance_records;
drop policy if exists attendance_records_anon_all on public.absen_attendance_records;
drop policy if exists attendance_records_authenticated_all on public.absen_attendance_records;
drop policy if exists attendance_records_select_authenticated on public.absen_attendance_records;
drop policy if exists attendance_records_insert_authenticated on public.absen_attendance_records;
drop policy if exists attendance_records_update_authenticated on public.absen_attendance_records;
drop policy if exists attendance_records_delete_authenticated on public.absen_attendance_records;

create policy absen_attendance_records_select_authenticated
on public.absen_attendance_records
for select
to authenticated
using (true);

create policy absen_attendance_records_insert_authenticated
on public.absen_attendance_records
for insert
to authenticated
with check (true);

create policy absen_attendance_records_update_authenticated
on public.absen_attendance_records
for update
to authenticated
using (true)
with check (true);

create policy absen_attendance_records_delete_authenticated
on public.absen_attendance_records
for delete
to authenticated
using (true);

drop policy if exists absen_daily_reports_select_authenticated on public.absen_daily_reports;
drop policy if exists absen_daily_reports_insert_authenticated on public.absen_daily_reports;
drop policy if exists absen_daily_reports_update_authenticated on public.absen_daily_reports;
drop policy if exists absen_daily_reports_delete_authenticated on public.absen_daily_reports;
drop policy if exists daily_reports_anon_all on public.absen_daily_reports;
drop policy if exists daily_reports_authenticated_all on public.absen_daily_reports;
drop policy if exists daily_reports_select_authenticated on public.absen_daily_reports;
drop policy if exists daily_reports_insert_authenticated on public.absen_daily_reports;
drop policy if exists daily_reports_update_authenticated on public.absen_daily_reports;
drop policy if exists daily_reports_delete_authenticated on public.absen_daily_reports;

create policy absen_daily_reports_select_authenticated
on public.absen_daily_reports
for select
to authenticated
using (true);

create policy absen_daily_reports_insert_authenticated
on public.absen_daily_reports
for insert
to authenticated
with check (true);

create policy absen_daily_reports_update_authenticated
on public.absen_daily_reports
for update
to authenticated
using (true)
with check (true);

create policy absen_daily_reports_delete_authenticated
on public.absen_daily_reports
for delete
to authenticated
using (true);

-- =========================================================
-- BPAD WEBSITE TABLES
-- =========================================================

create table if not exists public.web_users (
  id bigserial primary key,
  username varchar(50) not null unique,
  password_hash text not null,
  name varchar(120) not null,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.web_posts (
  id bigserial primary key,
  type varchar(30) not null,
  title varchar(200) not null,
  slug varchar(220) not null unique,
  summary text,
  content text,
  category varchar(80),
  cover_image text,
  status varchar(30) not null default 'published',
  published_at timestamptz,
  created_by bigint references public.web_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint web_posts_type_check check (type in ('berita', 'pengumuman', 'agenda')),
  constraint web_posts_status_check check (status = 'published')
);

create table if not exists public.web_media (
  id bigserial primary key,
  file_name varchar(255) not null,
  file_url text not null,
  file_type varchar(80),
  alt_text varchar(255),
  caption text,
  source varchar(80),
  is_public boolean not null default true,
  created_by bigint references public.web_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.web_settings (
  id bigserial primary key,
  key varchar(120) not null unique,
  value text,
  group_name varchar(80),
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists idx_web_posts_type on public.web_posts(type);
create index if not exists idx_web_posts_status on public.web_posts(status);
create index if not exists idx_web_posts_published_at on public.web_posts(published_at);
create index if not exists idx_web_posts_type_status on public.web_posts(type, status);
create index if not exists idx_web_media_source on public.web_media(source);
create index if not exists idx_web_settings_group_name on public.web_settings(group_name);

alter table public.web_users enable row level security;
alter table public.web_posts enable row level security;
alter table public.web_media enable row level security;
alter table public.web_settings enable row level security;

revoke all on public.web_users from anon;
revoke all on public.web_posts from anon;
revoke all on public.web_media from anon;
revoke all on public.web_settings from anon;

grant select on public.web_posts to anon, authenticated;
grant select on public.web_media to anon, authenticated;
grant select on public.web_settings to anon, authenticated;
grant select, insert, update, delete on public.web_users to authenticated;
grant insert, update, delete on public.web_posts to authenticated;
grant insert, update, delete on public.web_media to authenticated;
grant insert, update, delete on public.web_settings to authenticated;

drop policy if exists web_posts_public_read on public.web_posts;
drop policy if exists web_posts_authenticated_read on public.web_posts;
drop policy if exists web_posts_authenticated_write on public.web_posts;

create policy web_posts_public_read
on public.web_posts
for select
to anon
using (status = 'published');

create policy web_posts_authenticated_read
on public.web_posts
for select
to authenticated
using (true);

create policy web_posts_authenticated_write
on public.web_posts
for all
to authenticated
using (true)
with check (true);

drop policy if exists web_media_public_read on public.web_media;
drop policy if exists web_media_authenticated_read on public.web_media;
drop policy if exists web_media_authenticated_write on public.web_media;

create policy web_media_public_read
on public.web_media
for select
to anon
using (is_public = true);

create policy web_media_authenticated_read
on public.web_media
for select
to authenticated
using (true);

create policy web_media_authenticated_write
on public.web_media
for all
to authenticated
using (true)
with check (true);

drop policy if exists web_settings_public_read on public.web_settings;
drop policy if exists web_settings_authenticated_read on public.web_settings;
drop policy if exists web_settings_authenticated_write on public.web_settings;

create policy web_settings_public_read
on public.web_settings
for select
to anon
using (is_public = true);

create policy web_settings_authenticated_read
on public.web_settings
for select
to authenticated
using (true);

create policy web_settings_authenticated_write
on public.web_settings
for all
to authenticated
using (true)
with check (true);

drop policy if exists web_users_authenticated_all on public.web_users;

create policy web_users_authenticated_all
on public.web_users
for all
to authenticated
using (true)
with check (true);
