import React, { useState } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { RESPONSAVEIS } from "../constants";
import { filterInputStyle } from "../styles";
import { formatDate } from "../lib/format";

const mono = "'IBM Plex Mono', monospace";
const serif = "'Fraunces', serif";

// Etapas do funil comercial da CCIB (mesma sequência do pipeline do HubSpot)
export const ETAPAS_PIPELINE = [
  { key: "prospeccao", label: "Negócio Perdido", detalhe: "Sem negócio aberto", color: "#8992A6" },
  { key: "primeiro", label: "Primeiro contato", detalhe: "Reunião ou apresentação", color: "#B8752E" },
  { key: "proposta", label: "Proposta enviada", detalhe: "Em negociação", color: "#2F6FB0" },
  { key: "aceita", label: "Proposta aceita", detalhe: "Aguardando ficha", color: "#6A5ACD" },
  { key: "ficha", label: "Ficha preenchida / assinada", detalhe: "Documentação", color: "#0E8A7A" },
  { key: "boleto", label: "Boleto enviado", detalhe: "Aguardando pagamento", color: "#0E7C3A" },
];

const ETAPA_TEXTO = {
  primeiro: "Primeiro Contato",
  proposta: "Proposta Enviada / Em negociação",
  aceita: "Proposta Aceita",
  ficha: "Ficha Preenchida / Assinada",
  boleto: "Boleto Enviado / Aguardando Pagamento",
};

function normalizar(s) {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Em qual coluna do funil a empresa está
export function etapaDoPipeline(m) {
  if (m.status === "prospeccao") return "prospeccao";
  if (m.status !== "negociacao") return null;
  const e = normalizar(m.etapaNegocio);
  if (e.includes("boleto") || e.includes("pagamento")) return "boleto";
  if (e.includes("ficha")) return "ficha";
  if (e.includes("aceita")) return "aceita";
  if (e.includes("primeiro")) return "primeiro";
  return "proposta";
}

function valorNumerico(txt) {
  const n = (txt || "").replace(/[^\d,]/g, "").replace(",", ".");
  return n ? parseFloat(n) || 0 : 0;
}

function moeda(txt) {
  const t = txt || "";
  if (t.includes("US$")) return "US$";
  if (t.includes("R$")) return "R$";
  return "";
}

function responsavelLabel(id) {
  return (RESPONSAVEIS.find((r) => r.id === id) || {}).label || "Ambos";
}

function Kpi({ valor, label, cor = "#0B2545", alerta }) {
  return (
    <div style={{ flex: "1 1 160px", background: "#FFFFFF", border: "1px solid #E6E9EF", borderRadius: 12, padding: "14px 18px", boxShadow: "0 2px 8px -2px rgba(11,37,69,0.08)" }}>
      <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 28, color: cor, lineHeight: 1, display: "flex", alignItems: "center", gap: 8 }}>
        {valor}
        {alerta && <AlertTriangle size={18} />}
      </div>
      <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8992A6", marginTop: 8 }}>{label}</div>
    </div>
  );
}

function Cartao({ m, etapa, hoje, mover, abrirEmpresa }) {
  const vencida = m.status === "negociacao" && m.dataNegocio && m.dataNegocio < hoje;
  const valor = m.valorNegocio || "";
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${vencida ? "#F1C9BE" : "#E6E9EF"}`, borderLeft: `4px solid ${etapa.color}`, borderRadius: 10, padding: "10px 12px", boxShadow: "0 2px 6px -2px rgba(11,37,69,0.10)" }}>
      <button
        onClick={abrirEmpresa}
        title="Abrir na aba Empresas"
        style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontSize: 13.5, fontWeight: 600, color: "#1B2438", lineHeight: 1.3 }}
      >
        {m.nome || "(sem nome)"}
      </button>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
        {valor && <span style={{ fontFamily: mono, fontSize: 10.5, color: "#0B2545", background: "#EEF1F5", borderRadius: 5, padding: "2px 7px" }}>{valor}</span>}
        {m.dataNegocio && m.status === "negociacao" && (
          <span style={{ fontFamily: mono, fontSize: 10.5, color: vencida ? "#C1502E" : "#566175", background: vencida ? "#FDF2F0" : "#F4F5F8", borderRadius: 5, padding: "2px 7px" }}>
            {vencida ? "vencida " : "previsão "}{formatDate(m.dataNegocio)}
          </span>
        )}
        {m.estado && <span style={{ fontFamily: mono, fontSize: 10.5, color: "#566175", background: "#F4F5F8", borderRadius: 5, padding: "2px 7px" }}>{m.estado}</span>}
        <span style={{ fontFamily: mono, fontSize: 10.5, color: "#FFFFFF", background: "#0B2545", borderRadius: 5, padding: "2px 7px" }}>{responsavelLabel(m.responsavel)}</span>
      </div>
      {m.proximoPasso && <div style={{ fontSize: 12, color: "#566175", marginTop: 7, lineHeight: 1.4 }}>Próximo passo: {m.proximoPasso}</div>}
      <select
        value=""
        onChange={(e) => e.target.value && mover(m, e.target.value)}
        style={{ ...filterInputStyle, width: "100%", marginTop: 8, padding: "4px 8px", fontSize: 11.5, color: "#566175" }}
      >
        <option value="">Mover para…</option>
        {ETAPAS_PIPELINE.filter((e) => e.key !== etapa.key).map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
        <option value="ganho">✓ Ganho: virou associado</option>
        <option value="perdido">✕ Perdido: vai para o histórico</option>
      </select>
    </div>
  );
}

export default function PipelineTab({ members, patchMember, addPipelineItem, abrirEmpresa }) {
  const [busca, setBusca] = useState("");
  const [resp, setResp] = useState("todos");
  const [novo, setNovo] = useState("");
  const hoje = new Date().toISOString().slice(0, 10);

  const q = normalizar(busca.trim());
  const itens = members
    .filter((m) => etapaDoPipeline(m))
    .filter((m) => !q || normalizar(m.nome).includes(q))
    .filter((m) => resp === "todos" || m.responsavel === resp)
    .sort((a, b) => (a.dataNegocio || "9999").localeCompare(b.dataNegocio || "9999") || (a.nome || "").localeCompare(b.nome || "", "pt-BR"));

  const emNegociacao = itens.filter((m) => m.status === "negociacao");
  const vencidas = emNegociacao.filter((m) => m.dataNegocio && m.dataNegocio < hoje);
  const mesAtual = hoje.slice(0, 7);
  const fechamMes = emNegociacao.filter((m) => (m.dataNegocio || "").startsWith(mesAtual) && m.dataNegocio >= hoje);
  const somaUsd = emNegociacao.filter((m) => moeda(m.valorNegocio) === "US$").reduce((s, m) => s + valorNumerico(m.valorNegocio), 0);

  const mover = (m, destino) => {
    if (destino === "ganho") {
      if (window.confirm(`Marcar ${m.nome} como ganho? A empresa passa para Associados ativos.`)) patchMember(m.id, { status: "ativo", etapaNegocio: "Negócio fechado" });
      return;
    }
    if (destino === "perdido") {
      if (window.confirm(`Marcar ${m.nome} como perdido? A empresa vai para o Histórico de prospecção.`)) patchMember(m.id, { status: "perdido", etapaNegocio: "Negócio perdido", dataNegocio: m.dataNegocio || hoje });
      return;
    }
    if (destino === "prospeccao") {
      patchMember(m.id, { status: "prospeccao" });
      return;
    }
    const servicos = (m.etapaNegocio || "").includes("(serviços)") ? " (serviços)" : "";
    patchMember(m.id, { status: "negociacao", etapaNegocio: ETAPA_TEXTO[destino] + servicos });
  };

  const adicionar = () => {
    const nome = novo.trim();
    if (!nome) return;
    addPipelineItem(nome);
    setNovo("");
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 600, fontSize: 24, margin: 0, color: "#0B2545" }}>Pipeline de prospects</h2>
          <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8992A6", marginTop: 4 }}>
            Funil comercial da CCIB Regional Sul · negócios do HubSpot atualizados todo dia
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <Kpi valor={itens.length} label="Prospects no funil" />
        <Kpi valor={emNegociacao.length} label="Com proposta em andamento" cor="#2F6FB0" />
        <Kpi valor={somaUsd ? `US$ ${somaUsd.toLocaleString("pt-BR")}` : "—"} label="Valor em negociação" cor="#0E7C3A" />
        <Kpi valor={vencidas.length} label="Previsões vencidas" cor={vencidas.length ? "#C1502E" : "#0B2545"} alerta={vencidas.length > 0} />
        <Kpi valor={fechamMes.length} label="Fechamentos previstos no mês" cor="#B8752E" />
      </div>

      {/* Funil resumido */}
      <div style={{ display: "flex", gap: 4, marginBottom: 18, flexWrap: "wrap" }}>
        {ETAPAS_PIPELINE.map((e, i) => {
          const n = itens.filter((m) => etapaDoPipeline(m) === e.key).length;
          return (
            <div key={e.key} style={{ flex: "1 1 120px", background: `${e.color}14`, borderRadius: i === 0 ? "10px 4px 4px 10px" : i === ETAPAS_PIPELINE.length - 1 ? "4px 10px 10px 4px" : 4, padding: "8px 12px", borderTop: `3px solid ${e.color}` }}>
              <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 20, color: e.color }}>{n}</div>
              <div style={{ fontSize: 11.5, color: "#1B2438" }}>{e.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <input placeholder="Buscar empresa..." value={busca} onChange={(e) => setBusca(e.target.value)} style={{ ...filterInputStyle, flex: "1 1 200px" }} />
        <select value={resp} onChange={(e) => setResp(e.target.value)} style={{ ...filterInputStyle, width: "auto" }}>
          <option value="todos">Todos os responsáveis</option>
          {RESPONSAVEIS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        <div style={{ display: "flex", gap: 6, flex: "1 1 260px" }}>
          <input
            placeholder="Novo prospect (nome da empresa)"
            value={novo}
            onChange={(e) => setNovo(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") adicionar(); }}
            style={{ ...filterInputStyle, flex: 1 }}
          />
          <button onClick={adicionar} className="ccib-btn ccib-btn-solid" style={{ display: "flex", alignItems: "center", gap: 5, background: "#0B2545", color: "#FFFFFF", border: "1px solid #0B2545", borderRadius: 7, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}>
            <Plus size={14} /> Adicionar
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12, alignItems: "flex-start" }}>
        {ETAPAS_PIPELINE.map((e) => {
          const col = itens.filter((m) => etapaDoPipeline(m) === e.key);
          return (
            <div key={e.key} style={{ flex: "1 1 0", minWidth: 172, background: "#F7F8FA", border: "1px solid #E6E9EF", borderRadius: 12, padding: 10, display: "flex", flexDirection: "column", gap: 8, maxHeight: 640 }}>
              <div style={{ padding: "2px 4px 6px", borderBottom: `3px solid ${e.color}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0B2545" }}>{e.label}</span>
                  <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, color: e.color, background: `${e.color}1A`, borderRadius: 10, padding: "1px 7px" }}>{col.length}</span>
                </div>
                <div style={{ fontFamily: mono, fontSize: 9.5, color: "#8992A6", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{e.detalhe}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
                {col.length === 0 && <div style={{ fontSize: 12, color: "#B7BEC9", padding: "8px 4px" }}>Nenhuma empresa.</div>}
                {col.map((m) => (
                  <Cartao key={m.id} m={m} etapa={e} hoje={hoje} mover={mover} abrirEmpresa={() => abrirEmpresa(m.id)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11.5, color: "#8992A6", marginTop: 6 }}>
        Ganhos vão para Associados ativos e perdidos para o Histórico de prospecção, na aba Empresas. Clique no nome para editar todos os dados da empresa.
      </div>
    </div>
  );
}
