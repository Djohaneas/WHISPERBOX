# WhisperBox
npm install && npm run dev  -> http://localhost:3000
Database: file JSON di folder data/db.json (dibuat otomatis). Ubah lokasi dengan env DATA_DIR.
Halaman: / , /create , /box , /m/[id]   API: /api/messages

## Moderasi
- Tombol "Laporkan" di setiap pesan. Satu IP dihitung sekali; pesan disembunyikan otomatis setelah REPORT_LIMIT laporan (default 3).
- Env ADMIN_KEY mengaktifkan akses admin (kirim header `x-admin-key`):
  - Lihat pesan tersembunyi: `curl -H "x-admin-key: KUNCI" /api/messages/ID`
  - Hapus pesan: `curl -X DELETE -H "x-admin-key: KUNCI" /api/messages/ID`
- Halaman admin: `/admin` (masuk dengan ADMIN_KEY) — lihat semua pesan, laporan, pulihkan, atau hapus.
- Tanpa ADMIN_KEY, akses admin dinonaktifkan.
- Catatan: butuh penyimpanan persisten (VPS/volume), bukan serverless.

## Foto
Foto opsional per pesan: diperkecil di browser (maks. 900px, JPEG), divalidasi server (JPEG, maks. 600 KB), disimpan di `DATA_DIR/uploads/`.

## Deploy ke Render
Build: `npm install && npm run build` · Start: `npm start` · Env: `NODE_VERSION=20`, `ADMIN_KEY=<kunci rahasia>`.
Paket gratis: disk tidak permanen, data bisa hilang saat restart. Untuk data permanen, tambah Disk di Render lalu set `DATA_DIR` ke folder disk tersebut.

## Catatan
- Font (Bagel Fat One & Outfit) kini dipasang lewat paket `@fontsource` sehingga tidak perlu internet ke Google Fonts saat dev/build.
- Di Windows (cmd): `set ADMIN_KEY=kunci` lalu `npm run dev`. Di PowerShell: `$env:ADMIN_KEY="kunci"`.
- Jangan jalankan `npm audit fix --force` (akan memaksa upgrade besar dan merusak proyek).

## Lagu
8 lagu ada di `public/songs/` (mp3). Nama tampil dan urutan diatur di `app/lib/data.js` (`songs` dan `files`). Nomor musik 1-3 = nada sederhana, 4 dst = lagu; pesan lama tetap aman. Untuk menambah lagu, taruh mp3 di folder itu lalu tambahkan nama di akhir `songs` dan `files` (jangan mengubah urutan yang sudah ada).

## Lagu tambahan (admin)
Buka /admin > Kelola Lagu: unggah MP3 (maks. 8 MB), ubah judul, hapus. File disimpan di data/songs/, daftar di data/db.json.
Butuh penyimpanan permanen (VPS / Render Disk). Di Vercel penyimpanan file tidak permanen dan batas upload 4,5 MB.

## v10
- Admin > Kelola Lagu: semua lagu (bawaan + unggahan) bisa diganti judulnya, dihapus, dan (bawaan) dipulihkan. Override lagu bawaan disimpan di data/db.json (kunci "builtin").
- Admin > Pesan: "Hapus" memindahkan pesan ke tab Terhapus (hilang dari pengguna, bisa Dipulihkan). "Hapus permanen" hanya ada di tab Terhapus.
- Footer: Contact Person admin (WhatsApp, Email, Instagram) ada di app/components.js (array admins).

## v11
- Contact Person: menu di navigasi atas (jendela pop-up), data admin di app/components.js (array admins).
- Pesan otomatis masuk Terhapus bila laporan > 15 (env AUTO_DELETE_LIMIT, default 15); admin bisa Pulihkan. Batas sembunyikan tetap REPORT_LIMIT (default 3).
- Balasan: pengguna bisa melapor; admin melihat/hapus/pulihkan/hapus permanen balasan di Kelola Pesan > Balasan.
- Lagu: Hapus -> tab Terhapus -> Pulihkan atau Hapus permanen. Admin dipisah: tab Kelola Pesan dan Kelola Lagu.

## v12
- Pengawas (rahasia): di /admin ketuk tulisan ADMIN 5x cepat -> /admin/pengawas. Data di data/monitor.json (perangkat, aktivitas, blokir).
- Blokir: per perangkat (cookie wb_did) atau per IP. Blokir IP juga memblokir semua perangkat satu jaringan.
- Admin: kotak cari pesan & lagu; pesan diurutkan dari laporan terbanyak.
- Warna kustom di Tema (disimpan sebagai #rrggbb); preview pesan di landing; menu atas & footer dikembalikan.

## v13
- Tombol KIRIM selalu tampil (>=640px). Warna tema default: Oranye. Pratinjau pesan di beranda bergeser terus-menerus (40px/detik).
