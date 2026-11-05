#!/bin/sh
# Originalen ligger i claude-oppsett/repo-filer; endre den der og kjør synk-repoer.sh.
# Stop-hook, bare i skyøkter (CLAUDE_CODE_REMOTE=true): stopper ikke før committede endringer er pushet,
# så ingenting blir liggende igjen i skycontaineren.
[ "$CLAUDE_CODE_REMOTE" = "true" ] || exit 0
inndata=$(cat)
case "$inndata" in *'"stop_hook_active":true'*|*'"stop_hook_active": true'*) exit 0 ;; esac
cd "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || exit 0
gren=$(git branch --show-current)
if oppstrom=$(git rev-parse --abbrev-ref '@{u}' 2>/dev/null); then
  foran=$(git rev-list --count "$oppstrom..HEAD")
else
  foran=$(git rev-list --count HEAD --not --remotes)
fi
[ "$foran" -gt 0 ] || exit 0
echo "{\"decision\":\"block\",\"reason\":\"Skyøkt: $foran commit(er) på $gren er ikke pushet. Push grenen (git push -u origin $gren) før du avslutter.\"}"
