# Fontes primárias — onde estão e como rebaixar

Regra do projeto: **nunca escrever número de memória nem confiar em resultado de busca.**
Este arquivo existe porque as extrações ficavam no *scratchpad da sessão*, que é apagado —
e a sessão seguinte redescobria tudo do zero.

## Já versionadas em `docs/`
| Arquivo | O que é |
|---|---|
| `edital-2446-abramet-2026.pdf` | Edital AMB/ABRAMET nº 2446 (prova de 27/09/2026). O **item 15** é o conteúdo programático — a fonte da taxonomia. |
| `contran-res-927-2022.pdf` | **Corpo** da Resolução CONTRAN 927/2022 (7 páginas): procedimentos, resultados, juntas, credenciamento. |
| `contran-res-927-2022-anexos.pdf` | **Anexos I a XXII** (490.177 bytes). Os critérios clínicos com número de corte estão **só aqui**. |

Extrair com `pdftotext -layout <arquivo>.pdf <saida>.txt` (homebrew poppler).

## Como baixar o que não está versionado

`chunk2.py` (na raiz) baixa por **faixas de bytes** quando o servidor corta transferências longas:

```
python3 chunk2.py <url> <saida.pdf> [tamanho_chunk]
```

Peculiaridades de servidor já mapeadas:
- **gov.br** — responde **403 a `HEAD`**, mas aceita `GET` com `Range:`. Use `curl -skL`.
- **abramet.com.br** — exige `-k` (certificado TLS quebrado do lado deles). `curl -skL` funciona.
- **planalto.gov.br** — dá `ECONNRESET` em curl **e** em WebFetch. Ler pelo **navegador**
  (`preview_start` + `javascript_tool` lendo `document.body.innerText`).
- **bvsms.saude.gov.br** e **skybrary.aero** — bloqueiam acesso automatizado.

### Resolução CONTRAN 927/2022
```
https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9272022.pdf
https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9272022ANEXO.pdf
```

### Diretrizes médicas da ABRAMET
Índice: `https://www.abramet.com.br/medicina-de-trafego/diretrizes-medicas-medicina-do-trafego/`
Base dos arquivos: `https://www.abramet.com.br/repo/public/commons/`

| Tema | Arquivo (URL-encoded) |
|---|---|
| Epilepsia 2025 | `DIRETRIZ%20MEDICA%20-%20EPILEPSIA%20-%202025_WEB.pdf` |
| Dispositivo cardíaco (DCEI) | `DIRETRIZ%20MEDICA%20-%20PORTADORES%20DISPOSITIVO%20CARDIACO_WEB.pdf` |
| Medicamentos (MPPCVA) | `DIRETRIZ%20MEDICA%20-%20MEDICAMENTOS_WEB.pdf` |
| Parkinson | `DIRETRIZ%20MEDICA%20-%20PARKINSON.pdf` |
| Esclerose múltipla | `DIRETRIZ%20MEDICA%20-Esclerose%20Multipla.pdf` |
| Tolerância humana a impactos | `DIRETRIZ-MEDICA-TOLERANCIA-HUMANA.pdf` |
| Celular | `DIRETRIZ%20MEDICA%20-%20CELULAR_WEB.pdf` |
| Cinto de segurança | `DIRETRIZ%20MEDICA%20-%20CINTO%20SEGURAN%C3%87A_WEB.pdf` |
| Cinto e gravidez | `DIRETRIZ%20MEDICA%20-%20CINTO%20E%20GRAVIDEZ_WEB.pdf` |
| Criança em ambulância | `DIRETRIZ%20MEDICA%20-%20CRIAN%C3%87A%20AMBULANCIA_WEB.pdf` |
| Transporte de criança pt1 / pt2 | `DIRETRIZ%20MEDICA%20-%20TRANSPORTE%20CRIAN%C3%87A%20PT1.pdf` · `...PT2.pdf` |
| Doença renal crônica | `DIRETRIZ%20MEDICA%20-%20DRC.pdf` |
| Drogas (efeitos) | `DIRETRIZ%20MEDICA%20-%20DROGAS%20EFEITOS_WEB.pdf` |
| Esquizofrenia | `DIRETRIZ%20MEDICA%20-%20ESQUIZOFRENIA_WEB.pdf` |
| TEA | `DIRETRIZ%20MEDICA%20-%20TEA_WEB.pdf` |
| TDAH | `DIRETRIZ%20MEDICA_TDAH_WEB.pdf` |
| Gravidez e puerpério | `DIRETRIZ%20MEDICA_GRAVIDEZ%20E%20PUERPERIO_07-06.pdf` |
| Bicicletas | `DIRETRIZ-SINISTROS-DE-TRANSITO-DECORRENTES-DOS-DESLOCAMENTO-POR-BICICLETAS.pdf` |
| Animais de companhia | `Diretriz-Transporte-de-animais-de-companhia-caes-e-gatos-em-veiculos-automotores.pdf` |
| Benzodiazepínicos | `diretriz-BZD.pdf` |
| Diabetes | `diretriz-DIABETES.pdf` |
| Alcoolemia | `diretriz-alcoolemia.pdf` |
| Condutor idoso | `diretriz-o-condutor-idoso-.pdf` |

⚠️ O **MPPCVA (medicamentos)** já foi dado como "PDF que abre com 0 caracteres". **Não é.**
Era **download truncado**: baixado inteiro, tem 4,6 MB, 42 páginas e 88 KB de texto extraível.

### Outras fontes usadas nas leituras
| Fonte | Onde |
|---|---|
| CTB (Lei 9.503/1997) compilado | `planalto.gov.br/ccivil_03/leis/l9503compilado.htm` — **só pelo navegador** |
| Lei 6.194/1974 (DPVAT) + tabela anexa | `planalto.gov.br/ccivil_03/leis/l6194.htm` — o barema é uma `<table>` com `rowspan`; ler pelo DOM, não pelo `innerText` (o texto puro embaralha os percentuais) |
| LC 211/2024 (revoga a LC 207/2024, do SPVAT) | `planalto.gov.br/ccivil_03/leis/lcp/lcp211.htm` |
| RBAC 67 (ANAC), CMA | `anac.gov.br/assuntos/legislacao/legislacao-1/rbha-e-rbac/rbac/rbac-67/@@display-file/arquivo_norma/RBAC67EMD04.pdf` (entrega a **Emenda 05**, 64 págs) |
| SAMU 192 — Suporte Básico de Vida | `gov.br/saude/pt-br/composicao/saes/samu-192/publicacoes/protocolo-de-suporte-basico-de-vida-1-2.pdf/@@download/file/...` — 10 MB, 482 págs; **baixar com `chunk2.py`** |
| FAA PHAK cap. 15 (fatores aeromédicos) | `download.aopa.org/epilot/2008/8083-25-chap15.pdf` — tabela de tempo útil de consciência e intervalo mergulho→voo |
| Projeto WRIGHT (OMS) | `who.int/news/item/29-06-2007-study-results-released-on-travel-and-blood-clots` |
| CIVP / febre amarela | `gov.br/pt-br/servicos/obter-o-certificado-internacional-de-vacinacao-e-profilaxia` e `gov.br/saude/.../febre-amarela/viajantes` |
