-- ============================================================
-- BARRACA CUMBUCO BEACH — ENDURECIMENTO DE SEGURANÇA
-- Rode este arquivo inteiro no SQL Editor do Supabase, uma vez,
-- DEPOIS de sql/supabase-completo.sql.
-- Pode ser executado novamente sem risco.
-- ============================================================

-- ------------------------------------------------------------
-- 1. LIMPEZA DE DADOS SENSÍVEIS GRAVADOS POR ENGANO
--    A tabela de configurações é lida publicamente pelo site.
--    Nenhuma credencial pode viver nela.
-- ------------------------------------------------------------
update public.configuracoes
   set dados = dados - 'adminUser' - 'adminPass' - 'senha' - 'password' - 'token' - 'apiKey' - 'serviceKey'
 where id = 1;

-- barreira permanente: mesmo que alguém tente gravar, o banco remove
create or replace function public.cfg_sem_credenciais()
returns trigger language plpgsql as $$
begin
  new.dados := new.dados - 'adminUser' - 'adminPass' - 'senha' - 'password' - 'token' - 'apiKey' - 'serviceKey';
  return new;
end $$;

drop trigger if exists cfg_sem_credenciais_trg on public.configuracoes;
create trigger cfg_sem_credenciais_trg
  before insert or update on public.configuracoes
  for each row execute function public.cfg_sem_credenciais();


-- ------------------------------------------------------------
-- 2. PERMISSÕES EXPLÍCITAS
--    O visitante do site (anon) não recebe permissão de tabela
--    nenhuma sobre dados pessoais. Ele só:
--      - lê ambientes, bloqueios, configurações e a visão de vagas;
--      - insere na lista de espera;
--      - cria reserva pela função criar_reserva.
-- ------------------------------------------------------------
revoke all on public.reservas     from anon;
revoke all on public.clientes     from anon;
revoke all on public.lista_espera from anon;

grant select on public.ambientes, public.bloqueios, public.configuracoes, public.vagas_pub to anon;
grant insert on public.lista_espera to anon;

-- a política de leitura da lista de espera fica restrita ao painel
drop policy if exists esp_leitura on public.lista_espera;


-- ------------------------------------------------------------
-- 3. VALIDAÇÃO E LIMITES NA CRIAÇÃO DE RESERVA
--    Única porta de escrita aberta ao público: precisa validar
--    tudo e travar enxurrada de pedidos automatizados.
-- ------------------------------------------------------------
create or replace function public.criar_reserva(
  p_nome text, p_telefone text, p_email text, p_data date, p_hora text,
  p_pessoas int, p_ambiente uuid, p_observacoes text
) returns public.reservas
language plpgsql security definer set search_path = public as $$
declare
  v_cap int; v_ativo bool; v_usado int; v_codigo text; v_seq int; v_row public.reservas;
  v_nome text; v_tel text; v_email text; v_obs text; v_dig text; v_recentes int;
begin
  -- limpeza: sem caracteres de controle, com tamanho máximo
  v_nome  := left(regexp_replace(coalesce(p_nome,''),  '[[:cntrl:]]', ' ', 'g'), 80);
  v_tel   := left(regexp_replace(coalesce(p_telefone,''), '[[:cntrl:]]', ' ', 'g'), 25);
  v_email := left(regexp_replace(coalesce(p_email,''), '[[:cntrl:]]', ' ', 'g'), 120);
  v_obs   := left(regexp_replace(coalesce(p_observacoes,''), '[[:cntrl:]]', ' ', 'g'), 500);
  v_nome  := btrim(v_nome);
  v_dig   := regexp_replace(v_tel, '\D', '', 'g');

  if length(v_nome) < 3 then
    raise exception 'Informe o nome completo.';
  end if;
  if length(v_dig) < 10 or length(v_dig) > 13 then
    raise exception 'Informe um WhatsApp válido, com DDD.';
  end if;
  if v_email <> '' and v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[a-z]{2,}$' then
    raise exception 'E-mail inválido.';
  end if;
  if p_hora is null or p_hora !~ '^[0-2][0-9]:[0-5][0-9]$' then
    raise exception 'Horário inválido.';
  end if;
  if p_pessoas is null or p_pessoas < 1 or p_pessoas > 500 then
    raise exception 'Quantidade de pessoas inválida.';
  end if;
  if p_data < current_date then
    raise exception 'Não é possível reservar para uma data anterior a hoje.';
  end if;
  if p_data > current_date + interval '365 days' then
    raise exception 'Reservas são aceitas com até um ano de antecedência.';
  end if;

  -- freio contra enxurrada: no máximo 5 pedidos por telefone na última hora
  select count(*) into v_recentes
    from reservas
   where regexp_replace(telefone, '\D', '', 'g') = v_dig
     and created_at > now() - interval '1 hour';
  if v_recentes >= 5 then
    raise exception 'Muitos pedidos com este número em pouco tempo. Fale com a barraca pelo WhatsApp.';
  end if;

  -- e no máximo 3 reservas ativas para o mesmo dia e ambiente
  select count(*) into v_recentes
    from reservas
   where regexp_replace(telefone, '\D', '', 'g') = v_dig
     and data = p_data and ambiente_id = p_ambiente
     and status not in ('CANCELADA','NÃO COMPARECEU');
  if v_recentes >= 3 then
    raise exception 'Já existem reservas com este número para este dia e ambiente.';
  end if;

  select capacidade, ativo into v_cap, v_ativo
    from ambientes where id = p_ambiente for update;
  if v_cap is null or not v_ativo then
    raise exception 'Ambiente indisponível.';
  end if;

  if exists (
    select 1 from bloqueios b
     where b.data = p_data
       and (b.ambiente_id is null or b.ambiente_id = p_ambiente)
       and (b.hora_inicio is null
            or p_hora::time between b.hora_inicio::time and coalesce(b.hora_fim,'23:59')::time)
  ) then
    raise exception 'Este horário está bloqueado neste ambiente.';
  end if;

  select coalesce(sum(pessoas), 0) into v_usado
    from reservas
   where data = p_data and hora = p_hora and ambiente_id = p_ambiente
     and status not in ('CANCELADA','NÃO COMPARECEU');

  if v_cap > 0 and v_usado + p_pessoas > v_cap then
    raise exception 'LOTADO:%:%', v_cap, v_usado;
  end if;

  select coalesce(max(split_part(codigo,'-',3)::int), 0) + 1 into v_seq
    from reservas where codigo like 'CB-' || to_char(p_data,'YYYYMMDD') || '-%';
  v_codigo := 'CB-' || to_char(p_data,'YYYYMMDD') || '-' || lpad(v_seq::text, 5, '0');

  insert into reservas (codigo, nome, telefone, email, data, hora, pessoas, ambiente_id, observacoes, historico)
  values (v_codigo, v_nome, v_tel, v_email, p_data, p_hora, p_pessoas, p_ambiente, v_obs,
          jsonb_build_array(jsonb_build_object('em', now(), 'texto', 'Reserva criada')))
  returning * into v_row;

  insert into clientes (nome, telefone, email)
  values (v_nome, v_tel, v_email)
  on conflict (telefone) do update
    set nome = excluded.nome,
        email = case when excluded.email <> '' then excluded.email else clientes.email end;

  return v_row;
end $$;

grant execute on function public.criar_reserva(text,text,text,date,text,int,uuid,text) to anon, authenticated;


-- ------------------------------------------------------------
-- 4. LISTA DE ESPERA: LIMITES CONTRA ABUSO
-- ------------------------------------------------------------
create or replace function public.espera_valida()
returns trigger language plpgsql as $$
declare v_dig text; v_qtd int;
begin
  new.nome     := left(btrim(regexp_replace(coalesce(new.nome,''), '[[:cntrl:]]', ' ', 'g')), 80);
  new.telefone := left(regexp_replace(coalesce(new.telefone,''), '[[:cntrl:]]', ' ', 'g'), 25);
  v_dig := regexp_replace(new.telefone, '\D', '', 'g');

  if length(v_dig) < 10 then
    raise exception 'Informe um WhatsApp válido.';
  end if;
  if new.data is null or new.data < current_date then
    raise exception 'Data inválida.';
  end if;
  if new.pessoas is null or new.pessoas < 1 or new.pessoas > 500 then
    raise exception 'Quantidade de pessoas inválida.';
  end if;

  select count(*) into v_qtd
    from lista_espera
   where regexp_replace(telefone, '\D', '', 'g') = v_dig
     and created_at > now() - interval '1 hour';
  if v_qtd >= 5 then
    raise exception 'Muitos pedidos com este número em pouco tempo.';
  end if;

  return new;
end $$;

drop trigger if exists espera_valida_trg on public.lista_espera;
create trigger espera_valida_trg
  before insert on public.lista_espera
  for each row execute function public.espera_valida();


-- ------------------------------------------------------------
-- 5. CONFERÊNCIA
--    Deve listar apenas as permissões previstas para anon.
-- ------------------------------------------------------------
select table_name, privilege_type
  from information_schema.role_table_grants
 where grantee = 'anon' and table_schema = 'public'
 order by table_name, privilege_type;
