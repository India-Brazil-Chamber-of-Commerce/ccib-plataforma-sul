import React from "react";
import { STATUS_EVENTO, STATUS_MEETING } from "../constants";
import { formatDate, getDisplayImageUrl } from "../lib/format";
import { SectionTitle } from "../components/ui";

export default function VisaoGeralTab({
  ativos,
  byEstado,
  members,
  pastEvents,
  prospeccao,
  upcomingEvents,
  upcomingMeetings,
}) {
  return (
      <div>
        <div
          style={{
            border: "1px solid #E3E6EC",
            borderRadius: 12,
            padding: "24px 28px",
            marginBottom: 32,
            display: "flex",
            gap: 0,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Empresas cadastradas", value: members.length },
            { label: "Ativos", value: ativos, accent: "#0E7C3A" },
            { label: "Em prospecção", value: prospeccao, accent: "#B8752E" },
          ].map((s, i) => (
            <div
              key={s.label}
              style={{
                flex: "1 1 140px",
                padding: "0 22px",
                borderLeft: i === 0 ? "none" : "1px solid #E3E6EC",
              }}
            >
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 600,
                  fontSize: 30,
                  color: "#0B2545",
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10.5,
                  color: "#8992A6",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {s.accent && (
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.accent, display: "inline-block", flexShrink: 0 }} />
                )}                    {s.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40 }}>
          <div>
            <SectionTitle>Empresas por estado</SectionTitle>

            {byEstado.map((e) => (
              <div key={e.uf} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ width: 40, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#8992A6" }}>
                  {e.uf}
                </span>
                <div style={{ flex: 1, background: "#F6F7F9", borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div
                    style={{
                      width: members.length ? `${(e.count / members.length) * 100}%` : "0%",
                      background: "#0B2545",
                      height: "100%",
                    }}
                  />
                </div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#1B2438", width: 20, textAlign: "right" }}>
                  {e.count}
                </span>
              </div>
            ))}
          </div>

          <div>
            <SectionTitle>Próximos eventos</SectionTitle>
            {upcomingEvents.length === 0 && (
              <div style={{ color: "#8992A6", fontSize: 13 }}>Nenhum evento futuro cadastrado.</div>
            )}
            {upcomingEvents.map((e) => (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  padding: "10px 0",
                  borderBottom: "1px solid #E3E6EC",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, marginBottom: 2 }}>{e.nome || "(sem nome)"}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8992A6" }}>
                    {e.local}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#B8752E" }}>
                    {formatDate(e.data) || "sem data"}{e.horario ? ` · ${e.horario}` : ""}
                  </div>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 9,
                      textTransform: "uppercase",
                      color: STATUS_EVENTO[e.status].color,
                    }}
                  >
                    {STATUS_EVENTO[e.status].label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <SectionTitle>Próximas reuniões</SectionTitle>
            {upcomingMeetings.length === 0 && (
              <div style={{ color: "#8992A6", fontSize: 13 }}>Nenhuma reunião futura cadastrada.</div>
            )}
            {upcomingMeetings.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  padding: "10px 0",
                  borderBottom: "1px solid #E3E6EC",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, marginBottom: 2 }}>{m.nome || "(sem nome)"}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8992A6" }}>
                    {m.local}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#B8752E" }}>
                    {formatDate(m.data) || "sem data"}{m.horario ? ` · ${m.horario}` : ""}
                  </div>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 9,
                      textTransform: "uppercase",
                      color: STATUS_MEETING[m.status].color,
                    }}
                  >
                    {STATUS_MEETING[m.status].label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <SectionTitle>Eventos realizados</SectionTitle>
            {pastEvents.length === 0 && (
              <div style={{ color: "#8992A6", fontSize: 13 }}>Nenhum evento realizado ainda.</div>
            )}
            {pastEvents.map((e) => {
              const isUrl = e.registro && /^https?:\/\//i.test(e.registro.trim());
              const imgUrl = getDisplayImageUrl(e.registro);
              return (
                <div
                  key={e.id}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #E3E6EC",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 13 }}>{e.nome || "(sem nome)"}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8992A6" }}>
                      {formatDate(e.data)}
                    </span>
                  </div>
                  {imgUrl && (
                    <img
                      src={imgUrl}
                      alt={e.nome || "Foto do evento"}
                      style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8, marginTop: 8, display: "block" }}
                      onError={(ev) => { ev.target.style.display = "none"; }}
                    />
                  )}
                  {!imgUrl && e.registro && (
                    isUrl ? (
                      <a
                        href={e.registro.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#0B2545", textDecoration: "underline" }}
                      >
                        {e.registro.trim()}
                      </a>
                    ) : (
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8992A6" }}>
                        {e.registro}
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
  );
}
