# BARRACA CUMBUCO BEACH — Sistema de Reservas

Sistema completo de reservas de mesas e ambientes, feito **somente com HTML, CSS e JavaScript**.
Não usa React, Vue, Angular, Bootstrap, jQuery, Node, PHP, Python ou banco de dados externo.

**Barraca Cumbuco Beach** — Av. Central, 49 - Tabuba, Caucaia - CE, 61618-015 — WhatsApp (85) 98177-7390

---

## Como abrir

Abra `index.html` no navegador. Todas as páginas funcionam sem servidor.

> Os arquivos de página usam a extensão `.dc.html` (são páginas HTML normais, com a marcação
> encapsulada em um componente de streaming). Para publicar com nomes clássicos
> (`index.html`, `reservar.html`, …), basta renomear os arquivos e ajustar os links internos.

## Páginas

Site público
- `index.html` — home (arquivo único: é esta a página inicial, editar sempre aqui) (header, hero, sobre, ambientes, galeria, como funciona, localização, CTA, footer)
- `reservar.dc.html` — fluxo de reserva em 6 etapas
- `ambientes.dc.html` — todos os ambientes
- `localizacao.dc.html` — endereço + botão "COMO CHEGAR" (Google Maps)
- `contato.dc.html` — contato + botão "FALAR NO WHATSAPP"
- `sucesso.dc.html` — tela de sucesso / consulta de solicitação por código
- `politica-privacidade.dc.html` — LGPD

Painel administrativo
- `admin-login.dc.html` — login
- `admin.dc.html` — dashboard, dados de demonstração, backup, CSV
- `admin-reservas.dc.html` — tabela, filtros, visualizar/confirmar/cancelar/editar/excluir, histórico
- `admin-calendario.dc.html` — calendário dia/semana/mês + bloqueios
- `admin-ambientes.dc.html` — cadastro de ambientes (nome, descrição, capacidade, imagem, ordem, ativar/desativar)
- `admin-clientes.dc.html` — clientes e lista de espera
- `admin-relatorios.dc.html` — reservas por dia/ambiente/horário, cancelamentos, não comparecimentos, CSV
- `admin-configuracoes.dc.html` — estabelecimento, horários, mensagens, acesso

Componentes reutilizados: `SiteHeader.dc.html`, `SiteFooter.dc.html`, `AdminSidebar.dc.html`.

## Camadas de código

- `js/storage.js` — **única** camada de dados (`window.CB`). Nenhuma outra parte do sistema chama
  `localStorage` diretamente. Funções: `saveReservation`, `getReservations`, `getReservationById`,
  `updateReservation`, `deleteReservation`, `saveCustomer`, `getCustomers`, `saveSpace`, `getSpaces`,
  `getSettings`, `saveSettings`, `getBlocks`, `saveBlock`, `isBlocked`, `checkAvailability`,
  `getWaitlist`, `saveWaitlist`, `report`, `dashboard`, `reservationsCSV`, `exportBackup`,
  `importBackup`, `seedDemo`, `clearDemo`, `login`, `logout`, `isLogged`.
- `js/whatsapp.js` — geração das mensagens e do link `wa.me` (`window.CBWhats`). Nenhuma lógica de
  WhatsApp dentro do HTML.
- `assets/logo/logo.png` e `assets/logo/favicon.png` — logo oficial da Barraca Cumbuco Beach.

### Trocar por backend real

Reescreva **apenas** `js/storage.js`, mantendo as mesmas assinaturas e devolvendo dados da API
(REST). As telas não precisam ser alteradas.

## Acesso ao painel

Com o banco compartilhado configurado (`js/config.js`), **quem autentica é o Supabase**: e-mail e
senha cadastrados em *Authentication › Users*. Nenhuma senha existe no código do site nem no
navegador.

- Dar acesso a um funcionário: crie o usuário e marque como confirmado.
- Tirar o acesso: exclua o usuário. O efeito é imediato.
- Trocar senha: "Reset password" no próprio usuário.

Sem banco configurado o sistema entra em modo offline de demonstração, com um acesso único
(`admin` / `cumbuco-demo`) que serve apenas para ver as telas — não use em produção.

## Segurança

Rode **uma vez** `sql/seguranca.sql` no SQL Editor do Supabase, depois de `sql/supabase-completo.sql`.
Ele aplica:

- **Nenhuma credencial no banco nem no site.** Remove `adminUser`/`adminPass` das configurações e
  instala um gatilho que apaga essas chaves em qualquer gravação futura.
- **Dados pessoais fechados ao público.** O visitante não tem permissão de tabela sobre reservas,
  clientes e lista de espera. Ele lê apenas ambientes, bloqueios, configurações e a visão de vagas
  (`vagas_pub`), que traz só data, hora, ambiente e total ocupado — sem nome nem telefone.
- **Uma única porta de escrita pública**, a função `criar_reserva`, que valida nome, telefone,
  e-mail, horário, quantidade e data (não aceita passado nem mais de um ano à frente), corta
  caracteres de controle e limita tamanhos.
- **Freio contra enxurrada de pedidos:** no máximo 5 reservas por telefone por hora, 3 reservas
  ativas por telefone no mesmo dia e ambiente, e 5 entradas por hora na lista de espera.
- **Decisão de lotação dentro do banco**, com trava de linha: dois clientes no último lugar ao
  mesmo tempo — um entra, o outro recebe o aviso.

No código do site:

- O site público **nunca guarda** nome ou telefone de clientes no navegador. Ao carregar sem
  sessão, qualquer cache remanescente de um acesso anterior é apagado.
- **SAIR** apaga o cache de reservas, clientes e lista de espera — importante em computador
  compartilhado.
- Páginas do painel exigem sessão real do Supabase; a marca de sessão no navegador não dá acesso a
  dado nenhum, porque as permissões são verificadas no banco.
- Textos digitados pelo cliente são inseridos como texto (nunca como HTML) e passam por limpeza de
  caracteres de controle e limite de tamanho.
- Links externos usam `rel="noopener"` e as páginas enviam `referrer` restrito.

A chave publicável (`anonKey`) em `js/config.js` é pública por natureza — ela não dá acesso a nada
além do que as permissões acima autorizam. **Nunca** coloque no site a chave `service_role`.

Recomendações operacionais: ative *Confirm email* e a proteção contra senhas vazadas no Supabase,
use senha longa para cada funcionário, revise os usuários periodicamente e mantenha o backup em
lugar seguro (ele contém dados pessoais).

## Código da reserva

Formato `CB-AAAAMMDD-XXXXX` (ex.: `CB-20260829-00001`), sequencial por data e único.

## Status

`AGUARDANDO CONFIRMAÇÃO` · `CONFIRMADA` · `CANCELADA` · `CLIENTE CHEGOU` · `CONCLUÍDA` · `NÃO COMPARECEU`

## Contador de vagas compartilhado em tempo real (produção)

O modo local guarda os dados no navegador de cada visitante — cada celular conta só as próprias
reservas. Para o cliente ver a lotação real, os dados precisam ficar em um banco único.
O sistema já vem preparado: continua sendo HTML/CSS/JS, sem servidor para administrar.

1. Crie um projeto gratuito em supabase.com (região São Paulo).
2. Abra o **SQL Editor**, cole o conteúdo de `sql/supabase.sql` e execute. Isso cria as tabelas,
   as permissões, a função `criar_reserva` (que confere a lotação dentro do banco) e liga o
   tempo real.
3. Em **Project Settings › API**, copie a *Project URL* e a *anon public key* e cole em
   `js/supabase-config.js`.
4. Em **Authentication › Users**, crie o usuário do painel (e-mail e senha).

A partir daí, sem mudar nenhuma tela:

- a tela de escolha de ambiente mostra `X vaga(s) disponível(is) de Y`, igual para todos, e se
  atualiza sozinha quando outro cliente reserva;
- a gravação confere a lotação no banco: dois clientes no último lugar ao mesmo tempo — um entra,
  o outro é avisado e escolhe outro ambiente;
- quando todos os ambientes estão lotados no horário, o cliente é informado e pode escolher outro
  horário ou cancelar a solicitação;
- as reservas dos clientes aparecem no painel na hora, sem depender do WhatsApp.

Arquivos dessa camada: `sql/supabase.sql`, `js/supabase-config.js`, `js/cloud.js`.
Enquanto `js/supabase-config.js` estiver com os valores `SUA-...`, o sistema roda em modo local.

Envio automático da mensagem no WhatsApp do cliente exige a API oficial (WhatsApp Business Cloud
API) com número comercial verificado e modelo de mensagem aprovado pela Meta — etapa posterior,
feita por uma função do Supabase. Sem isso, o envio depende de um toque no botão verde.

## Limites do modo local (sem banco compartilhado)

- Os dados ficam no **localStorage do navegador/dispositivo** em que foram criados. O controle de
  capacidade compartilhado exige a configuração da seção anterior. O restante do texto abaixo
  descreve o comportamento sem o banco:
- O controle de
  capacidade e a lista de reservas são válidos **somente naquele navegador** — uma reserva feita no
  celular do cliente não aparece automaticamente no painel da barraca.
- O caminho prático nesta versão: o cliente envia a solicitação e usa o botão
  **"ENVIAR RESERVA PELO WHATSAPP"**; a equipe registra/gerencia no painel. Para sincronização real
  entre dispositivos, é necessário o backend (ver seção acima).
- Capacidade `0` significa "sem limite definido": o sistema não bloqueia por lotação até a equipe
  informar um número em **Ambientes**.
- As imagens são placeholders. **Não são fotografias reais da Barraca Cumbuco Beach.** Substitua os
  arquivos em `assets/images/hero/`, `assets/images/ambientes/` e `assets/images/gallery/` e informe
  o caminho da imagem no cadastro do ambiente.

## Dados de demonstração

No dashboard: **GERAR DADOS DE DEMONSTRAÇÃO** cria reservas fictícias, todas identificadas com
`(DEMO)` no nome e observação "Registro de demonstração". Use **LIMPAR DADOS DE DEMONSTRAÇÃO** para
removê-las sem afetar registros reais.

## Backup

**EXPORTAR BACKUP** gera um JSON com tudo (reservas, clientes, ambientes, bloqueios, configurações).
**IMPORTAR BACKUP** pede confirmação antes de sobrescrever os dados existentes.
**EXPORTAR CSV** gera código, nome, telefone, data, hora, pessoas, ambiente, status e observações
(separador `;`, com BOM para abrir no Excel em português).

## Testes realizados

Criar reserva · validação de data passada, telefone e e-mail · geração de código único · salvamento ·
edição · confirmação · cancelamento · alteração de status · histórico · ambiente lotado
(capacidade) · bloqueio de data/horário/ambiente · lista de espera · filtros · calendário
(dia/semana/mês) · exportação CSV · backup e restauração · login/logout · link do WhatsApp ·
responsividade de 320px a 1920px · menu mobile.
