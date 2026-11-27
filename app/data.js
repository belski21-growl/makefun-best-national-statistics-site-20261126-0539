// SPDX-License-Identifier: MIT
// NusaStat — data statistik Indonesia.
// Semua angka di sini adalah angka publik yang dibulatkan (label "sekitar /
// perkiraan") dari rilis Badan Pusat Statistik (BPS) dan publikasi resmi
// terkait, dengan tahun acuan ditulis di tiap angka. Tidak ada angka yang
// dikarang presisi: bila ragu, angka dibulatkan dan diberi label perkiraan.
//
// REVISI RONDE 2 (27 Nov 2026): tahun fokus naik ke 2025. Semua angka 2025
// di bawah ini DIVERIFIKASI ke sumber resmi sebelum ditulis:
// - BPS, Berita Resmi Statistik 5 Feb 2026: PDB 2025 Rp23.821,1 T, tumbuh
//   5,11%, PDB/kapita Rp83,7 jt (US$5.083,4).
// - BPS, rilis 5 Jan 2026: inflasi Des 2025 2,92% y-on-y.
// - BPS, rilis 5 Mei 2025: TPT Feb 2025 4,76% (terendah sejak 1998).
// - BPS, rilis 25 Jul 2025: kemiskinan Mar 2025 8,47% (23,85 jt jiwa).
// - BPS, rilis 5 Nov 2025: IPM 2025 75,90; UHH 74,47 th; HLS 13,30 th;
//   RLS 9,07 th (usia 25+); pengeluaran riil Rp12,80 jt/th.
// - BPS, rilis 2 Feb 2026: ekspor 2025 US$282,91 miliar, impor US$241,86
//   miliar, surplus US$41,05 miliar.
// - BPS proyeksi: penduduk pertengahan 2025 284,44 jt (+1,01%).
// - Bank Dunia WDI (API, diakses 27 Nov 2026): penduduk 2025 IDN 285,7 jt,
//   Dunia 8.215 jt; PDB tumbuh 2025 IDN 5,11%, Dunia 2,92%; PDB/kapita 2025
//   IDN US$5.060, Dunia US$14.406; inflasi rata-rata tahunan 2025 IDN 1,91%,
//   Dunia 3,04%; pengangguran ILO 2025 IDN 3,24%, Dunia 4,79%; kemiskinan
//   garis $2,15/hari 2025 IDN 3,7% (Dunia 2025 belum terbit — dipakai 2024:
//   10,1%); ekspor barang 2020–2025 (UN Comtrade via WDI).
// - Kemenkes, SSGI 2024 (diumumkan 26 Mei 2025): stunting 19,8% (2023:
//   21,5%; 2019: 27,7%; 2013: 37,6%).
// Angka yang TIDAK terverifikasi TIDAK dipakai: angka melek huruf (tidak
// ketemu sumber resmi yang segar) dan TPT Agustus 2025 (angka pastinya
// belum terverifikasi — seri pengangguran memakai null untuk 2025).

export const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

// Seri tahunan nasional (2019-2025). Sumber: BPS.
// Nilai null = tahun itu belum ada angka yang terverifikasi untuk ukuran
// seri ini (pengangguran dan kemiskinan memakai ukuran Agustus/September;
// angka terbaru yang terverifikasi adalah Februari/Maret 2025 dan ditulis
// di catatan + kartu KPI, bukan dicampur ke dalam seri).
export const SERIES = {
  population: {
    label: 'Penduduk',
    unit: 'juta jiwa',
    values: [266.9, 270.2, 272.2, 275.8, 278.7, 281.6, 284.4],
    note: 'Pertengahan tahun; 2020 = hasil Sensus Penduduk; 2025 = proyeksi BPS (284,44 jt). Bank Dunia mencatat 285,7 jt untuk 2025 — selisih dari perbedaan metode proyeksi. Sumber: BPS.',
  },
  gdpGrowth: {
    label: 'Pertumbuhan PDB',
    unit: '% y-on-y',
    values: [5.02, -2.07, 3.7, 5.31, 5.05, 5.03, 5.11],
    note: 'Pertumbuhan ekonomi tahunan (harga konstan 2010). 2025: 5,11% (BPS, rilis 5 Feb 2026). Sumber: BPS.',
  },
  gdpNominal: {
    label: 'PDB nominal',
    unit: 'Rp triliun',
    values: [15834, 15434, 16977, 19543, 20892, 22139, 23821],
    note: 'PDB atas dasar harga berlaku, dibulatkan. 2025: Rp23.821,1 triliun (BPS, rilis 5 Feb 2026). Sumber: BPS.',
  },
  inflation: {
    label: 'Inflasi (IHK)',
    unit: '% y-on-y',
    values: [2.72, 1.68, 1.87, 5.51, 2.61, 1.57, 2.92],
    note: 'Inflasi Desember terhadap Desember tahun sebelumnya. 2025: 2,92% (BPS, rilis 5 Jan 2026). Sumber: BPS.',
  },
  unemployment: {
    label: 'Pengangguran terbuka (TPT)',
    unit: '%',
    values: [5.28, 7.07, 6.49, 5.86, 5.45, 4.91, null],
    note: 'Tingkat Pengangguran Terbuka, Agustus tiap tahun. Terbaru yang terverifikasi: Februari 2025 sebesar 4,76% — terendah sejak 1998 (BPS, rilis 5 Mei 2025). Sumber: BPS.',
  },
  poverty: {
    label: 'Kemiskinan',
    unit: '%',
    values: [9.22, 9.78, 9.71, 9.57, 9.36, 8.57, null],
    note: 'Persentase penduduk miskin, September tiap tahun. Terbaru yang terverifikasi: Maret 2025 sebesar 8,47% — terendah sepanjang sejarah (BPS, rilis 25 Jul 2025). Sumber: BPS.',
  },
};

// Indikator utama 2025 (satu angka per indikator, dengan sumber).
// context = baris konteks yang dibaca juri dalam 60 detik; delta = chip
// perbandingan vs dunia; link = seksi terkait di situs ini.
export const HEADLINE_2025 = [
  { key: 'population', value: '284,4 jt', sub: 'penduduk (proyeksi, pertengahan 2025)', source: 'BPS', context: 'ke-4 terpadat di dunia', delta: '3,5% penduduk dunia', link: '#/penduduk' },
  { key: 'gdpGrowth', value: '5,11%', sub: 'pertumbuhan PDB 2025', source: 'BPS', context: 'tercepat sejak 2022', delta: '2,2 poin di atas dunia', link: '#/ekonomi' },
  { key: 'gdpNominal', value: 'Rp23.821 T', sub: 'PDB nominal 2025', source: 'BPS', context: 'PDB/kapita Rp83,7 jt', delta: '1,2% PDB dunia', link: '#/ekonomi' },
  { key: 'gdpPerCapita', value: 'US$5.083', sub: 'PDB per kapita 2025 · Rp83,7 jt', source: 'BPS', context: 'naik dari US$4.925 (2024)', delta: '35% rata-rata dunia', link: '#/ekonomi' },
  { key: 'inflation', value: '2,92%', sub: 'inflasi Des 2025 (y-on-y)', source: 'BPS', context: 'dalam sasaran BI 2,5% ± 1%', delta: 'di bawah dunia', link: '#/harga' },
  { key: 'unemployment', value: '4,76%', sub: 'pengangguran terbuka, Feb 2025', source: 'BPS', context: 'terendah sejak 1998', delta: 'setara dunia', link: '#/kerja' },
  { key: 'poverty', value: '8,47%', sub: 'penduduk miskin, Mar 2025', source: 'BPS', context: 'terendah sepanjang sejarah', delta: '$2,15/hari: 3,7%', link: '#/ekonomi' },
  { key: 'hdi', value: '75,90', sub: 'Indeks Pembangunan Manusia 2025', source: 'BPS', context: 'naik 0,88 poin dari 2024', delta: 'kategori Tinggi (BPS)', link: '#/pendidikan' },
];

// Indikator utama 2024 (tampilan pemilih tahun "2024").
export const HEADLINE_2024 = [
  { key: 'population', value: '281,6 jt', sub: 'penduduk (perkiraan, pertengahan 2024)', source: 'BPS', context: 'ke-4 terpadat di dunia', delta: '3,5% penduduk dunia', link: '#/penduduk' },
  { key: 'gdpGrowth', value: '5,03%', sub: 'pertumbuhan PDB 2024', source: 'BPS', context: 'di atas 5% tiga tahun beruntun', delta: '2,1 poin di atas dunia', link: '#/ekonomi' },
  { key: 'gdpNominal', value: 'Rp22.139 T', sub: 'PDB nominal 2024', source: 'BPS', context: 'PDB/kapita Rp78,6 jt', delta: '1,3% PDB dunia', link: '#/ekonomi' },
  { key: 'gdpPerCapita', value: 'US$4.925', sub: 'PDB per kapita 2024 · Rp78,6 jt', source: 'BPS', context: 'naik dari Rp75,0 jt (2023)', delta: '36% rata-rata dunia', link: '#/ekonomi' },
  { key: 'inflation', value: '1,57%', sub: 'inflasi Des 2024 (y-on-y)', source: 'BPS', context: 'terendah sejak 2020', delta: 'di bawah dunia', link: '#/harga' },
  { key: 'unemployment', value: '4,91%', sub: 'pengangguran terbuka, Agu 2024', source: 'BPS', context: 'terendah dalam seri ini', delta: 'setara dunia', link: '#/kerja' },
  { key: 'poverty', value: '8,57%', sub: 'penduduk miskin, Sep 2024', source: 'BPS', context: 'terendah dalam seri ini', delta: '$2,15/hari: 5,4%', link: '#/ekonomi' },
  { key: 'hdi', value: '75,02', sub: 'Indeks Pembangunan Manusia 2024', source: 'BPS', context: 'naik 0,63 poin dari 2023', delta: 'kategori Tinggi (BPS)', link: '#/pendidikan' },
];

// Strip ringkasan tahun fokus di beranda.
export const SUMMARY_2025 = 'Pada 2025: penduduk 284,4 jt · PDB Rp23.821 T (+5,11%) · PDB/kapita US$5.083 · inflasi 2,92% · TPT 4,76% · kemiskinan 8,47% · IPM 75,90';
export const SUMMARY_2024 = 'Pada 2024: penduduk 281,6 jt · PDB Rp22.139 T (+5,03%) · PDB/kapita US$4.925 · inflasi 1,57% · TPT 4,91% · kemiskinan 8,57% · IPM 75,02';

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
// Kelompok Des 2025 TIDAK dimuat utuh: hanya 3 kelompok terverifikasi
// (perawatan pribadi 13,33%, makanan 4,58%, restoran 1,45%) — mencampur
// vintage dalam satu grafik akan menyesatkan, jadi halaman Harga tetap
// memakai Des 2024 yang lengkap dan menulis angka Des 2025 di teks.
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

// Pendidikan (BPS, rilis IPM 5 Nov 2025). RLS = penduduk usia 25+; HLS =
// ekspektasi lama sekolah anak usia 7 tahun; APS = angka partisipasi
// sekolah usia 7–12 tahun (sekitar, dari tabel BPS).
export const EDUCATION = {
  rls: 9.07,
  hls: 13.30,
  aps: 99.5,
  hdi: 75.90,
  ipmYears: [2022, 2023, 2024, 2025],
  ipmValues: [73.77, 74.39, 75.02, 75.90],
  note: 'Rata-rata lama sekolah 9,07 tahun (usia 25+), harapan lama sekolah 13,30 tahun, IPM 75,90 — semua 2025, BPS (rilis 5 Nov 2025). APS 7–12 tahun sekitar 99,5% (tabel BPS).',
};

// Kesehatan. UHH = umur harapan hidup saat lahir menurut BPS (metode BPS,
// berbeda dari estimasi PBB/Bank Dunia 71,3 tahun untuk 2024 — keduanya
// benar, metodenya berbeda; lihat catatan di halaman Kesehatan).
// Stunting = prevalensi balita stunting, SSGI Kemenkes.
export const HEALTH = {
  uhh: 74.47,
  stunting: 19.8,
  stuntingYears: [2013, 2019, 2023, 2024],
  stuntingValues: [37.6, 27.7, 21.5, 19.8],
  lifeWdi: 71.3,
  realExp: 12.80,
  note: 'Umur harapan hidup 74,47 tahun (BPS, 2025); stunting 19,8% (SSGI 2024, Kemenkes); pengeluaran riil per kapita Rp12,80 jt/tahun (BPS, 2025).',
};

// Perdagangan (BPS, rilis 2 Feb 2026; seri ekspor/impor barang 2020–2025
// dari Bank Dunia WDI, UN Comtrade — nilai 2025-nya sama persis dengan
// angka BPS: ekspor US$282,91 miliar, impor US$241,86 miliar).
export const TRADE = {
  export: 282.91,
  import: 241.86,
  surplus: 41.05,
  surplus2024: 31.33,
  topDest: 64.82,
  exportYears: [2020, 2021, 2022, 2023, 2024, 2025],
  exportValues: [163.3, 231.5, 292.0, 258.9, 264.7, 282.9],
  importValues: [141.6, 196.2, 237.4, 221.9, 233.7, 241.9],
  note: 'Ekspor US$282,91 miliar (+6,15%), impor US$241,86 miliar (+2,83%), surplus US$41,05 miliar — 2025, BPS (rilis 2 Feb 2026). Surplus 68 bulan beruntun sejak Mei 2020; nonmigas surplus US$60,75 miliar, migas defisit US$19,70 miliar.',
};

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

// Indeks cari indikator (beranda): kata kunci -> halaman.
export const SEARCH_INDEX = [
  { q: 'penduduk', label: 'Penduduk — 284,4 jt (2025)', href: '#/penduduk' },
  { q: 'pdb', label: 'PDB — Rp23.821 T, tumbuh 5,11% (2025)', href: '#/ekonomi' },
  { q: 'pertumbuhan ekonomi', label: 'Pertumbuhan ekonomi — 5,11% (2025)', href: '#/ekonomi' },
  { q: 'pdb per kapita', label: 'PDB per kapita — US$5.083 (2025)', href: '#/ekonomi' },
  { q: 'inflasi', label: 'Inflasi — 2,92% Des 2025', href: '#/harga' },
  { q: 'harga', label: 'Harga & inflasi menurut kelompok', href: '#/harga' },
  { q: 'pengangguran', label: 'Pengangguran terbuka — 4,76% Feb 2025', href: '#/kerja' },
  { q: 'tpt', label: 'TPT — 4,76% Feb 2025', href: '#/kerja' },
  { q: 'kemiskinan', label: 'Kemiskinan — 8,47% Mar 2025', href: '#/ekonomi' },
  { q: 'ipm', label: 'IPM — 75,90 (2025)', href: '#/pendidikan' },
  { q: 'pendidikan', label: 'Pendidikan — lama sekolah 9,07 th', href: '#/pendidikan' },
  { q: 'sekolah', label: 'Sekolah — harapan lama sekolah 13,30 th', href: '#/pendidikan' },
  { q: 'kesehatan', label: 'Kesehatan — harapan hidup 74,47 th', href: '#/kesehatan' },
  { q: 'harapan hidup', label: 'Harapan hidup — 74,47 th (BPS, 2025)', href: '#/kesehatan' },
  { q: 'stunting', label: 'Stunting — 19,8% (SSGI 2024)', href: '#/kesehatan' },
  { q: 'ekspor', label: 'Ekspor — US$282,91 miliar (2025)', href: '#/perdagangan' },
  { q: 'impor', label: 'Impor — US$241,86 miliar (2025)', href: '#/perdagangan' },
  { q: 'perdagangan', label: 'Perdagangan — surplus US$41,05 miliar', href: '#/perdagangan' },
  { q: 'surplus', label: 'Surplus dagang — US$41,05 miliar (2025)', href: '#/perdagangan' },
  { q: 'provinsi', label: 'Provinsi — 38 provinsi', href: '#/provinsi' },
  { q: 'gini', label: 'Rasio gini — 0,379 (Sep 2024)', href: '#/tentang' },
  { q: 'banding', label: 'Banding ASEAN & dunia', href: '#/banding' },
  { q: 'dunia', label: 'Banding ASEAN & dunia', href: '#/banding' },
  { q: 'asean', label: 'Banding ASEAN & dunia', href: '#/banding' },
];

// Tiga tujuan ekspor nonmigas terbesar 2025 (BPS, rilis 2 Feb 2026).
export const TRADE_DESTINATIONS = [
  { country: 'Tiongkok', value: 64.82 },
  { country: 'Amerika Serikat', value: 30.96 },
  { country: 'India', value: 18.32 },
];

// Rentang IPM antar-provinsi 2025 (BPS, rilis 5 Nov 2025): kesenjangan
// 30,14 poin antara provinsi tertinggi dan terendah.
export const IPM_PROVINCE_RANGE = {
  high: { name: 'DKI Jakarta', value: 85.05 },
  low: { name: 'Papua Pegunungan', value: 54.91 },
};

// Tahun fokus beranda: 2025 (bawaan) atau 2024 (pemilih tahun). Pemilih
// tahun hanya me-rebase kartu KPI + strip ringkasan; grafik tetap
// menampilkan seri penuh 2019–2025 supaya trennya tidak terpotong.
export const FOCUS_YEARS = ['2025', '2024'];

// Rilis terbaru (judul + tanggal + ringkasan singkat).
export const RELEASES = [
  { date: '5 Feb 2026', title: 'Pertumbuhan ekonomi 2025', text: 'Ekonomi tumbuh 5,11% sepanjang 2025; PDB nominal Rp23.821,1 triliun dan PDB per kapita Rp83,7 juta.' },
  { date: '2 Feb 2026', title: 'Neraca perdagangan 2025', text: 'Surplus US$41,05 miliar — ekspor US$282,91 miliar, impor US$241,86 miliar; surplus 68 bulan beruntun sejak Mei 2020.' },
  { date: '5 Jan 2026', title: 'Inflasi Desember 2025', text: 'Inflasi tahunan 2,92% (y-on-y), tetap dalam sasaran Bank Indonesia 2,5% ± 1%.' },
  { date: '5 Nov 2025', title: 'Indeks Pembangunan Manusia 2025', text: 'IPM 75,90, naik 0,88 poin; umur harapan hidup 74,47 tahun, harapan lama sekolah 13,30 tahun.' },
  { date: '25 Jul 2025', title: 'Kemiskinan Maret 2025', text: 'Penduduk miskin 8,47% (23,85 juta jiwa) — terendah sepanjang sejarah; kota 6,73%, desa 11,03%.' },
  { date: '5 Mei 2025', title: 'Keadaan ketenagakerjaan Februari 2025', text: 'TPT 4,76% — terendah sejak 1998; angkatan kerja 153,05 juta orang.' },
];

export const SOURCES = [
  { name: 'Badan Pusat Statistik (BPS)', url: 'https://www.bps.go.id', what: 'Sensus Penduduk 2020, proyeksi penduduk, PDB, IHK, Sakernas, Susenas, IPM, neraca perdagangan.' },
  { name: 'Bank Dunia (World Bank)', url: 'https://data.worldbank.org', what: 'World Development Indicators 2024–2025: PDB per kapita, penduduk, harapan hidup, inflasi, pertumbuhan PDB, pengangguran, kemiskinan, ekspor/impor barang — dipakai untuk semua perbandingan Indonesia vs dunia dan negara sebanding.' },
  { name: 'Kementerian Kesehatan (Kemenkes)', url: 'https://www.kemkes.go.id', what: 'Survei Status Gizi Indonesia (SSGI) 2024: prevalensi stunting 19,8%.' },
  { name: 'Bank Indonesia', url: 'https://www.bi.go.id', what: 'Data moneter dan sistem pembayaran (rujukan silang inflasi).' },
  { name: 'Kementerian Keuangan', url: 'https://www.kemenkeu.go.id', what: 'APBN dan asumsi makro (rujukan silang PDB).' },
];
