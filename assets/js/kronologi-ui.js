// LIBERO: Helper UI pengeditan kronologi pada halaman formulir.
(function () {
  'use strict';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.toggleKronologiStopperMenu = function (suffix) {
    var menu = document.getElementById('kron-stopper-menu-' + suffix);
    if (!menu) return;
    document.querySelectorAll('.kron-stopper-menu.open').forEach(function (m) {
      if (m !== menu) m.classList.remove('open');
    });
    menu.classList.toggle('open');
  };

  window.runKronologiStopper = function (suffix, action) {
    if (window._SFX && window._SFX.fire) window._SFX.fire();
    var menu = document.getElementById('kron-stopper-menu-' + suffix);
    if (menu) menu.classList.remove('open');
    if (action === 'sipp' && typeof window.openSippModal === 'function') window.openSippModal();
    if (action === 'audio' && typeof window.aiAudioToKronologi === 'function') window.aiAudioToKronologi();
    if (action === 'narasi' && typeof window.aiReparseKronologi === 'function') window.aiReparseKronologi();
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

  function ensureKronReviewModal() {
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
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.classList.remove('open');
    });
    overlay.querySelector('#kron-review-close').onclick = function () {
      overlay.classList.remove('open');
    };
    return overlay;
  }

  function showKronReview(currentText, resultText, sourceLabel, modelUsed) {
    return new Promise(function (resolve) {
      var overlay = ensureKronReviewModal();
      var body = overlay.querySelector('#kron-review-body');
      var actions = overlay.querySelector('#kron-review-actions');
      var oldText = String(currentText || '').trim();
      var newText = String(resultText || '').trim();
      var modelText = String(modelUsed || '').trim() || '-';
      var sourceText = String(sourceLabel || 'STOPPER AI').trim();
      body.innerHTML =
        '<div class="wilayah-note"><strong>Model AI:</strong> ' + esc(modelText) + ' | <strong>Sumber:</strong> ' + esc(sourceText) + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
        '<div><div class="wilayah-info-label">Isi Saat Ini</div><div style="white-space:pre-wrap;max-height:260px;overflow:auto;border:1px solid rgba(var(--tc),.12);border-radius:8px;padding:10px;color:rgba(var(--tc),.86)">' + esc(oldText || '-') + '</div></div>' +
        '<div><div class="wilayah-info-label">Hasil STOPPER</div><div style="white-space:pre-wrap;max-height:260px;overflow:auto;border:1px solid rgba(var(--tc),.12);border-radius:8px;padding:10px;color:rgba(var(--tc),.86)">' + esc(newText || '-') + '</div></div>' +
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

  window._kronEsc = esc;
  window._ensureKronReviewModal = ensureKronReviewModal;
  window._showKronReview = showKronReview;
  window._reviewAndApplyKronologi = async function (ta, resultText, sourceLabel, modelUsed) {
    if (!ta || !String(resultText || '').trim()) return false;
    var oldText = String(ta.value || '').trim();
    var action = await showKronReview(oldText, resultText, sourceLabel, modelUsed);
    if (action === 'cancel') return false;
    if (action === 'append' && oldText) ta.value = oldText + '\n' + String(resultText || '').trim();
    else ta.value = String(resultText || '').trim();
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));
    window._userHasTyped = true;
    return true;
  };
})();
