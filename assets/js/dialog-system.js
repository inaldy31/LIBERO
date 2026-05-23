// LIBERO: Sistem dialog modal bersama dan pengaturan fokus.
/* ═══════════════════════════════════════════════════════════════
       LIBERO DIALOG SYSTEM — Custom themed dialogs (navy/gold)
       Menggantikan: confirm(), alert(), prompt() native browser
       v1.0 — by LIBERO Team
    ═══════════════════════════════════════════════════════════════ */
    ; (function (global) {
      'use strict';

      /* Corner SVG helper */
      const CORNER_SVG = `
<svg class="ld-corner-svg" viewBox="0 0 28 28" fill="none">
  <path d="M2 26 L2 2 L26 2" stroke-width="1"/>
</svg>`;

      /* ── Icon presets ── */
      const ICONS = {
        confirm: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
        exit: `<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
        reload: `<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
        back: `<svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
        recovery: `<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
        zoom: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
        warning: `<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        check: `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
      };

      /* ── Core: create & show overlay ── */
      function makeOverlay(innerHTML) {
        const overlay = document.createElement('div');
        overlay.className = 'ld-overlay';
        overlay.style.cssText = [
          'position:fixed',
          'top:0',
          'right:0',
          'bottom:0',
          'left:0',
          'width:100vw',
          'height:100vh',
          'z-index:99000',
          'display:flex',
          'align-items:center',
          'justify-content:center',
          'padding:20px',
          'box-sizing:border-box',
          'overflow:auto',
          'margin:0',
          'transform:none',
          'pointer-events:all',
          'background:rgba(var(--toast-bg,6,18,36),.72)',
          'backdrop-filter:blur(6px)'
        ].join(';');
        overlay.innerHTML = `<div class="ld-box">
    <div class="ld-corner tl">${CORNER_SVG}</div>
    <div class="ld-corner tr">${CORNER_SVG}</div>
    <div class="ld-corner bl">${CORNER_SVG}</div>
    <div class="ld-corner br">${CORNER_SVG}</div>
    ${innerHTML}
  </div>`;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('ld-in')));
        return overlay;
      }

      function closeOverlay(overlay, resolve, value) {
        overlay.classList.remove('ld-in');
        overlay.classList.add('ld-out');
        setTimeout(() => { overlay.remove(); resolve(value); }, 280);
      }

      /* ══════════════════════════════════════════════
         LDialog.confirm(opts) → Promise<boolean>
         opts: { title, message, okText, cancelText, type, icon }
         type: 'default'|'danger'|'warning'
      ══════════════════════════════════════════════ */
      function confirm(opts) {
        if (typeof opts === 'string') opts = { message: opts };
        const {
          title = 'Konfirmasi',
          message = '',
          okText = 'Ya',
          cancelText = 'Batal',
          type = 'default',
          icon = 'confirm',
        } = opts;

        const iconClass = type === 'danger' ? 'ld-danger' : type === 'warning' ? 'ld-warning' : '';
        const okClass = type === 'danger' ? 'ld-btn-danger' : 'ld-btn-primary';

        return new Promise(resolve => {
          const overlay = makeOverlay(`
      <div class="ld-icon-wrap ${iconClass}">${ICONS[icon] || ICONS.confirm}</div>
      <div class="ld-title">${title}</div>
      <div class="ld-msg">${message}</div>
      <div class="ld-divider"></div>
      <div class="ld-btns">
        <button class="ld-btn ld-btn-secondary" id="ld-cancel">${cancelText}</button>
        <button class="ld-btn ${okClass}" id="ld-ok">${okText}</button>
      </div>
    `);
          overlay.querySelector('#ld-ok').onclick = () => closeOverlay(overlay, resolve, true);
          overlay.querySelector('#ld-cancel').onclick = () => closeOverlay(overlay, resolve, false);
          // ESC key
          const onKey = e => { if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); closeOverlay(overlay, resolve, false); } };
          document.addEventListener('keydown', onKey);
        });
      }

      /* ══════════════════════════════════════════════
         LDialog.alert(opts) → Promise<void>
      ══════════════════════════════════════════════ */
      function alert(opts) {
        if (typeof opts === 'string') opts = { message: opts };
        const {
          title = 'Informasi',
          message = '',
          okText = 'OK',
          icon = 'check',
          type = 'default',
        } = opts;
        const iconClass = type === 'success' ? 'ld-success' : type === 'danger' ? 'ld-danger' : '';
        return new Promise(resolve => {
          const overlay = makeOverlay(`
      <div class="ld-icon-wrap ${iconClass}">${ICONS[icon] || ICONS.check}</div>
      <div class="ld-title">${title}</div>
      <div class="ld-msg">${message}</div>
      <div class="ld-divider"></div>
      <div class="ld-btns ld-single">
        <button class="ld-btn ld-btn-primary" id="ld-ok">${okText}</button>
      </div>
    `);
          overlay.querySelector('#ld-ok').onclick = () => closeOverlay(overlay, resolve, undefined);
          const onKey = e => { if (e.key === 'Escape' || e.key === 'Enter') { document.removeEventListener('keydown', onKey); closeOverlay(overlay, resolve, undefined); } };
          document.addEventListener('keydown', onKey);
        });
      }

      /* ══════════════════════════════════════════════
         LDialog.prompt(opts) → Promise<string|null>
         opts: { title, message, defaultValue, placeholder, suffix }
      ══════════════════════════════════════════════ */
      function prompt(opts) {
        if (typeof opts === 'string') opts = { message: opts };
        const {
          title = 'Input',
          message = '',
          defaultValue = '',
          placeholder = '',
          okText = 'OK',
          cancelText = 'Batal',
          icon = 'zoom',
        } = opts;
        return new Promise(resolve => {
          const overlay = makeOverlay(`
      <div class="ld-icon-wrap">${ICONS[icon] || ICONS.zoom}</div>
      <div class="ld-title">${title}</div>
      <div class="ld-msg">${message}</div>
      <div class="ld-input-wrap">
        <input class="ld-input" id="ld-pinput" type="text" value="${defaultValue}" placeholder="${placeholder}" autocomplete="off" spellcheck="false">
      </div>
      <div class="ld-divider"></div>
      <div class="ld-btns">
        <button class="ld-btn ld-btn-secondary" id="ld-cancel">${cancelText}</button>
        <button class="ld-btn ld-btn-primary" id="ld-ok">${okText}</button>
      </div>
    `);
          const input = overlay.querySelector('#ld-pinput');
          setTimeout(() => { input.focus(); input.select(); }, 100);

          const doOk = () => {
            const v = input.value.trim();
            closeOverlay(overlay, resolve, v || null);
          };
          const doCancel = () => closeOverlay(overlay, resolve, null);

          overlay.querySelector('#ld-ok').onclick = doOk;
          overlay.querySelector('#ld-cancel').onclick = doCancel;
          input.addEventListener('keydown', e => {
            if (e.key === 'Enter') doOk();
            if (e.key === 'Escape') doCancel();
          });
        });
      }

      /* ══════════════════════════════════════════════
         LDialog.recovery(opts) → Promise<boolean>
         Special dialog for autosave recovery
      ══════════════════════════════════════════════ */
      function recovery(opts) {
        if (typeof opts === 'string') opts = { time: opts };
        const {
          time = '',
          message = 'Ditemukan data yang belum disimpan dari sesi sebelumnya.',
          okText = 'Lanjutkan Data',
          cancelText = 'Mulai Baru',
        } = opts;
        const timeHtml = time ? `<span class="ld-time">⏱ ${time}</span>` : '';
        return new Promise(resolve => {
          const overlay = makeOverlay(`
      <div class="ld-icon-wrap ld-recovery">${ICONS.recovery}</div>
      <div class="ld-title">Pemulihan Data</div>
      <div class="ld-msg">${message}${timeHtml ? '<br>' + timeHtml : ''}</div>
      <div class="ld-divider"></div>
      <div class="ld-btns">
        <button class="ld-btn ld-btn-secondary" id="ld-cancel">${cancelText}</button>
        <button class="ld-btn ld-btn-recovery" id="ld-ok">${okText}</button>
      </div>
    `);
          overlay.querySelector('#ld-ok').onclick = () => closeOverlay(overlay, resolve, true);
          overlay.querySelector('#ld-cancel').onclick = () => closeOverlay(overlay, resolve, false);
          const onKey = e => { if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); closeOverlay(overlay, resolve, false); } };
          document.addEventListener('keydown', onKey);
        });
      }

      /* ══════════════════════════════════════════════
         LDialog.exit() → Promise<boolean>
         Special exit confirmation
      ══════════════════════════════════════════════ */
      function exit(opts) {
        const {
          title = 'Keluar Aplikasi',
          message = 'Yakin ingin keluar dari LIBERO?\nPastikan semua data telah disimpan.',
          okText = 'Keluar',
          cancelText = 'Batal',
        } = (opts || {});
        return new Promise(resolve => {
          const overlay = makeOverlay(`
      <div class="ld-icon-wrap ld-danger">${ICONS.exit}</div>
      <div class="ld-title">${title}</div>
      <div class="ld-msg">${message}</div>
      <div class="ld-divider"></div>
      <div class="ld-btns">
        <button class="ld-btn ld-btn-secondary" id="ld-cancel">${cancelText}</button>
        <button class="ld-btn ld-btn-danger" id="ld-ok">${okText}</button>
      </div>
    `);
          overlay.querySelector('#ld-ok').onclick = () => closeOverlay(overlay, resolve, true);
          overlay.querySelector('#ld-cancel').onclick = () => closeOverlay(overlay, resolve, false);
          const onKey = e => { if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); closeOverlay(overlay, resolve, false); } };
          document.addEventListener('keydown', onKey);
        });
      }

      /* ── Expose ── */
      global.LDialog = { confirm, alert, prompt, recovery, exit };
      global._showConfirm = function (msg) {
        return confirm({ message: msg });
      };

    })(window);

    /* ── Inject dialog+theme CSS segera saat DOM siap (bukan nunggu dialog pertama) ── */
    (function () {
      function _inject() { if (typeof ensureStyles === 'function') ensureStyles(); }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _inject);
      } else {
        _inject();
      }
    })();


