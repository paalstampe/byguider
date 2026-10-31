# NOTES — løpende status

Kort og oppdatert. Varig teknikk, datamodell og design står i HANDOVER.md; arbeidsregler i CLAUDE.md.
Oppdateres ved slutten av hver økt (`/avslutt`).

## Status nå

Sist oppdatert: 31. oktober 2026.

- Live på https://stam.pe/byguider/ med seks byer: London (275 oppføringer, hvorav 114 på ønskelista), Oslo (131, 22 på ønskelista), New York (93, 2 på ønskelista), Nice (74, 3 på ønskelista), Tokyo (86, 7 på ønskelista), Bangkok (40, 4 på ønskelista).
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
- 28.10. sent: siden lastes på nytt når enheten bytter mellom lys og mørk modus, så kartet får riktig palett (PR #74).
- 30.10.: Berlin lagt inn som skjult by (`"skjult": true` i byer.json; forsiden og «Lagre alle byene» hopper over den),
  nås på stam.pe/byguider/berlin/. Elleve nabolag foreslått av Claude ut fra smaken i de andre guidene (ingen ★),
  i sonene Mitte & Prenzlauer Berg, Kreuzberg & Neukölln, Friedrichshain og West, pluss Orania.Berlin og fem markeder
  med åpningstider fra Google Maps. Omrissene er Berlins planleggingsrom (LOR 2021, gdi.berlin.de) slått sammen per
  nabolag; gatene er fra Detailnetz Berlin.
- 30.10. kveld: Berlin fikk 32 kaféer, barer og butikker plukket fra lokale guider (Mit Vergnügen, iHeartBerlin, Späti Stories,
  Tracks and the City, The Infatuation, visitBerlin, Highsnobiety) og sjekket i Google Maps. Mange tips i eldre guider var
  stengt (særlig i Graefekiez: Kaffeekirsche, Tosoni, Umbras, Frida, Minibar, Moeon) og er utelatt; Café im Literaturhaus er
  midlertidig stengt. Seks nabolag har fått «les:»-lenke til guiden stedene kom fra.
- 30.10.: London fikk nabolagene St John's Wood (med Panzer's Delicatessen og The Bank 102), Parsons Green,
  Clapham Old Town, Coal Drops Yard, Kew Green (lagt tilbake), Sydenham og Blackheath. Markerte gater: St John's Wood
  High Street og Circus Road, New King's Road (Parsons Green Lane–Bradbourne Street), Tranquil Vale, Montpelier Vale og
  Lee Road. På ønskelista: Forest Hill, Balham, Streatham Hill, Tooting, Wapping og Lower Clapton.
  Parsons Green og Kew Green følger conservation areas; Coal Drops Yard og Clapham er sporet i OSM; Sydenham, Blackheath
  og nabolagene på ønskelista er soner på 40–70 m rundt handlegatene.
- 30.10. også: Oslo fikk barene Bar Boca, Chair og Den Gamle Skobutikken. Tokyo fikk 33 steder fra Påls Google Maps-lenker
  (butikker og muséer i Aoyama, Omotesando, Ginza, Yanaka, Daikanyama m.fl., pluss Sensō-ji, Meiji Jingu, Omoide Yokocho),
  sju av dem på ønskelista. Central fikk Kaféer og Muséer og gallerier. Notatene er korte utkast skrevet av Claude.
- 30.10. også: New York fikk Park Slope tilbake (omriss fra NTA 2020, markert 5th og 7th Avenue), to hoteller (Mandarin Oriental,
  The High Line Hotel) og ti steder fra Påls lenker, blant annet Clover Club, Brooklyn Farmacy, Warren Street Mews og ICP.
  Brooklyn fikk Kaféer, Barer og Verdt en omvei; Glasserie er på ønskelista.
- 30.10. sent: Påls liste med nye steder. London fikk 44 steder (kaféer og butikker i Fitzrovia, Soho og Seven Dials, Firmdale-hotellene
  og The Kensington Hotel som ny kategori Hoteller, Notting Hill-stedene, Abbey Road, Bussey Building, Graffititunnelen m.fl.) og
  nabolaget Camberwell på ønskelista (omriss: conservation areas Camberwell Green og Camberwell Grove). Cecil Court og All Saints Road
  har gatestrek. Sartoria lå inne fra før. Bangkok fikk Kathmandu Photo Gallery, Tangible og nabolagene Ekkamai og Phra Khanong
  på ønskelista (soner på 60 m rundt gatene). New York fikk Crowley Vintage, Essex Market og Kabin; Nice tre kaféer på ønskelista.
- 30.10. sent: på stående mobil blir «Liste ↓» til «Kart ↑» og står fast nederst til venstre når kartet er rullet ut av syne (PR #76), godt inn fra den runde skjermkanten (PR #77).
- 31.10.: egen 404-side (kopi av den på stam.pe, PR #78). Ukjente adresser under stam.pe/byguider/ viste før GitHubs standardside.
  Endres 404.html, gjøres det i paalstampe.github.io og kopieres hit.
- 31.10.: Berlin heter nå «Pål og Heddas Berlin» (bare Berlin). 36 nye steder fra Heddas delte liste i Google Maps pluss COOP Anti-War Café
  og b-ware Ladenkino: kaféer og barer, muséer (DDR Museum, Designpanoptikum, Museum der Dinge, Synthesizer Museum, Stasi-museet m.fl.),
  kinoene Kino International, Delphi og Odeon, Modulor, Liquidrom, Spreepark. Ny kategori Restauranter (Burgermeister). Seks steder i lista
  lå inne fra før. Notatene er korte utkast skrevet av Claude. Lista ble lest med curl (getlist og maps/preview/place, uten nettleser).
- Ingen åpne grener utenom `main`.

## Neste steg

- Fyll på data etter hvert som Pål kommer med steder og navneendringer, i alle byer.
- Tokyo: flere notater er bare én linje («Sushi.», «Bar.», «Moderne vietnamesisk.»), og de 33 nye fra 30.10. er Claudes utkast.
  Fyll på når Pål har tekst. Nettsiden til Jimbocho Book Center svarte 503 30.10.; sjekk senere.
  Bar Penguin, Apollo Bar, Kihara, Ăn Đi og Kosho SamenoHa mangler nettside.
- Bangkok: notatene er korte utkast (mange bare «Kafé.»/«Galleri.»). Fyll på når Pål har tekst. Mangler nettside: some time blue cafe,
  Charoen 43, Siwilai Store og Sarnies Roastery (bare Linktree). Homu (Charoen Krung 44) finnes ikke lenger på adressen; en «HOMU» ved
  Sathorn/Lumphini kan være samme sted. Balzac har nesten samme adresse som Charoen 43 Art & Eatery; sjekk om Charoen 43 er borte.
- New York: notatene til de tolv nye stedene fra 30.10. er korte utkast (område, type, adresse). Fyll på når Pål har tekst.
- Stedene fra Påls liste 30.10. kveld (London, Bangkok, New York, Nice) har korte utkast til notater skrevet av Claude. Usikre: Azzurra
  («italiensk»), Monmouth Kitchen («italiensk og peruansk»), Tangible Bangkok (bare «Kafé»). Mangler nettside: Storyline, Tangible,
  Crowley Vintage, Bonjour Amour og SAVVA.
- Bangkok: Ekkamai og Phra Khanong er grove soner rundt gatene. Tegn dem presist (khwaeng eller grensegater i OSM) når de går av ønskelista.
- Slett på byguide-forsiden er testet i Chromium, ikke i Safari på Mac. Pål sjekker der.
- Nye nabolag trenger alltid et presist omriss i `data/<by>-geometri.geojson`; fremgangsmåten står i CLAUDE.md, Data.
- Mulig etterarbeid: de 25 London-omrissene som ble beholdt (bl.a. Marylebone, Mayfair, Belgravia, Richmond, Kew Green)
  kan sjekkes mot conservation areas på samme måte hvis Pål ser noe som ikke stemmer.
- London: omrissene for Sydenham, Blackheath, Forest Hill, Balham, Streatham Hill, Tooting, Wapping og Lower Clapton er
  grove soner rundt handlegatene. Tegn dem presist (grensegater i OSM) når Pål vil, særlig når et nabolag går av ønskelista.
- Oppdater miniatyrene når en by endrer utseende merkbart (CLAUDE.md, Miniatyrer).
- Kart: på mobil ligger nabolagsfirkantene tett på laveste zoom i London. Se om det trengs noe (f.eks. mindre
  firkanter ved lav zoom) når Pål har brukt det en stund. Å skjule steder under nabolagene er prøvd og forkastet.
- KML-eksport for Google My Maps-sporet: scopet i [scope-kml.md](scope-kml.md) (forslag: `?kml` i appen, test med London). Venter på svar fra Pål på de åpne spørsmålene nederst der.
- Sjekk på iPhone at teksten ikke lenger forstørres når telefonen ligger (kan ikke testes i Chromium).

## Åpne spørsmål

- Berlin: Heddas liste har også Schönhauser Allee (gate) og to adresser i Pankow (Florastraße 87, Tschaikowskistraße 47). Ikke lagt inn – skal de med, og som hva?
- Azzurra og Monmouth Kitchen: stemmer kjøkkenet i notatene (italiensk; italiensk og peruansk)?
- Hrímnir – Fredensborg ligger øst for Maridalsveien (ved Vulkan), utenfor Fredensborg-omrisset.
- St John's Wood: er «Bank» boutiquen The Bank 102 (102 High Street)? Ingen annen «Bank» funnet i gaten.
- Parsons Green: er New King's Road fra Parsons Green Lane til Bradbourne Street riktig bit å markere?
- Park Slope: skal 7th Avenue være markert i tillegg til 5th Avenue, eller bare 5th?

## Beslutningslogg

- 2026-10-31: Berlin-guiden heter «Pål og Heddas Berlin»; de andre byene heter fortsatt «Pål og Vibekes».
- 2026-10-31: Stående mobil får én knapp som bytter mellom «Liste ↓» og «Kart ↑» på samme plass. Fane som henger fast
  øverst tar plass hele tiden og ligner mer en app; lista som ark over kartet (som Google Maps) er en stor ombygging.
  Den faste knappen står 20 px inn og 24 px opp, fordi 10 px havnet i den runde skjermkanten på telefonen.
- 2026-10-30: Camberwell (ønskelista) følger conservation areas Camberwell Green og Camberwell Grove slått sammen, slik at
  både grønten med Church Street og Camberwell Grove kommer med.
- 2026-10-30: Ekkamai og Phra Khanong (Bangkok, ønskelista) er soner på 60 m rundt hovedgatene, som de andre nabolagene på ønskelista.
  Ekkamai overlapper Thonglors østkant, fordi Ekkamai Road er grensen der.
- 2026-10-30: London har fått kategorien Hoteller (Central og West). Sartoria lå inne fra før og ble ikke lagt inn på nytt.
- 2026-10-30: Park Slope lagt tilbake i New York med byplankontorets NTA-grense (Flatbush Ave–15th St, 4th Ave–Prospect Park West),
  som passer nabolaget. 5th og 7th Avenue er markert som de to handlegatene. Mandarin Oriental er lagt i Midtown (Columbus Circle).
- 2026-10-30: «Glapham (The Polygon-trekanten)» er lagt inn som Clapham Old Town med Polygon-trekanten som kjerne.
  Streatham Hill og Balham er to nabolag; «Wapping/Shadwell» er ett (Wapping, med Shadwell Basin).
- 2026-10-30: Blackheath bruker ikke conservation area, som dekker hele heia; omrisset er landsbykjernen rundt Tranquil Vale.
- 2026-10-30: En by kan skjules fra byguide-forsiden med `"skjult": true` i byer.json. Guiden virker som før på /<id>/.
- 2026-10-30: Nanzen-ji (Kyoto) tas ikke med i Tokyo-guiden.
- 2026-10-30: Meguro River og Yūyake Dandan har egen «Verdt en omvei»-oppføring i tillegg til gatestreken, fordi Pål ba om dem.
- 2026-10-30: Berlin-omrissene bygger på LOR-planleggingsrommene (Lebensweltlich orientierte Räume 2021), som følger kiez-grensene godt.

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
- 2026-10-28: Ved bytte mellom lys og mørk modus lastes siden på nytt. Å farge kartet om direkte ville kreve
  at stil, lag og ikoner tegnes på nytt. Omlasting er enklere, men kartutsnitt, infoboks og filtre nullstilles.
