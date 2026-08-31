#!/usr/bin/env python3
"""Baixa PDF por FAIXAS DE BYTES (servidores gov.br/abramet cortam transferencias longas).
uso: chunk2.py <url> <saida> [tamanho_chunk]"""
import sys, subprocess, os

url, out = sys.argv[1], sys.argv[2]
CH = int(sys.argv[3]) if len(sys.argv) > 3 else 200_000

def gethdr():
    r = subprocess.run(['curl','-skL','--max-time','60','-r','0-0','-D','-','-o','/dev/null',url],
                       capture_output=True, text=True)
    for ln in r.stdout.splitlines():
        if ln.lower().startswith('content-range:'):
            return int(ln.split('/')[-1].strip())
    raise SystemExit('sem Content-Range: servidor nao aceita faixas')

total = gethdr()
print(f'total={total} bytes, chunks de {CH}')
with open(out,'wb') as f:
    ini = 0
    while ini < total:
        fim = min(ini+CH-1, total-1)
        for tent in range(5):
            r = subprocess.run(['curl','-skL','--max-time','120','-r',f'{ini}-{fim}','-o','-',url],
                               capture_output=True)
            if len(r.stdout) == fim-ini+1:
                f.write(r.stdout); break
            print(f'  faixa {ini}-{fim}: veio {len(r.stdout)}, tentativa {tent+1}')
        else:
            raise SystemExit(f'falhou na faixa {ini}-{fim}')
        print(f'  ok {ini}-{fim}')
        ini = fim+1
got = os.path.getsize(out)
print(f'FIM {got}/{total} {"OK" if got==total else "INCOMPLETO"}')
