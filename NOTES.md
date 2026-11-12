# NOTES — løpende status

Kort og oppdatert. Varig teknikk, datamodell og design står i HANDOVER.md; arbeidsregler i CLAUDE.md.
Oppdateres ved slutten av hver økt (`/avslutt`).
Eldre status per dato og hele beslutningsloggen ligger i ARKIV.md (lastes ikke automatisk; grep der ved behov).

## Status nå

Sist oppdatert: 12. november 2026. Historikk per dato står i ARKIV.md.

- Live på https://stam.pe/byguider/ med seks byer: London (275 oppføringer, 114 på ønskelista), Oslo (132, 23), New York (94, 2),
  Nice (74, 3), Tokyo (86, 7), Bangkok (40, 4). Skjulte byer (`"skjult": true`): Berlin, Mexico City, Kairo og Luxor.
- Appen er i hovedsak ferdig: MapLibre med papirpalett og mørk modus, nabolag med presise omriss, kjerne og gater,
  flyttbar infoboks, gåturer, ønskeliste, «Nær meg», «Veibeskrivelse», «Del» med delingsside per sted, offline-lagring,
  norsk og engelsk. Mobil, liggende og nettbrett er testet (også i iOS-simulatoren).
- Arbeidet nå er data: nye steder, favoritter, notater, nabolagsomriss og åpningstider.
- Åpningstider: alle restauranter i Oslo, London og Nice har `åpent:` og `åpent-kilde:` (filteret «Åpent: Søndag · Mandag»,
  vises bare når valgt kategori har tider). `tidssone:` i frontmatter.
- Skyjobber: månedlig sjekk (1. hver måned kl. 06; stengte steder og nettsider, https://claude.ai/code/routines/trig_01DvX7PTCcLcRy2QmYL2Jrcj)
  og halvårlig tidssjekk (15.3. og 15.9.; `.claude/googlesjekk.py --tider`, https://claude.ai/code/routines/trig_012amhPG41tyfMW5ic5vLbG6).
- Publiseringen er felles for alle tre repoene (publiser.yml i paalstampe.github.io), hopper over uendret innhold og publiserer ikke dokumentasjon.
- Ingen åpne grener utenom `main`.

## Neste steg

- Åpningstider: kaféer og barer i Oslo, deretter New York, Tokyo, Bangkok og de skjulte byene (sett `tidssone:` i frontmatter). Tidene bør sjekkes et par ganger
  i året (sommerstengt, nye tider); den halvårlige tidssjekken (15.3. og 15.9.) gjør det.
- Gjøremål (Pål sa ja 5.11.): endre `oppstart.sh` i claude-oppsett så den i skyøkter tilbakestiller lokal `main` til
  origin/main når den har gått fra hverandre og ikke har egne commits som mangler på origin. 5.11. hadde skykopien
  67 commits hver vei og `pull --ff-only` feilet. Kjør `synk-repoer.sh` etterpå.
- Månedlig sjekk 2026-11-11 (733 nettsider; Instagram/Facebook hoppet over; Google-sjekk av 1030 steder gikk fra skyen):
  - Stengt for godt hos Google: Oslo, Pillefyken (fjernet 11.11.). Ingen med annen status eller ikke funnet.
  - Ødelagt nettside: London, V&A East Storehouse (404 på vam.ac.uk/east/storehouse; trolig https://www.vam.ac.uk/east/storehouse/visit, uendret siden 4.11.). Mexico City, Blanco Colima (404 på /es, forsiden svarer 200; uendret). Oslo, Berre Lekkert (berrelekkert.no): DNS finnes ikke fra skymiljøet, trolig nedlagt domene; ny sjekk neste gang.
  - Uklart (proxy/TLS i skymiljøet, trolig ikke brudd): Spence Bakery, Maltby Street, Old Spitalfields Market, Kudu Collective, Le Panier Gourmand, Maguchi Kazunari, TCDC, Jungsik, Mexico City: bibliotecacentral.unam.mx, bibliotecavasconcelos.gob.mx, palacio.inba.gob.mx, estudiodiegorivera.bellasartes.gob.mx, looseblues.mx; 500/520/402 hos Andreas Murkudis, UTVBKS og Hardcover. 403/429 (hoteller, museer m.fl.) regnes som usikre.
  - Videresender til annen adresse, ikke endret: Harraz, Café Lavery, Quentin, Beit Sabee, Das Neue Schwarz, Café Nín, Langt Langt Borte, Bellboy Berlin, Beauty & Essex, Oslo Fat City (til canva.site), Corinthia New York (bare portnummer/språkbane).
  - Oppdatert (301 til ny adresse): Mexico City, Catedral Metropolitana (til catedralmetropolitanacdmx.com).
- Fyll på data etter hvert som Pål kommer med steder og navneendringer, i alle byer.
- SMAK.md: Pål kan gi en liste over hoteller de liker godt; legg dem inn som eksempler under Hoteller.
  Oppdater profilen når Pål setter ★ eller sier hva han liker.
- Tokyo: flere notater er bare én linje («Sushi.», «Bar.», «Moderne vietnamesisk.»), og de 33 nye fra 30.10. er Claudes utkast.
  Fyll på når Pål har tekst.
- Bangkok: notatene er korte utkast (mange bare «Kafé.»/«Galleri.»). Fyll på når Pål har tekst. Mangler nettside: Charoen 43
  (bare Facebook) og some time blue cafe (bare Linktree).
- New York: notatene til de tolv nye stedene fra 30.10. er korte utkast (område, type, adresse). Fyll på når Pål har tekst.
- Stedene fra Påls liste 30.10. kveld (London, Bangkok, New York, Nice) har korte utkast til notater skrevet av Claude. Usikre: Azzurra
  («italiensk»), Monmouth Kitchen («italiensk og peruansk»), Tangible Bangkok (bare «Kafé»). Mangler nettside (finnes ikke i Google eller
  ved søk 4.11.): Storyline, Tangible, Bonjour Amour og SAVVA.
- Berlin: notatene til de sju restaurantene fra 31.10. er Claudes utkast. Sjekk stjerner og kokker (Horváth, Tulus Lotrek) når Pål har vært der.
- Bangkok: Phra Khanong er en grov sone rundt Sukhumvit Road og Soi 71. Tegn den presist når den går av ønskelista.
- Slett på byguide-forsiden er testet i Chromium, ikke i Safari på Mac. Pål sjekker der.
- Nye nabolag trenger alltid et presist omriss i `data/<by>-geometri.geojson`; fremgangsmåten står i CLAUDE.md, Data.
- Mulig etterarbeid: de 25 London-omrissene som ble beholdt (bl.a. Marylebone, Mayfair, Belgravia, Richmond, Kew Green)
  kan sjekkes mot conservation areas på samme måte hvis Pål ser noe som ikke stemmer.
- London: omrissene for Sydenham, Blackheath, Forest Hill, Balham, Streatham Hill, Tooting og Lower Clapton er soner rundt
  handlegatene. Prøvd tegnet etter kvartaler 4.11. uten at det ble bedre (se beslutningsloggen); la dem være med mindre Pål ser noe galt.
- Oppdater miniatyrene når en by endrer utseende merkbart (CLAUDE.md, Miniatyrer).
- Ny by eller navneendring: kjør `.claude/delingsbilder.sh` og legg og:-taggene i stubben (HANDOVER, «Ny by»).
- «Legg til på Hjem-skjerm» på en byside: ikonfilene (180×180, ett frimerke per by) er sjekket 4.11., men selve
  hjem-skjermen er ikke sett (Del-arket åpnet seg ikke i simulatoren). Pål kan prøve én by på telefonen.
- Et sted som bytter navn får ny lenke; delte lenker til det gamle navnet gir 404-siden.
- Kart: på mobil ligger nabolagsfirkantene tett på laveste zoom i London. Se om det trengs noe (f.eks. mindre
  firkanter ved lav zoom) når Pål har brukt det en stund. Å skjule steder under nabolagene er prøvd og forkastet.

## Åpne spørsmål

- Kairo/Luxor: Winter Palace (Luxor) står på ønskelista, stengt for restaurering til Mandarin Oriental åpner (ventet 2027).
  Gaddis & Co. (bokhandel siden 1907 i Winter Palace-arkaden) er utelatt fordi det er uklart om den er åpen under restaureringen.
  Villa Fayoum finnes ikke i Google Maps ennå; kartet viser landsbyen Tunis. Abydos og Nye Gurna mangler Place ID (koordinater fra kart).
  Al-Bairat er en stor landsbyenhet (hele vestbredden mellom elva og fjellet), ikke et lite strøk.
- Mexico City: «Baleia» og «Tortillería» fra Påls liste finnes ikke i Google Maps i byen. Hvilke steder er det
  (kanskje i en annen by, eller Molino El Pujol / Siembra Tortillería)? LINA og Gaba mangler kjøkkentype i notatet.
- Azzurra og Monmouth Kitchen: stemmer kjøkkenet i notatene (italiensk; italiensk og peruansk)?
- Hrímnir – Fredensborg ligger øst for Maridalsveien (ved Vulkan), utenfor Fredensborg-omrisset.
- St John's Wood: er «Bank» boutiquen The Bank 102 (102 High Street)? Ingen annen «Bank» funnet i gaten.
- Parsons Green: er New King's Road fra Parsons Green Lane til Bradbourne Street riktig bit å markere?
- Park Slope: skal 7th Avenue være markert i tillegg til 5th Avenue, eller bare 5th?

## Beslutningslogg

Hele loggen står i ARKIV.md. Nye beslutninger skrives her og flyttes dit ved neste opprydding.

- 2026-11-11: Kontekst spares ved oppstart: NOTES.md holdes under ca. 10 KB (/avslutt passer på det), eldre status og beslutninger ligger i ARKIV.md. Før lastet byguider ca. 57 KB (~15k tokens) i hver økt.
- 2026-11-11: Ingen Read-sperre på geojson eller app.js, siden de redigeres og Edit krever Read. CLAUDE.md sier at de leses i utsnitt.
- 2026-11-12: «Nå» fjernet fra Åpent-filteret (lite nyttig, sa Pål). «Nær meg» skjules når posisjonen er kjent og utenfor byen, der den ikke gjør noe nyttig (PR #119). Kommer tilbake først ved ny posisjon i byen, så posisjonen ikke følges hele tiden.
