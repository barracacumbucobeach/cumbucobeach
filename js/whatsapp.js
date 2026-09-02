/* BARRACA CUMBUCO BEACH — integração WhatsApp (somente link wa.me) */
(function (global) {
  'use strict';

  function numero() {
    var s = global.CB ? global.CB.getSettings() : null;
    return (s && s.whatsappNumero) || '5585981777390';
  }

  /* emojis montados por código: escritos direto no arquivo, alguns navegadores
     corrompem os pares substitutos ao gerar o link */
  var E = {
    onda: String.fromCodePoint(0x1F30A), sol: String.fromCodePoint(0x2600, 0xFE0F),
    coqueiro: String.fromCodePoint(0x1F334), drink: String.fromCodePoint(0x1F379),
    sorriso: String.fromCodePoint(0x1F604), praia: String.fromCodePoint(0x1F3D6, 0xFE0F),
    brilho: String.fromCodePoint(0x2728), etiqueta: String.fromCodePoint(0x1F3F7, 0xFE0F),
    pino: String.fromCodePoint(0x1F4CD), calendario: String.fromCodePoint(0x1F4C5),
    relogio: String.fromCodePoint(0x23F0), pessoas: String.fromCodePoint(0x1F465),
    carro: String.fromCodePoint(0x1F697), surf: String.fromCodePoint(0x1F3C4)
  };

  /* número do cliente em formato internacional; vazio quando inválido */
  function numeroCliente(telefone) {
    var d = String(telefone || '').replace(/\D/g, '');
    if (d.indexOf('55') === 0 && d.length >= 12) return d;
    return d.length >= 10 ? '55' + d : '';
  }

  /* "seg., 31 de agosto de 2026" */
  function dataExtenso(iso) {
    var p = String(iso || '').split('-');
    if (p.length !== 3) return iso || '';
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function mensagemReserva(r) {
    var CB = global.CB;
    var amb = CB ? CB.spaceName(r.ambienteId) : (r.ambiente || '');
    return [
      '*NOVA SOLICITAÇÃO DE RESERVA - BARRACA CUMBUCO BEACH*',
      '',
      'Olá, equipe da *Barraca Cumbuco Beach*! Acabei de solicitar uma reserva pelo site:',
      '',
      '*Código da Reserva:* *' + r.codigo + '*',
      '',
      '*Nome:* ' + r.nome,
      '*Contato:* ' + r.telefone,
      '',
      '*Quantidade de Pessoas:* ' + r.pessoas,
      '',
      '*Ambiente Escolhido:* ' + amb,
      '',
      '*Data:* ' + dataExtenso(r.data),
      '',
      '*Horário:* ' + r.hora,
      '',
      '*Observações:* ' + (r.observacoes || '—'),
      '',
      'Aguardo a confirmação.'
    ].join('\n');
  }

  /* Mensagem enviada ao cliente pelo painel.
     Na confirmação usa o texto comemorativo completo; nos demais status
     (cancelamento etc.) mantém o resumo com a mensagem configurada. */
  function mensagemStatus(r, texto) {
    var CB = global.CB;
    var amb = CB ? CB.spaceName(r.ambienteId) : (r.ambiente || '');
    var data = dataExtenso(r.data);
    /* O aviso ao cliente só tem dois tons: cancelamento ou confirmação.
       Qualquer status que não seja cancelado usa a mensagem de confirmação,
       inclusive quando o administrador avisa antes de salvar o novo status. */
    var confirmada = !CB || r.status !== CB.STATUS.CANCELADA;
    if (confirmada) {
      return [
        '*RESERVA CONFIRMADA — BARRACA CUMBUCO BEACH*',
        '',
        'Olá, *' + r.nome + '*! Sua reserva está confirmada. Já estamos ansiosos para receber você!',
        '',
        '*Código:* *' + r.codigo + '*',
        '*Ambiente:* ' + amb,
        '*Data:* ' + data + ' às ' + r.hora,
        '*Mesa para:* ' + r.pessoas + (String(r.pessoas) === '1' ? ' pessoa' : ' pessoas'),
        '',
        'Av. Central, 49 - Tabuba, Caucaia - CE',
        'Estacionamento privativo no local.',
        '',
        'Qualquer ajuste, é só falar por aqui.',
        '*Barraca Cumbuco Beach*'
      ].join('\n');
    }

    return [
      '*Barraca Cumbuco Beach*',
      '',
      '*Reserva:* ' + r.codigo,
      '*Ambiente:* ' + amb,
      '*Data:* ' + data + ' às ' + r.hora,
      '*Pessoas:* ' + r.pessoas,
      '',
      texto
    ].join('\n');
  }

  function ehCelular() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(global.navigator.userAgent || '');
  }

  /* Sempre wa.me: mostra a página com "Abrir app" / "Continuar para o WhatsApp Web",
     tanto no computador quanto no celular. */
  function link(mensagem, numeroDestino) {
    return 'https://wa.me/' + (numeroDestino || numero()) + '?text=' + encodeURIComponent(mensagem);
  }

  /* Abre o encaminhamento do WhatsApp em janela nova.
     Retorna true quando conseguiu abrir. Quando o navegador bloqueia,
     retorna false para a página mostrar a mensagem para copiar — nunca
     navega a janela de cima, para não tirar o usuário de onde ele está. */
  /* Conversa sem mensagem pronta (botão "falar no WhatsApp") */
  function linkConversa(numeroDestino) {
    return 'https://wa.me/' + (numeroDestino || numero());
  }

  function abrirSeguro(url) {
    var nova = null;
    try { nova = global.open(url, '_blank'); } catch (e) {}
    if (!nova) return false;
    try { nova.opener = null; } catch (e) {}
    return true;
  }

  function abrir(mensagem, numeroDestino) {
    return abrirSeguro(link(mensagem, numeroDestino));
  }

  global.CBWhats = {
    numero: numero,
    numeroCliente: numeroCliente,
    mensagemReserva: mensagemReserva,
    mensagemStatus: mensagemStatus,
    link: link,
    linkConversa: linkConversa,
    ehCelular: ehCelular,
    abrirSeguro: abrirSeguro,
    abrir: abrir,
    enviarReserva: function (r) { abrir(mensagemReserva(r)); },
    avisarCliente: function (r, texto) { abrir(mensagemStatus(r, texto), numeroCliente(r.telefone)); }
  };
})(window);
