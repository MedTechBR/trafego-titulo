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
| CLT compilada (art. 168 §§6º-7º; arts. 235-A a 235-H com marcas "Vide ADI 5322") | `planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm` — `curl -skL -A "Mozilla/5.0"` funciona (latin-1) → `fontes/clt.txt` |
| Lei 14.599/2023 (art. 5º: MTE regulamenta toxicológico da CLT) | `planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14599.htm` → `fontes/lei14599.txt` |
| NORMAM-211/DPC (esporte e recreio; amadores, ed. 2026) | `assets.marinha.mil.br/sites/default/files/atos-normativos/dpc/normam/normam-211.pdf` → `fontes/normam211.txt` (cap. 5 = habilitação/atestado; 7.12 = embriaguez) |
| Diretrizes OIT/OMI exames médicos de marítimos (2011) | `imhf-portal.org/wp-content/uploads/2023/10/ILO-IMO-Guidelines-on-the-medical-examinations-of-seafarers.pdf` → `fontes/ilo_imo_seafarers.txt` |
| **Res. CONTRAN 1.031/2026** (fiscalização de álcool e substâncias; **revoga a 432/2013**, art. 15) | `gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao10312026.pdf` |
| **Res. CONTRAN 1.020/2025** (processo de habilitação; **revoga a 789/2020**, art. 140, IV; art. 33 §2º = tempo dobrado do teórico) | `gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao10202025.pdf` |
| Res. CONTRAN 819/2021 (dispositivo de retenção infantil — vigente) | `gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao8192021.pdf` |
| Res. CONTRAN 996/2023 (patinetes/autopropelidos) | mesmo diretório, `Resolucao9962023.pdf` |
| Lei 15.503/2026 (art. 14 inclui o §2º-A do art. 143 do CTB: B dirige elétrico/híbrido até 4.250 kg; vigência na publicação, 14/09/2026) | `planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/L15503.htm` |
| Código Civil (art. 792 **revogado** pela Lei 15.040/2024 — o art. 4º da Lei 6.194 remete a ele) | `planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm` |
| ADI 5322 (STF) — acórdão de mérito e embargos (Lei do Motorista) | cópias do TRT-3 (o site do STF bloqueia); ver `fontes/adi5322-*.txt` |
| NORMAM-101 e NORMAM-212 (DPC) | `assets.marinha.mil.br/sites/default/files/atos-normativos/dpc/normam/normam-101.pdf` / `normam-212.pdf` |
| MLC 2006 (com emendas de 2018) | site da OIT (`ilo.org`), PDF consolidado |
| SAMU 192 — Suporte **Avançado** de Vida | `gov.br/saude/pt-br/composicao/saes/samu-192/publicacoes/protocolo-de-suporte-avancado-de-vida-1.pdf/@@download/file` (baixar com `chunk2.py`) |
| CDC Yellow Book 2026 | `cdc.gov` responde **403 ao curl** — usar a cópia do Wayback Machine (`web.archive.org/web/2026/https://www.cdc.gov/yellow-book/...`) |
| FAA PHAK (edição 25C) cap. 17 e folhetos "Medical Facts for Pilots" | `faa.gov/regulations_policies/handbooks_manuals/aviation/phak` e `faa.gov/pilots/safety/pilotsafetybrochures/` |
| OMS — Plano Global da Década de Ação 2021–2030 | `cdn.who.int/media/docs/default-source/documents/health-topics/road-traffic-injuries/global-plan-for-road-safety.pdf` |
| OMS — World report on road traffic injury prevention (2004) | IRIS virou app JS; baixar pela API `iris.who.int/server/api/core/bitstreams/5424956f-d550-4569-ad6c-2a087e960c3f/content` |
| RSI 2005 consolidado (OMS, Anexos 6 e 7 — febre amarela) | `who.int` — IHR (2005) third edition / consolidado com emendas de 2024 |

## Pasta `fontes/` (local, fora do git)
Extrações em texto de TODAS as fontes acima ficam em `fontes/*.txt` (gitignored — há material licenciado, como as
diretrizes ABRAMET). Se a pasta sumir, rebaixar por esta tabela. `docs/roteiros/BRIEF-*.md` (cópia versionada; os agentes leem de `fontes/`) são os roteiros usados para
redigir e verificar questões e leituras com agentes em paralelo.
