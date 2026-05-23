# Audit Refactor 2 Hari Terakhir

Tanggal audit terakhir: 2026-05-23

Dokumen ini mencatat hasil audit sementara atas pecahan file Python, JS, CSS,
dan HTML setelah refactor. Tujuannya supaya patch berikutnya tidak loncat-loncat
dan bisa disetujui dulu sebelum runtime diubah lagi.

## Cek Yang Sudah Jalan

- Syntax Python `src/*.py`: lolos.
- Syntax semua JS di `assets/js/*.js`: lolos.
- `npm test`: lolos, 17 file test dan 83 test.
- Referensi `<script src="...">` di HTML: tidak ada file yang hilang.
- Referensi `<link href="...">` di HTML: tidak ada file yang hilang.
- Build script dan `LIBERO.spec`: sudah memasukkan folder `assets/js`,
  `assets/css`, dan `assets/vendor`.

## Status Patch

- 2026-05-22: `guide-viewer.js` sudah ditambahkan ke `views/integrasi.html`
  dan `views/litmasanak.html`.
- 2026-05-22: Mojibake di `src/common.py` sudah diganti ke karakter ASCII
  aman.
- 2026-05-22: Trailing whitespace yang terdeteksi `git diff --check` sudah
  dibersihkan.
- 2026-05-23: Jalur backend pendaftaran TPP Integrasi dan Litmas Anak sudah
  disamakan memakai helper bersama `common.submit_tpp_registration` dan
  `common.fill_google_form`.
- 2026-05-23: Patch kompatibilitas `urllib3.BaseHTTPResponse` sekarang aktif
  saat `common.py` diimport, bukan hanya saat fungsi TPP/Selenium dipanggil.
- 2026-05-23: `stopper-doc-picker.js` sudah di-load di Integrasi dan Litmas
  Anak. Kedua modul STOPPER PDF sekarang memakai picker bersama jika tersedia,
  dan modal review bersama dari `stopper-pdf-review.js`.
- 2026-05-23: Fallback apply lama di STOPPER PDF sekarang dibuat fail-fast
  bila `LStopperFieldApply` tidak tersedia, supaya jalur lama tidak mengisi
  tabel/list dengan logika yang sudah tidak sinkron.
- 2026-05-23: `collect-runtime.js` sudah ditambahkan ke Litmas Anak agar
  wrapper collect/load semua tab sejajar dengan Integrasi sebelum `lazy-tabs`
  membungkus alur load/reset.
- 2026-05-23: `data-manager-actions.js` sudah di-load di Integrasi dan Litmas
  Anak setelah `collect-runtime.js`, sehingga tombol Simpan, Lanjutkan, dan
  Selesaikan memakai helper bersama sebelum `lazy-tabs` dipasang.
- 2026-05-23: `data-manager.css` sudah di-load di Integrasi dan Litmas Anak.
- 2026-05-23: `toast-system.js`, `field-defaults.js`, dan `datepicker.js`
  sudah di-load di kedua modul form. `toast-system.js` dan `datepicker.js`
  diberi guard agar tidak membuat toast/popup tanggal dobel jika runtime lama
  sudah aktif. `field-defaults.js` menjaga isi pin default yang sudah dimuat
  runtime agar tidak reset saat file split ikut dimuat.
- 2026-05-23: `kronologi-ui.js` sudah di-load di Integrasi dan Litmas Anak.
  Helper ini tetap memakai fungsi backend/runtime lama untuk audio, narasi, dan
  SIPP, tetapi UI review kronologi sekarang berasal dari file split.
- 2026-05-23: `progress-ui.js` sudah di-load sebelum runtime utama di Integrasi
  dan Litmas Anak. Body progress lama di runtime sudah dihapus; update progress,
  schedule, dan listener input/change sekarang berasal dari file split.
- 2026-05-23: `photo-docs.js` sudah di-load sebelum runtime di Integrasi dan
  Litmas Anak. Handler tambah/hapus/pilih foto lama di runtime sudah dihapus;
  collect/load tetap membaca state global `window._dokState` dan
  `window._dokRowId`.
- 2026-05-23: Load/reset dokumentasi foto sekarang mengosongkan state, DOM row,
  dan row id sebelum restore, supaya muat ulang data tidak menggandakan foto.
- 2026-05-23: Checklist QA manual sementara di `docs/manual-test-checklist.md`
  sudah dihapus setelah hasil manual test dipindahkan ke audit ini.
- 2026-05-23: Checklist QA manual final dibuat ulang di
  `docs/manual-test-checklist.md` untuk dipakai sebelum commit/push.
- 2026-05-23: Fallback modal lokal STOPPER PDF di
  `integrasi-stopper-pdf.js` dan `litmasanak-stopper-pdf.js` sudah dihapus.
  Keduanya sekarang wajib memakai `window._showStopperPdfReview` dari
  `stopper-pdf-review.js`.

## Temuan Utama

### 1. Buku Panduan Berisiko Error Di Modul Form

Tombol `openUserGuidePage()` ada di:

- `views/integrasi.html`
- `views/litmasanak.html`

Fungsi tersebut didefinisikan di:

- `assets/js/guide-viewer.js`
- `assets/js/launcher-view.js`

Namun `guide-viewer.js` belum di-include di `views/integrasi.html` dan
`views/litmasanak.html`. Dampaknya: tombol Buku Panduan di modul form berisiko
memunculkan error `openUserGuidePage is not defined`.

Status:

- Sudah dipatch dengan menambahkan `assets/js/guide-viewer.js` di kedua modul.
- QA manual Integrasi dan Litmas Anak dilaporkan aman.

### 2. File Split Ada Tapi Belum Dipakai Langsung

Beberapa file hasil split sebelumnya belum di-include langsung oleh HTML.
Status sekarang:

- Sudah di-load: `assets/js/field-defaults.js`, `assets/js/kronologi-ui.js`,
  `assets/js/toast-system.js`, `assets/js/datepicker.js`,
  `assets/js/photo-docs.js`, `assets/js/progress-ui.js`,
  `assets/css/data-manager.css`.
- Tidak ada file split utama di daftar audit ini yang masih sengaja belum
  di-load.

Duplikasi runtime utama sudah diperkecil untuk dua helper besar:

- `photo-docs.js`: handler tambah/hapus/pilih foto ada di file split.
  Runtime hanya menyisakan collect/load dokumentasi.
- `progress-ui.js`: `updateProgress`, `scheduleProgressUpdate`, dan
  `updateProgressNow` ada di file split. Runtime tetap menyimpan helper
  tab/accordion lama yang masih dipakai oleh flow load.

Status:

- Selesai untuk target audit ini.

### 3. STOPPER PDF Sudah Satu Jalur Modal

Ada picker umum:

- `assets/js/stopper-doc-picker.js`

Status:

- `stopper-doc-picker.js` sudah di-include di `views/integrasi.html` dan
  `views/litmasanak.html`.
- `integrasi-stopper-pdf.js` dan `litmasanak-stopper-pdf.js` memakai picker
  bersama kalau `window.LStopperDocPicker` tersedia.
- Modal review lokal sudah dihapus dari `integrasi-stopper-pdf.js` dan
  `litmasanak-stopper-pdf.js`.
- Apply hasil review wajib melalui `LStopperFieldApply`.
- Jika `stopper-pdf-review.js` gagal dimuat, runtime menampilkan error yang
  jelas dan memaksa overlay loading hilang.

Status:

- Selesai untuk target audit ini.

### 4. Mojibake Di `src/common.py`

Ada karakter encoding rusak di sekitar `src/common.py:1091`:

```py
if prev_char in ",.;:)]鈥\x9d禄" and next_char.isalnum():
```

Seharusnya daftar karakter penutup seperti tanda kutip kanan dan guillemet.
Dampaknya kecil, tetapi bisa memengaruhi spasi pada output DOCX setelah tanda
baca tertentu.

Status:

- Sudah diganti ke karakter ASCII aman.

### 5. `git diff --check` Masih Merah

Trailing whitespace terdeteksi di:

- `src/launcher.py:3094`
- `views/integrasi.html:5956`

Status:

- Sudah dibersihkan. `git diff --check` sekarang tidak melaporkan error
  whitespace, hanya warning LF/CRLF dari Git.

### 6. Banyak File Baru Masih Untracked

Refactor memecah banyak file baru di:

- `assets/js/`
- `assets/css/`
- `src/launcher_*.py`
- `src/common.py`
- `src/normalize.py`
- `src/schema.py`
- `tests/`

Dampaknya: kalau commit/push tidak memasukkan file baru, aplikasi bisa jalan di
mesin lokal tetapi rusak di clone/build lain.

Rekomendasi patch:

- Daftar file wajib commit sudah dibuat di bawah.
- Pastikan file build dan runtime yang direferensikan masuk semua saat staging.

### 7. Pendaftaran TPP Integrasi Dan Litmas Anak

Sebelum patch, alur backend berbeda:

- Integrasi memakai `common.submit_tpp_registration` dan `common.fill_google_form`.
- Litmas Anak masih punya implementasi Selenium TPP sendiri di `litmasanak.py`.

Error yang muncul:

```text
module 'urllib3' has no attribute 'BaseHTTPResponse'
```

Kemungkinan sumbernya adalah kompatibilitas Selenium dengan `urllib3` versi
lama. Helper `ensure_urllib3_base_http_response()` sudah ada, tetapi sebelumnya
lebih sering aktif saat fungsi Selenium dipanggil.

Status:

- Litmas Anak sudah disamakan ke helper TPP bersama.
- `common.py` sekarang memastikan alias `urllib3.BaseHTTPResponse` sejak import.
- Syntax check untuk `src/common.py`, `src/litmasanak.py`, `src/integrasi.py`,
  dan `src/launcher_form_bridge.py` sudah lolos.

Perbedaan yang masih wajar:

- `mapDataForTPP()` Integrasi dan Litmas Anak tetap beda di frontend karena data
  sidang anak punya field tambahan, seperti `Hal Yang Meringankan` dan
  `Hal Yang Memberatkan`.
- Teks peringatan tombol juga beda: Integrasi memakai "Muat & Tampilkan Data
  TPP", Litmas Anak memakai "Buat & Tampilkan Data TPP".

## Daftar File Wajib Commit

Wajib masuk commit karena direferensikan runtime/build:

- `AGENTS.md`, `CLAUDE.md`, `tasks.md`.
- `package.json`, `package-lock.json`, `vitest.config.js`,
  `vitest.config.mjs`, dan folder `tests/`.
- `assets/js/` hasil split, terutama `progress-ui.js`, `photo-docs.js`,
  `stopper-pdf-review.js`, `stopper-doc-picker.js`,
  `stopper-field-apply.js`, `integrasi-runtime.js`,
  `integrasi-stopper-pdf.js`, `litmasanak-runtime.js`, dan
  `litmasanak-stopper-pdf.js`.
- `assets/css/` hasil split, termasuk `data-manager.css`,
  `dialog-system.css`, `toast-system.css`, `guide-viewer.css`,
  `integrasi.css`, `litmasanak.css`, dan theme CSS.
- `assets/vendor/` yang dipakai PDF guide/viewer.
- `src/common.py`, `src/docx_adapter.py`, `src/lit_contract.py`,
  `src/normalize.py`, `src/schema.py`, dan semua `src/launcher_*.py`.
- File workflow utama yang berubah: `src/launcher.py`, `src/integrasi.py`,
  `src/litmasanak.py`.
- `views/integrasi.html`, `views/litmasanak.html`,
  `views/launcher_view.html`, dan `views/registrasi.html`.
- Build dan dokumen pendukung: `LIBERO.spec`, `requirements.txt`,
  `scripts/build_LIBERO.ps1`, `scripts/layout_tester.py`,
  `scripts/layout_tester.bat`, `scripts/test_bps.py`, `README.md`, dan
  folder `docs/` yang masih dipakai.

Jangan ikutkan sebagai file wajib commit kecuali memang sengaja:

- `.pycache_tmp/`, `__pycache__/`, `scratch/`, artifact lokal, dan token lokal.
- Perubahan screenshot lama di `assets/screenshots/` perlu dicek manual:
  commit hanya kalau memang mau mengganti dokumentasi gambar.

## Keputusan Sebelum Staging

- Banyak deletion `.pycache_tmp/` masih muncul di `git status`. Ini bukan file
  runtime; jangan stage kecuali memang ingin membersihkan file cache yang
  terlanjur tracked.
- `token-savior` muncul sebagai deletion. Jangan stage sebelum dipastikan itu
  bukan token/helper lokal yang masih dibutuhkan.
- Deletion `assets/screenshots/Screenshot (...).png` jangan stage kecuali
  README/dokumentasi memang sudah pindah ke screenshot baru di `docs/screenshots/`.
- `docs/manual-test-checklist.md` sekarang wajib dicek manual dulu sebelum
  commit final karena isinya menggantikan checklist sementara yang sempat
  dihapus.

## Urutan Patch Berikutnya

1. Jalankan `docs/manual-test-checklist.md`.
2. Jalankan verifikasi final: syntax Python, syntax JS, `npm test`,
   `git diff --check`, dan layout tester.
3. Review `git status --short` untuk memastikan file split baru tidak
   tertinggal.
4. Setelah disetujui, stage daftar file wajib commit dan lanjut commit/push.

## Catatan Batasan

- Patch runtime berikutnya sebaiknya hanya untuk bug hasil QA final, bukan
  refactor besar baru.
- Jangan restore massal karena working tree sedang berisi banyak perubahan.
- Jangan hapus file split hanya karena belum di-include; beberapa mungkin
  sengaja disiapkan untuk tahap refactor berikutnya.
