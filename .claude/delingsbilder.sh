#!/bin/bash
# Lager delingsbildene (og:image, 1200×630) og hjemskjermikonet fra .claude/delingsbilder.html:
#   bilder/deling-<by>.png  postkort med bynavnet i poststempelet, én per by i byer.json (også skjulte)
#   bilder/deling.png       postkortbunke for byguide-forsiden, med de synlige byene
#   apple-touch-icon.png    frimerke med «b» (180×180)
# Tittel og kicker hentes fra frontmatter i data/<by>.md. Kjør på nytt når en by kommer til
# eller bytter navn, og legg og:-taggene inn i den nye stubben (kopier fra london/index.html).
# Bruk: .claude/delingsbilder.sh   (fra roten av repoet; krever Node og Playwright, se skjermbilde.sh)
set -euo pipefail
cd "$(dirname "$0")/.."

NODE_PATH="$(npm root -g)" node - <<'JS'
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');

const frontmatter = fil => {
  const m = fs.readFileSync(fil, 'utf8').match(/^---\n([\s\S]*?)\n---/);
  const ut = {};
  for (const linje of (m ? m[1] : '').split('\n')) {
    const i = linje.indexOf(':');
    if (i > 0) ut[linje.slice(0, i).trim()] = linje.slice(i + 1).trim();
  }
  return ut;
};
const liste = navn => navn.length < 2 ? navn.join('') : navn.slice(0, -1).join(', ') + ' og ' + navn.at(-1);

(async () => {
  const side0 = 'file://' + path.resolve('.claude/delingsbilder.html');
  const nettleser = await chromium.launch();
  const side = await nettleser.newPage({ viewport: { width: 1200, height: 630 } });
  const feil = [];
  side.on('pageerror', f => feil.push('JS: ' + f.message));
  const ta = async (parametre, fil) => {
    await side.goto(side0 + '?' + new URLSearchParams(parametre), { waitUntil: 'networkidle' });
    await side.evaluate(() => document.fonts.ready);
    await side.locator('#flate > *').screenshot({ path: fil });
    console.log('Lagret ' + fil);
  };

  const { byer } = JSON.parse(fs.readFileSync('byer.json', 'utf8'));
  for (const by of byer) {
    const fm = frontmatter(by.data);
    const tittel = fm.tittel || by.navn;
    const eier = tittel.endsWith(by.navn) ? tittel.slice(0, -by.navn.length).trim() : '';
    await ta({ motiv: 'postkort', by: by.navn.toUpperCase(), eier, navn: by.navn,
      kicker: 'stam.pe · Byguider', under: fm.kicker || '' }, `bilder/deling-${by.id}.png`);
  }
  await ta({ motiv: 'postkortbunke', tittel: 'Byguider', kicker: 'stam.pe',
    under: liste(byer.filter(b => !b.skjult).map(b => b.navn.replace(/ /g, '\u00a0'))) }, 'bilder/deling.png');
  await ta({ motiv: 'ikon', bokstav: 'b' }, 'apple-touch-icon.png');

  await nettleser.close();
  for (const f of feil) console.error('Feil: ' + f);
  if (feil.length) process.exit(1);
})().catch(f => { console.error(f.message); process.exit(1); });
JS
