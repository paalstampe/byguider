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
- Ingen åpne grener utenom `main`.

## Neste steg

- Fyll på data etter hvert som Pål kommer med steder og navneendringer, i alle byer.
- Nye nabolag trenger alltid omriss i `data/<by>-geometri.geojson` (se CLAUDE.md, Data).
- Oppdater miniatyrene når en by endrer utseende merkbart (CLAUDE.md, Miniatyrer).

## Åpne spørsmål

- KML-eksport for Google My Maps-sporet: fortsatt aktuelt?
- Koordinatene i de to eksempel-linjene i geojson (HANDOVER punkt 8.4): fortsatt aktuelt, eller er de borte?
- London har to oppføringer merket EKSEMPEL. Skal de erstattes eller fjernes?

## Beslutningslogg

- 2026-09-27: Flerbys-arkitektur med én app.js og stubbmapper per by, og Leaflet → MapLibre. Grunnen var at én kodebase skal betjene alle byene, og at CARTO fases ut raster.
- 2026-10-05: Lokale økter bruker localhost i stedet for forhåndsvisningen. Det er raskere, og ingen push trengs.
- 2026-10-16: Ønskelista vises for alle, ikke bare med `?onskeliste`.
- 2026-10-17: Gåturer bruker den vanlige infoboksen, og det faste rutekortet er fjernet. Da blir oppførselen lik for alt.
- 2026-10-17: Nabolagsikonet ligger midt i kjernen, ellers midt i området, ikke på `sted:` fra Google.
- 2026-10-18: Løpende status flyttes fra HANDOVER.md (punkt 2 og 8) til NOTES.md. HANDOVER.md blir referanse.
