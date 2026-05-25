# Website BPAD NTT

Website BPAD NTT. Versi publik saat ini masih aman berjalan tanpa database, dengan konten utama yang sering berubah disimpan di folder `data/` dalam format JSON. Folder `database/` dan halaman `admin.html` disiapkan untuk migrasi Supabase tahap berikutnya.

Link GitHub Pages:

https://ihsanmokhsen.github.io/webbpadntt-html/

## Struktur Penting

```text
index.html
css/style.css
js/main.js
data/
  berita.json
  pengumuman.json
  ppid.json
assets/
  hero.png
  hero2.png
  footer.png
  logo.png
```

## Cara Update Berita

Edit file:

```text
data/berita.json
```

Contoh item berita:

```json
{
  "judul": "Peluncuran Layanan Baru BPAD NTT",
  "kategori": "Berita",
  "tanggal": "2026-05-07",
  "ikon": "ti-news",
  "tema": "blue",
  "ringkasan": "BPAD NTT meluncurkan layanan baru untuk memudahkan masyarakat."
}
```

Pilihan `tema` yang tersedia:

```text
blue
green
amber
```

Contoh `ikon` memakai Tabler Icons:

```text
ti-news
ti-award
ti-device-laptop
ti-bell
ti-file-search
```

Format tanggal wajib:

```text
YYYY-MM-DD
```

Contoh:

```text
2026-05-07
```

## Cara Update Pengumuman

Edit file:

```text
data/pengumuman.json
```

Contoh item pengumuman:

```json
{
  "judul": "Perubahan Jam Pelayanan UPTD Samsat Kupang",
  "tanggal": "2026-05-07"
}
```

## Cara Update PPID

Edit file:

```text
data/ppid.json
```

Contoh item PPID tanpa dokumen:

```json
{
  "judul": "Informasi Berkala",
  "jenis": "Kategori PPID",
  "deskripsi": "Profil instansi, program kerja, laporan kinerja, dan informasi publik yang diperbarui secara rutin.",
  "link": ""
}
```

Contoh item PPID dengan link Google Drive:

```json
{
  "judul": "Daftar Informasi Publik",
  "jenis": "Dokumen PPID",
  "deskripsi": "Daftar informasi publik BPAD NTT.",
  "link": "https://drive.google.com/file/d/ID_FILE_GOOGLE_DRIVE/view"
}
```

Jika `link` kosong, tombol dokumen tidak muncul. Jika `link` diisi, tombol `Buka Dokumen` akan muncul otomatis.

## Aturan Penting Saat Edit JSON

1. Setiap item dipisahkan dengan koma.
2. Jangan memakai koma setelah item terakhir.
3. Semua teks key dan value harus memakai tanda petik dua.
4. Format tanggal gunakan `YYYY-MM-DD`.
5. Setelah edit, cek JSON agar tidak error.

Contoh benar:

```json
[
  {
    "judul": "Berita Pertama",
    "tanggal": "2026-05-07"
  },
  {
    "judul": "Berita Kedua",
    "tanggal": "2026-05-08"
  }
]
```

Contoh salah:

```json
[
  {
    "judul": "Berita Pertama",
    "tanggal": "2026-05-07",
  }
]
```

Kesalahan di atas karena ada koma setelah `"tanggal"` pada item terakhir.

## Cara Cek Lokal

Jalankan server lokal dari folder project:

```bash
python3 -m http.server 8080
```

Buka:

```text
http://localhost:8080/
```

Jangan buka langsung dengan `file://` untuk mengecek data JSON, karena browser bisa memblokir pembacaan file JSON lokal.

## Cara Push Update ke GitHub Pages

Setelah edit file JSON:

```bash
git status
git add .
git commit -m "Update konten website"
git push origin main
git push origin main:gh-pages
```

Setelah push, tunggu beberapa saat. GitHub Pages biasanya butuh beberapa detik sampai beberapa menit untuk menampilkan perubahan.

## Catatan Production

Website publik saat ini masih bisa berjalan tanpa database. Untuk update konten produksi sederhana, cukup ubah file JSON dan push ke GitHub.

Catatan penting:

```text
admin.html adalah halaman login admin.
admin-dashboard.html adalah halaman dashboard admin setelah login.
Data yang disimpan dari admin-dashboard.html masuk ke tabel Supabase web_posts.
Halaman publik membaca web_posts jika js/supabase-config.js tersedia.
```

## Rencana Database Gabungan

Website BPAD direncanakan memakai database Supabase yang sama dengan aplikasi absen. Agar tidak bentrok, semua tabel wajib memakai prefix sesuai aplikasi.

Aturan nama tabel:

```text
absen_xxxx = tabel aplikasi absen
web_xxxx   = tabel website BPAD
```

Struktur tabel gabungan:

```text
absen_attendance_records
absen_daily_reports
absen_system_heartbeat

web_users
web_admin_sessions
web_posts
web_media
web_settings
```

File SQL yang sudah disiapkan:

```text
database/rename-absen-tables.sql
database/supabase-combined-schema.sql
database/web-custom-auth.sql
database/web-admin-settings-functions.sql
database/create-admin-user.example.sql
database/enforce-web-posts-published-only.sql
database/seed-web-posts.sql
database/seed-web-settings.sql
```

Urutan jika database Supabase sudah pernah memakai tabel lama aplikasi absen:

```text
1. Jalankan database/rename-absen-tables.sql
2. Jalankan database/supabase-combined-schema.sql
3. Jalankan database/web-custom-auth.sql
4. Jalankan database/web-admin-settings-functions.sql jika hanya ingin menambahkan RPC setting admin
5. Jalankan database/create-admin-user.example.sql setelah mengganti password admin
6. Jalankan database/enforce-web-posts-published-only.sql jika ingin semua konten selalu published
7. Jalankan database/seed-web-posts.sql untuk memasukkan data dummy awal
8. Jalankan database/seed-web-settings.sql untuk memasukkan setting website awal
9. Deploy/update aplikasi absen yang sudah memakai tabel absen_*
```

Jika database masih kosong, cukup jalankan:

```text
database/supabase-combined-schema.sql
database/web-custom-auth.sql
database/web-admin-settings-functions.sql
database/create-admin-user.example.sql
database/enforce-web-posts-published-only.sql
database/seed-web-posts.sql
database/seed-web-settings.sql
```

Catatan:

```text
Jangan memakai nama tabel umum seperti users, posts, media, atau settings tanpa prefix.
Gunakan DBeaver untuk melihat tabel, cek data, dan menjalankan query SQL.
Gunakan Supabase SQL Editor jika ingin menjalankan langsung dari dashboard Supabase.
```

## Dashboard Admin Custom Login

Halaman login admin ada di:

```text
admin.html
```

Setelah login berhasil, browser diarahkan ke:

```text
admin-dashboard.html
```

Alur login yang dipakai:

```text
Username dan password disimpan di tabel web_users.
Password disimpan dalam bentuk hash, bukan teks asli.
Pengecekan password dilakukan oleh fungsi SQL web_admin_login.
Browser hanya menerima token sesi sementara.
Token sesi disimpan di sessionStorage dan berlaku 8 jam.
```

File yang perlu dijalankan di Supabase:

```text
database/supabase-combined-schema.sql
database/web-custom-auth.sql
database/create-admin-user.example.sql
```

Sebelum menjalankan `database/create-admin-user.example.sql`, ganti bagian ini:

```sql
lower('admin')
public.web_hash_password('GANTI_PASSWORD_ADMIN_YANG_KUAT')
'Administrator BPAD'
```

Menjadi username, password kuat, dan nama admin yang diinginkan.

Konfigurasi frontend admin:

```bash
cp js/supabase-config.example.js js/supabase-config.js
```

Lalu isi:

```js
window.BPAD_SUPABASE_CONFIG = {
  url: 'https://PROJECT_REF.supabase.co',
  anonKey: 'SUPABASE_ANON_PUBLIC_KEY'
};
```

Catatan:

```text
File js/supabase-config.js tidak dipush ke GitHub karena masuk .gitignore.
Jika dashboard admin ingin dipakai online di GitHub Pages, config publik bisa dibuat nanti setelah RLS/RPC sudah dicek.
Jangan pernah memasukkan service_role key ke file frontend.
```

Fitur dashboard admin tahap awal:

```text
Login custom satu role admin.
Redirect dari admin.html ke admin-dashboard.html setelah login berhasil.
Tambah, edit, hapus konten web_posts.
Filter konten berdasarkan berita, pengumuman, dan agenda.
Semua konten otomatis published, tidak memakai draft.
Gambar cover bisa memakai URL atau upload file dari komputer.
```

Catatan migrasi:

```text
Jika js/supabase-config.js tersedia, halaman publik membaca web_posts terlebih dahulu.
Konten yang tampil di publik hanya status published.
Jika Supabase tidak tersedia atau data kosong, halaman publik memakai JSON sebagai fallback.
Untuk mengunci database agar semua konten selalu published, jalankan database/enforce-web-posts-published-only.sql.
```

## Rencana Pengembangan API

Bagian ini adalah catatan untuk pengembangan website BPAD NTT ke depan. Tujuannya agar saat website mulai memakai database atau layanan eksternal, pilihan API tetap terarah dan tidak terlalu banyak di awal.

### API yang Paling Cocok untuk Tahap Berikutnya

1. Supabase API

Dipakai untuk database utama website.

Kegunaan:

```text
Login admin
Berita
Pengumuman
Agenda
Galeri/media
Settings website
```

Contoh data settings:

```text
Target PAD
Link PPID
Link formulir
Kontak
Sosial media
Alamat kantor
```

Supabase cocok karena sudah menyediakan PostgreSQL, Auth, Storage, dan JavaScript SDK.

2. Google Drive API

Dipakai untuk PPID jika dokumen Google Drive ingin tampil otomatis di website.

Kegunaan:

```text
Menampilkan daftar dokumen PPID dari folder Drive
Membaca nama file
Membaca link file
Membaca tanggal update
Menghindari update manual satu per satu
```

Untuk tahap sekarang, link Google Drive biasa masih cukup.

3. YouTube Data API atau YouTube oEmbed

Dipakai untuk video BPAD.

Kegunaan:

```text
Mengambil judul video asli
Mengambil thumbnail
Mengambil channel
Mengambil daftar video terbaru
```

Jika hanya memakai beberapa link video, YouTube oEmbed sudah cukup. Jika ingin otomatis mengambil video terbaru dari channel, gunakan YouTube Data API.

4. Instagram API

Dipakai untuk galeri kegiatan otomatis dari Instagram BPAD.

Kegunaan:

```text
Mengambil foto terbaru
Mengambil caption
Mengambil permalink
Mengambil thumbnail Reels
```

Catatan penting: Instagram API sebaiknya tidak dipanggil langsung dari frontend. Lebih aman melalui backend, Supabase Edge Function, atau GitHub Actions agar token tidak terlihat publik.

5. Google Maps Embed API

Dipakai untuk peta lokasi kantor.

Website saat ini sudah memakai embed Google Maps. Maps API baru perlu jika nanti ingin fitur lebih serius, seperti:

```text
Marker UPTD
Rute lokasi
Filter kabupaten/kota
Peta sebaran layanan interaktif
```

### API yang Berguna Tetapi Tidak Wajib Sekarang

1. Google Forms API

Dipakai jika nanti ingin membaca data dari formulir seperti Kotak Saran, Buku Tamu, atau Permohonan Informasi.

Untuk tahap sekarang, link Google Form saja sudah cukup.

2. Google Analytics atau Web Analytics

Dipakai untuk melihat statistik pengunjung.

Kegunaan:

```text
Jumlah pengunjung
Halaman yang sering dibuka
Perangkat pengunjung
Sumber trafik
Evaluasi halaman PPID, berita, dan layanan
```

Pilihan ringan:

```text
Google Analytics
Cloudflare Web Analytics
```

3. Email API

Dipakai jika nanti website memiliki form kontak sendiri, bukan Google Form.

Pilihan:

```text
Resend
SMTP hosting
Gmail/Google Workspace SMTP
```

Kegunaan:

```text
Notifikasi permohonan informasi
Notifikasi kotak saran
Notifikasi buku tamu
```

### API yang Tidak Disarankan Dulu

```text
API cuaca
API chat AI
WhatsApp Business API
API pembayaran
```

Alasan:

```text
API cuaca tidak terlalu relevan untuk BPAD.
API chat AI butuh biaya, kontrol konten, dan keamanan tambahan.
WhatsApp Business API setup dan biayanya lebih kompleks.
API pembayaran pajak/retribusi harus mengikuti sistem resmi dan regulasi.
```

### Rekomendasi Urutan Implementasi

Tahap production awal:

```text
Supabase API
Google Drive link biasa
YouTube oEmbed
Google Maps Embed
Google Forms link biasa
```

Tahap berikutnya setelah website stabil:

```text
Instagram API
Google Drive API
Analytics
Email API
```

Prinsip utama:

```text
Jangan terlalu banyak API di awal.
Mulai dari API yang benar-benar meningkatkan kemudahan update konten.
Prioritaskan Supabase untuk database dan admin.
Gunakan Google Drive/Form jika proses manual masih cukup.
Gunakan API Instagram dan Drive otomatis setelah kebutuhan konten semakin sering berubah.
```
