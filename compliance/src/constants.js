// Chaves de armazenamento: cada módulo da plataforma guarda sua própria lista.
// O prefixo "ccib-compliance-" evita misturar com os dados da Plataforma Regional Sul.
export const STORAGE = {
  acoes: "ccib-compliance-acoes",
  indicadores: "ccib-compliance-indicadores",
  politicas: "ccib-compliance-politicas",
  treinamentosAnuais: "ccib-compliance-treinamentos-anuais",
  treinamentosPendentes: "ccib-compliance-treinamentos-pendentes",
  treinamentos: "ccib-compliance-treinamentos",
  dueDiligence: "ccib-compliance-due-diligence",
  conflitos: "ccib-compliance-conflitos",
  brindes: "ccib-compliance-brindes",
  agentes: "ccib-compliance-agentes-publicos",
  eventosFuturos: "ccib-compliance-eventos-futuros",
  eventosPassados: "ccib-compliance-eventos-passados",
  duvidas: "ccib-compliance-duvidas",
};

// Chave pública do Web3Forms: os formulários enviam um e-mail para a caixa cadastrada nessa conta.
export const WEB3FORMS_KEY = "d87a9818-8f8e-4b0c-8640-0c343c6172fd";

export const CANAL_DENUNCIAS_URL = "https://sgcompliance.net/sg/camara-de-comercio-india-brasil/";

export const STATUS_POLITICA = ["Vigente", "Em revisão", "Vencida", "Rascunho"];
export const CATEGORIAS_POLITICA = ["Institucional", "Ética e conduta", "Terceiros", "Governança", "Conduta comercial", "Outro"];
export const STATUS_ANUAL = ["Concluído", "Em andamento", "Pendente"];
export const TIPOS_DUE_DILIGENCE = ["Novo associado", "Fornecedor", "Parceiro", "Patrocinador", "Outro"];
export const NIVEIS_RISCO = ["Baixo", "Médio", "Alto"];
export const STATUS_DUE_DILIGENCE = ["Em andamento", "Finalizada", "Reprovada"];
export const NATUREZAS_CONFLITO = [
  "Relação familiar com associado/fornecedor",
  "Participação societária",
  "Atividade profissional paralela",
  "Recebimento de brinde/benefício relevante",
  "Outro",
];
export const ANALISE_CONFLITO = ["Em análise", "Sem conflito", "Conflito mitigado", "Conflito confirmado"];
export const DIRECOES_BRINDE = ["Recebido", "Oferecido"];
export const SIM_NAO = ["Não", "Sim"];
export const TIPOS_EVENTO = ["Jornada/Semana de compliance", "Webinar", "Treinamento", "Evento institucional", "Outro"];
export const STATUS_EVENTO = ["Previsto", "Confirmado", "Cancelado"];
export const STATUS_DUVIDA = ["Aberta", "Respondida"];

// Cor da etiqueta de cada valor (verde = ok, âmbar = atenção, vermelho = problema)
const CORES = {
  green: ["Vigente", "Concluído", "Finalizada", "Baixo", "Sem conflito", "Conflito mitigado", "Confirmado", "Respondida", "Sim"],
  amber: ["Em revisão", "Rascunho", "Em andamento", "Pendente", "Médio", "Em análise", "Previsto", "Aberta"],
  red: ["Vencida", "Reprovada", "Alto", "Conflito confirmado", "Cancelado"],
};

export function tagColor(value) {
  if (CORES.green.includes(value)) return "green";
  if (CORES.amber.includes(value)) return "amber";
  if (CORES.red.includes(value)) return "red";
  return "gray";
}
