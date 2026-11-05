#!/bin/sh
# Originalen ligger i claude-oppsett/repo-filer; endre den der og kjør synk-repoer.sh.
# PostToolUse-hook (Write|Edit|Bash): sjekker at JSON/GeoJSON/YAML er gyldig, uten dupliserte nøkler, og at Python kompilerer.
# Dupliserte nøkler godtas stille av vanlige parsere (siste vinner), og ga 4.11. en workflow med to like jobber.
# Write/Edit: filen som ble skrevet. Bash: filer git ser som endret eller nye, og som er endret siden forrige
# Bash-sjekk (tilstand i .git/), så sed og skript i Bash også sjekkes. En fil som feiler, meldes igjen til den er rettet.
# Feil gis tilbake til Claude (exit 2), så filen rettes før commit.
IFS='
'  # filnavn skilles bare på linjeskift
inndata=$(cat)
# Første linje: verktøyet, andre: filen Write/Edit skrev.
les=$(printf '%s' "$inndata" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("tool_name","")); print((d.get("tool_input") or {}).get("file_path",""))' 2>/dev/null)
verktoy=${les%%"$IFS"*}

sjekk() { # fil — skriver feilmeldingen og gir status ≠ 0 hvis filen er ugyldig
  case "$1" in
    *.json|*.geojson|*.webmanifest)
      python3 - "$1" <<'PY'
import json, sys
from collections import Counter
def uten_like(par):
    like = [k for k, n in Counter(k for k, _ in par).items() if n > 1]
    assert not like, f'dupliserte nøkler: {", ".join(like)}'
    return dict(par)
f = sys.argv[1]
d = json.load(open(f, encoding='utf-8'), object_pairs_hook=uten_like)
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
    *.yml|*.yaml)
      python3 - "$1" <<'PY'
import sys
from collections import Counter
try:
    import yaml
except ImportError:
    sys.exit(0)  # PyYAML mangler (f.eks. i sky): hopp over
class Laster(yaml.SafeLoader): pass
def uten_like(laster, node, deep=False):
    # Flettenøkler («<<: *anker») kan stå flere ganger; str() tåler nøkler som ikke kan hashes.
    nokler = [str(laster.construct_object(k, deep=deep)) for k, _ in node.value if k.tag != 'tag:yaml.org,2002:merge']
    like = [k for k, n in Counter(nokler).items() if n > 1]
    if like:
        sys.exit(f'dupliserte nøkler: {", ".join(like)} (linje {node.start_mark.line + 1})')
    return yaml.SafeLoader.construct_mapping(laster, node, deep)
Laster.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, uten_like)
try:
    list(yaml.load_all(open(sys.argv[1], encoding='utf-8'), Laster))
except yaml.YAMLError as e:
    sys.exit(' '.join(str(e).split()))
PY
      ;;
    *.py)
      python3 -c "import ast,sys; ast.parse(open(sys.argv[1], encoding='utf-8').read(), sys.argv[1])" "$1" ;;
  esac
}

if [ "$verktoy" = "Bash" ]; then
  # Prosjektmappa, ikke hookens arbeidskatalog: Claude kan ha gjort cd ut av repoet.
  cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null && rot=$(git rev-parse --show-toplevel 2>/dev/null) && cd "$rot" || exit 0
  # Bare filer som er endret siden de sist ble godkjent: endringstid (ns) per godkjent fil i .git/valider-tilstand.json.
  tilstand="$(git rev-parse --absolute-git-dir)/valider-tilstand.json"
  filer=$( { git diff --name-only HEAD 2>/dev/null; git ls-files -o --exclude-standard; } | grep -E '\.(json|geojson|webmanifest|ya?ml|py)$' |
    python3 -c '
import json, os, sys
try: gammel = json.load(open(sys.argv[1]))
except Exception: gammel = {}
print("\n".join(f for f in sys.stdin.read().splitlines() if os.path.isfile(f) and gammel.get(f) != os.stat(f).st_mtime_ns))
' "$tilstand")
else
  filer=${les#*"$IFS"}
fi

status=0
godkjent=''
for fil in $filer; do
  [ -f "$fil" ] || continue
  if feil=$(sjekk "$fil" 2>&1); then
    godkjent="$godkjent$fil$IFS"
  else
    echo "Ugyldig fil $fil: $(printf '%s\n' "$feil" | tail -1)" >&2; status=2
  fi
done
# Bash: husk de godkjente filene, så de ikke sjekkes på nytt før de endres igjen.
[ "$verktoy" = "Bash" ] && printf '%s' "$godkjent" | python3 -c '
import json, os, sys
try: d = json.load(open(sys.argv[1]))
except Exception: d = {}
d.update({f: os.stat(f).st_mtime_ns for f in sys.stdin.read().splitlines() if f})
json.dump(d, open(sys.argv[1], "w"))
' "$tilstand"
exit $status
