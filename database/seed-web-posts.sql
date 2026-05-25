-- Seed dummy content for BPAD website.
--
-- This imports the current local dummy/JSON content into public.web_posts.
-- Safe to run repeatedly because rows are upserted by unique slug.
-- Run after database/supabase-combined-schema.sql and database/web-custom-auth.sql.

begin;

create temporary table tmp_web_posts_seed (
  type text not null,
  title text not null,
  slug text not null,
  summary text,
  content text,
  category text,
  cover_image text,
  published_at timestamptz not null
) on commit drop;

insert into tmp_web_posts_seed (
  type,
  title,
  slug,
  summary,
  content,
  category,
  cover_image,
  published_at
)
values
  ('berita', 'Pembebasan Denda PKB dalam Rangka HUT Provinsi NTT ke-66', 'pembebasan-denda-pkb-dalam-rangka-hut-provinsi-ntt-ke-66', 'Informasi pembebasan denda Pajak Kendaraan Bermotor bagi wajib pajak di Provinsi NTT.', 'Informasi pembebasan denda Pajak Kendaraan Bermotor bagi wajib pajak di Provinsi NTT.', 'Pengumuman', null, '2026-05-15 08:00:00+08'::timestamptz),
  ('berita', 'BPAD NTT Raih Penghargaan Terbaik Pengelolaan Aset Daerah 2026', 'bpad-ntt-raih-penghargaan-terbaik-pengelolaan-aset-daerah-2026', 'BPAD NTT memperoleh apresiasi atas peningkatan tata kelola aset daerah.', 'BPAD NTT memperoleh apresiasi atas peningkatan tata kelola aset daerah.', 'Prestasi', null, '2026-05-08 08:00:00+08'::timestamptz),
  ('berita', 'Peluncuran Sistem e-Samsat Generasi Baru untuk Kemudahan Wajib Pajak', 'peluncuran-sistem-e-samsat-generasi-baru-untuk-kemudahan-wajib-pajak', 'Layanan digital e-Samsat diperbarui untuk mempermudah pembayaran pajak kendaraan.', 'Layanan digital e-Samsat diperbarui untuk mempermudah pembayaran pajak kendaraan.', 'Inovasi', null, '2026-05-01 08:00:00+08'::timestamptz),
  ('berita', 'Rakor Samsat NTT 2026 Dorong Kolaborasi dan Inovasi Pendapatan Daerah', 'rakor-samsat-ntt-2026-dorong-kolaborasi-dan-inovasi-pendapatan-daerah', 'BPAD NTT menguatkan koordinasi layanan Samsat untuk mendukung peningkatan pendapatan daerah dan pelayanan kepada masyarakat.', 'BPAD NTT menguatkan koordinasi layanan Samsat untuk mendukung peningkatan pendapatan daerah dan pelayanan kepada masyarakat.

Sumber: https://www.instagram.com/p/DYgqbQzEzoj/', 'Pendapatan Daerah', 'assets/instagram-02.jpg', '2026-05-19 08:00:00+08'::timestamptz),
  ('berita', 'Kepala BPAD NTT Pimpin Rapat Internal Usai Pelantikan', 'kepala-bpad-ntt-pimpin-rapat-internal-usai-pelantikan', 'Arahan internal dilakukan untuk memperkuat ritme kerja, koordinasi bidang, dan kesiapan pelaksanaan agenda BPAD NTT.', 'Arahan internal dilakukan untuk memperkuat ritme kerja, koordinasi bidang, dan kesiapan pelaksanaan agenda BPAD NTT.

Sumber: https://www.instagram.com/p/DYezpNHE8ca/', 'Agenda BPAD', 'assets/instagram-03.jpg', '2026-05-18 08:00:00+08'::timestamptz),
  ('berita', 'Samsat Keliling UPTD Kabupaten Kupang Dekatkan Layanan Pajak Kendaraan', 'samsat-keliling-uptd-kabupaten-kupang-dekatkan-layanan-pajak-kendaraan', 'UPTD Pendapatan Daerah Wilayah Kabupaten Kupang melaksanakan layanan Samsat Keliling untuk memudahkan wajib pajak.', 'UPTD Pendapatan Daerah Wilayah Kabupaten Kupang melaksanakan layanan Samsat Keliling untuk memudahkan wajib pajak.

Sumber: https://www.instagram.com/p/DYZVHfMExaT/', 'Layanan', 'assets/instagram-07.jpg', '2026-05-16 08:00:00+08'::timestamptz),
  ('berita', 'Tim Optimalisasi PAD Bahas Tindak Lanjut Rapat Pimpinan OPD', 'tim-optimalisasi-pad-bahas-tindak-lanjut-rapat-pimpinan-opd', 'Rapat tindak lanjut dilakukan untuk memperkuat strategi optimalisasi Pendapatan Asli Daerah Provinsi NTT.', 'Rapat tindak lanjut dilakukan untuk memperkuat strategi optimalisasi Pendapatan Asli Daerah Provinsi NTT.

Sumber: https://www.instagram.com/p/DYZUyMrE4_s/', 'PAD', 'assets/instagram-08.jpg', '2026-05-16 08:00:00+08'::timestamptz),
  ('berita', 'Informasi Pergub NTT Nomor 13 Tahun 2025 Terkait Optimalisasi Pajak Daerah', 'informasi-pergub-ntt-nomor-13-tahun-2025-terkait-optimalisasi-pajak-daerah', 'BPAD NTT membagikan informasi kebijakan terkait optimalisasi PKB, BBNKB, dan penguatan penerimaan daerah.', 'BPAD NTT membagikan informasi kebijakan terkait optimalisasi PKB, BBNKB, dan penguatan penerimaan daerah.

Sumber: https://www.instagram.com/p/DYN_vmVE8Yz/', 'Regulasi', 'assets/instagram-10.jpg', '2026-05-12 08:00:00+08'::timestamptz),
  ('berita', 'Keluarga Besar BPAD NTT Turut Berduka Cita', 'keluarga-besar-bpad-ntt-turut-berduka-cita', 'BPAD NTT menyampaikan ungkapan duka cita sebagai bagian dari publikasi resmi kelembagaan.', 'BPAD NTT menyampaikan ungkapan duka cita sebagai bagian dari publikasi resmi kelembagaan.

Sumber: https://www.instagram.com/p/DYdiFe2kwZr/', 'Publikasi', 'assets/instagram-06.jpg', '2026-05-18 08:00:00+08'::timestamptz),
  ('berita', 'Selamat Memperingati Hari Kenaikan Yesus Kristus', 'selamat-memperingati-hari-kenaikan-yesus-kristus', 'BPAD NTT membagikan ucapan peringatan hari besar keagamaan kepada masyarakat Nusa Tenggara Timur.', 'BPAD NTT membagikan ucapan peringatan hari besar keagamaan kepada masyarakat Nusa Tenggara Timur.

Sumber: https://www.instagram.com/p/DYTbl8DzfHL/', 'Ucapan Resmi', 'assets/instagram-09.jpg', '2026-05-14 08:00:00+08'::timestamptz),
  ('berita', 'Dokumentasi Kegiatan BPAD NTT', 'dokumentasi-kegiatan-bpad-ntt', 'Dokumentasi kegiatan dan publikasi visual BPAD NTT yang dibagikan melalui kanal Instagram resmi.', 'Dokumentasi kegiatan dan publikasi visual BPAD NTT yang dibagikan melalui kanal Instagram resmi.

Sumber: https://www.instagram.com/p/DYeKbN9ExgZ/', 'Dokumentasi', 'assets/instagram-01.jpg', '2026-05-18 08:00:00+08'::timestamptz),
  ('berita', 'Publikasi Resmi BPAD NTT', 'publikasi-resmi-bpad-ntt', 'Kanal media sosial BPAD NTT menjadi ruang publikasi kegiatan, layanan, dan informasi kelembagaan.', 'Kanal media sosial BPAD NTT menjadi ruang publikasi kegiatan, layanan, dan informasi kelembagaan.

Sumber: https://www.instagram.com/p/DYd94qPz0Dc/', 'Media Sosial', 'assets/instagram-05.jpg', '2026-05-18 08:00:00+08'::timestamptz),
  ('berita', 'Optimalisasi pembayaran wajib pajak BPAD Prov NTT @republiknews21', 'optimalisasi-pembayaran-wajib-pajak-bpad-prov-ntt-republiknews21', 'Liputan video terkait optimalisasi pembayaran wajib pajak BPAD Provinsi NTT.', 'Liputan video terkait optimalisasi pembayaran wajib pajak BPAD Provinsi NTT.

Sumber: https://www.youtube.com/watch?v=tXUwLeKHebE&pp=ygUIYnBhZCBudHQ%3D', 'Video', 'https://img.youtube.com/vi/tXUwLeKHebE/hqdefault.jpg', '2026-05-20 08:00:00+08'::timestamptz),
  ('berita', 'PS. BADAN PENDAPATAN DAN ASET DAERAH PROVINSI NTT - GAILARU MARADA', 'ps-badan-pendapatan-dan-aset-daerah-provinsi-ntt-gailaru-marada', 'Dokumentasi video dari kanal YouTube BPAD Provinsi NTT.', 'Dokumentasi video dari kanal YouTube BPAD Provinsi NTT.

Sumber: https://www.youtube.com/watch?v=KBTeuUTNF3A&list=RDKBTeuUTNF3A&start_radio=1&pp=ygUIYnBhZCBudHSgBwE%3D', 'Video', 'https://img.youtube.com/vi/KBTeuUTNF3A/hqdefault.jpg', '2026-05-20 08:00:00+08'::timestamptz),
  ('berita', 'HUT NTT ke-64 NTT : TARIAN HEDUNG DAN DOLO - DOLO | BADAN PENDAPATAN DAN ASET DAERAH PROVINSI NTT', 'hut-ntt-ke-64-ntt-tarian-hedung-dan-dolo-dolo-badan-pendapatan-dan-aset-daerah-provinsi-ntt', 'Publikasi video BPAD NTT dalam rangka peringatan HUT NTT ke-64.', 'Publikasi video BPAD NTT dalam rangka peringatan HUT NTT ke-64.

Sumber: https://www.youtube.com/watch?v=E-pyNjNMUj4&pp=ygUIYnBhZCBudHQ%3D', 'Video', 'https://img.youtube.com/vi/E-pyNjNMUj4/hqdefault.jpg', '2026-05-20 08:00:00+08'::timestamptz),
  ('berita', 'Operasi rokok ilegal Prov NTT @renews21', 'operasi-rokok-ilegal-prov-ntt-renews21', 'Liputan video terkait operasi rokok ilegal di Provinsi NTT.', 'Liputan video terkait operasi rokok ilegal di Provinsi NTT.

Sumber: https://www.youtube.com/watch?v=_uLTJ3ebGbA', 'Video', 'https://img.youtube.com/vi/_uLTJ3ebGbA/hqdefault.jpg', '2026-05-20 08:00:00+08'::timestamptz),
  ('pengumuman', 'Jadwal Pemeliharaan Sistem e-Samsat — 20 Mei 2026', 'jadwal-pemeliharaan-sistem-e-samsat-20-mei-2026', 'Jadwal Pemeliharaan Sistem e-Samsat — 20 Mei 2026', 'Jadwal Pemeliharaan Sistem e-Samsat — 20 Mei 2026', 'Pengumuman', null, '2026-05-20 08:00:00+08'::timestamptz),
  ('pengumuman', 'Perubahan Jam Pelayanan UPTD Samsat Kupang Selama Masa Libur Nasional', 'perubahan-jam-pelayanan-uptd-samsat-kupang-selama-masa-libur-nasional', 'Perubahan Jam Pelayanan UPTD Samsat Kupang Selama Masa Libur Nasional', 'Perubahan Jam Pelayanan UPTD Samsat Kupang Selama Masa Libur Nasional', 'Pengumuman', null, '2026-05-18 08:00:00+08'::timestamptz),
  ('pengumuman', 'Rekrutmen Tenaga Pendamping Pajak Daerah Kabupaten/Kota Tahun 2026', 'rekrutmen-tenaga-pendamping-pajak-daerah-kabupaten-kota-tahun-2026', 'Rekrutmen Tenaga Pendamping Pajak Daerah Kabupaten/Kota Tahun 2026', 'Rekrutmen Tenaga Pendamping Pajak Daerah Kabupaten/Kota Tahun 2026', 'Pengumuman', null, '2026-05-16 08:00:00+08'::timestamptz),
  ('pengumuman', 'Sosialisasi Peraturan Daerah tentang Pajak Daerah bagi Pelaku Usaha di Kupang', 'sosialisasi-peraturan-daerah-tentang-pajak-daerah-bagi-pelaku-usaha-di-kupang', 'Sosialisasi Peraturan Daerah tentang Pajak Daerah bagi Pelaku Usaha di Kupang', 'Sosialisasi Peraturan Daerah tentang Pajak Daerah bagi Pelaku Usaha di Kupang', 'Pengumuman', null, '2026-05-14 08:00:00+08'::timestamptz),
  ('pengumuman', 'Persiapan Digitalisasi Pembayaran Retribusi untuk meningkatkan PAD', 'persiapan-digitalisasi-pembayaran-retribusi-untuk-meningkatkan-pad', 'Persiapan Digitalisasi Pembayaran Retribusi untuk meningkatkan PAD', 'Persiapan Digitalisasi Pembayaran Retribusi untuk meningkatkan PAD', 'Pengumuman', null, '2026-05-22 08:00:00+08'::timestamptz),
  ('agenda', 'Forum Konsultasi Publik Layanan Pajak Daerah', 'forum-konsultasi-publik-layanan-pajak-daerah', 'Forum Konsultasi Publik Layanan Pajak Daerah', 'Forum Konsultasi Publik Layanan Pajak Daerah', 'Agenda', null, '2026-05-21 08:00:00+08'::timestamptz),
  ('agenda', 'Sosialisasi Pajak Daerah di UPTD Kota Kupang', 'sosialisasi-pajak-daerah-di-uptd-kota-kupang', 'Sosialisasi Pajak Daerah di UPTD Kota Kupang', 'Sosialisasi Pajak Daerah di UPTD Kota Kupang', 'Agenda', null, '2026-05-19 08:00:00+08'::timestamptz);

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
  updated_at
)
select
  type,
  title,
  slug,
  summary,
  content,
  category,
  nullif(cover_image, ''),
  'published',
  published_at,
  now()
from tmp_web_posts_seed
on conflict (slug) do update
set type = excluded.type,
    title = excluded.title,
    summary = excluded.summary,
    content = excluded.content,
    category = excluded.category,
    cover_image = excluded.cover_image,
    status = 'published',
    published_at = excluded.published_at,
    updated_at = now();

select
  public.web_posts.type,
  count(*) as seeded_rows
from public.web_posts
join tmp_web_posts_seed on tmp_web_posts_seed.slug = public.web_posts.slug
group by public.web_posts.type
order by public.web_posts.type;

commit;
