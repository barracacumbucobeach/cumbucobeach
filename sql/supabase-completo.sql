-- ============================================================
-- BARRACA CUMBUCO BEACH — INSTALAÇÃO COMPLETA DO BANCO
-- ------------------------------------------------------------
-- Cole este arquivo INTEIRO no SQL Editor do Supabase e execute.
-- Substitui os arquivos supabase.sql, parte2, parte3 e parte4.
-- Pode ser executado novamente com segurança: não duplica dados.
--
-- Depois de executar:
--   1. Authentication › Users › Add user  → crie o login do painel
--   2. Confira Project Settings › API     → URL e chave publishable
--      já estão em js/supabase-config.js
-- ============================================================


-- ============================================================
-- 1. TABELAS
-- ============================================================

create table if not exists public.ambientes (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  descricao   text default '',
  imagem      text default '',
  capacidade  int  not null default 0,   -- 0 = sem limite definido
  ativo       bool not null default true,
  ordem       int  not null default 1
);
create unique index if not exists ambientes_nome_uidx on public.ambientes (nome);

create table if not exists public.reservas (
  id          uuid primary key default gen_random_uuid(),
  codigo      text unique not null,
  nome        text not null,
  telefone    text not null,
  email       text default '',
  data        date not null,
  hora        text not null,
  pessoas     int  not null check (pessoas > 0),
  ambiente_id uuid references public.ambientes(id) on delete set null,
  observacoes text default '',
  status      text not null default 'AGUARDANDO CONFIRMAÇÃO',
  demo        bool not null default false,
  historico   jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists reservas_slot_idx on public.reservas (data, hora, ambiente_id);

create table if not exists public.bloqueios (
  id          uuid primary key default gen_random_uuid(),
  data        date not null,
  ambiente_id uuid references public.ambientes(id) on delete cascade,
  hora_inicio text,
  hora_fim    text,
  motivo      text default 'Período bloqueado'
);

create table if not exists public.clientes (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  telefone   text unique not null,
  email      text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.lista_espera (
  id          uuid primary key default gen_random_uuid(),
  nome        text,
  telefone    text,
  data        date,
  hora        text,
  pessoas     int,
  ambiente_id uuid references public.ambientes(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists public.configuracoes (
  id    int primary key default 1 check (id = 1),
  dados jsonb not null default '{}'::jsonb
);


-- ============================================================
-- 2. DADOS DA BARRACA
-- ============================================================

insert into public.configuracoes (id, dados) values (1, '{}'::jsonb)
on conflict (id) do nothing;

update public.configuracoes
   set dados = coalesce(dados, '{}'::jsonb) || jsonb_build_object(
     'nome',            'Barraca Cumbuco Beach',
     'endereco',        'Av. Central, 49 - Tabuba, Caucaia - CE, 61618-015',
     'whatsapp',        '(85) 98177-7390',
     'whatsappNumero',  '5585981777390',
     'horaInicio',      '09:00',
     'horaFim',         '14:30',
     'intervalo',       30
   )
 where id = 1;

-- Ambientes reais, com fotos e capacidades.
-- Tendas: 2 unidades de 6 lugares por ambiente.
insert into public.ambientes (nome, descricao, imagem, capacidade, ativo, ordem) values
  ('Salão Coberto Entrada',
   'Salão coberto logo na entrada da barraca, prático para chegar e sentar.',
   'assets/images/ambientes/salao-coberto-entrada.jpeg', 90, true, 1),

  ('Salão Coberto Central',
   'Espaço coberto central, indicado para grupos menores e famílias.',
   'assets/images/ambientes/salao-coberto-central.jpeg', 50, true, 2),

  ('Salão Coberto Central — Caminho da Praia',
   'Salão coberto no caminho da praia, entre a estrutura da barraca e a areia.',
   'assets/images/ambientes/salao-coberto-central-caminho-praia.jpeg', 122, true, 3),

  ('Salão Coberto Praia Piscina',
   'Área coberta junto à piscina, com sombra e movimento da barraca por perto.',
   'assets/images/ambientes/salao-coberto-praia-piscina.jpeg', 122, true, 4),

  ('Tendas Praia',
   'Tendas praia 1 e 2, na faixa de areia — 6 lugares em cada tenda.',
   'assets/images/ambientes/tendas.jpeg', 12, true, 5),

  ('Tendas Central',
   'Tendas central 1 e 2, na área central da barraca — 6 lugares em cada tenda.',
   'assets/images/ambientes/tendas.jpeg', 12, true, 6),

  ('Tendas Superior',
   'Tendas superior 1 e 2, na parte alta, com vista ampla do mar — 6 lugares em cada tenda.',
   'assets/images/ambientes/tendas.jpeg', 12, true, 7),

  ('Mesas Praia Sol Nascente',
   'Mesas na areia no lado nascente, sob cobertura, de frente para o mar.',
   'assets/images/ambientes/mesas-praia-sol-nascente.jpeg', 140, true, 8),

  ('Mesas Praia Central',
   'Mesas na areia em posição central, com acesso direto ao mar.',
   'assets/images/ambientes/mesas-praia-central.jpeg', 140, true, 9),

  ('Mesas Praia Sol Poente',
   'Mesas na areia no lado poente, opção para acompanhar o pôr do sol.',
   'assets/images/ambientes/mesas-praia-sol-poente.jpeg', 140, true, 10)
on conflict (nome) do update
   set descricao  = excluded.descricao,
       imagem     = excluded.imagem,
       capacidade = excluded.capacidade,
       ordem      = excluded.ordem,
       ativo      = true;

-- remove os nomes de exemplo da primeira instalação e a tenda unificada
delete from public.ambientes
 where nome in ('Salão Coberto Sol Nascente','Salão Coberto Sol Poente','Tendas');


-- ============================================================
-- 3. CRIAÇÃO DE RESERVA COM CHECAGEM DE LOTAÇÃO
--    Roda dentro do banco: dois clientes no último lugar ao mesmo
--    tempo — um entra, o outro recebe o aviso de lotado.
-- ============================================================

create or replace function public.criar_reserva(
  p_nome text, p_telefone text, p_email text, p_data date, p_hora text,
  p_pessoas int, p_ambiente uuid, p_observacoes text
) returns public.reservas
language plpgsql security definer set search_path = public as $$
declare
  v_cap int; v_ativo bool; v_usado int; v_codigo text; v_seq int; v_row public.reservas;
begin
  if p_pessoas is null or p_pessoas < 1 then
    raise exception 'Informe uma quantidade de pessoas maior que zero.';
  end if;
  if p_data < current_date then
    raise exception 'Não é possível reservar para uma data anterior a hoje.';
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
  values (v_codigo, p_nome, p_telefone, coalesce(p_email,''), p_data, p_hora, p_pessoas, p_ambiente,
          coalesce(p_observacoes,''),
          jsonb_build_array(jsonb_build_object('em', now(), 'texto', 'Reserva criada')))
  returning * into v_row;

  insert into clientes (nome, telefone, email) values (p_nome, p_telefone, coalesce(p_email,''))
  on conflict (telefone) do update set nome = excluded.nome,
       email = case when excluded.email <> '' then excluded.email else clientes.email end;

  return v_row;
end $$;


-- ============================================================
-- 4. CONTADOR PÚBLICO DE VAGAS (tempo real)
--    Só números: ambiente, data, hora e quantas pessoas ocupam.
--    Nenhum dado de cliente fica exposto.
-- ============================================================

create table if not exists public.vagas_pub (
  ambiente_id uuid not null references public.ambientes(id) on delete cascade,
  data        date not null,
  hora        text not null,
  ocupado     int  not null default 0,
  primary key (ambiente_id, data, hora)
);

create or replace function public.recalcula_vaga(p_amb uuid, p_data date, p_hora text)
returns void language plpgsql security definer set search_path = public as $$
declare v_total int;
begin
  if p_amb is null or p_data is null or p_hora is null then return; end if;
  select coalesce(sum(pessoas), 0) into v_total
    from reservas
   where ambiente_id = p_amb and data = p_data and hora = p_hora
     and status not in ('CANCELADA','NÃO COMPARECEU');
  if v_total = 0 then
    delete from vagas_pub where ambiente_id = p_amb and data = p_data and hora = p_hora;
  else
    insert into vagas_pub (ambiente_id, data, hora, ocupado)
    values (p_amb, p_data, p_hora, v_total)
    on conflict (ambiente_id, data, hora) do update set ocupado = excluded.ocupado;
  end if;
end $$;

create or replace function public.atualiza_vagas() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op in ('UPDATE','DELETE') then
    perform recalcula_vaga(old.ambiente_id, old.data, old.hora);
  end if;
  if tg_op in ('INSERT','UPDATE') then
    perform recalcula_vaga(new.ambiente_id, new.data, new.hora);
  end if;
  return null;
end $$;

drop trigger if exists reservas_vagas on public.reservas;
create trigger reservas_vagas
after insert or update or delete on public.reservas
for each row execute function public.atualiza_vagas();

insert into public.vagas_pub (ambiente_id, data, hora, ocupado)
select ambiente_id, data, hora, sum(pessoas)
  from public.reservas
 where ambiente_id is not null and status not in ('CANCELADA','NÃO COMPARECEU')
 group by ambiente_id, data, hora
on conflict (ambiente_id, data, hora) do update set ocupado = excluded.ocupado;


-- ============================================================
-- 5. PERMISSÕES
--    Visitante: lê ambientes, bloqueios e vagas; cria reserva pela função.
--               NÃO lê nome nem telefone de outros clientes.
--    Painel (autenticado): acesso total de gestão.
-- ============================================================

alter table public.ambientes     enable row level security;
alter table public.reservas      enable row level security;
alter table public.bloqueios     enable row level security;
alter table public.clientes      enable row level security;
alter table public.lista_espera  enable row level security;
alter table public.configuracoes enable row level security;
alter table public.vagas_pub     enable row level security;

drop policy if exists amb_leitura on public.ambientes;
create policy amb_leitura on public.ambientes for select using (true);
drop policy if exists amb_gestao on public.ambientes;
create policy amb_gestao on public.ambientes for all to authenticated using (true) with check (true);

drop policy if exists blo_leitura on public.bloqueios;
create policy blo_leitura on public.bloqueios for select using (true);
drop policy if exists blo_gestao on public.bloqueios;
create policy blo_gestao on public.bloqueios for all to authenticated using (true) with check (true);

drop policy if exists res_gestao on public.reservas;
create policy res_gestao on public.reservas for all to authenticated using (true) with check (true);

drop policy if exists cli_gestao on public.clientes;
create policy cli_gestao on public.clientes for all to authenticated using (true) with check (true);

drop policy if exists esp_insere on public.lista_espera;
create policy esp_insere on public.lista_espera for insert with check (true);
drop policy if exists esp_gestao on public.lista_espera;
create policy esp_gestao on public.lista_espera for all to authenticated using (true) with check (true);

drop policy if exists cfg_leitura on public.configuracoes;
create policy cfg_leitura on public.configuracoes for select using (true);
drop policy if exists cfg_gestao on public.configuracoes;
create policy cfg_gestao on public.configuracoes for all to authenticated using (true) with check (true);

drop policy if exists vagas_leitura on public.vagas_pub;
create policy vagas_leitura on public.vagas_pub for select using (true);

grant select on public.vagas_pub to anon, authenticated;
grant execute on function public.criar_reserva(text,text,text,date,text,int,uuid,text) to anon, authenticated;


-- ============================================================
-- 6. TEMPO REAL
-- ============================================================

do $$
begin
  begin alter publication supabase_realtime add table public.reservas;  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.ambientes; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.bloqueios; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.vagas_pub; exception when duplicate_object then null; end;
end $$;


-- ============================================================
-- CONFERÊNCIA
-- ============================================================

select (select count(*) from public.ambientes)                as ambientes,
       (select count(*) from public.reservas)                 as reservas,
       (select dados->>'horaInicio' from public.configuracoes where id = 1) as abre,
       (select dados->>'horaFim'    from public.configuracoes where id = 1) as fecha;
