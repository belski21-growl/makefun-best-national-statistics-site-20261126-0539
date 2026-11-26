// SPDX-License-Identifier: MIT
// NusaStat — perbandingan Indonesia dengan dunia dan negara sebanding.
// Semua angka di bawah ini diambil dari World Bank, World Development
// Indicators (WDI), diakses 26 November 2026 lewat API publik tanpa kunci.
// Tahun acuan: 2024 untuk semua angka, agar bisa dibandingkan apel-dengan-apel.
// Angka dibulatkan ke 1 desimal; nilai mentah tersimpan di komentar tiap baris.
//
// PERHATIAN VINTAGE (jangan dicampur diam-diam):
// - Penduduk Indonesia menurut Bank Dunia 2024 = 283,5 juta, sedangkan angka
//   BPS yang dipakai kartu KPI situs ini = 281,6 juta (2024). Selisihnya dari
//   perbedaan metode (Bank Dunia memakai estimasi PBB; BPS memakai proyeksi
//   antar-sensus). Tabel perbandingan memakai angka Bank Dunia untuk SEMUA
//   negara supaya sebanding; footnote di bawah tabel menjelaskan selisihnya.
// - Inflasi Bank Dunia = rata-rata tahunan (CPI tahunan), sedangkan angka BPS
//   di situs ini = Desember terhadap Desember tahun sebelumnya (1,57% untuk
//   2024). Keduanya benar, ukurannya berbeda — label di tabel menuliskan itu.
// - Pengangguran Bank Dunia = estimasi model ILO; TPT BPS (4,91% Agu 2024)
//   memakai Sakernas. Garis kemiskinan Bank Dunia = $2,15/hari (paritas daya
//   beli 2017); garis BPS = garis kemiskinan nasional.

const fmtID = (n) => String(n).replace('.', ',');

// Nilai "Dunia" untuk kartu KPI di beranda. Kunci = kunci HEADLINE_2024.
// Hanya indikator yang punya agregat dunia dengan definisi yang bisa
// dijelaskan dalam satu baris yang diberi nilai dunia; sisanya null.
export const WORLD_LINES = {
  population: 'Dunia: 8.141 jt (2024, Bank Dunia)',
  gdpGrowth: 'Dunia: 2,9% (2024, Bank Dunia)',
  inflation: 'Dunia: 3,0% rata-rata tahunan (2024, Bank Dunia)',
  unemployment: 'Dunia: 4,8% model ILO (2024, Bank Dunia)',
  poverty: 'Dunia: 10,1% garis $2,15/hari (2024, Bank Dunia)',
  gdpNominal: null,
  hdi: null,
  gini: null,
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

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function peerTable() {
  const head = '<tr><th>Indikator (2024)</th><th>Indonesia</th><th>Malaysia</th><th>Thailand</th><th>Vietnam</th><th>Filipina</th><th>Dunia</th></tr>';
  const rows = PEER_ROWS.map((r) => `<tr><td>${esc(r.label)} (${esc(r.unit)})</td><td><strong>${esc(r.idn)}</strong></td><td>${esc(r.mys)}</td><td>${esc(r.tha)}</td><td>${esc(r.vnm)}</td><td>${esc(r.phl)}</td><td>${esc(r.wld)}</td></tr>`).join('');
  return `<div class="table-scroll"><table class="data-table peer-table"><thead>${head}</thead><tbody>${rows}</tbody></table></div>
<p class="source">Sumber: Bank Dunia, World Development Indicators, 2024 (diakses 26 Nov 2026). Semua angka 2024, dibulatkan ke 1 desimal. Inflasi di sini adalah rata-rata tahunan — berbeda dari angka BPS 1,57% yang mengukur Desember terhadap Desember tahun sebelumnya. Penduduk Indonesia menurut Bank Dunia 283,5 juta, sedikit di atas angka BPS 281,6 juta karena perbedaan metode proyeksi; semua angka tabel ini memakai Bank Dunia agar sebanding antar-negara.</p>`;
}
