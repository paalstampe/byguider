# Oppsett: Reiseplanlegger på GitHub Pages

Kontekst for Claude i prosjektet «App: Reiseplanlegging». Samme oppsett er allerede brukt for «Nabolag London» (https://paalstampe.github.io/nabolag-london/, repo `paalstampe/nabolag-london`).

## Utgangspunkt

- Appen er i dag én selvstendig `.html`-fil.
- Pål bruker **GitHub Desktop** på Mac. GitHub-bruker: `paalstampe`.
- Lokale kloner ligger i `/Users/palstampe/Documents/GitHub/<repo-navn>`.
- Mål: ny mappe/repo `reiseplanlegger`, publisert på `https://paalstampe.github.io/reiseplanlegger/`.

## Steg

1. **Opprett repo i GitHub Desktop:** File → New Repository
   - Name: `reiseplanlegger`
   - Local path: `/Users/palstampe/Documents/GitHub`
   - Huk av «Initialize with README», .gitignore: None
2. **Legg inn filen:** kopier HTML-filen inn i den nye mappen og **døp den om til `index.html`**. (Ellers blir adressen `…/reiseplanlegger/filnavn.html`.)
3. **Commit** i GitHub Desktop (f.eks. «Første versjon»).
4. **Publish repository** (knapp øverst). Se punktet om synlighet under før du velger om «Keep this code private» skal være huket av.
5. **Slå på Pages:** på github.com → repoet → Settings → Pages → Source: *Deploy from a branch* → Branch: `main`, mappe `/ (root)` → Save.
6. Etter 1–2 minutter er appen oppe på `https://paalstampe.github.io/reiseplanlegger/`. Senere endringer: rediger → commit → Push origin, så oppdateres siden automatisk.

## Ting å sjekke før publisering

- **Siden er offentlig.** Alt i HTML-filen blir lesbart for alle som har/finner lenken — også fra et privat repo. Gratis-kontoer krever i tillegg offentlig repo for Pages (privat repo + Pages krever GitHub Pro). Personlige detaljer (datoer, adresser, bookingreferanser, navn) bør ut av filen hvis det er et problem.
- **API-nøkler** i koden (kart, vær o.l.) blir offentlige. Bruk nøkler som kan begrenses til domenet `paalstampe.github.io`, eller fjern dem.
- **Lagrede data i nettleseren (localStorage):** hvis appen lagrer data lokalt, følger de *ikke* med når den flyttes fra `file://` til github.io — nettleseren ser det som et nytt nettsted. Eksporter data først hvis appen har en slik funksjon, eller legg dem inn i en datafil.
- **Eksterne filer:** hvis HTML-en senere splittes i `index.html` + `data/*.json` (som i Nabolag London), vil `fetch()` ikke fungere ved dobbeltklikk på filen lokalt. Test da med `python3 -m http.server` i mappen og åpne `http://localhost:8000`. Så lenge alt ligger i én fil er dette ikke relevant.

## Anbefalt filstruktur (når det blir aktuelt)

```
reiseplanlegger/
├── index.html      appen
├── data/           evt. reisedata som JSON/GeoJSON
├── README.md       kort beskrivelse + publisert URL
└── HANDOVER.md     statusdokument for videre arbeid med Claude
```
