import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Copy, Printer, Check, ChevronDown, Search, AlertTriangle, ClipboardList, CalendarClock, Building2 } from "lucide-react";
import { RESPONSAVEIS, STORAGE_ATAS } from "../constants";
import { filterInputStyle } from "../styles";
import { SectionTitle } from "../components/ui";
import { useListaCompartilhada } from "../lib/useListaCompartilhada";

const mono = "'IBM Plex Mono', monospace";
const serif = "'Fraunces', serif";

export const TIPOS_ATA = ["Prospecção", "Associação", "Renovação", "Patrocínio", "Serviços", "Parceria", "Missão / delegação", "Follow-up", "Outro"];

export const STATUS_ATA = {
  rascunho: { label: "Rascunho", color: "#B8752E" },
  finalizada: { label: "Finalizada", color: "#0E7C3A" },
};

// Seções de texto da ata, na ordem em que aparecem no editor, na cópia e na impressão
const SECOES = [
  { id: "objetivo", label: "Objetivo da reunião", dica: "Por que a reunião aconteceu e o que se esperava dela." },
  { id: "pontos", label: "Pontos discutidos", dica: "Um ponto por linha." },
  { id: "oportunidades", label: "Oportunidades identificadas", dica: "Associação, patrocínio, serviços, eventos, missões, contatos na Índia..." },
  { id: "decisoes", label: "Decisões e acordos", dica: "O que ficou combinado entre as partes." },
  { id: "observacoes", label: "Observações internas", dica: "Não entra no texto copiado para a empresa." },
];

const novoId = (p) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const normalizar = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const somaDias = (iso, n) => {
  const [a, m, d] = iso.split("-").map(Number);
  const r = new Date(a, m - 1, d + n);
  return `${r.getFullYear()}-${String(r.getMonth() + 1).padStart(2, "0")}-${String(r.getDate()).padStart(2, "0")}`;
};
const dataBR = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : "");
const dataCurta = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : "");
const nomeResp = (id) => (RESPONSAVEIS.find((r) => r.id === id) || {}).label || "";
const corResp = (id) => (RESPONSAVEIS.find((r) => r.id === id) || {}).accent || "#8992A6";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const linhas = (t) => (t || "").split("\n").map((l) => l.replace(/^\s*[-•*]\s*/, "").trim()).filter(Boolean);

export function novaAta(base = {}) {
  return {
    id: novoId("ata"),
    titulo: "",
    empresa: "",
    data: hojeISO(),
    horario: "",
    tipo: "Prospecção",
    responsavel: "ambos",
    participantesCcib: "",
    participantesEmpresa: "",
    local: "",
    objetivo: "",
    pontos: "",
    oportunidades: "",
    decisoes: "",
    observacoes: "",
    acoes: [],
    proximoContato: "",
    status: "rascunho",
    reuniaoId: "",
    criadaEm: Date.now(),
    atualizadaEm: Date.now(),
    ...base,
  };
}

// Monta uma ata a partir de uma reunião da aba Reuniões
export function ataDaReuniao(m) {
  return novaAta({
    titulo: m.nome || "",
    data: m.data || hojeISO(),
    horario: m.horario && m.horario !== "Dia inteiro" ? m.horario : "",
    responsavel: m.responsavel || "ambos",
    participantesEmpresa: m.participantes || "",
    local: m.local || "",
    reuniaoId: m.id,
  });
}

const acaoAtrasada = (a, hoje) => !a.feito && a.prazo && a.prazo < hoje;

// Texto corrido para colar em e-mail ou Teams (sem as observações internas)
function textoAta(ata) {
  const L = [];
  L.push("ATA DE REUNIÃO COMERCIAL");
  L.push("Câmara de Comércio Índia Brasil (CCIB) · Regional Sul");
  L.push("");
  if (ata.titulo) L.push(`Reunião: ${ata.titulo}`);
  if (ata.empresa) L.push(`Empresa: ${ata.empresa}`);
  L.push(`Data: ${dataBR(ata.data)}${ata.horario ? `, ${ata.horario}` : ""}`);
  if (ata.local) L.push(`Local: ${ata.local}`);
  if (ata.tipo) L.push(`Tipo: ${ata.tipo}`);
  if (ata.participantesCcib) L.push(`Participantes CCIB: ${ata.participantesCcib}`);
  if (ata.participantesEmpresa) L.push(`Participantes da empresa: ${ata.participantesEmpresa}`);
  SECOES.filter((s) => s.id !== "observacoes").forEach((s) => {
    const ls = linhas(ata[s.id]);
    if (!ls.length) return;
    L.push("");
    L.push(s.label.toUpperCase());
    ls.forEach((l) => L.push(`- ${l}`));
  });
  const acoes = (ata.acoes || []).filter((a) => a.texto && a.texto.trim());
  if (acoes.length) {
    L.push("");
    L.push("PRÓXIMOS PASSOS");
    acoes.forEach((a) => {
      const extra = [a.quem ? `responsável: ${a.quem}` : "", a.prazo ? `prazo: ${dataBR(a.prazo)}` : "", a.feito ? "concluído" : ""].filter(Boolean).join("; ");
      L.push(`- ${a.texto.trim()}${extra ? ` (${extra})` : ""}`);
    });
  }
  if (ata.proximoContato) {
    L.push("");
    L.push(`Próximo contato: ${dataBR(ata.proximoContato)}`);
  }
  return L.join("\n");
}

function htmlAta(ata) {
  const bloco = (titulo, itens) =>
    itens.length ? `<h2>${esc(titulo)}</h2><ul>${itens.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "";
  const acoes = (ata.acoes || []).filter((a) => a.texto && a.texto.trim());
  const tabelaAcoes = acoes.length
    ? `<h2>Próximos passos</h2><table><thead><tr><th>Ação</th><th>Responsável</th><th>Prazo</th><th>Situação</th></tr></thead><tbody>${acoes
        .map((a) => `<tr><td>${esc(a.texto)}</td><td>${esc(a.quem || "")}</td><td>${esc(dataBR(a.prazo))}</td><td>${a.feito ? "Concluída" : "Pendente"}</td></tr>`)
        .join("")}</tbody></table>`
    : "";
  const meta = [
    ["Empresa", ata.empresa],
    ["Data", `${dataBR(ata.data)}${ata.horario ? `, ${ata.horario}` : ""}`],
    ["Local", ata.local],
    ["Tipo", ata.tipo],
    ["Participantes CCIB", ata.participantesCcib],
    ["Participantes da empresa", ata.participantesEmpresa],
  ].filter(([, v]) => v);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Ata · ${esc(ata.titulo || ata.empresa || "Reunião")}</title>
<style>
@page { size: A4; margin: 16mm 16mm 14mm; }
body { font-family: "IBM Plex Sans", Arial, sans-serif; color: #1B2438; font-size: 11.5pt; line-height: 1.45; margin: 0; }
.faixa { height: 5px; background: linear-gradient(to right, #FF9933 0 33.3%, #FFFFFF 33.3% 66.6%, #0E7C3A 66.6%); border: 1px solid #E3E6EC; margin-bottom: 14px; }
.org { font-size: 8.5pt; letter-spacing: .14em; text-transform: uppercase; color: #B8752E; font-weight: 600; }
h1 { font-family: Georgia, serif; font-size: 18pt; color: #0B2545; margin: 4px 0 12px; }
.meta { display: grid; grid-template-columns: 170px 1fr; gap: 3px 12px; font-size: 10.5pt; margin-bottom: 8px; }
.meta b { color: #566175; font-weight: 600; }
h2 { font-size: 10pt; letter-spacing: .08em; text-transform: uppercase; color: #0E7C3A; border-bottom: 1px solid #E3E6EC; padding-bottom: 3px; margin: 16px 0 6px; }
ul { margin: 0; padding-left: 18px; } li { margin: 2px 0; }
table { width: 100%; border-collapse: collapse; font-size: 10.5pt; }
th, td { text-align: left; border-bottom: 1px solid #E3E6EC; padding: 5px 6px; vertical-align: top; }
th { font-size: 8.5pt; text-transform: uppercase; letter-spacing: .06em; color: #8992A6; }
.rodape { margin-top: 22px; font-size: 8.5pt; color: #8992A6; border-top: 1px solid #E3E6EC; padding-top: 6px; }
</style></head><body>
<div class="faixa"></div>
<div class="org">Câmara de Comércio Índia Brasil (CCIB) · Regional Sul</div>
<h1>Ata de reunião comercial${ata.titulo ? `<br><span style="font-size:13pt;color:#566175">${esc(ata.titulo)}</span>` : ""}</h1>
<div class="meta">${meta.map(([k, v]) => `<b>${esc(k)}</b><span>${esc(v)}</span>`).join("")}</div>
${SECOES.filter((s) => s.id !== "observacoes").map((s) => bloco(s.label, linhas(ata[s.id]))).join("")}
${tabelaAcoes}
${ata.proximoContato ? `<h2>Próximo contato</h2><div>${esc(dataBR(ata.proximoContato))}</div>` : ""}
<div class="rodape">India Brazil Chamber of Commerce (IBCC) · Regional Sul</div>
<script>window.onload = () => setTimeout(() => window.print(), 300);</script>
</body></html>`;
}

function imprimirAta(ata) {
  const w = window.open("", "_blank");
  if (!w) { window.alert("O navegador bloqueou a nova janela. Permita pop-ups para esta página e tente de novo."); return; }
  w.document.open();
  w.document.write(htmlAta(ata));
  w.document.close();
}

const campo = { ...filterInputStyle, width: "100%", boxSizing: "border-box", background: "#FFFFFF" };
const rotulo = { fontFamily: mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8992A6", marginBottom: 5, display: "block" };
const botao = { display: "inline-flex", alignItems: "center", gap: 6, background: "#FFFFFF", color: "#0B2545", border: "1px solid #D6DAE2", borderRadius: 7, padding: "6px 12px", fontSize: 12.5, fontWeight: 500, cursor: "pointer" };
const botaoPrincipal = { ...botao, background: "#0B2545", color: "#FFFFFF", border: "1px solid #0B2545" };

function Campo({ label, children, flex = 1, min = 160 }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", flex, minWidth: min }}>
      <span style={rotulo}>{label}</span>
      {children}
    </label>
  );
}

function Chip({ cor, children }) {
  return (
    <span style={{ fontFamily: mono, fontSize: 10.5, color: cor, border: `1px solid ${cor}55`, background: `${cor}12`, borderRadius: 999, padding: "2px 8px", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Acoes({ acoes, mudar, hoje }) {
  const atualizar = (id, patch) => mudar(acoes.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  return (
    <div>
      <span style={rotulo}>Próximos passos</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {acoes.map((a) => (
          <div key={a.id} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => atualizar(a.id, { feito: !a.feito })}
              title={a.feito ? "Marcar como pendente" : "Marcar como concluída"}
              style={{ width: 20, height: 20, flexShrink: 0, borderRadius: 5, border: `1.5px solid ${a.feito ? "#0E7C3A" : "#C7CCD6"}`, background: a.feito ? "#0E7C3A" : "#FFFFFF", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}
            >
              {a.feito && <Check size={13} />}
            </button>
            <input
              className="ccib-input"
              style={{ ...campo, flex: "3 1 260px", width: "auto", textDecoration: a.feito ? "line-through" : "none", color: a.feito ? "#8992A6" : "#1B2438" }}
              placeholder="O que precisa ser feito"
              value={a.texto}
              onChange={(e) => atualizar(a.id, { texto: e.target.value })}
            />
            <input
              className="ccib-input"
              style={{ ...campo, flex: "1 1 140px", width: "auto" }}
              placeholder="Responsável"
              list="ccib-atas-quem"
              value={a.quem}
              onChange={(e) => atualizar(a.id, { quem: e.target.value })}
            />
            <input
              type="date"
              className="ccib-input"
              title="Prazo"
              style={{ ...campo, flex: "0 1 150px", width: "auto", colorScheme: "light", borderColor: acaoAtrasada(a, hoje) ? "#C1502E" : "#D6DAE2", color: acaoAtrasada(a, hoje) ? "#C1502E" : "#1B2438" }}
              value={a.prazo}
              onChange={(e) => atualizar(a.id, { prazo: e.target.value })}
            />
            <button onClick={() => mudar(acoes.filter((x) => x.id !== a.id))} title="Remover ação" className="ccib-icon-btn" style={{ background: "transparent", border: "none", color: "#8992A6", cursor: "pointer", padding: 4 }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => mudar([...acoes, { id: novoId("acao"), texto: "", quem: "", prazo: somaDias(hoje, 7), feito: false }])}
        className="ccib-btn"
        style={{ ...botao, marginTop: 8, fontSize: 12 }}
      >
        <Plus size={13} /> Adicionar próximo passo
      </button>
      <datalist id="ccib-atas-quem">
        <option value="Bianca" />
        <option value="Gustavo" />
        <option value="Bianca e Gustavo" />
        <option value="Empresa" />
      </datalist>
    </div>
  );
}

function EditorAta({ ata, mudar, excluir, fechar, hoje, abrirEmpresaPorNome }) {
  const [copiado, setCopiado] = useState(false);
  const set = (patch) => mudar({ ...patch, atualizadaEm: Date.now() });
  const copiar = async () => {
    const texto = textoAta(ata);
    try {
      await navigator.clipboard.writeText(texto);
    } catch (e) {
      const t = document.createElement("textarea");
      t.value = texto;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };
  return (
    <div className="ccib-fade-in" style={{ borderTop: "1px solid #EEF1F5", padding: "16px 16px 18px", background: "#FAFBFC", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <Campo label="Título da reunião" flex={2} min={240}>
          <input className="ccib-input" style={campo} value={ata.titulo} placeholder="Ex.: Apresentação CCIB para a empresa" onChange={(e) => set({ titulo: e.target.value })} />
        </Campo>
        <Campo label="Empresa">
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input className="ccib-input" style={campo} list="ccib-atas-empresas" value={ata.empresa} placeholder="Nome da empresa" onChange={(e) => set({ empresa: e.target.value })} />
            {abrirEmpresaPorNome(ata.empresa, true) && (
              <button onClick={() => abrirEmpresaPorNome(ata.empresa)} title="Abrir a empresa na aba Empresas" className="ccib-icon-btn-neutral" style={{ background: "transparent", border: "1px solid #D6DAE2", borderRadius: 7, color: "#566175", cursor: "pointer", padding: "7px 8px", display: "flex" }}>
                <Building2 size={14} />
              </button>
            )}
          </div>
        </Campo>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <Campo label="Data" min={140}>
          <input type="date" className="ccib-input" style={{ ...campo, colorScheme: "light" }} value={ata.data} onChange={(e) => set({ data: e.target.value })} />
        </Campo>
        <Campo label="Horário" min={120}>
          <input className="ccib-input" style={campo} value={ata.horario} placeholder="10:00 – 11:00" onChange={(e) => set({ horario: e.target.value })} />
        </Campo>
        <Campo label="Tipo" min={150}>
          <select className="ccib-input" style={campo} value={ata.tipo} onChange={(e) => set({ tipo: e.target.value })}>
            {TIPOS_ATA.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Campo>
        <Campo label="Responsável CCIB" min={150}>
          <select className="ccib-input" style={{ ...campo, color: corResp(ata.responsavel), fontWeight: 600 }} value={ata.responsavel} onChange={(e) => set({ responsavel: e.target.value })}>
            {RESPONSAVEIS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </Campo>
        <Campo label="Local" min={150}>
          <input className="ccib-input" style={campo} value={ata.local} placeholder="Presencial, Teams..." onChange={(e) => set({ local: e.target.value })} />
        </Campo>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <Campo label="Participantes CCIB">
          <input className="ccib-input" style={campo} value={ata.participantesCcib} placeholder="Bianca Guimarães, Gustavo Bastos" onChange={(e) => set({ participantesCcib: e.target.value })} />
        </Campo>
        <Campo label="Participantes da empresa">
          <input className="ccib-input" style={campo} value={ata.participantesEmpresa} placeholder="Nome (cargo)" onChange={(e) => set({ participantesEmpresa: e.target.value })} />
        </Campo>
      </div>
      {SECOES.map((s) => (
        <Campo key={s.id} label={s.label}>
          <textarea
            className="ccib-input"
            rows={s.id === "pontos" ? 5 : 3}
            style={{ ...campo, resize: "vertical", lineHeight: 1.5, fontFamily: "'IBM Plex Sans', sans-serif", background: s.id === "observacoes" ? "#FFFBF5" : "#FFFFFF" }}
            placeholder={s.dica}
            value={ata[s.id]}
            onChange={(e) => set({ [s.id]: e.target.value })}
          />
        </Campo>
      ))}
      <Acoes acoes={ata.acoes || []} mudar={(acoes) => set({ acoes })} hoje={hoje} />
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Campo label="Próximo contato" flex={0} min={170}>
          <input type="date" className="ccib-input" style={{ ...campo, colorScheme: "light" }} value={ata.proximoContato} onChange={(e) => set({ proximoContato: e.target.value })} />
        </Campo>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: "auto" }}>
          <button onClick={copiar} className="ccib-btn" style={botao} title="Copia a ata em texto para colar em e-mail ou Teams (sem as observações internas)">
            {copiado ? <Check size={14} /> : <Copy size={14} />} {copiado ? "Copiada" : "Copiar ata"}
          </button>
          <button onClick={() => imprimirAta(ata)} className="ccib-btn" style={botao} title="Abre a ata para imprimir ou salvar em PDF (sem as observações internas)">
            <Printer size={14} /> Imprimir / PDF
          </button>
          {ata.status === "finalizada" ? (
            <button onClick={() => set({ status: "rascunho" })} className="ccib-btn" style={botao}>Voltar para rascunho</button>
          ) : (
            <button onClick={() => set({ status: "finalizada" })} className="ccib-btn" style={botaoPrincipal}>
              <Check size={14} /> Finalizar ata
            </button>
          )}
          <button
            onClick={() => { if (window.confirm("Excluir esta ata? Essa ação não pode ser desfeita.")) excluir(); }}
            title="Excluir ata"
            className="ccib-icon-btn"
            style={{ ...botao, color: "#8992A6", padding: "6px 9px" }}
          >
            <Trash2 size={14} />
          </button>
          <button onClick={fechar} className="ccib-btn" style={botao}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

export default function AtasTab({ members = [], meetings = [], abrirEmpresa, novaDe, limparNovaDe }) {
  const [atas, setAtas] = useListaCompartilhada(STORAGE_ATAS);
  const [aberta, setAberta] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtroResp, setFiltroResp] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [reuniaoBase, setReuniaoBase] = useState("");
  const hoje = hojeISO();
  const lista = atas || [];

  const criar = (ata) => {
    setAtas([ata, ...lista]);
    setAberta(ata.id);
  };
  const mudar = (id, patch) => setAtas(lista.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const excluir = (id) => {
    setAtas(lista.filter((a) => a.id !== id));
    setAberta(null);
  };

  // Vindo do botão "Criar ata" da aba Reuniões: abre a ata existente ou cria uma nova
  useEffect(() => {
    if (!novaDe || atas === null) return;
    const existente = lista.find((a) => a.reuniaoId && a.reuniaoId === novaDe.id);
    if (existente) setAberta(existente.id);
    else criar(ataDaReuniao(novaDe));
    if (limparNovaDe) limparNovaDe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [novaDe, atas === null]);

  const empresasPorNome = useMemo(() => {
    const m = new Map();
    members.forEach((x) => x.nome && m.set(normalizar(x.nome), x));
    return m;
  }, [members]);
  const abrirEmpresaPorNome = (nome, soVerificar) => {
    const m = empresasPorNome.get(normalizar(nome));
    if (soVerificar) return Boolean(m && abrirEmpresa);
    if (m && abrirEmpresa) abrirEmpresa(m.id);
    return true;
  };

  // Reuniões recentes (últimos 60 dias até hoje) que ainda não têm ata
  const reunioesSemAta = useMemo(() => {
    const comAta = new Set(lista.map((a) => a.reuniaoId).filter(Boolean));
    const inicio = somaDias(hoje, -60);
    return meetings
      .filter((m) => m.data && m.data >= inicio && m.data <= hoje && m.status !== "cancelada" && !comAta.has(m.id))
      .sort((a, b) => (b.data + (b.horario || "")).localeCompare(a.data + (a.horario || "")));
  }, [meetings, lista, hoje]);

  const filtradas = useMemo(() => {
    const q = normalizar(busca);
    return lista
      .filter((a) => filtroResp === "todos" || a.responsavel === filtroResp || a.responsavel === "ambos")
      .filter((a) => filtroStatus === "todos" || a.status === filtroStatus)
      .filter((a) => !q || normalizar([a.titulo, a.empresa, a.tipo, a.participantesCcib, a.participantesEmpresa, ...SECOES.map((s) => a[s.id]), ...(a.acoes || []).map((x) => x.texto)].join(" ")).includes(q))
      .sort((a, b) => (b.data || "").localeCompare(a.data || "") || (b.criadaEm || 0) - (a.criadaEm || 0));
  }, [lista, busca, filtroResp, filtroStatus]);

  const pendentes = useMemo(() => {
    const r = [];
    lista.forEach((ata) => (ata.acoes || []).forEach((a) => { if (!a.feito && a.texto && a.texto.trim()) r.push({ ata, a }); }));
    return r.sort((x, y) => (x.a.prazo || "9999").localeCompare(y.a.prazo || "9999"));
  }, [lista]);
  const atrasadas = pendentes.filter((p) => acaoAtrasada(p.a, hoje)).length;
  const rascunhos = lista.filter((a) => a.status !== "finalizada").length;
  const marcarAcao = (ataId, acaoId) => {
    const ata = lista.find((a) => a.id === ataId);
    if (!ata) return;
    mudar(ataId, { acoes: ata.acoes.map((a) => (a.id === acaoId ? { ...a, feito: true } : a)), atualizadaEm: Date.now() });
  };

  const card = { background: "#FFFFFF", border: "1px solid #E3E6EC", borderRadius: 10 };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 6 }}>
        <SectionTitle size={17}>Atas de reuniões comerciais</SectionTitle>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select
            className="ccib-input"
            style={{ ...filterInputStyle, background: "#FFFFFF", maxWidth: 320 }}
            value={reuniaoBase}
            onChange={(e) => {
              const m = meetings.find((x) => x.id === e.target.value);
              if (m) criar(ataDaReuniao(m));
              setReuniaoBase("");
            }}
            disabled={atas === null}
            title="Cria a ata já com título, data, horário, participantes e local da reunião"
          >
            <option value="">Criar a partir de uma reunião...</option>
            {reunioesSemAta.map((m) => (
              <option key={m.id} value={m.id}>{dataCurta(m.data)} · {m.nome}</option>
            ))}
          </select>
          <button onClick={() => criar(novaAta())} disabled={atas === null} className="ccib-btn" style={botaoPrincipal}>
            <Plus size={14} /> Nova ata
          </button>
        </div>
      </div>
      <p style={{ fontSize: 13, color: "#566175", margin: "0 0 18px", lineHeight: 1.5 }}>
        Registre o que foi discutido com cada empresa, as oportunidades para a Câmara e os próximos passos com responsável e prazo.
        As atas ficam salvas para toda a equipe e podem ser copiadas para e-mail ou salvas em PDF.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        {[
          ["Atas registradas", lista.length, "#0B2545"],
          ["Em rascunho", rascunhos, "#B8752E"],
          ["Próximos passos pendentes", pendentes.length, "#2F6FB0"],
          ["Passos atrasados", atrasadas, atrasadas ? "#C1502E" : "#8992A6"],
        ].map(([rot, val, cor]) => (
          <div key={rot} style={{ ...card, flex: "1 1 180px", padding: "12px 16px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8992A6" }}>{rot}</div>
            <div style={{ fontFamily: serif, fontSize: 26, fontWeight: 500, color: cor, marginTop: 4 }}>{atas === null ? "…" : val}</div>
          </div>
        ))}
      </div>

      {pendentes.length > 0 && (
        <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <CalendarClock size={15} color="#2F6FB0" />
            <span style={{ fontFamily: serif, fontSize: 15, color: "#0B2545", fontWeight: 500 }}>Próximos passos em aberto</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {pendentes.slice(0, 8).map(({ ata, a }) => {
              const atrasada = acaoAtrasada(a, hoje);
              return (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", borderBottom: "1px solid #F1F3F7", fontSize: 13 }}>
                  <button onClick={() => marcarAcao(ata.id, a.id)} title="Marcar como concluída" style={{ width: 18, height: 18, flexShrink: 0, borderRadius: 5, border: "1.5px solid #C7CCD6", background: "#FFFFFF", cursor: "pointer", padding: 0 }} />
                  <span style={{ fontFamily: mono, fontSize: 11, color: atrasada ? "#C1502E" : "#8992A6", minWidth: 44, display: "flex", alignItems: "center", gap: 3 }}>
                    {atrasada && <AlertTriangle size={11} />}
                    {a.prazo ? dataCurta(a.prazo) : "s/ prazo"}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, color: "#1B2438" }}>{a.texto}</span>
                  {a.quem && <span style={{ fontSize: 12, color: "#566175" }}>{a.quem}</span>}
                  <button onClick={() => setAberta(ata.id)} style={{ background: "transparent", border: "none", color: "#2F6FB0", fontSize: 12, cursor: "pointer", padding: 0, whiteSpace: "nowrap", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {ata.empresa || ata.titulo || "Ata"}
                  </button>
                </div>
              );
            })}
            {pendentes.length > 8 && <div style={{ fontSize: 12, color: "#8992A6", paddingTop: 4 }}>e mais {pendentes.length - 8} nas atas abaixo.</div>}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 260px" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "#8992A6" }} />
          <input className="ccib-input" style={{ ...filterInputStyle, width: "100%", boxSizing: "border-box", paddingLeft: 30 }} placeholder="Buscar por empresa, assunto, participante..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <select className="ccib-input" style={filterInputStyle} value={filtroResp} onChange={(e) => setFiltroResp(e.target.value)}>
          <option value="todos">Todos os responsáveis</option>
          <option value="bianca">Bianca</option>
          <option value="gustavo">Gustavo</option>
        </select>
        <select className="ccib-input" style={filterInputStyle} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="todos">Todas as situações</option>
          {Object.entries(STATUS_ATA).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <datalist id="ccib-atas-empresas">
        {members.map((m) => m.nome && <option key={m.id} value={m.nome} />)}
      </datalist>

      {atas === null ? (
        <div style={{ color: "#8992A6", fontSize: 13, padding: "30px 0", textAlign: "center" }}>Carregando atas...</div>
      ) : filtradas.length === 0 ? (
        <div style={{ ...card, padding: "36px 24px", textAlign: "center", color: "#566175", fontSize: 13.5 }}>
          <ClipboardList size={28} color="#B8752E" style={{ marginBottom: 8 }} />
          <div>{lista.length ? "Nenhuma ata encontrada com esses filtros." : "Nenhuma ata registrada ainda. Clique em \"Nova ata\" ou crie a partir de uma reunião."}</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtradas.map((ata) => {
            const st = STATUS_ATA[ata.status] || STATUS_ATA.rascunho;
            const abertas = (ata.acoes || []).filter((a) => !a.feito && a.texto && a.texto.trim());
            const atrasadasAta = abertas.filter((a) => acaoAtrasada(a, hoje)).length;
            const isOpen = aberta === ata.id;
            return (
              <div key={ata.id} className="ccib-card" style={{ ...card, borderLeft: `4px solid ${corResp(ata.responsavel)}`, overflow: "hidden", borderColor: isOpen ? "#0B2545" : "#E3E6EC", borderLeftColor: corResp(ata.responsavel) }}>
                <div onClick={() => setAberta(isOpen ? null : ata.id)} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 14px", cursor: "pointer", flexWrap: "wrap" }}>
                  <div style={{ minWidth: 54, textAlign: "center", borderRight: "1px solid #EEF1F5", paddingRight: 12 }}>
                    <div style={{ fontFamily: serif, fontSize: 20, color: "#0B2545", lineHeight: 1 }}>{ata.data ? ata.data.slice(8, 10) : "--"}</div>
                    <div style={{ fontFamily: mono, fontSize: 10, color: "#8992A6", textTransform: "uppercase", marginTop: 3 }}>
                      {ata.data ? ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"][Number(ata.data.slice(5, 7)) - 1] + "/" + ata.data.slice(2, 4) : ""}
                    </div>
                  </div>
                  <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1B2438", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ata.titulo || ata.empresa || "(ata sem título)"}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#566175", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {[ata.empresa && ata.titulo ? ata.empresa : "", ata.tipo, nomeResp(ata.responsavel)].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    {abertas.length > 0 && <Chip cor={atrasadasAta ? "#C1502E" : "#2F6FB0"}>{abertas.length} {abertas.length === 1 ? "passo pendente" : "passos pendentes"}</Chip>}
                    {ata.proximoContato && <Chip cor={ata.proximoContato < hoje ? "#C1502E" : "#566175"}>Próx. contato {dataCurta(ata.proximoContato)}</Chip>}
                    <Chip cor={st.color}>{st.label}</Chip>
                    <ChevronDown size={15} color="#8992A6" style={{ transition: "transform 0.15s", transform: isOpen ? "rotate(180deg)" : "none" }} />
                  </div>
                </div>
                {isOpen && (
                  <EditorAta
                    ata={ata}
                    hoje={hoje}
                    mudar={(patch) => mudar(ata.id, patch)}
                    excluir={() => excluir(ata.id)}
                    fechar={() => setAberta(null)}
                    abrirEmpresaPorNome={abrirEmpresaPorNome}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
