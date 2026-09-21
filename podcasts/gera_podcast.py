# -*- coding: utf-8 -*-
"""Monta um episódio a partir de um roteiro .txt.

Formato do roteiro:
  # Título do episódio
  A: fala da apresentadora
  B: fala do apresentador
  [RAPIDA tema=aptidao n=12]     -> expande em rodada de questões do banco verificado
  [PAUSA 2]                       -> silêncio de 2 s

As questões da rodada rápida saem do banco já validado (lotes-questoes/*.json),
então o trecho de maior risco factual herda a verificação que já existe.
"""
import json,glob,os,re,subprocess,sys,random
from fala import normaliza

RAIZ=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOZ={"A":("Luciana",178),"B":("Rocko",172)}
LETRAS="ABCDE"

def banco():
    qs=[]
    for f in sorted(glob.glob(os.path.join(RAIZ,"lotes-questoes","leva*.json"))):
        qs+=json.load(open(f,encoding="utf-8"))
    return qs

def rodada(qs,tema,n,semente):
    pool=[q for q in qs if q["tema"]==tema]
    random.Random(semente).shuffle(pool)
    linhas=[]
    for i,q in enumerate(pool[:n],1):
        linhas.append(("A", f"Questão {i}. {q['q']}"))
        for j,a in enumerate(q["alts"]):
            linhas.append(("A", f"{LETRAS[j]}. {a}."))
        linhas.append(("PAUSA", 3))
        g=q["gab"]
        linhas.append(("B", f"Gabarito, letra {LETRAS[g]}."))
        # o porquê: primeira frase do comentário + a âncora normativa
        com=re.split(r"(?<=[.!?]) ", q["coment"])
        just=" ".join(com[:2])
        linhas.append(("B", just))
        linhas.append(("B", f"Fonte: {q['base']}"))
        linhas.append(("PAUSA", 1))
    return linhas

def le_roteiro(caminho,qs):
    out=[];titulo=None
    for ln in open(caminho,encoding="utf-8"):
        ln=ln.rstrip("\n")
        if not ln.strip() or ln.strip().startswith("//"): continue
        if ln.startswith("# "): titulo=ln[2:].strip(); continue
        m=re.match(r"\[RAPIDA tema=(\w+) n=(\d+)(?: semente=(\d+))?\]",ln.strip())
        if m:
            out+=rodada(qs,m.group(1),int(m.group(2)),int(m.group(3) or 42)); continue
        m=re.match(r"\[PAUSA ([\d.]+)\]",ln.strip())
        if m: out.append(("PAUSA",float(m.group(1)))); continue
        m=re.match(r"([AB]):\s*(.+)",ln)
        if m: out.append((m.group(1),m.group(2).strip())); continue
        raise SystemExit(f"linha não reconhecida em {caminho}:\n  {ln}")
    return titulo,out

def dur(f):
    o=subprocess.run(["afinfo",f],capture_output=True,text=True).stdout
    m=re.search(r"estimated duration: ([\d.]+)",o)
    return float(m.group(1)) if m else 0.0

def monta(roteiro,saida_dir):
    qs=banco()
    titulo,linhas=le_roteiro(roteiro,qs)
    base=os.path.splitext(os.path.basename(roteiro))[0]
    tmp=os.path.join(saida_dir,"_tmp_"+base); os.makedirs(tmp,exist_ok=True)
    pedacos=[];palavras=0
    for i,(quem,txt) in enumerate(linhas):
        f=os.path.join(tmp,f"{i:04d}.aiff")
        if quem=="PAUSA":
            subprocess.run(["ffmpeg","-y","-f","lavfi","-i",
                            f"anullsrc=r=22050:cl=mono","-t",str(txt),f],
                           capture_output=True,check=True)
        else:
            voz,rate=VOZ[quem]
            fala=normaliza(txt)
            palavras+=len(fala.split())
            subprocess.run(["say","-v",voz,"-r",str(rate),"-o",f,fala],check=True)
        pedacos.append(f)
    lista=os.path.join(tmp,"lista.txt")
    with open(lista,"w") as fh:
        for p in pedacos: fh.write(f"file '{os.path.abspath(p)}'\n")
    m4a=os.path.join(saida_dir,base+".m4a")
    subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",lista,
                    "-ar","22050","-ac","1","-c:a","aac","-b:a","48k",
                    "-metadata",f"title={titulo}",
                    "-metadata","artist=TráfegoTítulo",
                    "-metadata","album=Revisão para a prova de título — Medicina do Tráfego",
                    "-metadata","genre=Podcast", m4a],capture_output=True,check=True)
    d=dur(m4a)
    subprocess.run(["rm","-rf",tmp])
    return {"arquivo":m4a,"titulo":titulo,"minutos":round(d/60,1),
            "palavras":palavras,"falas":len(linhas),"mb":round(os.path.getsize(m4a)/1048576,1)}

if __name__=="__main__":
    saida=os.path.join(os.path.dirname(os.path.abspath(__file__)),"audio")
    os.makedirs(saida,exist_ok=True)
    for r in sys.argv[1:]:
        info=monta(r,saida)
        print(f"{info['minutos']:>5.1f} min | {info['palavras']:>5} palavras | "
              f"{info['mb']:>4} MB | {os.path.basename(info['arquivo'])}  — {info['titulo']}")
