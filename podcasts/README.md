# Podcasts de revisão — TráfegoTítulo

Dez episódios de ~30 min cobrindo os 21 temas do conteúdo programático, em ordem
decrescente de peso esperado na prova. Feitos para ouvir dirigindo ou caminhando.

## Como cada episódio é montado

Cada episódio tem duas partes:

1. **Narrativa em diálogo** (~15 min) — dois apresentadores, escrita a partir das
   fontes primárias: CTB compilado, Resolução CONTRAN 927/2022 e diretrizes da ABRAMET.
2. **Rodada rápida** (~13 min) — questões sorteadas do **banco já validado**
   (`lotes-questoes/*.json`), com enunciado, alternativas, 3 s de pausa para responder,
   gabarito, o porquê e a âncora normativa.

A segunda parte é gerada por código a partir do banco. Isso é deliberado: é o trecho de
maior risco factual, e assim ele **herda a verificação que as 504 questões já passaram**
em vez de ser reescrito de memória.

## Regenerar

```bash
cd podcasts
python3 gera_podcast.py roteiros/ep01-aptidao.txt        # um episódio
python3 gera_podcast.py roteiros/*.txt                   # todos
```

Saída em `audio/*.m4a` (mono, 22 kHz, AAC 48 kbps — ~12 MB por episódio).
Leva ~4 a 5 min por episódio; rode em segundo plano.

## Formato do roteiro

```
# Título do episódio
A: fala da apresentadora (voz Luciana)
B: fala do apresentador (voz Rocko)
[RAPIDA tema=aptidao n=7 semente=11]   -> expande a rodada de questões
[PAUSA 2]                               -> silêncio de 2 s
```

`tema` casa com o `id` da taxonomia. `semente` fixa o sorteio, para que regenerar
o episódio dê o mesmo resultado.

## `fala.py` — por que existe

O `say` do macOS lê "art. 147, §2º" e "20/30" de forma ininteligível. O `fala.py`
expande tudo antes: artigos, parágrafos, incisos romanos, leis com ano, datas,
acuidades, decibéis, percentuais, unidades e siglas.

**Armadilha que já custou caro:** a classe `[ºo°]` com `IGNORECASE` casava a
**palavra "no"** e transformava "prevista no CTB" em "prevista número CTB". Ao mexer
nessas regras, rode a varredura sobre o banco inteiro — o alvo é **zero** resto:

```bash
python3 -c "
from gera_podcast import banco; from fala import normaliza; import re
qs=banco()
r=[m.group(0) for q in qs for t in [q['q'],q['base'],q['coment']]+q['alts']
   for m in re.finditer(r'\S*[\d§ºª×≥≤]\S*', normaliza(t))]
print('restos:', len(r), r[:5])"
```

## Vozes

`VOZ` em `gera_podcast.py`. O macOS tem 9 vozes pt-BR (`say -v '?' | grep pt_BR`).
Padrão: Luciana (A) e Rocko (B). Trocar a voz não exige mexer em mais nada.
