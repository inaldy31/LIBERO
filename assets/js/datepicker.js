// LIBERO: Runtime datepicker bersama untuk field tanggal.
// LIBERO: Datepicker bersama untuk field .dp-input.
(function () {
      if (window.__LIBERO_DATEPICKER_READY || document.querySelector('.dp-popup')) {
        window.__LIBERO_DATEPICKER_READY = true;
        return;
      }
      window.__LIBERO_DATEPICKER_READY = true;

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
