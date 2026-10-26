/* ============================================================
   BARRACA CUMBUCO BEACH — configuração do site
   Edite só os valores entre aspas.
   ============================================================ */
window.CB_CONFIG = {
  nome: 'Barraca Cumbuco Beach',

  /* WhatsApp que recebe as reservas (DDI + DDD + número, só dígitos) */
  whatsappNumero: '5585981777390',
  whatsappTexto: '(85) 98177-7390',

  endereco: 'Av. Central, 49 - Tabuba, Caucaia - CE, 61618-015',
  mapsLink: 'https://maps.app.goo.gl/jsNdkVAp4xNY5VxE6',
  mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248.862184079914!2d-38.71158384872602!3d-3.6342301194150313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7c0cb8c34ad764b%3A0x6885a8fcc3966488!2sBarraca%20Cumbuco%20Beach!5e0!3m2!1spt-BR!2sbr!4v1788209777991!5m2!1spt-BR!2sbr',
  instagram: 'https://www.instagram.com/cumbucobeachbrasil/',
  instagramUser: '@cumbucobeachbrasil',
  funcionamento: 'Todos os dias, das 9h às 17h',

  /* ------------------------------------------------------------
     BANCO COMPARTILHADO (Supabase) — painel da equipe
     O WhatsApp funciona sempre, com ou sem banco. O banco só serve
     para a equipe ver as reservas juntas no painel.
     Para desligar o banco, deixe os dois campos vazios ('').
     A "publishable key" é pública por natureza; NUNCA coloque aqui
     a "secret key".
     ------------------------------------------------------------ */
  supabaseUrl: 'https://czctzdqipmowgckicwhj.supabase.co',
  supabaseChave: 'sb_publishable_QKab9NHWrJJHcB1HL4sHBA_TmnIPSzX'
};
