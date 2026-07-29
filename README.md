# SPPD Online

Aplikasi administrasi perjalanan dinas berbasis Next.js, Turso/libSQL, dan
Drizzle ORM. Versi ini disiapkan untuk deployment di Vercel dan dilindungi
dengan login administrator.

## Persyaratan

- Node.js 22
- Database Turso
- Akun Vercel untuk deployment

## Environment variables

Salin `.env.example` menjadi `.env.local`, lalu isi nilainya:

| Variabel | Keterangan |
| --- | --- |
| `TURSO_DATABASE_URL` | URL database Turso yang diawali `libsql://` |
| `TURSO_AUTH_TOKEN` | Token database Turso |
| `ADMIN_EMAIL` | Email login administrator |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt dari kata sandi administrator |
| `AUTH_SECRET` | String acak minimal 32 karakter untuk menandatangani sesi |

Jangan menyimpan `.env.local`, token Turso, kata sandi, atau `AUTH_SECRET` ke
GitHub.

## Membuat hash kata sandi

Setelah menjalankan `npm install`, buat hash bcrypt:

```bash
node -e "import('bcryptjs').then(async m => console.log(await m.default.hash('GANTI_DENGAN_KATA_SANDI', 12)))"
```

Masukkan hasil yang diawali `$2` ke `ADMIN_PASSWORD_HASH`. Simpan kata sandi
aslinya untuk digunakan pada halaman login.

Membuat `AUTH_SECRET`:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

## Pengembangan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Tabel dan data awal akan dibuat otomatis saat API
pertama kali diakses.

## Deployment Vercel

1. Import repository ini sebagai project Vercel.
2. Tambahkan kelima environment variables untuk Production dan Preview.
3. Pastikan framework preset terdeteksi sebagai Next.js.
4. Gunakan build command bawaan `npm run build`.
5. Deploy.

Tidak diperlukan binding Cloudflare, Wrangler, vinext, atau skrip build khusus.

## Pemeriksaan

```bash
npm run lint
npm run build
```
