# Pål og Vibekes byguider

Interaktive kart over nabolag, gater, gåturer og steder — London, Nice og Oslo.

Publisert: https://paalstampe.github.io/byguider/

## Struktur

```
byguider/
├── index.html          forside: lista over byer (fra byer.json)
├── app.js              all logikk: leser byens md-fil, tegner på MapLibre, filtrerer
├── style.css           alt visuelt: farger, typografi, kort
├── byer.json           manifest over byene
├── london/index.html   stubb per by — laster ../app.js med data-by="london"
├── nice/index.html
├── oslo/index.html
├── data/
│   ├── london.md                 dataene — én md-fil per by
│   ├── london-geometri.geojson   områder, gater, gåturer
│   └── …                         nice, oslo
├── arkiv/              tidligere versjoner, ikke i bruk
├── HANDOVER.md         statusdokument
└── README.md
```

## Data

Hver by er én markdown-fil, `data/<by>.md`, som kartet leser direkte. Instruksjonene
står øverst i fila. Kort:

```
# Sone
## Kategori
### Navn ★
- sted: breddegrad, lengdegrad
- gater: …
Notat.
```

Områdeskisser, gater og gåturer tegnes i `data/<by>-geometri.geojson` (f.eks. i
[geojson.io](https://geojson.io)) med `navn` lik stedets navn og `type` = `område`,
`gate` eller `rute`. Se HANDOVER.md punkt 4 for detaljer.

## Ny by

1. Legg til en linje i `byer.json`.
2. Kopier `data/oslo.md` og `data/oslo-geometri.geojson` og fyll ut frontmatter.
3. Kopier `london/index.html` til `<by>/index.html` og bytt `data-by`.

## Lokal kjøring

`fetch()` blokkeres ved åpning fra `file://`. Kjør i stedet:

```
cd byguider
python3 -m http.server
```

og åpne `http://localhost:8000` (forside) eller `http://localhost:8000/london/`.

## Publisering

GitHub Pages: Settings → Pages → Deploy from a branch → `main` / `(root)`.
