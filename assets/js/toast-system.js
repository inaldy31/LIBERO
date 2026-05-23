// LIBERO: Sistem notifikasi toast bersama.
// LIBERO: Sistem toast bersama.
/* TOAST NOTIFICATION */
    (function () {
      if (window.__LIBERO_TOAST_READY ||
        (typeof window.toast === 'function' && document.querySelector('.toast-wrap'))) {
        window.__LIBERO_TOAST_READY = true;
        return;
      }
      window.__LIBERO_TOAST_READY = true;

      var _stack = [];
      var _visible = null;
      var _timer = null;

      /* create wrapper */
      var _wrap = document.createElement('div');
      _wrap.className = 'toast-wrap';
      document.body.appendChild(_wrap);

      function _applyWrapStyle(wrap) {
        if (!wrap) return;
        wrap.style.position = 'fixed';
        wrap.style.left = '50%';
        wrap.style.right = 'auto';
        wrap.style.top = '50%';
        wrap.style.bottom = 'auto';
        wrap.style.zIndex = '2147483600';
        wrap.style.width = 'auto';
        wrap.style.maxWidth = 'calc(100vw - 32px)';
        wrap.style.maxHeight = 'calc(100vh - 96px)';
        wrap.style.display = 'flex';
        wrap.style.flexDirection = 'column';
        wrap.style.alignItems = 'center';
        wrap.style.justifyContent = 'center';
        wrap.style.gap = '10px';
        wrap.style.padding = '0';
        wrap.style.boxSizing = 'border-box';
        wrap.style.pointerEvents = 'none';
        wrap.style.overflow = 'visible';
        wrap.style.transform = 'translate(-50%, -50%)';
      }

      function _ensureWrap() {
        if (!_wrap || !_wrap.parentNode) {
          _wrap = document.querySelector('.toast-wrap') || document.createElement('div');
          _wrap.className = (_wrap.className || 'toast-wrap').indexOf('toast-wrap') >= 0 ? _wrap.className : 'toast-wrap';
        }
        if (_wrap.parentNode !== document.body || document.body.lastElementChild !== _wrap) {
          document.body.appendChild(_wrap);
        }
        _applyWrapStyle(_wrap);
        return _wrap;
      }
      _applyWrapStyle(_wrap);

      var ICONS_TOAST = {
        success: '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
        error: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        warning: '<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        progress: '<svg viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
        save: '<svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
      };

      var LABELS = {
        success: 'Berhasil', error: 'Gagal', warning: 'Perhatian',
        info: 'Info', progress: 'Memproses', save: 'Data Tersimpan',
      };

      function _detectType(msg) {
        var m = msg.toLowerCase();
        if (/berhasil|tersimpan|sukses|✓/.test(m)) return 'success';
        if (/gagal|error|tidak ditemukan|tidak ada/.test(m)) return 'error';
        if (/belum|coba lagi|kosong|pilih|masukkan|isi /.test(m)) return 'warning';
        if (/membuat|membuka|memuat|memproses|\.\.\./.test(m)) return 'progress';
        return 'info';
      }

      function _dismiss(el) {
        if (!el || !el.parentNode) return;
        el.classList.remove('in');
        el.classList.add('out');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
      }

      function _clearAll() {
        clearTimeout(_timer);
        var wrap = _ensureWrap();
        var items = wrap.querySelectorAll('._toast-item');
        items.forEach(function (el) { _dismiss(el); });
        _visible = null;
      }

      function _show(msg, type, duration, label) {
        type = type || _detectType(msg);
        duration = duration || (type === 'progress' ? 6000 : type === 'error' ? 4500 : 3000);
        label = label !== undefined ? label : LABELS[type] || '';

        _clearAll();

        var el = document.createElement('div');
        el.className = '_toast-item _toast-' + type;
        var labelHtml = label ? '<div class="_toast-label">' + label + '</div>' : '';
        el.innerHTML =
          '<div class="_toast-icon">' + (ICONS_TOAST[type] || ICONS_TOAST.info) + '</div>' +
          '<div class="_toast-text">' + labelHtml + '<div class="_toast-body">' + msg + '</div></div>' +
          '<div class="_toast-bar"></div>';

        el.style.pointerEvents = 'all';
        el.style.cursor = 'pointer';
        el.addEventListener('click', function () { _dismiss(el); clearTimeout(_timer); _visible = null; });

        var wrap = _ensureWrap();
        wrap.appendChild(el);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.classList.add('in');
            var bar = el.querySelector('._toast-bar');
            if (bar) {
              setTimeout(function () {
                bar.style.transition = 'transform ' + ((duration || 3000) / 1000).toFixed(2) + 's linear';
                requestAnimationFrame(function () { bar.classList.add('depleting'); });
              }, 32);
            }
          });
        });

        _visible = el;
        clearTimeout(_timer);
        _timer = setTimeout(function () { _dismiss(el); _visible = null; }, duration);
      }

      window.toast = function (msg, dur) { _show(msg, null, dur); };
      window.toastSuccess = function (msg, dur) { _show(msg, 'success', dur); };
      window.toastError = function (msg, dur) { _show(msg, 'error', dur); };
      window.toastWarning = function (msg, dur) { _show(msg, 'warning', dur); };
      window.toastInfo = function (msg, dur) { _show(msg, 'info', dur); };
      window.toastProgress = function (msg, dur) { _show(msg, 'progress', dur); };
      window.toastClear = function () { _clearAll(); };

      var _BTN_ICONS = {
        folder: '<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
        file: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        open: '<svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
        copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        close: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      };

      window.toastDoc = function (opts) {
        if (typeof opts === 'string') opts = { msg: opts };
        var msg = opts.msg || opts.message || '';
        var label = opts.label !== undefined ? opts.label : 'DOKUMEN';
        var dur = opts.dur || opts.duration || 8000;
        var buttons = opts.buttons || [];

        _clearAll();

        var el = document.createElement('div');
        el.className = '_toast-item _toast-doc';
        el.style.width = 'fit-content';
        el.style.maxWidth = buttons.length ? 'min(540px, calc(100vw - 40px))' : 'min(520px, calc(100vw - 40px))';

        var labelHtml = label ? '<div class="_toast-label">' + label + '</div>' : '';
        var actsHtml = '';
        if (buttons.length) {
          actsHtml = '<div class="_toast-actions">';
          buttons.forEach(function (btn, i) {
            var iconSvg = _BTN_ICONS[btn.icon || 'file'] || _BTN_ICONS.file;
            actsHtml += '<button type="button" class="_toast-act-btn" data-toast-btn="' + i + '">' + iconSvg + btn.text + '</button>';
          });
          actsHtml += '</div>';
        }

        var docIcon = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>';
        el.innerHTML =
          '<div class="_toast-icon">' + docIcon + '</div>' +
          '<div class="_toast-inner">' +
          '<div class="_toast-text">' + labelHtml + '<div class="_toast-body">' + msg + '</div></div>' +
          actsHtml +
          '</div>' +
          '<div class="_toast-bar"></div>';

        el.querySelectorAll('._toast-act-btn').forEach(function (btn) {
          var idx = parseInt(btn.getAttribute('data-toast-btn'), 10);
          btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (buttons[idx] && typeof buttons[idx].onClick === 'function') {
              buttons[idx].onClick();
            }
          });
        });

        el.style.pointerEvents = 'all';
        el.style.cursor = 'default';
        el.addEventListener('click', function (e) {
          if (!e.target.closest('._toast-act-btn')) {
            _dismiss(el); clearTimeout(_timer); _visible = null;
          }
        });

        var wrap = _ensureWrap();
        wrap.appendChild(el);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.classList.add('in');
            var bar = el.querySelector('._toast-bar');
            if (bar) {
              setTimeout(function () {
                bar.style.transition = 'transform ' + (dur / 1000).toFixed(2) + 's linear';
                requestAnimationFrame(function () { bar.classList.add('depleting'); });
              }, 32);
            }
          });
        });

        _visible = el;
        clearTimeout(_timer);
        _timer = setTimeout(function () { _dismiss(el); _visible = null; }, dur);
      };
      window._fmtAutosaveTime = function (waktu) {
        var s = String(waktu || '').trim();
        if (!s) return '';
        s = s.replace(/\s+(WIB|WITA|WIT)\b/ig, '').trim();
        s = s.replace(/\s{2,}/g, ' ');
        return s;
      };

      window.toastSave = function (waktu, dur) {
        var clean = window._fmtAutosaveTime
          ? window._fmtAutosaveTime(waktu)
          : String(waktu || '').trim();

        var body = clean
          ? 'Tersimpan pukul ' + clean
          : 'Semua data berhasil disimpan';

        _show(body, 'save', dur || 3200);
      };

      console.info('[toast] ready');
    })();

