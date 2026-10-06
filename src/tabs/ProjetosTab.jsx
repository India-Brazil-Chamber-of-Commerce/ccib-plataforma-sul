import React, { useEffect, useRef, useState } from "react";
import { Plus, Trash2, ChevronRight, ArrowLeft, FolderKanban, CheckSquare, Square, X, MapPin, CalendarDays, Building2, Wallet } from "lucide-react";
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

const secao = { ...card, padding: "18px 22px" };

const MOEDAS = ["BRL", "USD", "INR"];
const CATEGORIAS_CUSTO = ["Passagens", "Hospedagem", "Alimentação", "Transporte local", "Inscrições / taxas", "Materiais", "Outros"];

const btnLinha = { display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "1px solid #0B2545", color: "#0B2545", borderRadius: 7, padding: "6px 12px", fontSize: 12.5, cursor: "pointer", flexShrink: 0 };
const btnRemover = { background: "transparent", border: "none", cursor: "pointer", color: "#B7BEC9", padding: 0, display: "flex", flexShrink: 0 };
const linhaItem = { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", background: "#FFFFFF", border: "1px solid #E6E9EF", borderRadius: 8, padding: "6px 10px" };
const inputLinha = { ...inputStyle, borderBottom: "none", padding: "2px" };
const novoId = (prefixo) => `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

function novoProjeto() {
  return {
    id: novoId("p"),
    nome: "",
    descricao: "",
    status: "ideia",
    responsavel: "ambos",
    estado: "",
    local: "",
    dataPrevista: "",
    dataFim: "",
    parceiros: "",
    etapas: [],
    empresasVisitadas: [],
    custos: [],
    resultados: "",
    notas: "",
    createdAt: Date.now(),
  };
}

function responsavelLabel(id) {
  return (RESPONSAVEIS.find((r) => r.id === id) || {}).label || "Ambos";
}

function parseValor(v) {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v || "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function formatMoeda(valor, moeda) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda || "BRL" }).format(valor);
  } catch (e) {
    return `${moeda} ${valor.toFixed(2)}`;
  }
}

function totaisPorMoeda(custos) {
  const t = {};
  (custos || []).forEach((c) => {
    const v = parseValor(c.valor);
    if (!v) return;
    const m = c.moeda || "BRL";
    t[m] = (t[m] || 0) + v;
  });
  return Object.entries(t);
}

function periodo(p) {
  if (p.dataPrevista && p.dataFim && p.dataFim !== p.dataPrevista) return `${formatDate(p.dataPrevista)} a ${formatDate(p.dataFim)}`;
  if (p.dataPrevista) return formatDate(p.dataPrevista);
  return "Data a definir";
}

function Chip({ children, color = "#566175", bg = "#EEF1F5" }) {
  return <span style={{ fontFamily: mono, fontSize: 10.5, fontWeight: 600, color, background: bg, borderRadius: 999, padding: "3px 10px" }}>{children}</span>;
}

function TituloSecao({ icon: Icon, children, extra }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      {Icon && <Icon size={16} style={{ color: "#B8752E" }} />}
      <h3 style={{ fontFamily: serif, fontWeight: 600, fontSize: 17, margin: 0, color: "#0B2545", flex: 1 }}>{children}</h3>
      {extra}
    </div>
  );
}

function ProjetoResumo({ p, onAbrir }) {
  const status = STATUS_PROJETO[p.status] || STATUS_PROJETO.ideia;
  const etapas = p.etapas || [];
  const feitas = etapas.filter((e) => e.feito).length;
  const visitas = p.empresasVisitadas || [];
  const totais = totaisPorMoeda(p.custos);

  return (
    <div style={card} className="ccib-fade-in">
      <div style={{ height: 4, background: status.color }} />
      <div onClick={onAbrir} className="ccib-row" style={{ padding: "18px 22px", cursor: "pointer", display: "flex", gap: 16, alignItems: "flex-start" }}>
        <span style={{ width: 42, height: 42, borderRadius: 12, background: `${status.color}1A`, color: status.color, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FolderKanban size={20} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 18, color: "#0B2545", lineHeight: 1.25 }}>{p.nome || "(projeto sem nome)"}</div>
          {p.descricao && <div style={{ fontSize: 13, color: "#566175", marginTop: 4, lineHeight: 1.45 }}>{p.descricao}</div>}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            <Chip color={status.color} bg={`${status.color}14`}>{status.label}</Chip>
            {p.local && <Chip>{p.local}</Chip>}
            {p.estado && <Chip>{p.estado}</Chip>}
            <Chip color="#FFFFFF" bg="#0B2545">{responsavelLabel(p.responsavel)}</Chip>
            <Chip color="#B8752E" bg="#FBF3EA">{periodo(p)}</Chip>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10, fontFamily: mono, fontSize: 11, color: "#566175" }}>
            {visitas.length > 0 && <span>{visitas.length} empresa{visitas.length === 1 ? "" : "s"} visitada{visitas.length === 1 ? "" : "s"}</span>}
            {etapas.length > 0 && <span>{feitas}/{etapas.length} etapas</span>}
            {totais.length > 0 && <span>Despendido: {totais.map(([m, v]) => formatMoeda(v, m)).join(" + ")}</span>}
          </div>
        </div>
        <ChevronRight size={18} style={{ color: "#8992A6", flexShrink: 0, marginTop: 4 }} />
      </div>
    </div>
  );
}

function ProjetoDetalhe({ p, patch, remover, voltar }) {
  const status = STATUS_PROJETO[p.status] || STATUS_PROJETO.ideia;
  const etapas = p.etapas || [];
  const visitas = p.empresasVisitadas || [];
  const custos = p.custos || [];
  const feitas = etapas.filter((e) => e.feito).length;
  const pct = etapas.length ? Math.round((feitas / etapas.length) * 100) : 0;
  const totais = totaisPorMoeda(custos);

  const [novaEtapa, setNovaEtapa] = useState("");
  const [novaVisita, setNovaVisita] = useState({ nome: "", cidade: "" });
  const [novoCusto, setNovoCusto] = useState({ descricao: "", categoria: "Outros", valor: "", moeda: "BRL" });

  const addEtapa = () => {
    const texto = novaEtapa.trim();
    if (!texto) return;
    patch({ etapas: [...etapas, { id: novoId("e"), texto, feito: false }] });
    setNovaEtapa("");
  };
  const addVisita = () => {
    const nome = novaVisita.nome.trim();
    if (!nome) return;
    patch({ empresasVisitadas: [...visitas, { id: novoId("v"), nome, cidade: novaVisita.cidade.trim(), data: "", observacoes: "" }] });
    setNovaVisita({ nome: "", cidade: "" });
  };
  const addCusto = () => {
    const descricao = novoCusto.descricao.trim();
    if (!descricao && !novoCusto.valor) return;
    patch({ custos: [...custos, { id: novoId("c"), ...novoCusto, descricao }] });
    setNovoCusto({ descricao: "", categoria: novoCusto.categoria, valor: "", moeda: novoCusto.moeda });
  };
  const patchItem = (campo, lista, id, mudanca) => patch({ [campo]: lista.map((x) => (x.id === id ? { ...x, ...mudanca } : x)) });

  return (
    <div className="ccib-fade-in">
      <button onClick={voltar} className="ccib-btn" style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "#0B2545", fontSize: 13, cursor: "pointer", padding: "4px 0", marginBottom: 14 }}>
        <ArrowLeft size={15} /> Todos os projetos
      </button>

      <div style={{ ...card, marginBottom: 18 }}>
        <div style={{ height: 4, background: status.color }} />
        <div style={{ padding: "20px 22px" }}>
          <input
            className="ccib-input"
            value={p.nome}
            placeholder="Nome do projeto"
            onChange={(e) => patch({ nome: e.target.value })}
            style={{ ...inputStyle, fontFamily: serif, fontWeight: 600, fontSize: 24, color: "#0B2545", borderBottom: "1px solid transparent" }}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            <Chip color={status.color} bg={`${status.color}14`}>{status.label}</Chip>
            {p.local && <Chip>{p.local}</Chip>}
            <Chip color="#FFFFFF" bg="#0B2545">{responsavelLabel(p.responsavel)}</Chip>
            <Chip color="#B8752E" bg="#FBF3EA">{periodo(p)}</Chip>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 12, marginTop: 18 }}>
            {[
              { icon: MapPin, label: "Onde", valor: p.local || p.estado || "A definir" },
              { icon: CalendarDays, label: "Quando", valor: periodo(p) },
              { icon: Building2, label: "Empresas visitadas", valor: String(visitas.length) },
              { icon: Wallet, label: "Valor despendido", valor: totais.length ? totais.map(([m, v]) => formatMoeda(v, m)).join(" + ") : "Não informado" },
            ].map((k) => (
              <div key={k.label} style={{ background: "#FAFBFC", border: "1px solid #EEF1F5", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, ...labelStyle, marginBottom: 6 }}><k.icon size={12} /> {k.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0B2545", lineHeight: 1.35 }}>{k.valor}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={secao}>
          <TituloSecao icon={FolderKanban}>Informações gerais</TituloSecao>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
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
            <Field label="Estado (Regional Sul)">
              <select className="ccib-input" style={inputStyle} value={p.estado || ""} onChange={(e) => patch({ estado: e.target.value })}>
                <option value="">Não se aplica</option>
                {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
            <Field label="Onde (cidade / país)">
              <input className="ccib-input" style={inputStyle} value={p.local || ""} placeholder="Ex: New Delhi e Chennai, Índia" onChange={(e) => patch({ local: e.target.value })} />
            </Field>
            <Field label="Início">
              <input type="date" style={{ ...inputStyle, colorScheme: "light" }} value={p.dataPrevista || ""} onChange={(e) => patch({ dataPrevista: e.target.value })} />
            </Field>
            <Field label="Fim">
              <input type="date" style={{ ...inputStyle, colorScheme: "light" }} value={p.dataFim || ""} onChange={(e) => patch({ dataFim: e.target.value })} />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="Descrição / objetivo">
              <input className="ccib-input" style={inputStyle} value={p.descricao || ""} placeholder="Objetivo do projeto..." onChange={(e) => patch({ descricao: e.target.value })} />
            </Field>
            <Field label="Parceiros / patrocinadores">
              <input className="ccib-input" style={inputStyle} value={p.parceiros || ""} placeholder="Ex: FIESC, associados..." onChange={(e) => patch({ parceiros: e.target.value })} />
            </Field>
          </div>
        </div>

        <div style={secao}>
          <TituloSecao icon={Building2} extra={<span style={{ fontFamily: mono, fontSize: 11, color: "#8992A6" }}>{visitas.length}</span>}>Empresas visitadas</TituloSecao>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {visitas.length === 0 && <div style={{ fontSize: 12.5, color: "#8992A6" }}>Nenhuma empresa visitada cadastrada.</div>}
            {visitas.map((v) => (
              <div key={v.id} style={linhaItem}>
                <input className="ccib-input" value={v.nome} placeholder="Empresa" onChange={(e) => patchItem("empresasVisitadas", visitas, v.id, { nome: e.target.value })} style={{ ...inputLinha, flex: "2 1 180px", fontWeight: 600, color: "#0B2545" }} />
                <input className="ccib-input" value={v.cidade || ""} placeholder="Cidade" onChange={(e) => patchItem("empresasVisitadas", visitas, v.id, { cidade: e.target.value })} style={{ ...inputLinha, flex: "1 1 110px", fontFamily: mono, fontSize: 12, color: "#566175" }} />
                <input type="date" value={v.data || ""} onChange={(e) => patchItem("empresasVisitadas", visitas, v.id, { data: e.target.value })} style={{ ...inputLinha, flex: "0 1 130px", colorScheme: "light", fontSize: 12, color: "#566175" }} />
                <input className="ccib-input" value={v.observacoes || ""} placeholder="Observações / próximos passos" onChange={(e) => patchItem("empresasVisitadas", visitas, v.id, { observacoes: e.target.value })} style={{ ...inputLinha, flex: "3 1 200px", fontSize: 12.5 }} />
                <button onClick={() => patch({ empresasVisitadas: visitas.filter((x) => x.id !== v.id) })} title="Remover empresa" style={btnRemover}><X size={14} /></button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input value={novaVisita.nome} placeholder="Empresa / instituição" onChange={(e) => setNovaVisita((s) => ({ ...s, nome: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addVisita(); }} style={{ ...filterInputStyle, flex: "2 1 180px", padding: "6px 10px", fontSize: 12.5 }} />
            <input value={novaVisita.cidade} placeholder="Cidade" onChange={(e) => setNovaVisita((s) => ({ ...s, cidade: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addVisita(); }} style={{ ...filterInputStyle, flex: "1 1 110px", padding: "6px 10px", fontSize: 12.5 }} />
            <button onClick={addVisita} className="ccib-btn" style={btnLinha}><Plus size={14} /> Empresa</button>
          </div>
        </div>

        <div style={secao}>
          <TituloSecao icon={Wallet} extra={totais.length > 0 && <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: "#0B2545" }}>{totais.map(([m, v]) => formatMoeda(v, m)).join(" + ")}</span>}>Valor despendido</TituloSecao>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {custos.length === 0 && <div style={{ fontSize: 12.5, color: "#8992A6" }}>Nenhum custo lançado.</div>}
            {custos.map((c) => (
              <div key={c.id} style={linhaItem}>
                <input className="ccib-input" value={c.descricao} placeholder="Descrição" onChange={(e) => patchItem("custos", custos, c.id, { descricao: e.target.value })} style={{ ...inputLinha, flex: "3 1 180px" }} />
                <select value={c.categoria || "Outros"} onChange={(e) => patchItem("custos", custos, c.id, { categoria: e.target.value })} style={{ ...inputLinha, flex: "1 1 120px", fontSize: 12, color: "#566175" }}>
                  {CATEGORIAS_CUSTO.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
                <select value={c.moeda || "BRL"} onChange={(e) => patchItem("custos", custos, c.id, { moeda: e.target.value })} style={{ ...inputLinha, flex: "0 0 64px", fontFamily: mono, fontSize: 12 }}>
                  {MOEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <input className="ccib-input" value={c.valor} placeholder="0,00" inputMode="decimal" onChange={(e) => patchItem("custos", custos, c.id, { valor: e.target.value })} style={{ ...inputLinha, flex: "0 1 110px", fontFamily: mono, textAlign: "right" }} />
                <button onClick={() => patch({ custos: custos.filter((x) => x.id !== c.id) })} title="Remover custo" style={btnRemover}><X size={14} /></button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input value={novoCusto.descricao} placeholder="Ex: Passagem aérea GRU-DEL" onChange={(e) => setNovoCusto((s) => ({ ...s, descricao: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addCusto(); }} style={{ ...filterInputStyle, flex: "3 1 180px", padding: "6px 10px", fontSize: 12.5 }} />
            <select value={novoCusto.categoria} onChange={(e) => setNovoCusto((s) => ({ ...s, categoria: e.target.value }))} style={{ ...filterInputStyle, flex: "1 1 120px", padding: "6px 10px", fontSize: 12.5 }}>
              {CATEGORIAS_CUSTO.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <select value={novoCusto.moeda} onChange={(e) => setNovoCusto((s) => ({ ...s, moeda: e.target.value }))} style={{ ...filterInputStyle, flex: "0 0 74px", padding: "6px 10px", fontSize: 12.5 }}>
              {MOEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <input value={novoCusto.valor} placeholder="Valor" inputMode="decimal" onChange={(e) => setNovoCusto((s) => ({ ...s, valor: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addCusto(); }} style={{ ...filterInputStyle, flex: "0 1 110px", padding: "6px 10px", fontSize: 12.5 }} />
            <button onClick={addCusto} className="ccib-btn" style={btnLinha}><Plus size={14} /> Custo</button>
          </div>
        </div>

        <div style={secao}>
          <TituloSecao icon={CheckSquare} extra={etapas.length > 0 && <span style={{ fontFamily: mono, fontSize: 11, color: "#566175" }}>{feitas}/{etapas.length} ({pct}%)</span>}>Etapas</TituloSecao>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {etapas.length === 0 && <div style={{ fontSize: 12.5, color: "#8992A6" }}>Nenhuma etapa cadastrada ainda.</div>}
            {etapas.map((et) => (
              <div key={et.id} style={linhaItem}>
                <button
                  onClick={() => patchItem("etapas", etapas, et.id, { feito: !et.feito })}
                  style={{ ...btnRemover, color: et.feito ? "#0E7C3A" : "#8992A6" }}
                  title={et.feito ? "Marcar como pendente" : "Marcar como concluída"}
                >
                  {et.feito ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
                <input
                  className="ccib-input"
                  value={et.texto}
                  onChange={(e) => patchItem("etapas", etapas, et.id, { texto: e.target.value })}
                  style={{ ...inputLinha, flex: 1, textDecoration: et.feito ? "line-through" : "none", color: et.feito ? "#8992A6" : "#1B2438" }}
                />
                <button onClick={() => patch({ etapas: etapas.filter((x) => x.id !== et.id) })} title="Remover etapa" style={btnRemover}><X size={14} /></button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={novaEtapa} placeholder="Nova etapa (ex: enviar resumo aos associados)" onChange={(e) => setNovaEtapa(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addEtapa(); }} style={{ ...filterInputStyle, flex: 1, padding: "6px 10px", fontSize: 12.5, minWidth: 0 }} />
            <button onClick={addEtapa} className="ccib-btn" style={btnLinha}><Plus size={14} /> Etapa</button>
          </div>
        </div>

        <div style={secao}>
          <TituloSecao>Resultados e notas</TituloSecao>
          <span style={labelStyle}>Resultados / oportunidades geradas</span>
          <textarea value={p.resultados || ""} placeholder="Acordos, contatos, oportunidades de negócio, próximos passos..." onChange={(e) => patch({ resultados: e.target.value })} rows={4} style={{ ...filterInputStyle, width: "100%", boxSizing: "border-box", resize: "vertical", marginBottom: 14, lineHeight: 1.5 }} />
          <span style={labelStyle}>Notas internas</span>
          <textarea value={p.notas || ""} placeholder="Observações..." onChange={(e) => patch({ notas: e.target.value })} rows={3} style={{ ...filterInputStyle, width: "100%", boxSizing: "border-box", resize: "vertical", lineHeight: 1.5 }} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={remover} className="ccib-btn" style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid #E3C9C2", color: "#B5533C", borderRadius: 7, padding: "6px 12px", fontSize: 12.5, cursor: "pointer" }}>
            <Trash2 size={14} /> Remover projeto
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjetosTab() {
  const [projetos, setProjetos] = useState(null);
  const [abertoId, setAbertoId] = useState(null);
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
      // Acrescenta os projetos-semente que ainda não existem (por id) e preenche só os campos
      // que ainda não existem nos já salvos, sem sobrescrever o que foi editado
      let mudou = false;
      const porId = new Map(SEED_PROJECTS.map((p) => [p.id, p]));
      const lista = salvos.map((p) => {
        const seed = porId.get(p.id);
        if (!seed) return p;
        const faltando = Object.keys(seed).filter((k) => p[k] === undefined);
        if (!faltando.length) return p;
        mudou = true;
        return { ...p, ...Object.fromEntries(faltando.map((k) => [k, seed[k]])) };
      });
      const ids = new Set(salvos.map((p) => p.id));
      SEED_PROJECTS.filter((p) => !ids.has(p.id)).forEach((p) => { lista.push(p); mudou = true; });
      if (!vivo) return;
      setProjetos(lista);
      if (mudou) {
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

  const abrir = (id) => {
    setAbertoId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!projetos) return <div style={{ color: "#8992A6", fontSize: 13 }}>Carregando projetos…</div>;

  const aberto = abertoId && projetos.find((p) => p.id === abertoId);
  if (aberto) {
    return (
      <ProjetoDetalhe
        key={aberto.id}
        p={aberto}
        voltar={() => setAbertoId(null)}
        patch={(patch) => atualizar(projetos.map((x) => (x.id === aberto.id ? { ...x, ...patch } : x)))}
        remover={() => {
          if (window.confirm(`Remover o projeto "${aberto.nome || "sem nome"}"?`)) {
            atualizar(projetos.filter((x) => x.id !== aberto.id));
            setAbertoId(null);
          }
        }}
      />
    );
  }

  const adicionar = () => {
    const p = novoProjeto();
    atualizar([...projetos, p]);
    abrir(p.id);
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
        {lista.map((p) => <ProjetoResumo key={p.id} p={p} onAbrir={() => abrir(p.id)} />)}
      </div>
    </div>
  );
}
