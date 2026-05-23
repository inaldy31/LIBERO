// LIBERO: Perilaku toggle fullscreen bersama untuk halaman webview.
(function () {
  function updateIcon(isFullscreen) {
    var expand = document.getElementById('fs-icon-expand');
    var compress = document.getElementById('fs-icon-compress');
    if (!expand || !compress) return;
    expand.style.display = isFullscreen ? 'none' : '';
    compress.style.display = isFullscreen ? '' : 'none';
  }

  var isFullscreen = true;
  var busy = false;

  window.toggleFullscreen = function () {
    if (busy) return;
    if (window.pywebview && window.pywebview.api && window.pywebview.api.toggle_fullscreen) {
      var next = !isFullscreen;
      busy = true;
      window.pywebview.api.toggle_fullscreen().then(function (res) {
        if (res && res.ok) {
          isFullscreen = next;
          updateIcon(isFullscreen);
        }
      }).catch(function () {})
        .finally(function () {
          busy = false;
        });
    }
  };

  document.addEventListener('keydown', function (event) {
    if (event.key === 'F11' && !isFullscreen) {
      event.preventDefault();
      window.toggleFullscreen();
    }
    if (event.key === 'Escape' && isFullscreen) {
      event.preventDefault();
      window.toggleFullscreen();
    }
  }, true);
})();
