/* Offline for byguidene (service worker, virker for alt under mappen sw.js ligger i).

   Med nett er alt som før: egne filer (sider, app.js, style.css, data/*.md) hentes alltid
   fra nettet først, så endringer vises straks. Svarer ikke nettet innen NETT_FRIST, eller
   er man uten nett, brukes siste lagrede kopi.

   Kartet og bibliotekene (CARTO-fliser, stil, fonter, MapLibre, Google Fonts) tas fra
   lageret når de finnes der, og fliser eldre enn FLIS_MAKSALDER hentes på nytt når det
   er nett. Første gang en by åpnes med nett, sender app.js (forhandslastOffline) en liste
   over alt byen trenger — også fliser for hele byens område, zoom 0–14 — og lista hentes
   her i bakgrunnen. Etter det virker byen uten nett.

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
const nokkel = url => url.replace(/^https:\/\/tiles-[a-d]\.basemaps\.cartocdn\.com\//, 'https://tiles.basemaps.cartocdn.com/');
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
  const kopi = await lager.match(n, SOK);
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

/* Forhåndslasting fra app.js: { type: 'forhandslast', adresser: [...] }.
   Henter bare det som mangler; svarer { type: 'forhandslastet', hentet, feilet } når ferdig. */
self.addEventListener('message', e => {
  const m = e.data || {};
  if (m.type !== 'forhandslast' || !Array.isArray(m.adresser)) return;
  e.waitUntil((async () => {
    const egne = await caches.open(EGNE), kart = await caches.open(KART);
    const ko = [...new Set(m.adresser)];
    const totalt = ko.length;
    let hentet = 0, feilet = 0, ferdig = 0;
    const meld = d => { if (e.source) e.source.postMessage(d); };
    async function arbeider() {
      while (ko.length) {
        const url = ko.shift();
        const lager = url.startsWith(OMFANG) ? egne : kart;
        if (!url.startsWith(OMFANG) && !FREMMEDE.test(url)) continue;
        const kopi = await lager.match(nokkel(url), SOK);
        if (kopi && !foreldet(kopi, url)) continue;
        try { await lagre(lager, url); hentet++; } catch (err) { feilet++; }
        if (++ferdig % 20 === 0) meld({ type: 'fremdrift', ferdig: totalt - ko.length, totalt });
      }
    }
    await Promise.all(Array.from({ length: SAMTIDIG }, arbeider));
    meld({ type: 'forhandslastet', hentet, feilet });
  })());
});
