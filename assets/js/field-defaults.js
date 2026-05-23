// LIBERO: Helper bersama untuk menyematkan nilai default field.
// LIBERO: Helper bersama untuk pin nilai default field.
    /* ── FIELD DEFAULTS (PIN) ── */
    var _dfltFields = (window._dfltFields && typeof window._dfltFields === 'object')
      ? window._dfltFields
      : ((typeof _dfltFields === 'object' && _dfltFields) ? _dfltFields : {});
    window._dfltFields = _dfltFields;

    function _initPinStates(defaults) {
      _dfltFields = (defaults && typeof defaults === 'object') ? defaults : {};
      window._dfltFields = _dfltFields;
      document.querySelectorAll('.pin-btn').forEach(function (btn) {
        var fid = btn.dataset.field;
        var pinned = fid in _dfltFields;
        btn.classList.toggle('pinned', pinned);
        btn.title = pinned ? 'Sudah Ditetapkan' : 'Tetapkan sebagai default';
      });
    }

    function togglePin(fieldId) {
      var el = document.getElementById(fieldId);
      var btn = document.querySelector('.pin-btn[data-field="' + fieldId + '"]');
      if (!el || !btn) return;
      if (fieldId in _dfltFields) {
        delete _dfltFields[fieldId];
        window._dfltFields = _dfltFields;
        btn.classList.remove('pinned');
        btn.title = 'Tetapkan';
      } else {
        _dfltFields[fieldId] = el.value || '';
        window._dfltFields = _dfltFields;
        btn.classList.add('pinned');
        btn.title = 'Sudah Ditetapkan — klik untuk hapus';
      }
      /* Langsung pywebview.api — sama seperti save_theme, tidak perlu bridge await */
      try {
        if (window.pywebview && window.pywebview.api && window.pywebview.api.save_field_defaults) {
          window.pywebview.api.save_field_defaults(JSON.stringify(_dfltFields));
        }
      } catch (_e) { }
    }

    window._initPinStates = _initPinStates;
    window.togglePin = togglePin;
