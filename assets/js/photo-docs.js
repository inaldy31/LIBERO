// LIBERO: Helper unggah, pratinjau, kompresi, dan koleksi foto dokumentasi.
var _dokState = window._dokState || { klien: [], penjamin: [], lainnya: [] };
var _dokRowId = Number(window._dokRowId || 0);
window._dokState = _dokState;
window._dokRowId = _dokRowId;

function _dataUrlApproxBytes(dataUrl) {
  try {
    const b64 = String(dataUrl || '').split(',')[1] || '';
    const pad = (b64.match(/=+$/) || [''])[0].length;
    return Math.max(0, Math.floor((b64.length * 3) / 4) - pad);
  } catch (_e) {
    return 0;
  }
}

function _fmtKB(bytes) {
  return `${Math.max(1, Math.round((bytes || 0) / 1024))} KB`;
}

function _compressImageDataUrl(dataUrl, opts = {}) {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    mime = 'image/jpeg',
    quality = 0.78,
    fill = '#ffffff',
    origBytes = _dataUrlApproxBytes(dataUrl)
  } = opts || {};

  return new Promise((resolve, reject) => {
    const src = String(dataUrl || '');
    if (!src.startsWith('data:image/')) {
      resolve({
        dataUrl: src,
        origBytes,
        newBytes: _dataUrlApproxBytes(src),
        width: 0,
        height: 0
      });
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        let sw = img.naturalWidth || img.width || 0;
        let sh = img.naturalHeight || img.height || 0;
        if (!sw || !sh) {
          resolve({
            dataUrl: src,
            origBytes,
            newBytes: _dataUrlApproxBytes(src),
            width: sw,
            height: sh
          });
          return;
        }

        const scale = Math.min(1, maxWidth / sw, maxHeight / sh);
        const tw = Math.max(1, Math.round(sw * scale));
        const th = Math.max(1, Math.round(sh * scale));
        const canvas = document.createElement('canvas');
        canvas.width = tw;
        canvas.height = th;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          resolve({
            dataUrl: src,
            origBytes,
            newBytes: _dataUrlApproxBytes(src),
            width: sw,
            height: sh
          });
          return;
        }

        if (mime === 'image/jpeg') {
          ctx.fillStyle = fill;
          ctx.fillRect(0, 0, tw, th);
        }
        ctx.drawImage(img, 0, 0, tw, th);

        let out = src;
        try {
          out = canvas.toDataURL(mime, quality);
        } catch (_e) {
          out = src;
        }

        resolve({
          dataUrl: out,
          origBytes,
          newBytes: _dataUrlApproxBytes(out),
          width: tw,
          height: th
        });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => resolve({
      dataUrl: src,
      origBytes,
      newBytes: _dataUrlApproxBytes(src),
      width: 0,
      height: 0
    });
    img.src = src;
  });
}

function _compressImageFile(file, opts = {}) {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    mime = 'image/jpeg',
    quality = 0.78,
    fill = '#ffffff'
  } = opts || {};

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      const src = e.target.result;
      const img = new Image();

      img.onload = () => {
        try {
          let sw = img.naturalWidth || img.width || 0;
          let sh = img.naturalHeight || img.height || 0;
          if (!sw || !sh) {
            resolve({
              dataUrl: src,
              origBytes: file.size || 0,
              newBytes: file.size || 0,
              width: sw,
              height: sh
            });
            return;
          }

          const scale = Math.min(1, maxWidth / sw, maxHeight / sh);
          const tw = Math.max(1, Math.round(sw * scale));
          const th = Math.max(1, Math.round(sh * scale));

          const canvas = document.createElement('canvas');
          canvas.width = tw;
          canvas.height = th;

          const ctx = canvas.getContext('2d', { alpha: true });
          if (!ctx) {
            resolve({
              dataUrl: src,
              origBytes: file.size || 0,
              newBytes: file.size || 0,
              width: sw,
              height: sh
            });
            return;
          }

          if (mime === 'image/jpeg') {
            ctx.fillStyle = fill;
            ctx.fillRect(0, 0, tw, th);
          }

          ctx.drawImage(img, 0, 0, tw, th);

          let out = src;
          try {
            out = canvas.toDataURL(mime, quality);
          } catch (_e) {
            out = src;
          }

          resolve({
            dataUrl: out,
            origBytes: file.size || 0,
            newBytes: _dataUrlApproxBytes(out),
            width: tw,
            height: th
          });
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => resolve({
        dataUrl: src,
        origBytes: file.size || 0,
        newBytes: file.size || 0,
        width: 0,
        height: 0
      });

      img.src = src;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

window._compressImageDataUrl = _compressImageDataUrl;
window._compressImageFile = _compressImageFile;

function _dokMarkChanged() {
  try { window._userHasTyped = true; window.__lastUserEditAt = Date.now(); } catch (_e) { }
  try { updateProgress(); } catch (_e) { }
  try { document.dispatchEvent(new Event('input', { bubbles: true })); } catch (_e) { }
  try { document.dispatchEvent(new Event('change', { bubbles: true })); } catch (_e) { }
}

function onLampirDokChange() {
  const val = (document.getElementById('f12-lampir-dok')?.value || '');
  const cond = document.getElementById('cond-dokumentasi');
  if (cond) cond.style.display = (val === 'Ya') ? 'block' : 'none';
  try { updateProgress(); } catch (_e) { }
}

function addDokRow(group) {
  const containerId = `dok-${group}-rows`;
  const container = document.getElementById(containerId);
  if (!container) return;

  const rid = ++_dokRowId;
  window._dokRowId = _dokRowId;
  if (!_dokState[group]) _dokState[group] = [];
  const item = { id: rid, group, foto_b64: '', nama: '' };
  _dokState[group].push(item);

  const row = document.createElement('div');
  row.className = 'dok-row';
  row.id = 'dok-row-' + rid;

  const isNamed = (group === 'lainnya');
  const label = (group === 'klien') ? 'Foto Klien' : (group === 'penjamin') ? 'Foto Penjamin' : 'Foto';

  row.innerHTML = `
    <div class="dok-photo-wrap">
      <span class="dok-label" id="dok-lbl-${rid}">${label}</span>
      <div class="dok-preview-placeholder" id="dok-prev-wrap-${rid}">
        <svg style="width:20px;height:20px;fill:none;stroke:rgba(225,183,73,.3);stroke-width:1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      </div>
    </div>
    <div class="dok-row-actions">
      ${isNamed ? `<input class="dok-name-inp" placeholder="Nama dokumentasi" id="dok-nama-${rid}"
        oninput="_dokUpdateNama(${rid},this.value)" spellcheck="false">` : ``}
      <label class="dok-file-lbl">
        Pilih Foto
        <input type="file" accept="image/*" style="display:none" onchange="_onDokFileChange(${rid},this)" spellcheck="false">
      </label>
      <button class="dok-del-btn" onclick="_removeDokRow(${rid},'${group}')">Hapus</button>
    </div>
  `;
  container.appendChild(row);
  _dokMarkChanged();
}

function _dokUpdateNama(rid, val) {
  const item = Object.values(_dokState).flat().find(i => i.id === rid);
  if (item) item.nama = val;
  const lbl = document.getElementById('dok-lbl-' + rid);
  if (lbl) lbl.textContent = val ? `Foto ${val}` : 'Foto';
  _dokMarkChanged();
}

async function _onDokFileChange(rid, input) {
  const file = input.files && input.files[0];
  if (!file) return;

  try {
    const packed = await _compressImageFile(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      mime: 'image/jpeg',
      quality: 0.78
    });

    const b64 = packed.dataUrl;
    const item = Object.values(_dokState).flat().find(i => i.id === rid);
    if (item) item.foto_b64 = b64;

    const wrap = document.getElementById('dok-prev-wrap-' + rid);
    if (wrap) {
      wrap.innerHTML = `<img class="dok-preview" src="${b64}" alt="Foto">`;
      wrap.title = `${_fmtKB(packed.origBytes)} -> ${_fmtKB(packed.newBytes)}`;
    }
    _dokMarkChanged();
  } catch (_e) {
    toastError('Gagal memproses foto dokumentasi.');
  }
}

function _removeDokRow(rid, group) {
  const list = _dokState[group] || [];
  const idx = list.findIndex(i => i.id === rid);
  if (idx >= 0) list.splice(idx, 1);
  const row = document.getElementById('dok-row-' + rid);
  if (row) row.remove();
  _dokMarkChanged();
}
