# NOTES — løpende status

Kort og oppdatert. Varig teknikk, datamodell og design står i HANDOVER.md; arbeidsregler i CLAUDE.md.
Oppdateres ved slutten av hver økt (`/avslutt`).

## Status nå

Sist oppdatert: 11. november 2026.

- 9.11.: åpningstider i Oslo (PR #112). Alle 72 restauranter har `åpent:` og `åpent-kilde:`: tidene er fra egen nettside der de finnes
  (curl, eller Playwright for Wix/Squarespace), ellers Google (13 steder). Filteret «Åpent: Nå · Søndag · Mandag» toner ned stengte steder
  i kart, klynger og liste; infoboksen viser dagens/valgt dags tider og uka. «Nå» regner i `tidssone: Europe/Oslo`. «Kun favoritter» og
  «Nær meg» står i egen blokk «Vis». /ny-by tar med tidssone og åpningstider, og `slaopp.js` gir Googles tider i `åpent:`-format.
  11.11.: London (alle 114) og Nice (alle 30) har åpningstider for restaurantene, med `tidssone:` (Europe/London, Europe/Paris).
  Nettsiden for 72 i London og 13 i Nice, Google for resten.
  Le Séjour (Nice) står som stengt for godt hos Google, men er åpen ifølge Pål (Google er ofte utdatert i Frankrike).
  `slaopp.js` gjør fire oppslag om gangen uten pauser (`start()`/`resultat()` for lange lister): 8 steder på 0,7 s.
  Står Google på samtykkesiden, stopper `slaopp.js` og ber om å avvise informasjonskapsler først.
  10.11.: «Åpent» vises bare når valgt kategori har åpningstider (nå Restauranter), så butikker o.l. ikke ser åpne ut.
  Live og sjekket. Pillefyken er midlertidig stengt ifølge Google; Vesle Nektar har ikke åpnet.
- 8.11.: Kairo og Luxor («Pål, Vibeke og Heddas Kairo/Luxor») lagt inn som to skjulte byer, nås på stam.pe/byguider/kairo/ og /luxor/.
  Kairo: 90 oppføringer i sonene Zamalek & Garden City, Downtown, Islamsk & koptisk Kairo, Giza og Heliopolis & Maadi, med gåturene
  Downtown → Zamalek (4 km) og Al-Muizz → Sultan Hassan (3 km). Luxor: 31 oppføringer i sonene Østbredden, Vestbredden og Utenfor Luxor,
  med Sfinksalléen (3 km). Alt er Claudes forslag ut fra SMAK.md, sjekket i Google Maps (åpne, Place ID, vurdering); El Horreya,
  Villa Fayoum og Al Moudira kommer fra FT-artikler i Påls Obsidian (med `les:`). Notatene er Claudes utkast; ingen ★.
  Omriss: shiakhaene i OSM slått sammen (Garden City, Downtown med kjerne, Gamaliya, Darb al-Ahmar, Heliopolis/Al-Muntazah, Al-Bairat
  klippet mot Nilen), Zamalek er øya, Koptisk Kairo OSMs historiske distrikt, Luxor sentrum sporet langs gatene.
- 8.11.: Mexico City («Pål, Vibeke og Heddas Mexico City») lagt inn som skjult by (`"skjult": true`), nås på stam.pe/byguider/mexico-city/. 95 oppføringer i sonene
  Roma & Condesa, Centro & Juárez, Polanco & Chapultepec og Coyoacán & San Ángel, pluss gåturen Roma → Condesa (4,5 km, rutet
  til fots i OSM). 18 restauranter og Hotel Dama er fra Påls Obsidian-notat «Restauranter og hoteller Mexico» («Fra Påls liste»,
  de booket forrige gang er merket); resten er Claudes forslag ut fra SMAK.md, alle sjekket i Google Maps (åpne, Place ID, vurdering).
  Ni nabolag med omriss fra coloniene i OSM (admin_level 10); Centro Histórico er perímetro A, Coyoacán postnumrene 04000 + 04100.
  Notatene er Claudes korte utkast; ingen ★.
- 8.11.: zoom på mobil etter de nye mobilrammene (PR #93/#94) er sjekket i nettleserpanelet (390×844 og 844×390): stemmer.
  Stående mobilkart er uendret (58vh, min. 340 px), så Londons faste utsnitt (`zoom-mobil: 10.7`) viser det samme som før.
  Liggende og andre byer bruker `fitBounds` og tilpasser seg selv (sett London liggende og Tokyo stående). Ikke sett i simulatoren.
- 5.11.: publiseringen er samlet og gjort robust. Én felles workflow for alle tre repoene (publiser.yml i paalstampe.github.io),
  som hopper over uendret innhold, og dokumentasjon og .claude/ publiseres ikke lenger (`.gitattributes`). Verifisert i alle tre:
  en commit som bare endrer dokumentasjon gir ingen ny publisering. Detaljer under Neste steg og i beslutningsloggen.
- 4.11. kveld: publiseringen feilet gjentatte ganger fordi Pages regnet en publisering som pågående lenge etter at den var
  ferdig («in progress deployment … Please cancel <sha> first»), eller hang til tidsavbruddet. GitHub hadde hendelser med
  Actions og Pages samme kveld. Alle tre repoene har nå kø (`cancel-in-progress: false`), rydding av Pages-publiseringer som
  henger, og tre forsøk med 5 min pause (byguider #102, reiseplanlegging #32, paalstampe.github.io #22).
  Ryddingen kan tørrkjøres med `RYDD_TORR=1`, og `.claude/valider.sh` sjekker YAML og avviser dupliserte nøkler i JSON og YAML
  (byguider #103–#104, reiseplanlegging #33–#34, paalstampe.github.io #24–#25).
- 4.11. kveld: verktøyoversikten (claude-oppsett#1). `.claude/valider.sh` sjekker nå også filer endret i Bash
  (sed, skript): JSON/GeoJSON/Python som git ser som endret siden forrige godkjenning, og melder en ødelagt fil til den er rettet.
  Stop-hooken `sky-push.sh` har `onFailure: block`. CLAUDE.md: vent med `gh run watch` før skjermbilder av forhåndsvisningen,
  og kjør axe-core ved UI-endringer. `/doctor prompt-audit` er kjørt på reglene og funnene er rettet. Ferdig flettede lokale grener er slettet.
  Tilgjengelighet (PR #99): knappen «Ikke besøkt ennå» ligger i et listitem, siden #liste har role=list. Ellers ingen axe-brudd.
  `/ny-by` sier hvordan serveren startes lokalt, i Desktop og i sky (PR #100). Hooks: PR #98.
- 4.11.: Claude-oppsett. `.claude/launch.json` lar Claude-appen starte serveren i den innebygde nettleseren (8000 byguider,
  8001 reiseplanlegging, 8002 stam.pe). Hooks: `.claude/oppstart.sh` sjekker ved oppstart om repoet ligger bak eller foran origin
  (henter selv når det er trygt) og om /avslutt avviker fra claude-oppsett; `.claude/valider.sh` sjekker JSON/GeoJSON/Python
  etter hver filendring; `.claude/sky-push.sh` holder skyøkter igjen til committede endringer er pushet.
  Claude kjører /code-review og /simplify selv før fletting av kodeendringer.
  Ny skill /ny-by (`.claude/skills/ny-by/`) brukes automatisk når en ny by skal lages eller lanseres.
- 4.11.: månedlig skyjobb (routine, ukentlig fram til 11.11.) sjekker den 1. hver måned kl. 06 om steder har stengt for godt og om nettsider virker, og skriver
  «Månedlig sjekk <dato>» under Neste steg. Den retter bare flyttede nettsider selv. Styres på https://claude.ai/code/routines/trig_01DvX7PTCcLcRy2QmYL2Jrcj
- 11.11.: stengt-sjekken mot Google virker nå fra skyen: `.claude/googlesjekk.py` slår opp på Place ID via maps/preview/place
  (1030 steder på ca. 4,5 min, ingen blokkering). Felt 88[0] = «CLOSED» er «Permanently closed» (sjekket i nettleseren).
  Ny halvårlig skyjobb 15. mars og 15. september kl. 06 sjekker åpningstidene: den melder bare tider som er endret hos Google
  siden øyeblikksbildet (.claude/google-tider.json, grunnlag 11.11.), sjekker dem mot stedets nettside, retter `åpent:` og
  skriver «Tidssjekk <dato>» under Neste steg. Styres på https://claude.ai/code/routines/trig_012amhPG41tyfMW5ic5vLbG6 Våre tider avviker ofte fra Google uten at noe er endret (kjøkken/bar, bordsetninger).
- 4.11. kveld: Pål bekrefter at delingskortene vises i Meldinger. Nettsider lagt inn for Bar Penguin, Apollo Bar, Kihara, Ăn Đi,
  Kosho SamenoHa, Siwilai, Sarnies (sarnies.com) og Crowley Vintage (Instagram @crowley_vintage, én kilde).
  Jimbocho Book Center svarer igjen. Charoen 43 finnes fortsatt (Time Out omtaler et marked der i april 2026); Homu er ikke i dataene.
  Nye omriss: Wapping følger nå Themsens bredd (OSM-elveflaten), Ekkamai er kvartalene øst for Soi 63 og gaten selv, inntil Thonglor.
  iPad-rotasjon og pinch i Reiseplanlegger testet i simulatoren tidligere samme dag, uten feil.
- 4.11.: testet i iOS-simulatoren (Xcode er nå installert; CLAUDE.md sier når simulatoren brukes).
  Liggende iPhone: kartet går helt ut til skjermkantene (`viewport-fit=cover`, PR #93). Før lot Safari 68 pt stå
  tomt på hver side. Liggende-oppsettet gjelder nå uten breddegrense, siden iPhone Air er 912 px bred liggende;
  menyen vokser med innfellingen ved Dynamic Island, og kildehenvisningen holdes klar av øya.
- 4.11.: nettbrett (PR #94). Stående iPad og ⅔ delt skjerm (700–1023 px) har menyen på 340 px ved siden av kartet.
  Mobilbrytepunktet er flyttet fra 900 til 699 px. Testet i simulatoren (iPad Air 11" stående, og rotert til liggende og tilbake med siden åpen) og med Playwright.
- 2.11.: kartknappene fra MapLibre har norsk tekst (PR #92): «Vis hvor jeg er», «Zoom inn» og «Zoom ut», og
  teksten bytter ved språkbytte. Posisjonsknappen zoomer til maks 15 i stedet for 16 (halvparten så langt inn).
- 1.11.: kartet åpner der du er også når du svarer sent på spørsmålet om posisjon (PR #91). Fristen på 15 s
  telte med tiden spørsmålet stod fremme i Chrome, så posisjonen kom aldri. Fristen er fjernet; har du flyttet
  kartet selv i mellomtiden, blir det stående. «Allow this time» i Chrome gir nytt spørsmål ved hvert besøk.
- 1.11.: frimerke-ikonet heter nå `ikon-frimerke.png` (PR #90). Med samme filnavn kunne iOS vise det gamle
  «b»-ikonet ved deling. `apple-touch-icon.png` ligger igjen som kopi for gamle lenker.
- Live på https://stam.pe/byguider/ med seks byer: London (275 oppføringer, hvorav 114 på ønskelista), Oslo (131, 22 på ønskelista), New York (94, 2 på ønskelista), Nice (74, 3 på ønskelista), Tokyo (86, 7 på ønskelista), Bangkok (40, 4 på ønskelista).
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
  lå inne fra før. Schönhauser Allee og to adresser i Pankow kom med etter Påls ja. Notatene er korte utkast skrevet av Claude. Lista ble lest med curl (getlist og maps/preview/place, uten nettleser).
- 31.10.: bedre i felt (PR #79–#81). Infoboksen har «Veibeskrivelse», som starter Google Maps rett til stedet: til fots,
  kollektivt for `utenfor: ja` og til startpunktet for gåturer. «Nær meg» ved «Kun favoritter» sorterer lista etter avstand,
  med «350 m · 5 min å gå». Kartet åpner der du er når du er i byen og siden allerede har lov til å bruke posisjonen.
  Eksport til My Maps og Google Maps er droppet.
- 31.10. kveld (PR #82–#83): åpning der du er virker nå på iPhone. Safari avviste spørringen etter tillatelse, så nå huskes det
  i nettleseren (`byguider-posisjon`) at posisjonen har virket før. Infoboksen har «Del», og `?sted=<navn>` åpner kartet zoomet
  inn på stedet med infoboksen. Testet av Pål på telefonen.
  Lenkene i infoboksen står på to faste linjer: Veibeskrivelse · Google Maps · Nettside, så Zoom inn · Del (PR #84).
- 31.10.: SMAK.md er smaksprofilen per kategori (nabolag, restauranter, kaféer, barer, muséer, butikker, hoteller m.fl.),
  utledet fra de seks byene og rettet av Pål. Den brukes når Claude foreslår steder selv, i stedet for å analysere byene
  på nytt; CLAUDE.md viser til den. New York fikk Starbucks Reserve Roastery i Meatpacking District.
- 31.10.: Berlin fikk sju restauranter i gangavstand fra Orania, foreslått av Claude ut fra SMAK.md og sjekket i Google Maps: ORA, Max und Moritz,
  Horváth, Jolesch, Cocolo Ramen X-berg, Sale e Tabacchi og Tulus Lotrek. Lode & Stijn og Richard er stengt for godt. Notatene er Claudes utkast.
- 31.10.: delingskort (PR #85). Hver by har eget delingsbilde, et postkort med bynavnet i poststempelet (`bilder/deling-<by>.png`), og forsiden
  en postkortbunke. Stubbene har og:-tagger og heter som guiden. Hjemskjermikonet er et frimerke med «b». Lages med `.claude/delingsbilder.sh`.
- 31.10. kveld: delingsside per sted (PR #86). «Del» lenker til `…/<by>/<slug>/`, en liten side med stedets navn og
  «kategori · nabolag — guide» i delingskortet, uten stort bilde. Sidene (812) lages ved publisering av `.github/stedsider.py`
  og committes ikke. Hver by har eget hjemskjermikon, frimerke med «BYGUIDE» og bynavnet (`bilder/ikon-<by>.png`, PR #87),
  som også brukes i det lille delingskortet. Forsiden beholder «b». Live og sjekket med curl.
- 31.10. sent: på iPhone viste et delt sted fortsatt byens store kort, fordi Meldinger kjører JavaScript og fulgte
  omdirigeringen fra delingssiden. Delingssiden viser nå kartet selv (stubb med `data-sted`), uten å sende videre (PR #88).
  Live og sjekket i Chromium; ikke sett i Meldinger ennå.
- 31.10. sent: på stående mobil flyttes infoboksen forbi «Liste ↓» som den gjør med kartknappene øverst til venstre:
  til høyre for knappen, eller opp over den hvis den ikke får plass i bredden (PR #89). Sjekket i Chromium, ikke på iPhone.
- 2.11.: Berlin, Påls endringer i West. Nye: kaféene Winterfeldt Schokoladen ★ og Stulle mit Brot, restaurantene Cassambalis
  og The Catch (ønskeliste) og butikkene FALKE og TYPE Bike (notatene er Claudes utkast fra stedenes egne sider).
  Fjernet: Zwiebelfisch, Schwarzes Café, begge Photokabine, Museum der unerhörten Dinge og Odeon. ★ på Bücherbogen og Modulor.
  Til ønskelista: Delphi Filmpalast, Rum Trader, The Goods, Salut!, Mimi, Andreas Murkudis og ZEIT Café.
  Nabolaget heter nå bare «Winterfeldtplatz»: Potsdamer Straße er ute av tekst og gater, og omrisset er krympet til
  planleggingsrommene Kalckreuthstraße + Barbarossaplatz (uten egen kjerne). Andreas Murkudis står under Tiergarten.
- 3.11.: Berlin, Påls endringer i Mitte og Prenzlauer Berg. ★ på nabolagene Savignyplatz, Winterfeldtplatz, Kollwitzkiez og
  Spandauer Vorstadt, og på Material. Nye gatestreker (OSM): Mommsenstraße (Bleibtreu–Knesebeck), Mulackstraße og Sophienstraße,
  Kollwitzstraße (Knaackstraße–Danziger Straße) og Rykestraße. Savignyplatz har fått kjerne: Kantstraße/plassen ned til
  Kurfürstendamm, mellom Bleibtreustraße og Grolmanstraße. Nye: VEB Orange ★, NOVEMBER Brasserie og Samurai Museum (ønskeliste),
  ACID Mitte og Hackesche Höfe (notatene er Claudes utkast). Elleve steder til ønskelista (Pocketpark, silent green og
  Svanesjøen også `utenfor: ja`). Fjernet: Berliner Bürgerstuben, Weinladen Schmidt, Designpanoptikum og St. Marienkirche.
  Senere: ★ på do you read me?!, LUIBAN Papeterie og R.S.V.P. Papier; The Barn, Ben Rahim, LAP Coffee, Das Neue Schwarz og
  Museum der Stille og Absinthdepot til ønskelista; Firmament og COOP Anti-War Café fjernet.
- Ingen åpne grener utenom `main` (sjekket 4.11.).

## Neste steg

- Åpningstider: kaféer og barer i Oslo, deretter New York, Tokyo, Bangkok og de skjulte byene (sett `tidssone:` i frontmatter). Tidene bør sjekkes et par ganger
  i året (sommerstengt, nye tider); den halvårlige tidssjekken (15.3. og 15.9.) gjør det.
- Pillefyken (Oslo, ønskeliste) står som «Permanently closed» i Google (11.11.), vi har «midlertidig stengt». Pål bestemmer.
- Gjøremål (Pål sa ja 5.11.): endre `oppstart.sh` i claude-oppsett så den i skyøkter tilbakestiller lokal `main` til
  origin/main når den har gått fra hverandre og ikke har egne commits som mangler på origin. 5.11. hadde skykopien
  67 commits hver vei og `pull --ff-only` feilet. Kjør `synk-repoer.sh` etterpå.
- Publiseringen er felles for alle tre: `pages.yml` kaller `paalstampe/paalstampe.github.io/.github/workflows/publiser.yml@main`
  (paalstampe.github.io #23, byguider #105, reiseplanlegging #35). Endringer gjøres der og gjelder alle tre fra neste kjøring.
  Byguiders delingssider lages av `.github/etter-sammensetting.sh`. Første publisering på stam.pe ble blokkert i rundt 30 min
  (21:22–ca. 21:55) av en publisering som ifølge API-et var ferdig og ikke kunne avbrytes; tredje forsøk gikk gjennom.
- Publiseringen hopper over når innholdet er det samme som det som ligger ute (paalstampe.github.io #26, 5.11.): et avtrykk av
  alle filene ligger som `publisert.txt` og sammenlignes. Verifisert: første kjøring publiserte og neste hoppet over, i alle tre;
  ved fletting publiserte push-kjøringen og sletting av grenen hoppet over. Pages kan likevel henge på én enkelt publisering:
  4.11. kl. 22:20 tidsavbrøt alle tre forsøkene på stam.pe (en NOTES-commit). Fikk dette ofte, er neste skritt lengre ventetid.
- Dokumentasjon og Claude-oppsett (CLAUDE.md, NOTES.md, HANDOVER.md, SMAK.md, README.md, .claude/, .github/) publiseres ikke
  lenger, heller ikke i forhåndsvisningene (paalstampe.github.io #27, 5.11.). En commit som bare endrer dokumentasjon gir da ingen
  ny publisering. Byguidenes data/*.md publiseres som før. Hvert repo bestemmer selv hva som ikke publiseres, med `export-ignore` i `.gitattributes`
  (byguider #106, reiseplanlegging #36, paalstampe.github.io #28); ny fil som ikke skal på nettsiden legges inn der.
- Månedlig sjekk 2026-11-11 (733 nettsider; Instagram/Facebook hoppet over; Google-sjekk av 1030 steder gikk fra skyen):
  - Stengt for godt hos Google: Oslo, Pillefyken (vi har «midlertidig stengt», ønskeliste; Pål bestemmer). Ingen med annen status eller ikke funnet.
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

- 2026-11-08: Ingen ekte iPhone-app nå. Nettsidene dekker offline, hjem-skjerm og deling. En app lønner seg først
  for varsler når vi er nær et sted, eller «Legg til i byguiden» fra delingsmenyen. Blir det aktuelt: liten app
  for bare det, som leser de samme md-filene, og nettsidene beholdes. Xcode 27.2 har MCP-verktøy (mcpbridge) for det.
- 2026-11-08: Mexico City-guiden heter «Pål, Vibeke og Heddas Mexico City». Delingsbildet beholdt filnavnet, siden byen var skjult og ikke delt ennå.
- 2026-11-05: Hva som ikke publiseres, står i hvert repos `.gitattributes` (`export-ignore`), ikke i den felles workflowen.
  git archive respekterer det, også for forhåndsvisningene. Bieffekt: GitHubs «Download ZIP» mangler dokumentasjonen.
- 2026-11-05: Dokumentasjonen publiseres ikke. Det er ikke for å skjule noe (repoene er offentlige), men så commits som bare
  endrer dokumentasjon ikke gir nye publiseringer, som er det som henger hos Pages.
- 2026-11-05: Publiseringen hopper over når innholdet er likt det som er ute (avtrykk i `publisert.txt`). Gjentatte
  publiseringer av samme innhold var det som oftest hang hos Pages 4.11.
- 2026-11-04: Publiseringen bruker den felles workflowen i paalstampe.github.io (`publiser.yml@main`), så kø, rydding og forsøk
  bare vedlikeholdes ett sted. Ulempen er at en feil der rammer alle tre.
- 2026-11-04: Publiseringen rydder Pages-publiseringer som henger og prøver tre ganger med 5 min pause. Ferdige publiseringer
  («succeed») kan ikke avbrytes, selv når Pages sier de blokkerer; da hjelper bare venting. Lengre pauser er ikke lagt inn, siden
  blokkeringen 4.11. varte over 22 min og må løses ved årsaken.
- 2026-11-04: valider.sh kjører også etter Bash, siden auto mode ofte endrer filer med sed og skript, som før gikk utenom sjekken.
- 2026-11-04: UI-endringer sjekkes med axe-core (lys og mørk) før fletting. Brudd som krever nye farger tas med Pål.
- 2026-11-04: Claude kjører /code-review og /simplify selv før fletting av kodeendringer, så Pål slipper å be om det.
- 2026-11-04: Git-sjekk ved oppstart og push-vakt i sky ligger som hooks i repoet (ikke bare som regel), så de virker både lokalt og i skyøkter.
- 2026-11-04: London-sentrene (Sydenham, Blackheath, Forest Hill, Balham, Streatham Hill, Tooting, Lower Clapton) beholder sonene.
  Prøvd: kvartalene langs handlegaten fra OSM-gatenettet. Kvartalene bak handlegatene er så dype at omrisset enten blir mye
  større enn nabolaget eller ender som en sone igjen. Wapping (elvebredden) og Ekkamai ble bedre og er byttet.
- 2026-11-04: Nettbrett (700–1023 px) får menyen ved siden av kartet, smalere enn på Mac (340 px). Stående iPad fikk
  telefonoppsettet med kartet over en lang liste i full bredde. Mobil er nå under 700 px; halv delt skjerm (590 px) er mobil.
- 2026-11-04: `viewport-fit=cover` på alle sider. Uten den fylte Safari sidene i liggende med bakgrunnsfarge og
  `env(safe-area-inset-*)` var 0. Liggende-spørringen mistet `max-width: 900px`, siden de største iPhonene er bredere.
- 2026-11-02: Posisjonsknappen zoomer til maks 15, ikke 16. Pål syntes 16 gikk for langt inn.
- 2026-11-02: Winterfeldtplatz markerer bare Goltzstraße. Pål ville ikke ha Potsdamer Straße med, og lot
  Kalckreuthstraße og Barbarossaplatz være umarkert (de er navn på planleggingsrom, ikke gater å gå etter).
- 2026-11-02: Data-endringer gjøres i en egen arbeidskopi på main når en annen økt har byttet gren i mappa.
- 2026-11-01: Posisjonen ved oppstart hentes uten tidsfrist, og kartet hopper ikke hvis du har flyttet det selv.
  Chrome tok med tiden spørsmålet om tillatelse stod fremme i fristen, så kartet åpnet seg ikke der Pål var.
- 2026-11-01: Et ikon eller delingsbilde som byttes, får nytt filnavn (se HANDOVER). iOS viste det gamle bokstavikonet
  ved deling, fordi frimerket hadde overtatt samme fil.
- 2026-10-31: Delingssiden sender ikke videre til `?sted=`; den er en stubb som viser kartet selv. Meldinger på iPhone
  kjører JavaScript og fulgte omdirigeringen til byens kort.
- 2026-10-31: Ett sted deles med egen delingsside (`<by>/<slug>/`) laget ved publisering, ikke committet. Byens store postkort
  var for voldsomt når man deler ett sted og nevnte ikke stedet. Hjemskjermikonet per by er variant D: «BYGUIDE» og bynavnet
  mellom to linjer, valgt av Pål blant fire skisser.
- 2026-10-31: Delingsbildene er en postal familie: konvolutt med PS-frimerke (stam.pe), postkort (byguidene), luftpost (reiseplanleggingen).
  Kortet er per by, ikke per sted: delingskort leses uten JavaScript, så `?sted=` kan ikke gi eget bilde. Stempelet har ikke årstall.
- 2026-10-31: Smaksprofilen ligger i SMAK.md, så nye byer bygges uten å analysere de andre byene hver gang.
  Pål: kokkeeide restauranter er best (kvaliteten faller gjerne etter salg til kjede eller profesjonell eier);
  kjeder prioriteres ikke (vanlig Starbucks aldri, Starbucks Reserve greit, Dishoom i grenseland); fine dining
  bare én til tre per by; hoteller er boutique av svært høy kvalitet uten å bli overdådig, med Firmdale som målestokk.
- 2026-10-31: Kartet åpner der du er bare når siden allerede har lov til å bruke posisjonen (Permissions API), så ingen får spørsmål om posisjon ved oppstart. «Nær meg» slås ikke på av seg selv.
- 2026-10-31: KML-eksport til Google My Maps og eksport til lister i Google Maps er droppet. Begge er for omstendelige for andre å bruke.
  Appen er verktøyet i felt også: offline-lagring og «Åpne i Google Maps» med Place ID. scope-kml.md er slettet (finnes i git-historikken).
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
