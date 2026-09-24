import React from "react";
import { Plus, Trash2, ChevronDown, RefreshCw } from "lucide-react";
import { RESPONSAVEIS, STATUS_MEETING } from "../constants";
import { inputStyle } from "../styles";
import { Field } from "../components/ui";

export default function ReunioesTab({
  addMeeting,
  calMonth,
  lastSyncedAt,
  meetings,
  patchMeeting,
  removeMeeting,
  selectedMeetingId,
  setCalMonth,
  setSelectedMeetingId,
  syncError,
  syncTeamsCalendar,
  syncingTeams,
}) {
  return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <button
            onClick={syncTeamsCalendar}
            disabled={syncingTeams}
            className="ccib-btn ccib-btn-outline"
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "transparent", color: "#0B2545", border: "1px solid #0B2545",
              borderRadius: 7, padding: "8px 16px", fontWeight: 500, fontSize: 13,
              cursor: syncingTeams ? "default" : "pointer",
              opacity: syncingTeams ? 0.6 : 1,
            }}
          >
            <RefreshCw size={14} className={syncingTeams ? "animate-spin" : ""} />
            {syncingTeams ? "Sincronizando…" : "Sincronizar novamente"}
          </button>
          <button
            onClick={() => addMeeting()}
            className="ccib-btn ccib-btn-solid"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#0B2545", color: "#FFFFFF", border: "1px solid #0B2545",
              borderRadius: 7, padding: "8px 16px", fontWeight: 500, fontSize: 13, cursor: "pointer",
            }}
          >
            <Plus size={15} /> Nova reunião
          </button>
          {lastSyncedAt && !syncingTeams && (
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8992A6" }}>
              Sincronizado às {lastSyncedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        {syncError && (
          <div style={{ background: "#FDF2F0", border: "1px solid #C1502E", color: "#C1502E", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
            {syncError}
          </div>
        )}

        {(() => {
          const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
          const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
          const { year, month } = calMonth;
          const firstDay = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const todayStr = new Date().toISOString().slice(0, 10);
          const cells = [];
          for (let i = 0; i < firstDay; i++) cells.push(null);
          for (let d = 1; d <= daysInMonth; d++) cells.push(d);
          while (cells.length % 7 !== 0) cells.push(null);

          const prevMonth = () => setCalMonth((p) => p.month === 0 ? { year: p.year - 1, month: 11 } : { year: p.year, month: p.month - 1 });
          const nextMonth = () => setCalMonth((p) => p.month === 11 ? { year: p.year + 1, month: 0 } : { year: p.year, month: p.month + 1 });
          const goToday = () => { const n = new Date(); setCalMonth({ year: n.getFullYear(), month: n.getMonth() }); };

          const selectedMeeting = selectedMeetingId ? meetings.find((m) => m.id === selectedMeetingId) : null;
          const statusInfo = selectedMeeting ? STATUS_MEETING[selectedMeeting.status] : null;

          return (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={prevMonth} className="ccib-icon-btn-neutral" style={{ background: "transparent", border: "1px solid #E3E6EC", borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#566175" }}>
                    <ChevronDown size={16} style={{ transform: "rotate(90deg)" }} />
                  </button>
                  <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 18, color: "#0B2545", minWidth: 180, textAlign: "center" }}>
                    {MONTHS[month]} {year}
                  </span>
                  <button onClick={nextMonth} className="ccib-icon-btn-neutral" style={{ background: "transparent", border: "1px solid #E3E6EC", borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#566175" }}>
                    <ChevronDown size={16} style={{ transform: "rotate(-90deg)" }} />
                  </button>
                </div>
                <button onClick={goToday} className="ccib-pill" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, padding: "5px 12px", borderRadius: 20, border: "1px solid #E3E6EC", background: "transparent", color: "#566175", cursor: "pointer" }}>
                  Hoje
                </button>
              </div>

              <div style={{ border: "1px solid #E3E6EC", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#FAFBFC", borderBottom: "1px solid #E3E6EC" }}>
                  {DAYS.map((d) => (
                    <div key={d} style={{ padding: "8px 0", textAlign: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8992A6" }}>
                      {d}
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                  {cells.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} style={{ minHeight: 80, background: "#FAFBFC", borderRight: (i + 1) % 7 !== 0 ? "1px solid #E3E6EC" : "none", borderBottom: "1px solid #E3E6EC" }} />;
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isToday = dateStr === todayStr;
                    const dayMeetings = meetings.filter((m) => m.data === dateStr);
                    return (
                      <div
                        key={dateStr}
                        style={{
                          minHeight: 80,
                          padding: "4px 5px",
                          borderRight: (i + 1) % 7 !== 0 ? "1px solid #E3E6EC" : "none",
                          borderBottom: "1px solid #E3E6EC",
                          background: isToday ? "#F0F4FF" : "#FFFFFF",
                        }}
                      >
                        <div style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 11,
                          fontWeight: isToday ? 700 : 400,
                          color: isToday ? "#0B2545" : "#566175",
                          marginBottom: 3,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: isToday ? "#0B2545" : "transparent",
                          ...(isToday ? { color: "#FFFFFF" } : {}),
                        }}>
                          {day}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          {dayMeetings.slice(0, 3).map((m) => {
                            const st = STATUS_MEETING[m.status];
                            return (
                              <div
                                key={m.id}
                                onClick={() => setSelectedMeetingId(selectedMeetingId === m.id ? null : m.id)}
                                className="ccib-btn"
                                style={{
                                  fontSize: 10,
                                  lineHeight: 1.3,
                                  padding: "2px 4px",
                                  borderRadius: 3,
                                  background: `${st.color}18`,
                                  color: st.color,
                                  cursor: "pointer",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontWeight: 500,
                                  borderLeft: `2px solid ${st.color}`,
                                }}
                              >
                                {m.horario ? m.horario.split("–")[0].split("-")[0].trim() + " " : ""}{m.nome}
                              </div>
                            );
                          })}
                          {dayMeetings.length > 3 && (
                            <div style={{ fontSize: 9, color: "#8992A6", fontFamily: "'IBM Plex Mono', monospace", paddingLeft: 4 }}>
                              +{dayMeetings.length - 3} mais
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedMeeting && (
                <div className="ccib-fade-in" style={{ marginTop: 20, border: "1px solid #E3E6EC", borderRadius: 10, padding: "20px", background: "#FAFBFC" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusInfo.color }} />
                      <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16, color: "#0B2545" }}>{selectedMeeting.nome || "(sem nome)"}</span>
                      {selectedMeeting.origem === "teams" && (
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, background: "#EEF1F5", borderRadius: 4, padding: "2px 6px", color: "#566175" }}>Teams</span>
                      )}
                    </div>
                    <button onClick={() => setSelectedMeetingId(null)} className="ccib-icon-btn-neutral" style={{ background: "transparent", border: "none", borderRadius: 5, color: "#8992A6", cursor: "pointer", padding: 4 }}>✕</button>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                    <Field label="Nome da reunião">
                      <input className="ccib-input" style={inputStyle} value={selectedMeeting.nome} onChange={(ev) => patchMeeting(selectedMeeting.id, { nome: ev.target.value })} />
                    </Field>
                    <Field label="Data">
                      <input type="date" className="ccib-input" style={{ ...inputStyle, colorScheme: "light" }} value={selectedMeeting.data} onChange={(ev) => patchMeeting(selectedMeeting.id, { data: ev.target.value })} />
                    </Field>
                    <Field label="Horário">
                      <input className="ccib-input" style={inputStyle} value={selectedMeeting.horario || ""} onChange={(ev) => patchMeeting(selectedMeeting.id, { horario: ev.target.value })} />
                    </Field>
                    <Field label="Status">
                      <select className="ccib-input" style={{ ...inputStyle, color: statusInfo.color, fontWeight: 600 }} value={selectedMeeting.status} onChange={(ev) => patchMeeting(selectedMeeting.id, { status: ev.target.value })}>
                        {Object.entries(STATUS_MEETING).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                    <Field label="Local / link">
                      <input className="ccib-input" style={inputStyle} value={selectedMeeting.local} onChange={(ev) => patchMeeting(selectedMeeting.id, { local: ev.target.value })} />
                    </Field>
                    <Field label="Participantes">
                      <input className="ccib-input" style={inputStyle} value={selectedMeeting.participantes} onChange={(ev) => patchMeeting(selectedMeeting.id, { participantes: ev.target.value })} />
                    </Field>
                    <Field label="Responsável">
                      <select className="ccib-input" style={inputStyle} value={selectedMeeting.responsavel} onChange={(ev) => patchMeeting(selectedMeeting.id, { responsavel: ev.target.value })}>
                        {RESPONSAVEIS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                    <Field label="Notas">
                      <input className="ccib-input" style={inputStyle} value={selectedMeeting.notas} onChange={(ev) => patchMeeting(selectedMeeting.id, { notas: ev.target.value })} />
                    </Field>
                    <button
                      onClick={() => { removeMeeting(selectedMeeting.id); setSelectedMeetingId(null); }}
                      className="ccib-icon-btn"
                      style={{ background: "transparent", border: "1px solid #E3E6EC", borderRadius: 6, color: "#8992A6", cursor: "pointer", padding: "8px 10px" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
  );
}
