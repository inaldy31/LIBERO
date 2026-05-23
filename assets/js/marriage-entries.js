// LIBERO: UI riwayat pernikahan berulang dan helper pengambilan data.
/* assets/js/marriage-entries.js
 * Foundation module untuk fitur Riwayat Pernikahan multi-entry.
 *
 * Lingkup task 1.1:
 *  - Skeleton modul + registry + factory `register(config)` + `byKey(loc)`
 *  - Helper template `render(config, n)` dengan fieldMap untuk 4 lokasi
 *      LK : klien Litmas Anak     -> id pattern  mf-${n}-*
 *      LW : wali Litmas Anak      -> id pattern  f5-wali-${n}-*
 *      IK : klien Integrasi       -> id pattern  mf-${n}-*
 *      IP : penjamin Integrasi    -> id pattern  pmf-${n}-*
 *  - Definisi canonical EntryRecord (11 logical fields) dan deskriptor lokasi
 *  - Markup blok per Entry: header (drag handle, judul, tombol ↑/↓/×),
 *    grid 11 field, footer "+ Tambah Pernikahan"
 *
 * Lingkup task 1.2:
 *  - Implementasi CRUD: addEntry / removeEntry(i) / moveUp(i) / moveDown(i) /
 *    moveTo(i,j) / renumber() / rebuild() menggunakan pola
 *    snapshot → mutate → innerHTML='' → loop render → restore values.
 *  - Event delegation tunggal di container (.me-add / .me-up / .me-down /
 *    .me-del) dengan flag instance._delegatedBound.
 *  - Hidden-count sync minimal — disempurnakan oleh task 1.10.
 *  - data-me-uid preserved across rebuild dengan menyimpan uid list sebelum
 *    innerHTML='' dan memberikannya kembali ke render(n, {uid}).
 *  - Re-attach datepicker / auto-resize via window._resizeFinp (auto-resize)
 *    dan MutationObserver datepicker (otomatis terdeteksi).
 *
 * Lingkup task 1.10:
 *  - toggleConditional(i, 'anak'|'meninggal') penuh:
 *      'anak'      → punyaAnak !== 'Ya'        ⇒ sembunyikan + kosongkan
 *                    anakLaki & anakPerempuan; sebaliknya tampilkan kembali.
 *      'meninggal' → status   !== 'Meninggal Dunia' ⇒ sembunyikan + kosongkan
 *                    tahunMeninggal; sebaliknya tampilkan kembali.
 *  - updateHiddenCount() canonical: el.value = '' saat entries.length === 0,
 *    String(length) selainnya, plus dispatch `change` (bubbles:true). No-op
 *    bila hidden element tidak ada.
 *  - Event delegation `change` pada container untuk men-trigger
 *    toggleConditional(pos, 'anak'|'meninggal') saat select trigger berubah.
 *  - rebuild() menjalankan toggle untuk setiap entry agar visibilitas awal
 *    selaras dengan nilai yang di-restore.
 *
 * Lingkup task 1.4:
 *  - collect()/load(storage, opts) per storage shape:
 *      'dict'           — LK & LW (snake_case key '1'..'n');
 *                         anak_laki/anak_perempuan default '0', tahun_meninggal ''.
 *      'array-suffix'   — IK (TitleCase + suffix _N), key Agama_Nikah_${n}
 *                         (mengikuti reader Python di src/normalize.py).
 *      'dict-titlecase' — IP (TitleCase _Penjamin), key Agama_Nikah_Penjamin.
 *  - Sebelum collect membentuk record: jalankan normalisasi kondisional
 *    (anakLaki/anakPerempuan ke '' jika punyaAnak !== 'Ya'; tahunMeninggal
 *    ke '' jika status !== 'Meninggal Dunia').
 *  - load(storage, { ignoreLegacyCount: true }):
 *      • menentukan jumlah entry murni dari payload (mengabaikan dropdown
 *        legacy yang miss-aligned, Req 11.2);
 *      • untuk shape dict/dict-titlecase: hanya menerima key numerik 1..n
 *        (Object.keys → Number → filter Number.isFinite → sort asc);
 *      • untuk shape array-suffix: iterasi array; bila suffix object tidak
 *        cocok dengan posisi, fall back ke suffix numerik pertama yang
 *        ditemukan (toleransi data lama yang shifted);
 *      • mentolerir alias key lama (snake_case ↔ TitleCase) lewat helper
 *        `pick()` agar data lama tetap dapat dimuat;
 *      • setelah memuat, memanggil rebuild() yang otomatis menjalankan
 *        applyAllToggles() + updateHiddenCount() + reattachHooks().
 *
 * Lingkup task 1.5:
 *  - applyPayload(records) untuk Stopper:
 *      • Tolerate input non-array (null/undefined/scalar) → return 0.
 *      • Coerce setiap item menjadi canonical EntryRecord 11 field
 *        (default '' untuk field yang hilang).
 *      • Sanitasi kondisional via `normalizeConditional()` SEBELUM rebuild:
 *          punyaAnak !== 'Ya'        ⇒ anakLaki & anakPerempuan = ''
 *          status   !== 'Meninggal Dunia' ⇒ tahunMeninggal = ''
 *      • Memanggil `rebuild(instance, sanitized)` — pipeline existing:
 *        clear DOM → render n=1..N → restore values → bind delegasi →
 *        applyAllToggles() → reattachHooks() → updateHiddenCount().
 *      • Idempotent: dua pemanggilan berturut dengan records yang sama
 *        menghasilkan DOM identik (tidak ada counter/append yang bocor;
 *        rebuild selalu snapshot → mutate → re-render dari awal).
 *      • Mengembalikan jumlah entry yang dirender.
 *  - Eksposes `_applyPayload(instance, records)` di window.MarriageEntries
 *    untuk diagnostik/test.
 *
 * Lingkup task 1.6:
 *  - HTML5 drag-and-drop bindings via container-level event delegation
 *    (`dragstart` / `dragover` / `drop` / `dragend`) — satu set listener per
 *    instance, idempotent via flag `_dndDelegatedBound`. Karena listener
 *    di-pasang pada container (bukan tiap blok), binding tetap valid lintas
 *    rebuild walaupun `innerHTML` blok diganti.
 *  - Drop dibatasi pada container source yang sama (Requirement 4.2):
 *      • dragstart menyimpan `dragging` block + `dragSrcContainer` di
 *        closure per instance; instance lain memiliki closure terpisah
 *        sehingga drop antar-section secara otomatis "ignored".
 *      • Bila `dragSrcContainer !== container` (mis. drop di container
 *        lain) → handler dragover/drop tidak `preventDefault`, browser
 *        tidak mengizinkan drop, urutan tidak berubah.
 *  - Indikator visual:
 *      • `me-dragging` pada blok yang sedang di-drag.
 *      • `me-drop-before` / `me-drop-after` pada blok target sesuai
 *        sisi cursor (top-half vs bottom-half via `getBoundingClientRect`).
 *      • Dibersihkan otomatis pada `dragend` dan setiap kali dragover
 *        berpindah blok (cegah indikator menumpuk).
 *  - Drag selection teks pada `<input>/<textarea>/<select>` tidak ikut
 *    memicu DnD blok (skip dragstart bila `e.target.closest('input,textarea,select')`).
 *  - Final index untuk `moveTo(from, to)` dihitung dengan rumus design.md:
 *      to = blockIndex(target);  if (!before) to += 1;  if (to > from) to -= 1;
 *    Karena `moveTo` bekerja pada snapshot EntryRecord lengkap (collect
 *    annotated → splice → rebuild), seluruh 11 field pasangan ikut pindah
 *    bersama (Requirement 4.3).
 *
 * Lingkup task 1.7:
 *  - Shim level-window untuk kompatibilitas inline `onchange` handler lama
 *    di `views/litmasanak.html` & `views/integrasi.html` selama migrasi
 *    (Requirement 6.1, 15.3). Sembilan nama berikut dipasang setelah
 *    `window.MarriageEntries` siap, dan men-dispatch ke instance via
 *    `MarriageEntries.byKey(loc)`:
 *      • updateMarriageFrames          → byKey('LK').rebuild()
 *      • updatePenjaminMarriageFrames  → byKey('IP').rebuild()
 *      • onWaliJmlNikahChange          → byKey('LW').rebuild()
 *      • onMarriageAnakChange(n)       → byKey('LK').toggleConditional(n,'anak')
 *      • onMarriageStatusChange(n)     → byKey('LK').toggleConditional(n,'meninggal')
 *      • onPMFAnakChange(n)            → byKey('IP').toggleConditional(n,'anak')
 *      • onPMFStatusChange(n)          → byKey('IP').toggleConditional(n,'meninggal')
 *      • onWaliPunyaAnakChange(n,v)    → byKey('LW').toggleConditional(n,'anak')
 *      • onWaliNikahStatusChange(n,v)  → byKey('LW').toggleConditional(n,'meninggal')
 *  - Defensive: tiap shim membungkus inner call dengan try/catch sehingga
 *    bila instance terkait belum di-register (mis. handler inline
 *    ter-fire sebelum bootstrap selesai), shim menjadi silent no-op
 *    tanpa melempar error.
 *  - Nama-nama ini dimiliki oleh modul ini pasca-migrasi, jadi assignment
 *    selalu meng-overwrite implementasi lama (legacy non-MarriageEntries).
 *
 * Lingkup task 5.1:
 *  - `requiredFieldIds(i)` (instance method, 1-based pos):
 *      • Iterasi LOGICAL_KEYS, baca def dari `instance.config.fieldMap`.
 *      • Hanya sertakan field dengan `def.required === true` DAN sedang
 *        visible (canonical truth: DOM element's `style.display !== 'none'`,
 *        sesuai kontrak `setFieldVisibility`/`toggleConditional` yang
 *        memakai inline `display:none` untuk field kondisional yang hidden).
 *      • Untuk tiap field visible required, return `{ id, label }` —
 *        `id` sudah di-substitusi `${n}` → posisi `i`, `label` dari `def.label`.
 *      • Bila elemen tidak ada di DOM (mis. blok belum dirender) → skip.
 *      • Bila instance tidak punya container / `i` invalid → return [].
 *  - `MarriageEntries.chkRiwayatNikah(loc, missingArr, pfx)` (top-level helper):
 *      • `pfx` default `''`.
 *      • Lookup instance via `byKey(loc)`. Bila tidak terdaftar atau
 *        container missing → no-op (defensive, jangan throw).
 *      • Bila `count() === 0` → push `pfx + 'Riwayat Pernikahan (minimal 1 entry)'`
 *        ke `missingArr` dan return early (Requirement 13.1, section-level
 *        message saat tidak ada entry sama sekali).
 *      • Selainnya iterasi `i = 1..count()` dan panggil `requiredFieldIds(i)`.
 *        Untuk tiap `{id, label}` baca nilai via `LFormSchema.value(id)`
 *        (preferred — sudah trimmed); fall back ke
 *        `document.getElementById(id)?.value` bila LFormSchema belum siap.
 *        Bila value kosong (setelah `.trim()` untuk string), push
 *        `pfx + 'Pernikahan ke-' + i + ' > ' + label` ke `missingArr`
 *        (Requirement 13.2, hanya field visible yang divalidasi karena
 *        requiredFieldIds sudah memfilter visibility).
 *  - Field tersembunyi tidak ikut divalidasi (Requirement 13.2): filter
 *    visibility dilakukan di `requiredFieldIdsForInstance` sehingga
 *    chkRiwayatNikah otomatis melewati field hidden.
 */
(function () {
  'use strict';

  if (window.MarriageEntries && window.MarriageEntries.__ready) return;

  // ────────────────────────────────────────────────────────────────────────
  // Konstanta canonical EntryRecord
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Logical field keys (urutan ini yang dipakai saat rendering grid).
   * @type {ReadonlyArray<string>}
   */
  var LOGICAL_KEYS = Object.freeze([
    'nama',
    'tempat',
    'tanggal',
    'agama',
    'atasDasar',
    'restu',
    'punyaAnak',
    'anakLaki',
    'anakPerempuan',
    'status',
    'tahunMeninggal'
  ]);

  /** Default kosong untuk satu EntryRecord (11 field). */
  function emptyRecord() {
    return {
      nama: '',
      tempat: '',
      tanggal: '',
      agama: '',
      atasDasar: '',
      restu: '',
      punyaAnak: '',
      anakLaki: '',
      anakPerempuan: '',
      status: '',
      tahunMeninggal: ''
    };
  }

  /**
   * Definisi canonical 11 field — atribut yang seragam lintas lokasi
   * (label, type, opsi select, aturan kondisional, required).
   */
  var CANONICAL_FIELD_DEFS = Object.freeze({
    nama: {
      label: 'Nama Pasangan',
      type: 'text',
      required: true
    },
    tempat: {
      label: 'Tempat Nikah',
      type: 'text',
      required: true
    },
    tanggal: {
      label: 'Tanggal Nikah',
      type: 'date',
      required: true,
      placeholder: 'dd/mm/yyyy'
    },
    agama: {
      label: 'Secara Agama',
      type: 'select',
      required: true,
      options: ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']
    },
    atasDasar: {
      label: 'Atas Dasar',
      type: 'text',
      required: true
    },
    restu: {
      label: 'Mendapat Restu Orang Tua?',
      type: 'select',
      required: true,
      options: ['Ya', 'Tidak']
    },
    punyaAnak: {
      label: 'Punya Anak?',
      type: 'select',
      required: true,
      options: ['Ya', 'Tidak'],
      // memicu visibilitas anakLaki & anakPerempuan
      conditionalTrigger: 'anak'
    },
    anakLaki: {
      label: 'Jumlah Anak Laki-laki',
      type: 'text',
      required: true,
      // hanya tampil saat punyaAnak === 'Ya'
      showWhen: { punyaAnak: 'Ya' }
    },
    anakPerempuan: {
      label: 'Jumlah Anak Perempuan',
      type: 'text',
      required: true,
      showWhen: { punyaAnak: 'Ya' }
    },
    status: {
      label: 'Status Saat Ini',
      type: 'select',
      required: true,
      options: ['Masih Bersama', 'Berpisah', 'Meninggal Dunia'],
      conditionalTrigger: 'meninggal'
    },
    tahunMeninggal: {
      label: 'Tahun Meninggal',
      type: 'text',
      required: true,
      showWhen: { status: 'Meninggal Dunia' }
    }
  });

  // ────────────────────────────────────────────────────────────────────────
  // Per-lokasi: id template & lebar input
  //
  // `idTpl` adalah string template yang menggunakan token literal `${n}` —
  // BUKAN template-literal JS. Substitusi dilakukan oleh `applyIdTpl(tpl, n)`
  // sehingga config dapat disimpan apa adanya tanpa diparser ulang.
  // ────────────────────────────────────────────────────────────────────────

  var LOCATION_FIELD_TEMPLATES = {
    // Klien Litmas Anak (acc-3-3) — pola id `mf-${n}-*`
    LK: {
      nama:           { idTpl: 'mf-${n}-nama-pasangan',  w: '' },
      tempat:         { idTpl: 'mf-${n}-tempat-nikah',   w: 'w-md' },
      tanggal:        { idTpl: 'mf-${n}-tanggal-nikah',  w: 'w-md' },
      agama:          { idTpl: 'mf-${n}-agama',          w: 'w-md' },
      atasDasar:      { idTpl: 'mf-${n}-atas-dasar',     w: 'w-md' },
      restu:          { idTpl: 'mf-${n}-restu',          w: 'w-sm' },
      punyaAnak:      { idTpl: 'mf-${n}-punya-anak',     w: 'w-sm' },
      anakLaki:       { idTpl: 'mf-${n}-anak-laki',      w: 'w-sm', lblIdTpl: 'mf-${n}-lbl-laki' },
      anakPerempuan:  { idTpl: 'mf-${n}-anak-perempuan', w: 'w-sm', lblIdTpl: 'mf-${n}-lbl-perempuan' },
      status:         { idTpl: 'mf-${n}-status',         w: 'w-md' },
      tahunMeninggal: { idTpl: 'mf-${n}-tahun-meninggal', w: 'w-sm', lblIdTpl: 'mf-${n}-lbl-meninggal' }
    },
    // Klien Integrasi — pola id sama dengan LK
    IK: {
      nama:           { idTpl: 'mf-${n}-nama-pasangan',  w: '' },
      tempat:         { idTpl: 'mf-${n}-tempat-nikah',   w: 'w-md' },
      tanggal:        { idTpl: 'mf-${n}-tanggal-nikah',  w: 'w-md' },
      agama:          { idTpl: 'mf-${n}-agama',          w: 'w-md' },
      atasDasar:      { idTpl: 'mf-${n}-atas-dasar',     w: 'w-md' },
      restu:          { idTpl: 'mf-${n}-restu',          w: 'w-sm' },
      punyaAnak:      { idTpl: 'mf-${n}-punya-anak',     w: 'w-sm' },
      anakLaki:       { idTpl: 'mf-${n}-anak-laki',      w: 'w-sm', lblIdTpl: 'mf-${n}-lbl-laki' },
      anakPerempuan:  { idTpl: 'mf-${n}-anak-perempuan', w: 'w-sm', lblIdTpl: 'mf-${n}-lbl-perempuan' },
      status:         { idTpl: 'mf-${n}-status',         w: 'w-md' },
      tahunMeninggal: { idTpl: 'mf-${n}-tahun-meninggal', w: 'w-sm', lblIdTpl: 'mf-${n}-lbl-meninggal' }
    },
    // Penjamin Integrasi (acc-4-0) — pola id `pmf-${n}-*`
    IP: {
      nama:           { idTpl: 'pmf-${n}-nama',          w: '' },
      tempat:         { idTpl: 'pmf-${n}-tempat',        w: 'w-md' },
      tanggal:        { idTpl: 'pmf-${n}-tanggal',       w: 'w-md' },
      agama:          { idTpl: 'pmf-${n}-agama',         w: 'w-md' },
      atasDasar:      { idTpl: 'pmf-${n}-atas-dasar',    w: 'w-md' },
      restu:          { idTpl: 'pmf-${n}-restu',         w: 'w-sm' },
      punyaAnak:      { idTpl: 'pmf-${n}-punya-anak',    w: 'w-sm' },
      anakLaki:       { idTpl: 'pmf-${n}-anak-laki',     w: 'w-sm', lblIdTpl: 'pmf-${n}-lbl-laki' },
      anakPerempuan:  { idTpl: 'pmf-${n}-anak-perempuan', w: 'w-sm', lblIdTpl: 'pmf-${n}-lbl-perempuan' },
      status:         { idTpl: 'pmf-${n}-status',        w: 'w-md' },
      tahunMeninggal: { idTpl: 'pmf-${n}-tahun-meninggal', w: 'w-sm', lblIdTpl: 'pmf-${n}-lbl-meninggal' }
    },
    // Wali Litmas Anak (acc-5-0 / sec-wali-riwayat / wali-nikah-detail) —
    // pola id `f5-wali-${n}-*`. Kompatibel dengan kode existing yang memakai
    // suffix singkat (`-tgl`, `-anak-l`, `-thn-meninggal`).
    LW: {
      nama:           { idTpl: 'f5-wali-${n}-nama',         w: '' },
      tempat:         { idTpl: 'f5-wali-${n}-tempat',       w: '' },
      tanggal:        { idTpl: 'f5-wali-${n}-tgl',          w: 'w-md' },
      agama:          { idTpl: 'f5-wali-${n}-agama',        w: 'w-md' },
      atasDasar:      { idTpl: 'f5-wali-${n}-atas-dasar',   w: '' },
      restu:          { idTpl: 'f5-wali-${n}-restu',        w: 'w-sm' },
      punyaAnak:      { idTpl: 'f5-wali-${n}-punya-anak',   w: 'w-sm' },
      anakLaki:       { idTpl: 'f5-wali-${n}-anak-l',       w: '',     lblIdTpl: 'f5-wali-${n}-anak-l-lbl', inputType: 'number' },
      anakPerempuan:  { idTpl: 'f5-wali-${n}-anak-p',       w: '',     lblIdTpl: 'f5-wali-${n}-anak-p-lbl', inputType: 'number' },
      status:         { idTpl: 'f5-wali-${n}-status',       w: 'w-md' },
      tahunMeninggal: { idTpl: 'f5-wali-${n}-thn-meninggal', w: '',    lblIdTpl: 'f5-wali-${n}-thn-meninggal-lbl' }
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // Per-lokasi: deskriptor default (containerId, judul blok, hidden count, …)
  // ────────────────────────────────────────────────────────────────────────

  var LOCATION_DEFAULTS = {
    LK: {
      key: 'LK',
      containerId: 'marriage-frames',
      blockIdPrefix: 'marriage-block',
      blockTitle: function (n) { return 'Pernikahan ke-' + n; },
      hidden: { countFieldId: 'f-jumlah-pernikahan' },
      storage: { shape: 'dict' },
      addLabel: '+ Tambah Pernikahan'
    },
    IK: {
      key: 'IK',
      containerId: 'marriage-frames',
      blockIdPrefix: 'marriage-block',
      blockTitle: function (n) { return 'Pernikahan ke-' + n; },
      hidden: { countFieldId: 'f-jumlah-pernikahan' },
      storage: { shape: 'array-suffix' },
      addLabel: '+ Tambah Pernikahan'
    },
    IP: {
      key: 'IP',
      containerId: 'penjamin-marriage-frames',
      blockIdPrefix: 'pmf-block',
      blockTitle: function (n) { return 'Pernikahan Penjamin ke-' + n; },
      hidden: { countFieldId: 'f4-jumlah-pernikahan-penjamin' },
      storage: { shape: 'dict-titlecase' },
      addLabel: '+ Tambah Pernikahan Penjamin'
    },
    LW: {
      key: 'LW',
      containerId: 'wali-nikah-detail',
      blockIdPrefix: 'wali-nikah-block',
      blockTitle: function (n) { return 'Pernikahan Wali ke-' + n; },
      hidden: { countFieldId: 'f5-wali-jml-nikah' },
      storage: { shape: 'dict' },
      addLabel: '+ Tambah Pernikahan Wali'
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────────────

  /** Substitusi token literal `${n}` pada template id. */
  function applyIdTpl(tpl, n) {
    return String(tpl).replace(/\$\{n\}/g, String(n));
  }

  /** Escape minimal untuk teks yang masuk ke atribut HTML. */
  function escAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /** Escape untuk teks node HTML. */
  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /** Deep merge sederhana (nested object override). */
  function mergeDeep(base, ext) {
    if (!ext) return base;
    var out = {};
    var k;
    for (k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    for (k in ext) {
      if (!Object.prototype.hasOwnProperty.call(ext, k)) continue;
      var bv = out[k];
      var ev = ext[k];
      if (bv && ev && typeof bv === 'object' && typeof ev === 'object'
          && !Array.isArray(bv) && !Array.isArray(ev)) {
        out[k] = mergeDeep(bv, ev);
      } else {
        out[k] = ev;
      }
    }
    return out;
  }

  /**
   * Bangun fieldMap effective dengan menggabungkan canonical defs + per-lokasi
   * id template/width.
   */
  function buildFieldMap(locKey) {
    var tpl = LOCATION_FIELD_TEMPLATES[locKey];
    if (!tpl) {
      throw new Error('[MarriageEntries] unknown location key: ' + locKey);
    }
    var out = {};
    for (var i = 0; i < LOGICAL_KEYS.length; i++) {
      var lk = LOGICAL_KEYS[i];
      var canon = CANONICAL_FIELD_DEFS[lk];
      var loc = tpl[lk];
      out[lk] = {
        logicalKey: lk,
        label: canon.label,
        type: canon.type,
        required: !!canon.required,
        options: canon.options ? canon.options.slice() : null,
        placeholder: canon.placeholder || '',
        showWhen: canon.showWhen || null,
        conditionalTrigger: canon.conditionalTrigger || null,
        idTpl: loc.idTpl,
        lblIdTpl: loc.lblIdTpl || null,
        w: loc.w || '',
        inputType: loc.inputType || (canon.type === 'date' ? 'text' : (canon.type === 'select' ? null : 'text'))
      };
    }
    return out;
  }

  // ────────────────────────────────────────────────────────────────────────
  // Render: satu blok Entry
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Render sebuah field (label + input/select) menjadi HTML string.
   * Menghormati `showWhen` — field kondisional dirender dengan style display:none
   * sehingga toggle awal (sebelum pengguna mengubah trigger) sudah benar.
   */
  function renderField(fieldDef, n) {
    var id = applyIdTpl(fieldDef.idTpl, n);
    var lblId = fieldDef.lblIdTpl ? applyIdTpl(fieldDef.lblIdTpl, n) : '';
    var hidden = !!fieldDef.showWhen;
    var lblClass = 'flbl' + (fieldDef.required ? ' req' : '');
    var lblAttrs = (lblId ? ' id="' + escAttr(lblId) + '"' : '')
                 + (hidden ? ' style="display:none"' : '');
    var lblHtml = '<div class="' + lblClass + '"' + lblAttrs + '>'
                + escHtml(fieldDef.label) + '</div>';

    var fieldHtml = '';
    if (fieldDef.type === 'select') {
      var selClass = 'fsel' + (fieldDef.w ? ' ' + fieldDef.w : '');
      var selAttrs = ' class="' + escAttr(selClass) + '" id="' + escAttr(id) + '"'
                   + (hidden ? ' style="display:none"' : '');
      var opts = '<option value="">— Pilih —</option>';
      var arr = fieldDef.options || [];
      for (var i = 0; i < arr.length; i++) {
        opts += '<option>' + escHtml(arr[i]) + '</option>';
      }
      fieldHtml = '<select' + selAttrs + '>' + opts + '</select>';
    } else {
      // text input atau date input
      var isDate = fieldDef.type === 'date';
      var cls = 'finp'
              + (fieldDef.w ? ' ' + fieldDef.w : '')
              + (isDate ? ' dp-input' : '');
      var inputType = fieldDef.inputType || 'text';
      var attrs = ' class="' + escAttr(cls) + '" id="' + escAttr(id) + '" type="' + escAttr(inputType) + '"';
      if (fieldDef.placeholder) attrs += ' placeholder="' + escAttr(fieldDef.placeholder) + '"';
      if (isDate) attrs += ' autocomplete="off"';
      if (inputType === 'number') attrs += ' min="0"';
      attrs += ' spellcheck="false"';
      if (hidden) attrs += ' style="display:none"';
      fieldHtml = '<input' + attrs + '>';
    }
    return lblHtml + fieldHtml;
  }

  /**
   * Render satu blok Entry sebagai HTML string.
   *
   * Layout:
   *   <div class="marriage-block me-block" id="<prefix>-<n>" data-me-uid …>
   *     <div class="me-block-header">
   *       <span class="me-drag-handle">⋮⋮</span>
   *       <div class="marriage-block-title">{title}</div>
   *       <div class="me-block-actions">
   *         <button class="me-btn me-up">▲</button>
   *         <button class="me-btn me-down">▼</button>
   *         <button class="me-btn me-del">×</button>
   *       </div>
   *     </div>
   *     <div class="fgrid"> {11 fields} </div>
   *   </div>
   *
   * @param {object} config Resolved location config (output `register`).
   * @param {number} n Posisi entry (1-based).
   * @param {object} [opts] {uid?: string} — dipakai oleh CRUD layer (task 1.2)
   *                  agar setelah rebuild atribut `data-me-uid` tetap stabil.
   */
  function render(config, n, opts) {
    if (!config || !config.fieldMap) {
      throw new Error('[MarriageEntries] render() butuh config dengan fieldMap');
    }
    var pos = n | 0;
    if (pos < 1) pos = 1;
    var uid = (opts && opts.uid) ? String(opts.uid) : ('me-' + Math.random().toString(36).slice(2, 10));
    var blockId = (config.blockIdPrefix || 'me-block') + '-' + pos;
    var title = (typeof config.blockTitle === 'function')
      ? config.blockTitle(pos)
      : ('Pernikahan ke-' + pos);

    var fieldsHtml = '';
    for (var i = 0; i < LOGICAL_KEYS.length; i++) {
      fieldsHtml += renderField(config.fieldMap[LOGICAL_KEYS[i]], pos);
    }

    return ''
      + '<div class="marriage-block me-block"'
      +   ' id="' + escAttr(blockId) + '"'
      +   ' data-me-uid="' + escAttr(uid) + '"'
      +   ' data-me-key="' + escAttr(config.key || '') + '"'
      +   ' data-me-pos="' + pos + '"'
      +   ' draggable="true">'
      +   '<div class="me-block-header">'
      +     '<span class="me-drag-handle" title="Geser untuk menyusun ulang" aria-hidden="true">⋮⋮</span>'
      +     '<div class="marriage-block-title">' + escHtml(title) + '</div>'
      +     '<div class="me-block-actions">'
      +       '<button type="button" class="me-btn me-up"   title="Pindah ke atas"   aria-label="Pindah ke atas">▲</button>'
      +       '<button type="button" class="me-btn me-down" title="Pindah ke bawah"  aria-label="Pindah ke bawah">▼</button>'
      +       '<button type="button" class="me-btn me-del"  title="Hapus pernikahan ini" aria-label="Hapus">×</button>'
      +     '</div>'
      +   '</div>'
      +   '<div class="fgrid">' + fieldsHtml + '</div>'
      + '</div>';
  }

  /** Render tombol footer "+ Tambah". */
  function renderFooter(config) {
    var label = config.addLabel || '+ Tambah Pernikahan';
    return ''
      + '<div class="me-section-footer">'
      +   '<button type="button" class="me-btn me-add" data-me-key="' + escAttr(config.key || '') + '">'
      +     escHtml(label)
      +   '</button>'
      + '</div>';
  }

  // ────────────────────────────────────────────────────────────────────────
  // Internal: collect / write field values, rebuild loop
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Baca seluruh blok yang ada di container DOM (urutan tampilan saat ini)
   * dan kembalikan Array<EntryRecord>. Tidak melakukan sanitasi kondisional —
   * itu tanggung jawab collect()/applyPayload() (task 1.14/1.18).
   */
  function collectInternal(instance) {
    var pairs = collectInternalAnnotated(instance);
    var out = new Array(pairs.length);
    for (var i = 0; i < pairs.length; i++) out[i] = pairs[i].record;
    return out;
  }

  /**
   * Versi internal collectInternal yang juga mengembalikan uid setiap blok.
   * Dipakai oleh CRUD ops agar uid mengikuti entry-nya saat swap/move/splice
   * (uid stabil per "entity hidup", lihat design.md "Komponen 1").
   */
  function collectInternalAnnotated(instance) {
    var container = instance.container();
    if (!container) return [];
    var blocks = container.querySelectorAll('.me-block');
    var fieldMap = instance.config.fieldMap;
    var out = [];
    for (var bi = 0; bi < blocks.length; bi++) {
      var block = blocks[bi];
      var pos = parseInt(block.getAttribute('data-me-pos'), 10);
      if (!pos || pos < 1) pos = bi + 1;
      var rec = emptyRecord();
      for (var i = 0; i < LOGICAL_KEYS.length; i++) {
        var lk = LOGICAL_KEYS[i];
        var def = fieldMap[lk];
        if (!def) continue;
        var id = applyIdTpl(def.idTpl, pos);
        var el = document.getElementById(id);
        if (el && typeof el.value === 'string') {
          rec[lk] = el.value;
        }
      }
      out.push({ record: rec, uid: block.getAttribute('data-me-uid') || '' });
    }
    return out;
  }

  /**
   * Tulis ulang nilai field dari sebuah record ke DOM blok pada posisi `n`.
   * Untuk <select>: jika value tidak ada di options, fallback ke ''.
   */
  function writeFieldsToDom(instance, n, record) {
    var fieldMap = instance.config.fieldMap;
    if (!record) record = emptyRecord();
    for (var i = 0; i < LOGICAL_KEYS.length; i++) {
      var lk = LOGICAL_KEYS[i];
      var def = fieldMap[lk];
      if (!def) continue;
      var id = applyIdTpl(def.idTpl, n);
      var el = document.getElementById(id);
      if (!el) continue;
      var raw = record[lk];
      if (raw == null) raw = '';
      var val = String(raw);
      if (def.type === 'select') {
        var found = false;
        var opts = (def.options || []);
        for (var oi = 0; oi < opts.length; oi++) {
          if (opts[oi] === val) { found = true; break; }
        }
        el.value = found ? val : '';
      } else {
        el.value = val;
      }
    }
  }

  /**
   * Snapshot UID dari blok yang sudah ada di container, kunci-kunci posisi
   * 1-based. Disisakan untuk konsumen lama; CRUD internal sekarang memakai
   * `collectInternalAnnotated()` agar uid mengikuti record-nya saat reorder.
   */
  function snapshotUids(instance) {
    var container = instance.container();
    if (!container) return [];
    var blocks = container.querySelectorAll('.me-block');
    var uids = [];
    for (var i = 0; i < blocks.length; i++) {
      uids.push(blocks[i].getAttribute('data-me-uid') || '');
    }
    return uids;
  }

  /**
   * Re-attach hooks setelah container di-rebuild:
   *  - auto-resize (.finp → textarea, dst.) lewat window._resizeFinp
   *  - datepicker (.dp-input) — modul memakai MutationObserver, jadi setelah
   *    DOM disisipkan otomatis ter-attach. Helper di sini hanya berjaga-jaga
   *    untuk API alternatif (window.Datepicker?.attach?.).
   *  - hooks user (config.hooks.onChange / progress)
   * Semua dibungkus try/catch agar gagalnya satu hook tidak menghentikan rebuild.
   */
  function reattachHooks(instance) {
    var c = instance.container();

    // 1. Auto-resize: upgrade .finp → textarea, dst.
    try {
      if (typeof window._resizeFinp === 'function') {
        window._resizeFinp();
      } else if (window.AutoResize && typeof window.AutoResize.attach === 'function') {
        window.AutoResize.attach(c);
      }
    } catch (_e) { /* no-op */ }

    // 2. Datepicker: modul `datepicker.js` memakai MutationObserver pada
    //    document.body, jadi blok yang baru di-insert akan ter-attach pada
    //    rAF berikutnya. Tetap coba API alternatif jika tersedia.
    try {
      if (window.Datepicker && typeof window.Datepicker.attach === 'function') {
        window.Datepicker.attach(c);
      }
    } catch (_e) { /* no-op */ }

    // 3. User hooks
    try {
      var hooks = instance.config.hooks || {};
      if (typeof hooks.onChange === 'function') hooks.onChange();
      if (typeof hooks.progress === 'function') hooks.progress();
    } catch (_e) { /* no-op */ }
  }

  /**
   * Sinkronisasi hidden count input ke jumlah entry saat ini.
   *
   * Aturan canonical (task 1.10 / Requirement 8.3):
   *   - Bila entries.length === 0 → set value = '' (literal empty string,
   *     bukan '0').
   *   - Selainnya → set value = String(length).
   *   - Dispatch `change` event (bubbles:true) agar listener LFormSchema /
   *     `_ACC_REQ_CACHE` lain ikut bereaksi.
   *   - No-op bila hidden element tidak ada (jangan crash bila lokasi
   *     belum bootstrap markup-nya).
   *
   * @param {object} instance Resolved instance dari `register()`.
   * @param {number} length   Panjang `entries` saat ini.
   */
  function updateHiddenCount(instance, length) {
    try {
      var hidden = (instance && instance.config && instance.config.hidden) || {};
      var fid = hidden.countFieldId;
      if (!fid) return;
      var el = document.getElementById(fid);
      if (!el) return;
      var n = length | 0;
      el.value = n === 0 ? '' : String(n);
      try {
        el.dispatchEvent(new Event('change', { bubbles: true }));
      } catch (_e) {
        // Fallback untuk environment yang tidak punya konstruktor Event
        // baru (mis. IE; tidak relevan di WebView Edge tapi murah).
      }
    } catch (_e) { /* no-op */ }
  }

  // Alias kompat: syncHiddenCount lama → updateHiddenCount canonical.
  function syncHiddenCount(instance, length) {
    return updateHiddenCount(instance, length);
  }

  // ────────────────────────────────────────────────────────────────────────
  // Conditional toggles (task 1.10)
  //
  // Aturan visibilitas mengikuti CANONICAL_FIELD_DEFS:
  //   anakLaki / anakPerempuan tampil iff punyaAnak === 'Ya'
  //   tahunMeninggal           tampil iff status    === 'Meninggal Dunia'
  //
  // Saat tidak tampil: nilai field DIKOSONGKAN agar collect()/payload tidak
  // bocor sisa nilai lama (Requirement 7.2, 7.4).
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Sembunyikan atau tampilkan satu pasangan label+input.
   * Saat hide, juga clear value-nya.
   */
  function setFieldVisibility(fieldDef, n, visible) {
    if (!fieldDef) return;
    var inp = document.getElementById(applyIdTpl(fieldDef.idTpl, n));
    var lbl = fieldDef.lblIdTpl ? document.getElementById(applyIdTpl(fieldDef.lblIdTpl, n)) : null;
    if (inp) {
      inp.style.display = visible ? '' : 'none';
      if (!visible && typeof inp.value === 'string' && inp.value !== '') {
        inp.value = '';
      }
    }
    if (lbl) {
      lbl.style.display = visible ? '' : 'none';
    }
  }

  /**
   * Implementasi `toggleConditional(i, kind)`:
   *   kind === 'anak'      → baca punyaAnak (id dari fieldMap), atur visibilitas
   *                          anakLaki & anakPerempuan.
   *   kind === 'meninggal' → baca status, atur visibilitas tahunMeninggal.
   *
   * Aman dipanggil meski blok belum ada di DOM (no-op).
   *
   * @param {object} instance
   * @param {number} i  1-based posisi entry
   * @param {'anak'|'meninggal'} kind
   */
  function toggleConditional(instance, i, kind) {
    var pos = i | 0;
    if (pos < 1) return;
    var fmap = instance && instance.config && instance.config.fieldMap;
    if (!fmap) return;

    if (kind === 'anak') {
      var triggerEl = document.getElementById(applyIdTpl(fmap.punyaAnak.idTpl, pos));
      var visible = !!triggerEl && triggerEl.value === 'Ya';
      setFieldVisibility(fmap.anakLaki, pos, visible);
      setFieldVisibility(fmap.anakPerempuan, pos, visible);
      return;
    }
    if (kind === 'meninggal') {
      var statusEl = document.getElementById(applyIdTpl(fmap.status.idTpl, pos));
      var visMeninggal = !!statusEl && statusEl.value === 'Meninggal Dunia';
      setFieldVisibility(fmap.tahunMeninggal, pos, visMeninggal);
      return;
    }
  }

  /**
   * Jalankan toggleConditional untuk seluruh entry pada instance,
   * baik 'anak' maupun 'meninggal'. Dipakai rebuild() agar visibilitas
   * awal setelah restore values selaras dengan nilai trigger.
   */
  function applyAllToggles(instance) {
    var c = instance.container();
    if (!c) return;
    var blocks = c.querySelectorAll('.me-block');
    for (var bi = 0; bi < blocks.length; bi++) {
      var pos = parseInt(blocks[bi].getAttribute('data-me-pos'), 10);
      if (!pos || pos < 1) pos = bi + 1;
      toggleConditional(instance, pos, 'anak');
      toggleConditional(instance, pos, 'meninggal');
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Collect / Load (task 1.4) — adapter per storage shape
  //
  // Tiga shape didukung:
  //   'dict'           — LK & LW: { "1": {snake_case keys}, "2": {...} }
  //                      anak_laki/anak_perempuan default '0', tahun_meninggal ''
  //   'array-suffix'   — IK     : [ {Nama_Pasangan_1, …, Tahun_Meninggal_1}, … ]
  //   'dict-titlecase' — IP     : { "1": {Nama_Pasangan_Penjamin, …}, "2": {…} }
  //
  // Sebelum collect membentuk record, normalisasi kondisional dijalankan
  // (Requirement 7.2 / 7.4 / 12.6):
  //   - punyaAnak !== 'Ya'        ⇒ anakLaki & anakPerempuan dikosongkan
  //   - status   !== 'Meninggal Dunia' ⇒ tahunMeninggal dikosongkan
  //
  // Load menerima opsi `{ ignoreLegacyCount: true }` (default true) sehingga
  // dropdown lama yang miss-aligned tidak menambah entry kosong (Req 11.2).
  // Tetap mentolerir alias key lama agar data lama dapat dimuat (lihat
  // alias map di fromDict / fromArraySuffix / fromDictTitlecase).
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Bersihkan field kondisional pada satu record agar konsisten dengan
   * trigger-nya. Mengembalikan record baru (tidak memutasi argumen).
   */
  function normalizeConditional(rec) {
    var out = {
      nama: rec.nama || '',
      tempat: rec.tempat || '',
      tanggal: rec.tanggal || '',
      agama: rec.agama || '',
      atasDasar: rec.atasDasar || '',
      restu: rec.restu || '',
      punyaAnak: rec.punyaAnak || '',
      anakLaki: rec.anakLaki || '',
      anakPerempuan: rec.anakPerempuan || '',
      status: rec.status || '',
      tahunMeninggal: rec.tahunMeninggal || ''
    };
    if (out.punyaAnak !== 'Ya') {
      out.anakLaki = '';
      out.anakPerempuan = '';
    }
    if (out.status !== 'Meninggal Dunia') {
      out.tahunMeninggal = '';
    }
    return out;
  }

  /** Helper: ambil nilai pertama yang non-empty dari beberapa key alias. */
  function pick(obj /*, key1, key2, … */) {
    for (var i = 1; i < arguments.length; i++) {
      var k = arguments[i];
      if (k && Object.prototype.hasOwnProperty.call(obj, k)) {
        var v = obj[k];
        if (v != null && v !== '') return v;
      }
    }
    // Kedua: untuk fallback, kembalikan nilai pertama yang exist (meski '')
    for (var j = 1; j < arguments.length; j++) {
      var kk = arguments[j];
      if (kk && Object.prototype.hasOwnProperty.call(obj, kk)) {
        var vv = obj[kk];
        if (vv != null) return vv;
      }
    }
    return '';
  }

  /**
   * Build collect() output untuk shape 'dict' (LK / LW).
   * Output: { "1": {snake_case fields}, "2": {…} }
   */
  function collectDict(records) {
    var out = {};
    for (var idx = 0; idx < records.length; idx++) {
      var rec = normalizeConditional(records[idx]);
      var n = idx + 1;
      out[String(n)] = {
        nama_pasangan:   rec.nama,
        tempat_nikah:    rec.tempat,
        tanggal_nikah:   rec.tanggal,
        agama:           rec.agama,
        atas_dasar:      rec.atasDasar,
        restu:           rec.restu,
        punya_anak:      rec.punyaAnak,
        anak_laki:       rec.anakLaki || '0',
        anak_perempuan:  rec.anakPerempuan || '0',
        status:          rec.status,
        tahun_meninggal: rec.tahunMeninggal || ''
      };
    }
    return out;
  }

  /**
   * Build collect() output untuk shape 'array-suffix' (IK).
   * Output: [{ Nama_Pasangan_1, …, Tahun_Meninggal_1 }, { Nama_Pasangan_2, … }]
   * Catatan: key `Agama_Nikah_${i}` mengikuti reader Python (`src/normalize.py`
   * dan `src/integrasi.py`) — bukan `Agama_${i}` seperti di draft awal design.
   */
  function collectArraySuffix(records) {
    var out = [];
    for (var idx = 0; idx < records.length; idx++) {
      var rec = normalizeConditional(records[idx]);
      var n = idx + 1;
      var item = {};
      item['Nama_Pasangan_' + n]   = rec.nama;
      item['Tempat_Nikah_' + n]    = rec.tempat;
      item['Tanggal_Nikah_' + n]   = rec.tanggal;
      item['Agama_Nikah_' + n]     = rec.agama;
      item['Dasar_Nikah_' + n]     = rec.atasDasar;
      item['Restu_Ortu_' + n]      = rec.restu;
      item['Punya_Anak_' + n]      = rec.punyaAnak;
      item['Anak_Laki_' + n]       = rec.anakLaki || '0';
      item['Anak_Perempuan_' + n]  = rec.anakPerempuan || '0';
      item['Status_Saat_Ini_' + n] = rec.status;
      item['Tahun_Meninggal_' + n] = rec.tahunMeninggal || '';
      out.push(item);
    }
    return out;
  }

  /**
   * Build collect() output untuk shape 'dict-titlecase' (IP).
   * Output: { "1": {Nama_Pasangan_Penjamin, …, Tahun_Meninggal_Penjamin}, … }
   * Catatan: key `Agama_Nikah_Penjamin` mengikuti view existing — bukan
   * `Agama_Penjamin` seperti pada draft awal design.
   */
  function collectDictTitlecase(records) {
    var out = {};
    for (var idx = 0; idx < records.length; idx++) {
      var rec = normalizeConditional(records[idx]);
      var n = idx + 1;
      out[String(n)] = {
        Nama_Pasangan_Penjamin:   rec.nama,
        Tempat_Nikah_Penjamin:    rec.tempat,
        Tanggal_Nikah_Penjamin:   rec.tanggal,
        Agama_Nikah_Penjamin:     rec.agama,
        Dasar_Nikah_Penjamin:     rec.atasDasar,
        Restu_Ortu_Penjamin:      rec.restu,
        Punya_Anak_Penjamin:      rec.punyaAnak,
        Anak_Laki_Penjamin:       rec.anakLaki || '0',
        Anak_Perempuan_Penjamin:  rec.anakPerempuan || '0',
        Status_Saat_Ini_Penjamin: rec.status,
        Tahun_Meninggal_Penjamin: rec.tahunMeninggal || ''
      };
    }
    return out;
  }

  /**
   * Convert satu objek shape 'dict' (snake_case lowercase) → EntryRecord.
   * Mentolerir alias TitleCase suffix (Nama_Pasangan_N) sebagaimana data lama
   * yang bocor antar format (lihat litmasanak.html 7488 / integrasi.html 9505).
   */
  function fromDictObject(obj, n) {
    obj = obj || {};
    var suf = '_' + n;
    return {
      nama:           pick(obj, 'nama_pasangan', 'Nama_Pasangan' + suf, 'Nama_Pasangan_Penjamin', 'Nama_Pasangan'),
      tempat:         pick(obj, 'tempat_nikah', 'Tempat_Nikah' + suf, 'Tempat_Nikah_Penjamin', 'Tempat_Nikah'),
      tanggal:        pick(obj, 'tanggal_nikah', 'Tanggal_Nikah' + suf, 'Tanggal_Nikah_Penjamin', 'Tanggal_Nikah'),
      agama:          pick(obj, 'agama', 'Agama_Nikah' + suf, 'Agama' + suf, 'Agama_Nikah_Penjamin', 'Secara_Agama' + suf),
      atasDasar:      pick(obj, 'atas_dasar', 'Atas_Dasar' + suf, 'Dasar_Nikah' + suf, 'Dasar_Nikah_Penjamin', 'Atas_Dasar'),
      restu:          pick(obj, 'restu', 'Restu_Ortu' + suf, 'Mendapat_Restu' + suf, 'Restu_Ortu_Penjamin'),
      punyaAnak:      pick(obj, 'punya_anak', 'Punya_Anak' + suf, 'Punya_Anak_Penjamin'),
      anakLaki:       pick(obj, 'anak_laki', 'Anak_Laki' + suf, 'Anak_Laki_Penjamin'),
      anakPerempuan:  pick(obj, 'anak_perempuan', 'Anak_Perempuan' + suf, 'Anak_Perempuan_Penjamin'),
      status:         pick(obj, 'status', 'Status_Saat_Ini' + suf, 'Status_Saat_Ini_Penjamin', 'status_saat_ini'),
      tahunMeninggal: pick(obj, 'tahun_meninggal', 'Tahun_Meninggal' + suf, 'Tahun_Meninggal_Penjamin')
    };
  }

  /**
   * Convert satu objek shape 'array-suffix' (TitleCase + suffix _N) → EntryRecord.
   * `idx` adalah 1-based posisi entry di dalam array; jika object tidak punya
   * suffix yang cocok dengan idx, fallback ke suffix numerik pertama yang
   * ditemukan di key (mengakomodasi data lama yang out-of-order).
   */
  function fromArraySuffixObject(obj, idx) {
    obj = obj || {};
    // Cari suffix _N pertama jika idx tidak match — biasanya idx === N tapi
    // robust terhadap data lama yang shifted.
    var suffix = idx;
    var hasIdx = false;
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] === 'Nama_Pasangan_' + idx) { hasIdx = true; break; }
    }
    if (!hasIdx) {
      for (var j = 0; j < keys.length; j++) {
        var m = /_(\d+)$/.exec(keys[j]);
        if (m) { suffix = parseInt(m[1], 10) || idx; break; }
      }
    }
    var s = '_' + suffix;
    return {
      nama:           pick(obj, 'Nama_Pasangan' + s, 'nama_pasangan'),
      tempat:         pick(obj, 'Tempat_Nikah' + s, 'tempat_nikah'),
      tanggal:        pick(obj, 'Tanggal_Nikah' + s, 'tanggal_nikah'),
      agama:          pick(obj, 'Agama_Nikah' + s, 'Agama' + s, 'Secara_Agama' + s, 'agama'),
      atasDasar:      pick(obj, 'Dasar_Nikah' + s, 'Atas_Dasar' + s, 'atas_dasar'),
      restu:          pick(obj, 'Restu_Ortu' + s, 'Mendapat_Restu' + s, 'restu'),
      punyaAnak:      pick(obj, 'Punya_Anak' + s, 'punya_anak'),
      anakLaki:       pick(obj, 'Anak_Laki' + s, 'anak_laki'),
      anakPerempuan:  pick(obj, 'Anak_Perempuan' + s, 'anak_perempuan'),
      status:         pick(obj, 'Status_Saat_Ini' + s, 'status'),
      tahunMeninggal: pick(obj, 'Tahun_Meninggal' + s, 'tahun_meninggal')
    };
  }

  /**
   * Convert satu objek shape 'dict-titlecase' (TitleCase _Penjamin) → EntryRecord.
   * Mentolerir alias snake_case lowercase agar data lama yang bocor format
   * tetap dapat dimuat (lihat integrasi.html baris 9505+ — pola yang sama).
   */
  function fromDictTitlecaseObject(obj /*, n */) {
    obj = obj || {};
    return {
      nama:           pick(obj, 'Nama_Pasangan_Penjamin', 'nama_pasangan'),
      tempat:         pick(obj, 'Tempat_Nikah_Penjamin', 'tempat_nikah'),
      tanggal:        pick(obj, 'Tanggal_Nikah_Penjamin', 'tanggal_nikah'),
      agama:          pick(obj, 'Agama_Nikah_Penjamin', 'Agama_Penjamin', 'agama'),
      atasDasar:      pick(obj, 'Dasar_Nikah_Penjamin', 'Atas_Dasar_Penjamin', 'atas_dasar'),
      restu:          pick(obj, 'Restu_Ortu_Penjamin', 'restu'),
      punyaAnak:      pick(obj, 'Punya_Anak_Penjamin', 'punya_anak'),
      anakLaki:       pick(obj, 'Anak_Laki_Penjamin', 'anak_laki'),
      anakPerempuan:  pick(obj, 'Anak_Perempuan_Penjamin', 'anak_perempuan'),
      status:         pick(obj, 'Status_Saat_Ini_Penjamin', 'status'),
      tahunMeninggal: pick(obj, 'Tahun_Meninggal_Penjamin', 'tahun_meninggal')
    };
  }

  /** Sort numeric keys ascending; non-numeric keys diabaikan. */
  function numericKeysSorted(obj) {
    if (!obj || typeof obj !== 'object') return [];
    var ks = Object.keys(obj);
    var nums = [];
    for (var i = 0; i < ks.length; i++) {
      var n = Number(ks[i]);
      if (Number.isFinite(n) && n >= 1 && Math.floor(n) === n) {
        nums.push(n);
      }
    }
    nums.sort(function (a, b) { return a - b; });
    return nums;
  }

  /**
   * collect() — bentuk payload storage sesuai `config.storage.shape`.
   * Default ke shape 'dict' bila tidak diset (aman untuk LK/LW).
   * Mengembalikan struktur kosong (`{}` / `[]`) bila container belum siap.
   */
  function collectForInstance(instance) {
    var shape = (instance.config.storage && instance.config.storage.shape) || 'dict';
    var records = collectInternal(instance);
    if (shape === 'array-suffix') return collectArraySuffix(records);
    if (shape === 'dict-titlecase') return collectDictTitlecase(records);
    // default 'dict'
    return collectDict(records);
  }

  /**
   * load(storage, opts) — render entries dari payload storage. Selalu
   * menurunkan jumlah entry dari payload itu sendiri, mengabaikan dropdown
   * legacy (Requirement 11.2). Setelah rebuild, jalankan toggles + sync
   * hidden count via `rebuild()`.
   */
  function loadForInstance(instance, storage, opts) {
    var shape = (instance.config.storage && instance.config.storage.shape) || 'dict';
    // opts default { ignoreLegacyCount: true }; saat ini selalu true — flag
    // disimpan untuk forward-compat bila kemudian ada pemanggil yang ingin
    // menghormati nilai legacy (mis. test).
    opts = opts || {};
    if (opts.ignoreLegacyCount == null) opts.ignoreLegacyCount = true;

    var records = [];
    if (storage == null) {
      // Tetap rebuild dengan list kosong agar UI bersih dan hidden count = ''.
    } else if (shape === 'array-suffix') {
      var arr = Array.isArray(storage) ? storage : [];
      for (var i = 0; i < arr.length; i++) {
        records.push(fromArraySuffixObject(arr[i] || {}, i + 1));
      }
    } else if (shape === 'dict-titlecase') {
      var nums = numericKeysSorted(storage);
      for (var j = 0; j < nums.length; j++) {
        var n = nums[j];
        records.push(fromDictTitlecaseObject(storage[String(n)] || storage[n] || {}, n));
      }
    } else {
      // 'dict'
      var nums2 = numericKeysSorted(storage);
      for (var k = 0; k < nums2.length; k++) {
        var nn = nums2[k];
        records.push(fromDictObject(storage[String(nn)] || storage[nn] || {}, nn));
      }
    }

    // rebuild() akan: clear DOM → render n=1..N → restore values → bind
    // delegasi → applyAllToggles (otomatis kosongkan field kondisional yang
    // tidak relevan) → reattach hooks → updateHiddenCount.
    rebuild(instance, records);
    return records.length;
  }

  /**
   * applyPayload(records) — entry point untuk Stopper.
   *
   * Kontrak (lihat design.md "Stopper applyMarriageHistory di-generalize"
   * dan Requirement 12.1-12.6):
   *   - `records` adalah Array<EntryRecord> yang sudah dipetakan oleh
   *     mapper Stopper (`normalizeStopperItem` di stopper-field-apply.js);
   *     setiap item idealnya berisi 11 logical key, namun field yang
   *     hilang/typo di-default ke '' di sini.
   *   - Bila `records` bukan array (null/undefined/scalar/objek), return 0
   *     tanpa mengubah DOM. Ini menjaga kompatibilitas dengan kontrak lama
   *     `applyMarriageHistory` yang juga return null/0 untuk input invalid.
   *   - Sebelum rebuild, sanitasi kondisional dijalankan via
   *     `normalizeConditional()` — sehingga payload yang menaruh nilai pada
   *     field kondisional padahal trigger tidak match (mis. anakLaki=2
   *     padahal punyaAnak='Tidak') tidak akan ditulis ke DOM (Req 12.6).
   *   - rebuild() lalu menjalankan applyAllToggles() yang juga
   *     menyembunyikan field kondisional non-relevan secara visual.
   *   - Idempotent: pemanggilan kedua dengan records yang sama menghasilkan
   *     DOM identik (rebuild selalu clear-then-render; tidak ada state per
   *     pemanggilan yang ter-akumulasi).
   *
   * @param {object} instance Resolved instance dari `register()`.
   * @param {Array<object>} records Array EntryRecord (boleh longgar).
   * @returns {number} Jumlah entry yang dirender (0 untuk input invalid).
   */
  function applyPayloadForInstance(instance, records) {
    if (!Array.isArray(records)) return 0;

    // Coerce + sanitasi kondisional sebelum hand-off ke rebuild.
    var sanitized = new Array(records.length);
    for (var i = 0; i < records.length; i++) {
      var raw = records[i];
      // Bangun shape canonical 11 field (default '' bila hilang).
      // emptyRecord() + spread tiap key dari raw bila bertipe object.
      var rec = emptyRecord();
      if (raw && typeof raw === 'object') {
        for (var j = 0; j < LOGICAL_KEYS.length; j++) {
          var lk = LOGICAL_KEYS[j];
          var v = raw[lk];
          rec[lk] = (v == null) ? '' : String(v);
        }
      }
      // Sanitasi kondisional (Req 12.6) — kosongkan field yang tidak relevan
      // dengan trigger sebelum rebuild menulis ke DOM.
      sanitized[i] = normalizeConditional(rec);
    }

    rebuild(instance, sanitized);
    return sanitized.length;
  }

  /**
   * Rebuild penuh container dari snapshot.
   *
   * `snapshot` boleh:
   *   - Array<EntryRecord>  → uid diambil dari blok lama pada posisi sama,
   *     atau uid baru di-generate jika tidak ada.
   *   - Array<{record, uid}> → uid eksplisit per entry, mengikuti record-nya.
   *
   *   1. (jika snapshot pakai uid eksplisit, pakai itu; lainnya snapshot uid
   *      blok lama agar mapping posisional fallback masih berfungsi).
   *   2. container.innerHTML = ''.
   *   3. Loop n=1..N append render(n, {uid}) + footer satu kali di akhir.
   *   4. Loop kedua writeFieldsToDom(n, snapshot[n-1]).
   *   5. Pastikan delegasi event terpasang.
   *   6. Re-attach hooks + sync hidden count.
   *
   * `options.newUids` opsional: map index→uid baru (override). Dipakai
   * addEntry untuk memberi uid fresh ke entry baru.
   */
  function rebuild(instance, snapshot, options) {
    var container = instance.container();
    if (!container) return;
    snapshot = Array.isArray(snapshot) ? snapshot : [];
    options = options || {};

    // Normalisasi: pisahkan records & uids dari snapshot.
    var records = new Array(snapshot.length);
    var snapshotUidsArr = new Array(snapshot.length);
    var hasExplicitUids = false;
    for (var si = 0; si < snapshot.length; si++) {
      var item = snapshot[si];
      if (item && typeof item === 'object' && 'record' in item) {
        records[si] = item.record || emptyRecord();
        snapshotUidsArr[si] = item.uid || '';
        if (snapshotUidsArr[si]) hasExplicitUids = true;
      } else {
        records[si] = item || emptyRecord();
        snapshotUidsArr[si] = '';
      }
    }

    // Fallback positional jika snapshot tidak membawa uid: pakai uid blok
    // lama (urutan saat ini) — kompatibel dengan caller yang mengirim
    // Array<EntryRecord> seperti load() / applyPayload().
    var existingUids = hasExplicitUids ? null : snapshotUids(instance);
    var newUids = options.newUids || {};

    // Bersihkan DOM lama
    container.innerHTML = '';

    // Loop render — hanya satu footer di akhir
    var html = '';
    for (var n = 1; n <= records.length; n++) {
      var idx = n - 1;
      var uid = '';
      if (newUids[idx] != null && newUids[idx] !== '') {
        uid = String(newUids[idx]);
      } else if (snapshotUidsArr[idx]) {
        uid = snapshotUidsArr[idx];
      } else if (existingUids && existingUids[idx]) {
        uid = existingUids[idx];
      } else {
        uid = generateUid(instance);
      }
      html += instance.render(n, { uid: uid });
    }
    html += instance.renderFooter();
    container.insertAdjacentHTML('beforeend', html);

    // Restore values
    for (var m = 1; m <= records.length; m++) {
      writeFieldsToDom(instance, m, records[m - 1]);
    }

    // Pastikan delegasi event terpasang sekali per container
    bindDelegation(instance);

    // Selaraskan visibilitas field kondisional dengan nilai trigger
    // yang baru di-restore (Requirement 7.1-7.4).
    applyAllToggles(instance);

    // Re-attach external hooks + sync hidden count
    reattachHooks(instance);
    updateHiddenCount(instance, records.length);
  }

  /** Generate uid baru per instance (stable seed agar tidak collide). */
  function generateUid(instance) {
    instance._uidSeq = (instance._uidSeq | 0) + 1;
    return (instance.key || 'me') + '-' + Date.now().toString(36) + '-' + instance._uidSeq.toString(36);
  }

  /**
   * Pasang event-delegation tunggal di container (idempotent via flag).
   * Meng-handle:
   *   - click pada .me-add / .me-del / .me-up / .me-down
   *   - change pada select trigger (punyaAnak / status) → toggleConditional
   *
   * Karena listener di-pasang sekali pada container dan event di-bubble dari
   * child, listener tetap valid setelah rebuild walaupun innerHTML diganti.
   */
  function bindDelegation(instance) {
    var container = instance.container();
    if (!container) return;
    if (instance._delegatedBound && instance._delegatedContainer === container) return;

    container.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('.me-btn') : null;
      if (!btn || !container.contains(btn)) return;

      if (btn.classList.contains('me-add')) {
        instance.addEntry();
        return;
      }
      var block = btn.closest('.me-block');
      if (!block) return;
      var pos = parseInt(block.getAttribute('data-me-pos'), 10);
      if (!pos || pos < 1) return;

      if (btn.classList.contains('me-del'))  { instance.removeEntry(pos); return; }
      if (btn.classList.contains('me-up'))   { instance.moveUp(pos);      return; }
      if (btn.classList.contains('me-down')) { instance.moveDown(pos);    return; }
    });

    container.addEventListener('change', function (e) {
      var target = e.target;
      if (!target || !target.id) return;
      var block = target.closest ? target.closest('.me-block') : null;
      if (!block || !container.contains(block)) return;
      var pos = parseInt(block.getAttribute('data-me-pos'), 10);
      if (!pos || pos < 1) return;

      var fmap = instance.config.fieldMap;
      if (!fmap) return;
      // Cocokkan id target ke trigger field (punyaAnak/status) untuk pos ini.
      if (fmap.punyaAnak && target.id === applyIdTpl(fmap.punyaAnak.idTpl, pos)) {
        toggleConditional(instance, pos, 'anak');
        return;
      }
      if (fmap.status && target.id === applyIdTpl(fmap.status.idTpl, pos)) {
        toggleConditional(instance, pos, 'meninggal');
        return;
      }
    });

    instance._delegatedBound = true;
    instance._delegatedContainer = container;

    // Pasang DnD bindings pada container yang sama.
    bindDnd(instance);
  }

  // ────────────────────────────────────────────────────────────────────────
  // HTML5 drag-and-drop bindings (task 1.6)
  //
  // Satu set listener per instance, idempotent via flag `_dndDelegatedBound`.
  // Listener dipasang pada container (event delegation) sehingga tetap valid
  // setelah rebuild yang mengganti innerHTML — selama container yang sama
  // dipertahankan (instance memang menahan ref container DOM, lihat
  // bindDelegation() di atas).
  //
  // Kontrak:
  //   - Drop hanya boleh di dalam container source. Bila `dragSrcContainer`
  //     bukan container instance ini saat dragover/drop, handler tidak
  //     memanggil preventDefault → browser tidak mengizinkan drop, urutan
  //     tidak berubah (Requirement 4.2).
  //   - Indikator `me-drop-before`/`me-drop-after` di-toggle pada blok yang
  //     dihover; indikator dari blok lain dibersihkan agar hanya satu
  //     indikator aktif sekaligus.
  //   - Pada drop, hitung index final dengan rumus design.md, lalu panggil
  //     `instance.moveTo(from, to)`. Karena moveTo bekerja pada snapshot
  //     EntryRecord lengkap, seluruh 11 field pasangan ikut pindah
  //     (Requirement 4.3).
  //   - Pada dragend (atau ketika listener dragleave/drop selesai),
  //     bersihkan kelas `me-dragging` + semua `me-drop-before/after`.
  // ────────────────────────────────────────────────────────────────────────

  /** Hitung posisi 1-based blok di dalam container-nya. */
  function blockIndex(blockEl) {
    if (!blockEl || !blockEl.parentElement) return 0;
    var siblings = blockEl.parentElement.querySelectorAll('.me-block');
    for (var i = 0; i < siblings.length; i++) {
      if (siblings[i] === blockEl) return i + 1;
    }
    return 0;
  }

  /** Hapus indikator drop-before/after dari semua blok di container. */
  function clearDropIndicators(container) {
    if (!container) return;
    var marked = container.querySelectorAll('.me-drop-before, .me-drop-after');
    for (var i = 0; i < marked.length; i++) {
      marked[i].classList.remove('me-drop-before', 'me-drop-after');
    }
  }

  function isFormDragTarget(target) {
    return !!(target && target.closest && target.closest('input, textarea, select, option'));
  }

  function setBlockDraggableFromTarget(target, enabled) {
    var block = target && target.closest ? target.closest('.me-block') : null;
    if (!block) return;
    block.setAttribute('draggable', enabled ? 'true' : 'false');
  }

  function restoreBlockDraggableFromEvent(e) {
    var target = e && e.target;
    if (!isFormDragTarget(target)) return;
    setBlockDraggableFromTarget(target, true);
  }

  /**
   * Pasang drag-and-drop bindings pada container instance (idempotent).
   * State drag (`dragging`, `dragSrcContainer`) disimpan di closure per
   * instance — instance lain memiliki closure terpisah sehingga drop
   * antar-section otomatis di-ignore.
   */
  function bindDnd(instance) {
    var container = instance.container();
    if (!container) return;
    if (instance._dndDelegatedBound && instance._dndDelegatedContainer === container) return;

    var dragging = null;            // <div.me-block> yang sedang di-drag
    var dragSrcContainer = null;    // container asal drag

    container.addEventListener('pointerdown', function (e) {
      if (isFormDragTarget(e.target)) setBlockDraggableFromTarget(e.target, false);
    }, true);

    container.addEventListener('mousedown', function (e) {
      if (isFormDragTarget(e.target)) setBlockDraggableFromTarget(e.target, false);
    }, true);

    container.addEventListener('touchstart', function (e) {
      if (isFormDragTarget(e.target)) setBlockDraggableFromTarget(e.target, false);
    }, true);

    container.addEventListener('focusin', function (e) {
      if (isFormDragTarget(e.target)) setBlockDraggableFromTarget(e.target, false);
    }, true);

    container.addEventListener('pointerup', restoreBlockDraggableFromEvent, true);
    container.addEventListener('mouseup', restoreBlockDraggableFromEvent, true);
    container.addEventListener('touchend', restoreBlockDraggableFromEvent, true);
    container.addEventListener('focusout', restoreBlockDraggableFromEvent, true);

    container.addEventListener('dragstart', function (e) {
      // Jangan mulai drag bila sumbernya adalah elemen form interaktif
      // (input/textarea/select) — biarkan browser handle text selection.
      var t = e.target;
      if (t && t.closest && t.closest('input, textarea, select')) {
        return;
      }
      var block = t && t.closest ? t.closest('.me-block') : null;
      if (!block || !container.contains(block)) return;

      dragging = block;
      dragSrcContainer = block.parentElement;
      block.classList.add('me-dragging');

      try {
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          var uid = block.getAttribute('data-me-uid') || '';
          e.dataTransfer.setData('text/plain', uid);
        }
      } catch (_e) { /* no-op (beberapa env throw saat setData) */ }
    });

    container.addEventListener('dragover', function (e) {
      // Drop hanya valid bila source container sama dengan container ini.
      if (!dragging || dragSrcContainer !== container) return;
      var target = e.target && e.target.closest ? e.target.closest('.me-block') : null;
      if (!target || !container.contains(target)) return;
      // Tidak mempengaruhi diri sendiri (no-op visual ketika hover blok asal).
      if (target === dragging) {
        clearDropIndicators(container);
        e.preventDefault();
        return;
      }

      e.preventDefault();
      try { if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'; } catch (_e) { /* no-op */ }

      var rect = target.getBoundingClientRect();
      var before = (e.clientY - rect.top) < (rect.height / 2);

      // Bersihkan indikator dari blok-blok lain agar hanya satu aktif.
      var marked = container.querySelectorAll('.me-drop-before, .me-drop-after');
      for (var i = 0; i < marked.length; i++) {
        if (marked[i] !== target) {
          marked[i].classList.remove('me-drop-before', 'me-drop-after');
        }
      }
      target.classList.toggle('me-drop-before', before);
      target.classList.toggle('me-drop-after', !before);
    });

    container.addEventListener('drop', function (e) {
      if (!dragging || dragSrcContainer !== container) return;
      var target = e.target && e.target.closest ? e.target.closest('.me-block') : null;
      if (!target || !container.contains(target)) return;

      e.preventDefault();

      // Drop pada diri sendiri → no-op (tetap clear indikator via dragend).
      if (target === dragging) return;

      var before = target.classList.contains('me-drop-before');
      // Bila tidak ada indikator (mis. dragover belum sempat fire), default ke
      // sisi top-half/bottom-half berdasarkan posisi cursor.
      if (!before && !target.classList.contains('me-drop-after')) {
        var rect = target.getBoundingClientRect();
        before = (e.clientY - rect.top) < (rect.height / 2);
      }

      var from = blockIndex(dragging);
      var to = blockIndex(target);
      if (!from || !to) return;
      if (!before) to += 1;
      if (to > from) to -= 1;
      if (to === from) return; // no-op urutan tidak berubah

      instance.moveTo(from, to);
    });

    // dragend selalu dipanggil di akhir gesture (sukses atau batal). Kita
    // bersihkan visual state di sini agar drop-di-luar-container atau drop
    // yang dibatalkan tidak meninggalkan indikator/opacity yang menempel.
    container.addEventListener('dragend', function () {
      if (dragging) dragging.classList.remove('me-dragging');
      clearDropIndicators(container);
      dragging = null;
      dragSrcContainer = null;
    });

    // Saat cursor meninggalkan blok target, hapus indikator pada blok itu.
    // dragover akan men-set ulang ketika kembali. Tanpa ini, indikator
    // menempel sampai dragover berikutnya — terasa lengket.
    container.addEventListener('dragleave', function (e) {
      var target = e.target && e.target.closest ? e.target.closest('.me-block') : null;
      if (!target || !container.contains(target)) return;
      // Hanya bersihkan jika cursor benar-benar keluar dari blok (relatedTarget
      // bukan keturunan blok yang sama). Cegah flicker saat lewat antar-anak.
      var rt = e.relatedTarget;
      if (rt && target.contains(rt)) return;
      target.classList.remove('me-drop-before', 'me-drop-after');
    });

    instance._dndDelegatedBound = true;
    instance._dndDelegatedContainer = container;
  }

  // ────────────────────────────────────────────────────────────────────────
  // Required field validation (task 5.1)
  //
  // `requiredFieldIdsForInstance(instance, i)`:
  //   Mengembalikan Array<{id, label}> untuk field yang `required: true`
  //   pada CANONICAL_FIELD_DEFS DAN sedang visible di DOM untuk entry `i`
  //   (1-based). Visibility ditentukan oleh `style.display !== 'none'`
  //   pada elemen input — sesuai kontrak `setFieldVisibility` yang men-set
  //   `display:none` untuk field kondisional yang sedang hidden.
  //
  // `chkRiwayatNikahFn(loc, missingArr, pfx)`:
  //   Helper top-level yang memvalidasi seluruh entries pada satu lokasi.
  //   Dipakai oleh `views/litmasanak.html` & `views/integrasi.html`
  //   menggantikan loop `chk(...)` lama. Defensive — no-op untuk lokasi
  //   yang belum di-register atau container yang belum dirender.
  // ────────────────────────────────────────────────────────────────────────

  /** Cek visibilitas elemen relative ke kontrak conditional toggle. */
  function _isFieldVisible(el) {
    if (!el) return false;
    // setFieldVisibility set inline `display:none` saat hidden, dan
    // `display:''` saat visible. Properti `style.display` mencerminkan
    // inline style (kontrak truth untuk field kondisional di sini).
    return el.style && el.style.display !== 'none';
  }

  /**
   * Daftar field required + visible untuk entry `i` pada instance.
   * @param {object} instance
   * @param {number} i 1-based posisi entry
   * @returns {Array<{id:string, label:string}>}
   */
  function requiredFieldIdsForInstance(instance, i) {
    var pos = i | 0;
    if (pos < 1) return [];
    if (!instance || !instance.config || !instance.config.fieldMap) return [];
    var fmap = instance.config.fieldMap;
    var out = [];
    for (var k = 0; k < LOGICAL_KEYS.length; k++) {
      var lk = LOGICAL_KEYS[k];
      var def = fmap[lk];
      if (!def || !def.required) continue;
      var id = applyIdTpl(def.idTpl, pos);
      var el = document.getElementById(id);
      if (!el) continue;                 // blok belum dirender → skip
      if (!_isFieldVisible(el)) continue; // field hidden via toggle → skip
      out.push({ id: id, label: def.label || lk });
    }
    return out;
  }

  /**
   * Baca nilai field via LFormSchema (sudah trimmed) bila tersedia,
   * fallback ke `document.getElementById(id)?.value` (lalu trim).
   */
  function _readFieldValue(id) {
    try {
      if (window.LFormSchema && typeof window.LFormSchema.value === 'function') {
        return window.LFormSchema.value(id);
      }
    } catch (_e) { /* fall through */ }
    var el = document.getElementById(id);
    if (!el) return '';
    var v = el.value;
    if (typeof v !== 'string') v = String(v == null ? '' : v);
    return v.trim();
  }

  /**
   * `chkRiwayatNikah(loc, missingArr, pfx)` — validasi section riwayat
   * pernikahan untuk satu lokasi.
   *
   * Aturan (Requirement 13.1, 13.2, 13.3):
   *   - `pfx` default `''`.
   *   - Lokasi tidak ter-register atau container missing → no-op.
   *   - `count() === 0` → push `pfx + 'Riwayat Pernikahan (minimal 1 entry)'`.
   *   - Selainnya: untuk tiap entry i=1..count, ambil requiredFieldIds(i)
   *     (otomatis sudah memfilter field hidden), lalu untuk tiap field
   *     bila value kosong → push `pfx + 'Pernikahan ke-' + i + ' > ' + label`.
   *
   * @param {string} loc 'LK' | 'LW' | 'IK' | 'IP'
   * @param {Array<string>} missingArr Akumulator pesan validasi.
   * @param {string} [pfx] Prefiks pesan, default ''.
   */
  function chkRiwayatNikahFn(loc, missingArr, pfx) {
    if (!Array.isArray(missingArr)) return;
    var prefix = (pfx == null) ? '' : String(pfx);
    var inst = byKey(loc);
    if (!inst) return;
    var c = (typeof inst.container === 'function') ? inst.container() : null;
    if (!c) return;
    var n = (typeof inst.count === 'function') ? (inst.count() | 0) : 0;
    if (n === 0) {
      missingArr.push(prefix + 'Riwayat Pernikahan (minimal 1 entry)');
      return;
    }
    for (var i = 1; i <= n; i++) {
      var fields = requiredFieldIdsForInstance(inst, i);
      for (var fi = 0; fi < fields.length; fi++) {
        var f = fields[fi];
        var val = _readFieldValue(f.id);
        if (typeof val === 'string') val = val.trim();
        if (!val) {
          missingArr.push(prefix + 'Pernikahan ke-' + i + ' > ' + f.label);
        }
      }
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Registry & factory
  // ────────────────────────────────────────────────────────────────────────

  /** @type {Object<string, object>} */
  var REGISTRY = {};

  /**
   * Factory `register(config)` — mendaftarkan satu instance Riwayat_Section.
   *
   * Config minimal:
   *   { key: 'LK' | 'LW' | 'IK' | 'IP' }
   *
   * Override yang umum:
   *   { containerId, blockTitle(n), hidden:{countFieldId}, storage:{shape},
   *     fieldMap (override penuh), addLabel, hooks:{onChange, progress} }
   *
   * Mengembalikan instance dengan permukaan API publik. CRUD lengkap
   * (addEntry, removeEntry, moveUp/Down, moveTo, renumber, collect, load,
   * applyPayload, toggleConditional, count) diimplementasikan pada task 1.2 dst.
   * Sampai itu selesai, method-method tersebut adalah stub yang men-log
   * peringatan dan mengembalikan nilai netral.
   */
  function register(config) {
    if (!config || typeof config !== 'object') {
      throw new TypeError('[MarriageEntries] register() butuh objek config');
    }
    var key = config.key;
    if (!key || !LOCATION_DEFAULTS[key]) {
      throw new Error('[MarriageEntries] register() butuh config.key valid (LK|LW|IK|IP), got: ' + key);
    }

    // Susun config effective dengan default + fieldMap canonical untuk lokasi.
    var defaults = LOCATION_DEFAULTS[key];
    var resolved = mergeDeep(defaults, config);
    if (!resolved.fieldMap) {
      resolved.fieldMap = buildFieldMap(key);
    }
    if (!resolved.hooks) resolved.hooks = {};
    if (typeof resolved.blockTitle !== 'function') {
      resolved.blockTitle = defaults.blockTitle;
    }

    // Instance: render helpers tersedia langsung; CRUD lengkap
    // diimplementasikan via closure di bawah.
    var instance = {
      key: resolved.key,
      config: resolved,
      _uidSeq: 0,
      _delegatedBound: false,
      _delegatedContainer: null,
      _dndDelegatedBound: false,
      _dndDelegatedContainer: null,

      /** Render template satu Entry (lihat `render(config, n)` di luar instance). */
      render: function (n, opts) { return render(resolved, n, opts); },

      /** Render footer "+ Tambah" untuk section ini. */
      renderFooter: function () { return renderFooter(resolved); },

      /** Akses container DOM (boleh `null` saat view belum ready). */
      container: function () {
        return document.getElementById(resolved.containerId);
      },

      // ── CRUD ─────────────────────────────────────────────────────────────
      addEntry: function () {
        var snapshot = collectInternalAnnotated(instance);
        snapshot.push({ record: emptyRecord(), uid: generateUid(instance) });
        rebuild(instance, snapshot);
        return snapshot.length;
      },

      removeEntry: function (i) {
        var snapshot = collectInternalAnnotated(instance);
        var idx = (i | 0);
        if (idx < 1 || idx > snapshot.length) return snapshot.length; // no-op
        snapshot.splice(idx - 1, 1);
        rebuild(instance, snapshot);
        return snapshot.length;
      },

      moveUp: function (i) {
        var idx = (i | 0);
        if (idx <= 1) return; // no-op
        var snapshot = collectInternalAnnotated(instance);
        if (idx > snapshot.length) return; // out-of-range
        var tmp = snapshot[idx - 1];
        snapshot[idx - 1] = snapshot[idx - 2];
        snapshot[idx - 2] = tmp;
        rebuild(instance, snapshot);
      },

      moveDown: function (i) {
        var snapshot = collectInternalAnnotated(instance);
        var idx = (i | 0);
        if (idx < 1 || idx >= snapshot.length) return; // no-op (termasuk i==N)
        var tmp = snapshot[idx - 1];
        snapshot[idx - 1] = snapshot[idx];
        snapshot[idx] = tmp;
        rebuild(instance, snapshot);
      },

      moveTo: function (from, to) {
        var snapshot = collectInternalAnnotated(instance);
        var len = snapshot.length;
        if (len === 0) return;
        var f = (from | 0);
        var t = (to | 0);
        if (f < 1) f = 1; else if (f > len) f = len;
        if (t < 1) t = 1; else if (t > len) t = len;
        if (f === t) return;
        var item = snapshot.splice(f - 1, 1)[0];
        snapshot.splice(t - 1, 0, item);
        rebuild(instance, snapshot);
      },

      renumber: function () {
        // Pure reindex titles + ids tanpa mengubah urutan logis. Karena
        // rebuild loop sudah memakai n=1..N berurutan, ini sama dengan
        // rebuild dari snapshot saat ini.
        rebuild(instance, collectInternalAnnotated(instance));
      },

      rebuild: function () {
        rebuild(instance, collectInternalAnnotated(instance));
      },

      count: function () {
        var c = instance.container();
        return c ? c.querySelectorAll('.me-block').length : 0;
      },

      // ── Storage I/O (task 1.4) ───────────────────────────────────────────
      collect: function () {
        return collectForInstance(instance);
      },
      load: function (storage, opts) {
        return loadForInstance(instance, storage, opts);
      },

      // ── Stopper applyPayload (task 1.5) ──────────────────────────────────
      applyPayload: function (records) {
        return applyPayloadForInstance(instance, records);
      },

      // ── Stubs untuk task lain (required) ─────────────────────────────────
      requiredFieldIds:  function (i) { return requiredFieldIdsForInstance(instance, i); },

      // ── Conditional toggles & hidden count (task 1.10) ───────────────────
      toggleConditional: function (i, kind) {
        toggleConditional(instance, i, kind);
      },
      updateHiddenCount: function () {
        updateHiddenCount(instance, instance.count());
      }
    };

    REGISTRY[key] = instance;

    // Initial render: bila container ada dan masih benar-benar kosong (no
    // `.me-block` dan no `.me-section-footer`), rebuild([]) sehingga footer
    // "+ Tambah" terlihat dan delegasi event terpasang sejak awal. Ini
    // belt-and-suspenders untuk UX path yang belum men-trigger
    // updateMarriageVisibility/onStatusPenjaminChange/onWaliStatusChange.
    // Idempotent: tidak menambah blok bila sudah ada (rebuild akan reset
    // tetapi seed entry didelegasikan ke visibility helper di view).
    try {
      var _initContainer = instance.container();
      if (_initContainer
          && _initContainer.querySelector('.me-block') == null
          && _initContainer.querySelector('.me-section-footer') == null) {
        rebuild(instance, []);
      }
    } catch (_e) { /* defensive: jangan throw saat register */ }

    return instance;
  }

  function _stubWarn(name) {
    try {
      if (window.console && console.warn) {
        console.warn('[MarriageEntries] ' + name + ' belum diimplementasikan (skeleton task 1.1)');
      }
    } catch (_e) { /* no-op */ }
  }

  /** Lookup instance terdaftar berdasarkan key lokasi. */
  function byKey(loc) {
    return REGISTRY[loc] || null;
  }

  // ────────────────────────────────────────────────────────────────────────
  // Public surface
  // ────────────────────────────────────────────────────────────────────────

  window.MarriageEntries = {
    __ready: true,
    LOGICAL_KEYS: LOGICAL_KEYS,
    register: register,
    byKey: byKey,
    render: render,
    renderFooter: renderFooter,
    emptyRecord: emptyRecord,
    buildFieldMap: buildFieldMap,
    // Ekspose tabel deskriptor agar test/QA dapat memeriksa kontrak id.
    _LOCATION_DEFAULTS: LOCATION_DEFAULTS,
    _LOCATION_FIELD_TEMPLATES: LOCATION_FIELD_TEMPLATES,
    _CANONICAL_FIELD_DEFS: CANONICAL_FIELD_DEFS,
    _registry: REGISTRY,
    // Internal helpers (untuk test/diagnostik task 1.3+).
    _collectInternal: collectInternal,
    _collectInternalAnnotated: collectInternalAnnotated,
    _writeFieldsToDom: writeFieldsToDom,
    _rebuild: rebuild,
    _bindDelegation: bindDelegation,
    _bindDnd: bindDnd,
    _syncHiddenCount: syncHiddenCount,
    _updateHiddenCount: updateHiddenCount,
    _toggleConditional: toggleConditional,
    _applyAllToggles: applyAllToggles,
    // Storage adapters (task 1.4) — eksposed untuk test/diagnostik.
    _normalizeConditional: normalizeConditional,
    _collectDict: collectDict,
    _collectArraySuffix: collectArraySuffix,
    _collectDictTitlecase: collectDictTitlecase,
    _fromDictObject: fromDictObject,
    _fromArraySuffixObject: fromArraySuffixObject,
    _fromDictTitlecaseObject: fromDictTitlecaseObject,
    _numericKeysSorted: numericKeysSorted,
    // Stopper applyPayload (task 1.5) — eksposed untuk test/diagnostik.
    _applyPayload: applyPayloadForInstance,
    // Validasi riwayat pernikahan (task 5.1).
    chkRiwayatNikah: chkRiwayatNikahFn,
    _requiredFieldIdsFor: requiredFieldIdsForInstance
  };

  function autoRegisterPageInstances() {
    try {
      var bodyModule = document.body && document.body.getAttribute('data-libero-module');
      var title = String(document.title || '').toLowerCase();
      var moduleName = bodyModule ? String(bodyModule).toLowerCase() : title;

      function has(id) {
        return !!document.getElementById(id);
      }

      function ensure(key) {
        if (!byKey(key)) register({ key: key });
      }

      if (has('marriage-frames')) {
        ensure(moduleName === 'litmasanak' || moduleName.indexOf('anak') >= 0 ? 'LK' : 'IK');
      }
      if (has('penjamin-marriage-frames')) ensure('IP');
      if (has('wali-nikah-detail')) ensure('LW');
    } catch (e) {
      try { console.warn('[MarriageEntries] auto-register gagal', e); } catch (_e) { /* no-op */ }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoRegisterPageInstances);
  } else {
    autoRegisterPageInstances();
  }

  // ────────────────────────────────────────────────────────────────────────
  // Shim level-window untuk inline handler lama (task 1.7)
  //
  // Selama migrasi `views/litmasanak.html` & `views/integrasi.html`, atribut
  // `onchange="..."` inline pada select/jumlah-pernikahan masih memanggil
  // nama global lama. Shim di bawah men-dispatch panggilan tersebut ke
  // instance MarriageEntries yang sesuai (lihat Requirement 6.1 & 15.3).
  //
  // Aturan:
  //  • Selalu meng-overwrite (nama-nama ini dimiliki modul pasca-migrasi).
  //  • try/catch defensif: bila instance terkait belum di-register
  //    (mis. handler inline ter-fire sebelum bootstrap), shim menjadi
  //    silent no-op alih-alih melempar.
  // ────────────────────────────────────────────────────────────────────────

  function _safeRebuild(loc) {
    try {
      var inst = byKey(loc);
      if (!inst) return;
      var countFieldId = inst.config && inst.config.hidden && inst.config.hidden.countFieldId;
      var countEl = countFieldId ? document.getElementById(countFieldId) : null;
      if (countEl && typeof inst.addEntry === 'function' && typeof inst.removeEntry === 'function') {
        var target = parseInt(countEl.value || '0', 10) || 0;
        var current = typeof inst.count === 'function' ? inst.count() : 0;
        while (current < target) current = inst.addEntry();
        while (current > target) current = inst.removeEntry(current);
      }
      if (typeof inst.rebuild === 'function') inst.rebuild();
    } catch (_e) { /* no-op */ }
  }

  function _primaryMarriageKey() {
    try {
      var bodyModule = document.body && String(document.body.getAttribute('data-libero-module') || '').toLowerCase();
      if (bodyModule === 'integrasi') return 'IK';
      if (bodyModule === 'litmasanak') return 'LK';
      if (byKey('IK')) return 'IK';
    } catch (_e) { /* no-op */ }
    return 'LK';
  }

  function _safeToggle(loc, n, kind) {
    try {
      var inst = byKey(loc);
      if (inst && typeof inst.toggleConditional === 'function') {
        inst.toggleConditional(n, kind);
      }
    } catch (_e) { /* no-op */ }
  }

  window.updateMarriageFrames         = function ()       { _safeRebuild(_primaryMarriageKey()); };
  window.updatePenjaminMarriageFrames = function ()       { _safeRebuild('IP'); };
  window.onWaliJmlNikahChange         = function ()       { _safeRebuild('LW'); };
  window.onMarriageAnakChange         = function (n)      { _safeToggle(_primaryMarriageKey(), n, 'anak'); };
  window.onMarriageStatusChange       = function (n)      { _safeToggle(_primaryMarriageKey(), n, 'meninggal'); };
  window.onPMFAnakChange              = function (n)      { _safeToggle('IP', n, 'anak'); };
  window.onPMFStatusChange            = function (n)      { _safeToggle('IP', n, 'meninggal'); };
  window.onWaliPunyaAnakChange        = function (n, _v)  { _safeToggle('LW', n, 'anak'); };
  window.onWaliNikahStatusChange      = function (n, _v)  { _safeToggle('LW', n, 'meninggal'); };

})();
