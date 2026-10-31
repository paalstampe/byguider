# Byguider — overlevering

Referansedokument: mål, datamodell, design og teknikk. Løpende status står i NOTES.md.
Sist oppdatert: 4. oktober 2026 (New York som fjerde by, grenen `new-york`).

---

## 1. Målet

En enkel nettbasert app som viser Pål og Vibekes byer — London først, så Nice, Oslo, New York, Tokyo og Bangkok — på kart,
med nabolag, steder i flere kategorier (kaféer, parker, butikker, markeder, gallerier)
og markerte gater og gåturer. Skal kunne deles via lenke uten innlogging.

Webappen brukes både til planlegging og deling og i felt. Den hostes på GitHub Pages, kan lagres
offline, og «Åpne i Google Maps» i infoboksen åpner det ekte stedet (Place ID) i Google Maps-appen,
med åpningstider og navigasjon. Eksport til Google My Maps (KML) og til lister i Google Maps er vurdert
og droppet (31.10.2026): for omstendelig for andre å bruke.

---

## 2. Hvor prosjektet står

Se NOTES.md (Status nå). Historikken over hva som er bygget står i punkt 10.5.

---

## 3. Filer

Arbeidskatalogen er den lokale klonen av repoet `paalstampe/byguider`:
`/Users/palstampe/Documents/GitHub/byguider/`. Dette er eneste gjeldende kopi.

```
byguider/
├── index.html              forside: lista over byer, bygges fra byer.json
├── app.js                  all logikk — én kopi for alle byer
├── sw.js                   service worker: offline (se punkt 7, «Offline»)
├── style.css               all styling — én kopi
├── byer.json               manifest: id, navn, data (md), geometri, evt. bilde
├── apple-touch-icon.png    hjemskjerm-ikon (180×180): kobber «b» i Playfair Display på papir
├── bilder/<id>.webp        miniatyrer på forsiden (360×270), lages med .claude/miniatyrer.sh
├── london/index.html       stubb: <script src="../app.js" data-by="london">
├── nice/index.html
├── oslo/index.html
├── new-york/index.html
├── tokyo/index.html
├── bangkok/index.html
├── data/
│   ├── london.md                 kilden: steder, notater, soner, metadata
│   ├── london-geometri.geojson   områder, gater, gåturer (koblet på navn)
│   ├── nice.md / nice-geometri.geojson   tomme, metadata utfylt
│   ├── oslo.md / oslo-geometri.geojson
│   ├── new-york.md / new-york-geometri.geojson   soner Uptown, Midtown, Downtown, Brooklyn
│   ├── tokyo.md / tokyo-geometri.geojson         soner Central, West, East
│   └── bangkok.md / bangkok-geometri.geojson     soner Old Town & River, Central, North, Sukhumvit
├── README.md
└── HANDOVER.md             dette dokumentet
```

Ny by = én linje i `byer.json`, én md-fil (+ tom geometri-fil), én stubbmappe
(kopier `london/index.html` og bytt `data-by` og `apple-mobile-web-app-title` — navnet under
hjemskjerm-ikonet, f.eks. «London»; forsiden heter «Byguider»).

Mørk modus: følger enhetens innstilling. `@media (prefers-color-scheme: dark)` nederst i `style.css` bytter
variablene; i `app.js` velger `MORK` en mørk `KARTPALETT` (samme Voyager-stil, så offline-lageret er uendret)
og mørke utgaver av kobber, papir og tekst til kartlagene (`AKSENT`, `PAPIR`, `KORT`, `TEKSTFARGE`, `DEMPET`).
Nye farger i kartlagene skal bruke disse, ikke faste verdier. Fargene bakes inn ved oppstart, så bytter enheten modus
mens siden er åpen, lastes siden på nytt (lytter på `prefers-color-scheme` rett under `MORK`).

Ikke søkbar: forsiden og alle stubbene har `<meta name="robots" content="noindex, nofollow, noarchive">`
(stubben kopieres med den). KI-innsamlere stenges ute av `robots.txt` i `paalstampe.github.io`, som gjelder hele stam.pe.

Forsiden viser en miniatyr av åpningssiden foran hver by: `bilder/<id>.webp` som fast regel,
eller valgfritt felt `bilde` i byer.json. Samme oppskrift som landingssiden stam.pe: viewport
1300×900, deviceScaleFactor 2, beskåret til 1200×900 fra venstre og skalert til 360×270.
Hver by har også en mørk utgave, `bilder/<id>-mork.webp`, som forsiden viser i mørk modus
(mangler den, brukes den lyse). Skriptet lager begge.
Lag på nytt etter synlige endringer: `.claude/miniatyrer.sh` (alle) eller
`.claude/miniatyrer.sh https://stam.pe/byguider nice` (én by; tar bildet fra live-siden).
Vises 120×90 (96×72 i to kolonner over 900 px, 76×57 på mobil ≤ 600 px). Lista viser bare bynavnet. By med `status: "kommer"` eller uten bilde får tom ramme.

Designretningene ligger som artboards her:
https://claude.ai/artifact/StKKz6su1kLPBVyy4bZ9NN
(A = `Main.dc.html`, den valgte.)

---

## 4. Datamodellen

**Kilden er én markdown-fil per by: `data/<by>.md`.** Appen leser den direkte (ingen
byggesteg), så en commit — også fra GitHub i nettleseren — oppdaterer kartet.
Instruksjonene står som kommentar øverst i hver fil.

```
---
tittel: Pål og Vibekes London       frontmatter: tittel, undertittel,
senter: 51.5105, -0.1235            senter (breddegrad, lengdegrad), zoom, oppdatert
senter-mobil: 51.5230, -0.1060     valgfritt: startutsnitt på mobil (≤ 900 px) med zoom-mobil,
                                    i stedet for utsnittet med alle stedene (for vidt på smal skjerm);
                                    «Vis hele byen» går også dit på mobil
---
# Central                           sone — rekkefølgen her er rekkefølgen i appen
## Nabolag og gater                 kategori
### Marylebone Village ★            sted; ★ = favoritt
- sted: 51.5207, -0.1519            breddegrad, lengdegrad (som Google Maps)
- gater: Marylebone High Street, Chiltern Street
- google: <Place ID eller lenke>
Fri tekst = notat. Første avsnitt i lista, alt i popupen. `[tekst](https://…)` i notatet blir en lenke
(popupen; lista og søket bruker bare lenketeksten).
```

Kategorier (`##`): Nabolag og gater · Restauranter · Kaféer · Barer · Jazzklubber ·
Muséer og gallerier · Butikker · Hoteller · Strender og beach clubs · Verdt en omvei · Gåturer. Overskriftene matches mot `KATEGORIER` i `app.js`
(navn, nøkkel og alias, uten hensyn til aksenter/store bokstaver). Ukjent kategori vises
med overskriften som navn og grå prikk.

`- les: Financial Times | Tittel | https://…` gir «Artikkel fra Financial Times: Tittel» sist i infoboksen,
med tittelen som lenke (kan gjentas; uten kilde: «Artikkel: Tittel»).

`- utenfor: ja` holder et sted (eller en gåtur) utenfor utsnittet kartet åpner med og som
«Vis hele byen» går til — for strender, beach clubs og turer et stykke utenfor byen.

`- status: onskeliste` merker et sted som ikke besøkt ennå (ønskeliste). Slike steder vises for alle
(tidligere bare med `?onskeliste`, som nå ikke gjør noe), holdt utenfor hovedlista og tellingen:
sammenslått seksjon «Ikke besøkt ennå (n)» nederst
i lista (dempet, første linje av notatet; å åpne den viser stedene på kartet), egen kartkilde
uten klynging med ring-ikoner i dempet farge, og merkelappen «Ikke besøkt ennå» i infoboksen.
★ på et ønskelistested betyr førstevalg: «Førstevalg» / «Top pick» i lista (sortert øverst),
kobberfarget ring på kartet og «Ikke besøkt ennå · Førstevalg» i infoboksen.

Gåturer har `lengde:` og `varighet:` som fritekst, og kan mangle tegnet rute
(infoboksen sier da «rute ikke tegnet» og åpner midt i kartet).

**Geometri: `data/<by>-geometri.geojson`**, redigeres i geojson.io. Hver feature har
`navn` (samme som `###` i md-fila) og `type`:

| type | geometri | vises |
|---|---|---|
| `område` | Polygon | lys flate med stiplet kant, alltid synlig; kjernen (polygon nr. 2) blir mørkere der den ligger oppå |
| `gate` | LineString | kobberstrek, alltid synlig (`omrader-gater`); sterkere når nabolaget er valgt |
| `rute` | LineString | gåturens stiplede rute, alltid synlig |

Nabolagsknappen ligger midt i kjernen (polygon nr. 2) når den finnes, ellers midt i området (`punktInni`:
tyngdepunktet, eller punktet lengst fra kanten når tyngdepunktet havner nær kanten eller utenfor).
`sted:` brukes bare for nabolag uten omriss. Navnet står under
nabolagsikonet fra zoom 12 (`NABOLAGSNAVN_MINZOOM`). Klikk på nabolaget
(i lista eller kartet) uthever område og gater og zoomer dit; klikk på tomt kart opphever.
Gategeometri kan hentes fra OpenStreetMap (Overpass) — Claude kan gjøre det på forespørsel.
Nabolagsomriss bygger på offentlige kilder der de finnes, og ellers på gategrenser sporet i OSM; `kilde` i hver
feature sier hvilken: London — bydelenes conservation areas (planning.data.gov.uk); New York — byplankontorets
Neighborhood Tabulation Areas 2020 og Landmarks-kommisjonens historiske distrikter (NYC Open Data); Oslo — byleksikon
og kommunale kilder; Nice — ingen offisielle kvartalsgrenser for Carré d'Or/Le Petit Marais, så gategrenser;
Tokyo — de offisielle chōme-grensene fra folketellingen 2020 (e-Stat, «小地域» shapefiler per bydel), slått sammen
per nabolag; kjernene i Tomigaya og Yanaka følger gatene i OSM. Bangkok — kvartalene (khwaeng) og distriktene (khet)
som administrative grenser i OSM (Rattanakosin, Talat Noi, Charoen Krung, Silom, Sathorn, Pathum Wan); Song Wat-stripa
i Talat Noi, Ari og Thonglor er sporet langs gatene i OSM.

Koordinatrekkefølge: **md-fila bruker breddegrad, lengdegrad** (Google-rekkefølge);
GeoJSON-fila bruker lengdegrad, breddegrad. Parseren snur md-koordinatene.

### Språk: norsk og engelsk

Bryteren `NO / EN` står øverst til høyre i sidebaren og på forsiden. Valget huskes i
nettleseren (`localStorage`, nøkkel `byguider-sprak`) og speiles i adressen som `?lang=en`,
så en engelsk lenke kan deles direkte (`stam.pe/byguider/london/?lang=en`). Standard er norsk.

- Faste tekster: `TEKST` øverst i `app.js` (norsk og engelsk side om side). Elementer i `SKALL`
  merkes med `data-t`, `data-t-aria`, `data-t-title` eller `data-t-placeholder` og fylles av
  `oversettDom()`. Forsiden har sin egen lille `TEKST` i `index.html`.
- Kategorier: `en:` på hver kategori i `KATEGORIER`. Engelske overskrifter (`## Restaurants`)
  gjenkjennes også.
- Innhold i md-fila, alt valgfritt (mangler det, vises norsk):
  `tittel-en:` og `undertittel-en:` i frontmatter; `- navn-en:` for et engelsk navn;
  `- en:` for engelsk notat. `- en:` settes sist i oppføringen, og fri tekst etter den linja
  hører også til det engelske notatet (flere avsnitt og punktlister går fint).
- `byer.json`: evt. `navn_en`.
- `lengde`/`varighet` oversettes automatisk på engelsk (`ca. 1 t 45 min` → `approx. 1 h 45 min`,
  desimalkomma → punktum).
- Søket treffer både norsk og engelsk tekst uansett språk. Stedsnavn i bakgrunnskartet
  (CARTO) står på lokalspråket.
- Byttet tegner lista, filtrene, og åpen popup på nytt uten å laste siden.

## 5. Valgt designretning: A — redaksjonell

Typografi (Google Fonts):

- Display: **Playfair Display**, 500 og 700
- Brødtekst: **Work Sans**, 400/500/600

Farger:

| rolle | hex |
|---|---|
| bakgrunn (papir) | `#F7F4EE` |
| kartflate | `#EFEADF` |
| kort / input-flate | `#FFFDF8` |
| tekst | `#241F19` |
| dempet tekst | `#6B5D4A` |
| kantlinje | `#DCD2C0` / `#E0D8C9` |
| aksent (kobber) | `#8A5A2B` |
| aksent hover | `#63401D` |
| park | `#D6DFCB` |
| vann | `#B9C9CE` |

Layout (desktop 1440×900):

- Sidebar 440 px til venstre, kart fyller resten.
- Sidebar ovenfra: kicker i små caps → tittel i Playfair 40 px → søkefelt →
  filterknapper som rektangulære chips (44 px høye, 3 px radius) → tellerlinje
  med tynn skillelinje → liste med steder.
- Listeelementer er korte oppslag, ikke tabellrader: navn i Playfair 21 px,
  metalinje «Sone · Kategori · Status» i 13 px dempet, eventuelt notat i 14 px.
  Favoritter merkes med små caps i aksentfarge til høyre, ikke ikon.
- Gåturer bruker samme infoboks som stedene (flyttbar), festet på ruten.

Prinsipper som skiller A fra de andre: papirflate framfor hvitt, serif kun til
navn og titler, ingen skygger, ingen avrundede kort — kantlinjer og luft gjør
jobben. Nærmer seg en guidebok.

---

## 6. Teknisk retning

- **MapLibre GL JS** (v5, fra unpkg) for kartet. Krever WebGL.
- Kartstil: **CARTO Voyager** vektor (`basemaps.cartocdn.com/gl/voyager-gl-style/style.json`),
  omfarget ved lasting til papirpaletten (`KARTPALETT` + `STILREGLER` i `app.js`; reglene matcher
  Voyagers lag-id-er med regex, første treff vinner). `building-top` er slått av (ga mørk
  skyggekant på høy zoom). Attribusjonen kommer fra stilen.
  Omfargingen skjer i stil-JSON-en før første tegning (`fargeleggStil`, via
  `setStyle(KARTSTIL, { transformStyle })`), så den opprinnelige, lyse Voyager-stilen aldri blinker fram.
  `app.js` setter også papirfargen på `<html>` straks, før `style.css` er lastet.
  Kartflaten (`.maplibregl-canvas`) er skjult (`kart-venter`) til byens utsnitt er satt og kartbitene
  er lastet (høyst 0,8 s etter at lagene er lagt på), og tones så inn — ellers vises verdenskartet fra
  startposisjonen et øyeblikk når bydataene kommer etter stilen.
- Kilder: `nabolag` (nabolagsikonene, uten klynging), `steder` (punkter, klynger t.o.m. zoom 12, radius 14 px) med lagene `klynger`,
  `klyngetall` og `punkter` (symbol med kategoriikon), og `ruter` med `gater` og `gaaturer`.
  Filtrering bytter ut kildedataene (`setData`), slik at klyngene følger filtrene.
- Kategoriikonene tegnes på lerret ved oppstart: farget sirkel, papirkant, hvit glyf fra `IKONER`
  (SVG-stier i 24×24). Favoritter har samme størrelse, men en kobberring utenfor papirkanten
  (egne bilder `ikon-fav-<kategori>`).
- Nabolag skiller seg ut: lys firkant (kartets veifarge) med kobberkant og kobberglyf, litt større
  enn de runde ikonene (`firkant` i `lagIkon`). De har egen kilde uten klynging (`nabolag`, laget `nabolag-punkter`)
  og ligger øverst, så de vises på alle zoomnivåer. Ingenting skjules under dem; de kan ligge oppå en klynge.
- Klyngene har kobberring og fyll i kartets bakgrunnsfarge (`KARTPALETT.bakgrunn`), så de ikke popper.
- Kategorifargene ligger i `KATEGORIER` og oversettes til et `match`-uttrykk.
- Klyngetallet bruker CARTOs egen skriftstabel (`KARTSKRIFT`); andre skrifter finnes ikke
  på glyph-serveren.
- Ingen byggesteg, ingen rammeverk. Statiske filer.

Praktisk: `fetch()` blokkeres når sidene åpnes fra `file://`.
Kjør `.claude/server.sh` (bare 127.0.0.1, og `Cache-Control: no-store` så nettleseren alltid henter ferske data) og åpne `localhost:8000/london/` — kartet virker
lokalt med egen CARTO-nøkkel (se punkt 9).

---

## 7. Publisering — GitHub Pages

Repoet `paalstampe/byguider` publiseres med Settings → Pages → Deploy from a branch →
`main` / `(root)`. Adresser:

- `https://paalstampe.github.io/byguider/` (forside) — evt. `stam.pe/byguider/`
- `…/byguider/london/`, `…/byguider/nice/`, `…/byguider/oslo/`, `…/byguider/new-york/`

GitHub videresender git-trafikk fra det gamle repo-navnet, men **ikke** Pages-adressen:
`…/nabolag-london/` slutter å virke. Netlify er vurdert og valgt bort (kredittmåler).
Cloudflare Pages er et alternativ hvis CDN-hastighet blir viktig.

---

### Forhåndsvisning av grener

`.github/workflows/pages.yml` publiserer `main` på `stam.pe/byguider/` og hver annen gren på
`stam.pe/byguider/forhandsvisning/<gren>/` (f.eks. `…/forhandsvisning/kartstil/london/`), ett–to
minutter etter push. Slettede grener forsvinner ved neste publisering. Kjøringene står i kø
(`cancel-in-progress: false`), så fletting og sletting av grenen ikke kolliderer hos Pages. Pages-kilden er
«GitHub Actions». Arbeidsflyt: data rett i `main`; kode på egen gren, sjekk forhåndsvisningen,
flett.

På Påls Mac er GitHub CLI (`gh`) installert i `/usr/local/bin` (hentet fra GitHubs utgivelser —
Homebrew i `/usr/local` er for gammel for macOS 27) og innlogget; `gh auth setup-git` gjør at
git pusher med samme innlogging. Claude kan dermed pushe, åpne PR og flette lokalt.

### Offline

`sw.js` (service worker, registreres fra `app.js` og forsiden) gjør byguidene brukbare uten nett:

- Egne filer (sider, `app.js`, `style.css`, `data/*`, `byer.json`) hentes **nettet først** — med nett
  vises endringer straks som før. Uten nett, eller når nettet ikke svarer innen 4 s, brukes siste
  lagrede kopi. Ved installasjon lagres alle byenes sider, data og miniatyrer.
- Kart og biblioteker (CARTO-fliser, stil, glyfer, sprite, MapLibre fra unpkg, Google Fonts) tas
  **fra lageret først**; fliser eldre enn 30 døgn fornyes når det er nett.
- Lagring: `sw.js` får meldingen `{ type: 'lagre', stil, adresser, byer: [{ id, side, data, geometri }] }` og
  regner ut alt selv (`lagreByer`): stil, tiles.json, sprite, latinske glyfer og CARTO-fliser zoom 0–14 over
  alle koordinatene i byens md-fil og geometrifil (15 % marg, maks 1500 fliser). Kartet trenger ikke tegnes.
  Det som alt er lagret, hoppes over. Kartstilen lagres uten `?key=`, så forsiden (uten nøkkel) og byene deler den.
  Fremdrift og resultat sendes til alle åpne sider (`fremdrift`, `lagret`); sidene kaller `startMessages()`
  (Safari leverer ellers ikke meldingene).
  Sendes meldingen med en MessageChannel-port (som fra stam.pe), går svarene også dit — det er eneste
  sikre vei i Safari når avsendersiden styres av en annen service worker.
- Meldingen sendes når en by åpnes med nett (`forhandslastOffline()` i `app.js`, med det siden har lastet
  som `adresser`), og fra «Lagre alle byene for bruk offline» på forsiden (alle byene, én om gangen;
  `KARTSTIL` og MapLibre-adressene står der også — hold dem like `app.js`).
- Slett: på byguide-forsiden står «Byguidene er lagret på denne enheten · Slett» når kartlageret finnes. Den sletter
  bare lagrene `byguider-*`, service workeren for `/byguider/` og datoene `byguider-offline:*`.
  «Slett alt» (alle lagre på stam.pe, med plassbruk i MB) ligger på stam.pe-forsiden.
- Status: ved telleren i byen («Lagrer for bruk offline … 45 %», så «Tilgjengelig offline · 13. okt») og
  under hver by på forsiden. Datoen huskes i localStorage, nøkkel `byguider-offline:<sti><by>`.
- Størrelse 13.10.2026: ca. 105 MB for alle byene, London 75 MB — oppdater `lagreMerknad` i `index.html`
  hvis det endrer seg mye.
- iOS: hjemskjerm-app og Safari har hvert sitt lager; åpne/lagre i den man skal bruke. Sletter man
  hjemskjerm-appen, slettes også dens lager.
- Endres strategi eller lagerformat: øk `VERSJON` i `sw.js`, så slettes gamle lagre.
- Testet i Chromium med nett sperret og serveren stoppet: London med kart (også innzoomet), forsiden,
  og New York (ikke besøkt) med liste og steder, men uten bakgrunnskart.
  «Lagre alle byene» fra blank nettleser: alle fire byene lagret på ca. 25 s og åpner med kart uten nett.
  (Første versjon lastet hver by i en skjult iframe; den hang på iPhone og viste kartet — derfor gjør
  `sw.js` nå jobben selv.)

---

## 8. Neste steg

Se NOTES.md (Neste steg og Åpne spørsmål).

## 9. Notater om implementasjonen

- `app.js` starter seg selv: stubben laster den med `data-by="<id>"`; den henter fonter,
  `style.css` og MapLibre, bygger sidebaren (malen `SKALL`), slår opp byen i `byer.json`
  og laster datafila. Stier regnes relativt til `app.js`, så appen tåler å ligge i en undermappe.
- Kategoriene ligger i `KATEGORIER` øverst i `app.js`: navn, farge og ikon (nøkkel i `IKONER`).
  Ny kategori = én linje der (pluss evt. ny glyf i `IKONER`); filterknappen lages automatisk,
  og bare kategorier som finnes i dataene vises. Ukjent kategori får grå prikk-ikon.
- Sonefiltrene bygges fra `metadata.soner` + sonene i dataene, og skjules når byen ikke har soner.
- Lista grupperes på sone (når byen har soner), favoritter først, så alfabetisk.
- Popup lenker videre til Google Maps — på `place_id` når det finnes, ellers på koordinat.
- Lista virker selv om kartet ikke laster (f.eks. CARTO 403); lagene legges på når stilen er klar.
- Zoom i MapLibre er én lavere enn Leaflet for samme utsnitt. `metadata.zoom` for London er 11.
- CARTO-nøkkelen ligger som `CARTO_KEY` øverst i `app.js` og sendes med på stil-URL-en.
  To nøkler, valgt etter `location.hostname` (CARTO krever egen nøkkel for lokale opphav):
  publisert (`stam.pe`, `*.stam.pe`, `paalstampe.github.io`) og lokal (`localhost`, `127.0.0.1`).
  Fra andre opphav (raw.githack.com o.l.) svarer CARTO uten CORS-header og kartet blir blankt —
  ikke en kodefeil.

---

## 10. Spesifikasjon: flerbys-arkitektur og MapLibre

Besluttet 27. september 2026. Utføres på grenen `multi-by`.

**Status: trinn 1–4 er utført, verifisert og flettet inn i `main` (se punkt 2).**

Bakgrunn: oppsettet skal gjenbrukes for Nice og Oslo. Sluttbildet er at `stam.pe`
lenker til en samleside for byguidene, og at hver by ligger under den. Tre kopier
av samme kode er utelukket — feilretting og nye funksjoner må gjøres én gang.

CARTO har varslet at rasterkartene fases ut uten å sette dato. Siden det uansett
kommer kartfunksjoner (avkryssing av besøkte steder, egne ikoner, klynging,
rikere popups), tas MapLibre-byttet nå mens `app.js` er liten.

### 10.1 Målstruktur

Repoet døpes om fra `nabolag-london` til `byguider`. Gjøres før adressen er delt
bredt; GitHub setter opp videresending fra det gamle navnet.

```
byguider/
├── index.html              landingsside: London, Nice, Oslo
├── app.js                  all logikk — én kopi
├── style.css               all styling — én kopi
├── byer.json               manifest over byene
├── london/index.html       stubb: setter by-id, laster ../app.js
├── nice/index.html
├── oslo/index.html
└── data/
    ├── london.geojson
    ├── nice.geojson
    └── oslo.geojson
```

Mappene framfor `?by=london` gir delbare, bokmerkbare adresser
(`stam.pe/byguider/london/`). Prisen er en firelinjers stubb per by.

Ny by = én linje i `byer.json`, én GeoJSON-fil, én stubbmappe.

### 10.2 Gjør appen datadrevet — gjøres først

Dette er verdifullt uavhengig av hvilket bibliotek som tegner kartet, og gjør
MapLibre-byttet enklere fordi det da bare finnes étt sted å endre.

Ut av koden, inn i `metadata` i hver bys GeoJSON-fil:

- `soner` — i dag hardkodet som Central/North/South/East/West i `SONER`.
  London-spesifikt. Oslo har ikke soner; Nice har kanskje arrondissementer.
  Filteret skal bygges fra dataene, og skjules helt når lista er tom.
- `senter` — startkoordinat, i dag `[51.5105, -0.1235]` i `setView`.
- `zoom` — startzoom, i dag 12.
- `tittel` og `undertittel` — i dag hardkodet i `index.html`.

Blir liggende felles i `app.js`:

- `KATEGORIER` med farger. En kafé skal se lik ut i alle byer.
- All listelogikk, søk, sortering og sidebar. Denne delen rører aldri kartet
  og skal ikke endres av MapLibre-byttet.

Etter dette skal `app.js` ikke inneholde ordet London.

### 10.3 Leaflet → MapLibre GL JS

Må skrives om: kartinitialisering, tile-laget, markører, polylinjer, popups,
`fitBounds`, filtrering. Grovt 40 % av `app.js`.

Uberørt: datalasting, søk, listebygging, sidebar — den snakker aldri med Leaflet.

Tankegangen endres: i dag holdes ett Leaflet-lagobjekt per feature i `oppslag`,
og filtrering skjer ved å legge til og fjerne lag. I MapLibre pekes hele
GeoJSON-filen inn som én kilde, med ett `circle`-lag for punkter og ett `line`-lag
for ruter. Filtrering blir `setFilter` — ett kall, ingen objekthåndtering.
Kategorifargene flyttes fra `KATEGORIER`-oppslaget inn i et `match`-uttrykk
i lagdefinisjonen, men skal fortsatt ha `KATEGORIER` som kilde slik at farger
defineres étt sted.

Stil: `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json?key=...`
Samme nøkkel, samme domenerestriksjon. Nøkkelkravet er ennå ikke aktivt på vektor,
men nøkkelen skal ligge der uansett.

**Omfang: rent teknisk bytte.** Kartet skal se ut som i dag når jobben er ferdig.
Det er ferdigkriteriet. Tilpasning av kartstilen mot papirpaletten `#F7F4EE`
— dempede veifarger, bakgrunn mot papir — er en separat jobb etterpå, og er
den egentlige gevinsten ved vektor. Ikke bland de to.

Merk: MapLibre er rundt fem ganger større enn Leaflet og krever WebGL.
Uproblematisk på moderne maskiner.

### 10.4 Rekkefølge

1. Datadrevet app (10.2) — fortsatt Leaflet, fortsatt én by. Test.
2. Restrukturer til `byguider` med manifest og stubber (10.1). Test med London alene.
3. Bytt til MapLibre (10.3). Test.
4. Legg inn Nice og Oslo som tomme GeoJSON-filer med `metadata` utfylt.

Hvert trinn skal kunne committes for seg og fungere alene.

### 10.5 Etterpå

- ~~Landingsside på `stam.pe` som lenker til byguidene.~~ Finnes allerede i `paalstampe.github.io`.
- ~~Tilpass kartstilen til papirpaletten.~~ Gjort (grenen `kartstil`).
- ~~Egne ikoner per kategori, klynging.~~ Gjort (grenen `kartstil`).
- Avkryssing av besøkte steder: valgt bort foreløpig — `besokt` redigeres i dataene.
- ~~Kategorier og md som kilde.~~ Gjort (grenen `md-kilde`): sju kategorier + gåturer,
  md-fila er kilden, nabolag vises med områdeskisse + gater, klikk i kartet blar ikke i lista.
- ~~Navigasjon og filtre.~~ Gjort (grenen `navigasjon`): brødsmuler (stam.pe / Byguider /
  By) øverst i sidebaren og på forsiden; «Alle» først i sone- og kategorifiltrene, ett valg om
  gangen (trykk igjen = Alle), «Nullstill» fjernet; «besøkt» fjernet fra visning og data;
  «Zoom inn» i popupen (til området om det er tegnet, ellers bydelsnivå for nabolag og gatenivå
  for steder); byer med `"status": "kommer"` i byer.json vises dempet uten lenke (Oslo).
- Mobil (grenen `mobil`, 30.9.): navnelappen ved hover vises bare med ekte hover
  (`(hover: hover) and (pointer: fine)`) — på berøringsskjerm ga den etterlignede mousemove-en
  lapp på første trykk, iOS svelget klikket, og popupen kom på andre trykk oppå lappen. Popupen
  fjerner alltid lappen. Egen posisjon: med «Reduser bevegelse» slått på (vanlig på mobil) var
  pulsen helt av; nå en stillestående glorie som toner inn og ut.
- Liste → kart på mobil (grenen `liste-til-kart`, 30.9.): trykk i lista (≤ 900 px) blar opp til
  kartet med infoboksen/rutekortet åpen, som i Reiseplanlegging.
- Liggende mobil (PR #70, 28.10.): ≤ 900 px bred og ≤ 500 px høy får menyen i en kolonne på 320 px til
  venstre og kartet til høyre, som på Mac (`liggendeMobil` i app.js, samme spørring i style.css). Lista hopper
  ikke til kartet der. `-webkit-text-size-adjust: 100%` hindrer iPhone i å forstørre teksten.
- «Liste ↓» (PR #73, 28.10.): knapp nederst til venstre i kartet på stående mobil, ruller ned til menyen,
  siden kartet tar alle fingerbevegelser. Når kartets nederste kant er rullet ut av skjermen, blir den «Kart ↑»
  (klassen `til-lista--kart`, PR #76–#77): står fast 20 px inn og 24 px opp (pluss safe area), utenfor den runde
  skjermkanten, og ruller tilbake til kartet. Byttet styres av en scroll-lytter (`oppdaterTilListaKnapp`).
- Infoboks får plass (grenen `festive-faraday`, 4.10.): stikker popupen ut av kartet (lang tekst,
  lavt kart på mobil), forskyves kartet akkurat nok til at hele boksen synes (`faaPopupInn`);
  er den høyere enn kartet, vises toppen. Venter til en flyTo er ferdig.
- Infoboks unna kartknappene (grenen `nifty-noether-ep5o2q`, 4.10.): `faaPopupInn` regner også
  knappene øverst til venstre som hindring — boksen flyttes til høyre for dem, eller ned under dem
  hvis den ikke får plass i bredden.
- Sidepanelet ruller samlet på desktop (grenen `epic-mendel-vk2p30`, 5.10.): hele sidebaren har
  ett rullefelt (overskrift, søk og filtre ruller bort), tellerlinjen blir liggende øverst — som i
  Reiseplanlegging. Mobil uendret.
- Flyttbar infoboks (samme gren): popupen kan dras bort fra gatene (`flyttbarPopup`), med mus og
  touch. Forskyvningen er en transform på innholdet, så boksen følger stedet når kartet flyttes;
  spissen skjules, og boksen holdes innenfor kartet. Lenker/knapper drar ikke, og på touch ruller
  notatet i stedet for å dra. Ny popup starter på vanlig plass (`nullstillFlytt` — MapLibre
  gjenbruker innholdselementet, så forskyvningen må fjernes eksplisitt).
- Infoboks ved klikk fra sted til sted (grenen `kart-popup-klikk`, PR #30, 5.10.): popupen har
  `closeOnClick: false`. MapLibres egen lukking lyttet på samme klikk som stedet og lukket den nye
  infoboksen når man klikket rett fra ett sted til et annet (Williamsburg → Carroll Gardens ga bare
  omrisset). Klikk på tomt kart lukker nå popupen eksplisitt og opphever valget. Navnelappen
  vises ikke ved hover over stedet som allerede har infoboksen åpen.
- Forsidetekster (grenen `forside-undertekster`, PR #31, 5.10.): ingress «Byene slik vi bruker
  dem.», Nice «Det beste av Nice, uten turistfellene.», Oslo «Bord og barer vi kommer tilbake
  til.» — hentet fra en uflettet commit (`802e279`, jeg-form) og skrevet om til vi-form.
  6.10.: forsidetekst og undertittel er nå like for hver by — London og New York «Nabolag,
  gåturer og restauranter verdt en omvei.», Nice «Restauranter, kaféer og steder verdt en omvei.»,
  Oslo «Restauranter og barer, pluss litt annet.».
- Nabolag alltid synlige (grenen `oversikt-omrader`, PR #32, 5.10.): alle tegnede områder
  (større område og kjerne) har lys flate og stiplet omriss hele tiden (`OMRADELAG`, kilden
  `omrader`, følger filtrene); navn under ikonet fra zoom 13. Ingen infoboks før man klikker.
  Meatpacking stopper nå ved Tenth Ave og Gansevoort St; Park Slope er fjernet.
  Lokale økter bruker localhost, ikke forhåndsvisningen (CLAUDE.md).
- Gåturer i infoboksen (grenen `gaatur-infoboks`, 17.10.): det faste rutekortet nede til venstre
  er fjernet. Gåturer åpner den vanlige popupen — dermed flyttbar — der ruten ble klikket, eller
  fra lista på rutepunktet nærmest midten av ruteboksen (`ruteAnker`). Metalinjen er
  «Gåtur · lengde · varighet · sone».
- I felt (PR #79–#81, 31.10.): «Veibeskrivelse» i infoboksen (`veiLenke`: Google Maps dir-URL med
  `destination_place_id`, walking eller transit for `utenfor`, startpunktet for gåturer). «Nær meg» i
  `filter-status` (`settNaerMeg`): watchPosition, sortering etter `avstandTil` (haversine; linjer: nærmeste
  rutepunkt), `avstandTekst` med gangtid (luftlinje × 1,25, 80 m/min), egen prikk. `aapneHer`: har siden
  allerede tillatelse og du er innenfor utsnittet med alle stedene (± 0,02°), trykkes knappen for egen posisjon.
- Neste: data. Pål kommer med navneendringer (som Marylebone High Street → Marylebone Village)
  og nye steder. Områdeskisser: alle nabolag i London og New York er tegnet (London 5.10.,
  langs gatene i OpenStreetMap); nye nabolag trenger skisse. Eksempelstedene er merket EKSEMPEL.
