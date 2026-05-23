// LIBERO: Helper alur daftar perkara dan ancaman pidana Litmas Anak.
    /* ══════════════════════════════════════════
       ANCAMAN PIDANA — derive diversi_ancaman_ge7
       Sesuai litmasanak.py _derive_diversi_ancaman_ge7()
       >= 84 bulan (7 tahun) → "Ya", kurang → "Tidak"
    /* ══════════════════════════════════════════ */
    function _deriveAncamanGe7(tahunRaw, bulanRaw) {
      const t = (tahunRaw || '').trim();
      const b = (bulanRaw || '').trim() || '0';
      if (!t || !/^\d+$/.test(t)) return '';
      if (!/^\d+$/.test(b)) return '';
      const totalBulan = (parseInt(t) * 12) + parseInt(b);
      return totalBulan >= 84 ? 'Ya' : 'Tidak';
    }

    /* ══════════════════════════════════════════════════
       MULTI-PERKARA: state, render, collect, restore
    ══════════════════════════════════════════════════ */
    window._perkaraList = [{ perkara: '', pasal: '' }];

    function _resizePerkaraTextarea(ta) {
      if (!ta) return;
      ta.style.height = 'auto';
      const next = ta.scrollHeight + 'px';
      ta.style.height = next;
      ta.dataset.autoHeight = next;
    }

    function _scheduleResizePerkaraTextarea(ta) {
      if (!ta || ta.dataset.resizePending === '1') return;
      ta.dataset.resizePending = '1';
      requestAnimationFrame(function () {
        ta.dataset.resizePending = '0';
        _resizePerkaraTextarea(ta);
      });
    }

    function _renderPerkaraList() {
      const wrap = document.getElementById('perkara-list-wrap');
      if (!wrap) return;
      wrap.innerHTML = '';

      const list = window._perkaraList;
      const multi = list.length > 1;

      list.forEach(function (item, idx) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;flex-direction:column;gap:4px;position:relative;' + (multi ? 'padding:8px 10px;border:1px solid rgba(var(--tc),.18);border-radius:8px;' : '');

        if (multi) {
          const badge = document.createElement('div');
          badge.style.cssText = 'font-size:11px;font-weight:600;opacity:.55;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px';
          badge.textContent = 'Perkara ' + (idx + 1);
          row.appendChild(badge);
        }

        // Perkara input
        const pinp = document.createElement('textarea');
        pinp.className = 'finp';
        pinp.rows = 1;
        pinp.spellcheck = false;
        pinp.placeholder = 'Nama perkara, contoh: Pencurian';
        pinp.value = item.perkara || '';
        pinp.style.cssText = 'resize:none;overflow:hidden;line-height:1.45;box-sizing:border-box;min-height:42px;white-space:pre-wrap;word-break:break-word;max-width:100%!important;';
        pinp.dataset.idx = idx;
        pinp.dataset.field = 'perkara';
        pinp.addEventListener('input', function() { _scheduleResizePerkaraTextarea(this); _onPerkaraFieldChange.call(this, {target:this}); });
        row.appendChild(pinp);

        // Pasal input
        const pasinp = document.createElement('textarea');
        pasinp.className = 'finp';
        pasinp.rows = 1;
        pasinp.spellcheck = false;
        pasinp.placeholder = 'Pasal yang dilanggar, contoh: Pasal 362 KUHP';
        pasinp.value = item.pasal || '';
        pasinp.style.cssText = 'resize:none;overflow:hidden;line-height:1.45;box-sizing:border-box;min-height:42px;white-space:pre-wrap;word-break:break-word;max-width:100%!important;';
        pasinp.dataset.idx = idx;
        pasinp.dataset.field = 'pasal';
        pasinp.addEventListener('input', function() { _scheduleResizePerkaraTextarea(this); _onPerkaraFieldChange.call(this, {target:this}); });
        row.appendChild(pasinp);

        // Hapus button (only if >1)
        if (multi) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = '✕ Hapus Perkara Ini';
          btn.style.cssText = 'align-self:flex-end;margin-top:2px;padding:4px 10px;border:1px solid rgba(var(--tc),.3);border-radius:6px;background:transparent;color:rgba(var(--tc),.7);font-size:12px;cursor:pointer';
          btn.dataset.idx = idx;
          btn.addEventListener('click', function () {
            window._perkaraList.splice(parseInt(this.dataset.idx), 1);
            _renderPerkaraList();
          });
          row.appendChild(btn);
        }

        wrap.appendChild(row);
      });

      // Tambah Perkara button
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.textContent = '+ Tambah Perkara';
      addBtn.style.cssText = 'align-self:flex-start;padding:6px 14px;border:1px dashed rgba(var(--tc),.35);border-radius:8px;background:transparent;color:rgba(var(--tc),.7);font-size:13px;cursor:pointer;margin-top:2px';
      addBtn.addEventListener('click', function () {
        window._perkaraList.push({ perkara: '', pasal: '' });
        _renderPerkaraList();
      });
      wrap.appendChild(addBtn);

      // Trigger initial resize
      setTimeout(() => {
        wrap.querySelectorAll('textarea').forEach(ta => {
          _resizePerkaraTextarea(ta);
        });
      }, 50);
    }

    function _onPerkaraFieldChange(e) {
      const idx = parseInt(e.target.dataset.idx);
      const field = e.target.dataset.field;
      if (window._perkaraList[idx] !== undefined) {
        window._perkaraList[idx][field] = e.target.value;
      }
    }

    function _collectPerkaraList() {
      // Read directly from DOM inputs to ensure latest values are captured
      var wrap = document.getElementById('perkara-list-wrap');
      if (wrap) {
        var allInputs = wrap.querySelectorAll('input[data-field], textarea[data-field]');
        if (allInputs.length > 0) {
          var byIdx = {};
          allInputs.forEach(function (inp) {
            var idx = inp.dataset.idx;
            var field = inp.dataset.field;
            if (!byIdx[idx]) byIdx[idx] = {};
            byIdx[idx][field] = (inp.value || '').trim();
          });
          var indices = Object.keys(byIdx).sort(function (a, b) { return parseInt(a) - parseInt(b); });
          var result = [];
          indices.forEach(function (idx) {
            var p = byIdx[idx].perkara || '';
            var s = byIdx[idx].pasal || '';
            if (result.length === 0 || p || s) {
              result.push({ perkara: p, pasal: s });
            }
          });
          if (result.length > 0) {
            // Sync back to in-memory state
            window._perkaraList = result;
            return result;
          }
        }
      }
      // Fallback to in-memory list
      return window._perkaraList.map(function (it) {
        return { perkara: (it.perkara || '').trim(), pasal: (it.pasal || '').trim() };
      }).filter(function (it, idx) { return idx === 0 || it.perkara || it.pasal; });
    }

    function _restorePerkaraList(data) {
      // data.perkara_list = [{perkara, pasal}, ...]
      // Fallback: data.perkara / data.pasal (legacy)
      if (Array.isArray(data.perkara_list) && data.perkara_list.length > 0) {
        window._perkaraList = data.perkara_list.map(function (it) {
          return { perkara: it.perkara || '', pasal: it.pasal || '' };
        });
      } else if (data.perkara || data.pasal) {
        window._perkaraList = [{ perkara: data.perkara || '', pasal: data.pasal || '' }];
      } else {
        window._perkaraList = [{ perkara: '', pasal: '' }];
      }
      _renderPerkaraList();
    }

    // Init on DOM ready
    (function () {
      function _initPerkara() {
        _renderPerkaraList();
      }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _initPerkara);
      } else {
        _initPerkara();
      }
    })();

    /* ────────────────────────────────────────────────── */

    function _syncAncamanPidana() {
      const tahun = (document.getElementById('f-ancaman-pidana-tahun')?.value || '').trim();
      const bulan = (document.getElementById('f-ancaman-pidana-bulan')?.value || '').trim();
      const result = _deriveAncamanGe7(tahun, bulan);
      const badge = document.getElementById('f-ancaman-ge7-badge');
      if (badge) {
        badge.textContent = result ? ('≥ 7 tahun: ' + result) : '—';
        badge.className = 'finp-derived' + (result === 'Ya' ? ' derived-ya' : (result === 'Tidak' ? ' derived-tidak' : ''));
      }
      // simpan ke hidden field supaya collectTab2 bisa ambil
      const hidden = document.getElementById('f-diversi-ancaman-ge7');
      if (hidden) hidden.value = result;
    }

    /* ── _loadAllFromData: dipanggil dari Python via evaluate_js ── */
    window._loadAllFromData = function (data) {
      if (!data || typeof data !== 'object') return;
      for (let i = 0; i <= 13; i++) {
        const fn = window['loadTab' + i];
        if (typeof fn === 'function') try { fn(data); } catch (e) { console.warn('[loadTab' + i + ']', e); }
      }
      if (typeof updateLitmasInfo === 'function') updateLitmasInfo();
      if (typeof updateProgress === 'function') updateProgress();
    };
  
