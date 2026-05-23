// LIBERO: Helper animasi tombol unggah untuk kontrol media formulir.
    /* ═══════════════════════════════════════════════════════════════
       LIBERO — Upload Button Click Animations
       TTD · Foto Dok · Import Audio · Dokumentasi toggle
    ═══════════════════════════════════════════════════════════════ */
    ; (function () {

      /* ── CSS ── */
      var _s = document.createElement('style');
      _s.textContent = `
  /* ── Press + glow on open ── */
  @keyframes _ub-press {
    0%   { transform: scale(1); }
    35%  { transform: scale(.93); filter: brightness(1.35); }
    65%  { transform: scale(1.04); }
    100% { transform: scale(1); }
  }
  @keyframes _ub-press-gold {
    0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--ac),0); }
    35%  { transform: scale(.94); box-shadow: 0 0 0 0 rgba(var(--ac),0); }
    60%  { transform: scale(1.05); box-shadow: 0 0 18px 4px rgba(var(--ac),.55); }
    100% { transform: scale(1);   box-shadow: 0 0 0 0 rgba(var(--ac),0); }
  }
  @keyframes _ub-press-audio {
    0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--ac),0); }
    35%  { transform: scale(.92); }
    60%  { transform: scale(1.06); box-shadow: 0 0 20px 5px rgba(var(--ac),.5); }
    100% { transform: scale(1);   box-shadow: 0 0 0 0 rgba(var(--ac),0); }
  }
  /* spin the icon inside while "loading" */
  @keyframes _ub-icon-spin {
    to { transform: rotate(360deg); }
  }
  /* ripple */
  @keyframes _ub-ripple {
    0%   { transform: scale(0); opacity: .7; }
    100% { transform: scale(3); opacity: 0; }
  }

  /* ── TTD button ── */
  .tpp-upload-btn._ub-active {
    animation: _ub-press-gold .38s cubic-bezier(.16,1.4,.3,1) both !important;
    pointer-events: none;
  }
  .tpp-upload-btn._ub-active svg {
    animation: _ub-icon-spin .6s linear infinite !important;
  }

  /* ── Foto dok button ── */
  .dok-file-lbl._ub-active {
    animation: _ub-press-gold .36s cubic-bezier(.16,1.4,.3,1) both !important;
    pointer-events: none;
    opacity: .75;
  }

  /* ── Audio import button ── */
  .btn-import-audio._ub-active {
    animation: _ub-press-audio .4s cubic-bezier(.16,1.4,.3,1) both !important;
    pointer-events: none;
  }
  .btn-import-audio._ub-active svg {
    animation: _ub-icon-spin .7s linear infinite !important;
  }

  /* ── Ripple container ── */
  ._ub-ripple-host { position: relative; overflow: hidden; }
  ._ub-ripple-dot {
    position: absolute;
    width: 36px; height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,.22);
    pointer-events: none;
    margin-left: -18px; margin-top: -18px;
    animation: _ub-ripple .42s ease forwards;
  }

  /* ── Dokumentasi section slide-in ── */
  @keyframes _ub-dok-in {
    0%   { opacity: 0; transform: translateY(-10px) scaleY(.95); max-height: 0; }
    100% { opacity: 1; transform: translateY(0)     scaleY(1);   max-height: 9999px; }
  }
  #cond-dokumentasi._ub-dok-visible {
    animation: _ub-dok-in .42s cubic-bezier(.16,1,.3,1) both;
    transform-origin: top center;
  }

  /* ── Screen flash ── */
  #_ub-flash {
    position: fixed; inset: 0; z-index: 99997;
    pointer-events: none; opacity: 0;
  }
  #_ub-flash._ub-flash-on { animation: _ub-screen-flash .55s ease forwards; }
  @keyframes _ub-screen-flash {
    0%   { opacity: 0; }
    22%  { opacity: 1; }
    100% { opacity: 0; }
  }
`;
      document.head.appendChild(_s);

      /* Flash overlay */
      var _fo = document.createElement('div');
      _fo.id = '_ub-flash';
      document.body.appendChild(_fo);

      function _flash(color) {
        _fo.style.background = color || 'rgba(225,183,73,.07)';
        _fo.classList.remove('_ub-flash-on');
        void _fo.offsetWidth;
        _fo.classList.add('_ub-flash-on');
        setTimeout(function () { _fo.classList.remove('_ub-flash-on'); }, 600);
      }

      /* Ripple on element */
      function _ripple(el, e) {
        el.classList.add('_ub-ripple-host');
        var r = document.createElement('span');
        r.className = '_ub-ripple-dot';
        var rect = el.getBoundingClientRect();
        r.style.left = ((e ? e.clientX : rect.left + rect.width / 2) - rect.left) + 'px';
        r.style.top = ((e ? e.clientY : rect.top + rect.height / 2) - rect.top) + 'px';
        el.appendChild(r);
        setTimeout(function () { r.remove(); }, 460);
      }

      /* Activate button, call open, then deactivate */
      function _activateBtn(btn, activeClass, delay, openFn) {
        btn.classList.add(activeClass);
        setTimeout(function () {
          btn.classList.remove(activeClass);
          openFn();
        }, delay || 220);
      }

      /* ── Patch _patchTTD onclick ── */
      function _patchTTDBtn() {
        var orig = window._patchTTD;
        if (!orig || orig._ubPatched) return;
        window._patchTTD = function () {
          orig.call(this);
          /* find the newly created button */
          setTimeout(function () {
            var inp = document.getElementById('f12-ttd-file');
            if (!inp) return;
            var parent = inp.closest('.tpp-upload-btn') || inp.parentElement;
            /* _patchTTD replaces label with a button — find it */
            var btn = document.querySelector('button.tpp-upload-btn') ||
              (inp && inp.parentElement && inp.parentElement.tagName === 'BUTTON' ? inp.parentElement : null);
            /* wrap onclick */
            if (btn && !btn._ubPatched) {
              btn._ubPatched = true;
              var origClick = btn.onclick;
              btn.onclick = function (e) {
                _ripple(btn, e);
                _flash('rgba(225,183,73,.07)');
                btn.classList.add('_ub-active');
                setTimeout(function () {
                  btn.classList.remove('_ub-active');
                  if (origClick) origClick.call(btn, e);
                }, 200);
              };
            }
          }, 50);
        };
        window._patchTTD._ubPatched = true;
      }

      /* ── Intercept _lbrOpenPickDM to add button animation ── */
      var _origOpenPickDM = null;
      function _patchLbrOpenPickDM() {
        if (_origOpenPickDM || !window._lbrOpenPickDM) return;
        _origOpenPickDM = window._lbrOpenPickDM;
        window._lbrOpenPickDM = function (mode, callback) {
          /* find which button triggered this via active element or last clicked */
          var trigger = document._ubLastClickedBtn;
          if (trigger) {
            _ripple(trigger);
            if (trigger.classList.contains('btn-import-audio')) {
              trigger.classList.add('_ub-active');
              _flash('rgba(225,183,73,.07)');
              setTimeout(function () { trigger.classList.remove('_ub-active'); }, 420);
            } else if (trigger.classList.contains('dok-file-lbl')) {
              trigger.classList.add('_ub-active');
              _flash('rgba(225,183,73,.06)');
              setTimeout(function () { trigger.classList.remove('_ub-active'); }, 360);
            } else if (trigger.classList.contains('tpp-upload-btn')) {
              trigger.classList.add('_ub-active');
              _flash('rgba(225,183,73,.07)');
              setTimeout(function () { trigger.classList.remove('_ub-active'); }, 360);
            }
            document._ubLastClickedBtn = null;
          }
          _origOpenPickDM.call(this, mode, callback);
        };
      }

      /* Track last clicked relevant button */
      document.addEventListener('mousedown', function (e) {
        var btn = e.target.closest('.btn-import-audio, .dok-file-lbl, .tpp-upload-btn, button.tpp-upload-btn');
        if (btn) document._ubLastClickedBtn = btn;
      }, true);

      /* ── Patch onLampirDokChange for Dokumentasi expand animation ── */
      function _patchDokChange() {
        var orig = window.onLampirDokChange;
        if (!orig || orig._ubPatched) return;
        window.onLampirDokChange = function () {
          orig.call(this);
          var cond = document.getElementById('cond-dokumentasi');
          if (!cond) return;
          if (cond.style.display !== 'none' && cond.style.display !== '') {
            /* visible — animate in */
            cond.classList.remove('_ub-dok-visible');
            void cond.offsetWidth;
            cond.classList.add('_ub-dok-visible');
            _flash('rgba(225,183,73,.05)');
            setTimeout(function () { cond.classList.remove('_ub-dok-visible'); }, 500);
          }
        };
        window.onLampirDokChange._ubPatched = true;
      }

      /* ── INIT ── */
      function _init() {
        _patchLbrOpenPickDM();
        _patchDokChange();
        _patchTTDBtn();
      }

      /* Run after all scripts have loaded */
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(_init, 300); });
      } else {
        setTimeout(_init, 300);
      }
      /* Re-patch if functions defined later */
      setTimeout(_init, 800);
      setTimeout(_init, 1800);

    })();
  
