// SPDX-License-Identifier: MIT
// Grafik SVG tanpa library: bar chart, line chart, dan horizontal bar chart.
// Semua grafik digambar dari data lokal, tanpa network.
//
// REVISI RONDE 2: (1) nilai null ditoleransi — seri yang tahun terakhirnya
// belum terverifikasi (mis. TPT Agustus 2025) digambar dengan celah, bukan
// nol palsu; (2) opsi log: true untuk bar chart berskala log (PDB/kapita
// ASEAN — Singapura 19× Indonesia, skala linear akan menyembunyikan negara
// lain; grid memakai pangkat 10 dan label tetap nilai aslinya).

const NS = 'http://www.w3.org/2000/svg';

function fmt(n) {
  return String(n).replace('.', ',');
}

// Pemisah ribuan gaya Indonesia untuk label grid skala log (1.000, 10.000).
function num(n) {
  return n.toLocaleString('id-ID');
}

function niceMax(values) {
  const present = values.filter((v) => v !== null && v !== undefined);
  const m = Math.max(...present.map(Math.abs));
  if (!present.length || m <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(m)));
  const norm = m / pow;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return step * pow;
}

export function barChart({ labels, values, unit = '', color = '#0f766e', height = 260, highlightLast = true, log = false, max: maxOpt = null }) {
  const W = 640;
  const H = height;
  const padL = 56;
  const padB = 34;
  const padT = 18;
  const present = values.filter((v) => v !== null && v !== undefined);
  const max = log ? Math.pow(10, Math.ceil(Math.log10(Math.max(...present)))) : (maxOpt ?? niceMax(values));
  const min = log ? Math.pow(10, Math.floor(Math.log10(Math.min(...present.filter((v) => v > 0))))) : Math.min(0, ...present);
  const span = log ? (Math.log10(max) - Math.log10(min)) : (max - min);
  const plotH = H - padT - padB;
  const plotW = W - padL - 16;
  const n = values.length;
  const slot = plotW / n;
  const bw = Math.min(56, slot * 0.58);
  const yFor = (v) => {
    if (log) return padT + ((Math.log10(max) - Math.log10(v)) / span) * plotH;
    return padT + ((max - v) / span) * plotH;
  };
  const zeroY = log ? padT + plotH : padT + ((max - 0) / span) * plotH;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik batang" class="chart">`;
  // gridlines
  if (log) {
    for (let k = Math.log10(min); k <= Math.log10(max); k += 1) {
      const v = Math.pow(10, k);
      const y = yFor(v);
      s += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - 16}" y2="${y.toFixed(1)}" class="grid"/>`;
      s += `<text x="${padL - 8}" y="${(y + 4).toFixed(1)}" class="axis" text-anchor="end">${num(v)}</text>`;
    }
  } else {
    for (let g = 0; g <= 4; g += 1) {
      const v = min + (span * g) / 4;
      const y = padT + ((max - v) / span) * plotH;
      s += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - 16}" y2="${y.toFixed(1)}" class="grid"/>`;
      s += `<text x="${padL - 8}" y="${(y + 4).toFixed(1)}" class="axis" text-anchor="end">${fmt(Number(v.toFixed(1)))}</text>`;
    }
  }
  s += `<line x1="${padL}" y1="${zeroY.toFixed(1)}" x2="${W - 16}" y2="${zeroY.toFixed(1)}" class="zero"/>`;
  values.forEach((v, i) => {
    const x = padL + slot * i + (slot - bw) / 2;
    s += `<text x="${(x + bw / 2).toFixed(1)}" y="${H - 10}" class="axis" text-anchor="middle">${labels[i]}</text>`;
    if (v === null || v === undefined) return;
    const y = v >= 0 || log ? yFor(v) : zeroY;
    const h = log ? Math.max(1, plotH - (yFor(v) - padT)) : Math.max(1, Math.abs(v) / span * plotH);
    const last = highlightLast && i === n - 1 && v !== null;
    s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="${last ? '#b45309' : color}"><title>${labels[i]}: ${fmt(v)}${unit ? ` ${unit}` : ''}</title></rect>`;
    s += `<text x="${(x + bw / 2).toFixed(1)}" y="${(y - 6).toFixed(1)}" class="val" text-anchor="middle">${fmt(v)}</text>`;
  });
  s += '</svg>';
  return s;
}

export function lineChart({ labels, values, unit = '', color = '#0f766e', height = 260 }) {
  const W = 640;
  const H = height;
  const padL = 56;
  const padB = 34;
  const padT = 22;
  const present = values.filter((v) => v !== null && v !== undefined);
  const max = niceMax(values);
  const min = Math.min(0, ...present);
  const span = max - min;
  const plotH = H - padT - padB;
  const plotW = W - padL - 16;
  const n = values.length;
  const px = (i) => padL + (plotW * i) / (n - 1);
  const py = (v) => padT + ((max - v) / span) * plotH;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik garis" class="chart">`;
  for (let g = 0; g <= 4; g += 1) {
    const v = min + (span * g) / 4;
    const y = py(v);
    s += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - 16}" y2="${y.toFixed(1)}" class="grid"/>`;
    s += `<text x="${padL - 8}" y="${(y + 4).toFixed(1)}" class="axis" text-anchor="end">${fmt(Number(v.toFixed(1)))}</text>`;
  }
  // Garis putus di nilai null (celah jujur, bukan turun ke nol).
  let run = [];
  const flush = () => {
    if (run.length > 1) {
      const pts = run.map(([i, v]) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
      s += `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
    }
    run = [];
  };
  values.forEach((v, i) => {
    if (v === null || v === undefined) { flush(); return; }
    run.push([i, v]);
  });
  flush();
  values.forEach((v, i) => {
    if (v === null || v === undefined) return;
    s += `<circle cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="5" fill="#fff" stroke="${color}" stroke-width="3"><title>${labels[i]}: ${fmt(v)}${unit ? ` ${unit}` : ''}</title></circle>`;
    s += `<text x="${px(i).toFixed(1)}" y="${(py(v) - 12).toFixed(1)}" class="val" text-anchor="middle">${fmt(v)}</text>`;
    s += `<text x="${px(i).toFixed(1)}" y="${H - 10}" class="axis" text-anchor="middle">${labels[i]}</text>`;
  });
  s += '</svg>';
  return s;
}

export function hbarChart({ items, unit = '%', color = '#0f766e', height = null }) {
  const rowH = 34;
  const H = height ?? items.length * rowH + 30;
  const W = 640;
  const padL = 250;
  const max = niceMax(items.map((d) => d.value));
  const min = Math.min(0, ...items.map((d) => d.value));
  const span = max - min;
  const plotW = W - padL - 70;
  const zeroX = padL + ((0 - min) / span) * plotW;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik batang horizontal" class="chart">`;
  items.forEach((d, i) => {
    const y = 14 + i * rowH;
    const w = Math.max(2, (Math.abs(d.value) / span) * plotW);
    const x = d.value >= 0 ? zeroX : zeroX - w;
    s += `<text x="${padL - 10}" y="${y + 13}" class="axis" text-anchor="end">${d.name}</text>`;
    s += `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="18" rx="4" fill="${d.value < 0 ? '#b91c1c' : color}"><title>${d.name}: ${fmt(d.value)}${unit ? ` ${unit}` : ''}</title></rect>`;
    s += `<text x="${(x + w + 8).toFixed(1)}" y="${y + 14}" class="val">${fmt(d.value)}${unit}</text>`;
  });
  s += '</svg>';
  return s;
}

// Small inline sparkline (used on the home page cards).
// Nilai null dilewati supaya sparkline tidak jatuh ke nol.
export function sparkline(values, color = '#0f766e') {
  const present = values.filter((v) => v !== null && v !== undefined);
  const W = 120;
  const H = 36;
  const max = Math.max(...present);
  const min = Math.min(...present);
  const span = max - min || 1;
  const pts = present.map((v, i) => `${((W - 4) * i) / (present.length - 1) + 2},${(H - 4 - ((v - min) / span) * (H - 8)).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" class="spark" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

export { NS };
