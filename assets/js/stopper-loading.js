// LIBERO: Overlay loading Stopper dan umpan balik progres.
(function installStopperLoading() {
  if (window.LStopperLoading) return;

  var css = ''
    + '.lstop-ov{position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.76);backdrop-filter:blur(9px);cursor:default}'
    + '.lstop-ov.open{display:flex}'
    + '.lstop-box{width:min(380px,92vw);display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;color:#f8fafc}'
    + '.lstop-logo{width:132px;max-width:48vw;transform-origin:center;will-change:transform,filter,opacity;filter:drop-shadow(0 14px 32px rgba(0,0,0,.55));animation:lstop-logo-breathe 2.6s cubic-bezier(.4,0,.2,1) infinite}'
    + '.lstop-fallback{display:none;font-size:28px;font-weight:900;letter-spacing:.08em;color:rgb(var(--ac,93,224,133));text-shadow:0 0 18px rgba(var(--ac,93,224,133),.28);animation:lstop-logo-breathe 2.6s cubic-bezier(.4,0,.2,1) infinite}'
    + '.lstop-ring{width:68px;height:68px;position:relative}'
    + '.lstop-ring svg{width:68px;height:68px;transform:rotate(-90deg)}'
    + '.lstop-ring-bg{stroke:rgba(255,255,255,.18);fill:none;stroke-width:5}'
    + '.lstop-ring-fg{stroke:rgb(var(--ac,93,224,133));fill:none;stroke-width:5;stroke-linecap:round;stroke-dasharray:138.23;stroke-dashoffset:138.23;transition:stroke-dashoffset .55s cubic-bezier(.4,0,.2,1),stroke .25s ease;filter:drop-shadow(0 0 8px rgba(var(--ac,93,224,133),.35))}'
    + '.lstop-ring.done .lstop-ring-fg{stroke:#5de085}'
    + '.lstop-pct{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;letter-spacing:.02em;color:rgba(255,255,255,.86)}'
    + '.lstop-title{font-size:13px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:rgb(var(--ac,93,224,133));animation:lstop-title-pulse 2.6s ease-in-out infinite}'
    + '.lstop-msg{font-size:15px;font-weight:800;line-height:1.35}'
    + '.lstop-detail{font-size:12px;line-height:1.45;color:rgba(255,255,255,.68);max-width:320px}'
    + '.lstop-dots{display:flex;gap:5px}'
    + '.lstop-dots span{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.55);animation:lstop-dot 1.2s ease-in-out infinite}'
    + '.lstop-dots span:nth-child(2){animation-delay:.16s}.lstop-dots span:nth-child(3){animation-delay:.32s}'
    + '@keyframes lstop-logo-breathe{0%,100%{opacity:.9;transform:translateY(0) scale(.985);filter:drop-shadow(0 14px 32px rgba(0,0,0,.55)) drop-shadow(0 0 0 rgba(var(--ac,93,224,133),0))}45%{opacity:1;transform:translateY(-3px) scale(1.045);filter:drop-shadow(0 18px 38px rgba(0,0,0,.58)) drop-shadow(0 0 24px rgba(var(--ac,93,224,133),.5))}70%{opacity:.96;transform:translateY(-1px) scale(1.01);filter:drop-shadow(0 15px 34px rgba(0,0,0,.55)) drop-shadow(0 0 10px rgba(var(--ac,93,224,133),.24))}}'
    + '@keyframes lstop-title-pulse{0%,100%{opacity:.82;text-shadow:0 0 0 rgba(var(--ac,93,224,133),0)}45%{opacity:1;text-shadow:0 0 16px rgba(var(--ac,93,224,133),.42)}}'
    + '@keyframes lstop-dot{0%,80%,100%{opacity:.28;transform:translateY(0)}40%{opacity:1;transform:translateY(-4px)}}';

  var style = document.createElement('style');
  style.id = 'lstop-style';
  style.textContent = css;
  document.head.appendChild(style);

  var RING_DASH = 138.23;
  var timer = null;
  var steps = [];
  var stepIdx = 0;
  var currentProgress = 0;

  function ensure() {
    var ov = document.getElementById('libero-stopper-loading');
    if (ov) return ov;
    ov = document.createElement('div');
    ov.id = 'libero-stopper-loading';
    ov.className = 'lstop-ov';
    ov.innerHTML =
      '<div class="lstop-box">' +
      '<img class="lstop-logo" src="assets/images/LIBERO_web.png" alt="LIBERO">' +
      '<div class="lstop-fallback">LIBERO</div>' +
      '<div class="lstop-ring"><svg viewBox="0 0 56 56"><circle class="lstop-ring-bg" cx="28" cy="28" r="22"></circle><circle class="lstop-ring-fg" cx="28" cy="28" r="22"></circle></svg><div class="lstop-pct" id="lstop-pct">0%</div></div>' +
      '<div class="lstop-title" id="lstop-title">STOPPER AI</div>' +
      '<div class="lstop-msg" id="lstop-msg">Memproses...</div>' +
      '<div class="lstop-detail" id="lstop-detail"></div>' +
      '<div class="lstop-dots"><span></span><span></span><span></span></div>' +
      '</div>';
    var logo = ov.querySelector('.lstop-logo');
    if (logo) {
      logo.onerror = function () {
        this.style.display = 'none';
        if (this.nextElementSibling) this.nextElementSibling.style.display = 'block';
      };
    }
    document.body.appendChild(ov);
    return ov;
  }

  function setText(opts) {
    opts = opts || {};
    var title = document.getElementById('lstop-title');
    var msg = document.getElementById('lstop-msg');
    var detail = document.getElementById('lstop-detail');
    if (title && opts.title) title.textContent = opts.title;
    if (msg && opts.message) msg.textContent = opts.message;
    if (detail) detail.textContent = opts.detail || '';
  }

  function clampProgress(value) {
    var n = Number(value);
    if (!Number.isFinite(n)) return currentProgress;
    return Math.max(0, Math.min(100, n));
  }

  function progressForStep(idx, total) {
    if (!total || total < 2) return 18;
    return Math.min(92, Math.round(12 + (idx / (total - 1)) * 78));
  }

  function setProgress(value) {
    currentProgress = clampProgress(value);
    var fg = document.querySelector('#libero-stopper-loading .lstop-ring-fg');
    var pct = document.getElementById('lstop-pct');
    if (fg) {
      fg.style.strokeDasharray = String(RING_DASH);
      fg.style.strokeDashoffset = String(RING_DASH * (1 - currentProgress / 100));
    }
    if (pct) pct.textContent = Math.round(currentProgress) + '%';
  }

  window.LStopperLoading = {
    show: function (opts) {
      opts = opts || {};
      var ov = ensure();
      var ring = ov.querySelector('.lstop-ring');
      if (ring) ring.classList.remove('done');
      steps = Array.isArray(opts.steps) ? opts.steps.slice() : [];
      stepIdx = 0;
      setText({
        title: opts.title || 'STOPPER AI',
        message: opts.message || steps[0] || 'Memproses...',
        detail: opts.detail || ''
      });
      setProgress(typeof opts.progress === 'number' ? opts.progress : progressForStep(0, steps.length));
      ov.classList.add('open');
      if (timer) clearInterval(timer);
      if (steps.length > 1) {
        timer = setInterval(function () {
          if (stepIdx >= steps.length - 1) {
            clearInterval(timer);
            timer = null;
            return;
          }
          stepIdx = Math.min(stepIdx + 1, steps.length - 1);
          setText({ message: steps[stepIdx], detail: opts.detail || '' });
          setProgress(progressForStep(stepIdx, steps.length));
        }, opts.interval || 3800);
      }
    },
    update: function (opts) {
      ensure();
      opts = opts || {};
      setText(opts);
      if (typeof opts.progress === 'number') setProgress(opts.progress);
    },
    done: function (message) {
      var ov = ensure();
      var ring = ov.querySelector('.lstop-ring');
      if (ring) ring.classList.add('done');
      setProgress(100);
      if (message) this.update({ message: message });
      this.hide(650);
    },
    hide: function (delay) {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      var ov = document.getElementById('libero-stopper-loading');
      if (!ov) return;
      setTimeout(function () { ov.classList.remove('open'); }, delay || 0);
    }
  };
})();
