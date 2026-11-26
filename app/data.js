// SPDX-License-Identifier: MIT
// NusaStat — data statistik Indonesia.
// Semua angka di sini adalah angka publik yang dibulatkan (label "sekitar /
// perkiraan") dari rilis Badan Pusat Statistik (BPS) dan publikasi resmi
// terkait, dengan tahun acuan ditulis di tiap angka. Tidak ada angka yang
// dikarang presisi: bila ragu, angka dibulatkan dan diberi label perkiraan.

export const YEARS = [2019, 2020, 2021, 2022, 2023, 2024];

// Seri tahunan nasional (2019-2024). Sumber: BPS.
export const SERIES = {
  population: {
    label: 'Penduduk',
    unit: 'juta jiwa',
    values: [266.9, 270.2, 272.2, 275.8, 278.7, 281.6],
    note: 'Pertengahan tahun; 2020 = hasil Sensus Penduduk. Sumber: BPS.',
  },
  gdpGrowth: {
    label: 'Pertumbuhan PDB',
    unit: '% y-on-y',
    values: [5.02, -2.07, 3.7, 5.31, 5.05, 5.03],
    note: 'Pertumbuhan ekonomi tahunan (harga konstan 2010). Sumber: BPS.',
  },
  gdpNominal: {
    label: 'PDB nominal',
    unit: 'Rp triliun',
    values: [15834, 15434, 16977, 19543, 20892, 22139],
    note: 'PDB atas dasar harga berlaku, dibulatkan. Sumber: BPS.',
  },
  inflation: {
    label: 'Inflasi (IHK)',
    unit: '% y-on-y',
    values: [2.72, 1.68, 1.87, 5.51, 2.61, 1.57],
    note: 'Inflasi Desember terhadap Desember tahun sebelumnya. Sumber: BPS.',
  },
  unemployment: {
    label: 'Pengangguran terbuka (TPT)',
    unit: '%',
    values: [5.28, 7.07, 6.49, 5.86, 5.45, 4.91],
    note: 'Tingkat Pengangguran Terbuka, Agustus tiap tahun. Sumber: BPS.',
  },
  poverty: {
    label: 'Kemiskinan',
    unit: '%',
    values: [9.22, 9.78, 9.71, 9.57, 9.36, 8.57],
    note: 'Persentase penduduk miskin, September tiap tahun. Sumber: BPS.',
  },
};

// Indikator utama 2024 (satu angka per indikator, dengan sumber).
export const HEADLINE_2024 = [
  { key: 'population', value: '281,6 jt', sub: 'penduduk (perkiraan, pertengahan 2024)', source: 'BPS' },
  { key: 'gdpGrowth', value: '5,03%', sub: 'pertumbuhan PDB 2024', source: 'BPS' },
  { key: 'gdpNominal', value: 'Rp22.139 T', sub: 'PDB nominal 2024', source: 'BPS' },
  { key: 'inflation', value: '1,57%', sub: 'inflasi Des 2024 (y-on-y)', source: 'BPS' },
  { key: 'unemployment', value: '4,91%', sub: 'pengangguran terbuka, Agu 2024', source: 'BPS' },
  { key: 'poverty', value: '8,57%', sub: 'penduduk miskin, Sep 2024', source: 'BPS' },
  { key: 'hdi', value: '75,02', sub: 'Indeks Pembangunan Manusia 2024', source: 'BPS' },
  { key: 'gini', value: '0,379', sub: 'rasio gini, Sep 2024 (sekitar)', source: 'BPS' },
];

// Struktur umur 2024 (persen, perkiraan).
export const AGE_GROUPS = [
  { group: '0–14 tahun', pct: 24.5 },
  { group: '15–24 tahun', pct: 16.8 },
  { group: '25–54 tahun', pct: 42.1 },
  { group: '55–64 tahun', pct: 10.4 },
  { group: '65+ tahun', pct: 6.2 },
];

// Pangsa PDB menurut lapangan usaha 2024 (%, perkiraan, dibulatkan).
export const SECTORS = [
  { name: 'Industri pengolahan', share: 18.7 },
  { name: 'Perdagangan besar & eceran', share: 13.0 },
  { name: 'Pertanian, kehutanan & perikanan', share: 12.5 },
  { name: 'Konstruksi', share: 10.0 },
  { name: 'Pertambangan & penggalian', share: 9.0 },
  { name: 'Transportasi & pergudangan', share: 5.4 },
  { name: 'Informasi & komunikasi', share: 4.5 },
  { name: 'Jasa keuangan & asuransi', share: 4.3 },
  { name: 'Penyediaan akomodasi & makan minum', share: 2.6 },
  { name: 'Lapangan usaha lainnya', share: 19.9 },
];

// Inflasi menurut kelompok pengeluaran, Des 2024 y-on-y (%, sekitar).
export const PRICE_GROUPS = [
  { name: 'Perawatan pribadi & jasa lainnya', value: 5.0 },
  { name: 'Makanan, minuman & tembakau', value: 2.5 },
  { name: 'Penyediaan makanan & minuman / restoran', value: 2.2 },
  { name: 'Kesehatan', value: 1.7 },
  { name: 'Pendidikan', value: 1.6 },
  { name: 'Pakaian & alas kaki', value: 1.0 },
  { name: 'Perlengkapan rumah tangga', value: 1.0 },
  { name: 'Perumahan, air, listrik & bahan bakar', value: 0.7 },
  { name: 'Transportasi', value: 0.6 },
  { name: 'Rekreasi, olahraga & budaya', value: 0.5 },
  { name: 'Informasi, komunikasi & jasa keuangan', value: -0.3 },
];

// Provinsi: penduduk perkiraan 2024 (juta jiwa, dibulatkan) + luas daratan
// (ribu km², sekitar). Kepadatan dihitung dari kedua angka itu.
export const PROVINCES = [
  { name: 'Jawa Barat', pop: 50.3, area: 35.4 },
  { name: 'Jawa Timur', pop: 41.8, area: 47.8 },
  { name: 'Jawa Tengah', pop: 37.9, area: 32.8 },
  { name: 'Sumatera Utara', pop: 16.0, area: 73.0 },
  { name: 'Banten', pop: 12.4, area: 9.7 },
  { name: 'DKI Jakarta', pop: 10.6, area: 0.66 },
  { name: 'Lampung', pop: 9.4, area: 34.6 },
  { name: 'Sulawesi Selatan', pop: 9.4, area: 46.7 },
  { name: 'Sumatera Selatan', pop: 9.0, area: 91.6 },
  { name: 'Riau', pop: 6.9, area: 87.0 },
  { name: 'Sumatera Barat', pop: 5.8, area: 42.0 },
  { name: 'Kalimantan Barat', pop: 5.8, area: 147.3 },
  { name: 'Nusa Tenggara Barat', pop: 5.7, area: 18.6 },
  { name: 'Nusa Tenggara Timur', pop: 5.7, area: 48.7 },
  { name: 'Aceh', pop: 5.5, area: 58.0 },
  { name: 'Bali', pop: 4.4, area: 5.8 },
  { name: 'Kalimantan Selatan', pop: 4.3, area: 38.7 },
  { name: 'Kalimantan Timur', pop: 4.0, area: 127.3 },
  { name: 'DI Yogyakarta', pop: 3.8, area: 3.1 },
  { name: 'Jambi', pop: 3.7, area: 50.1 },
  { name: 'Sulawesi Tengah', pop: 3.1, area: 61.8 },
  { name: 'Kalimantan Tengah', pop: 2.8, area: 153.6 },
  { name: 'Sulawesi Tenggara', pop: 2.8, area: 38.1 },
  { name: 'Sulawesi Utara', pop: 2.7, area: 13.9 },
  { name: 'Kepulauan Riau', pop: 2.2, area: 8.2 },
  { name: 'Bengkulu', pop: 2.1, area: 19.9 },
  { name: 'Maluku', pop: 2.0, area: 46.9 },
  { name: 'Sulawesi Barat', pop: 1.6, area: 16.8 },
  { name: 'Kep. Bangka Belitung', pop: 1.5, area: 16.4 },
  { name: 'Papua Pegunungan', pop: 1.5, area: 108.5 },
  { name: 'Maluku Utara', pop: 1.4, area: 32.0 },
  { name: 'Papua Tengah', pop: 1.4, area: 66.1 },
  { name: 'Gorontalo', pop: 1.3, area: 11.3 },
  { name: 'Papua', pop: 1.1, area: 82.7 },
  { name: 'Kalimantan Utara', pop: 0.7, area: 75.5 },
  { name: 'Papua Barat', pop: 0.6, area: 60.3 },
  { name: 'Papua Barat Daya', pop: 0.6, area: 39.1 },
  { name: 'Papua Selatan', pop: 0.5, area: 117.8 },
];

export function density(p) {
  return Math.round((p.pop * 1000000) / (p.area * 1000));
}

// Rilis terbaru (judul + tanggal + ringkasan singkat).
export const RELEASES = [
  { date: '5 Nov 2025', title: 'Pertumbuhan ekonomi triwulan III-2025', text: 'Ekonomi Indonesia tumbuh 5,04% (y-on-y) pada triwulan III-2025. Angka triwulanan diperbarui tiap awal Februari, Mei, Agustus, dan November.' },
  { date: '3 Nov 2025', title: 'Inflasi Oktober 2025', text: 'Inflasi tahunan (y-on-y) Oktober 2025 tercatat sekitar 2,8%. Rincian menurut kelompok pengeluaran dimuat di halaman Harga.' },
  { date: '5 Nov 2025', title: 'Keadaan ketenagakerjaan Agustus 2025', text: 'Tingkat Pengangguran Terbuka Agustus 2025 sekitar 4,9%. Rincian menurut provinsi dan pendidikan ada di halaman Ketenagakerjaan.' },
  { date: '15 Jan 2025', title: 'Kemiskinan September 2024', text: 'Persentase penduduk miskin September 2024 sebesar 8,57%, turun dari 9,36% pada Maret 2024.' },
  { date: '1 Feb 2025', title: 'Indeks Pembangunan Manusia 2024', text: 'IPM Indonesia 2024 mencapai 75,02, naik 0,63 poin dari 74,39 pada 2023.' },
  { date: 'Jul 2025', title: 'Proyeksi penduduk 2025–2045', text: 'Penduduk Indonesia diproyeksikan menembus 300 juta jiwa sekitar 2034 dan mencapai puncaknya di kisaran 324 juta pada 2060-an.' },
];

export const SOURCES = [
  { name: 'Badan Pusat Statistik (BPS)', url: 'https://www.bps.go.id', what: 'Sensus Penduduk 2020, proyeksi penduduk, PDB, IHK, Sakernas, Susenas, IPM.' },
  { name: 'Bank Indonesia', url: 'https://www.bi.go.id', what: 'Data moneter dan sistem pembayaran (rujukan silang inflasi).' },
  { name: 'Kementerian Keuangan', url: 'https://www.kemenkeu.go.id', what: 'APBN dan asumsi makro (rujukan silang PDB).' },
];
