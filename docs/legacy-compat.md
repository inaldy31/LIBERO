# Legacy Compatibility Inventory

Dokumen ini mencatat fallback/shim yang masih ada setelah modularisasi. Status
dipakai untuk mencegah penghapusan compat layer yang masih melindungi data lama.

## Sudah Dihapus / Dipusatkan

- `_showConfirm` duplikat di `views/integrasi.html` dan
  `assets/js/litmasanak-perkara.js`.
  - Status: removed.
  - Pengganti: `assets/js/dialog-system.js` sekarang mengekspos
    `window._showConfirm`.
  - Alasan: kontrak Python-injected confirm tetap ada, tapi shim tidak tersebar
    di tiap halaman.

## Keep

- `.lit` v0/v1 migration di `src/lit_contract.py`.
  - Status: keep.
  - Alasan: fixture legacy masih membuktikan file lama harus tetap kebaca.
  - Test: `tests/python/test_lit_contract.py`.

- Field alias backend/frontend di `src/schema.py` dan
  `assets/js/form-schema.js`.
  - Status: keep.
  - Alasan: data lama memakai campuran display key, snake_case, dan HTML id.
  - Test: `tests/python/test_schema_aliases.py` dan `tests/form-schema.test.js`.

- Alias DOCX di `src/docx_adapter.py`.
  - Status: keep.
  - Alasan: generator DOCX lama masih membaca beberapa key display seperti
    `Nama Klien`, `Program`, `Perkara`, dan `Pasal`.
  - Test: `tests/python/test_docx_adapter.py`.

- Legacy single korban/tanggapan normalization.
  - Status: keep.
  - Alasan: file lama bisa menyimpan satu korban/tanggapan, sementara UI baru
    memakai array multi-card.
  - Test: `tests/python/test_korban_tanggapan_normalize.py`.

- MarriageEntries alias dan legacy dropdown handling di
  `assets/js/marriage-entries.js`.
  - Status: keep.
  - Alasan: riwayat pernikahan lama punya variasi key TitleCase/snake_case dan
    nilai dropdown yang bisa tidak sinkron dengan storage.
  - Test: `tests/marriage-entries/*`.

- Stopper alias dan cleanup payload di `assets/js/stopper-field-apply.js` dan
  `src/launcher_stopper.py`.
  - Status: keep.
  - Alasan: output AI/Stopper tidak selalu stabil, dan `perkara_list`,
    riwayat pernikahan, serta susunan keluarga perlu toleransi alias.
  - Test: `tests/stopper-field-apply.test.js` dan
    `tests/marriage-entries/marriage-stopper-apply.test.js`.

- Runtime/platform fallback: token/trial fallback file, Tk registration
  fallback, file dialog legacy, update read fallback, guide fallback URL,
  BPS `curl_cffi` -> `requests`, logo/audio fallback.
  - Status: keep.
  - Alasan: ini bukan debt schema, tapi proteksi runtime Windows dan offline.

## Remove After Migration

- Flat `.lit` save format dengan display key ganda.
  - Status: remove after migration.
  - Syarat: schema `.lit` versi baru boleh nested/canonical-only, ada migrasi
    eksplisit, dan fixture v0-v2 tetap lulus.

- Legacy `Perkara`/`Pasal` scalar setelah `perkara_list` stabil.
  - Status: remove after migration.
  - Syarat: semua load/save/export sudah canonical-only dan ada fixture untuk
    file lama yang membuktikan migrasi satu arah.

- `f11-rekomendasi` alias lama di Litmas Anak.
  - Status: remove after migration.
  - Syarat: TPP/export lama tidak lagi membaca key tersebut.

- Duplicate file dialog legacy path di modul lama.
  - Status: remove after migration.
  - Syarat: semua caller sudah lewat helper `common.win_file_dialog`.

## Unknown / Perlu Audit Lanjutan

- Fallback yang hanya bersifat visual seperti font/logo fallback.
  - Status: unknown untuk penghapusan.
  - Catatan: aman dibiarkan karena blast radius kecil dan membantu mode offline.

- Beberapa fallback narasi khusus di `integrasi-runtime.js` dan
  `litmasanak-runtime.js`.
  - Status: unknown.
  - Catatan: butuh fixture narasi/TPP sebelum bisa dipangkas.
