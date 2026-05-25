-- Create or reset the first BPAD website admin user.
--
-- Steps:
-- 1. Run database/supabase-combined-schema.sql.
-- 2. Run database/web-custom-auth.sql.
-- 3. Change username, password, and name below.
-- 4. Run this SQL in Supabase SQL Editor or DBeaver.
--
-- Important:
-- - Do not use the example password in production.
-- - Use a long password with letters, numbers, and symbols.

insert into public.web_users (
  username,
  password_hash,
  name,
  is_active,
  updated_at
)
values (
  lower('admin'),
  public.web_hash_password('GANTI_PASSWORD_ADMIN_YANG_KUAT'),
  'Administrator BPAD',
  true,
  now()
)
on conflict (username) do update
set password_hash = excluded.password_hash,
    name = excluded.name,
    is_active = true,
    updated_at = now();
