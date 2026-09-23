#!/usr/bin/env python3
"""Lista os enunciados já existentes de um ou mais temas (para não repetir questão).
Uso: python3 lista_tema.py aptidao legislacao"""
import json, glob, os, sys
RAIZ = os.path.dirname(os.path.abspath(__file__))
temas = set(sys.argv[1:])
for arq in sorted(glob.glob(os.path.join(RAIZ, "lotes-questoes", "leva*.json"))):
    for q in json.load(open(arq, encoding="utf-8")):
        if not temas or q["tema"] in temas:
            print(f"[{q['tema']}] {q['q']}  => {q['alts'][q['gab']]}")
