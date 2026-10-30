import React, { useState } from "react";
import { Plus, X, ArrowLeft, ChevronRight, CalendarCheck, Wallet, Receipt, Scale, Users, Handshake, ListChecks, Calculator, CheckSquare, Square, Trash2, Ticket, NotebookPen, Landmark, ChevronUp, ChevronDown, Copy, Clock } from "lucide-react";
import { ESTADOS, RESPONSAVEIS, STATUS_PROJETO } from "../constants";
import { inputStyle, labelStyle, filterInputStyle } from "../styles";
import { Field } from "../components/ui";
import { useProjetos, ehMissao } from "../lib/useProjetos";
import {
  num, dinheiro, paraTexto, totalCusto, novoId, periodo,
  Chip, TituloSecao, Kpi, Resultado, Barra, EvolucaoMissoes, LogoMissao, SaldoFinal, COR_RECEITA, COR_CUSTO,
} from "./MissoesTab";

// Aba "Eventos Regional Sul": organização dos eventos próprios da Regional (ex.: Fazendo Negócios
// com a Índia). Usa a mesma lista de projetos (chave ccib-sul-projetos); as missões ficam na aba Missões.

const mono = "'IBM Plex Mono', monospace";
const serif = "'Fraunces', serif";
const card = {
  background: "#FFFFFF",
  border: "1px solid #E6E9EF",
  borderRadius: 16,
  boxShadow: "0 1px 2px rgba(11,37,69,0.05), 0 10px 28px -6px rgba(11,37,69,0.12)",
};
const secao = { ...card, padding: "18px 22px" };
const btnLinha = { display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "1px solid #0B2545", color: "#0B2545", borderRadius: 7, padding: "6px 12px", fontSize: 12.5, cursor: "pointer", flexShrink: 0 };
const btnRemover = { background: "transparent", border: "none", cursor: "pointer", color: "#B7BEC9", padding: 0, display: "flex", flexShrink: 0 };
const linhaItem = { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", background: "#FFFFFF", border: "1px solid #E6E9EF", borderRadius: 8, padding: "6px 10px" };
const inputLinha = { ...inputStyle, borderBottom: "none", padding: "2px" };
const inputNovo = { ...filterInputStyle, padding: "6px 10px", fontSize: 12.5 };
const MOEDA = "BRL";

const CATEGORIAS_CUSTO = ["Local / espaço", "Coffee break / alimentação", "Audiovisual", "Materiais gráficos / brindes", "Divulgação / marketing", "Palestrantes / cachês", "Passagens", "Hospedagem", "Transporte local", "Outros"];
const DESCRICAO_PADRAO = {
  "Local / espaço": "Aluguel do espaço",
  "Coffee break / alimentação": "Coffee break",
  Audiovisual: "Som, projeção e transmissão",
  "Materiais gráficos / brindes": "Banners, crachás e brindes",
  "Divulgação / marketing": "Divulgação",
  "Palestrantes / cachês": "Cachês e despesas de palestrantes",
  Passagens: "Passagens da equipe",
  Hospedagem: "Hotel da equipe",
  "Transporte local": "Transporte local",
};
const SITUACAO_CUSTO = {
  previsto: { label: "Previsto", color: "#B8752E" },
  pago: { label: "Pago", color: "#0E7C3A" },
};
const COTAS = ["Master", "Patrocínio", "Apoio", "Institucional", "Permuta"];
const STATUS_PATROCINIO = {
  prospeccao: { label: "Em prospecção", color: "#8992A6" },
  negociacao: { label: "Em negociação", color: "#B8752E" },
  confirmado: { label: "Confirmado", color: "#2F6FB0" },
  pago: { label: "Pago", color: "#0E7C3A" },
};
const PAPEIS_INSTITUICAO = ["Correalizadora", "Apoio institucional", "Anfitriã / cede o espaço", "Divulgação", "Conteúdo / palestrantes", "Outro"];
const STATUS_INSTITUICAO = {
  a_confirmar: { label: "A confirmar", color: "#B8752E" },
  confirmada: { label: "Confirmada", color: "#0E7C3A" },
  nao_participa: { label: "Não participa", color: "#8992A6" },
};
const STATUS_PARTICIPANTE = {
  confirmada: { label: "Confirmada", color: "#0E7C3A" },
  a_confirmar: { label: "A confirmar", color: "#B8752E" },
  nao_participa: { label: "Não participa", color: "#8992A6" },
};
const CHECKLIST_PADRAO = [
  "Definir data, local e formato",
  "Confirmar parceiros e apoio institucional",
  "Fechar palestrantes e programação",
  "Captar patrocínios",
  "Criar arte e convite",
  "Abrir inscrições e divulgar (e-mail, redes, associados)",
  "Contratar coffee break e audiovisual",
  "Enviar lembrete aos inscritos",
  "Preparar materiais (banners, crachás, lista de presença)",
  "Pós-evento: agradecimentos, fotos e follow-up comercial",
];

// Todas as contas do evento (em reais)
export function calcularEvento(p) {
  const valorIngresso = num(p.valorIngresso);
  const inscritos = num(p.inscritos);
  const metaPublico = num(p.metaPublico);
  const metaPatrocinio = num(p.metaPatrocinio);
  const receitaIngressos = (valorIngresso || 0) * (inscritos || 0);

  const patrocinios = p.patrocinios || [];
  let receitaPatrocinio = 0;
  let potencialPatrocinio = 0;
  patrocinios.forEach((x) => {
    const v = num(x.valor) || 0;
    if (x.status === "confirmado" || x.status === "pago") receitaPatrocinio += v;
    else potencialPatrocinio += v;
  });
  const arrecadado = receitaPatrocinio + receitaIngressos;

  let gasto = 0;
  let gastoPago = 0;
  const outrasMoedas = new Set();
  const porCategoria = {};
  (p.custos || []).forEach((c) => {
    const t = totalCusto(c);
    if (t == null) return;
    if ((c.moeda || MOEDA) !== MOEDA) { outrasMoedas.add(c.moeda); return; }
    gasto += t;
    if (c.situacao === "pago") gastoPago += t;
    const cat = c.categoria || "Outros";
    porCategoria[cat] = (porCategoria[cat] || 0) + t;
  });

  const resultado = arrecadado - gasto;
  const margem = arrecadado > 0 ? (resultado / arrecadado) * 100 : null;
  const faltaCaptar = Math.max(0, gasto - arrecadado);
  const custoPorParticipante = inscritos ? gasto / inscritos : null;
  const participantes = p.participantes || [];
  const instituicoes = p.instituicoes || [];
  const etapas = p.etapas || [];
  const temDados = arrecadado > 0 || gasto > 0;
  return {
    moeda: MOEDA, valorIngresso, inscritos, metaPublico, metaPatrocinio, receitaIngressos, patrocinios, receitaPatrocinio, potencialPatrocinio,
    arrecadado, gasto, gastoPago, outrasMoedas: [...outrasMoedas], porCategoria, resultado, margem, faltaCaptar, custoPorParticipante,
    participantes, confirmadas: participantes.filter((x) => x.status === "confirmada").length,
    instituicoes, instituicoesConfirmadas: instituicoes.filter((x) => x.status === "confirmada").length,
    etapasFeitas: etapas.filter((e) => e.feito).length, etapasTotal: etapas.length || CHECKLIST_PADRAO.length, temDados,
  };
}

function Progresso({ valor, max, cor = "#0E7C3A" }) {
  const pct = max ? Math.min(100, Math.round((valor / max) * 100)) : 0;
  return (
    <div style={{ height: 8, background: "#EEF1F5", borderRadius: 5, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: cor, borderRadius: 5 }} />
    </div>
  );
}

function CampoNumero({ label, valor, onChange, largura = 90, placeholder = "—", prefixo }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ ...labelStyle, marginBottom: 0 }}>{label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {prefixo && <span style={{ fontFamily: mono, fontSize: 12, color: "#8992A6" }}>{prefixo}</span>}
        <input value={valor ?? ""} inputMode="decimal" placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ ...inputNovo, width: largura, fontFamily: mono, fontSize: 13.5 }} />
      </span>
    </label>
  );
}

function EventoResumo({ p, c, abrir }) {
  const status = STATUS_PROJETO[p.status] || STATUS_PROJETO.ideia;
  return (
    <div style={{ ...card, overflow: "hidden" }} className="ccib-fade-in">
      <div style={{ height: 4, background: status.color }} />
      <div onClick={abrir} className="ccib-row" style={{ padding: "16px 22px", cursor: "pointer", display: "flex", gap: 16, alignItems: "flex-start" }}>
        <LogoMissao logo={p.logo} tamanho={p.logo ? 64 : 42} alt="Logo do evento" icone={CalendarCheck} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 18, color: "#0B2545" }}>{p.nome || "(evento sem nome)"}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            <Chip color={status.color} bg={`${status.color}14`}>{status.label}</Chip>
            {p.local && <Chip>{p.local}</Chip>}
            <Chip color="#B8752E" bg="#FBF3EA">{periodo(p)}{p.horario ? ` · ${p.horario}` : ""}</Chip>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(118px, 1fr))", gap: 8, marginTop: 12 }}>
            {[
              ["Público", `${c.inscritos ?? 0}${c.metaPublico ? ` de ${c.metaPublico}` : ""}`],
              ["Patrocínio", dinheiro(c.receitaPatrocinio, c.moeda)],
              ["Inscrições", dinheiro(c.receitaIngressos, c.moeda)],
              ["Custos", dinheiro(c.gasto, c.moeda)],
              ["Empresas", `${c.confirmadas} confirmada${c.confirmadas === 1 ? "" : "s"}`],
              ["Instituições parceiras", `${c.instituicoes.length}${c.instituicoes.length ? ` (${c.instituicoesConfirmadas} confirmada${c.instituicoesConfirmadas === 1 ? "" : "s"})` : ""}`],
              ["Checklist", `${c.etapasFeitas}/${c.etapasTotal}`],
            ].map(([rotulo, valor]) => (
              <div key={rotulo} style={{ background: "#FAFBFC", border: "1px solid #EEF1F5", borderRadius: 8, padding: "7px 10px" }}>
                <div style={{ ...labelStyle, fontSize: 9, marginBottom: 2 }}>{rotulo}</div>
                <div style={{ fontFamily: mono, fontSize: 12.5, fontWeight: 600, color: "#0B2545" }}>{valor}</div>
              </div>
            ))}
          </div>
          <SaldoFinal c={c} />
        </div>
        <ChevronRight size={18} style={{ color: "#8992A6", flexShrink: 0, marginTop: 4 }} />
      </div>
    </div>
  );
}

// Programação do evento: horário, título e detalhes (palestrantes, instituições), um item por linha
function Programacao({ itens, onChange }) {
  const [copiado, setCopiado] = useState(false);
  const mudar = (id, mudanca) => onChange(itens.map((x) => (x.id === id ? { ...x, ...mudanca } : x)));
  const mover = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= itens.length) return;
    const nova = [...itens];
    [nova[i], nova[j]] = [nova[j], nova[i]];
    onChange(nova);
  };
  const adicionar = () => {
    const ultimo = itens[itens.length - 1];
    onChange([...itens, { id: novoId("prog"), inicio: ultimo ? ultimo.fim || "" : "", fim: "", titulo: "", detalhes: "" }]);
  };
  const horario = (x) => [x.inicio, x.fim].filter(Boolean).join(" – ");
  const copiar = async () => {
    const texto = itens.map((x) => `${horario(x)}${horario(x) ? " | " : ""}${x.titulo}${x.detalhes ? `\n${x.detalhes}` : ""}`).join("\n\n");
    try { await navigator.clipboard.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 1800); } catch (e) { /* sem área de transferência */ }
  };
  const hora = { ...inputLinha, width: 52, fontFamily: mono, fontSize: 12.5, textAlign: "center", color: "#0B2545", fontWeight: 600 };
  const seta = { background: "transparent", border: "none", cursor: "pointer", color: "#8992A6", padding: 0, display: "flex" };
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
        {itens.length === 0 && <div style={{ fontSize: 12.5, color: "#8992A6" }}>Nenhum item na programação.</div>}
        {itens.map((x, i) => (
          <div key={x.id} style={{ ...linhaItem, alignItems: "flex-start", borderLeft: "3px solid #B8752E" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 2 }}>
              <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} title="Subir" aria-label="Subir item" style={{ ...seta, opacity: i === 0 ? 0.3 : 1 }}><ChevronUp size={14} /></button>
              <button type="button" onClick={() => mover(i, 1)} disabled={i === itens.length - 1} title="Descer" aria-label="Descer item" style={{ ...seta, opacity: i === itens.length - 1 ? 0.3 : 1 }}><ChevronDown size={14} /></button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, paddingTop: 2 }}>
              <input className="ccib-input" value={x.inicio || ""} placeholder="--:--" aria-label="Início" onChange={(e) => mudar(x.id, { inicio: e.target.value })} style={hora} />
              <span style={{ color: "#8992A6" }}>–</span>
              <input className="ccib-input" value={x.fim || ""} placeholder="--:--" aria-label="Fim" onChange={(e) => mudar(x.id, { fim: e.target.value })} style={hora} />
            </div>
            <div style={{ flex: "1 1 260px", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <input className="ccib-input" value={x.titulo || ""} placeholder="Título (ex.: Painel de Abertura)" aria-label="Título" onChange={(e) => mudar(x.id, { titulo: e.target.value })} style={{ ...inputLinha, fontWeight: 600, color: "#0B2545" }} />
              <textarea
                className="ccib-input"
                value={x.detalhes || ""}
                placeholder="Palestrantes, instituições ou observações (um por linha)"
                aria-label="Detalhes"
                rows={Math.max(1, (x.detalhes || "").split("\n").length)}
                onChange={(e) => mudar(x.id, { detalhes: e.target.value })}
                style={{ ...inputLinha, fontSize: 12.5, color: "#566175", resize: "vertical", lineHeight: 1.45, fontFamily: "inherit" }}
              />
            </div>
            <button onClick={() => { if (!x.titulo || window.confirm(`Remover "${x.titulo}" da programação?`)) onChange(itens.filter((y) => y.id !== x.id)); }} title="Remover item" style={{ ...btnRemover, paddingTop: 4 }}><X size={14} /></button>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={adicionar} className="ccib-btn" style={btnLinha}><Plus size={14} /> Item da programação</button>
        {itens.length > 0 && (
          <button onClick={copiar} className="ccib-btn" style={{ ...btnLinha, border: "1px solid #D6DAE2", color: "#566175" }}>
            <Copy size={13} /> {copiado ? "Copiado!" : "Copiar programação"}
          </button>
        )}
      </div>
    </div>
  );
}

function EventoDetalhe({ p, patch, voltar, remover }) {
  const c = calcularEvento(p);
  const status = STATUS_PROJETO[p.status] || STATUS_PROJETO.ideia;
  const patrocinios = c.patrocinios;
  const participantes = c.participantes;
  const custos = p.custos || [];
  const etapas = p.etapas || [];
  const patchItem = (campo, lista, id, mudanca) => patch({ [campo]: lista.map((x) => (x.id === id ? { ...x, ...mudanca } : x)) });

  const [novoPat, setNovoPat] = useState({ empresa: "", cota: "Patrocínio", valor: "" });
  const [novoPart, setNovoPart] = useState({ empresa: "", representante: "" });
  const instituicoes = c.instituicoes;
  const [novaInst, setNovaInst] = useState({ nome: "", papel: "Apoio institucional", responsabilidades: "" });
  const addInst = () => {
    const nome = novaInst.nome.trim();
    if (!nome) return;
    patch({ instituicoes: [...instituicoes, { id: novoId("inst"), nome, papel: novaInst.papel, contato: "", responsabilidades: novaInst.responsabilidades.trim(), status: "a_confirmar" }] });
    setNovaInst({ nome: "", papel: novaInst.papel, responsabilidades: "" });
  };
  const [novoCusto, setNovoCusto] = useState({ categoria: "Local / espaço", descricao: "", quantidade: "", valorUnitario: "" });
  const [novaEtapa, setNovaEtapa] = useState("");

  const addPat = () => {
    const empresa = novoPat.empresa.trim();
    if (!empresa) return;
    patch({ patrocinios: [...patrocinios, { id: novoId("pat"), empresa, cota: novoPat.cota, valor: novoPat.valor, status: "prospeccao", contato: "" }] });
    setNovoPat({ empresa: "", cota: novoPat.cota, valor: "" });
  };
  const addPart = () => {
    const empresa = novoPart.empresa.trim();
    if (!empresa) return;
    patch({ participantes: [...participantes, { id: novoId("pt"), empresa, representante: novoPart.representante.trim(), cargo: "", observacoes: "", status: "a_confirmar" }] });
    setNovoPart({ empresa: "", representante: "" });
  };

  // Custos: todos os tipos aparecem como linha; a linha vazia só é gravada quando alguém preenche
  const patchCusto = (cst, mudanca) => {
    const { virtual, ...resto } = cst;
    const novo = { ...resto, ...mudanca };
    if (virtual) novo.id = novoId("c");
    const q = num(novo.quantidade);
    const u = num(novo.valorUnitario);
    if (("quantidade" in mudanca || "valorUnitario" in mudanca) && u != null) novo.valor = paraTexto((q != null ? q : 1) * u);
    patch({ custos: virtual ? [...custos, novo] : custos.map((x) => (x.id === cst.id ? novo : x)) });
  };
  const linhasCusto = [];
  CATEGORIAS_CUSTO.forEach((cat) => {
    const doTipo = custos.filter((x) => (x.categoria || "Outros") === cat);
    if (!doTipo.length) linhasCusto.push({ chave: `tipo-${cat}`, cst: { id: null, virtual: true, categoria: cat, descricao: DESCRICAO_PADRAO[cat] || "", quantidade: "", valorUnitario: "", valor: "", moeda: MOEDA, situacao: "previsto" } });
    doTipo.forEach((x, i) => linhasCusto.push({ chave: i === 0 ? `tipo-${cat}` : x.id, cst: x }));
  });
  custos.filter((x) => !CATEGORIAS_CUSTO.includes(x.categoria || "Outros")).forEach((x) => linhasCusto.push({ chave: x.id, cst: x }));
  const addCusto = () => {
    const u = num(novoCusto.valorUnitario);
    if (!novoCusto.descricao.trim() && u == null) return;
    const q = num(novoCusto.quantidade);
    patch({ custos: [...custos, { id: novoId("c"), ...novoCusto, quantidade: novoCusto.quantidade || (u != null ? "1" : ""), descricao: novoCusto.descricao.trim(), moeda: MOEDA, situacao: "previsto", valor: u != null ? paraTexto((q != null ? q : 1) * u) : "" }] });
    setNovoCusto((s) => ({ ...s, descricao: "", quantidade: "", valorUnitario: "" }));
  };
  const maxCat = Math.max(0, ...Object.values(c.porCategoria));

  // Checklist: sem etapas salvas, mostra o padrão; a primeira ação grava a lista inteira
  const lista = etapas.length ? etapas : CHECKLIST_PADRAO.map((texto, i) => ({ id: `padrao-${i}`, texto, feito: false }));
  const salvarChecklist = (fn) => {
    const base = etapas.length ? etapas : CHECKLIST_PADRAO.map((texto, i) => ({ id: `padrao-${i}`, texto, feito: false }));
    patch({ etapas: fn(base) });
  };
  const idx = (et) => lista.findIndex((x) => x.id === et.id);
  const addEtapa = () => {
    const texto = novaEtapa.trim();
    if (!texto) return;
    salvarChecklist((b) => [...b, { id: novoId("e"), texto, feito: false }]);
    setNovaEtapa("");
  };
  const feitas = lista.filter((e) => e.feito).length;

  return (
    <div className="ccib-fade-in">
      <button onClick={voltar} className="ccib-btn" style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "#0B2545", fontSize: 13, cursor: "pointer", padding: "4px 0", marginBottom: 14 }}>
        <ArrowLeft size={15} /> Todos os eventos
      </button>

      {/* Cabeçalho */}
      <div style={{ ...card, overflow: "hidden", marginBottom: 18 }}>
        <div style={{ height: 4, background: status.color }} />
        <div style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
            <LogoMissao logo={p.logo} tamanho={96} onChange={(logo) => patch({ logo })} alt="Logo do evento" icone={CalendarCheck} textoRemover="Remover a logo deste evento?" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <input className="ccib-input" value={p.nome} placeholder="Nome do evento" onChange={(e) => patch({ nome: e.target.value })} style={{ ...inputStyle, fontFamily: serif, fontWeight: 600, fontSize: 24, color: "#0B2545", borderBottom: "1px solid transparent" }} />
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
                <Field label="Status">
                  <select style={{ ...inputStyle, color: status.color, fontWeight: 600 }} value={p.status} onChange={(e) => patch({ status: e.target.value })}>
                    {Object.entries(STATUS_PROJETO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </Field>
                <Field label="Responsável">
                  <select className="ccib-input" style={inputStyle} value={p.responsavel || "ambos"} onChange={(e) => patch({ responsavel: e.target.value })}>
                    {RESPONSAVEIS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </Field>
                <Field label="Estado">
                  <select className="ccib-input" style={inputStyle} value={p.estado || ""} onChange={(e) => patch({ estado: e.target.value })}>
                    <option value="">—</option>
                    {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </Field>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
                <Field label="Local (cidade e espaço)">
                  <input className="ccib-input" style={inputStyle} value={p.local || ""} placeholder="Ex: Porto Alegre/RS · FIERGS" onChange={(e) => patch({ local: e.target.value })} />
                </Field>
                <Field label="Data">
                  <input type="date" style={{ ...inputStyle, colorScheme: "light" }} value={p.dataPrevista || ""} onChange={(e) => patch({ dataPrevista: e.target.value })} />
                </Field>
                <Field label="Horário">
                  <input className="ccib-input" style={inputStyle} value={p.horario || ""} placeholder="Ex: 08:00 – 12:00" onChange={(e) => patch({ horario: e.target.value })} />
                </Field>
              </div>
              <div style={{ marginTop: 10 }}>
                <Field label="Objetivo / descrição">
                  <input className="ccib-input" style={inputStyle} value={p.descricao || ""} placeholder="Ex: aproximar empresas gaúchas de oportunidades na Índia" onChange={(e) => patch({ descricao: e.target.value })} />
                </Field>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            <Kpi icon={Wallet} label="Receita" valor={dinheiro(c.arrecadado, c.moeda)} cor={COR_RECEITA} sub={`Patrocínio ${dinheiro(c.receitaPatrocinio, c.moeda)} · Inscrições ${dinheiro(c.receitaIngressos, c.moeda)}`} />
            <Kpi icon={Receipt} label="Custos" valor={dinheiro(c.gasto, c.moeda)} cor={COR_CUSTO} sub={`${dinheiro(c.gastoPago, c.moeda)} pago · ${dinheiro(c.gasto - c.gastoPago, c.moeda)} previsto`} />
            <Kpi icon={Scale} label="Saldo final" valor={c.temDados ? <Resultado valor={c.resultado} moeda={c.moeda} grande /> : "—"} cor={c.resultado >= 0 ? "#0E7C3A" : "#C1502E"} sub={c.margem != null ? `Margem de ${Math.round(c.margem)}% sobre a receita` : "Sem receita lançada"} />
            <Kpi icon={Users} label="Público" valor={`${c.inscritos ?? 0}${c.metaPublico ? ` / ${c.metaPublico}` : ""}`} cor="#0B2545" sub={c.metaPublico ? "inscritos / meta" : "inscritos (defina a meta abaixo)"} />
          </div>
          {c.outrasMoedas.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12.5, color: "#B5533C", background: "#FBEFEC", borderRadius: 8, padding: "8px 12px" }}>
              Há custos em {c.outrasMoedas.join(", ")} que ficam fora do total (os eventos são calculados em reais).
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Programação */}
        <div style={secao}>
          <TituloSecao icon={Clock} extra={(p.programacao || []).length > 0 && <span style={{ fontFamily: mono, fontSize: 11, color: "#566175" }}>{(p.programacao || []).length} itens</span>}>Programação</TituloSecao>
          <Programacao itens={p.programacao || []} onChange={(programacao) => patch({ programacao })} />
        </div>

        {/* Público e inscrições */}
        <div style={secao}>
          <TituloSecao icon={Ticket} extra={<span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: "#0B2545" }}>{dinheiro(c.receitaIngressos, c.moeda)}</span>}>Público e inscrições</TituloSecao>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 12 }}>
            <CampoNumero label="Meta de público" valor={p.metaPublico} onChange={(v) => patch({ metaPublico: v.replace(/[^\d]/g, "") })} largura={80} />
            <CampoNumero label="Inscritos" valor={p.inscritos} onChange={(v) => patch({ inscritos: v.replace(/[^\d]/g, "") })} largura={80} placeholder="0" />
            <span style={{ fontSize: 18, color: "#8992A6", paddingBottom: 6 }}>×</span>
            <CampoNumero label="Valor da inscrição" valor={p.valorIngresso} onChange={(v) => patch({ valorIngresso: v })} prefixo="R$" largura={100} placeholder="0 = gratuito" />
            <span style={{ fontSize: 18, color: "#8992A6", paddingBottom: 6 }}>=</span>
            <div style={{ paddingBottom: 4 }}>
              <div style={{ ...labelStyle, marginBottom: 2 }}>Receita de inscrições</div>
              <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: "#0B2545" }}>{dinheiro(c.receitaIngressos, c.moeda)}</div>
            </div>
          </div>
          {c.metaPublico ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#566175", marginBottom: 6 }}>
                <span>{c.inscritos ?? 0} inscrito{c.inscritos === 1 ? "" : "s"} de {c.metaPublico}</span>
                <span style={{ fontFamily: mono, fontWeight: 600 }}>{Math.min(100, Math.round(((c.inscritos || 0) / c.metaPublico) * 100))}%</span>
              </div>
              <Progresso valor={c.inscritos || 0} max={c.metaPublico} />
            </>
          ) : (
            <div style={{ fontSize: 11.5, color: "#8992A6" }}>Defina a meta de público para acompanhar o andamento das inscrições.</div>
          )}
        </div>

        {/* Patrocínios */}
        <div style={secao}>
          <TituloSecao icon={Handshake} extra={<span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: "#0B2545" }}>{dinheiro(c.receitaPatrocinio, c.moeda)}</span>}>Patrocínios</TituloSecao>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 12 }}>
            <CampoNumero label="Meta de patrocínio" valor={p.metaPatrocinio} onChange={(v) => patch({ metaPatrocinio: v })} prefixo="R$" largura={110} />
            <div style={{ flex: "1 1 260px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#566175", marginBottom: 6 }}>
                <span>Confirmado {dinheiro(c.receitaPatrocinio, c.moeda)}{c.potencialPatrocinio ? ` · em negociação/prospecção ${dinheiro(c.potencialPatrocinio, c.moeda)}` : ""}</span>
                {c.metaPatrocinio ? <span style={{ fontFamily: mono, fontWeight: 600 }}>{Math.min(100, Math.round((c.receitaPatrocinio / c.metaPatrocinio) * 100))}%</span> : null}
              </div>
              <Progresso valor={c.receitaPatrocinio} max={c.metaPatrocinio || 0} cor={COR_RECEITA} />
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: "#566175", marginBottom: 10 }}>Só patrocínios "Confirmado" ou "Pago" entram na receita. Os demais aparecem como potencial.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {patrocinios.length === 0 && <div style={{ fontSize: 12.5, color: "#8992A6" }}>Nenhum patrocinador cadastrado.</div>}
            {patrocinios.map((x) => {
              const st = STATUS_PATROCINIO[x.status] || STATUS_PATROCINIO.prospeccao;
              return (
                <div key={x.id} style={linhaItem}>
                  <input className="ccib-input" value={x.empresa} placeholder="Empresa" onChange={(e) => patchItem("patrocinios", patrocinios, x.id, { empresa: e.target.value })} style={{ ...inputLinha, flex: "2 1 150px", fontWeight: 600, color: "#0B2545" }} />
                  <select value={x.cota || ""} onChange={(e) => patchItem("patrocinios", patrocinios, x.id, { cota: e.target.value })} style={{ ...inputLinha, flex: "0 1 120px", fontSize: 12, color: "#566175" }}>
                    <option value="">Cota…</option>
                    {COTAS.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <input className="ccib-input" value={x.contato || ""} placeholder="Contato / observação" onChange={(e) => patchItem("patrocinios", patrocinios, x.id, { contato: e.target.value })} style={{ ...inputLinha, flex: "2 1 140px", fontSize: 12.5 }} />
                  <span style={{ fontFamily: mono, fontSize: 11, color: "#8992A6" }}>R$</span>
                  <input className="ccib-input" value={x.valor || ""} inputMode="decimal" placeholder="Valor" onChange={(e) => patchItem("patrocinios", patrocinios, x.id, { valor: e.target.value })} style={{ ...inputLinha, flex: "0 1 100px", fontFamily: mono, textAlign: "right" }} />
                  <select value={x.status || "prospeccao"} onChange={(e) => patchItem("patrocinios", patrocinios, x.id, { status: e.target.value })} style={{ ...inputLinha, flex: "0 1 130px", fontSize: 12, fontWeight: 600, color: st.color }}>
                    {Object.entries(STATUS_PATROCINIO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <button onClick={() => patch({ patrocinios: patrocinios.filter((y) => y.id !== x.id) })} title="Remover patrocinador" style={btnRemover}><X size={14} /></button>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <input value={novoPat.empresa} placeholder="Empresa patrocinadora" onChange={(e) => setNovoPat((s) => ({ ...s, empresa: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addPat(); }} style={{ ...inputNovo, flex: "2 1 180px" }} />
            <select value={novoPat.cota} onChange={(e) => setNovoPat((s) => ({ ...s, cota: e.target.value }))} style={{ ...inputNovo, flex: "0 1 130px" }}>
              {COTAS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <input value={novoPat.valor} placeholder="Valor (R$)" inputMode="decimal" onChange={(e) => setNovoPat((s) => ({ ...s, valor: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addPat(); }} style={{ ...inputNovo, flex: "0 1 120px" }} />
            <button onClick={addPat} className="ccib-btn" style={btnLinha}><Plus size={14} /> Patrocinador</button>
          </div>
        </div>

        {/* Instituições parceiras */}
        <div style={secao}>
          <TituloSecao icon={Landmark} extra={instituicoes.length > 0 && <span style={{ fontFamily: mono, fontSize: 11, color: "#566175" }}>{c.instituicoesConfirmadas}/{instituicoes.length} confirmadas</span>}>Instituições parceiras</TituloSecao>
          <div style={{ fontSize: 11.5, color: "#566175", marginBottom: 10 }}>Federações, associações, governos e outras entidades que apoiam o evento. Em "Responsável por", registre o que cada uma assumiu (ex.: ceder o auditório, divulgar à base de associados, indicar palestrante, coffee break).</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            {instituicoes.length === 0 && <div style={{ fontSize: 12.5, color: "#8992A6" }}>Nenhuma instituição parceira cadastrada.</div>}
            {instituicoes.map((x) => {
              const st = STATUS_INSTITUICAO[x.status] || STATUS_INSTITUICAO.a_confirmar;
              return (
                <div key={x.id} style={{ ...linhaItem, flexDirection: "column", alignItems: "stretch", gap: 6, padding: "8px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <Landmark size={14} style={{ color: "#8992A6", flexShrink: 0 }} />
                    <input className="ccib-input" value={x.nome} placeholder="Instituição" onChange={(e) => patchItem("instituicoes", instituicoes, x.id, { nome: e.target.value })} style={{ ...inputLinha, flex: "2 1 160px", fontWeight: 600, color: "#0B2545" }} />
                    <select value={x.papel || ""} onChange={(e) => patchItem("instituicoes", instituicoes, x.id, { papel: e.target.value })} style={{ ...inputLinha, flex: "0 1 190px", fontSize: 12, color: "#566175" }}>
                      <option value="">Papel…</option>
                      {[...new Set([...PAPEIS_INSTITUICAO, x.papel].filter(Boolean))].map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                    <input className="ccib-input" value={x.contato || ""} placeholder="Contato (nome, e-mail)" onChange={(e) => patchItem("instituicoes", instituicoes, x.id, { contato: e.target.value })} style={{ ...inputLinha, flex: "2 1 160px", fontSize: 12.5 }} />
                    <select value={x.status || "a_confirmar"} onChange={(e) => patchItem("instituicoes", instituicoes, x.id, { status: e.target.value })} style={{ ...inputLinha, flex: "0 1 120px", fontSize: 12, fontWeight: 600, color: st.color }}>
                      {Object.entries(STATUS_INSTITUICAO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <button onClick={() => { if (window.confirm(`Remover a instituição "${x.nome || "sem nome"}"?`)) patch({ instituicoes: instituicoes.filter((y) => y.id !== x.id) }); }} title="Remover instituição" style={btnRemover}><X size={14} /></button>
                  </div>
                  <label style={{ display: "flex", flexDirection: "column", gap: 3, paddingLeft: 22 }}>
                    <span style={{ ...labelStyle, marginBottom: 0 }}>Responsável por</span>
                    <textarea value={x.responsabilidades || ""} rows={2} placeholder="Ex: ceder o auditório; divulgar aos associados; coffee break; indicar palestrante" onChange={(e) => patchItem("instituicoes", instituicoes, x.id, { responsabilidades: e.target.value })} style={{ ...filterInputStyle, width: "100%", boxSizing: "border-box", resize: "vertical", fontSize: 12.5, lineHeight: 1.45, padding: "6px 10px" }} />
                  </label>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <input value={novaInst.nome} placeholder="Instituição (ex: FIERGS, SEBRAE)" onChange={(e) => setNovaInst((s) => ({ ...s, nome: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addInst(); }} style={{ ...inputNovo, flex: "2 1 180px" }} />
            <select value={novaInst.papel} onChange={(e) => setNovaInst((s) => ({ ...s, papel: e.target.value }))} style={{ ...inputNovo, flex: "0 1 190px" }}>
              {PAPEIS_INSTITUICAO.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <input value={novaInst.responsabilidades} placeholder="Responsável por..." onChange={(e) => setNovaInst((s) => ({ ...s, responsabilidades: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addInst(); }} style={{ ...inputNovo, flex: "3 1 200px" }} />
            <button onClick={addInst} className="ccib-btn" style={btnLinha}><Plus size={14} /> Instituição</button>
          </div>
          <Field label="Observações gerais sobre parceiros">
            <input className="ccib-input" style={inputStyle} value={p.parceiros || ""} placeholder="Anotações gerais..." onChange={(e) => patch({ parceiros: e.target.value })} />
          </Field>
        </div>

        {/* Empresas e palestrantes */}
        <div style={secao}>
          <TituloSecao icon={Users} extra={participantes.length > 0 && <span style={{ fontFamily: mono, fontSize: 11, color: "#566175" }}>{c.confirmadas}/{participantes.length} confirmadas</span>}>Empresas participantes e palestrantes</TituloSecao>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {participantes.length === 0 && <div style={{ fontSize: 12.5, color: "#8992A6" }}>Nenhuma empresa cadastrada.</div>}
            {participantes.map((pt) => {
              const st = STATUS_PARTICIPANTE[pt.status] || STATUS_PARTICIPANTE.a_confirmar;
              return (
                <div key={pt.id} style={linhaItem}>
                  <input className="ccib-input" value={pt.empresa} placeholder="Empresa" onChange={(e) => patchItem("participantes", participantes, pt.id, { empresa: e.target.value })} style={{ ...inputLinha, flex: "2 1 150px", fontWeight: 600, color: "#0B2545" }} />
                  <input className="ccib-input" value={pt.representante || ""} placeholder="Representante" onChange={(e) => patchItem("participantes", participantes, pt.id, { representante: e.target.value })} style={{ ...inputLinha, flex: "2 1 140px" }} />
                  <input className="ccib-input" value={pt.cargo || ""} placeholder="Cargo / papel (ex: palestrante)" onChange={(e) => patchItem("participantes", participantes, pt.id, { cargo: e.target.value })} style={{ ...inputLinha, flex: "1 1 130px", fontSize: 12.5, color: "#566175" }} />
                  <input className="ccib-input" value={pt.observacoes || ""} placeholder="Observações" onChange={(e) => patchItem("participantes", participantes, pt.id, { observacoes: e.target.value })} style={{ ...inputLinha, flex: "2 1 160px", fontSize: 12.5 }} />
                  <select value={pt.status || "a_confirmar"} onChange={(e) => patchItem("participantes", participantes, pt.id, { status: e.target.value })} style={{ ...inputLinha, flex: "0 1 120px", fontSize: 12, fontWeight: 600, color: st.color }}>
                    {Object.entries(STATUS_PARTICIPANTE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <button onClick={() => patch({ participantes: participantes.filter((x) => x.id !== pt.id) })} title="Remover empresa" style={btnRemover}><X size={14} /></button>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input value={novoPart.empresa} placeholder="Empresa" onChange={(e) => setNovoPart((s) => ({ ...s, empresa: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addPart(); }} style={{ ...inputNovo, flex: "2 1 160px" }} />
            <input value={novoPart.representante} placeholder="Representante" onChange={(e) => setNovoPart((s) => ({ ...s, representante: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addPart(); }} style={{ ...inputNovo, flex: "2 1 160px" }} />
            <button onClick={addPart} className="ccib-btn" style={btnLinha}><Plus size={14} /> Empresa</button>
          </div>
        </div>

        {/* Custos */}
        <div style={secao}>
          <TituloSecao icon={Receipt} extra={<span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: "#0B2545" }}>{dinheiro(c.gasto, c.moeda)}</span>}>Custos do evento</TituloSecao>
          <div style={{ fontSize: 11.5, color: "#566175", marginBottom: 10 }}>Todos os tipos de custo já aparecem abaixo: preencha a quantidade e o valor unitário em reais (ex.: 60 coffees × R$ 35). Para mais de um lançamento do mesmo tipo, use a linha "+ Custo" no final. Marque como "Pago" quando o pagamento sair.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {linhasCusto.map(({ chave, cst }) => {
              const t = totalCusto(cst);
              const sit = SITUACAO_CUSTO[cst.situacao] || SITUACAO_CUSTO.previsto;
              return (
                <div key={chave} style={{ ...linhaItem, background: cst.virtual ? "#FCFCFD" : "#FFFFFF" }}>
                  <select value={cst.categoria || "Outros"} onChange={(e) => patchCusto(cst, { categoria: e.target.value })} style={{ ...inputLinha, flex: "0 1 170px", minWidth: 120, fontSize: 12, color: "#566175" }}>
                    {[...new Set([...CATEGORIAS_CUSTO, cst.categoria || "Outros"])].map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <input className="ccib-input" value={cst.descricao || ""} placeholder="Descrição" onChange={(e) => patchCusto(cst, { descricao: e.target.value })} style={{ ...inputLinha, flex: "3 1 110px", minWidth: 0 }} />
                  <input className="ccib-input" value={cst.quantidade || ""} inputMode="decimal" placeholder="Qtd" title="Quantidade" onChange={(e) => patchCusto(cst, { quantidade: e.target.value })} style={{ ...inputLinha, flex: "0 0 48px", fontFamily: mono, textAlign: "center" }} />
                  <span style={{ color: "#8992A6", fontSize: 12 }}>×</span>
                  {(cst.moeda || MOEDA) !== MOEDA ? <span style={{ fontFamily: mono, fontSize: 11, color: "#B5533C" }}>{cst.moeda}</span> : <span style={{ fontFamily: mono, fontSize: 11, color: "#8992A6" }}>R$</span>}
                  <input className="ccib-input" value={cst.valorUnitario ?? ""} inputMode="decimal" placeholder={cst.valor ? `${cst.valor}` : "Valor unit."} title="Valor unitário" onChange={(e) => patchCusto(cst, { valorUnitario: e.target.value })} style={{ ...inputLinha, flex: "0 1 100px", fontFamily: mono, textAlign: "right" }} />
                  <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: "#0B2545", minWidth: 96, textAlign: "right" }}>= {dinheiro(t, cst.moeda || MOEDA)}</span>
                  <select value={cst.situacao || "previsto"} onChange={(e) => patchCusto(cst, { situacao: e.target.value })} style={{ ...inputLinha, flex: "0 0 84px", fontSize: 12, fontWeight: 600, color: sit.color }}>
                    {Object.entries(SITUACAO_CUSTO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  {cst.virtual ? <span style={{ width: 14, flexShrink: 0 }} /> : <button onClick={() => patch({ custos: custos.filter((x) => x.id !== cst.id) })} title="Limpar / remover custo" style={btnRemover}><X size={14} /></button>}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            <select value={novoCusto.categoria} onChange={(e) => setNovoCusto((s) => ({ ...s, categoria: e.target.value }))} style={{ ...inputNovo, flex: "1 1 150px" }}>
              {CATEGORIAS_CUSTO.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <input value={novoCusto.descricao} placeholder="Descrição" onChange={(e) => setNovoCusto((s) => ({ ...s, descricao: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addCusto(); }} style={{ ...inputNovo, flex: "3 1 160px" }} />
            <input value={novoCusto.quantidade} placeholder="Qtd" inputMode="decimal" onChange={(e) => setNovoCusto((s) => ({ ...s, quantidade: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addCusto(); }} style={{ ...inputNovo, flex: "0 0 60px" }} />
            <input value={novoCusto.valorUnitario} placeholder="Valor unitário (R$)" inputMode="decimal" onChange={(e) => setNovoCusto((s) => ({ ...s, valorUnitario: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addCusto(); }} style={{ ...inputNovo, flex: "0 1 140px" }} />
            <button onClick={addCusto} className="ccib-btn" style={btnLinha}><Plus size={14} /> Custo</button>
          </div>
          {Object.keys(c.porCategoria).length > 0 && (
            <>
              <div style={labelStyle}>Custos por categoria</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(c.porCategoria).sort((a, b) => b[1] - a[1]).map(([cat, v]) => (
                  <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 170, fontSize: 12.5, color: "#1B2438", flexShrink: 0 }}>{cat}</span>
                    <div style={{ flex: 1 }}><Barra valor={v} max={maxCat} cor={COR_CUSTO} rotulo={`${dinheiro(v, c.moeda)} · ${c.gasto ? Math.round((v / c.gasto) * 100) : 0}%`} titulo={`${cat}: ${dinheiro(v, c.moeda)}`} /></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Checklist */}
        <div style={secao}>
          <TituloSecao icon={ListChecks} extra={<span style={{ fontFamily: mono, fontSize: 11, color: "#566175" }}>{feitas}/{lista.length} ({lista.length ? Math.round((feitas / lista.length) * 100) : 0}%)</span>}>Checklist de organização</TituloSecao>
          <div style={{ marginBottom: 12 }}><Progresso valor={feitas} max={lista.length} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {lista.map((et) => (
              <div key={et.id} style={linhaItem}>
                <button
                  onClick={() => salvarChecklist((b) => b.map((x, i) => (i === idx(et) ? { ...x, feito: !x.feito } : x)))}
                  style={{ ...btnRemover, color: et.feito ? "#0E7C3A" : "#8992A6" }}
                  title={et.feito ? "Marcar como pendente" : "Marcar como concluída"}
                >
                  {et.feito ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
                <input
                  className="ccib-input"
                  value={et.texto}
                  onChange={(e) => { const v = e.target.value; salvarChecklist((b) => b.map((x, i) => (i === idx(et) ? { ...x, texto: v } : x))); }}
                  style={{ ...inputLinha, flex: 1, textDecoration: et.feito ? "line-through" : "none", color: et.feito ? "#8992A6" : "#1B2438" }}
                />
                <button onClick={() => salvarChecklist((b) => b.filter((x, i) => i !== idx(et)))} title="Remover item" style={btnRemover}><X size={14} /></button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={novaEtapa} placeholder="Novo item do checklist" onChange={(e) => setNovaEtapa(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addEtapa(); }} style={{ ...inputNovo, flex: 1, minWidth: 0 }} />
            <button onClick={addEtapa} className="ccib-btn" style={btnLinha}><Plus size={14} /> Item</button>
          </div>
        </div>

        {/* Indicadores */}
        <div style={secao}>
          <TituloSecao icon={Calculator}>Indicadores</TituloSecao>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Kpi icon={Scale} label="Falta captar para empatar" valor={c.gasto ? dinheiro(c.faltaCaptar, c.moeda) : "—"} sub={c.gasto ? (c.faltaCaptar ? "Custos menos receitas confirmadas" : "Custos já cobertos") : "Lance os custos"} />
            <Kpi icon={Users} label="Custo por participante" valor={dinheiro(c.custoPorParticipante, c.moeda)} sub={c.inscritos ? `Custos ÷ ${c.inscritos} inscrito${c.inscritos === 1 ? "" : "s"}` : "Preencha os inscritos"} />
            <Kpi icon={Handshake} label="Se fechar os patrocínios em aberto" valor={c.temDados || c.potencialPatrocinio ? dinheiro(c.resultado + c.potencialPatrocinio, c.moeda) : "—"} sub={c.potencialPatrocinio ? `Saldo somando ${dinheiro(c.potencialPatrocinio, c.moeda)} em negociação/prospecção` : "Sem patrocínios em aberto"} />
          </div>
        </div>

        {/* Resultados e notas */}
        <div style={secao}>
          <TituloSecao icon={NotebookPen}>Resultados e notas</TituloSecao>
          <span style={labelStyle}>Resultados / oportunidades geradas</span>
          <textarea value={p.resultados || ""} placeholder="Novos associados, negócios, contatos, repercussão..." onChange={(e) => patch({ resultados: e.target.value })} rows={4} style={{ ...filterInputStyle, width: "100%", boxSizing: "border-box", resize: "vertical", marginBottom: 14, lineHeight: 1.5 }} />
          <span style={labelStyle}>Notas internas</span>
          <textarea value={p.notas || ""} placeholder="Observações..." onChange={(e) => patch({ notas: e.target.value })} rows={3} style={{ ...filterInputStyle, width: "100%", boxSizing: "border-box", resize: "vertical", lineHeight: 1.5 }} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={remover} className="ccib-btn" style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid #E3C9C2", color: "#B5533C", borderRadius: 7, padding: "6px 12px", fontSize: 12.5, cursor: "pointer" }}>
            <Trash2 size={14} /> Remover evento
          </button>
        </div>
      </div>
    </div>
  );
}

function novoEvento() {
  return {
    id: novoId("p"),
    nome: "",
    descricao: "",
    status: "planejamento",
    responsavel: "ambos",
    estado: "",
    local: "",
    dataPrevista: "",
    horario: "",
    parceiros: "",
    programacao: [],
    etapas: [],
    participantes: [],
    patrocinios: [],
    instituicoes: [],
    custos: [],
    resultados: "",
    notas: "",
    createdAt: Date.now(),
  };
}

export default function EventosRegionalTab() {
  const [projetos, atualizar] = useProjetos();
  const [abertoId, setAbertoId] = useState(null);

  const abrir = (id) => {
    setAbertoId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!projetos) return <div style={{ color: "#8992A6", fontSize: 13 }}>Carregando eventos…</div>;

  const aberto = abertoId && projetos.find((p) => p.id === abertoId);
  if (aberto) {
    return (
      <EventoDetalhe
        key={aberto.id}
        p={aberto}
        voltar={() => setAbertoId(null)}
        patch={(mudanca) => atualizar(projetos.map((x) => (x.id === aberto.id ? { ...x, ...mudanca } : x)))}
        remover={() => {
          if (window.confirm(`Remover o evento "${aberto.nome || "sem nome"}"? Os dados dele serão apagados para todos.`)) {
            atualizar(projetos.filter((x) => x.id !== aberto.id));
            setAbertoId(null);
          }
        }}
      />
    );
  }

  const ordem = Object.keys(STATUS_PROJETO);
  const eventos = projetos
    .filter((p) => !ehMissao(p))
    .map((p) => ({ p, c: calcularEvento(p) }))
    .sort((a, b) => ordem.indexOf(a.p.status) - ordem.indexOf(b.p.status) || (a.p.dataPrevista || "9999").localeCompare(b.p.dataPrevista || "9999"));

  const receita = eventos.reduce((s, { c }) => s + c.arrecadado, 0);
  const custo = eventos.reduce((s, { c }) => s + c.gasto, 0);
  const publico = eventos.reduce((s, { c }) => s + (c.inscritos || 0), 0);

  const adicionar = () => {
    const e = novoEvento();
    atualizar([...projetos, e]);
    abrir(e.id);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 600, fontSize: 24, margin: 0, color: "#0B2545" }}>Eventos Regional Sul</h2>
          <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8992A6", marginTop: 4 }}>
            {eventos.length} evento{eventos.length === 1 ? "" : "s"} · patrocínios, inscrições, custos e checklist
          </div>
        </div>
        <button onClick={adicionar} className="ccib-btn ccib-btn-solid" style={{ display: "flex", alignItems: "center", gap: 6, background: "#0B2545", color: "#FFFFFF", border: "1px solid #0B2545", borderRadius: 7, padding: "8px 16px", fontWeight: 500, fontSize: 13, cursor: "pointer" }}>
          <Plus size={15} /> Novo evento
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
        <Kpi icon={Wallet} label="Receita total" valor={dinheiro(receita, MOEDA)} cor={COR_RECEITA} sub="Patrocínios confirmados + inscrições" />
        <Kpi icon={Receipt} label="Custos totais" valor={dinheiro(custo, MOEDA)} cor={COR_CUSTO} />
        <Kpi icon={Scale} label="Saldo acumulado" valor={receita || custo ? <Resultado valor={receita - custo} moeda={MOEDA} grande /> : "—"} cor="#0E7C3A" />
        <Kpi icon={Users} label="Público inscrito" valor={String(publico)} cor="#0B2545" />
      </div>

      <EvolucaoMissoes
        missoes={eventos}
        abrir={abrir}
        titulo="Comparativo dos eventos"
        semNome="(evento sem nome)"
        vazio="Assim que houver patrocínios confirmados, inscrições ou custos lançados, cada evento aparece aqui com a receita, os custos e o saldo, em ordem de data."
      />

      {eventos.length === 0 && <div style={{ padding: "30px 0", textAlign: "center", color: "#8992A6", fontSize: 13 }}>Nenhum evento cadastrado.</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))", gap: 16 }}>
        {eventos.map(({ p, c }) => <EventoResumo key={p.id} p={p} c={c} abrir={() => abrir(p.id)} />)}
      </div>
    </div>
  );
}
