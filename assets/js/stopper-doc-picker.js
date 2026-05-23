// LIBERO: Pemilih dokumen Stopper dan state file terpilih.
(function installStopperDocPicker() {
  var styleInstalled = false;

  function _toastWarn(msg) {
    if (typeof toastWarning === 'function') toastWarning(msg, 3200);
    else if (typeof toast === 'function') toast(msg, 3200);
  }

  function _toastOk(msg) {
    if (typeof toastSuccess === 'function') toastSuccess(msg, 3200);
    else if (typeof toast === 'function') toast(msg, 3200);
  }

  function _toastErr(msg) {
    if (typeof toastError === 'function') toastError(msg, 4200);
    else if (typeof toast === 'function') toast(msg, 4200);
  }

  function _toastInfo(msg) {
    if (typeof toastInfo === 'function') toastInfo(msg, 3200);
    else if (typeof toast === 'function') toast(msg, 3200);
  }

  function installAiSettingsStyle() {
    if (document.getElementById('module-ai-settings-style')) return;
    var style = document.createElement('style');
    style.id = 'module-ai-settings-style';
    style.textContent = [
      '.ai-modal-overlay{position:fixed;inset:0;z-index:2147482500;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);opacity:0;transition:opacity .25s ease;pointer-events:none}',
      '.ai-modal-overlay.show{opacity:1;pointer-events:auto}',
      '.ai-modal{background:var(--navy-mid,var(--navy,var(--topbar-bg,#07111d)));border:1px solid rgba(var(--ac,212,175,55),.28);border-radius:16px;padding:24px 28px;width:640px;max-width:92vw;max-height:86vh;overflow:auto;box-shadow:0 24px 80px rgba(0,0,0,.6),0 0 0 1px rgba(var(--ac,212,175,55),.06);transform:translateY(16px) scale(.96);transition:transform .35s cubic-bezier(.16,1,.3,1);scrollbar-width:thin;scrollbar-color:rgba(var(--ac,212,175,55),.35) transparent}',
      '.ai-modal-overlay.show .ai-modal{transform:translateY(0) scale(1)}',
      '.ai-modal h3{margin:0 0 8px;font-size:18px;font-weight:800;color:rgba(var(--modal-tc,var(--tc,240,232,216)),.95);display:flex;align-items:center;gap:10px}',
      '.ai-modal .ai-title-badge{display:inline-flex;align-items:center;justify-content:center;width:38px;height:30px;border-radius:10px;border:1px solid rgba(var(--ac,212,175,55),.42);background:linear-gradient(135deg,rgba(var(--ac,212,175,55),.18),rgba(var(--modal-tc,var(--tc,240,232,216)),.045));color:rgb(var(--ac,212,175,55));font-size:12px;font-weight:900;letter-spacing:1px;box-shadow:inset 0 0 0 1px rgba(var(--modal-tc,var(--tc,240,232,216)),.035)}',
      '.ai-modal .ai-desc{font-size:12.5px;color:rgba(var(--modal-tc,var(--tc,240,232,216)),.62);margin-bottom:14px;line-height:1.55}',
      '.ai-modal .ai-link-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0 14px}',
      '.ai-modal .ai-provider-link,.ai-modal .ai-link-row a{display:flex;align-items:center;justify-content:center;gap:8px;min-height:38px;padding:8px 10px;border-radius:10px;background:rgba(var(--ac,212,175,55),.075);border:1px solid rgba(var(--ac,212,175,55),.18);color:rgb(var(--ac,212,175,55));text-decoration:none;font-size:11.5px;font-weight:800;transition:background .16s,border-color .16s,transform .16s}',
      '.ai-modal .ai-provider-link:hover,.ai-modal .ai-link-row a:hover{background:rgba(var(--ac,212,175,55),.15);border-color:rgba(var(--ac,212,175,55),.42);transform:translateY(-1px)}',
      '.ai-modal .ai-provider-link span,.ai-modal .ai-link-row a span,.ai-modal .ai-guide-card strong span,.ai-modal .ai-status span[class^="ai-"]{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;min-width:24px;min-height:24px;max-width:24px;max-height:24px;border-radius:8px;overflow:hidden;background:#fff;border:1px solid rgba(255,255,255,.12);color:rgb(var(--ac,212,175,55));font-weight:900;font-size:11px;letter-spacing:.2px}',
      '.ai-modal .ai-link-row a span svg,.ai-modal .ai-guide-card strong span svg{width:15px;height:15px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
      '.ai-modal .ai-link-row a span.ai-openai svg,.ai-modal .ai-guide-card strong span.ai-openai svg{width:16px;height:16px;stroke-width:1.55}',
      '.ai-modal .ai-link-row a span img,.ai-modal .ai-guide-card strong span img,.ai-modal .ai-status span[class^="ai-"] img{width:16px;height:16px;max-width:16px;max-height:16px;display:block;object-fit:contain;flex-shrink:0}',
      '.ai-modal .ai-field{display:flex;gap:8px;margin-bottom:12px}',
      '.ai-modal .ai-input{flex:1;background:var(--inp-bg,rgba(255,255,255,.07));border:1px solid rgba(var(--ac,212,175,55),.22);border-radius:8px;padding:10px 14px;color:rgba(var(--modal-tc,var(--tc,240,232,216)),.92);font-size:13px;font-family:inherit;outline:none;transition:border-color .2s}',
      '.ai-modal .ai-input:focus{border-color:rgba(var(--ac,212,175,55),.55)}',
      '.ai-modal .ai-input::placeholder{color:rgba(var(--modal-tc,var(--tc,240,232,216)),.32)}',
      '.ai-modal .ai-btn{background:rgba(var(--ac,212,175,55),.15);border:1px solid rgba(var(--ac,212,175,55),.32);color:rgb(var(--ac,212,175,55));border-radius:8px;padding:10px 16px;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit;white-space:nowrap}',
      '.ai-modal .ai-btn:hover{background:rgba(var(--ac,212,175,55),.26)}',
      '.ai-modal .ai-btn:active{transform:scale(.96)}',
      '.ai-modal .ai-btn.primary{background:rgb(var(--ac,212,175,55));color:var(--navy,#040f1e);border-color:transparent}',
      '.ai-modal .ai-btn.primary:hover{filter:brightness(1.1)}',
      '.ai-modal .ai-btn.danger{background:rgba(220,80,80,.15);border-color:rgba(220,80,80,.3);color:#f08080}',
      '.ai-modal .ai-btn.danger:hover{background:rgba(220,80,80,.25)}',
      '.ai-modal .ai-actions{position:sticky;bottom:-24px;display:flex;gap:8px;justify-content:flex-end;margin:16px -28px -24px;padding:14px 28px;flex-wrap:wrap;background:linear-gradient(180deg,rgba(var(--toast-bg,6,18,36),0),var(--navy-mid,var(--navy,var(--topbar-bg,#07111d))) 24%);border-top:1px solid rgba(var(--modal-tc,var(--tc,240,232,216)),.08)}',
      '.ai-modal .ai-status{font-size:12px;padding:8px 12px;border-radius:8px;margin-bottom:6px;display:flex;align-items:center;gap:8px}',
      '.ai-modal .ai-status::before{content:"";width:8px;height:8px;border-radius:50%;flex:0 0 auto;background:rgba(var(--modal-tc,var(--tc,240,232,216)),.42);box-shadow:0 0 0 3px rgba(var(--modal-tc,var(--tc,240,232,216)),.08)}',
      '.ai-modal .ai-status.ok{background:rgba(74,196,104,.12);border:1px solid rgba(74,196,104,.35);color:#6de890}',
      '.ai-modal .ai-status.ok::before{background:#6de890;box-shadow:0 0 0 3px rgba(74,196,104,.12)}',
      ':is([data-theme-bucket="light"],[data-theme-bucket="hybrid"]) .ai-modal .ai-status.ok{background:rgba(6,78,59,.08);border-color:rgba(6,78,59,.28);color:#064e3b}',
      ':is([data-theme-bucket="light"],[data-theme-bucket="hybrid"]) .ai-modal .ai-status.ok::before{background:#064e3b;box-shadow:0 0 0 3px rgba(6,78,59,.10)}',
      '.ai-modal .ai-status.err{background:rgba(220,80,80,.12);border:1px solid rgba(220,80,80,.35);color:#f09898}',
      '.ai-modal .ai-status.err::before{background:#f09898;box-shadow:0 0 0 3px rgba(220,80,80,.12)}',
      '.ai-modal .ai-status.idle{background:rgba(var(--ac,212,175,55),.09);border:1px solid rgba(var(--ac,212,175,55),.22);color:rgba(var(--modal-tc,var(--tc,240,232,216)),.52)}',
      '.ai-modal .ai-status.idle::before{background:rgba(var(--ac,212,175,55),.62);box-shadow:0 0 0 3px rgba(var(--ac,212,175,55),.10)}',
      '.ai-modal .ai-info-box{background:linear-gradient(180deg,rgba(var(--modal-tc,var(--tc,240,232,216)),.065),rgba(var(--modal-tc,var(--tc,240,232,216)),.035));border:1px solid rgba(var(--modal-tc,var(--tc,240,232,216)),.13);border-radius:12px;padding:14px;margin-bottom:12px;font-size:11.8px;color:rgba(var(--modal-tc,var(--tc,240,232,216)),.78);line-height:1.55}',
      '.ai-modal .ai-info-box strong{color:rgb(var(--ac,212,175,55))}',
      '.ai-modal .ai-feature-grid{display:grid;grid-template-columns:1fr;gap:8px;margin:12px 0 2px}',
      '.ai-modal .ai-feature{padding:10px;border-radius:10px;background:rgba(var(--ac,212,175,55),.07);border:1px solid rgba(var(--ac,212,175,55),.14)}',
      '.ai-modal .ai-feature b{display:block;color:rgb(var(--ac,212,175,55));margin-bottom:4px;font-size:11.5px}',
      '.ai-modal .ai-feature span{color:rgba(var(--modal-tc,var(--tc,240,232,216)),.66)}',
      '.ai-modal .ai-guide-box{background:rgba(var(--ac,212,175,55),.07);border:1px solid rgba(var(--ac,212,175,55),.18);border-radius:12px;padding:12px;margin-bottom:12px;font-size:11.5px;color:rgba(var(--modal-tc,var(--tc,240,232,216)),.8);line-height:1.5;max-height:240px;overflow:auto;scrollbar-width:thin;scrollbar-color:rgba(var(--ac,212,175,55),.35) transparent}',
      '.ai-modal .ai-guide-grid{display:grid;grid-template-columns:1fr;gap:10px}',
      '.ai-modal .ai-guide-card{background:rgba(var(--modal-tc,var(--tc,240,232,216)),.045);border:1px solid rgba(var(--modal-tc,var(--tc,240,232,216)),.1);border-radius:10px;padding:11px}',
      '.ai-modal .ai-guide-card strong{color:rgb(var(--ac,212,175,55));display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:7px;font-size:12.5px}',
      '.ai-modal .ai-guide-card ol{margin:0 0 8px 17px;padding:0}',
      '.ai-modal .ai-guide-card li{margin:0 0 4px}',
      '.ai-modal .ai-guide-card a{color:rgb(var(--ac,212,175,55));text-decoration:none;font-weight:700}',
      '.ai-modal .ai-guide-card a:hover{text-decoration:underline}',
      '.ai-modal .ai-guide-note{margin:7px 0 8px;padding:7px 8px;border-radius:6px;background:rgba(var(--ac,212,175,55),.08);border:1px solid rgba(var(--ac,212,175,55),.14);color:rgba(var(--modal-tc,var(--tc,240,232,216)),.72)}',
      '.ai-modal .ai-guide-note b{color:rgb(var(--ac,212,175,55))}',
      '@media(max-width:720px){.ai-modal{padding:20px;width:94vw}.ai-modal .ai-guide-grid,.ai-modal .ai-link-row,.ai-modal .ai-feature-grid{grid-template-columns:1fr}}'
    ].join('');
    document.head.appendChild(style);
  }

  function installModuleAiSettings() {
    if (typeof window.openAiSettings === 'function' && window.openAiSettings._liberoModuleAiSettings) return;
    window.openAiSettings = function () {
      var api = window.pywebview && window.pywebview.api;
      if (!api) {
        _toastErr('Bridge aplikasi belum siap.');
        return;
      }
      if (document.querySelector('.ai-modal-overlay[data-module-ai-settings="1"]')) return;
      installAiSettingsStyle();

      var overlay = document.createElement('div');
      overlay.className = 'ai-modal-overlay';
      overlay.setAttribute('data-module-ai-settings', '1');
      overlay.innerHTML =
        '<div class="ai-modal">' +
        '<h3>' +
        '<span class="ai-title-badge">AI</span>' +
        'Pengaturan STOPPER' +
        '</h3>' +
        '<div class="ai-desc">' +
        'Hubungkan API Key untuk mengaktifkan pembaca dokumen otomatis. STOPPER dapat memakai Gemini, Claude, atau OpenAI.' +
        '<div class="ai-link-row">' +
        '<a href="https://aistudio.google.com/app/apikey" target="_blank" title="Dapatkan API Key Google Gemini">&rarr; Gemini API (Gratis)</a>' +
        '<a href="https://console.anthropic.com/settings/keys" target="_blank" title="Dapatkan API Key Anthropic Claude">&rarr; Claude API</a>' +
        '<a href="https://platform.openai.com/api-keys" target="_blank" title="Dapatkan API Key OpenAI">&rarr; OpenAI (ChatGPT) API</a>' +
        '</div></div>' +
        '<div id="ai-status-box" class="ai-status idle">Memeriksa status...</div>' +
        '<div class="ai-field">' +
        '<input class="ai-input" id="ai-key-input" type="password" placeholder="Paste API Key di sini..." autocomplete="off" spellcheck="false">' +
        '<button class="ai-btn" id="ai-toggle-vis" title="Tampilkan/sembunyikan">Lihat</button>' +
        '</div>' +
        '<div id="ai-info-box" class="ai-info-box" style="display:none;">' +
        '<strong>Cara Kerja STOPPER</strong><br>' +
        'STOPPER membantu dua pekerjaan: membaca dokumen pendaftaran dan mengubah audio kronologi menjadi teks. Data tetap bisa diperiksa dan diedit manual sebelum dipakai.' +
        '<div class="ai-feature-grid">' +
        '<div class="ai-feature"><b>Analisis Dokumen</b><span>PDF atau gambar seperti KTP, KK, surat jaminan, dan litmas lama dianalisis dengan vision AI.</span></div>' +
        '<div class="ai-feature"><b>Ekstraksi Informasi</b><span>Nama, identitas, alamat, penjamin, dan informasi lain diringkas otomatis.</span></div>' +
        '<div class="ai-feature"><b>Pemetaan Data</b><span>Hasil bacaan dipetakan ke kolom LIBERO yang sesuai, lalu bisa dikoreksi manual.</span></div>' +
        '<div class="ai-feature"><b>Transkripsi Audio</b><span>Rekaman atau file audio kronologi diproses menjadi teks kronologi kejadian.</span></div>' +
        '<div class="ai-feature"><b>Pencarian Perkara</b><span>Menemukan dan mengekstrak data putusan secara otomatis berdasarkan nomor perkara atau kata kunci.</span></div>' +
        '</div><br>' +
        '<strong>Pilihan AI yang Didukung</strong><br>' +
        'Bisa memakai <strong>Google Gemini</strong>, <strong>Anthropic Claude</strong>, atau <strong>OpenAI ChatGPT</strong>. Jika salah satu AI mencapai batas kuota, STOPPER akan otomatis beralih ke AI lain yang tersedia agar pekerjaan tetap jalan.' +
        '</div>' +
        '<div id="ai-guide-box" class="ai-guide-box" style="display:none;">' +
        '<div class="ai-guide-grid">' +
        '<div class="ai-guide-card">' +
        '<strong>Google Gemini <span class="ai-gemini"><img src="assets/images/ai/gemini.svg" alt=""></span></strong>' +
        '<ol><li>Buka Google AI Studio.</li><li>Login dengan akun Google.</li><li>Klik Create API key.</li><li>Copy key, lalu paste ke STOPPER.</li><li>Untuk pay-as-you-go, aktifkan atau tautkan Billing Account di Google Cloud Console.</li></ol>' +
        '<div class="ai-guide-note"><b>Biaya:</b> bisa dicoba gratis dengan batas pemakaian harian. Untuk model/limit yang lebih baik, aktifkan Billing Account di Google Cloud dengan sistem pay-as-you-go. Jika akun mendapat Google Cloud/GenAI credits dari Google AI Pro atau Google Developer Program premium, credit itu dapat membantu biaya Gemini API setelah diterapkan ke billing account. Jumlah dan ketersediaan benefit bisa berbeda tiap akun/negara.</div>' +
        '<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">Buka Gemini API Key</a>' +
        '<br><a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener">Aktifkan Google Cloud Billing</a>' +
        '</div>' +
        '<div class="ai-guide-card">' +
        '<strong>Anthropic Claude <span class="ai-claude"><img src="assets/images/ai/claude.svg" alt=""></span></strong>' +
        '<ol><li>Buka Anthropic Console.</li><li>Login atau daftar akun.</li><li>Masuk menu API Keys.</li><li>Create key, copy, lalu paste ke STOPPER.</li></ol>' +
        '<div class="ai-guide-note"><b>Minimal beli:</b> saldo Claude API mulai dari $5 lewat Anthropic Console. Langganan Claude Pro/Max berbeda dan tidak otomatis memberi saldo API untuk STOPPER.</div>' +
        '<a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">Buka Claude API Key</a>' +
        '</div>' +
        '<div class="ai-guide-card">' +
        '<strong>OpenAI ChatGPT <span class="ai-openai"><img src="assets/images/ai/openai.svg" alt=""></span></strong>' +
        '<ol><li>Buka OpenAI Platform.</li><li>Login dengan akun OpenAI.</li><li>Klik Create new secret key.</li><li>Copy key, lalu paste ke STOPPER.</li></ol>' +
        '<div class="ai-guide-note"><b>Minimal beli:</b> saldo OpenAI API biasanya mulai dari $5. Langganan ChatGPT Plus/Pro berbeda dan tidak otomatis memberi saldo API untuk STOPPER.</div>' +
        '<a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">Buka OpenAI API Key</a>' +
        '</div>' +
        '</div></div>' +
        '<div class="ai-actions">' +
        '<div style="display:flex; gap:8px; margin-right:auto;">' +
        '<button class="ai-btn" id="ai-info-btn" title="Pelajari cara kerja STOPPER">Info</button>' +
        '<button class="ai-btn" id="ai-guide-btn" title="Panduan membuat API Key">Panduan API Key</button>' +
        '<button class="ai-btn danger" id="ai-remove-btn" style="display:none;">Hapus Key</button>' +
        '</div>' +
        '<button class="ai-btn" id="ai-test-btn">Test Koneksi</button>' +
        '<button class="ai-btn primary" id="ai-save-btn">Simpan</button>' +
        '<button class="ai-btn" id="ai-close-btn">Tutup</button>' +
        '</div></div>';

      document.body.appendChild(overlay);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { overlay.classList.add('show'); });
      });

      var input = overlay.querySelector('#ai-key-input');
      var statusBox = overlay.querySelector('#ai-status-box');
      var removeBtn = overlay.querySelector('#ai-remove-btn');
      var toggleVis = overlay.querySelector('#ai-toggle-vis');
      var providerLinks = overlay.querySelectorAll('.ai-link-row a');
      var infoBox = overlay.querySelector('#ai-info-box');
      var guideBox = overlay.querySelector('#ai-guide-box');
      var geminiLogo = '<span class="ai-gemini" aria-label="Gemini"><img src="assets/images/ai/gemini.svg" alt=""></span>';
      var claudeLogo = '<span class="ai-claude" aria-label="Claude"><img src="assets/images/ai/claude.svg" alt=""></span>';
      var openaiLogo = '<span class="ai-openai" aria-label="OpenAI"><img src="assets/images/ai/openai.svg" alt=""></span>';
      if (providerLinks[0]) providerLinks[0].innerHTML = 'Google Gemini ' + geminiLogo;
      if (providerLinks[1]) providerLinks[1].innerHTML = 'Anthropic Claude ' + claudeLogo;
      if (providerLinks[2]) providerLinks[2].innerHTML = 'OpenAI ChatGPT ' + openaiLogo;

      function updateStatus(res) {
        if (res && res.has_key) {
          statusBox.className = 'ai-status ok';
          var logo = '';
          if (res.provider === 'gemini') logo = geminiLogo;
          else if (res.provider === 'claude') logo = claudeLogo;
          else if (res.provider === 'openai') logo = openaiLogo;

          if (logo) {
            statusBox.innerHTML = '<span>API Key tersimpan: ' + (res.masked || '') + '</span>' + logo;
          } else {
            statusBox.textContent = 'API Key tersimpan: ' + (res.masked || '');
          }
          removeBtn.style.display = '';
        } else {
          statusBox.className = 'ai-status idle';
          statusBox.textContent = 'API Key belum diatur';
          removeBtn.style.display = 'none';
        }
      }

      if (typeof api.get_ai_key === 'function') {
        api.get_ai_key().then(updateStatus).catch(function () {
          statusBox.className = 'ai-status idle';
          statusBox.textContent = 'API Key belum diatur';
        });
      } else {
        updateStatus(null);
      }

      toggleVis.onclick = function () {
        input.type = input.type === 'password' ? 'text' : 'password';
        toggleVis.textContent = input.type === 'password' ? 'Lihat' : 'Sembunyi';
      };
      overlay.querySelector('#ai-info-btn').onclick = function () {
        window._SFX && window._SFX.fire();
        infoBox.style.display = infoBox.style.display === 'none' ? 'block' : 'none';
      };
      overlay.querySelector('#ai-guide-btn').onclick = function () {
        window._SFX && window._SFX.fire();
        guideBox.style.display = guideBox.style.display === 'none' ? 'block' : 'none';
      };
      overlay.querySelector('#ai-test-btn').onclick = function () {
        window._SFX && window._SFX.fire();
        var key = input.value.trim();
        if (!key) { _toastWarn('Masukkan API Key terlebih dahulu'); return; }
        if (typeof api.test_ai_key !== 'function') { _toastErr('Bridge test API Key belum tersedia.'); return; }
        statusBox.className = 'ai-status idle';
        statusBox.textContent = 'Menguji koneksi...';
        api.test_ai_key(key).then(function (res) {
          if (res && res.ok) {
            statusBox.className = 'ai-status ok';
            statusBox.textContent = res.msg || 'Koneksi berhasil!';
          } else {
            statusBox.className = 'ai-status err';
            statusBox.textContent = (res && res.err) || 'Gagal';
          }
        }).catch(function (err) {
          statusBox.className = 'ai-status err';
          statusBox.textContent = 'Error: ' + err;
        });
      };
      overlay.querySelector('#ai-save-btn').onclick = function () {
        window._SFX && window._SFX.fire();
        var key = input.value.trim();
        if (!key) { _toastWarn('Masukkan API Key terlebih dahulu'); return; }
        if (typeof api.save_ai_key !== 'function') { _toastErr('Bridge simpan API Key belum tersedia.'); return; }
        api.save_ai_key(key).then(function (res) {
          if (res && res.ok) {
            _toastOk('API Key berhasil disimpan!');
            input.value = '';
            if (typeof api.get_ai_key === 'function') api.get_ai_key().then(updateStatus);
          } else {
            _toastErr((res && res.err) || 'Gagal menyimpan');
          }
        });
      };
      removeBtn.onclick = function () {
        window._SFX && window._SFX.fire();
        if (typeof api.remove_ai_key !== 'function') return;
        api.remove_ai_key().then(function (res) {
          if (res && res.ok) {
            _toastInfo('API Key dihapus');
            input.value = '';
            updateStatus(null);
          }
        }).catch(function () { });
      };

      function closeModal() {
        window._SFX && window._SFX.close();
        overlay.classList.remove('show');
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 280);
      }
      overlay.querySelector('#ai-close-btn').onclick = closeModal;
      overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
      document.addEventListener('keydown', function _esc(e) {
        if (e.key === 'Escape') { document.removeEventListener('keydown', _esc); closeModal(); }
      });
      setTimeout(function () { input.focus(); }, 200);
    };
    window.openAiSettings._liberoModuleAiSettings = true;
  }

  function openAiSettingsFromModule() {
    installModuleAiSettings();
    _toastWarn('API Key AI belum diatur. Membuka Pengaturan STOPPER...');
    if (typeof window.openAiSettings === 'function') {
      try { window.openAiSettings(); } catch (_) { }
      return Promise.resolve(true);
    }
    _toastWarn('Pengaturan STOPPER belum siap. Tutup dan buka kembali modul.');
    return Promise.resolve(false);
  }

  function requireAiKey() {
    var api = window.pywebview && window.pywebview.api;
    if (!api || typeof api.get_ai_key !== 'function') {
      return openAiSettingsFromModule().then(function () { return false; });
    }
    return Promise.resolve(api.get_ai_key()).then(function (res) {
      if (res && res.has_key) return true;
      return openAiSettingsFromModule().then(function () { return false; });
    }).catch(function () {
      return openAiSettingsFromModule().then(function () { return false; });
    });
  }

  function installStyle() {
    if (styleInstalled || document.getElementById('stopper-doc-picker-style')) return;
    styleInstalled = true;
    var style = document.createElement('style');
    style.id = 'stopper-doc-picker-style';
    style.textContent = [
      '.stm-ov{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .22s ease;pointer-events:none}',
      '.stm-ov.stm-in{opacity:1;pointer-events:auto}',
      '.stm-card{background:var(--navy, var(--topbar-bg));border:1px solid rgba(var(--ac,93,224,133),.18);border-radius:16px;box-shadow:0 28px 90px rgba(0,0,0,.7),0 0 0 1px rgba(var(--tc,255,255,255),.04);width:min(480px,94vw);display:flex;flex-direction:column;overflow:hidden;transform:translateY(16px) scale(.96);transition:transform .28s cubic-bezier(.34,1.3,.64,1),opacity .22s ease;opacity:0}',
      '.stm-ov.stm-in .stm-card{transform:translateY(0) scale(1);opacity:1}',
      '.stm-hdr{display:flex;align-items:center;justify-content:space-between;padding:17px 18px 0;gap:8px}',
      '.stm-title{display:flex;align-items:center;gap:8px;font-size:14.5px;font-weight:700;color:rgba(var(--ac,93,224,133),1);letter-spacing:-.2px}',
      '.stm-title svg{stroke:rgba(var(--ac,93,224,133),1);fill:rgba(var(--ac,93,224,133),.18);flex-shrink:0}',
      '.stm-x{background:none;border:none;cursor:pointer;color:rgba(var(--tc,255,255,255),.3);font-size:16px;padding:4px 9px;border-radius:6px;transition:color .15s,background .15s;line-height:1;margin-left:auto}',
      '.stm-x:hover{color:rgba(var(--tc,255,255,255),1);background:rgba(var(--tc,255,255,255),.09)}',
      '.stm-sub{margin:5px 18px 6px;font-size:11.5px;color:rgba(var(--tc,255,255,255),.35);line-height:1.4}',
      '.stm-filetypes{display:flex;align-items:center;gap:5px;padding:0 18px 11px;flex-wrap:wrap}',
      '.stm-ft{font-size:9.5px;font-weight:700;padding:2px 7px;border-radius:4px;border:1px solid rgba(var(--ac,93,224,133),.28);color:rgba(var(--ac,93,224,133),.9);background:rgba(var(--ac,93,224,133),.09);letter-spacing:.5px}',
      '.stm-ftlbl{font-size:10px;color:rgba(var(--tc,255,255,255),.22);margin-left:2px}',
      '.stm-body{padding:0 18px;overflow-y:auto;max-height:50vh;display:flex;flex-direction:column;gap:6px}',
      '.stm-row{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:10px;background:rgba(var(--tc,255,255,255),.025);border:1px solid rgba(var(--tc,255,255,255),.055);transition:border-color .2s,background .2s}',
      '.stm-row.stm-ok{background:rgba(var(--ac,93,224,133),.055);border-color:rgba(var(--ac,93,224,133),.2)}',
      '.stm-info{flex:1;min-width:0}',
      '.stm-lbl{font-size:12.5px;font-weight:600;color:rgba(var(--tc,255,255,255),.78);display:flex;align-items:center;gap:5px}',
      '.stm-req{font-size:10px;font-weight:700;color:#ff7777;background:rgba(255,100,100,.12);border:1px solid rgba(255,100,100,.25);border-radius:4px;padding:1px 5px;letter-spacing:.3px}',
      '.stm-fn{font-size:10.5px;color:rgba(var(--tc,255,255,255),.26);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;transition:color .2s}',
      '.stm-fn.stm-fn-ok{color:rgba(var(--ac,93,224,133),.85)}',
      '.stm-pick{flex-shrink:0;background:rgba(var(--tc,255,255,255),.06);border:1px solid rgba(var(--tc,255,255,255),.11);color:rgba(var(--tc,255,255,255),.65);font-size:11px;font-weight:600;padding:5px 13px;border-radius:7px;cursor:pointer;transition:all .15s;white-space:nowrap}',
      '.stm-pick:hover{background:rgba(var(--tc,255,255,255),.12);color:rgba(var(--tc,255,255,255),1);border-color:rgba(var(--tc,255,255,255),.22)}',
      '.stm-pick.stm-pick-ok{background:rgba(var(--ac,93,224,133),.1);border-color:rgba(var(--ac,93,224,133),.28);color:rgba(var(--ac,93,224,133),1)}',
      '.stm-pick.stm-pick-ok:hover{background:rgba(var(--ac,93,224,133),.2);color:rgba(var(--tc,255,255,255),1)}',
      '.stm-remove{display:none;flex-shrink:0;width:28px;height:28px;align-items:center;justify-content:center;background:rgba(255,92,92,.08);border:1px solid rgba(255,92,92,.2);color:rgba(255,150,150,.86);font-size:17px;line-height:1;border-radius:7px;cursor:pointer;transition:all .15s}',
      '.stm-remove:hover{background:rgba(255,92,92,.18);border-color:rgba(255,120,120,.45);color:#fff}',
      '.stm-row.stm-ok .stm-remove{display:flex}',
      '.stm-foot{display:flex;justify-content:flex-end;align-items:center;gap:9px;padding:14px 18px;border-top:1px solid rgba(var(--tc,255,255,255),.055);margin-top:10px}',
      '.stm-note{flex:1;font-size:11px;color:rgba(var(--tc,255,255,255),.4);line-height:1.3}',
      '.stm-cancel{background:none;border:1px solid rgba(var(--tc,255,255,255),.1);color:rgba(var(--tc,255,255,255),.45);font-size:12.5px;font-weight:500;padding:7px 16px;border-radius:8px;cursor:pointer;transition:all .15s}',
      '.stm-cancel:hover{border-color:rgba(var(--tc,255,255,255),.22);color:rgba(var(--tc,255,255,255),.8)}',
      '.stm-proses{display:flex;align-items:center;gap:6px;background:rgba(var(--ac,93,224,133),.14);border:1px solid rgba(var(--ac,93,224,133),.38);color:rgba(var(--ac,93,224,133),1);font-size:12.5px;font-weight:700;padding:7px 18px;border-radius:8px;cursor:pointer;transition:all .2s;white-space:nowrap}',
      '.stm-proses:not([disabled]):hover{background:rgba(var(--ac,93,224,133),.26);border-color:rgba(var(--ac,93,224,133),1);color:rgba(var(--tc,255,255,255),1)}',
      '.stm-proses[disabled]{opacity:.28;cursor:not-allowed}',
      '.stm-proses svg{stroke:currentColor;fill:rgba(var(--ac,93,224,133),.2)}'
    ].join('');
    document.head.appendChild(style);
  }

  function show(options) {
    options = options || {};
    installStyle();
    var slots = Array.isArray(options.slots) ? options.slots : [];
    var selected = {};

    var old = document.getElementById('stm-ov');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var ov = document.createElement('div');
    ov.id = 'stm-ov';
    ov.className = 'stm-ov';
    var card = document.createElement('div');
    card.className = 'stm-card';

    var hdr = document.createElement('div');
    hdr.className = 'stm-hdr';
    var title = document.createElement('div');
    title.className = 'stm-title';
    title.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><span>STOPPER</span>';
    var closeBtn = document.createElement('button');
    closeBtn.className = 'stm-x';
    closeBtn.innerHTML = '&times;';
    hdr.appendChild(title);
    hdr.appendChild(closeBtn);

    var sub = document.createElement('div');
    sub.className = 'stm-sub';
    sub.innerHTML = options.subtitleHtml || 'Pilih dokumen untuk dianalisa AI. Semua dokumen bersifat opsional.';

    var ftrow = document.createElement('div');
    ftrow.className = 'stm-filetypes';
    ['PDF', 'JPG', 'PNG', 'WEBP'].forEach(function (type) {
      var tag = document.createElement('span');
      tag.className = 'stm-ft';
      tag.textContent = type;
      ftrow.appendChild(tag);
    });
    var ftlbl = document.createElement('span');
    ftlbl.className = 'stm-ftlbl';
    ftlbl.textContent = 'format yang didukung';
    ftrow.appendChild(ftlbl);

    var body = document.createElement('div');
    body.className = 'stm-body';

    function checkReady() {
      var ok = slots.every(function (slot, idx) { return !slot.required || !!selected[idx]; });
      var processBtn = document.getElementById('stm-proses');
      if (processBtn) processBtn.disabled = !ok;
    }

    slots.forEach(function (slot, idx) {
      var row = document.createElement('div');
      row.className = 'stm-row';
      row.id = 'stm-row-' + idx;
      var info = document.createElement('div');
      info.className = 'stm-info';
      var label = document.createElement('div');
      label.className = 'stm-lbl';
      label.textContent = slot.label;
      if (slot.required) {
        var req = document.createElement('span');
        req.className = 'stm-req';
        req.textContent = 'wajib';
        label.appendChild(req);
      }
      var filename = document.createElement('div');
      filename.className = 'stm-fn';
      filename.id = 'stm-fn-' + idx;
      filename.textContent = 'Belum dipilih';
      info.appendChild(label);
      info.appendChild(filename);

      var pickBtn = document.createElement('button');
      pickBtn.className = 'stm-pick';
      pickBtn.textContent = 'Pilih';
      pickBtn.dataset.idx = String(idx);
      var removeBtn = document.createElement('button');
      removeBtn.className = 'stm-remove';
      removeBtn.type = 'button';
      removeBtn.title = 'Hapus file';
      removeBtn.setAttribute('aria-label', 'Hapus file ' + slot.label);
      removeBtn.innerHTML = '&times;';

      function clearSelection() {
        delete selected[idx];
        var fnEl = document.getElementById('stm-fn-' + idx);
        var rowEl = document.getElementById('stm-row-' + idx);
        if (fnEl) {
          fnEl.textContent = 'Belum dipilih';
          fnEl.classList.remove('stm-fn-ok');
        }
        if (rowEl) rowEl.classList.remove('stm-ok');
        pickBtn.textContent = 'Pilih';
        pickBtn.classList.remove('stm-pick-ok');
        checkReady();
      }

      removeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        clearSelection();
      });

      pickBtn.addEventListener('click', function () {
        var button = this;
        if (window.pywebview && window.pywebview.api && window.pywebview.api.pick_pdf_file) {
          window.pywebview.api.pick_pdf_file().then(function (result) {
            if (result && result.ok && result.paths && result.paths.length) {
              var path = result.paths[0];
              var name = path.replace(/^.*[\\/]/, '');
              selected[idx] = { path: path, label: slots[idx].label };
              var fnEl = document.getElementById('stm-fn-' + idx);
              var rowEl = document.getElementById('stm-row-' + idx);
              if (fnEl) {
                fnEl.textContent = name;
                fnEl.classList.add('stm-fn-ok');
              }
              if (rowEl) rowEl.classList.add('stm-ok');
              button.textContent = 'Ganti';
              button.classList.add('stm-pick-ok');
              checkReady();
            } else if (result && result.err && result.err !== 'Tidak ada file dipilih') {
              if (typeof toastError !== 'undefined') toastError(result.err);
              else if (typeof toast !== 'undefined') toast(result.err);
            }
          }).catch(function (err) {
            var msg = 'Gagal membuka pemilih file: ' + (err && err.message ? err.message : err);
            if (typeof toastError !== 'undefined') toastError(msg);
            else if (typeof toast !== 'undefined') toast(msg);
          });
        } else {
          var msg = 'Pemilih file STOPPER belum siap. Tutup dan buka kembali modul.';
          if (typeof toastError !== 'undefined') toastError(msg);
          else if (typeof toast !== 'undefined') toast(msg);
        }
      });

      row.appendChild(info);
      row.appendChild(pickBtn);
      row.appendChild(removeBtn);
      body.appendChild(row);
    });

    var foot = document.createElement('div');
    foot.className = 'stm-foot';
    var note = document.createElement('div');
    note.className = 'stm-note';
    note.innerHTML = options.noteHtml || '*Tidak ada dokumen wajib. Bebas diproses meskipun hanya 1 file.';
    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'stm-cancel';
    cancelBtn.textContent = 'Batal';
    var processBtn = document.createElement('button');
    processBtn.className = 'stm-proses';
    processBtn.id = 'stm-proses';
    processBtn.disabled = false;
    processBtn.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>Proses';
    foot.appendChild(note);
    foot.appendChild(cancelBtn);
    foot.appendChild(processBtn);

    card.appendChild(hdr);
    card.appendChild(sub);
    card.appendChild(ftrow);
    card.appendChild(body);
    card.appendChild(foot);
    ov.appendChild(card);
    document.body.appendChild(ov);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { ov.classList.add('stm-in'); });
    });

    function close(skipSound) {
      if (skipSound !== true && window._SFX) window._SFX.close();
      ov.classList.remove('stm-in');
      setTimeout(function () {
        if (ov.parentNode) ov.parentNode.removeChild(ov);
      }, 280);
    }

    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);
    ov.addEventListener('click', function (e) {
      if (e.target === ov) close();
    });
    processBtn.addEventListener('click', function () {
      var paths = [];
      var labels = [];
      slots.forEach(function (slot, idx) {
        if (selected[idx]) {
          paths.push(selected[idx].path);
          labels.push(selected[idx].label);
        }
      });
      if (!paths.length) return;
      close(true);
      setTimeout(function () {
        if (typeof options.onProcess === 'function') options.onProcess(paths, labels);
      }, 180);
    });
  }

  function installButton(options) {
    options = options || {};
    var sidenav = document.querySelector('.sidenav');
    var buttonId = options.buttonId || 'ai-autofill-btn';
    if (!sidenav || document.getElementById(buttonId)) return;

    var btn = document.createElement('button');
    btn.className = options.className || 'snav-stopper';
    btn.id = buttonId;
    btn.style.display = 'flex';
    btn.style.opacity = '0';
    btn.style.animation = 'none';
    btn.innerHTML = options.buttonHtml || '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><span class="snav-stopper-label">STOPPER</span><span class="snav-stopper-badge">AI</span>';

    sidenav.insertBefore(btn, sidenav.firstChild);
    requestAnimationFrame(function () {
      btn.style.animation = '';
      btn.style.animation = 'aksiItemIn .3s cubic-bezier(.34,1.3,.64,1) forwards';
      if (typeof applyZoom === 'function') applyZoom();
    });
    btn.addEventListener('click', function () {
      requireAiKey().then(function (ok) {
        if (ok) show(options);
      });
    });
  }

  window.LStopperOpenAiSettings = openAiSettingsFromModule;
  window.LStopperRequireAiKey = requireAiKey;
  window.LStopperDocPicker = {
    show: show,
    installButton: installButton
  };
})();
