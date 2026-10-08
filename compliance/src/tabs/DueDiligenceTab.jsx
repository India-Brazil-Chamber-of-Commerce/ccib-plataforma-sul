import React from "react";
import SheetTable from "../components/SheetTable";
import { NIVEIS_RISCO, STATUS_DUE_DILIGENCE, TIPOS_DUE_DILIGENCE } from "../constants";
import { newId } from "../lib/format";

const COLUNAS = [
  { key: "empresa", label: "Empresa", placeholder: "Nome da empresa" },
  { key: "tipo", label: "Tipo", type: "select", options: TIPOS_DUE_DILIGENCE, width: 160 },
  { key: "solicitante", label: "Solicitante", width: 170 },
  { key: "risco", label: "Nível de risco", type: "tag", options: NIVEIS_RISCO, width: 130 },
  { key: "status", label: "Status", type: "tag", options: STATUS_DUE_DILIGENCE, width: 150 },
  { key: "observacoes", label: "Observações", type: "textarea" },
];

export default function DueDiligenceTab({ db, save }) {
  return (
    <section className="panel active">
      <p className="lede">Avaliação de integridade de terceiros (associados, fornecedores e parceiros) antes e durante o relacionamento com a Câmara.</p>
      <SheetTable
        title="Casos"
        columns={COLUNAS}
        rows={db.dueDiligence}
        onChange={(l) => save("dueDiligence", l)}
        newRow={() => ({ id: newId("dd"), empresa: "", tipo: "Novo associado", solicitante: "", risco: "Baixo", status: "Em andamento", observacoes: "" })}
        addLabel="+ Novo caso"
        emptyText="Nenhum caso aberto."
        minWidth={900}
      />
    </section>
  );
}
