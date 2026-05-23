// LIBERO: Panel progres AI Stopper dan UI status ekstraksi.
(function installStopperAiProgress() {
  var stepMessages = [
    'Mengunggah dokumen ke server...',
    'Menganalisis isi dokumen...',
    'Membaca tabel dan data terstruktur...',
    'Memetakan data ke formulir...',
    'Finalisasi hasil ekstraksi...'
  ];
  var step = 0;
  var timer = null;
  var fileNames = [];
  var styleInstalled = false;

  function installFallbackStyle() {
    if (styleInstalled || document.getElementById('stopper-ai-progress-style')) return;
    styleInstalled = true;
    var style = document.createElement('style');
    style.id = 'stopper-ai-progress-style';
    style.textContent = ''
      + '#ai-topbar-progress{position:fixed;top:0;left:0;right:0;z-index:99998;transform:translateY(-100%);opacity:0;transition:transform .35s cubic-bezier(.4,0,.2,1),opacity .35s ease;pointer-events:none}'
      + '#ai-topbar-progress.ai-prog-in{transform:translateY(0);opacity:1;pointer-events:auto}'
      + '#ai-topbar-progress.ai-prog-out{transform:translateY(-100%);opacity:0}'
      + '.ai-prog-inner{background:var(--topbar-bg);backdrop-filter:blur(12px);border-bottom:1px solid rgba(93,224,133,.15);padding:10px 24px 12px;display:flex;flex-direction:column;gap:7px}'
      + '.ai-prog-track{width:100%;height:4px;background:rgba(var(--tc),.08);border-radius:4px;overflow:hidden}'
      + '.ai-prog-fill{height:100%;width:0%;background:linear-gradient(90deg,rgba(var(--ac,93,224,133),1),rgba(var(--ac,93,224,133),.65));border-radius:4px;transition:width 1.2s cubic-bezier(.4,0,.2,1);box-shadow:0 0 12px rgba(93,224,133,.25)}'
      + '.ai-prog-info{display:flex;justify-content:space-between;align-items:center;gap:12px}'
      + '.ai-prog-status{font-size:12.5px;font-weight:600;color:rgba(var(--tc),.88);letter-spacing:.2px}'
      + '.ai-prog-files{font-size:11px;color:rgba(var(--tc),.4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%;text-align:right}'
      + '#ai-blocking-overlay{position:fixed;inset:0;z-index:99997;background:rgba(0,0,0,.5);backdrop-filter:blur(3px);cursor:default}';
    document.head.appendChild(style);
  }

  function updateStep() {
    var fill = document.getElementById('ai-prog-fill');
    var status = document.getElementById('ai-prog-status');
    if (!fill || !status) return;
    var pct = Math.min(15 + (step / (stepMessages.length - 1)) * 75, 90);
    fill.style.width = pct + '%';
    status.textContent = stepMessages[step];
  }

  function showFallback(fileList) {
    installFallbackStyle();
    var old = document.getElementById('ai-topbar-progress');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var oldOverlay = document.getElementById('ai-blocking-overlay');
    if (oldOverlay && oldOverlay.parentNode) oldOverlay.parentNode.removeChild(oldOverlay);
    var overlay = document.createElement('div');
    overlay.id = 'ai-blocking-overlay';
    document.body.appendChild(overlay);

    var bar = document.createElement('div');
    bar.id = 'ai-topbar-progress';
    bar.innerHTML = [
      '<div class="ai-prog-inner">',
      '  <div class="ai-prog-track"><div class="ai-prog-fill" id="ai-prog-fill"></div></div>',
      '  <div class="ai-prog-info">',
      '    <span class="ai-prog-status" id="ai-prog-status">Memulai ekstraksi...</span>',
      '    <span class="ai-prog-files" id="ai-prog-files"></span>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(bar);

    var filesEl = document.getElementById('ai-prog-files');
    if (filesEl && fileNames.length) {
      filesEl.textContent = fileNames.length + ' file: ' + fileNames.join(', ');
    }

    requestAnimationFrame(function () { bar.classList.add('ai-prog-in'); });
    step = 0;
    updateStep();
    timer = setInterval(function () {
      step++;
      if (step >= stepMessages.length) step = stepMessages.length - 1;
      updateStep();
    }, 4500);
  }

  function show(fileList) {
    fileNames = (fileList || []).map(function (p) {
      return String(p || '').replace(/^.*[\\/\\\\]/, '');
    });
    step = 0;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (window.LStopperLoading) {
      var detail = fileNames.length ? (fileNames.length + ' file: ' + fileNames.join(', ')) : '';
      window.LStopperLoading.show({
        title: 'STOPPER AI',
        message: stepMessages[0],
        detail: detail,
        steps: stepMessages,
        interval: 4500
      });
      return;
    }
    showFallback(fileList);
  }

  function done(success, msg) {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (window.LStopperLoading) {
      if (success) window.LStopperLoading.done(msg || 'Selesai.');
      else window.LStopperLoading.hide();
      return;
    }

    var fill = document.getElementById('ai-prog-fill');
    var status = document.getElementById('ai-prog-status');
    var bar = document.getElementById('ai-topbar-progress');
    if (fill) {
      fill.style.width = '100%';
      fill.style.background = success
        ? 'linear-gradient(90deg, #2ecc71, #27ae60)'
        : 'linear-gradient(90deg, #e74c3c, #c0392b)';
    }
    if (status) status.textContent = msg || (success ? 'Selesai' : 'Gagal');

    var overlay = document.getElementById('ai-blocking-overlay');
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);

    setTimeout(function () {
      if (bar) {
        bar.classList.remove('ai-prog-in');
        bar.classList.add('ai-prog-out');
      }
      setTimeout(function () {
        if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
      }, 500);
    }, success ? 2500 : 4000);
  }

  async function ensureTabsMounted(holdMs) {
    try {
      if (typeof window.__LIBERO_LAZY_PREPARE_ALL === 'function') {
        await window.__LIBERO_LAZY_PREPARE_ALL(holdMs || 120000);
      } else if (typeof window.__LIBERO_LAZY_MOUNT_ALL === 'function') {
        window.__LIBERO_LAZY_MOUNT_ALL();
      }
    } catch (_e) { }
  }

  window.LStopperAiProgress = {
    show: show,
    done: done,
    ensureTabsMounted: ensureTabsMounted
  };
})();
