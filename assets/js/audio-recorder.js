// LIBERO: Alur perekaman audio browser dan helper penghubung pywebview.
(function () {
  let mediaRecorder = null;
  let audioChunks = [];
  let timerInterval = null;
  let startTime = 0;
  let recordCount = 0;
  let isRecording = false;

  window._micStore = window._micStore || [];
  const AUDIO_IMPORT_MAX_BYTES = 10 * 1024 * 1024;
  const CHUNK_SIZE = 512 * 1024;

  function moduleSuffix() {
    const mod = (document.body && document.body.dataset && document.body.dataset.liberoModule) || '';
    return mod === 'litmasanak' ? 'lma' : 'int';
  }

  function formatTime(ms) {
    const s = Math.floor((ms || 0) / 1000);
    return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
  }

  function tickTimer() {
    const el = document.getElementById('mic-timer');
    if (el) el.textContent = formatTime(Date.now() - startTime);
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function fixWebmDuration(blob) {
    try {
      const arrayBuf = await blob.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const decoded = await audioCtx.decodeAudioData(arrayBuf.slice(0));
      audioCtx.close();
      const bytes = new Uint8Array(arrayBuf);
      const patched = patchWebmDuration(bytes, decoded.duration);
      return new Blob([patched], { type: blob.type });
    } catch (e) {
      try { console.warn('[MicRec] fixWebmDuration fallback:', e); } catch (_e) { }
      return blob;
    }
  }

  function patchWebmDuration(bytes, durSec) {
    for (let i = 0; i < bytes.length - 10; i++) {
      if (bytes[i] === 0x44 && bytes[i + 1] === 0x89 && bytes[i + 2] === 0x88) {
        const view = new DataView(bytes.buffer);
        view.setFloat64(i + 3, durSec, false);
        return bytes;
      }
    }
    return bytes;
  }

  function bestMime() {
    const pref = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg'];
    for (const mime of pref) {
      try {
        if (MediaRecorder.isTypeSupported(mime)) return mime;
      } catch (_e) { }
    }
    return '';
  }

  function approxKB(dataUrl) {
    const value = String(dataUrl || '');
    const comma = value.indexOf(',');
    return Math.round((value.length - (comma + 1)) * 0.75 / 1024);
  }

  function uint8ToBase64(uint8) {
    let binary = '';
    for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
    return btoa(binary);
  }

  function hasPyMethod(name) {
    return !!(window.pywebview && window.pywebview.api && typeof window.pywebview.api[name] === 'function');
  }

  async function cacheAudioBlobChunked(blob, filename) {
    const mime = blob.type || 'audio/webm';
    const startRaw = await window._py('audio_cache_start', filename || 'audio.webm', mime, blob.size);
    const startRes = (typeof startRaw === 'string') ? JSON.parse(startRaw) : startRaw;
    if (!startRes || !startRes.ok) throw new Error((startRes && startRes.err) || 'Gagal memulai cache audio.');

    const sid = startRes.session_id;
    const arrayBuf = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuf);
    for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
      const chunk = bytes.slice(offset, offset + CHUNK_SIZE);
      const chunkRaw = await window._py('audio_cache_chunk', sid, uint8ToBase64(chunk));
      const chunkRes = (typeof chunkRaw === 'string') ? JSON.parse(chunkRaw) : chunkRaw;
      if (!chunkRes || !chunkRes.ok) throw new Error((chunkRes && chunkRes.err) || 'Gagal mengirim chunk audio.');
    }

    const finRaw = await window._py('audio_cache_finish', sid);
    const res = (typeof finRaw === 'string') ? JSON.parse(finRaw) : finRaw;
    if (!res || res.ok === false) throw new Error((res && res.err) || 'Gagal menyimpan audio.');
    return res;
  }

  async function cacheAudioBlobSingle(blob, filename) {
    const dataUrl = await blobToDataUrl(blob);
    const raw = await window._py('cache_audio_b64', dataUrl, filename || 'audio.webm');
    const res = (typeof raw === 'string') ? JSON.parse(raw) : raw;
    if (!res || res.ok === false) throw new Error((res && res.err) || 'Gagal menyimpan audio.');
    return res;
  }

  async function cacheAudioBlob(blob, filename) {
    if (hasPyMethod('audio_cache_start') && hasPyMethod('audio_cache_chunk') && hasPyMethod('audio_cache_finish')) {
      return cacheAudioBlobChunked(blob, filename);
    }
    return cacheAudioBlobSingle(blob, filename);
  }

  window.kronologiMicToggle = async function () {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 22050,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        });
        audioChunks = [];
        const mime = bestMime();
        const opts = { audioBitsPerSecond: 32000 };
        if (mime) opts.mimeType = mime;
        mediaRecorder = new MediaRecorder(stream, opts);
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
        mediaRecorder.onstop = () => onRecordingStop(stream, opts.mimeType || 'audio/webm');
        mediaRecorder.start(200);
        isRecording = true;
        startTime = Date.now();
        timerInterval = setInterval(tickTimer, 500);

        const btn = document.getElementById('btn-mic-toggle');
        if (btn) {
          btn.style.background = 'rgba(248,113,113,.15)';
          btn.style.borderColor = 'rgba(248,113,113,.55)';
          btn.style.color = '#f87171';
        }
        const label = document.getElementById('mic-btn-label');
        if (label) label.textContent = 'Stop';
        const indicator = document.getElementById('mic-recording-indicator');
        if (indicator) indicator.style.display = 'flex';
      } catch (err) {
        alert('Tidak dapat mengakses mikrofon. Pastikan izin diberikan di browser.');
        try { console.error('[MicRec]', err); } catch (_e) { }
      }
    } else if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  async function onRecordingStop(stream, mimeType) {
    isRecording = false;
    clearInterval(timerInterval);
    stream.getTracks().forEach(track => track.stop());
    const duration = Date.now() - startTime;
    recordCount++;
    const id = 'rec-' + recordCount;

    const btn = document.getElementById('btn-mic-toggle');
    if (btn) btn.style.cssText = '';
    const label = document.getElementById('mic-btn-label');
    if (label) label.textContent = 'Rekam Suara';
    const indicator = document.getElementById('mic-recording-indicator');
    if (indicator) indicator.style.display = 'none';
    const timer = document.getElementById('mic-timer');
    if (timer) timer.textContent = '0:00';

    addPlaceholder(id, 'Memproses rekaman ' + recordCount + '...');

    let blob = new Blob(audioChunks, { type: mimeType });
    blob = await fixWebmDuration(blob);
    let meta = null;
    try {
      meta = await cacheAudioBlob(blob, 'rekaman-' + Date.now() + '.webm');
    } catch (e) {
      try { console.error('[MicRec]', e); } catch (_err) { }
    }

    removePlaceholder(id);
    if (!meta) {
      if (typeof toast === 'function') toast('Gagal menyimpan rekaman audio.');
      return;
    }

    const audioUrl = meta.file_url || URL.createObjectURL(blob);
    window._micStore.push({
      id,
      audio_b64: '',
      audio_path: meta.path || '',
      audio_url: audioUrl,
      duration,
      filename: meta.name || null,
      mime: meta.mime || mimeType,
      size: meta.size || blob.size
    });
    window._userHasTyped = true;
    addAudioCard(id, audioUrl, duration, recordCount, meta.name || null);
  }

  function addPlaceholder(id, text) {
    const list = document.getElementById('mic-recordings-list');
    if (!list) return;
    const ph = document.createElement('div');
    ph.id = 'ph-' + id;
    ph.style.cssText = 'padding:6px 12px;font-size:11px;color:rgba(var(--ac),.45);font-family:var(--font-mono)';
    ph.textContent = text;
    list.appendChild(ph);
  }

  function removePlaceholder(id) {
    document.getElementById('ph-' + id)?.remove();
  }

  function addAudioCard(id, audio_b64, duration, num, filename) {
    const list = document.getElementById('mic-recordings-list');
    if (!list) return;
    const rec = (window._micStore || []).find(r => r.id === id);
    const audioSrc = (rec && rec.audio_url) || audio_b64;
    const sizeLabel = rec && rec.size
      ? (rec.size < 1048576 ? Math.round(rec.size / 1024) + ' KB' : (rec.size / 1048576).toFixed(1) + ' MB')
      : approxKB(audio_b64) + ' KB';
    const label = filename
      ? 'File ' + (filename.length > 22 ? filename.slice(0, 20) + '...' : filename)
      : 'Rekaman ' + num;

    const card = document.createElement('div');
    card.id = 'card-' + id;
    card.dataset.recId = id;
    card.style.cssText = `
      display:flex;align-items:center;gap:10px;padding:8px 12px;
      border-radius:8px;border:1px solid rgba(var(--ac),.2);
      background:rgba(var(--ac),.05);flex-wrap:nowrap;
    `;
    card.innerHTML = `
      <span style="font-size:11px;font-weight:700;color:rgba(var(--ac),.6);
        white-space:nowrap;min-width:64px;font-family:var(--font-mono);">${label}</span>
      <audio controls src="${audioSrc}" style="flex:1;min-width:0;height:28px;
        accent-color:var(--gold);filter:sepia(30%) hue-rotate(10deg);"></audio>
      <span style="font-size:11px;color:rgba(var(--tc),.4);
        white-space:nowrap;font-family:var(--font-mono);">${duration ? formatTime(duration) : ''}</span>
      <span style="font-size:10px;color:rgba(var(--tc),.28);white-space:nowrap;font-family:var(--font-mono);">
        ${sizeLabel}</span>
      <button onclick="window._micDeleteCard('${id}')" type="button"
        title="Hapus" style="background:none;border:none;cursor:pointer;
        color:rgba(240,90,90,.6);font-size:15px;padding:0 2px;line-height:1;flex-shrink:0;transition:color .15s;"
        onmouseover="this.style.color='#f87171'" onmouseout="this.style.color='rgba(240,90,90,.6)'">x</button>
    `;
    list.appendChild(card);
  }

  window.kronologiImportAudio = async function (input) {
    const files = Array.from(input.files || []);
    if (!files.length) return;
    input.value = '';

    for (const file of files) {
      recordCount++;
      const id = 'rec-' + recordCount;
      const num = recordCount;
      addPlaceholder(id, 'Mengimpor ' + file.name + '...');

      try {
        if (file.size > AUDIO_IMPORT_MAX_BYTES) {
          if (typeof toast === 'function') toast('File audio besar pilih lewat Data Manager.');
          removePlaceholder(id);
          continue;
        }

        let mime = file.type || '';
        if (!mime || mime === 'audio/x-m4a' || mime === 'audio/m4a') mime = 'audio/mp4';
        const blob = mime !== file.type ? new Blob([await file.arrayBuffer()], { type: mime }) : file;
        const meta = await cacheAudioBlob(blob, file.name);
        const audioUrl = meta.file_url || URL.createObjectURL(blob);
        window._micStore.push({
          id,
          audio_b64: '',
          audio_path: meta.path || '',
          audio_url: audioUrl,
          duration: 0,
          filename: meta.name || file.name,
          mime: meta.mime || mime,
          size: meta.size || file.size
        });
        window._userHasTyped = true;
        removePlaceholder(id);
        addAudioCard(id, audioUrl, 0, num, meta.name || file.name);
      } catch (e) {
        removePlaceholder(id);
        try { console.error('[MicImport]', e); } catch (_err) { }
      }
    }
  };

  window._micDeleteCard = function (id) {
    document.getElementById('card-' + id)?.remove();
    const rec = (window._micStore || []).find(r => r.id === id);
    if (rec && rec.audio_url && String(rec.audio_url).startsWith('blob:')) {
      URL.revokeObjectURL(rec.audio_url);
    }
    window._micStore = (window._micStore || []).filter(r => r.id !== id);
  };

  window._micAddAudioCard = addAudioCard;

  function clearKronologiAudioStore() {
    try {
      (window._micStore || []).forEach(rec => {
        if (rec && rec.audio_url && String(rec.audio_url).startsWith('blob:')) {
          URL.revokeObjectURL(rec.audio_url);
        }
      });
    } catch (_e) { }
    window._micStore = [];
    recordCount = 0;
    const list = document.getElementById('mic-recordings-list');
    if (list) list.innerHTML = '';
  }
  window._clearKronologiAudioStore = clearKronologiAudioStore;

  function patchCollect() {
    const original = window.collectTab6;
    if (typeof original === 'function' && original.__audioRecorderWrapped) return;
    window.collectTab6 = function () {
      const data = typeof original === 'function' ? original() : {};
      if (!data.riwayat_pidana) data.riwayat_pidana = {};
      data.riwayat_pidana.kronologi_audio =
        window._micStore.length > 0
          ? window._micStore.map(rec => ({
            id: rec.id,
            audio_b64: rec.audio_b64 || '',
            audio_path: rec.audio_path || '',
            audio_url: rec.audio_path ? (rec.audio_url || '') : '',
            duration: rec.duration,
            filename: rec.filename || null,
            mime: rec.mime || null,
            size: rec.size || 0
          }))
          : [];
      return data;
    };
    window.collectTab6.__audioRecorderWrapped = true;
  }

  function patchLoad() {
    const original = window.loadTab6;
    if (typeof original === 'function' && original.__audioRecorderWrapped) return;
    window.loadTab6 = function (data) {
      if (typeof original === 'function') original(data);
      const audios = (data?.riwayat_pidana?.kronologi_audio) || [];
      clearKronologiAudioStore();
      if (!audios.length) return;
      audios.forEach((rec, i) => {
        const pathUrl = rec.audio_path ? encodeURI('file:///' + String(rec.audio_path).replace(/\\/g, '/')) : '';
        const savedUrl = (rec.audio_url && !String(rec.audio_url).startsWith('blob:')) ? rec.audio_url : '';
        const entry = {
          id: rec.id || ('rec-loaded-' + i),
          audio_b64: rec.audio_b64 || '',
          audio_path: rec.audio_path || '',
          audio_url: savedUrl || pathUrl,
          duration: rec.duration || 0,
          filename: rec.filename || null,
          mime: rec.mime || null,
          size: rec.size || 0
        };
        window._micStore.push(entry);
        if (entry.audio_b64 || entry.audio_url) {
          addAudioCard(entry.id, entry.audio_b64 || entry.audio_url, entry.duration, i + 1, entry.filename);
        }
      });
      recordCount = audios.length;
    };
    window.loadTab6.__audioRecorderWrapped = true;
  }

  function updateAiKronBtn() {
    const suffix = moduleSuffix();
    const btn = document.getElementById('btn-ai-kronologi-' + suffix);
    if (btn) btn.style.display = (window._micStore && window._micStore.length > 0) ? 'flex' : 'none';
  }

  function installAudioRecorder() {
    patchCollect();
    patchLoad();

    const list = document.getElementById('mic-recordings-list');
    if (list) new MutationObserver(updateAiKronBtn).observe(list, { childList: true, subtree: false });

    const originalDelete = window._micDeleteCard;
    window._micDeleteCard = function (id) {
      if (typeof originalDelete === 'function') originalDelete(id);
      setTimeout(updateAiKronBtn, 50);
    };

    setTimeout(updateAiKronBtn, 600);
    setTimeout(updateAiKronBtn, 2000);
    setTimeout(updateAiKronBtn, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(installAudioRecorder, 0));
  } else {
    setTimeout(installAudioRecorder, 0);
  }
})();
