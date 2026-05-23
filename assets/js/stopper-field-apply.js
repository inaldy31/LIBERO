// LIBERO: Logic penerapan field hasil review Stopper ke data formulir.
(function installStopperFieldApply() {
  var DEFAULT_BLACKLIST = [
    'f-kantor-wilayah', 'f-nama-upt', 'f-alamat-upt', 'f-laman-upt', 'f-email-upt',
    'f-nama-kepala-upt', 'f-kode-surat-upt', 'f-nomor-pengantar', 'f-tgl-pengantar',
    'f-tambahkan-pengantar', 'f-tembusan-pengadilan', 'f-tembusan-kejaksaan',
    'f-nama-petugas', 'f-nip-petugas', 'f-jabatan', 'f-kota-pembuatan', 'f-tahun-pembuatan',
    'f-nomor-register-litmas', 'f-tgl-mulai-penelitian', 'f-tgl-akhir-penelitian',
    'f-tgl-terima', 'f-tgl-pengantar', 'f-nomor-register-anak',
    'kantor-wilayah', 'nama-upt', 'alamat-upt', 'laman-upt', 'email-upt',
    'nama-kepala-upt', 'kode-surat-upt', 'nomor-pengantar', 'tgl-pengantar',
    'nama-petugas', 'nip-petugas', 'jabatan', 'kota-pembuatan', 'tahun-pembuatan',
    'nomor-register-litmas', 'tgl-mulai-penelitian', 'tgl-akhir-penelitian', 'tgl-terima',
    'kantor_wilayah', 'nama_upt', 'alamat_upt', 'nama_petugas', 'nip_petugas',
    'nomor_register_litmas'
  ];
  var _debugEnabled = false;

  function setDebug(enabled) {
    _debugEnabled = !!enabled;
  }

  function isDebugEnabled() {
    try {
      if (window.LIBERO_STOPPER_DEBUG === true) return true;
      if (window.localStorage && window.localStorage.getItem('libero.stopper.debug') === '1') return true;
    } catch (_e) { }
    return _debugEnabled;
  }

  function stopperLog(level, stage, message, detail) {
    var method = level === 'error' ? 'error' : (level === 'warn' ? 'warn' : 'info');
    if (method === 'info' && !isDebugEnabled()) return;
    try {
      var prefix = '[Stopper][' + stage + '] ' + message;
      if (detail !== undefined) console[method](prefix, detail);
      else console[method](prefix);
    } catch (_e) { }
  }

  function isEmptyValue(value) {
    if (value == null) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return String(value).trim() === '';
  }

  function createApplyStats() {
    return {
      selected: 0,
      filled: 0,
      applied: [],
      skipped: [],
      warnings: []
    };
  }

  function recordSkip(stats, field, reason, detail) {
    var item = { field: field, reason: reason };
    if (detail !== undefined) item.detail = detail;
    stats.skipped.push(item);
    if (reason !== 'empty' && reason !== 'blacklisted') {
      stats.warnings.push(item);
      stopperLog('warn', 'apply', field + ' dilewati: ' + reason, detail);
    } else {
      stopperLog('info', 'apply', field + ' dilewati: ' + reason, detail);
    }
  }

  function recordApply(stats, field, filled) {
    stats.applied.push({ field: field, filled: filled || 0 });
    stats.filled += filled || 0;
    stopperLog('info', 'apply', field + ' diterapkan', { filled: filled || 0 });
  }

  /* Family target map.
     Catatan: tabel "Susunan Keluarga Klien" terpisah sudah dihapus dari UI.
     `susunan_keluarga_klien` kini di-route ke tabel utama (bersama),
     dengan side-effect set `f-susunan-keluarga = "Tidak"`. */
  var FAMILY_TARGETS = {
    susunan_keluarga: { arrayName: 'anggotaBersama', tbody: 'tbody-bersama', label: 'Susunan Keluarga (Bersama)' },
    'f-susunan_keluarga': { arrayName: 'anggotaBersama', tbody: 'tbody-bersama', label: 'Susunan Keluarga (Bersama)' },
    susunan_keluarga_penjamin: { arrayName: 'anggotaPenjamin', tbody: 'tbody-penjamin', label: 'Susunan Keluarga Penjamin' },
    susunan_keluarga_klien: { arrayName: 'anggotaBersama', tbody: 'tbody-bersama', label: 'Susunan Keluarga Klien' }
  };

  /* Marriage target map (Stopper multi-subject dispatch — Requirement 12.1-12.6).
     Setiap fid Stopper dipetakan ke key lokasi MarriageEntries:
       riwayat_pernikahan          → LK (Klien Litmas Anak)
       riwayat_pernikahan_penjamin → IP (Penjamin Integrasi)
       riwayat_pernikahan_wali     → LW (Wali Litmas Anak)
     applyMarriageHistory(fid, value) menjadi dispatcher tipis: cari instance
     via MarriageEntries.byKey(loc) lalu panggil applyPayload(records) di mana
     records dihasilkan oleh normalizeStopperItem() (alias-tolerant). */
  var MARRIAGE_TARGETS = {
    riwayat_pernikahan:          { keys: ['IK', 'LK'], subjectLabel: 'Klien' },
    riwayat_pernikahan_penjamin: { keys: ['IP'], subjectLabel: 'Penjamin' },
    riwayat_pernikahan_wali:     { keys: ['LW'], subjectLabel: 'Wali' }
  };

  /* First-non-empty helper: kembalikan argumen pertama yang non-kosong setelah
     dikonversi ke string. Dipakai oleh normalizeStopperItem agar pemilihan
     alias mengikuti urutan prioritas yang diberikan (alias modern → legacy). */
  function pickStr() {
    for (var i = 0; i < arguments.length; i++) {
      var v = arguments[i];
      if (v == null) continue;
      var s = String(v);
      if (s !== '') return s;
    }
    return '';
  }

  /* Konversi satu item payload Stopper menjadi canonical EntryRecord 11 field.
     Mendukung alias-alias historis pada output Stopper:
       nama          ← nama_pasangan | nama
       tempat        ← tempat_nikah  | tempat
       tanggal       ← tanggal_nikah | tanggal
       agama         ← agama
       atasDasar     ← atas_dasar    | dasar_nikah | dasar
       restu         ← restu         | restu_ortu
       punyaAnak     ← punya_anak
       anakLaki      ← anak_laki
       anakPerempuan ← anak_perempuan
       status        ← status        | status_saat_ini
       tahunMeninggal← tahun_meninggal
     Field yang absen di-default ke string kosong. Sanitasi kondisional
     (anakLaki/anakPerempuan saat punyaAnak !== 'Ya'; tahunMeninggal saat
     status !== 'Meninggal Dunia') TIDAK dilakukan di sini — itu tanggung
     jawab MarriageEntries.applyPayload() agar perilaku seragam dengan
     load() dan validasi. */
  function normalizeStopperItem(item) {
    item = item || {};
    return {
      nama:          pickStr(item.nama_pasangan, item.nama),
      tempat:        pickStr(item.tempat_nikah, item.tempat),
      tanggal:       pickStr(item.tanggal_nikah, item.tanggal),
      agama:         pickStr(item.agama),
      atasDasar:     pickStr(item.atas_dasar, item.dasar_nikah, item.dasar),
      restu:         pickStr(item.restu, item.restu_ortu),
      punyaAnak:     pickStr(item.punya_anak),
      anakLaki:      pickStr(item.anak_laki),
      anakPerempuan: pickStr(item.anak_perempuan),
      status:        pickStr(item.status, item.status_saat_ini),
      tahunMeninggal:pickStr(item.tahun_meninggal)
    };
  }

  function isBlacklisted(fid, blacklist) {
    blacklist = blacklist || DEFAULT_BLACKLIST;
    if (blacklist.indexOf(fid) >= 0) return true;
    if (blacklist.indexOf('f-' + fid) >= 0) return true;
    var dashed = String(fid || '').replace(/_/g, '-');
    if (blacklist.indexOf(dashed) >= 0) return true;
    if (blacklist.indexOf('f-' + dashed) >= 0) return true;
    return false;
  }

  function normalizeFamJK(value) {
    if (typeof window._normalizeFamJK === 'function') return window._normalizeFamJK(value);
    var text = String(value || '').trim().toLowerCase();
    if (text === 'l' || text.indexOf('laki') >= 0 || text === 'pria') return 'L';
    if (text === 'p' || text.indexOf('perempuan') >= 0 || text === 'wanita') return 'P';
    return value || '';
  }

  function ageFromFamilyItem(item) {
    var usia = item.usia || item.umur || item.umur_angka || '';
    if (!usia && item.tanggal_lahir) {
      try {
        var parts = String(item.tanggal_lahir).split('-');
        var lahir = parts.length === 3 ? new Date(parts[2], parts[1] - 1, parts[0]) : new Date(item.tanggal_lahir);
        usia = String(new Date().getFullYear() - lahir.getFullYear());
      } catch (_e) {
        usia = '';
      }
    }
    return usia;
  }

  function normalizeFamilyItem(item) {
    item = item || {};
    var jk = normalizeFamJK(item.jenis_kelamin || item.jk || item['L/P'] || item.lp || '');
    return {
      nama: item.nama || '',
      jk: jk,
      jenis_kelamin: jk,
      usia: ageFromFamilyItem(item),
      pendidikan: item.pendidikan || '',
      pekerjaan: item.pekerjaan || '',
      keterangan: item.hubungan || ''
    };
  }

  function setFieldValue(id, value) {
    var el = document.getElementById(id);
    if (!el) return 0;
    var next = value == null ? '' : String(value);
    el.value = next;
    try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (_e) { }
    try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch (_e2) { }
    return next.trim() ? 1 : 0;
  }

  function applyPerkaraList(value) {
    if (!Array.isArray(value)) return null;
    var validItems = value.filter(function (item) { return item && (item.perkara || item.pasal); });
    if (!validItems.length) return 0;
    window._perkaraList = validItems.map(function (item) {
      return { perkara: item.perkara || '', pasal: item.pasal || '' };
    });
    if (typeof window._renderPerkaraList === 'function') window._renderPerkaraList();
    return validItems.length;
  }

  function applyFamilyList(fid, value) {
    var target = FAMILY_TARGETS[fid];
    if (!target || !Array.isArray(value)) return null;
    var arr = window[target.arrayName];
    if (!arr) {
      try { console.error('[Stopper] ' + target.arrayName + ' TIDAK DITEMUKAN di window!'); } catch (_e) { }
      return 0;
    }
    arr.length = 0;
    value.forEach(function (item) { arr.push(normalizeFamilyItem(item)); });
    if (typeof window._renderFamTable === 'function') window._renderFamTable(target.tbody, arr);
    if (typeof window.onSusunanChange === 'function') window.onSusunanChange();
    return value.length;
  }

  function resolveMarriageTarget(fid) {
    var target = MARRIAGE_TARGETS[fid];
    if (!target || !window.MarriageEntries || typeof window.MarriageEntries.byKey !== 'function') return null;
    var keys = target.keys || (target.key ? [target.key] : []);
    for (var i = 0; i < keys.length; i++) {
      var inst = window.MarriageEntries.byKey(keys[i]);
      if (inst && typeof inst.applyPayload === 'function') {
        return { key: keys[i], instance: inst, target: target };
      }
    }
    return null;
  }

  function hasNamedSpouse(records) {
    if (!Array.isArray(records)) return false;
    for (var i = 0; i < records.length; i++) {
      if (records[i] && String(records[i].nama || '').trim()) return true;
    }
    return false;
  }

  function syncMarriageParentStatus(fid, resolved) {
    var changed = 0;
    if (fid === 'riwayat_pernikahan') {
      // Klien: Integrasi dan Litmas Anak memakai id status yang sama.
      changed += setFieldValue('f-status', 'Menikah');
      try {
        if (typeof window.updateMarriageVisibility === 'function') window.updateMarriageVisibility();
        if (typeof window.onStatusChange === 'function') window.onStatusChange();
      } catch (_e) { }
    } else if (fid === 'riwayat_pernikahan_penjamin') {
      changed += setFieldValue('f4-status-penjamin', 'Menikah');
      try { if (typeof window.onStatusPenjaminChange === 'function') window.onStatusPenjaminChange(); } catch (_e2) { }
    } else if (fid === 'riwayat_pernikahan_wali') {
      changed += setFieldValue('f5-status-wali', 'Menikah');
      try { if (typeof window.onWaliStatusChange === 'function') window.onWaliStatusChange('Menikah'); } catch (_e3) { }
    }
    return changed;
  }

  /* Stopper multi-subject dispatcher (Requirement 12.1-12.6).
     - fid menentukan target subject via MARRIAGE_TARGETS (IK/LK/IP/LW).
     - value adalah Array<StopperMarriageItem>; tiap item dinormalisasi ke
       canonical EntryRecord oleh normalizeStopperItem.
     - Eksekusi diserahkan ke MarriageEntries.byKey(loc).applyPayload(records)
       yang menangani rebuild + sanitasi kondisional + toggle visibilitas.
     - Return:
         null  bila value bukan array atau kosong (kompatibel dengan kontrak lama)
         0     bila fid tidak dikenali / MarriageEntries belum siap / instance tidak ada
         N     jumlah entry yang berhasil dirender oleh applyPayload */
  function applyMarriageHistory(fid, value) {
    if (!Array.isArray(value) || !value.length) return null;
    var resolved = resolveMarriageTarget(fid);
    if (!resolved) return 0;
    var records = value.map(normalizeStopperItem);
    if (hasNamedSpouse(records)) syncMarriageParentStatus(fid, resolved);
    return resolved.instance.applyPayload(records) || 0;
  }

  function applyArrayField(fid, value, options) {
    options = options || {};
    if ((fid === 'perkara_list' || fid === 'f-perkara_list' || fid === 'perkara') && Array.isArray(value)) {
      try { console.log('[Stopper] Mengisi List Perkara', value); } catch (_e) { }
      return { handled: true, filled: applyPerkaraList(value) || 0 };
    }

    if (FAMILY_TARGETS[fid] && Array.isArray(value)) {
      try { console.log('[Stopper] Mengisi ' + FAMILY_TARGETS[fid].label, value); } catch (_e) { }
      return { handled: true, filled: applyFamilyList(fid, value) || 0 };
    }

    if (options.applyMarriageHistory && MARRIAGE_TARGETS[fid] && Array.isArray(value) && value.length > 0) {
      return { handled: true, filled: applyMarriageHistory(fid, value) || 0 };
    }

    return { handled: false, filled: 0 };
  }

  function applyScalarField(fid, value) {
    var findField = window._stopperPdfFindField;
    var el = typeof findField === 'function' ? findField(fid) : null;
    if (!el) {
      stopperLog('warn', 'apply', 'field tidak ditemukan', { field: fid });
      return 0;
    }

    if (el.tagName === 'SELECT') {
      var found = false;
      var raw = String(value).toLowerCase();
      for (var i = 0; i < el.options.length; i++) {
        if (
          String(el.options[i].value).toLowerCase() === raw ||
          String(el.options[i].text).toLowerCase() === raw
        ) {
          el.selectedIndex = i;
          found = true;
          break;
        }
      }
      if (!found) {
        for (var j = 0; j < el.options.length; j++) {
          var optText = String(el.options[j].text).toLowerCase();
          if (optText.indexOf(raw) >= 0 || raw.indexOf(optText) >= 0) {
            el.selectedIndex = j;
            found = true;
            break;
          }
        }
      }
      if (!found) {
        stopperLog('warn', 'apply', 'opsi select tidak cocok', { field: fid, value: value });
        return 0;
      }
    } else {
      el.value = value;
    }

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return 1;
  }

  function applyReviewedPayload(payload, options) {
    options = options || {};
    if (Object.prototype.hasOwnProperty.call(options, 'debug')) setDebug(options.debug);
    var stats = createApplyStats();
    var data = payload || {};
    var keys = Object.keys(data).filter(function (key) {
      return key !== '__sources' && key !== '__source' && key !== 'sources';
    });
    stats.selected = keys.length;
    stopperLog('info', 'apply', 'mulai menerapkan payload review', { selected: stats.selected });

    keys.forEach(function (fid) {
      var value = data[fid];
      if (isEmptyValue(value) && value !== 0 && value !== false) {
        recordSkip(stats, fid, 'empty');
        return;
      }

      var arrayResult = applyArrayField(fid, value, { applyMarriageHistory: options.applyMarriageHistory !== false });
      if (arrayResult.handled) {
        if (arrayResult.filled > 0) recordApply(stats, fid, arrayResult.filled);
        else recordSkip(stats, fid, 'array_empty_or_not_applied');
        return;
      }

      if (Array.isArray(value)) {
        recordSkip(stats, fid, 'unknown_array');
        return;
      }

      if (isBlacklisted(fid, options.blacklist)) {
        recordSkip(stats, fid, 'blacklisted');
        return;
      }

      var scalarFilled = applyScalarField(fid, value);
      if (scalarFilled > 0) recordApply(stats, fid, scalarFilled);
      else recordSkip(stats, fid, 'field_not_found_or_unmatched');
    });

    applySusunanFlag(data);
    var penjaminEl = triggerPenjaminChange();
    recordApply(stats, 'penjamin_sync', syncPenjaminGender(penjaminEl));
    recordApply(stats, 'penjamin_family_tag', applyPenjaminFamilyTag(penjaminEl));

    stopperLog('info', 'apply', 'selesai menerapkan payload review', {
      selected: stats.selected,
      filled: stats.filled,
      applied: stats.applied.length,
      skipped: stats.skipped.length,
      warnings: stats.warnings.length
    });
    return stats;
  }

  function applySusunanFlag(data) {
    var el = document.getElementById('f-susunan-keluarga');
    if (!el) return;
    if (data.susunan_keluarga && !data.susunan_keluarga_klien) {
      el.value = 'Ya';
    } else if (data.susunan_keluarga_klien || data.susunan_keluarga_penjamin) {
      el.value = 'Tidak';
    }
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function triggerPenjaminChange() {
    var penjaminEl = document.getElementById('f-penjamin');
    if (penjaminEl && penjaminEl.value) {
      if (typeof window.onPenjaminChange === 'function') window.onPenjaminChange();
      try { console.log('[Stopper] f-penjamin diisi:', penjaminEl.value); } catch (_e) { }
    }
    return penjaminEl || null;
  }

  function penjaminNameFromSelection(penjaminEl) {
    var penjaminType = (penjaminEl && penjaminEl.value) || '';
    var id = '';
    if (penjaminType === 'Ayah') id = 'f-nama-ayah';
    else if (penjaminType === 'Ibu') id = 'f-nama-ibu';
    else if (penjaminType === 'Suami') id = 'f-nama-suami';
    else if (penjaminType === 'Istri') id = 'f-nama-istri';
    else if (penjaminType === 'Lainnya') id = 'f-nama-penjamin';
    return id ? ((document.getElementById(id) || {}).value || '') : '';
  }

  function normalizeGender(value) {
    var raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    if (raw === 'l' || raw === 'lk' || raw === 'laki' || raw === 'laki-laki' || raw === 'pria' || raw.indexOf('laki') >= 0) return 'Laki-laki';
    if (raw === 'p' || raw === 'pr' || raw === 'perempuan' || raw === 'wanita' || raw.indexOf('perempuan') >= 0 || raw.indexOf('wanita') >= 0) return 'Perempuan';
    return '';
  }

  function syncPenjaminGender(penjaminEl) {
    var jkEl = document.getElementById('f4-jk-penjamin');
    if (!jkEl) return 0;
    if ((jkEl.value || '').trim()) return 0;

    var penjaminType = (penjaminEl && penjaminEl.value) || ((document.getElementById('f-penjamin') || {}).value || '');
    var map = {
      Ayah: 'Laki-laki',
      Suami: 'Laki-laki',
      Ibu: 'Perempuan',
      Istri: 'Perempuan'
    };
    var next = map[penjaminType] || '';
    var namaPenjamin = penjaminNameFromSelection(penjaminEl || document.getElementById('f-penjamin')).trim().toLowerCase();
    var famArrays = [window.anggotaBersama, window.anggotaPenjamin];

    if (!next) {
      famArrays.forEach(function (arr) {
        if (next || !arr || !arr.length) return;
        arr.forEach(function (member) {
          if (next || !member) return;
          var ket = String(member.keterangan || member.hubungan || '').toLowerCase();
          var nama = String(member.nama || '').trim().toLowerCase();
          if (ket.indexOf('penjamin') < 0 && (!namaPenjamin || nama !== namaPenjamin)) return;
          next = normalizeGender(member.jenis_kelamin || member.jk || member['L/P'] || member.lp);
        });
      });
    }

    if (!next) return 0;
    return setFieldValue('f4-jk-penjamin', next);
  }

  function applyPenjaminFamilyTag(penjaminEl) {
    var namaPenjamin = penjaminNameFromSelection(penjaminEl || document.getElementById('f-penjamin'));
    if (!namaPenjamin) return 0;

    var nameLower = namaPenjamin.trim().toLowerCase();
    // Tabel klien terpisah sudah dihapus; cukup scan bersama + penjamin.
    var famArrays = [
      { arr: window.anggotaBersama, tbody: 'tbody-bersama' },
      { arr: window.anggotaPenjamin, tbody: 'tbody-penjamin' }
    ];
    var changed = 0;

    try { console.log('[Stopper] Nama penjamin teridentifikasi:', namaPenjamin); } catch (_e) { }
    famArrays.forEach(function (family) {
      var rerender = false;
      if (!family.arr || !family.arr.length) return;
      family.arr.forEach(function (member) {
        var memberName = (member.nama || '').trim().toLowerCase();
        if (!memberName || memberName !== nameLower) return;
        var ket = (member.keterangan || '').trim();
        if (ket.toLowerCase().indexOf('/penjamin') >= 0 || ket.toLowerCase().indexOf('penjamin') >= 0) return;
        member.keterangan = ket ? (ket + '/Penjamin') : 'Penjamin';
        rerender = true;
        changed += 1;
        try { console.log('[Stopper] Menambahkan /Penjamin pada:', member.nama, '->', member.keterangan); } catch (_e) { }
      });
      if (rerender && typeof window._renderFamTable === 'function') window._renderFamTable(family.tbody, family.arr);
    });

    return changed;
  }

  window.LStopperFieldApply = {
    defaultBlacklist: DEFAULT_BLACKLIST,
    MARRIAGE_TARGETS: MARRIAGE_TARGETS,
    setDebug: setDebug,
    isDebugEnabled: isDebugEnabled,
    log: stopperLog,
    isBlacklisted: isBlacklisted,
    applyPerkaraList: applyPerkaraList,
    applyFamilyList: applyFamilyList,
    normalizeStopperItem: normalizeStopperItem,
    resolveMarriageTarget: resolveMarriageTarget,
    hasNamedSpouse: hasNamedSpouse,
    syncMarriageParentStatus: syncMarriageParentStatus,
    applyMarriageHistory: applyMarriageHistory,
    applyArrayField: applyArrayField,
    applyScalarField: applyScalarField,
    applyReviewedPayload: applyReviewedPayload,
    applySusunanFlag: applySusunanFlag,
    triggerPenjaminChange: triggerPenjaminChange,
    syncPenjaminGender: syncPenjaminGender,
    applyPenjaminFamilyTag: applyPenjaminFamilyTag
  };
})();
