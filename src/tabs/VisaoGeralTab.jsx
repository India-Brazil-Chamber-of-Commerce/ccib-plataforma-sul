import React from "react";
import { STATUS_EVENTO, STATUS_MEETING } from "../constants";
import { formatDate, getDisplayImageUrl } from "../lib/format";
import { SectionTitle } from "../components/ui";
import mapaRegiaoSul from "../assets/mapa-regiao-sul.webp";

const MAPA_UFS = [
  { uf: "PR", nome: "Paraná", cor: "#E8964F" },
  { uf: "SC", nome: "Santa Catarina", cor: "#6F8F68" },
  { uf: "RS", nome: "Rio Grande do Sul", cor: "#5E7FA6" },
];

function MapaAssociados({ members }) {
  const ativos = members.filter((m) => m.status === "ativo");
  const porUf = Object.fromEntries(MAPA_UFS.map((e) => [e.uf, ativos.filter((m) => m.estado === e.uf).length]));
  const semUf = ativos.filter((m) => !MAPA_UFS.some((e) => e.uf === m.estado)).length;
  return (
    <div style={{ border: "1px solid #E3E6EC", borderRadius: 12, padding: "24px 28px", marginBottom: 32, display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ width: 260, maxWidth: "100%", flexShrink: 0, margin: "0 auto" }}>
        <img src={mapaRegiaoSul} alt="Mapa da Região Sul: Paraná, Santa Catarina e Rio Grande do Sul" style={{ width: "100%", display: "block" }} />
      </div>
      <div style={{ flex: "1 1 240px" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8992A6", marginBottom: 6 }}>
          Associados ativos na Região Sul
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 18 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 56, color: "#0E7C3A", lineHeight: 1 }}>{ativos.length}</span>
          <span style={{ fontSize: 14, color: "#566175" }}>associado{ativos.length === 1 ? "" : "s"} ativo{ativos.length === 1 ? "" : "s"}</span>
        </div>
        {MAPA_UFS.map((e) => (
          <div key={e.uf} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #EEF1F5" }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: e.cor, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: "#1B2438" }}>{e.nome}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#0B2545", fontWeight: 600 }}>{porUf[e.uf]}</span>
          </div>
        ))}
        {semUf > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "#D6DAE2", flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: "#8992A6" }}>Sem estado informado ou outro estado</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#8992A6", fontWeight: 600 }}>{semUf}</span>
          </div>
        )}
      </div>
    </div>
  );
}

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

        <MapaAssociados members={members} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40 }}>
          <div>
            <SectionTitle>Empresas por estado</SectionTitle>

            <div style={{ fontSize: 12, color: "#8992A6", marginTop: -8, marginBottom: 14 }}>Associados ativos</div>
            {byEstado.filter((e) => e.uf !== "Outro" || e.count > 0).map((e) => (
              <div key={e.uf} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 40, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#8992A6" }}>
                    {e.uf}
                  </span>
                  <div style={{ flex: 1, background: "#F6F7F9", borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <div
                      style={{
                        width: ativos ? `${(e.count / ativos) * 100}%` : "0%",
                        background: "#0B2545",
                        height: "100%",
                      }}
                    />
                  </div>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#1B2438", width: 20, textAlign: "right" }}>
                    {e.count}
                  </span>
                </div>
                {e.prospects > 0 && (
                  <div style={{ marginLeft: 50, marginTop: 2, fontSize: 11, color: "#8992A6" }}>
                    + {e.prospects} em prospecção
                  </div>
                )}
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
