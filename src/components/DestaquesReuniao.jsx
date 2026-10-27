import React, { useState } from "react";
import { Plus, Pencil, Check, Trash2, ExternalLink } from "lucide-react";
import { RESPONSAVEIS, STORAGE_DESTAQUES } from "../constants";
import { filterInputStyle } from "../styles";
import { useListaCompartilhada } from "../lib/useListaCompartilhada";

const mono = "'IBM Plex Mono', monospace";
const serif = "'Fraunces', serif";

// Cores das etiquetas de situação (a etiqueta é texto livre; a cor é escolhida à parte)
const CORES = [
  { id: "verde", label: "Verde", cor: "#0E7C3A" },
  { id: "azul", label: "Azul", cor: "#2F6FB0" },
  { id: "laranja", label: "Laranja", cor: "#B8752E" },
  { id: "roxo", label: "Roxo", cor: "#6A5ACD" },
  { id: "vermelho", label: "Vermelho", cor: "#C1502E" },
  { id: "cinza", label: "Cinza", cor: "#8992A6" },
];
const corDe = (id) => (CORES.find((c) => c.id === id) || CORES[2]).cor;

const SUGESTOES_ETIQUETA = [
  "Associada · ficha assinada",
  "Já associada · agora patrocínio",
  "Aguardando resposta",
  "Proposta enviada",
  "Em negociação",
  "Maior esperança de fechar",
  "Primeiro contato",
  "Pausado",
];

const novoId = () => `dest-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const normalizar = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const dataCurta = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : "");

const campo = { ...filterInputStyle, width: "100%", boxSizing: "border-box", background: "#FFFFFF" };

function Card({ d, editando, setEditando, patch, remover, membros, abrirEmpresa }) {
  const cor = corDe(d.cor);
  const membro = membros.find((m) => normalizar(m.nome) === normalizar(d.empresa));
  const resp = RESPONSAVEIS.find((r) => r.id === d.responsavel);

  if (editando) {
    return (
      <div style={{ background: "#FFFFFF", border: "1px solid #E6E9EF", borderLeft: `4px solid ${cor}`, borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 2px 8px -2px rgba(11,37,69,0.10)" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            autoFocus={!d.empresa}
            list="destaques-empresas"
            placeholder="Empresa"
            value={d.empresa}
            onChange={(e) => patch({ empresa: e.target.value })}
            style={{ ...campo, flex: "2 1 180px", fontWeight: 600 }}
          />
          <select value={d.responsavel || "ambos"} onChange={(e) => patch({ responsavel: e.target.value })} style={{ ...campo, flex: "1 1 110px", width: "auto" }} aria-label="Responsável">
            {RESPONSAVEIS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            list="destaques-etiquetas"
            placeholder="Situação (ex.: Aguardando resposta)"
            value={d.etiqueta}
            onChange={(e) => patch({ etiqueta: e.target.value })}
            style={{ ...campo, flex: "2 1 180px" }}
          />
          <div style={{ display: "flex", gap: 5, alignItems: "center" }} role="radiogroup" aria-label="Cor da etiqueta">
            {CORES.map((c) => (
              <button
                key={c.id}
                type="button"
                title={c.label}
                aria-label={c.label}
                aria-checked={d.cor === c.id}
                role="radio"
                onClick={() => patch({ cor: c.id })}
                style={{ width: 20, height: 20, borderRadius: "50%", background: c.cor, border: d.cor === c.id ? "2px solid #0B2545" : "2px solid #FFFFFF", boxShadow: "0 0 0 1px #D6DAE2", cursor: "pointer", padding: 0 }}
              />
            ))}
          </div>
        </div>
        <textarea
          placeholder={"Um tópico por linha. Ex.:\nCadastro de fornecedor aprovado em 23/10\nPagamento previsto para novembro"}
          value={(d.pontos || []).join("\n")}
          onChange={(e) => patch({ pontos: e.target.value.split("\n") })}
          rows={Math.max(4, (d.pontos || []).length + 1)}
          style={{ ...campo, resize: "vertical", lineHeight: 1.5, fontFamily: "'IBM Plex Sans', sans-serif" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => { if (window.confirm(`Apagar o destaque${d.empresa ? ` de ${d.empresa}` : ""}?`)) remover(); }}
            className="ccib-btn"
            style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", color: "#C1502E", fontSize: 12.5, cursor: "pointer", padding: 0 }}
          >
            <Trash2 size={13} /> Apagar
          </button>
          <button
            type="button"
            onClick={() => { patch({ pontos: (d.pontos || []).map((p) => p.trim()).filter(Boolean) }); setEditando(false); }}
            className="ccib-btn ccib-btn-solid"
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#0B2545", color: "#FFFFFF", border: "1px solid #0B2545", borderRadius: 7, padding: "6px 14px", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}
          >
            <Check size={14} /> Concluir
          </button>
        </div>
      </div>
    );
  }

  const pontos = (d.pontos || []).filter((p) => p.trim());
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E6E9EF", borderLeft: `4px solid ${cor}`, borderRadius: 12, padding: "16px 18px", boxShadow: "0 2px 8px -2px rgba(11,37,69,0.10)", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", paddingRight: 30 }}>
        {membro && abrirEmpresa ? (
          <button type="button" onClick={() => abrirEmpresa(membro.id)} title="Abrir na aba Empresas" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#0B2545", display: "inline-flex", alignItems: "center", gap: 5 }}>
            {d.empresa} <ExternalLink size={12} style={{ color: "#8992A6" }} />
          </button>
        ) : (
          <span style={{ fontSize: 15, fontWeight: 600, color: "#0B2545" }}>{d.empresa || "(sem empresa)"}</span>
        )}
        {d.etiqueta && (
          <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, color: cor, background: `${cor}17`, borderRadius: 20, padding: "3px 10px" }}>
            {d.etiqueta}
          </span>
        )}
      </div>
      <button type="button" onClick={() => setEditando(true)} title="Editar" aria-label="Editar" className="ccib-icon-btn" style={{ position: "absolute", top: 12, right: 12, background: "transparent", border: "none", color: "#8992A6", cursor: "pointer", padding: 4, borderRadius: 6 }}>
        <Pencil size={14} />
      </button>
      {pontos.length ? (
        <ul style={{ margin: "12px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
          {pontos.map((p, i) => <li key={i} style={{ fontSize: 13.5, color: "#1B2438", lineHeight: 1.5 }}>{p}</li>)}
        </ul>
      ) : (
        <div style={{ marginTop: 10, fontSize: 12.5, color: "#8992A6" }}>Nenhum tópico ainda. Clique no lápis para escrever.</div>
      )}
      <div style={{ marginTop: 12, fontFamily: mono, fontSize: 10.5, color: "#8992A6" }}>
        {resp ? resp.label : "Ambos"}{d.atualizadoEm ? ` · atualizado em ${dataCurta(d.atualizadoEm)}` : ""}
      </div>
    </div>
  );
}

// "Destaques para a reunião": o que queremos falar com o time sobre cada prospect
export default function DestaquesReuniao({ members, abrirEmpresa }) {
  const [destaques, setDestaques] = useListaCompartilhada(STORAGE_DESTAQUES);
  const [editando, setEditando] = useState(() => new Set());
  const lista = destaques || [];
  const membros = members || [];
  const nomes = [...new Set(membros.map((m) => m.nome).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  const marcarEdicao = (id, on) => setEditando((s) => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; });
  const patch = (id, mudanca) => setDestaques(lista.map((d) => (d.id === id ? { ...d, ...mudanca, atualizadoEm: hojeISO() } : d)));
  const remover = (id) => { setDestaques(lista.filter((d) => d.id !== id)); marcarEdicao(id, false); };
  const adicionar = () => {
    const d = { id: novoId(), empresa: "", etiqueta: "", cor: "laranja", pontos: [], responsavel: "ambos", atualizadoEm: hojeISO() };
    setDestaques([d, ...lista]);
    marcarEdicao(d.id, true);
  };

  return (
    <div style={{ background: "#FFF7EE", border: "1px solid #F6DFC4", borderRadius: 16, padding: "18px 20px 20px", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <h2 style={{ fontFamily: serif, fontWeight: 600, fontSize: 20, margin: 0, color: "#B8752E" }}>Destaques para a reunião</h2>
        <span style={{ fontSize: 13, color: "#8992A6" }}>o que queremos falar com o time</span>
        <button
          type="button"
          onClick={adicionar}
          className="ccib-btn"
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "#FFFFFF", color: "#B8752E", border: "1px solid #E8C29A", borderRadius: 7, padding: "6px 14px", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}
        >
          <Plus size={14} /> Novo destaque
        </button>
      </div>
      {destaques === null ? (
        <div style={{ fontSize: 13, color: "#8992A6" }}>Carregando...</div>
      ) : lista.length === 0 ? (
        <div style={{ fontSize: 13, color: "#8992A6", padding: "8px 0" }}>
          Nenhum destaque ainda. Clique em "Novo destaque" para registrar o que precisa ser discutido sobre cada empresa.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: 14 }}>
          {lista.map((d) => (
            <Card
              key={d.id}
              d={d}
              editando={editando.has(d.id)}
              setEditando={(on) => marcarEdicao(d.id, on)}
              patch={(m) => patch(d.id, m)}
              remover={() => remover(d.id)}
              membros={membros}
              abrirEmpresa={abrirEmpresa}
            />
          ))}
        </div>
      )}
      <datalist id="destaques-empresas">{nomes.map((n) => <option key={n} value={n} />)}</datalist>
      <datalist id="destaques-etiquetas">{SUGESTOES_ETIQUETA.map((n) => <option key={n} value={n} />)}</datalist>
    </div>
  );
}
