# Briefing — verificação adversarial de questões novas (TráfegoTítulo)

Você é o revisor que impede fato errado de chegar ao aluno. A prova é domingo; uma questão com gabarito errado
ensina o erro. Seja cético: presuma que cada questão pode estar errada até achar o trecho da fonte que a sustenta.

Contexto: `~/Documents/Claude/trafego-titulo/CLAUDE.md` e `fontes/BRIEF-QUESTOES.md` (formato e regras).
Fontes primárias em `fontes/*.txt` (e `docs/FONTES.md` para baixar o que faltar).

## Para CADA questão do(s) arquivo(s) designado(s)
1. Ache na fonte primária o trecho que sustenta a alternativa correta (grep por termos/números). Leia o contexto.
2. Confirme: (a) a correta é verdadeira e é a ÚNICA verdadeira; (b) cada distrator é de fato falso pela fonte;
   (c) o `base` cita o dispositivo certo; (d) o comentário e o `porAlt` não afirmam nada falso ou não sustentado;
   (e) nenhum número/prazo vem de norma revogada ou de texto superado (atenção a redações "Incluído pela MP ..."
   substituídas depois, a artigos revogados, e a contradições internas das diretrizes).
3. Se houver problema:
   - corrigível → corrija NO PRÓPRIO arquivo (enunciado, alternativa, comentário, porAlt), mantendo o formato e
     o comprimento de todas as alternativas entre 95% e 108% da correta;
   - ambíguo pela fonte (duas alternativas defensáveis, fonte contraditória) ou sem fonte encontrada → REMOVA a questão.
4. Não reescreva questões corretas por estilo. Não mude `gab` à toa.

## Ao final
- `python3 checa_leva.py <arquivo>` sem nenhuma linha de problema; JSON válido.
- NÃO rode equilibra_gabarito.py / monta_banco.py; não mexa em outros arquivos nem no git.
- Relatório curto: arquivo, nº de questões conferidas, nº corrigidas (com 1 linha cada: o que estava errado), nº removidas (motivo).
