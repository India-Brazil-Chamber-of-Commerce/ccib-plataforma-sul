import React, { useState } from "react";
import SheetTable from "../components/SheetTable";
import EventoDetalhes from "../components/EventoDetalhes";
import { STATUS_EVENTO, TIPOS_EVENTO } from "../constants";
import { newId } from "../lib/format";

const COLUNAS_FUTUROS = [
  { key: "evento", label: "Evento", type: "textarea" },
  { key: "tipo", label: "Tipo", type: "select", options: TIPOS_EVENTO, width: 210 },
  { key: "data", label: "Data prevista", width: 150, placeholder: "dd/mm/aaaa" },
  { key: "local", label: "Local" },
  { key: "status", label: "Status", type: "tag", options: STATUS_EVENTO, width: 130 },
  { key: "convite", label: "Convite", type: "link", width: 110 },
];

const COLUNAS_PASSADOS = [
  { key: "data", label: "Data", width: 130, placeholder: "dd/mm/aaaa" },
  { key: "evento", label: "Evento" },
  { key: "local", label: "Local", width: 150 },
  { key: "participantes", label: "Participantes", type: "textarea" },
  { key: "resultado", label: "Resultado", type: "textarea" },
];

export default function EventosTab({ db, save }) {
  const futuros = db.eventosFuturos;
  const padrao = futuros.find((e) => /jornada/i.test(e.evento || "")) || futuros[0];
  const [selecionado, setSelecionado] = useState(padrao ? padrao.id : null);
  const evento = futuros.find((e) => e.id === selecionado) || padrao;
  const atualizarEvento = (novo) => save("eventosFuturos", futuros.map((e) => (e.id === novo.id ? novo : e)));

  return (
    <section className="panel active">
      <p className="lede">Missões, feiras, webinars e eventos institucionais da CCIB ligados a compliance.</p>
      <div style={{ marginBottom: 20 }}>
        <SheetTable
          title="Por vir"
          columns={COLUNAS_FUTUROS}
          rows={db.eventosFuturos}
          onChange={(l) => save("eventosFuturos", l)}
          newRow={() => ({ id: newId("ef"), evento: "", tipo: "Outro", data: "", local: "", status: "Previsto", convite: "" })}
          addLabel="+ Adicionar evento"
          minWidth={900}
        />
      </div>
      {evento && (
        <div style={{ marginBottom: 28 }}>
          <div className="card-head" style={{ padding: "4px 0 14px 0" }}>
            <h3 className="serif" style={{ margin: 0, fontSize: 20, color: "var(--navy-900)" }}>Ficha do evento: {evento.evento || "(sem nome)"}</h3>
            {futuros.length > 1 && (
              <select className="search" aria-label="Escolher evento" value={evento.id} onChange={(e) => setSelecionado(e.target.value)}>
                {futuros.map((e) => <option key={e.id} value={e.id}>{e.evento || "(sem nome)"}</option>)}
              </select>
            )}
          </div>
          <EventoDetalhes evento={evento} onChange={atualizarEvento} />
        </div>
      )}

      <SheetTable
        title="Passados"
        columns={COLUNAS_PASSADOS}
        rows={db.eventosPassados}
        onChange={(l) => save("eventosPassados", l)}
        newRow={() => ({ id: newId("ep"), data: "", evento: "", local: "", participantes: "", resultado: "" })}
        minWidth={820}
      />
    </section>
  );
}
