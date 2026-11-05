#!/bin/sh
# SessionStart-hook: forteller Claude om repoet må pulles eller pushes, og om de felles filene er like originalene.
# Originalen til denne filen ligger i claude-oppsett/repo-filer; endre den der og kjør synk-repoer.sh.
# Utdata legges i Claudes kontekst ved oppstart. Henter automatisk (pull --ff-only) når det er trygt:
# arbeidstreet er rent og grenen bare ligger bak origin.
cd "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || exit 0
git fetch -q origin 2>/dev/null || { echo "Git-sjekk: fikk ikke kontakt med origin."; exit 0; }
gren=$(git branch --show-current)
endret=$(git status --porcelain | wc -l | tr -d ' ')
if oppstrom=$(git rev-parse --abbrev-ref '@{u}' 2>/dev/null); then
  set -- $(git rev-list --left-right --count "HEAD...$oppstrom")
  foran=$1; bak=$2
  if [ "$bak" -gt 0 ] && [ "$foran" -eq 0 ] && [ "$endret" -eq 0 ]; then
    git pull -q --ff-only && echo "Git-sjekk: $gren lå $bak commit(er) bak $oppstrom — hentet (pull --ff-only)." && bak=0
  fi
  [ "$bak" -gt 0 ] && echo "Git-sjekk: $gren ligger $bak commit(er) bak $oppstrom og kunne ikke hentes automatisk (lokale endringer eller divergens). Pull før du begynner."
  [ "$foran" -gt 0 ] && echo "Git-sjekk: $foran commit(er) på $gren er ikke pushet. Push dem."
  [ "$bak" -eq 0 ] && [ "$foran" -eq 0 ] && echo "Git-sjekk: $gren er à jour med $oppstrom."
else
  echo "Git-sjekk: grenen $gren har ingen oppstrøm på origin."
fi
[ "$endret" -gt 0 ] && echo "Git-sjekk: $endret fil(er) har ucommittede endringer fra før."
# Felles filer (hooks og /avslutt) har originalen i claude-oppsett, ved siden av ~/.claude/CLAUDE.md. Finnes bare lokalt.
oppsett=$(dirname "$(readlink "$HOME/.claude/CLAUDE.md" 2>/dev/null || echo /finnes/ikke)")
[ -x "$oppsett/synk-repoer.sh" ] || oppsett="$HOME/Developer/claude-oppsett"
if [ -x "$oppsett/synk-repoer.sh" ]; then
  avvik=$("$oppsett/synk-repoer.sh" --sjekk "$PWD" 2>/dev/null | tr '\n' ' ')
  [ -n "$avvik" ] && echo "Synk-sjekk: ${avvik}avviker fra originalen i claude-oppsett. Finn ut hvilken som er nyest, oppdater originalen ved behov og kjør $oppsett/synk-repoer.sh \"kort beskrivelse\"."
fi
exit 0
