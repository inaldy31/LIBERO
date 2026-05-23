// LIBERO: Helper bersama untuk memuat dan memutar efek suara UI.
(function () {

      var _snd = {
        open: new Audio('assets/audio/ui-open.mp3'),
        fire: new Audio('assets/audio/ui-fire.mp3'),
        close: new Audio('assets/audio/ui-close.mp3'),
      };
      Object.keys(_snd).forEach(function (k) {
        try {
          _snd[k].preload = 'auto';
          _snd[k].load();
        } catch (e) { }
      });

      // Web Audio API — semua suara pakai trim & gain
      var _actx = null, _bufs = {}, _loading = {};
      (function () {
        try {
          _actx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { }
      })();

      function _decodeAudio(key) {
        if (!_actx || _bufs[key] || _loading[key]) return;
        _loading[key] = true;
        try {
          fetch(_snd[key].src)
            .then(function (r) { return r.arrayBuffer(); })
            .then(function (ab) {
              return new Promise(function (resolve, reject) {
                try {
                  var ret = _actx.decodeAudioData(ab, resolve, reject);
                  if (ret && typeof ret.then === 'function') ret.then(resolve, reject);
                } catch (e) { reject(e); }
              });
            })
            .then(function (buf) { _bufs[key] = buf; })
            .catch(function () { })
            .finally(function () { _loading[key] = false; });
        } catch (e) {
          _loading[key] = false;
        }
      }

      ['open', 'fire', 'close'].forEach(_decodeAudio);

      function _unlockAudio() {
        try {
          if (!_actx) return;
          if (_actx.state === 'suspended') _actx.resume();
          ['open', 'fire', 'close'].forEach(_decodeAudio);
        } catch (e) { }
      }
      ['pointerdown', 'mousedown', 'keydown', 'touchstart'].forEach(function (evt) {
        document.addEventListener(evt, _unlockAudio, { capture: true, passive: true, once: true });
      });

      // open  → potong 0.2s dari depan
      // fire  → potong 0.2s dari belakang, gain 1.75
      // close → potong 0.1s dari depan
      var _trim = {
        open: { start: 0.2, end: 0 },
        fire: { start: 0, end: 0.2 },
        close: { start: 0.1, end: 0 },
      };
      var _gain = { open: 1.0, fire: 1.75, close: 1.0 };

      var _activeSrc = {};
      var _lastPlayAt = {};
      function _play(key) {
        try {
          _unlockAudio();
          if (!_actx || !_bufs[key]) {
            _decodeAudio(key);
            var s = _snd[key].cloneNode(true);
            s.preload = 'auto';
            s.currentTime = 0;
            s.play().catch(function () { });
            return;
          }
          if (Date.now() - (_lastPlayAt[key] || 0) < 35) return;
          _lastPlayAt[key] = Date.now();
          if (_activeSrc[key]) { try { _activeSrc[key].stop(); } catch(e){} }
          var buf = _bufs[key], t = _trim[key];
          var offset = t.start, duration = buf.duration - t.start - t.end;
          if (duration <= 0) return;
          var src = _actx.createBufferSource(); src.buffer = buf;
          var g = _actx.createGain(); g.gain.value = _gain[key];
          src.connect(g); g.connect(_actx.destination);
          _activeSrc[key] = src;
          src.start(0, offset, duration);
        } catch (e) { }
      }
      var _closeLastT = 0;
      window._SFX = {
        open: function () { _play('open'); },
        fire: function () { _play('fire'); },
        close: function () {
          var now = Date.now();
          if (now - _closeLastT < 600) return;
          _closeLastT = now;
          _play('close');
        },
      };
      window._SFX_SUPPRESS = false;

      // fire: semua tombol topbar
      document.addEventListener('mousedown', function (e) {
        if (e.target.closest('.tb-btn')) window._SFX && window._SFX.fire();
      }, true);

      // close: batal di dialog & batal di explorer
      document.addEventListener('mousedown', function (e) {
        if (e.target.closest('#ld-cancel, #dm-btn-batal'))
          window._SFX && window._SFX.close();
      }, true);

      // fire: tombol upload (TTD, foto, rekaman)
      document.addEventListener('mousedown', function (e) {
        if (e.target.closest('.btn-import-audio, .tpp-upload-btn, .dok-file-lbl'))
          window._SFX && window._SFX.fire();
      }, true);

      // SFX STOPPER
      document.addEventListener('mousedown', function (e) {
        if (e.target.closest('.snav-guide'))
          window._SFX && window._SFX.fire();
        else if (e.target.closest('.btn-ai-stopper, .snav-stopper, .btn-stopper-wilayah, .btn-cari-sipp'))
          window._SFX && window._SFX.open();
        else if (e.target.closest('.stm-proses, .stm-pick, #btn-sipp-cari, .btn-ambil-kronologi, #btn-sipp-cf-proceed'))
          window._SFX && window._SFX.fire();
      }, true);

      // close: semua toast — kecuali suppressed & toastProgress
      // Pola toast yang SENYAP (tidak bunyi close)
      var _SILENT_PATTERNS = [
        /meringankan.*berhasil/i,
        /memberatkan.*berhasil/i,
        /pertimbangan.*berhasil dimuat/i,
        /L\/P hanya boleh/i,
        /usia harus/i,
        /nama.*l\/p.*usia/i,
      ];
      function _isSilentToast(args) {
        if (window._SFX_SUPPRESS) return true;
        var msg = String(args && args[0] || '').toLowerCase();
        for (var i = 0; i < _SILENT_PATTERNS.length; i++) {
          if (_SILENT_PATTERNS[i].test(msg)) return true;
        }
        return false;
      }

      function _patchToast() {
        // Pakai global flag — hanya patch sekali, cegah re-wrap berlapis
        // (karena _patchUploadToasts bisa wrap window.toast lagi setelah kita)
        if (window.__sfxToastPatched) return;
        window.__sfxToastPatched = true;

        // toast, toastSuccess, toastInfo, showToast, toastDoc → close, kecuali silent
        ['toast', 'toastSuccess', 'toastInfo', 'showToast', 'toastDoc'].forEach(function (fn) {
          var _orig = window[fn];
          if (!_orig) return;
          window[fn] = function () {
            if (!_isSilentToast(arguments)) window._SFX && window._SFX.close();
            return _orig.apply(this, arguments);
          };
          window[fn]._sfx = true;
        });
        // toastWarning & toastError → senyap
        ['toastWarning', 'toastError'].forEach(function (fn) {
          var _orig = window[fn];
          if (!_orig) return;
          window[fn] = function () { return _orig.apply(this, arguments); };
          window[fn]._sfx = true;
        });
        // toastProgress → senyap
        var _tp = window.toastProgress;
        if (_tp) {
          window.toastProgress = function () { return _tp.apply(this, arguments); };
          window.toastProgress._sfx = true;
        }
      }

      // close: kembali & keluar setelah dikonfirmasi
      function _patchTransitions() {
        if (typeof _showExitAnimation === 'function' && !_showExitAnimation._sfx) {
          var _origSEA = _showExitAnimation;
          _showExitAnimation = function (cb) {
            window._SFX && window._SFX.close();
            return _origSEA.call(this, cb);
          };
          _showExitAnimation._sfx = true;
        }
        if (typeof _playKembaliTransition === 'function' && !_playKembaliTransition._sfx) {
          var _origPKT = _playKembaliTransition;
          _playKembaliTransition = function (cb) {
            window._SFX && window._SFX.close();
            return _origPKT.call(this, cb);
          };
          _playKembaliTransition._sfx = true;
        }
      }

      // TPP: generate → open (klik), toast-nya suppress (gausah bunyi)
      //      daftarkan → fire (klik), berhasil → close (dari toastSuccess patch)
      function _patchTPP() {
        var _gen = window.prosesGenerateDataTPP;
        if (_gen && !_gen._sfx) {
          window.prosesGenerateDataTPP = function () {
            window._SFX && window._SFX.open();
            window._SFX_SUPPRESS = true;
            var r = _gen.apply(this, arguments);
            setTimeout(function () { window._SFX_SUPPRESS = false; }, 200);
            return r;
          };
          window.prosesGenerateDataTPP._sfx = true;
        }
        var _daf = window.mulaiPendaftaranTPP;
        if (_daf && !_daf._sfx) {
          window.mulaiPendaftaranTPP = function () {
            window._SFX && window._SFX.fire();
            return _daf.apply(this, arguments);
          };
          window.mulaiPendaftaranTPP._sfx = true;
        }
      }

      // fire: LDialog.recovery muncul
      function _patchRecovery() {
        if (window.LDialog && window.LDialog.recovery && !window.LDialog.recovery._sfx) {
          var _orig = window.LDialog.recovery;
          window.LDialog.recovery = function () {
            window._SFX && window._SFX.fire();
            return _orig.apply(this, arguments);
          };
          window.LDialog.recovery._sfx = true;
        }
      }

      setTimeout(function () { _patchToast(); _patchTransitions(); _patchTPP(); _patchRecovery(); }, 400);
      setTimeout(function () { _patchToast(); _patchTransitions(); _patchTPP(); _patchRecovery(); }, 900);
      setTimeout(function () { _patchToast(); _patchTransitions(); _patchTPP(); _patchRecovery(); }, 1800);
    })();

