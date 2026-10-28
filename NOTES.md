# NOTES — løpende status

Kort og oppdatert. Varig teknikk, datamodell og design står i HANDOVER.md; arbeidsregler i CLAUDE.md.
Oppdateres ved slutten av hver økt (`/avslutt`).

## Status nå

Sist oppdatert: 28. oktober 2026.

- Live på https://stam.pe/byguider/ med seks byer: London (215 oppføringer, hvorav 94 på ønskelista), Oslo (128, 22 på ønskelista), New York (77), Nice (67), Tokyo (53), Bangkok (36, 2 på ønskelista).
- Appen er i hovedsak ferdig: MapLibre med papirpalett og mørk modus, nabolag med omriss, kjerne og gater,
  flyttbar infoboks, gåturer i infoboksen, ønskeliste for alle, norsk og engelsk.
- Arbeidet nå er data: nye steder, favoritter, beskrivelser og nabolagsomriss. 18.10. fikk Oslo
  nabolagene Fredensborg, St. Hanshaugen, Grünerløkka, SoSoPa, Kampen og Gamlebyen, og London
  fikk Marylebone-butikker, jazzklubber og muséer.
- 18.10. ble nabolagsomrissene i London, New York og Nice gjort presise: offentlige grenser der de finnes
  (Londons conservation areas; New Yorks NTA 2020 og historiske distrikter), ellers grensegater sporet i OSM.
  London: 18 av 43 tegnet om, resten fulgte allerede gatene. New York: alle 10. Nice: begge.
  `kilde` i hver feature sier hvor omrisset kommer fra. `arkiv/` er fjernet fra repoet.
- 24.10. vedlikeholdsøkt: 90 nettsider oppgradert til https, ønskeliste-kommentaren i byfilene rettet,
  alle miniatyrer (byguider og stam.pe) tatt på nytt i lys og mørk. Oslo-omrissene er gjort presise
  (grensegater sporet i OSM fra kryss til kryss); nå har alle byer `kilde` på hvert omriss.
- 24.10. også: korte beskrivelser for 43 nabolag, Nice har området som første linje som de andre byene,
  og alle guidene har «En høyst subjektiv guide» / «An opinionated guide» under tittelen (kicker i frontmatter);
  forsiden har «Høyst subjektive byguider» / «Opinionated city guides».
- 24.10. kveld: Tokyo publisert (PR #58). 18 nabolag i sonene Central, West og East, 54 oppføringer.
  Omrissene er de offisielle chōme-grensene fra e-Stat (folketellingen 2020), slått sammen per nabolag.
  Kjerner i blant annet Tomigaya og Yanaka følger gatene. Gatene kommer fra OSM, blant annet Yanaka-firkanten
  (Yanaka Ginza via Yūyake Dandan, Gotenzaka, Hatsune-no-michi, Sansakizaka, Yomise-dori), Cat Street,
  Udagawa-promenaden og smågatene i Minami-Aoyama 5. Miniatyrer i lys og mørk.
  Senere samme kveld: Keyakizaka og hotellet Park Hyatt fjernet, Marunouchi og Yurakucho er favoritter.
- 24.10. også: byguide-forsiden har «Byguidene er lagret på denne enheten · Slett» ved «Lagre alle byene»
  (PR #59 og #60). Slett gjelder bare byguidene; «Slett alt» ligger på stam.pe-forsiden.
- 28.10.: Bangkok publisert (PR #62). Nabolagene ble definert ut fra Påls lagrede liste i Google Maps
  (delt liste, lest med `maps/preview/entitylist/getlist`). Ni nabolag i sonene Old Town & River (Rattanakosin, Talat Noi,
  Charoen Krung), Central (Silom, Sathorn, Pathum Wan), North (Ari) og Sukhumvit (Thonglor). Omrissene er kvartaler
  og distrikter (khwaeng/khet) fra OSM der de passer; Talat Noi tar med Song Wat-stripa mellom elva og Sampheng,
  og Ari og Thonglor er sporet langs gatene. Gatekunsten i Talat Noi er markert i Soi Charoen Krung 22.
  Miniatyrer i lys og mørk.
- 28.10. også: markerte gater vises hele tiden (PR #63). Nabolag er lyse firkanter med kobberkant, litt større
  enn stedene og øverst, og klyngene har fyll i kartets bakgrunnsfarge (PR #64). Nabolagene slås aldri sammen
  i klynger, så de vises på alle zoomnivåer (PR #65). Miniatyrer tatt på nytt overalt,
  og stam.pe-forsiden nevner nå Tokyo og Bangkok.
- 28.10. kveld, mobil og forside (PR #66–#73): byguide-forsiden har lengre ingress og byene står uten land
  og beskrivelse (feltene er fjernet fra byer.json); på Mac står byene i to kolonner. Markerte gater er tynne
  og svake når hele byen vises og får full styrke rundt zoom 13. Liggende mobil har menyen ved siden av kartet
  som på Mac, og iPhone forstørrer ikke teksten når telefonen ligger. Stående mobil har knappen «Liste ↓»
  nederst til venstre i kartet. Publiseringen setter kjøringer i kø i stedet for å avbryte dem, og
  `pkill -f .claude/server.sh` stopper den lokale serveren igjen.
- Ingen åpne grener utenom `main`.

## Neste steg

- Fyll på data etter hvert som Pål kommer med steder og navneendringer, i alle byer.
- Tokyo: flere notater er bare én linje («Sushi.», «Bar.», «Moderne vietnamesisk.»). Fyll på når Pål har tekst.
  Bar Penguin, Apollo Bar, Kihara, Ăn Đi og Kosho SamenoHa mangler nettside.
- Bangkok: notatene er korte utkast (mange bare «Kafé.»/«Galleri.»). Fyll på når Pål har tekst. Mangler nettside: some time blue cafe,
  Charoen 43, Siwilai Store og Sarnies Roastery (bare Linktree). Homu (Charoen Krung 44) finnes ikke lenger på adressen; en «HOMU» ved
  Sathorn/Lumphini kan være samme sted. Balzac har nesten samme adresse som Charoen 43 Art & Eatery; sjekk om Charoen 43 er borte.
- Slett på byguide-forsiden er testet i Chromium, ikke i Safari på Mac. Pål sjekker der.
- Nye nabolag trenger alltid et presist omriss i `data/<by>-geometri.geojson`; fremgangsmåten står i CLAUDE.md, Data.
- Mulig etterarbeid: de 25 London-omrissene som ble beholdt (bl.a. Marylebone, Mayfair, Belgravia, Richmond, Kew Green)
  kan sjekkes mot conservation areas på samme måte hvis Pål ser noe som ikke stemmer.
- Oppdater miniatyrene når en by endrer utseende merkbart (CLAUDE.md, Miniatyrer).
- Kart: på mobil ligger nabolagsfirkantene tett på laveste zoom i London. Se om det trengs noe (f.eks. mindre
  firkanter ved lav zoom) når Pål har brukt det en stund. Å skjule steder under nabolagene er prøvd og forkastet.
- KML-eksport for Google My Maps-sporet: scopet i [scope-kml.md](scope-kml.md) (forslag: `?kml` i appen, test med London). Venter på svar fra Pål på de åpne spørsmålene nederst der.
- Sjekk på iPhone at teksten ikke lenger forstørres når telefonen ligger (kan ikke testes i Chromium).

## Åpne spørsmål

- Hrímnir – Fredensborg ligger øst for Maridalsveien (ved Vulkan), utenfor Fredensborg-omrisset.

## Beslutningslogg

- 2026-10-28: Bangkok-nabolagene ble definert ut fra Påls lagrede steder i Google Maps. Bangkok har ingen offisielle nabolag,
  så kvartalene (khwaeng) og distriktene (khet) brukes der de passer, ellers gater sporet i OSM.
- 2026-10-28: Song Wat Road skal ligge inni Talat Noi, så nabolaget tar med stripa mellom elva og Sampheng (Soi Wanit 1).
- 2026-10-28: Nye byer kan bygges fra Påls delte lister i Google Maps (oppskrift i CLAUDE.md, Data).
- 2026-10-28: Markerte gater vises hele tiden, ikke bare når nabolaget er valgt.
- 2026-10-28: Nabolag er lyse, større firkanter og slås aldri sammen i klynger, så oversikten viser alle nabolag.
  Første forsøk med mørke firkanter utenfor klyngene ble rotete; med lyse firkanter og dempede klynger går det.
  Å skjule steder inni nabolag (eller bare under ikonet) ble prøvd og forkastet: like steder vises da ulikt, og byer
  med få nabolag (Nice) skal vise alt. Firkanten får heller ligge oppå en klynge. Navnet vises fra zoom 12.
- 2026-10-28: Gater markeres som én enkel strek (ikke begge kjørebaner), og bare de som er verdt å gå: i Pathum Wan Lang Suan og Soi Ton Son.
- 2026-10-28: Forsiden viser bare bynavnet. Ingressen sier det beskrivelsene og landene sa, og landene er opplagte.
- 2026-10-28: På Mac står byene i to kolonner med samme rader som på mobil. Kort-rutenett (bilde over navn) ble prøvd,
  men to kolonner ligner mobilen og passer guidebokstilen bedre.
- 2026-10-28: Liggende mobil får menyen ved siden av kartet. Stående oppsett ga et kart som fylte skjermen.
- 2026-10-28: Stående mobil får knappen «Liste ↓» i kartet. To-finger-panorering (cooperativeGestures) ble vurdert,
  men gjør kartet tregere å bruke.
- 2026-10-28: Publiseringen setter kjøringer i kø (cancel-in-progress: false). En avbrutt kjøring stoppet ikke
  opplastingen hos Pages, så neste feilet når fletting og sletting av grenen kom samtidig.

- 2026-09-27: Flerbys-arkitektur med én app.js og stubbmapper per by, og Leaflet → MapLibre. Grunnen var at én kodebase skal betjene alle byene, og at CARTO fases ut raster.
- 2026-10-05: Lokale økter bruker localhost i stedet for forhåndsvisningen. Det er raskere, og ingen push trengs.
- 2026-10-16: Ønskelista vises for alle, ikke bare med `?onskeliste`.
- 2026-10-17: Gåturer bruker den vanlige infoboksen, og det faste rutekortet er fjernet. Da blir oppførselen lik for alt.
- 2026-10-17: Nabolagsikonet ligger midt i kjernen, ellers midt i området, ikke på `sted:` fra Google.
- 2026-10-18: Løpende status flyttes fra HANDOVER.md (punkt 2 og 8) til NOTES.md. HANDOVER.md blir referanse.
- 2026-10-18: De to EKSEMPEL-oppføringene i London (Hermanos Coffee Roasters og WWT London Wetland Centre) er fjernet.
- 2026-10-18: KML-eksport er fortsatt aktuelt, men skal scopes før vi setter i gang.
- 2026-10-18: Notatet om å rette eksempel-linjene i geojson er utdatert. De to linjene (én gate, én gåtur) lå i den opprinnelige london.geojson fra 20.9. og finnes ikke lenger.
- 2026-10-18: «Tips til nabolag i London.md» er slettet. Innholdet ligger i data/london.md, og Pål har notert de få tipsene som ikke kom med.
- 2026-10-18: «Claude outputs/github-pages-oppsett-reiseplanlegger.md» er slettet. Den var en kopi av et utdatert oppsettnotat fra reiseplanlegging.
- 2026-10-18: Nabolagsomriss skal være presise i alle byer: offentlige grenser først, ellers grensegater sporet i OSM, med `kilde` i hver feature. Fremgangsmåten står i CLAUDE.md.
- 2026-10-18: West Village i New York følger byplankontorets NTA-grense, selv om den er smalere i øst enn den gamle skissen (som gikk til 6th Ave).
- 2026-10-18: `arkiv/` med den gamle London-prototypen er fjernet. Pål flyttet filen ut av repoet.
- 2026-10-24: Oslo-omrissene følger grensegatene i OSM. Oslo har ingen offentlige nabolagsgrenser (bydelene er for store),
  så skissenes grensegater og Wikipedia-definisjonene ble brukt. St. Hanshaugen slutter nå ved Bergstien og Stensberggata
  (uten Fougstads gate-kilen og Pilestredet park-lobben), og kjernen har Hallings gate inni. Gamlebyen går til
  Tøyenbekken/Klosterenga i nord, og kjernen ligger mellom bekken og Hovedbanen. Fredensborg tar med nordsiden
  av Fredensborgveien. Grünerløkka og SoSoPa fulgte allerede gatene og fikk bare `kilde`.
- 2026-10-24: Nice har fire soner: Vieux-Nice, Le Port (Le Petit Marais, Garibaldi), Centre (Carré d'Or, Centre-ville,
  Musiciens, Gambetta, Promenade des Anglais) og Around Nice (Cimiez, Libération, Cap Ferrat, Èze, gåturene).
- 2026-10-24: Undertittelen er «En høyst subjektiv guide» / «An opinionated guide», i kursiv under tittelen.
- 2026-10-24: Harper (Nice) får ikke Google-lenke (finnes ikke i Google Maps). Brixton Village beholder markedets Place ID.
- 2026-10-24: Tokyo-omrissene bygger på chōme-grensene fra e-Stat. Japan har offisielle grenser helt ned på kvartalsnivå, og de er mer presise enn gategrenser fra OSM.
- 2026-10-24: «Meguro» i Tokyo er lagt inn som Nakameguro (hipsterområdet langs Meguro River). Yurakucho er eget nabolag ved siden av Ginza.
- 2026-10-24: Tomigaya tar med Kamiyama-chō, slik at gatene ned mot Shibuya ligger inni. Kjernen er kilen der butikkene og kaféene ligger.
- 2026-10-24: Gater vises bare der de er verdt å gå. Inokashira-dori (Tomigaya) og Keyakizaka (Roppongi) ble fjernet fordi de er trafikkerte.
- 2026-10-24: Offline-lagring tilbys både på stam.pe («Lagre alt») og på byguide-forsiden («Lagre alle byene»), hver med sin Slett. Byguide-forsiden kan være egen hjemskjerm-app med eget lager på iPhone, og delte lenker går dit. Slett der sletter bare byguidene og viser ikke MB, siden nettleseren bare oppgir tallet for hele stam.pe.
