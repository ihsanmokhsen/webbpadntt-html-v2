-- Admin RPC functions for public.web_settings.
-- Run after database/web-custom-auth.sql.

set search_path = public, extensions;

drop function if exists public.web_admin_list_settings(text);

create function public.web_admin_list_settings(p_token text)
returns table (
  id bigint,
  setting_key text,
  value text,
  group_name text,
  is_public boolean,
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
  select s.id,
         s.key::text,
         s.value,
         s.group_name::text,
         s.is_public,
         s.updated_at
  from public.web_settings s
  order by coalesce(s.group_name, 'zzzz'), s.key;
end;
$$;

revoke all on function public.web_admin_list_settings(text) from public;
grant execute on function public.web_admin_list_settings(text) to anon;

drop function if exists public.web_admin_save_setting(text, text, text, text, boolean);

create function public.web_admin_save_setting(
  p_token text,
  p_key text,
  p_value text,
  p_group_name text,
  p_is_public boolean
)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_key text;
begin
  if public.web_admin_session_user_id(p_token) is null then
    raise exception 'Sesi admin tidak valid atau sudah kedaluwarsa';
  end if;

  v_key := trim(coalesce(p_key, ''));

  if v_key = '' then
    raise exception 'Key setting wajib diisi';
  end if;

  insert into public.web_settings (
    key,
    value,
    group_name,
    is_public,
    updated_at
  )
  values (
    v_key,
    nullif(p_value, ''),
    nullif(trim(coalesce(p_group_name, '')), ''),
    coalesce(p_is_public, true),
    now()
  )
  on conflict (key) do update
  set value = excluded.value,
      group_name = excluded.group_name,
      is_public = excluded.is_public,
      updated_at = now();

  return v_key;
end;
$$;

revoke all on function public.web_admin_save_setting(text, text, text, text, boolean) from public;
grant execute on function public.web_admin_save_setting(text, text, text, text, boolean) to anon;
