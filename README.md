# LIBERO
**Litmas Berbasis Elektronik, Ringkas dan Optimal**

Dibuat oleh Rinaldi Yudistira Nachrawy

[![Hak Cipta](https://img.shields.io/badge/HKI-EC00202514424-gold?style=flat-square)](https://dgip.go.id)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%2F11-blue?style=flat-square&logo=windows)](https://github.com/inaldy31/LIBERO/releases/latest)
[![Versi](https://img.shields.io/badge/Versi-2.2.10-brightgreen?style=flat-square)](https://github.com/inaldy31/LIBERO/releases/latest)
[![Trial](https://img.shields.io/badge/Trial-14%20Hari-orange?style=flat-square)](https://github.com/inaldy31/LIBERO/releases/latest)
![GitHub release (latest)](https://img.shields.io/github/v/release/inaldy31/LIBERO?style=flat-square&label=Rilis+Terbaru)
[![Total Unduhan](https://img.shields.io/github/downloads/inaldy31/LIBERO/total?style=flat-square&label=Total%20Unduhan&logo=github&cacheSeconds=3600)](https://github.com/inaldy31/LIBERO/releases)

---

## Daftar Isi
- [LIBERO](#libero)
  - [Daftar Isi](#daftar-isi)
  - [Tentang Aplikasi](#tentang-aplikasi)
  - [Masalah yang Diselesaikan](#masalah-yang-diselesaikan)
  - [Fitur](#fitur)
  - [Screenshot](#screenshot)
  - [Persyaratan Sistem](#persyaratan-sistem)
  - [Instalasi \& Penggunaan](#instalasi--penggunaan)
  - [Registrasi Perangkat](#registrasi-perangkat)
  - [Sistem Trial](#sistem-trial)
  - [Keamanan Data](#keamanan-data)
- [Changelog](#changelog)
  - [v2.2.10](#v2210)
  - [v2.2.9](#v229)
  - [v2.2.8](#v228)
  - [v2.2.7](#v227)
  - [v2.2.6](#v226)
  - [v2.2.5](#v225)
  - [v2.2.4](#v224)
  - [v2.2.3](#v223)
  - [v2.2.2](#v222)
  - [v2.2.1](#v221)
  - [v2.2.0](#v220)
  - [v2.1.0](#v210)
  - [v2.0.6](#v206)
  - [v2.0.5](#v205)
  - [v2.0.4](#v204)
  - [v2.0.3](#v203)
  - [v2.0.2](#v202)
  - [v2.0.1](#v201)
  - [v2.0.0](#v200)
  - [v1.0.0](#v100)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)
- [Bantuan & Kontak](#bantuan--kontak)
- [Lisensi Penggunaan](#lisensi-penggunaan)
- [Hak Cipta](#hak-cipta)

---

## Tentang Aplikasi

**LIBERO** (Litmas Berbasis Elektronik, Ringkas dan Optimal) adalah aplikasi *desktop* mandiri berbasis Windows yang dirancang sebagai solusi teknis komprehensif bagi Pembimbing Kemasyarakatan (PK) dan Asisten Pembimbing Kemasyarakatan (APK) dalam menyusun Laporan Penelitian Kemasyarakatan (Litmas).

Aplikasi ini mengatasi tantangan efisiensi dan akurasi dalam alur kerja manual dengan menyediakan formulir isian terstruktur, kalkulasi otomatis asesmen Risiko Residivisme Indonesia (RRI) dan Kebutuhan Kriminogenik, serta fitur perangkaian data cerdas menjadi narasi laporan profesional yang diekspor ke format Microsoft Word (`.docx`).

Keamanan data rahasia klien dibantu melalui format fail kerja terlindungi dan validasi perangkat berbasis *Hardware ID* (HWID) untuk mencegah penggunaan ilegal.

---

## Masalah yang Diselesaikan

Dalam praktik penyusunan Litmas, sering ditemui:

- Penulisan laporan manual yang menyita waktu dan tenaga
- Risiko salah hitung pada asesmen RRI dan Kebutuhan Kriminogenik
- Format laporan yang tidak seragam antar petugas atau UPT
- Input data yang berulang untuk setiap laporan baru

LIBERO hadir untuk mengatasi hal tersebut dengan otomatisasi kalkulasi, standarisasi format, dan efisiensi alur kerja dari awal hingga ekspor dokumen.

---

## Fitur

- **Litmas Integrasi**: Penyusunan Litmas untuk Program Pembebasan Bersyarat dan Cuti Bersyarat (klien dewasa)
- **Litmas Anak**: Penyusunan Litmas untuk klien anak
- **Kalkulasi Asesmen Otomatis**: Skor RRI dan Kebutuhan Kriminogenik dihitung otomatis, bebas salah hitung
- **Narasi Otomatis**: Data dirangkai menjadi paragraf laporan yang profesional dan terstandar
- **Ekspor `.docx`**: Laporan final langsung siap pakai di Microsoft Word
- **Fail Kerja Terlindungi**: Simpan dan lanjutkan progres kapan saja; file `.lit` terlindungi dan hanya bisa dibuka lewat aplikasi
- **Templat Data Pribadi**: Buat satu file master berisi data UPT & petugas untuk mempercepat laporan baru
- **Registrasi TPP**: Pendaftaran otomatis ke Google Form TPP via Selenium
- **Stopper AI**: Asisten AI untuk membaca dokumen pendukung, merapikan kronologi, membantu pencarian perkara, dan menyusun rekomendasi wilayah yang dapat ditinjau sebelum diterapkan. Fitur yang memakai AI membutuhkan koneksi internet dan API Key pengguna
- **Fitur Pengingat Kolom Kosong**: Otomatis mendeteksi field yang belum diisi sebelum dokumen dibuat
- **Autosave**: Data tersimpan otomatis setiap 10 detik
- **21 Pilihan Tema**: Tampilan dapat dikustomisasi sesuai selera
- **Pintasan Keyboard**: SHIFT+F3 (ubah format huruf), Ctrl+Z/Y, Ctrl+±/scroll (zoom)
- **Auto-Update**: Notifikasi dan unduhan installer versi terbaru dari GitHub Releases *(baru di v2.0.1)*
- **Sistem Trial**: Berlaku 14 hari sejak pertama dibuka
- **Registrasi Perangkat**: Sistem aktivasi berbasis UUID perangkat (HWID)

---

## Screenshot

**Launcher & Splash Screen**

<table>
  <tr>
    <td><img src="docs/screenshots/Screenshot (23).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (24).png" width="280"/></td>
  </tr>
</table>

**Tampilan Form, Berbagai Tema**

<table>
  <tr>
    <td><img src="docs/screenshots/Screenshot (25).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (26).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (27).png" width="280"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/Screenshot (28).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (29).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (30).png" width="280"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/Screenshot (31).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (32).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (33).png" width="280"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/Screenshot (34).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (35).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (36).png" width="280"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/Screenshot (37).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (38).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (39).png" width="280"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/Screenshot (40).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (41).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (42).png" width="280"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/Screenshot (43).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (45).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (46).png" width="280"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/Screenshot (47).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (48).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (49).png" width="280"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/Screenshot (50).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (53).png" width="280"/></td>
    <td><img src="docs/screenshots/Screenshot (51).png" width="280"/></td>
  </tr>
</table>

---

## Persyaratan Sistem

| Komponen | Keterangan |
|---|---|
| OS | Windows 10 / 11 (64-bit) |
| WebView2 Runtime | Otomatis diinstal jika belum ada |
| Internet | Diperlukan untuk registrasi/verifikasi perangkat, auto-update, Registrasi TPP, Stopper AI, Ambil Data Wilayah, dan akses halaman online |
| RAM | Minimal 4 GB |
| Storage | Minimal 200 MB |

> **Catatan:** Python **tidak perlu** diinstal di PC target. Semua dependensi sudah dibundel di dalam paket instalasi.

---

## Instalasi & Penggunaan

1. Unduh installer `Setup_LIBERO_v<versi>.exe` dari GitHub Releases
2. Jalankan installer dan ikuti langkahnya
3. Buka LIBERO dari Start Menu atau shortcut Desktop
4. Jika WebView2 Runtime belum terinstall, akan muncul instalasi otomatis, tunggu hingga selesai
5. Pada pembukaan pertama, masa trial dimulai secara otomatis
6. Daftarkan perangkat via tombol **Daftar Perangkat** di launcher agar dapat terus digunakan setelah trial berakhir

> **Catatan pengguna lama:** Jika masih memakai `LIBERO.exe` (onefile), jalankan sekali untuk migrasi otomatis ke versi installer.
> **Panduan penggunaan:** Buku Panduan tersedia langsung di dalam aplikasi melalui tombol **Buku Panduan**.

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

- Masa trial berlangsung 14 hari sejak pertama kali membuka aplikasi
- Setelah trial berakhir, perangkat wajib terdaftar untuk melanjutkan penggunaan
- Manipulasi tanggal sistem akan terdeteksi dan akses akan ditolak

---


## Keamanan Data

LIBERO dirancang dengan prinsip perlindungan data klien:

- Data autosave disimpan dalam format terlindungi internal aplikasi
- Fail kerja disimpan dalam format terlindungi internal aplikasi dan hanya dapat dibuka melalui aplikasi LIBERO
- Validasi perangkat berbasis Hardware ID (HWID) mencegah penggunaan di perangkat tidak sah
- Pada fitur inti, data klien diproses secara lokal dan tidak dikirim ke server LIBERO
- Komunikasi dengan server LIBERO hanya terjadi untuk keperluan verifikasi status aktivasi perangkat
- Fitur online hanya mengirim data yang dipilih/diproses pengguna ke layanan terkait saat fitur tersebut dijalankan

---

# Changelog

## v2.2.10

- **Perbaikan pada loading halaman**: Mengurangi kemungkinan aplikasi tertahan di layar loading gelap.
- **Perbaikan pada perpindahan halaman**: Mengurangi risiko layar kosong atau aplikasi tertutup mendadak saat berpindah halaman.
- **Perbaikan pada sistem update**: Proses download dan pemasangan update dibuat lebih tertib saat beberapa jendela/modul sedang terbuka.
- **Perbaikan pada TPP Online**: Pengisian Google Form TPP dibuat lebih responsif dan bukti screenshot tetap tampil di aplikasi tanpa meninggalkan file sementara berisi data klien.
- **Perbaikan pada STOPPER**: Hasil baca dokumen, pencarian data, dan penerapan ke form dibuat lebih konsisten.
- **Perbaikan pada Litmas Anak**: Tampilan dan pengisian bagian pendidikan dibuat lebih stabil.
- **Perbaikan pada cache aplikasi**: File sementara dari WebView yang tidak terpakai kini dapat dibersihkan agar folder cache tidak menumpuk.
- **Perbaikan untuk kasus blank putih**: Menambahkan opsi `LIBERO_DISABLE_GPU=1` untuk perangkat tertentu yang sering mengalami layar putih.

## v2.2.9

- **Perbaikan bug**: Perbaikan bug dan peningkatan stabilitas aplikasi.

## v2.2.8

- **Perbaikan beberapa fitur**: Sejumlah bug pada Litmas Integrasi dan Litmas Anak diperbaiki agar pengisian form, penyimpanan, dan pembuatan dokumen berjalan lebih andal.
- **Penyempurnaan fitur STOPPER**: Alur pencarian perkara, pembacaan dokumen, dan penerapan hasil ke form dibuat lebih konsisten dan mudah digunakan.
- **Peningkatan performa**: Pemuatan halaman, perpindahan tab, dan proses simpan/ekspor dibuat lebih ringan sehingga aplikasi terasa lebih responsif.
- **Penyempurnaan tampilan**: Penyesuaian kecil pada layout launcher dan modul agar tampil lebih rapi di berbagai ukuran layar dan tema.
- **Stabilitas dan perbaikan minor**: Berbagai perbaikan kecil untuk meningkatkan kestabilan aplikasi secara keseluruhan.

## v2.2.7

- **Penambahan Buku Panduan**: Buku Panduan kini dapat dibuka langsung dari dalam aplikasi, lengkap dengan daftar isi, zoom, navigasi halaman, mode buku, dan mode satu halaman ke bawah.
- **STOPPER lebih siap dipakai**: Tombol STOPPER tetap tersedia di modul. Jika API Key belum diatur, aplikasi langsung menampilkan pengaturan STOPPER tanpa keluar dari modul kerja.
- **Pencarian perkara lebih adaptif**: STOPPER ditingkatkan agar pencarian perkara dan pengambilan kronologi lebih stabil saat sumber data memakai perlindungan anti-bot atau sedang lambat.
- **Review hasil STOPPER lebih rapi**: Tampilan hasil pembacaan dokumen dibuat lebih konsisten, mudah dibandingkan dengan data yang sudah ada, dan lebih aman sebelum diterapkan ke form.
- **Pengisian otomatis lebih konsisten**: Hasil pembacaan data klien, perkara, pasal, wilayah, penjamin, kronologi, dan dokumen pendukung dibuat lebih selaras antara Litmas Integrasi dan Litmas Anak.
- **Perbaikan tampilan launcher dan progress**: Splash, transisi masuk launcher, area progress, serta posisi tombol Buku Panduan dibuat lebih rapi dan mudah dilihat.
- **Layout launcher lebih responsif**: Tampilan launcher disesuaikan untuk berbagai ukuran layar dan Windows scaling, termasuk 900x600, 1024x768, 1366x768, 1536x864, dan 1920x1080, agar kartu menu, footer, dan copyright tidak terpotong atau terlalu kosong.
- **Layout modul lebih stabil di layar kecil**: Header modul, tanggal/jam, nama petugas, jabatan, sidenav, statusbar, dan area konten dibuat lebih aman di ukuran kecil tanpa scrollbar luar aplikasi.
- **Tema dan tombol modul diseragamkan**: Warna teks, sidenav, tombol STOPPER, dan tampilan tema terang/gelap disesuaikan agar lebih konsisten saat berpindah tema.
- **Layout tester ditambahkan**: Tersedia tool `scripts/layout_tester.bat` untuk mengecek tampilan Launcher, Litmas Integrasi, dan Litmas Anak pada ukuran layar simulasi sebelum rilis.
- **Peningkatan performa aplikasi**: Pemuatan halaman, perpindahan tab, progress, update, dan animasi dibuat lebih ringan agar form panjang tetap nyaman digunakan.
- **Penyesuaian akses TPP Online**: Fitur TPP Online hanya ditampilkan untuk pengguna/UPT yang memiliki akses.
- **Pembaruan dokumentasi dan aset rilis**: README, screenshot, panduan, dan aset pendukung disesuaikan dengan versi terbaru.

## v2.2.6

- **Review STOPPER sebelum menerapkan hasil**: Stopper Wilayah, PDF/foto, dan Kronologi kini menampilkan `Isi Saat Ini` sebagai pembanding sebelum data diterapkan ke form.
- **Stopper PDF/foto lebih transparan**: Hasil ekstraksi dokumen dapat menampilkan sumber file atau catatan sumber dari AI, termasuk dukungan metadata `__sources`.
- **Penerapan hasil lebih aman untuk data lama**: Field kosong ditampilkan sebagai `-`; pada Stopper PDF/foto, pilihan terapkan otomatis diprioritaskan untuk field yang masih kosong agar isi lama tidak mudah tertimpa.
- **Kronologi STOPPER tidak langsung overwrite**: Hasil perbaikan narasi dan audio kini dapat ditinjau lebih dulu, dengan pilihan ganti isi lama, tambahkan di bawah, atau batal.
- **BPS WebAPI lebih tahan gagal**: Pengambilan data wilayah mencoba domain kab/kota terlebih dahulu, fallback ke provinsi, dan menangani respons kosong/null dari API tanpa menghentikan proses.
- **Lazy tab lebih aman saat form aktif**: Sistem lazy tab kini menjaga fokus field, posisi scroll, dan posisi caret saat tab dimount ulang untuk progress, validasi, atau collect data.
- **Collect data tab tersembunyi lebih presisi**: Pembacaan data lintas tab dibatasi ke tab yang aktif sesuai jenis Litmas/program, sehingga data dari tab yang tidak relevan tidak ikut mengganggu hasil simpan atau validasi.
- **Form Orang Tua/Wali Litmas Anak diperbaiki**: Bagian riwayat pernikahan serta pekerjaan/ekonomi kini memisahkan alur Wali dan Orang Tua, sehingga field ayah, ibu, wali, penghasilan, dan pemberi nafkah tidak saling tercampur saat ditampilkan, disimpan, atau dimuat ulang.
- **Data korban Litmas Anak diperbaiki**: Sistem kartu korban kini lebih stabil untuk korban diri sendiri, perorangan/badan hukum, dan negara; minimal satu korban tetap terjaga, nama/kerugian korban tersinkron ke tanggapan pihak, dan uraian akibat korban/negara masuk lebih rapi ke dokumen.
- **Output dokumen lebih lengkap**: Nilai uang pengganti, variasi key jenis kelamin keluarga, dan uraian akibat korban/negara/klien sendiri lebih konsisten terbaca saat dokumen dibuat.
- **Field panjang lebih nyaman diisi**: Beberapa textarea seperti perkara dan kronologi otomatis menjaga ukuran serta posisi input agar tidak mengganggu pengetikan.
- **Input form lebih responsif**: Delay caret saat mengetik dikurangi dengan menunda kerja progress, autosave, dan sinkronisasi tanggapan korban sampai pengguna berhenti mengetik sejenak.
- **Splash launcher disesuaikan**: Urutan first paint, gate, dan garis splash diperhalus agar tampilan awal lebih konsisten sebelum masuk ke launcher.
- **Shutdown WebView2 lebih aman**: Proses penutupan aplikasi dipatch agar cleanup WebView2/WinForms lebih tahan error saat user menutup atau berpindah halaman.
- **Panduan penggunaan diperbarui**: Dokumen panduan penggunaan aplikasi ikut diperbarui di paket rilis.
- **Riwayat versi di launcher**: Launcher kini menyediakan tombol `Riwayat Versi` untuk melihat changelog lokal dan membuka halaman GitHub/GitHub Releases.
- **Auto update lebih halus**: Update dapat diunduh diam-diam di background, lalu menampilkan pilihan `Restart Sekarang` atau `Pasang Saat Dibuka Lagi` setelah installer siap.
- **Update lintas jendela lebih konsisten**: Launcher, Litmas Integrasi, dan Litmas Anak memakai state update bersama, sehingga progress download dan prompt pemasangan bisa tampil di jendela yang sedang aktif.
- **Toast update lebih stabil**: Toast restart di launcher, Integrasi, dan Litmas Anak diperbaiki agar tidak muncul berulang dari cache atau dari sistem toast umum.
- **Validasi rilis GitHub lebih aman**: State update lokal divalidasi ulang terhadap GitHub Releases. Jika tag/asset rilis sudah tidak tersedia, notifikasi update lama akan dibersihkan; jika hanya koneksi yang bermasalah, installer yang sudah siap tetap dipertahankan.
- **Retry download lebih ramah koneksi**: Kegagalan download menampilkan pemberitahuan ringan dan mencoba ulang dengan jeda bertahap.
- **FAQ koneksi internet, update, dan Stopper AI diperbarui**: README kini menjelaskan fitur offline/online, perilaku update, penyimpanan API Key AI, data Stopper AI, fail kerja, dan autosave.

## v2.2.5

- **Fitur baru: Ambil Data Wilayah**. Form Litmas Integrasi dan Litmas Anak kini dapat mengambil data wilayah dari alamat klien/penjamin, mencocokkan Provinsi, Kab/Kota, Kecamatan, sampai Desa/Kelurahan melalui Wilayah.id, lalu menyusun rekomendasi kondisi lingkungan sosial budaya dengan bantuan BPS WebAPI dan AI.
- **Pencocokan alamat wilayah lebih kuat**: Alamat tanpa koma seperti `Desa ... Kecamatan ... Kabupaten ... Provinsi ...` kini lebih tepat dibaca sampai level desa/kelurahan dan kecamatan, termasuk nama kecamatan yang mengandung kata `Kota`.
- **Preview Data Wilayah sebelum diterapkan**: Hasil wilayah, sumber data, status rekomendasi, dan Catatan AI ditampilkan di jendela preview terlebih dahulu sebelum pengguna memilih data yang akan diterapkan ke form.
- **Perbaikan lazy tab untuk progress dan Data TPP**: Progress ring di sidenav dan proses muat Data TPP sekarang memastikan tab tersembunyi sudah siap dibaca, sehingga data dari tab yang belum dibuka tidak terlewat.
- **Stopper AI PDF lebih aman untuk multi-tab**: Ekstraksi PDF memastikan seluruh tab form siap sebelum membaca field dan sebelum mengisi hasil AI, sehingga pengisian lintas tab tetap berjalan walaupun tab belum pernah dibuka.
- **Loading Stopper AI diperbarui**: Semua proses Stopper AI memakai loading yang seragam dengan ring progress, animasi logo breathe/pulse, dan label `STOPPER AI` tanpa tambahan nama proses.
- **Kursor saat loading diperbaiki**: Overlay loading tidak lagi membuat kursor Windows ikut berputar.
- **Stopper AI Kronologi Integrasi diperbaiki**: Nomor putusan/perkara dari pencarian perkara lebih konsisten terisi otomatis, termasuk saat mengambil kronologi dari hasil perkara.
- **Teks pencarian perkara dirapikan**: Label dan pesan pencarian dibuat lebih netral tanpa tambahan istilah yang tidak perlu.

## v2.2.4

- **Konsumsi RAM jauh lebih ringan**: Tab Litmas Integrasi dan Litmas Anak sekarang dibuka secara bertahap, sehingga aplikasi tidak langsung memuat seluruh form sekaligus dan penggunaan RAM menjadi lebih hemat.
- **Form lebih ringan dan tidak mudah lag**: Bagian form yang sedang tidak digunakan dapat dilepas sementara dari tampilan, sehingga aplikasi tetap lebih responsif saat mengisi Litmas yang panjang.
- **Data tetap aman saat disimpan atau diselesaikan**: Saat menyimpan, mengecek kolom kosong, atau membuat dokumen, semua tab tetap ikut dibaca meskipun sedang tidak terbuka.
- **Muat ulang form lebih rapi**: Tombol muat ulang sekarang lebih konsisten membersihkan isian, tetapi tetap menjaga field yang sudah dipin sebagai default.
- **Preview audio lebih ringan**: File audio di Data Manager sekarang bisa diputar dengan cara yang lebih ringan, terutama untuk file rekaman berukuran besar.
- **Installer diperbarui**: File pendukung untuk peningkatan performa sudah dimasukkan ke paket build dan installer.
- **Pembersihan memori lebih baik**: Aplikasi lebih aktif membersihkan memori setelah modul form tidak digunakan, sehingga pemakaian RAM lebih terkendali saat aplikasi dipakai lama.

## v2.2.3

- **Stopper AI pengisian dokumen lebih stabil**: Pemilihan dan pemrosesan dokumen pendukung diperbaiki, termasuk saat pengguna hanya memilih satu file.
- **Data keluarga dan pasangan lebih akurat**: Data dari Kartu Keluarga lebih baik terbaca, termasuk pengisian otomatis data suami/istri, status pernikahan, dan jenis kelamin klien.
- **Kronologi dari Stopper AI lebih lengkap**: Narasi kronologi kini lebih baik membaca pidana denda, subsider, dan bagian putusan lain yang sebelumnya bisa terlewat.
- **Pencarian perkara lebih kuat**: Pencarian data perkara dibuat lebih mudah menyesuaikan berbagai sumber, alamat situs, dan halaman yang memiliki proteksi.
- **Pemilih file diperbaiki**: Jendela pemilih file lebih stabil saat dipakai dari Litmas Integrasi maupun Litmas Anak.
- **Pesan error lebih jelas**: Jika pemilih file belum siap atau gagal dibuka, aplikasi memberi notifikasi yang lebih mudah dipahami.
- **Reset data TPP lebih bersih**: Data pendaftaran TPP, screenshot, tabel, dan input file ikut dibersihkan dengan benar saat form dimuat ulang.
- **AI lebih hati-hati membaca pasangan**: AI diperbaiki agar tidak keliru membaca kata BIN/BINTI sebagai data pasangan, dan lebih bisa membedakan pasangan klien dari pasangan penjamin.

## v2.2.2

- **Stopper AI Pencarian Perkara**: Aplikasi bisa membantu mencari dan mengambil data perkara klien secara otomatis dari sumber pengadilan melalui browser bawaan.
- **Stopper AI Audio-to-Chronology**: Rekaman wawancara atau file audio dapat diubah menjadi narasi kronologi tindak pidana yang lebih rapi.
- **Stopper AI Narrative-to-Chronology**: Catatan mentah, teks acak, atau draf bebas dapat dirapikan menjadi kronologi yang siap dipakai.
- **Proses audio besar lebih stabil**: Pengiriman data audio dibuat bertahap agar aplikasi tidak mudah berat atau crash saat memproses rekaman besar.
- **Autosave audio diperbaiki**: Data dan tautan file rekaman audio lebih aman tersimpan saat autosave berjalan.
- **Aplikasi lebih cepat dibuka**: Proses persiapan awal dibuat berjalan di latar belakang agar aplikasi terasa lebih cepat saat mulai digunakan.
- **Tampilan tombol Stopper dirapikan**: Tombol dan elemen Stopper dibuat lebih seragam dengan tema aplikasi.

## v2.2.1

- **Fitur Baru: Stopper AI Pencarian Perkara**. Kemampuan kecerdasan buatan untuk menelusuri dan mengekstrak data perkara klien secara otomatis langsung dari *database* pengadilan melalui WebView2 terintegrasi, dilengkapi dengan mekanisme *fallback bypass* untuk proteksi anti-bot Cloudflare.
- **Fitur Baru: Stopper AI Audio-to-Chronology**. Mengonversi rekaman suara atau file audio impor (hasil wawancara klien) secara otomatis menjadi teks narasi kronologi kejadian tindak pidana yang terstruktur menggunakan eksekusi AI multi-model.
- **Stabilitas & Performa Audio (Chunked IPC)**: Pembaruan sistem transfer memori untuk pemrosesan file audio berukuran raksasa guna mencegah *crash* (WebView2) dan lonjakan RAM (*RAM spike*).
- **Konsistensi Antarmuka (UI)**: Standarisasi desain seluruh varian tombol Stopper agar terintegrasi sempurna dengan variabel tema *glassmorphism* bawaan aplikasi.
- **Perbaikan Autosave**: Penyelesaian isu (*bug fix*) di mana data tautan rekaman audio sebelumnya terlewatkan saat siklus penyimpanan otomatis (*autosave*) berjalan.
- **Optimasi Startup**: Waktu muat awal aplikasi (*loading*) dipercepat secara masif melalui mekanisme *background preload* modul tersembunyi.

## v2.2.0

- **Fitur Baru: Stopper Partner (AI PDF Extractor)**. Menggunakan teknologi kecerdasan buatan (*Artificial Intelligence*) untuk membaca, mengekstrak, dan memproses dokumen PDF pendukung (seperti BAP, Putusan Pengadilan, BA-8, dll) secara otomatis. Data hasil ekstraksi kini akan disuntikkan secara cerdas langsung ke dalam *field* formulir Litmas Anda tanpa lewat ketik manual.
- Menyediakan fleksibilitas konfigurasi model AI secara agnostik (dapat mengakomodasi Google Gemini, Anthropic, maupun sistem OpenAI).

## v2.1.0

- Distribusi diganti ke installer (Setup_*.exe) untuk startup lebih cepat
- Auto-update sekarang mengunduh dan menjalankan installer
- Migrasi otomatis dari `LIBERO.exe` (onefile) lama ke installer
- Optimasi loading awal: patch HTML di background + cache
- Validasi perangkat dilakukan di background setelah launcher tampil


## v2.0.6

- Perbaikan logika asesmen Kebutuhan Kriminogenik: tidak lagi ditampilkan saat RRI rendah dan tidak ada jawaban "Ya" pada Bagian B, C, maupun D (berlaku di tabel dan bagian kesimpulan laporan asesmen)
- Perbaikan tampilan multi-perkara di halaman sampul Litmas Integrasi: pasal-pasal untuk perkara lebih dari satu kini ditampilkan dengan benar

## v2.0.5

- Fitur multi-perkara: satu klien dapat memiliki lebih dari satu perkara dan pasal (klik **+ Tambah Perkara**) di Litmas Integrasi dan Litmas Anak
- Fitur pin/tetapkan field: nilai di field tertentu dapat ditetapkan sebagai default untuk laporan berikutnya
- Perbaikan minor antarmuka dan narasi dokumen

## v2.0.4

- Perbaikan kritis tombol tema di kedua fitur
- Perbaikan beberapa bug paa fitur muat ulang
- Perbaikan grafik antarmuka (UI)
- Perbaikan antarmuka pada mode jendela
- Perbaikan bug dan penambahan efek suara
 
## v2.0.3

- Perbaikan antarmuka pada mode jendela
- Perbaikan bug dan penambahan efek suara

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
- Fail kerja terlindungi

### v1.0.0
- Rilis awal
- Litmas Integrasi dan Litmas Anak
- Kalkulasi asesmen RRI dan Kriminogenik otomatis
- Ekspor dokumen `.docx`

---

## FAQ

**Apakah aplikasi ini resmi dari Kementerian Imigrasi dan Pemasyarakatan/Direktorat Jenderal Pemasyarakatan?**<br>
LIBERO merupakan inisiatif mandiri yang dikembangkan untuk mendukung efisiensi kerja Pembimbing Kemasyarakatan. Aplikasi ini tidak berafiliasi secara resmi dengan Kementerian Imigrasi dan Pemasyarakatan maupun Direktorat Jenderal Pemasyarakatan, namun dirancang sesuai kebutuhan praktis di lapangan dan terbuka untuk kolaborasi lebih lanjut.

**Apakah LIBERO bisa dipakai di Windows 7 atau 8?**<br>
Tidak. LIBERO membutuhkan Windows 10 atau 11 karena bergantung pada WebView2 Runtime yang tidak tersedia di versi Windows lebih lama.

**Kenapa ada pesan "Windows protected your PC" saat pertama dibuka?**<br>
Karena LIBERO belum memiliki code signing certificate. Klik **More info** lalu **Run anyway** untuk tetap menjalankan aplikasi.

**Berapa lama proses persetujuan registrasi?**<br>
Tidak ada jaminan waktu pasti, tergantung ketersediaan pengembang. Biasanya diproses dalam 1x24 jam.

**Apakah LIBERO bisa diinstal di banyak komputer?**<br>
Setiap perangkat membutuhkan registrasi tersendiri. Satu UUID hanya berlaku untuk satu perangkat.

**Bagaimana jika komputer diganti atau diformat?**<br>
Lakukan pendaftaran ulang di perangkat baru melalui tombol **Daftar Perangkat** di launcher, lalu tunggu persetujuan pengembang.

**Apakah aplikasi ini bisa digunakan tanpa internet?**<br>
Ya, untuk pekerjaan utama seperti mengisi form, menyimpan/membuka fail kerja, autosave, validasi kolom kosong, dan membuat dokumen `.docx`, LIBERO dapat digunakan tanpa internet setelah perangkat terdaftar dan status aktivasi sudah valid. Namun beberapa fitur tambahan tetap membutuhkan koneksi internet.

**Fitur apa saja yang membutuhkan internet?**<br>
Fitur yang membutuhkan internet adalah pendaftaran perangkat dan verifikasi aktivasi saat diperlukan, auto-update dari GitHub Releases, Registrasi TPP via Google Form/Selenium, serta Stopper AI. Di dalam Stopper AI, koneksi internet dipakai untuk layanan AI, pencarian perkara/sumber online, dan Ambil Data Wilayah yang memakai Wilayah.id serta BPS WebAPI. Membuka GitHub, panduan online, atau halaman rilis juga membutuhkan internet.

**Kenapa update sudah diunduh tetapi belum langsung terpasang?**<br>
LIBERO tidak langsung memasang update agar pekerjaan pengguna tidak terputus. Setelah installer siap, pengguna dapat memilih `Restart Sekarang` untuk memasang saat itu juga atau `Pasang Saat Dibuka Lagi` agar pemasangan dilakukan pada pembukaan LIBERO berikutnya.

**Apa arti Pasang Saat Dibuka Lagi?**<br>
Jika pilihan ini digunakan, LIBERO tidak langsung menutup aplikasi. Saat pengguna membuka LIBERO berikutnya, installer update akan dijalankan terlebih dahulu sebelum masuk ke splash atau launcher.

**Apa yang terjadi jika koneksi terputus saat update?**<br>
Unduhan akan ditandai tertunda, progress disembunyikan, dan LIBERO menampilkan pemberitahuan ringan bahwa pembaruan akan dicoba lagi otomatis. Jika aplikasi ditutup lalu dibuka kembali, LIBERO akan mengecek rilis terbaru lagi.

**Apakah download update dilanjutkan dari persen terakhir jika gagal?**<br>
Tidak. Jika unduhan gagal atau terputus, LIBERO akan mengunduh ulang installer dari awal. Ukuran installer relatif kecil, sehingga cara ini lebih sederhana dan lebih aman daripada menyimpan potongan file unduhan.

**Apa itu Stopper AI?**<br>
Stopper AI adalah kumpulan fitur bantuan berbasis AI di LIBERO untuk mempercepat pekerjaan yang biasanya memakan waktu, seperti membaca dokumen pendukung PDF/foto, merapikan kronologi dari teks atau audio, membantu pencarian data perkara, dan Ambil Data Wilayah untuk menyusun rekomendasi lingkungan/wilayah. Hasil Stopper AI tetap ditampilkan untuk ditinjau terlebih dahulu sebelum diterapkan ke form.

**Bagaimana cara memasang atau mengaktifkan Stopper AI?**<br>
Stopper AI tidak perlu installer terpisah karena sudah menjadi bagian dari LIBERO. Pastikan LIBERO terpasang dari installer terbaru, buka **Pengaturan**, lalu isi API Key AI yang didukung. Setelah itu fitur Stopper AI dapat dipakai dari tombol STOPPER/AI di form Litmas Integrasi atau Litmas Anak.

**Apakah Stopper AI bisa digunakan tanpa API Key AI?**<br>
Tidak untuk proses yang benar-benar membutuhkan AI, seperti ekstraksi dokumen, perbaikan kronologi, transkripsi audio, atau rekomendasi naratif. Beberapa fitur non-AI tetap berjalan, tetapi tombol Stopper AI akan meminta API Key jika prosesnya membutuhkan layanan AI.

**Di mana API Key AI disimpan?**<br>
API Key AI disimpan secara lokal di perangkat pengguna pada berkas pengaturan aplikasi LIBERO. Penyimpanan ini bertujuan agar pengguna tidak perlu memasukkan API Key berulang kali. API Key tidak dikirim ke server LIBERO, tetapi akan digunakan untuk menghubungi penyedia layanan AI saat fitur Stopper AI dijalankan.

**Apakah hasil Stopper AI langsung mengganti isi form?**<br>
Tidak. Hasil Stopper AI ditampilkan dalam jendela pratinjau terlebih dahulu. Pengguna bisa membandingkan `Isi Saat Ini` dengan hasil AI, memilih field yang ingin diterapkan, atau membatalkan jika hasilnya belum sesuai.

**Apakah dokumen, foto, teks, atau audio yang dipilih untuk Stopper AI dikirim keluar?**<br>
Ya, hanya saat pengguna menjalankan fitur Stopper AI yang membutuhkan layanan AI. Dokumen PDF/foto, teks, atau audio yang dipilih pengguna dapat dikirim ke penyedia AI sesuai API Key yang digunakan. Data tersebut tidak dikirim ke server LIBERO.

**Apakah dokumen yang diproses Stopper AI otomatis dihapus?**<br>
Di sisi LIBERO, dokumen asli tetap berada di perangkat pengguna dan tidak disimpan ke server LIBERO. LIBERO hanya menggunakan dokumen tersebut saat proses Stopper AI berjalan. Setelah data dikirim ke layanan AI, pengelolaannya berada di luar server LIBERO.

**Apakah data litmas klien dikirim ke server LIBERO?**<br>
Tidak. Server LIBERO hanya dipakai untuk verifikasi perangkat/aktivasi dan tidak menerima database litmas pengguna. Data form, autosave, fail kerja, serta dokumen yang dipilih untuk Stopper AI tidak disimpan ke server LIBERO.

**Apa bedanya fail kerja dan dokumen Word hasil ekspor?**<br>
Fail kerja `.lit` digunakan untuk menyimpan pekerjaan agar dapat dibuka dan dilanjutkan kembali di LIBERO. Dokumen Word `.docx` adalah hasil laporan yang dapat dibuka, diedit, dicetak, atau dibagikan melalui Microsoft Word.

**Apakah file litmas bisa dibuka di komputer lain?**<br>
File `.docx` hasil ekspor bisa dibuka di mana saja. Namun fail kerja `.lit` hanya bisa dibuka melalui aplikasi LIBERO di perangkat yang terdaftar.

**Apakah data autosave bisa dibaca di luar aplikasi?**<br>
Tidak secara normal. Autosave disimpan dalam format terlindungi internal aplikasi dan digunakan untuk memulihkan pekerjaan saat modul dibuka kembali.

**Bagaimana cara kerja autosave?**<br>
Autosave berjalan otomatis saat pengguna mengisi form Litmas Integrasi atau Litmas Anak. Jika aplikasi tertutup sebelum data disimpan manual, LIBERO dapat menawarkan pemulihan data autosave saat modul dibuka kembali. Autosave akan dibersihkan setelah data berhasil disimpan, form dikosongkan, atau pengguna memilih untuk membuang autosave.

---

## Troubleshooting

**Aplikasi tidak bisa dibuka / diblokir SmartScreen**
> Klik **More info** lalu **Run anyway**. Ini normal untuk aplikasi yang belum memiliki code signing certificate.

**WebView2 gagal diinstal**
> Unduh manual di: https://developer.microsoft.com/en-us/microsoft-edge/webview2/
> Pilih **Evergreen Bootstrapper**, jalankan, lalu buka LIBERO kembali.

**Muncul pesan "Perangkat ini tidak terdaftar"**
> Klik **Daftar Perangkat** di launcher dan isi formulir registrasi. Tunggu persetujuan pengembang.

**Muncul pesan "Masa trial telah berakhir"**
> Daftarkan perangkat terlebih dahulu. Setelah disetujui, akses penuh akan aktif kembali.

**Update sudah terunduh tetapi belum terpasang**
> Pilih **Restart Sekarang** untuk memasang update saat itu juga, atau pilih **Pasang Saat Dibuka Lagi** agar installer dijalankan saat LIBERO dibuka berikutnya.

**Update tertunda karena koneksi internet**
> Pastikan koneksi internet aktif. LIBERO akan mencoba mengunduh pembaruan lagi secara otomatis dengan jeda bertahap.

**Stopper AI tidak muncul atau tidak bisa digunakan**
> Buka **Pengaturan** dan pastikan API Key AI sudah diisi. Beberapa proses Stopper AI membutuhkan koneksi internet dan API Key yang masih aktif.

**Stopper AI gagal memproses dokumen, foto, teks, atau audio**
> Periksa koneksi internet, API Key, kuota/rate limit penyedia AI, serta ukuran dan format file yang dipilih. Coba ulang beberapa saat kemudian jika layanan AI sedang sibuk.

**Dokumen tidak berhasil dibuat**
> Pastikan semua field wajib sudah diisi. Field yang belum diisi ditandai merah **(BELUM DIISI)** pada dokumen hasil.

**Fail kerja tidak bisa dibuka**
> Pastikan file yang dibuka adalah fail kerja `.lit` dan dibuka melalui aplikasi LIBERO di perangkat yang terdaftar.

**Aplikasi lambat saat pertama dibuka**
> Tunggu beberapa saat, terutama jika WebView2 baru dipasang atau LIBERO sedang memeriksa update. Jika masih memakai `LIBERO.exe` versi lama, gunakan installer terbaru.

**Autosave tidak berfungsi**
> Autosave berjalan setiap 10 detik setelah ada perubahan data. Pastikan aplikasi tidak ditutup paksa.

**Data hilang setelah aplikasi ditutup**
> Gunakan tombol **SIMPAN DATA** sebelum menutup, atau manfaatkan fitur autosave. Buka kembali fail kerja `.lit` melalui tombol **LANJUTKAN DATA**.

---

## Bantuan & Kontak

Untuk bantuan registrasi, laporan bug, atau permintaan fitur, gunakan halaman [GitHub Issues](https://github.com/inaldy31/LIBERO/issues).

Saat melaporkan masalah, sertakan versi LIBERO, versi Windows, langkah yang dilakukan, serta screenshot atau pesan error jika ada.

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
