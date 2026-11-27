// NusaStat chart engine: plain SVG strings, no canvas, no library, no network.
// Every chart takes numbers and returns markup, so a view only decides layout.
// Colours come from CSS variables so the page theme and the charts never drift.

import { num } from './data.js';

const px = (n) => Math.round(n * 100) / 100;

export function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ------------------------------------------------------------------ helpers

function extent(values) {
  const clean = values.filter((v) => v !== null && v !== undefined && !Number.isNaN(Number(v))).map(Number);
  if (!clean.length) return { min: 0, max: 1 };
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  if (min === max) return { min: min - 1, max: max + 1 };
  return { min, max };
}

function niceTicks(min, max, count = 4) {
  const span = max - min || 1;
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) || mag * 10;
  const start = Math.floor(min / step) * step;
  const ticks = [];
  for (let v = start; v <= max + step * 0.5; v += step) ticks.push(px(v));
  return ticks;
}

// A line through points as a smooth-ish polyline: straight segments read better
// for seven annual observations than a spline that invents curvature.
function polyline(points) {
  return points.map((p, i) => (i === 0 ? 'M' : 'L') + px(p.x) + ' ' + px(p.y)).join(' ');
}

// ------------------------------------------------------------------ sparkline

// A 7 point trend for a KPI card. No axis, no labels: it is a shape, the number
// beside it carries the meaning.
export function sparkline(values, options = {}) {
  const w = options.w || 96;
  const h = options.h || 26;
  const clean = values.filter((v) => v !== null && v !== undefined);
  if (clean.length < 2) return '';
  const e = extent(clean);
  const pad = 3;
  const stepX = (w - pad * 2) / (clean.length - 1);
  const points = clean.map((v, i) => ({
    x: pad + i * stepX,
    y: h - pad - ((v - e.min) / (e.max - e.min)) * (h - pad * 2),
  }));
  const last = points[points.length - 1];
  const id = 'sp' + Math.random().toString(36).slice(2, 8);
  return (
    '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" aria-hidden="true" focusable="false">' +
    '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="var(--accent)" stop-opacity="0.28"/>' +
    '<stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>' +
    '</linearGradient></defs>' +
    '<path d="' + polyline(points) + ' L ' + px(last.x) + ' ' + h + ' L ' + px(points[0].x) + ' ' + h + ' Z" fill="url(#' + id + ')"/>' +
    '<path d="' + polyline(points) + '" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>' +
    '<circle cx="' + px(last.x) + '" cy="' + px(last.y) + '" r="2.6" fill="var(--accent)"/>' +
    '</svg>'
  );
}

// ------------------------------------------------------------------ columns

// Vertical columns, signed: negative years (2020) hang below the zero line.
export function columns(chart) {
  const { years, values, width = 560, height = 240 } = chart;
  const decimals = chart.decimals === undefined ? 2 : chart.decimals;
  const label = chart.label || '';
  const highlight = chart.highlight;
  const hasNegative = values.some((v) => v !== null && Number(v) < 0);

  const padLeft = 34;
  const padRight = 10;
  const padTop = 16;
  const padBottom = 26;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const e = extent(values);
  let min = hasNegative ? Math.min(0, e.min) : 0;
  let max = Math.max(0, e.max);
  if (min === max) max = min + 1;
  const ticks = niceTicks(min, max, 4);
  min = Math.min(min, ticks[0]);
  max = Math.max(max, ticks[ticks.length - 1]);

  const yOf = (v) => padTop + plotH - ((v - min) / (max - min)) * plotH;
  const slot = plotW / years.length;
  const barW = Math.min(46, slot * 0.58);

  const grid = ticks
    .map(
      (t) =>
        '<line x1="' + padLeft + '" y1="' + px(yOf(t)) + '" x2="' + (padLeft + plotW) + '" y2="' + px(yOf(t)) + '" class="grid' + (t === 0 ? ' zero' : '') + '"/>' +
        '<text x="' + (padLeft - 6) + '" y="' + px(yOf(t) + 3.5) + '" class="axis" text-anchor="end">' + num(t, Math.abs(t) < 10 && decimals > 0 ? 0 : 0) + '</text>',
    )
    .join('');

  const bars = values
    .map((v, i) => {
      if (v === null || v === undefined) {
        const cx = padLeft + slot * i + slot / 2;
        return (
          '<g class="null-col"><line x1="' + px(cx) + '" y1="' + px(yOf(0) - 10) + '" x2="' + px(cx) + '" y2="' + px(yOf(0)) + '" class="null-tick"/>' +
          '<text x="' + px(cx) + '" y="' + px(yOf(0) - 14) + '" class="null-label" text-anchor="middle">belum terbit</text></g>'
        );
      }
      const zeroY = yOf(0);
      const valueY = yOf(v);
      const top = Math.min(zeroY, valueY);
      const h = Math.max(2, Math.abs(valueY - zeroY));
      const cx = padLeft + slot * i + slot / 2;
      const isHi = highlight !== undefined && highlight !== null && years[i] === Number(highlight);
      return (
        '<g class="col' + (isHi ? ' is-hi' : '') + (v < 0 ? ' is-neg' : '') + '">' +
        '<rect x="' + px(cx - barW / 2) + '" y="' + px(top) + '" width="' + px(barW) + '" height="' + px(h) + '" rx="2" class="bar"/>' +
        '<text x="' + px(cx) + '" y="' + px(v >= 0 ? top - 5 : top + h + 12) + '" class="bar-value" text-anchor="middle">' + num(v, decimals) + '</text>' +
        '</g>'
      );
    })
    .join('');

  const xLabels = years
    .map(
      (y, i) =>
        '<text x="' + px(padLeft + slot * i + slot / 2) + '" y="' + (height - 8) + '" class="axis' + (highlight && Number(highlight) === y ? ' is-hi' : '') + '" text-anchor="middle">' + y + '</text>',
    )
    .join('');

  return (
    '<svg class="chart chart-columns" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + escapeHTML(label) + '" preserveAspectRatio="none">' +
    grid + bars + xLabels +
    '<line x1="' + padLeft + '" y1="' + px(yOf(0)) + '" x2="' + (padLeft + plotW) + '" y2="' + px(yOf(0)) + '" class="axis-line"/>' +
    '</svg>'
  );
}

// ------------------------------------------------------------------ line

export function line(chart) {
  const { years, values, width = 560, height = 240 } = chart;
  const decimals = chart.decimals === undefined ? 1 : chart.decimals;
  const label = chart.label || '';
  const highlight = chart.highlight;
  const showArea = chart.area !== false;

  const padLeft = 40;
  const padRight = 14;
  const padTop = 18;
  const padBottom = 26;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const present = values.map((v, i) => ({ v, i })).filter((p) => p.v !== null && p.v !== undefined);
  const e = extent(present.map((p) => p.v));
  const span = e.max - e.min;
  const min = e.min - span * 0.18;
  const max = e.max + span * 0.16;
  const ticks = niceTicks(min, max, 4);

  const xOf = (i) => padLeft + (plotW / Math.max(1, years.length - 1)) * i;
  const yOf = (v) => padTop + plotH - ((v - min) / (max - min)) * plotH;

  const points = present.map((p) => ({ x: xOf(p.i), y: yOf(p.v), v: p.v, i: p.i }));

  const grid = ticks
    .map(
      (t) =>
        '<line x1="' + padLeft + '" y1="' + px(yOf(t)) + '" x2="' + (padLeft + plotW) + '" y2="' + px(yOf(t)) + '" class="grid"/>' +
        '<text x="' + (padLeft - 7) + '" y="' + px(yOf(t) + 3.5) + '" class="axis" text-anchor="end">' + num(t, decimals) + '</text>',
    )
    .join('');

  const areaPath = showArea
    ? '<path d="' + polyline(points) + ' L ' + px(points[points.length - 1].x) + ' ' + px(yOf(min)) + ' L ' + px(points[0].x) + ' ' + px(yOf(min)) + ' Z" class="area"/>'
    : '';

  const dots = points
    .map((p) => {
      const isHi = highlight !== undefined && highlight !== null && years[p.i] === Number(highlight);
      return (
        '<g class="dot' + (isHi ? ' is-hi' : '') + '">' +
        '<circle cx="' + px(p.x) + '" cy="' + px(p.y) + '" r="' + (isHi ? 4.6 : 3.2) + '" class="dot-mark"/>' +
        (isHi
          ? '<text x="' + px(p.x) + '" y="' + px(p.y - 12) + '" class="dot-label" text-anchor="middle">' + num(p.v, decimals) + '</text>'
          : '')
        + '</g>'
      );
    })
    .join('');

  const xLabels = years
    .map((y, i) => '<text x="' + px(xOf(i)) + '" y="' + (height - 8) + '" class="axis' + (highlight && Number(highlight) === y ? ' is-hi' : '') + '" text-anchor="middle">' + y + '</text>')
    .join('');

  return (
    '<svg class="chart chart-line" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + escapeHTML(label) + '" preserveAspectRatio="none">' +
    grid + areaPath +
    '<path d="' + polyline(points) + '" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>' +
    dots + xLabels +
    '</svg>'
  );
}

// ------------------------------------------------------------------ grouped columns

// Two signed series side by side, for exports and imports.
export function groupedColumns(chart) {
  const { years, series, width = 560, height = 240 } = chart;
  const decimals = chart.decimals === undefined ? 1 : chart.decimals;
  const padLeft = 38;
  const padRight = 12;
  const padTop = 22;
  const padBottom = 34;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const all = series.flatMap((s) => s.values).filter((v) => v !== null && v !== undefined);
  const e = extent(all);
  const max = e.max * 1.1;
  const ticks = niceTicks(0, max, 4);
  const top = ticks[ticks.length - 1];
  const yOf = (v) => padTop + plotH - (v / top) * plotH;
  const slot = plotW / years.length;
  const barW = Math.min(20, (slot * 0.62) / series.length);

  const grid = ticks
    .map(
      (t) =>
        '<line x1="' + padLeft + '" y1="' + px(yOf(t)) + '" x2="' + (padLeft + plotW) + '" y2="' + px(yOf(t)) + '" class="grid' + (t === 0 ? ' zero' : '') + '"/>' +
        '<text x="' + (padLeft - 6) + '" y="' + px(yOf(t) + 3.5) + '" class="axis" text-anchor="end">' + num(t, 0) + '</text>',
    )
    .join('');

  const bars = years
    .map((year, i) => {
      const cx = padLeft + slot * i + slot / 2;
      return series
        .map((s, si) => {
          const v = s.values[i];
          if (v === null || v === undefined) return '';
          const x = cx - (barW * series.length) / 2 + si * barW;
          return (
            '<rect x="' + px(x) + '" y="' + px(yOf(v)) + '" width="' + px(barW - 3) + '" height="' + px(plotH - (yOf(v) - padTop)) + '" rx="2" class="bar ' + (s.className || '') + '"/>' +
            '<text x="' + px(x + (barW - 3) / 2) + '" y="' + px(yOf(v) - 5) + '" class="bar-value small" text-anchor="middle">' + num(v, decimals) + '</text>'
          );
        })
        .join('');
    })
    .join('');

  const xLabels = years.map((y, i) => '<text x="' + px(padLeft + slot * i + slot / 2) + '" y="' + (height - 16) + '" class="axis" text-anchor="middle">' + y + '</text>').join('');

  const legend = series
    .map((s) => '<g><rect x="0" y="0" width="9" height="9" rx="2" class="bar ' + (s.className || '') + '" transform="translate(' + (padLeft + series.indexOf(s) * 118) + ',' + (height - 11) + ')"/><text x="' + (padLeft + series.indexOf(s) * 118 + 14) + '" y="' + (height - 3) + '" class="axis">' + escapeHTML(s.label) + '</text></g>')
    .join('');

  return (
    '<svg class="chart chart-grouped" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + escapeHTML(chart.label || '') + '" preserveAspectRatio="none">' +
    grid + bars + xLabels + legend +
    '<line x1="' + padLeft + '" y1="' + px(yOf(0)) + '" x2="' + (padLeft + plotW) + '" y2="' + px(yOf(0)) + '" class="axis-line"/>' +
    '</svg>'
  );
}

// ------------------------------------------------------------------ horizontal bars

// Rows of labelled bars, signed: a negative row (deflation) draws left of the
// zero line and is labelled as such.
export function horizontalBars(chart) {
  const { rows } = chart;
  const decimals = chart.decimals === undefined ? 1 : chart.decimals;
  const width = chart.width || 560;
  const rowH = chart.rowH || 26;
  const barH = Math.min(16, rowH - 10);
  const labelW = chart.labelW || 250;
  const valueW = 62;
  const height = rows.length * rowH + 12;
  const plotW = width - labelW - valueW - 8;
  const vals = rows.map((r) => r.value);
  const e = extent(vals);
  const min = Math.min(0, e.min);
  const max = Math.max(0, e.max);
  const span = max - min || 1;
  const xOf = (v) => ((v - min) / span) * plotW;
  const zeroX = xOf(0);

  const bars = rows
    .map((r, i) => {
      const y = 6 + i * rowH;
      const valueX = xOf(r.value);
      const left = Math.min(zeroX, valueX);
      const w = Math.max(2, Math.abs(valueX - zeroX));
      const isNeg = r.value < 0;
      return (
        '<g class="hbar' + (isNeg ? ' is-neg' : '') + (r.hi ? ' is-hi' : '') + '">' +
        '<text x="0" y="' + px(y + barH / 2 + 4) + '" class="hbar-label">' + escapeHTML(r.label) + '</text>' +
        '<rect x="' + px(labelW + left) + '" y="' + px(y) + '" width="' + px(w) + '" height="' + barH + '" rx="2" class="bar"/>' +
        '<text x="' + px(width - 2) + '" y="' + px(y + barH / 2 + 4) + '" class="hbar-value" text-anchor="end">' + (isNeg ? '-' : '') + num(Math.abs(r.value), decimals) + '</text>' +
        '</g>'
      );
    })
    .join('');

  return (
    '<svg class="chart chart-hbars" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + escapeHTML(chart.label || '') + '" style="height:auto">' +
    '<line x1="' + px(labelW + zeroX) + '" y1="2" x2="' + px(labelW + zeroX) + '" y2="' + (height - 4) + '" class="axis-line"/>' +
    bars +
    '</svg>'
  );
}

// ------------------------------------------------------------------ log bars

// GDP per capita across seven economies spans 24 times, so a linear bar makes
// Indonesia and the Philippines invisible. Log scale keeps every bar readable.
export function logBars(chart) {
  const { rows } = chart;
  const decimals = chart.decimals === undefined ? 0 : chart.decimals;
  const width = chart.width || 620;
  const rowH = chart.rowH || 34;
  const labelW = 108;
  const valueW = 76;
  const height = rows.length * rowH + 26;
  const plotW = width - labelW - valueW - 10;
  const vals = rows.map((r) => r.value).filter((v) => v > 0);
  const lo = Math.log10(Math.min(...vals) * 0.85);
  const hi = Math.log10(Math.max(...vals) * 1.05);
  const xOf = (v) => ((Math.log10(v) - lo) / (hi - lo)) * plotW;

  const ticks = [1000, 3000, 10000, 30000, 100000].filter((t) => Math.log10(t) >= lo && Math.log10(t) <= hi);

  const grid = ticks
    .map(
      (t) =>
        '<line x1="' + px(labelW + xOf(t)) + '" y1="4" x2="' + px(labelW + xOf(t)) + '" y2="' + (height - 22) + '" class="grid"/>' +
        '<text x="' + px(labelW + xOf(t)) + '" y="' + (height - 8) + '" class="axis" text-anchor="middle">' + num(t, 0) + '</text>',
    )
    .join('');

  const bars = rows
    .map((r, i) => {
      const y = 6 + i * rowH;
      const w = Math.max(2, xOf(r.value));
      return (
        '<g class="logrow' + (r.me ? ' is-me' : '') + '">' +
        '<text x="0" y="' + px(y + 13) + '" class="hbar-label">' + escapeHTML(r.name) + '</text>' +
        '<rect x="' + labelW + '" y="' + px(y) + '" width="' + px(w) + '" height="14" rx="2" class="bar"/>' +
        '<text x="' + px(width - 2) + '" y="' + px(y + 12) + '" class="hbar-value" text-anchor="end">' + num(r.value, decimals) + '</text>' +
        '</g>'
      );
    })
    .join('');

  return (
    '<svg class="chart chart-log" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + escapeHTML(chart.label || '') + '" style="height:auto">' +
    grid + bars +
    '</svg>'
  );
}

// ------------------------------------------------------------------ stacked share bar

// One horizontal bar split into parts, used for age structure and GDP sectors.
export function shareBar(rows, options = {}) {
  const width = options.width || 620;
  const height = options.height || 26;
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  let x = 0;
  const parts = rows
    .map((r, i) => {
      const w = (r.value / total) * width;
      const seg = '<rect x="' + px(x) + '" y="0" width="' + px(Math.max(0, w - 1.5)) + '" height="' + height + '" rx="2" class="seg seg-' + (i % 6) + '"><title>' + escapeHTML(r.label) + ': ' + num(r.value, 1) + ' persen</title></rect>';
      x += w;
      return seg;
    })
    .join('');
  return '<svg class="chart chart-share" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + escapeHTML(options.label || 'Komposisi') + '" preserveAspectRatio="none">' + parts + '</svg>';
}

// ------------------------------------------------------------------ province ranks

// Top provinces by a metric, drawn as thin bars, to give the province page a
// second view beside the map.
export function provinceRanks(rows, options = {}) {
  const decimals = options.decimals === undefined ? 1 : options.decimals;
  const width = options.width || 430;
  const rowH = 21;
  const labelW = 132;
  const valueW = 66;
  const height = rows.length * rowH + 6;
  const max = Math.max(...rows.map((r) => r.value)) || 1;
  const plotW = width - labelW - valueW - 8;
  const bars = rows
    .map((r, i) => {
      const y = i * rowH;
      const w = (r.value / max) * plotW;
      return (
        '<g class="rankrow">' +
        '<text x="0" y="' + px(y + 13) + '" class="hbar-label">' + escapeHTML(r.name) + '</text>' +
        '<rect x="' + labelW + '" y="' + px(y + 3) + '" width="' + px(w) + '" height="11" rx="2" class="bar"/>' +
        '<text x="' + px(width - 2) + '" y="' + px(y + 13) + '" class="hbar-value" text-anchor="end">' + num(r.value, decimals) + '</text>' +
        '</g>'
      );
    })
    .join('');
  return '<svg class="chart chart-ranks" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + escapeHTML(options.label || '') + '" style="height:auto">' + bars + '</svg>';
}
