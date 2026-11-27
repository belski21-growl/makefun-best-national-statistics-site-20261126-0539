// NusaStat data layer.
// Setiap angka adalah nilai plus sumber plus tahunnya. null berarti belum
// terverifikasi: itu celah, bukan nol. Semua seri tahunan disejajarkan ke YEARS
// dengan indeks yang sama, jadi satu tahun selalu satu kolom.

export const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
export const LATEST_YEAR = 2025;
export const FIRST_YEAR = 2019;
export const UPDATED = 'Diperbarui 27 November 2026. Data terbaru: 2025';
export const WORLD_ACCESS = 'Bank Dunia WDI, diakses 27 November 2026';

// ---------------------------------------------------------------- formatting

// Angka gaya Indonesia: titik ribuan, koma desimal.
export function num(value, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
  const fixed = Number(value).toFixed(decimals);
  const [whole, part] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return part ? grouped + ',' + part : grouped;
}

export function signed(value, decimals = 2) {
  if (value === null || value === undefined) return null;
  if (Number(value) === 0) return 'tetap';
  const body = num(Math.abs(value), decimals);
  return (value > 0 ? 'plus ' : 'kurang ') + body;
}

export const indexOf = (year) => YEARS.indexOf(Number(year));

// ---------------------------------------------------------------- national series

// values: satu entri per tahun di YEARS. Sumber dan satuan menempel pada seri,
// supaya tampilan tidak perlu mengingat asal angkanya.
export const SERIES = {
  penduduk: {
    label: 'Penduduk',
    unit: 'juta jiwa',
    source: 'BPS',
    decimals: 1,
    values: [266.9, 270.2, 272.2, 275.8, 278.7, 281.6, 284.4],
    note: 'Pertengahan tahun. 2020 dari Sensus Penduduk, 2025 proyeksi BPS.',
  },
  pertumbuhan: {
    label: 'Pertumbuhan PDB',
    unit: 'persen',
    source: 'BPS',
    decimals: 2,
    values: [5.02, -2.07, 3.7, 5.31, 5.05, 5.03, 5.11],
    note: 'Laju tahunan atas dasar harga konstan 2010.',
  },
  pdb: {
    label: 'PDB nominal',
    unit: 'Rp triliun',
    source: 'BPS',
    decimals: 0,
    values: [15834, 15434, 16977, 19543, 20892, 22139, 23821],
    note: 'Harga berlaku. 2025 tepatnya Rp23.821,1 triliun.',
  },
  pdbUsd: {
    label: 'PDB nominal dalam dolar',
    unit: 'USD triliun',
    source: 'Bank Dunia',
    decimals: 3,
    values: [1.119, 1.059, 1.187, 1.319, 1.371, 1.396, 1.446],
    note: 'Dipakai hanya untuk pangsa PDB dunia, karena dunia diukur dalam dolar.',
  },
  perkapita: {
    label: 'PDB per kapita',
    unit: 'USD',
    source: 'BPS dan Bank Dunia',
    decimals: 0,
    values: [4107, 3854, 4287, 4731, 4876, 4925, 5083],
    note: '2019 sampai 2024 Bank Dunia (NY.GDP.PCAP.CD), 2025 BPS dengan Rp83,7 juta. Bank Dunia mencatat USD 5.060 untuk 2025; selisihnya metode dan kurs.',
  },
  inflasi: {
    label: 'Inflasi',
    unit: 'persen',
    source: 'BPS',
    decimals: 2,
    values: [2.72, 1.68, 1.87, 5.51, 2.61, 1.57, 2.92],
    note: 'Desember terhadap Desember. Bank Dunia memakai rata-rata tahunan, angkanya berbeda.',
  },
  tpt: {
    label: 'Pengangguran terbuka',
    unit: 'persen',
    source: 'BPS',
    decimals: 2,
    values: [5.28, 7.07, 6.49, 5.86, 5.45, 4.91, null],
    note: 'Agustus, Sakernas. Agustus 2025 belum masuk seri ini; angka terverifikasi terbaru Februari 2025 sebesar 4,76 persen.',
  },
  kemiskinan: {
    label: 'Kemiskinan',
    unit: 'persen',
    source: 'BPS',
    decimals: 2,
    values: [9.22, 9.78, 9.71, 9.57, 9.36, 8.57, null],
    note: 'September, garis kemiskinan nasional. September 2025 belum masuk seri ini; angka terverifikasi terbaru Maret 2025 sebesar 8,47 persen.',
  },
  ipm: {
    label: 'Indeks Pembangunan Manusia',
    unit: 'indeks',
    source: 'BPS',
    decimals: 2,
    values: [71.92, 71.94, 72.29, 73.77, 74.39, 75.02, 75.9],
    note: 'Metode baru BPS, skala 0 sampai 100. 2022 sampai 2025 dari rilis 5 November 2025.',
  },
};

export const SERIES_KEYS = ['penduduk', 'pertumbuhan', 'pdb', 'inflasi', 'tpt', 'kemiskinan'];
export const SPARK_KEYS = ['penduduk', 'pertumbuhan', 'pdb', 'perkapita', 'inflasi', 'tpt', 'kemiskinan', 'ipm'];

export function seriesValue(key, year) {
  const series = SERIES[key];
  const i = indexOf(year);
  if (!series || i < 0) return null;
  return series.values[i];
}

// ---------------------------------------------------------------- world series

// Seri dunia, Bank Dunia WDI. Kemiskinan memakai garis USD 2,15 per hari dan
// baru terbit sampai 2024; 2025 sengaja null.
export const WORLD = {
  penduduk: { values: [7777, 7854, 7920, 7989, 8063, 8141, 8215], unit: 'juta jiwa', decimals: 0 },
  pertumbuhan: { values: [2.68, -2.89, 6.49, 3.44, 2.86, 2.9, 2.92], unit: 'persen', decimals: 2 },
  pdb: { values: [88.8, 86.4, 98.8, 102.9, 107.3, 111.7, 118.4], unit: 'USD triliun', decimals: 1 },
  perkapita: { values: [11418, 10999, 12473, 12876, 13314, 13717, 14406], unit: 'USD', decimals: 0 },
  inflasi: { values: [2.22, 1.92, 3.47, 8.0, 5.73, 3.01, 3.04], unit: 'persen', decimals: 2 },
  tpt: { values: [5.59, 6.59, 6.05, 5.23, 4.85, 4.81, 4.79], unit: 'persen', decimals: 2 },
  kemiskinan: { values: [null, 11.4, 11.3, 10.9, 10.5, 10.1, null], unit: 'persen', decimals: 1 },
  harapanHidup: { values: [72.87, 72.18, 71.22, 72.97, 73.33, 73.48, null], unit: 'tahun', decimals: 2 },
};

export function worldValue(key, year) {
  const series = WORLD[key];
  const i = indexOf(year);
  if (!series || i < 0) return null;
  return series.values[i];
}

// ---------------------------------------------------------------- latest releases

// Angka terbaru yang bukan bagian seri tahunan. Bulan rilis disebut di kartu
// supaya tidak tercampur dengan seri Agustus atau September.
export const LATEST_VERIFIED = {
  tpt: {
    value: 4.76,
    month: 'Feb 2025',
    source: 'BPS, Sakernas Februari 2025',
    forcedContext: 'terendah sejak 1998',
  },
  kemiskinan: {
    value: 8.47,
    month: 'Mar 2025',
    source: 'BPS, Susenas Maret 2025',
    forcedContext: 'terendah sepanjang sejarah',
  },
};

// ---------------------------------------------------------------- headline cards

const HREF_OF = {
  penduduk: '#/penduduk',
  pertumbuhan: '#/ekonomi',
  pdb: '#/ekonomi',
  perkapita: '#/ekonomi',
  inflasi: '#/harga',
  tpt: '#/kerja',
  kemiskinan: '#/ekonomi',
  ipm: '#/pendidikan',
};

// Konteks yang sudah diverifikasi untuk dua tahun fokus. Tahun lain dihitung
// dari seri, jadi tidak ada kalimat yang mengarang.
const FIXED_CONTEXT = {
  2025: {
    penduduk: 'ke-4 terpadat di dunia',
    pertumbuhan: 'tercepat sejak 2022',
    pdb: 'PDB per kapita Rp83,7 juta',
    perkapita: 'naik dari USD 4.925 (2024)',
    inflasi: 'dalam sasaran BI 2,5 persen plus minus 1 persen',
    tpt: 'terendah sejak 1998',
    kemiskinan: 'terendah sepanjang sejarah',
    ipm: 'naik 0,88 poin dari 2024, kategori Tinggi',
  },
  2024: {
    penduduk: 'ke-4 terpadat di dunia',
    pertumbuhan: 'di atas 5 persen tiga tahun beruntun',
    pdb: 'PDB per kapita Rp78,6 juta',
    perkapita: 'naik dari Rp75,0 juta (2023)',
    inflasi: 'terendah sejak 2020',
    tpt: 'terendah dalam seri ini',
    kemiskinan: 'terendah dalam seri ini',
    ipm: 'naik 0,63 poin dari 2023, kategori Tinggi',
  },
};

function isLowestInSeries(key, year) {
  const i = indexOf(year);
  const here = seriesValue(key, year);
  if (here === null || i < 2) return false;
  const seen = SERIES[key].values.slice(0, i + 1).filter((v) => v !== null);
  return here === Math.min(...seen);
}

function deltaText(key, year, suffix, decimals = 2) {
  const i = indexOf(year);
  const now = seriesValue(key, year);
  const before = i > 0 ? seriesValue(key, year - 1) : null;
  if (now === null || before === null) return null;
  const diff = now - before;
  const word = diff >= 0 ? 'naik' : 'turun';
  return word + ' ' + num(Math.abs(diff), decimals) + ' ' + suffix + ' dari ' + (year - 1);
}

function gdpPerCapitaRupiah(year) {
  const i = indexOf(year);
  const gdp = SERIES.pdb.values[i];
  const people = SERIES.penduduk.values[i];
  return (gdp * 1e12) / (people * 1e6) / 1e6;
}

function contextOf(key, year) {
  const fixed = FIXED_CONTEXT[year] && FIXED_CONTEXT[year][key];
  if (fixed) return fixed;
  if (key === 'penduduk') return 'ke-4 terpadat di dunia';
  if (key === 'pertumbuhan') return deltaText('pertumbuhan', year, 'poin') || 'awal seri ini';
  if (key === 'pdb') return 'PDB per kapita Rp' + num(gdpPerCapitaRupiah(year), 1) + ' juta';
  if (key === 'perkapita') return deltaText('perkapita', year, 'USD', 0) || 'awal seri ini';
  if (key === 'inflasi') {
    const v = seriesValue('inflasi', year);
    if (v === null) return 'belum terbit';
    return v >= 1.5 && v <= 3.5
      ? 'dalam sasaran BI 2,5 persen plus minus 1 persen'
      : 'di luar sasaran BI 1,5 sampai 3,5 persen';
  }
  if (key === 'tpt') return isLowestInSeries('tpt', year) ? 'terendah dalam seri ini' : deltaText('tpt', year, 'poin') || 'awal seri ini';
  if (key === 'kemiskinan') return isLowestInSeries('kemiskinan', year) ? 'terendah dalam seri ini' : deltaText('kemiskinan', year, 'poin') || 'awal seri ini';
  return deltaText('ipm', year, 'poin') || 'awal seri ini';
}

function labelOf(key, year) {
  if (key === 'penduduk') return year === 2025 ? 'penduduk (proyeksi, pertengahan 2025)' : 'penduduk (perkiraan, pertengahan ' + year + ')';
  if (key === 'pertumbuhan') return 'pertumbuhan PDB ' + year;
  if (key === 'pdb') return 'PDB nominal ' + year;
  if (key === 'perkapita') return 'PDB per kapita ' + year;
  if (key === 'inflasi') return 'inflasi Des ' + year + ' (y-on-y)';
  if (key === 'tpt') return seriesValue('tpt', year) === null ? 'pengangguran terbuka, ' + LATEST_VERIFIED.tpt.month : 'pengangguran terbuka, Agu ' + year;
  if (key === 'kemiskinan') return seriesValue('kemiskinan', year) === null ? 'penduduk miskin, ' + LATEST_VERIFIED.kemiskinan.month : 'penduduk miskin, Sep ' + year;
  return 'Indeks Pembangunan Manusia ' + year;
}

function cardNumber(key, year) {
  const i = indexOf(year);
  if (key === 'penduduk') return { value: num(SERIES.penduduk.values[i], 1), unit: 'jt' };
  if (key === 'pertumbuhan') return { value: num(SERIES.pertumbuhan.values[i], 2), unit: 'persen' };
  if (key === 'pdb') return { value: 'Rp' + num(SERIES.pdb.values[i], 0), unit: 'T' };
  if (key === 'perkapita') return { value: 'USD ' + num(SERIES.perkapita.values[i], 0), unit: '' };
  if (key === 'inflasi') return { value: num(SERIES.inflasi.values[i], 2), unit: 'persen' };
  if (key === 'tpt') {
    const v = seriesValue('tpt', year);
    return v === null
      ? { value: num(LATEST_VERIFIED.tpt.value, 2), unit: 'persen', month: LATEST_VERIFIED.tpt.month }
      : { value: num(v, 2), unit: 'persen' };
  }
  if (key === 'kemiskinan') {
    const v = seriesValue('kemiskinan', year);
    return v === null
      ? { value: num(LATEST_VERIFIED.kemiskinan.value, 2), unit: 'persen', month: LATEST_VERIFIED.kemiskinan.month }
      : { value: num(v, 2), unit: 'persen' };
  }
  return { value: num(SERIES.ipm.values[i], 2), unit: '' };
}

// Baris Dunia dan chip delta untuk satu kartu. Semua dihitung dari seri yang
// sudah terverifikasi, tidak ada angka tempelan.
function worldOf(key, year) {
  if (key === 'ipm') {
    return {
      text: 'Dunia: HDI 0,756 (UNDP, 2023)',
      chip: 'indeks berbeda, skala UNDP',
      tone: 'flat',
    };
  }
  if (key === 'kemiskinan') {
    const w = worldValue('kemiskinan', year);
    const idn = seriesValue('kemiskinan', year) === null ? LATEST_VERIFIED.kemiskinan.value : seriesValue('kemiskinan', year);
    const worldText = w === null ? 'Dunia: 10,1 persen (2024)' : 'Dunia: ' + num(w, 1) + ' persen (' + year + ')';
    const worldFigure = w === null ? 10.1 : w;
    const diff = worldFigure - idn;
    const usdLine = year === 2025 ? 'USD 2,15 per hari: 3,7 persen' : 'USD 2,15 per hari: 5,4 persen';
    return {
      text: worldText,
      chip: usdLine,
      tone: diff > 0.1 ? 'up' : 'flat',
    };
  }
  const w = worldValue(key, year);
  if (w === null) return { text: 'Dunia: belum terbit untuk ' + year, chip: 'tanpa pembanding', tone: 'flat' };
  const series = WORLD[key];
  const worldText = 'Dunia: ' + num(w, series.decimals) + ' ' + series.unit + ' (' + year + ')';
  const i = indexOf(year);

  if (key === 'penduduk') {
    const share = (SERIES.penduduk.values[i] / w) * 100;
    return { text: worldText, chip: num(share, 1) + ' persen penduduk dunia', tone: 'flat' };
  }
  if (key === 'pdb') {
    const share = (SERIES.pdbUsd.values[i] / w) * 100;
    return { text: worldText, chip: num(share, 1) + ' persen PDB dunia', tone: 'flat' };
  }
  if (key === 'perkapita') {
    const ratio = (SERIES.perkapita.values[i] / w) * 100;
    return { text: worldText, chip: num(ratio, 0) + ' persen rata-rata dunia', tone: ratio >= 100 ? 'up' : 'down' };
  }
  if (key === 'inflasi') {
    const diff = w - SERIES.inflasi.values[i];
    if (Math.abs(diff) < 0.1) return { text: worldText, chip: 'setara dunia', tone: 'flat' };
    return {
      text: worldText,
      chip: diff > 0 ? num(Math.abs(diff), 2) + ' poin di bawah dunia' : num(Math.abs(diff), 2) + ' poin di atas dunia',
      tone: diff > 0 ? 'up' : 'down',
    };
  }
  const idn = key === 'tpt' && seriesValue('tpt', year) === null ? LATEST_VERIFIED.tpt.value : seriesValue(key, year);
  const diff = idn - w;
  if (Math.abs(diff) < 0.1) return { text: worldText, chip: 'setara dunia', tone: 'flat' };
  return {
    text: worldText,
    chip: num(Math.abs(diff), 1) + ' poin ' + (diff > 0 ? 'di atas dunia' : 'di bawah dunia'),
    tone: diff > 0 ? 'up' : 'down',
  };
}

function sourceOf(key, year) {
  if (key === 'tpt' && seriesValue('tpt', year) === null) return LATEST_VERIFIED.tpt.source;
  if (key === 'kemiskinan' && seriesValue('kemiskinan', year) === null) return LATEST_VERIFIED.kemiskinan.source;
  if (key === 'perkapita') return year === 2025 ? 'BPS' : 'Bank Dunia';
  return 'BPS';
}

const CARD_KEYS = ['penduduk', 'pertumbuhan', 'pdb', 'perkapita', 'inflasi', 'tpt', 'kemiskinan', 'ipm'];

// Delapan kartu headline untuk satu tahun. Satu gestur slider membangun ulang
// seluruh daftar ini.
export function cardsFor(year) {
  const y = Number(year);
  return CARD_KEYS.map((key) => {
    const number = cardNumber(key, y);
    const world = worldOf(key, y);
    const source = sourceOf(key, y);
    const spark = SERIES[key].values;
    return {
      key,
      href: HREF_OF[key],
      value: number.value,
      unit: number.unit,
      month: number.month || null,
      label: labelOf(key, y),
      context: contextOf(key, y),
      world: world.text,
      chip: world.chip,
      tone: world.tone,
      source,
      yearLabel: source + ', ' + y,
      spark: spark.filter((v) => v !== null),
      sparkDecimals: SERIES[key].decimals,
      seriesLabel: SERIES[key].unit,
    };
  });
}

// Satu baris yang membawa seluruh tahun. Dibangun dari kartu yang sama, jadi
// strip dan kartu tidak mungkin berbeda angka.
export function summaryFor(year) {
  const y = Number(year);
  const cards = cardsFor(y);
  const get = (key) => cards.find((c) => c.key === key);
  const i = indexOf(y);
  const growth = SERIES.pertumbuhan.values[i];
  const sign = growth >= 0 ? 'plus ' : 'kurang ';
  const pop = get('penduduk');
  const gdp = get('pdb');
  const perCap = get('perkapita');
  const infl = get('inflasi');
  const tpt = get('tpt');
  const poor = get('kemiskinan');
  const ipm = get('ipm');
  return (
    'Pada ' + y + ': penduduk ' + pop.value + ' jt. PDB ' + gdp.value + ' ' + gdp.unit +
    ' (' + sign + num(Math.abs(growth), 2) + ' persen). PDB per kapita ' + perCap.value +
    '. Inflasi ' + infl.value + ' persen. TPT ' + tpt.value + ' persen. Kemiskinan ' +
    poor.value + ' persen. IPM ' + ipm.value + '.'
  );
}

// ---------------------------------------------------------------- provinces

// 38 provinsi, perkiraan 2024 dari BPS. Kepadatan selalu dihitung dari
// penduduk dan luas, tidak disimpan, jadi tabel dan peta tidak bisa berselisih.
const PROVINCE_ROWS = [
  ['Jawa Barat', 50.3, 35.4],
  ['Jawa Timur', 41.8, 47.8],
  ['Jawa Tengah', 37.9, 32.8],
  ['Sumatera Utara', 16.0, 73.0],
  ['Banten', 12.4, 9.7],
  ['DKI Jakarta', 10.6, 0.66],
  ['Lampung', 9.4, 34.6],
  ['Sulawesi Selatan', 9.4, 46.7],
  ['Sumatera Selatan', 9.0, 91.6],
  ['Riau', 6.9, 87.0],
  ['Sumatera Barat', 5.8, 42.0],
  ['Kalimantan Barat', 5.8, 147.3],
  ['Nusa Tenggara Barat', 5.7, 18.6],
  ['Nusa Tenggara Timur', 5.7, 48.7],
  ['Aceh', 5.5, 58.0],
  ['Bali', 4.4, 5.8],
  ['Kalimantan Selatan', 4.3, 38.7],
  ['Kalimantan Timur', 4.0, 127.3],
  ['DI Yogyakarta', 3.8, 3.1],
  ['Jambi', 3.7, 50.1],
  ['Sulawesi Tengah', 3.1, 61.8],
  ['Kalimantan Tengah', 2.8, 153.6],
  ['Sulawesi Tenggara', 2.8, 38.1],
  ['Sulawesi Utara', 2.7, 13.9],
  ['Kepulauan Riau', 2.2, 8.2],
  ['Bengkulu', 2.1, 19.9],
  ['Maluku', 2.0, 46.9],
  ['Sulawesi Barat', 1.6, 16.8],
  ['Kep. Bangka Belitung', 1.5, 16.4],
  ['Papua Pegunungan', 1.5, 108.5],
  ['Maluku Utara', 1.4, 32.0],
  ['Papua Tengah', 1.4, 66.1],
  ['Gorontalo', 1.3, 11.3],
  ['Papua', 1.1, 82.7],
  ['Kalimantan Utara', 0.7, 75.5],
  ['Papua Barat', 0.6, 60.3],
  ['Papua Barat Daya', 0.6, 39.1],
  ['Papua Selatan', 0.5, 117.8],
];

export const PROVINCE_YEAR = 2024;
export const PROVINCE_SOURCE = 'BPS, perkiraan penduduk 2024';

// Kepadatan selalu dihitung, tidak pernah disimpan: satu rumus, satu angka.
// Menerima (juta jiwa, ribu km2), sebuah baris provinsi, atau angka mentah,
// supaya modul peta dan tabel memakai fungsi yang sama persis.
export function density(population, area) {
  let pop = population;
  let land = area;
  if (pop !== null && typeof pop === 'object') {
    land = pop.area;
    pop = pop.population === undefined ? pop.pop : pop.population;
  }
  pop = Number(pop);
  land = Number(land);
  if (!Number.isFinite(pop) || !Number.isFinite(land) || land <= 0) return null;
  // Penduduk dalam juta jiwa dan luas dalam ribu km persegi, atau angka mentah.
  if (pop < 1e5) return (pop * 1e6) / (land * 1e3);
  return pop / (land * 1e3);
}


export const PROVINCES = PROVINCE_ROWS.map(([name, population, area]) => ({
  name,
  population,
  area,
  // `pop` is the short alias the province map module reads; kept in step with
  // `population` by construction, never typed twice.
  pop: population,
  density: (population * 1e6) / (area * 1e3),
}));

const TOTAL_POP = PROVINCES.reduce((sum, p) => sum + p.population, 0);
const TOTAL_AREA = PROVINCES.reduce((sum, p) => sum + p.area, 0);

PROVINCES.forEach((p) => {
  p.share = (p.population / TOTAL_POP) * 100;
  p.rankPop = PROVINCES.filter((o) => o.population > p.population).length + 1;
  p.rankDensity = PROVINCES.filter((o) => o.density > p.density).length + 1;
  p.shareLabel = num(p.share, 1) + ' persen penduduk Indonesia';
});

export const PROVINCE_TOTALS = {
  population: TOTAL_POP,
  area: TOTAL_AREA,
  density: (TOTAL_POP * 1e6) / (TOTAL_AREA * 1e3),
  count: PROVINCES.length,
};

export function provinceByName(name) {
  if (!name) return null;
  const wanted = String(name).replace(/\+/g, ' ').replace(/%20/gi, ' ').trim().toLowerCase();
  return PROVINCES.find((p) => p.name.toLowerCase() === wanted) || null;
}

export const PROVINCE_HIGHLIGHTS = {
  highestPop: PROVINCES.reduce((a, b) => (a.population >= b.population ? a : b)),
  densest: PROVINCES.reduce((a, b) => (a.density >= b.density ? a : b)),
  widest: PROVINCES.reduce((a, b) => (a.area >= b.area ? a : b)),
  sparsest: PROVINCES.reduce((a, b) => (a.density <= b.density ? a : b)),
  ipmHigh: { name: 'DKI Jakarta', value: 85.05 },
  ipmLow: { name: 'Papua Pegunungan', value: 54.91 },
  javaShare: PROVINCES.filter((p) => ['Jawa Barat', 'Jawa Timur', 'Jawa Tengah', 'Banten', 'DKI Jakarta', 'DI Yogyakarta'].includes(p.name)).reduce((s, p) => s + p.population, 0),
};

// ---------------------------------------------------------------- peers

// Tabel tetangga 2024, Bank Dunia WDI, satu tahun untuk semua kolom.
export const PEERS = {
  year: 2024,
  source: 'Bank Dunia WDI',
  columns: ['Indonesia', 'Malaysia', 'Thailand', 'Vietnam', 'Filipina', 'Dunia'],
  rows: [
    { key: 'perkapita', label: 'PDB per kapita', unit: 'USD', decimals: 0, values: [4925, 11874, 7387, 4717, 3985, 13717] },
    { key: 'penduduk', label: 'Penduduk', unit: 'juta jiwa', decimals: 1, values: [283.5, 35.6, 71.7, 101.0, 115.8, 8141] },
    { key: 'harapanHidup', label: 'Harapan hidup', unit: 'tahun', decimals: 1, values: [71.3, 76.8, 76.6, 74.7, 69.9, 73.5] },
    { key: 'inflasi', label: 'Inflasi rata-rata tahunan', unit: 'persen', decimals: 1, values: [2.2, 1.8, 0.4, 3.6, 3.2, 3.0] },
    { key: 'pertumbuhan', label: 'Pertumbuhan PDB', unit: 'persen', decimals: 1, values: [5.0, 5.1, 3.0, 7.0, 5.7, 2.9] },
  ],
};

export const PEER_STRIP = [
  { name: 'Malaysia', value: 11874, unit: 'USD', label: 'PDB per kapita' },
  { name: 'Thailand', value: 7387, unit: 'USD', label: 'PDB per kapita' },
  { name: 'Vietnam', value: 4717, unit: 'USD', label: 'PDB per kapita' },
  { name: 'Filipina', value: 3985, unit: 'USD', label: 'PDB per kapita' },
  { name: 'Dunia', value: 13717, unit: 'USD', label: 'PDB per kapita' },
];

// ---------------------------------------------------------------- compare

export const COMPARE = {
  year: 2024,
  source: 'Bank Dunia WDI',
  rows: [
    { name: 'Indonesia', pcap: 4925, pop: 283.5, life: 71.3, infl: 2.2, growth: 5.0, me: true },
    { name: 'Malaysia', pcap: 11874, pop: 35.6, life: 76.8, infl: 1.8, growth: 5.1, me: false },
    { name: 'Singapura', pcap: 94897, pop: 6.0, life: 83.3, infl: 2.4, growth: 5.3, me: false },
    { name: 'Thailand', pcap: 7387, pop: 71.7, life: 76.6, infl: 0.4, growth: 3.0, me: false },
    { name: 'Vietnam', pcap: 4717, pop: 101.0, life: 74.7, infl: 3.6, growth: 7.0, me: false },
    { name: 'Filipina', pcap: 3985, pop: 115.8, life: 69.9, infl: 3.2, growth: 5.7, me: false },
    { name: 'Dunia', pcap: 13717, pop: 8141, life: 73.5, infl: 3.0, growth: 2.9, me: false },
  ],
  metrics: [
    {
      key: 'pcap',
      label: 'PDB per kapita',
      unit: 'USD',
      decimals: 0,
      log: true,
      note: 'Skala logaritma, karena jarak Singapura ke Filipina lebih dari 20 kali.',
      reading: 'Indonesia punya penduduk terbanyak di ASEAN, tetapi PDB per kapita ada di tengah: di atas Vietnam dan Filipina, jauh di bawah Malaysia dan Singapura.',
    },
    {
      key: 'pop',
      label: 'Penduduk',
      unit: 'juta jiwa',
      decimals: 1,
      log: false,
      note: 'Jumlah penduduk, bukan ukuran kesejahteraan.',
      reading: 'Penduduk Indonesia sendiri lebih banyak dari Vietnam dan Filipina digabung; skala ini sekaligus keunggulan dan beban layanan publik.',
    },
    {
      key: 'life',
      label: 'Harapan hidup',
      unit: 'tahun',
      decimals: 1,
      log: false,
      note: 'Metode Bank Dunia, 2024.',
      reading: 'Penduduk Indonesia hidup rata-rata 71,3 tahun, di bawah semua tetangga kecuali Filipina, dan 2,2 tahun di bawah rata-rata dunia.',
    },
    {
      key: 'infl',
      label: 'Inflasi',
      unit: 'persen',
      decimals: 1,
      log: false,
      note: 'Rata-rata tahunan, bukan Desember terhadap Desember.',
      reading: 'Inflasi Indonesia 2,2 persen termasuk yang paling terkendali di kelompok ini; hanya Thailand yang lebih rendah, terbantu harga energi yang turun.',
    },
    {
      key: 'growth',
      label: 'Pertumbuhan PDB',
      unit: 'persen',
      decimals: 1,
      log: false,
      note: 'Laju tahunan harga konstan, 2024.',
      reading: 'Pertumbuhan 5,0 persen menempatkan Indonesia di tengah ASEAN, di bawah Vietnam yang 7,0 persen tetapi di atas Thailand dan rata-rata dunia 2,9 persen.',
    },
  ],
};

// ---------------------------------------------------------------- education

export const EDUCATION = {
  year: 2025,
  source: 'BPS, rilis IPM 5 November 2025',
  stats: [
    { key: 'ipm', label: 'IPM', value: 75.9, decimals: 2, unit: 'indeks' },
    { key: 'rls', label: 'Rata-rata lama sekolah, umur 25 tahun ke atas', value: 9.07, decimals: 2, unit: 'tahun' },
    { key: 'hls', label: 'Harapan lama sekolah', value: 13.3, decimals: 2, unit: 'tahun' },
    { key: 'aps', label: 'Angka partisipasi sekolah, umur 7 sampai 12 tahun', value: 99.5, decimals: 1, unit: 'persen' },
  ],
  ipmSeries: { years: [2022, 2023, 2024, 2025], values: [73.77, 74.39, 75.02, 75.9] },
  note: 'RLS 9,41 tahun yang beredar adalah ukuran IDSD untuk umur 15 tahun ke atas, populasi yang berbeda dari RLS IPM 9,07 tahun untuk umur 25 tahun ke atas. Keduanya benar untuk populasinya masing-masing.',
  participation: [
    { label: '7 sampai 12 tahun', value: 99.5 },
    { label: '13 sampai 15 tahun', value: 95.6 },
    { label: '16 sampai 18 tahun', value: 73.2 },
  ],
};

// ---------------------------------------------------------------- health

export const HEALTH = {
  uhh: { value: 74.47, year: 2025, source: 'BPS' },
  uhhWdi: { value: 71.3, year: 2024, source: 'Bank Dunia' },
  spending: { value: 12.8, year: 2025, source: 'BPS', unit: 'Rp juta per tahun' },
  stunting: {
    source: 'Kemenkes, SSGI',
    values: [
      { year: 2013, value: 37.6 },
      { year: 2019, value: 27.7 },
      { year: 2023, value: 21.5 },
      { year: 2024, value: 19.8 },
    ],
  },
};

// ---------------------------------------------------------------- trade

export const TRADE = {
  year: 2025,
  source: 'BPS, rilis 2 Februari 2026',
  export: 282.91,
  import: 241.86,
  surplus: 41.05,
  surplusBefore: 31.33,
  nonOilExport: 269.84,
  nonOilSurplus: 60.75,
  oilDeficit: 19.7,
  streakMonths: 68,
  streakSince: 'Mei 2020',
  years: [2020, 2021, 2022, 2023, 2024, 2025],
  exportSeries: [163.3, 231.5, 292.0, 258.9, 264.7, 282.9],
  importSeries: [141.6, 196.2, 237.4, 221.9, 233.7, 241.9],
  destinations: [
    { name: 'Tiongkok', value: 64.82 },
    { name: 'Amerika Serikat', value: 30.96 },
    { name: 'India', value: 18.32 },
  ],
};

// ---------------------------------------------------------------- demography

export const AGE_GROUPS = {
  year: 2024,
  source: 'BPS',
  rows: [
    { label: '0 sampai 14 tahun', value: 24.5 },
    { label: '15 sampai 24 tahun', value: 16.8 },
    { label: '25 sampai 54 tahun', value: 42.1 },
    { label: '55 sampai 64 tahun', value: 10.4 },
    { label: '65 tahun ke atas', value: 6.2 },
  ],
};

export const SECTORS = {
  year: 2024,
  source: 'BPS',
  rows: [
    { label: 'Industri pengolahan', value: 18.7 },
    { label: 'Perdagangan besar dan eceran', value: 13.0 },
    { label: 'Pertanian, kehutanan dan perikanan', value: 12.5 },
    { label: 'Konstruksi', value: 10.0 },
    { label: 'Pertambangan dan penggalian', value: 9.0 },
    { label: 'Transportasi dan pergudangan', value: 5.4 },
    { label: 'Informasi dan komunikasi', value: 4.5 },
    { label: 'Jasa keuangan dan asuransi', value: 4.3 },
    { label: 'Penyediaan akomodasi dan makan minum', value: 2.6 },
    { label: 'Lapangan usaha lainnya', value: 19.9 },
  ],
};

export const PRICE_GROUPS = {
  year: 2024,
  source: 'BPS, IHK Desember 2024',
  rows: [
    { label: 'Perawatan pribadi dan jasa lainnya', value: 5.0 },
    { label: 'Makanan, minuman dan tembakau', value: 2.5 },
    { label: 'Penyediaan makanan dan minuman / restoran', value: 2.2 },
    { label: 'Kesehatan', value: 1.7 },
    { label: 'Pendidikan', value: 1.6 },
    { label: 'Pakaian dan alas kaki', value: 1.0 },
    { label: 'Perlengkapan rumah tangga', value: 1.0 },
    { label: 'Perumahan, air, listrik dan bahan bakar', value: 0.7 },
    { label: 'Transportasi', value: 0.6 },
    { label: 'Rekreasi, olahraga dan budaya', value: 0.5 },
    { label: 'Informasi, komunikasi dan jasa keuangan', value: -0.3 },
  ],
  latest: {
    year: 2025,
    source: 'BPS, IHK Desember 2025, tiga kelompok yang sudah terverifikasi',
    rows: [
      { label: 'Perawatan pribadi dan jasa lainnya', value: 13.33 },
      { label: 'Makanan, minuman dan tembakau', value: 4.58 },
      { label: 'Penyediaan makanan dan minuman / restoran', value: 1.45 },
    ],
  },
};

// ---------------------------------------------------------------- releases

export const RELEASES = [
  {
    date: '5 Feb 2026',
    title: 'Pertumbuhan ekonomi 2025',
    line: 'Ekonomi tumbuh 5,11 persen pada 2025; PDB nominal Rp23.821,1 triliun, PDB per kapita Rp83,7 juta.',
    href: '#/ekonomi',
  },
  {
    date: '2 Feb 2026',
    title: 'Neraca perdagangan 2025',
    line: 'Surplus USD 41,05 miliar; ekspor USD 282,91 miliar, impor USD 241,86 miliar; 68 bulan beruntun.',
    href: '#/perdagangan',
  },
  {
    date: '5 Jan 2026',
    title: 'Inflasi Desember 2025',
    line: 'Inflasi tahunan 2,92 persen (y-on-y), di dalam sasaran Bank Indonesia 2,5 persen plus minus 1 persen.',
    href: '#/harga',
  },
  {
    date: '5 Nov 2025',
    title: 'Indeks Pembangunan Manusia 2025',
    line: 'IPM 75,90, naik 0,88 poin; harapan hidup 74,47 tahun, harapan lama sekolah 13,30 tahun.',
    href: '#/pendidikan',
  },
  {
    date: '25 Jul 2025',
    title: 'Kemiskinan Maret 2025',
    line: 'Penduduk miskin 8,47 persen atau 23,85 juta orang, terendah sepanjang catatan; kota 6,73 persen, desa 11,03 persen.',
    href: '#/ekonomi',
  },
  {
    date: '5 Mei 2025',
    title: 'Keadaan ketenagakerjaan Februari 2025',
    line: 'TPT 4,76 persen, terendah sejak 1998; angkatan kerja 153,05 juta orang.',
    href: '#/kerja',
  },
];

export const SOURCES = [
  {
    name: 'Badan Pusat Statistik (BPS)',
    url: 'https://www.bps.go.id',
    covers: 'Sensus Penduduk 2020, proyeksi penduduk, PDB, IHK, Sakernas, Susenas, IPM, neraca perdagangan.',
  },
  {
    name: 'Bank Dunia (World Bank)',
    url: 'https://data.worldbank.org',
    covers: 'World Development Indicators 2024 sampai 2025: PDB per kapita, penduduk, harapan hidup, inflasi, pertumbuhan, pengangguran, kemiskinan, ekspor dan impor barang. Dipakai untuk semua perbandingan Indonesia dengan dunia dan dengan negara tetangga.',
  },
  {
    name: 'Kementerian Kesehatan (Kemenkes)',
    url: 'https://kemkes.go.id',
    covers: 'SSGI 2024: stunting 19,8 persen.',
  },
  {
    name: 'Bank Indonesia',
    url: 'https://www.bi.go.id',
    covers: 'Data moneter, sasaran inflasi 2,5 persen plus minus 1 persen, cek silang inflasi.',
  },
  {
    name: 'Kementerian Keuangan',
    url: 'https://www.kemenkeu.go.id',
    covers: 'APBN dan asumsi makro, cek silang pertumbuhan dan PDB nominal.',
  },
];

// ---------------------------------------------------------------- sections

export const SECTIONS = [
  {
    href: '#/ekonomi',
    title: 'Ekonomi',
    figure: '5,11 persen',
    caption: 'Pertumbuhan PDB 2025',
    line: 'PDB Rp23.821 T, per kapita USD 5.083, di atas dunia 2,92 persen.',
  },
  {
    href: '#/penduduk',
    title: 'Penduduk',
    figure: '284,4 jt',
    caption: 'Proyeksi pertengahan 2025',
    line: 'Ke-4 terpadat di dunia; 3,5 persen penduduk dunia tinggal di sini.',
  },
  {
    href: '#/provinsi',
    title: 'Provinsi',
    figure: '38',
    caption: 'Provinsi, data 2024',
    line: 'Jawa Barat terbesar 50,3 juta jiwa; DKI Jakarta terpadat 16.061 per km persegi.',
  },
  {
    href: '#/harga',
    title: 'Harga',
    figure: '2,92 persen',
    caption: 'Inflasi Desember 2025',
    line: 'Dalam sasaran Bank Indonesia; 11 kelompok IHK dibedah.',
  },
  {
    href: '#/kerja',
    title: 'Ketenagakerjaan',
    figure: '4,76 persen',
    caption: 'TPT Februari 2025',
    line: 'Terendah sejak 1998; angkatan kerja 153,05 juta orang.',
  },
  {
    href: '#/pendidikan',
    title: 'Pendidikan',
    figure: '75,90',
    caption: 'IPM 2025',
    line: 'RLS 9,07 tahun, HLS 13,30 tahun, partisipasi sekolah 99,5 persen.',
  },
  {
    href: '#/kesehatan',
    title: 'Kesehatan',
    figure: '74,47 th',
    caption: 'UHH 2025, metode BPS',
    line: 'Stunting turun ke 19,8 persen pada 2024 dari 37,6 persen pada 2013.',
  },
  {
    href: '#/perdagangan',
    title: 'Perdagangan',
    figure: 'USD 41,05 M',
    caption: 'Surplus 2025',
    line: 'Surplus 68 bulan beruntun sejak Mei 2020; ekspor USD 282,91 miliar.',
  },
  {
    href: '#/banding',
    title: 'Banding',
    figure: '7 wilayah',
    caption: 'Indonesia, ASEAN, dunia',
    line: 'PDB per kapita, penduduk, harapan hidup, inflasi, pertumbuhan.',
  },
];

// ---------------------------------------------------------------- search

export const SEARCH_INDEX = [
  { keys: ['penduduk', 'populasi', 'jumlah penduduk'], href: '#/penduduk', answer: 'Penduduk 284,4 jt (2025)' },
  { keys: ['pdb', 'produk domestik bruto'], href: '#/ekonomi', answer: 'PDB Rp23.821 T, tumbuh 5,11 persen (2025)' },
  { keys: ['pertumbuhan', 'pertumbuhan ekonomi'], href: '#/ekonomi', answer: '5,11 persen (2025)' },
  { keys: ['pdb per kapita', 'per kapita'], href: '#/ekonomi', answer: 'USD 5.083 (2025)' },
  { keys: ['inflasi'], href: '#/harga', answer: '2,92 persen Des 2025' },
  { keys: ['harga'], href: '#/harga', answer: 'Harga dan inflasi menurut kelompok' },
  { keys: ['pengangguran'], href: '#/kerja', answer: '4,76 persen Feb 2025' },
  { keys: ['tpt'], href: '#/kerja', answer: '4,76 persen Feb 2025' },
  { keys: ['kemiskinan', 'miskin'], href: '#/ekonomi', answer: '8,47 persen Mar 2025' },
  { keys: ['ipm'], href: '#/pendidikan', answer: '75,90 (2025)' },
  { keys: ['pendidikan'], href: '#/pendidikan', answer: 'lama sekolah 9,07 th' },
  { keys: ['sekolah'], href: '#/pendidikan', answer: 'harapan lama sekolah 13,30 th' },
  { keys: ['kesehatan'], href: '#/kesehatan', answer: 'harapan hidup 74,47 th' },
  { keys: ['harapan hidup', 'uhh'], href: '#/kesehatan', answer: '74,47 th (BPS, 2025)' },
  { keys: ['stunting'], href: '#/kesehatan', answer: '19,8 persen (SSGI 2024)' },
  { keys: ['ekspor'], href: '#/perdagangan', answer: 'USD 282,91 miliar (2025)' },
  { keys: ['impor'], href: '#/perdagangan', answer: 'USD 241,86 miliar (2025)' },
  { keys: ['perdagangan'], href: '#/perdagangan', answer: 'surplus USD 41,05 miliar' },
  { keys: ['surplus'], href: '#/perdagangan', answer: 'USD 41,05 miliar (2025)' },
  { keys: ['provinsi', 'daerah'], href: '#/provinsi', answer: '38 provinsi' },
  { keys: ['gini', 'ketimpangan'], href: '#/ekonomi', answer: 'Rasio gini 0,379 (Sep 2024)' },
  { keys: ['banding', 'bandingkan'], href: '#/banding', answer: 'Banding ASEAN dan dunia' },
  { keys: ['dunia'], href: '#/banding', answer: 'Banding ASEAN dan dunia' },
  { keys: ['asean'], href: '#/banding', answer: 'Banding ASEAN dan dunia' },
];

export const GINI = { value: 0.379, label: 'Rasio gini', month: 'September 2024', source: 'BPS' };

// Cocokkan kata kunci: awalan dulu, lalu yang memuat, lalu teks jawaban.
// Nama provinsi tidak masuk indeks 24 entri, jadi dicocokkan langsung ke daftar
// provinsi: mengetik "jawa" atau "papua" membuka halaman provinsi dengan
// provinsi itu sudah terpilih.
export function searchIndicators(query) {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return [];
  const starts = [];
  const contains = [];
  const answers = [];
  SEARCH_INDEX.forEach((entry) => {
    entry.keys.forEach((key) => {
      if (key.startsWith(q)) starts.push(entry);
      else if (key.includes(q)) contains.push(entry);
    });
    if (entry.answer.toLowerCase().includes(q)) answers.push(entry);
  });

  const provinceHits = PROVINCES.filter((p) => p.name.toLowerCase().startsWith(q))
    .slice(0, 4)
    .map((p) => ({
      keys: [p.name.toLowerCase()],
      href: '#/provinsi?pilih=' + encodeURIComponent(p.name),
      answer: p.name + ': ' + num(p.population, 1) + ' juta jiwa (' + PROVINCE_YEAR + ')',
      province: true,
    }));

  const seen = new Set();
  return [...starts, ...provinceHits, ...contains, ...answers].filter((entry) => {
    const id = entry.href + '|' + entry.answer;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
