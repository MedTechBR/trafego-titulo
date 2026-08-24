#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Validador do banco de questões do TráfegoTítulo.

Roda a cada lote: python3 valida_banco.py
Sai com código 1 se houver erro DURO. Avisos não derrubam o build.

Checa (duros):
  - banco.js/taxonomia.js parseáveis como JSON estrito
  - campos obrigatórios; gab dentro do range; tema existente na taxonomia
  - comentário presente em TODAS as questões (>=150 chars) + porAlt completo
  - exatamente 5 alternativas (formato AMB/ABRAMET)
  - comprimento de TODAS as alternativas entre 95% e 108% da correta
  - alternativa duplicada (normalizada) na mesma questão
  - prefixo de letra ("A)", "b.", etc.) dentro do texto da alternativa
  - colisão de chave (duas questões com o mesmo hash de enunciado)
  - 'base' (âncora normativa) presente em todas
  - fonte malformada (se presente, exige banca+ano)
Mede (métricas/avisos):
  - % de questões em que a correta é a mais longa (indicador bruto)
  - folga percentual da correta sobre a 2ª maior (a métrica honesta; mediana alvo <=6%)
  - termos absolutos concentrados nos distratores; cautelosos só na correta
  - distrator longo sem acento ao lado de correta acentuada
  - distribuição do gabarito
  - cobertura por tema (alvo 30 questões/tema)
"""
import json, os, re, sys, unicodedata, statistics

RAIZ = os.path.dirname(os.path.abspath(__file__))

def carrega_js(nome, var):
    txt = open(os.path.join(RAIZ, nome), encoding="utf-8").read()
    m = re.search(r"window\." + var + r"\s*=\s*(\[.*\])\s*;?\s*$", txt, re.S)
    if not m:
        print(f"ERRO DURO: não achei window.{var} em {nome}"); sys.exit(1)
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError as e:
        print(f"ERRO DURO: {nome} não é JSON estrito: {e}"); sys.exit(1)

def normtxt(s):
    s = unicodedata.normalize("NFD", str(s))
    s = "".join(c for c in s if not ("̀" <= c <= "ͯ"))
    return re.sub(r"[^a-z0-9]", "", s.lower())

def b36(n):
    if n == 0: return "0"
    dig = "0123456789abcdefghijklmnopqrstuvwxyz"; out = ""
    while n: out = dig[n % 36] + out; n //= 36
    return out

def chave_q(q):
    """Réplica exata do hashTxt/chaveQ do app (djb2+FNV com Math.imul)."""
    t = normtxt(q.get("q", ""))
    h1, h2 = 5381, 0x811C9DC5
    for ch in t:
        c = ord(ch)
        h1 = ((h1 << 5) + h1 + c) & 0xFFFFFFFF
        h2 = ((h2 ^ c) * 0x01000193) & 0xFFFFFFFF
    return (b36(h1) + b36(h2))[:10]

ABSOLUTOS = re.compile(r"\b(sempre|nunca|jamais|apenas|somente|exclusivamente|todos?|nenhum[a]?|invariavelmente)\b", re.I)
CAUTELA   = re.compile(r"\b(pode(m)?|geralmente|costuma(m)?|tende(m)?|recomenda-se|habitualmente|em geral)\b", re.I)
PREFIXO   = re.compile(r"^\s*[A-Ea-e][\)\.\-–]\s")

def main():
    banco = carrega_js("banco.js", "BANCO")
    tax   = carrega_js("taxonomia.js", "TAXONOMIA")
    temas = {t["id"] for t in tax}
    duros, avisos = [], []
    chaves = {}
    correta_mais_longa = 0
    folgas = []
    dist_gab = {}
    por_tema = {t["id"]: 0 for t in tax}

    for i, q in enumerate(banco):
        rot = f"Q{i+1}"
        for campo in ("q", "alts", "gab", "tema", "coment"):
            if campo not in q: duros.append(f"{rot}: falta campo '{campo}'"); break
        else:
            alts, gab = q["alts"], q["gab"]
            if not isinstance(alts, list) or len(alts) != 5:
                duros.append(f"{rot}: a prova AMB/ABRAMET tem 5 alternativas — achei {len(alts) if isinstance(alts,list) else '?'}"); continue
            if not isinstance(gab, int) or not (0 <= gab < len(alts)):
                duros.append(f"{rot}: gab fora do range"); continue
            if q["tema"] not in temas:
                duros.append(f"{rot}: tema '{q['tema']}' não existe na taxonomia")
            if len(q.get("coment", "")) < 150:
                duros.append(f"{rot}: comentário ausente/curto (<150 chars) — obrigatório em TODAS")
            pa = q.get("porAlt")
            if not (isinstance(pa, list) and len(pa) == len(alts) and all(len(x) > 20 for x in pa)):
                duros.append(f"{rot}: porAlt ausente/incompleto (1 explicação por alternativa)")
            ch = chave_q(q)
            if ch in chaves: duros.append(f"{rot}: colisão de chave com {chaves[ch]} (enunciado igual/quase igual)")
            chaves[ch] = rot
            if len(q.get("base", "")) < 10:
                duros.append(f"{rot}: falta 'base' — toda questão precisa citar a norma/diretriz que a ancora")
            f = q.get("fonte")
            if f is not None and not (isinstance(f, dict) and f.get("banca") and f.get("ano")):
                duros.append(f"{rot}: fonte presente mas sem banca+ano")
            # alternativas
            norms = [normtxt(a) for a in alts]
            if len(set(norms)) != len(norms): duros.append(f"{rot}: alternativas duplicadas")
            for j, a in enumerate(alts):
                if PREFIXO.match(a): duros.append(f"{rot} alt {j}: prefixo de letra dentro do texto")
            Lc = len(alts[gab])
            for j, a in enumerate(alts):
                r = len(a) / Lc
                if not (0.95 <= r <= 1.08):
                    duros.append(f"{rot} alt {j}: comprimento {len(a)} = {r*100:.0f}% da correta ({Lc}) — fora de 95–108%")
            outras = [len(a) for j, a in enumerate(alts) if j != gab]
            if Lc > max(outras):
                correta_mais_longa += 1
                folgas.append((Lc - max(outras)) / max(outras) * 100)
            # tells de linguagem
            abs_err = sum(1 for j, a in enumerate(alts) if j != gab and ABSOLUTOS.search(a))
            if abs_err >= 2 and not ABSOLUTOS.search(alts[gab]):
                avisos.append(f"{rot}: termos absolutos concentrados nos distratores")
            if CAUTELA.search(alts[gab]) and not any(CAUTELA.search(a) for j, a in enumerate(alts) if j != gab):
                avisos.append(f"{rot}: linguagem cautelosa só na correta")
            tem_acento = lambda s: bool(re.search(r"[àáâãéêíóôõúç]", s, re.I))
            if tem_acento(alts[gab]):
                for j, a in enumerate(alts):
                    if j != gab and len(a) > 60 and not tem_acento(a):
                        avisos.append(f"{rot} alt {j}: distrator longo sem nenhum acento (tell visual)")
            dist_gab[gab] = dist_gab.get(gab, 0) + 1
            if q.get("tema") in por_tema: por_tema[q["tema"]] += 1

    n = len(banco)
    print(f"— Banco: {n} questões | chaves únicas: {len(chaves)}")
    if n:
        pct = correta_mais_longa / n * 100
        print(f"— Correta é a mais longa: {correta_mais_longa}/{n} = {pct:.1f}% (indicador bruto; após igualar tamanhos, ~55% é normal)")
        if folgas:
            print(f"— Folga da correta sobre a 2ª maior: mediana {statistics.median(folgas):.1f}% | máx {max(folgas):.1f}% (alvo mediana <=6%)")
        print(f"— Distribuição do gabarito: " + ", ".join(f"{chr(65+k)}:{v}" for k, v in sorted(dist_gab.items())))
        reais = sum(1 for q in banco if q.get("fonte"))
        print(f"— Procedência: {reais} de prova real, {n - reais} autorais")
    print("— Cobertura por tema (alvo 30):")
    for t in tax:
        c = por_tema[t["id"]]
        marca = "OK " if c >= 30 else f"FALTAM {30 - c}"
        print(f"    {t['nome']:<42} {c:>4}  {marca}")
    if avisos:
        print(f"\nAVISOS ({len(avisos)}):")
        for a in avisos: print("  ~", a)
    if duros:
        print(f"\nERROS DUROS ({len(duros)}):")
        for d in duros: print("  !", d)
        sys.exit(1)
    print("\nOK: nenhum erro duro.")

if __name__ == "__main__":
    main()
