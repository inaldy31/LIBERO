// LIBERO: Perilaku collapse dan expand navigasi samping.
    (function () {
      var btn = document.getElementById('snav-toggle-btn');
      var body = document.querySelector('.body');
      if (!btn || !body) return;
      btn.addEventListener('click', function () {
        body.classList.toggle('snav-hidden');
      });
    })();
  
