---
name: ny-by
description: Lag en ny by i byguiden – byer.json, data-md, geometri, stubbmappe, delingsbilder, ikoner, miniatyrer og lansering. Bruk automatisk når Pål ber om en ny by eller guide (f.eks. «lag en guide for Paris», «legg til Lisboa»), eller skriver /ny-by <by>. Også når en skjult by skal gjøres synlig (lansering).
---

# Ny by i byguiden

Fast oppskrift for å legge til en by. Detaljene står i CLAUDE.md (Data, Miniatyrer) og HANDOVER.md («Ny by», punkt 3–4).
Les dem når et steg er uklart – denne skillen er sjekklisten, ikke fasiten.

## 0. Avklar (spør bare om det som mangler)
- Bynavn, id (små bokstaver, bindestrek: `new-york`), engelsk navn hvis det er annerledes (`navn_en`).
- Hvem guiden er for: tittel er «Pål og Vibekes <By>» med mindre Pål sier noe annet (Berlin: «Pål og Heddas Berlin»,
  Mexico City: «Pål, Vibeke og Heddas Mexico City»). Spør før delingsbildet lages, så filnavnet ikke må byttes senere.
- Kilde til steder: Påls tips, en delt liste i Google Maps (be om lenken), et notat i Obsidian, eller forslag fra deg
  (les da SMAK.md først). Obsidian-hvelvet ligger i `~/Vaults/Obsidian Vault/` (bare på Påls Mac): finn notatet med
  `find ~/Vaults -iname "*<by eller land>*"`. Påls steder får «Fra Påls liste» i notatet, så de skiller seg fra dine forslag.
- Soner (# overskrifter) hvis byen er stor; ellers ingen.
- Byen starter alltid **skjult** (`"skjult": true`) til Pål sier at den skal ut.

## 1. Gren
Stubb og bilder er kode → egen gren `ny-by-<id>`. Data og tekst kan ligge på samme gren her, siden det hører sammen.

## 2. Filer
1. `byer.json`: ny linje `{"id": "<id>", "navn": "<By>", "data": "data/<id>.md", "geometri": "data/<id>-geometri.geojson", "skjult": true}`.
2. `data/<id>.md`: kopier frontmatter og formatkommentaren fra den nyeste byen (f.eks. `data/berlin.md`). Sett tittel,
   undertittel, -en-variantene, kicker, `senter` (bredde, lengde), `zoom` og `oppdatert` (dagens dato).
   Sett også `tidssone` (IANA-navn, f.eks. `Europe/Berlin`), så «Åpent nå» regner i byens tid.
3. `data/<id>-geometri.geojson`: `{"type": "FeatureCollection", "features": []}` til nabolagene er tegnet.
4. `<id>/index.html`: kopier `london/index.html`. Bytt `data-by`, `<title>`, `apple-mobile-web-app-title` (bare bynavnet),
   `apple-touch-icon` (`../bilder/ikon-<id>.png`) og alle og:-taggene (url, tittel, bilde `deling-<id>.png`, alt).
   Behold `robots`-taggen.

## 3. Innhold
- Steder: slå dem opp i bolker med `slaopp.js` i denne mappa (les kommentaren øverst): ett kall per sted gir navn, område,
  koordinater, Place ID, vurdering, nettside, adresse og om stedet er stengt, uten å åpne hvert sted. 80–100 steder tar
  noen minutter. Sjekk at navn og område stemmer, og ta bare med stedets egen nettside (ev. Instagram) – fjern utm-parametre.
  Steder fra Pål som ikke finnes i byen, legges ikke inn: spør Pål og skriv dem under Åpne spørsmål i NOTES.md.
- Åpningstider for restauranter (og gjerne kaféer og barer): `- åpent:` og `- åpent-kilde:` (format i Oslo-fila og HANDOVER).
  Stedets egen nettside går foran Google, som ofte er utdatert; Google brukes når nettsiden mangler tider.
  `slaopp.js` gir Googles tider i feltet `tider` (allerede i `åpent:`-format). Lange lister kjøres med `start()`/`resultat()`
  (fire oppslag om gangen); `kjor()` bare for korte, siden javascript_tool gir opp etter 45 s. Nettsidene: `curl` først; sider som bygges
  med JavaScript (Wix, Squarespace) hentes med Playwright (`npm root -g`/playwright), også undersider som «Åpningstider»/«Info».
  Sett `åpent-kilde: nettside, <mnd. år>` / `Google, …` / `nettside og Google, …`. Steder Google melder som midlertidig
  stengt: `- åpent: midlertidig stengt` og si fra til Pål.
- Notatformat for steder (ikke nabolag og gåturer), som i New York – området er eget avsnitt, også på engelsk:
  ```
  Roma Norte

  Kort tekst. Adresse.

  - en: Roma Norte

  Short text. Address.
  ```
- Gåturer: tegn ruten som `rute` (LineString) i geometrifila. Fotruting fra OSM uten nøkkel:
  `curl -A "byguider/1.0" "https://routing.openstreetmap.de/routed-foot/route/v1/foot/<lng,lat;lng,lat;…>?overview=full&geometries=geojson"`
  (gir også lengden i meter). Velg punktene langs gatene du vil gå, start og slutt ved en stasjon.
- Nabolag: omriss for hvert nabolag i geometrifila, med presise grenser etter fremgangsmåten i CLAUDE.md
  (offentlige grenser først, ellers spor gatene i OSM). Sett `kilde` og `notat`. Fant du en god kilde,
  legg den til i HANDOVER, punkt 4, «Nabolagsomriss: kilder per by».
- Geometrifila: én feature per linje (som de andre byene), ikke `indent=2` med én koordinat per linje.
- Valideringshooken sjekker JSON/GeoJSON når du skriver filene; rett feil med en gang.

## 4. Bilder
- `.claude/delingsbilder.sh` lager `bilder/deling-<id>.png` og `bilder/ikon-<id>.png` (og forsidebildet på nytt).
- `.claude/miniatyrer.sh http://localhost:8000 <id>` for `bilder/<id>.webp` og `bilder/<id>-mork.webp` (lys og mørk) mens byen er skjult;
  ta dem på nytt fra stam.pe ved lansering.
- Bytter guiden tittel før den er delt (skjult by), kan delingsbildet beholde filnavnet. Etter lansering: nytt filnavn (CLAUDE.md).

## 5. Sjekk
- Start serveren (`.claude/server.sh`, i Desktop-appen «byguider» i launch.json) og åpne `http://localhost:8000/<id>/`
  (i skyøkt: forhåndsvisningen av grenen): kartet, sonene, nabolagene,
  infoboksen og lista, på mobil (390×844) og desktop (1300×900), lys og mørk modus, ingen JS-feil.
- Byen skal ikke vises på forsiden så lenge den er skjult, men nås direkte på `/<id>/`.
- Kjør /code-review og /simplify før fletting (se CLAUDE.md, Fletting) hvis app.js, style.css eller index.html er endret;
  er stubben bare en kopi av london/index.html, trengs de ikke (si det i PR-en). Flett når alt er i orden,
  eller vis Pål om noe er smak.

## 6. Lansering (når Pål sier at byen skal ut)
- Fjern `"skjult": true` i `byer.json`.
- Oppdater bylista der den er skrevet ut: `index.html` (og:description), CLAUDE.md (første avsnitt), HANDOVER.md (punkt 1),
  og stam.pe-forsiden i repoet `paalstampe.github.io` (tekst på norsk og engelsk).
- Kjør `.claude/delingsbilder.sh` på nytt (forsidens postkortbunke viser de synlige byene).
- Sjekk forsiden og stam.pe i lys og mørk modus etter publisering.

## 7. Til slutt
Før inn byen i NOTES.md (status og beslutningslogg) og ev. HANDOVER.md (filtreet i punkt 3).
