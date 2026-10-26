/* ============================================================
   BARRACA CUMBUCO BEACH — cabeçalho, rodapé, ícones e movimento
   ============================================================ */
(function (g, d) {
  'use strict';
  var CFG = g.CB_CONFIG || {};

  var ICO = {
    zap: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.6 2 2.17 6.43 2.17 11.87c0 1.74.46 3.44 1.32 4.94L2.1 22l5.32-1.4a9.86 9.86 0 0 0 4.62 1.18h.01c5.44 0 9.87-4.43 9.87-9.87a9.8 9.8 0 0 0-2.87-7Zm-7.01 15.2h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.16.83.84-3.08-.2-.32a8.18 8.18 0 0 1-1.26-4.36c0-4.52 3.68-8.2 8.21-8.2a8.2 8.2 0 0 1 8.2 8.21c0 4.53-3.68 8.25-8.14 8.25Zm4.5-6.15c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.55.12-.17.25-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.04-.39-1.99-1.23-.73-.66-1.23-1.47-1.37-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42h-.47a.9.9 0 0 0-.66.31c-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z"/></svg>',
    seta: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    voltar: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
    pin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    relogio: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    gente: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.4 3-5.4 6-5.4s5.4 2 6 5.4"/><path d="M16 4.8a3.2 3.2 0 0 1 0 6.3M18.5 14.9c1.4.8 2.3 2.4 2.5 5.1"/></svg>',
    insta: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>',
    check: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    onda: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M2 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/></svg>',
    peixe: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12c3-5 9-6 13-3l5-3v12l-5-3c-4 3-10 2-13-3Z"/><circle cx="8" cy="11" r=".8" fill="currentColor"/></svg>',
    copo: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12l-1.5 17a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1L6 3Z"/><path d="M6.5 8h11"/></svg>',
    carro: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18v3H3z"/><circle cx="7.5" cy="13" r=".8" fill="currentColor"/><circle cx="16.5" cy="13" r=".8" fill="currentColor"/></svg>'
  };
  g.ICO = ICO;

  /* sol da marca — usado no hero, na chamada final e no resumo */
  function sol(cls) {
    var raios = '';
    for (var i = 0; i < 16; i++) {
      var a = i * 22.5, longo = i % 2 === 0;
      raios += '<rect x="98" y="' + (longo ? 2 : 14) + '" width="4" height="' + (longo ? 30 : 20) + '" rx="2" transform="rotate(' + a + ' 100 100)"/>';
    }
    return '<svg viewBox="0 0 200 200" aria-hidden="true" class="' + (cls || '') + '"><g class="cena__raios" fill="#F7A823">' + raios + '</g><circle cx="100" cy="100" r="54" fill="#EF5A24"/></svg>';
  }
  g.CBsol = sol;

  var pagina = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  var links = [
    ['index.html', 'Início', 'index'],
    ['ambientes.html', 'Ambientes', 'ambientes'],
    ['localizacao.html', 'Como chegar', 'localizacao'],
    ['contato.html', 'Contato', 'contato']
  ];
  function nav(cls) {
    return links.map(function (l) {
      return '<a href="' + l[0] + '"' + (pagina === l[2] ? ' aria-current="page"' : '') + '>' + l[1] + '</a>';
    }).join('');
  }
  var zapGeral = 'https://wa.me/' + (CFG.whatsappNumero || '') + '?text=' + encodeURIComponent('Olá! Vim pelo site da Barraca Cumbuco Beach.');

  var topo = d.getElementById('topo');
  if (topo) {
    topo.className = 'topo';
    topo.innerHTML =
      '<div class="wrap topo__in">' +
        '<a class="topo__logo" href="index.html" aria-label="Barraca Cumbuco Beach — início"><img src="assets/logo/logo.png" alt="Cumbuco Beach" width="65" height="50"></a>' +
        '<nav class="topo__nav" aria-label="Principal">' + nav() + '</nav>' +
        (pagina === 'reservar' ? '' : '<a class="btn topo__cta" href="reservar.html">Reservar mesa</a>') +
        '<button class="menu-btn" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="gaveta"><span></span><span></span><span></span></button>' +
      '</div>';
    var gav = d.createElement('div');
    gav.className = 'gaveta'; gav.id = 'gaveta';
    gav.innerHTML = nav() + '<a class="btn" href="reservar.html">Reservar mesa</a><p class="gaveta__rodape">' + (CFG.endereco || '') + '<br>' + (CFG.funcionamento || '') + '</p>';
    topo.after(gav);
    var bt = topo.querySelector('.menu-btn');
    bt.addEventListener('click', function () {
      var ab = d.body.classList.toggle('menu-aberto');
      bt.setAttribute('aria-expanded', ab ? 'true' : 'false');
      bt.setAttribute('aria-label', ab ? 'Fechar menu' : 'Abrir menu');
      d.body.style.overflow = ab ? 'hidden' : '';
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && d.body.classList.contains('menu-aberto')) bt.click(); });
    var rolou = function () { topo.classList.toggle('rolou', g.scrollY > 8); };
    g.addEventListener('scroll', rolou, { passive: true }); rolou();
  }

  var rod = d.getElementById('rodape');
  if (rod) {
    rod.className = 'rodape';
    rod.innerHTML =
      '<div class="wrap"><div class="rodape__grade">' +
        '<div class="rodape__marca"><img src="assets/logo/logo.png" alt="Cumbuco Beach" width="83" height="64"><p>Barraca pé na areia em Tabuba, Caucaia. Comida de praia, mar e sol o ano inteiro.</p></div>' +
        '<div><h4>Endereço</h4><ul><li>Av. Central, 49 - Tabuba</li><li>Caucaia - CE, 61618-015</li><li><a href="' + CFG.mapsLink + '" target="_blank" rel="noopener">Abrir no Google Maps</a></li></ul></div>' +
        '<div><h4>Funcionamento</h4><ul><li>Todos os dias</li><li>Das 9h às 17h</li><li>Reservas até 14h30</li></ul></div>' +
        '<div><h4>Fale com a gente</h4><ul><li><a href="' + zapGeral + '" target="_blank" rel="noopener">WhatsApp ' + (CFG.whatsappTexto || '') + '</a></li><li><a href="' + CFG.instagram + '" target="_blank" rel="noopener">Instagram ' + (CFG.instagramUser || '') + '</a></li><li><a href="politica-privacidade.html">Privacidade</a></li></ul></div>' +
      '</div><div class="rodape__base"><span>© ' + new Date().getFullYear() + ' Barraca Cumbuco Beach</span><a href="admin-login.html">Área da equipe</a></div></div>';
  }

  if (!d.querySelector('.zap-flutua') && !/^admin/.test(pagina)) {
    var z = d.createElement('a');
    z.className = 'zap-flutua'; z.href = zapGeral; z.target = '_blank'; z.rel = 'noopener';
    z.setAttribute('aria-label', 'Falar no WhatsApp'); z.innerHTML = ICO.zap;
    d.body.appendChild(z);
  }

  /* preenche ícones declarados como <i data-ico="nome"></i> */
  [].forEach.call(d.querySelectorAll('[data-ico]'), function (el) { el.outerHTML = ICO[el.getAttribute('data-ico')] || ''; });
  [].forEach.call(d.querySelectorAll('[data-sol]'), function (el) { el.innerHTML = sol(); });
  [].forEach.call(d.querySelectorAll('[data-zap]'), function (el) { el.href = zapGeral; });
  [].forEach.call(d.querySelectorAll('[data-maps]'), function (el) { el.href = CFG.mapsLink; });

  /* revelação ao rolar */
  var alvos = d.querySelectorAll('[data-rev]');
  if ('IntersectionObserver' in g) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    [].forEach.call(alvos, function (el) { io.observe(el); });
  } else { [].forEach.call(alvos, function (el) { el.classList.add('visto'); }); }

  /* dispara a sequência de entrada quando fontes e primeira imagem estiverem prontas */
  function pronto() { d.documentElement.classList.add('pronto'); }
  var esperas = [];
  if (d.fonts && d.fonts.ready) esperas.push(d.fonts.ready);
  var img1 = d.querySelector('.arco img');
  if (img1 && !img1.complete) esperas.push(new Promise(function (r) { img1.addEventListener('load', r); img1.addEventListener('error', r); }));
  Promise.race([Promise.all(esperas), new Promise(function (r) { setTimeout(r, 1200); })]).then(function () { requestAnimationFrame(function () { requestAnimationFrame(pronto); }); });
})(window, document);
