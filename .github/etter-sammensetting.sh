#!/usr/bin/env bash
# Kjøres av den felles publiseringen (paalstampe.github.io/.github/workflows/publiser.yml) etter at main og
# forhåndsvisningene er satt sammen, med mappa som publiseres som argument.
# Lager en delingsside per sted (<by>/<slug>/), med stedets navn i delingskortet. Feiler den for en
# forhåndsvisning, publiseres resten likevel.
set -e
site="$1"
python3 .github/stedsider.py "$site"
find "$site/forhandsvisning" -name byer.json -not -path '*/data/*' 2>/dev/null | while read -r f; do
  python3 .github/stedsider.py "$(dirname "$f")" || echo "Stedssider feilet: $f"
done
