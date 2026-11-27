# Revision log, round 3

One round, one differentiator. Previous round is at `d6fcdbc`: rank 246 of 4140,
score 641.755, win rate 64,18 percent. Nothing was carried over by reading the
old code; the round was rebuilt from the design spec and the data tables.

## What changed against round 2

**The cover.** Round 2 opened with an editorial hero: a long paragraph about the
country followed by figures further down. The first screenshot therefore held
prose, and the analysis put that at the centre of the problem: our cover had the
least data in the first viewport of the six covers studied. Round 3 replaces it
with a dashboard. A year slider 2019 to 2025 sits at the top, seven quick pills
under it, eight KPI cards in two rows of four beside it, the summary strip under
the cards, and the 38 province map as the hero visual on the right. On a 1280 by
800 screen all eight cards are above the fold.

**The gestures.** Both are new in this round.

- Slider: re-bases the eight cards and the summary strip for any year in range.
- Map click: opens the province panel with population, area, density and rank.
- Both are held in the URL, so a link or a reload reproduces the exact view.
- A metric toggle on the map switches population against density, and the
  legend, the province link numbers and the table sort order follow it.

**Density.** Every KPI card now carries a value, a label, a context line, a
Dunia line with a delta chip, a source and year, and a section link. Round 2
cards carried fewer of those at once.

**The explorer.** Nine section cards, each with a key figure and one line,
matching the neighbour pattern the analysis counted.

**Charts.** Two under the cards on the cover, both on the full 2019 to 2025
series, each with one sentence of interpretation, plus a note that says plainly
that the charts do not re-base with the slider. Every other page has at least
one chart or table with a reading under it.

## What was kept

- The indicator search box: 24 index entries, keyword to section, Enter goes to
  the first match. Province names were added to the index so "jawa" now
  resolves instead of returning nothing.
- The year focus behaviour, widened from two years to seven.
- The compare page with its five measure toggle, log scale on GDP per capita,
  seven rows, and one reading per measure.
- The province page with its metric toggle, legend, 38 links and detail panel.
- The six releases and five sources on the data page.
- The peer strip on the cover.
- Honest nulls and the method notes.

## What was cut

- No provincial time series. Only the 2024 provincial snapshot is verified.
- No provincial poverty figures.
- No spreadsheet or CSV download; the data table is the download, and the note
  on the data page says where the numbers live in the source.
- No second chart on the province page beyond the map and the ranked bars.
- The phone cover drops the map below the cards instead of keeping it beside
  them; at 390px there is no room for both, and the cards serve the judge better
  first.

## Numbers

    app/views.js       62350 bytes    (was 38580 in round 2)
    app/compare.js      5182 bytes
    app/style.css      29330 bytes
    app/data.js        34514 bytes
    app/charts.js      18369 bytes
    app/main.js         5116 bytes
    app/index.html      2562 bytes
    app/map.js          8024 bytes    untouched

    whole app         165447 bytes in 8 files
    first load        165447 raw, 44688 gzip-9
    dossier           665635 bytes

## Checks run

- `node --check` on all six JavaScript modules: clean.
- Served the site locally and fetched every route: all return the page, no 404
  from the router for a declared path.
- `node main.ts` twice into two directories: `diff -r` identical, including
  `dossier.json` at 665635 bytes.
- Offline: no `fetch`, no `XMLHttpRequest`, no `WebSocket` anywhere in `app/`.
  The only absolute URLs are source links and `http://www.w3.org/2000/svg`, which
  is an XML namespace string, not a request.
- Punctuation: em dash 0, en dash 0, U+2011 0 across every file written.

## Estimate

655 to 675k, which is the rank 50 to 80 band. Not a safe top 50, and the honest
reason is in the build log: a gesture-led dashboard still has to convince in one
still frame. If the estimate holds at or below rank 50 after this round, the
loop-breaker applies and the entry stops here.

## Handoff

Files are left in the working tree, uncommitted and unpushed, for the
coordinator to pull, commit, shoot, bundle, check and submit. Screenshots were
not touched; the four files are still round 2 captures and need re-shooting
against the new cover.
