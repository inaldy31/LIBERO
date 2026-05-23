// LIBERO: Sinkronisasi posisi topbar untuk navigasi formulir.
    (function () {
      var topbar = document.querySelector('.topbar');
      var container = document.querySelector('.topbar-bottom');
      var wrap = document.querySelector('.aksi-wrap');
      if (!topbar || !wrap || !container) return;

      var padding = 28;
      var following = false;

      function isMenuOpen() {
        var d = document.querySelector('.aksi-dropdown');
        return d && d.classList.contains('open');
      }

      topbar.addEventListener('mouseenter', function () {
        following = true;
        wrap.style.transition = 'left .1s cubic-bezier(.25,.46,.45,.94)';
      });
      topbar.addEventListener('mouseleave', function () {
        following = false;
        if (!isMenuOpen()) {
          wrap.style.transition = 'left .35s cubic-bezier(.25,.46,.45,.94)';
          wrap.style.left = '50%';
        }
      });
      topbar.addEventListener('mousemove', function (e) {
        if (!following) return;
        if (isMenuOpen()) return;
        var rect = container.getBoundingClientRect();
        var halfW = wrap.offsetWidth / 2;
        var raw = e.clientX - rect.left;
        var clamped = Math.max(padding + halfW, Math.min(rect.width - padding - halfW, raw));
        wrap.style.left = clamped + 'px';
        wrap.style.transform = 'translateX(-50%) translateY(50%)';
      });
      document.addEventListener('aksiMenuClosed', function () {
        wrap.style.transition = 'left .35s cubic-bezier(.25,.46,.45,.94)';
        wrap.style.left = '50%';
      });
    })();
  
