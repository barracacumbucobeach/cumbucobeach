/* ============================================================
   BARRACA CUMBUCO BEACH — mensagens e links do WhatsApp
   ============================================================ */
(function (g) {
  'use strict';
  var CFG = g.CB_CONFIG || {};
  function numero() { return CFG.whatsappNumero || '5585981777390'; }

  /* Sem emojis: em vários aparelhos (principalmente WhatsApp Web/Desktop)
     o link wa.me corrompe os emojis e eles aparecem como "�". */

  function nomeLocal(r) { return g.CB ? g.CB.nomeAmbiente(r.ambienteId, r) : (r.ambienteNome || ''); }
  /* "27/10/2026 (terça-feira)" */
  function dataTxt(r) {
    var p = String(r.data || '').split('-');
    if (p.length !== 3) return r.data || '';
    var dia = new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('pt-BR', { weekday: 'long' });
    return p[2] + '/' + p[1] + '/' + p[0] + ' (' + dia + ')';
  }
  function primeiroNome(n) { return String(n || '').trim().split(' ')[0]; }

  /* Mensagem que o cliente envia para a barraca.
     Os rótulos (Nome:, WhatsApp:, Local: …) são lidos pelo painel em
     "Colar do WhatsApp" — mantenha-os se editar o texto. */
  function mensagemReserva(r) {
    return [
      '*NOVA RESERVA — BARRACA CUMBUCO BEACH*',
      '',
      '*Código:* ' + r.codigo,
      '',
      '*Nome:* ' + r.nome,
      '*WhatsApp:* ' + r.telefone,
      '*E-mail:* ' + r.email,
      '',
      '*Pessoas:* ' + r.pessoas,
      '*Local:* ' + nomeLocal(r),
      '*Data:* ' + dataTxt(r),
      '*Horário de chegada:* ' + r.hora,
      '',
      '*Observações:* ' + (r.observacoes || '—'),
      '',
      'Aguardo a confirmação. Obrigado!'
    ].join('\n');
  }

  /* Mensagem do painel para o cliente (confirmação ou cancelamento) */
  function mensagemCliente(r, tipo) {
    var c = g.CB ? g.CB.getConfig() : {};
    var cancelada = tipo === 'cancelada';
    var linhas = [
      cancelada ? '*RESERVA CANCELADA — BARRACA CUMBUCO BEACH*' : '*RESERVA CONFIRMADA — BARRACA CUMBUCO BEACH*',
      '',
      'Olá, ' + primeiroNome(r.nome) + (cancelada ? '. ' : '! ') + ((cancelada ? c.msgCancelamento : c.msgConfirmacao) || ''),
      '',
      '*Código:* ' + r.codigo,
      '*Local:* ' + nomeLocal(r),
      '*Data:* ' + dataTxt(r),
      '*Horário de chegada:* ' + r.hora,
      '*Pessoas:* ' + r.pessoas
    ];
    if (!cancelada) {
      linhas.push('', '*Endereço:* ' + (CFG.endereco || ''));
      if (CFG.mapsLink) linhas.push('*Como chegar:* ' + CFG.mapsLink);
    }
    linhas.push('', 'Qualquer dúvida, é só responder esta mensagem.', '*Barraca Cumbuco Beach*');
    return linhas.join('\n');
  }

  function numeroCliente(tel) {
    var d = String(tel || '').replace(/\D/g, '');
    if (d.indexOf('55') === 0 && d.length >= 12) return d;
    return d.length >= 10 ? '55' + d : '';
  }
  function link(msg, destino) { return 'https://wa.me/' + (destino || numero()) + (msg ? '?text=' + encodeURIComponent(msg) : ''); }
  function abrir(url) {
    var w = null;
    try { w = g.open(url, '_blank'); } catch (e) {}
    if (w) { try { w.opener = null; } catch (e) {} }
    return !!w;
  }

  g.CBWhats = {
    numero: numero, numeroCliente: numeroCliente,
    mensagemReserva: mensagemReserva, mensagemCliente: mensagemCliente,
    link: link, abrir: abrir,
    linkReserva: function (r) { return link(mensagemReserva(r)); },
    linkCliente: function (r, tipo) { return link(mensagemCliente(r, tipo), numeroCliente(r.telefone)); }
  };
})(window);
