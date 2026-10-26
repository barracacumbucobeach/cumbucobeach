/* ============================================================
   BARRACA CUMBUCO BEACH — dados locais (window.CB)
   Cache local (localStorage) de tudo que o site e o painel usam.
   Com o Supabase ligado, js/nuvem.js sincroniza este cache com o banco.
   ============================================================ */
(function (g) {
  'use strict';
  var CFG = g.CB_CONFIG || {};
  var DB_KEY = 'cumbuco_beach_v2';
  var SESSION_KEY = 'cumbuco_admin_sessao';

  var STATUS = {
    PENDENTE: 'Aguardando confirmação',
    CONFIRMADA: 'Confirmada',
    CHEGOU: 'Cliente chegou',
    CONCLUIDA: 'Concluída',
    CANCELADA: 'Cancelada',
    NOSHOW: 'Não compareceu'
  };
  var STATUS_LIST = [STATUS.PENDENTE, STATUS.CONFIRMADA, STATUS.CHEGOU, STATUS.CONCLUIDA, STATUS.CANCELADA, STATUS.NOSHOW];
  var STATUS_TOM = {};
  STATUS_TOM[STATUS.PENDENTE] = 'pend';
  STATUS_TOM[STATUS.CONFIRMADA] = 'ok';
  STATUS_TOM[STATUS.CHEGOU] = 'chegou';
  STATUS_TOM[STATUS.CONCLUIDA] = 'fim';
  STATUS_TOM[STATUS.CANCELADA] = 'cancel';
  STATUS_TOM[STATUS.NOSHOW] = 'noshow';

  var CATEGORIAS = [
    { id: 'areia', nome: 'Pé na areia', resumo: 'Mesas sob cobertura direto na faixa de areia, de frente para o mar.' },
    { id: 'coberto', nome: 'Salões cobertos', resumo: 'Sombra garantida, perto da cozinha, da piscina e do caminho da praia.' },
    { id: 'tendas', nome: 'Tendas', resumo: 'Espaços reservados para até 6 pessoas, com mais privacidade.' }
  ];

  var AMBIENTES = [
    { id: 'praia-nascente', cat: 'areia', nome: 'Mesas Praia Sol Nascente', descricao: 'Mesas na areia no lado do nascente, sob cobertura e de frente para o mar.', imagem: 'assets/images/ambientes/mesas-praia-sol-nascente.jpg', capacidade: 140 },
    { id: 'praia-central', cat: 'areia', nome: 'Mesas Praia Central', descricao: 'Mesas na areia em posição central, com acesso direto ao mar.', imagem: 'assets/images/ambientes/mesas-praia-central.jpg', capacidade: 140 },
    { id: 'praia-poente', cat: 'areia', nome: 'Mesas Praia Sol Poente', descricao: 'Mesas na areia do lado poente — o lugar para ver o sol baixar.', imagem: 'assets/images/ambientes/mesas-praia-sol-poente.jpg', capacidade: 140 },
    { id: 'salao-entrada', cat: 'coberto', nome: 'Salão Coberto Entrada', descricao: 'Logo na entrada da barraca: prático para chegar e sentar.', imagem: 'assets/images/ambientes/salao-coberto-entrada.jpg', capacidade: 90 },
    { id: 'salao-central', cat: 'coberto', nome: 'Salão Coberto Central', descricao: 'Espaço central e mais reservado, bom para famílias e grupos menores.', imagem: 'assets/images/ambientes/salao-coberto-central.jpg', capacidade: 50 },
    { id: 'salao-caminho', cat: 'coberto', nome: 'Salão Coberto Central — Caminho da Praia', descricao: 'Entre a estrutura da barraca e a areia, com brisa e vista para o mar.', imagem: 'assets/images/ambientes/salao-coberto-central-caminho-praia.jpg', capacidade: 122 },
    { id: 'salao-piscina', cat: 'coberto', nome: 'Salão Coberto Praia Piscina', descricao: 'Área coberta junto à piscina, com sombra e o movimento da barraca por perto.', imagem: 'assets/images/ambientes/salao-coberto-praia-piscina.jpg', capacidade: 122 },
    { id: 'tendas-praia', cat: 'tendas', nome: 'Tendas Praia', descricao: 'Tendas 1 e 2 na faixa de areia — 6 lugares em cada.', imagem: 'assets/images/ambientes/tendas.jpg', capacidade: 12 },
    { id: 'tendas-central', cat: 'tendas', nome: 'Tendas Central', descricao: 'Tendas 1 e 2 na área central da barraca — 6 lugares em cada.', imagem: 'assets/images/ambientes/tendas.jpg', capacidade: 12 },
    { id: 'tendas-superior', cat: 'tendas', nome: 'Tendas Superior', descricao: 'Tendas 1 e 2 na parte alta, com vista ampla do mar — 6 lugares em cada.', imagem: 'assets/images/ambientes/tendas.jpg', capacidade: 12 }
  ];

  var PADRAO = {
    horaInicio: '09:00',
    horaFim: '14:30',
    intervalo: 30,
    maxPessoas: 60,
    antecedenciaDias: 60,
    msgConfirmacao: 'Sua reserva está confirmada. Já estamos esperando por você!',
    msgCancelamento: 'Sua reserva foi cancelada. Se quiser remarcar, é só responder esta mensagem.',
    politica: 'A reserva é uma solicitação e só vale após a confirmação da Barraca Cumbuco Beach pelo WhatsApp. Cancelamentos devem ser avisados pelo WhatsApp.',
    senhaHash: ''
  };
  var SENHA_INICIAL = 'cumbuco2026';

  /* ---------- utilidades ---------- */
  function uuid() {
    if (g.crypto && g.crypto.randomUUID) return g.crypto.randomUUID();
    return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  function hash(str) { /* cyrb53 — hash local da senha do painel */
    var h1 = 0xdeadbeef ^ 7, h2 = 0x41c6ce57 ^ 7;
    for (var i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }
  function limpar(v, max) {
    return String(v == null ? '' : v).replace(/[\u0000-\u001F\u007F​-‍﻿]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max || 200);
  }
  function digits(v) { return String(v || '').replace(/\D/g, ''); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function isoDe(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function hoje() { return isoDe(new Date()); }
  function somaDias(iso, n) { var p = iso.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2] + n); return isoDe(d); }
  function fmtData(iso) { var p = String(iso || '').split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : (iso || ''); }
  function dataExtenso(iso, curto) {
    var p = String(iso || '').split('-'); if (p.length !== 3) return iso || '';
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    var s = d.toLocaleDateString('pt-BR', curto ? { weekday: 'short', day: 'numeric', month: 'short' } : { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function fmtCarimbo(d) { d = new Date(d); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function mascaraTel(v) {
    var d = digits(v); if (d.indexOf('55') === 0 && d.length > 11) d = d.slice(2); d = d.slice(0, 11);
    if (!d) return '';
    if (d.length <= 2) return '(' + d;
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  function telValido(v) { var n = digits(v).length; return n === 10 || n === 11; }
  function emailValido(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim()); }
  function toMin(t) { var p = String(t || '0:0').split(':'); return (+p[0]) * 60 + (+p[1] || 0); }

  /* ---------- banco local ---------- */
  function novoBanco() {
    return {
      versao: 2,
      config: JSON.parse(JSON.stringify(PADRAO)),
      ambientes: AMBIENTES.map(function (a, i) { return Object.assign({ ativo: true, ordem: i + 1 }, a); }),
      reservas: [],
      bloqueios: []
    };
  }
  var _db = null;
  /* gancho de sincronização: o painel conectado ao Supabase registra aqui */
  var gancho = null;
  function avisar(acao, dado) { if (gancho) try { gancho(acao, dado); } catch (e) {} }
  function ler() {
    if (_db) return _db;
    try { var raw = g.localStorage.getItem(DB_KEY); _db = raw ? JSON.parse(raw) : novoBanco(); }
    catch (e) { _db = novoBanco(); }
    var base = novoBanco();
    _db.config = Object.assign({}, base.config, _db.config || {});
    if (!_db.ambientes || !_db.ambientes.length) _db.ambientes = base.ambientes;
    if (!_db.reservas) _db.reservas = [];
    if (!_db.bloqueios) _db.bloqueios = [];
    if (!_db.config.senhaHash) _db.config.senhaHash = hash(SENHA_INICIAL);
    return _db;
  }
  function gravar(db) {
    _db = db;
    try { g.localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) {}
    try { g.dispatchEvent(new CustomEvent('cb:mudou')); } catch (e) {}
    return db;
  }
  /* outra aba gravou → recarrega */
  g.addEventListener('storage', function (e) { if (e.key === DB_KEY) { _db = null; try { g.dispatchEvent(new CustomEvent('cb:mudou')); } catch (x) {} } });

  /* ---------- configuração ---------- */
  function getConfig() { var c = Object.assign({}, ler().config); delete c.senhaHash; return c; }
  function salvarConfig(patch) {
    var db = ler(); patch = Object.assign({}, patch); delete patch.senhaHash;
    db.config = Object.assign({}, db.config, patch); gravar(db); avisar('config'); return getConfig();
  }

  /* ---------- horários ---------- */
  function horarios(data) {
    var c = ler().config, ini = toMin(c.horaInicio), fim = toMin(c.horaFim), passo = Math.max(10, +c.intervalo || 30);
    var limite = -1;
    if (data && data === hoje()) { var a = new Date(); limite = a.getHours() * 60 + a.getMinutes(); }  /* hoje: só horários que ainda não passaram */
    var out = [];
    for (var m = ini; m <= fim; m += passo) { if (m <= limite) continue; out.push(pad(Math.floor(m / 60)) + ':' + pad(m % 60)); }
    return out;
  }

  /* ---------- ambientes ---------- */
  function getAmbientes(soAtivos) {
    var l = ler().ambientes.slice().sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
    return soAtivos ? l.filter(function (a) { return a.ativo; }) : l;
  }
  function slug(n) { return String(n || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function getAmbiente(id) {
    if (!id) return null;
    var l = ler().ambientes;
    return l.filter(function (a) { return a.id === id; })[0] || l.filter(function (a) { return slug(a.nome) === id; })[0] || null;
  }
  /* padrões locais (foto, tipo) achados pelo nome — usados quando o banco não tem */
  function padraoPorNome(nome) { var k = slug(nome); return AMBIENTES.filter(function (a) { return slug(a.nome) === k; })[0] || null; }
  function nomeAmbiente(id, r) { var a = getAmbiente(id); return a ? a.nome : ((r && r.ambienteNome) || '—'); }
  function salvarAmbiente(a) {
    var db = ler();
    if (a.id && getAmbiente(a.id)) db.ambientes = db.ambientes.map(function (x) { return x.id === a.id ? Object.assign({}, x, a) : x; });
    else { a.id = a.id || uuid(); a.ordem = a.ordem || db.ambientes.length + 1; if (a.ativo === undefined) a.ativo = true; db.ambientes.push(a); }
    gravar(db); avisar('ambiente', getAmbiente(a.id)); return a;
  }
  function excluirAmbiente(id) { var db = ler(); db.ambientes = db.ambientes.filter(function (a) { return a.id !== id; }); gravar(db); avisar('excluir-ambiente', { id: id }); }

  /* ---------- bloqueios ---------- */
  function getBloqueios() { return ler().bloqueios.slice().sort(function (a, b) { return a.data < b.data ? -1 : 1; }); }
  function salvarBloqueio(b) { var db = ler(); b.id = uuid(); db.bloqueios.push(b); gravar(db); avisar('bloqueio', b); return b; }
  function excluirBloqueio(id) { var db = ler(); db.bloqueios = db.bloqueios.filter(function (b) { return b.id !== id; }); gravar(db); avisar('excluir-bloqueio', { id: id }); }
  function bloqueado(data, hora, ambId) {
    var h = toMin(hora);
    var b = ler().bloqueios.filter(function (x) {
      if (x.data !== data) return false;
      if (x.ambienteId && ambId && x.ambienteId !== ambId) return false;
      if (!x.horaInicio && !x.horaFim) return true;
      if (!hora) return false;
      return h >= toMin(x.horaInicio || '00:00') && h <= toMin(x.horaFim || '23:59');
    })[0];
    return b || null;
  }
  function diaFechado(data) {
    return ler().bloqueios.some(function (x) { return x.data === data && !x.ambienteId && !x.horaInicio && !x.horaFim; });
  }

  /* ---------- ocupação (apenas reservas deste navegador) ---------- */
  function ocupacao(data, hora, ambId) {
    return ler().reservas.reduce(function (s, r) {
      if (r.data !== data || r.ambienteId !== ambId) return s;
      if (hora && r.hora !== hora) return s;
      if (r.status === STATUS.CANCELADA || r.status === STATUS.NOSHOW) return s;
      return s + (+r.pessoas || 0);
    }, 0);
  }

  /* ---------- código ---------- */
  function novoCodigo(data) {
    var base = 'CB-' + String(data || hoje()).replace(/-/g, '').slice(2) + '-';
    var c, tent = 0;
    do { c = base + Math.random().toString(36).slice(2, 6).toUpperCase().replace(/[O0IL1]/g, 'X'); tent++; }
    while (getReservaPorCodigo(c) && tent < 50);
    return c;
  }

  /* ---------- reservas ---------- */
  function ordenar(l) { return l.sort(function (a, b) { return (a.data + a.hora) < (b.data + b.hora) ? 1 : -1; }); }
  function getReservas(f) {
    var l = ordenar(ler().reservas.slice());
    if (!f) return l;
    var busca = f.busca ? String(f.busca).toLowerCase() : '';
    return l.filter(function (r) {
      if (f.data && r.data !== f.data) return false;
      if (f.de && r.data < f.de) return false;
      if (f.ate && r.data > f.ate) return false;
      if (f.status && r.status !== f.status) return false;
      if (f.ambienteId && r.ambienteId !== f.ambienteId) return false;
      if (busca) {
        var alvo = (r.nome + ' ' + r.telefone + ' ' + r.email + ' ' + r.codigo).toLowerCase();
        if (alvo.indexOf(busca) < 0 && (!digits(busca) || digits(r.telefone).indexOf(digits(busca)) < 0)) return false;
      }
      return true;
    });
  }
  function getReserva(id) { return ler().reservas.filter(function (r) { return r.id === id; })[0] || null; }
  function getReservaPorCodigo(c) { return ler().reservas.filter(function (r) { return r.codigo === c; })[0] || null; }

  function validarReserva(d) {
    var e = {};
    var c = ler().config;
    if (limpar(d.nome).length < 3) e.nome = 'Informe seu nome completo.';
    if (!telValido(d.telefone)) e.telefone = 'Informe um WhatsApp com DDD, ex.: (85) 99999-9999.';
    if (!emailValido(d.email)) e.email = 'Informe um e-mail válido, ex.: nome@gmail.com.';
    var p = parseInt(d.pessoas, 10);
    if (!p || p < 1) e.pessoas = 'Informe quantas pessoas vêm.';
    else if (p > (+c.maxPessoas || 60)) e.pessoas = 'Para mais de ' + c.maxPessoas + ' pessoas, fale com a gente no WhatsApp.';
    if (!d.ambienteId || !getAmbiente(d.ambienteId)) e.ambienteId = 'Escolha onde você quer ficar.';
    if (!d.data) e.data = 'Escolha a data.';
    else if (d.data < hoje()) e.data = 'Essa data já passou.';
    else if (diaFechado(d.data)) e.data = 'Não estaremos recebendo reservas nesse dia.';
    if (!d.hora) e.hora = 'Escolha o horário.';
    else if (d.data && horarios(d.data).indexOf(d.hora) < 0) e.hora = 'Esse horário não está mais disponível.';
    if (!e.ambienteId && !e.data && !e.hora && bloqueado(d.data, d.hora, d.ambienteId)) e.ambienteId = 'Esse ambiente não está disponível nesse horário.';
    return e;
  }

  function criarReserva(d, origem) {
    var db = ler(), agora = new Date().toISOString();
    var amb = getAmbiente(d.ambienteId);
    var r = {
      id: uuid(),
      codigo: d.codigo || novoCodigo(d.data),
      nome: limpar(d.nome, 80),
      telefone: mascaraTel(d.telefone),
      email: limpar(d.email, 120).toLowerCase(),
      pessoas: Math.min(Math.max(parseInt(d.pessoas, 10) || 1, 1), 500),
      ambienteId: d.ambienteId,
      ambienteNome: amb ? amb.nome : limpar(d.ambienteNome, 80),
      data: d.data,
      hora: d.hora,
      observacoes: limpar(d.observacoes, 400),
      status: d.status || STATUS.PENDENTE,
      origem: origem || 'site',
      criadoEm: d.criadoEm || agora,
      atualizadoEm: agora,
      historico: [{ em: agora, texto: origem === 'painel' ? 'Registrada no painel' : origem === 'whatsapp' ? 'Importada da mensagem do WhatsApp' : origem === 'planilha' ? 'Trazida da planilha' : 'Solicitada pelo site' }]
    };
    db.reservas.push(r); gravar(db);
    if (origem !== 'site') avisar('reserva', r);
    return r;
  }
  function atualizarReserva(id, patch, log) {
    var db = ler(), out = null, agora = new Date().toISOString();
    db.reservas = db.reservas.map(function (r) {
      if (r.id !== id) return r;
      out = Object.assign({}, r, patch, { atualizadoEm: agora });
      if (patch.ambienteId) { var a = getAmbiente(patch.ambienteId); if (a) out.ambienteNome = a.nome; }
      out.historico = (r.historico || []).concat([{ em: agora, texto: log || 'Dados alterados' }]);
      return out;
    });
    gravar(db); if (out) avisar('reserva', out); return out;
  }
  function mudarStatus(id, st) { return atualizarReserva(id, { status: st }, 'Status: ' + st); }
  function excluirReserva(id) { var db = ler(), r = getReserva(id); db.reservas = db.reservas.filter(function (x) { return x.id !== id; }); gravar(db); if (r) avisar('excluir-reserva', r); }

  /* ---------- clientes (derivados das reservas) ---------- */
  function getClientes() {
    var m = {};
    ler().reservas.forEach(function (r) {
      var k = digits(r.telefone) || r.email; if (!k) return;
      var c = m[k] || (m[k] = { nome: r.nome, telefone: r.telefone, email: r.email, reservas: 0, pessoas: 0, cancelamentos: 0, faltas: 0, ultima: '' });
      c.reservas++; c.pessoas += +r.pessoas || 0;
      if (r.status === STATUS.CANCELADA) c.cancelamentos++;
      if (r.status === STATUS.NOSHOW) c.faltas++;
      if (r.data > c.ultima) { c.ultima = r.data; c.nome = r.nome; if (r.email) c.email = r.email; }
    });
    return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return b.reservas - a.reservas || (a.ultima < b.ultima ? 1 : -1); });
  }

  /* ---------- números ---------- */
  function resumo() {
    var h = hoje(), rs = ler().reservas;
    var ativas = function (r) { return r.status !== STATUS.CANCELADA && r.status !== STATUS.NOSHOW; };
    var doDia = rs.filter(function (r) { return r.data === h && ativas(r); });
    return {
      hoje: doDia.length,
      pessoasHoje: doDia.reduce(function (s, r) { return s + (+r.pessoas || 0); }, 0),
      pendentes: rs.filter(function (r) { return r.status === STATUS.PENDENTE && r.data >= h; }).length,
      confirmadas: rs.filter(function (r) { return r.status === STATUS.CONFIRMADA && r.data >= h; }).length,
      proximas: rs.filter(function (r) { return r.data >= h && ativas(r); })
        .sort(function (a, b) { return (a.data + a.hora) > (b.data + b.hora) ? 1 : -1; }),
      total: rs.length
    };
  }

  /* ---------- exportar / backup ---------- */
  function celula(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
  function csv(lista) {
    var rows = [['Código', 'Nome', 'WhatsApp', 'E-mail', 'Data', 'Horário', 'Pessoas', 'Local', 'Status', 'Observações', 'Criada em']];
    (lista || getReservas()).forEach(function (r) {
      rows.push([r.codigo, r.nome, r.telefone, r.email, fmtData(r.data), r.hora, r.pessoas, nomeAmbiente(r.ambienteId, r), r.status, r.observacoes, fmtCarimbo(r.criadoEm)]);
    });
    return '﻿' + rows.map(function (l) { return l.map(celula).join(';'); }).join('\r\n');
  }
  function baixar(nome, conteudo, tipo) {
    var blob = new Blob([conteudo], { type: tipo || 'text/plain;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
  }
  function exportarCSV(lista) { baixar('reservas-cumbuco-beach-' + hoje() + '.csv', csv(lista), 'text/csv;charset=utf-8'); }
  function exportarBackup() {
    var db = JSON.parse(JSON.stringify(ler())); delete db.config.senhaHash;
    baixar('backup-cumbuco-beach-' + hoje() + '.json', JSON.stringify(db, null, 2), 'application/json');
  }
  function importarBackup(txt) {
    var novo = JSON.parse(txt);
    if (!novo || !Array.isArray(novo.reservas) || !Array.isArray(novo.ambientes)) throw new Error('Este arquivo não é um backup do sistema.');
    var db = ler();
    var cods = {}; db.reservas.forEach(function (r) { cods[r.codigo] = 1; });
    var add = novo.reservas.filter(function (r) { return r && r.codigo && !cods[r.codigo]; });
    db.reservas = db.reservas.concat(add);
    db.ambientes = novo.ambientes;
    db.bloqueios = novo.bloqueios || db.bloqueios;
    var senha = db.config.senhaHash; db.config = Object.assign({}, db.config, novo.config || {}, { senhaHash: senha });
    gravar(db); return add.length;
  }

  /* ---------- aplicar dados vindos do banco (sem disparar o gancho) ---------- */
  var ultimaNuvem = '';
  function aplicarNuvem(d) {
    var db = ler();
    if (d.ambientes && d.ambientes.length) db.ambientes = d.ambientes;
    if (d.bloqueios) db.bloqueios = d.bloqueios;
    if (d.config) { var senha = db.config.senhaHash; db.config = Object.assign({}, db.config, d.config, { senhaHash: senha }); }
    if (d.reservas) db.reservas = d.reservas;
    var novo = JSON.stringify([db.ambientes, db.bloqueios, db.config, db.reservas]);
    if (novo === ultimaNuvem) return;   /* nada mudou: não redesenha */
    ultimaNuvem = novo;
    gravar(db);
  }

  /* ---------- importar texto da mensagem do WhatsApp ---------- */
  function lerMensagem(txt) {
    var t = String(txt || '').replace(/\*/g, '');
    var pega = function (rot) { var m = t.match(new RegExp(rot + '\\s*:\\s*(.+)', 'i')); return m ? m[1].trim() : ''; };
    var dataTxt = pega('Data'), iso = '';
    var m1 = dataTxt.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (m1) iso = m1[3] + '-' + m1[2] + '-' + m1[1];
    var ambNome = pega('Local');
    var amb = getAmbientes().filter(function (a) { return a.nome.toLowerCase() === ambNome.toLowerCase(); })[0];
    var horaM = (pega('Hor[aá]rio de chegada') || pega('Hor[aá]rio')).match(/(\d{1,2})[:h](\d{2})/);
    return {
      codigo: (pega('C[oó]digo').match(/CB-[A-Z0-9-]+/) || [''])[0],
      nome: pega('Nome'), telefone: pega('WhatsApp'), email: pega('E-mail'),
      pessoas: parseInt(pega('Pessoas'), 10) || '',
      ambienteId: amb ? amb.id : '', ambienteNome: ambNome,
      data: iso, hora: horaM ? pad(horaM[1]) + ':' + horaM[2] : '',
      observacoes: pega('Observa[cç][oõ]es').replace(/^—$/, '')
    };
  }

  /* ---------- acesso ao painel ---------- */
  function entrar(senha) {
    if (hash(String(senha || '')) === ler().config.senhaHash) {
      try { g.sessionStorage.setItem(SESSION_KEY, String(Date.now())); } catch (e) {}
      return true;
    }
    return false;
  }
  function trocarSenha(atual, nova) {
    var db = ler();
    if (hash(String(atual || '')) !== db.config.senhaHash) return 'A senha atual está incorreta.';
    if (String(nova || '').length < 6) return 'A nova senha precisa ter pelo menos 6 caracteres.';
    db.config.senhaHash = hash(nova); gravar(db); return '';
  }
  function senhaPadrao() { return ler().config.senhaHash === hash(SENHA_INICIAL); }
  function marcarSessao() { try { g.sessionStorage.setItem(SESSION_KEY, String(Date.now())); } catch (e) {} }
  function sair() { try { g.sessionStorage.removeItem(SESSION_KEY); } catch (e) {} }
  function logado() {
    try { var t = +g.sessionStorage.getItem(SESSION_KEY); return !!t && Date.now() - t < 12 * 3600 * 1000; } catch (e) { return false; }
  }

  g.CB = {
    CFG: CFG, STATUS: STATUS, STATUS_LIST: STATUS_LIST, STATUS_TOM: STATUS_TOM, CATEGORIAS: CATEGORIAS,
    hoje: hoje, somaDias: somaDias, fmtData: fmtData, dataExtenso: dataExtenso, fmtCarimbo: fmtCarimbo,
    mascaraTel: mascaraTel, telValido: telValido, emailValido: emailValido, digits: digits, limpar: limpar, toMin: toMin,
    getConfig: getConfig, salvarConfig: salvarConfig, horarios: horarios,
    getAmbientes: getAmbientes, getAmbiente: getAmbiente, nomeAmbiente: nomeAmbiente, salvarAmbiente: salvarAmbiente, excluirAmbiente: excluirAmbiente,
    getBloqueios: getBloqueios, salvarBloqueio: salvarBloqueio, excluirBloqueio: excluirBloqueio, bloqueado: bloqueado, diaFechado: diaFechado,
    ocupacao: ocupacao,
    getReservas: getReservas, getReserva: getReserva, getReservaPorCodigo: getReservaPorCodigo,
    validarReserva: validarReserva, criarReserva: criarReserva, atualizarReserva: atualizarReserva, mudarStatus: mudarStatus, excluirReserva: excluirReserva,
    getClientes: getClientes, resumo: resumo,
    exportarCSV: exportarCSV, exportarBackup: exportarBackup, importarBackup: importarBackup, baixar: baixar,
    slug: slug, padraoPorNome: padraoPorNome, aplicarNuvem: aplicarNuvem, definirGancho: function (fn) { gancho = fn; },
    lerMensagem: lerMensagem,
    entrar: entrar, sair: sair, marcarSessao: marcarSessao, logado: logado, trocarSenha: trocarSenha, senhaPadrao: senhaPadrao,
    aoMudar: function (fn) { g.addEventListener('cb:mudou', fn); }
  };
})(window);
