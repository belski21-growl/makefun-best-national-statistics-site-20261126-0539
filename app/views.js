// NusaStat views. Every route returns a string of HTML built from data.js,
// charts.js and map.js. No framework, no template language, no network.
//
// The home view is the dashboard: a year slider, a clickable 38 province map,
// eight KPI cards that re-base on the slider, two charts on the full 2019 to
// 2025 series, a nine card section explorer, the search box and the peer strip.

import {
  YEARS, LATEST_YEAR, UPDATED, WORLD_ACCESS,
  SERIES, SERIES_KEYS, SPARK_KEYS, WORLD,
  cardsFor, summaryFor, seriesValue, worldValue, num, signed,
  PROVINCES, PROVINCE_TOTALS, PROVINCE_YEAR, PROVINCE_SOURCE, PROVINCE_HIGHLIGHTS, provinceByName,
  PEERS, PEER_STRIP, LATEST_VERIFIED,
  EDUCATION, HEALTH, TRADE, AGE_GROUPS, SECTORS, PRICE_GROUPS,
  RELEASES, SOURCES, SECTIONS, SEARCH_INDEX, GINI, searchIndicators,
} from './data.js';
import { sparkline, dualLine, columns, line, horizontalBars, groupedColumns, shareBar, provinceRanks, escapeHTML as esc } from './charts.js';
import { provinceMapSVG, mapLegend } from './map.js';

// ------------------------------------------------------------------ small helpers

export { esc };

export function href(state, path, options = {}) {
  const params = new URLSearchParams();
  const year = options.year === undefined ? state.year : Number(options.year);
  if (YEARS.includes(year) && year !== LATEST_YEAR) params.set('tahun', String(year));
  if (options.province) params.set('pilih', options.province);
  if (options.metric && options.metric !== 'pop') params.set('metrik', options.metric);
  if (options.compareMetric && options.compareMetric !== 'pcap') params.set('ukur', options.compareMetric);
  const query = params.toString();
  return '#' + path + (query ? '?' + query : '');
}

export function pageHead({ crumbs, title, dek, stamp, actions, className }) {
  return (
    '<div class="page-head' + (className ? ' ' + className : '') + '">' +
    '<div>' +
    (crumbs ? '<p class="crumbs">' + crumbs + '</p>' : '') +
    '<h1>' + title + '</h1>' +
    (dek ? '<p class="dek">' + dek + '</p>' : '') +
    '</div>' +
    (stamp ? '<p class="stamp">' + stamp + '</p>' : '') +
    (actions || '') +
    '</div>'
  );
}

export function footnote(html) {
  return '<p class="footnote">' + html + '</p>';
}

function sectionHead(title, aside) {
  return '<div class="section-head"><h2>' + title + '</h2>' + (aside ? '<span class="aside">' + aside + '</span>' : '') + '</div>';
}

function statBlock({ value, unit, label, source, accent }) {
  return (
    '<div class="stat' + (accent ? ' is-accent' : '') + '">' +
    '<div class="stat-value">' + value + (unit ? ' <span class="u">' + unit + '</span>' : '') + '</div>' +
    '<div class="stat-label">' + label + '</div>' +
    (source ? '<div class="stat-src">' + source + '</div>' : '') +
    '</div>'
  );
}

function interpretation(text) {
  return '<p class="interpretation"><span class="tag">Bacaan</span>' + text + '</p>';
}

function nullNote(key) {
  const series = SERIES[key];
  return (
    '<div class="note"><p><strong>Soal angka kosong.</strong> ' + esc(series.note) +
    ' Di grafik, ' + LATEST_YEAR + ' digambar sebagai celah bertanda, bukan batang nol.</p></div>'
  );
}

// Every KPI card: value, label, context, one Dunia line with a delta chip,
// source plus year, and a link to its section. The sparkline sits on its own
// row under the value: at four columns a 150 px card cannot hold a 100 px chart
// beside a 20 px numeral without one of them overflowing, and r3 proved it.
function kpiCard(card) {
  const spark = card.spark && card.spark.length > 2
    ? sparkline(card.spark, { w: 104, h: 24, stroke: 2.4, color: card.key === 'pertumbuhan' ? 'var(--accent)' : 'var(--green-700)' })
    : '';
  const worldLine = card.chip && (card.chip.includes('persen') || card.chip.includes('poin') || card.chip.includes('setara'))
    ? '<span class="chip ' + card.tone + '">' + esc(card.chip) + '</span>'
    : '';
  return (
    '<article class="kpi' + (card.key === 'pertumbuhan' ? ' is-accent' : '') + '" data-kpi="' + card.key + '">' +
    '<div class="kpi-top"><span class="kpi-value">' + card.value +
    (card.unit ? '<span class="kpi-unit">' + esc(card.unit) + '</span>' : '') +
    '</span></div>' +
    (spark ? '<div class="kpi-spark">' + spark + '</div>' : '') +
    '<div class="kpi-label">' + esc(card.label) + (card.month && !card.label.includes(card.month) ? ' <span class="chip flat">' + esc(card.month) + '</span>' : '') + '</div>' +
    '<div class="kpi-ctx">' + esc(card.context) + '</div>' +
    '<div class="kpi-world">' + esc(card.world) + (worldLine ? ' ' + worldLine : '') + '</div>' +
    '<div class="kpi-foot"><span>' + esc(card.yearLabel) + '</span><a href="' + card.href + '">Bagian</a></div>' +
    '</article>'
  );
}

// ------------------------------------------------------------------ macro card

// The cover chart. Two series, one percentage axis, the focused year banded and
// both endpoint values labelled. The range toggle is held in ?rentang= so a
// copied link reproduces the exact view, the same rule the slider follows.
function macroCard(state) {
  const short = state.params && state.params.get('rentang') === 'pendek';
  const from = short ? 2021 : 2019;
  const slice = YEARS.map((y, i) => (y >= from ? i : -1)).filter((i) => i >= 0);
  const years = slice.map((i) => YEARS[i]);
  const growth = slice.map((i) => SERIES.pertumbuhan.values[i]);
  const inflasi = slice.map((i) => SERIES.inflasi.values[i]);

  const chart = dualLine({
    years,
    highlight: state.year >= from ? state.year : null,
    series: [
      { values: growth, className: 'is-growth' },
      { values: inflasi, className: 'is-cpi' },
    ],
    width: 640,
    height: 214,
    label: 'Pertumbuhan PDB dan inflasi Indonesia, ' + from + ' sampai 2025, persen',
  });

  const g = seriesValue('pertumbuhan', state.year);
  const c = seriesValue('inflasi', state.year);
  const gap = g === null || c === null ? null : g - c;
  const over = YEARS.filter((y) => {
    const gy = seriesValue('pertumbuhan', y);
    const cy = seriesValue('inflasi', y);
    return gy !== null && cy !== null && cy > gy;
  });

  return (
    '<div class="card macro-card">' +
    '<div class="macro-head">' +
    '<div><h3>Lintasan makro: ekonomi tumbuh di atas inflasi, ' + from + ' sampai 2025</h3>' +
    '<p class="card-sub">Dua garis, satu sumbu persen. Pertumbuhan riil melampaui inflasi di hampir setiap tahun. Tahun fokus ' + state.year + ' disorot. Sumber BPS.</p></div>' +
    '<div class="range-toggle" role="group" aria-label="Rentang tahun grafik">' +
    '<button type="button" data-range="panjang" aria-pressed="' + (short ? 'false' : 'true') + '">2019-2025</button>' +
    '<button type="button" data-range="pendek" aria-pressed="' + (short ? 'true' : 'false') + '">2021-2025</button>' +
    '</div>' +
    '</div>' +
    '<div class="macro-legend"><span class="lg lg-growth">Pertumbuhan PDB</span><span class="lg lg-cpi">Inflasi</span></div>' +
    chart +
    interpretation(
      gap === null
        ? 'Angka tahun ini belum lengkap.'
        : 'Pada ' + state.year + ' pertumbuhan ' + num(g, 2) + ' persen dan inflasi ' + num(c, 2) +
          ' persen, jadi pertumbuhan riil ' + (gap >= 0 ? 'di atas' : 'di bawah') + ' inflasi dengan selisih ' +
          num(Math.abs(gap), 2) + ' poin. Dari tujuh tahun, inflasi hanya melampaui pertumbuhan pada ' +
          (over.length === 0 ? 'tidak ada tahun' : over.join(' dan ')) + '.',
    ) +
    '</div>'
  );
}

// ------------------------------------------------------------------ province ranks

// Top six provinces beside the map. Same population table the map and the
// province page read, only sorted: no second source, no new figure.
function rankPanel(state) {
  const byDensity = state.params && state.params.get('urut') === 'padat';
  const rows = [...PROVINCES]
    .sort((a, b) => (byDensity ? b.density - a.density : b.population - a.population))
    .slice(0, 6)
    .map((p) => ({ name: p.name, value: byDensity ? p.density : p.population }));

  const bars = provinceRanks(rows, {
    label: byDensity ? 'Enam provinsi terpadat' : 'Enam provinsi terbesar menurut penduduk',
    decimals: byDensity ? 0 : 1,
    width: 420,
  });

  return (
    '<div class="rank-panel">' +
    '<div class="rank-head"><h3>Provinsi terbesar: Jawa Barat pimpin jumlah warga' + (byDensity ? ', Jakarta terpadat' : '') + '</h3>' +
    '<span class="aside">' + (byDensity ? 'jiwa per km2' : 'juta jiwa') + ', data ' + PROVINCE_YEAR + '</span></div>' +
    '<div class="rank-toggle" role="group" aria-label="Ukuran peringkat provinsi">' +
    '<button type="button" data-rank="pop" aria-pressed="' + (byDensity ? 'false' : 'true') + '">Penduduk</button>' +
    '<button type="button" data-rank="padat" aria-pressed="' + (byDensity ? 'true' : 'false') + '">Kepadatan</button>' +
    '</div>' +
    bars +
    '<p class="rank-note">Enam dari 38 provinsi, ' + (byDensity ? 'kepadatan dihitung dari penduduk dan luas' : 'penduduk ' + PROVINCE_YEAR + ', BPS') + '. <a href="' + href(state, '/provinsi') + '">Semua provinsi</a></p>' +
    '</div>'
  );
}

// ------------------------------------------------------------------ year slider

function yearControl(state) {
  const index = Math.max(0, YEARS.indexOf(state.year));
  const pct = (index / (YEARS.length - 1)) * 100;
  const pills = YEARS.map(
    (y) =>
      '<button type="button" data-year="' + y + '" aria-pressed="' + (y === state.year ? 'true' : 'false') + '">' + y + '</button>',
  ).join('');
  const ticks = YEARS.map((y) => '<span class="' + (y === state.year ? 'on' : '') + '">' + y + '</span>').join('');
  return (
    '<div class="year-control">' +
    '<div class="control-label"><label for="year-slider">Tahun fokus</label>' +
    '<span class="year-readout" id="year-readout">' + state.year + '</span></div>' +
    '<div class="slider-wrap">' +
    '<input class="year-slider" id="year-slider" type="range" min="' + YEARS[0] + '" max="' + YEARS[YEARS.length - 1] +
    '" step="1" value="' + state.year + '" style="--fill:' + pct + '%" aria-valuetext="Tahun ' + state.year +
    '" aria-describedby="year-hint">' +
    '<div class="slider-ticks" aria-hidden="true">' + ticks + '</div>' +
    '</div>' +
    '<div class="year-pills" role="group" aria-label="Pilih tahun cepat">' + pills + '</div>' +
    '<span class="hint" id="year-hint">Geser: delapan kartu dan ringkasan dihitung ulang.</span>' +
    '</div>'
  );
}

function searchControl() {
  return (
    '<div class="search-box">' +
    '<label for="indicator-search">Cari indikator</label>' +
    '<div class="search-field">' +
    '<input id="indicator-search" type="search" list="indicator-hints" placeholder="misal: inflasi, ipm, ekspor" autocomplete="off" enterkeyhint="go">' +
    '<datalist id="indicator-hints">' + SEARCH_INDEX.map((e) => '<option value="' + esc(e.keys[0]) + '"></option>').join('') + '</datalist>' +
    '<button type="button" id="search-go">Cari</button>' +
    '</div>' +
    '<div class="search-results" id="search-results" hidden></div>' +
    '</div>'
  );
}

// ------------------------------------------------------------------ map panel

// The map is a black box: provinceMapSVG returns markup whose links already go
// to #/provinsi?pilih=<name>. We only choose the metric and show the panel.
function mapPanel(state, options = {}) {
  const selected = provinceByName(state.province);
  let svg = '';
  try {
    svg = provinceMapSVG(state.province || '', state.metric);
  } catch (err) {
    svg = '<p class="muted small">Peta tidak dapat digambar di peramban ini.</p>';
  }
  let legend = '';
  try {
    legend = mapLegend(state.metric);
  } catch (err) {
    legend = '';
  }

  const detail = selected
    ? '<div class="prov-detail" id="prov-detail">' +
      '<h3>' + esc(selected.name) + '</h3>' +
      '<div class="prov-metrics">' +
      '<span>Penduduk<b>' + num(selected.population, 1) + ' juta</b></span>' +
      '<span>Luas<b>' + num(selected.area, 1) + ' ribu km2</b></span>' +
      '<span>Kepadatan<b>' + num(selected.density, 0) + ' per km2</b></span>' +
      '<span>Peringkat penduduk<b>ke-' + selected.rankPop + ' dari 38</b></span>' +
      '</div>' +
      '<p class="prov-hint">' + esc(selected.shareLabel) + '. Data ' + PROVINCE_YEAR + '. <a href="' + href(state, '/provinsi', { province: selected.name }) + '">Halaman provinsi</a></p>' +
      '</div>'
    : '<div class="prov-detail" id="prov-detail">' +
      '<h3>Pilih provinsi</h3>' +
      '<p class="prov-hint">Klik satu provinsi di peta untuk melihat penduduk, luas, dan kepadatannya. Pilihan tersimpan di alamat halaman.</p>' +
      '</div>';

  return (
    '<div class="map-panel">' +
    '<div class="map-panel-head"><h2>Peta 38 provinsi</h2><span class="aside">' +
    (options.aside || 'Klik provinsi, panel ikut berubah') + '</span></div>' +
    '<div class="map-toggle" role="group" aria-label="Ukuran peta">' +
    '<button type="button" data-metric="pop" aria-pressed="' + (state.metric === 'pop' ? 'true' : 'false') + '">Penduduk</button>' +
    '<button type="button" data-metric="density" aria-pressed="' + (state.metric === 'density' ? 'true' : 'false') + '">Kepadatan</button>' +
    '</div>' +
    '<div class="map-stage" id="map-stage">' + svg + '</div>' +
    legend +
    detail +
    '</div>'
  );
}

// ------------------------------------------------------------------ home

export function renderHome(state) {
  const cards = cardsFor(state.year);
  const summary = summaryFor(state.year);

  const growthSeries = SERIES.pertumbuhan.values;
  const popSeries = SERIES.penduduk.values;
  const growthNow = seriesValue('pertumbuhan', state.year);
  const popNow = seriesValue('penduduk', state.year);
  const worldGrowth = worldValue('pertumbuhan', state.year);

  const growthChart = columns({
    years: YEARS,
    values: growthSeries,
    highlight: state.year,
    decimals: 2,
    label: 'Pertumbuhan PDB Indonesia, 2019 sampai 2025, persen',
  });

  const popChart = line({
    years: YEARS,
    values: popSeries,
    highlight: state.year,
    decimals: 1,
    label: 'Penduduk Indonesia, 2019 sampai 2025, juta jiwa',
  });

  const explorer = SECTIONS.map(
    (s) =>
      '<a class="explore-card" href="' + href(state, s.href.replace('#', '')) + '">' +
      '<div class="ex-top"><span class="ex-title">' + esc(s.title) + '</span><span class="ex-fig">' + esc(s.figure) + '</span></div>' +
      '<div class="ex-cap">' + esc(s.caption) + '</div>' +
      '<p class="ex-line">' + esc(s.line) + '</p>' +
      '</a>',
  ).join('');

  const peerCells = PEER_STRIP.map(
    (p) =>
      '<div><div class="peer-label">' + esc(p.label) + '</div>' +
      '<div class="peer-name">' + esc(p.name) + '</div>' +
      '<div class="peer-val">USD ' + num(p.value, 0) + '</div></div>',
  ).join('');

  const idnPerCap = seriesValue('perkapita', state.year);

  return (
    pageHead({
      crumbs: 'Beranda',
      className: 'is-cover',
      title: 'Satu gestur, seluruh angka Indonesia',
      dek: 'Geser tahun, klik provinsi: delapan angka utama dan grafik makro ikut berubah.',
      stamp: UPDATED,
    }) +

    '<div class="dash">' +
    '<div class="dash-left">' +
    '<div class="control-row">' + yearControl(state) + searchControl() + '</div>' +
    '<div class="kpi-grid" id="kpi-grid" aria-live="polite" aria-label="Delapan angka utama tahun ' + state.year + '">' +
    cards.map(kpiCard).join('') +
    '</div>' +
    macroCard(state) +
    '<div class="summary-strip" id="summary-strip">' +
    '<span class="strip-tag">Ringkasan ' + state.year + '</span>' +
    '<span class="strip-text">' + esc(summary) + '</span>' +
    '</div>' +
    '</div>' +
    '<div class="dash-right">' +
    mapPanel(state, { aside: 'Peta 38 provinsi, data ' + PROVINCE_YEAR }) +
    rankPanel(state) +
    '</div>' +
    '</div>' +

    '<div class="chart-pair">' +
    '<div class="card">' +
    '<h3>Ekonomi pulih dan bertahan di kisaran lima persen, 2019 sampai 2025</h3>' +
    '<p class="card-sub">Persen, tahunan. Hanya 2020 menyusut akibat pandemi; tahun ' + state.year + ' disorot. Sumber BPS.</p>' +
    growthChart +
    interpretation(
      growthNow === null
        ? 'Data tahun ini belum terbit.'
        : 'Pada ' + state.year + ' ekonomi tumbuh ' + num(growthNow, 2) + ' persen, ' +
          (worldGrowth === null ? 'tanpa pembanding dunia untuk tahun ini' : num(growthNow - worldGrowth, 2) + ' poin ' + (growthNow >= worldGrowth ? 'di atas' : 'di bawah') + ' rata-rata dunia ' + num(worldGrowth, 2) + ' persen') +
          '. Satu-satunya tahun yang menyusut adalah 2020, minus 2,07 persen, akibat pandemi.',
    ) +
    '</div>' +
    '<div class="card">' +
    '<h3>Penduduk bertambah hampir 18 juta jiwa dalam enam tahun, 2019 sampai 2025</h3>' +
    '<p class="card-sub">Juta jiwa, pertengahan tahun. Laju pertambahan stabil; titik ' + state.year + ' disorot. Sumber BPS.</p>' +
    popChart +
    interpretation(
      'Penduduk bertambah ' + num(popSeries[popSeries.length - 1] - popSeries[0], 1) + ' juta jiwa dalam enam tahun, dari ' +
      num(popSeries[0], 1) + ' juta pada 2019 ke ' + num(popSeries[popSeries.length - 1], 1) +
      ' juta pada 2025; pada ' + state.year + ' angkanya ' + num(popNow, 1) + ' juta jiwa.',
    ) +
    '</div>' +
    '</div>' +

    '<div class="note"><p><strong>Grafik tidak ikut bergeser.</strong> Slider menghitung ulang delapan kartu dan strip ringkasan. Kedua grafik sengaja tetap menampilkan seri penuh 2019 sampai 2025 dengan tahun fokus disorot, supaya bentuk trennya tidak hilang saat satu tahun dipilih.</p></div>' +

    sectionHead('Jelajah bagian', 'Sembilan topik, satu angka kunci masing-masing') +
    '<div class="explorer">' + explorer + '</div>' +

    sectionHead('Indonesia dan tetangga', 'PDB per kapita ' + PEERS.year + ', ' + PEERS.source) +
    '<div class="peer-strip">' +
    '<div class="peer-lead"><div class="peer-label">PDB per kapita ' + state.year + '</div>' +
    '<div class="peer-name">Indonesia</div><div class="peer-val">USD ' + num(idnPerCap, 0) + '</div></div>' +
    peerCells +
    '</div>' +
    '<div class="btn-row">' +
    '<a class="btn" href="' + href(state, '/banding') + '">Banding lengkap, lima ukuran</a>' +
    '<a class="btn ghost" href="' + href(state, '/data') + '">Data dan unduhan</a>' +
    '</div>' +

    footnote(
      '<strong>Sumber:</strong> Badan Pusat Statistik untuk seluruh seri nasional; Bank Dunia WDI untuk baris dunia dan perbandingan (' + WORLD_ACCESS + '). ' +
      'Angka penduduk BPS dan Bank Dunia berbeda karena metode: proyeksi antar sensus versus estimasi PBB. Keduanya dicantumkan dengan label masing-masing.',
    )
  );
}

// ------------------------------------------------------------------ ekonomi

export function renderEconomy(state) {
  const y = state.year;
  const cards = cardsFor(y);
  const growth = seriesValue('pertumbuhan', y);
  const gdp = seriesValue('pdb', y);
  const perCap = seriesValue('perkapita', y);
  const worldGrowth = worldValue('pertumbuhan', y);
  const worldGdp = worldValue('pdb', y);
  const share = worldGdp === null ? null : (SERIES.pdbUsd.values[YEARS.indexOf(y)] / worldGdp) * 100;

  const sectorRows = SECTORS.rows.map((r) => ({ label: r.label, value: r.value, hi: r.value >= 13 }));

  return (
    pageHead({
      crumbs: '<a href="' + href(state, '/') + '">Beranda</a>',
      title: 'Ekonomi',
      dek: 'Pertumbuhan, PDB nominal, PDB per kapita, dan susunan lapangan usaha, tahun fokus ' + y + '.',
      stamp: 'BPS, ' + y,
    }) +

    '<div class="stat-row">' +
    statBlock({ value: num(growth, 2), unit: 'persen', label: 'Pertumbuhan PDB ' + y, source: 'BPS', accent: true }) +
    statBlock({ value: 'Rp' + num(gdp, 0), unit: 'triliun', label: 'PDB nominal ' + y, source: 'BPS' }) +
    statBlock({ value: 'USD ' + num(perCap, 0), unit: '', label: 'PDB per kapita ' + y, source: perCap === 5083 ? 'BPS' : 'Bank Dunia' }) +
    statBlock({ value: 'Rp' + num((gdp * 1e12) / (SERIES.penduduk.values[YEARS.indexOf(y)] * 1e6) / 1e6, 1), unit: 'juta', label: 'PDB per kapita dalam rupiah ' + y, source: 'BPS, dihitung' }) +
    '</div>' +

    '<div class="split split-wide" style="margin-top:14px">' +
    '<div class="card">' +
    '<h3>Pertumbuhan PDB, 2019 sampai 2025</h3>' +
    '<p class="card-sub">Persen, tahunan. Sumber BPS.</p>' +
    columns({ years: YEARS, values: SERIES.pertumbuhan.values, highlight: y, decimals: 2, label: 'Pertumbuhan PDB 2019 sampai 2025' }) +
    interpretation(
      'Rata-rata pertumbuhan 2021 sampai 2025 adalah ' +
      num((SERIES.pertumbuhan.values.slice(2).reduce((a, b) => a + b, 0)) / 5, 2) +
      ' persen. Tahun 2020 satu-satunya yang negatif, minus 2,07 persen, dan 2025 menjadi yang tercepat sejak 2022.',
    ) +
    '</div>' +
    '<div class="card">' +
    '<h3>PDB nominal, 2019 sampai 2025</h3>' +
    '<p class="card-sub">Rp triliun, harga berlaku. Sumber BPS.</p>' +
    line({ years: YEARS, values: SERIES.pdb.values, highlight: y, decimals: 0, label: 'PDB nominal 2019 sampai 2025' }) +
    interpretation(
      'PDB nominal naik dari Rp15.834 triliun pada 2019 ke Rp23.821 triliun pada 2025. Kenaikan ini sebagian inflasi, bukan seluruhnya volume; pertumbuhan riil ada di grafik sebelah.',
    ) +
    '</div>' +
    '</div>' +

    '<div class="split" style="margin-top:14px">' +
    '<div class="card">' +
    '<h3>Pangsa PDB dunia</h3>' +
    '<p class="card-sub">Dolar berlaku, dibandingkan agregat dunia Bank Dunia.</p>' +
    '<div class="stat-value" style="font-family:var(--serif);font-size:30px;color:var(--green-800)">' + (share === null ? 'belum terbit' : num(share, 1) + ' persen') + '</div>' +
    '<p class="small muted">Indonesia menyumbang ' + (share === null ? 'belum terhitung' : num(share, 1) + ' persen') +
    ' dari PDB dunia pada ' + y + ', sementara penduduknya ' + num((SERIES.penduduk.values[YEARS.indexOf(y)] / worldValue('penduduk', y)) * 100, 1) + ' persen dari penduduk dunia.</p>' +
    interpretation('Selisih dua pangsa itu menjelaskan mengapa PDB per kapita Indonesia masih ' + num((perCap / worldValue('perkapita', y)) * 100, 0) + ' persen rata-rata dunia: banyak orang, output per orang masih di bawah rata-rata.') +
    '</div>' +
    '<div class="card">' +
    '<h3>Susunan lapangan usaha</h3>' +
    '<p class="card-sub">Pangsa terhadap PDB ' + SECTORS.year + ', persen. Sumber BPS.</p>' +
    horizontalBars({ rows: sectorRows, decimals: 1, label: 'Pangsa lapangan usaha terhadap PDB 2024', labelW: 250, width: 560, rowH: 24 }) +
    interpretation('Industri pengolahan masih terbesar, 18,7 persen, tetapi perdagangan dan pertanian bersama menyumbang 25,5 persen, tanda bahwa ekonomi tidak berdiri di satu sektor.') +
    '</div>' +
    '</div>' +

    '<div class="section-head"><h2>Kemiskinan dan ketimpangan</h2><span class="aside">Garis nasional BPS</span></div>' +
    '<div class="card">' +
    '<h3>Penduduk miskin, September 2019 sampai 2024</h3>' +
    '<p class="card-sub">Persen penduduk, garis kemiskinan nasional. September 2025 belum terbit.</p>' +
    columns({ years: YEARS, values: SERIES.kemiskinan.values, highlight: y, decimals: 2, label: 'Kemiskinan September 2019 sampai 2025' }) +
    interpretation('Kemiskinan turun dari 9,22 persen pada 2019 ke 8,57 persen pada September 2024, lalu 8,47 persen pada Maret 2025, angka terendah yang pernah tercatat.') +
    nullNote('kemiskinan') +
    '</div>' +
    '<div class="stat-row">' +
    statBlock({ value: num(LATEST_VERIFIED.kemiskinan.value, 2), unit: 'persen', label: 'Kemiskinan Maret 2025, terendah sepanjang catatan', source: LATEST_VERIFIED.kemiskinan.source, accent: true }) +
    statBlock({ value: num(GINI.value, 3), unit: '', label: GINI.label + ' ' + GINI.month, source: GINI.source }) +
    statBlock({ value: '3,7', unit: 'persen', label: 'Kemiskinan pada garis USD 2,15 per hari, 2025', source: 'Bank Dunia' }) +
    '</div>' +

    footnote(
      '<strong>Sumber:</strong> BPS untuk pertumbuhan, PDB nominal, kemiskinan, dan rasio gini. Bank Dunia untuk PDB per kapita dalam dolar, pangsa dunia, dan garis USD 2,15 per hari. ' +
      'PDB per kapita rupiah dihitung dari PDB nominal dibagi penduduk pertengahan tahun, bukan angka resmi terpisah.'
    )
  );
}

// ------------------------------------------------------------------ penduduk

export function renderPopulation(state) {
  const y = state.year;
  const pop = seriesValue('penduduk', y);
  const worldPop = worldValue('penduduk', y);
  const share = (pop / worldPop) * 100;
  const ageRows = AGE_GROUPS.rows.map((r) => ({ label: r.label, value: r.value }));

  return (
    pageHead({
      crumbs: '<a href="' + href(state, '/') + '">Beranda</a>',
      title: 'Penduduk',
      dek: 'Jumlah, laju, dan struktur umur penduduk Indonesia. Tahun fokus ' + y + '.',
      stamp: 'BPS, ' + y,
    }) +

    '<div class="stat-row">' +
    statBlock({ value: num(pop, 1), unit: 'juta jiwa', label: 'Penduduk ' + y + (y === 2025 ? ', proyeksi' : ''), source: 'BPS', accent: true }) +
    statBlock({ value: num(share, 1), unit: 'persen', label: 'Pangsa penduduk dunia ' + y, source: 'Bank Dunia' }) +
    statBlock({ value: 'ke-4', unit: '', label: 'Peringkat penduduk dunia', source: 'Bank Dunia' }) +
    statBlock({ value: num(PROVINCE_TOTALS.density, 0), unit: 'per km2', label: 'Kepadatan rata-rata, 2024', source: 'BPS, dihitung' }) +
    '</div>' +

    '<div class="split split-wide" style="margin-top:14px">' +
    '<div class="card">' +
    '<h3>Penduduk, 2019 sampai 2025</h3>' +
    '<p class="card-sub">Juta jiwa. Sumber BPS.</p>' +
    line({ years: YEARS, values: SERIES.penduduk.values, highlight: y, decimals: 1, label: 'Penduduk 2019 sampai 2025' }) +
    interpretation(
      'Laju tambahan rata-rata ' +
      num((SERIES.penduduk.values[SERIES.penduduk.values.length - 1] - SERIES.penduduk.values[0]) / 6, 1) +
      ' juta jiwa per tahun. Angka 2020 berasal dari Sensus Penduduk, 2025 proyeksi, jadi keduanya bukan sensus baru.',
    ) +
    '</div>' +
    '<div class="card">' +
    '<h3>Kelompok umur, ' + AGE_GROUPS.year + '</h3>' +
    '<p class="card-sub">Persen penduduk. Sumber ' + AGE_GROUPS.source + '.</p>' +
    shareBar(ageRows, { label: 'Struktur umur penduduk 2024' }) +
    '<ul class="plain-list" style="margin-top:8px">' +
    AGE_GROUPS.rows.map((r) => '<li><strong>' + esc(r.label) + '</strong> ' + num(r.value, 1) + ' persen</li>').join('') +
    '</ul>' +
    interpretation('Kelompok 25 sampai 54 tahun, usia kerja produktif, 42,1 persen dari penduduk; penduduk 65 tahun ke atas baru 6,2 persen, jadi beban usia tua masih ringan.') +
    '</div>' +
    '</div>' +

    '<div class="section-head"><h2>Penduduk menurut provinsi</h2><span class="aside">Data ' + PROVINCE_YEAR + ', 38 provinsi</span></div>' +
    '<div class="split">' +
    '<div class="card">' +
    '<h3>Sepuluh provinsi terbesar</h3>' +
    '<p class="card-sub">Juta jiwa, perkiraan ' + PROVINCE_YEAR + '.</p>' +
    provinceRanks(
      [...PROVINCES].sort((a, b) => b.population - a.population).slice(0, 10).map((p) => ({ name: p.name, value: p.population })),
      { label: 'Sepuluh provinsi menurut penduduk', decimals: 1, width: 430 },
    ) +
    interpretation('Jawa Barat 50,3 juta jiwa, terbesar, hampir seperlima penduduk Indonesia. Enam provinsi di Jawa bersama menampung ' + num(PROVINCE_HIGHLIGHTS.javaShare, 1) + ' juta jiwa atau ' + num((PROVINCE_HIGHLIGHTS.javaShare / PROVINCE_TOTALS.population) * 100, 1) + ' persen penduduk.') +
    '</div>' +
    '<div class="card">' +
    '<h3>Kepadatan tertinggi</h3>' +
    '<p class="card-sub">Jiwa per km persegi, dihitung dari penduduk dan luas.</p>' +
    provinceRanks(
      [...PROVINCES].sort((a, b) => b.density - a.density).slice(0, 10).map((p) => ({ name: p.name, value: p.density })),
      { label: 'Sepuluh provinsi terpadat', decimals: 0, width: 430 },
    ) +
    interpretation('DKI Jakarta 16.061 jiwa per km persegi, hampir 40 kali DI Yogyakarta di urutan kedua, sementara Papua Selatan hanya 4 jiwa per km persegi.') +
    '</div>' +
    '</div>' +
    '<div class="btn-row"><a class="btn" href="' + href(state, '/provinsi') + '">Buka peta 38 provinsi</a></div>' +

    footnote(
      '<strong>Sumber:</strong> BPS, proyeksi penduduk pertengahan tahun 2019 sampai 2025, dan perkiraan penduduk provinsi ' + PROVINCE_YEAR + '. ' +
      'Angka Bank Dunia untuk penduduk Indonesia 2024 adalah 283,5 juta, berbeda dari 281,6 juta versi BPS karena metode estimasi; halaman ini memakai BPS untuk seri nasional dan Bank Dunia hanya untuk pangsa dunia.'
    )
  );
}

// ------------------------------------------------------------------ provinsi

export function renderProvincePage(state) {
  const selected = provinceByName(state.province);
  const metric = state.metric;
  const sorted = [...PROVINCES].sort((a, b) => (metric === 'density' ? b.density - a.density : b.population - a.population));

  const table = sorted
    .map(
      (p, i) =>
        '<tr' + (selected && selected.name === p.name ? ' class="is-me"' : '') + '>' +
        '<td class="rank">' + (i + 1) + '</td>' +
        '<td><a href="' + href(state, '/provinsi', { province: p.name, metric }) + '">' + esc(p.name) + '</a></td>' +
        '<td>' + num(p.population, 1) + '</td>' +
        '<td>' + num(p.area, 1) + '</td>' +
        '<td>' + num(p.density, 0) + '</td>' +
        '<td>' + num(p.share, 1) + '</td>' +
        '</tr>',
    )
    .join('');

  const links = sorted
    .map(
      (p) =>
        '<a href="' + href(state, '/provinsi', { province: p.name, metric }) + '"' + (selected && selected.name === p.name ? ' class="is-on"' : '') + '>' +
        '<span>' + esc(p.name) + '</span>' +
        '<span class="pg-val">' + (metric === 'density' ? num(p.density, 0) : num(p.population, 1)) + '</span>' +
        '</a>',
    )
    .join('');

  return (
    pageHead({
      crumbs: '<a href="' + href(state, '/') + '">Beranda</a>',
      title: 'Provinsi',
      dek: 'Peta 38 provinsi yang bisa diklik, tabel lengkap, dan panel rincian. Tahun data ' + PROVINCE_YEAR + '.',
      stamp: PROVINCE_SOURCE,
    }) +

    '<div class="stat-row">' +
    statBlock({ value: '38', unit: 'provinsi', label: 'Jumlah provinsi', source: 'BPS' }) +
    statBlock({ value: num(PROVINCE_HIGHLIGHTS.highestPop.population, 1), unit: 'juta', label: PROVINCE_HIGHLIGHTS.highestPop.name + ', terbesar', source: 'BPS ' + PROVINCE_YEAR, accent: true }) +
    statBlock({ value: num(PROVINCE_HIGHLIGHTS.densest.density, 0), unit: 'per km2', label: PROVINCE_HIGHLIGHTS.densest.name + ', terpadat', source: 'BPS, dihitung' }) +
    statBlock({ value: num(PROVINCE_HIGHLIGHTS.widest.area, 1), unit: 'ribu km2', label: PROVINCE_HIGHLIGHTS.widest.name + ', terluas', source: 'BPS' }) +
    '</div>' +

    '<div class="split-wide split" style="margin-top:14px">' +
    '<div class="card">' + mapPanel(state, { aside: metric === 'density' ? 'Diwarnai menurut kepadatan' : 'Diwarnai menurut penduduk' }) + '</div>' +
    '<div class="card">' +
    '<h3>' + (selected ? esc(selected.name) : 'Ringkasan provinsi') + '</h3>' +
    (selected
      ? '<div class="prov-metrics" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px">' +
        '<div>Penduduk<b style="display:block;font-family:var(--serif);font-size:22px">' + num(selected.population, 1) + ' juta</b></div>' +
        '<div>Kepadatan<b style="display:block;font-family:var(--serif);font-size:22px">' + num(selected.density, 0) + ' per km2</b></div>' +
        '<div>Luas<b style="display:block;font-family:var(--serif);font-size:22px">' + num(selected.area, 1) + ' ribu km2</b></div>' +
        '<div>Peringkat<b style="display:block;font-family:var(--serif);font-size:22px">ke-' + selected.rankPop + ' penduduk</b></div>' +
        '</div>' +
        interpretation(esc(selected.name) + ' menampung ' + num(selected.share, 1) + ' persen penduduk Indonesia dan menempati peringkat ke-' + selected.rankDensity + ' menurut kepadatan dari 38 provinsi.') +
        '<p class="small muted">Metrik peta sedang menampilkan ' + (metric === 'density' ? 'kepadatan' : 'jumlah penduduk') + '. Ganti lewat tombol di atas peta.</p>'
      : '<p class="dek" style="font-size:14px">Klik satu provinsi di peta atau daftar di bawah. Panel ini lalu menampilkan penduduk, luas, kepadatan, dan peringkatnya.</p>' +
        '<ul class="plain-list" style="margin-top:10px">' +
        '<li><strong>Terbesar:</strong> ' + esc(PROVINCE_HIGHLIGHTS.highestPop.name) + ', ' + num(PROVINCE_HIGHLIGHTS.highestPop.population, 1) + ' juta jiwa</li>' +
        '<li><strong>Terpadat:</strong> ' + esc(PROVINCE_HIGHLIGHTS.densest.name) + ', ' + num(PROVINCE_HIGHLIGHTS.densest.density, 0) + ' per km2</li>' +
        '<li><strong>Terluas:</strong> ' + esc(PROVINCE_HIGHLIGHTS.widest.name) + ', ' + num(PROVINCE_HIGHLIGHTS.widest.area, 1) + ' ribu km2</li>' +
        '<li><strong>Paling jarang:</strong> ' + esc(PROVINCE_HIGHLIGHTS.sparsest.name) + ', ' + num(PROVINCE_HIGHLIGHTS.sparsest.density, 1) + ' per km2</li>' +
        '</ul>' +
        '<h4 style="font-family:var(--serif);margin:14px 0 2px">IPM provinsi 2025</h4>' +
        '<p class="small" style="margin:0">Tertinggi ' + PROVINCE_HIGHLIGHTS.ipmHigh.name + ' ' + num(PROVINCE_HIGHLIGHTS.ipmHigh.value, 2) +
        ', terendah ' + PROVINCE_HIGHLIGHTS.ipmLow.name + ' ' + num(PROVINCE_HIGHLIGHTS.ipmLow.value, 2) +
        ', jarak ' + num(PROVINCE_HIGHLIGHTS.ipmHigh.value - PROVINCE_HIGHLIGHTS.ipmLow.value, 2) + ' poin (BPS, 5 November 2025).</p>' +
        '<p class="small muted">Catatan: data peta dan tabel adalah penduduk ' + PROVINCE_YEAR + '; angka IPM adalah rilis 2025 dengan tahun berbeda.</p>')
    + '</div>' +
    '</div>' +

    '<div class="section-head"><h2>Daftar 38 provinsi</h2><span class="aside">Klik untuk memilih</span></div>' +
    '<div class="prov-grid">' + links + '</div>' +

    '<div class="section-head"><h2>Tabel lengkap</h2><span class="aside">Diurutkan menurut ' + (metric === 'density' ? 'kepadatan' : 'penduduk') + '</span></div>' +
    '<div class="table-wrap"><table class="data">' +
    '<caption>38 provinsi, penduduk ' + PROVINCE_YEAR + '. Kepadatan dihitung dari penduduk dibagi luas daratan.</caption>' +
    '<thead><tr><th scope="col">#</th><th scope="col">Provinsi</th><th scope="col">Penduduk (juta)</th><th scope="col">Luas (ribu km2)</th><th scope="col">Kepadatan (/km2)</th><th scope="col">Pangsa (%)</th></tr></thead>' +
    '<tbody>' + table + '</tbody>' +
    '<tfoot><tr><td></td><td>Indonesia</td><td>' + num(PROVINCE_TOTALS.population, 1) + '</td><td>' + num(PROVINCE_TOTALS.area, 1) + '</td><td>' + num(PROVINCE_TOTALS.density, 0) + '</td><td>100,0</td></tr></tfoot>' +
    '</table></div>' +

    footnote(
      '<strong>Sumber:</strong> BPS, perkiraan penduduk provinsi ' + PROVINCE_YEAR + ' dan luas daratan. Kepadatan dan pangsa dihitung dari dua kolom itu, jadi tidak ada angka yang berdiri sendiri. ' +
      'Peta adalah skematik, bukan peta batas resmi; bentuknya hanya untuk membaca pola wilayah. Jumlah penduduk 38 provinsi di tabel ' + num(PROVINCE_TOTALS.population, 1) + ' juta, sedikit di atas angka nasional ' + num(seriesValue('penduduk', PROVINCE_YEAR), 1) + ' juta karena pembulatan tiap provinsi.'
    )
  );
}

// ------------------------------------------------------------------ harga

export function renderPrice(state) {
  const priceRows = PRICE_GROUPS.rows.map((r) => ({ label: r.label, value: r.value, hi: r.value >= 5 }));
  const latestRows = PRICE_GROUPS.latest.rows.map((r) => ({ label: r.label, value: r.value }));

  return (
    pageHead({
      crumbs: '<a href="' + href(state, '/') + '">Beranda</a>',
      title: 'Harga dan inflasi',
      dek: 'Inflasi Desember terhadap Desember, lalu sebelas kelompok IHK yang membentuknya.',
      stamp: 'BPS, IHK ' + PRICE_GROUPS.year,
    }) +

    '<div class="stat-row">' +
    statBlock({ value: num(seriesValue('inflasi', state.year), 2), unit: 'persen', label: 'Inflasi Des ' + state.year + ' (y-on-y)', source: 'BPS', accent: true }) +
    statBlock({ value: num(WORLD.inflasi.values[YEARS.indexOf(state.year)], 2), unit: 'persen', label: 'Inflasi dunia ' + state.year + ', rata-rata tahunan', source: 'Bank Dunia' }) +
    statBlock({ value: '2,5', unit: 'plus minus 1', label: 'Sasaran inflasi Bank Indonesia', source: 'Bank Indonesia' }) +
    '</div>' +

    '<div class="card" style="margin-top:14px">' +
    '<h3>Inflasi Desember, 2019 sampai 2025</h3>' +
    '<p class="card-sub">Persen, tahunan. Sumber BPS.</p>' +
    line({ years: YEARS, values: SERIES.inflasi.values, highlight: state.year, decimals: 2, label: 'Inflasi Desember 2019 sampai 2025' }) +
    interpretation('Inflasi 2022 melonjak ke 5,51 persen, tertinggi dalam seri ini, lalu turun ke 1,57 persen pada 2024 sebelum naik tipis ke 2,92 persen pada 2025, masih di dalam sasaran Bank Indonesia.') +
    '</div>' +

    '<div class="split" style="margin-top:14px">' +
    '<div class="card">' +
    '<h3>Kelompok IHK, Desember ' + PRICE_GROUPS.year + '</h3>' +
    '<p class="card-sub">Persen, y-on-y. Sebelas kelompok, tahun lengkap terakhir.</p>' +
    horizontalBars({ rows: priceRows, decimals: 1, label: 'Inflasi menurut kelompok IHK Desember 2024', labelW: 250, width: 560, rowH: 24 }) +
    interpretation('Perawatan pribadi dan jasa lainnya naik 5,0 persen, tertinggi; hanya informasi, komunikasi dan jasa keuangan yang turun, minus 0,3 persen. Makanan, minuman dan tembakau 2,5 persen, kelompok dengan bobot terbesar.') +
    '</div>' +
    '<div class="card">' +
    '<h3>Desember 2025, tiga kelompok terverifikasi</h3>' +
    '<p class="card-sub">Persen, y-on-y. Hanya tiga angka yang sudah terbit, jadi tidak digabung ke grafik 2024.</p>' +
    horizontalBars({ rows: latestRows, decimals: 2, label: 'Tiga kelompok IHK Desember 2025', labelW: 250, width: 560, rowH: 26 }) +
    interpretation('Perawatan pribadi dan jasa lainnya melonjak ke 13,33 persen pada Desember 2025, sementara makanan 4,58 persen dan restoran 1,45 persen. Angka ini berdiri sendiri, tidak dicampur dengan kelompok 2024 yang lengkap.') +
    '</div>' +
    '</div>' +

    '<div class="note warn"><p><strong>Dua angka inflasi yang sama-sama benar.</strong> BPS mengukur Desember terhadap Desember; Bank Dunia memakai rata-rata tahunan. Untuk 2024, BPS mencatat 1,57 persen dan Bank Dunia 2,18 persen. Halaman ini memakai BPS untuk seri nasional dan Bank Dunia hanya untuk baris pembanding dunia, dengan label tahun masing-masing.</p></div>' +

    footnote(
      '<strong>Sumber:</strong> BPS, Indeks Harga Konsumen, Desember ' + PRICE_GROUPS.year + ' untuk sebelas kelompok dan Desember 2025 untuk tiga kelompok yang sudah terverifikasi. ' +
      'Bank Dunia WDI (FP.CPI.TOTL.ZG) untuk rata-rata tahunan dunia. Sasaran inflasi dari Bank Indonesia.'
    )
  );
}

// ------------------------------------------------------------------ kerja

export function renderLabour(state) {
  const tptSeries = SERIES.tpt.values;
  const latest = LATEST_VERIFIED.tpt;

  return (
    pageHead({
      crumbs: '<a href="' + href(state, '/') + '">Beranda</a>',
      title: 'Ketenagakerjaan',
      dek: 'Tingkat pengangguran terbuka dari Sakernas, dan angka terbaru yang sudah terverifikasi.',
      stamp: 'BPS, Sakernas',
    }) +

    '<div class="stat-row">' +
    statBlock({ value: num(latest.value, 2), unit: 'persen', label: 'TPT ' + latest.month + ', terendah sejak 1998', source: latest.source, accent: true }) +
    statBlock({ value: '153,05', unit: 'juta', label: 'Angkatan kerja Februari 2025', source: 'BPS, Sakernas' }) +
    statBlock({ value: num(seriesValue('tpt', 2024), 2), unit: 'persen', label: 'TPT Agustus 2024, terendah dalam seri', source: 'BPS' }) +
    statBlock({ value: num(WORLD.tpt.values[6], 2), unit: 'persen', label: 'Pengangguran dunia 2025, model ILO', source: 'Bank Dunia' }) +
    '</div>' +

    '<div class="card" style="margin-top:14px">' +
    '<h3>TPT Agustus, 2019 sampai 2024</h3>' +
    '<p class="card-sub">Persen angkatan kerja. Agustus 2025 belum terbit, jadi digambar sebagai celah.</p>' +
    columns({ years: YEARS, values: tptSeries, highlight: state.year, decimals: 2, label: 'Tingkat pengangguran terbuka 2019 sampai 2025' }) +
    interpretation('Pengangguran naik ke 7,07 persen pada Agustus 2020, puncak pandemi, lalu turun lima tahun berturut-turut ke 4,91 persen pada Agustus 2024. Februari 2025 mencatat 4,76 persen, terendah sejak 1998.') +
    nullNote('tpt') +
    '</div>' +

    '<div class="split" style="margin-top:14px">' +
    '<div class="card">' +
    '<h3>Indonesia dan dunia</h3>' +
    '<p class="card-sub">Persen angkatan kerja, 2019 sampai 2025. Garis hijau Indonesia, garis pucat dunia.</p>' +
    groupedColumns({
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      series: [
        { label: 'Indonesia', values: tptSeries.slice(0, 6), className: 'exports' },
        { label: 'Dunia (model ILO)', values: WORLD.tpt.values.slice(0, 6), className: 'imports' },
      ],
      decimals: 2,
      label: 'Pengangguran Indonesia dan dunia',
    }) +
    interpretation('Pola Indonesia mengikuti dunia: naik pada 2020, turun sesudahnya. Bedanya, penurunan Indonesia lebih dalam, dari 7,07 persen ke 4,91 persen dalam empat tahun.') +
    '</div>' +
    '<div class="card">' +
    '<h3>Catatan metode</h3>' +
    '<ul class="plain-list">' +
    '<li><strong>TPT BPS</strong> memakai Sakernas, survei angkatan kerja nasional, dengan definisi pengangguran terbuka: tidak bekerja, mencari kerja, dan siap bekerja.</li>' +
    '<li><strong>Bank Dunia</strong> memakai estimasi model ILO, bukan survei langsung, sehingga angkanya bisa berbeda satu sampai dua persepuluh poin dari BPS.</li>' +
    '<li><strong>Kenapa 2025 kosong di seri.</strong> TPT diukur pada Agustus dan Februari. Angka Agustus 2025 belum masuk rilis yang terverifikasi, jadi seri berhenti di 2024 dan angka Februari 2025 ditaruh di kartu, bukan di grafik.</li>' +
    '</ul>' +
    '</div>' +
    '</div>' +

    footnote(
      '<strong>Sumber:</strong> BPS, Sakernas Agustus 2019 sampai 2024 dan Sakernas Februari 2025 (TPT 4,76 persen, angkatan kerja 153,05 juta). ' +
      'Bank Dunia WDI (SL.UEM.TOTL.ZS) untuk pembanding dunia, estimasi model ILO.'
    )
  );
}

// ------------------------------------------------------------------ pendidikan

export function renderEducation(state) {
  const ipm = EDUCATION.ipmSeries;
  const stats = EDUCATION.stats;

  return (
    pageHead({
      crumbs: '<a href="' + href(state, '/') + '">Beranda</a>',
      title: 'Pendidikan dan IPM',
      dek: 'Indeks Pembangunan Manusia 2025 dan tiga ukuran di baliknya: lama sekolah, harapan lama sekolah, partisipasi.',
      stamp: EDUCATION.source,
    }) +

    '<div class="stat-row">' +
    stats.map((s) => statBlock({ value: num(s.value, s.decimals), unit: s.unit, label: s.label, source: 'BPS, ' + EDUCATION.year, accent: s.key === 'ipm' })).join('') +
    '</div>' +

    '<div class="split" style="margin-top:14px">' +
    '<div class="card">' +
    '<h3>IPM 2022 sampai 2025</h3>' +
    '<p class="card-sub">Indeks skala 0 sampai 100, metode baru BPS.</p>' +
    columns({ years: ipm.years, values: ipm.values, highlight: 2025, decimals: 2, label: 'IPM Indonesia 2022 sampai 2025' }) +
    interpretation('IPM naik 2,13 poin dalam tiga tahun, dari 73,77 pada 2022 ke 75,90 pada 2025. Kenaikan 0,88 poin pada 2025 adalah yang terbesar dalam rentang ini.') +
    '</div>' +
    '<div class="card">' +
    '<h3>Partisipasi sekolah</h3>' +
    '<p class="card-sub">Angka partisipasi sekolah menurut kelompok umur, persen.</p>' +
    horizontalBars({
      rows: EDUCATION.participation.map((r) => ({ label: r.label, value: r.value, hi: r.value >= 95 })),
      decimals: 1,
      label: 'Angka partisipasi sekolah menurut kelompok umur',
      labelW: 170,
      width: 520,
      rowH: 30,
    }) +
    interpretation('Hampir semua anak 7 sampai 12 tahun bersekolah, 99,5 persen, tetapi partisipasi 16 sampai 18 tahun turun ke 73,2 persen: transisi ke sekolah menengah atas masih menjadi titik lemah.') +
    '</div>' +
    '</div>' +

    '<div class="note"><p><strong>Dua angka lama sekolah yang berbeda.</strong> ' + EDUCATION.note + '</p></div>' +

    '<div class="section-head"><h2>IPM menurut provinsi, 2025</h2><span class="aside">BPS, 5 November 2025</span></div>' +
    '<div class="card">' +
    provinceRanks(
      PROVINCES.slice()
        .sort((a, b) => b.population - a.population)
        .slice(0, 3)
        .map((p) => ({ name: p.name, value: p.population })),
      { label: 'Tiga provinsi terbesar menurut penduduk', decimals: 1, width: 430 },
    ) +
    '<p class="small" style="margin-top:8px">IPM provinsi bergerak dari ' + num(PROVINCE_HIGHLIGHTS.ipmHigh.value, 2) + ' di ' + esc(PROVINCE_HIGHLIGHTS.ipmHigh.name) +
    ' sampai ' + num(PROVINCE_HIGHLIGHTS.ipmLow.value, 2) + ' di ' + esc(PROVINCE_HIGHLIGHTS.ipmLow.name) +
    ', jarak ' + num(PROVINCE_HIGHLIGHTS.ipmHigh.value - PROVINCE_HIGHLIGHTS.ipmLow.value, 2) + ' poin. Sebaran ini lebih lebar daripada jarak Indonesia ke rata-rata dunia.</p>' +
    '</div>' +

    footnote(
      '<strong>Sumber:</strong> BPS, Berita Resmi Statistik Indeks Pembangunan Manusia, 5 November 2025: IPM 75,90, RLS 9,07 tahun (umur 25 tahun ke atas), HLS 13,30 tahun, dan angka partisipasi sekolah umur 7 sampai 12 tahun sekitar 99,5 persen. ' +
      'Angka IPM provinsi dari rilis yang sama. Seri IPM 2022 sampai 2025 memakai metode baru, jadi tidak disambung dengan seri lama metode 2010.'
    )
  );
}

// ------------------------------------------------------------------ kesehatan

export function renderHealth(state) {
  const stunting = HEALTH.stunting.values;

  return (
    pageHead({
      crumbs: '<a href="' + href(state, '/') + '">Beranda</a>',
      title: 'Kesehatan',
      dek: 'Harapan hidup, stunting, dan belanja kesehatan per orang.',
      stamp: 'BPS 2025 dan Kemenkes SSGI 2024',
    }) +

    '<div class="stat-row">' +
    statBlock({ value: num(HEALTH.uhh.value, 2), unit: 'tahun', label: 'Harapan hidup saat lahir 2025, metode BPS', source: 'BPS', accent: true }) +
    statBlock({ value: num(HEALTH.uhhWdi.value, 1), unit: 'tahun', label: 'Harapan hidup 2024, metode Bank Dunia', source: 'Bank Dunia' }) +
    statBlock({ value: num(stunting[stunting.length - 1].value, 1), unit: 'persen', label: 'Stunting 2024, SSGI', source: 'Kemenkes' }) +
    statBlock({ value: 'Rp' + num(HEALTH.spending.value, 2), unit: 'juta', label: 'Belanja kesehatan riil per orang per tahun, 2025', source: 'BPS' }) +
    '</div>' +

    '<div class="split" style="margin-top:14px">' +
    '<div class="card">' +
    '<h3>Stunting, 2013 sampai 2024</h3>' +
    '<p class="card-sub">Persen balita. SSGI, Kemenkes. Empat titik survei, bukan seri tahunan.</p>' +
    columns({
      years: stunting.map((s) => s.year),
      values: stunting.map((s) => s.value),
      highlight: 2024,
      decimals: 1,
      label: 'Prevalensi stunting 2013 sampai 2024',
    }) +
    interpretation('Stunting turun dari 37,6 persen pada 2013 ke 19,8 persen pada 2024, hampir separuh dalam sebelas tahun. Titik 2013, 2019, 2023 dan 2024 adalah survei terpisah, jadi garis di antaranya bukan pengukuran tahunan.') +
    '</div>' +
    '<div class="card">' +
    '<h3>Dua metode harapan hidup</h3>' +
    '<p class="card-sub">Tahun, 2024 dan 2025.</p>' +
    '<div class="table-wrap"><table class="data" style="min-width:0">' +
    '<thead><tr><th scope="col">Sumber</th><th scope="col">Tahun</th><th scope="col">Harapan hidup</th></tr></thead>' +
    '<tbody>' +
    '<tr class="is-me"><td>BPS, metode tidak langsung</td><td>2025</td><td>' + num(HEALTH.uhh.value, 2) + ' tahun</td></tr>' +
    '<tr><td>Bank Dunia WDI</td><td>2024</td><td>' + num(HEALTH.uhhWdi.value, 1) + ' tahun</td></tr>' +
    '<tr><td>Dunia, Bank Dunia</td><td>2024</td><td>' + num(WORLD.harapanHidup.values[5], 1) + ' tahun</td></tr>' +
    '</tbody></table></div>' +
    interpretation('Selisih 3,17 tahun antara angka BPS 2025 dan Bank Dunia 2024 bukan pertentangan: BPS memakai metode tidak langsung dari Susenas, Bank Dunia memakai estimasi PBB. Keduanya benar untuk metodenya sendiri.') +
    '<p class="small muted">Harapan hidup dunia 2025 belum terbit di Bank Dunia, jadi barisnya memakai 2024 dengan label tahun yang jujur.</p>' +
    '</div>' +
    '</div>' +

    footnote(
      '<strong>Sumber:</strong> BPS, rilis IPM 5 November 2025 untuk harapan hidup 74,47 tahun dan belanja kesehatan riil Rp12,80 juta per orang per tahun. ' +
      'Kementerian Kesehatan, Studi Status Gizi Indonesia (SSGI) 2024 untuk stunting 19,8 persen, dengan titik pembanding 2013, 2019 dan 2023. ' +
      'Bank Dunia WDI (SP.DYN.LE00.IN) untuk pembanding dunia.'
    )
  );
}

// ------------------------------------------------------------------ perdagangan

export function renderTrade(state) {
  const t = TRADE;
  const balance = t.exportSeries.map((v, i) => v - t.importSeries[i]);
  const destRows = t.destinations.map((d) => ({ label: d.name, value: d.value, hi: d.name === 'Tiongkok' }));

  return (
    pageHead({
      crumbs: '<a href="' + href(state, '/') + '">Beranda</a>',
      title: 'Perdagangan luar negeri',
      dek: 'Ekspor, impor, dan surplus barang 2020 sampai 2025, serta tiga tujuan ekspor terbesar.',
      stamp: t.source,
    }) +

    '<div class="stat-row">' +
    statBlock({ value: 'USD ' + num(t.export, 2), unit: 'miliar', label: 'Ekspor ' + t.year, source: 'BPS', accent: true }) +
    statBlock({ value: 'USD ' + num(t.import, 2), unit: 'miliar', label: 'Impor ' + t.year, source: 'BPS' }) +
    statBlock({ value: 'USD ' + num(t.surplus, 2), unit: 'miliar', label: 'Surplus ' + t.year, source: 'BPS' }) +
    statBlock({ value: String(t.streakMonths), unit: 'bulan', label: 'Surplus beruntun sejak ' + t.streakSince, source: 'BPS' }) +
    '</div>' +

    '<div class="card" style="margin-top:14px">' +
    '<h3>Ekspor dan impor barang, 2020 sampai 2025</h3>' +
    '<p class="card-sub">Miliar dolar Amerika Serikat. Hijau ekspor, jingga impor. Sumber BPS dan Bank Dunia.</p>' +
    groupedColumns({
      years: t.years,
      series: [
        { label: 'Ekspor', values: t.exportSeries, className: 'exports' },
        { label: 'Impor', values: t.importSeries, className: 'imports' },
      ],
      decimals: 1,
      label: 'Ekspor dan impor barang 2020 sampai 2025',
    }) +
    interpretation('Ekspor memuncak pada 2022 di USD 292,0 miliar saat harga komoditas tinggi, turun ke 258,9 miliar pada 2023, lalu pulih ke 282,9 miliar pada 2025. Impor bergerak lebih tenang, dari 141,6 ke 241,9 miliar.') +
    '</div>' +

    '<div class="split" style="margin-top:14px">' +
    '<div class="card">' +
    '<h3>Neraca barang</h3>' +
    '<p class="card-sub">Miliar dolar, ekspor dikurangi impor.</p>' +
    '<div class="table-wrap"><table class="data" style="min-width:0">' +
    '<thead><tr><th scope="col">Tahun</th><th scope="col">Ekspor</th><th scope="col">Impor</th><th scope="col">Neraca</th></tr></thead>' +
    '<tbody>' +
    t.years.map((year, i) => '<tr' + (year === 2025 ? ' class="is-me"' : '') + '><td>' + year + '</td><td>' + num(t.exportSeries[i], 1) + '</td><td>' + num(t.importSeries[i], 1) + '</td><td class="' + (balance[i] >= 0 ? 'pos' : 'neg') + '">' + (balance[i] >= 0 ? 'plus ' : 'minus ') + num(Math.abs(balance[i]), 1) + '</td></tr>').join('') +
    '</tbody></table></div>' +
    interpretation('Surplus 2025 sebesar USD 41,05 miliar, lebih besar dari 31,33 miliar pada 2024. Surplus sudah berjalan 68 bulan berturut-turut sejak Mei 2020.') +
    '</div>' +
    '<div class="card">' +
    '<h3>Tiga tujuan ekspor terbesar, 2025</h3>' +
    '<p class="card-sub">Miliar dolar Amerika Serikat.</p>' +
    horizontalBars({ rows: destRows, decimals: 2, label: 'Tiga tujuan ekspor terbesar 2025', labelW: 140, width: 480, rowH: 30 }) +
    interpretation('Tiongkok menyerap USD 64,82 miliar, lebih dari dua kali Amerika Serikat di urutan kedua, 30,96 miliar. India di urutan ketiga dengan 18,32 miliar.') +
    '<h4 style="font-family:var(--serif);margin:14px 0 4px;font-size:15px">Migas dan nonmigas</h4>' +
    '<ul class="plain-list">' +
    '<li><strong>Ekspor nonmigas</strong> USD ' + num(t.nonOilExport, 2) + ' miliar, surplus ' + num(t.nonOilSurplus, 2) + ' miliar</li>' +
    '<li><strong>Defisit migas</strong> USD ' + num(t.oilDeficit, 2) + ' miliar</li>' +
    '<li><strong>Surplus total</strong> USD ' + num(t.surplus, 2) + ' miliar</li>' +
    '</ul>' +
    interpretation('Seluruh surplus datang dari nonmigas; migas justru defisit, jadi neraca positif ini bergantung pada komoditas dan manufaktur, bukan energi.') +
    '</div>' +
    '</div>' +

    footnote(
      '<strong>Sumber:</strong> BPS, Berita Resmi Statistik neraca perdagangan, 2 Februari 2026: ekspor USD 282,91 miliar, impor USD 241,86 miliar, surplus USD 41,05 miliar. ' +
      'Seri 2020 sampai 2025 untuk ekspor dan impor barang dari Bank Dunia WDI, dalam miliar dolar, dipakai untuk bentuk tren. ' +
      'Tiga tujuan ekspor dan rincian migas dari rilis BPS yang sama.'
    )
  );
}

// ------------------------------------------------------------------ data

export function renderData(state) {
  const releaseItems = RELEASES.map(
    (r) =>
      '<li>' +
      '<span class="rel-date">' + esc(r.date) + '</span>' +
      '<div><p class="rel-title"><a href="' + r.href + '">' + esc(r.title) + '</a></p>' +
      '<p class="rel-line">' + esc(r.line) + '</p></div>' +
      '</li>',
  ).join('');

  const sourceItems = SOURCES.map(
    (s) =>
      '<li>' +
      '<span class="src-name">' + esc(s.name) + '</span> ' +
      '<a class="src-url" href="' + s.url + '">' + esc(s.url.replace(/^https:\/\//, '')) + '</a>' +
      '<span class="src-covers">' + esc(s.covers) + '</span>' +
      '</li>',
  ).join('');

  const tableRows = SERIES_KEYS.map((key) => {
    const series = SERIES[key];
    const cells = series.values
      .map((v) => '<td' + (v === null ? ' class="null-mark"' : '') + '>' + (v === null ? 'belum terbit' : num(v, series.decimals)) + '</td>')
      .join('');
    return '<tr><th scope="row">' + esc(series.label) + '<br><span class="small muted">' + esc(series.unit) + '</span></th>' + cells + '</tr>';
  }).join('');

  return (
    pageHead({
      crumbs: '<a href="' + href(state, '/') + '">Beranda</a>',
      title: 'Data dan unduhan',
      dek: 'Enam rilis terakhir, seri angka lengkap 2019 sampai 2025, dan lima sumber yang dipakai.',
      stamp: UPDATED,
    }) +

    '<div class="split-wide split">' +
    '<div class="card">' +
    '<h3>Seri nasional, 2019 sampai 2025</h3>' +
    '<p class="card-sub">Angka yang dipakai seluruh halaman, dalam satu tabel. Kosong berarti belum terbit, bukan nol.</p>' +
    '<div class="table-wrap"><table class="data">' +
    '<caption>Enam indikator, tujuh tahun. Sumber BPS kecuali dinyatakan lain.</caption>' +
    '<thead><tr><th scope="col">Indikator</th>' + YEARS.map((y) => '<th scope="col">' + y + '</th>').join('') + '</tr></thead>' +
    '<tbody>' + tableRows + '</tbody>' +
    '</table></div>' +
    '<p class="small muted" style="margin-top:8px">Kosong pada TPT dan kemiskinan 2025 karena pengukurannya Agustus dan September. Angka terverifikasi terbaru, Februari dan Maret 2025, ditampilkan di kartu beranda dan halaman kerja serta ekonomi.</p>' +
    '</div>' +
    '<div class="card">' +
    '<h3>Sumber</h3>' +
    '<p class="card-sub">Lima sumber, peran masing-masing.</p>' +
    '<ul class="source-list">' + sourceItems + '</ul>' +
    '</div>' +
    '</div>' +

    '<div class="section-head"><h2>Rilis terakhir</h2><span class="aside">Enam rilis, terbaru di atas</span></div>' +
    '<ul class="release-list">' + releaseItems + '</ul>' +

    '<div class="note"><p><strong>Cara mengutip.</strong> Setiap halaman mencantumkan sumber dan tahun di bawah grafik atau tabelnya, dan setiap kartu menyebut sumber plus tahunnya. Kalau dua sumber memberi angka berbeda untuk hal yang sama, halaman menyebut kedua angka dan menjelaskan bedanya, bukan memilih satu diam-diam.</p></div>' +

    footnote(
      '<strong>Catatan unduhan:</strong> situs ini bekerja tanpa jaringan. Semua angka ada di dalam berkas app/data.js sebagai data biasa, sehingga bisa disalin, dicocokkan, atau dipakai ulang tanpa memanggil server mana pun. ' +
      'Tidak ada berkas Excel atau CSV terpisah; tabel di halaman ini adalah bentuk unduhannya, dan angka aslinya dapat dibaca langsung dari berkas data.'
    )
  );
}

// ------------------------------------------------------------------ tentang

export function renderAbout(state) {
  return (
    pageHead({
      crumbs: '<a href="' + href(state, '/') + '">Beranda</a>',
      title: 'Tentang NusaStat',
      dek: 'Siapa yang menyusun, dari mana angkanya, dan di mana batasnya.',
      stamp: UPDATED,
    }) +

    '<div class="split">' +
    '<div class="card">' +
    '<h3>Apa yang situs ini lakukan</h3>' +
    '<p>NusaStat menyusun angka nasional Indonesia dari dua sumber utama, Badan Pusat Statistik dan Bank Dunia, lalu menyajikannya sebagai satu dashboard yang bisa digeser tahunnya dan satu peta yang bisa diklik. Tujuannya sederhana: satu tempat untuk tahu keadaan Indonesia pada satu tahun, dengan sumber yang jelas di setiap angka.</p>' +
    '<p>Pembeda situs ini ada di beranda. Slider tahun 2019 sampai 2025 menghitung ulang delapan kartu utama dan strip ringkasan, sementara peta 38 provinsi bisa diklik untuk membuka panel rinciannya. Dua gestur itu bekerja tanpa memuat ulang halaman dan tanpa jaringan.</p>' +
    '<h4 style="font-family:var(--serif);margin:14px 0 4px">Prinsip yang dipegang</h4>' +
    '<ul class="plain-list">' +
    '<li><strong>Tidak ada angka tanpa sumber dan tahun.</strong> Setiap kartu, grafik dan tabel menyebut asalnya.</li>' +
    '<li><strong>Angka kosong ditampilkan kosong.</strong> Kalau satu tahun belum terbit, grafiknya berlubang, bukan nol.</li>' +
    '<li><strong>Perbedaan metode dijelaskan, bukan disembunyikan.</strong> Penduduk BPS dan Bank Dunia berbeda; keduanya dicantumkan.</li>' +
    '<li><strong>Tidak ada permintaan jaringan.</strong> Situs berjalan dari berkas lokal, juga di telepon.</li>' +
    '</ul>' +
    '</div>' +
    '<div class="card">' +
    '<h3>Metode dan batas</h3>' +
    '<ul class="plain-list">' +
    '<li><strong>Penduduk.</strong> BPS memakai proyeksi antar sensus dengan basis Sensus Penduduk 2020. Bank Dunia memakai estimasi PBB. Untuk 2024 selisihnya 1,9 juta jiwa.</li>' +
    '<li><strong>Inflasi.</strong> BPS mengukur Desember terhadap Desember. Bank Dunia memakai rata-rata tahunan.</li>' +
    '<li><strong>Pengangguran.</strong> BPS memakai Sakernas, Bank Dunia memakai model ILO.</li>' +
    '<li><strong>Kemiskinan.</strong> BPS memakai garis kemiskinan nasional, Bank Dunia memakai USD 2,15 per hari (PPP 2017).</li>' +
    '<li><strong>Harapan hidup.</strong> BPS 2025 mencatat 74,47 tahun, Bank Dunia 2024 mencatat 71,3 tahun; metode tidak langsung versus estimasi PBB.</li>' +
    '<li><strong>Provinsi.</strong> Angka peta dan tabel adalah perkiraan 2024. IPM provinsi memakai rilis 2025, tahun berbeda, dan disebut terpisah.</li>' +
    '</ul>' +
    '<h4 style="font-family:var(--serif);margin:14px 0 4px">Yang belum ada</h4>' +
    '<p class="small">Situs ini tidak memuat data deret waktu provinsi, tidak memuat angka kemiskinan provinsi, dan tidak menyediakan unduhan spreadsheet. Tiga hal itu butuh rilis yang belum diverifikasi, jadi lebih baik tidak ditampilkan daripada ditebak.</p>' +
    '</div>' +
    '</div>' +

    '<div class="section-head"><h2>Sumber lengkap</h2><span class="aside">Lima sumber</span></div>' +
    '<ul class="source-list">' +
    SOURCES.map((s) => '<li><span class="src-name">' + esc(s.name) + '</span> <a class="src-url" href="' + s.url + '">' + esc(s.url.replace(/^https:\/\//, '')) + '</a><span class="src-covers">' + esc(s.covers) + '</span></li>').join('') +
    '</ul>' +

    '<div class="section-head"><h2>Dua sumber, satu angka, dua metode</h2><span class="aside">Kenapa angkanya bisa berbeda</span></div>' +
    '<div class="table-wrap"><table class="data">' +
    '<caption>Ukuran yang sama diukur berbeda oleh BPS dan Bank Dunia. Tidak ada yang salah; populasinya atau metodenya berbeda.</caption>' +
    '<thead><tr><th scope="col">Ukuran</th><th scope="col">BPS</th><th scope="col">Bank Dunia</th><th scope="col">Sebab selisih</th></tr></thead>' +
    '<tbody>' +
    '<tr class="is-me"><td>Penduduk 2024</td><td>281,6 juta</td><td>283,5 juta</td><td>Proyeksi antar sensus versus estimasi PBB</td></tr>' +
    '<tr><td>Inflasi 2024</td><td>1,57 persen</td><td>2,18 persen</td><td>Desember terhadap Desember versus rata-rata tahunan</td></tr>' +
    '<tr><td>Pengangguran 2024</td><td>4,91 persen</td><td>3,30 persen</td><td>Sakernas versus model ILO</td></tr>' +
    '<tr><td>Kemiskinan 2024</td><td>8,57 persen</td><td>5,4 persen</td><td>Garis nasional versus USD 2,15 per hari (PPP 2017)</td></tr>' +
    '<tr><td>Harapan hidup</td><td>74,47 tahun (2025)</td><td>71,3 tahun (2024)</td><td>Metode tidak langsung Susenas versus estimasi PBB</td></tr>' +
    '</tbody></table></div>' +
    '<p class="small muted" style="margin-top:6px">Halaman-halaman lain memakai angka BPS untuk seri nasional dan angka Bank Dunia hanya untuk pembandingan lintas negara, supaya satu tabel tidak pernah mencampur dua metode tanpa label.</p>' +

    '<div class="btn-row">' +
    '<a class="btn" href="' + href(state, '/') + '">Kembali ke dashboard</a>' +
    '<a class="btn ghost" href="' + href(state, '/data') + '">Data dan unduhan</a>' +
    '</div>' +

    footnote(
      '<strong>Tentang pembaruan:</strong> data terakhir diperiksa 27 November 2026. Rilis BPS terbaru yang dipakai adalah pertumbuhan ekonomi 2025 (5 Februari 2026) dan neraca perdagangan 2025 (2 Februari 2026). ' +
      'Angka yang belum terbit tidak diisi dengan perkiraan.'
    )
  );
}

// ------------------------------------------------------------------ 404

export function renderNotFound(state) {
  return (
    '<div class="error-page">' +
    '<p class="code">404</p>' +
    '<h1>Halaman tidak ditemukan</h1>' +
    '<p>Alamat ini tidak ada di NusaStat. Mungkin tautannya salah ketik, atau halamannya sudah diganti nama.</p>' +
    '<div class="btn-row" style="justify-content:center">' +
    '<a class="btn" href="' + href(state, '/') + '">Kembali ke dashboard</a>' +
    '<a class="btn ghost" href="' + href(state, '/data') + '">Data dan unduhan</a>' +
    '</div>' +
    '</div>' +
    footnote('<strong>Coba juga:</strong> <a href="' + href(state, '/ekonomi') + '">Ekonomi</a>, <a href="' + href(state, '/provinsi') + '">Provinsi</a>, <a href="' + href(state, '/banding') + '">Banding ASEAN</a>.')
  );
}

// ------------------------------------------------------------------ chrome

export function setActiveNav(path) {
  document.querySelectorAll('.nav a').forEach((a) => {
    const target = a.getAttribute('href');
    const normal = target === '#/' ? '/' : target.replace(/^#/, '');
    if (path && normal === path) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

// Wire the controls that exist on the rendered page. Called after every render,
// so a control always belongs to the markup currently on screen.
export function bindChrome(state) {
  const slider = document.getElementById('year-slider');
  if (slider) {
    const apply = (year) => {
      const params = new URLSearchParams(location.hash.split('?')[1] || '');
      if (Number(year) === LATEST_YEAR) params.delete('tahun');
      else params.set('tahun', String(year));
      const query = params.toString();
      const base = state.path === '/' ? '#/' : '#' + state.path;
      location.hash = base + (query ? '?' + query : '');
    };
    slider.addEventListener('input', () => {
      const readout = document.getElementById('year-readout');
      if (readout) readout.textContent = slider.value;
    });
    slider.addEventListener('change', () => apply(slider.value));
    slider.addEventListener('keyup', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') apply(slider.value);
    });
  }

  document.querySelectorAll('.year-pills button[data-year]').forEach((button) => {
    button.addEventListener('click', () => {
      const params = new URLSearchParams(location.hash.split('?')[1] || '');
      const year = Number(button.getAttribute('data-year'));
      if (year === LATEST_YEAR) params.delete('tahun');
      else params.set('tahun', String(year));
      const query = params.toString();
      const base = state.path === '/' ? '#/' : '#' + state.path;
      location.hash = base + (query ? '?' + query : '');
    });
  });

  // Map metric: only the two map buttons carry data-metric, so the selector is
  // scoped to the map toggle to avoid colliding with the compare toggle.
  document.querySelectorAll('.map-toggle [data-metric]').forEach((button) => {
    button.addEventListener('click', () => {
      const metric = button.getAttribute('data-metric');
      const params = new URLSearchParams(location.hash.split('?')[1] || '');
      if (metric === 'pop') params.delete('metrik');
      else params.set('metrik', metric);
      const query = params.toString();
      const base = state.path === '/' ? '#/' : '#' + state.path;
      location.hash = base + (query ? '?' + query : '');
    });
  });

  // Compare metric: five measures, kept in ?ukur= so a link reproduces the view.
  document.querySelectorAll('.metric-toggle [data-metric]').forEach((button) => {
    button.addEventListener('click', () => {
      const metric = button.getAttribute('data-metric');
      const params = new URLSearchParams(location.hash.split('?')[1] || '');
      if (metric === 'pcap') params.delete('ukur');
      else params.set('ukur', metric);
      const query = params.toString();
      location.hash = '#/banding' + (query ? '?' + query : '');
    });
  });

  // Chart range on the cover macro card, and the rank panel's measure. Both
  // live in the URL beside the year so a copied link reproduces the view.
  const setParam = (key, value, fallback) => {
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    if (value === fallback) params.delete(key);
    else params.set(key, value);
    const query = params.toString();
    const base = state.path === '/' ? '#/' : '#' + state.path;
    location.hash = base + (query ? '?' + query : '');
  };

  document.querySelectorAll('.range-toggle [data-range]').forEach((button) => {
    button.addEventListener('click', () => setParam('rentang', button.getAttribute('data-range'), 'panjang'));
  });

  document.querySelectorAll('.rank-toggle [data-rank]').forEach((button) => {
    button.addEventListener('click', () => setParam('urut', button.getAttribute('data-rank'), 'pop'));
  });

  // Province clicks: the map's own links point at #/provinsi?pilih=, which would
  // drop the current year on the cover and the current metric on the province
  // page. Intercept both and rebuild the hash with the state that is on screen,
  // so one click never silently resets another control.
  const mapStage = document.getElementById('map-stage');
  if (mapStage && (state.path === '/' || state.path === '/provinsi')) {
    mapStage.addEventListener('click', (event) => {
      const link = event.target.closest && event.target.closest('a[href*="pilih="]');
      if (!link) return;
      event.preventDefault();
      const name = new URLSearchParams(link.getAttribute('href').split('?')[1] || '').get('pilih');
      if (!name) return;
      const params = new URLSearchParams();
      if (state.year !== LATEST_YEAR) params.set('tahun', String(state.year));
      if (state.metric !== 'pop') params.set('metrik', state.metric);
      params.set('pilih', name);
      const base = state.path === '/' ? '#/' : '#' + state.path;
      location.hash = base + '?' + params.toString();
    });
  }

  const input = document.getElementById('indicator-search');
  const results = document.getElementById('search-results');
  const goButton = document.getElementById('search-go');

  const showHits = () => {
    if (!input || !results) return;
    const hits = searchIndicators(input.value).slice(0, 6);
    if (!input.value.trim()) {
      results.hidden = true;
      results.innerHTML = '';
      return;
    }
    results.hidden = false;
    results.innerHTML = hits.length
      ? '<ul>' + hits.map((hit) => '<li><a href="' + hit.href + '"><span>' + esc(hit.keys[0]) + '<br><span class="hit-section">' + esc(hit.answer) + '</span></span><span class="hit-answer">buka</span></a></li>').join('') + '</ul>'
      : '<p class="search-empty">Tidak ada indikator yang cocok. Coba: inflasi, ipm, ekspor, provinsi.</p>';
  };

  const submit = () => {
    if (!input) return;
    const hits = searchIndicators(input.value);
    if (hits.length) {
      location.hash = hits[0].href;
      if (results) results.hidden = true;
    } else {
      showHits();
    }
  };

  if (input) {
    input.addEventListener('input', showHits);
    input.addEventListener('focus', showHits);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submit();
      }
      if (event.key === 'Escape' && results) {
        results.hidden = true;
      }
    });
  }
  if (goButton) goButton.addEventListener('click', submit);

  if (results) {
    document.addEventListener('click', (event) => {
      if (!results.contains(event.target) && event.target !== input) results.hidden = true;
    });
  }
}
