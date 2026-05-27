-- Seed public website settings for BPAD website.
--
-- This fills public.web_settings with values currently used by the static site.
-- Safe to run repeatedly because rows are upserted by unique key.
-- Run after database/supabase-combined-schema.sql.

begin;

insert into public.web_settings (key, value, group_name, is_public, updated_at)
values
  ('site.name', 'Badan Pendapatan dan Aset Daerah Provinsi Nusa Tenggara Timur', 'site', true, now()),
  ('site.short_name', 'BPAD NTT', 'site', true, now()),
  ('site.title', 'BPAD - Badan Pendapatan dan Aset Daerah Provinsi NTT', 'site', true, now()),
  ('site.tagline', 'Pelayanan publik terpadu untuk pendapatan dan aset daerah Provinsi Nusa Tenggara Timur.', 'site', true, now()),
  ('site.description', 'Website resmi BPAD NTT untuk informasi layanan, PPID, berita, pengumuman, agenda, dan akses aplikasi publik.', 'site', true, now()),
  ('site.copyright_year', '2026', 'site', true, now()),
  ('site.logo', 'assets/logo.png', 'site', true, now()),
  ('site.favicon', 'assets/logo.png', 'site', true, now()),
  ('site.footer_image', 'assets/footer.png', 'site', true, now()),
  ('site.hero_logo', 'assets/ayobangunntt.png', 'site', true, now()),

  ('office.address', 'Jl. El Tari No.52, Oebobo, Kec. Oebobo, Kota Kupang, Nusa Tenggara Timur 85111', 'office', true, now()),
  ('office.address_short', 'Jl. El Tari No.52, Oebobo, Kota Kupang', 'office', true, now()),
  ('office.city', 'Kota Kupang', 'office', true, now()),
  ('office.province', 'Nusa Tenggara Timur', 'office', true, now()),
  ('office.postal_code', '85111', 'office', true, now()),
  ('office.service_hours', 'Senin - Jumat, 07.30 - 15.30 WITA', 'office', true, now()),
  ('office.maps_embed_url', 'https://www.google.com/maps?q=Jl.%20El%20Tari%20No.52%2C%20Oebobo%2C%20Kec.%20Oebobo%2C%20Kota%20Kupang%2C%20Nusa%20Tenggara%20Timur%2085111&output=embed', 'office', true, now()),
  ('office.maps_link', 'https://www.google.com/maps/search/?api=1&query=Jl.%20El%20Tari%20No.52%2C%20Oebobo%2C%20Kec.%20Oebobo%2C%20Kota%20Kupang%2C%20Nusa%20Tenggara%20Timur%2085111', 'office', true, now()),

  ('pad.target_year', '2026', 'pad', true, now()),
  ('pad.target_value_text', 'Rp 2,8T', 'pad', true, now()),
  ('pad.target_label', 'Target PAD 2026', 'pad', true, now()),
  ('pad.today_label', 'PAD Hari Ini', 'pad', true, now()),
  ('pad.skm_score', '80%', 'pad', true, now()),
  ('pad.skm_year', '2025', 'pad', true, now()),
  ('pad.skm_note', 'Kepuasan Wajib Pajak berdasarkan Laporan SKM 2025', 'pad', true, now()),

  ('social.instagram_url', 'https://www.instagram.com/bpad_ntt/', 'social', true, now()),
  ('social.instagram_handle', '@bpad_ntt', 'social', true, now()),

  ('app.magang_hub.name', 'Magang Hub', 'apps', true, now()),
  ('app.magang_hub.url', 'https://magangbpad.netlify.app/', 'apps', true, now()),
  ('app.pro_ntt.name', 'Pro NTT', 'apps', true, now()),
  ('app.pro_ntt.url', 'https://play.google.com/store/apps/details?id=com.iwana.betantt&hl=id', 'apps', true, now()),
  ('app.kastau_tim_siber.name', 'Kastau Tim Siber', 'apps', true, now()),
  ('app.kastau_tim_siber.url', 'https://research.ihsanmokhsen.com/kastau-tim-siber-landing.html', 'apps', true, now()),

  ('form.kotak_saran_skm.name', 'Kotak Saran (SKM)', 'forms', true, now()),
  ('form.kotak_saran_skm.url', 'https://forms.gle/z5ru8iL955ekdrmK7', 'forms', true, now()),
  ('form.buku_tamu.name', 'Buku Tamu', 'forms', true, now()),
  ('form.buku_tamu.url', 'https://forms.gle/Us5L3Peh8N1L99iq7', 'forms', true, now()),
  ('form.ppid_request.name', 'Permohonan Informasi', 'forms', true, now()),
  ('form.ppid_request.url', 'https://forms.gle/sLJVuwdGrZnQTJ3N7', 'forms', true, now()),
  ('form.ppid_objection.name', 'Pengajuan Keberatan', 'forms', true, now()),
  ('form.ppid_objection.url', '#form-keberatan-belum-diisi', 'forms', true, now()),

  ('ppid.informasi_berkala.name', 'Informasi Berkala', 'ppid', true, now()),
  ('ppid.informasi_berkala.drive_url', 'https://drive.google.com/drive/folders/1aLEX6QKuaZ_wDzXQDknX5IgSgD1kMX37?usp=drive_link', 'ppid', true, now()),
  ('ppid.informasi_setiap_saat.name', 'Informasi Setiap Saat', 'ppid', true, now()),
  ('ppid.informasi_setiap_saat.drive_url', 'https://drive.google.com/drive/folders/137bfjogqiqkKYvAj8lG1fyhbD0igAfyv?usp=drive_link', 'ppid', true, now()),

  ('gallery.instagram_note', 'Dokumentasi kegiatan BPAD NTT tersedia melalui akun Instagram resmi BPAD NTT.', 'gallery', true, now()),
  ('news.portal_title', 'Portal Berita BPAD', 'news', true, now()),
  ('news.portal_subtitle', 'Kabar Terkini Daerah', 'news', true, now())
on conflict (key) do update
set value = excluded.value,
    group_name = excluded.group_name,
    is_public = excluded.is_public,
    updated_at = now();

select group_name, count(*) as seeded_rows
from public.web_settings
where key in (
  'site.name',
  'site.short_name',
  'site.title',
  'site.tagline',
  'site.description',
  'site.copyright_year',
  'site.logo',
  'site.favicon',
  'site.footer_image',
  'site.hero_logo',
  'office.address',
  'office.address_short',
  'office.city',
  'office.province',
  'office.postal_code',
  'office.service_hours',
  'office.maps_embed_url',
  'office.maps_link',
  'pad.target_year',
  'pad.target_value_text',
  'pad.target_label',
  'pad.today_label',
  'pad.skm_score',
  'pad.skm_year',
  'pad.skm_note',
  'social.instagram_url',
  'social.instagram_handle',
  'app.magang_hub.name',
  'app.magang_hub.url',
  'app.pro_ntt.name',
  'app.pro_ntt.url',
  'app.kastau_tim_siber.name',
  'app.kastau_tim_siber.url',
  'form.kotak_saran_skm.name',
  'form.kotak_saran_skm.url',
  'form.buku_tamu.name',
  'form.buku_tamu.url',
  'form.ppid_request.name',
  'form.ppid_request.url',
  'form.ppid_objection.name',
  'form.ppid_objection.url',
  'ppid.informasi_berkala.name',
  'ppid.informasi_berkala.drive_url',
  'ppid.informasi_setiap_saat.name',
  'ppid.informasi_setiap_saat.drive_url',
  'gallery.instagram_note',
  'news.portal_title',
  'news.portal_subtitle'
)
group by group_name
order by group_name;

commit;
