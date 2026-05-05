(function () {
  'use strict';

  if (window.__LIBERO_LAZY_TABS_READY__) return;
  window.__LIBERO_LAZY_TABS_READY__ = true;

  var cfg = {
    keepMounted: 1,
    unloadDelay: 900,
    initialDelay: 1200
  };

  function disabled() {
    try {
      if (window.LIBERO_DISABLE_LAZY_TABS === true) return true;
      if (localStorage.getItem('LIBERO_LAZY_TABS') === '0') return true;
    } catch (_) { }
    return false;
  }

  if (disabled()) return;

  var panels = {};
  var detached = {};
  var mounted = {};
  var dataCache = {};
  var recent = [];
  var trimTimer = null;
  var installed = false;
  var restoringAll = false;
  var resetInProgress = false;

  function safe(fn, fallback) {
    try { return fn(); } catch (e) {
      try { console.warn('[lazy-tabs]', e); } catch (_) { }
      return fallback;
    }
  }

  function toIdx(v) {
    var n = Number(v);
    return Number.isFinite(n) ? n : -1;
  }

  function panelIndex(panel) {
    var m = String(panel && panel.id || '').match(/^tp-(\d+)$/);
    return m ? Number(m[1]) : -1;
  }

  function discoverPanels() {
    panels = {};
    document.querySelectorAll('.tab-panel[id^="tp-"]').forEach(function (panel) {
      var idx = panelIndex(panel);
      if (idx < 0) return;
      panels[idx] = panel;
      if (!(idx in mounted)) mounted[idx] = true;
    });
  }

  function eachPanel(fn) {
    Object.keys(panels).map(Number).sort(function (a, b) { return a - b; }).forEach(fn);
  }

  function activeIndex() {
    var active = document.querySelector('.tab-panel.active[id^="tp-"]');
    return active ? panelIndex(active) : toIdx(window.ACTIVE_TAB_IDX || 0);
  }

  function remember(idx) {
    idx = toIdx(idx);
    if (idx < 0) return;
    recent = recent.filter(function (x) { return x !== idx; });
    recent.unshift(idx);
    if (recent.length > Math.max(1, cfg.keepMounted)) recent.length = Math.max(1, cfg.keepMounted);
  }

  function collectOne(idx) {
    idx = toIdx(idx);
    if (idx < 0 || mounted[idx] === false) return dataCache[idx] || {};
    var fn = window['collectTab' + idx];
    if (typeof fn !== 'function') return dataCache[idx] || {};
    var data = safe(function () { return fn(); }, null);
    if (data && typeof data === 'object') dataCache[idx] = data;
    return dataCache[idx] || {};
  }

  function collectMounted() {
    eachPanel(function (idx) {
      if (mounted[idx] !== false) collectOne(idx);
    });
  }

  function postMount(idx) {
    setTimeout(function () {
      runCommonRefresh();
    }, 0);
  }

  function runCommonRefresh() {
    safe(function () { if (typeof window.updateProgress === 'function') window.updateProgress(); });
    safe(function () { if (typeof window.updateTabRings === 'function') window.updateTabRings(); });
    safe(function () { if (typeof window.updateAccHeaderRings === 'function') window.updateAccHeaderRings(); });
    safe(function () { if (typeof window.updateLitmasInfo === 'function') window.updateLitmasInfo(); });
    safe(function () { if (typeof window.updateClockPetugas === 'function') window.updateClockPetugas(); });
    safe(function () { if (typeof window.toggleRekomendasiUI === 'function') window.toggleRekomendasiUI(); });
    safe(function () { if (typeof window.syncKesimpulanCDVisibility === 'function') window.syncKesimpulanCDVisibility(); });
  }

  function installEventFallbacks() {
    var pending = false;
    function schedule() {
      if (pending) return;
      pending = true;
      setTimeout(function () {
        pending = false;
        runCommonRefresh();
      }, 0);
    }
    document.addEventListener('input', schedule, true);
    document.addEventListener('change', schedule, true);
  }

  function mount(idx, opts) {
    idx = toIdx(idx);
    opts = opts || {};
    var panel = panels[idx] || document.getElementById('tp-' + idx);
    if (!panel) return null;
    panels[idx] = panel;

    if (mounted[idx] === false) {
      var restored = false;
      if (detached[idx]) {
        panel.appendChild(detached[idx]);
        detached[idx] = null;
        restored = true;
      }
      panel.removeAttribute('data-lazy-unmounted');
      mounted[idx] = true;

      if (!restored && !opts.skipLoad) {
        var data = dataCache[idx] || window.__LIBERO_LAST_LOAD_DATA__ || {};
        var loadFn = window['loadTab' + idx];
        if (typeof loadFn === 'function') safe(function () { loadFn(data); });
      }
      postMount(idx);
    }

    return panel;
  }

  function mountAll() {
    restoringAll = true;
    eachPanel(function (idx) { mount(idx); });
    restoringAll = false;
  }

  function holdAllMounted() {
    if (trimTimer) {
      clearTimeout(trimTimer);
      trimTimer = null;
    }
    mountAll();
    restoringAll = true;
  }

  function releaseAllMounted(delay) {
    restoringAll = false;
    scheduleTrim(delay == null ? cfg.unloadDelay : delay);
  }

  function prepareAllMounted(delay) {
    holdAllMounted();
    return new Promise(function (resolve) {
      requestAnimationFrame(function () {
        safe(function () { if (typeof window._resizeFinp === 'function') window._resizeFinp(); });
        collectMounted();
        releaseAllMounted(delay == null ? 1500 : delay);
        resolve();
      });
    });
  }

  function resetCache() {
    dataCache = {};
    window.__LIBERO_LAST_LOAD_DATA__ = {};
  }

  function beginReset() {
    resetInProgress = true;
    if (trimTimer) {
      clearTimeout(trimTimer);
      trimTimer = null;
    }
    mountAll();
    resetCache();
  }

  function finishReset() {
    resetCache();
    collectMounted();
    resetInProgress = false;
    scheduleTrim();
  }

  function shouldKeep(idx) {
    var active = activeIndex();
    if (idx === active) return true;
    if (recent.indexOf(idx) >= 0) return true;
    return false;
  }

  function unload(idx) {
    idx = toIdx(idx);
    if (idx < 0 || shouldKeep(idx)) return;
    var panel = panels[idx];
    if (!panel || mounted[idx] === false) return;
    collectOne(idx);
    panel.classList.remove('active');
    var frag = document.createDocumentFragment();
    while (panel.firstChild) frag.appendChild(panel.firstChild);
    detached[idx] = frag;
    panel.setAttribute('data-lazy-unmounted', '1');
    mounted[idx] = false;
  }

  function trim() {
    if (restoringAll || resetInProgress || disabled()) return;
    remember(activeIndex());
    eachPanel(unload);
  }

  function scheduleTrim(delay) {
    if (trimTimer) clearTimeout(trimTimer);
    trimTimer = setTimeout(trim, delay == null ? cfg.unloadDelay : delay);
  }

  function patchSwitchTab() {
    var original = window.switchTab;
    if (typeof original !== 'function' || original.__lazyTabsWrapped) return;

    window.switchTab = function (idx) {
      idx = toIdx(idx);
      if (idx >= 0) mount(idx);
      var result = original.apply(this, arguments);
      remember(idx);
      scheduleTrim();
      return result;
    };
    window.switchTab.__lazyTabsWrapped = true;
  }

  function patchCollectors() {
    var originalCollect = window.collectAllTabs;
    window.collectAllTabs = function () {
      holdAllMounted();
      collectMounted();
      var out = {};
      eachPanel(function (idx) {
        if (dataCache[idx] && typeof dataCache[idx] === 'object') Object.assign(out, dataCache[idx]);
      });
      releaseAllMounted(1500);
      if (!Object.keys(out).length && typeof originalCollect === 'function') {
        return safe(function () { return originalCollect(); }, {});
      }
      try {
        if (out.riwayat_pidana && out.tanggapan_korban && !out.riwayat_pidana.tanggapan_korban) {
          out.riwayat_pidana.tanggapan_korban = out.tanggapan_korban;
        }
      } catch (_) { }
      return out;
    };

    var originalValidate = window.validateAllTabs;
    window.validateAllTabs = function () {
      holdAllMounted();
      var miss = [];
      if (typeof originalValidate === 'function') {
        miss = safe(function () { return originalValidate(); }, []) || [];
      }
      releaseAllMounted(1500);
      return Array.isArray(miss) ? miss : [];
    };
  }

  function patchLoaders() {
    var originalInit = window.initApp;
    if (typeof originalInit === 'function' && !originalInit.__lazyTabsWrapped) {
      window.initApp = function (data) {
        mountAll();
        var result = originalInit.apply(this, arguments);
        setTimeout(function () { collectMounted(); scheduleTrim(); }, 250);
        return result;
      };
      window.initApp.__lazyTabsWrapped = true;
    }

    var originalLoaded = window.onDataLoaded;
    if (typeof originalLoaded === 'function' && !originalLoaded.__lazyTabsWrapped) {
      window.onDataLoaded = function (data) {
        resetCache();
        window.__LIBERO_LAST_LOAD_DATA__ = data || {};
        holdAllMounted();
        var result = originalLoaded.apply(this, arguments);
        setTimeout(function () {
          collectMounted();
          safe(function () { if (typeof window._resizeFinp === 'function') window._resizeFinp(); });
          releaseAllMounted();
        }, 500);
        return result;
      };
      window.onDataLoaded.__lazyTabsWrapped = true;
    }

    var originalLoadAll = window._loadAllFromData;
    if (typeof originalLoadAll === 'function' && !originalLoadAll.__lazyTabsWrapped) {
      window._loadAllFromData = function (data) {
        resetCache();
        window.__LIBERO_LAST_LOAD_DATA__ = data || {};
        holdAllMounted();
        var result = originalLoadAll.apply(this, arguments);
        setTimeout(function () {
          collectMounted();
          safe(function () { if (typeof window._resizeFinp === 'function') window._resizeFinp(); });
          releaseAllMounted();
        }, 500);
        return result;
      };
      window._loadAllFromData.__lazyTabsWrapped = true;
    }

    var originalReset = window.cmd_muat_ulang;
    if (typeof originalReset === 'function' && !originalReset.__lazyTabsWrapped) {
      window.cmd_muat_ulang = async function () {
        try {
          var result = await originalReset.apply(this, arguments);
          if (resetInProgress) finishReset();
          return result;
        } finally {
          if (resetInProgress) {
            resetInProgress = false;
            scheduleTrim();
          }
        }
      };
      window.cmd_muat_ulang.__lazyTabsWrapped = true;
    }
  }

  function install() {
    if (installed || disabled()) return;
    discoverPanels();
    if (!Object.keys(panels).length) return;
    installed = true;
    remember(activeIndex());
    patchSwitchTab();
    patchCollectors();
    patchLoaders();
    installEventFallbacks();
    window.__LIBERO_LAZY_BEGIN_RESET = beginReset;
    window.__LIBERO_LAZY_FINISH_RESET = finishReset;
    window.__LIBERO_LAZY_MOUNT_ALL = mountAll;
    window.__LIBERO_LAZY_PREPARE_ALL = prepareAllMounted;
    window.__LIBERO_LAZY_RESET_CACHE = resetCache;
    setTimeout(function () {
      collectMounted();
      scheduleTrim(0);
    }, cfg.initialDelay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    setTimeout(install, 0);
  }
})();
