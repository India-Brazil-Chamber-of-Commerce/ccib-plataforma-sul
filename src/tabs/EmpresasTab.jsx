import React, { useState } from "react";
import { Plus, Trash2, Building2, ChevronDown, ChevronRight, Handshake, History } from "lucide-react";
import { ESTADOS, RESPONSAVEIS, STATUS_MEMBER, PERIODICIDADES } from "../constants";
import { inputStyle, labelStyle, filterInputStyle } from "../styles";
import { Field, HubspotSyncBar, ChakraIcon } from "../components/ui";
import { formatDate } from "../lib/format";

const mono = "'IBM Plex Mono', monospace";
const serif = "'Fraunces', serif";

const card = {
  background: "#FFFFFF",
  border: "1px solid #E6E9EF",
  borderRadius: 16,
  boxShadow: "0 1px 2px rgba(11,37,69,0.05), 0 10px 28px -6px rgba(11,37,69,0.12)",
  padding: "22px 24px",
  marginBottom: 28,
};

const COR_UF = { PR: "#E8964F", SC: "#6F8F68", RS: "#5E7FA6" };

function iniciais(nome) {
  const partes = (nome || "?").trim().split(/\s+/).filter((p) => /[A-Za-zÀ-ÿ0-9]/.test(p));
  const letras = partes.length > 1 ? partes[0][0] + partes[1][0] : (partes[0] || "?").slice(0, 2);
  return letras.toUpperCase();
}

function responsavelLabel(id) {
  return (RESPONSAVEIS.find((r) => r.id === id) || {}).label || "Ambos";
}

function BlockTitle({ icon, children, kicker, count, accent = "#0E7C3A", right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: `${accent}14`, color: accent, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon || <ChakraIcon size={20} color={accent} />}
      </span>
      <div style={{ flex: 1, minWidth: 180 }}>
        <h2 style={{ fontFamily: serif, fontWeight: 600, fontSize: 21, margin: 0, color: "#0B2545", lineHeight: 1.15 }}>
          {children}
          {count !== undefined && (
            <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: accent, background: `${accent}14`, borderRadius: 10, padding: "2px 8px", marginLeft: 10, verticalAlign: "middle" }}>{count}</span>
          )}
        </h2>
        {kicker && <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8992A6", marginTop: 3 }}>{kicker}</div>}
      </div>
      {right}
    </div>
  );
}

function Vazio({ texto }) {
  return <div style={{ padding: "18px 0", textAlign: "center", color: "#8992A6", fontSize: 13 }}>{texto}</div>;
}

function MemberEditor({ m, patchMember, removeMember, modalidadeSuggestions, tipoVinculoSuggestions }) {
  const statusInfo = STATUS_MEMBER[m.status] || STATUS_MEMBER.prospeccao;
  const negocio = m.status === "negociacao" || m.status === "perdido" || m.etapaNegocio;
  return (
    <div style={{ padding: "14px 16px 18px", background: "#FAFBFC", borderTop: "1px solid #EEF1F5" }} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
        <Field label="Nome / empresa">
          <input className="ccib-input" style={inputStyle} value={m.nome} placeholder="Nome do associado" onChange={(e) => patchMember(m.id, { nome: e.target.value })} />
        </Field>
        <Field label="Modalidade">
          <input className="ccib-input" style={inputStyle} list={`modalidades-${m.id}`} value={m.modalidade || ""} placeholder="Ex: Ouro, Corporate..." onChange={(e) => patchMember(m.id, { modalidade: e.target.value })} />
          <datalist id={`modalidades-${m.id}`}>
            {modalidadeSuggestions.map((s) => <option key={s} value={s} />)}
          </datalist>
        </Field>
        <Field label="Estado">
          <select className="ccib-input" style={inputStyle} value={m.estado || ""} onChange={(e) => patchMember(m.id, { estado: e.target.value })}>
            <option value="">A definir</option>
            {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select style={{ ...inputStyle, color: statusInfo.color, fontWeight: 600 }} value={m.status} onChange={(e) => patchMember(m.id, { status: e.target.value })}>
            {Object.entries(STATUS_MEMBER).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </Field>
      </div>
      {negocio && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
          <Field label="Etapa do negócio">
            <input className="ccib-input" style={inputStyle} value={m.etapaNegocio || ""} placeholder="Ex: Proposta enviada" onChange={(e) => patchMember(m.id, { etapaNegocio: e.target.value })} />
          </Field>
          <Field label="Valor do negócio">
            <input className="ccib-input" style={inputStyle} value={m.valorNegocio || ""} placeholder="Ex: US$ 2.100" onChange={(e) => patchMember(m.id, { valorNegocio: e.target.value })} />
          </Field>
          <Field label={m.status === "perdido" ? "Data do fechamento" : "Previsão de fechamento"}>
            <input type="date" style={{ ...inputStyle, colorScheme: "light" }} value={m.dataNegocio || ""} onChange={(e) => patchMember(m.id, { dataNegocio: e.target.value })} />
          </Field>
          <Field label="Próximo passo">
            <input className="ccib-input" style={inputStyle} value={m.proximoPasso || ""} placeholder="Ex: Ligar até sexta" onChange={(e) => patchMember(m.id, { proximoPasso: e.target.value })} />
          </Field>
        </div>
      )}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
        <Field label="Tipo de vínculo">
          <input className="ccib-input" style={inputStyle} list={`tipos-${m.id}`} value={m.tipoVinculo || ""} placeholder="Ex: Associação, Patrocínio..." onChange={(e) => patchMember(m.id, { tipoVinculo: e.target.value })} />
          <datalist id={`tipos-${m.id}`}>
            {tipoVinculoSuggestions.map((s) => <option key={s} value={s} />)}
          </datalist>
        </Field>
        <Field label="Periodicidade">
          <select className="ccib-input" style={inputStyle} value={m.periodicidade || ""} onChange={(e) => patchMember(m.id, { periodicidade: e.target.value })}>
            <option value="">A definir</option>
            {PERIODICIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Valor">
          <input className="ccib-input" style={inputStyle} value={m.valor || ""} placeholder="Ex: R$ 810,00" onChange={(e) => patchMember(m.id, { valor: e.target.value })} />
        </Field>
        <Field label="Taxa de sucesso">
          <input className="ccib-input" style={inputStyle} value={m.taxaSucesso || ""} placeholder="Ex: 10%" onChange={(e) => patchMember(m.id, { taxaSucesso: e.target.value })} />
        </Field>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
        <Field label="Responsável">
          <select className="ccib-input" style={inputStyle} value={m.responsavel} onChange={(e) => patchMember(m.id, { responsavel: e.target.value })}>
            {RESPONSAVEIS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </Field>
        <Field label="Contato principal">
          <input className="ccib-input" style={inputStyle} value={m.contato || ""} placeholder="Nome, telefone ou e-mail" onChange={(e) => patchMember(m.id, { contato: e.target.value })} />
        </Field>
        <Field label="Data de adesão">
          <input type="date" style={{ ...inputStyle, colorScheme: "light" }} value={m.dataAdesao || ""} onChange={(e) => patchMember(m.id, { dataAdesao: e.target.value })} />
        </Field>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
        <Field label="Notas">
          <input className="ccib-input" style={inputStyle} value={m.notas || ""} placeholder="Observações..." onChange={(e) => patchMember(m.id, { notas: e.target.value })} />
        </Field>
        <button onClick={() => removeMember(m.id)} title="Remover empresa" style={{ background: "transparent", border: "none", color: "#8992A6", cursor: "pointer", padding: "8px 4px" }}>
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function AtivoCard({ m, isOpen, onToggle, editor }) {
  const cor = COR_UF[m.estado] || "#0E7C3A";
  return (
    <div
      className="ccib-fade-in"
      style={{
        border: isOpen ? "1px solid #0B2545" : "1px solid #E6E9EF",
        borderRadius: 12,
        background: "#FFFFFF",
        boxShadow: "0 2px 8px -2px rgba(11,37,69,0.08)",
        overflow: "hidden",
        gridColumn: isOpen ? "1 / -1" : undefined,
      }}
    >
      <div onClick={onToggle} className="ccib-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}>
        <span style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${cor}, ${cor}CC)`, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: serif, fontWeight: 600, fontSize: 16, flexShrink: 0, boxShadow: `0 4px 10px -3px ${cor}88` }}>
          {iniciais(m.nome)}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "#1B2438", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.nome || "(sem nome)"}</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 5, flexWrap: "wrap" }}>
            <span style={{ fontFamily: mono, fontSize: 10.5, color: "#566175", background: "#EEF1F5", borderRadius: 5, padding: "2px 7px" }}>{m.modalidade || "Modalidade a definir"}</span>
            <span style={{ fontFamily: mono, fontSize: 10.5, fontWeight: 600, color: m.estado ? cor : "#8992A6", background: m.estado ? `${cor}1A` : "#F4F5F8", borderRadius: 5, padding: "2px 7px" }}>{m.estado || "UF?"}</span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: mono, fontSize: 12.5, color: "#0B2545", fontWeight: 600 }}>{m.valor || "—"}</div>
          {m.periodicidade && <div style={{ fontFamily: mono, fontSize: 10, color: "#8992A6", marginTop: 2 }}>{m.periodicidade}</div>}
        </div>
        <ChevronDown size={15} style={{ color: "#8992A6", flexShrink: 0, transition: "transform 0.15s ease", transform: isOpen ? "rotate(180deg)" : "none" }} />
      </div>
      {isOpen && editor}
    </div>
  );
}

function NegociacaoRow({ m, isOpen, onToggle, editor, patchMember, last }) {
  const atrasado = m.dataNegocio && m.dataNegocio < new Date().toISOString().slice(0, 10);
  return (
    <div style={{ borderBottom: last ? "none" : "1px solid #EEF1F5" }} className="ccib-fade-in">
      <div onClick={onToggle} className="ccib-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", cursor: "pointer", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 180px", minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1B2438" }}>{m.nome || "(sem nome)"}</div>
          <div style={{ fontFamily: mono, fontSize: 10.5, color: "#8992A6", marginTop: 2 }}>
            {m.valorNegocio || m.valor || "valor a definir"}
            {m.dataNegocio && (
              <span style={{ color: atrasado ? "#C1502E" : "#8992A6" }}> · previsão {formatDate(m.dataNegocio)}{atrasado ? " (vencida)" : ""}</span>
            )}
          </div>
        </div>
        <span style={{ flex: "0 1 220px", fontSize: 11.5, color: "#2F6FB0", background: "#EAF1FA", border: "1px solid #D2E1F3", borderRadius: 999, padding: "4px 11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {m.etapaNegocio || "Etapa a definir"}
        </span>
        <input
          className="ccib-input"
          onClick={(e) => e.stopPropagation()}
          value={m.proximoPasso || ""}
          placeholder="Próximo passo..."
          onChange={(e) => patchMember(m.id, { proximoPasso: e.target.value })}
          style={{ ...inputStyle, flex: "1 1 200px", fontSize: 12.5, padding: "6px 10px" }}
        />
        <span style={{ fontFamily: mono, fontSize: 10.5, color: "#FFFFFF", background: "#0B2545", borderRadius: 999, padding: "3px 10px", flexShrink: 0 }}>{responsavelLabel(m.responsavel)}</span>
        <ChevronDown size={15} style={{ color: "#8992A6", flexShrink: 0, transition: "transform 0.15s ease", transform: isOpen ? "rotate(180deg)" : "none" }} />
      </div>
      {isOpen && editor}
    </div>
  );
}

function situacaoHistorico(m) {
  if (m.status === "perdido") return { label: "Perdido", color: "#C1502E" };
  if (m.status === "inativo") return { label: "Inativo", color: "#8992A6" };
  return { label: "Sem negócio aberto", color: "#B8752E" };
}

export default function EmpresasTab({
  addMember,
  expandedMembers,
  hubspotBusy,
  hubspotError,
  hubspotMessage,
  memberFilterEstado,
  memberSearch,
  members,
  modalidadeSuggestions,
  patchMember,
  pullDealsFromHubspot,
  removeMember,
  setMemberFilterEstado,
  setMemberSearch,
  tipoVinculoSuggestions,
  toggleMemberExpand,
}) {
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [anoHistorico, setAnoHistorico] = useState("todos");

  const q = memberSearch.trim().toLowerCase();
  const filtrados = members
    .filter((m) => memberFilterEstado === "todos" || m.estado === memberFilterEstado)
    .filter((m) => !q || (m.nome || "").toLowerCase().includes(q) || (m.modalidade || "").toLowerCase().includes(q))
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));

  const ativos = filtrados.filter((m) => m.status === "ativo");
  const negociacao = filtrados
    .filter((m) => m.status === "negociacao")
    .sort((a, b) => (a.dataNegocio || "9999").localeCompare(b.dataNegocio || "9999"));
  const historicoTodos = filtrados.filter((m) => m.status !== "ativo" && m.status !== "negociacao");
  const anos = [...new Set(historicoTodos.map((m) => (m.dataNegocio || "").slice(0, 4)).filter(Boolean))].sort().reverse();
  const historico = historicoTodos
    .filter((m) => anoHistorico === "todos" || (anoHistorico === "sem" ? !m.dataNegocio : (m.dataNegocio || "").startsWith(anoHistorico)))
    .sort((a, b) => (b.dataNegocio || "").localeCompare(a.dataNegocio || "") || (a.nome || "").localeCompare(b.nome || "", "pt-BR"));

  const editorPara = (m) => (
    <MemberEditor m={m} patchMember={patchMember} removeMember={removeMember} modalidadeSuggestions={modalidadeSuggestions} tipoVinculoSuggestions={tipoVinculoSuggestions} />
  );

  return (
    <div>
      <HubspotSyncBar busy={hubspotBusy} onPull={pullDealsFromHubspot} pullKey="pull-deals" pullLabel="Puxar negócios do HubSpot" message={hubspotMessage} error={hubspotError} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
        <input placeholder="Buscar por nome ou modalidade..." value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} style={{ ...filterInputStyle, flex: "1 1 220px" }} />
        <select value={memberFilterEstado} onChange={(e) => setMemberFilterEstado(e.target.value)} style={{ ...filterInputStyle, width: "auto" }}>
          <option value="todos">Todos os estados</option>
          {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
        </select>
        <button
          onClick={() => addMember()}
          className="ccib-btn ccib-btn-solid"
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#0B2545", color: "#FFFFFF", border: "1px solid #0B2545", borderRadius: 7, padding: "8px 16px", fontWeight: 500, fontSize: 13, cursor: "pointer" }}
        >
          <Plus size={15} /> Nova empresa
        </button>
      </div>

      {/* 1. Associados ativos */}
      <div style={{ ...card, background: "linear-gradient(135deg, #FFFFFF 0%, #F3F9F5 100%)" }}>
        <BlockTitle kicker="Membros da CCIB · gestão do dia a dia" count={ativos.length}>Associados ativos</BlockTitle>
        {ativos.length === 0 ? (
          <Vazio texto="Nenhum associado ativo com esses filtros." />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 290px), 1fr))", gap: 12 }}>
            {ativos.map((m) => (
              <AtivoCard key={m.id} m={m} isOpen={expandedMembers.has(m.id)} onToggle={() => toggleMemberExpand(m.id)} editor={editorPara(m)} />
            ))}
          </div>
        )}
      </div>

      {/* 2. Em negociação */}
      <div style={card}>
        <BlockTitle icon={<Handshake size={18} />} accent="#2F6FB0" kicker="Negócios abertos no HubSpot" count={negociacao.length}>Em negociação</BlockTitle>
        {negociacao.length === 0 ? (
          <Vazio texto="Nenhum negócio em andamento com esses filtros." />
        ) : (
          <div style={{ border: "1px solid #E6E9EF", borderRadius: 12, overflow: "hidden" }}>
            {negociacao.map((m, i) => (
              <NegociacaoRow key={m.id} m={m} isOpen={expandedMembers.has(m.id)} onToggle={() => toggleMemberExpand(m.id)} editor={editorPara(m)} patchMember={patchMember} last={i === negociacao.length - 1} />
            ))}
          </div>
        )}
      </div>

      {/* 3. Histórico de prospecção */}
      <div style={{ ...card, padding: historicoAberto ? "22px 24px" : "16px 24px" }}>
        <div onClick={() => setHistoricoAberto((v) => !v)} style={{ cursor: "pointer" }}>
          <BlockTitle
            icon={<History size={18} />}
            accent="#8992A6"
            kicker="Negócios perdidos e empresas sem negócio aberto · referência"
            count={historicoTodos.length}
            right={historicoAberto ? <ChevronDown size={18} style={{ color: "#8992A6" }} /> : <ChevronRight size={18} style={{ color: "#8992A6" }} />}
          >
            Histórico de prospecção
          </BlockTitle>
        </div>
        {historicoAberto && (
          <>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {[{ k: "todos", l: "Todos os anos" }, ...anos.map((a) => ({ k: a, l: a })), { k: "sem", l: "Sem data" }].map((f) => {
                const ativo = anoHistorico === f.k;
                return (
                  <button
                    key={f.k}
                    onClick={() => setAnoHistorico(f.k)}
                    style={{ fontFamily: mono, fontSize: 11, padding: "5px 12px", borderRadius: 20, border: ativo ? "1px solid #0B2545" : "1px solid #E3E6EC", background: ativo ? "#0B2545" : "transparent", color: ativo ? "#FFFFFF" : "#566175", cursor: "pointer" }}
                  >
                    {f.l}
                  </button>
                );
              })}
            </div>
            {historico.length === 0 ? (
              <Vazio texto="Nenhuma empresa no histórico com esses filtros." />
            ) : (
              <div style={{ border: "1px solid #E6E9EF", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ display: "flex", gap: 10, padding: "8px 14px", background: "#FAFBFC", borderBottom: "1px solid #E6E9EF" }}>
                  <span style={{ ...labelStyle, flex: "1 1 160px", marginBottom: 0 }}>Empresa</span>
                  <span style={{ ...labelStyle, width: 130, marginBottom: 0 }}>Situação</span>
                  <span style={{ ...labelStyle, width: 86, textAlign: "right", marginBottom: 0 }}>Valor</span>
                  <span style={{ ...labelStyle, width: 82, textAlign: "right", marginBottom: 0 }}>Data</span>
                  <span style={{ ...labelStyle, width: 34, textAlign: "center", marginBottom: 0 }}>UF</span>
                </div>
                {historico.map((m, i) => {
                  const s = situacaoHistorico(m);
                  const isOpen = expandedMembers.has(m.id);
                  return (
                    <div key={m.id} style={{ borderBottom: i === historico.length - 1 ? "none" : "1px solid #EEF1F5" }}>
                      <div onClick={() => toggleMemberExpand(m.id)} className="ccib-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 14px", cursor: "pointer", fontSize: 12.5 }}>
                        <span style={{ flex: "1 1 160px", minWidth: 0, color: "#1B2438", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.nome || "(sem nome)"}</span>
                        <span style={{ width: 130, fontFamily: mono, fontSize: 10.5, color: s.color }}>{s.label}</span>
                        <span style={{ width: 86, textAlign: "right", fontFamily: mono, fontSize: 11, color: "#566175" }}>{m.valorNegocio || "—"}</span>
                        <span style={{ width: 82, textAlign: "right", fontFamily: mono, fontSize: 11, color: "#8992A6" }}>{m.dataNegocio ? formatDate(m.dataNegocio) : "—"}</span>
                        <span style={{ width: 34, textAlign: "center", fontFamily: mono, fontSize: 11, color: "#8992A6" }}>{m.estado || "—"}</span>
                      </div>
                      {isOpen && editorPara(m)}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {filtrados.length === 0 && (
        <div style={{ padding: "12px 0", textAlign: "center", color: "#B7BEC9" }}>
          <Building2 size={22} style={{ opacity: 0.6 }} />
        </div>
      )}
    </div>
  );
}
