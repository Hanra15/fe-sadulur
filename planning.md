# Planning Diskusi Pembuatan Website

Semua diskusi, ide, dan keputusan terkait pembuatan website akan dicatat di sini.

---

## Catatan Autentikasi Tahap Awal

- Autentikasi login (register, login, role-based) masih dalam pengembangan oleh tim backend.
- Untuk tahap awal pengembangan frontend:
	- Implementasikan login role-based secara statis (misal: memilih role saat login, tanpa validasi backend).
	- Siapkan struktur dan skema autentikasi yang nantinya akan terhubung ke API backend (misal: login, penyimpanan token, pengecekan role, dsb).
	- Pastikan arsitektur frontend mudah diintegrasikan dengan autentikasi API backend saat sudah tersedia.

---

## 30 Maret 2026

- Diskusi Awal Pembuatan Website Villa Sadulur
	- Nama website: Villa Sadulur
	- Tujuan: Memfasilitasi booking villa/penginapan di wilayah Puncak Bogor, khususnya dekat Taman Safari, untuk villa yang tergabung dalam Villa Sadulur Group.
	- Fitur utama:
		- Pencarian villa/penginapan
		- Visualisasi data villa dari backend (API)
		- Booking/pemesanan villa
		- Informasi detail villa
		- Menampilkan lokasi villa di maps
		- Sistem pembayaran via aplikasi
		- Komunikasi antara pengunjung dan pengelola villa
	- Target pengguna: Pengunjung/wisatawan yang mencari penginapan di Puncak Bogor
	- Backend: Sudah dikembangkan oleh tim lain, API dapat diakses di https://villa-sadulur.my.id/api/ (saat ini endpoint: /villas)
	- Frontend:
		- Menggunakan Next.js + TypeScript
		- Data di-load dari backend via API
		- Desain fresh, mudah dipahami, mudah digunakan, khas website travel
		- Fokus pada kemudahan pencarian, detail informasi, booking, komunikasi, dan pembayaran

---
Silakan lanjutkan diskusi atau tambahkan poin yang ingin didiskusikan.

---

## Saran Pengembangan & Grand Design Frontend

### 1. Saran Pengembangan
- Gunakan Next.js (App Router) dengan TypeScript untuk struktur yang modern, modular, dan mudah dikembangkan.
- Manfaatkan Server Components dan Static Site Generation (SSG) untuk halaman yang tidak sering berubah (misal: landing page, daftar villa), dan Server-Side Rendering (SSR) untuk halaman dinamis (misal: detail villa, booking).
- Gunakan state management ringan seperti React Context atau Zustand untuk kebutuhan global state (misal: data user, cart booking).
- Integrasi API backend menggunakan React Query atau SWR untuk data fetching yang efisien dan caching otomatis.
- Terapkan atomic design system/component-based UI agar komponen mudah dipakai ulang dan konsisten.
- Gunakan Tailwind CSS atau Chakra UI untuk styling yang cepat, konsisten, dan responsif.
- Siapkan environment variable untuk endpoint API agar mudah diubah sesuai environment (dev/staging/production).
- Implementasikan autentikasi (jika diperlukan) menggunakan JWT atau OAuth, dan pastikan keamanan data pengguna.
- Siapkan struktur folder yang rapi: components, pages, hooks, utils, services, types, dll.
- Gunakan ESLint, Prettier, dan Husky untuk menjaga kualitas kode dan konsistensi style.
- Siapkan dokumentasi singkat untuk onboarding developer baru.

### 2. Grand Design Frontend (User Flow & Fitur)
- **Landing Page**: Menampilkan hero section, keunggulan Villa Sadulur, CTA pencarian villa, testimoni, dan FAQ.
- **Pencarian & Filter Villa**: Fitur pencarian berdasarkan lokasi, harga, kapasitas, fasilitas, dan tanggal.
- **List Villa**: Menampilkan daftar villa dengan gambar, harga, rating, dan tombol detail.
- **Detail Villa**: Informasi lengkap villa (deskripsi, fasilitas, galeri foto, lokasi maps, review, ketersediaan, tombol booking).
- **Booking Flow**: Form pemesanan, pilih tanggal, jumlah tamu, konfirmasi harga, dan lanjut ke pembayaran.
- **Pembayaran**: Integrasi payment gateway (bisa dummy dulu), status pembayaran, dan notifikasi.
- **Dashboard Pengunjung**: Riwayat booking, status pembayaran, komunikasi/chat dengan pengelola.
- **Dashboard Pengelola** (opsional/future): Kelola villa, lihat booking masuk, update ketersediaan.
- **Halaman Informasi**: Tentang Villa Sadulur, kontak, lokasi, kebijakan, dsb.
- **Responsif & Aksesibilitas**: Pastikan tampilan optimal di mobile & desktop, serta ramah aksesibilitas.

### 3. Inspirasi Desain
- Referensi desain: Airbnb, Traveloka, Booking.com, Agoda (utamakan kemudahan navigasi, visual bersih, dan CTA jelas).
- Gunakan warna yang fresh, natural, dan nyaman (misal: hijau, biru, putih, earth tone).
- Banyakkan penggunaan gambar/foto villa berkualitas tinggi.

---
Saran dan grand design di atas dapat dijadikan acuan awal. Silakan diskusikan lebih lanjut jika ada kebutuhan khusus atau perubahan.

---

## 3 Role Utama & Kebutuhan Frontend

- **Pengunjung**
	- Dapat mencari, melihat detail, dan membooking villa.
	- Melihat riwayat booking, status pembayaran, dan berkomunikasi dengan pengelola.

- **Pengelola Villa**
	- Dapat mendaftarkan/memposting villa baru.
	- Mengelola data villa (edit, update, hapus), melihat booking masuk, mengatur ketersediaan, dan berkomunikasi dengan pengunjung.

- **Super Admin**
	- Mengelola seluruh aplikasi: manajemen user (pengunjung & pengelola), moderasi konten villa, pengaturan sistem, monitoring transaksi, dan laporan.

- **Frontend**
	- Sediakan interface/halaman khusus untuk masing-masing role (role-based access):
		- Pengunjung: Akses utama ke fitur booking dan informasi villa.
		- Pengelola: Dashboard pengelola untuk manajemen villa & booking.
		- Super Admin: Dashboard admin untuk kontrol penuh aplikasi.
	- Implementasi autentikasi dan otorisasi agar fitur sesuai dengan role user yang login.
	- Navigasi dan UI harus menyesuaikan role yang sedang aktif.

---

---

Silakan lanjutkan diskusi atau tambahkan poin yang ingin didiskusikan.