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
- Sem Firebase e sem sincronização: os dados vivem no aparelho (localStorage + espelho IndexedDB).

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

### Auditoria visual por DOM (roda no navegador, não é screenshot)
O script de contraste usado está no histórico da sessão: percorre `body *`, calcula a razão WCAG entre
`color` e o primeiro fundo opaco ancestral, e reporta o que fica abaixo do mínimo — repetindo para os
8 painéis nos dois temas. Rodar sempre que mexer em cor. Resultado exigido: `{}`.

## As armadilhas herdadas (defesas implementadas — manter)
1. **Progresso por chave de conteúdo, nunca por índice**: `chaveQ(q)` = djb2+FNV com `Math.imul`
   sobre o enunciado normalizado. Réplica Python em `valida_banco.py`. Chave órfã é descartada
   em silêncio (falha segura).
2. **Blindagem de armazenamento** (`ARM`): espelho de todas as chaves em IndexedDB (`tt-db`),
   backups rotativos, recuperação automática por canário (`tt_canary`), exportar/importar em
   Ajustes. `load()` que falha TRAVA a gravação da chave. **Testado**: `localStorage.clear()` +
   reload restaurou 7 chaves com faixa verde.
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
5 publicadas, ~11 mil palavras, todas com fonte primária conferida:
aptidão física e mental · toxicológico do art. 148-A · álcool e direção · oftalmo/ORL (Anexos II–IV) ·
falha de atenção e celular. **Faltam ~16 temas** — próximas prioridades por peso: neurológica
(Anexos VIII/IX + diretriz de epilepsia 2025), cardiorrespiratória (Anexos V–VII), sono/SAOS
(Anexos X–XII), locomotor/PcD (NBR 14970 + Anexo XV) e trauma/APH.

⚠️ Os **anexos da Resolução 927** não estão em `docs/` (só o corpo). O PDF dos anexos precisa ser
rebaixado antes de escrever as leituras que dependem deles.

## Rigor de conteúdo (o ponto mais importante)
Prova de legislação e norma técnica: **fato errado é o pior defeito possível**. Regras:
- Toda questão tem campo **`base`** com a norma/diretriz que a ancora — e o validador derruba o
  build se faltar. O comentário cita o dispositivo (artigo, anexo, item).
- **Nunca escrever número de memória nem confiar em resultado de busca.** A busca web devolveu
  "validade da CNH 5/3 anos" (regra revogada pela Lei 14.071/2020) — se tivesse virado questão,
  seria erro grave. Ler a fonte primária.
- Fontes primárias já baixadas em `docs/` e usadas na leva 1: Edital 2446, Resolução CONTRAN
  927/2022 (corpo **e** anexos — os critérios clínicos estão só nos anexos, PDF separado).
- **Lei nº 15.428/2026** (05/06/2026, conversão da MP 1.327/2025, 51ª alteração do CTB) é o
  achado mais recente e cai fácil: renovação automática pelo RNPC dispensa os procedimentos do
  art. 147 **exceto o exame de aptidão física e mental**; art. 148 §6º passa a exigir perito
  **autorizado pela Senatran** com título de especialista; §7º cria preço público corrigido pelo
  IPCA; revogados os §§6º e 7º do art. 147.
- Ambiguidade conhecida: o Anexo X da 927 diz "Epworth > 12" no item 1.2.5 e "maior ou igual a 12
  (> 12)" no item 1.3 — o texto oficial se contradiz. Não montar questão que dependa do corte exato.

## Rotina de QA (antes de dizer "pronto")
1. `python3 monta_banco.py` (roda o validador; erro duro = não publica).
2. Sintaxe de todos os `.js` + o script inline do index (JavaScriptCore — esta máquina não tem node).
3. Servir local (`launch.json` → `trafego-titulo`, porta 8623) e rodar asserções por DOM.
4. Só depois: commit/push e **bump do `CACHE` do sw.js**.

## Estado do conteúdo (24/08/2026)
- **504 questões** em 36 levas (`lotes-questoes/leva*.json`), 504 chaves únicas, zero erros duros
- Distribuição do gabarito: A 112 · B 108 · C 97 · D 94 · E 93
- 24 cartões · 6 casos da teórico-prática
- Levas 33–36 saíram das diretrizes ABRAMET de drogas ilícitas, telefone celular (FAC),
  condutor idoso e cinto de segurança (+ cinto e gravidez)
- **Faltam baixar** (o servidor da ABRAMET corta transferências longas): MPPCVA (medicamentos)
  — único PDF que ainda abre com 0 caracteres. Receita: `chunk2.py`, faixas de bytes de 200 KB.
- Diretrizes já baixadas E extraídas em `<scratchpad>/fontes/diretrizes`: alcoolemia, animais,
  benzodiazepínicos, bicicletas, celular, cinto_gravidez, cinto_seguranca, crianca_ambulancia,
  crianca_pt1/pt2, dcei_cardiaco, diabetes, drc_dialitica, drogas_efeitos, epilepsia2025,
  esclerose_multipla, esquizofrenia, gravidez_puerperio, idoso, parkinson, tdah, tea,
  tolerancia_impactos

### Receita de fechamento de leva (usar sempre nesta ordem)
1. Escrever a leva; `python3 checa_leva.py <arquivo>` aponta as alternativas fora de 95–108%.
2. Quando o comprimento não fecha, calcular a JANELA da correta:
   `L ∈ [max(outros)/1.08, min(outros)/0.95]` — se a janela for vazia, mexer nos distratores extremos.
   Corrigir SEMPRE casando por PREFIXO de texto (índices mudam depois do equilíbrio).
3. `python3 equilibra_gabarito.py <arquivo>` (uma única vez, antes de publicar).
4. `python3 monta_banco.py` e conferir "OK: nenhum erro duro".
5. Commit, bump do `CACHE` do sw.js e push.

## Achados normativos verificados em fonte primária
- **Lei 15.428/2026**: renovação automática pelo RNPC dispensa o art. 147 EXCETO o exame de aptidão;
  peritos passam a ser autorizados pela Senatran; preço público corrigido pelo IPCA.
- **Diretriz ABRAMET 2025 de epilepsia**: substitui na prática o Anexo VIII, com tabela por categoria
  E por atividade remunerada (a pergunta nº 9 do Anexo I define a coluna aplicável).
- **SPVAT extinto**: LC 211/2024 (30/12/2024) revogou a LC 207/2024. DPVAT: R$13.500 morte,
  até R$13.500 invalidez, até R$2.700 DAMS; graduação 75/50/25/10%.

## Hospedagem
GitHub Pages, repo público `MedTechBR/trafego-titulo` — conteúdo 100% autoral, sem material
licenciado (por isso não precisa do esquema privado + Cloudflare Access do RadioTítulo).
