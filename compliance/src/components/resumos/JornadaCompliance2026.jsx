import React from "react";
import {
  Scale, ShieldCheck, Users, Eye, Brain, TriangleAlert, Target, Workflow, Layers, Lock, MessageCircle,
  ChartBar, Handshake, Search, GraduationCap, RefreshCw, Gavel, UserCheck, Ban, Sparkles, Fingerprint,
  Image, HeartHandshake, Landmark, Compass, ListChecks, EyeOff, DollarSign, Quote, Lightbulb, Route,
  Wrench, CircleHelp, Building2, Globe, KeyRound,
} from "lucide-react";

// Resumo da Jornada do Compliance 2026, feito a partir do documento
// "Resumo Detalhado: Jornada do Compliance" (anotações e slides dos painéis).
// Cada item de SLIDES é um slide 1280 x 720, usado na página e no modo apresentação.

const CONVITE = "/eventos/jornada-do-compliance-2026.png";

function Topo({ secao, titulo, cor = "azul" }) {
  return (
    <div className="sl-topo">
      <span className={`sl-secao ${cor}`}>{secao}</span>
      <h2 className="sl-titulo">{titulo}</h2>
    </div>
  );
}

function Rodape({ fonte }) {
  return (
    <div className="sl-rodape">
      <span>Jornada do Compliance 2026 · Câmara de Comércio Índia Brasil (CCIB)</span>
      {fonte && <span className="sl-fonte">{fonte}</span>}
    </div>
  );
}

function Capa() {
  return (
    <div className="sl sl-capa">
      <div className="sl-capa-texto">
        <span className="sl-kicker">Resumo para a equipe CCIB</span>
        <h1>Jornada do Compliance 2026</h1>
        <p className="sl-capa-tema">Ética na Era da Inteligência Artificial</p>
        <p className="sl-capa-sub">Diferentes perspectivas sobre os desafios éticos e de governança das novas tecnologias</p>
        <div className="sl-capa-meta">
          <span>28 de outubro de 2026</span>
          <span><em>on-line</em></span>
          <span>5 blocos de conteúdo</span>
        </div>
      </div>
      <div className="sl-capa-img"><img src={CONVITE} alt="Convite da Jornada do Compliance 2026" /></div>
    </div>
  );
}

function VisaoGeral() {
  const blocos = [
    { n: 1, icone: Compass, titulo: "Abertura", quem: "Dr. Siqueira Castro", tema: "Ética, Dharma e governança corporativa" },
    { n: 2, icone: Fingerprint, titulo: "IA e pessoas", quem: "Painel sobre IA", tema: "Privacidade, dignidade e reputação" },
    { n: 3, icone: HeartHandshake, titulo: "Cultura de integridade", quem: "SG Compliance", tema: "Cultura e diretrizes éticas para IA" },
    { n: 4, icone: Handshake, titulo: "Terceiros", quem: "Dado KPMG", tema: "Risco de terceiros e cadeia ética de valor" },
    { n: 5, icone: Gavel, titulo: "IA na prática", quem: "Andersen Ballão Advogados", tema: "Shadow AI e governança de IA" },
  ];
  return (
    <div className="sl">
      <Topo secao="Visão geral" titulo="Um evento, cinco blocos" />
      <div className="sl-trilha">
        {blocos.map((b) => (
          <div key={b.n} className="sl-trilha-item">
            <div className="sl-trilha-n">{b.n}</div>
            <b.icone size={30} className="sl-ic" />
            <strong>{b.titulo}</strong>
            <span className="sl-quem">{b.quem}</span>
            <span>{b.tema}</span>
          </div>
        ))}
      </div>
      <div className="sl-destaque">
        <Lightbulb size={26} />
        <p><strong>Fio condutor:</strong> compliance deixou de ser conformidade de papel e virou questão de <strong>cultura</strong>, de <strong>decisões difíceis</strong> e de <strong>controles proporcionais ao risco</strong>, especialmente em dois temas atuais: terceiros e inteligência artificial.</p>
      </div>
      <Rodape />
    </div>
  );
}

function Dharma() {
  return (
    <div className="sl">
      <Topo secao="Bloco 1 · Abertura · Dr. Siqueira Castro" titulo="Dharma: a ética como dever" cor="laranja" />
      <div className="sl-duas">
        <div>
          <p className="sl-lead">A fala começa pela hospitalidade e pela generosidade, e chega à tradição indiana do <strong>Dharma</strong>, que liga a ética ao papel de cada pessoa na sociedade.</p>
          <div className="sl-tres-mini">
            {[
              ["Dever moral", Scale],
              ["Conduta correta", UserCheck],
              ["Ordem que sustenta a vida em sociedade", Landmark],
            ].map(([t, I]) => (
              <div key={t} className="sl-mini"><I size={24} /><span>{t}</span></div>
            ))}
          </div>
          <p className="sl-nota">Agir de acordo com o próprio Dharma é agir de forma ética e responsável, levando em conta as circunstâncias e o papel de cada um.</p>
        </div>
        <div className="sl-painel azul">
          <span className="sl-painel-titulo">Os deveres morais incentivam</span>
          <ul className="sl-check">
            <li>Responsabilidade</li>
            <li>Justiça</li>
            <li>Honestidade</li>
            <li>Atenção ao próximo</li>
          </ul>
        </div>
      </div>
      <Rodape />
    </div>
  );
}

function Governanca() {
  const itens = [
    ["Transparência", Eye],
    ["Ética", Scale],
    ["Responsabilidade", UserCheck],
    ["Prevenção e resposta efetivas a irregularidades", ShieldCheck],
  ];
  return (
    <div className="sl">
      <Topo secao="Bloco 1 · Abertura · Dr. Siqueira Castro" titulo="Da filosofia à governança corporativa" cor="laranja" />
      <p className="sl-lead">Os compliance officers já lidam com obrigações legais todos os dias. Mas a governança moderna <strong>exige mais do que cumprir normas</strong>:</p>
      <div className="sl-quatro">
        {itens.map(([t, I]) => (
          <div key={t} className="sl-card"><I size={34} className="sl-ic" /><strong>{t}</strong></div>
        ))}
      </div>
      <div className="sl-destaque verde">
        <Building2 size={26} />
        <p>O compliance assume um <strong>papel estratégico</strong>: deixa de ser custo ou formalidade e passa a proteger a <strong>perenidade dos negócios</strong> e a construção de limites.</p>
      </div>
      <Rodape />
    </div>
  );
}

function DireitosIA() {
  const bens = [
    ["Privacidade", Lock],
    ["Intimidade", EyeOff],
    ["Reputação", Users],
    ["Dignidade", HeartHandshake],
    ["Imagem", Image],
  ];
  return (
    <div className="sl">
      <Topo secao="Bloco 2 · Inteligência artificial" titulo="IA e direitos da personalidade" cor="verde" />
      <p className="sl-lead">O uso de IA precisa considerar o impacto sobre bens muito pessoais de cada indivíduo:</p>
      <div className="sl-cinco">
        {bens.map(([t, I]) => (
          <div key={t} className="sl-circulo"><I size={38} /><strong>{t}</strong></div>
        ))}
      </div>
      <div className="sl-destaque">
        <Brain size={26} />
        <p>IA nas empresas <strong>não é só uma questão técnica ou de eficiência</strong>: envolve direitos fundamentais de pessoas reais, sejam clientes, empregados ou terceiros.</p>
      </div>
      <Rodape />
    </div>
  );
}

function Cultura() {
  const pilares = [
    { n: "01", t: "Coerência entre discurso, incentivos e consequências", d: "Não adianta o código dizer uma coisa se metas, bônus e promoções premiam outra. Se quem viola as regras e bate resultado não sofre consequência, a cultura real é a do incentivo." },
    { n: "02", t: "Confiança para falar e qualidade da resposta", d: "O canal de denúncias só funciona se as pessoas confiam que podem relatar sem retaliação e se a organização responde de forma séria e qualificada." },
    { n: "03", t: "Evidências de efetividade", d: "O programa precisa mostrar, com dados e registros, que funciona: treinamentos efetivos, apurações concluídas, medidas aplicadas e melhoria contínua." },
  ];
  return (
    <div className="sl">
      <Topo secao="Bloco 3 · SG Compliance" titulo="Cultura de integridade além do compliance de papel" cor="azul" />
      <div className="sl-tres">
        {pilares.map((p) => (
          <div key={p.n} className="sl-pilar">
            <span className="sl-pilar-n">{p.n}</span>
            <strong>{p.t}</strong>
            <p>{p.d}</p>
          </div>
        ))}
      </div>
      <Rodape />
    </div>
  );
}

function Frase() {
  return (
    <div className="sl sl-frase">
      <Quote size={64} className="sl-aspas" />
      <blockquote>A cultura se revela nas decisões sobre escolhas difíceis.</blockquote>
      <p>Valores só são testados quando há <strong>custo em segui-los</strong>: perder um negócio, atrasar uma entrega ou desligar alguém de bom desempenho que violou uma regra.</p>
      <span className="sl-autor">SG Compliance · Jornada do Compliance 2026</span>
    </div>
  );
}

function DiretrizesIA() {
  const passos = [
    { t: "Conhecer os usos e definir limites", d: "Saber onde e como a IA já é usada na organização e deixar claro o que é permitido e o que não é.", I: Search },
    { t: "Preservar responsabilidade e julgamento humano", d: "A IA apoia, mas a responsabilidade pela decisão continua sendo de pessoas.", I: UserCheck },
    { t: "Testar, monitorar e ajustar", d: "O uso de IA exige verificação contínua, e não uma aprovação única.", I: RefreshCw },
  ];
  return (
    <div className="sl">
      <Topo secao="Bloco 3 · SG Compliance" titulo="Três diretrizes éticas para o uso de IA" cor="azul" />
      <div className="sl-passos">
        {passos.map((p, i) => (
          <React.Fragment key={p.t}>
            <div className="sl-passo">
              <div className="sl-passo-ic"><p.I size={30} /></div>
              <span className="sl-passo-n">Diretriz {i + 1}</span>
              <strong>{p.t}</strong>
              <p>{p.d}</p>
            </div>
            {i < passos.length - 1 && <div className="sl-seta">›</div>}
          </React.Fragment>
        ))}
      </div>
      <Rodape />
    </div>
  );
}

function Terceiros() {
  const passos = [
    ["Reconhecer riscos para a empresa e para a sociedade", "O risco de terceiros não é só financeiro ou jurídico: também é socioambiental e reputacional."],
    ["Decidir com base em diligência", "Contratar e manter terceiros com critérios de due diligence proporcionais ao risco."],
    ["Monitorar e exercer influência positiva", "Acompanhar o terceiro depois da contratação e usar o poder de compra para elevar o padrão ético da cadeia."],
  ];
  return (
    <div className="sl">
      <Topo secao="Bloco 4 · Terceiros" titulo="Terceiros: o ponto cego do risco" cor="laranja" />
      <div className="sl-duas largo">
        <div className="sl-bigstat">
          <span className="sl-big">18%</span>
          <p>das organizações têm a gestão de riscos de terceiros <strong>plenamente integrada</strong> à gestão de riscos corporativos.</p>
          <span className="sl-fonte-inline">KPMG, Achieving resilience in third-party risk management (2026 global TPRM survey)</span>
          <p className="sl-nota">Terceiros são uma das principais portas de entrada de risco: corrupção, privacidade, trabalhista, reputação e continuidade da operação.</p>
        </div>
        <div>
          <span className="sl-painel-titulo escuro">Gestão de terceiros e cadeia ética de valor</span>
          <ol className="sl-lista-n">
            {passos.map(([t, d]) => (
              <li key={t}><strong>{t}</strong><span>{d}</span></li>
            ))}
          </ol>
        </div>
      </div>
      <Rodape />
    </div>
  );
}

function GanhosRiscos() {
  const linhas = [
    ["Petições estruturadas com auxílio de IA", "Citações fabricadas (\"alucinações\")"],
    ["Pesquisa jurisprudencial sintetizada em minutos", "Cláusulas mal interpretadas"],
    ["Análise contratual em escala antes impossível", "Dados de clientes expostos"],
  ];
  return (
    <div className="sl">
      <Topo secao="Bloco 5 · Andersen Ballão Advogados" titulo="IA é ferramenta, mas implantá-la muda o processo" cor="verde" />
      <p className="sl-lead">A IA generativa transforma <strong>fluxos, controles e responsabilidades</strong>. Ganhos e riscos andam juntos:</p>
      <div className="sl-versus">
        <div className="sl-versus-col ganho"><span className="sl-versus-tit"><Sparkles size={20} /> Ganhos possíveis</span>{linhas.map(([g]) => <div key={g}>{g}</div>)}</div>
        <div className="sl-versus-col risco"><span className="sl-versus-tit"><TriangleAlert size={20} /> Riscos proporcionais</span>{linhas.map(([, r]) => <div key={r}>{r}</div>)}</div>
      </div>
      <div className="sl-destaque verde"><ShieldCheck size={26} /><p><strong>Cada ganho exige um controle correspondente.</strong></p></div>
      <Rodape />
    </div>
  );
}

function ShadowAI() {
  const dados = [
    ["75%", "dos trabalhadores já usam IA no trabalho", "Microsoft/LinkedIn 2024"],
    ["78%", "levam suas próprias ferramentas", ""],
    ["57%", "ocultam o uso e apresentam como trabalho próprio", "KPMG 2025"],
    ["43%", "dos incidentes de segurança envolvem Shadow AI", "IBM 2026"],
    ["US$ 670 mil", "de custo médio adicional por violação causada por Shadow AI", ""],
    ["63%", "das organizações violadas não tinham política de governança de IA", ""],
  ];
  return (
    <div className="sl sl-escuro">
      <Topo secao="Bloco 5 · Andersen Ballão Advogados" titulo="Shadow AI: o elefante invisível" cor="laranja" />
      <p className="sl-lead">Uso de IA <strong>sem conhecimento ou autorização</strong> da organização. Uso sem visibilidade, risco sem controle.</p>
      <div className="sl-stats">
        {dados.map(([n, t, f]) => (
          <div key={t} className="sl-stat">
            <span className="sl-stat-n">{n}</span>
            <span className="sl-stat-t">{t}</span>
            <span className="sl-stat-f">{f || "fonte não indicada no slide"}</span>
          </div>
        ))}
      </div>
      <Rodape fonte="Dados como apresentados nos slides do painel, sem verificação nas pesquisas originais." />
    </div>
  );
}

function ProibirLiberar() {
  const dados = [
    ["90%", "das organizações bloqueiam pelo menos um aplicativo de IA", "Netskope 2026", Ban],
    ["46%", "dos funcionários continuariam usando mesmo se proibidos", "Software AG 2024", Users],
    ["41%", "encontram meios de contornar os bloqueios", "UpGuard 2025", KeyRound],
  ];
  return (
    <div className="sl">
      <Topo secao="Bloco 5 · Andersen Ballão Advogados" titulo="Nem proibir sem alternativa, nem liberar sem critério" cor="verde" />
      <div className="sl-tres">
        {dados.map(([n, t, f, I]) => (
          <div key={n} className="sl-card grande"><I size={30} className="sl-ic laranja" /><span className="sl-num">{n}</span><span>{t}</span><span className="sl-fonte-inline">{f}</span></div>
        ))}
      </div>
      <div className="sl-equacao">
        <div><Ban size={22} /> Proibir sem caminho <span>empurra o uso para a sombra</span></div>
        <div><TriangleAlert size={22} /> Liberar sem critério <span>aumenta o risco</span></div>
        <div className="certo"><ShieldCheck size={22} /> Resposta <span>alternativa corporativa segura, com governança</span></div>
      </div>
      <Rodape />
    </div>
  );
}

function Fluxos() {
  const etapas = [
    ["Mapear", "os fluxos de trabalho existentes", Route],
    ["Identificar valor", "onde a IA gera valor real", Target],
    ["Classificar riscos", "de cada caso de uso", Layers],
    ["Definir controles", "proporcionais ao risco", Wrench],
    ["Treinar", "as equipes", GraduationCap],
    ["Monitorar e ajustar", "continuamente", RefreshCw],
  ];
  return (
    <div className="sl">
      <Topo secao="Como fazer? · Governança de IA" titulo="Comece pelos fluxos, não pelas ferramentas" cor="azul" />
      <div className="sl-fluxo">
        {etapas.map(([t, d, I], i) => (
          <div key={t} className="sl-fluxo-item">
            <span className="sl-fluxo-n">{i + 1}</span>
            <I size={28} />
            <strong>{t}</strong>
            <span>{d}</span>
          </div>
        ))}
      </div>
      <div className="sl-destaque"><Workflow size={26} /><p>A lógica é partir do <strong>trabalho real da organização</strong> e só depois escolher a tecnologia, e não o contrário.</p></div>
      <Rodape />
    </div>
  );
}

function CincoElementos() {
  const el = [
    ["Tarefa", "Qual tarefa exata a IA vai executar?", ListChecks],
    ["Acesso", "Qual ferramenta, com qual nível de acesso aos dados?", Lock],
    ["Medida de acurácia", "Como será verificada a qualidade do resultado?", ChartBar],
    ["Revisor", "Quem revisa, e com qual senioridade?", UserCheck],
    ["Escalonamento", "O que fazer quando algo dá errado?", MessageCircle],
  ];
  return (
    <div className="sl">
      <Topo secao="Como fazer? · Governança de IA" titulo="Da política ao playbook: os 5 elementos" cor="azul" />
      <p className="sl-lead">Para cada caso de uso, o playbook responde a cinco perguntas:</p>
      <div className="sl-elementos">
        {el.map(([t, q, I], i) => (
          <div key={t} className="sl-elemento">
            <span className="sl-elemento-n">{i + 1}</span>
            <I size={28} className="sl-ic" />
            <strong>{t}</strong>
            <span>{q}</span>
          </div>
        ))}
      </div>
      <div className="sl-destaque verde"><Lightbulb size={26} /><p>Transforma a política genérica (<em>"use IA com responsabilidade"</em>) em <strong>instrução executável</strong> por quem está no dia a dia.</p></div>
      <Rodape />
    </div>
  );
}

function NiveisRisco() {
  const niveis = [
    ["Baixo", "Tarefas internas sem dados sensíveis", "Revisão simplificada", "n1"],
    ["Médio", "Pesquisa jurisprudencial e minutas internas", "Revisão técnica obrigatória", "n2"],
    ["Alto", "Dados de clientes, due diligence e pareceres", "Ambiente segregado e dupla revisão", "n3"],
    ["Crítico", "Peças para tribunais superiores e comunicações regulatórias", "Supervisão de sócio e aprovação formal", "n4"],
    ["Vedado", "Dados confidenciais em ferramentas públicas", "Vedada também a delegação integral de decisão à IA", "n5"],
  ];
  return (
    <div className="sl">
      <Topo secao="Como fazer? · Governança de IA" titulo="Classificação de risco em 5 níveis" cor="azul" />
      <div className="sl-niveis">
        <div className="sl-niveis-cab"><span>Nível</span><span>Casos de uso</span><span>Controle exigido</span></div>
        {niveis.map(([n, c, ctl, cls]) => (
          <div key={n} className={`sl-nivel ${cls}`}><span className="sl-nivel-tag">{n}</span><span>{c}</span><strong>{ctl}</strong></div>
        ))}
      </div>
      <p className="sl-nota">Os controles crescem conforme a exposição: quanto maior o risco do caso de uso, mais revisão e mais formalidade.</p>
      <Rodape />
    </div>
  );
}

function Licoes() {
  const licoes = [
    ["Ética precede a norma", "Conduta correta é dever moral, não só conformidade legal."],
    ["Cultura se mede nas escolhas difíceis", "Coerência entre discurso, incentivos e consequências é o teste real."],
    ["Terceiros são ponto cego", "Só 18% integram plenamente o risco de terceiros ao risco corporativo."],
    ["A IA já está na organização", "Com ou sem permissão (Shadow AI). Proibir sem alternativa não resolve."],
    ["Cada ganho exige um controle", "E a decisão final permanece humana."],
    ["Governança começa nos fluxos", "Operada por playbooks (5 elementos) e calibrada por risco (5 níveis)."],
    ["Monitorar e ajustar sempre", "É parte do programa, não etapa final."],
  ];
  return (
    <div className="sl">
      <Topo secao="Síntese" titulo="7 lições da Jornada" cor="verde" />
      <div className="sl-licoes">
        {licoes.map(([t, d], i) => (
          <div key={t} className="sl-licao"><span className="sl-licao-n">{i + 1}</span><div><strong>{t}</strong><span>{d}</span></div></div>
        ))}
      </div>
      <Rodape />
    </div>
  );
}

function Contexto() {
  const itens = [
    ["Lei Anticorrupção", "A Lei 12.846/2013 e seu decreto consideram, nas sanções, a existência e a efetividade de um programa de integridade.", Gavel],
    ["Terceiros", "A due diligence de terceiros é parâmetro tradicional de avaliação de programas de integridade.", Handshake],
    ["LGPD e IA", "A LGPD (Lei 13.709/2018) se aplica ao tratamento de dados pessoais por IA. Dados de clientes em ferramentas públicas podem gerar incidente.", Lock],
    ["Marco legal da IA", "O Brasil discute o PL 2338/2023. A tramitação deve ser conferida em fonte atualizada.", Landmark],
    ["Risco proporcional", "A lógica de níveis conversa com o AI Act europeu, que também gradua obrigações conforme o risco.", Globe],
  ];
  return (
    <div className="sl">
      <Topo secao="Contexto complementar" titulo="O que conecta os painéis à lei" cor="laranja" />
      <div className="sl-aviso"><CircleHelp size={18} /> Conhecimento geral, fora do material dos painéis. Conferir nas fontes oficiais antes de usar em documento formal.</div>
      <div className="sl-contexto">
        {itens.map(([t, d, I]) => (
          <div key={t} className="sl-contexto-item"><I size={26} className="sl-ic" /><strong>{t}</strong><span>{d}</span></div>
        ))}
      </div>
      <Rodape />
    </div>
  );
}

function ParaEquipe() {
  const perguntas = [
    ["Cultura", "Nossas metas e reconhecimentos reforçam o que o Código de Conduta Ética da CCIB diz?"],
    ["Canal de denúncias", "As pessoas confiam no canal da SG Compliance? Como mostramos que as respostas são sérias?"],
    ["Efetividade", "Que evidências temos hoje: treinamentos registrados, apurações, medidas aplicadas?"],
    ["Terceiros", "A due diligence de associados, parceiros e fornecedores é proporcional ao risco de cada um?"],
    ["IA na CCIB", "Sabemos quais ferramentas de IA a equipe já usa? Temos uma alternativa segura e regras claras?"],
  ];
  return (
    <div className="sl sl-escuro">
      <Topo secao="Para a reunião de equipe" titulo="Perguntas para levarmos para a CCIB" cor="verde" />
      <div className="sl-perguntas">
        {perguntas.map(([t, q]) => (
          <div key={t} className="sl-pergunta"><span>{t}</span><p>{q}</p></div>
        ))}
      </div>
      <Rodape fonte="Perguntas de discussão sugeridas a partir dos painéis; não fazem parte do material do evento." />
    </div>
  );
}

function Encerramento() {
  return (
    <div className="sl sl-capa fim">
      <div className="sl-capa-texto">
        <span className="sl-kicker">Obrigado</span>
        <h1>Compliance é um processo contínuo, não um evento único.</h1>
        <span className="sl-autor-capa">Stephen Cohen</span>
        <p className="sl-capa-sub">Materiais, políticas e canais estão na Plataforma de Compliance da CCIB.</p>
        <div className="sl-capa-meta">
          <span>Políticas e documentos</span>
          <span>Treinamentos</span>
          <span>Canal de dúvidas</span>
          <span>Canal de denúncias</span>
        </div>
        <p className="sl-capa-nota">Limitações: parte do conteúdo veio de slides e de anotações transcritas automaticamente; dados estatísticos não foram verificados nas pesquisas originais.</p>
      </div>
    </div>
  );
}

export const SLIDES = [
  { id: "capa", titulo: "Capa", Slide: Capa },
  { id: "visao", titulo: "Visão geral", Slide: VisaoGeral },
  { id: "dharma", titulo: "Dharma", Slide: Dharma },
  { id: "governanca", titulo: "Governança", Slide: Governanca },
  { id: "direitos", titulo: "IA e direitos", Slide: DireitosIA },
  { id: "cultura", titulo: "Cultura de integridade", Slide: Cultura },
  { id: "frase", titulo: "Escolhas difíceis", Slide: Frase },
  { id: "diretrizes", titulo: "Diretrizes para IA", Slide: DiretrizesIA },
  { id: "terceiros", titulo: "Terceiros", Slide: Terceiros },
  { id: "ganhos", titulo: "Ganhos e riscos", Slide: GanhosRiscos },
  { id: "shadow", titulo: "Shadow AI", Slide: ShadowAI },
  { id: "proibir", titulo: "Proibir ou liberar", Slide: ProibirLiberar },
  { id: "fluxos", titulo: "6 etapas", Slide: Fluxos },
  { id: "elementos", titulo: "5 elementos", Slide: CincoElementos },
  { id: "niveis", titulo: "5 níveis de risco", Slide: NiveisRisco },
  { id: "licoes", titulo: "7 lições", Slide: Licoes },
  { id: "contexto", titulo: "Contexto legal", Slide: Contexto },
  { id: "equipe", titulo: "Para a equipe", Slide: ParaEquipe },
  { id: "fim", titulo: "Encerramento", Slide: Encerramento },
];
