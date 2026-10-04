#!/bin/bash
# Miniatyrer til forsiden: skjermbilde av åpningssiden til hver by i byer.json, lagret som
# bilder/<id>.webp (360×270). Samme oppskrift som landingssiden stam.pe: viewport 1300×900,
# deviceScaleFactor 2, beskjært til 1200×900 fra venstre kant og skalert ned.
# Bruk: .claude/miniatyrer.sh [grunnadresse] [by-id ...]
#   f.eks. .claude/miniatyrer.sh                                   (alle byer fra stam.pe)
#          .claude/miniatyrer.sh https://stam.pe/byguider nice     (bare Nice)
#          .claude/miniatyrer.sh http://localhost:8000             (lokal kopi)
# Byer med status «kommer» hoppes over. Krever Node og Playwright, som .claude/skjermbilde.sh;
# proxy- og sertifikatoppsettet i skyen er det samme som der.
set -euo pipefail
cd "$(dirname "$0")/.."

grunn="${1:-https://stam.pe/byguider}"
shift || true
case "$grunn" in
  https://stam.pe/*|http://localhost:*|http://127.0.0.1:*) ;;
  *) echo "Bare https://stam.pe/... og http://localhost:<port>/... er tillatt" >&2; exit 1 ;;
esac

proxy=""
spki=""
ca=/root/.ccr/ca-bundle.crt
if [ -n "${HTTPS_PROXY:-}" ] && [ -f "$ca" ]; then
  proxy="$HTTPS_PROXY"
  tmp=$(mktemp -d)
  trap 'rm -rf "$tmp"' EXIT
  csplit -s -z -f "$tmp/ca-" "$ca" '/-----BEGIN CERTIFICATE-----/' '{*}'
  spki=$(for f in "$tmp"/ca-*; do
    if openssl x509 -in "$f" -noout -subject 2>/dev/null | grep -q 'O = Anthropic'; then
      openssl x509 -in "$f" -pubkey -noout | openssl pkey -pubin -outform der \
        | openssl dgst -sha256 -binary | base64
    fi
  done | sort -u | paste -sd, -)
fi

mkdir -p bilder
GRUNN="${grunn%/}" BYER="$*" PROXY="$proxy" SPKI="$spki" NODE_PATH="$(npm root -g)" node - <<'JS'
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const e = process.env;
  const args = e.PROXY
    ? ['--proxy-server=' + e.PROXY, '--proxy-bypass-list=localhost;127.0.0.1',
       '--ignore-certificate-errors-spki-list=' + e.SPKI,
       '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
    : [];
  const valgte = e.BYER.split(/\s+/).filter(Boolean);
  const byer = JSON.parse(fs.readFileSync('byer.json', 'utf8')).byer
    .filter(b => b.status !== 'kommer' && (!valgte.length || valgte.includes(b.id)));
  const nettleser = await chromium.launch({ args });
  const side = await nettleser.newPage({ viewport: { width: 1300, height: 900 }, deviceScaleFactor: 2 });
  for (const b of byer) {
    const url = `${e.GRUNN}/${b.id}/`;
    await side.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await side.waitForTimeout(1500);
    const png = await side.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 900 } });
    // Nedskalering og webp-koding i nettleseren selv — ingen bildebibliotek trengs.
    const webp = await side.evaluate(async data => {
      const bilde = new Image();
      bilde.src = 'data:image/png;base64,' + data;
      await bilde.decode();
      // To halveringer gir skarpere resultat enn ett hopp fra 2400 til 360 px.
      let kilde = bilde;
      for (const [b, h] of [[1200, 900], [720, 540], [360, 270]]) {
        const c = document.createElement('canvas');
        c.width = b; c.height = h;
        const x = c.getContext('2d');
        x.imageSmoothingQuality = 'high';
        x.drawImage(kilde, 0, 0, b, h);
        kilde = c;
      }
      return kilde.toDataURL('image/webp', 0.86).split(',')[1];
    }, png.toString('base64'));
    fs.writeFileSync(`bilder/${b.id}.webp`, Buffer.from(webp, 'base64'));
    console.log(`Lagret bilder/${b.id}.webp fra ${url}`);
  }
  await nettleser.close();
})().catch(f => { console.error(f.message); process.exit(1); });
JS
