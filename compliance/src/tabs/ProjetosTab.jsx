import React, { useState } from "react";
import { Plus, Trash2, X, FolderKanban, CalendarDays, User, CheckSquare, ImagePlus, Building2, Flag, Pencil, Check, StickyNote } from "lucide-react";
import { PRIORIDADES_PROJETO, STATUS_PROJETO } from "../constants";
import { newId } from "../lib/format";
import { reduzirImagem } from "../lib/imagem";
import Documentos from "../components/Documentos";

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
        {p.fornecedor && <div className="evento-info"><Building2 size={12} />{p.fornecedor}</div>}
        <Barra projeto={p} />
        </div>
      </div>
    </button>
  );
}

function Anel({ pct, cor }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <svg className="pj-anel" viewBox="0 0 84 84" aria-label={`${pct}% concluído`}>
      <circle cx="42" cy="42" r={r} fill="none" stroke="#EEECE3" strokeWidth="8" />
      <circle cx="42" cy="42" r={r} fill="none" stroke={cor} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 42 42)" />
      <text x="42" y="47" textAnchor="middle">{pct}%</text>
    </svg>
  );
}

function ProjetoAberto({ projeto: p, onChange, onFechar, onRemover }) {
  const [novaTarefa, setNovaTarefa] = useState("");
  const [editando, setEditando] = useState(!p.nome);
  const [erroImagem, setErroImagem] = useState("");
  const set = (campo, valor) => onChange({ ...p, [campo]: valor });
  const tarefas = p.tarefas || [];
  const cor = STATUS_PROJETO[p.status] || "#8A93A3";
  const pr = progresso(p);
  const pct = pr ? Math.round((pr.feitas / pr.total) * 100) : 0;
  const atual = tarefas.findIndex((x) => !x.feito);

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

  const addTarefa = (e) => {
    e.preventDefault();
    if (!novaTarefa.trim()) return;
    set("tarefas", [...tarefas, { id: newId("tf"), texto: novaTarefa.trim(), feito: false }]);
    setNovaTarefa("");
  };

  const dados = [
    { icone: Flag, rotulo: "Etapa atual", valor: p.etapaAtual },
    { icone: CalendarDays, rotulo: "Prazo", valor: formatarData(p.prazo) },
    { icone: Building2, rotulo: "Parceiro / fornecedor", valor: p.fornecedor },
    { icone: User, rotulo: "Responsável", valor: p.responsavel },
  ];

  return (
    <div className="card evento-aberto pj ccib-fade-in">
      {/* Cabeçalho visual */}
      <div className="pj-hero" style={{ "--pj-cor": cor }}>
        <div className="pj-hero-capa">
          {p.imagem ? <img src={p.imagem} alt={p.nome} /> : <div className="pj-hero-sem"><FolderKanban size={40} /></div>}
        </div>
        <div className="pj-hero-texto">
          <div className="pj-hero-tags">
            <span className="pj-tag" style={{ background: cor }}>{p.status}</span>
            {p.prioridade && <span className="pj-tag claro" style={{ color: COR_PRIORIDADE[p.prioridade], borderColor: COR_PRIORIDADE[p.prioridade] }}>Prioridade {p.prioridade.toLowerCase()}</span>}
          </div>
          <h2 className="pj-hero-titulo">{p.nome || "(sem nome)"}</h2>
          {p.descricao && <p className="pj-hero-desc">{p.descricao}</p>}
          <div className="pj-dados">
            {dados.map((d) => (
              <div key={d.rotulo} className="pj-dado">
                <d.icone size={15} />
                <div><span>{d.rotulo}</span><strong>{d.valor || "A definir"}</strong></div>
              </div>
            ))}
          </div>
        </div>
        <div className="pj-hero-lado">
          <div className="pj-hero-acoes">
            <button className="btn ghost" onClick={() => setEditando(!editando)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Pencil size={13} /> {editando ? "Concluir edição" : "Editar"}
            </button>
            <button className="icon-btn" title="Remover projeto" onClick={onRemover}><Trash2 size={15} /></button>
            <button className="btn ghost" onClick={onFechar} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><X size={14} /> Fechar</button>
          </div>
          {pr && (
            <div className="pj-progresso">
              <Anel pct={pct} cor={cor} />
              <span>{pr.feitas} de {pr.total} etapas</span>
            </div>
          )}
        </div>
      </div>

      {/* Edição (recolhida por padrão) */}
      {editando && (
        <div className="pj-edicao ccib-fade-in">
          <div className="form-grid">
            {campo("nome", "Nome do projeto", { full: true, placeholder: "Ex: Revisão da Política de Brindes" })}
            {campo("status", "Status", { type: "select", options: STATUS })}
            {campo("prioridade", "Prioridade", { type: "select", options: PRIORIDADES_PROJETO })}
            {campo("responsavel", "Responsável", { placeholder: "Quem lidera" })}
            {campo("etapaAtual", "Etapa atual", { placeholder: "Ex: Captação de recursos" })}
            {campo("inicio", "Início", { type: "date" })}
            {campo("prazo", "Prazo", { type: "date" })}
            {campo("fornecedor", "Parceiro / fornecedor", { full: true, placeholder: "Ex: editora, gráfica, consultoria" })}
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
        </div>
      )}

      <div className="pj-corpo">
        {/* Linha do tempo das etapas */}
        <div className="pj-bloco">
          <div className="pj-bloco-titulo"><CheckSquare size={15} /> Etapas do projeto</div>
          {tarefas.length === 0 && <p className="pj-vazio">Nenhuma etapa cadastrada ainda.</p>}
          <ol className="pj-linha">
            {tarefas.map((t, i) => {
              const estado = t.feito ? "feito" : i === atual ? "atual" : "pendente";
              return (
                <li key={t.id} className={`pj-etapa ${estado}`} style={{ "--pj-cor": cor }}>
                  <button className="pj-marcador" title={t.feito ? "Marcar como pendente" : "Marcar como concluída"}
                    onClick={() => set("tarefas", tarefas.map((x) => (x.id === t.id ? { ...x, feito: !x.feito } : x)))}>
                    {t.feito ? <Check size={14} /> : i + 1}
                  </button>
                  <div className="pj-etapa-texto">
                    <span>{t.texto}</span>
                    {estado === "atual" && <em>Em andamento</em>}
                  </div>
                  <button className="icon-btn pj-etapa-remover" title="Remover etapa" onClick={() => set("tarefas", tarefas.filter((x) => x.id !== t.id))}><Trash2 size={13} /></button>
                </li>
              );
            })}
          </ol>
          <form className="pj-nova" onSubmit={addTarefa}>
            <input placeholder="Adicionar etapa..." value={novaTarefa} onChange={(e) => setNovaTarefa(e.target.value)} />
            <button className="btn primary" type="submit"><Plus size={14} /></button>
          </form>
        </div>

        <div className="pj-coluna">
          <Documentos documentos={p.documentos || []} onChange={(l) => set("documentos", l)} />
          <div className="pj-bloco pj-notas">
            <div className="pj-bloco-titulo"><StickyNote size={15} /> Notas internas</div>
            <textarea value={p.notas || ""} placeholder="Decisões, contatos, combinados..." onChange={(e) => set("notas", e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}
