import React from "react";
import SheetTable from "../components/SheetTable";
import RegistroForm from "../components/RegistroForm";
import { ANALISE_CONFLITO, NATUREZAS_CONFLITO } from "../constants";
import { newId, todayIso } from "../lib/format";

const COLUNAS = [
  { key: "colaborador", label: "Colaborador", width: 170 },
  { key: "area", label: "Área/função", width: 150 },
  { key: "natureza", label: "Natureza", type: "select", options: NATUREZAS_CONFLITO, width: 220 },
  { key: "data", label: "Data", type: "date", width: 150 },
  { key: "descricao", label: "Descrição", type: "textarea" },
  { key: "analise", label: "Análise", type: "tag", options: ANALISE_CONFLITO, width: 170 },
];

export default function ConflitosTab({ db, save }) {
  const ano = new Date().getFullYear();
  return (
    <section className="panel active">
      <p className="lede">Declaração e registro de potenciais conflitos de interesse entre colaboradores, diretoria e partes relacionadas.</p>
      <div style={{ marginBottom: 20 }}>
        <SheetTable
          title="Registros"
          columns={COLUNAS}
          rows={db.conflitos}
          onChange={(l) => save("conflitos", l)}
          emptyText={`Nenhum registro em ${ano}.`}
          minWidth={1000}
        />
      </div>
      <RegistroForm
        title="Nova declaração"
        assunto="Nova declaração de conflito de interesse - CCIB"
        submitLabel="Enviar declaração"
        fields={[
          { name: "colaborador", label: "Nome do declarante", required: true },
          { name: "area", label: "Área/função" },
          { name: "natureza", label: "Natureza do potencial conflito", type: "select", options: NATUREZAS_CONFLITO, full: true },
          { name: "descricao", label: "Descrição", type: "textarea", full: true, required: true, placeholder: "Descreva a situação com o máximo de detalhes possível..." },
        ]}
        onRegistrar={(v) => save("conflitos", [...db.conflitos, { id: newId("ci"), ...v, data: todayIso(), analise: "Em análise" }])}
      />
    </section>
  );
}
