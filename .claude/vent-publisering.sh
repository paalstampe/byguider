#!/bin/sh
# Venter på at publiseringen av en commit er ferdig, og sier om den gikk bra. Kjøres i bakgrunnen etter push.
# En push kan gi flere kjøringer av «Publiser» for samme commit (push, delete, workflow_dispatch), og en senere
# kjøring avbryter en tidligere. Derfor ventes det til ingen kjøringer for commiten er i gang; avbrutte regnes ikke
# med, og resten må ha gått bra.
# Bruk: .claude/vent-publisering.sh [commit]   (standard HEAD; feiler etter 20 minutter)
sha=$(git rev-parse "${1:-HEAD}") || exit 1
kjoringer() { gh run list --commit "$sha" --json "$1" -q "$2"; }

i=0
while :; do
  antall=$(kjoringer databaseId length)
  aktive=$(kjoringer status '[.[] | select(.status != "completed")] | length')
  # Ferdig når minst én kjøring finnes og ingen er i gang. Kjøringene dukker opp noen sekunder etter push,
  # og en ny kan starte rett etter at en annen er ferdig: sjekk to ganger på rad.
  if [ "${antall:-0}" -gt 0 ] && [ "$aktive" = 0 ]; then
    [ -n "$rolig" ] && break
    rolig=1
  else
    rolig=""
  fi
  i=$((i + 1))
  [ $i -lt 120 ] || { echo "Tidsavbrudd: publiseringen av $sha er ikke ferdig etter 20 minutter"; exit 1; }
  sleep 10
done

feil=$(kjoringer conclusion,url '.[] | select(.conclusion != "success" and .conclusion != "cancelled" and .conclusion != "skipped") | "\(.conclusion) \(.url)"')
ok=$(kjoringer conclusion '[.[] | select(.conclusion == "success")] | length')
if [ -n "$feil" ] || [ "$ok" = 0 ]; then
  echo "Publiseringen feilet:"; echo "${feil:-ingen kjøring gikk bra}"; exit 1
fi
echo "Publisert ($ok kjøring(er) gikk bra)"
