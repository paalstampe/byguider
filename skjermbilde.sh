#!/bin/bash
# Skjermbilde av en side på stam.pe fra Claude Code-containeren i skyen.
# Bruk: .claude/skjermbilde.sh <url> <fil.png> [bredde] [høyde]
#   f.eks. .claude/skjermbilde.sh https://stam.pe/byguider/oslo/ oslo.png 390 844   (mobil)
#
# Containeren går via en proxy som bytter ut TLS-sertifikatene. Chromium godtar bare
# proxyens egne CA-er (Anthropic i /root/.ccr/ca-bundle.crt), identifisert på nøkkel (SPKI).
# Alle andre sertifikater verifiseres som normalt. Bare stam.pe tillates som adresse.
set -euo pipefail

url="${1:?url mangler}"
fil="${2:?utfil mangler}"
bredde="${3:-1300}"
hoyde="${4:-900}"

case "$url" in
  https://stam.pe/*) ;;
  *) echo "Bare https://stam.pe/... er tillatt" >&2; exit 1 ;;
esac

buntfil=/root/.ccr/ca-bundle.crt
chrome=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome | head -1)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

csplit -s -z -f "$tmp/ca-" "$buntfil" '/-----BEGIN CERTIFICATE-----/' '{*}'
spki=$(for f in "$tmp"/ca-*; do
  if openssl x509 -in "$f" -noout -subject 2>/dev/null | grep -q 'O = Anthropic'; then
    openssl x509 -in "$f" -pubkey -noout | openssl pkey -pubin -outform der \
      | openssl dgst -sha256 -binary | base64
  fi
done | paste -sd,)

"$chrome" --headless --no-sandbox --user-data-dir="$tmp/profil" \
  --proxy-server="$HTTPS_PROXY" --ignore-certificate-errors-spki-list="$spki" \
  --use-gl=swiftshader --enable-unsafe-swiftshader \
  --window-size="$bredde,$hoyde" --virtual-time-budget=20000 \
  --screenshot="$fil" "$url" 2>/dev/null
echo "Lagret $fil"
