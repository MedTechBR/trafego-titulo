# -*- coding: utf-8 -*-
"""Normaliza texto para o `say` do macOS falar em português correto.
O banco de questões é cheio de "art. 147", "§2º", "20/30", "0,3 mg/L", "dB" —
o sintetizador lê tudo isso errado se não for expandido antes."""
import re

U=["zero","um","dois","três","quatro","cinco","seis","sete","oito","nove","dez",
   "onze","doze","treze","catorze","quinze","dezesseis","dezessete","dezoito","dezenove"]
D=["","","vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"]
C=["","cento","duzentos","trezentos","quatrocentos","quinhentos","seiscentos",
   "setecentos","oitocentos","novecentos"]

def extenso(n):
    n=int(n)
    if n<0: return "menos "+extenso(-n)
    if n<20: return U[n]
    if n<100:
        d,r=divmod(n,10)
        return D[d]+(" e "+U[r] if r else "")
    if n<1000:
        c,r=divmod(n,100)
        if n==100: return "cem"
        return C[c]+(" e "+extenso(r) if r else "")
    if n<1000000:
        m,r=divmod(n,1000)
        mil="mil" if m==1 else extenso(m)+" mil"
        if not r: return mil
        return mil+(" e " if r<100 or r%100==0 else " ")+extenso(r)
    mi,r=divmod(n,1000000)
    s=("um milhão" if mi==1 else extenso(mi)+" milhões")
    return s+(" e "+extenso(r) if r else "")

ORD={1:"primeiro",2:"segundo",3:"terceiro",4:"quarto",5:"quinto",6:"sexto",7:"sétimo",
     8:"oitavo",9:"nono",10:"décimo"}

ROMANO={"I":1,"V":5,"X":10,"L":50,"C":100,"D":500,"M":1000}
def de_romano(s):
    t=0;p=0
    for ch in reversed(s.upper()):
        v=ROMANO.get(ch,0)
        t = t-v if v<p else t+v
        p=max(p,v)
    return t

SIGLAS={
 "CTB":"Cê Tê Bê","CNH":"Cê Éne Agá","ACC":"A Cê Cê","CONTRAN":"Contran",
 "CETRAN":"Cetran","CONTRANDIFE":"Contrandife","SENATRAN":"Senatran","DENATRAN":"Denatran",
 "RENACH":"Renach","RNPC":"Érre Éne Pê Cê","CFM":"Cê Éfe Éme","CFP":"Cê Éfe Pê",
 "ABNT":"A Bê Éne Tê","NBR":"Éne Bê Érre","ABRAMET":"Abramet","AMB":"A Éme Bê",
 "OMS":"Ó Éme Ésse","PRF":"Pê Érre Éfe","INMETRO":"Inmetro","IPCA":"I Pê Cê A",
 "SAOS":"Sá-os","DPVAT":"Dê Pê Vê A Tê","SPVAT":"Ésse Pê Vê A Tê","EAFM":"exame de aptidão física e mental",
 "MEEM":"Mini Exame do Estado Mental","CDR":"Cê Dê Érre","TUG":"Tág","FAC":"Éfe A Cê",
 "SDLP":"Ésse Dê Éle Pê","THC":"Tê Agá Cê","MDMA":"Éme Dê Éme A","LIO":"lente intraocular",
 "APH":"atendimento pré-hospitalar","PCR":"parada cardiorrespiratória","DEA":"Dê É A",
 "PcD":"pessoa com deficiência","LGPD":"Éle Gê Pê Dê","CLT":"Cê Éle Tê","SUS":"Ésse U Ésse",
}

UNID=[
 (r"\bmg/L\b","miligramas por litro"),(r"\bg/L\b","gramas por litro"),
 (r"\bdg/L\b","decigramas por litro"),(r"\bg/dL\b","gramas por decilitro"),
 (r"\bmg/dL\b","miligramas por decilitro"),(r"\bkm/h\b","quilômetros por hora"),
 (r"\bdB\b","decibéis"),(r"\bHz\b","hertz"),(r"\bmmHg\b","milímetros de mercúrio"),
 (r"\bng/mL\b","nanogramas por mililitro"),(r"\bmcg\b","microgramas"),
 (r"\bkg/m²\b","quilos por metro quadrado"),(r"\bkg\b","quilos"),
 (r"\bcm\b","centímetros"),(r"\bmm\b","milímetros"),(r"\bm²\b","metros quadrados"),
 (r"\bº\b"," graus"),(r"\bh\b","horas"),
]

def normaliza(t):
    t=str(t)
    # artigos, incisos, parágrafos
    t=re.sub(r"\barts\.\s*", "artigos ", t, flags=re.I)
    t=re.sub(r"\bH1\b", "agá um", t)
    t=re.sub(r"\bart\.?\s*(\d+)\s*º?\s*-?\s*([A-Z])?\b", lambda m:"artigo "+extenso(m.group(1))+(" "+m.group(2) if m.group(2) else ""), t, flags=re.I)
    t=re.sub(r"§+\s*(\d+)º?", lambda m:"parágrafo "+ORD.get(int(m.group(1)),extenso(m.group(1))), t)
    t=re.sub(r"\bincisos?\s+([IVXLC]+)\b", lambda m:"inciso "+extenso(de_romano(m.group(1))), t, flags=re.I)
    t=re.sub(r"\bAnexos?\s+([IVXLC]+)\b", lambda m:"Anexo "+extenso(de_romano(m.group(1))), t)
    t=re.sub(r"\b(\d+)º", lambda m:ORD.get(int(m.group(1)),extenso(m.group(1))), t)
    t=re.sub(r"\b(\d+)ª", lambda m:ORD.get(int(m.group(1)),extenso(m.group(1))).replace("o","a") if int(m.group(1))<=10 else extenso(m.group(1)), t)
    # leis e resoluções: 14.071/2020 -> catorze mil e setenta e um, de dois mil e vinte
    t=re.sub(r"\b(\d{1,3})\.(\d{3})/(\d{4})\b",
             lambda m:extenso(m.group(1)+m.group(2))+", de "+extenso(m.group(3)), t)
    # número X/AAAA (resoluções, portarias) antes da regra de "nº" solto
    # ATENÇÃO: só o indicador ordinal (nº / n°). Incluir "o" na classe com IGNORECASE
    # fazia a PALAVRA "no" virar "número" ("prevista no CTB" -> "prevista número CTB").
    t=re.sub(r"\bn[º°]\s*(\d[\d.]*)/(\d{4})\b",
             lambda m:"número "+extenso(m.group(1).replace(".",""))+", de "+extenso(m.group(2)), t)
    t=re.sub(r"\bn[º°]\s*(\d[\d.]*)", lambda m:"número "+extenso(m.group(1).replace(".","")), t)
    t=re.sub(r"\bn[º°](?=[\s\d])", "número", t)
    # romano solto (inciso citado sem a palavra): ", II do", "inciso V,"
    t=re.sub(r"(?<=[,\s])(I{2,3}|IV|VI{0,3}|IX|XI{0,2}|XIV|XV I?|XVI{0,3}|XIX|XXI?I?)(?=[,.;:\s])",
             lambda m:"inciso "+extenso(de_romano(m.group(1).replace(" ",""))), t)
    # horas do relógio: 21h, 6h
    t=re.sub(r"\b(\d{1,2})h(\d{2})\b", lambda m:extenso(m.group(1))+" e "+extenso(m.group(2)), t)
    t=re.sub(r"\b(\d{1,2})h\b", lambda m:extenso(m.group(1))+" horas", t)
    # pressão arterial: 136x88
    t=re.sub(r"\b(\d{2,3})\s*[x×]\s*(\d{2,3})\b", lambda m:extenso(m.group(1))+" por "+extenso(m.group(2)), t)
    # códigos CID: F20, G40.9
    t=re.sub(r"\bCID-?\s*(\d+)\b", lambda m:"CID "+extenso(m.group(1)), t)
    t=re.sub(r"\b([A-Z])(\d{2})(?:\.(\d))?\b",
             lambda m:m.group(1)+" "+extenso(m.group(2))+(" ponto "+extenso(m.group(3)) if m.group(3) else ""), t)
    # itens de anexo: 1.1.1, 3.1 -> "um ponto um ponto um"
    t=re.sub(r"(?<![\d/])(\d{1,2}(?:\.\d{1,2}){1,3})(?![\d/])",
             lambda m:" ponto ".join(extenso(x) for x in m.group(1).split(".")), t)
    # datas dd/mm/aaaa
    MES=["","janeiro","fevereiro","março","abril","maio","junho","julho","agosto",
         "setembro","outubro","novembro","dezembro"]
    t=re.sub(r"\b(\d{1,2})/(\d{1,2})/(\d{4})\b",
             lambda m:extenso(m.group(1))+" de "+MES[int(m.group(2))]+" de "+extenso(m.group(3)), t)
    # acuidade 20/30
    t=re.sub(r"\b(\d+)/(\d+)\b", lambda m:extenso(m.group(1))+" barra "+extenso(m.group(2)), t)
    # datas dd/mm/aaaa já cobertas acima; percentuais e decimais
    t=re.sub(r"(\d+),(\d+)\s*%", lambda m:extenso(m.group(1))+" vírgula "+extenso(m.group(2))+" por cento", t)
    t=re.sub(r"(\d+)\s*%", lambda m:extenso(m.group(1))+" por cento", t)
    t=re.sub(r"(\d+),(\d+)", lambda m:extenso(m.group(1))+" vírgula "+extenso(m.group(2)), t)
    # unidades
    for p,r in UNID: t=re.sub(p,r,t)
    # siglas
    for s,r in sorted(SIGLAS.items(), key=lambda x:-len(x[0])):
        t=re.sub(r"\b"+re.escape(s)+r"\b", r, t)
    # milhares com ponto e números soltos
    t=re.sub(r"\b(\d{1,3})(?:\.(\d{3}))+\b", lambda m:extenso(m.group(0).replace(".","")), t)
    t=re.sub(r"\b\d+\b", lambda m:extenso(m.group(0)), t)
    # limpeza
    t=t.replace("≥","igual ou maior que ").replace("≤","igual ou menor que ")
    t=t.replace("×"," vezes ").replace("–","-").replace("—","-")
    t=re.sub(r"\s+"," ",t).strip()
    return t

if __name__=="__main__":
    testes=["art. 147, §2º, II do CTB","Lei nº 14.071/2020","acuidade 20/30 e 20/40",
            "0,3 mg/L de ar alveolar","média de 40 dB nas frequências de 500, 1000 e 2000 Hz",
            "Anexo VIII","risco 23× maior","30,2% dos sinistros","643.231 sinistros"]
    for x in testes: print(f"{x!r:>55}  ->  {normaliza(x)}")
