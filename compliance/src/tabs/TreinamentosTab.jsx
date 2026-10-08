import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import SheetTable from "../components/SheetTable";
import { STATUS_ANUAL, tagColor } from "../constants";
import { MODELO_ATA_TREINAMENTO } from "../data/seeds";
import { newId } from "../lib/format";

const COLUNAS = [
  { key: "data", label: "Data", type: "date", width: 150 },
  { key: "treinamento", label: "Treinamento" },
  { key: "participantes", label: "Participantes", type: "textarea" },
  { key: "duracao", label: "Duração", width: 100 },
  { key: "observacoes", label: "Observações", type: "textarea" },
];

export default function TreinamentosTab({ db, save }) {
  const anuais = [...db.treinamentosAnuais].sort((a, b) => String(a.ano).localeCompare(String(b.ano)));
  const [pendente, setPendente] = useState("");

  const setAnual = (id, campo, valor) => save("treinamentosAnuais", db.treinamentosAnuais.map((a) => (a.id === id ? { ...a, [campo]: valor } : a)));
  const novoAno = () => {
    const ultimo = Math.max(new Date().getFullYear() - 1, ...db.treinamentosAnuais.map((a) => Number(a.ano) || 0));
    const ano = String(ultimo + 1);
    save("treinamentosAnuais", [...db.treinamentosAnuais, { id: `anual-${ano}`, ano, status: "Pendente", nota: "a agendar" }]);
  };

  return (
    <section className="panel active">
      <p className="lede">Acompanhamento de treinamentos obrigatórios de compliance para colaboradores e associados.</p>

      <div className="kpi-row">
        {anuais.map((a) => (
          <div key={a.id} className="card kpi">
            <div className="label">Anual de integridade, {a.ano}</div>
            <div className="value" style={{ fontSize: 26 }}>
              <select
                aria-label={`Status ${a.ano}`}
                className={`cell-input tag-select ${tagColor(a.status)}`}
                value={a.status}
                onChange={(e) => setAnual(a.id, "status", e.target.value)}
                style={{ fontSize: 14, marginTop: 6 }}
              >
                {STATUS_ANUAL.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className={`delta ${a.status === "Concluído" ? "flat" : "warn"}`}>
              <input aria-label={`Nota ${a.ano}`} value={a.nota} onChange={(e) => setAnual(a.id, "nota", e.target.value)} />
            </div>
          </div>
        ))}
        <button className="card kpi btn ghost" onClick={novoAno} style={{ fontSize: 13 }}>+ Novo ano</button>
      </div>

      <div className="two-col even" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-head"><div className="section-title">Colaboradores com treinamento pendente</div></div>
          <ul className="mini-list">
            {db.treinamentosPendentes.length === 0 && <li style={{ color: "var(--ink-400)" }}>Ninguém pendente.</li>}
            {db.treinamentosPendentes.map((p) => (
              <li key={p.id}>
                {p.nome}
                <button className="icon-btn" title="Concluiu o treinamento" onClick={() => save("treinamentosPendentes", db.treinamentosPendentes.filter((x) => x.id !== p.id))}>
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
          <form
            className="add-inline"
            onSubmit={(e) => {
              e.preventDefault();
              if (!pendente.trim()) return;
              save("treinamentosPendentes", [...db.treinamentosPendentes, { id: newId("tp"), nome: pendente.trim() }]);
              setPendente("");
            }}
          >
            <input placeholder="Nome do colaborador..." value={pendente} onChange={(e) => setPendente(e.target.value)} />
            <button className="btn primary" type="submit">Adicionar</button>
          </form>
        </div>

        <div className="card">
          <div className="card-head"><div className="section-title">Modelo para novos treinamentos</div></div>
          <div style={{ padding: "0 20px 20px 20px" }}>
            <strong style={{ display: "block", fontSize: 14, color: "var(--ink-900)", marginBottom: 4 }}>Ata de Treinamento de Compliance para Novos Colaboradores</strong>
            <p style={{ fontSize: 12.5, color: "var(--ink-600)", margin: "0 0 14px 0", lineHeight: 1.5 }}>
              Modelo padrão cobrindo: definição de compliance, políticas internas, Código de Ética, Canal de Denúncias e Pacto Global da ONU. Preencher data, hora e participantes a cada aplicação.
            </p>
            <a className="btn gold" style={{ textDecoration: "none", display: "inline-block" }} href={MODELO_ATA_TREINAMENTO} download>Baixar modelo</a>
          </div>
        </div>
      </div>

      <SheetTable
        title="Planilha de registro de treinamentos"
        columns={COLUNAS}
        rows={db.treinamentos}
        onChange={(l) => save("treinamentos", l)}
        newRow={() => ({ id: newId("t"), data: "", treinamento: "", participantes: "", duracao: "", observacoes: "" })}
        minWidth={760}
      />
    </section>
  );
}
