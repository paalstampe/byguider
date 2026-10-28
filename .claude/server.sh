#!/bin/bash
# Lokal server for byguidene: http://localhost:<port>/ (standard 8000), bare på 127.0.0.1.
# Sender «Cache-Control: no-store», så nettleseren alltid henter ferske data/*.md og geometri
# (python3 -m http.server lar nettleseren mellomlagre, og endringer ser ut til å utebli).
# Bruk: .claude/server.sh [port]      (kjør i bakgrunnen; stopp med pkill -f .claude/server.sh)
cd "$(dirname "$0")/.." || exit 1
PORT="${1:-8000}"
# Skriptets sti sendes med (ubrukt), så «pkill -f .claude/server.sh» finner Python-prosessen etter exec.
exec python3 - "$PORT" "$0" <<'PY'
import functools, http.server, sys
class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
port = int(sys.argv[1])
print(f'Byguider: http://localhost:{port}/', flush=True)
http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Handler, directory='.')).serve_forever()
PY
