import React from "react";
import SheetTable from "../components/SheetTable";
import RegistroForm from "../components/RegistroForm";
import { DIRECOES_BRINDE } from "../constants";
import { newId } from "../lib/format";

const COLUNAS = [
  { key: "data", label: "Data", type: "date", width: 150 },
  { key: "direcao", label: "Direção", type: "select", options: DIRECOES_BRINDE, width: 130 },
  { key: "contraparte", label: "Contraparte" },
  { key: "descricao", label: "Descrição", type: "textarea" },
  { key: "valor", label: "Valor estimado", width: 130, placeholder: "R$" },
  { key: "aprovadoPor", label: "Aprovado por", width: 150 },
];

export default function BrindesTab({ db, save }) {
  return (
    <section className="panel active">
      <p className="lede">Registro de brindes, presentes e hospitalidades oferecidos ou recebidos no relacionamento com associados, autoridades e parceiros.</p>
      <div className="banner amber">
        <div>
          <strong>Limite de referência:</strong> brindes institucionais de baixo valor (até R$ 200) não exigem aprovação prévia. Hospitalidades (viagens, eventos, refeições de alto valor) exigem registro e aprovação da liderança antes ou logo após o evento.
        </div>
      </div>
      <RegistroForm
        title="Registrar brinde ou hospitalidade"
        assunto="Novo registro de brinde/hospitalidade - CCIB"
        submitLabel="Registrar"
        fields={[
          { name: "data", label: "Data", type: "date", required: true },
          { name: "direcao", label: "Direção", type: "select", options: DIRECOES_BRINDE },
          { name: "contraparte", label: "Contraparte", placeholder: "Empresa, associado ou instituição", required: true },
          { name: "valor", label: "Valor estimado", placeholder: "Ex: R$ 150" },
          { name: "descricao", label: "Descrição", type: "textarea", full: true, placeholder: "Descreva o item ou a hospitalidade..." },
        ]}
        onRegistrar={(v) => save("brindes", [...db.brindes, { id: newId("b"), ...v, aprovadoPor: "" }])}
      />
      <div style={{ marginTop: 20 }}>
        <SheetTable
          title="Planilha de registro de brindes e hospitalidades"
          columns={COLUNAS}
          rows={db.brindes}
          onChange={(l) => save("brindes", l)}
          newRow={() => ({ id: newId("b"), data: "", direcao: "Recebido", contraparte: "", descricao: "", valor: "", aprovadoPor: "" })}
          minWidth={900}
        />
      </div>
    </section>
  );
}
