// LIBERO: UI modal pencarian perkara dan pemanggilan penghubung launcher.
/* LIBERO: Logic modal pencarian perkara Integrasi yang dipisahkan dari views/integrasi.html. */
/* ══════════════════════════════════════════
       MODAL PENCARIAN PERKARA
    ══════════════════════════════════════════ */

    let _sippPnKode = '';
    let _sippSearchSeq = 0;

    function _parseSippNomorText(text) {
      const raw = String(text || '').trim();
      const matchPN = raw.match(/\/PN[.\s]+([A-Za-z.]+)/i);
      const keyword = raw.replace(/\/PN[.\s]+[A-Za-z.]+.*/i, '').trim();
      return { raw, matchPN, keyword };
    }

    function _parseSippFromPutusan() {
      const raw = (document.getElementById('f-putusan') || {}).value || '';
      return _parseSippNomorText(raw);
    }

    async function openSippModal() {
      try {
        if (typeof window.__LIBERO_LAZY_PREPARE_ALL === 'function') {
          await window.__LIBERO_LAZY_PREPARE_ALL(120000);
        } else if (typeof window.__LIBERO_LAZY_MOUNT_ALL === 'function') {
          window.__LIBERO_LAZY_MOUNT_ALL();
        }
      } catch (_e) { }
      const { raw, matchPN, keyword } = _parseSippFromPutusan();
      const detectedEl = document.getElementById('sipp-pn-detected');
      const kwEl = document.getElementById('sipp-keyword');
      const resultsEl = document.getElementById('sipp-results');

      // Reset
      resultsEl.innerHTML = '';
      document.getElementById('sipp-loading').style.display = 'none';

      kwEl.value = raw || '';

      if (!matchPN) {
        detectedEl.innerHTML = raw
          ? '<strong>&#9888; Format tidak dikenali.</strong> Gunakan format: <code>123/Pid.B/2024/PN Jmb</code>'
          : '<strong>&#9888; Nomor putusan belum ada.</strong> Ketik nomor lengkap di kata kunci pencarian, contoh: <code>123/Pid.Sus/2024/PN Jmb</code>.';
        _sippPnDomain = '';
        _sippPnKode = '';
      } else {
        const kode = matchPN[1].replace(/\.$/, '').toLowerCase();
        _sippPnKode = kode;
        detectedEl.innerHTML =
          '&#128270; STOPPER mendeteksi PN: <strong>' + kode.toUpperCase() + '</strong>. '
          + 'Klik <strong>Cari</strong> untuk memulai penelusuran.';
      }

      document.getElementById('sipp-modal-backdrop').classList.add('open');
    }

    function updateSippDetectionFromKeyword() {
      const detectedEl = document.getElementById('sipp-pn-detected');
      const kwEl = document.getElementById('sipp-keyword');
      if (!detectedEl || !kwEl) return;
      const parsed = _parseSippNomorText(kwEl.value || '');
      if (!parsed.raw) return;
      if (parsed.matchPN) {
        const kode = parsed.matchPN[1].replace(/\.$/, '').toLowerCase();
        _sippPnKode = kode;
        detectedEl.innerHTML =
          '&#128270; STOPPER mendeteksi PN dari keyword: <strong>' + kode.toUpperCase() + '</strong>. '
          + 'Klik <strong>Cari</strong> untuk memulai penelusuran.';
      } else if (!_sippPnKode) {
        detectedEl.innerHTML =
          '<strong>&#9888; Kode PN belum terbaca.</strong> Gunakan nomor lengkap, contoh: <code>123/Pid.Sus/2024/PN Jmb</code>.';
      }
    }

    function closeSippModal() {
      window._SFX && window._SFX.close();
      document.getElementById('sipp-modal-backdrop').classList.remove('open');
      const errBanner = document.getElementById('sipp-error-banner');
      if (errBanner) errBanner.style.display = 'none';
    }

    function showSippError(msg) {
      const banner = document.getElementById('sipp-error-banner');
      if (!banner) return;
      banner.textContent = msg;
      banner.style.display = 'block';
    }

    function cleanStopperError(msg) {
      var raw = String(msg || '').trim();
      if (!raw) return 'Gagal mengambil data.';
      var low = raw.toLowerCase();
      if (
        low.indexOf('stacktrace:') >= 0 ||
        low.indexOf('msedgedriver') >= 0 ||
        low.indexOf('chromedriver') >= 0 ||
        low.indexOf('webdriver') >= 0 ||
        low.indexOf('selenium') >= 0 ||
        low.indexOf('session info:') >= 0 ||
        low.indexOf('net::') >= 0 ||
        low.indexOf('unknown error:') >= 0
      ) {
        if (low.indexOf('err_connection_timed_out') >= 0 || low.indexOf('timed out') >= 0) {
          return 'Pencarian perkara belum bisa diakses. Coba lagi nanti.';
        }
        return 'Browser otomatis gagal membuka pencarian perkara. Coba ulangi nanti.';
      }
      return raw.split(/\r?\n/)[0].slice(0, 220);
    }

    function withSippTimeout(promise, timeoutMs, fallback) {
      var settled = false;
      return new Promise(function (resolve) {
        var timer = setTimeout(function () {
          if (settled) return;
          settled = true;
          resolve(fallback);
        }, timeoutMs);
        Promise.resolve(promise).then(function (value) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(value);
        }).catch(function (err) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve({ ok: false, err: String(err || 'Gagal melakukan penelusuran.') });
        });
      });
    }

    async function doSearchSipp() {
      const kwEl = document.getElementById('sipp-keyword');
      const rawKw = (kwEl.value || '').trim();
      const parsedKw = _parseSippNomorText(rawKw);
      if (parsedKw.matchPN) {
        _sippPnKode = parsedKw.matchPN[1].replace(/\.$/, '').toLowerCase();
        fillNomorPutusanText(rawKw);
      }
      const kw = parsedKw.keyword || rawKw;
      if (!kw) return;
      const okSearch = typeof LDialog !== 'undefined'
        ? await LDialog.confirm(
          'STOPPER akan menelusuri data perkara secara otomatis.\n\n' +
          'Kata kunci: ' + _esc(kw) + '\n\n' +
          'Pastikan perangkat terhubung ke internet. Lanjutkan?'
        )
        : confirm('STOPPER akan menelusuri data perkara. Lanjutkan?');
      if (!okSearch) return;

      const btn = document.getElementById('btn-sipp-cari');
      const loadingEl = document.getElementById('sipp-loading');
      const resultsEl = document.getElementById('sipp-results');
      const searchSeq = ++_sippSearchSeq;

      btn.disabled = true;
      loadingEl.style.display = 'flex';
      resultsEl.innerHTML = '';
      if (window.LStopperLoading) {
        window.LStopperLoading.show({
          title: 'STOPPER AI',
          message: 'Menelusuri data perkara...',
          detail: kw,
          steps: ['Menelusuri data perkara...', 'Mencocokkan nomor putusan...', 'Membaca daftar hasil perkara...', 'Menyiapkan pilihan perkara...']
        });
      }

      const domain = ''; // Domain ditentukan oleh backend lewat kodePN
      const kodePN = _sippPnKode || '';
      const namaKlien = (document.getElementById('f-nama-klien') || {}).value || '';
      const kwEnc = encodeURIComponent(kw);

      const searchPromise = (window.pywebview && window.pywebview.api
        ? window.pywebview.api.search_perkara_sipp(kw, domain, namaKlien, kodePN)
        : Promise.resolve({ ok: false, err: 'pywebview tidak tersedia' })
      );
      const isPnJambi = (kodePN || '').toLowerCase() === 'jmb';
      const sippTimeoutMs = isPnJambi ? 45000 : 120000;
      const timeoutFallback = {
        ok: false,
        err: 'Pencarian perkara belum bisa diakses. Coba lagi nanti.'
      };

      withSippTimeout(searchPromise, sippTimeoutMs, timeoutFallback).then(function (res) {
        if (searchSeq !== _sippSearchSeq) return;
        btn.disabled = false;
        loadingEl.style.display = 'none';
        if (window.LStopperLoading) window.LStopperLoading.hide();

        if (!res || !res.ok) {
          resultsEl.innerHTML = '<div class="sipp-no-result">&#9888; ' +
            cleanStopperError(res && res.err ? res.err : 'Gagal melakukan penelusuran.') + '</div>';
          return;
        }

        renderSippResults(res);
      }).catch(function (e) {
        if (searchSeq !== _sippSearchSeq) return;
        btn.disabled = false;
        loadingEl.style.display = 'none';
        if (window.LStopperLoading) window.LStopperLoading.hide();
        resultsEl.innerHTML = '<div class="sipp-no-result">&#9888; ' + cleanStopperError(e) + '</div>';
      });
    }

    function renderSippResults(res) {
      var resultsEl = document.getElementById('sipp-results');
      resultsEl.innerHTML = ''; // bersihkan kartu CF / hasil sebelumnya
      var kw = (document.getElementById('sipp-keyword') || {}).value || '';
      var isWebview = !!res.via_webview; // hasil dari proses otomatis

      var items = res.results || [];
      var matchedIdx = (res.matched_idx !== undefined) ? res.matched_idx : -1;

      if (!items.length) {
        resultsEl.innerHTML = '<div class="sipp-no-result">Tidak ada perkara ditemukan untuk kata kunci tersebut.</div>';
        return;
      }

      // Info keyword yang dipakai
      if (res.keyword && res.keyword !== kw) {
        const infoEl = document.createElement('div');
        infoEl.style.cssText = 'font-size:11px;color:rgba(var(--tc),.4);margin-bottom:6px;';
        infoEl.textContent = 'Kata kunci yang dicocokkan: ' + res.keyword;
        resultsEl.appendChild(infoEl);
      }

      resultsEl.innerHTML = items.map(function (it, idx) {
        const isMatch = idx === matchedIdx;
        const matchStyle = isMatch
          ? 'border-color:rgba(80,200,120,.5);background:rgba(80,200,120,.08);'
          : '';
        const matchBadge = isMatch
          ? '<span style="font-size:10px;background:rgba(80,200,120,.2);color:#6eeba0;'
          + 'border-radius:4px;padding:1px 6px;margin-left:6px;font-weight:700;">COCOK</span>'
          : '';
        const hasUrl = it.url && it.url.startsWith('http');
        const btnBuka = hasUrl
          ? '<button type="button" class="btn-buka-sipp" onclick="event.stopPropagation();bukaSippBrowser(' + idx + ')" title="Buka di browser">&#127760; Buka</button>'
          : '';
        const btnAmbil = (!hasUrl)
          ? '<span style="font-size:11px;color:rgba(var(--tc),.35);">URL tidak tersedia</span>'
          : '<button type="button" class="btn-ambil-kronologi" onclick="event.stopPropagation();ambilKronologiSipp(' + idx + ', ' + (isWebview ? 'true' : 'false') + ')">'
          + '&#128196; Ambil Kronologi</button>';
        return '<div class="sipp-result-item" data-idx="' + idx + '" style="' + matchStyle + '">'
          + '<div class="sipp-result-nomor">' + _esc(it.nomor || '-') + matchBadge + '</div>'
          + '<div class="sipp-result-pihak">' + _esc(it.pihak || '') + '</div>'
          + '<div class="sipp-result-meta">' + _esc(it.jenis || '')
          + (it.tanggal ? ' &nbsp;&bull;&nbsp; ' + _esc(it.tanggal) : '') + '</div>'
          + '<div style="margin-top:8px;display:flex;gap:6px;align-items:center;">' + btnAmbil + btnBuka + '</div>'
          + '</div>';

      }).join('');

      window._sippResultsCache = items;

      // Auto-scroll ke item yang cocok
      if (matchedIdx >= 0) {
        setTimeout(function () {
          const el = resultsEl.querySelector('[data-idx="' + matchedIdx + '"]');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        }, 100);
      }
    }

    function _esc(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function bukaSippBrowser(idx) {
      const items = window._sippResultsCache || [];
      const it = items[idx];
      if (!it || !it.url) return;
      if (window.pywebview && window.pywebview.api) {
        window.pywebview.api.buka_perkara_sipp(it.url);
      } else {
        window.open(it.url, '_blank');
      }
    }

    function fillNomorPutusanText(value) {
      const el = document.getElementById('f-putusan');
      const nomor = String(value || '').trim();
      if (!el || !nomor) return '';
      if ((el.value || '').trim() !== nomor) {
        el.value = nomor;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        try { if (typeof updateProgress === 'function') updateProgress(); } catch (_e) { }
        window._userHasTyped = true;
      }
      return nomor;
    }

    function fillNomorPutusanFromSipp(item) {
      const el = document.getElementById('f-putusan');
      if (!el || !item) return '';
      let nomor = String(item.nomor || '').trim();
      if (!nomor) return (el.value || '').trim();
      if (!/\/PN[.\s]+/i.test(nomor) && _sippPnKode) {
        nomor += '/PN ' + String(_sippPnKode).toUpperCase();
      }
      if ((el.value || '').trim() !== nomor) {
        el.value = nomor;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        try { if (typeof updateProgress === 'function') updateProgress(); } catch (_e) { }
        window._userHasTyped = true;
      }
      return nomor;
    }

    function getPidanaPutusanForKronologi() {
      /* Pastikan semua tab ter-mount saat baca nilai field (atasi lazy-tab).
         Field f-putusan/f-lama-pidana/f-denda/f-subsider/f-uang-pengganti
         berada di Tab 2/6 yang bisa saja sudah di-unload oleh lazy-tabs. */
      try {
        if (typeof window.__LIBERO_LAZY_MOUNT_ALL === 'function') {
          window.__LIBERO_LAZY_MOUNT_ALL();
        }
      } catch (_e) { }

      const lama = (
        (document.getElementById('f-lama-pidana')?.value || '') ||
        (document.getElementById('f6-jenis-pidana')?.value || '')
      ).trim();
      const parts = [];
      if (lama) parts.push(lama);

      if ((document.getElementById('f-ada-denda')?.value || '') === 'Ya') {
        const denda = (document.getElementById('f-denda')?.value || '').trim();
        const subsider = (document.getElementById('f-subsider')?.value || '').trim();
        if (denda && subsider) {
          parts.push(
            'pidana denda sebesar ' + denda +
            ', dengan ketentuan apabila denda tersebut tidak dibayar maka diganti dengan pidana subsider selama ' +
            subsider
          );
        } else if (denda) {
          parts.push('pidana denda sebesar ' + denda);
        } else if (subsider) {
          parts.push('pidana subsider selama ' + subsider);
        }
      }

      if ((document.getElementById('f-ada-uang-pengganti')?.value || '') === 'Ya') {
        const up = (document.getElementById('f-uang-pengganti')?.value || '').trim();
        if (up) parts.push('uang pengganti sebesar ' + up);
      }

      return parts.join(', ');
    }

    async function ambilKronologiSipp(idx, isWebviewOverride, skipConfirm) {
      const items = window._sippResultsCache || [];
      const it = items[idx];
      if (!it || !it.url) return;
      if (typeof window.LStopperRequireAiKey === 'function') {
        const hasAiKey = await window.LStopperRequireAiKey();
        if (!hasAiKey) return;
      }
      if (!skipConfirm) {
        const okAmbil = typeof LDialog !== 'undefined'
          ? await LDialog.confirm(
            'STOPPER akan mengambil dan menyusun kronologi dari data perkara ini.\n\n' +
            'Nomor: ' + _esc(it.nomor || '-') + '\n' +
            'Pihak: ' + _esc(it.pihak || '-') + '\n\n' +
            'Hasil kronologi akan ditampilkan untuk ditinjau. Lanjutkan?'
          )
          : confirm('STOPPER akan mengambil kronologi perkara. Lanjutkan?');
        if (!okAmbil) return;
      }

      /* Mount ulang semua tab agar field identitas/putusan/pidana yang
         mungkin sudah di-unload oleh lazy-tabs tersedia untuk dibaca. */
      try {
        if (typeof window.__LIBERO_LAZY_MOUNT_ALL === 'function') {
          window.__LIBERO_LAZY_MOUNT_ALL();
        }
      } catch (_e) { }

      var nomorPutusan = fillNomorPutusanFromSipp(it) || ((document.getElementById('f-putusan') || {}).value || '');
      var namaKlien = (document.getElementById('f-nama-klien') || {}).value || '';
      var pidana = getPidanaPutusanForKronologi();

      const itemEl = document.querySelector('.sipp-result-item[data-idx="' + idx + '"]');
      const btnEl = itemEl ? itemEl.querySelector('.btn-ambil-kronologi') : null;
      if (btnEl) {
        btnEl.disabled = true;
        btnEl.textContent = '\u23F3 Mengambil...';
      }
      if (window.LStopperLoading) {
        window.LStopperLoading.show({
          title: 'STOPPER AI',
          message: 'Mengambil bahan kronologi...',
          detail: it.nomor || nomorPutusan || '',
          steps: ['Mengambil bahan kronologi...', 'Membaca detail perkara...', 'Menyusun kronologi kejadian...', 'Mengisi kolom kronologi...']
        });
      }

      // Jika sumber perkara ini terproteksi, ambil detail lewat proses otomatis.
      if (isWebviewOverride) {
        window.onKronologiWebviewResult = async function (res) {
          window.onKronologiWebviewResult = null;
          if (window.LStopperLoading) window.LStopperLoading.hide();
          if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = '&#128196; Ambil Kronologi'; }
          if (!res || !res.ok) {
            showSippError('Gagal mengambil kronologi: ' + (res && res.err ? res.err : 'Error tidak diketahui'));
            return;
          }
          const ta = document.getElementById('f6-kronologi');
          fillNomorPutusanFromSipp(it);
          var applied = await _reviewAndApplyKronologi(ta, res.kronologi || '', it.nomor || 'Data Perkara', res.model || '');
          if (applied) {
            if (typeof toast === 'function') toast('Berhasil membuat kronologi!');
            closeSippModal();
          }
        };

        if (window.pywebview && window.pywebview.api) {
          window.pywebview.api.ambil_kronologi_webview(it.url, nomorPutusan, namaKlien, pidana);
        } else {
          if (window.LStopperLoading) window.LStopperLoading.hide();
          if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = '&#128196; Ambil Kronologi'; }
          showSippError('Gagal: pywebview tidak tersedia.');
        }
        return;
      }

      // Fallback standar (non-CF)
      (window.pywebview && window.pywebview.api
        ? window.pywebview.api.ambil_kronologi_sipp(it.url, nomorPutusan, namaKlien, pidana)
        : Promise.resolve({ ok: false, err: 'pywebview tidak tersedia' })
      ).then(async function (res) {
        if (window.LStopperLoading) window.LStopperLoading.hide();
        if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = '&#128196; Ambil Kronologi'; }

        if (!res || !res.ok) {
          showSippError('Gagal mengambil kronologi: ' + (res && res.err ? res.err : 'Error tidak diketahui'));
          return;
        }
        const ta = document.getElementById('f6-kronologi');
        fillNomorPutusanFromSipp(it);
        var applied = await _reviewAndApplyKronologi(ta, res.kronologi || '', it.nomor || 'Data Perkara', res.model || '');
        if (applied) {
          if (typeof toast === 'function') toast('Berhasil membuat kronologi!');
          closeSippModal();
        }
      }).catch(function (e) {
        if (window.LStopperLoading) window.LStopperLoading.hide();
        if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = '&#128196; Ambil Kronologi'; }
        showSippError('Error: ' + String(e));
      });
    }

    // Tutup modal jika klik backdrop
    document.getElementById('sipp-modal-backdrop').addEventListener('click', function (e) {
      if (e.target === this) closeSippModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.getElementById('sipp-modal-backdrop').classList.contains('open'))
        closeSippModal();
    });
    document.getElementById('sipp-keyword').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doSearchSipp();
    });
    document.getElementById('sipp-keyword').addEventListener('input', updateSippDetectionFromKeyword);
