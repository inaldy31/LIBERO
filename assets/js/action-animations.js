// LIBERO: Helper animasi bersama untuk tombol dan interaksi.
    /* ═══════════════════════════════════════════════════════════════
       LIBERO ACTION ANIMATIONS
       Animasi untuk: Simpan · Lanjutkan · Selesaikan · Upload TTD/Foto/Audio
       v1.0
    ═══════════════════════════════════════════════════════════════ */
    ; (function () {

      /* ── CSS ── */
      var _css = `
/* ════ TOPBAR BUTTON LOADING STATE ════ */
.tb-btn._lbr-loading {
  pointer-events: none !important;
  opacity: .75;
}
.tb-btn._lbr-loading svg {
  animation: _lbr-spin .8s linear infinite;
}
.tb-btn._lbr-flash-gold {
  animation: _lbr-btn-flash-gold .55s ease forwards;
}
.tb-btn._lbr-flash-blue {
  animation: _lbr-btn-flash-blue .55s ease forwards;
}
.tb-btn._lbr-flash-green {
  animation: _lbr-btn-flash-green .55s ease forwards;
}
@keyframes _lbr-spin { to { transform: rotate(360deg); } }
@keyframes _lbr-btn-flash-gold {
  0%   { background: rgba(225,183,73,.08);  box-shadow: none; }
  35%  { background: rgba(225,183,73,.42);  box-shadow: 0 0 28px rgba(225,183,73,.55), 0 0 8px rgba(225,183,73,.4); transform: scale(1.05); }
  100% { background: rgba(225,183,73,.18);  box-shadow: 0 0 8px rgba(225,183,73,.18);  transform: scale(1); }
}
@keyframes _lbr-btn-flash-blue {
  0%   { background: rgba(100,180,255,.06); box-shadow: none; }
  35%  { background: rgba(100,180,255,.38); box-shadow: 0 0 28px rgba(100,180,255,.5),  0 0 8px rgba(100,180,255,.4); transform: scale(1.05); }
  100% { background: rgba(100,180,255,.1);  box-shadow: 0 0 8px rgba(100,180,255,.12);  transform: scale(1); }
}
@keyframes _lbr-btn-flash-green {
  0%   { background: rgba(74,196,104,.06);  box-shadow: none; }
  35%  { background: rgba(74,196,104,.38);  box-shadow: 0 0 28px rgba(74,196,104,.5),   0 0 8px rgba(74,196,104,.4); transform: scale(1.05); }
  100% { background: rgba(74,196,104,.12);  box-shadow: 0 0 8px rgba(74,196,104,.1);    transform: scale(1); }
}

/* ════ SCREEN FLASH OVERLAY ════ */
#_lbr-flash-overlay {
  position: fixed; inset: 0;
  z-index: 99998;
  pointer-events: none;
  opacity: 0;
}
#_lbr-flash-overlay._lbr-fo-active {
  animation: _lbr-screen-flash .6s ease forwards;
}
@keyframes _lbr-screen-flash {
  0%   { opacity: 0; }
  18%  { opacity: 1; }
  100% { opacity: 0; }
}

/* ════ UPLOAD SUCCESS ANIMATIONS ════ */
/* TTD / image preview bounce */
@keyframes _lbr-preview-pop {
  0%   { transform: scale(.82) translateY(6px); opacity: .4; }
  55%  { transform: scale(1.06) translateY(-3px); opacity: 1; }
  75%  { transform: scale(.97); }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
@keyframes _lbr-preview-glow-green {
  0%   { box-shadow: 0 0 0   0   rgba(74,196,104,0); }
  45%  { box-shadow: 0 0 22px 5px rgba(74,196,104,.45); }
  100% { box-shadow: 0 0 0   0   rgba(74,196,104,0); }
}
@keyframes _lbr-preview-glow-gold {
  0%   { box-shadow: 0 0 0   0   rgba(225,183,73,0); }
  45%  { box-shadow: 0 0 22px 5px rgba(225,183,73,.5); }
  100% { box-shadow: 0 0 0   0   rgba(225,183,73,0); }
}
._lbr-upload-anim {
  animation: _lbr-preview-pop .52s cubic-bezier(.16,1.4,.3,1) both,
             _lbr-preview-glow-green .9s ease .1s both !important;
}
._lbr-upload-anim-gold {
  animation: _lbr-preview-pop .52s cubic-bezier(.16,1.4,.3,1) both,
             _lbr-preview-glow-gold .9s ease .1s both !important;
}

/* audio card slide-in */
@keyframes _lbr-audio-slidein {
  0%   { opacity:0; transform: translateX(-18px) scale(.95); }
  100% { opacity:1; transform: translateX(0) scale(1); }
}
._lbr-audio-anim {
  animation: _lbr-audio-slidein .4s cubic-bezier(.16,1,.3,1) both !important;
}

/* ════ EXPLORER OPEN RIPPLE ════ */
@keyframes _lbr-explorer-ripple {
  0%   { transform: scale(0);   opacity: .7; }
  100% { transform: scale(3.5); opacity: 0; }
}
._lbr-btn-ripple-wrap { position: relative; overflow: hidden; }
._lbr-btn-ripple {
  position: absolute;
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,.22);
  pointer-events: none;
  margin-left: -20px; margin-top: -20px;
  animation: _lbr-explorer-ripple .5s ease forwards;
}
`;
      var styleEl = document.createElement('style');
      styleEl.id = '_lbr-action-anim-css';
      styleEl.textContent = _css;
      document.head.appendChild(styleEl);

      /* ── Flash overlay element ── */
      var _fo = document.createElement('div');
      _fo.id = '_lbr-flash-overlay';
      document.body.appendChild(_fo);

      /* ════ HELPERS ════ */

      /* Flash screen with color */
      function _screenFlash(color) {
        _fo.style.background = color || 'rgba(225,183,73,.06)';
        _fo.classList.remove('_lbr-fo-active');
        void _fo.offsetWidth; /* reflow */
        _fo.classList.add('_lbr-fo-active');
        setTimeout(function () { _fo.classList.remove('_lbr-fo-active'); }, 700);
      }

      /* Set button loading state, run async fn, then restore + flash */
      function _btnAction(selector, flashClass, screenColor, asyncFn) {
        var btn = document.querySelector(selector);
        if (!btn) { asyncFn && asyncFn(); return; }

        var origHTML = btn.innerHTML;
        btn.classList.add('_lbr-loading');

        asyncFn && asyncFn().then(function () {
          btn.classList.remove('_lbr-loading');
          btn.classList.remove('_lbr-flash-gold', '_lbr-flash-blue', '_lbr-flash-green');
          void btn.offsetWidth;
          btn.classList.add(flashClass);
          if (screenColor) _screenFlash(screenColor);
          setTimeout(function () {
            btn.classList.remove(flashClass);
          }, 600);
        }).catch(function () {
          btn.classList.remove('_lbr-loading');
        });
      }

      /* Animate an element with upload pop */
      function _animUpload(el, gold) {
        if (!el) return;
        var cls = gold ? '_lbr-upload-anim-gold' : '_lbr-upload-anim';
        el.classList.remove('_lbr-upload-anim', '_lbr-upload-anim-gold');
        void el.offsetWidth;
        el.classList.add(cls);
        setTimeout(function () { el.classList.remove(cls); }, 1200);
      }

      /* Ripple on a button (e.g. toast action buttons, explorer btn) */
      function _btnRipple(btn, e) {
        btn.classList.add('_lbr-btn-ripple-wrap');
        var r = document.createElement('span');
        r.className = '_lbr-btn-ripple';
        var rect = btn.getBoundingClientRect();
        r.style.left = ((e ? e.clientX : rect.left + rect.width / 2) - rect.left) + 'px';
        r.style.top = ((e ? e.clientY : rect.top + rect.height / 2) - rect.top) + 'px';
        btn.appendChild(r);
        setTimeout(function () { r.remove(); }, 520);
      }

      /* ════ WRAP KEY COMMANDS ════ */

      function _wrapCmds() {

        /* ── Simpan Data (gold flash) ── */
        var _origSimpan = window.cmd_simpan;
        if (_origSimpan && !_origSimpan._lbrWrapped) {
          window.cmd_simpan = function () {
            _btnAction('.tb-btn-save', '_lbr-flash-gold', 'rgba(225,183,73,.07)', function () {
              return Promise.resolve(_origSimpan.call(this));
            }.bind(this));
          };
          window.cmd_simpan._lbrWrapped = true;
        }

        /* ── Lanjutkan Data (blue flash) ── */
        var _origLanjut = window.cmd_lanjutkan;
        if (_origLanjut && !_origLanjut._lbrWrapped) {
          window.cmd_lanjutkan = function () {
            _btnAction('.tb-btn-load', '_lbr-flash-blue', 'rgba(100,180,255,.07)', function () {
              return Promise.resolve(_origLanjut.call(this));
            }.bind(this));
          };
          window.cmd_lanjutkan._lbrWrapped = true;
        }

        /* ── Selesaikan (green flash) ── */
        var _origSelesai = window.cmd_selesaikan;
        if (_origSelesai && !_origSelesai._lbrWrapped) {
          window.cmd_selesaikan = function () {
            _btnAction('.tb-btn-finish', '_lbr-flash-green', 'rgba(74,196,104,.07)', function () {
              return Promise.resolve(_origSelesai.call(this));
            }.bind(this));
          };
          window.cmd_selesaikan._lbrWrapped = true;
        }

        /* ── onTTDUpload: animate TTD preview after upload ── */
        var _origTTD = window.onTTDUpload;
        if (_origTTD && !_origTTD._lbrWrapped) {
          window.onTTDUpload = function (input) {
            var result = _origTTD.call(this, input);
            /* Animate after reader.onload has a chance to run */
            setTimeout(function () {
              var preview = document.getElementById('ttd-preview-img');
              var wrap = document.getElementById('ttd-preview-wrap');
              _animUpload(preview);
              _animUpload(wrap);
              _screenFlash('rgba(74,196,104,.06)');
            }, 80);
            return result;
          };
          window.onTTDUpload._lbrWrapped = true;
        }
      }

      /* ════ WRAP UPLOAD TOAST CALLS ════ */
      /* Animate TTD/foto/audio preview when toast fires via LBR bridge */
      function _patchUploadToasts() {
        var _origToast = window.toast;
        if (!_origToast || _origToast._lbrUploadPatched) return;

        window.toast = function (msg, dur) {
          _origToast.call(this, msg, dur);
          var m = String(msg || '').toLowerCase();

          /* TTD */
          if (/tanda.tangan.*berhasil|ttd.*berhasil/.test(m)) {
            setTimeout(function () {
              _animUpload(document.getElementById('ttd-preview-img'));
              _animUpload(document.getElementById('ttd-preview-wrap'));
              _screenFlash('rgba(74,196,104,.06)');
            }, 60);
          }
          /* Foto */
          else if (/foto.*berhasil/.test(m)) {
            setTimeout(function () {
              /* find the most recently added dok-preview */
              var imgs = document.querySelectorAll('.dok-preview');
              if (imgs.length) _animUpload(imgs[imgs.length - 1]);
              _screenFlash('rgba(74,196,104,.05)');
            }, 60);
          }
          /* Audio */
          else if (/audio.*berhasil/.test(m)) {
            setTimeout(function () {
              var list = document.getElementById('mic-recordings-list');
              if (list) {
                var cards = list.querySelectorAll('[id^="card-"]');
                if (cards.length) {
                  var card = cards[cards.length - 1];
                  card.classList.remove('_lbr-audio-anim');
                  void card.offsetWidth;
                  card.classList.add('_lbr-audio-anim');
                  setTimeout(function () { card.classList.remove('_lbr-audio-anim'); }, 600);
                }
              }
              _screenFlash('rgba(74,196,104,.05)');
            }, 60);
          }
          /* Data dimuat (onDataLoaded) */
          else if (/data berhasil dimuat/.test(m)) {
            _screenFlash('rgba(100,180,255,.08)');
          }
        };
        window.toast._lbrUploadPatched = true;
      }

      /* ════ RIPPLE ON TOAST-DOC BUTTONS ════ */
      function _patchToastDocBtns() {
        document.addEventListener('click', function (e) {
          var btn = e.target.closest('._toast-act-btn');
          if (btn) {
            _btnRipple(btn, e);
            /* screen flash for open/folder actions */
            var txt = (btn.textContent || '').toLowerCase();
            if (/folder/.test(txt)) _screenFlash('rgba(225,183,73,.07)');
            else if (/dokumen|file|open/.test(txt)) _screenFlash('rgba(74,196,104,.06)');
          }
        }, true);
      }

      /* ════ INIT ════ */
      function _init() {
        _wrapCmds();
        _patchUploadToasts();
        _patchToastDocBtns();
      }

      /* Wait for other scripts to define cmd_simpan etc. */
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
          setTimeout(_init, 200);
        });
      } else {
        setTimeout(_init, 200);
      }

      /* Re-patch if funcs get re-defined later */
      setTimeout(_init, 1200);

    })();
  
