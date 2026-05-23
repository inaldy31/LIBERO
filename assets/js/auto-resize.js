// LIBERO: Perilaku auto-resize bersama untuk input dan textarea.
/* ── Auto-expand .finp input → textarea, .fta textarea, dan textarea.tpp-field-inp ── */
    (function () {
      function autoResize(ta) {
        if (!ta) return;
        ta.style.height = 'auto';
        var next = ta.scrollHeight + 'px';
        ta.style.height = next;
        ta.dataset.autoHeight = next;
      }
      function scheduleAutoResize(ta) {
        if (!ta || ta.dataset.resizePending === '1') return;
        ta.dataset.resizePending = '1';
        requestAnimationFrame(function () {
          ta.dataset.resizePending = '0';
          autoResize(ta);
        });
      }
      function upgradeInput(inp) {
        if (inp.tagName !== 'INPUT' || !inp.classList.contains('finp')) return;
        if (inp.classList.contains('dp-input')) return;
        if (inp.id === 'f-usia-anggota') return;
        if (inp.dataset.upgraded) return;
        inp.dataset.upgraded = '1';
        var ta = document.createElement('textarea');
        Array.from(inp.attributes).forEach(function (a) {
          if (a.name !== 'type') ta.setAttribute(a.name, a.value);
        });
        ta.value = inp.value || '';
        ta.rows = 1;
        ta.style.cssText += 'resize:none;overflow:hidden;line-height:1.45;box-sizing:border-box;min-height:42px;white-space:pre-wrap;word-break:break-word;';
        ta.addEventListener('input', function () { scheduleAutoResize(ta); });
        inp.parentNode.replaceChild(ta, inp);
        return ta;
      }
      function setupFta(ta) {
        if (ta.dataset.ftaSetup) return;
        ta.dataset.ftaSetup = '1';
        ta.style.resize = 'none';
        ta.style.overflow = 'hidden';
        ta.style.boxSizing = 'border-box';
        ta.addEventListener('input', function () { scheduleAutoResize(ta); });
        autoResize(ta);
      }
      function resizeVisible() {
        document.querySelectorAll('textarea.finp, textarea.fta, textarea.tpp-field-inp').forEach(function (ta) {
          if (ta.offsetParent !== null) autoResize(ta);
        });
      }
      function upgradeAndResize() {
        document.querySelectorAll('input.finp').forEach(upgradeInput);
        document.querySelectorAll('textarea.fta').forEach(setupFta);
        document.querySelectorAll('textarea.tpp-field-inp').forEach(setupFta);
        requestAnimationFrame(resizeVisible);
      }
      window._resizeFinp = upgradeAndResize;

      function wrapFn(name, after) {
        var _orig = window[name];
        if (!_orig || _orig._finpHooked) return;
        window[name] = function () {
          var r = _orig.apply(this, arguments);
          after();
          return r;
        };
        window[name]._finpHooked = true;
      }

      function hookAll() {
        wrapFn('initApp', upgradeAndResize);
        wrapFn('onDataLoaded', upgradeAndResize);
        wrapFn('renderTPPEntries', upgradeAndResize);
        wrapFn('switchTab', resizeVisible);
        wrapFn('toggleAcc', resizeVisible);
      }

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hookAll);
      else hookAll();

      window.addEventListener('resize', resizeVisible);

      new MutationObserver(function (ms) {
        ms.forEach(function (m) {
          m.addedNodes.forEach(function (n) {
            if (n.nodeType !== 1) return;
            if (n.matches && n.matches('input.finp')) upgradeInput(n);
            if (n.matches && n.matches('textarea.fta')) setupFta(n);
            if (n.matches && n.matches('textarea.tpp-field-inp')) setupFta(n);
            n.querySelectorAll && n.querySelectorAll('input.finp').forEach(upgradeInput);
            n.querySelectorAll && n.querySelectorAll('textarea.fta').forEach(setupFta);
            n.querySelectorAll && n.querySelectorAll('textarea.tpp-field-inp').forEach(setupFta);
          });
        });
      }).observe(document.body, { childList: true, subtree: true });
    })();

