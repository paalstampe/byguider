# Byguider — arbeidsregler for Claude

Pål og Vibekes byguider (London, Nice, Oslo) på kart. Live på https://stam.pe/byguider/.
Les HANDOVER.md før større endringer — den har datamodell, design, teknikk og status.
Hold HANDOVER.md oppdatert når noe vesentlig endres (punkt 2, 8 og 10.5).

## Språk
- Svar Pål på norsk, direkte og konsist. Ikke forklar grunnleggende git- eller webbegreper.
- Commit-meldinger, PR-titler og -beskrivelser på norsk. Commit-stil: «Område: hva som er endret»
  (f.eks. «Mobil: valg i lista hopper opp til kartet med infoboksen åpen»).
- Kode: norske navn på variabler og funksjoner, som i resten av app.js.

## Arbeidsflyt
- Endringer som ikke trenger forhåndsvisning — data (data/*.md, data/*-geometri.geojson, byer.json)
  og dokumentasjon (CLAUDE.md, HANDOVER.md) — pushes rett til main, uten gren og PR.
- Kodeendringer (app.js, style.css, index.html, stubber, .claude/) på egen gren.
  Lokal økt: Pål ser endringene på localhost, ikke i forhåndsvisningen — grenen pushes først når den skal flettes.
  Skyøkt: push grenen; forhåndsvisningen er https://stam.pe/byguider/forhandsvisning/<gren>/london/
  (klar 1–2 min etter push, bygges av .github/workflows/pages.yml).
- Sjekk designet selv: .claude/skjermbilde.sh <url> <fil.png> 390 844 (mobil) og 1300 900 (desktop);
  legg til «hel» for hele siden. Tillatt: https://stam.pe/... og http://localhost:<port>/... (eller 127.0.0.1)
  (kjør python3 -m http.server 8000 --bind 127.0.0.1 først — gir rask sjekk før push). Virker i skyen og på Macen;
  på Macen kreves Node og Playwright (installasjon øverst i skriptet).
- Fletting: Kan du selv verifisere at alt er i orden (skjermbilder mobil + desktop, ingen JS-feil),
  åpne PR og flett uten å spørre. Er det noe Pål bør se på (designvalg, smak, usikkerhet), vis ham det
  (lokalt: localhost; sky: push grenen og oppgi forhåndsvisningen) og vent — flett når han sier ok.
- Lokal økt på Påls Mac: skal Pål se på noe, start serveren selv om den ikke kjører
  (python3 -m http.server 8000 --bind 127.0.0.1, i bakgrunnen) og åpne siden for ham med
  open http://localhost:8000/<by>/. Stopp serveren når han er ferdig. I skyøkter: bruk forhåndsvisningen.
- Lokal eller sky velges når Pål starter økta. Kode- og designarbeid går raskest lokalt på Macen;
  data og dokumentasjon går like bra i sky. Får du en kode- eller designoppgave i en skyøkt,
  si fra tidlig at den egner seg bedre lokalt (fortsett hvis Pål vil).
- GitHub sletter grenen automatisk ved fletting. Sjekk bare at den er borte (git ls-remote --heads origin);
  slett den selv bare hvis den likevel ligger igjen.
- Én endring per gren. Små, selvstendige commits.

## Teknikk (kort — detaljer i HANDOVER.md)
- Ingen byggesteg, ingen rammeverk, ingen npm. Statiske filer: index.html, app.js, style.css, byer.json.
- MapLibre GL JS v5 fra unpkg, CARTO Voyager vektorstil omfarget til papirpaletten (KARTPALETT/STILREGLER).
- CARTO_KEY i app.js velges etter vertsnavn: én nøkkel for stam.pe, *.stam.pe og paalstampe.github.io,
  én for localhost og 127.0.0.1. Fra andre opphav blir kartet blankt — det er ikke en feil.
  Ikke commit endringer i nøklene.
- Kategorier, farger og ikoner defineres ett sted: KATEGORIER og IKONER øverst i app.js.
- Faste tekster finnes på norsk og engelsk i TEKST i app.js (og egen TEKST i index.html).
  Nye UI-tekster skal alltid ha begge språk.
- Koordinater: md-filene bruker breddegrad, lengdegrad (Google-rekkefølge);
  GeoJSON bruker lengdegrad, breddegrad.
- Mobil (≤ 900 px) er like viktig som desktop. Hover-effekter bare under
  (hover: hover) and (pointer: fine). Respekter prefers-reduced-motion.

## Design (retning A — redaksjonell)
- Playfair Display til navn og titler, Work Sans til brødtekst.
- Papirflate #F7F4EE, tekst #241F19, dempet #6B5D4A, aksent kobber #8A5A2B.
- Ingen skygger, ingen avrundede kort — kantlinjer og luft. Skal ligne en guidebok.

## Data
- Én md-fil per by i data/. Format står som kommentar øverst i hver fil.
- ★ etter navnet = favoritt. Eksempelsteder er merket EKSEMPEL.
- Nye steder: finn koordinater og helst Google Place ID; si fra hvis du er usikker på plasseringen.
- Engelsk innhold via navn-en: og en: (valgfritt; mangler det, vises norsk).

## Ikke gjør
- Ikke rør arkiv/ eller «Tips til nabolag i London.md» (råmateriale).
- Ikke legg inn avhengigheter, byggeverktøy eller rammeverk.
- Ikke slett uflettede grener eller force-push uten at Pål ber om det.
