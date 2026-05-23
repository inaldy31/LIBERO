# Adapter Export DOCX

`src/docx_adapter.py` menjadi lapisan ringan antara payload `.lit` yang sudah
dinormalisasi dan generator DOCX di `src/integrasi.py` serta
`src/litmasanak.py`.

Aturan kontrak:

- Input tetap payload flat `.lit` lama/baru.
- Adapter selalu menjalankan `normalize_lit_data()` lebih dulu.
- Adapter menambahkan alias DOCX penting seperti `Nama Klien`, `Program`,
  `Perkara`, `Pasal`, penjamin/wali, `daftar_korban`, dan
  `daftar_tanggapan`.
- Adapter tidak menghapus key unknown agar kompatibilitas save lama tetap aman.
- Placeholder `(BELUM DIISI)` hanya diberikan untuk field wajib DOCX yang
  memang tidak punya nilai bermakna.

Fixture export minimal ada di `tests/fixtures/docx/` dan diuji lewat
`tests/python/test_docx_adapter.py`. Test ini tidak membuka Word; cukup
memastikan struktur data yang masuk ke generator stabil dan audit placeholder
tidak menandai field yang sebenarnya sudah terisi.
