-- Custom admin login for BPAD website.
--
-- Run after:
-- 1. database/rename-absen-tables.sql      (only if old absen tables already exist)
-- 2. database/supabase-combined-schema.sql
--
-- Security model:
-- - Admin uses custom username/password in web_users.
-- - Password is checked inside PostgreSQL, not in frontend JavaScript.
-- - Browser receives a temporary session token.
-- - Admin CRUD functions validate the token before writing data.

-- Supabase commonly keeps pgcrypto functions in the `extensions` schema.
-- This search path lets gen_salt(), crypt(), digest(), and gen_random_bytes()
-- work both during function creation and during function execution.
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
set search_path = public, extensions;

create table if not exists public.web_admin_sessions (
  id bigserial primary key,
  user_id bigint not null references public.web_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_web_admin_sessions_user_id
on public.web_admin_sessions(user_id);

create index if not exists idx_web_admin_sessions_expires_at
on public.web_admin_sessions(expires_at);

alter table public.web_admin_sessions enable row level security;

revoke all on public.web_admin_sessions from anon;
revoke all on public.web_admin_sessions from authenticated;

-- Keep direct table writes closed for the custom-login admin flow.
-- Admin pages should write through the RPC functions below.
revoke insert, update, delete on public.web_users from authenticated;
revoke insert, update, delete on public.web_posts from authenticated;
revoke insert, update, delete on public.web_media from authenticated;
revoke insert, update, delete on public.web_settings from authenticated;

drop policy if exists web_users_authenticated_all on public.web_users;
drop policy if exists web_posts_authenticated_write on public.web_posts;
drop policy if exists web_media_authenticated_write on public.web_media;
drop policy if exists web_settings_authenticated_write on public.web_settings;

drop function if exists public.web_hash_password(text);

create function public.web_hash_password(p_password text)
returns text
language sql
security definer
set search_path = public, extensions
as $$
  select crypt(p_password, gen_salt('bf'));
$$;

revoke all on function public.web_hash_password(text) from public;
revoke all on function public.web_hash_password(text) from anon;
revoke all on function public.web_hash_password(text) from authenticated;

drop function if exists public.web_admin_session_user_id(text);

create function public.web_admin_session_user_id(p_token text)
returns bigint
language sql
security definer
set search_path = public, extensions
as $$
  select s.user_id
  from public.web_admin_sessions s
  join public.web_users u on u.id = s.user_id
  where s.token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex')
    and s.expires_at > now()
    and u.is_active = true
  limit 1;
$$;

revoke all on function public.web_admin_session_user_id(text) from public;
revoke all on function public.web_admin_session_user_id(text) from anon;
revoke all on function public.web_admin_session_user_id(text) from authenticated;

drop function if exists public.web_admin_login(text, text);

create function public.web_admin_login(p_username text, p_password text)
returns table (
  success boolean,
  token text,
  user_id bigint,
  name text,
  message text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user public.web_users%rowtype;
  v_token text;
begin
  select *
  into v_user
  from public.web_users
  where public.web_users.username = lower(trim(p_username))
    and public.web_users.is_active = true
  limit 1;

  if not found then
    return query select false, null::text, null::bigint, null::text, 'Username atau password salah'::text;
    return;
  end if;

  if v_user.password_hash is null or crypt(p_password, v_user.password_hash) <> v_user.password_hash then
    return query select false, null::text, null::bigint, null::text, 'Username atau password salah'::text;
    return;
  end if;

  delete from public.web_admin_sessions
  where public.web_admin_sessions.user_id = v_user.id
     or public.web_admin_sessions.expires_at < now();

  v_token := encode(gen_random_bytes(32), 'hex');

  insert into public.web_admin_sessions (user_id, token_hash, expires_at)
  values (v_user.id, encode(digest(v_token, 'sha256'), 'hex'), now() + interval '8 hours');

  update public.web_users
  set last_login_at = now(),
      updated_at = now()
  where public.web_users.id = v_user.id;

  return query select true, v_token, v_user.id, v_user.name::text, 'Login berhasil'::text;
end;
$$;

revoke all on function public.web_admin_login(text, text) from public;
grant execute on function public.web_admin_login(text, text) to anon;

drop function if exists public.web_admin_me(text);

create function public.web_admin_me(p_token text)
returns table (
  success boolean,
  user_id bigint,
  username text,
  name text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  delete from public.web_admin_sessions
  where public.web_admin_sessions.expires_at < now();

  return query
  select true, u.id, u.username::text, u.name::text, s.expires_at
  from public.web_admin_sessions s
  join public.web_users u on u.id = s.user_id
  where s.token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex')
    and s.expires_at > now()
    and u.is_active = true
  limit 1;

  if not found then
    return query select false, null::bigint, null::text, null::text, null::timestamptz;
  end if;
end;
$$;

revoke all on function public.web_admin_me(text) from public;
grant execute on function public.web_admin_me(text) to anon;

drop function if exists public.web_admin_logout(text);

create function public.web_admin_logout(p_token text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  delete from public.web_admin_sessions
  where public.web_admin_sessions.token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex');

  return true;
end;
$$;

revoke all on function public.web_admin_logout(text) from public;
grant execute on function public.web_admin_logout(text) to anon;

drop function if exists public.web_admin_list_posts(text, text);

create function public.web_admin_list_posts(p_token text, p_type text default null)
returns table (
  id bigint,
  post_type text,
  title text,
  slug text,
  summary text,
  content text,
  category text,
  cover_image text,
  status text,
  published_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if public.web_admin_session_user_id(p_token) is null then
    raise exception 'Sesi admin tidak valid atau sudah kedaluwarsa';
  end if;

  return query
  select p.id,
         p.type::text,
         p.title::text,
         p.slug::text,
         p.summary,
         p.content,
         p.category::text,
         p.cover_image,
         p.status::text,
         p.published_at,
         p.updated_at
  from public.web_posts p
  where p_type is null or p.type = p_type
  order by coalesce(p.published_at, p.created_at) desc, p.id desc;
end;
$$;

revoke all on function public.web_admin_list_posts(text, text) from public;
grant execute on function public.web_admin_list_posts(text, text) to anon;

drop function if exists public.web_admin_save_post(text, bigint, text, text, text, text, text, text, text, text, timestamptz);

create function public.web_admin_save_post(
  p_token text,
  p_id bigint,
  p_type text,
  p_title text,
  p_slug text,
  p_summary text,
  p_content text,
  p_category text,
  p_cover_image text,
  p_status text,
  p_published_at timestamptz
)
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id bigint;
  v_id bigint;
  v_slug text;
begin
  v_user_id := public.web_admin_session_user_id(p_token);

  if v_user_id is null then
    raise exception 'Sesi admin tidak valid atau sudah kedaluwarsa';
  end if;

  if p_type not in ('berita', 'pengumuman', 'agenda') then
    raise exception 'Tipe konten tidak valid';
  end if;

  if nullif(trim(p_title), '') is null then
    raise exception 'Judul wajib diisi';
  end if;

  v_slug := lower(trim(coalesce(p_slug, '')));
  if v_slug = '' then
    v_slug := lower(regexp_replace(trim(p_title), '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := trim(both '-' from v_slug);
  end if;

  if v_slug = '' then
    v_slug := 'post-' || extract(epoch from now())::bigint::text;
  end if;

  if p_id is null then
    insert into public.web_posts (
      type,
      title,
      slug,
      summary,
      content,
      category,
      cover_image,
      status,
      published_at,
      created_by
    )
    values (
      p_type,
      trim(p_title),
      v_slug,
      nullif(trim(coalesce(p_summary, '')), ''),
      nullif(trim(coalesce(p_content, '')), ''),
      nullif(trim(coalesce(p_category, '')), ''),
      nullif(trim(coalesce(p_cover_image, '')), ''),
      'published',
      p_published_at,
      v_user_id
    )
    returning public.web_posts.id into v_id;
  else
    update public.web_posts
    set type = p_type,
        title = trim(p_title),
        slug = v_slug,
        summary = nullif(trim(coalesce(p_summary, '')), ''),
        content = nullif(trim(coalesce(p_content, '')), ''),
        category = nullif(trim(coalesce(p_category, '')), ''),
        cover_image = nullif(trim(coalesce(p_cover_image, '')), ''),
        status = 'published',
        published_at = p_published_at,
        updated_at = now()
    where public.web_posts.id = p_id;

    if not found then
      raise exception 'Konten tidak ditemukan';
    end if;

    v_id := p_id;
  end if;

  return v_id;
end;
$$;

revoke all on function public.web_admin_save_post(text, bigint, text, text, text, text, text, text, text, text, timestamptz) from public;
grant execute on function public.web_admin_save_post(text, bigint, text, text, text, text, text, text, text, text, timestamptz) to anon;

drop function if exists public.web_admin_delete_post(text, bigint);

create function public.web_admin_delete_post(p_token text, p_id bigint)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if public.web_admin_session_user_id(p_token) is null then
    raise exception 'Sesi admin tidak valid atau sudah kedaluwarsa';
  end if;

  delete from public.web_posts
  where public.web_posts.id = p_id;

  return found;
end;
$$;

revoke all on function public.web_admin_delete_post(text, bigint) from public;
grant execute on function public.web_admin_delete_post(text, bigint) to anon;
