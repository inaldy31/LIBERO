// LIBERO: Runtime bersama untuk mengambil dan menerapkan data formulir webview.
(function installCollectRuntime() {
  function safe(fn, fallback) {
    try { return fn(); } catch (e) { console.warn('[collect-runtime]', e); return fallback; }
  }

  function isPelimpahan() {
    return safe(function () {
      return typeof window._isPelimpahan === 'function' && !!window._isPelimpahan();
    }, false);
  }

  function pageMode() {
    return document.getElementById('f-punya-wali') ? 'litmasanak' : 'integrasi';
  }

  function programValue() {
    return safe(function () {
      return ((document.getElementById('f-program') || {}).value || '').trim().toLowerCase();
    }, '');
  }

  function activeTabIndexes(mode) {
    var pel = isPelimpahan();
    var tabs = [0, 1, 2, 3];
    if (!pel) tabs.push(4, 5);
    if (mode === 'litmasanak') {
      tabs.push(6, 7, 8, 9);
      if (programValue() === 'sidang anak') tabs.push(10);
      tabs.push(11, 12, 13);
      return tabs;
    }
    for (var t = 6; t <= 12; t++) tabs.push(t);
    return tabs;
  }

  function activeIdTabIndexes(mode) {
    var pel = isPelimpahan();
    var tabs = [0, 1, 2, 3];
    if (!pel) tabs.push(4, 5);
    if (mode === 'litmasanak') tabs.push(6, 7, 8, 9, 10, 11, 12, 13);
    else tabs.push(6, 7, 8, 9, 10, 11, 12);
    return tabs;
  }

  function loaderNames(mode) {
    var max = mode === 'litmasanak' ? 13 : 12;
    var names = [];
    for (var i = 0; i <= max; i++) names.push('loadTab' + i);
    return names;
  }

  function collectAllTabs(mode) {
    var out = {};
    activeTabIndexes(mode).forEach(function (i) {
      var fn = window['collectTab' + i];
      if (typeof fn !== 'function') return;
      var payload = safe(fn, null);
      if (payload && typeof payload === 'object') Object.assign(out, payload);
    });
    try {
      if (out.riwayat_pidana && out.tanggapan_korban && !out.riwayat_pidana.tanggapan_korban) {
        out.riwayat_pidana.tanggapan_korban = out.tanggapan_korban;
      }
    } catch (_e) { }
    return out;
  }

  function validateAllTabs(mode) {
    var missing = [];
    activeTabIndexes(mode).forEach(function (i) {
      var fn = window['validateTab' + i];
      if (typeof fn !== 'function') return;
      var result = safe(fn, null);
      if (Array.isArray(result)) missing = missing.concat(result);
    });
    return missing;
  }

  function getAllActiveIDs(mode) {
    var ids = [];
    activeIdTabIndexes(mode).forEach(function (tab) {
      try {
        var list = window.getTabIDs(tab) || [];
        ids = ids.concat(list);
      } catch (_e) { }
    });
    return ids;
  }

  function applyPinnedDefaults() {
    try {
      if (typeof window._dfltFields !== 'object') return;
      Object.keys(window._dfltFields).forEach(function (fid) {
        var val = window._dfltFields[fid];
        if (!val) return;
        var el = document.getElementById(fid);
        if (el && !el.value) el.value = val;
      });
    } catch (_e) { }
  }

  function refreshAfterLoad() {
    setTimeout(function () {
      safe(function () {
        if (typeof window.__LIBERO_PROGRESS_RESET_SLOTS === 'function') {
          window.__LIBERO_PROGRESS_RESET_SLOTS();
        }
      });
      safe(function () { window.updateProgress(); });
      safe(function () { window.updateTabRings(); });
      safe(function () { window.updateAccHeaderRings(); });
      safe(function () { if (typeof window.updateLitmasInfo === 'function') window.updateLitmasInfo(); });
      safe(function () { if (typeof window.updateClockPetugas === 'function') window.updateClockPetugas(); });
    }, 250);
  }

  function onDataLoaded(mode, data) {
    if (!data) return;
    loaderNames(mode).forEach(function (name) {
      try {
        if (typeof window[name] === 'function') window[name](data);
      } catch (e) {
        if (mode !== 'litmasanak') console.warn('[onDataLoaded]', name, e);
      }
    });
    applyPinnedDefaults();
    refreshAfterLoad();
    safe(function () { window._resetAutoSaveHash(); });
    if (typeof window.toast === 'function') window.toast('Data berhasil dimuat \u2713');
  }

  function install(options) {
    options = options || {};
    var mode = options.mode || pageMode();
    window.__LIBERO_ACTIVE_TAB_INDEXES = function () { return activeTabIndexes(mode); };
    window.collectAllTabs = function () { return collectAllTabs(mode); };
    window.validateAllTabs = function () { return validateAllTabs(mode); };
    window.getAllActiveIDs = function () { return getAllActiveIDs(mode); };
    window.onDataLoaded = function (data) { return onDataLoaded(mode, data); };
  }

  window.LCollectRuntime = {
    install: install,
    activeTabIndexes: activeTabIndexes,
    collectAllTabs: collectAllTabs,
    validateAllTabs: validateAllTabs,
    getAllActiveIDs: getAllActiveIDs,
    onDataLoaded: onDataLoaded
  };

  install();
})();
