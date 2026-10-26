/* ============================================================
   BARRACA CUMBUCO BEACH — banco compartilhado (Supabase)
   ------------------------------------------------------------
   O WhatsApp é o caminho principal e nunca depende daqui.
   O banco serve para a equipe ver tudo junto no painel.
   Se o Supabase estiver em pausa ou fora do ar, o site segue
   funcionando com os dados guardados no aparelho, e o painel
   guarda as alterações numa fila que sobe quando o banco volta.
   ============================================================ */
(function (g) {
  'use strict';
  var CFG = g.CB_CONFIG || {}, CB = g.CB;
  var BASE = String(CFG.supabaseUrl || '').replace(/\/+$/, '');
  var CHAVE = String(CFG.supabaseChave || '');
  var ativo = !!(BASE && CHAVE && /^https:\/\//.test(BASE));
  var SESSAO = 'cumbuco_nuvem_sessao';
  var FILA = 'cumbuco_nuvem_fila';
  var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  var estado = { ativo: ativo, online: null, ultimaSync: null, erro: '' };
  function emitir() { try { g.dispatchEvent(new CustomEvent('cb:nuvem', { detail: estado })); } catch (e) {} }
  function marcar(online, erro) { estado.online = online; estado.erro = erro || ''; if (online) estado.ultimaSync = new Date(); emitir(); }

  /* ---------- sessão da equipe (Supabase Auth) ---------- */
  function lerSessao() { try { return JSON.parse(g.sessionStorage.getItem(SESSAO) || 'null'); } catch (e) { return null; } }
  function gravarSessao(s) { try { if (s) g.sessionStorage.setItem(SESSAO, JSON.stringify(s)); else g.sessionStorage.removeItem(SESSAO); } catch (e) {} }
  function guardarToken(j) {
    var s = { access: j.access_token, refresh: j.refresh_token, expira: Date.now() + ((+j.expires_in || 3600) - 60) * 1000, email: (j.user && j.user.email) || (lerSessao() || {}).email || '' };
    gravarSessao(s); return s;
  }

  /* ---------- requisição com tempo-limite ---------- */
  function erroFora(msg) { var e = new Error(msg || 'O banco não respondeu.'); e.fora = true; return e; }
  function req(caminho, op) {
    op = op || {};
    if (!ativo) return Promise.reject(erroFora('Banco não configurado.'));
    var ctrl = g.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, op.tempo || 7000);
    var h = { apikey: CHAVE, 'Content-Type': 'application/json' };
    var token = op.token === false ? null : (op.token || null);
    h.Authorization = 'Bearer ' + (token || CHAVE);
    if (op.prefer) h.Prefer = op.prefer;
    return fetch(BASE + caminho, { method: op.metodo || 'GET', headers: h, body: op.corpo ? JSON.stringify(op.corpo) : undefined, signal: ctrl ? ctrl.signal : undefined, keepalive: !!op.keepalive })
      .catch(function () { throw erroFora(); })
      .then(function (r) {
        clearTimeout(t);
        return r.text().then(function (txt) {
          var j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) {}
          if (r.ok) return j;
          var e = new Error((j && (j.message || j.msg || j.error_description || j.error)) || ('Erro ' + r.status));
          e.status = r.status; e.fora = r.status >= 500 || r.status === 0; e.corpo = j;
          throw e;
        });
      });
  }

  function tokenValido() {
    var s = lerSessao(); if (!s) return Promise.reject(new Error('Sem sessão.'));
    if (Date.now() < s.expira) return Promise.resolve(s.access);
    return req('/auth/v1/token?grant_type=refresh_token', { metodo: 'POST', corpo: { refresh_token: s.refresh }, token: false })
      .then(function (j) { return guardarToken(j).access; });
  }
  function reqAuth(caminho, op) {
    return tokenValido().then(function (tk) { return req(caminho, Object.assign({}, op, { token: tk })); });
  }

  /* ---------- conversões banco ⇄ site ---------- */
  var hhmm = function (h) { return String(h || '').slice(0, 5); };
  function statusDoBanco(s) { var u = String(s || '').toUpperCase(); return CB.STATUS_LIST.filter(function (x) { return x.toUpperCase() === u; })[0] || CB.STATUS.PENDENTE; }
  function statusParaBanco(s) { return String(s || CB.STATUS.PENDENTE).toUpperCase(); }
  function categoria(nome, cat) {
    if (cat) return cat;
    var p = CB.padraoPorNome(nome); if (p) return p.cat;
    var n = CB.slug(nome);
    return /^tenda/.test(n) ? 'tendas' : /^(mesa|praia)/.test(n) ? 'areia' : 'coberto';
  }
  function ambDoBanco(a) {
    var p = CB.padraoPorNome(a.nome) || {};
    var img = String(a.imagem || '').replace(/\.jpeg$/i, '.jpg');
    if (!img || /hero|placeholder/.test(img)) img = p.imagem || '';
    return { id: a.id, nome: a.nome, cat: categoria(a.nome, a.categoria), descricao: a.descricao || p.descricao || '', imagem: img, capacidade: +a.capacidade || p.capacidade || 0, ativo: a.ativo !== false, ordem: +a.ordem || 99 };
  }
  function ambParaBanco(a) { return { id: a.id, nome: a.nome, descricao: a.descricao || '', imagem: a.imagem || '', capacidade: +a.capacidade || 0, ativo: a.ativo !== false, ordem: +a.ordem || 1, categoria: a.cat || '' }; }
  function bloqDoBanco(b) { return { id: b.id, data: b.data, ambienteId: b.ambiente_id || '', horaInicio: hhmm(b.hora_inicio), horaFim: hhmm(b.hora_fim), motivo: b.motivo || '' }; }
  function bloqParaBanco(b) { return { id: b.id, data: b.data, ambiente_id: UUID.test(b.ambienteId || '') ? b.ambienteId : null, hora_inicio: b.horaInicio || null, hora_fim: b.horaFim || null, motivo: b.motivo || 'Período bloqueado' }; }
  function resDoBanco(r) {
    return {
      id: r.id, codigo: r.codigo, nome: r.nome, telefone: r.telefone, email: r.email || '',
      pessoas: +r.pessoas || 1, ambienteId: r.ambiente_id || '', ambienteNome: r.ambiente_nome || '',
      data: r.data, hora: hhmm(r.hora), observacoes: r.observacoes || '', status: statusDoBanco(r.status),
      origem: r.origem || 'site', criadoEm: r.created_at, atualizadoEm: r.updated_at, historico: Array.isArray(r.historico) ? r.historico : []
    };
  }
  function resParaBanco(r) {
    return {
      codigo: r.codigo, nome: r.nome, telefone: r.telefone, email: r.email || '', data: r.data, hora: r.hora,
      pessoas: +r.pessoas || 1, ambiente_id: UUID.test(r.ambienteId || '') ? r.ambienteId : null,
      ambiente_nome: r.ambienteNome || CB.nomeAmbiente(r.ambienteId, r), observacoes: r.observacoes || '',
      status: statusParaBanco(r.status), origem: r.origem || 'painel', historico: r.historico || [], updated_at: new Date().toISOString()
    };
  }
  function cfgDoBanco(d) {
    if (!d) return null;
    var ok = {}; ['horaInicio', 'horaFim', 'intervalo', 'maxPessoas', 'antecedenciaDias', 'msgConfirmacao', 'msgCancelamento', 'politica'].forEach(function (k) { if (d[k] !== undefined && d[k] !== '') ok[k] = d[k]; });
    return ok;
  }

  /* ---------- SITE PÚBLICO ---------- */
  /* Atualiza locais, bloqueios e horários a partir do banco.
     Sempre resolve: se o banco não responder, fica o que está guardado. */
  function carregarPublico() {
    if (!ativo) return Promise.resolve(false);
    return Promise.all([
      req('/rest/v1/ambientes?select=*&order=ordem.asc', { tempo: 3500 }),
      req('/rest/v1/bloqueios?select=*&data=gte.' + CB.hoje(), { tempo: 3500 }),
      req('/rest/v1/configuracoes?select=dados&id=eq.1', { tempo: 3500 })
    ]).then(function (res) {
      CB.aplicarNuvem({
        ambientes: (res[0] || []).map(ambDoBanco),
        bloqueios: (res[1] || []).map(bloqDoBanco),
        config: cfgDoBanco(res[2] && res[2][0] && res[2][0].dados)
      });
      marcar(true); return true;
    }).catch(function (e) { marcar(false, e.message); return false; });
  }

  /* Envia a reserva do cliente para o banco, em segundo plano.
     Chamado DEPOIS de abrir o WhatsApp — nunca atrasa o cliente. */
  function enviarReserva(r) {
    if (!ativo) return Promise.resolve(false);
    return req('/rest/v1/rpc/registrar_reserva', {
      metodo: 'POST', keepalive: true, tempo: 10000,
      corpo: {
        p_codigo: r.codigo, p_nome: r.nome, p_telefone: r.telefone, p_email: r.email, p_data: r.data, p_hora: r.hora,
        p_pessoas: +r.pessoas, p_ambiente: r.ambienteId || '', p_ambiente_nome: r.ambienteNome || CB.nomeAmbiente(r.ambienteId, r), p_observacoes: r.observacoes || ''
      }
    }).then(function () { return true; }).catch(function () { return false; });
  }

  /* ---------- PAINEL ---------- */
  function entrar(email, senha) {
    if (!ativo) return Promise.resolve({ ok: false, fora: true });
    return req('/auth/v1/token?grant_type=password', { metodo: 'POST', corpo: { email: String(email || '').trim(), password: senha }, token: false, tempo: 8000 })
      .then(function (j) { guardarToken(j); return { ok: true }; })
      .catch(function (e) { return e.fora ? { ok: false, fora: true } : { ok: false, credenciais: true, msg: e.message }; });
  }
  function sair() {
    var s = lerSessao(); gravarSessao(null);
    if (s && ativo) req('/auth/v1/logout', { metodo: 'POST', token: s.access, tempo: 3000 }).catch(function () {});
  }
  function conectado() { return !!lerSessao(); }

  /* fila de alterações feitas com o banco fora do ar */
  function lerFila() { try { return JSON.parse(g.localStorage.getItem(FILA) || '[]'); } catch (e) { return []; } }
  function gravarFila(f) { try { g.localStorage.setItem(FILA, JSON.stringify(f)); } catch (e) {} emitir(); }
  function enfileirar(item) {
    var f = lerFila().filter(function (x) { return !(x.t === item.t && x.k === item.k); });
    f.push(item); gravarFila(f);
  }

  /* executa uma alteração no banco */
  function executar(item) {
    var cod = encodeURIComponent(item.k);
    switch (item.t) {
      case 'reserva': return reqAuth('/rest/v1/reservas?on_conflict=codigo', { metodo: 'POST', corpo: item.d, prefer: 'resolution=merge-duplicates,return=minimal' });
      case 'excluir-reserva': return reqAuth('/rest/v1/reservas?codigo=eq.' + cod, { metodo: 'DELETE' });
      case 'ambiente': return reqAuth('/rest/v1/ambientes?on_conflict=id', { metodo: 'POST', corpo: item.d, prefer: 'resolution=merge-duplicates,return=minimal' });
      case 'excluir-ambiente': return reqAuth('/rest/v1/ambientes?id=eq.' + cod, { metodo: 'DELETE' });
      case 'bloqueio': return reqAuth('/rest/v1/bloqueios?on_conflict=id', { metodo: 'POST', corpo: item.d, prefer: 'resolution=merge-duplicates,return=minimal' });
      case 'excluir-bloqueio': return reqAuth('/rest/v1/bloqueios?id=eq.' + cod, { metodo: 'DELETE' });
      case 'config':
        return reqAuth('/rest/v1/configuracoes?select=dados&id=eq.1').then(function (l) {
          var atual = (l && l[0] && l[0].dados) || {};
          return reqAuth('/rest/v1/configuracoes?on_conflict=id', { metodo: 'POST', corpo: { id: 1, dados: Object.assign({}, atual, item.d) }, prefer: 'resolution=merge-duplicates,return=minimal' });
        });
    }
    return Promise.resolve();
  }

  /* gancho chamado pelo CB a cada alteração feita no painel */
  function aoAlterar(acao, d) {
    var item;
    if (acao === 'reserva') item = { t: 'reserva', k: d.codigo, d: resParaBanco(d) };
    else if (acao === 'excluir-reserva') item = { t: 'excluir-reserva', k: d.codigo };
    else if (acao === 'ambiente') { if (!d || !UUID.test(d.id)) return; item = { t: 'ambiente', k: d.id, d: ambParaBanco(d) }; }
    else if (acao === 'excluir-ambiente') { if (!UUID.test(d.id)) return; item = { t: 'excluir-ambiente', k: d.id }; }
    else if (acao === 'bloqueio') item = { t: 'bloqueio', k: d.id, d: bloqParaBanco(d) };
    else if (acao === 'excluir-bloqueio') item = { t: 'excluir-bloqueio', k: d.id };
    else if (acao === 'config') { var c = CB.getConfig(); item = { t: 'config', k: '1', d: cfgDoBanco(c) }; }
    if (!item) return;
    enfileirar(item);
    esvaziarFila();
  }

  var esvaziando = null;
  function esvaziarFila() {
    if (esvaziando) return esvaziando;
    if (!conectado()) return Promise.resolve(false);
    esvaziando = (function proximo() {
      var f = lerFila(); if (!f.length) return Promise.resolve(true);
      var item = f[0];
      return executar(item).then(function () {
        gravarFila(lerFila().filter(function (x) { return !(x.t === item.t && x.k === item.k); }));
        marcar(true);
        return proximo();
      }, function (e) {
        if (e.fora) { marcar(false, e.message); return false; }
        if (e.status === 401 || e.status === 403) { marcar(false, 'Sessão expirada. Entre de novo.'); return false; }
        /* recusado pelo banco (dado inválido): descarta para não travar a fila */
        gravarFila(lerFila().filter(function (x) { return !(x.t === item.t && x.k === item.k); }));
        estado.erro = 'O banco recusou uma alteração: ' + e.message; emitir();
        return proximo();
      });
    })().then(function (r) { esvaziando = null; return r; }, function () { esvaziando = null; return false; });
    return esvaziando;
  }

  /* traz tudo do banco para o painel */
  function sincronizar() {
    if (!ativo || !conectado()) return Promise.resolve(false);
    return esvaziarFila().then(function () {
      var de = CB.somaDias(CB.hoje(), -400);
      return Promise.all([
        reqAuth('/rest/v1/reservas?select=*&data=gte.' + de + '&order=data.desc,hora.desc&limit=5000'),
        reqAuth('/rest/v1/ambientes?select=*&order=ordem.asc'),
        reqAuth('/rest/v1/bloqueios?select=*&order=data.asc'),
        reqAuth('/rest/v1/configuracoes?select=dados&id=eq.1')
      ]);
    }).then(function (res) {
      /* o que ainda está na fila continua valendo a versão deste aparelho */
      var pend = {}; lerFila().forEach(function (x) { if (x.t === 'reserva') pend[x.k] = 1; });
      var locais = CB.getReservas().filter(function (r) { return pend[r.codigo]; });
      var exclu = {}; lerFila().forEach(function (x) { if (x.t === 'excluir-reserva') exclu[x.k] = 1; });
      var vindas = (res[0] || []).map(resDoBanco).filter(function (r) { return !pend[r.codigo] && !exclu[r.codigo]; });
      CB.aplicarNuvem({
        reservas: vindas.concat(locais),
        ambientes: (res[1] || []).map(ambDoBanco),
        bloqueios: (res[2] || []).map(bloqDoBanco),
        config: cfgDoBanco(res[3] && res[3][0] && res[3][0].dados)
      });
      marcar(true); return true;
    }).catch(function (e) {
      if (e.status === 401 || e.status === 403 || /sess/i.test(e.message)) marcar(false, 'Sessão expirada. Entre de novo.');
      else marcar(false, e.message);
      return false;
    });
  }

  /* com o banco fora, testa de tempos em tempos se ele voltou */
  function testar() { return req('/rest/v1/ambientes?select=id&limit=1', { tempo: 5000 }).then(function () { marcar(true); return true; }, function (e) { marcar(false, e.message); return false; }); }

  function iniciarPainel(aoMudar) {
    if (!ativo) return;
    CB.definirGancho(aoAlterar);  /* sem sessão, as alterações esperam na fila */
    var tick = function () { (conectado() ? sincronizar() : testar()).then(function () { if (aoMudar) aoMudar(); }); };
    tick();
    setInterval(function () { if (!document.hidden) tick(); }, 20000);
    g.addEventListener('focus', tick);
    g.addEventListener('online', tick);
  }

  /* ---------- fotos dos ambientes (Supabase Storage, pasta "ambientes") ---------- */
  /* reduz a foto no próprio aparelho (máx. 1400 px, JPG) antes de enviar */
  function reduzir(arquivo) {
    return new Promise(function (ok, falha) {
      var img = new Image(), url = URL.createObjectURL(arquivo);
      img.onload = function () {
        var max = 1400, w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, max / Math.max(w, h));
        var cv = document.createElement('canvas'); cv.width = Math.round(w * k); cv.height = Math.round(h * k);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        cv.toBlob(function (b) { b ? ok(b) : falha(new Error('Não foi possível ler a foto.')); }, 'image/jpeg', .82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); falha(new Error('Esse arquivo não é uma foto (use JPG ou PNG).')); };
      img.src = url;
    });
  }
  function enviarFoto(arquivo) {
    if (!ativo || !conectado()) return Promise.reject(new Error('Para enviar fotos, entre no painel com o seu e-mail e com o banco conectado.'));
    var nome = 'amb-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + '.jpg';
    return Promise.all([reduzir(arquivo), tokenValido()]).then(function (r) {
      return fetch(BASE + '/storage/v1/object/ambientes/' + nome, {
        method: 'POST', body: r[0],
        headers: { apikey: CHAVE, Authorization: 'Bearer ' + r[1], 'Content-Type': 'image/jpeg', 'x-upsert': 'true', 'cache-control': '31536000' }
      }).catch(function () { throw erroFora(); });
    }).then(function (resp) {
      if (!resp.ok) return resp.text().then(function (t) { throw new Error(resp.status === 404 || /bucket/i.test(t) ? 'A pasta de fotos ainda não existe no Supabase. Rode o arquivo sql/banco-supabase.sql.' : 'O banco recusou a foto (' + resp.status + ').'); });
      return BASE + '/storage/v1/object/public/ambientes/' + nome;
    });
  }

  g.CBNuvem = {
    enviarFoto: enviarFoto,
    ativo: ativo, estado: estado,
    carregarPublico: carregarPublico, enviarReserva: enviarReserva,
    entrar: entrar, sair: sair, conectado: conectado, email: function () { return (lerSessao() || {}).email || ''; },
    sincronizar: sincronizar, iniciarPainel: iniciarPainel, pendentes: function () { return lerFila().length; },
    /* site público: promessa que resolve quando os dados do banco chegam (ou desistem) */
    publico: ativo && !/admin/.test(location.pathname) ? carregarPublico() : Promise.resolve(false)
  };
})(window);
