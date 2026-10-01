import imgWebinarMarthaBeckerCriseNaoTemHora from "../assets/eventos/webinar-martha-becker-crise-nao-tem-hora.jpg";
import imgExpoIndustria2026 from "../assets/eventos/expo-industria-2026.jpg";
import imgFniSc from "../assets/eventos/fni-sc.jpg";
import imgHappyHourIrip from "../assets/eventos/happy-hour-irip.jpg";
import imgSaoJoseDasNacoes from "../assets/eventos/sao-jose-das-nacoes.webp";

export const SEED_CONTACTS = [
  { id: "seed-c-1", nome: "Nipun Jain", empresa: "PHARMCHEM/IPHEX", cargo: "Chairman IPHEX", email: "nipun@phrmchem.net", telefone: "91 98108 20562", setor: "Saúde", createdAt: Date.now() },
  { id: "seed-c-2", nome: "Balwinder Singh Sethi", empresa: "Mankind Pharma", cargo: "Senior President - International Business", email: "balwinder.sethi@mankindpharma.com", telefone: "971 523 822 226", setor: "Saúde", createdAt: Date.now() },
  { id: "seed-c-3", nome: "Sheetal Arora", empresa: "Mankind Pharma", cargo: "CEO", email: "sheetalarora@mankindpharma.com", telefone: "011 46846700", setor: "Saúde", createdAt: Date.now() },
  { id: "seed-c-4", nome: "Partha Sengupta", empresa: "Mankind Pharma", cargo: "President & Head", email: "partha.sengupta@mankindpharma.com", telefone: "91 9871122280", setor: "Saúde", createdAt: Date.now() },
  { id: "seed-c-5", nome: "Shubham Bhargava", empresa: "Mankind Pharma", cargo: "Manager International Business", email: "shubham.bhargava@mankindag.com", telefone: "91 919871045689", setor: "Saúde", createdAt: Date.now() },
  { id: "seed-c-6", nome: "Dr. Nimisha Singh", empresa: "Mankind Pharma", cargo: "Deputy Manager - International Business", email: "nimisha.singh@mankindpharma.com", telefone: "91 9879210396", setor: "Saúde", createdAt: Date.now() },
  { id: "seed-c-7", nome: "Soniyaa Malik Arora", empresa: "Apollo Hospitals Indraprastha", cargo: "Deputy Manager - International Patient Services", email: "sonia_a@apollohospitals.com", telefone: "91 9650610581", setor: "Saúde", createdAt: Date.now() },
  { id: "seed-c-8", nome: "Dr. Gaurav Katyal", empresa: "Apollo Hospitals Indraprastha", cargo: "COO", email: "drgaurav_k@apollohospitals.com", telefone: "91 9873217415", setor: "Saúde", createdAt: Date.now() },
  { id: "seed-c-9", nome: "Manoj Kumar", empresa: "Artemis Hospitals", cargo: "CMO - International & Domestic", email: "manoj.kumar@artemishospitals.com", telefone: "91 9871586852", setor: "Saúde", createdAt: Date.now() },
  { id: "seed-c-10", nome: "Dr. Shyam Sunder Mahansaria", empresa: "Artemis Hospitals", cargo: "Sr. Consultant - Liver Transplant & Gastro Intestinal Surgery", email: "shyams.mahansaria@artemishospitals.com", telefone: "91 9540 9468 36", setor: "Saúde", createdAt: Date.now() },
  { id: "seed-c-11", nome: "Dr. Giriraj Singh Bora", empresa: "Artemis Hospitals", cargo: "Chief - Liver Transplant & Sr. Consultant", email: "giriraj.bora@artemishospitals.com", telefone: "91 9873 7089 79", setor: "Saúde", createdAt: Date.now() },
  { id: "seed-c-12", nome: "Aaryaman Baid", empresa: "Poly Medicure", cargo: "Senior Manager - Corporate Strategy", email: "aaryaman.baid@polymedicure.com", telefone: "91 11 33550700", setor: "Saúde", createdAt: Date.now() },
];

export const SEED_EVENTS = [
  {
    id: "seed-e-sao-jose-das-nacoes",
    nome: "São José das Nações - Perspectivas globais, oportunidades locais",
    data: "2026-10-26",
    horario: "19:00 – 22:00",
    local: "ACIAP São José dos Pinhais - Rua Joaquim Nabuco, 1869, São José dos Pinhais/PR",
    tipo: "Webinar/Seminário",
    status: "planejado",
    descricao: "Encontro promovido pelo SEBRAE, por meio do PEIEX, em parceria com a ACIAP São José dos Pinhais, para empresas que desejam conhecer novas possibilidades e dar os primeiros passos rumo ao mercado internacional. Programação: experiências reais de empresas que já atravessaram fronteiras, desafios e oportunidades do comércio exterior e iniciativas e instituições que apoiam a internacionalização. Vagas limitadas, com inscrição.",
    registro: imgSaoJoseDasNacoes,
    createdAt: Date.now(),
  },
  {
    id: "seed-e-4",
    nome: "Expo + Indústria 2026",
    data: "2026-08-26",
    horario: "Tarde, 26 e 27/08",
    local: "",
    tipo: "Feira/Exposição",
    status: "realizado",
    descricao: "Feira multissetorial promovida pela Fiep, com correalização do Sesi, Senai e IEL, voltada a tecnologias, serviços e soluções para aumentar produtividade, eficiência e competitividade industrial. O evento reuniu empresas, fornecedores de tecnologia, startups, investidores e lideranças industriais em rodadas de negócios, palestras e experiências práticas sobre automação, dados, integração e inteligência aplicada à indústria.",
    registro: "",
    createdAt: Date.now(),
  },
  {
    id: "seed-e-2",
    nome: "Jantar Nunesfarma 46 anos",
    data: "2026-08-28",
    horario: "19:00 – 22:00",
    local: "",
    tipo: "Confraternização/Jantar",
    status: "confirmado",
    descricao: "",
    registro: "",
    createdAt: Date.now(),
  },
  {
    id: "seed-e-3",
    nome: "Happy Hour IRIP",
    data: "2026-07-20",
    horario: "",
    local: "",
    tipo: "Confraternização/Jantar",
    status: "realizado",
    descricao: "",
    registro: "https://drive.google.com/file/d/1veQbyNYRNB5IzTAKPFfZXYDefYz21gyW/view?usp=drive_link",
    createdAt: Date.now(),
  },
];

// Eventos removidos a pedido. São apagados também dos dados já salvos nos navegadores.
export const REMOVED_EVENTS = {
  ids: ["seed-e-araucaria"],
  nomes: ["Araucária Global - Conexões para o Mundo"],
};

export const FORCE_EVENT_UPDATES = {
  "Webinar Martha Becker | Crise não tem hora": {
    registro: imgWebinarMarthaBeckerCriseNaoTemHora,
  },
  "Expo + Indústria 2026": {
    registro: imgExpoIndustria2026,
  },
  "FNI SC": {
    registro: imgFniSc,
  },
  "Happy Hour IRIP": {
    registro: imgHappyHourIrip,
  },
};

export const NOMES_MAPA_ASSOCIADOS = [
  "Andersen Ballão Advocacia",
  "CSS",
  "NF",
  "Packem",
  "TCS",
  "Grupo UNUS",
  "Nanofert",
  "Grupo Potencial",
  "WEG",
  "Embraco Nidec",
  "Alexander Advogados",
  "Guararapes",
  "Galiotto",
  "Taurus",
  "Suvalan",
];

// Empresas importadas do HubSpot. Entram como prospects e são acrescentadas
// também para quem já tem dados salvos (ver ENSURE_MEMBERS), sem substituir nada.
export const NOMES_HUBSPOT_PROSPECCAO = [
  "GreenField International",
  "Try Brazil",
  "Konei Group",
  "Latina Cobranças",
  "Construfit",
  "Rocket Logistics",
  "COLVENBRASIL",
  "Motherson",
  "Nutrioil",
  "Methal Agriculture",
  "Kamea",
  "Sic-Ecco",
  "TLC Agro",
  "Robustec",
  "Tecnova Reciclagem de Metais",
  "American Nutrients",
  "ZM Bombas",
  "Guibon",
  "Vale Deserto Equipamentos",
  "Podium Alimentos",
  "GPX Tecnologia e Investimento",
  "Wesen Green",
  "Intecso",
  "Cadarn",
  "Savino Del Bene",
  "Bindflow",
  "Vitalizem",
  "Ideker",
  "Grupo Vita",
  "Vapza Alimentos",
  "Invictus Tactical",
  "EBANX",
  "Duas Rodas",
  "Rac Engenharia",
  "Akiyama Biometric Solutions",
  "Audaces",
  "Perto",
  "Fasttel Engenharia S.A.",
  "C.Vale - Cooperativa Agroindustrial",
  "Be8",
  "Intertrading Investimentos",
  "Grupo Boticário",
  "Amafil",
  "Certano Comercial de Alimentos",
  "Ecovis Serviços",
  "TCP - Terminal de Contêineres de Paranaguá",
  "HELWB",
  "Nutrimental",
  "bellofoods.com.br",
  "kie-tec",
  "TECNOVIN DO BRASIL",
  "Brazcac",
  "Erva Mate Paraná",
  "Universidade Positivo",
];

export const ESTADOS_CONHECIDOS = {
  "Alexander Advogados": "SC",
  "Andersen Ballão Advocacia": "PR",
  "CSS": "PR",
  "GreenField International": "PR",
  "Try Brazil": "PR",
  "Konei Group": "PR",
  "Latina Cobranças": "SC",
  "American Nutrients": "RS",
  "ZM Bombas": "PR",
  "Wesen Green": "SP",
  "Intecso": "PR",
  "Vitalizem": "PR",
  "HELWB": "SC",
  "Erva Mate Paraná": "PR",
};

export const FORCE_MEMBER_UPDATES = {
  "Alexander Advogados": { estado: "SC" },
  "Andersen Ballão Advocacia": { estado: "PR" },
  "CSS": { estado: "PR" },
};

// Textos acrescentados ao final das notas de uma empresa (sem apagar o que já está escrito).
// Só entram uma vez: se o texto já estiver nas notas, nada muda.
export const APPEND_MEMBER_NOTES = {
  "Construfit": "Serviço contratado: Solução de Controvérsias (28/08/2026)",
};

export const SEED_MEMBERS = NOMES_MAPA_ASSOCIADOS.map((nome, i) => ({
  id: `seed-m-${i}`,
  nome,
  modalidade: "",
  tipoVinculo: "",
  periodicidade: "",
  valor: "",
  taxaSucesso: "",
  estado: ESTADOS_CONHECIDOS[nome] || "",
  responsavel: "ambos",
  status: "ativo",
  contato: "",
  dataAdesao: "",
  notas: "",
  createdAt: Date.now() - (NOMES_MAPA_ASSOCIADOS.length - i) * 1000,
}));

export const EMPRESAS_HUBSPOT_PROSPECCAO = NOMES_HUBSPOT_PROSPECCAO.map((nome, i) => ({
  id: `seed-hs-${i}`,
  nome,
  modalidade: "",
  tipoVinculo: "",
  periodicidade: "",
  valor: "",
  taxaSucesso: "",
  estado: ESTADOS_CONHECIDOS[nome] || "",
  responsavel: "ambos",
  status: "prospeccao",
  contato: "",
  dataAdesao: "",
  notas: "Importado do HubSpot",
  createdAt: Date.now(),
}));

export const ENSURE_MEMBERS = [
  {
    id: "seed-m-nunesfarma",
    nome: "Nunesfarma",
    modalidade: "Taj 1",
    tipoVinculo: "Associação",
    periodicidade: "Mensal",
    valor: "R$ 810,00",
    taxaSucesso: "",
    estado: "",
    responsavel: "ambos",
    status: "ativo",
    contato: "",
    dataAdesao: "",
    notas: "",
    createdAt: Date.now(),
  },
  {
    id: "seed-m-dosulpneus",
    nome: "Do Sul Pneus",
    modalidade: "Institucional",
    tipoVinculo: "",
    periodicidade: "",
    valor: "",
    taxaSucesso: "",
    estado: "",
    responsavel: "ambos",
    status: "ativo",
    contato: "",
    dataAdesao: "",
    notas: "",
    createdAt: Date.now(),
  },
  ...EMPRESAS_HUBSPOT_PROSPECCAO,
];
