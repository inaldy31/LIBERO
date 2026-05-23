# Checklist Manual Test Setelah Refactor

Tanggal: 2026-05-23

Pakai checklist ini sebelum commit/push refactor besar. Centang hanya yang sudah
dicoba langsung di aplikasi.

## Startup Dan Navigasi

- [ ] Aplikasi bisa dibuka dari launcher tanpa blackscreen.
- [ ] Gate registrasi/lisensi tampil normal dan tidak mengubah token/lisensi.
- [ ] Masuk modul Integrasi tidak blackscreen.
- [ ] Masuk modul Litmas Anak tidak blackscreen.
- [ ] Pindah tab, sidebar, tombol kembali, dan tombol keluar tetap responsif.
- [ ] Lazy tab tidak membuat load hanya mengisi satu tab.

## Buku Panduan

- [ ] Buku Panduan dari Integrasi terbuka.
- [ ] Buku Panduan dari Litmas Anak terbuka.
- [ ] Navigasi halaman, zoom, dan tutup viewer berjalan normal.
- [ ] Tidak ada error `openUserGuidePage is not defined`.

## Save, Load, Dan Data Manager

- [ ] Isi data di beberapa tab Integrasi, simpan `.lit`, lalu muat ulang.
- [ ] Isi data di beberapa tab Litmas Anak, simpan `.lit`, lalu muat ulang.
- [ ] Data di tab yang belum aktif tetap ikut tersimpan dan termuat.
- [ ] Susunan keluarga tetap muncul setelah load.
- [ ] Riwayat pernikahan tetap muncul setelah load.
- [ ] Perkara list tetap muncul sebagai tabel/list, bukan JSON mentah.
- [ ] Muat ulang data tidak lambat berlebihan.
- [ ] Tombol Simpan, Lanjutkan, dan Selesaikan tetap memanggil alur yang benar.

## STOPPER PDF Dan Foto

- [ ] STOPPER PDF Integrasi membuka picker bersama.
- [ ] STOPPER PDF Litmas Anak membuka picker bersama.
- [ ] Tombol hapus/clear dokumen di picker tersedia dan berfungsi.
- [ ] Konfirmasi sebelum proses STOPPER muncul.
- [ ] Overlay loading hilang setelah proses sukses, gagal, atau dibatalkan.
- [ ] Modal review muncul setelah ekstraksi.
- [ ] Label model AI tampil sebagai "Model AI", bukan "Sumber AI".
- [ ] Heading section review seragam tanpa angka Romawi.
- [ ] `Perkara` dan `Pasal` tampil sebagai baris terpisah jika fieldnya berbeda.
- [ ] Nilai yang sudah sama dianggap valid/hijau tanpa harus dicentang manual.
- [ ] Centang sebagian field lalu apply hanya mengubah field yang dipilih.
- [ ] Cancel/tutup review tidak mengubah data.
- [ ] Data tabel seperti susunan keluarga, riwayat pernikahan, dan perkara tidak
  berubah menjadi JSON mentah.

## STOPPER Kronologi, Audio, Dan SIPP

- [ ] STOPPER kronologi punya konfirmasi sebelum generate/apply.
- [ ] Review kronologi menampilkan model AI.
- [ ] Apply/replace/append/cancel kronologi berjalan sesuai pilihan.
- [ ] Narasi kronologi menyebut waktu kejadian jika data waktunya tersedia.
- [ ] Audio ke kronologi masih bisa dipakai.
- [ ] Perbaikan narasi dari audio tidak menutup modal secara salah.
- [ ] Modal pencarian perkara menampilkan hasil jika server perkara tersedia.
- [ ] Jika server perkara down/timeout, UI menampilkan pesan gagal yang bisa
  dipahami dan tidak stuck di loading.

## Foto Dokumentasi

- [ ] Toggle lampiran dokumentasi aktif/nonaktif normal.
- [ ] Tambah foto Klien, Penjamin, dan Lainnya normal.
- [ ] Hapus baris foto normal.
- [ ] Ganti nama/keterangan foto normal.
- [ ] Upload foto menampilkan preview.
- [ ] Save/load tidak menggandakan baris foto.
- [ ] Export dokumen tetap memasukkan foto dokumentasi yang dipilih.

## Progress, Default Field, Dan Datepicker

- [ ] Progress berubah saat input, radio, checkbox, select, dan textarea diisi.
- [ ] Progress tidak berkedip/dobel listener secara mencolok.
- [ ] Pin/default field tetap ada setelah load.
- [ ] Datepicker muncul satu kali dan tidak dobel.
- [ ] Toast tidak dobel untuk satu event.

## Pendaftaran TPP

- [ ] Pendaftaran TPP Integrasi tidak menampilkan error `urllib3`.
- [ ] Pendaftaran TPP Litmas Anak tidak menampilkan error `urllib3`.
- [ ] Data TPP Integrasi yang dikirim masih sesuai field dewasa.
- [ ] Data TPP Litmas Anak yang dikirim masih sesuai field anak.

## Export Dokumen

- [ ] Generate dokumen Integrasi berhasil.
- [ ] Generate dokumen Litmas Anak berhasil.
- [ ] Tanda tangan, foto, tabel keluarga, dan riwayat pernikahan masuk ke output.
- [ ] Format tanggal, pasal, perkara, dan denda tidak rusak.

## Layout Dan Tema

- [ ] Tema default tampil normal.
- [ ] Tema gelap tampil normal.
- [ ] Cek viewport laptop sekitar 1366x768, tidak ada teks/tombol saling tindih.
- [ ] Modal STOPPER PDF, Data Manager, Buku Panduan, dan SIPP bisa discroll dan
  ditutup.

## Verifikasi Final Sebelum Commit

- [ ] `python -m py_compile src/launcher.py src/integrasi.py src/litmasanak.py src/common.py`
- [ ] `npm test -- --run`
- [ ] `python scripts/layout_tester.py`
- [ ] `git diff --check`
- [ ] Review `git status --short`: file split baru masuk staging, artifact lokal
  tidak ikut staging.
