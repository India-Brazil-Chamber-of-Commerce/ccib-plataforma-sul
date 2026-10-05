export const STORAGE_MEMBERS = "ccib-sul-associados";

export const STORAGE_EVENTS = "ccib-sul-eventos";

export const STORAGE_MEETINGS = "ccib-sul-reunioes";

export const STORAGE_PARTNERS = "ccib-sul-parceiros";

export const STORAGE_CONTACTS = "ccib-sul-contatos";

export const STORAGE_PROJECTS = "ccib-sul-projetos";

export const ESTADOS = ["PR", "SC", "RS", "Outro"];

export const RESPONSAVEIS = [
  { id: "bianca", label: "Bianca", accent: "#B8752E" },
  { id: "gustavo", label: "Gustavo", accent: "#B5533C" },
  { id: "ambos", label: "Gustavo + Bianca", accent: "#0E7C3A" },
];

export const STATUS_MEMBER = {
  prospeccao: { label: "Em prospecção", color: "#B8752E" },
  negociacao: { label: "Em negociação", color: "#2F6FB0" },
  ativo: { label: "Ativo", color: "#0E7C3A" },
  perdido: { label: "Negócio perdido", color: "#C1502E" },
  inativo: { label: "Inativo", color: "#8992A6" },
};

export const TIPOS_EVENTO = [
  "Missão empresarial",
  "Feira/Exposição",
  "Webinar/Seminário",
  "Visita institucional",
  "Confraternização/Jantar",
  "Outro",
];

export const STATUS_EVENTO = {
  planejado: { label: "Planejado", color: "#8992A6" },
  confirmado: { label: "Confirmado", color: "#0E7C3A" },
  realizado: { label: "Realizado", color: "#B8752E" },
  cancelado: { label: "Cancelado", color: "#C1502E" },
};

export const STATUS_MEETING = {
  agendada: { label: "Agendada", color: "#8992A6" },
  confirmada: { label: "Confirmada", color: "#0E7C3A" },
  realizada: { label: "Realizada", color: "#B8752E" },
  cancelada: { label: "Cancelada", color: "#C1502E" },
};

export const STATUS_PARTNER = {
  negociacao: { label: "Em negociação", color: "#B8752E" },
  ativo: { label: "Ativo", color: "#0E7C3A" },
  inativo: { label: "Inativo", color: "#8992A6" },
};

export const PERIODICIDADES = ["Mensal", "Trimestral", "Semestral", "Anual", "Outro"];

export const STATUS_PROJETO = {
  ideia: { label: "Ideia", color: "#8992A6" },
  planejamento: { label: "Em planejamento", color: "#B8752E" },
  andamento: { label: "Em andamento", color: "#2F6FB0" },
  concluido: { label: "Concluído", color: "#0E7C3A" },
};
