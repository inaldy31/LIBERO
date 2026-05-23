// LIBERO: Konstanta schema formulir frontend yang selaras dengan schema.py.
(function installFormSchema() {
  var CANONICAL_FIELD_DOMAINS = {
    identitas: ['nama_klien', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'agama', 'alamat'],
    keluarga: ['nama_ayah', 'nama_ibu', 'susunan_keluarga'],
    penjamin_wali: ['nama_penjamin', 'hubungan_penjamin', 'alamat_penjamin', 'nama_wali', 'hubungan_wali'],
    riwayat_pernikahan: ['status_pernikahan', 'jumlah_pernikahan', 'riwayat_pernikahan', 'riwayat_pernikahan_penjamin', 'wali_riwayat_pernikahan'],
    riwayat_pidana: ['perkara', 'pasal', 'perkara_list', 'daftar_korban', 'riwayat_pelanggaran'],
    tanggapan: ['daftar_tanggapan', 'memaafkan', 'dukungan', 'tuntut_ganti_rugi'],
    asesmen: ['asesmen_rri', 'asesmen_kriminogenik', 'rekomendasi_litmas'],
    rekomendasi: ['rekomendasi', 'kesimpulan', 'saran']
  };

  var FIELD_ALIASES = {
    nama_klien: ['Nama Klien', 'Nama_Klien', 'nama', 'f-nama-klien', 'f_nama_klien'],
    jenis_kelamin: ['Jenis Kelamin', 'Jenis_Kelamin', 'jk', 'L/P', 'lp', 'f-jk', 'f_jk'],
    tempat_lahir: ['Tempat Lahir', 'Tempat_Lahir', 'f-tempat-lahir', 'f_tempat_lahir'],
    tanggal_lahir: ['Tanggal Lahir', 'Tanggal_Lahir', 'tgl_lahir', 'f-tgl-lahir', 'f_tgl_lahir'],
    agama: ['Agama', 'f-agama', 'f_agama'],
    alamat: ['Alamat', 'alamat_klien', 'f-alamat', 'f_alamat'],
    nama_ayah: ['Nama Ayah', 'Nama_Ayah', 'f-nama-ayah', 'f_nama_ayah'],
    nama_ibu: ['Nama Ibu', 'Nama_Ibu', 'f-nama-ibu', 'f_nama_ibu'],
    susunan_keluarga: ['Susunan Keluarga', 'Susunan_Keluarga', 'keluarga', 'anggota_keluarga'],
    nama_penjamin: ['Nama Penjamin', 'Nama_Penjamin', 'penjamin_nama', 'f4-nama-penjamin'],
    hubungan_penjamin: ['Hubungan Penjamin', 'Hubungan_Penjamin', 'f4-hubungan-penjamin'],
    alamat_penjamin: ['Alamat Penjamin', 'Alamat_Penjamin', 'f4-alamat-penjamin'],
    nama_wali: ['Nama Wali', 'Nama_Wali', 'wali_nama', 'f5-wali-nama'],
    hubungan_wali: ['Hubungan Wali', 'Hubungan_Wali', 'wali_hubungan', 'f5-wali-hubungan'],
    status_pernikahan: ['Status Pernikahan', 'Status_Pernikahan', 'status_nikah', 'f-status-nikah'],
    jumlah_pernikahan: ['Jumlah Pernikahan', 'Jumlah_Pernikahan', 'f-jumlah-pernikahan'],
    riwayat_pernikahan: ['Riwayat Pernikahan', 'Riwayat_Pernikahan', 'marriage_entries'],
    riwayat_pernikahan_penjamin: ['Riwayat Pernikahan Penjamin', 'Riwayat_Pernikahan_Penjamin'],
    wali_riwayat_pernikahan: ['Riwayat Pernikahan Wali', 'Wali_Riwayat_Pernikahan'],
    perkara: ['Perkara', 'f-perkara'],
    pasal: ['Pasal', 'f-pasal'],
    perkara_list: ['Perkara_List', 'daftar_perkara'],
    daftar_korban: ['Daftar Korban', 'Daftar_Korban', 'korban_list'],
    riwayat_pelanggaran: ['Riwayat Pelanggaran', 'Riwayat_Pelanggaran'],
    daftar_tanggapan: ['Daftar Tanggapan', 'Daftar_Tanggapan', 'tanggapan_korban'],
    memaafkan: ['Memaafkan', 'korban_memaafkan'],
    dukungan: ['Dukungan', 'mendukung_program', 'mendukung_rekomendasi'],
    tuntut_ganti_rugi: ['Tuntut Ganti Rugi', 'tuntut_ganti_rugi_korban'],
    asesmen_rri: ['Asesmen RRI', 'asesmen_rri', 'RRI'],
    asesmen_kriminogenik: ['Asesmen Kriminogenik', 'asesmen_kriminogenik', 'Kriminogenik'],
    rekomendasi_litmas: ['Rekomendasi Litmas', 'Rekomendasi_Litmas'],
    rekomendasi: ['Rekomendasi', 'f-rekomendasi'],
    kesimpulan: ['Kesimpulan', 'f-kesimpulan'],
    saran: ['Saran', 'f-saran']
  };

  function normalizedAliasKey(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  var CANONICAL_FIELD_KEYS = Object.keys(CANONICAL_FIELD_DOMAINS).reduce(function (out, domain) {
    return out.concat(CANONICAL_FIELD_DOMAINS[domain]);
  }, []);

  var FIELD_ALIAS_LOOKUP = {};
  CANONICAL_FIELD_KEYS.forEach(function (key) {
    FIELD_ALIAS_LOOKUP[key] = key;
    FIELD_ALIAS_LOOKUP[normalizedAliasKey(key)] = key;
  });
  Object.keys(FIELD_ALIASES).forEach(function (key) {
    FIELD_ALIAS_LOOKUP[key] = key;
    FIELD_ALIAS_LOOKUP[normalizedAliasKey(key)] = key;
    FIELD_ALIASES[key].forEach(function (alias) {
      FIELD_ALIAS_LOOKUP[alias] = key;
      FIELD_ALIAS_LOOKUP[normalizedAliasKey(alias)] = key;
    });
  });

  function canonicalKey(key) {
    if (Object.prototype.hasOwnProperty.call(FIELD_ALIAS_LOOKUP, key)) {
      return FIELD_ALIAS_LOOKUP[key];
    }
    return FIELD_ALIAS_LOOKUP[normalizedAliasKey(key)] || key;
  }

  function canonicalize(data, keepUnknown) {
    var out = {};
    if (!data || typeof data !== 'object') return out;
    if (keepUnknown == null) keepUnknown = true;
    Object.keys(data).forEach(function (key) {
      var canonical = canonicalKey(key);
      if (canonical === key && CANONICAL_FIELD_KEYS.indexOf(canonical) === -1 && !keepUnknown) return;
      if (canonical === key) {
        out[canonical] = data[key];
        return;
      }
      if (Object.prototype.hasOwnProperty.call(out, canonical) && out[canonical] != null && out[canonical] !== '') return;
      out[canonical] = data[key];
    });
    return out;
  }

  function element(id) {
    return document.getElementById(id);
  }

  function value(id) {
    var el = element(id);
    if (!el) return '';
    return String(el.tagName === 'TEXTAREA' ? el.value : (el.value || '')).trim();
  }

  function setValue(id, val) {
    var el = element(id);
    if (!el || val == null) return;
    el.value = String(val);
  }

  function collect(pairs) {
    var out = {};
    pairs.forEach(function (pair) {
      out[pair[0]] = value(pair[1]);
    });
    return out;
  }

  function firstValue(data, keys) {
    for (var i = 0; i < keys.length; i++) {
      var val = data[keys[i]];
      if (val != null && val !== '') return val;
    }
    return '';
  }

  function load(data, pairs) {
    if (!data) return;
    pairs.forEach(function (pair) {
      var keys = Array.isArray(pair[1]) ? pair[1] : [pair[1]];
      setValue(pair[0], firstValue(data, keys));
    });
  }

  function validate(required) {
    var missing = [];
    required.forEach(function (item) {
      var id = item[0];
      var label = item[1];
      var el = element(id);
      if (!el || !String(el.value || '').trim()) missing.push(label);
    });
    return missing;
  }

  window.LFormSchema = {
    domains: CANONICAL_FIELD_DOMAINS,
    aliases: FIELD_ALIASES,
    canonicalKey: canonicalKey,
    canonicalize: canonicalize,
    el: element,
    value: value,
    set: setValue,
    collect: collect,
    load: load,
    validate: validate
  };
})();
