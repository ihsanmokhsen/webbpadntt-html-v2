-- Reset BPAD website admin password.
--
-- Use this if admin.html says "Username atau password salah".
-- Change the username and password below, then run in Supabase SQL Editor
-- or DBeaver.

update public.web_users
set password_hash = public.web_hash_password('GANTI_PASSWORD_BARU_YANG_KUAT'),
    is_active = true,
    updated_at = now()
where username = lower('admin');

-- Check the admin row after reset.
select
  id,
  username,
  name,
  is_active,
  left(password_hash, 4) as hash_prefix,
  length(password_hash) as hash_length,
  updated_at
from public.web_users
where username = lower('admin');
