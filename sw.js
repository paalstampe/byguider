/* Offline for byguidene (service worker, virker for alt under mappen sw.js ligger i).

   Med nett er alt som før: egne filer (sider, app.js, style.css, data/*.md) hentes alltid
   fra nettet først, så endringer vises straks. Svarer ikke nettet innen NETT_FRIST, eller
   er man uten nett, brukes siste lagrede kopi.

   Kartet og bibliotekene (CARTO-fliser, stil, fonter, MapLibre, Google Fonts) tas fra
   lageret når de finnes der, og fliser eldre enn FLIS_MAKSALDER hentes på nytt når det
   er nett. Når en by åpnes med nett (forhandslastOffline i app.js), eller man trykker
   «Lagre alle byene» på forsiden, hentes alt byen trenger i bakgrunnen — også fliser for
   hele byens område, zoom 0–14 (se lagreByer nederst). Etter det virker byen uten nett.

   Ved endring i strategi eller lagerformat: øk VERSJON, så ryddes gamle lagre bort. */
const VERSJON = 'v1';
const EGNE = 'byguider-egne-' + VERSJON;
const KART = 'byguider-kart-' + VERSJON;
const NETT_FRIST = 4000;                       // ms før lagret kopi brukes på tregt nett
const FLIS_MAKSALDER = 30 * 24 * 3600 * 1000;  // 30 døgn
const SAMTIDIG = 4;                            // parallelle nedlastinger ved forhåndslasting
const OMFANG = new URL('./', self.location).href;

const FREMMEDE = /^https:\/\/([a-z0-9-]+\.)?(basemaps\.cartocdn\.com|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;

/* Flisene kommer fra tiles-a … tiles-d; samme flis lagres én gang. */
const nokkel = url => url
  .replace(/^https:\/\/tiles-[a-d]\.basemaps\.cartocdn\.com\//, 'https://tiles.basemaps.cartocdn.com/')
  .replace(/(\/style\.json)\?.*$/, '$1');   // kartstilen lagres uten ?key=, så forsiden og byene deler kopien
const erFlis = url => /\/vectortiles\/.+\.mvt(\?|$)/.test(url);
const SOK = { ignoreVary: true };

self.addEventListener('install', e => {
  // Alle byenes sider og data, så lista virker for hver by; kartet lagres når byen åpnes.
  e.waitUntil((async () => {
    const lager = await caches.open(EGNE);
    const filer = ['./', 'app.js', 'style.css', 'byer.json', 'apple-touch-icon.png'];
    try {
      const r = await fetch('byer.json', { cache: 'no-store' });
      const byer = (await r.json()).byer || [];
      byer.forEach(b => {
        filer.push(b.id + '/', b.data || ('data/' + b.id + '.md'), b.bilde || ('bilder/' + b.id + '.webp'));
        if (!b.bilde) filer.push('bilder/' + b.id + '-mork.webp');
        if (b.geometri) filer.push(b.geometri);
      });
    } catch (err) { /* uten byer.json lagres bare skallet */ }
    await Promise.all(filer.map(f => lagre(lager, new URL(f, OMFANG).href).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const navn = await caches.keys();
    await Promise.all(navn.filter(n => n.startsWith('byguider-') && n !== EGNE && n !== KART).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = req.url;
  if (url.startsWith(OMFANG)) e.respondWith(nettForst(req));
  else if (FREMMEDE.test(url)) e.respondWith(lagerForst(req));
});

/* Egne filer: nettet først, lagret kopi hvis nettet svikter eller er tregt. */
async function nettForst(req) {
  const lager = await caches.open(EGNE);
  const nett = fetch(req).then(r => {
    if (r.ok) lager.put(req, r.clone());
    return r;
  });
  const frist = new Promise(res => setTimeout(res, NETT_FRIST));
  try {
    const r = await Promise.race([nett, frist.then(() => lager.match(req, SOK).then(k => k || nett))]);
    if (r) return r;
  } catch (err) { /* uten nett */ }
  // ?lang=en o.l.: samme side uten parametre er godt nok uten nett
  const kopi = await lager.match(req, SOK) || await lager.match(req, { ignoreVary: true, ignoreSearch: true });
  if (kopi) return kopi;
  return nett;   // gir den opprinnelige feilen
}

/* Kart og biblioteker: lageret først; gamle fliser og unpkg-adresser uten fast versjon fornyes. */
async function lagerForst(req) {
  const lager = await caches.open(KART);
  const n = nokkel(req.url);
  const kopi = await lager.match(n, SOK) || (n !== req.url && await lager.match(req.url, SOK));
  if (kopi && !foreldet(kopi, req.url)) return kopi;
  try {
    const r = await fetch(req);
    if (r.ok || r.type === 'opaque') lager.put(n, r.clone());
    return r;
  } catch (err) {
    if (kopi) return kopi;
    throw err;
  }
}

function foreldet(svar, url) {
  if (!erFlis(url)) return false;
  const dato = Date.parse(svar.headers.get('date') || '');
  return !isNaN(dato) && Date.now() - dato > FLIS_MAKSALDER;
}

async function lagre(lager, url) {
  let r;
  try { r = await fetch(url, url.startsWith(OMFANG) ? { cache: 'no-store' } : { mode: 'cors' }); }
  catch (err) { r = await fetch(url, { mode: 'no-cors' }); }
  if (r.ok || r.type === 'opaque') await lager.put(nokkel(url), r);
}

/* Lagring for bruk uten nett. Melding fra app.js (byen som er åpen) eller forsiden («Lagre alle byene»):
     { type: 'lagre', stil: <kartstil-URL>, adresser: [...], byer: [{ id, side, data, geometri }] }
   adresser er det siden selv har lastet (biblioteker, fonter). For hver by hentes siden, dataene og
   kartet: stil, sprite, glyfer for latinske tegn og CARTO-fliser zoom 0–14 over alle stedene i byen
   (koordinatene i md-fila og geometrifila, med 15 % marg; maks MAKS_FLISER). Det som alt er lagret,
   hoppes over. Fremdrift og resultat sendes til alle åpne sider (og svarkanalen, se meld):
     { type: 'fremdrift', by, ferdig, totalt }  og  { type: 'lagret', by, hentet, feilet }
   Alt regnes ut her, uten at kartet må tegnes — så forsiden kan lagre byer som ikke er åpnet. */
const MAKS_FLISER = 1500;

self.addEventListener('message', e => {
  const m = e.data || {};
  if (m.type !== 'lagre' || !Array.isArray(m.byer)) return;
  e.waitUntil(lagreByer(m, e.ports && e.ports[0]));
});

/* Til alle åpne sider, og til svarkanalen (MessageChannel) når avsenderen sendte med en — den kommer
   alltid fram, også i Safari når avsendersiden styres av en annen service worker (stam.pe). */
async function meld(d, kanal) {
  if (kanal) kanal.postMessage(d);
  const sider = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  sider.forEach(c => c.postMessage(d));
}

async function lagreByer(m, kanal) {
  let felles = [...(m.adresser || [])];
  try { felles = felles.concat(await kartRessurser(m.stil)); } catch (err) { /* uten nett */ }
  let fliseMal = null, maksZoom = 14;
  try {
    const stil = await (await hentKopi(m.stil)).json();
    const kilde = Object.values(stil.sources || {}).find(k => k.type === 'vector');
    const tj = kilde && (kilde.tiles ? kilde : await (await hentKopi(kilde.url)).json());
    if (tj && tj.tiles && tj.tiles.length) { fliseMal = tj.tiles[0]; maksZoom = Math.min(14, tj.maxzoom || 14); }
  } catch (err) { /* kartet hoppes over */ }

  for (const by of m.byer) {
    const adresser = felles.concat([by.side, by.data, by.geometri].filter(Boolean));
    if (fliseMal) {
      try {
        const omrade = await byOmrade(by);
        if (omrade) adresser.push(...fliser(omrade, fliseMal, maksZoom));
      } catch (err) { /* uten data: bare sidene */ }
    }
    await hentAlle(by.id, adresser, kanal);
    felles = [];   // felles ressurser én gang
  }
}

/* Stil, tiles.json, sprite (1x og 2x) og glyfer for fontene stilen bruker. */
async function kartRessurser(stilUrl) {
  if (!stilUrl) return [];
  const stil = await (await hentKopi(stilUrl)).json();
  const ut = [stilUrl];
  Object.values(stil.sources || {}).forEach(k => { if (k.url) ut.push(k.url); });
  const sprites = Array.isArray(stil.sprite) ? stil.sprite.map(s => s.url) : stil.sprite ? [stil.sprite] : [];
  sprites.forEach(s => ['', '@2x'].forEach(f => ut.push(s + f + '.json', s + f + '.png')));
  if (stil.glyphs) {
    const fonter = new Set();
    (stil.layers || []).forEach(l => {
      let f = l.layout && l.layout['text-font'];
      if (Array.isArray(f) && f[0] === 'literal') f = f[1];
      if (Array.isArray(f) && f.every(x => typeof x === 'string')) fonter.add(f.join(','));
    });
    fonter.forEach(f => ['0-255', '256-511', '8192-8447'].forEach(omr => ut.push(
      stil.glyphs.replace('{fontstack}', encodeURIComponent(f).replace(/%2C/g, ',')).replace('{range}', omr))));
  }
  return ut;
}

/* Fra lageret hvis mulig, ellers nettet (og lagre). */
async function hentKopi(url) {
  const lager = await caches.open(url.startsWith(OMFANG) ? EGNE : KART);
  const kopi = await lager.match(nokkel(url), SOK);
  if (kopi) return kopi.clone();
  const r = await fetch(url, { mode: 'cors' });
  if (r.ok) await lager.put(nokkel(url), r.clone());
  return r;
}

/* Området alle stedene i byen dekker: «- sted: bredde, lengde» i md-fila og alle koordinater i geometrien. */
async function byOmrade(by) {
  const pkt = [];
  if (by.data) {
    const tekst = await (await hentKopi(by.data)).text();
    for (const t of tekst.matchAll(/^-\s*sted:\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/gm)) pkt.push([+t[2], +t[1]]);
  }
  if (by.geometri) {
    try {
      const geo = await (await hentKopi(by.geometri)).json();
      const gaa = k => { if (typeof k[0] === 'number') pkt.push(k); else k.forEach(gaa); };
      (geo.features || []).forEach(f => f.geometry && f.geometry.coordinates && gaa(f.geometry.coordinates));
    } catch (err) { /* tom eller ugyldig geometri */ }
  }
  if (!pkt.length) return null;
  const b = [Infinity, Infinity, -Infinity, -Infinity];
  pkt.forEach(([x, y]) => { b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y); });
  return b;
}

/* Fliser zoom 0–maksZoom over området med 15 % marg. Blir det over MAKS_FLISER, kuttes de høyeste nivåene. */
function fliser([v, s, o, n], mal, maksZoom) {
  const bv = (o - v) * 0.15, bh = (n - s) * 0.15;
  const fx = (lng, z) => Math.floor((lng + 180) / 360 * 2 ** z);
  const fy = (lat, z) => { const r = lat * Math.PI / 180; return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * 2 ** z); };
  const forZoom = z => {
    const ut = [];
    for (let x = fx(v - bv, z); x <= fx(o + bv, z); x++)
      for (let y = fy(n + bh, z); y <= fy(s - bh, z); y++) ut.push(mal.replace('{z}', z).replace('{x}', x).replace('{y}', y));
    return ut;
  };
  for (let topp = maksZoom; topp >= 0; topp--) {
    let ut = [];
    for (let z = 0; z <= topp; z++) ut = ut.concat(forZoom(z));
    if (ut.length <= MAKS_FLISER || topp === 0) return ut;
  }
  return [];
}

async function hentAlle(by, liste, kanal) {
  const egne = await caches.open(EGNE), kart = await caches.open(KART);
  const ko = [...new Set(liste)].filter(u => u.startsWith(OMFANG) || FREMMEDE.test(u));
  const totalt = ko.length;
  let hentet = 0, feilet = 0, sist = 0;
  meld({ type: 'fremdrift', by, ferdig: 0, totalt }, kanal);
  async function arbeider() {
    while (ko.length) {
      const url = ko.shift();
      const lager = url.startsWith(OMFANG) ? egne : kart;
      const kopi = await lager.match(nokkel(url), SOK);
      if (!kopi || foreldet(kopi, url)) {
        try { await lagre(lager, url); hentet++; } catch (err) { feilet++; }
      }
      const ferdig = totalt - ko.length;
      if (ferdig - sist >= 10) { sist = ferdig; meld({ type: 'fremdrift', by, ferdig, totalt }, kanal); }
    }
  }
  await Promise.all(Array.from({ length: SAMTIDIG }, arbeider));
  await meld({ type: 'lagret', by, hentet, feilet }, kanal);
}
