import React, { useState } from "react";
import { Plus, Trash2, CalendarDays, MapPin, Clock, ImagePlus, X } from "lucide-react";
import SheetTable from "../components/SheetTable";
import { FORMATOS_EVENTO, PARTICIPACOES_EMPRESA, STATUS_EMPRESA_EVENTO, STATUS_EVENTO, TIPOS_EVENTO, tagColor } from "../constants";
import { newId } from "../lib/format";
import { reduzirImagem } from "../lib/imagem";

const FILTROS = [
  { id: "porvir", label: "Por vir", inclui: (e) => e.status === "Previsto" || e.status === "Confirmado" },
  { id: "realizados", label: "Realizados", inclui: (e) => e.status === "Realizado" },
  { id: "todos", label: "Todos", inclui: () => true },
];

const COLUNAS_PROGRAMACAO = [
  { key: "horario", label: "Horário", width: 110, placeholder: "hh:mm" },
  { key: "tema", label: "Tema", type: "textarea" },
  { key: "palestrante", label: "Palestrante", width: 180 },
  { key: "empresa", label: "Empresa", width: 180 },
  { key: "duracao", label: "Duração", width: 100, placeholder: "Ex: 30 min" },
];

const COLUNAS_EMPRESAS = [
  { key: "empresa", label: "Empresa" },
  { key: "participacao", label: "Participação", type: "select", options: PARTICIPACOES_EMPRESA, width: 160 },
  { key: "contato", label: "Contato", width: 170 },
  { key: "emailTelefone", label: "E-mail / telefone", width: 200 },
  { key: "status", label: "Status", type: "tag", options: STATUS_EMPRESA_EVENTO, width: 140 },
];

function novoEvento() {
  return {
    id: newId("ev"), evento: "", tipo: "Outro", status: "Previsto", data: "", dataPrevista: "",
    horaInicio: "", horaFim: "", duracao: "", formato: "", local: "", convite: "",
    programacao: [], empresas: [],
  };
}

function formatarData(e) {
  if (e.data) {
    const [y, m, d] = e.data.split("-");
    return `${d}/${m}/${y}`;
  }
  return e.dataPrevista || "";
}

// Diferença entre dois horários "hh:mm", em texto (ex.: "3h30")
function duracaoEntre(inicio, fim) {
  if (!inicio || !fim) return "";
  const [h1, m1] = inicio.split(":").map(Number);
  const [h2, m2] = fim.split(":").map(Number);
  const total = h2 * 60 + m2 - (h1 * 60 + m1);
  if (!(total > 0)) return "";
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h}h${m ? String(m).padStart(2, "0") : ""}` : `${m} min`;
}

function horario(e) {
  if (!e.horaInicio) return "";
  return e.horaFim ? `${e.horaInicio} às ${e.horaFim}` : `a partir das ${e.horaInicio}`;
}

export default function EventosTab({ db, save }) {
  const [filtro, setFiltro] = useState("porvir");
  const [aberto, setAberto] = useState(null);
  const eventos = db.eventos;

  const atualizar = (novo) => save("eventos", eventos.map((e) => (e.id === novo.id ? novo : e)));
  const remover = (ev) => {
    if (!window.confirm(`Remover o evento "${ev.evento || "(sem nome)"}"?`)) return;
    save("eventos", eventos.filter((e) => e.id !== ev.id));
    setAberto(null);
  };
  const adicionar = () => {
    const ev = novoEvento();
    save("eventos", [ev, ...eventos]);
    setFiltro("porvir");
    setAberto(ev.id);
  };

  const { inclui } = FILTROS.find((f) => f.id === filtro);
  // Eventos com data exata vêm primeiro (realizados: mais recente antes); os sem data ficam no fim
  const ordenar = (a, b) => {
    if (!a.data || !b.data) return a.data ? -1 : b.data ? 1 : 0;
    return filtro === "realizados" ? b.data.localeCompare(a.data) : a.data.localeCompare(b.data);
  };
  const lista = eventos.filter((e) => inclui(e) || e.id === aberto).sort(ordenar);

  return (
    <section className="panel active">
      <p className="lede">Missões, feiras, webinars e eventos institucionais da CCIB ligados a compliance.</p>

      <div className="eventos-toolbar">
        <div className="eventos-filtros">
          {FILTROS.map((f) => (
            <button key={f.id} className={`pill${filtro === f.id ? " active" : ""}`} onClick={() => setFiltro(f.id)}>
              {f.label}
              <span className="pill-count">{eventos.filter(f.inclui).length}</span>
            </button>
          ))}
        </div>
        <button className="btn primary" onClick={adicionar} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={15} /> Novo evento
        </button>
      </div>

      {lista.length === 0 ? (
        <div className="eventos-vazio">
          <CalendarDays size={28} />
          <div>Nenhum evento neste filtro.</div>
        </div>
      ) : (
        <div className="eventos-grid">
          {lista.map((e) =>
            e.id === aberto ? (
              <EventoAberto key={e.id} evento={e} onChange={atualizar} onFechar={() => setAberto(null)} onRemover={() => remover(e)} />
            ) : (
              <EventoCartao key={e.id} evento={e} onAbrir={() => setAberto(e.id)} />
            )
          )}
        </div>
      )}
    </section>
  );
}

function StatusLinha({ evento }) {
  const cor = tagColor(evento.status);
  return (
    <div className="evento-status">
      <span className={`dot ${cor}`} />
      <span className={`evento-status-txt ${cor}`}>{evento.status}</span>
      <span className="evento-tipo">· {evento.tipo}</span>
    </div>
  );
}

function Convite({ url, alt }) {
  return url ? (
    <div className="evento-foto"><img src={url} alt={alt} /></div>
  ) : (
    <div className="evento-foto vazia"><CalendarDays size={26} /></div>
  );
}

function EventoCartao({ evento: e, onAbrir }) {
  const temas = (e.programacao || []).length;
  const empresas = (e.empresas || []).length;
  return (
    <button className="card evento-card" onClick={onAbrir}>
      <Convite url={e.convite} alt={e.evento} />
      <div className="evento-card-corpo">
        <StatusLinha evento={e} />
        <div className="evento-nome">{e.evento || "(sem nome)"}</div>
        {formatarData(e) && (
          <div className="evento-info"><CalendarDays size={12} />{formatarData(e)}{e.horaInicio ? ` · ${horario(e)}` : ""}</div>
        )}
        {e.local && <div className="evento-info"><MapPin size={12} /><span className="ellipsis">{e.local}</span></div>}
        {(temas > 0 || empresas > 0) && (
          <div className="evento-chips">
            {temas > 0 && <span>{temas} tema{temas === 1 ? "" : "s"}</span>}
            {empresas > 0 && <span>{empresas} empresa{empresas === 1 ? "" : "s"}</span>}
          </div>
        )}
      </div>
    </button>
  );
}

function EventoAberto({ evento: e, onChange, onFechar, onRemover }) {
  const [aba, setAba] = useState("info");
  const set = (campo, valor) => onChange({ ...e, [campo]: valor });
  const programacao = e.programacao || [];
  const empresas = e.empresas || [];
  const confirmadas = empresas.filter((x) => x.status === "Confirmada").length;
  const duracaoCalculada = duracaoEntre(e.horaInicio, e.horaFim);
  const [erroImagem, setErroImagem] = useState("");

  const enviarConvite = async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    ev.target.value = "";
    if (!file) return;
    try {
      setErroImagem("");
      set("convite", await reduzirImagem(file));
    } catch (err) {
      setErroImagem(err.message);
    }
  };

  const campo = (nome, label, props = {}) => (
    <div className={`field${props.full ? " full" : ""}`}>
      <label htmlFor={`ev-${e.id}-${nome}`}>{label}</label>
      {props.type === "select" ? (
        <select id={`ev-${e.id}-${nome}`} value={e[nome] || ""} onChange={(x) => set(nome, x.target.value)}>
          {!props.semVazio && <option value="">—</option>}
          {props.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : props.type === "textarea" ? (
        <textarea id={`ev-${e.id}-${nome}`} value={e[nome] || ""} placeholder={props.placeholder} onChange={(x) => set(nome, x.target.value)} />
      ) : (
        <input id={`ev-${e.id}-${nome}`} type={props.type || "text"} value={e[nome] || ""} placeholder={props.placeholder} onChange={(x) => set(nome, x.target.value)} />
      )}
    </div>
  );

  const abas = [
    { id: "info", label: "Informações" },
    { id: "programacao", label: "Programação", count: programacao.length },
    { id: "empresas", label: "Empresas", count: empresas.length },
  ];

  return (
    <div className="card evento-aberto ccib-fade-in">
      <div className="evento-aberto-topo">
        <Convite url={e.convite} alt={e.evento} />
        <div className="evento-aberto-cabecalho">
          <StatusLinha evento={e} />
          <div className="evento-nome grande">{e.evento || "(sem nome)"}</div>
          <div className="evento-resumo">
            {formatarData(e) && <span><CalendarDays size={12} />{formatarData(e)}</span>}
            {horario(e) && <span><Clock size={12} />{horario(e)}{(e.duracao || duracaoCalculada) ? ` (${e.duracao || duracaoCalculada})` : ""}</span>}
            {e.local && <span><MapPin size={12} />{e.local}</span>}
            {empresas.length > 0 && <span>{confirmadas} de {empresas.length} empresas confirmadas</span>}
          </div>
        </div>
        <div className="evento-aberto-acoes">
          <button className="icon-btn" title="Remover evento" onClick={onRemover}><Trash2 size={15} /></button>
          <button className="btn ghost" onClick={onFechar} style={{ display: "flex", alignItems: "center", gap: 6 }}><X size={14} /> Fechar</button>
        </div>
      </div>

      <div className="evento-abas" role="tablist">
        {abas.map((a) => (
          <button key={a.id} role="tab" aria-selected={aba === a.id} className={`evento-aba${aba === a.id ? " active" : ""}`} onClick={() => setAba(a.id)}>
            {a.label}
            {a.count !== undefined && <span className="pill-count">{a.count}</span>}
          </button>
        ))}
      </div>

      <div className="evento-aba-corpo">
        {aba === "info" && (
          <div className="form-grid">
            {campo("evento", "Nome do evento", { full: true, placeholder: "Ex: Jornada do Compliance 2026" })}
            {campo("tipo", "Tipo", { type: "select", options: TIPOS_EVENTO, semVazio: true })}
            {campo("status", "Status", { type: "select", options: STATUS_EVENTO, semVazio: true })}
            {campo("data", "Data", { type: "date" })}
            {campo("dataPrevista", "Data prevista (se ainda não houver data exata)", { placeholder: "Ex: Novembro/2026" })}
            {campo("horaInicio", "Hora de início", { type: "time" })}
            {campo("horaFim", "Hora de término", { type: "time" })}
            {campo("duracao", "Tempo de duração", { placeholder: duracaoCalculada ? `Calculado: ${duracaoCalculada}` : "Ex: 3 horas, 2 dias" })}
            {campo("formato", "Formato", { type: "select", options: FORMATOS_EVENTO })}
            {campo("local", "Local / link", { full: true, placeholder: "Endereço ou link da transmissão" })}
            {campo("publico", "Público-alvo", { placeholder: "Ex: associados, jurídico, RH" })}
            {campo("responsavel", "Responsável na CCIB")}
            {campo("inscricao", "Link de inscrição", { placeholder: "https://..." })}
            {campo("meta", "Meta de participantes", { placeholder: "Ex: 80 pessoas" })}
            {campo("objetivo", "Objetivo do evento", { type: "textarea", full: true })}
            {e.status === "Realizado" && campo("participantes", "Participantes (resumo)", { type: "textarea", full: true })}
            {e.status === "Realizado" && campo("resultado", "Resultado", { type: "textarea", full: true })}
            {campo("observacoes", "Observações", { type: "textarea", full: true })}
            <div className="field full">
              <label>Convite / imagem do evento</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <label className="btn ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <ImagePlus size={14} /> {e.convite ? "Trocar imagem" : "Enviar imagem"}
                  <input type="file" accept="image/*" onChange={enviarConvite} style={{ display: "none" }} />
                </label>
                {e.convite && <button className="btn ghost" onClick={() => set("convite", "")}>Remover imagem</button>}
                {erroImagem && <span style={{ color: "var(--red)", fontSize: 12.5 }}>{erroImagem}</span>}
              </div>
            </div>
          </div>
        )}
        {aba === "programacao" && (
          <SheetTable
            columns={COLUNAS_PROGRAMACAO}
            rows={programacao}
            onChange={(l) => set("programacao", l)}
            newRow={() => ({ id: newId("pg"), horario: "", tema: "", palestrante: "", empresa: "", duracao: "" })}
            addLabel="+ Adicionar tema"
            emptyText="Nenhum tema cadastrado ainda."
            minWidth={820}
          />
        )}
        {aba === "empresas" && (
          <SheetTable
            columns={COLUNAS_EMPRESAS}
            rows={empresas}
            onChange={(l) => set("empresas", l)}
            newRow={() => ({ id: newId("em"), empresa: "", participacao: "Participante", contato: "", emailTelefone: "", status: "Convidada" })}
            addLabel="+ Adicionar empresa"
            emptyText="Nenhuma empresa cadastrada ainda."
            minWidth={860}
          />
        )}
      </div>
    </div>
  );
}
