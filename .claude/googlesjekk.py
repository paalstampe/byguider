#!/usr/bin/env python3
"""Sjekker stedene i data/*.md mot Google Maps uten nettleser, så det virker i skyøkter.

Slår opp hvert sted på Place ID (`- google:`) med google.com/maps/preview/place, som svarer med data
også til urllib/curl. Place ID-en dekodes til 0x<a>:0x<b> (se «Google Maps-oppskrifter» i .claude/skills/ny-by/SKILL.md), så navnet spiller
ingen rolle.

  python3 .claude/googlesjekk.py              status for alle steder: stengt for godt / annen status
  python3 .claude/googlesjekk.py --tider      steder med åpent:, og hvilke tider som er endret hos Google
  python3 .claude/googlesjekk.py --by oslo    begrens til noen byer (kommaliste)

--tider sammenligner Googles tider med øyeblikksbildet i .claude/google-tider.json (fra forrige sjekk),
ikke med åpent:. Våre tider er ofte fra stedets egen nettside og avviker fra Google uten at noe er endret;
det som er nytt hos Google siden sist, er derimot et tegn på at tidene er endret. Steder med åpent-kilde
Google sammenlignes også direkte. Øyeblikksbildet oppdateres med --lagre.

Svarer Google med noe annet enn data (blokkert, samtykkeside), stopper skriptet med kode 2 og sier fra;
da er rapporten ufullstendig.
"""
import argparse
import base64
import glob
import json
import os
import re
import struct
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BILDE = os.path.join(ROT, '.claude', 'google-tider.json')
DAGER = ['ma', 'ti', 'on', 'to', 'fr', 'lø', 'sø']
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
PB = '!1m14!1s{id}!3m12!1m3!1d2000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1'


class Blokkert(Exception):
    pass


# ---------- data/*.md (speiler lesMarkdown og lesAapent i app.js) ----------

def les_by(fil):
    tekst = re.sub(r'<!--.*?-->', '', open(fil, encoding='utf-8').read(), flags=re.S)
    linjer = tekst.split('\n')
    if linjer and linjer[0].strip() == '---':          # frontmatter
        linjer = linjer[linjer.index('---', 1) + 1:]
    steder, kategori, sted = [], '', None
    for linje in linjer:
        if linje.startswith('### '):
            sted = {'navn': linje[4:].replace('★', '').strip(), 'kategori': kategori, 'felt': {}}
            steder.append(sted)
        elif linje.startswith('## '):
            kategori, sted = linje[3:].strip(), None
        elif linje.startswith('# '):
            sted = None
        elif sted is not None:
            m = re.match(r'^-\s*([\wæøå-]+):\s*(.*)$', linje.strip())
            if m:
                sted['felt'].setdefault(m.group(1).lower(), m.group(2).strip())
    return steder


def minutter(x):
    m = re.match(r'^(\d{1,2})(?:[.:](\d{2}))?$', (x or '').strip())
    return int(m.group(1)) * 60 + int(m.group(2) or 0) if m else None


def les_aapent(tekst):
    """«ti–to 17–23, sø 12–15 + 17–22» -> sju lister med [fra, til] i minutter (til None = ukjent stengetid),
    eller None for «midlertidig stengt»."""
    s = (tekst or '').strip().lower()
    if s == 'midlertidig stengt':
        return None
    dager = [[] for _ in range(7)]
    for del_ in s.split(','):
        m = re.match(r'^(\S{2})(?:\s*[–-]\s*(\S{2}))?\s+(.+)$', del_.strip())
        if not m or m.group(1) not in DAGER or (m.group(2) and m.group(2) not in DAGER):
            continue
        a = DAGER.index(m.group(1))
        b = DAGER.index(m.group(2)) if m.group(2) else a
        tider = []
        for t in m.group(3).split('+'):
            fra, til = (re.split(r'\s*[–-]\s*', t.strip(), maxsplit=1) + [''])[:2]
            if minutter(fra) is not None:
                tider.append([minutter(fra), minutter(til)])
        d = a
        while True:
            dager[d] += tider
            if d == b:
                break
            d = (d + 1) % 7
    return dager


def tid_tekst(m):
    t, mm = divmod(m % 1440, 60)
    return f'{t:02d}' + (f'.{mm:02d}' if mm else '')


def aapent_tekst(dager):
    """Sju lister med intervaller -> åpent:-format, med like dager etter hverandre slått sammen."""
    tekst = [' + '.join(tid_tekst(a) + '–' + (tid_tekst(b) if b is not None else '') for a, b in sorted(d))
             for d in dager]
    ut, i = [], 0
    while i < 7:
        if not tekst[i]:
            i += 1
            continue
        j = i
        while j + 1 < 7 and tekst[j + 1] == tekst[i]:
            j += 1
        ut.append(DAGER[i] + ('–' + DAGER[j] if j > i else '') + ' ' + tekst[i])
        i = j + 1
    return ', '.join(ut) or 'stengt alle dager'


def like_tider(vaare, googles):
    """Samme tider hver dag? Ukjent stengetid hos oss («16–») godtar alle stengetider."""
    for v, g in zip(vaare, googles):
        if len(v) != len(g):
            return False
        for (va, vb), (ga, gb) in zip(sorted(v), sorted(g)):
            if va != ga or (vb is not None and vb % 1440 != gb % 1440):
                return False
    return True


# ---------- Google ----------

def hex_id(pid):
    """Place ID (ChIJ…) -> 0x<a>:0x<b>, det omvendte av oppskriften i ny-by-skillen."""
    b = base64.urlsafe_b64decode(pid + '=' * (-len(pid) % 4))
    return f"0x{struct.unpack('<Q', b[3:11])[0]:x}:0x{struct.unpack('<Q', b[12:20])[0]:x}"


def google_tider(sted):
    """Hovedtidene (felt 203; 118 er lunsj o.l.) -> sju lister med [fra, til] i minutter."""
    try:
        uke = sted[203][0]
    except (IndexError, TypeError):
        return None
    if not uke:
        return None
    def kl(x):                       # [16] -> 960, [11, 30] -> 690, [] eller [None, 30] -> midnatt + min
        return ((x[0] if x else 0) or 0) * 60 + ((x[1] if len(x) > 1 else 0) or 0)

    dager = [[] for _ in range(7)]
    for dag in uke:
        for tid in dag[3] or []:
            if len(tid) > 1 and tid[1] and len(tid[1]) >= 2:
                dager[(dag[1] - 1) % 7].append([kl(tid[1][0]), kl(tid[1][1])])
    return dager


_laas = threading.Lock()
_sist = [0.0]


def hent(pid):
    with _laas:                      # høyst fire oppslag i sekundet
        vent = _sist[0] + 0.25 - time.time()
        if vent > 0:
            time.sleep(vent)
        _sist[0] = time.time()
    url = ('https://www.google.com/maps/preview/place?authuser=0&hl=en&gl=us&pb='
           + urllib.parse.quote(PB.format(id=hex_id(pid)), safe=''))
    for forsok in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'en'})
            with urllib.request.urlopen(req, timeout=20) as r:
                tekst = r.read().decode('utf-8', 'replace')
            break
        except urllib.error.HTTPError as e:
            if e.code == 429 or forsok == 2:
                raise Blokkert(f'HTTP {e.code} fra Google')
        except Exception as e:
            if forsok == 2:
                raise Blokkert(f'{type(e).__name__}: {e}')
        time.sleep(3 * (forsok + 1))
    if not tekst.startswith(")]}'"):
        raise Blokkert('Google svarte ikke med data (samtykkeside eller blokkert)')
    d = json.loads(tekst[5:])
    return d[6] if len(d) > 6 and isinstance(d[6], list) else None


def sjekk(by, sted):
    pid = sted['felt']['google']
    g = hent(pid)
    res = {'by': by, 'sted': sted, 'pid': pid}
    if not g or len(g) <= 78 or g[78] != pid:
        res['status'] = 'ikke funnet'
        return res
    # Felt 88[0] er «CLOSED» når Google viser «Permanently closed» (sjekket mot nettleseren nov. 2026).
    # Andre store bokstaver der (f.eks. midlertidig stengt) meldes som de er; ellers står en kort beskrivelse der.
    kode = g[88][0] if len(g) > 88 and g[88] and isinstance(g[88][0], str) else ''
    res['status'] = ('stengt for godt' if kode == 'CLOSED' else
                     f'annen status ({kode})' if re.fullmatch(r'[A-Z_]{4,}', kode) else 'åpen')
    try:
        res['tider'] = google_tider(g)
    except (IndexError, TypeError, ValueError):      # uventet format: rapporter som uten tider
        res['tider'] = None
    return res


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--tider', action='store_true', help='bare steder med åpent:, se etter endrede tider')
    ap.add_argument('--lagre', action='store_true', help='med --tider: oppdater øyeblikksbildet')
    ap.add_argument('--by', help='kommaliste med by-id-er (filnavn i data/)')
    a = ap.parse_args()

    byer = {b['id']: b['navn'] for b in json.load(open(os.path.join(ROT, 'byer.json'), encoding='utf-8'))['byer']}
    valgt = set(a.by.split(',')) if a.by else None
    jobber = []
    for fil in sorted(glob.glob(os.path.join(ROT, 'data', '*.md'))):
        by = os.path.basename(fil)[:-3]
        if valgt and by not in valgt:
            continue
        for st in les_by(fil):
            if st['felt'].get('google', '').startswith('ChIJ') and (st['felt'].get('åpent') or not a.tider):
                jobber.append((byer.get(by, by), st))

    resultater, feil = [], None
    with ThreadPoolExecutor(4) as pool:
        fremtid = [pool.submit(sjekk, *j) for j in jobber]
        for fr in fremtid:
            try:
                resultater.append(fr.result())
            except Blokkert as e:
                feil = str(e)
                for x in fremtid:
                    x.cancel()
                break

    def linje(r, tillegg=''):
        s = f"- {r['by']} · {r['sted']['navn']} ({r['sted']['kategori']})"
        return s + (f': {tillegg}' if tillegg else '')

    ut = [f'**Ufullstendig:** Google stoppet etter {len(resultater)} av {len(jobber)} oppslag ({feil}).\n' if feil
          else f'{len(jobber)} steder slått opp hos Google.\n']
    grupper = {}
    for r in resultater:
        if r['status'] != 'åpen':
            grupper.setdefault(r['status'].split(' (')[0], []).append(r)
    for status, rr in grupper.items():
        ut.append(f'### {status.capitalize()} ({len(rr)})')
        for r in rr:
            t = []
            if r['sted']['felt'].get('åpent', '').lower() == 'midlertidig stengt':
                t.append('vi har «midlertidig stengt»')
            if r['sted']['felt'].get('status') == 'onskeliste':
                t.append('ønskeliste')
            if '(' in r['status']:
                t.append(r['status'])
            if status == 'ikke funnet':
                t.append(r['pid'])
            ut.append(linje(r, ', '.join(t)))
        ut.append('')

    if a.tider:
        try:
            forrige = json.load(open(BILDE, encoding='utf-8'))
        except (OSError, ValueError):
            forrige = {}
        endret, ulik_google, nye = [], [], {}
        for r in resultater:
            if r['status'] != 'åpen' or not r.get('tider'):
                continue
            g = aapent_tekst(r['tider'])
            nye[r['pid']] = g
            f = r['sted']['felt']
            info = f"vi «{f['åpent']}» ({f.get('åpent-kilde', 'ukjent kilde')})" + (
                f" · {f['nettside']}" if f.get('nettside') else '')
            if r['pid'] in forrige and forrige[r['pid']] != g:
                endret.append(linje(r, f"Google før «{forrige[r['pid']]}», nå «{g}»; {info}"))
            elif f.get('åpent-kilde', '').lower().startswith('google'):
                vaare = les_aapent(f['åpent'])
                if vaare is None or not like_tider(vaare, r['tider']):
                    ulik_google.append(linje(r, f"Google «{g}»; {info}"))
        uten = [r for r in resultater if r['status'] == 'åpen' and not r.get('tider')]
        nytt = [r for r in resultater if r['status'] == 'åpen' and r.get('tider') and r['pid'] not in forrige]
        ut.append(f'### Endret hos Google siden forrige sjekk ({len(endret)})')
        ut += endret or ['- ingen']
        ut += ['', f'### Kilde Google, men tidene avviker ({len(ulik_google)})'] + (ulik_google or ['- ingen'])
        if nytt and forrige:
            ut += ['', f'({len(nytt)} steder fantes ikke i øyeblikksbildet og er ikke sammenlignet med tidligere tider.)']
        if uten:
            ut += ['', f'### Google har ingen tider ({len(uten)})'] + [linje(r) for r in uten]
        if a.lagre and not feil:
            forrige.update(nye)
            with open(BILDE, 'w', encoding='utf-8') as fil:
                json.dump(dict(sorted(forrige.items())), fil, ensure_ascii=False, indent=0)
                fil.write('\n')
            ut += ['', f'Øyeblikksbildet er oppdatert ({len(nye)} steder).']
    print('\n'.join(ut))
    sys.exit(2 if feil else 0)


if __name__ == '__main__':
    main()
