// LIBERO: Helper UI status pembaruan launcher dan prompt instalasi.
(function () {
  var CIRC = 56.55;
  var restartToastDismissed = false;
  var pollTimer = null;

  function clampPct(pct) {
    pct = Number(pct) || 0;
    return Math.max(0, Math.min(100, pct));
  }

  function setRingProgress(pct) {
    var row = document.getElementById('snav-update-row');
    var fill = document.getElementById('snav-update-ring-fill');
    pct = clampPct(pct);
    if (row) row.classList.add('show');
    if (fill) fill.style.strokeDashoffset = String(CIRC * (1 - pct / 100));
  }

  function hideRing() {
    var row = document.getElementById('snav-update-row');
    if (row) row.classList.remove('show');
  }

  function notifyUpdateDeferred() {
    if (window.__liberoUpdateDeferredNotice) return;
    window.__liberoUpdateDeferredNotice = true;
    var msg = 'Unduhan pembaruan tertunda. LIBERO akan mencoba lagi otomatis.';
    if (typeof toastInfo === 'function') toastInfo(msg, 4500);
    else if (typeof toast === 'function') toast(msg, 4500);
    setTimeout(function () { window.__liberoUpdateDeferredNotice = false; }, 600000);
  }

  function removeRestartToast() {
    var old = document.getElementById('libero-update-restart-toast');
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  window.showUpdateReadyToast = function () {
    if (restartToastDismissed) return;
    if (document.getElementById('libero-update-restart-toast')) return;
    hideRing();
    var el = document.createElement('div');
    el.id = 'libero-update-restart-toast';
    el.className = 'libero-update-toast';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<div class="libero-update-toast-text">Pembaruan siap dipasang. Restart sekarang atau pasang saat dibuka lagi.</div>' +
      '<div class="libero-update-toast-actions">' +
      '<button type="button" class="libero-update-toast-later" id="libero-update-toast-later">Pasang Saat Dibuka Lagi</button>' +
      '<button type="button" class="libero-update-toast-restart" id="libero-update-toast-restart">Restart Sekarang</button>' +
      '</div>';
    document.body.appendChild(el);
    document.getElementById('libero-update-toast-later').onclick = function () {
      if (window.pywebview && window.pywebview.api && window.pywebview.api.schedule_update_install_on_next_launch) {
        window.pywebview.api.schedule_update_install_on_next_launch().catch(function () {});
      }
      restartToastDismissed = true;
      removeRestartToast();
    };
    document.getElementById('libero-update-toast-restart').onclick = function () {
      var btn = this;
      btn.disabled = true;
      btn.textContent = 'Memulai ulang...';
      if (window.pywebview && window.pywebview.api && window.pywebview.api.install_downloaded_update) {
        window.pywebview.api.install_downloaded_update().then(function (res) {
          if (typeof res === 'string') res = JSON.parse(res);
          if (res && res.ok === false) {
            btn.disabled = false;
            btn.textContent = 'Restart Sekarang';
            if (typeof toastWarning === 'function') toastWarning(res.err || 'Installer update belum siap');
          }
        }).catch(function () {
          btn.disabled = false;
          btn.textContent = 'Restart Sekarang';
        });
      }
    };
  };

  window.onUpdateProgress = function (pct) {
    setRingProgress(pct);
  };

  window.onUpdateStatus = function (status) {
    if (status !== 'downloading') hideRing();
  };

  window.onUpdateReady = function () {
    window.showUpdateReadyToast();
  };

  window.onUpdateError = function () {
    hideRing();
    notifyUpdateDeferred();
  };

  function consumeUpdateState(state) {
    if (!state) return;
    if (state.install_on_next_launch) {
      restartToastDismissed = true;
      hideRing();
      removeRestartToast();
      return;
    }
    if (state.status === 'downloading') {
      setRingProgress(state.progress || 0);
      return;
    }
    if (state.status === 'ready') {
      hideRing();
      window.showUpdateReadyToast(state.latest || '');
      return;
    }
    if (state.status === 'error') {
      hideRing();
      notifyUpdateDeferred();
      return;
    }
    hideRing();
  }

  function withUpdateApi(callback, tries) {
    tries = tries || 0;
    if (window.pywebview && window.pywebview.api) {
      callback(window.pywebview.api);
      return;
    }
    if (tries < 80) {
      setTimeout(function () { withUpdateApi(callback, tries + 1); }, 250);
    }
  }

  function markActive() {
    if (document.hidden) return;
    withUpdateApi(function (api) {
      if (api.mark_update_window_active) {
        api.mark_update_window_active().catch(function () {});
      }
    });
  }

  function pollUpdateState() {
    if (document.hidden) return;
    withUpdateApi(function (api) {
      if (!api.get_update_download_state) return;
      api.get_update_download_state().then(function (raw) {
        var state = typeof raw === 'string' ? JSON.parse(raw) : raw;
        consumeUpdateState(state);
      }).catch(function () {});
    });
  }

  function stopUpdateStatePolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function startUpdateStatePolling() {
    if (document.hidden) return;
    if (pollTimer) return;
    markActive();
    pollUpdateState();
    pollTimer = setInterval(pollUpdateState, 5000);
  }

  window.addEventListener('focus', markActive);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      startUpdateStatePolling();
    } else {
      stopUpdateStatePolling();
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startUpdateStatePolling);
  else startUpdateStatePolling();
})();
