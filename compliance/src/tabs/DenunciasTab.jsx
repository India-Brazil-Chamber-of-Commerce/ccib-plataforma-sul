import React from "react";
import { CANAL_DENUNCIAS_URL } from "../constants";

// Denúncias não são gravadas na plataforma: vão direto para o canal independente (SG Compliance).
export default function DenunciasTab() {
  return (
    <section className="panel active">
      <p className="lede">Canal confidencial para relato de condutas contrárias à ética, à lei ou às políticas da Câmara de Comércio Índia Brasil.</p>
      <div className="banner navy">
        <div>
          <strong>Confidencialidade.</strong> Relatos podem ser feitos de forma identificada ou anônima. A apuração segue o Regimento do Canal de Denúncias e retaliação contra quem reporta de boa fé não é tolerada.
        </div>
      </div>
      <div className="card">
        <div style={{ padding: "18px 20px" }} className="section-title">Canal de Denúncias</div>
        <div style={{ padding: "0 20px 24px 20px" }}>
          <p style={{ fontSize: 13.5, color: "var(--ink-600)", lineHeight: 1.6, margin: "0 0 16px 0" }}>
            O registro de denúncias é feito diretamente na plataforma independente SG Compliance, que garante sigilo e possibilita relatos anônimos.
          </p>
          <a className="btn danger" style={{ textDecoration: "none", display: "inline-block" }} href={CANAL_DENUNCIAS_URL} target="_blank" rel="noopener noreferrer">
            Acessar Canal de Denúncias →
          </a>
          <p className="placeholder-note" style={{ marginTop: 14 }}>{CANAL_DENUNCIAS_URL}</p>
        </div>
      </div>
    </section>
  );
}
