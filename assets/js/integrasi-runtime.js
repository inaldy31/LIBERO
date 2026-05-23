// LIBERO: Alur formulir Integrasi untuk tab, progres, ambil/muat data, dan perintah.
/* ══════════════════════════════════════════════════════════
       LIBERO — Main Script
       Order: Theme Engine → Fullscreen → Toast → Bridge/Core → Clock
       → Core UI → Progress → Bridge+Nav → Zoom → Datepicker
       → Tab 0–XII → CONSOLIDATED (commands · autosave) → Splash Anim
       → Dialog → Compat
    ══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════
   THEME ENGINE
══════════════════════════════════════════ */
/* ── LIBERO Theme Engine ── */
(function () {
  var THEMES = [
    { id: 'standar', label: 'Standar' },
    { id: 'blau', label: 'Blau' },
    { id: 'weekday', label: 'Weekday' },
    { id: '9-to-5', label: '9 to 5' },
    { id: 'future', label: 'Future' },
    { id: 'omni', label: 'Omni' },
    { id: 'more-relevant', label: 'More Relevant' },
    { id: 'screwdriver', label: 'Screwdriver' },
    { id: 'ceremonial', label: 'Ceremonial' },
    { id: 'pentahelix', label: 'Pentahelix' },
    { id: 'corona', label: 'Corona' },
    { id: 'jason', label: 'Jason' },
    { id: 'banyan-tree', label: 'Banyan Tree' },
    { id: 'preorder', label: 'Preorder' },
    { id: 'college', label: 'College' },
    { id: 'clown', label: 'Clown' },
    { id: 'bucharest', label: 'Bucharest' },
    { id: 'strauss', label: 'Strauss' },
    { id: 'brooks', label: 'Brooks' },
    { id: 'harbor', label: 'Harbor' },
    { id: 'car-call', label: 'Car Call' },
    { id: 'servant', label: 'Servant' },
    { id: 'nastasic', label: 'Nastasic' },
    { id: 'kilpin', label: 'Kilpin' },
    { id: 'westfalen', label: 'Westfalen' },
    { id: 'grandma', label: 'Grandma' },
    { id: 'snake', label: 'Snake' },
    { id: 'justin', label: 'Justin' },
  ];
  var DEFAULT = 'standar';
  var THEME_BUCKETS = {
    'standar': 'dark',
    '9-to-5': 'dark',
    'future': 'dark',
    'omni': 'dark',
    'more-relevant': 'dark',
    'screwdriver': 'dark',
    'strauss': 'dark',
    'brooks': 'dark',
    'harbor': 'dark',
    'car-call': 'dark',
    'nastasic': 'dark',
    'kilpin': 'dark',
    'westfalen': 'dark',
    'snake': 'dark',
    'college': 'dark',
    'blau': 'light',
    'weekday': 'light',
    'ceremonial': 'light',
    'pentahelix': 'light',
    'corona': 'light',
    'jason': 'light',
    'clown': 'light',
    'servant': 'light',
    'banyan-tree': 'hybrid',
    'preorder': 'hybrid',
    'bucharest': 'hybrid',
    'grandma': 'hybrid',
    'justin': 'hybrid',
  };
  var THEME_SURFACES = {
    'standar': 'dark-shell',
    '9-to-5': 'dark-shell',
    'future': 'dark-shell',
    'omni': 'dark-shell',
    'more-relevant': 'dark-shell',
    'screwdriver': 'dark-shell',
    'strauss': 'dark-shell',
    'brooks': 'dark-shell',
    'harbor': 'dark-shell',
    'car-call': 'dark-shell',
    'nastasic': 'dark-shell',
    'kilpin': 'dark-shell',
    'westfalen': 'dark-shell',
    'snake': 'dark-shell',
    'college': 'dark-shell',
    'blau': 'light-shell',
    'weekday': 'light-shell',
    'ceremonial': 'light-shell',
    'pentahelix': 'light-shell',
    'corona': 'light-shell',
    'jason': 'light-shell',
    'clown': 'light-shell',
    'servant': 'light-shell',
    'banyan-tree': 'split-shell',
    'preorder': 'split-shell',
    'bucharest': 'split-shell',
    'grandma': 'split-shell',
    'justin': 'split-shell',
  };
  var _menuOpen = false;
  // Baca tema awal dari window._LT yang diinjeksi Python, fallback ke data-theme jika ada
  var _current = window._LT
    || document.documentElement.getAttribute('data-theme')
    || DEFAULT;

  function themeBucket(name) {
    if (window.LiberoTheme && typeof window.LiberoTheme.themeBucket === 'function') {
      return window.LiberoTheme.themeBucket(name);
    }
    return THEME_BUCKETS[name] || 'dark';
  }

  function themeSurface(name) {
    if (window.LiberoTheme && typeof window.LiberoTheme.themeSurface === 'function') {
      return window.LiberoTheme.themeSurface(name);
    }
    return THEME_SURFACES[name] || 'dark-shell';
  }

  function _applyThemeMetadata(root, name) {
    var bucket = themeBucket(name || DEFAULT);
    window._LT = name || DEFAULT;
    window._LT_BUCKET = bucket;
    window._LT_SURFACE = themeSurface(name || DEFAULT);
    root.setAttribute('data-theme-bucket', bucket);
    root.setAttribute('data-theme-surface', window._LT_SURFACE);
    root.style.colorScheme = (bucket === 'light' || bucket === 'hybrid') ? 'light' : 'dark';
  }

  function _applyVisual(name) {
    var root = document.documentElement;
    _current = name;
    if (name === DEFAULT) {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', name);
    }
    _applyThemeMetadata(root, name);
    var t = THEMES.find(function (x) { return x.id === name; }) || THEMES[0];
    var lbl = document.getElementById('theme-btn-label');
    if (lbl) lbl.textContent = t.label;
    /* rebuild menu agar active state langsung terupdate */
    if (document.getElementById('theme-menu') && document.getElementById('theme-menu').style.display !== 'none') {
      buildMenu();
    }
  }

  function setTheme(name, fromUser) {
    _applyVisual(name);
    // Simpan ke Python HANYA saat user klik — bukan saat init
    // Ini satu-satunya cara reliable: pywebview api pasti sudah siap saat user bisa klik
    if (fromUser) {
      try {
        if (window.pywebview && window.pywebview.api && window.pywebview.api.save_theme) {
          window.pywebview.api.save_theme(name);
        }
      } catch (_) { }
    }
  }

  function buildMenu() {
    var menu = document.getElementById('theme-menu-inner') || document.getElementById('theme-menu');
    if (!menu) return;
    menu.innerHTML = '';

    /* grid wrapper 4 kolom */
    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:4px;';

    /* 4-stop gradasi penuh: bg → bg-mid → aksen → aksen-light */
    var themeColors = {
      'standar': ['#08223E', '#0a2845', '#E1B749', '#f0cc6e'],
      'blau': ['#f0f4f8', '#e0e8f4', '#2563eb', '#60a5fa'],
      'weekday': ['#f5f0e8', '#ede6d8', '#92400e', '#d97706'],
      '9-to-5': ['#18100f', '#2E1C16', '#C8A55A', '#debb72'],
      'strauss': ['#1c2830', '#243540', '#A06845', '#be8460'],
      'brooks': ['#0e0814', '#1e1030', '#DC3CB4', '#f060d0'],
      'harbor': ['#0c1c1e', '#163032', '#3CAABB', '#5accd8'],
      'car-call': ['#161412', '#2A2620', '#B4A488', '#ccc0a0'],
      'servant': ['#EDE0C0', '#D4B878', '#946428', '#b07c3e'],
      'nastasic': ['#1C1C18', '#2E2C26', '#C8B870', '#ddd090'],
      'kilpin': ['#030000', '#0d0000', '#C8102E', '#C8A050'],
      'future': ['#000000', '#111111', '#cccccc', '#ffffff'],
      'omni': ['#160f22', '#1e1530', '#E8C97A', '#C3A8E8'],
      'westfalen': ['#120e00', '#1a1a00', '#FDE100', '#fff066'],
      'more-relevant': ['#0c1610', '#162612', '#C8A850', '#80be70'],
      'screwdriver': ['#3a0a12', '#080808', '#E8C97A', '#f0da9e'],
      'ceremonial': ['#e8f0e6', '#dce8d8', '#4a7c59', '#7aac8a'],
      'pentahelix': ['#fffbea', '#fff8d0', '#a07800', '#d4a800'],
      'corona': ['#f5eeff', '#ebdcff', '#7c4fa0', '#b080d8'],
      'jason': ['#fff0f4', '#ffe1eb', '#b03060', '#e06090'],
      'banyan-tree': ['#1C2C5F', '#B8901A', '#CCA032', '#C8DDEF'],
      'grandma': ['#000000', '#222222', '#1a1a1a', '#f0cc6e'],
      'snake': ['#000008', '#00000d', '#5590E0', '#D4A017'],
      'justin': ['#fff8f2', '#ffe8d4', '#FF9A00', '#ffcc66'],
      'preorder': ['#F9F6ED', '#EAE7DF', '#C8A040', '#e0bc60'],
      'bucharest': ['#cfecec', '#bfe4e4', '#0a6060', '#1a8080'],
      'college': ['#2a2e34', '#333840', '#9098a8', '#b8c0cc'],
    };
    var lightThemes = ['servant', 'blau', 'weekday', 'ceremonial', 'pentahelix', 'corona', 'jason', 'preorder', 'banyan-tree', 'clown', 'bucharest', 'grandma', 'justin'];

    THEMES.forEach(function (t) {
      var isActive = _current === t.id;
      var c = themeColors[t.id] || ['#08223E', '#0a2845', '#E1B749', '#f0cc6e'];
      var grad = 'linear-gradient(90deg,' + c[0] + ' 0%,' + c[1] + ' 33%,' + c[2] + ' 67%,' + c[3] + ' 100%)';

      var item = document.createElement('button');
      item.style.cssText = [
        'display:flex;align-items:center;justify-content:center;',
        'padding:8px 6px;border-radius:7px;',
        'border:1px solid ' + (isActive ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.07)') + ';',
        'background:' + (isActive ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.03)') + ';',
        'color:rgba(255,255,255,.8);font-size:10px;font-weight:700;letter-spacing:.35px;',
        'cursor:pointer;text-align:center;transition:all .13s;font-family:inherit;white-space:nowrap;',
      ].join('');
      item.onmouseover = function () { this.style.background = 'rgba(255,255,255,.13)'; this.style.borderColor = 'rgba(255,255,255,.3)'; };
      item.onmouseout = function () {
        var act = _current === t.id;
        this.style.background = act ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.03)';
        this.style.borderColor = act ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.07)';
      };

      var lbl = document.createElement('span');
      lbl.textContent = t.label;
      lbl.style.cssText = 'line-height:1;color:' + (isActive ? '#fff' : 'rgba(255,255,255,.7)') + ';font-weight:' + (isActive ? '800' : '600') + ';';

      item.appendChild(lbl);
      item.onclick = function () { setTheme(t.id, true); closeMenu(); };
      grid.appendChild(item);
    });

    menu.appendChild(grid);
  }

  function openMenu() {
    var menu = document.getElementById('theme-menu');
    if (!menu) return;
    buildMenu();
    menu.style.display = 'block';
    var tbtn = document.getElementById('theme-btn');
    if (tbtn) {
      var r = tbtn.getBoundingClientRect();
      var mw = menu.offsetWidth || 480;
      var left = r.right - mw;
      if (left < 8) left = 8;
      if (left + mw > window.innerWidth - 8) left = window.innerWidth - mw - 8;
      menu.style.bottom = (window.innerHeight - r.top + 6) + 'px';
      menu.style.left = left + 'px';
    }
    _menuOpen = true;
  }
  function closeMenu() {
    var menu = document.getElementById('theme-menu');
    if (menu) menu.style.display = 'none';
    _menuOpen = false;
  }

  window.toggleThemeMenu = function (e) {
    e.stopPropagation();
    if (_menuOpen) { closeMenu(); } else { openMenu(); }
  };
  window.setTheme = setTheme;

  document.addEventListener('click', function (e) {
    var sw = document.getElementById('theme-switcher');
    if (_menuOpen && sw && !sw.contains(e.target)) closeMenu();
  });

  // Init: sinkronkan _current dari window._LT dan data-theme, lalu terapkan
  document.addEventListener('DOMContentLoaded', function () {
    // Prioritaskan window._LT, fallback ke data-theme yang sudah ada di <html>
    var _dt = document.documentElement.getAttribute('data-theme');
    _current = window._LT || _dt || DEFAULT;
    _applyVisual(_current);
    buildMenu();
  });
})();

/* FULLSCREEN TOGGLE */
(function () {
  function _updateIcon(isFs) {
    var expand = document.getElementById('fs-icon-expand');
    var compress = document.getElementById('fs-icon-compress');
    if (!expand || !compress) return;
    expand.style.display = isFs ? 'none' : '';
    compress.style.display = isFs ? '' : 'none';
  }

  var _isFs = true;
  var _fsBusy = false;

  window.toggleFullscreen = function () {
    if (_fsBusy) return;
    if (window.pywebview && window.pywebview.api && window.pywebview.api.toggle_fullscreen) {
      var next = !_isFs;
      _fsBusy = true;
      window.pywebview.api.toggle_fullscreen().then(function (res) {
        if (res && res.ok) {
          _isFs = next;
          _updateIcon(_isFs);
        }
      }).catch(function () { })
        .finally(function () {
          _fsBusy = false;
        });
    }
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'F11' && !_isFs) { e.preventDefault(); window.toggleFullscreen(); }
    if (e.key === 'Escape' && _isFs) { e.preventDefault(); window.toggleFullscreen(); }
  }, true);
})();

/* TOAST NOTIFICATION */
(function () {
  var _stack = [];
  var _visible = null;
  var _timer = null;

  /* inject CSS once */
  var _cssEl = document.createElement('style');
  _cssEl.textContent = `
    .toast-wrap {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      pointer-events: none;
    }
    ._toast-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 26px 14px 18px;
      border-radius: 16px;
      border: 1px solid;
      
      font-size: 15px;
      font-weight: 600;
      letter-spacing: .3px;
      max-width: 520px;
      min-width: 260px;
      text-align: left;
      box-shadow: 0 24px 60px rgba(0,0,0,.65), 0 0 0 1px rgba(var(--ac),.06), inset 0 1px 0 rgba(var(--ac),.08);
      backdrop-filter: blur(24px);
      opacity: 0;
      transform: scale(.86) translateY(-22px);
      transition: opacity .32s ease, transform .46s cubic-bezier(.16,1,.3,1);
      pointer-events: none;
      white-space: pre-line;
      line-height: 1.5;
      overflow: hidden;
    }
    ._toast-item.in  { opacity: 1; transform: scale(1) translateY(0); }
    ._toast-item.out { opacity: 0; transform: scale(.94) translateY(8px); transition: opacity .22s ease, transform .22s ease; }
    /* ── Icon enter animations per type ── */
    ._toast-item.in ._toast-icon { animation: _toast-icon-pop .52s cubic-bezier(.16,1.6,.3,1) .04s both; }
    ._toast-error.in   ._toast-icon { animation: _toast-icon-shake  .48s ease .04s both; }
    ._toast-warning.in ._toast-icon { animation: _toast-icon-wobble .54s cubic-bezier(.16,1.4,.3,1) .04s both; }
    @keyframes _toast-icon-pop {
      0%   { transform: scale(.25) rotate(-14deg); opacity: 0; }
      55%  { transform: scale(1.28) rotate(6deg);  opacity: 1; }
      75%  { transform: scale(.91) rotate(-2deg); }
      100% { transform: scale(1)   rotate(0);      opacity: 1; }
    }
    @keyframes _toast-icon-shake {
      0%   { transform: translateX(0)    scale(.4);   opacity: 0; }
      12%  { transform: translateX(-8px) scale(1.12); opacity: 1; }
      28%  { transform: translateX(6px)  scale(1); }
      44%  { transform: translateX(-4px); }
      60%  { transform: translateX(3px); }
      78%  { transform: translateX(-1px); }
      100% { transform: translateX(0)    scale(1);    opacity: 1; }
    }
    @keyframes _toast-icon-wobble {
      0%   { transform: scale(.3)  rotate(-18deg); opacity: 0; }
      50%  { transform: scale(1.2) rotate(10deg);  opacity: 1; }
      75%  { transform: scale(.94) rotate(-4deg); }
      100% { transform: scale(1)   rotate(0);      opacity: 1; }
    }
    /* ── Shimmer scan on entry ── */
    ._toast-item::before {
      content: '';
      position: absolute;
      top: 0; left: -80%;
      width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.06), transparent);
      pointer-events: none;
      z-index: 2;
      opacity: 0;
    }
    ._toast-item.in::before { animation: _toast-shimmer .7s ease .06s 1; }
    @keyframes _toast-shimmer {
      0%   { left: -50%; opacity: 1; }
      100% { left: 115%;  opacity: 1; }
    }
    /* ── Progress bar ── */
    ._toast-bar {
      position: absolute;
      bottom: 0; left: 0;
      height: 3px;
      width: 100%;
      border-radius: 0 0 16px 16px;
      transform: scaleX(1);
      transform-origin: left center;
    }
    ._toast-bar.depleting { transform: scaleX(0); }
    ._toast-success  ._toast-bar { background: linear-gradient(90deg, rgba(74,196,104,.9), rgba(74,196,104,.4)); }
    ._toast-error    ._toast-bar { background: linear-gradient(90deg, rgba(220,80,80,.9),  rgba(220,80,80,.4)); }
    ._toast-warning  ._toast-bar { background: linear-gradient(90deg, rgba(225,170,50,.9), rgba(225,170,50,.4)); }
    ._toast-info     ._toast-bar { background: linear-gradient(90deg, rgba(var(--ac),.85), rgba(var(--ac),.3)); }
    ._toast-progress ._toast-bar { background: linear-gradient(90deg, rgba(var(--ac),.75), rgba(var(--ac),.2)); }
    ._toast-save     ._toast-bar { background: linear-gradient(90deg, rgba(var(--ac),.9),  rgba(var(--ac),.35)); }
    ._toast-icon {
      flex-shrink: 0;
      width: 36px; height: 36px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid;
    }
    ._toast-icon svg { width: 18px; height: 18px; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    ._toast-progress ._toast-icon svg { animation: _toast-spin 1.2s linear infinite; }
    @keyframes _toast-spin { to { transform: rotate(360deg); } }
    ._toast-text { display: flex; flex-direction: column; gap: 2px; }
    ._toast-label { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; opacity: .6; }
    ._toast-body  { font-size: 15px; font-weight: 600; }
    /* ── Action buttons inside toast ── */
    ._toast-inner { display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 0; }
    ._toast-actions {
      display: flex; gap: 8px; flex-wrap: wrap;
      animation: _toast-acts-in .3s cubic-bezier(.16,1,.3,1) .18s both;
    }
    @keyframes _toast-acts-in {
      0%   { opacity: 0; transform: translateY(6px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    ._toast-act-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 14px;
      border-radius: 8px;
      border: 1px solid;
      background: transparent;
      
      font-size: 11px; font-weight: 700; letter-spacing: .8px;
      text-transform: uppercase;
      cursor: pointer;
      transition: background .18s, border-color .18s, transform .14s, box-shadow .18s;
      color: inherit;
      pointer-events: all;
      position: relative;
      overflow: hidden;
    }
    ._toast-act-btn svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
    ._toast-act-btn:hover  { transform: translateY(-1px); }
    ._toast-act-btn:active { transform: translateY(0) scale(.97); }
    ._toast-act-btn::after {
      content:''; position:absolute; inset:0;
      background: rgba(255,255,255,.14);
      opacity:0; transform:scale(0); pointer-events:none; border-radius:inherit;
    }
    ._toast-act-btn:active::after { animation: _toast-btn-ripple .32s ease; }
    @keyframes _toast-btn-ripple { 0%{opacity:1;transform:scale(0)} 100%{opacity:0;transform:scale(2.4)} }
    /* success-themed action buttons */
    ._toast-success ._toast-act-btn { border-color: rgba(74,196,104,.35); color: #7af0a0; }
    ._toast-success ._toast-act-btn:hover { background: rgba(74,196,104,.18); border-color: rgba(74,196,104,.65); box-shadow: 0 4px 14px rgba(74,196,104,.18); }
    /* doc type */
    ._toast-doc {
      background: rgba(5,28,14,.96);
      border-color: rgba(74,196,104,.42);
      color: #b8f5cc;
    }
    ._toast-doc ._toast-icon { background: rgba(74,196,104,.14); border-color: rgba(74,196,104,.4); }
    ._toast-doc ._toast-icon svg { stroke: #5de085; }
    ._toast-doc ._toast-label { opacity: .65; }
    ._toast-doc ._toast-act-btn { border-color: rgba(74,196,104,.35); color: #7af0a0; }
    ._toast-doc ._toast-act-btn:hover { background: rgba(74,196,104,.18); border-color: rgba(74,196,104,.65); box-shadow: 0 4px 14px rgba(74,196,104,.18); }
    ._toast-doc ._toast-bar { background: linear-gradient(90deg, rgba(74,196,104,.9), rgba(74,196,104,.4)); }
    /* types */
    ._toast-success {
      background: rgba(5,28,14,.95);
      border-color: rgba(74,196,104,.4);
      color: #b8f5cc;
    }
    ._toast-success ._toast-icon { background: rgba(74,196,104,.14); border-color: rgba(74,196,104,.4); }
    ._toast-success ._toast-icon svg { stroke: #5de085; }
    ._toast-error {
      background: rgba(28,6,6,.95);
      border-color: rgba(220,80,80,.45);
      color: #f5b0b0;
    }
    ._toast-error ._toast-icon { background: rgba(220,80,80,.12); border-color: rgba(220,80,80,.45); }
    ._toast-error ._toast-icon svg { stroke: #f08080; }
    ._toast-warning {
      background: rgba(22,16,2,.95);
      border-color: rgba(225,170,50,.4);
      color: #f5df90;
    }
    ._toast-warning ._toast-icon { background: rgba(225,170,50,.12); border-color: rgba(225,170,50,.4); }
    ._toast-warning ._toast-icon svg { stroke: #e8c050; }
    /* light-theme overrides for semantic types */
    [data-theme="blau"] ._toast-success,
    [data-theme="weekday"]   ._toast-success,
    [data-theme="clown"]        ._toast-success,
    [data-theme="bucharest"]    ._toast-success {
      background: rgba(220,250,230,.96); border-color: rgba(74,196,104,.45); color: #1a5e2a;
    }
    [data-theme="blau"] ._toast-success ._toast-icon,
    [data-theme="weekday"]   ._toast-success ._toast-icon { background: rgba(74,196,104,.18); border-color: rgba(74,196,104,.5); }
    [data-theme="blau"] ._toast-error,
    [data-theme="weekday"]   ._toast-error {
      background: rgba(254,226,226,.97); border-color: rgba(220,80,80,.4); color: #7f1d1d;
    }
    [data-theme="blau"] ._toast-error ._toast-icon,
    [data-theme="weekday"]   ._toast-error ._toast-icon { background: rgba(220,80,80,.1); border-color: rgba(220,80,80,.4); }
    [data-theme="blau"] ._toast-warning,
    [data-theme="weekday"]   ._toast-warning {
      background: rgba(255,245,210,.97); border-color: rgba(200,140,20,.4); color: #78450a;
    }
    [data-theme="blau"] ._toast-warning ._toast-icon,
    [data-theme="weekday"]   ._toast-warning ._toast-icon { background: rgba(200,140,20,.12); border-color: rgba(200,140,20,.45); }
    [data-theme="blau"] ._toast-warning ._toast-icon svg,
    [data-theme="weekday"]   ._toast-warning ._toast-icon svg { stroke: #a86010; }
    /* info — fully theme-aware */
    ._toast-info {
      background: rgba(var(--toast-bg), .96);
      border-color: rgba(var(--ac), .32);
      color: rgba(var(--tc), .92);
    }
    ._toast-info ._toast-icon { background: rgba(var(--ac), .1); border-color: rgba(var(--ac), .3); }
    ._toast-info ._toast-icon svg { stroke: rgb(var(--ac)); }
    /* progress — fully theme-aware */
    ._toast-progress {
      background: rgba(var(--toast-bg), .96);
      border-color: rgba(var(--ac), .28);
      color: rgba(var(--tc), .88);
    }
    ._toast-progress ._toast-icon { background: rgba(var(--ac), .1); border-color: rgba(var(--ac), .28); }
    ._toast-progress ._toast-icon svg { stroke: rgb(var(--ac)); }
    /* save — fully theme-aware with glow */
    ._toast-save {
      background: rgba(var(--toast-bg), .97);
      border-color: rgba(var(--ac), .55);
      color: rgba(var(--tc), .95);
      box-shadow: 0 24px 60px rgba(0,0,0,.7), 0 0 40px rgba(var(--ac),.08), inset 0 1px 0 rgba(var(--ac),.12);
    }
    ._toast-save ._toast-icon {
      background: rgba(var(--ac), .14);
      border-color: rgba(var(--ac), .5);
      box-shadow: 0 0 16px rgba(var(--ac), .18);
    }
    ._toast-save ._toast-icon svg { stroke: rgb(var(--ac)); }
    ._toast-save ._toast-label { color: rgba(var(--ac), .8); }
    ._toast-save ._toast-body  { color: rgba(var(--tc), .97); font-size: 16px; font-weight: 700; }
  `;
  document.head.appendChild(_cssEl);

  /* create wrapper */
  var _wrap = document.createElement('div');
  _wrap.className = 'toast-wrap';
  document.body.appendChild(_wrap);

  var ICONS_TOAST = {
    success: '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    warning: '<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    progress: '<svg viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
    save: '<svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
  };

  var LABELS = {
    success: 'Berhasil', error: 'Gagal', warning: 'Perhatian',
    info: 'Info', progress: 'Memproses', save: 'Data Tersimpan',
  };

  function _detectType(msg) {
    var m = msg.toLowerCase();
    if (/berhasil|tersimpan|sukses|✓/.test(m)) return 'success';
    if (/gagal|error|tidak ditemukan|tidak ada/.test(m)) return 'error';
    if (/belum|coba lagi|kosong|pilih|masukkan|isi /.test(m)) return 'warning';
    if (/membuat|membuka|memuat|memproses|\.\.\./.test(m)) return 'progress';
    return 'info';
  }

  function _dismiss(el) {
    if (!el || !el.parentNode) return;
    el.classList.remove('in');
    el.classList.add('out');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
  }

  function _clearAll() {
    clearTimeout(_timer);
    var items = _wrap.querySelectorAll('._toast-item');
    items.forEach(function (el) { _dismiss(el); });
    _visible = null;
  }

  function _show(msg, type, duration, label) {
    type = type || _detectType(msg);
    duration = duration || (type === 'progress' ? 6000 : type === 'error' ? 4500 : 3000);
    label = label !== undefined ? label : LABELS[type] || '';

    _clearAll();

    var el = document.createElement('div');
    el.className = '_toast-item _toast-' + type;
    var labelHtml = label ? '<div class="_toast-label">' + label + '</div>' : '';
    el.innerHTML =
      '<div class="_toast-icon">' + (ICONS_TOAST[type] || ICONS_TOAST.info) + '</div>' +
      '<div class="_toast-text">' + labelHtml + '<div class="_toast-body">' + msg + '</div></div>' +
      '<div class="_toast-bar"></div>';

    el.style.pointerEvents = 'all';
    el.style.cursor = 'pointer';
    el.addEventListener('click', function () { _dismiss(el); clearTimeout(_timer); _visible = null; });

    _wrap.appendChild(el);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('in');
        var bar = el.querySelector('._toast-bar');
        if (bar) {
          setTimeout(function () {
            bar.style.transition = 'transform ' + ((duration || 3000) / 1000).toFixed(2) + 's linear';
            requestAnimationFrame(function () { bar.classList.add('depleting'); });
          }, 32);
        }
      });
    });

    _visible = el;
    clearTimeout(_timer);
    _timer = setTimeout(function () { _dismiss(el); _visible = null; }, duration);
  }

  window.toast = function (msg, dur) { _show(msg, null, dur); };
  window.toastSuccess = function (msg, dur) { _show(msg, 'success', dur); };
  window.toastError = function (msg, dur) { _show(msg, 'error', dur); };
  window.toastWarning = function (msg, dur) { _show(msg, 'warning', dur); };
  window.toastInfo = function (msg, dur) { _show(msg, 'info', dur); };
  window.toastProgress = function (msg, dur) { _show(msg, 'progress', dur); };
  window.toastClear = function () { _clearAll(); };

  var _BTN_ICONS = {
    folder: '<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    file: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    open: '<svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    close: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  };

  window.toastDoc = function (opts) {
    if (typeof opts === 'string') opts = { msg: opts };
    var msg = opts.msg || opts.message || '';
    var label = opts.label !== undefined ? opts.label : 'DOKUMEN';
    var dur = opts.dur || opts.duration || 8000;
    var buttons = opts.buttons || [];

    _clearAll();

    var el = document.createElement('div');
    el.className = '_toast-item _toast-doc';
    el.style.maxWidth = buttons.length ? '540px' : '520px';

    var labelHtml = label ? '<div class="_toast-label">' + label + '</div>' : '';
    var actsHtml = '';
    if (buttons.length) {
      actsHtml = '<div class="_toast-actions">';
      buttons.forEach(function (btn, i) {
        var iconSvg = _BTN_ICONS[btn.icon || 'file'] || _BTN_ICONS.file;
        actsHtml += '<button type="button" class="_toast-act-btn" data-toast-btn="' + i + '">' + iconSvg + btn.text + '</button>';
      });
      actsHtml += '</div>';
    }

    var docIcon = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>';
    el.innerHTML =
      '<div class="_toast-icon">' + docIcon + '</div>' +
      '<div class="_toast-inner">' +
      '<div class="_toast-text">' + labelHtml + '<div class="_toast-body">' + msg + '</div></div>' +
      actsHtml +
      '</div>' +
      '<div class="_toast-bar"></div>';

    el.querySelectorAll('._toast-act-btn').forEach(function (btn) {
      var idx = parseInt(btn.getAttribute('data-toast-btn'), 10);
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (buttons[idx] && typeof buttons[idx].onClick === 'function') {
          buttons[idx].onClick();
        }
      });
    });

    el.style.pointerEvents = 'all';
    el.style.cursor = 'default';
    el.addEventListener('click', function (e) {
      if (!e.target.closest('._toast-act-btn')) {
        _dismiss(el); clearTimeout(_timer); _visible = null;
      }
    });

    _wrap.appendChild(el);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('in');
        var bar = el.querySelector('._toast-bar');
        if (bar) {
          setTimeout(function () {
            bar.style.transition = 'transform ' + (dur / 1000).toFixed(2) + 's linear';
            requestAnimationFrame(function () { bar.classList.add('depleting'); });
          }, 32);
        }
      });
    });

    _visible = el;
    clearTimeout(_timer);
    _timer = setTimeout(function () { _dismiss(el); _visible = null; }, dur);
  };
  window._fmtAutosaveTime = function (waktu) {
    var s = String(waktu || '').trim();
    if (!s) return '';
    s = s.replace(/\s+(WIB|WITA|WIT)\b/ig, '').trim();
    s = s.replace(/\s{2,}/g, ' ');
    return s;
  };

  window.toastSave = function (waktu, dur) {
    var clean = window._fmtAutosaveTime
      ? window._fmtAutosaveTime(waktu)
      : String(waktu || '').trim();

    var body = clean
      ? 'Tersimpan pukul ' + clean
      : 'Semua data berhasil disimpan';

    _show(body, 'save', dur || 3200);
  };

  console.info('[toast] ready');
})();

/* ══════════════════════════════════════════
   CLOCK
══════════════════════════════════════════ */
/* ═══════════════════════════════════════════════
   CLOCK
═══════════════════════════════════════════════ */
function pad(n) { return String(n).padStart(2, '0'); }
const HARI_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BLN_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
(function tick() {
  const n = new Date();
  const hari = HARI_ID[n.getDay()];
  const tgl = `${pad(n.getDate())} ${BLN_ID[n.getMonth()]} ${n.getFullYear()}`;
  document.getElementById('clock-date').textContent = `${hari}, ${tgl}`;
  document.getElementById('clock-time').textContent =
    `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
  setTimeout(tick, 1000);
})();

/* ══════════════════════════════════════════
   CORE UI — Tab Switching · Accordion · Conditionals · Topbar Updates
══════════════════════════════════════════ */
/* ═══════════════════════════════════════════════
   TAB SWITCHING
═══════════════════════════════════════════════ */
const TAB_NAMES = [
  'Data Umum',
  'I. Pendahuluan',
  'II. Identitas',
  'III. Riwayat Hidup dan Perkembangan Klien',
  'IV. Kondisi Penjamin',
  'V. Kondisi Lingkungan Sosial Budaya Tempat Tinggal Klien',
  'VI. Riwayat Tindak Pidana',
  'VII. Tanggapan Berbagai Pihak Terhadap Rencana Program Integrasi',
  'VIII. Evaluasi Perkembangan Pembinaan Klien di Lapas',
  'IX. Hasil/Rekomendasi Asesmen',
  'X. Analisis',
  'XI. Kesimpulan dan Rekomendasi',
  'XII. Penutup'
];

let ACTIVE_TAB_IDX = 0;
window.ACTIVE_TAB_IDX = ACTIVE_TAB_IDX;

function switchTab(idx) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.snav-item').forEach((it, n) => {
    it.classList.remove('active');
    if (n === idx) it.classList.add('active');
  });
  document.getElementById('tp-' + idx).classList.add('active');
  ACTIVE_TAB_IDX = idx;
  window.ACTIVE_TAB_IDX = idx;
  const sbPage = document.getElementById('sb-page');
  if (sbPage) sbPage.textContent = TAB_NAMES[idx];
  const sbPrev = document.getElementById('sb-prev');
  const sbNext = document.getElementById('sb-next');
  if (sbPrev) sbPrev.disabled = (idx === 0);
  if (sbNext) sbNext.disabled = (idx === TAB_NAMES.length - 1);
  document.querySelector('.main').scrollTop = 0;
  updateProgress();
}
window.switchTab = switchTab;

function sbPrevTab() { if (ACTIVE_TAB_IDX > 0) switchTab(ACTIVE_TAB_IDX - 1); }
function sbNextTab() { if (ACTIVE_TAB_IDX < TAB_NAMES.length - 1) switchTab(ACTIVE_TAB_IDX + 1); }

document.addEventListener('keydown', e => {
  if (!e.ctrlKey) return;
  const tag = (document.activeElement || {}).tagName || '';
  const editable = (document.activeElement || {}).isContentEditable;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || editable) return;
  if (e.key === 'ArrowLeft') { e.preventDefault(); sbPrevTab(); }
  if (e.key === 'ArrowRight') { e.preventDefault(); sbNextTab(); }
});

/* ═══════════════════════════════════════════════
   ACCORDION — klik header toggle, tapi default
   semua sudah open (class 'open' ada di HTML)
═══════════════════════════════════════════════ */
function toggleAcc(id) {
  const item = document.getElementById(id);
  item.classList.toggle('open');
}

/* ═══════════════════════════════════════════════
   CONDITIONAL: Surat Dinas
   toggle_pengantar() — integrasi.py baris 13823
═══════════════════════════════════════════════ */
function onTogglePengantar(val) {
  document.getElementById('cond-pengantar').style.display = (val === 'Ya') ? 'block' : 'none';
}

/* ═══════════════════════════════════════════════
   CONDITIONAL: Tujuan Pelimpahan + Nomor Telp
   toggle_tujuan_pelimpahan() — integrasi.py baris 13876
   is_pelimpahan = program.strip().lower().startsWith("pelimpahan")
═══════════════════════════════════════════════ */
function onTogglePelimpahan(val) {
  const on = (val || '').trim().toLowerCase().startsWith('pelimpahan');
  const pel = document.getElementById('cond-pelimpahan');
  if (pel) pel.style.display = on ? 'block' : 'none';

  // Hide wawancara penjamin jika pelimpahan
  const lblWawancaraPenjamin = document.getElementById('lbl-wawancara-penjamin');
  const inpWawancaraPenjamin = document.getElementById('f-tgl-wawancara-penjamin');
  if (lblWawancaraPenjamin) lblWawancaraPenjamin.style.display = on ? 'none' : '';
  if (inpWawancaraPenjamin) {
    const wrapPenjamin = inpWawancaraPenjamin.closest('.dp-wrap') || inpWawancaraPenjamin;
    wrapPenjamin.style.display = on ? 'none' : '';
    if (on) inpWawancaraPenjamin.value = '';
  }

  const navItems = document.querySelectorAll('.snav-item');
  [4, 5].forEach(t => {
    const panel = document.getElementById('tp-' + t);
    const navItem = navItems[t] || null;
    if (on) {
      if (panel) panel.style.display = 'none';
      if (navItem) navItem.style.display = 'none';
    } else {
      if (panel) panel.style.display = '';
      if (navItem) navItem.style.display = '';
    }
  });
  // Kalau sedang di tab IV atau V saat jadi pelimpahan, pindah ke tab 0
  if (on) {
    const active = document.querySelector('.tab-panel.active');
    if (active && (active.id === 'tp-4' || active.id === 'tp-5')) switchTab(0);
  }

  if (typeof _updateTelpVis === 'function') _updateTelpVis();
  if (typeof _updateLimpahkanVis === 'function') _updateLimpahkanVis();
  updateLitmasInfo();
  updateProgress();
}

/* ── UPDATE LITMAS INFO DI TOPBAR ── */
function updateLitmasInfo() {
  const litmasInfoEl = document.getElementById('litmas-info');
  if (!litmasInfoEl) return;

  let program = (document.getElementById('f-program')?.value || '').trim();
  let namaKlien = (document.getElementById('f-nama-klien')?.value || '').trim();
  let namaAyah = (document.getElementById('f-nama-ayah')?.value || '').trim();
  let jk = (document.getElementById('f-jk')?.value || '').trim();

  program = program || '(BELUM DIISI)';
  namaKlien = namaKlien || '(BELUM DIISI)';
  namaAyah = namaAyah || '(BELUM DIISI)';
  jk = jk || 'Laki-laki';

  const statusAyah = (document.getElementById('f-status-ayah')?.value || '').trim().toLowerCase();
  const almPfx = ['tidak', 'meninggal', 'alm', 'almarhum', 'almarhumah'].includes(statusAyah) ? 'Alm. ' : '';
  const bin = jk.toLowerCase() === 'perempuan' ? 'binti' : 'bin';
  const isPelimpahan = program.toLowerCase().startsWith('pelimpahan');
  const programBersih = isPelimpahan
    ? program.replace(/^pelimpahan\s*/i, '').trim()
    : program;
  let namaFile = isPelimpahan
    ? `Pelimpahan Litmas ${programBersih} ${namaKlien} ${bin} ${almPfx}${namaAyah}`
    : `Litmas ${program} ${namaKlien} ${bin} ${almPfx}${namaAyah}`;

  litmasInfoEl.textContent = namaFile;
  const wrap = litmasInfoEl.parentElement;
  function _checkScroll() {
    if (!wrap) return;
    const overflow = litmasInfoEl.scrollWidth - wrap.clientWidth;
    if (overflow > 4) {
      litmasInfoEl.style.setProperty('--scroll-dist', '-' + overflow + 'px');
      litmasInfoEl.classList.add('scrolling');
      wrap.classList.add('scrolling');
    } else {
      litmasInfoEl.style.removeProperty('--scroll-dist');
      litmasInfoEl.classList.remove('scrolling');
      wrap.classList.remove('scrolling');
    }
  }
  requestAnimationFrame(function () { requestAnimationFrame(_checkScroll); });
}

// Event listeners untuk updateLitmasInfo sudah dipasang via inline oninput/onchange di HTML
// Tambahan untuk nama ayah, jenis kelamin, dan status ayah
setTimeout(() => {
  ['f-nama-ayah', 'f-jk', 'f-status-ayah'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateLitmasInfo);
      el.addEventListener('change', updateLitmasInfo);
    }
  });
}, 200);

function _syncPekerjaanLabel() {
  var stAyah = (document.getElementById('f-status-ayah') || {}).value || '';
  var stIbu = (document.getElementById('f-status-ibu') || {}).value || '';
  var mA = ['tidak', 'meninggal', 'alm', 'almarhum', 'almarhumah'].includes(stAyah.toLowerCase());
  var mI = ['tidak', 'meninggal', 'alm', 'almarhum', 'almarhumah'].includes(stIbu.toLowerCase());
  var lpA = document.getElementById('lbl-pekerjaan-ayah');
  var laA = document.getElementById('lbl-alamat-ayah');
  var lpI = document.getElementById('lbl-pekerjaan-ibu');
  var laI = document.getElementById('lbl-alamat-ibu');
  if (lpA) lpA.textContent = mA ? 'Pekerjaan Terakhir Ayah' : 'Pekerjaan Ayah';
  if (laA) laA.textContent = mA ? 'Alamat Terakhir Ayah' : 'Alamat Ayah';
  if (lpI) lpI.textContent = mI ? 'Pekerjaan Terakhir Ibu' : 'Pekerjaan Ibu';
  if (laI) laI.textContent = mI ? 'Alamat Terakhir Ibu' : 'Alamat Ibu';
}

/* ── Sync nama petugas & jabatan ke clock di topbar ── */
function updateClockPetugas() {
  const nama = (document.getElementById('f-nama-petugas')?.value || '').trim();
  const jabatan = (document.getElementById('f-jabatan')?.value || '').trim();
  const elNama = document.getElementById('clock-petugas');
  const elJab = document.getElementById('clock-jabatan');
  if (elNama) {
    elNama.textContent = nama;
    elNama.style.display = nama ? 'block' : 'none';
  }
  if (elJab) {
    elJab.textContent = jabatan;
    elJab.style.display = jabatan ? 'block' : 'none';
  }
}
setTimeout(() => {
  ['f-nama-petugas', 'f-jabatan'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateClockPetugas);
      el.addEventListener('change', updateClockPetugas);
    }
  });
  updateClockPetugas();
}, 250);

/* ══════════════════════════════════════════
   PROGRESS — Field IDs · Tab Rings · Accordion Rings · Progress Bar
══════════════════════════════════════════ */
/* ═══════════════════════════════════════════════
   PROGRESS
═══════════════════════════════════════════════ */
/* ── IDs per tab ── */
const TAB0_BASE_IDS = [
  'f-kantor-wilayah', 'f-nama-upt', 'f-alamat-upt', 'f-laman-upt', 'f-email-upt',
  'f-tambahkan-pengantar',
  'f-program',
  'f-nama-petugas', 'f-nip-petugas', 'f-jabatan', 'f-kota-pembuatan', 'f-tahun-pembuatan'
];
const PELIMPAHAN_IDS = ['f-tujuan-pelimpahan'];

const TAB1_BASE_IDS = [
  'f-asal-permintaan', 'f-nomor-surat', 'f-perihal-surat',
  'f-tgl-surat', 'f-tgl-terima', 'f-tgl-wawancara-klien'
];
const TAB1_PENJAMIN_IDS = ['f-tgl-wawancara-penjamin'];

let TAB2_IDS_CACHE = null;
function _getTab2IDs() {
  if (TAB2_IDS_CACHE) return TAB2_IDS_CACHE;
  const panel = document.getElementById('tp-2');
  if (!panel) return [];
  const ids = new Set();
  panel.querySelectorAll('.flbl.req').forEach(lbl => {
    let el = lbl.nextElementSibling;
    if (!el) return;
    let input = null;
    if (el.matches('input,select,textarea')) input = el;
    else input = el.querySelector('input,select,textarea');
    if (input && input.id) ids.add(input.id);
  });
  TAB2_IDS_CACHE = [...ids];
  return TAB2_IDS_CACHE;
}

const TAB4_BASE_IDS = [
  'f4-jk-penjamin', 'f4-status-penjamin',
  'f4-relasi-keluarga', 'f4-kunjungan', 'f4-komunikasi',
  'f4-dikenal-masyarakat', 'f4-ikut-kegiatan', 'f4-hadiri-undangan',
  'f4-status-pekerjaan',
  'f4-kepemilikan', 'f4-bangunan', 'f4-tingkat', 'f4-luas',
  'f4-lantai', 'f4-kondisi-rumah', 'f4-daya-listrik', 'f4-sumber-air'
];
const TAB4_MENIKAH_IDS = ['f4-jumlah-pernikahan-penjamin'];
const TAB4_BEKERJA_IDS = ['f4-pekerjaan', 'f4-penghasilan-tetap', 'f4-nominal-penghasilan'];
const TAB4_TIDAK_BEKERJA_IDS = ['f4-pemberi-nafkah', 'f4-pekerjaan-pemberi', 'f4-penghasilan-tetap-pemberi', 'f4-nominal-pemberi'];

function _getTab4IDs() {
  const ids = [...TAB4_BASE_IDS];
  const statusNikah = (document.getElementById('f4-status-penjamin')?.value || '');
  if (statusNikah === 'Menikah') ids.push(...TAB4_MENIKAH_IDS);
  const statusKerja = (document.getElementById('f4-status-pekerjaan')?.value || '');
  if (statusKerja === 'Bekerja') ids.push(...TAB4_BEKERJA_IDS);
  else if (statusKerja === 'Tidak Bekerja') ids.push(...TAB4_TIDAK_BEKERJA_IDS);
  return ids;
}

function _isPelimpahan() {
  return (document.getElementById('f-program')?.value || '')
    .trim().toLowerCase().startsWith('pelimpahan');
}

function getTabIDs(t) {
  const pel = _isPelimpahan();
  const map = {
    0: [...TAB0_BASE_IDS, ...(pel ? PELIMPAHAN_IDS : [])],
    1: [...TAB1_BASE_IDS, ...(pel ? [] : TAB1_PENJAMIN_IDS)],
    2: _getTab2IDs(),
    4: _getTab4IDs(),
  };
  const map6 = ['f6-latar-belakang', 'f6-kronologi', 'f6-tulang-punggung'];
  // Count korban cards with jenis selected as filled
  var _korbanFilled = 0;
  document.querySelectorAll('#korban-list-container .korban-card').forEach(function (c) {
    if ((c.querySelector('.korban-jenis') || {}).value) _korbanFilled++;
  });
  if (_korbanFilled > 0) map6.push('_korban_ok_');
  map[6] = map6;
  var _hasPerorangan7 = false;
  document.querySelectorAll('#korban-list-container .korban-card').forEach(function (c) {
    var jk = (c.querySelector('.korban-jenis') || {}).value || '';
    if (jk === 'Korban perorangan' || jk === 'Korban badan hukum/korporasi') _hasPerorangan7 = true;
  });
  const map7 = ['f7-mengakui', 'f7-menyesal'];
  if (!_isPelimpahan()) { map7.push('f7-keluarga-mendukung', 'f7-masyarakat-mendukung', 'f7-pemerintah-mendukung'); }
  if (_hasPerorangan7) {
    document.querySelectorAll('#tanggapan-korban-list-container .tanggapan-card').forEach(function (tc) {
      var th = (tc.querySelector('.tg-terhubungi') || {}).value;
      if (th) map7.push('_tg_ok_' + tc.getAttribute('data-korban-idx'));
    });
  }
  // Tab 8
  const map8 = ['f8-admisi', 'f8-sepertiga', 'f8-setengah', 'f8-duapertiga',
    'f8-kep-status', 'f8-man-status', 'f8-sesama-wbp', 'f8-petugas',
    'f8-hub-keluarga', 'f8-hub-masyarakat', 'f8-teman-berkunjung', 'f8-teman-telepon', 'f8-register-f'];
  if ((document.getElementById('f8-kep-status') || {}).value === 'Ya') map8.push('f8-kep-check');
  if ((document.getElementById('f8-man-status') || {}).value === 'Ya') map8.push('f8-man-check');
  if ((document.getElementById('f8-register-f') || {}).value === 'Ya') map8.push('f8-alasan-register-f');
  map[8] = map8;
  // Tab 9 — RRI A (always), B (always), C (if perempuan), D narkotika question (always)
  const jkPer9 = (document.getElementById('f-jk') || {}).value === 'Perempuan';
  const narko9 = (document.getElementById('f9-narkotika') || {}).value;
  const map9 = [...RRI_A.map((_, i) => 'rri-a-' + i), ...RRI_B.map((_, i) => 'rri-b-' + i), 'f9-narkotika', 'f9-tambah-asesmen'];
  if (jkPer9) map9.push(...RRI_C.map((_, i) => 'rri-c-' + i));
  if (narko9 === 'Ya') map9.push(...RRI_D.map((_, i) => 'rri-d-' + i));
  if ((document.getElementById('f9-tambah-asesmen') || {}).value === 'Ya')
    map9.push('f9-tempat', 'f9-tgl-pelaksanaan', 'f9-tgl-surat', 'f9-nomor-surat');
  // kriminogenik: masuk map9 jika acc-9-4 aktif
  const krimAcc = document.getElementById('acc-9-4');
  if (krimAcc && krimAcc.style.display !== 'none') {
    KRIM_ORDER.forEach(kat => {
      const sec = KRIM_VALUE_MAP[kat];
      if (!sec) return;
      Object.keys(sec.pertanyaan).forEach((_, i) => {
        map9.push('krim-' + kat + '-' + i);
      });
    });
  }
  map[9] = map9;
  // Tab 5 standard selects + hidden "check" proxies for taglist/checkboxes
  const map5 = ['f5-relasi-sosial', 'f5-ekonomi', 'f5-pendidikan-mayoritas', 'f5-pendidikan-minoritas',
    'f5-homogen', 'f5-kepedulian-masyarakat', 'f5-kepedulian-pendidikan',
    'f5-kepedulian-keagamaan', 'f5-agama-mayoritas', 'f5-kepedulian-hukum',
    'f5-pmaj-check', 'f5-pmin-check', 'f5-smaj-check', 'f5-pemberi-check'];
  if ((document.getElementById('f5-homogen') || {}).value === 'Heterogen') map5.push('f5-smin-check');
  map[5] = map5;
  return map[t] || [];
}

function getAllActiveIDs() {
  const pel = _isPelimpahan();
  return [...getTabIDs(0), ...getTabIDs(1), ...getTabIDs(2), ...(pel ? [] : _getTab4IDs()), ...(pel ? [] : getTabIDs(5)), ...getTabIDs(6), ...getTabIDs(7), ...getTabIDs(8), ...getTabIDs(9)];
}

function isVisible(el) {
  if (!el) return false;
  if (el.offsetParent !== null) return true;
  const cs = getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden') return false;
  return el.getClientRects().length > 0;
}

function updateTabRings() {
  try {
    const ae = document.activeElement;
    const editingField = ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName || '');
    if (!editingField && typeof window.__LIBERO_LAZY_PREPARE_ALL === 'function') {
      window.__LIBERO_LAZY_PREPARE_ALL(1500);
    } else if (!editingField && typeof window.__LIBERO_LAZY_MOUNT_ALL === 'function') {
      window.__LIBERO_LAZY_MOUNT_ALL();
    }
  } catch (_e) { }
  document.querySelectorAll('.snav-ring').forEach(svg => {
    const t = parseInt(svg.dataset.tab, 10);
    const circ = parseFloat(svg.dataset.circ);
    let pct = 0;

    if (t === 12) {
      const hasTtd = !!(
        (window._ttdPetugasB64 || _ttdPetugasB64) ||
        (((document.getElementById('f12-ttd-file') || {}).value || '').trim())
      );

      const hasLampirChoice = !!(
        ((document.getElementById('f12-lampir-dok') || {}).value || '').trim()
      );

      let score = 0;
      if (hasTtd) score++;
      if (hasLampirChoice) score++;

      pct = score * 50;
      svg.style.opacity = '1';
    } else {
      const ids = getTabIDs(t);
      if (!ids.length) {
        svg.style.opacity = '0.18';
        return;
      }

      svg.style.opacity = '1';

      function isActivelyHidden(el) {
        if (!el) return true;
        let cur = el;
        while (cur && !cur.classList.contains('tab-panel')) {
          if (cur.style && cur.style.display === 'none') return true;
          if (cur.style && cur.style.visibility === 'hidden') return true;
          cur = cur.parentElement;
        }
        return false;
      }

      const activeIds = ids.filter(id => {
        const el = document.getElementById(id);
        return el && !isActivelyHidden(el);
      });

      let filled = 0;
      activeIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && (el.value || '').trim()) filled++;
      });

      pct = activeIds.length
        ? Math.round((filled / activeIds.length) * 100)
        : 0;
    }

    const offset = circ * (1 - pct / 100);
    const fillEl = svg.querySelector('.snav-ring-fill');
    const item = svg.closest('.snav-item');

    if (fillEl) fillEl.style.strokeDashoffset = offset;
    if (item) {
      pct === 100
        ? item.classList.add('done')
        : item.classList.remove('done');
    }
  });
}

const _ACC_REQ_CACHE = new Map();
const _ACC_CIRC = 50.27;
function _accReqIds(accEl) {
  if (!accEl || !accEl.id) return [];
  if (_ACC_REQ_CACHE.has(accEl.id)) return _ACC_REQ_CACHE.get(accEl.id);
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
  _ACC_REQ_CACHE.set(accEl.id, uniq);
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

    meta.innerHTML = `<svg class="acc-ring" viewBox="0 0 22 22" data-acc="${acc.id}" data-circ="${_ACC_CIRC}">
      <circle class="acc-ring-bg" cx="11" cy="11" r="8" stroke-width="2"/>
      <circle class="acc-ring-fill" cx="11" cy="11" r="8" stroke-width="2" stroke-dasharray="${_ACC_CIRC}" stroke-dashoffset="${_ACC_CIRC}"/>
    </svg>`;
  });
}
function updateAccHeaderRings() {
  document.querySelectorAll('svg.acc-ring').forEach(svg => {
    const accId = svg.dataset.acc;
    const circ = parseFloat(svg.dataset.circ) || _ACC_CIRC;
    const acc = document.getElementById(accId);
    const ids = _accReqIds(acc);
    const fillEl = svg.querySelector('.acc-ring-fill');
    if (!ids.length || !fillEl) { svg.classList.add('dim'); return; }
    svg.classList.remove('dim');
    const visibleIds = ids.filter(id => { const el = document.getElementById(id); return isVisible(el); });
    if (!visibleIds.length) { svg.classList.add('dim'); fillEl.style.strokeDashoffset = circ; return; }
    let filled = 0;
    visibleIds.forEach(id => { const el = document.getElementById(id); if (isVisible(el) && (el.value || '').trim()) filled++; });
    const pct = Math.round(filled / visibleIds.length * 100);
    fillEl.style.strokeDashoffset = circ * (1 - pct / 100);
  });
}

/* Deteksi hidden karena logika kondisional (BUKAN karena panel tab tidak aktif).
   Berbeda dengan isVisible(): field di tab tidak aktif tetap dihitung filled. */
function _isConditionallyHidden(el) {
  if (!el) return true;
  let cur = el;
  while (cur && !cur.classList.contains('tab-panel')) {
    const st = cur.style;
    if (st && (st.display === 'none' || st.visibility === 'hidden')) return true;
    cur = cur.parentElement;
  }
  return false;
}
/* ══════════════════════════════════════════
   TAB 0 — DATA UMUM
══════════════════════════════════════════ */
function collectTab0() {
  function v(id) { const el = document.getElementById(id); return el ? (el.value || '').trim() : ''; }

  // tambahkan_pengantar ← pengantar_var.get()
  const tambahPengantar = v('f-tambahkan-pengantar');

  const pengantar = (tambahPengantar === 'Ya') ? {
    tgl_pengantar: v('f-tgl-pengantar'),    // entry_tgl_pengantar  (ACC 0, selalu ada)
    nomor_pengantar: v('f-nomor-pengantar'),  // entry_nomor_pengantar (ACC 1 conditional)
    nama_kepala_upt: v('f-nama-kepala-upt'), // entry_nama_kepala_upt (ACC 0, selalu ada)
    kode_surat_upt: v('f-kode-surat-upt'),  // entry_kode_surat_upt  (ACC 1 conditional)
  } : null;

  const program = v('f-program');
  const isPelimpahan = program.toLowerCase().startsWith('pelimpahan');

  return {
    kantor_wilayah: v('f-kantor-wilayah'),
    nama_upt: v('f-nama-upt'),
    alamat_upt: v('f-alamat-upt'),
    laman_upt: v('f-laman-upt'),
    email_upt: v('f-email-upt'),

    tambahkan_pengantar: tambahPengantar,
    pengantar: pengantar,

    program: program,
    tujuan_pelimpahan: isPelimpahan ? v('f-tujuan-pelimpahan') : '',
    nomor_telp_penjamin: '',
    nomor_telepon_penjamin: '',

    nama_petugas: v('f-nama-petugas'),
    nip_petugas: v('f-nip-petugas'),
    jabatan: v('f-jabatan'),
    kota_pembuatan: v('f-kota-pembuatan'),
    tahun_pembuatan: v('f-tahun-pembuatan'),

    logo: 'Logo Pemasyarakatan',
  };
}

/* ═══════════════════════════════════════════════
   loadTab0(data)
   Sesuai load_data() integrasi.py baris 2466–2593.
═══════════════════════════════════════════════ */
function loadTab0(data) {
  if (!data) return;
  function set(id, val) {
    const el = document.getElementById(id);
    if (!el || val == null) return;
    el.value = String(val);
  }

  set('f-kantor-wilayah', data.kantor_wilayah || '');
  set('f-nama-upt', data.nama_upt || '');
  set('f-alamat-upt', data.alamat_upt || '');
  set('f-laman-upt', data.laman_upt || '');
  set('f-email-upt', data.email_upt || '');

  const p = (data.pengantar && typeof data.pengantar === 'object') ? data.pengantar : {};
  set('f-tgl-pengantar', p.tgl_pengantar || data['Tanggal Surat Pengantar'] || '');
  set('f-nama-kepala-upt', p.nama_kepala_upt || data['Nama Kepala UPT'] || '');

  const tambah = data.tambahkan_pengantar || 'Tidak';
  set('f-tambahkan-pengantar', tambah);
  onTogglePengantar(tambah);
  if (tambah === 'Ya') {
    set('f-nomor-pengantar', p.nomor_pengantar || '');
    set('f-kode-surat-upt', p.kode_surat_upt || '');
  }

  set('f-tujuan-pelimpahan',
    data.tujuan_pelimpahan || data['Tujuan Pelimpahan'] || '');
  set('f-nomor-telp-penjamin',
    data.nomor_telp_penjamin || data.nomor_telepon_penjamin ||
    data['Nomor Telp Penjamin'] || data['Nomor Telepon Penjamin'] || '');

  const prog = (data.program || data['Program'] || '').trim();
  set('f-program', prog);
  onTogglePelimpahan(prog);

  set('f-nama-petugas', data.nama_petugas || '');
  set('f-nip-petugas', data.nip_petugas || '');
  set('f-jabatan', data.jabatan || '');
  set('f-kota-pembuatan', data.kota_pembuatan || '');
  set('f-tahun-pembuatan', data.tahun_pembuatan || '');

  updateClockPetugas();
  updateLitmasInfo();
  updateProgress();
}

/* ═══════════════════════════════════════════════
   validateTab0()
   Sesuai validate_and_collect_empty_fields()
   integrasi.py baris 10841–10864.
═══════════════════════════════════════════════ */
function validateTab0() {
  const missing = [];
  function chk(id, label) {
    const el = document.getElementById(id);
    if (!el || !(el.value || '').trim()) missing.push(label);
  }
  chk('f-kantor-wilayah', 'Data Umum > Kantor Wilayah');
  chk('f-nama-upt', 'Data Umum > Nama UPT');
  chk('f-alamat-upt', 'Data Umum > Alamat UPT');
  chk('f-laman-upt', 'Data Umum > Laman UPT');
  chk('f-email-upt', 'Data Umum > Email UPT');
  chk('f-program', 'Data Umum > Program');
  chk('f-nama-petugas', 'Data Umum > Nama Petugas');
  chk('f-nip-petugas', 'Data Umum > NIP Petugas');
  chk('f-jabatan', 'Data Umum > Jabatan');
  chk('f-kota-pembuatan', 'Data Umum > Kota Pembuatan');
  chk('f-tahun-pembuatan', 'Data Umum > Tahun Pembuatan');
  chk('f-tambahkan-pengantar', 'Data Umum > Opsi Tambahkan Halaman Surat Dinas');

  if ((document.getElementById('f-tambahkan-pengantar')?.value || '') === 'Ya') {
    chk('f-tgl-pengantar', 'Data Umum > Surat Dinas > Tanggal Surat');
    chk('f-nomor-pengantar', 'Data Umum > Surat Dinas > Nomor Surat Litmas');
    chk('f-nama-kepala-upt', 'Data Umum > Surat Dinas > Nama Kepala UPT');
    chk('f-kode-surat-upt', 'Data Umum > Surat Dinas > Kode Surat UPT');
  }
  if ((document.getElementById('f-program')?.value || '').toLowerCase().startsWith('pelimpahan')) {
    chk('f-tujuan-pelimpahan', 'Data Umum > Tujuan Pelimpahan');
    chk('f-nomor-telp-penjamin', 'Data Umum > Nomor Telp Penjamin');
  }
  return missing;
}

/* ═══════════════════════════════════════════════
   collectTab1()
   Sesuai collect_data() integrasi.py baris 1764–1772
═══════════════════════════════════════════════ */

/* ══════════════════════════════════════════
   TAB I — PENDAHULUAN
══════════════════════════════════════════ */
function collectTab1() {
  function v(id) { const el = document.getElementById(id); return el ? (el.value || '').trim() : ''; }
  const isPelimpahan = (v('f-program') || '').toLowerCase().startsWith('pelimpahan');
  return {
    asal_permintaan: v('f-asal-permintaan'),
    nomor_surat: v('f-nomor-surat'),
    perihal_surat: v('f-perihal-surat'),
    tgl_surat: v('f-tgl-surat'),
    tgl_terima: v('f-tgl-terima'),
    tgl_wawancara_klien: v('f-tgl-wawancara-klien'),
    tgl_wawancara_penjamin: isPelimpahan ? '' : v('f-tgl-wawancara-penjamin'),
  };
}

/* ═══════════════════════════════════════════════
   loadTab1(data)
   Sesuai load_data() integrasi.py baris 2595–2612
═══════════════════════════════════════════════ */
function loadTab1(data) {
  if (!data) return;
  function set(id, val) {
    const el = document.getElementById(id);
    if (!el || val == null) return;
    el.value = String(val);
  }
  set('f-asal-permintaan', data.asal_permintaan || '');
  set('f-nomor-surat', data.nomor_surat || '');
  set('f-perihal-surat', data.perihal_surat || '');
  set('f-tgl-surat', data.tgl_surat || '');
  set('f-tgl-terima', data.tgl_terima || '');
  set('f-tgl-wawancara-klien', data.tgl_wawancara_klien || '');
  set('f-tgl-wawancara-penjamin', data.tgl_wawancara_penjamin || '');
  updateProgress();
}

/* ═══════════════════════════════════════════════
   validateTab1()
═══════════════════════════════════════════════ */
function validateTab1() {
  const missing = [];
  function chk(id, label) {
    const el = document.getElementById(id);
    if (!(el.value || '').trim()) missing.push(label);
  }
  const pfx = 'Pendahuluan > ';
  chk('f-asal-permintaan', pfx + 'Asal Permintaan');
  chk('f-nomor-surat', pfx + 'Nomor Surat Permintaan');
  chk('f-perihal-surat', pfx + 'Perihal Surat Permintaan');
  chk('f-tgl-surat', pfx + 'Tanggal Surat Permintaan');
  chk('f-tgl-terima', pfx + 'Tanggal Penerimaan Permintaan');
  chk('f-tgl-wawancara-klien', pfx + 'Tanggal Wawancara Klien');
  const isPelimpahan = (document.getElementById('f-program')?.value || '').toLowerCase().startsWith('pelimpahan');
  if (!isPelimpahan) chk('f-tgl-wawancara-penjamin', pfx + 'Tanggal Wawancara Penjamin');
  return missing;
}

/* ══════════════════════════════════════════
   BRIDGE · Exit Animation · Nav Commands · initApp
══════════════════════════════════════════ */
/* ═══════════════════════════════════════════════
   PYWEBVIEW BRIDGE
   Semua command sesuai nama fungsi di integrasi.py:
     KEMBALI        → kembali_ke_launcher()
     MUAT ULANG     → reset_form_fields(confirm=True)
     SIMPAN DATA    → save_as()
     LANJUTKAN DATA → load_data()
     SELESAIKAN     → submit_form()
═══════════════════════════════════════════════ */
function _py(method, ...args) {
  if (typeof pywebview !== 'undefined' && pywebview.api?.[method])
    return pywebview.api[method](...args);
  console.warn('[mock]', method, args[0] || '');
  return Promise.resolve(null);
}

/* KELUAR — tutup aplikasi dengan animasi */
function _showExitAnimation(callback) {
  const ov = document.getElementById('exit-overlay');
  const gateTop = document.getElementById('exit-gate-top');
  const gateBot = document.getElementById('exit-gate-bottom');
  const crack = document.getElementById('exit-crack');
  const label = document.getElementById('exit-label');
  const blackout = document.getElementById('exit-blackout');
  if (!ov || !gateTop || !gateBot) { callback(); return; }
  // Reset posisi tanpa animasi dulu
  gateTop.style.transition = 'none';
  gateBot.style.transition = 'none';
  gateTop.style.transform = 'translateY(-100%)';
  gateBot.style.transform = 'translateY(100%)';
  gateTop.style.borderBottomColor = 'rgba(var(--ac),0)';
  gateBot.style.borderTopColor = 'rgba(var(--ac),0)';
  crack.style.opacity = '0';
  if (label) { label.style.opacity = '0'; label.style.transform = 'translate(-50%,-50%) scale(0.85)'; }
  blackout.style.opacity = '0';
  ov.style.display = 'block';
  // Tunggu 2 frame agar reset terapply, baru aktifkan transisi + slide masuk
  requestAnimationFrame(() => requestAnimationFrame(() => {
    gateTop.style.transition = 'transform 0.8s cubic-bezier(.77,0,.18,1), border-color 0.3s ease';
    gateBot.style.transition = 'transform 0.8s cubic-bezier(.77,0,.18,1), border-color 0.3s ease';
    gateTop.style.transform = 'translateY(0)';
    gateBot.style.transform = 'translateY(0)';
    gateTop.style.borderBottomColor = 'rgba(var(--ac),.25)';
    gateBot.style.borderTopColor = 'rgba(var(--ac),.25)';
    setTimeout(() => { crack.style.opacity = '1'; }, 700);
    if (label) { setTimeout(() => { label.style.opacity = '1'; label.style.transform = 'translate(-50%,-50%) scale(1)'; }, 780); }
    setTimeout(() => { crack.style.opacity = '0'; blackout.style.opacity = '1'; }, 1200);
    setTimeout(() => { callback(); }, 1700);
  }));
}

async function cmd_keluar() {
  const _ok = await LDialog.exit({
    title: 'Keluar Aplikasi',
    message: 'Yakin ingin keluar dari LIBERO?\nPastikan semua data telah disimpan.',
    okText: 'Keluar',
    cancelText: 'Batal',
  });
  if (!_ok) return;
  _showExitAnimation(() => _py('keluar_aplikasi'));
}

/* KEMBALI — kembali_ke_launcher() */
async function cmd_kembali() {
  var _ok = await LDialog.confirm({
    title: 'Kembali ke Menu Utama',
    message: 'Pastikan data sudah disimpan\nsebelum kembali ke menu.',
    icon: 'back',
    okText: 'Ya, Kembali',
    cancelText: 'Tetap di Sini',
  });
  if (!_ok) return;
  _playKembaliTransition(() => _py('kembali_ke_launcher'));
}

/* Animasi portal collapse sebelum kembali ke launcher */
function _playKembaliTransition(callback) {
  const splash = document.getElementById('int-splash');
  const iris = document.getElementById('int-iris');
  const center = document.getElementById('int-splash-center');
  const shell = document.querySelector('.shell');

  if (!splash || !iris || !center) { callback(); return; }

  // Tampilkan overlay splash (background #08223E sudah ada)
  splash.style.display = 'flex';
  splash.style.clipPath = 'circle(150% at 50% 50%)';
  splash.style.transition = 'none';
  splash.style.opacity = '1';

  // Reset iris & center ke posisi penuh
  iris.style.transition = 'none';
  center.style.transition = 'none';
  iris.style.transform = 'scale(1)';
  iris.style.opacity = '1';
  center.style.transform = 'scale(1) translateY(0)';
  center.style.opacity = '1';

  // Shell fade out
  if (shell) {
    shell.style.transition = 'opacity .22s ease';
    shell.style.opacity = '0';
  }

  requestAnimationFrame(() => requestAnimationFrame(() => {
    // iris mekar keluar sambil memudar (kebalikan entrance)
    iris.style.transition = 'transform .45s cubic-bezier(.55,0,1,.45), opacity .35s ease';
    center.style.transition = 'transform .3s ease, opacity .22s ease';
    iris.style.transform = 'scale(1.8)';
    iris.style.opacity = '0';
    center.style.transform = 'scale(0.6) translateY(-12px)';
    center.style.opacity = '0';

    // Portal contract: circle shrink ke titik tengah
    setTimeout(() => {
      splash.style.transition = 'clip-path .48s cubic-bezier(.55,.05,.05,.95)';
      splash.style.clipPath = 'circle(0% at 50% 50%)';
    }, 80);

    setTimeout(callback, 560);
  }));
}

/* ── FIELD DEFAULTS (PIN) ── */
var _dfltFields = {};

function _initPinStates(defaults) {
  _dfltFields = (defaults && typeof defaults === 'object') ? defaults : {};
  document.querySelectorAll('.pin-btn').forEach(function (btn) {
    var fid = btn.dataset.field;
    var pinned = fid in _dfltFields;
    btn.classList.toggle('pinned', pinned);
    btn.title = pinned ? 'Sudah Ditetapkan' : 'Tetapkan';
  });
}

function togglePin(fieldId) {
  var el = document.getElementById(fieldId);
  var btn = document.querySelector('.pin-btn[data-field="' + fieldId + '"]');
  if (!el || !btn) return;
  if (fieldId in _dfltFields) {
    delete _dfltFields[fieldId];
    btn.classList.remove('pinned');
    btn.title = 'Tetapkan';
  } else {
    _dfltFields[fieldId] = el.value || '';
    btn.classList.add('pinned');
    btn.title = 'Sudah Ditetapkan';
  }
  /* Langsung pywebview.api — sama seperti save_theme, tidak perlu bridge await */
  try {
    if (window.pywebview && window.pywebview.api && window.pywebview.api.save_field_defaults) {
      window.pywebview.api.save_field_defaults(JSON.stringify(_dfltFields));
    }
  } catch (_e) { }
}

/* ── initApp — dipanggil oleh Python (_on_loaded) setelah halaman loaded ── */
/* ══════════════════════════════════════════════════
   MULTI-PERKARA: state, render, collect, restore
══════════════════════════════════════════════════ */
window._perkaraList = [{ perkara: '', pasal: '' }];

function _resizePerkaraTextarea(ta) {
  if (!ta) return;
  ta.style.height = 'auto';
  const next = ta.scrollHeight + 'px';
  ta.style.height = next;
  ta.dataset.autoHeight = next;
}

function _scheduleResizePerkaraTextarea(ta) {
  if (!ta || ta.dataset.resizePending === '1') return;
  ta.dataset.resizePending = '1';
  requestAnimationFrame(function () {
    ta.dataset.resizePending = '0';
    _resizePerkaraTextarea(ta);
  });
}

function _renderPerkaraList() {
  const wrap = document.getElementById('perkara-list-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  const list = window._perkaraList;
  const multi = list.length > 1;
  list.forEach(function (item, idx) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-direction:column;gap:4px;position:relative;' + (multi ? 'padding:8px 10px;border:1px solid rgba(var(--tc),.18);border-radius:8px;' : '');
    if (multi) {
      const badge = document.createElement('div');
      badge.style.cssText = 'font-size:11px;font-weight:600;opacity:.55;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px';
      badge.textContent = 'Perkara ' + (idx + 1);
      row.appendChild(badge);
    }
    const pinp = document.createElement('textarea');
    pinp.className = 'finp';
    pinp.rows = 1;
    pinp.spellcheck = false;
    pinp.placeholder = 'Nama perkara, contoh: Korupsi';
    pinp.value = item.perkara || '';
    pinp.style.cssText = 'resize:none;overflow:hidden;line-height:1.45;box-sizing:border-box;min-height:42px;white-space:pre-wrap;word-break:break-word;max-width:100%!important;';
    pinp.dataset.idx = idx;
    pinp.dataset.field = 'perkara';
    pinp.addEventListener('input', function () { _scheduleResizePerkaraTextarea(this); _onPerkaraFieldChange.call(this, { target: this }); });
    pinp.addEventListener('change', function () { if (typeof updateLitmasInfo === 'function') updateLitmasInfo(); });
    row.appendChild(pinp);

    const pasinp = document.createElement('textarea');
    pasinp.className = 'finp';
    pasinp.rows = 1;
    pasinp.spellcheck = false;
    pasinp.placeholder = 'Pasal yang dilanggar, contoh: Pasal 2 UU TIPIKOR';
    pasinp.value = item.pasal || '';
    pasinp.style.cssText = 'resize:none;overflow:hidden;line-height:1.45;box-sizing:border-box;min-height:42px;white-space:pre-wrap;word-break:break-word;max-width:100%!important;';
    pasinp.dataset.idx = idx;
    pasinp.dataset.field = 'pasal';
    pasinp.addEventListener('input', function () { _scheduleResizePerkaraTextarea(this); _onPerkaraFieldChange.call(this, { target: this }); });
    row.appendChild(pasinp);

    if (multi) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '\u2715 Hapus Perkara Ini';
      btn.style.cssText = 'align-self:flex-end;margin-top:2px;padding:4px 10px;border:1px solid rgba(var(--tc),.3);border-radius:6px;background:transparent;color:rgba(var(--tc),.7);font-size:12px;cursor:pointer';
      btn.dataset.idx = idx;
      btn.addEventListener('click', function () {
        window._perkaraList.splice(parseInt(this.dataset.idx), 1);
        _renderPerkaraList();
        if (typeof updateLitmasInfo === 'function') updateLitmasInfo();
      });
      row.appendChild(btn);
    }
    wrap.appendChild(row);
  });
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.textContent = '+ Tambah Perkara';
  addBtn.style.cssText = 'align-self:flex-start;padding:6px 14px;border:1px dashed rgba(var(--tc),.35);border-radius:8px;background:transparent;color:rgba(var(--tc),.7);font-size:13px;cursor:pointer;margin-top:2px';
  addBtn.addEventListener('click', function () {
    window._perkaraList.push({ perkara: '', pasal: '' });
    _renderPerkaraList();
  });
  wrap.appendChild(addBtn);

  // Trigger initial resize
  setTimeout(() => {
    wrap.querySelectorAll('textarea').forEach(ta => {
      _resizePerkaraTextarea(ta);
    });
  }, 50);
}

function _onPerkaraFieldChange(e) {
  const idx = parseInt(e.target.dataset.idx);
  const field = e.target.dataset.field;
  if (window._perkaraList[idx] !== undefined) {
    window._perkaraList[idx][field] = e.target.value;
  }
}

function _collectPerkaraList() {
  // Read directly from DOM inputs to ensure latest values are captured
  var wrap = document.getElementById('perkara-list-wrap');
  if (wrap) {
    var allInputs = wrap.querySelectorAll('input[data-field], textarea[data-field]');
    if (allInputs.length > 0) {
      var byIdx = {};
      allInputs.forEach(function (inp) {
        var idx = inp.dataset.idx;
        var field = inp.dataset.field;
        if (!byIdx[idx]) byIdx[idx] = {};
        byIdx[idx][field] = (inp.value || '').trim();
      });
      var indices = Object.keys(byIdx).sort(function (a, b) { return parseInt(a) - parseInt(b); });
      var result = [];
      indices.forEach(function (idx) {
        var p = byIdx[idx].perkara || '';
        var s = byIdx[idx].pasal || '';
        if (result.length === 0 || p || s) {
          result.push({ perkara: p, pasal: s });
        }
      });
      if (result.length > 0) {
        // Sync back to in-memory state
        window._perkaraList = result;
        return result;
      }
    }
  }
  // Fallback to in-memory list
  return window._perkaraList.map(function (it) {
    return { perkara: (it.perkara || '').trim(), pasal: (it.pasal || '').trim() };
  }).filter(function (it, idx) { return idx === 0 || it.perkara || it.pasal; });
}

function _restorePerkaraList(data) {
  if (Array.isArray(data.perkara_list) && data.perkara_list.length > 0) {
    window._perkaraList = data.perkara_list.map(function (it) {
      return { perkara: it.perkara || '', pasal: it.pasal || '' };
    });
  } else if (data.perkara || data.pasal) {
    window._perkaraList = [{ perkara: data.perkara || '', pasal: data.pasal || '' }];
  } else {
    window._perkaraList = [{ perkara: '', pasal: '' }];
  }
  _renderPerkaraList();
}

(function () {
  function _initPerkara() { _renderPerkaraList(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initPerkara);
  } else { _initPerkara(); }
})();

/* ────────────────────────────────────────────────── */

function initApp(data) {
  if (!data) return;
  // ── Pin defaults duluan — pin selalu menang ──
  _initPinStates(data.field_defaults);
  try {
    if (data.field_defaults && typeof data.field_defaults === 'object') {
      Object.keys(data.field_defaults).forEach(function (fid) {
        var val = data.field_defaults[fid];
        if (!val) return;
        var el = document.getElementById(fid);
        if (el) el.value = val;
      });
    }
  } catch (_e) { }
  // ── Nama dari token hanya fallback kalau f-nama-petugas belum terisi ──
  var elNama = document.getElementById('f-nama-petugas');
  if (elNama && !elNama.value && data.nama_petugas) elNama.value = data.nama_petugas;
  try { if (typeof updateProgress === 'function') updateProgress(); } catch (_e) { }
  try { if (typeof updateLitmasInfo === 'function') updateLitmasInfo(); } catch (_e) { }
  try { if (typeof updateClockPetugas === 'function') updateClockPetugas(); } catch (_e) { }
}

/* ── Callback dari Python ── */
function onAutosaved(waktu) {
  document.getElementById('sb-autosave').textContent = waktu;
}

/* ══════════════════════════════════════════
   ZOOM
══════════════════════════════════════════ */
const ZOOM_MIN = 25;
const ZOOM_MAX = 400;
const ZOOM_BTN_STEP = 10;
const ZOOM_WHEEL_STEP = 5;

let zoomPct = 100;

function _supportsCssZoom() {
  const s = document.createElement('div').style;
  return 'zoom' in s;
}

function _clampZoom(pct) {
  const n = Math.round(pct / 5) * 5; // snap 5%
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, n));
}

function setZoom(pct) {
  zoomPct = _clampZoom(pct);
  applyZoom();
}

function applyZoom() {
  const scale = zoomPct / 100;
  const wrap = document.getElementById('zoom-wrap');
  if (!wrap) return;
  document.documentElement.style.setProperty('--app-zoom-scale', String(scale));

  if (_supportsCssZoom()) {
    wrap.style.zoom = String(scale);
    wrap.style.transform = '';
    wrap.style.width = '100%';
    wrap.style.height = '100%';
  } else {
    wrap.style.zoom = '';
    wrap.style.transform = `scale(${scale})`;
    wrap.style.transformOrigin = 'top left';
    if (scale > 1) {
      wrap.style.width = `${100 / scale}%`;
      wrap.style.height = `${100 / scale}%`;
    } else {
      wrap.style.width = '100%';
      wrap.style.height = '100%';
    }
  }

  const lbl = document.getElementById('zoom-label');
  if (lbl) lbl.textContent = zoomPct + '%';

  const btnOut = document.getElementById('btn-zoom-out');
  const btnIn = document.getElementById('btn-zoom-in');
  if (btnOut) btnOut.disabled = zoomPct <= ZOOM_MIN;
  if (btnIn) btnIn.disabled = zoomPct >= ZOOM_MAX;
}

function adjustZoom(dir) {
  setZoom(zoomPct + dir * ZOOM_BTN_STEP);
}

function resetZoom() {
  setZoom(100);
}

document.addEventListener('keydown', e => {
  if (!e.ctrlKey) return;
  if (e.key === '=' || e.key === '+') { e.preventDefault(); adjustZoom(1); }
  if (e.key === '-') { e.preventDefault(); adjustZoom(-1); }
  if (e.key === '0') { e.preventDefault(); resetZoom(); }
});

(function () {
  function toTitleCase(str) {
    return str.replace(/\S+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }
  function cycleCase(text) {
    if (!text) return text;
    if (text === text.toUpperCase()) return text.toLowerCase();
    if (text === text.toLowerCase()) return toTitleCase(text);
    return text.toUpperCase();
  }
  document.addEventListener('keydown', function (e) {
    if (!(e.shiftKey && e.key === 'F3')) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const el = document.activeElement;
    if (!el) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const s = el.selectionStart, en = el.selectionEnd, val = el.value;
      const hasSel = (s !== en);
      const target = hasSel ? val.slice(s, en) : val;
      const replaced = cycleCase(target);
      if (hasSel) {
        el.setRangeText(replaced, s, en, 'select');
      } else {
        el.value = replaced;
        el.setSelectionRange(0, replaced.length);
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      const mode = replaced === replaced.toUpperCase() ? 'HURUF BESAR' : replaced === replaced.toLowerCase() ? 'huruf kecil' : 'Huruf Judul';
      if (typeof toast === 'function') toast('Case: ' + mode);
    }
  }, true);
})();

(function () {
  const wrap = document.getElementById('zoom-wrap');
  const lbl = document.getElementById('zoom-label');

  if (wrap) {
    wrap.addEventListener('wheel', e => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const dir = e.deltaY > 0 ? -1 : 1; // scroll up => zoom in
      const step = e.shiftKey ? (ZOOM_WHEEL_STEP * 2) : ZOOM_WHEEL_STEP;
      setZoom(zoomPct + dir * step);
    }, { passive: false });
  }

  if (lbl) {
    lbl.style.cursor = 'pointer';
    lbl.title = 'Klik untuk set zoom (%)';
    lbl.addEventListener('click', async () => {
      const v = await LDialog.prompt({
        title: 'Atur Zoom',
        message: 'Masukkan ukuran zoom (%)',
        defaultValue: String(zoomPct),
        placeholder: '85',
        icon: 'zoom',
        okText: 'Terapkan',
      });
      if (v == null) return;
      const n = parseInt(String(v).trim(), 10);
      if (Number.isFinite(n)) setZoom(n);
    });
  }
})();

applyZoom();

/* ══════════════════════════════════════════
   DATEPICKER
══════════════════════════════════════════ */
/* ═══════════════════════════════════════════════
   DATEPICKER — custom lightweight, offline-safe
   Format output: dd/mm/yyyy
   - Ikon kalender di kanan untuk buka picker
   - Ketik = langsung tutup popup
═══════════════════════════════════════════════ */
(function () {
  const BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const DOW = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const CAL_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

  /* Build popup DOM once */
  const popup = document.createElement('div');
  popup.className = 'dp-popup';
  popup.innerHTML = `
    <div class="dp-nav">
      <button class="dp-nav-btn" id="dp-prev">&#8249;</button>
      <div class="dp-nav-mid">
        <select class="dp-sel" id="dp-month-sel"></select>
        <select class="dp-sel" id="dp-year-sel"></select>
      </div>
      <button class="dp-nav-btn" id="dp-next">&#8250;</button>
    </div>
    <div class="dp-grid" id="dp-grid"></div>
    <div class="dp-footer">
      <button class="dp-today-btn" id="dp-today-btn">Hari Ini</button>
    </div>`;
  document.body.appendChild(popup);

  let curInput = null, dispYear = new Date().getFullYear(), dispMonth = new Date().getMonth();

  /* Fill month select */
  const mSel = popup.querySelector('#dp-month-sel');
  BLN.forEach((b, i) => { const o = document.createElement('option'); o.value = i; o.textContent = b; mSel.appendChild(o); });

  /* Fill year select */
  const ySel = popup.querySelector('#dp-year-sel');
  const nowY = new Date().getFullYear();
  for (let y = nowY - 150; y <= nowY + 5; y++) {
    const o = document.createElement('option'); o.value = y; o.textContent = y; ySel.appendChild(o);
  }

  function parseInputDate(str) {
    if (!str) return null;
    const m = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (!m) return null;
    const d = new Date(+m[3], +m[2] - 1, +m[1]);
    if (isNaN(d)) return null;
    return d;
  }

  function pad2(n) { return String(n).padStart(2, '0'); }
  function fmt(d) { return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`; }

  function renderGrid() {
    mSel.value = dispMonth;
    ySel.value = dispYear;
    const grid = popup.querySelector('#dp-grid');
    grid.innerHTML = '';

    DOW.forEach(d => { const el = document.createElement('div'); el.className = 'dp-dow'; el.textContent = d; grid.appendChild(el); });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const selDate = curInput ? parseInputDate(curInput.value) : null;
    const first = new Date(dispYear, dispMonth, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(dispYear, dispMonth + 1, 0).getDate();
    const daysInPrev = new Date(dispYear, dispMonth, 0).getDate();

    for (let i = startDow - 1; i >= 0; i--) {
      const d = daysInPrev - i;
      const el = document.createElement('div');
      el.className = 'dp-day dp-other'; el.textContent = d;
      el.addEventListener('click', () => { dispMonth--; if (dispMonth < 0) { dispMonth = 11; dispYear--; } pickDay(new Date(dispYear, dispMonth, d)); });
      grid.appendChild(el);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = new Date(dispYear, dispMonth, d); thisDate.setHours(0, 0, 0, 0);
      const el = document.createElement('div'); el.className = 'dp-day';
      if (thisDate.getTime() === today.getTime()) el.classList.add('dp-today');
      if (selDate && thisDate.getTime() === selDate.getTime()) el.classList.add('dp-sel-day');
      el.textContent = d;
      el.addEventListener('click', () => pickDay(new Date(dispYear, dispMonth, d)));
      grid.appendChild(el);
    }

    const total = startDow + daysInMonth;
    const rem = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let d = 1; d <= rem; d++) {
      const el = document.createElement('div');
      el.className = 'dp-day dp-other'; el.textContent = d;
      el.addEventListener('click', () => { dispMonth++; if (dispMonth > 11) { dispMonth = 0; dispYear++; } pickDay(new Date(dispYear, dispMonth, d)); });
      grid.appendChild(el);
    }
  }

  function pickDay(date) {
    if (curInput) {
      curInput.value = fmt(date);
      curInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    close();
  }

  function open(input, anchorEl) {
    curInput = input;
    const parsed = parseInputDate(input.value);
    const ref = parsed || new Date();
    dispYear = ref.getFullYear(); dispMonth = ref.getMonth();
    renderGrid();

    // Gunakan anchorEl (tombol ikon) jika ada - dijamin visible karena baru diklik
    const anchor = anchorEl || input;
    const r = anchor.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;

    // Ukur popup off-screen dulu
    popup.style.visibility = 'hidden';
    popup.style.top = '-9999px';
    popup.style.left = '-9999px';
    popup.classList.add('dp-show');
    const pw = popup.offsetWidth, ph = popup.offsetHeight;
    popup.style.visibility = '';

    // Left — clamp agar tidak keluar kanan viewport
    let left = r.left;
    if (left + pw > vw - 8) left = Math.max(4, vw - pw - 8);

    // Top — flip ke atas jika tidak cukup ruang di bawah
    const spaceBelow = vh - (r.bottom + 4);
    let top;
    if (spaceBelow >= ph || spaceBelow >= r.top - 4) {
      top = r.bottom + 4;
    } else {
      top = Math.max(4, r.top - ph - 4);
    }

    popup.style.top = top + 'px';
    popup.style.left = left + 'px';
  }

  function close() { popup.classList.remove('dp-show'); curInput = null; }

  popup.querySelector('#dp-prev').addEventListener('click', e => { e.stopPropagation(); dispMonth--; if (dispMonth < 0) { dispMonth = 11; dispYear--; } renderGrid(); });
  popup.querySelector('#dp-next').addEventListener('click', e => { e.stopPropagation(); dispMonth++; if (dispMonth > 11) { dispMonth = 0; dispYear++; } renderGrid(); });
  mSel.addEventListener('change', e => { e.stopPropagation(); dispMonth = +mSel.value; renderGrid(); });
  ySel.addEventListener('change', e => { e.stopPropagation(); dispYear = +ySel.value; renderGrid(); });
  popup.querySelector('#dp-today-btn').addEventListener('click', e => {
    e.stopPropagation();
    const t = new Date(); dispYear = t.getFullYear(); dispMonth = t.getMonth(); pickDay(t);
  });

  document.addEventListener('mousedown', e => {
    if (popup.classList.contains('dp-show') && !popup.contains(e.target)
      && !e.target.closest('.dp-wrap')) close();
  });

  /* Wrap input + inject calendar icon button */
  function wrapInput(inp) {
    const wrap = document.createElement('div');
    wrap.className = 'dp-wrap' + (inp.classList.contains('w-md') ? ' w-md' : '');
    inp.parentNode.insertBefore(wrap, inp);
    wrap.appendChild(inp);
    inp.classList.remove('w-md'); /* sizing now on wrapper */

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dp-icon-btn';
    btn.innerHTML = CAL_SVG;
    btn.title = 'Pilih tanggal';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (popup.classList.contains('dp-show') && curInput === inp) { close(); return; }
      inp.focus(); open(inp, btn);
    });
    wrap.appendChild(btn);
  }

  function attachDP() {
    document.querySelectorAll('.dp-input').forEach(inp => {
      if (inp.dataset.dpReady) return;
      inp.dataset.dpReady = '1';

      wrapInput(inp);

      /* Escape → tutup. Ketikan lain → sync kalender ke nilai input */
      inp.addEventListener('keydown', e => {
        if (e.key === 'Escape') { close(); return; }
      });
      inp.addEventListener('input', () => {
        if (popup.classList.contains('dp-show') && curInput === inp) {
          const parsed = parseInputDate(inp.value);
          if (parsed) {
            dispYear = parsed.getFullYear();
            dispMonth = parsed.getMonth();
            renderGrid();
          }
        }
      });

      /* Auto-format on blur: 8 digit angka → dd/mm/yyyy */
      inp.addEventListener('blur', () => {
        const raw = (inp.value || '').trim().replace(/\D/g, '');
        if (raw.length === 8) {
          const d = raw.slice(0, 2), m = raw.slice(2, 4), y = raw.slice(4);
          const test = new Date(+y, +m - 1, +d);
          if (!isNaN(test)) inp.value = `${d}/${m}/${y}`;
        }
      });
    });
  }

  attachDP();
  const obs = new MutationObserver(attachDP);
  obs.observe(document.body, { childList: true, subtree: true });

  // Tutup popup saat container scroll agar tidak "nyasar"
  const _mainScroll = document.querySelector('.main');
  if (_mainScroll) _mainScroll.addEventListener('scroll', () => { if (popup.classList.contains('dp-show')) close(); }, true);

})();

/* ══════════════════════════════════════════
   TAB II — IDENTITAS
   (Tab 2 helpers · Family Table engine · collect · load · validate)
══════════════════════════════════════════ */
/* ═══════════════════════════════════════════════
   TAB 2 — IDENTITAS
═══════════════════════════════════════════════ */
const TERTIARY = new Set(['D1', 'D2', 'D3', 'S1', 'S2', 'S3']);

function needsTamat(val) { return val && val !== 'Tidak Sekolah' && !TERTIARY.has(val); }

function onPendidikanChange(selId, lblId) {
  const val = document.getElementById(selId)?.value || '';
  const show = needsTamat(val);
  const tamatId = selId.replace('f-pendidikan', 'f-tamat').replace('-lbl', '');
  const lbl = document.getElementById(lblId);
  const inp = document.getElementById(tamatId);
  if (lbl) { lbl.style.display = show ? '' : 'none'; }
  if (inp) { inp.style.display = show ? '' : 'none'; if (!show) inp.value = ''; }
}

function onDendaChange() {
  const val = document.getElementById('f-ada-denda')?.value;
  document.getElementById('cond-denda').style.display = val === 'Ya' ? 'block' : 'none';
  if (val !== 'Ya') {
    document.getElementById('f-denda').value = '';
    document.getElementById('f-subsider').value = '';
  }
}

function onUangPenggantiChange() {
  const val = document.getElementById('f-ada-uang-pengganti')?.value;
  document.getElementById('cond-uang-pengganti').style.display = val === 'Ya' ? 'block' : 'none';
  if (val !== 'Ya') {
    document.getElementById('f-uang-pengganti').value = '';
  }
}

function onJKChange() { _updatePasanganVis(); _updateTelpVis(); }
function onStatusChange() { _updatePasanganVis(); }

function _updatePasanganVis() {
  const jk = document.getElementById('f-jk')?.value || '';
  const st = document.getElementById('f-status')?.value || '';
  const menikah = st === 'Menikah';
  const acc = document.getElementById('acc-2-3');
  const title = document.getElementById('acc-2-3-title');
  const suami = document.getElementById('section-suami');
  const istri = document.getElementById('section-istri');
  if (menikah && (jk === 'Laki-laki' || jk === 'Perempuan')) {
    acc.style.display = '';
    if (jk === 'Laki-laki') {
      if (title) title.textContent = 'Data Istri';
      suami.style.display = 'none'; istri.style.display = '';
    } else {
      if (title) title.textContent = 'Data Suami';
      istri.style.display = 'none'; suami.style.display = '';
    }
  } else {
    acc.style.display = 'none';
  }
  updateProgress();
}

function onPenjaminChange() {
  const val = document.getElementById('f-penjamin')?.value || '';
  document.getElementById('acc-2-4').style.display = val === 'Lainnya' ? '' : 'none';
  _updateTelpVis();
  updateProgress();
}

function _updateTelpVis() {
  const isPelimpahan = (document.getElementById('f-program')?.value || '').trim().toLowerCase().startsWith('pelimpahan');
  const penjamin = document.getElementById('f-penjamin')?.value || '';
  const jk = document.getElementById('f-jk')?.value || '';
  const map = {
    'Ayah': ['lbl-telp-ayah', 'f-telp-ayah'],
    'Ibu': ['lbl-telp-ibu', 'f-telp-ibu'],
    'Suami': ['lbl-telp-suami', 'f-telp-suami'],
    'Istri': ['lbl-telp-istri', 'f-telp-istri'],
    'Lainnya': ['lbl-telp-penjamin-lainnya', 'f-telp-penjamin-lainnya'],
  };
  // hide all
  Object.values(map).forEach(([l, i]) => {
    const lel = document.getElementById(l), iel = document.getElementById(i);
    if (lel) lel.style.display = 'none';
    if (iel) iel.style.display = 'none';
  });
  if (!isPelimpahan || !penjamin) return;
  const target = map[penjamin];
  if (target) {
    const lel = document.getElementById(target[0]), iel = document.getElementById(target[1]);
    if (lel) lel.style.display = '';
    if (iel) iel.style.display = '';
  }
}

function onSusunanChange() {
  const val = document.getElementById('f-susunan-keluarga')?.value || '';
  const isSame = val === 'Ya';
  const isSplit = val === 'Tidak';
  const wrapBersama = document.getElementById('tbl-wrap-bersama');
  const wrapTerpisah = document.getElementById('tbl-wrap-terpisah');
  if (wrapBersama) wrapBersama.style.display = (isSame || isSplit) ? '' : 'none';
  if (wrapTerpisah) wrapTerpisah.style.display = isSplit ? '' : 'none';
  const titleBersama = document.getElementById('tbl-bersama-title');
  if (titleBersama) titleBersama.textContent = isSplit ? 'Susunan Keluarga Klien' : 'Susunan Keluarga Klien dan Penjamin';
  // Toggle tambah buttons
  const btnBersama = document.getElementById('btn-tambah-bersama');
  const btnKlien = document.getElementById('btn-tambah-klien');
  const btnPenjamin = document.getElementById('btn-tambah-penjamin');
  if (btnBersama) {
    btnBersama.style.display = (isSame || isSplit) ? '' : 'none';
    btnBersama.textContent = isSplit ? '+ Tambah ke Keluarga Klien' : '+ Tambah ke Susunan Keluarga';
  }
  if (btnKlien) btnKlien.style.display = isSplit ? '' : 'none';
  if (btnPenjamin) btnPenjamin.style.display = isSplit ? '' : 'none';
  _updateLimpahkanVis();
  updateProgress();
}

function _updateLimpahkanVis() {
  const isPelimpahan = (document.getElementById('f-program')?.value || '').trim().toLowerCase().startsWith('pelimpahan');
  const susunan = document.getElementById('f-susunan-keluarga')?.value || '';
  const lbl = document.getElementById('lbl-limpahkan');
  if (lbl) lbl.style.display = (isPelimpahan && susunan === 'Tidak') ? 'flex' : 'none';
}

/* ── FAMILY TABLE ARRAYS ── */
const anggotaBersama = [], anggotaKlien = [], anggotaPenjamin = [];
// Ekspos ke window agar bisa diakses dari script AI Auto-Isi
window.anggotaBersama = anggotaBersama;
window.anggotaKlien = anggotaKlien;
window.anggotaPenjamin = anggotaPenjamin;

const _famInited = new Set();
const _famDrag = { tbodyId: '', fromIdx: -1, rowEl: null };

function _escHtml(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function _ageFromDob(dobStr) {
  const s = (dobStr || '').trim();
  const m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  if (Number.isNaN(d.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const md = today.getMonth() - d.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < d.getDate())) age -= 1;
  if (age < 0 || age > 150) return null;
  return age;
}

function _ageFromYear(yearStr) {
  const y = Number(String(yearStr || '').trim());
  const now = new Date();
  const curY = now.getFullYear();
  if (!Number.isInteger(y) || y < 1900 || y > curY) return null;
  return curY - y;
}

function _normalizeAgeInput(raw) {
  const s0 = String(raw ?? '').trim().toLowerCase();
  if (!s0) return '';
  // Jika format tanggal (dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy) → hitung usia
  const dateM = s0.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
  if (dateM) {
    const a = _ageFromDob(s0);
    if (a != null) return String(a);
  }
  const digits = s0.replace(/tahun|thn|yrs|year/g, '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.length === 4) {
    const a = _ageFromYear(digits);
    if (a != null) return String(a);
  }
  if (!/^[0-9]+$/.test(digits)) return '';
  return String(Number(digits));
}

function _initAgeYearAuto() {
  const el = document.getElementById('f-usia-anggota');
  if (!el) return;

  const apply = () => {
    const norm = _normalizeAgeInput(el.value);
    if (norm && norm !== el.value.trim()) el.value = norm;
  };

  el.addEventListener('blur', apply);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      el.blur();
    }
  });
}

function _tbodyToArray(tbodyId) {
  if (tbodyId === 'tbody-bersama') return anggotaBersama;
  if (tbodyId === 'tbody-klien') return anggotaKlien;
  if (tbodyId === 'tbody-penjamin') return anggotaPenjamin;
  return [];
}

function _renderFamTable(tbodyId, arr) {
  _initFamTable(tbodyId);

  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  if (!arr.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="fam-table-empty">Belum ada anggota</td></tr>`;
    return;
  }

  tbody.innerHTML = arr.map((r, i) => {
    const jk = r.jk ?? r.jenis_kelamin ?? '';
    return `
      <tr class="fam-row" data-idx="${i}">
        <td class="drag-handle" draggable="true" title="Tarik untuk pindah">⠿</td>
        <td>${i + 1}</td>
        <td data-key="nama" data-editable="1">${_escHtml(r.nama || '')}</td>
        <td data-key="jk" data-editable="1">${_escHtml(jk)}</td>
        <td data-key="usia" data-editable="1">${_escHtml(r.usia || '')}</td>
        <td data-key="pendidikan" data-editable="1">${_escHtml(r.pendidikan || '')}</td>
        <td data-key="pekerjaan" data-editable="1">${_escHtml(r.pekerjaan || '')}</td>
        <td data-key="keterangan" data-editable="1">${_escHtml(r.keterangan || '')}</td>
        <td><button type="button" class="del-btn" data-idx="${i}">Hapus</button></td>
      </tr>`;
  }).join('');
}

function _famDragReset() {
  if (_famDrag.rowEl) _famDrag.rowEl.classList.remove('dragging');
  _famDrag.tbodyId = '';
  _famDrag.fromIdx = -1;
  _famDrag.rowEl = null;
}

function _getDragAfterRow(tbody, y) {
  const rows = [...tbody.querySelectorAll('tr.fam-row:not(.dragging)')];
  let best = null;
  let bestOffset = Number.NEGATIVE_INFINITY;

  for (const row of rows) {
    const box = row.getBoundingClientRect();
    const offset = y - box.top - (box.height / 2);
    if (offset < 0 && offset > bestOffset) {
      bestOffset = offset;
      best = row;
    }
  }
  return best;
}

function _famBeginCellEdit(tbodyId, idx, key, td) {
  const arr = _tbodyToArray(tbodyId);
  const row = arr[idx];
  if (!row) return;

  if (td.querySelector('input,select,textarea')) return;

  const canonicalKey = (key === 'jk') ? 'jenis_kelamin' : key;
  const cur = String((row[key] ?? row[canonicalKey] ?? '')).trim();

  const finish = (fn) => {
    if (finish._done) return;
    finish._done = true;
    fn();
  };

  const commit = (val) => {
    let v = String(val ?? '').trim();

    if (canonicalKey === 'jenis_kelamin') {
      v = v.toUpperCase();
      if (v && v !== 'L' && v !== 'P') {
        toast('L/P hanya boleh L atau P');
        _renderFamTable(tbodyId, arr);
        updateProgress();
        return;
      }
      row.jk = v;
      row.jenis_kelamin = v;
    } else if (canonicalKey === 'usia') {
      const norm = _normalizeAgeInput(v);
      if (v && !norm) {
        toast('Usia harus angka atau tahun lahir (YYYY)');
        _renderFamTable(tbodyId, arr);
        updateProgress();
        return;
      }
      row.usia = norm;
    } else {
      row[canonicalKey] = v;
    }

    _renderFamTable(tbodyId, arr);
    updateProgress();
  };

  const cancel = () => _renderFamTable(tbodyId, arr);

  td.textContent = '';
  let editor;

  if (canonicalKey === 'jenis_kelamin') {
    editor = document.createElement('select');
    editor.className = 'fam-editor';
    ['', 'L', 'P'].forEach(opt => {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt ? opt : '—';
      editor.appendChild(o);
    });
    editor.value = cur;
  } else {
    editor = document.createElement('input');
    editor.className = 'fam-editor';
    editor.type = 'text';
    editor.value = cur;
    if (canonicalKey === 'usia') {
      editor.inputMode = 'numeric';
      editor.autocomplete = 'off';
      editor.placeholder = 'angka';
    }
  }

  editor.style.width = '100%';
  editor.style.boxSizing = 'border-box';
  editor.style.font = 'inherit';
  td.appendChild(editor);

  editor.focus();
  if (editor.select) editor.select();

  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finish(() => commit(editor.value));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      finish(cancel);
    }
  });

  editor.addEventListener('blur', () => finish(() => commit(editor.value)));
}

function _initFamTable(tbodyId) {
  if (_famInited.has(tbodyId)) return;

  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  _famInited.add(tbodyId);

  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button.del-btn');
    if (!btn) return;
    const idx = Number(btn.dataset.idx);
    if (Number.isNaN(idx)) return;
    hapusAnggota(tbodyId, idx);
  });

  tbody.addEventListener('dblclick', (e) => {
    const td = e.target.closest('td[data-editable="1"][data-key]');
    if (!td) return;
    const tr = td.closest('tr.fam-row');
    if (!tr) return;
    const idx = Number(tr.dataset.idx);
    if (Number.isNaN(idx)) return;
    _famBeginCellEdit(tbodyId, idx, td.dataset.key, td);
  });

  tbody.addEventListener('dragstart', (e) => {
    const handle = e.target.closest('.drag-handle');
    if (!handle) return;
    const tr = handle.closest('tr.fam-row');
    if (!tr) return;
    const fromIdx = Number(tr.dataset.idx);
    if (Number.isNaN(fromIdx)) return;

    _famDrag.tbodyId = tbodyId;
    _famDrag.fromIdx = fromIdx;
    _famDrag.rowEl = tr;

    tr.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'drag');
  });

  tbody.addEventListener('dragover', (e) => {
    if (_famDrag.tbodyId !== tbodyId || !_famDrag.rowEl) return;
    e.preventDefault();
    const after = _getDragAfterRow(tbody, e.clientY);
    if (after === null) tbody.appendChild(_famDrag.rowEl);
    else tbody.insertBefore(_famDrag.rowEl, after);
  });

  tbody.addEventListener('drop', (e) => {
    if (_famDrag.tbodyId !== tbodyId || !_famDrag.rowEl) return;
    e.preventDefault();

    const rows = [...tbody.querySelectorAll('tr.fam-row')];
    const toIdx = rows.indexOf(_famDrag.rowEl);
    const fromIdx = _famDrag.fromIdx;

    _famDragReset();

    const arr = _tbodyToArray(tbodyId);
    if (toIdx >= 0 && fromIdx >= 0 && toIdx !== fromIdx) {
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
    }
    _renderFamTable(tbodyId, arr);
    updateProgress();
  });

  tbody.addEventListener('dragend', () => {
    if (_famDrag.tbodyId !== tbodyId) return;
    _famDragReset();
    _renderFamTable(tbodyId, _tbodyToArray(tbodyId));
  });
}

function hapusAnggota(tbodyId, idx) {
  const arr = _tbodyToArray(tbodyId);
  arr.splice(idx, 1);
  _renderFamTable(tbodyId, arr);
  updateProgress();
}

function _getV(id) {
  const el = document.getElementById(id);
  return el ? (el.value || '').trim() : '';
}

function _setV(id, v) {
  const el = document.getElementById(id);
  if (el) el.value = v || '';
}

function _normalizeFamJK(v) {
  const s = String(v || '').trim().toUpperCase();
  if (!s) return '';
  if (s === 'L' || s === 'LAKI' || s === 'LAKI-LAKI' || s.indexOf('LAKI') === 0) return 'L';
  if (s === 'P' || s === 'PEREMPUAN' || s === 'WANITA' || s.indexOf('PEREMPUAN') === 0) return 'P';
  return '';
}

function _syncAnggotaFormFromSumber(silent) {
  const sumber = _getV('f-sumber-anggota');
  if (!sumber) {
    if (!silent) toast('Pilih sumber data terlebih dahulu');
    return false;
  }

  const src = sumber.toLowerCase();
  let nama = '', dob = '', jk = '', pend = '', kerja = '', ket = '';

  if (src === 'klien') {
    nama = _getV('f-nama-klien'); dob = _getV('f-tgl-lahir');
    jk = _getV('f-jk') === 'Laki-laki' ? 'L' : _getV('f-jk') === 'Perempuan' ? 'P' : '';
    pend = _getV('f-pendidikan'); kerja = _getV('f-pekerjaan'); ket = 'Klien';
  } else if (src === 'ayah') {
    nama = _getV('f-nama-ayah'); dob = _getV('f-tgl-ayah'); jk = 'L';
    pend = _getV('f-pendidikan-ayah'); kerja = _getV('f-pekerjaan-ayah'); ket = 'Ayah klien';
  } else if (src === 'ibu') {
    nama = _getV('f-nama-ibu'); dob = _getV('f-tgl-ibu'); jk = 'P';
    pend = _getV('f-pendidikan-ibu'); kerja = _getV('f-pekerjaan-ibu'); ket = 'Ibu klien';
  } else if (src === 'suami/istri') {
    const jkK = _getV('f-jk');
    if (jkK === 'Laki-laki') {
      nama = _getV('f-nama-istri'); dob = _getV('f-tgl-istri'); jk = 'P';
      pend = _getV('f-pendidikan-istri'); kerja = _getV('f-pekerjaan-istri'); ket = 'Istri klien';
    } else {
      nama = _getV('f-nama-suami'); dob = _getV('f-tgl-suami'); jk = 'L';
      pend = _getV('f-pendidikan-suami'); kerja = _getV('f-pekerjaan-suami'); ket = 'Suami klien';
    }
  } else if (src === 'penjamin') {
    const p = _getV('f-penjamin');
    if (p === 'Lainnya') {
      nama = _getV('f-nama-penjamin'); dob = _getV('f-tgl-penjamin');
      pend = _getV('f-pendidikan-penjamin'); kerja = _getV('f-pekerjaan-penjamin'); ket = 'Penjamin';
    } else if (p === 'Ayah') {
      nama = _getV('f-nama-ayah'); dob = _getV('f-tgl-ayah'); jk = 'L';
      pend = _getV('f-pendidikan-ayah'); kerja = _getV('f-pekerjaan-ayah'); ket = 'Ayah (Penjamin)';
    } else if (p === 'Ibu') {
      nama = _getV('f-nama-ibu'); dob = _getV('f-tgl-ibu'); jk = 'P';
      pend = _getV('f-pendidikan-ibu'); kerja = _getV('f-pekerjaan-ibu'); ket = 'Ibu (Penjamin)';
    } else if (p === 'Suami') {
      nama = _getV('f-nama-suami'); dob = _getV('f-tgl-suami'); jk = 'L';
      pend = _getV('f-pendidikan-suami'); kerja = _getV('f-pekerjaan-suami'); ket = 'Suami (Penjamin)';
    } else if (p === 'Istri') {
      nama = _getV('f-nama-istri'); dob = _getV('f-tgl-istri'); jk = 'P';
      pend = _getV('f-pendidikan-istri'); kerja = _getV('f-pekerjaan-istri'); ket = 'Istri (Penjamin)';
    }
  }

  const age = _ageFromDob(dob);
  _setV('f-nama-anggota', nama);
  _setV('f-jk-anggota', jk);
  _setV('f-usia-anggota', age == null ? '' : String(age));
  _setV('f-pendidikan-anggota', pend);
  _setV('f-pekerjaan-anggota', kerja);
  _setV('f-keterangan-anggota', ket);

  if (document.getElementById('f-juga-penjamin')?.checked && _getV('f-susunan-keluarga') === 'Tidak') {
    const tgt = document.getElementById('f-target-tabel');
    if (tgt) tgt.value = 'penjamin';
  }
  return true;
}

function _initAnggotaAutoSync() {
  const triggerIds = [
    'f-sumber-anggota', 'f-penjamin', 'f-jk', 'f-juga-penjamin', 'f-susunan-keluarga',
    'f-tgl-lahir', 'f-tgl-ayah', 'f-tgl-ibu', 'f-tgl-istri', 'f-tgl-suami', 'f-tgl-penjamin',
    'f-nama-klien', 'f-nama-ayah', 'f-nama-ibu', 'f-nama-istri', 'f-nama-suami', 'f-nama-penjamin'
  ];

  const handler = () => _syncAnggotaFormFromSumber(true);

  triggerIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
    el.addEventListener('blur', handler);
  });

  handler();
}

_initAnggotaAutoSync();

_initAgeYearAuto();

function tambahAnggotaKe(tgt) {
  const nama = _getV('f-nama-anggota');
  const jk = _getV('f-jk-anggota');
  const usia = _getV('f-usia-anggota');

  if (!nama || !jk || !usia) {
    toast('Nama, L/P, dan Usia harus diisi!');
    return;
  }

  const row = {
    nama,
    jk,
    jenis_kelamin: jk,
    usia,
    pendidikan: _getV('f-pendidikan-anggota'),
    pekerjaan: _getV('f-pekerjaan-anggota'),
    keterangan: _getV('f-keterangan-anggota'),
  };

  const tbodyId = tgt === 'bersama' ? 'tbody-bersama' : tgt === 'klien' ? 'tbody-klien' : 'tbody-penjamin';
  const arr = _tbodyToArray(tbodyId);

  arr.push(row);
  _renderFamTable(tbodyId, arr);

  ['f-nama-anggota', 'f-jk-anggota', 'f-usia-anggota', 'f-pendidikan-anggota', 'f-pekerjaan-anggota', 'f-keterangan-anggota']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

  updateProgress();
}
function tambahAnggota() { tambahAnggotaKe('bersama'); }

function ambilDataAnggota() {
  _syncAnggotaFormFromSumber(false);
}

/* ── collectTab2 ── */
function collectTab2() {
  function v(id) { const el = document.getElementById(id); if (!el || el.style.display === 'none') return ''; return (el.tagName === 'TEXTAREA' ? el.value : (el.value || '')).trim(); }
  const jk = v('f-jk');
  const isPasanganVisible = document.getElementById('acc-2-3')?.style.display !== 'none';
  const isPenjaminLainnya = document.getElementById('acc-2-4')?.style.display !== 'none';
  const isPelimpahan = (document.getElementById('f-program')?.value || '').trim().toLowerCase().startsWith('pelimpahan');
  const penjamin = v('f-penjamin');
  const susunanKeluargaSama = v('f-susunan-keluarga');
  const anggotaKeluargaUtama = [...anggotaBersama];
  const anggotaKeluargaKlien = susunanKeluargaSama === 'Tidak' ? [...anggotaBersama] : [...anggotaKlien];
  // shared nomor telp
  const telpMap = { 'Ayah': 'f-telp-ayah', 'Ibu': 'f-telp-ibu', 'Suami': 'f-telp-suami', 'Istri': 'f-telp-istri', 'Lainnya': 'f-telp-penjamin-lainnya' };
  const nomor_telp = isPelimpahan ? v(telpMap[penjamin] || '') : '';

  return {
    nama_klien: v('f-nama-klien'),
    perkara_list: _collectPerkaraList(),
    perkara: (_collectPerkaraList()[0] || {}).perkara || '',
    pasal: (_collectPerkaraList()[0] || {}).pasal || '',
    nomor_register_litmas: v('f-nomor-register-litmas'),
    register: v('f-register'),
    putusan: v('f-putusan'),
    tempat_lahir: v('f-tempat-lahir'),
    tgl_lahir: v('f-tgl-lahir'),
    lama_pidana: v('f-lama-pidana'),
    ada_denda: v('f-ada-denda'),
    denda: v('f-ada-denda') === 'Ya' ? v('f-denda') : '',
    subsider: v('f-ada-denda') === 'Ya' ? v('f-subsider') : '',
    ada_uang_pengganti: v('f-ada-uang-pengganti'),
    uang_pengganti: v('f-ada-uang-pengganti') === 'Ya' ? v('f-uang-pengganti') : '',
    agama: v('f-agama'),
    suku: v('f-suku'),
    bangsa: v('f-bangsa'),
    warga_negara: v('f-warga-negara'),
    pekerjaan: v('f-pekerjaan'),
    tgl_putusan: v('f-tgl-putusan'),
    tgl_ekspirasi: v('f-tgl-ekspirasi'),
    jenis_kelamin: jk,
    pendidikan: v('f-pendidikan'),
    tamat: needsTamat(v('f-pendidikan')) ? v('f-tamat') : '',
    status_pernikahan: v('f-status'),
    alamat: v('f-alamat'),
    ciri_khusus: v('f-ciri'),
    penjamin: penjamin,
    nomor_telp_penjamin: nomor_telp,
    nomor_telepon_penjamin: nomor_telp,

    status_ayah: v('f-status-ayah'),
    nama_ayah: v('f-nama-ayah'),
    tempat_lahir_ayah: v('f-tempat-ayah'),
    tanggal_lahir_ayah: v('f-tgl-ayah'),
    agama_ayah: v('f-agama-ayah'),
    suku_ayah: v('f-suku-ayah'),
    bangsa_ayah: v('f-bangsa-ayah'),
    warga_negara_ayah: v('f-warga-negara-ayah'),
    pendidikan_ayah: v('f-pendidikan-ayah'),
    tamat_ayah: needsTamat(v('f-pendidikan-ayah')) ? v('f-tamat-ayah') : '',
    pekerjaan_ayah: v('f-pekerjaan-ayah'),
    alamat_ayah: v('f-alamat-ayah'),

    status_ibu: v('f-status-ibu'),
    nama_ibu: v('f-nama-ibu'),
    tempat_lahir_ibu: v('f-tempat-ibu'),
    tanggal_lahir_ibu: v('f-tgl-ibu'),
    agama_ibu: v('f-agama-ibu'),
    suku_ibu: v('f-suku-ibu'),
    bangsa_ibu: v('f-bangsa-ibu'),
    warga_negara_ibu: v('f-warga-negara-ibu'),
    pendidikan_ibu: v('f-pendidikan-ibu'),
    tamat_ibu: needsTamat(v('f-pendidikan-ibu')) ? v('f-tamat-ibu') : '',
    pekerjaan_ibu: v('f-pekerjaan-ibu'),
    alamat_ibu: v('f-alamat-ibu'),

    nama_suami: isPasanganVisible && jk === 'Perempuan' ? v('f-nama-suami') : '',
    tempat_lahir_suami: isPasanganVisible && jk === 'Perempuan' ? v('f-tempat-suami') : '',
    tanggal_lahir_suami: isPasanganVisible && jk === 'Perempuan' ? v('f-tgl-suami') : '',
    agama_suami: isPasanganVisible && jk === 'Perempuan' ? v('f-agama-suami') : '',
    suku_suami: isPasanganVisible && jk === 'Perempuan' ? v('f-suku-suami') : '',
    bangsa_suami: isPasanganVisible && jk === 'Perempuan' ? v('f-bangsa-suami') : '',
    warga_negara_suami: isPasanganVisible && jk === 'Perempuan' ? v('f-warga-negara-suami') : '',
    pendidikan_suami: isPasanganVisible && jk === 'Perempuan' ? v('f-pendidikan-suami') : '',
    tamat_suami: isPasanganVisible && jk === 'Perempuan' && needsTamat(v('f-pendidikan-suami')) ? v('f-tamat-suami') : '',
    pekerjaan_suami: isPasanganVisible && jk === 'Perempuan' ? v('f-pekerjaan-suami') : '',
    alamat_suami: isPasanganVisible && jk === 'Perempuan' ? v('f-alamat-suami') : '',

    nama_istri: isPasanganVisible && jk === 'Laki-laki' ? v('f-nama-istri') : '',
    tempat_lahir_istri: isPasanganVisible && jk === 'Laki-laki' ? v('f-tempat-istri') : '',
    tanggal_lahir_istri: isPasanganVisible && jk === 'Laki-laki' ? v('f-tgl-istri') : '',
    agama_istri: isPasanganVisible && jk === 'Laki-laki' ? v('f-agama-istri') : '',
    suku_istri: isPasanganVisible && jk === 'Laki-laki' ? v('f-suku-istri') : '',
    bangsa_istri: isPasanganVisible && jk === 'Laki-laki' ? v('f-bangsa-istri') : '',
    warga_negara_istri: isPasanganVisible && jk === 'Laki-laki' ? v('f-warga-negara-istri') : '',
    pendidikan_istri: isPasanganVisible && jk === 'Laki-laki' ? v('f-pendidikan-istri') : '',
    tamat_istri: isPasanganVisible && jk === 'Laki-laki' && needsTamat(v('f-pendidikan-istri')) ? v('f-tamat-istri') : '',
    pekerjaan_istri: isPasanganVisible && jk === 'Laki-laki' ? v('f-pekerjaan-istri') : '',
    alamat_istri: isPasanganVisible && jk === 'Laki-laki' ? v('f-alamat-istri') : '',

    nama_penjamin: isPenjaminLainnya ? v('f-nama-penjamin') : '',
    tempat_lahir_penjamin: isPenjaminLainnya ? v('f-tempat-penjamin') : '',
    tanggal_lahir_penjamin: isPenjaminLainnya ? v('f-tgl-penjamin') : '',
    agama_penjamin: isPenjaminLainnya ? v('f-agama-penjamin') : '',
    suku_penjamin: isPenjaminLainnya ? v('f-suku-penjamin') : '',
    bangsa_penjamin: isPenjaminLainnya ? v('f-bangsa-penjamin') : '',
    warga_negara_penjamin: isPenjaminLainnya ? v('f-warga-negara-penjamin') : '',
    pendidikan_penjamin: isPenjaminLainnya ? v('f-pendidikan-penjamin') : '',
    tamat_penjamin: isPenjaminLainnya && needsTamat(v('f-pendidikan-penjamin')) ? v('f-tamat-penjamin') : '',
    pekerjaan_penjamin: isPenjaminLainnya ? v('f-pekerjaan-penjamin') : '',
    alamat_penjamin: isPenjaminLainnya ? v('f-alamat-penjamin') : '',
    hubungan_penjamin: isPenjaminLainnya ? v('f-hubungan-penjamin') : '',

    'Susunan Keluarga Sama': susunanKeluargaSama,
    limpahkan_susunan_keluarga_penjamin: document.getElementById('f-limpahkan-penjamin')?.checked ? 1 : 0,
    'Anggota Keluarga': anggotaKeluargaUtama,
    'Anggota Keluarga Klien': anggotaKeluargaKlien,
    'Anggota Keluarga Penjamin': [...anggotaPenjamin],
  };
}

/* ── loadTab2 ── */
function loadTab2(data) {
  if (!data) return;
  function set(id, val) {
    const el = document.getElementById(id);
    if (!el || val == null) return;
    el.value = String(val);
  }
  set('f-nama-klien', data.nama_klien || '');
  _restorePerkaraList(data);
  set('f-nomor-register-litmas', data.nomor_register_litmas || '');
  set('f-register', data.register || '');
  set('f-putusan', data.putusan || '');
  set('f-tempat-lahir', data.tempat_lahir || '');
  set('f-tgl-lahir', data.tgl_lahir || '');
  set('f-lama-pidana', data.lama_pidana || '');
  set('f-ada-denda', data.ada_denda || ''); onDendaChange();
  set('f-denda', data.denda || '');
  set('f-subsider', data.subsider || '');
  set('f-ada-uang-pengganti', data.ada_uang_pengganti || ''); onUangPenggantiChange();
  set('f-uang-pengganti', data.uang_pengganti || '');
  set('f-agama', data.agama || '');
  set('f-suku', data.suku || '');
  set('f-bangsa', data.bangsa || '');
  set('f-warga-negara', data.warga_negara || '');
  set('f-pekerjaan', data.pekerjaan || '');
  set('f-tgl-putusan', data.tgl_putusan || '');
  set('f-tgl-ekspirasi', data.tgl_ekspirasi || '');
  set('f-jk', data.jenis_kelamin || '');
  set('f-pendidikan', data.pendidikan || '');
  onPendidikanChange('f-pendidikan', 'f-tamat-wrap');
  set('f-tamat', data.tamat || '');
  set('f-status', data.status_pernikahan || '');
  updateMarriageVisibility();
  const alamatEl = document.getElementById('f-alamat');
  if (alamatEl) alamatEl.value = data.alamat || '';
  set('f-ciri', data.ciri_khusus || '');
  set('f-penjamin', data.penjamin || ''); onPenjaminChange(); onJKChange(); onStatusChange();

  // Ayah
  set('f-status-ayah', data.status_ayah || '');
  set('f-nama-ayah', data.nama_ayah || '');
  set('f-tempat-ayah', data.tempat_lahir_ayah || '');
  set('f-tgl-ayah', data.tanggal_lahir_ayah || '');
  set('f-agama-ayah', data.agama_ayah || '');
  set('f-suku-ayah', data.suku_ayah || '');
  set('f-bangsa-ayah', data.bangsa_ayah || '');
  set('f-warga-negara-ayah', data.warga_negara_ayah || '');
  set('f-pendidikan-ayah', data.pendidikan_ayah || ''); onPendidikanChange('f-pendidikan-ayah', 'f-tamat-ayah-lbl');
  set('f-tamat-ayah', data.tamat_ayah || '');
  set('f-pekerjaan-ayah', data.pekerjaan_ayah || '');
  const alamatAyahEl = document.getElementById('f-alamat-ayah');
  if (alamatAyahEl) alamatAyahEl.value = data.alamat_ayah || '';

  // Ibu
  set('f-status-ibu', data.status_ibu || '');
  set('f-nama-ibu', data.nama_ibu || '');
  set('f-tempat-ibu', data.tempat_lahir_ibu || '');
  set('f-tgl-ibu', data.tanggal_lahir_ibu || '');
  set('f-agama-ibu', data.agama_ibu || '');
  set('f-suku-ibu', data.suku_ibu || '');
  set('f-bangsa-ibu', data.bangsa_ibu || '');
  set('f-warga-negara-ibu', data.warga_negara_ibu || '');
  set('f-pendidikan-ibu', data.pendidikan_ibu || ''); onPendidikanChange('f-pendidikan-ibu', 'f-tamat-ibu-lbl');
  set('f-tamat-ibu', data.tamat_ibu || '');
  set('f-pekerjaan-ibu', data.pekerjaan_ibu || '');
  const alamatIbuEl = document.getElementById('f-alamat-ibu');
  if (alamatIbuEl) alamatIbuEl.value = data.alamat_ibu || '';
  if (typeof _syncPekerjaanLabel === 'function') _syncPekerjaanLabel();

  // Suami
  set('f-nama-suami', data.nama_suami || '');
  set('f-tempat-suami', data.tempat_lahir_suami || '');
  set('f-tgl-suami', data.tanggal_lahir_suami || '');
  set('f-agama-suami', data.agama_suami || '');
  set('f-suku-suami', data.suku_suami || '');
  set('f-bangsa-suami', data.bangsa_suami || '');
  set('f-warga-negara-suami', data.warga_negara_suami || '');
  set('f-pendidikan-suami', data.pendidikan_suami || ''); onPendidikanChange('f-pendidikan-suami', 'f-tamat-suami-lbl');
  set('f-tamat-suami', data.tamat_suami || '');
  set('f-pekerjaan-suami', data.pekerjaan_suami || '');
  const alamatSuamiEl = document.getElementById('f-alamat-suami');
  if (alamatSuamiEl) alamatSuamiEl.value = data.alamat_suami || '';

  // Istri
  set('f-nama-istri', data.nama_istri || '');
  set('f-tempat-istri', data.tempat_lahir_istri || '');
  set('f-tgl-istri', data.tanggal_lahir_istri || '');
  set('f-agama-istri', data.agama_istri || '');
  set('f-suku-istri', data.suku_istri || '');
  set('f-bangsa-istri', data.bangsa_istri || '');
  set('f-warga-negara-istri', data.warga_negara_istri || '');
  set('f-pendidikan-istri', data.pendidikan_istri || ''); onPendidikanChange('f-pendidikan-istri', 'f-tamat-istri-lbl');
  set('f-tamat-istri', data.tamat_istri || '');
  set('f-pekerjaan-istri', data.pekerjaan_istri || '');
  const alamatIstriEl = document.getElementById('f-alamat-istri');
  if (alamatIstriEl) alamatIstriEl.value = data.alamat_istri || '';

  // Penjamin Lainnya
  set('f-nama-penjamin', data.nama_penjamin || '');
  set('f-tempat-penjamin', data.tempat_lahir_penjamin || '');
  set('f-tgl-penjamin', data.tanggal_lahir_penjamin || '');
  set('f-agama-penjamin', data.agama_penjamin || '');
  set('f-suku-penjamin', data.suku_penjamin || '');
  set('f-bangsa-penjamin', data.bangsa_penjamin || '');
  set('f-warga-negara-penjamin', data.warga_negara_penjamin || '');
  set('f-pendidikan-penjamin', data.pendidikan_penjamin || ''); onPendidikanChange('f-pendidikan-penjamin', 'f-tamat-penjamin-lbl');
  set('f-tamat-penjamin', data.tamat_penjamin || '');
  set('f-pekerjaan-penjamin', data.pekerjaan_penjamin || '');
  const alamatPenjEl = document.getElementById('f-alamat-penjamin');
  if (alamatPenjEl) alamatPenjEl.value = data.alamat_penjamin || '';
  set('f-hubungan-penjamin', data.hubungan_penjamin || '');

  // Susunan keluarga
  const susunanKeluargaSama = data['Susunan Keluarga Sama'] || '';
  set('f-susunan-keluarga', susunanKeluargaSama); onSusunanChange();
  const limpahkan = document.getElementById('f-limpahkan-penjamin');
  if (limpahkan) limpahkan.checked = !!data.limpahkan_susunan_keluarga_penjamin;
  // Load arrays
  anggotaBersama.length = 0; anggotaKlien.length = 0; anggotaPenjamin.length = 0;
  const keluargaBersama = Array.isArray(data['Anggota Keluarga']) ? data['Anggota Keluarga'] : [];
  const keluargaKlien = Array.isArray(data['Anggota Keluarga Klien']) ? data['Anggota Keluarga Klien'] : [];
  const keluargaUtama = (susunanKeluargaSama === 'Tidak' && keluargaKlien.length) ? keluargaKlien : keluargaBersama;
  const keluargaKlienCanonical = keluargaKlien.length ? keluargaKlien : (susunanKeluargaSama === 'Tidak' ? keluargaBersama : []);
  keluargaUtama.forEach(r => anggotaBersama.push(r));
  keluargaKlienCanonical.forEach(r => anggotaKlien.push(r));
  (Array.isArray(data['Anggota Keluarga Penjamin']) ? data['Anggota Keluarga Penjamin'] : []).forEach(r => anggotaPenjamin.push(r));
  _renderFamTable('tbody-bersama', anggotaBersama);
  _renderFamTable('tbody-klien', anggotaKlien);
  _renderFamTable('tbody-penjamin', anggotaPenjamin);
  _updateTelpVis(); _updateLimpahkanVis();
  updateMarriageVisibility();
  updateLitmasInfo();
  updateProgress();
}

/* ── validateTab2 ── */
function validateTab2() {
  const missing = [];
  const pfx = 'Identitas > ';
  function chk(id, label) {
    const el = document.getElementById(id);
    if (!el || el.style.display === 'none') return;
    const v = (el.tagName === 'TEXTAREA' ? el.value : (el.value || '')).trim();
    if (!v) missing.push(label);
  }
  // Klien
  chk('f-register', pfx + 'Klien > Nomor Register Lapas');
  chk('f-putusan', pfx + 'Klien > Nomor Putusan Pengadilan');
  chk('f-tempat-lahir', pfx + 'Klien > Tempat Lahir');
  chk('f-tgl-lahir', pfx + 'Klien > Tanggal Lahir');
  chk('f-lama-pidana', pfx + 'Klien > Lama Pidana');
  if (_getV('f-ada-denda') === 'Ya') {
    chk('f-denda', pfx + 'Klien > Denda');
    chk('f-subsider', pfx + 'Klien > Subsider');
  }
  if (_getV('f-ada-uang-pengganti') === 'Ya') {
    chk('f-uang-pengganti', pfx + 'Klien > Uang Pengganti');
  }
  chk('f-agama', pfx + 'Klien > Agama');
  chk('f-suku', pfx + 'Klien > Suku');
  chk('f-bangsa', pfx + 'Klien > Bangsa');
  chk('f-warga-negara', pfx + 'Klien > Warga Negara');
  chk('f-pekerjaan', pfx + 'Klien > Pekerjaan');
  chk('f-tgl-putusan', pfx + 'Klien > Tanggal Putusan');
  chk('f-tgl-ekspirasi', pfx + 'Klien > Tanggal Ekspirasi');
  chk('f-jk', pfx + 'Klien > Jenis Kelamin');
  chk('f-pendidikan', pfx + 'Klien > Pendidikan');
  chk('f-status', pfx + 'Klien > Status Pernikahan');
  chk('f-alamat', pfx + 'Klien > Alamat');
  chk('f-ciri', pfx + 'Klien > Ciri-ciri Khusus');
  chk('f-penjamin', pfx + 'Klien > Penjamin');
  // Ayah
  chk('f-status-ayah', pfx + 'Ayah > Masih Hidup');
  chk('f-nama-ayah', pfx + 'Ayah > Nama');
  chk('f-tempat-ayah', pfx + 'Ayah > Tempat Lahir');
  chk('f-tgl-ayah', pfx + 'Ayah > Tanggal Lahir');
  chk('f-agama-ayah', pfx + 'Ayah > Agama');
  chk('f-suku-ayah', pfx + 'Ayah > Suku');
  chk('f-bangsa-ayah', pfx + 'Ayah > Bangsa');
  chk('f-warga-negara-ayah', pfx + 'Ayah > Warga Negara');
  chk('f-pendidikan-ayah', pfx + 'Ayah > Pendidikan');
  chk('f-pekerjaan-ayah', pfx + 'Ayah > Pekerjaan');
  chk('f-alamat-ayah', pfx + 'Ayah > Alamat');
  // Ibu
  chk('f-status-ibu', pfx + 'Ibu > Masih Hidup');
  chk('f-nama-ibu', pfx + 'Ibu > Nama');
  chk('f-tempat-ibu', pfx + 'Ibu > Tempat Lahir');
  chk('f-tgl-ibu', pfx + 'Ibu > Tanggal Lahir');
  chk('f-agama-ibu', pfx + 'Ibu > Agama');
  chk('f-suku-ibu', pfx + 'Ibu > Suku');
  chk('f-bangsa-ibu', pfx + 'Ibu > Bangsa');
  chk('f-warga-negara-ibu', pfx + 'Ibu > Warga Negara');
  chk('f-pendidikan-ibu', pfx + 'Ibu > Pendidikan');
  chk('f-pekerjaan-ibu', pfx + 'Ibu > Pekerjaan');
  chk('f-alamat-ibu', pfx + 'Ibu > Alamat');
  // Pasangan (kondisional)
  const jk = _getV('f-jk');
  const st = _getV('f-status');
  if (st === 'Menikah' && jk === 'Laki-laki') {
    ['f-nama-istri', 'f-tempat-istri', 'f-tgl-istri', 'f-agama-istri', 'f-suku-istri', 'f-bangsa-istri', 'f-warga-negara-istri', 'f-pendidikan-istri', 'f-pekerjaan-istri', 'f-alamat-istri'].forEach(id => chk(id, pfx + 'Istri > ' + id.replace('f-', '').replace('-istri', '').replace(/-/g, ' ')));
  } else if (st === 'Menikah' && jk === 'Perempuan') {
    ['f-nama-suami', 'f-tempat-suami', 'f-tgl-suami', 'f-agama-suami', 'f-suku-suami', 'f-bangsa-suami', 'f-warga-negara-suami', 'f-pendidikan-suami', 'f-pekerjaan-suami', 'f-alamat-suami'].forEach(id => chk(id, pfx + 'Suami > ' + id.replace('f-', '').replace('-suami', '').replace(/-/g, ' ')));
  }
  // Penjamin Lainnya
  if (_getV('f-penjamin') === 'Lainnya') {
    ['f-nama-penjamin', 'f-tempat-penjamin', 'f-tgl-penjamin', 'f-agama-penjamin', 'f-suku-penjamin', 'f-bangsa-penjamin', 'f-warga-negara-penjamin', 'f-pendidikan-penjamin', 'f-pekerjaan-penjamin', 'f-alamat-penjamin', 'f-hubungan-penjamin'].forEach(id => chk(id, pfx + 'Penjamin Lainnya > ' + id.replace('f-', '').replace(/-/g, ' ')));
  }
  // Susunan keluarga
  const sus = _getV('f-susunan-keluarga');
  if (!sus) missing.push(pfx + 'Susunan Keluarga Sama/Tidak');
  if (sus === 'Ya' && !anggotaBersama.length) missing.push(pfx + 'Tabel Susunan Keluarga (Bersama) masih kosong');
  if (sus === 'Tidak' && !anggotaBersama.length) missing.push(pfx + 'Tabel Susunan Keluarga Klien masih kosong');
  const limpahkan = document.getElementById('f-limpahkan-penjamin')?.checked;
  if (sus === 'Tidak' && !anggotaPenjamin.length && !limpahkan) missing.push(pfx + 'Tabel Susunan Keluarga Penjamin masih kosong');
  return missing;
}

/* ═══════════════════════════════════════════════
   BAB III — RIWAYAT HIDUP DAN PERKEMBANGAN KLIEN
   Semua logika sesuai integrasi.py baris 15539–16490
═══════════════════════════════════════════════ */

function onPertumbuhanChange() {
  const v = document.getElementById('f-pertumbuhan')?.value || '';
  const all = ['penyakit-bawaan', 'cacat-bawaan', 'usia-sakit', 'jenis-sakit', 'usia-musibah', 'jenis-cacat', 'penyebab-musibah'];
  all.forEach(k => {
    const show =
      (k === 'penyakit-bawaan' && v === 'Penyakit Bawaan') ||
      (k === 'cacat-bawaan' && v === 'Cacat Bawaan') ||
      (['usia-sakit', 'jenis-sakit'].includes(k) && v === 'Pernah Sakit Keras') ||
      (['usia-musibah', 'jenis-cacat', 'penyebab-musibah'].includes(k) && v === 'Cacat Akibat Musibah');
    const d = show ? '' : 'none';
    const lbl = document.getElementById('lbl-' + k);
    const inp = document.getElementById('f-' + k);
    if (lbl) lbl.style.display = d;
    if (inp) { inp.style.display = d; if (!show) inp.value = ''; }
  });
  updateProgress();
}

function onPsikososialChange() {
  const on = document.getElementById('f-psikososial')?.value === 'Tidak Normal';
  ['usia-gangguan', 'penyebab-gangguan'].forEach(k => {
    const lbl = document.getElementById('lbl-' + k);
    const inp = document.getElementById('f-' + k);
    if (lbl) lbl.style.display = on ? '' : 'none';
    if (inp) { inp.style.display = on ? '' : 'none'; if (!on) inp.value = ''; }
  });
  updateProgress();
}

function onPendidikanKeluargaChange() {
  const on = document.getElementById('f-pendidikan-keluarga')?.value === 'Isi Sendiri';
  const lbl = document.getElementById('lbl-pend-kel-custom');
  const ta = document.getElementById('f-pendidikan-keluarga-custom');
  if (lbl) lbl.style.display = on ? '' : 'none';
  if (ta) { ta.style.display = on ? '' : 'none'; if (!on) ta.value = ''; }
  updateProgress();
}

const _LEVEL_TO_STAGE = {
  'MI': 'SD', 'SD': 'SD',
  'MTs': 'SMP', 'SMP': 'SMP',
  'MA': 'SMA', 'SMA': 'SMA', 'SMK': 'SMA',
  'D1': 'PT', 'D2': 'PT', 'D3': 'PT', 'S1': 'PT', 'S2': 'PT', 'S3': 'PT'
};
const _TERTIARY_SET = new Set(['D1', 'D2', 'D3', 'S1', 'S2', 'S3']);

function updatePendidikanFormalFields() {
  const lvl = (document.getElementById('f-pendidikan')?.value || '').trim();
  const stage = _LEVEL_TO_STAGE[lvl] || '';
  const tidak = (lvl === 'Tidak Sekolah');

  document.getElementById('sec-pend-tidak').style.display = tidak ? '' : 'none';
  document.getElementById('sec-pend-sd').style.display = (!tidak && lvl !== '') ? '' : 'none';
  document.getElementById('sec-pend-smp').style.display = (['SMP', 'SMA', 'PT'].includes(stage)) ? '' : 'none';
  document.getElementById('sec-pend-sma').style.display = (['SMA', 'PT'].includes(stage)) ? '' : 'none';
  document.getElementById('sec-pend-pt').style.display = (stage === 'PT') ? '' : 'none';

  // Re-run alasan/kelas toggles after visibility change
  ['sd', 'smp', 'sma'].forEach(lvlKey => { onEduTinggalChange(lvlKey); onEduLulusChange(lvlKey); });
  onPtStatusChange();
  _ACC_REQ_CACHE.delete('acc-3-1');
  updateProgress();
}

function onEduTinggalChange(lvl) {
  const val = document.getElementById('f-' + lvl + '-tinggal')?.value || '';
  const sec = document.getElementById('sec-pend-' + lvl);
  if (!sec || sec.style.display === 'none') return;
  const hide = val === 'Tidak';
  const lbl = document.getElementById('lbl-' + lvl + '-kelas');
  const inp = document.getElementById('f-' + lvl + '-kelas');
  if (lbl) lbl.style.display = hide ? 'none' : '';
  if (inp) { inp.style.display = hide ? 'none' : ''; if (hide) inp.value = ''; }
  updateProgress();
}

function onEduLulusChange(lvl) {
  const val = document.getElementById('f-' + lvl + '-lulus')?.value || '';
  const sec = document.getElementById('sec-pend-' + lvl);
  if (!sec || sec.style.display === 'none') return;
  const hide = val === 'Ya';
  const lbl = document.getElementById('lbl-' + lvl + '-alasan');
  const inp = document.getElementById('f-' + lvl + '-alasan');
  if (lbl) lbl.style.display = hide ? 'none' : '';
  if (inp) { inp.style.display = hide ? 'none' : ''; if (hide) inp.value = ''; }
  updateProgress();
}

function onPtStatusChange() {
  const val = document.getElementById('f-pt-status')?.value || '';
  const sec = document.getElementById('sec-pend-pt');
  if (!sec || sec.style.display === 'none') return;
  const hide = val === 'Lulus';
  const lbl = document.getElementById('lbl-pt-alasan');
  const inp = document.getElementById('f-pt-alasan');
  if (lbl) lbl.style.display = hide ? 'none' : '';
  if (inp) { inp.style.display = hide ? 'none' : ''; if (hide) inp.value = ''; }
  updateProgress();
}

function onNonformalChange() {
  const on = document.getElementById('f-nonformal')?.value === 'Ya';
  const lbl = document.getElementById('lbl-jenis-nonformal');
  const inp = document.getElementById('f-jenis-nonformal');
  if (lbl) lbl.style.display = on ? '' : 'none';
  if (inp) { inp.style.display = on ? '' : 'none'; if (!on) inp.value = ''; }
  updateProgress();
}

function onBakatPunyaChange() {
  const on = document.getElementById('f-bakat-punya')?.value === 'Ya';
  ['bakat', 'spesialisasi', 'prestasi', 'relevansi'].forEach(k => {
    const lbl = document.getElementById('lbl-' + k);
    const el = document.getElementById('f-' + k);
    if (lbl) lbl.style.display = on ? '' : 'none';
    if (el) { el.style.display = on ? '' : 'none'; if (!on) el.value = ''; }
  });
  if (!on) {
    const dp = document.getElementById('lbl-detail-prestasi');
    const di = document.getElementById('f-detail-prestasi');
    if (dp) dp.style.display = 'none';
    if (di) { di.style.display = 'none'; di.value = ''; }
  } else {
    onPrestasiChange();
  }
  updateProgress();
}

function onPrestasiChange() {
  const on = document.getElementById('f-prestasi')?.value === 'Ya';
  const lbl = document.getElementById('lbl-detail-prestasi');
  const inp = document.getElementById('f-detail-prestasi');
  if (lbl) lbl.style.display = on ? '' : 'none';
  if (inp) { inp.style.display = on ? '' : 'none'; if (!on) inp.value = ''; }
  updateProgress();
}

function validateRelasi() {
  const baik = ['orang-tua', 'saudara', 'suami-istri', 'anak'].filter(k => document.getElementById('f-baik-' + k)?.checked);
  const kurang = ['orang-tua', 'saudara', 'suami-istri', 'anak'].filter(k => document.getElementById('f-kurang-' + k)?.checked);
  const conflict = baik.filter(k => kurang.includes(k));
  const warn = document.getElementById('relasi-conflict-warn');
  if (conflict.length && warn) {
    const names = conflict.map(k => k.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
    const sp = warn.querySelector('span') || warn;
    sp.textContent = 'Konflik: ' + names.join(', ') + ' dipilih di keduanya';
    warn.style.display = 'flex';
  } else if (warn) {
    warn.style.display = 'none';
  }
  updateProgress();
}

function _syncKebiasaan(type) {
  const tags = document.getElementById('tags-kebiasaan-' + type);
  const hidden = document.getElementById('f-kebiasaan-' + type);
  if (!tags || !hidden) return;
  const vals = [...tags.querySelectorAll('.kb-tag')].map(t => (t.dataset.val || ''));
  hidden.value = JSON.stringify(vals);
  updateProgress();
}

function _escKb(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function _makeTag(val, type) {
  const tag = document.createElement('span');
  tag.className = 'kb-tag';
  tag.dataset.val = val;
  tag.innerHTML = `<span class="kb-tag-text" title="Double-click untuk edit">${_escKb(val)}</span><button type="button" class="kb-del" title="Hapus">×</button>`;
  // Hapus
  tag.querySelector('.kb-del').addEventListener('click', e => {
    e.stopPropagation();
    tag.remove();
    _syncKebiasaan(type);
  });
  // Edit inline — double click
  tag.querySelector('.kb-tag-text').addEventListener('dblclick', e => {
    e.stopPropagation();
    _startEditTag(tag, type);
  });
  return tag;
}

function _startEditTag(tag, type) {
  if (tag.querySelector('.kb-tag-edit')) return; // already editing
  const oldVal = tag.dataset.val || '';
  tag.innerHTML = '';
  tag.classList.add('kb-tag-editing');
  const wrap = document.createElement('span');
  wrap.className = 'kb-tag-edit';
  const inp = document.createElement('input');
  inp.value = oldVal;
  inp.style.width = (Math.max(oldVal.length, 4) * 9) + 'px';
  inp.addEventListener('input', () => { inp.style.width = (Math.max(inp.value.length, 4) * 9) + 'px'; });
  const btnOk = document.createElement('button');
  btnOk.type = 'button'; btnOk.textContent = '✓';
  btnOk.style.cssText = 'background:none;border:none;color:var(--gold);cursor:pointer;font-size:14px;padding:0 2px';
  function commit() {
    const newVal = (inp.value || '').trim();
    if (!newVal) { tag.remove(); }
    else {
      tag.dataset.val = newVal;
      tag.classList.remove('kb-tag-editing');
      tag.innerHTML = '';
      tag.appendChild(document.createTextNode(''));
      // rebuild inner HTML using _makeTag pattern
      tag.innerHTML = `<span class="kb-tag-text" title="Double-click untuk edit">${_escKb(newVal)}</span><button type="button" class="kb-del" title="Hapus">×</button>`;
      tag.querySelector('.kb-del').addEventListener('click', ev => { ev.stopPropagation(); tag.remove(); _syncKebiasaan(type); });
      tag.querySelector('.kb-tag-text').addEventListener('dblclick', ev => { ev.stopPropagation(); _startEditTag(tag, type); });
    }
    _syncKebiasaan(type);
  }
  btnOk.addEventListener('click', e => { e.stopPropagation(); commit(); });
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') {
      e.preventDefault();
      // restore
      tag.classList.remove('kb-tag-editing');
      tag.innerHTML = `<span class="kb-tag-text" title="Double-click untuk edit">${_escKb(oldVal)}</span><button type="button" class="kb-del" title="Hapus">×</button>`;
      tag.querySelector('.kb-del').addEventListener('click', ev => { ev.stopPropagation(); tag.remove(); _syncKebiasaan(type); });
      tag.querySelector('.kb-tag-text').addEventListener('dblclick', ev => { ev.stopPropagation(); _startEditTag(tag, type); });
    }
  });
  inp.addEventListener('blur', () => setTimeout(() => { if (tag.querySelector('.kb-tag-edit')) commit(); }, 150));
  wrap.appendChild(inp);
  wrap.appendChild(btnOk);
  tag.appendChild(wrap);
  requestAnimationFrame(() => inp.focus());
}

function addKebiasaan(type) {
  const inp = document.getElementById('f-kebiasaan-' + type + '-input');
  const val = (inp?.value || '').trim();
  if (!val) return;
  const container = document.getElementById('tags-kebiasaan-' + type);
  if (!container) return;
  container.appendChild(_makeTag(val, type));
  inp.value = '';
  inp.focus();
  _syncKebiasaan(type);
}

function removeKebiasaan(btn) {
  const tag = btn.closest('.kb-tag');
  const type = tag?.closest('[id^="tags-kebiasaan-"]')?.id.replace('tags-kebiasaan-', '');
  tag?.remove();
  if (type) _syncKebiasaan(type);
}

function onPelanggaranChange() {
  const on = document.getElementById('f-pelanggaran')?.value === 'Ya';
  const sec = document.getElementById('sec-pelanggaran-detail');
  if (sec) sec.style.display = on ? '' : 'none';
  if (!on) {
    // clear table
    document.getElementById('tbl-pelanggaran').innerHTML = '<div id="tbl-pel-empty" style="padding:14px 12px;font-size:13px;color:rgba(var(--tc),.4);font-style:italic">Belum ada data pelanggaran</div>';
  }
  updateProgress();
}

let _pelRows = [];
function addPelanggaran() {
  const tahun = (document.getElementById('f-pel-tahun')?.value || '').trim();
  const tindak = (document.getElementById('f-pel-tindak')?.value || '').trim();
  if (!tahun || !tindak) { toast('Isi tahun dan tindak pidana terlebih dahulu.'); return; }
  _pelRows.push({ tahun, tindak });
  _renderPelanggaran();
  document.getElementById('f-pel-tahun').value = '';
  document.getElementById('f-pel-tindak').value = '';
}

function removePelanggaran(idx) {
  _pelRows.splice(idx, 1);
  _renderPelanggaran();
}

function _renderPelanggaran() {
  const tbl = document.getElementById('tbl-pelanggaran');
  if (!tbl) return;
  if (_pelRows.length === 0) {
    tbl.innerHTML = '<div id="tbl-pel-empty" style="padding:14px 12px;font-size:13px;color:rgba(var(--tc),.4);font-style:italic">Belum ada data pelanggaran</div>';
    return;
  }
  tbl.innerHTML = _pelRows.map((r, i) =>
    `<div class="pel-row"><span>${_escHtml(r.tahun)}</span><span>${_escHtml(r.tindak)}</span><button type="button" class="pel-del" onclick="removePelanggaran(${i})" title="Hapus">×</button></div>`
  ).join('');
}

function onKonsumsiChange(pfx) {
  const on = document.getElementById('f-' + pfx)?.value === 'Ya';
  ['sejak', 'faktor', 'status'].forEach(k => {
    const lbl = document.getElementById('lbl-' + pfx + '-' + k);
    const el = document.getElementById('f-' + pfx + '-' + k);
    if (lbl) lbl.style.display = on ? '' : 'none';
    if (el) { el.style.display = on ? '' : 'none'; if (!on) el.value = ''; }
  });
  // also clear berhenti
  const lb = document.getElementById('lbl-' + pfx + '-berhenti');
  const ib = document.getElementById('f-' + pfx + '-berhenti');
  if (lb) lb.style.display = 'none';
  if (ib) { ib.style.display = 'none'; ib.value = ''; }
  updateProgress();
}

function onKonsumsiStatusChange(pfx) {
  const on = document.getElementById('f-' + pfx + '-status')?.value === 'Berhenti';
  const lbl = document.getElementById('lbl-' + pfx + '-berhenti');
  const inp = document.getElementById('f-' + pfx + '-berhenti');
  if (lbl) lbl.style.display = on ? '' : 'none';
  if (inp) { inp.style.display = on ? '' : 'none'; if (!on) inp.value = ''; }
  updateProgress();
}

function updateMarriageVisibility() {
  // Sinkron dari f-status (tp-2)
  const status = document.getElementById('f-status')?.value || '';
  const acc = document.getElementById('acc-3-3');
  if (!acc) return;
  if (status === 'Belum Menikah' || !status) {
    acc.style.display = 'none';
    document.getElementById('f-jumlah-pernikahan').value = '';
    document.getElementById('marriage-frames').innerHTML = '';
  } else {
    acc.style.display = '';
    // Jika jumlah belum dipilih, default 1
    if (!document.getElementById('f-jumlah-pernikahan').value) {
      document.getElementById('f-jumlah-pernikahan').value = '1';
      updateMarriageFrames();
    }
  }
  _ACC_REQ_CACHE.delete('acc-3-3');
  updateProgress();
}

function updateMarriageFrames() {
  const marriageEntries = window.MarriageEntries && window.MarriageEntries.byKey && window.MarriageEntries.byKey('IK');
  if (marriageEntries && typeof marriageEntries.addEntry === 'function' && typeof marriageEntries.removeEntry === 'function') {
    const target = parseInt(document.getElementById('f-jumlah-pernikahan')?.value || '0') || 0;
    let current = typeof marriageEntries.count === 'function' ? marriageEntries.count() : 0;
    while (current < target) current = marriageEntries.addEntry();
    while (current > target) current = marriageEntries.removeEntry(current);
    if (typeof marriageEntries.rebuild === 'function') marriageEntries.rebuild();
    _ACC_REQ_CACHE.delete('acc-3-3');
    updateProgress();
    return;
  }
  const cnt = parseInt(document.getElementById('f-jumlah-pernikahan')?.value || '0') || 0;
  const container = document.getElementById('marriage-frames');
  if (!container) return;
  // Save existing values before rebuilding
  const existing = {};
  container.querySelectorAll('[id^="mf-"]').forEach(el => {
    existing[el.id] = el.type === 'checkbox' ? el.checked : (el.value || '');
  });
  container.innerHTML = '';
  for (let i = 1; i <= cnt; i++) {
    container.insertAdjacentHTML('beforeend', _buildMarriageFrame(i));
  }
  // Restore values
  Object.entries(existing).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = val;
    else el.value = val;
  });
  // Run conditional toggles
  for (let i = 1; i <= cnt; i++) {
    onMarriageAnakChange(i);
    onMarriageStatusChange(i);
  }
  _ACC_REQ_CACHE.delete('acc-3-3');
  updateProgress();
}

function _buildMarriageFrame(n) {
  return `<div class="marriage-block" id="marriage-block-${n}">
    <div class="marriage-block-title">Pernikahan ke-${n}</div>
    <div class="fgrid">
      <div class="flbl req">Nama Pasangan</div>
      <input class="finp" id="mf-${n}-nama-pasangan" type="text" spellcheck="false">
      <div class="flbl req">Tempat Nikah</div>
      <input class="finp w-md" id="mf-${n}-tempat-nikah" type="text" spellcheck="false">
      <div class="flbl req">Tanggal Nikah</div>
      <input class="finp w-md dp-input" id="mf-${n}-tanggal-nikah" type="text" placeholder="dd/mm/yyyy" autocomplete="off" spellcheck="false">
      <div class="flbl req">Secara Agama</div>
      <select class="fsel w-md" id="mf-${n}-agama">
        <option value="">— Pilih —</option>
        <option>Islam</option><option>Kristen</option><option>Katolik</option>
        <option>Hindu</option><option>Buddha</option><option>Konghucu</option>
      </select>
      <div class="flbl req">Atas Dasar</div>
      <input class="finp w-md" id="mf-${n}-atas-dasar" type="text" spellcheck="false">
      <div class="flbl req">Mendapat Restu Orang Tua?</div>
      <select class="fsel w-sm" id="mf-${n}-restu">
        <option value="">— Pilih —</option><option>Ya</option><option>Tidak</option>
      </select>
      <div class="flbl req">Punya Anak?</div>
      <select class="fsel w-sm" id="mf-${n}-punya-anak" onchange="onMarriageAnakChange(${n})">
        <option value="">— Pilih —</option><option>Ya</option><option>Tidak</option>
      </select>
      <div class="flbl" id="mf-${n}-lbl-laki" style="display:none">Jumlah Anak Laki-laki</div>
      <input class="finp w-sm" id="mf-${n}-anak-laki" type="text" style="display:none" spellcheck="false">
      <div class="flbl" id="mf-${n}-lbl-perempuan" style="display:none">Jumlah Anak Perempuan</div>
      <input class="finp w-sm" id="mf-${n}-anak-perempuan" type="text" style="display:none" spellcheck="false">
      <div class="flbl req">Status Saat Ini</div>
      <select class="fsel w-md" id="mf-${n}-status" onchange="onMarriageStatusChange(${n})">
        <option value="">— Pilih —</option>
        <option>Masih Bersama</option><option>Berpisah</option><option>Meninggal Dunia</option>
      </select>
      <div class="flbl" id="mf-${n}-lbl-meninggal" style="display:none">Tahun Meninggal</div>
      <input class="finp w-sm" id="mf-${n}-tahun-meninggal" type="text" style="display:none" spellcheck="false">
    </div>
  </div>`;
}

function onMarriageAnakChange(n) {
  const on = document.getElementById('mf-' + n + '-punya-anak')?.value === 'Ya';
  ['laki', 'perempuan'].forEach(k => {
    const lbl = document.getElementById('mf-' + n + '-lbl-' + k);
    const inp = document.getElementById('mf-' + n + '-anak-' + k);
    if (lbl) lbl.style.display = on ? '' : 'none';
    if (inp) { inp.style.display = on ? '' : 'none'; if (!on) inp.value = ''; }
  });
  updateProgress();
}

function onMarriageStatusChange(n) {
  const on = document.getElementById('mf-' + n + '-status')?.value === 'Meninggal Dunia';
  const lbl = document.getElementById('mf-' + n + '-lbl-meninggal');
  const inp = document.getElementById('mf-' + n + '-tahun-meninggal');
  if (lbl) lbl.style.display = on ? '' : 'none';
  if (inp) { inp.style.display = on ? '' : 'none'; if (!on) inp.value = ''; }
  updateProgress();
}

/* ── Hook: sinkron pendidikan formal & pernikahan dari tp-2 ── */
(function () {
  // Observe f-pendidikan changes (tp-2) → update tp-3 pendidikan formal
  function _hookPendidikan() {
    const el = document.getElementById('f-pendidikan');
    if (!el) return;
    el.addEventListener('change', updatePendidikanFormalFields);
    updatePendidikanFormalFields();
  }
  // Observe f-status (tp-2) → update acc-3-15
  function _hookStatus() {
    const el = document.getElementById('f-status');
    if (!el) return;
    el.addEventListener('change', updateMarriageVisibility);
    updateMarriageVisibility();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { _hookPendidikan(); _hookStatus(); });
  } else {
    _hookPendidikan(); _hookStatus();
  }
})();

/* ── getTabIDs — tambah tab 3 ── */
(function () {
  const _origGetTabIDs = getTabIDs;

  function _getTab3IDs() {
    const panel = document.getElementById('tp-3');
    if (!panel) return [];
    const ids = new Set();

    // Required fields (static + dynamic marriage frames)
    panel.querySelectorAll('.flbl.req').forEach(lbl => {
      let el = lbl.nextElementSibling;
      if (!el) return;
      let inp = el.matches('input,select,textarea') ? el : el.querySelector('input,select,textarea');
      if (inp && inp.id) ids.add(inp.id);
    });

    // Pendidikan formal — key fields when section is visible
    ['sd', 'smp', 'sma'].forEach(lvl => {
      const sec = document.getElementById('sec-pend-' + lvl);
      if (sec && sec.style.display !== 'none') ids.add('f-' + lvl + '-lulus');
    });
    const ptSec = document.getElementById('sec-pend-pt');
    if (ptSec && ptSec.style.display !== 'none') {
      ids.add('f-pt-jenjang');
      ids.add('f-pt-status');
    }

    return [...ids];
  }

  window.getTabIDs = function (t) {
    if (t === 3) return _getTab3IDs();
    return _origGetTabIDs(t);
  };
})();


/* ══════════════════════════════════════════
   TAB III — RIWAYAT HIDUP DAN PERKEMBANGAN KLIEN
══════════════════════════════════════════ */
function collectTab3() {
  function v(id) { const el = document.getElementById(id); return el ? (el.value || '').trim() : ''; }
  function cb(id) { return document.getElementById(id)?.checked || false; }

  const pertumbuhan = v('f-pertumbuhan');
  const psiko = v('f-psikososial');
  const pendKeluarga = v('f-pendidikan-keluarga');
  const bakatPunya = v('f-bakat-punya');
  const prestasi = v('f-prestasi');
  const lvl = v('f-pendidikan') || '';
  const stage = _LEVEL_TO_STAGE[lvl] || '';
  const nonformal = v('f-nonformal');

  const relasi_baik = ['orang_tua', 'saudara', 'suami_istri', 'anak']
    .filter(k => cb('f-baik-' + k.replace(/_/g, '-')));
  const relasi_kurang = ['orang_tua', 'saudara', 'suami_istri', 'anak']
    .filter(k => cb('f-kurang-' + k.replace(/_/g, '-')));

  function getKebiasaan(type) {
    try { return JSON.parse(document.getElementById('f-kebiasaan-' + type)?.value || '[]'); }
    catch { return []; }
  }

  const pelanggaran = v('f-pelanggaran');
  const riwayat_pelanggaran = pelanggaran === 'Ya' ? _pelRows.map(r => ({ tahun: r.tahun, tindak_pidana: r.tindak })) : [];

  function konsumsi(pfx) {
    const k = { konsumsi: v('f-' + pfx) };
    if (k.konsumsi === 'Ya') {
      k.tahun_mulai = v('f-' + pfx + '-sejak');
      k.faktor = v('f-' + pfx + '-faktor');
      k.status = v('f-' + pfx + '-status');
      if (k.status === 'Berhenti') k.tahun_berhenti = v('f-' + pfx + '-berhenti');
    }
    return k;
  }

  const pendFormal = {
    SD: { nama: v('f-sd-nama'), tinggal_kelas: v('f-sd-tinggal'), kelas_tinggal: v('f-sd-kelas'), lulus: v('f-sd-lulus'), alasan_tidak_lulus: v('f-sd-alasan') },
    SMP: { nama: v('f-smp-nama'), tinggal_kelas: v('f-smp-tinggal'), kelas_tinggal: v('f-smp-kelas'), lulus: v('f-smp-lulus'), alasan_tidak_lulus: v('f-smp-alasan') },
    SMA: { nama: v('f-sma-nama'), tinggal_kelas: v('f-sma-tinggal'), kelas_tinggal: v('f-sma-kelas'), lulus: v('f-sma-lulus'), alasan_tidak_lulus: v('f-sma-alasan') },
    Perguruan_Tinggi: { jenjang: v('f-pt-jenjang'), nama: v('f-pt-nama'), jurusan: v('f-pt-jurusan'), status: v('f-pt-status'), alasan: v('f-pt-alasan') }
  };

  // Riwayat Pernikahan
  const statusNikah = v('f-status');
  let riwayat_pernikahan = [];
  if (statusNikah && statusNikah !== 'Belum Menikah') {
    const cnt = parseInt(v('f-jumlah-pernikahan') || '0') || 0;
    for (let i = 1; i <= cnt; i++) {
      riwayat_pernikahan.push({
        [`Nama_Pasangan_${i}`]: v(`mf-${i}-nama-pasangan`),
        [`Tempat_Nikah_${i}`]: v(`mf-${i}-tempat-nikah`),
        [`Tanggal_Nikah_${i}`]: v(`mf-${i}-tanggal-nikah`),
        [`Agama_Nikah_${i}`]: v(`mf-${i}-agama`),
        [`Dasar_Nikah_${i}`]: v(`mf-${i}-atas-dasar`),
        [`Restu_Ortu_${i}`]: v(`mf-${i}-restu`),
        [`Punya_Anak_${i}`]: v(`mf-${i}-punya-anak`),
        [`Anak_Laki_${i}`]: v(`mf-${i}-anak-laki`) || '0',
        [`Anak_Perempuan_${i}`]: v(`mf-${i}-anak-perempuan`) || '0',
        [`Status_Saat_Ini_${i}`]: v(`mf-${i}-status`),
        [`Tahun_Meninggal_${i}`]: v(`mf-${i}-tahun-meninggal`) || ''
      });
    }
  }

  return {
    // Data Persalinan
    'Bantuan Persalinan': v('f-bantuan-persalinan'),
    'Kondisi Persalinan': v('f-kondisi-persalinan'),
    'Anak Ke': v('f-anak-ke'),
    'Jumlah Saudara': v('f-jumlah-saudara'),
    // Pertumbuhan
    'Riwayat Pertumbuhan': {
      kondisi: pertumbuhan,
      penyakit_bawaan: pertumbuhan === 'Penyakit Bawaan' ? v('f-penyakit-bawaan') : '',
      cacat_bawaan: pertumbuhan === 'Cacat Bawaan' ? v('f-cacat-bawaan') : '',
      usia_sakit: pertumbuhan === 'Pernah Sakit Keras' ? v('f-usia-sakit') : '',
      jenis_sakit: pertumbuhan === 'Pernah Sakit Keras' ? v('f-jenis-sakit') : '',
      usia_musibah: pertumbuhan === 'Cacat Akibat Musibah' ? v('f-usia-musibah') : '',
      jenis_cacat: pertumbuhan === 'Cacat Akibat Musibah' ? v('f-jenis-cacat') : '',
      penyebab_musibah: pertumbuhan === 'Cacat Akibat Musibah' ? v('f-penyebab-musibah') : ''
    },
    // Psikososial
    psikososial: psiko,
    usia_gangguan: psiko === 'Tidak Normal' ? v('f-usia-gangguan') : '',
    penyebab_gangguan: psiko === 'Tidak Normal' ? v('f-penyebab-gangguan') : '',
    // Pendidikan Keluarga
    'Pendidikan_Keluarga': {
      status: pendKeluarga,
      custom_text: pendKeluarga === 'Isi Sendiri' ? v('f-pendidikan-keluarga-custom') : ''
    },
    // Pendidikan Formal
    'Pendidikan_Formal': pendFormal,
    // Pendidikan Nonformal
    'Pendidikan Nonformal': {
      status: nonformal,
      jenis: nonformal === 'Ya' ? v('f-jenis-nonformal') : ''
    },
    // Bakat
    bakat_punya: bakatPunya,
    bakat: bakatPunya === 'Ya' ? v('f-bakat') : '',
    spesialisasi: bakatPunya === 'Ya' ? v('f-spesialisasi') : '',
    punya_prestasi: bakatPunya === 'Ya' ? prestasi : '',
    detail_prestasi: (bakatPunya === 'Ya' && prestasi === 'Ya') ? v('f-detail-prestasi') : '',
    relevansi_pekerjaan: bakatPunya === 'Ya' ? v('f-relevansi') : '',
    // Relasi
    'Relasi Sosial': { baik: relasi_baik, kurang: relasi_kurang },
    // Ketaatan
    'Ketaatan_Agama': v('f-ketaatan'),
    // Kebiasaan
    'Kebiasaan Baik': getKebiasaan('baik'),
    'Kebiasaan Buruk': getKebiasaan('buruk'),
    // Sikap Kerja
    'Sikap Kerja': v('f-sikap-kerja'),
    // Pelanggaran
    pelanggaran: pelanggaran,
    riwayat_pelanggaran: { daftar: riwayat_pelanggaran },
    // Konsumsi
    rokok: konsumsi('rokok'),
    miras: konsumsi('miras'),
    napza: konsumsi('napza'),
    // Pernikahan
    'Jumlah Pernikahan': v('f-jumlah-pernikahan'),
    'Riwayat Pernikahan': riwayat_pernikahan,
  };
}

function loadTab3(data) {
  if (!data) return;
  function set(id, val) { const el = document.getElementById(id); if (!el || val == null) return; el.value = String(val); }
  function setCb(id, val) { const el = document.getElementById(id); if (el) el.checked = !!val; }

  /* ── Normalisasi format Tkinter (snake_case flat) → format webview ──
     Tkinter menyimpan data Bab III sebagai field-field terpisah dengan
     nama snake_case, sementara webview menyimpan dalam struktur objek
     bersarang dengan Title Case. Fungsi g() mencoba kedua format.      */
  function g(wvKey, tkKey) { return (data[wvKey] != null && data[wvKey] !== '') ? data[wvKey] : (data[tkKey] || ''); }

  // Persalinan
  set('f-bantuan-persalinan', g('Bantuan Persalinan', 'bantuan_persalinan'));
  set('f-kondisi-persalinan', g('Kondisi Persalinan', 'kondisi_persalinan'));
  set('f-anak-ke', g('Anak Ke', 'anak_ke'));
  set('f-jumlah-saudara', g('Jumlah Saudara', 'jumlah_saudara'));

  // Pertumbuhan — webview: data['Riwayat Pertumbuhan']={kondisi,...}
  //               Tkinter: data.pertumbuhan_fisik + data.penyakit_bawaan, dst (flat)
  const rp = data['Riwayat Pertumbuhan'] || {};
  const rpKondisi = rp.kondisi || data.pertumbuhan_fisik || '';
  set('f-pertumbuhan', rpKondisi);
  onPertumbuhanChange();
  set('f-penyakit-bawaan', rp.penyakit_bawaan || data.penyakit_bawaan || '');
  set('f-cacat-bawaan', rp.cacat_bawaan || data.cacat_bawaan || '');
  set('f-usia-sakit', rp.usia_sakit || data.usia_sakit || '');
  set('f-jenis-sakit', rp.jenis_sakit || data.jenis_sakit || '');
  set('f-usia-musibah', rp.usia_musibah || data.usia_musibah || '');
  set('f-jenis-cacat', rp.jenis_cacat || data.jenis_cacat || '');
  set('f-penyebab-musibah', rp.penyebab_musibah || data.penyebab_musibah || '');

  // Psikososial — webview: data.psikososial | Tkinter: data.status_psikososial
  set('f-psikososial', data.psikososial || data.status_psikososial || '');
  onPsikososialChange();
  set('f-usia-gangguan', data.usia_gangguan || '');
  set('f-penyebab-gangguan', data.penyebab_gangguan || '');

  // Pendidikan Keluarga — webview: data['Pendidikan_Keluarga']={status,custom_text}
  //                       Tkinter: data.pendidikan_keluarga + data.pendidikan_keluarga_custom
  const pk = data['Pendidikan_Keluarga'] || {};
  set('f-pendidikan-keluarga', pk.status || data.pendidikan_keluarga || '');
  onPendidikanKeluargaChange();
  set('f-pendidikan-keluarga-custom', pk.custom_text || data.pendidikan_keluarga_custom || '');

  // Pendidikan Formal — webview: data['Pendidikan_Formal']={SD:{nama,...},SMP,SMA,Perguruan_Tinggi}
  //                     Tkinter: data.sekolah_dasar_nama, data.sekolah_dasar_tinggal_kelas, dst
  const pf = data['Pendidikan_Formal'] || {};
  function loadEdu(lvlKey, obj, tkPfx) {
    // obj = webview format object; tkPfx = tkinter prefix (e.g. 'sekolah_dasar')
    const wvObj = obj || {};
    set('f-' + lvlKey + '-nama', wvObj.nama || data[tkPfx + '_nama'] || '');
    set('f-' + lvlKey + '-tinggal', wvObj.tinggal_kelas || data[tkPfx + '_tinggal_kelas'] || '');
    onEduTinggalChange(lvlKey);
    set('f-' + lvlKey + '-kelas', wvObj.kelas_tinggal || data[tkPfx + '_kelas_tinggal'] || '');
    set('f-' + lvlKey + '-lulus', wvObj.lulus || data[tkPfx + '_lulus'] || '');
    onEduLulusChange(lvlKey);
    set('f-' + lvlKey + '-alasan', wvObj.alasan_tidak_lulus || data[tkPfx + '_alasan'] || '');
  }
  loadEdu('sd', pf.SD, 'sekolah_dasar');
  loadEdu('smp', pf.SMP, 'sekolah_menengah_pertama');
  loadEdu('sma', pf.SMA, 'sekolah_menengah_atas');
  const pt = pf.Perguruan_Tinggi || {};
  set('f-pt-jenjang', pt.jenjang || data.perguruan_tinggi_jenjang || '');
  set('f-pt-nama', pt.nama || data.perguruan_tinggi_nama || '');
  set('f-pt-jurusan', pt.jurusan || data.perguruan_tinggi_jurusan || '');
  set('f-pt-status', pt.status || data.perguruan_tinggi_status || '');
  onPtStatusChange();
  set('f-pt-alasan', pt.alasan || data.perguruan_tinggi_alasan || '');

  // Pendidikan Nonformal — webview: data['Pendidikan Nonformal']={status,jenis}
  //                        Tkinter: data.pendidikan_nonformal + data.jenis_pendidikan_nonformal
  const pn = data['Pendidikan Nonformal'] || {};
  set('f-nonformal', pn.status || data.pendidikan_nonformal || '');
  onNonformalChange();
  set('f-jenis-nonformal', pn.jenis || data.jenis_pendidikan_nonformal || '');

  // Bakat
  set('f-bakat-punya', data.bakat_punya || '');
  onBakatPunyaChange();
  set('f-bakat', data.bakat || '');
  set('f-spesialisasi', data.spesialisasi || '');
  set('f-prestasi', data.punya_prestasi || '');
  onPrestasiChange();
  set('f-detail-prestasi', data.detail_prestasi || '');
  set('f-relevansi', data.relevansi_pekerjaan || '');

  // Relasi Sosial — webview: data['Relasi Sosial']={baik:[...], kurang:[...]}
  //                 Tkinter: data.relasi_baik={orang_tua:true,...}, data.relasi_kurang={...}
  const rs = data['Relasi Sosial'] || {};
  if (rs.baik || rs.kurang) {
    // Format webview: array
    (rs.baik || []).forEach(k => setCb('f-baik-' + k.replace(/_/g, '-'), true));
    (rs.kurang || []).forEach(k => setCb('f-kurang-' + k.replace(/_/g, '-'), true));
  } else {
    // Format Tkinter: dict boolean
    const relBaik = data.relasi_baik || {};
    const relKurang = data.relasi_kurang || {};
    Object.keys(relBaik).forEach(k => setCb('f-baik-' + k.replace(/_/g, '-'), relBaik[k]));
    Object.keys(relKurang).forEach(k => setCb('f-kurang-' + k.replace(/_/g, '-'), relKurang[k]));
  }
  validateRelasi();

  // Ketaatan — webview: data['Ketaatan_Agama'] | Tkinter: data.ketaatan_agama
  set('f-ketaatan', data['Ketaatan_Agama'] || data.ketaatan_agama || '');

  // Kebiasaan — webview: data['Kebiasaan Baik'] (array)
  //              Tkinter: data.kebiasaan_baik (array)
  function loadKebiasaan(type, arr) {
    const container = document.getElementById('tags-kebiasaan-' + type);
    if (!container) return;
    container.innerHTML = '';
    (arr || []).forEach(val => {
      if ((val || '').trim()) container.appendChild(_makeTag(val.trim(), type));
    });
    _syncKebiasaan(type);
  }
  loadKebiasaan('baik', data['Kebiasaan Baik'] || data.kebiasaan_baik || []);
  loadKebiasaan('buruk', data['Kebiasaan Buruk'] || data.kebiasaan_buruk || []);

  // Sikap Kerja — webview: data['Sikap Kerja'] | Tkinter: data.sikap_kerja_sebelum
  set('f-sikap-kerja', data['Sikap Kerja'] || data.sikap_kerja_sebelum || '');

  //              webview pakai key 'pelanggaran' + {daftar:[{tahun,tindak_pidana}]}
  const pelFlag = data.pelanggaran || data.ada_pelanggaran ||
    (data.riwayat_pelanggaran && typeof data.riwayat_pelanggaran === 'object' && !Array.isArray(data.riwayat_pelanggaran)
      ? data.riwayat_pelanggaran.status : '') || '';
  set('f-pelanggaran', pelFlag);
  onPelanggaranChange();
  {
    const rawPel = data.riwayat_pelanggaran || [];
    let daftarPel;
    if (Array.isArray(rawPel)) {
      daftarPel = rawPel;
    } else if (rawPel && typeof rawPel === 'object') {
      // Format webview: {status, daftar:[{tahun, tindak_pidana}]}
      daftarPel = rawPel.daftar || [];
    } else {
      daftarPel = [];
    }
    _pelRows = daftarPel.map(r => ({
      tahun: String(r.tahun || ''),
      tindak: String(r.tindak_pidana || r.tindak || '')
    }));
    _renderPelanggaran();
  }

  //             Tkinter pakai 'Konsumsi':{rokok:{status,tahun,faktor,status_konsumsi,tahun_berhenti}}
  function _getKonsumsiObj(pfx) {
    var obj = data[pfx];
    // Dari Tkinter submit_form: data['Konsumsi'].rokok / .miras / .napza
    if (!obj && data['Konsumsi'] && data['Konsumsi'][pfx]) obj = data['Konsumsi'][pfx];
    if (!obj) return null;
    // Normalisasi ke format webview: {konsumsi, tahun_mulai, faktor, status, tahun_berhenti}
    return {
      konsumsi: obj.konsumsi || obj.status || '',
      tahun_mulai: obj.tahun_mulai || obj.tahun || '',
      faktor: obj.faktor || '',
      status: obj.status_konsumsi || obj.status || '',
      tahun_berhenti: obj.tahun_berhenti || ''
    };
  }
  function loadKonsumsi(pfx, obj) {
    if (!obj) return;
    set('f-' + pfx, obj.konsumsi || '');
    onKonsumsiChange(pfx);
    if (obj.konsumsi === 'Ya') {
      set('f-' + pfx + '-sejak', obj.tahun_mulai || '');
      set('f-' + pfx + '-faktor', obj.faktor || '');
      set('f-' + pfx + '-status', obj.status || '');
      onKonsumsiStatusChange(pfx);
      if (obj.status === 'Berhenti') set('f-' + pfx + '-berhenti', obj.tahun_berhenti || '');
    }
  }
  loadKonsumsi('rokok', _getKonsumsiObj('rokok'));
  loadKonsumsi('miras', _getKonsumsiObj('miras'));
  loadKonsumsi('napza', _getKonsumsiObj('napza'));

  // Pernikahan — webview: 'Jumlah Pernikahan' (string), 'Riwayat Pernikahan' (array)
  //              Tkinter: 'jumlah_pernikahan' (string), 'riwayat_pernikahan' (dict {"1":{...}})
  const jmlPernikahan = data['Jumlah Pernikahan'] || data.jumlah_pernikahan || '';
  if (jmlPernikahan) {
    set('f-jumlah-pernikahan', jmlPernikahan);
    updateMarriageFrames();

    // Normalisasi riwayat pernikahan ke format array webview
    let riwayatNikah = data['Riwayat Pernikahan'];
    if (!riwayatNikah && data.riwayat_pernikahan) {
      const tkRaw = data.riwayat_pernikahan;
      if (Array.isArray(tkRaw)) {
        riwayatNikah = tkRaw.map((r, idx) => {
          const i = idx + 1;
          return {
            [`Nama_Pasangan_${i}`]: r.nama_pasangan || '',
            [`Tempat_Nikah_${i}`]: r.tempat_nikah || '',
            [`Tanggal_Nikah_${i}`]: r.tanggal_nikah || '',
            [`Agama_Nikah_${i}`]: r.agama || '',
            [`Dasar_Nikah_${i}`]: r.atas_dasar || r.dasar || '',
            [`Restu_Ortu_${i}`]: r.restu || '',
            [`Punya_Anak_${i}`]: r.punya_anak || '',
            [`Anak_Laki_${i}`]: r.anak_laki || '0',
            [`Anak_Perempuan_${i}`]: r.anak_perempuan || '0',
            [`Status_Saat_Ini_${i}`]: r.status || '',
            [`Tahun_Meninggal_${i}`]: r.tahun_meninggal || ''
          };
        });
      } else if (typeof tkRaw === 'object') {
        // Format dict Tkinter: {"1":{nama_pasangan,...}, "2":{...}}
        riwayatNikah = Object.keys(tkRaw).sort().map(k => {
          const r = tkRaw[k]; const i = parseInt(k) || 1;
          return {
            [`Nama_Pasangan_${i}`]: r.nama_pasangan || '',
            [`Tempat_Nikah_${i}`]: r.tempat_nikah || '',
            [`Tanggal_Nikah_${i}`]: r.tanggal_nikah || '',
            [`Agama_Nikah_${i}`]: r.agama || '',
            [`Dasar_Nikah_${i}`]: r.atas_dasar || r.dasar || '',
            [`Restu_Ortu_${i}`]: r.restu || '',
            [`Punya_Anak_${i}`]: r.punya_anak || '',
            [`Anak_Laki_${i}`]: r.anak_laki || '0',
            [`Anak_Perempuan_${i}`]: r.anak_perempuan || '0',
            [`Status_Saat_Ini_${i}`]: r.status || '',
            [`Tahun_Meninggal_${i}`]: r.tahun_meninggal || ''
          };
        });
      }
    }

    (riwayatNikah || []).forEach((mrd, idx) => {
      const i = idx + 1;
      set(`mf-${i}-nama-pasangan`, mrd[`Nama_Pasangan_${i}`] || '');
      set(`mf-${i}-tempat-nikah`, mrd[`Tempat_Nikah_${i}`] || '');
      set(`mf-${i}-tanggal-nikah`, mrd[`Tanggal_Nikah_${i}`] || '');
      set(`mf-${i}-agama`, mrd[`Agama_Nikah_${i}`] || '');
      set(`mf-${i}-atas-dasar`, mrd[`Dasar_Nikah_${i}`] || '');
      set(`mf-${i}-restu`, mrd[`Restu_Ortu_${i}`] || '');
      set(`mf-${i}-punya-anak`, mrd[`Punya_Anak_${i}`] || '');
      onMarriageAnakChange(i);
      set(`mf-${i}-anak-laki`, mrd[`Anak_Laki_${i}`] || '');
      set(`mf-${i}-anak-perempuan`, mrd[`Anak_Perempuan_${i}`] || '');
      set(`mf-${i}-status`, mrd[`Status_Saat_Ini_${i}`] || '');
      onMarriageStatusChange(i);
      set(`mf-${i}-tahun-meninggal`, mrd[`Tahun_Meninggal_${i}`] || '');
    });
  }

  updatePendidikanFormalFields();
  updateProgress();
}

/* ── validateTab3() ── */
function validateTab3() {
  const missing = [];
  const pfx = 'Riwayat Hidup > ';
  function chk(id, label) {
    const el = document.getElementById(id);
    if (!el || _isConditionallyHidden(el)) return;
    if (!(el.value || '').trim()) missing.push(pfx + label);
  }
  chk('f-bantuan-persalinan', 'Bantuan Persalinan');
  chk('f-kondisi-persalinan', 'Kondisi Persalinan');
  chk('f-anak-ke', 'Anak Ke');
  chk('f-jumlah-saudara', 'Jumlah Saudara');
  chk('f-pertumbuhan', 'Riwayat Pertumbuhan Fisik');
  chk('f-psikososial', 'Status Psikososial');
  chk('f-pendidikan-keluarga', 'Pendidikan dalam Keluarga');
  chk('f-nonformal', 'Pendidikan Nonformal');
  chk('f-bakat-punya', 'Bakat dan Potensi');
  chk('f-ketaatan', 'Ketaatan Beragama');
  chk('f-pelanggaran', 'Riwayat Pelanggaran Hukum');
  chk('f-rokok', 'Konsumsi Rokok');
  chk('f-miras', 'Konsumsi Minuman Keras');
  chk('f-napza', 'Konsumsi Narkotika');
  // Pernikahan
  if (!_isConditionallyHidden(document.getElementById('acc-3-3'))) {
    chk('f-jumlah-pernikahan', 'Jumlah Pernikahan');
  }
  // Konflik relasi
  const warn = document.getElementById('relasi-conflict-warn');
  if (warn && warn.style.display !== 'none') missing.push(pfx + 'Relasi Sosial (ada konflik)');
  return missing;
}

/* ═══════════════════════════════════════════════
   BAB IV — KONDISI PENJAMIN
   Sesuai integrasi.py baris 16491–16904
═══════════════════════════════════════════════ */

function syncJKPenjaminFromTab2() {
  const penjamin = (document.getElementById('f-penjamin')?.value || '').trim();
  const jkEl = document.getElementById('f4-jk-penjamin');
  const noteEl = document.getElementById('f4-jk-sync-note');
  if (!jkEl) return;

  // Peta penjamin → jenis kelamin (berdasarkan hubungan dengan klien)
  const map = {
    'Ayah': 'Laki-laki',
    'Ibu': 'Perempuan',
    'Suami': 'Laki-laki',   // klien perempuan, suaminya laki-laki
    'Istri': 'Perempuan'    // klien laki-laki, istrinya perempuan
  };
  if (map[penjamin]) {
    jkEl.value = map[penjamin];
    jkEl.disabled = true;
    jkEl.style.opacity = '0.7';
    if (noteEl) noteEl.style.display = '';
  } else {
    // Lainnya atau belum dipilih — biarkan manual
    if (jkEl.disabled) {
      jkEl.disabled = false;
      jkEl.style.opacity = '';
    }
    if (noteEl) noteEl.style.display = 'none';
  }
  updateProgress();
}

/* ── Status Pernikahan Penjamin → show/hide marriage block ── */
function onStatusPenjaminChange() {
  const val = document.getElementById('f4-status-penjamin')?.value || '';
  const cond = document.getElementById('cond-penjamin-menikah');
  if (cond) cond.style.display = (val === 'Menikah') ? '' : 'none';
  if (val !== 'Menikah') {
    const el = document.getElementById('f4-jumlah-pernikahan-penjamin');
    if (el) el.value = '';
    const frames = document.getElementById('penjamin-marriage-frames');
    if (frames) frames.innerHTML = '';
  }
  _ACC_REQ_CACHE.delete('acc-4-0');
  updateProgress();
}

/* ── Build penjamin marriage frame (mirip _buildMarriageFrame Tab III) ── */
function _buildPenjaminMarriageFrame(n) {
  return `<div class="marriage-block" id="pmf-block-${n}">
    <div class="marriage-block-title">Pernikahan Penjamin ke-${n}</div>
    <div class="fgrid">
      <div class="flbl req">Nama Pasangan</div>
      <input class="finp" id="pmf-${n}-nama" type="text" spellcheck="false">
      <div class="flbl req">Tempat Nikah</div>
      <input class="finp w-md" id="pmf-${n}-tempat" type="text" spellcheck="false">
      <div class="flbl req">Tanggal Nikah</div>
      <input class="finp w-md dp-input" id="pmf-${n}-tanggal" type="text" placeholder="dd/mm/yyyy" autocomplete="off" spellcheck="false">
      <div class="flbl req">Secara Agama</div>
      <select class="fsel w-md" id="pmf-${n}-agama">
        <option value="">— Pilih —</option>
        <option>Islam</option><option>Kristen</option><option>Katolik</option>
        <option>Hindu</option><option>Buddha</option><option>Konghucu</option>
      </select>
      <div class="flbl req">Atas Dasar</div>
      <input class="finp w-md" id="pmf-${n}-atas-dasar" type="text" spellcheck="false">
      <div class="flbl req">Mendapat Restu Orang Tua?</div>
      <select class="fsel w-sm" id="pmf-${n}-restu">
        <option value="">— Pilih —</option><option>Ya</option><option>Tidak</option>
      </select>
      <div class="flbl req">Punya Anak?</div>
      <select class="fsel w-sm" id="pmf-${n}-punya-anak" onchange="onPMFAnakChange(${n})">
        <option value="">— Pilih —</option><option>Ya</option><option>Tidak</option>
      </select>
      <div class="flbl" id="pmf-${n}-lbl-laki" style="display:none">Jumlah Anak Laki-laki</div>
      <input class="finp w-sm" id="pmf-${n}-anak-laki" type="text" style="display:none" spellcheck="false">
      <div class="flbl" id="pmf-${n}-lbl-perempuan" style="display:none">Jumlah Anak Perempuan</div>
      <input class="finp w-sm" id="pmf-${n}-anak-perempuan" type="text" style="display:none" spellcheck="false">
      <div class="flbl req">Status Saat Ini</div>
      <select class="fsel w-md" id="pmf-${n}-status" onchange="onPMFStatusChange(${n})">
        <option value="">— Pilih —</option>
        <option>Masih Bersama</option><option>Berpisah</option><option>Meninggal Dunia</option>
      </select>
      <div class="flbl" id="pmf-${n}-lbl-meninggal" style="display:none">Tahun Meninggal</div>
      <input class="finp w-sm" id="pmf-${n}-tahun-meninggal" type="text" style="display:none" spellcheck="false">
    </div>
  </div>`;
}

function onPMFAnakChange(n) {
  const on = document.getElementById('pmf-' + n + '-punya-anak')?.value === 'Ya';
  ['laki', 'perempuan'].forEach(k => {
    const lbl = document.getElementById('pmf-' + n + '-lbl-' + k);
    const inp = document.getElementById('pmf-' + n + '-anak-' + k);
    if (lbl) lbl.style.display = on ? '' : 'none';
    if (inp) { inp.style.display = on ? '' : 'none'; if (!on) inp.value = ''; }
  });
  updateProgress();
}

function onPMFStatusChange(n) {
  const on = document.getElementById('pmf-' + n + '-status')?.value === 'Meninggal Dunia';
  const lbl = document.getElementById('pmf-' + n + '-lbl-meninggal');
  const inp = document.getElementById('pmf-' + n + '-tahun-meninggal');
  if (lbl) lbl.style.display = on ? '' : 'none';
  if (inp) { inp.style.display = on ? '' : 'none'; if (!on) inp.value = ''; }
  updateProgress();
}

function updatePenjaminMarriageFrames() {
  const marriageEntries = window.MarriageEntries && window.MarriageEntries.byKey && window.MarriageEntries.byKey('IP');
  if (marriageEntries && typeof marriageEntries.addEntry === 'function' && typeof marriageEntries.removeEntry === 'function') {
    const target = parseInt(document.getElementById('f4-jumlah-pernikahan-penjamin')?.value || '0') || 0;
    let current = typeof marriageEntries.count === 'function' ? marriageEntries.count() : 0;
    while (current < target) current = marriageEntries.addEntry();
    while (current > target) current = marriageEntries.removeEntry(current);
    if (typeof marriageEntries.rebuild === 'function') marriageEntries.rebuild();
    _ACC_REQ_CACHE.delete('acc-4-0');
    updateProgress();
    return;
  }
  const cnt = parseInt(document.getElementById('f4-jumlah-pernikahan-penjamin')?.value || '0') || 0;
  const container = document.getElementById('penjamin-marriage-frames');
  if (!container) return;
  // Simpan nilai yang ada sebelum rebuild
  const existing = {};
  container.querySelectorAll('[id^="pmf-"]').forEach(el => {
    existing[el.id] = el.type === 'checkbox' ? el.checked : (el.value || '');
  });
  container.innerHTML = '';
  for (let i = 1; i <= cnt; i++) {
    container.insertAdjacentHTML('beforeend', _buildPenjaminMarriageFrame(i));
  }
  // Restore nilai
  Object.entries(existing).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = val;
    else el.value = val;
  });
  // Run toggles
  for (let i = 1; i <= cnt; i++) {
    onPMFAnakChange(i);
    onPMFStatusChange(i);
  }
  _ACC_REQ_CACHE.delete('acc-4-0');
  updateProgress();
}

function onPekerjaanPenjaminChange() {
  const val = document.getElementById('f4-status-pekerjaan')?.value || '';
  document.getElementById('cond-pekerjaan-bekerja').style.display = (val === 'Bekerja') ? '' : 'none';
  document.getElementById('cond-pekerjaan-tidak').style.display = (val === 'Tidak Bekerja') ? '' : 'none';
  // Clear fields yang tidak aktif
  if (val !== 'Bekerja') {
    ['f4-pekerjaan', 'f4-penghasilan-tetap', 'f4-nominal-penghasilan'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
  }
  if (val !== 'Tidak Bekerja') {
    ['f4-pemberi-nafkah', 'f4-pekerjaan-pemberi', 'f4-penghasilan-tetap-pemberi', 'f4-nominal-pemberi'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
  }
  _ACC_REQ_CACHE.delete('acc-4-3');
  updateProgress();
}

/* ── Radio pill → hidden input sync ── */
function syncRadioToHidden(rgId, hiddenId) {
  const rg = document.getElementById(rgId);
  const hidEl = document.getElementById(hiddenId);
  if (!rg || !hidEl) return;
  const checked = rg.querySelector('input[type=radio]:checked');
  hidEl.value = checked ? checked.value : '';
  // Update visual pill state
  rg.querySelectorAll('.radio-pill').forEach(pill => {
    const inp = pill.querySelector('input[type=radio]');
    if (inp) pill.classList.toggle('checked', inp.checked);
  });
  updateProgress();
}

function setRadioGroup(rgId, hiddenId, val) {
  const rg = document.getElementById(rgId);
  const hidEl = document.getElementById(hiddenId);
  if (!rg) return;
  rg.querySelectorAll('input[type=radio]').forEach(r => {
    r.checked = (r.value === val);
  });
  if (hidEl) hidEl.value = val || '';
  rg.querySelectorAll('.radio-pill').forEach(pill => {
    const inp = pill.querySelector('input[type=radio]');
    if (inp) pill.classList.toggle('checked', inp.checked);
  });
}


/* ══════════════════════════════════════════
   TAB IV — KONDISI PENJAMIN
══════════════════════════════════════════ */
function collectTab4() {
  function v(id) { return (document.getElementById(id)?.value || '').trim(); }
  function cb(id) { return document.getElementById(id)?.checked || false; }

  const statusNikah = v('f4-status-penjamin');
  const cnt = statusNikah === 'Menikah' ? parseInt(v('f4-jumlah-pernikahan-penjamin') || '0') || 0 : 0;
  const riwayatNikahPenjamin = {};
  for (let i = 1; i <= cnt; i++) {
    riwayatNikahPenjamin[String(i)] = {
      Nama_Pasangan_Penjamin: v('pmf-' + i + '-nama'),
      Tempat_Nikah_Penjamin: v('pmf-' + i + '-tempat'),
      Tanggal_Nikah_Penjamin: v('pmf-' + i + '-tanggal'),
      Agama_Nikah_Penjamin: v('pmf-' + i + '-agama'),
      Dasar_Nikah_Penjamin: v('pmf-' + i + '-atas-dasar'),
      Restu_Ortu_Penjamin: v('pmf-' + i + '-restu'),
      Punya_Anak_Penjamin: v('pmf-' + i + '-punya-anak'),
      Anak_Laki_Penjamin: v('pmf-' + i + '-anak-laki') || '0',
      Anak_Perempuan_Penjamin: v('pmf-' + i + '-anak-perempuan') || '0',
      Status_Saat_Ini_Penjamin: v('pmf-' + i + '-status'),
      Tahun_Meninggal_Penjamin: v('pmf-' + i + '-tahun-meninggal') || ''
    };
  }

  const stKerja = v('f4-status-pekerjaan');
  const detailPekerjaan = stKerja === 'Bekerja' ? {
    bekerja: {
      jenis_pekerjaan: v('f4-pekerjaan'),
      penghasilan_tetap: v('f4-penghasilan-tetap'),
      nominal_penghasilan: v('f4-nominal-penghasilan')
    }
  } : {
    tidak_bekerja: {
      pemberi_nafkah: v('f4-pemberi-nafkah'),
      pekerjaan_pemberi: v('f4-pekerjaan-pemberi'),
      penghasilan_tetap: v('f4-penghasilan-tetap-pemberi'),
      nominal_penghasilan: v('f4-nominal-pemberi')
    }
  };

  const ruangan = {
    'Ruang Tamu': cb('f4-r-ruang-tamu'), 'Ruang Keluarga': cb('f4-r-ruang-keluarga'),
    'Ruang Ibadah': cb('f4-r-ruang-ibadah'), 'Kamar Tidur': cb('f4-r-kamar-tidur'),
    'Dapur': cb('f4-r-dapur'), 'Kamar Mandi': cb('f4-r-kamar-mandi'),
    'Gudang': cb('f4-r-gudang'), 'Garasi': cb('f4-r-garasi')
  };
  const perabotan = {
    'Televisi': cb('f4-p-televisi'), 'Kulkas': cb('f4-p-kulkas'), 'Komputer': cb('f4-p-komputer'),
    'Pemutar Media': cb('f4-p-pemutar-media'), 'Kipas Angin': cb('f4-p-kipas-angin'),
    'Pendingin Ruangan': cb('f4-p-pendingin'), 'Mesin Air': cb('f4-p-mesin-air'),
    'Pemanas Air': cb('f4-p-pemanas-air'), 'Pemurni Udara': cb('f4-p-pemurni-udara'),
    'Penggoreng Kering': cb('f4-p-airfryer'), 'Mesin Cuci': cb('f4-p-mesin-cuci'),
    'Meja': cb('f4-p-meja'), 'Tempat Tidur': cb('f4-p-tempat-tidur'), 'Sofa': cb('f4-p-sofa'),
    'Meja Makan': cb('f4-p-meja-makan'), 'Kompor Gas': cb('f4-p-kompor-gas'),
    'Kompor Minyak': cb('f4-p-kompor-minyak'), 'Panci': cb('f4-p-panci'), 'Wajan': cb('f4-p-wajan'),
    'Penanak Nasi': cb('f4-p-penanak-nasi'), 'Wastafel': cb('f4-p-wastafel'),
    'Lemari': cb('f4-p-lemari'), 'Rak TV': cb('f4-p-rak-tv'), 'Dispenser Air': cb('f4-p-dispenser-air')
  };

  return {
    jenis_kelamin_penjamin: v('f4-jk-penjamin'),
    status_pernikahan_penjamin: statusNikah,
    jumlah_pernikahan_penjamin: statusNikah === 'Menikah' ? v('f4-jumlah-pernikahan-penjamin') : '',
    riwayat_pernikahan_penjamin: riwayatNikahPenjamin,
    relasi_keluarga: v('f4-relasi-keluarga'),
    frekuensi_kunjungan: v('f4-kunjungan'),
    frekuensi_komunikasi: v('f4-komunikasi'),
    dikenal_masyarakat: v('f4-dikenal-masyarakat'),
    ikut_kegiatan_masyarakat: v('f4-ikut-kegiatan'),
    hadiri_undangan: v('f4-hadiri-undangan'),
    status_pekerjaan: stKerja,
    detail_pekerjaan: detailPekerjaan,
    rumah_penjamin: {
      status_kepemilikan: v('f4-kepemilikan'),
      jenis_bangunan: v('f4-bangunan'),
      jumlah_tingkat: v('f4-tingkat'),
      luas_rumah: v('f4-luas'),
      jenis_lantai: v('f4-lantai'),
      kondisi: v('f4-kondisi-rumah'),
      ruangan: ruangan,
      perabotan: perabotan,
      daya_listrik: v('f4-daya-listrik'),
      sumber_air: v('f4-sumber-air')
    }
  };
}

function loadTab4(data) {
  if (!data) return;
  function set(id, val) { const el = document.getElementById(id); if (!el || val == null) return; el.value = String(val); }
  function setCb(id, val) { const el = document.getElementById(id); if (el) el.checked = !!val; }

  set('f4-jk-penjamin', data.jenis_kelamin_penjamin || '');
  set('f4-status-penjamin', data.status_pernikahan_penjamin || '');
  onStatusPenjaminChange();

  if (data.status_pernikahan_penjamin === 'Menikah') {
    set('f4-jumlah-pernikahan-penjamin', data.jumlah_pernikahan_penjamin || '');
    updatePenjaminMarriageFrames();
    const riw = data.riwayat_pernikahan_penjamin || {};
    Object.entries(riw).forEach(([key, r]) => {
      const i = parseInt(key);
      if (!i) return;
      set('pmf-' + i + '-nama', r.Nama_Pasangan_Penjamin || '');
      set('pmf-' + i + '-tempat', r.Tempat_Nikah_Penjamin || '');
      set('pmf-' + i + '-tanggal', r.Tanggal_Nikah_Penjamin || '');
      set('pmf-' + i + '-agama', r.Agama_Nikah_Penjamin || '');
      set('pmf-' + i + '-atas-dasar', r.Dasar_Nikah_Penjamin || '');
      set('pmf-' + i + '-restu', r.Restu_Ortu_Penjamin || '');
      set('pmf-' + i + '-punya-anak', r.Punya_Anak_Penjamin || ''); onPMFAnakChange(i);
      set('pmf-' + i + '-anak-laki', r.Anak_Laki_Penjamin || '');
      set('pmf-' + i + '-anak-perempuan', r.Anak_Perempuan_Penjamin || '');
      set('pmf-' + i + '-status', r.Status_Saat_Ini_Penjamin || ''); onPMFStatusChange(i);
      set('pmf-' + i + '-tahun-meninggal', r.Tahun_Meninggal_Penjamin || '');
    });
  }

  set('f4-relasi-keluarga', data.relasi_keluarga || '');
  setRadioGroup('rg-kunjungan', 'f4-kunjungan', data.frekuensi_kunjungan || '');
  setRadioGroup('rg-komunikasi', 'f4-komunikasi', data.frekuensi_komunikasi || '');
  set('f4-dikenal-masyarakat', data.dikenal_masyarakat || '');
  set('f4-ikut-kegiatan', data.ikut_kegiatan_masyarakat || '');
  set('f4-hadiri-undangan', data.hadiri_undangan || '');

  set('f4-status-pekerjaan', data.status_pekerjaan || '');
  onPekerjaanPenjaminChange();
  const dp = data.detail_pekerjaan || {};
  const bk = dp.bekerja || {};
  const tb = dp.tidak_bekerja || {};
  set('f4-pekerjaan', bk.jenis_pekerjaan || '');
  set('f4-penghasilan-tetap', bk.penghasilan_tetap || '');
  set('f4-nominal-penghasilan', bk.nominal_penghasilan || '');
  set('f4-pemberi-nafkah', tb.pemberi_nafkah || '');
  set('f4-pekerjaan-pemberi', tb.pekerjaan_pemberi || '');
  set('f4-penghasilan-tetap-pemberi', tb.penghasilan_tetap || '');
  set('f4-nominal-pemberi', tb.nominal_penghasilan || '');

  const rh = data.rumah_penjamin || {};
  set('f4-kepemilikan', rh.status_kepemilikan || '');
  set('f4-bangunan', rh.jenis_bangunan || '');
  set('f4-tingkat', rh.jumlah_tingkat || '');
  set('f4-luas', rh.luas_rumah || '');
  set('f4-lantai', rh.jenis_lantai || '');
  set('f4-kondisi-rumah', rh.kondisi || '');
  set('f4-daya-listrik', rh.daya_listrik || '');
  set('f4-sumber-air', rh.sumber_air || '');

  const ru = rh.ruangan || {};
  const pe = rh.perabotan || {};
  const ruMap = {
    'Ruang Tamu': 'f4-r-ruang-tamu', 'Ruang Keluarga': 'f4-r-ruang-keluarga',
    'Ruang Ibadah': 'f4-r-ruang-ibadah', 'Kamar Tidur': 'f4-r-kamar-tidur',
    'Dapur': 'f4-r-dapur', 'Kamar Mandi': 'f4-r-kamar-mandi', 'Gudang': 'f4-r-gudang', 'Garasi': 'f4-r-garasi'
  };
  const peMap = {
    'Televisi': 'f4-p-televisi', 'Kulkas': 'f4-p-kulkas', 'Komputer': 'f4-p-komputer',
    'Pemutar Media': 'f4-p-pemutar-media', 'Kipas Angin': 'f4-p-kipas-angin',
    'Pendingin Ruangan': 'f4-p-pendingin', 'Mesin Air': 'f4-p-mesin-air', 'Pemanas Air': 'f4-p-pemanas-air',
    'Pemurni Udara': 'f4-p-pemurni-udara', 'Penggoreng Kering': 'f4-p-airfryer',
    'Mesin Cuci': 'f4-p-mesin-cuci', 'Meja': 'f4-p-meja', 'Tempat Tidur': 'f4-p-tempat-tidur',
    'Sofa': 'f4-p-sofa', 'Meja Makan': 'f4-p-meja-makan', 'Kompor Gas': 'f4-p-kompor-gas',
    'Kompor Minyak': 'f4-p-kompor-minyak', 'Panci': 'f4-p-panci', 'Wajan': 'f4-p-wajan',
    'Penanak Nasi': 'f4-p-penanak-nasi', 'Wastafel': 'f4-p-wastafel',
    'Lemari': 'f4-p-lemari', 'Rak TV': 'f4-p-rak-tv', 'Dispenser Air': 'f4-p-dispenser-air'
  };
  Object.entries(ruMap).forEach(([k, id]) => setCb(id, ru[k] || false));
  Object.entries(peMap).forEach(([k, id]) => setCb(id, pe[k] || false));

  syncJKPenjaminFromTab2(); // re-apply sync constraint
  updateProgress();
}

function validateTab4() {
  const missing = [];
  const pfx = 'Kondisi Penjamin > ';
  function chk(id, label) {
    const el = document.getElementById(id);
    if (!el || _isConditionallyHidden(el)) return;
    if (!(el.value || '').trim()) missing.push(pfx + label);
  }
  chk('f4-jk-penjamin', 'Jenis Kelamin Penjamin');
  chk('f4-status-penjamin', 'Status Pernikahan Penjamin');
  if ((document.getElementById('f4-status-penjamin')?.value || '') === 'Menikah') {
    chk('f4-jumlah-pernikahan-penjamin', 'Jumlah Pernikahan Penjamin');
    const cnt = parseInt(document.getElementById('f4-jumlah-pernikahan-penjamin')?.value || '0') || 0;
    for (let i = 1; i <= cnt; i++) {
      chk('pmf-' + i + '-nama', `Pernikahan Penjamin Ke-${i} > Nama Pasangan`);
      chk('pmf-' + i + '-tempat', `Pernikahan Penjamin Ke-${i} > Tempat Nikah`);
      chk('pmf-' + i + '-tanggal', `Pernikahan Penjamin Ke-${i} > Tanggal Nikah`);
      chk('pmf-' + i + '-agama', `Pernikahan Penjamin Ke-${i} > Agama`);
      chk('pmf-' + i + '-restu', `Pernikahan Penjamin Ke-${i} > Restu`);
      chk('pmf-' + i + '-punya-anak', `Pernikahan Penjamin Ke-${i} > Punya Anak`);
      chk('pmf-' + i + '-status', `Pernikahan Penjamin Ke-${i} > Status Saat Ini`);
    }
  }
  chk('f4-relasi-keluarga', 'Relasi Sosial dalam Keluarga');
  chk('f4-kunjungan', 'Frekuensi Kunjungan');
  chk('f4-komunikasi', 'Frekuensi Komunikasi');
  chk('f4-dikenal-masyarakat', 'Dikenal Masyarakat');
  chk('f4-ikut-kegiatan', 'Ikut Kegiatan Masyarakat');
  chk('f4-hadiri-undangan', 'Hadiri Undangan Tetangga');
  chk('f4-status-pekerjaan', 'Status Pekerjaan Penjamin');
  const stKerja = document.getElementById('f4-status-pekerjaan')?.value || '';
  if (stKerja === 'Bekerja') {
    chk('f4-pekerjaan', 'Pekerjaan > Jenis Pekerjaan');
    chk('f4-penghasilan-tetap', 'Pekerjaan > Status Penghasilan');
    chk('f4-nominal-penghasilan', 'Pekerjaan > Nominal Penghasilan');
  } else if (stKerja === 'Tidak Bekerja') {
    chk('f4-pemberi-nafkah', 'Nafkah > Pemberi Nafkah');
    chk('f4-pekerjaan-pemberi', 'Nafkah > Pekerjaan Pemberi');
    chk('f4-penghasilan-tetap-pemberi', 'Nafkah > Status Penghasilan Pemberi');
    chk('f4-nominal-pemberi', 'Nafkah > Nominal Penghasilan Pemberi');
  }
  // Rumah
  chk('f4-kepemilikan', 'Rumah > Status Kepemilikan');
  chk('f4-bangunan', 'Rumah > Jenis Bangunan');
  chk('f4-tingkat', 'Rumah > Jumlah Tingkat');
  chk('f4-luas', 'Rumah > Luas Rumah');
  chk('f4-lantai', 'Rumah > Jenis Lantai');
  chk('f4-kondisi-rumah', 'Rumah > Kondisi');
  const anyRuangan = document.querySelectorAll('#cbx-ruangan input:checked').length > 0;
  if (!anyRuangan) missing.push(pfx + 'Rumah > Ruangan (pilih minimal satu)');
  const anyPerabotan = document.querySelectorAll('#cbx-perabotan input:checked').length > 0;
  if (!anyPerabotan) missing.push(pfx + 'Rumah > Perabotan (pilih minimal satu)');
  chk('f4-daya-listrik', 'Rumah > Daya Listrik');
  chk('f4-sumber-air', 'Rumah > Sumber Air');
  return missing;
}

/* ── Hook: sinkron jenis kelamin penjamin saat f-penjamin berubah ── */
(function () {
  setTimeout(() => {
    const pEl = document.getElementById('f-penjamin');
    if (pEl) {
      pEl.addEventListener('change', syncJKPenjaminFromTab2);
      pEl.addEventListener('input', syncJKPenjaminFromTab2);
    }
    syncJKPenjaminFromTab2(); // initial sync
  }, 300);
})();

/* ═══ END BAB IV ═══ */
/* ══════════════════════════════════════════
   SHARED FORM UTILITIES
   (Tag-list engine — digunakan lintas BAB)
══════════════════════════════════════════ */
/* ── Tag-list engine ── */
const _tlData = {};
function tlAdd(key) {
  const inp = document.getElementById('inp-' + key);
  if (!inp) return;
  const val = inp.value.trim();
  if (!val) return;
  if (!_tlData[key]) _tlData[key] = [];
  if (_tlData[key].includes(val)) { inp.value = ''; return; }
  _tlData[key].push(val);
  inp.value = '';
  tlRender(key);
}
function tlRemove(key, val) {
  if (!_tlData[key]) return;
  _tlData[key] = _tlData[key].filter(t => t !== val);
  tlRender(key);
}
function tlRender(key) {
  const wrap = document.getElementById('tags-' + key);
  if (!wrap) return;
  const arr = _tlData[key] || [];
  if (!arr.length) {
    wrap.innerHTML = '<span class="tl-empty">Belum ada item ditambahkan</span>';
  } else {
    wrap.innerHTML = arr.map(v => `<span class="tl-tag">${v.replace(/</g, '&lt;')}<button onclick="tlRemove('${key}','${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')">\u00d7</button></span>`).join('');
  }
  /* update hidden proxy for progress tracking */
  const keyMap = { pmaj: 'f5-pmaj-check', pmin: 'f5-pmin-check', smaj: 'f5-smaj-check', smin: 'f5-smin-check' };
  const hid = document.getElementById(keyMap[key]);
  if (hid) hid.value = arr.length ? '1' : '';
  updateProgress();
}

/* ══════════════════════════════════════════
   BAB V & VI JS
══════════════════════════════════════════ */

/* ── Sync pemberi-keterangan checkboxes → hidden proxy ── */
function syncPemberiCheck() {
  const any = ['f5-pemberi-klien', 'f5-pemberi-keluarga', 'f5-pemberi-kades', 'f5-pemberi-rt', 'f5-pemberi-lurah']
    .some(id => document.getElementById(id) && document.getElementById(id).checked);
  const hid = document.getElementById('f5-pemberi-check');
  if (hid) hid.value = any ? '1' : '';
  updateProgress();
}
document.addEventListener('change', e => {
  if (e.target && e.target.id && e.target.id.startsWith('f5-pemberi-')) syncPemberiCheck();
});

/* ── Homogen/Heterogen toggle ── */
function onToggleHomogen(val) {
  const cond = document.getElementById('cond-suku-minoritas');
  if (cond) cond.style.display = (val === 'Heterogen') ? 'grid' : 'none';
  updateProgress();
}

(function installStopperLoading() {
  if (window.LStopperLoading) return;
  const css = `
        .lstop-ov{position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.76);backdrop-filter:blur(9px);cursor:default}
        .lstop-ov.open{display:flex}
        .lstop-box{width:min(380px,92vw);display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;color:#f8fafc}
        .lstop-logo{width:132px;max-width:48vw;transform-origin:center;will-change:transform,filter,opacity;filter:drop-shadow(0 14px 32px rgba(0,0,0,.55));animation:lstop-logo-breathe 2.6s cubic-bezier(.4,0,.2,1) infinite}
        .lstop-fallback{display:none;font-size:28px;font-weight:900;letter-spacing:.08em;color:rgb(var(--ac,93,224,133));text-shadow:0 0 18px rgba(var(--ac,93,224,133),.28);animation:lstop-logo-breathe 2.6s cubic-bezier(.4,0,.2,1) infinite}
        .lstop-ring{width:68px;height:68px;position:relative}
        .lstop-ring svg{width:68px;height:68px;transform:rotate(-90deg)}
        .lstop-ring-bg{stroke:rgba(255,255,255,.18);fill:none;stroke-width:5}
        .lstop-ring-fg{stroke:rgb(var(--ac,93,224,133));fill:none;stroke-width:5;stroke-linecap:round;stroke-dasharray:138.23;stroke-dashoffset:138.23;transition:stroke-dashoffset .55s cubic-bezier(.4,0,.2,1),stroke .25s ease;filter:drop-shadow(0 0 8px rgba(var(--ac,93,224,133),.35))}
        .lstop-ring.done .lstop-ring-fg{stroke:#5de085}
        .lstop-pct{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;letter-spacing:.02em;color:rgba(255,255,255,.86)}
        .lstop-title{font-size:13px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:rgb(var(--ac,93,224,133));animation:lstop-title-pulse 2.6s ease-in-out infinite}
        .lstop-msg{font-size:15px;font-weight:800;line-height:1.35}
        .lstop-detail{font-size:12px;line-height:1.45;color:rgba(255,255,255,.68);max-width:320px}
        .lstop-dots{display:flex;gap:5px}
        .lstop-dots span{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.55);animation:lstop-dot 1.2s ease-in-out infinite}
        .lstop-dots span:nth-child(2){animation-delay:.16s}.lstop-dots span:nth-child(3){animation-delay:.32s}
        @keyframes lstop-logo-breathe{0%,100%{opacity:.9;transform:translateY(0) scale(.985);filter:drop-shadow(0 14px 32px rgba(0,0,0,.55)) drop-shadow(0 0 0 rgba(var(--ac,93,224,133),0))}45%{opacity:1;transform:translateY(-3px) scale(1.045);filter:drop-shadow(0 18px 38px rgba(0,0,0,.58)) drop-shadow(0 0 24px rgba(var(--ac,93,224,133),.5))}70%{opacity:.96;transform:translateY(-1px) scale(1.01);filter:drop-shadow(0 15px 34px rgba(0,0,0,.55)) drop-shadow(0 0 10px rgba(var(--ac,93,224,133),.24))}}
        @keyframes lstop-title-pulse{0%,100%{opacity:.82;text-shadow:0 0 0 rgba(var(--ac,93,224,133),0)}45%{opacity:1;text-shadow:0 0 16px rgba(var(--ac,93,224,133),.42)}}
        @keyframes lstop-dot{0%,80%,100%{opacity:.28;transform:translateY(0)}40%{opacity:1;transform:translateY(-4px)}}
      `;
  const style = document.createElement('style');
  style.id = 'lstop-style';
  style.textContent = css;
  document.head.appendChild(style);

  const RING_DASH = 138.23;
  let timer = null;
  let steps = [];
  let stepIdx = 0;
  let currentProgress = 0;

  function ensure() {
    let ov = document.getElementById('libero-stopper-loading');
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
    const logo = ov.querySelector('.lstop-logo');
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
    const title = document.getElementById('lstop-title');
    const msg = document.getElementById('lstop-msg');
    const detail = document.getElementById('lstop-detail');
    if (title && opts.title) title.textContent = opts.title;
    if (msg && opts.message) msg.textContent = opts.message;
    if (detail) detail.textContent = opts.detail || '';
  }

  function clampProgress(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return currentProgress;
    return Math.max(0, Math.min(100, n));
  }

  function progressForStep(idx, total) {
    if (!total || total < 2) return 18;
    return Math.min(92, Math.round(12 + (idx / (total - 1)) * 78));
  }

  function setProgress(value) {
    currentProgress = clampProgress(value);
    const fg = document.querySelector('#libero-stopper-loading .lstop-ring-fg');
    const pct = document.getElementById('lstop-pct');
    if (fg) {
      fg.style.strokeDasharray = String(RING_DASH);
      fg.style.strokeDashoffset = String(RING_DASH * (1 - currentProgress / 100));
    }
    if (pct) pct.textContent = Math.round(currentProgress) + '%';
  }

  window.LStopperLoading = {
    show: function (opts) {
      opts = opts || {};
      const ov = ensure();
      const ring = ov.querySelector('.lstop-ring');
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
      const ov = ensure();
      const ring = ov.querySelector('.lstop-ring');
      if (ring) ring.classList.add('done');
      setProgress(100);
      if (message) this.update({ message: message });
      this.hide(650);
    },
    hide: function (delay) {
      if (timer) { clearInterval(timer); timer = null; }
      const ov = document.getElementById('libero-stopper-loading');
      if (!ov) return;
      setTimeout(function () { ov.classList.remove('open'); }, delay || 0);
    }
  };
})();

function _pickAlamatLingkungan() {
  const val = id => (document.getElementById(id)?.value || '').trim();
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
  const tipe = norm(val('f-penjamin'));
  const map = {
    'Ayah': val('f-alamat-ayah'),
    'Ibu': val('f-alamat-ibu'),
    'Suami': val('f-alamat-suami'),
    'Istri': val('f-alamat-istri'),
    'Lainnya': val('f-alamat-penjamin')
  };
  return norm(map[tipe] || val('f-alamat-penjamin') || val('f-alamat') || val('f-alamat-ayah') || val('f-alamat-ibu'));
}

async function _ensureWilayahSourceTabsMounted() {
  try {
    if (typeof window.__LIBERO_LAZY_PREPARE_ALL === 'function') {
      await window.__LIBERO_LAZY_PREPARE_ALL(120000);
    } else if (typeof window.__LIBERO_LAZY_MOUNT_ALL === 'function') {
      window.__LIBERO_LAZY_MOUNT_ALL();
    }
  } catch (_e) { }
}

function _wilayahFields() {
  return [
    { key: 'pekerjaan_mayoritas', label: 'Pekerjaan Mayoritas', type: 'tags', target: 'pmaj' },
    { key: 'pekerjaan_minoritas', label: 'Pekerjaan Minoritas', type: 'tags', target: 'pmin' },
    { key: 'stratifikasi_ekonomi', label: 'Stratifikasi Sosial Ekonomi', type: 'select', target: 'f5-ekonomi' },
    { key: 'pendidikan_mayoritas', label: 'Pendidikan Mayoritas Warga', type: 'select', target: 'f5-pendidikan-mayoritas' },
    { key: 'pendidikan_minoritas', label: 'Pendidikan Minoritas Warga', type: 'select', target: 'f5-pendidikan-minoritas' },
    { key: 'agama_mayoritas', label: 'Agama Mayoritas', type: 'select', target: 'f5-agama-mayoritas' },
    { key: 'tipe_masyarakat', label: 'Komposisi Masyarakat', type: 'select', target: 'f5-homogen' },
    { key: 'suku_mayoritas', label: 'Suku Mayoritas', type: 'tags', target: 'smaj' },
    { key: 'suku_minoritas', label: 'Suku Minoritas', type: 'tags', target: 'smin' },
    { key: 'relasi_sosial', label: 'Relasi Sosial Antar Masyarakat', type: 'select', target: 'f5-relasi-sosial', sensitive: true },
    { key: 'kepedulian_masyarakat', label: 'Kepedulian Kehidupan Masyarakat', type: 'select', target: 'f5-kepedulian-masyarakat', sensitive: true },
    { key: 'kepedulian_pendidikan', label: 'Kepedulian Pendidikan', type: 'select', target: 'f5-kepedulian-pendidikan', sensitive: true },
    { key: 'kepedulian_keagamaan', label: 'Kepedulian Keagamaan', type: 'select', target: 'f5-kepedulian-keagamaan', sensitive: true },
    { key: 'kepedulian_hukum', label: 'Kepedulian Penegakan Hukum', type: 'select', target: 'f5-kepedulian-hukum', sensitive: true }
  ];
}

function _wilayahEsc(value) {
  return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _wilayahValueText(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  return String(value || '');
}

function _ensureWilayahModal() {
  let overlay = document.getElementById('wilayah-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'wilayah-overlay';
  overlay.className = 'wilayah-overlay';
  overlay.innerHTML =
    '<div class="wilayah-modal">' +
    '<div class="wilayah-modal-hdr"><div class="wilayah-modal-title">Data Wilayah</div><button type="button" class="wilayah-btn" onclick="closeWilayahModal()">Tutup</button></div>' +
    '<div class="wilayah-modal-body" id="wilayah-modal-body"></div>' +
    '<div class="wilayah-modal-ftr"><button type="button" class="wilayah-btn" onclick="closeWilayahModal()">Batal</button><button type="button" class="wilayah-btn primary" onclick="terapkanDataWilayah()">Terapkan ke Form</button></div>' +
    '</div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeWilayahModal(); });
  return overlay;
}

function closeWilayahModal() {
  const overlay = document.getElementById('wilayah-overlay');
  if (overlay) overlay.classList.remove('open');
}

function _renderWilayahModal(result) {
  window._wilayahLastData = result || {};
  const overlay = _ensureWilayahModal();
  const body = document.getElementById('wilayah-modal-body');
  const wilayah = result.wilayah || {};
  const rekom = result.rekomendasi || {};
  const conf = rekom.confidence || {};
  const sourceMode = rekom.source_mode || '';
  const warnings = result.warnings || [];
  const info = [['Provinsi', wilayah.provinsi], ['Kab/Kota', wilayah.kabupaten_kota], ['Kecamatan', wilayah.kecamatan], ['Desa/Kel.', wilayah.desa_kelurahan]].map(function (pair) {
    const item = pair[1] || {};
    const score = item.confidence ? ' (' + Math.round(item.confidence * 100) + '%)' : '';
    return '<div class="wilayah-info-item"><div class="wilayah-info-label">' + _wilayahEsc(pair[0]) + '</div><div class="wilayah-info-value">' + _wilayahEsc(item.name || '-') + _wilayahEsc(score) + '</div></div>';
  }).join('');
  const rows = _wilayahFields().map(function (field) {
    const text = _wilayahValueText(rekom[field.key]);
    if (!text) return '';
    const c = String(conf[field.key] || '').toLowerCase();
    const draft = field.sensitive || c === 'rendah' || sourceMode === 'ai_draft';
    var oldText = '-';
    if (field.type === 'tags') {
      oldText = _wilayahValueText((_tlData || {})[field.target]) || '-';
    } else {
      oldText = _wilayahValueText((document.getElementById(field.target) || {}).value) || '-';
    }
    return '<tr><td><input type="checkbox" class="wilayah-apply-check" data-key="' + _wilayahEsc(field.key) + '"' + (field.sensitive ? '' : ' checked') + '></td><td>' + _wilayahEsc(field.label) + '</td><td>' + _wilayahEsc(oldText) + '</td><td>' + _wilayahEsc(text) + '</td><td><span class="wilayah-badge ' + (draft ? 'wilayah-badge-draft' : 'wilayah-badge-kuat') + '">' + (draft ? 'Draft' : 'Kuat') + '</span></td></tr>';
  }).filter(Boolean).join('');
  const sourceRows = (result.sources || []).map(s => _wilayahEsc(s.name + ': ' + s.status)).join(' | ');
  const rekomNoteHtml = rekom.notes
    ? '<div class="wilayah-note"><strong>Catatan Stopper:</strong> ' + _wilayahEsc(rekom.notes) + '</div>'
    : '';
  body.innerHTML =
    '<div class="wilayah-info-grid">' + info + '</div>' +
    '<div class="wilayah-note">Sumber: ' + (sourceRows || '-') + '</div>' +
    (warnings.length ? '<div class="wilayah-note">' + warnings.map(_wilayahEsc).join('<br>') + '</div>' : '') +
    (sourceMode === 'ai_draft' ? '<div class="wilayah-note">Hasil ini adalah draft berbasis AI karena data BPS resmi belum tersedia. Periksa kembali dengan keterangan lapangan.</div>' : '') +
    rekomNoteHtml +
    (rows ? '<table class="wilayah-table"><thead><tr><th>Pakai</th><th>Field</th><th>Isi Saat Ini</th><th>Rekomendasi</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table>' : '<div class="wilayah-note">Wilayah berhasil dideteksi, tetapi belum ada rekomendasi isian.</div>');
  overlay.classList.add('open');
}

function _setWilayahSelect(id, value) {
  const el = document.getElementById(id);
  if (!el || !value) return false;
  const val = String(value).trim();
  let matched = '';
  Array.from(el.options || []).forEach(function (opt) {
    if (!matched && opt.value && opt.value.toLowerCase() === val.toLowerCase()) matched = opt.value;
    if (!matched && opt.textContent && opt.textContent.trim().toLowerCase() === val.toLowerCase()) matched = opt.value || opt.textContent.trim();
  });
  if (!matched) return false;
  el.value = matched;
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

function _setWilayahTags(key, values) {
  if (!Array.isArray(values)) values = String(values || '').split(',');
  const cleaned = [];
  values.forEach(function (item) {
    const val = String(item || '').trim();
    if (val && !cleaned.some(x => x.toLowerCase() === val.toLowerCase())) cleaned.push(val);
  });
  _tlData[key] = cleaned.slice(0, 5);
  try { tlRender(key); } catch (_e) { }
}

async function ambilDataWilayah() {
  await _ensureWilayahSourceTabsMounted();
  const alamat = _pickAlamatLingkungan();
  if (!alamat) {
    if (typeof toastError === 'function') toastError('Alamat penjamin/klien belum diisi.');
    return;
  }
      if (!window.pywebview || !window.pywebview.api || !window.pywebview.api.fetch_wilayah_data) {
        if (typeof toastError === 'function') toastError('Bridge data wilayah belum tersedia. Tutup dan buka kembali modul.');
        return;
      }
      if (typeof window.LStopperRequireAiKey === 'function') {
        const hasAiKey = await window.LStopperRequireAiKey();
        if (!hasAiKey) return;
      }
      const okStart = typeof LDialog !== 'undefined'
        ? await LDialog.confirm({
      title: 'Konfirmasi Lanjutkan',
      message:
        'STOPPER akan membaca alamat dan mengambil rekomendasi data wilayah.<br><br>' +
        'Hasilnya akan ditampilkan untuk ditinjau sebelum diterapkan.<br><br>' +
        'Lanjutkan?',
      icon: 'warning',
      type: 'warning',
      okText: 'Ya, Lanjutkan',
      cancelText: 'Batal'
    })
    : confirm(
      'STOPPER akan membaca alamat dan mengambil rekomendasi data wilayah. ' +
      'Hasilnya akan ditampilkan untuk ditinjau sebelum diterapkan. Lanjutkan?'
    );
  if (!okStart) return;
  const btn = document.getElementById('btn-ambil-wilayah');
  const oldText = btn ? btn.innerHTML : '';
  try {
    if (window.LStopperLoading) {
      window.LStopperLoading.show({
        title: 'STOPPER AI',
        message: 'Membaca alamat sumber...',
        detail: alamat,
        steps: [
          'Membaca alamat sumber...',
          'Mencocokkan wilayah administratif...',
          'Mengambil data statistik wilayah...',
          'Menyusun rekomendasi isian lingkungan...'
        ]
      });
    }
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/></svg><span class="stopper-label">STOPPER</span><span class="stopper-badge">MEMPROSES</span>';
    }
    const res = await window.pywebview.api.fetch_wilayah_data(alamat);
    if (!res || !res.ok) {
      if (window.LStopperLoading) window.LStopperLoading.hide();
      if (typeof toastError === 'function') toastError((res && res.err) || 'Gagal mengambil data wilayah.');
      return;
    }
    if (window.LStopperLoading) window.LStopperLoading.done('Rekomendasi wilayah siap ditinjau.');
    _renderWilayahModal(res);
  } catch (e) {
    if (window.LStopperLoading) window.LStopperLoading.hide();
    if (typeof toastError === 'function') toastError('Error data wilayah: ' + e);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = oldText;
    }
  }
}

function terapkanDataWilayah() {
  const data = window._wilayahLastData || {};
  const rekom = data.rekomendasi || {};
  let applied = 0;
  const checked = Array.from(document.querySelectorAll('.wilayah-apply-check:checked')).map(el => el.dataset.key);
  _wilayahFields().forEach(function (field) {
    if (!checked.includes(field.key)) return;
    const value = rekom[field.key];
    if (field.type === 'tags' && _wilayahValueText(value)) {
      _setWilayahTags(field.target, value); applied++;
    } else if (field.type === 'select' && _setWilayahSelect(field.target, value)) {
      applied++;
    }
  });
  const smajCount = (_tlData && _tlData['smaj']) ? _tlData['smaj'].length : 0;
  const sminCount = (_tlData && _tlData['smin']) ? _tlData['smin'].length : 0;
  if (smajCount + sminCount > 1) {
    _setWilayahSelect('f5-homogen', 'Heterogen');
  }
  try { onToggleHomogen((document.getElementById('f5-homogen') || {}).value || ''); } catch (_e) { }
  try { updateProgress(); } catch (_e) { }
  window._userHasTyped = true;
  closeWilayahModal();
  if (typeof toastDoc === 'function') {
    const sourcesText = (data.sources || []).map(s => s.name).join(', ');
    toastDoc({
      label: 'STOPPER AI',
      msg: 'Data wilayah diterapkan ke ' + applied + ' field.<br><span style="font-size:11.5px;opacity:0.85">Sumber: ' + (sourcesText || 'AI') + '</span>',
      dur: 8000,
      buttons: [
        { text: 'Tutup', icon: 'close', onClick: function () { if (typeof toastClear === 'function') toastClear(); } }
      ]
    });
  } else if (typeof toastSuccess === 'function') {
    toastSuccess('Data wilayah diterapkan ke ' + applied + ' field. Periksa kembali sebelum generate.');
  }
}

window.ambilDataWilayah = ambilDataWilayah;
window.terapkanDataWilayah = terapkanDataWilayah;
window.closeWilayahModal = closeWilayahModal;

/* ── validateTab5 ── */

/* ══════════════════════════════════════════
   TAB V — KONDISI LINGKUNGAN SOSIAL BUDAYA
══════════════════════════════════════════ */
function validateTab5() {
  const missing = []; const pfx = 'Kondisi Lingkungan > ';
  const _v = id => (document.getElementById(id) || {}).value || '';
  if (!_v('f5-relasi-sosial')) missing.push(pfx + 'Relasi Sosial Antar Masyarakat');
  if (!(_tlData['pmaj'] || []).length) missing.push(pfx + 'Pekerjaan Mayoritas (minimal 1)');
  if (!(_tlData['pmin'] || []).length) missing.push(pfx + 'Pekerjaan Minoritas (minimal 1)');
  if (!_v('f5-ekonomi')) missing.push(pfx + 'Stratifikasi Sosial Ekonomi');
  if (!_v('f5-pendidikan-mayoritas')) missing.push(pfx + 'Pendidikan Mayoritas Warga');
  if (!_v('f5-pendidikan-minoritas')) missing.push(pfx + 'Pendidikan Minoritas Warga');
  const anyP = ['f5-pemberi-klien', 'f5-pemberi-keluarga', 'f5-pemberi-kades', 'f5-pemberi-rt', 'f5-pemberi-lurah']
    .some(id => document.getElementById(id) && document.getElementById(id).checked);
  if (!anyP) missing.push(pfx + 'Pemberi Keterangan (pilih minimal satu)');
  if (!_v('f5-homogen')) missing.push(pfx + 'Komposisi Masyarakat');
  if (!(_tlData['smaj'] || []).length) missing.push(pfx + 'Suku Mayoritas (minimal 1)');
  if (_v('f5-homogen') === 'Heterogen' && !(_tlData['smin'] || []).length) missing.push(pfx + 'Suku Minoritas (minimal 1)');
  if (!_v('f5-kepedulian-masyarakat')) missing.push(pfx + 'Kepedulian Kehidupan Masyarakat');
  if (!_v('f5-kepedulian-pendidikan')) missing.push(pfx + 'Kepedulian Pendidikan');
  if (!_v('f5-kepedulian-keagamaan')) missing.push(pfx + 'Kepedulian Keagamaan');
  if (!_v('f5-agama-mayoritas')) missing.push(pfx + 'Agama Mayoritas');
  if (!_v('f5-kepedulian-hukum')) missing.push(pfx + 'Kepedulian Penegakan Hukum');
  return missing;
}

/* ── collectTab5 ── */
function collectTab5() {
  const _v = id => (document.getElementById(id) || {}).value || '';
  return {
    lingkungan_sosial_budaya: {
      relasi_antar_masyarakat: _v('f5-relasi-sosial'),
      pekerjaan_mayoritas: (_tlData['pmaj'] || []).slice(),
      pekerjaan_minoritas: (_tlData['pmin'] || []).slice(),
      stratifikasi_ekonomi: _v('f5-ekonomi'),
      pendidikan_mayoritas: _v('f5-pendidikan-mayoritas'),
      pendidikan_minoritas: _v('f5-pendidikan-minoritas'),
      pemberi_keterangan: {
        klien: !!(document.getElementById('f5-pemberi-klien') && document.getElementById('f5-pemberi-klien').checked),
        'keluarga klien': !!(document.getElementById('f5-pemberi-keluarga') && document.getElementById('f5-pemberi-keluarga').checked),
        'Kepala Desa': !!(document.getElementById('f5-pemberi-kades') && document.getElementById('f5-pemberi-kades').checked),
        'Ketua RT': !!(document.getElementById('f5-pemberi-rt') && document.getElementById('f5-pemberi-rt').checked),
        'Lurah': !!(document.getElementById('f5-pemberi-lurah') && document.getElementById('f5-pemberi-lurah').checked),
      },
      komposisi_masyarakat: _v('f5-homogen'),
      suku_mayoritas: (_tlData['smaj'] || []).slice(),
      suku_minoritas: _v('f5-homogen') === 'Heterogen' ? (_tlData['smin'] || []).slice() : [],
      kepedulian_masyarakat: _v('f5-kepedulian-masyarakat'),
      kepedulian_pendidikan: _v('f5-kepedulian-pendidikan'),
      kepedulian_keagamaan: _v('f5-kepedulian-keagamaan'),
      agama_mayoritas: _v('f5-agama-mayoritas'),
      kepedulian_hukum: _v('f5-kepedulian-hukum'),
    }
  };
}

/* ── Bab VI — Korban cards (per-card jenis) ── */
var _korbanCounter = 0;

function _korbanCardHTML(idx, removable) {
  var removeBtn = removable
    ? '<button type="button" class="btn-hapus-korban" onclick="hapusKorbanCard(' + idx + ')">Hapus</button>'
    : '';
  return '<div class="korban-card" id="korban-card-' + idx + '" data-korban-idx="' + idx + '">'
    + '<div class="korban-card-hdr"><div class="korban-card-title">Korban</div>' + removeBtn + '</div>'
    + '<div class="fgrid">'
    + '<div class="flbl req">Jenis Korban</div>'
    + '<select class="fsel korban-jenis" onchange="onKorbanJenisChange(this)">'
    + '<option value="">&#8212; Pilih &#8212;</option>'
    + '<option>Korban perorangan</option>'
    + '<option>Korban negara</option>'
    + '<option>Korban badan hukum/korporasi</option>'
    + '<option>Korban diri sendiri</option>'
    + '</select></div>'
    + '<div class="fcond korban-cond-diri" style="display:none;margin-top:10px">'
    + '<div class="fcond-title">Korban Diri Sendiri</div><div class="fgrid">'
    + '<div class="flbl req">Keadaan Klien Saat Ini</div>'
    + '<input class="finp korban-keadaan" type="text" placeholder="Contoh: sehat, sudah pulih" spellcheck="false">'
    + '</div></div>'
    + '<div class="fcond korban-cond-perorangan" style="display:none;margin-top:10px">'
    + '<div class="fcond-title">Data Korban</div><div class="fgrid">'
    + '<div class="flbl req">Nama Korban / Badan Hukum-Korporasi-Instansi</div>'
    + '<input class="finp korban-nama" type="text" placeholder="Nama lengkap korban atau nama badan hukum / korporasi / instansi" spellcheck="false" oninput="scheduleSyncTanggapanKorbanCards()">'
    + '<div class="flbl req">Kerugian Materiel</div>'
    + '<input class="finp korban-materiel" type="text" placeholder="Contoh: Rp5.000.000" spellcheck="false">'
    + '<div class="flbl">Kerugian Imateriel <span style=\'font-size:11px;opacity:.55\'>(kosongkan jika tidak ada)</span></div>'
    + '<input class="finp korban-imateriel" type="text" placeholder="Contoh: trauma psikologis" spellcheck="false">'
    + '</div></div>'
    + '<div class="fcond korban-cond-negara" style="display:none;margin-top:10px">'
    + '<div class="fcond-title">Kerugian Negara</div><div class="fgrid">'
    + '<div class="flbl req">Kerugian Negara</div>'
    + '<input class="finp korban-negara" type="text" placeholder="Contoh: Rp100.000.000" spellcheck="false">'
    + '</div></div>'
    + '</div>';
}

function onKorbanJenisChange(sel) {
  var card = sel.closest('.korban-card');
  if (!card) return;
  var val = sel.value;
  var diri = card.querySelector('.korban-cond-diri');
  var per = card.querySelector('.korban-cond-perorangan');
  var neg = card.querySelector('.korban-cond-negara');
  if (diri) diri.style.display = (val === 'Korban diri sendiri') ? 'block' : 'none';
  if (per) per.style.display = (val === 'Korban perorangan' || val === 'Korban badan hukum/korporasi') ? 'block' : 'none';
  if (neg) neg.style.display = (val === 'Korban negara') ? 'block' : 'none';
  syncTanggapanKorbanVis();
  updateProgress();
}

function tambahKorbanCard(data) {
  var container = document.getElementById('korban-list-container');
  if (!container) return;
  var idx = _korbanCounter++;
  var hasExisting = container.querySelectorAll('.korban-card').length > 0;
  var div = document.createElement('div');
  div.innerHTML = _korbanCardHTML(idx, hasExisting);
  var card = div.firstChild;
  container.appendChild(card);
  if (data) {
    var jSel = card.querySelector('.korban-jenis');
    if (jSel && data.jenis_korban) { jSel.value = data.jenis_korban; onKorbanJenisChange(jSel); }
    var inp;
    inp = card.querySelector('.korban-keadaan'); if (inp && data.keadaan_korban) inp.value = data.keadaan_korban;
    inp = card.querySelector('.korban-nama'); if (inp && data.nama_korban) inp.value = data.nama_korban;
    inp = card.querySelector('.korban-materiel'); if (inp && data.kerugian_materiel) inp.value = data.kerugian_materiel;
    inp = card.querySelector('.korban-imateriel'); if (inp && data.kerugian_imateriel) inp.value = data.kerugian_imateriel;
    inp = card.querySelector('.korban-negara'); if (inp && data.kerugian_negara) inp.value = data.kerugian_negara;
  }
  syncTanggapanKorbanVis();
  updateProgress();
}

function hapusKorbanCard(idx) {
  var card = document.getElementById('korban-card-' + idx);
  if (card) card.remove();
  var cards = document.querySelectorAll('#korban-list-container .korban-card');
  if (cards.length === 1) {
    var btn = cards[0].querySelector('.btn-hapus-korban');
    if (btn) btn.remove();
  }
  syncTanggapanKorbanVis();
  updateProgress();
}

function _getKorbanList() {
  var cards = document.querySelectorAll('#korban-list-container .korban-card');
  var list = [];
  cards.forEach(function (c) {
    var jenis = (c.querySelector('.korban-jenis') || {}).value || '';
    var obj = { jenis_korban: jenis };
    if (jenis === 'Korban diri sendiri') {
      obj.keadaan_korban = (c.querySelector('.korban-keadaan') || {}).value || '';
    } else if (jenis === 'Korban perorangan' || jenis === 'Korban badan hukum/korporasi') {
      obj.nama_korban = (c.querySelector('.korban-nama') || {}).value || '';
      obj.kerugian_materiel = (c.querySelector('.korban-materiel') || {}).value || '';
      obj.kerugian_imateriel = (c.querySelector('.korban-imateriel') || {}).value || '';
    } else if (jenis === 'Korban negara') {
      obj.kerugian_negara = (c.querySelector('.korban-negara') || {}).value || '';
    }
    list.push(obj);
  });
  return list;
}

/* ── Toggle Tulang Punggung visibility (hidden for pelimpahan) ── */
function _updateTulangPunggungVis() {
  const pel = _isPelimpahan();
  const acc = document.getElementById('acc-6-3');
  if (acc) acc.style.display = pel ? 'none' : '';
  if (pel) { const f = document.getElementById('f6-tulang-punggung'); if (f) f.value = ''; }
}
const _origTogglePel = window.onTogglePelimpahan;
window.onTogglePelimpahan = function (val) {
  if (typeof _origTogglePel === 'function') _origTogglePel.call(this, val);
  _updateTulangPunggungVis();
};
document.addEventListener('DOMContentLoaded', _updateTulangPunggungVis);
setTimeout(_updateTulangPunggungVis, 200);

/* ── validateTab6 ── */

/* ── loadTab5 — Lingkungan Sosial Budaya ── */
function loadTab5(data) {
  if (!data) return;
  var lb = data.lingkungan_sosial_budaya || {};
  function sv(id, val) { var el = document.getElementById(id); if (el) el.value = (val || ''); }
  function cb(id, val) { var el = document.getElementById(id); if (el) el.checked = !!val; }
  sv('f5-relasi-sosial', lb.relasi_antar_masyarakat);
  sv('f5-ekonomi', lb.stratifikasi_ekonomi);
  sv('f5-pendidikan-mayoritas', lb.pendidikan_mayoritas);
  sv('f5-pendidikan-minoritas', lb.pendidikan_minoritas);
  sv('f5-kepedulian-masyarakat', lb.kepedulian_masyarakat);
  sv('f5-kepedulian-pendidikan', lb.kepedulian_pendidikan);
  sv('f5-kepedulian-keagamaan', lb.kepedulian_keagamaan);
  sv('f5-agama-mayoritas', lb.agama_mayoritas);
  sv('f5-kepedulian-hukum', lb.kepedulian_hukum);
  sv('f5-homogen', lb.komposisi_masyarakat);
  try { onToggleHomogen(lb.komposisi_masyarakat || ''); } catch (_e) { }
  var pk = lb.pemberi_keterangan || {};
  cb('f5-pemberi-klien', pk['klien'] || pk['Klien']);
  cb('f5-pemberi-keluarga', pk['keluarga klien'] || pk['Keluarga Klien']);
  cb('f5-pemberi-kades', pk['Kepala Desa']);
  cb('f5-pemberi-rt', pk['Ketua RT']);
  cb('f5-pemberi-lurah', pk['Lurah']);
  try { syncPemberiCheck(); } catch (_e) { }
  var tkeys = { pmaj: 'pekerjaan_mayoritas', pmin: 'pekerjaan_minoritas', smaj: 'suku_mayoritas', smin: 'suku_minoritas' };
  Object.keys(tkeys).forEach(function (key) {
    _tlData[key] = (lb[tkeys[key]] || []).slice();
    try { tlRender(key); } catch (_e) { }
  });
}
window.loadTab5 = loadTab5;

/* ══════════════════════════════════════════
   TAB VI — RIWAYAT TINDAK PIDANA
══════════════════════════════════════════ */
function validateTab6() {
  const missing = []; const pfx = 'Riwayat Tindak Pidana > ';
  const _v = id => (document.getElementById(id) || {}).value || '';
  if (!_v('f6-latar-belakang')) missing.push(pfx + 'Latar Belakang Pidana');
  if (!_v('f6-kronologi')) missing.push(pfx + 'Kronologi');
  var daftarK = _getKorbanList();
  if (daftarK.length === 0) missing.push(pfx + 'Minimal 1 data korban');
  daftarK.forEach(function (k, i) {
    var lbl = 'Korban ' + (i + 1) + ': ';
    if (!k.jenis_korban) missing.push(pfx + lbl + 'Jenis Korban');
    if (k.jenis_korban === 'Korban diri sendiri' && !k.keadaan_korban) missing.push(pfx + lbl + 'Keadaan Klien Saat Ini');
    if (k.jenis_korban === 'Korban perorangan' || k.jenis_korban === 'Korban badan hukum/korporasi') {
      if (!k.nama_korban) missing.push(pfx + lbl + 'Nama Korban');
      if (!k.kerugian_materiel) missing.push(pfx + lbl + 'Kerugian Materiel');
    }
    if (k.jenis_korban === 'Korban negara' && !k.kerugian_negara) missing.push(pfx + lbl + 'Kerugian Negara');
  });
  if (!_isPelimpahan() && !_v('f6-tulang-punggung')) missing.push(pfx + 'Apakah Klien Tulang Punggung Keluarga?');
  return missing;
}

/* ── collectTab6 ── */
function collectTab6() {
  const _v = id => (document.getElementById(id) || {}).value || '';
  var daftarKorban = _getKorbanList();
  var daftarTanggapan = _getTanggapanList();
  return {
    riwayat_pidana: {
      latar_belakang: _v('f6-latar-belakang'),
      kronologi: _v('f6-kronologi'),
      korban: {
        daftar_korban: daftarKorban,
      },
      tanggapan_korban: { daftar_tanggapan: daftarTanggapan },
      tulang_punggung: _isPelimpahan() ? '' : _v('f6-tulang-punggung'),
    }
  };
}
/* ══════════════════════════════════════════
   END BAB V & VI
══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   BAB VII JS
══════════════════════════════════════════ */

/* Sync tanggapan korban visibility based on Bab VI korban cards */
function syncTanggapanKorbanVis() {
  var korbanCards = document.querySelectorAll('#korban-list-container .korban-card');
  var hasPerorangan = false;
  var hasAny = korbanCards.length > 0;
  korbanCards.forEach(function (c) {
    var jk = (c.querySelector('.korban-jenis') || {}).value || '';
    if (jk === 'Korban perorangan' || jk === 'Korban badan hukum/korporasi') hasPerorangan = true;
  });
  const wrapShow = document.getElementById('cond-tanggapan-korban-wrap');
  const wrapNA = document.getElementById('cond-tanggapan-na');
  const wrapEmpty = document.getElementById('cond-tanggapan-empty');
  if (wrapShow) wrapShow.style.display = hasPerorangan ? '' : 'none';
  if (wrapNA) wrapNA.style.display = (hasAny && !hasPerorangan) ? '' : 'none';
  if (wrapEmpty) wrapEmpty.style.display = (!hasAny) ? '' : 'none';
  if (hasPerorangan) {
    syncTanggapanKorbanCards();
  } else {
    var tc = document.getElementById('tanggapan-korban-list-container');
    if (tc) tc.innerHTML = '';
  }
  updateProgress();
}

/* Build/sync tanggapan cards in Bab VII — only for perorangan/badan hukum korban */
var _syncTanggapanKorbanTimer = null;
function scheduleSyncTanggapanKorbanCards() {
  if (_syncTanggapanKorbanTimer) clearTimeout(_syncTanggapanKorbanTimer);
  _syncTanggapanKorbanTimer = setTimeout(function () {
    _syncTanggapanKorbanTimer = null;
    syncTanggapanKorbanCards();
  }, 900);
}

function syncTanggapanKorbanCards() {
  var container = document.getElementById('tanggapan-korban-list-container');
  if (!container) return;
  var korbanCards = document.querySelectorAll('#korban-list-container .korban-card');
  // Collect existing tanggapan data before rebuild
  var existingData = {};
  container.querySelectorAll('.tanggapan-card').forEach(function (tc) {
    var key = tc.getAttribute('data-korban-idx');
    existingData[key] = {
      terhubungi: (tc.querySelector('.tg-terhubungi') || {}).value || '',
      memaafkan: (tc.querySelector('.tg-memaafkan') || {}).value || '',
      dukungan: (tc.querySelector('.tg-dukungan') || {}).value || ''
    };
  });
  container.innerHTML = '';
  var pel = _isPelimpahan();
  var limpahOpt = pel ? '<option>Limpahkan</option>' : '';
  korbanCards.forEach(function (kc) {
    var jk = (kc.querySelector('.korban-jenis') || {}).value || '';
    if (jk !== 'Korban perorangan' && jk !== 'Korban badan hukum/korporasi') return;
    var idx = kc.getAttribute('data-korban-idx');
    var nama = (kc.querySelector('.korban-nama') || {}).value || '(belum diisi)';
    var prev = existingData[idx] || {};
    var th = prev.terhubungi || '';
    var showYa = (th === 'Ya') ? 'display:block' : 'display:none';
    var html = '<div class="tanggapan-card" data-korban-idx="' + idx + '">'
      + '<div class="tanggapan-card-title">Tanggapan dari: ' + _escHtml(nama) + '</div>'
      + '<div class="fgrid">'
      + '<div class="flbl req">Apakah Korban Bisa Dihubungi / Ditemui?</div>'
      + '<select class="fsel tg-terhubungi" onchange="onTgTerhubungiChange(this)">'
      + '<option value="">&#8212; Pilih &#8212;</option>'
      + '<option' + (th === 'Ya' ? ' selected' : '') + '>Ya</option>'
      + '<option' + (th === 'Tidak' ? ' selected' : '') + '>Tidak</option>'
      + limpahOpt
      + '</select></div>'
      + '<div class="fcond tg-cond-ya" style="margin-top:10px;' + showYa + '">'
      + '<div class="fcond-title">Tanggapan Korban</div><div class="fgrid">'
      + '<div class="flbl req">Apakah Korban Memaafkan?</div>'
      + '<select class="fsel tg-memaafkan">'
      + '<option value="">&#8212; Pilih &#8212;</option>'
      + '<option' + ((prev.memaafkan || '') === 'Ya' ? ' selected' : '') + '>Ya</option>'
      + '<option' + ((prev.memaafkan || '') === 'Tidak' ? ' selected' : '') + '>Tidak</option></select>'
      + '<div class="flbl req">Apakah Korban Mendukung Program?</div>'
      + '<select class="fsel tg-dukungan">'
      + '<option value="">&#8212; Pilih &#8212;</option>'
      + '<option' + ((prev.dukungan || '') === 'Mendukung' ? ' selected' : '') + '>Mendukung</option>'
      + '<option' + ((prev.dukungan || '') === 'Tidak Mendukung' ? ' selected' : '') + '>Tidak Mendukung</option></select>'
      + '</div></div></div>';
    container.insertAdjacentHTML('beforeend', html);
  });
}

function onTgTerhubungiChange(sel) {
  var card = sel.closest('.tanggapan-card');
  if (!card) return;
  var cond = card.querySelector('.tg-cond-ya');
  if (cond) cond.style.display = (sel.value === 'Ya') ? 'block' : 'none';
  if (sel.value !== 'Ya') {
    var m = card.querySelector('.tg-memaafkan'); if (m) m.value = '';
    var d = card.querySelector('.tg-dukungan'); if (d) d.value = '';
  }
  updateProgress();
}

function _getTanggapanList() {
  var korbanCards = document.querySelectorAll('#korban-list-container .korban-card');
  var tgCards = document.querySelectorAll('#tanggapan-korban-list-container .tanggapan-card');
  var tgMap = {};
  tgCards.forEach(function (c) {
    var idx = c.getAttribute('data-korban-idx');
    var th = (c.querySelector('.tg-terhubungi') || {}).value || '';
    tgMap[idx] = {
      bisa_dihubungi: th,
      memaafkan: th === 'Ya' ? (c.querySelector('.tg-memaafkan') || {}).value || '' : '',
      mendukung_program: th === 'Ya' ? (c.querySelector('.tg-dukungan') || {}).value || '' : ''
    };
  });
  var list = [];
  korbanCards.forEach(function (kc) {
    var idx = kc.getAttribute('data-korban-idx');
    var jk = (kc.querySelector('.korban-jenis') || {}).value || '';
    if ((jk === 'Korban perorangan' || jk === 'Korban badan hukum/korporasi') && tgMap[idx]) {
      list.push(tgMap[idx]);
    } else {
      list.push({});
    }
  });
  return list;
}

function onKeluargaMendukungChange(val) {
  const cond = document.getElementById('cond-alasan-keluarga');
  if (cond) cond.style.display = (val === 'Tidak') ? 'block' : 'none';
  if (val !== 'Tidak') { const f = document.getElementById('f7-alasan-keluarga'); if (f) f.value = ''; }
  updateProgress();
}

/* Toggle Bab VII keluarga/masyarakat/pemerintah fields for pelimpahan */
function _updateBab7PelimpahanVis() {
  const pel = _isPelimpahan();
  const acc = document.getElementById('acc-7-3');
  if (acc) acc.style.display = pel ? 'none' : '';
  const acc74 = document.getElementById('acc-7-4');
  if (acc74) acc74.style.display = pel ? 'none' : '';
  if (pel) {
    ['f7-keluarga-mendukung', 'f7-masyarakat-mendukung', 'f7-pemerintah-mendukung', 'f7-alasan-keluarga']
      .forEach(id => { const f = document.getElementById(id); if (f) f.value = ''; });
  }
}
/* Patch pelimpahan toggle */
(function () {
  const _p = window.onTogglePelimpahan;
  window.onTogglePelimpahan = function (val) {
    if (typeof _p === 'function') _p.call(this, val);
    _updateBab7PelimpahanVis();
  };
})();
document.addEventListener('DOMContentLoaded', function () {
  // Init first korban card if none exist
  var klc = document.getElementById('korban-list-container');
  if (klc && klc.querySelectorAll('.korban-card').length === 0) tambahKorbanCard();
  syncTanggapanKorbanVis();
  _updateBab7PelimpahanVis();
});
setTimeout(function () { syncTanggapanKorbanVis(); _updateBab7PelimpahanVis(); }, 300);

/* validateTab7 */

/* ── loadTab6 — Riwayat Pidana ── */
/* ── 8. loadTab6 — Riwayat Pidana ─────────────────────────────── */
function loadTab6(data) {
  if (!data) return;
  var rp = data.riwayat_pidana || {};
  var ko = rp.korban || {};
  function sv(id, val) { var el = document.getElementById(id); if (el) el.value = (val || ''); }
  sv('f6-latar-belakang', rp.latar_belakang);
  sv('f6-kronologi', rp.kronologi);
  // Clear existing korban cards before loading
  var klc = document.getElementById('korban-list-container');
  if (klc) klc.innerHTML = '';
  _korbanCounter = 0;
  // Build daftar from new or old format
  var daftar = ko.daftar_korban || [];
  if (daftar.length === 0) {
    // Old format: single jenis_korban with single korban data
    var jk = ko.jenis_korban || '';
    if (!jk && (ko.klien_korban === 'Ya' || ko.klien_korban === 'Tidak'))
      jk = (ko.klien_korban === 'Ya') ? 'Korban diri sendiri' : 'Korban perorangan';
    if (jk === 'Korban perusahaan') jk = 'Korban badan hukum/korporasi';
    if (jk) {
      var oldObj = { jenis_korban: jk };
      if (jk === 'Korban diri sendiri') oldObj.keadaan_korban = ko.keadaan_korban || '';
      else if (jk === 'Korban perorangan' || jk === 'Korban badan hukum/korporasi') {
        oldObj.nama_korban = ko.nama_korban || '';
        oldObj.kerugian_materiel = ko.kerugian_materiel || '';
        oldObj.kerugian_imateriel = ko.kerugian_imateriel || '';
      } else if (jk === 'Korban negara') {
        oldObj.kerugian_negara = ko.kerugian_negara || '';
      }
      daftar = [oldObj];
    }
  }
  if (daftar.length > 0) {
    daftar.forEach(function (k) { tambahKorbanCard(k); });
  } else {
    tambahKorbanCard();
  }
  sv('f6-tulang-punggung', rp.tulang_punggung);
}
window.loadTab6 = loadTab6;

/* ══════════════════════════════════════════
   TAB VII — TANGGAPAN BERBAGAI PIHAK
══════════════════════════════════════════ */
function validateTab7() {
  const missing = []; const pfx = 'Tanggapan > ';
  const _v = id => (document.getElementById(id) || {}).value || '';
  if (!_v('f7-mengakui')) missing.push(pfx + 'Apakah Klien Mengakui Kesalahan?');
  if (!_v('f7-menyesal')) missing.push(pfx + 'Apakah Klien Menyesali Perbuatan?');
  var tgCards = document.querySelectorAll('#tanggapan-korban-list-container .tanggapan-card');
  tgCards.forEach(function (tc, i) {
    var lbl = 'Korban ' + (i + 1) + ': ';
    var th = (tc.querySelector('.tg-terhubungi') || {}).value || '';
    if (!th) missing.push(pfx + lbl + 'Apakah Bisa Dihubungi?');
    if (th === 'Ya') {
      if (!(tc.querySelector('.tg-memaafkan') || {}).value) missing.push(pfx + lbl + 'Apakah Memaafkan?');
      if (!(tc.querySelector('.tg-dukungan') || {}).value) missing.push(pfx + lbl + 'Apakah Mendukung Program?');
    }
  });
  if (!_isPelimpahan()) {
    if (!_v('f7-keluarga-mendukung')) missing.push(pfx + 'Apakah Keluarga Mendukung?');
    if (_v('f7-keluarga-mendukung') === 'Tidak' && !_v('f7-alasan-keluarga')) missing.push(pfx + 'Alasan Keluarga Tidak Mendukung');
    if (!_v('f7-masyarakat-mendukung')) missing.push(pfx + 'Apakah Masyarakat Mendukung?');
    if (!_v('f7-pemerintah-mendukung')) missing.push(pfx + 'Apakah Pemerintah Mendukung?');
  }
  return missing;
}

/* collectTab7 */
function collectTab7() {
  const _v = id => (document.getElementById(id) || {}).value || '';
  return {
    mengakui: _v('f7-mengakui'),
    menyesal: _v('f7-menyesal'),
    tanggapan_korban: { daftar_tanggapan: _getTanggapanList() },
    keluarga_mendukung: _isPelimpahan() ? '' : _v('f7-keluarga-mendukung'),
    alasan_tidak_mendukung: _v('f7-alasan-keluarga'),
    masyarakat_mendukung: _isPelimpahan() ? '' : _v('f7-masyarakat-mendukung'),
    pemerintah_mendukung: _isPelimpahan() ? '' : _v('f7-pemerintah-mendukung'),
  };
}
/* ══════════════════════════════════════════
   END BAB VII
══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   BAB VII — opsi "Limpahkan" hanya saat pelimpahan
══════════════════════════════════════════ */
function _updateKorbanLimpahkanVis() {
  var pel = _isPelimpahan();
  // Re-sync tanggapan cards to show/hide Limpahkan option
  syncTanggapanKorbanCards();
}

/* ══════════════════════════════════════════
   BAB VIII JS
══════════════════════════════════════════ */
const _b8Programs = { kep: [], man: [] };
const _b8Tags = { kunjungan: [], telepon: [] };

function _renderB8Tags(type, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const arr = (type === 'kep' || type === 'man') ? _b8Programs[type] : _b8Tags[type];
  el.innerHTML = arr.map((v, i) =>
    `<span class="b8-tag">${v}<button type="button" class="b8-tag-del" onclick="removeB8Tag('${type}',${i})">×</button></span>`
  ).join('');
  const chk = document.getElementById('f8-' + type + '-check');
  if (chk) chk.value = arr.length ? '1' : '';
  updateProgress();
}
function addBab8Program(type) {
  const inp = document.getElementById('f8-' + type + '-input');
  const val = (inp?.value || '').trim(); if (!val) return;
  _b8Programs[type].push(val); inp.value = ''; inp.focus();
  _renderB8Tags(type, 'tags-' + type);
}
function addBab8Tag(type) {
  const inp = document.getElementById('f8-' + type + '-input');
  const val = (inp?.value || '').trim(); if (!val) return;
  _b8Tags[type].push(val); inp.value = ''; inp.focus();
  _renderB8Tags(type, 'tags-' + type);
}
function removeB8Tag(type, idx) {
  if (type === 'kep' || type === 'man') { _b8Programs[type].splice(idx, 1); _renderB8Tags(type, 'tags-' + type); }
  else { _b8Tags[type].splice(idx, 1); _renderB8Tags(type, 'tags-' + type); }
}
function onBab8KepChange(val) {
  const c = document.getElementById('cond-kep-ya');
  if (c) c.style.display = (val === 'Ya') ? 'block' : 'none';
  if (val !== 'Ya') { _b8Programs.kep = []; _renderB8Tags('kep', 'tags-kep'); }
  updateProgress();
}
function onBab8ManChange(val) {
  const c = document.getElementById('cond-man-ya');
  if (c) c.style.display = (val === 'Ya') ? 'block' : 'none';
  if (val !== 'Ya') { _b8Programs.man = []; _renderB8Tags('man', 'tags-man'); }
  updateProgress();
}
function onBab8RegisterFChange(val) {
  const c = document.getElementById('cond-register-f-ya');
  if (c) c.style.display = (val === 'Ya') ? 'block' : 'none';
  if (val !== 'Ya') { const f = document.getElementById('f8-alasan-register-f'); if (f) f.value = ''; }
  updateProgress();
}

/* ── loadTab7 — Tanggapan Berbagai Pihak ── */
/* ── 9. loadTab7 — Tanggapan Berbagai Pihak ───────────────────── */
function loadTab7(data) {
  if (!data) return;
  function sv(id, val) { var el = document.getElementById(id); if (el) el.value = (val || ''); }
  sv('f7-mengakui', data.mengakui);
  sv('f7-menyesal', data.menyesal);
  sv('f7-keluarga-mendukung', data.keluarga_mendukung);
  sv('f7-alasan-keluarga', data.alasan_tidak_mendukung);
  sv('f7-masyarakat-mendukung', data.masyarakat_mendukung);
  sv('f7-pemerintah-mendukung', data.pemerintah_mendukung);
  // Load tanggapan korban (multi-korban)
  var tk = data.tanggapan_korban || ((data.riwayat_pidana || {}).tanggapan_korban) || {};
  var daftarTg = tk.daftar_tanggapan || [];
  // Backward compat: old single-tanggapan → wrap in array
  if (daftarTg.length === 0 && (tk.bisa_dihubungi || tk.memaafkan)) {
    daftarTg = [{ bisa_dihubungi: tk.bisa_dihubungi || '', memaafkan: tk.memaafkan || '', mendukung_program: tk.mendukung_program || '' }];
  }
  // Sync cards first (from Bab VI korban data), then fill tanggapan values
  syncTanggapanKorbanCards();
  // Map tanggapan data to matching tanggapan cards
  // daftarTg is parallel to daftar_korban; tanggapan cards are only for perorangan/badan hukum
  var tgCards = document.querySelectorAll('#tanggapan-korban-list-container .tanggapan-card');
  var tgIdx = 0;
  daftarTg.forEach(function (tg) {
    if (!tg || !tg.bisa_dihubungi) return; // skip empty (non-perorangan) entries
    if (tgIdx >= tgCards.length) return;
    var tc = tgCards[tgIdx]; tgIdx++;
    var selTh = tc.querySelector('.tg-terhubungi');
    if (selTh) selTh.value = tg.bisa_dihubungi || '';
    var condYa = tc.querySelector('.tg-cond-ya');
    if (condYa) condYa.style.display = (tg.bisa_dihubungi === 'Ya') ? 'block' : 'none';
    var selM = tc.querySelector('.tg-memaafkan');
    if (selM) selM.value = tg.memaafkan || '';
    var selD = tc.querySelector('.tg-dukungan');
    if (selD) selD.value = tg.mendukung_program || '';
  });
  try { if (typeof onKeluargaMendukungChange === 'function') onKeluargaMendukungChange(data.keluarga_mendukung || ''); } catch (_e) { }
}
window.loadTab7 = loadTab7;

/* ══════════════════════════════════════════
   TAB VIII — EVALUASI PERKEMBANGAN PEMBINAAN
══════════════════════════════════════════ */
function validateTab8() {
  const missing = []; const pfx = 'Evaluasi > ';
  const _v = id => (document.getElementById(id) || {}).value || '';
  if (!_v('f8-admisi')) missing.push(pfx + 'Pelaksanaan Admisi & Orientasi');
  if (!_v('f8-sepertiga')) missing.push(pfx + 'Tanggal 1/3 Masa Pembinaan');
  if (!_v('f8-setengah')) missing.push(pfx + 'Tanggal 1/2 Masa Pembinaan');
  if (!_v('f8-duapertiga')) missing.push(pfx + 'Tanggal 2/3 Masa Pembinaan');
  if (!_v('f8-kep-status')) missing.push(pfx + 'Opsi Pembinaan Kepribadian');
  if (_v('f8-kep-status') === 'Ya' && !_b8Programs.kep.length) missing.push(pfx + 'Daftar Pembinaan Kepribadian masih kosong');
  if (!_v('f8-man-status')) missing.push(pfx + 'Opsi Pembinaan Kemandirian');
  if (_v('f8-man-status') === 'Ya' && !_b8Programs.man.length) missing.push(pfx + 'Daftar Pembinaan Kemandirian masih kosong');
  if (!_v('f8-sesama-wbp')) missing.push(pfx + 'Hubungan dengan Sesama Warga Binaan');
  if (!_v('f8-petugas')) missing.push(pfx + 'Hubungan dengan Petugas Lapas');
  if (!_v('f8-hub-keluarga')) missing.push(pfx + 'Status Hubungan dengan Keluarga');
  if (!_v('f8-hub-masyarakat')) missing.push(pfx + 'Status Hubungan dengan Masyarakat');
  if (!_v('f8-teman-berkunjung')) missing.push(pfx + 'Pernah Dikunjungi Teman?');
  if (!_v('f8-teman-telepon')) missing.push(pfx + 'Pernah Berkomunikasi Telepon dengan Teman?');
  if (!_v('f8-register-f')) missing.push(pfx + 'Pernah Masuk Register F?');
  if (_v('f8-register-f') === 'Ya' && !_v('f8-alasan-register-f')) missing.push(pfx + 'Alasan Masuk Register F');
  return missing;
}
function collectTab8() {
  const _v = id => (document.getElementById(id) || {}).value || '';
  const kepSt = _v('f8-kep-status'), manSt = _v('f8-man-status');
  return {
    evaluasi_pembinaan: {
      admisi_orientasi: _v('f8-admisi'),
      masa_pembinaan: { sepertiga: _v('f8-sepertiga'), setengah: _v('f8-setengah'), duapertiga: _v('f8-duapertiga') },
      Pembinaan_Kepribadian: { status: kepSt, daftar: kepSt === 'Ya' ? _b8Programs.kep.slice() : [] },
      Pembinaan_Kemandirian: { status: manSt, daftar: manSt === 'Ya' ? _b8Programs.man.slice() : [] },
      hubungan_sosial: {
        sesama_wbp: _v('f8-sesama-wbp'), dengan_petugas: _v('f8-petugas'),
        dengan_keluarga: { status: _v('f8-hub-keluarga'), kunjungan: _b8Tags.kunjungan.slice(), telepon: _b8Tags.telepon.slice() },
        dengan_masyarakat: { status: _v('f8-hub-masyarakat'), teman_berkunjung: _v('f8-teman-berkunjung'), teman_telepon: _v('f8-teman-telepon') }
      },
      register_f: { pernah_masuk: _v('f8-register-f'), alasan: _v('f8-alasan-register-f') }
    }
  };
}
function loadTab8(data) {
  if (!data) return;
  const ev = data.evaluasi_pembinaan || {};
  const mp = ev.masa_pembinaan || {};
  const kep = ev.Pembinaan_Kepribadian || {};
  const man = ev.Pembinaan_Kemandirian || {};
  const hs = ev.hubungan_sosial || {};
  const hk = hs.dengan_keluarga || {};
  const hm = hs.dengan_masyarakat || {};
  const rf = ev.register_f || {};
  function set(id, val) { const el = document.getElementById(id); if (el && val != null) el.value = String(val); }
  set('f8-admisi', ev.admisi_orientasi || '');
  set('f8-sepertiga', mp.sepertiga || ''); set('f8-setengah', mp.setengah || ''); set('f8-duapertiga', mp.duapertiga || '');
  set('f8-kep-status', kep.status || ''); onBab8KepChange(kep.status || '');
  if (kep.status === 'Ya' && Array.isArray(kep.daftar)) { _b8Programs.kep = kep.daftar.slice(); _renderB8Tags('kep', 'tags-kep'); }
  set('f8-man-status', man.status || ''); onBab8ManChange(man.status || '');
  if (man.status === 'Ya' && Array.isArray(man.daftar)) { _b8Programs.man = man.daftar.slice(); _renderB8Tags('man', 'tags-man'); }
  set('f8-sesama-wbp', hs.sesama_wbp || ''); set('f8-petugas', hs.dengan_petugas || '');
  set('f8-hub-keluarga', hk.status || '');
  if (Array.isArray(hk.kunjungan)) { _b8Tags.kunjungan = hk.kunjungan.slice(); _renderB8Tags('kunjungan', 'tags-kunjungan'); }
  if (Array.isArray(hk.telepon)) { _b8Tags.telepon = hk.telepon.slice(); _renderB8Tags('telepon', 'tags-telepon'); }
  set('f8-hub-masyarakat', hm.status || ''); set('f8-teman-berkunjung', hm.teman_berkunjung || ''); set('f8-teman-telepon', hm.teman_telepon || '');
  set('f8-register-f', rf.pernah_masuk || ''); onBab8RegisterFChange(rf.pernah_masuk || '');
  if (rf.pernah_masuk === 'Ya') set('f8-alasan-register-f', rf.alasan || '');
  updateProgress();
}

/* ══════════════════════════════════════════
   BAB IX JS — Asesmen RRI & Kriminogenik
══════════════════════════════════════════ */
const RRI_A = [
  { q: "Apakah pada saat narapidana/klien pemasyarakatan pertama kali ditahan masih berusia 16 tahun atau dibawah 16 tahun?", opsi: { "Tidak = 0": 0, "Ya = 3": 3 } },
  { q: "Apakah narapidana/klien pemasyarakatan pernah dihukum oleh pengadilan dan divonis hukuman penjara?", opsi: { "Tidak = 0": 0, "Ya = 1": 1 } },
  { q: "Berapa jumlah pasal yang dipidanakan kepada narapidana/klien pemasyarakatan untuk kejahatan saat ini?", opsi: { "1-2 Pasal = 0": 0, "3+ Pasal = 1": 1 } },
  { q: "Apakah narapidana/klien pemasyarakatan pernah melakukan pelanggaran ketika sedang menjalani program reintegrasi?", opsi: { "Tidak = 0": 0, "Ya = 1": 1 } },
  { q: "Apakah narapidana/klien pemasyarakatan pernah mendapatkan vonis sebelumnya?", opsi: { "Tidak = 0": 0, "1-2 Kali = 2": 2, "3+ Kali = 4": 4 } },
  { q: "Apakah ada catatan perilaku buruk/menyimpang yang dilakukan oleh narapidana/klien pemasyarakatan selama berada di dalam Rutan/Lapas?", opsi: { "Tidak = 0": 0, "Ya = 1": 1 } },
  { q: "Apakah narapidana/klien pemasyarakatan pernah diskors atau dikeluarkan dari sekolah?", opsi: { "Tidak = 0": 0, "Ya = 1": 1 } },
  { q: "Apakah ada anggota keluarga dan/atau pasangan narapidana/klien pemasyarakatan yang pernah diproses secara hukum/mendapatkan vonis dari Hakim?", opsi: { "Tidak = 0": 0, "Ya = 1": 1 } },
  { q: "Apakah narapidana/klien pemasyarakatan pernah menggunakan narkotika/obat-obatan dan/atau mengonsumsi minuman beralkohol secara berlebihan?", opsi: { "Tidak = 0": 0, "Alkohol = 1": 1, "Narkotika = 2": 2, "Keduanya = 3": 3 } },
  { q: "Apakah narapidana/klien pemasyarakatan pernah menganggur secara terus menerus/berturut-turut selama 12 bulan atau lebih?", opsi: { "Tidak = 0": 0, "Ya = 1": 1 } }
];
const RRI_B = [
  { q: "1. Tindak pidana ini merupakan peningkatan dari sebelumnya?", opsi: { "Tidak": 0, "Ya": 1 } },
  { q: "2. Ada sejarah tindak kekerasan yang dilakukan sebelum 15 tahun?", opsi: { "Tidak": 0, "Ya": 1 } },
  { q: "3. Pernah menjadi pelaku atau korban KDRT?", opsi: { "Tidak": 0, "Ya": 1 } },
  { q: "4. Pernah melakukan kekerasan seksual/terorisme baik sekarang atau sebelumnya?", opsi: { "Tidak": 0, "Ya": 1 } }
];
const RRI_C = [
  { q: "1. Melahirkan sebelum usia 20 tahun?", opsi: { "Tidak": 0, "Ya": 1 } },
  { q: "2. Pernah bermasalah dalam merawat/membesarkan anak?", opsi: { "Tidak": 0, "Ya": 1 } },
  { q: "3. Pernah terlibat dalam jaringan prostitusi?", opsi: { "Tidak": 0, "Ya": 1 } }
];
const RRI_D = [
  { q: "1. Pernah terlibat jaringan pengedar?", opsi: { "Tidak": 0, "Ya": 1 } },
  { q: "2. Mewajarkan dan membenarkan penggunaan narkoba?", opsi: { "Tidak": 0, "Ya": 1 } },
  { q: "3. Riwayat penggunaan narkotika rutin/berulang?", opsi: { "Tidak": 0, "Ya": 1 } }
];
const KRIM_VALUE_MAP = {
  keluarga: {
    label: "1. Keluarga dan Pernikahan", max: 6, pertanyaan: {
      "Mempunyai hubungan yang baik dengan pasangan mereka?": { "Tidak = 2": 2, "Sebagian = 1": 1, "Ya = 0": 0 },
      "Mempunyai hubungan yang baik dengan orangtua atau wali mereka?": { "Tidak = 2": 2, "Salah satu = 1": 1, "Keduanya = 0": 0 },
      "Mempunyai hubungan yang baik dengan anggota keluarga lainnya?": { "Tidak = 2": 2, "Sebagian = 1": 1, "Ya = 0": 0 }
    }
  },
  pendidikan: {
    label: "2. Pendidikan dan Pekerjaan", max: 11, pertanyaan: {
      "Bisa membaca dan menulis?": { "Tidak = 1": 1, "Ya = 0": 0 },
      "Menyelesaikan pendidikan yang tinggi?": { "Tidak = 1": 1, "Ya = 0": 0 },
      "Menganggur sebelum menjalani pidana sekarang?": { "Tidak = 0": 0, "Ya = 1": 1 },
      "Mengikuti program pembinaan kemandirian 12 bulan terakhir?": { "Tidak = 1": 1, "Ya = 0": 0 },
      "Menghabiskan setengah waktunya dalam keadaan menganggur?": { "Tidak = 0": 0, "Ya = 1": 1 },
      "Kegiatannya di tempat kerja/sekolah/universitas bermakna?": { "Tidak = 2": 2, "Perlu dikembangkan = 1": 1, "Ya = 0": 0 },
      "Hubungan baik dengan rekan kerja atau teman sekolah/kuliah?": { "Tidak = 2": 2, "Perlu dikembangkan = 1": 1, "Ya = 0": 0 },
      "Hubungan baik dengan atasan atau pengajar?": { "Tidak = 2": 2, "Perlu dikembangkan = 1": 1, "Ya = 0": 0 }
    }
  },
  narkoba: {
    label: "3. Penggunaan Narkotika, Obat-Obatan Terlarang, dan Konsumsi Alkohol", max: 6, pertanyaan: {
      "Menggunakan narkotika dan/atau alkohol sebelumnya?": { "Tidak = 0": 0, "Ya = 1": 1 },
      "Tindakan kriminal disebabkan oleh narkotika dan/atau alkohol?": { "Tidak = 0": 0, "Ya = 1": 1 },
      "Menggunakan narkotika/alkohol selama di Lapas/Rutan, atau pada saat menjalani program reintegrasi?": { "Tidak = 0": 0, "Ya = 1": 1 },
      "Penggunaan narkotika/alkohol berdampak negatif pada pekerjaan dan/atau pendidikannya?": { "Tidak = 0": 0, "Ya = 1": 1 },
      "Penggunaan narkotika/alkohol berdampak negatif pada hubungan dengan pasangan, dan/atau hubungan dengan anggota keluarga?": { "Tidak = 0": 0, "Ya = 1": 1 },
      "Penggunaan narkotika/alkohol berdampak negatif pada kesehatan dirinya?": { "Tidak = 0": 0, "Ya = 1": 1 }
    }
  },
  sosial: {
    label: "4. Hubungan Sosial", max: 5, pertanyaan: {
      "Melakukan tindak kriminal dengan teman/rekan?": { "Ya = 1": 1, "Tidak = 0": 0 },
      "Anggota dari suatu kelompok/organisasi/grup yang melakukan aktivitas kriminal?": { "Ya = 1": 1, "Tidak = 0": 0 },
      "Mempunyai teman selama di dalam Lapas/Rutan?": { "Ya = 0": 0, "Tidak = 1": 1 },
      "Mempunyai teman dan rekan yang pro-sosial?": { "Ya = 0": 0, "Terbatas = 1": 1, "Tidak = 2": 2 }
    }
  },
  waktu: {
    label: "5. Waktu Luang/Rekreasi", max: 2, pertanyaan: {
      "Melibatkan diri dalam kegiatan yang konstruktif dan bermanfaat?": { "Ya = 0": 0, "Tidak = 1": 1 },
      "Memiliki terlalu banyak waktu luang?": { "Tidak = 0": 0, "Ya = 1": 1 }
    }
  },
  keuangan: {
    label: "6. Manajemen Keuangan", max: 2, pertanyaan: {
      "Kesulitan keuangan menjadi penyebab melakukan tindak pidana?": { "Tidak = 0": 0, "Ya = 1": 1 },
      "Memiliki hutang yang sulit dibayarnya?": { "Tidak = 0": 0, "Ya = 1": 1 }
    }
  },
  sikap: {
    label: "7. Sikap Anti-Sosial/Pandangan terhadap Tindak Kriminal", max: 7, pertanyaan: {
      "Memiliki sikap/penilaian negatif terhadap Sistem Peradilan Pidana?": { "Tidak = 0": 0, "Ya = 1": 1 },
      "Menunjukkan rasa empati terhadap korban?": { "Tidak = 2": 2, "Sedikit = 1": 1, "Ya = 0": 0 },
      "Memiliki riwayat kejahatan menggunakan kekerasan dan/atau kejahatan amoral yang berulang?": { "Tidak = 0": 0, "Perhatian = 1": 1, "Ya = 2": 2 },
      "Memiliki sikap negatif terhadap rehabilitasi/program layanan lainnya?": { "Tidak = 0": 0, "Ya = 1": 1 },
      "Meyakini kejahatan adalah cara sah untuk memenuhi kebutuhan?": { "Tidak = 0": 0, "Ya = 1": 1 }
    }
  }
};
const KRIM_ORDER = ['keluarga', 'pendidikan', 'narkoba', 'sosial', 'waktu', 'keuangan', 'sikap'];

/* Build RRI question rows */
function _buildRRIRows(listDef, containerId, prefix) {
  const c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = listDef.map((item, i) => {
    const opts = Object.keys(item.opsi).map(k => `<option value="${k}">${k}</option>`).join('');
    return `<div class="rri-q-row">
      <div class="rri-q-text">${item.q}</div>
      <select class="fsel" id="${prefix}-${i}" style="min-width:160px;flex-shrink:0;max-width:none!important" onchange="updateProgress();_updateKrimVis()">
        <option value="">&#8212; Pilih &#8212;</option>${opts}
      </select>
    </div>`;
  }).join('');
}

/* Build Kriminogenik sections */
function _buildKrimSections() {
  const c = document.getElementById('krim-sections'); if (!c) return;
  c.innerHTML = KRIM_ORDER.map(kat => {
    const sec = KRIM_VALUE_MAP[kat];
    const rows = Object.entries(sec.pertanyaan).map(([q, opts], i) => {
      const optsHtml = Object.keys(opts).map(k => `<option value="${k}">${k}</option>`).join('');
      return `<div class="rri-q-row">
        <div class="rri-q-text">${q}</div>
        <select class="fsel" id="krim-${kat}-${i}" style="min-width:200px;flex-shrink:0;max-width:none!important" onchange="updateProgress()">
          <option value="">&#8212;</option>${optsHtml}
        </select>
      </div>`;
    }).join('');
    return `<div class="rri-section" style="margin-bottom:10px">
      <div class="rri-section-hdr">${sec.label}</div>${rows}
    </div>`;
  }).join('');
}

function _rriAScore() {
  return RRI_A.reduce((s, item, i) => {
    const v = document.getElementById('rri-a-' + i)?.value || '';
    return s + (item.opsi[v] ?? 0);
  }, 0);
}
function _rriBHasYa() {
  return RRI_B.some((_, i) => {
    const v = document.getElementById('rri-b-' + i)?.value || '';
    return v === 'Ya';
  });
}
function _rriCHasYa() {
  return RRI_C.some((_, i) => {
    const v = document.getElementById('rri-c-' + i)?.value || '';
    return v === 'Ya';
  });
}
function _isPerempuan() {
  return (document.getElementById('f-jk')?.value || '') === 'Perempuan';
}
function _rriDHasYa() {
  return RRI_D.some((_, i) => {
    const v = document.getElementById('rri-d-' + i)?.value || '';
    return v === 'Ya';
  });
}

function _updateKrimVis() {
  const scoreA = _rriAScore();
  const bYa = _rriBHasYa();
  const cYa = _isPerempuan() && _rriCHasYa();
  const narko = (document.getElementById('f9-narkotika')?.value || '') === 'Ya';
  const show = scoreA >= 7 || bYa || cYa || narko;
  // Validasi Bagian D: jika narkotika=Ya tapi tidak ada satupun Ya di Bagian D
  const dInvalid = document.getElementById('rri-d-invalid');
  if (dInvalid) dInvalid.style.display = (narko && !_rriDHasYa()) ? 'block' : 'none';
  const acc = document.getElementById('acc-9-4');
  if (acc) {
    acc.style.display = show ? '' : 'none';
    const badge = document.getElementById('acc-9-4-badge');
    if (badge) badge.textContent = show ? 'Aktif' : 'Tersembunyi';
  }
  const notice = document.getElementById('krim-skip-notice');
  const noticeText = document.getElementById('krim-skip-text');
  if (notice && noticeText) {
    if (!show) {
      const faktorTidakAda = [];
      faktorTidakAda.push('Faktor Risiko Tambahan');
      if (_isPerempuan()) faktorTidakAda.push('Faktor Risiko Khusus Narapidana/Klien Perempuan');
      if (narko === false || (document.getElementById('f9-narkotika')?.value || '') !== 'Ya') faktorTidakAda.push('Faktor Risiko Khusus Narkotika');
      const faktorStr = faktorTidakAda.length > 1
        ? faktorTidakAda.slice(0, -1).join(', ') + ' dan ' + faktorTidakAda.slice(-1)
        : faktorTidakAda[0];
      noticeText.innerHTML = `Karena Asesmen RRI <strong>Rendah</strong> dan tidak terdapat centang pada ${faktorStr}, tidak perlu mengisi Asesmen Kebutuhan Kriminogenik.`;
      notice.style.display = 'block';
    } else {
      notice.style.display = 'none';
    }
  }
  // ring tab 9 harus diupdate setelah visibility kriminogenik berubah
  if (typeof updateProgress === 'function') updateProgress();
}

function hitungRRI() {
  const score = _rriAScore();
  let kat, cls;
  if (score <= 6) { kat = 'RENDAH (0-6)'; cls = 'rendah'; }
  else if (score <= 11) { kat = 'SEDANG (7-11)'; cls = 'sedang'; }
  else if (score <= 15) { kat = 'TINGGI (12-15)'; cls = 'tinggi'; }
  else { kat = 'SANGAT TINGGI (≥16)'; cls = 'sangat-tinggi'; }
  const el = document.getElementById('rri-a-result');
  if (el) { el.textContent = `Skor: ${score}  |  ${kat}`; el.className = 'rri-skor-badge ' + cls; }
  _updateKrimVis();
}

function onNarkotikaChange(val) {
  const dl = document.getElementById('rri-d-list');
  if (dl) dl.style.display = (val === 'Ya') ? '' : 'none';
  if (val !== 'Ya') {
    const dInvalid = document.getElementById('rri-d-invalid');
    if (dInvalid) dInvalid.style.display = 'none';
  }
  _updateKrimVis();
  updateProgress();
}

function onTambahAsesmenChange(val) {
  const c = document.getElementById('cond-asesmen-ya');
  if (c) c.style.display = (val === 'Ya') ? 'block' : 'none';
  if (val !== 'Ya') {
    ['f9-tempat', 'f9-tgl-pelaksanaan', 'f9-tgl-surat', 'f9-nomor-surat'].forEach(id => {
      const f = document.getElementById(id); if (f) f.value = '';
    });
    _b9Saran.length = 0; _renderSaran();
  }
  updateProgress();
}

const _b9Saran = [];
function _renderSaran() {
  const el = document.getElementById('tags-saran'); if (!el) return;
  el.innerHTML = _b9Saran.map((v, i) =>
    `<span class="b8-tag">${v}<button type="button" class="b8-tag-del" onclick="removeSaran(${i})">×</button></span>`
  ).join('');
}
function addSaranPembinaan() {
  const inp = document.getElementById('f9-saran-input');
  const val = (inp?.value || '').trim(); if (!val) return;
  _b9Saran.push(val); inp.value = ''; inp.focus(); _renderSaran();
}
function removeSaran(idx) { _b9Saran.splice(idx, 1); _renderSaran(); }

function _krimStatus(kat, total) {
  if (kat === 'keluarga') {
    if (total <= 1) return 'RENDAH'; if (total <= 3) return 'SEDANG';
    if (total <= 5) return 'TINGGI'; return 'SANGAT TINGGI';
  } else if (kat === 'pendidikan') {
    if (total <= 2) return 'RENDAH'; if (total <= 6) return 'SEDANG';
    if (total <= 8) return 'TINGGI'; return 'SANGAT TINGGI';
  } else if (kat === 'narkoba') {
    if (total <= 1) return 'RENDAH'; if (total <= 4) return 'SEDANG';
    if (total === 5) return 'TINGGI'; return 'SANGAT TINGGI';
  } else if (kat === 'sosial') {
    if (total <= 1) return 'RENDAH'; if (total <= 3) return 'SEDANG';
    if (total === 4) return 'TINGGI'; return 'SANGAT TINGGI';
  } else if (kat === 'waktu' || kat === 'keuangan') {
    if (total === 0) return 'RENDAH'; if (total === 1) return 'SEDANG'; return 'TINGGI';
  } else if (kat === 'sikap') {
    if (total <= 1) return 'RENDAH'; if (total <= 4) return 'SEDANG';
    if (total <= 6) return 'TINGGI'; return 'SANGAT TINGGI';
  }
  return 'RENDAH';
}
function _statusClass(s) {
  if (s === 'RENDAH') return 'rendah';
  if (s === 'SEDANG') return 'sedang';
  if (s === 'TINGGI') return 'tinggi';
  return 'sangat-tinggi';
}

function hitungKriminogenik() {
  let totalAll = 0;
  let rowsHtml = '';
  KRIM_ORDER.forEach(kat => {
    const sec = KRIM_VALUE_MAP[kat];
    let total = 0;
    Object.entries(sec.pertanyaan).forEach(([, opts], i) => {
      const v = document.getElementById('krim-' + kat + '-' + i)?.value || '';
      total += (opts[v] ?? 0);
    });
    totalAll += total;
    const st = _krimStatus(kat, total);
    const cl = _statusClass(st);
    rowsHtml += `<div class="krim-result-row">
      <div class="krim-result-label">${sec.label}</div>
      <div class="krim-result-score">${total}</div>
      <div class="krim-result-status rri-skor-badge ${cl}">${st}</div>
    </div>`;
  });
  document.getElementById('krim-hasil-rows').innerHTML = rowsHtml;
  let totalSt, totalCl;
  if (totalAll >= 30) { totalSt = 'SANGAT TINGGI (≥30)'; totalCl = 'sangat-tinggi'; }
  else if (totalAll >= 23) { totalSt = 'TINGGI (23-29)'; totalCl = 'tinggi'; }
  else if (totalAll >= 11) { totalSt = 'SEDANG (11-22)'; totalCl = 'sedang'; }
  else { totalSt = 'RENDAH (0-10)'; totalCl = 'rendah'; }
  document.getElementById('krim-total-score').textContent = totalAll;
  const ts = document.getElementById('krim-total-status');
  ts.textContent = totalSt; ts.className = 'rri-skor-badge ' + totalCl;
  document.getElementById('krim-hasil').style.display = '';
}

/* ══════════════════════════════════════════
   TAB IX — HASIL/REKOMENDASI ASESMEN (RRI)
══════════════════════════════════════════ */
function validateTab9() {
  const missing = []; const pfx = 'Asesmen > ';
  const _v = id => (document.getElementById(id) || {}).value || '';
  RRI_A.forEach((_, i) => { if (!_v('rri-a-' + i)) missing.push(pfx + `Faktor Utama Pertanyaan A.${i + 1}`); });
  RRI_B.forEach((_, i) => { if (!_v('rri-b-' + i)) missing.push(pfx + `Faktor Tambahan Pertanyaan B.${i + 1}`); });
  if (_isPerempuan()) RRI_C.forEach((_, i) => { if (!_v('rri-c-' + i)) missing.push(pfx + `Khusus Perempuan Pertanyaan C.${i + 1}`); });
  if (!_v('f9-narkotika')) missing.push(pfx + 'Terkait Tindak Pidana Narkotika');
  if (!_v('f9-tambah-asesmen')) missing.push(pfx + 'Opsi Tambahkan Lampiran Laporan Asesmen');
  if (_v('f9-tambah-asesmen') === 'Ya') {
    if (!_v('f9-tempat')) missing.push(pfx + 'Tempat Pelaksanaan Asesmen');
    if (!_v('f9-tgl-pelaksanaan')) missing.push(pfx + 'Tanggal Pelaksanaan Asesmen');
    if (!_v('f9-tgl-surat')) missing.push(pfx + 'Tanggal Surat Tugas');
    if (!_v('f9-nomor-surat')) missing.push(pfx + 'Nomor Surat Tugas');
  }
  return missing;
}

function collectTab9() {
  const _v = id => (document.getElementById(id) || {}).value || '';
  const jkPer = _isPerempuan();
  const narko = _v('f9-narkotika');
  const tambah = _v('f9-tambah-asesmen');
  const mkA = pertA => ({
    nomor: pertA.idx + 1, isi: RRI_A[pertA.idx].q,
    jawaban: pertA.val, nilai: RRI_A[pertA.idx].opsi[pertA.val] ?? 0
  });
  const rriAItems = RRI_A.map((_, i) => { const v = _v('rri-a-' + i); return { nomor: i + 1, isi: RRI_A[i].q, jawaban: v, nilai: RRI_A[i].opsi[v] ?? 0 }; });
  const rriBItems = RRI_B.map((_, i) => { const v = _v('rri-b-' + i); return { nomor: i + 1, isi: RRI_B[i].q, jawaban: v, nilai: RRI_B[i].opsi[v] ?? 0 }; });
  const rriCItems = jkPer ? RRI_C.map((_, i) => { const v = _v('rri-c-' + i); return { nomor: i + 1, isi: RRI_C[i].q, jawaban: v, nilai: RRI_C[i].opsi[v] ?? 0 }; }) : null;
  const rriDItems = narko === 'Ya' ? RRI_D.map((_, i) => { const v = _v('rri-d-' + i); return { nomor: i + 1, isi: RRI_D[i].q, jawaban: v, nilai: RRI_D[i].opsi[v] ?? 0 }; }) : null;
  const krimData = {};
  KRIM_ORDER.forEach(kat => {
    const sec = KRIM_VALUE_MAP[kat];
    const pertanyaan = Object.entries(sec.pertanyaan).map(([q, opts], i) => {
      const v = _v('krim-' + kat + '-' + i);
      return { nomor: i + 1, isi: q, jawaban: v, nilai: opts[v] ?? 0 };
    });
    krimData[kat] = { pertanyaan, total_skor: pertanyaan.reduce((s, p) => s + p.nilai, 0) };
  });
  return {
    asesmen_rri: {
      bagian_a: { pertanyaan: rriAItems, total_skor: rriAItems.reduce((s, p) => s + p.nilai, 0) },
      bagian_b: { pertanyaan: rriBItems, total_skor: rriBItems.reduce((s, p) => s + p.nilai, 0) },
      bagian_c: rriCItems ? { pertanyaan: rriCItems, total_skor: rriCItems.reduce((s, p) => s + p.nilai, 0) } : null,
      bagian_d: { pertanyaan_utama: narko, pertanyaan_lanjutan: rriDItems, total_skor: rriDItems ? rriDItems.reduce((s, p) => s + p.nilai, 0) : 0 }
    },
    asesmen_kriminogenik: krimData,
    pelaksanaan_asesmen: {
      tambahkan_laporan: tambah,
      tempat: _v('f9-tempat'),
      tanggal_pelaksanaan: _v('f9-tgl-pelaksanaan'),
      tanggal_surat: _v('f9-tgl-surat'),
      nomor_surat: _v('f9-nomor-surat'),
      saran_pembinaan: _b9Saran.slice()
    }
  };
}

function loadTab9(data) {
  if (!data) return;
  // Pastikan DOM RRI sudah di-build sebelum set nilai
  try { if (typeof _initTab9 === 'function') _initTab9(); } catch (_e) { }
  const rri = data.asesmen_rri || {};
  const pa = rri.bagian_a || {};
  const pb = rri.bagian_b || {};
  const pc = rri.bagian_c || {};
  const pd = rri.bagian_d || {};
  function set(id, val) { const el = document.getElementById(id); if (el && val != null) el.value = String(val); }
  (pa.pertanyaan || []).forEach((p, i) => set('rri-a-' + i, p.jawaban || ''));
  (pb.pertanyaan || []).forEach((p, i) => set('rri-b-' + i, p.jawaban || ''));
  if (pc && pc.pertanyaan) (pc.pertanyaan || []).forEach((p, i) => set('rri-c-' + i, p.jawaban || ''));
  if (pd) {
    const nv = pd.pertanyaan_utama || '';
    set('f9-narkotika', nv);
    // Set nilai rri-d DULU sebelum onNarkotikaChange, supaya _rriDHasYa() sudah benar
    // saat _updateKrimVis dipanggil dari dalam onNarkotikaChange
    if (nv === 'Ya') (pd.pertanyaan_lanjutan || []).forEach((p, i) => set('rri-d-' + i, p.jawaban || ''));
    onNarkotikaChange(nv);
  }
  // Kriminogenik
  const kd = data.asesmen_kriminogenik || {};
  KRIM_ORDER.forEach(kat => {
    const sec = kd[kat] || {};
    (sec.pertanyaan || []).forEach((p, i) => set('krim-' + kat + '-' + i, p.jawaban || ''));
  });
  // Pelaksanaan asesmen
  const pa2 = data.pelaksanaan_asesmen || {};
  const tv = pa2.tambahkan_laporan || '';
  set('f9-tambah-asesmen', tv); onTambahAsesmenChange(tv);
  if (tv === 'Ya') {
    set('f9-tempat', pa2.tempat || '');
    set('f9-tgl-pelaksanaan', pa2.tanggal_pelaksanaan || pa2.Tanggal_Pelaksanaan || '');
    set('f9-tgl-surat', pa2.tanggal_surat || '');
    set('f9-nomor-surat', pa2.nomor_surat || '');
    if (Array.isArray(pa2.saran_pembinaan)) {
      _b9Saran.length = 0; pa2.saran_pembinaan.forEach(s => _b9Saran.push(s)); _renderSaran();
    }
  }
  // Re-run hitung
  hitungRRI();
  _updateKrimVis();
  // Hitung kriminogenik otomatis jika acc-9-4 aktif (ada data krim yang diload)
  const krimAccEl = document.getElementById('acc-9-4');
  if (krimAccEl && krimAccEl.style.display !== 'none') {
    if (typeof hitungKriminogenik === 'function') hitungKriminogenik();
  }
  updateProgress();
}

/* Init BAB IX DOM on DOMContentLoaded */
function _initTab9() {
  _buildRRIRows(RRI_A, 'rri-a-list', 'rri-a');
  _buildRRIRows(RRI_B, 'rri-b-list', 'rri-b');
  _buildRRIRows(RRI_C, 'rri-c-list', 'rri-c');
  _buildRRIRows(RRI_D, 'rri-d-list', 'rri-d');
  _buildKrimSections();
  // Tampilkan Section C hanya jika perempuan
  function _syncC() {
    const acc = document.getElementById('acc-9-2');
    if (acc) acc.style.display = _isPerempuan() ? '' : 'none';
    _updateKrimVis();
  }
  _syncC();
  const jkEl = document.getElementById('f-jk');
  if (jkEl) { jkEl.addEventListener('change', _syncC); jkEl.addEventListener('input', _syncC); }
}
document.addEventListener('DOMContentLoaded', _initTab9);
setTimeout(_initTab9, 400);

/* Hook _updateKorbanLimpahkanVis into onTogglePelimpahan */
(function () {
  const _origP = window.onTogglePelimpahan;
  window.onTogglePelimpahan = function (val) {
    if (typeof _origP === 'function') _origP.call(this, val);
    _updateKorbanLimpahkanVis();
  };
})();
document.addEventListener('DOMContentLoaded', _updateKorbanLimpahkanVis);
setTimeout(_updateKorbanLimpahkanVis, 300);

function showToast(msg) {
  toast(msg);
}

/* ══════════════════════════════════════════════════════
   BAB X — ANALISIS
   Sesuai integrasi.py baris 18660–18717 (tab_analisis)
══════════════════════════════════════════════════════ */

function onTemplateAnalisisChange() {
  const val = (document.getElementById('f10-template-analisis')?.value || '');
  document.getElementById('info-template-ya').style.display = (val === 'Ya') ? 'block' : 'none';
  document.getElementById('info-template-tidak').style.display = (val === 'Tidak') ? 'block' : 'none';
  // Tampilkan/sembunyikan acc-11-0 (Kesimpulan template)
  const acc11_0 = document.getElementById('acc-11-0');
  if (acc11_0) acc11_0.style.display = (val === 'Ya') ? '' : 'none';
  syncKesimpulanCDVisibility();
  updateProgress();
}

/* ══════════════════════════════════════════
   TAB X — ANALISIS
══════════════════════════════════════════ */
function collectTab10() {
  const v = id => (document.getElementById(id)?.value || '').trim();
  return { template_analisis: v('f10-template-analisis') };
}

function loadTab10(data) {
  if (!data) return;
  const el = document.getElementById('f10-template-analisis');
  if (el) el.value = String(data.template_analisis || '');
  onTemplateAnalisisChange();
  updateProgress();
}

function validateTab10() {
  const missing = [];
  if (!(document.getElementById('f10-template-analisis')?.value || '').trim())
    missing.push('Analisis > Gunakan Template Analisis');
  return missing;
}

/* ══════════════════════════════════════════════════════
   BAB XI — KESIMPULAN DAN REKOMENDASI
   Sesuai integrasi.py baris 18720–18859
══════════════════════════════════════════════════════ */

/* ── Kesimpulan pill toggle ── */
function setKesimpulan(hiddenId, btn, val) {
  const hidden = document.getElementById(hiddenId);
  if (!hidden) return;
  const wasActive = (hidden.value === val);
  hidden.value = wasActive ? '' : val;
  // update pill styles
  const container = btn.closest('.ksim-val-opts');
  if (container) {
    container.querySelectorAll('.ksim-pill').forEach(p => {
      p.classList.remove('active-setuju', 'active-tidak');
    });
    if (!wasActive) {
      if (val.startsWith('mendukung')) btn.classList.add('active-setuju');
      else btn.classList.add('active-tidak');
    }
  }
  updateProgress();
}

function _syncKesimpulanPillUI(hiddenId) {
  const hidden = document.getElementById(hiddenId);
  if (!hidden) return;
  const val = hidden.value || '';
  const container = document.querySelector(`.ksim-val-opts:has(#${hiddenId})`);
  if (!container) return;
  container.querySelectorAll('.ksim-pill').forEach(p => {
    p.classList.remove('active-setuju', 'active-tidak');
    const onclick = p.getAttribute('onclick') || '';
    const m = onclick.match(/'([^']+)'\)$/);
    if (m && m[1] === val) {
      if (val.startsWith('mendukung')) p.classList.add('active-setuju');
      else p.classList.add('active-tidak');
    }
  });
}

/* ── Sinkron visibility C & D berdasarkan program (pelimpahan) ──
   Sesuai toggle_kesimpulan_cd_visibility() integrasi.py baris 18772 */
function syncKesimpulanCDVisibility() {
  const isPel = _isPelimpahan();
  const tplYa = (document.getElementById('f10-template-analisis')?.value || '') === 'Ya';
  ['lbl-ksim-penerimaan', 'wrap-ksim-penerimaan', 'fdiv-ksim-penerimaan',
    'lbl-ksim-kelayakan', 'wrap-ksim-kelayakan'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = (isPel || !tplYa) ? 'none' : '';
    });
  if (isPel) {
    const hp = document.getElementById('f11-penerimaan-masyarakat');
    const hk = document.getElementById('f11-kelayakan-penjamin');
    if (hp) hp.value = '';
    if (hk) hk.value = '';
  }
}

/* ── Toggle frame TPP Online ── */
function onDaftarTPPChange() {
  const val = (document.getElementById('f11-daftar-tpp')?.value || '');
  const frame = document.getElementById('tpp-online-frame');
  if (frame) frame.classList.toggle('open', val === 'Ya');
}

/* ── Globals for TPP state ── */
let _tppScreenshotB64 = '';
let _tppEntriesData = {};   // key→value from rendered entries
function _resetTPPOnlineState(options = {}) {
  const keepConfig = !!options.keepConfig;
  _tppScreenshotB64 = '';
  _tppEntriesData = {};

  const tbody = document.getElementById('tpp-entries-tbody');
  if (tbody) tbody.innerHTML = '';
  const wrap = document.getElementById('tpp-entries-wrap');
  if (wrap) wrap.style.display = 'none';

  const img = document.getElementById('tpp-screenshot-img');
  const hint = document.getElementById('tpp-screenshot-hint');
  const info = document.getElementById('tpp-screenshot-info');
  if (img) { img.src = ''; img.removeAttribute('src'); img.style.display = 'none'; }
  if (hint) hint.style.display = '';
  if (info) info.textContent = '';

  const fileInp = document.querySelector('input[type="file"][onchange*="onTPPScreenshotUpload"]');
  if (fileInp) fileInp.value = '';

  if (!keepConfig) {
    const daftarEl = document.getElementById('f11-daftar-tpp');
    const urlEl = document.getElementById('f11-form-url');
    if (daftarEl) daftarEl.value = 'Tidak';
    if (urlEl) urlEl.value = '';
    try { onDaftarTPPChange(); } catch (_e) { }
  }
}
function _collectTPPEntries() {
  const result = {};
  document.querySelectorAll('#tpp-entries-tbody .tpp-field-inp').forEach(inp => {
    const key = inp.dataset.key || '';
    if (key) result[key] = inp.value || '';
  });
  return result;
}

/* ── mapDataForTPP()
   Sesuai map_data_for_google_form() integrasi.py baris 12297–12500 ── */
function mapDataForTPP() {
  const v = id => (document.getElementById(id)?.value || '').trim();
  const mapped = {};

  // Nama PK/APK
  mapped['Nama PK/APK'] = v('f-nama-petugas').replace(/\b\w/g, c => c.toUpperCase());

  // Asal Permintaan
  mapped['Asal Permintaan'] = v('f-asal-permintaan');

  // Nama Klien (lengkap bin/binti) — persis Python: hanya bikin patronim jika jk ada
  const namaKlien = v('f-nama-klien').replace(/\b\w/g, c => c.toUpperCase());
  const namaAyah = v('f-nama-ayah').replace(/\b\w/g, c => c.toUpperCase());
  const jk = v('f-jk');
  const statusAyah = v('f-status-ayah');
  let namaLengkap = namaKlien;
  if (namaKlien && namaAyah && jk) {
    const patronim = (jk.toLowerCase() === 'perempuan') ? 'binti' : 'bin';
    const alm = ['tidak', 'meninggal', 'alm', 'almarhum', 'almarhumah'].includes(statusAyah.toLowerCase()) ? 'Alm. ' : '';
    namaLengkap = `${namaKlien} ${patronim} ${alm}${namaAyah}`;
  }
  mapped['Nama Klien'] = namaLengkap;
  mapped['Jenis Klien'] = 'Dewasa';
  mapped['Tanggal Lahir Klien'] = v('f-tgl-lahir');

  // Jenis Litmas — berdasarkan program
  const prog = (v('f-program')).toUpperCase();
  let jenisLitmas = '';
  if (prog.includes('CUTI BERSYARAT')) jenisLitmas = 'Litmas CB';
  else if (prog.includes('PEMBEBASAN BERSYARAT')) jenisLitmas = 'Litmas PB';
  else if (/\bCB\b/.test(prog)) jenisLitmas = 'Litmas CB';
  else if (/\bPB\b/.test(prog)) jenisLitmas = 'Litmas PB';
  else {
    const m = (v('f-nomor-register-litmas') || '').toUpperCase().match(/LIT\.(PB|CB)\//);
    if (m) jenisLitmas = 'Litmas ' + m[1];
  }
  mapped['Jenis Litmas'] = jenisLitmas;

  // Perkara dan Pasal
  const _tppPl = _collectPerkaraList();
  mapped['Perkara dan Pasal'] = _tppPl.map(function (it, i) { return (_tppPl.length > 1 ? (i + 1) + '. ' : '') + it.perkara.replace(/\b\w/g, c => c.toUpperCase()) + (it.pasal ? ' - ' + it.pasal : ''); }).join(' | ');

  // Lama Pidana
  let lamaPidana = v('f-lama-pidana').replace(/\b\w/g, c => c.toUpperCase());
  if (v('f-ada-denda') === 'Ya') {
    const denda = v('f-denda'); const sub = v('f-subsider');
    if (denda) lamaPidana += `, Denda ${denda}`;
    if (sub) lamaPidana += `, Subsider ${sub}`;
  }
  if (v('f-ada-uang-pengganti') === 'Ya') {
    const up = v('f-uang-pengganti');
    if (up) lamaPidana += `, Uang Pengganti ${up}`;
  }
  mapped['Lama Pidana'] = lamaPidana;

  // Nama Penjamin & Hubungan
  const tipePenjamin = v('f-penjamin');
  const penjaminNameMap = {
    'Ayah': v('f-nama-ayah'), 'Ibu': v('f-nama-ibu'),
    'Suami': v('f-nama-suami'), 'Istri': v('f-nama-istri'),
    'Lainnya': v('f-nama-penjamin')
  };
  const namaPenjamin = (penjaminNameMap[tipePenjamin] || '').replace(/\b\w/g, c => c.toUpperCase());
  mapped['Nama Penjamin'] = namaPenjamin;
  mapped['Hubungan Penjamin dan Klien'] =
    (tipePenjamin === 'Lainnya') ? v('f-hubungan-penjamin') : tipePenjamin;

  // Alamat Penjamin
  const alamatMap = {
    'Ayah': v('f-alamat-ayah'), 'Ibu': v('f-alamat-ibu'),
    'Suami': v('f-alamat-suami'), 'Istri': v('f-alamat-istri'),
    'Lainnya': v('f-alamat-penjamin')
  };
  mapped['Alamat'] = alamatMap[tipePenjamin] || v('f-alamat-penjamin') || v('f-alamat') || '';

  // Tahapan MP & Ekspirasi
  mapped['Tahapan 1/3 MP'] = v('f8-sepertiga');
  mapped['Tahapan 1/2 MP'] = v('f8-setengah');
  mapped['Tahapan 2/3 MP'] = v('f8-duapertiga');
  mapped['Ekspirasi'] = v('f-tgl-ekspirasi');

  // Nilai RRI & Kriminogenik — hitung ulang langsung dari DOM (tidak bergantung tombol Hitung)
  const risikoParts = [];

  // Hitung skor Bagian A RRI (persis _rriAScore())
  const scoreA = typeof _rriAScore === 'function' ? _rriAScore() : 0;
  if (scoreA > 0 || document.getElementById('rri-a-0')?.value) {
    let katRRI = 'RENDAH';
    if (scoreA >= 16) katRRI = 'SANGAT TINGGI';
    else if (scoreA >= 12) katRRI = 'TINGGI';
    else if (scoreA >= 7) katRRI = 'SEDANG';
    risikoParts.push(`RRI: ${scoreA} (${katRRI})`);
  }

  // show_krim — persis _updateKrimVis() logic dari Python
  const bYa = typeof _rriBHasYa === 'function' ? _rriBHasYa() : false;
  const cYa = typeof _rriCHasYa === 'function' && typeof _isPerempuan === 'function' ? (_isPerempuan() && _rriCHasYa()) : false;
  const narko = (document.getElementById('f9-narkotika')?.value || '') === 'Ya';
  const showKrim = scoreA >= 7 || bYa || cYa || narko;

  if (!showKrim) {
    risikoParts.push('Kriminogenik: Tidak Dilakukan Asesmen');
  } else {
    // Hitung ulang total kriminogenik dari semua select krim-*
    let totalKrim = 0;
    if (typeof KRIM_ORDER !== 'undefined' && typeof KRIM_VALUE_MAP !== 'undefined') {
      KRIM_ORDER.forEach(kat => {
        const sec = KRIM_VALUE_MAP[kat];
        Object.entries(sec.pertanyaan).forEach(([, opts], i) => {
          const val = document.getElementById('krim-' + kat + '-' + i)?.value || '';
          totalKrim += (opts[val] ?? 0);
        });
      });
    } else {
      // fallback: baca DOM krim-total-score
      const el = document.getElementById('krim-total-score');
      totalKrim = el && el.textContent !== '—' ? parseInt(el.textContent) || 0 : 0;
    }
    let katKrim = 'RENDAH';
    if (totalKrim >= 30) katKrim = 'SANGAT TINGGI';
    else if (totalKrim >= 23) katKrim = 'TINGGI';
    else if (totalKrim >= 11) katKrim = 'SEDANG';
    risikoParts.push(`Kriminogenik: ${totalKrim} (${katKrim})`);
  }
  mapped['Nilai RRI & Kriminogenik dan Kategori'] = risikoParts.join(' | ');

  // Rekomendasi
  const rekVal = (document.getElementById('f11-rekomendasi')?.value || '').trim();
  const progRaw = v('f-program');
  const isPel = progRaw.trim().toLowerCase().startsWith('pelimpahan');
  let progSpesifik = progRaw.replace(/^pelimpahan\s*/i, '').replace(/^integrasi\s*/i, '').trim() || 'Program Integrasi';
  const tujuan = v('f-tujuan-pelimpahan') || '(Tujuan Pelimpahan)';
  if (rekVal === 'Setuju') {
    mapped['Rekomendasi'] = isPel
      ? `Merekomendasikan untuk melimpahkan Laporan Penelitian Kemasyarakatan Program Integrasi ${progSpesifik} ke ${tujuan} untuk diverifikasi dan dilengkapi.`
      : `Merekomendasikan pemberian Program Integrasi ${progSpesifik}`;
  } else if (rekVal === 'Tidak Setuju') {
    mapped['Rekomendasi'] = `Tidak merekomendasikan pemberian Program Integrasi ${progSpesifik}`;
  } else {
    mapped['Rekomendasi'] = '';
  }

  return mapped;
}

function renderTPPEntries(data) {
  const tbody = document.getElementById('tpp-entries-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  Object.entries(data || {}).forEach(([key, val]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td style="color:rgba(var(--tc),.85);font-size:15px;font-weight:600">${key}</td>
      <td><input class="tpp-field-inp" data-key="${key.replace(/"/g, '&quot;')}" value="${String(val || '').replace(/"/g, '&quot;')}" spellcheck="false"></td>`;
    tbody.appendChild(tr);
  });
  _tppEntriesData = Object.assign({}, data);
  document.getElementById('tpp-entries-wrap').style.display = '';
}

function prosesGenerateDataTPP() {
  try {
    if (typeof window.__LIBERO_LAZY_PREPARE_ALL === 'function') {
      window.__LIBERO_LAZY_PREPARE_ALL(1500);
    } else if (typeof window.__LIBERO_LAZY_MOUNT_ALL === 'function') {
      window.__LIBERO_LAZY_MOUNT_ALL();
    }
  } catch (_e) { }
  const mapped = mapDataForTPP();
  renderTPPEntries(mapped);
  toast('Data TPP berhasil dimuat ✓ Silakan periksa sebelum mendaftar.');
}

/* ── bukaGoogleForm() ── */
async function mulaiPendaftaranTPP() {
  const url = (document.getElementById('f11-form-url')?.value || '').trim();
  if (!url || !url.startsWith('http')) {
    toastWarning('URL Google Form tidak valid');
    return;
  }

  const updatedData = _collectTPPEntries();
  if (!updatedData || !Object.keys(updatedData).length) {
    toastWarning("Silakan klik tombol 'Muat & Tampilkan Data TPP' terlebih dahulu.");
    return;
  }

  toastProgress('Mendaftarkan TPP ke Google Form...');

  const result = await _py('daftarkan_tpp', {
    form_url: url,
    data: updatedData
  });

  if (!result) {
    toastError('Bridge Python TPP tidak tersedia. Pastikan method daftarkan_tpp ada di IntegrasiAPI.');
    return;
  }

  if (!result.ok) {
    toastError(result.err || 'Pendaftaran TPP gagal');
    return;
  }

  if (result.screenshot) {
    _tppScreenshotB64 = result.screenshot;

    const img = document.getElementById('tpp-screenshot-img');
    const hint = document.getElementById('tpp-screenshot-hint');
    const info = document.getElementById('tpp-screenshot-info');

    if (img) {
      img.src = _tppScreenshotB64;
      img.style.display = '';
    }
    if (hint) hint.style.display = 'none';
    if (info) info.textContent = result.path || '';
  }

  toastSuccess('Pendaftaran TPP telah berhasil!');
}

function _dataUrlApproxBytes(dataUrl) {
  try {
    const b64 = String(dataUrl || '').split(',')[1] || '';
    const pad = (b64.match(/=+$/) || [''])[0].length;
    return Math.max(0, Math.floor((b64.length * 3) / 4) - pad);
  } catch (_e) {
    return 0;
  }
}

function _fmtKB(bytes) {
  return `${Math.max(1, Math.round((bytes || 0) / 1024))} KB`;
}

function _compressImageFile(file, opts = {}) {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    mime = 'image/jpeg',
    quality = 0.78,
    fill = '#ffffff'
  } = opts || {};

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      const src = e.target.result;
      const img = new Image();

      img.onload = () => {
        try {
          let sw = img.naturalWidth || img.width || 0;
          let sh = img.naturalHeight || img.height || 0;
          if (!sw || !sh) {
            resolve({
              dataUrl: src,
              origBytes: file.size || 0,
              newBytes: file.size || 0,
              width: sw,
              height: sh
            });
            return;
          }

          const scale = Math.min(1, maxWidth / sw, maxHeight / sh);
          const tw = Math.max(1, Math.round(sw * scale));
          const th = Math.max(1, Math.round(sh * scale));

          const canvas = document.createElement('canvas');
          canvas.width = tw;
          canvas.height = th;

          const ctx = canvas.getContext('2d', { alpha: true });
          if (!ctx) {
            resolve({
              dataUrl: src,
              origBytes: file.size || 0,
              newBytes: file.size || 0,
              width: sw,
              height: sh
            });
            return;
          }

          if (mime === 'image/jpeg') {
            ctx.fillStyle = fill;
            ctx.fillRect(0, 0, tw, th);
          }

          ctx.drawImage(img, 0, 0, tw, th);

          let out = src;
          try {
            out = canvas.toDataURL(mime, quality);
          } catch (_e) {
            out = src;
          }

          resolve({
            dataUrl: out,
            origBytes: file.size || 0,
            newBytes: _dataUrlApproxBytes(out),
            width: tw,
            height: th
          });
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => resolve({
        dataUrl: src,
        origBytes: file.size || 0,
        newBytes: file.size || 0,
        width: 0,
        height: 0
      });

      img.src = src;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── TPP Screenshot upload ── */
async function onTPPScreenshotUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;

  try {
    const packed = await _compressImageFile(file, {
      maxWidth: 1400,
      maxHeight: 1400,
      mime: 'image/jpeg',
      quality: 0.72
    });

    _tppScreenshotB64 = packed.dataUrl;

    const img = document.getElementById('tpp-screenshot-img');
    const hint = document.getElementById('tpp-screenshot-hint');
    const info = document.getElementById('tpp-screenshot-info');

    if (img) {
      img.src = _tppScreenshotB64;
      img.style.display = '';
    }
    if (hint) hint.style.display = 'none';
    if (info) {
      info.textContent = `${file.name} (${_fmtKB(packed.origBytes)} → ${_fmtKB(packed.newBytes)})`;
    }

    toast('Screenshot bukti TPP berhasil diunggah ✓');
  } catch (_e) {
    toastError('Gagal memproses screenshot bukti TPP.');
  }
}

/* ══════════════════════════════════════════
   TAB XI — KESIMPULAN DAN REKOMENDASI
══════════════════════════════════════════ */
function collectTab11() {
  const v = id => (document.getElementById(id)?.value || '').trim();
  const isPel = _isPelimpahan();
  const tplYa = (document.getElementById('f10-template-analisis')?.value || '') === 'Ya';
  return {
    sikap_klien: tplYa ? v('f11-sikap-klien') : '',
    hasil_pembinaan: tplYa ? v('f11-hasil-pembinaan') : '',
    penerimaan_masyarakat: (tplYa && !isPel) ? v('f11-penerimaan-masyarakat') : '',
    kelayakan_penjamin: (tplYa && !isPel) ? v('f11-kelayakan-penjamin') : '',
    rekomendasi: v('f11-rekomendasi'),
    tgl_sidang_tpp: v('f11-tgl-sidang-tpp'),
    tanggal_sidang_tpp: v('f11-tgl-sidang-tpp'),
    tpp_online: {
      daftar: document.getElementById('f11-daftar-tpp')?.value || 'Tidak',
      form_url: v('f11-form-url'),
      data: _collectTPPEntries(),
      screenshot: _tppScreenshotB64
    }
  };
}

function loadTab11(data) {
  if (!data) return;
  function set(id, val) { const el = document.getElementById(id); if (el && val != null) el.value = String(val); }
  _resetTPPOnlineState();
  set('f11-sikap-klien', data.sikap_klien || '');
  set('f11-hasil-pembinaan', data.hasil_pembinaan || '');
  set('f11-penerimaan-masyarakat', data.penerimaan_masyarakat || '');
  set('f11-kelayakan-penjamin', data.kelayakan_penjamin || '');
  set('f11-rekomendasi', data.rekomendasi || '');
  // Tanggal sidang TPP — berbagai key name
  const tgl = data.tgl_sidang_tpp || data.tanggal_sidang_tpp || '';
  set('f11-tgl-sidang-tpp', tgl);
  // Sync pill UI
  ['f11-sikap-klien', 'f11-hasil-pembinaan', 'f11-penerimaan-masyarakat', 'f11-kelayakan-penjamin'].forEach(id => {
    _syncKesimpulanPillUI(id);
  });
  // TPP Online state
  const tpp = data.tpp_online || {};
  const daftarEl = document.getElementById('f11-daftar-tpp');
  if (daftarEl) daftarEl.value = tpp.daftar || 'Tidak';
  onDaftarTPPChange();
  const urlEl = document.getElementById('f11-form-url');
  if (urlEl) urlEl.value = tpp.form_url || '';
  if (tpp.data && Object.keys(tpp.data).length) renderTPPEntries(tpp.data);
  // Screenshot
  if (tpp.screenshot && tpp.screenshot.startsWith('data:')) {
    _tppScreenshotB64 = tpp.screenshot;
    const img = document.getElementById('tpp-screenshot-img');
    const hint = document.getElementById('tpp-screenshot-hint');
    if (img) { img.src = _tppScreenshotB64; img.style.display = ''; }
    if (hint) hint.style.display = 'none';
  }
  syncKesimpulanCDVisibility();
  updateProgress();
}

function validateTab11() {
  const missing = [];
  const v = id => (document.getElementById(id)?.value || '').trim();
  if (!v('f11-rekomendasi')) missing.push('Kesimpulan dan Rekomendasi > Rekomendasi');
  if (!v('f11-tgl-sidang-tpp')) missing.push('Kesimpulan dan Rekomendasi > Tanggal Sidang TPP');
  return missing;
}

/* ══════════════════════════════════════════════════════
   BAB XII — PENUTUP
   Sesuai integrasi.py baris 18861–19086
══════════════════════════════════════════════════════ */

/* ── TTD Petugas ── */
let _ttdPetugasB64 = '';

function onTTDUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    _ttdPetugasB64 = e.target.result;
    const img = document.getElementById('ttd-preview-img');
    const wrap = document.getElementById('ttd-preview-wrap');
    const name = document.getElementById('f12-ttd-name');
    if (img) img.src = _ttdPetugasB64;
    if (wrap) wrap.style.display = 'block';
    if (name) name.textContent = file.name;
    toast('Tanda tangan berhasil diunggah ✓');
    updateProgress();
  };
  reader.readAsDataURL(file);
}

function clearTTD() {
  _ttdPetugasB64 = '';
  window._ttdPetugasB64 = '';
  const img = document.getElementById('ttd-preview-img');
  const wrap = document.getElementById('ttd-preview-wrap');
  const name = document.getElementById('f12-ttd-name');
  const inp = document.getElementById('f12-ttd-file');
  if (img) img.src = '';
  if (wrap) wrap.style.display = 'none';
  if (name) name.textContent = '';
  if (inp) inp.value = '';
  updateProgress();
}

/* ══════════════════════════════════════════
   TAB XII — PENUTUP
══════════════════════════════════════════ */
function collectTab12() {
  const v = id => (document.getElementById(id)?.value || '').trim();
  const lampir = v('f12-lampir-dok');
  const klien = lampir === 'Ya' ? _dokState.klien.filter(i => i.foto_b64).map(i => ({ foto: i.foto_b64, foto_apa: 'Foto Klien' })) : [];
  const penjamin = lampir === 'Ya' ? _dokState.penjamin.filter(i => i.foto_b64).map(i => ({ foto: i.foto_b64, foto_apa: 'Foto Penjamin' })) : [];
  const lainnya = lampir === 'Ya' ? _dokState.lainnya.filter(i => i.foto_b64 || i.nama).map(i => ({
    nama: i.nama, foto: i.foto_b64, foto_apa: i.nama ? `Foto ${i.nama}` : 'Foto'
  })) : [];
  return {
    ttd_petugas_path: window._ttdPetugasB64 || _ttdPetugasB64,
    'Lampirkan Dokumentasi': lampir,
    dokumentasi: { klien, penjamin, lainnya }
  };
}

function loadTab12(data) {
  if (!data) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el && val != null) el.value = String(val); };

  // TTD
  const ttd = data.ttd_petugas_path || '';
  if (ttd && ttd.startsWith('data:')) {
    _ttdPetugasB64 = ttd; window._ttdPetugasB64 = ttd;
    const img = document.getElementById('ttd-preview-img');
    const wrap = document.getElementById('ttd-preview-wrap');
    const name = document.getElementById('f12-ttd-name');
    if (img) img.src = ttd;
    if (wrap) wrap.style.display = 'block';
    if (name) name.textContent = '(tanda tangan tersimpan)';
  }

  // Dokumentasi
  ['klien', 'penjamin', 'lainnya'].forEach(function (g) {
    _dokState[g] = [];
    const c = document.getElementById('dok-' + g + '-rows');
    if (c) c.innerHTML = '';
  });
  _dokRowId = 0;
  window._dokRowId = _dokRowId;

  set('f12-lampir-dok', data['Lampirkan Dokumentasi'] || '');
  onLampirDokChange();
  const dok = data.dokumentasi || {};

  function _restoreDok(group, items) {
    (items || []).forEach(it => {
      addDokRow(group);
      const rid = _dokRowId;
      const item = _dokState[group][_dokState[group].length - 1];
      if (it.foto && it.foto.startsWith('data:')) {
        item.foto_b64 = it.foto;
        const wrap = document.getElementById('dok-prev-wrap-' + rid);
        if (wrap) wrap.innerHTML = `<img class="dok-preview" src="${it.foto}" alt="Foto">`;
      }
      if (group === 'lainnya' && it.nama) {
        item.nama = it.nama;
        const nameInp = document.getElementById('dok-nama-' + rid);
        if (nameInp) nameInp.value = it.nama;
        _dokUpdateNama(rid, it.nama);
      }
    });
  }
  _restoreDok('klien', dok.klien);
  _restoreDok('penjamin', dok.penjamin);
  _restoreDok('lainnya', dok.lainnya);

  updateProgress();
}

function validateTab12() {
  const missing = [];
  if (!(window._ttdPetugasB64 || _ttdPetugasB64)) missing.push('Penutup > Tanda Tangan Petugas');
  const lampir = (document.getElementById('f12-lampir-dok')?.value || '').trim();
  if (!lampir) missing.push('Penutup > Lampirkan Dokumentasi');
  return missing;
}

/* ══════════════════════════════════════════════════════
   INTEGRASI PROGRESS — update getTabIDs & getAllActiveIDs
   Sesuai validate_and_collect_empty_fields() baris 11208–11210
══════════════════════════════════════════════════════ */
const _origGetTabIDs = window.getTabIDs || function () { return []; };
window.getTabIDs = function (t) {
  if (t === 10) return ['f10-template-analisis'];
  if (t === 11) {
    const ids = ['f11-rekomendasi', 'f11-tgl-sidang-tpp'];
    const tplYa = (document.getElementById('f10-template-analisis')?.value || '') === 'Ya';
    if (tplYa) {
      ids.push('f11-sikap-klien', 'f11-hasil-pembinaan');
      if (!_isPelimpahan()) ids.push('f11-penerimaan-masyarakat', 'f11-kelayakan-penjamin');
    }
    return ids;
  }
  if (t === 12) return ['f12-lampir-dok'];
  return _origGetTabIDs(t);
};

/* ── Sync visibility saat program (pelimpahan) berubah ── */
(function () {
  const _origPel = window.onTogglePelimpahan;
  window.onTogglePelimpahan = function (val) {
    if (typeof _origPel === 'function') _origPel.call(this, val);
    syncKesimpulanCDVisibility();
  };
  setTimeout(syncKesimpulanCDVisibility, 300);
})();

/* ── DOMContentLoaded init for tabs 10-12 ── */
document.addEventListener('DOMContentLoaded', function () {
  onTemplateAnalisisChange();
  onDaftarTPPChange();
  onLampirDokChange();
  syncKesimpulanCDVisibility();
});
setTimeout(function () {
  onTemplateAnalisisChange();
  syncKesimpulanCDVisibility();
}, 500);

/* ══════════════════════════════════════════
   CONSOLIDATED — Bridge · collect/validateAllTabs · getTabIDs overrides
   · updateProgress alias · Command Layer · Autosave · Recovery
══════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 1. Bridge helper ──────────────────────────────────────────── */
  function _awaitBridge(ms) {
    ms = ms || 15000;
    if (window.pywebview && window.pywebview.api) return Promise.resolve(true);
    return new Promise(function (resolve) {
      var done = false;
      function finish(ok) {
        if (done) return; done = true;
        console.log('[bridge]', ok ? 'SIAP ✓' : 'TIMEOUT ' + ms + 'ms');
        resolve(!!ok);
      }
      var timer = setTimeout(function () { finish(false); }, ms);
      window.addEventListener('pywebviewready', function () {
        clearTimeout(timer); finish(true);
      }, { once: true });
      var iv = setInterval(function () {
        if (window.pywebview && window.pywebview.api) {
          clearInterval(iv); clearTimeout(timer); finish(true);
        }
      }, 50);
      setTimeout(function () { clearInterval(iv); }, ms + 300);
    });
  }

  /* ── 2. _py — panggil Python API ──────────────────────────────── */
  var _SILENT = new Set(['autosave_data', 'discard_autosave', 'ping_autosave']);

  window._py = async function (method) {
    var args = Array.prototype.slice.call(arguments, 1);
    var silent = _SILENT.has(method);
    try {
      var ok = await _awaitBridge(15000);
      var api = window.pywebview && window.pywebview.api;
      if (!ok || !api) {
        if (!silent) toast('Bridge belum siap (' + method + '). Coba klik lagi.');
        return null;
      }
      if (typeof api[method] !== 'function') {
        if (!silent) {
          toast('Method tidak ada: ' + method + '. Cek versi launcher.');
          console.error('[_py] methods tersedia:', Object.keys(api));
        } else {
          console.debug('[_py silent] method tidak ada:', method);
        }
        return null;
      }
      var result = await api[method].apply(api, args);
      if (!silent) console.log('[_py]', method, '->', JSON.stringify(result || {}).slice(0, 120));
      return result;
    } catch (e) {
      if (!silent) {
        toast('Error Python (' + method + '): ' + (e && e.message ? e.message : String(e)));
        console.error('[_py] exception:', method, e);
      } else {
        console.debug('[_py silent] exception:', method, e && e.message);
      }
      return null;
    }
  };

  /* ── 3. collectAllTabs / validateAllTabs ───────────────────────── */
  function _safe(fn) { try { return fn(); } catch (e) { console.warn('[safe]', e); return null; } }

  function _activeTabIndexes() {
    var pel = false;
    try { pel = (typeof _isPelimpahan === 'function') && !!_isPelimpahan(); } catch (_e) { }
    var tabs = [0, 1, 2, 3];
    if (!pel) tabs.push(4, 5);
    for (var t = 6; t <= 12; t++) tabs.push(t);
    return tabs;
  }
  window.__LIBERO_ACTIVE_TAB_INDEXES = _activeTabIndexes;

  function collectAllTabs() {
    var out = {};
    _activeTabIndexes().forEach(function (i) {
      var fn = window['collectTab' + i];
      if (typeof fn === 'function') {
        var p = _safe(fn);
        if (p && typeof p === 'object') Object.assign(out, p);
      }
    });
    try {
      if (out.riwayat_pidana && out.tanggapan_korban && !out.riwayat_pidana.tanggapan_korban)
        out.riwayat_pidana.tanggapan_korban = out.tanggapan_korban;
    } catch (_e) { }
    return out;
  }

  function validateAllTabs() {
    var miss = [];
    _activeTabIndexes().forEach(function (i) {
      var fn = window['validateTab' + i];
      if (typeof fn === 'function') {
        var p = _safe(fn);
        if (Array.isArray(p)) miss = miss.concat(p);
      }
    });
    return miss;
  }

  window.collectAllTabs = collectAllTabs;
  window.validateAllTabs = validateAllTabs;

  /* ── 4. getAllActiveIDs ─────────────────────────────────────────── */
  window.getAllActiveIDs = function () {
    var pel = false;
    try { pel = (typeof _isPelimpahan === 'function') && !!_isPelimpahan(); } catch (_e) { }
    var tabs = [0, 1, 2, 3];
    if (!pel) tabs.push(4, 5);
    tabs.push(6, 7, 8, 9, 10, 11, 12);
    var ids = [];
    tabs.forEach(function (t) {
      try { var p = window.getTabIDs(t) || []; ids = ids.concat(p); } catch (_e) { }
    });
    return ids;
  };

  /* ── 5. getTabIDs override — dynamic required IDs tab 6 & 7 ────── */
  (function () {
    var _orig = window.getTabIDs;
    if (typeof _orig !== 'function') return;
    function _v(id) { return ((document.getElementById(id) || {}).value || ''); }
    window.getTabIDs = function (t) {
      try {
        if (t === 0) {
          var ids0 = _orig(0).slice();
          if (_v('f-tambahkan-pengantar') === 'Ya')
            ids0.push('f-nomor-pengantar', 'f-kode-surat-upt');
          return ids0;
        }
        if (t === 6) {
          var ids = ['f6-latar-belakang', 'f6-kronologi'];
          var korbanCards = document.querySelectorAll('#korban-list-container .korban-card');
          korbanCards.forEach(function (c, ci) {
            var cjk = (c.querySelector('.korban-jenis') || {}).value || '';
            if (!cjk) return;
            // Count as filled if jenis is selected
            ids.push('_korban_filled_' + ci);
          });
          if (typeof _isPelimpahan === 'function' ? !_isPelimpahan() : true)
            ids.push('f6-tulang-punggung');
          return ids;
        }
        if (t === 7) {
          var ids7 = ['f7-mengakui', 'f7-menyesal'];
          if (typeof _isPelimpahan === 'function' ? !_isPelimpahan() : true)
            ids7.push('f7-keluarga-mendukung', 'f7-masyarakat-mendukung', 'f7-pemerintah-mendukung');
          var tgCards7 = document.querySelectorAll('#tanggapan-korban-list-container .tanggapan-card');
          tgCards7.forEach(function (tc, ti) {
            var th = (tc.querySelector('.tg-terhubungi') || {}).value;
            if (th) ids7.push('_tg_filled_' + ti);
          });
          return ids7;
        }
      } catch (e) { console.warn('[getTabIDs] tab', t, e); }
      return _orig(t);
    };
  })();

  /* ── 6. loadTab4 — normalisasi key riwayat_pernikahan_penjamin ─── */
  (function () {
    var _orig = window.loadTab4;
    window.loadTab4 = function (data) {
      if (!data) return;
      var riw = data.riwayat_pernikahan_penjamin || {};
      var riw2 = {};
      Object.keys(riw).forEach(function (k) {
        var r = riw[k] || {};
        riw2[k] = {
          Nama_Pasangan_Penjamin: r.Nama_Pasangan_Penjamin || r.nama_pasangan || '',
          Tempat_Nikah_Penjamin: r.Tempat_Nikah_Penjamin || r.tempat_nikah || '',
          Tanggal_Nikah_Penjamin: r.Tanggal_Nikah_Penjamin || r.tanggal_nikah || '',
          Agama_Nikah_Penjamin: r.Agama_Nikah_Penjamin || r.agama || '',
          Dasar_Nikah_Penjamin: r.Dasar_Nikah_Penjamin || r.atas_dasar || '',
          Restu_Ortu_Penjamin: r.Restu_Ortu_Penjamin || r.restu || '',
          Punya_Anak_Penjamin: r.Punya_Anak_Penjamin || r.punya_anak || '',
          Anak_Laki_Penjamin: r.Anak_Laki_Penjamin || r.anak_laki || '',
          Anak_Perempuan_Penjamin: r.Anak_Perempuan_Penjamin || r.anak_perempuan || '',
          Status_Saat_Ini_Penjamin: r.Status_Saat_Ini_Penjamin || r.status || '',
          Tahun_Meninggal_Penjamin: r.Tahun_Meninggal_Penjamin || r.tahun_meninggal || ''
        };
      });
      if (typeof _orig === 'function') _orig(Object.assign({}, data, { riwayat_pernikahan_penjamin: riw2 }));
    };
  })();

  /* ── 10. updateProgress — alias ke definisi utama di atas ──── */
  window.updateProgress = updateProgress;

  /* ── 11. onDataLoaded — load semua tab, progress, toast ─────────── */
  window.onDataLoaded = function (data) {
    if (!data) return;
    ['loadTab0', 'loadTab1', 'loadTab2', 'loadTab3', 'loadTab4',
      'loadTab5', 'loadTab6', 'loadTab7', 'loadTab8', 'loadTab9',
      'loadTab10', 'loadTab11', 'loadTab12'].forEach(function (name) {
        try { if (typeof window[name] === 'function') window[name](data); }
        catch (e) { console.warn('[onDataLoaded]', name, e); }
      });
    // ── Terapkan nilai pinned defaults setelah load ──
    // Field yang di-pin tapi kosong di file/autosave tetap terisi dari default
    try {
      if (typeof _dfltFields === 'object') {
        Object.keys(_dfltFields).forEach(function (fid) {
          var val = _dfltFields[fid];
          if (!val) return;
          var el = document.getElementById(fid);
          if (el && !el.value) el.value = val;
        });
      }
    } catch (_e) { }
    setTimeout(function () {
      try { window.updateProgress(); } catch (_e) { }
      try { updateTabRings(); } catch (_e) { }
      try { updateAccHeaderRings(); } catch (_e) { }
      try { if (typeof updateLitmasInfo === 'function') updateLitmasInfo(); } catch (_e) { }
      try { if (typeof updateClockPetugas === 'function') updateClockPetugas(); } catch (_e) { }
    }, 250);
    try { window._resetAutoSaveHash({}); } catch (_e) { }
    toast('Data berhasil dimuat \u2713');
  };

  /* ── 12. cmd_simpan ───────────────────────────────────────────── */
  window.cmd_simpan = async function () {
    try { if (typeof window.__LIBERO_LAZY_PREPARE_ALL === 'function') await window.__LIBERO_LAZY_PREPARE_ALL(1500); } catch (_e) { }
    var data = collectAllTabs();
    // Buka Data Manager mode save
    await window._py('open_dm_save', data);
  };

  /* ── 13. cmd_selesaikan ──────────────────────────────────────── */
  window.cmd_selesaikan = async function () {
    var missing = [];
    try {
      if (typeof window.__LIBERO_LAZY_PREPARE_ALL === 'function') await window.__LIBERO_LAZY_PREPARE_ALL(1500);
      missing = (typeof validateAllTabs === 'function') ? (validateAllTabs() || []) : [];
    } catch (e) {
      console.warn('[cmd_selesaikan] validateAllTabs error:', e);
      missing = [];
    }

    if (missing.length) {
      var shown = missing.slice(0, 12);
      var bullets = shown.map(function (x) { return '• ' + x; }).join('<br>');
      var extra = missing.length > 12
        ? '<br>• ... dan ' + (missing.length - 12) + ' lagi'
        : '';

      var lanjut = await LDialog.confirm({
        title: 'Konfirmasi Lanjutkan',
        message:
          'Peringatan: Terdapat jawaban yang masih kosong atau belum diisi.<br><br>' +
          bullets +
          extra +
          '<br><br>Apakah Anda yakin ingin tetap melanjutkan?',
        icon: 'warning',
        type: 'warning',
        okText: 'Ya, Lanjutkan',
        cancelText: 'Batal',
      });

      if (!lanjut) return;
    }

    try { if (typeof window.__LIBERO_LAZY_PREPARE_ALL === 'function') await window.__LIBERO_LAZY_PREPARE_ALL(1500); } catch (_e) { }
    var data = (typeof collectAllTabs === 'function') ? (collectAllTabs() || {}) : {};
    // Buka Data Manager mode output (generate DOCX di sana)
    await window._py('open_dm_output', data);
  };

  /* ── 14. cmd_lanjutkan ───────────────────────────────────────── */
  window.cmd_lanjutkan = async function () {
    // Buka Data Manager mode load (pilih file di sana)
    await window._py('open_dm_load');
  };

  /* ── 15. cmd_muat_ulang ──────────────────────────────────────── */
  window.cmd_muat_ulang = async function () {
    var _muatOk = await LDialog.confirm({
      title: 'Muat Ulang',
      message: 'Kosongkan semua data?\nData yang belum disimpan akan hilang.',
      icon: 'reload',
      type: 'danger',
      okText: 'Ya, Muat Ulang',
      cancelText: 'Batal',
    });
    if (!_muatOk) return;
    try {
      if (typeof window.__LIBERO_LAZY_BEGIN_RESET === 'function') window.__LIBERO_LAZY_BEGIN_RESET();
      else if (typeof window.__LIBERO_LAZY_MOUNT_ALL === 'function') window.__LIBERO_LAZY_MOUNT_ALL();
    } catch (_e) { }
    function _isPinnedResetField(el) {
      return !!(el && el.id && typeof _dfltFields === 'object' &&
        Object.prototype.hasOwnProperty.call(_dfltFields, el.id));
    }
    document.querySelectorAll(
      '.tab-panel input:not([type=checkbox]):not([type=radio]), .tab-panel select, .tab-panel textarea'
    ).forEach(function (el) {
      if (_isPinnedResetField(el)) return;
      el.value = '';
    });
    document.querySelectorAll(
      '.tab-panel input[type=checkbox], .tab-panel input[type=radio]'
    ).forEach(function (el) {
      if (_isPinnedResetField(el)) return;
      el.checked = false;
    });
    try {
      document.querySelectorAll('.tab-panel .radio-pill.checked, .tab-panel .cbx-pill.checked')
        .forEach(function (p) { p.classList.remove('checked'); });
      document.querySelectorAll('.tab-panel .ksim-pill')
        .forEach(function (p) { p.classList.remove('active-setuju', 'active-tidak'); });
    } catch (_e) { }
    if (typeof _tlData !== 'undefined') Object.keys(_tlData).forEach(function (k) {
      _tlData[k] = []; try { tlRender(k); } catch (_e) { }
    });
    if (typeof _b8Programs !== 'undefined') {
      _b8Programs.kep = []; _b8Programs.man = [];
      try { _renderB8Tags('kep', 'tags-kep'); } catch (_e) { }
      try { _renderB8Tags('man', 'tags-man'); } catch (_e) { }
    }
    if (typeof _b8Tags !== 'undefined') {
      _b8Tags.kunjungan = []; _b8Tags.telepon = [];
      try { _renderB8Tags('kunjungan', 'tags-kunjungan'); } catch (_e) { }
      try { _renderB8Tags('telepon', 'tags-telepon'); } catch (_e) { }
    }
    try { onTogglePengantar(''); } catch (_e) { }
    try { onTogglePelimpahan(''); } catch (_e) { }
    // Reset foto dokumentasi
    try {
      ['klien', 'penjamin', 'lainnya'].forEach(function (g) {
        _dokState[g] = [];
        var c = document.getElementById('dok-' + g + '-rows');
        if (c) c.innerHTML = '';
      });
      _dokRowId = 0;
      window._dokRowId = _dokRowId;
    } catch (_e) { }
    // Reset tanda tangan
    try { clearTTD(); } catch (_e) { }
    // Reset rekaman kronologi
    try { window._clearKronologiAudioStore(); } catch (_e) { }
    // Reset foto bukti pendaftaran TPP
    try { _resetTPPOnlineState(); } catch (_e) { }
    var sb = document.getElementById('sb-autosave');
    if (sb) sb.textContent = '—';
    try {
      if (typeof _dfltFields === 'object') {
        Object.keys(_dfltFields).forEach(function (fid) {
          var el = document.getElementById(fid);
          if (el) {
            el.value = _dfltFields[fid] || '';
          }
        });
      }
      _initPinStates(_dfltFields);
      try {
        if (typeof window._resizeFinp === 'function') requestAnimationFrame(window._resizeFinp);
      } catch (_e2) { }
    } catch (_e) { }
    // Reset tabel susunan keluarga
    try {
      anggotaBersama.length = 0; anggotaKlien.length = 0; anggotaPenjamin.length = 0;
      _renderFamTable('tbody-bersama', anggotaBersama);
      _renderFamTable('tbody-klien', anggotaKlien);
      _renderFamTable('tbody-penjamin', anggotaPenjamin);
      onSusunanChange();
    } catch (_e) { }
    // Reset skor RRI
    try {
      var _rriEl = document.getElementById('rri-a-result');
      if (_rriEl) { _rriEl.textContent = 'Skor: — \u00a0|\u00a0 —'; _rriEl.className = 'rri-skor-badge neutral'; }
    } catch (_e) { }
    // Reset TAB2_IDS_CACHE
    try { TAB2_IDS_CACHE = null; } catch (_e) { }
    // Reset riwayat pelanggaran
    try {
      _pelRows.length = 0;
      try { onPelanggaranChange(); } catch (_e2) {
        var tblPel = document.getElementById('tbl-pelanggaran');
        if (tblPel) tblPel.innerHTML = '<div id="tbl-pel-empty" style="padding:14px 12px;font-size:13px;color:rgba(var(--tc),.4);font-style:italic">Belum ada data pelanggaran</div>';
        var secPel = document.getElementById('sec-pelanggaran-detail');
        if (secPel) secPel.style.display = 'none';
      }
    } catch (_e) { }
    // Reset saran pembinaan (b9)
    try {
      _b9Saran.length = 0;
      _renderSaran();
    } catch (_e) { }
    // Reset marriage-frames (pasangan klien & penjamin)
    try {
      var mf = document.getElementById('marriage-frames');
      if (mf) mf.innerHTML = '';
      var pmf = document.getElementById('penjamin-marriage-frames');
      if (pmf) pmf.innerHTML = '';
    } catch (_e) { }
    // Reset tampilan asesmen kriminogenik
    try {
      var krimHasil = document.getElementById('krim-hasil');
      if (krimHasil) krimHasil.style.display = 'none';
      var krimScore = document.getElementById('krim-total-score');
      if (krimScore) krimScore.textContent = '\u2014';
      var krimStatus = document.getElementById('krim-total-status');
      if (krimStatus) { krimStatus.textContent = '\u2014'; krimStatus.className = 'rri-skor-badge neutral'; }
      var krimRows = document.getElementById('krim-hasil-rows');
      if (krimRows) krimRows.innerHTML = '';
    } catch (_e) { }
    // Reset _tppEntriesData + DOM tabel entri TPP
    try { _resetTPPOnlineState(); } catch (_e) { }
    // Reset semua conditional visibility (select sudah di-clear ke '' di atas, tinggal sinkronkan DOM-nya)
    try {
      // Reset korban cards — clear all and recreate one empty card
      var klcReset = document.getElementById('korban-list-container');
      if (klcReset) { klcReset.innerHTML = ''; _korbanCounter = 0; tambahKorbanCard(); }
      var tkcReset = document.getElementById('tanggapan-korban-list-container');
      if (tkcReset) tkcReset.innerHTML = '';
    } catch (_e) { }
    try { onDendaChange(); } catch (_e) { }
    try { onUangPenggantiChange(); } catch (_e) { }
    try { onJKChange(); } catch (_e) { }
    try { onStatusChange(); } catch (_e) { }
    try { onPenjaminChange(); } catch (_e) { }
    try { onPelanggaranChange(); } catch (_e) { }
    try { syncTanggapanKorbanVis(); } catch (_e) { }
    try { onKeluargaMendukungChange(''); } catch (_e) { }
    try { onBab8KepChange(''); } catch (_e) { }
    try { onBab8ManChange(''); } catch (_e) { }
    try { onBab8RegisterFChange(''); } catch (_e) { }
    try { onNarkotikaChange(''); } catch (_e) { }
    try { onTambahAsesmenChange(''); } catch (_e) { }
    try { onTemplateAnalisisChange(); } catch (_e) { }
    try { onDaftarTPPChange(); } catch (_e) { }
    try { onLampirDokChange(); } catch (_e) { }
    try { onStatusPenjaminChange(); } catch (_e) { }
    try { onPekerjaanPenjaminChange(); } catch (_e) { }
    try { onToggleHomogen(''); } catch (_e) { }
    // Tab 3 — Pertumbuhan / Psikososial / Pendidikan Keluarga
    try { onPertumbuhanChange(); } catch (_e) { }
    try { onPsikososialChange(); } catch (_e) { }
    try { onPendidikanKeluargaChange(); } catch (_e) { }
    // Tab 3 — Pendidikan Formal (sec-pend-tidak/sd/smp/sma/pt)
    try { updatePendidikanFormalFields(); } catch (_e) { }
    // Tab 3 — Nonformal & Bakat
    try { onNonformalChange(); } catch (_e) { }
    try { onBakatPunyaChange(); } catch (_e) { }
    // Tab 3 — Konsumsi
    try { onKonsumsiChange('rokok'); } catch (_e) { }
    try { onKonsumsiChange('miras'); } catch (_e) { }
    try { onKonsumsiChange('napza'); } catch (_e) { }
    // Tab 3 — Pernikahan (acc-3-15 + marriage-frames)
    try { updateMarriageVisibility(); } catch (_e) { }
    // Tab 3 — Kebiasaan tag DOM
    try {
      var kbBaik = document.getElementById('tags-kebiasaan-baik');
      if (kbBaik) kbBaik.innerHTML = '';
      var kbBuruk = document.getElementById('tags-kebiasaan-buruk');
      if (kbBuruk) kbBuruk.innerHTML = '';
    } catch (_e) { }
    // Tab 3 — Relasi conflict warning
    try {
      var rcWarn = document.getElementById('relasi-conflict-warn');
      if (rcWarn) rcWarn.style.display = 'none';
    } catch (_e) { }
    // Tab 9 — RRI kriminogenik acc-9-4 + krim-skip-notice
    try { _updateKrimVis(); } catch (_e) { }
    // Tab 11 — Kesimpulan pill active classes
    try {
      document.querySelectorAll('.ksim-pill').forEach(function (p) {
        p.classList.remove('active-setuju', 'active-tidak');
      });
    } catch (_e) { }
    toast('Form dikosongkan');
    try { window._resetAutoSaveHash(); } catch (_e) { }
    window._userHasTyped = false;
    await window._py('discard_autosave');
    await window._py('reset_form');
    try {
      if (typeof window.__LIBERO_LAZY_FINISH_RESET === 'function') window.__LIBERO_LAZY_FINISH_RESET();
      else if (typeof window.__LIBERO_LAZY_RESET_CACHE === 'function') window.__LIBERO_LAZY_RESET_CACHE();
    } catch (_e) { }
    try { window.updateProgress(); } catch (_e) { }
  };

  /* ── 16. _resetAutoSaveHash — snapshot hash state sekarang ──────── */
  (function () {
    function _stableStr(obj) {
      var seen = new WeakSet();
      return JSON.stringify(obj, function (k, v) {
        if (v && typeof v === 'object') {
          if (seen.has(v)) return; seen.add(v);
          if (!Array.isArray(v)) {
            var o = {};
            Object.keys(v).sort().forEach(function (key) { o[key] = v[key]; });
            return o;
          }
        }
        return v;
      });
    }
    function _hashStr(s) {
      var h = 0;
      for (var i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
      return String(h);
    }
    window._resetAutoSaveHash = function (snapshot) {
      try {
        var data = snapshot || ((typeof window.collectAllTabs === 'function') ? window.collectAllTabs() : {});
        window.__asLastHash = _hashStr(_stableStr(data || {}));
      } catch (e) { window.__asLastHash = '0'; }
    };
  })();

  /* ── 17. Autosave loop — tiap 10 detik, skip form kosong ─────────── */
  (function () {
    var IGNORE = new Set(['logo', '__autosave_ts']);

    function _stableStr(obj) {
      var seen = new WeakSet();
      return JSON.stringify(obj, function (k, v) {
        if (v && typeof v === 'object') {
          if (seen.has(v)) return; seen.add(v);
          if (!Array.isArray(v)) {
            var o = {};
            Object.keys(v).sort().forEach(function (key) { o[key] = v[key]; });
            return o;
          }
        }
        return v;
      });
    }
    function _hashStr(s) {
      var h = 0;
      for (var i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
      return String(h);
    }
    function pruneStructural(x) {
      if (Array.isArray(x)) return x.map(pruneStructural);
      if (x && typeof x === 'object') {
        var out = {};
        Object.keys(x).forEach(function (k) { if (!IGNORE.has(k)) out[k] = pruneStructural(x[k]); });
        return out;
      }
      return x;
    }
    function hasMeaningful(x) {
      var stack = [x];
      while (stack.length) {
        var it = stack.pop();
        if (it === null || it === undefined) continue;
        if (typeof it === 'boolean') { if (it) return true; continue; }
        if (typeof it === 'number') return true;
        if (typeof it === 'string') { if (it.trim()) return true; continue; }
        if (Array.isArray(it)) { it.forEach(function (v) { stack.push(v); }); continue; }
        if (typeof it === 'object') { Object.keys(it).forEach(function (k) { stack.push(it[k]); }); continue; }
      }
      return false;
    }

    // Init hash awal (form kosong) setelah 2 detik
    setTimeout(function () {
      try {
        var d0 = (typeof window.collectAllTabs === 'function') ? window.collectAllTabs() : {};
        window.__asLastHash = _hashStr(_stableStr(pruneStructural(d0 || {})));
      } catch (_e) { window.__asLastHash = '0'; }
    }, 2000);

    // Jangan autosave sampai user benar-benar mengetik sesuatu
    window._userHasTyped = false;
    document.addEventListener('input', function () { window._userHasTyped = true; window.__lastUserEditAt = Date.now(); }, true);
    document.addEventListener('change', function () { window._userHasTyped = true; window.__lastUserEditAt = Date.now(); }, true);

    async function tick() {
      try {
        if (!window._userHasTyped) return;
        if (typeof window.collectAllTabs !== 'function') return;
        if (window.__lastUserEditAt) {
          var _idleFor = Date.now() - window.__lastUserEditAt;
          if (_idleFor < 2500) {
            clearTimeout(window.__asIdleRetry);
            window.__asIdleRetry = setTimeout(tick, Math.max(300, 2600 - _idleFor));
            return;
          }
        }
        var data = window.collectAllTabs() || {};
        var pruned = pruneStructural(data);
        var h = _hashStr(_stableStr(pruned) + JSON.stringify(_dfltFields || {}));
        if (h === window.__asLastHash) return;
        if (!hasMeaningful(pruned)) {
          window.__asLastHash = h;
          await window._py('discard_autosave');
          var sb0 = document.getElementById('sb-autosave');
          if (sb0) sb0.textContent = '—';
          return;
        }
        var _asData = Object.assign({}, data, { __field_defaults: _dfltFields || {} });
        var r = await window._py('autosave_data', JSON.stringify(_asData));
        if (r && r.ok) {
          window.__asLastHash = h;
          var sb = document.getElementById('sb-autosave');
          var shown = (window._fmtAutosaveTime
            ? window._fmtAutosaveTime(r.waktu)
            : (r.waktu || '')
          ) || 'tersimpan';

          if (sb) sb.textContent = shown;
        }
      } catch (e) { console.debug('[autosave tick]', e); }
    }

    if (window.__asTimer) clearInterval(window.__asTimer);
    setTimeout(function () {
      tick();
      window.__asTimer = setInterval(tick, 10000);
    }, 8000);
    window.__asTick = tick;
  })();

  /* ── 18. Check autosave & self-test saat bridge siap ─────────────── */
  _awaitBridge(15000).then(async function (ok) {
    if (!ok) {
      console.error('[bridge] TIMEOUT — pywebview.api tidak tersedia!');
      return;
    }
    console.log('[bridge] pywebview.api SIAP ✓');
    // Init Tab9 (RRI rows) jika ada
    try { if (typeof _initTab9 === 'function') _initTab9(); } catch (_e) { }
    setTimeout(async function () {
      try {
        var r = await window._py('check_autosave');
        if (r && r.found) {
          var recovTime = window._fmtAutosaveTime
            ? window._fmtAutosaveTime(r.waktu)
            : (r.waktu || '');

          var _recovOk = await LDialog.recovery({
            time: recovTime,
            message: 'Ditemukan data yang belum disimpan\ndari sesi sebelumnya.'
          });
          if (_recovOk) {
            var _rv = await window._py('restore_autosave');
            if (_rv && _rv.ok && _rv.data && typeof onDataLoaded === 'function') onDataLoaded(_rv.data);
            setTimeout(updateClockPetugas, 200);
          } else {
            await window._py('discard_autosave');
          }
        }
      } catch (_e) { console.warn('[autosave-check]', _e); }
    }, 800);
    // Self-test
    setTimeout(function () {
      var api = window.pywebview && window.pywebview.api;
      if (api) console.log('[self-test] methods:', Object.keys(api));
      var nm = document.getElementById('f-nama-petugas');
      console.log('[self-test] f-nama-petugas:', nm ? nm.value : '(tidak ada)');
    }, 2000);
  });

  // Kick progress setelah semua fungsi ter-define
  setTimeout(function () { try { window.updateProgress(); } catch (_e) { } }, 300);

})();

/* ═══════════════════════════════════════════════════
   SPLASH ENTRANCE ANIMATION
   Fase 1: iris + center zoom in  (0–400ms)
   Fase 2: progress bar jalan     (0–900ms)
   Fase 3: splash zoom out + fade (900–1250ms)
   Fase 4: shell fade in          (1100–1350ms)
════════════════════════════════════════════════════ */
(function () {
  const splash = document.getElementById('int-splash');
  const iris = document.getElementById('int-iris');
  const center = document.getElementById('int-splash-center');
  const bar = document.getElementById('int-splash-bar');
  const shell = document.querySelector('.shell');

  if (!splash) return;

  // shell mulai tersembunyi
  if (shell) { shell.style.opacity = '0'; shell.style.transition = 'none'; }

  // FASE 1: zoom in iris + center
  requestAnimationFrame(() => requestAnimationFrame(() => {
    iris.style.transition = 'transform .65s cubic-bezier(.22,1.35,.36,1), opacity .4s ease';
    center.style.transition = 'transform .65s cubic-bezier(.22,1.35,.36,1), opacity .4s ease';
    iris.style.transform = 'scale(1)';
    iris.style.opacity = '1';
    center.style.transform = 'scale(1) translateY(0)';
    center.style.opacity = '1';
  }));

  // FASE 2: progress bar
  let pct = 0;
  const barTimer = setInterval(() => {
    pct += pct < 60 ? 3.5 : pct < 85 ? 1.8 : 0.6;
    if (pct >= 99) { pct = 99; clearInterval(barTimer); }
    bar.style.width = pct.toFixed(1) + '%';
  }, 28);

  // FASE 3: splash zoom out & fade, shell muncul
  setTimeout(() => {
    clearInterval(barTimer);
    bar.style.transition = 'width .15s linear';
    bar.style.width = '100%';

    setTimeout(() => {
      // splash collapse ke tengah (kebalikan portal di launcher)
      splash.style.transition = 'opacity .35s ease';
      iris.style.transition = 'transform .4s cubic-bezier(.55,0,1,.45), opacity .3s ease';
      center.style.transition = 'transform .35s ease, opacity .25s ease';

      iris.style.transform = 'scale(0.05)';
      iris.style.opacity = '0';
      center.style.transform = 'scale(0.6) translateY(-10px)';
      center.style.opacity = '0';
      splash.style.opacity = '0';

      // shell fade in
      if (shell) {
        shell.style.transition = 'opacity .45s ease';
        shell.style.opacity = '1';
      }

      setTimeout(() => {
        splash.style.display = 'none';
      }, 420);
    }, 180);
  }, 950);
})();

/* ── AUDIO RECORDER — Kronologi Kejadian ────────────────────── */
(function () {
  let mediaRecorder = null;
  let audioChunks = [];
  let timerInterval = null;
  let startTime = 0;
  let recordCount = 0;
  let isRecording = false;

  window._micStore = [];
  const AUDIO_IMPORT_MAX_BYTES = 10 * 1024 * 1024;

  function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
  }
  function tickTimer() {
    const el = document.getElementById('mic-timer');
    if (el) el.textContent = formatTime(Date.now() - startTime);
  }
  function blobToDataUrl(blob) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(blob);
    });
  }

  async function fixWebmDuration(blob) {
    try {
      const arrayBuf = await blob.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const decoded = await audioCtx.decodeAudioData(arrayBuf.slice(0));
      audioCtx.close();
      const durSec = decoded.duration;
      const bytes = new Uint8Array(arrayBuf);
      const patched = _patchWebmDuration(bytes, durSec);
      return new Blob([patched], { type: blob.type });
    } catch (e) {
      console.warn('[MicRec] fixWebmDuration fallback:', e);
      return blob;
    }
  }

  function _patchWebmDuration(bytes, durSec) {
    for (let i = 0; i < bytes.length - 10; i++) {
      if (bytes[i] === 0x44 && bytes[i + 1] === 0x89 && bytes[i + 2] === 0x88) {
        const view = new DataView(bytes.buffer);
        view.setFloat64(i + 3, durSec, false);
        return bytes;
      }
    }
    return bytes;
  }
  function bestMime() {
    const pref = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg'];
    for (const m of pref) if (MediaRecorder.isTypeSupported(m)) return m;
    return '';
  }
  function approxKB(dataUrl) {
    return Math.round((dataUrl.length - (dataUrl.indexOf(',') + 1)) * 0.75 / 1024);
  }
  async function cacheAudioBlob(blob, filename) {
    const dataUrl = await blobToDataUrl(blob);
    const raw = await window._py('cache_audio_b64', dataUrl, filename || 'audio.webm');
    const res = (typeof raw === 'string') ? JSON.parse(raw) : raw;
    if (!res || res.ok === false) throw new Error((res && res.err) || 'Gagal menyimpan audio.');
    return res;
  }

  window.kronologiMicToggle = async function () {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 22050, echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
        audioChunks = [];
        const mime = bestMime();
        const opts = { audioBitsPerSecond: 32000 };
        if (mime) opts.mimeType = mime;
        mediaRecorder = new MediaRecorder(stream, opts);
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
        mediaRecorder.onstop = () => onRecordingStop(stream, opts.mimeType || 'audio/webm');
        mediaRecorder.start(200);
        isRecording = true; startTime = Date.now();
        timerInterval = setInterval(tickTimer, 500);
        const btn = document.getElementById('btn-mic-toggle');
        btn.style.background = 'rgba(248,113,113,.15)';
        btn.style.borderColor = 'rgba(248,113,113,.55)';
        btn.style.color = '#f87171';
        document.getElementById('mic-btn-label').textContent = 'Stop';
        document.getElementById('mic-recording-indicator').style.display = 'flex';
      } catch (err) {
        alert('Tidak dapat mengakses mikrofon. Pastikan izin diberikan di browser.');
        console.error('[MicRec]', err);
      }
    } else {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    }
  };

  async function onRecordingStop(stream, mimeType) {
    isRecording = false;
    clearInterval(timerInterval);
    stream.getTracks().forEach(t => t.stop());
    const duration = Date.now() - startTime;
    recordCount++;
    const id = 'rec-' + recordCount;

    const btn = document.getElementById('btn-mic-toggle');
    btn.style.cssText = '';  // clear inline → CSS class takes over
    document.getElementById('mic-btn-label').textContent = 'Rekam Suara';
    document.getElementById('mic-recording-indicator').style.display = 'none';
    document.getElementById('mic-timer').textContent = '0:00';

    const list = document.getElementById('mic-recordings-list');
    const ph = document.createElement('div');
    ph.id = 'ph-' + id;
    ph.style.cssText = 'padding:6px 12px;font-size:11px;color:rgba(var(--ac),.45);font-family:var(--font-mono)';
    ph.textContent = '⏳ Memproses rekaman ' + recordCount + '…';
    if (list) list.appendChild(ph);

    let blob = new Blob(audioChunks, { type: mimeType });
    blob = await fixWebmDuration(blob);
    let meta = null;
    try { meta = await cacheAudioBlob(blob, 'rekaman-' + Date.now() + '.webm'); }
    catch (e) { console.error('[MicRec]', e); }

    if (!meta) {
      document.getElementById('ph-' + id)?.remove();
      if (typeof toast === 'function') toast('Gagal menyimpan rekaman audio.');
      return;
    }
    const audio_url = meta.file_url || URL.createObjectURL(blob);
    window._micStore.push({ id, audio_b64: '', audio_path: meta.path || '', audio_url, duration, filename: meta.name || null, mime: meta.mime || mimeType, size: meta.size || blob.size });
    window._userHasTyped = true; // trigger autosave
    document.getElementById('ph-' + id)?.remove();
    addAudioCard(id, audio_url, duration, recordCount, meta.name || null);
  }

  function addAudioCard(id, audio_b64, duration, num, filename) {
    const list = document.getElementById('mic-recordings-list');
    if (!list) return;
    const rec = (window._micStore || []).find(r => r.id === id);
    const audio_src = (rec && rec.audio_url) || audio_b64;
    const sizeLabel = rec && rec.size
      ? (rec.size < 1048576 ? Math.round(rec.size / 1024) + ' KB' : (rec.size / 1048576).toFixed(1) + ' MB')
      : approxKB(audio_b64) + ' KB';
    const label = filename
      ? `📁 ${filename.length > 22 ? filename.slice(0, 20) + '…' : filename}`
      : `🎙 Rekaman ${num}`;
    const card = document.createElement('div');
    card.id = 'card-' + id;
    card.dataset.recId = id;
    card.style.cssText = `
      display:flex;align-items:center;gap:10px;padding:8px 12px;
      border-radius:8px;border:1px solid rgba(var(--ac),.2);
      background:rgba(var(--ac),.05);flex-wrap:nowrap;
    `;
    card.innerHTML = `
      <span style="font-size:11px;font-weight:700;color:rgba(var(--ac),.6);
        white-space:nowrap;min-width:64px;font-family:var(--font-mono);">${label}</span>
      <audio controls src="${audio_src}" style="flex:1;min-width:0;height:28px;
        accent-color:var(--gold);filter:sepia(30%) hue-rotate(10deg);"></audio>
      <span style="font-size:11px;color:rgba(var(--tc),.4);
        white-space:nowrap;font-family:var(--font-mono);">${duration ? formatTime(duration) : ''}</span>
      <span style="font-size:10px;color:rgba(var(--tc),.28);white-space:nowrap;font-family:var(--font-mono);">
        ${sizeLabel}</span>
      <button onclick="window._micDeleteCard('${id}')" type="button"
        title="Hapus" style="background:none;border:none;cursor:pointer;
        color:rgba(240,90,90,.6);font-size:15px;padding:0 2px;line-height:1;flex-shrink:0;transition:color .15s;"
        onmouseover="this.style.color='#f87171'" onmouseout="this.style.color='rgba(240,90,90,.6)'">✕</button>
    `;
    list.appendChild(card);
  }

  function reencodeAudio(file) {
    return new Promise(async (resolve) => {
      try {
        const ab = await file.arrayBuffer();
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const decoded = await ctx.decodeAudioData(ab);
        ctx.close();
        const offCtx = new OfflineAudioContext(
          decoded.numberOfChannels, decoded.length, decoded.sampleRate
        );
        const src = offCtx.createBufferSource();
        src.buffer = decoded;
        src.connect(offCtx.destination);
        src.start();
        const rendered = await offCtx.startRendering();
        const liveCtx = new AudioContext();
        const dest = liveCtx.createMediaStreamDestination();
        const bufSrc = liveCtx.createBufferSource();
        bufSrc.buffer = rendered;
        bufSrc.connect(dest);
        const mime = bestMime();
        const opts = { audioBitsPerSecond: 32000 };
        if (mime) opts.mimeType = mime;
        const mr = new MediaRecorder(dest.stream, opts);
        const chunks = [];
        mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        mr.onstop = async () => {
          liveCtx.close();
          let blob = new Blob(chunks, { type: mime || 'audio/webm' });
          blob = await fixWebmDuration(blob);
          resolve({ blob, duration: Math.round(decoded.duration * 1000) });
        };
        mr.start(200);
        bufSrc.start();
        setTimeout(() => { if (mr.state !== 'inactive') mr.stop(); },
          decoded.duration * 1000 + 300);
      } catch (e) {
        console.warn('[MicImport] re-encode fallback:', e);
        resolve(null);
      }
    });
  }

  window.kronologiImportAudio = async function (input) {
    const files = Array.from(input.files || []);
    if (!files.length) return;
    input.value = '';
    for (const file of files) {
      recordCount++;
      const id = 'rec-' + recordCount;
      const num = recordCount;
      const list = document.getElementById('mic-recordings-list');
      const ph = document.createElement('div');
      ph.id = 'ph-' + id;
      ph.style.cssText = 'padding:6px 12px;font-size:11px;color:rgba(var(--ac),.5);font-family:var(--font-mono)';
      ph.textContent = '⏳ Mengimpor ' + file.name + '…';
      if (list) list.appendChild(ph);
      try {
        if (file.size > AUDIO_IMPORT_MAX_BYTES) {
          if (typeof toast === 'function') toast('File audio besar pilih lewat Data Manager.');
          document.getElementById('ph-' + id)?.remove();
          continue;
        }
        // Normalisasi MIME type supaya <audio> bisa play
        let _mime = file.type || '';
        if (!_mime || _mime === 'audio/x-m4a' || _mime === 'audio/m4a') _mime = 'audio/mp4';
        const _blob = _mime !== file.type ? new Blob([await file.arrayBuffer()], { type: _mime }) : file;
        const meta = await cacheAudioBlob(_blob, file.name);
        const audio_url = meta.file_url || URL.createObjectURL(_blob);
        let duration = 0;
        window._micStore.push({ id, audio_b64: '', audio_path: meta.path || '', audio_url, duration, filename: meta.name || file.name, mime: meta.mime || _mime, size: meta.size || file.size });
        window._userHasTyped = true; // trigger autosave
        document.getElementById('ph-' + id)?.remove();
        addAudioCard(id, audio_url, duration, num, meta.name || file.name);
      } catch (e) {
        document.getElementById('ph-' + id)?.remove();
        console.error('[MicImport]', e);
      }
    }
  };

  window._micDeleteCard = function (id) {
    document.getElementById('card-' + id)?.remove();
    const rec = (window._micStore || []).find(r => r.id === id);
    if (rec && rec.audio_url && String(rec.audio_url).startsWith('blob:')) URL.revokeObjectURL(rec.audio_url);
    window._micStore = window._micStore.filter(r => r.id !== id);
  };
  window._micAddAudioCard = addAudioCard;

  function clearKronologiAudioStore() {
    try {
      (window._micStore || []).forEach(function (r) {
        if (r && r.audio_url && String(r.audio_url).startsWith('blob:')) {
          URL.revokeObjectURL(r.audio_url);
        }
      });
    } catch (_e) { }
    window._micStore = [];
    recordCount = 0;
    const list = document.getElementById('mic-recordings-list');
    if (list) list.innerHTML = '';
  }
  window._clearKronologiAudioStore = clearKronologiAudioStore;

  /* ── Patch collectTab6 & loadTab6 untuk audio ── */
  function _patchCollect() {
    const _orig = window.collectTab6;
    window.collectTab6 = function () {
      const data = typeof _orig === 'function' ? _orig() : {};
      if (!data.riwayat_pidana) data.riwayat_pidana = {};
      data.riwayat_pidana.kronologi_audio =
        window._micStore.length > 0
          ? window._micStore.map(r => ({ id: r.id, audio_b64: r.audio_b64 || '', audio_path: r.audio_path || '', audio_url: r.audio_path ? (r.audio_url || '') : '', duration: r.duration, filename: r.filename || null, mime: r.mime || null, size: r.size || 0 }))
          : [];
      return data;
    };
  }

  function _patchLoad() {
    const _orig = window.loadTab6;
    window.loadTab6 = function (data) {
      if (typeof _orig === 'function') _orig(data);
      const audios = (data?.riwayat_pidana?.kronologi_audio) || [];
      clearKronologiAudioStore();
      if (!audios.length) return;
      audios.forEach((r, i) => {
        const pathUrl = r.audio_path ? encodeURI('file:///' + String(r.audio_path).replace(/\\/g, '/')) : '';
        const savedUrl = (r.audio_url && !String(r.audio_url).startsWith('blob:')) ? r.audio_url : '';
        const entry = { id: r.id || ('rec-loaded-' + i), audio_b64: r.audio_b64 || '', audio_path: r.audio_path || '', audio_url: savedUrl || pathUrl, duration: r.duration || 0, filename: r.filename || null, mime: r.mime || null, size: r.size || 0 };
        window._micStore.push(entry);
        if (entry.audio_b64 || entry.audio_url) addAudioCard(entry.id, entry.audio_b64 || entry.audio_url, entry.duration, i + 1, entry.filename);
      });
      recordCount = audios.length;
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => { _patchCollect(); _patchLoad(); }, 0));
  } else {
    setTimeout(() => { _patchCollect(); _patchLoad(); }, 0);
  }

  // ── Auto-show tombol AI ──
  function _updateAiKronBtn() {
    const btn = document.getElementById('btn-ai-kronologi-int') || document.getElementById('btn-kron-stopper-int');
    if (btn) btn.style.display = 'flex';
  }
  // MutationObserver: langsung reaktif saat card audio ditambah/dihapus
  const _listObs = document.getElementById('mic-recordings-list');
  if (_listObs) {
    new MutationObserver(_updateAiKronBtn).observe(_listObs, { childList: true, subtree: false });
  }
  const _origMicDelete = window._micDeleteCard;
  window._micDeleteCard = function (id) {
    if (typeof _origMicDelete === 'function') _origMicDelete(id);
    setTimeout(_updateAiKronBtn, 50);
  };
  // Fallback: cek setelah halaman + data selesai dimuat
  setTimeout(_updateAiKronBtn, 600);
  setTimeout(_updateAiKronBtn, 2000);
  setTimeout(_updateAiKronBtn, 4000);
})();

window.toggleKronologiStopperMenu = function (suffix) {
  const menu = document.getElementById('kron-stopper-menu-' + suffix);
  if (!menu) return;
  document.querySelectorAll('.kron-stopper-menu.open').forEach(function (m) {
    if (m !== menu) m.classList.remove('open');
  });
  menu.classList.toggle('open');
};

window.runKronologiStopper = function (suffix, action) {
  if (window._SFX && window._SFX.fire) window._SFX.fire();
  const menu = document.getElementById('kron-stopper-menu-' + suffix);
  if (menu) menu.classList.remove('open');
  if (action === 'sipp' && typeof openSippModal === 'function') openSippModal();
  if (action === 'audio' && typeof aiAudioToKronologi === 'function') aiAudioToKronologi();
  if (action === 'narasi' && typeof aiReparseKronologi === 'function') aiReparseKronologi();
};

if (!window._kronStopperMenuBound) {
  window._kronStopperMenuBound = true;
  document.addEventListener('click', function (e) {
    if (e.target.closest('.kron-stopper-wrap')) return;
    document.querySelectorAll('.kron-stopper-menu.open').forEach(function (m) {
      m.classList.remove('open');
    });
  });
}

/* ── AI Audio → Teks Kronologi ────────────────────────────────── */
function _kronEsc(value) {
  return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _ensureKronReviewModal() {
  var overlay = document.getElementById('kron-review-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'kron-review-overlay';
  overlay.className = 'wilayah-overlay';
  overlay.innerHTML =
    '<div class="wilayah-modal">' +
    '<div class="wilayah-modal-hdr"><div class="wilayah-modal-title">Review Kronologi STOPPER</div><button type="button" class="wilayah-btn" id="kron-review-close">Tutup</button></div>' +
    '<div class="wilayah-modal-body" id="kron-review-body"></div>' +
    '<div class="wilayah-modal-ftr" id="kron-review-actions"></div>' +
    '</div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });
  overlay.querySelector('#kron-review-close').onclick = function () { overlay.classList.remove('open'); };
  return overlay;
}

function _showKronReview(currentText, resultText, sourceLabel, modelUsed) {
  return new Promise(function (resolve) {
    var overlay = _ensureKronReviewModal();
    var body = overlay.querySelector('#kron-review-body');
    var actions = overlay.querySelector('#kron-review-actions');
    var oldText = String(currentText || '').trim();
    var newText = String(resultText || '').trim();
    var modelText = String(modelUsed || '').trim() || '-';
    var sourceText = String(sourceLabel || 'STOPPER AI').trim();
    body.innerHTML =
      '<div class="wilayah-note"><strong>Model AI:</strong> ' + _kronEsc(modelText) + ' | <strong>Sumber:</strong> ' + _kronEsc(sourceText) + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
      '<div><div class="wilayah-info-label">Isi Saat Ini</div><div style="white-space:pre-wrap;max-height:260px;overflow:auto;border:1px solid rgba(var(--tc),.12);border-radius:8px;padding:10px;color:rgba(var(--tc),.86)">' + _kronEsc(oldText || '-') + '</div></div>' +
      '<div><div class="wilayah-info-label">Hasil STOPPER</div><div style="white-space:pre-wrap;max-height:260px;overflow:auto;border:1px solid rgba(var(--tc),.12);border-radius:8px;padding:10px;color:rgba(var(--tc),.86)">' + _kronEsc(newText || '-') + '</div></div>' +
      '</div>';
    actions.innerHTML =
      '<button type="button" class="wilayah-btn" id="kron-review-cancel">Batal</button>' +
      (oldText ? '<button type="button" class="wilayah-btn" id="kron-review-append">Tambahkan di Bawah</button>' : '') +
      '<button type="button" class="wilayah-btn primary" id="kron-review-replace">' + (oldText ? 'Ganti Isi Lama' : 'Gunakan Hasil STOPPER') + '</button>';
    function done(action) {
      overlay.classList.remove('open');
      resolve(action);
    }
    actions.querySelector('#kron-review-cancel').onclick = function () { done('cancel'); };
    var appendBtn = actions.querySelector('#kron-review-append');
    if (appendBtn) appendBtn.onclick = function () { done('append'); };
    actions.querySelector('#kron-review-replace').onclick = function () { done('replace'); };
    overlay.classList.add('open');
  });
}

async function _reviewAndApplyKronologi(ta, resultText, sourceLabel, modelUsed) {
  if (!ta || !String(resultText || '').trim()) return false;
  var oldText = String(ta.value || '').trim();
  var action = await _showKronReview(oldText, resultText, sourceLabel, modelUsed);
  if (action === 'cancel') return false;
  if (action === 'append' && oldText) ta.value = oldText + '\n' + String(resultText || '').trim();
  else ta.value = String(resultText || '').trim();
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  ta.dispatchEvent(new Event('change', { bubbles: true }));
  window._userHasTyped = true;
  return true;
}

window.aiReparseKronologi = async function () {
  const ta = document.getElementById('f6-kronologi');
  const raw = (ta?.value || '').trim();
  if (!raw) {
    const msg = 'Isi garis besar atau narasi kronologi terlebih dahulu.';
    if (typeof LDialog !== 'undefined') await LDialog.alert(msg);
    else alert(msg);
    return;
  }

      if (!window.pywebview || !window.pywebview.api || !window.pywebview.api.ai_reparse_kronologi) {
        const msg = 'Fitur AI belum siap. Coba tutup dan buka kembali modul.';
        if (typeof LDialog !== 'undefined') await LDialog.alert(msg);
        else alert(msg);
        return;
      }
      if (typeof window.LStopperRequireAiKey === 'function') {
        const hasAiKey = await window.LStopperRequireAiKey();
        if (!hasAiKey) return;
      }

      const okStart = typeof LDialog !== 'undefined'
    ? await LDialog.confirm(
      'STOPPER akan memperbaiki kronologi yang tertulis.\n\n' +
      'Yang akan dilakukan:\n' +
      '- mengubah kalimat yang tidak baku menjadi bahasa Indonesia baku sesuai KBBI;\n' +
      '- memperbaiki ejaan, tanda baca, dan susunan kalimat;\n' +
      '- menggabungkan poin atau garis besar menjadi narasi kronologis;\n' +
      '- memanjangkan uraian yang terlalu pendek tanpa menambah fakta baru;\n' +
      '- menyusun cerita dari awal kejadian sampai akhir secara runtut.\n\n' +
      'Hasil AI akan ditampilkan untuk ditinjau sebelum diterapkan. Lanjutkan?'
    )
    : confirm(
      'STOPPER akan memperbaiki kronologi yang tertulis. ' +
      'Hasil AI akan ditampilkan untuk ditinjau sebelum diterapkan. Lanjutkan?'
    );
  if (!okStart) return;

  const btn = document.getElementById('btn-ai-kron-repair-int') || document.getElementById('btn-kron-stopper-int');
  const lbl = document.getElementById('btn-ai-kron-repair-lbl-int') || document.getElementById('btn-kron-stopper-lbl-int');
  if (btn) btn.disabled = true;
  if (lbl) lbl.textContent = 'Memproses...';
  if (window.LStopperLoading) {
    window.LStopperLoading.show({
      title: 'STOPPER AI',
      message: 'Membaca narasi kronologi...',
      detail: 'AI sedang merapikan alur, bahasa, dan struktur kronologi.',
      steps: ['Membaca narasi kronologi...', 'Memperbaiki bahasa dan ejaan...', 'Menyusun ulang alur kejadian...', 'Menyiapkan hasil kronologi...']
    });
  }

  const namaKlien = (
    (document.getElementById('f-nama-klien')?.value || '') ||
    (document.getElementById('f1-nama')?.value || '')
  ).trim();
  const pidana = typeof getPidanaPutusanForKronologi === 'function'
    ? getPidanaPutusanForKronologi()
    : (
      (document.getElementById('f-lama-pidana')?.value || '') ||
      (document.getElementById('f6-jenis-pidana')?.value || '')
    ).trim();

  window.__onAiKronRepairResult = async function (res) {
    delete window.__onAiKronRepairResult;
    try {
      if (res && res.ok) {
        if (window.LStopperLoading) window.LStopperLoading.hide();
        var applied = await _reviewAndApplyKronologi(ta, res.kronologi || '', 'Perbaiki Narasi', res.model || '');
        if (applied && typeof toast === 'function') toast('Kronologi berhasil diperbaiki.');
      } else if (res && !res.pending) {
        if (window.LStopperLoading) window.LStopperLoading.hide();
        const msg = 'Gagal: ' + (res?.err || 'Error tidak diketahui');
        if (typeof LDialog !== 'undefined') await LDialog.alert(msg);
        else alert(msg);
      }
    } finally {
      if (!res || !res.ok) {
        if (window.LStopperLoading) window.LStopperLoading.hide();
      }
      if (btn) btn.disabled = false;
      if (lbl) lbl.textContent = 'STOPPER';
    }
  };

  window.pywebview.api.ai_reparse_kronologi(raw, namaKlien, pidana, 'integrasi');
};

window.aiAudioToKronologi = async function () {
  const store = window._micStore || [];
  if (!store.length) {
    if (typeof LDialog !== 'undefined') {
      await LDialog.alert('Belum ada rekaman audio.\nRekam atau impor audio terlebih dahulu.');
    } else {
      alert('Belum ada rekaman audio. Rekam atau impor audio terlebih dahulu.');
    }
    return;
  }

      const ta = document.getElementById('f6-kronologi');
      const existingText = (ta?.value || '').trim();
      if (typeof window.LStopperRequireAiKey === 'function') {
        const hasAiKey = await window.LStopperRequireAiKey();
        if (!hasAiKey) return;
      }
      const okStart = typeof LDialog !== 'undefined'
        ? await LDialog.confirm(
      'STOPPER Audio akan memproses rekaman menjadi narasi kronologi.\n\n' +
      'Yang akan dilakukan:\n' +
      '- membaca atau mentranskripsikan audio yang dipilih;\n' +
      '- menyusun hasilnya menjadi kronologi kejadian dari awal sampai akhir;\n' +
      '- memperbaiki bahasa menjadi baku sesuai KBBI;\n' +
      '- menggabungkan keterangan yang terpisah menjadi narasi yang padu;\n' +
      '- menjaga istilah Litmas, seperti penggunaan kata klien.\n\n' +
      (existingText ? 'Isi kronologi yang ada akan ditampilkan sebagai pembanding. ' : '') +
      'Lanjutkan?'
    )
    : confirm(
      'STOPPER Audio akan memproses rekaman menjadi narasi kronologi. ' +
      (existingText ? 'Isi kronologi yang ada akan ditampilkan sebagai pembanding. ' : '') +
      'Lanjutkan?'
    );
  if (!okStart) return;

  const btn = document.getElementById('btn-ai-kronologi-int') || document.getElementById('btn-kron-stopper-int');
  const lbl = document.getElementById('btn-ai-kron-lbl-int') || document.getElementById('btn-kron-stopper-lbl-int');
  if (btn) btn.disabled = true;
  if (lbl) lbl.textContent = 'Memproses...';
  if (window.LStopperLoading) {
    window.LStopperLoading.show({
      title: 'STOPPER AI',
      message: 'Menyiapkan audio rekaman...',
      detail: 'AI sedang mentranskripsi audio dan menyusun kronologi.',
      steps: ['Menyiapkan audio rekaman...', 'Mentranskripsikan isi audio...', 'Menyusun narasi kronologi...', 'Memperbaiki bahasa dan alur...', 'Menyiapkan hasil kronologi...'],
      interval: 4200
    });
  }

  const namaKlien = (
    (document.getElementById('f-nama-klien')?.value || '') ||
    (document.getElementById('f1-nama')?.value || '')
  ).trim();
  const pidana = typeof getPidanaPutusanForKronologi === 'function'
    ? getPidanaPutusanForKronologi()
    : (document.getElementById('f6-jenis-pidana')?.value || '').trim();

  const audioList = store.map(r => ({
    id: r.id,
    audio_b64: r.audio_b64 || '',
    audio_path: r.audio_path || '',
    duration: r.duration,
    filename: r.filename || null,
    mime: r.mime || null,
    size: r.size || 0
  }));

  // Gunakan callback async — hasil dikirim Python via _safe_eval_js ke __onAiKronResult
  window.__onAiKronResult = async function (res) {
    delete window.__onAiKronResult;
    try {
      if (res && res.ok) {
        if (window.LStopperLoading) window.LStopperLoading.hide();
        var applied = await _reviewAndApplyKronologi(ta, res.kronologi || '', 'Audio', res.model || '');
        if (applied && typeof toast === 'function') toast('Kronologi berhasil dibuat dari audio!');
      } else if (res && !res.pending) {
        const msg = 'Gagal: ' + (res?.err || 'Error tidak diketahui');
        if (typeof LDialog !== 'undefined') await LDialog.alert(msg);
        else alert(msg);
      }
    } finally {
      if (window.LStopperLoading) {
        if (!res || !res.ok) window.LStopperLoading.hide();
      }
      if (btn) btn.disabled = false;
      if (lbl) lbl.textContent = 'STOPPER';
    }
  };

  // Panggil API — langsung return, hasil datang via __onAiKronResult
  window.pywebview.api.ai_audio_to_kronologi(
    JSON.stringify(audioList), namaKlien, pidana
  );
};


