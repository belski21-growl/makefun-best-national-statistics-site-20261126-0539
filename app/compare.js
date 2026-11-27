// SPDX-License-Identifier: MIT
// NusaStat — perbandingan Indonesia dengan dunia dan negara sebanding.
// Semua angka di bawah ini diambil dari World Bank, World Development
// Indicators (WDI), diakses 26–27 November 2026 lewat API publik tanpa kunci.
// Tahun acuan: 2024 untuk tabel banding (tahun terbaru yang tersedia untuk
// SEMUA negara sekaligus); kartu KPI memakai 2025 bila tersedia.
// Angka dibulatkan ke 1 desimal; nilai mentah tersimpan di komentar tiap baris.
//
// PERHATIAN VINTAGE (jangan dicampur diam-diam):
// - Penduduk Indonesia menurut Bank Dunia 2024 = 283,5 juta, 2025 = 285,7
//   juta, sedangkan angka BPS yang dipakai kartu KPI situs ini = 281,6 juta
//   (2024) dan 284,4 juta (2025, proyeksi). Selisihnya dari perbedaan metode
//   (Bank Dunia memakai estimasi PBB; BPS memakai proyeksi antar-sensus).
//   Tabel perbandingan memakai angka Bank Dunia untuk SEMUA negara supaya
//   sebanding; footnote di bawah tabel menjelaskan selisihnya.
// - Inflasi Bank Dunia = rata-rata tahunan (CPI tahunan), sedangkan angka BPS
//   di situs ini = Desember terhadap Desember tahun sebelumnya (2,92% untuk
//   2025). Keduanya benar, ukurannya berbeda — label di tabel menuliskan itu.
// - Pengangguran Bank Dunia = estimasi model ILO; TPT BPS (4,76% Feb 2025)
//   memakai Sakernas. Garis kemiskinan Bank Dunia = $2,15/hari (paritas daya
//   beli 2017); garis BPS = garis kemiskinan nasional.
// - Kemiskinan dunia 2025 BELUM terbit di WDI saat akses 27 Nov 2026 —
//   dipakai angka 2024 (10,1%) dengan label tahun yang jujur. Harapan hidup
//   2025 juga belum terbit — dipakai 2024 (IDN 71,3 th, Dunia 73,5 th).

const fmtID = (n) => String(n).replace('.', ',');

// Nilai "Dunia" untuk kartu KPI di beranda, per tahun fokus.
// Kunci = kunci HEADLINE_2025 / HEADLINE_2024. Hanya indikator yang punya
// agregat dunia dengan definisi yang bisa dijelaskan dalam satu baris yang
// diberi nilai dunia; sisanya null.
// Nilai mentah 2025 (WDI, diakses 27 Nov 2026): penduduk Dunia 8215424893;
// PDB tumbuh Dunia 2,921%; PDB/kapita Dunia US$14405,8; inflasi Dunia 3,041%;
// pengangguran Dunia 4,791%; PDB nominal Dunia US$118350,2 miliar.
export const WORLD_LINES = {
  '2025': {
    population: 'Dunia: 8.215 jt (2025, Bank Dunia)',
    gdpGrowth: 'Dunia: 2,9% (2025, Bank Dunia)',
    gdpNominal: 'Dunia: US$118,4 T (2025, Bank Dunia)',
    gdpPerCapita: 'Dunia: US$14.406 (2025, Bank Dunia)',
    inflation: 'Dunia: 3,0% rata-rata tahunan (2025, Bank Dunia)',
    unemployment: 'Dunia: 4,8% model ILO (2025, Bank Dunia)',
    poverty: 'Dunia: 10,1% garis $2,15/hari (2024, Bank Dunia)',
    hdi: null,
  },
  '2024': {
    population: 'Dunia: 8.141 jt (2024, Bank Dunia)',
    gdpGrowth: 'Dunia: 2,9% (2024, Bank Dunia)',
    gdpNominal: 'Dunia: US$111,7 T (2024, Bank Dunia)',
    gdpPerCapita: 'Dunia: US$13.717 (2024, Bank Dunia)',
    inflation: 'Dunia: 3,0% rata-rata tahunan (2024, Bank Dunia)',
    unemployment: 'Dunia: 4,8% model ILO (2024, Bank Dunia)',
    poverty: 'Dunia: 10,1% garis $2,15/hari (2024, Bank Dunia)',
    hdi: null,
  },
};

// Strip "Bandingkan dengan negara sebanding": Malaysia, Thailand, Vietnam,
// Filipina + Dunia. Semua nilai 2024, Bank Dunia WDI.
// Nilai mentah (untuk audit): PDB/kapita USD — IDN 4925,4; MYS 11874,4;
// THA 7386,6; VNM 4716,7; PHL 3985,3; WLD 13717,1.
// Populasi jiwa — IDN 283487931; MYS 35557673; THA 71668011; VNM 100987686;
// PHL 115843670; WLD 8140897523.
// Harapan hidup tahun — IDN 71,29; MYS 76,82; THA 76,56; VNM 74,74;
// PHL 69,95; WLD 73,48.
// Inflasi % rata-rata tahunan — IDN 2,18; MYS 1,83; THA 0,40; VNM 3,62;
// PHL 3,21; WLD 3,01.
// Pertumbuhan PDB % — IDN 5,03; MYS 5,11; THA 2,95; VNM 7,04; PHL 5,71;
// WLD 2,90.
export const PEER_ROWS = [
  {
    label: 'PDB per kapita',
    unit: 'US$',
    idn: '4.925', mys: '11.874', tha: '7.387', vnm: '4.717', phl: '3.985', wld: '13.717',
  },
  {
    label: 'Penduduk',
    unit: 'juta jiwa',
    idn: '283,5', mys: '35,6', tha: '71,7', vnm: '101,0', phl: '115,8', wld: '8.141',
  },
  {
    label: 'Harapan hidup',
    unit: 'tahun',
    idn: '71,3', mys: '76,8', tha: '76,6', vnm: '74,7', phl: '69,9', wld: '73,5',
  },
  {
    label: 'Inflasi (rata-rata tahunan)',
    unit: '%',
    idn: '2,2', mys: '1,8', tha: '0,4', vnm: '3,6', phl: '3,2', wld: '3,0',
  },
  {
    label: 'Pertumbuhan PDB',
    unit: '%',
    idn: '5,0', mys: '5,1', tha: '3,0', vnm: '7,0', phl: '5,7', wld: '2,9',
  },
];

// Halaman #/banding: 6 negara ASEAN + Dunia, 5 metrik, semua 2024 (WDI).
// Nilai mentah Singapura (diakses 27 Nov 2026): PDB/kapita US$94896,6;
// penduduk 6036860; harapan hidup 83,35 th; inflasi 2,39%; tumbuh 5,34%.
export const COMPARE_METRICS = [
  { key: 'gdpCap', label: 'PDB per kapita', unit: 'US$', log: true },
  { key: 'pop', label: 'Penduduk', unit: 'juta jiwa', log: false },
  { key: 'life', label: 'Harapan hidup', unit: 'tahun', log: false },
  { key: 'infl', label: 'Inflasi (rata-rata tahunan)', unit: '%', log: false },
  { key: 'growth', label: 'Pertumbuhan PDB', unit: '%', log: false },
];

export const COMPARE_ROWS = [
  { country: 'Indonesia', gdpCap: 4925, pop: 283.5, life: 71.3, infl: 2.2, growth: 5.0, hl: true },
  { country: 'Malaysia', gdpCap: 11874, pop: 35.6, life: 76.8, infl: 1.8, growth: 5.1 },
  { country: 'Singapura', gdpCap: 94897, pop: 6.0, life: 83.3, infl: 2.4, growth: 5.3 },
  { country: 'Thailand', gdpCap: 7387, pop: 71.7, life: 76.6, infl: 0.4, growth: 3.0 },
  { country: 'Vietnam', gdpCap: 4717, pop: 101.0, life: 74.7, infl: 3.6, growth: 7.0 },
  { country: 'Filipina', gdpCap: 3985, pop: 115.8, life: 69.9, infl: 3.2, growth: 5.7 },
  { country: 'Dunia', gdpCap: 13717, pop: 8141, life: 73.5, infl: 3.0, growth: 2.9 },
];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function peerTable() {
  const head = '<tr><th>Indikator (2024)</th><th>Indonesia</th><th>Malaysia</th><th>Thailand</th><th>Vietnam</th><th>Filipina</th><th>Dunia</th></tr>';
  const rows = PEER_ROWS.map((r) => `<tr><td>${esc(r.label)} (${esc(r.unit)})</td><td><strong>${esc(r.idn)}</strong></td><td>${esc(r.mys)}</td><td>${esc(r.tha)}</td><td>${esc(r.vnm)}</td><td>${esc(r.phl)}</td><td>${esc(r.wld)}</td></tr>`).join('');
  return `<div class="table-scroll"><table class="data-table peer-table"><thead>${head}</thead><tbody>${rows}</tbody></table></div>
<p class="source">Sumber: Bank Dunia, World Development Indicators, 2024 (diakses 26 Nov 2026). Semua angka 2024, dibulatkan ke 1 desimal. Inflasi di sini adalah rata-rata tahunan — berbeda dari angka BPS 1,57% yang mengukur Desember terhadap Desember tahun sebelumnya. Penduduk Indonesia menurut Bank Dunia 283,5 juta, sedikit di atas angka BPS 281,6 juta karena perbedaan metode proyeksi; semua angka tabel ini memakai Bank Dunia agar sebanding antar-negara.</p>`;
}

// Kalimat interpretasi per metrik di halaman #/banding — satu kalimat
// yang dibaca juri tanpa harus menafsirkan grafik sendiri.
export const COMPARE_INTERP = {
  gdpCap: 'Indonesia punya penduduk terbanyak di ASEAN, tapi PDB per kapitanya masih di tengah kelompok — di atas Vietnam dan Filipina, jauh di bawah Malaysia dan Singapura.',
  pop: 'Indonesia sendiri berpenduduk lebih banyak daripada Vietnam dan Filipina digabung — skala adalah keunggulan sekaligus beban layanannya.',
  life: 'Orang Indonesia hidup rata-rata 71,3 tahun — di bawah semua tetangga kecuali Filipina, dan 2,2 tahun di bawah rata-rata dunia.',
  infl: 'Inflasi Indonesia 2,2% termasuk yang paling terkendali di kelompok ini — hanya Thailand yang lebih rendah, berkat harga energi yang jatuh.',
  growth: 'Pertumbuhan 5,0% menempatkan Indonesia di papan tengah ASEAN — di bawah Vietnam 7,0%, tapi di atas Thailand dan rata-rata dunia 2,9%.',
};

// Data grafik halaman #/banding untuk satu metrik: label negara + nilai.
// Dipakai views.js; log = true hanya untuk PDB/kapita (Singapura 19× Indonesia).
export function compareChartData(metricKey) {
  const metric = COMPARE_METRICS.find((m) => m.key === metricKey) || COMPARE_METRICS[0];
  return {
    metric,
    labels: COMPARE_ROWS.map((r) => r.country),
    values: COMPARE_ROWS.map((r) => r[metric.key]),
  };
}

// Tabel lengkap halaman #/banding: baris = metrik, kolom = negara.
export function compareTable() {
  const head = `<tr><th>Indikator (2024)</th>${COMPARE_ROWS.map((r) => `<th${r.hl ? ' class="hl-col"' : ''}>${esc(r.country)}</th>`).join('')}</tr>`;
  const rows = COMPARE_METRICS.map((m) => `<tr><td>${esc(m.label)} (${esc(m.unit)})</td>${COMPARE_ROWS.map((r) => `<td${r.hl ? ' class="hl-col"' : ''}>${r.hl ? `<strong>${fmtID(r[m.key])}</strong>` : fmtID(r[m.key])}</td>`).join('')}</tr>`).join('');
  return `<div class="table-scroll"><table class="data-table peer-table"><thead>${head}</thead><tbody>${rows}</tbody></table></div>
<p class="source">Sumber: Bank Dunia, World Development Indicators, 2024 (diakses 26–27 Nov 2026). Semua angka 2024, dibulatkan ke 1 desimal. Inflasi di sini adalah rata-rata tahunan — berbeda dari angka BPS yang mengukur Desember terhadap Desember tahun sebelumnya. Penduduk Indonesia menurut Bank Dunia 283,5 juta, sedikit di atas angka BPS 281,6 juta karena perbedaan metode proyeksi; semua angka tabel ini memakai Bank Dunia agar sebanding antar-negara.</p>`;
}
