# LIBERO
**Litmas Berbasis Elektronik, Ringkas dan Optimal**

Dibuat oleh Rinaldi Yudistira Nachrawy

[![Hak Cipta](https://img.shields.io/badge/HKI-EC00202514424-gold?style=flat-square)](https://dgip.go.id)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%2F11-blue?style=flat-square&logo=windows)](https://github.com/inaldy31/LIBERO/releases/latest)
[![Versi](https://img.shields.io/badge/Versi-2.0.1-brightgreen?style=flat-square)](https://github.com/inaldy31/LIBERO/releases/latest)
[![Trial](https://img.shields.io/badge/Trial-s.d.%2023%20Mei%202026-orange?style=flat-square)](https://github.com/inaldy31/LIBERO/releases/latest)
![GitHub release (latest)](https://img.shields.io/github/v/release/inaldy31/LIBERO?style=flat-square&label=Rilis+Terbaru)
![Downloads](https://img.shields.io/github/downloads/inaldy31/LIBERO/total?style=flat-square&label=Total+Unduhan)

---

## Daftar Isi
- [LIBERO](#libero)
  - [Daftar Isi](#daftar-isi)
  - [Tentang Aplikasi](#tentang-aplikasi)
  - [Fitur](#fitur)
  - [Screenshot](#screenshot)
  - [Persyaratan Sistem](#persyaratan-sistem)
  - [Instalasi \& Penggunaan](#instalasi--penggunaan)
  - [Registrasi Perangkat](#registrasi-perangkat)
  - [Sistem Trial](#sistem-trial)
  - [Keamanan Data](#keamanan-data)
  - [Build dari Source](#build-dari-source)
- [Changelog](#changelog)
  - [v2.0.2](#v202)
    - [v2.0.1](#v201)
    - [v2.0.0](#v200)
    - [v1.0.0](#v100)
  - [FAQ](#faq)
  - [Troubleshooting](#troubleshooting)
  - [Lisensi Penggunaan](#lisensi-penggunaan)
  - [Hak Cipta](#hak-cipta)

---

## Tentang Aplikasi

**LIBERO** (Litmas Berbasis Elektronik, Ringkas dan Optimal) adalah aplikasi *desktop* mandiri berbasis Windows yang dirancang sebagai solusi teknis komprehensif bagi Pembimbing Kemasyarakatan (PK) dan Asisten Pembimbing Kemasyarakatan (APK) dalam menyusun Laporan Penelitian Kemasyarakatan (Litmas).

Aplikasi ini mengatasi tantangan efisiensi dan akurasi dalam alur kerja manual dengan menyediakan formulir isian terstruktur, kalkulasi otomatis asesmen Risiko Residivisme Indonesia (RRI) dan Kebutuhan Kriminogenik, serta fitur perangkaian data cerdas menjadi narasi laporan profesional yang diekspor ke format Microsoft Word (`.docx`).

Keamanan data rahasia klien dijamin melalui enkripsi fail kerja dan validasi perangkat berbasis *Hardware ID* (HWID) untuk mencegah penggunaan ilegal.

---

## Fitur

- **Litmas Integrasi**: Penyusunan Litmas untuk Program Pembebasan Bersyarat dan Cuti Bersyarat (klien dewasa)
- **Litmas Anak**: Penyusunan Litmas untuk klien anak
- **Kalkulasi Asesmen Otomatis**: Skor RRI dan Kebutuhan Kriminogenik dihitung otomatis, bebas salah hitung
- **Narasi Otomatis**: Data dirangkai menjadi paragraf laporan yang profesional dan terstandar
- **Export `.docx`**: Laporan final langsung siap pakai di Microsoft Word
- **Fail Kerja Terenkripsi**: Simpan dan lanjutkan progres kapan saja; file `.json` terenkripsi, hanya bisa dibuka lewat aplikasi
- **Templat Data Pribadi**: Buat satu file master berisi data UPT & petugas untuk mempercepat laporan baru
- **Registrasi TPP**: Pendaftaran otomatis ke Google Form TPP via Selenium
- **Fitur Pengingat Kolom Kosong**: Otomatis mendeteksi field yang belum diisi sebelum dokumen dibuat
- **Autosave**: Data tersimpan otomatis setiap 10 detik
- **21 Pilihan Tema**: Tampilan dapat dikustomisasi sesuai selera
- **Pintasan Keyboard**: SHIFT+F3 (ubah format huruf), Ctrl+Z/Y, Ctrl+±/scroll (zoom)
- **Auto-Update**: Notifikasi dan unduhan versi terbaru otomatis dari GitHub Releases *(baru di v2.0.1)*
- **Sistem Trial**: Berlaku sampai 23 Mei 2026, atau 14 hari sejak pertama dibuka
- **Registrasi Perangkat**: Sistem aktivasi berbasis UUID perangkat (HWID)

---

## Screenshot

**Launcher & Splash Screen**

<table>
  <tr>
    <td><img src="assets/screenshots/Screenshot (23).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (24).png" width="280"/></td>
  </tr>
</table>

**Tampilan Form, Berbagai Tema**

<table>
  <tr>
    <td><img src="assets/screenshots/Screenshot (25).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (26).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (27).png" width="280"/></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/Screenshot (28).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (29).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (30).png" width="280"/></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/Screenshot (31).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (32).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (33).png" width="280"/></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/Screenshot (34).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (35).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (36).png" width="280"/></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/Screenshot (37).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (38).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (39).png" width="280"/></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/Screenshot (40).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (41).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (42).png" width="280"/></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/Screenshot (43).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (45).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (46).png" width="280"/></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/Screenshot (47).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (48).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (49).png" width="280"/></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/Screenshot (50).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (53).png" width="280"/></td>
    <td><img src="assets/screenshots/Screenshot (51).png" width="280"/></td>
  </tr>
</table>

---

## Persyaratan Sistem

| Komponen | Keterangan |
|---|---|
| OS | Windows 10 / 11 (64-bit) |
| WebView2 Runtime | Otomatis diinstall jika belum ada |
| Internet | Diperlukan untuk registrasi perangkat & verifikasi |
| RAM | Minimal 4 GB |
| Storage | Minimal 200 MB |

> **Catatan:** Python **tidak perlu** diinstall di PC target. Semua dependensi sudah dibundle di dalam file `.exe`.

---

## Instalasi & Penggunaan

1. Salin file `LIBERO.exe` ke lokasi yang diinginkan
2. Jalankan `LIBERO.exe`
3. Jika WebView2 Runtime belum terinstall, akan muncul jendela instalasi otomatis, tunggu hingga selesai
4. Saat pertama kali dibuka, layar pembuka dengan *progress bar* akan muncul, tunggu hingga penuh
5. Pada pembukaan pertama, masa trial dimulai secara otomatis
6. Daftarkan perangkat via tombol **Daftar Perangkat** di launcher agar dapat terus digunakan setelah trial berakhir

---

## Registrasi Perangkat

Registrasi diperlukan untuk menggunakan LIBERO setelah masa trial berakhir. UUID perangkat dideteksi otomatis dari *motherboard* (*Hardware ID*), satu UUID berlaku untuk satu perangkat.

**Langkah registrasi:**
1. Klik tombol **Daftar Perangkat** di halaman launcher
2. Isi formulir: Nama Lengkap, NIP, Jabatan, Kantor Wilayah, dan Nama UPT/Instansi
3. Klik **Daftar Sekarang**
4. Tunggu persetujuan dari pengembang
5. Setelah disetujui, restart LIBERO

**Status pendaftaran:**
- `Menunggu persetujuan`: Data terkirim, tunggu konfirmasi pengembang
- `Aktif`: Perangkat sudah dapat digunakan penuh
- `Dinonaktifkan`: Akses dicabut oleh pengembang

> Perangkat yang UUID-nya tidak terdaftar tidak dapat menjalankan aplikasi dan program akan tertutup secara otomatis.

---

## Sistem Trial

- **Deadline global:** 23 Mei 2026 (berlaku untuk semua pengguna)
- **Durasi dinamis:** 14 hari sejak pertama kali membuka aplikasi
- Trial berakhir pada tanggal yang **lebih jauh** antara deadline global dan 14 hari dinamis
- Setelah trial berakhir, perangkat wajib terdaftar untuk melanjutkan penggunaan
- Manipulasi tanggal sistem akan terdeteksi dan akses akan ditolak

---


## Keamanan Data

LIBERO dirancang dengan prinsip perlindungan data klien:

- Data autosave disimpan dalam format terenkripsi menggunakan algoritma berbasis AES
- Fail kerja hanya dapat dibuka melalui aplikasi LIBERO
- Validasi perangkat berbasis Hardware ID (HWID) mencegah penggunaan di perangkat tidak sah
- Tidak ada data klien yang dikirim ke server eksternal; semua data diproses secara lokal
- Komunikasi dengan server hanya terjadi untuk keperluan verifikasi status aktivasi perangkat

---

## Build dari Source

**Prasyarat:**
- Python 3.11+ dengan virtual environment (`.venv`)
- Semua dependensi terinstall di `.venv`

**Langkah build:**

```powershell
# Jalankan dari root project
.\build_LIBERO.ps1
```

Script akan otomatis:
1. Membersihkan hasil build sebelumnya
2. Mengecek dan menginstall PyInstaller, pywebview, dan Pillow jika belum ada
3. Mengunduh WebView2 Bootstrapper jika belum ada di folder `archive\`
4. Memvalidasi semua file yang dibutuhkan
5. Menjalankan PyInstaller dengan konfigurasi lengkap
6. Membuka folder `dist\` jika build berhasil

**Dependensi utama:**

| Package | Kegunaan |
|---|---|
| pywebview | Render antarmuka HTML |
| Pillow | Pemrosesan gambar logo |
| python-docx | Generate dokumen `.docx` |
| selenium | Otomasi form TPP |
| webdriver-manager | Manajemen WebDriver otomatis |
| pycryptodome | Enkripsi data autosave |
| tkcalendar | Widget kalender tkinter |
| pywin32 | Integrasi Windows COM |
| lxml | Parsing XML/HTML |
| requests | HTTP request |

---

# Changelog
 
## v2.0.2
 
- Data Manager: kelola file kerja langsung dari dalam aplikasi
- Field teks memanjang otomatis mengikuti isi
- 9 tema baru: Grandma, Snake, Justin, Strauss, Brooks, Harbor, Car Call, Servant, Nastasic
- Penghapusan tema Queasy dan Vistuco
- Pembaruan palet tema 9 to 5 (Desert Dusk) dan More Relevant (Rainforest)
- Perbaikan mekanisme auto-update
- Tema diperbarui: Kilpin (menggantikan crimson-dark), Westfalen (menggantikan solar-flare)
- Kompatibilitas offline: Google Fonts dihapus dari launcher
- Perbaikan konsistensi warna tema di semua modul
- Litmas Anak: perbaikan fullscreen shortcut, field ganti rugi korban, riwayat pernikahan, Alm. di nama klien, TTD PNG, konfirmasi overwrite, dan berbagai perbaikan narasi dokumen
 

### v2.0.1
- Sistem auto-update via GitHub Releases
- Perbaikan stabilitas autosave
- Optimasi loading awal aplikasi

### v2.0.0
- Antarmuka berbasis WebView2 (HTML/CSS/JS)
- Sistem trial dengan deteksi manipulasi tanggal
- Registrasi perangkat berbasis HWID
- Tema tambahan (21 pilihan)
- Enkripsi fail kerja

### v1.0.0
- Rilis awal
- Litmas Integrasi dan Litmas Anak
- Kalkulasi asesmen RRI dan Kriminogenik otomatis
- Export dokumen `.docx`

---

## FAQ

**Apakah aplikasi ini bisa digunakan tanpa internet?**
Ya, setelah perangkat terdaftar dan disetujui. Internet hanya dibutuhkan saat registrasi awal dan verifikasi aktivasi.

**Apakah data litmas klien dikirim ke server?**
Tidak. Semua data diproses secara lokal di komputer pengguna. Server hanya menerima UUID perangkat untuk keperluan verifikasi aktivasi, bukan data klien.

**Apakah file litmas bisa dibuka di komputer lain?**
File `.docx` hasil export bisa dibuka di mana saja. Tapi file kerja `.lit` hanya bisa dibuka lewat aplikasi LIBERO di perangkat yang terdaftar.

**Apakah data autosave ikut terenkripsi?**
Ya, file autosave disimpan dalam format terenkripsi dan tidak bisa dibaca di luar aplikasi.

**Apakah aplikasi ini resmi dari Kementerian Imigrasi dan Pemasyarakatan/Direktorat Jenderal Pemasyarakatan?**
Tidak. LIBERO murni inisiatif mandiri dari pegawai yang ingin membantu menyederhanakan dan meringankan beban kerja harian. Saat ini aplikasi belum memiliki afiliasi resmi dengan Kementerian Imigrasi dan Pemasyarakatan maupun Direktorat Jenderal Pemasyarakatan, namun pengembang terbuka untuk kolaborasi lebih lanjut.

**Apakah LIBERO bisa dipakai di Windows 7 atau 8?**
Tidak. LIBERO membutuhkan Windows 10 atau 11 karena bergantung pada WebView2 Runtime yang tidak tersedia di versi Windows lebih lama.

**Kenapa ada pesan "Windows protected your PC" saat pertama dibuka?**
Karena LIBERO belum memiliki code signing certificate. Klik **More info** lalu **Run anyway** untuk tetap menjalankan aplikasi.

**Apakah LIBERO bisa digunakan offline sepenuhnya setelah aktivasi?**
Hampir sepenuhnya. Fitur yang tetap membutuhkan internet adalah registrasi TPP via Selenium dan pengecekan update otomatis.

**Berapa lama proses persetujuan registrasi?**
Tidak ada jaminan waktu pasti, tergantung ketersediaan pengembang. Biasanya diproses dalam 1x24 jam.

**Apakah LIBERO bisa diinstal di banyak komputer?**
Setiap perangkat membutuhkan registrasi tersendiri. Satu UUID hanya berlaku untuk satu perangkat.

**Bagaimana jika komputer diganti atau diformat?**
Lakukan pendaftaran ulang di perangkat baru melalui tombol **Daftar Perangkat** di launcher, lalu tunggu persetujuan pengembang.

---

## Troubleshooting

**Aplikasi tidak bisa dibuka / diblokir SmartScreen**
> Klik **More info** → **Run anyway**. Ini normal untuk exe tanpa code signing.

**WebView2 gagal diinstall**
> Download manual di: https://developer.microsoft.com/en-us/microsoft-edge/webview2/
> Pilih **Evergreen Bootstrapper**, jalankan, lalu buka LIBERO kembali.

**Muncul pesan "Perangkat ini tidak terdaftar"**
> Klik **Daftar Perangkat** di launcher dan isi formulir registrasi. Tunggu persetujuan pengembang.

**Muncul pesan "Masa trial telah berakhir"**
> Daftarkan perangkat terlebih dahulu. Setelah disetujui, akses penuh akan aktif kembali.

**Dokumen tidak berhasil dibuat**
> Pastikan semua field wajib sudah diisi. Field yang belum diisi ditandai merah **(BELUM DIISI)** pada dokumen hasil.

**Aplikasi lambat saat pertama dibuka**
> Normal, proses ekstraksi file dari dalam exe membutuhkan waktu beberapa detik pada pembukaan pertama.

**Autosave tidak berfungsi**
> Autosave berjalan setiap 10 detik setelah ada perubahan data. Pastikan aplikasi tidak ditutup paksa.

**Data hilang setelah aplikasi ditutup**
> Gunakan tombol **SIMPAN DATA** sebelum menutup, atau manfaatkan fitur autosave. Buka kembali file `.json` via tombol **LANJUTKAN DATA**.

---

## Lisensi Penggunaan

Aplikasi LIBERO didistribusikan sebagai perangkat lunak *proprietary* (hak milik).

Pengguna diperbolehkan menggunakan aplikasi ini untuk keperluan pekerjaan resmi Pembimbing Kemasyarakatan (PK) dan Asisten Pembimbing Kemasyarakatan (APK) di lingkungan Pemasyarakatan Republik Indonesia.

Dilarang keras:
- Memodifikasi, mengubah, atau membongkar kode aplikasi dalam bentuk apapun
- Mendistribusikan ulang aplikasi tanpa izin tertulis dari pemegang hak cipta
- Melakukan *reverse engineering* terhadap aplikasi
- Menggunakan aplikasi untuk keperluan di luar tugas kedinasan resmi
- Menyewakan atau memperjualbelikan aplikasi kepada pihak lain

Pelanggaran terhadap ketentuan ini dapat dikenakan sanksi sesuai Undang-Undang Nomor 28 Tahun 2014 tentang Hak Cipta dan peraturan perundang-undangan lain yang berlaku.

---

## Hak Cipta

Aplikasi ini dilindungi oleh Hak Kekayaan Intelektual Republik Indonesia.

| | |
|---|---|
| **Nomor Pencatatan** | EC00202514424 |
| **Pencipta** | Rinaldi Yudistira Nachrawy |
| **Pemegang Hak Cipta** | Rinaldi Yudistira Nachrawy |
| **Jenis Ciptaan** | Program Komputer |
| **Tanggal Pengumuman** | 1 April 2025, Kota Jambi |
| **Jangka Perlindungan** | 50 tahun sejak tanggal pengumuman |

*Dikeluarkan oleh Direktorat Jenderal Kekayaan Intelektual, Kementerian Hukum Republik Indonesia.*

---

*© 2025 Rinaldi Yudistira Nachrawy. Seluruh hak cipta dilindungi.*
