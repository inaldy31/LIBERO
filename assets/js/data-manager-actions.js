// LIBERO: Penghubung aksi Data Manager untuk simpan, muat, hapus, dan impor.
(function () {
  'use strict';

  async function prepareLazyTabs() {
    try {
      if (typeof window.__LIBERO_LAZY_PREPARE_ALL === 'function') {
        await window.__LIBERO_LAZY_PREPARE_ALL(1500);
      }
    } catch (_e) { }
  }

  window.cmd_simpan = async function () {
    await prepareLazyTabs();
    var data = collectAllTabs();
    await window._py('open_dm_save', data);
  };

  window.cmd_selesaikan = async function () {
    var missing = [];
    try {
      await prepareLazyTabs();
      missing = (typeof validateAllTabs === 'function') ? (validateAllTabs() || []) : [];
    } catch (e) {
      console.warn('[cmd_selesaikan] validateAllTabs error:', e);
      missing = [];
    }

    if (missing.length) {
      var shown = missing.slice(0, 12);
      var bullets = shown.map(function (x) { return '&bull; ' + x; }).join('<br>');
      var extra = missing.length > 12
        ? '<br>&bull; ... dan ' + (missing.length - 12) + ' lagi'
        : '';

      var lanjut = await LDialog.confirm({
        title: 'Konfirmasi Lanjutkan',
        message:
          'Peringatan: Terdapat jawaban yang masih kosong atau belum diisi.<br><br>' +
          bullets +
          extra +
          '<br><br>Apakah Anda yakin ingin tetap melanjutkan?',
        icon: 'warning',
        type: 'warning',
        okText: 'Ya, Lanjutkan',
        cancelText: 'Batal',
      });

      if (!lanjut) return;
    }

    await prepareLazyTabs();
    var data = (typeof collectAllTabs === 'function') ? (collectAllTabs() || {}) : {};
    await window._py('open_dm_output', data);
  };

  window.cmd_lanjutkan = async function () {
    await window._py('open_dm_load');
  };
})();
