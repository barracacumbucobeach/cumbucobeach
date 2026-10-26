-- Remove a tolerância de 20 minutos do texto das condições (rode uma vez)
update public.configuracoes
   set dados = coalesce(dados, '{}'::jsonb) || jsonb_build_object('politica',
       'A reserva é uma solicitação e só vale após a confirmação da Barraca Cumbuco Beach pelo WhatsApp. Cancelamentos devem ser avisados pelo WhatsApp.')
 where id = 1;
select dados->>'politica' as condicoes from public.configuracoes where id = 1;
