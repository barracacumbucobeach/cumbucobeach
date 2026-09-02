/* ============================================================
   BARRACA CUMBUCO BEACH — camada única de armazenamento
   Toda leitura/gravação do sistema passa por aqui (window.CB).
   Para migrar para backend real, reescreva SOMENTE este arquivo
   (mesmas assinaturas, retornando dados da API).
   ============================================================ */
(function (global) {
  'use strict';

  var DB_KEY = 'cumbuco_beach_db_v1';
  var SESSION_KEY = 'cumbuco_beach_admin_session';

  var STATUS = {
    PENDENTE: 'AGUARDANDO CONFIRMAÇÃO',
    CONFIRMADA: 'CONFIRMADA',
    CANCELADA: 'CANCELADA',
    CHEGOU: 'CLIENTE CHEGOU',
    CONCLUIDA: 'CONCLUÍDA',
    NOSHOW: 'NÃO COMPARECEU'
  };
  var STATUS_LIST = [STATUS.PENDENTE, STATUS.CONFIRMADA, STATUS.CANCELADA, STATUS.CHEGOU, STATUS.CONCLUIDA, STATUS.NOSHOW];
  var STATUS_COLOR = {};
  STATUS_COLOR[STATUS.PENDENTE] = '#B7791F';
  STATUS_COLOR[STATUS.CONFIRMADA] = '#17706F';
  STATUS_COLOR[STATUS.CANCELADA] = '#9B3B34';
  STATUS_COLOR[STATUS.CHEGOU] = '#2F6F4F';
  STATUS_COLOR[STATUS.CONCLUIDA] = '#4A5A5B';
  STATUS_COLOR[STATUS.NOSHOW] = '#6B4A6B';

  function uid(p) { return (p || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* identificador compatível com o banco (colunas uuid) */
  function uuid() {
    if (global.crypto && global.crypto.randomUUID) return global.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : ((r & 0x3) | 0x8)).toString(16);
    });
  }

  var DEFAULT_SPACES = [
    { nome: 'Salão Coberto Entrada', descricao: 'Salão coberto logo na entrada da barraca, prático para chegar e sentar.', imagem: 'assets/images/ambientes/salao-coberto-entrada.jpeg', capacidade: 90 },
    { nome: 'Salão Coberto Central', descricao: 'Espaço coberto central, indicado para grupos menores e famílias.', imagem: 'assets/images/ambientes/salao-coberto-central.jpeg', capacidade: 50 },
    { nome: 'Salão Coberto Central — Caminho da Praia', descricao: 'Salão coberto no caminho da praia, entre a estrutura da barraca e a areia.', imagem: 'assets/images/ambientes/salao-coberto-central-caminho-praia.jpeg', capacidade: 122 },
    { nome: 'Salão Coberto Praia Piscina', descricao: 'Área coberta junto à piscina, com sombra e movimento da barraca por perto.', imagem: 'assets/images/ambientes/salao-coberto-praia-piscina.jpeg', capacidade: 122 },
    { nome: 'Tendas Praia', descricao: 'Tendas praia 1 e 2, na faixa de areia — 6 lugares em cada tenda.', imagem: 'assets/images/ambientes/tendas.jpeg', capacidade: 12 },
    { nome: 'Tendas Central', descricao: 'Tendas central 1 e 2, na área central da barraca — 6 lugares em cada tenda.', imagem: 'assets/images/ambientes/tendas.jpeg', capacidade: 12 },
    { nome: 'Tendas Superior', descricao: 'Tendas superior 1 e 2, na parte alta, com vista ampla do mar — 6 lugares em cada tenda.', imagem: 'assets/images/ambientes/tendas.jpeg', capacidade: 12 },
    { nome: 'Mesas Praia Sol Nascente', descricao: 'Mesas na areia no lado nascente, sob cobertura, de frente para o mar.', imagem: 'assets/images/ambientes/mesas-praia-sol-nascente.jpeg', capacidade: 140 },
    { nome: 'Mesas Praia Central', descricao: 'Mesas na areia em posição central, com acesso direto ao mar.', imagem: 'assets/images/ambientes/mesas-praia-central.jpeg', capacidade: 140 },
    { nome: 'Mesas Praia Sol Poente', descricao: 'Mesas na areia no lado poente, opção para acompanhar o pôr do sol.', imagem: 'assets/images/ambientes/mesas-praia-sol-poente.jpeg', capacidade: 140 }
  ];

  /* padrão local por nome — usado como reserva quando o cadastro do banco
     ainda não tem foto ou capacidade preenchida */
  function chave(n) {
    return String(n || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function defaultSpaceByName(nome) {
    var alvo = chave(nome);
    return DEFAULT_SPACES.filter(function (s) { return chave(s.nome) === alvo; })[0] || null;
  }

  var DEFAULT_SETTINGS = {
    nome: 'Barraca Cumbuco Beach',
    endereco: 'Av. Central, 49 - Tabuba, Caucaia - CE, 61618-015',
    whatsapp: '(85) 98177-7390',
    whatsappNumero: '5585981777390',
    horaInicio: '09:00',
    horaFim: '14:30',
    intervalo: 30,
    msgConfirmacao: 'Sua reserva na Barraca Cumbuco Beach está CONFIRMADA. Até logo!',
    msgCancelamento: 'Sua reserva na Barraca Cumbuco Beach foi cancelada. Qualquer dúvida, fale com a gente pelo WhatsApp.',
    politica: 'A reserva é uma solicitação e só é válida após confirmação da equipe. Tolerância de 20 minutos após o horário reservado. Cancelamentos devem ser informados pelo WhatsApp.'
  };

  /* Chaves que NUNCA podem ficar nas configurações: elas são lidas
     publicamente pelo site e gravadas no banco compartilhado. */
  var CHAVES_PROIBIDAS = ['adminUser', 'adminPass', 'senha', 'password', 'token', 'apiKey', 'serviceKey'];
  function limparSensiveis(obj) {
    if (!obj) return obj;
    CHAVES_PROIBIDAS.forEach(function (k) { delete obj[k]; });
    return obj;
  }

  /* Texto vindo do usuário: sem caracteres de controle e com tamanho limitado.
     A escrita no DOM já usa textContent; isto é uma segunda barreira. */
  function limparTexto(v, max) {
    return String(v == null ? '' : v)
      .replace(/[\u0000-\u001F\u007F\u200B-\u200D\uFEFF]/g, ' ')
      .trim()
      .slice(0, max || 200);
  }

  function defaultDB() {
    var spaces = DEFAULT_SPACES.map(function (s, i) {
      return { id: uuid(), nome: s.nome, descricao: s.descricao, imagem: s.imagem || '', capacidade: s.capacidade || 0, ativo: true, ordem: i + 1 };
    });
    return {
      versao: 1,
      settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
      spaces: spaces,
      reservations: [],
      customers: [],
      blocks: [],
      waitlist: []
    };
  }

  var _cache = null;

  function read() {
    if (_cache) return _cache;
    try {
      var raw = global.localStorage.getItem(DB_KEY);
      _cache = raw ? JSON.parse(raw) : defaultDB();
    } catch (e) { _cache = defaultDB(); }
    if (!_cache.spaces || !_cache.spaces.length) _cache.spaces = defaultDB().spaces;
    if (!_cache.settings) _cache.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    ['reservations', 'customers', 'blocks', 'waitlist'].forEach(function (k) { if (!_cache[k]) _cache[k] = []; });
    return _cache;
  }

  function write(db) {
    _cache = db;
    try { global.localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) {}
    try { global.dispatchEvent(new CustomEvent('cb:changed')); } catch (e) {}
    return db;
  }

  /* ---------- utilidades de data / texto ---------- */
  function todayISO() {
    var d = new Date(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }
  function fmtDate(iso) {
    if (!iso) return '';
    var p = String(iso).split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
  }
  function fmtStamp(d) {
    d = d ? new Date(d) : new Date();
    var p = function (n) { return String(n).padStart(2, '0'); };
    return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function maskPhone(v) {
    var d = String(v || '').replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  function validPhone(v) { return String(v || '').replace(/\D/g, '').length >= 10; }
  function validEmail(v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function digits(v) { return String(v || '').replace(/\D/g, ''); }

  /* ---------- horários ---------- */
  /* Lista de horários. Passando a data, os horários que já passaram no dia de
     hoje ficam de fora — o cliente só vê o que ainda é possível atender. */
  function getTimeSlots(data) {
    var s = getSettings();
    var toMin = function (t) { var p = String(t).split(':'); return (+p[0]) * 60 + (+p[1] || 0); };
    var start = toMin(s.horaInicio || '09:00'), end = toMin(s.horaFim || '14:30'), step = Math.max(5, +s.intervalo || 30);
    var min = -1;
    if (data && data === todayISO()) {
      var agora = new Date();
      min = agora.getHours() * 60 + agora.getMinutes();
    }
    var out = [];
    for (var m = start; m <= end; m += step) {
      if (m <= min) continue;
      out.push(String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'));
    }
    return out;
  }

  /* ---------- configurações ---------- */
  /* Ajuste do limite de reserva (14:30). Configurações antigas gravadas com o fim
     em 17:00 e sem passagem pelo painel são corrigidas na leitura; qualquer valor
     salvo depois disso pelo administrador prevalece. */
  function aplicarLimite(s) {
    if (!s || s.limiteRevisado) return s;
    if ((s.horaFim || '') === '17:00') { s = Object.assign({}, s, { horaFim: '14:30' }); }
    return s;
  }
  function getSettings() { return aplicarLimite(limparSensiveis(read().settings)); }
  function saveSettings(patch) {
    var db = read();
    db.settings = limparSensiveis(Object.assign({}, db.settings, limparSensiveis(patch || {})));
    db.settings.limiteRevisado = true;
    db.settings.whatsappNumero = '55' + digits(db.settings.whatsapp);
    return write(db).settings;
  }

  /* ---------- ambientes ---------- */
  function getSpaces(onlyActive) {
    var list = read().spaces.slice().sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
    return onlyActive ? list.filter(function (s) { return s.ativo; }) : list;
  }
  function getSpaceById(id) { return read().spaces.filter(function (s) { return s.id === id; })[0] || null; }
  function spaceName(id) { var s = getSpaceById(id); return s ? s.nome : '—'; }
  function saveSpace(space) {
    var db = read();
    if (space.id) {
      db.spaces = db.spaces.map(function (s) { return s.id === space.id ? Object.assign({}, s, space) : s; });
    } else {
      space.id = uuid();
      space.ordem = space.ordem || db.spaces.length + 1;
      if (space.ativo === undefined) space.ativo = true;
      db.spaces.push(space);
    }
    write(db);
    return space;
  }
  function deleteSpace(id) {
    var db = read();
    db.spaces = db.spaces.filter(function (s) { return s.id !== id; });
    return write(db);
  }

  /* ---------- bloqueios ---------- */
  function getBlocks() { return read().blocks.slice(); }
  function saveBlock(b) {
    var db = read();
    b.id = b.id || uuid();
    var found = false;
    db.blocks = db.blocks.map(function (x) { if (x.id === b.id) { found = true; return Object.assign({}, x, b); } return x; });
    if (!found) db.blocks.push(b);
    write(db);
    return b;
  }
  function deleteBlock(id) {
    var db = read();
    db.blocks = db.blocks.filter(function (b) { return b.id !== id; });
    return write(db);
  }
  function isBlocked(data, hora, ambienteId) {
    var toMin = function (t) { var p = String(t || '0:0').split(':'); return (+p[0]) * 60 + (+p[1] || 0); };
    var h = toMin(hora);
    var hit = getBlocks().filter(function (b) {
      if (b.data !== data) return false;
      if (b.ambienteId && ambienteId && b.ambienteId !== ambienteId) return false;
      if (!b.horaInicio && !b.horaFim) return true;
      return h >= toMin(b.horaInicio || '00:00') && h <= toMin(b.horaFim || '23:59');
    })[0];
    return hit ? { blocked: true, motivo: hit.motivo || 'Período bloqueado' } : { blocked: false };
  }

  /* ---------- capacidade / disponibilidade ---------- */
  function ocupacao(data, hora, ambienteId) {
    return read().reservations.reduce(function (acc, r) {
      if (r.data !== data || r.hora !== hora || r.ambienteId !== ambienteId) return acc;
      if (r.status === STATUS.CANCELADA || r.status === STATUS.NOSHOW) return acc;
      return acc + (+r.pessoas || 0);
    }, 0);
  }
  function checkAvailability(data, hora, ambienteId, pessoas) {
    var sp = getSpaceById(ambienteId);
    if (!sp || !sp.ativo) return { ok: false, motivo: 'Ambiente indisponível.' };
    var blk = isBlocked(data, hora, ambienteId);
    if (blk.blocked) return { ok: false, motivo: blk.motivo };
    var cap = +sp.capacidade || 0;
    var usado = ocupacao(data, hora, ambienteId);
    if (cap > 0 && usado + (+pessoas || 0) > cap) {
      return { ok: false, motivo: 'Este ambiente não está disponível neste horário.', ocupado: usado, capacidade: cap };
    }
    return { ok: true, ocupado: usado, capacidade: cap, restante: cap > 0 ? cap - usado : null };
  }

  /* ---------- código da reserva ---------- */
  function nextCode(data) {
    var base = 'CB-' + String(data || todayISO()).replace(/-/g, '') + '-';
    var n = read().reservations.filter(function (r) { return r.codigo && r.codigo.indexOf(base) === 0; })
      .map(function (r) { return +r.codigo.split('-')[2] || 0; });
    var seq = (n.length ? Math.max.apply(null, n) : 0) + 1;
    var code = base + String(seq).padStart(5, '0');
    while (getReservationByCode(code)) { seq++; code = base + String(seq).padStart(5, '0'); }
    return code;
  }

  /* ---------- reservas ---------- */
  function getReservations(filter) {
    var list = read().reservations.slice().sort(function (a, b) {
      return (a.data + a.hora) < (b.data + b.hora) ? 1 : -1;
    });
    if (!filter) return list;
    return list.filter(function (r) {
      if (filter.data && r.data !== filter.data) return false;
      if (filter.status && r.status !== filter.status) return false;
      if (filter.ambienteId && r.ambienteId !== filter.ambienteId) return false;
      if (filter.nome && String(r.nome).toLowerCase().indexOf(String(filter.nome).toLowerCase()) < 0) return false;
      if (filter.telefone && digits(r.telefone).indexOf(digits(filter.telefone)) < 0) return false;
      // atendimentos concluídos saem da lista de trabalho; ficam nos relatórios
      if (filter.ocultarConcluidas && STATUS && r.status === STATUS.CONCLUIDA) return false;
      return true;
    });
  }
  function getReservationById(id) { return read().reservations.filter(function (r) { return r.id === id; })[0] || null; }
  function getReservationByCode(c) { return read().reservations.filter(function (r) { return r.codigo === c; })[0] || null; }

  function saveReservation(data) {
    var db = read();
    var now = new Date().toISOString();
    var r = {
      id: uuid(),
      codigo: nextCode(data.data),
      nome: limparTexto(data.nome, 80),
      telefone: maskPhone(data.telefone),
      email: limparTexto(data.email, 120),
      data: data.data,
      hora: data.hora,
      pessoas: Math.min(Math.max(parseInt(data.pessoas, 10) || 1, 1), 500),
      ambienteId: data.ambienteId,
      observacoes: limparTexto(data.observacoes, 500),
      status: STATUS.PENDENTE,
      demo: !!data.demo,
      createdAt: now,
      updatedAt: now,
      historico: [{ em: now, texto: 'Reserva criada' }]
    };
    db.reservations.push(r);
    write(db);
    saveCustomer({ nome: r.nome, telefone: r.telefone, email: r.email });
    try { global.localStorage.setItem('cumbuco_last_code', r.codigo); } catch (e) {}
    return r;
  }

  function updateReservation(id, patch, logTexto) {
    var db = read();
    var out = null;
    db.reservations = db.reservations.map(function (r) {
      if (r.id !== id) return r;
      var now = new Date().toISOString();
      var next = Object.assign({}, r, patch, { updatedAt: now });
      next.historico = (r.historico || []).concat([{ em: now, texto: logTexto || 'Reserva atualizada' }]);
      out = next;
      return next;
    });
    write(db);
    return out;
  }
  /* O horário de chegada e de saída fica registrado no histórico da reserva
     (que é gravado no banco), e os relatórios leem de lá. */
  function setStatus(id, status) {
    return updateReservation(id, { status: status }, 'Status alterado para ' + status);
  }
  /* Devolve o instante em que a reserva entrou num status, lendo o histórico. */
  function statusEm(r, status) {
    var alvo = 'Status alterado para ' + status;
    var achou = (r.historico || []).filter(function (h) { return h.texto === alvo; }).pop();
    return achou ? achou.em : null;
  }
  function deleteReservation(id) {
    var db = read();
    db.reservations = db.reservations.filter(function (r) { return r.id !== id; });
    return write(db);
  }

  /* ---------- clientes ---------- */
  function getCustomers() {
    var res = read().reservations;
    return read().customers.slice().map(function (c) {
      var meus = res.filter(function (r) { return digits(r.telefone) === digits(c.telefone); });
      return Object.assign({}, c, {
        reservas: meus.length,
        cancelamentos: meus.filter(function (r) { return r.status === STATUS.CANCELADA; }).length,
        noshows: meus.filter(function (r) { return r.status === STATUS.NOSHOW; }).length,
        ultima: meus.map(function (r) { return r.data; }).sort().pop() || ''
      });
    }).sort(function (a, b) { return b.reservas - a.reservas; });
  }
  function saveCustomer(c) {
    var db = read();
    var key = digits(c.telefone);
    var found = db.customers.filter(function (x) { return digits(x.telefone) === key; })[0];
    if (found) {
      found.nome = c.nome || found.nome;
      found.email = c.email || found.email;
    } else {
      db.customers.push({ id: uuid(), nome: c.nome, telefone: maskPhone(c.telefone), email: c.email || '', createdAt: new Date().toISOString() });
    }
    write(db);
    return found || c;
  }

  /* ---------- lista de espera ---------- */
  function getWaitlist() { return read().waitlist.slice().reverse(); }
  function saveWaitlist(w) {
    var db = read();
    w.id = uuid();
    w.createdAt = new Date().toISOString();
    db.waitlist.push(w);
    write(db);
    return w;
  }
  function deleteWaitlist(id) {
    var db = read();
    db.waitlist = db.waitlist.filter(function (w) { return w.id !== id; });
    return write(db);
  }

  /* ---------- relatórios ---------- */
  function report() {
    var res = read().reservations;
    var group = function (keyFn) {
      var m = {};
      res.forEach(function (r) { var k = keyFn(r); m[k] = (m[k] || 0) + 1; });
      return Object.keys(m).sort().map(function (k) { return { chave: k, valor: m[k] }; });
    };
    return {
      total: res.length,
      pessoas: res.reduce(function (a, r) { return a + (+r.pessoas || 0); }, 0),
      porDia: group(function (r) { return r.data; }),
      porAmbiente: group(function (r) { return spaceName(r.ambienteId); }),
      porHora: group(function (r) { return r.hora; }),
      cancelamentos: res.filter(function (r) { return r.status === STATUS.CANCELADA; }).length,
      noshows: res.filter(function (r) { return r.status === STATUS.NOSHOW; }).length
    };
  }
  function dashboard() {
    var hoje = todayISO(), res = read().reservations;
    var doDia = res.filter(function (r) { return r.data === hoje; });
    return {
      hoje: doDia.length,
      pendentes: res.filter(function (r) { return r.status === STATUS.PENDENTE; }).length,
      confirmadas: res.filter(function (r) { return r.status === STATUS.CONFIRMADA; }).length,
      canceladas: res.filter(function (r) { return r.status === STATUS.CANCELADA; }).length,
      pessoasHoje: doDia.reduce(function (a, r) { return a + (+r.pessoas || 0); }, 0),
      proximas: res.filter(function (r) { return r.data >= hoje && r.status !== STATUS.CANCELADA; })
        .sort(function (a, b) { return (a.data + a.hora) > (b.data + b.hora) ? 1 : -1; }).slice(0, 6)
    };
  }

  /* ---------- CSV / backup ---------- */
  function csvCell(v) { return '"' + String(v === undefined || v === null ? '' : v).replace(/"/g, '""') + '"'; }
  function reservationsCSV(list) {
    var rows = [['Codigo', 'Nome', 'Telefone', 'Data', 'Hora', 'Pessoas', 'Ambiente', 'Status', 'Observacoes']];
    (list || getReservations()).forEach(function (r) {
      rows.push([r.codigo, r.nome, r.telefone, fmtDate(r.data), r.hora, r.pessoas, spaceName(r.ambienteId), r.status, r.observacoes]);
    });
    return '\uFEFF' + rows.map(function (row) { return row.map(csvCell).join(';'); }).join('\r\n');
  }
  function download(filename, content, mime) {
    var blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    var a = global.document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    global.document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  function exportCSV(list) { download('reservas-cumbuco-beach.csv', reservationsCSV(list), 'text/csv;charset=utf-8'); }
  function exportBackup() { download('backup-cumbuco-beach.json', JSON.stringify(read(), null, 2), 'application/json'); }
  function importBackup(json) {
    var db = JSON.parse(json);
    if (!db || !db.spaces || !db.reservations) throw new Error('Arquivo de backup inválido.');
    write(db);
    return db;
  }
  function resetAll() { return write(defaultDB()); }

  /* ---------- dados de demonstração ---------- */
  function seedDemo() {
    var db = read();
    var sp = getSpaces(true);
    var d = new Date();
    var iso = function (off) {
      var x = new Date(d.getTime() + off * 86400000);
      return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
    };
    var demos = [
      { nome: 'Ana Ribeiro (DEMO)', telefone: '(85) 98888-1010', data: iso(0), hora: '12:00', pessoas: 6, i: 0, status: STATUS.CONFIRMADA },
      { nome: 'Marcos Lima (DEMO)', telefone: '(85) 98888-2020', data: iso(0), hora: '13:30', pessoas: 4, i: 4, status: STATUS.PENDENTE },
      { nome: 'Família Souza (DEMO)', telefone: '(85) 98888-3030', data: iso(1), hora: '11:00', pessoas: 10, i: 1, status: STATUS.CONFIRMADA },
      { nome: 'Juliana Alves (DEMO)', telefone: '(85) 98888-4040', data: iso(2), hora: '16:00', pessoas: 2, i: 7, status: STATUS.PENDENTE },
      { nome: 'Rafael Costa (DEMO)', telefone: '(85) 98888-5050', data: iso(3), hora: '17:30', pessoas: 8, i: 3, status: STATUS.CANCELADA },
      { nome: 'Bruna Melo (DEMO)', telefone: '(85) 98888-6060', data: iso(-1), hora: '12:30', pessoas: 5, i: 6, status: STATUS.NOSHOW }
    ];
    demos.forEach(function (x) {
      var amb = sp[x.i] || sp[0];
      var r = saveReservation({ nome: x.nome, telefone: x.telefone, email: '', data: x.data, hora: x.hora, pessoas: x.pessoas, ambienteId: amb.id, observacoes: 'Registro de demonstração.', demo: true });
      if (x.status !== STATUS.PENDENTE) setStatus(r.id, x.status);
    });
    return getReservations();
  }
  function hasDemo() { return read().reservations.some(function (r) { return r.demo; }); }
  function clearDemo() {
    var db = read();
    db.reservations = db.reservations.filter(function (r) { return !r.demo; });
    db.customers = db.customers.filter(function (c) { return String(c.nome).indexOf('(DEMO)') < 0; });
    return write(db);
  }

  /* ---------- autenticação ----------
     Com o banco compartilhado ativo (js/cloud.js) quem autentica é o
     Supabase: nenhuma senha existe neste código. A senha local abaixo só
     funciona no modo offline, sem banco, para demonstração. */
  var SENHA_DEMO_LOCAL = 'cumbuco-demo';
  function nuvemAtiva() {
    var c = global.CB_SUPABASE || {};
    return !!(c.url && c.anonKey && String(c.url).indexOf('SUA-') < 0);
  }
  function login(user, pass) {
    if (nuvemAtiva()) {
      global.CB.ultimoErroLogin = 'Entre com o e-mail e a senha cadastrados no banco (Supabase).';
      return false;
    }
    if (String(user || '').trim().toLowerCase() === 'admin' && pass === SENHA_DEMO_LOCAL) {
      try { global.sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
      return true;
    }
    return false;
  }
  /* Ao sair, o cache local de dados pessoais é apagado: num computador
     compartilhado ninguém encontra nome/telefone de clientes depois. */
  function logout() {
    try { global.sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    try {
      var db = read();
      db.reservations = [];
      db.customers = [];
      db.waitlist = [];
      write(db);
    } catch (e) {}
  }
  function isLogged() { try { return global.sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; } }
  function requireAuth() {
    if (!isLogged()) { global.location.replace('admin-login.html'); return false; }
    return true;
  }

  global.CB = {
    STATUS: STATUS, STATUS_LIST: STATUS_LIST, STATUS_COLOR: STATUS_COLOR,
    todayISO: todayISO, fmtDate: fmtDate, fmtStamp: fmtStamp, maskPhone: maskPhone,
    validPhone: validPhone, validEmail: validEmail, digits: digits, uid: uid,
    getTimeSlots: getTimeSlots,
    getSettings: getSettings, saveSettings: saveSettings,
    getSpaces: getSpaces, getSpaceById: getSpaceById, spaceName: spaceName, saveSpace: saveSpace, deleteSpace: deleteSpace,
    defaultSpaceByName: defaultSpaceByName,
    getBlocks: getBlocks, saveBlock: saveBlock, deleteBlock: deleteBlock, isBlocked: isBlocked,
    ocupacao: ocupacao, checkAvailability: checkAvailability,
    getReservations: getReservations, getReservationById: getReservationById, getReservationByCode: getReservationByCode,
    saveReservation: saveReservation, updateReservation: updateReservation, setStatus: setStatus, statusEm: statusEm, deleteReservation: deleteReservation,
    getCustomers: getCustomers, saveCustomer: saveCustomer,
    getWaitlist: getWaitlist, saveWaitlist: saveWaitlist, deleteWaitlist: deleteWaitlist,
    report: report, dashboard: dashboard,
    reservationsCSV: reservationsCSV, exportCSV: exportCSV, exportBackup: exportBackup, importBackup: importBackup,
    download: download, resetAll: resetAll,
    seedDemo: seedDemo, clearDemo: clearDemo, hasDemo: hasDemo,
    login: login, logout: logout, isLogged: isLogged, requireAuth: requireAuth,
    /* usados pela camada de banco compartilhado (js/cloud.js) */
    __db: read, __replace: write,
    onChange: function (fn) { global.addEventListener('cb:changed', fn); return function () { global.removeEventListener('cb:changed', fn); }; }
  };
})(window);
