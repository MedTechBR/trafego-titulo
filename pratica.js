/* Casos da prova teórico-prática descritiva (peso 3 no Edital nº 2446).
   Cada caso traz o cenário, as perguntas e o ESPELHO DE CORREÇÃO com pesos —
   o app soma os pesos marcados e converte para nota de 0 a 10. */
window.PRATICA=[
{
"id":"prt-aptidao-01",
"tema":"aptidao",
"titulo":"Renovação categoria D com múltiplas alterações no exame",
"cenario":"Homem de 54 anos comparece à clínica credenciada para renovação da CNH categoria D. É motorista de ônibus urbano há 22 anos.\n\nAo exame: PA 168 x 106 mmHg (confirmada em segunda aferição), IMC 34 kg/m², perímetro cervical 48 cm, Mallampati classe 3. Escala de Epworth 14. Acuidade visual 20/30 no olho direito e 20/40 no esquerdo, com correção; visão binocular 20/25; campo horizontal 130º em cada olho. Dinamometria 34 kgf à direita e 32 kgf à esquerda. Refere roncos altos e uma \"cochilada\" ao volante em semáforo, há dois meses.",
"perguntas":[
"Classifique cada achado quanto às exigências da Resolução CONTRAN nº 927/2022 para a categoria pretendida.",
"Qual o resultado do exame de aptidão física e mental e qual prazo de validade você registraria?",
"Que restrições e observações devem constar da CNH?",
"Qual a conduta em relação ao relato de sonolência ao volante?"
],
"espelho":[
{"p":"Reconhece que a avaliação de distúrbios do sono é OBRIGATÓRIA na renovação para as categorias C, D e E (Anexo X, item 1.1).","peso":2},
{"p":"Identifica pelo menos três indícios objetivos de SAOS: PA acima de 130/85, IMC acima de 30 e perímetro cervical acima de 45 cm no homem; cita ainda o Mallampati classe 3.","peso":2},
{"p":"Reconhece o Epworth de 14 como alterado e conclui que a combinação (Epworth alto e ≥2 indícios objetivos) autoriza aprovação temporária ou encaminhamento para polissonografia.","peso":2},
{"p":"Enquadra a PA de 168x106 na faixa intermediária (PAS 160–179 e/ou PAD 100–109): APTO com diminuição do prazo de validade a critério médico — e não inaptidão temporária, que só começa em 180 e/ou 110.","peso":2},
{"p":"Conclui que a visão atende à categoria D: 20/30 no melhor olho com 20/40 no outro, binocular 20/25 e campo ≥120º em cada olho.","peso":1},
{"p":"Conclui que a dinamometria atende ao piso de 30 kgf em cada mão exigido para C, D e E.","peso":1},
{"p":"Registra a observação de uso obrigatório de lentes corretoras (código A do Anexo XV), já que a acuidade foi obtida com correção.","peso":1},
{"p":"Define o resultado como apto com restrições e prazo de validade reduzido, explicitando o retorno para reavaliação — e não simplesmente 'apto' pelo prazo cheio.","peso":2},
{"p":"Valoriza o episódio de cochilo ao volante como evento sentinela de risco, orientando o afastamento da direção profissional até a investigação e o tratamento da SAOS.","peso":2},
{"p":"Menciona o registro obrigatório da pressão arterial no formulário RENACH.","peso":1}
],
"ref":"Resolução CONTRAN nº 927/2022, Anexos II, V, VIII, X e XV; CTB art. 147, §4º."
},
{
"id":"prt-neuro-01",
"tema":"neuro",
"titulo":"Candidato com epilepsia em retirada de medicação",
"cenario":"Mulher de 26 anos, candidata à primeira habilitação, declara no questionário do Anexo I ser portadora de epilepsia. Traz relatório do neurologista que a acompanha há quatro anos: diagnóstico de epilepsia focal do lobo temporal, última crise há 30 meses; iniciou retirada gradual da carbamazepina há 8 meses e está sem medicação há 3 meses, sem crises. O parecer do assistente é favorável à habilitação.",
"perguntas":[
"Qual deve ser o primeiro resultado do exame e qual documento é necessário?",
"Em qual grupo do Anexo VIII a candidata se enquadra e quais são os requisitos desse grupo?",
"Ela cumpre todos os requisitos? Justifique item a item.",
"Se aprovada, quais restrições e prazos se aplicam?"
],
"espelho":[
{"p":"Indica que o primeiro resultado deve ser 'necessita de exames complementares ou especializados', por declaração de epilepsia ou uso de antiepiléptico.","peso":2},
{"p":"Exige o relatório padronizado do Anexo IX preenchido por médico assistente que acompanhe a candidata há no mínimo um ano — requisito cumprido (quatro anos).","peso":1},
{"p":"Enquadra a candidata no GRUPO II (esquema de retirada de medicação), e não no grupo I.","peso":2},
{"p":"Lista os requisitos do grupo II: não ser portadora de epilepsia mioclônica juvenil; mínimo 2 anos sem crise; retirada com duração mínima de 6 meses; mínimo 6 meses sem crises após a retirada; parecer favorável do assistente.","peso":3},
{"p":"Conclui que ela NÃO cumpre todos: está sem medicação há apenas 3 meses, abaixo dos 6 meses exigidos após a retirada — os demais requisitos estão atendidos (30 meses sem crise, retirada de 8 meses, epilepsia focal, parecer favorável).","peso":3},
{"p":"Define a conduta como inapta temporária, com reavaliação após completar 6 meses sem crises depois da retirada.","peso":2},
{"p":"Se aprovada no futuro: apta somente para a categoria B.","peso":2},
{"p":"Se aprovada: diminuição do prazo de validade a critério médico na primeira habilitação e repetição dos procedimentos a cada renovação; no grupo II, prazo normal já a partir da primeira renovação.","peso":2}
],
"ref":"Resolução CONTRAN nº 927/2022, Anexo VIII, itens 2.1 a 2.7, e Anexo IX; Diretriz ABRAMET/AMB/CFM sobre epilepsia."
},
{
"id":"prt-curativa-01",
"tema":"curativa",
"titulo":"Atendimento pré-hospitalar de colisão com múltiplas vítimas",
"cenario":"Você é o médico da equipe de suporte avançado acionada para colisão frontal entre um automóvel e uma van em rodovia. Há 6 vítimas. Ao chegar, a via segue com tráfego nos dois sentidos e há vazamento de combustível sob a van.\n\nUma das vítimas é homem de 30 anos, ejetado do automóvel, encontrado em decúbito dorsal, responde apenas a estímulo doloroso, respiração 32 irpm, pulso radial filiforme, palidez intensa, distensão abdominal e deformidade em coxa direita.",
"perguntas":[
"Quais são as prioridades antes de tocar em qualquer vítima?",
"Descreva a avaliação primária dessa vítima na sequência correta e as intervenções em cada etapa.",
"Como você organizaria a triagem das 6 vítimas?",
"Quais os critérios para o transporte e para qual recurso hospitalar essa vítima deve ser levada?"
],
"espelho":[
{"p":"Prioriza a segurança da cena antes do atendimento: sinalização, controle do tráfego, risco de incêndio pelo vazamento de combustível e uso de EPI.","peso":2},
{"p":"Aplica o método START para triagem de múltiplas vítimas, classificando por capacidade de deambular, respiração, perfusão e nível de consciência.","peso":2},
{"p":"Avaliação primária na sequência ABCDE, com controle de hemorragia exsanguinante quando presente.","peso":2},
{"p":"A — via aérea com estabilização/restrição do movimento cervical, dado o mecanismo de ejeção e o rebaixamento do nível de consciência.","peso":2},
{"p":"B — oferta de oxigênio, avaliação de expansibilidade, ausculta e exclusão de pneumotórax hipertensivo diante da taquipneia.","peso":2},
{"p":"C — reconhece choque hemorrágico (pulso radial filiforme, palidez, taquipneia): dois acessos calibrosos, controle de hemorragia, atenção ao abdome distendido como foco provável e à fratura de fêmur.","peso":3},
{"p":"D — avaliação neurológica (Glasgow/AVDI e pupilas); reconhece que responder só à dor indica rebaixamento importante.","peso":1},
{"p":"E — exposição com prevenção de hipotermia.","peso":1},
{"p":"Imobiliza a fratura de fêmur, idealmente com tração, reconhecendo-a como fonte adicional de sangramento.","peso":1},
{"p":"Indica transporte rápido para hospital com recurso cirúrgico (centro de trauma), evitando permanência prolongada em cena.","peso":2},
{"p":"Comunica previamente a unidade receptora e aciona recursos adicionais compatíveis com o número de vítimas.","peso":1}
],
"ref":"Conteúdo programático — Medicina do Tráfego Curativa (APH, avaliação primária e secundária, método START); Protocolo SAMU 192 de Suporte Básico de Vida."
},
{
"id":"prt-protecao-01",
"tema":"protecao",
"titulo":"Orientação sobre transporte veicular de criança",
"cenario":"Em consulta, mãe de duas crianças pede orientação sobre transporte no carro: um menino de 3 anos, 15 kg e 98 cm, e uma menina de 8 anos, 27 kg e 132 cm. O carro é um sedã com cinto de três pontos nos bancos traseiros laterais e cinto subabdominal no assento traseiro central. Ela conta que costuma levar o mais velho no banco da frente \"porque briga menos\" e que na semana passada, num trajeto curto, levou o menor no colo.",
"perguntas":[
"Qual dispositivo de retenção é indicado para cada criança e em que posição do veículo?",
"Explique por que o banco traseiro é mais seguro e qual o risco do transporte no colo.",
"Que orientações você daria sobre o uso do cinto de três pontos pela criança maior?",
"Cite os fundamentos biomecânicos que sustentam essas recomendações."
],
"espelho":[
{"p":"Indica para a criança de 3 anos dispositivo de retenção adequado à idade/peso/estatura (cadeirinha com retenção própria), no banco TRASEIRO.","peso":2},
{"p":"Indica para a criança de 8 anos o assento de elevação (booster) com cinto de três pontos, no banco traseiro, enquanto não atingir a estatura que permite o uso isolado do cinto.","peso":2},
{"p":"Contraindica o assento traseiro central quando só há cinto subabdominal de dois pontos, por não conter o tronco e pelo risco de lesão abdominal e da coluna lombar.","peso":2},
{"p":"Desaconselha expressamente o transporte da criança no banco da frente e explica o risco adicional do airbag do passageiro.","peso":2},
{"p":"Explica que o transporte no colo é inaceitável mesmo em trajeto curto: na desaceleração, o peso aparente da criança se multiplica e ela é projetada ou esmagada pelo corpo do adulto.","peso":3},
{"p":"Orienta o posicionamento correto do cinto de três pontos: faixa diagonal sobre a clavícula (nunca no pescoço nem sob o braço) e faixa subabdominal sobre a pelve óssea, nunca sobre o abdome.","peso":2},
{"p":"Fundamenta na biomecânica do impacto: o dispositivo distribui a energia sobre segmentos ósseos resistentes, aumenta o tempo de desaceleração e reduz o deslocamento do ocupante.","peso":2},
{"p":"Cita a desproporção cefálica e a imaturidade do esqueleto infantil como razões para dispositivos específicos por faixa.","peso":1},
{"p":"Menciona que o descumprimento das regras de transporte de crianças configura infração de trânsito.","peso":1},
{"p":"Refere as diretrizes ABRAMET/AMB/CFM de segurança no transporte veicular de crianças (Partes 1 e 2) como base da orientação.","peso":1}
],
"ref":"Conteúdo programático — transporte veicular de crianças; Diretrizes ABRAMET/AMB/CFM 'Segurança no transporte veicular de crianças', Partes 1 e 2; CFM, Medicina de Tráfego: transporte seguro de crianças em veículos automotores (2019). Conferir a resolução do CONTRAN vigente sobre dispositivos de retenção antes de citar faixas exatas."
},
{
"id":"prt-alcool-01",
"tema":"alcool",
"titulo":"Condutor abordado em blitz recusa o etilômetro",
"cenario":"Durante fiscalização, condutor de 41 anos é abordado. Apresenta hálito etílico, fala arrastada, desequilíbrio e olhos avermelhados. Recusa-se a soprar o etilômetro e também a coleta de sangue, alegando direito de não produzir prova contra si.",
"perguntas":[
"É possível responsabilizá-lo administrativamente sem o etilômetro? Como?",
"E na esfera penal, é possível caracterizar o crime do art. 306? Por quais meios?",
"Quais penalidades e medidas administrativas se aplicam?",
"Do ponto de vista da medicina do tráfego, como o álcool prejudica a condução?"
],
"espelho":[
{"p":"Reconhece que a recusa é, por si só, infração autônoma do art. 165-A, com as mesmas penalidades do art. 165.","peso":3},
{"p":"Explica que a alteração da capacidade psicomotora pode ser constatada por SINAIS clínicos disciplinados pelo CONTRAN, além da concentração aferida (art. 306, §1º, II).","peso":3},
{"p":"Lista os meios de prova admitidos pelo art. 306, §2º: teste de alcoolemia ou toxicológico, exame clínico, perícia, vídeo, prova testemunhal e outros meios em direito admitidos, observado o direito à contraprova.","peso":2},
{"p":"Cita os limiares objetivos do art. 306, §1º, I: ≥6 decigramas por litro de sangue ou ≥0,3 mg por litro de ar alveolar.","peso":2},
{"p":"Descreve as penalidades: infração gravíssima, multa multiplicada por dez e suspensão do direito de dirigir por 12 meses; multa em dobro se houver reincidência em até 12 meses.","peso":2},
{"p":"Descreve as medidas administrativas: recolhimento do documento de habilitação e retenção do veículo.","peso":1},
{"p":"Aponta a pena do crime: detenção de seis meses a três anos, multa e suspensão ou proibição de obter a permissão ou habilitação.","peso":1},
{"p":"Explica os efeitos do álcool na condução: aumento do tempo de reação, prejuízo da atenção dividida e do julgamento de risco, redução da acuidade e do campo visual funcional, nistagmo e piora do desempenho em baixa luminosidade.","peso":3},
{"p":"Menciona a desinibição comportamental, com aumento da velocidade praticada e menor uso de equipamentos de segurança.","peso":1},
{"p":"Refere a diretriz ABRAMET/AMB/CFM 'Alcoolemia e direção veicular segura' como base.","peso":1}
],
"ref":"CTB arts. 165, 165-A e 306; Diretriz ABRAMET/AMB/CFM 'Alcoolemia e direção veicular segura'."
},
{
"id":"prt-aeroespacial-01",
"tema":"aeroespacial",
"titulo":"Emergência médica a bordo em voo de longa duração",
"cenario":"Você é passageiro médico em voo comercial de 11 horas, cruzando a 11.000 metros (cabine pressurizada equivalente a cerca de 2.400 metros). Quatro horas após a decolagem, a tripulação solicita auxílio: homem de 62 anos, tabagista, apresenta dor torácica retroesternal em aperto há 20 minutos, sudorese, náusea, PA 100 x 60 mmHg, FC 104 bpm, saturação 91%.",
"perguntas":[
"Quais particularidades do ambiente de cabine influenciam esse quadro?",
"Qual a sua conduta imediata com os recursos disponíveis a bordo?",
"Quais critérios você usaria para recomendar o desvio da aeronave?",
"Que orientação daria a esse paciente numa consulta pré-viagem, se tivesse sido consultado antes?"
],
"espelho":[
{"p":"Explica que a cabine é pressurizada a uma altitude equivalente de cerca de 1.800 a 2.400 metros, com queda da pressão parcial de oxigênio e saturação normalmente mais baixa mesmo em pessoas hígidas.","peso":3},
{"p":"Relaciona a hipóxia hipobárica ao aumento da demanda miocárdica e à descompensação de doença coronariana prévia.","peso":2},
{"p":"Cita outros fatores do ambiente de cabine: baixa umidade, imobilidade prolongada, expansão de gases (lei de Boyle), ruído e vibração.","peso":1},
{"p":"Conduta imediata: oxigênio suplementar disponível a bordo, posicionamento, monitorização dos sinais vitais e acesso ao kit médico de emergência.","peso":2},
{"p":"Considera o uso de AAS do kit de emergência para suspeita de síndrome coronariana aguda, com atenção às contraindicações.","peso":2},
{"p":"Cautela com nitrato diante de PA sistólica de 100 mmHg e possível hipotensão.","peso":2},
{"p":"Aciona o suporte médico em solo por telemedicina, recurso padrão das companhias aéreas, e registra o atendimento.","peso":2},
{"p":"Critérios de desvio: instabilidade hemodinâmica, dor refratária, arritmia, rebaixamento de consciência ou necessidade de recurso indisponível a bordo — ponderando tempo até o aeroporto alternativo mais próximo com estrutura adequada.","peso":3},
{"p":"Consulta pré-viagem: avaliação de estabilidade da doença coronariana e do intervalo desde eventos recentes, ajuste de medicação e disponibilidade dela na bagagem de mão.","peso":2},
{"p":"Orienta profilaxia de tromboembolismo em voo longo: deambulação, hidratação, exercícios de panturrilha e meias de compressão quando indicadas ('síndrome da classe econômica').","peso":2},
{"p":"Menciona o ajuste de fuso horário e o impacto do jet lag sobre a adesão a medicações de horário fixo.","peso":1}
],
"ref":"Conteúdo programático — Medicina do Tráfego Aeroespacial e Medicina do Viajante; RBAC nº 67 da ANAC. Conferir os protocolos de kit de emergência e suporte em solo da companhia antes de citar condutas específicas."
}
];
