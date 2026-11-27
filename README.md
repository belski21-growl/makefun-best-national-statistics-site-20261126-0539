# NusaStat

A national statistics site for Indonesia, as static files. It opens at
`app/index.html` in a desktop browser or a phone browser; there is no build
step, no server code and no network request of any kind.

Competition entry for make.fun bounty
`best-national-statistics-site-20261126-0539`.

## What it is

Thirteen routes behind a hash router, plus a 404:

    #/              dashboard: year slider 2019 to 2025, 38 province map, 8 KPI cards
    #/ekonomi       growth, nominal GDP, GDP per capita, sectors, poverty, gini
    #/penduduk      population series, world share, age structure, top provinces
    #/provinsi      clickable map, metric toggle, 38 province list and table
    #/harga         inflation series and eleven CPI groups
    #/kerja         unemployment series against the world, method notes
    #/pendidikan    HDI 2022 to 2025, schooling, participation
    #/kesehatan     life expectancy on two methods, stunting, health spending
    #/perdagangan   exports, imports, balance, destinations, oil and non-oil
    #/banding       Indonesia against six peers on five measures
    #/data          six releases, the six indicator series, five sources
    #/tentang       what the site does and where its limits are
    #/tidak-ada     404 page

The cover is a dashboard rather than an article: a slider re-bases the eight
KPI cards and the summary strip for any year from 2019 to 2025, and the map
opens a panel for any of the 38 provinces. Both gestures are kept in the URL,
so a copied link reproduces exactly the view that was on screen.

## Run it offline

Open `app/index.html` directly in a browser. Everything is relative and local,
so `file://` works with no flags in current desktop browsers.

If your browser blocks module scripts on `file://`, serve the folder instead
(this is also how the screenshots are taken):

    node serve.ts
    # app/ is on http://localhost:8080

    node serve.ts --port 8090
    # or any other port

A plain static server works too, for example
`python3 -m http.server 8080 --directory app`.

## Layout

    app/index.html    page shell, masthead, stylesheet link
    app/style.css     all styling, one file, dark green header on cream
    app/main.js       hash router and focus state
    app/views.js      every route except compare, the map panel, the controls
    app/compare.js    the banding page
    app/charts.js     chart builders, plain SVG strings
    app/data.js       every figure, with source and year attached
    app/map.js        the 38 province schematic map (left as delivered)
    main.ts           entrypoint: copies app/ and screenshots/, writes dossier.json
    vendor/           the kit's dossier library, copied unchanged
    serve.ts          local static server for development

## Data

BPS (Badan Pusat Statistik) for the national series: population mid-year,
GDP growth and nominal GDP, CPI inflation December to December, Sakernas
unemployment, Susenas poverty, HDI, trade balance. Bank Dunia (World Bank
WDI) for world totals and for every Indonesia versus world and Indonesia
versus neighbour comparison, because those need one consistent source across
countries.

Every figure carries its source and year in the markup. Where a year is not
yet published the value is `null` and the chart draws a gap, never a zero.
Where BPS and the World Bank disagree, both numbers appear and the method
difference is explained on the page: inter-census projection versus UN
estimate, December to December versus annual average, Sakernas versus the ILO
model, national poverty line versus USD 2.15 per day.

## Build

`node main.ts` copies `app/` and `screenshots/` into `$MAKEFUN_OUTPUT_DIR`
(default `/output`) and writes `dossier.json` there with the kit's own
`buildDossier`. It is deterministic: two runs produce byte-identical output.
With `MAKEFUN_ENV_URL` set it also serves a health endpoint and registers.
