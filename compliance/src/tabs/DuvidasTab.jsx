import React, { useState } from "react";
import SheetTable from "../components/SheetTable";
import RegistroForm from "../components/RegistroForm";
import { STATUS_DUVIDA } from "../constants";
import { FAQ } from "../data/seeds";
import { newId, todayIso } from "../lib/format";

const COLUNAS = [
  { key: "data", label: "Data", type: "date", width: 150 },
  { key: "assunto", label: "Assunto", width: 200 },
  { key: "descricao", label: "Dúvida", type: "textarea" },
  { key: "resposta", label: "Resposta", type: "textarea" },
  { key: "status", label: "Status", type: "tag", options: STATUS_DUVIDA, width: 130 },
];

export default function DuvidasTab({ db, save }) {
  const [aberta, setAberta] = useState(null);
  return (
    <section className="panel active">
      <p className="lede">Canal aberto para colaboradores e associados esclarecerem dúvidas sobre políticas, condutas e procedimentos de compliance.</p>
      <div className="two-col" style={{ marginBottom: 20 }}>
        <div className="card">
          <div style={{ padding: "18px 20px" }} className="section-title">Perguntas frequentes</div>
          {FAQ.map((f, i) => (
            <div key={f.pergunta} className={`faq-item${aberta === i ? " open" : ""}`}>
              <button className="faq-q" onClick={() => setAberta(aberta === i ? null : i)}>
                {f.pergunta} <span className="chev">▾</span>
              </button>
              <div className="faq-a">{f.resposta}</div>
            </div>
          ))}
        </div>
        <RegistroForm
          title="Enviar uma dúvida"
          assunto="Nova dúvida - Canal de Compliance CCIB"
          fields={[
            { name: "assunto", label: "Assunto", full: true, required: true },
            { name: "descricao", label: "Descrição", type: "textarea", full: true, required: true, placeholder: "Descreva sua dúvida..." },
          ]}
          onRegistrar={(v) => save("duvidas", [...db.duvidas, { id: newId("d"), data: todayIso(), ...v, resposta: "", status: "Aberta" }])}
        />
      </div>
      <SheetTable
        title="Dúvidas recebidas"
        columns={COLUNAS}
        rows={db.duvidas}
        onChange={(l) => save("duvidas", l)}
        emptyText="Nenhuma dúvida recebida ainda."
        minWidth={900}
      />
    </section>
  );
}
