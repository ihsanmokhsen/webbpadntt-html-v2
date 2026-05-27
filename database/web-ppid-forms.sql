-- PPID public forms and document metadata for BPAD website.
-- Run after database/supabase-combined-schema.sql.

set search_path = public, extensions;

create table if not exists public.web_ppid_requests (
  id bigserial primary key,
  reference_no text not null unique,
  full_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  requested_information text not null,
  usage_purpose text not null,
  status text not null default 'received',
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint web_ppid_requests_status_check check (status in ('received', 'verified', 'processing', 'completed', 'rejected'))
);

create table if not exists public.web_ppid_objections (
  id bigserial primary key,
  reference_no text not null unique,
  request_number text not null,
  reason text not null,
  chronology text not null,
  status text not null default 'received',
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint web_ppid_objections_status_check check (status in ('received', 'verified', 'processing', 'completed', 'rejected'))
);

create table if not exists public.web_ppid_documents (
  id bigserial primary key,
  title text not null,
  category text not null,
  document_year integer not null,
  file_format text not null default 'PDF',
  file_size text,
  description text,
  drive_url text,
  preview_url text,
  source text not null default 'google_drive',
  is_public boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint web_ppid_documents_unique_title_year unique (title, document_year),
  constraint web_ppid_documents_category_check check (category in ('Berkala', 'Setiap Saat', 'Serta Merta', 'Dikecualikan', 'DIP', 'SOP')),
  constraint web_ppid_documents_source_check check (source in ('google_drive', 'supabase'))
);

create index if not exists idx_web_ppid_requests_status on public.web_ppid_requests(status);
create index if not exists idx_web_ppid_requests_created_at on public.web_ppid_requests(created_at);
create index if not exists idx_web_ppid_objections_status on public.web_ppid_objections(status);
create index if not exists idx_web_ppid_objections_created_at on public.web_ppid_objections(created_at);
create index if not exists idx_web_ppid_documents_public on public.web_ppid_documents(is_public);
create index if not exists idx_web_ppid_documents_category_year on public.web_ppid_documents(category, document_year);

alter table public.web_ppid_requests enable row level security;
alter table public.web_ppid_objections enable row level security;
alter table public.web_ppid_documents enable row level security;

revoke all on public.web_ppid_requests from anon;
revoke all on public.web_ppid_objections from anon;
revoke all on public.web_ppid_documents from anon;

grant select on public.web_ppid_documents to anon, authenticated;

drop policy if exists web_ppid_documents_public_read on public.web_ppid_documents;
create policy web_ppid_documents_public_read
on public.web_ppid_documents
for select
to anon, authenticated
using (is_public = true);

drop function if exists public.web_ppid_next_reference(text);
create function public.web_ppid_next_reference(p_prefix text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return upper(coalesce(nullif(trim(p_prefix), ''), 'PPID'))
    || '/BPAD/'
    || to_char(now(), 'YYYYMMDD')
    || '/'
    || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8));
end;
$$;

revoke all on function public.web_ppid_next_reference(text) from public;
revoke all on function public.web_ppid_next_reference(text) from anon;
revoke all on function public.web_ppid_next_reference(text) from authenticated;

drop function if exists public.web_ppid_submit_request(text, text, text, text, text, text);
create function public.web_ppid_submit_request(
  p_full_name text,
  p_email text,
  p_phone text,
  p_address text,
  p_requested_information text,
  p_usage_purpose text
)
returns table (
  success boolean,
  reference_no text,
  message text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_reference_no text;
begin
  if nullif(trim(coalesce(p_full_name, '')), '') is null then
    raise exception 'Nama wajib diisi';
  end if;

  if nullif(trim(coalesce(p_email, '')), '') is null
     or trim(p_email) !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Email tidak valid';
  end if;

  if nullif(trim(coalesce(p_phone, '')), '') is null then
    raise exception 'Nomor HP wajib diisi';
  end if;

  if nullif(trim(coalesce(p_address, '')), '') is null then
    raise exception 'Alamat wajib diisi';
  end if;

  if nullif(trim(coalesce(p_requested_information, '')), '') is null then
    raise exception 'Informasi yang diminta wajib diisi';
  end if;

  if nullif(trim(coalesce(p_usage_purpose, '')), '') is null then
    raise exception 'Tujuan penggunaan informasi wajib diisi';
  end if;

  v_reference_no := public.web_ppid_next_reference('PPID');

  insert into public.web_ppid_requests (
    reference_no,
    full_name,
    email,
    phone,
    address,
    requested_information,
    usage_purpose
  )
  values (
    v_reference_no,
    trim(p_full_name),
    lower(trim(p_email)),
    trim(p_phone),
    trim(p_address),
    trim(p_requested_information),
    trim(p_usage_purpose)
  );

  return query select true, v_reference_no, 'Permohonan informasi berhasil dikirim'::text;
end;
$$;

revoke all on function public.web_ppid_submit_request(text, text, text, text, text, text) from public;
grant execute on function public.web_ppid_submit_request(text, text, text, text, text, text) to anon;

drop function if exists public.web_ppid_submit_objection(text, text, text);
create function public.web_ppid_submit_objection(
  p_request_number text,
  p_reason text,
  p_chronology text
)
returns table (
  success boolean,
  reference_no text,
  message text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_reference_no text;
begin
  if nullif(trim(coalesce(p_request_number, '')), '') is null then
    raise exception 'Nomor permohonan wajib diisi';
  end if;

  if nullif(trim(coalesce(p_reason, '')), '') is null then
    raise exception 'Alasan keberatan wajib diisi';
  end if;

  if nullif(trim(coalesce(p_chronology, '')), '') is null then
    raise exception 'Kronologi wajib diisi';
  end if;

  v_reference_no := public.web_ppid_next_reference('KBR');

  insert into public.web_ppid_objections (
    reference_no,
    request_number,
    reason,
    chronology
  )
  values (
    v_reference_no,
    trim(p_request_number),
    trim(p_reason),
    trim(p_chronology)
  );

  return query select true, v_reference_no, 'Pengajuan keberatan berhasil dikirim'::text;
end;
$$;

revoke all on function public.web_ppid_submit_objection(text, text, text) from public;
grant execute on function public.web_ppid_submit_objection(text, text, text) to anon;

insert into public.web_ppid_documents (
  title,
  category,
  document_year,
  file_format,
  file_size,
  description,
  drive_url,
  preview_url,
  source,
  is_public,
  published_at
)
values
  ('Laporan Realisasi Anggaran 2025', 'Berkala', 2025, 'PDF', '2.4 MB', 'Ringkasan realisasi anggaran BPAD NTT untuk kebutuhan informasi berkala.', null, null, 'supabase', true, '2026-01-18 08:00:00+08'::timestamptz),
  ('DIP BPAD 2025', 'DIP', 2025, 'PDF', '1.1 MB', 'Daftar Informasi Publik BPAD NTT tahun 2025.', null, null, 'google_drive', true, '2025-12-30 08:00:00+08'::timestamptz),
  ('SOP Permohonan Informasi', 'SOP', 2026, 'PDF', '860 KB', 'Standar operasional pelayanan permohonan informasi publik.', null, null, 'google_drive', true, '2026-02-04 08:00:00+08'::timestamptz),
  ('Maklumat Pelayanan', 'Serta Merta', 2026, 'PDF', '540 KB', 'Maklumat pelayanan informasi publik BPAD NTT untuk masyarakat.', null, null, 'supabase', true, '2026-03-12 08:00:00+08'::timestamptz)
on conflict (title, document_year) do update
set category = excluded.category,
    file_format = excluded.file_format,
    file_size = excluded.file_size,
    description = excluded.description,
    drive_url = excluded.drive_url,
    preview_url = excluded.preview_url,
    source = excluded.source,
    is_public = excluded.is_public,
    published_at = excluded.published_at,
    updated_at = now();
