import React from "react";
import SheetTable from "../components/SheetTable";
import RegistroForm from "../components/RegistroForm";
import { SIM_NAO } from "../constants";
import { newId } from "../lib/format";

const COLUNAS = [
  { key: "data", label: "Data", type: "date", width: 150 },
  { key: "hora", label: "Hora", width: 80, placeholder: "hh:mm" },
  { key: "local", label: "Local" },
  { key: "motivo", label: "Motivo" },
  { key: "participantes", label: "Participantes/Empresas", type: "textarea" },
  { key: "temas", label: "Temas tratados", type: "textarea" },
  { key: "presente", label: "Presente?", type: "select", options: SIM_NAO, width: 90 },
  { key: "gasto", label: "Gasto CCIB?", type: "select", options: SIM_NAO, width: 90 },
];

export default function AgentesPublicosTab({ db, save }) {
  return (
    <section className="panel active">
      <p className="lede">Registro de reuniões com agentes públicos, conforme a Política de Relacionamento com Agentes Públicos da CCIB.</p>
      <div className="banner navy">
        <div>
          <strong>Lembrete.</strong> Toda reunião com agente ou órgão público deve ter ao menos dois colaboradores presentes e ser registrada em ata, ainda que não assinada pelo agente público envolvido.
        </div>
      </div>
      <RegistroForm
        title="Registrar reunião"
        assunto="Novo registro de reunião com agente público - CCIB"
        submitLabel="Registrar reunião"
        fields={[
          { name: "motivo", label: "Motivo da reunião", full: true, required: true, placeholder: "Ex: apresentação institucional, missão comercial, licenciamento..." },
          { name: "data", label: "Data", type: "date", required: true },
          { name: "hora", label: "Hora", type: "time" },
          { name: "local", label: "Local", full: true, placeholder: "Endereço, órgão ou plataforma (se virtual)" },
          { name: "participantes", label: "Participantes e empresas/instituições", type: "textarea", full: true, placeholder: "Nome, cargo e instituição de cada participante..." },
          { name: "temas", label: "Temas tratados", type: "textarea", full: true, placeholder: "Breve descrição do assunto e dos encaminhamentos..." },
          { name: "presente", label: "Recebeu algum presente?", type: "select", options: SIM_NAO },
          { name: "gasto", label: "Ocorreu algum gasto da CCIB?", type: "select", options: SIM_NAO },
        ]}
        onRegistrar={(v) => save("agentes", [...db.agentes, { id: newId("ag"), ...v }])}
      />
      <div style={{ marginTop: 20 }}>
        <SheetTable
          title="Planilha de registro de reuniões"
          columns={COLUNAS}
          rows={db.agentes}
          onChange={(l) => save("agentes", l)}
          newRow={() => ({ id: newId("ag"), data: "", hora: "", local: "", motivo: "", participantes: "", temas: "", presente: "Não", gasto: "Não" })}
          minWidth={1100}
        />
      </div>
    </section>
  );
}
