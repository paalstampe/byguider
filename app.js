/* Byguide — én kopi av logikken for alle byer.

   Hver by har en stubb (london/index.html osv.) som laster denne filen med
   data-by="<id>". Filen henter selv inn fonter, stilark og kartbibliotek,
   bygger siden, slår opp byen i byer.json og laster byens GeoJSON.

   Kartet tegnes med MapLibre GL JS på CARTO Voyager, omfarget til papirpaletten
   (KARTPALETT). Steder ligger i en klyngende kilde (steder) med kategoriikoner,
   gater og gåturer i en egen kilde (ruter). Filtrering bytter ut dataene i begge
   kildene, slik at klyngene regnes ut på nytt. Sidebar, søk og liste snakker aldri
   med kartet direkte.

   Data og presentasjon er adskilt: steder, soner, startvisning og titler ligger
   i GeoJSON-filen (features + metadata). Koden inneholder ingenting byspesifikt.
   Ny kategori krever ett oppslag i KATEGORIER under, pluss ingenting annet —
   filterknappen lages automatisk. */

/* Hver kategori har navn, farge, ikon (nøkkel i IKONER) og alias. Overskriftene
   (##) i by-fila matches mot navn, nøkkel og alias uten hensyn til store/små
   bokstaver og aksenter. Farger og ikoner er felles for alle byer. */
const KATEGORIER = {
  nabolag:    { navn: 'Nabolag og gater',    farge: '#8A5A2B', ikon: 'hus',
                alias: ['Nabolag', 'Gater', 'Gate', 'Strøk'] },
  restaurant: { navn: 'Restauranter',        farge: '#9E4A3C', ikon: 'bestikk',
                alias: ['Restaurant', 'Spisesteder'] },
  cafe:       { navn: 'Caféer',              farge: '#A9713F', ikon: 'kopp',
                alias: ['Café', 'Kafé', 'Kafeer', 'Bakeri', 'Bakerier'] },
  bar:        { navn: 'Barer',               farge: '#6E4A6B', ikon: 'glass',
                alias: ['Bar', 'Puber', 'Pub'] },
  museum:     { navn: 'Muséer og gallerier', farge: '#3F5A6B', ikon: 'ramme',
                alias: ['Museum', 'Museer', 'Galleri', 'Gallerier'] },
  butikk:     { navn: 'Butikker',            farge: '#4F6B7A', ikon: 'pose',
                alias: ['Butikk', 'Shopping', 'Marked', 'Markeder'] },
  omvei:      { navn: 'Verdt en omvei',      farge: '#5C7A4F', ikon: 'flagg',
                alias: ['Annet', 'Point of interest', 'Severdigheter', 'Park', 'Parker'] },
  gaatur:     { navn: 'Gåturer',             farge: '#7A6A2B',
                alias: ['Gåtur', 'Ruter', 'Rute'] }
};

/* Ikonglyfer: SVG-stier i et 24×24-rutenett, tegnet som hvite streker i en farget
   sirkel. Ny glyf = én linje her + ikon-nøkkelen på kategorien. */
const IKONER = {
  hus:     'M4 11.5 12 5l8 6.5 M6.5 10v8.5h11V10 M10.5 18.5V14h3v4.5',
  kopp:    'M5 10h11v4a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5 14z M16 11h1.5a2.2 2.2 0 0 1 0 4.4H16 M8.5 4.5v2.5 M12.5 4.5v2.5',
  brod:    'M4 17v-3.5a8 5.5 0 0 1 16 0V17z M9 10.5l1 2.5 M12 9.5v3 M15 10.5l-1 2.5',
  bestikk: 'M6.5 4v5 M9 4v5 M11.5 4v5 M6.5 9a2.5 2.5 0 0 0 5 0 M9 11.5V20 M17.5 20V4c-2 1.5-3 4-3 8h3',
  glass:   'M5 5h14l-7 8z M12 13v6.5 M8.5 19.5h7',
  pose:    'M5.5 8.5h13l-1 11.5h-11z M9 11V7.5a3 3 0 0 1 6 0V11',
  bod:     'M4 9.5 5.5 5h13L20 9.5 M4 9.5a2.67 2.2 0 0 0 5.33 0 2.67 2.2 0 0 0 5.34 0 2.67 2.2 0 0 0 5.33 0 M5.5 12v7.5h13V12',
  tre:     'M12 21v-5 M12 3l5.5 7H15l3.5 5.5h-13L9 10H6.5z',
  ramme:   'M4.5 5.5h15v13h-15z M4.5 15.5l4.5-4.5 4 4 2.5-2.5 4 4 M15 8.5a1.2 1.2 0 1 0 0.01 0',
  flagg:   'M7 21V4 M7 4.5h10l-2.2 3.75L17 12H7',
  prikk:   'M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0'
};

/* Kartstilen: CARTO Voyager omfarget til papirpaletten fra style.css.
   Reglene matcher lag-id-er i Voyager-stilen; første treff vinner. */
const KARTPALETT = {
  bakgrunn:    '#EFEADF',
  park:        '#D6DFCB',
  vann:        '#B9C9CE',
  bygg:        '#EAE3D5',
  byggKant:    '#DCD2C0',
  vei:         '#FFFDF8',
  veiKant:     '#DCD2C0',
  storVei:     '#FAF3E3',
  storVeiKant: '#D4C4A8',
  sti:         '#CDBFA8',
  bane:        '#D3C9B8',
  grense:      '#D3C5B0',
  tekst:       '#4A3F33',
  tekstDempet: '#6B5D4A',
  veinavn:     '#8A7B66',
  vannTekst:   '#5E7A82',
  husnummer:   '#B3A38A'
};

const STILREGLER = (P => [
  [/^background$/,            { 'background-color': P.bakgrunn }],
  [/^landuse_residential$/,   { 'fill-opacity': 0 }],
  [/^(landcover|landuse|park_)/, { 'fill-color': P.park,
                                'fill-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0.35, 12, 0.8, 15, 1] }],
  [/^water(_shadow)?$/,       { 'fill-color': P.vann }],
  [/^waterway$/,              { 'line-color': P.vann }],
  [/^building$/,              { 'fill-color': P.bygg, 'fill-outline-color': P.byggKant }],
  [/^aeroway/,                { 'line-color': P.veiKant }],
  [/^boundary/,               { 'line-color': P.grense }],
  [/(mot|trunk)_case/,        { 'line-color': P.storVeiKant }],
  [/(mot|trunk)_fill/,        { 'line-color': P.storVei }],
  [/_case/,                   { 'line-color': P.veiKant }],
  [/_fill/,                   { 'line-color': P.vei }],
  [/_path$/,                  { 'line-color': P.sti }],
  [/rail$/,                   { 'line-color': P.bane }],
  [/rail_dash$/,              { 'line-color': P.bakgrunn }],
  [/^water(name|way_label)/,  { 'text-color': P.vannTekst, 'text-halo-color': P.bakgrunn }],
  [/^place_(city|capital|town|continent|country)/,
                              { 'text-color': P.tekst, 'text-halo-color': P.bakgrunn, 'icon-color': P.tekst }],
  [/^place_/,                 { 'text-color': P.tekstDempet, 'text-halo-color': P.bakgrunn, 'icon-color': P.tekstDempet }],
  [/^poi_/,                   { 'text-color': P.tekstDempet, 'text-halo-color': P.bakgrunn }],
  [/^roadname/,               { 'text-color': P.veinavn, 'text-halo-color': P.vei }],
  [/^housenumber$/,           { 'text-color': P.husnummer, 'text-halo-color': P.bakgrunn }]
])(KARTPALETT);

/* Lag i Voyager som slås av. building-top er en forskjøvet kopi av bygningene
   som gir en mørk «skyggekant» på høy zoom. */
const SKJULTE_LAG = [/^building-top$/];

/* Skriften CARTO-stilen selv bruker til bynavn — kun disse finnes på glyph-serveren. */
const KARTSKRIFT = ['Montserrat Medium', 'Open Sans Bold', 'Noto Sans Regular',
  'HanWangHeiLight Regular', 'NanumBarunGothic Regular'];

const PAPIR = '#F7F4EE';

/* CARTO-nøkkel (gratis, https://carto.com/basemaps/apikey). Kravet gjelder foreløpig
   rasterkartene, men nøkkelen sendes med på vektorstilen også.
   Nøkkelen er låst til stam.pe, *.stam.pe og paalstampe.github.io i CARTOs dashbord.
   Fra andre opphav (localhost, raw.githack.com) svarer CARTO uten CORS-header og
   kartet blir blankt — det er ikke en kodefeil. Test lokalt ved å fjerne nøkkelen midlertidig. */
const CARTO_KEY = 'cb1_400i_1_fd049a8bd96268b9a1be2213';

const KARTSTIL = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  + (CARTO_KEY ? '?key=' + CARTO_KEY : '');

const UKJENT_FARGE = '#6B5D4A';

/* ---------- by-fila (markdown) ----------

   Hver by er én markdown-fil (data/<by>.md) som er kilden for alt innhold:

     ---                              frontmatter: tittel, kicker, undertittel,
     tittel: Påls London              senter (breddegrad, lengdegrad), zoom, oppdatert
     ---
     # Central                        sone (rekkefølgen her = rekkefølgen i appen)
     ## Nabolag og gater              kategori (matches mot KATEGORIER)
     ### Marylebone Village ★         sted; ★ = favoritt
     - sted: 51.5207, -0.1519         breddegrad, lengdegrad — som Google Maps
     - gater: Marylebone High Street, Chiltern Street
     Fri tekst blir notatet.

   Områder, gater og gåturer tegnes i data/<by>-geometri.geojson og kobles på navn.
   Koordinater i markdown er i Google-rekkefølge (breddegrad først); GeoJSON bruker
   motsatt rekkefølge. Parseren snur dem, så resten av koden ser bare GeoJSON. */

function normaliser(s) {
  return String(s || '').toLowerCase()
    .replace(/ø/g, 'o').replace(/æ/g, 'ae')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ').trim();
}

function finnKategori(tekst) {
  const n = normaliser(tekst);
  const k = Object.keys(KATEGORIER).find(k =>
    [k, KATEGORIER[k].navn].concat(KATEGORIER[k].alias || []).some(x => normaliser(x) === n));
  return k || n.replace(/[^a-z0-9]+/g, '-');
}

/* "51.5207, -0.1519" (breddegrad, lengdegrad) -> [-0.1519, 51.5207] */
function lesKoordinat(tekst) {
  const m = String(tekst || '').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  return m ? [parseFloat(m[2]), parseFloat(m[1])] : null;
}

const FELT = ['sted', 'besokt', 'google', 'gater', 'lengde', 'varighet'];  // besokt leses, men vises ikke

function lesMarkdown(tekst) {
  const linjer = String(tekst).replace(/\r/g, '').replace(/<!--[\s\S]*?-->/g, '').split('\n');
  const meta = {};
  const steder = [];
  const soner = [];
  const kategoriNavn = {};
  let i = 0;

  if ((linjer[0] || '').trim() === '---') {
    for (i = 1; i < linjer.length && linjer[i].trim() !== '---'; i++) {
      const m = linjer[i].match(/^\s*([^:]+):\s*(.*)$/);
      if (m) meta[normaliser(m[1])] = m[2].trim();
    }
    i++;
  }

  let sone = '', kategori = '', sted = null;
  for (; i < linjer.length; i++) {
    const l = linjer[i];
    let m;
    if ((m = l.match(/^#\s+(.+)$/))) {
      sone = m[1].trim();
      if (!soner.includes(sone)) soner.push(sone);
      sted = null;
    } else if ((m = l.match(/^##\s+(.+)$/))) {
      kategori = finnKategori(m[1]);
      kategoriNavn[kategori] = m[1].trim();
      sted = null;
    } else if ((m = l.match(/^###\s+(.+)$/))) {
      const tittel = m[1].trim();
      sted = {
        navn: tittel.replace(/\s*[★*]+\s*$/, ''),
        favoritt: /[★*]\s*$/.test(tittel),
        sone: sone, kategori: kategori, felt: {}, notat: []
      };
      steder.push(sted);
    } else if (sted) {
      const f = l.match(/^\s*[-*]\s+([^:]+):\s*(.*)$/);
      if (f && FELT.includes(normaliser(f[1]))) sted.felt[normaliser(f[1])] = f[2].trim();
      else sted.notat.push(l);
    }
  }

  steder.forEach(st => {
    st.notat = st.notat.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  });

  return { meta: meta, soner: soner, steder: steder, kategoriNavn: kategoriNavn };
}

/* Gjør markdown-oppføringene om til GeoJSON-features. Geometri-fila gir
   områder (type: område), gater (type: gate) og ruter (type: rute), koblet på navn. */
function byggFeatures(md, geo) {
  const geoFeat = (geo && geo.features) || [];
  const finnGeo = (navn, type) => geoFeat.filter(f =>
    normaliser((f.properties || {}).navn) === normaliser(navn) &&
    normaliser((f.properties || {}).type) === type);

  return md.steder.map(st => {
    const b = normaliser(st.felt.besokt);
    const google = st.felt.google || '';
    const p = {
      navn: st.navn,
      kategori: st.kategori,
      sone: st.sone,
      favoritt: st.favoritt,
      besokt: b ? /^(ja|j|yes|x)$/.test(b) : undefined,
      notat: st.notat,
      place_id: /^https?:/.test(google) ? '' : google,
      google_url: /^https?:/.test(google) ? google : '',
      gater: (st.felt.gater || '').split(',').map(x => x.trim()).filter(Boolean),
      lengde: st.felt.lengde || '',
      varighet: st.felt.varighet || ''
    };

    const omrade = finnGeo(st.navn, 'omrade').map(f => ({ type: 'Feature', geometry: f.geometry, properties: { rolle: 'omrade' } }));
    const gater = finnGeo(st.navn, 'gate').map(f => ({ type: 'Feature', geometry: f.geometry, properties: { rolle: 'gate' } }));
    const rute = finnGeo(st.navn, 'rute')[0];

    let geometry = null;
    const pkt = lesKoordinat(st.felt.sted);
    if (pkt) geometry = { type: 'Point', coordinates: pkt };
    else if (rute) geometry = rute.geometry;
    else if (omrade.length) {
      const c = [].concat.apply([], omrade[0].geometry.coordinates);
      const x = c.map(k => k[0]), y = c.map(k => k[1]);
      geometry = { type: 'Point', coordinates: [(Math.min.apply(null, x) + Math.max.apply(null, x)) / 2,
                                                (Math.min.apply(null, y) + Math.max.apply(null, y)) / 2] };
    }

    return { type: 'Feature', geometry: geometry, properties: p, fokus: omrade.concat(gater) };
  });
}

/* Metadata fra frontmatter; soner fra rekkefølgen på #-overskriftene. */
function byggMeta(md) {
  const m = md.meta;
  const s = lesKoordinat(m.senter);
  return {
    tittel: m.tittel || '', kicker: m.kicker || '', undertittel: m.undertittel || '',
    senter: s || undefined,
    zoom: m.zoom ? parseFloat(m.zoom) : undefined,
    oppdatert: m.oppdatert || '',
    soner: md.soner
  };
}

/* ---------- oppstart ---------- */

const SKRIPT = document.currentScript;
const BASE = new URL('.', SKRIPT.src);          // mappen app.js ligger i
const BY = SKRIPT.dataset.by;

const RESSURSER = {
  fonter:  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Work+Sans:wght@400;500;600&display=swap',
  kartCss: 'https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css',
  kartJs:  'https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js'
};

const SKALL = `
<div class="app">
  <aside class="sidebar">
    <header class="sidebar-head">
      <nav class="smuler" aria-label="Du er her">
        <a href="${new URL('../', BASE).href}">stam.pe</a><span class="smule-skille">/</span><a href="${new URL('./', BASE).href}">Påls byguider</a><span class="smule-skille">/</span><span id="smule-by" aria-current="page"></span>
      </nav>
      <h1 class="tittel" id="tittel"></h1>
      <p class="ingress" id="ingress"></p>
    </header>
    <div class="sok-rad">
      <input type="search" id="sok" class="sok" placeholder="Søk etter navn eller notat" autocomplete="off" aria-label="Søk">
    </div>
    <div class="filtre">
      <div class="filtergruppe" id="filter-sone" aria-label="Filtrer på sone"></div>
      <div class="filtergruppe" id="filter-kategori" aria-label="Filtrer på kategori"></div>
      <div class="filtergruppe filtergruppe--smal" id="filter-status"></div>
    </div>
    <div class="teller-rad">
      <span id="teller" class="teller"></span>
    </div>
    <div class="liste" id="liste" role="list"></div>
    <footer class="sidebar-fot">
      <span id="fot-tekst"></span>
    </footer>
  </aside>
  <main class="kartflate">
    <div id="kart"></div>
    <div class="rute-kort" id="rute-kort" hidden>
      <button type="button" class="rute-lukk" id="rute-lukk" aria-label="Lukk">&times;</button>
      <p class="rute-kicker" id="rute-kicker">Gåtur</p>
      <h2 class="rute-navn" id="rute-navn"></h2>
      <p class="rute-meta" id="rute-meta"></p>
      <p class="rute-notat" id="rute-notat"></p>
    </div>
  </main>
</div>`;

function lastCss(href) {
  return new Promise(res => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    l.onload = l.onerror = res;
    document.head.appendChild(l);
  });
}

function lastJs(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = res;
    s.onerror = () => rej(new Error('Kunne ikke laste ' + src));
    document.head.appendChild(s);
  });
}

const domKlar = new Promise(res => {
  if (document.readyState !== 'loading') res();
  else document.addEventListener('DOMContentLoaded', res);
});

async function finnBy(id) {
  const r = await fetch(new URL('byer.json', BASE));
  if (!r.ok) throw new Error('byer.json: HTTP ' + r.status);
  const manifest = await r.json();
  const by = (manifest.byer || []).find(b => b.id === id);
  if (!by) throw new Error('Fant ikke byen «' + id + '» i byer.json');
  return by;
}

(async function oppstart() {
  const css = Promise.all([
    lastCss(RESSURSER.fonter),
    lastCss(RESSURSER.kartCss),
    lastCss(new URL('style.css', BASE).href)
  ]);
  const js = lastJs(RESSURSER.kartJs);
  const by = finnBy(BY);

  await Promise.all([css, domKlar]);
  document.body.innerHTML = SKALL;

  try {
    const [b] = await Promise.all([by, js]);
    const dataSti = b.data || ('data/' + b.id + '.md');
    const geoSti = b.geometri || null;
    document.getElementById('smule-by').textContent = b.navn || b.id;
    start(dataSti, new URL(dataSti, BASE).href, geoSti ? new URL(geoSti, BASE).href : null);
  } catch (err) {
    document.getElementById('liste').innerHTML = '<p class="tomt">' + String(err.message)
      .replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])) + '</p>';
  }
})();

/* ---------- appen ---------- */

function start(DATA_NAVN, DATA_URL, GEO_URL) {

  /* ---------- tilstand ---------- */

  const state = {
    oppslag: [],                 // { id, f, p, erLinje, punkt, bbox }
    soner: new Set(),            // tom = alle
    kategorier: new Set(),       // tom = alle
    kunFavoritter: false,
    sok: '',
    valgtId: null,
    soneRekkefolge: [],          // fra metadata.soner, ellers rekkefølgen i dataene
    brukteSoner: new Set(),
    brukteKategorier: [],
    ukjenteKategorier: {}        // ##-overskrifter som ikke matcher KATEGORIER
  };

  const el = {
    kart:       null,
    liste:      document.getElementById('liste'),
    sok:        document.getElementById('sok'),
    teller:     document.getElementById('teller'),
    fSone:      document.getElementById('filter-sone'),
    fKategori:  document.getElementById('filter-kategori'),
    fStatus:    document.getElementById('filter-status'),
    fotTekst:   document.getElementById('fot-tekst'),
    smuleBy:    document.getElementById('smule-by'),
    tittel:     document.getElementById('tittel'),
    ingress:    document.getElementById('ingress'),
    ruteKort:   document.getElementById('rute-kort'),
    ruteKicker: document.getElementById('rute-kicker'),
    ruteNavn:   document.getElementById('rute-navn'),
    ruteMeta:   document.getElementById('rute-meta'),
    ruteNotat:  document.getElementById('rute-notat'),
    ruteLukk:   document.getElementById('rute-lukk')
  };

  /* ---------- kart ---------- */

  /* Startvisningen settes fra metadata når dataene er lastet.
     Zoom er i MapLibre-skala: én lavere enn Leaflet for samme målestokk. */
  const kart = new maplibregl.Map({
    container: 'kart',
    style: KARTSTIL,
    center: [0, 20],
    zoom: 1,
    maxZoom: 18,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    attributionControl: { compact: false }
  });
  kart.touchZoomRotate.disableRotation();
  kart.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

  const kartKlar = new Promise(res => kart.once('load', res));

  const popup = new maplibregl.Popup({ closeButton: true, focusAfterOpen: false, maxWidth: '300px', offset: 15, className: 'pop' });
  const tips = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 15, className: 'tips' });

  /* Farger defineres étt sted — KATEGORIER — og oversettes til et match-uttrykk. */
  const FARGE = ['match', ['get', 'kategori']]
    .concat(Object.keys(KATEGORIER).flatMap(k => [k, KATEGORIER[k].farge]))
    .concat([UKJENT_FARGE]);

  const FAV = ['==', ['get', 'favoritt'], true];

  const KARTLAG = {
    gater: {
      source: 'ruter',
      type: 'line',
      filter: ['!=', ['get', 'kategori'], 'gaatur'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': FARGE, 'line-width': 4, 'line-opacity': 0.85 }
    },
    gaaturer: {
      source: 'ruter',
      type: 'line',
      filter: ['==', ['get', 'kategori'], 'gaatur'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': FARGE, 'line-width': 5, 'line-opacity': 0.85, 'line-dasharray': [0.2, 1.8] }
    },
    klynger: {
      source: 'steder',
      type: 'circle',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': KARTPALETT.vei,
        'circle-radius': ['step', ['get', 'point_count'], 14, 10, 17, 25, 20],
        'circle-stroke-color': '#8A5A2B',
        'circle-stroke-width': 1.5
      }
    },
    klyngetall: {
      source: 'steder',
      type: 'symbol',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': KARTSKRIFT,
        'text-size': 12,
        'text-allow-overlap': true
      },
      paint: { 'text-color': '#241F19' }
    },
    punkter: {
      source: 'steder',
      type: 'symbol',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': ['coalesce', ['image', ['concat', 'ikon-', ['get', 'kategori']]], ['image', 'ikon-ukjent']],
        'icon-size': ['interpolate', ['linear'], ['zoom'],
          10, ['case', FAV, 0.95, 0.8],
          14, ['case', FAV, 1.15, 0.95]],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'symbol-sort-key': ['case', FAV, 1, 0]
      }
    }
  };

  const KLIKKBARE = ['gater', 'gaaturer', 'punkter'];

  /* Valgt nabolag: skisse av området (lys flate, stiplet kant) og de viktigste
     gatene uthevet. Tegnes under ruter og ikoner, og bare mens nabolaget er valgt. */
  const FOKUSLAG = {
    'fokus-flate': {
      source: 'fokus', type: 'fill',
      filter: ['==', ['get', 'rolle'], 'omrade'],
      paint: { 'fill-color': '#8A5A2B', 'fill-opacity': 0.08 }
    },
    'fokus-kant': {
      source: 'fokus', type: 'line',
      filter: ['==', ['get', 'rolle'], 'omrade'],
      layout: { 'line-join': 'round' },
      paint: { 'line-color': '#8A5A2B', 'line-width': 1.5, 'line-opacity': 0.8, 'line-dasharray': [3, 2] }
    },
    'fokus-gater': {
      source: 'fokus', type: 'line',
      filter: ['==', ['get', 'rolle'], 'gate'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#8A5A2B', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 3, 16, 6], 'line-opacity': 0.7 }
    }
  };

  /* Tegner ett ikon per kategori til et lerret: farget sirkel, papirkant, hvit glyf. */
  function lagIkon(farge, glyf) {
    const R = 2, D = 26 * R;
    const c = document.createElement('canvas');
    c.width = c.height = D;
    const x = c.getContext('2d');
    x.beginPath();
    x.arc(D / 2, D / 2, D / 2 - 1.5 * R, 0, 2 * Math.PI);
    x.fillStyle = farge;
    x.fill();
    x.lineWidth = 1.5 * R;
    x.strokeStyle = PAPIR;
    x.stroke();
    const s = (15 * R) / 24;
    x.translate(D / 2 - 12 * s, D / 2 - 12 * s);
    x.scale(s, s);
    x.lineWidth = 2.2;
    x.lineCap = 'round';
    x.lineJoin = 'round';
    x.strokeStyle = '#FFFDF8';
    x.stroke(new Path2D(glyf));
    return x.getImageData(0, 0, D, D);
  }

  function registrerIkoner() {
    Object.keys(KATEGORIER).forEach(k => {
      const kat = KATEGORIER[k];
      if (kat.ikon) kart.addImage('ikon-' + k, lagIkon(kat.farge, IKONER[kat.ikon] || IKONER.prikk), { pixelRatio: 2 });
    });
    kart.addImage('ikon-ukjent', lagIkon(UKJENT_FARGE, IKONER.prikk), { pixelRatio: 2 });
  }

  function tilpassKartstil() {
    kart.getStyle().layers.forEach(l => {
      if (SKJULTE_LAG.some(r => r.test(l.id))) {
        kart.setLayoutProperty(l.id, 'visibility', 'none');
        return;
      }
      const regel = STILREGLER.find(([r]) => r.test(l.id));
      if (!regel) return;
      Object.keys(regel[1]).forEach(egenskap => {
        try { kart.setPaintProperty(l.id, egenskap, regel[1][egenskap]); }
        catch (e) { /* egenskapen finnes ikke for denne lagtypen — hopp over */ }
      });
    });
  }

  const tomSamling = () => ({ type: 'FeatureCollection', features: [] });

  function leggTilKartlag() {
    tilpassKartstil();
    registrerIkoner();

    kart.addSource('fokus', { type: 'geojson', data: tomSamling() });
    kart.addSource('ruter', { type: 'geojson', data: tomSamling() });
    kart.addSource('steder', {
      type: 'geojson',
      data: tomSamling(),
      cluster: true,
      clusterMaxZoom: 12,
      clusterRadius: 14      // klynger bare der ikonene ellers ville overlappe
    });

    Object.keys(FOKUSLAG).concat(Object.keys(KARTLAG)).forEach(id => {
      kart.addLayer(Object.assign({ id: id }, FOKUSLAG[id] || KARTLAG[id]));
    });

    // Klikk på tomt kart opphever valget.
    kart.on('click', e => {
      if (!kart.queryRenderedFeatures(e.point, { layers: KLIKKBARE.concat('klynger') }).length) nullstillValg();
    });

    KLIKKBARE.concat('klynger').forEach(id => {
      kart.on('mouseenter', id, () => { kart.getCanvas().style.cursor = 'pointer'; });
      kart.on('mouseleave', id, () => { kart.getCanvas().style.cursor = ''; });
    });

    KLIKKBARE.forEach(id => {
      kart.on('click', id, e => {
        // Punkter ligger over linjer: klikk på et punkt skal ikke også velge linjen under.
        if (id !== 'punkter' && kart.queryRenderedFeatures(e.point, { layers: ['punkter', 'klynger'] }).length) return;
        const o = oppslagFraId(e.features[0].properties._id);
        if (!o) return;
        velg(o.id, false);
        if (o.erLinje) aapnePopup(o, e.lngLat);
      });
    });

    kart.on('click', 'klynger', async e => {
      const f = e.features[0];
      const zoom = await kart.getSource('steder').getClusterExpansionZoom(f.properties.cluster_id);
      kart.easeTo({ center: f.geometry.coordinates, zoom: zoom + 0.5, duration: 500 });
    });

    kart.on('mousemove', 'punkter', e => {
      const f = e.features[0];
      tips.setLngLat(f.geometry.coordinates).setText(f.properties.navn || '').addTo(kart);
    });
    kart.on('mouseleave', 'punkter', () => tips.remove());
  }

  /* Filtrering bytter ut dataene, slik at klyngene regnes ut fra det som vises. */
  function filtrerKart(vis) {
    if (!kart.getSource('steder')) return;
    const medGeo = vis.filter(o => o.f.geometry);
    const punkter = medGeo.filter(o => !o.erLinje).map(o => o.f);
    const linjer = medGeo.filter(o => o.erLinje).map(o => o.f);
    kart.getSource('steder').setData({ type: 'FeatureCollection', features: punkter });
    kart.getSource('ruter').setData({ type: 'FeatureCollection', features: linjer });
  }

  function visFokus(o) {
    if (!kart.getSource('fokus')) return;
    kart.getSource('fokus').setData({ type: 'FeatureCollection', features: (o && o.fokus) || [] });
  }

  function aapnePopup(o, lngLat) {
    popup.setLngLat(lngLat).setHTML(popupHtml(o.p, o.punkt, o.id)).addTo(kart);
  }

  /* «Zoom inn» i popupen: til området når det er tegnet, ellers et godt stykke inn —
     nabolag til bydelsnivå, enkeltsteder til gatenivå. */
  function zoomInn(o) {
    if (o.fokusBbox) kart.fitBounds(o.fokusBbox, { padding: 90, maxZoom: 16, duration: 700 });
    else if (o.erLinje && o.bbox) kart.fitBounds(o.bbox, { padding: 70, maxZoom: 15, duration: 700 });
    else if (o.punkt) {
      const mal = o.p.kategori === 'nabolag' ? 14.5 : 16;
      kart.flyTo({ center: o.punkt, zoom: Math.max(kart.getZoom(), mal), duration: 700 });
    }
  }

  document.addEventListener('click', e => {
    const knapp = e.target.closest && e.target.closest('.pop-zoom');
    if (!knapp) return;
    const o = oppslagFraId(knapp.dataset.id);
    if (o) zoomInn(o);
  });

  /* ---------- hjelpere ---------- */

  const katInfo = k => KATEGORIER[k] || { navn: state.ukjenteKategorier[k] || k || 'Ukjent', farge: UKJENT_FARGE };
  const erLinjekategori = k => k === 'gaatur';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function metaLinje(p) {
    return [p.sone, katInfo(p.kategori).navn].filter(Boolean).join(' · ');
  }

  function ruteMeta(p) {
    return [p.lengde, p.varighet, p.sone].filter(Boolean).join(' · ');
  }

  /* Første avsnitt av notatet, forkortet — brukes i lista. Hele notatet vises i popup/rutekort. */
  function kortNotat(t) {
    const a = String(t || '').split(/\n\s*\n/)[0].replace(/\s*\n\s*/g, ' ');
    return a.length > 160 ? a.slice(0, 157).replace(/\s+\S*$/, '') + ' …' : a;
  }

  function mapsLenke(p, latlng) {
    if (p.google_url) return p.google_url;
    if (p.place_id) {
      return 'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent(p.navn) + '&query_place_id=' + encodeURIComponent(p.place_id);
    }
    if (latlng) {
      return 'https://www.google.com/maps/search/?api=1&query=' + latlng.lat + ',' + latlng.lng;
    }
    return null;
  }

  function popupHtml(p, latlng, id) {
    const lenke = mapsLenke(p, latlng);
    const lenker = [
      id ? '<button type="button" class="pop-lenke pop-zoom" data-id="' + esc(id) + '">Zoom inn</button>' : '',
      lenke ? '<a class="pop-lenke" href="' + lenke + '" target="_blank" rel="noopener">Åpne i Google Maps</a>' : ''
    ].filter(Boolean);
    return '<h3 class="pop-navn">' + esc(p.navn) + '</h3>' +
      '<p class="pop-meta">' + esc(metaLinje(p) || ruteMeta(p)) + '</p>' +
      (p.gater && p.gater.length ? '<p class="pop-gater">' + esc(p.gater.join(' · ')) + '</p>' : '') +
      (p.notat ? '<p class="pop-notat">' + esc(p.notat) + '</p>' : '') +
      (lenker.length ? '<p class="pop-lenker">' + lenker.join('<span class="pop-skille">·</span>') + '</p>' : '');
  }

  /* ---------- oppslag fra data ---------- */

  function bbox(coords) {
    const b = [Infinity, Infinity, -Infinity, -Infinity];
    coords.forEach(c => {
      b[0] = Math.min(b[0], c[0]); b[1] = Math.min(b[1], c[1]);
      b[2] = Math.max(b[2], c[0]); b[3] = Math.max(b[3], c[1]);
    });
    return b;
  }

  function lagOppslag(f, i) {
    const id = 'f' + i;
    const fokus = f.fokus || [];
    delete f.fokus;
    f.properties = Object.assign({}, f.properties, { _id: id });
    const p = f.properties;
    const g = f.geometry;
    const erLinje = (g && g.type === 'LineString') || erLinjekategori(p.kategori);
    const coords = !g ? [] : g.type === 'LineString' ? g.coordinates : [g.coordinates];
    const fokusCoords = [].concat.apply([], fokus.map(x =>
      x.geometry.type === 'Polygon' ? x.geometry.coordinates[0] :
      x.geometry.type === 'LineString' ? x.geometry.coordinates : []));

    return {
      id: id, f: f, p: p, erLinje: erLinje, fokus: fokus,
      punkt: g && g.type === 'Point' ? { lng: g.coordinates[0], lat: g.coordinates[1] } : null,
      bbox: coords.length ? bbox(coords) : null,
      fokusBbox: fokusCoords.length ? bbox(fokusCoords.concat(coords)) : null
    };
  }

  function oppslagFraId(id) {
    return state.oppslag.find(x => x.id === id);
  }

  /* ---------- filtrering ---------- */

  function synlige() {
    const q = state.sok.trim().toLowerCase();
    return state.oppslag.filter(o => {
      const p = o.p;
      if (state.soner.size && !state.soner.has(p.sone)) return false;
      if (state.kategorier.size && !state.kategorier.has(p.kategori)) return false;
      if (state.kunFavoritter && !p.favoritt) return false;
      if (q) {
        const hay = [p.navn, p.notat, p.sone, katInfo(p.kategori).navn].concat(p.gater || []).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  /* ---------- tegning ---------- */

  function tegn() {
    const vis = synlige();

    filtrerKart(vis);

    const antSteder = vis.filter(o => !o.erLinje).length;
    const antLinjer = vis.length - antSteder;
    const deler = [antSteder + (antSteder === 1 ? ' sted' : ' steder')];
    if (antLinjer) deler.push(antLinjer + (antLinjer === 1 ? ' rute' : ' ruter'));
    el.teller.textContent = deler.join(' · ');

    tegnListe(vis);

    if (state.valgtId && !vis.some(o => o.id === state.valgtId)) {
      state.valgtId = null;
      el.ruteKort.hidden = true;
      popup.remove();
      visFokus(null);
    }
  }

  function tegnListe(vis) {
    el.liste.innerHTML = '';

    if (!vis.length) {
      const t = document.createElement('p');
      t.className = 'tomt';
      t.textContent = state.oppslag.length
        ? 'Ingen treff. Juster filtrene eller søket.'
        : 'Ingen steder lagt inn ennå.';
      el.liste.appendChild(t);
      return;
    }

    const rekkefolge = state.soneRekkefolge;
    const medSoner = state.brukteSoner.size > 0;
    vis.slice()
      .sort((a, b) => {
        const sa = rekkefolge.indexOf(a.p.sone), sb = rekkefolge.indexOf(b.p.sone);
        if (sa !== sb) return (sa < 0 ? 99 : sa) - (sb < 0 ? 99 : sb);
        if (!!b.p.favoritt !== !!a.p.favoritt) return b.p.favoritt ? 1 : -1;
        return (a.p.navn || '').localeCompare(b.p.navn || '', 'nb');
      })
      .forEach((o, i, arr) => {
        if (medSoner && (i === 0 || arr[i - 1].p.sone !== o.p.sone)) {
          const h = document.createElement('p');
          h.className = 'sone-hode';
          h.textContent = o.p.sone || 'Uten sone';
          el.liste.appendChild(h);
        }
        el.liste.appendChild(oppslagEl(o));
      });
  }

  function oppslagEl(o) {
    const p = o.p;
    const info = katInfo(p.kategori);

    const div = document.createElement('div');
    div.className = 'oppslag' + (state.valgtId === o.id ? ' er-valgt' : '');
    div.setAttribute('role', 'listitem');
    div.tabIndex = 0;

    div.innerHTML =
      '<div class="oppslag-topp">' +
        '<h2 class="oppslag-navn">' + esc(p.navn) + '</h2>' +
        (p.favoritt ? '<span class="favoritt-merke">Favoritt</span>' : '') +
      '</div>' +
      '<p class="oppslag-meta">' +
        '<span class="prikk" style="background:' + info.farge + '"></span>' +
        esc(metaLinje(p) || ruteMeta(p)) +
      '</p>' +
      (p.notat ? '<p class="oppslag-notat">' + esc(kortNotat(p.notat)) + '</p>' : '');

    div.addEventListener('click', () => velg(o.id, true));
    div.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); velg(o.id, true); }
    });

    return div;
  }

  /* ---------- valg ---------- */

  function velg(id, flyTil) {
    const o = oppslagFraId(id);
    if (!o) return;
    state.valgtId = id;
    visFokus(o);

    if (o.erLinje) {
      popup.remove();
      if (flyTil && o.bbox) kart.fitBounds(o.bbox, { padding: 70, maxZoom: 15, duration: 600 });
      visRuteKort(o);
    } else {
      el.ruteKort.hidden = true;
      if (flyTil && o.fokusBbox) {
        kart.fitBounds(o.fokusBbox, { padding: 90, maxZoom: 16, duration: 600 });
      } else if (flyTil && o.punkt) {
        kart.flyTo({ center: o.punkt, zoom: Math.max(kart.getZoom(), 13), duration: 600 });
      }
      if (o.punkt) aapnePopup(o, o.punkt);
    }

    // Lista markerer valget, men blar ikke — man blir værende i kartet.
    tegnListe(synlige());
  }

  function nullstillValg() {
    if (!state.valgtId) return;
    state.valgtId = null;
    el.ruteKort.hidden = true;
    visFokus(null);
    tegnListe(synlige());
  }

  function visRuteKort(o) {
    const p = o.p;
    el.ruteKicker.textContent = 'Gåtur' + (o.f.geometry ? '' : ' · rute ikke tegnet');
    el.ruteNavn.textContent = p.navn || '';
    el.ruteMeta.textContent = ruteMeta(p);
    el.ruteNotat.textContent = p.notat || '';
    el.ruteKort.hidden = false;
  }

  el.ruteLukk.addEventListener('click', nullstillValg);

  /* ---------- filterknapper ---------- */

  function lagChip(tekst, farge, aktiv, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.setAttribute('aria-pressed', aktiv ? 'true' : 'false');
    if (farge) {
      const prikk = document.createElement('span');
      prikk.className = 'prikk';
      prikk.style.background = farge;
      b.appendChild(prikk);
    }
    b.appendChild(document.createTextNode(tekst));
    b.addEventListener('click', onClick);
    return b;
  }

  /* Én verdi om gangen per filtergruppe. «Alle» (tom mengde) viser alt;
     trykk på den aktive knappen igjen går tilbake til «Alle». */
  function velgEn(set, verdi) {
    const var_valgt = verdi != null && set.has(verdi);
    set.clear();
    if (verdi != null && !var_valgt) set.add(verdi);
    byggFiltre();
    tegn();
  }

  function byggGruppe(beholder, verdier, set, navnFor, fargeFor) {
    beholder.innerHTML = '';
    if (verdier.length < 2) { beholder.hidden = true; return; }
    beholder.hidden = false;
    beholder.appendChild(lagChip('Alle', null, set.size === 0, () => velgEn(set, null)));
    verdier.forEach(v => {
      beholder.appendChild(lagChip(navnFor(v), fargeFor ? fargeFor(v) : null, set.has(v), () => velgEn(set, v)));
    });
  }

  function byggFiltre() {
    // soner og kategorier — kun de som faktisk finnes i datasettet
    byggGruppe(el.fSone, state.soneRekkefolge.filter(s => state.brukteSoner.has(s)), state.soner, s => s);
    byggGruppe(el.fKategori, state.brukteKategorier, state.kategorier,
      k => katInfo(k).navn, k => katInfo(k).farge);

    // status
    el.fStatus.innerHTML = '';
    el.fStatus.hidden = !state.oppslag.length;
    el.fStatus.appendChild(lagChip('Kun favoritter', null, state.kunFavoritter, () => {
      state.kunFavoritter = !state.kunFavoritter;
      byggFiltre();
      tegn();
    }));
  }

  el.sok.addEventListener('input', e => {
    state.sok = e.target.value;
    tegn();
  });

  /* ---------- side fra metadata ---------- */

  function settOppSide(meta) {
    if (meta.tittel) document.title = meta.tittel;
    el.tittel.textContent  = meta.tittel || '';
    el.ingress.textContent = meta.undertittel || '';
    el.ingress.hidden = !meta.undertittel;

    // senter er [lengdegrad, breddegrad], som i resten av GeoJSON
    const senter = Array.isArray(meta.senter) && meta.senter.length === 2 ? meta.senter : [0, 20];
    kart.jumpTo({ center: senter, zoom: typeof meta.zoom === 'number' ? meta.zoom : 11 });
  }

  /* ---------- last data ---------- */

  const hentGeometri = GEO_URL
    ? fetch(GEO_URL).then(r => r.ok ? r.json() : null).catch(() => null)
    : Promise.resolve(null);

  Promise.all([
    fetch(DATA_URL).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }),
    hentGeometri
  ])
    .then(([tekst, geo]) => {
      const md = lesMarkdown(tekst);
      const meta = byggMeta(md);
      settOppSide(meta);

      state.oppslag = byggFeatures(md, geo).map(lagOppslag);
      Object.keys(md.kategoriNavn).forEach(k => {
        if (!KATEGORIER[k]) state.ukjenteKategorier[k] = md.kategoriNavn[k];
      });

      state.brukteSoner = new Set(state.oppslag.map(o => o.p.sone).filter(Boolean));
      state.soneRekkefolge = (meta.soner || []).slice();
      state.brukteSoner.forEach(s => {
        if (!state.soneRekkefolge.includes(s)) state.soneRekkefolge.push(s);
      });
      const rekkefolge = Object.keys(KATEGORIER);
      state.brukteKategorier = rekkefolge.filter(k => state.oppslag.some(o => o.p.kategori === k));
      state.oppslag.forEach(o => {
        if (o.p.kategori && !state.brukteKategorier.includes(o.p.kategori)) {
          state.brukteKategorier.push(o.p.kategori);
        }
      });

      byggFiltre();
      tegn();

      const medBbox = state.oppslag.filter(o => o.bbox);
      if (medBbox.length) {
        kart.fitBounds(bbox(medBbox.flatMap(o => [o.bbox.slice(0, 2), o.bbox.slice(2)])),
          { padding: 50, duration: 0 });
      }

      // Lista virker uavhengig av kartet; lagene legges på når stilen er lastet.
      kartKlar.then(() => {
        leggTilKartlag();
        filtrerKart(synlige());
      });

      el.fotTekst.innerHTML = 'Rediger <code>' + esc(DATA_NAVN) + '</code> for å legge til steder.' +
        (meta.oppdatert ? ' Sist oppdatert ' + esc(meta.oppdatert) + '.' : '');
    })
    .catch(err => {
      el.liste.innerHTML = '<p class="tomt">Fant ikke <code>' + esc(DATA_NAVN) + '</code> (' + esc(err.message) +
        ').<br><br>Åpnes siden fra <code>file://</code>? Kjør <code>python3 -m http.server</code> i mappen ' +
        'og åpne <code>localhost:8000</code>.</p>';
      el.teller.textContent = 'Ingen data';
    });

}
