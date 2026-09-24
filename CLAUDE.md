# TráfegoTítulo — app de estudo para o Título de Especialista em Medicina do Tráfego (AMB/ABRAMET)

App pessoal do Matheus. Derivado do **RadioTítulo** (mesma arquitetura e mesmo design system);
o que muda é o conteúdo, o formato da prova e o módulo da teórico-prática.

## A prova (Edital AMB/ABRAMET nº 2446 — `docs/edital-2446-abramet-2026.pdf`)
- **27/09/2026, 09h–12h**, Hotel Premium Campinas (R. Novotel, 931 — Campinas/SP).
- **Teórica**: 50 questões de múltipla escolha, **5 alternativas** — peso 6 (60%).
- **Teórico-prática descritiva**: cenários/casos — peso 3 (30%).
- **Análise curricular** (Anexo I do edital) — peso 1 (10%); só avaliada em quem tirar ≥6,0 na teórica.
- Aprovação: média ponderada ≥6,0 **E** no mínimo 6,0 na teórica (item 9.4). Notas de 0 a 10, uma casa decimal.
- Gabarito da teórica em 28/09; recursos até 02/10; resultado final em 05/11/2026.

## Arquitetura (não negociar)
- `index.html` single-file (HTML/CSS/JS puro, sem framework, sem build).
- `banco.js` é **GERADO** por `monta_banco.py` a partir de `lotes-questoes/leva*.json`.
  Nunca editar `banco.js` à mão — editar a leva e rodar o montador.
- `taxonomia.js` (21 áreas, com `eixo` reproduzindo as 7 divisões do edital e `peso` de incidência
  estimada), `flash.js` (cartões SM-2) e `pratica.js` (casos descritivos) são JSON estrito.
- PWA: `manifest.webmanifest` + `sw.js` (network-first p/ HTML, cache-first p/ estáticos).
- **DEPLOY: bumpar a constante `CACHE` do `sw.js` a CADA deploy** (tt-v2, tt-v3…). Sem isso o
  app fica preso na versão velha e a correção vira fantasma. Testar SW em **aba nova**.
- **Progresso na nuvem desde 22/09/2026** (`sync.js`, portado do RadioTítulo): Firestore central
  `medtech-c658c`, um doc por item em `users/{uid}/apps/trafego-titulo/{col}/{id}`, junção item a
  item com carimbo de tempo (nunca last-write-wins em bloco). `node testa_sync.js` = 29/29.
  Mesmo domínio do portal (medtechbr.com.br) ⇒ a sessão do portal vale aqui; o app sonda em segundo
  plano e liga sozinho. Sem login, continua 100% local (localStorage + espelho IndexedDB).
  Motivo: a troca github.io → medtechbr.com.br prendeu o progresso local no endereço antigo.

## Abas
Questões · Simulado · **Prática** · Painel · Cartões · Erros · Plano · Ajustes

O módulo **Prática** é o que não existe no RadioTítulo: cada caso tem cenário, perguntas e um
**espelho de correção** com pontos-chave pesados. O usuário escreve a resposta sem olhar, abre o
espelho, marca item a item o que realmente escreveu, e a nota (0–10) sai da razão entre pesos
marcados e peso total. Fica gravado em `ST.treino[id]`.

O **Painel** traz o simulador de **nota final** (0,6 × teórica + 0,3 × prática + 0,1 × currículo),
com o currículo preenchido pela tabela do Anexo I. Aviso explícito quando a teórica está abaixo
de 6,0 — porque isso reprova mesmo com média ponderada suficiente.
⚠️ O edital **não publica** a régua de conversão dos pontos do Anexo I em nota de 0 a 10; o app usa
proporção sobre o teto (175 pts). Serve para comparar cenários, não é a nota que a banca vai dar.

## Identidade visual — "Asfalto & Sinalização" (25/08/2026)
O app tinha o azul genérico `#2563EB` e cartão branco sobre cinza em tudo — "cara de IA". Foi trocado
por uma identidade tirada do PRÓPRIO assunto: a sinalização viária. As cores semânticas são as cores
da placa, então nada é decorativo.

| Papel | Token | Claro | Escuro |
|---|---|---|---|
| Marca / ação primária | `--brand` | `#E29215` âmbar de advertência | `#F2A93B` |
| Acerto | `--ok` | `#1B7A45` verde de rodovia | `#4FCB85` |
| Erro / destrutivo | `--err` | `#C0261F` vermelho de parada | `#F0736A` |
| Tinta | `--ink` | `#181B21` asfalto | `#ECE8E0` |
| Fundo | `--bg` | `#F5F1E8` papel quente | `#101318` |

- **Tipografia**: **Archivo** (600/700/800) em títulos, números e cronômetro — grotesca de linhagem
  de sinalização, dá caráter sem enfeitar; **Inter** no corpo. Carregadas do Google Fonts com
  `display=swap` e **cacheadas pelo próprio SW** (cache `tt-fontes-v1`, separado do `CACHE`, sobrevive
  ao bump) para a identidade não sumir offline.
- **Cabeçalho asfalto**: barra escura fixa com marca, contagem regressiva para a prova e alternador de
  tema. Abas viraram pílulas; a ativa é âmbar sólido com texto escuro (contraste de placa).
- **Tema claro/escuro**: 3 estados (sistema, claro forçado, escuro forçado). O tema é aplicado por um
  script inline **antes** do `<style>` para não piscar. Preferência em `localStorage.tt_tema`.
- **Regras que não podem regredir** (todas verificadas por DOM, ver abaixo):
  contraste ≥4,5:1 em texto normal e ≥3:1 em texto grande, nos 8 painéis × 2 temas;
  alvos de toque ≥44px; nenhum `select` estourando o cartão (o de temas tem opções longas);
  tabela larga sempre dentro de `.rolagem`; `prefers-reduced-motion` desliga as animações.
- **O que NÃO fazer**: voltar a rotular todo cartão com micro-título em CAIXA ALTA (era o principal
  "tell" de template), usar azul genérico como cor de marca, ou pôr sombra/raio fora dos tokens.

### Camada "viva" (23/09/2026, tt-v15) — SOBRESCREVE o "sem sombra/raio fora dos tokens" acima
Pedido do Matheus ao aprovar o ClínicaMed cm-v97/v98: "aplique as mesmas mudanças de layout nos meus outros
aplicativos de estudo, respeitando as cores de cada um" + "quando eu abra a página, já consiga visualizar a questão
toda". Está num bloco único no FIM do `<style>` (comentário `tt-v15: camada "viva"`) + ganchos JS mínimos
(bloco `camada viva` antes de `util`). Nada de dados, chaves, banco, sync ou gabarito foi tocado.
- **Cor por seção, tirada das famílias reais de placas** (`body[data-aba]` → `--ac/--acOn/--acInk/--acSup`, posto
  por `irAba`): Questões e Painel = âmbar de advertência (marca); Simulado = laranja de obras; Prática = azul de
  serviços; Leitura = marrom de turismo; Cartões = preto da educativa; Erros = vermelho de regulamentação; Plano =
  verde de indicação; Ajustes = cinza. Como na placa, sobre âmbar e laranja o texto é ESCURO; nas demais, branco.
  Acerto continua `--ok` verde, erro `--err` vermelho. Cada aba do cabeçalho/barra inferior/folha "Mais" mostra o
  ícone num círculo da cor da sua placa (`[data-aba=x]{--c}` no CSS, sem JS).
- **Forma:** cartões 22 px, botões/selects em pílula, letra da alternativa e ícones em círculo, filtro de Questões
  vira uma barra-pílula fina.
- **Movimento:** `vivo(sec)` (entrada escalonada, `.mini .gd`/`[data-conta]` sobem de 0, `.barra i` e anel `[data-off]`
  se preenchem; com `setTimeout` de garantia porque aba oculta congela o rAF), `entraQuestao/entraSim` (questão desliza
  na direção de anterior/próxima), acerto pulsa com sinal de certo, erro treme, chip "N seguidas" (`COMBO`),
  `confete()` quando `metaDia()` é batida. `metaDia()` = (alvo − respostas até ontem) ÷ dias até a prova, só se a data
  e o alvo estiverem definidos no Painel. `prefers-reduced-motion` desliga tudo.
- **Painel:** herói em âmbar (como placa de advertência) com anel do acerto geral e marca no corte de 60%, questões
  vistas/total, respostas, meta do dia; atalhos em pílula (refazer as que errei, cartões de hoje, leituras, casos);
  os 4 indicadores viraram blocos tingidos (azul, verde, laranja, marrom). Só números que o app já calcula.
- **Questão inteira na tela (medido em 1512×763, 1 a cada 7 questões = 150):** Questões 100% antes e depois
  (com os botões Anterior/Responder/Próxima: 99,3% → 100%). Simulado: **0% → 100%**, porque a grade de 50 números
  agora fica numa coluna fixa à direita (≥1000 px, via `#sec-simulado:has(#cronSim)`; a revisão usa o mesmo layout).
- Continua proibido: gradiente, emoji, fonte nova, travessão em texto novo de interface.

### Camada viva, 2ª rodada (23/09/2026, tt-v16, guia `MedTech/VIVA-2026-09.md`)
Bloco CSS `tt-v16` no fim do `<style>` + ganchos JS pequenos. Dados, chaves, banco, leituras e `sync.js` intocados.
- **Inter local** em `fonts/` (woff2 latim enxuto, ~24 KB cada, OFL em `fonts/OFL.txt`); Archivo e Google Fonts saíram
  do index (`--fD` = Inter). Não usar `<link rel=preload crossorigin>` para as fontes: por file:// dá erro de CORS no console.
  As leituras (`leituras/*.html` + `_leitura.css`) AINDA pedem Archivo+Inter ao Google e têm rótulos em caixa alta: ficaram
  de fora por serem conteúdo; o SW mantém o cache `tt-fontes-v1` só por causa delas.
- **Barra lateral clara** ≥900 px (252 px; só ícones entre 900 e 1179), grupos Estudar/Acompanhar, contagem e tema no pé;
  `medeCabecalho()` zera `--hAlt` quando o cabeçalho é lateral. Tablet: abas no topo. Celular: cabeçalho claro de uma linha
  + barra inferior clara (`repeat(5,minmax(0,1fr))`: com `1fr` puro ela estourava 390 px). Faixa asfalto `body::before` na
  altura de `safe-area-inset-top`: a status bar do iPhone instalado é `black-translucent` (texto branco).
- **Título de página** `#pgTitulo` com selo na cor da seção (`pintaTitulo`/`infoAba`); só leitor de tela em Questões, leitura
  aberta e simulado em curso. **Avisos** (`UI.banner`) viraram pílula flutuante com ícone; sucesso some em 6 s.
- **Painel:** o anel do herói mostra a **meta do dia** quando há data+alvo (senão, acerto geral com o corte de 60%); o
  indicador "Acerto geral" ganhou barra com a marca de 60%; indicadores com ícone em círculo.
- **Função:** atalhos (`atalhos()`): Questões A–E/1–5, Enter responde e avança, setas; Simulado A–E e setas; Cartões espaço
  e 1–4; Leitura `/` busca e Esc fecha. Busca nas leituras (sem acento), "Zerar marcações" no fim da lista com confirmação.
  Estados vazios com botão (filtro de Questões/Prática, Cartões, Plano). Log de erros vira cartões no celular, campo salvo
  pisca verde, 16 px (sem zoom do iOS). `inputmode` nos números. Excluir com ícone de lixeira.
- Verificado: contraste AA por DOM nas telas principais nos dois temas (0 falhas), sem rolagem lateral em 390 px,
  fluxo por teclado de ponta a ponta, `node testa_sync.js` 29/29, `valida_banco.py` sem erro duro.

### Auditoria visual por DOM (roda no navegador, não é screenshot)
O script de contraste usado está no histórico da sessão: percorre `body *`, calcula a razão WCAG entre
`color` e o primeiro fundo opaco ancestral, e reporta o que fica abaixo do mínimo — repetindo para os
8 painéis nos dois temas. Rodar sempre que mexer em cor. Resultado exigido: `{}`.

## Ordem das questões (25/08/2026)
Reclamação dele: "estão vindo somente questões do mesmo tema em sequência". Eram DOIS defeitos:

1. **A ordem crua do banco é temática.** `monta_banco.py` concatena leva a leva e cada leva é de um
   tema só — medido na ordem antiga: **16 questões seguidas** do mesmo tema e **342 dos 503 pares
   adjacentes** iguais (68%).
2. **`sort(() => Math.random() - 0.5)` não embaralha.** O comparador é inconsistente e o TimSort do V8
   deixa o começo do vetor sobrerrepresentado — medido: as 50 primeiras posições saíam **3.918 vezes
   do 1º terço contra 2.666 do último** (esperado 3.333 cada). Estava em DOIS lugares, e o pior era o
   **sorteio do simulado**, que puxava para os temas das primeiras levas.

Correção:
- `embaralha(a)` = **Fisher-Yates** no lugar (verificado: 6648/6681/6671 por terço, esperado 6667).
- `espalhaTemas(lista)` = a cada passo sorteia o próximo tema **ponderado pelo que resta**, proibindo
  repetir o tema anterior. Resultado em 40 execuções sobre as 504: **0,15 pares adjacentes iguais por
  execução**, maior sequência 3, e **13,2 temas distintos nas 20 primeiras** (era 1).
  ⚠️ A primeira versão pegava sempre o tema com MAIS restantes (determinística) e degenerava em
  pingue-pongue entre os dois maiores — só 3 temas distintos nas 20 primeiras. O sorteio ponderado é
  o que dá variedade; não voltar para o determinístico.
- A ordem é **persistida** em `ST.pos.ordq` + `ST.pos.assq` (assinatura do filtro): navegar entre abas
  e recarregar não reembaralha, e "continuar de onde parei" (`ST.pos.chq`) segue funcionando. Trocar o
  filtro ou clicar no botão de embaralhar refaz a ordem.
- O simulado passou a sortear com Fisher-Yates e a ordenar a prova com `espalhaTemas`
  (desvio máximo por tema caiu para ±7%, ruído de amostragem).

## As armadilhas herdadas (defesas implementadas — manter)
1. **Progresso por chave de conteúdo, nunca por índice**: `chaveQ(q)` = djb2+FNV com `Math.imul`
   sobre o enunciado normalizado. Réplica Python em `valida_banco.py`. Chave órfã é descartada
   em silêncio (falha segura).
2. **Blindagem de armazenamento** (`ARM`): espelho de todas as chaves em IndexedDB (`tt-db`),
   backups rotativos, recuperação automática por canário (`tt_canary`), exportar/importar em
   Ajustes. `load()` que falha TRAVA a gravação da chave. **Testado**: `localStorage.clear()` +
   reload restaurou 7 chaves com faixa verde.
   ⚠️ **O prefixo mora só em `PREF`** (`const PREF="tt_"`), e `TTKEYS` é derivado dele. Este ARM veio
   copiado do RadioTítulo com `"rt_"` **escrito no código** em `listaBackups()` e `restaura()`: a lista
   de backups dizia sempre "0 chaves" e o botão restaurar não devolvia nada — em silêncio, que é
   exatamente a falha que o ARM existe para impedir. Corrigido em 04/09/2026 (e o mesmo `PREF` foi
   aplicado no RadioTítulo, para a próxima cópia não reintroduzir o defeito). Nunca escrever o
   prefixo literal. `tt_lidas` (progresso das leituras) também estava **fora** de `TTKEYS`, então não
   entrava em snapshot, espelho nem exportar/importar; ao criar chave nova, incluir em `TTKEYS`.
3. **Viés de tamanho**: todas as alternativas entre 95–108% do comprimento da correta; distrator
   erra por CONTEÚDO. Quando a correta fica longa demais, **encurtar a correta** — não inflar os
   distratores. `valida_banco.py` derruba o build fora do intervalo.
4. **Posição do gabarito**: `equilibra_gabarito.py` espalha a correta entre A–E.
   **RODAR UMA VEZ POR LEVA, ANTES DE PUBLICAR.** Depois que o app estiver em uso, NÃO rodar de
   novo: as respostas gravadas guardam o ÍNDICE da alternativa, e remexer na ordem faria o
   histórico apontar para a alternativa errada.
5. **Verificar por DOM, não por screenshot**: `window.__tt` expõe `ST`, `ARM`, `chaveQ`, `QIDX`,
   `irAba`. Cuidado: as seções inativas continuam no DOM — **escopar os seletores na seção certa**
   (`#sec-simulado .alt`), senão o teste clica na aba errada. E no simulado, clicar na alternativa
   **já avança** para a próxima; não clicar em `#simProx` depois.

## Aba Leitura — resumos de estudo (25/08/2026)
Pedido do Matheus: "faltou resumos dos materiais para leitura", como no app de farmácia
(`quiz-enare-farmacia`, pastas `estudos/` e `farmacia/`). Portado com três diferenças deliberadas:

1. **Folha compartilhada** `leituras/_leitura.css` em vez de CSS duplicado em cada página (o app de
   farmácia repete ~20 KB de estilo por arquivo). Cada leitura fica em 13–23 KB.
2. **Tema segue o app**: `leituras/_leitura.js` lê `?tema=claro|escuro` da URL e também escuta
   `postMessage({tt:"tema"})` — trocar o tema com uma leitura aberta muda a leitura na hora.
3. **Uma única área de rolagem**: `ajustaQuadro()` dimensiona o `<iframe>` para a altura exata que
   sobra na viewport e `body.lendo` tira o padding do rodapé, então a página do app NÃO rola — só a
   leitura. Sem isso ficam dois scrolls concorrentes (anti-padrão em celular).

- Índice em `leituras.js` (`window.LEITURAS`): itens `{f,tipo,area,min,t,s}` e separadores `{grupo,sub}`.
  `area` casa com o `id` da taxonomia e alimenta o botão "treinar questões" da leitura.
- **Deep link**: a leitura aponta para `../index.html?area=<tema>#questoes`; o boot lê `?area=`, aplica
  o filtro em `ST.pos.fq` e limpa a URL. (O parâmetro é `area`, não `tema`, para não colidir com o
  `?tema=` do tema claro/escuro.)
- Progresso de leitura em `ST.lidas` (`tt_lidas`), marcado pelo botão da barra e contado no topo da aba.
- O SW precacheia `leituras.js`, `_leitura.css` e `_leitura.js`; as leituras em si entram no cache
  sob demanda pela regra stale-while-revalidate.

### Anatomia de uma leitura (manter o padrão)
`faixaTopo` → `kicker` (eixo do edital + tempo) → `h1` → `dek` com selo `.peso` → `nav.toc` fixo →
seções numeradas → caixas `.cx` (`.fonte` azul, `.chave` verde, `.armadilha` vermelha) → tabelas de
corte dentro de `.rolagem` → "Armadilhas consolidadas" → "Autoteste" com `<details>` → `footer` com as
**fontes primárias numeradas** → botão `.vaiQuestoes`.

**Regra de contraste**: âmbar `--brand` NÃO passa em texto sobre papel (2,2:1). Para texto âmbar no
tema claro usar sempre `--brandInk`, que no escuro já resolve para o próprio `--brand`. Pego pela
auditoria por DOM — que precisou de parser para `color(srgb r g b / a)`, formato que o `color-mix()`
devolve e que um parser ingênuo de `rgb()` lê como quase preto (falso positivo em massa).

### Estado das leituras
**23 publicadas (23/09/2026)**, todas com fonte primária lida e números conferidos por um segundo agente:
as 13 anteriores + **CTB essencial** · **medicamentos e drogas** · **psiquiatria e neurodesenvolvimento** ·
**ORL isolado** · **diabetes/DRC** · **proteção veicular e crianças** · **grupos especiais** · **ocupacional** ·
**aquaviária** · **Revisão de véspera: os números que caem** (grupo "Revisão final" no topo do índice, ~30 min,
todos os cortes da prova com a fonte ao lado + plano dos últimos dias). Todos os 21 temas têm leitura.

## Rigor de conteúdo (o ponto mais importante)
Prova de legislação e norma técnica: **fato errado é o pior defeito possível**. Regras:
- Toda questão tem campo **`base`** com a norma/diretriz que a ancora — e o validador derruba o
  build se faltar. O comentário cita o dispositivo (artigo, anexo, item).
- **Nunca escrever número de memória nem confiar em resultado de busca.** A busca web devolveu
  "validade da CNH 5/3 anos" (regra revogada pela Lei 14.071/2020) — se tivesse virado questão,
  seria erro grave. Ler a fonte primária.
- Fontes primárias já baixadas em `docs/` e usadas na leva 1: Edital 2446, Resolução CONTRAN
  927/2022 (corpo **e** anexos — os critérios clínicos estão só nos anexos, PDF separado).
  Os dois estão em `docs/`: `contran-res-927-2022.pdf` (corpo) e
  `contran-res-927-2022-anexos.pdf` (490.177 bytes, 22 anexos, 63 KB de texto por `pdftotext -layout`).
  URL dos anexos: `.../conteudo-contran/resolucoes/Resolucao9272022ANEXO.pdf` — o gov.br responde
  **403 a `HEAD`** mas aceita `GET` com `Range:`, então use `chunk2.py` (na raiz do projeto).
- **Lei nº 15.428/2026** (05/06/2026, conversão da MP 1.327/2025, 51ª alteração do CTB) é o
  achado mais recente e cai fácil: renovação automática pelo RNPC dispensa os procedimentos do
  art. 147 **exceto o exame de aptidão física e mental**; art. 148 §6º passa a exigir perito
  **autorizado pela Senatran** com título de especialista; §7º cria preço público corrigido pelo
  IPCA; revogados os §§6º e 7º do art. 147.
- Ambiguidade conhecida: o Anexo X da 927 diz "Epworth > 12" no item 1.2.5 e "maior ou igual a 12
  (> 12)" no item 1.3 — o texto oficial se contradiz. Não montar questão que dependa do corte exato.

## Rotina de QA (antes de dizer "pronto")
1. `python3 monta_banco.py` (roda o validador; erro duro = não publica).
2. Sintaxe de todos os `.js` + o script inline do index (`/opt/homebrew/bin/node --check`).
3. Servir local (`launch.json` → `trafego-titulo`, porta 8623) e rodar asserções por DOM.
4. Só depois: commit/push e **bump do `CACHE` do sw.js**.

## Estado do conteúdo (23/09/2026)
- **1.044 questões** em 56 levas, 1.044 chaves únicas, zero erros duros. Gabarito A 229 · B 218 · C 203 · D 198 · E 196.
  Todos os temas ≥ 27; aptidão 89, legislação 79, APH 68, aeroespacial 68.
- Levas 37–56 (540 questões) redigidas em 11 frentes paralelas a partir de `fontes/*.txt` e **verificadas uma a uma
  por um segundo agente contra a fonte** (roteiros em `docs/roteiros/`). A verificação removeu ~20 duplicatas e
  corrigiu ~50 comentários/distratores; nenhum gabarito novo estava errado. `python3 lista_tema.py <tema>` lista o que
  já existe (usar antes de escrever leva nova).
- A mesma rodada achou **erros em material ANTIGO**, corrigidos (enunciado trocado para descartar a resposta gravada):
  DPVAT e SUS (texto superado da MP 451 — leva7), complicação grave do diabetes = inapto definitivo (leva17), fratura
  exposta pelo BT13 do SAMU (leva27), CNH "recolhida" na reincidência do álcool (leva2); e nas leituras: securitária
  (§2º do art. 3º e art. 4º da Lei 6.194), locomotor (art. 14, VI, não 12), aeroespacial (1ª classe e gravidez),
  cardio (contradição texto × figura da diretriz de DCEI), viajante (certificado ainda não válido pelo RSI).
- 24 cartões · 6 casos da teórico-prática
- **Nada falta baixar.** Catálogo durável em **`docs/FONTES.md`**; extrações em `fontes/` (gitignored).

### Receita de fechamento de leva (usar sempre nesta ordem)
1. Escrever a leva; `python3 checa_leva.py <arquivo>` aponta as alternativas fora de 95–108%.
2. Quando o comprimento não fecha, calcular a JANELA da correta:
   `L ∈ [max(outros)/1.08, min(outros)/0.95]` — se a janela for vazia, mexer nos distratores extremos.
   Corrigir SEMPRE casando por PREFIXO de texto (índices mudam depois do equilíbrio).
3. `python3 equilibra_gabarito.py <arquivo>` (uma única vez, antes de publicar).
4. `python3 monta_banco.py` e conferir "OK: nenhum erro duro".
5. Commit, bump do `CACHE` do sw.js e push.

## Achados normativos verificados em fonte primária
- **Res. CONTRAN 1.031/2026** (17/08/2026, DOU 18/08) **revogou a 432/2013**: pelo menos DOIS sinais de alteração;
  recusa sem sinais = 165-A, com 2+ sinais = 165 (e pode ser crime do 306); aparelho para outras substâncias (positivo
  caracteriza infração e crime); sangue/exame clínico viram suplementares; sinistro com óbito exige exame; art. 12: o
  agente **não recolhe** a CNH. A leitura de álcool tem a tabela "antes × depois".
- **Res. CONTRAN 1.020/2025 revogou a 789/2020**; tempo dobrado do teórico (dislexia, TDAH, TEA) está no art. 33 §2º.
- **Lei 15.503/2026** (14/09/2026, vigência imediata): categoria B dirige elétrico/híbrido até 4.250 kg (CTB 143 §2º-A).
- **Lei 15.428/2026**: renovação automática pelo RNPC dispensa o art. 147 EXCETO o exame de aptidão;
  peritos passam a ser autorizados pela Senatran; preço público corrigido pelo IPCA.
- **ADI 5322** (Lei do Motorista): 11 h de descanso não se fracionam; tempo de espera é jornada. O compilado do
  Planalto ainda mostra o texto derrubado, só com "Vide ADI 5322" — não fazer questão sobre esses trechos.
- **Diretriz ABRAMET 2025 de epilepsia**: substitui na prática o Anexo VIII, com tabela por categoria
  E por atividade remunerada (a pergunta nº 9 do Anexo I define a coluna aplicável).
- **SPVAT extinto**: LC 211/2024 (30/12/2024) revogou a LC 207/2024. DPVAT (texto da Lei 6.194): R$13.500 morte,
  até R$13.500 invalidez, até R$2.700 DAMS; graduação 75/50/25/10%. DAMS: atendimento PRIVADO na rede credenciada ao
  SUS é reembolsável; só o feito PELO SUS é vedado (Lei 11.945/2009 — o "mesmo que em caráter privado" é da MP 451,
  superado). O art. 4º remete ao art. 792 do Código Civil, que a Lei 15.040/2024 revogou.
- **Contradições internas conhecidas** (não fazer questão que dependa delas): Epworth > 12 × ≥ 12 (Anexo X);
  DCEI marca-passo profissional 4 (figura) × 6 semanas (texto) e CDI secundária 3 (figura) × 6 meses (texto).

## Hospedagem
GitHub Pages, repo público `MedTechBR/trafego-titulo` — conteúdo 100% autoral, sem material
licenciado (por isso não precisa do esquema privado + Cloudflare Access do RadioTítulo).
