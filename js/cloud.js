/* ============================================================
   BARRACA CUMBUCO BEACH — espelho do banco compartilhado
   ------------------------------------------------------------
   Mantém o cache local de js/storage.js sincronizado com o
   Supabase e escuta as mudanças em tempo real. As telas não
   mudam: continuam lendo CB.getSpaces(), CB.checkAvailability()
   etc., agora com dados iguais para todos os clientes.
   ============================================================ */
(function (global) {
  'use strict';

  var cfg = global.CB_SUPABASE || {};
  var ativo = !!(cfg.url && cfg.anonKey && cfg.url.indexOf('SUA-') < 0 && cfg.anonKey.indexOf('SUA-') < 0);

  if (global.CBCloud && global.CBCloud.__iniciado) return;   // uma única inicialização por página
  global.CBCloud = { ativo: ativo, pronto: false, erro: null, __iniciado: true };
  if (!ativo || !global.CB) return;

  var CB = global.CB;
  var sb = null;

  var vagas = {};       // "data|hora|ambiente" -> ocupado (visão pública, sem dados de cliente)
  var autenticado = false;

  /* aviso discreto quando o banco recusa uma gravação */
  function aviso(msg) {
    console.warn('[CBCloud] ' + msg);
    var el = global.document.getElementById('cb-aviso-nuvem');
    if (!el) {
      el = global.document.createElement('div');
      el.id = 'cb-aviso-nuvem';
      el.setAttribute('role', 'status');
      el.style.cssText = 'position:fixed;left:50%;bottom:26px;transform:translateX(-50%);background:#9B3B34;color:#fff;padding:14px 20px;border-radius:12px;font:600 13px/1.5 system-ui,sans-serif;max-width:90vw;text-align:center;z-index:9999;box-shadow:0 14px 34px rgba(0,0,0,.25)';
      global.document.body.appendChild(el);
    }
    el.textContent = msg;
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.remove(); }, 6000);
  }

  var hhmm = function (h) { return String(h || '').slice(0, 5); };

  function mapAmbiente(r) {
    var a = { id: r.id, nome: r.nome, descricao: r.descricao || '', imagem: r.imagem || '', capacidade: +r.capacidade || 0, ativo: !!r.ativo, ordem: +r.ordem || 1 };
    // enquanto o cadastro do banco não tiver foto/capacidade, usa o padrão local pelo nome
    var padrao = CB.defaultSpaceByName ? CB.defaultSpaceByName(a.nome) : null;
    if (padrao) {
      if (!a.imagem) a.imagem = padrao.imagem || '';
      if (!a.capacidade) a.capacidade = padrao.capacidade || 0;
      if (!a.descricao) a.descricao = padrao.descricao || '';
    }
    return a;
  }
  function mapReserva(r) {
    return {
      id: r.id, codigo: r.codigo, nome: r.nome, telefone: r.telefone, email: r.email || '',
      data: r.data, hora: hhmm(r.hora), pessoas: +r.pessoas || 1, ambienteId: r.ambiente_id,
      observacoes: r.observacoes || '', status: r.status, demo: !!r.demo,
      createdAt: r.created_at, updatedAt: r.updated_at, historico: r.historico || []
    };
  }
  function mapBloqueio(r) {
    return { id: r.id, data: r.data, ambienteId: r.ambiente_id, horaInicio: hhmm(r.hora_inicio) || null, horaFim: hhmm(r.hora_fim) || null, motivo: r.motivo || 'Período bloqueado' };
  }
  function mapEspera(r) {
    return { id: r.id, nome: r.nome, telefone: r.telefone, data: r.data, hora: hhmm(r.hora), pessoas: r.pessoas, ambienteId: r.ambiente_id, createdAt: r.created_at };
  }

  /* ---------- leitura: banco → cache local ---------- */
  async function puxar() {
    if (!sb) return;
    var db = CB.__db();
    var res = await Promise.all([
      sb.from('ambientes').select('*').order('ordem'),
      sb.from('reservas').select('*'),
      sb.from('bloqueios').select('*'),
      sb.from('lista_espera').select('*'),
      sb.from('configuracoes').select('dados').eq('id', 1).maybeSingle(),
      sb.from('clientes').select('*'),
      sb.from('vagas_pub').select('*')
    ]);
    var amb = res[0], rsv = res[1], blk = res[2], esp = res[3], cfgRow = res[4], cli = res[5], vg = res[6];

    // contador compartilhado: a visão "vagas" é pública e não expõe nome/telefone
    vagas = {};
    (vg.data || []).forEach(function (v) {
      vagas[v.data + '|' + hhmm(v.hora) + '|' + v.ambiente_id] = +v.ocupado || 0;
    });

    if (amb.data) db.spaces = amb.data.map(mapAmbiente);
    /* Dados pessoais só entram no cache local quando existe sessão do painel.
       No site público o navegador nunca guarda nome/telefone de clientes. */
    if (autenticado) {
      if (rsv.data) db.reservations = rsv.data.map(mapReserva);
      if (esp.data) db.waitlist = esp.data.map(mapEspera);
      if (cli.data) db.customers = cli.data.map(function (c) { return { id: c.id, nome: c.nome, telefone: c.telefone, email: c.email || '', createdAt: c.created_at }; });
    } else {
      db.reservations = [];
      db.waitlist = [];
      db.customers = [];
    }
    if (blk.data) db.blocks = blk.data.map(mapBloqueio);
    if (cfgRow && cfgRow.data && cfgRow.data.dados && Object.keys(cfgRow.data.dados).length) {
      var vindo = Object.assign({}, cfgRow.data.dados);
      ['adminUser', 'adminPass', 'senha', 'password', 'token', 'apiKey', 'serviceKey'].forEach(function (k) { delete vindo[k]; });
      db.settings = Object.assign({}, db.settings, vindo);
    }
    CB.__replace(db);
  }

  /* ---------- escrita: cache local → banco ---------- */
  function empurrarAmbiente(a) {
    return sb.from('ambientes').upsert({
      id: a.id, nome: a.nome, descricao: a.descricao, imagem: a.imagem || '',
      capacidade: +a.capacidade || 0, ativo: a.ativo !== false, ordem: +a.ordem || 1
    });
  }
  function empurrarReserva(r) {
    return sb.from('reservas').update({
      nome: r.nome, telefone: r.telefone, email: r.email || '', data: r.data, hora: r.hora,
      pessoas: +r.pessoas, ambiente_id: r.ambienteId, observacoes: r.observacoes || '',
      status: r.status, historico: r.historico || [], updated_at: new Date().toISOString()
    }).eq('id', r.id);
  }

  function envolver(nome, depois) {
    var original = CB[nome];
    CB[nome] = function () {
      var out = original.apply(CB, arguments);
      if (!autenticado) {
        aviso('Alteração salva apenas neste navegador: entre no painel com seu e-mail para gravar no banco compartilhado.');
        return out;
      }
      try {
        Promise.resolve(depois(out, arguments)).then(function (resp) {
          if (resp && resp.error) aviso('O banco recusou a alteração: ' + resp.error.message);
          else puxar();
        }).catch(function (e) { aviso('Falha ao gravar no banco: ' + e.message); });
      } catch (e) { aviso('Falha ao gravar no banco: ' + e.message); }
      return out;
    };
  }

  /* ---------- ocupação a partir da visão pública ---------- */
  function instalarCapacidade() {
    CB.ocupacao = function (data, hora, ambienteId) {
      return vagas[data + '|' + hora + '|' + ambienteId] || 0;
    };
    CB.checkAvailability = function (data, hora, ambienteId, pessoas) {
      var sp = CB.getSpaceById(ambienteId);
      if (!sp || !sp.ativo) return { ok: false, motivo: 'Ambiente indisponível.' };
      var blk = CB.isBlocked(data, hora, ambienteId);
      if (blk.blocked) return { ok: false, motivo: blk.motivo };
      var cap = +sp.capacidade || 0;
      var usado = CB.ocupacao(data, hora, ambienteId);
      if (cap > 0 && usado + (+pessoas || 0) > cap) {
        return { ok: false, motivo: 'Este ambiente não está disponível neste horário.', ocupado: usado, capacidade: cap };
      }
      return { ok: true, ocupado: usado, capacidade: cap, restante: cap > 0 ? cap - usado : null };
    };
  }

  function instalarEscrita() {
    envolver('saveSpace', function (sp) { return empurrarAmbiente(CB.getSpaceById(sp.id) || sp); });
    envolver('deleteSpace', function (_, args) { return sb.from('ambientes').delete().eq('id', args[0]); });
    envolver('updateReservation', function (r) { return r ? empurrarReserva(r) : null; });
    envolver('setStatus', function (r) { return r ? empurrarReserva(r) : null; });
    envolver('deleteReservation', function (_, args) { return sb.from('reservas').delete().eq('id', args[0]); });
    envolver('saveBlock', function (b) {
      return sb.from('bloqueios').upsert({ id: b.id, data: b.data, ambiente_id: b.ambienteId || null, hora_inicio: b.horaInicio || null, hora_fim: b.horaFim || null, motivo: b.motivo || 'Período bloqueado' });
    });
    envolver('deleteBlock', function (_, args) { return sb.from('bloqueios').delete().eq('id', args[0]); });
    envolver('saveWaitlist', function (w) {
      return sb.from('lista_espera').insert({ nome: w.nome, telefone: w.telefone, data: w.data, hora: w.hora, pessoas: w.pessoas, ambiente_id: w.ambienteId });
    });
    envolver('deleteWaitlist', function (_, args) { return sb.from('lista_espera').delete().eq('id', args[0]); });
    envolver('saveSettings', function (s) {
      // nenhuma credencial vai para o banco, mesmo por engano
      var limpo = Object.assign({}, s);
      ['adminUser', 'adminPass', 'senha', 'password', 'token', 'apiKey', 'serviceKey'].forEach(function (k) { delete limpo[k]; });
      return sb.from('configuracoes').upsert({ id: 1, dados: limpo });
    });

    /* criação de reserva: a checagem de lotação acontece no banco */
    CB.saveReservationAsync = async function (dados) {
      var resp = await sb.rpc('criar_reserva', {
        p_nome: String(dados.nome || '').trim(),
        p_telefone: CB.maskPhone(dados.telefone),
        p_email: String(dados.email || '').trim(),
        p_data: dados.data,
        p_hora: dados.hora,
        p_pessoas: +dados.pessoas || 1,
        p_ambiente: dados.ambienteId,
        p_observacoes: String(dados.observacoes || '').trim()
      });
      if (resp.error) {
        var msg = String(resp.error.message || '');
        if (msg.indexOf('LOTADO') >= 0) {
          var e = new Error('Este ambiente acabou de lotar neste horário. Escolha outro ambiente.');
          e.lotado = true;
          throw e;
        }
        throw new Error(msg.replace(/^.*?:\s*/, '') || 'Não foi possível registrar a reserva.');
      }
      var r = mapReserva(Array.isArray(resp.data) ? resp.data[0] : resp.data);
      await puxar();
      try { localStorage.setItem('cumbuco_last_code', r.codigo); } catch (e2) {}
      return r;
    };
  }

  /* ---------- tempo real ---------- */
  function escutar() {
    if (global.__cbCanal) return;
    global.__cbCanal = sb.channel('cumbuco-beach')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vagas_pub' }, puxar)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas' }, puxar)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ambientes' }, puxar)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bloqueios' }, puxar)
      .subscribe();
  }

  /* ---------- login do painel pelo Supabase ---------- */
  function instalarAuth() {
    CB.loginAsync = async function (email, senha) {
      var resp = await sb.auth.signInWithPassword({ email: email, password: senha });
      if (resp.error) {
        var m = String(resp.error.message || '');
        if (/Email not confirmed/i.test(m)) CB.ultimoErroLogin = 'E-mail ainda não confirmado no Supabase. Em Authentication › Users, abra o usuário e marque como confirmado.';
        else if (/Invalid login credentials/i.test(m)) CB.ultimoErroLogin = 'E-mail ou senha não conferem com o usuário cadastrado no Supabase.';
        else CB.ultimoErroLogin = 'Supabase: ' + m;
        return false;
      }
      CB.ultimoErroLogin = '';
      autenticado = true;
      try { sessionStorage.setItem('cumbuco_beach_admin_session', '1'); } catch (e) {}
      return true;
    };
    var logoutLocal = CB.logout;
    CB.logout = function () { logoutLocal(); autenticado = false; try { sb.auth.signOut(); } catch (e) {} };
  }

  /* páginas do painel exigem sessão real do Supabase */
  async function conferirSessao() {
    var s = await sb.auth.getSession();
    autenticado = !!(s.data && s.data.session);
    /* sem sessão: apaga qualquer dado pessoal que tenha sobrado
       de um acesso anterior neste navegador */
    if (!autenticado) {
      try {
        var d = CB.__db();
        if ((d.reservations || []).length || (d.customers || []).length || (d.waitlist || []).length) {
          d.reservations = []; d.customers = []; d.waitlist = [];
          CB.__replace(d);
        }
      } catch (e) {}
    }
    var pagina = (global.location.pathname.split('/').pop() || '');
    if (pagina.indexOf('admin') === 0 && pagina.indexOf('admin-login') !== 0 && !autenticado) {
      try { sessionStorage.removeItem('cumbuco_beach_admin_session'); } catch (e) {}
      global.location.replace('admin-login.html');
      return false;
    }
    return true;
  }

  function instalarTudo() {
    CB = global.CB;
    instalarCapacidade();
    instalarEscrita();
    instalarAuth();
    CB.__cloudInstalado = true;
  }

  /* a página pode recriar window.CB ao re-renderizar; nesse caso as funções
     da nuvem precisam ser reinstaladas no objeto novo */
  function vigiar() {
    setInterval(function () {
      if (global.CB && !global.CB.__cloudInstalado) { instalarTudo(); puxar(); }
    }, 400);
  }

  (async function iniciar() {
    try {
      var mod = await import('https://esm.sh/@supabase/supabase-js@2');
      // instância única por página, evita múltiplos GoTrueClient
      sb = global.__cbSupabaseClient || (global.__cbSupabaseClient =
        mod.createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true, storageKey: 'cumbuco-beach-auth' } }));
      global.CBCloud.client = sb;
      instalarTudo();
      if (!(await conferirSessao())) return;
      await puxar();
      escutar();
      vigiar();
      global.CBCloud.pronto = true;
      global.dispatchEvent(new CustomEvent('cb:cloud-pronto'));
    } catch (e) {
      global.CBCloud.erro = e;
      console.warn('[CBCloud] falha ao conectar; seguindo em modo local.', e);
    }
  })();
})(window);
