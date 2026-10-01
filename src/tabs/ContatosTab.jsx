import React from "react";
import { Plus, Trash2, ChevronDown, Contact } from "lucide-react";
import { inputStyle, labelStyle, filterInputStyle } from "../styles";
import { Field, HubspotSyncBar } from "../components/ui";

export default function ContatosTab({
  addContact,
  contactSearch,
  contacts,
  expandedContacts,
  hubspotBusy,
  hubspotError,
  hubspotMessage,
  memberNameSuggestions,
  patchContact,
  pullContactsFromHubspot,
  removeContact,
  setContactSearch,
  toggleContactExpand,
}) {
  return (
      <div>
        <HubspotSyncBar
          busy={hubspotBusy}
          onPull={pullContactsFromHubspot}
          pullKey="pull-contacts"
          pullLabel="Puxar contatos do HubSpot"
          message={hubspotMessage}
          error={hubspotError}
        />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18, alignItems: "center", justifyContent: "space-between" }}>
          <input
            placeholder="Buscar por nome, empresa, setor ou cargo..."
            value={contactSearch}
            onChange={(e) => setContactSearch(e.target.value)}
            style={{ ...filterInputStyle, flex: "1 1 300px" }}
          />
          <button
            onClick={addContact}
            className="ccib-btn ccib-btn-solid"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#0B2545", color: "#FFFFFF", border: "1px solid #0B2545",
              borderRadius: 7, padding: "8px 16px", fontWeight: 500, fontSize: 13, cursor: "pointer",
            }}
          >
            <Plus size={15} /> Novo contato
          </button>
        </div>

        {(() => {
          const setorSuggestions = [...new Set((contacts || []).map((c) => c.setor).filter(Boolean))].sort();
          const q = contactSearch.trim().toLowerCase();
          const filtered = (contacts || []).filter((c) => {
            if (!q) return true;
            return c.nome.toLowerCase().includes(q) || (c.empresa || "").toLowerCase().includes(q) || (c.cargo || "").toLowerCase().includes(q) || (c.setor || "").toLowerCase().includes(q);
          }).sort((a, b) => a.nome.localeCompare(b.nome));

          if (filtered.length === 0) {
            return (
              <div className="ccib-fade-in" style={{ padding: "48px 0", textAlign: "center", color: "#B7BEC9" }}>
                <Contact size={28} style={{ marginBottom: 10, opacity: 0.6 }} />
                <div style={{ fontSize: 13, color: "#8992A6" }}>Nenhum contato encontrado. Clique em "Novo contato" ou puxe do HubSpot.</div>
              </div>
            );
          }

          return (
            <div style={{ border: "1px solid #E3E6EC", borderRadius: 10, overflow: "hidden" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 0.7fr 1.1fr 1.3fr 0.8fr 36px",
                  gap: 0,
                  padding: "9px 14px",
                  background: "#0B2545",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <span style={{ ...labelStyle, marginBottom: 0, color: "rgba(255,255,255,0.7)" }}>Nome</span>
                <span style={{ ...labelStyle, marginBottom: 0, color: "rgba(255,255,255,0.7)" }}>Empresa</span>
                <span style={{ ...labelStyle, marginBottom: 0, color: "rgba(255,255,255,0.7)" }}>Setor</span>
                <span style={{ ...labelStyle, marginBottom: 0, color: "rgba(255,255,255,0.7)" }}>Cargo</span>
                <span style={{ ...labelStyle, marginBottom: 0, color: "rgba(255,255,255,0.7)" }}>E-mail</span>
                <span style={{ ...labelStyle, marginBottom: 0, color: "rgba(255,255,255,0.7)" }}>Telefone</span>
                <span />
              </div>

              {filtered.map((c, i) => {
                const isOpen = expandedContacts.has(c.id);
                const stripe = i % 2 === 0 ? "#FFFFFF" : "#FAFBFC";
                return (
                  <div key={c.id} className="ccib-fade-in" style={{ borderBottom: i === filtered.length - 1 ? "none" : "1px solid #EEF0F3" }}>
                    <div
                      onClick={() => toggleContactExpand(c.id)}
                      className="ccib-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 0.7fr 1.1fr 1.3fr 0.8fr 36px",
                        gap: 0,
                        padding: "10px 14px",
                        cursor: "pointer",
                        background: isOpen ? "#F4F6F9" : stripe,
                        transition: "background-color 0.15s ease",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#1B2438", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                        {c.nome || "(sem nome)"}
                      </span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#566175", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                        {c.empresa || "—"}
                      </span>
                      <span style={{ paddingRight: 8, overflow: "hidden", whiteSpace: "nowrap" }}>
                        {c.setor ? (
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "#0E7C3A", background: "#0E7C3A14", borderRadius: 20, padding: "2px 9px" }}>
                            {c.setor}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: "#8992A6" }}>—</span>
                        )}
                      </span>
                      <span style={{ fontSize: 12, color: "#8992A6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                        {c.cargo || "—"}
                      </span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#0B2545", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                        {c.email || "—"}
                      </span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8992A6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                        {c.telefone || "—"}
                      </span>
                      <ChevronDown
                        size={14}
                        style={{ color: "#8992A6", transition: "transform 0.15s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      />
                    </div>

                    {isOpen && (
                      <div className="ccib-fade-in" style={{ padding: "8px 14px 18px", background: "#F4F6F9" }}>
                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
                          <Field label="Nome">
                            <input className="ccib-input" style={inputStyle} value={c.nome} placeholder="Nome completo" onChange={(e) => patchContact(c.id, { nome: e.target.value })} />
                          </Field>
                          <Field label="Empresa">
                            <input
                              className="ccib-input" style={inputStyle}
                              list={`contact-empresas-${c.id}`}
                              value={c.empresa}
                              placeholder="Empresa associada"
                              onChange={(e) => patchContact(c.id, { empresa: e.target.value })}
                            />
                            <datalist id={`contact-empresas-${c.id}`}>
                              {memberNameSuggestions.map((s) => <option key={s} value={s} />)}
                            </datalist>
                          </Field>
                          <Field label="Setor">
                            <input
                              className="ccib-input" style={inputStyle}
                              list={`contact-setores-${c.id}`}
                              value={c.setor || ""}
                              placeholder="Ex.: Saúde"
                              onChange={(e) => patchContact(c.id, { setor: e.target.value })}
                            />
                            <datalist id={`contact-setores-${c.id}`}>
                              {setorSuggestions.map((s) => <option key={s} value={s} />)}
                            </datalist>
                          </Field>
                          <Field label="Cargo">
                            <input className="ccib-input" style={inputStyle} value={c.cargo} placeholder="Cargo" onChange={(e) => patchContact(c.id, { cargo: e.target.value })} />
                          </Field>
                        </div>
                        <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
                          <Field label="E-mail">
                            <input className="ccib-input" style={inputStyle} value={c.email} placeholder="email@empresa.com" onChange={(e) => patchContact(c.id, { email: e.target.value })} />
                          </Field>
                          <Field label="Telefone">
                            <input className="ccib-input" style={inputStyle} value={c.telefone} placeholder="+91 00000 00000" onChange={(e) => patchContact(c.id, { telefone: e.target.value })} />
                          </Field>
                          <button
                            onClick={() => removeContact(c.id)}
                            className="ccib-icon-btn"
                            style={{ background: "transparent", border: "1px solid #E3E6EC", borderRadius: 6, color: "#8992A6", cursor: "pointer", padding: "8px 10px" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div style={{ padding: "8px 14px", background: "#FAFBFC", borderTop: "1px solid #E3E6EC", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8992A6" }}>
                {filtered.length} contato{filtered.length !== 1 ? "s" : ""}
              </div>
            </div>
          );
        })()}
      </div>
  );
}
