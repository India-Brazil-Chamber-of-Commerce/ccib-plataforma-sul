import React, { useEffect, useRef, useState } from "react";
import { Plus, Trash2, ChevronDown, FolderKanban, CheckSquare, Square, X } from "lucide-react";
import { ESTADOS, RESPONSAVEIS, STORAGE_PROJECTS, STATUS_PROJETO } from "../constants";
import { inputStyle, labelStyle, filterInputStyle } from "../styles";
import { Field } from "../components/ui";
import { storage } from "../lib/storage";
import { formatDate } from "../lib/format";
import { SEED_PROJECTS } from "../data/seeds";

const mono = "'IBM Plex Mono', monospace";
const serif = "'Fraunces', serif";

const card = {
  background: "#FFFFFF",
  border: "1px solid #E6E9EF",
  borderRadius: 16,
  boxShadow: "0 1px 2px rgba(11,37,69,0.05), 0 10px 28px -6px rgba(11,37,69,0.12)",
  overflow: "hidden",
};

function novoProjeto() {
  return {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    nome: "",
    descricao: "",
    status: "ideia",
    responsavel: "ambos",
    estado: "",
    dataPrevista: "",
    parceiros: "",
    etapas: [],
    notas: "",
    createdAt: Date.now(),
  };
}

function responsavelLabel(id) {
  return (RESPONSAVEIS.find((r) => r.id === id) || {}).label || "Ambos";
}

function ProjetoCard({ p, aberto, onToggle, patch, remover }) {
  const status = STATUS_PROJETO[p.status] || STATUS_PROJETO.ideia;
  const etapas = p.etapas || [];
  const feitas = etapas.filter((e) => e.feito).length;
  const pct = etapas.length ? Math.round((feitas / etapas.length) * 100) : 0;
  const [novaEtapa, setNovaEtapa] = useState("");

  const addEtapa = () => {
    const texto = novaEtapa.trim();
    if (!texto) return;
    patch({ etapas: [...etapas, { id: `e-${Date.now()}`, texto, feito: false }] });
    setNovaEtapa("");
  };

  return (
    <div style={{ ...card, border: aberto ? "1px solid #0B2545" : card.border }} className="ccib-fade-in">
      <div style={{ height: 4, background: status.color }} />
      <div onClick={onToggle} className="ccib-row" style={{ padding: "18px 22px", cursor: "pointer", display: "flex", gap: 16, alignItems: "flex-start" }}>
        <span style={{ width: 42, height: 42, borderRadius: 12, background: `${status.color}1A`, color: status.color, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FolderKanban size={20} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 18, color: "#0B2545", lineHeight: 1.25 }}>{p.nome || "(projeto sem nome)"}</div>
          {p.descricao && <div style={{ fontSize: 13, color: "#566175", marginTop: 4, lineHeight: 1.45 }}>{p.descricao}</div>}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            <span style={{ fontFamily: mono, fontSize: 10.5, fontWeight: 600, color: status.color, background: `${status.color}14`, borderRadius: 999, padding: "3px 10px" }}>{status.label}</span>
            {p.estado && <span style={{ fontFamily: mono, fontSize: 10.5, color: "#566175", background: "#EEF1F5", borderRadius: 999, padding: "3px 10px" }}>{p.estado}</span>}
            <span style={{ fontFamily: mono, fontSize: 10.5, color: "#FFFFFF", background: "#0B2545", borderRadius: 999, padding: "3px 10px" }}>{responsavelLabel(p.responsavel)}</span>
            <span style={{ fontFamily: mono, fontSize: 10.5, color: "#B8752E", background: "#FBF3EA", borderRadius: 999, padding: "3px 10px" }}>{p.dataPrevista ? formatDate(p.dataPrevista) : "Data a definir"}</span>
          </div>
          {etapas.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
              <div style={{ flex: 1, maxWidth: 320, background: "#F1F3F7", borderRadius: 6, height: 8, overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(11,37,69,0.08)" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "#0E7C3A", borderRadius: 6 }} />
              </div>
              <span style={{ fontFamily: mono, fontSize: 11, color: "#566175" }}>{feitas}/{etapas.length} etapas</span>
            </div>
          )}
        </div>
        <ChevronDown size={16} style={{ color: "#8992A6", flexShrink: 0, marginTop: 4, transition: "transform 0.15s ease", transform: aberto ? "rotate(180deg)" : "none" }} />
      </div>

      {aberto && (
        <div style={{ padding: "6px 22px 22px", background: "#FAFBFC", borderTop: "1px solid #EEF1F5" }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "12px 0 14px" }}>
            <Field label="Nome do projeto">
              <input className="ccib-input" style={inputStyle} value={p.nome} placeholder="Nome do projeto" onChange={(e) => patch({ nome: e.target.value })} />
            </Field>
            <Field label="Status">
              <select style={{ ...inputStyle, color: status.color, fontWeight: 600 }} value={p.status} onChange={(e) => patch({ status: e.target.value })}>
                {Object.entries(STATUS_PROJETO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
            <Field label="Responsável">
              <select className="ccib-input" style={inputStyle} value={p.responsavel} onChange={(e) => patch({ responsavel: e.target.value })}>
                {RESPONSAVEIS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
            <Field label="Estado">
              <select className="ccib-input" style={inputStyle} value={p.estado || ""} onChange={(e) => patch({ estado: e.target.value })}>
                <option value="">A definir</option>
                {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </Field>
            <Field label="Data prevista">
              <input type="date" style={{ ...inputStyle, colorScheme: "light" }} value={p.dataPrevista || ""} onChange={(e) => patch({ dataPrevista: e.target.value })} />
            </Field>
            <Field label="Parceiros / patrocinadores">
              <input className="ccib-input" style={inputStyle} value={p.parceiros || ""} placeholder="Ex: FIESC, associados..." onChange={(e) => patch({ parceiros: e.target.value })} />
            </Field>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Field label="Descrição / objetivo">
              <input className="ccib-input" style={inputStyle} value={p.descricao || ""} placeholder="Objetivo do projeto..." onChange={(e) => patch({ descricao: e.target.value })} />
            </Field>
          </div>

          <span style={labelStyle}>Etapas</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {etapas.length === 0 && <div style={{ fontSize: 12.5, color: "#8992A6" }}>Nenhuma etapa cadastrada ainda.</div>}
            {etapas.map((et) => (
              <div key={et.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFFFFF", border: "1px solid #E6E9EF", borderRadius: 8, padding: "6px 10px" }}>
                <button
                  onClick={() => patch({ etapas: etapas.map((x) => (x.id === et.id ? { ...x, feito: !x.feito } : x)) })}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: et.feito ? "#0E7C3A" : "#8992A6", padding: 0, display: "flex" }}
                  title={et.feito ? "Marcar como pendente" : "Marcar como concluída"}
                >
                  {et.feito ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
                <input
                  className="ccib-input"
                  value={et.texto}
                  onChange={(e) => patch({ etapas: etapas.map((x) => (x.id === et.id ? { ...x, texto: e.target.value } : x)) })}
                  style={{ ...inputStyle, borderBottom: "none", padding: "2px", textDecoration: et.feito ? "line-through" : "none", color: et.feito ? "#8992A6" : "#1B2438" }}
                />
                <button onClick={() => patch({ etapas: etapas.filter((x) => x.id !== et.id) })} title="Remover etapa" style={{ background: "transparent", border: "none", cursor: "pointer", color: "#B7BEC9", padding: 0, display: "flex" }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              value={novaEtapa}
              placeholder="Nova etapa (ex: definir local e data)"
              onChange={(e) => setNovaEtapa(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addEtapa(); }}
              style={{ ...filterInputStyle, flex: 1, padding: "6px 10px", fontSize: 12.5 }}
            />
            <button onClick={addEtapa} className="ccib-btn" style={{ display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "1px solid #0B2545", color: "#0B2545", borderRadius: 7, padding: "6px 12px", fontSize: 12.5, cursor: "pointer" }}>
              <Plus size={14} /> Etapa
            </button>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
            <Field label="Notas">
              <input className="ccib-input" style={inputStyle} value={p.notas || ""} placeholder="Observações..." onChange={(e) => patch({ notas: e.target.value })} />
            </Field>
            <button onClick={remover} title="Remover projeto" style={{ background: "transparent", border: "none", color: "#8992A6", cursor: "pointer", padding: "8px 4px" }}>
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjetosTab() {
  const [projetos, setProjetos] = useState(null);
  const [abertos, setAbertos] = useState(new Set());
  const salvarTimer = useRef(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      let salvos = [];
      try {
        const r = await storage.get(STORAGE_PROJECTS, true);
        salvos = r && r.value ? JSON.parse(r.value) : [];
      } catch (e) {
        salvos = [];
      }
      // Acrescenta os projetos-semente que ainda não existem (por id), sem mexer nos já salvos
      const ids = new Set(salvos.map((p) => p.id));
      const faltando = SEED_PROJECTS.filter((p) => !ids.has(p.id));
      const lista = faltando.length ? [...salvos, ...faltando] : salvos;
      if (!vivo) return;
      setProjetos(lista);
      if (faltando.length) {
        try { await storage.set(STORAGE_PROJECTS, JSON.stringify(lista), true); } catch (e) { /* sem armazenamento */ }
      }
    })();
    return () => { vivo = false; };
  }, []);

  const atualizar = (next) => {
    setProjetos(next);
    clearTimeout(salvarTimer.current);
    salvarTimer.current = setTimeout(() => {
      storage.set(STORAGE_PROJECTS, JSON.stringify(next), true).catch(() => {});
    }, 300);
  };

  const toggle = (id) => setAbertos((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  if (!projetos) return <div style={{ color: "#8992A6", fontSize: 13 }}>Carregando projetos…</div>;

  const adicionar = () => {
    const p = novoProjeto();
    atualizar([...projetos, p]);
    setAbertos((s) => new Set(s).add(p.id));
  };

  const ordem = Object.keys(STATUS_PROJETO);
  const lista = [...projetos].sort((a, b) => ordem.indexOf(a.status) - ordem.indexOf(b.status) || (a.dataPrevista || "9999").localeCompare(b.dataPrevista || "9999"));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 600, fontSize: 24, margin: 0, color: "#0B2545" }}>Projetos da Regional Sul</h2>
          <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8992A6", marginTop: 4 }}>
            {projetos.length} projeto{projetos.length === 1 ? "" : "s"}
          </div>
        </div>
        <button
          onClick={adicionar}
          className="ccib-btn ccib-btn-solid"
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#0B2545", color: "#FFFFFF", border: "1px solid #0B2545", borderRadius: 7, padding: "8px 16px", fontWeight: 500, fontSize: 13, cursor: "pointer" }}
        >
          <Plus size={15} /> Novo projeto
        </button>
      </div>

      {lista.length === 0 && <div style={{ padding: "40px 0", textAlign: "center", color: "#8992A6", fontSize: 13 }}>Nenhum projeto cadastrado.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {lista.map((p) => (
          <ProjetoCard
            key={p.id}
            p={p}
            aberto={abertos.has(p.id)}
            onToggle={() => toggle(p.id)}
            patch={(patch) => atualizar(projetos.map((x) => (x.id === p.id ? { ...x, ...patch } : x)))}
            remover={() => { if (window.confirm(`Remover o projeto "${p.nome || "sem nome"}"?`)) atualizar(projetos.filter((x) => x.id !== p.id)); }}
          />
        ))}
      </div>
    </div>
  );
}
