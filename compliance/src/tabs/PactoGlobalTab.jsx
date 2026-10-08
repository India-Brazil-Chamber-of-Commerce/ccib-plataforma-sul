import React, { useState } from "react";
import { PACTO_GLOBAL } from "../data/seeds";

export default function PactoGlobalTab() {
  const [ativa, setAtiva] = useState(PACTO_GLOBAL[0].id);
  const plataforma = PACTO_GLOBAL.find((p) => p.id === ativa);

  return (
    <section className="panel active">
      <p className="lede">
        O Pacto Global é uma chamada para as empresas de todo o mundo alinharem suas operações e estratégias aos Dez Princípios universais nas áreas de Direitos Humanos, Trabalho, Meio Ambiente e Anticorrupção e desenvolverem ações que contribuam para o enfrentamento dos desafios da sociedade. A CCIB organiza seu compromisso em quatro plataformas de atuação.
      </p>
      <div className="platform-grid">
        {PACTO_GLOBAL.map((p) => (
          <button key={p.id} className={`platform-btn${p.id === ativa ? " active" : ""}`} onClick={() => setAtiva(p.id)}>
            <span className="picon">{p.icone}</span>
            {p.nome}
          </button>
        ))}
      </div>
      <div className="platform-content active" key={plataforma.id}>
        <div className="card">
          <div style={{ padding: "18px 20px" }} className="section-title">Plataforma de {plataforma.nome}</div>
          <div style={{ padding: "0 20px", fontSize: 12.5, color: "var(--ink-600)" }}>
            <strong style={{ color: "var(--ink-900)" }}>Participantes:</strong> {plataforma.participantes}
          </div>
          <div style={{ padding: "12px 20px 20px 20px", fontSize: 13.5, color: "var(--ink-600)", lineHeight: 1.7, textAlign: "justify" }}>
            {plataforma.textos.map((t) => <p key={t}>{t}</p>)}
          </div>
        </div>
      </div>
    </section>
  );
}
