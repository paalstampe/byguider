// Slår opp mange steder i Google Maps på én gang, uten å klikke seg gjennom hvert sted.
// Bruk: åpne https://www.google.com/maps?hl=en i nettleserpanelet (avvis informasjonskapsler),
// lim inn denne fila med javascript_tool, og kjør så f.eks.
//   await kjor(['Contramar, Durango 200', 'Rosetta, Colima 166'], 'Ciudad de México')
// Svaret er én linje per søk:
//   søk ¦ navn ¦ område ¦ vurdering ¦ antall ¦ STENGT/MIDL ¦ bredde ¦ lengde ¦ Place ID ¦ nettside ¦ adresse ¦ type ¦ feil
// Alt lagres også i window.__res (JSON.stringify(window.__res) gir hele lista).
// «ingen» betyr at Google ga en treffliste eller ingenting: legg til adresse eller nabolag i søket og prøv igjen.
// Sjekk alltid at navn og område stemmer – første treff kan være feil sted, og et sted Google ikke kjenner
// kan gi treff på selve byen (navn = bynavnet, uten vurdering). Da finnes stedet ikke der: spør Pål.
// STENGT/MIDL bekreftes på stedets side (google.com/maps/place/?q=place_id:<id>&hl=en) før det droppes.

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
    };
  } catch (e) { return { q, feil: String(e) }; }
};

window.kjor = async (sok, by = '') => {
  const ut = [];
  for (const q of sok) { ut.push(await slaOpp(q, by)); await new Promise(r => setTimeout(r, 300)); }
  window.__res = (window.__res || []).concat(ut);
  return ut.map(o => [o.q, o.navn, o.omr, o.vurd, o.antall, o.stengt, o.lat?.toFixed(5), o.lng?.toFixed(5),
    o.id, o.web, o.adr, o.typer, o.feil].map(v => v ?? '').join(' ¦ ')).join('\n');
};
