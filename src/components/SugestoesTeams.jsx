import React, { useState } from "react";
import { CalendarDays, Trash2, ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import { STORAGE_SUGESTOES_TRATADAS } from "../constants";
import { filterInputStyle } from "../styles";
import { SUGESTOES_TEAMS } from "../data/seeds";
import { useListaCompartilhada } from "../lib/useListaCompartilhada";

const mono = "'IBM Plex Mono', monospace";
const serif = "'Fraunces', serif";

const normalizar = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const dataCurta = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : "");
const hojeISO = () => new Date().toISOString().slice(0, 10);

// Empresas vistas em reuniões do Teams que ainda não estão no funil.
// Cada sugestão pode ser movida para uma etapa (vira empresa no Pipeline) ou excluída.
export default function SugestoesTeams({ members, etapas, moverSugestao }) {
  const [tratadas, setTratadas] = useListaCompartilhada(STORAGE_SUGESTOES_TRATADAS);
  const [aberto, setAberto] = useState(true);
  const [verExcluidas, setVerExcluidas] = useState(false);
  if (tratadas === null) return null;

  const porId = new Map(tratadas.map((t) => [t.id, t]));
  const nomesNaPlataforma = new Set((members || []).map((m) => normalizar(m.nome)));
  const pendentes = SUGESTOES_TEAMS.filter((s) => !porId.has(s.id) && !nomesNaPlataforma.has(normalizar(s.empresa)));
  const excluidas = SUGESTOES_TEAMS.filter((s) => porId.get(s.id)?.acao === "excluida");

  const marcar = (id, acao) => setTratadas([...tratadas.filter((t) => t.id !== id), { id, acao, em: hojeISO() }]);
  const restaurar = (id) => setTratadas(tratadas.filter((t) => t.id !== id));

  const mover = (s, etapa) => {
    const notas = `Reuniões no Teams: ${s.reunioes.map((r) => `${dataCurta(r.data)} (${r.assunto})`).join("; ")}${s.participantes ? `. Participantes: ${s.participantes}` : ""}.`;
    moverSugestao(s.empresa, etapa, notas);
    marcar(s.id, "movida");
  };

  if (pendentes.length === 0 && excluidas.length === 0) return null;

  return (
    <div style={{ background: "#F2F6FB", border: "1px solid #D5E1EF", borderRadius: 16, padding: "14px 18px", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setAberto(!aberto)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          {aberto ? <ChevronDown size={16} color="#2F6FB0" /> : <ChevronRight size={16} color="#2F6FB0" />}
          <CalendarDays size={16} color="#2F6FB0" />
          <span style={{ fontFamily: serif, fontWeight: 600, fontSize: 18, color: "#2F6FB0" }}>Sugestões do Teams</span>
          <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, color: "#2F6FB0", background: "#2F6FB01A", borderRadius: 10, padding: "1px 8px" }}>{pendentes.length}</span>
        </button>
        <span style={{ fontSize: 12.5, color: "#8992A6" }}>empresas de reuniões que ainda não estão no funil: mova para uma etapa ou exclua</span>
      </div>

      {aberto && (
        <>
          {pendentes.length === 0 ? (
            <div style={{ fontSize: 12.5, color: "#8992A6", marginTop: 10 }}>Nenhuma sugestão pendente.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 250px), 1fr))", gap: 10, marginTop: 12 }}>
              {pendentes.map((s) => (
                <div key={s.id} style={{ background: "#FFFFFF", border: "1px solid #E6E9EF", borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1B2438", lineHeight: 1.3 }}>{s.empresa}</span>
                    <button
                      type="button"
                      onClick={() => marcar(s.id, "excluida")}
                      title="Excluir sugestão"
                      aria-label={`Excluir sugestão ${s.empresa}`}
                      className="ccib-icon-btn"
                      style={{ background: "transparent", border: "none", color: "#B7BEC9", cursor: "pointer", padding: 2, borderRadius: 5, flexShrink: 0 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {s.reunioes.map((r) => (
                      <span key={r.data + r.assunto} style={{ fontSize: 11.5, color: "#566175", lineHeight: 1.35 }}>
                        <span style={{ fontFamily: mono, color: "#B8752E" }}>{dataCurta(r.data)}</span> {r.assunto}
                      </span>
                    ))}
                  </div>
                  {s.participantes && <span style={{ fontSize: 11.5, color: "#8992A6" }}>{s.participantes}</span>}
                  <select
                    value=""
                    onChange={(e) => e.target.value && mover(s, e.target.value)}
                    aria-label={`Mover ${s.empresa} para uma etapa`}
                    style={{ ...filterInputStyle, width: "100%", marginTop: 2, padding: "4px 8px", fontSize: 11.5, color: "#566175", background: "#FFFFFF" }}
                  >
                    <option value="">Mover para…</option>
                    {etapas.map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
          {excluidas.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <button type="button" onClick={() => setVerExcluidas(!verExcluidas)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, color: "#8992A6", display: "flex", alignItems: "center", gap: 4 }}>
                {verExcluidas ? <ChevronDown size={13} /> : <ChevronRight size={13} />} Excluídas ({excluidas.length})
              </button>
              {verExcluidas && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {excluidas.map((s) => (
                    <span key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#566175", background: "#FFFFFF", border: "1px solid #E6E9EF", borderRadius: 14, padding: "3px 6px 3px 10px" }}>
                      {s.empresa}
                      <button type="button" onClick={() => restaurar(s.id)} title="Voltar para as sugestões" aria-label={`Restaurar ${s.empresa}`} style={{ background: "none", border: "none", padding: 2, cursor: "pointer", color: "#2F6FB0", display: "inline-flex" }}>
                        <RotateCcw size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
