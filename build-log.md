# Build log, revision round 3

Round 3 of the NusaStat entry, `best-national-statistics-site-20261126-0539`.
Starting position: rank 246 of 4140, score 641.755, win rate 64,18 percent.
One differentiator for the whole round, chosen before any code was written:
turn the cover from an editorial hero into a living dashboard.

## The differentiator

Two gestures, both on the first screen:

1. A year slider from 2019 to 2025. Moving it rebuilds the eight KPI cards and
   the one line summary strip. Every card keeps its own context line, its
   Dunia comparison line with a delta chip, its source and year, and a link to
   its section.
2. A clickable map of all 38 provinces. Clicking one opens a panel with that
   province's population, land area, density and population rank.

Neither gesture reloads the page and neither touches the network. Both are
written into the URL (`?tahun=2020`, `?pilih=Aceh`, `?metrik=density`), so a
reload or a copied link reproduces the same view. That is what makes the
dashboard provable in about a minute: drag the slider, read a different number;
click a province, read a different panel.

The point of building it this way is that a parity rebuild cannot copy it. The
gesture only works if the full 2019 to 2025 series exists for every indicator
and if provincial data is wired through the cards and the panel. A site with
one year of numbers can draw the same slider and it will do nothing.

## What was written

Nine files rewritten from the design spec, as full-file writes:

    app/views.js      every route except compare, the map panel, all controls
    app/compare.js    the banding page
    main.ts           entrypoint: copy, dossier, then serve under the suite
    README.md
    build-log.md      this file
    revision-log.md

Six files were already written earlier in the round and were not touched again:
`app/data.js`, `app/charts.js`, `app/index.html`, `app/main.js`, `app/style.css`,
`app/compare.js` (the last one rewritten in the same pass as views).

## Cover, top to bottom

Short masthead with the wordmark, the tagline "Portal data Indonesia" and the
nav. One headline line, no editorial paragraph. A stamp reading "Diperbarui
27 November 2026. Data terbaru: 2025". Then the control row: the year slider
with seven quick pills under it, and the indicator search box beside it. Then
eight KPI cards in two rows of four, each with an optional 92 by 26 sparkline,
the value, the label with its month tag where the measure is monthly, the
context line, the Dunia line with the delta chip, the source and year, and a
link to its section. Then the summary strip. The map sits to the right of the
cards on a wide screen and drops below them on a phone.

Under the dashboard: two charts side by side, GDP growth as signed columns and
population as a line, both on the full 2019 to 2025 series, each with one
sentence of interpretation underneath. Then an honest note saying the slider
re-bases the cards and the strip but the charts keep the whole series on
purpose, with the focused year highlighted inside them. Then the section
explorer: nine cards, each carrying a key figure and one line. Then the peer
strip: Indonesia against Malaysia, Thailand, Vietnam, the Philippines and the
world on GDP per capita. Then the source footnote.

The search box keeps the behaviour of the previous design: type a keyword, the
list filters against 24 index entries, Enter goes to the first match's section.

## Pages

Thirteen routes and a 404. Each page carries headline figures with source and
year, at least one chart or table, one sentence of interpretation under every
chart, and a source footnote.

    #/            dashboard
    #/ekonomi     growth, nominal GDP, per capita, world share, sectors, poverty, gini
    #/penduduk    population series, world share, age structure, top provinces
    #/provinsi    map with metric toggle, 38 province links, detail panel, full table
    #/harga       inflation series, eleven CPI groups 2024, three verified groups 2025
    #/kerja       unemployment series, Indonesia against the world, method notes
    #/pendidikan  HDI 2022 to 2025, schooling, participation
    #/kesehatan   life expectancy on two methods, stunting, health spending
    #/perdagangan exports, imports, balance, destinations, oil and non-oil
    #/banding     five measures, seven rows, log scale for GDP per capita
    #/data        six releases, six indicator series, five sources
    #/tentang     what the site does, what its limits are
    404           anything else

## The province page

The map is passed in as a black box: `provinceMapSVG(name, metric)` returns the
markup and `mapLegend(metric)` returns its legend. The page never reimplements
the geometry, so the map and the table cannot drift apart. The metric toggle
switches between population and density, and the legend, the shading, the
number beside each province link and the sort order of the table all follow it.
Clicking a province sets `?pilih=` and the detail panel fills in.

Population and area are the stored numbers; density and share are computed from
them, never stored, so a table row and a map shade cannot disagree.

## Data honesty

The brief's rules were followed literally:

- Unemployment and poverty carry `null` for 2025, because both are measured in
  August and September and those releases are not verified. The chart draws a
  gap; the card shows the latest verified month instead, with the month named
  on the chip: 4,76 percent for February 2025 and 8,47 percent for March 2025.
- World poverty is 2024 and its label says 2024. World life expectancy 2025 is
  not published, so that line says so rather than carrying 2024 silently.
- The price page stays on December 2024 for the eleven group chart, because
  only three December 2025 groups are verified. Those three appear in their own
  chart with their own label, so two vintages never share an axis.
- Two numbers for the same thing are both shown with the method difference
  explained: population (BPS projection versus UN estimate), inflation
  (December to December versus annual average), unemployment (Sakernas versus
  ILO model), poverty (national line versus USD 2.15), life expectancy
  (indirect method versus UN estimate).

## Numbers for this round

    app/index.html      2562 bytes
    app/style.css      29330 bytes
    app/main.js         5116 bytes
    app/data.js        34514 bytes
    app/views.js       62350 bytes
    app/charts.js      18369 bytes
    app/map.js          8024 bytes  (untouched, as delivered)
    app/compare.js      5182 bytes
    whole app         165447 bytes in 8 files

    first load          8 files, 165447 raw, 44688 gzip-9 bytes
    loaded later        0 files
    dossier             665635 bytes, text capped at 163840

`node --check` passes on all six JavaScript modules. `node main.ts` run twice
into two directories produces byte-identical trees, dossier included.

## Estimate for this round

The analysis put the top 50 band around 660 to 700k and the ceiling of a
revision round at roughly one to two percent on top of a 641.755 base. This
round changes one thing only, and it changes it where the judge looks first:
the cover now holds eight live figures, a seven year control and a 38 province
map in the first viewport, against the previous editorial hero.

Own estimate: 655 to 675k, which is the rank 50 to 80 band, not a safe top 50.
The honest reason for the ceiling: the judge compares screenshots, and a
dashboard that needs a drag to prove itself still has to look convincing in one
still frame. The card density and the map carry that load.

If that estimate holds after this round, the loop-breaker set out in the
analysis applies: stop here and report rather than spend another round.

## Limits

- Screenshots are not shot or edited in this round; the coordinator re-shoots
  them on the VM. The four files in `screenshots/` are still the round 2 shots.
- `main.ts` was run without `MAKEFUN_ENV_URL`, so the build path is proven and
  the serve and register path is written but not exercised against a live
  suite. `node --check` does not apply to TypeScript; the file was run instead,
  which is the stronger check.
- No provincial time series, no provincial poverty, no spreadsheet download.
  Those need releases that are not verified, and guessing them would break the
  one rule that matters for this entry.
