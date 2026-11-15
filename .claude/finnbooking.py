#!/usr/bin/env python3
"""Foreslår bookinglenker (`- booking:`) for restauranter i data/*.md ut fra nettsiden deres.

Henter `nettside:` for restauranter uten `booking:`, leter etter lenker og innebygde URL-er til bookingtjenester
(SevenRooms, OpenTable, Resy, Tock, Zenchef, TableCheck, DinnerBooking, easytable o.l.) og etter stedets egen
«Book/Reserve/Bestill»-side. Finner den bare en egen side, hentes også den, og tjenestelenker der går foran.

  python3 .claude/finnbooking.py                 forslag for alle restauranter uten booking:
  python3 .claude/finnbooking.py --by oslo       begrens til noen byer (kommaliste)
  python3 .claude/finnbooking.py --skriv         legg førstevalget inn som `- booking:` etter `- nettside:`
  python3 .claude/finnbooking.py --alle          ta med restauranter som har booking:, og vis avvik fra den

Forslagene må sjekkes: kjeder har én bookingside per filial, og førstevalget kan være feil filial
(se om navn eller adresse i lenken passer). «flere» i utskriften betyr at siden hadde flere kandidater.
Sider som bygges med JavaScript gir ofte ingen treff; da må bookingsiden finnes i nettleserpanelet.
"""
import argparse
import glob
import html
import os
import re
import sys
import unicodedata
import urllib.error
import urllib.parse as up
import urllib.request
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from googlesjekk import ROT, UA, les_by  # noqa: E402

TJENESTE = re.compile(
    r'sevenrooms\.com/(explore/[^/]+/reservations|reservations/)|opentable\.[a-z.]+/(r/|booking/restref|restref/client)'
    r'|resy\.com/cities|exploretock\.com|tablecheck\.com/[^/]+/[^/]+/reserve|bookings\.zenchef|thefork\.|dinnerbooking'
    r'|resdiary|formitable|designmynight|tablein|superbexperience|gastroplanner|munu\.app|bokabord|easytable'
    r'|covermanager|meitre|toreta|omakase\.in|ebica|resos|quandoo|guestplan|dojo\.app/create_booking|tableo|capricebookings', re.I)
KNAPP = re.compile(r'reserv|book|bestill|réserv|reserva|予約|\bbord\b|\btable\b', re.I)
BORT = re.compile(
    r'gift|voucher|gavekort|shop\.|subscription|private|group|gruppe|policy|cookbook|/books|waitlist|event|experience'
    r'|richtlinie|lookbook|guestbook|tour|christmas|/pdr|\.pdf|%3c|%5c|careers|jobs|newsletter|facebook|instagram|google|\.(css|js|png|jpe?g|svg|woff2?)(\?|$)', re.I)
STØY = re.compile(r'^(_gl.*|utm_.*|button_.*|hide.*|correlationId|corrid|date|default_date|r3uid|color|dark|font|ot_logo|ot_source|otSource'
                  r'|primary|tracking|client_id|lang|logoPid|backgroundPid|searchTab|halo|start_time'
                  r'|venues|seats|partySize|gclid|gclsrc|avt|sd|fullscreen|includeJquery|ot_campaign)$'
                  r'|^restRef$')


def hent(url):
    """(endelig URL, HTML) eller (None, '') ved feil."""
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'en,no;q=0.8'})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.geturl(), r.read(3_000_000).decode('utf-8', 'ignore')
    except urllib.error.HTTPError as e:  # 403-sider har ofte likevel innhold
        return url, e.read(3_000_000).decode('utf-8', 'ignore')
    except Exception:
        return None, ''


def rens(u):
    u = html.unescape(html.unescape(u)).replace('\\/', '/').rstrip(',;}"\'\\')
    try:
        p = up.urlsplit(u)
    except ValueError:  # ødelagt URL i skriptkode
        return ''
    q = [(k, v) for k, v in up.parse_qsl(p.query) if not STØY.match(k)]
    return up.urlunsplit((p.scheme, p.netloc, p.path, up.urlencode(q, safe=',%'), ''))


def vert(u):
    return up.urlsplit(u).netloc.lower().removeprefix('www.')


def lik(a, b):
    """Samme lenke uansett http/https, www og skråstrek på slutten."""
    n = lambda u: re.sub(r'^https?://(www\.)?', '', u).rstrip('/').lower()  # noqa: E731
    return n(a) == n(b)


def kandidater(side, kilde):
    """(tjenestelenker, egne bookingsider) i rekkefølgen de står på siden."""
    tj, egne = [], []
    for m in re.finditer(r'<a\b[^>]*?href=["\']([^"\'#]+)["\'][^>]*>(.*?)</a>', side, re.S | re.I):
        h = html.unescape(m.group(1)).strip()
        if h.startswith(('mailto:', 'tel:', 'javascript:')):
            continue
        try:
            u = rens(up.urljoin(kilde, h))
        except ValueError:
            continue
        tekst = html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', m.group(2)))).strip()
        if not u or '{' in u or BORT.search(u + ' ' + tekst):
            continue
        if TJENESTE.search(u):
            tj.append(u)
        elif vert(u) == vert(kilde) and up.urlsplit(u).path.strip('/') and (
                KNAPP.search(tekst) or re.search(r'book|reserv|bestill', up.urlsplit(u).path, re.I)):
            egne.append(u)
    for m in re.finditer(r'https?:(?://|\\/\\/)[^\s"\'<>]+', side):  # innebygde widgeter og skript-URL-er
        u = rens(m.group(0))
        if TJENESTE.search(u) and '{' not in u and not BORT.search(u):
            tj.append(u)
    unik = lambda xs: list(dict.fromkeys(xs))  # noqa: E731
    return unik(tj), unik(egne)


VANLIGE = {'the', 'and', 'restaurant', 'restaurante', 'bar', 'cafe', 'kitchen', 'dining', 'grill', 'bistro', 'trattoria'}


def navnetreff(navn):
    """Sorteringsnøkkel: lenker som inneholder ord fra stedsnavnet (f.eks. filialen i en kjede) først."""
    ascii_ = ''.join(c for c in unicodedata.normalize('NFKD', navn.lower()) if not unicodedata.combining(c))
    ord_ = [o for o in re.findall(r'[a-z0-9]{3,}', ascii_) if o not in VANLIGE]
    return lambda u: -sum(o in u.lower() for o in ord_)


def finn(sted):
    kilde, side = hent(sted['nettside'])
    if not kilde:
        return sted, [], 'nettsiden svarte ikke'
    tj, egne = kandidater(side, kilde)
    if not tj and egne:  # følg den egne bookingsiden ett steg
        k2, s2 = hent(egne[0])
        if k2:
            tj = kandidater(s2, k2)[0]
    forslag = sorted(tj, key=navnetreff(sted['navn'])) + egne
    return sted, forslag, '' if forslag else 'ingen treff (JavaScript-side? sjekk i nettleserpanelet)'


def restauranter(byer, alle=False):
    for fil in sorted(glob.glob(os.path.join(ROT, 'data', '*.md'))):
        by = os.path.basename(fil)[:-3]
        if byer and by not in byer:
            continue
        for s in les_by(fil):
            f = s['felt']
            if s['kategori'].startswith('Restaurant') and (alle or not f.get('booking')) \
                    and re.match(r'https?://', f.get('nettside', '')) and 'instagram.com' not in f['nettside']:
                yield {'by': by, 'fil': fil, 'navn': s['navn'], 'nettside': f['nettside'], 'booking': f.get('booking', '')}


def skriv(sted, url):
    """Setter inn `- booking:` rett etter `- nettside:` hos stedet. True hvis det gikk."""
    linjer = open(sted['fil'], encoding='utf-8').read().split('\n')
    kategori, inne = '', False
    for i, l in enumerate(linjer):
        if l.startswith('## '):
            kategori = l[3:].strip()
        if l.startswith('#'):
            inne = l.startswith('### ') and kategori.startswith('Restaurant') \
                and l[4:].replace('★', '').strip() == sted['navn']
        elif inne and l.startswith('- nettside:'):
            linjer.insert(i + 1, '- booking: ' + url)
            open(sted['fil'], 'w', encoding='utf-8').write('\n'.join(linjer))
            return True
    return False


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--by', help='kommaliste med byer (filnavn uten .md)')
    ap.add_argument('--skriv', action='store_true', help='skriv førstevalget inn i data/*.md')
    ap.add_argument('--alle', action='store_true', help='ta med restauranter som har booking:, og vis avvik')
    a = ap.parse_args()
    if a.skriv and a.alle:
        ap.error('--skriv og --alle kan ikke brukes sammen')
    steder = list(restauranter(set(a.by.split(',')) if a.by else None, a.alle))
    if not steder:
        print('Ingen restauranter uten booking: med nettside.')
        return
    with ThreadPoolExecutor(8) as ex:
        svar = sorted(ex.map(finn, steder), key=lambda x: (x[0]['by'], x[0]['navn']))
    funnet = like = 0
    for sted, forslag, merknad in svar:
        hode = f"{sted['by']} | {sted['navn']}"
        if sted['booking']:
            if forslag and lik(sted['booking'], forslag[0]):
                like += 1
                continue
            hode += f"\n  = {sted['booking']} (nå)"
        if not forslag:
            print(f'{hode}\n  – {merknad}')
            continue
        funnet += 1
        flere = f'  (flere: {len(forslag) - 1})' if len(forslag) > 1 else ''
        print(f'{hode}\n  → {forslag[0]}{flere}')
        for u in forslag[1:4]:
            print(f'    {u}')
        if a.skriv and not skriv(sted, forslag[0]):
            print('  ! fant ikke stedet i fila, ikke skrevet')
    if a.alle:
        print(f'\n{like} av {len(svar)} med samme førstevalg som booking:, {funnet} med annet forslag')
    else:
        print(f'\n{funnet} av {len(svar)} med forslag' + (' (skrevet inn – sjekk diffen)' if a.skriv and funnet else ''))


if __name__ == '__main__':
    main()
