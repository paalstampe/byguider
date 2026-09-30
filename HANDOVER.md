# Byguider — overlevering

Statusdokument for å ta prosjektet videre i en Cowork-økt.
Sist oppdatert: 30. september 2026 (mobilretting på grenen `mobil`).

---

## 1. Målet

En enkel nettbasert app som viser Påls byer — London først, så Nice og Oslo — på kart,
med nabolag, steder i flere kategorier (caféer, parker, butikker, markeder, gallerier)
og markerte gater og gåturer. Skal kunne deles via lenke uten innlogging.

Todelt strategi:

- **Webappen** — for planlegging, lesing og deling. Hostes på GitHub Pages.
- **Google My Maps** — parallelt spor for bruk i felt, siden My Maps-kart dukker
  opp i Google Maps-appen på mobil med navigasjon. Mates fra samme data via KML.

---

## 2. Hvor prosjektet står

Ferdig og live på `https://stam.pe/byguider/` (PR #1 fra `multi-by`, flettet 27.9.), jf. punkt 10:

1. `71cdfdd` Datadrevet app — soner, senter, zoom og titler fra `metadata`.
2. `055dfef` Flerbys-struktur — `byer.json`, forside, stubber, `data/london.geojson`.
3. `4eb6b97` Leaflet → MapLibre GL JS med CARTO Voyager vektorstil.
4. `852089e` Nice og Oslo som tomme byer.

Testet i headless Chromium mot attrapper av kartbibliotekene (CDN-ene var ikke
nåbare fra testmiljøet): lasting, filtre, søk, valg fra liste og kart, popup,
rutekort, tomme byer og forsiden. Visuelt verifisert 27.9. mot ekte MapLibre og CARTO via
raw.githack.com: London med markører, gåtur, rutekort og popup ser ut som før.

Gjenstår ellers:

- Finjustering av koordinatene i de to eksempel-linjene (grove skisser).
- Eventuelt KML-eksport for My Maps-sporet.

---

## 3. Filer

Arbeidskatalogen er den lokale klonen av repoet `paalstampe/byguider`:
`/Users/palstampe/Documents/GitHub/byguider/`. Dette er eneste gjeldende kopi.

```
byguider/
├── index.html              forside: lista over byer, bygges fra byer.json
├── app.js                  all logikk — én kopi for alle byer
├── style.css               all styling — én kopi
├── byer.json               manifest: id, navn, land, data (md), geometri, beskrivelse
├── london/index.html       stubb: <script src="../app.js" data-by="london">
├── nice/index.html
├── oslo/index.html
├── data/
│   ├── london.md                 kilden: steder, notater, soner, metadata
│   ├── london-geometri.geojson   områder, gater, gåturer (koblet på navn)
│   ├── nice.md / nice-geometri.geojson   tomme, metadata utfylt
│   └── oslo.md / oslo-geometri.geojson   tomme, metadata utfylt
├── arkiv/
│   └── london-map_1.html   gammel prototype, ikke i bruk
├── Tips til nabolag i London.md   råmateriale, kilden til London-dataene
├── README.md
└── HANDOVER.md             dette dokumentet
```

Ny by = én linje i `byer.json`, én md-fil (+ tom geometri-fil), én stubbmappe
(kopier `london/index.html` og bytt `data-by`).

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
tittel: Påls London                 frontmatter: tittel, undertittel,
senter: 51.5105, -0.1235            senter (breddegrad, lengdegrad), zoom, oppdatert
---
# Central                           sone — rekkefølgen her er rekkefølgen i appen
## Nabolag og gater                 kategori
### Marylebone Village ★            sted; ★ = favoritt
- sted: 51.5207, -0.1519            breddegrad, lengdegrad (som Google Maps)
- gater: Marylebone High Street, Chiltern Street
- google: <Place ID eller lenke>
Fri tekst = notat. Første avsnitt i lista, alt i popupen.
```

Kategorier (`##`): Nabolag og gater · Restauranter · Caféer · Barer · Muséer og gallerier ·
Butikker · Hoteller · Strender og beach clubs · Verdt en omvei · Gåturer. Overskriftene matches mot `KATEGORIER` i `app.js`
(navn, nøkkel og alias, uten hensyn til aksenter/store bokstaver). Ukjent kategori vises
med overskriften som navn og grå prikk.

`- utenfor: ja` holder et sted (eller en gåtur) utenfor utsnittet kartet åpner med og som
«Vis hele byen» går til — for strender, beach clubs og turer et stykke utenfor byen.

Gåturer har `lengde:` og `varighet:` som fritekst, og kan mangle tegnet rute
(rutekortet sier da «rute ikke tegnet»).

**Geometri: `data/<by>-geometri.geojson`**, redigeres i geojson.io. Hver feature har
`navn` (samme som `###` i md-fila) og `type`:

| type | geometri | vises |
|---|---|---|
| `område` | Polygon | lys flate med stiplet kant når nabolaget er valgt |
| `gate` | LineString | uthevet gate når nabolaget er valgt |
| `rute` | LineString | gåturens stiplede rute, alltid synlig |

Et nabolag uten `sted:` men med `område` får punkt midt i området. Klikk på nabolaget
(i lista eller kartet) viser område og gater og zoomer dit; klikk på tomt kart opphever.
Gategeometri kan hentes fra OpenStreetMap (Overpass) — Claude kan gjøre det på forespørsel.

Koordinatrekkefølge: **md-fila bruker breddegrad, lengdegrad** (Google-rekkefølge);
GeoJSON-fila bruker lengdegrad, breddegrad. Parseren snur md-koordinatene.

`Tips til nabolag i London.md` er råmaterialet London-fila ble bygd fra.

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
- `byer.json`: `land_en`, `beskrivelse_en` og evt. `navn_en`.
- `lengde`/`varighet` oversettes automatisk på engelsk (`ca. 1 t 45 min` → `approx. 1 h 45 min`,
  desimalkomma → punktum).
- Søket treffer både norsk og engelsk tekst uansett språk. Stedsnavn i bakgrunnskartet
  (CARTO) står på lokalspråket.
- Byttet tegner lista, filtrene, åpen popup og rutekortet på nytt uten å laste siden.

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
- Kort for valgt gåtur nede til venstre over kartet: 300 px bredt, hvit flate,
  1 px kantlinje, ingen skygge.

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
- To kilder: `steder` (punkter, klynger t.o.m. zoom 12, radius 14 px) med lagene `klynger`,
  `klyngetall` og `punkter` (symbol med kategoriikon), og `ruter` med `gater` og `gaaturer`.
  Filtrering bytter ut kildedataene (`setData`), slik at klyngene følger filtrene.
- Kategoriikonene tegnes på lerret ved oppstart: farget sirkel, papirkant, hvit glyf fra `IKONER`
  (SVG-stier i 24×24). Favoritter har samme størrelse, men en kobberring utenfor papirkanten
  (egne bilder `ikon-fav-<kategori>`).
- Kategorifargene ligger i `KATEGORIER` og oversettes til et `match`-uttrykk.
- Klyngetallet bruker CARTOs egen skriftstabel (`KARTSKRIFT`); andre skrifter finnes ikke
  på glyph-serveren.
- Ingen byggesteg, ingen rammeverk. Statiske filer.

Praktisk: `fetch()` blokkeres når sidene åpnes fra `file://`.
Kjør `python3 -m http.server` i `byguider/` og åpne `localhost:8000/london/`.

---

## 7. Publisering — GitHub Pages

Repoet `paalstampe/byguider` publiseres med Settings → Pages → Deploy from a branch →
`main` / `(root)`. Adresser:

- `https://paalstampe.github.io/byguider/` (forside) — evt. `stam.pe/byguider/`
- `…/byguider/london/`, `…/byguider/nice/`, `…/byguider/oslo/`

GitHub videresender git-trafikk fra det gamle repo-navnet, men **ikke** Pages-adressen:
`…/nabolag-london/` slutter å virke. Netlify er vurdert og valgt bort (kredittmåler).
Cloudflare Pages er et alternativ hvis CDN-hastighet blir viktig.

---

### Forhåndsvisning av grener

`.github/workflows/pages.yml` publiserer `main` på `stam.pe/byguider/` og hver annen gren på
`stam.pe/byguider/forhandsvisning/<gren>/` (f.eks. `…/forhandsvisning/kartstil/london/`), ett–to
minutter etter push. Slettede grener forsvinner ved neste publisering. Pages-kilden er
«GitHub Actions». Arbeidsflyt: data rett i `main`; kode på egen gren, sjekk forhåndsvisningen,
flett.

---

## 8. Neste steg

1. ~~Verifiser `multi-by` visuelt.~~ Gjort.
2. ~~Flett `multi-by` inn i `main`.~~ Gjort — PR #1, live på `stam.pe/byguider/`.
3. ~~Domenerestriksjon i CARTO.~~ Har vært på hele tiden: `stam.pe`, `*.stam.pe`, `paalstampe.github.io`.
4. Rett opp koordinatene i de to eksempel-linjene i geojson.io.
5. Fyll på data: London, Nice, Oslo.
6. Punkt 10.5: landingsside på `stam.pe`, kartstil mot papirpaletten, kartfunksjoner.
7. Vurder KML-eksport for My Maps-sporet.

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
  Domenerestriksjonen er på: `stam.pe`, `*.stam.pe`, `paalstampe.github.io`. Fra andre opphav
  (`localhost`, raw.githack.com) svarer CARTO uten CORS-header og kartet blir blankt — ikke en
  kodefeil. For lokal testing: fjern nøkkelen midlertidig i `app.js` (stilen svarer 200 uten nøkkel),
  og ikke commit det.

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

- `KATEGORIER` med farger. En café skal se lik ut i alle byer.
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
- ~~Navigasjon og filtre.~~ Gjort (grenen `navigasjon`): brødsmuler (stam.pe / Påls byguider /
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
- Neste: data. Pål kommer med navneendringer (som Marylebone High Street → Marylebone Village)
  og nye steder; områdeskisser tegnes etter hvert. Eksempelstedene er merket EKSEMPEL.
