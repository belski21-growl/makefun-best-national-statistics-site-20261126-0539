// SPDX-License-Identifier: MIT
// Halaman-halaman NusaStat. Semua nilai di-escape sebelum masuk ke halaman.
// Setiap halaman bisa dicapai lewat tautan (hash route); semua kontrol berfungsi.

import {
  YEARS, SERIES, HEADLINE_2024, AGE_GROUPS, SECTORS, PRICE_GROUPS,
  PROVINCES, density, RELEASES, SOURCES,
} from './data.js';
import { barChart, lineChart, hbarChart, sparkline } from './charts.js';
import { WORLD_LINES, peerTable } from './compare.js';
import { provinceMapSVG, mapLegend } from './map.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const fmtID = (n) => String(n).replace('.', ',');
const num = (n) => n.toLocaleString('id-ID');

function nav(active) {
  const links = [
    ['#/', 'Beranda'],
    ['#/ekonomi', 'Ekonomi'],
    ['#/penduduk', 'Penduduk'],
    ['#/provinsi', 'Provinsi'],
    ['#/harga', 'Harga'],
    ['#/kerja', 'Ketenagakerjaan'],
    ['#/data', 'Data & Unduhan'],
    ['#/tentang', 'Tentang'],
  ];
  return `<nav class="mainnav" aria-label="Navigasi utama">${links.map(([href, label]) => `<a href="${href}"${href === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
}

function sourceNote(text) {
  return `<p class="source">Sumber: ${esc(text)}</p>`;
}

function kpiCards() {
  return `<section class="kpi-grid" aria-label="Indikator utama 2024">${HEADLINE_2024.map((k) => {
    const series = SERIES[k.key];
    const spark = series ? sparkline(series.values, k.key === 'gdpGrowth' || k.key === 'inflation' ? '#b45309' : '#0f766e') : '';
    const world = WORLD_LINES[k.key] ? `<div class="world-line">${esc(WORLD_LINES[k.key])}</div>` : '';
    return `<article class="kpi"><div class="kpi-value">${esc(k.value)}</div><div class="kpi-label">${esc(k.sub)}</div>${world}${spark}<div class="kpi-src">${esc(k.source)}</div></article>`;
  }).join('')}</section>`;
}

export function home() {
  const rows = RELEASES.slice(0, 4).map((r) => `<li><time>${esc(r.date)}</time><a href="#/data">${esc(r.title)}</a><p>${esc(r.text)}</p></li>`).join('');
  return `${nav('#/')}
<section class="hero">
  <p class="eyebrow">Portal data resmi yang independen &middot; Indonesia</p>
  <h1>Angka Indonesia,<br>dijelaskan dengan jujur.</h1>
  <p class="lede">NusaStat mengumpulkan angka-angka utama tentang Indonesia — penduduk, ekonomi, harga, dan pekerjaan — dari publikasi resmi, menampilkannya dengan konteks, dan selalu menulis dari mana angka itu berasal.</p>
  <p class="hero-cta"><a class="btn" href="#/ekonomi">Jelajahi ekonomi &rarr;</a> <a class="btn ghost" href="#/provinsi">Bandingkan 38 provinsi</a></p>
  <p class="hero-meta">Data terbaru: 2024 &middot; 38 provinsi &middot; 6 seri tahunan 2019&ndash;2024 &middot; Semua angka berlabel sumber</p>
</section>
${kpiCards()}
<section class="panel insight">
  <h2>Apa kata data</h2>
  <p>Angka nasional memang membaik — ekonomi tumbuh di atas 5%, inflasi kembali di bawah 2%, dan pengangguran turun tiap tahun sejak 2020 — tapi satu angka untuk seluruh Indonesia menutupi jarak antar-daerah: hampir seperlima penduduk tinggal di satu provinsi saja, Jawa Barat (sekitar 50 juta jiwa), sementara kepadatan Jakarta lebih dari seribu kali lipat Papua. Karena itu tren beberapa tahun lebih penting daripada satu tahun saja: pertumbuhan yang bertahan, harga yang kenaikannya melambat, dan kemiskinan yang turun perlahan menunjukkan arah yang membaik — meski titik awalnya berbeda-beda di tiap provinsi dan tiap kelompok masyarakat.</p>
</section>
<section class="panel">
  <h2>Bandingkan dengan negara sebanding</h2>
  <p>Indonesia melawan tetangga Asia Tenggara dan rata-rata dunia — semua angka tahun 2024 dari Bank Dunia, supaya sebanding. PDB per kapita Indonesia ($4.925) berada di atas Vietnam ($4.717) dan Filipina ($3.985), tapi masih di bawah Thailand ($7.387) dan Malaysia ($11.874); harapan hidup 71,3 tahun masih di bawah rata-rata dunia 73,5 tahun.</p>
  ${peerTable()}
</section>
<section class="two-col">
  <div>
    <h2>Pertumbuhan ekonomi 2019&ndash;2024</h2>
    ${barChart({ labels: YEARS.map(String), values: SERIES.gdpGrowth.values, unit: '%' })}
    ${sourceNote(SERIES.gdpGrowth.note)}
    <p class="chart-note">Cara membaca: pertumbuhan dihitung dari PDB harga konstan 2010 — membandingkan volume produksi antar-tahun, bukan harga. Batang 2020 yang negatif adalah kontraksi pandemi COVID-19.</p>
    <p><a href="#/ekonomi">Lihat semua seri ekonomi &rarr;</a></p>
  </div>
  <div>
    <h2>Rilis terbaru</h2>
    <ul class="releases">${rows}</ul>
    <p><a href="#/data">Semua rilis &amp; tabel data &rarr;</a></p>
  </div>
</section>
<section>
  <h2>Kenapa angka di sini bisa dipercaya?</h2>
  <ol class="trust">
    <li><strong>Setiap angka punya sumber.</strong> Tahun acuan dan penerbit ditulis di bawah tiap grafik dan tabel.</li>
    <li><strong>Perkiraan diberi label.</strong> Angka yang dibulatkan atau ditaksir selalu ditulis &ldquo;sekitar&rdquo; atau &ldquo;perkiraan&rdquo; — tidak ada presisi palsu.</li>
    <li><strong>Metode terbuka.</strong> Cara menghitung, pembulatan, dan batasan data dijelaskan di halaman <a href="#/tentang">Tentang</a>.</li>
  </ol>
</section>`;
}

export function economy(state) {
  const key = state.series || 'gdpGrowth';
  const s = SERIES[key];
  const chart = state.chart === 'line'
    ? lineChart({ labels: YEARS.map(String), values: s.values, unit: s.unit })
    : barChart({ labels: YEARS.map(String), values: s.values, unit: s.unit });
  const opts = Object.entries(SERIES).filter(([k]) => ['gdpGrowth', 'gdpNominal', 'inflation', 'unemployment', 'poverty'].includes(k))
    .map(([k, v]) => `<option value="${k}"${k === key ? ' selected' : ''}>${esc(v.label)} (${esc(v.unit)})</option>`).join('');
  const table = `<table class="data-table"><thead><tr><th>Tahun</th><th>${esc(s.label)} (${esc(s.unit)})</th></tr></thead><tbody>${YEARS.map((y, i) => `<tr><td>${y}</td><td>${fmtID(s.values[i])}</td></tr>`).join('')}</tbody></table>`;
  const explain = {
    gdpGrowth: 'Cara membaca: PDB harga konstan 2010 — membandingkan volume produksi antar-tahun, bukan harga. Perubahan harga (inflasi) sudah dikeluarkan dari angka ini.',
    gdpNominal: 'Cara membaca: PDB atas dasar harga berlaku — memakai harga tahun berjalan, jadi angkanya naik bila harga naik walau volume tetap. Bandingkan dengan pertumbuhan (harga konstan) untuk melihat volume.',
    inflation: 'Cara membaca: inflasi y-on-y Desember — harga Desember dibanding Desember tahun sebelumnya. IHK (Indeks Harga Konsumen) mengukur rata-rata harga barang dan jasa yang dibeli rumah tangga.',
    unemployment: 'Cara membaca: TPT = penganggur dibagi angkatan kerja (yang bekerja ditambah yang mencari kerja), diukur tiap Agustus lewat Sakernas. Yang tidak mencari kerja tidak dihitung sebagai penganggur.',
    poverty: 'Cara membaca: persentase penduduk dengan pengeluaran di bawah garis kemiskinan nasional, diukur tiap Maret dan September lewat Susenas. Garisnya berbeda dari garis kemiskinan Bank Dunia ($2,15/hari).',
  }[key] || '';
  const sectors = hbarChart({ items: SECTORS.map((x) => ({ name: x.name, value: x.share })), unit: '%' });
  return `${nav('#/ekonomi')}
<h1>Ekonomi</h1>
<p class="lede">Pertumbuhan, PDB, inflasi, pengangguran, dan kemiskinan Indonesia 2019&ndash;2024 — pilih seri dan jenis grafiknya.</p>
<section class="panel">
  <div class="controls">
    <label>Seri: <select id="econ-series">${opts}</select></label>
    <label>Jenis grafik:
      <select id="econ-chart">
        <option value="bar"${state.chart !== 'line' ? ' selected' : ''}>Batang</option>
        <option value="line"${state.chart === 'line' ? ' selected' : ''}>Garis</option>
      </select>
    </label>
    <button class="btn small" id="econ-csv" type="button">Unduh CSV seri ini</button>
  </div>
  <h2>${esc(s.label)} <span class="muted">(${esc(s.unit)})</span></h2>
  ${chart}
  ${sourceNote(s.note)}
  <p class="chart-note">${esc(explain)}</p>
  <details><summary>Lihat sebagai tabel</summary>${table}</details>
</section>
<section class="panel">
  <h2>PDB menurut lapangan usaha, 2024</h2>
  <p>Pangsa tiap lapangan usaha terhadap PDB (persen, perkiraan, dibulatkan). Industri pengolahan tetap penyumbang terbesar.</p>
  ${sectors}
  ${sourceNote('Pangsa dihitung dari PDB atas dasar harga berlaku 2024; angka dibulatkan, total sekitar 100%. Sumber: BPS.')}
</section>
<section class="panel">
  <h2>Membaca angka ini</h2>
  <ul>
    <li><strong>2020 minus 2,07%</strong> adalah kontraksi pandemi COVID-19 — satu-satunya tahun negatif dalam seri ini.</li>
    <li><strong>Inflasi 2022 (5,51%)</strong> melonjak karena penyesuaian harga BBM bersubsidi pada September 2022.</li>
    <li><strong>Kemiskinan 8,57%</strong> pada September 2024 adalah level terendah dalam seri ini.</li>
  </ul>
</section>`;
}

export function people(state) {
  const pop = lineChart({ labels: YEARS.map(String), values: SERIES.population.values, unit: 'jt jiwa' });
  const age = hbarChart({ items: AGE_GROUPS.map((a) => ({ name: a.group, value: a.pct })), unit: '%' });
  const top = [...PROVINCES].sort((a, b) => b.pop - a.pop).slice(0, 10);
  const rows = top.map((p, i) => `<tr><td>${i + 1}</td><td><a href="#/provinsi?cari=${encodeURIComponent(p.name)}">${esc(p.name)}</a></td><td>${fmtID(p.pop)} jt</td><td>${num(density(p))} /km&sup2;</td></tr>`).join('');
  return `${nav('#/penduduk')}
<h1>Penduduk</h1>
<p class="lede">Indonesia berpenduduk sekitar 281,6 juta jiwa pada pertengahan 2024 — negara terpadat keempat di dunia — dan lebih dari separuhnya tinggal di Pulau Jawa.</p>
<section class="panel">
  <h2>Jumlah penduduk 2019&ndash;2024</h2>
  ${pop}
  ${sourceNote(SERIES.population.note)}
  <p class="chart-note">Cara membaca: penduduk pertengahan tahun di seluruh Indonesia; angka 2020 berasal dari Sensus Penduduk, tahun lain dari proyeksi antar-sensus BPS. Bank Dunia mencatat 283,5 juta untuk 2024 — sedikit di atas angka BPS karena perbedaan metode proyeksi.</p>
  <p>Antara Sensus 2010 (237,6 juta) dan Sensus 2020 (270,2 juta), penduduk bertambah rata-rata sekitar 1,25% per tahun. Laju itu terus melambat: proyeksi resmi memperkirakan penduduk menembus 300 juta sekitar 2034.</p>
</section>
<section class="two-col">
  <div class="panel">
    <h2>Struktur umur 2024</h2>
    ${age}
    ${sourceNote('Pangsa tiap kelompok umur, perkiraan dari Sensus 2020 dan proyeksi BPS.')}
    <p>Bonus demografi: sekitar 69% penduduk berada di usia produktif (15–64 tahun).</p>
  </div>
  <div class="panel">
    <h2>10 provinsi terpadat</h2>
    <table class="data-table"><thead><tr><th>#</th><th>Provinsi</th><th>Penduduk</th><th>Kepadatan</th></tr></thead><tbody>${rows}</tbody></table>
    <p><a href="#/provinsi">Bandingkan semua 38 provinsi &rarr;</a></p>
  </div>
</section>`;
}

function provinceRows(list) {
  return list.map((p) => `<tr><td><a href="#/provinsi?pilih=${encodeURIComponent(p.name)}">${esc(p.name)}</a></td><td>${fmtID(p.pop)}</td><td>${num(p.area * 1000)}</td><td>${num(density(p))}</td></tr>`).join('');
}

export function provinces(state) {
  const q = (state.cari || '').toLowerCase();
  const sort = state.urut || 'pop';
  let list = PROVINCES.filter((p) => !q || p.name.toLowerCase().includes(q));
  if (sort === 'pop') list = [...list].sort((a, b) => b.pop - a.pop);
  else if (sort === 'density') list = [...list].sort((a, b) => density(b) - density(a));
  else if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'id'));
  const total = PROVINCES.reduce((s, p) => s + p.pop, 0);
  const picked = state.pilih ? PROVINCES.find((p) => p.name === state.pilih) : null;
  const detail = picked ? `<section class="panel detail">
    <h2>${esc(picked.name)}</h2>
    <dl class="facts">
      <dt>Penduduk (perkiraan 2024)</dt><dd>${fmtID(picked.pop)} juta jiwa (${((picked.pop / total) * 100).toFixed(1).replace('.', ',')}% dari Indonesia)</dd>
      <dt>Luas daratan (sekitar)</dt><dd>${num(picked.area * 1000)} km&sup2;</dd>
      <dt>Kepadatan</dt><dd>${num(density(picked))} jiwa/km&sup2;</dd>
    </dl>
    <p>${picked.name === 'DKI Jakarta' ? 'Provinsi terpadat: sekitar 16.000 jiwa per km², lebih dari 100 kali rata-rata nasional.' : picked.pop >= 40 ? 'Salah satu dari tiga provinsi di Pulau Jawa yang menampung lebih dari sepertiga penduduk Indonesia.' : 'Angka di atas adalah perkiraan 2024 yang dibulatkan; lihat halaman Tentang untuk metode dan sumbernya.'}</p>
    <p><a href="#/provinsi">Tutup detail</a></p>
  </section>` : '';
  return `${nav('#/provinsi')}
<h1>Provinsi</h1>
<p class="lede">38 provinsi, dari Aceh sampai Papua Selatan. Cari, urutkan, dan klik sebuah provinsi untuk melihat detailnya.</p>
<section class="panel map-panel">
  <h2>Peta penduduk 2024</h2>
  <div class="map-wrap">${provinceMapSVG(state.pilih)}</div>
  ${mapLegend()}
  <p class="chart-note">Cara membaca: warna menunjukkan jumlah penduduk 2024 — makin gelap, makin banyak penduduk. Klik provinsi mana pun untuk melihat detailnya di bawah peta. Peta ini skematik: bentuk provinsi disederhanakan dari letak geografisnya, bukan batas resmi.</p>
</section>
<div class="controls">
  <label>Cari provinsi: <input id="prov-search" type="search" placeholder="mis. Jawa Barat" value="${esc(state.cari || '')}"></label>
  <label>Urutkan:
    <select id="prov-sort">
      <option value="pop"${sort === 'pop' ? ' selected' : ''}>Penduduk terbanyak</option>
      <option value="density"${sort === 'density' ? ' selected' : ''}>Terpadat</option>
      <option value="name"${sort === 'name' ? ' selected' : ''}>Nama A–Z</option>
    </select>
  </label>
  <button class="btn small" id="prov-csv" type="button">Unduh CSV tabel ini</button>
</div>
${detail}
<p class="muted" role="status">${list.length} dari 38 provinsi ditampilkan &middot; jumlah angka provinsi yang dibulatkan di tabel ini: sekitar ${fmtID(Math.round(total * 10) / 10)} juta jiwa (angka nasional BPS: 281,6 juta — selisihnya dari pembulatan tiap provinsi).</p>
<table class="data-table"><thead><tr><th>Provinsi</th><th>Penduduk (juta, 2024)</th><th>Luas (km&sup2;)</th><th>Kepadatan (jiwa/km&sup2;)</th></tr></thead><tbody>${provinceRows(list) || '<tr><td colspan="4">Tidak ada provinsi yang cocok. Hapus kata kunci pencarian.</td></tr>'}</tbody></table>
${sourceNote('Penduduk: perkiraan pertengahan 2024, dibulatkan ke 0,1 juta. Luas: daratan, sekitar. Sumber: BPS; pemekaran Papua (2022) sudah tercermin — 38 provinsi, bukan 34.')}`;
}

export function prices(state) {
  const inf = barChart({ labels: YEARS.map(String), values: SERIES.inflation.values, unit: '%' });
  const groups = hbarChart({ items: PRICE_GROUPS, unit: '%' });
  return `${nav('#/harga')}
<h1>Harga</h1>
<p class="lede">Inflasi Indonesia — berapa cepat harga-harga naik — dan kelompok barang apa yang paling mendorongnya.</p>
<section class="panel">
  <h2>Inflasi tahunan 2019&ndash;2024</h2>
  ${inf}
  ${sourceNote(SERIES.inflation.note)}
  <p class="chart-note">Cara membaca: inflasi y-on-y — harga Desember dibanding Desember tahun sebelumnya. IHK mengukur rata-rata harga barang dan jasa yang dibeli rumah tangga; inflasi inti (di luar harga bergejolak dan harga yang diatur pemerintah) tidak termasuk dalam grafik ini.</p>
  <p>Bank Indonesia menargetkan inflasi di kisaran 2,5% &plusmn; 1% (2024). Inflasi Desember 2024 sebesar 1,57% berada di bawah batas bawah sasaran — harga-harga naik lebih lambat dari target.</p>
</section>
<section class="panel">
  <h2>Inflasi menurut kelompok, Desember 2024</h2>
  ${groups}
  ${sourceNote('Inflasi y-on-y tiap kelompok pengeluaran, sekitar, dibulatkan ke 0,1%. Sumber: BPS.')}
  <p class="chart-note">Cara membaca: perubahan harga rata-rata tiap kelompok selama setahun; kelompok dengan bobot belanja besar (makanan) lebih memengaruhi inflasi umum daripada kelompok kecil. Kelompok informasi dan komunikasi turun karena tarif komunikasi lebih murah.</p>
  <p>Perawatan pribadi naik paling cepat (sekitar 5%), sementara tarif informasi dan komunikasi justru turun sedikit — satu-satunya kelompok yang deflasi.</p>
</section>
<section class="panel">
  <h2>Istilah yang dipakai</h2>
  <dl class="facts">
    <dt>IHK</dt><dd>Indeks Harga Konsumen — rata-rata harga barang dan jasa yang dibeli rumah tangga.</dd>
    <dt>y-on-y</dt><dd>Dibandingkan bulan yang sama tahun lalu (year-on-year).</dd>
    <dt>Inflasi inti</dt><dd>Inflasi di luar harga bergejolak (makanan segar) dan harga yang diatur pemerintah.</dd>
  </dl>
</section>`;
}

export function labour() {
  const unemp = lineChart({ labels: YEARS.map(String), values: SERIES.unemployment.values, unit: '%' });
  return `${nav('#/kerja')}
<h1>Ketenagakerjaan</h1>
<p class="lede">Siapa yang bekerja, di mana, dan berapa yang masih mencari kerja.</p>
<section class="panel">
  <h2>Tingkat Pengangguran Terbuka 2019&ndash;2024</h2>
  ${unemp}
  ${sourceNote(SERIES.unemployment.note)}
  <p class="chart-note">Cara membaca: TPT = penganggur dibagi angkatan kerja, diukur tiap Agustus (Sakernas). &ldquo;Penganggur&rdquo; berarti tidak bekerja dan sedang mencari kerja — orang yang tidak mencari kerja (misalnya pelajar penuh waktu) tidak dihitung.</p>
  <p>Pengangguran melonjak ke 7,07% pada Agustus 2020 saat pandemi, lalu turun tiap tahun hingga 4,91% pada Agustus 2024 — level terendah dalam seri ini.</p>
</section>
<section class="two-col">
  <div class="panel">
    <h2>Di mana orang bekerja? (sekitar, 2024)</h2>
    ${hbarChart({ items: [
      { name: 'Pertanian', value: 28.5 },
      { name: 'Perdagangan', value: 18.9 },
      { name: 'Industri pengolahan', value: 13.9 },
      { name: 'Konstruksi', value: 8.4 },
      { name: 'Jasa lainnya', value: 30.3 },
    ], unit: '%' })}
    ${sourceNote('Pangsa pekerja menurut lapangan usaha utama, perkiraan dari Sakernas Agustus 2024. Sumber: BPS.')}
  </div>
  <div class="panel">
    <h2>Angka kunci Agustus 2024</h2>
    <dl class="facts">
      <dt>Angkatan kerja</dt><dd>Sekitar 152 juta orang</dd>
      <dt>Bekerja</dt><dd>Sekitar 144,6 juta orang</dd>
      <dt>Pengangguran</dt><dd>Sekitar 7,5 juta orang (4,91%)</dd>
      <dt>Pekerja informal</dt><dd>Sekitar 59% dari yang bekerja</dd>
      <dt>TPT lulusan SMA</dt><dd>Sekitar 8,6% — tertinggi menurut pendidikan</dd>
    </dl>
    <p class="source">Angka dibulatkan; sumber: BPS, Sakernas Agustus 2024.</p>
  </div>
</section>`;
}

export function dataPage() {
  const rows = RELEASES.map((r) => `<tr><td>${esc(r.date)}</td><td>${esc(r.title)}</td><td>${esc(r.text)}</td></tr>`).join('');
  const seriesRows = Object.entries(SERIES).map(([k, s]) => `<tr><td>${esc(s.label)}</td><td>${YEARS.map((y, i) => `${y}: ${fmtID(s.values[i])}`).join(' &middot; ')}</td><td>${esc(s.unit)}</td></tr>`).join('');
  return `${nav('#/data')}
<h1>Data &amp; Unduhan</h1>
<p class="lede">Semua angka yang dipakai situs ini, dalam tabel yang bisa disalin dan diunduh sebagai CSV — tanpa perlu mendaftar.</p>
<section class="panel">
  <h2>Unduh dataset</h2>
  <div class="controls">
    <button class="btn" id="dl-series" type="button">Seri tahunan 2019–2024 (CSV)</button>
    <button class="btn" id="dl-prov" type="button">Tabel 38 provinsi (CSV)</button>
    <button class="btn" id="dl-prices" type="button">Inflasi menurut kelompok (CSV)</button>
  </div>
  <p class="muted">Berkas dibuat langsung di perambanmu dari data halaman ini — tidak ada yang diunduh dari server lain.</p>
</section>
<section class="panel">
  <h2>Seri tahunan nasional</h2>
  <table class="data-table"><thead><tr><th>Indikator</th><th>2019–2024</th><th>Satuan</th></tr></thead><tbody>${seriesRows}</tbody></table>
</section>
<section class="panel">
  <h2>Rilis yang dirujuk</h2>
  <table class="data-table"><thead><tr><th>Tanggal</th><th>Rilis</th><th>Isi</th></tr></thead><tbody>${rows}</tbody></table>
</section>`;
}

export function about() {
  const src = SOURCES.map((s) => `<li><strong>${esc(s.name)}</strong> — ${esc(s.what)} <a href="${esc(s.url)}">${esc(s.url)}</a></li>`).join('');
  return `${nav('#/tentang')}
<h1>Tentang NusaStat</h1>
<p class="lede">NusaStat adalah situs statistik independen tentang Indonesia — bukan situs resmi pemerintah dan bukan tiruan dari situs mana pun. Desain, teks, dan penyajiannya dibuat sendiri untuk kompetisi ini.</p>
<section class="panel">
  <h2>Dari mana angkanya?</h2>
  <ul>${src}</ul>
  <p>Angka utama (penduduk, PDB, inflasi, pengangguran, kemiskinan, IPM) diambil dari rilis Badan Pusat Statistik. Angka yang dibulatkan atau ditaksir selalu diberi label &ldquo;sekitar&rdquo; atau &ldquo;perkiraan&rdquo;, dan tahun acuannya ditulis di samping angka.</p>
</section>
<section class="panel">
  <h2>Metode &amp; batasan</h2>
  <ul>
    <li>Semua angka dibulatkan ke satu desimal (atau ke bilangan bulat bila satuannya besar). Pembulatan bisa membuat total tidak persis 100%.</li>
    <li>Angka provinsi adalah perkiraan pertengahan 2024 yang dibulatkan ke 0,1 juta jiwa; kepadatan dihitung dari angka penduduk dan luas tersebut.</li>
    <li>Situs ini statis dan bekerja luring: tidak ada data yang diambil dari internet saat dibuka, tidak ada pelacak, dan tidak ada data pengunjung yang dikirim ke mana pun.</li>
    <li>Angka diperbarui mengikuti rilis BPS; halaman ini terakhir diperbarui November 2026.</li>
  </ul>
</section>
<section class="panel">
  <h2>Pertanyaan yang sering ditanyakan</h2>
  <dl class="facts">
    <dt>Dari mana datanya?</dt><dd>Angka utama dari rilis Badan Pusat Statistik (BPS). Angka perbandingan dengan negara lain dari Bank Dunia (World Development Indicators, 2024). Tiap angka menulis sumbernya di samping grafik atau tabel.</dd>
    <dt>Seberapa baru datanya?</dt><dd>Angka utama memakai tahun acuan 2024; rilis terbaru yang dirujuk berasal dari November 2025. Perbandingan dunia memakai data 2024 — tahun terbaru yang tersedia untuk semua negara sekaligus.</dd>
    <dt>Bisa dibandingkan dengan negara lain?</dt><dd>Bisa. Beranda punya tabel &ldquo;Bandingkan dengan negara sebanding&rdquo; (Malaysia, Thailand, Vietnam, Filipina, dan rata-rata dunia), dan tiap kartu indikator utama menulis nilai dunianya di samping nilai Indonesia.</dd>
  </dl>
</section>
<section class="panel">
  <h2>Kontak &amp; koreksi</h2>
  <p>Menemukan angka yang salah atau ketinggalan zaman? Setiap halaman menulis sumbernya — bandingkan dengan rilis BPS terbaru dan kirim koreksi melalui <a href="https://www.bps.go.id">bps.go.id</a>. Situs ini tidak menerima kiriman data dari pengunjung.</p>
  <p><a href="#/">&larr; Kembali ke Beranda</a></p>
</section>`;
}

export function missing() {
  return `${nav('#/')}
<h1>Halaman tidak ditemukan</h1>
<p>Halaman yang kamu cari tidak ada di NusaStat. Coba salah satu halaman ini:</p>
<ul>
  <li><a href="#/">Beranda</a> — indikator utama Indonesia</li>
  <li><a href="#/ekonomi">Ekonomi</a> — PDB, inflasi, kemiskinan</li>
  <li><a href="#/provinsi">Provinsi</a> — 38 provinsi</li>
  <li><a href="#/data">Data &amp; Unduhan</a> — semua tabel dan CSV</li>
</ul>`;
}
