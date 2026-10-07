import React, { useState } from "react";
import { Plus, X, Plane, Target, Handshake, CheckCircle2, TrendingUp, Landmark } from "lucide-react";
import { filterInputStyle, labelStyle } from "../styles";

const mono = "'IBM Plex Mono', monospace";
const serif = "'Fraunces', serif";

const caixa = {
  background: "#FFFFFF",
  border: "1px solid #E6E9EF",
  borderRadius: 16,
  boxShadow: "0 1px 2px rgba(11,37,69,0.05), 0 10px 28px -6px rgba(11,37,69,0.12)",
  padding: "18px 22px",
};

// Painel de contratações da missão (empresas que compram a participação na missão).
// Todos os números são premissas preenchidas pela equipe; nada vem preenchido.
export function painelMissaoPadrao() {
  return {
    metaContratacoes: "",
    valorParticipante: "",
    moeda: "BRL",
    projecao: "pessimista",
    taxas: { pessimista: "", otimista: "" },
    instituicoes: [],
  };
}

const num = (v) => {
  const n = parseFloat(String(v ?? "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const dinheiro = (n, moeda) => {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda || "BRL", maximumFractionDigits: 0 }).format(n);
  } catch (e) {
    return `${moeda} ${Math.round(n)}`;
  }
};

const CENARIOS = {
  pessimista: "Considera que só uma parte menor das empresas abordadas fecha a contratação da missão.",
  otimista: "Considera que a maior parte das empresas abordadas fecha a contratação da missão.",
};

function Toggle({ opcoes, valor, onChange }) {
  return (
    <div style={{ display: "inline-flex", border: "1px solid #D6DAE2", borderRadius: 8, overflow: "hidden" }}>
      {opcoes.map(([k, label]) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          style={{ border: "none", padding: "7px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", background: valor === k ? "#0B2545" : "#FFFFFF", color: valor === k ? "#FFFFFF" : "#566175" }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Kpi({ icon: Icon, label, valor, cor, sub }) {
  return (
    <div style={{ flex: "1 1 170px", background: "#FAFBFC", border: "1px solid #EEF1F5", borderTop: `3px solid ${cor}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, ...labelStyle, marginBottom: 8 }}>
        <Icon size={12} style={{ color: cor }} /> {label}
      </div>
      <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 30, color: cor, lineHeight: 1 }}>{valor}</div>
      {sub && <div style={{ fontSize: 11.5, color: "#8992A6", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function CampoNumero({ label, valor, onChange, sufixo, placeholder = "—", largura = 90 }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ ...labelStyle, marginBottom: 0 }}>{label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          value={valor ?? ""}
          inputMode="decimal"
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...filterInputStyle, width: largura, padding: "6px 10px", fontSize: 13, fontFamily: mono }}
        />
        {sufixo && <span style={{ fontSize: 12, color: "#8992A6" }}>{sufixo}</span>}
      </span>
    </label>
  );
}

export default function PainelMissao({ painel, onChange, nomeProjeto, participantes = [] }) {
  const base = painel || {};
  const pm = {
    ...painelMissaoPadrao(),
    ...base,
    projecao: base.projecao === "otimista" ? "otimista" : "pessimista",
    taxas: { ...painelMissaoPadrao().taxas, ...(base.taxas || {}) },
  };
  const set = (mudanca) => onChange({ ...pm, ...mudanca });
  const [novaInst, setNovaInst] = useState({ nome: "", delegados: "" });

  const abordadas = participantes.filter((x) => x.status !== "nao_participa").length;
  const confirmadas = participantes.filter((x) => x.status === "confirmada").length;
  const meta = num(pm.metaContratacoes);
  const valor = num(pm.valorParticipante);
  const taxa = num(pm.taxas[pm.projecao]);
  const projecao = abordadas && taxa != null ? Math.round((abordadas * taxa) / 100) : null;
  const receitaConfirmada = valor != null ? confirmadas * valor : null;
  const receitaProjetada = valor != null && projecao != null ? Math.max(projecao, confirmadas) * valor : null;
  const receitaMeta = valor != null && meta != null ? meta * valor : null;
  const progresso = meta ? Math.min(100, Math.round((confirmadas / meta) * 100)) : 0;

  const instituicoes = pm.instituicoes || [];
  const somaInst = instituicoes.reduce((s, i) => s + (num(i.delegados) || 0), 0);
  const maxInst = Math.max(1, ...instituicoes.map((i) => num(i.delegados) || 0));
  const addInst = () => {
    const nome = novaInst.nome.trim();
    if (!nome) return;
    set({ instituicoes: [...instituicoes, { id: `inst-${Date.now()}`, nome, delegados: novaInst.delegados }] });
    setNovaInst({ nome: "", delegados: "" });
  };
  const patchInst = (id, mudanca) => set({ instituicoes: instituicoes.map((i) => (i.id === id ? { ...i, ...mudanca } : i)) });

  const fmt = (v) => (v == null ? "—" : v);
  const contr = (n) => `${n} contrataç${n === 1 ? "ão" : "ões"}`;
  const nomeCenario = pm.projecao === "otimista" ? "Otimista" : "Pessimista";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Resumo */}
      <div style={{ ...caixa, borderLeft: "4px solid #FF9933", background: "linear-gradient(135deg, #FFFFFF 0%, #FBF7F1 100%)" }}>
        <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 18, color: "#0B2545" }}>{nomeProjeto || "Missão"}: contratações da missão</div>
        <div style={{ fontSize: 13, color: "#566175", marginTop: 6, lineHeight: 1.55 }}>
          Meta: <b>{meta != null ? `${meta} contratações` : "contratações a definir"}</b>
          {" · "}{abordadas} empresa{abordadas === 1 ? "" : "s"} abordada{abordadas === 1 ? "" : "s"}
          {" · "}Valor por participante: <b>{valor != null ? dinheiro(valor, pm.moeda) : "a definir"}</b>
        </div>
      </div>

      {/* Cenário */}
      <div style={caixa}>
        <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 17, color: "#0B2545", marginBottom: 14 }}>Cenário de contratações</div>
        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>Projeção</div>
          <Toggle opcoes={[["pessimista", "pessimista"], ["otimista", "otimista"]]} valor={pm.projecao} onChange={(v) => set({ projecao: v })} />
        </div>
        <div style={{ background: "#F7F8FA", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#566175", lineHeight: 1.55, marginBottom: 16 }}>
          <b style={{ color: "#1B2438" }}>Cenário {nomeCenario}{taxa != null ? ` (${taxa}% das abordadas)` : ""}.</b> {CENARIOS[pm.projecao]}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Kpi icon={Handshake} label="Empresas abordadas" valor={abordadas} cor="#0B2545" sub="Empresas participantes da missão" />
          <Kpi icon={CheckCircle2} label="Contratações confirmadas" valor={confirmadas} cor="#0E7C3A" />
          <Kpi icon={Target} label="Meta de contratações" valor={fmt(meta)} cor="#E8742B" />
          <Kpi icon={Plane} label={`Projeção ${nomeCenario.toLowerCase()}`} valor={fmt(projecao)} cor="#2F6FB0" sub={projecao == null ? "Preencha a taxa do cenário" : (projecao === 1 ? "contratação" : "contratações")} />
        </div>
        <div style={{ borderTop: "1px solid #EEF1F5", marginTop: 16, paddingTop: 14 }}>
          <div style={{ ...labelStyle, marginBottom: 10 }}>Premissas (editáveis)</div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end" }}>
            <CampoNumero label="Meta de contratações" valor={pm.metaContratacoes} onChange={(v) => set({ metaContratacoes: v })} />
            <CampoNumero label="Valor por participante" valor={pm.valorParticipante} onChange={(v) => set({ valorParticipante: v })} largura={110} />
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ ...labelStyle, marginBottom: 0 }}>Moeda</span>
              <select value={pm.moeda} onChange={(e) => set({ moeda: e.target.value })} style={{ ...filterInputStyle, padding: "6px 10px", fontSize: 13 }}>
                {["BRL", "USD", "INR"].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <CampoNumero label="Cenário pessimista" valor={pm.taxas.pessimista} sufixo="% das abordadas" placeholder="ex.: 30" onChange={(v) => set({ taxas: { ...pm.taxas, pessimista: v } })} largura={80} />
            <CampoNumero label="Cenário otimista" valor={pm.taxas.otimista} sufixo="% das abordadas" placeholder="ex.: 60" onChange={(v) => set({ taxas: { ...pm.taxas, otimista: v } })} largura={80} />
          </div>
        </div>
      </div>

      {/* Acompanhamento */}
      <div style={caixa}>
        <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 17, color: "#0B2545", marginBottom: 14 }}>Acompanhamento das contratações</div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#566175", marginBottom: 6 }}>
            <span>{confirmadas} confirmada{confirmadas === 1 ? "" : "s"} de {meta != null ? `${meta} da meta` : "meta a definir"}</span>
            <span style={{ fontFamily: mono, fontWeight: 600, color: "#0E7C3A" }}>{progresso}%</span>
          </div>
          <div style={{ height: 10, background: "#EEF1F5", borderRadius: 6, overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(11,37,69,0.08)" }}>
            <div style={{ width: `${progresso}%`, height: "100%", background: "#0E7C3A", borderRadius: 6 }} />
          </div>
          <div style={{ fontSize: 11.5, color: "#8992A6", marginTop: 6 }}>As confirmações vêm do status "Confirmada" em Empresas participantes, logo abaixo.</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12 }}>
          {[
            { label: "Receita confirmada", valor: receitaConfirmada, cor: "#0E7C3A", bg: "#EEF6F0", sub: contr(confirmadas) },
            { label: `Receita projetada (${nomeCenario.toLowerCase()})`, valor: receitaProjetada, cor: "#2F6FB0", bg: "#EAF1FA", sub: projecao != null ? contr(Math.max(projecao, confirmadas)) : "preencha a taxa do cenário" },
            { label: "Receita se bater a meta", valor: receitaMeta, cor: "#B8752E", bg: "#FBF3EA", sub: meta != null ? contr(meta) : "preencha a meta" },
          ].map((r) => (
            <div key={r.label} style={{ background: r.bg, borderLeft: `4px solid ${r.cor}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ ...labelStyle, color: r.cor }}><TrendingUp size={11} style={{ verticalAlign: "-1px" }} /> {r.label}</div>
              <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 26, color: r.cor, lineHeight: 1.1 }}>{r.valor != null ? dinheiro(r.valor, pm.moeda) : "—"}</div>
              <div style={{ fontSize: 12, color: "#566175", marginTop: 4 }}>{valor == null ? "preencha o valor por participante" : r.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Delegados */}
      <div style={caixa}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 17, color: "#0B2545", flex: 1 }}>Delegados por empresa / instituição</div>
          <span style={{ fontFamily: mono, fontSize: 11, color: "#8992A6" }}>Total: {somaInst} delegado{somaInst === 1 ? "" : "s"}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {instituicoes.length === 0 && <div style={{ fontSize: 12.5, color: "#8992A6" }}>Nenhuma empresa ou instituição cadastrada.</div>}
          {instituicoes.map((i) => {
            const n = num(i.delegados) || 0;
            return (
              <div key={i.id} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <Landmark size={13} style={{ color: "#8992A6", flexShrink: 0 }} />
                <input value={i.nome} onChange={(e) => patchInst(i.id, { nome: e.target.value })} style={{ ...filterInputStyle, border: "none", padding: "2px", flex: "0 1 200px", fontSize: 13, fontWeight: 600, color: "#0B2545" }} />
                <div style={{ flex: "1 1 160px", height: 10, background: "#EEF1F5", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ width: `${(n / maxInst) * 100}%`, height: "100%", background: "#0B2545", borderRadius: 6 }} />
                </div>
                <input value={i.delegados} inputMode="numeric" placeholder="0" onChange={(e) => patchInst(i.id, { delegados: e.target.value })} style={{ ...filterInputStyle, width: 54, padding: "4px 8px", fontFamily: mono, textAlign: "center" }} />
                <span style={{ fontSize: 11, color: "#8992A6" }}>del.</span>
                <button onClick={() => set({ instituicoes: instituicoes.filter((x) => x.id !== i.id) })} title="Remover" style={{ background: "transparent", border: "none", cursor: "pointer", color: "#B7BEC9", padding: 0, display: "flex" }}><X size={14} /></button>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={novaInst.nome} placeholder="Empresa / instituição" onChange={(e) => setNovaInst((s) => ({ ...s, nome: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addInst(); }} style={{ ...filterInputStyle, flex: "2 1 200px", padding: "6px 10px", fontSize: 12.5 }} />
          <input value={novaInst.delegados} placeholder="Delegados" inputMode="numeric" onChange={(e) => setNovaInst((s) => ({ ...s, delegados: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addInst(); }} style={{ ...filterInputStyle, flex: "0 1 100px", padding: "6px 10px", fontSize: 12.5 }} />
          <button onClick={addInst} className="ccib-btn" style={{ display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "1px solid #0B2545", color: "#0B2545", borderRadius: 7, padding: "6px 12px", fontSize: 12.5, cursor: "pointer" }}>
            <Plus size={14} /> Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
