import React, { useEffect, useRef, useState } from "react";
import { Bell, Plus, X, CheckSquare, Square, ChevronDown, ChevronRight, CalendarDays } from "lucide-react";
import { RESPONSAVEIS, STORAGE_LEMBRETES, STORAGE_LEMBRETES_SEMENTES } from "../constants";
import { filterInputStyle, labelStyle } from "../styles";
import { storage, EVENTO_ATUALIZADO } from "../lib/storage";
import { SEED_LEMBRETES } from "../data/seeds";

const mono = "'IBM Plex Mono', monospace";
const serif = "'Fraunces', serif";
const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const hojeStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export function rotuloData(data) {
  if (!data) return "Sem data";
  const [a, m, d] = data.split("-").map(Number);
  return `${DIAS[new Date(a, m - 1, d).getDay()]} ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}
const novoId = () => `lem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const ler = async (key) => {
  try {
    const r = await storage.get(key, true);
    return r && r.value ? JSON.parse(r.value) : [];
  } catch (e) {
    return [];
  }
};

// Lembretes compartilhados (chave ccib-sul-lembretes). Os lembretes-semente entram uma vez só:
// os ids já aplicados ficam em ccib-sul-lembretes-sementes, para que um lembrete apagado não volte.
export function useLembretes() {
  const [lembretes, setLembretes] = useState(null);
  const carregar = useRef(null);
  const timer = useRef(null);
  const pendente = useRef(null);

  useEffect(() => {
    let vivo = true;
    carregar.current = async () => {
      const lista = await ler(STORAGE_LEMBRETES);
      const aplicadas = await ler(STORAGE_LEMBRETES_SEMENTES);
      const vistos = new Set(aplicadas.map((x) => x.id));
      const ids = new Set(lista.map((x) => x.id));
      const novos = SEED_LEMBRETES.filter((s) => !vistos.has(s.id) && !ids.has(s.id));
      const final = novos.length ? [...lista, ...novos] : lista;
      if (!vivo) return;
      setLembretes(final);
      if (novos.length) {
        try {
          await storage.set(STORAGE_LEMBRETES, JSON.stringify(final), true);
          await storage.set(STORAGE_LEMBRETES_SEMENTES, JSON.stringify([...aplicadas, ...novos.map((s) => ({ id: s.id }))]), true);
        } catch (e) { /* sem armazenamento */ }
      }
    };
    carregar.current();
    // Alteração feita por outra pessoa: recarrega, mas não no meio de uma digitação
    let atrasado = false;
    const digitando = () => ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
    const tentar = () => {
      if (pendente.current || digitando()) { atrasado = true; return; }
      atrasado = false;
      if (carregar.current) carregar.current();
    };
    const aoAtualizar = (e) => { if (e.detail?.key === STORAGE_LEMBRETES) tentar(); };
    const aoSair = () => { if (atrasado) setTimeout(tentar, 400); };
    window.addEventListener(EVENTO_ATUALIZADO, aoAtualizar);
    document.addEventListener("focusout", aoSair);
    return () => {
      vivo = false;
      window.removeEventListener(EVENTO_ATUALIZADO, aoAtualizar);
      document.removeEventListener("focusout", aoSair);
      clearTimeout(timer.current);
      if (pendente.current) storage.set(STORAGE_LEMBRETES, JSON.stringify(pendente.current), true).catch(() => {});
    };
  }, []);

  const atualizar = (next) => {
    setLembretes(next);
    pendente.current = next;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      pendente.current = null;
      storage.set(STORAGE_LEMBRETES, JSON.stringify(next), true).catch(() => {});
    }, 400);
  };
  return [lembretes, atualizar];
}

function Item({ l, hoje, patch, remover }) {
  const atrasado = !l.feito && l.data && l.data < hoje;
  const ehHoje = !l.feito && l.data === hoje;
  const resp = RESPONSAVEIS.find((r) => r.id === l.responsavel) || RESPONSAVEIS.find((r) => r.id === "ambos");
  const corData = atrasado ? "#C1502E" : ehHoje ? "#0E7C3A" : "#B8752E";
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: l.feito ? "#FAFBFC" : "#FFFFFF", border: `1px solid ${atrasado ? "#F0C9BC" : "#E6E9EF"}`, borderLeft: `3px solid ${l.feito ? "#D6DAE2" : corData}`, borderRadius: 8, padding: "8px 10px" }}>
      <button onClick={() => patch({ feito: !l.feito })} title={l.feito ? "Marcar como pendente" : "Marcar como feito"} style={{ background: "none", border: "none", padding: 0, marginTop: 1, cursor: "pointer", color: l.feito ? "#0E7C3A" : "#8992A6", flexShrink: 0 }}>
        {l.feito ? <CheckSquare size={16} /> : <Square size={16} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
          <label title="Alterar a data" style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", fontFamily: mono, fontSize: 10.5, fontWeight: 600, color: l.feito ? "#A3ABBB" : corData }}>
            <CalendarDays size={11} /> {rotuloData(l.data)}{atrasado ? " · atrasado" : ehHoje ? " · hoje" : ""}
            <input type="date" value={l.data || ""} onChange={(e) => patch({ data: e.target.value })} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", colorScheme: "light" }} />
          </label>
        </div>
        <textarea
          value={l.texto}
          rows={Math.min(4, Math.max(1, Math.ceil((l.texto || "").length / 34)))}
          onChange={(e) => patch({ texto: e.target.value })}
          style={{ width: "100%", boxSizing: "border-box", border: "none", resize: "none", background: "transparent", padding: 0, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, lineHeight: 1.4, color: l.feito ? "#8992A6" : "#1B2438", textDecoration: l.feito ? "line-through" : "none", outline: "none" }}
        />
        <select value={l.responsavel || "ambos"} onChange={(e) => patch({ responsavel: e.target.value })} style={{ border: "none", background: "transparent", padding: 0, fontSize: 10.5, fontWeight: 600, color: resp.accent, cursor: "pointer" }}>
          {RESPONSAVEIS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </div>
      <button onClick={remover} title="Apagar lembrete" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#B7BEC9", flexShrink: 0 }}><X size={14} /></button>
    </div>
  );
}

export default function Lembretes({ lembretes, atualizar }) {
  const [novo, setNovo] = useState({ data: "", texto: "", responsavel: "ambos" });
  const [verFeitos, setVerFeitos] = useState(false);
  const hoje = hojeStr();

  if (!lembretes) return <div style={{ color: "#8992A6", fontSize: 12.5 }}>Carregando lembretes…</div>;

  const patchL = (id, mudanca) => atualizar(lembretes.map((x) => (x.id === id ? { ...x, ...mudanca } : x)));
  const remover = (l) => { if (window.confirm(`Apagar o lembrete "${l.texto || "sem texto"}"?`)) atualizar(lembretes.filter((x) => x.id !== l.id)); };
  const adicionar = () => {
    const texto = novo.texto.trim();
    if (!texto) return;
    atualizar([...lembretes, { id: novoId(), data: novo.data, texto, responsavel: novo.responsavel, feito: false, createdAt: Date.now() }]);
    setNovo({ data: "", texto: "", responsavel: novo.responsavel });
  };

  const ordem = (a, b) => (a.data || "9999").localeCompare(b.data || "9999");
  const pendentes = lembretes.filter((l) => !l.feito).sort(ordem);
  const feitos = lembretes.filter((l) => l.feito).sort(ordem);
  const atrasados = pendentes.filter((l) => l.data && l.data < hoje).length;

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E6E9EF", borderRadius: 14, boxShadow: "0 1px 2px rgba(11,37,69,0.05), 0 10px 28px -6px rgba(11,37,69,0.12)", padding: "16px 16px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: "#FBF3EA", color: "#B8752E", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Bell size={16} /></span>
        <h3 style={{ fontFamily: serif, fontWeight: 600, fontSize: 18, margin: 0, color: "#0B2545", flex: 1 }}>Lembretes</h3>
        <span style={{ fontFamily: mono, fontSize: 10.5, color: "#566175", background: "#EEF1F5", borderRadius: 20, padding: "2px 9px" }}>{pendentes.length} pendente{pendentes.length === 1 ? "" : "s"}</span>
      </div>
      {atrasados > 0 && <div style={{ fontSize: 11.5, color: "#C1502E", marginBottom: 6 }}>{atrasados} atrasado{atrasados === 1 ? "" : "s"}</div>}
      <div style={{ height: 3, width: 40, borderRadius: 2, margin: "8px 0 12px", background: "linear-gradient(to right, #FF9933, #0E7C3A)" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {pendentes.length === 0 && <div style={{ fontSize: 12.5, color: "#8992A6" }}>Nenhum lembrete pendente.</div>}
        {pendentes.map((l) => <Item key={l.id} l={l} hoje={hoje} patch={(m) => patchL(l.id, m)} remover={() => remover(l)} />)}
      </div>

      <div style={{ background: "#F7F8FA", borderRadius: 10, padding: "10px 10px 8px", marginBottom: 10 }}>
        <div style={{ ...labelStyle, marginBottom: 6 }}>Novo lembrete</div>
        <textarea value={novo.texto} rows={2} placeholder="Ex: Entrar em contato com..." onChange={(e) => setNovo((s) => ({ ...s, texto: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); adicionar(); } }} style={{ ...filterInputStyle, width: "100%", boxSizing: "border-box", resize: "vertical", fontSize: 12.5, padding: "6px 8px", marginBottom: 6 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <input type="date" value={novo.data} onChange={(e) => setNovo((s) => ({ ...s, data: e.target.value }))} style={{ ...filterInputStyle, padding: "5px 8px", fontSize: 12, flex: "1 1 120px", colorScheme: "light" }} />
          <select value={novo.responsavel} onChange={(e) => setNovo((s) => ({ ...s, responsavel: e.target.value }))} style={{ ...filterInputStyle, padding: "5px 8px", fontSize: 12, flex: "1 1 110px" }}>
            {RESPONSAVEIS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
          <button onClick={adicionar} className="ccib-btn ccib-btn-solid" style={{ display: "flex", alignItems: "center", gap: 4, background: "#0B2545", color: "#FFFFFF", border: "1px solid #0B2545", borderRadius: 7, padding: "5px 12px", fontSize: 12.5, cursor: "pointer" }}>
            <Plus size={13} /> Adicionar
          </button>
        </div>
      </div>

      {feitos.length > 0 && (
        <div>
          <button onClick={() => setVerFeitos((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, color: "#566175" }}>
            {verFeitos ? <ChevronDown size={14} /> : <ChevronRight size={14} />} Concluídos ({feitos.length})
          </button>
          {verFeitos && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {feitos.map((l) => <Item key={l.id} l={l} hoje={hoje} patch={(m) => patchL(l.id, m)} remover={() => remover(l)} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
