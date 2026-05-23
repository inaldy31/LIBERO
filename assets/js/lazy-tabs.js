// LIBERO: Helper inisialisasi lazy tab dan aktivasi tab.
(function () {
  'use strict';

  if (window.__LIBERO_LAZY_TABS_READY__) return;
  window.__LIBERO_LAZY_TABS_READY__ = true;

  var cfg = {
    keepMounted: 1,
    unloadDelay: 900,
    initialDelay: 1200,
    outputUnloadDelay: 450
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

  function preserveActiveScroll() {
    var main = document.querySelector('.main');
    var top = main ? main.scrollTop : null;
    var active = document.activeElement;
    var tag = active && active.tagName;
    var isField = tag && /^(INPUT|TEXTAREA|SELECT)$/.test(tag);
    var selection = null;

    if (!main || !isField || !main.contains(active)) {
      return function () { };
    }

    try {
      if (typeof active.selectionStart === 'number') {
        selection = {
          start: active.selectionStart,
          end: active.selectionEnd,
          dir: active.selectionDirection
        };
      }
    } catch (_) { }

    return function restore() {
      try {
        if (main && top != null) main.scrollTop = top;
        if (active && document.contains(active)) {
          active.focus({ preventScroll: true });
          if (selection && typeof active.setSelectionRange === 'function') {
            active.setSelectionRange(selection.start, selection.end, selection.dir || 'none');
          }
          if (main && top != null) main.scrollTop = top;
        }
      } catch (_) { }
    };
  }

  function restoreSoon(restore) {
    if (typeof restore !== 'function') return;
    restore();
    setTimeout(restore, 0);
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(restore);
  }

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

  function outputTabs() {
    var bodyModule = document.body && document.body.getAttribute('data-libero-module');
    var name = bodyModule ? String(bodyModule).toLowerCase() : String(document.title || '').toLowerCase();
    if (name === 'litmasanak' || name.indexOf('anak') >= 0) return { 10: true, 11: true, 12: true, 13: true };
    return { 10: true, 11: true, 12: true };
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

  function activeIndexSet() {
    if (typeof window.__LIBERO_ACTIVE_TAB_INDEXES !== 'function') return null;
    var arr = safe(function () { return window.__LIBERO_ACTIVE_TAB_INDEXES(); }, null);
    if (!Array.isArray(arr)) return null;
    var set = {};
    arr.forEach(function (idx) {
      idx = toIdx(idx);
      if (idx >= 0) set[idx] = true;
    });
    return set;
  }

  function postMount(idx) {
    setTimeout(function () {
      runCommonRefresh();
    }, 0);
  }

  function runCommonRefresh() {
    var restore = preserveActiveScroll();
    var progressUpdated = false;
    safe(function () {
      if (typeof window.updateProgress === 'function') {
        window.updateProgress();
        progressUpdated = true;
      }
    });
    if (!progressUpdated) {
      safe(function () { if (typeof window.updateTabRings === 'function') window.updateTabRings(); });
      safe(function () { if (typeof window.updateAccHeaderRings === 'function') window.updateAccHeaderRings(); });
    }
    safe(function () { if (typeof window.updateLitmasInfo === 'function') window.updateLitmasInfo(); });
    safe(function () { if (typeof window.updateClockPetugas === 'function') window.updateClockPetugas(); });
    safe(function () { if (typeof window.toggleRekomendasiUI === 'function') window.toggleRekomendasiUI(); });
    safe(function () { if (typeof window.syncKesimpulanCDVisibility === 'function') window.syncKesimpulanCDVisibility(); });
    restoreSoon(restore);
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

      var needsLoad = panel.getAttribute('data-lazy-load-pending') === '1';
      if (!opts.skipLoad && (!restored || needsLoad)) {
        var data = dataCache[idx] || window.__LIBERO_LAST_LOAD_DATA__ || {};
        var loadFn = window['loadTab' + idx];
        if (typeof loadFn === 'function') safe(function () { loadFn(data); });
        panel.removeAttribute('data-lazy-load-pending');
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

  function markUnmountedLoadPending() {
    eachPanel(function (idx) {
      if (mounted[idx] !== false) return;
      var panel = panels[idx] || document.getElementById('tp-' + idx);
      if (panel) panel.setAttribute('data-lazy-load-pending', '1');
    });
  }

  function withSkippedUnmountedLoaders(fn) {
    var originals = {};
    eachPanel(function (idx) {
      if (mounted[idx] !== false) return;
      var name = 'loadTab' + idx;
      if (typeof window[name] !== 'function') return;
      originals[name] = window[name];
      window[name] = function () { };
    });
    try {
      return fn();
    } finally {
      Object.keys(originals).forEach(function (name) {
        window[name] = originals[name];
      });
    }
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
    var restore = preserveActiveScroll();
    holdAllMounted();
    return new Promise(function (resolve) {
      requestAnimationFrame(function () {
        safe(function () { if (typeof window._resizeFinp === 'function') window._resizeFinp(); });
        collectMounted();
        releaseAllMounted(delay == null ? 1500 : delay);
        restoreSoon(restore);
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
    safe(function () {
      if (typeof window.__LIBERO_SET_PROGRESS_SUSPENDED === 'function') {
        window.__LIBERO_SET_PROGRESS_SUSPENDED(true);
      } else {
        window.__LIBERO_PROGRESS_SUSPENDED__ = true;
      }
    });
    safe(function () {
      if (typeof window.__LIBERO_PROGRESS_RESET_SLOTS === 'function') {
        window.__LIBERO_PROGRESS_RESET_SLOTS();
      }
    });
    if (trimTimer) {
      clearTimeout(trimTimer);
      trimTimer = null;
    }
    mountAll();
    resetCache();
  }

  function finishReset() {
    resetCache();
    resetInProgress = false;
    safe(function () {
      if (typeof window.__LIBERO_SET_PROGRESS_SUSPENDED === 'function') {
        window.__LIBERO_SET_PROGRESS_SUSPENDED(false);
      } else {
        window.__LIBERO_PROGRESS_SUSPENDED__ = false;
        if (typeof window.updateProgress === 'function') window.updateProgress();
      }
    });
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
    if (delay == null && outputTabs()[activeIndex()]) delay = cfg.outputUnloadDelay;
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
      var restore = preserveActiveScroll();
      holdAllMounted();
      try {
        collectMounted();
        var out = {};
        var activeSet = activeIndexSet();
        eachPanel(function (idx) {
          if (activeSet && !activeSet[idx]) return;
          if (dataCache[idx] && typeof dataCache[idx] === 'object') Object.assign(out, dataCache[idx]);
        });
        if (!Object.keys(out).length && typeof originalCollect === 'function') {
          return safe(function () { return originalCollect(); }, {});
        }
        try {
          if (out.riwayat_pidana && out.tanggapan_korban && !out.riwayat_pidana.tanggapan_korban) {
            out.riwayat_pidana.tanggapan_korban = out.tanggapan_korban;
          }
        } catch (_) { }
        return out;
      } finally {
        releaseAllMounted(1500);
        restoreSoon(restore);
      }
    };

    var originalValidate = window.validateAllTabs;
    window.validateAllTabs = function () {
      var restore = preserveActiveScroll();
      holdAllMounted();
      var miss = [];
      if (typeof originalValidate === 'function') {
        miss = safe(function () { return originalValidate(); }, []) || [];
      }
      releaseAllMounted(1500);
      restoreSoon(restore);
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
        var args = arguments;
        var ctx = this;
        try {
          var result = originalLoaded.apply(ctx, args);
          collectMounted();
          safe(function () { if (typeof window._resizeFinp === 'function') window._resizeFinp(); });
          return result;
        } finally {
          releaseAllMounted(1500);
        }
      };
      window.onDataLoaded.__lazyTabsWrapped = true;
    }

    var originalLoadAll = window._loadAllFromData;
    if (typeof originalLoadAll === 'function' && !originalLoadAll.__lazyTabsWrapped) {
      window._loadAllFromData = function (data) {
        resetCache();
        window.__LIBERO_LAST_LOAD_DATA__ = data || {};
        holdAllMounted();
        var args = arguments;
        var ctx = this;
        try {
          var result = originalLoadAll.apply(ctx, args);
          collectMounted();
          safe(function () { if (typeof window._resizeFinp === 'function') window._resizeFinp(); });
          return result;
        } finally {
          releaseAllMounted(1500);
        }
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
            safe(function () {
              if (typeof window.__LIBERO_SET_PROGRESS_SUSPENDED === 'function') {
                window.__LIBERO_SET_PROGRESS_SUSPENDED(false);
              } else {
                window.__LIBERO_PROGRESS_SUSPENDED__ = false;
              }
            });
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
