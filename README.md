# Påls byguider

Interaktive kart over nabolag, gater, gåturer og steder — London, Nice og Oslo.

Publisert: https://paalstampe.github.io/byguider/

## Struktur

```
byguider/
├── index.html          forside: lista over byer (fra byer.json)
├── app.js              all logikk: laster byens GeoJSON, tegner på MapLibre, filtrerer
├── style.css           alt visuelt: farger, typografi, kort
├── byer.json           manifest over byene
├── london/index.html   stubb per by — laster ../app.js med data-by="london"
├── nice/index.html
├── oslo/index.html
├── data/
│   ├── london.geojson  dataene — dette er "databasen", én fil per by
│   ├── nice.geojson
│   └── oslo.geojson
├── arkiv/              tidligere versjoner, ikke i bruk
├── HANDOVER.md         statusdokument
└── README.md
```

## Datamodell

Hvert sted er en GeoJSON-`Feature`:

- `geometry.type: "Point"` for steder — `coordinates: [lengdegrad, breddegrad]` (merk rekkefølgen)
- `geometry.type: "LineString"` for gater og gåturer — liste av koordinatpar i rekkefølge

`properties`:

| felt | verdi |
|---|---|
| `navn` | visningsnavn |
| `kategori` | nabolag, cafe, bakeri, restaurant, bar, butikk, marked, park, galleri, gate, gaatur |
| `sone` | byens soner (valgfritt), f.eks. Central, North, South, East, West i London |
| `favoritt` | true / false |
| `besokt` | true / false |
| `notat` | fritekst |
| `place_id` | Google Place ID (valgfritt, for dyplenking) |
| `lengde_km`, `varighet_min` | kun for gåturer |

`metadata` i hver fil: `tittel`, `kicker`, `undertittel`, `senter` (`[lengdegrad, breddegrad]`),
`zoom` (MapLibre-skala), `soner` (rekkefølge; tom = ingen sonefilter), `oppdatert`.

Nye felter kan legges til fritt — koden ignorerer det den ikke kjenner.

## Ny by

1. Legg til en linje i `byer.json`.
2. Lag `data/<by>.geojson` med `metadata` utfylt (kopier `data/oslo.geojson`).
3. Kopier `london/index.html` til `<by>/index.html` og bytt `data-by`.

## Redigering

- **Punkter og tekst:** rediger `data/<by>.geojson` direkte, eller på GitHub i nettleseren.
- **Gater og gåturer:** bruk [geojson.io](https://geojson.io) — dra inn filen, tegn med linjeverktøyet, last ned igjen.

## Lokal kjøring

`fetch()` blokkeres ved åpning fra `file://`. Kjør i stedet:

```
cd byguider
python3 -m http.server
```

og åpne `http://localhost:8000` (forside) eller `http://localhost:8000/london/`.

## Publisering

GitHub Pages: Settings → Pages → Deploy from a branch → `main` / `(root)`.
