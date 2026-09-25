/* Núcleo do sync.js antigo (até 25/09/2026). Só é usado UMA vez por conta, pelo
   conta-estudo.js, para trazer o que estava no formato velho. Não editar. */
/* TráfegoTítulo — sincronização multi-dispositivo pelo Firebase central (medtech-c658c).
   Padrão do ecossistema (lição Granaê/FarmáciaGest): junção ITEM A ITEM com carimbos de
   tempo + lápides. NUNCA last-write-wins do estado inteiro.
   Layout: users/{uid}/apps/trafego-titulo/{colecao}/{itemId} — um doc pequeno por item
   (regras vigentes cobrem qualquer profundidade sob users/{uid}; sem teto de 1 MiB).
   O app funciona 100% offline sem login; sync é opcional e best-effort. */
"use strict";

/* ================= núcleo puro (testável em Node) ================= */
const TTSYNC_CORE = (() => {
  // tipo de merge por coleção:
  //  uniao-hist: união dos lançamentos do histórico por (ts|alt|ok), teto 60
  //  lww: o item com ts maior vence
  //  lww-flag: liga/desliga com ts (favoritos)
  //  lww-lista: lista de índices com ts (riscos)
  //  linhas: linhas de tabela com id próprio + lápide {del:1}
  //  uniao-id: itens imutáveis unidos por id (simulados)
  //  max: contadores por dia, vence o maior
  //  doc-unico: documento único "_" com lww
  const COLS = {
    resp:      { ls: "tt_resp",      tipo: "uniao-hist" },
    flash:     { ls: "tt_flash",     tipo: "lww" },
    fav:       { ls: "tt_fav",       tipo: "lww-flag" },
    riscos:    { ls: "tt_riscos",    tipo: "lww-lista" },
    erros:     { ls: "tt_erros",     tipo: "linhas" },
    plano:     { ls: "tt_plano",     tipo: "linhas" },
    sim:       { ls: "tt_sim",       tipo: "uniao-id" },
    treino:    { ls: "tt_treino",    tipo: "lww" },
    atividade: { ls: "tt_atividade", tipo: "max" },
    meta:      { ls: "tt_meta",      tipo: "doc-unico" },
    cfg:       { ls: "tt_cfg",       tipo: "doc-unico" },
    lidas:     { ls: "tt_lidas",     tipo: "lww-flag" }
  };
  const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // estado local da coleção -> mapa {itemId: valorNormalizado}
  function itens(col, estado) {
    const t = COLS[col].tipo, v = estado[COLS[col].ls];
    if (t === "doc-unico") return (v && Object.keys(v).length) ? { _: { v } } : {};
    if (t === "linhas") {
      const out = {};
      (v || []).forEach(l => { if (l && l.id) out[l.id] = { v: l } });
      return out;
    }
    if (t === "uniao-id") {
      const out = {};
      (v || []).forEach(s => { if (s && s.id) out[s.id] = { v: s } });
      return out;
    }
    if (t === "max") {
      const out = {};
      Object.entries(v || {}).forEach(([d, n]) => out[d] = { v: { n } });
      return out;
    }
    if (t === "lww-flag") {
      const out = {};
      Object.keys(v || {}).forEach(ch => out[ch] = { v: { on: 1 } });
      return out;
    }
    if (t === "lww-lista") {
      const out = {};
      Object.entries(v || {}).forEach(([ch, r]) => out[ch] = { v: { r } });
      return out;
    }
    const out = {}; // lww / uniao-hist: objeto {id: valor}
    Object.entries(v || {}).forEach(([id, val]) => out[id] = { v: val });
    return out;
  }

  // diff do estado atual contra a sombra -> {envia:[{id,dado}], remove:[id]}
  function diff(col, estado, sombra) {
    const agora = itens(col, estado), antes = sombra[col] || {};
    const envia = [], remove = [];
    for (const [id, it] of Object.entries(agora)) {
      if (!antes[id] || JSON.stringify(antes[id].v) !== JSON.stringify(it.v)) envia.push({ id, dado: it.v });
    }
    const t = COLS[col].tipo;
    for (const id of Object.keys(antes)) {
      if (agora[id]) continue;
      if (t === "linhas") remove.push(id);                       // lápide de verdade
      else if (t === "lww-flag") envia.push({ id, dado: { on: 0 } });   // desfavoritar
      else if (t === "lww-lista") envia.push({ id, dado: { r: [] } });  // limpar riscos
      // demais tipos não removem itens legitimamente: ignora (falha segura)
    }
    return { envia, remove };
  }

  // aplica um doc remoto ao estado local; devolve true se mudou algo
  function aplica(col, id, dado, estado, metaItens) {
    const cfg = COLS[col], t = cfg.tipo, ls = cfg.ls;
    const tsRem = dado._ts || 0;
    const tsLoc = (metaItens[col] || {})[id] || 0;
    const marca = () => { (metaItens[col] = metaItens[col] || {})[id] = Math.max(tsRem, tsLoc) };
    if (t === "uniao-hist") {
      const alvo = estado[ls][id] || (estado[ls][id] = { hist: [] });
      const chaveL = h => (h.ts || 0) + "|" + h.alt + "|" + (h.ok ? 1 : 0) + "|" + (h.d || "");
      const tem = new Set(alvo.hist.map(chaveL));
      let mudou = false;
      (dado.hist || []).forEach(h => { if (!tem.has(chaveL(h))) { alvo.hist.push(h); tem.add(chaveL(h)); mudou = true } });
      if (mudou) { alvo.hist.sort((a, b) => (a.ts || 0) - (b.ts || 0)); if (alvo.hist.length > 60) alvo.hist = alvo.hist.slice(-60) }
      marca(); return mudou;
    }
    if (t === "uniao-id") {
      if ((estado[ls] || []).some(s => s.id === id)) { marca(); return false }
      const item = dado.v ? { ...dado.v } : (() => { const { _ts, ...r } = dado; return r })();
      item.id = id; estado[ls].push(item);
      estado[ls].sort((a, b) => String(a.id).localeCompare(String(b.id)));
      marca(); return true;
    }
    if (t === "max") {
      const atual = estado[ls][id] || 0, n = dado.n || 0;
      marca(); if (n > atual) { estado[ls][id] = n; return true } return false;
    }
    // tipos LWW: só aplica se o remoto é mais novo que o último visto deste item
    if (tsRem <= tsLoc) return false;
    metaItens[col] = metaItens[col] || {}; metaItens[col][id] = tsRem;
    if (t === "doc-unico") { // muta no lugar: ST.<chave> continua apontando p/ o mesmo objeto
      const alvo = estado[ls];
      Object.keys(alvo).forEach(k => delete alvo[k]);
      Object.assign(alvo, dado.v || {});
      return true;
    }
    if (t === "linhas") {
      const arr = estado[ls], i = arr.findIndex(l => l.id === id);
      if (dado.del) { if (i >= 0) { arr.splice(i, 1); return true } return false }
      if (!dado.v) return false;
      const nova = { ...dado.v, id };
      if (i >= 0) arr[i] = nova; else arr.unshift(nova);
      return true;
    }
    if (t === "lww-flag") {
      if (dado.on) { estado[ls][id] = 1 } else delete estado[ls][id];
      return true;
    }
    if (t === "lww-lista") {
      if (dado.r && dado.r.length) estado[ls][id] = dado.r; else delete estado[ls][id];
      return true;
    }
    // lww simples (flash, treino)
    const { _ts, ...valor } = dado;
    estado[ls][id] = valor.v !== undefined && Object.keys(valor).length === 1 ? valor.v : valor;
    return true;
  }

  // empacota p/ envio: doc plano com ts (linhas/uniao-id/doc-unico embrulham em v)
  function empacota(col, dado, ts) {
    const t = COLS[col].tipo;
    if (t === "linhas" || t === "doc-unico" || t === "uniao-id") return { v: dado.v || dado, _ts: ts };
    return { ...dado, _ts: ts };
  }

  // desfaz o empacota: devolve o valor "normalizado" que o doc remoto representa
  function desempacota(col, dado) {
    const t = COLS[col].tipo;
    if (dado.del) return { del: 1 };
    if (t === "linhas" || t === "doc-unico" || t === "uniao-id") return dado.v;
    const { _ts, ...valor } = dado; return valor;
  }

  return { COLS, itens, diff, aplica, empacota, desempacota, novoId };
})();
if (typeof module !== "undefined") module.exports = TTSYNC_CORE;


if (typeof window !== "undefined") window.TTSYNC_CORE = TTSYNC_CORE;
