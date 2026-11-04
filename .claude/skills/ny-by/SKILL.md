---
name: ny-by
description: Lag en ny by i byguiden – byer.json, data-md, geometri, stubbmappe, delingsbilder, ikoner, miniatyrer og lansering. Bruk automatisk når Pål ber om en ny by eller guide (f.eks. «lag en guide for Paris», «legg til Lisboa»), eller skriver /ny-by <by>. Også når en skjult by skal gjøres synlig (lansering).
---

# Ny by i byguiden

Fast oppskrift for å legge til en by. Detaljene står i CLAUDE.md (Data, Miniatyrer) og HANDOVER.md («Ny by», punkt 3–4).
Les dem når et steg er uklart – denne skillen er sjekklisten, ikke fasiten.

## 0. Avklar (spør bare om det som mangler)
- Bynavn, id (små bokstaver, bindestrek: `new-york`), engelsk navn hvis det er annerledes (`navn_en`).
- Hvem guiden er for: tittel er «Pål og Vibekes <By>» med mindre Pål sier noe annet (Berlin: «Pål og Heddas Berlin»).
- Kilde til steder: Påls tips, en delt liste i Google Maps (be om lenken), eller forslag fra deg (les da SMAK.md først).
- Soner (# overskrifter) hvis byen er stor; ellers ingen.
- Byen starter alltid **skjult** (`"skjult": true`) til Pål sier at den skal ut.

## 1. Gren
Stubb og bilder er kode → egen gren `ny-by-<id>`. Data og tekst kan ligge på samme gren her, siden det hører sammen.

## 2. Filer
1. `byer.json`: ny linje `{"id": "<id>", "navn": "<By>", "data": "data/<id>.md", "geometri": "data/<id>-geometri.geojson", "skjult": true}`.
2. `data/<id>.md`: kopier frontmatter og formatkommentaren fra den nyeste byen (f.eks. `data/berlin.md`). Sett tittel,
   undertittel, -en-variantene, kicker, `senter` (bredde, lengde), `zoom` og `oppdatert` (dagens dato).
3. `data/<id>-geometri.geojson`: `{"type": "FeatureCollection", "features": []}` til nabolagene er tegnet.
4. `<id>/index.html`: kopier `london/index.html`. Bytt `data-by`, `<title>`, `apple-mobile-web-app-title` (bare bynavnet),
   `apple-touch-icon` (`../bilder/ikon-<id>.png`) og alle og:-taggene (url, tittel, bilde `deling-<id>.png`, alt).
   Behold `robots`-taggen.

## 3. Innhold
- Steder: Place ID og koordinater fra Google Maps etter oppskriften i CLAUDE.md (Data). Første linje i notatet er nabolaget.
  Sjekk at ingen er permanent stengt. Engelsk tekst i `en:`.
- Nabolag: omriss for hvert nabolag i geometrifila, med presise grenser etter fremgangsmåten i CLAUDE.md
  (offentlige grenser først, ellers spor gatene i OSM). Sett `kilde` og `notat`. Legg byens kilde til i CLAUDE.md-lista
  over kilder hvis du fant en god en.
- Valideringshooken sjekker JSON/GeoJSON når du skriver filene; rett feil med en gang.

## 4. Bilder
- `.claude/delingsbilder.sh` lager `bilder/deling-<id>.png` og `bilder/ikon-<id>.png` (og forsidebildet på nytt).
- `.claude/miniatyrer.sh` for `bilder/<id>.webp` og `bilder/<id>-mork.webp` (lys og mørk).

## 5. Sjekk
- Start serveren (`.claude/server.sh`, i Desktop-appen «byguider» i launch.json) og åpne `http://localhost:8000/<id>/`
  (i skyøkt: forhåndsvisningen av grenen): kartet, sonene, nabolagene,
  infoboksen og lista, på mobil (390×844) og desktop (1300×900), lys og mørk modus, ingen JS-feil.
- Byen skal ikke vises på forsiden så lenge den er skjult, men nås direkte på `/<id>/`.
- Kjør /code-review og /simplify før fletting (se CLAUDE.md, Fletting). Flett når alt er i orden,
  eller vis Pål om noe er smak.

## 6. Lansering (når Pål sier at byen skal ut)
- Fjern `"skjult": true` i `byer.json`.
- Oppdater bylista der den er skrevet ut: `index.html` (og:description), CLAUDE.md (første avsnitt), HANDOVER.md (punkt 1),
  og stam.pe-forsiden i repoet `paalstampe.github.io` (tekst på norsk og engelsk).
- Kjør `.claude/delingsbilder.sh` på nytt (forsidens postkortbunke viser de synlige byene).
- Sjekk forsiden og stam.pe i lys og mørk modus etter publisering.

## 7. Til slutt
Før inn byen i NOTES.md (status og beslutningslogg) og ev. HANDOVER.md (filtreet i punkt 3).
