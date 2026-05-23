// LIBERO: UI bersama untuk progress ring dan kelengkapan bagian.
(function () {
  if (window.__LIBERO_PROGRESS_READY && window.__LIBERO_PROGRESS_API) return;

  const ACC_REQ_CACHE = new Map();
  const ACC_CIRC = 50.27;
  let progressInputTimer = null;
  let progressIdleHandle = null;
  let progressSuspended = false;
  let progressDirty = false;

  /* ──────────────────────────────────────────────────────────
     Synthetic marker resolver registry
     Marker IDs (prefixed with "_") tidak punya DOM element.
     Resolver returns true (filled), false (missing), or null (skip).
     ────────────────────────────────────────────────────────── */
  const RESOLVERS = {};

  function registerReq(id, resolver) {
    if (typeof id !== 'string' || !id) return;
    if (typeof resolver !== 'function') {
      delete RESOLVERS[id];
      return;
    }
    RESOLVERS[id] = resolver;
  }

  function resolveReq(id) {
    const fn = RESOLVERS[id];
    if (typeof fn !== 'function') return null;
    try {
      const result = fn();
      if (result === null || result === undefined) return null;
      return !!result;
    } catch (_e) { return false; }
  }

  function accReqIds(accEl) {
    if (!accEl || !accEl.id) return [];
    if (ACC_REQ_CACHE.has(accEl.id)) return ACC_REQ_CACHE.get(accEl.id);

    const ids = [];
    accEl.querySelectorAll('.flbl.req').forEach(lbl => {
      let el = lbl.nextElementSibling;
      if (!el) return;

      let input = null;
      if (el.matches('input,select,textarea')) input = el;
      else input = el.querySelector('input,select,textarea');
      if (input && input.id) ids.push(input.id);
    });

    const uniq = [...new Set(ids)];
    ACC_REQ_CACHE.set(accEl.id, uniq);
    return uniq;
  }

  function initAccHeaderRings() {
    document.querySelectorAll('.acc-item').forEach(acc => {
      const hdr = acc.querySelector('.acc-hdr');
      if (!hdr) return;

      let meta = hdr.querySelector('.acc-meta');
      if (!meta) {
        meta = document.createElement('div');
        meta.className = 'acc-meta';
        const chev = hdr.querySelector('.acc-chev');
        if (chev) hdr.insertBefore(meta, chev);
        else hdr.appendChild(meta);
      }
      if (meta.querySelector('svg.acc-ring')) return;

      meta.innerHTML = `<svg class="acc-ring" viewBox="0 0 22 22" data-acc="${acc.id}" data-circ="${ACC_CIRC}">
      <circle class="acc-ring-bg" cx="11" cy="11" r="8" stroke-width="2"/>
      <circle class="acc-ring-fill" cx="11" cy="11" r="8" stroke-width="2" stroke-dasharray="${ACC_CIRC}" stroke-dashoffset="${ACC_CIRC}"/>
    </svg>`;
    });
  }

  function updateAccHeaderRings() {
    document.querySelectorAll('svg.acc-ring').forEach(svg => {
      const accId = svg.dataset.acc;
      const circ = parseFloat(svg.dataset.circ) || ACC_CIRC;
      const acc = document.getElementById(accId);
      const ids = accReqIds(acc);
      const fillEl = svg.querySelector('.acc-ring-fill');
      if (!ids.length || !fillEl) {
        svg.classList.add('dim');
        return;
      }

      svg.classList.remove('dim');
      const visibleIds = ids.filter(id => {
        const el = document.getElementById(id);
        return typeof isVisible === 'function' ? isVisible(el) : !!el;
      });
      if (!visibleIds.length) {
        svg.classList.add('dim');
        fillEl.style.strokeDashoffset = circ;
        return;
      }

      let filled = 0;
      visibleIds.forEach(id => {
        const el = document.getElementById(id);
        const visible = typeof isVisible === 'function' ? isVisible(el) : !!el;
        if (visible && (el.value || '').trim()) filled++;
      });
      const pct = Math.round(filled / visibleIds.length * 100);
      fillEl.style.strokeDashoffset = circ * (1 - pct / 100);
    });
  }

  function isConditionallyHidden(el) {
    if (!el) return true;
    let cur = el;
    while (cur && !cur.classList.contains('tab-panel')) {
      const st = cur.style;
      if (st && (st.display === 'none' || st.visibility === 'hidden')) return true;
      cur = cur.parentElement;
    }
    return false;
  }

  /* ──────────────────────────────────────────────────────────
     Slot accounting helper
     Walks getAllActiveIDs() and returns {total, filled} accurately:
     - DOM IDs: counted if mounted & not conditionally hidden.
       State (contributes? filled?) di-cache per ID supaya saat
       tab di lazy-unmount oleh lazy-tabs.js, total tetap stabil.
     - Synthetic markers (prefix "_"): counted via resolver registry.
     ────────────────────────────────────────────────────────── */
  const SLOT_CACHE = {};
  window.__LIBERO_PROGRESS_SLOT_CACHE = SLOT_CACHE;

  function tallySlots(ids) {
    let total = 0;
    let filled = 0;
    if (!Array.isArray(ids)) return { total: 0, filled: 0 };

    ids.forEach(id => {
      if (typeof id !== 'string' || !id) return;
      if (id.charAt(0) === '_') {
        const result = resolveReq(id);
        if (result === null || result === undefined) return;
        total++;
        if (result) filled++;
        return;
      }
      const el = document.getElementById(id);
      if (el) {
        const hidden = isConditionallyHidden(el);
        const value = (el.value || '').trim();
        // Update cache live setiap ID terlihat di DOM
        SLOT_CACHE[id] = { contributes: !hidden, filled: !!(value && !hidden) };
        if (!hidden) {
          total++;
          if (value) filled++;
        }
        return;
      }
      // Element tidak ada di DOM (kemungkinan tab di-unmount oleh lazy-tabs).
      // Pakai snapshot terakhir agar denominator tidak naik-turun.
      const cached = SLOT_CACHE[id];
      if (cached && cached.contributes) {
        total++;
        if (cached.filled) filled++;
      }
      // Tidak pernah ada cache → skip (ID memang belum pernah live).
    });

    return { total: total, filled: filled };
  }

  function clearSlotCache() {
    Object.keys(SLOT_CACHE).forEach(k => { delete SLOT_CACHE[k]; });
  }
  window.__LIBERO_PROGRESS_RESET_SLOTS = clearSlotCache;

  function updateProgress() {
    if (progressSuspended || window.__LIBERO_PROGRESS_SUSPENDED__) {
      progressDirty = true;
      return;
    }

    const pfill = document.getElementById('pfill');
    const pctEl = document.getElementById('pct');
    if (!pfill || !pctEl) return;

    const progressOpts = (arguments.length && arguments[0] && typeof arguments[0] === 'object') ? arguments[0] : {};
    const progressNow = (window.performance && performance.now) ? performance.now() : Date.now();
    const progressEvt = (typeof event !== 'undefined') ? event : (window.event || null);
    const fromInputEvent = progressEvt && progressEvt.type === 'input';
    const active = document.activeElement;
    const editingField = active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName || '');
    if (!progressOpts.force && (fromInputEvent || (editingField && window.__progressLastInputAt && (progressNow - window.__progressLastInputAt) < 2200))) {
      window.__progressLastInputAt = progressNow;
      scheduleProgressUpdate();
      return;
    }

    // Mount all tabs synchronously so unmounted IDs aren't dropped.
    // PREPARE_ALL mounts immediately and schedules a later unmount,
    // while preserving focus/scroll. Skip only on un-forced refreshes
    // when actively typing to avoid jank during input.
    const shouldMount = progressOpts.force || !editingField;
    if (shouldMount) {
      try {
        if (typeof window.__LIBERO_LAZY_PREPARE_ALL === 'function') {
          window.__LIBERO_LAZY_PREPARE_ALL(1500);
        } else if (typeof window.__LIBERO_LAZY_MOUNT_ALL === 'function') {
          window.__LIBERO_LAZY_MOUNT_ALL();
        }
      } catch (_e) { }
    }

    let pct = 0;

    try {
      const ids = (typeof getAllActiveIDs === 'function') ? (getAllActiveIDs() || []) : [];
      const tally = tallySlots(ids);
      pct = tally.total ? Math.round((tally.filled / tally.total) * 100) : 0;
    } catch (_e) {
      pct = 0;
    }

    pct = Math.max(0, Math.min(100, pct));
    pfill.style.width = pct + '%';
    pctEl.textContent = pct + '%';
    window.__progressLastPct = pct;
    if (pct >= 100) pfill.classList.add('pfull');
    else pfill.classList.remove('pfull');

    if (typeof updateTabRings === 'function') updateTabRings();
    updateAccHeaderRings();
  }

  function progressClock() {
    return (window.performance && performance.now) ? performance.now() : Date.now();
  }

  function cancelScheduledProgress() {
    if (progressInputTimer) {
      clearTimeout(progressInputTimer);
      progressInputTimer = null;
    }
    if (progressIdleHandle && typeof cancelIdleCallback === 'function') {
      cancelIdleCallback(progressIdleHandle);
    }
    progressIdleHandle = null;
  }

  function runScheduledProgress() {
    progressInputTimer = null;
    const run = () => {
      progressIdleHandle = null;
      updateProgress({ force: true });
    };
    if (typeof requestIdleCallback === 'function') {
      progressIdleHandle = requestIdleCallback(run, { timeout: 3000 });
    } else {
      setTimeout(run, 0);
    }
  }

  function scheduleProgressUpdate() {
    if (progressSuspended || window.__LIBERO_PROGRESS_SUSPENDED__) {
      progressDirty = true;
      return;
    }

    window.__progressLastInputAt = progressClock();
    cancelScheduledProgress();
    progressInputTimer = setTimeout(runScheduledProgress, 2200);
  }

  function updateProgressNow() {
    if (progressSuspended || window.__LIBERO_PROGRESS_SUSPENDED__) {
      progressDirty = true;
      return;
    }

    cancelScheduledProgress();
    updateProgress({ force: true });
  }

  function setProgressSuspended(value) {
    progressSuspended = !!value;
    window.__LIBERO_PROGRESS_SUSPENDED__ = progressSuspended;
    if (progressSuspended) {
      progressDirty = true;
      cancelScheduledProgress();
      return;
    }
    if (progressDirty) {
      progressDirty = false;
      updateProgress({ force: true });
    }
  }

  const api = {
    isConditionallyHidden,
    initAccHeaderRings,
    updateAccHeaderRings,
    updateProgress,
    updateProgressFull: function () { return updateProgress({ force: true }); },
    scheduleProgressUpdate,
    updateProgressNow,
    setProgressSuspended,
    registerReq,
    resolveReq,
    tallySlots,
  };

  window.__LIBERO_PROGRESS_API = api;
  window.__LIBERO_PROGRESS_READY = true;
  window._isConditionallyHidden = isConditionallyHidden;
  window._ACC_REQ_CACHE = ACC_REQ_CACHE;
  window.initAccHeaderRings = initAccHeaderRings;
  window.updateAccHeaderRings = updateAccHeaderRings;
  window.updateProgress = updateProgress;
  window.updateProgressFull = api.updateProgressFull;
  window.scheduleProgressUpdate = scheduleProgressUpdate;
  window.updateProgressNow = updateProgressNow;
  window.__LIBERO_SET_PROGRESS_SUSPENDED = setProgressSuspended;
  window.__LIBERO_REGISTER_REQ = registerReq;
  window.__LIBERO_RESOLVE_REQ = resolveReq;
  window.__LIBERO_TALLY_SLOTS = tallySlots;

  if (!window.__LIBERO_PROGRESS_LISTENERS_BOUND) {
    window.__LIBERO_PROGRESS_LISTENERS_BOUND = true;
    document.addEventListener('input', scheduleProgressUpdate);
    document.addEventListener('change', updateProgressNow);
  }
  document.addEventListener('DOMContentLoaded', () => {
    initAccHeaderRings();
    updateAccHeaderRings();
    updateProgress();
  });
})();
