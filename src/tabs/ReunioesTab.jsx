import React from "react";
import { Plus, Trash2, RefreshCw, ChevronLeft, ChevronRight, Clock, MapPin, Video, Users } from "lucide-react";
import { RESPONSAVEIS, STATUS_MEETING } from "../constants";
import { inputStyle } from "../styles";
import { Field } from "../components/ui";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

// Datas no formato "AAAA-MM-DD", sempre no fuso local (evita o dia "pular" por causa do UTC)
function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// Segunda-feira da semana de uma data
function mondayOf(d) {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return addDays(r, -((r.getDay() + 6) % 7));
}

function shortDate(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Chave de ordenação pelo início do horário ("Dia inteiro" e sem horário vêm primeiro)
function startKey(horario) {
  const m = (horario || "").match(/(\d{1,2}):(\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : -1;
}

function weekLabel(offset) {
  if (offset === 0) return "Esta semana";
  if (offset === 1) return "Próxima semana";
  if (offset === -1) return "Semana passada";
  return offset > 0 ? `Daqui a ${offset} semanas` : `Há ${-offset} semanas`;
}

function isOnline(local) {
  return /teams|zoom|meet|online|http/i.test(local || "");
}

function MeetingEditor({ meeting, patchMeeting, removeMeeting, onClose }) {
  const statusInfo = STATUS_MEETING[meeting.status] || STATUS_MEETING.agendada;
  return (
    <div className="ccib-fade-in" style={{ marginTop: 10, border: "1px solid #E3E6EC", borderRadius: 10, padding: 18, background: "#FAFBFC" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8992A6" }}>
          Editar reunião
        </span>
        <button onClick={onClose} className="ccib-icon-btn-neutral" style={{ background: "transparent", border: "none", borderRadius: 5, color: "#8992A6", cursor: "pointer", padding: 4 }}>✕</button>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
        <Field label="Nome da reunião">
          <input className="ccib-input" style={inputStyle} value={meeting.nome} onChange={(ev) => patchMeeting(meeting.id, { nome: ev.target.value })} />
        </Field>
        <Field label="Data">
          <input type="date" className="ccib-input" style={{ ...inputStyle, colorScheme: "light" }} value={meeting.data} onChange={(ev) => patchMeeting(meeting.id, { data: ev.target.value })} />
        </Field>
        <Field label="Horário">
          <input className="ccib-input" style={inputStyle} value={meeting.horario || ""} onChange={(ev) => patchMeeting(meeting.id, { horario: ev.target.value })} />
        </Field>
        <Field label="Status">
          <select className="ccib-input" style={{ ...inputStyle, color: statusInfo.color, fontWeight: 600 }} value={meeting.status} onChange={(ev) => patchMeeting(meeting.id, { status: ev.target.value })}>
            {Object.entries(STATUS_MEETING).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
        <Field label="Local / link">
          <input className="ccib-input" style={inputStyle} value={meeting.local} onChange={(ev) => patchMeeting(meeting.id, { local: ev.target.value })} />
        </Field>
        <Field label="Participantes">
          <input className="ccib-input" style={inputStyle} value={meeting.participantes} onChange={(ev) => patchMeeting(meeting.id, { participantes: ev.target.value })} />
        </Field>
        <Field label="Responsável">
          <select className="ccib-input" style={inputStyle} value={meeting.responsavel} onChange={(ev) => patchMeeting(meeting.id, { responsavel: ev.target.value })}>
            {RESPONSAVEIS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
        <Field label="Notas">
          <input className="ccib-input" style={inputStyle} value={meeting.notas} onChange={(ev) => patchMeeting(meeting.id, { notas: ev.target.value })} />
        </Field>
        <button
          onClick={() => { removeMeeting(meeting.id); onClose(); }}
          title="Excluir reunião"
          className="ccib-icon-btn"
          style={{ background: "transparent", border: "1px solid #E3E6EC", borderRadius: 6, color: "#8992A6", cursor: "pointer", padding: "8px 10px" }}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function MeetingCard({ meeting, selected, onSelect }) {
  const resp = RESPONSAVEIS.find((r) => r.id === meeting.responsavel);
  const accent = resp ? resp.accent : "#8992A6";
  const st = STATUS_MEETING[meeting.status] || STATUS_MEETING.agendada;
  const cancelada = meeting.status === "cancelada";
  const [inicio, fim] = (meeting.horario || "").split(/\s*[–-]\s*/);
  const online = isOnline(meeting.local);
  return (
    <div
      onClick={onSelect}
      className="ccib-card"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 14,
        alignItems: "stretch",
        background: "#FFFFFF",
        border: `1px solid ${selected ? "#0B2545" : "#E3E6EC"}`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 10,
        padding: "12px 14px",
        cursor: "pointer",
        opacity: cancelada ? 0.55 : 1,
      }}
    >
      <div style={{ minWidth: 58, display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid #EEF1F5", paddingRight: 12 }}>
        {startKey(meeting.horario) >= 0 ? (
          <>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, fontWeight: 600, color: "#0B2545" }}>{inicio}</span>
            {fim && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8992A6" }}>até {fim}</span>}
          </>
        ) : (
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#566175" }}>{meeting.horario || "Sem horário"}</span>
        )}
      </div>
      <div style={{ flex: "1 1 180px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: "#0B2545", textDecoration: cancelada ? "line-through" : "none" }}>
            {meeting.nome || "(sem nome)"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "#566175" }}>
          {meeting.local && (
            <span style={{ display: "flex", alignItems: "center", gap: 5, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {online ? <Video size={13} /> : <MapPin size={13} />} {meeting.local}
            </span>
          )}
          {meeting.participantes && (
            <span title={meeting.participantes} style={{ display: "flex", alignItems: "center", gap: 5, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <Users size={13} /> {meeting.participantes}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", gap: 6, marginLeft: "auto" }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: st.color, background: `${st.color}14`, borderRadius: 20, padding: "3px 9px", whiteSpace: "nowrap" }}>
          {st.label}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, textTransform: "uppercase", color: accent, whiteSpace: "nowrap" }}>
          {resp ? resp.label : ""}
        </span>
      </div>
    </div>
  );
}

export default function ReunioesTab({
  addMeeting,
  lastSyncedAt,
  meetingWeeks,
  meetings,
  patchMeeting,
  removeMeeting,
  selectedMeetingId,
  setMeetingWeeks,
  setSelectedMeetingId,
  syncError,
  syncTeamsCalendar,
  syncingTeams,
}) {
  const { offset, count } = meetingWeeks;
  const today = new Date();
  const todayStr = toDateStr(today);
  const firstMonday = addDays(mondayOf(today), offset * 7);

  const byDate = new Map();
  meetings.forEach((m) => {
    if (!m.data) return;
    if (!byDate.has(m.data)) byDate.set(m.data, []);
    byDate.get(m.data).push(m);
  });
  byDate.forEach((list) => list.sort((a, b) => startKey(a.horario) - startKey(b.horario)));
  const semData = meetings.filter((m) => !m.data);

  const weeks = Array.from({ length: count }, (_, w) => {
    const monday = addDays(firstMonday, w * 7);
    const days = Array.from({ length: 7 }, (_, d) => addDays(monday, d));
    const total = days.reduce((n, d) => n + (byDate.get(toDateStr(d)) || []).length, 0);
    return { offset: offset + w, monday, days, total };
  });

  const lastSunday = addDays(firstMonday, count * 7 - 1);
  const futureAfter = meetings.filter((m) => m.data && m.data > toDateStr(lastSunday)).length;

  const navBtn = {
    display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "1px solid #E3E6EC",
    borderRadius: 7, padding: "6px 12px", cursor: "pointer", color: "#566175", fontSize: 12.5,
  };

  const toggle = (id) => setSelectedMeetingId(selectedMeetingId === id ? null : id);

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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setMeetingWeeks({ offset: offset - 1, count })} className="ccib-icon-btn-neutral" style={navBtn}>
            <ChevronLeft size={15} /> Anterior
          </button>
          <button onClick={() => setMeetingWeeks({ offset: 0, count: 2 })} className="ccib-pill" style={{ ...navBtn, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, borderRadius: 20 }}>
            Hoje
          </button>
          <button onClick={() => setMeetingWeeks({ offset: offset + 1, count })} className="ccib-icon-btn-neutral" style={navBtn}>
            Próxima <ChevronRight size={15} />
          </button>
        </div>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8992A6" }}>
          {shortDate(firstMonday)} a {shortDate(lastSunday)}
        </span>
      </div>

      {weeks.map((week) => (
        <div key={toDateStr(week.monday)} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #0B2545" }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 19, color: "#0B2545", margin: 0 }}>
              {weekLabel(week.offset)}
            </h3>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#566175" }}>
              {shortDate(week.days[0])} a {shortDate(week.days[6])}
            </span>
            <span style={{ marginLeft: "auto", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#0B2545", background: "#EEF1F5", borderRadius: 20, padding: "3px 10px" }}>
              {week.total} {week.total === 1 ? "reunião" : "reuniões"}
            </span>
          </div>

          {week.days.map((day) => {
            const dateStr = toDateStr(day);
            const list = byDate.get(dateStr) || [];
            const weekend = day.getDay() === 0 || day.getDay() === 6;
            if (weekend && list.length === 0) return null;
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr;
            return (
              <div key={dateStr} style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: "1px solid #EEF1F5", opacity: isPast ? 0.6 : 1 }}>
                <div style={{
                  width: 64, flexShrink: 0, textAlign: "center", borderRadius: 10, padding: "8px 0", alignSelf: "flex-start",
                  background: isToday ? "#0B2545" : "transparent", color: isToday ? "#FFFFFF" : "#0B2545",
                }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.8 }}>
                    {WEEKDAYS[day.getDay()].slice(0, 3)}
                  </div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 24, lineHeight: 1.1 }}>{day.getDate()}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, opacity: 0.8 }}>{isToday ? "hoje" : MONTHS_SHORT[day.getMonth()]}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                  {list.length === 0 && (
                    <span style={{ fontSize: 12.5, color: "#A3ABBB", fontStyle: "italic" }}>Sem reuniões</span>
                  )}
                  {list.map((m) => (
                    <div key={m.id}>
                      <MeetingCard meeting={m} selected={selectedMeetingId === m.id} onSelect={() => toggle(m.id)} />
                      {selectedMeetingId === m.id && (
                        <MeetingEditor meeting={m} patchMeeting={patchMeeting} removeMeeting={removeMeeting} onClose={() => setSelectedMeetingId(null)} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <button onClick={() => setMeetingWeeks({ offset, count: count + 2 })} className="ccib-btn ccib-btn-outline" style={{ ...navBtn, padding: "9px 18px", color: "#0B2545", borderColor: "#0B2545", fontWeight: 500 }}>
          <Clock size={14} /> Mostrar mais semanas{futureAfter > 0 ? ` (${futureAfter} ${futureAfter === 1 ? "reunião" : "reuniões"} depois de ${shortDate(lastSunday)})` : ""}
        </button>
      </div>

      {semData.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16, color: "#0B2545", margin: "0 0 10px" }}>Sem data definida</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {semData.map((m) => (
              <div key={m.id}>
                <MeetingCard meeting={m} selected={selectedMeetingId === m.id} onSelect={() => toggle(m.id)} />
                {selectedMeetingId === m.id && (
                  <MeetingEditor meeting={m} patchMeeting={patchMeeting} removeMeeting={removeMeeting} onClose={() => setSelectedMeetingId(null)} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
