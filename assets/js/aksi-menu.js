// LIBERO: Interaksi menu aksi mengambang pada halaman formulir.
    (function () {
      document.querySelectorAll('.aksi-wrap').forEach(function (wrap) {
        var btn = wrap.querySelector('.aksi-trigger');
        var drop = wrap.querySelector('.aksi-dropdown');
        var backdrop = wrap.querySelector('.aksi-backdrop');
        if (!btn || !drop || !backdrop) return;

        document.body.appendChild(backdrop);
        document.body.appendChild(drop);

        function openMenu() {
          if (window._SFX) window._SFX.open();
          var tb = document.querySelector('.topbar');
          var br = btn.getBoundingClientRect();
          var tbr = tb ? tb.getBoundingClientRect() : { bottom: 80 };
          backdrop.classList.add('open');
          drop.classList.add('open');
          btn.classList.add('open');
          requestAnimationFrame(function () {
            var dw = drop.offsetWidth || 240;
            var left = br.left + br.width / 2 - dw / 2;
            if (left + dw > window.innerWidth - 12) left = window.innerWidth - dw - 12;
            if (left < 12) left = 12;
            drop.style.left = left + 'px';
            drop.style.top = (tbr.bottom + 6) + 'px';
            backdrop.classList.add('visible');
            drop.classList.add('visible');
          });
        }

        function closeMenu() {
          backdrop.classList.remove('visible');
          drop.classList.remove('visible');
          btn.classList.remove('open');
          setTimeout(function () {
            backdrop.classList.remove('open');
            drop.classList.remove('open');
            document.dispatchEvent(new Event('aksiMenuClosed'));
          }, 220);
        }

        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          drop.classList.contains('open') ? closeMenu() : openMenu();
        });
        backdrop.addEventListener('click', closeMenu);
        document.addEventListener('click', function (e) {
          if (drop.classList.contains('open') && !wrap.contains(e.target) && !drop.contains(e.target)) closeMenu();
        });
        drop.querySelectorAll('.tb-btn').forEach(function (b) {
          b.addEventListener('click', function () { setTimeout(closeMenu, 80); });
        });
      });
    })();
  
