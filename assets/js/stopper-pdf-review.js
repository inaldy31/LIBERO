// LIBERO: Modal review PDF Stopper dan UI pemilihan field hasil ekstraksi.
(function installStopperPdfReview() {
  /* Marriage payload keys (Stopper multi-subject dispatch — Task 7.3 / Req 12.2-12.3).
     Tiap key Stopper dipetakan ke lokasi MarriageEntries:
       riwayat_pernikahan          -> IK atau LK (Klien)
       riwayat_pernikahan_penjamin -> IP (Penjamin)
       riwayat_pernikahan_wali     -> LW (Wali)
     Modal review meneruskan ketiga key (yang user-centang) ke `selected`.
     Pemanggil di views (`processFile` di litmasanak.html & integrasi.html)
     memanggil `LStopperFieldApply.applyArrayField(fid, val, { applyMarriageHistory: true })`
     untuk setiap fid — dispatcher di `stopper-field-apply.js` lalu memetakan
     ke instance MarriageEntries via `MARRIAGE_TARGETS[fid]`. */
  var MARRIAGE_KEYS = {
    riwayat_pernikahan: ['IK', 'LK'],
    riwayat_pernikahan_penjamin: ['IP'],
    riwayat_pernikahan_wali: ['LW']
  };

  function resolveMarriageInstance(fid) {
    try {
      if (window.LStopperFieldApply && typeof window.LStopperFieldApply.resolveMarriageTarget === 'function') {
        var resolved = window.LStopperFieldApply.resolveMarriageTarget(fid);
        if (resolved && resolved.instance) return resolved.instance;
      }
      var keys = MARRIAGE_KEYS[fid] || [];
      if (!Array.isArray(keys)) keys = [keys];
      for (var i = 0; i < keys.length; i++) {
        var inst = window.MarriageEntries && typeof window.MarriageEntries.byKey === 'function'
          ? window.MarriageEntries.byKey(keys[i])
          : null;
        if (inst && typeof inst.collect === 'function') return inst;
      }
    } catch (_e) { /* defensive */ }
    return null;
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isPerkaraField(fid) {
    return fid === 'perkara_list' || fid === 'f-perkara_list' || fid === 'perkara' || fid === 'pasal';
  }

  function isPerkaraListField(fid) {
    return fid === 'perkara_list' || fid === 'f-perkara_list';
  }

  function formatPerkaraPasalItem(item) {
    item = item || {};
    var perkara = String(item.perkara || '').trim();
    var pasal = String(item.pasal || '').trim();
    if (perkara && pasal) return perkara + ', ' + pasal;
    return perkara || pasal || '';
  }

  function cleanPerkaraPasalEvidence(value) {
    return String(value || '')
      .replace(/\bKejahatan\s*:\s*/gi, '')
      .replace(/\bPerkara\s*:\s*/gi, '')
      .replace(/\bPasal\s*:\s*/gi, 'Pasal ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizePerkaraItems(value) {
    if (!Array.isArray(value)) return [];
    return value.map(function (item) {
      item = item || {};
      return {
        perkara: String(item.perkara || '').trim(),
        pasal: String(item.pasal || '').trim()
      };
    });
  }

  function buildPerkaraPartPayload(fid, checkedRows, rawValue) {
    var current = normalizePerkaraItems(currentValue(fid));
    var incoming = normalizePerkaraItems(rawValue);
    checkedRows.forEach(function (row) {
      var idx = Number(row.index || 0);
      var part = row.part === 'pasal' ? 'pasal' : 'perkara';
      if (!incoming[idx] || !String(incoming[idx][part] || '').trim()) return;
      while (current.length <= idx) current.push({ perkara: '', pasal: '' });
      current[idx][part] = incoming[idx][part];
    });
    return current.filter(function (item) { return item.perkara || item.pasal; });
  }

  function ensureReviewStyle() {
    if (document.getElementById('stopper-pdf-review-style')) return;
    var style = document.createElement('style');
    style.id = 'stopper-pdf-review-style';
    style.textContent = [
      '#stopper-pdf-review .wilayah-modal{width:min(1180px,98vw)}',
      '#stopper-pdf-review .wilayah-modal-body{padding:16px 18px 8px}',
      '.stopper-review-table{table-layout:fixed;width:100%}',
      '.stopper-review-table th,.stopper-review-table td{white-space:normal;overflow-wrap:anywhere;word-break:break-word;vertical-align:top}',
      '.stopper-review-table th:first-child,.stopper-review-table td:first-child{text-align:center}',
      '.stopper-review-table .wilayah-badge{white-space:normal;display:inline-block;line-height:1.25}'
    ].join('');
    document.head.appendChild(style);
  }

  function text(value) {
    if (value == null || value === '') return '-';
    if (Array.isArray(value)) {
      if (!value.length) return '-';
      if (typeof value[0] === 'object') {
        var rendered = value.slice(0, 3).map(function (it) {
          if (
            Object.prototype.hasOwnProperty.call(it, 'perkara') ||
            Object.prototype.hasOwnProperty.call(it, 'pasal')
          ) {
            return formatPerkaraPasalItem(it);
          }
          if (
            Object.prototype.hasOwnProperty.call(it, 'nama_pasangan') ||
            Object.prototype.hasOwnProperty.call(it, 'tanggal_nikah')
          ) {
            return [
              it.nama_pasangan ? ('Pasangan: ' + it.nama_pasangan) : '',
              it.tanggal_nikah ? ('Tanggal: ' + it.tanggal_nikah) : '',
              it.status ? ('Status: ' + it.status) : ''
            ].filter(Boolean).join(' | ');
          }
          return [
            it.nama ? ('Nama: ' + it.nama) : '',
            it.hubungan ? ('Hubungan: ' + it.hubungan) : '',
            it.pekerjaan ? ('Pekerjaan: ' + it.pekerjaan) : '',
            it.alamat ? ('Alamat: ' + it.alamat) : ''
          ].filter(Boolean).join(' | ') || '-';
        }).filter(Boolean).join('; ');
        return (rendered || '-') + (rendered && value.length > 3 ? ' +' + (value.length - 3) + ' data' : '');
      }
      return value.filter(Boolean).join(', ') || '-';
    }
    if (typeof value === 'object') {
      // Marriage payload bisa berbentuk dict positional ({ "1": {...} }) atau
      // dict-titlecase Penjamin. Render ringkas pakai field nama pasangan.
      var keys = Object.keys(value);
      if (keys.length && /^\d+$/.test(keys[0])) {
        var items = keys.slice(0, 3).map(function (k) {
          var it = value[k] || {};
          var nm = it.nama_pasangan || it.Nama_Pasangan_Penjamin || '';
          var tg = it.tanggal_nikah || it.Tanggal_Nikah_Penjamin || '';
          return [nm, tg].filter(Boolean).join(' - ');
        }).filter(Boolean).join('; ');
        return (items || '-') + (items && keys.length > 3 ? ' +' + (keys.length - 3) + ' data' : '');
      }
      return keys.slice(0, 6).map(function (k) {
        var v = value[k];
        if (v == null || v === '') return '';
        if (typeof v === 'object') return k + ': ' + text(v);
        return k + ': ' + String(v);
      }).filter(Boolean).join(' | ') || '-';
    }
    return String(value || '').trim() || '-';
  }

  function unwrapValue(raw) {
    if (
      raw &&
      typeof raw === 'object' &&
      !Array.isArray(raw) &&
      Object.prototype.hasOwnProperty.call(raw, 'value')
    ) {
      return {
        value: raw.value,
        source: raw.source_file || raw.source || raw.source_label || '',
        evidence: raw.evidence || raw.catatan || ''
      };
    }
    return { value: raw, source: '', evidence: '' };
  }

  function findField(fid) {
    var el = document.getElementById(fid);
    if (el) return el;
    el = document.getElementById('f-' + fid);
    if (el) return el;
    var dashed = String(fid || '').replace(/_/g, '-');
    el = document.getElementById(dashed);
    if (el) return el;
    el = document.getElementById('f-' + dashed);
    if (el) return el;
    if (String(fid || '').startsWith('f-')) {
      el = document.getElementById(fid.substring(2));
      if (el) return el;
      el = document.getElementById(fid.substring(2).replace(/-/g, '_'));
      if (el) return el;
    }
    return null;
  }

  function normalizeFieldId(fid) {
    return String(fid || '')
      .trim()
      .replace(/^f\d+[-_]/i, '')
      .replace(/^f[-_]/i, '')
      .replace(/[-_\s]+/g, '-')
      .toLowerCase();
  }

  function isPlaceholderLabel(value) {
    var s = String(value || '').trim().toLowerCase();
    return !s || /^(dd[\/.-]mm[\/.-]yyyy|yyyy|mm[\/.-]yyyy|\d+|angka)$/.test(s) || /^(contoh|misal)\b/.test(s);
  }

  function cleanLabel(value) {
    return String(value || '')
      .replace(/\*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function stripSectionNumber(value) {
    return cleanLabel(value)
      .replace(/^[IVXLCDM]+(?:\.|\s*[-–—])\s*/i, '')
      .trim();
  }

  function canonicalSection(value) {
    var section = stripSectionNumber(value);
    var plain = section.toLowerCase();
    var sections = {
      'data umum': 'Data Umum',
      'identitas': 'Identitas',
      'riwayat hidup dan perkembangan klien': 'Riwayat Hidup dan Perkembangan Klien',
      'kondisi penjamin': 'Kondisi Penjamin',
      'kondisi orang tua / wali': 'Kondisi Orang Tua / Wali',
      'kondisi orang tua/wali': 'Kondisi Orang Tua / Wali'
    };
    return sections[plain] || section || 'Lainnya';
  }

  function specialFieldLabel(fid) {
    var key = normalizeFieldId(fid);
    var labels = {
      'tgl-surat': 'Tanggal Surat Permintaan',
      'tgl-terima': 'Tanggal Penerimaan Permintaan',
      'tgl-wawancara-klien': 'Tanggal Wawancara Klien',
      'tgl-wawancara-penjamin': 'Tanggal Wawancara Penjamin',
      'tgl-mulai-penelitian': 'Tanggal Mulai Penelitian',
      'tgl-akhir-penelitian': 'Tanggal Akhir Penelitian',
      'sepertiga': 'Tanggal 1/3 Masa Pembinaan',
      'setengah': 'Tanggal 1/2 Masa Pembinaan',
      'duapertiga': 'Tanggal 2/3 Masa Pembinaan',
      'tgl-lahir': 'Tanggal Lahir',
      'tgl-putusan': 'Tanggal Putusan',
      'tgl-ekspirasi': 'Tanggal Ekspirasi',
      'tgl-ayah': 'Tanggal Lahir Ayah',
      'tgl-ibu': 'Tanggal Lahir Ibu',
      'tgl-suami': 'Tanggal Lahir Suami',
      'tgl-istri': 'Tanggal Lahir Istri',
      'tgl-penjamin': 'Tanggal Lahir Penjamin',
      'jk-penjamin': 'Jenis Kelamin Penjamin',
      'status-penjamin': 'Status Pernikahan Penjamin',
      'status-pekerjaan': 'Status Pekerjaan Penjamin',
      'pekerjaan-penjamin': 'Pekerjaan Penjamin',
      'tgl-wali': 'Tanggal Lahir Wali',
      'f8-sepertiga': 'Tanggal 1/3 Masa Pembinaan',
      'f8-setengah': 'Tanggal 1/2 Masa Pembinaan',
      'f8-duapertiga': 'Tanggal 2/3 Masa Pembinaan',
      'perkara-list': 'Perkara & Pasal',
      'perkara': 'Perkara & Pasal',
      'pasal': 'Pasal',
      'susunan-keluarga': 'Susunan Keluarga',
      'susunan-keluarga-klien': 'Susunan Keluarga Klien',
      'susunan-keluarga-penjamin': isLitmasAnakPage() ? 'Susunan Keluarga Orang Tua/Wali' : 'Susunan Keluarga Penjamin',
      'riwayat-pernikahan': 'Riwayat Pernikahan Klien',
      'riwayat-pernikahan-penjamin': 'Riwayat Pernikahan Penjamin',
      'riwayat-pernikahan-wali': 'Riwayat Pernikahan Wali'
    };
    return labels[key] || '';
  }

  function domFieldLabel(fid) {
    var el = findField(fid);
    if (!el) return '';
    var lbl = '';
    var labelEl = document.querySelector('label[for="' + el.id + '"]');
    if (labelEl) lbl = cleanLabel(labelEl.textContent);

    if (!lbl || isPlaceholderLabel(lbl)) {
      var prev = el.previousElementSibling;
      var maxLook = 6;
      while (prev && maxLook-- > 0) {
        if (prev.classList && prev.classList.contains('flbl')) {
          lbl = cleanLabel(prev.textContent);
          break;
        }
        prev = prev.previousElementSibling;
      }
    }

    if (!lbl || isPlaceholderLabel(lbl)) {
      var wrap = el.closest('.finp-pin-wrap, .finp-wrap, .frow, .form-group, .field-wrap, .acc-grid, .form-grid');
      if (wrap) {
        var flblEl = wrap.querySelector('.flbl');
        if (flblEl) lbl = cleanLabel(flblEl.textContent);
        if (!lbl || isPlaceholderLabel(lbl)) {
          var lblEl2 = wrap.querySelector('label');
          if (lblEl2) lbl = cleanLabel(lblEl2.textContent);
        }
      }
    }

    return isPlaceholderLabel(lbl) ? '' : lbl;
  }

  function domFieldSection(fid) {
    var el = findField(fid);
    if (!el) return '';
    var tabPanel = el.closest('.tab-panel, [id^="tp-"]');
    if (!tabPanel) return '';
    var titleEl = tabPanel.querySelector('.panel-title, .section-title, h3, h4');
    return titleEl ? cleanLabel(titleEl.textContent) : '';
  }

  function humanFieldLabel(fid) {
    var special = specialFieldLabel(fid);
    if (special) return special;
    var cleaned = String(fid || '')
      .replace(/^f[-_]/i, '')
      .replace(/^\d+\s+/, '')
      .replace(/\btgl\b/gi, 'tanggal')
      .replace(/\bjk\b/gi, 'jenis kelamin')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, function (m) { return m.toUpperCase(); })
      .trim();
    return cleaned || String(fid || '');
  }

  function currentValue(fid) {
    if (fid === 'perkara_list' || fid === 'f-perkara_list' || fid === 'perkara') return window._perkaraList || [];
    if (fid === 'susunan_keluarga' || fid === 'f-susunan_keluarga') return window.anggotaBersama || [];
    if (fid === 'susunan_keluarga_penjamin') return window.anggotaPenjamin || [];
    if (fid === 'susunan_keluarga_klien') {
      return (Array.isArray(window.anggotaBersama) && window.anggotaBersama.length)
        ? window.anggotaBersama
        : (window.anggotaKlien || []);
    }
    if (Object.prototype.hasOwnProperty.call(MARRIAGE_KEYS, fid)) {
      // Riwayat Pernikahan multi-entry: ambil snapshot dari MarriageEntries
      // sehingga modal review bisa menampilkan "Isi Saat Ini" yang akurat.
      try {
        var inst = resolveMarriageInstance(fid);
        if (inst && typeof inst.collect === 'function') return inst.collect();
      } catch (_e) { /* defensive: jangan throw saat modul belum siap */ }
      return '';
    }
    var el = findField(fid);
    return el ? el.value : '';
  }

  function sourceText(fid, raw, sourceMap) {
    var meta = sourceMap && sourceMap[fid];
    if (!meta) meta = unwrapValue(raw);
    if (typeof meta === 'string') return meta || '-';
    var file = meta.source_file || meta.file || meta.source || '';
    var label = meta.source_label || meta.label || '';
    var evidence = meta.evidence || meta.catatan || '';
    if (isPerkaraField(fid)) evidence = cleanPerkaraPasalEvidence(evidence);
    var main = label || file || '-';
    return evidence ? (main + ' - ' + evidence) : main;
  }

  function comparableText(value) {
    return String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  function isLitmasAnakPage() {
    return !!(
      document.getElementById('f5-status-wali') ||
      document.getElementById('f-nama-wali') ||
      document.getElementById('title-riwayat-ortu-wali')
    );
  }

  function specialFieldSection(fid) {
    var key = normalizeFieldId(fid);
    if (fid === 'perkara_list' || fid === 'f-perkara_list' || fid === 'perkara' || fid === 'pasal') {
      return 'Identitas';
    }
    if (
      key === 'susunan-keluarga' ||
      key === 'susunan-keluarga-klien' ||
      key === 'susunan-keluarga-penjamin'
    ) {
      return 'Identitas';
    }
    if (key === 'riwayat-pernikahan') {
      return 'Riwayat Hidup dan Perkembangan Klien';
    }
    if (key === 'riwayat-pernikahan-penjamin') {
      return isLitmasAnakPage() ? 'Kondisi Orang Tua / Wali' : 'Kondisi Penjamin';
    }
    if (key === 'riwayat-pernikahan-wali') {
      return 'Kondisi Orang Tua / Wali';
    }
    return '';
  }

  function ensureModal() {
    ensureReviewStyle();
    var overlay = document.getElementById('stopper-pdf-review');
    if (overlay) {
      if (
        overlay.querySelector('#spr-body') &&
        overlay.querySelector('#spr-close') &&
        overlay.querySelector('#spr-cancel') &&
        overlay.querySelector('#spr-apply')
      ) {
        return overlay;
      }
      overlay.remove();
    }
    overlay = document.createElement('div');
    overlay.id = 'stopper-pdf-review';
    overlay.className = 'wilayah-overlay';
    overlay.innerHTML =
      '<div class="wilayah-modal">' +
      '<div class="wilayah-modal-hdr"><div class="wilayah-modal-title">Review STOPPER PDF/Foto</div><button type="button" class="wilayah-btn" id="spr-close">Tutup</button></div>' +
      '<div class="wilayah-modal-body" id="spr-body"></div>' +
      '<div class="wilayah-modal-ftr"><button type="button" class="wilayah-btn" id="spr-cancel">Batal</button><button type="button" class="wilayah-btn primary" id="spr-apply">Terapkan yang Dipilih</button></div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.classList.remove('open');
    });
    overlay.querySelector('#spr-close').onclick = function () { overlay.classList.remove('open'); };
    overlay.querySelector('#spr-cancel').onclick = function () { overlay.classList.remove('open'); };
    return overlay;
  }

  function showReview(data, filePaths, docLabels, fieldList, onApply, modelUsed) {
    var overlay = ensureModal();
    var body = overlay.querySelector('#spr-body');
    var sourceMap = (data && (data.__sources || data.__source || data.sources)) || {};
    var labelMap = {};
    var sectionMap = {};
    (fieldList || []).forEach(function (f) {
      if (f && typeof f === 'object' && f.id) {
        var label = specialFieldLabel(f.id) || (isPlaceholderLabel(f.label) ? '' : cleanLabel(f.label));
        if (!label) label = domFieldLabel(f.id) || humanFieldLabel(f.id);
        var section = cleanLabel(f.section || '') || domFieldSection(f.id);
        labelMap[f.id] = label;
        labelMap[normalizeFieldId(f.id)] = label;
        sectionMap[f.id] = section;
        sectionMap[normalizeFieldId(f.id)] = section;
      }
    });

    var groups = [];
    var groupIndex = {};
    function pushRow(section, rowHtml) {
      section = canonicalSection(section);
      if (!Object.prototype.hasOwnProperty.call(groupIndex, section)) {
        groupIndex[section] = groups.length;
        groups.push({ section: section, rows: [] });
      }
      groups[groupIndex[section]].rows.push(rowHtml);
    }

    function buildReviewRow(fid, label, oldText, resultText, srcText, section, extraAttrs) {
      var sameValue = oldText !== '-' && comparableText(oldText) === comparableText(resultText);
      var checked = oldText === '-' && !sameValue ? ' checked' : '';
      var status = sameValue ? 'Valid' : (oldText === '-' ? 'Terdeteksi' : 'Mengganti isi lama');
      var badgeClass = sameValue ? 'wilayah-badge-kuat' : 'wilayah-badge-draft';
      return (
        '<tr>' +
        '<td><input type="checkbox" class="spr-check" data-field="' + esc(fid) + '"' + (extraAttrs || '') + checked + '></td>' +
        '<td>' + esc(label) + '</td>' +
        '<td>' + esc(oldText) + '</td>' +
        '<td>' + esc(resultText) + '</td>' +
        '<td>' + esc(srcText || '-') + '</td>' +
        '<td><span class="wilayah-badge ' + badgeClass + '">' + esc(status) + '</span></td>' +
        '</tr>'
      );
    }

    Object.keys(data || {}).forEach(function (fid) {
      if (fid === '__sources' || fid === '__source' || fid === 'sources') return;
      var raw = data[fid];
      var unwrapped = unwrapValue(raw);
      var value = unwrapped.value;
      var resultText = text(value);
      if (resultText === '-') return;
      var srcText = sourceText(fid, raw, sourceMap);
      var displayLabel = specialFieldLabel(fid) || labelMap[fid] || labelMap[normalizeFieldId(fid)] || domFieldLabel(fid) || humanFieldLabel(fid);
      var section = specialFieldSection(fid) || sectionMap[fid] || sectionMap[normalizeFieldId(fid)] || domFieldSection(fid) || 'Lainnya';

      if (isPerkaraListField(fid) && Array.isArray(value)) {
        var incomingPerkara = normalizePerkaraItems(value);
        var currentPerkara = normalizePerkaraItems(currentValue(fid));
        var multiple = incomingPerkara.length > 1;
        incomingPerkara.forEach(function (item, idx) {
          var currentItem = currentPerkara[idx] || {};
          ['perkara', 'pasal'].forEach(function (part) {
            var partValue = item[part] || '';
            if (!partValue) return;
            var partOld = currentItem[part] || '';
            var partLabel = part === 'perkara' ? 'Perkara' : 'Pasal';
            if (multiple) partLabel += ' ' + (idx + 1);
            pushRow(section, buildReviewRow(
              fid,
              partLabel,
              partOld || '-',
              partValue,
              srcText,
              section,
              ' data-index="' + idx + '" data-part="' + part + '"'
            ));
          });
        });
        return;
      }

      var oldText = text(currentValue(fid));
      pushRow(section,
        buildReviewRow(fid, displayLabel, oldText, resultText, srcText, section)
      );
    });

    var rows = [];
    groups.forEach(function (group) {
      rows.push(
        '<tr class="spr-section-row"><td colspan="6" style="padding:12px 10px 8px;background:rgba(var(--ac),.08);color:var(--gold);font-weight:800;letter-spacing:.6px;text-transform:none;border-top:1px solid rgba(var(--ac),.22);border-bottom:1px solid rgba(var(--ac),.12)">' +
        esc(group.section) +
        '</td></tr>'
      );
      rows = rows.concat(group.rows);
    });

    var files = (filePaths || []).map(function (p, i) {
      var name = String(p || '').replace(/^.*[\\/\\\\]/, '');
      var lbl = docLabels && docLabels[i] ? docLabels[i] : '';
      return esc(lbl ? (lbl + ': ' + name) : name);
    }).join(' | ');

    var modelLine = modelUsed || 'AI aktif';

    body.innerHTML =
      '<div class="wilayah-note"><strong>Model AI:</strong> ' + esc(modelLine) + ' | <strong>File:</strong> ' + (files || '-') + '</div>' +
      '<div class="wilayah-note">Centang hanya data yang ingin diterapkan. Isi kosong ditampilkan sebagai "-".</div>' +
      (rows.length
        ? '<table class="wilayah-table stopper-review-table"><colgroup><col style="width:58px"><col style="width:23%"><col style="width:20%"><col style="width:30%"><col style="width:17%"><col style="width:12%"></colgroup><thead><tr><th>Pakai</th><th>Field</th><th>Isi Saat Ini</th><th>Hasil STOPPER</th><th>Sumber</th><th>Status</th></tr></thead><tbody>' + rows.join('') + '</tbody></table>'
        : '<div class="wilayah-note">STOPPER tidak menemukan data baru yang bisa diterapkan.</div>');

    var applyButton = overlay.querySelector('#spr-apply');
    if (!applyButton) {
      throw new Error('Tombol terapkan review STOPPER tidak ditemukan.');
    }
    applyButton.onclick = function () {
      var selected = { __sources: sourceMap };
      var perkaraParts = {};
      overlay.querySelectorAll('.spr-check:checked').forEach(function (chk) {
        var fid = chk.getAttribute('data-field');
        var part = chk.getAttribute('data-part');
        if (fid && part && isPerkaraListField(fid) && Object.prototype.hasOwnProperty.call(data, fid)) {
          if (!perkaraParts[fid]) perkaraParts[fid] = [];
          perkaraParts[fid].push({
            index: chk.getAttribute('data-index') || 0,
            part: part
          });
          return;
        }
        if (fid && Object.prototype.hasOwnProperty.call(data, fid)) selected[fid] = unwrapValue(data[fid]).value;
      });
      Object.keys(perkaraParts).forEach(function (fid) {
        selected[fid] = buildPerkaraPartPayload(fid, perkaraParts[fid], unwrapValue(data[fid]).value);
      });
      // Catatan: ketiga key payload Riwayat Pernikahan
      // (`riwayat_pernikahan`, `riwayat_pernikahan_penjamin`, `riwayat_pernikahan_wali`)
      // ikut diteruskan apa adanya bila user men-centangnya. Loop dispatcher di
      // `processFile` (litmasanak.html / integrasi.html) memanggil
      // `LStopperFieldApply.applyArrayField(fid, val, { applyMarriageHistory: true })`
      // untuk setiap fid → dispatcher `applyMarriageHistory` lalu memetakan
      // ke instance MarriageEntries sesuai `MARRIAGE_TARGETS` (Task 7.3 / Req 12.2-12.3).
      if (Object.keys(selected).length <= 1) {
        if (typeof toastError === 'function') toastError('Tidak ada data yang dipilih.');
        return;
      }
      overlay.classList.remove('open');
      onApply(selected);
    };
    overlay.classList.add('open');
  }

  window._stopperPdfEsc = esc;
  window._stopperPdfText = text;
  window._stopperPdfUnwrapValue = unwrapValue;
  window._stopperPdfFindField = findField;
  window._stopperPdfCurrentValue = currentValue;
  window._stopperPdfSourceText = sourceText;
  window._stopperPdfCanonicalSection = canonicalSection;
  window._stopperPdfMarriageKeys = MARRIAGE_KEYS;
  window._ensureStopperPdfReviewModal = ensureModal;
  window._showStopperPdfReview = showReview;
})();
