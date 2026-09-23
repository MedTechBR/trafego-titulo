# Briefing — redação de questões novas (TráfegoTítulo, prova 27/09/2026)

Projeto: `~/Documents/Claude/trafego-titulo/` (leia a seção "Rigor de conteúdo" e "Receita de fechamento de leva" do `CLAUDE.md`).
Prova: Título de Especialista em Medicina do Tráfego (AMB/ABRAMET, Edital 2446). 50 questões, 5 alternativas.

## Regra número 1: fato errado é o pior defeito possível
- TODA questão sai de um trecho que você LEU na fonte primária (arquivos em `fontes/*.txt` ou algo que você mesmo baixou e leu).
  Nunca escreva número, prazo, corte, percentual ou artigo de memória. Se não achou no texto, não faça a questão.
- Resultado de busca web NÃO é fonte. Só o documento original (lei, resolução, diretriz, norma, protocolo oficial, OMS/CDC/ANAC/Marinha).
- Se a fonte for ambígua ou contraditória, não faça questão que dependa do ponto ambíguo.
- Atenção a normas revogadas: CTB vigente é o compilado do Planalto (`fontes/ctb.txt`), já com a Lei 15.428/2026. Validade da CNH hoje é 10/5/3 anos (Lei 14.071/2020), não 5/3.
- Para temas "Conteúdo programático do Edital" sem norma brasileira específica (viajante, aeroespacial fisiologia, APH, aquaviária), use fonte oficial reconhecida (OMS, CDC Yellow Book, ANAC RBAC, FAA, Ministério da Saúde/SAMU, Marinha NORMAM, OIT/IMO) e cite-a no `base`.

## Fontes já baixadas (texto em `fontes/`)
contran927-corpo.txt, contran927-anexos.txt (Anexos I–XXII com cortes clínicos), edital.txt (item 15 = conteúdo programático),
ctb.txt (CTB compilado vigente), lei15428.txt, lei6194.txt (DPVAT + tabela), lc211.txt, lei13103.txt (motorista profissional),
nr07.txt (NR-7/PCMSO), rbac67.txt (RBAC 67 ANAC, CMA),
diretrizes ABRAMET: alcoolemia, animais, bicicletas, bzd, celular, cinto, cinto_gravidez, crianca_ambulancia, crianca_pt1, crianca_pt2,
dcei, diabetes, drc, drogas, epilepsia2025, esclerose, esquizofrenia, gravidez, idoso, medicamentos (MPPCVA), parkinson, tdah, tea, tolerancia.
Outras fontes: veja `docs/FONTES.md` (URLs e manhas de cada servidor; `curl -skL`; `python3 chunk2.py <url> <saida>` para PDF grande).
Se baixar algo novo, salve em `fontes/` com nome claro.

## Não repetir o que já existe
`python3 lista_tema.py <tema>` lista os enunciados atuais do tema com a resposta. Suas questões devem cobrir pontos DIFERENTES
(ou o mesmo ponto por ângulo claramente distinto — caso clínico, cálculo, exceção). Enunciado quase igual = colisão de chave = build quebra.

## Formato (JSON estrito, arquivo `lotes-questoes/levaNN-nome.json`, lista de objetos)
```json
{
 "q": "Enunciado (pode ser caso clínico curto). Termina em ? ou :",
 "alts": ["a","b","c","d","e"],
 "gab": 0,
 "tema": "<id da taxonomia>",
 "sub": "Subtema curto",
 "base": "Norma/diretriz + dispositivo exato (ex.: Resolução CONTRAN nº 927/2022, Anexo II, item 2.1)",
 "coment": "Comentário didático ≥ 300 caracteres: explica o ponto, cita o dispositivo, dá o contexto e a pegadinha.",
 "porAlt": ["por que a alt 0 está certa/errada", "...", "...", "...", "..."]
}
```
- Exatamente 5 alternativas, sem prefixo de letra. Uma única correta, inequívoca pela fonte.
- `porAlt[i]` explica a alternativa i (> 20 caracteres cada). A da correta começa com "Correta: ".
- Ids válidos de `tema`: epidemiologia, aptidao, legislacao, alcool, drogas, sono, oftalmo, orl, cardio, neuro, psiq, locomotor,
  sistemicas, protecao, grupos, curativa, ocupacional, viajante, aeroespacial, aquaviaria, securitaria.

## Qualidade de prova (viés de tamanho e pistas)
- TODAS as alternativas com comprimento entre **95% e 108%** do comprimento da correta (duro — o build quebra).
  Quando a correta ficar longa, ENCURTE a correta; não infle distratores. Janela: `L_correta ∈ [max(outros)/1.08, min(outros)/0.95]`.
- Distrator erra por CONTEÚDO plausível (número vizinho, categoria trocada, prazo de outra regra, órgão errado), nunca por absurdo.
- Evite "sempre/nunca/apenas" só nos distratores; evite "pode/geralmente" só na correta.
- Varie o formato: conceito, número de corte, caso clínico ("Condutor de 58 anos, categoria D, ... Qual o resultado?"), exceção, "qual NÃO".
  Pelo menos 30% em formato de caso clínico/pericial.
- Priorize o que CAI: números de corte, prazos, validades, categorias, quem decide, recursos, exceções, revogações recentes.
- Ao terminar, rode `python3 checa_leva.py lotes-questoes/<seu arquivo>` até não sair nenhuma linha de problema, e
  `python3 -c "import json;json.load(open('lotes-questoes/<arquivo>'))"`.
- NÃO rode `equilibra_gabarito.py`, `monta_banco.py`, nem mexa em `banco.js`, `index.html`, `sw.js`, git. Só crie os SEUS arquivos de leva.
- Pode escrever o arquivo em partes (escreva um JSON válido e depois reescreva acrescentando), mas o final tem de ser uma única lista JSON.

## Relatório final (curto)
Arquivo(s) criado(s), quantas questões por tema, fontes usadas, e qualquer ponto de dúvida/ambiguidade encontrado na fonte que você EVITOU.
