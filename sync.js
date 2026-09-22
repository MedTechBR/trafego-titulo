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

/* ================= camada de navegador ================= */
if (typeof window !== "undefined") (function () {
  const FBCFG = { // config PÚBLICA do projeto central (mesma do site — pública por design)
    apiKey: "AIzaSyD2mGtXsfAyirtqvAaeWjoPacKMOK3qtVU",
    authDomain: "medtech-c658c.firebaseapp.com",
    projectId: "medtech-c658c",
    storageBucket: "medtech-c658c.firebasestorage.app",
    messagingSenderId: "815142768751",
    appId: "1:815142768751:web:2db574351bd785b0b7fd9a"
  };
  const APPID = "trafego-titulo";
  const C = TTSYNC_CORE;
  const $s = s => document.querySelector(s);

  const TTSYNC = {
    estado: "desligado", // desligado | carregando | deslogado | sincronizando | ok | erro
    detalhe: "", user: null, db: null, sombra: null, meta: null,
    _t: null, _debounce: null, _aplicando: false, _el: null,

    st() { return window.__tt.ST }, arm() { return window.__tt.ARM },

    async init() {
      this.meta = this.arm().load("tt_syncmeta", { ligado: false, lastPull: {}, itens: {} });
      if (this.meta.ligado) { await this.ligarSDK(); } // retoma sessão salva
      else if (navigator.onLine !== false) {
        // Desde 21/09/2026 o app mora em medtechbr.com.br, o MESMO domínio do portal:
        // quem já entrou no portal tem a sessão aqui. Detecta em segundo plano, sem
        // atrasar a abertura, e liga a sincronização sozinho se houver conta.
        setTimeout(() => this.ligarSDK().then(ok => { if (!ok && !this.meta.ligado) this.mudaEstado("desligado", ""); this.render() }), 2500);
      }
      this.render();
    },

    async ligarSDK() {
      if (window.firebase && firebase.firestore) return true;
      if (this.meta.ligado || this.estado !== "desligado") this.mudaEstado("carregando", "carregando módulos…");
      try {
        for (const f of ["firebase-app-compat", "firebase-auth-compat", "firebase-firestore-compat"]) {
          await new Promise((res, rej) => {
            if (document.querySelector(`script[data-fb="${f}"]`)) return res();
            const s = document.createElement("script");
            s.src = `vendor/${f}.js`; s.dataset.fb = f;
            s.onload = res; s.onerror = () => rej(new Error("falha ao carregar " + f));
            document.head.appendChild(s);
          });
        }
        if (!firebase.apps.length) firebase.initializeApp(FBCFG);
        this.db = firebase.firestore();
        firebase.auth().onAuthStateChanged(u => this.aoMudarUsuario(u));
        return true;
      } catch (e) {
        if (this.meta.ligado) this.mudaEstado("erro", "sem módulos do Firebase (offline?): " + e.message);
        return false;
      }
    },

    async aoMudarUsuario(u) {
      this.user = u;
      if (!u) { if (this.meta.ligado) this.mudaEstado("deslogado", ""); else if (this.estado === "carregando") this.mudaEstado("desligado", ""); this.pararTimers(); this.render(); return }
      this.meta.ligado = true; this.salvaMeta();
      this.sombra = await this.carregaSombra();
      await this.ciclo("login");
      this.armaTimers();
      this.render();
    },

    async entrar(email, senha) {
      if (!(await this.ligarSDK())) return;
      this.mudaEstado("carregando", "entrando…");
      try { await firebase.auth().signInWithEmailAndPassword(email, senha) }
      catch (e) {
        const m = { "auth/invalid-credential": "e-mail ou senha incorretos", "auth/invalid-email": "e-mail inválido",
          "auth/user-not-found": "conta não encontrada", "auth/wrong-password": "senha incorreta",
          "auth/too-many-requests": "muitas tentativas — aguarde alguns minutos",
          "auth/network-request-failed": "sem conexão" }[e.code] || e.message;
        this.mudaEstado("deslogado", m);
      }
      this.render();
    },
    async sair() { this.pararTimers(); try { await firebase.auth().signOut() } catch (e) { } this.mudaEstado("deslogado", "sessão encerrada"); this.render() },
    desligar() { this.meta.ligado = false; this.salvaMeta(); this.pararTimers(); this.mudaEstado("desligado", ""); this.render() },

    /* ---------- ciclo puxar/empurrar ---------- */
    colRef(col) { return this.db.collection("users").doc(this.user.uid).collection("apps").doc(APPID).collection(col) },

    async ciclo(motivo) {
      if (!this.user || !this.db) return;
      this.mudaEstado("sincronizando", motivo);
      try {
        const recebidos = await this.puxar();
        const enviados = await this.empurrar();
        this.meta.ultima = Date.now(); this.salvaMeta();
        await this.salvaSombra();
        this.mudaEstado("ok", `agora há pouco — ↓${recebidos} ↑${enviados}`);
      } catch (e) {
        const perm = e.code === "permission-denied";
        this.mudaEstado("erro", perm ? "permissão negada nas regras — me avise" : (e.message || String(e)).slice(0, 120));
      }
      this.render();
    },

    async puxar() {
      let n = 0; const ST = this.st(), ARM = this.arm();
      for (const col of Object.keys(C.COLS)) {
        const desde = (this.meta.lastPull[col] || 0) - 90000; // folga p/ relógio
        let q = this.colRef(col);
        if (desde > 0) q = q.where("_ts", ">", desde);
        const snap = await q.get();
        if (snap.empty) continue;
        let mudou = false, maxTs = this.meta.lastPull[col] || 0;
        this._aplicando = true;
        try {
          const estado = this.mapaEstado();
          snap.forEach(d => {
            const dado = d.data(); maxTs = Math.max(maxTs, dado._ts || 0);
            if (C.aplica(col, d.id, dado, estado, this.meta.itens)) { mudou = true; n++ }
            // anti-eco: se o local ficou idêntico ao remoto, marca a sombra —
            // itens só merged (união/max com lado local) ficam de fora e serão enviados
            const locAgora = C.itens(col, estado)[d.id];
            if (locAgora && JSON.stringify(locAgora.v) === JSON.stringify(C.desempacota(col, dado)))
              (this.sombra[col] = this.sombra[col] || {})[d.id] = JSON.parse(JSON.stringify(locAgora));
            else if (!locAgora && dado.del && this.sombra[col]) delete this.sombra[col][d.id];
          });
          if (mudou) ARM.save(C.COLS[col].ls, ST[this.stKey(col)]);
        } finally { this._aplicando = false }
        this.meta.lastPull[col] = maxTs;
      }
      if (n) { this.salvaMeta(); this.reRender() }
      return n;
    },

    async empurrar() {
      let ops = 0, lote = this.db.batch(), noLote = 0;
      const agora = Date.now();
      const flush = async () => { if (noLote) { await lote.commit(); lote = this.db.batch(); noLote = 0 } };
      for (const col of Object.keys(C.COLS)) {
        const { envia, remove } = C.diff(col, this.mapaEstado(), this.sombra);
        for (const { id, dado } of envia) {
          lote.set(this.colRef(col).doc(id), C.empacota(col, dado, agora));
          (this.meta.itens[col] = this.meta.itens[col] || {})[id] = agora;
          ops++; if (++noLote >= 400) await flush();
        }
        for (const id of remove) {
          lote.set(this.colRef(col).doc(id), { del: 1, _ts: agora });
          (this.meta.itens[col] = this.meta.itens[col] || {})[id] = agora;
          ops++; if (++noLote >= 400) await flush();
        }
      }
      await flush();
      if (ops) { this.atualizaSombraLocal(); this.salvaMeta() }
      return ops;
    },

    // sombra = última foto sincronizada do estado (por item), guardada no IndexedDB
    mapaEstado() { const ST = this.st(); return { tt_resp: ST.resp, tt_flash: ST.flash, tt_fav: ST.fav, tt_riscos: ST.riscos, tt_erros: ST.erros, tt_plano: ST.plano, tt_sim: ST.sim, tt_treino: ST.treino, tt_atividade: ST.atividade, tt_meta: ST.meta, tt_cfg: ST.cfg, tt_lidas: ST.lidas } },
    stKey(col) { return { resp: "resp", flash: "flash", fav: "fav", riscos: "riscos", erros: "erros", plano: "plano", sim: "sim", treino: "treino", atividade: "atividade", meta: "meta", cfg: "cfg", lidas: "lidas" }[col] },
    atualizaSombraLocal() { // CÓPIA PROFUNDA: sombra viva junto com o estado mataria o diff
      const e = this.mapaEstado();
      for (const col of Object.keys(C.COLS)) this.sombra[col] = JSON.parse(JSON.stringify(C.itens(col, e)));
    },
    carregaSombra() { return new Promise(res => { const db = this.arm().db; if (!db) return res({});
      try { const rq = db.transaction("espelho", "readonly").objectStore("espelho").get("tt_shadow");
        rq.onsuccess = () => { try { res(rq.result ? JSON.parse(rq.result) : {}) } catch (e) { res({}) } }; rq.onerror = () => res({});
      } catch (e) { res({}) } }) },
    salvaSombra() { this.atualizaSombraLocal(); this.arm().idbPut("tt_shadow", JSON.stringify(this.sombra)); },
    salvaMeta() { this._aplicando = true; try { this.arm().save("tt_syncmeta", this.meta) } finally { this._aplicando = false } },

    // chamado pelo ARM.save a cada gravação local
    aoSalvar(k) {
      if (this._aplicando || k === "tt_syncmeta" || k === "tt_pos" || k === "tt_simativo") return;
      if (!this.user || !this.db) return;
      clearTimeout(this._debounce);
      this._debounce = setTimeout(() => this.ciclo("mudança local"), 2500);
    },

    armaTimers() {
      this.pararTimers();
      this._t = setInterval(() => this.ciclo("periódico"), 5 * 60 * 1000);
      this._aoFocar = () => { if (document.visibilityState === "visible") this.ciclo("voltou ao app") };
      this._aoOnline = () => this.ciclo("rede voltou");
      document.addEventListener("visibilitychange", this._aoFocar);
      window.addEventListener("online", this._aoOnline);
    },
    pararTimers() { clearInterval(this._t); clearTimeout(this._debounce);
      if (this._aoFocar) document.removeEventListener("visibilitychange", this._aoFocar);
      if (this._aoOnline) window.removeEventListener("online", this._aoOnline); },

    mudaEstado(e, det) { this.estado = e; this.detalhe = det || ""; },
    reRender() { // dados chegaram de fora: redesenha a aba atual
      try { const aba = location.hash.slice(1) || "questoes"; window.__tt.irAba(aba, true) } catch (e) { }
    },

    /* ---------- cartão nos Ajustes ---------- */
    render() {
      const el = this._el; if (!el) return;
      const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
      const ultima = this.meta && this.meta.ultima ? new Date(this.meta.ultima).toLocaleString("pt-BR").slice(0, 17) : "nunca";
      let corpo = "";
      if (this.user) {
        corpo = `<table>
          <tr><td>Conta</td><td>${esc(this.user.email)}</td></tr>
          <tr><td>Estado</td><td>${this.estado === "ok" ? '<span class="verde">sincronizado</span>' : this.estado === "erro" ? '<span class="vermelho">erro: ' + esc(this.detalhe) + "</span>" : esc(this.estado) + " " + esc(this.detalhe)}</td></tr>
          <tr><td>Última sincronização</td><td>${esc(ultima)}${this.estado === "ok" && this.detalhe ? ' <span class="mut peq">(' + esc(this.detalhe) + ")</span>" : ""}</td></tr>
        </table>
        <div class="linha" style="margin-top:10px">
          <button class="btn" id="syAgora">Sincronizar agora</button>
          <button class="btn fant" id="sySair">Sair da conta</button>
        </div>`;
      } else if (this.estado === "desligado") {
        corpo = `<p class="peq mut" style="margin-bottom:10px">Guarde o progresso na sua conta MedTech: ele passa a sobreviver a troca de aparelho, limpeza do navegador e mudança de endereço do site. Junção item a item — nada é sobrescrito em bloco. Sem login, tudo segue funcionando só neste aparelho.</p>
        <button class="btn" id="syAtivar">Ativar sincronização</button>`;
      } else {
        corpo = `<p class="peq mut" style="margin-bottom:8px">Entre com a sua conta MedTech (a mesma do portal). A senha vai direto ao Firebase — não passa por mais ninguém.</p>
        <div class="linha">
          <input id="syEmail" type="email" placeholder="e-mail" autocomplete="username" style="min-width:200px">
          <input id="sySenha" type="password" placeholder="senha" autocomplete="current-password">
          <button class="btn" id="syEntrar">Entrar</button>
          <button class="btn fant" id="syDesligar">Deixar desligado</button>
        </div>
        ${this.detalhe ? `<p class="peq vermelho" style="margin-top:8px">${esc(this.detalhe)}</p>` : ""}
        ${this.estado === "carregando" ? `<p class="peq mut" style="margin-top:8px">carregando…</p>` : ""}`;
      }
      el.innerHTML = `<div class="cartao"><h2>Progresso na nuvem</h2>${corpo}</div>`;
      const liga = (id, fn) => { const b = el.querySelector(id); if (b) b.onclick = fn };
      liga("#syAtivar", async () => { this.mudaEstado("deslogado", ""); await this.ligarSDK(); this.render() });
      liga("#syEntrar", () => this.entrar(el.querySelector("#syEmail").value.trim(), el.querySelector("#sySenha").value));
      liga("#sySair", () => this.sair());
      liga("#syDesligar", () => this.desligar());
      liga("#syAgora", () => this.ciclo("manual"));
      const senha = el.querySelector("#sySenha");
      if (senha) senha.onkeydown = e => { if (e.key === "Enter") el.querySelector("#syEntrar").click() };
    },
    renderCartao(el) { this._el = el; this.render(); }
  };

  window.TTSYNC = TTSYNC;
  if (window.__ttPronto) TTSYNC.init();
  else window.addEventListener("tt-pronto", () => TTSYNC.init(), { once: true });
})();
