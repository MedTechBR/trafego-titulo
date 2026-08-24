#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Redistribui a posição do gabarito nas levas para que A–E fiquem equilibrados.

RODAR UMA VEZ POR LEVA, ANTES DE PUBLICAR. Depois de o app estar em uso, NÃO rodar
de novo: as respostas gravadas guardam o ÍNDICE da alternativa escolhida, e remexer
na ordem faria o histórico apontar para a alternativa errada (mesmo erro do
"progresso por posição" que já queimou o app de farmácia).

Uso: python3 equilibra_gabarito.py lotes-questoes/leva1-*.json
"""
import json, sys, random

def equilibra(arq, semente=20260924):
    b = json.load(open(arq, encoding="utf-8"))
    rnd = random.Random(semente)
    n = len(b)
    # alvo: distribuição o mais uniforme possível entre as 5 posições
    alvos = [i % 5 for i in range(n)]
    rnd.shuffle(alvos)
    for q, alvo in zip(b, alvos):
        alts, pa, g = q["alts"], q.get("porAlt"), q["gab"]
        if len(alts) != 5 or alvo == g:
            q["gab"] = g if len(alts) != 5 else alvo
            if len(alts) != 5:
                continue
        # move a correta para a posição alvo, preservando a ordem relativa das demais
        outras_a = [a for i, a in enumerate(alts) if i != g]
        outras_p = [p for i, p in enumerate(pa) if i != g] if pa else None
        novas_a = outras_a[:alvo] + [alts[g]] + outras_a[alvo:]
        q["alts"] = novas_a
        if pa:
            q["porAlt"] = outras_p[:alvo] + [pa[g]] + outras_p[alvo:]
        q["gab"] = alvo
    json.dump(b, open(arq, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    dist = {}
    for q in b:
        dist[q["gab"]] = dist.get(q["gab"], 0) + 1
    print(f"{arq}: " + ", ".join(f"{chr(65+k)}:{v}" for k, v in sorted(dist.items())))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("uso: python3 equilibra_gabarito.py <leva.json> [...]")
    for a in sys.argv[1:]:
        equilibra(a)
