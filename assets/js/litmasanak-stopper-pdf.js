// LIBERO: Alur ekstraksi PDF STOPPER Litmas Anak dan review hasil.
/* ── AI Auto-Isi PDF (AI) - Versi Menu Atas ──────────────────────────────── */
    (function () {
      var _INJECTED = false;

      function _css() {
        var s = document.createElement('style');
        s.textContent = `
      @keyframes ai-spin { to{transform:rotate(360deg)} }
      .tb-btn-ai {
        background: rgba(93, 224, 133, 0.13);
        border-color: rgba(93, 224, 133, 0.5);
        color: #5de085;
        box-shadow: 0 0 8px rgba(93, 224, 133, 0.15);
      }
      .tb-btn-ai:hover {
        background: rgba(93, 224, 133, 0.25);
        border-color: #5de085;
        color: #fff;
      }
      .tb-btn-ai svg { stroke: #5de085; fill: none; }
      .tb-btn-ai:hover svg { stroke: #fff; fill: rgba(93, 224, 133, 0.2); }
    `;
        document.head.appendChild(s);
      }

      function collectFields() {
        var fields = [];
        // Hanya kumpulkan field dari tab data yang boleh diisi AI.
        // tp-6 (Lingkungan), tp-7 (Riwayat Pidana), dan tp-8+ (naratif) TIDAK diisi AI.
        var _allowedTabs = ['tp-0','tp-1','tp-2','tp-3','tp-4','tp-5'];
        document.querySelectorAll('input, select, textarea').forEach(function (el) {
          if (!el.id || el.id.startsWith('ai-') || el.type === 'hidden' || el.type === 'file') return;
          if (el.offsetParent === null && el.style.display === 'none') return;

          // Filter: hanya field dalam tab data
          var tabPanel = el.closest('.tab-panel, [id^="tp-"]');
          if (tabPanel && _allowedTabs.indexOf(tabPanel.id) < 0) return;

          // Cari label: strategi berlapis
          var lbl = null;

          // 1. Cari <label for="...">
          var labelEl = document.querySelector('label[for="' + el.id + '"]');
          if (labelEl) lbl = labelEl.textContent.trim();

          // 2. Cari sibling .flbl
          if (!lbl) {
            var prev = el.previousElementSibling;
            var maxLook = 5;
            while (prev && maxLook-- > 0) {
              if (prev.classList && prev.classList.contains('flbl')) { lbl = prev.textContent.trim(); break; }
              prev = prev.previousElementSibling;
            }
          }

          // 3. Cari di parent wrapper
          if (!lbl) {
            var wrap = el.closest('.finp-pin-wrap, .finp-wrap, .frow, .form-group, .field-wrap');
            if (wrap) {
              var flblEl = wrap.querySelector('.flbl');
              if (flblEl) lbl = flblEl.textContent.trim();
              if (!lbl) {
                var lblEl2 = wrap.querySelector('label');
                if (lblEl2) lbl = lblEl2.textContent.trim();
              }
            }
          }

          // 4. Fallback ke placeholder, name, atau id yang dibersihkan
          if (!lbl) {
            lbl = el.placeholder || el.name || el.id.replace(/^f-?/, '').replace(/[-_]/g, ' ');
          }

          // Cari section/tab untuk konteks
          var section = '';
          if (tabPanel) {
            var titleEl = tabPanel.querySelector('.panel-title, .section-title, h3, h4');
            if (titleEl) section = titleEl.textContent.trim().replace(/^[IVXLCDM]+\.\s*/, '');
          }

          var info = {
            id: el.id,
            type: el.tagName.toLowerCase(),
            label: lbl
          };
          if (section) info.section = section;
          if (el.tagName === 'SELECT') {
            var opts = [];
            el.querySelectorAll('option').forEach(function (o) { if (o.value) opts.push(o.value); });
            if (opts.length) info.options = opts;
          }
          fields.push(info);
        });
        return fields;
      }


      /* ── AI Topbar Progress ── */
      var _aiStyle = document.createElement('style');
      _aiStyle.textContent = `
    #ai-topbar-progress {
      position: fixed; top: 0; left: 0; right: 0; z-index: 99998;
      transform: translateY(-100%); opacity: 0;
      transition: transform .35s cubic-bezier(.4,0,.2,1), opacity .35s ease;
      pointer-events: none;
    }
    #ai-topbar-progress.ai-prog-in { transform: translateY(0); opacity: 1; pointer-events: auto; }
    #ai-topbar-progress.ai-prog-out { transform: translateY(-100%); opacity: 0; }
    .ai-prog-inner {
      background: var(--topbar-bg); backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(93,224,133,.15);
      padding: 10px 24px 12px; display: flex; flex-direction: column; gap: 7px;
    }
    .ai-prog-track {
      width: 100%; height: 4px; background: rgba(var(--tc), 0.08);
      border-radius: 4px; overflow: hidden;
    }
    .ai-prog-fill {
      height: 100%; width: 0%;
      background: linear-gradient(90deg, rgba(var(--ac,93,224,133),1), rgba(var(--ac,93,224,133),.65));
      border-radius: 4px;
      transition: width 1.2s cubic-bezier(.4,0,.2,1);
      box-shadow: 0 0 12px rgba(93,224,133,.25);
    }
    .ai-prog-info { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .ai-prog-status {
      font-size: 12.5px; font-weight: 600; color: rgba(var(--tc), 0.88);
      letter-spacing: .2px;
    }
    .ai-prog-files {
      font-size: 11px; color: rgba(var(--tc), 0.4);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 55%;
      text-align: right;
    }
  `;
      document.head.appendChild(_aiStyle);

      var _aiStepMsgs = [
        'Mengunggah dokumen ke server...',
        'Menganalisis isi dokumen...',
        'Membaca tabel dan data terstruktur...',
        'Memetakan data ke formulir...',
        'Finalisasi hasil ekstraksi...'
      ];
      var _aiStep = 0, _aiTimer = null, _aiFileNames = [];

      function _aiBarShow(fileList) {
        _aiFileNames = (fileList || []).map(function (p) { return p.replace(/^.*[\\/\\\\]/, ''); });
        _aiStep = 0;
        if (window.LStopperLoading) {
          var detail = _aiFileNames.length ? (_aiFileNames.length + ' file: ' + _aiFileNames.join(', ')) : '';
          window.LStopperLoading.show({
            title: 'STOPPER AI',
            message: _aiStepMsgs[0],
            detail: detail,
            steps: _aiStepMsgs,
            interval: 4500
          });
          return;
        }
        // Remove if already exists
        var old = document.getElementById('ai-topbar-progress');
        if (old) old.parentNode.removeChild(old);

        // Create blocking overlay
        var overlay = document.createElement('div');
        overlay.id = 'ai-blocking-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.5);backdrop-filter:blur(3px);cursor:default;';
        document.body.appendChild(overlay);

        var bar = document.createElement('div');
        bar.id = 'ai-topbar-progress';
        bar.innerHTML = [
          '<div class="ai-prog-inner">',
          '  <div class="ai-prog-track"><div class="ai-prog-fill" id="ai-prog-fill"></div></div>',
          '  <div class="ai-prog-info">',
          '    <span class="ai-prog-status" id="ai-prog-status">Memulai ekstraksi...</span>',
          '    <span class="ai-prog-files" id="ai-prog-files"></span>',
          '  </div>',
          '</div>'
        ].join('');
        document.body.appendChild(bar);

        // Show file names
        var filesEl = document.getElementById('ai-prog-files');
        if (filesEl && _aiFileNames.length) {
          filesEl.textContent = _aiFileNames.length + ' file: ' + _aiFileNames.join(', ');
        }

        // Animate bar entry
        requestAnimationFrame(function () { bar.classList.add('ai-prog-in'); });

        // Start step progression
        _aiStep = 0;
        _aiUpdateStep();
        _aiTimer = setInterval(function () {
          _aiStep++;
          if (_aiStep >= _aiStepMsgs.length) _aiStep = _aiStepMsgs.length - 1;
          _aiUpdateStep();
        }, 4500);
      }

      function _aiUpdateStep() {
        var fill = document.getElementById('ai-prog-fill');
        var status = document.getElementById('ai-prog-status');
        if (!fill || !status) return;
        var pct = Math.min(15 + (_aiStep / (_aiStepMsgs.length - 1)) * 75, 90);
        fill.style.width = pct + '%';
        status.textContent = _aiStepMsgs[_aiStep];
      }

      function _aiBarDone(success, msg) {
        if (_aiTimer) { clearInterval(_aiTimer); _aiTimer = null; }
        if (window.LStopperLoading) {
          if (success) window.LStopperLoading.done(msg || 'Selesai.');
          else window.LStopperLoading.hide();
          return;
        }
        var fill = document.getElementById('ai-prog-fill');
        var status = document.getElementById('ai-prog-status');
        var bar = document.getElementById('ai-topbar-progress');
        if (fill) {
          fill.style.width = '100%';
          fill.style.background = success
            ? 'linear-gradient(90deg, #2ecc71, #27ae60)'
            : 'linear-gradient(90deg, #e74c3c, #c0392b)';
        }
        if (status) status.textContent = msg || (success ? 'Selesai' : 'Gagal');

        // Remove blocking overlay immediately
        var overlay = document.getElementById('ai-blocking-overlay');
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);

        // Auto-hide after a bit
        setTimeout(function () {
          if (bar) { bar.classList.remove('ai-prog-in'); bar.classList.add('ai-prog-out'); }
          setTimeout(function () { if (bar && bar.parentNode) bar.parentNode.removeChild(bar); }, 500);
        }, success ? 2500 : 4000);
      }

      async function _aiEnsureTabsMounted(holdMs) {
        try {
          if (typeof window.__LIBERO_LAZY_PREPARE_ALL === 'function') {
            await window.__LIBERO_LAZY_PREPARE_ALL(holdMs || 120000);
          } else if (typeof window.__LIBERO_LAZY_MOUNT_ALL === 'function') {
            window.__LIBERO_LAZY_MOUNT_ALL();
          }
        } catch (_e) { }
      }

      function _stopperPdfEsc(value) {
        return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      }

      function _stopperPdfIsPerkaraField(fid) {
        return fid === 'perkara_list' || fid === 'f-perkara_list' || fid === 'perkara' || fid === 'pasal';
      }

      function _stopperPdfFormatPerkaraPasalItem(item) {
        item = item || {};
        var perkara = String(item.perkara || '').trim();
        var pasal = String(item.pasal || '').trim();
        if (perkara && pasal) return perkara + ', ' + pasal;
        return perkara || pasal || '';
      }

      function _stopperPdfCleanPerkaraPasalEvidence(value) {
        return String(value || '')
          .replace(/\bKejahatan\s*:\s*/gi, '')
          .replace(/\bPerkara\s*:\s*/gi, '')
          .replace(/\bPasal\s*:\s*/gi, 'Pasal ')
          .replace(/\s+/g, ' ')
          .trim();
      }

      function _stopperPdfText(value) {
        if (value == null || value === '') return '-';
        if (Array.isArray(value)) {
          if (!value.length) return '-';
          if (typeof value[0] === 'object') {
            var rendered = value.slice(0, 3).map(function (it) {
              if (Object.prototype.hasOwnProperty.call(it, 'perkara') || Object.prototype.hasOwnProperty.call(it, 'pasal')) {
                return _stopperPdfFormatPerkaraPasalItem(it);
              }
              if (Object.prototype.hasOwnProperty.call(it, 'nama_pasangan') || Object.prototype.hasOwnProperty.call(it, 'tanggal_nikah')) {
                return [it.nama_pasangan ? ('Pasangan: ' + it.nama_pasangan) : '', it.tanggal_nikah ? ('Tanggal: ' + it.tanggal_nikah) : '', it.status ? ('Status: ' + it.status) : ''].filter(Boolean).join(' | ');
              }
              return [it.nama ? ('Nama: ' + it.nama) : '', it.hubungan ? ('Hubungan: ' + it.hubungan) : '', it.pekerjaan ? ('Pekerjaan: ' + it.pekerjaan) : '', it.alamat ? ('Alamat: ' + it.alamat) : ''].filter(Boolean).join(' | ') || '-';
            }).filter(Boolean).join('; ');
            return (rendered || '-') + (rendered && value.length > 3 ? ' +' + (value.length - 3) + ' data' : '');
          }
          return value.filter(Boolean).join(', ') || '-';
        }
        if (typeof value === 'object') {
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
            return k + ': ' + (typeof v === 'object' ? _stopperPdfText(v) : String(v));
          }).filter(Boolean).join(' | ') || '-';
        }
        return String(value || '').trim() || '-';
      }

      function _stopperPdfUnwrapValue(raw) {
        if (raw && typeof raw === 'object' && !Array.isArray(raw) && Object.prototype.hasOwnProperty.call(raw, 'value')) {
          return {
            value: raw.value,
            source: raw.source_file || raw.source || raw.source_label || '',
            evidence: raw.evidence || raw.catatan || ''
          };
        }
        return { value: raw, source: '', evidence: '' };
      }

      function _stopperPdfFindField(fid) {
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

      function _stopperPdfCurrentValue(fid) {
        if (fid === 'perkara_list' || fid === 'f-perkara_list' || fid === 'perkara') return window._perkaraList || [];
        if (fid === 'susunan_keluarga' || fid === 'f-susunan_keluarga') return window.anggotaBersama || [];
        if (fid === 'susunan_keluarga_penjamin') return window.anggotaPenjamin || [];
        if (fid === 'susunan_keluarga_klien') {
          return (Array.isArray(window.anggotaBersama) && window.anggotaBersama.length)
            ? window.anggotaBersama
            : (window.anggotaKlien || []);
        }
        var el = _stopperPdfFindField(fid);
        return el ? el.value : '';
      }

      function _stopperPdfSourceText(fid, raw, sourceMap) {
        var meta = sourceMap && sourceMap[fid];
        if (!meta) meta = _stopperPdfUnwrapValue(raw);
        if (typeof meta === 'string') return meta || '-';
        var file = meta.source_file || meta.file || meta.source || '';
        var label = meta.source_label || meta.label || '';
        var evidence = meta.evidence || meta.catatan || '';
        if (_stopperPdfIsPerkaraField(fid)) evidence = _stopperPdfCleanPerkaraPasalEvidence(evidence);
        var main = label || file || '-';
        return evidence ? (main + ' - ' + evidence) : main;
      }

      function _stopperPdfNormalizeFieldId(fid) {
        return String(fid || '').trim().replace(/^f\d+[-_]/i, '').replace(/^f[-_]/i, '').replace(/[-_\s]+/g, '-').toLowerCase();
      }

      function _stopperPdfCleanSection(value) {
        return String(value || '').trim().replace(/^[IVXLCDM]+(?:\.|\s*[-–—])\s*/i, '').trim();
      }

      function _stopperPdfFieldLabel(fid, fallback) {
        var key = _stopperPdfNormalizeFieldId(fid);
        var labels = {
          'jk-penjamin': 'Jenis Kelamin Penjamin',
          'status-penjamin': 'Status Pernikahan Penjamin',
          'status-pekerjaan': 'Status Pekerjaan Penjamin',
          'pekerjaan-penjamin': 'Pekerjaan Penjamin',
          'perkara-list': 'Perkara & Pasal',
          'perkara': 'Perkara & Pasal',
          'susunan-keluarga': 'Susunan Keluarga',
          'susunan-keluarga-klien': 'Susunan Keluarga Klien',
          'susunan-keluarga-penjamin': 'Susunan Keluarga Orang Tua/Wali',
          'riwayat-pernikahan': 'Riwayat Pernikahan Klien',
          'riwayat-pernikahan-penjamin': 'Riwayat Pernikahan Penjamin',
          'riwayat-pernikahan-wali': 'Riwayat Pernikahan Wali'
        };
        return labels[key] || fallback || fid;
      }

      function _stopperPdfFieldSection(fid, fallback) {
        var key = _stopperPdfNormalizeFieldId(fid);
        if (key === 'perkara-list' || key === 'perkara' || key === 'pasal' || key.indexOf('susunan-keluarga') === 0) return 'Identitas';
        if (key === 'riwayat-pernikahan') return 'Riwayat Hidup dan Perkembangan Klien';
        if (key === 'riwayat-pernikahan-penjamin') return 'Kondisi Orang Tua / Wali';
        if (key === 'riwayat-pernikahan-wali') return 'Kondisi Orang Tua / Wali';
        return _stopperPdfCleanSection(fallback) || 'Lainnya';
      }

      function _stopperPdfComparableText(value) {
        return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
      }

      async function processFile(filePaths, docLabels, approvedData) {
        var _fromReview = !!approvedData;
        if (!_fromReview) {
          var okStart = typeof LDialog !== 'undefined'
            ? await LDialog.confirm({
              title: 'Konfirmasi Lanjutkan',
              message:
                'STOPPER akan membaca PDF/foto dan memetakan hasilnya ke formulir.<br><br>' +
                'Hasilnya akan ditampilkan untuk ditinjau sebelum diterapkan.<br><br>' +
                'Lanjutkan?',
              icon: 'warning',
              type: 'warning',
              okText: 'Ya, Lanjutkan',
              cancelText: 'Batal'
            })
            : confirm(
              'STOPPER akan membaca PDF/foto dan memetakan hasilnya ke formulir. ' +
              'Hasilnya akan ditampilkan untuk ditinjau sebelum diterapkan. Lanjutkan?'
            );
          if (!okStart) return;
        }
        if (!_fromReview) _aiBarShow(filePaths);

        try {
          var fields = [];
          var res = null;
          if (_fromReview) {
            res = { ok: true, data: approvedData, _fromReview: true };
          } else {
            await _aiEnsureTabsMounted(180000);
            fields = collectFields();
            res = await window.pywebview.api.ai_extract_pdf(filePaths, fields, docLabels || null);
          }
          // overlay removed by _aiBarDone

          if (res && res.ok && res.data) {
            await _aiEnsureTabsMounted(120000);
            if (!res._fromReview) {
              _aiBarDone(true, 'Hasil STOPPER siap ditinjau.');
              try {
                var reviewFn = window._showStopperPdfReview;
                if (typeof reviewFn !== 'function') throw new Error('Modal review STOPPER belum siap.');
                reviewFn(res.data, filePaths, docLabels || null, fields, function (selected) {
                  processFile([], null, selected);
                }, res.model || '');
              } catch (reviewErr) {
                console.error('[Stopper] Gagal menampilkan review PDF/Foto:', reviewErr);
                if (window.LStopperLoading) window.LStopperLoading.hide();
                if (typeof toastError !== 'undefined') toastError('Gagal menampilkan review STOPPER. Coba jalankan ulang.');
              }
              return;
            }
            console.log('[Stopper] AI returned fields:', Object.keys(res.data));
            console.log('[Stopper] susunan_keluarga:', JSON.stringify(res.data.susunan_keluarga || 'TIDAK ADA'));
            console.log('[Stopper] perkara_list:', JSON.stringify(res.data.perkara_list || 'TIDAK ADA'));
            if (window.LStopperFieldApply && typeof window.LStopperFieldApply.log === 'function') {
              window.LStopperFieldApply.log('info', 'review', 'payload dipilih dari modal review', {
                fields: Object.keys(res.data),
                susunan_keluarga: res.data.susunan_keluarga || null,
                perkara_list: res.data.perkara_list || null
              });
            }
            var filled = 0;
            if (window.LStopperFieldApply && typeof window.LStopperFieldApply.applyReviewedPayload === 'function') {
              var applyStats = window.LStopperFieldApply.applyReviewedPayload(res.data, { applyMarriageHistory: true });
              filled = applyStats.filled || 0;
              if (!_fromReview) _aiBarDone(true, 'Selesai -- ' + filled + ' kolom berhasil terisi. Silakan periksa kembali data yang telah diisi.');
              if (typeof toastSuccess !== 'undefined') toastSuccess('Berhasil mengisi ' + filled + ' kolom dari dokumen PDF. Silakan periksa kembali.');
              return;
            }
            var applyUnavailableMsg = 'Engine penerapan hasil STOPPER belum siap. Tutup dan buka kembali modul.';
            if (!_fromReview) _aiBarDone(false, applyUnavailableMsg);
            if (typeof toastError !== 'undefined') toastError(applyUnavailableMsg);
            else console.error('[Stopper] ' + applyUnavailableMsg);
            return;
            // BLACKLIST: field yang TIDAK BOLEH disentuh oleh AI
            var _BLACKLIST = [
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

            // Helper: find element by trying multiple ID variations
            function findField(fid) {
              var el = document.getElementById(fid);
              if (el) return el;
              // try with f- prefix
              el = document.getElementById('f-' + fid);
              if (el) return el;
              // try converting underscores to dashes
              var dashed = fid.replace(/_/g, '-');
              el = document.getElementById(dashed);
              if (el) return el;
              el = document.getElementById('f-' + dashed);
              if (el) return el;
              // try removing f- prefix
              if (fid.startsWith('f-')) {
                el = document.getElementById(fid.substring(2));
                if (el) return el;
                el = document.getElementById(fid.substring(2).replace(/-/g, '_'));
                if (el) return el;
              }
              return null;
            }

            // Helper: check if field is blacklisted
            function isBlacklisted(fid) {
              if (_BLACKLIST.indexOf(fid) >= 0) return true;
              if (_BLACKLIST.indexOf('f-' + fid) >= 0) return true;
              var dashed = fid.replace(/_/g, '-');
              if (_BLACKLIST.indexOf(dashed) >= 0) return true;
              if (_BLACKLIST.indexOf('f-' + dashed) >= 0) return true;
              return false;
            }

            for (var fid in res.data) {
              if (fid === '__sources' || fid === '__source' || fid === 'sources') continue;
              // Skip blacklisted fields
              if (isBlacklisted(fid)) continue;
              var val = _stopperPdfUnwrapValue(res.data[fid]).value;
              if (!val && val !== 0 && val !== false) continue;

              if ((fid === 'perkara_list' || fid === 'f-perkara_list' || fid === 'perkara') && Array.isArray(val)) {
                console.log('[Stopper] Mengisi List Perkara', val);
                try {
                  var validItems = val.filter(function (it) { return it.perkara || it.pasal; });
                  if (validItems.length > 0) {
                    window._perkaraList = validItems.map(function (it) {
                      return { perkara: it.perkara || '', pasal: it.pasal || '' };
                    });
                    if (typeof _renderPerkaraList === 'function') _renderPerkaraList();
                    filled += validItems.length;
                  }
                } catch (e) { console.error('[Stopper] ERROR mengisi perkara:', e); }
                continue;
              }

              if ((fid === 'susunan_keluarga' || fid === 'f-susunan_keluarga') && Array.isArray(val)) {
                console.log('[Stopper] Mengisi Susunan Keluarga (Bersama)', val);
                try {
                  if (window.anggotaBersama) {
                    window.anggotaBersama.length = 0;
                    val.forEach(function (item) {
                      var usia = item.usia || item.umur || item.umur_angka || '';
                      if (!usia && item.tanggal_lahir) {
                        try {
                          var parts = item.tanggal_lahir.split('-');
                          var lahir = parts.length === 3 ? new Date(parts[2], parts[1] - 1, parts[0]) : new Date(item.tanggal_lahir);
                          usia = String(new Date().getFullYear() - lahir.getFullYear());
                        } catch (e) { usia = ''; }
                      }
                      var jk = _normalizeFamJK(item.jenis_kelamin || item.jk || item['L/P'] || item.lp || '');
                      window.anggotaBersama.push({
                        nama: item.nama || '',
                        jk: jk,
                        jenis_kelamin: jk,
                        usia: usia,
                        pendidikan: item.pendidikan || '',
                        pekerjaan: item.pekerjaan || '',
                        keterangan: item.hubungan || ''
                      });
                    });
                    if (typeof _renderFamTable === 'function') _renderFamTable('tbody-bersama', window.anggotaBersama);
                    if (typeof onSusunanChange === 'function') onSusunanChange();
                    filled += val.length;
                  } else {
                    console.error('[Stopper] anggotaBersama TIDAK DITEMUKAN di window!');
                  }
                } catch (e) { console.error('[Stopper] ERROR mengisi susunan_keluarga:', e); }
                continue;
              }

              if (fid === 'susunan_keluarga_penjamin' && Array.isArray(val)) {
                console.log('[Stopper] Mengisi Susunan Keluarga Penjamin', val);
                try {
                  if (window.anggotaPenjamin) {
                    window.anggotaPenjamin.length = 0;
                    val.forEach(function (item) {
                      var usia = item.usia || item.umur || item.umur_angka || '';
                      if (!usia && item.tanggal_lahir) {
                        try {
                          var parts = item.tanggal_lahir.split('-');
                          var lahir = parts.length === 3 ? new Date(parts[2], parts[1] - 1, parts[0]) : new Date(item.tanggal_lahir);
                          usia = String(new Date().getFullYear() - lahir.getFullYear());
                        } catch (e) { usia = ''; }
                      }
                      var jk = _normalizeFamJK(item.jenis_kelamin || item.jk || item['L/P'] || item.lp || '');
                      window.anggotaPenjamin.push({
                        nama: item.nama || '',
                        jk: jk,
                        jenis_kelamin: jk,
                        usia: usia,
                        pendidikan: item.pendidikan || '',
                        pekerjaan: item.pekerjaan || '',
                        keterangan: item.hubungan || ''
                      });
                    });
                    if (typeof _renderFamTable === 'function') _renderFamTable('tbody-penjamin', window.anggotaPenjamin);
                    if (typeof onSusunanChange === 'function') onSusunanChange();
                    filled += val.length;
                  } else {
                    console.error('[Stopper] anggotaPenjamin TIDAK DITEMUKAN di window!');
                  }
                } catch (e) { console.error('[Stopper] ERROR mengisi susunan_keluarga_penjamin:', e); }
                continue;
              }

              if (fid === 'susunan_keluarga_klien' && Array.isArray(val)) {
                console.log('[Stopper] Mengisi Susunan Keluarga Klien', val);
                try {
                  if (window.anggotaKlien) {
                    window.anggotaKlien.length = 0;
                    val.forEach(function (item) {
                      var usia = item.usia || item.umur || item.umur_angka || '';
                      if (!usia && item.tanggal_lahir) {
                        try {
                          var parts = item.tanggal_lahir.split('-');
                          var lahir = parts.length === 3 ? new Date(parts[2], parts[1] - 1, parts[0]) : new Date(item.tanggal_lahir);
                          usia = String(new Date().getFullYear() - lahir.getFullYear());
                        } catch (e) { usia = ''; }
                      }
                      var jk = _normalizeFamJK(item.jenis_kelamin || item.jk || item['L/P'] || item.lp || '');
                      window.anggotaKlien.push({
                        nama: item.nama || '',
                        jk: jk,
                        jenis_kelamin: jk,
                        usia: usia,
                        pendidikan: item.pendidikan || '',
                        pekerjaan: item.pekerjaan || '',
                        keterangan: item.hubungan || ''
                      });
                    });
                    if (typeof _renderFamTable === 'function') _renderFamTable('tbody-klien', window.anggotaKlien);
                    if (typeof onSusunanChange === 'function') onSusunanChange();
                    filled += val.length;
                  } else {
                    console.error('[Stopper] anggotaKlien TIDAK DITEMUKAN di window!');
                  }
                } catch (e) { console.error('[Stopper] ERROR mengisi susunan_keluarga_klien:', e); }
                continue;
              }

              // Skip arrays that we don't know how to handle
              if (Array.isArray(val)) {
                console.log('[Stopper] Skipping unknown array field:', fid);
                continue;
              }

              var el = findField(fid);
              if (!el) {
                console.log('[Stopper] Field NOT FOUND:', fid, '-> tried variations');
                continue;
              }
              if (el.tagName === 'SELECT') {
                var found = false;
                for (var i = 0; i < el.options.length; i++) {
                  if (el.options[i].value.toLowerCase() === String(val).toLowerCase() ||
                    el.options[i].text.toLowerCase() === String(val).toLowerCase()) {
                    el.selectedIndex = i; found = true; break;
                  }
                }
                if (!found) {
                  for (var j = 0; j < el.options.length; j++) {
                    if (el.options[j].text.toLowerCase().indexOf(String(val).toLowerCase()) >= 0 ||
                      String(val).toLowerCase().indexOf(el.options[j].text.toLowerCase()) >= 0) {
                      el.selectedIndex = j; found = true; break;
                    }
                  }
                }
                if (!found) continue;
              } else {
                el.value = val;
              }
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
              filled++;
            }

            // Auto-set f-susunan-keluarga berdasarkan data yang diterima
            var susSamaEl = document.getElementById('f-susunan-keluarga');
            if (susSamaEl) {
              if (res.data.susunan_keluarga && !res.data.susunan_keluarga_klien) {
                susSamaEl.value = 'Ya';
              } else if (res.data.susunan_keluarga_klien || res.data.susunan_keluarga_penjamin) {
                susSamaEl.value = 'Tidak';
              }
              susSamaEl.dispatchEvent(new Event('change', {bubbles: true}));
            }


            if (!_fromReview) _aiBarDone(true, 'Selesai -- ' + filled + ' kolom berhasil terisi. Silakan periksa kembali data yang telah diisi.');
            if (typeof toastSuccess !== 'undefined') toastSuccess('Berhasil mengisi ' + filled + ' kolom dari dokumen PDF. Silakan periksa kembali.');
          } else {
            if (!_fromReview) _aiBarDone(false, 'Gagal memproses dokumen');
            if (typeof toastError !== 'undefined') toastError(res.err || 'Gagal memproses PDF');
          }
        } catch (e) {
          // overlay removed by _aiBarDone
          if (!_fromReview) _aiBarDone(false, 'Terjadi kesalahan');
          if (typeof toastError !== 'undefined') toastError('Error: ' + e);
        }
      }

      function inject() {
        if (_INJECTED) return;
        _INJECTED = true;
        _css();

        var stopperSlots = [
          { label: 'Surat Permintaan' },
          { label: 'KK Klien Anak' },
          { label: 'KK Wali' },
          { label: 'Surat Tugas' },
          { label: 'Berita Acara Pemeriksaan' }
        ];
        var stopperSubtitle = 'Pilih dokumen untuk dianalisa AI. Semua dokumen bersifat opsional.<br><br><strong style="color:rgba(var(--ac,93,224,133),0.9)">INFO PENTING:</strong><br><span style="opacity:0.85">&bull; Sesuaikan upload Kartu Keluarga dengan kondisi tempat tinggal Klien Anak dan Walinya.</span>';
        if (window.LStopperDocPicker && typeof window.LStopperDocPicker.installButton === 'function') {
          window.LStopperDocPicker.installButton({
            buttonId: 'ai-autofill-btn',
            slots: stopperSlots,
            subtitleHtml: stopperSubtitle,
            noteHtml: '*Tidak ada dokumen wajib. Bebas diproses meskipun hanya 1 file.',
            onProcess: function (paths, labels) { processFile(paths, labels); }
          });
          return;
        }

        /* ── Modal CSS ── */
        var _ms = document.createElement('style');
        _ms.textContent = [
          '.stm-ov{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .22s ease;pointer-events:none}',
          '.stm-ov.stm-in{opacity:1;pointer-events:auto}',
          '.stm-card{background:var(--navy, var(--topbar-bg));border:1px solid rgba(var(--ac,93,224,133),.18);border-radius:16px;box-shadow:0 28px 90px rgba(0,0,0,.7),0 0 0 1px rgba(var(--tc,255,255,255),.04);width:min(480px,94vw);display:flex;flex-direction:column;overflow:hidden;transform:translateY(16px) scale(.96);transition:transform .28s cubic-bezier(.34,1.3,.64,1),opacity .22s ease;opacity:0}',
          '.stm-ov.stm-in .stm-card{transform:translateY(0) scale(1);opacity:1}',
          '.stm-hdr{display:flex;align-items:center;justify-content:space-between;padding:17px 18px 0;gap:8px}',
          '.stm-title{display:flex;align-items:center;gap:8px;font-size:14.5px;font-weight:700;color:rgba(var(--ac,93,224,133),1);letter-spacing:-.2px}',
          '.stm-title svg{stroke:rgba(var(--ac,93,224,133),1);fill:rgba(var(--ac,93,224,133),.18);flex-shrink:0}',
          '.stm-x{background:none;border:none;cursor:pointer;color:rgba(var(--tc,255,255,255),.3);font-size:16px;padding:4px 9px;border-radius:6px;transition:color .15s,background .15s;line-height:1;margin-left:auto}',
          '.stm-x:hover{color:rgba(var(--tc,255,255,255),1);background:rgba(var(--tc,255,255,255),.09)}',
          '.stm-sub{margin:5px 18px 6px;font-size:11.5px;color:rgba(var(--tc,255,255,255),.35);line-height:1.4}',
          '.stm-filetypes{display:flex;align-items:center;gap:5px;padding:0 18px 11px;flex-wrap:wrap}',
          '.stm-ft{font-size:9.5px;font-weight:700;padding:2px 7px;border-radius:4px;border:1px solid rgba(var(--ac,93,224,133),.28);color:rgba(var(--ac,93,224,133),.9);background:rgba(var(--ac,93,224,133),.09);letter-spacing:.5px}',
          '.stm-ftlbl{font-size:10px;color:rgba(var(--tc,255,255,255),.22);margin-left:2px}',
          '.stm-body{padding:0 18px;overflow-y:auto;max-height:50vh;display:flex;flex-direction:column;gap:6px}',
          '.stm-row{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:10px;background:rgba(var(--tc,255,255,255),.025);border:1px solid rgba(var(--tc,255,255,255),.055);transition:border-color .2s,background .2s}',
          '.stm-row.stm-ok{background:rgba(var(--ac,93,224,133),.055);border-color:rgba(var(--ac,93,224,133),.2)}',
          '.stm-info{flex:1;min-width:0}',
          '.stm-lbl{font-size:12.5px;font-weight:600;color:rgba(var(--tc,255,255,255),.78);display:flex;align-items:center;gap:5px}',
          '.stm-req{font-size:10px;font-weight:700;color:#ff7777;background:rgba(255,100,100,.12);border:1px solid rgba(255,100,100,.25);border-radius:4px;padding:1px 5px;letter-spacing:.3px}',
          '.stm-fn{font-size:10.5px;color:rgba(var(--tc,255,255,255),.26);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;transition:color .2s}',
          '.stm-fn.stm-fn-ok{color:rgba(var(--ac,93,224,133),.85)}',
          '.stm-pick{flex-shrink:0;background:rgba(var(--tc,255,255,255),.06);border:1px solid rgba(var(--tc,255,255,255),.11);color:rgba(var(--tc,255,255,255),.65);font-size:11px;font-weight:600;padding:5px 13px;border-radius:7px;cursor:pointer;transition:all .15s;white-space:nowrap}',
          '.stm-pick:hover{background:rgba(var(--tc,255,255,255),.12);color:rgba(var(--tc,255,255,255),1);border-color:rgba(var(--tc,255,255,255),.22)}',
          '.stm-pick.stm-pick-ok{background:rgba(var(--ac,93,224,133),.1);border-color:rgba(var(--ac,93,224,133),.28);color:rgba(var(--ac,93,224,133),1)}',
          '.stm-pick.stm-pick-ok:hover{background:rgba(var(--ac,93,224,133),.2);color:rgba(var(--tc,255,255,255),1)}',
          '.stm-remove{display:none;flex-shrink:0;width:28px;height:28px;align-items:center;justify-content:center;background:rgba(255,92,92,.08);border:1px solid rgba(255,92,92,.2);color:rgba(255,150,150,.86);font-size:17px;line-height:1;border-radius:7px;cursor:pointer;transition:all .15s}',
          '.stm-remove:hover{background:rgba(255,92,92,.18);border-color:rgba(255,120,120,.45);color:#fff}',
          '.stm-row.stm-ok .stm-remove{display:flex}',
          '.stm-foot{display:flex;justify-content:flex-end;align-items:center;gap:9px;padding:14px 18px;border-top:1px solid rgba(var(--tc,255,255,255),.055);margin-top:10px}',
          '.stm-note{flex:1;font-size:11px;color:rgba(var(--tc,255,255,255),.4);line-height:1.3}',
          '.stm-cancel{background:none;border:1px solid rgba(var(--tc,255,255,255),.1);color:rgba(var(--tc,255,255,255),.45);font-size:12.5px;font-weight:500;padding:7px 16px;border-radius:8px;cursor:pointer;transition:all .15s}',
          '.stm-cancel:hover{border-color:rgba(var(--tc,255,255,255),.22);color:rgba(var(--tc,255,255,255),.8)}',
          '.stm-proses{display:flex;align-items:center;gap:6px;background:rgba(var(--ac,93,224,133),.14);border:1px solid rgba(var(--ac,93,224,133),.38);color:rgba(var(--ac,93,224,133),1);font-size:12.5px;font-weight:700;padding:7px 18px;border-radius:8px;cursor:pointer;transition:all .2s;white-space:nowrap}',
          '.stm-proses:not([disabled]):hover{background:rgba(var(--ac,93,224,133),.26);border-color:rgba(var(--ac,93,224,133),1);color:rgba(var(--tc,255,255,255),1)}',
          '.stm-proses[disabled]{opacity:.28;cursor:not-allowed}',
          '.stm-proses svg{stroke:currentColor;fill:rgba(var(--ac,93,224,133),.2)}'
        ].join('');
        document.head.appendChild(_ms);

        /* ── Modal builder ── */
        function _buildModal(slots) {
          var old = document.getElementById('stm-ov');
          if (old) old.parentNode.removeChild(old);
          var _sel = {};

          var ov = document.createElement('div');
          ov.id = 'stm-ov'; ov.className = 'stm-ov';

          var card = document.createElement('div');
          card.className = 'stm-card';

          /* header */
          var hdr = document.createElement('div');
          hdr.className = 'stm-hdr';
          var ttl = document.createElement('div');
          ttl.className = 'stm-title';
          ttl.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><span>STOPPER</span>';
          var xBtn = document.createElement('button');
          xBtn.className = 'stm-x'; xBtn.innerHTML = '&times;';
          hdr.appendChild(ttl); hdr.appendChild(xBtn);

          var sub = document.createElement('div');
          sub.className = 'stm-sub';
          sub.innerHTML = 'Pilih dokumen untuk dianalisa AI. Semua dokumen bersifat opsional.<br><br><strong style="color:rgba(var(--ac,93,224,133),0.9)">INFO PENTING:</strong><br><span style="opacity:0.85">&bull; Sesuaikan upload Kartu Keluarga dengan kondisi tempat tinggal Klien Anak dan Walinya.</span>';

          var ftrow = document.createElement('div');
          ftrow.className = 'stm-filetypes';
          ['PDF','JPG','PNG','WEBP'].forEach(function(t) {
            var tag = document.createElement('span');
            tag.className = 'stm-ft'; tag.textContent = t;
            ftrow.appendChild(tag);
          });
          var ftlbl = document.createElement('span');
          ftlbl.className = 'stm-ftlbl'; ftlbl.textContent = 'format yang didukung';
          ftrow.appendChild(ftlbl);

          /* body rows */
          var body = document.createElement('div');
          body.className = 'stm-body';

          slots.forEach(function(slot, i) {
            var row = document.createElement('div');
            row.className = 'stm-row'; row.id = 'stm-row-' + i;

            var info = document.createElement('div');
            info.className = 'stm-info';

            var lbl = document.createElement('div');
            lbl.className = 'stm-lbl';
            lbl.textContent = slot.label;
            if (slot.required) {
              var req = document.createElement('span');
              req.className = 'stm-req'; req.textContent = 'wajib';
              lbl.appendChild(req);
            }

            var fn = document.createElement('div');
            fn.className = 'stm-fn'; fn.id = 'stm-fn-' + i;
            fn.textContent = 'Belum dipilih';

            info.appendChild(lbl); info.appendChild(fn);

            var pb = document.createElement('button');
            pb.className = 'stm-pick'; pb.textContent = 'Pilih';
            pb.dataset.idx = String(i);

            var rb = document.createElement('button');
            rb.className = 'stm-remove';
            rb.type = 'button';
            rb.title = 'Hapus file';
            rb.setAttribute('aria-label', 'Hapus file ' + slot.label);
            rb.innerHTML = '&times;';

            function clearSelection() {
              delete _sel[i];
              var fnEl = document.getElementById('stm-fn-' + i);
              var rowEl = document.getElementById('stm-row-' + i);
              if (fnEl) {
                fnEl.textContent = 'Belum dipilih';
                fnEl.classList.remove('stm-fn-ok');
              }
              if (rowEl) rowEl.classList.remove('stm-ok');
              pb.textContent = 'Pilih';
              pb.classList.remove('stm-pick-ok');
              _chk();
            }

            rb.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              clearSelection();
            });

            pb.addEventListener('click', function() {
              var idx = parseInt(this.dataset.idx);
              var me = this;
              if (window.pywebview && window.pywebview.api && window.pywebview.api.pick_pdf_file) {
                window.pywebview.api.pick_pdf_file().then(function(r) {
                  if (r && r.ok && r.paths && r.paths.length) {
                    var p = r.paths[0];
                    var n = p.replace(/^.*[\\/]/, '');
                    _sel[idx] = { path: p, label: slots[idx].label };
                    var fnEl = document.getElementById('stm-fn-' + idx);
                    var rowEl = document.getElementById('stm-row-' + idx);
                    if (fnEl) { fnEl.textContent = n; fnEl.classList.add('stm-fn-ok'); }
                    if (rowEl) rowEl.classList.add('stm-ok');
                    me.textContent = 'Ganti'; me.classList.add('stm-pick-ok');
                    _chk();
                  } else if (r && r.err && r.err !== 'Tidak ada file dipilih') {
                    if (typeof toastError !== 'undefined') toastError(r.err);
                    else if (typeof toast !== 'undefined') toast(r.err);
                  }
                }).catch(function(err) {
                  var msg = 'Gagal membuka pemilih file: ' + (err && err.message ? err.message : err);
                  if (typeof toastError !== 'undefined') toastError(msg);
                  else if (typeof toast !== 'undefined') toast(msg);
                });
              } else {
                var msg = 'Pemilih file STOPPER belum siap. Tutup dan buka kembali modul.';
                if (typeof toastError !== 'undefined') toastError(msg);
                else if (typeof toast !== 'undefined') toast(msg);
              }
            });

            row.appendChild(info); row.appendChild(pb); row.appendChild(rb);
            body.appendChild(row);
          });

          /* footer */
          var foot = document.createElement('div');
          foot.className = 'stm-foot';

          var note = document.createElement('div');
          note.className = 'stm-note';
          note.innerHTML = '*Tidak ada dokumen wajib. Bebas diproses meskipun hanya 1 file.';

          var canBtn = document.createElement('button');
          canBtn.className = 'stm-cancel'; canBtn.textContent = 'Batal';

          var proBtn = document.createElement('button');
          proBtn.className = 'stm-proses'; proBtn.id = 'stm-proses'; proBtn.disabled = false;
          proBtn.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>Proses';

          foot.appendChild(note); foot.appendChild(canBtn); foot.appendChild(proBtn);

          card.appendChild(hdr); card.appendChild(sub); card.appendChild(ftrow); card.appendChild(body); card.appendChild(foot);
          ov.appendChild(card);
          document.body.appendChild(ov);

          requestAnimationFrame(function() {
            requestAnimationFrame(function() { ov.classList.add('stm-in'); });
          });

          function _close(skipSound) {
            if(skipSound !== true) window._SFX && window._SFX.close();
            ov.classList.remove('stm-in');
            setTimeout(function() { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 280);
          }

          function _chk() {
            var ok = slots.every(function(s, i) { return !s.required || !!_sel[i]; });
            var pb2 = document.getElementById('stm-proses');
            if (pb2) pb2.disabled = !ok;
          }

          xBtn.addEventListener('click', _close);
          canBtn.addEventListener('click', _close);
          ov.addEventListener('click', function(e) { if (e.target === ov) _close(); });

          proBtn.addEventListener('click', function() {
            var paths = [], labels = [];
            slots.forEach(function(s, i) {
              if (_sel[i]) { paths.push(_sel[i].path); labels.push(_sel[i].label); }
            });
            if (!paths.length) return;
            _close();
            setTimeout(function() { processFile(paths, labels); }, 180);
          });
        }

        /* ── Inject button ── */
        var sidenav = document.querySelector('.sidenav');
        if (!sidenav || document.getElementById('ai-autofill-btn')) return;

        var btn = document.createElement('button');
        btn.className = 'snav-stopper';
        btn.id = 'ai-autofill-btn';
        btn.style.display = 'none';
        btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><span class="snav-stopper-label">STOPPER</span><span class="snav-stopper-badge">AI</span>';

        sidenav.insertBefore(btn, sidenav.firstChild);
        if (typeof applyZoom === 'function') requestAnimationFrame(applyZoom);

        function checkKeyStatus() {
          if (window.pywebview && window.pywebview.api && window.pywebview.api.get_ai_key) {
            window.pywebview.api.get_ai_key().then(function (r) {
              if (r && r.has_key) {
                btn.style.display = 'flex';
                btn.style.opacity = '0';
                btn.style.animation = 'none';
                requestAnimationFrame(function () {
                  btn.style.animation = '';
                  btn.style.animation = 'aksiItemIn .3s cubic-bezier(.34,1.3,.64,1) forwards';
                  if (typeof applyZoom === 'function') applyZoom();
                });
              }
            }).catch(function () { });
          }
        }
        setTimeout(checkKeyStatus, 1500);

        btn.addEventListener('click', function () {
          _buildModal(stopperSlots);
        });
      }


      if (document.readyState === 'complete') {
        setTimeout(inject, 2000);
      } else {
        window.addEventListener('load', function () { setTimeout(inject, 2000); });
      }
    })();
  
