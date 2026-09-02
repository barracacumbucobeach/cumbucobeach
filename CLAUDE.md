# Instruções do projeto — Barraca Cumbuco Beach

## Páginas
Todas as páginas do site são arquivos `.html` normais na raiz (`index.html`,
`reservar.html`, `ambientes.html`, `contato.html`, `localizacao.html`,
`sucesso.html`, `politica-privacidade.html`, `admin-login.html`, `admin.html`,
`admin-reservas.html`, `admin-calendario.html`, `admin-ambientes.html`,
`admin-clientes.html`, `admin-relatorios.html`, `admin-configuracoes.html`).

Edite essas páginas diretamente com `str_replace_edit`. **Nunca** recriá-las como
`.dc.html`: o domínio cumbucobeach.com.br serve esses arquivos, e renomear
mudaria os endereços já publicados.

Os três componentes compartilhados continuam em `.dc.html` porque o runtime os
resolve pelo nome: `SiteHeader.dc.html`, `SiteFooter.dc.html`, `AdminSidebar.dc.html`.
Esses podem ser editados com as ferramentas `dc_*`.
