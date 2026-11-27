// Compare page: Indonesia against six other rows on five measures, with a
// metric toggle. The GDP per capita view uses a log scale, because the spread
// from the Philippines to Singapore is more than twenty times and a linear bar
// would hide every row except the last.

import { COMPARE, num } from './data.js';
import { logBars, horizontalBars } from './charts.js';
import { pageHead, footnote, href, esc } from './views.js';

function metricOf(key) {
  return COMPARE.metrics.find((m) => m.key === key) || COMPARE.metrics[0];
}

function chartFor(metric) {
  const rows = COMPARE.rows.map((r) => ({
    name: r.name,
    value: r[metric.key],
    me: r.name === 'Indonesia',
  }));

  if (metric.log) {
    return (
      logBars({
        rows,
        label: metric.label + ' menurut wilayah, ' + COMPARE.year + ', skala logaritma',
        valueSuffix: '',
        width: 640,
        rowH: 34,
      }) + ''
    );
  }

  const sorted = [...rows].sort((a, b) => b.value - a.value);
  return horizontalBars({
    rows: sorted.map((r) => ({ label: r.name, value: r.value, hi: r.me })),
    decimals: metric.decimals,
    label: metric.label + ' menurut wilayah, ' + COMPARE.year,
    labelW: 118,
    width: 640,
    rowH: 28,
  });
}

function table(state) {
  const head =
    '<tr><th scope="col">Wilayah</th>' +
    COMPARE.metrics
      .map(
        (m) =>
          '<th scope="col" class="' + (m.key === state.compareMetric ? 'is-me' : '') + '">' +
          esc(m.label) +
          (m.unit ? ' <span class="small muted">(' + esc(m.unit) + ')</span>' : '') +
          '</th>',
      )
      .join('') +
    '</tr>';

  const body = COMPARE.rows
    .map((row) => {
      const cells = COMPARE.metrics
        .map((m) => {
          const v = row[m.key];
          const cls = v < 0 ? ' class="neg"' : '';
          return '<td' + cls + '>' + num(v, m.decimals) + '</td>';
        })
        .join('');
      return '<tr' + (row.me ? ' class="is-me"' : '') + '><th scope="row">' + esc(row.name) + (row.me ? ' (sorotan)' : '') + '</th>' + cells + '</tr>';
    })
    .join('');

  return (
    '<div class="table-wrap"><table class="data">' +
    '<caption>Tujuh wilayah, lima ukuran, tahun ' + COMPARE.year + '. Sumber: ' + esc(COMPARE.source) + '. Baris Indonesia disorot.</caption>' +
    '<thead>' + head + '</thead><tbody>' + body + '</tbody>' +
    '<tfoot><tr><td colspan="' + (COMPARE.metrics.length + 1) + '">PDB per kapita dalam dolar Amerika Serikat berlaku. Penduduk dalam juta jiwa. Harapan hidup dalam tahun pada saat lahir. Inflasi adalah rata-rata tahunan, bukan Desember terhadap Desember.</td></tr></tfoot>' +
    '</table></div>'
  );
}

export function renderCompare(state) {
  const metric = metricOf(state.compareMetric);

  const toggle = COMPARE.metrics
    .map(
      (m) =>
        '<button type="button" data-metric="' + m.key + '" aria-pressed="' + (m.key === metric.key ? 'true' : 'false') + '">' +
        esc(m.label) +
        '</button>',
    )
    .join('');

  const idn = COMPARE.rows[0];
  const rank = COMPARE.rows
    .map((r) => r[metric.key])
    .sort((a, b) => (metric.key === 'infl' ? a - b : b - a))
    .indexOf(idn[metric.key]) + 1;

  return (
    pageHead({
      crumbs: '<a href="' + href(state, '/') + '">Beranda</a>',
      title: 'Banding ASEAN dan dunia',
      dek: 'Tujuh wilayah, lima ukuran, satu tahun yang sama (' + COMPARE.year + '). Pilih ukuran, grafik dan tabel mengikuti.',
      stamp: 'Sumber: ' + COMPARE.source + ', ' + COMPARE.year,
    }) +

    '<div class="card">' +
    '<div class="metric-toggle" role="group" aria-label="Pilih ukuran">' + toggle + '</div>' +
    '<h2 style="margin:0 0 2px;font-size:18px">' + esc(metric.label) + ', ' + COMPARE.year + '</h2>' +
    '<p class="card-sub">' + esc(metric.note) + ' Indonesia berada di posisi ' + rank + ' dari 7 pada ukuran ini.</p>' +
    chartFor(metric) +
    '<p class="interpretation"><span class="tag">Bacaan</span>' + esc(metric.reading) + '</p>' +
    '</div>' +

    '<div class="section-head"><h2>Tabel lengkap</h2><span class="aside">Kolom ukuran aktif ditandai</span></div>' +
    table(state) +

    '<div class="note warn"><p><strong>Kenapa angkanya beda dengan halaman lain.</strong> Halaman ini memakai satu sumber, Bank Dunia, supaya tujuh wilayah bisa dibandingkan pada tahun yang sama. Halaman nasional memakai BPS, yang mengukur penduduk lewat proyeksi antar sensus dan inflasi Desember terhadap Desember. Dua angka yang berbeda untuk hal yang sama bukan kesalahan; metodenya yang berbeda.</p></div>' +

    '<div class="btn-row">' +
    '<a class="btn" href="' + href(state, '/ekonomi') + '">Ekonomi Indonesia</a>' +
    '<a class="btn ghost" href="' + href(state, '/provinsi') + '">Peta 38 provinsi</a>' +
    '</div>' +

    footnote(
      '<strong>Sumber:</strong> Bank Dunia, World Development Indicators, ' + COMPARE.year + ', diakses 27 November 2026. PDB per kapita (NY.GDP.PCAP.CD), penduduk (SP.POP.TOTL), harapan hidup (SP.DYN.LE00.IN), inflasi (FP.CPI.TOTL.ZG), pertumbuhan PDB (NY.GDP.MKTP.KD.ZG). ' +
      'Baris Dunia adalah agregat Bank Dunia, bukan rata-rata sederhana tujuh wilayah.',
    )
  );
}
