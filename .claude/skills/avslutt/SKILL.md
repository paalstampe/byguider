---
name: avslutt
description: Avslutt en arbeidsøkt – oppdater NOTES.md og ev. CLAUDE.md, commit og push. Bruk når brukeren skriver /avslutt eller sier at økten er ferdig.
---

Avslutt arbeidsøkten:

1. Oppdater NOTES.md (lag den hvis den mangler, med seksjonene Status nå, Neste steg, Åpne spørsmål, Beslutningslogg):
   - Hva som ble gjort i denne økten
   - Ny status, neste steg og åpne spørsmål
   - Nye beslutninger i beslutningsloggen med dagens dato og kort begrunnelse
   - Hold NOTES.md under ca. 10 KB (`wc -c NOTES.md`); den lastes inn i hver økt. «Status nå» er en kort oppsummering av
     gjeldende tilstand, ikke en dagbok. Er filen større, flytt datert historikk, ferdige punkter og eldre beslutninger
     (eldst først) til ARKIV.md (lag den ved behov, merk den `export-ignore` i `.gitattributes` hvis repoet har den fila).
2. Hvis noe varig er endret (struktur, konvensjoner, kommandoer, viktige beslutninger), oppdater CLAUDE.md. Hold den konsis (maks rundt 150 linjer).
3. Se tilbake på økten: var noe tungvint, gjentatt manuelt eller uklart i reglene? Foreslå i så fall en konkret forbedring (i prosjektets CLAUDE.md eller i claude-oppsett). Gjør endringen bare hvis brukeren sier ja.
4. Commit med en beskrivende melding og push.
5. Oppsummer kort hva som ble endret i NOTES.md og CLAUDE.md, og eventuelle forbedringsforslag.
