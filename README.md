# Website BPAD NTT v2

Repository: [ihsanmokhsen/webbpadntt-html-v2](https://github.com/ihsanmokhsen/webbpadntt-html-v2)

Website profil dan portal informasi BPAD NTT dengan dashboard admin berbasis Supabase.

## Ringkasan Arsitektur

- Frontend: HTML, CSS, JavaScript (vanilla)
- Backend data: Supabase (PostgreSQL + RPC + RLS)
- Konten utama:
  - `web_posts` untuk berita, pengumuman, agenda
  - `web_settings` untuk konfigurasi publik website
- Fallback: jika Supabase tidak tersedia, halaman publik tetap bisa pakai data JSON di folder `data/`

## Fitur Utama

- Halaman publik: `index`, `profil`, `layanan`, `ppid`, `berita`, `pengumuman`, `galeri`
- Admin login custom: `admin.html`
- Admin dashboard: `admin-dashboard.html`
- Kelola konten `web_posts` dari dashboard admin
- Kelola `web_settings` dari dashboard admin (dan sekarang langsung terbaca di halaman publik)

## Struktur Penting

```text
index.html
admin.html
admin-dashboard.html
css/
js/
  main.js
  public-data.js
  admin-core.js
  admin-login.js
  admin-dashboard.js
  supabase-config.example.js
database/
  supabase-combined-schema.sql
  web-custom-auth.sql
  web-admin-settings-functions.sql
  seed-web-posts.sql
  seed-web-settings.sql
data/
assets/
```

## Konfigurasi Supabase (Frontend)

1. Copy file config:

```bash
cp js/supabase-config.example.js js/supabase-config.js
```

2. Isi `js/supabase-config.js`:

```js
window.BPAD_SUPABASE_CONFIG = {
  url: 'https://PROJECT_REF.supabase.co',
  anonKey: 'SUPABASE_ANON_PUBLIC_KEY'
};
```

Catatan penting:

- `js/supabase-config.js` masuk `.gitignore` dan tidak boleh di-commit
- Jangan pernah taruh `service_role` key di frontend

## Setup Database Supabase

Jalankan SQL di Supabase SQL Editor dengan urutan:

```text
1. database/supabase-combined-schema.sql
2. database/web-custom-auth.sql
3. database/web-admin-settings-functions.sql
4. database/create-admin-user.example.sql (setelah ganti username/password)
5. database/seed-web-posts.sql
6. database/seed-web-settings.sql
```

Jika sudah ada tabel lama aplikasi absen tanpa prefix, jalankan `database/rename-absen-tables.sql` dulu.

## Cara Menjalankan Lokal

```bash
python3 -m http.server 8080
```

Buka:

```text
http://localhost:8080/
```

## Alur Edit Konten

1. Login di `admin.html`
2. Kelola konten di `admin-dashboard.html`
3. Untuk Web Setting:
   - Pilih item setting dari tabel kanan
   - Ubah field `Value`
   - Klik `Simpan Setting`
4. Reload halaman publik untuk verifikasi perubahan

Catatan:

- Web setting publik dibaca dari `web_settings` (`is_public = true`)
- Jika perubahan tidak terlihat, lakukan hard refresh browser

## Deploy

Rekomendasi saat ini:

- Frontend: Vercel
- Database: Supabase

Repo ini juga bisa dipakai untuk hosting statis lain selama endpoint Supabase publik tetap aktif.

## Keamanan

- Password admin disimpan sebagai hash di DB (`web_users.password_hash`)
- Session admin memakai token sementara (`web_admin_sessions`)
- Operasi admin lewat RPC Supabase (`web_admin_*`)
- Review berkala warning di Supabase Security Advisor sebelum production penuh

## Troubleshooting Singkat

- Admin tidak bisa login:
  - cek `js/supabase-config.js`
  - cek user admin sudah dibuat dari `create-admin-user.example.sql`
- Web setting tidak berubah di publik:
  - pastikan edit field `Value` dan klik simpan
  - pastikan setting `is_public = true`
  - hard refresh halaman publik
- Data publik kosong:
  - cek policy RLS tabel `web_posts` dan `web_settings`
  - cek response RPC/REST Supabase di browser devtools
