/* Byguide — én kopi av logikken for alle byer.

   Hver by har en stubb (london/index.html osv.) som laster denne filen med
   data-by="<id>". Filen henter selv inn fonter, stilark og kartbibliotek,
   bygger siden, slår opp byen i byer.json og laster byens GeoJSON.

   Kartet tegnes med MapLibre GL JS. Hele GeoJSON-filen er én kilde med ett
   circle-lag for punkter og to line-lag for gater og gåturer; filtrering er
   setFilter på lagene. Sidebar, søk og liste snakker aldri med kartet direkte.

   Data og presentasjon er adskilt: steder, soner, startvisning og titler ligger
   i GeoJSON-filen (features + metadata). Koden inneholder ingenting byspesifikt.
   Ny kategori krever ett oppslag i KATEGORIER under, pluss ingenting annet —
   filterknappen lages automatisk. */

const KATEGORIER = {
  nabolag:    { navn: 'Nabolag',    farge: '#8A5A2B' },
  cafe:       { navn: 'Café',       farge: '#A9713F' },
  bakeri:     { navn: 'Bakeri',     farge: '#C08A4E' },
  restaurant: { navn: 'Restaurant', farge: '#9E4A3C' },
  bar:        { navn: 'Bar',        farge: '#6E4A6B' },
  butikk:     { navn: 'Butikk',     farge: '#4F6B7A' },
  marked:     { navn: 'Marked',     farge: '#7A6A2B' },
  park:       { navn: 'Park',       farge: '#5C7A4F' },
  galleri:    { navn: 'Galleri',    farge: '#3F5A6B' },
  gate:       { navn: 'Gate',       farge: '#8A5A2B' },
  gaatur:     { navn: 'Gåtur',      farge: '#9E4A3C' }
};

const PAPIR = '#F7F4EE';

/* CARTO-nøkkel (gratis, https://carto.com/basemaps/apikey). Kravet gjelder foreløpig
   bare rasterkartene. Vektorstilen avviser i dag forespørsler MED ?key= (svaret mangler
   CORS-header, og kartet blir blankt), så nøkkelen sendes ikke med på stilen ennå.
   Den ligger her til CARTO slår på nøkkelkravet for vektor — da legges den på KARTSTIL. */
const CARTO_KEY = 'cb1_400i_1_fd049a8bd96268b9a1be2213';

const KARTSTIL = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

const UKJENT_FARGE = '#6B5D4A';

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
      <p class="kicker" id="kicker"></p>
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
      <button type="button" id="nullstill" class="nullstill" hidden>Nullstill</button>
    </div>
    <div class="liste" id="liste" role="list"></div>
    <footer class="sidebar-fot">
      <a class="til-byer" href="${new URL('./', BASE).href}">Alle byer</a>
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
    const dataSti = b.data || ('data/' + b.id + '.geojson');
    start(dataSti, new URL(dataSti, BASE).href);
  } catch (err) {
    document.getElementById('liste').innerHTML = '<p class="tomt">' + String(err.message)
      .replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])) + '</p>';
  }
})();

/* ---------- appen ---------- */

function start(DATA_NAVN, DATA_URL) {

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
    brukteKategorier: []
  };

  const el = {
    kart:       null,
    liste:      document.getElementById('liste'),
    sok:        document.getElementById('sok'),
    teller:     document.getElementById('teller'),
    nullstill:  document.getElementById('nullstill'),
    fSone:      document.getElementById('filter-sone'),
    fKategori:  document.getElementById('filter-kategori'),
    fStatus:    document.getElementById('filter-status'),
    fotTekst:   document.getElementById('fot-tekst'),
    kicker:     document.getElementById('kicker'),
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

  const popup = new maplibregl.Popup({ closeButton: true, focusAfterOpen: false, maxWidth: '300px', offset: 10, className: 'pop' });
  const tips = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10, className: 'tips' });

  /* Farger defineres étt sted — KATEGORIER — og oversettes til et match-uttrykk. */
  const FARGE = ['match', ['get', 'kategori']]
    .concat(Object.keys(KATEGORIER).flatMap(k => [k, KATEGORIER[k].farge]))
    .concat([UKJENT_FARGE]);

  const FAV = ['==', ['get', 'favoritt'], true];

  const KARTLAG = {
    gater: {
      type: 'line',
      filter: ['all', ['==', ['geometry-type'], 'LineString'], ['!=', ['get', 'kategori'], 'gaatur']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': FARGE, 'line-width': 4, 'line-opacity': 0.85 }
    },
    gaaturer: {
      type: 'line',
      filter: ['all', ['==', ['geometry-type'], 'LineString'], ['==', ['get', 'kategori'], 'gaatur']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': FARGE, 'line-width': 5, 'line-opacity': 0.85, 'line-dasharray': [0.2, 1.8] }
    },
    punkter: {
      type: 'circle',
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-color': FARGE,
        'circle-radius': ['case', FAV, 7, 5.25],
        'circle-opacity': ['case', FAV, 1, 0.78],
        'circle-stroke-color': PAPIR,
        'circle-stroke-width': ['case', FAV, 2, 1.5]
      }
    }
  };

  function leggTilKartlag(gj) {
    kart.addSource('steder', { type: 'geojson', data: gj });
    Object.keys(KARTLAG).forEach(id => {
      kart.addLayer(Object.assign({ id: id, source: 'steder' }, KARTLAG[id]));
      kart.on('mouseenter', id, () => { kart.getCanvas().style.cursor = 'pointer'; });
      kart.on('mouseleave', id, () => { kart.getCanvas().style.cursor = ''; });
      kart.on('click', id, e => {
        // Punkter ligger over linjer: klikk på et punkt skal ikke også velge linjen under.
        if (id !== 'punkter' && kart.queryRenderedFeatures(e.point, { layers: ['punkter'] }).length) return;
        const o = oppslagFraId(e.features[0].properties._id);
        if (!o) return;
        velg(o.id, false);
        if (o.erLinje) aapnePopup(o, e.lngLat);
      });
    });

    kart.on('mousemove', 'punkter', e => {
      const f = e.features[0];
      tips.setLngLat(f.geometry.coordinates).setText(f.properties.navn || '').addTo(kart);
    });
    kart.on('mouseleave', 'punkter', () => tips.remove());
  }

  function filtrerKart(vis) {
    if (!kart.getLayer('punkter')) return;
    const ider = ['in', ['get', '_id'], ['literal', vis.map(o => o.id)]];
    Object.keys(KARTLAG).forEach(id => kart.setFilter(id, ['all', KARTLAG[id].filter, ider]));
  }

  function aapnePopup(o, lngLat) {
    popup.setLngLat(lngLat).setHTML(popupHtml(o.p, o.punkt)).addTo(kart);
  }

  /* ---------- hjelpere ---------- */

  const katInfo = k => KATEGORIER[k] || { navn: k || 'Ukjent', farge: '#6B5D4A' };
  const erLinjekategori = k => k === 'gate' || k === 'gaatur';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function statusTekst(p) {
    if (p.besokt === true) return 'Besøkt';
    if (p.besokt === false) return 'Ikke besøkt';
    return '';
  }

  function metaLinje(p) {
    return [p.sone, katInfo(p.kategori).navn, statusTekst(p)].filter(Boolean).join(' · ');
  }

  function ruteMeta(p) {
    const d = [];
    if (p.lengde_km) d.push(p.lengde_km.toString().replace('.', ',') + ' km');
    if (p.varighet_min) d.push('ca. ' + p.varighet_min + ' min');
    if (p.sone) d.push(p.sone);
    return d.join(' · ');
  }

  function mapsLenke(p, latlng) {
    if (p.place_id) {
      return 'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent(p.navn) + '&query_place_id=' + encodeURIComponent(p.place_id);
    }
    if (latlng) {
      return 'https://www.google.com/maps/search/?api=1&query=' + latlng.lat + ',' + latlng.lng;
    }
    return null;
  }

  function popupHtml(p, latlng) {
    const lenke = mapsLenke(p, latlng);
    return '<h3 class="pop-navn">' + esc(p.navn) + '</h3>' +
      '<p class="pop-meta">' + esc(metaLinje(p) || ruteMeta(p)) + '</p>' +
      (p.notat ? '<p class="pop-notat">' + esc(p.notat) + '</p>' : '') +
      (lenke ? '<a class="pop-lenke" href="' + lenke + '" target="_blank" rel="noopener">Åpne i Google Maps</a>' : '');
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
    f.properties = Object.assign({}, f.properties, { _id: id });
    const p = f.properties;
    const g = f.geometry;
    const erLinje = g.type === 'LineString' || erLinjekategori(p.kategori);
    const coords = g.type === 'LineString' ? g.coordinates : [g.coordinates];

    return {
      id: id, f: f, p: p, erLinje: erLinje,
      punkt: g.type === 'Point' ? { lng: g.coordinates[0], lat: g.coordinates[1] } : null,
      bbox: bbox(coords)
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
        const hay = [p.navn, p.notat, p.sone, katInfo(p.kategori).navn].join(' ').toLowerCase();
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

    const aktivtFilter = state.soner.size || state.kategorier.size || state.kunFavoritter || state.sok;
    el.nullstill.hidden = !aktivtFilter;

    tegnListe(vis);

    if (state.valgtId && !vis.some(o => o.id === state.valgtId)) {
      state.valgtId = null;
      el.ruteKort.hidden = true;
      popup.remove();
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
      (p.notat ? '<p class="oppslag-notat">' + esc(p.notat) + '</p>' : '');

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

    if (o.erLinje) {
      popup.remove();
      if (flyTil) kart.fitBounds(o.bbox, { padding: 70, maxZoom: 15, duration: 600 });
      visRuteKort(o);
    } else {
      el.ruteKort.hidden = true;
      if (flyTil && o.punkt) {
        kart.flyTo({ center: o.punkt, zoom: Math.max(kart.getZoom(), 13), duration: 600 });
      }
      if (o.punkt) aapnePopup(o, o.punkt);
    }

    tegnListe(synlige());

    const valgtNode = el.liste.querySelector('.oppslag.er-valgt');
    if (valgtNode) valgtNode.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function visRuteKort(o) {
    const p = o.p;
    el.ruteKicker.textContent = p.kategori === 'gaatur' ? 'Gåtur' : 'Gate';
    el.ruteNavn.textContent = p.navn || '';
    el.ruteMeta.textContent = ruteMeta(p);
    el.ruteNotat.textContent = p.notat || '';
    el.ruteKort.hidden = false;
  }

  el.ruteLukk.addEventListener('click', () => {
    el.ruteKort.hidden = true;
    state.valgtId = null;
    tegnListe(synlige());
  });

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

  function toggle(set, verdi) {
    if (set.has(verdi)) set.delete(verdi); else set.add(verdi);
    byggFiltre();
    tegn();
  }

  function byggFiltre() {
    // soner
    el.fSone.innerHTML = '';
    state.soneRekkefolge.filter(s => state.brukteSoner.has(s)).forEach(s => {
      el.fSone.appendChild(lagChip(s, null, state.soner.has(s), () => toggle(state.soner, s)));
    });
    el.fSone.hidden = el.fSone.childElementCount === 0;

    // kategorier — kun de som faktisk finnes i datasettet
    el.fKategori.innerHTML = '';
    state.brukteKategorier.forEach(k => {
      el.fKategori.appendChild(
        lagChip(katInfo(k).navn, katInfo(k).farge, state.kategorier.has(k), () => toggle(state.kategorier, k))
      );
    });

    // status
    el.fStatus.innerHTML = '';
    el.fStatus.hidden = !state.oppslag.length;
    el.fStatus.appendChild(lagChip('Kun favoritter', null, state.kunFavoritter, () => {
      state.kunFavoritter = !state.kunFavoritter;
      byggFiltre();
      tegn();
    }));
  }

  el.nullstill.addEventListener('click', () => {
    state.soner.clear();
    state.kategorier.clear();
    state.kunFavoritter = false;
    state.sok = '';
    el.sok.value = '';
    byggFiltre();
    tegn();
  });

  el.sok.addEventListener('input', e => {
    state.sok = e.target.value;
    tegn();
  });

  /* ---------- side fra metadata ---------- */

  function settOppSide(meta) {
    if (meta.tittel) document.title = meta.tittel;
    el.kicker.textContent  = meta.kicker || '';
    el.tittel.textContent  = meta.tittel || '';
    el.ingress.textContent = meta.undertittel || '';
    el.kicker.hidden  = !meta.kicker;
    el.ingress.hidden = !meta.undertittel;

    // senter er [lengdegrad, breddegrad], som i resten av GeoJSON
    const senter = Array.isArray(meta.senter) && meta.senter.length === 2 ? meta.senter : [0, 20];
    kart.jumpTo({ center: senter, zoom: typeof meta.zoom === 'number' ? meta.zoom : 11 });
  }

  /* ---------- last data ---------- */

  fetch(DATA_URL)
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(gj => {
      const meta = gj.metadata || {};
      settOppSide(meta);

      state.oppslag = (gj.features || []).map(lagOppslag);

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

      if (state.oppslag.length) {
        kart.fitBounds(bbox(state.oppslag.flatMap(o => [o.bbox.slice(0, 2), o.bbox.slice(2)])),
          { padding: 50, duration: 0 });
      }

      // Lista virker uavhengig av kartet; lagene legges på når stilen er lastet.
      kartKlar.then(() => {
        leggTilKartlag(gj);
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
