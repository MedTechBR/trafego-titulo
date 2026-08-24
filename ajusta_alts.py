#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ajusta o comprimento de alternativas casando por PREFIXO de texto (não por índice,
que muda depois do equilibra_gabarito). Recebe pares prefixo -> lista de variantes e
escolhe a primeira que cai na faixa de 95–108% da correta.

Uso no código:
    from ajusta_alts import ajusta
    ajusta("lotes-questoes/levaX.json", [
        ("Prefixo da alternativa", ["variante 1", "variante 2", ...]),
    ])
"""
import json, sys

def ajusta(arq, pares, verbose=True):
    b = json.load(open(arq, encoding="utf-8"))
    pend = []
    for prefixo, variantes in pares:
        achou = False
        for q in b:
            for j, a in enumerate(q["alts"]):
                if not a.startswith(prefixo[:40]):
                    continue
                achou = True
                Lc = len(q["alts"][q["gab"]])
                lo, hi = Lc * 0.95, Lc * 1.08
                escolha = next((v for v in variantes if lo <= len(v) <= hi), None)
                if escolha is None:
                    pend.append((prefixo[:50], round(lo), int(hi), [len(v) for v in variantes]))
                else:
                    q["alts"][j] = escolha
                    if verbose:
                        print(f"  ok  [{len(escolha)}] em {round(lo)}-{int(hi)}: {prefixo[:45]}…")
        if not achou:
            pend.append((prefixo[:50], "PREFIXO NÃO ENCONTRADO", None, None))
    json.dump(b, open(arq, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    if pend:
        print("\nPENDENTES (nenhuma variante coube):")
        for p in pend:
            print("  !", p)
    return not pend

if __name__ == "__main__":
    print(__doc__)
