# Scope: KML-eksport til Google My Maps

Skrevet 18. oktober 2026. Bare et scope, ingenting er implementert. Bakgrunnen står i HANDOVER.md
punkt 1: webappen brukes til planlegging og deling, og My Maps brukes i felt, fordi egne kart
vises i Google Maps-appen med navigasjon. Begge skal mates fra de samme dataene.

## 1. Hva vi har i dag

| By | Oppføringer | Kategorier (inkl. gåturer) | ★ | Ønskeliste | `en:` | Område / gate / rute i geojson |
|---|---|---|---|---|---|---|
| London | 109 | 8 | 38 | 1 | 76 | 50 / 37 / 2 |
| New York | 76 | 10 | 12 | 1 | 66 | 15 / 21 / 3 |
| Nice | 65 | 10 | 9 | 1 | 61 | 4 / 10 / 2 |
| Oslo | 119 | 8 | 33 | 23 | 114 | 8 / 14 / 0 |

Alt dette er langt under My Maps' grenser for antall objekter og filstørrelse. Det eneste som
strammer, er grensen på **10 lag per kart**: New York og Nice har 10 kategorier hver.

## 2. Hva som skal med

Forslag til første versjon:

- **Steder:** ett punkt per oppføring, på samme koordinat som i appen. Nabolag får punktet
  midt i kjernen eller midt i området (`punktInni`), ikke på `sted:`.
- **Lag:** ett lag per kategori, i fast rekkefølge (`KATEGORIER`). Navnet på kategorien
  gir navnet på laget.
- **Nabolagsomriss:** polygonene for område og kjerne legges i laget «Nabolag og gater»,
  sammen med nabolagspunktene og gatene. Da koster de ikke egne lag. Kjernen får sterkere
  fyll enn skissen, som i appen.
- **Gater:** som linjer i nabolagslaget, med nabolagets navn.
- **Gåturer:** ruten som linje i laget «Gåturer», med lengde, varighet og notat i beskrivelsen.
  En gåtur uten tegnet rute blir ikke med (den har ingen geometri å vise). Oslo har ingen
  gåturer og får dermed et lag mindre.
- **Favoritter:** ★ bak navnet, som i md-fila. Det synes i lista og på kartet i Google Maps.
  I tillegg sendes `favoritt` med som datafelt (ExtendedData), slik at Pål kan style etter det
  i My Maps om han vil.
- **Notater:** hele notatet i beskrivelsen. Markdown-lenker blir «tekst: https://…», fordi
  My Maps viser rå URL-er som lenker, men ikke HTML. Under notatet følger nettside,
  «Åpne i Google Maps» (lenke med Place ID) og eventuelle `les:`-lenker.
- **Ønskeliste:** se åpent spørsmål 3. Oslo har 23 slike steder.
- **Språk:** én fil per språk. Norsk er standard, og engelsk lages på samme måte som i appen
  (`navn-en:`/`en:`, eller norsk der engelsk mangler). My Maps har ingen språkbryter, så
  begge språk i samme kart blir enten to kart eller dobbel tekst i hver beskrivelse.
  Se åpent spørsmål 1.

Blir ikke med: soner (blir eventuelt et prefiks i beskrivelsen, ikke egne lag), `utenfor:`,
papirpaletten, appens SVG-ikoner og alt som har med oppførsel å gjøre (uthevet nabolag,
flyttbar infoboks, zoom).

## 3. Hvordan My Maps tar imot KML

- **Lag:** maks 10 per kart. Hvert lag kan importere én fil. Om en KML-fil med flere
  `<Folder>` blir flere lag eller ett lag, må testes (se punkt 7). Uansett utfall kan
  eksporten lage én fil per lag.
- **Grenser:** maks 5 MB per fil (utpakket), og Google advarer mot mer enn 2 000 rader per import.
  Den største byen har 166 geometrier, så vi er langt unna.
- **Stiler:** farger på linjer og flater (`LineStyle`/`PolyStyle`) og farge på punkt-ikonet
  (`IconStyle`) blir vanligvis med. Ikonene bør være My Maps' egne standardnåler med
  kategorifargen. Egne PNG-ikoner fra stam.pe er usikkert, og appens ikoner er SVG,
  som KML ikke tar. Pål kan bytte til My Maps' egne symboler (kopp, bestikk og så videre) per lag
  etter importen.
- **Polygoner og linjer:** støttes fullt ut. Stiplet kant finnes ikke, så omriss og ruter blir heltrukne.
- **Dette går tapt:** Place ID. Et importert punkt er bare en koordinat med vår egen tekst.
  Trykker man på det i Google Maps, får man ikke stedets åpningstider, bilder eller anmeldelser.
  Lenken «Åpne i Google Maps» i beskrivelsen er løsningen. Også språkbryter, klynging, mørk modus,
  stiplede linjer og formatering i notatene går tapt.

## 4. Hvordan eksporten lages uten byggesteg og npm

**A. Innebygd i appen (anbefalt).** En funksjon `lagKml()` i app.js bygger KML av de samme
objektene som kartet bruker (`byggFeatures` og geometrifila), og laster den ned med en Blob.
Den startes med `?kml` i adressen (`stam.pe/byguider/oslo/?kml`, og `?kml&lang=en` for
engelsk), uten noen synlig knapp i grensesnittet. Det er samme mønster som det gamle `?onskeliste`.

- Fordeler: bruker nøyaktig samme parser og nabolagsplassering som appen, så eksport og app
  blir aldri ulike. Virker fra hvilken som helst nettleser, også mobil og iPad, mot de publiserte
  dataene, uten Node og uten lokal kopi. Ingen nye avhengigheter.
- Ulemper: om lag 150–200 linjer mer i app.js, som alle brukere laster. Kan legges i en egen
  `kml.js` som bare lastes med `?kml`.
- En synlig knapp («Last ned for Google My Maps») kan komme senere, med tekst på norsk og engelsk
  i `TEKST`.

**B. Skript under `.claude/`.** For eksempel `.claude/kml.sh <by>`, som skriver `kml/<by>.kml`.
Node finnes allerede for skjermbildeskriptet. app.js kan ikke lastes direkte i Node (den bruker
`document`, `localStorage` og `matchMedia`), så skriptet må enten kopiere parseren eller åpne
siden i Playwright og kalle `lesMarkdown`/`byggFeatures` der.

- Fordeler: ingenting nytt i appen, og filene kan committes og lenkes til.
- Ulemper: krever Macen (eller Claude) for hver eksport, kopiert parser kan gli fra appen,
  og Playwright-varianten er tregere og skjørere.

Anbefaling: **A, i en egen `kml.js` som bare lastes med `?kml`.** Kodeendring, så den gjøres på
egen gren etter CLAUDE.md.

## 5. Hvordan kartet holdes oppdatert

My Maps kan ikke synkes automatisk. Det finnes ikke noe API for My Maps, og den støtter ikke
nettverkslenker (KML NetworkLink). Kartet må derfor importeres på nytt for hånd.

- **Erstatt per lag (anbefalt):** i My Maps, på hvert lag: ⋮ → «Importer på nytt og slå sammen»
  → «Erstatt alle elementer». Kartet beholder adressen og delingen, så det ligger fortsatt i
  Google Maps-appen. Stilregler som bygger på et datafelt, blir med over. Håndstilte enkeltpunkter
  (ikon valgt på ett og ett sted) kan gå tapt. Dette krever én fil per lag, så eksporten bør kunne
  lage det (`?kml=lag` eller en liste med nedlastingslenker).
- **Nytt kart hver gang:** enklest å eksportere, men ny adresse hver gang. Kartet må deles og
  lagres på nytt i Google Maps-appen. Greit for en første test, men ikke som rutine.
- **Når:** før en reise, ikke etter hver datacommit. Kartbeskrivelsen i My Maps får datoen fra
  `oppdatert:` eller dagens dato, så det synes hvor ferskt kartet er. Lenken til hvert bys My Maps-kart
  kan stå i NOTES.md eller byer.json.

## 6. Anslag

| Del | Omfang |
|---|---|
| `kml.js`: KML-bygging, escaping, stiler per kategori, beskrivelse, nedlasting | 150–200 linjer, ca. en halv dag |
| Én fil per lag for «Erstatt alle elementer» | + 1–2 timer |
| Test: import av én by i My Maps, sjekk av lag, farger, lenker og Google Maps-appen på mobil | 1–2 timer, Pål må være med (Google-kontoen hans) |
| Oppsett av fire kart i My Maps (lagrekkefølge, ikoner, deling) | ca. 15 min per by, Pål |
| Dokumentasjon: HANDOVER.md (nytt avsnitt) og CLAUDE.md (oppdateringsrutine) | kort |

Totalt omtrent én arbeidsdag med kode og test, pluss en time med Pål i My Maps.

## 7. Forslag til første versjon

1. `kml.js`, lastet med `?kml`, lager én KML-fil per by på norsk, med én `<Folder>` per kategori.
   Nabolagsomriss, kjerner og gater ligger i nabolagsmappen, og ruter i gåturmappen.
2. Punkter med kategorifarge, ★ i navnet, og notat og lenker i beskrivelsen. Polygoner og linjer
   farges som i appen (lys modus).
3. Test med **London** (flest omriss, 8 lag). Avklar om mapper blir lag ved import, hvordan farger
   og ikoner overlever, og hvordan beskrivelser og lenker ser ut i Google Maps-appen.
4. Når testen er gjort: velg mellom én fil og én fil per lag, og legg inn eventuell sammenslåing
   av kategorier for New York og Nice.

Engelsk, ønskeliste-lag, synlig knapp og per-lag-filer kommer etter testen, hvis Pål vil ha dem.

## Åpne spørsmål til Pål

1. **Språk:** holder norsk i My Maps, eller trengs engelsk også (eget kart, eller begge språk i
   samme beskrivelse)? Hvem skal bruke kartene i felt, bare dere to, eller også folk dere deler med?
2. **Lag i New York og Nice:** begge har 10 kategorier. Går det greit å slå sammen små kategorier
   der, for eksempel Barer + Jazzklubber, eller Hoteller inn i Verdt en omvei? Det gir plass
   til et ønskeliste-lag og gjør lagene ryddigere.
3. **Ønskeliste:** skal steder dere ikke har besøkt ennå, være med? I så fall som eget lag
   («Ikke besøkt ennå»), eller i kategorilaget med dempet farge? Det gjelder særlig Oslo (23 steder).
4. **Oppdatering:** holder det å importere på nytt før hver reise? Og er det viktig at kartet beholder
   samme adresse, altså at det ligger lagret i Google Maps-appen? Det avgjør om vi trenger én fil per lag.
5. **Ikoner:** holder kategorifarge på standardnålene, eller vil du bruke My Maps' symboler
   (kopp, bestikk og så videre)? Disse må velges for hånd i My Maps én gang per lag.
6. **Finnes det allerede My Maps-kart** for noen av byene som skal erstattes, eller starter vi blankt?

Kilder om My Maps-import: [Import map features from a file](https://support.google.com/mymaps/answer/3024836),
[Import data into Google Earth](https://developers.google.com/maps/documentation/earth/import-data).
