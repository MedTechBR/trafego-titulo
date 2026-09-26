/* conta-estudo.js — liga o mtsync.js ao molde TráfegoTítulo/RadioTítulo (mesmo ARM, mesmo ST).
   FONTE ÚNICA em ~/Documents/Claude/_mtsync/; cada app leva uma cópia e define, ANTES deste
   script, window.CONTA_CFG = {app, nome, pref, global, pronto, ganchos, idb, legadoApp, acesso?, lidas?}.

   Substitui o sync.js antigo (login opcional em Ajustes, puxa/empurra a cada 5 min). Agora:
   o app só abre logado, cada gravação sobe sozinha e o que chega de outro aparelho entra em
   tempo real. O motor antigo (sync-legado.js) só é usado uma vez por conta, para trazer o que
   estava no formato velho (users/{uid}/apps/<app>/<colecao>/<id>). */
(function () {
  "use strict";
  const K = window.CONTA_CFG;
  const X = () => window[K.ganchos];            /* window.__tt / window.__rt */
  const ST = () => X().ST, ARM = () => X().ARM;

  const COLECOES = {
    resp: { tipo: "hist", teto: 60 },
    flash: { tipo: "mapa" }, fav: { tipo: "mapa" }, riscos: { tipo: "mapa" }, treino: { tipo: "mapa" },
    erros: { tipo: "lista", id: "id", novosNoInicio: true },
    plano: { tipo: "lista", id: "id", novosNoInicio: true },
    sim: { tipo: "lista", id: "id", ordena: (a, b) => String(a.id).localeCompare(String(b.id)) },
    atividade: { tipo: "soma" },
    meta: { tipo: "doc", vazio: {} }, cfg: { tipo: "doc", vazio: {} }
  };
  if (K.lidas) COLECOES.lidas = { tipo: "mapa" };
  /* questões sinalizadas com erro (mtsinal.js); mapa tem lápide, então tirar a bandeira propaga */
  COLECOES.sinal = { tipo: "mapa" };

  /* ---------- formato antigo: uma vez por conta ---------- */
  async function legado(ctx) {
    const CORE = window[K.core]; if (!CORE) return false;   /* sem o núcleo antigo, tenta de novo na próxima abertura */
    const base = ctx.db.collection("users").doc(ctx.uid).collection("apps").doc(K.legadoApp);
    let meta = {}; try { meta = JSON.parse(localStorage.getItem(K.pref + "syncmeta")) || {} } catch (e) {}
    const itensMeta = meta.itens || {};
    const s = ST(), estado = {};
    Object.keys(CORE.COLS).forEach(col => {
      const chave = CORE.COLS[col].ls.slice(K.pref.length);
      if (s[chave] === undefined) s[chave] = Array.isArray(CORE.COLS[col].vazio) ? [] : (["erros", "plano", "sim"].includes(chave) ? [] : {});
      estado[CORE.COLS[col].ls] = s[chave];
    });
    const mudou = new Set();
    for (const col of Object.keys(CORE.COLS)) {
      const snap = await Promise.race([base.collection(col).get({ source: "server" }),
        new Promise((_, f) => setTimeout(() => f(new Error("tempo")), 9000))]);
      snap.forEach(d => {
        /* atividade só entra antes de o motor começar: depois a contagem é por aparelho */
        if (col === "atividade" && ctx.depois) return;
        try { if (CORE.aplica(col, d.id, d.data(), estado, itensMeta)) mudou.add(col) } catch (e) {}
      });
    }
    mudou.forEach(col => { const chave = CORE.COLS[col].ls.slice(K.pref.length); ARM().save(K.pref + chave, s[chave]) });
    return true;
  }

  async function limparLocal() {
    /* inclui a fila de envio das sinalizações (mtsinal.js): senão sairia com o login da conta nova */
    try { Object.keys(localStorage).filter(k => (k.startsWith(K.pref) && k !== K.pref + "tema") || k === "msn_fila:" + K.app).forEach(k => localStorage.removeItem(k)) } catch (e) {}
    try { if (ARM().db) ARM().db.close() } catch (e) {}
    await new Promise(r => { try { const q = indexedDB.deleteDatabase(K.idb); q.onsuccess = q.onerror = q.onblocked = () => r() } catch (e) { r() } });
  }

  function aoReceber() {
    /* redesenha só telas de consulta; a questão aberta não sai do lugar */
    try {
      const aba = (ST().pos || {}).aba;
      if (aba && !["questoes", "simulado", "pratica", "flash", "cartoes", "imagens", "leitura"].includes(aba)) X().irAba(aba, false);
      if (typeof X().pintaContagem === "function") X().pintaContagem();
    } catch (e) {}
  }

  const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let slot = null;
  function pinta() {
    if (!slot || !document.body.contains(slot)) return;
    const u = MTS.usuario; if (!u) { slot.innerHTML = ""; return }
    const d = MTS.descreve();
    const cor = d.cl === "erro" ? "var(--err,#B4231F)" : d.cl === "pend" ? "var(--mut)" : "var(--ok,#166534)";
    slot.innerHTML = `<div class="cartao"><h2>Conta</h2>
      <p class="peq">Conectado como <b>${esc(u.displayName || u.email || "")}</b>${u.displayName && u.email ? ` (${esc(u.email)})` : ""}.</p>
      <p class="peq" id="contaSit" style="margin-top:6px;color:${cor}">${esc(d.txt)}</p>
      <p class="peq mut" style="margin-top:6px">Tudo o que você faz é salvo sozinho na sua conta enquanto estuda, e aparece igual no celular e no computador. Sem internet, o app continua funcionando e envia depois.</p>
      <div class="linha" style="margin-top:10px"><button class="btn fant" id="contaSair" type="button">Sair da conta</button></div></div>`;
    slot.querySelector("#contaSair").onclick = () => { if (confirm(`Sair da conta? O ${K.nome} pede login, então a tela de entrada volta. Seu progresso fica salvo na conta.`)) MTS.sair() };
  }

  window[K.global] = {
    aoSalvar(k) { if (typeof k === "string" && k.startsWith(K.pref)) { const c = k.slice(K.pref.length); if (COLECOES[c]) MTS.mudou(c) } },
    renderCartao(el) { slot = el; pinta() }
  };

  function inicia() {
    const cs = getComputedStyle(document.documentElement), g = n => cs.getPropertyValue(n).trim();
    MTS.aoMudarSituacao(s => { const el = document.getElementById("contaSit"); if (el) el.textContent = MTS.descreve(s).txt });
    MTS.iniciar({
      app: K.app, nome: K.nome, pref: K.pref, vendor: "vendor/",
      cores: { cor: g(K.corVar || "--brand") || "#0E5A6D", sobrecor: "#fff", fundo: g("--bg") || "#F7F5F1", texto: g("--ink") || "#20242B",
        suave: g("--mut") || "#63707E", borda: g("--line") || "#E4E0D7", campo: g("--pan") || "#fff" },
      colecoes: COLECOES,
      ler: c => ST()[c],
      gravar: (c, v) => { const s = ST(); s[c] = MTS.emLugar(s[c], v); ARM().save(K.pref + c, s[c]) },
      aoReceber, legado, limparLocal,
      aoEntrar(u) {
        if (K.acesso && window.MTAcesso) MTAcesso.verificar({ appId: K.acesso, user: u, signOut: () => MTS.sair() }).catch(() => {});
        pinta();
      }
    });
  }
  if (window[K.prontoFlag]) inicia(); else window.addEventListener(K.pronto, inicia, { once: true });
})();
