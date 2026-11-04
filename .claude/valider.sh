#!/bin/sh
# PostToolUse-hook (Write|Edit|Bash): sjekker at JSON/GeoJSON er gyldig og at Python kompilerer.
# Write/Edit: filen som ble skrevet. Bash: filer git ser som endret eller nye, og som er endret siden forrige
# Bash-sjekk (tilstand i .git/), så sed og skript i Bash også sjekkes.
# Feil gis tilbake til Claude (exit 2), så filen rettes før commit.
IFS='
'  # filnavn skilles bare på linjeskift
inndata=$(cat)
verktoy=$(printf '%s' "$inndata" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_name",""))' 2>/dev/null)

sjekk() { # fil
  case "$1" in
    *.json|*.geojson|*.webmanifest)
      python3 - "$1" <<'PY' 2>&1 | tail -1
import json, sys
f = sys.argv[1]
d = json.load(open(f, encoding='utf-8'))
if f.endswith('.geojson'):
    assert d.get('type') == 'FeatureCollection', 'GeoJSON: type skal være FeatureCollection'
    for i, ft in enumerate(d.get('features', [])):
        g = ft.get('geometry') or {}
        ringer = {'Polygon': [g.get('coordinates', [])], 'MultiPolygon': g.get('coordinates', [])}.get(g.get('type'), [])
        for poly in ringer:
            for r in poly:
                assert len(r) >= 4 and r[0] == r[-1], f'GeoJSON: feature {i} ({ft.get("properties", {}).get("navn", "?")}) har en ring som ikke er lukket'
                for pos in r:
                    x, y = pos[0], pos[1]
                    assert -180 <= x <= 180 and -90 <= y <= 90, f'GeoJSON: feature {i} har ugyldig koordinat {x},{y} (lengde, bredde?)'
PY
      ;;
    *.py)
      python3 -c "import ast,sys; ast.parse(open(sys.argv[1], encoding='utf-8').read(), sys.argv[1])" "$1" 2>&1 | tail -1 ;;
  esac
}

if [ "$verktoy" = "Bash" ]; then
  rot=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
  cd "$rot" || exit 0
  # Bare filer som er endret siden forrige Bash-sjekk: endringstid (ns) per fil lagres i .git/valider-tilstand.json.
  filer=$( { git diff --name-only HEAD 2>/dev/null; git ls-files -o --exclude-standard; } | grep -E '\.(json|geojson|webmanifest|py)$' |
    python3 -c '
import json, os, sys
sti = sys.argv[1]
try: gammel = json.load(open(sti))
except Exception: gammel = {}
ny = {f: os.stat(f).st_mtime_ns for f in sys.stdin.read().splitlines() if os.path.isfile(f)}
print("\n".join(f for f, t in ny.items() if gammel.get(f) != t))
json.dump(ny, open(sti, "w"))
' "$(git rev-parse --absolute-git-dir)/valider-tilstand.json")
else
  filer=$(printf '%s' "$inndata" | python3 -c 'import json,sys; print((json.load(sys.stdin).get("tool_input") or {}).get("file_path",""))' 2>/dev/null)
fi

status=0
for fil in $filer; do
  [ -f "$fil" ] || continue
  feil=$(sjekk "$fil")
  [ -n "$feil" ] && { echo "Ugyldig fil $fil: $feil" >&2; status=2; }
done
exit $status
