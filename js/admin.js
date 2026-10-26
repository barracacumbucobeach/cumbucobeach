/* ============================================================
   BARRACA CUMBUCO BEACH — painel da equipe
   ============================================================ */
(function () {
  'use strict';
  if (!CB.logado()) return;
  var W = window.CBWhats, S = CB.STATUS;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; };
  var main = $('#conteudo');

  /* ---------- ícones ---------- */
  var sv = function (p, extra) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + p + '</svg>'; };
  var I = {
    painel: sv('<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 4v3h6V4z"/>'),
    reservas: sv('<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>'),
    calendario: sv('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
    ambientes: sv('<path d="M3 20h18M5 20V10l7-5 7 5v10M9 20v-5h6v5"/>'),
    clientes: sv('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.4 3-5.4 6-5.4s5.4 2 6 5.4M16 4.8a3.2 3.2 0 0 1 0 6.3M18.5 14.9c1.4.8 2.3 2.4 2.5 5.1"/>'),
    relatorios: sv('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    config: sv('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'),
    mais: sv('<path d="M12 5v14M5 12h14"/>', ' stroke-width="2.4"'),
    fechar: sv('<path d="M6 6l12 12M18 6L6 18"/>', ' stroke-width="2.4"'),
    colar: sv('<rect x="8" y="3" width="8" height="4" rx="1"/><path d="M16 5h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2"/>'),
    baixar: sv('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
    subir: sv('<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>'),
    sync: sv('<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>'),
    info: sv('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
    ok: sv('<path d="M5 12.5l4.5 4.5L19 7.5"/>', ' stroke-width="2.6"'),
    lixo: sv('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    editar: sv('<path d="M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4"/>'),
    cima: sv('<path d="M6 15l6-6 6 6"/>', ' stroke-width="2.4"'),
    baixo: sv('<path d="M6 9l6 6 6-6"/>', ' stroke-width="2.4"'),
    esq: sv('<path d="M15 6l-6 6 6 6"/>', ' stroke-width="2.4"'),
    dir: sv('<path d="M9 6l6 6-6 6"/>', ' stroke-width="2.4"'),
    imprimir: sv('<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>'),
    zap: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.6 2 2.17 6.43 2.17 11.87c0 1.74.46 3.44 1.32 4.94L2.1 22l5.32-1.4a9.86 9.86 0 0 0 4.62 1.18h.01c5.44 0 9.87-4.43 9.87-9.87a9.8 9.8 0 0 0-2.87-7Zm-7.01 15.2h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.16.83.84-3.08-.2-.32a8.18 8.18 0 0 1-1.26-4.36c0-4.52 3.68-8.2 8.21-8.2a8.2 8.2 0 0 1 8.2 8.21c0 4.53-3.68 8.25-8.14 8.25Zm4.5-6.15c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.55.12-.17.25-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.04-.39-1.99-1.23-.73-.66-1.23-1.47-1.37-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42h-.47a.9.9 0 0 0-.66.31c-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z"/></svg>'
  };

  /* ---------- utilidades de interface ---------- */
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'toast'; t.innerHTML = I.ok + '<span>' + esc(msg) + '</span>';
    $('#toasts').appendChild(t);
    setTimeout(function () { t.classList.add('sai'); setTimeout(function () { t.remove(); }, 400); }, 2800);
  }
  function stPill(st) { return '<span class="st st--' + (CB.STATUS_TOM[st] || 'fim') + '">' + esc(st) + '</span>'; }
  function plural(n, s, p) { return n + ' ' + (n === 1 ? s : p); }
  function nomeAmb(r) { return CB.nomeAmbiente(r.ambienteId, r); }
  function opcoesAmb(sel, vazio) {
    return (vazio ? '<option value="">' + vazio + '</option>' : '') + CB.getAmbientes().map(function (a) {
      return '<option value="' + esc(a.id) + '"' + (a.id === sel ? ' selected' : '') + '>' + esc(a.nome) + (a.ativo ? '' : ' (inativo)') + '</option>';
    }).join('');
  }
  function opcoesStatus(sel, vazio) {
    return (vazio ? '<option value="">' + vazio + '</option>' : '') + CB.STATUS_LIST.map(function (s) { return '<option' + (s === sel ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join('');
  }

  var ultimoFoco = null;
  function abrirCamada(el, html) {
    ultimoFoco = document.activeElement;
    var caixa = el.querySelector('.gav__painel, .modal__caixa');
    caixa.innerHTML = html;
    el.classList.add('aberta'); el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { var f = caixa.querySelector('input:not([type=hidden]), textarea, select, button'); if (f) f.focus({ preventScroll: true }); }, 60);
    return caixa;
  }
  function fecharCamada(el) {
    if (!el.classList.contains('aberta')) return;
    el.classList.remove('aberta'); el.setAttribute('aria-hidden', 'true');
    if (!$('.gav.aberta') && !$('.modal.aberta')) document.body.style.overflow = '';
    if (ultimoFoco && ultimoFoco.focus) try { ultimoFoco.focus({ preventScroll: true }); } catch (e) {}
  }
  var gav = $('#gav'), modal = $('#modal');
  [gav, modal].forEach(function (el) { el.addEventListener('click', function (e) { if (e.target.closest('[data-fechar]')) fecharCamada(el); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (modal.classList.contains('aberta')) fecharCamada(modal);
    else if (gav.classList.contains('aberta')) fecharCamada(gav);
    else document.body.classList.remove('menu-aberto');
  });

  function confirmar(titulo, texto, rotulo, acao, perigo) {
    var c = abrirCamada(modal,
      '<div class="modal__cab"><h2 id="modal-titulo">' + esc(titulo) + '</h2><button class="bt bt--icone bt--peq" data-fechar aria-label="Fechar">' + I.fechar + '</button></div>' +
      '<p class="muted">' + esc(texto) + '</p>' +
      '<div class="modal__rodape"><button class="bt" data-fechar>Voltar</button><button class="bt ' + (perigo ? 'bt--perigo' : 'bt--pri') + '" id="conf-ok">' + esc(rotulo) + '</button></div>');
    c.querySelector('#conf-ok').addEventListener('click', function () { fecharCamada(modal); acao(); });
  }

  /* ---------- navegação ---------- */
  var VISTAS = [
    ['painel', 'Painel', I.painel], ['reservas', 'Reservas', I.reservas], ['calendario', 'Calendário', I.calendario],
    ['ambientes', 'Ambientes', I.ambientes], ['clientes', 'Clientes', I.clientes], ['relatorios', 'Relatórios', I.relatorios], ['config', 'Configurações', I.config]
  ];
  function menu() {
    var at = vistaAtual(), pend = CB.resumo().pendentes;
    $('#menu').innerHTML = VISTAS.map(function (v) {
      return '<a href="#' + v[0] + '"' + (v[0] === at ? ' aria-current="page"' : '') + '>' + v[2] + v[1] + (v[0] === 'reservas' && pend ? '<span class="badge" aria-label="' + pend + ' aguardando">' + pend + '</span>' : '') + '</a>';
    }).join('');
  }
  function vistaAtual() { var h = location.hash.replace('#', '').split('?')[0]; return VISTAS.some(function (v) { return v[0] === h; }) ? h : 'painel'; }
  function render(animar) {
    var v = vistaAtual(); menu();
    var fn = { painel: vPainel, reservas: vReservas, calendario: vCalendario, ambientes: vAmbientes, clientes: vClientes, relatorios: vRelatorios, config: vConfig }[v];
    var y = window.scrollY;
    main.innerHTML = '<div class="' + (animar ? 'vista' : '') + '">' + fn() + '</div>';
    if (fn.depois) fn.depois();
    if (!animar) window.scrollTo(0, y);
    document.title = VISTAS.filter(function (x) { return x[0] === v; })[0][1] + ' — Painel Cumbuco Beach';
  }
  window.addEventListener('hashchange', function () { document.body.classList.remove('menu-aberto'); render(true); window.scrollTo(0, 0); main.focus({ preventScroll: true }); });
  /* atualizações do banco não atrapalham quem está digitando */
  var renderPendente = false;
  function digitando() { var a = document.activeElement; return a && main.contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName); }
  function renderSeguro() { if (digitando()) { renderPendente = true; return; } render(false); }
  main.addEventListener('focusout', function () { setTimeout(function () { if (renderPendente && !digitando()) { renderPendente = false; render(false); } }, 50); });
  CB.aoMudar(renderSeguro);
  var modoAntes = null;
  window.addEventListener('cb:nuvem', function () {
    chipBanco();
    var agora = String(NV.estado.online) + '|' + NV.pendentes() + '|' + NV.conectado() + '|' + (NV.estado.erro && /recusou/.test(NV.estado.erro));
    if (agora !== modoAntes) { modoAntes = agora; setTimeout(renderSeguro, 0); }   /* troca de modo: redesenha botões e avisos */
  });

  $('#abrir-menu').addEventListener('click', function () { document.body.classList.add('menu-aberto'); });
  $('#veu').addEventListener('click', function () { document.body.classList.remove('menu-aberto'); });
  $('#sair').addEventListener('click', function () { if (NV.sair) NV.sair(); CB.sair(); location.replace('admin-login.html'); });
  document.addEventListener('click', function (e) { if (e.target.id === 'relogar') { e.preventDefault(); CB.sair(); location.replace('admin-login.html'); } });

  /* ações globais por data-acao */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-acao]'); if (!b) return;
    var a = b.getAttribute('data-acao'), id = b.getAttribute('data-id');
    if (a === 'nova') formReserva();
    else if (a === 'importar') importarZap();
    else if (a === 'sync') sincronizar(b);
    else if (a === 'ver') detalhe(id);
    else if (a === 'csv') CB.exportarCSV(filtrar());
  });

  /* ---------- modo do banco ---------- */
  var NV = window.CBNuvem || { ativo: false, estado: {}, conectado: function () { return false; }, pendentes: function () { return 0; } };
  function bancoOk() { return NV.ativo && NV.conectado() && NV.estado.online === true; }
  function btColar() { return bancoOk() ? '' : '<button class="bt" data-acao="importar">' + I.colar + 'Colar do WhatsApp</button>'; }
  function hora(d) { return d ? String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') : ''; }
  function chipBanco() {
    var el = $('#chip-banco'); if (!el) return;
    var cls, txt;
    if (!NV.ativo) { cls = 'local'; txt = 'Dados só neste aparelho'; }
    else if (!NV.conectado()) { cls = NV.estado.online ? 'aviso' : 'fora'; txt = NV.estado.online ? 'Banco voltou — entre com e-mail' : 'Modo WhatsApp (sem banco)'; }
    else if (NV.estado.online === null) { cls = 'aviso'; txt = 'Conectando ao banco…'; }
    else if (NV.estado.online) { cls = 'ok'; txt = 'Banco conectado · ' + hora(NV.estado.ultimaSync); }
    else { cls = 'fora'; txt = 'Banco fora do ar'; }
    el.className = 'chip-banco chip-banco--' + cls; el.innerHTML = '<i></i><span>' + esc(txt) + '</span>';
  }

  /* ---------- PAINEL ---------- */
  function avisoDados() {
    var html = '';
    if (NV.ativo && NV.estado.online === false && NV.conectado()) html += '<div class="aviso aviso--sol">' + I.info + '<div><b>O banco está fora do ar ou em pausa.</b> As reservas continuam chegando normalmente pelo WhatsApp. Enquanto isso, registre-as com <b>Colar do WhatsApp</b>: tudo fica guardado neste aparelho e sobe sozinho quando o banco voltar.</div></div>';
    if (NV.ativo && !NV.conectado()) html += '<div class="aviso aviso--sol">' + I.info + '<div><b>Você entrou no modo WhatsApp</b>, sem o banco. O que registrar aqui fica neste aparelho e sobe para o banco quando você entrar com o seu e-mail.' + (NV.estado.online ? ' <b>O banco já está de volta:</b> <a href="#" id="relogar" style="font-weight:700">entrar com e-mail</a>.' : '') + '</div></div>';
    if (NV.ativo && NV.pendentes()) html += '<div class="aviso">' + I.sync + '<div><b>' + plural(NV.pendentes(), 'alteração aguardando', 'alterações aguardando') + ' o banco.</b> Elas são enviadas automaticamente assim que ele responder.</div></div>';
    if (NV.estado.erro && /recusou/.test(NV.estado.erro)) html += '<div class="aviso aviso--sol">' + I.info + '<div>' + esc(NV.estado.erro) + '</div></div>';
    if (CB.senhaPadrao()) html += '<div class="aviso aviso--sol">' + I.info + '<div><b>' + (NV.ativo ? 'Troque a senha do modo WhatsApp.' : 'Troque a senha inicial do painel.') + '</b> Ela ainda é a senha padrão de instalação. <a href="#config" class="link" style="font-weight:700">Trocar agora</a></div></div>';
    return html;
  }
  function vPainel() {
    var r = CB.resumo(), hoje = CB.hoje();
    var prox = r.proximas.slice(0, 14);
    var grupos = {};
    prox.forEach(function (x) { (grupos[x.data] = grupos[x.data] || []).push(x); });
    var lista = Object.keys(grupos).map(function (d) {
      var ps = grupos[d].reduce(function (s, x) { return s + (+x.pessoas || 0); }, 0);
      return '<div class="dia-grupo"><h3>' + (d === hoje ? 'Hoje' : d === CB.somaDias(hoje, 1) ? 'Amanhã' : esc(CB.dataExtenso(d, true))) + ' <small>' + plural(grupos[d].length, 'reserva', 'reservas') + ' · ' + plural(ps, 'pessoa', 'pessoas') + '</small></h3>' +
        grupos[d].map(linhaRes).join('') + '</div>';
    }).join('');
    var sem = !CB.getReservas().length;
    return '<div class="cab"><div><h1>' + saudacao() + '</h1><p>' + esc(CB.dataExtenso(hoje)) + '</p></div><div class="cab__acoes">' +
      (bancoOk() ? '<button class="bt" data-acao="sync">' + I.sync + 'Atualizar</button>' : '') +
      btColar() + '<button class="bt bt--pri" data-acao="nova">' + I.mais + 'Nova reserva</button></div></div>' +
      avisoDados() +
      '<div class="kpis">' +
        '<div class="kpi kpi--sol"><b>' + r.hoje + '</b><span>' + (r.hoje === 1 ? 'reserva hoje' : 'reservas hoje') + '</span></div>' +
        '<div class="kpi"><b>' + r.pessoasHoje + '</b><span>pessoas esperadas hoje</span></div>' +
        '<div class="kpi"><b>' + r.pendentes + '</b><span>aguardando confirmação</span></div>' +
        '<div class="kpi"><b>' + r.confirmadas + '</b><span>confirmadas a partir de hoje</span></div>' +
      '</div>' +
      '<div class="grade-2"><div class="cartao"><div class="cartao__cab"><h2>Próximas reservas</h2><a class="bt bt--peq" href="#reservas">Ver todas</a></div>' +
        (lista || (sem ? '<div class="vazio"><b>Nenhuma reserva ainda.</b>' + (bancoOk() ? 'As reservas feitas pelo site aparecem aqui sozinhas.' : 'Quando chegar uma reserva no WhatsApp, use <b style="display:inline">Colar do WhatsApp</b> para registrá-la aqui.') + '</div>' : '<div class="vazio"><b>Nada marcado daqui para frente.</b>As próximas reservas aparecem aqui.</div>')) +
      '</div>' + cartaoComoChega() + '</div>';
  }
  function saudacao() { var h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }
  function cartaoComoChega() {
    var zap = esc(CB.CFG.whatsappTexto || '');
    if (bancoOk()) return '<div class="cartao"><h2>Como as reservas chegam</h2>' +
      '<p class="muted" style="margin-top:8px">O cliente preenche o site e envia a mensagem pronta para o WhatsApp ' + zap + '. Ao mesmo tempo, a reserva aparece aqui para toda a equipe, com status <b>Aguardando confirmação</b>.</p>' +
      '<ol style="margin:14px 0 0;padding-left:20px;display:grid;gap:8px"><li>Abra a reserva.</li><li>Toque em <b>Confirmar e avisar</b>: o WhatsApp do cliente abre com a confirmação pronta.</li><li>No dia, marque <b>Cliente chegou</b>.</li></ol>' +
      '<p class="muted" style="margin-top:14px">O painel se atualiza sozinho a cada 20 segundos.</p></div>';
    return '<div class="cartao"><h2>Como as reservas chegam</h2>' +
      '<p class="muted" style="margin-top:8px">O cliente preenche o site e envia tudo para o WhatsApp ' + zap + '. ' + (NV.ativo ? 'Sem o banco, a reserva não aparece aqui sozinha:' : 'Para registrar aqui:') + '</p>' +
      '<ol style="margin:14px 0 0;padding-left:20px;display:grid;gap:8px">' +
      '<li>Copie a mensagem da reserva no WhatsApp.</li><li>Toque em <b>Colar do WhatsApp</b> e cole o texto.</li><li>Confira e salve. Depois confirme com o cliente com um toque.</li></ol></div>';
  }
  function linhaRes(r) {
    return '<button type="button" class="res" data-acao="ver" data-id="' + esc(r.id) + '"><span class="res__hora">' + esc(r.hora) + '</span>' +
      '<span style="min-width:0"><span class="res__nome" style="display:block">' + esc(r.nome) + '</span><span class="res__info" style="display:block">' + plural(+r.pessoas, 'pessoa', 'pessoas') + ' · ' + esc(nomeAmb(r)) + '</span></span>' + stPill(r.status) + '</button>';
  }

  /* ---------- RESERVAS ---------- */
  var filtro = { busca: '', de: '', ate: '', status: '', ambienteId: '', periodo: 'proximas' };
  function filtrar() {
    var f = { busca: filtro.busca, status: filtro.status, ambienteId: filtro.ambienteId };
    var h = CB.hoje();
    if (filtro.periodo === 'proximas') f.de = h;
    else if (filtro.periodo === 'hoje') f.data = h;
    else if (filtro.periodo === 'passadas') f.ate = CB.somaDias(h, -1);
    else if (filtro.periodo === 'data' && filtro.de) f.data = filtro.de;
    var l = CB.getReservas(f);
    if (filtro.periodo === 'proximas' || filtro.periodo === 'hoje') l = l.reverse();
    return l;
  }
  function vReservas() {
    var l = filtrar();
    var per = [['proximas', 'De hoje em diante'], ['hoje', 'Só hoje'], ['passadas', 'Passadas'], ['todas', 'Todas'], ['data', 'Escolher data']];
    return '<div class="cab"><div><h1>Reservas</h1><p>' + plural(l.length, 'reserva encontrada', 'reservas encontradas') + '</p></div><div class="cab__acoes">' +
      '<button class="bt" data-acao="csv">' + I.baixar + 'Exportar planilha</button>' + btColar() + '<button class="bt bt--pri" data-acao="nova">' + I.mais + 'Nova reserva</button></div></div>' +
      '<div class="filtros" id="filtros">' +
        '<input class="inp" type="search" id="f-busca" placeholder="Buscar por nome, telefone, e-mail ou código" value="' + esc(filtro.busca) + '" aria-label="Buscar">' +
        '<select class="sel" id="f-periodo" aria-label="Período">' + per.map(function (p) { return '<option value="' + p[0] + '"' + (filtro.periodo === p[0] ? ' selected' : '') + '>' + p[1] + '</option>'; }).join('') + '</select>' +
        (filtro.periodo === 'data' ? '<input class="inp" type="date" id="f-data" value="' + esc(filtro.de) + '" aria-label="Data">' : '<select class="sel" id="f-status" aria-label="Status">' + opcoesStatus(filtro.status, 'Todos os status') + '</select>') +
        '<select class="sel" id="f-amb" aria-label="Local">' + opcoesAmb(filtro.ambienteId, 'Todos os locais') + '</select>' +
        '<button class="bt" id="f-limpar">Limpar</button>' +
      '</div>' +
      (l.length ? '<div class="tabela-wrap"><table><thead><tr><th>Data</th><th>Hora</th><th>Cliente</th><th>Pessoas</th><th>Local</th><th>Status</th><th>Código</th></tr></thead><tbody>' +
        l.map(function (r) {
          return '<tr data-acao="ver" data-id="' + esc(r.id) + '" tabindex="0"><td class="num">' + esc(CB.fmtData(r.data)) + '<span class="sub">' + esc(CB.dataExtenso(r.data, true).split(',')[0]) + '</span></td><td class="num"><b>' + esc(r.hora) + '</b></td>' +
            '<td><b>' + esc(r.nome) + '</b><span class="sub">' + esc(r.telefone) + '</span></td><td class="num">' + esc(r.pessoas) + '</td><td>' + esc(nomeAmb(r)) + '</td><td>' + stPill(r.status) + '</td><td class="num muted">' + esc(r.codigo) + '</td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="cartao vazio"><b>Nenhuma reserva com esses filtros.</b>Mude o período ou limpe a busca.</div>');
  }
  vReservas.depois = function () {
    var deb;
    $('#f-busca').addEventListener('input', function (e) { clearTimeout(deb); deb = setTimeout(function () { filtro.busca = e.target.value; render(false); var i = $('#f-busca'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 220); });
    $('#f-periodo').addEventListener('change', function (e) { filtro.periodo = e.target.value; if (filtro.periodo === 'data' && !filtro.de) filtro.de = CB.hoje(); render(false); });
    var st = $('#f-status'); if (st) st.addEventListener('change', function (e) { filtro.status = e.target.value; render(false); });
    var dt = $('#f-data'); if (dt) dt.addEventListener('change', function (e) { filtro.de = e.target.value; render(false); });
    $('#f-amb').addEventListener('change', function (e) { filtro.ambienteId = e.target.value; render(false); });
    $('#f-limpar').addEventListener('click', function () { filtro = { busca: '', de: '', ate: '', status: '', ambienteId: '', periodo: 'proximas' }; render(false); });
    $$('tbody tr').forEach(function (tr) { tr.addEventListener('keydown', function (e) { if (e.key === 'Enter') detalhe(tr.getAttribute('data-id')); }); });
  };

  /* ---------- detalhe (gaveta) ---------- */
  function detalhe(id) {
    var r = CB.getReserva(id); if (!r) return;
    var zapCliente = 'https://wa.me/' + W.numeroCliente(r.telefone);
    var acoes = [];
    if (r.status === S.PENDENTE) acoes.push('<button class="bt bt--zap" data-st="confirmar">' + I.zap + 'Confirmar e avisar</button>', '<button class="bt" data-st="' + S.CONFIRMADA + '">Só confirmar</button>');
    if (r.status === S.CONFIRMADA) acoes.push('<button class="bt bt--azul" data-st="' + S.CHEGOU + '">Cliente chegou</button>', '<button class="bt" data-st="' + S.NOSHOW + '">Não compareceu</button>');
    if (r.status === S.CHEGOU) acoes.push('<button class="bt bt--azul" data-st="' + S.CONCLUIDA + '">Concluir atendimento</button>');
    if (r.status !== S.CANCELADA && r.status !== S.CONCLUIDA) acoes.push('<button class="bt bt--perigo" data-st="cancelar">Cancelar e avisar</button>');
    var c = abrirCamada(gav,
      '<div class="gav__cab"><div><h2 id="gav-titulo">' + esc(r.nome) + '</h2><p class="muted" style="margin:4px 0 8px">' + esc(r.codigo) + '</p>' + stPill(r.status) + '</div>' +
        '<button class="bt bt--icone bt--peq fechar" data-fechar aria-label="Fechar">' + I.fechar + '</button></div>' +
      '<div class="gav__corpo">' +
        '<dl class="fichas">' +
          '<div><dt>Data</dt><dd>' + esc(CB.dataExtenso(r.data, true)) + '</dd></div><div><dt>Horário</dt><dd>' + esc(r.hora) + '</dd></div>' +
          '<div><dt>Pessoas</dt><dd>' + esc(r.pessoas) + '</dd></div><div><dt>Local</dt><dd>' + esc(nomeAmb(r)) + '</dd></div>' +
          '<div><dt>WhatsApp</dt><dd><a href="' + esc(zapCliente) + '" target="_blank" rel="noopener">' + esc(r.telefone) + '</a></dd></div>' +
          '<div><dt>E-mail</dt><dd>' + (r.email ? '<a href="mailto:' + esc(r.email) + '">' + esc(r.email) + '</a>' : '—') + '</dd></div>' +
          '<div class="cheio"><dt>Observações</dt><dd>' + esc(r.observacoes || '—') + '</dd></div>' +
        '</dl>' +
        (acoes.length ? '<div class="acoes-st">' + acoes.join('') + '</div>' : '<div style="height:18px"></div>') +
        '<label class="fld" style="max-width:260px"><span>Mudar status</span><select class="sel" id="g-status">' + opcoesStatus(r.status) + '</select></label>' +
        '<h3 style="margin-top:24px">Histórico</h3><ul class="hist">' + (r.historico || []).slice().reverse().map(function (h) { return '<li><div>' + esc(h.texto) + '<time>' + esc(CB.fmtCarimbo(h.em)) + '</time></div></li>'; }).join('') + '</ul>' +
      '</div>' +
      '<div class="gav__rodape"><button class="bt" id="g-editar">' + I.editar + 'Editar</button><a class="bt" href="' + esc(zapCliente) + '" target="_blank" rel="noopener">' + I.zap + 'Conversar</a><button class="bt bt--perigo" id="g-excluir" style="margin-left:auto">' + I.lixo + 'Excluir</button></div>');

    c.querySelector('#g-status').addEventListener('change', function (e) { CB.mudarStatus(r.id, e.target.value); toast('Status: ' + e.target.value); detalhe(r.id); });
    $$('[data-st]', c).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-st');
        if (v === 'confirmar') { var x = CB.mudarStatus(r.id, S.CONFIRMADA); W.abrir(W.linkCliente(x, 'confirmada')); toast('Reserva confirmada'); }
        else if (v === 'cancelar') { confirmar('Cancelar esta reserva?', 'O WhatsApp do cliente vai abrir com a mensagem de cancelamento.', 'Cancelar reserva', function () { var x = CB.mudarStatus(r.id, S.CANCELADA); W.abrir(W.linkCliente(x, 'cancelada')); toast('Reserva cancelada'); detalhe(r.id); }, true); return; }
        else { CB.mudarStatus(r.id, v); toast('Status: ' + v); }
        detalhe(r.id);
      });
    });
    c.querySelector('#g-editar').addEventListener('click', function () { fecharCamada(gav); formReserva(r); });
    c.querySelector('#g-excluir').addEventListener('click', function () {
      confirmar('Excluir a reserva de ' + r.nome + '?', 'Ela sai do painel e dos relatórios. Para manter o registro, prefira mudar o status para Cancelada.', 'Excluir de vez', function () { CB.excluirReserva(r.id); fecharCamada(gav); toast('Reserva excluída'); }, true);
    });
  }

  /* ---------- formulário de reserva ---------- */
  function formReserva(r, pre) {
    var ed = !!r; var d = r || pre || { data: CB.hoje(), pessoas: 2, hora: '' };
    var cfg = CB.getConfig();
    var horas = [], ini = CB.toMin(cfg.horaInicio), fim = CB.toMin(cfg.horaFim), passo = Math.max(10, +cfg.intervalo || 30);
    for (var m = ini; m <= fim; m += passo) horas.push(String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'));
    if (d.hora && horas.indexOf(d.hora) < 0) horas.push(d.hora);
    var c = abrirCamada(modal,
      '<div class="modal__cab"><div><h2 id="modal-titulo">' + (ed ? 'Editar reserva' : pre ? 'Confira a reserva colada' : 'Nova reserva') + '</h2>' + (ed ? '<p class="muted" style="margin-top:4px">' + esc(r.codigo) + '</p>' : pre && pre.codigo ? '<p class="muted" style="margin-top:4px">Código ' + esc(pre.codigo) + '</p>' : '') + '</div><button class="bt bt--icone bt--peq" data-fechar aria-label="Fechar">' + I.fechar + '</button></div>' +
      '<form id="fr" novalidate><div class="form-grade">' +
        fld('nome', 'Nome do cliente', '<input class="inp" id="r-nome" maxlength="80" value="' + esc(d.nome || '') + '">', 'cheio') +
        fld('telefone', 'WhatsApp', '<input class="inp" id="r-telefone" type="tel" inputmode="tel" value="' + esc(d.telefone || '') + '">') +
        fld('email', 'E-mail', '<input class="inp" id="r-email" type="email" value="' + esc(d.email || '') + '">') +
        fld('data', 'Data', '<input class="inp" id="r-data" type="date" value="' + esc(d.data || '') + '">') +
        fld('hora', 'Horário', '<select class="sel" id="r-hora"><option value="">Escolha</option>' + horas.sort().map(function (h) { return '<option' + (h === d.hora ? ' selected' : '') + '>' + h + '</option>'; }).join('') + '</select>') +
        fld('pessoas', 'Pessoas', '<input class="inp" id="r-pessoas" type="number" min="1" max="500" value="' + esc(d.pessoas || '') + '">') +
        fld('ambienteId', 'Local', '<select class="sel" id="r-amb">' + opcoesAmb(d.ambienteId, pre && pre.ambienteNome && !d.ambienteId ? 'Escolha (mensagem dizia: ' + pre.ambienteNome + ')' : 'Escolha o local') + '</select>') +
        (ed ? fld('status', 'Status', '<select class="sel" id="r-status">' + opcoesStatus(d.status) + '</select>') : '') +
        fld('observacoes', 'Observações', '<textarea class="inp" id="r-obs" maxlength="400">' + esc(d.observacoes || '') + '</textarea>', 'cheio') +
      '</div><div class="modal__rodape"><button type="button" class="bt" data-fechar>Cancelar</button><button type="submit" class="bt bt--pri">' + (ed ? 'Salvar alterações' : 'Salvar reserva') + '</button></div></form>');
    var tel = c.querySelector('#r-telefone');
    tel.addEventListener('input', function () { tel.value = CB.mascaraTel(tel.value); });
    tel.value = CB.mascaraTel(tel.value);
    c.querySelector('#fr').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = {
        nome: c.querySelector('#r-nome').value, telefone: tel.value, email: c.querySelector('#r-email').value,
        data: c.querySelector('#r-data').value, hora: c.querySelector('#r-hora').value, pessoas: c.querySelector('#r-pessoas').value,
        ambienteId: c.querySelector('#r-amb').value, observacoes: c.querySelector('#r-obs').value
      };
      var err = {};
      if (CB.limpar(v.nome).length < 2) err.nome = 'Informe o nome.';
      if (!CB.telValido(v.telefone)) err.telefone = 'WhatsApp com DDD.';
      if (v.email && !CB.emailValido(v.email)) err.email = 'E-mail inválido.';
      if (!v.data) err.data = 'Informe a data.';
      if (!v.hora) err.hora = 'Escolha o horário.';
      if (!(+v.pessoas >= 1)) err.pessoas = 'Mínimo 1.';
      if (!v.ambienteId) err.ambienteId = 'Escolha o local.';
      $$('.fld', c).forEach(function (f) { var k = f.getAttribute('data-k'); f.classList.toggle('erro', !!err[k]); var s = f.querySelector('.err'); if (s) s.textContent = err[k] || ''; });
      if (Object.keys(err).length) { var cx = c; cx.classList.remove('treme'); void cx.offsetWidth; cx.classList.add('treme'); return; }
      if (ed) {
        var st = c.querySelector('#r-status').value;
        v.nome = CB.limpar(v.nome, 80); v.telefone = CB.mascaraTel(v.telefone); v.email = CB.limpar(v.email, 120).toLowerCase(); v.observacoes = CB.limpar(v.observacoes, 400); v.pessoas = +v.pessoas;
        if (st !== r.status) v.status = st;
        CB.atualizarReserva(r.id, v, v.status ? 'Editada · status: ' + st : 'Dados editados');
        fecharCamada(modal); toast('Reserva atualizada');
      } else {
        if (pre && pre.codigo && CB.getReservaPorCodigo(pre.codigo)) { jaExiste(CB.getReservaPorCodigo(pre.codigo)); return; }
        if (pre && pre.codigo) v.codigo = pre.codigo;
        var nova = CB.criarReserva(v, pre ? 'whatsapp' : 'painel');
        fecharCamada(modal); toast('Reserva registrada');
        setTimeout(function () { detalhe(nova.id); }, 250);
      }
    });
  }
  function fld(k, rot, campo, cls) { return '<label class="fld ' + (cls || '') + '" data-k="' + k + '"><span>' + rot + '</span>' + campo + '<small class="err"></small></label>'; }

  /* ---------- importar mensagem do WhatsApp ---------- */
  function importarZap() {
    var c = abrirCamada(modal,
      '<div class="modal__cab"><div><h2 id="modal-titulo">Colar reserva do WhatsApp</h2><p class="muted" style="margin-top:4px">No WhatsApp, segure a mensagem da reserva, toque em Copiar e cole aqui.</p></div><button class="bt bt--icone bt--peq" data-fechar aria-label="Fechar">' + I.fechar + '</button></div>' +
      '<textarea class="inp" id="zap-txt" style="min-height:220px" placeholder="🌊 Nova reserva — Barraca Cumbuco Beach&#10;🏷️ Código: CB-…&#10;👤 Nome: …"></textarea>' +
      '<p class="err" id="zap-err" style="color:var(--erro);font-weight:600;margin:10px 0 0"></p>' +
      '<div class="modal__rodape"><button class="bt" data-fechar>Cancelar</button><button class="bt bt--pri" id="zap-ler">Ler mensagem</button></div>');
    var ta = c.querySelector('#zap-txt');
    if (navigator.clipboard && navigator.clipboard.readText && window.isSecureContext) {
      var b = document.createElement('button'); b.className = 'bt'; b.type = 'button'; b.innerHTML = I.colar + 'Colar da área de transferência';
      b.addEventListener('click', function () { navigator.clipboard.readText().then(function (t) { ta.value = t; }).catch(function () {}); });
      c.querySelector('.modal__rodape').prepend(b);
    }
    c.querySelector('#zap-ler').addEventListener('click', function () {
      var p = CB.lerMensagem(ta.value);
      if (!p.nome && !p.telefone && !p.data) { c.querySelector('#zap-err').textContent = 'Não encontramos os dados da reserva nesse texto. Cole a mensagem completa enviada pelo site.'; return; }
      if (p.codigo && CB.getReservaPorCodigo(p.codigo)) { jaExiste(CB.getReservaPorCodigo(p.codigo)); return; }
      fecharCamada(modal);
      setTimeout(function () { formReserva(null, p); }, 200);
    });
  }

  /* reserva colada que já está no painel: explica o motivo e mostra a reserva */
  function jaExiste(r) {
    var motivo = r.origem === 'site'
      ? 'Ela foi feita pelo site neste mesmo aparelho/navegador, então já entrou no painel sozinha — não precisa colar. Isso acontece quando você testa o site no mesmo computador do painel. Com o cliente usando o celular dele, a reserva só chega pelo WhatsApp e o colar funciona normalmente.'
      : 'Essa mensagem já tinha sido colada antes (o código ' + r.codigo + ' já está registrado). Nada foi duplicado.';
    var c = abrirCamada(modal,
      '<div class="modal__cab"><h2 id="modal-titulo">Essa reserva já está no painel</h2><button class="bt bt--icone bt--peq" data-fechar aria-label="Fechar">' + I.fechar + '</button></div>' +
      '<p class="muted">' + esc(motivo) + '</p>' +
      '<div class="cartao" style="margin-top:16px;padding:6px">' + linhaRes(r).replace('data-acao="ver"', 'tabindex="-1" style="pointer-events:none"') + '</div>' +
      '<div class="modal__rodape"><button class="bt" data-fechar>Fechar</button><button class="bt bt--pri" id="je-ver">Abrir reserva</button></div>');
    c.querySelector('#je-ver').addEventListener('click', function () { fecharCamada(modal); setTimeout(function () { detalhe(r.id); }, 200); });
  }

  /* ---------- atualizar do banco ---------- */
  function sincronizar(b) {
    if (b) { b.disabled = true; b.dataset.txt = b.innerHTML; b.innerHTML = I.sync + 'Atualizando…'; }
    NV.sincronizar().then(function (ok) {
      toast(ok ? 'Painel atualizado' : 'O banco não respondeu agora');
      if (b && document.body.contains(b)) { b.disabled = false; b.innerHTML = b.dataset.txt; }
      render(false); chipBanco();
    });
  }

  /* ---------- CALENDÁRIO ---------- */
  var cal = { mes: CB.hoje().slice(0, 7), dia: CB.hoje() };
  function vCalendario() {
    var p = cal.mes.split('-'), ano = +p[0], mes = +p[1] - 1;
    var prim = new Date(ano, mes, 1), ini = new Date(ano, mes, 1 - prim.getDay());
    var titulo = prim.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); titulo = titulo.charAt(0).toUpperCase() + titulo.slice(1);
    var rs = CB.getReservas().filter(function (r) { return r.status !== S.CANCELADA && r.status !== S.NOSHOW; });
    var porDia = {}; rs.forEach(function (r) { var x = porDia[r.data] || (porDia[r.data] = { n: 0, p: 0 }); x.n++; x.p += +r.pessoas || 0; });
    var capTotal = CB.getAmbientes(true).reduce(function (s, a) { return s + (+a.capacidade || 0); }, 0) || 1;
    var dias = '', hoje = CB.hoje();
    for (var i = 0; i < 42; i++) {
      var dt = new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() + i);
      var iso = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
      var x = porDia[iso];
      dias += '<button type="button" class="cal__dia' + (dt.getMonth() !== mes ? ' fora' : '') + (iso === hoje ? ' hoje' : '') + (iso === cal.dia ? ' sel' : '') + (CB.diaFechado(iso) ? ' fechado' : '') + '" data-dia="' + iso + '" aria-label="' + esc(CB.dataExtenso(iso)) + (x ? ', ' + plural(x.n, 'reserva', 'reservas') : '') + '">' +
        '<span class="cal__n">' + dt.getDate() + '</span>' +
        (x ? '<span class="cal__info"><b>' + x.n + '</b> res. · ' + x.p + ' pes.</span><span class="cal__barra"><i style="width:' + Math.min(100, Math.round(x.p / capTotal * 100)) + '%"></i></span>' : (CB.diaFechado(iso) ? '<span class="cal__info">Fechado</span>' : '')) + '</button>';
      if (i === 34 && new Date(ano, mes, 1 - prim.getDay() + 35).getMonth() !== mes) break;
    }
    var sem = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map(function (s) { return '<div class="cal__sem">' + s + '</div>'; }).join('');
    return '<div class="cab"><div><h1>Calendário</h1><p>Toque num dia para ver as reservas e a ocupação de cada local.</p></div><div class="cab__acoes"><button class="bt bt--pri" data-acao="nova">' + I.mais + 'Nova reserva</button></div></div>' +
      '<div class="grade-2"><div class="cartao"><div class="cal-cab"><button class="bt bt--icone" id="c-ant" aria-label="Mês anterior">' + I.esq + '</button><h2>' + esc(titulo) + '</h2><button class="bt bt--icone" id="c-prox" aria-label="Próximo mês">' + I.dir + '</button><button class="bt bt--peq" id="c-hoje" style="margin-left:auto">Hoje</button></div>' +
      '<div class="cal">' + sem + dias + '</div></div>' + painelDia() + '</div>' + cartaoBloqueios();
  }
  function painelDia() {
    var d = cal.dia, l = CB.getReservas({ data: d }).reverse();
    var ativas = l.filter(function (r) { return r.status !== S.CANCELADA && r.status !== S.NOSHOW; });
    var ambs = CB.getAmbientes(true);
    var ocup = ambs.map(function (a) {
      var o = CB.ocupacao(d, null, a.id), cap = +a.capacidade || 0, pct = cap ? Math.min(100, Math.round(o / cap * 100)) : 0;
      return o ? '<div class="ocup__l"><b>' + esc(a.nome) + '</b><span class="num">' + o + (cap ? ' / ' + cap : '') + '</span><div class="barra"><i class="' + (pct >= 90 ? 'cheia' : '') + '" style="width:' + pct + '%"></i></div></div>' : '';
    }).join('');
    return '<div class="cartao"><div class="cartao__cab"><h2>' + esc(CB.dataExtenso(d, true)) + '</h2><span class="muted">' + plural(ativas.reduce(function (s, r) { return s + (+r.pessoas || 0); }, 0), 'pessoa', 'pessoas') + '</span></div>' +
      (l.length ? l.map(linhaRes).join('') : '<div class="vazio"><b>Nenhuma reserva neste dia.</b></div>') +
      (ocup ? '<h3 style="margin:20px 0 10px">Ocupação por local</h3><div class="ocup">' + ocup + '</div>' : '') +
      '</div>';
  }
  function cartaoBloqueios() {
    var bl = CB.getBloqueios().filter(function (b) { return b.data >= CB.hoje(); });
    return '<div class="cartao" style="margin-top:16px"><div class="cartao__cab"><div><h2>Dias e horários sem reserva</h2><p class="muted" style="margin-top:4px">O site deixa de oferecer o que estiver bloqueado aqui.</p></div></div>' +
      '<form id="bl-form" class="form-grade" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));align-items:end">' +
        fld('bdata', 'Data', '<input class="inp" type="date" id="b-data" min="' + CB.hoje() + '" required>') +
        fld('bamb', 'Local', '<select class="sel" id="b-amb">' + opcoesAmb('', 'Todos os locais') + '</select>') +
        fld('bini', 'Das', '<input class="inp" type="time" id="b-ini">') +
        fld('bfim', 'Até', '<input class="inp" type="time" id="b-fim">') +
        fld('bmot', 'Motivo', '<input class="inp" id="b-mot" placeholder="Evento fechado, feriado…">') +
        '<button class="bt bt--azul" type="submit" style="margin-bottom:22px">Bloquear</button></form>' +
      (bl.length ? '<div class="tabela-wrap" style="margin-top:6px"><table><thead><tr><th>Data</th><th>Local</th><th>Período</th><th>Motivo</th><th></th></tr></thead><tbody>' +
        bl.map(function (b) {
          return '<tr style="cursor:default"><td>' + esc(CB.dataExtenso(b.data, true)) + '</td><td>' + esc(b.ambienteId ? CB.nomeAmbiente(b.ambienteId) : 'Todos') + '</td><td>' + (b.horaInicio || b.horaFim ? esc((b.horaInicio || '00:00') + ' às ' + (b.horaFim || '23:59')) : 'Dia inteiro') + '</td><td>' + esc(b.motivo || '—') + '</td><td style="text-align:right"><button class="bt bt--peq bt--perigo" data-bl="' + esc(b.id) + '">Remover</button></td></tr>';
        }).join('') + '</tbody></table></div>' : '<p class="muted">Nenhum bloqueio programado.</p>') + '</div>';
  }
  vCalendario.depois = function () {
    var mudaMes = function (n) { var p = cal.mes.split('-'); var d = new Date(+p[0], +p[1] - 1 + n, 1); cal.mes = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); render(false); };
    $('#c-ant').addEventListener('click', function () { mudaMes(-1); });
    $('#c-prox').addEventListener('click', function () { mudaMes(1); });
    $('#c-hoje').addEventListener('click', function () { cal.mes = CB.hoje().slice(0, 7); cal.dia = CB.hoje(); render(false); });
    $$('.cal__dia').forEach(function (b) { b.addEventListener('click', function () { cal.dia = b.getAttribute('data-dia'); if (cal.dia.slice(0, 7) !== cal.mes) cal.mes = cal.dia.slice(0, 7); render(false); }); });
    $('#bl-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var d = $('#b-data').value; if (!d) { $('#b-data').focus(); return; }
      CB.salvarBloqueio({ data: d, ambienteId: $('#b-amb').value, horaInicio: $('#b-ini').value, horaFim: $('#b-fim').value, motivo: CB.limpar($('#b-mot').value, 100) });
      toast('Bloqueio salvo');
    });
    $$('[data-bl]').forEach(function (b) { b.addEventListener('click', function () { CB.excluirBloqueio(b.getAttribute('data-bl')); toast('Bloqueio removido'); }); });
  };

  /* ---------- AMBIENTES ---------- */
  function vAmbientes() {
    var l = CB.getAmbientes();
    var cat = function (id) { var c = CB.CATEGORIAS.filter(function (x) { return x.id === id; })[0]; return c ? c.nome : 'Outros'; };
    return '<div class="cab"><div><h1>Ambientes</h1><p>O que aparece para o cliente escolher no site. A ordem aqui é a ordem no site.</p></div><div class="cab__acoes"><button class="bt bt--pri" id="a-novo">' + I.mais + 'Novo ambiente</button></div></div>' +
      '<div class="amb-lista">' + l.map(function (a, i) {
        return '<div class="amb-item' + (a.ativo ? '' : ' inativo') + '"><img src="' + esc(a.imagem || '') + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
          '<div style="min-width:0"><b>' + esc(a.nome) + '</b><div class="muted" style="font-size:13.5px">' + esc(cat(a.cat)) + ' · ' + (a.capacidade ? 'até ' + a.capacidade + ' pessoas' : 'sem limite definido') + (a.ativo ? '' : ' · <b>oculto no site</b>') + '</div></div>' +
          '<div class="amb-item__acoes"><button class="bt bt--icone bt--peq" data-mv="' + i + '" data-d="-1" aria-label="Subir"' + (i === 0 ? ' disabled' : '') + '>' + I.cima + '</button><button class="bt bt--icone bt--peq" data-mv="' + i + '" data-d="1" aria-label="Descer"' + (i === l.length - 1 ? ' disabled' : '') + '>' + I.baixo + '</button><button class="bt bt--peq" data-ed="' + esc(a.id) + '">' + I.editar + 'Editar</button></div></div>';
      }).join('') + '</div>';
  }
  vAmbientes.depois = function () {
    $('#a-novo').addEventListener('click', function () { formAmbiente(); });
    $$('[data-ed]').forEach(function (b) { b.addEventListener('click', function () { formAmbiente(CB.getAmbiente(b.getAttribute('data-ed'))); }); });
    $$('[data-mv]').forEach(function (b) {
      b.addEventListener('click', function () {
        var l = CB.getAmbientes(), i = +b.getAttribute('data-mv'), j = i + (+b.getAttribute('data-d'));
        if (j < 0 || j >= l.length) return;
        var t = l[i]; l[i] = l[j]; l[j] = t;
        l.forEach(function (a, k) { if (a.ordem !== k + 1) CB.salvarAmbiente({ id: a.id, ordem: k + 1 }); });
      });
    });
  };
  function formAmbiente(a) {
    var ed = !!a; a = a || { ativo: true, cat: 'areia' };
    var c = abrirCamada(modal,
      '<div class="modal__cab"><h2 id="modal-titulo">' + (ed ? 'Editar ambiente' : 'Novo ambiente') + '</h2><button class="bt bt--icone bt--peq" data-fechar aria-label="Fechar">' + I.fechar + '</button></div>' +
      '<form id="fa" novalidate><div class="form-grade">' +
        fld('nome', 'Nome', '<input class="inp" id="a-nome" maxlength="80" value="' + esc(a.nome || '') + '" required>', 'cheio') +
        fld('cat', 'Tipo', '<select class="sel" id="a-cat">' + CB.CATEGORIAS.map(function (x) { return '<option value="' + x.id + '"' + (a.cat === x.id ? ' selected' : '') + '>' + esc(x.nome) + '</option>'; }).join('') + '</select>') +
        fld('cap', 'Capacidade (pessoas)', '<input class="inp" id="a-cap" type="number" min="0" value="' + esc(a.capacidade || 0) + '">') +
        fld('desc', 'Descrição', '<textarea class="inp" id="a-desc" maxlength="220">' + esc(a.descricao || '') + '</textarea>', 'cheio') +
        '<div class="fld cheio" data-k="img"><span>Foto</span><div class="foto-amb">' +
          '<div class="foto-amb__prev" id="a-prev">' + (a.imagem ? '<img src="' + esc(a.imagem) + '" alt="">' : '<small>Sem foto</small>') + '</div>' +
          '<div class="foto-amb__acoes"><label class="bt' + (bancoOk() ? ' bt--azul' : '') + '" style="cursor:pointer">' + I.subir + 'Escolher foto<input type="file" id="a-arq" accept="image/*" hidden></label>' +
          '<p class="muted" id="a-foto-msg" style="font-size:13px;margin:8px 0 0">' + (bancoOk() ? 'Do celular ou do computador. A foto é reduzida antes de enviar.' : 'Para enviar fotos, o banco precisa estar conectado.') + '</p></div></div>' +
          '<input type="hidden" id="a-img" value="' + esc(a.imagem || '') + '"><small class="err"></small></div>' +
        '<label class="check cheio"><input type="checkbox" id="a-ativo"' + (a.ativo ? ' checked' : '') + '> Mostrar no site para reservas</label>' +
      '</div><div class="modal__rodape">' + (ed ? '<button type="button" class="bt bt--perigo" id="a-exc" style="margin-right:auto">' + I.lixo + 'Excluir</button>' : '') + '<button type="button" class="bt" data-fechar>Cancelar</button><button type="submit" class="bt bt--pri">Salvar</button></div></form>');
    var enviando = false;
    c.querySelector('#a-arq').addEventListener('change', function (ev) {
      var arq = ev.target.files[0]; if (!arq) return;
      var msg = c.querySelector('#a-foto-msg'), prev = c.querySelector('#a-prev'), salvar = c.querySelector('#fa button[type=submit]');
      if (!NV.enviarFoto || !bancoOk()) { msg.textContent = 'Para enviar fotos, o banco precisa estar conectado.'; return; }
      enviando = true; salvar.disabled = true; msg.textContent = 'Enviando foto…';
      prev.innerHTML = '<img src="' + URL.createObjectURL(arq) + '" alt="" style="opacity:.5">';
      NV.enviarFoto(arq).then(function (url) {
        c.querySelector('#a-img').value = url;
        prev.innerHTML = '<img src="' + esc(url) + '" alt="">';
        msg.textContent = 'Foto enviada. Toque em Salvar para aplicar.';
      }).catch(function (er) {
        prev.innerHTML = a.imagem ? '<img src="' + esc(a.imagem) + '" alt="">' : '<small>Sem foto</small>';
        msg.textContent = er.message;
      }).then(function () { enviando = false; salvar.disabled = false; ev.target.value = ''; });
    });
    c.querySelector('#fa').addEventListener('submit', function (e) {
      e.preventDefault();
      if (enviando) return;
      var nome = CB.limpar(c.querySelector('#a-nome').value, 80);
      if (nome.length < 2) { var f = c.querySelector('[data-k="nome"]'); f.classList.add('erro'); f.querySelector('.err').textContent = 'Informe o nome.'; return; }
      CB.salvarAmbiente({ id: a.id, nome: nome, cat: c.querySelector('#a-cat').value, capacidade: Math.max(0, parseInt(c.querySelector('#a-cap').value, 10) || 0), descricao: CB.limpar(c.querySelector('#a-desc').value, 220), imagem: String(c.querySelector('#a-img').value || '').trim().slice(0, 400), ativo: c.querySelector('#a-ativo').checked });
      fecharCamada(modal); toast(ed ? 'Ambiente atualizado' : 'Ambiente criado');
    });
    var x = c.querySelector('#a-exc');
    if (x) x.addEventListener('click', function () {
      confirmar('Excluir ' + a.nome + '?', 'Reservas antigas continuam mostrando o nome. Para só esconder do site, desmarque "Mostrar no site".', 'Excluir ambiente', function () { CB.excluirAmbiente(a.id); toast('Ambiente excluído'); }, true);
    });
  }

  /* ---------- CLIENTES ---------- */
  var buscaCli = '';
  function vClientes() {
    var l = CB.getClientes(), b = buscaCli.toLowerCase();
    if (b) l = l.filter(function (c) { return (c.nome + ' ' + c.telefone + ' ' + c.email).toLowerCase().indexOf(b) >= 0; });
    return '<div class="cab"><div><h1>Clientes</h1><p>Montado a partir das reservas registradas. ' + plural(l.length, 'cliente', 'clientes') + '.</p></div></div>' +
      '<div class="filtros" style="grid-template-columns:minmax(0,420px)"><input class="inp" type="search" id="cli-busca" placeholder="Buscar cliente" value="' + esc(buscaCli) + '" aria-label="Buscar cliente"></div>' +
      (l.length ? '<div class="tabela-wrap"><table><thead><tr><th>Cliente</th><th>WhatsApp</th><th>E-mail</th><th>Reservas</th><th>Cancel./faltas</th><th>Última visita</th><th></th></tr></thead><tbody>' +
        l.map(function (c) {
          return '<tr style="cursor:default"><td><b>' + esc(c.nome) + '</b></td><td class="num">' + esc(c.telefone) + '</td><td>' + esc(c.email || '—') + '</td><td class="num">' + c.reservas + '<span class="sub">' + plural(c.pessoas, 'pessoa', 'pessoas') + '</span></td><td class="num">' + c.cancelamentos + ' / ' + c.faltas + '</td><td class="num">' + esc(CB.fmtData(c.ultima)) + '</td>' +
            '<td style="text-align:right"><a class="bt bt--peq" href="https://wa.me/' + esc(W.numeroCliente(c.telefone)) + '" target="_blank" rel="noopener">' + I.zap + 'Conversar</a></td></tr>';
        }).join('') + '</tbody></table></div>' : '<div class="cartao vazio"><b>Nenhum cliente ainda.</b>Os clientes aparecem conforme as reservas são registradas.</div>');
  }
  vClientes.depois = function () {
    var deb; $('#cli-busca').addEventListener('input', function (e) { clearTimeout(deb); deb = setTimeout(function () { buscaCli = e.target.value; render(false); var i = $('#cli-busca'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 220); });
  };

  /* ---------- RELATÓRIOS ---------- */
  var relPer = '30';
  function vRelatorios() {
    var h = CB.hoje(), de = relPer === 'tudo' ? '' : relPer === 'mes' ? h.slice(0, 8) + '01' : CB.somaDias(h, -(+relPer) + 1);
    var ate = relPer === 'tudo' || relPer === 'mes' ? '' : h;
    var l = CB.getReservas({ de: de, ate: ate });
    var validas = l.filter(function (r) { return r.status !== S.CANCELADA; });
    var pessoas = validas.reduce(function (s, r) { return s + (+r.pessoas || 0); }, 0);
    var canc = l.filter(function (r) { return r.status === S.CANCELADA; }).length, faltas = l.filter(function (r) { return r.status === S.NOSHOW; }).length;
    var pct = function (n) { return l.length ? Math.round(n / l.length * 100) + '%' : '0%'; };
    var semana = [0, 0, 0, 0, 0, 0, 0]; validas.forEach(function (r) { var p = r.data.split('-'); semana[new Date(+p[0], +p[1] - 1, +p[2]).getDay()] += +r.pessoas || 0; });
    var horas = {}; validas.forEach(function (r) { horas[r.hora] = (horas[r.hora] || 0) + 1; });
    var locais = {}; validas.forEach(function (r) { var n = nomeAmb(r); locais[n] = (locais[n] || 0) + (+r.pessoas || 0); });
    var sts = {}; l.forEach(function (r) { sts[r.status] = (sts[r.status] || 0) + 1; });
    var colunas = function (pares) {
      var max = Math.max.apply(null, pares.map(function (p) { return p[1]; }).concat([1]));
      return '<div class="colunas">' + pares.map(function (p, i) { return '<div class="coluna"><i style="height:' + Math.max(2, p[1] / max * 100) + '%;animation-delay:' + (i * 40) + 'ms"><span>' + (p[1] || '') + '</span></i><small>' + esc(p[0]) + '</small></div>'; }).join('') + '</div>';
    };
    var barras = function (obj) {
      var ks = Object.keys(obj).sort(function (a, b) { return obj[b] - obj[a]; }); var max = Math.max.apply(null, ks.map(function (k) { return obj[k]; }).concat([1]));
      return ks.length ? '<div class="ocup">' + ks.map(function (k) { return '<div class="ocup__l"><b>' + esc(k) + '</b><span class="num">' + obj[k] + '</span><div class="barra"><i style="width:' + (obj[k] / max * 100) + '%"></i></div></div>'; }).join('') + '</div>' : '<p class="muted">Sem dados no período.</p>';
    };
    var per = [['7', 'Últimos 7 dias'], ['30', 'Últimos 30 dias'], ['90', 'Últimos 90 dias'], ['mes', 'Este mês em diante'], ['tudo', 'Todo o histórico']];
    return '<div class="cab"><div><h1>Relatórios</h1><p>' + plural(l.length, 'reserva', 'reservas') + ' no período.</p></div><div class="cab__acoes">' +
      '<select class="sel" id="rel-per" aria-label="Período" style="min-width:200px">' + per.map(function (p) { return '<option value="' + p[0] + '"' + (relPer === p[0] ? ' selected' : '') + '>' + p[1] + '</option>'; }).join('') + '</select>' +
      '<button class="bt" id="rel-csv">' + I.baixar + 'Exportar</button><button class="bt" onclick="print()">' + I.imprimir + 'Imprimir</button></div></div>' +
      '<div class="kpis"><div class="kpi kpi--sol"><b>' + validas.length + '</b><span>reservas válidas</span></div><div class="kpi"><b>' + pessoas + '</b><span>pessoas atendidas ou esperadas</span></div>' +
      '<div class="kpi"><b>' + (validas.length ? (pessoas / validas.length).toFixed(1).replace('.', ',') : '0') + '</b><span>pessoas por reserva</span></div><div class="kpi"><b>' + pct(canc + faltas) + '</b><span>' + canc + ' cancel. · ' + faltas + ' faltas</span></div></div>' +
      '<div class="rel-grade">' +
        '<div class="cartao"><h2>Pessoas por dia da semana</h2>' + colunas(['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map(function (d, i) { return [d, semana[i]]; })) + '</div>' +
        '<div class="cartao"><h2>Reservas por horário</h2>' + colunas(Object.keys(horas).sort().map(function (k) { return [k, horas[k]]; })) + '</div>' +
        '<div class="cartao"><h2>Pessoas por local</h2><div style="margin-top:14px">' + barras(locais) + '</div></div>' +
        '<div class="cartao"><h2>Reservas por status</h2><div style="margin-top:14px">' + barras(sts) + '</div></div>' +
      '</div>';
  }
  vRelatorios.depois = function () {
    $('#rel-per').addEventListener('change', function (e) { relPer = e.target.value; render(false); });
    $('#rel-csv').addEventListener('click', function () {
      var h = CB.hoje(), de = relPer === 'tudo' ? '' : relPer === 'mes' ? h.slice(0, 8) + '01' : CB.somaDias(h, -(+relPer) + 1);
      CB.exportarCSV(CB.getReservas({ de: de, ate: relPer === 'tudo' || relPer === 'mes' ? '' : h }));
    });
  };

  /* ---------- CONFIGURAÇÕES ---------- */
  function vConfig() {
    var c = CB.getConfig();
    return '<div class="cab"><div><h1>Configurações</h1><p>' + (bancoOk() ? 'Horários, mensagens e ambientes salvos aqui valem para todo o site e toda a equipe.' : 'Horários de reserva, mensagens, senha e cópia de segurança.') + '</p></div></div>' +
      avisoDados() +
      '<div class="rel-grade">' +
      '<form class="cartao" id="cfg-form"><h2>Reservas pelo site</h2><div class="form-grade" style="margin-top:14px">' +
        fld('ini', 'Primeiro horário', '<input class="inp" type="time" id="c-ini" value="' + esc(c.horaInicio) + '">') +
        fld('fim', 'Último horário', '<input class="inp" type="time" id="c-fim" value="' + esc(c.horaFim) + '">') +
        fld('int', 'Intervalo entre horários', '<select class="sel" id="c-int">' + [15, 30, 60].map(function (n) { return '<option value="' + n + '"' + (+c.intervalo === n ? ' selected' : '') + '>' + n + ' minutos</option>'; }).join('') + '</select>') +
        fld('max', 'Máximo de pessoas por reserva', '<input class="inp" type="number" min="1" id="c-max" value="' + esc(c.maxPessoas) + '">') +
        fld('ant', 'Aceitar reservas até quantos dias à frente', '<input class="inp" type="number" min="1" id="c-ant" value="' + esc(c.antecedenciaDias) + '">', 'cheio') +
        fld('pol', 'Condições mostradas ao cliente', '<textarea class="inp" id="c-pol">' + esc(c.politica) + '</textarea>', 'cheio') +
      '</div><div class="modal__rodape"><button class="bt bt--pri" type="submit">Salvar</button></div></form>' +
      '<form class="cartao" id="msg-form"><h2>Mensagens para o cliente</h2><p class="muted" style="margin-top:4px">Vão no WhatsApp quando você confirma ou cancela uma reserva.</p><div class="form-grade" style="margin-top:14px">' +
        fld('mc', 'Confirmação', '<textarea class="inp" id="c-mc">' + esc(c.msgConfirmacao) + '</textarea>', 'cheio') +
        fld('mx', 'Cancelamento', '<textarea class="inp" id="c-mx">' + esc(c.msgCancelamento) + '</textarea>', 'cheio') +
      '</div><div class="modal__rodape"><button class="bt bt--pri" type="submit">Salvar mensagens</button></div></form>' +
      '<form class="cartao" id="senha-form"><h2>' + (NV.ativo ? 'Senha do modo WhatsApp' : 'Senha do painel') + '</h2>' + (NV.ativo ? '<p class="muted" style="margin-top:4px">Usada só quando o banco está fora do ar (entrar sem e-mail). Vale para este aparelho. As senhas de e-mail da equipe são trocadas no Supabase.</p>' : '') + '<div class="form-grade" style="margin-top:14px">' +
        fld('sa', 'Senha atual', '<input class="inp" type="password" id="s-at" autocomplete="current-password">', 'cheio') +
        fld('sn', 'Nova senha', '<input class="inp" type="password" id="s-nv" autocomplete="new-password" minlength="6">') +
        fld('sc', 'Repita a nova senha', '<input class="inp" type="password" id="s-cf" autocomplete="new-password">') +
      '</div><div class="modal__rodape"><button class="bt bt--azul" type="submit">Trocar senha</button></div></form>' +
      '<div class="cartao"><h2>Cópia de segurança</h2><p class="muted" style="margin-top:4px">' + (NV.ativo ? 'Baixe de vez em quando uma cópia das reservas e guarde no Google Drive — é a garantia caso algo aconteça com o banco.' : 'As reservas ficam guardadas neste navegador. Baixe uma cópia toda semana e guarde no Google Drive — ela também serve para levar os dados para outro computador.') + '</p>' +
        '<div class="cab__acoes" style="margin-top:14px"><button class="bt bt--azul" id="bk-exp">' + I.baixar + 'Baixar cópia</button><label class="bt" style="cursor:pointer">' + I.subir + 'Restaurar cópia<input type="file" id="bk-imp" accept="application/json,.json" hidden></label><button class="bt" data-acao="csv">' + I.baixar + 'Planilha (CSV)</button></div>' +
        (NV.ativo ? '' : '<h3 style="margin-top:22px">Apagar tudo</h3><p class="muted" style="margin-top:4px">Remove todas as reservas deste navegador. Use só depois de baixar uma cópia.</p><button class="bt bt--perigo" id="zerar" style="margin-top:10px">' + I.lixo + 'Apagar todas as reservas</button>') +
      '</div></div>';
  }
  vConfig.depois = function () {
    $('#cfg-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var ini = $('#c-ini').value, fim = $('#c-fim').value;
      if (!ini || !fim || CB.toMin(fim) < CB.toMin(ini)) { toast('O último horário precisa ser depois do primeiro'); return; }
      CB.salvarConfig({ horaInicio: ini, horaFim: fim, intervalo: +$('#c-int').value, maxPessoas: Math.max(1, +$('#c-max').value || 60), antecedenciaDias: Math.max(1, +$('#c-ant').value || 60), politica: CB.limpar($('#c-pol').value, 500) });
      toast('Configurações salvas');
    });
    $('#msg-form').addEventListener('submit', function (e) { e.preventDefault(); CB.salvarConfig({ msgConfirmacao: CB.limpar($('#c-mc').value, 400), msgCancelamento: CB.limpar($('#c-mx').value, 400) }); toast('Mensagens salvas'); });
    $('#senha-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if ($('#s-nv').value !== $('#s-cf').value) { toast('As duas senhas novas não são iguais'); return; }
      var err = CB.trocarSenha($('#s-at').value, $('#s-nv').value);
      toast(err || 'Senha trocada');
      if (!err) render(false);
    });
    $('#bk-exp').addEventListener('click', function () { CB.exportarBackup(); });
    $('#bk-imp').addEventListener('change', function (e) {
      var f = e.target.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () { try { var n = CB.importarBackup(rd.result); toast(plural(n, 'reserva restaurada', 'reservas restauradas')); } catch (x) { toast(x.message); } };
      rd.readAsText(f);
    });
    var zr = $('#zerar'); if (zr) zr.addEventListener('click', function () {
      confirmar('Apagar todas as reservas?', 'Isso não pode ser desfeito. Ambientes, horários e senha continuam como estão.', 'Apagar tudo', function () {
        CB.getReservas().forEach(function (r) { CB.excluirReserva(r.id); }); toast('Reservas apagadas');
      }, true);
    });
  };

  render(true);
  chipBanco();
  if (NV.ativo) {
    NV.iniciarPainel(chipBanco);
  }
})();
