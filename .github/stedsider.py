#!/usr/bin/env python3
"""Lager en liten delingsside per sted: <by>/<slug>/index.html.

«Del» i infoboksen lenker hit (…/london/conduit-coffee-house/). Siden har og:-tagger med stedets navn,
kategori og nabolag, så delingskortet i Meldinger, Slack og e-post viser stedet, ikke bare byen.
Den har ikke og:image, så Meldinger viser et lite kort med hjemskjermikonet: byens frimerke
(bilder/ikon-<by>.png) når det finnes, ellers «b»-frimerket.
Åpnes siden i en nettleser, går den videre til ../?sted=<slug> (pluss ?lang=en), som før.

Kjøres av .github/workflows/pages.yml ved publisering, for main og hver forhåndsvisning;
sidene committes ikke. Lesingen av md-filene speiler lesMarkdown() i app.js, og slug-en stedSlug().
Bruk: python3 .github/stedsider.py <mappe med byer.json>   (skriver inn i den mappa)
"""
import html, json, os, re, sys, unicodedata


def normaliser(s):
    s = str(s or '').lower().replace('ø', 'o').replace('æ', 'ae')
    s = ''.join(c for c in unicodedata.normalize('NFD', s) if not '̀' <= c <= 'ͯ')
    return re.sub(r'\s+', ' ', s).strip()


def slug(navn):
    return re.sub(r'^-+|-+$', '', re.sub(r'[^a-z0-9]+', '-', normaliser(navn)))


def les_markdown(tekst):
    linjer = re.sub(r'<!--[\s\S]*?-->', '', tekst.replace('\r', '')).split('\n')
    meta, steder, i = {}, [], 0
    if linjer and linjer[0].strip() == '---':
        i = 1
        while i < len(linjer) and linjer[i].strip() != '---':
            m = re.match(r'^\s*([^:]+):\s*(.*)$', linjer[i])
            if m:
                meta[normaliser(m.group(1))] = m.group(2).strip()
            i += 1
        i += 1
    kategori, sted = '', None
    for l in linjer[i:]:
        if re.match(r'^#\s+', l):
            sted = None
        elif m := re.match(r'^##\s+(.+)$', l):
            kategori, sted = m.group(1).strip(), None
        elif m := re.match(r'^###\s+(.+)$', l):
            sted = {'navn': re.sub(r'\s*[★*]+\s*$', '', m.group(1).strip()), 'kategori': kategori, 'notat': []}
            steder.append(sted)
        elif sted is not None:
            f = re.match(r'^\s*[-*]\s+([^:]+):\s*(.*)$', l)
            if f and normaliser(f.group(1)) == 'en':
                sted['engelsk'] = True
            elif not f and not sted.get('engelsk'):
                sted['notat'].append(l)
    return meta, steder


def forste_linje(notat):
    for l in notat:
        l = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', l).strip()
        if l:
            return l
    return ''


def side(navn, beskrivelse, tittel, url, sti_slug, ikon):
    e = lambda s: html.escape(s, quote=True)
    return f'''<!DOCTYPE html>
<html lang="no">
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(navn)} · {e(tittel)}</title>
<link rel="apple-touch-icon" href="{ikon}">
<meta name="robots" content="noindex, nofollow, noarchive">
<meta property="og:type" content="website">
<meta property="og:url" content="{e(url)}">
<meta property="og:site_name" content="stam.pe">
<meta property="og:title" content="{e(navn)}">
<meta property="og:description" content="{e(beskrivelse)}">
<meta property="og:locale" content="nb_NO">
<meta name="twitter:card" content="summary">
<script>
  /* Delingsside for ett sted (laget av .github/stedsider.py). Går videre til kartet med infoboksen åpen. */
  var q = location.search.replace(/^\\?/, '');
  location.replace('../?sted={sti_slug}' + (q ? '&' + q : '') + location.hash);
</script>
<p><a href="../?sted={sti_slug}">{e(navn)}</a></p>
</html>
'''


def main(rot):
    byer = json.load(open(os.path.join(rot, 'byer.json'), encoding='utf-8'))['byer']
    totalt = 0
    for by in byer:
        datafil = os.path.join(rot, by.get('data') or f"data/{by['id']}.md")
        meta, steder = les_markdown(open(datafil, encoding='utf-8').read())
        tittel = meta.get('tittel') or by['navn']
        brukt = set()
        ikon = f"../../bilder/ikon-{by['id']}.png" if os.path.exists(os.path.join(rot, 'bilder', f"ikon-{by['id']}.png")) else '../../apple-touch-icon.png'
        for st in steder:
            s = slug(st['navn'])
            # Tom slug (f.eks. bare japanske tegn) eller samme slug to ganger: Del faller tilbake på ?sted=.
            if not s or s in brukt:
                if s:
                    print(f"  {by['id']}: «{st['navn']}» har samme slug som et annet sted ({s}); bare det første får side")
                continue
            brukt.add(s)
            deler = [st['kategori'], forste_linje(st['notat'])]
            beskrivelse = ' · '.join(d for d in deler if d) + f' — {tittel}'
            url = f"https://stam.pe/byguider/{by['id']}/{s}/"
            mappe = os.path.join(rot, by['id'], s)
            # Kjøres på en fersk kopi, så en mappe som finnes fra før er en ekte mappe i repoet.
            if os.path.exists(mappe):
                print(f"  {by['id']}/{s}/ finnes fra før; hoppet over")
                continue
            os.makedirs(mappe)
            open(os.path.join(mappe, 'index.html'), 'w', encoding='utf-8').write(side(st['navn'], beskrivelse, tittel, url, s, ikon))
            totalt += 1
    print(f'Stedssider: {totalt} i {rot}')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '.')
