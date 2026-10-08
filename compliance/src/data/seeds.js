// Dados iniciais, usados só na primeira vez que a plataforma abre (quando ainda não há nada salvo).
// Depois disso, valem as edições feitas na própria plataforma.

let seq = 0;
const id = (prefixo) => `${prefixo}-seed-${++seq}`;

export const SEED_ACOES = [
  { id: id("a"), titulo: "Finalização do Código de Ética", detalhe: "", feito: true },
  { id: id("a"), titulo: "Evento Martha Becker", detalhe: "", feito: true },
  { id: id("a"), titulo: "Onboarding Gabriela", detalhe: "", feito: true },
  { id: id("a"), titulo: "Revisão de processos de due diligence de integridade", detalhe: "", feito: true },
  { id: id("a"), titulo: "Código de Ética com características indianas", detalhe: "Fase de captação", feito: false },
  { id: id("a"), titulo: "Jornada de Compliance", detalhe: "Novembro", feito: false },
  { id: id("a"), titulo: "Treinamento Luiza", detalhe: "", feito: false },
  { id: id("a"), titulo: "Finalização e organização da plataforma de compliance", detalhe: "", feito: false },
];

export const SEED_INDICADORES = [
  { id: "parceiro", label: "Parceiro", valor: "SG Compliance", nota: "canal de denúncias" },
];

const DOC = (arquivo) => `/documentos/${arquivo}`;

export const SEED_POLITICAS = [
  { id: id("p"), documento: "Carta do Presidente", categoria: "Institucional", versao: "—", revisao: "2024-05-10", status: "Vigente", arquivo: DOC("Carta_do_Presidente_CCIB.pdf") },
  { id: id("p"), documento: "Código de Conduta Ética", categoria: "Ética e conduta", versao: "v01", revisao: "2024-05-21", status: "Vigente", arquivo: DOC("Codigo_de_Conduta_Etica_CCIB.pdf") },
  { id: id("p"), documento: "Política de Due Diligence de Integridade", categoria: "Terceiros", versao: "v01", revisao: "2024-05-27", status: "Vigente", arquivo: DOC("Politica_Due_Diligence_Integridade_CCIB.pdf") },
  { id: id("p"), documento: "Política de Relacionamento com Agentes Públicos", categoria: "Governança", versao: "v02", revisao: "2024-08-01", status: "Vigente", arquivo: DOC("Politica_Relacionamento_Agentes_Publicos_CCIB.pdf") },
  { id: id("p"), documento: "Política de Gestão de Conflito de Interesses", categoria: "Governança", versao: "v01", revisao: "2024-09-19", status: "Vigente", arquivo: DOC("Politica_Conflito_de_Interesses_CCIB.pdf") },
  { id: id("p"), documento: "Política de Brindes, Presentes e Entretenimento", categoria: "Conduta comercial", versao: "v01", revisao: "2024-08-20", status: "Vigente", arquivo: DOC("Politica_Brindes_Presentes_Entretenimento_CCIB.pdf") },
];

export const MODELO_ATA_TREINAMENTO = DOC("Modelo_Ata_Treinamento_Compliance_CCIB.docx");

export const SEED_TREINAMENTOS_ANUAIS = [
  { id: "anual-2025", ano: "2025", status: "Concluído", nota: "todos os colaboradores" },
  { id: "anual-2026", ano: "2026", status: "Pendente", nota: "a agendar" },
];

export const SEED_TREINAMENTOS_PENDENTES = [{ id: id("tp"), nome: "Luiza" }];

export const SEED_TREINAMENTOS = [
  { id: id("t"), data: "2026-07-13", treinamento: "Onboarding CCIB", participantes: "Isabella Cavalcante", duracao: "40 min", observacoes: "" },
  { id: id("t"), data: "2026-09-22", treinamento: "Onboarding CCIB", participantes: "Gabriela Amud", duracao: "40 min", observacoes: "" },
];

export const SEED_DUE_DILIGENCE = [
  { id: id("dd"), empresa: "Galaxy Infra & Engineering", tipo: "Novo associado", solicitante: "Escritório Índia", risco: "Médio", status: "Finalizada", observacoes: "" },
];

export const SEED_EVENTOS_FUTUROS = [
  { id: id("ef"), evento: "Jornada do Compliance", tipo: "Jornada/Semana de compliance", data: "Novembro/2026", local: "", status: "Previsto", convite: "" },
];

export const SEED_EVENTOS_PASSADOS = [
  { id: id("ep"), data: "2025", evento: "Compliance Week", local: "Online", participantes: "", resultado: "" },
  { id: id("ep"), data: "01/09/2026", evento: "Webinar Crise não Marca Hora - Martha Becker", local: "Pelo Teams", participantes: "", resultado: "Concluído" },
];

export const PACTO_GLOBAL = [
  {
    id: "agro",
    icone: "🌾",
    nome: "Agronegócio",
    participantes: "Gustavo, Luana, Isabella",
    textos: [
      "Fomenta relações comerciais responsáveis entre empresas brasileiras e indianas do setor agropecuário, apoiando missões e parcerias (como a Agroleite) alinhadas a práticas sustentáveis de produção, rastreabilidade e comércio justo.",
      "Eixos de atuação: due diligence de parceiros do agronegócio, incentivo a certificações de origem e sustentabilidade, e intermediação de negócios entre cooperativas, produtores e instituições dos dois países.",
    ],
  },
  {
    id: "anticorrupcao",
    icone: "⚖️",
    nome: "Anticorrupção",
    participantes: "Bianca, Bernardo, Leonardo",
    textos: [
      "Reforça o 10º princípio do Pacto Global: combate à corrupção em todas as suas formas, incluindo extorsão e propina. Alinha-se à Política Anticorrupção, à Política de Due Diligence de Integridade e à Política de Relacionamento com Agentes Públicos da CCIB.",
      "Eixos de atuação: due diligence de terceiros, treinamento anual de integridade, registro de reuniões com agentes públicos e canal de denúncias independente.",
    ],
  },
  {
    id: "direitos",
    icone: "🤝",
    nome: "Direitos Humanos",
    participantes: "Gabriel, Gabriela, Pedro",
    textos: [
      "Sustenta os princípios 1 e 2 do Pacto Global: apoiar e respeitar a proteção dos direitos humanos reconhecidos internacionalmente, e assegurar que a CCIB não seja cúmplice de abusos. Cobre também os princípios 3 a 6, referentes à liberdade de associação e eliminação de trabalho forçado, infantil e discriminação.",
      "Eixos de atuação: repúdio a preconceito e discriminação, promoção de oportunidades iguais e diretrizes de conduta ética previstas no Código de Conduta da CCIB.",
    ],
  },
  {
    id: "ambiente",
    icone: "🌍",
    nome: "Meio Ambiente",
    participantes: "Endryo, Isadora",
    textos: [
      "Reflete os princípios 7 a 9 do Pacto Global: apoiar uma abordagem preventiva aos desafios ambientais, promover iniciativas que ampliem a responsabilidade ambiental e incentivar o desenvolvimento e a difusão de tecnologias ambientalmente responsáveis.",
      "Eixos de atuação: incentivo a parcerias com menor impacto ambiental, atenção a critérios de sustentabilidade em missões comerciais e apoio a iniciativas indo-brasileiras de tecnologia limpa.",
    ],
  },
];

export const FAQ = [
  {
    pergunta: "Posso aceitar um convite de viagem de um associado?",
    resposta: "Depende do valor e do propósito. Registre no módulo de Brindes e Hospitalidades antes de aceitar e aguarde a aprovação da liderança.",
  },
  {
    pergunta: "Como declaro um possível conflito de interesse?",
    resposta: "Utilize o módulo Conflitos de Interesse e preencha a declaração com o máximo de detalhes. A análise é feita pela liderança da Câmara.",
  },
  {
    pergunta: "Uma empresa candidata a associada tem um processo judicial. O que fazer?",
    resposta: "Abra uma due diligence no módulo correspondente antes de prosseguir com a associação, detalhando o processo identificado.",
  },
];

// Valor inicial de cada chave de armazenamento (ver STORAGE em constants.js)
export const SEEDS = {
  acoes: SEED_ACOES,
  indicadores: SEED_INDICADORES,
  politicas: SEED_POLITICAS,
  treinamentosAnuais: SEED_TREINAMENTOS_ANUAIS,
  treinamentosPendentes: SEED_TREINAMENTOS_PENDENTES,
  treinamentos: SEED_TREINAMENTOS,
  dueDiligence: SEED_DUE_DILIGENCE,
  conflitos: [],
  brindes: [],
  agentes: [],
  eventosFuturos: SEED_EVENTOS_FUTUROS,
  eventosPassados: SEED_EVENTOS_PASSADOS,
  duvidas: [],
};
