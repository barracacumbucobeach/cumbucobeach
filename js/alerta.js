/* Aviso de reserva nova no painel: som curto + notificação do navegador + faixa na tela. */
(function (global) {
  'use strict';
  if (global.CBAlerta) return;

  var VISTAS = 'cb_reservas_vistas';
  var LIGADO = 'cb_alerta_som';
  var conhecidas = null;
  var ctx = null;

  function somLigado() { return global.localStorage.getItem(LIGADO) !== '0'; }
  function alternarSom(v) { global.localStorage.setItem(LIGADO, v ? '1' : '0'); }

  /* dois toques suaves, gerados na hora — sem arquivo de áudio */
  function tocar() {
    if (!somLigado()) return;
    try {
      ctx = ctx || new (global.AudioContext || global.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      [0, 0.22].forEach(function (atraso, i) {
        var t = ctx.currentTime + atraso;
        var osc = ctx.createOscillator();
        var vol = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(i ? 1046 : 784, t);
        vol.gain.setValueAtTime(0.0001, t);
        vol.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
        vol.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        osc.connect(vol).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.22);
      });
    } catch (e) {}
  }

  function notificar(r) {
    if (!('Notification' in global) || Notification.permission !== 'granted') return;
    try {
      var n = new Notification('Nova reserva — Barraca Cumbuco Beach', {
        body: r.nome + ' · ' + r.pessoas + ' pessoa(s) · ' + r.hora,
        icon: './assets/logo/favicon.png',
        tag: r.id
      });
      n.onclick = function () {
        global.focus();
        global.location.href = './admin-reservas.dc.html?reserva=' + encodeURIComponent(r.codigo);
      };
    } catch (e) {}
  }

  function linhaInfo(rotulo, valor) {
    var l = global.document.createElement('div');
    l.style.cssText = 'display:flex;justify-content:space-between;gap:14px;padding:9px 0;border-bottom:1px solid rgba(247,238,218,.16)';
    var a = global.document.createElement('span');
    a.textContent = rotulo;
    a.style.cssText = 'font-size:11px;letter-spacing:.1em;font-weight:700;color:rgba(247,238,218,.62)';
    var b = global.document.createElement('strong');
    b.textContent = valor;
    b.style.cssText = 'font-size:15px;font-weight:600;text-align:right';
    l.appendChild(a); l.appendChild(b);
    return l;
  }

  /* Cartão grande no centro da tela: o administrador vê a reserva de longe
     e um clique abre a tela com as opções de confirmar. */
  function faixa(r) {
    var amb = global.CB && global.CB.spaceName ? global.CB.spaceName(r.ambienteId) : '';
    var data = global.CB && global.CB.fmtDate ? global.CB.fmtDate(r.data) : r.data;

    var fundo = global.document.createElement('div');
    fundo.setAttribute('role', 'alertdialog');
    fundo.setAttribute('aria-label', 'Nova reserva recebida');
    fundo.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(18,48,63,.55);backdrop-filter:blur(3px);' +
      'display:flex;align-items:center;justify-content:center;padding:20px;transition:opacity .3s;' +
      "font-family:'Instrument Sans',Helvetica,Arial,sans-serif";

    var el = global.document.createElement('div');
    el.style.cssText = 'width:100%;max-width:430px;background:#16506A;color:#F7EEDA;border-top:7px solid #E96A2B;' +
      'border-radius:20px;padding:26px 26px 22px;box-shadow:0 30px 70px rgba(0,0,0,.42);cursor:pointer;text-align:left';

    var t = global.document.createElement('div');
    t.textContent = 'NOVA RESERVA RECEBIDA';
    t.style.cssText = 'font-size:12px;letter-spacing:.18em;font-weight:700;color:#F2A65A;margin-bottom:6px';

    var nome = global.document.createElement('div');
    nome.textContent = r.nome;
    nome.style.cssText = "font-family:'Bricolage Grotesque',Georgia,serif;font-size:30px;line-height:1.1;margin-bottom:16px";

    el.appendChild(t);
    el.appendChild(nome);
    el.appendChild(linhaInfo('CÓDIGO', r.codigo));
    el.appendChild(linhaInfo('DATA', data + ' · ' + r.hora));
    el.appendChild(linhaInfo('PESSOAS', String(r.pessoas)));
    if (amb) el.appendChild(linhaInfo('AMBIENTE', amb));

    var acoes = global.document.createElement('div');
    acoes.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin-top:20px';
    var abrir = global.document.createElement('button');
    abrir.type = 'button';
    abrir.textContent = 'ABRIR RESERVA';
    abrir.style.cssText = 'flex:1;min-width:150px;cursor:pointer;border:0;background:#E96A2B;color:#fff;padding:15px 18px;' +
      'border-radius:11px;font:inherit;font-size:13px;font-weight:700;letter-spacing:.05em';
    var depois = global.document.createElement('button');
    depois.type = 'button';
    depois.textContent = 'DEPOIS';
    depois.style.cssText = 'cursor:pointer;background:transparent;border:1px solid rgba(247,238,218,.4);color:#F7EEDA;' +
      'padding:15px 18px;border-radius:11px;font:inherit;font-size:13px;font-weight:700;letter-spacing:.05em';
    acoes.appendChild(abrir);
    acoes.appendChild(depois);
    el.appendChild(acoes);

    function fechar() {
      fundo.style.opacity = '0';
      setTimeout(function () { if (fundo.parentNode) fundo.parentNode.removeChild(fundo); }, 320);
    }
    function ir() { global.location.href = './admin-reservas.dc.html?reserva=' + encodeURIComponent(r.codigo); }

    el.onclick = ir;
    depois.onclick = function (ev) { ev.stopPropagation(); fechar(); };
    fundo.onclick = function (ev) { if (ev.target === fundo) fechar(); };

    fundo.appendChild(el);
    global.document.body.appendChild(fundo);
    setTimeout(fechar, 25000);
  }

  function idsSalvos() {
    try { return JSON.parse(global.localStorage.getItem(VISTAS) || '[]'); } catch (e) { return []; }
  }
  function guardar(ids) {
    try { global.localStorage.setItem(VISTAS, JSON.stringify(ids.slice(0, 400))); } catch (e) {}
  }

  function verificar() {
    if (!global.CB || !global.CB.getReservations) return;
    var lista = global.CB.getReservations().filter(function (r) { return !r.demo; });
    var ids = lista.map(function (r) { return r.id; });
    if (conhecidas === null) {                       // primeira leitura: só registra o estado atual
      conhecidas = idsSalvos().length ? idsSalvos() : ids;
      guardar(conhecidas);
      return;
    }
    var novas = lista.filter(function (r) { return conhecidas.indexOf(r.id) < 0; });
    conhecidas = ids;
    guardar(ids);
    if (!novas.length) return;
    tocar();
    novas.slice(0, 2).forEach(function (r) { faixa(r); notificar(r); });
  }

  function pedirPermissao() {
    if (!('Notification' in global)) return Promise.resolve('unsupported');
    if (Notification.permission !== 'default') return Promise.resolve(Notification.permission);
    return Notification.requestPermission();
  }

  function iniciar() {
    verificar();
    global.addEventListener('cb:changed', verificar);
    global.addEventListener('cb:cloud-pronto', verificar);
    setInterval(verificar, 30000);                   // rede de segurança se o tempo real cair
    global.document.addEventListener('click', function liberar() {
      if (ctx && ctx.state === 'suspended') ctx.resume();
      global.document.removeEventListener('click', liberar);
    });
  }

  global.CBAlerta = { tocar: tocar, somLigado: somLigado, alternarSom: alternarSom, pedirPermissao: pedirPermissao, verificar: verificar };

  if (global.document.readyState === 'loading') global.document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})(window);
