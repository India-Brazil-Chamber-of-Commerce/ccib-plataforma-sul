export function blankContact() {
  return {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    nome: "",
    empresa: "",
    email: "",
    telefone: "",
    cargo: "",
    setor: "",
    createdAt: Date.now(),
  };
}

export function blankMeeting() {
  return {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    nome: "",
    data: "",
    horario: "",
    participantes: "",
    local: "",
    responsavel: "bianca",
    status: "agendada",
    notas: "",
    createdAt: Date.now(),
  };
}

export function blankPartner() {
  return {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    nome: "",
    tipoParceria: "",
    estado: "",
    responsavel: "bianca",
    status: "negociacao",
    contato: "",
    notas: "",
    createdAt: Date.now(),
  };
}

export function blankMember() {
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    nome: "",
    modalidade: "",
    tipoVinculo: "",
    periodicidade: "",
    valor: "",
    taxaSucesso: "",
    estado: "",
    responsavel: "bianca",
    status: "prospeccao",
    contato: "",
    dataAdesao: "",
    notas: "",
    createdAt: Date.now(),
  };
}

export function blankEvent() {
  return {
    id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    nome: "",
    data: "",
    horario: "",
    local: "",
    tipo: "Missão empresarial",
    status: "planejado",
    descricao: "",
    registro: "",
    createdAt: Date.now(),
  };
}
