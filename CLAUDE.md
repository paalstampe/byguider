# Byguider — arbeidsregler for Claude

Påls byguider (London, Nice, Oslo) på kart. Live på https://stam.pe/byguider/.
Les HANDOVER.md før større endringer — den har datamodell, design, teknikk og status.
Hold HANDOVER.md oppdatert når noe vesentlig endres (punkt 2, 8 og 10.5).

## Språk
- Svar Pål på norsk, direkte og konsist. Ikke forklar grunnleggende git- eller webbegreper.
- Commit-meldinger, PR-titler og -beskrivelser på norsk. Commit-stil: «Område: hva som er endret»
  (f.eks. «Mobil: valg i lista hopper opp til kartet med infoboksen åpen»).
- Kode: norske navn på variabler og funksjoner, som i resten av app.js.

## Arbeidsflyt
- Dataendringer (data/*.md, data/*-geometri.geojson, byer.json) kan gå rett i main når Pål ber om det.
- Kodeendringer (app.js, style.css, index.html, stubber) på egen gren. Push grenen, og oppgi
  forhåndsvisningen: https://stam.pe/byguider/forhandsvisning/<gren>/london/ (klar 1–2 min etter push,
  bygges av .github/workflows/pages.yml). Pål sjekker den på mobil og desktop før fletting.
- Åpne PR mot main når Pål er fornøyd, eller når han ber om det. Flett bare når han sier det.
- Slett grenen på origin rett etter fletting.
- Én endring per gren. Små, selvstendige commits.

## Teknikk (kort — detaljer i HANDOVER.md)
- Ingen byggesteg, ingen rammeverk, ingen npm. Statiske filer: index.html, app.js, style.css, byer.json.
- MapLibre GL JS v5 fra unpkg, CARTO Voyager vektorstil omfarget til papirpaletten (KARTPALETT/STILREGLER).
- CARTO_KEY i app.js er domenebegrenset (stam.pe, *.stam.pe, paalstampe.github.io). Fra localhost
  blir kartet blankt — det er ikke en feil. Ikke commit endringer i nøkkelen.
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
