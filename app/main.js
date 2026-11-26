// SPDX-License-Identifier: MIT
// NusaStat — router hash + pengikat kontrol halaman.
//
//   #/                     Beranda
//   #/ekonomi              Ekonomi (pilih seri + jenis grafik + CSV)
//   #/penduduk             Penduduk
//   #/provinsi             Provinsi (cari + urutkan + detail + CSV)
//   #/harga                Harga
//   #/kerja                Ketenagakerjaan
//   #/data                 Data & unduhan (CSV)
//   #/tentang              Tentang
//
// window.__shotReady bernilai false saat halaman dirender dan true setelah
// tampil, supaya skrip screenshot tahu kapan menangkap layar.

import { YEARS, SERIES, PROVINCES, PRICE_GROUPS, density } from './data.js';
import {
  home, economy, people, provinces, prices, labour, dataPage, about, missing,
} from './views.js';

const app = document.getElementById('app');

function parseHash() {
  const raw = location.hash || '#/';
  const [pathPart, queryPart] = raw.slice(2).split('?');
  const path = `/${pathPart || ''}`;
  const query = new URLSearchParams(queryPart || '');
  return { path, query };
}

function downloadCsv(filename, header, rows) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const text = [header.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function bindPage(path, state) {
  if (path === '/ekonomi') {
    const seriesSel = document.getElementById('econ-series');
    const chartSel = document.getElementById('econ-chart');
    const rerender = () => {
      state.series = seriesSel.value;
      state.chart = chartSel.value;
      render();
    };
    if (seriesSel) seriesSel.addEventListener('change', rerender);
    if (chartSel) chartSel.addEventListener('change', rerender);
    const btn = document.getElementById('econ-csv');
    if (btn) {
      btn.addEventListener('click', () => {
        const s = SERIES[state.series || 'gdpGrowth'];
        downloadCsv(`nusastat-${state.series || 'gdpGrowth'}.csv`, ['tahun', s.label], YEARS.map((y, i) => [y, s.values[i]]));
      });
    }
  }
  if (path === '/provinsi') {
    const search = document.getElementById('prov-search');
    const sort = document.getElementById('prov-sort');
    if (search) {
      search.addEventListener('input', () => {
        state.cari = search.value;
        render();
        const again = document.getElementById('prov-search');
        if (again) {
          again.focus();
          again.setSelectionRange(again.value.length, again.value.length);
        }
      });
    }
    if (sort) sort.addEventListener('change', () => { state.urut = sort.value; render(); });
    const btn = document.getElementById('prov-csv');
    if (btn) {
      btn.addEventListener('click', () => {
        downloadCsv('nusastat-provinsi.csv', ['provinsi', 'penduduk_juta_2024', 'luas_km2', 'kepadatan_per_km2'],
          PROVINCES.map((p) => [p.name, p.pop, p.area * 1000, density(p)]));
      });
    }
  }
  if (path === '/data') {
    const dlSeries = document.getElementById('dl-series');
    if (dlSeries) {
      dlSeries.addEventListener('click', () => {
        const header = ['tahun', ...Object.values(SERIES).map((s) => s.label)];
        const rows = YEARS.map((y, i) => [y, ...Object.values(SERIES).map((s) => s.values[i])]);
        downloadCsv('nusastat-seri-tahunan.csv', header, rows);
      });
    }
    const dlProv = document.getElementById('dl-prov');
    if (dlProv) {
      dlProv.addEventListener('click', () => {
        downloadCsv('nusastat-provinsi.csv', ['provinsi', 'penduduk_juta_2024', 'luas_km2', 'kepadatan_per_km2'],
          PROVINCES.map((p) => [p.name, p.pop, p.area * 1000, density(p)]));
      });
    }
    const dlPrices = document.getElementById('dl-prices');
    if (dlPrices) {
      dlPrices.addEventListener('click', () => {
        downloadCsv('nusastat-inflasi-kelompok.csv', ['kelompok', 'inflasi_persen_des2024'],
          PRICE_GROUPS.map((g) => [g.name, g.value]));
      });
    }
  }
}

const TITLES = {
  '/': 'NusaStat — Angka Indonesia, Dijelaskan dengan Jujur',
  '/ekonomi': 'Ekonomi | NusaStat',
  '/penduduk': 'Penduduk | NusaStat',
  '/provinsi': 'Provinsi | NusaStat',
  '/harga': 'Harga | NusaStat',
  '/kerja': 'Ketenagakerjaan | NusaStat',
  '/data': 'Data & Unduhan | NusaStat',
  '/tentang': 'Tentang | NusaStat',
};

const state = { series: 'gdpGrowth', chart: 'bar', cari: '', urut: 'pop', pilih: null };

function render() {
  window.__shotReady = false;
  const { path, query } = parseHash();
  state.cari = query.get('cari') ?? state.cari;
  state.pilih = query.get('pilih') ?? null;
  let html;
  if (path === '/') html = home();
  else if (path === '/ekonomi') html = economy(state);
  else if (path === '/penduduk') html = people(state);
  else if (path === '/provinsi') html = provinces(state);
  else if (path === '/harga') html = prices(state);
  else if (path === '/kerja') html = labour();
  else if (path === '/data') html = dataPage();
  else if (path === '/tentang') html = about();
  else html = missing();
  document.title = TITLES[path] || 'Halaman tidak ditemukan | NusaStat';
  app.innerHTML = html;
  bindPage(path, state);
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
