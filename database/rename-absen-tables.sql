-- Optional one-time migration for an existing attendance database.
-- Use this only if the database already has the old table names.
--
-- Run order:
-- 1. Run this file.
-- 2. Run database/supabase-combined-schema.sql.
-- 3. Deploy the updated attendance app code that uses absen_* table names.

do $$
begin
  if to_regclass('public.attendance_records') is not null
     and to_regclass('public.absen_attendance_records') is null then
    alter table public.attendance_records rename to absen_attendance_records;
  end if;

  if to_regclass('public.daily_reports') is not null
     and to_regclass('public.absen_daily_reports') is null then
    alter table public.daily_reports rename to absen_daily_reports;
  end if;

  if to_regclass('public.system_heartbeat') is not null
     and to_regclass('public.absen_system_heartbeat') is null then
    alter table public.system_heartbeat rename to absen_system_heartbeat;
  end if;
end;
$$;
