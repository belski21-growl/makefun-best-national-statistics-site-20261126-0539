// SPDX-License-Identifier: MIT
// NusaStat — peta skematik 38 provinsi (SVG digambar tangan, tanpa library,
// tanpa file peta dari luar).
//
// Peta ini SKEMATIK: bentuk tiap provinsi disederhanakan dari letak
// geografisnya (bukan batas resmi), supaya bisa diklik dan diwarnai menurut
// penduduk. Posisi tiap provinsi mengikuti letak aslinya: Sumatera diagonal
// barat laut–tenggara, Jawa memanjang di selatan, Kalimantan di tengah,
// Sulawesi di timur tengah, Nusa Tenggara di selatan, Maluku di timur, dan
// Papua di ujung timur. Label pulau ditulis di latar peta.
// Warna: lima tingkat menurut penduduk 2024 (data.js) — makin gelap makin
// banyak penduduk. Klik provinsi membuka detailnya (tautan hash yang sama
// dengan yang dipakai tabel provinsi).

import { PROVINCES } from './data.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// [nama, titik poligon "x,y x,y ...", label x, label y]
// Koordinat dalam viewBox 1000 x 470.
const SHAPES = [
  ['Aceh', '62,48 108,38 118,72 96,104 66,92', 90, 74],
  ['Sumatera Utara', '100,100 150,88 168,122 140,152 106,138', 134, 122, 'Sumut'],
  ['Sumatera Barat', '108,140 140,154 150,186 122,200 104,172', 127, 172, 'Sumbar'],
  ['Riau', '152,120 196,108 214,140 186,168 150,152', 183, 140],
  ['Kepulauan Riau', '220,148 238,144 242,160 226,168', 231, 158, 'Kepri'],
  ['Jambi', '150,190 190,178 206,204 176,224 148,212', 176, 202],
  ['Sumatera Selatan', '190,206 236,196 258,226 232,258 192,246', 223, 228, 'Sumsel'],
  ['Kep. Bangka Belitung', '262,230 280,226 284,242 266,248', 273, 238, 'Babel'],
  ['Bengkulu', '122,202 148,214 156,244 132,256 116,228', 136, 230],
  ['Lampung', '158,246 196,248 210,272 186,292 156,278', 183, 270],
  ['Banten', '330,332 372,330 378,356 340,360', 354, 347],
  ['DKI Jakarta', '382,330 396,328 398,340 384,342', 390, 337, 'DKI'],
  ['Jawa Barat', '378,342 452,340 458,360 384,362', 418, 353],
  ['Jawa Tengah', '458,332 530,330 534,360 460,362', 496, 348],
  ['DI Yogyakarta', '500,362 516,360 518,374 502,376', 509, 369, 'DIY'],
  ['Jawa Timur', '534,330 612,328 618,358 540,362', 576, 347],
  ['Bali', '624,344 656,342 660,356 628,358', 642, 352],
  ['Kalimantan Barat', '392,92 452,86 462,130 430,158 394,142', 427, 124, 'Kalbar'],
  ['Kalimantan Tengah', '462,130 520,120 532,170 500,205 452,190 448,152', 492, 164, 'Kalteng'],
  ['Kalimantan Selatan', '500,205 540,196 552,232 520,256 492,238', 522, 228, 'Kalsel'],
  ['Kalimantan Timur', '520,118 566,110 578,152 556,192 532,172', 551, 152, 'Kaltim'],
  ['Kalimantan Utara', '540,76 580,72 592,104 566,116 538,102', 565, 96, 'Kaltara'],
  ['Sulawesi Utara', '668,92 716,86 726,112 692,124 664,112', 696, 108, 'Sulut'],
  ['Gorontalo', '620,108 664,112 668,134 626,136', 644, 124],
  ['Sulawesi Tengah', '626,136 668,134 672,176 640,200 612,176', 644, 168, 'Sulteng'],
  ['Sulawesi Barat', '612,176 640,200 636,232 608,226', 623, 206, 'Sulbar'],
  ['Sulawesi Selatan', '636,232 664,226 676,262 652,292 624,272', 650, 260, 'Sulsel'],
  ['Sulawesi Tenggara', '676,262 700,252 712,282 690,300 664,282', 688, 276, 'Sultra'],
  ['Nusa Tenggara Barat', '664,344 700,342 704,358 668,360', 684, 352, 'NTB'],
  ['Nusa Tenggara Timur', '708,344 790,342 800,360 716,362', 754, 352, 'NTT'],
  ['Maluku Utara', '730,150 762,146 768,176 738,182', 749, 166],
  ['Maluku', '736,200 786,196 796,232 752,240 730,220', 762, 218],
  ['Papua Barat Daya', '806,140 852,136 858,164 816,170', 832, 154, 'PBD'],
  ['Papua Barat', '858,138 906,134 912,164 862,170', 885, 153],
  ['Papua', '912,132 984,128 992,168 940,180 916,164', 951, 154],
  ['Papua Tengah', '858,170 912,166 918,200 868,206', 884, 198],
  ['Papua Pegunungan', '918,168 966,172 962,206 920,204', 943, 180, 'P. Peg.'],
  ['Papua Selatan', '868,206 960,204 952,246 880,244', 914, 226],
];

// Siluet pulau (latar, bukan batas resmi) + label pulau.
const ISLANDS = [
  { points: '55,45 110,30 180,90 250,150 300,210 335,270 320,310 290,290 240,220 170,140 100,80', label: 'SUMATERA', x: 172, y: 50 },
  { points: '330,330 620,325 640,350 620,370 350,375 325,355', label: 'JAWA', x: 470, y: 392 },
  { points: '390,80 520,70 570,130 560,220 500,270 420,260 380,180 375,120', label: 'KALIMANTAN', x: 470, y: 60 },
  { points: '610,90 700,80 730,130 690,160 700,220 720,290 690,310 660,240 630,190 600,140', label: 'SULAWESI', x: 668, y: 60 },
  { points: '800,120 980,110 995,180 960,250 880,260 810,220 790,160', label: 'PAPUA', x: 890, y: 110 },
];

const TIERS = [
  { min: 25, fill: '#0b3d3a', text: '#ffffff' },
  { min: 10, fill: '#0f766e', text: '#ffffff' },
  { min: 5, fill: '#2a9d8f', text: '#ffffff' },
  { min: 2, fill: '#8ecdc2', text: '#1c2b2a' },
  { min: 0, fill: '#d7ece8', text: '#1c2b2a' },
];

function tierFor(pop) {
  return TIERS.find((t) => pop >= t.min) || TIERS[TIERS.length - 1];
}

export function provinceMapSVG(selectedName) {
  const byName = new Map(PROVINCES.map((p) => [p.name, p]));
  let s = `<svg viewBox="0 0 1000 470" role="img" aria-label="Peta skematik 38 provinsi Indonesia, diwarnai menurut jumlah penduduk" class="prov-map">`;
  for (const is of ISLANDS) {
    s += `<polygon points="${is.points}" class="island"/><text x="${is.x}" y="${is.y}" class="island-label" text-anchor="middle">${is.label}</text>`;
  }
  s += `<text x="730" y="330" class="island-label" text-anchor="middle">NUSA TENGGARA</text>`;
  s += `<text x="760" y="130" class="island-label" text-anchor="middle">MALUKU</text>`;
  for (const [name, points, lx, ly, short] of SHAPES) {
    const p = byName.get(name);
    if (!p) continue;
    const t = tierFor(p.pop);
    const sel = name === selectedName;
    const href = `#/provinsi?pilih=${encodeURIComponent(name)}`;
    s += `<a href="${href}" class="prov-link${sel ? ' selected' : ''}"><polygon points="${points}" fill="${t.fill}"${sel ? ' stroke="#b45309" stroke-width="4"' : ' stroke="#faf7f0" stroke-width="2"'}><title>${esc(name)} — sekitar ${esc(String(p.pop).replace('.', ','))} juta jiwa (2024)</title></polygon><text x="${lx}" y="${ly}" class="prov-label" fill="${t.text}" text-anchor="middle">${esc(short || name)}</text></a>`;
  }
  s += '</svg>';
  return s;
}

export function mapLegend() {
  return `<ul class="map-legend" aria-label="Legenda warna peta">${TIERS.map((t, i) => {
    const label = i === 0 ? '25 jt ke atas' : i === 1 ? '10–25 jt' : i === 2 ? '5–10 jt' : i === 3 ? '2–5 jt' : 'di bawah 2 jt';
    return `<li><span class="swatch" style="background:${t.fill}"></span>${label}</li>`;
  }).join('')}</ul>`;
}
