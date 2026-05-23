// LIBERO: Sinkronisasi judul panel dinamis Litmas Anak untuk label sidenav.
/* Sync only dynamic panel-titles (Analisis, Kesimpulan, Penutup) to sidenav */
    (function () {
      var DYNAMIC_IDS = ['title-analisis', 'title-kesimpulan', 'title-penutup'];
      function _syncSnavLabels() {
        DYNAMIC_IDS.forEach(function (tid) {
          var pt = document.getElementById(tid);
          if (!pt) return;
          var txt = (pt.textContent || '').trim().replace(/^[IVXLCDM]+\.\s/, '');
          // find snav-text whose tab matches this panel
          var tp = pt.closest('.tab-panel');
          if (!tp) return;
          var tpId = tp.id; // e.g. "tp-11"
          var num = tpId.replace('tp-', '');
          var navItem = document.querySelector('.snav-item[onclick*="switchTab(' + num + ')"]');
          if (!navItem) return;
          var st = navItem.querySelector('.snav-text');
          if (st) st.textContent = txt;
        });
      }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _syncSnavLabels);
      } else {
        _syncSnavLabels();
      }
      window._syncSnavLabels = _syncSnavLabels;
    })();
  
