// Slår opp mange steder i Google Maps på én gang, uten å klikke seg gjennom hvert sted.
// Bruk: åpne https://www.google.com/maps?hl=en i nettleserpanelet (avvis informasjonskapsler),
// lim inn denne fila med javascript_tool, og kjør så f.eks.
//   await kjor(['Contramar, Durango 200', 'Rosetta, Colima 166'], 'Ciudad de México')
// Mange steder: start([...], 'By'), så resultat() til svaret kommer (se nederst).
// Svaret er én linje per søk:
//   søk ¦ navn ¦ område ¦ vurdering ¦ antall ¦ STENGT/MIDL ¦ bredde ¦ lengde ¦ Place ID ¦ nettside ¦ adresse ¦ type ¦ tider ¦ feil
// tider er Googles åpningstider i åpent:-format («ti–fr 17–23, lø 12–23»); sjekk dem mot stedets egen nettside.
// Alt lagres også i window.__res (JSON.stringify(window.__res) gir hele lista).
// «ingen» betyr at Google ga en treffliste eller ingenting: legg til adresse eller nabolag i søket og prøv igjen.
// Sjekk alltid at navn og område stemmer – første treff kan være feil sted, og et sted Google ikke kjenner
// kan gi treff på selve byen (navn = bynavnet, uten vurdering). Da finnes stedet ikke der: spør Pål.
// STENGT/MIDL bekreftes på stedets side (google.com/maps/place/?q=place_id:<id>&hl=en) før det droppes.

// Googles ukeliste (sju dager med «5–11 pm»-tekst) som åpent:-felt; dager uten tider er stengt.
const DAGER = { Monday: 'ma', Tuesday: 'ti', Wednesday: 'on', Thursday: 'to', Friday: 'fr', Saturday: 'lø', Sunday: 'sø' };
function finnUke(o) {
  if (!Array.isArray(o)) return null;
  if (o.length === 7 && o.every(x => Array.isArray(x) && DAGER[x[0]] && Array.isArray(x[3]))) return o;
  for (const x of o) { const r = finnUke(x); if (r) return r; }
  return null;
}
function klokke(t) {   // «5:30 pm» -> «17.30», «12 am» -> «00»
  const m = t.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!m) return t.trim();
  const h = +m[1] % 12 + (m[3].toLowerCase() === 'pm' ? 12 : 0);
  return String(h).padStart(2, '0') + (m[2] && m[2] !== '00' ? '.' + m[2] : '');
}
function tidTekst(t) {   // «5–11 pm» -> «17–23»; am/pm står ofte bare på siste klokkeslett
  const [fra, til] = t.split(/[–-]/);
  const suffiks = (til.match(/(am|pm)\s*$/i) || [])[1] || '';
  return klokke(/am|pm/i.test(fra) ? fra : fra + ' ' + suffiks) + '–' + klokke(til);
}
function aapentFelt(uke) {
  const dag = uke.slice().sort((a, b) => a[1] - b[1]).map(x => x[3].map(y => y[0]).filter(y => !/closed/i.test(y)));
  if (dag.some(t => t.some(y => /24 hours/i.test(y)))) return 'døgnåpent – skriv inn selv';
  const tekst = dag.map(t => t.map(tidTekst).join(' + '));
  const n = ['ma', 'ti', 'on', 'to', 'fr', 'lø', 'sø'], ut = [];
  for (let i = 0; i < 7; i++) {
    if (!tekst[i]) continue;
    let j = i;
    while (j + 1 < 7 && tekst[j + 1] === tekst[i]) j++;
    ut.push(n[i] + (j > i ? '–' + n[j] : '') + ' ' + tekst[i]);
    i = j;
  }
  return ut.join(', ');
}

window.slaOpp = async (q, by = '') => {
  try {
    const r = await fetch('/search?tbm=map&authuser=0&hl=en&q=' + encodeURIComponent(by ? `${q}, ${by}` : q));
    const d = JSON.parse((await r.text()).slice(5));
    const i = ((d[0] && d[0][1]) || []).filter(x => x && x[14]).map(x => x[14])[0];
    if (!i) return { q, feil: 'ingen' };
    const s = JSON.stringify(i);
    return {
      q, navn: i[11], omr: i[14], vurd: i[4]?.[7], antall: i[4]?.[8],
      stengt: /ermanently closed/.test(s) ? 'STENGT' : /emporarily closed/.test(s) ? 'MIDL' : '',
      lat: i[9]?.[2], lng: i[9]?.[3], id: i[78], web: i[7]?.[0], adr: i[39], typer: (i[13] || []).slice(0, 2).join('/'),
      tider: (u => u ? aapentFelt(u) : '')(finnUke(i)),
    };
  } catch (e) { return { q, feil: String(e) }; }
};

/* Fire oppslag om gangen og ingen pauser: setTimeout strupes når nettleserpanelet er skjult (ned til ett kall
   i minuttet), så pauser mellom oppslagene gjorde 144 steder til et kvarter. Rekkefølgen i svaret følger sok. */
async function slaOppAlle(sok, by) {
  const ut = new Array(sok.length);
  let neste = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (neste < sok.length) { const i = neste++; ut[i] = await slaOpp(sok[i], by); }
  }));
  window.__res = (window.__res || []).concat(ut);
  return ut;
}

const linje = o => [o.q, o.navn, o.omr, o.vurd, o.antall, o.stengt, o.lat?.toFixed(5), o.lng?.toFixed(5),
  o.id, o.web, o.adr, o.typer, o.tider, o.feil].map(v => v ?? '').join(' ¦ ');

window.kjor = async (sok, by = '') => (await slaOppAlle(sok, by)).map(linje).join('\n');

/* Lange lister (mer enn ca. 60 steder) rekker ikke å bli ferdige innen javascript_tool gir opp (45 s).
   start() kjører i bakgrunnen; hent svaret med resultat() når window.__ferdig er true. */
window.start = (sok, by = '') => {
  window.__ferdig = false;
  slaOppAlle(sok, by).then(ut => { window.__siste = ut; window.__ferdig = true; });
  return 'startet ' + sok.length;
};
window.resultat = () => window.__ferdig ? window.__siste.map(linje).join('\n') : 'ikke ferdig: ' + (window.__res || []).length;
