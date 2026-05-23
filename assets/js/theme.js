// LIBERO: Penyimpanan tema dan penerapan tema webview.
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
    'vistuco': 'dark',
    'brain': 'dark',
    'blau': 'light',
    'weekday': 'light',
    'ceremonial': 'light',
    'pentahelix': 'light',
    'corona': 'light',
    'jason': 'light',
    'clown': 'light',
    'servant': 'light',
    'queasy': 'light',
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
    'vistuco': 'dark-shell',
    'brain': 'dark-shell',
    'blau': 'light-shell',
    'weekday': 'light-shell',
    'ceremonial': 'light-shell',
    'pentahelix': 'light-shell',
    'corona': 'light-shell',
    'jason': 'light-shell',
    'clown': 'light-shell',
    'servant': 'light-shell',
    'queasy': 'light-shell',
    'banyan-tree': 'split-shell',
    'preorder': 'split-shell',
    'bucharest': 'split-shell',
    'grandma': 'split-shell',
    'justin': 'split-shell',
  };
  var _menuOpen = false;
  var _current = window._LT || document.documentElement.getAttribute('data-theme') || DEFAULT;

  function themeBucket(name) {
    return THEME_BUCKETS[name] || 'dark';
  }

  function themeSurface(name) {
    return THEME_SURFACES[name] || 'dark-shell';
  }

  function applyThemeMetadata(root, name) {
    root.setAttribute('data-theme-bucket', themeBucket(name));
    root.setAttribute('data-theme-surface', themeSurface(name));
  }

  function applyEarlyTheme() {
    try {
      var theme = window._LT;
      applyThemeMetadata(document.documentElement, theme || DEFAULT);
      if (theme && theme !== DEFAULT && !document.documentElement.getAttribute('data-theme')) {
        document.documentElement.setAttribute('data-theme', theme);
      }
    } catch (_) {}
  }

  function applyVisual(name) {
    var root = document.documentElement;
    _current = name;
    if (name === DEFAULT) {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', name);
    }
    applyThemeMetadata(root, name);
    var theme = THEMES.find(function (item) { return item.id === name; }) || THEMES[0];
    var label = document.getElementById('theme-btn-label');
    if (label) label.textContent = theme.label;
    if (document.getElementById('theme-menu') && document.getElementById('theme-menu').style.display !== 'none') {
      buildMenu();
    }
  }

  function setTheme(name, fromUser) {
    applyVisual(name);
    if (fromUser) {
      saveTheme(name);
    }
  }

  function saveTheme(name, tries) {
    tries = tries || 0;
    try {
      if (window.pywebview && window.pywebview.api && window.pywebview.api.save_theme) {
        var result = window.pywebview.api.save_theme(name);
        if (result && result.catch) result.catch(function () {});
        return;
      }
    } catch (_) {}
    if (tries < 80) {
      setTimeout(function () { saveTheme(name, tries + 1); }, 250);
    }
  }

  function buildMenu() {
    var menu = document.getElementById('theme-menu-inner') || document.getElementById('theme-menu');
    if (!menu) return;
    menu.innerHTML = '';

    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:4px;';

    THEMES.forEach(function (theme) {
      var isActive = _current === theme.id;
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
        var active = _current === theme.id;
        this.style.background = active ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.03)';
        this.style.borderColor = active ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.07)';
      };

      var label = document.createElement('span');
      label.textContent = theme.label;
      label.style.cssText = 'line-height:1;color:' + (isActive ? '#fff' : 'rgba(255,255,255,.7)') + ';font-weight:' + (isActive ? '800' : '600') + ';';

      item.appendChild(label);
      item.onclick = function () { setTheme(theme.id, true); closeMenu(); };
      grid.appendChild(item);
    });

    menu.appendChild(grid);
  }

  function openMenu() {
    var menu = document.getElementById('theme-menu');
    if (!menu) return;
    buildMenu();
    menu.style.display = 'block';
    var button = document.getElementById('theme-btn');
    if (button) {
      var rect = button.getBoundingClientRect();
      var width = menu.offsetWidth || 480;
      var left = rect.right - width;
      if (left < 8) left = 8;
      if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
      menu.style.bottom = (window.innerHeight - rect.top + 6) + 'px';
      menu.style.left = left + 'px';
    }
    _menuOpen = true;
  }

  function closeMenu() {
    var menu = document.getElementById('theme-menu');
    if (menu) menu.style.display = 'none';
    _menuOpen = false;
  }

  window.toggleThemeMenu = function (event) {
    if (event && event.stopPropagation) event.stopPropagation();
    if (_menuOpen) closeMenu();
    else openMenu();
  };
  window.setTheme = setTheme;
  window.LiberoTheme = {
    applyEarlyTheme: applyEarlyTheme,
    buildMenu: buildMenu,
    setTheme: setTheme,
    themeBucket: themeBucket,
    themeSurface: themeSurface,
  };

  applyEarlyTheme();

  document.addEventListener('click', function (event) {
    var switcher = document.getElementById('theme-switcher');
    if (_menuOpen && switcher && !switcher.contains(event.target)) closeMenu();
  });

  document.addEventListener('DOMContentLoaded', function () {
    var dataTheme = document.documentElement.getAttribute('data-theme');
    _current = window._LT || dataTheme || DEFAULT;
    var button = document.getElementById('theme-btn');
    if (button && !button.__liberoThemeBound && !button.getAttribute('onclick')) {
      button.__liberoThemeBound = true;
      button.addEventListener('click', function (event) {
        window.toggleThemeMenu(event);
      });
    }
    applyVisual(_current);
    buildMenu();
  });
})();
