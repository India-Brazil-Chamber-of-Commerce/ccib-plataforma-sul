import React, { useState } from "react";
import SheetTable from "../components/SheetTable";
import { CATEGORIAS_POLITICA, STATUS_POLITICA } from "../constants";
import { newId, todayIso } from "../lib/format";

const COLUNAS = [
  { key: "documento", label: "Documento", type: "textarea", placeholder: "Nome do documento" },
  { key: "categoria", label: "Categoria", type: "select", options: CATEGORIAS_POLITICA },
  { key: "versao", label: "Versão", width: 90 },
  { key: "revisao", label: "Última revisão", type: "date", width: 150 },
  { key: "status", label: "Status", type: "tag", options: STATUS_POLITICA, width: 130 },
  { key: "arquivo", label: "Arquivo", type: "link", linkLabel: "Baixar", width: 120 },
];

export default function PoliticasTab({ db, save }) {
  const [busca, setBusca] = useState("");
  const termo = busca.trim().toLowerCase();

  return (
    <section className="panel active">
      <p className="lede">Repositório central de políticas e documentos normativos da CCIB, com status de vigência e revisão.</p>
      <SheetTable
        columns={COLUNAS}
        rows={db.politicas}
        onChange={(l) => save("politicas", l)}
        minWidth={820}
        filter={termo ? (p) => `${p.documento} ${p.categoria}`.toLowerCase().includes(termo) : undefined}
        emptyText={termo ? "Nenhum documento encontrado." : "Nenhum documento cadastrado."}
        headerExtra={
          <div className="toolbar" style={{ margin: 0, width: "100%" }}>
            <input className="search" placeholder="Buscar política ou documento..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            <button
              className="btn primary"
              onClick={() => save("politicas", [...db.politicas, { id: newId("p"), documento: "", categoria: "Governança", versao: "v01", revisao: todayIso(), status: "Rascunho", arquivo: "" }])}
            >
              + Nova política
            </button>
          </div>
        }
      />
      <p className="placeholder-note">
        Os documentos oficiais da CCIB já estão na plataforma (clique em "Baixar"). Para uma nova versão, use o lápis ao lado do link e cole o endereço do arquivo no SharePoint ou no Google Drive.
      </p>
    </section>
  );
}
