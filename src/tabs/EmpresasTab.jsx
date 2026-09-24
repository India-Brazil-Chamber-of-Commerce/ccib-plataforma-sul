import React from "react";
import { Plus, Trash2, Building2, ChevronDown } from "lucide-react";
import { ESTADOS, RESPONSAVEIS, STATUS_MEMBER, PERIODICIDADES } from "../constants";
import { inputStyle, labelStyle, filterInputStyle } from "../styles";
import { Field, HubspotSyncBar } from "../components/ui";

export default function EmpresasTab({
  addMember,
  expandedMembers,
  hubspotBusy,
  hubspotError,
  hubspotMessage,
  memberFilterEstado,
  memberFilterStatus,
  memberSearch,
  members,
  modalidadeSuggestions,
  patchMember,
  pullDealsFromHubspot,
  removeMember,
  setMemberFilterEstado,
  setMemberFilterStatus,
  setMemberSearch,
  tipoVinculoSuggestions,
  toggleMemberExpand,
}) {
  return (
      <div>
        <HubspotSyncBar
          busy={hubspotBusy}
          onPull={pullDealsFromHubspot}
          pullKey="pull-deals"
          pullLabel="Puxar negócios do HubSpot"
          message={hubspotMessage}
          error={hubspotError}
        />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <input
            placeholder="Buscar por nome ou modalidade..."
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            style={{ ...filterInputStyle, flex: "1 1 220px" }}
          />
          <select value={memberFilterEstado} onChange={(e) => setMemberFilterEstado(e.target.value)} style={{ ...filterInputStyle, width: "auto" }}>
            <option value="todos">Todos os estados</option>
            {ESTADOS.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
          <button
            onClick={() => addMember()}
            className="ccib-btn ccib-btn-solid"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#0B2545", color: "#FFFFFF", border: "1px solid #0B2545",
              borderRadius: 7, padding: "8px 16px", fontWeight: 500, fontSize: 13, cursor: "pointer",
            }}
          >
            <Plus size={15} /> Nova empresa
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { key: "todos", label: "Todas", count: members.length },
            ...Object.entries(STATUS_MEMBER).map(([key, v]) => ({ key, label: v.label, count: members.filter((m) => m.status === key).length })),
          ].map((f) => {
            const active = memberFilterStatus === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setMemberFilterStatus(f.key)}
                className={`ccib-pill ${active ? "ccib-pill-active" : ""}`}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  letterSpacing: "0.03em",
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: active ? "1px solid #0B2545" : "1px solid #E3E6EC",
                  background: active ? "#0B2545" : "transparent",
                  color: active ? "#FFFFFF" : "#566175",
                  cursor: "pointer",
                }}
              >
                {f.label}
                <span
                  style={{
                    fontSize: 10,
                    padding: "1px 6px",
                    borderRadius: 10,
                    background: active ? "rgba(255,255,255,0.2)" : "#EEF1F5",
                    color: active ? "#FFFFFF" : "#8992A6",
                  }}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        {(() => {
          const filtered = members
            .filter((m) => memberFilterEstado === "todos" || m.estado === memberFilterEstado)
            .filter((m) => memberFilterStatus === "todos" || m.status === memberFilterStatus)
            .filter((m) => {
              const q = memberSearch.trim().toLowerCase();
              if (!q) return true;
              return m.nome.toLowerCase().includes(q) || m.modalidade.toLowerCase().includes(q);
            })
            .sort((a, b) => a.nome.localeCompare(b.nome));

          if (filtered.length === 0) {
            return (
              <div className="ccib-fade-in" style={{ padding: "48px 0", textAlign: "center", color: "#B7BEC9" }}>
                <Building2 size={28} style={{ marginBottom: 10, opacity: 0.6 }} />
                <div style={{ fontSize: 13, color: "#8992A6" }}>Nenhuma empresa encontrada com esses filtros.</div>
              </div>
            );
          }

          return (
            <div style={{ border: "1px solid #E3E6EC", borderRadius: 10, overflow: "hidden" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  background: "#FAFBFC",
                  borderBottom: "1px solid #E3E6EC",
                }}
              >
                <span style={{ width: 30, flexShrink: 0 }} />
                <span style={{ ...labelStyle, flex: "1 1 200px", marginBottom: 0 }}>Empresa</span>
                <span style={{ ...labelStyle, width: 130, marginBottom: 0 }}>Modalidade</span>
                <span style={{ ...labelStyle, width: 40, textAlign: "center", marginBottom: 0 }}>UF</span>
                <span style={{ ...labelStyle, width: 90, textAlign: "right", marginBottom: 0 }}>Valor</span>
                <span style={{ width: 26, flexShrink: 0 }} />
                <span style={{ width: 20, flexShrink: 0 }} />
              </div>

              {filtered.map((m, i) => {
                const isOpen = expandedMembers.has(m.id);
                const statusInfo = STATUS_MEMBER[m.status];
                return (
                  <div key={m.id} style={{ borderBottom: i === filtered.length - 1 ? "none" : "1px solid #E3E6EC" }} className="ccib-fade-in">
                    <div
                      onClick={() => toggleMemberExpand(m.id)}
                      className="ccib-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "11px 16px",
                        cursor: "pointer",
                        background: isOpen ? "#FAFBFC" : "transparent",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <span
                        title={statusInfo.label}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          background: `${statusInfo.color}1A`,
                          color: statusInfo.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "'Fraunces', serif",
                          fontWeight: 600,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        {(m.nome || "?").trim().charAt(0).toUpperCase()}
                      </span>
                      <span style={{ flex: "1 1 200px", minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "#1B2438", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {m.nome || "(sem nome)"}
                        </div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: statusInfo.color, marginTop: 1 }}>
                          {statusInfo.label}
                        </div>
                      </span>
                      <span style={{ width: 130 }}>
                        {m.modalidade ? (
                          <span
                            style={{
                              display: "inline-block",
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: 10.5,
                              color: "#566175",
                              background: "#EEF1F5",
                              border: "1px solid #E3E6EC",
                              borderRadius: 5,
                              padding: "2px 8px",
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {m.modalidade}
                          </span>
                        ) : (
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#C7CCD6" }}>—</span>
                        )}
                      </span>
                      <span style={{ width: 40, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#8992A6", textAlign: "center" }}>
                        {m.estado || "—"}
                      </span>
                      <span style={{ width: 90, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#1B2438", textAlign: "right" }}>
                        {m.valor || ""}
                      </span>
                      <span
                        title={(RESPONSAVEIS.find((r) => r.id === m.responsavel) || {}).label}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "#0B2545",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 9,
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {m.responsavel === "bianca" ? "B" : m.responsavel === "gustavo" ? "G" : "A"}
                      </span>
                      <ChevronDown
                        size={15}
                        style={{ color: "#8992A6", flexShrink: 0, transition: "transform 0.15s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      />
                    </div>

                    {isOpen && (
                      <div style={{ padding: "4px 16px 20px", background: "#FAFBFC" }}>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                          <Field label="Nome / empresa">
                            <input className="ccib-input" style={inputStyle} value={m.nome} placeholder="Nome do associado" onChange={(e) => patchMember(m.id, { nome: e.target.value })} />
                          </Field>
                          <Field label="Modalidade">
                            <input
                              className="ccib-input" style={inputStyle}
                              list={`modalidades-${m.id}`}
                              value={m.modalidade}
                              placeholder="Ex: Ouro, Corporate..."
                              onChange={(e) => patchMember(m.id, { modalidade: e.target.value })}
                            />
                            <datalist id={`modalidades-${m.id}`}>
                              {modalidadeSuggestions.map((s) => <option key={s} value={s} />)}
                            </datalist>
                          </Field>
                          <Field label="Estado">
                            <select className="ccib-input" style={inputStyle} value={m.estado} onChange={(e) => patchMember(m.id, { estado: e.target.value })}>
                              <option value="">A definir</option>
                              {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                            </select>
                          </Field>
                          <Field label="Status">
                            <select
                              style={{ ...inputStyle, color: statusInfo.color, fontWeight: 600 }}
                              value={m.status}
                              onChange={(e) => patchMember(m.id, { status: e.target.value })}
                            >
                              {Object.entries(STATUS_MEMBER).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                          </Field>
                        </div>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                          <Field label="Tipo de vínculo">
                            <input
                              className="ccib-input" style={inputStyle}
                              list={`tipos-${m.id}`}
                              value={m.tipoVinculo || ""}
                              placeholder="Ex: Associação, Patrocínio..."
                              onChange={(e) => patchMember(m.id, { tipoVinculo: e.target.value })}
                            />
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
                            <input className="ccib-input" style={inputStyle} value={m.contato} placeholder="Nome, telefone ou e-mail" onChange={(e) => patchMember(m.id, { contato: e.target.value })} />
                          </Field>
                          <Field label="Data de adesão">
                            <input type="date" style={{ ...inputStyle, colorScheme: "light" }} value={m.dataAdesao} onChange={(e) => patchMember(m.id, { dataAdesao: e.target.value })} />
                          </Field>
                        </div>
                        <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                          <Field label="Notas">
                            <input className="ccib-input" style={inputStyle} value={m.notas} placeholder="Observações..." onChange={(e) => patchMember(m.id, { notas: e.target.value })} />
                          </Field>
                          <button
                            onClick={() => removeMember(m.id)}
                            title="Remover empresa"
                            style={{ background: "transparent", border: "none", color: "#8992A6", cursor: "pointer", padding: "8px 4px" }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
  );
}
