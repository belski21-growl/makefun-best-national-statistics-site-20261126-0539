# Build log — NusaStat (best-national-statistics-site-20261126-0539)

## Yang dibangun

**NusaStat** — portal statistik nasional Indonesia (desain original, Bahasa
Indonesia), situs statis di bawah `app/`, tanpa build step, tanpa library,
tanpa network saat runtime. Grafik SVG digambar sendiri (`app/charts.js`:
bar, line, horizontal bar, sparkline).

Halaman (semua lewat hash route + tautan navigasi):
- `#/` Beranda — hero + 8 kartu KPI 2024 (dengan sparkline) + grafik
  pertumbuhan PDB + rilis terbaru + "kenapa angka ini bisa dipercaya".
- `#/ekonomi` — pilih seri (PDB, PDB nominal, inflasi, pengangguran,
  kemiskinan), pilih jenis grafik (batang/garis), unduh CSV seri, tabel,
  pangsa PDB per lapangan usaha, catatan cara membaca angka.
- `#/penduduk` — tren penduduk 2019–2024, struktur umur, 10 provinsi terpadat.
- `#/provinsi` — cari (live filter), urutkan (penduduk / kepadatan / nama),
  klik provinsi untuk detail, unduh CSV; 38 provinsi.
- `#/harga` — inflasi tahunan + inflasi menurut 11 kelompok pengeluaran,
  glosarium IHK / y-on-y / inflasi inti.
- `#/kerja` — TPT 2019–2024, pangsa pekerja per lapangan usaha, angka kunci
  Sakernas Agustus 2024.
- `#/data` — unduh 3 CSV (seri tahunan, provinsi, inflasi kelompok) yang
  dibuat di peramban dari data halaman; tabel seri + tabel rilis.
- `#/tentang` — sumber, metode & batasan, kontak/koreksi.
- Route tak dikenal menampilkan halaman "tidak ditemukan" dengan tautan.

Data: angka publik BPS (penduduk 281,6 jt 2024; PDB tumbuh 5,03% 2024;
PDB nominal Rp22.139 T; inflasi 1,57%; TPT 4,91%; kemiskinan 8,57%;
IPM 75,02; gini ~0,379). Angka provinsi/luas/kelompok harga adalah
perkiraan yang dibulatkan dan diberi label "sekitar/perkiraan" beserta
tahun acuan + sumber di tiap grafik/tabel. Selisih jumlah provinsi
(282,3 jt) vs angka nasional (281,6 jt) dijelaskan di halaman sebagai
efek pembulatan — bukan disembunyikan.

## File

- `app/index.html`, `app/style.css`, `app/main.js` (router + binding),
  `app/views.js` (8 halaman), `app/data.js` (semua data + sumber),
  `app/charts.js` (grafik SVG tanpa library)
- `main.ts` (salin app/ + screenshots/ ke /output, tulis dossier.json —
  mengikuti pola starter kit), `serve.ts` (server dev lokal),
  `vendor/makefun-frontend.ts` (dari kit, tidak diubah)
- `README.md` (template badge make.fun, terisi), `LICENSE` (MIT),
  `shots.json` (4 tampilan)
- `screenshots/`: 1-home.jpg (1280×800), 2-ekonomi.jpg (1280×800),
  3-provinsi.jpg (1280×800), 4-home-phone.jpg (390×844) — semuanya ASLI,
  diambil dari situs yang sedang berjalan (lihat validasi).

## Validasi yang dijalankan

1. **Serve lokal** (`node serve.ts --port 8123`): index/main.js/data.js/
   style.css semua HTTP 200.
2. **Render semua route** di headless Chromium
   (`chrome-headless-shell`, `--dump-dom`): `#/`, `#/ekonomi`,
   `#/penduduk`, `#/harga`, `#/kerja`, `#/data`, `#/tentang`, dan route
   tak dikenal — semuanya menampilkan konten yang benar (KPI, grafik,
   tabel 38 provinsi, halaman 404).
3. **Cek offline**: tidak ada `fetch`/`XMLHttpRequest`/URL eksternal di
   kode JS/CSS. Satu-satunya `https://` adalah URL sumber (bps.go.id,
   bi.go.id, kemenkeu.go.id) sebagai teks/tautan di halaman Tentang —
   tidak pernah di-fetch saat load. Satu-satunya `http://` lain adalah
   namespace SVG (`w3.org/2000/svg`), bukan network request.
4. **Cek HP**: viewport 390×844 — navigasi membungkus rapi, hero dan kartu
   terbaca, tidak ada overflow horizontal (diverifikasi lewat screenshot).
5. **main.ts 2x run** (`MAKEFUN_OUTPUT_DIR=/tmp/out1` dan `/tmp/out2`):
   `diff -r` identik — **byte-identik**. `dossier.json` terbentuk
   (468.226 byte, kunci: cover/images/schema/text).
6. **Screenshot**: 4 file JPEG kualitas 80, masing-masing < 256 KiB
   (95/74/88/58 KB). Diperiksa visual: Beranda desktop, Ekonomi (grafik
   batang PDB — label grid diperbaiki dari 2 desimal ke 1 desimal setelah
   review visual pertama), Provinsi (tabel + kontrol), Beranda HP.
7. **Perbaikan sesudah review visual**: label sumbu grafik (6,98 → 7,0
   dst.) + penjelasan selisih total provinsi di halaman Provinsi.

## Estimasi rank / peluang (jujur)

- Klasifikasi: RINGAN — 1 sesi builder, web app sekali jalan.
- Target: top 10 (dari 10 tempat berhadiah $5). Lantai: rank 25.
- Estimasi: **rank sekitar 10–25, peluang top 50 sekitar 40–50%**.
  Alasan: entry ini lengkap (8 halaman fungsional, 38 provinsi, CSV,
  grafik interaktif, sumber di tiap angka, screenshot asli desktop+HP,
  main.ts teruji byte-identik) — di atas rata-rata entry "satu halaman
  statis". Tapi hadiahnya kecil ($5/tempat) dan blind rounds berarti
  field-nya belum terlihat; situs statistik yang kuat dari kompetitor
  (mis. negara lain dengan data lebih dalam / visualisasi lebih kaya)
  bisa menggeser. Kelemahan yang diakui: tidak ada peta interaktif
  provinsi dan tidak ada perbandingan antar-negara — dua peningkatan
  paling berdampak bila checkpoint ⅓ menunjukkan rank di luar top 25.
- Tidak ada Goldfish review / top10-analysis di ronde ini (strategi
  submit-cepat, build langsung tanpa analisis top-10 dulu — sesuai brief;
  checkpoint ⅓ jendela: 27 Nov 12:39 WIB).

## Revisi ronde 1 — 26 Nov ~15:20–16:30 WIB (koordinator fbb70594, builder 17e21d6e)

Keputusan user 14:58: PILIH B — revisi dulu berbasis referensi (reference-analysis.md:
BPS, World Bank Data, PlainCountries, Our World in Data dibaca langsung).
Target: selesai cepat → submit RONDE 1 (cutoff 27 Nov 06:39 WIB).

- Item 1 PERBANDINGAN: nilai "Dunia" di 5 kartu KPI (penduduk 8.141 jt, PDB
  tumbuh 2,9%, inflasi 3,0% rata-rata tahunan, pengangguran 4,8% ILO,
  kemiskinan 10,1% garis $2,15/hari) + strip "Bandingkan dengan negara
  sebanding" (5 indikator × IDN/MYS/THA/VNM/PHL/Dunia). Semua 2024, World
  Bank WDI via API publik (tanpa key), terverifikasi. Vintage ditangani
  eksplisit di footnote (WB 283,5 jt vs BPS 281,6 jt beda metode; inflasi WB
  rata-rata tahunan vs BPS Des y-on-y 1,57% beda ukuran). File baru
  app/compare.js (84 baris).
- Item 2 PETA PROVINSI: choropleth SVG 38 provinsi digambar tangan
  (app/map.js, 108 baris, tanpa library/file peta luar), 5 tingkat warna
  menurut penduduk 2024, label pulau + singkatan, klik = detail.
- Item 3 INTERPRETASI: paragraf "Apa kata data" di beranda + catatan "Cara
  membaca" di bawah grafik utama beranda/ekonomi/penduduk/harga/kerja.
- Item 4 FAQ: 3 Q&A di halaman Tentang + Bank Dunia masuk daftar sumber.
- Item 5 (kalender rilis, SDG) TIDAK dikerjakan.
- main.ts + vendor/makefun-frontend.ts TIDAK disentuh. Validasi builder:
  serve 200, 9 route headless OK (38 prov-link + 43 polygon di DOM),
  offline bersih, HP tanpa overflow, main.ts 2x byte-identik (dossier
  486.870 byte), 4 screenshot re-capture + diperiksa visual.
- Commit baru: eceede5f46291a34a34e8317d29270827190329e (di atas 77bbcfe),
  9 file (5 teks + 4 JPEG), head GitHub terverifikasi via API.
- Bundle revisi: transcripts/best-national-statistics-site-20261126-0539-rev.tar.gz
  (42.191.724 B, sha256 6d359fc9f50d5c0f75113b54e12bcd41b77a60cd1fe9b062bc747b1e98d51431;
  2 sesi builder + 1 sesi koordinator + parent chat home chat sebagai context).
  Pelajaran bundle: prompt-file HARUS kata-kata user verbatim (brief agen
  DITOLAK run-record-not-whole) — dipakai pesan user "Coba referensi
  beberapa web..." + --prompt-origin handed-off --prompt-via "makefun home
  chat" + --parent-session sesi home chat. Usage rows gabungan:
  usage-best-national-statistics-site-20261126-0539-rev.jsonl (2 baris:
  builder v1 3.297.058/31.422 + builder revisi 7.680.415/42.519;
  model ipnext/avocado-5.17-v2).
- CHECK LOKAL (kit fresh level 53, 26 Nov ~16:20 WIB): **14 passed, 0 failed,
  6 skipped, 5 at submission — ok TRUE. Reproduces 97,6%** (1029/1054
  authored, 0 copied/pasted, 6 read, 19 absent), priced PASS (2 usage
  records), in_window PASS (285 timestamp), run record PASS (handed-off),
  own_work PASS. Catatan check: di atas keseluruhan deliverable share
  authored 40,9% (1036/2528; 1372 absent — penyebut keduanya, skor tetap
  97,6% yang dipakai site).
- CEK TELITI segar (~16:20 WIB): kuota entries_made 0, day 6 left, hard 40
  left, can_submit TRUE, fee free; kompetisi open + acceptingSubmissions
  TRUE, submissionCount 2350, deadline 29 Nov 05:39 UTC; blind_round_slot
  available, interval berakhir 27 Nov 06:39 WIB (= cutoff ronde 1).
- Estimasi builder revisi: tidak ada estimasi rank baru yang ditulis;
  estimasi v1 (rank ~10–25, P(top 50) 40–50%) masih berlaku sebagai lantai,
  revisi menutup 2 kelemahan yang diakui v1 (perbandingan + peta).
- Catatan kecil (bukan blocker): di screenshot 2-ekonomi, label tahun sumbu-x
  grafik terpotong sebagian di tepi bawah viewport (halaman bisa di-scroll;
  framing screenshot yang sama seperti v1).
- Status: BUILT-AWAITING-APPROVAL (revisi). Ronde 1 MASIH TERKEJAR
  (~14 jam ke cutoff saat laporan). TIDAK ADA submit dari koordinator.

## Revisi ronde 2 — 27 Nov ~14:40–16:30 WIB (builder subagent Muse, sesi b4901b44; koordinator 0d987391)

Hasil ronde 1 (live): rank 246/4140, skor 641755 (win rate 64,18%).
Cutoff ronde 2: 28 Nov 2026 00:39 WIB. Satu pembeda: "Banding Dunia di
tiap angka" (KPI Indonesia + Dunia berdampingan + chip delta, grafik
dengan Dunia/negara sebanding, halaman #/banding khusus).

### Yang diubah

- Data 2025 (semua terverifikasi sumber resmi, 27 Nov 2026): BPS —
  PDB Rp23.821 T +5,11%, PDB/kapita Rp83,7 jt (US$5.083), inflasi Des
  2,92%, TPT Feb 4,76%, kemiskinan Mar 8,47%, IPM 75,90, dagang
  (ekspor US$282,91 M, impor US$241,86 M, surplus US$41,05 M),
  penduduk 284,44 jt; WDI API — penduduk IDN 285.721.236, Dunia
  8.215.424.893, tumbuh IDN 5,108% / Dunia 2,92%, PDB/kapita IDN
  US$5.059,6 / Dunia US$14.405,8; Kemenkes — stunting 19,8% (2024).
  TIDAK terverifikasi → TIDAK dipakai: melek huruf, TPT Agu 2025
  (seri memakai `null` jujur untuk 2025), kelompok inflasi Des 2025
  (halaman Harga tetap Des 2024 lengkap + catatan).
- 3 seksi baru: Pendidikan, Kesehatan, Perdagangan (masing-masing
  3–4 KPI + 1 grafik + 1 kalimat interpretasi). Nav 12 tautan.
- Beranda: hero dipangkas (lede + eyebrow dihapus), tools panel
  (pemilih tahun 2025/2024 + cari indikator + strip "Pada 2025: ..."),
  8 kartu KPI compact (konteks + baris Dunia + chip delta + tautan
  seksi), 2 grafik di viewport pertama 1280×800 (kpiTop 359,
  kpiBottom 690, chartTop 700 — batang PDB + label nilai terlihat,
  garis penduduk bagian atas terlihat). Grafik batang beranda memakai
  sumbu max 6 (zoom); halaman Ekonomi tetap sumbu 10 penuh.
- Halaman #/banding: toggle 5 metrik, grafik batang (log untuk
  PDB/kapita + catatan skala jujur), tabel 6 negara + Dunia (2024),
  interpretasi per metrik. Peta provinsi: toggle penduduk/kepadatan.
- Pemilih tahun hanya me-rebase KPI + strip (grafik tetap seri penuh
  2019–2025) — dicatat jujur di revision-log + halaman Tentang.
- File: app/data.js (302 baris), views.js (568), charts.js (166,
  opsi `max`/`log`, toleran `null`), compare.js (155), map.js (134),
  main.js (212), style.css (344), index.html (26). main.ts / vendor /
  README / LICENSE TIDAK disentuh.

### Validasi yang dijalankan (ronde 2)

1. **Serve lokal** (port 8123): 8 file HTTP 200.
2. **Render 13 route** headless Chromium (CDP): semua OK, ready=true,
   tanpa error JS/console. Satu "FAIL" harness `#/data` = bug marker
   tes (`Data &amp; Unduhan` vs innerText `Data & Unduhan`), bukan bug
   situs.
3. **node --check** 6 file JS bersih (2x).
4. **Offline**: tanpa fetch/XHR; `https://` hanya URL sumber
   teks/tautan (bps.go.id, data.worldbank.org, kemkes.go.id, bi.go.id,
   kemenkeu.go.id) + namespace SVG w3.org.
5. **HP 390×844**: tanpa overflow horizontal (CDP scrollWidth +
   baca visual).
6. **main.ts 2x run** (TMPDIR workspace): `diff -r` identik —
   **byte-identik**. `dossier.json` 602.551 byte (cover/images/schema/
   text) — naik dari 486.870 (ronde 1).
7. **Screenshot**: 4 JPEG q80, <256 KiB (1-home 143.900,
   2-ekonomi 79.961, 3-provinsi 79.888, 4-home-phone 68.086 byte).
   Diperiksa visual: 1-home (KPI 2025 + strip + judul + puncak 2
   grafik di viewport pertama, tanpa tumpang-tindih), 2-ekonomi
   (grafik PDB + interpretasi bersih), 3-provinsi (peta mode
   penduduk bersih), 4-home-phone (nav membungkus rapi, tanpa
   overflow).
8. **Interaksi live**: pemilih tahun 2024 → KPI 281,6 jt + strip
   2024 OK; cari "inflasi" → 2 hasil, Enter → #/harga OK; toggle
   banding → Penduduk OK; toggle peta → kepadatan OK; tanpa error JS.

### Estimasi rank / peluang (jujur, diperbarui)

- Estimasi: **rank ~50–100, P(top 50) ~30–40%** — MASIH di bawah
  lantai rank 25. Ronde ini menutup 6 dari 7 gap terkonfirmasi
  (tahun acuan, cakupan 4 → 11 halaman, cari + pemilih tahun,
  konteks + chip delta, stempel kesegaran, peta bertoggle + Banding).
  Yang masih kurang vs top 10: peta masih skematis (bukan geojson
  asli), data provinsi masih 2024, belum ada unduhan data 2025 per
  provinsi. Loop-breaker: estimasi tetap ≥50 → kembali ke user
  dengan opsi (ronde tambahan / berhenti), jangan rebuild ronde ke-3
  tanpa keputusan baru.
- TIDAK ADA submit / bundle / check di sesi ini — hanya build +
  push, sesuai brief.

## Catatan

- TIDAK submit / bundle / check di sesi ini — hanya build, sesuai brief.
  Watch yang melanjutkan repo + bundle + check.
- Skill pusat dicek dulu: skill `makefun` (v1.5.234) + `frontend-design`
  tersedia dan dipakai sebagai panduan; tidak ada skill/tool baru yang
  di-install atau dibutuhkan.
