#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Monta banco.js a partir de lotes-questoes/leva*.json (ordem alfabética) e valida.

banco.js é GERADO — não editar à mão. Para mexer numa questão, edite a leva
correspondente e rode: python3 monta_banco.py
"""
import glob, json, os, subprocess, sys

RAIZ = os.path.dirname(os.path.abspath(__file__))

def main():
    banco = []
    for arq in sorted(glob.glob(os.path.join(RAIZ, "lotes-questoes", "leva*.json"))):
        leva = json.load(open(arq, encoding="utf-8"))
        print(f"  {os.path.basename(arq)}: {len(leva)} questões")
        banco.extend(leva)
    with open(os.path.join(RAIZ, "banco.js"), "w", encoding="utf-8") as f:
        f.write("window.BANCO=")
        json.dump(banco, f, ensure_ascii=False, indent=0)
        f.write(";\n")
    print(f"banco.js gerado: {len(banco)} questões\n")
    r = subprocess.run([sys.executable, os.path.join(RAIZ, "valida_banco.py")])
    sys.exit(r.returncode)

if __name__ == "__main__":
    main()
