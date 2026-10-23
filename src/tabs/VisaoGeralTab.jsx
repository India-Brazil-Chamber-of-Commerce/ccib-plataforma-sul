import React, { useState } from "react";
import { STATUS_EVENTO, STATUS_MEETING } from "../constants";
import { formatDate } from "../lib/format";
import { ChakraIcon } from "../components/ui";
import mapaRegiaoSul from "../assets/mapa-regiao-sul.webp";

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
        <div style={{ flex: "1 1 240px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
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

// ---------- Números estratégicos ----------

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const pad = (n) => String(n).padStart(2, "0");
const isoLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const chaveMes = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

// Reunião interna: assunto marcado como INTERNO ou reunião de equipe
const ehInterna = (m) => /interno|reuni[aã]o de equipe/i.test(m.nome || "");

// Realizada: marcada como realizada ou, se não cancelada, já passou (hoje conta quando o horário de término já passou)
function foiRealizada(m, hoje, agoraHHMM) {
  if (m.status === "cancelada" || !m.data) return false;
  if (m.status === "realizada") return true;
  if (m.data < hoje) return true;
  if (m.data > hoje) return false;
  const fim = ((m.horario || "").match(/(\d{1,2}:\d{2})\s*$/) || [])[1];
  return !!fim && fim.padStart(5, "0") <= agoraHHMM;
}

const valorUSD = (txt) => {
  const n = Number(String(txt || "").replace(/[^\d,]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
const usd = (n) => `US$ ${Math.round(n).toLocaleString("pt-BR")}`;

function calcularNumeros({ meetings, events, contacts, members }) {
  const agora = new Date();
  const hoje = isoLocal(agora);
  const agoraHHMM = `${pad(agora.getHours())}:${pad(agora.getMinutes())}`;
  const mesAtual = chaveMes(agora);
  const anterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
  const mesAnterior = chaveMes(anterior);
  // Mesmo período do mês anterior (até o mesmo dia, limitado ao último dia daquele mês)
  const ultimoDiaAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0).getDate();
  const limiteAnterior = `${mesAnterior}-${pad(Math.min(agora.getDate(), ultimoDiaAnterior))}`;
  const fimMes = isoLocal(new Date(agora.getFullYear(), agora.getMonth() + 1, 0));
  const em7 = isoLocal(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 7));

  const validas = (meetings || []).filter((m) => m.status !== "cancelada" && m.data);
  const realizadas = validas.filter((m) => foiRealizada(m, hoje, agoraHHMM));
  const realizadasMes = realizadas.filter((m) => m.data.startsWith(mesAtual));
  const realizadasAnteriorMesmoPeriodo = realizadas.filter((m) => m.data.startsWith(mesAnterior) && m.data <= limiteAnterior).length;
  const futuras = validas.filter((m) => !foiRealizada(m, hoje, agoraHHMM) && m.data >= hoje);

  // Série dos últimos 6 meses (o atual é parcial)
  const serie = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    const k = chaveMes(d);
    const doMes = realizadas.filter((m) => m.data.startsWith(k));
    serie.push({ chave: k, rotulo: MESES_CURTOS[d.getMonth()], mes: MESES[d.getMonth()], ano: d.getFullYear(), total: doMes.length, externas: doMes.filter((m) => !ehInterna(m)).length, atual: k === mesAtual });
  }

  const ms = members || [];
  const negociacao = ms.filter((m) => m.status === "negociacao");
  const vencidos = negociacao.filter((m) => m.dataNegocio && m.dataNegocio < hoje);

  const proximoEvento = (events || [])
    .filter((e) => e.status !== "cancelado" && e.data && e.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data))[0];
  const diasAteEvento = proximoEvento ? Math.round((new Date(`${proximoEvento.data}T00:00:00`) - new Date(`${hoje}T00:00:00`)) / 86400000) : null;

  const cs = contacts || [];
  const porPais = {};
  cs.forEach((c) => { const p = (c.pais || "").trim(); if (p) porPais[p] = (porPais[p] || 0) + 1; });

  return {
    nomeMes: MESES[agora.getMonth()],
    nomeMesAnterior: MESES[anterior.getMonth()],
    realizadasMes: realizadasMes.length,
    externasMes: realizadasMes.filter((m) => !ehInterna(m)).length,
    internasMes: realizadasMes.filter(ehInterna).length,
    realizadasAnteriorMesmoPeriodo,
    restantesMes: futuras.filter((m) => m.data <= fimMes).length,
    proximos7: futuras.filter((m) => m.data <= em7).length,
    ativos: ms.filter((m) => m.status === "ativo").length,
    emNegociacao: negociacao.length,
    emProspeccao: ms.filter((m) => m.status === "prospeccao").length,
    valorNegociacao: negociacao.reduce((t, m) => t + valorUSD(m.valorNegocio), 0),
    vencidos: vencidos.length,
    proximoEvento,
    diasAteEvento,
    contatos: cs.length,
    porPais: Object.entries(porPais).sort((a, b) => b[1] - a[1]),
    serie,
  };
}

function Kpi({ rotulo, valor, detalhe, destaque, cor = "#0B2545", onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="ccib-kpi"
      style={{
        ...card, padding: "18px 20px", textAlign: "left", cursor: onClick ? "pointer" : "default",
        display: "flex", flexDirection: "column", gap: 6, minWidth: 0, font: "inherit", color: "inherit",
      }}
    >
      <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8992A6" }}>{rotulo}</span>
      <span style={{ fontFamily: serif, fontWeight: 600, fontSize: 38, lineHeight: 1.05, color: cor, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{valor}</span>
      {destaque}
      {detalhe && <span style={{ fontSize: 12.5, color: "#566175", lineHeight: 1.4 }}>{detalhe}</span>}
    </button>
  );
}

function Variacao({ atual, anterior, mesAnterior }) {
  const diff = atual - anterior;
  const cor = diff > 0 ? "#0E7C3A" : diff < 0 ? "#C1502E" : "#8992A6";
  const seta = diff > 0 ? "▲" : diff < 0 ? "▼" : "=";
  return (
    <span style={{ fontFamily: mono, fontSize: 11.5, color: "#566175" }}>
      <span style={{ color: cor, fontWeight: 600 }}>{seta} {diff > 0 ? `+${diff}` : diff === 0 ? "igual" : diff}</span>{" "}
      vs mesmo período de {mesAnterior} ({anterior})
    </span>
  );
}

function NumerosEstrategicos({ n, irPara }) {
  const ev = n.proximoEvento;
  const quando = n.diasAteEvento === 0 ? "hoje" : n.diasAteEvento === 1 ? "amanhã" : `em ${n.diasAteEvento} dias`;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 290px), 1fr))", gap: 18, marginBottom: 28 }}>
      <Kpi
        rotulo={`Reuniões realizadas em ${n.nomeMes}`}
        valor={n.realizadasMes}
        cor="#0E7C3A"
        destaque={<Variacao atual={n.realizadasMes} anterior={n.realizadasAnteriorMesmoPeriodo} mesAnterior={n.nomeMesAnterior} />}
        detalhe={`${n.externasMes} externa${n.externasMes === 1 ? "" : "s"} · ${n.internasMes} interna${n.internasMes === 1 ? "" : "s"}`}
        onClick={() => irPara("reunioes")}
        title="Abrir a aba Reuniões"
      />
      <Kpi
        rotulo={`Reuniões a realizar em ${n.nomeMes}`}
        valor={n.restantesMes}
        detalhe={`${n.proximos7} nos próximos 7 dias`}
        onClick={() => irPara("reunioes")}
        title="Abrir a aba Reuniões"
      />
      <Kpi
        rotulo="Associados ativos"
        valor={n.ativos}
        cor="#0E7C3A"
        detalhe={`${n.emNegociacao} em negociação · ${n.emProspeccao} em prospecção`}
        onClick={() => irPara("associados")}
        title="Abrir a aba Empresas"
      />
      <Kpi
        rotulo="Pipeline em negociação"
        valor={usd(n.valorNegociacao)}
        destaque={n.vencidos > 0 ? (
          <span style={{ fontFamily: mono, fontSize: 11.5, color: "#C1502E", fontWeight: 600 }}>⚠ {n.vencidos} com previsão vencida</span>
        ) : null}
        detalhe={`${n.emNegociacao} negócio${n.emNegociacao === 1 ? "" : "s"} em aberto`}
        onClick={() => irPara("pipeline")}
        title="Abrir a aba Pipeline"
      />
      <Kpi
        rotulo="Próximo evento"
        valor={ev ? quando : "nenhum"}
        cor="#B8752E"
        detalhe={ev ? `${ev.nome} · ${formatDate(ev.data)}` : "Nenhum evento futuro cadastrado."}
        onClick={() => irPara("eventos")}
        title="Abrir a aba Eventos"
      />
      <Kpi
        rotulo="Contatos cadastrados"
        valor={n.contatos}
        detalhe={n.porPais.length ? n.porPais.slice(0, 3).map(([p, q]) => `${q} ${p}`).join(" · ") : "País ainda não informado"}
        onClick={() => irPara("contatos")}
        title="Abrir a aba Contatos"
      />
    </div>
  );
}

// Barras das reuniões realizadas por mês (uma série, uma cor; o mês atual em destaque)
function ReunioesPorMes({ serie }) {
  const [foco, setFoco] = useState(null);
  const max = Math.max(1, ...serie.map((s) => s.total));
  const alturaMax = 150;
  return (
    <div style={card}>
      <CardTitle kicker="Realizadas nos últimos 6 meses">Reuniões por mês</CardTitle>
      <div role="img" aria-label={`Reuniões realizadas: ${serie.map((s) => `${s.mes} ${s.total}`).join(", ")}`} style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: alturaMax + 22, borderBottom: "1px solid #D6DAE2", padding: "0 4px" }}>
          {serie.map((s, i) => {
            const h = s.total ? Math.max(4, (s.total / max) * alturaMax) : 0;
            const ativo = foco === i;
            return (
              <div
                key={s.chave}
                onMouseEnter={() => setFoco(i)}
                onMouseLeave={() => setFoco(null)}
                onFocus={() => setFoco(i)}
                onBlur={() => setFoco(null)}
                tabIndex={0}
                style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", position: "relative", outline: "none", cursor: "default" }}
              >
                {(s.atual || ativo) && (
                  <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: "#1B2438", marginBottom: 4 }}>{s.total}</span>
                )}
                <div style={{
                  width: "100%", maxWidth: 38, height: h, borderRadius: "4px 4px 0 0",
                  background: s.atual ? "#0E7C3A" : "#9CC9A9", opacity: foco === null || ativo ? 1 : 0.55,
                  transition: "opacity 0.15s ease",
                }} />
                {ativo && (
                  <div style={{
                    position: "absolute", bottom: h + 26, left: "50%", transform: "translateX(-50%)", zIndex: 2,
                    background: "#0B2545", color: "#FFFFFF", borderRadius: 8, padding: "7px 10px", whiteSpace: "nowrap",
                    fontSize: 12, boxShadow: "0 6px 16px rgba(11,37,69,0.25)", pointerEvents: "none",
                  }}>
                    <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{s.mes} {s.ano}{s.atual ? " (até hoje)" : ""}</div>
                    <div style={{ fontFamily: mono, fontSize: 11, opacity: 0.85 }}>{s.total} realizadas · {s.externas} externas</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10, padding: "6px 4px 0" }}>
          {serie.map((s) => (
            <span key={s.chave} style={{ flex: 1, minWidth: 0, textAlign: "center", fontFamily: mono, fontSize: 11, color: s.atual ? "#0B2545" : "#8992A6", fontWeight: s.atual ? 600 : 400, textTransform: "uppercase" }}>{s.rotulo}</span>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 11.5, color: "#8992A6" }}>
        Contam as reuniões não canceladas que já aconteceram. O mês atual vai até hoje.
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

export default function VisaoGeralTab({ ativos, byEstado, members, meetings, events, contacts, upcomingEvents, upcomingMeetings, irPara }) {
  const numeros = calcularNumeros({ meetings, events, contacts, members });
  return (
    <div>
      <NumerosEstrategicos n={numeros} irPara={irPara} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 24, marginBottom: 28 }}>
        <ReunioesPorMes serie={numeros.serie} />

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

      <MapaAssociados members={members} />

      <EmpresasPorEstado byEstado={byEstado} ativos={ativos} />
    </div>
  );
}
