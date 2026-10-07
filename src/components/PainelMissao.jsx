import React, { useState } from "react";
import { Plus, X, Plane, Target, Landmark, Star, TrendingUp } from "lucide-react";
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

// Painel padrão: só a estrutura e o valor já conhecido do plano Institucional (US$ 2.100/ano).
// Todos os demais números são premissas que a equipe preenche.
export function painelMissaoPadrao() {
  return {
    metaDelegados: "",
    estrategia: "A",
    projecao: "conservador",
    taxas: { conservador: "", otimista: "" },
    pctInstitucional: { A: "67", B: "33" },
    planos: { institucional: "2100", taj: "" },
    convertidos: "",
    instituicoes: [],
  };
}

const num = (v) => {
  const n = parseFloat(String(v ?? "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const usd = (n) => `US$ ${Math.round(n).toLocaleString("pt-BR")}`;

const ESTRATEGIAS = {
  A: { titulo: "Maioria Institucional", texto: "Prioriza o plano Institucional como porta de entrada (custo acessível). Indicado para gestores públicos, técnicos e pequenos empresários. Abordagem durante a missão ou nos primeiros 15 dias após o retorno." },
  B: { titulo: "Maioria TAJ", texto: "Prioriza o plano TAJ para empresas com potencial de negócios recorrentes com a Índia. Exige proposta personalizada e acompanhamento comercial após a missão." },
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

function Kpi({ icon: Icon, label, valor, cor }) {
  return (
    <div style={{ flex: "1 1 170px", background: "#FAFBFC", border: "1px solid #EEF1F5", borderTop: `3px solid ${cor}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, ...labelStyle, marginBottom: 8 }}>
        <Icon size={12} style={{ color: cor }} /> {label}
      </div>
      <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 30, color: cor, lineHeight: 1 }}>{valor}</div>
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

export default function PainelMissao({ painel, onChange, nomeProjeto }) {
  const pm = { ...painelMissaoPadrao(), ...(painel || {}) };
  const set = (mudanca) => onChange({ ...pm, ...mudanca });
  const [novaInst, setNovaInst] = useState({ nome: "", delegados: "" });

  const instituicoes = pm.instituicoes || [];
  const somaInst = instituicoes.reduce((s, i) => s + (num(i.delegados) || 0), 0);
  const delegados = num(pm.metaDelegados) ?? (somaInst || null);
  const taxa = num(pm.taxas[pm.projecao]);
  const pctInst = num(pm.pctInstitucional[pm.estrategia]);
  const meta = delegados != null && taxa != null ? Math.round((delegados * taxa) / 100) : null;
  const nInst = meta != null && pctInst != null ? Math.round((meta * pctInst) / 100) : null;
  const nTaj = meta != null && nInst != null ? meta - nInst : null;
  const vInst = num(pm.planos.institucional);
  const vTaj = num(pm.planos.taj);
  const receita = nInst != null && nTaj != null && vInst != null && (nTaj === 0 || vTaj != null) ? nInst * vInst + nTaj * (vTaj || 0) : null;
  const convertidos = num(pm.convertidos) || 0;
  const progresso = meta ? Math.min(100, Math.round((convertidos / meta) * 100)) : 0;
  const maxInst = Math.max(1, ...instituicoes.map((i) => num(i.delegados) || 0));

  const addInst = () => {
    const nome = novaInst.nome.trim();
    if (!nome) return;
    set({ instituicoes: [...instituicoes, { id: `inst-${Date.now()}`, nome, delegados: novaInst.delegados }] });
    setNovaInst({ nome: "", delegados: "" });
  };
  const patchInst = (id, mudanca) => set({ instituicoes: instituicoes.map((i) => (i.id === id ? { ...i, ...mudanca } : i)) });

  const fmt = (v) => (v == null ? "—" : v);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Resumo */}
      <div style={{ ...caixa, borderLeft: "4px solid #FF9933", background: "linear-gradient(135deg, #FFFFFF 0%, #FBF7F1 100%)" }}>
        <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 18, color: "#0B2545" }}>{nomeProjeto || "Missão"}: planejamento de conversão</div>
        <div style={{ fontSize: 13, color: "#566175", marginTop: 6, lineHeight: 1.55 }}>
          Meta: <b>{delegados != null ? `${delegados} delegados` : "delegados a definir"}</b>
          {" · "}{instituicoes.length} instituiç{instituicoes.length === 1 ? "ão" : "ões"}
          {" · "}Planos: <b>Institucional</b> ({vInst != null ? `${usd(vInst)}/ano` : "valor a definir"}) e <b>TAJ</b> ({vTaj != null ? `${usd(vTaj)}/ano` : "valor a definir"}).
        </div>
      </div>

      {/* Cenário */}
      <div style={caixa}>
        <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 17, color: "#0B2545", marginBottom: 14 }}>Cenário estratégico ativo</div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 14 }}>
          <div>
            <div style={labelStyle}>Estratégia de conversão</div>
            <Toggle opcoes={[["A", "A"], ["B", "B"]]} valor={pm.estrategia} onChange={(v) => set({ estrategia: v })} />
          </div>
          <div>
            <div style={labelStyle}>Projeção</div>
            <Toggle opcoes={[["conservador", "conservador"], ["otimista", "otimista"]]} valor={pm.projecao} onChange={(v) => set({ projecao: v })} />
          </div>
        </div>
        <div style={{ background: "#F7F8FA", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#566175", lineHeight: 1.55, marginBottom: 16 }}>
          <b style={{ color: "#1B2438" }}>Cenário {pm.estrategia}: {ESTRATEGIAS[pm.estrategia].titulo}.</b> {ESTRATEGIAS[pm.estrategia].texto}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Kpi icon={Plane} label="Delegados na missão" valor={fmt(delegados)} cor="#0B2545" />
          <Kpi icon={Target} label="Meta de conversão" valor={fmt(meta)} cor="#E8742B" />
          <Kpi icon={Landmark} label="Institucional" valor={fmt(nInst)} cor="#2F6FB0" />
          <Kpi icon={Star} label="TAJ" valor={fmt(nTaj)} cor="#C9A227" />
        </div>
        <div style={{ borderTop: "1px solid #EEF1F5", marginTop: 16, paddingTop: 14 }}>
          <div style={{ ...labelStyle, marginBottom: 10 }}>Premissas (editáveis)</div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <CampoNumero label="Meta de delegados" valor={pm.metaDelegados} placeholder={somaInst ? String(somaInst) : "—"} onChange={(v) => set({ metaDelegados: v })} />
            <CampoNumero label="Conversão conservadora" valor={pm.taxas.conservador} sufixo="%" placeholder="ex.: 30" onChange={(v) => set({ taxas: { ...pm.taxas, conservador: v } })} largura={80} />
            <CampoNumero label="Conversão otimista" valor={pm.taxas.otimista} sufixo="%" placeholder="ex.: 50" onChange={(v) => set({ taxas: { ...pm.taxas, otimista: v } })} largura={80} />
            <CampoNumero label="% Institucional (A)" valor={pm.pctInstitucional.A} sufixo="%" onChange={(v) => set({ pctInstitucional: { ...pm.pctInstitucional, A: v } })} largura={60} />
            <CampoNumero label="% Institucional (B)" valor={pm.pctInstitucional.B} sufixo="%" onChange={(v) => set({ pctInstitucional: { ...pm.pctInstitucional, B: v } })} largura={60} />
            <CampoNumero label="Institucional (US$/ano)" valor={pm.planos.institucional} onChange={(v) => set({ planos: { ...pm.planos, institucional: v } })} />
            <CampoNumero label="TAJ (US$/ano)" valor={pm.planos.taj} onChange={(v) => set({ planos: { ...pm.planos, taj: v } })} />
          </div>
        </div>
      </div>

      {/* Acompanhamento */}
      <div style={caixa}>
        <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 17, color: "#0B2545", marginBottom: 14 }}>Acompanhamento de conversão pós-missão</div>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 16 }}>
          <div>
            <div style={labelStyle}>Convertidos até agora</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input value={pm.convertidos} inputMode="numeric" placeholder="0" onChange={(e) => set({ convertidos: e.target.value })} style={{ ...filterInputStyle, width: 70, fontFamily: serif, fontWeight: 600, fontSize: 20, textAlign: "center", padding: "6px 8px" }} />
              <span style={{ fontSize: 13, color: "#8992A6" }}>de {meta != null ? `${meta} meta` : "meta a definir"}</span>
            </div>
          </div>
          <div style={{ flex: "1 1 260px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#566175", marginBottom: 6 }}>
              <span>Progresso</span>
              <span style={{ fontFamily: mono, fontWeight: 600, color: "#0E7C3A" }}>{progresso}%</span>
            </div>
            <div style={{ height: 10, background: "#EEF1F5", borderRadius: 6, overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(11,37,69,0.08)" }}>
              <div style={{ width: `${progresso}%`, height: "100%", background: "#0E7C3A", borderRadius: 6 }} />
            </div>
          </div>
        </div>
        <div style={{ background: "#EEF6F0", borderLeft: "4px solid #0E7C3A", borderRadius: 10, padding: "14px 18px" }}>
          <div style={{ ...labelStyle, color: "#0E7C3A" }}><TrendingUp size={11} style={{ verticalAlign: "-1px" }} /> Receita projetada (cenário)</div>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 30, color: "#0E7C3A", lineHeight: 1.1 }}>{receita != null ? usd(receita) : "—"}</div>
          <div style={{ fontSize: 12, color: "#566175", marginTop: 4 }}>
            Cenário {pm.estrategia} · {pm.projecao === "conservador" ? "Conservador" : "Otimista"}{taxa != null ? ` (${taxa}%)` : ""}
            {receita == null && " · preencha as premissas para calcular"}
          </div>
        </div>
      </div>

      {/* Instituições */}
      <div style={caixa}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 17, color: "#0B2545", flex: 1 }}>Distribuição de delegados por instituição</div>
          <span style={{ fontFamily: mono, fontSize: 11, color: "#8992A6" }}>Total: {somaInst} delegado{somaInst === 1 ? "" : "s"}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {instituicoes.length === 0 && <div style={{ fontSize: 12.5, color: "#8992A6" }}>Nenhuma instituição cadastrada.</div>}
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
                <button onClick={() => set({ instituicoes: instituicoes.filter((x) => x.id !== i.id) })} title="Remover instituição" style={{ background: "transparent", border: "none", cursor: "pointer", color: "#B7BEC9", padding: 0, display: "flex" }}><X size={14} /></button>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={novaInst.nome} placeholder="Instituição / empresa" onChange={(e) => setNovaInst((s) => ({ ...s, nome: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addInst(); }} style={{ ...filterInputStyle, flex: "2 1 200px", padding: "6px 10px", fontSize: 12.5 }} />
          <input value={novaInst.delegados} placeholder="Delegados" inputMode="numeric" onChange={(e) => setNovaInst((s) => ({ ...s, delegados: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addInst(); }} style={{ ...filterInputStyle, flex: "0 1 100px", padding: "6px 10px", fontSize: 12.5 }} />
          <button onClick={addInst} className="ccib-btn" style={{ display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "1px solid #0B2545", color: "#0B2545", borderRadius: 7, padding: "6px 12px", fontSize: 12.5, cursor: "pointer" }}>
            <Plus size={14} /> Instituição
          </button>
        </div>
      </div>
    </div>
  );
}
