-- Ajuste do horário limite de reservas: último horário passa a ser 14:30.
-- Rode uma vez no SQL Editor do Supabase.

update public.configuracoes
   set dados = coalesce(dados, '{}'::jsonb) || jsonb_build_object(
     'horaInicio',     '09:00',
     'horaFim',        '14:30',
     'limiteRevisado', true
   )
 where id = 1;

select dados->>'horaInicio' as abre, dados->>'horaFim' as ultimo_horario
  from public.configuracoes where id = 1;
