import imgWebinarMarthaBeckerCriseNaoTemHora from "../assets/eventos/webinar-martha-becker-crise-nao-tem-hora.jpg";
import imgExpoIndustria2026 from "../assets/eventos/expo-industria-2026.jpg";
import imgAraucariaGlobalConexoesParaOMundo from "../assets/eventos/araucaria-global-conexoes-para-o-mundo.jpg";
import imgFniSc from "../assets/eventos/fni-sc.jpg";
import imgHappyHourIrip from "../assets/eventos/happy-hour-irip.jpg";

export const SEED_SERVICES = [
  {
    id: "serv-seed-1",
    empresa: "Construfit",
    servico: "Solução de Controvérsias",
    data: "2026-08-28",
    valor: "",
    status: "ativo",
    notas: "",
    createdAt: Date.now(),
  },
];

export const FORCE_SERVICE_UPDATES = {
  "Construfit__Solução de Controvérsias": {
    data: "2026-08-28",
  },
};

export const SEED_CONTACTS = [
  { id: "seed-c-1", nome: "Nipun Jain", empresa: "PHARMCHEM/IPHEX", cargo: "Chairman IPHEX", email: "nipun@phrmchem.net", telefone: "91 98108 20562", createdAt: Date.now() },
  { id: "seed-c-2", nome: "Balwinder Singh Sethi", empresa: "Mankind Pharma", cargo: "Senior President - International Business", email: "balwinder.sethi@mankindpharma.com", telefone: "971 523 822 226", createdAt: Date.now() },
  { id: "seed-c-3", nome: "Sheetal Arora", empresa: "Mankind Pharma", cargo: "CEO", email: "sheetalarora@mankindpharma.com", telefone: "011 46846700", createdAt: Date.now() },
  { id: "seed-c-4", nome: "Partha Sengupta", empresa: "Mankind Pharma", cargo: "President & Head", email: "partha.sengupta@mankindpharma.com", telefone: "91 9871122280", createdAt: Date.now() },
  { id: "seed-c-5", nome: "Shubham Bhargava", empresa: "Mankind Pharma", cargo: "Manager International Business", email: "shubham.bhargava@mankindag.com", telefone: "91 919871045689", createdAt: Date.now() },
  { id: "seed-c-6", nome: "Dr. Nimisha Singh", empresa: "Mankind Pharma", cargo: "Deputy Manager - International Business", email: "nimisha.singh@mankindpharma.com", telefone: "91 9879210396", createdAt: Date.now() },
  { id: "seed-c-7", nome: "Soniyaa Malik Arora", empresa: "Apollo Hospitals Indraprastha", cargo: "Deputy Manager - International Patient Services", email: "sonia_a@apollohospitals.com", telefone: "91 9650610581", createdAt: Date.now() },
  { id: "seed-c-8", nome: "Dr. Gaurav Katyal", empresa: "Apollo Hospitals Indraprastha", cargo: "COO", email: "drgaurav_k@apollohospitals.com", telefone: "91 9873217415", createdAt: Date.now() },
  { id: "seed-c-9", nome: "Manoj Kumar", empresa: "Artemis Hospitals", cargo: "CMO - International & Domestic", email: "manoj.kumar@artemishospitals.com", telefone: "91 9871586852", createdAt: Date.now() },
  { id: "seed-c-10", nome: "Dr. Shyam Sunder Mahansaria", empresa: "Artemis Hospitals", cargo: "Sr. Consultant - Liver Transplant & Gastro Intestinal Surgery", email: "shyams.mahansaria@artemishospitals.com", telefone: "91 9540 9468 36", createdAt: Date.now() },
  { id: "seed-c-11", nome: "Dr. Giriraj Singh Bora", empresa: "Artemis Hospitals", cargo: "Chief - Liver Transplant & Sr. Consultant", email: "giriraj.bora@artemishospitals.com", telefone: "91 9873 7089 79", createdAt: Date.now() },
  { id: "seed-c-12", nome: "Aaryaman Baid", empresa: "Poly Medicure", cargo: "Senior Manager - Corporate Strategy", email: "aaryaman.baid@polymedicure.com", telefone: "91 11 33550700", createdAt: Date.now() },
];

export const SEED_ROTINA_TASKS = [
  { id: "rot-1", text: "Atualizar reuniões a seguir" },
];

export const SEED_EVENTS = [
  {
    id: "seed-e-araucaria",
    nome: "Araucária Global - Conexões para o Mundo",
    data: "2026-09-21",
    horario: "08:00 – 12:00",
    local: "AECIAR - Av. das Araucárias, 5005, Chapada, Araucária/PR",
    tipo: "Feira/Exposição",
    status: "confirmado",
    descricao: "Evento de conexões internacionais promovido pela AECIAR, PEIEX e Sebrae, preparando Araucária para novas oportunidades de exportação e comércio exterior.",
    registro: "https://drive.google.com/file/d/1JdfQlItBraNpLtFkmDXxj0YJTANk-6Iv/view?usp=sharing",
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

export const FORCE_EVENT_UPDATES = {
  "Webinar Martha Becker | Crise não tem hora": {
    registro: imgWebinarMarthaBeckerCriseNaoTemHora,
  },
  "Expo + Indústria 2026": {
    registro: imgExpoIndustria2026,
  },
  "Araucária Global - Conexões para o Mundo": {
    registro: imgAraucariaGlobalConexoesParaOMundo,
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

export const ESTADOS_CONHECIDOS = {
  "Alexander Advogados": "SC",
  "Andersen Ballão Advocacia": "PR",
  "CSS": "PR",
};

export const FORCE_MEMBER_UPDATES = {
  "Alexander Advogados": { estado: "SC" },
  "Andersen Ballão Advocacia": { estado: "PR" },
  "CSS": { estado: "PR" },
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
];
