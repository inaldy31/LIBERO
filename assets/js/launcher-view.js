// LIBERO: Alur webview launcher untuk kartu modul, pengaturan, pembaruan, dan penghubung.
/* launcher_view.html script 4 */
const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    function pad(n) { return String(n).padStart(2, '0'); }

    function updateClock() {
      const now = new Date();
      document.getElementById('clock').textContent =
        `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      document.getElementById('datestr').textContent =
        `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

      const h = now.getHours();
      const greet = h < 4 ? 'Selamat Malam'
        : h < 11 ? 'Selamat Pagi'
          : h < 15 ? 'Selamat Siang'
            : h < 19 ? 'Selamat Sore'
              : 'Selamat Malam';
      const usernameEl = document.getElementById('username');
      const commaEl = document.getElementById('greeting-comma');
      const uname = usernameEl ? usernameEl.textContent.trim() : '';
      document.getElementById('greeting').childNodes[0].textContent = greet;
      if (commaEl) commaEl.style.display = uname ? '' : 'none';
    }

    window._clockTimer = setInterval(updateClock, 1000);
    updateClock();

    function initApp(data) {

      const username = (data.username || '').trim();
      if (document.getElementById('username')) {
        document.getElementById('username').textContent = username;
      }
      const h = new Date().getHours();
      const greet = h < 4 ? 'Selamat Malam'
        : h < 11 ? 'Selamat Pagi'
          : h < 15 ? 'Selamat Siang'
            : h < 19 ? 'Selamat Sore'
              : 'Selamat Malam';
      document.getElementById('greeting').innerHTML =
        greet + '<span id="greeting-comma" style="' + (username ? '' : 'display:none') + '">, </span><span id="username">' + username + '</span>';

      const badge = document.getElementById('trial-badge');
      const daftBtn = document.getElementById('daftar-btn');

      if (data.trial_msg) {
        badge.style.display = 'flex';
        const match = data.trial_msg.match(/Sisa\s+(\d+)\s+hari/i);
        if (match) {
          document.getElementById('trial-days').textContent = '· sisa ' + match[1] + ' hari';
        }
        // Tampilkan tombol daftar hanya saat trial
        if (daftBtn) {
          daftBtn.style.display = 'flex';
          daftBtn.classList.remove('_daftar-entering');
          void daftBtn.offsetWidth;
          daftBtn.classList.add('_daftar-entering');
          setTimeout(function () { daftBtn.classList.remove('_daftar-entering'); }, 600);
        }
      } else {
        badge.style.display = 'none';
        if (daftBtn) daftBtn.style.display = 'none';
      }
      // Tema sudah di-inject ke <html> oleh Python saat patch — tidak perlu set ulang
      if (data.show_version_toast && data.app_version) {
        setTimeout(function () {
          toastSuccess('✓ Diperbarui ke versi ' + data.app_version, 4000);
        }, 1500);
      }
    }

    // ── Tombol Daftar Perangkat ───────────────────────────────
    function bukaPendaftaran() {
      const btn = document.getElementById('daftar-btn');
      if (!btn) return;

      if (!window.pywebview || !window.pywebview.api) {
        alert('Fitur ini hanya tersedia di dalam aplikasi LIBERO.');
        return;
      }

      btn.classList.add('loading');
      btn.innerHTML = `
      <svg viewBox="0 0 24 24" style="animation:spin .8s linear infinite">
        <circle cx="12" cy="12" r="10" stroke-opacity=".25"/>
        <path d="M12 2a10 10 0 0 1 10 10"/>
      </svg>
      Membuka...
    `;

      const resetBtn = () => {
        btn.classList.remove('loading');
        btn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="19" y2="14"/>
          <line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
        Daftar Perangkat
      `;
      };

      openRegistrationOverlay({ onClose: resetBtn }).catch(function (err) {
        resetBtn();
        var msg = err && err.message ? err.message : 'Gagal membuka pendaftaran.';
        if (window.toastError) toastError(msg, 3600);
      });
    }

    function ensureRegistrationOverlay() {
      var existing = document.getElementById('registration-overlay');
      if (existing) return existing;

      var overlay = document.createElement('div');
      overlay.id = 'registration-overlay';
      overlay.className = 'reg-overlay';
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = `
        <div class="reg-shell" role="dialog" aria-modal="true" aria-labelledby="reg-title">
          <div class="reg-header">
            <div>
              <div class="reg-eyebrow">LIBERO</div>
              <div id="reg-title" class="reg-title">Daftar Perangkat</div>
            </div>
            <button type="button" class="reg-tool-btn" id="reg-close" title="Tutup" aria-label="Tutup">
              <svg viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div class="reg-content">
            <aside class="reg-side">
              <div class="reg-side-title">Perangkat</div>
              <div class="reg-uuid-label">UUID</div>
              <div class="reg-uuid" id="reg-uuid">Memuat...</div>
              <div class="reg-side-note">Data dikirim untuk aktivasi perangkat ini.</div>
            </aside>
            <section class="reg-form-panel">
              <div class="reg-trial-banner" id="reg-trial-banner" style="display:none">Masa trial telah berakhir. Daftarkan perangkat untuk melanjutkan.</div>
              <div class="reg-form-grid">
                <label class="reg-field" id="reg-f-nama"><span>Nama Lengkap <b>*</b></span><input type="text" id="reg-nama" placeholder="Nama lengkap tanpa gelar" autocomplete="off" spellcheck="false"></label>
                <label class="reg-field" id="reg-f-nip"><span>NIP <b>*</b></span><input type="text" id="reg-nip" placeholder="18 digit NIP" autocomplete="off" maxlength="22" spellcheck="false"></label>
                <label class="reg-field" id="reg-f-jabatan"><span>Jabatan <b>*</b></span><select id="reg-jabatan"><option value="">-- Pilih Jabatan --</option><option>Asisten Pembimbing Kemasyarakatan Terampil</option><option>Asisten Pembimbing Kemasyarakatan Mahir</option><option>Asisten Pembimbing Kemasyarakatan Penyelia</option><option>Pembimbing Kemasyarakatan Pertama</option><option>Pembimbing Kemasyarakatan Muda</option><option>Pembimbing Kemasyarakatan Madya</option></select></label>
                <label class="reg-field" id="reg-f-kanwil"><span>Kantor Wilayah <b>*</b></span><select id="reg-kanwil"><option value="">-- Pilih Kanwil --</option><option>Aceh</option><option>Sumatera Utara</option><option>Sumatera Barat</option><option>Riau</option><option>Jambi</option><option>Sumatera Selatan</option><option>Kepulauan Bangka Belitung</option><option>Bengkulu</option><option>Lampung</option><option>Daerah Khusus Jakarta</option><option>Jawa Barat</option><option>Banten</option><option>Jawa Tengah</option><option>Daerah Istimewa Yogyakarta</option><option>Jawa Timur</option><option>Kalimantan Barat</option><option>Kalimantan Tengah</option><option>Kalimantan Timur</option><option>Kalimantan Selatan</option><option>Bali</option><option>Nusa Tenggara Barat</option><option>Nusa Tenggara Timur</option><option>Sulawesi Selatan</option><option>Sulawesi Tengah</option><option>Sulawesi Utara</option><option>Gorontalo</option><option>Sulawesi Tenggara</option><option>Maluku</option><option>Maluku Utara</option><option>Papua</option><option>Papua Barat</option><option>Kepulauan Riau</option><option>Sulawesi Barat</option><option>Kalimantan Utara</option></select></label>
                <label class="reg-field" id="reg-f-upt"><span>Nama UPT / Instansi <b>*</b></span><input type="text" id="reg-upt" placeholder="Balai Pemasyarakatan Kelas ..." autocomplete="off" spellcheck="false"></label>
              </div>
              <div id="reg-status" class="reg-status">Semua field bertanda * wajib diisi</div>
              <div class="reg-actions">
                <button type="button" class="reg-action reg-secondary" id="reg-cancel">Tutup</button>
                <button type="button" class="reg-action reg-danger" id="reg-delete-now" style="display:none">Hapus LIBERO Sekarang</button>
                <button type="button" class="reg-action reg-primary" id="reg-submit"><span class="reg-spinner"></span><span class="reg-submit-text">Daftar Sekarang</span></button>
              </div>
            </section>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      return overlay;
    }

    function setRegStatus(msg, type) {
      var el = document.getElementById('reg-status');
      if (!el) return;
      el.textContent = msg || '';
      el.className = 'reg-status' + (type ? ' ' + type : '');
    }

    function setRegLoading(loading) {
      var btn = document.getElementById('reg-submit');
      if (!btn) return;
      btn.disabled = !!loading;
      btn.classList.toggle('loading', !!loading);
      var text = btn.querySelector('.reg-submit-text');
      if (text) text.textContent = loading ? 'Mengirim...' : (btn.dataset.label || 'Daftar Sekarang');
    }

    function clearRegErrors() {
      document.querySelectorAll('#registration-overlay .reg-field.error').forEach(function (el) {
        el.classList.remove('error');
      });
    }

    function lockRegistrationForm(msg, type, label) {
      document.querySelectorAll('#registration-overlay input, #registration-overlay select, #reg-submit').forEach(function (el) {
        el.disabled = true;
      });
      var submit = document.getElementById('reg-submit');
      if (submit) {
        submit.dataset.label = label || 'Terkunci';
        var text = submit.querySelector('.reg-submit-text');
        if (text) text.textContent = submit.dataset.label;
      }
      setRegStatus(msg, type);
    }

    function applyRegistrationTrialState(overlay, data) {
      var banner = overlay.querySelector('#reg-trial-banner');
      var cancel = overlay.querySelector('#reg-cancel');
      var deleteNow = overlay.querySelector('#reg-delete-now');
      if (data && data.trial_expired) {
        if (banner) {
          startRegistrationTrialCountdown(banner, data);
          banner.style.display = 'block';
        }
        if (cancel) cancel.textContent = 'Keluar';
        if (deleteNow) deleteNow.style.display = 'inline-flex';
      } else {
        if (banner) banner.style.display = 'none';
        if (cancel) cancel.textContent = 'Tutup';
        if (deleteNow) deleteNow.style.display = 'none';
      }
    }

    function formatRegistrationTrialCountdown(totalSeconds) {
      var seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
      var days = Math.floor(seconds / 86400); seconds %= 86400;
      var hours = Math.floor(seconds / 3600); seconds %= 3600;
      var minutes = Math.floor(seconds / 60); seconds %= 60;
      return days + ' hari ' + hours + ' jam ' + minutes + ' menit ' + seconds + ' detik';
    }

    function getRegistrationTrialRemainingSeconds(data) {
      if (data && data.auto_uninstall_at) {
        var target = new Date(String(data.auto_uninstall_at));
        if (!Number.isNaN(target.getTime())) {
          return Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));
        }
      }
      return Math.max(0, Math.floor(Number(data && data.trial_remaining_seconds) || 0));
    }

    function startRegistrationTrialCountdown(targetEl, data) {
      if (!targetEl) return;
      if (window._registrationTrialCountdownTimer) {
        clearInterval(window._registrationTrialCountdownTimer);
        window._registrationTrialCountdownTimer = null;
      }
      var render = function () {
        var remaining = getRegistrationTrialRemainingSeconds(data);
        if (remaining <= 0) {
          targetEl.textContent = 'Masa trial telah melewati masa tenggang. LIBERO akan dihapus otomatis.';
          return;
        }
        targetEl.textContent = 'Masa trial telah berakhir. Daftarkan perangkat untuk melanjutkan. LIBERO akan dihapus otomatis dalam ' + formatRegistrationTrialCountdown(remaining) + ' jika perangkat belum didaftarkan.';
      };
      render();
      window._registrationTrialCountdownTimer = setInterval(render, 1000);
    }

    function openRegistrationOverlay(opts) {
      opts = opts || {};
      return new Promise(function (resolve, reject) {
        if (!window.pywebview || !window.pywebview.api) {
          reject(new Error('Fitur ini hanya tersedia di dalam aplikasi LIBERO.'));
          return;
        }

        var overlay = ensureRegistrationOverlay();
        var submit = overlay.querySelector('#reg-submit');
        var closeBtn = overlay.querySelector('#reg-close');
        var cancel = overlay.querySelector('#reg-cancel');
        var deleteNow = overlay.querySelector('#reg-delete-now');
        var closed = false;

        overlay.querySelectorAll('input, select, #reg-submit').forEach(function (el) {
          el.disabled = false;
        });
        if (submit) {
          submit.dataset.label = 'Daftar Sekarang';
          var submitText = submit.querySelector('.reg-submit-text');
          if (submitText) submitText.textContent = 'Daftar Sekarang';
          submit.classList.remove('loading');
        }
        clearRegErrors();

        function close() {
          if (closed) return;
          closed = true;
          document.body.classList.remove('registration-open');
          overlay.classList.remove('open');
          overlay.setAttribute('aria-hidden', 'true');
          setTimeout(function () {
            overlay.style.display = 'none';
            if (typeof opts.onClose === 'function') opts.onClose();
            resolve({ ok: true });
          }, 180);
          document.removeEventListener('keydown', onKey);
        }

        function onKey(ev) {
          if (ev.key === 'Escape') close();
          if (ev.key === 'Enter' && ev.target && ev.target.tagName !== 'SELECT') {
            ev.preventDefault();
            submitRegistration();
          }
        }

        function submitRegistration() {
          if (submit && submit.disabled && !submit.classList.contains('loading')) return;
          clearRegErrors();
          var fields = [
            ['nama', 'reg-nama', 'reg-f-nama', 'Nama tidak boleh kosong.'],
            ['nip', 'reg-nip', 'reg-f-nip', 'NIP tidak boleh kosong.'],
            ['jabatan', 'reg-jabatan', 'reg-f-jabatan', 'Jabatan belum dipilih.'],
            ['kanwil', 'reg-kanwil', 'reg-f-kanwil', 'Kantor Wilayah belum dipilih.'],
            ['upt', 'reg-upt', 'reg-f-upt', 'Nama UPT tidak boleh kosong.']
          ];
          var payload = {};
          for (var i = 0; i < fields.length; i++) {
            var key = fields[i][0];
            var input = overlay.querySelector('#' + fields[i][1]);
            var value = (input && input.value ? input.value : '').trim();
            payload[key] = value;
            if (!value) {
              var wrap = overlay.querySelector('#' + fields[i][2]);
              if (wrap) wrap.classList.add('error');
              setRegStatus(fields[i][3], 'error');
              if (input) input.focus();
              return;
            }
          }

          setRegStatus('Menghubungi server...', 'sending');
          setRegLoading(true);
          window.pywebview.api.kirim_registrasi(payload).then(function (res) {
            res = res || {};
            var msg = res.msg || '';
            if (res.ok || msg === 'sudah_aktif') {
              lockRegistrationForm('Perangkat sudah aktif. Restart LIBERO untuk masuk.', 'success', 'Selesai');
            } else if (msg === 'terdaftar') {
              lockRegistrationForm('Pendaftaran terkirim. Tunggu persetujuan admin.', 'success', 'Terkirim');
            } else if (msg === 'pending') {
              setRegStatus('Masih menunggu persetujuan admin.', 'pending');
              submit.disabled = false;
              submit.dataset.label = 'Kirim Ulang';
              setRegLoading(false);
            } else if (msg === 'uuid_tidak_ditemukan') {
              setRegStatus('UUID perangkat tidak terdeteksi.', 'error');
              setRegLoading(false);
            } else if (msg === 'network_error') {
              setRegStatus('Gagal terhubung. Pastikan internet aktif.', 'error');
              submit.dataset.label = 'Coba Lagi';
              setRegLoading(false);
            } else {
              setRegStatus('Respons tidak dikenal: ' + msg, 'error');
              submit.dataset.label = 'Coba Lagi';
              setRegLoading(false);
            }
          }).catch(function () {
            setRegStatus('Gagal terhubung ke aplikasi.', 'error');
            setRegLoading(false);
          });
        }

        function deleteLiberoNow() {
          if (!window.confirm('LIBERO akan ditutup dan dihapus dari perangkat ini. Lanjutkan?')) return;
          setRegStatus('Menyiapkan penghapusan LIBERO...', 'sending');
          if (window.pywebview && window.pywebview.api && window.pywebview.api.hapus_libero_sekarang) {
            window.pywebview.api.hapus_libero_sekarang();
          }
        }

        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('registration-open');
        requestAnimationFrame(function () {
          overlay.classList.add('open');
        });

        closeBtn.onclick = close;
        cancel.onclick = close;
        if (deleteNow) deleteNow.onclick = deleteLiberoNow;
        submit.onclick = submitRegistration;
        document.addEventListener('keydown', onKey);

        setRegStatus('Memuat data perangkat...', 'sending');
        window.pywebview.api.get_reg_init_data(false).then(function (data) {
          data = data || {};
          overlay.querySelector('#reg-uuid').textContent = data.uuid || 'Tidak terdeteksi';
          applyRegistrationTrialState(overlay, data);
          setRegStatus('Semua field bertanda * wajib diisi', '');

          if (data.existing_status === 'approved') {
            lockRegistrationForm('Perangkat ini sudah aktif dan terdaftar.', 'success', 'Sudah Aktif');
          } else if (data.existing_status === 'pending') {
            lockRegistrationForm('Perangkat ini sudah terdaftar dan sedang menunggu persetujuan admin.', 'pending', 'Menunggu');
          } else if (data.existing_status === 'banned') {
            var detail = data.existing_keterangan ? ' - ' + data.existing_keterangan : '';
            lockRegistrationForm('Akses perangkat ini dinonaktifkan oleh pengembang.' + detail, 'error', 'Dinonaktifkan');
          } else {
            setTimeout(function () {
              var first = overlay.querySelector('#reg-nama');
              if (first) first.focus();
            }, 120);
          }
        }).catch(function () {
          overlay.querySelector('#reg-uuid').textContent = 'Tidak terdeteksi';
          setRegStatus('Gagal memuat data perangkat.', 'error');
        });
      });
    }

    function _rnEsc(s) {
      return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function _rnInline(s) {
      return _rnEsc(s)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    }

    function _renderReleaseNotes(md) {
      var lines = String(md || '').split(/\r?\n/);
      var html = [];
      lines.forEach(function (line) {
        var s = line.trim();
        if (!s || s === '---') return;
        if (s.indexOf('# Changelog') === 0) return;
        if (s.indexOf('## ') === 0) {
          html.push('<h2>' + _rnInline(s.replace(/^##\s+/, '')) + '</h2>');
          return;
        }
        if (s.indexOf('### ') === 0) {
          html.push('<h3>' + _rnInline(s.replace(/^###\s+/, '')) + '</h3>');
          return;
        }
        if (/^[-*]\s+/.test(s)) {
          html.push('<div class="rn-bullet">' + _rnInline(s.replace(/^[-*]\s+/, '')) + '</div>');
          return;
        }
        html.push('<p>' + _rnInline(s) + '</p>');
      });
      return html.join('') || '<p>Catatan rilis belum tersedia di paket lokal.</p>';
    }

    window.openReleaseNotes = function (e) {
      if (e) e.stopPropagation();
      var ov = document.getElementById('release-notes-overlay');
      var body = document.getElementById('release-notes-body');
      if (!ov || !body) return;
      body.innerHTML = 'Memuat catatan rilis...';
      ov.style.display = 'flex';
      if (window.pywebview && window.pywebview.api && window.pywebview.api.get_release_notes) {
        window.pywebview.api.get_release_notes().then(function (raw) {
          var res = typeof raw === 'string' ? JSON.parse(raw) : raw;
          body.innerHTML = _renderReleaseNotes((res && res.notes) || '');
        }).catch(function () {
          body.innerHTML = '<p>Catatan rilis lokal belum bisa dibaca. Gunakan tombol GitHub Releases untuk melihat riwayat versi terbaru.</p>';
        });
      } else {
        body.innerHTML = '<p>Catatan rilis hanya tersedia di aplikasi LIBERO.</p>';
      }
    };

    window.closeReleaseNotes = function () {
      var ov = document.getElementById('release-notes-overlay');
      if (ov) ov.style.display = 'none';
    };

    window.openReleaseNotesPage = function () {
      if (window.pywebview && window.pywebview.api && window.pywebview.api.open_releases_page) {
        window.pywebview.api.open_releases_page();
      } else {
        window.open('https://github.com/inaldy31/LIBERO/releases', '_blank');
      }
    };

    window.openGitHubPage = function () {
      if (window.pywebview && window.pywebview.api && window.pywebview.api.open_github_page) {
        window.pywebview.api.open_github_page();
      } else {
        window.open('https://github.com/inaldy31/LIBERO', '_blank');
      }
    };

    window.openUserGuidePage = function () {
      var url = 'https://github.com/inaldy31/LIBERO/blob/main/docs/PANDUAN%20PENGGUNAAN%20APLIKASI%20LIBERO%202.pdf';
      if (window.pywebview && window.pywebview.api && window.pywebview.api.open_user_guide_page) {
        window.pywebview.api.open_user_guide_page();
      } else {
        window.open(url, '_blank');
      }
    };

    document.addEventListener('click', function (e) {
      var ov = document.getElementById('release-notes-overlay');
      if (ov && ov.style.display !== 'none' && e.target === ov) closeReleaseNotes();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeReleaseNotes();
    });

    let _loaderTimer = null;
    let _loaderPct = 0;

    function showLoader() {
      _loaderPct = 0;
      const el = document.getElementById('loader');
      el.style.display = 'flex';
      document.getElementById('loader-bar').style.width = '0%';
      document.getElementById('loader-pct').textContent = '0%';
      _loaderTimer = setInterval(() => {
        if (_loaderPct < 92) {
          _loaderPct += 1.2;
          const p = Math.min(92, _loaderPct).toFixed(0);
          document.getElementById('loader-bar').style.width = p + '%';
          document.getElementById('loader-pct').textContent = p + '%';
        }
      }, 40);
    }

    const MODULE_LAUNCH_DEBOUNCE_MS = 1800;
    let moduleLaunchLock = false;
    let moduleLaunchTimer = null;

    function releaseModuleLaunchLock() {
      moduleLaunchLock = false;
      if (moduleLaunchTimer) {
        clearTimeout(moduleLaunchTimer);
        moduleLaunchTimer = null;
      }
    }

    function lockModuleLaunch() {
      moduleLaunchLock = true;
      if (moduleLaunchTimer) clearTimeout(moduleLaunchTimer);
      moduleLaunchTimer = setTimeout(() => {
        moduleLaunchLock = false;
        moduleLaunchTimer = null;
      }, MODULE_LAUNCH_DEBOUNCE_MS);
    }

    function showGateEnter(labelText, callback, onFailure) {
      const ov = document.getElementById('exit-overlay');
      const gateTop = document.getElementById('exit-gate-top');
      const gateBot = document.getElementById('exit-gate-bottom');
      const crack = document.getElementById('exit-crack');
      const label = document.getElementById('exit-label');
      const blackout = document.getElementById('exit-blackout');

      // Ganti teks label
      const labelEl = label.querySelector('div[style*="letter-spacing"]');
      if (labelEl) labelEl.textContent = labelText;

      // Reset — gate di luar layar, tanpa animasi
      gateTop.style.transition = 'none';
      gateBot.style.transition = 'none';
      gateTop.style.transform = 'translateY(-100%)';
      gateBot.style.transform = 'translateY(100%)';
      gateTop.style.borderBottomColor = 'rgba(var(--ac),0)';
      gateBot.style.borderTopColor = 'rgba(var(--ac),0)';
      crack.style.transition = 'none';
      crack.style.opacity = '0';
      label.style.opacity = '0';
      label.style.transform = 'translate(-50%,-50%) scale(0.85)';
      blackout.style.opacity = '0';
      ov.style.background = '';
      ov.style.display = 'block';

      requestAnimationFrame(() => requestAnimationFrame(() => {
        // Gate slide masuk dari luar layar
        gateTop.style.transition = 'transform 0.8s cubic-bezier(.77,0,.18,1), border-color 0.3s ease';
        gateBot.style.transition = 'transform 0.8s cubic-bezier(.77,0,.18,1), border-color 0.3s ease';
        gateTop.style.transform = 'translateY(0)';
        gateBot.style.transform = 'translateY(0)';
        gateTop.style.borderBottomColor = 'rgba(var(--ac),.25)';
        gateBot.style.borderTopColor = 'rgba(var(--ac),.25)';

        // Crack seam
        crack.style.transition = 'opacity 0.35s ease';
        setTimeout(() => { crack.style.opacity = '1'; }, 700);

        // Label muncul
        setTimeout(() => {
          label.style.transition = 'opacity 0.4s ease, transform 0.5s cubic-bezier(.22,1.35,.36,1)';
          label.style.opacity = '1';
          label.style.transform = 'translate(-50%,-50%) scale(1)';
        }, 780);

        // Setelah gate tertutup penuh — solid navy
        setTimeout(() => { ov.style.background = 'var(--navy)'; }, 850);

        // Crack & label fade out
        setTimeout(() => {
          crack.style.transition = 'opacity 0.3s ease';
          crack.style.opacity = '0';
          label.style.opacity = '0';
          label.style.transform = 'translate(-50%,-50%) scale(0.85)';
        }, 1100);

        // Panggil callback — pywebview ganti halaman
        setTimeout(() => {
          try {
            const result = callback();
            if (result && typeof result.catch === 'function') {
              result.catch(() => {
                ov.style.display = 'none';
                if (typeof onFailure === 'function') onFailure();
                showToast('Gagal membuka modul. Coba klik lagi.');
              });
            }
          } catch (_e) {
            ov.style.display = 'none';
            if (typeof onFailure === 'function') onFailure();
            showToast('Gagal membuka modul. Coba klik lagi.');
          }
        }, 950);

        setTimeout(() => {
          if (document.body && document.body.contains(ov) && ov.style.display === 'block') {
            ov.style.display = 'none';
          }
        }, 7000);
      }));
    }

    function openModule(name, e) {
      if (!window.pywebview) {
        showToast('Memuat aplikasi, tunggu sebentar...'); return;
      }
      if (name === 'Integrasi') {
        if (moduleLaunchLock) {
          showToast('Modul sedang dibuka, tunggu sebentar...');
          return;
        }
        lockModuleLaunch();
        const target = e && e.currentTarget ? e.currentTarget : null;
        if (target) target.classList.add('portal-activating');
        if (window._stopBgCanvas) window._stopBgCanvas();
        if (window._clockTimer) { clearInterval(window._clockTimer); window._clockTimer = null; }
        showGateEnter('Membuka Integrasi', () => window.pywebview.api.open_integrasi(), () => {
          releaseModuleLaunchLock();
          if (target) target.classList.remove('portal-activating');
        });
      } else if (name === 'Anak') {
        if (moduleLaunchLock) {
          showToast('Modul sedang dibuka, tunggu sebentar...');
          return;
        }
        lockModuleLaunch();
        const target = e && e.currentTarget ? e.currentTarget : null;
        if (target) target.classList.add('portal-activating');
        if (window._stopBgCanvas) window._stopBgCanvas();
        if (window._clockTimer) { clearInterval(window._clockTimer); window._clockTimer = null; }
        showGateEnter('Membuka Litmas Anak', () => window.pywebview.api.open_litmas_anak(), () => {
          releaseModuleLaunchLock();
          if (target) target.classList.remove('portal-activating');
        });
      } else {
        if (name === 'Asimilasi') {
          toastWarning('Fitur Litmas Asimilasi masih dalam tahap pengembangan', 1500);
        } else if (name === 'Pembinaan Awal') {
          toastWarning('Fitur Litmas Pembinaan Awal masih dalam tahap pengembangan', 1500);
        } else {
          toastWarning('Modul ' + name + ' sedang dalam pengembangan', 1500);
        }
      }
    }

    function showExitAnimation(callback) {
      const ov = document.getElementById('exit-overlay');
      const gateTop = document.getElementById('exit-gate-top');
      const gateBot = document.getElementById('exit-gate-bottom');
      const crack = document.getElementById('exit-crack');
      const label = document.getElementById('exit-label');
      const blackout = document.getElementById('exit-blackout');
      if (!ov || !gateTop || !gateBot) { callback(); return; }
      // Reset — gate di luar layar, tanpa animasi
      gateTop.style.transition = 'none';
      gateBot.style.transition = 'none';
      gateTop.style.transform = 'translateY(-100%)';
      gateBot.style.transform = 'translateY(100%)';
      gateTop.style.borderBottomColor = 'rgba(var(--ac),0)';
      gateBot.style.borderTopColor = 'rgba(var(--ac),0)';
      crack.style.opacity = '0';
      label.style.opacity = '0';
      label.style.transform = 'translate(-50%,-50%) scale(0.85)';
      blackout.style.opacity = '0';
      ov.style.display = 'block';
      // 2 frame — aktifkan transisi lalu slide masuk
      requestAnimationFrame(() => requestAnimationFrame(() => {
        gateTop.style.transition = 'transform 0.8s cubic-bezier(.77,0,.18,1), border-color 0.3s ease';
        gateBot.style.transition = 'transform 0.8s cubic-bezier(.77,0,.18,1), border-color 0.3s ease';
        gateTop.style.transform = 'translateY(0)';
        gateBot.style.transform = 'translateY(0)';
        gateTop.style.borderBottomColor = 'rgba(var(--ac),.25)';
        gateBot.style.borderTopColor = 'rgba(var(--ac),.25)';
        setTimeout(() => { crack.style.opacity = '1'; }, 700);
        setTimeout(() => { label.style.opacity = '1'; label.style.transform = 'translate(-50%,-50%) scale(1)'; }, 780);
        setTimeout(() => { crack.style.opacity = '0'; blackout.style.opacity = '1'; }, 1200);
        setTimeout(() => { callback(); }, 1700);
      }));
    }

    async function exitApp() {
      window._SFX && window._SFX.open();
      const ok = await LDialog.exit({
        title: 'Keluar Aplikasi',
        message: 'Yakin ingin keluar dari LIBERO?\nPastikan semua data telah disimpan.',
        okText: 'Keluar',
        cancelText: 'Batal',
      });
      if (ok) {
        window._SFX && window._SFX.close();
        showExitAnimation(() => {
          if (window.pywebview) window.pywebview.api.exit_app();
        });
      }
    }

    (function () {
      const canvas = document.getElementById('bg-canvas');
      const ctx = canvas.getContext('2d');

      function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      resize();
      window.addEventListener('resize', resize);

      const GOLD = [225, 183, 73];
      const BLUE = [80, 150, 255];

      /* Read --ac CSS variable for canvas (CSS vars not supported in canvas API) */
      function getAcRgb() {
        const v = getComputedStyle(document.documentElement).getPropertyValue('--ac').trim();
        const parts = v.split(',').map(s => s.trim());
        if (parts.length === 3) return parts;
        return ['225', '183', '73'];
      }
      function getOrbRgb() {
        const v = getComputedStyle(document.documentElement).getPropertyValue('--orb-blue1').trim();
        const parts = v.split(',').map(s => s.trim());
        if (parts.length === 3) return parts.map(Number);
        return [80, 150, 255];
      }
      const _ac = getAcRgb().map(Number);
      const _orb = getOrbRgb();

      const PARTICLE_COUNT = 25;
      const GLINT_COUNT = 4;
      const FPS_CAP = 16;

      const particles = Array.from({ length: PARTICLE_COUNT }, () => {
        const isGold = Math.random() > 0.45;
        const [r, g, b] = isGold ? _ac : _orb;
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 1.5 + 0.2,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          baseAlpha: Math.random() * 0.4 + 0.08,
          cr: r, cg: g, cb: b,
          tSpeed: Math.random() * 0.007 + 0.002,
          tPhase: Math.random() * Math.PI * 2,
          bSpeed: Math.random() * 0.003 + 0.001,
          bPhase: Math.random() * Math.PI * 2,
        };
      });

      for (let i = 0; i < GLINT_COUNT; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 2.5 + 1.0,
          vx: (Math.random() - 0.5) * 0.07,
          vy: (Math.random() - 0.5) * 0.07,
          baseAlpha: Math.random() * 0.55 + 0.2,
          cr: _ac[0], cg: _ac[1], cb: _ac[2],
          tSpeed: Math.random() * 0.01 + 0.004,
          tPhase: Math.random() * Math.PI * 2,
          bSpeed: Math.random() * 0.004 + 0.001,
          bPhase: Math.random() * Math.PI * 2,
        });
      }

      let frame = 0;
      let _lastT = 0;
      let _rafId = null;
      let _paused = false;
      let _disposed = false;

      function startDraw() {
        if (_rafId || _paused || _disposed) return;
        _rafId = requestAnimationFrame(draw);
      }

      function draw(ts) {
        _rafId = null;
        if (_paused || _disposed) return;
        if (ts - _lastT < FPS_CAP) {
          startDraw();
          return;
        }
        _lastT = ts;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frame++;

        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          const twinkle = 0.55 + 0.45 * Math.sin(frame * p.tSpeed + p.tPhase);
          const breathe = 0.7 + 0.3 * Math.sin(frame * p.bSpeed + p.bPhase);
          const a = p.baseAlpha * twinkle * breathe;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.cr},${p.cg},${p.cb},${a})`;
          ctx.fill();
        });
        startDraw();
      }
      startDraw();

      document.addEventListener('visibilitychange', function () {
        if (_disposed) return;
        _paused = document.hidden;
        if (_paused) {
          if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
        } else {
          startDraw();
        }
      });

      window._stopBgCanvas = function () {
        _disposed = true;
        _paused = true;
        if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
        window.removeEventListener('resize', resize);
        try { ctx.clearRect(0, 0, canvas.width, canvas.height); } catch (_) {}
        canvas.width = 0;
        canvas.height = 0;
      };
      window.addEventListener('splashdone', window._stopBgCanvas, { once: true });
    })();

/* launcher_view.html script 5 */
(function () {
      const spCanvas = document.getElementById('sp-bg');
      const spCtx = spCanvas.getContext('2d');
      function spResize() { spCanvas.width = innerWidth; spCanvas.height = innerHeight; }
      spResize(); window.addEventListener('resize', spResize);

      const GOLD = [225, 183, 73], BLUE = [60, 130, 220];

      /* Read --ac CSS variable for canvas */
      function spGetAcRgb() {
        const v = getComputedStyle(document.documentElement).getPropertyValue('--ac').trim();
        const parts = v.split(',').map(s => s.trim());
        return parts.length === 3 ? parts : ['225', '183', '73'];
      }
      function spGetOrbRgb() {
        const v = getComputedStyle(document.documentElement).getPropertyValue('--orb-blue1').trim();
        const parts = v.split(',').map(s => s.trim());
        return parts.length === 3 ? parts.map(Number) : [60, 130, 220];
      }
      const _spAc = spGetAcRgb().map(Number);
      const _spOrb = spGetOrbRgb();
      const spPts = Array.from({ length: 65 }, () => {
        const ig = Math.random() > .45, [r, g, b] = ig ? _spAc : _spOrb;
        return {
          x: Math.random() * innerWidth, y: Math.random() * innerHeight,
          r: Math.random() * 1.6 + .25, vx: (Math.random() - .5) * .13, vy: (Math.random() - .5) * .13,
          base: Math.random() * .38 + .05, cr: r, cg: g, cb: b,
          ts: Math.random() * .008 + .002, tp: Math.random() * Math.PI * 2,
          bs: Math.random() * .003 + .001, bp: Math.random() * Math.PI * 2
        };
      });
      const spStreaks = [];
      let spDisposed = false;
      let spStreakTimer = null;
      let spWordTimer = null;
      let spAmbTimer = null;
      function spSpawnStreak() {
        if (spDisposed) return;
        if (spStreaks.length >= 3) return;
        const a = Math.PI * (.15 + Math.random() * .2), sp = 4 + Math.random() * 5;
        spStreaks.push({
          x: Math.random() * innerWidth, y: Math.random() * innerHeight * .5,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, len: 80 + Math.random() * 120,
          alpha: 0, state: 'in', life: 0, maxLife: 40 + Math.random() * 30
        });
      }
      function spSchedStreaks() {
        if (spDisposed) return;
        spStreakTimer = setTimeout(() => { spSpawnStreak(); spSchedStreaks(); }, 2500 + Math.random() * 5000);
      }

      let spF = 0, spAmbA = 0;
      function spDraw() {
        spCtx.clearRect(0, 0, spCanvas.width, spCanvas.height); spF++;
        if (spAmbA > 0) {
          spCtx.save(); spCtx.globalAlpha = spAmbA;
          spPts.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = spCanvas.width; if (p.x > spCanvas.width) p.x = 0;
            if (p.y < 0) p.y = spCanvas.height; if (p.y > spCanvas.height) p.y = 0;
            const tw = .55 + .45 * Math.sin(spF * p.ts + p.tp), bw = .7 + .3 * Math.sin(spF * p.bs + p.bp);
            spCtx.beginPath(); spCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            spCtx.fillStyle = `rgba(${p.cr},${p.cg},${p.cb},${p.base * tw * bw})`; spCtx.fill();
          });
          for (let i = spStreaks.length - 1; i >= 0; i--) {
            const s = spStreaks[i]; s.x += s.vx; s.y += s.vy; s.life++;
            if (s.state === 'in') { s.alpha = Math.min(1, s.alpha + .08); if (s.alpha >= 1) s.state = 'hold'; }
            if (s.state === 'hold' && s.life > s.maxLife * .5) s.state = 'out';
            if (s.state === 'out') { s.alpha = Math.max(0, s.alpha - .06); }
            if (s.alpha <= 0 && s.state === 'out') { spStreaks.splice(i, 1); continue; }
            const tx = s.x - s.vx * (s.len / Math.hypot(s.vx, s.vy)), ty = s.y - s.vy * (s.len / Math.hypot(s.vx, s.vy));
            const gg = spCtx.createLinearGradient(tx, ty, s.x, s.y);
            const [sr, sg, sb] = spGetAcRgb();
            gg.addColorStop(0, `rgba(${sr},${sg},${sb},0)`);
            gg.addColorStop(.7, `rgba(${sr},${sg},${sb},${s.alpha * .4})`);
            gg.addColorStop(1, `rgba(255,240,180,${s.alpha * .9})`);
            spCtx.beginPath(); spCtx.moveTo(tx, ty); spCtx.lineTo(s.x, s.y);
            spCtx.strokeStyle = gg; spCtx.lineWidth = 1.5; spCtx.stroke();
            const gw = spCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 6);
            const [sr2, sg2, sb2] = spGetAcRgb();
            gw.addColorStop(0, `rgba(255,240,180,${s.alpha * .9})`); gw.addColorStop(1, `rgba(${sr2},${sg2},${sb2},0)`);
            spCtx.beginPath(); spCtx.arc(s.x, s.y, 6, 0, Math.PI * 2); spCtx.fillStyle = gw; spCtx.fill();
          }
          spCtx.restore();
        }
        /* Berhenti render setelah overlay hilang */
        const liveOverlay = document.getElementById('splash-overlay');
        if (!spDisposed && liveOverlay && liveOverlay.style.display !== 'none')
          requestAnimationFrame(spDraw);
      }
      spDraw();
      const spGateTop = document.getElementById('sp-gate-top');
      const spGateBot = document.getElementById('sp-gate-bottom');
      const spCrack = document.getElementById('sp-gate-crack');
      const spCenter = document.getElementById('sp-center');
      const spArc = document.getElementById('sp-prog-arc');
      const spOverlay = document.getElementById('splash-overlay');
      let spFailSafeTimer = null;
      let spFailSafeDone = false;

      function spAfter(ms) { return new Promise(r => setTimeout(r, ms)); }
      function spNextFrame() { return new Promise(r => requestAnimationFrame(() => r())); }
      function spShow(el, cls = 'show') { el.classList.add(cls); }
      function spHide(el, cls = 'show') { el.classList.remove(cls); }
      function spWaitForStableViewport(maxWait = 1400, quietWait = 220) {
        return new Promise(resolve => {
          let done = false;
          let quietTimer = null;
          let maxTimer = null;
          function finish() {
            if (done) return;
            done = true;
            clearTimeout(quietTimer);
            clearTimeout(maxTimer);
            window.removeEventListener('resize', onResize);
            try { window.visualViewport && window.visualViewport.removeEventListener('resize', onResize); } catch (_) {}
            resolve();
          }
          function onResize() {
            clearTimeout(quietTimer);
            quietTimer = setTimeout(finish, quietWait);
          }
          window.addEventListener('resize', onResize);
          try { window.visualViewport && window.visualViewport.addEventListener('resize', onResize); } catch (_) {}
          quietTimer = setTimeout(finish, quietWait);
          maxTimer = setTimeout(finish, maxWait);
        });
      }
      function spStopSplashMotion() {
        spDisposed = true;
        if (spStreakTimer) clearTimeout(spStreakTimer);
        if (spWordTimer) clearInterval(spWordTimer);
        if (spAmbTimer) clearInterval(spAmbTimer);
      }
      function spForceReveal(reason) {
        if (spFailSafeDone) return;
        spFailSafeDone = true;
        try { console.warn('[splash] force reveal', reason || 'timeout'); } catch (_) {}
        if (typeof window.__forceShowLauncher === 'function') {
          window.__forceShowLauncher(reason || 'splash-force');
          return;
        }
        spDisposed = true;
        if (spFailSafeTimer) clearTimeout(spFailSafeTimer);
        if (spStreakTimer) clearTimeout(spStreakTimer);
        if (spWordTimer) clearInterval(spWordTimer);
        if (spAmbTimer) clearInterval(spAmbTimer);
        try { window.removeEventListener('resize', spResize); } catch (_) {}
        try { spRemoveBootCover(); } catch (_) {}
        try {
          const liveOverlay = document.getElementById('splash-overlay');
          if (liveOverlay) liveOverlay.remove();
        } catch (_) {}
        try { window.dispatchEvent(new Event('splashdone')); } catch (_) {}
      }
      function spDisposeOverlay() {
        if (spFailSafeDone) return;
        spFailSafeDone = true;
        spDisposed = true;
        if (spFailSafeTimer) clearTimeout(spFailSafeTimer);
        if (spStreakTimer) clearTimeout(spStreakTimer);
        if (spWordTimer) clearInterval(spWordTimer);
        if (spAmbTimer) clearInterval(spAmbTimer);
        window.removeEventListener('resize', spResize);
        spRemoveBootCover();
        try {
          const blackFade = document.getElementById('sp-black-fade');
          if (blackFade) blackFade.remove();
        } catch (_) {}
        try { document.documentElement.classList.add('launcher-ready'); } catch (_) {}
        if (spOverlay) spOverlay.remove();
      }
      function spRemoveBootCover() {
        const bootCover = document.getElementById('sp-boot-cover');
        if (bootCover) bootCover.remove();
      }
      spFailSafeTimer = setTimeout(() => spForceReveal('timeout'), 18000);
      async function spRun() {
        await spWaitForStableViewport();
        spGateTop.style.transition = 'none';
        spGateBot.style.transition = 'none';
        spGateTop.classList.add('closed');
        spGateBot.classList.add('closed');

        /* Fade dari #111111 ke warna --navy tema, lalu hilang */
        const spBlack = document.getElementById('sp-black-fade');
        const navyColor = getComputedStyle(document.documentElement).getPropertyValue('--navy').trim();
        spBlack.style.backgroundColor = navyColor;
        spBlack.style.opacity = '0';
        spRemoveBootCover();
        spShow(spCrack);
        await spAfter(80);
        spShow(spCenter);
        await spAfter(600);
        spGateTop.style.transition = '';
        spGateBot.style.transition = '';

        await spAfter(40);

        /* Gold flash saat gerbang terbuka */

        spGateTop.classList.replace('closed', 'open');
        spGateBot.classList.replace('closed', 'open');
        await spAfter(300);
        spHide(spCrack, 'show');

        await spAfter(600);
        spAmbTimer = setInterval(() => { spAmbA = Math.min(1, spAmbA + .04); if (spAmbA >= 1) { clearInterval(spAmbTimer); spAmbTimer = null; } }, 30);
        spSchedStreaks();
        document.querySelectorAll('.sp-orb').forEach(o => o.classList.add('show'));
        spArc.setAttribute('stroke', 'rgba(var(--ac),0.65)');
        spShow(document.getElementById('sp-dot-loader'));
        spShow(document.getElementById('sp-loading-words'));
        spShow(document.getElementById('sp-pct-txt'));
        ['sp-c-tl', 'sp-c-tr', 'sp-c-bl', 'sp-c-br'].forEach(id => spShow(document.getElementById(id)));
        spShow(document.getElementById('sp-status-bar'));
        spShow(document.getElementById('sp-copyright'));

        /* Rotasi kata — 10 bahasa */
        const WORDS = ['sp-lw-0', 'sp-lw-1', 'sp-lw-2', 'sp-lw-3', 'sp-lw-4', 'sp-lw-5', 'sp-lw-6', 'sp-lw-7', 'sp-lw-8', 'sp-lw-9'];
        let wi = 0;
        document.getElementById('sp-lw-0').classList.add('vis');
        spWordTimer = setInterval(() => {
          document.getElementById(WORDS[wi]).classList.remove('vis');
          wi = (wi + 1) % WORDS.length;
          document.getElementById(WORDS[wi]).classList.add('vis');
        }, 700);
        await spAfter(200);
        const CIRC = 2 * Math.PI * 144;
        let pct = 0;
        /* Ganti setInterval(45ms) → rAF + delta-time agar update tiap frame (60fps) */
        const PROG_RATE = 0.65 / 45; /* pct/ms — speed sama dengan sebelumnya */
        let _progLast = null;
        function _progStep(ts) {
          if (_progLast === null) _progLast = ts;
          const delta = Math.min(ts - _progLast, 100); /* cap 100ms agar tidak loncat saat tab blur */
          _progLast = ts;
          pct = Math.min(100, pct + (PROG_RATE + (Math.random() - .5) * 0.004) * delta);
          const d = (pct / 100) * CIRC;
          spArc.setAttribute('stroke-dasharray', `${d} ${CIRC - d}`);
          document.getElementById('sp-pct-txt').textContent = Math.round(pct) + '%';
          if (pct < 100) { requestAnimationFrame(_progStep); return; }
          spArc.setAttribute('stroke', 'rgba(var(--ac),0.9)');
          window.pywebview?.api?.splash_done?.();
          setTimeout(async () => {
            let finalGuard = null;
            try {
            finalGuard = setTimeout(() => spForceReveal('final-sequence-watchdog'), 3200);

            /* 1. Fade out loading UI */
            ['sp-dot-loader', 'sp-loading-words', 'sp-pct-txt',
              'sp-c-tl', 'sp-c-tr', 'sp-c-bl', 'sp-c-br',
              'sp-status-bar', 'sp-copyright'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.transition = 'opacity .3s', el.style.opacity = '0';
              });
            spArc.style.transition = 'opacity .3s'; spArc.style.opacity = '0';

            await spAfter(350);

            /* 2. Gate SLAM TUTUP */
            const SLAM_MS = 550;               // durasi slam tutup (ms)
            const CRACK_DELAY_MS = 420;        // crack muncul saat gerbang hampir ketutup
            spGateTop.style.transition = `transform ${SLAM_MS}ms cubic-bezier(.77,0,.18,1), border-color .3s ease`;
            spGateBot.style.transition = `transform ${SLAM_MS}ms cubic-bezier(.77,0,.18,1), border-color .3s ease`;

            /* pastikan dari posisi open/0 → closed */
            spHide(spCrack, 'show');            // amanin crack masih off
            spGateTop.classList.remove('open');
            spGateBot.classList.remove('open');
            spGateTop.classList.add('closed');
            spGateBot.classList.add('closed');

            await spAfter(CRACK_DELAY_MS);
            spShow(spCrack);

            /* flash saat gerbang menutup */
            await spAfter(SLAM_MS - CRACK_DELAY_MS);

            await spAfter(250);

            /* 3. Sembunyikan center stage (logo) supaya launcher terlihat saat terbuka */
            spCenter.style.transition = 'opacity .25s';
            spCenter.style.opacity = '0';
            await spAfter(260);

            /* 4. Gate BUKA → reveal launcher */
            spStopSplashMotion();
            spOverlay.style.pointerEvents = 'none';
            spGateTop.style.transition = 'transform 1s cubic-bezier(.77,0,.18,1), border-color .3s ease';
            spGateBot.style.transition = 'transform 1s cubic-bezier(.77,0,.18,1), border-color .3s ease';
            spHide(spCrack, 'show');

            /* gold flash saat terbuka */
            spGateTop.offsetHeight;
            await spNextFrame();
            spGateTop.classList.replace('closed', 'open');
            spGateBot.classList.replace('closed', 'open');
            setTimeout(() => spForceReveal('post-open-watchdog'), 1600);

            await spAfter(900);

            /* 5. Hapus overlay */
            if (finalGuard) clearTimeout(finalGuard);
            spOverlay.style.display = 'none';
            spDisposeOverlay();
            window.dispatchEvent(new Event('splashdone'));
            } catch (e) {
              if (finalGuard) clearTimeout(finalGuard);
              spForceReveal(e && e.message ? e.message : e);
            }

          }, 400);
        }
        requestAnimationFrame(_progStep);
      }

      // Jika kembali dari modul (#nosplash): animasi sama dengan reveal pertama (slam → crack → buka)
      if (location.hash === '#nosplash') {
        (async function spReveal() {
          const finalGuard = setTimeout(() => spForceReveal('nosplash-sequence-watchdog'), 3000);
          // Overlay menutupi launcher
          spOverlay.style.opacity = '1';
          spOverlay.style.display = 'block';
          spRemoveBootCover();

          // Gate mulai dari posisi terbuka
          spGateTop.style.transition = 'none';
          spGateBot.style.transition = 'none';
          spGateTop.classList.remove('closed');
          spGateBot.classList.remove('closed');
          spGateTop.classList.add('open');
          spGateBot.classList.add('open');
          spHide(spCrack, 'show');

          await spAfter(80);

          // Gate SLAM TUTUP
          const SLAM_MS = 550;
          const CRACK_DELAY_MS = 420;
          spGateTop.style.transition = `transform ${SLAM_MS}ms cubic-bezier(.77,0,.18,1), border-color .3s ease`;
          spGateBot.style.transition = `transform ${SLAM_MS}ms cubic-bezier(.77,0,.18,1), border-color .3s ease`;
          spGateTop.classList.replace('open', 'closed');
          spGateBot.classList.replace('open', 'closed');

          await spAfter(CRACK_DELAY_MS);
          spShow(spCrack);

          await spAfter(SLAM_MS - CRACK_DELAY_MS + 250);

          // Gate BUKA → reveal launcher
          spStopSplashMotion();
          spOverlay.style.pointerEvents = 'none';
          spGateTop.style.transition = 'transform 1s cubic-bezier(.77,0,.18,1), border-color .3s ease';
          spGateBot.style.transition = 'transform 1s cubic-bezier(.77,0,.18,1), border-color .3s ease';
          spHide(spCrack, 'show');
          spGateTop.offsetHeight;
          await spNextFrame();
          spGateTop.classList.replace('closed', 'open');
          spGateBot.classList.replace('closed', 'open');
          setTimeout(() => spForceReveal('nosplash-post-open-watchdog'), 1600);

          await spAfter(900);

          // Hapus overlay
          clearTimeout(finalGuard);
          spOverlay.style.display = 'none';
          spDisposeOverlay();
          window.dispatchEvent(new Event('splashdone'));
        })().catch(spForceReveal);
      } else {
        spRun().catch(spForceReveal);
      }
    })();

/* launcher_view.html script 6 */
; (function (global) {
      'use strict';

      /* Corner SVG helper */
      const CORNER_SVG = `
<svg class="ld-corner-svg" viewBox="0 0 28 28" fill="none">
  <path d="M2 26 L2 2 L26 2" stroke-width="1"/>
</svg>`;
      const ICONS = {
        confirm: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
        exit: `<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
        reload: `<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
        back: `<svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
        recovery: `<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
        zoom: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
        warning: `<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        check: `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
      };
      function makeOverlay(innerHTML) {
        const overlay = document.createElement('div');
        overlay.className = 'ld-overlay';
        overlay.style.cssText = [
          'position:fixed',
          'top:0',
          'right:0',
          'bottom:0',
          'left:0',
          'width:100vw',
          'height:100vh',
          'z-index:99000',
          'display:flex',
          'align-items:center',
          'justify-content:center',
          'padding:20px',
          'box-sizing:border-box',
          'overflow:auto',
          'margin:0',
          'transform:none',
          'pointer-events:all',
          'background:rgba(var(--toast-bg,6,18,36),.72)',
          'backdrop-filter:blur(6px)'
        ].join(';');
        overlay.innerHTML = `<div class="ld-box">
    <div class="ld-corner tl">${CORNER_SVG}</div>
    <div class="ld-corner tr">${CORNER_SVG}</div>
    <div class="ld-corner bl">${CORNER_SVG}</div>
    <div class="ld-corner br">${CORNER_SVG}</div>
    ${innerHTML}
  </div>`;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('ld-in')));
        return overlay;
      }

      function closeOverlay(overlay, resolve, value) {
        overlay.classList.remove('ld-in');
        overlay.classList.add('ld-out');
        setTimeout(() => { overlay.remove(); resolve(value); }, 280);
      }
      function confirm(opts) {
        if (typeof opts === 'string') opts = { message: opts };
        const {
          title = 'Konfirmasi',
          message = '',
          okText = 'Ya',
          cancelText = 'Batal',
          type = 'default',
          icon = 'confirm',
        } = opts;

        const iconClass = type === 'danger' ? 'ld-danger' : type === 'warning' ? 'ld-warning' : '';
        const okClass = type === 'danger' ? 'ld-btn-danger' : 'ld-btn-primary';

        return new Promise(resolve => {
          const overlay = makeOverlay(`
      <div class="ld-icon-wrap ${iconClass}">${ICONS[icon] || ICONS.confirm}</div>
      <div class="ld-title">${title}</div>
      <div class="ld-msg">${message}</div>
      <div class="ld-divider"></div>
      <div class="ld-btns">
        <button class="ld-btn ld-btn-secondary" id="ld-cancel">${cancelText}</button>
        <button class="ld-btn ${okClass}" id="ld-ok">${okText}</button>
      </div>
    `);
          overlay.querySelector('#ld-ok').onclick = () => closeOverlay(overlay, resolve, true);
          overlay.querySelector('#ld-cancel').onclick = () => closeOverlay(overlay, resolve, false);
          // ESC key
          const onKey = e => { if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); closeOverlay(overlay, resolve, false); } };
          document.addEventListener('keydown', onKey);
        });
      }
      function alert(opts) {
        if (typeof opts === 'string') opts = { message: opts };
        const {
          title = 'Informasi',
          message = '',
          okText = 'OK',
          icon = 'check',
          type = 'default',
        } = opts;
        const iconClass = type === 'success' ? 'ld-success' : type === 'danger' ? 'ld-danger' : '';
        return new Promise(resolve => {
          const overlay = makeOverlay(`
      <div class="ld-icon-wrap ${iconClass}">${ICONS[icon] || ICONS.check}</div>
      <div class="ld-title">${title}</div>
      <div class="ld-msg">${message}</div>
      <div class="ld-divider"></div>
      <div class="ld-btns ld-single">
        <button class="ld-btn ld-btn-primary" id="ld-ok">${okText}</button>
      </div>
    `);
          overlay.querySelector('#ld-ok').onclick = () => closeOverlay(overlay, resolve, undefined);
          const onKey = e => { if (e.key === 'Escape' || e.key === 'Enter') { document.removeEventListener('keydown', onKey); closeOverlay(overlay, resolve, undefined); } };
          document.addEventListener('keydown', onKey);
        });
      }
      function prompt(opts) {
        if (typeof opts === 'string') opts = { message: opts };
        const {
          title = 'Input',
          message = '',
          defaultValue = '',
          placeholder = '',
          okText = 'OK',
          cancelText = 'Batal',
          icon = 'zoom',
        } = opts;
        return new Promise(resolve => {
          const overlay = makeOverlay(`
      <div class="ld-icon-wrap">${ICONS[icon] || ICONS.zoom}</div>
      <div class="ld-title">${title}</div>
      <div class="ld-msg">${message}</div>
      <div class="ld-input-wrap">
        <input class="ld-input" id="ld-pinput" type="text" value="${defaultValue}" placeholder="${placeholder}" autocomplete="off" spellcheck="false">
      </div>
      <div class="ld-divider"></div>
      <div class="ld-btns">
        <button class="ld-btn ld-btn-secondary" id="ld-cancel">${cancelText}</button>
        <button class="ld-btn ld-btn-primary" id="ld-ok">${okText}</button>
      </div>
    `);
          const input = overlay.querySelector('#ld-pinput');
          setTimeout(() => { input.focus(); input.select(); }, 100);

          const doOk = () => {
            const v = input.value.trim();
            closeOverlay(overlay, resolve, v || null);
          };
          const doCancel = () => closeOverlay(overlay, resolve, null);

          overlay.querySelector('#ld-ok').onclick = doOk;
          overlay.querySelector('#ld-cancel').onclick = doCancel;
          input.addEventListener('keydown', e => {
            if (e.key === 'Enter') doOk();
            if (e.key === 'Escape') doCancel();
          });
        });
      }
      function recovery(opts) {
        if (typeof opts === 'string') opts = { time: opts };
        const {
          time = '',
          message = 'Ditemukan data yang belum disimpan dari sesi sebelumnya.',
          okText = 'Lanjutkan Data',
          cancelText = 'Mulai Baru',
        } = opts;
        const timeHtml = time ? `<span class="ld-time">⏱ ${time}</span>` : '';
        return new Promise(resolve => {
          const overlay = makeOverlay(`
      <div class="ld-icon-wrap ld-recovery">${ICONS.recovery}</div>
      <div class="ld-title">Pemulihan Data</div>
      <div class="ld-msg">${message}${timeHtml ? '<br>' + timeHtml : ''}</div>
      <div class="ld-divider"></div>
      <div class="ld-btns">
        <button class="ld-btn ld-btn-secondary" id="ld-cancel">${cancelText}</button>
        <button class="ld-btn ld-btn-recovery" id="ld-ok">${okText}</button>
      </div>
    `);
          overlay.querySelector('#ld-ok').onclick = () => closeOverlay(overlay, resolve, true);
          overlay.querySelector('#ld-cancel').onclick = () => closeOverlay(overlay, resolve, false);
          const onKey = e => { if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); closeOverlay(overlay, resolve, false); } };
          document.addEventListener('keydown', onKey);
        });
      }
      function exit(opts) {
        const {
          title = 'Keluar Aplikasi',
          message = 'Yakin ingin keluar dari LIBERO?\nPastikan semua data telah disimpan.',
          okText = 'Keluar',
          cancelText = 'Batal',
        } = (opts || {});
        return new Promise(resolve => {
          const overlay = makeOverlay(`
      <div class="ld-icon-wrap ld-danger">${ICONS.exit}</div>
      <div class="ld-title">${title}</div>
      <div class="ld-msg">${message}</div>
      <div class="ld-divider"></div>
      <div class="ld-btns">
        <button class="ld-btn ld-btn-secondary" id="ld-cancel">${cancelText}</button>
        <button class="ld-btn ld-btn-danger" id="ld-ok">${okText}</button>
      </div>
    `);
          overlay.querySelector('#ld-ok').onclick = () => closeOverlay(overlay, resolve, true);
          overlay.querySelector('#ld-cancel').onclick = () => closeOverlay(overlay, resolve, false);
          const onKey = e => { if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); closeOverlay(overlay, resolve, false); } };
          document.addEventListener('keydown', onKey);
        });
      }
      global.LDialog = { confirm, alert, prompt, recovery, exit };

    })(window);

/* launcher_view.html script 7 */
/* TOAST — identik dengan litmasanak & integrasi */
    (function () {
      var _visible = null;
      var _timer = null;


      var _wrap = document.createElement('div');
      _wrap.className = 'toast-wrap';
      document.body.appendChild(_wrap);

      var ICONS_TOAST = {
        success: '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
        error: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        warning: '<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        progress: '<svg viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
      };
      var LABELS = { success: 'Berhasil', error: 'Gagal', warning: 'Perhatian', info: 'Info', progress: 'Memproses' };

      function _detectType(msg) {
        var m = String(msg || '').toLowerCase();
        if (/berhasil|tersimpan|sukses|✓/.test(m)) return 'success';
        if (/gagal|error|tidak ditemukan|tidak ada/.test(m)) return 'error';
        if (/belum|coba lagi|kosong|pilih|masukkan|isi /.test(m)) return 'warning';
        if (/membuat|membuka|memuat|memproses|\.\.\./.test(m)) return 'progress';
        return 'info';
      }

      function _dismiss(el) {
        if (!el || !el.parentNode) return;
        el.classList.remove('in'); el.classList.add('out');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
      }
      function _clearAll() {
        clearTimeout(_timer);
        _wrap.querySelectorAll('._toast-item').forEach(function (el) { _dismiss(el); });
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
        el.style.pointerEvents = 'all'; el.style.cursor = 'pointer';
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
        _visible = el; clearTimeout(_timer);
        _timer = setTimeout(function () { _dismiss(el); _visible = null; }, duration);
      }

      window.toast = function (msg, dur) { _show(msg, null, dur); };
      window.toastSuccess = function (msg, dur) { _show(msg, 'success', dur); };
      window.toastError = function (msg, dur) { _show(msg, 'error', dur); };
      window.toastWarning = function (msg, dur) { _show(msg, 'warning', dur); };
      window.toastInfo = function (msg, dur) { _show(msg, 'info', dur); };
      window.toastProgress = function (msg, dur) { _show(msg, 'progress', dur); };
      window.toastClear = function () { _clearAll(); };
      window.showToast = function (msg, dur) { _show(msg, 'info', dur); };
    })();

/* launcher_view.html script 8 */
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
        'servant': 'light',
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
      var _current = window._LT
        || document.documentElement.getAttribute('data-theme')
        || DEFAULT;

      function themeBucket(name) {
        if (window.LiberoTheme && window.LiberoTheme.themeBucket) {
          return window.LiberoTheme.themeBucket(name);
        }
        return THEME_BUCKETS[name] || 'dark';
      }

      function themeSurface(name) {
        if (window.LiberoTheme && window.LiberoTheme.themeSurface) {
          return window.LiberoTheme.themeSurface(name);
        }
        return THEME_SURFACES[name] || 'dark-shell';
      }

      /* warna swatch per tema — 4 stop gradasi penuh */
      var themeColors = {
        'standar': ['#08223E', '#0a2845', '#E1B749', '#f0cc6e'],
        'blau': ['#f0f4f8', '#e0e8f4', '#2563eb', '#60a5fa'],
        'weekday': ['#f5f0e8', '#ede6d8', '#92400e', '#d97706'],
        '9-to-5': ['#18100f', '#2E1C16', '#C8A55A', '#debb72'],
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
        'preorder': ['#F9F6ED', '#EAE7DF', '#C8A040', '#e0bc60'],
        'college': ['#2a2e34', '#333840', '#9098a8', '#b8c0cc'],
        'clown': ['#e2eedb', '#ffdae1', '#7a3a50', '#a05a70'],
        'bucharest': ['#cfecec', '#bfe4e4', '#0a6060', '#1a8080'],
        'grandma': ['#000000', '#222222', '#1a1a1a', '#f0cc6e'],
        'snake': ['#000008', '#00000d', '#5590E0', '#D4A017'],
        'justin': ['#fff8f2', '#ffe8d4', '#FF9A00', '#ffcc66'],
        'strauss': ['#1c2830', '#243540', '#A06845', '#be8460'],
        'brooks': ['#0e0814', '#1e1030', '#DC3CB4', '#f060d0'],
        'harbor': ['#0c1c1e', '#163032', '#3CAABB', '#5accd8'],
        'car-call': ['#161412', '#2A2620', '#B4A488', '#ccc0a0'],
        'servant': ['#EDE0C0', '#D4B878', '#946428', '#b07c3e'],
        'nastasic': ['#1C1C18', '#2E2C26', '#A89B78', '#c0b490'],
      };

      function _applyVisual(name) {
        _current = name;
        var root = document.documentElement;
        if (name === DEFAULT) {
          root.removeAttribute('data-theme');
        } else {
          root.setAttribute('data-theme', name);
        }
        root.setAttribute('data-theme-bucket', themeBucket(name));
        root.setAttribute('data-theme-surface', themeSurface(name));
        var t = THEMES.find(function (x) { return x.id === name; }) || THEMES[0];
        var lbl = document.getElementById('theme-btn-label');
        if (lbl) lbl.textContent = t.label;
      }

      function setTheme(name, fromUser) {
        _applyVisual(name);
        if (fromUser) {
          try {
            if (window.pywebview && window.pywebview.api && window.pywebview.api.save_theme) {
              window.pywebview.api.save_theme(name);
            }
          } catch (_) { }
        }
      }

      function buildMenu() {
        var menu = document.getElementById('theme-menu');
        if (!menu) return;
        menu.innerHTML = '';

        /* header label */
        var hdr = document.createElement('div');
        hdr.style.cssText = 'font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.3);padding:2px 4px 6px;';
        hdr.textContent = 'PILIH TEMA';
        menu.appendChild(hdr);

        /* divider */
        var dvd = document.createElement('div');
        dvd.style.cssText = 'height:1px;background:rgba(255,255,255,.07);margin-bottom:6px;';
        menu.appendChild(dvd);

        /* grid 4 kolom */
        var grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:5px;';

        THEMES.forEach(function (t) {
          var isActive = _current === t.id;
          var c = themeColors[t.id] || ['#08223E', '#0a2845', '#E1B749', '#f0cc6e'];
          var grad = 'linear-gradient(90deg,' + c[0] + ' 0%,' + c[1] + ' 33%,' + c[2] + ' 67%,' + c[3] + ' 100%)';

          var item = document.createElement('button');
          item.style.cssText = [
            'display:flex;align-items:center;justify-content:center;',
            'padding:8px 6px;border-radius:8px;',
            'border:1px solid ' + (isActive ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.08)') + ';',
            'background:' + (isActive ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.03)') + ';',
            'color:rgba(255,255,255,.85);font-size:10px;font-weight:700;letter-spacing:.4px;',
            'cursor:pointer;text-align:center;transition:all .13s;font-family:inherit;white-space:nowrap;width:100%;',
          ].join('');
          item.onmouseover = function () { this.style.background = 'rgba(255,255,255,.14)'; this.style.borderColor = 'rgba(255,255,255,.3)'; };
          item.onmouseout = function () {
            var act = _current === t.id;
            this.style.background = act ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.03)';
            this.style.borderColor = act ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.08)';
          };

          var lbl = document.createElement('span');
          lbl.textContent = t.label;
          lbl.style.cssText = 'line-height:1;color:' + (isActive ? '#fff' : 'rgba(255,255,255,.65)') + ';font-weight:' + (isActive ? '800' : '600') + ';';

          item.appendChild(lbl);
          item.onclick = (function(tid) { return function () { window._SFX && window._SFX.fire(); setTheme(tid, true); closeMenu(); buildMenu(); }; })(t.id);
          grid.appendChild(item);
        });

        menu.appendChild(grid);
      }

      function openMenu() {
        buildMenu();
        var menu = document.getElementById('theme-menu');
        if (!menu) return;
        menu.style.display = 'block';
        _menuOpen = true;
        window._SFX && window._SFX.open();
      }
      function closeMenu() {
        var menu = document.getElementById('theme-menu');
        if (menu) menu.style.display = 'none';
        _menuOpen = false;
        window._SFX && window._SFX.close();
      }

      window.toggleThemeMenu = function (e) {
        e.stopPropagation();
        _menuOpen ? closeMenu() : openMenu();
      };
      window.setTheme = setTheme;

      /* tutup menu kalau klik di luar */
      document.addEventListener('click', function (e) {
        var sw = document.getElementById('theme-switcher');
        if (_menuOpen && sw && !sw.contains(e.target)) closeMenu();
      });

      /* init */
      document.addEventListener('DOMContentLoaded', function () {
        var dt = document.documentElement.getAttribute('data-theme');
        _current = window._LT || dt || DEFAULT;
        _applyVisual(_current);
      });
    })();

/* launcher_view.html script 9 */
(function () {
      var _isFs = false;
      var _fsBusy = false;

      // Dipanggil dari Python setelah _on_shown() selesai toggle ke fullscreen
      window._syncFullscreenState = function (state) {
        _isFs = !!state;
      };

      window.toggleFullscreen = function () {
        if (_fsBusy) return;
        if (window.pywebview && window.pywebview.api && window.pywebview.api.toggle_fullscreen) {
          var next = !_isFs;
          _fsBusy = true;
          window.pywebview.api.toggle_fullscreen().then(function (res) {
            if (res && res.ok) _isFs = next;
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

    // ── Auto Update ─────────────────────────────────────────────────────────────
    (function () {
      var _exeUrl = '';
      var _toastEl = null;
      var _downloading = false;
      var _latestVersion = '';
      var _readyToastDismissed = false;
      var _readyInstallScheduled = false;

      function _dismissToast() {
        if (!_toastEl || !_toastEl.parentNode) return;
        _toastEl.classList.remove('in');
        _toastEl.classList.add('out');
        setTimeout(function () {
          if (_toastEl && _toastEl.parentNode) _toastEl.parentNode.removeChild(_toastEl);
          _toastEl = null;
        }, 260);
      }

      function _panel() {
        return document.getElementById('silent-update-panel');
      }

      function _showUpdatePanel(mode, pct, latest) {
        if (mode === 'ready' && _readyInstallScheduled) {
          _hideUpdatePanel();
          return;
        }
        var panel = _panel();
        if (!panel) return;
        var title = document.getElementById('silent-update-title');
        var sub = document.getElementById('silent-update-sub');
        var prog = document.getElementById('silent-update-progress');
        var bar = document.getElementById('silent-update-bar');
        var actions = document.getElementById('silent-update-actions');
        panel.style.display = 'flex';
        if (bar && typeof pct === 'number') bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
        if (mode === 'ready') {
          if (title) title.textContent = 'Update selesai';
          if (sub) sub.textContent = latest ? 'LIBERO v' + latest + ' siap dipasang' : 'Pembaruan siap dipasang';
          if (prog) prog.style.display = 'none';
          if (actions) actions.style.display = 'flex';
        } else if (mode === 'error') {
          if (title) title.textContent = 'Update gagal';
          if (sub) sub.textContent = 'Akan dicoba lagi saat aplikasi dibuka';
          if (prog) prog.style.display = 'none';
          if (actions) actions.style.display = 'none';
        } else {
          var safePct = typeof pct === 'number' ? Math.max(0, Math.min(100, pct)) : 0;
          if (title) title.textContent = safePct > 0 ? 'Mengunduh pembaruan ' + safePct + '%' : 'Mengunduh pembaruan...';
          if (sub) sub.textContent = latest ? 'LIBERO v' + latest : 'LIBERO';
          if (prog) prog.style.display = 'block';
          if (actions) actions.style.display = 'none';
        }
      }

      function _hideUpdatePanel() {
        var panel = _panel();
        if (panel) panel.style.display = 'none';
      }

      function _wireUpdatePanelButtons() {
        var restart = document.getElementById('silent-update-restart');
        var later = document.getElementById('silent-update-later');
        if (restart && !restart.__wired) {
          restart.__wired = true;
          restart.addEventListener('click', function (e) {
            e.stopPropagation();
            restart.disabled = true;
            restart.textContent = 'Memulai ulang...';
            if (window.pywebview && window.pywebview.api && window.pywebview.api.install_downloaded_update) {
              window.pywebview.api.install_downloaded_update().then(function (raw) {
                var res = typeof raw === 'string' ? JSON.parse(raw) : raw;
                if (res && res.ok === false) {
                  restart.disabled = false;
                  restart.textContent = 'Restart Sekarang';
                  if (typeof toastWarning !== 'undefined') toastWarning(res.err || 'Update belum siap', 3500);
                }
              }).catch(function () {
                restart.disabled = false;
                restart.textContent = 'Restart Sekarang';
              });
            }
          });
        }
        if (later && !later.__wired) {
          later.__wired = true;
          later.addEventListener('click', function (e) {
            e.stopPropagation();
            _readyToastDismissed = true;
            _readyInstallScheduled = true;
            if (window.pywebview && window.pywebview.api && window.pywebview.api.schedule_update_install_on_next_launch) {
              window.pywebview.api.schedule_update_install_on_next_launch().catch(function () {});
            }
            _hideUpdatePanel();
          });
        }
      }

      function _showUpdateReadyToast(latest) {
        if (_readyToastDismissed || _readyInstallScheduled) return;
        latest = latest || _latestVersion || '';
        _latestVersion = latest;
        _downloading = false;
        _hideUpdatePanel();

        var old = document.getElementById('_upd-ready-toast');
        if (old && old.parentNode) return;

        var el = document.createElement('div');
        el.id = '_upd-ready-toast';
        el.className = 'libero-update-ready-toast';
        el.innerHTML =
          '<div class="_toast-icon"><svg viewBox="0 0 24 24">' +
          '<path d="M20 6 9 17l-5-5"/>' +
          '</svg></div>' +
          '<div class="_toast-text">' +
          '<div class="_toast-label">Update selesai</div>' +
          '<div class="_toast-body">' +
          'Pembaruan siap dipasang. Restart sekarang atau pasang saat dibuka lagi.' +
          '</div>' +
          '<div class="_upd-action">' +
          '<button class="_upd-skip-btn" id="_upd-ready-later">Pasang Saat Dibuka Lagi</button>' +
          '<button class="_upd-dl-btn" id="_upd-ready-restart">Restart Sekarang</button>' +
          '</div>' +
          '</div>';

        document.body.appendChild(el);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { el.classList.add('in'); });
        });

        document.getElementById('_upd-ready-later').onclick = function (e) {
          e.stopPropagation();
          _readyToastDismissed = true;
          _readyInstallScheduled = true;
          if (window.pywebview && window.pywebview.api && window.pywebview.api.schedule_update_install_on_next_launch) {
            window.pywebview.api.schedule_update_install_on_next_launch().catch(function () {});
          }
          el.classList.remove('in');
          el.classList.add('out');
          setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
        };
        document.getElementById('_upd-ready-restart').onclick = function (e) {
          e.stopPropagation();
          var btn = this;
          btn.disabled = true;
          btn.textContent = 'Memulai ulang...';
          if (window.pywebview && window.pywebview.api && window.pywebview.api.install_downloaded_update) {
            window.pywebview.api.install_downloaded_update().then(function (raw) {
              var res = typeof raw === 'string' ? JSON.parse(raw) : raw;
              if (res && res.ok === false) {
                btn.disabled = false;
                btn.textContent = 'Restart Sekarang';
                if (typeof toastWarning !== 'undefined') toastWarning(res.err || 'Update belum siap', 3500);
              }
            }).catch(function () {
              btn.disabled = false;
              btn.textContent = 'Restart Sekarang';
            });
          }
        };
      }

      window.showUpdateReadyToast = _showUpdateReadyToast;

      function showUpdateToast(info) {
        _latestVersion = info.latest || '';
        _exeUrl = info.exe_url || '';
        if (!_exeUrl) return;
        _wireUpdatePanelButtons();
        _showUpdatePanel('downloading', 0, _latestVersion);
        _startDownload();
        return;
        // Cari _wrap yang sudah dibuat sistem toast — buat fallback kalau belum ada
        var wrap = document.querySelector('.toast-wrap');
        if (!wrap) {
          wrap = document.createElement('div');
          wrap.className = 'toast-wrap';
          document.body.appendChild(wrap);
        }

        _toastEl = document.createElement('div');
        _toastEl.className = '_toast-item _toast-update';

        var changelog = '';
        if (info.changelog) {
          var line = info.changelog.replace(/[#*`_]/g, '').split('\n')
            .map(function (l) { return l.trim(); })
            .filter(function (l) { return l.length > 0; })[0] || '';
          if (line) changelog = '<div class="_toast-body">' + line + '</div>';
        }

        var actionHtml = _exeUrl
          ? '<div class="_upd-action">'
          + '<button class="_upd-dl-btn" id="_upd-dl-btn">⬇ Update ke v' + info.latest + '</button>'
          + '<button class="_upd-skip-btn" id="_upd-skip-btn">Nanti saja</button>'
          + '</div>'
          + '<div class="_upd-prog" id="_upd-prog" style="display:none"><div class="_upd-prog-bar" id="_upd-prog-bar"></div></div>'
          + '<div id="_upd-note" style="display:none;margin-top:8px;font-size:11px;color:rgba(168,220,168,.6);line-height:1.5">'
          + 'Aplikasi akan menutup dengan sendirinya.<br>Silakan tunggu ±2 menit setelah aplikasi menutup sebelum mencoba membuka kembali.'
          + '</div>'
          : '<div class="_upd-action"><button class="_upd-skip-btn" id="_upd-skip-btn">Tutup</button></div>';

        _toastEl.innerHTML =
          '<div class="_toast-icon"><svg viewBox="0 0 24 24">'
          + '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>'
          + '<polyline points="17 6 23 6 23 12"/>'
          + '</svg></div>'
          + '<div class="_toast-text">'
          + '<div class="_toast-label">Update Tersedia</div>'
          + '<div class="_toast-body">LIBERO v' + info.latest + ' sudah rilis</div>'
          + changelog
          + actionHtml
          + '</div>';

        wrap.appendChild(_toastEl);
        _toastEl.style.pointerEvents = 'all';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { _toastEl.classList.add('in'); });
        });

        // Tombol update
        var dlBtn = document.getElementById('_upd-dl-btn');
        if (dlBtn) {
          dlBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (_downloading) return;
            _startDownload();
          });
        }

        // Tombol skip
        var skipBtn = document.getElementById('_upd-skip-btn');
        if (skipBtn) {
          skipBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            _dismissToast();
          });
        }
      }

      function _startDownload() {
        if (!window.pywebview || !window.pywebview.api) return;
        if (_downloading) return;
        _downloading = true;
        _showUpdatePanel('downloading', 0, _latestVersion);

        var api = window.pywebview.api;
        var start = api.download_update
          ? api.download_update(_exeUrl, _latestVersion)
          : api.do_update(_exeUrl);
        start.then(function (raw) {
          var res = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (res && res.status === 'ready') {
            _downloading = false;
            _showUpdatePanel('ready', 100, _latestVersion);
          }
        }).catch(function () {
          _downloading = false;
          _showUpdatePanel('error', 0, _latestVersion);
        });
        return;

        var dlBtn = document.getElementById('_upd-dl-btn');
        var prog = document.getElementById('_upd-prog');
        var skipBtn = document.getElementById('_upd-skip-btn');
        var note = document.getElementById('_upd-note');
        if (dlBtn) { dlBtn.disabled = true; dlBtn.textContent = '⬇ Mengunduh... 0%'; }
        if (prog) { prog.style.display = 'block'; }
        if (skipBtn) { skipBtn.style.display = 'none'; }
        if (note) { note.style.display = 'block'; }

        window.pywebview.api.do_update(_exeUrl).catch(function (e) {
          _downloading = false;
          if (dlBtn) { dlBtn.disabled = false; dlBtn.textContent = '⬇ Coba Lagi'; }
          if (prog) { prog.style.display = 'none'; }
          if (skipBtn) { skipBtn.style.display = ''; }
          if (note) { note.style.display = 'none'; }
        });
      }

      // Dipanggil dari Python
      window.onUpdateProgress = function (pct) {
        _showUpdatePanel('downloading', Number(pct) || 0, _latestVersion);
        var dlBtn = document.getElementById('_upd-dl-btn');
        var bar = document.getElementById('_upd-prog-bar');
        if (bar) bar.style.width = pct + '%';
        if (dlBtn) dlBtn.textContent = pct >= 100 ? '⏳ Menerapkan pembaruan, aplikasi akan menutup...' : '⬇ Mengunduh... ' + pct + '%';
      };

      window.onUpdateStatus = function (status) {
        if (status === 'downloading') _showUpdatePanel('downloading', 0, _latestVersion);
        else if (status === 'idle' || status === 'ready' || status === 'error') _hideUpdatePanel();
      };

      window.onUpdateReady = function () {
        _showUpdateReadyToast(_latestVersion);
      };

      window.onUpdateError = function (err) {
        _downloading = false;
        _hideUpdatePanel();
        var dlBtn = document.getElementById('_upd-dl-btn');
        var prog = document.getElementById('_upd-prog');
        var skipBtn = document.getElementById('_upd-skip-btn');
        if (dlBtn) { dlBtn.disabled = false; dlBtn.textContent = '⬇ Coba Lagi'; }
        if (prog) { prog.style.display = 'none'; }
        if (skipBtn) { skipBtn.style.display = ''; }
        if (!window.__liberoUpdateDeferredNotice) {
          window.__liberoUpdateDeferredNotice = true;
          var msg = 'Unduhan pembaruan tertunda. LIBERO akan mencoba lagi otomatis.';
          if (typeof toastInfo === 'function') toastInfo(msg, 4500);
          else if (typeof toast === 'function') toast(msg, 4500);
          setTimeout(function () { window.__liberoUpdateDeferredNotice = false; }, 600000);
        }
      };

      /* ─── Robust update check: pywebview readiness wait + retry ───── */
      var _updateShown = false;
      var _JS_MAX_RETRIES = 3;
      var _JS_RETRY_DELAYS = [0, 8000, 20000]; // delay sebelum tiap percobaan JS

      function _waitForPywebview(callback, maxWait) {
        // Poll setiap 300ms sampai pywebview.api tersedia atau maxWait habis
        var elapsed = 0;
        var interval = 300;
        var timer = setInterval(function () {
          if (window.pywebview && window.pywebview.api) {
            clearInterval(timer);
            callback(true);
          } else {
            elapsed += interval;
            if (elapsed >= maxWait) {
              clearInterval(timer);
              console.warn('[checkUpdate] pywebview tidak ready setelah ' + maxWait + 'ms');
              callback(false);
            }
          }
        }, interval);
      }

      function _doCheckUpdate(attempt) {
        if (_updateShown || attempt >= _JS_MAX_RETRIES) return;

        _waitForPywebview(function (ready) {
          if (!ready) {
            // pywebview ga ready, coba lagi nanti
            if (attempt + 1 < _JS_MAX_RETRIES) {
              console.warn('[checkUpdate] retry JS #' + (attempt + 2) + ' dalam ' + (_JS_RETRY_DELAYS[attempt + 1] / 1000) + 's');
              setTimeout(function () { _doCheckUpdate(attempt + 1); }, _JS_RETRY_DELAYS[attempt + 1]);
            }
            return;
          }

          window.pywebview.api.check_update().then(function (raw) {
            try {
              var info = typeof raw === 'string' ? JSON.parse(raw) : raw;
              if (info.has_update) {
                _updateShown = true;
                _exeUrl = info.exe_url || '';
                showUpdateToast(info);
                return; // sukses, selesai
              }
              // Tidak ada update — tidak perlu retry
              if (!info.error) return;
              // Ada error dari Python (semua retry Python gagal)
              // Coba lagi dari JS dengan delay lebih panjang
              throw new Error(info.error);
            } catch (e) {
              console.warn('[checkUpdate] percobaan JS #' + (attempt + 1) + ' gagal:', e.message || e);
              if (attempt + 1 < _JS_MAX_RETRIES) {
                console.warn('[checkUpdate] retry JS #' + (attempt + 2) + ' dalam ' + (_JS_RETRY_DELAYS[attempt + 1] / 1000) + 's');
                setTimeout(function () { _doCheckUpdate(attempt + 1); }, _JS_RETRY_DELAYS[attempt + 1]);
              }
            }
          }).catch(function (e) {
            console.warn('[checkUpdate] promise rejected #' + (attempt + 1) + ':', e);
            if (attempt + 1 < _JS_MAX_RETRIES) {
              setTimeout(function () { _doCheckUpdate(attempt + 1); }, _JS_RETRY_DELAYS[attempt + 1]);
            }
          });
        }, 10000); // tunggu pywebview max 10 detik
      }

      function _markUpdateActive() {
        if (window.pywebview && window.pywebview.api && window.pywebview.api.mark_update_window_active) {
          window.pywebview.api.mark_update_window_active().catch(function () {});
        }
      }

      window.addEventListener('focus', _markUpdateActive);
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) _markUpdateActive();
      });

      window.addEventListener('splashdone', function () {
        setTimeout(function () {
          _markUpdateActive();
          _wireUpdatePanelButtons();
          _waitForPywebview(function (ready) {
            if (!ready) { _doCheckUpdate(0); return; }
            if (window.pywebview.api.get_update_download_state) {
              window.pywebview.api.get_update_download_state().then(function (raw) {
                var state = typeof raw === 'string' ? JSON.parse(raw) : raw;
                if (state && state.latest) _latestVersion = state.latest;
                if (state && state.install_on_next_launch) {
                  _readyToastDismissed = true;
                  _readyInstallScheduled = true;
                  _hideUpdatePanel();
                  return;
                }
                if (state && state.status === 'ready') {
                  _showUpdateReadyToast(_latestVersion);
                  return;
                }
                if (state && state.status === 'downloading') {
                  _downloading = true;
                  _showUpdatePanel('downloading', Number(state.progress) || 0, _latestVersion);
                  return;
                }
                _doCheckUpdate(0);
              }).catch(function () { _doCheckUpdate(0); });
            } else {
              _doCheckUpdate(0);
            }
          }, 10000);
        }, 1500);
      });
    })();

/* launcher_view.html script 10 */
(function () {

      var _snd = {
        open: new Audio('assets/audio/ui-open.mp3'),
        fire: new Audio('assets/audio/ui-fire.mp3'),
        close: new Audio('assets/audio/ui-close.mp3'),
      };
      Object.keys(_snd).forEach(function (k) {
        try {
          _snd[k].preload = 'auto';
          _snd[k].load();
        } catch (e) { }
      });

      // Web Audio API — semua suara pakai trim & gain
      var _actx = null, _bufs = {}, _loading = {};
      (function () {
        try {
          _actx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { }
      })();

      function _decodeAudio(key) {
        if (!_actx || _bufs[key] || _loading[key]) return;
        _loading[key] = true;
        try {
          fetch(_snd[key].src)
            .then(function (r) { return r.arrayBuffer(); })
            .then(function (ab) {
              return new Promise(function (resolve, reject) {
                try {
                  var ret = _actx.decodeAudioData(ab, resolve, reject);
                  if (ret && typeof ret.then === 'function') ret.then(resolve, reject);
                } catch (e) { reject(e); }
              });
            })
            .then(function (buf) { _bufs[key] = buf; })
            .catch(function () { })
            .finally(function () { _loading[key] = false; });
        } catch (e) {
          _loading[key] = false;
        }
      }

      ['open', 'fire', 'close'].forEach(_decodeAudio);

      function _unlockAudio() {
        try {
          if (!_actx) return;
          if (_actx.state === 'suspended') _actx.resume();
          ['open', 'fire', 'close'].forEach(_decodeAudio);
        } catch (e) { }
      }
      ['pointerdown', 'mousedown', 'keydown', 'touchstart'].forEach(function (evt) {
        document.addEventListener(evt, _unlockAudio, { capture: true, passive: true, once: true });
      });

      var _trim = {
        open: { start: 0.2, end: 0 },
        fire: { start: 0, end: 0.2 },
        close: { start: 0.1, end: 0 },
      };
      var _gain = { open: 1.0, fire: 1.75, close: 1.0 };

      var _activeSrc = {};
      var _lastPlayAt = {};
      function _play(key) {
        try {
          _unlockAudio();
          if (!_actx || !_bufs[key]) {
            _decodeAudio(key);
            var s = _snd[key].cloneNode(true);
            s.preload = 'auto';
            s.currentTime = 0;
            s.play().catch(function () { });
            return;
          }
          if (Date.now() - (_lastPlayAt[key] || 0) < 35) return;
          _lastPlayAt[key] = Date.now();
          if (_activeSrc[key]) { try { _activeSrc[key].stop(); } catch(e){} }
          var buf = _bufs[key], t = _trim[key];
          var offset = t.start, duration = buf.duration - t.start - t.end;
          if (duration <= 0) return;
          var src = _actx.createBufferSource(); src.buffer = buf;
          var g = _actx.createGain(); g.gain.value = _gain[key];
          src.connect(g); g.connect(_actx.destination);
          _activeSrc[key] = src;
          src.start(0, offset, duration);
        } catch (e) { }
      }
      window._SFX = {
        open: function () { _play('open'); },
        fire: function () { _play('fire'); },
        close: function () { _play('close'); },
      };
      window._SFX_SUPPRESS = false;

      // Suara khusus sudah di-handle di masing-masing fungsi (openMenu, closeMenu, exitApp, setTheme)


      // close: batal di dialog
      document.addEventListener('mousedown', function (e) {
        if (e.target.closest('#ld-cancel'))
          window._SFX && window._SFX.close();
      }, true);

      setTimeout(function () {
        var _om = window.openModule;
        if (_om && !_om._sfx) {
          window.openModule = function (name, e) {
            window._SFX && window._SFX.open();
            return _om.call(window, name, e);
          };
          window.openModule._sfx = true;
        }
        var _bp = window.bukaPendaftaran;
        if (_bp && !_bp._sfx) {
          window.bukaPendaftaran = function () {
            window._SFX && window._SFX.open();
            return _bp.apply(this, arguments);
          };
          window.bukaPendaftaran._sfx = true;
        }
        // open → klik tombol Stopper
        var _oas = window.openAiSettings;
        if (_oas && !_oas._sfx) {
          window.openAiSettings = function () {
            window._SFX && window._SFX.open();
            return _oas.apply(this, arguments);
          };
          window.openAiSettings._sfx = true;
        }
        var _orn = window.openReleaseNotes;
        if (_orn && !_orn._sfx) {
          window.openReleaseNotes = function () {
            window._SFX && window._SFX.open();
            return _orn.apply(this, arguments);
          };
          window.openReleaseNotes._sfx = true;
        }
        var _crn = window.closeReleaseNotes;
        if (_crn && !_crn._sfx) {
          window.closeReleaseNotes = function () {
            window._SFX && window._SFX.close();
            return _crn.apply(this, arguments);
          };
          window.closeReleaseNotes._sfx = true;
        }
      }, 600);
    })();

/* launcher_view.html script 11 */
/* ── Pengaturan AI (AI API Key) ──────────────────────── */
    (function () {
      var _overlay = null;


      window.openAiSettings = function () {
        if (_overlay) return;

        _overlay = document.createElement('div');
        _overlay.className = 'ai-modal-overlay';
        _overlay.innerHTML = `
          <div class="ai-modal">
            <h3>
              <span class="ai-title-badge">AI</span>
              Pengaturan STOPPER
            </h3>
            <div class="ai-desc">
              Hubungkan API Key untuk mengaktifkan pembaca dokumen otomatis. STOPPER dapat memakai Gemini, Claude, atau OpenAI.
              <div class="ai-link-row">
                <a href="https://aistudio.google.com/app/apikey" target="_blank" title="Dapatkan API Key Google Gemini">→ Gemini API (Gratis)</a>
                <a href="https://console.anthropic.com/settings/keys" target="_blank" title="Dapatkan API Key Anthropic Claude">→ Claude API</a>
                <a href="https://platform.openai.com/api-keys" target="_blank" title="Dapatkan API Key OpenAI">→ OpenAI (ChatGPT) API</a>
              </div>
            </div>
            <div id="ai-status-box" class="ai-status idle">Memeriksa status...</div>
            <div class="ai-field">
              <input class="ai-input" id="ai-key-input" type="password" placeholder="Paste API Key di sini..." autocomplete="off" spellcheck="false">
              <button class="ai-btn" id="ai-toggle-vis" title="Tampilkan/sembunyikan">Lihat</button>
            </div>
            <div id="ai-info-box" class="ai-info-box" style="display:none;">
              <strong>Cara Kerja STOPPER</strong><br>
              STOPPER membantu dua pekerjaan: membaca dokumen pendaftaran dan mengubah audio kronologi menjadi teks. Data tetap bisa diperiksa dan diedit manual sebelum dipakai.
              <div class="ai-feature-grid">
                <div class="ai-feature"><b>Analisis Dokumen</b><span>PDF atau gambar seperti KTP, KK, surat jaminan, dan litmas lama dianalisis dengan vision AI.</span></div>
                <div class="ai-feature"><b>Ekstraksi Informasi</b><span>Nama, identitas, alamat, penjamin, dan informasi lain diringkas otomatis.</span></div>
                <div class="ai-feature"><b>Pemetaan Data</b><span>Hasil bacaan dipetakan ke kolom LIBERO yang sesuai, lalu bisa dikoreksi manual.</span></div>
                <div class="ai-feature"><b>Transkripsi Audio</b><span>Rekaman atau file audio kronologi diproses menjadi teks kronologi kejadian.</span></div>
                <div class="ai-feature"><b>Pencarian Perkara</b><span>Menemukan dan mengekstrak data putusan secara otomatis berdasarkan nomor perkara atau kata kunci.</span></div>
              </div>
              <br>
              <strong>Pilihan AI yang Didukung</strong><br>
              Bisa memakai <strong>Google Gemini</strong>, <strong>Anthropic Claude</strong>, atau <strong>OpenAI ChatGPT</strong>. Jika salah satu AI mencapai batas kuota, STOPPER akan otomatis beralih ke AI lain yang tersedia agar pekerjaan tetap jalan.
            </div>
            <div id="ai-guide-box" class="ai-guide-box" style="display:none;">
              <div class="ai-guide-grid">
                <div class="ai-guide-card">
                  <strong>Google Gemini <span class="ai-gemini"><img src="assets/images/ai/gemini.svg" alt=""></span></strong>
                  <ol>
                    <li>Buka Google AI Studio.</li>
                    <li>Login dengan akun Google.</li>
                    <li>Klik Create API key.</li>
                    <li>Copy key, lalu paste ke STOPPER.</li>
                    <li>Untuk pay-as-you-go, aktifkan atau tautkan Billing Account di Google Cloud Console.</li>
                  </ol>
                  <div class="ai-guide-note"><b>Biaya:</b> bisa dicoba gratis dengan batas pemakaian harian. Untuk model/limit yang lebih baik, aktifkan Billing Account di Google Cloud dengan sistem pay-as-you-go. Jika akun mendapat Google Cloud/GenAI credits dari Google AI Pro atau Google Developer Program premium, credit itu dapat membantu biaya Gemini API setelah diterapkan ke billing account. Jumlah dan ketersediaan benefit bisa berbeda tiap akun/negara.</div>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">Buka Gemini API Key</a>
                  <br><a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener">Aktifkan Google Cloud Billing</a>
                </div>
                <div class="ai-guide-card">
                  <strong>Anthropic Claude <span class="ai-claude"><img src="assets/images/ai/claude.svg" alt=""></span></strong>
                  <ol>
                    <li>Buka Anthropic Console.</li>
                    <li>Login atau daftar akun.</li>
                    <li>Masuk menu API Keys.</li>
                    <li>Create key, copy, lalu paste ke STOPPER.</li>
                  </ol>
                  <div class="ai-guide-note"><b>Minimal beli:</b> saldo Claude API mulai dari $5 lewat Anthropic Console. Langganan Claude Pro/Max berbeda dan tidak otomatis memberi saldo API untuk STOPPER.</div>
                  <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">Buka Claude API Key</a>
                </div>
                <div class="ai-guide-card">
                  <strong>OpenAI ChatGPT <span class="ai-openai"><img src="assets/images/ai/openai.svg" alt=""></span></strong>
                  <ol>
                    <li>Buka OpenAI Platform.</li>
                    <li>Login dengan akun OpenAI.</li>
                    <li>Klik Create new secret key.</li>
                    <li>Copy key, lalu paste ke STOPPER.</li>
                  </ol>
                  <div class="ai-guide-note"><b>Minimal beli:</b> saldo OpenAI API biasanya mulai dari $5. Langganan ChatGPT Plus/Pro berbeda dan tidak otomatis memberi saldo API untuk STOPPER.</div>
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">Buka OpenAI API Key</a>
                </div>
              </div>
            </div>
            <div class="ai-actions">
              <div style="display:flex; gap:8px; margin-right:auto;">
                <button class="ai-btn" id="ai-info-btn" title="Pelajari cara kerja STOPPER">Info</button>
                <button class="ai-btn" id="ai-guide-btn" title="Panduan membuat API Key">Panduan API Key</button>
                <button class="ai-btn danger" id="ai-remove-btn" style="display:none;">Hapus Key</button>
              </div>
              <button class="ai-btn" id="ai-test-btn">Test Koneksi</button>
              <button class="ai-btn primary" id="ai-save-btn">Simpan</button>
              <button class="ai-btn" id="ai-close-btn">Tutup</button>
            </div>
          </div>
        `;

        document.body.appendChild(_overlay);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { _overlay.classList.add('show'); });
        });

        var input = _overlay.querySelector('#ai-key-input');
        var statusBox = _overlay.querySelector('#ai-status-box');
        var removeBtn = _overlay.querySelector('#ai-remove-btn');
        var toggleVis = _overlay.querySelector('#ai-toggle-vis');
        var providerLinks = _overlay.querySelectorAll('.ai-link-row a');
        var geminiLogo = '<span class="ai-gemini" aria-label="Gemini"><img src="assets/images/ai/gemini.svg" alt=""></span>';
        var claudeLogo = '<span class="ai-claude" aria-label="Claude"><img src="assets/images/ai/claude.svg" alt=""></span>';
        var openaiLogo = '<span class="ai-openai" aria-label="OpenAI"><img src="assets/images/ai/openai.svg" alt=""></span>';
        if (providerLinks[0]) providerLinks[0].innerHTML = 'Google Gemini ' + geminiLogo;
        if (providerLinks[1]) providerLinks[1].innerHTML = 'Anthropic Claude ' + claudeLogo;
        if (providerLinks[2]) providerLinks[2].innerHTML = 'OpenAI ChatGPT ' + openaiLogo;

        // Toggle password visibility
        toggleVis.onclick = function () {
          input.type = input.type === 'password' ? 'text' : 'password';
          toggleVis.textContent = input.type === 'password' ? 'Lihat' : 'Sembunyi';
        };

        // Toggle info
        var infoBox = _overlay.querySelector('#ai-info-box');
        _overlay.querySelector('#ai-info-btn').onclick = function () {
          window._SFX && window._SFX.fire();
          infoBox.style.display = infoBox.style.display === 'none' ? 'block' : 'none';
        };

        // Toggle API key guide
        var guideBox = _overlay.querySelector('#ai-guide-box');
        _overlay.querySelector('#ai-guide-btn').onclick = function () {
          window._SFX && window._SFX.fire();
          guideBox.style.display = guideBox.style.display === 'none' ? 'block' : 'none';
        };

        // Helper to render status
        function _updateStatusBox(res) {
          if (res && res.has_key) {
            statusBox.className = 'ai-status ok';
            var logo = '';
            if (res.provider === 'gemini') logo = geminiLogo;
            else if (res.provider === 'claude') logo = claudeLogo;
            else if (res.provider === 'openai') logo = openaiLogo;
            
            if (logo) {
              statusBox.innerHTML = '<span>API Key tersimpan: ' + res.masked + '</span>' + logo;
            } else {
              statusBox.textContent = 'API Key tersimpan: ' + res.masked;
            }
            removeBtn.style.display = '';
          } else {
            statusBox.className = 'ai-status idle';
            statusBox.textContent = 'API Key belum diatur';
            removeBtn.style.display = 'none';
          }
        }

        // Load existing key status
        if (window.pywebview && window.pywebview.api) {
          window.pywebview.api.get_ai_key().then(_updateStatusBox).catch(function () {
            statusBox.className = 'ai-status idle';
            statusBox.textContent = 'API Key belum diatur';
          });
        } else {
          statusBox.className = 'ai-status err';
          statusBox.textContent = 'Sistem belum siap';
        }

        // Test
        _overlay.querySelector('#ai-test-btn').onclick = function () {
          window._SFX && window._SFX.fire();
          var k = input.value.trim();
          if (!k) { toastWarning('Masukkan API Key terlebih dahulu'); return; }
          statusBox.className = 'ai-status idle';
          statusBox.textContent = 'Menguji koneksi...';
          window.pywebview.api.test_ai_key(k).then(function (res) {
            if (res && res.ok) {
              statusBox.className = 'ai-status ok';
              statusBox.textContent = res.msg || 'Koneksi berhasil!';
            } else {
              statusBox.className = 'ai-status err';
              statusBox.textContent = res.err || 'Gagal';
            }
          }).catch(function (e) {
            statusBox.className = 'ai-status err';
            statusBox.textContent = 'Error: ' + e;
          });
        };

        // Save
        _overlay.querySelector('#ai-save-btn').onclick = function () {
          window._SFX && window._SFX.fire();
          var k = input.value.trim();
          if (!k) { toastWarning('Masukkan API Key terlebih dahulu'); return; }
          window.pywebview.api.save_ai_key(k).then(function (res) {
            if (res && res.ok) {
              toastSuccess('API Key berhasil disimpan!');
              input.value = '';
              window.pywebview.api.get_ai_key().then(_updateStatusBox);
            } else {
              toastError(res.err || 'Gagal menyimpan');
            }
          });
        };

        // Remove
        removeBtn.onclick = function () {
          window._SFX && window._SFX.fire();
          window.pywebview.api.remove_ai_key().then(function (res) {
            if (res && res.ok) {
              toastInfo('API Key dihapus');
              statusBox.className = 'ai-status idle';
              statusBox.textContent = 'API Key belum diatur';
              removeBtn.style.display = 'none';
              input.value = '';
            }
          });
        };

        // Close
        function closeModal() {
          if (!_overlay) return;
          window._SFX && window._SFX.close();
          _overlay.classList.remove('show');
          setTimeout(function () {
            if (_overlay && _overlay.parentNode) _overlay.parentNode.removeChild(_overlay);
            _overlay = null;
          }, 280);
        }
        _overlay.querySelector('#ai-close-btn').onclick = closeModal;
        _overlay.addEventListener('click', function (e) {
          if (e.target === _overlay) closeModal();
        });
        document.addEventListener('keydown', function _esc(e) {
          if (e.key === 'Escape') { document.removeEventListener('keydown', _esc); closeModal(); }
        });

        setTimeout(function () { input.focus(); }, 200);
      };
    })();



