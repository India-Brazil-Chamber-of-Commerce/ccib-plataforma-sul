import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { newId } from "../lib/format";

export default function VisaoGeralTab({ db, save }) {
  const { politicas, treinamentosAnuais, treinamentosPendentes, indicadores, acoes } = db;

  const vigentes = politicas.filter((p) => p.status === "Vigente").length;
  const foraDeDia = politicas.length - vigentes;

  const anos = [...treinamentosAnuais].sort((a, b) => String(a.ano).localeCompare(String(b.ano)));
  const concluidos = anos.filter((a) => a.status === "Concluído");
  const ultimoConcluido = concluidos[concluidos.length - 1];
  const proximo = anos.find((a) => a.status !== "Concluído");

  const setIndicador = (id, campo, valor) => save("indicadores", indicadores.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)));

  return (
    <section className="panel active">
      <p className="lede">Visão consolidada do programa de compliance: indicadores, ações realizadas e pendências prioritárias.</p>

      <div style={{ background: "linear-gradient(135deg,var(--navy-900) 0%,var(--navy-800) 100%)", borderLeft: "4px solid var(--gold-500)", borderRadius: "var(--radius)", padding: "26px 32px", margin: "0 0 28px 0", boxShadow: "var(--shadow)" }}>
        <p className="serif" style={{ margin: 0, textAlign: "center", fontSize: 23, lineHeight: 1.4, fontWeight: 500, fontStyle: "italic", color: "var(--cream-50)" }}>
          “Compliance é um processo contínuo, não um evento único.”
        </p>
        <p style={{ margin: "12px 0 0 0", textAlign: "center", fontSize: 13, letterSpacing: "0.08em", color: "var(--gold-300)" }}>Stephen Cohen</p>
      </div>

      <div className="kpi-row">
        <div className="card kpi">
          <div className="label">Políticas vigentes</div>
          <div className="value">{vigentes}</div>
          <div className={`delta ${foraDeDia ? "warn" : "flat"}`}>{foraDeDia ? `${foraDeDia} fora de vigência` : "todas em dia"}</div>
        </div>
        <div className="card kpi">
          <div className="label">Treinamentos {ultimoConcluido ? ultimoConcluido.ano : ""}</div>
          <div className="value">{ultimoConcluido ? "Concluído" : "—"}</div>
          <div className={`delta ${proximo ? "warn" : "flat"}`}>{proximo ? `${proximo.ano} ${proximo.status.toLowerCase()}` : "nada pendente"}</div>
        </div>
        <div className="card kpi">
          <div className="label">Treinamentos pendentes</div>
          <div className="value">{treinamentosPendentes.length}</div>
          <div className={`delta ${treinamentosPendentes.length ? "warn" : "flat"}`}>
            {treinamentosPendentes.length ? treinamentosPendentes.map((t) => t.nome).join(", ") : "nenhum"}
          </div>
        </div>
        {indicadores.map((i) => (
          <div key={i.id} className="card kpi">
            <div className="label">{i.label}</div>
            <div className="value" style={{ fontSize: 24, lineHeight: 1.3, margin: "10px 0 6px 0" }}>
              <input aria-label={i.label} value={i.valor} onChange={(e) => setIndicador(i.id, "valor", e.target.value)} style={{ fontSize: 24 }} />
            </div>
            <div className="delta flat">
              <input aria-label={`${i.label} (nota)`} value={i.nota} onChange={(e) => setIndicador(i.id, "nota", e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      <div className="two-col even">
        <ListaAcoes titulo="Ações realizadas" feito acoes={acoes} save={(l) => save("acoes", l)} />
        <ListaAcoes titulo="Pendências prioritárias" feito={false} acoes={acoes} save={(l) => save("acoes", l)} />
      </div>
    </section>
  );
}

function ListaAcoes({ titulo, feito, acoes, save }) {
  const [titulo_, setTitulo] = useState("");
  const [detalhe, setDetalhe] = useState("");
  const itens = acoes.filter((a) => !!a.feito === feito);

  const adicionar = (e) => {
    e.preventDefault();
    if (!titulo_.trim()) return;
    save([...acoes, { id: newId("a"), titulo: titulo_.trim(), detalhe: detalhe.trim(), feito }]);
    setTitulo("");
    setDetalhe("");
  };

  return (
    <div className="card">
      <div style={{ padding: "18px 20px 4px 20px" }} className="section-title">{titulo}</div>
      <ul className="tasklist">
        {itens.length === 0 && <li><div className="txt"><span>Nada por aqui.</span></div></li>}
        {itens.map((a) => (
          <li key={a.id}>
            <input
              type="checkbox"
              className="check"
              checked={!!a.feito}
              title={a.feito ? "Voltar para pendências" : "Marcar como realizada"}
              onChange={() => save(acoes.map((x) => (x.id === a.id ? { ...x, feito: !x.feito } : x)))}
            />
            <div className="txt grow">
              <strong>{a.titulo}</strong>
              {a.detalhe && <span>{a.detalhe}</span>}
            </div>
            <button
              className="icon-btn"
              title="Remover"
              onClick={() => window.confirm(`Remover "${a.titulo}"?`) && save(acoes.filter((x) => x.id !== a.id))}
            >
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>
      <form className="add-inline" onSubmit={adicionar}>
        <input placeholder={feito ? "Nova ação realizada..." : "Nova pendência..."} value={titulo_} onChange={(e) => setTitulo(e.target.value)} />
        <input placeholder="Detalhe (opcional)" value={detalhe} onChange={(e) => setDetalhe(e.target.value)} style={{ maxWidth: 150 }} />
        <button className="btn primary" type="submit">Adicionar</button>
      </form>
    </div>
  );
}
