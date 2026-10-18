# NOTES — løpende status

Kort og oppdatert. Varig teknikk, datamodell og design står i HANDOVER.md; arbeidsregler i CLAUDE.md.
Oppdateres ved slutten av hver økt (`/avslutt`).

## Status nå

Sist oppdatert: 18. oktober 2026.

- Live på https://stam.pe/byguider/ med fire byer: London (111 oppføringer), Oslo (119), New York (76), Nice (65).
- Appen er i hovedsak ferdig: MapLibre med papirpalett og mørk modus, nabolag med omriss, kjerne og gater,
  flyttbar infoboks, gåturer i infoboksen, ønskeliste for alle, norsk og engelsk.
- Arbeidet nå er data: nye steder, favoritter, beskrivelser og nabolagsomriss. 18.10. fikk Oslo
  nabolagene Fredensborg, St. Hanshaugen, Grünerløkka, SoSoPa, Kampen og Gamlebyen, og London
  fikk Marylebone-butikker, jazzklubber og muséer.
- 18.10. ble nabolagsomrissene i London, New York og Nice gjort presise: offentlige grenser der de finnes
  (Londons conservation areas; New Yorks NTA 2020 og historiske distrikter), ellers grensegater sporet i OSM.
  London: 18 av 43 tegnet om, resten fulgte allerede gatene. New York: alle 10. Nice: begge.
  `kilde` i hver feature sier hvor omrisset kommer fra. `arkiv/` er fjernet fra repoet.
- Ingen åpne grener utenom `main`.

## Neste steg

- Fyll på data etter hvert som Pål kommer med steder og navneendringer, i alle byer.
- Nye nabolag trenger alltid et presist omriss i `data/<by>-geometri.geojson`; fremgangsmåten står i CLAUDE.md, Data.
- Mulig etterarbeid: de 25 London-omrissene som ble beholdt (bl.a. Marylebone, Mayfair, Belgravia, Richmond, Kew Green)
  kan sjekkes mot conservation areas på samme måte hvis Pål ser noe som ikke stemmer.
- Oppdater miniatyrene når en by endrer utseende merkbart (CLAUDE.md, Miniatyrer).
- KML-eksport for Google My Maps-sporet: scopet i [scope-kml.md](scope-kml.md) (forslag: `?kml` i appen, test med London). Venter på svar fra Pål på de åpne spørsmålene nederst der.

## Åpne spørsmål

- Ingen.

## Beslutningslogg

- 2026-09-27: Flerbys-arkitektur med én app.js og stubbmapper per by, og Leaflet → MapLibre. Grunnen var at én kodebase skal betjene alle byene, og at CARTO fases ut raster.
- 2026-10-05: Lokale økter bruker localhost i stedet for forhåndsvisningen. Det er raskere, og ingen push trengs.
- 2026-10-16: Ønskelista vises for alle, ikke bare med `?onskeliste`.
- 2026-10-17: Gåturer bruker den vanlige infoboksen, og det faste rutekortet er fjernet. Da blir oppførselen lik for alt.
- 2026-10-17: Nabolagsikonet ligger midt i kjernen, ellers midt i området, ikke på `sted:` fra Google.
- 2026-10-18: Løpende status flyttes fra HANDOVER.md (punkt 2 og 8) til NOTES.md. HANDOVER.md blir referanse.
- 2026-10-18: De to EKSEMPEL-oppføringene i London (Hermanos Coffee Roasters og WWT London Wetland Centre) er fjernet.
- 2026-10-18: KML-eksport er fortsatt aktuelt, men skal scopes før vi setter i gang.
- 2026-10-18: Notatet om å rette eksempel-linjene i geojson er utdatert. De to linjene (én gate, én gåtur) lå i den opprinnelige london.geojson fra 20.9. og finnes ikke lenger.
- 2026-10-18: «Tips til nabolag i London.md» er slettet. Innholdet ligger i data/london.md, og Pål har notert de få tipsene som ikke kom med.
- 2026-10-18: «Claude outputs/github-pages-oppsett-reiseplanlegger.md» er slettet. Den var en kopi av et utdatert oppsettnotat fra reiseplanlegging.
- 2026-10-18: Nabolagsomriss skal være presise i alle byer: offentlige grenser først, ellers grensegater sporet i OSM, med `kilde` i hver feature. Fremgangsmåten står i CLAUDE.md.
- 2026-10-18: West Village i New York følger byplankontorets NTA-grense, selv om den er smalere i øst enn den gamle skissen (som gikk til 6th Ave).
- 2026-10-18: `arkiv/` med den gamle London-prototypen er fjernet. Pål flyttet filen ut av repoet.
