# Packaging Audit

Audit packaging setelah modularisasi:

- `LIBERO.spec` sudah memasukkan folder `assets/js`, `assets/css`, dan
  `assets/vendor`, sehingga asset JS/CSS baru ikut packaged.
- `scripts/build_LIBERO.ps1` sudah mengecek modul helper baru dan menambahkan
  hidden import untuk:
  - `launcher_data_manager`
  - `launcher_form_bridge`
  - `launcher_paths`
  - `launcher_stopper`
  - `docx_adapter`
  - `lit_contract`
- `src/launcher_assets.py` memakai `DEFAULT_WEBVIEW_ASSETS` dari `src/common.py`,
  dan audit asset menunjukkan tidak ada path asset webview yang hilang.
- `scripts/build_LIBERO.ps1` punya opsi `-NoOpen` agar build QA bisa berjalan
  tanpa membuka Explorer otomatis.
- Mode child packaged `RUN_INTEGRASI` dan `RUN_LITMAS_ANAK` sudah dipatch agar
  menjalankan `_run_webview()` setelah import modul saat executable frozen.

Verifikasi yang sudah dijalankan:

```powershell
python -m py_compile LIBERO.spec
python -m py_compile scripts\layout_tester.py src\launcher_stopper.py src\docx_adapter.py src\integrasi.py src\litmasanak.py
python -c "import pathlib, sys; sys.path.insert(0, 'src'); import common; missing=[p for p in common.DEFAULT_WEBVIEW_ASSETS if not pathlib.Path(p).exists()]; print('missing assets:', missing); raise SystemExit(1 if missing else 0)"
powershell -NoProfile -Command "[scriptblock]::Create((Get-Content -LiteralPath 'scripts\build_LIBERO.ps1' -Raw)) | Out-Null; Write-Output 'build script syntax OK'"
python -m py_compile src\launcher.py
```

Belum dijalankan:

- Rebuild PyInstaller final setelah patch mode child packaged.
- Smoke test executable hasil package.

Catatan:

- Build onefile sempat berhasil sebelum patch mode child packaged, tetapi smoke
  `RUN_INTEGRASI` menunjukkan executable child keluar dengan kode 0 sebelum
  webview memberi readiness signal. Setelah sumber dipatch, rebuild final
  sengaja ditunda untuk dijalankan manual.
