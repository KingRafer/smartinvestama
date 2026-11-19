# Smart AI — Unified System

Satu sistem yang menggabungkan **Landing**, **Member Dashboard**, dan **Admin Panel**.

## Struktur

```
smartai/
├── index.html          → Landing page (publik)
├── login.html          → Login member
├── daftar.html         → Registrasi member
├── faq.html, produk.html, ...  → Halaman marketing
├── member/             → Portal member (setelah login)
│   ├── dashboard.html
│   ├── clients.html, commission.html, referral.html, ...
├── admin/              → Panel admin
│   ├── index.html      → Login admin
│   ├── dashboard.html, members.html, accounts.html, ...
├── css/                → Semua stylesheet
├── js/                 → Semua script
└── assets/, img/
```

## Cara menjalankan

Buka folder ini dengan static server, contoh:

```bash
npx serve .
# atau
python3 -m http.server 8080
```

Lalu buka: http://localhost:8080

## Alur

1. **Landing** (`/`) → publik, tombol Login & Registrasi
2. **Login member** → `login.html`  
   Demo: `demo@smartai.id` / `demo123`
3. Setelah login → `member/dashboard.html`
4. **Admin** → `admin/index.html`  
   Demo: `admin@smartai.id` / `admin123`
5. Setelah login admin → `admin/dashboard.html`

## Catatan

- Auth & data masih **mock** (localStorage). Bukan produksi.
- Tema dark/light tersimpan di `localStorage` (`smartai_theme`).
- Member session key: `smartai_user` / auth key di `auth.js`
- Admin session key: `smartai_admin`
