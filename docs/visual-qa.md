# Visual QA

Smoke layout headless dijalankan dengan:

```powershell
python scripts\layout_tester.py --smoke
```

Output screenshot:

- `scratch/layout-tester/screenshots/launcher_1366x768.png`
- `scratch/layout-tester/screenshots/launcher_390x844.png`
- `scratch/layout-tester/screenshots/integrasi_1366x768.png`
- `scratch/layout-tester/screenshots/integrasi_390x844.png`
- `scratch/layout-tester/screenshots/litmas_anak_1366x768.png`
- `scratch/layout-tester/screenshots/litmas_anak_390x844.png`
- `scratch/layout-tester/screenshots/integrasi_data_manager_1366x768.png`
- `scratch/layout-tester/screenshots/integrasi_stopper_review_1366x768.png`

Hasil sementara:

- Launcher desktop terlihat utuh.
- Integrasi dan Litmas Anak desktop sudah melewati splash dan menampilkan form
  utama.
- Data Manager Integrasi bisa dibuka otomatis dengan fixture smoke dan modalnya
  tampil utuh pada 1366x768.
- Modal Stopper review Integrasi bisa dibuka otomatis dengan fixture smoke dan
  tampil utuh pada 1366x768.
- Viewport 390px pada Integrasi dan Litmas Anak masih terpotong horizontal oleh
  sidebar dan area form yang fixed-width. Ini perlu diputuskan apakah menjadi
  target perbaikan responsive, atau cukup didokumentasikan karena aplikasi
  targetnya desktop Windows.

Catatan:

- Skenario fixture saat ini mencakup Data Manager dan modal Stopper review di
  halaman Integrasi.
- Smoke visual belum menggantikan klik manual untuk alur kompleks seperti upload
  dokumentasi foto atau apply data Stopper sampai form terisi.
