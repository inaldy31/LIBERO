// LIBERO: State UI inti Data Manager dan perilaku modal.
(function () {
      var _ctx = null;
      var _sel = null;
      var _entries = [];
      var _curPath = '';
      var _ddOpen = null;
      var _navHistory = [];   // history path untuk back/forward
      var _navIdx = -1;   // posisi saat ini dalam _navHistory
      var _dmListScrollBound = false;
      var _dmListRaf = 0;
      var _DM_VIRTUAL_MIN = 160;
      var _DM_ROW_H = 34;
      var _DM_ROW_BUFFER = 10;

      /* ════════════════════════════════════════
         BUKA POPUP
      ════════════════════════════════════════ */
      window.openDMPopup = function (ctx) {
        _ctx = ctx; _sel = null; _curPath = ctx.folder || '';
        var mode = ctx.mode || 'browse';
        var modul = ctx.modul || '';
        var mLbl = modul === 'litmasanak' ? 'Litmas Anak' : 'Litmas Integrasi';
        var titles = { save: 'Simpan Data', load: 'Lanjutkan Data', output: 'Buat Dokumen' };

        document.getElementById('dm-t-title').textContent = (titles[mode] || 'Data Manager') + ' · ' + mLbl;

        var lblEl = document.getElementById('dm-t-lbl');
        var inpEl = document.getElementById('dm-t-inp');
        if (mode === 'save' || mode === 'output') {
          lblEl.style.display = ''; inpEl.style.display = '';
          inpEl.value = ctx.suggested_name || '';
          inpEl.placeholder = mode === 'output' ? 'Nama file DOCX...' : 'Nama file...';
        } else { lblEl.style.display = 'none'; inpEl.style.display = 'none'; }

        var mainBtn = document.getElementById('dm-btn-main');
        var mainLbl = document.getElementById('dm-btn-lbl');
        var mainIco = document.getElementById('dm-btn-ico');
        if (mode === 'output') {
          mainBtn.className = 'dm-btn green';
          mainLbl.textContent = 'Buat Dokumen';
          mainIco.innerHTML = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>';
        } else if (mode === 'load') {
          mainBtn.className = 'dm-btn primary';
          mainLbl.textContent = 'Buka & Lanjutkan';
          mainIco.innerHTML = '<circle cx="12" cy="12" r="10"/><polyline points="12 8 16 12 12 16"/><line x1="8" y1="12" x2="16" y2="12"/>';
        } else {
          mainBtn.className = 'dm-btn primary';
          mainLbl.textContent = 'Simpan';
          mainIco.innerHTML = '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>';
        }
        mainBtn.disabled = (mode === 'load');
        document.getElementById('dm-btn-del').disabled = true;

        _entries = (ctx.files || []).map(function (f) { return Object.assign({ is_dir: false }, f); });
        _navHistory = _curPath ? [_curPath] : [];
        _navIdx = _navHistory.length - 1;
        _dmUpdateNavBtns();
        _dmRenderBc(_curPath);
        _dmRenderList();
        _dmShowDetail(null);
        document.getElementById('dm-overlay').classList.add('dm-open');
        setTimeout(function () { if (typeof window._dmSidenavInit === 'function') _dmSidenavInit(); }, 0);
        setTimeout(function () {
          var i = document.getElementById('dm-t-inp');
          if (i && i.style.display !== 'none') { i.focus(); i.select(); }
        }, 240);
      };

      /* ════════════════════════════════════════
         TUTUP
      ════════════════════════════════════════ */
      window.closeDMPopup = function () {
        document.getElementById('dm-overlay').classList.remove('dm-open');
        _dmCloseDropdown();
        _sel = null;
      };
      document.getElementById('dm-overlay').addEventListener('click', function (e) {
        if (e.target === this) closeDMPopup();
      });

      /* ════════════════════════════════════════
         BREADCRUMB + DROPDOWN
      ════════════════════════════════════════ */
      function _dmRenderBc(path) {
        var segs = document.getElementById('dm-bc-segs');
        var upBtn = document.getElementById('dm-bc-up');
        if (!path) { segs.innerHTML = ''; upBtn.disabled = true; return; }

        var isWin = /^[A-Za-z]:\\/.test(path);
        var sep = isWin ? '\\' : '/';
        var parts = [];

        if (isWin) {
          var drive = path.slice(0, 3); // "C:\"
          parts.push({ label: path.slice(0, 2) + sep, path: drive });
          var rest = path.slice(3).split('\\').filter(Boolean);
          var acc = drive;
          rest.forEach(function (p) { acc = acc.endsWith(sep) ? acc + p : acc + sep + p; parts.push({ label: p, path: acc }); });
        } else {
          var pieces = path.split('/').filter(Boolean);
          parts.push({ label: '/', path: '/' });
          var acc2 = '/';
          pieces.forEach(function (p) { acc2 = (acc2 === '/' ? '/' + p : acc2 + '/' + p); parts.push({ label: p, path: acc2 }); });
        }

        // Overflow — render semua tapi hide awal yg panjang dgn ellipsis
        var start = Math.max(0, parts.length - 4);
        var html = '';
        if (start > 0) html += '<span class="dm-bc-overflow">…</span>';

        for (var i = start; i < parts.length; i++) {
          var s = parts[i];
          var pE = s.path.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
          var isLast = (i === parts.length - 1);
          if (i > start || (start > 0 && i === start)) {
            html += '<span class="dm-bc-sep">›</span>';
          }
          html += '<span class="dm-bc-seg-wrap" id="dm-bsw-' + i + '">'
            + '<button class="dm-bc-seg" onclick="_dmNavTo(\'' + pE + '\')" title="' + _e(s.path) + '">' + _e(s.label) + '</button>'
            + '<button class="dm-bc-arr" onclick="_dmOpenDropdown(event,\'' + pE + '\',\'dm-bsw-' + i + '\')" title="Pilih folder lain">'
            + '<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>'
            + '</button>'
            + '</span>';
        }

        segs.innerHTML = html;

        // Up button: disabled kalau sudah root
        var atRoot = (isWin && /^[A-Za-z]:\\?$/.test(path)) || (!isWin && path === '/');
        upBtn.disabled = !!atRoot;
      }

      /* ── Buka dropdown siblings ── */
      window._dmOpenDropdown = async function (evt, segPath, wrapId) {
        evt.stopPropagation();
        var dd = document.getElementById('dm-dropdown');

        // Toggle: kalau sudah open untuk path yang sama, tutup
        if (_ddOpen === segPath && dd.classList.contains('dm-dd-open')) {
          _dmCloseDropdown(); return;
        }
        _ddOpen = segPath;

        // Posisi berdasarkan wrapper element
        var wrap = document.getElementById(wrapId);
        if (!wrap) { _dmCloseDropdown(); return; }
        var rect = wrap.getBoundingClientRect();
        dd.style.left = rect.left + 'px';
        dd.style.top = (rect.bottom + 4) + 'px';
        dd.innerHTML = '<div class="dm-dd-loading"><div class="dm-dd-spin"></div></div>';
        dd.classList.add('dm-dd-open');

        try {
          var raw = await window._py('dm_get_siblings', segPath);
          var res = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (!res.ok) { dd.innerHTML = '<div class="dm-dd-empty">Tidak bisa baca folder</div>'; return; }

          var items = res.siblings || [];
          if (!items.length) { dd.innerHTML = '<div class="dm-dd-empty">Tidak ada folder lain</div>'; return; }

          var rows = items.map(function (s) {
            var isCur = (s.path === segPath) || (_normalize(s.path) === _normalize(segPath));
            var pE = s.path.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            return '<div class="dm-dd-item' + (isCur ? ' dm-dd-cur' : '') + '" onclick="_dmPickSibling(\'' + pE + '\')">'
              + '<svg viewBox="0 0 24 24" stroke-width="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
              + '<span title="' + _e(s.path) + '">' + _e(s.name) + '</span>'
              + '</div>';
          });
          dd.innerHTML = rows.join('');
        } catch (ex) {
          dd.innerHTML = '<div class="dm-dd-empty">Error: ' + _e(String(ex)) + '</div>';
        }
      };

      window._dmPickSibling = function (path) {
        _dmCloseDropdown();
        _dmNavTo(path);
      };

      function _dmCloseDropdown() {
        var dd = document.getElementById('dm-dropdown');
        dd.classList.remove('dm-dd-open');
        _ddOpen = null;
      }

      // Tutup dropdown kalau klik di luar
      document.addEventListener('click', function (e) {
        var dd = document.getElementById('dm-dropdown');
        if (!dd || !dd.classList.contains('dm-dd-open')) return;
        if (!dd.contains(e.target)) _dmCloseDropdown();
      });

      /* ════════════════════════════════════════
         NAVIGASI
      ════════════════════════════════════════ */
      window._dmNavUp = function () {
        if (!_curPath) return;
        var isWin = _curPath.includes('\\');
        var sep = isWin ? '\\' : '/';
        // Sudah root?
        if ((isWin && /^[A-Za-z]:\\?$/.test(_curPath)) || (!isWin && _curPath === '/')) {
          // Di root drive Windows → tampilkan daftar drives
          _dmNavTo('__drives__');
          return;
        }
        var parts = _curPath.split(sep).filter(Boolean);
        var parent;
        if (isWin) {
          if (parts.length <= 1) { _dmNavTo(parts[0] + sep); return; }
          parent = parts.slice(0, -1).join(sep);
          if (!parent.includes(sep)) parent += sep; // "C:" → "C:\"
        } else {
          parent = '/' + parts.slice(0, -1).join('/');
          if (!parent) parent = '/';
        }
        _dmNavTo(parent);
      };

      async function _dmNavTo(path, pushHistory) {
        _dmCloseDropdown();
        _dmShowLoading();
        try {
          var raw = await window._py('dm_get_dir_entries', path);
          var res = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (!res.ok) {
            _dmToast('Tidak bisa buka: ' + (res.err || ''));
            _dmRefreshCurrent(); return;
          }
          _curPath = res.path || path;
          _entries = res.entries || [];
          _sel = null;
          window.__dmSel = null;
          window.__dmSelPath = '';
          document.getElementById('dm-btn-del').disabled = true;
          _dmShowDetail(null);
          // Push ke history kalau bukan dari back/fwd
          if (pushHistory !== false) {
            _navHistory = _navHistory.slice(0, _navIdx + 1);
            _navHistory.push(_curPath);
            _navIdx = _navHistory.length - 1;
          }
          _dmUpdateNavBtns();
          _dmRenderBc(_curPath);
          _dmRenderList();
        } catch (e) { _dmToast('Error: ' + e); _dmRefreshCurrent(); }
      }
      // expose untuk breadcrumb button onclick
      window._dmNavTo = _dmNavTo;

      /* ── navigate with fallback paths (for Desktop/OneDrive etc) ── */
      window._dmNavFallback = async function (paths) { for (var i = 0; i < paths.length; i++) { try { var raw = await window._py('dm_get_dir_entries', paths[i]); var res = typeof raw === 'string' ? JSON.parse(raw) : raw; if (res && res.ok) { _dmNavTo(paths[i]); return; } } catch (e) { } } _dmToast('Tidak bisa buka folder. Pastikan folder tersedia.'); };

      function _dmUpdateNavBtns() {
        var backBtn = document.getElementById('dm-bc-back');
        var fwdBtn = document.getElementById('dm-bc-fwd');
        if (backBtn) backBtn.disabled = (_navIdx <= 0);
        if (fwdBtn) fwdBtn.disabled = (_navIdx >= _navHistory.length - 1);
        if (backBtn) backBtn.style.opacity = (_navIdx <= 0) ? '.28' : '';
        if (fwdBtn) fwdBtn.style.opacity = (_navIdx >= _navHistory.length - 1) ? '.28' : '';
      }

      window._dmBack = function () {
        if (_navIdx <= 0) return;
        _navIdx--;
        _dmNavTo(_navHistory[_navIdx], false);
      };
      window._dmForward = function () {
        if (_navIdx >= _navHistory.length - 1) return;
        _navIdx++;
        _dmNavTo(_navHistory[_navIdx], false);
      };

      async function _dmRefreshCurrent() {
        if (!_curPath) return;
        _dmShowLoading();
        try {
          var raw = await window._py('dm_get_dir_entries', _curPath);
          var res = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (res && res.ok) { _entries = res.entries || []; _dmRenderList(); }
        } catch (e) { console.error('[dmRefresh]', e); }
      }

      function _dmShowLoading() {
        document.getElementById('dm-lscroll').innerHTML = '<div class="dm-spin-wrap"><div class="dm-spin"></div></div>';
      }

      /* ════════════════════════════════════════
         RENDER LIST
      ════════════════════════════════════════ */
      function _dmRowHtml(f, i) {
        var isDir = !!f.is_dir;
        var isUp = f.name === '..';
        var sel = (_sel && _sel.path === f.path) ? ' sel' : '';
        var dir = isDir ? ' dm-dir' : '';
        var ico = isUp ? _icoUp() : isDir ? _icoDir() : _icoFile(f.name);
        var dbl = isDir ? 'ondblclick="_dmNavTo(\'' + _e1(f.path) + '\')"' : 'ondblclick="_dblRow(' + i + ')"';
        return '<div class="dm-row' + sel + dir + '" onclick="_clickRow(' + i + ')" ' + dbl + '>'
          + '<div class="dm-rico">' + ico + '</div>'
          + '<div class="dm-rname" title="' + _e(f.name) + '">' + _e(f.name) + '</div>'
          + '<div class="dm-rdate">' + _e(f.modified || '') + '</div>'
          + '</div>';
      }

      function _dmBindListScroll(sc) {
        if (_dmListScrollBound || !sc) return;
        _dmListScrollBound = true;
        sc.addEventListener('scroll', function () {
          if (!_entries || _entries.length < _DM_VIRTUAL_MIN) return;
          if (_dmListRaf) return;
          _dmListRaf = requestAnimationFrame(function () {
            _dmListRaf = 0;
            _dmRenderVirtualList();
          });
        }, { passive: true });
      }

      function _dmRenderVirtualList() {
        var sc = document.getElementById('dm-lscroll');
        if (!sc || !_entries || _entries.length < _DM_VIRTUAL_MIN) return;
        var viewport = sc.clientHeight || 520;
        var start = Math.max(0, Math.floor(sc.scrollTop / _DM_ROW_H) - _DM_ROW_BUFFER);
        var count = Math.ceil(viewport / _DM_ROW_H) + (_DM_ROW_BUFFER * 2);
        var end = Math.min(_entries.length, start + count);
        var html = '<div style="height:' + (start * _DM_ROW_H) + 'px"></div>';
        for (var i = start; i < end; i++) html += _dmRowHtml(_entries[i], i);
        html += '<div style="height:' + ((_entries.length - end) * _DM_ROW_H) + 'px"></div>';
        sc.innerHTML = html;
      }

      function _dmScrollIndexIntoView(i) {
        var sc = document.getElementById('dm-lscroll');
        if (!sc || !_entries || _entries.length < _DM_VIRTUAL_MIN || i < 0) return false;
        var top = i * _DM_ROW_H;
        var bottom = top + _DM_ROW_H;
        if (top < sc.scrollTop) sc.scrollTop = top;
        else if (bottom > sc.scrollTop + sc.clientHeight) sc.scrollTop = Math.max(0, bottom - sc.clientHeight);
        _dmRenderVirtualList();
        return true;
      }

      function _dmRenderList() {
        var sc = document.getElementById('dm-lscroll');
        _dmBindListScroll(sc);
        if (!_entries || !_entries.length) {
          sc.innerHTML = '<div class="dm-empty">'
            + '<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
            + '<div class="dm-empty-t">Folder kosong</div>'
            + '<div style="font-size:11px">Tidak ada file di sini.</div></div>';
          return;
        }
        if (_entries.length >= _DM_VIRTUAL_MIN) {
          _dmRenderVirtualList();
          return;
        }
        sc.innerHTML = _entries.map(_dmRowHtml).join('');
      }

      /* ════════════════════════════════════════
         SELECT
      ════════════════════════════════════════ */
      window._clickRow = function (i) {
        var f = _entries[i]; if (!f) return;
        if (f.is_dir) { _dmNavTo(f.path); return; }
        _sel = f;
        window.__dmSel = f || null;
        window.__dmSelPath = f ? f.path : '';
        var inp = document.getElementById('dm-t-inp');
        if (inp && inp.style.display !== 'none') inp.value = f.name;
        _dmRenderList();
        _dmShowPickPreview(f);
        document.getElementById('dm-btn-del').disabled = false;
        document.getElementById('dm-btn-main').disabled = false;
      };
      window._dblRow = function (i) {
        _clickRow(i);
        var f = _entries[i];
        if (f && !f.is_dir) _dmMainAct();
      };

      /* ════════════════════════════════════════
         DETAIL
      ════════════════════════════════════════ */
      function _dmJenisLitmas(fname) {
        var n = (fname || '').toLowerCase();
        if (n.includes('anak')) return 'Litmas Anak';
        if (n.includes('integrasi')) return 'Litmas Integrasi';
        if (_ctx && _ctx.modul === 'litmasanak') return 'Litmas Anak';
        if (_ctx && _ctx.modul === 'integrasi') return 'Litmas Integrasi';
        return 'Tidak Dikenal';
      }

      function _dmShowDetail(f) {
        var el = document.getElementById('dm-detail');
        if (!f) {
          el.innerHTML = '<div class="dm-dnil">'
            + '<svg viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>'
            + '<div>Pilih file untuk<br>melihat detail</div></div>';
          return;
        }
        var isDocx = f.name.toLowerCase().endsWith('.docx');
        el.innerHTML = '<div class="dm-dfname">' + _e(f.name) + '</div>'
          + _drow('Tipe', isDocx ? 'Dokumen DOCX' : 'Data Pengerjaan')
          + _drow('Tanggal', f.modified || '-')
          + _drow('Ukuran', f.size_str || '-')
          + _drow('Jenis Litmas', isDocx ? '-' : _dmJenisLitmas(f.name))
          + _drow('Lokasi', f.path || '');
      }

      function _dmPathToFileUrl(path) {
        var p = String(path || '').trim();
        if (!p) return '';
        if (/^(file|https?):/i.test(p)) return p;
        p = p.replace(/\\/g, '/');
        if (/^[A-Za-z]:\//.test(p)) {
          return 'file:///' + p.charAt(0) + ':' + p.slice(2).split('/').map(function (part) {
            return encodeURIComponent(part);
          }).join('/');
        }
        if (p.indexOf('//') === 0) {
          return 'file://' + p.slice(2).split('/').map(function (part) {
            return encodeURIComponent(part);
          }).join('/');
        }
        if (p.charAt(0) === '/') {
          return 'file://' + p.split('/').map(function (part, index) {
            return index === 0 ? '' : encodeURIComponent(part);
          }).join('/');
        }
        return p;
      }

      /* ── pick mode: show file preview in right panel ── */
      function _dmShowPickPreview(f) {
        var el = document.getElementById('dm-detail');
        if (!el) return;
        var mode = (_ctx && _ctx.mode) || '';
        if (!f) {
          var nilIco, nilTxt;
          if (mode === 'pick_image') {
            nilIco = '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
            nilTxt = 'Pilih gambar<br>untuk preview';
          } else if (mode === 'pick_audio') {
            nilIco = '<svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
            nilTxt = 'Pilih audio<br>untuk preview';
          } else {
            el.innerHTML = '<div class="dm-dnil"><svg viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg><div>Pilih file untuk<br>melihat detail</div></div>';
            return;
          }
          el.innerHTML = '<div class="dm-preview-nil">' + nilIco + '<span>' + nilTxt + '</span></div>';
          return;
        }

        var ext = (f.name.split('.').pop() || '').toLowerCase();
        var imgExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        var audExts = ['mp3', 'wav', 'm4a', 'ogg', 'opus', 'aac', 'flac'];
        var src = _dmPathToFileUrl(f.path || '');

        if (imgExts.indexOf(ext) > -1) {
          window.__dmPreviewPending = f.path;
          el.innerHTML = '<div class="dm-preview-wrap">'
            + '<img class="dm-preview-img" id="_prev_img" src="' + _e(src) + '" alt="">'
            + '<div class="dm-preview-fname">' + _e(f.name) + '</div>'
            + '</div>';
        } else if (audExts.indexOf(ext) > -1) {
          window.__dmPreviewPending = f.path;
          el.innerHTML = '<div class="dm-preview-wrap">'
            + '<audio class="dm-preview-audio" id="_prev_aud" controls src="' + _e(src) + '" style="width:100%"></audio>'
            + '<div class="dm-preview-fname">' + _e(f.name) + '</div>'
            + '</div>';
        } else {
          _dmShowDetail(f);
        }
      }

      function _drow(l, v) {
        return '<div class="dm-drow"><div class="dm-dlbl">' + l + '</div><div class="dm-dval">' + _e(String(v)) + '</div></div>';
      }

      /* ════════════════════════════════════════
         AKSI UTAMA
      ════════════════════════════════════════ */
      window._dmMainAct = async function () {
        var mode = _ctx ? _ctx.mode : '';
        if (mode === 'save') _doSave();
        else if (mode === 'output') _doGenerate();
        else if (mode === 'load') _doLanjutkan();
      };

      async function _doSave() {
        var inp = document.getElementById('dm-t-inp');
        var name = (inp ? inp.value.trim() : '') || (_ctx && _ctx.suggested_name) || '';
        if (!name) { _dmToast('Masukkan nama file.'); return; }
        var _existing = (_entries || []).find(function (f) { return !f.is_dir && _normalize(f.name) === _normalize(name); });
        if (_existing) {
          var _ok = await LDialog.confirm({ title: 'Timpa File?', message: 'File <b>' + _e(_existing.name) + '</b> sudah ada.<br>Yakin ingin menimpanya?', okText: 'Ya, Timpa', cancelText: 'Batal', type: 'warning' });
          if (!_ok) return;
          try { await window._py('dm_delete_file', _existing.path); } catch (_) { }
        }
        _dmToast('Menyimpan...');
        try {
          var raw = await window._py('dm_do_save_to', _curPath, name);
          var res = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (res && res.ok) {
            closeDMPopup();
            _dmToastSaved(res.name || name);
          } else _dmToast('Gagal: ' + (res && res.err || 'unknown'));
        } catch (e) { _dmToast('Error: ' + e); }
      }

      async function _doGenerate() {
        var inp = document.getElementById('dm-t-inp');
        var name = (inp ? inp.value.trim() : '') || (_ctx && _ctx.suggested_name) || '';
        if (!name) { _dmToast('Masukkan nama file DOCX.'); return; }
        var _existing2 = (_entries || []).find(function (f) { return !f.is_dir && _normalize(f.name) === _normalize(name); });
        if (_existing2) {
          var _ok2 = await LDialog.confirm({ title: 'Timpa Dokumen?', message: 'File <b>' + _e(_existing2.name) + '</b> sudah ada.<br>Yakin ingin menimpanya?', okText: 'Ya, Timpa', cancelText: 'Batal', type: 'warning' });
          if (!_ok2) return;
          try { await window._py('dm_delete_file', _existing2.path); } catch (_) { }
        }
        _dmToast('Membuat dokumen...');
        try {
          var raw = await window._py('dm_do_generate_to', _curPath, name);
          var res = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (res && res.ok) {
            closeDMPopup();
            _dmToastGenerated(res.path || '', res.name || name);
          } else {
            _dmToast('Gagal: ' + (res && res.err || 'unknown'));
          }
        } catch (e) { _dmToast('Error: ' + e); }
      }

      function _dmToastSaved(fileName) {
        if (typeof toastSuccess === 'function') toastSuccess('Tersimpan: ' + fileName);
      }

      function _dmToastGenerated(filePath, fileName) {
        if (typeof toastDoc === 'function') {
          toastDoc({
            msg: 'Berhasil dibuat: ' + String(fileName || ''),
            label: 'DOKUMEN',
            dur: 8000,
            buttons: [
              {
                text: 'Buka Folder', icon: 'folder',
                onClick: function () { try { window._py('reveal_in_explorer', filePath || ''); } catch (_) { } }
              },
              {
                text: 'Buka Dokumen', icon: 'file',
                onClick: function () { try { window._py('open_file', filePath || ''); } catch (_) { } }
              },
            ]
          });
        } else {
          if (typeof toastSuccess === 'function') toastSuccess('Berhasil dibuat: ' + String(fileName || ''));
        }
      }
      function _eT(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
      function _dismissToastEl(el) { try { el.classList.remove('in'); setTimeout(function () { el.remove(); }, 300); } catch (_) { } }
      function _showToastEl(el, dur) {
        /* try to reuse existing _wrap */
        var wrap = document.querySelector('._toast-wrap');
        if (!wrap) {
          wrap = document.createElement('div');
          wrap.className = 'toast-wrap _toast-wrap';
          document.body.appendChild(wrap);
        }
        wrap.style.cssText = 'position:fixed;left:50%;right:auto;top:50%;bottom:auto;width:auto;max-width:calc(100vw - 32px);max-height:calc(100vh - 96px);z-index:2147483600;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:0;box-sizing:border-box;pointer-events:none;overflow:visible;transform:translate(-50%, -50%);';
        /* dismiss existing */
        wrap.querySelectorAll('._toast-item').forEach(function (e) { _dismissToastEl(e); });
        wrap.style.pointerEvents = 'all';
        wrap.appendChild(el);
        requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('in'); }); });
        setTimeout(function () { _dismissToastEl(el); wrap.style.pointerEvents = 'none'; }, dur || 8000);
      }

      async function _doLanjutkan() {
        if (!_sel && window.__dmSel) _sel = window.__dmSel;
        if (!_sel) { _dmToast('Pilih file terlebih dahulu.'); return; }
        var modul = _ctx ? _ctx.modul : ((document.body && document.body.dataset && document.body.dataset.liberoModule) || 'integrasi');
        var myModul = _ctx ? _ctx.modul : modul;
        var mainBtn = document.getElementById('dm-btn-main');
        if (mainBtn) mainBtn.disabled = true;

        // Guard: re-enable tombol kalau Python tidak respond dalam 15 detik
        var _guard = setTimeout(function () {
          if (mainBtn) mainBtn.disabled = false;
          _dmToast('Timeout — coba lagi.');
        }, 15000);

        try {
          window.__dmPendingLoad = null;
          var raw = await window._py('dm_load_file', _sel.path, modul);
          clearTimeout(_guard);
          var res = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (!res || !res.ok) {
            _dmToast('Gagal: ' + (res && res.err || 'unknown'));
            if (mainBtn) mainBtn.disabled = false;
            return;
          }
          // Cek kompatibilitas modul
          var src = res.source_type || '';
          var wrongModul = (myModul === 'litmasanak' && src === 'integrasi') || (myModul === 'integrasi' && src === 'litmasanak');
          if (wrongModul) {
            var modNames = { litmasanak: 'Litmas Anak', integrasi: 'Litmas Integrasi' };
            var lanjut = await LDialog.confirm({ title: 'Peringatan Modul', message: 'File ini adalah data <b>' + (modNames[src] || src) + '</b>,<br>bukan <b>' + (modNames[myModul] || myModul) + '</b>.<br><br>Data mungkin tidak terisi dengan benar.<br>Tetap lanjutkan?', okText: 'Lanjutkan', cancelText: 'Batal', type: 'warning' });
            if (!lanjut) { if (mainBtn) mainBtn.disabled = false; return; }
          }
          // Python inject data via evaluate_js ke window.__dmPendingLoad
          // Poll sampai tersedia (max 2 detik)
          var _data = null;
          for (var _i = 0; _i < 20; _i++) {
            await new Promise(function (r) { setTimeout(r, 100); });
            if (window.__dmPendingLoad) { _data = window.__dmPendingLoad; window.__dmPendingLoad = null; break; }
          }
          if (!_data) { _dmToast('Data tidak tersedia, coba lagi.'); if (mainBtn) mainBtn.disabled = false; return; }
          closeDMPopup();
          setTimeout(function () {
            try { if (typeof onDataLoaded === 'function') onDataLoaded(_data); }
            catch (ex) { console.warn('[_doLanjutkan]', ex); }
          }, 80);
        } catch (e) {
          clearTimeout(_guard);
          _dmToast('Error: ' + e);
          if (mainBtn) mainBtn.disabled = false;
        }
      }

      /* ════════════════════════════════════════
         HAPUS
      ════════════════════════════════════════ */
      window._dmHapus = async function () {
        if (!_sel) return;
        if (!await LDialog.confirm({ title: 'Hapus File?', message: 'Yakin ingin menghapus <b>' + _e(_sel.name) + '</b>?<br>Tindakan ini tidak dapat dibatalkan.', okText: 'Ya, Hapus', cancelText: 'Batal', type: 'danger' })) return;
        try {
          var raw = await window._py('dm_delete_file', _sel.path);
          var res = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (res && res.ok) {
            _dmToast('File dihapus.');
            _sel = null; _dmShowDetail(null);
            document.getElementById('dm-btn-del').disabled = true;
            _dmRefreshCurrent();
          } else _dmToast('Gagal: ' + (res && res.err || ''));
        } catch (e) { _dmToast('Error: ' + e); }
      };

      /* ════════════════════════════════════════
         BUKA DI EXPLORER
      ════════════════════════════════════════ */
      window._dmBukaFolder = async function () {
        try { await window._py('reveal_in_explorer', _curPath || (_ctx && _ctx.folder) || ''); } catch (_) { }
      };

      /* ════════════════════════════════════════
         KEYBOARD
      ════════════════════════════════════════ */
      document.addEventListener('keydown', function (e) {
        var ov = document.getElementById('dm-overlay');
        if (!ov || !ov.classList.contains('dm-open')) return;

        if (e.key === 'Escape') {
          if (document.getElementById('dm-dropdown').classList.contains('dm-dd-open')) {
            _dmCloseDropdown(); return;
          }
          closeDMPopup(); return;
        }
        if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); _dmBack(); return; }
        if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); _dmForward(); return; }
        if (e.key === 'Enter') {
          var inp = document.getElementById('dm-t-inp');
          if (document.activeElement === inp || document.activeElement === document.body) {
            e.preventDefault(); _dmMainAct();
          }
        }
        if (e.key === 'Backspace') {
          if (document.activeElement !== document.getElementById('dm-t-inp')) {
            e.preventDefault(); _dmNavUp();
          }
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          var files = _entries.filter(function (f) { return !f.is_dir; });
          if (!files.length) return;
          var ci = _sel ? files.findIndex(function (f) { return f.path === (_sel && _sel.path); }) : -1;
          ci = e.key === 'ArrowDown' ? Math.min(ci + 1, files.length - 1) : Math.max(ci - 1, 0);
          var gi = _entries.indexOf(files[ci]);
          if (gi >= 0) {
            _dmScrollIndexIntoView(gi);
            _clickRow(gi);
            if (_entries.length < _DM_VIRTUAL_MIN) {
              var rows = document.querySelectorAll('#dm-lscroll .dm-row');
              if (rows[gi]) rows[gi].scrollIntoView({ block: 'nearest' });
            }
          }
        }
      });

      /* ════════════════════════════════════════
         ICONS
      ════════════════════════════════════════ */
      function _icoDir() {
        return '<svg viewBox="0 0 24 24" style="stroke:rgba(var(--ac),.6);fill:rgba(var(--ac),.1);stroke-width:1.8">'
          + '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
      }
      function _icoUp() {
        return '<svg viewBox="0 0 24 24" style="stroke:rgba(var(--tc),.3);fill:none;stroke-width:1.8">'
          + '<path d="M20 20H4V8l4-4h4l2 2h6v14z"/>'
          + '<line x1="12" y1="18" x2="12" y2="11"/>'
          + '<polyline points="9 14 12 11 15 14"/></svg>';
      }
      function _icoFile(name) {
        var c = (name || '').toLowerCase().endsWith('.docx') ? 'rgba(74,196,104,.55)' : 'rgba(var(--ac),.5)';
        return '<svg viewBox="0 0 24 24" style="stroke:' + c + ';fill:none;stroke-width:1.8">'
          + '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>'
          + '<polyline points="13 2 13 9 20 9"/></svg>';
      }

      /* ════════════════════════════════════════
         UTILS
      ════════════════════════════════════════ */
      function _dmToast(msg) {
        var el = document.createElement('div');
        el.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);'
          + 'z-index:9999;padding:9px 18px;border-radius:9px;'
          + 'background:rgba(var(--ac),.18);border:1px solid rgba(var(--ac),.35);'
          + 'color:var(--gold);font-size:12px;font-weight:600;'
          + 'backdrop-filter:blur(12px);pointer-events:none;white-space:nowrap;font-family:inherit;';
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(function () { el.remove(); }, 2800);
      }
      function _e(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
      function _e1(s) { return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
      function _normalize(s) { return String(s || '').toLowerCase().replace(/\\/g, '/').replace(/\/+$/, ''); }

      /* ════════════════════════════════════════
         DM SIDENAV — folder tree (event delegation, no inline onclick)
      ════════════════════════════════════════ */
      (function () {
        var _snCnt = 0;
        var _snByKey = {};
        var _snPaths = {};
        var _snExp = {};
        var _snLoaded = {};

        function _id() { return 'snn' + (++_snCnt); }
        function _norm(p) { return String(p || '').toLowerCase().replace(/\\/g, '/').replace(/\/+$/, ''); }
        function _esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

        /* ── extract user home from any path (Windows: C:\Users\name) ── */
        function _userHome(path) {
          if (!path) return '';
          var m = path.match(/^([A-Za-z]:[\\\/]Users[\\\/][^\\\/]+)/i);
          if (m) return m[1];
          /* fallback: go 3 levels deep from drive */
          var isW = /^[A-Za-z]:[\\\/]/.test(path);
          if (isW) {
            var parts = path.replace(/\\/g, '/').split('/').filter(Boolean);
            if (parts.length >= 3) return parts[0].replace('/', '') + '\\' + parts[1] + '\\' + parts[2];
          }
          return '';
        }

        /* ── event delegation ── */
        document.addEventListener('click', function (e) {
          var sc = document.getElementById('dm-sn-scroll');
          if (!sc || !sc.contains(e.target)) return;
          var pin = e.target.closest('.dm-sn-pin[data-snpath], .dm-sn-pin[data-snpaths]');
          if (pin) {
            if (pin.dataset.snpaths) {
              var fps = pin.dataset.snpaths.split('|').map(function (p) { return p.replace(/&#92;/g, '\\'); });
              window._dmNavFallback(fps); return;
            }
            _dmNavTo(pin.dataset.snpath); return;
          }
          var arr = e.target.closest('.dm-tn-arrow[data-snid]');
          if (arr) { e.stopPropagation(); _snToggle(arr.dataset.snid); return; }
          var row = e.target.closest('.dm-tn-row[data-snpath]');
          if (row && !e.target.closest('.dm-tn-arrow')) { _dmNavTo(row.dataset.snpath); return; }
        });

        /* ── build folder icon ── */
        function _icoF(color) {
          color = color || 'rgba(var(--ac),.55)';
          return '<svg viewBox="0 0 24 24" style="width:14px;height:14px;flex-shrink:0;vertical-align:middle;stroke:' + color + ';fill:rgba(var(--ac),.08);stroke-width:1.8">'
            + '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
        }
        function _icoH() {
          return '<svg viewBox="0 0 24 24" style="width:14px;height:14px;flex-shrink:0;vertical-align:middle;stroke:rgba(var(--ac),.55);fill:rgba(var(--ac),.08);stroke-width:1.8">'
            + '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'
            + '<polyline points="9 22 9 12 15 12 15 22"/></svg>';
        }
        function _icoPic() {
          return '<svg viewBox="0 0 24 24" style="width:14px;height:14px;flex-shrink:0;vertical-align:middle;stroke:rgba(var(--ac),.55);fill:none;stroke-width:1.8">'
            + '<rect x="3" y="3" width="18" height="18" rx="2"/>'
            + '<circle cx="8.5" cy="8.5" r="1.5"/>'
            + '<polyline points="21 15 16 10 5 21"/></svg>';
        }
        function _icoMus() {
          return '<svg viewBox="0 0 24 24" style="width:14px;height:14px;flex-shrink:0;vertical-align:middle;stroke:rgba(var(--ac),.55);fill:none;stroke-width:1.8">'
            + '<path d="M9 18V5l12-2v13"/>'
            + '<circle cx="6" cy="18" r="3"/>'
            + '<circle cx="18" cy="16" r="3"/></svg>';
        }
        function _icoDrv() {
          return '<svg viewBox="0 0 24 24" style="width:14px;height:14px;flex-shrink:0;vertical-align:middle;stroke:rgba(var(--ac),.6);fill:rgba(var(--ac),.08);stroke-width:1.8">'
            + '<ellipse cx="12" cy="5" rx="9" ry="3"/>'
            + '<path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>'
            + '<path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>';
        }

        function _icoDesk() {
          return '<svg viewBox="0 0 24 24" style="width:14px;height:14px;flex-shrink:0;vertical-align:middle;stroke:rgba(var(--ac),.55);fill:none;stroke-width:1.8">'
            + '<rect x="2" y="3" width="20" height="14" rx="2"/>'
            + '<line x1="8" y1="21" x2="16" y2="21"/>'
            + '<line x1="12" y1="17" x2="12" y2="21"/></svg>';
        }

        /* ── pin builder ── */
        function _pin(path, label, icoHtml) {
          if (!path) return '';
          var p = _esc(path);
          return '<div class="dm-sn-pin" data-snpath="' + p + '" title="' + p + '">'
            + icoHtml + '<span>' + _esc(label) + '</span></div>';
        }

        /* ── tree node builder ── */
        function _snBuildNode(path, name, depth, isDrive) {
          var id = _id();
          var key = _norm(path);
          _snByKey[key] = id;
          _snPaths[id] = path;
          var pEsc = _esc(path);
          var nEsc = _esc(name);
          var ind = depth * 14;
          var ico = isDrive ? _icoDrv() : _icoF();
          return '<div class="dm-tn" data-snid="' + id + '">'
            + '<div class="dm-tn-row" data-snpath="' + pEsc + '" title="' + pEsc + '">'
            + '<span style="width:' + ind + 'px;min-width:' + ind + 'px;flex-shrink:0"></span>'
            + '<span class="dm-tn-arrow" data-snid="' + id + '">'
            + '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>'
            + '</span>'
            + '<span class="dm-tn-ico">' + ico + '</span>'
            + '<span class="dm-tn-name">' + nEsc + '</span>'
            + '</div>'
            + '<div class="dm-tn-ch" id="snch_' + id + '" hidden data-depth="' + (depth + 1) + '"></div>'
            + '</div>';
        }

        /* ── toggle ── */
        async function _snToggle(id) {
          var ch = document.getElementById('snch_' + id);
          var arr = document.querySelector('.dm-tn-arrow[data-snid="' + id + '"]');
          if (!ch || !arr) return;
          if (_snExp[id]) {
            _snExp[id] = false; ch.hidden = true; arr.classList.remove('sn-open');
          } else {
            _snExp[id] = true; ch.hidden = false; arr.classList.add('sn-open');
            if (!_snLoaded[id]) {
              var path = _snPaths[id]; if (!path) return;
              arr.innerHTML = '<div class="dm-tn-spin"></div>';
              var dep = parseInt(ch.dataset.depth || 1);
              await _snFillChildren(path, id, dep);
              _snLoaded[id] = true;
              arr.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>';
              arr.classList.add('sn-open');
            }
          }
        }

        /* ── fill children ── */
        async function _snFillChildren(parentPath, parentId, depth) {
          var ch = document.getElementById('snch_' + parentId);
          if (!ch) return;
          try {
            var raw = await window._py('dm_get_dir_entries', parentPath);
            var res = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (!res || !res.ok) { ch.innerHTML = ''; _markLeaf(parentId); return; }
            var dirs = (res.entries || []).filter(function (e) { return e.is_dir && e.name !== '..'; });
            if (!dirs.length) { ch.innerHTML = ''; _markLeaf(parentId); return; }
            ch.innerHTML = dirs.map(function (e) { return _snBuildNode(e.path, e.name, depth, false); }).join('');
            _snHighlight(_curPath);
          } catch (ex) { ch.innerHTML = ''; }
        }

        function _markLeaf(id) {
          var arr = document.querySelector('.dm-tn-arrow[data-snid="' + id + '"]');
          if (arr) { arr.style.opacity = '0'; arr.style.pointerEvents = 'none'; }
        }

        /* ── highlight active path ── */
        function _snHighlight(path) {
          document.querySelectorAll('#dm-sn-scroll .dm-tn-row.sn-active, #dm-sn-scroll .dm-sn-pin.sn-active')
            .forEach(function (r) { r.classList.remove('sn-active'); });
          var key = _norm(path);
          /* tree node */
          var id = _snByKey[key];
          if (id) {
            var row = document.querySelector('[data-snid="' + id + '"] .dm-tn-row');
            if (row) { row.classList.add('sn-active'); row.scrollIntoView && row.scrollIntoView({ block: 'nearest' }); }
          }
          /* pins */
          document.querySelectorAll('#dm-sn-scroll .dm-sn-pin[data-snpath]').forEach(function (p) {
            if (_norm(p.dataset.snpath) === key) p.classList.add('sn-active');
          });
        }

        /* ── expand ancestors ── */
        async function _snExpandTo(targetPath) {
          var anc = _snAncestors(targetPath);
          for (var i = 0; i < anc.length; i++) {
            var ap = anc[i];
            var id = _snByKey[_norm(ap)];
            if (!id) continue;
            var ch = document.getElementById('snch_' + id);
            var arr = document.querySelector('.dm-tn-arrow[data-snid="' + id + '"]');
            if (!ch || !arr) continue;
            if (!_snExp[id]) {
              _snExp[id] = true; ch.hidden = false; arr.classList.add('sn-open');
            }
            if (!_snLoaded[id]) {
              arr.innerHTML = '<div class="dm-tn-spin"></div>';
              var dep = parseInt(ch.dataset.depth || 1);
              await _snFillChildren(ap, id, dep);
              _snLoaded[id] = true;
              arr.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>';
              arr.classList.add('sn-open');
            }
          }
        }

        function _snAncestors(path) {
          var anc = [];
          var isWin = /^[A-Za-z]:[\\\/]/.test(path);
          if (isWin) {
            var norm = path.replace(/\//g, '\\');
            var parts = norm.split('\\').filter(Boolean);
            var acc = parts[0] + '\\';
            anc.push(acc);
            for (var i = 1; i < parts.length - 1; i++) {
              acc = acc + parts[i] + '\\';
              anc.push(acc);
            }
          } else {
            var pieces = path.split('/').filter(Boolean);
            var a = '/'; anc.push('/');
            for (var j = 0; j < pieces.length - 1; j++) {
              a = (a === '/' ? '/' + pieces[j] : a + '/' + pieces[j]);
              anc.push(a);
            }
          }
          return anc;
        }

        /* ── PUBLIC: init sidenav ── */
        window._dmSidenavInit = async function () {
          var scroll = document.getElementById('dm-sn-scroll');
          if (!scroll) return;
          _snCnt = 0; _snByKey = {}; _snPaths = {}; _snExp = {}; _snLoaded = {};

          var mode = _ctx ? _ctx.mode : '';
          var folder = (_ctx && _ctx.folder) || '';
          var home = _userHome(folder);
          var isPick = (mode === 'pick_image' || mode === 'pick_audio');
          var isWin = /^[A-Za-z]:[\\\/]/.test(folder || _curPath || '');

          /* ── PINTASAN section ── */
          var html = '<div class="dm-sn-sect">Pintasan</div>';

          /* home pin */
          if (home) html += _pin(home, 'Home', _icoH());

          /* Desktop — semua mode (dengan fallback OneDrive) */
          if (home) {
            var sep = isWin ? '\\' : '/';
            var dskPath = home + sep + 'Desktop';
            var dskFb = home + sep + 'OneDrive' + sep + 'Desktop';
            html += '<div class="dm-sn-pin" data-snpaths="' + _esc(dskPath) + '|' + _esc(dskFb) + '" title="Desktop">' + _icoDesk() + '<span>Desktop</span></div>';
          }

          /* module data folder pin (hanya untuk save/load/output) */
          if (folder && !isPick) {
            var fn = (folder.replace(/\\/g, '/').replace(/\/+$/, '').split('/').pop()) || 'Data';
            html += _pin(folder, fn, _icoF());
          }

          /* pick-mode default folder pins */
          if (isPick && home) {
            var sep2 = isWin ? '\\' : '/';
            if (mode === 'pick_image') {
              var picPath = home + sep2 + 'Pictures';
              var picFb = home + sep2 + 'OneDrive' + sep2 + 'Pictures';
              html += '<div class="dm-sn-pin" data-snpaths="' + _esc(picPath) + '|' + _esc(picFb) + '" title="Gambar (Pictures)">' + _icoPic() + '<span>Gambar (Pictures)</span></div>';
            } else {
              var musPath = home + sep2 + 'Music';
              var musFb = home + sep2 + 'OneDrive' + sep2 + 'Music';
              html += '<div class="dm-sn-pin" data-snpaths="' + _esc(musPath) + '|' + _esc(musFb) + '" title="Musik (Music)">' + _icoMus() + '<span>Musik (Music)</span></div>';
              var vidPath = home + sep2 + 'Videos';
              var vidFb = home + sep2 + 'OneDrive' + sep2 + 'Videos';
              html += '<div class="dm-sn-pin" data-snpaths="' + _esc(vidPath) + '|' + _esc(vidFb) + '" title="Video">' + _icoF() + '<span>Video</span></div>';
            }
          }

          html += '<div class="dm-sn-div"></div>';
          html += '<div class="dm-sn-sect">Komputer</div>';
          html += '<div id="dm-sn-root"></div>';
          scroll.innerHTML = html;

          /* ── Load drives / root ── */
          var rootCont = document.getElementById('dm-sn-root');
          var drivesLoaded = false;
          try {
            var raw = await window._py('dm_get_dir_entries', '__drives__');
            var res = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (res && res.ok) {
              var drives = (res.entries || []).filter(function (e) { return e.is_dir && e.name !== '..'; });
              if (drives.length && rootCont) {
                rootCont.innerHTML = drives.map(function (e) { return _snBuildNode(e.path, e.name, 0, true); }).join('');
                drivesLoaded = true;
              }
            }
          } catch (_) { }

          /* fallback: current drive as single root */
          if (!drivesLoaded && rootCont) {
            var fb = _curPath || folder || '';
            if (fb) {
              var isW = /^[A-Za-z]:[\\\/]/.test(fb);
              var rootP = isW ? fb.slice(0, 3).replace('/', '\\') : '/';
              var rootLbl = isW ? fb.slice(0, 2) + ':' : 'Sistem';
              rootCont.innerHTML = _snBuildNode(rootP, rootLbl, 0, true);
            }
          }

          /* ── Expand to current path & highlight ── */
          var navPath = _curPath || folder || '';
          if (navPath && navPath !== '__drives__') {
            await _snExpandTo(navPath);
          }
          _snHighlight(navPath);

          /* ── For pick modes: navigate to sensible default if current folder looks wrong ── */
          if (isPick && home) {
            var sep2 = isWin ? '\\' : '/';
            var defPath = mode === 'pick_image' ? home + sep2 + 'Pictures' : home + sep2 + 'Music';
            /* only auto-nav if not already in a user-like path */
            var curNorm = _norm(_curPath || '');
            var homeNorm = _norm(home);
            if (curNorm.indexOf(homeNorm) < 0) {
              try { await _dmNavTo(defPath); } catch (_) { }
            }
          }
        };

        /* ── hook nav highlight ── */
        var _origRenderBc = _dmRenderBc;
        _dmRenderBc = function (path) {
          _origRenderBc(path);
          try { _snHighlight(path); } catch (_) { }
        };

      })(); /* end sidenav IIFE */

    })();

