// LIBERO: Runtime panduan aplikasi dan penampil PDF.
(function () {
  'use strict';

  var GUIDE_PDF_URL = 'docs/PANDUAN PENGGUNAAN APLIKASI LIBERO 2.pdf';
  var GUIDE_PDFJS_URL = 'assets/vendor/pdfjs/pdf.min.js';
  var GUIDE_WORKER_URL = 'assets/vendor/pdfjs/pdf.worker.min.js';
  var GUIDE_PAGE_FLIP_URL = 'assets/vendor/page-flip/page-flip.browser.js';
  var GUIDE_NAV_AUDIO_URL = 'assets/audio/ui-fire.mp3';
  var GUIDE_WEB_URL = 'https://github.com/inaldy31/LIBERO/blob/main/docs/PANDUAN%20PENGGUNAAN%20APLIKASI%20LIBERO%202.pdf';

  var DEFAULT_TOC = [
    { level: 0, title: 'Halaman Sampul', page: 0 },
    { level: 0, title: 'Kata Pengantar', page: 2 },
    { level: 0, title: 'Uraian Singkat Aplikasi', page: 3 },
    { level: 0, title: 'Daftar Isi', page: 4 },
    { level: 1, title: 'I. Pendahuluan', page: 8 },
    { level: 1, title: 'II. Pendaftaran Perangkat Baru', page: 9 },
    { level: 2, title: 'Buka Formulir Pendaftaran', page: 9 },
    { level: 2, title: 'Isi Data Pendaftaran', page: 9 },
    { level: 2, title: 'Kirim Kode ke Pengembang', page: 9 },
    { level: 2, title: 'Jalankan di Perangkat yang Telah Terdaftar', page: 10 },
    { level: 1, title: 'III. Keamanan, Fitur Utama, Pintasan Keyboard, dan Saran Praktis', page: 10 },
    { level: 2, title: 'Koneksi Internet', page: 10 },
    { level: 2, title: 'Validasi dan Kerahasiaan Data', page: 11 },
    { level: 2, title: 'Tombol Aksi Utama', page: 12 },
    { level: 2, title: 'Fitur Universal dan Pintasan Keyboard', page: 14 },
    { level: 2, title: 'Fitur Pengingat Kolom Kosong', page: 16 },
    { level: 2, title: 'Penanganan Data Kosong pada Laporan Akhir', page: 16 },
    { level: 2, title: 'Fitur Tetapkan Data', page: 17 },
    { level: 2, title: 'Penyimpanan Otomatis', page: 18 },
    { level: 2, title: 'Pembaruan Otomatis', page: 18 },
    { level: 2, title: 'Tema Tampilan', page: 20 },
    { level: 1, title: 'IV. Cara Menjalankan Aplikasi', page: 23 },
    { level: 1, title: 'V. Mengisi Data Umum', page: 28 },
    { level: 2, title: 'Data UPT', page: 28 },
    { level: 2, title: 'Data Surat Dinas', page: 30 },
    { level: 2, title: 'Halaman Sampul Litmas', page: 31 },
    { level: 1, title: 'VI. Mengisi Pendahuluan', page: 32 },
    { level: 1, title: 'VII. Mengisi Identitas Klien, Keluarga, dan Penjamin/Wali', page: 33 },
    { level: 2, title: 'Data Klien', page: 33 },
    { level: 2, title: 'Data Ayah, Ibu, Suami/Istri, Penjamin, dan Wali', page: 36 },
    { level: 2, title: 'Susunan Keluarga', page: 37 },
    { level: 1, title: 'VIII. Mengisi Riwayat Hidup dan Perkembangan Klien', page: 39 },
    { level: 2, title: 'Riwayat Kelahiran, Pertumbuhan, dan Perkembangan Klien', page: 39 },
    { level: 2, title: 'Riwayat Pendidikan', page: 40 },
    { level: 2, title: 'Riwayat Tingkah Laku Klien', page: 42 },
    { level: 2, title: 'Riwayat Pernikahan Klien', page: 44 },
    { level: 1, title: 'IX. Mengisi Kondisi Klien Anak', page: 44 },
    { level: 2, title: 'Status dan Kondisi Klien Anak', page: 44 },
    { level: 2, title: 'Kemandirian dan Relasi Sosial', page: 45 },
    { level: 1, title: 'X. Mengisi Kondisi Penjamin/Orang Tua/Wali', page: 46 },
    { level: 2, title: 'Riwayat Pernikahan Penjamin/Orang Tua/Wali', page: 46 },
    { level: 2, title: 'Relasi dalam Keluarga', page: 47 },
    { level: 2, title: 'Relasi dengan Masyarakat', page: 47 },
    { level: 2, title: 'Pekerjaan dan Keadaan Ekonomi', page: 47 },
    { level: 1, title: 'XI. Mengisi Kondisi Lingkungan Sosial Budaya', page: 49 },
    { level: 2, title: 'Relasi Sosial Antar Anggota Masyarakat', page: 49 },
    { level: 2, title: 'Kondisi Sosial, Budaya, dan Lingkungan', page: 49 },
    { level: 1, title: 'XII. Mengisi Riwayat Dugaan Tindak Pidana', page: 51 },
    { level: 2, title: 'Latar Belakang Tindak Pidana', page: 51 },
    { level: 2, title: 'Kronologis', page: 51 },
    { level: 2, title: 'Keadaan Korban dan Tanggapan Korban', page: 52 },
    { level: 2, title: 'Akibat Tindak Pidana', page: 52 },
    { level: 1, title: 'XIII. Mengisi Tanggapan Berbagai Pihak', page: 52 },
    { level: 2, title: 'Tanggapan Klien', page: 53 },
    { level: 2, title: 'Tanggapan Keluarga Klien', page: 53 },
    { level: 2, title: 'Tanggapan Pihak Korban', page: 53 },
    { level: 2, title: 'Tanggapan Masyarakat', page: 54 },
    { level: 2, title: 'Tanggapan Pemerintah Setempat', page: 54 },
    { level: 1, title: 'XIV. Mengisi Evaluasi Perkembangan Pembinaan Klien di Lapas', page: 54 },
    { level: 2, title: 'Evaluasi Program Admisi, Orientasi, dan Observasi', page: 54 },
    { level: 2, title: 'Tahapan Pembinaan', page: 54 },
    { level: 2, title: 'Program Pembinaan', page: 55 },
    { level: 2, title: 'Relasi Sosial Klien di Dalam Lapas', page: 55 },
    { level: 1, title: 'XV. Mengisi Hasil/Rekomendasi Asesmen', page: 56 },
    { level: 2, title: 'Asesmen Risiko Residivisme Indonesia', page: 57 },
    { level: 2, title: 'Asesmen Kebutuhan Kriminogenik', page: 58 },
    { level: 2, title: 'Opsi Laporan Asesmen', page: 60 },
    { level: 1, title: 'XVI. Mengisi Pelaksanaan Diversi', page: 61 },
    { level: 2, title: 'Syarat Formil Diversi', page: 61 },
    { level: 2, title: 'Persetujuan Korban', page: 61 },
    { level: 1, title: 'XVII. Mengisi Analisis', page: 61 },
    { level: 1, title: 'XVIII. Mengisi Kesimpulan dan Rekomendasi', page: 63 },
    { level: 2, title: 'Kesimpulan', page: 63 },
    { level: 2, title: 'Rekomendasi', page: 64 },
    { level: 2, title: 'Pendaftaran TPP Secara Daring', page: 65 },
    { level: 1, title: 'XIX. Mengisi Bagian Penutup', page: 67 },
    { level: 2, title: 'Tanda Tangan Petugas', page: 67 },
    { level: 2, title: 'Lampirkan Dokumentasi', page: 67 },
    { level: 2, title: 'Menghasilkan Dokumen', page: 68 },
    { level: 2, title: 'Final Sebelum Mengirim Laporan', page: 69 },
    { level: 1, title: 'XX. Penutup', page: 69 }
  ];

  var state = {
    overlay: null,
    pdf: null,
    pdfUrl: '',
    info: null,
    pageCount: 0,
    pageRatio: 1.414,
    pageFlip: null,
    pageEls: [],
    rendered: {},
    rendering: {},
    currentPage: 0,
    pendingScrollPage: -1,
    pageWidth: 420,
    pageHeight: 594,
    zoom: 1,
    viewMode: 'book',
    tocHidden: false,
    loaded: false,
    loading: false,
    toc: [],
    resizeTimer: null,
    rerenderTimer: null,
    scrollSyncTimer: null,
    scrollRenderTimer: null,
    scriptLoads: {},
    pointers: {},
    pinchStartDistance: 0,
    pinchStartZoom: 1,
    fallbackAudio: null
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function ensureGuideOverlay() {
    if (byId('guide-viewer-overlay')) return byId('guide-viewer-overlay');
    if (!document.body) return null;
    var overlay = document.createElement('div');
    overlay.id = 'guide-viewer-overlay';
    overlay.className = 'guide-overlay';
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = [
      '<div class="guide-shell" role="dialog" aria-modal="true" aria-labelledby="guide-title">',
        '<div class="guide-header">',
          '<div>',
            '<div class="guide-eyebrow">LIBERO</div>',
            '<div id="guide-title" class="guide-title">Buku Panduan</div>',
          '</div>',
          '<div class="guide-toolbar">',
            '<button type="button" id="guide-toggle-toc" class="guide-tool-btn" title="Sembunyikan daftar isi" aria-label="Sembunyikan daftar isi" aria-pressed="false">',
              '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /><path d="M6 8h0" /><path d="M6 12h0" /><path d="M6 16h0" /></svg>',
            '</button>',
            '<button type="button" id="guide-toggle-mode" class="guide-tool-btn" title="Mode slide ke bawah" aria-label="Mode slide ke bawah" aria-pressed="false">',
              '<svg viewBox="0 0 24 24"><rect x="7" y="3" width="10" height="7" rx="1" /><rect x="7" y="14" width="10" height="7" rx="1" /><path d="M12 10v4" /><path d="m9 12 3 3 3-3" /></svg>',
            '</button>',
            '<button type="button" id="guide-prev" class="guide-tool-btn" title="Halaman sebelumnya" aria-label="Halaman sebelumnya">',
              '<svg viewBox="0 0 24 24"><path d="M15 18 9 12l6-6" /></svg>',
            '</button>',
            '<div id="guide-page-label" class="guide-page-label">0 / 0</div>',
            '<button type="button" id="guide-next" class="guide-tool-btn" title="Halaman berikutnya" aria-label="Halaman berikutnya">',
              '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>',
            '</button>',
            '<button type="button" id="guide-zoom-out" class="guide-tool-btn" title="Perkecil" aria-label="Perkecil">',
              '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M8 11h6" /><path d="m16 16 5 5" /></svg>',
            '</button>',
            '<button type="button" id="guide-zoom-reset" class="guide-zoom-label" title="Kembali ke ukuran normal">100%</button>',
            '<button type="button" id="guide-zoom-in" class="guide-tool-btn" title="Perbesar" aria-label="Perbesar">',
              '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M8 11h6" /><path d="M11 8v6" /><path d="m16 16 5 5" /></svg>',
            '</button>',
            '<button type="button" id="guide-close" class="guide-tool-btn guide-close" title="Tutup" aria-label="Tutup">',
              '<svg viewBox="0 0 24 24"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>',
            '</button>',
          '</div>',
        '</div>',
        '<div class="guide-content">',
          '<aside class="guide-toc">',
            '<div class="guide-toc-title">Daftar Isi</div>',
            '<div id="guide-toc-list" class="guide-toc-list"></div>',
          '</aside>',
          '<section class="guide-reader">',
            '<div id="guide-status" class="guide-status">Memuat buku panduan...</div>',
            '<div id="guide-book-stage" class="guide-stage">',
              '<div id="guide-book" class="guide-book"></div>',
            '</div>',
          '</section>',
        '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);
    return overlay;
  }

  function parseResult(raw) {
    if (!raw) return {};
    if (typeof raw === 'string') {
      try { return JSON.parse(raw); } catch (e) { return {}; }
    }
    return raw;
  }

  function clamp(value, min, max) {
    value = Number(value) || 0;
    return Math.max(min, Math.min(max, value));
  }

  function hasPyApi(name) {
    return !!(window.pywebview && window.pywebview.api && window.pywebview.api[name]);
  }

  function setStatus(message, type) {
    var el = byId('guide-status');
    if (!el) return;
    el.textContent = message || '';
    el.className = 'guide-status' + (type ? ' ' + type : '');
    el.style.display = message ? 'flex' : 'none';
  }

  function setLoading(isLoading) {
    var shell = byId('guide-viewer-overlay');
    if (shell) shell.classList.toggle('is-loading', !!isLoading);
  }

  function setZoomLabel() {
    var label = byId('guide-zoom-label') || byId('guide-zoom-reset');
    if (label) label.textContent = Math.round(state.zoom * 100) + '%';
  }

  function setPageLabel() {
    var label = byId('guide-page-label');
    if (!label) return;
    if (!state.pageCount) {
      label.textContent = '0 / 0';
      return;
    }
    var range = visibleRange();
    var current = range.start === range.end
      ? String(range.start + 1)
      : String(range.start + 1) + '-' + String(range.end + 1);
    label.textContent = current + ' / ' + state.pageCount;
  }

  function setTocHidden(hidden) {
    state.tocHidden = !!hidden;
    var overlay = byId('guide-viewer-overlay');
    var shell = overlay ? overlay.querySelector('.guide-shell') : null;
    var button = byId('guide-toggle-toc');
    if (shell) shell.classList.toggle('guide-toc-hidden', state.tocHidden);
    if (button) {
      button.classList.toggle('active', state.tocHidden);
      button.setAttribute('aria-pressed', state.tocHidden ? 'true' : 'false');
      button.setAttribute('aria-label', state.tocHidden ? 'Tampilkan daftar isi' : 'Sembunyikan daftar isi');
      button.title = state.tocHidden ? 'Tampilkan daftar isi' : 'Sembunyikan daftar isi';
    }
    resizeBookSoon();
  }

  function isScrollMode() {
    return state.viewMode === 'scroll';
  }

  function syncModeUi() {
    var overlay = byId('guide-viewer-overlay');
    var shell = overlay ? overlay.querySelector('.guide-shell') : null;
    var button = byId('guide-toggle-mode');
    if (shell) {
      shell.classList.toggle('guide-scroll-mode', isScrollMode());
      shell.classList.toggle('guide-zoomed', Math.abs(state.zoom - 1) > 0.01);
    }
    if (button) {
      button.classList.toggle('active', isScrollMode());
      button.setAttribute('aria-pressed', isScrollMode() ? 'true' : 'false');
      button.setAttribute('aria-label', isScrollMode() ? 'Mode buku flip' : 'Mode slide ke bawah');
      button.title = isScrollMode() ? 'Mode buku flip' : 'Mode slide ke bawah';
    }
  }

  function setViewMode(mode) {
    var next = mode === 'scroll' ? 'scroll' : 'book';
    if (state.viewMode === next) return;
    var page = clamp(state.currentPage, 0, Math.max(0, state.pageCount - 1));
    state.viewMode = next;
    syncModeUi();
    if (state.loaded) {
      try {
        rebuildGuideView(page, true);
      } catch (e) {
        setStatus('Mode buku panduan gagal diganti.', 'error');
      }
    }
  }

  function playFlipSfx() {
    try {
      if (window._SFX && typeof window._SFX.fire === 'function') {
        window._SFX.fire();
        return;
      }
      if (!state.fallbackAudio) state.fallbackAudio = new Audio(GUIDE_NAV_AUDIO_URL);
      state.fallbackAudio.currentTime = 0;
      state.fallbackAudio.play().catch(function () {});
    } catch (e) {}
  }

  function configurePdfJs() {
    if (!window.pdfjsLib) return false;
    try {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = GUIDE_WORKER_URL;
    } catch (e) {}
    return true;
  }

  function loadScriptOnce(url, globalReady) {
    if (globalReady && globalReady()) return Promise.resolve();
    if (state.scriptLoads[url]) return state.scriptLoads[url];
    state.scriptLoads[url] = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error('Gagal memuat library: ' + url)); };
      document.head.appendChild(script);
    });
    return state.scriptLoads[url];
  }

  function loadViewerLibraries() {
    return loadScriptOnce(GUIDE_PDFJS_URL, function () {
      return !!window.pdfjsLib;
    }).then(function () {
      return loadScriptOnce(GUIDE_PAGE_FLIP_URL, function () {
        return !!(window.St && window.St.PageFlip);
      });
    });
  }

  function getGuideInfo() {
    if (hasPyApi('get_user_guide_info')) {
      return window.pywebview.api.get_user_guide_info().then(function (raw) {
        var info = parseResult(raw);
        if (info && info.ok && info.url) return info;
        return { ok: false, url: GUIDE_PDF_URL, fallback_url: GUIDE_WEB_URL, err: info.err || '' };
      });
    }
    return Promise.resolve({ ok: true, url: GUIDE_PDF_URL, fallback_url: GUIDE_WEB_URL, source: 'relative' });
  }

  function decodeBase64Pdf(b64) {
    var binary = atob(String(b64 || ''));
    var len = binary.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function loadPdfFromBase64() {
    if (!hasPyApi('get_user_guide_pdf_b64')) {
      return Promise.reject(new Error('PDF lokal tidak bisa dibaca dari WebView.'));
    }
    setStatus('Memuat PDF lokal dari aplikasi...');
    return window.pywebview.api.get_user_guide_pdf_b64().then(function (raw) {
      var res = parseResult(raw);
      if (!res || !res.ok || !res.b64) {
        throw new Error((res && res.err) || 'PDF panduan tidak ditemukan.');
      }
      return window.pdfjsLib.getDocument({ data: decodeBase64Pdf(res.b64) }).promise;
    });
  }

  function loadPdfDocument() {
    return getGuideInfo().then(function (info) {
      state.info = info || {};
      state.pdfUrl = state.info.url || GUIDE_PDF_URL;
      setStatus('Membuka buku panduan...');
      return window.pdfjsLib.getDocument({ url: state.pdfUrl }).promise.catch(function () {
        return loadPdfFromBase64();
      });
    });
  }

  function getFirstPageRatio(pdf) {
    return pdf.getPage(1).then(function (page) {
      var viewport = page.getViewport({ scale: 1 });
      if (viewport.width > 0 && viewport.height > 0) {
        state.pageRatio = viewport.height / viewport.width;
      }
    }).catch(function () {});
  }

  function computeBookSize() {
    var stage = byId('guide-book-stage');
    var rect = stage ? stage.getBoundingClientRect() : { width: 960, height: 640 };
    var availableW = Math.max(320, rect.width - 28);
    var availableH = Math.max(360, rect.height - 28);
    var ratio = state.pageRatio || 1.414;
    var pageW = isScrollMode()
      ? Math.min(760, Math.floor(availableW - 28), Math.floor(availableH / ratio))
      : Math.min(520, Math.floor((availableW / 2) - 8));
    var pageH = Math.floor(pageW * ratio);

    if (!isScrollMode() && pageH > availableH) {
      pageH = Math.floor(availableH);
      pageW = Math.floor(pageH / ratio);
    }

    if (!isScrollMode() && availableW < 760) {
      pageW = Math.min(Math.floor(availableW - 24), Math.floor(availableH / ratio));
      pageH = Math.floor(pageW * ratio);
    }

    if (!isScrollMode()) {
      pageW = Math.round(pageW * state.zoom);
      pageH = Math.round(pageH * state.zoom);
    }

    state.pageWidth = clamp(pageW, 240, isScrollMode() ? 760 : 1400);
    state.pageHeight = clamp(pageH, 340, isScrollMode() ? 1080 : 2000);
  }

  function resetBookNode() {
    var stage = byId('guide-book-stage');
    if (!stage) return null;
    clearTimeout(state.resizeTimer);
    clearTimeout(state.scrollRenderTimer);
    state.pendingScrollPage = -1;
    if (state.scrollSyncTimer) {
      try { window.cancelAnimationFrame(state.scrollSyncTimer); } catch (e) {}
      state.scrollSyncTimer = null;
    }
    if (state.pageFlip) {
      try { state.pageFlip.destroy(); } catch (e) {}
      state.pageFlip = null;
    }
    releaseRenderedPages(false);
    state.pageEls = [];
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
    stage.innerHTML = '<div id="guide-book" class="guide-book"></div>';
    return byId('guide-book');
  }

  function cssPageWidth() {
    return Math.max(180, Math.round(state.pageWidth * (isScrollMode() ? state.zoom : 1)));
  }

  function cssPageHeight() {
    return Math.max(250, Math.round(state.pageHeight * (isScrollMode() ? state.zoom : 1)));
  }

  function createPagePlaceholder(pageIndex) {
    var page = document.createElement('div');
    page.className = 'guide-page';
    page.dataset.pageIndex = String(pageIndex);
    page.style.width = cssPageWidth() + 'px';
    page.style.height = cssPageHeight() + 'px';
    page.innerHTML =
      '<div class="guide-page-placeholder">' +
      '<span>Halaman ' + (pageIndex + 1) + '</span>' +
      '</div>';
    return page;
  }

  function createPageElements(book) {
    releaseRenderedPages(false);
    state.pageEls = [];
    state.rendered = {};
    state.rendering = {};
    book.innerHTML = '';
    for (var i = 0; i < state.pageCount; i += 1) {
      var page = createPagePlaceholder(i);
      state.pageEls.push(page);
      book.appendChild(page);
    }
  }

  function pageIsRendered(index) {
    var item = state.rendered[index];
    if (!item) return false;
    return Math.abs(item.zoom - state.zoom) < 0.01;
  }

  function releaseCanvas(canvas) {
    if (!canvas) return;
    try {
      canvas.width = 0;
      canvas.height = 0;
    } catch (e) {}
    try {
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    } catch (e) {}
  }

  function releasePageCanvases(pageEl) {
    if (!pageEl) return;
    try {
      Array.prototype.forEach.call(pageEl.querySelectorAll('canvas'), releaseCanvas);
    } catch (e) {}
  }

  function pagePlaceholderHtml(index) {
    return '<div class="guide-page-placeholder"><span>Halaman ' + (index + 1) + '</span></div>';
  }

  function releaseRenderedPage(index, keepPlaceholder) {
    index = Number(index);
    var item = state.rendered[index];
    if (item && item.canvas) releaseCanvas(item.canvas);
    var pageEl = state.pageEls[index];
    if (pageEl) {
      releasePageCanvases(pageEl);
      if (keepPlaceholder) pageEl.innerHTML = pagePlaceholderHtml(index);
    }
    delete state.rendered[index];
  }

  function releaseRenderedPages(keepPlaceholders) {
    Object.keys(state.rendered || {}).forEach(function (key) {
      releaseRenderedPage(Number(key), !!keepPlaceholders);
    });
    state.pageEls.forEach(function (pageEl, index) {
      if (!pageEl) return;
      releasePageCanvases(pageEl);
      if (keepPlaceholders) pageEl.innerHTML = pagePlaceholderHtml(index);
    });
    state.rendered = {};
  }

  function renderPage(index, force) {
    index = Number(index);
    if (!state.pdf || index < 0 || index >= state.pageCount) return Promise.resolve();
    if (!force && pageIsRendered(index)) return Promise.resolve();
    if (state.rendering[index]) return state.rendering[index];

    var pageEl = state.pageEls[index];
    if (!pageEl) return Promise.resolve();
    pageEl.classList.add('is-rendering');

    var promise = state.pdf.getPage(index + 1).then(function (pdfPage) {
      var viewport1 = pdfPage.getViewport({ scale: 1 });
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var renderWidth = isScrollMode() ? cssPageWidth() : state.pageWidth;
      var scale = (renderWidth / viewport1.width) * dpr;
      var viewport = pdfPage.getViewport({ scale: scale });
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d', { alpha: false });

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = '100%';
      canvas.style.height = '100%';

      var renderTask = pdfPage.render({ canvasContext: ctx, viewport: viewport });
      return renderTask.promise.then(function () {
        if (!state.overlay || state.overlay.style.display === 'none') {
          releaseCanvas(canvas);
          pageEl.classList.remove('is-rendering');
          return;
        }
        releaseRenderedPage(index, false);
        pageEl.innerHTML = '';
        pageEl.appendChild(canvas);
        pageEl.classList.remove('is-rendering');
        state.rendered[index] = { zoom: state.zoom, canvas: canvas };
      });
    }).catch(function () {
      pageEl.classList.remove('is-rendering');
      pageEl.innerHTML = '<div class="guide-page-placeholder error"><span>Gagal memuat halaman</span></div>';
    }).then(function () {
      delete state.rendering[index];
    });

    state.rendering[index] = promise;
    return promise;
  }

  function cleanupPages(minIndex, maxIndex) {
    Object.keys(state.rendered).forEach(function (key) {
      var index = Number(key);
      if (index >= minIndex && index <= maxIndex) return;
      releaseRenderedPage(index, true);
    });
  }

  function visibleRange() {
    var start = clamp(state.currentPage, 0, Math.max(0, state.pageCount - 1));
    var end = start;
    try {
      if (!isScrollMode() && state.pageFlip && state.pageFlip.getOrientation && state.pageFlip.getOrientation() === 'landscape') {
        end = Math.min(state.pageCount - 1, start + 1);
      }
    } catch (e) {}
    return { start: start, end: end };
  }

  function ensureRenderWindow(force) {
    if (!state.pdf) return;
    var range = visibleRange();
    var renderPadBefore = isScrollMode() ? 1 : 1;
    var renderPadAfter = isScrollMode() ? 3 : 1;
    var keepPadBefore = isScrollMode() ? 3 : 2;
    var keepPadAfter = isScrollMode() ? 5 : 2;
    var renderStart = Math.max(0, range.start - renderPadBefore);
    var renderEnd = Math.min(state.pageCount - 1, range.end + renderPadAfter);
    var keepStart = Math.max(0, range.start - keepPadBefore);
    var keepEnd = Math.min(state.pageCount - 1, range.end + keepPadAfter);

    for (var i = renderStart; i <= renderEnd; i += 1) {
      renderPage(i, !!force);
    }
    cleanupPages(keepStart, keepEnd);
    updateActiveToc();
    setPageLabel();
  }

  function scheduleScrollRenderWindow() {
    clearTimeout(state.scrollRenderTimer);
    state.scrollRenderTimer = setTimeout(function () {
      state.scrollRenderTimer = null;
      if (isScrollMode()) ensureRenderWindow(false);
    }, 90);
  }

  function applyZoomTransform() {
    var book = byId('guide-book');
    if (!book) return;
    book.style.transform = '';
    book.style.transformOrigin = '';
  }

  function rerenderVisibleSoon() {
    clearTimeout(state.rerenderTimer);
    state.rerenderTimer = setTimeout(function () {
      ensureRenderWindow(true);
    }, 180);
  }

  function setZoom(value) {
    var next = clamp(value, 0.75, 2.25);
    if (Math.abs(next - state.zoom) < 0.01) return;
    state.zoom = next;
    setZoomLabel();
    syncModeUi();
    if (state.loaded) {
      resizeBookSoon();
      return;
    }
    applyZoomTransform();
  }

  function turnToPage(index) {
    index = clamp(index, 0, Math.max(0, state.pageCount - 1));
    state.currentPage = index;
    if (isScrollMode()) {
      scrollToPage(index, true);
    } else if (state.pageFlip) {
      try { state.pageFlip.turnToPage(index); } catch (e) {}
    }
    ensureRenderWindow(false);
  }

  function turnPrev() {
    if (isScrollMode()) {
      turnToPage(state.currentPage - 1);
      return;
    }
    if (!state.pageFlip) return;
    try { state.pageFlip.flipPrev('top'); } catch (e) { turnToPage(state.currentPage - 1); }
  }

  function turnNext() {
    if (isScrollMode()) {
      turnToPage(state.currentPage + 1);
      return;
    }
    if (!state.pageFlip) return;
    try { state.pageFlip.flipNext('top'); } catch (e) { turnToPage(state.currentPage + 1); }
  }

  function readPageFlipCurrentPage(fallback) {
    var page = Number(fallback);
    try {
      if (state.pageFlip && state.pageFlip.getCurrentPageIndex) {
        var current = Number(state.pageFlip.getCurrentPageIndex());
        if (!isNaN(current)) page = current;
      }
    } catch (e) {}
    return clamp(isNaN(page) ? state.currentPage : page, 0, Math.max(0, state.pageCount - 1));
  }

  function initPageFlip(startPage) {
    if (!window.St || !window.St.PageFlip) {
      throw new Error('Library StPageFlip tidak tersedia.');
    }
    computeBookSize();
    var book = resetBookNode();
    if (!book) throw new Error('Kontainer buku panduan tidak tersedia.');
    book.style.width = Math.max(state.pageWidth * 2, state.pageWidth) + 'px';
    book.style.height = state.pageHeight + 'px';
    createPageElements(book);
    state.currentPage = clamp(typeof startPage === 'number' ? startPage : (state.currentPage || 0), 0, Math.max(0, state.pageCount - 1));
    state.pageFlip = new window.St.PageFlip(book, {
      width: state.pageWidth,
      height: state.pageHeight,
      size: 'fixed',
      drawShadow: true,
      flippingTime: 720,
      usePortrait: false,
      startPage: state.currentPage,
      startZIndex: 5,
      autoSize: false,
      maxShadowOpacity: 0.45,
      showCover: true,
      mobileScrollSupport: false,
      swipeDistance: 24,
      clickEventForward: false,
      useMouseEvents: true,
      showPageCorners: true
    });
    state.pageFlip.loadFromHTML(state.pageEls);
    state.pageFlip.on('flip', function (e) {
      state.currentPage = readPageFlipCurrentPage(e && e.data);
      playFlipSfx();
      ensureRenderWindow(false);
    });
    state.pageFlip.on('changeOrientation', function () {
      ensureRenderWindow(false);
    });
    applyZoomTransform();
    ensureRenderWindow(true);
  }

  function scrollToPage(index, smooth) {
    var stage = byId('guide-book-stage');
    var pageEl = state.pageEls[index];
    if (!stage || !pageEl) return;
    var top = Math.max(0, pageEl.offsetTop - 18);
    try {
      stage.scrollTo({ top: top, behavior: smooth === false ? 'auto' : 'smooth' });
    } catch (e) {
      stage.scrollTop = top;
    }
  }

  function syncCurrentPageFromScroll() {
    state.scrollSyncTimer = null;
    if (!isScrollMode()) return;
    var stage = byId('guide-book-stage');
    if (!stage || !state.pageEls.length) return;
    var stageRect = stage.getBoundingClientRect();
    var target = stageRect.top + (stageRect.height / 2);
    var bestIndex = state.currentPage;
    var bestDistance = Infinity;
    state.pageEls.forEach(function (pageEl, idx) {
      var rect = pageEl.getBoundingClientRect();
      var center = rect.top + (rect.height / 2);
      var distance = Math.abs(center - target);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = idx;
      }
    });
    if (bestIndex !== state.currentPage) {
      state.currentPage = bestIndex;
      setPageLabel();
      updateActiveToc();
      scheduleScrollRenderWindow();
      return;
    }
    setPageLabel();
    updateActiveToc();
  }

  function handleScrollModeScroll() {
    if (!isScrollMode()) return;
    if (state.scrollSyncTimer) return;
    state.scrollSyncTimer = window.requestAnimationFrame(syncCurrentPageFromScroll);
  }

  function initScrollPages(startPage) {
    computeBookSize();
    var book = resetBookNode();
    if (!book) throw new Error('Kontainer buku panduan tidak tersedia.');
    book.setAttribute('aria-label', 'Buku panduan mode slide vertikal');
    createPageElements(book);
    state.currentPage = clamp(typeof startPage === 'number' ? startPage : (state.currentPage || 0), 0, Math.max(0, state.pageCount - 1));
    applyZoomTransform();
    ensureRenderWindow(true);
    setTimeout(function () {
      scrollToPage(state.currentPage, false);
      ensureRenderWindow(false);
    }, 0);
  }

  function rebuildGuideView(startPage, forceRender) {
    syncModeUi();
    if (isScrollMode()) initScrollPages(startPage);
    else initPageFlip(startPage);
    if (forceRender) ensureRenderWindow(true);
  }

  function resolveOutlinePage(item) {
    if (!state.pdf || !item || !item.dest) return Promise.resolve(null);
    var destPromise = Array.isArray(item.dest) ? Promise.resolve(item.dest) : state.pdf.getDestination(item.dest);
    return destPromise.then(function (dest) {
      if (!dest || !dest[0]) return null;
      return state.pdf.getPageIndex(dest[0]);
    }).catch(function () { return null; });
  }

  function buildOutlineToc(items, level, output, tasks) {
    (items || []).forEach(function (item) {
      var entry = { level: level, title: item.title || 'Bagian', page: 0 };
      output.push(entry);
      tasks.push(resolveOutlinePage(item).then(function (page) {
        if (typeof page === 'number') entry.page = clamp(page, 0, Math.max(0, state.pageCount - 1));
      }));
      if (item.items && item.items.length) buildOutlineToc(item.items, level + 1, output, tasks);
    });
  }

  function loadToc() {
    return state.pdf.getOutline().then(function (outline) {
      if (!outline || !outline.length) {
        state.toc = DEFAULT_TOC.slice();
        return;
      }
      var items = [];
      var tasks = [];
      buildOutlineToc(outline, 1, items, tasks);
      return Promise.all(tasks).then(function () {
        state.toc = items.length ? items : DEFAULT_TOC.slice();
      });
    }).catch(function () {
      state.toc = DEFAULT_TOC.slice();
    });
  }

  function renderToc() {
    var list = byId('guide-toc-list');
    if (!list) return;
    list.innerHTML = '';
    state.lastActiveTocIndex = -1;
    state.toc.forEach(function (item, idx) {
      var button = document.createElement('button');
      var level = clamp(item.level || 1, 0, 3);
      button.type = 'button';
      button.className = 'guide-toc-item level-' + level;
      button.dataset.page = String(clamp(item.page, 0, Math.max(0, state.pageCount - 1)));
      button.dataset.index = String(idx);
      button.dataset.level = String(level);
      button.textContent = item.title || 'Bagian';
      button.addEventListener('click', function () {
        var page = Number(this.dataset.page);
        turnToPage(page);
      });
      list.appendChild(button);
    });
    updateActiveToc();
  }

  function updateActiveToc() {
    var list = byId('guide-toc-list');
    if (!list) return;
    var buttons = Array.prototype.slice.call(list.querySelectorAll('.guide-toc-item'));
    var activeIndex = -1;
    buttons.forEach(function (button, idx) {
      button.classList.remove('active');
      var page = Number(button.dataset.page);
      if (!isNaN(page) && page <= state.currentPage) activeIndex = idx;
    });
    if (activeIndex < 0) return;
    var highlightIndex = activeIndex;
    var activeLevel = Number(buttons[activeIndex].dataset.level);
    if (activeLevel > 1) {
      for (var i = activeIndex; i >= 0; i -= 1) {
        var level = Number(buttons[i].dataset.level);
        if (level <= 1) {
          highlightIndex = i;
          break;
        }
      }
    }
    buttons[highlightIndex].classList.add('active');
    if (state.lastActiveTocIndex !== highlightIndex) {
      state.lastActiveTocIndex = highlightIndex;
      try { buttons[highlightIndex].scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {}
    }
  }

  function loadGuideOnce() {
    if (state.loaded) {
      setStatus('');
      ensureRenderWindow(false);
      return Promise.resolve();
    }
    if (state.loading) return Promise.resolve();

    state.loading = true;
    setLoading(true);
    setStatus('Menyiapkan viewer buku panduan...');
    return loadViewerLibraries().then(function () {
      if (!configurePdfJs()) {
        throw new Error('Library PDF.js tidak tersedia.');
      }
      return loadPdfDocument();
    }).then(function (pdf) {
      state.pdf = pdf;
      state.pageCount = pdf.numPages || 0;
      setStatus('Menyiapkan halaman buku...');
        return getFirstPageRatio(pdf).then(loadToc).then(function () {
        renderToc();
        rebuildGuideView(0, true);
        state.loaded = true;
        setStatus('');
      });
    }).catch(function (err) {
      var message = (err && err.message) || 'Buku panduan gagal dimuat.';
      setStatus(message + ' Gunakan tombol Repositori jika perlu membuka panduan dari GitHub.', 'error');
      if (window.toastError) window.toastError('Buku panduan gagal dimuat.');
    }).then(function () {
      state.loading = false;
      setLoading(false);
    });
  }

  function openOverlay() {
    var overlay = ensureGuideOverlay();
    if (!overlay) return;
    state.overlay = overlay;
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('guide-viewer-open');
    setZoomLabel();
    setPageLabel();
    setTimeout(function () {
      loadGuideOnce();
    }, 20);
  }

  function closeOverlay() {
    var overlay = byId('guide-viewer-overlay');
    if (!overlay || overlay.style.display === 'none') return;
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('guide-viewer-open');
    clearTimeout(state.rerenderTimer);
    clearTimeout(state.scrollRenderTimer);
    clearTimeout(state.resizeTimer);
    releaseRenderedPages(true);
  }

  function resizeBookSoon() {
    if (!state.loaded || !state.overlay || state.overlay.style.display === 'none') return;
    clearTimeout(state.resizeTimer);
    state.resizeTimer = setTimeout(function () {
      var page = state.currentPage;
      rebuildGuideView(page, true);
    }, 180);
  }

  function pointerDistance(a, b) {
    var dx = a.clientX - b.clientX;
    var dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function activePointers() {
    return Object.keys(state.pointers).map(function (key) { return state.pointers[key]; });
  }

  function bindPinch(stage) {
    if (!stage || stage._guidePinchBound) return;
    stage._guidePinchBound = true;
    stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'touch') return;
      state.pointers[e.pointerId] = e;
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      var points = activePointers();
      if (points.length === 2) {
        state.pinchStartDistance = pointerDistance(points[0], points[1]);
        state.pinchStartZoom = state.zoom;
      }
    });
    stage.addEventListener('pointermove', function (e) {
      if (!state.pointers[e.pointerId]) return;
      state.pointers[e.pointerId] = e;
      var points = activePointers();
      if (points.length === 2 && state.pinchStartDistance > 0) {
        e.preventDefault();
        var dist = pointerDistance(points[0], points[1]);
        setZoom(state.pinchStartZoom * (dist / state.pinchStartDistance));
      }
    }, { passive: false });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (name) {
      stage.addEventListener(name, function (e) {
        delete state.pointers[e.pointerId];
        if (activePointers().length < 2) state.pinchStartDistance = 0;
      });
    });
  }

  function bindUi() {
    ensureGuideOverlay();
    var close = byId('guide-close');
    var toggleToc = byId('guide-toggle-toc');
    var toggleMode = byId('guide-toggle-mode');
    var prev = byId('guide-prev');
    var next = byId('guide-next');
    var zoomIn = byId('guide-zoom-in');
    var zoomOut = byId('guide-zoom-out');
    var zoomReset = byId('guide-zoom-reset');
    var overlay = byId('guide-viewer-overlay');
    var stage = byId('guide-book-stage');

    if (close) close.addEventListener('click', closeOverlay);
    if (toggleToc) toggleToc.addEventListener('click', function () { setTocHidden(!state.tocHidden); });
    if (toggleMode) toggleMode.addEventListener('click', function () { setViewMode(isScrollMode() ? 'book' : 'scroll'); });
    if (prev) prev.addEventListener('click', turnPrev);
    if (next) next.addEventListener('click', turnNext);
    if (zoomIn) zoomIn.addEventListener('click', function () { setZoom(state.zoom + 0.15); });
    if (zoomOut) zoomOut.addEventListener('click', function () { setZoom(state.zoom - 0.15); });
    if (zoomReset) zoomReset.addEventListener('click', function () { setZoom(1); });
    if (overlay) {
      overlay.addEventListener('mousedown', function (e) {
        if (e.target === overlay) closeOverlay();
      });
    }
    bindPinch(stage);
    if (stage) stage.addEventListener('scroll', handleScrollModeScroll, { passive: true });
    window.addEventListener('resize', resizeBookSoon);

    document.addEventListener('keydown', function (e) {
      var ov = byId('guide-viewer-overlay');
      if (!ov || ov.style.display === 'none') return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeOverlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        turnPrev();
      } else if (e.key === 'ArrowRight' || (isScrollMode() && e.key === 'ArrowDown')) {
        e.preventDefault();
        turnNext();
      } else if (isScrollMode() && e.key === 'ArrowUp') {
        e.preventDefault();
        turnPrev();
      }
    }, true);
    syncModeUi();
  }

  window.openGuideViewer = openOverlay;
  window.closeGuideViewer = closeOverlay;
  window.openUserGuidePage = function () {
    openOverlay();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindUi);
  } else {
    bindUi();
  }
})();
