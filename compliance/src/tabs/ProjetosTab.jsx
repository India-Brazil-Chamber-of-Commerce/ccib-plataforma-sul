import React, { useState } from "react";
import { Plus, Trash2, X, FolderKanban, CalendarDays, User, CheckSquare, ImagePlus } from "lucide-react";
import { PRIORIDADES_PROJETO, STATUS_PROJETO } from "../constants";
import { newId } from "../lib/format";
import { reduzirImagem } from "../lib/imagem";

const STATUS = Object.keys(STATUS_PROJETO);
const FILTROS = [
  { id: "ativos", label: "Ativos", inclui: (p) => p.status !== "Concluído" },
  { id: "concluidos", label: "Concluídos", inclui: (p) => p.status === "Concluído" },
  { id: "todos", label: "Todos", inclui: () => true },
];
const COR_PRIORIDADE = { Alta: "#B23A34", "Média": "#B8862E", Baixa: "#2F7A4F" };

function novoProjeto() {
  return { id: newId("pj"), nome: "", descricao: "", status: "Ideia", prioridade: "Média", responsavel: "", inicio: "", prazo: "", etapaAtual: "", tarefas: [], notas: "" };
}

function formatarData(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function progresso(p) {
  const t = p.tarefas || [];
  if (!t.length) return null;
  return { feitas: t.filter((x) => x.feito).length, total: t.length };
}

// Ordem: status (andamento primeiro), depois prazo mais próximo
const ORDEM = ["Em andamento", "Em planejamento", "Ideia", "Pausado", "Concluído"];
const ordenar = (a, b) => ORDEM.indexOf(a.status) - ORDEM.indexOf(b.status) || (a.prazo || "9999").localeCompare(b.prazo || "9999");

export default function ProjetosTab({ db, save }) {
  const projetos = db.projetos || [];
  const [filtro, setFiltro] = useState("ativos");
  const [aberto, setAberto] = useState(null);

  const atualizar = (novo) => save("projetos", projetos.map((p) => (p.id === novo.id ? novo : p)));
  const adicionar = () => {
    const p = novoProjeto();
    save("projetos", [p, ...projetos]);
    setFiltro("ativos");
    setAberto(p.id);
  };
  const remover = (p) => {
    if (!window.confirm(`Remover o projeto "${p.nome || "(sem nome)"}"?`)) return;
    save("projetos", projetos.filter((x) => x.id !== p.id));
    setAberto(null);
  };

  const { inclui } = FILTROS.find((f) => f.id === filtro);
  const lista = projetos.filter((p) => inclui(p) || p.id === aberto).sort(ordenar);
  const contagem = STATUS.map((s) => [s, projetos.filter((p) => p.status === s).length]).filter(([, n]) => n);

  return (
    <section className="panel active">
      <p className="lede">Iniciativas do programa de compliance: o que está em andamento, quem lidera, prazos e próximos passos.</p>

      {contagem.length > 0 && (
        <div className="projetos-resumo">
          {contagem.map(([s, n]) => (
            <div key={s} className="projetos-resumo-item"><span className="dot" style={{ background: STATUS_PROJETO[s] }} /><strong>{n}</strong> {s.toLowerCase()}</div>
          ))}
        </div>
      )}

      <div className="eventos-toolbar">
        <div className="eventos-filtros">
          {FILTROS.map((f) => (
            <button key={f.id} className={`pill${filtro === f.id ? " active" : ""}`} onClick={() => setFiltro(f.id)}>
              {f.label}<span className="pill-count">{projetos.filter(f.inclui).length}</span>
            </button>
          ))}
        </div>
        <button className="btn primary" onClick={adicionar} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={15} /> Novo projeto
        </button>
      </div>

      {lista.length === 0 ? (
        <div className="eventos-vazio"><FolderKanban size={28} /><div>Nenhum projeto neste filtro.</div></div>
      ) : (
        <div className="eventos-grid">
          {lista.map((p) =>
            p.id === aberto ? (
              <ProjetoAberto key={p.id} projeto={p} onChange={atualizar} onFechar={() => setAberto(null)} onRemover={() => remover(p)} />
            ) : (
              <ProjetoCartao key={p.id} projeto={p} onAbrir={() => setAberto(p.id)} />
            )
          )}
        </div>
      )}
    </section>
  );
}

function StatusLinha({ projeto }) {
  const cor = STATUS_PROJETO[projeto.status] || "#8A93A3";
  return (
    <div className="evento-status">
      <span className="dot" style={{ background: cor }} />
      <span className="evento-status-txt" style={{ color: cor }}>{projeto.status}</span>
      {projeto.prioridade && <span className="evento-tipo" style={{ color: COR_PRIORIDADE[projeto.prioridade] }}>· prioridade {projeto.prioridade.toLowerCase()}</span>}
    </div>
  );
}

function Barra({ projeto }) {
  const pr = progresso(projeto);
  if (!pr) return null;
  const pct = Math.round((pr.feitas / pr.total) * 100);
  return (
    <div className="projeto-barra">
      <div className="projeto-barra-trilho"><div style={{ width: `${pct}%`, background: STATUS_PROJETO[projeto.status] || "#10309A" }} /></div>
      <span>{pr.feitas}/{pr.total} tarefas · {pct}%</span>
    </div>
  );
}

function ProjetoCartao({ projeto: p, onAbrir }) {
  return (
    <button className="card evento-card projeto-card" onClick={onAbrir} style={{ borderTop: `4px solid ${STATUS_PROJETO[p.status] || "#8A93A3"}` }}>
      <div className={`evento-card-corpo${p.imagem ? " com-imagem" : ""}`}>
        {p.imagem && <img className="projeto-imagem" src={p.imagem} alt={p.nome} />}
        <div className="projeto-card-texto">
        <StatusLinha projeto={p} />
        <div className="evento-nome">{p.nome || "(sem nome)"}</div>
        {p.etapaAtual && <div className="projeto-etapa">{p.etapaAtual}</div>}
        {p.responsavel && <div className="evento-info"><User size={12} />{p.responsavel}</div>}
        {p.prazo && <div className="evento-info"><CalendarDays size={12} />Prazo {formatarData(p.prazo)}</div>}
        <Barra projeto={p} />
        </div>
      </div>
    </button>
  );
}

function ProjetoAberto({ projeto: p, onChange, onFechar, onRemover }) {
  const [novaTarefa, setNovaTarefa] = useState("");
  const set = (campo, valor) => onChange({ ...p, [campo]: valor });
  const tarefas = p.tarefas || [];

  const campo = (nome, label, props = {}) => (
    <div className={`field${props.full ? " full" : ""}`}>
      <label htmlFor={`pj-${p.id}-${nome}`}>{label}</label>
      {props.type === "select" ? (
        <select id={`pj-${p.id}-${nome}`} value={p[nome] || ""} onChange={(e) => set(nome, e.target.value)}>
          {props.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : props.type === "textarea" ? (
        <textarea id={`pj-${p.id}-${nome}`} value={p[nome] || ""} placeholder={props.placeholder} onChange={(e) => set(nome, e.target.value)} />
      ) : (
        <input id={`pj-${p.id}-${nome}`} type={props.type || "text"} value={p[nome] || ""} placeholder={props.placeholder} onChange={(e) => set(nome, e.target.value)} />
      )}
    </div>
  );

  const [erroImagem, setErroImagem] = useState("");
  const enviarImagem = async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    ev.target.value = "";
    if (!file) return;
    try {
      setErroImagem("");
      set("imagem", await reduzirImagem(file, 700));
    } catch (err) {
      setErroImagem(err.message);
    }
  };

  const addTarefa = (e) => {
    e.preventDefault();
    if (!novaTarefa.trim()) return;
    set("tarefas", [...tarefas, { id: newId("tf"), texto: novaTarefa.trim(), feito: false }]);
    setNovaTarefa("");
  };

  return (
    <div className="card evento-aberto ccib-fade-in" style={{ borderTop: `4px solid ${STATUS_PROJETO[p.status] || "#8A93A3"}` }}>
      <div className="projeto-topo">
        {p.imagem && <img className="projeto-imagem grande" src={p.imagem} alt={p.nome} />}
        <div style={{ minWidth: 0, flex: 1 }}>
          <StatusLinha projeto={p} />
          <div className="evento-nome grande">{p.nome || "(sem nome)"}</div>
          <Barra projeto={p} />
        </div>
        <div className="evento-aberto-acoes">
          <button className="icon-btn" title="Remover projeto" onClick={onRemover}><Trash2 size={15} /></button>
          <button className="btn ghost" onClick={onFechar} style={{ display: "flex", alignItems: "center", gap: 6 }}><X size={14} /> Fechar</button>
        </div>
      </div>

      <div className="projeto-corpo">
        <div className="form-grid">
          {campo("nome", "Nome do projeto", { full: true, placeholder: "Ex: Revisão da Política de Brindes" })}
          {campo("status", "Status", { type: "select", options: STATUS })}
          {campo("prioridade", "Prioridade", { type: "select", options: PRIORIDADES_PROJETO })}
          {campo("responsavel", "Responsável", { placeholder: "Quem lidera" })}
          {campo("etapaAtual", "Etapa atual", { placeholder: "Ex: Fase de captação" })}
          {campo("inicio", "Início", { type: "date" })}
          {campo("prazo", "Prazo", { type: "date" })}
          {campo("descricao", "Objetivo / descrição", { type: "textarea", full: true })}
          <div className="field full">
            <label>Imagem do projeto (capa, arte, logo)</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <label className="btn ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <ImagePlus size={14} /> {p.imagem ? "Trocar imagem" : "Enviar imagem"}
                <input type="file" accept="image/*" onChange={enviarImagem} style={{ display: "none" }} />
              </label>
              {p.imagem && <button className="btn ghost" onClick={() => set("imagem", "")}>Remover imagem</button>}
              {erroImagem && <span style={{ color: "var(--red)", fontSize: 12.5 }}>{erroImagem}</span>}
            </div>
          </div>
        </div>

        <div className="projeto-tarefas">
          <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 6 }}><CheckSquare size={13} /> Próximos passos</div>
          <ul className="tasklist">
            {tarefas.length === 0 && <li><div className="txt"><span>Nenhum passo cadastrado.</span></div></li>}
            {tarefas.map((t) => (
              <li key={t.id}>
                <input type="checkbox" className="check" checked={!!t.feito} onChange={() => set("tarefas", tarefas.map((x) => (x.id === t.id ? { ...x, feito: !x.feito } : x)))} />
                <div className="txt grow"><strong style={t.feito ? { textDecoration: "line-through", color: "var(--ink-400)", fontWeight: 500 } : { fontWeight: 500 }}>{t.texto}</strong></div>
                <button className="icon-btn" title="Remover" onClick={() => set("tarefas", tarefas.filter((x) => x.id !== t.id))}><Trash2 size={13} /></button>
              </li>
            ))}
          </ul>
          <form className="add-inline" onSubmit={addTarefa}>
            <input placeholder="Novo passo..." value={novaTarefa} onChange={(e) => setNovaTarefa(e.target.value)} />
            <button className="btn primary" type="submit">Adicionar</button>
          </form>
        </div>

        <div className="form-grid" style={{ marginTop: 18 }}>
          {campo("notas", "Notas internas", { type: "textarea", full: true, placeholder: "Decisões, contatos, links de documentos..." })}
        </div>
      </div>
    </div>
  );
}
