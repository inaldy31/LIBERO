// LIBERO: Helper rekam mikrofon kronologi dan impor audio Litmas Anak.
/* ══════════════════════════════════════════
       KRONOLOGI MIC RECORDER  (v3 — stored as dataUrl, sama seperti foto_b64)
    ══════════════════════════════════════════ */
    (function () {
      /* ── State ── */
      let mediaRecorder = null;
      let audioChunks = [];
      let timerInterval = null;
      let startTime = 0;
      let recordCount = 0;
      let isRecording = false;

      /* _micStore: array of { id, audio_b64, duration }
         audio_b64 = full dataUrl, e.g. "data:audio/webm;base64,AAAA..."
         Sama persis pola seperti foto_b64 di dokumentasi */
      window._micStore = [];
      const AUDIO_IMPORT_MAX_BYTES = 10 * 1024 * 1024;

      /* ── Helpers ── */
      function formatTime(ms) {
        const s = Math.floor(ms / 1000);
        return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
      }
      function tickTimer() {
        const el = document.getElementById('mic-timer');
        if (el) el.textContent = formatTime(Date.now() - startTime);
      }
      function blobToDataUrl(blob) {
        return new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result);
          r.onerror = rej;
          r.readAsDataURL(blob);
        });
      }

      /* Fix webm duration metadata — tanpa library eksternal.
         Caranya: decode lewat AudioContext untuk dapat durasi akurat,
         lalu patch byte durasi di header EBML webm supaya slider browser akurat. */
      async function fixWebmDuration(blob) {
        try {
          const arrayBuf = await blob.arrayBuffer();
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const decoded = await audioCtx.decodeAudioData(arrayBuf.slice(0));
          audioCtx.close();
          const durSec = decoded.duration;  // durasi akurat dalam detik

          // Patch EBML Duration element di header webm
          // Duration element ID = 0x4489, tipe float64 big-endian
          const bytes = new Uint8Array(arrayBuf);
          const patched = _patchWebmDuration(bytes, durSec);
          return new Blob([patched], { type: blob.type });
        } catch (e) {
          console.warn('[MicRec] fixWebmDuration fallback:', e);
          return blob;   // fallback: kembalikan blob asli
        }
      }

      function _patchWebmDuration(bytes, durSec) {
        // Cari EBML Duration element (0x44 0x89) diikuti 0x88 (float64, 8 byte)
        for (let i = 0; i < bytes.length - 10; i++) {
          if (bytes[i] === 0x44 && bytes[i + 1] === 0x89 && bytes[i + 2] === 0x88) {
            // Tulis ulang float64 big-endian di posisi i+3
            const view = new DataView(bytes.buffer);
            view.setFloat64(i + 3, durSec, false);  // big-endian
            return bytes;
          }
        }
        return bytes;  // tidak ditemukan, kembalikan apa adanya
      }
      function bestMime() {
        const pref = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg'];
        for (const m of pref) if (MediaRecorder.isTypeSupported(m)) return m;
        return '';
      }
      function approxKB(dataUrl) {
        return Math.round((dataUrl.length - (dataUrl.indexOf(',') + 1)) * 0.75 / 1024);
      }
      /* -- Chunked audio cache: kirim blob dalam potongan 512 KB ke Python -- */
      async function cacheAudioBlob(blob, filename) {
        const CHUNK_SIZE = 512 * 1024;
        const mime = blob.type || 'audio/webm';
        const startRaw = await window._py('audio_cache_start', filename || 'audio.webm', mime, blob.size);
        const startRes = (typeof startRaw === 'string') ? JSON.parse(startRaw) : startRaw;
        if (!startRes || !startRes.ok) throw new Error((startRes && startRes.err) || 'Gagal memulai cache audio.');
        const sid = startRes.session_id;
        const arrayBuf = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuf);
        for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
          const chunk = bytes.slice(offset, offset + CHUNK_SIZE);
          const chunkB64 = _uint8ToBase64(chunk);
          const chunkRaw = await window._py('audio_cache_chunk', sid, chunkB64);
          const chunkRes = (typeof chunkRaw === 'string') ? JSON.parse(chunkRaw) : chunkRaw;
          if (!chunkRes || !chunkRes.ok) throw new Error((chunkRes && chunkRes.err) || 'Gagal mengirim chunk audio.');
        }
        const finRaw = await window._py('audio_cache_finish', sid);
        const res = (typeof finRaw === 'string') ? JSON.parse(finRaw) : finRaw;
        if (!res || res.ok === false) throw new Error((res && res.err) || 'Gagal menyimpan audio.');
        return res;
      }
      function _uint8ToBase64(uint8) {
        let binary = '';
        const len = uint8.length;
        for (let i = 0; i < len; i++) binary += String.fromCharCode(uint8[i]);
        return btoa(binary);
      }

      /* ── Start / Stop ── */
      window.kronologiMicToggle = async function () {
        if (!isRecording) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 22050, echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
            audioChunks = [];
            const mime = bestMime();
            const opts = { audioBitsPerSecond: 32000 };    // 32 kbps mono
            if (mime) opts.mimeType = mime;
            mediaRecorder = new MediaRecorder(stream, opts);
            mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
            mediaRecorder.onstop = () => onRecordingStop(stream, opts.mimeType || 'audio/webm');
            mediaRecorder.start(200);
            isRecording = true; startTime = Date.now();
            timerInterval = setInterval(tickTimer, 500);
            // UI
            const btn = document.getElementById('btn-mic-toggle');
            btn.style.background = 'rgba(248,113,113,.15)';
            btn.style.borderColor = 'rgba(248,113,113,.55)';
            btn.style.color = '#f87171';
            document.getElementById('mic-btn-label').textContent = 'Stop';
            document.getElementById('mic-recording-indicator').style.display = 'flex';
          } catch (err) {
            alert('Tidak dapat mengakses mikrofon. Pastikan izin diberikan di browser.');
            console.error('[MicRec]', err);
          }
        } else {
          if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        }
      };

      /* ── After stop: blob → dataUrl (seperti foto) → store → render ── */
      async function onRecordingStop(stream, mimeType) {
        isRecording = false;
        clearInterval(timerInterval);
        stream.getTracks().forEach(t => t.stop());
        const duration = Date.now() - startTime;
        recordCount++;
        const id = 'rec-' + recordCount;

        // Reset UI
        const btn = document.getElementById('btn-mic-toggle');
        btn.style.cssText = '';  // clear inline → CSS class takes over
        document.getElementById('mic-btn-label').textContent = 'Rekam Suara';
        document.getElementById('mic-recording-indicator').style.display = 'none';
        document.getElementById('mic-timer').textContent = '0:00';

        // Placeholder
        const list = document.getElementById('mic-recordings-list');
        const ph = document.createElement('div');
        ph.id = 'ph-' + id;
        ph.style.cssText = 'padding:6px 12px;font-size:11px;color:rgba(225,183,73,.45);font-family:var(--font-mono)';
        ph.textContent = '⏳ Memproses rekaman ' + recordCount + '…';
        if (list) list.appendChild(ph);

        // blob → fix duration metadata → dataUrl
        let blob = new Blob(audioChunks, { type: mimeType });
        blob = await fixWebmDuration(blob);
        let meta = null;
        try { meta = await cacheAudioBlob(blob, 'rekaman-' + Date.now() + '.webm'); }
        catch (e) { console.error('[MicRec]', e); }

        // Store — struktur flat seperti {foto_b64, ...} tapi untuk audio
        if (!meta) {
          document.getElementById('ph-' + id)?.remove();
          if (typeof toast === 'function') toast('Gagal menyimpan rekaman audio.');
          return;
        }
        const audio_url = meta.file_url || URL.createObjectURL(blob);
        window._micStore.push({ id, audio_b64: '', audio_path: meta.path || '', audio_url, duration, filename: meta.name || null, mime: meta.mime || mimeType, size: meta.size || blob.size });
        window._userHasTyped = true; // trigger autosave
        document.getElementById('ph-' + id)?.remove();
        addAudioCard(id, audio_url, duration, recordCount, meta.name || null);
      }

      /* ── Render card ── */
      function addAudioCard(id, audio_b64, duration, num, filename) {
        const list = document.getElementById('mic-recordings-list');
        if (!list) return;
        const rec = (window._micStore || []).find(r => r.id === id);
        const audio_src = (rec && rec.audio_url) || audio_b64;
        const sizeLabel = rec && rec.size
          ? (rec.size < 1048576 ? Math.round(rec.size / 1024) + ' KB' : (rec.size / 1048576).toFixed(1) + ' MB')
          : approxKB(audio_b64) + ' KB';
        const label = filename
          ? `📁 ${filename.length > 22 ? filename.slice(0, 20) + '…' : filename}`
          : `🎙 Rekaman ${num}`;
        const card = document.createElement('div');
        card.id = 'card-' + id;
        card.dataset.recId = id;
        card.style.cssText = `
      display:flex;align-items:center;gap:10px;padding:8px 12px;
      border-radius:8px;border:1px solid rgba(225,183,73,.2);
      background:rgba(var(--ac),.05);flex-wrap:nowrap;
    `;
        card.innerHTML = `
      <span style="font-size:11px;font-weight:700;color:rgba(225,183,73,.6);
        white-space:nowrap;min-width:64px;font-family:var(--font-mono);">${label}</span>
      <audio controls src="${audio_src}" style="flex:1;min-width:0;height:28px;
        accent-color:var(--gold);filter:sepia(30%) hue-rotate(10deg);"></audio>
      <span style="font-size:11px;color:rgba(240,232,216,.4);
        white-space:nowrap;font-family:var(--font-mono);">${duration ? formatTime(duration) : ''}</span>
      <span style="font-size:10px;color:rgba(var(--tc),.28);white-space:nowrap;font-family:var(--font-mono);">
        ${sizeLabel}</span>
      <button onclick="window._micDeleteCard('${id}')" type="button"
        title="Hapus" style="background:none;border:none;cursor:pointer;
        color:rgba(240,90,90,.6);font-size:15px;padding:0 2px;line-height:1;flex-shrink:0;transition:color .15s;"
        onmouseover="this.style.color='#f87171'" onmouseout="this.style.color='rgba(240,90,90,.6)'">✕</button>
    `;
        list.appendChild(card);
      }

      /* ── Re-encode audio ke 32 kbps (sama seperti hasil rekaman) ── */
      function reencodeAudio(file) {
        return new Promise(async (resolve) => {
          try {
            const ab = await file.arrayBuffer();
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const decoded = await ctx.decodeAudioData(ab);
            ctx.close();

            // Buat offline buffer → stream → MediaRecorder di 32 kbps
            const offCtx = new OfflineAudioContext(
              decoded.numberOfChannels, decoded.length, decoded.sampleRate
            );
            const src = offCtx.createBufferSource();
            src.buffer = decoded;
            src.connect(offCtx.destination);
            src.start();
            const rendered = await offCtx.startRendering();

            // Stream rendered buffer lewat AudioContext → MediaRecorder
            const liveCtx = new AudioContext();
            const dest = liveCtx.createMediaStreamDestination();
            const bufSrc = liveCtx.createBufferSource();
            bufSrc.buffer = rendered;
            bufSrc.connect(dest);

            const mime = bestMime();
            const opts = { audioBitsPerSecond: 32000 };
            if (mime) opts.mimeType = mime;
            const mr = new MediaRecorder(dest.stream, opts);
            const chunks = [];
            mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
            mr.onstop = async () => {
              liveCtx.close();
              let blob = new Blob(chunks, { type: mime || 'audio/webm' });
              blob = await fixWebmDuration(blob);
              resolve({ blob, duration: Math.round(decoded.duration * 1000) });
            };
            mr.start(200);
            bufSrc.start();
            // Stop setelah durasi selesai + buffer kecil
            setTimeout(() => { if (mr.state !== 'inactive') mr.stop(); },
              decoded.duration * 1000 + 300);
          } catch (e) {
            console.warn('[MicImport] re-encode fallback:', e);
            resolve(null);   // null = pakai file asli
          }
        });
      }

      /* ── Import audio dari file (HP / komputer) ── */
      window.kronologiImportAudio = async function (input) {
        const files = Array.from(input.files || []);
        if (!files.length) return;
        input.value = '';   // reset supaya file yang sama bisa diimport lagi

        for (const file of files) {
          recordCount++;
          const id = 'rec-' + recordCount;
          const num = recordCount;

          // Placeholder
          const list = document.getElementById('mic-recordings-list');
          const ph = document.createElement('div');
          ph.id = 'ph-' + id;
          ph.style.cssText = 'padding:6px 12px;font-size:11px;color:rgba(140,200,255,.5);font-family:var(--font-mono)';
          ph.textContent = '⏳ Mengimpor ' + file.name + '…';
          if (list) list.appendChild(ph);

          try {
            if (file.size > AUDIO_IMPORT_MAX_BYTES) {
              if (typeof toast === 'function') toast('File audio besar pilih lewat Data Manager.');
              document.getElementById('ph-' + id)?.remove();
              continue;
            }
            // Normalisasi MIME type supaya <audio> bisa play
            let _mime = file.type || '';
            if (!_mime || _mime === 'audio/x-m4a' || _mime === 'audio/m4a') _mime = 'audio/mp4';
            const _blob = _mime !== file.type ? new Blob([await file.arrayBuffer()], { type: _mime }) : file;
            const meta = await cacheAudioBlob(_blob, file.name);
            const audio_url = meta.file_url || URL.createObjectURL(_blob);
            let duration = 0;
            window._micStore.push({ id, audio_b64: '', audio_path: meta.path || '', audio_url, duration, filename: meta.name || file.name, mime: meta.mime || _mime, size: meta.size || file.size });
            window._userHasTyped = true; // trigger autosave
            document.getElementById('ph-' + id)?.remove();
            addAudioCard(id, audio_url, duration, num, meta.name || file.name);
          } catch (e) {
            document.getElementById('ph-' + id)?.remove();
            console.error('[MicImport]', e);
          }
        }
      };
      window._micDeleteCard = function (id) {
        document.getElementById('card-' + id)?.remove();
        const rec = (window._micStore || []).find(r => r.id === id);
        if (rec && rec.audio_url && String(rec.audio_url).startsWith('blob:')) URL.revokeObjectURL(rec.audio_url);
        window._micStore = window._micStore.filter(r => r.id !== id);
      };
      window._micAddAudioCard = addAudioCard;

      function clearKronologiAudioStore() {
        try {
          (window._micStore || []).forEach(function (r) {
            if (r && r.audio_url && String(r.audio_url).startsWith('blob:')) {
              URL.revokeObjectURL(r.audio_url);
            }
          });
        } catch (_e) { }
        window._micStore = [];
        recordCount = 0;
        const list = document.getElementById('mic-recordings-list');
        if (list) list.innerHTML = '';
      }
      window._clearKronologiAudioStore = clearKronologiAudioStore;

      /* ── Patch collectTab7 & loadTab7 — setelah semua script define fungsinya ── */
      function _patchCollect() {
        const _orig = window.collectTab7;
        window.collectTab7 = function () {
          const data = typeof _orig === 'function' ? _orig() : {};
          if (!data.riwayat_pidana) data.riwayat_pidana = {};
          // Simpan persis seperti foto: array of {audio_b64, duration}
          data.riwayat_pidana.kronologi_audio =
            window._micStore.length > 0
              ? window._micStore.map(r => ({ id: r.id, audio_b64: r.audio_b64 || '', audio_path: r.audio_path || '', audio_url: r.audio_path ? (r.audio_url || '') : '', duration: r.duration, filename: r.filename || null, mime: r.mime || null, size: r.size || 0 }))
              : [];
          return data;
        };
      }

      function _patchLoad() {
        const _orig = window.loadTab7;
        window.loadTab7 = function (data) {
          if (typeof _orig === 'function') _orig(data);
          const audios = (data?.riwayat_pidana?.kronologi_audio) || [];
          clearKronologiAudioStore();
          if (!audios.length) return;
          audios.forEach((r, i) => {
            const pathUrl = r.audio_path ? encodeURI('file:///' + String(r.audio_path).replace(/\\/g, '/')) : '';
            const savedUrl = (r.audio_url && !String(r.audio_url).startsWith('blob:')) ? r.audio_url : '';
            const entry = { id: r.id || ('rec-loaded-' + i), audio_b64: r.audio_b64 || '', audio_path: r.audio_path || '', audio_url: savedUrl || pathUrl, duration: r.duration || 0, filename: r.filename || null, mime: r.mime || null, size: r.size || 0 };
            window._micStore.push(entry);
            if (entry.audio_b64 || entry.audio_url) addAudioCard(entry.id, entry.audio_b64 || entry.audio_url, entry.duration, i + 1, entry.filename || null);
          });
          recordCount = audios.length;
        };
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(() => { _patchCollect(); _patchLoad(); }, 0));
      } else {
        setTimeout(() => { _patchCollect(); _patchLoad(); }, 0);
      }

      // ── Auto-show tombol AI ──
      function _updateAiKronBtnLma() {
        const btn = document.getElementById('btn-ai-kronologi-lma') || document.getElementById('btn-kron-stopper-lma');
        if (btn) btn.style.display = 'flex';
      }
      // MutationObserver: langsung reaktif saat card audio ditambah/dihapus
      const _listObsLma = document.getElementById('mic-recordings-list');
      if (_listObsLma) {
        new MutationObserver(_updateAiKronBtnLma).observe(_listObsLma, { childList: true, subtree: false });
      }
      const _origMicDeleteLma = window._micDeleteCard;
      window._micDeleteCard = function(id) {
        if (typeof _origMicDeleteLma === 'function') _origMicDeleteLma(id);
        setTimeout(_updateAiKronBtnLma, 50);
      };
      // Fallback: cek setelah halaman + data selesai dimuat
      setTimeout(_updateAiKronBtnLma, 600);
      setTimeout(_updateAiKronBtnLma, 2000);
      setTimeout(_updateAiKronBtnLma, 4000);
    })();

    window.toggleKronologiStopperMenu = function (suffix) {
      const menu = document.getElementById('kron-stopper-menu-' + suffix);
      if (!menu) return;
      document.querySelectorAll('.kron-stopper-menu.open').forEach(function (m) {
        if (m !== menu) m.classList.remove('open');
      });
      menu.classList.toggle('open');
    };

    window.runKronologiStopper = function (suffix, action) {
      if (window._SFX && window._SFX.fire) window._SFX.fire();
      const menu = document.getElementById('kron-stopper-menu-' + suffix);
      if (menu) menu.classList.remove('open');
      if (action === 'audio' && typeof aiAudioToKronologi === 'function') aiAudioToKronologi();
      if (action === 'narasi' && typeof aiReparseKronologi === 'function') aiReparseKronologi();
    };

    if (!window._kronStopperMenuBound) {
      window._kronStopperMenuBound = true;
      document.addEventListener('click', function (e) {
        if (e.target.closest('.kron-stopper-wrap')) return;
        document.querySelectorAll('.kron-stopper-menu.open').forEach(function (m) {
          m.classList.remove('open');
        });
      });
    }

    /* ── AI Audio → Teks Kronologi (Litmas Anak) ──────────────────── */
    function _kronEsc(value) {
      return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function _ensureKronReviewModal() {
      var overlay = document.getElementById('kron-review-overlay');
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.id = 'kron-review-overlay';
      overlay.className = 'wilayah-overlay';
      overlay.innerHTML =
        '<div class="wilayah-modal">' +
        '<div class="wilayah-modal-hdr"><div class="wilayah-modal-title">Review Kronologi STOPPER</div><button type="button" class="wilayah-btn" id="kron-review-close">Tutup</button></div>' +
        '<div class="wilayah-modal-body" id="kron-review-body"></div>' +
        '<div class="wilayah-modal-ftr" id="kron-review-actions"></div>' +
        '</div>';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });
      overlay.querySelector('#kron-review-close').onclick = function () { overlay.classList.remove('open'); };
      return overlay;
    }

    function _showKronReview(currentText, resultText, sourceLabel, modelUsed) {
      return new Promise(function (resolve) {
        var overlay = _ensureKronReviewModal();
        var body = overlay.querySelector('#kron-review-body');
        var actions = overlay.querySelector('#kron-review-actions');
        var oldText = String(currentText || '').trim();
        var newText = String(resultText || '').trim();
        var modelText = String(modelUsed || '').trim() || '-';
        var sourceText = String(sourceLabel || 'STOPPER AI').trim();
        body.innerHTML =
          '<div class="wilayah-note"><strong>Model AI:</strong> ' + _kronEsc(modelText) + ' | <strong>Sumber:</strong> ' + _kronEsc(sourceText) + '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
          '<div><div class="wilayah-info-label">Isi Saat Ini</div><div style="white-space:pre-wrap;max-height:260px;overflow:auto;border:1px solid rgba(var(--tc),.12);border-radius:8px;padding:10px;color:rgba(var(--tc),.86)">' + _kronEsc(oldText || '-') + '</div></div>' +
          '<div><div class="wilayah-info-label">Hasil STOPPER</div><div style="white-space:pre-wrap;max-height:260px;overflow:auto;border:1px solid rgba(var(--tc),.12);border-radius:8px;padding:10px;color:rgba(var(--tc),.86)">' + _kronEsc(newText || '-') + '</div></div>' +
          '</div>';
        actions.innerHTML =
          '<button type="button" class="wilayah-btn" id="kron-review-cancel">Batal</button>' +
          (oldText ? '<button type="button" class="wilayah-btn" id="kron-review-append">Tambahkan di Bawah</button>' : '') +
          '<button type="button" class="wilayah-btn primary" id="kron-review-replace">' + (oldText ? 'Ganti Isi Lama' : 'Gunakan Hasil STOPPER') + '</button>';
        function done(action) {
          overlay.classList.remove('open');
          resolve(action);
        }
        actions.querySelector('#kron-review-cancel').onclick = function () { done('cancel'); };
        var appendBtn = actions.querySelector('#kron-review-append');
        if (appendBtn) appendBtn.onclick = function () { done('append'); };
        actions.querySelector('#kron-review-replace').onclick = function () { done('replace'); };
        overlay.classList.add('open');
      });
    }

    async function _reviewAndApplyKronologi(ta, resultText, sourceLabel, modelUsed) {
      if (!ta || !String(resultText || '').trim()) return false;
      var oldText = String(ta.value || '').trim();
      var action = await _showKronReview(oldText, resultText, sourceLabel, modelUsed);
      if (action === 'cancel') return false;
      if (action === 'append' && oldText) ta.value = oldText + '\n' + String(resultText || '').trim();
      else ta.value = String(resultText || '').trim();
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      ta.dispatchEvent(new Event('change', { bubbles: true }));
      window._userHasTyped = true;
      return true;
    }

    window.aiReparseKronologi = async function () {
      const ta = document.getElementById('f6-kronologi');
      const raw = (ta?.value || '').trim();
      if (!raw) {
        const msg = 'Isi garis besar atau narasi kronologi terlebih dahulu.';
        if (typeof LDialog !== 'undefined') await LDialog.alert(msg);
        else alert(msg);
        return;
      }

      if (!window.pywebview || !window.pywebview.api || !window.pywebview.api.ai_reparse_kronologi) {
        const msg = 'Fitur AI belum siap. Coba tutup dan buka kembali modul.';
        if (typeof LDialog !== 'undefined') await LDialog.alert(msg);
        else alert(msg);
        return;
      }
      if (typeof window.LStopperRequireAiKey === 'function') {
        const hasAiKey = await window.LStopperRequireAiKey();
        if (!hasAiKey) return;
      }

      const okStart = typeof LDialog !== 'undefined'
        ? await LDialog.confirm(
          'STOPPER akan memperbaiki kronologi yang tertulis.\n\n' +
          'Yang akan dilakukan:\n' +
          '- mengubah kalimat yang tidak baku menjadi bahasa Indonesia baku sesuai KBBI;\n' +
          '- memperbaiki ejaan, tanda baca, dan susunan kalimat;\n' +
          '- menggabungkan poin atau garis besar menjadi narasi kronologis;\n' +
          '- memanjangkan uraian yang terlalu pendek tanpa menambah fakta baru;\n' +
          '- menyusun cerita dari awal kejadian sampai akhir secara runtut.\n\n' +
          'Hasil AI akan ditampilkan untuk ditinjau sebelum diterapkan. Lanjutkan?'
        )
        : confirm(
          'STOPPER akan memperbaiki kronologi yang tertulis. ' +
          'Hasil AI akan ditampilkan untuk ditinjau sebelum diterapkan. Lanjutkan?'
        );
      if (!okStart) return;

      const btn = document.getElementById('btn-ai-kron-repair-lma') || document.getElementById('btn-kron-stopper-lma');
      const lbl = document.getElementById('btn-ai-kron-repair-lbl-lma') || document.getElementById('btn-kron-stopper-lbl-lma');
      if (btn) btn.disabled = true;
      if (lbl) lbl.textContent = 'Memproses...';
      if (window.LStopperLoading) {
        window.LStopperLoading.show({
          title: 'STOPPER AI',
          message: 'Membaca narasi kronologi...',
          detail: 'AI sedang merapikan alur, bahasa, dan struktur kronologi.',
          steps: ['Membaca narasi kronologi...', 'Memperbaiki bahasa dan ejaan...', 'Menyusun ulang alur kejadian...', 'Menyiapkan hasil kronologi...']
        });
      }

      const namaKlien = (
        (document.getElementById('f-nama-klien')?.value || '') ||
        (document.getElementById('f1-nama-klien')?.value || '') ||
        (document.getElementById('f1-nama')?.value || '')
      ).trim();
      const pidana = (
        (document.getElementById('f-lama-pidana')?.value || '') ||
        (document.getElementById('f6-jenis-pidana')?.value || '')
      ).trim();

      window.__onAiKronRepairResult = async function (res) {
        delete window.__onAiKronRepairResult;
        try {
          if (res && res.ok) {
            if (window.LStopperLoading) window.LStopperLoading.hide();
            var applied = await _reviewAndApplyKronologi(ta, res.kronologi || '', 'Perbaiki Narasi', res.model || '');
            if (applied && typeof toast === 'function') toast('Kronologi berhasil diperbaiki.');
          } else if (res && !res.pending) {
            if (window.LStopperLoading) window.LStopperLoading.hide();
            const msg = 'Gagal: ' + (res?.err || 'Error tidak diketahui');
            if (typeof LDialog !== 'undefined') await LDialog.alert(msg);
            else alert(msg);
          }
        } finally {
          if (!res || !res.ok) {
            if (window.LStopperLoading) window.LStopperLoading.hide();
          }
          if (btn) btn.disabled = false;
          if (lbl) lbl.textContent = 'STOPPER';
        }
      };

      window.pywebview.api.ai_reparse_kronologi(raw, namaKlien, pidana, 'litmasanak');
    };

    window.aiAudioToKronologi = async function () {
      const store = window._micStore || [];
      if (!store.length) {
        if (typeof LDialog !== 'undefined') {
          await LDialog.alert('Belum ada rekaman audio.\nRekam atau impor audio terlebih dahulu.');
        } else {
          alert('Belum ada rekaman audio. Rekam atau impor audio terlebih dahulu.');
        }
        return;
      }

      const ta = document.getElementById('f6-kronologi');
      const existingText = (ta?.value || '').trim();
      if (typeof window.LStopperRequireAiKey === 'function') {
        const hasAiKey = await window.LStopperRequireAiKey();
        if (!hasAiKey) return;
      }
      const okStart = typeof LDialog !== 'undefined'
        ? await LDialog.confirm(
          'STOPPER Audio akan memproses rekaman menjadi narasi kronologi.\n\n' +
          'Yang akan dilakukan:\n' +
          '- membaca atau mentranskripsikan audio yang dipilih;\n' +
          '- menyusun hasilnya menjadi kronologi kejadian dari awal sampai akhir;\n' +
          '- memperbaiki bahasa menjadi baku sesuai KBBI;\n' +
          '- menggabungkan keterangan yang terpisah menjadi narasi yang padu;\n' +
          '- menjaga istilah Litmas Anak, seperti penggunaan kata klien anak.\n\n' +
          (existingText ? 'Isi kronologi yang ada akan ditampilkan sebagai pembanding. ' : '') +
          'Lanjutkan?'
        )
        : confirm(
          'STOPPER Audio akan memproses rekaman menjadi narasi kronologi. ' +
          (existingText ? 'Isi kronologi yang ada akan ditampilkan sebagai pembanding. ' : '') +
          'Lanjutkan?'
        );
      if (!okStart) return;

      const btn = document.getElementById('btn-ai-kronologi-lma') || document.getElementById('btn-kron-stopper-lma');
      const lbl = document.getElementById('btn-ai-kron-lbl-lma') || document.getElementById('btn-kron-stopper-lbl-lma');
      if (btn) btn.disabled = true;
      if (lbl) lbl.textContent = 'Memproses...';
      if (window.LStopperLoading) {
        window.LStopperLoading.show({
          title: 'STOPPER AI',
          message: 'Menyiapkan audio rekaman...',
          detail: 'AI sedang mentranskripsi audio dan menyusun kronologi.',
          steps: ['Menyiapkan audio rekaman...', 'Mentranskripsikan isi audio...', 'Menyusun narasi kronologi...', 'Memperbaiki bahasa dan alur...', 'Menyiapkan hasil kronologi...'],
          interval: 4200
        });
      }

      // Ambil nama klien dari field di litmasanak (f1-nama-klien atau f1-nama)
      const namaKlien = (
        (document.getElementById('f1-nama-klien')?.value || '') ||
        (document.getElementById('f1-nama')?.value || '')
      ).trim();
      const pidana = (document.getElementById('f6-jenis-pidana')?.value || '').trim();

      const audioList = store.map(r => ({
        id: r.id,
        audio_b64: r.audio_b64 || '',
        audio_path: r.audio_path || '',
        duration: r.duration,
        filename: r.filename || null,
        mime: r.mime || null,
        size: r.size || 0
      }));

      // Gunakan callback async — hasil dikirim Python via _safe_eval_js ke __onAiKronResult
      window.__onAiKronResult = async function(res) {
        delete window.__onAiKronResult;
        try {
          if (res && res.ok) {
            if (window.LStopperLoading) window.LStopperLoading.hide();
            var applied = await _reviewAndApplyKronologi(ta, res.kronologi || '', 'Audio', res.model || '');
            if (applied && typeof toast === 'function') toast('Kronologi berhasil dibuat dari audio!');
          } else if (res && !res.pending) {
            const msg = 'Gagal: ' + (res?.err || 'Error tidak diketahui');
            if (typeof LDialog !== 'undefined') await LDialog.alert(msg);
            else alert(msg);
          }
        } finally {
          if (window.LStopperLoading) {
            if (!res || !res.ok) window.LStopperLoading.hide();
          }
          if (btn) btn.disabled = false;
          if (lbl) lbl.textContent = 'STOPPER';
        }
      };

      // Panggil API — langsung return, hasil datang via __onAiKronResult
      window.pywebview.api.ai_audio_to_kronologi(
        JSON.stringify(audioList), namaKlien, pidana
      );
    };

  
