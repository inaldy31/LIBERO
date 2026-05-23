# Logging STOPPER

STOPPER memakai format log bertahap agar troubleshooting lebih mudah:

- Backend: `[stopper][extract.start]`, `[stopper][extract.fields]`,
  `[stopper][extract.done]`, `[stopper][extract.warning]`, dan
  `[stopper][extract.error]`.
- SIPP: `[SIPP][discover.*]` untuk Google/DuckDuckGo dan kandidat URL,
  `[SIPP][probe.*]` untuk cek situs kandidat, `[SIPP][endpoint.*]` untuk
  pencarian perkara, dan `[SIPP][search.*]` untuk keputusan akhir termasuk
  kapan perlu browser verifikasi.
- SIPP browser: `[SIPP][selenium.*]` untuk browser otomatis yang membuka SIPP,
  fallback Google, dan hasil scrape setelah verifikasi.
- Frontend apply/review: `[Stopper][review]` dan `[Stopper][apply]`.

Log normal hanya menampilkan ringkasan dan warning penting. Detail mentah seperti
preview respons AI, sample keluarga, dan sample `perkara_list` hanya aktif saat
debug:

Di launcher, log runtime ditulis ke `%APPDATA%\LIBERO\logs\libero.log`.

- Backend: set environment variable `LIBERO_STOPPER_DEBUG=1`.
- Frontend: set `window.LIBERO_STOPPER_DEBUG = true` atau
  `localStorage.setItem('libero.stopper.debug', '1')`.

Statistik apply frontend tersedia dari
`LStopperFieldApply.applyReviewedPayload(payload)` dengan bentuk:

- `selected`: jumlah key yang diproses dari payload review.
- `filled`: jumlah isian yang berhasil diterapkan.
- `applied`: daftar field yang diterapkan.
- `skipped`: daftar field yang dilewati dan alasannya.
- `warnings`: subset `skipped` yang perlu diperiksa, seperti array tidak dikenal
  atau field tidak ditemukan.
