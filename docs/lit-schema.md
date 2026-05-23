# LIBERO .lit Data Contract

## Current Contract

- Current schema version: `2`.
- A `.lit` payload remains a flat JSON object after decode.
- Internal metadata lives under `__libero_lit`.
- Supported modules are `integrasi` and `litmasanak`.

Example:

```json
{
  "__libero_lit": {
    "schema_version": 2,
    "module": "integrasi"
  },
  "Program": "Pembebasan Bersyarat",
  "Nama Klien": "SITI AMINAH",
  "nama_klien": "SITI AMINAH",
  "perkara_list": [
    { "perkara": "tindak pidana narkotika", "pasal": "Pasal 112 UU Narkotika" }
  ]
}
```

## Migration Rules

- Version `0` means legacy data without `__libero_lit`.
- `None` values for known object/list sections are restored to `{}` or `[]`.
- Legacy display keys such as `Nama Klien`, `Nama Ayah`, `Jenis Kelamin`, and `Program` are preserved.
- Canonical aliases such as `nama_klien`, `nama_ayah`, `jenis_kelamin`, and `program` are added when missing.
- Legacy `Perkara`/`Pasal` is migrated additively into `perkara_list`.
- Unknown keys are preserved so older saved data is not silently stripped.

## Compatibility

The save format is intentionally still flat. This keeps existing webview load logic and DOCX generation compatible while giving tests a stable version marker for future migrations.
