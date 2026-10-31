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
  nabolag:    { navn: 'Nabolag og gater',    en: 'Neighbourhoods and streets', farge: '#8A5A2B', ikon: 'hus',
                alias: ['Nabolag', 'Gater', 'Gate', 'Strøk'] },
  restaurant: { navn: 'Restauranter',        en: 'Restaurants',            farge: '#9E4A3C', ikon: 'bestikk',
                alias: ['Restaurant', 'Spisesteder'] },
  cafe:       { navn: 'Kaféer',              en: 'Cafés',                  farge: '#A9713F', ikon: 'kopp',
                alias: ['Kafé', 'Café', 'Caféer', 'Bakeri', 'Bakerier'] },
  bar:        { navn: 'Barer',               en: 'Bars',                   farge: '#6E4A6B', ikon: 'glass',
                alias: ['Bar', 'Puber', 'Pub'] },
  jazz:       { navn: 'Jazzklubber',         en: 'Jazz clubs',             farge: '#A33E6B', ikon: 'note',
                alias: ['Jazzklubb', 'Jazz', 'Livemusikk', 'Musikk', 'Jazz club'] },
  museum:     { navn: 'Muséer og gallerier', en: 'Museums and galleries',  farge: '#3F5A6B', ikon: 'ramme',
                alias: ['Museum', 'Museer', 'Galleri', 'Gallerier'] },
  butikk:     { navn: 'Butikker',            en: 'Shops',                  farge: '#4F6B7A', ikon: 'pose',
                alias: ['Butikk', 'Shopping', 'Marked', 'Markeder'] },
  hotell:     { navn: 'Hoteller',            en: 'Hotels',                 farge: '#4A5896', ikon: 'seng',
                alias: ['Hotell', 'Hotel', 'Hotels', 'Overnatting'] },
  strand:     { navn: 'Strender og beach clubs', en: 'Beaches and beach clubs', farge: '#2F8A8A', ikon: 'parasoll',
                alias: ['Strand', 'Strender', 'Beach club', 'Beach clubs', 'Badeplasser', 'Bading'] },
  omvei:      { navn: 'Verdt en omvei',      en: 'Worth a detour',         farge: '#5C7A4F', ikon: 'flagg',
                alias: ['Annet', 'Point of interest', 'Severdigheter', 'Park', 'Parker'] },
  gaatur:     { navn: 'Gåturer',             en: 'Walks',                  farge: '#7A6A2B',
                alias: ['Gåtur', 'Ruter', 'Rute'] }
};

/* ---------- språk ----------

   Norsk er standard. Språket velges med bryteren NO / EN øverst i sidebaren, eller med
   ?lang=en i adressen (for å dele en engelsk lenke). Valget huskes i nettleseren.
   Faste tekster ligger i TEKST; innholdet har valgfrie engelske felt i by-fila
   (- en:, - navn-en:, tittel-en:, undertittel-en:). Mangler engelsk, vises norsk. */

const SPRAK_NOKKEL = 'byguider-sprak';

function lesSprak() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'no') {
    try { localStorage.setItem(SPRAK_NOKKEL, q); } catch (e) { /* privat modus o.l. */ }
    return q;
  }
  try {
    const lagret = localStorage.getItem(SPRAK_NOKKEL);
    if (lagret === 'en' || lagret === 'no') return lagret;
  } catch (e) { /* ingen lagring — bruk standard */ }
  return 'no';
}

let SPRAK = lesSprak();

const TEKST = {
  no: {
    sprak: 'Språk',
    duErHer: 'Du er her',
    byguider: 'Byguider',
    tilLista: 'Liste ↓',
    tilKartet: 'Kart ↑',
    sok: 'Søk etter navn eller notat',
    sokEtikett: 'Søk',
    tomSok: 'Tøm søket',
    omrade: 'Område',
    kategori: 'Kategori',
    alle: 'Alle',
    kunFavoritter: 'Kun favoritter',
    naerMeg: 'Nær meg',
    gange: min => min + ' min å gå',
    favoritt: 'Favoritt',
    utenSone: 'Uten sone',
    ukjent: 'Ukjent',
    lukk: 'Lukk',
    gatur: 'Gåtur',
    ruteIkkeTegnet: 'rute ikke tegnet',
    zoomInn: 'Zoom inn',
    aapneMaps: 'Google Maps',
    veibeskrivelse: 'Veibeskrivelse',
    del: 'Del',
    lenkeKopiert: 'Lenke kopiert',
    nettside: 'Nettside',
    artikkelFra: 'Artikkel fra',
    artikkel: 'Artikkel',
    visHeleByen: 'Vis hele byen',
    forhandsvisning: 'forhåndsvisning',
    ingenTreff: 'Ingen treff. Juster filtrene eller søket.',
    ikkeBesokt: 'Ikke besøkt ennå',
    ikkeBesoktAntall: n => 'Ikke besøkt ennå (' + n + ')',
    forstevalg: 'Førstevalg',
    ingenSteder: 'Ingen steder lagt inn ennå.',
    ingenData: 'Ingen data',
    steder: n => n + (n === 1 ? ' sted' : ' steder'),
    ruter: n => n + (n === 1 ? ' rute' : ' ruter'),
    offlineLagrer: 'Lagrer for bruk offline …',
    offlineLagrerPst: p => 'Lagrer for bruk offline … ' + p + ' %',
    offlineLagret: dato => 'Tilgjengelig offline · ' + dato,
    offlineDelvis: 'Bare delvis lagret for bruk offline',
    fot: (fil, dato) => 'Rediger ' + fil + ' for å legge til steder.' + (dato ? ' Sist oppdatert ' + dato + '.' : ''),
    fantIkke: (fil, feil) => 'Fant ikke ' + fil + ' (' + feil + ').',
    lokalt: 'Åpnes siden fra <code>file://</code>? Kjør <code>python3 -m http.server</code> i mappen og åpne <code>localhost:8000</code>.'
  },
  en: {
    sprak: 'Language',
    duErHer: 'You are here',
    byguider: 'City guides',
    tilLista: 'List ↓',
    tilKartet: 'Map ↑',
    sok: 'Search names and notes',
    sokEtikett: 'Search',
    tomSok: 'Clear search',
    omrade: 'Area',
    kategori: 'Category',
    alle: 'All',
    kunFavoritter: 'Favourites only',
    naerMeg: 'Near me',
    gange: min => min + ' min walk',
    favoritt: 'Favourite',
    utenSone: 'No area',
    ukjent: 'Unknown',
    lukk: 'Close',
    gatur: 'Walk',
    ruteIkkeTegnet: 'route not drawn',
    zoomInn: 'Zoom in',
    aapneMaps: 'Google Maps',
    veibeskrivelse: 'Directions',
    del: 'Share',
    lenkeKopiert: 'Link copied',
    nettside: 'Website',
    artikkelFra: 'Article from',
    artikkel: 'Article',
    visHeleByen: 'Show the whole city',
    forhandsvisning: 'preview',
    ingenTreff: 'No matches. Adjust the filters or the search.',
    ikkeBesokt: 'Not yet visited',
    ikkeBesoktAntall: n => 'Not yet visited (' + n + ')',
    forstevalg: 'Top pick',
    ingenSteder: 'No places added yet.',
    ingenData: 'No data',
    steder: n => n + (n === 1 ? ' place' : ' places'),
    ruter: n => n + (n === 1 ? ' walk' : ' walks'),
    offlineLagrer: 'Saving for offline use …',
    offlineLagrerPst: p => 'Saving for offline use … ' + p + '%',
    offlineLagret: dato => 'Available offline · ' + dato,
    offlineDelvis: 'Only partly saved for offline use',
    fot: (fil, dato) => 'Edit ' + fil + ' to add places.' + (dato ? ' Last updated ' + dato + '.' : ''),
    fantIkke: (fil, feil) => 'Could not find ' + fil + ' (' + feil + ').',
    lokalt: 'Opened from <code>file://</code>? Run <code>python3 -m http.server</code> in the folder and open <code>localhost:8000</code>.'
  }
};

function t(nokkel, ...arg) {
  const v = nokkel in TEKST[SPRAK] ? TEKST[SPRAK][nokkel] : TEKST.no[nokkel];
  return typeof v === 'function' ? v(...arg) : (v == null ? nokkel : v);
}

/* «ca. 1 t 45 min», «2,5 km» -> «approx. 1 h 45 min», «2.5 km» på engelsk. */
function maal(s) {
  if (SPRAK !== 'en' || !s) return s || '';
  return String(s)
    .replace(/\bca\.\s*/gi, 'approx. ')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/(\d)\s*timer?\b/g, '$1 hours')
    .replace(/(\d)\s*t\b/g, '$1 h');
}

/* Ønskeliste: steder med «- status: onskeliste» er ikke besøkt ennå. De vises for alle,
   sammenslått nederst i lista og som eget kartlag som er av til man slår det på. */
const erOnskeliste = p => normaliser(p.status) === 'onskeliste';

const SPRAKVALG =
  '<span class="sprakvalg" role="group" data-t-aria="sprak">' +
    '<button type="button" data-sprak="no" lang="no">NO</button>' +
    '<span class="smule-skille">/</span>' +
    '<button type="button" data-sprak="en" lang="en">EN</button>' +
  '</span>';

/* Faste tekster i siden er merket med data-t (tekst), data-t-aria, data-t-title og
   data-t-placeholder, og fylles herfra — ved oppstart og ved hvert språkbytte. */
function oversettDom() {
  document.documentElement.lang = SPRAK;
  document.querySelectorAll('[data-t]').forEach(e => { e.textContent = t(e.dataset.t); });
  document.querySelectorAll('[data-t-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.tAria)); });
  document.querySelectorAll('[data-t-title]').forEach(e => { e.title = t(e.dataset.tTitle); });
  document.querySelectorAll('[data-t-placeholder]').forEach(e => { e.placeholder = t(e.dataset.tPlaceholder); });
  document.querySelectorAll('.sprakvalg [data-sprak]').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.sprak === SPRAK ? 'true' : 'false');
  });
}

const sprakLyttere = [];

function byttSprak(ny) {
  if ((ny !== 'no' && ny !== 'en') || ny === SPRAK) return;
  SPRAK = ny;
  try { localStorage.setItem(SPRAK_NOKKEL, ny); } catch (e) { /* ingen lagring */ }
  const u = new URL(location.href);
  if (ny === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
  history.replaceState(history.state, '', u);
  oversettDom();
  sprakLyttere.forEach(f => f());
}

document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('.sprakvalg [data-sprak]');
  if (b) byttSprak(b.dataset.sprak);
});

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
  seng:    'M4 6v13 M4 15h16v4 M4 11.5h6V15 M10 11.5h6.5A3.5 3.5 0 0 1 20 15 M7 9.5a1.3 1.3 0 1 0 0.01 0',
  parasoll:'M4 11.5a8 6.5 0 0 1 16 0z M12 11.5v8 M5 19.5h14',
  note:    'M11 18V6.5l8-2V16 M11 10l8-2 M6 18a2.5 2 0 1 0 5 0a2.5 2 0 1 0-5 0 M14 16a2.5 2 0 1 0 5 0a2.5 2 0 1 0-5 0',
  prikk:   'M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0'
};

/* Kartstilen: CARTO Voyager omfarget til papirpaletten fra style.css.
   Reglene matcher lag-id-er i Voyager-stilen; første treff vinner. */
/* Mørk modus (prøve): følger enhetens innstilling når siden lastes. Samme Voyager-stil
   (så offline-lageret er det samme), bare med en mørk, varm palett. Fargene i style.css
   byttes i @media (prefers-color-scheme: dark) nederst der. */
const MORK = !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
/* Fargene bakes inn i kartstilen, lagene og ikonene ved oppstart. Bytter enheten modus mens siden
   er åpen, lastes siden på nytt, så kartet får riktig palett. */
if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => location.reload());

const KARTPALETT = MORK ? {
  bakgrunn:    '#221E19',
  park:        '#283024',
  vann:        '#1C282C',
  bygg:        '#2A251F',
  byggKant:    '#352E26',
  vei:         '#3A332B',
  veiKant:     '#2C2620',
  storVei:     '#4A4034',
  storVeiKant: '#3A3128',
  sti:         '#564A3B',
  bane:        '#463D33',
  grense:      '#4A4136',
  tekst:       '#DCD3C3',
  tekstDempet: '#A6987F',
  veinavn:     '#8C7F6A',
  vannTekst:   '#7F9AA2',
  husnummer:   '#6E6252'
} : {
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

/* Bruker STILREGLER og SKJULTE_LAG på Voyager-stilen (JSON) før kartet får den. Bare egenskaper
   som hører til lagtypen settes (fill-* på fill-lag osv.), ellers avviser MapLibre stilen. */
const EGENSKAP_TYPE = { background: 'background', fill: 'fill', line: 'line', text: 'symbol', icon: 'symbol' };
function fargeleggStil(stil) {
  stil.layers.forEach(l => {
    if (SKJULTE_LAG.some(r => r.test(l.id))) {
      l.layout = Object.assign({}, l.layout, { visibility: 'none' });
      return;
    }
    const regel = STILREGLER.find(([r]) => r.test(l.id));
    if (!regel) return;
    Object.keys(regel[1]).forEach(egenskap => {
      if (EGENSKAP_TYPE[egenskap.split('-')[0]] === l.type) (l.paint = l.paint || {})[egenskap] = regel[1][egenskap];
    });
  });
  return stil;
}

/* Lag i Voyager som slås av. building-top er en forskjøvet kopi av bygningene
   som gir en mørk «skyggekant» på høy zoom. */
const SKJULTE_LAG = [/^building-top$/];

/* Skriften CARTO-stilen selv bruker til bynavn — kun disse finnes på glyph-serveren. */
const KARTSKRIFT = ['Montserrat Medium', 'Open Sans Bold', 'Noto Sans Regular',
  'HanWangHeiLight Regular', 'NanumBarunGothic Regular'];

const PAPIR = MORK ? '#1B1814' : '#F7F4EE';
/* Papirfargen med en gang, før style.css er lastet — ellers er siden hvit et øyeblikk i mørk modus. */
document.documentElement.style.background = PAPIR;
document.documentElement.style.colorScheme = MORK ? 'dark' : 'light';
const KORT = MORK ? '#24201B' : '#FFFDF8';
const TEKSTFARGE = MORK ? '#ECE5D8' : '#241F19';
const AKSENT = MORK ? '#C99158' : '#8A5A2B';
const DEMPET = MORK ? '#A6987F' : '#6B5D4A';

/* CARTO-nøkkel (gratis, https://carto.com/basemaps/apikey). Kravet gjelder foreløpig
   rasterkartene, men nøkkelen sendes med på vektorstilen også.
   To nøkler, fordi CARTO krever egen nøkkel for lokale opphav:
   – publisert: låst til stam.pe, *.stam.pe og paalstampe.github.io
   – lokal: låst til localhost og 127.0.0.1 (python3 -m http.server)
   Fra andre opphav (raw.githack.com o.l.) svarer CARTO uten CORS-header og
   kartet blir blankt — det er ikke en kodefeil. */
const LOKAL = ['localhost', '127.0.0.1'].includes(location.hostname);
const CARTO_KEY = LOKAL
  ? 'cb1_400i_2_e6808290ee15514de2ed6c55'
  : 'cb1_400i_1_fd049a8bd96268b9a1be2213';

const KARTSTIL = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  + (CARTO_KEY ? '?key=' + CARTO_KEY : '');

const UKJENT_FARGE = DEMPET;

/* ---------- by-fila (markdown) ----------

   Hver by er én markdown-fil (data/<by>.md) som er kilden for alt innhold:

     ---                              frontmatter: tittel, kicker (linja under tittelen), undertittel,
     tittel: Pål og Vibekes London        senter (breddegrad, lengdegrad), zoom, oppdatert
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
    [k, KATEGORIER[k].navn, KATEGORIER[k].en].concat(KATEGORIER[k].alias || []).some(x => normaliser(x) === n));
  return k || n.replace(/[^a-z0-9]+/g, '-');
}

/* "51.5207, -0.1519" (breddegrad, lengdegrad) -> [-0.1519, 51.5207] */
function lesKoordinat(tekst) {
  const m = String(tekst || '').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  return m ? [parseFloat(m[2]), parseFloat(m[1])] : null;
}

const FELT = ['sted', 'besokt', 'status', 'google', 'nettside', 'gater', 'lengde', 'varighet', 'utenfor', 'en', 'navn-en', 'les'];  // besokt leses, men vises ikke

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
        sone: sone, kategori: kategori, felt: {}, notat: [], notatEn: [], iEngelsk: false
      };
      steder.push(sted);
    } else if (sted) {
      const f = l.match(/^\s*[-*]\s+([^:]+):\s*(.*)$/);
      const felt = f && normaliser(f[1]);
      if (felt === 'en') {
        // - en: starter det engelske notatet; fri tekst etter denne linjen hører også til det
        sted.iEngelsk = true;
        sted.notatEn.push(f[2]);
      } else if (felt === 'les') {
        // - les: kan gjentas — én lenke til omtale/artikkel per linje
        (sted.felt.les = sted.felt.les || []).push(f[2].trim());
      } else if (f && FELT.includes(felt)) sted.felt[felt] = f[2].trim();
      else (sted.iEngelsk ? sted.notatEn : sted.notat).push(l);
    }
  }

  steder.forEach(st => {
    st.notat = st.notat.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    st.notatEn = st.notatEn.join('\n').replace(/\n{3,}/g, '\n\n').trim();
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
      navn_en: st.felt['navn-en'] || '',
      kategori: st.kategori,
      sone: st.sone,
      favoritt: st.favoritt,
      besokt: b ? /^(ja|j|yes|x)$/.test(b) : undefined,
      status: normaliser(st.felt.status) || undefined,
      notat: st.notat,
      notat_en: st.notatEn,
      place_id: /^https?:/.test(google) ? '' : google,
      google_url: /^https?:/.test(google) ? google : '',
      nettside: /^https?:\/\//.test(st.felt.nettside || '') ? st.felt.nettside : '',
      gater: (st.felt.gater || '').split(',').map(x => x.trim()).filter(Boolean),
      lengde: st.felt.lengde || '',
      varighet: st.felt.varighet || '',
      // utenfor: ja — stedet holdes utenfor startutsnittet (og «Vis hele byen»)
      utenfor: /^(ja|j|yes|x|true)$/.test(normaliser(st.felt.utenfor)),
      // les: «Kilde | Tittel | https://…» — vises sist i infoboksen
      les: (st.felt.les || []).map(lesLenke).filter(Boolean)
    };

    const omrade = finnGeo(st.navn, 'omrade').map(f => ({ type: 'Feature', geometry: f.geometry, properties: { rolle: 'omrade' } }));
    const gater = finnGeo(st.navn, 'gate').map(f => ({ type: 'Feature', geometry: f.geometry, properties: { rolle: 'gate' } }));
    const rute = finnGeo(st.navn, 'rute')[0];

    // Nabolagsknappen ligger midt i kjernen (polygon nr. 2) når den finnes, ellers midt i området.
    // sted: (fra Google) brukes bare for nabolag uten omriss.
    const flate = omrade[1] || omrade[0];
    let geometry = null;
    const pkt = lesKoordinat(st.felt.sted);
    if (flate) geometry = { type: 'Point', coordinates: punktInni(flate.geometry.coordinates[0]) };
    else if (pkt) geometry = { type: 'Point', coordinates: pkt };
    else if (rute) geometry = rute.geometry;

    return { type: 'Feature', geometry: geometry, properties: p, fokus: omrade.concat(gater) };
  });
}

/* Ligger punktet [lng, lat] inni ringen? (strålekasting) */
function iPolygon(p, ring) {
  let inni = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) inni = !inni;
  }
  return inni;
}

/* Et punkt midt i ringen: tyngdepunktet, så lenge det ligger godt inni. For buktete eller
   smale former (der tyngdepunktet havner utenfor eller nær kanten) brukes i stedet punktet
   lengst fra kanten, funnet på et rutenett over formen. */
function punktInni(ring) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const k = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    a += k; cx += (ring[j][0] + ring[i][0]) * k; cy += (ring[j][1] + ring[i][1]) * k;
  }
  const midt = a ? [cx / (3 * a), cy / (3 * a)] : ring[0];
  const xs = ring.map(k => k[0]), ys = ring.map(k => k[1]);
  const x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
  const y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
  let best = midt, bestAvstand = 0;
  for (let i = 1; i < 30; i++) for (let j = 1; j < 30; j++) {
    const p = [x0 + (x1 - x0) * i / 30, y0 + (y1 - y0) * j / 30];
    const d = iPolygon(p, ring) ? kantAvstand(p, ring) : 0;
    if (d > bestAvstand) { bestAvstand = d; best = p; }
  }
  return iPolygon(midt, ring) && kantAvstand(midt, ring) >= bestAvstand / 2 ? midt : best;
}

/* Korteste avstand fra punktet til ringens kant (i grader breddegrad; lengdegrad justert). */
function kantAvstand(p, ring) {
  const c = Math.cos(p[1] * Math.PI / 180);
  let min = Infinity;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const ax = (ring[j][0] - p[0]) * c, ay = ring[j][1] - p[1];
    const dx = (ring[i][0] - ring[j][0]) * c, dy = ring[i][1] - ring[j][1];
    const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
    min = Math.min(min, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return min;
}

/* «Financial Times | Artikkelens tittel | https://…» -> { kilde, tittel, url }.
   Kilde og tittel kan sløyfes; uten tittel brukes domenet. */
function lesLenke(verdi) {
  const deler = String(verdi || '').split('|').map(x => x.trim());
  const url = deler.pop();
  if (!/^https?:\/\/\S+$/.test(url || '')) return null;
  let tittel = deler.pop() || '';
  const kilde = deler.join(' | ');
  if (!tittel) {
    try { tittel = new URL(url).hostname.replace(/^www\./, ''); } catch (e) { tittel = url; }
  }
  return { kilde: kilde, tittel: tittel, url: url };
}

/* Metadata fra frontmatter; soner fra rekkefølgen på #-overskriftene. */
function byggMeta(md) {
  const m = md.meta;
  const s = lesKoordinat(m.senter);
  return {
    tittel: m.tittel || '', kicker: m.kicker || '', undertittel: m.undertittel || '',
    tittelEn: m['tittel-en'] || '', kickerEn: m['kicker-en'] || '', undertittelEn: m['undertittel-en'] || '',
    senter: s || undefined,
    zoom: m.zoom ? parseFloat(m.zoom) : undefined,
    senterMobil: lesKoordinat(m['senter-mobil']) || undefined,
    zoomMobil: m['zoom-mobil'] ? parseFloat(m['zoom-mobil']) : undefined,
    oppdatert: m.oppdatert || '',
    soner: md.soner
  };
}

/* ---------- oppstart ---------- */

const SKRIPT = document.currentScript;
const BASE = new URL('.', SKRIPT.src);          // mappen app.js ligger i
const BY = SKRIPT.dataset.by;

const RESSURSER = {
  fonter:  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Work+Sans:wght@400;500;600&display=swap',
  kartCss: 'https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css',
  kartJs:  'https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js'
};

const SKALL = `
<div class="app">
  <aside class="sidebar">
    <header class="sidebar-head">
      <nav class="smuler" data-t-aria="duErHer">
        <a href="/">stam.pe</a><span class="smule-skille">/</span><a href="${new URL('./', BASE).href}" data-t="byguider"></a><span class="smule-skille">/</span><span id="smule-by" aria-current="page"></span>${SPRAKVALG}
      </nav>
      <h1 class="tittel" id="tittel"></h1>
      <p class="kicker" id="kicker" hidden></p>
      <p class="ingress" id="ingress"></p>
    </header>
    <div class="sok-rad">
      <input type="search" id="sok" class="sok" data-t-placeholder="sok" data-t-aria="sokEtikett" autocomplete="off">
      <button type="button" class="sok-tom" id="sok-tom" data-t-aria="tomSok" hidden>&times;</button>
    </div>
    <div class="filtre">
      <div class="filterblokk">
        <p class="filter-etikett" id="etikett-sone" data-t="omrade"></p>
        <div class="filtergruppe" id="filter-sone" aria-labelledby="etikett-sone"></div>
      </div>
      <div class="filterblokk">
        <p class="filter-etikett" id="etikett-kategori" data-t="kategori"></p>
        <div class="filtergruppe" id="filter-kategori" aria-labelledby="etikett-kategori"></div>
      </div>
      <div class="filtergruppe filtergruppe--smal" id="filter-status"></div>
    </div>
    <div class="teller-rad">
      <span id="teller" class="teller"></span>
      <span id="offline-status" class="offline-status" hidden></span>
    </div>
    <div class="liste" id="liste" role="list"></div>
    <footer class="sidebar-fot">
      <span id="fot-tekst"></span>
    </footer>
  </aside>
  <main class="kartflate">
    <div id="kart"></div>
    <button type="button" class="til-lista" id="til-lista" data-t="tilLista"></button>
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

/* Offline: sw.js lagrer sidene, dataene og kartet (se kommentaren der). */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(new URL('sw.js', BASE).href, { scope: BASE.href }).catch(() => {});
}
if (performance.setResourceTimingBufferSize) performance.setResourceTimingBufferSize(2000);

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
  oversettDom();

  try {
    const [b] = await Promise.all([by, js]);
    const dataSti = b.data || ('data/' + b.id + '.md');
    const geoSti = b.geometri || null;
    const smule = document.getElementById('smule-by');
    const byNavn = () => (SPRAK === 'en' && b.navn_en) || b.navn || b.id;
    smule.innerHTML = '<span class="smule-bynavn"></span>';
    const fv = location.pathname.match(/\/forhandsvisning\/(.+?)\/[^/]+\/?$/);
    if (fv) {
      smule.insertAdjacentHTML('beforeend', ' · <span data-t="forhandsvisning"></span>: ');
      smule.appendChild(document.createTextNode(decodeURIComponent(fv[1])));
    }
    smule.firstChild.textContent = byNavn();
    sprakLyttere.push(() => { smule.firstChild.textContent = byNavn(); });
    oversettDom();
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
    onskeliste: [],              // ikke besøkt ennå — holdes utenfor oppslag
    visOnskeliste: false,        // kartlaget
    onskelisteApen: false,       // seksjonen nederst i lista
    soner: new Set(),            // tom = alle
    kategorier: new Set(),       // tom = alle
    kunFavoritter: false,
    naerMeg: false,              // lista sortert etter avstand fra egen posisjon
    minPosisjon: null,           // { lng, lat } mens «Nær meg» er på
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
    sokTom:     document.getElementById('sok-tom'),
    teller:     document.getElementById('teller'),
    offline:    document.getElementById('offline-status'),
    fSone:      document.getElementById('filter-sone'),
    fKategori:  document.getElementById('filter-kategori'),
    fStatus:    document.getElementById('filter-status'),
    fotTekst:   document.getElementById('fot-tekst'),
    smuleBy:    document.getElementById('smule-by'),
    tittel:     document.getElementById('tittel'),
    kicker:     document.getElementById('kicker'),
    ingress:    document.getElementById('ingress')
  };

  /* ---------- kart ---------- */

  /* Startvisningen settes fra metadata når dataene er lastet.
     Zoom er i MapLibre-skala: én lavere enn Leaflet for samme målestokk. */
  const kart = new maplibregl.Map({
    container: 'kart',
    center: [0, 20],
    zoom: 1,
    maxZoom: 18,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    attributionControl: { compact: false }
  });
  kart.touchZoomRotate.disableRotation();
  /* Kartflaten holdes skjult (kun --kartflate synes) til byens utsnitt og stedene er på plass —
     ellers vises verdenskartet fra startposisjonen et øyeblikk før kartet hopper til byen. */
  const kartBoks = kart.getContainer();
  kartBoks.classList.add('kart-venter');
  const visKart = () => kartBoks.classList.remove('kart-venter');
  // Stilen fargelegges før den tegnes første gang, så den opprinnelige Voyager-stilen aldri blinker fram.
  kart.setStyle(KARTSTIL, { transformStyle: (forrige, ny) => fargeleggStil(ny) });
  kart.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

  /* Tilbake til startvisningen, slik siden åpnes: mobilutsnittet (senter-mobil/zoom-mobil) på smal
     skjerm, ellers utsnittet med stedene (unntatt «utenfor: ja»), ellers senter og zoom fra metadata. */
  let startvisning = null, startutsnitt = null;
  const mobilvisning = () => smalSkjerm.matches && sideMeta && sideMeta.senterMobil && typeof sideMeta.zoomMobil === 'number'
    ? { center: sideMeta.senterMobil, zoom: sideMeta.zoomMobil } : null;
  const tilStart = () => {
    const mobil = startutsnitt && mobilvisning();
    if (mobil) kart.flyTo(Object.assign({ duration: 800 }, mobil));
    else if (startutsnitt) kart.fitBounds(startutsnitt, { padding: 50, duration: 800 });
    else if (startvisning) kart.flyTo(Object.assign({ duration: 800 }, startvisning));
  };
  kart.addControl({
    onAdd() {
      const div = document.createElement('div');
      div.className = 'maplibregl-ctrl maplibregl-ctrl-group';
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ktrl-hjem';
      b.dataset.tTitle = b.dataset.tAria = 'visHeleByen';
      b.title = t('visHeleByen');
      b.setAttribute('aria-label', t('visHeleByen'));
      b.innerHTML = '<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path d="M3 6.75V3h3.75M15 6.75V3h-3.75M3 11.25V15h3.75M15 11.25V15h-3.75" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>';
      b.addEventListener('click', tilStart);
      div.appendChild(b);
      return div;
    },
    onRemove() {}
  }, 'top-left');

  /* Egen posisjon: sentrerer kartet og følger posisjonen til knappen trykkes igjen. */
  let posisjonKtrl = null;
  if ('geolocation' in navigator) {
    kart.addControl(posisjonKtrl = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      fitBoundsOptions: { maxZoom: 16 },
      trackUserLocation: true,
      showAccuracyCircle: true
    }), 'top-left');
    posisjonKtrl.on('geolocate', huskPosisjon);
    posisjonKtrl.on('error', e => { if (e.code === 1) glemPosisjon(); });
  }

  const kartKlar = new Promise(res => kart.once('load', res));

  const popup = new maplibregl.Popup({ closeButton: true, closeOnClick: false, focusAfterOpen: false, maxWidth: '300px', offset: 15, className: 'pop' });
  const tips = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 15, className: 'tips' });
  const ekteHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const smalSkjerm = window.matchMedia('(max-width: 900px)');   // samme brytepunkt som i style.css
  // Liggende mobil har menyen ved siden av kartet, som på Mac (samme spørring som i style.css).
  const liggendeMobil = window.matchMedia('(max-width: 900px) and (orientation: landscape) and (max-height: 500px)');
  popup.on('open', () => tips.remove());   // aldri navnelapp og popup oppå hverandre

  /* Farger defineres étt sted — KATEGORIER — og oversettes til et match-uttrykk. */
  const FARGE = ['match', ['get', 'kategori']]
    .concat(Object.keys(KATEGORIER).flatMap(k => [k, KATEGORIER[k].farge]))
    .concat([UKJENT_FARGE]);

  const FAV = ['==', ['get', 'favoritt'], true];

  const KARTLAG = {
    /* Usynlig, bred strek under gater og gåturer: gjør dem lette å treffe, særlig med fingeren. */
    'ruter-treff': {
      source: 'ruter',
      type: 'line',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#000', 'line-opacity': 0, 'line-width': 28 }
    },
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
        // Fyll i kartets bakgrunnsfarge, så klyngene ikke konkurrerer med nabolagene og stedene
        'circle-color': KARTPALETT.bakgrunn,
        'circle-radius': ['step', ['get', 'point_count'], 14, 10, 17, 25, 20],
        'circle-stroke-color': AKSENT,
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
      paint: { 'text-color': TEKSTFARGE }
    },
    punkter: {
      source: 'steder',
      type: 'symbol',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': ['coalesce',
          ['image', ['concat', 'ikon-', ['case', FAV, 'fav-', ''], ['get', 'kategori']]],
          ['image', ['case', FAV, 'ikon-fav-ukjent', 'ikon-ukjent']]],
        'icon-size': ['interpolate', ['linear'], ['zoom'], 10, 0.8, 14, 0.95],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'symbol-sort-key': ['case', FAV, 1, 0]
      }
    }
  };
  /* Nabolag har egen kilde uten klynging, så knappene alltid vises, og ligger øverst. */
  KARTLAG['nabolag-punkter'] = Object.assign({}, KARTLAG.punkter, { source: 'nabolag', filter: ['==', ['geometry-type'], 'Point'] });

  /* Ønskelisten: egen kilde uten klynging, så stedene aldri slås sammen med besøkte steder.
     Ring-ikoner (omriss uten fyll) i dempet farge; gåturer som tynn stiplet linje; nabolag med
     omrisset fra geometrifila, som de besøkte, men i dempet farge. Under de besøkte. */
  const ONSKEFARGE = DEMPET;   // dempet tekst i papirpaletten
  const ONSKELAG = {
    'onskeliste-flate': {
      source: 'onskeliste', type: 'fill',
      filter: ['==', ['geometry-type'], 'Polygon'],
      layout: { visibility: 'none' },
      paint: { 'fill-color': ONSKEFARGE, 'fill-opacity': 0.07 }
    },
    'onskeliste-kant': {
      source: 'onskeliste', type: 'line',
      filter: ['==', ['geometry-type'], 'Polygon'],
      layout: { 'line-join': 'round', visibility: 'none' },
      paint: { 'line-color': ONSKEFARGE, 'line-width': 1.5, 'line-opacity': 0.8, 'line-dasharray': [3, 2] }
    },
    'onskeliste-ruter': {
      source: 'onskeliste', type: 'line',
      filter: ['==', ['geometry-type'], 'LineString'],
      layout: { 'line-cap': 'round', 'line-join': 'round', visibility: 'none' },
      paint: { 'line-color': ONSKEFARGE, 'line-width': 3, 'line-opacity': 0.8, 'line-dasharray': [0.2, 2] }
    },
    'onskeliste-punkter': {
      source: 'onskeliste', type: 'symbol',
      filter: ['==', ['geometry-type'], 'Point'],
      layout: {
        // ★ på ønskelisten = førstevalg: ringen i kobber
        'icon-image': ['coalesce',
          ['image', ['concat', 'ikon-ring-', ['case', FAV, 'fav-', ''], ['get', 'kategori']]],
          ['image', ['case', FAV, 'ikon-ring-fav-ukjent', 'ikon-ring-ukjent']]],
        'symbol-sort-key': ['case', FAV, 1, 0],
        'icon-size': ['interpolate', ['linear'], ['zoom'], 10, 0.8, 14, 0.95],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        visibility: 'none'
      }
    }
  };

  const KLIKKBARE = ['ruter-treff', 'punkter', 'nabolag-punkter', 'onskeliste-ruter', 'onskeliste-punkter'];

  /* Alle tegnede nabolag har flate og omriss hele tiden (større område og kjerne), i samme stil som
     når nabolaget er valgt. Flatene er gjennomsiktige, så kjernen — som ligger oppå — blir mørkere. Navnet står under ikonet, men først når man har zoomet inn og
     det er plass. Ingen infoboks — ikonet velger nabolaget som før. */
  const NABOLAGSNAVN_MINZOOM = 12;
  const OMRADELAG = {
    'omrader-flate': {
      source: 'omrader', type: 'fill',
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: { 'fill-color': AKSENT, 'fill-opacity': 0.07 }
    },
    'omrader-kant': {
      source: 'omrader', type: 'line',
      filter: ['==', ['geometry-type'], 'Polygon'],
      layout: { 'line-join': 'round' },
      paint: { 'line-color': AKSENT, 'line-width': 1.5, 'line-opacity': 0.8, 'line-dasharray': [3, 2] }
    },
    /* Markerte gater vises hele tiden. Når hele byen vises, er de tynne og svake, og de får
       full styrke rundt zoom 13 (samme stil som når nabolaget er valgt). */
    'omrader-gater': {
      source: 'omrader', type: 'line',
      filter: ['==', ['get', 'rolle'], 'gate'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': AKSENT,
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 13, 3, 16, 6],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0.35, 13, 0.7]
      }
    },
    'omrader-navn': {
      source: 'omrader', type: 'symbol', minzoom: NABOLAGSNAVN_MINZOOM,
      filter: ['==', ['geometry-type'], 'Point'],
      layout: {
        'text-anchor': 'top',
        'text-offset': [0, 1.2],
        'text-field': ['get', 'navn'],
        'text-font': KARTSKRIFT,
        'text-size': 12,
        'text-max-width': 7,
        'text-padding': 2
      },
      paint: { 'text-color': AKSENT, 'text-halo-color': PAPIR, 'text-halo-width': 1.5 }
    }
  };

  /* Valgt nabolag: skisse av området (lys flate, stiplet kant) og de viktigste
     gatene uthevet. Tegnes under ruter og ikoner, og bare mens nabolaget er valgt. */
  const FOKUSLAG = {
    'fokus-flate': {
      source: 'fokus', type: 'fill',
      filter: ['==', ['get', 'rolle'], 'omrade'],
      paint: { 'fill-color': AKSENT, 'fill-opacity': 0.08 }
    },
    'fokus-kant': {
      source: 'fokus', type: 'line',
      filter: ['==', ['get', 'rolle'], 'omrade'],
      layout: { 'line-join': 'round' },
      paint: { 'line-color': AKSENT, 'line-width': 1.5, 'line-opacity': 0.8, 'line-dasharray': [3, 2] }
    },
    'fokus-gater': {
      source: 'fokus', type: 'line',
      filter: ['==', ['get', 'rolle'], 'gate'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': AKSENT, 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 3, 16, 6], 'line-opacity': 0.7 }
    }
  };

  /* Tegner ett ikon per kategori til et lerret: farget sirkel, papirkant, hvit glyf.
     Favoritter får i tillegg en kobberring utenfor papirkanten — samme størrelse ellers.
     Lerretet har luft til ringen også for vanlige ikoner, så alle skaleres likt.
     Nabolag er lyse firkanter (som klyngene) med kobberkant og kobberglyf, og litt større (R),
     så de skiller seg ut fra stedene. */
  function lagIkon(farge, glyf, favoritt, firkant) {
    const R = firkant ? 2.3 : 2, D = Math.round(30 * R);
    const c = document.createElement('canvas');
    c.width = c.height = D;
    const x = c.getContext('2d');
    if (favoritt === 'ring') return lagRing(x, D, R, glyf, farge || ONSKEFARGE, firkant);
    form(x, D, 11.5 * R, firkant);
    x.fillStyle = firkant ? KARTPALETT.vei : farge;
    x.fill();
    x.lineWidth = 1.5 * R;
    x.strokeStyle = firkant ? AKSENT : PAPIR;
    x.stroke();
    if (favoritt) {
      form(x, D, 13.25 * R, firkant);
      x.lineWidth = 1.5 * R;
      x.strokeStyle = AKSENT;
      x.stroke();
    }
    const s = (15 * R) / 24;
    x.translate(D / 2 - 12 * s, D / 2 - 12 * s);
    x.scale(s, s);
    x.lineWidth = 2.2;
    x.lineCap = 'round';
    x.lineJoin = 'round';
    x.strokeStyle = firkant ? AKSENT : KORT;
    x.stroke(new Path2D(glyf));
    return x.getImageData(0, 0, D, D);
  }

  /* Ønskeliste: bare omriss og glyf i dempet farge, uten fyll. En smal papirkant på begge sider
     av strekene holder dem lesbare oppå gater og bygninger. */
  function lagRing(x, D, R, glyf, farge, firkant) {
    form(x, D, 11 * R, firkant);
    x.lineWidth = 4 * R;
    x.strokeStyle = PAPIR;
    x.stroke();
    x.lineWidth = 1.6 * R;
    x.strokeStyle = farge;
    x.stroke();
    const s = (15 * R) / 24;
    x.translate(D / 2 - 12 * s, D / 2 - 12 * s);
    x.scale(s, s);
    x.lineCap = 'round';
    x.lineJoin = 'round';
    x.lineWidth = 4.4;
    x.strokeStyle = PAPIR;
    x.stroke(new Path2D(glyf));
    x.lineWidth = 2.2;
    x.strokeStyle = farge;
    x.stroke(new Path2D(glyf));
    return x.getImageData(0, 0, D, D);
  }

  /* Sirkel med radius r, eller firkant med halv side litt under r (så flaten blir omtrent lik). */
  function form(x, D, r, firkant) {
    x.beginPath();
    if (firkant) { const h = r * 0.9; x.rect(D / 2 - h, D / 2 - h, 2 * h, 2 * h); }
    else x.arc(D / 2, D / 2, r, 0, 2 * Math.PI);
  }

  function registrerIkoner() {
    Object.keys(KATEGORIER).forEach(k => {
      const kat = KATEGORIER[k];
      if (!kat.ikon) return;
      const glyf = IKONER[kat.ikon] || IKONER.prikk;
      const firkant = k === 'nabolag';
      kart.addImage('ikon-' + k, lagIkon(kat.farge, glyf, false, firkant), { pixelRatio: 2 });
      kart.addImage('ikon-fav-' + k, lagIkon(kat.farge, glyf, true, firkant), { pixelRatio: 2 });
      kart.addImage('ikon-ring-' + k, lagIkon(null, glyf, 'ring', firkant), { pixelRatio: 2 });
      kart.addImage('ikon-ring-fav-' + k, lagIkon(AKSENT, glyf, 'ring', firkant), { pixelRatio: 2 });
    });
    kart.addImage('ikon-ring-ukjent', lagIkon(null, IKONER.prikk, 'ring'), { pixelRatio: 2 });
    kart.addImage('ikon-ring-fav-ukjent', lagIkon(AKSENT, IKONER.prikk, 'ring'), { pixelRatio: 2 });
    kart.addImage('ikon-ukjent', lagIkon(UKJENT_FARGE, IKONER.prikk), { pixelRatio: 2 });
    kart.addImage('ikon-fav-ukjent', lagIkon(UKJENT_FARGE, IKONER.prikk, true), { pixelRatio: 2 });
  }


  const tomSamling = () => ({ type: 'FeatureCollection', features: [] });

  function leggTilKartlag() {
    registrerIkoner();

    kart.addSource('omrader', { type: 'geojson', data: tomSamling() });
    kart.addSource('fokus', { type: 'geojson', data: tomSamling() });
    kart.addSource('ruter', { type: 'geojson', data: tomSamling() });
    kart.addSource('steder', {
      type: 'geojson',
      data: tomSamling(),
      cluster: true,
      clusterMaxZoom: 12,
      clusterRadius: 14      // klynger bare der ikonene ellers ville overlappe
    });
    kart.addSource('nabolag', { type: 'geojson', data: tomSamling() });

    const lag = Object.assign({}, OMRADELAG, FOKUSLAG, KARTLAG);
    Object.keys(lag).forEach(id => {
      kart.addLayer(Object.assign({ id: id }, lag[id]));
    });

    kart.addSource('onskeliste', { type: 'geojson', data: tomSamling() });
    Object.keys(ONSKELAG).forEach(id => {
      kart.addLayer(Object.assign({ id: id }, ONSKELAG[id]), 'klynger');
    });
    visOnskelag();

    /* Klikk på tomt kart lukker infoboksen og opphever valget. Popupens egen closeOnClick er av:
       den lytter på samme klikk som stedet, og lukket den nye infoboksen når man klikket
       fra ett sted rett til et annet. */
    kart.on('click', e => {
      if (kart.queryRenderedFeatures(e.point, { layers: KLIKKBARE.concat('klynger') }).length) return;
      popup.remove();
      nullstillValg();
    });

    KLIKKBARE.concat('klynger').forEach(id => {
      kart.on('mouseenter', id, () => { kart.getCanvas().style.cursor = 'pointer'; });
      kart.on('mouseleave', id, () => { kart.getCanvas().style.cursor = ''; });
    });

    KLIKKBARE.forEach(id => {
      kart.on('click', id, e => {
        // Punkter ligger over linjer: klikk på et punkt skal ikke også velge linjen under.
        // Ønskelisten ligger under de besøkte stedene på samme måte, og nabolagene øverst.
        const over = id === 'nabolag-punkter' ? [] : id === 'punkter' ? ['nabolag-punkter'] : ['nabolag-punkter', 'punkter', 'klynger'];
        if (over.length && kart.queryRenderedFeatures(e.point, { layers: over }).length) return;
        const o = oppslagFraId(e.features[0].properties._id);
        if (!o) return;
        tips.remove();
        velg(o.id, false, o.erLinje ? e.lngLat : null);   // gåturer: boksen der ruten ble klikket
      });
    });

    kart.on('click', 'klynger', async e => {
      const f = e.features[0];
      const zoom = await kart.getSource('steder').getClusterExpansionZoom(f.properties.cluster_id);
      kart.easeTo({ center: f.geometry.coordinates, zoom: zoom + 0.5, duration: 500 });
    });

    /* Navnelapp bare der det finnes ekte hover (mus/styreflate). På berøringsskjerm sender nettleseren
       en etterlignet mousemove ved trykk: lappen dukket opp, iOS svelget klikket, og popupen kom først
       ved andre trykk — oppå lappen. Der er popupen nok alene. */
    if (ekteHover.matches) {
      KLIKKBARE.filter(id => /punkter$/.test(id)).forEach(id => {
        kart.on('mousemove', id, e => {
          const f = e.features[0];
          // Navnet står allerede i infoboksen
          if (popup.isOpen() && f.properties._id === state.valgtId) { tips.remove(); return; }
          tips.setLngLat(f.geometry.coordinates).setText(visNavn(f.properties)).addTo(kart);
        });
        kart.on('mouseleave', id, () => tips.remove());
      });
    }
  }

  /* Filtrering bytter ut dataene, slik at klyngene regnes ut fra det som vises. */
  function filtrerKart(vis) {
    if (!kart.getSource('steder')) return;
    const medGeo = vis.filter(o => o.f.geometry);
    const punkter = medGeo.filter(o => !o.erLinje).map(o => o.f);
    const linjer = medGeo.filter(o => o.erLinje).map(o => o.f);
    const erNabolag = f => f.properties.kategori === 'nabolag';
    kart.getSource('steder').setData({ type: 'FeatureCollection', features: punkter.filter(f => !erNabolag(f)) });
    kart.getSource('nabolag').setData({ type: 'FeatureCollection', features: punkter.filter(erNabolag) });
    kart.getSource('ruter').setData({ type: 'FeatureCollection', features: linjer });
    const omrader = vis.flatMap(o => {
      const flater = o.fokus.filter(x => x.properties.rolle === 'omrade');
      const gater = o.fokus.filter(x => x.properties.rolle === 'gate');
      const navn = { navn: visNavn(o.p) };
      return gater.concat(!flater.length ? [] : flater.map(x => ({ type: 'Feature', geometry: x.geometry, properties: navn }))
        .concat(o.f.geometry ? [{ type: 'Feature', geometry: o.f.geometry, properties: navn }] : []));
    });
    kart.getSource('omrader').setData({ type: 'FeatureCollection', features: omrader });
    if (kart.getSource('onskeliste')) {
      const onske = synligeOnskeliste();
      const flater = onske.flatMap(o => o.fokus.filter(x => x.properties.rolle === 'omrade')
        .map(x => ({ type: 'Feature', geometry: x.geometry, properties: {} })));
      kart.getSource('onskeliste').setData({ type: 'FeatureCollection',
        features: flater.concat(onske.filter(o => o.f.geometry).map(o => o.f)) });
    }
  }

  function visOnskelag() {
    Object.keys(ONSKELAG).forEach(id => {
      if (kart.getLayer(id)) kart.setLayoutProperty(id, 'visibility', state.visOnskeliste ? 'visible' : 'none');
    });
  }

  function settOnskelag(paa) {
    if (state.visOnskeliste === paa) return;
    state.visOnskeliste = paa;
    visOnskelag();
  }

  function visFokus(o) {
    if (!kart.getSource('fokus')) return;
    kart.getSource('fokus').setData({ type: 'FeatureCollection', features: (o && o.fokus) || [] });
  }

  function aapnePopup(o, lngLat) {
    popup.setLngLat(lngLat).setHTML(popupHtml(o.p, o.punkt, o.id)).addTo(kart);
    nullstillFlytt();
    // Venter til en eventuell flyTo er ferdig, ellers avbryter forskyvningen den.
    if (kart.isMoving()) kart.once('moveend', faaPopupInn);
    else requestAnimationFrame(faaPopupInn);
  }

  /* Lang tekst kan få infoboksen til å stikke ut av kartet (særlig på mobil, der kartet er lavt).
     Flytt kartet akkurat så mye at hele boksen synes; er den høyere enn kartet, vises toppen.
     Knappene øverst til venstre (zoom, hele byen, posisjon) skal heller ikke dekke boksen:
     da flyttes den til høyre for dem, eller ned under dem hvis den ikke får plass i bredden. */
  function faaPopupInn() {
    if (!popup.isOpen()) return;
    const boks = popup.getElement().getBoundingClientRect();
    const ramme = kart.getContainer().getBoundingClientRect();
    const marg = 10;
    const forskyv = (lav, hoy, min, maks) =>
      hoy > maks - marg ? Math.min(hoy - (maks - marg), lav - (min + marg))
      : lav < min + marg ? lav - (min + marg)
      : 0;
    let dx = forskyv(boks.left, boks.right, ramme.left, ramme.right);
    let dy = forskyv(boks.top, boks.bottom, ramme.top, ramme.bottom);
    const knapper = kart.getContainer().querySelector('.maplibregl-ctrl-top-left');
    const k = knapper && knapper.getBoundingClientRect();
    if (k && k.width && k.height) {
      const venstre = boks.left - dx, topp = boks.top - dy;
      const hoyre = venstre + boks.width, bunn = topp + boks.height;
      if (venstre < k.right && topp < k.bottom && hoyre > k.left && bunn > k.top) {
        if (boks.width <= ramme.right - k.right - 2 * marg) dx += venstre - (k.right + marg);
        else dy += topp - k.bottom;
      }
    }
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) kart.panBy([dx, dy], { duration: 400 });
  }

  /* Infoboksen kan dras bort når den dekker gatene. Forskyvningen legges som transform på
     innholdet, så boksen følger fortsatt stedet når kartet flyttes; spissen skjules.
     Ny popup = nytt innhold = tilbake på plass. Lenker og knapper drar ikke; på touch heller
     ikke notatet, som må kunne rulles. Litt slark før dra starter, så vanlige klikk virker.
     Popupen ligger utenfor kartets lerret, så kartet panoreres ikke samtidig. */
  /* MapLibre gjenbruker innholdselementet når popupen får nytt innhold, så en tidligere
     forskyvning må fjernes — ellers åpner neste sted boksen langt unna (eller utenfor skjermen). */
  function nullstillFlytt() {
    const pop = popup.getElement();
    if (!pop) return;
    pop.classList.remove('er-flyttet', 'drar');
    const innhold = pop.querySelector('.maplibregl-popup-content');
    if (innhold) { innhold.style.transform = ''; delete innhold.dataset.flytt; }
  }

  (function flyttbarPopup() {
    const ramme = kart.getContainer();
    let dra = null;

    ramme.addEventListener('pointerdown', e => {
      const innhold = e.target.closest('.pop .maplibregl-popup-content');
      if (!innhold || !e.isPrimary || e.button !== 0) return;
      if (e.target.closest('a, button')) return;
      if (e.pointerType !== 'mouse' && e.target.closest('.pop-notat')) return;
      const [x, y] = (innhold.dataset.flytt || '0,0').split(',').map(Number);
      dra = { innhold, id: e.pointerId, x0: e.clientX, y0: e.clientY, x, y, iGang: false,
              boks: innhold.getBoundingClientRect(), kant: ramme.getBoundingClientRect() };
    });

    ramme.addEventListener('pointermove', e => {
      if (!dra || e.pointerId !== dra.id) return;
      const dx = e.clientX - dra.x0, dy = e.clientY - dra.y0;
      if (!dra.iGang) {
        if (Math.hypot(dx, dy) < 5) return;
        dra.iGang = true;
        dra.innhold.setPointerCapture(e.pointerId);
        popup.getElement().classList.add('er-flyttet', 'drar');
      }
      // Hold boksen innenfor kartet
      const { boks, kant } = dra;
      const fx = Math.min(Math.max(dx, kant.left - boks.left), kant.right - boks.right);
      const fy = Math.min(Math.max(dy, kant.top - boks.top), kant.bottom - boks.bottom);
      const x = dra.x + fx, y = dra.y + fy;
      dra.innhold.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      dra.innhold.dataset.flytt = x + ',' + y;
      e.preventDefault();
    });

    function slipp(e) {
      if (!dra || e.pointerId !== dra.id) return;
      if (dra.iGang) dra.innhold.closest('.maplibregl-popup').classList.remove('drar');
      dra = null;
    }
    ramme.addEventListener('pointerup', slipp);
    ramme.addEventListener('pointercancel', slipp);
  })();

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

  /* ---------- lenke til ett sted ----------

     …/london/?sted=conduit-coffee-house åpner kartet med infoboksen for stedet (også nabolag og gåturer).
     «Del» i infoboksen åpner delingsarket på mobil (Meldinger, WhatsApp …), ellers kopieres lenken.
     Den delte lenken er …/london/conduit-coffee-house/: en delingsside med stedets navn i delingskortet,
     laget ved publisering av .github/stedsider.py. Den er en stubb som bysidene, med data-sted="<slug>",
     og viser kartet selv. Den sender ikke videre: Meldinger på iPhone kjører JavaScript når den lager
     forhåndsvisningen, og fulgte da omdirigeringen til byens delingskort. Navn uten latinske
     bokstaver (tom slug) deles som ?sted=. */

  const stedSlug = navn => normaliser(navn).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || String(navn || '');

  function stedLenke(p) {
    const slug = stedSlug(p.navn);
    const mappe = new URL(BY + '/', BASE);   // bysiden, også når vi står på en delingsside
    const u = /^[a-z0-9-]+$/.test(slug) ? new URL(slug + '/', mappe) : new URL(mappe);
    if (u.href === mappe.href) u.searchParams.set('sted', slug);
    if (SPRAK === 'en') u.searchParams.set('lang', 'en');
    return u.href;
  }

  document.addEventListener('click', e => {
    const knapp = e.target.closest && e.target.closest('.pop-del');
    if (!knapp) return;
    const o = oppslagFraId(knapp.dataset.id);
    if (!o) return;
    const url = stedLenke(o.p);
    if (navigator.share && ekteHover.matches === false) {
      navigator.share({ title: visNavn(o.p), url: url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        knapp.textContent = t('lenkeKopiert');
        setTimeout(() => { if (knapp.isConnected) knapp.textContent = t('del'); }, 2000);
      }).catch(() => {});
    }
  });

  /* Åpner stedet fra ?sted= når dataene er lastet. Gir true når et sted ble åpnet. */
  function aapneStedFraAdresse() {
    const q = new URLSearchParams(location.search).get('sted') || SKRIPT.dataset.sted;
    if (!q) return false;
    const o = state.oppslag.concat(state.onskeliste).find(x => stedSlug(x.p.navn) === stedSlug(q));
    if (!o) return false;
    state.valgtId = o.id;   // så åpning der du er ikke tar over
    // Zoomer helt inn (som «Zoom inn»), og infoboksen åpnes når kartet er framme
    kartKlar.then(() => { zoomInn(o); velg(o.id, false); });
    return true;
  }

  /* ---------- hjelpere ---------- */

  const katInfo = k => KATEGORIER[k]
    ? { navn: (SPRAK === 'en' && KATEGORIER[k].en) || KATEGORIER[k].navn, farge: KATEGORIER[k].farge }
    : { navn: state.ukjenteKategorier[k] || k || t('ukjent'), farge: UKJENT_FARGE };

  /* Engelsk navn og notat når det finnes og språket er engelsk, ellers norsk. */
  const visNavn = p => (SPRAK === 'en' && p.navn_en) || p.navn || '';
  const visNotat = p => (SPRAK === 'en' && p.notat_en) || p.notat || '';
  const erLinjekategori = k => k === 'gaatur';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* Notat som HTML: [tekst](https://…) blir en lenke, resten escapes. */
  const LENKE_I_NOTAT = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  function notatHtml(tekst) {
    return esc(tekst).replace(LENKE_I_NOTAT, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
  const utenLenker = tekst => String(tekst || '').replace(LENKE_I_NOTAT, '$1');

  function metaLinje(p) {
    return [p.sone, katInfo(p.kategori).navn].filter(Boolean).join(' · ');
  }

  function ruteMeta(p) {
    return [maal(p.lengde), maal(p.varighet), p.sone].filter(Boolean).join(' · ');
  }

  /* Første avsnitt av notatet, forkortet — brukes i lista. Hele notatet vises i popupen. */
  function kortNotat(tekst) {
    const a = utenLenker(tekst).split(/\n\s*\n/)[0].replace(/\s*\n\s*/g, ' ');
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

  /* Veibeskrivelse i Google Maps, rett til stedet (Place ID når vi har det). Til fots i byen;
     for steder utenfor byen («utenfor: ja») kollektivt. Gåturer: til startpunktet av ruten. */
  function veiLenke(p, latlng, utenPlaceId) {
    if (!latlng) return null;
    return 'https://www.google.com/maps/dir/?api=1&destination=' +
      (p.place_id && !utenPlaceId ? encodeURIComponent(p.navn) + '&destination_place_id=' + encodeURIComponent(p.place_id)
        : latlng.lat + ',' + latlng.lng) +
      '&travelmode=' + (p.utenfor ? 'transit' : 'walking');
  }

  function popupHtml(p, latlng, id) {
    const lenke = mapsLenke(p, latlng);
    const o = id && oppslagFraId(id);
    const start = o && o.erLinje && o.f.geometry ? o.f.geometry.coordinates[0] : null;
    const vei = start ? veiLenke(p, { lng: start[0], lat: start[1] }, true) : veiLenke(p, latlng);
    // To linjer som hver får plass i boksen: lenkene ut av guiden, så lenkene i kartet.
    const ut = [
      vei ? '<a class="pop-lenke" href="' + vei + '" target="_blank" rel="noopener">' + t('veibeskrivelse') + '</a>' : '',
      lenke ? '<a class="pop-lenke" href="' + lenke + '" target="_blank" rel="noopener">' + t('aapneMaps') + '</a>' : '',
      p.nettside ? '<a class="pop-lenke" href="' + esc(p.nettside) + '" target="_blank" rel="noopener">' + t('nettside') + '</a>' : ''
    ].filter(Boolean);
    const inne = id ? [
      '<button type="button" class="pop-lenke pop-zoom" data-id="' + esc(id) + '">' + t('zoomInn') + '</button>',
      '<button type="button" class="pop-lenke pop-del" data-id="' + esc(id) + '">' + t('del') + '</button>'
    ] : [];
    const linje = l => l.length ? '<p class="pop-lenker">' + l.join('<span class="pop-skille">·</span>') + '</p>' : '';
    // «Artikkel fra Financial Times: Tittel» — tittelen er lenken
    const les = (p.les || []).map(l =>
      '<p class="pop-les">' + esc(l.kilde ? t('artikkelFra') + ' ' + l.kilde : t('artikkel')) + ': ' +
      '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.tittel) + '</a></p>'
    ).join('');
    const notat = visNotat(p);
    const meta = o && o.erLinje
      ? [t('gatur'), ruteMeta(p), o.f.geometry ? '' : t('ruteIkkeTegnet')].filter(Boolean).join(' · ')
      : metaLinje(p) || ruteMeta(p);
    return (erOnskeliste(p) ? '<p class="merke-ikke-besokt">' + t('ikkeBesokt') +
        (p.favoritt ? ' · ' + t('forstevalg') : '') + '</p>' : '') +
      '<h3 class="pop-navn">' + esc(visNavn(p)) + '</h3>' +
      '<p class="pop-meta">' + esc(meta) + '</p>' +
      (p.gater && p.gater.length ? '<p class="pop-gater">' + esc(p.gater.join(' · ')) + '</p>' : '') +
      (notat ? '<p class="pop-notat">' + notatHtml(notat) + '</p>' : '') +
      les +
      linje(ut) + linje(inne);
  }

  /* ---------- oppslag fra data ---------- */

  /* Offline: ber sw.js lagre alt byen trenger — det siden har lastet (biblioteker, fonter) pluss byens
     side, data og kart. Flisene og resten av kartet regner sw.js ut selv (lagreByer); det som alt er
     lagret, hoppes over. */
  function forhandslastOffline() {
    if (!('serviceWorker' in navigator) || !navigator.onLine) return;
    const adresser = performance.getEntriesByType('resource').map(e => e.name).filter(u => /^https?:/.test(u));
    if (!offlineDato()) visOffline('lagrer');
    navigator.serviceWorker.ready.then(reg => {
      if (reg.active) reg.active.postMessage({ type: 'lagre', stil: KARTSTIL, adresser: adresser,
        byer: [{ id: BY, side: location.href.split(/[?#]/)[0], data: DATA_URL, geometri: GEO_URL }] });
    }).catch(() => {});
  }

  /* Status ved telleren: «Lagrer …» første gang, «Tilgjengelig offline · 13. okt» når sw.js har hentet alt
     (datoen huskes per by i nettleseren, samme nøkkel som forsiden), «Bare delvis …» hvis noe feilet. */
  const OFFLINE_NOKKEL = 'byguider-offline:' + BASE.pathname + BY;
  let offlineTilstand = null;
  function offlineDato() {
    try { return localStorage.getItem(OFFLINE_NOKKEL); } catch (e) { return null; }
  }
  function visOffline(tilstand) {
    offlineTilstand = tilstand || offlineTilstand;
    const dato = offlineDato();
    if (!offlineTilstand && dato) offlineTilstand = 'lagret';
    if (!offlineTilstand) { el.offline.hidden = true; return; }
    const d = dato ? new Date(dato) : null;
    const datoTekst = !d || isNaN(d) ? '' : SPRAK === 'en'
      ? d.getDate() + ' ' + 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')[d.getMonth()]
      : d.getDate() + '. ' + 'jan feb mar apr mai jun jul aug sep okt nov des'.split(' ')[d.getMonth()];
    el.offline.textContent = offlineTilstand === 'lagrer' ? t('offlineLagrer')
      : offlineTilstand === 'delvis' ? t('offlineDelvis') : t('offlineLagret', datoTekst);
    el.offline.hidden = false;
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', e => {
      const m = e.data || {};
      if (m.by !== BY) return;
      if (m.type === 'fremdrift') {
        if (offlineTilstand === 'lagrer') el.offline.textContent = t('offlineLagrerPst', Math.floor(100 * m.ferdig / Math.max(1, m.totalt)));
        return;
      }
      if (m.type !== 'lagret') return;
      if (m.feilet) { visOffline('delvis'); return; }
      try { localStorage.setItem(OFFLINE_NOKKEL, new Date().toISOString()); } catch (err) { /* ingen lagring */ }
      visOffline('lagret');
    });
    navigator.serviceWorker.startMessages();   // Safari leverer ellers ikke meldingene til addEventListener
    visOffline();
  }
  sprakLyttere.push(() => { if (!el.offline.hidden) visOffline(); });

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
    return state.oppslag.find(x => x.id === id) || state.onskeliste.find(x => x.id === id);
  }

  /* ---------- filtrering ---------- */

  function synlige() {
    return filtrer(state.oppslag);
  }

  /* Ønskelisten følger samme sone-, kategori- og søkefilter som resten av lista. */
  function synligeOnskeliste() {
    return filtrer(state.onskeliste);
  }

  function filtrer(liste) {
    const q = state.sok.trim().toLowerCase();
    return liste.filter(o => {
      const p = o.p;
      if (state.soner.size && !state.soner.has(p.sone)) return false;
      if (state.kategorier.size && !state.kategorier.has(p.kategori)) return false;
      if (state.kunFavoritter && !p.favoritt) return false;
      if (q) {
        const kat = KATEGORIER[p.kategori] || {};
        const hay = [p.navn, p.navn_en, utenLenker(p.notat), utenLenker(p.notat_en), p.sone, katInfo(p.kategori).navn, kat.navn, kat.en]
          .concat(p.gater || []).join(' ').toLowerCase();
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
    const deler = [t('steder', antSteder)];
    if (antLinjer) deler.push(t('ruter', antLinjer));
    el.teller.textContent = deler.join(' · ');

    tegnListe(vis);

    if (state.valgtId && !vis.concat(synligeOnskeliste()).some(o => o.id === state.valgtId)) {
      state.valgtId = null;
      popup.remove();
      visFokus(null);
    }
  }

  function tegnListe(vis) {
    el.liste.innerHTML = '';

    if (!vis.length) {
      const tomt = document.createElement('p');
      tomt.className = 'tomt';
      tomt.textContent = state.oppslag.length || state.onskeliste.length
        ? t('ingenTreff')
        : t('ingenSteder');
      el.liste.appendChild(tomt);
      tegnOnskeliste();
      return;
    }

    const rekkefolge = state.soneRekkefolge;
    const naer = state.naerMeg && state.minPosisjon;
    const medSoner = state.brukteSoner.size > 0 && !naer;
    vis.slice()
      .sort((a, b) => {
        if (naer) return avstandTil(a) - avstandTil(b);
        const sa = rekkefolge.indexOf(a.p.sone), sb = rekkefolge.indexOf(b.p.sone);
        if (sa !== sb) return (sa < 0 ? 99 : sa) - (sb < 0 ? 99 : sb);
        if (!!b.p.favoritt !== !!a.p.favoritt) return b.p.favoritt ? 1 : -1;
        return visNavn(a.p).localeCompare(visNavn(b.p), SPRAK === 'en' ? 'en' : 'nb');
      })
      .forEach((o, i, arr) => {
        if (medSoner && (i === 0 || arr[i - 1].p.sone !== o.p.sone)) {
          const h = document.createElement('p');
          h.className = 'sone-hode';
          h.textContent = o.p.sone || t('utenSone');
          el.liste.appendChild(h);
        }
        el.liste.appendChild(oppslagEl(o));
      });

    tegnOnskeliste();
  }

  /* Egen seksjon nederst: «Ikke besøkt ennå (n)», sammenslått til den åpnes.
     Å åpne den slår på kartlaget, å lukke den slår det av. */
  function tegnOnskeliste() {
    const vis = synligeOnskeliste();
    if (!vis.length) return;

    const hode = document.createElement('button');
    hode.type = 'button';
    hode.className = 'onskeliste-hode';
    hode.setAttribute('aria-expanded', state.onskelisteApen ? 'true' : 'false');
    hode.textContent = t('ikkeBesoktAntall', vis.length);
    hode.addEventListener('click', () => {
      state.onskelisteApen = !state.onskelisteApen;
      settOnskelag(state.onskelisteApen);   // laget følger seksjonen: åpne = på, lukke = av
      tegnListe(synlige());
    });
    el.liste.appendChild(hode);
    if (!state.onskelisteApen) return;

    // Førstevalg (★) øverst, så alfabetisk. Med «Nær meg»: nærmest først.
    vis.slice()
      .sort((a, b) => (state.naerMeg && state.minPosisjon ? avstandTil(a) - avstandTil(b) : 0) ||
        (!!b.p.favoritt - !!a.p.favoritt) ||
        visNavn(a.p).localeCompare(visNavn(b.p), SPRAK === 'en' ? 'en' : 'nb'))
      .forEach(o => el.liste.appendChild(oppslagEl(o)));
  }

  function oppslagEl(o) {
    const p = o.p;
    const info = katInfo(p.kategori);

    const onske = erOnskeliste(p);
    // Ønskelisten: bare første linje av notatet
    const notat = onske ? visNotat(p).split('\n')[0].trim() : visNotat(p);

    const div = document.createElement('div');
    div.className = 'oppslag' + (onske ? ' oppslag--onskeliste' : '') + (state.valgtId === o.id ? ' er-valgt' : '');
    div.setAttribute('role', 'listitem');
    div.tabIndex = 0;

    div.innerHTML =
      '<div class="oppslag-topp">' +
        '<h2 class="oppslag-navn">' + esc(visNavn(p)) + '</h2>' +
        (p.favoritt ? '<span class="favoritt-merke">' + t(onske ? 'forstevalg' : 'favoritt') + '</span>' : '') +
      '</div>' +
      '<p class="oppslag-meta">' +
        '<span class="prikk" style="background:' + info.farge + '"></span>' +
        esc([metaLinje(p) || ruteMeta(p), avstandTekst(o)].filter(Boolean).join(' · ')) +
      '</p>' +
      (notat ? '<p class="oppslag-notat">' + esc(kortNotat(notat)) + '</p>' : '');

    div.addEventListener('click', () => velg(o.id, true));
    div.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); velg(o.id, true); }
    });

    return div;
  }

  /* ---------- valg ---------- */

  /* Gåturer har ikke ett punkt: infoboksen festes der ruten ble klikket, ellers på ruten nær midten
     av den (punktet nærmest midten av ruteboksen). Uten tegnet rute: midt i kartet. */
  function ruteAnker(o) {
    const g = o.f.geometry;
    if (!g || !o.bbox) return kart.getCenter();
    const mx = (o.bbox[0] + o.bbox[2]) / 2, my = (o.bbox[1] + o.bbox[3]) / 2;
    let best = g.coordinates[0], avstand = Infinity;
    g.coordinates.forEach(c => {
      const d = (c[0] - mx) ** 2 + (c[1] - my) ** 2;
      if (d < avstand) { avstand = d; best = c; }
    });
    return { lng: best[0], lat: best[1] };
  }

  function velg(id, flyTil, klikkPunkt) {
    const o = oppslagFraId(id);
    if (!o) return;
    state.valgtId = id;
    visFokus(o);
    if (erOnskeliste(o.p)) settOnskelag(true);

    if (o.erLinje) {
      if (flyTil && o.bbox) kart.fitBounds(o.bbox, { padding: 70, maxZoom: 15, duration: 600 });
      aapnePopup(o, klikkPunkt || ruteAnker(o));
    } else {
      if (flyTil && o.fokusBbox) {
        kart.fitBounds(o.fokusBbox, { padding: 90, maxZoom: 16, duration: 600 });
      } else if (flyTil && o.punkt) {
        kart.flyTo({ center: o.punkt, zoom: Math.max(kart.getZoom(), 13), duration: 600 });
      }
      if (o.punkt) aapnePopup(o, o.punkt);
    }

    // Lista markerer valget, men blar ikke — man blir værende i kartet.
    tegnListe(synlige());

    // Mobil: kartet ligger over lista. Valg fra lista hopper opp til kartet, med infoboksen
    // åpen — som i Reiseplanlegging. Ikke liggende, der kartet allerede står ved siden av.
    if (flyTil && smalSkjerm.matches && !liggendeMobil.matches) {
      document.querySelector('.kartflate').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function nullstillValg() {
    if (!state.valgtId) return;
    state.valgtId = null;
    visFokus(null);
    tegnListe(synlige());
  }

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
    const blokk = beholder.closest('.filterblokk') || beholder;
    blokk.hidden = verdier.length < 2;
    if (blokk.hidden) return;
    beholder.appendChild(lagChip(t('alle'), null, set.size === 0, () => velgEn(set, null)));
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
    el.fStatus.appendChild(lagChip(t('kunFavoritter'), null, state.kunFavoritter, () => {
      state.kunFavoritter = !state.kunFavoritter;
      byggFiltre();
      tegn();
    }));
    if ('geolocation' in navigator) {
      el.fStatus.appendChild(lagChip(t('naerMeg'), null, state.naerMeg, () => settNaerMeg(!state.naerMeg)));
    }
  }

  /* ---------- nær meg ----------

     «Nær meg» følger posisjonen og sorterer lista etter avstand, nærmest først, med avstand og
     gangtid på hvert sted. Sonene slås sammen så lenge den er på. Egen prikk i kartet. */

  let posisjonVakt = null, posisjonPrikk = null;

  function settNaerMeg(paa) {
    state.naerMeg = paa;
    if (paa && posisjonVakt === null) {
      posisjonVakt = navigator.geolocation.watchPosition(pos => {
        huskPosisjon();
        const ny = { lng: pos.coords.longitude, lat: pos.coords.latitude };
        if (!posisjonPrikk) {
          const prikk = document.createElement('div');
          prikk.className = 'maplibregl-user-location-dot';
          posisjonPrikk = new maplibregl.Marker({ element: prikk });
        }
        posisjonPrikk.setLngLat(ny).addTo(kart);
        // Lista tegnes på nytt bare når man har flyttet seg et stykke
        if (state.minPosisjon && meter(state.minPosisjon, ny) < 25) return;
        state.minPosisjon = ny;
        if (state.naerMeg) tegnListe(synlige());
      }, () => settNaerMeg(false), { enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 });
    } else if (!paa) {
      if (posisjonVakt !== null) navigator.geolocation.clearWatch(posisjonVakt);
      posisjonVakt = null;
      state.minPosisjon = null;
      if (posisjonPrikk) posisjonPrikk.remove();
    }
    byggFiltre();
    tegnListe(synlige());
  }

  /* Er du i byen, åpner kartet der du er, med prikken som følger deg (som knappen for egen posisjon).
     Bare når siden har lov til å bruke posisjonen, eller posisjonen har virket her før — ellers ingen
     spørsmål ved oppstart. «I byen» er
     innenfor utsnittet med alle stedene (også «utenfor: ja»), med litt slingringsmonn. */
  /* Safari på iPhone avviser ofte spørringen etter tillatelse, eller svarer «prompt» selv om man har sagt ja
     (Safari spør på nytt per økt). Derfor huskes det i nettleseren at posisjonen har virket her før. */
  const POSISJON_NOKKEL = 'byguider-posisjon';
  function huskPosisjon() { try { localStorage.setItem(POSISJON_NOKKEL, '1'); } catch (e) {} }
  function glemPosisjon() { try { localStorage.removeItem(POSISJON_NOKKEL); } catch (e) {} }
  function posisjonVirketFor() { try { return localStorage.getItem(POSISJON_NOKKEL) === '1'; } catch (e) { return false; } }

  function aapneHer(oppslag) {
    if (!posisjonKtrl || !oppslag.length) return;
    const [x0, y0, x1, y1] = bbox(oppslag.flatMap(o => [o.bbox.slice(0, 2), o.bbox.slice(2)]));
    const slark = 0.02;
    const hent = () => navigator.geolocation.getCurrentPosition(pos => {
      huskPosisjon();
      const { longitude: lng, latitude: lat } = pos.coords;
      if (lng < x0 - slark || lng > x1 + slark || lat < y0 - slark || lat > y1 + slark) return;
      // Knappen er klar først når MapLibre har sjekket støtten for posisjon; prøv igjen til den er det.
      let forsok = 0;
      const trykk = () => {
        if (state.valgtId) return;
        if (posisjonKtrl.trigger() === false && ++forsok < 20) setTimeout(trykk, 250);
      };
      kartKlar.then(trykk);
    }, e => { if (e.code === 1) glemPosisjon(); }, { maximumAge: 300000, timeout: 15000 });
    const sporring = navigator.permissions ? navigator.permissions.query({ name: 'geolocation' }) : Promise.reject();
    sporring.then(tillatelse => {
      if (tillatelse.state === 'granted' || (tillatelse.state === 'prompt' && posisjonVirketFor())) hent();
    }, () => { if (posisjonVirketFor()) hent(); });
  }

  /* Avstand i meter mellom to { lng, lat } (haversine). */
  function meter(a, b) {
    const r = Math.PI / 180;
    const x = Math.sin((b.lat - a.lat) * r / 2) ** 2 +
      Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin((b.lng - a.lng) * r / 2) ** 2;
    return 12742000 * Math.asin(Math.sqrt(x));
  }

  /* Fra egen posisjon til stedet; gåturer og andre linjer: til nærmeste punkt på ruten. */
  function avstandTil(o) {
    const pos = state.minPosisjon;
    if (!pos) return Infinity;
    if (o.punkt) return meter(pos, o.punkt);
    const g = o.f.geometry;
    if (!g || g.type !== 'LineString') return Infinity;
    return Math.min.apply(null, g.coordinates.map(c => meter(pos, { lng: c[0], lat: c[1] })));
  }

  /* «350 m · 5 min å gå», «2,4 km · 35 min å gå», over 5 km bare «12 km». Gangtiden regner med
     at gatene er en fjerdedel lengre enn luftlinja, og 80 m i minuttet. */
  function avstandTekst(o) {
    if (!state.naerMeg || !state.minPosisjon) return '';
    const m = avstandTil(o);
    if (!isFinite(m)) return '';
    const km = (x, des) => x.toFixed(des).replace('.', SPRAK === 'en' ? '.' : ',') + ' km';
    if (m >= 5000) return km(m / 1000, 0);
    const tekst = m < 1000 ? Math.round(m / 10) * 10 + ' m' : km(m / 1000, 1);
    return tekst + ' · ' + t('gange', Math.max(1, Math.round(m * 1.25 / 80)));
  }

  el.sok.addEventListener('input', e => {
    state.sok = e.target.value;
    el.sokTom.hidden = !state.sok;
    tegn();
  });

  // Krysset tømmer søket og lar fokus bli i feltet, så man kan skrive på nytt med en gang.
  el.sokTom.addEventListener('click', () => {
    el.sok.value = '';
    state.sok = '';
    el.sokTom.hidden = true;
    el.sok.focus();
    tegn();
  });

  // Mobil, stående: kartet tar alle fingerbevegelser, så knappen nederst i kartet er veien ned til menyen.
  // Når kartet er rullet ut av syne, blir den «Kart ↑» og står fast i hjørnet, så man kommer raskt tilbake.
  const tilListaKnapp = document.getElementById('til-lista');
  const kartflate = document.querySelector('.kartflate');
  let kartModus = false;
  tilListaKnapp.addEventListener('click', () => {
    const maal = kartModus ? kartflate : document.querySelector('.sidebar');
    maal.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  function oppdaterTilListaKnapp() {
    // Bytter når knappens plass nederst i kartet har rullet ut av skjermen.
    const nyModus = kartflate.getBoundingClientRect().bottom < 54;
    if (nyModus === kartModus) return;
    kartModus = nyModus;
    tilListaKnapp.classList.toggle('til-lista--kart', kartModus);
    tilListaKnapp.dataset.t = kartModus ? 'tilKartet' : 'tilLista';
    tilListaKnapp.textContent = t(tilListaKnapp.dataset.t);
  }
  let tilListaRamme = 0;
  window.addEventListener('scroll', () => {
    if (tilListaRamme) return;
    tilListaRamme = requestAnimationFrame(() => { tilListaRamme = 0; oppdaterTilListaKnapp(); });
  }, { passive: true });
  window.addEventListener('resize', oppdaterTilListaKnapp);

  /* ---------- side fra metadata ---------- */

  let sideMeta = null;

  function settTekster(meta) {
    const en = SPRAK === 'en';
    const tittel = (en && meta.tittelEn) || meta.tittel || '';
    const kicker = (en && meta.kickerEn) || meta.kicker || '';
    const undertittel = (en && meta.undertittelEn) || meta.undertittel || '';
    // Delingssiden beholder stedets tittel, så forhåndsvisningen i Meldinger viser stedet
    if (tittel && !SKRIPT.dataset.sted) document.title = tittel;
    el.tittel.textContent  = tittel;
    el.kicker.textContent  = kicker;
    el.kicker.hidden = !kicker;
    el.ingress.textContent = undertittel;
    el.ingress.hidden = !undertittel;
  }

  function settOppSide(meta) {
    sideMeta = meta;
    settTekster(meta);

    // senter er [lengdegrad, breddegrad], som i resten av GeoJSON
    const senter = Array.isArray(meta.senter) && meta.senter.length === 2 ? meta.senter : [0, 20];
    startvisning = { center: senter, zoom: typeof meta.zoom === 'number' ? meta.zoom : 11 };
    kart.jumpTo(startvisning);
  }

  /* ---------- språkbytte ----------
     Faste tekster byttes av oversettDom(); her tegnes det som bygges fra dataene. */

  let fot = null, feil = null;

  sprakLyttere.push(() => {
    if (feil) { feil(); return; }
    if (sideMeta) settTekster(sideMeta);
    if (fot) el.fotTekst.innerHTML = fot();
    byggFiltre();
    tegn();
    const o = state.valgtId && oppslagFraId(state.valgtId);
    if (o && popup.isOpen()) aapnePopup(o, o.punkt || popup.getLngLat());
  });

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

      const alle = byggFeatures(md, geo).map(lagOppslag);
      state.oppslag = alle.filter(o => !erOnskeliste(o.p));
      state.onskeliste = alle.filter(o => erOnskeliste(o.p));
      Object.keys(md.kategoriNavn).forEach(k => {
        if (!KATEGORIER[k]) state.ukjenteKategorier[k] = md.kategoriNavn[k];
      });

      state.brukteSoner = new Set(alle.map(o => o.p.sone).filter(Boolean));
      state.soneRekkefolge = (meta.soner || []).slice();
      state.brukteSoner.forEach(s => {
        if (!state.soneRekkefolge.includes(s)) state.soneRekkefolge.push(s);
      });
      const rekkefolge = Object.keys(KATEGORIER);
      state.brukteKategorier = rekkefolge.filter(k => alle.some(o => o.p.kategori === k));
      alle.forEach(o => {
        if (o.p.kategori && !state.brukteKategorier.includes(o.p.kategori)) {
          state.brukteKategorier.push(o.p.kategori);
        }
      });

      byggFiltre();
      tegn();

      /* Startutsnittet omfatter alle steder unntatt dem merket «utenfor: ja»
         (strender, turer o.l. et stykke utenfor byen). */
      const alleMedBbox = state.oppslag.filter(o => o.bbox);
      const innenfor = alleMedBbox.filter(o => !o.p.utenfor);
      const medBbox = innenfor.length ? innenfor : alleMedBbox;
      if (medBbox.length) {
        startutsnitt = bbox(medBbox.flatMap(o => [o.bbox.slice(0, 2), o.bbox.slice(2)]));
        /* På mobil er kartet smalt, og utsnittet med alle stedene blir for vidt. Har byen
           senter-mobil og zoom-mobil, åpner kartet der (og «Vis hele byen» går dit). */
        const mobil = mobilvisning();
        if (mobil) {
          kart.jumpTo(mobil);
        } else {
          kart.fitBounds(startutsnitt, { padding: 50, duration: 0 });
        }
      }

      // Lista virker uavhengig av kartet; lagene legges på når stilen er lastet.
      kartKlar.then(() => {
        leggTilKartlag();
        filtrerKart(synlige());
        // Tones inn når kartbitene for utsnittet er lastet, så stedene ikke kommer før gatene.
        // Venter høyst 0,8 s (å vente på «idle» tar for lang tid mens offline-lagringen går).
        const naarLastet = () => { if (kart.areTilesLoaded()) { kart.off('render', naarLastet); visKart(); } };
        kart.on('render', naarLastet);
        naarLastet();
        setTimeout(() => { kart.off('render', naarLastet); visKart(); }, 800);
        kart.once('idle', forhandslastOffline);
      });

      if (!aapneStedFraAdresse()) aapneHer(alleMedBbox);

      fot = () => t('fot', '<code>' + esc(DATA_NAVN) + '</code>', esc(meta.oppdatert || ''));
      el.fotTekst.innerHTML = fot();
    })
    .catch(err => {
      visKart();
      feil = () => {
        el.liste.innerHTML = '<p class="tomt">' + t('fantIkke', '<code>' + esc(DATA_NAVN) + '</code>', esc(err.message)) +
          '<br><br>' + t('lokalt') + '</p>';
        el.teller.textContent = t('ingenData');
      };
      feil();
    });

}
