#!/bin/bash
# Originalen til denne filen ligger i claude-oppsett/repo-filer; endre den der og kjør synk-repoer.sh.
# Simulerer Android og Windows med Playwright/Chromium (samme motor som Chrome på Android og Chrome/Edge på Windows):
#   Android: Galaxy S24 (stående og liggende), Pixel 10, Galaxy Tab S9 (stående og liggende) med touch og Android-brukeragent.
#   Windows: 1366×768 og 1920×1080 med faste rullefelt (17 px, som på Windows) og Edge-brukeragent, ett musehjulhakk = deltaY 100.
#   Berøringsskjerm-PC: mus og touch samtidig (hover og pointer:fine er sanne, men fingrene sender touch-hendelser).
# Sjekker per oppsett: ingen sideveis rulling, ingen knapper/titler som stikker ut eller kuttes, ingen JS-feil, skjermbilde.
# Med kort=/apent= også: trykk åpner kortet, og tilbakeknappen lukker det uten å forlate siden.
# Med kart= også: musehjul (PC) og pinch (berøringsskjerm-PC) endrer kartet; med zoom= skrives faktoren.
# Bruk: .claude/plattformtest.sh <url> [kort=<css>] [apent=<js>] [kart=<css>] [zoom=<js>] [bilder=<mappe>] [bare=android|windows]
#   kort   = elementet som trykkes for å åpne et kort, f.eks. .oppslag (første treff brukes)
#   apent  = JS-uttrykk som er sant når kortet er åpent
#   kart   = kartflaten for hjul og pinch; zoom = JS-uttrykk som gir kartets zoom (for faktoren)
#   f.eks. .claude/plattformtest.sh http://localhost:8001/ kort=.oppslag 'apent=!document.getElementById("detalj").hidden' kart=#kart zoom='naaZoom()'
#          .claude/plattformtest.sh http://localhost:8000/london/ kort=.oppslag 'apent=!!document.querySelector(".maplibregl-popup.pop")' kart=.maplibregl-canvas
# Skriver OK/FEIL per sjekk og INFO for målinger, og avslutter med kode 1 hvis noe feiler. Skjermbildene havner i bilder=
# (standard: en ny mappe under $TMPDIR, som skrives ut).
# Dekker ikke det som hører til enheten selv: Androids adresselinje og tastatur, systemets tilbakegest, «Install app».
# Firefox er ikke med: Playwrights Firefox startet ikke på Macen 20.11.2026 («Could not find profile folder»).
# Krever Node og Playwright med Chromium (installasjon øverst i skjermbilde.sh).
set -euo pipefail

url="${1:?url mangler}"
kort="" apent="" kart="" zoom="" bilder="" bare=""
for valg in "${@:2}"; do
  case "$valg" in
    kort=*) kort="${valg#kort=}" ;;
    apent=*) apent="${valg#apent=}" ;;
    kart=*) kart="${valg#kart=}" ;;
    zoom=*) zoom="${valg#zoom=}" ;;
    bilder=*) bilder="${valg#bilder=}" ;;
    bare=android|bare=windows) bare="${valg#bare=}" ;;
    *) echo "Ukjent valg «$valg» (bruk kort=, apent=, kart=, zoom=, bilder=, bare=android|windows)" >&2; exit 1 ;;
  esac
done
if { [ -n "$kort" ] && [ -z "$apent" ]; } || { [ -z "$kort" ] && [ -n "$apent" ]; }; then
  echo "kort= og apent= må brukes sammen" >&2; exit 1
fi

case "$url" in
  https://stam.pe/*|http://localhost:*|http://127.0.0.1:*) ;;
  *) echo "Bare https://stam.pe/... og http://localhost:<port>/... er tillatt" >&2; exit 1 ;;
esac

if ! command -v node >/dev/null || ! NODE_PATH="$(npm root -g)" node -e "require('playwright')" 2>/dev/null; then
  echo "Mangler Node eller Playwright — se installasjon øverst i .claude/skjermbilde.sh" >&2
  exit 1
fi

[ -n "$bilder" ] || bilder=$(mktemp -d "${TMPDIR:-/tmp}/plattformtest.XXXXXX")
mkdir -p "$bilder"

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

URL="$url" KORT="$kort" APENT="$apent" KART="$kart" ZOOM="$zoom" BILDER="$bilder" BARE="$bare" PROXY="$proxy" SPKI="$spki" \
NODE_PATH="$(npm root -g)" node - <<'JS'
const pw = require('playwright');
const e = process.env;
const EDGE = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0';
const RULLEFELT = '::-webkit-scrollbar{width:17px;height:17px;background:#f0f0f0}::-webkit-scrollbar-thumb{background:#a0a0a0}';
const vent = ms => new Promise(r => setTimeout(r, ms));
let feil = 0;
const ok = (b, m) => { if (!b) feil++; console.log((b ? 'OK   ' : 'FEIL ') + m); };
const proxyArgs = e.PROXY
  ? ['--proxy-server=' + e.PROXY, '--proxy-bypass-list=localhost;127.0.0.1', '--ignore-certificate-errors-spki-list=' + e.SPKI,
     '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
  : [];

async function sjekk(nettleser, oppsett, navn, ekstra = {}) {
  const ctx = await nettleser.newContext(oppsett);
  if (ekstra.rullefelt) await ctx.addInitScript(css => document.addEventListener('DOMContentLoaded', () => {
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  }), RULLEFELT);
  const p = await ctx.newPage();
  const jsFeil = [];
  p.on('pageerror', f => jsFeil.push(f.message.split('\n')[0].slice(0, 120)));
  p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) jsFeil.push(m.text().slice(0, 120)); });
  const t = navn + ':';
  try {
    await p.goto('about:blank');
    await p.goto(e.URL, { waitUntil: 'load', timeout: 60000 });
    await vent(3000);
    const [bredde, vindu] = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    ok(bredde <= vindu + 1, `${t} ingen sideveis rulling (${bredde} / ${vindu} px)`);
    const kuttet = await p.evaluate(() => [...document.querySelectorAll('button, a, h1, h2, h3, .chip, input')].filter(el => {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      if (!r.width || cs.visibility === 'hidden') return false;
      // stikker ut av sitt rullende panel (eller vinduet), eller teksten kuttes uten …
      let boks = el.parentElement;
      while (boks && !/(auto|scroll|hidden)/.test(getComputedStyle(boks).overflowX)) boks = boks.parentElement;
      const hoyre = boks ? boks.getBoundingClientRect().left + boks.clientWidth : innerWidth;
      return r.right > hoyre + 1 && r.left < hoyre
        || el.scrollWidth > el.clientWidth + 2 && cs.overflowX !== 'visible' && cs.textOverflow !== 'ellipsis' && el.tagName !== 'INPUT';
    }).slice(0, 5).map(el => (el.textContent || el.placeholder || el.className).trim().replace(/\s+/g, ' ').slice(0, 30)));
    ok(!kuttet.length, `${t} ingenting stikker ut eller kuttes${kuttet.length ? ': ' + kuttet.join(' | ') : ''}`);
    if (ekstra.rullefelt) {
      const rull = await p.evaluate(() => [...document.querySelectorAll('*')].filter(el => /(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 2)
        .map(el => el.offsetWidth - el.clientWidth).filter(b => b > 0));
      console.log(`INFO ${t} rullefelt som tar plass: ${rull.length ? rull.map(b => b + ' px').join(', ') : 'ingen'}`);
    }
    const fil = `${e.BILDER}/${navn.replace(/[^\wæøåÆØÅ-]+/g, '_')}.png`;
    await p.screenshot({ path: fil });

    if (e.KORT) {
      const el = p.locator(e.KORT).first();
      await el.scrollIntoViewIfNeeded();
      if (oppsett.hasTouch) await el.tap(); else await el.click();
      await vent(1500);
      ok(await p.evaluate(e.APENT), `${t} trykk på ${e.KORT} åpner kortet`);
      await p.screenshot({ path: fil.replace(/\.png$/, '_kort.png') });
      await p.goBack(); await vent(800);
      const fortsattApent = await p.evaluate(e.APENT).catch(() => true);
      ok(!fortsattApent && p.url() !== 'about:blank', `${t} tilbake lukker kortet og blir på siden`);
    }
    if (e.KART && ekstra.hjul) await hjul(p, t);
    if (e.KART && ekstra.pinch) await pinch(p, t);
  } catch (f) { ok(false, `${t} ${f.message.split('\n')[0]}`); }
  ok(!jsFeil.length, `${t} ingen JS-feil${jsFeil.length ? ': ' + jsFeil.join('; ') : ''}`);
  await ctx.close();
}

const kartbilde = async p => p.screenshot({ clip: await p.locator(e.KART).first().boundingBox() });
const zoomNa = p => e.ZOOM ? p.evaluate(e.ZOOM) : null;
const faktor = (z0, z1) => z0 ? ' (zoom ×' + (z1 / z0).toFixed(2) + ')' : '';

async function hjul(p, t) {   // ett hakk på Windows = deltaY 100
  const k = await p.locator(e.KART).first().boundingBox();
  await p.mouse.move(k.x + k.width / 2, k.y + k.height / 2);
  const b0 = await kartbilde(p), z0 = await zoomNa(p);
  await p.mouse.wheel(0, -100); await vent(1000);
  const z1 = await zoomNa(p);
  ok(Buffer.compare(b0, await kartbilde(p)) !== 0, `${t} ett musehjulhakk zoomer kartet${faktor(z0, z1)}`);
}

async function pinch(p, t) {   // to fingre fra 80 til 320 px fra hverandre, midt i kartet
  const k = await p.locator(e.KART).first().boundingBox();
  const cx = k.x + k.width / 2, cy = k.y + k.height / 2;
  const cdp = await p.context().newCDPSession(p);
  const send = (type, d) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: d == null ? [] : [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }] });
  const b0 = await kartbilde(p), z0 = await zoomNa(p), side0 = await p.evaluate('visualViewport.scale');
  await send('touchStart', 40);
  for (let d = 50; d <= 160; d += 10) { await send('touchMove', d); await vent(16); }
  await send('touchEnd'); await vent(1200);
  const z1 = await zoomNa(p);
  ok(Buffer.compare(b0, await kartbilde(p)) !== 0, `${t} pinch zoomer kartet${faktor(z0, z1)}`);
  ok(await p.evaluate('visualViewport.scale') === side0, `${t} pinch zoomer ikke hele siden`);
}

(async () => {
  if (e.BARE !== 'windows') {
    const b = await pw.chromium.launch({ args: proxyArgs });
    for (const d of ['Galaxy S24', 'Galaxy S24 landscape', 'Pixel 10', 'Galaxy Tab S9', 'Galaxy Tab S9 landscape'])
      await sjekk(b, pw.devices[d], 'Android ' + d);
    await b.close();
  }
  if (e.BARE !== 'android') {
    // Headless Chromium skjuler rullefeltene; uten flagget tar de plass som på Windows.
    const b = await pw.chromium.launch({ args: proxyArgs, ignoreDefaultArgs: ['--hide-scrollbars'] });
    for (const [w, h] of [[1366, 768], [1920, 1080]])
      await sjekk(b, { viewport: { width: w, height: h }, userAgent: EDGE }, `Windows ${w}x${h}`, { rullefelt: true, hjul: true });
    await b.close();
    // Berøringsskjerm-PC: touch-hendelser slått på uten touch-emulering, så siden ser en mus-PC som også har touch.
    const bt = await pw.chromium.launch({ args: [...proxyArgs, '--touch-events=enabled'], ignoreDefaultArgs: ['--hide-scrollbars'] });
    await sjekk(bt, { viewport: { width: 1366, height: 768 }, userAgent: EDGE }, 'Windows berøringsskjerm', { rullefelt: true, pinch: true });
    await bt.close();
  }
  console.log(`Skjermbilder: ${e.BILDER}`);
  console.log(feil ? `${feil} sjekk(er) feilet` : 'Alle sjekker OK');
  process.exit(feil ? 1 : 0);
})().catch(f => { console.error(f.message); process.exit(2); });
JS
