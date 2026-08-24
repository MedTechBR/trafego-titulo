#!/bin/bash
# Sobe o TráfegoTítulo em http://localhost:8623 (duplo clique) e abre o navegador.
cd "$(dirname "$0")"
( sleep 1 && open "http://localhost:8623" ) &
exec python3 -m http.server 8623
