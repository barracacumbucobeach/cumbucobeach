-- Contato oficial da barraca: (85) 98177-7390
-- Rode uma vez no SQL Editor do Supabase (ou faça pelo painel em Configurações).

update public.configuracoes
   set dados = coalesce(dados, '{}'::jsonb) || jsonb_build_object(
     'whatsapp',       '(85) 98177-7390',
     'whatsappNumero', '5585981777390'
   )
 where id = 1;

select dados->>'whatsapp' as exibido, dados->>'whatsappNumero' as link
  from public.configuracoes where id = 1;
