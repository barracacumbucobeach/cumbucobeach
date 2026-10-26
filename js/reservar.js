/* ============================================================
   BARRACA CUMBUCO BEACH — fluxo de reserva
   Local → Data/horário/pessoas → Dados → Revisão → WhatsApp
   ============================================================ */
function iniciarReserva() {
  'use strict';
  var CB = window.CB, W = window.CBWhats, ICO = window.ICO;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; };
  var cfg = CB.getConfig();
  var reduzir = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var st = { passo: 0, ambienteId: '', data: '', hora: '', pessoas: 2, maxPasso: 0 };
  var passos = $$('.passo-form'), etapas = $$('.etapa');

  $$('[data-cfg]').forEach(function (el) { el.textContent = (cfg[el.getAttribute('data-cfg')] || '').replace(/^0/, '').replace(':00', 'h').replace(':', 'h'); });
  $('#politica').textContent = 'Li e concordo: ' + cfg.politica;

  /* ---------- 1. locais ---------- */
  var ambs = CB.getAmbientes(true);
  $('#locais').innerHTML = CB.CATEGORIAS.map(function (c) {
    var l = ambs.filter(function (a) { return a.cat === c.id; });
    if (!l.length) return '';
    return '<div class="grupo-locais" role="radiogroup" aria-label="' + esc(c.nome) + '"><h3>' + esc(c.nome) + '</h3><div class="locais">' + l.map(cardLocal).join('') + '</div></div>';
  }).join('') + (function () {
    var sem = ambs.filter(function (a) { return !CB.CATEGORIAS.some(function (c) { return c.id === a.cat; }); });
    return sem.length ? '<div class="grupo-locais" role="radiogroup" aria-label="Outros espaços"><h3>Outros espaços</h3><div class="locais">' + sem.map(cardLocal).join('') + '</div></div>' : '';
  })();
  function cardLocal(a) {
    return '<label class="local"><input type="radio" name="ambiente" value="' + esc(a.id) + '">' +
      '<span class="local__card"><img src="' + esc(a.imagem || 'assets/logo/favicon.png') + '" alt="" loading="lazy" width="72" height="72">' +
      '<span><span class="local__nome">' + esc(a.nome) + '</span>' + (a.capacidade ? '<span class="local__cap" style="display:block">até ' + a.capacidade + ' pessoas</span>' : '') + '</span></span>' +
      '<span class="local__ok">' + ICO.check + '</span></label>';
  }
  $('#locais').addEventListener('change', function (e) {
    if (e.target.name !== 'ambiente') return;
    st.ambienteId = e.target.value; limparErro('ambienteId'); ticket();
    if (!reduzir) setTimeout(function () { if (st.passo === 0 && st.ambienteId) ir(1); }, 380);
  });

  /* ---------- 2. dias ---------- */
  var hoje = CB.hoje();
  var DIAS_VISIVEIS = 21;
  function renderDias() {
    var html = '';
    for (var i = 0; i < DIAS_VISIVEIS; i++) {
      var iso = CB.somaDias(hoje, i), p = iso.split('-'), dt = new Date(+p[0], +p[1] - 1, +p[2]);
      var fechado = CB.diaFechado(iso) || (iso === hoje && !CB.horarios(iso).length);
      var sem = i === 0 ? 'hoje' : i === 1 ? 'amanhã' : dt.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      html += '<button type="button" class="dia" data-dia="' + iso + '" aria-pressed="' + (st.data === iso) + '"' + (fechado ? ' disabled' : '') +
        ' aria-label="' + esc(CB.dataExtenso(iso)) + (fechado ? ', indisponível' : '') + '"><small>' + sem + '</small><b>' + p[2] + '</b><small>' + dt.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') + '</small></button>';
    }
    $('#dias').innerHTML = html;
  }
  var inp = $('#outra-data');
  inp.min = hoje; inp.max = CB.somaDias(hoje, +cfg.antecedenciaDias || 60);
  $('#dias').addEventListener('click', function (e) { var b = e.target.closest('.dia'); if (b && !b.disabled) escolherDia(b.getAttribute('data-dia')); });
  inp.addEventListener('change', function () { if (inp.value) escolherDia(inp.value); });
  function escolherDia(iso) {
    st.data = iso; limparErro('data');
    if (CB.diaFechado(iso)) mostrarErro('data', 'Não estaremos recebendo reservas nesse dia. Escolha outra data.');
    $$('.dia').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-dia') === iso ? 'true' : 'false'); });
    var visivel = $$('.dia').some(function (b) { return b.getAttribute('data-dia') === iso; });
    inp.value = visivel ? '' : iso;
    $('#mes-atual').textContent = CB.dataExtenso(iso);
    renderHoras(); ticket();
  }

  /* ---------- 2. horas ---------- */
  function renderHoras() {
    var box = $('#horas');
    if (!st.data) { box.innerHTML = '<div class="vazio-horas" style="grid-column:1/-1">Escolha o dia para ver os horários.</div>'; return; }
    var hs = CB.horarios(st.data);
    if (!hs.length) { box.innerHTML = '<div class="vazio-horas" style="grid-column:1/-1">Os horários de hoje já encerraram. Escolha outro dia.</div>'; st.hora = ''; ticket(); return; }
    if (st.hora && hs.indexOf(st.hora) < 0) { st.hora = ''; ticket(); }
    box.innerHTML = hs.map(function (h) {
      var bl = st.ambienteId && CB.bloqueado(st.data, h, st.ambienteId);
      return '<button type="button" class="hora" data-hora="' + h + '" aria-pressed="' + (st.hora === h) + '"' + (bl ? ' disabled aria-label="' + h + ', indisponível"' : '') + '>' + h + '</button>';
    }).join('');
  }
  $('#horas').addEventListener('click', function (e) {
    var b = e.target.closest('.hora'); if (!b || b.disabled) return;
    st.hora = b.getAttribute('data-hora'); limparErro('hora');
    $$('.hora').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    ticket();
  });

  /* ---------- 2. pessoas ---------- */
  var out = $('#pessoas'), MAX = +cfg.maxPessoas || 60;
  function setPessoas(n) {
    n = Math.max(1, Math.min(MAX, n));
    if (n === st.pessoas) { out.classList.remove('pula'); void out.offsetWidth; out.classList.add('pula'); return; }
    st.pessoas = n; limparErro('pessoas');
    out.innerHTML = n + '<small>' + (n === 1 ? 'pessoa' : 'pessoas') + '</small>';
    out.classList.remove('pula'); void out.offsetWidth; out.classList.add('pula');
    ticket();
  }
  var repetir;
  function segurar(delta) {
    setPessoas(st.pessoas + delta);
    var t = 380; clearTimeout(repetir);
    (function loop() { repetir = setTimeout(function () { setPessoas(st.pessoas + delta); t = Math.max(70, t * .8); loop(); }, t); })();
  }
  ['menos', 'mais'].forEach(function (id) {
    var b = $('#' + id), delta = id === 'mais' ? 1 : -1;
    b.addEventListener('pointerdown', function (e) { e.preventDefault(); segurar(delta); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, function () { clearTimeout(repetir); }); });
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPessoas(st.pessoas + delta); } });
  });

  /* ---------- 3. dados ---------- */
  var tel = $('#telefone');
  tel.addEventListener('input', function () { var fim = tel.selectionStart === tel.value.length; tel.value = CB.mascaraTel(tel.value); if (fim) tel.setSelectionRange(tel.value.length, tel.value.length); });
  ['nome', 'telefone', 'email'].forEach(function (k) {
    var el = $('#' + k);
    el.addEventListener('input', function () { limparErro(k); if (k === 'nome') ticket(); });
    el.addEventListener('blur', function () {
      if (!el.value.trim()) return;
      var e = CB.validarReserva(dados());
      if (e[k]) mostrarErro(k, e[k]);
    });
  });
  /* lembra nome/contato neste aparelho para a próxima reserva */
  try {
    var salvo = JSON.parse(localStorage.getItem('cumbuco_cliente') || 'null');
    if (salvo) { $('#nome').value = salvo.nome || ''; tel.value = salvo.telefone || ''; $('#email').value = salvo.email || ''; }
  } catch (e) {}

  function dados() {
    return {
      ambienteId: st.ambienteId, data: st.data, hora: st.hora, pessoas: st.pessoas,
      nome: $('#nome').value, telefone: tel.value, email: $('#email').value, observacoes: $('#observacoes').value
    };
  }

  /* ---------- erros ---------- */
  function mostrarErro(k, msg) {
    $$('[data-erro="' + k + '"]').forEach(function (el) { el.textContent = msg; });
    var c = $('[data-campo="' + k + '"]'); if (c) c.classList.add('erro');
    var input = $('#' + k); if (input) input.setAttribute('aria-invalid', 'true');
  }
  function limparErro(k) {
    $$('[data-erro="' + k + '"]').forEach(function (el) { el.textContent = ''; });
    var c = $('[data-campo="' + k + '"]'); if (c) c.classList.remove('erro');
    var input = $('#' + k); if (input) input.removeAttribute('aria-invalid');
  }
  var CAMPOS_PASSO = [['ambienteId'], ['data', 'hora', 'pessoas'], ['nome', 'telefone', 'email'], []];
  function validarPasso(n) {
    var e = CB.validarReserva(dados()), ok = true, primeiro = null;
    CAMPOS_PASSO[n].forEach(function (k) {
      if (e[k]) { mostrarErro(k, e[k]); ok = false; if (!primeiro) primeiro = k; } else limparErro(k);
    });
    if (!ok) {
      var alvo = $('#' + primeiro) || $('[data-erro="' + primeiro + '"]');
      if (alvo && alvo.focus && alvo.tagName === 'INPUT') alvo.focus();
      var painel = passos[n]; painel.classList.remove('treme'); void painel.offsetWidth; painel.classList.add('treme');
    }
    return ok;
  }

  /* ---------- navegação ---------- */
  function ir(n, focar) {
    var voltando = n < st.passo;
    st.passo = n; st.maxPasso = Math.max(st.maxPasso, n);
    passos.forEach(function (p, i) { p.classList.toggle('ativo', i === n); p.classList.toggle('volta', i === n && voltando); p.classList.remove('treme'); });
    etapas.forEach(function (e, i) {
      e.classList.toggle('atual', i === n); e.classList.toggle('feita', i < n);
      var b = e.querySelector('button'); b.disabled = i > st.maxPasso; if (i === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    $('#etapa-txt').innerHTML = '<span>Etapa ' + (n + 1) + ' de 4 · </span>' + etapas[n].querySelector('.etapa__nome').textContent;
    $('#voltar').hidden = n === 0;
    var av = $('#avancar');
    av.className = n === 3 ? 'btn btn--zap' : 'btn';
    av.innerHTML = n === 3 ? ICO.zap + 'Enviar reserva pelo WhatsApp' : 'Continuar ' + ICO.seta;
    if (n === 1) { if (!st.data) { var primeiro = $('.dia:not(:disabled)'); if (primeiro) escolherDia(primeiro.getAttribute('data-dia')); } renderHoras(); }
    if (n === 3) revisao();
    var topoForm = $('#form').getBoundingClientRect().top + window.scrollY - 96;
    if (window.scrollY > topoForm) window.scrollTo({ top: topoForm, behavior: reduzir ? 'auto' : 'smooth' });
    if (focar !== false) { var h = passos[n].querySelector('h2'); if (h) h.focus({ preventScroll: true }); }
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  }
  $('#voltar').addEventListener('click', function () { if (st.passo > 0) ir(st.passo - 1); });
  $('#etapas').addEventListener('click', function (e) {
    var b = e.target.closest('[data-ir]'); if (!b || b.disabled) return;
    var alvo = +b.getAttribute('data-ir');
    if (alvo > st.passo) { for (var i = st.passo; i < alvo; i++) if (!validarPasso(i)) return ir(i); }
    ir(alvo);
  });

  $('#form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (st.passo < 3) { if (validarPasso(st.passo)) ir(st.passo + 1); return; }
    enviar();
  });

  /* ---------- revisão ---------- */
  function revisao() {
    var d = dados(), a = CB.getAmbiente(d.ambienteId) || {};
    var linha = function (rot, val, passo, cheio) { return '<div' + (cheio ? ' class="cheio"' : '') + '><dt>' + rot + ' <button type="button" class="revisao__editar" data-ir="' + passo + '">alterar</button></dt><dd>' + esc(val) + '</dd></div>'; };
    $('#revisao').innerHTML =
      '<div class="revisao__foto">' + (a.imagem ? '<img src="' + esc(a.imagem) + '" alt="">' : '') + '<span>' + esc(a.nome || '') + '</span></div><dl>' +
      linha('Data', CB.dataExtenso(d.data), 1) + linha('Horário', d.hora, 1) +
      linha('Pessoas', d.pessoas + (d.pessoas === 1 ? ' pessoa' : ' pessoas'), 1) + linha('Nome', CB.limpar(d.nome), 2) +
      linha('WhatsApp', CB.mascaraTel(d.telefone), 2) + linha('E-mail', d.email.trim(), 2) +
      (d.observacoes.trim() ? linha('Observações', CB.limpar(d.observacoes, 400), 2, true) : '') + '</dl>';
  }
  $('#revisao').addEventListener('click', function (e) { var b = e.target.closest('[data-ir]'); if (b) ir(+b.getAttribute('data-ir')); });
  $('#aceite').addEventListener('change', function () { $('#erro-final').textContent = ''; });

  /* ---------- envio ---------- */
  var enviando = false;
  function enviar() {
    if (enviando) return;
    var d = dados(), e = CB.validarReserva(d);
    var chaves = Object.keys(e);
    if (chaves.length) {
      var passo = CAMPOS_PASSO.findIndex(function (l) { return l.indexOf(chaves[0]) >= 0; });
      ir(passo < 0 ? 0 : passo); validarPasso(passo < 0 ? 0 : passo); return;
    }
    if (!$('#aceite').checked) {
      $('#erro-final').textContent = 'Marque a caixa acima para confirmar que leu as condições da reserva.';
      $('#aceite').focus(); return;
    }
    enviando = true;
    var r = CB.criarReserva(d, 'site');
    try { localStorage.setItem('cumbuco_cliente', JSON.stringify({ nome: r.nome, telefone: r.telefone, email: r.email })); } catch (x) {}
    var abriu = W.abrir(W.linkReserva(r));          /* 1º: WhatsApp (sempre) */
    if (window.CBNuvem) window.CBNuvem.enviarReserva(r); /* 2º: painel, em segundo plano */
    location.href = 'sucesso.html?c=' + encodeURIComponent(r.codigo) + (abriu ? '&w=1' : '');
  }

  /* ---------- resumo lateral ---------- */
  var ultimo = {};
  function setTk(id, val, vazio) {
    var el = $('#tk-' + id); if (!el) return;
    var txt = val || vazio;
    if (ultimo[id] === txt) return; ultimo[id] = txt;
    el.textContent = txt; el.classList.toggle('vazio', !val);
    el.classList.remove('muda'); void el.offsetWidth; el.classList.add('muda');
  }
  function ticket() {
    var a = CB.getAmbiente(st.ambienteId);
    setTk('local', a && a.nome, 'a escolher');
    setTk('data', st.data && CB.dataExtenso(st.data, true), 'a escolher');
    setTk('hora', st.hora, 'a escolher');
    setTk('pessoas', String(st.pessoas), '');
    setTk('nome', CB.limpar($('#nome').value, 40), '—');
    var img = $('#tk-img');
    if (a && a.imagem && img.getAttribute('src') !== a.imagem) {
      img.classList.remove('on'); img.onload = function () { img.classList.add('on'); }; img.src = a.imagem;
    }
  }

  /* ---------- início ---------- */
  renderDias();
  var q = new URLSearchParams(location.search).get('local');
  var ambQ = q ? CB.getAmbiente(q) : null;
  if (ambQ) {
    var r = $$('input[name="ambiente"]').filter(function (x) { return x.value === ambQ.id; })[0];
    if (r) { r.checked = true; st.ambienteId = ambQ.id; st.maxPasso = 1; }
  }
  ticket();
  ir(st.ambienteId ? 1 : 0, false);
}

/* espera os locais e horários do banco por no máximo 2,5 s; depois segue com o que tem */
(function () {
  var iniciou = false;
  function vai() { if (iniciou) return; iniciou = true; iniciarReserva(); }
  var p = window.CBNuvem ? window.CBNuvem.publico : Promise.resolve();
  p.then(vai, vai);
  setTimeout(vai, 2500);
})();
