# Briefing — redação de leituras (resumos de estudo) do TráfegoTítulo

Projeto: `~/Documents/Claude/trafego-titulo/`. Leia no `CLAUDE.md` a seção "Aba Leitura" e "Anatomia de uma leitura".
A prova é DOMINGO 27/09/2026 — o Matheus vai estudar por estes resumos nesta semana. Densidade de prova: números de corte,
prazos, categorias, exceções, pegadinhas. Nada de encher linguiça.

## Regra número 1: fato errado é o pior defeito possível
Todo número/prazo/corte/artigo sai de um trecho que você LEU na fonte primária (`fontes/*.txt`, ou baixado por você —
ver `fontes/BRIEF-QUESTOES.md` para a lista e `docs/FONTES.md` para URLs). Nunca de memória, nunca de resultado de busca.
Se a fonte é ambígua, diga isso na leitura (em caixa `.armadilha`) em vez de escolher um lado.

## Molde
Copie a estrutura EXATA de uma leitura existente — use `leituras/sono-fadiga-saos.html` e `leituras/medicina-do-viajante.html`
como modelos (mesmo `<head>`, mesma folha `_leitura.css`, mesmo `_leitura.js`, mesmas classes):
`faixaTopo` → `kicker` (eixo do edital + "Leitura N · ~X min") → `h1` → `dek` com `<span class="peso">peso estimado N</span>` →
`nav.toc` → `section` numeradas com `.sec-head/.sec-num/h2` → caixas `.cx fonte` (texto da norma, com `.rot`), `.cx chave` (o que
decorar), `.cx armadilha` (pegadinha) → tabelas dentro de `<div class="rolagem">` com `<caption>` → seção "Armadilhas consolidadas"
→ "Autoteste" com `<details class="q"><summary>pergunta</summary><p>resposta</p></details>` (6–10 perguntas) → `<footer>` com as
fontes primárias numeradas → botão `.vaiQuestoes` apontando para `../index.html?area=<id do tema>#questoes` (copie o formato exato
do modelo). Não crie CSS novo nem `<style>` inline; use só as classes da folha compartilhada.
Tamanho alvo: 14–24 KB, 10–16 min de leitura. Escrita em português claro, frases diretas, sem "cara de IA"
(nada de "Em resumo," "É importante ressaltar", listas de emoji, micro-títulos em CAIXA ALTA).

## Entrega
- Crie SOMENTE o(s) seu(s) arquivo(s) em `leituras/<nome>.html`. NÃO edite `leituras.js`, `index.html`, `sw.js`, nem faça git.
- No relatório final, devolva a linha de índice pronta para `leituras.js`, neste formato:
  `{f:"<arquivo>.html", tipo:"Guia da norma|Tabelas de corte|Guia clínico-legal|Guia de evidência|Protocolos", area:"<id>", min:<n>, t:"<título>", s:"<1 frase com os números que caem>"},`
- Valide o HTML minimamente: `python3 -c "import html.parser,sys;p=html.parser.HTMLParser();p.feed(open('leituras/<arq>').read())"` e confira
  que todas as `<section>`, `<div>`, `<table>` e `<details>` fecham (conte aberturas × fechamentos com grep -c).
- Liste no relatório as fontes lidas e qualquer ambiguidade encontrada.
