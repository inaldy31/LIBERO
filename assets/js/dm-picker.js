// LIBERO: Pemilih dokumen Data Manager dan UI pemilihan file.
    /* ══════════════════════════════════════════════════════
       LIBERO — DM Popup extended: mode pick_image / pick_audio
       · TTD & dok foto → dm_pick_image()
       · Import Audio → dm_pick_audio()
       · DM reads file b64 via dm_read_file_b64() → __dmPendingB64
    ══════════════════════════════════════════════════════ */
    (function () {
      'use strict';

      /* ── extend openDMPopup untuk handle pick modes ── */
      var _origOpen = null;
      var _origMainAct = null;
      var _pickCb = null;  // callback(b64, name) after file selected
      var _lastPickClickPath = '';
      var _lastPickClickAt = 0;

      function _lbrIsPickMode() {
        var titleEl = document.getElementById('dm-t-title');
        var title = titleEl ? titleEl.textContent : '';
        return title.indexOf('Pilih Foto') === 0 || title.indexOf('Pilih File Audio') === 0;
      }

      async function _compressPickedImageDataUrl(dataUrl, opts) {
        if (typeof window._compressImageDataUrl === 'function') {
          return window._compressImageDataUrl(dataUrl, opts || {});
        }
        if (typeof _compressImageDataUrl === 'function') {
          return _compressImageDataUrl(dataUrl, opts || {});
        }
        return {
          dataUrl: dataUrl,
          origBytes: 0,
          newBytes: 0,
          width: 0,
          height: 0
        };
      }

      function _lbrMarkPickChanged() {
        try { window._userHasTyped = true; window.__lastUserEditAt = Date.now(); } catch (_) { }
        try { if (typeof updateProgress === 'function') updateProgress(); } catch (_) { }
        try { document.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) { }
        try { document.dispatchEvent(new Event('change', { bubbles: true })); } catch (_) { }
      }

      function _waitAndPatch() {
        if (typeof window.openDMPopup !== 'function' || typeof window._dmMainAct !== 'function') {
          setTimeout(_waitAndPatch, 150); return;
        }
        if (window._lbrPickPatched) return;
        window._lbrPickPatched = true;

        _origOpen = window.openDMPopup;
        _origMainAct = window._dmMainAct;

        /* ─ override openDMPopup ─ */
        window.openDMPopup = function (ctx) {
          var mode = ctx && ctx.mode;

          if (mode === 'pick_image' || mode === 'pick_audio') {
            var nextCb = ctx && ctx._pickCb;
            _pickCb = (typeof nextCb === 'function')
              ? nextCb
              : (typeof _pickCb === 'function' ? _pickCb : null);

            /* call original to set up navigation + render list */
            _origOpen(ctx);

            /* override title & button after original sets them */
            var titleEl = document.getElementById('dm-t-title');
            var mainBtn = document.getElementById('dm-btn-main');
            var mainLbl = document.getElementById('dm-btn-lbl');
            var mainIco = document.getElementById('dm-btn-ico');
            var delBtn = document.getElementById('dm-btn-del');
            var lblEl = document.getElementById('dm-t-lbl');
            var inpEl = document.getElementById('dm-t-inp');

            if (titleEl) titleEl.textContent = mode === 'pick_image' ? 'Pilih Foto / Gambar' : 'Pilih File Audio';
            /* reset preview panel */
            window.__dmPreviewPending = null;
            setTimeout(function () { if (typeof _dmShowPickPreview === 'function') _dmShowPickPreview(null); }, 50);
            if (lblEl) lblEl.style.display = 'none';
            if (inpEl) inpEl.style.display = 'none';
            if (mainBtn) { mainBtn.className = 'dm-btn primary'; mainBtn.disabled = true; }
            if (mainLbl) mainLbl.textContent = 'Pilih File Ini';
            if (mainIco) mainIco.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
            if (delBtn) delBtn.style.visibility = 'hidden';

            /* hint bar */
            var hint = document.getElementById('_lbr_pick_hint');
            if (!hint) {
              hint = document.createElement('div');
              hint.id = '_lbr_pick_hint';
              hint.style.cssText = 'padding:5px 16px;font-size:11px;font-weight:700;letter-spacing:.4px;'
                + 'background:rgba(var(--ac),.06);border-bottom:1px solid rgba(var(--ac),.1);'
                + 'color:rgba(var(--ac),.75);flex-shrink:0;';
              var body = document.querySelector('.dm-body');
              if (body) body.parentNode.insertBefore(hint, body);
            }
            hint.style.display = 'block';
            hint.textContent = mode === 'pick_image'
              ? '🖼  Filter: JPG · PNG · GIF · BMP · WEBP'
              : '🎵  Filter: MP3 · WAV · M4A · OGG · OPUS · AAC · FLAC';
            return;
          }

          /* hide hint on normal modes */
          var hint = document.getElementById('_lbr_pick_hint');
          if (hint) hint.style.display = 'none';
          /* restore del button */
          var delBtn = document.getElementById('dm-btn-del');
          if (delBtn) delBtn.style.visibility = '';
          _pickCb = null;
          _origOpen(ctx);
        };

        /* ─ override closeDMPopup to cleanup ─ */
        var _origClose = window.closeDMPopup;
        window.closeDMPopup = function () {
          var hint = document.getElementById('_lbr_pick_hint');
          if (hint) hint.style.display = 'none';
          var delBtn = document.getElementById('dm-btn-del');
          if (delBtn) delBtn.style.visibility = '';
          _pickCb = null;
          window.__dmSel = null;
          window.__dmSelPath = '';
          _origClose();
        };

        /* ─ override _dmMainAct for pick modes ─ */
        window._dmMainAct = async function () {
          var ctx = window._lbrPickCtx;
          var mode = ctx || (arguments[0] && arguments[0].mode);

          /* detect pick mode from title */
          var titleEl = document.getElementById('dm-t-title');
          var title = titleEl ? titleEl.textContent : '';
          var isPick = (title.indexOf('Pilih Foto') === 0 || title.indexOf('Pilih File Audio') === 0);
          var isAudioPick = title.indexOf('Pilih File Audio') === 0;

          if (!isPick) { return _origMainAct.apply(this, arguments); }
          if (typeof _pickCb !== 'function') {
            if (typeof toast === 'function') toast('Pemilih file belum siap, coba pilih lagi.');
            return;
          }

          /* get selected file path from dm-detail */
          var path = _lbrGetSelPath();
          if (!path) { if (typeof toast === 'function') toast('Pilih file terlebih dahulu.'); return; }

          var mainBtn = document.getElementById('dm-btn-main');
          if (mainBtn) mainBtn.disabled = true;
          if (typeof toast === 'function') toast('Membaca file…');

          try {
            if (isAudioPick) {
              var audioRaw = await window._py('dm_select_audio_file', path);
              var audioRes = (typeof audioRaw === 'string') ? JSON.parse(audioRaw) : audioRaw;
              if (!audioRes || audioRes.ok === false) {
                if (mainBtn) mainBtn.disabled = false;
                if (typeof toast === 'function') toast((audioRes && audioRes.err) || 'Gagal membaca file.');
                return;
              }
              var cbAudio = _pickCb;
              _pickCb = null;
              window.closeDMPopup();
              if (typeof cbAudio !== 'function') {
                if (mainBtn) mainBtn.disabled = false;
                if (typeof toast === 'function') toast('Pemilih file belum siap, coba pilih lagi.');
                return;
              }
              cbAudio({
                audio_path: audioRes.path,
                audio_url: audioRes.file_url,
                name: audioRes.name,
                size: audioRes.size || 0,
                mime: audioRes.mime || 'audio/mpeg'
              }, audioRes.name);
              return;
            }

            /* poll __dmPendingB64 after calling dm_read_file_b64 */
            window.__dmPendingB64 = null;
            var readRaw = await window._py('dm_read_file_b64', path);
            var readRes = (typeof readRaw === 'string') ? JSON.parse(readRaw) : readRaw;
            if (readRes && readRes.ok === false) {
              if (mainBtn) mainBtn.disabled = false;
              if (typeof toast === 'function') toast(readRes.err || 'Gagal membaca file.');
              return;
            }

            var result = null;
            for (var i = 0; i < 40; i++) {
              await new Promise(function (r) { setTimeout(r, 80); });
              if (window.__dmPendingB64) { result = window.__dmPendingB64; window.__dmPendingB64 = null; break; }
            }

            if (!result) { if (mainBtn) mainBtn.disabled = false; if (typeof toast === 'function') toast('Gagal membaca file.'); return; }

            var cb = _pickCb;
            _pickCb = null;
            window.closeDMPopup();
            if (typeof cb !== 'function') {
              if (mainBtn) mainBtn.disabled = false;
              if (typeof toast === 'function') toast('Pemilih file belum siap, coba pilih lagi.');
              return;
            }
            cb(result.b64, result.name);
          } catch (e) {
            if (mainBtn) mainBtn.disabled = false;
            if (typeof toast === 'function') toast('Error: ' + e);
          }
        };

        /* ─ also enable main button & dbl-click on file select in pick mode ─ */
        var _origClick = window._clickRow;
        window._clickRow = function (i) {
          _origClick(i);
          /* ensure button is enabled for ALL modes when a file is selected */
          var path = window.__dmSelPath || _lbrGetSelPath();
          if (path) {
            var mainBtn = document.getElementById('dm-btn-main');
            if (mainBtn && mainBtn.disabled) mainBtn.disabled = false;
            if (_lbrIsPickMode()) {
              var now = Date.now();
              if (_lastPickClickPath === path && now - _lastPickClickAt < 650) {
                _lastPickClickPath = '';
                _lastPickClickAt = 0;
                window._dmMainAct();
                return;
              }
              _lastPickClickPath = path;
              _lastPickClickAt = now;
            }
          }
        };
      }

      function _lbrGetSelPath() {
        /* prioritas: __dmSelPath (set saat file diklik, works even with preview mode) */
        if (window.__dmSelPath) return window.__dmSelPath;
        /* fallback: read from dm-detail panel "Lokasi" row (mode detail biasa) */
        var rows = document.querySelectorAll('#dm-detail .dm-drow');
        for (var i = 0; i < rows.length; i++) {
          var lbl = rows[i].querySelector('.dm-dlbl');
          if (lbl && lbl.textContent.trim() === 'Lokasi') {
            var val = rows[i].querySelector('.dm-dval');
            return val ? val.textContent.trim() : '';
          }
        }
        return '';
      }

      /* ── helper: open DM in pick mode ── */
      function _lbrOpenPickDM(mode, callback) {
        _pickCb = callback;
        /* openDMPopup will be injected by Python via evaluate_js with _pickCb already set */
        /* But we also override to re-attach _pickCb when openDMPopup fires */
        var _origO2 = window.openDMPopup;
        var _once = function (ctx) {
          if (ctx && (ctx.mode === 'pick_image' || ctx.mode === 'pick_audio')) {
            ctx._pickCb = callback;
          }
          _origO2(ctx);
          window.openDMPopup = _origO2; // restore
        };
        window.openDMPopup = _once;
        window._py(mode === 'pick_image' ? 'dm_pick_image' : 'dm_pick_audio');
      }

      /* ══ 1. TTD ══ */
      function _patchTTD() {
        var inp = document.getElementById('f12-ttd-file');
        if (!inp) return;
        var lbl = inp.closest('label');
        if (!lbl || lbl.dataset.lbrOk) return;
        lbl.dataset.lbrOk = '1';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = lbl.className;
        btn.setAttribute('style', lbl.getAttribute('style') || '');
        var clone = lbl.cloneNode(true);
        clone.querySelector('input') && clone.querySelector('input').remove();
        btn.innerHTML = clone.innerHTML;

        btn.onclick = function () {
          _lbrOpenPickDM('pick_image', async function (b64, name) {
            var packed = await _compressPickedImageDataUrl(b64, {
              maxWidth: 600,
              maxHeight: 300,
              mime: 'image/png'
            });
            var imgData = packed.dataUrl || b64;
            try { window._ttdPetugasB64 = imgData; window._userHasTyped = true; } catch (e) { }
            var img = document.getElementById('ttd-preview-img');
            var wrap = document.getElementById('ttd-preview-wrap');
            var nm = document.getElementById('f12-ttd-name');
            if (img) img.src = imgData;
            if (wrap) wrap.style.display = 'block';
            if (nm) nm.textContent = name;
            _lbrMarkPickChanged();
            if (typeof toast === 'function') toast('Tanda tangan berhasil dipilih ✓');
          });
        };

        lbl.parentNode.replaceChild(btn, lbl);
      }

      /* ══ 2. Dok foto ══ */
      function _upgradeDokRow(row) {
        var lbl = row.querySelector('label.dok-file-lbl');
        if (!lbl || lbl.dataset.lbrOk) return;
        lbl.dataset.lbrOk = '1';
        var rid = parseInt((row.id || '').replace('dok-row-', ''), 10);
        if (isNaN(rid)) return;

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dok-file-lbl';
        btn.textContent = 'Pilih Foto';
        btn.onclick = (function (id) {
          return function () {
            _lbrOpenPickDM('pick_image', async function (b64) {
              var packed = await _compressPickedImageDataUrl(b64, {
                maxWidth: 1600,
                maxHeight: 1600,
                mime: 'image/jpeg',
                quality: 0.78
              });
              var imgData = packed.dataUrl || b64;
              try {
                window._userHasTyped = true;
                var st = (typeof _dokState !== 'undefined') ? _dokState : window._dokState;
                if (st) { var item = Object.values(st).flat().find(function (i) { return i.id === id; }); if (item) item.foto_b64 = imgData; }
              } catch (e) { }
              _lbrMarkPickChanged();
              var wrap = document.getElementById('dok-prev-wrap-' + id);
              if (wrap) {
                wrap.innerHTML = '<img class="dok-preview" src="' + imgData + '" alt="Foto">';
                if (packed.origBytes || packed.newBytes) wrap.title = _fmtKB(packed.origBytes) + ' -> ' + _fmtKB(packed.newBytes);
              }
              if (typeof toast === 'function') toast('Foto berhasil dipilih ✓');
            });
          };
        })(rid);
        lbl.parentNode.replaceChild(btn, lbl);
      }

      function _patchAddDokRow() {
        var orig = window.addDokRow;
        if (!orig || orig._lbrOk) return;
        window.addDokRow = function (group) {
          orig.call(this, group);
          var cont = document.getElementById('dok-' + group + '-rows');
          if (!cont) return;
          var rows = cont.querySelectorAll('.dok-row');
          _upgradeDokRow(rows[rows.length - 1]);
        };
        window.addDokRow._lbrOk = true;
        ['klien', 'penjamin', 'lainnya'].forEach(function (g) {
          var cont = document.getElementById('dok-' + g + '-rows');
          if (!cont) return;
          cont.querySelectorAll('.dok-row').forEach(_upgradeDokRow);
          new MutationObserver(function (ms) {
            ms.forEach(function (m) {
              m.addedNodes.forEach(function (n) {
                if (n.nodeType === 1 && n.classList.contains('dok-row')) _upgradeDokRow(n);
              });
            });
          }).observe(cont, { childList: true });
        });
      }

      /* ══ 3. Import Audio ══ */
      function _patchAudioBtn() {
        var lbl = document.querySelector('label.btn-import-audio');
        if (!lbl || lbl.dataset.lbrOk) return;
        lbl.dataset.lbrOk = '1';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-import-audio';
        var svg = lbl.querySelector('svg');
        btn.innerHTML = (svg ? svg.outerHTML : '') + 'Import Audio';

        btn.onclick = function () {
          _lbrOpenPickDM('pick_audio', function (b64, name) {
            if (b64 && typeof b64 === 'object' && b64.audio_path) {
              var audio = b64;
              var storePath; try { storePath = (typeof _micStore !== 'undefined') ? _micStore : window._micStore; } catch (e) { }
              if (!storePath) { window._micStore = window._micStore || []; storePath = window._micStore; }
              var idPath = 'lbr-' + Date.now();
              var item = { id: idPath, audio_b64: '', audio_path: audio.audio_path, audio_url: audio.audio_url || '', duration: 0, filename: audio.name || name, mime: audio.mime || 'audio/mpeg', size: audio.size || 0 };
              storePath.push(item);
              window._userHasTyped = true;
              if (typeof window._micAddAudioCard === 'function') {
                window._micAddAudioCard(idPath, item.audio_url, 0, storePath.length, item.filename);
              }
              if (typeof toast === 'function') toast('Audio berhasil ditambahkan');
              return;
            }
            var store; try { store = (typeof _micStore !== 'undefined') ? _micStore : window._micStore; } catch (e) { }
            var id = 'lbr-' + Date.now();
            if (store) store.push({ id: id, audio_b64: b64, duration: 0, filename: name });
            window._userHasTyped = true;
            if (typeof window._micAddAudioCard === 'function') {
              window._micAddAudioCard(id, b64, 0, store ? store.length : 1, name);
              if (typeof toast === 'function') toast('Audio berhasil ditambahkan');
              return;
            }
            if (typeof window.kronologiImportAudio === 'function') {
              try {
                var parts = b64.split(','), mime = (parts[0].match(/data:([^;]+);/) || ['', 'audio/mpeg'])[1];
                var bstr = atob(parts[1]), ab = new ArrayBuffer(bstr.length), ia = new Uint8Array(ab);
                for (var i = 0; i < bstr.length; i++) ia[i] = bstr.charCodeAt(i);
                var file = new File([ab], name, { type: mime }), dt = new DataTransfer();
                dt.items.add(file);
                var fake = document.createElement('input'); fake.type = 'file';
                Object.defineProperty(fake, 'files', { value: dt.files });
                window.kronologiImportAudio(fake); return;
              } catch (e) { }
            }
            var store; try { store = (typeof _micStore !== 'undefined') ? _micStore : window._micStore; } catch (e) { }
            var id = 'lbr-' + Date.now();
            if (store) store.push({ id: id, audio_b64: b64, duration: 0, filename: name });
            var list = document.getElementById('mic-recordings-list');
            if (list) {
              var card = document.createElement('div'); card.id = 'card-' + id;
              card.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid rgba(var(--ac),.15);border-radius:7px;background:rgba(0,0,0,.12)';
              card.innerHTML = '<audio controls src="' + b64 + '" style="flex:1;height:28px;accent-color:var(--gold)"></audio>'
                + '<span style="font-size:11px;color:rgba(var(--tc),.45);white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis">' + name + '</span>'
                + '<button type="button" onclick="window._micDeleteCard(\'' + id + '\')" style="background:none;border:1px solid rgba(220,80,80,.3);border-radius:4px;color:rgba(240,100,100,.7);padding:3px 8px;cursor:pointer;font-size:11px;flex-shrink:0">Hapus</button>';
              list.appendChild(card);
            }
            if (typeof toast === 'function') toast('Audio berhasil ditambahkan ✓');
          });
        };
        lbl.parentNode.replaceChild(btn, lbl);
      }

      /* ══ INIT ══ */
      function _init() {
        _waitAndPatch();
        _patchTTD();
        _patchAddDokRow();
        _patchAudioBtn();
      }

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _init);
      else _init();

    })();

  
