import React from "react";
import { Plus, Trash2, ChevronDown, Briefcase } from "lucide-react";
import { TIPOS_SERVICO } from "../constants";
import { formatDate } from "../lib/format";
import { inputStyle, labelStyle } from "../styles";
import { Field, SectionTitle } from "../components/ui";

export default function ServicosTab({
  addService,
  expandedServices,
  memberNameSuggestions,
  patchService,
  removeService,
  serviceFilterTipo,
  services,
  setExpandedServices,
  setServiceFilterTipo,
}) {
  return (
      <div>
        <SectionTitle size={16}>Vendas</SectionTitle>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[{ key: "todos", label: "Todos" }, ...TIPOS_SERVICO.map((t) => ({ key: t, label: t }))].map((f) => {
              const active = serviceFilterTipo === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setServiceFilterTipo(f.key)}
                  className={`ccib-pill ${active ? "ccib-pill-active" : ""}`}
                  style={{
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
                </button>
              );
            })}
          </div>
          <button
            onClick={() => addService(serviceFilterTipo !== "todos" ? serviceFilterTipo : undefined)}
            className="ccib-btn ccib-btn-solid"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#0B2545", color: "#FFFFFF", border: "1px solid #0B2545",
              borderRadius: 7, padding: "8px 16px", fontWeight: 500, fontSize: 13, cursor: "pointer",
            }}
          >
            <Plus size={15} /> Nova venda
          </button>
        </div>

        {(() => {
          const filtered = (services || [])
            .filter((s) => serviceFilterTipo === "todos" || s.servico === serviceFilterTipo)
            .sort((a, b) => a.empresa.localeCompare(b.empresa));

          if (filtered.length === 0) {
            return (
              <div className="ccib-fade-in" style={{ padding: "48px 0", textAlign: "center", color: "#B7BEC9" }}>
                <Briefcase size={28} style={{ marginBottom: 10, opacity: 0.6 }} />
                <div style={{ fontSize: 13, color: "#8992A6" }}>Nenhuma venda encontrada com esse filtro.</div>
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
                <span style={{ width: 7, flexShrink: 0 }} />
                <span style={{ ...labelStyle, flex: "1 1 200px", marginBottom: 0 }}>Empresa</span>
                <span style={{ ...labelStyle, width: 190, marginBottom: 0 }}>Serviço</span>
                <span style={{ ...labelStyle, width: 80, marginBottom: 0 }}>Data</span>
                <span style={{ ...labelStyle, width: 90, textAlign: "right", marginBottom: 0 }}>Valor</span>
                <span style={{ width: 40, flexShrink: 0 }} />
              </div>

              {filtered.map((s, i) => {
                const isOpen = expandedServices.has(s.id);
                return (
                  <div key={s.id} style={{ borderBottom: i === filtered.length - 1 ? "none" : "1px solid #E3E6EC" }} className="ccib-fade-in">
                    <div
                      onClick={() => setExpandedServices((prev) => { const next = new Set(prev); next.has(s.id) ? next.delete(s.id) : next.add(s.id); return next; })}
                      className="ccib-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "13px 16px",
                        cursor: "pointer",
                        background: isOpen ? "#FAFBFC" : "transparent",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <span
                        title={s.status === "ativo" ? "Ativo" : "Inativo"}
                        style={{ width: 7, height: 7, borderRadius: "50%", background: s.status === "ativo" ? "#0E7C3A" : "#8992A6", flexShrink: 0 }}
                      />
                      <span style={{ flex: "1 1 200px", fontSize: 14, fontWeight: 500, color: "#1B2438", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.empresa || "(sem nome)"}
                      </span>
                      <span style={{ width: 190, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#566175", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.servico}
                      </span>
                      <span style={{ width: 80, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#8992A6" }}>
                        {s.data ? formatDate(s.data) : "—"}
                      </span>
                      <span style={{ width: 90, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#1B2438", textAlign: "right" }}>
                        {s.valor || ""}
                      </span>
                      <ChevronDown
                        size={15}
                        style={{ color: "#8992A6", flexShrink: 0, transition: "transform 0.15s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      />
                    </div>

                    {isOpen && (
                      <div className="ccib-fade-in" style={{ padding: "4px 16px 20px", background: "#FAFBFC" }}>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14, marginTop: 10 }}>
                          <Field label="Empresa">
                            <input
                              className="ccib-input"
                              style={inputStyle}
                              list={`servico-empresas-${s.id}`}
                              value={s.empresa}
                              placeholder="Nome da empresa"
                              onChange={(e) => patchService(s.id, { empresa: e.target.value })}
                            />
                            <datalist id={`servico-empresas-${s.id}`}>
                              {memberNameSuggestions.map((n) => <option key={n} value={n} />)}
                            </datalist>
                          </Field>
                          <Field label="Serviço">
                            <select className="ccib-input" style={inputStyle} value={s.servico} onChange={(e) => patchService(s.id, { servico: e.target.value })}>
                              {TIPOS_SERVICO.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </Field>
                          <Field label="Status">
                            <select className="ccib-input" style={inputStyle} value={s.status} onChange={(e) => patchService(s.id, { status: e.target.value })}>
                              <option value="ativo">Ativo</option>
                              <option value="inativo">Inativo</option>
                            </select>
                          </Field>
                        </div>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                          <Field label="Data da venda">
                            <input type="date" className="ccib-input" style={{ ...inputStyle, colorScheme: "light" }} value={s.data} onChange={(e) => patchService(s.id, { data: e.target.value })} />
                          </Field>
                          <Field label="Valor">
                            <input className="ccib-input" style={inputStyle} value={s.valor || ""} placeholder="Ex: R$ 2.500,00" onChange={(e) => patchService(s.id, { valor: e.target.value })} />
                          </Field>
                        </div>
                        <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                          <Field label="Notas">
                            <input className="ccib-input" style={inputStyle} value={s.notas} placeholder="Observações..." onChange={(e) => patchService(s.id, { notas: e.target.value })} />
                          </Field>
                          <button
                            onClick={() => removeService(s.id)}
                            className="ccib-icon-btn"
                            style={{ background: "transparent", border: "1px solid #E3E6EC", borderRadius: 6, color: "#8992A6", cursor: "pointer", padding: "8px 10px" }}
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
