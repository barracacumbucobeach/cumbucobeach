-- ============================================================
-- BARRACA CUMBUCO BEACH — banco completo do site de reservas
-- Rode no Supabase: SQL Editor > New query > cole tudo > Run.
-- Serve para projeto NOVO (cria tudo) e para projeto que já tem
-- as tabelas (só acrescenta o que falta). Pode rodar mais de uma
-- vez: não apaga nem duplica nada.
-- ============================================================

-- 1. Tabelas -------------------------------------------------
create table if not exists public.ambientes (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  descricao   text default '',
  imagem      text default '',
  capacidade  int  default 0,
  ativo       bool default true,
  ordem       int  default 1,
  categoria   text default ''
);
alter table public.ambientes add column if not exists categoria text default '';

create table if not exists public.reservas (
  id            uuid primary key default gen_random_uuid(),
  codigo        text unique not null,
  nome          text not null,
  telefone      text not null,
  email         text default '',
  data          date not null,
  hora          text not null,
  pessoas       int  not null check (pessoas > 0),
  ambiente_id   uuid references public.ambientes(id) on delete set null,
  ambiente_nome text default '',
  observacoes   text default '',
  status        text not null default 'AGUARDANDO CONFIRMAÇÃO',
  origem        text default 'site',
  historico     jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.reservas add column if not exists ambiente_nome text default '';
alter table public.reservas add column if not exists origem        text default 'site';
create index if not exists reservas_data_idx on public.reservas (data);

create table if not exists public.bloqueios (
  id          uuid primary key default gen_random_uuid(),
  data        date not null,
  ambiente_id uuid references public.ambientes(id) on delete cascade,
  hora_inicio text,
  hora_fim    text,
  motivo      text default ''
);

create table if not exists public.configuracoes (
  id    int primary key default 1,
  dados jsonb not null default '{}'::jsonb
);
insert into public.configuracoes (id, dados) values (1, jsonb_build_object(
  'horaInicio', '09:00', 'horaFim', '14:30', 'intervalo', 30,
  'maxPessoas', 60, 'antecedenciaDias', 60,
  'msgConfirmacao', 'Sua reserva está confirmada. Já estamos esperando por você!',
  'msgCancelamento', 'Sua reserva foi cancelada. Se quiser remarcar, é só responder esta mensagem.',
  'politica', 'A reserva é uma solicitação e vale após a confirmação da equipe pelo WhatsApp. Tolerância de 20 minutos após o horário. Cancelamentos devem ser avisados pelo WhatsApp.'
)) on conflict (id) do nothing;

-- 2. Ambientes iniciais (só se a tabela estiver vazia) --------
--    Depois troque nomes, descrições e fotos pelo painel.
insert into public.ambientes (nome, descricao, imagem, capacidade, ordem, categoria)
select * from (values
  ('Mesas Praia Sol Nascente', 'Mesas na areia no lado do nascente, sob cobertura e de frente para o mar.', 'assets/images/ambientes/mesas-praia-sol-nascente.jpg', 140, 1, 'areia'),
  ('Mesas Praia Central', 'Mesas na areia em posição central, com acesso direto ao mar.', 'assets/images/ambientes/mesas-praia-central.jpg', 140, 2, 'areia'),
  ('Mesas Praia Sol Poente', 'Mesas na areia do lado poente — o lugar para ver o sol baixar.', 'assets/images/ambientes/mesas-praia-sol-poente.jpg', 140, 3, 'areia'),
  ('Salão Coberto Entrada', 'Logo na entrada da barraca: prático para chegar e sentar.', 'assets/images/ambientes/salao-coberto-entrada.jpg', 90, 4, 'coberto'),
  ('Salão Coberto Central', 'Espaço central e mais reservado, bom para famílias e grupos menores.', 'assets/images/ambientes/salao-coberto-central.jpg', 50, 5, 'coberto'),
  ('Salão Coberto Central — Caminho da Praia', 'Entre a estrutura da barraca e a areia, com brisa e vista para o mar.', 'assets/images/ambientes/salao-coberto-central-caminho-praia.jpg', 122, 6, 'coberto'),
  ('Salão Coberto Praia Piscina', 'Área coberta junto à piscina, com sombra e o movimento da barraca por perto.', 'assets/images/ambientes/salao-coberto-praia-piscina.jpg', 122, 7, 'coberto'),
  ('Tendas Praia', 'Tendas 1 e 2 na faixa de areia — 6 lugares em cada.', 'assets/images/ambientes/tendas.jpg', 12, 8, 'tendas'),
  ('Tendas Central', 'Tendas 1 e 2 na área central da barraca — 6 lugares em cada.', 'assets/images/ambientes/tendas.jpg', 12, 9, 'tendas'),
  ('Tendas Superior', 'Tendas 1 e 2 na parte alta, com vista ampla do mar — 6 lugares em cada.', 'assets/images/ambientes/tendas.jpg', 12, 10, 'tendas')
) as v(nome, descricao, imagem, capacidade, ordem, categoria)
where not exists (select 1 from public.ambientes);

-- ajustes para bancos antigos
update public.ambientes set imagem = regexp_replace(imagem, '\.jpeg$', '.jpg') where imagem ~ '\.jpeg$';
update public.ambientes set categoria = case
    when nome ilike 'tenda%' then 'tendas'
    when nome ilike 'mesa%'  then 'areia'
    else 'coberto' end
 where coalesce(categoria, '') = '';
update public.reservas r set ambiente_nome = a.nome
  from public.ambientes a
 where a.id = r.ambiente_id and coalesce(r.ambiente_nome, '') = '';

-- 3. Segurança ------------------------------------------------
--    Visitante: só lê ambientes, bloqueios e configurações.
--    Reservas: só a equipe logada lê e altera. O site grava pela função do item 4.
alter table public.ambientes     enable row level security;
alter table public.reservas      enable row level security;
alter table public.bloqueios     enable row level security;
alter table public.configuracoes enable row level security;

drop policy if exists cb_amb_ler    on public.ambientes;
create policy cb_amb_ler    on public.ambientes     for select using (true);
drop policy if exists cb_amb_equipe on public.ambientes;
create policy cb_amb_equipe on public.ambientes     for all to authenticated using (true) with check (true);
drop policy if exists cb_blo_ler    on public.bloqueios;
create policy cb_blo_ler    on public.bloqueios     for select using (true);
drop policy if exists cb_blo_equipe on public.bloqueios;
create policy cb_blo_equipe on public.bloqueios     for all to authenticated using (true) with check (true);
drop policy if exists cb_cfg_ler    on public.configuracoes;
create policy cb_cfg_ler    on public.configuracoes for select using (true);
drop policy if exists cb_cfg_equipe on public.configuracoes;
create policy cb_cfg_equipe on public.configuracoes for all to authenticated using (true) with check (true);
drop policy if exists cb_res_equipe on public.reservas;
create policy cb_res_equipe on public.reservas      for all to authenticated using (true) with check (true);

revoke all on public.reservas from anon;
grant select on public.ambientes, public.bloqueios, public.configuracoes to anon;
grant select, insert, update, delete on public.ambientes, public.bloqueios, public.configuracoes, public.reservas to authenticated;

-- 4. Função que o site chama DEPOIS de abrir o WhatsApp -------
create or replace function public.registrar_reserva(
  p_codigo text, p_nome text, p_telefone text, p_email text, p_data date, p_hora text,
  p_pessoas int, p_ambiente text, p_ambiente_nome text, p_observacoes text
) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_hoje date := (now() at time zone 'America/Fortaleza')::date;
  v_dig text; v_amb uuid; v_nome text; v_recentes int;
begin
  if p_codigo is null or p_codigo !~ '^CB-[0-9]{6}-[A-Z0-9]{4}$' then raise exception 'Código inválido.'; end if;
  if exists (select 1 from reservas where codigo = p_codigo) then return p_codigo; end if;

  v_nome := btrim(left(regexp_replace(coalesce(p_nome, ''), '[[:cntrl:]]', ' ', 'g'), 80));
  v_dig  := regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g');
  if length(v_nome) < 3 then raise exception 'Nome inválido.'; end if;
  if length(v_dig) < 10 or length(v_dig) > 13 then raise exception 'WhatsApp inválido.'; end if;
  if coalesce(p_email, '') <> '' and p_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[a-z]{2,}$' then raise exception 'E-mail inválido.'; end if;
  if p_hora is null or p_hora !~ '^[0-2][0-9]:[0-5][0-9]$' then raise exception 'Horário inválido.'; end if;
  if p_pessoas is null or p_pessoas < 1 or p_pessoas > 500 then raise exception 'Pessoas inválido.'; end if;
  if p_data < v_hoje or p_data > v_hoje + 365 then raise exception 'Data inválida.'; end if;

  select count(*) into v_recentes from reservas
   where regexp_replace(telefone, '\D', '', 'g') = v_dig and created_at > now() - interval '1 hour';
  if v_recentes >= 6 then raise exception 'Muitos pedidos deste número.'; end if;

  if p_ambiente ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select id into v_amb from ambientes where id = p_ambiente::uuid;
  end if;
  if v_amb is null then
    select id into v_amb from ambientes where lower(nome) = lower(btrim(coalesce(p_ambiente_nome, ''))) limit 1;
  end if;

  insert into reservas (codigo, nome, telefone, email, data, hora, pessoas, ambiente_id, ambiente_nome, observacoes, origem, historico)
  values (p_codigo, v_nome, left(coalesce(p_telefone, ''), 25), left(coalesce(p_email, ''), 120), p_data, p_hora, p_pessoas, v_amb,
          left(coalesce(p_ambiente_nome, ''), 80), left(regexp_replace(coalesce(p_observacoes, ''), '[[:cntrl:]]', ' ', 'g'), 500), 'site',
          jsonb_build_array(jsonb_build_object('em', now(), 'texto', 'Solicitada pelo site (enviada no WhatsApp)')));
  return p_codigo;
end $$;

revoke all on function public.registrar_reserva(text,text,text,text,date,text,int,text,text,text) from public;
grant execute on function public.registrar_reserva(text,text,text,text,date,text,int,text,text,text) to anon, authenticated;

-- 5. Pasta de fotos dos ambientes (a equipe envia pelo painel)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ambientes', 'ambientes', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true;

drop policy if exists "fotos ambientes leitura"  on storage.objects;
create policy "fotos ambientes leitura"  on storage.objects for select using (bucket_id = 'ambientes');
drop policy if exists "fotos ambientes envio"    on storage.objects;
create policy "fotos ambientes envio"    on storage.objects for insert to authenticated with check (bucket_id = 'ambientes');
drop policy if exists "fotos ambientes troca"    on storage.objects;
create policy "fotos ambientes troca"    on storage.objects for update to authenticated using (bucket_id = 'ambientes');
drop policy if exists "fotos ambientes exclusao" on storage.objects;
create policy "fotos ambientes exclusao" on storage.objects for delete to authenticated using (bucket_id = 'ambientes');

-- 6. Conferência ----------------------------------------------
select 'ok' as status,
       (select count(*) from public.ambientes) as ambientes,
       (select count(*) from public.reservas)  as reservas;
