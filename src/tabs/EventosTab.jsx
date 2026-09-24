import React from "react";
import { Plus, Trash2, CalendarDays, MapPin, ImagePlus } from "lucide-react";
import { TIPOS_EVENTO, STATUS_EVENTO } from "../constants";
import { formatDate, getDisplayImageUrl } from "../lib/format";
import { inputStyle, labelStyle } from "../styles";
import { Field, EventPhotoBox } from "../components/ui";

export default function EventosTab({
  addEvent,
  eventFilterStatus,
  events,
  expandedEvents,
  patchEvent,
  removeEvent,
  setEventFilterStatus,
  toggleEventExpand,
}) {
  return (
      <div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[{ key: "todos", label: "Todos" }, ...Object.entries(STATUS_EVENTO).map(([key, v]) => ({ key, label: v.label }))].map((f) => {
              const active = eventFilterStatus === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setEventFilterStatus(f.key)}
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
            onClick={() => addEvent()}
            className="ccib-btn ccib-btn-solid"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#0B2545", color: "#FFFFFF", border: "1px solid #0B2545",
              borderRadius: 7, padding: "8px 16px", fontWeight: 500, fontSize: 13, cursor: "pointer",
            }}
          >
            <Plus size={15} /> Novo evento
          </button>
        </div>

        {(() => {
          const filtered = events
            .filter((e) => eventFilterStatus === "todos" || e.status === eventFilterStatus)
            .sort((a, b) => (b.data || "0000").localeCompare(a.data || "0000"));

          if (filtered.length === 0) {
            return (
              <div className="ccib-fade-in" style={{ padding: "48px 0", textAlign: "center", color: "#B7BEC9" }}>
                <CalendarDays size={28} style={{ marginBottom: 10, opacity: 0.6 }} />
                <div style={{ fontSize: 13, color: "#8992A6" }}>Nenhum evento encontrado com esse filtro.</div>
              </div>
            );
          }

          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {filtered.map((e) => {
                const isOpen = expandedEvents.has(e.id);
                const imgUrl = getDisplayImageUrl(e.registro);
                const statusInfo = STATUS_EVENTO[e.status];
                return (
                  <div
                    key={e.id}
                    className="ccib-card ccib-fade-in"
                    style={{
                      border: "1px solid #E3E6EC",
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "#FFFFFF",
                      gridColumn: isOpen ? "1 / -1" : "auto",
                    }}
                  >
                    <div
                      onClick={() => toggleEventExpand(e.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <EventPhotoBox imgUrl={imgUrl} alt={e.nome} />

                      <div style={{ padding: "14px 16px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusInfo.color, flexShrink: 0 }} />
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: statusInfo.color, fontWeight: 600 }}>
                            {statusInfo.label}
                          </span>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#B7BEC9" }}>
                            · {e.tipo}
                          </span>
                        </div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16, color: "#1B2438", marginBottom: 6, lineHeight: 1.3 }}>
                          {e.nome || "(sem nome)"}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          {e.data && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#566175" }}>
                              <CalendarDays size={12} style={{ flexShrink: 0 }} />
                              {formatDate(e.data)}{e.horario ? ` · ${e.horario}` : ""}
                            </div>
                          )}
                          {e.local && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#566175" }}>
                              <MapPin size={12} style={{ flexShrink: 0 }} />
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.local}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ padding: "0 16px 20px", background: "#FAFBFC", borderTop: "1px solid #E3E6EC" }}>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16, marginBottom: 14 }}>
                          <Field label="Nome do evento">
                            <input className="ccib-input" style={inputStyle} value={e.nome} placeholder="Ex: Missão India Health 2026" onChange={(ev) => patchEvent(e.id, { nome: ev.target.value })} />
                          </Field>
                          <Field label="Data">
                            <input type="date" style={{ ...inputStyle, colorScheme: "light" }} value={e.data} onChange={(ev) => patchEvent(e.id, { data: ev.target.value })} />
                          </Field>
                          <Field label="Horário">
                            <input className="ccib-input" style={inputStyle} value={e.horario || ""} placeholder="Ex: 10:00 – 12:00" onChange={(ev) => patchEvent(e.id, { horario: ev.target.value })} />
                          </Field>
                          <Field label="Local">
                            <input className="ccib-input" style={inputStyle} value={e.local} placeholder="Cidade / estado" onChange={(ev) => patchEvent(e.id, { local: ev.target.value })} />
                          </Field>
                        </div>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                          <Field label="Tipo">
                            <select className="ccib-input" style={inputStyle} value={e.tipo} onChange={(ev) => patchEvent(e.id, { tipo: ev.target.value })}>
                              {TIPOS_EVENTO.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </Field>
                          <Field label="Status">
                            <select
                              style={{ ...inputStyle, color: statusInfo.color, fontWeight: 600 }}
                              value={e.status}
                              onChange={(ev) => patchEvent(e.id, { status: ev.target.value })}
                            >
                              {Object.entries(STATUS_EVENTO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                          </Field>
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <Field label="Descrição">
                            <input className="ccib-input" style={inputStyle} value={e.descricao} placeholder="Resumo do evento..." onChange={(ev) => patchEvent(e.id, { descricao: ev.target.value })} />
                          </Field>
                        </div>
                        <div
                          style={{
                            border: "1px dashed #C7CCD6",
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 14,
                            background: "#FFFFFF",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            <ImagePlus size={14} color="#566175" />
                            <span style={{ ...labelStyle, marginBottom: 0 }}>Foto do evento</span>
                          </div>
                          <input
                            className="ccib-input" style={inputStyle}
                            value={e.registro || ""}
                            placeholder="Cole aqui o link da foto (Google Drive, Imgur) ou um resumo do evento"
                            onChange={(ev) => patchEvent(e.id, { registro: ev.target.value })}
                          />
                          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#B7BEC9", marginTop: 6 }}>
                            No Drive, deixe o compartilhamento como "Qualquer pessoa com o link pode visualizar" para a foto aparecer aqui.
                          </div>
                        </div>
                        <button
                          onClick={() => removeEvent(e.id)}
                          className="ccib-icon-btn"
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: "transparent", border: "1px solid #E3E6EC", borderRadius: 6, color: "#8992A6", cursor: "pointer", fontSize: 12, padding: "6px 10px",
                          }}
                        >
                          <Trash2 size={13} /> Remover evento
                        </button>
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
