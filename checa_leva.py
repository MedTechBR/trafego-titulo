#!/usr/bin/env python3
"""Aponta as alternativas fora da faixa 95–108% ANTES de montar o banco.
Uso: python3 checa_leva.py lotes-questoes/leva3-*.json"""
import json,sys
for arq in sys.argv[1:]:
    b=json.load(open(arq,encoding="utf-8"))
    print(f"=== {arq}: {len(b)} questões")
    for i,q in enumerate(b,1):
        alts=q["alts"]; g=q["gab"]; Lc=len(alts[g])
        if len(alts)!=5: print(f"  Q{i}: {len(alts)} ALTERNATIVAS!")
        prob=[(j,len(a)) for j,a in enumerate(alts) if not(0.95<=len(a)/Lc<=1.08)]
        if prob:
            print(f"  Q{i} correta={Lc} alvo={round(Lc*0.95)}-{int(Lc*1.08)}")
            for j,L in prob: print(f"     alt{j} {L}: {alts[j]}")
