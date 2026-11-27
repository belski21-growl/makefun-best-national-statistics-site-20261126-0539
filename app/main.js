// NusaStat entry module: hash router, shared state, and the two gestures the
// site is built around. Every figure lives in data.js; this file only decides
// which year and which province are focused and which view renders.
//
// State lives in the URL so a reload, a back button and a copied link all show
// the same dashboard: #/ , #/provinsi?pilih=Aceh , #/ekonomi?tahun=2020 .

import { LATEST_YEAR, YEARS } from './data.js';
import { renderHome, renderNotFound } from './views.js';
import { renderEconomy, renderPopulation, renderPrice, renderLabour, renderEducation, renderHealth, renderTrade, renderData, renderAbout } from './views.js';
import { renderProvincePage } from './views.js';
import { renderCompare } from './compare.js';
import { bindChrome, setActiveNav } from './views.js';

// Routes are matched on the hash path only; the query holds the focus state.
const ROUTES = {
  '/': { view: renderHome, nav: '/' },
  '/ekonomi': { view: renderEconomy, nav: '/ekonomi' },
  '/penduduk': { view: renderPopulation, nav: '/penduduk' },
  '/provinsi': { view: renderProvincePage, nav: '/provinsi' },
  '/harga': { view: renderPrice, nav: '/harga' },
  '/kerja': { view: renderLabour, nav: '/kerja' },
  '/pendidikan': { view: renderEducation, nav: '/pendidikan' },
  '/kesehatan': { view: renderHealth, nav: '/kesehatan' },
  '/perdagangan': { view: renderTrade, nav: '/perdagangan' },
  '/banding': { view: renderCompare, nav: '/banding' },
  '/data': { view: renderData, nav: '/data' },
  '/tentang': { view: renderAbout, nav: '/tentang' },
};

const main = document.getElementById('main');

// The focused year: inside 2019 to 2025, else the latest. Read from ?tahun=.
export function currentState() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart = ''] = raw.split('?');
  const path = pathPart === '' ? '/' : pathPart;
  const params = new URLSearchParams(queryPart);

  const yearRaw = Number(params.get('tahun'));
  const year = YEARS.includes(yearRaw) ? yearRaw : LATEST_YEAR;

  const metricRaw = params.get('metrik');
  const metric = metricRaw === 'density' ? 'density' : metricRaw === 'pop' ? 'pop' : 'pop';

  const compareRaw = params.get('ukur');
  const compareMetric = compareRaw || 'pcap';

  return {
    path,
    year,
    province: params.get('pilih') || null,
    metric,
    compareMetric,
    params,
  };
}

// Build a hash for a route, keeping the focused year unless told otherwise.
export function routeHash(path, options = {}) {
  const state = currentState();
  const year = options.year === undefined ? state.year : Number(options.year);
  const params = new URLSearchParams();
  if (options.keep !== false && YEARS.includes(year) && year !== LATEST_YEAR) params.set('tahun', String(year));
  if (options.province) params.set('pilih', options.province);
  if (options.metric && options.metric !== 'pop') params.set('metrik', options.metric);
  if (options.compareMetric && options.compareMetric !== 'pcap') params.set('ukur', options.compareMetric);
  const query = params.toString();
  return '#' + path + (query ? '?' + query : '');
}

// Everything that must follow the focused year: the URL and the readout.
export function go(hash) {
  if (location.hash === hash) {
    render();
  } else {
    location.hash = hash;
  }
}

function scrollToTop() {
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const target = document.querySelector('.page-head') || main;
  if (target && typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
}

let lastPath = null;

function render(options = {}) {
  const state = currentState();
  const route = ROUTES[state.path];
  if (!route) {
    main.innerHTML = renderNotFound(state);
    setActiveNav(null);
    bindChrome(state);
    document.title = titleFor(state.path);
    if (options.scroll || (lastPath !== null && lastPath !== state.path)) scrollToTop();
    lastPath = state.path;
    return;
  }

  main.innerHTML = route.view(state);
  setActiveNav(route.nav);
  bindChrome(state);
  document.title = titleFor(state.path);
  // Scroll only when the route actually changed after a first paint: a first
  // load must keep the masthead in view, and a year change must not jump.
  if (options.scroll || (lastPath !== null && lastPath !== state.path)) scrollToTop();
  lastPath = state.path;
}

function titleFor(path) {
  const names = {
    '/': 'NusaStat: portal data Indonesia 2019 sampai 2025',
    '/ekonomi': 'Ekonomi Indonesia: NusaStat',
    '/penduduk': 'Penduduk Indonesia: NusaStat',
    '/provinsi': '38 provinsi Indonesia: NusaStat',
    '/harga': 'Harga dan inflasi: NusaStat',
    '/kerja': 'Ketenagakerjaan: NusaStat',
    '/pendidikan': 'Pendidikan dan IPM: NusaStat',
    '/kesehatan': 'Kesehatan: NusaStat',
    '/perdagangan': 'Perdagangan luar negeri: NusaStat',
    '/banding': 'Banding ASEAN dan dunia: NusaStat',
    '/data': 'Data dan unduhan: NusaStat',
    '/tentang': 'Tentang NusaStat dan metodenya',
  };
  return names[path] || 'NusaStat: halaman tidak ditemukan';
}

window.addEventListener('hashchange', () => render());
window.addEventListener('DOMContentLoaded', () => {});

// Render right away: the module is deferred, so the DOM is already parsed.
render({ scroll: false });
