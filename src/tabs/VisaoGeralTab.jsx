import React from "react";
import { STATUS_EVENTO, STATUS_MEETING } from "../constants";
import { formatDate } from "../lib/format";
import { ChakraIcon } from "../components/ui";
import mapaRegiaoSul from "../assets/mapa-regiao-sul.webp";
import { ATUALIZACOES_REGIONAL_SUL, MISSAO_INDIA_HEALTH } from "../data/seeds";

const MAPA_UFS = [
  { uf: "PR", nome: "Paraná", cor: "#E8964F" },
  { uf: "SC", nome: "Santa Catarina", cor: "#6F8F68" },
  { uf: "RS", nome: "Rio Grande do Sul", cor: "#5E7FA6" },
];

const mono = "'IBM Plex Mono', monospace";
const serif = "'Fraunces', serif";

// Cartão com leve elevação (sombra suave em camadas)
const card = {
  background: "#FFFFFF",
  border: "1px solid #E6E9EF",
  borderRadius: 16,
  boxShadow: "0 1px 2px rgba(11,37,69,0.05), 0 10px 28px -6px rgba(11,37,69,0.12)",
  padding: "24px 26px",
};

function CardTitle({ children, kicker, accent = "#0E7C3A" }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: `${accent}14`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ChakraIcon size={20} color={accent} />
        </span>
        <div>
          <h2 style={{ fontFamily: serif, fontWeight: 600, fontSize: 21, margin: 0, color: "#0B2545", lineHeight: 1.15 }}>{children}</h2>
          {kicker && (
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8992A6", marginTop: 3 }}>{kicker}</div>
          )}
        </div>
      </div>
      <div style={{ height: 3, width: 44, borderRadius: 2, marginTop: 12, background: "linear-gradient(to right, #FF9933, #0E7C3A)" }} />
    </div>
  );
}

function AtualizacoesRegionalSul() {
  return (
    <div style={{ ...card, marginBottom: 28, background: "linear-gradient(135deg, #FFFFFF 0%, #FBF7F1 100%)" }}>
      <CardTitle kicker="Destaques recentes" accent="#B8752E">Atualizações Regional Sul</CardTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {ATUALIZACOES_REGIONAL_SUL.map((a) => (
          <div
            key={a.titulo}
            style={{ background: "#FFFFFF", border: "1px solid #E6E9EF", borderRadius: 12, padding: "16px 18px", boxShadow: "0 2px 8px -2px rgba(11,37,69,0.08)" }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
              <span style={{ fontFamily: serif, fontWeight: 600, fontSize: 42, color: "#0E7C3A", lineHeight: 1 }}>{a.numero}</span>
              <span style={{ fontSize: 15, color: "#1B2438", fontWeight: 500 }}>{a.titulo}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {a.itens.map((nome) => (
                <span key={nome} style={{ fontSize: 12.5, color: "#0B2545", background: "#EEF6F0", border: "1px solid #D3E8DA", borderRadius: 999, padding: "4px 12px" }}>
                  {nome}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapaAssociados({ members }) {
  const ativos = members.filter((m) => m.status === "ativo");
  const porUf = Object.fromEntries(MAPA_UFS.map((e) => [e.uf, ativos.filter((m) => m.estado === e.uf).length]));
  const semUf = ativos.filter((m) => !MAPA_UFS.some((e) => e.uf === m.estado)).length;
  return (
    <div style={{ ...card, marginBottom: 28 }}>
      <CardTitle kicker="Distribuição por estado">Associados ativos na Região Sul</CardTitle>
      <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ width: 260, maxWidth: "100%", flexShrink: 0, margin: "0 auto" }}>
          <img
            src={mapaRegiaoSul}
            alt="Mapa da Região Sul: Paraná, Santa Catarina e Rio Grande do Sul"
            style={{ width: "100%", display: "block", filter: "drop-shadow(0 8px 14px rgba(11,37,69,0.18))" }}
          />
        </div>
        <div style={{ flex: "1 1 240px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 18 }}>
            <span style={{ fontFamily: serif, fontWeight: 600, fontSize: 60, color: "#0E7C3A", lineHeight: 1 }}>{ativos.length}</span>
            <span style={{ fontSize: 15, color: "#566175" }}>associado{ativos.length === 1 ? "" : "s"} ativo{ativos.length === 1 ? "" : "s"}</span>
          </div>
          {MAPA_UFS.map((e) => (
            <div key={e.uf} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #EEF1F5" }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: e.cor, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13.5, color: "#1B2438" }}>{e.nome}</span>
              <span style={{ fontFamily: mono, fontSize: 14, color: "#0B2545", fontWeight: 600 }}>{porUf[e.uf]}</span>
            </div>
          ))}
          {semUf > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "#D6DAE2", flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: "#8992A6" }}>Sem estado informado ou outro estado</span>
              <span style={{ fontFamily: mono, fontSize: 13, color: "#8992A6", fontWeight: 600 }}>{semUf}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmpresasPorEstado({ byEstado, ativos }) {
  const cores = Object.fromEntries(MAPA_UFS.map((e) => [e.uf, e.cor]));
  return (
    <div style={card}>
      <CardTitle kicker="Associados ativos">Empresas por estado</CardTitle>
      {byEstado.filter((e) => e.uf !== "Outro").map((e) => (
        <div key={e.uf} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 40, fontFamily: mono, fontSize: 12, color: "#566175", fontWeight: 600 }}>{e.uf}</span>
            <div style={{ flex: 1, background: "#F1F3F7", borderRadius: 6, height: 10, overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(11,37,69,0.08)" }}>
              <div style={{ width: ativos ? `${(e.count / ativos) * 100}%` : "0%", background: cores[e.uf] || "#B6BDCB", height: "100%", borderRadius: 6 }} />
            </div>
            <span style={{ fontFamily: mono, fontSize: 14, color: "#0B2545", fontWeight: 600, width: 24, textAlign: "right" }}>{e.count}</span>
          </div>
          {e.prospects > 0 && (
            <div style={{ marginLeft: 50, marginTop: 4, fontSize: 11, color: "#8992A6" }}>+ {e.prospects} em negociação</div>
          )}
        </div>
      ))}
    </div>
  );
}

function MissaoIndiaHealth() {
  return (
    <div style={card}>
      <CardTitle kicker={MISSAO_INDIA_HEALTH.subtitulo} accent="#B8752E">{MISSAO_INDIA_HEALTH.titulo}</CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {MISSAO_INDIA_HEALTH.instituicoes.map((nome) => (
          <div
            key={nome}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "#FBF7F1", border: "1px solid #F0E4D3" }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF9933", flexShrink: 0 }} />
            <span style={{ fontSize: 13.5, color: "#1B2438", fontWeight: 500 }}>{nome}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgendaItem({ nome, local, data, horario, status }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "11px 0", borderBottom: "1px solid #EEF1F5" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, marginBottom: 2, color: "#1B2438" }}>{nome || "(sem nome)"}</div>
        <div style={{ fontFamily: mono, fontSize: 11, color: "#8992A6" }}>{local}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: mono, fontSize: 12, color: "#B8752E" }}>
          {formatDate(data) || "sem data"}
          {horario ? <div>{horario}</div> : null}
        </div>
        {status && (
          <span style={{ fontFamily: mono, fontSize: 9, textTransform: "uppercase", color: status.color }}>{status.label}</span>
        )}
      </div>
    </div>
  );
}

export default function VisaoGeralTab({ ativos, byEstado, members, upcomingEvents, upcomingMeetings }) {
  return (
    <div>
      <AtualizacoesRegionalSul />

      <MapaAssociados members={members} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 24 }}>
        <EmpresasPorEstado byEstado={byEstado} ativos={ativos} />

        <MissaoIndiaHealth />

        <div style={card}>
          <CardTitle kicker="Agenda da Regional">Próximos eventos</CardTitle>
          {upcomingEvents.length === 0 && <div style={{ color: "#8992A6", fontSize: 13 }}>Nenhum evento futuro cadastrado.</div>}
          {upcomingEvents.map((e) => (
            <AgendaItem key={e.id} nome={e.nome} local={e.local} data={e.data} horario={e.horario} status={STATUS_EVENTO[e.status]} />
          ))}
        </div>

        <div style={card}>
          <CardTitle kicker="Teams e presenciais">Próximas reuniões</CardTitle>
          {upcomingMeetings.length === 0 && <div style={{ color: "#8992A6", fontSize: 13 }}>Nenhuma reunião futura cadastrada.</div>}
          {upcomingMeetings.map((m) => (
            <AgendaItem key={m.id} nome={m.nome} local={m.local} data={m.data} horario={m.horario} status={STATUS_MEETING[m.status]} />
          ))}
        </div>
      </div>
    </div>
  );
}
