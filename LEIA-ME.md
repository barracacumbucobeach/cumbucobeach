# Barraca Cumbuco Beach — Site de reservas

Site em HTML, CSS e JavaScript puro, com dois caminhos que trabalham juntos:

1. **WhatsApp (sempre funciona):** o cliente preenche local, data, horário, pessoas, nome, WhatsApp e e-mail. Ao tocar em **Enviar reserva pelo WhatsApp**, abre o WhatsApp com a mensagem pronta para **(85) 98177-7390**. Isso não depende de banco nenhum.
2. **Supabase (painel da equipe):** logo depois de abrir o WhatsApp, o site manda a mesma reserva para o banco, em segundo plano. No painel, toda a equipe vê as reservas que chegaram, quantas pessoas, o que falta confirmar — e o painel se atualiza sozinho a cada 20 segundos.

**Se o Supabase estiver em pausa ou fora do ar:** o cliente não percebe nada e o WhatsApp funciona normalmente. O painel mostra "Banco fora do ar" e libera o botão **Colar do WhatsApp**: a equipe cola a mensagem recebida, e a reserva fica guardada no aparelho. Quando o banco volta, tudo sobe sozinho.

---

## Instalação (uma vez)

### 1. Acordar o banco e atualizar
1. Entre em supabase.com › projeto da barraca. Se aparecer **Paused**, clique em **Restore project** e aguarde alguns minutos.
2. Abra **SQL Editor › New query**, cole o arquivo `sql/banco-supabase.sql` inteiro e clique em **Run**. Ele cria tudo num projeto novo, ou só completa o que falta num projeto antigo — e não apaga nada. Deve aparecer `ok` com o número de ambientes e reservas.
3. Em **Authentication › Users**, confira os e-mails da equipe. Para incluir alguém: **Add user › Create new user**, marque **Auto Confirm User**.

### 2. Publicar o site
Envie todos os arquivos desta pasta para onde o domínio cumbucobeach.com.br está publicado, mantendo as pastas. Os endereços antigos continuam funcionando (`index.html`, `reservar.html`, `admin-login.html`, `admin-*.html`…).

Arquivos antigos que podem ser apagados: `support.js`, todos os `*.dc.html`, `js/cloud.js`, `js/supabase-config.js`, `js/alerta.js`, pasta `uploads/`, `CLAUDE.md`, `github.md`, `README.md` antigo e as fotos antigas `.jpeg`/`.png` de `assets/images/` (as novas são `.jpg`).

### 3. Despertador do banco (evita a pausa)
O plano grátis do Supabase pausa o projeto depois de 7 dias sem uso. O arquivo `.github/workflows/manter-supabase-ativo.yml` faz o GitHub consultar o banco a cada 3 dias.

- Ele precisa estar num repositório do GitHub (pode ser o próprio repositório do site). Pelo site do GitHub: **Add file › Create new file**, nome `.github/workflows/manter-supabase-ativo.yml`, cole o conteúdo e salve.
- Teste: aba **Actions › Manter Supabase ativo › Run workflow**. Verde = banco respondeu.
- O GitHub desliga robôs agendados de repositórios sem nenhuma alteração por 60 dias. Se isso acontecer, ele avisa por e-mail; é só clicar em **Enable workflow** de novo.
- Mesmo que o banco pause, nada quebra para o cliente — só o painel passa para o modo WhatsApp até alguém clicar em **Restore project**.

---

## Painel da equipe

- Endereço: `admin-login.html` (link "Área da equipe" no rodapé).
- **Com o banco:** entre com **e-mail e senha** da equipe (os do Supabase).
- **Sem o banco (modo WhatsApp):** deixe o e-mail em branco e use a **senha do modo WhatsApp** — inicial `cumbuco2026`, troque em Configurações.
- O indicador no canto do menu mostra o estado: **Banco conectado** (verde) ou **Banco fora do ar / Modo WhatsApp** (amarelo).
- Na reserva: **Confirmar e avisar** muda o status e abre o WhatsApp do cliente com a confirmação pronta. **Cancelar e avisar** faz o mesmo com o cancelamento.
- Com o banco conectado, horários, mensagens, ambientes e bloqueios salvos no painel valem para o site e para toda a equipe.

## Onde mudar as coisas

| O quê | Onde |
|---|---|
| WhatsApp, endereço, Instagram, mapa, endereço do Supabase | `js/config.js` |
| Horários de reserva, mensagens, condições | Painel › Configurações |
| Ambientes, fotos, capacidade | Painel › Ambientes (fotos em `assets/images/ambientes/`) |
| Texto da mensagem que o cliente envia | `js/whatsapp.js` (mantenha os rótulos `Nome:`, `WhatsApp:`, `Local:`… para o "Colar do WhatsApp" continuar lendo) |
| Cores e fontes | `css/site.css` (topo do arquivo) |

Para desligar o Supabase de vez, deixe `supabaseUrl` e `supabaseChave` vazios em `js/config.js`: o site continua 100% pelo WhatsApp e o painel passa a guardar os dados só no aparelho.
