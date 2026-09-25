#!/usr/bin/env node
/* Teste fim-a-fim do motor de sincronização (TTSYNC_CORE) com dois aparelhos
   simulados e um armazém falso que reproduz a superfície usada do Firestore
   (docs por item + consulta ts>x). Roda: node testa_sync.js */
"use strict";
const C = require("./sync-legado.js");
let RELOGIO = 1_000_000; const tique = () => ++RELOGIO;

const loja = {}; // {col:{id:doc}}
function novoAparelho(nome) {
  return { nome, sombra: {}, metaItens: {}, lastPull: {},
    estado: { tt_resp: {}, tt_flash: {}, tt_fav: {}, tt_riscos: {}, tt_erros: [], tt_plano: [],
      tt_sim: [], tt_treino: {}, tt_atividade: {}, tt_meta: {}, tt_cfg: {}, tt_lidas: {} } };
}
function empurra(dev) {
  let ops = 0; const ts = tique();
  for (const col of Object.keys(C.COLS)) {
    const { envia, remove } = C.diff(col, dev.estado, dev.sombra);
    for (const { id, dado } of envia) { (loja[col] = loja[col] || {})[id] = C.empacota(col, dado, ts); ops++;
      (dev.metaItens[col] = dev.metaItens[col] || {})[id] = ts; }
    for (const id of remove) { (loja[col] = loja[col] || {})[id] = { del: 1, _ts: ts }; ops++;
      (dev.metaItens[col] = dev.metaItens[col] || {})[id] = ts; }
  }
  atualizaSombra(dev); return ops;
}
function puxa(dev) { // espelha a camada do navegador: sombra NÃO absorve mudanças locais
  let n = 0;
  for (const col of Object.keys(C.COLS)) {
    const desde = (dev.lastPull[col] || 0) - 2;
    let max = dev.lastPull[col] || 0;
    for (const [id, doc] of Object.entries(loja[col] || {})) {
      if ((doc._ts||0) <= desde) continue;
      max = Math.max(max, doc._ts||0);
      if (C.aplica(col, id, doc, dev.estado, dev.metaItens)) n++;
      const locAgora = C.itens(col, dev.estado)[id];
      if (locAgora && JSON.stringify(locAgora.v) === JSON.stringify(C.desempacota(col, doc)))
        (dev.sombra[col] = dev.sombra[col] || {})[id] = JSON.parse(JSON.stringify(locAgora));
      else if (!locAgora && doc.del && dev.sombra[col]) delete dev.sombra[col][id];
    }
    dev.lastPull[col] = max;
  }
  return n;
}
function atualizaSombra(dev) {
  for (const col of Object.keys(C.COLS)) dev.sombra[col] = JSON.parse(JSON.stringify(C.itens(col, dev.estado)));
}

let falhas = 0, ordem = 0;
function ok(rotulo, cond, extra) {
  ordem++;
  if (cond) console.log(`  ok ${String(ordem).padStart(2)} — ${rotulo}`);
  else { falhas++; console.log(`  FALHA ${ordem} — ${rotulo}${extra ? " :: " + JSON.stringify(extra) : ""}`) }
}

/* ---------- cenário ---------- */
const A = novoAparelho("A"), B = novoAparelho("B");

// A estuda: 2 questões, favorito, risco, erro, flashcard, atividade, meta, simulado
A.estado.tt_resp.q1 = { hist: [{ d: "2026-08-18", ok: true, alt: 2, m: "estudo", ts: tique() }] };
A.estado.tt_resp.q2 = { hist: [{ d: "2026-08-18", ok: false, alt: 0, m: "estudo", ts: tique() }] };
A.estado.tt_fav.q1 = 1;
A.estado.tt_riscos.q2 = [0];
A.estado.tt_erros.push({ id: "e1", d: "2026-08-18", tema: "torax", oque: "halo", porque: "", licao: "" });
A.estado.tt_flash.c1 = { ef: 2.6, iv: 1, reps: 1, due: "2026-08-19", ts: tique() };
A.estado.tt_atividade["2026-08-18"] = 3;
A.estado.tt_meta.dataProva = "2027-05-16"; A.estado.tt_meta.alvo = 2000;
A.estado.tt_sim.push({ id: "s1", quando: "2026-08-18", nota: 20, acertos: 1, detalhes: [{ ch: "q1", alt: 0, ok: false }] });

console.log("1) A empurra o estado inicial");
const opsA1 = empurra(A);
ok("A enviou 9 itens", opsA1 === 9, { opsA1 });

console.log("2) B (vazio) puxa tudo");
puxa(B);
ok("respostas chegaram por chave", B.estado.tt_resp.q1 && B.estado.tt_resp.q2 && B.estado.tt_resp.q1.hist.length === 1);
ok("favorito chegou", B.estado.tt_fav.q1 === 1);
ok("risco chegou", JSON.stringify(B.estado.tt_riscos.q2) === "[0]");
ok("linha de erro chegou", B.estado.tt_erros.length === 1 && B.estado.tt_erros[0].id === "e1");
ok("flashcard chegou", B.estado.tt_flash.c1 && B.estado.tt_flash.c1.ef === 2.6);
ok("atividade chegou", B.estado.tt_atividade["2026-08-18"] === 3);
ok("meta chegou", B.estado.tt_meta.dataProva === "2027-05-16");
ok("simulado chegou sem embrulho", B.estado.tt_sim.length === 1 && B.estado.tt_sim[0].nota === 20 && !B.estado.tt_sim[0].v);

console.log("3) B estuda e mexe: nova resposta em q1, apaga erro e1, cria e2, desfavorita q1, risca mais, flashcard mais novo, atividade maior");
B.estado.tt_resp.q1.hist.push({ d: "2026-08-19", ok: false, alt: 1, m: "estudo", ts: tique() });
B.estado.tt_erros = B.estado.tt_erros.filter(e => e.id !== "e1");           // lápide
B.estado.tt_erros.push({ id: "e2", d: "2026-08-19", tema: "neuro", oque: "difusão", porque: "confundi ADC", licao: "DWI+ADC sempre" });
delete B.estado.tt_fav.q1;                                                   // desfavoritar
B.estado.tt_riscos.q2 = [0, 1];
B.estado.tt_flash.c1 = { ef: 2.7, iv: 6, reps: 2, due: "2026-08-25", ts: tique() };
B.estado.tt_atividade["2026-08-18"] = 5;
const opsB = empurra(B);
ok("B enviou as mudanças (6 itens: resp, e1-lápide, e2, fav-off, riscos, flash, atividade)", opsB === 7, { opsB });

console.log("4) A também mudou localmente antes de puxar (união deve preservar os dois lados)");
A.estado.tt_resp.q2.hist.push({ d: "2026-08-19", ok: true, alt: 1, m: "sim", ts: tique() });
A.estado.tt_atividade["2026-08-19"] = 4;
puxa(A);
ok("q1: união dos históricos (2 lançamentos, sem duplicar)", A.estado.tt_resp.q1.hist.length === 2);
ok("q2: mudança local de A preservada", A.estado.tt_resp.q2.hist.length === 2);
ok("lápide apagou e1 em A", !A.estado.tt_erros.some(e => e.id === "e1"));
ok("e2 chegou em A com os campos", A.estado.tt_erros.some(e => e.id === "e2" && e.porque === "confundi ADC"));
ok("desfavoritar propagou", !A.estado.tt_fav.q1);
ok("flashcard: versão mais nova venceu (LWW)", A.estado.tt_flash.c1.iv === 6);
ok("riscos: lista mais nova venceu", JSON.stringify(A.estado.tt_riscos.q2) === "[0,1]");
ok("atividade: max(3,5)=5 no dia 18", A.estado.tt_atividade["2026-08-18"] === 5);
ok("simulado não duplicou", A.estado.tt_sim.length === 1);

console.log("5) A empurra; B puxa; estados convergem");
empurra(A); puxa(B);
ok("q2 de B tem a união", B.estado.tt_resp.q2.hist.length === 2);
ok("atividade do dia 19 chegou em B", B.estado.tt_atividade["2026-08-19"] === 4);
const foto = d => JSON.stringify(Object.keys(C.COLS).map(c => C.itens(c, d.estado)));
ok("A e B idênticos ao fim", foto(A) === foto(B));

console.log("6) idempotência: novo ciclo sem mudanças não envia nem altera nada");
const antes = foto(A);
ok("A: zero envios", empurra(A) === 0);
ok("B: zero envios", empurra(B) === 0);
puxa(A); puxa(B);
ok("nada mudou", foto(A) === antes && foto(B) === antes);

console.log("7) meta editada dos dois lados: mais novo vence e o objeto é mutado no lugar");
const refMetaA = A.estado.tt_meta;
A.estado.tt_meta.alvo = 2500; empurra(A);
B.estado.tt_meta.alvo = 3000; empurra(B);   // B depois de A → B vence
puxa(A);
ok("meta de A virou a de B (LWW)", A.estado.tt_meta.alvo === 3000);
ok("referência do objeto meta preservada", A.estado.tt_meta === refMetaA);

// 8) leituras (lww-flag): marcar num aparelho aparece no outro; desmarcar propaga
console.log("8) leituras marcadas como lidas");
{
  const A = novoAparelho("A"), B = novoAparelho("B");
  A.estado.tt_lidas["exame-toxicologico.html"] = "2026-09-22";
  empurra(A); puxa(B);
  ok("B vê a leitura lida em A", !!B.estado.tt_lidas["exame-toxicologico.html"]);
  delete A.estado.tt_lidas["exame-toxicologico.html"]; tique();
  empurra(A); puxa(B);
  ok("desmarcar em A desmarca em B", !B.estado.tt_lidas["exame-toxicologico.html"]);
}
console.log(falhas ? `\n${falhas} FALHAS` : "\nTODOS OS TESTES PASSARAM");
process.exit(falhas ? 1 : 0);
