#!/usr/bin/env bash
# Avbryter Pages-publiseringer som henger, før et forsøk, og venter så litt.
# Samme rydding som i den felles publiseringen (paalstampe.github.io/.github/workflows/publiser.yml);
# denne kopien forsvinner når repoet går over til den.
#
# Pages kan regne en publisering som pågående lenge etter at kjøringen som startet den er ferdig
# (18+ minutter i byguider 4.11.), og avviser da nye med «in progress deployment ... Please cancel
# <sha> first». Kjøringene står i kø (concurrency: pages), så ingen annen kjøring publiserer nå:
# alt Pages fortsatt regner som pågående, er rester og kan trygt avbrytes. Går fra nyeste til den
# siste som lyktes; eldre er erstattet av den. Ferdige («succeed») kan ikke avbrytes.
#
# Bruk: rydd-pages.sh <sekunder å vente, 0 før første forsøk>   (krever GH_TOKEN og GITHUB_REPOSITORY)
# Tørrkjøring (avbryter og venter ikke): RYDD_TORR=1 GITHUB_REPOSITORY=paalstampe/<repo> .github/rydd-pages.sh 0
set -uo pipefail

repo="$GITHUB_REPOSITORY"
shaer=$(gh api "repos/$repo/deployments?environment=github-pages&per_page=30" --jq '.[].sha' | awk '!sett[$0]++') \
  || echo "Fant ikke publiseringene (se feilen over); prøver uten å rydde"
for sha in $shaer; do
  status=$(gh api "repos/$repo/pages/deployments/$sha" --jq .status 2>/dev/null) || continue
  case "$status" in
    succeed) break ;;
    ''|deployment_failed|deployment_cancelled|deployment_content_failed|deployment_attempt_error|deployment_lost) ;;
    *)
      echo "Avbryter publisering av $sha (status: $status)"
      if [ -n "${RYDD_TORR:-}" ]; then echo "  (tørrkjøring: avbryter ikke)"
      elif ! gh api -X POST "repos/$repo/pages/deployments/$sha/cancel" >/dev/null; then echo "Klarte ikke å avbryte $sha"; fi
      ;;
  esac
done

if [ "$1" -gt 0 ] && [ -z "${RYDD_TORR:-}" ]; then
  echo "Venter ${1}s før nytt forsøk"
  sleep "$1"
fi
