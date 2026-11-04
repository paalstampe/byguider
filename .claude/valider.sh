#!/bin/sh
# PostToolUse-hook (Write|Edit): sjekker at JSON/GeoJSON er gyldig og at Python kompilerer.
# Feil gis tilbake til Claude (exit 2), så filen rettes før commit.
fil=$(python3 -c 'import json,sys; d=json.load(sys.stdin); print((d.get("tool_input") or {}).get("file_path",""))' 2>/dev/null)
[ -f "$fil" ] || exit 0
case "$fil" in
  *.json|*.geojson|*.webmanifest)
    feil=$(python3 - "$fil" <<'PY' 2>&1
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
                for x, y in r:
                    assert -180 <= x <= 180 and -90 <= y <= 90, f'GeoJSON: feature {i} har ugyldig koordinat {x},{y} (lengde, bredde?)'
PY
) || { echo "Ugyldig fil $fil: $(echo "$feil" | tail -1)" >&2; exit 2; } ;;
  *.py)
    feil=$(python3 -m py_compile "$fil" 2>&1) || { echo "Python-feil i $fil: $feil" >&2; exit 2; } ;;
esac
exit 0
