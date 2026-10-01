#!/bin/bash
# Skjermbilde av en side på stam.pe, eller en lokal kopi, fra Claude Code-containeren i skyen.
# Bruk: .claude/skjermbilde.sh <url> <fil.png> [bredde] [høyde] [hel]
#   f.eks. .claude/skjermbilde.sh https://stam.pe/byguider/oslo/ oslo.png 390 844        (mobil)
#          .claude/skjermbilde.sh https://stam.pe/byguider/oslo/ oslo.png 1300 900 hel  (hele siden)
#          .claude/skjermbilde.sh http://localhost:8000/oslo/ oslo.png 390 844          (lokalt)
# Lokalt: kjør først «python3 -m http.server 8000» i byguider/. Kartet virker fordi app.js
# bruker den egne localhost-nøkkelen til CARTO.
#
# Containeren går via en proxy som bytter ut TLS-sertifikatene med egne (Anthropic-CA-er i
# /root/.ccr/ca-bundle.crt). Chromium kjenner dem ikke, og med bare «ignorer sertifikatfeil»
# gir den opp tilfeldige forespørsler (ERR_TOO_MANY_RETRIES) — da blir kartet blankt.
# Derfor godtas nøyaktig proxyens CA-er, identifisert på nøkkel (SPKI); alle andre
# sertifikater verifiseres som normalt. Playwright venter til nettet er stille, slik at
# kartfliser og markører er tegnet før bildet tas. Bare stam.pe og localhost
# tillates som adresse; localhost går utenom proxyen.
set -euo pipefail

url="${1:?url mangler}"
fil="${2:?utfil mangler}"
bredde="${3:-1300}"
hoyde="${4:-900}"
hel="${5:-}"

case "$url" in
  https://stam.pe/*|http://localhost:*) ;;
  *) echo "Bare https://stam.pe/... og http://localhost:<port>/... er tillatt" >&2; exit 1 ;;
esac

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

csplit -s -z -f "$tmp/ca-" /root/.ccr/ca-bundle.crt '/-----BEGIN CERTIFICATE-----/' '{*}'
spki=$(for f in "$tmp"/ca-*; do
  if openssl x509 -in "$f" -noout -subject 2>/dev/null | grep -q 'O = Anthropic'; then
    openssl x509 -in "$f" -pubkey -noout | openssl pkey -pubin -outform der \
      | openssl dgst -sha256 -binary | base64
  fi
done | sort -u | paste -sd,)

URL="$url" FIL="$fil" BREDDE="$bredde" HOYDE="$hoyde" HEL="$hel" SPKI="$spki" \
NODE_PATH="$(npm root -g)" node - <<'JS'
const { chromium } = require('playwright');
(async () => {
  const e = process.env;
  const nettleser = await chromium.launch({
    // Proxy via Chromium-flagg, ikke Playwrights proxy-valg: det sender også localhost til proxyen.
    args: ['--proxy-server=' + e.HTTPS_PROXY, '--proxy-bypass-list=localhost',
           '--ignore-certificate-errors-spki-list=' + e.SPKI,
           '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const side = await nettleser.newPage({ viewport: { width: +e.BREDDE, height: +e.HOYDE } });
  const feil = [];
  side.on('requestfailed', r => feil.push(r.url() + ' ' + r.failure()?.errorText));
  side.on('pageerror', f => feil.push('JS: ' + f.message));
  await side.goto(e.URL, { waitUntil: 'networkidle', timeout: 60000 });
  await side.waitForTimeout(1500);
  await side.screenshot({ path: e.FIL, fullPage: e.HEL === 'hel' });
  await nettleser.close();
  for (const f of feil) console.error('Feil: ' + f);
  console.log('Lagret ' + e.FIL);
})().catch(f => { console.error(f.message); process.exit(1); });
JS
