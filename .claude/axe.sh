#!/bin/bash
# Originalen til denne filen ligger i claude-oppsett/repo-filer; endre den der og kjør synk-repoer.sh.
# Tilgjengelighetssjekk med axe-core i lys og mørk modus, via Playwright (samme oppsett som skjermbilde.sh).
# Erstatter axe i nettleserpanelet, som auto-modus kan avvise.
# Bruk: .claude/axe.sh <url> [bredde] [høyde] [js=<kode>]
#   js = JavaScript som kjøres på siden før sjekken, f.eks. for å åpne et detaljkort eller en meny.
#   f.eks. .claude/axe.sh http://localhost:8001/ 390 844
#          .claude/axe.sh http://localhost:8001/ 1300 900 "js=state.mnd=0; oppdater(); visDetalj('JPN-HOK')"
# Skriver bruddene per modus og avslutter med kode 1 hvis det finnes noen.
# Krever Node og Playwright med Chromium (installasjon øverst i skjermbilde.sh).
# axe-core hentes fra cdnjs; i skyen går det via proxyen, som skjermbilde.sh forklarer.
set -euo pipefail

url="${1:?url mangler}"
bredde="${2:-1300}"
hoyde="${3:-900}"
js=""
for valg in "${@:4}"; do
  case "$valg" in
    js=*) js="${valg#js=}" ;;
    *) echo "Ukjent valg «$valg» (bruk js=<kode>)" >&2; exit 1 ;;
  esac
done

case "$url" in
  https://stam.pe/*|http://localhost:*|http://127.0.0.1:*) ;;
  *) echo "Bare https://stam.pe/... og http://localhost:<port>/... er tillatt" >&2; exit 1 ;;
esac

if ! command -v node >/dev/null || ! NODE_PATH="$(npm root -g)" node -e "require('playwright')" 2>/dev/null; then
  echo "Mangler Node eller Playwright — se installasjon øverst i .claude/skjermbilde.sh" >&2
  exit 1
fi

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

URL="$url" BREDDE="$bredde" HOYDE="$hoyde" JS="$js" PROXY="$proxy" SPKI="$spki" \
NODE_PATH="$(npm root -g)" node - <<'JS'
const { chromium } = require('playwright');
const AXE = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
(async () => {
  const e = process.env;
  const args = e.PROXY
    ? ['--proxy-server=' + e.PROXY, '--proxy-bypass-list=localhost;127.0.0.1',
       '--ignore-certificate-errors-spki-list=' + e.SPKI,
       '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
    : [];
  const nettleser = await chromium.launch({ args });
  let antall = 0;
  for (const modus of ['light', 'dark']) {
    const side = await nettleser.newPage({ viewport: { width: +e.BREDDE, height: +e.HOYDE }, colorScheme: modus });
    await side.goto(e.URL, { waitUntil: 'networkidle', timeout: 60000 });
    await side.waitForTimeout(1500);
    if (e.JS) { await side.evaluate(kode => (0, eval)(kode), e.JS); await side.waitForTimeout(500); }
    await side.addScriptTag({ url: AXE });
    const brudd = await side.evaluate(async () => (await axe.run()).violations.map(v => ({
      id: v.id, inntrykk: v.impact, hjelp: v.help,
      noder: v.nodes.map(n => n.target.join(' ') + (n.failureSummary ? ' — ' + n.failureSummary.split('\n').slice(1).join(' ').trim() : ''))
    })));
    console.log(`${modus === 'light' ? 'Lys' : 'Mørk'} modus: ${brudd.length ? brudd.length + ' brudd' : 'ingen brudd'}`);
    for (const b of brudd) {
      console.log(`  ${b.id} (${b.inntrykk}): ${b.hjelp} — ${b.noder.length} element`);
      for (const n of b.noder.slice(0, 5)) console.log('    ' + n);
      if (b.noder.length > 5) console.log(`    … og ${b.noder.length - 5} til`);
    }
    antall += brudd.length;
    await side.close();
  }
  await nettleser.close();
  process.exit(antall ? 1 : 0);
})().catch(f => { console.error(f.message); process.exit(2); });
JS
