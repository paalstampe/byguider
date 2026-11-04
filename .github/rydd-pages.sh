#!/usr/bin/env bash
# Avbryter Pages-publiseringer som henger, før et nytt forsøk, og venter så litt.
#
# Pages kan regne en publisering som pågående lenge etter at kjøringen som startet den er ferdig
# (18+ minutter i byguider 4.11.), og avviser da nye med «in progress deployment ... Please cancel
# <sha> first». Kjøringene står i kø (concurrency: pages), så ingen annen kjøring publiserer nå:
# alt Pages fortsatt regner som pågående, er rester og kan trygt avbrytes.
#
# Bruk: rydd-pages.sh <sekunder å vente>   (krever GH_TOKEN og GITHUB_REPOSITORY)
set -u

repo="$GITHUB_REPOSITORY"
for sha in $(gh api "repos/$repo/deployments?environment=github-pages&per_page=10" --jq '.[].sha' | sort -u); do
  status=$(gh api "repos/$repo/pages/deployments/$sha" --jq .status 2>/dev/null) || continue
  case "$status" in
    # Tom status: Pages følger ikke lenger publiseringen.
    ''|succeed|deployment_failed|deployment_cancelled|deployment_content_failed|deployment_attempt_error|deployment_lost) ;;
    *)
      echo "Avbryter publisering av $sha (status: $status)"
      gh api -X POST "repos/$repo/pages/deployments/$sha/cancel" >/dev/null || echo "Klarte ikke å avbryte $sha"
      ;;
  esac
done

echo "Venter ${1}s før nytt forsøk"
sleep "$1"
