// Atas registradas pela equipe via Claude. Cada ata entra uma única vez no banco compartilhado
// (o id fica marcado em "ccib-sul-atas-sementes"); depois disso, edições e exclusões feitas na
// plataforma prevalecem e a ata não volta.
export const SEED_ATAS = [
  {
    id: "seed-ata-20261118-monica-gianotti",
    titulo: "Reunião: CCIB Sul & Mônica Gianotti",
    empresa: "Mônica Gianotti",
    data: "2026-11-18",
    horario: "14:30 – 15:30",
    tipo: "Parceria",
    responsavel: "ambos",
    participantesCcib: "Bianca Guimarães, Gustavo Bastos",
    participantesEmpresa: "Mônica Gianotti",
    local: "Microsoft Teams",
    objetivo: "Apresentar a CCIB à Mônica Gianotti e explorar oportunidades de cooperação no setor de cosméticos com a Índia.",
    pontos: [
      "Mônica atua em projetos em fábricas diferentes.",
      "Faz o processo de P&D de empresas farmacêuticas, de cosméticos e de farmácias: não faz a parte comercial, atua na parte de trás (desenvolvimento).",
      "Teve interesse em conhecer a CCIB.",
      "Perguntou sobre a missão do Gallani.",
      "Quis entender a atuação da CCIB em cosméticos.",
      "Ela pode avaliar produtos: entender a performance e ver se fazem sentido para o cabelo dos brasileiros e das brasileiras.",
      "Coreia citada como caso bem-sucedido, com ação de governo bem-sucedida.",
      "Geralmente as empresas que revendem não querem o produto pronto: querem customizar o produto.",
      "Interesse especial em filtro solar, com a Índia como grande produtor.",
      "Há espaço tanto para o mercado popular quanto para o mercado premium.",
    ].join("\n"),
    oportunidades: [
      "Importação de produtos indianos com distribuição por empresas brasileiras (produção a baixo custo).",
      "Fabricantes indianos white label para empresas brasileiras, de preferência já presentes no Brasil.",
      "Compra de matéria-prima diretamente na Índia, sem passar por distribuidor (que fica com uma margem grande).",
      "Filtro solar: Índia como grande produtor, com espaço nos mercados popular e premium.",
    ].join("\n"),
    decisoes: "",
    observacoes: "",
    acoes: [
      { id: "seed-ata-monica-acao-1", texto: "1º passo: enviar os produtos para a Mônica avaliar", quem: "", prazo: "", feito: false },
      { id: "seed-ata-monica-acao-2", texto: "2º passo: mapear fornecedores indianos (de preferência presentes no Brasil) que atuem como fabricantes white label para empresas brasileiras", quem: "", prazo: "", feito: false },
      { id: "seed-ata-monica-acao-3", texto: "3º passo: buscar matéria-prima na Índia, direto com o fabricante, sem distribuidor", quem: "", prazo: "", feito: false },
    ],
    proximoContato: "",
    status: "rascunho",
    reuniaoId: "teams-auto-20261118-ccib-sul-monica-gianotti",
    criadaEm: 1795016400000,
    atualizadaEm: 1795016400000,
  },
];
