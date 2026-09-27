/* Påls London — henter GeoJSON, tegner på Leaflet, filtrerer.
   Data og presentasjon er adskilt: nye steder legges inn i data/nabolag-london.geojson.
   Ny kategori krever ett oppslag i KATEGORIER under, pluss ingenting annet —
   filterknappen lages automatisk. */

const DATA_URL = 'data/nabolag-london.geojson';

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

const SONER = ['Central', 'North', 'South', 'East', 'West'];

const PAPIR = '#F7F4EE';

/* CARTO krever API-nøkkel på rasterkartene siden august 2026. Nøkkelen er gratis
   og hentes på https://carto.com/basemaps/apikey — lim den inn her.
   Står den tom, tegnes kartet fortsatt, men med "API KEY REQUIRED"-vannmerke. */
const CARTO_KEY = 'cb1_400i_1_fd049a8bd96268b9a1be2213';

/* ---------- tilstand ---------- */

const state = {
  oppslag: [],                 // { id, f, p, layer, erLinje }
  soner: new Set(),            // tom = alle
  kategorier: new Set(),       // tom = alle
  kunFavoritter: false,
  sok: '',
  valgtId: null
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
  ruteKort:   document.getElementById('rute-kort'),
  ruteKicker: document.getElementById('rute-kicker'),
  ruteNavn:   document.getElementById('rute-navn'),
  ruteMeta:   document.getElementById('rute-meta'),
  ruteNotat:  document.getElementById('rute-notat'),
  ruteLukk:   document.getElementById('rute-lukk')
};

/* ---------- kart ---------- */

const kart = L.map('kart', { zoomControl: true, attributionControl: true })
  .setView([51.5105, -0.1235], 12);

const CARTO_URL = 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
  + (CARTO_KEY ? '?key=' + CARTO_KEY : '');

L.tileLayer(CARTO_URL, {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &middot; &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(kart);

const lag = L.layerGroup().addTo(kart);

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

/* ---------- bygg lag fra data ---------- */

function lagOppslag(f, i) {
  const p = f.properties || {};
  const info = katInfo(p.kategori);
  const erLinje = f.geometry.type === 'LineString' || erLinjekategori(p.kategori);
  let layer;

  if (f.geometry.type === 'LineString') {
    layer = L.polyline(f.geometry.coordinates.map(c => [c[1], c[0]]), {
      color: info.farge,
      weight: p.kategori === 'gaatur' ? 5 : 4,
      opacity: 0.85,
      dashArray: p.kategori === 'gaatur' ? '1 9' : null,
      lineCap: 'round',
      lineJoin: 'round'
    });
  } else {
    const latlng = [f.geometry.coordinates[1], f.geometry.coordinates[0]];
    layer = L.circleMarker(latlng, {
      radius: p.favoritt ? 8 : 6,
      color: PAPIR,
      weight: p.favoritt ? 2 : 1.5,
      fillColor: info.farge,
      fillOpacity: p.favoritt ? 1 : 0.78
    });
  }

  const o = { id: 'f' + i, f: f, p: p, layer: layer, erLinje: erLinje };

  layer.bindPopup(popupHtml(p, layer.getLatLng ? layer.getLatLng() : null), {
    closeButton: true, autoPanPadding: [30, 30]
  });
  layer.on('click', () => velg(o.id, false));
  if (layer.bindTooltip && !erLinje) {
    layer.bindTooltip(p.navn, { direction: 'top', offset: [0, -8], opacity: 0.95 });
  }

  return o;
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

  lag.clearLayers();
  vis.forEach(o => lag.addLayer(o.layer));

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
  }
}

function tegnListe(vis) {
  el.liste.innerHTML = '';

  if (!vis.length) {
    const t = document.createElement('p');
    t.className = 'tomt';
    t.textContent = 'Ingen treff. Juster filtrene eller søket.';
    el.liste.appendChild(t);
    return;
  }

  const rekkefolge = SONER.slice();
  vis.slice()
    .sort((a, b) => {
      const sa = rekkefolge.indexOf(a.p.sone), sb = rekkefolge.indexOf(b.p.sone);
      if (sa !== sb) return (sa < 0 ? 99 : sa) - (sb < 0 ? 99 : sb);
      if (!!b.p.favoritt !== !!a.p.favoritt) return b.p.favoritt ? 1 : -1;
      return (a.p.navn || '').localeCompare(b.p.navn || '', 'nb');
    })
    .forEach((o, i, arr) => {
      if (i === 0 || arr[i - 1].p.sone !== o.p.sone) {
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
  const o = state.oppslag.find(x => x.id === id);
  if (!o) return;
  state.valgtId = id;

  if (o.erLinje && o.layer.getBounds) {
    if (flyTil) kart.flyToBounds(o.layer.getBounds(), { padding: [70, 70], maxZoom: 16, duration: 0.6 });
    visRuteKort(o);
  } else {
    el.ruteKort.hidden = true;
    if (flyTil && o.layer.getLatLng) {
      kart.flyTo(o.layer.getLatLng(), Math.max(kart.getZoom(), 14), { duration: 0.6 });
    }
    o.layer.openPopup();
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
  SONER.filter(s => state.brukteSoner.has(s)).forEach(s => {
    el.fSone.appendChild(lagChip(s, null, state.soner.has(s), () => toggle(state.soner, s)));
  });

  // kategorier — kun de som faktisk finnes i datasettet
  el.fKategori.innerHTML = '';
  state.brukteKategorier.forEach(k => {
    el.fKategori.appendChild(
      lagChip(katInfo(k).navn, katInfo(k).farge, state.kategorier.has(k), () => toggle(state.kategorier, k))
    );
  });

  // status
  el.fStatus.innerHTML = '';
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

/* ---------- last data ---------- */

fetch(DATA_URL)
  .then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(gj => {
    state.oppslag = (gj.features || []).map(lagOppslag);

    state.brukteSoner = new Set(state.oppslag.map(o => o.p.sone).filter(Boolean));
    const rekkefolge = Object.keys(KATEGORIER);
    state.brukteKategorier = rekkefolge.filter(k => state.oppslag.some(o => o.p.kategori === k));
    state.oppslag.forEach(o => {
      if (o.p.kategori && !state.brukteKategorier.includes(o.p.kategori)) {
        state.brukteKategorier.push(o.p.kategori);
      }
    });

    byggFiltre();
    tegn();

    const alle = L.featureGroup(state.oppslag.map(o => o.layer));
    if (state.oppslag.length) kart.fitBounds(alle.getBounds(), { padding: [50, 50] });

    const oppdatert = (gj.metadata && gj.metadata.oppdatert) ? gj.metadata.oppdatert : null;
    el.fotTekst.innerHTML = 'Rediger <code>data/nabolag-london.geojson</code> for å legge til steder.' +
      (oppdatert ? ' Sist oppdatert ' + esc(oppdatert) + '.' : '');
  })
  .catch(err => {
    el.liste.innerHTML = '<p class="tomt">Fant ikke <code>' + DATA_URL + '</code> (' + esc(err.message) +
      ').<br><br>Åpnes siden fra <code>file://</code>? Kjør <code>python3 -m http.server</code> i mappen ' +
      'og åpne <code>localhost:8000</code>.</p>';
    el.teller.textContent = 'Ingen data';
  });
