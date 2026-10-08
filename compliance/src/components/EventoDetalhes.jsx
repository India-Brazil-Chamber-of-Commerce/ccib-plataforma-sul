import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import SheetTable from "./SheetTable";
import { FORMATOS_EVENTO, PARTICIPACOES_EMPRESA, STATUS_EMPRESA_EVENTO } from "../constants";
import { newId } from "../lib/format";

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

// Ficha de um evento, fechada por padrão: o cabeçalho mostra o resumo e, ao abrir,
// aparecem três seções (também recolhíveis): informações gerais, programação e empresas.
export default function EventoDetalhes({ evento, onChange }) {
  const [aberta, setAberta] = useState(false);
  const set = (campo, valor) => onChange({ ...evento, [campo]: valor });
  const programacao = evento.programacao || [];
  const empresas = evento.empresas || [];
  const confirmadas = empresas.filter((e) => e.status === "Confirmada").length;
  const duracaoCalculada = duracaoEntre(evento.horaInicio, evento.horaFim);
  const duracao = evento.duracao || duracaoCalculada;
  const horario = evento.horaInicio ? (evento.horaFim ? `${evento.horaInicio} às ${evento.horaFim}` : `a partir das ${evento.horaInicio}`) : "";

  const campo = (nome, label, props = {}) => (
    <div className={`field${props.full ? " full" : ""}`}>
      <label htmlFor={`ev-${evento.id}-${nome}`}>{label}</label>
      {props.type === "select" ? (
        <select id={`ev-${evento.id}-${nome}`} value={evento[nome] || ""} onChange={(e) => set(nome, e.target.value)}>
          <option value="">—</option>
          {props.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : props.type === "textarea" ? (
        <textarea id={`ev-${evento.id}-${nome}`} value={evento[nome] || ""} placeholder={props.placeholder} onChange={(e) => set(nome, e.target.value)} />
      ) : (
        <input id={`ev-${evento.id}-${nome}`} type={props.type || "text"} value={evento[nome] || ""} placeholder={props.placeholder} onChange={(e) => set(nome, e.target.value)} />
      )}
    </div>
  );

  const resumo = [
    evento.data,
    horario,
    duracao && `duração ${duracao}`,
    evento.formato,
    `${programacao.length} tema${programacao.length === 1 ? "" : "s"}`,
    `${empresas.length} empresa${empresas.length === 1 ? "" : "s"} (${confirmadas} confirmada${confirmadas === 1 ? "" : "s"})`,
  ].filter(Boolean);

  return (
    <div className={`card evento-ficha${aberta ? " aberta" : ""}`}>
      <button className="evento-ficha-head" onClick={() => setAberta(!aberta)} aria-expanded={aberta}>
        <div style={{ minWidth: 0 }}>
          <div className="evento-ficha-nome">{evento.evento || "(sem nome)"}</div>
          <div className="evento-ficha-resumo">
            {resumo.map((r) => <span key={r}>{r}</span>)}
          </div>
        </div>
        <span className="evento-ficha-acao">
          {aberta ? "Fechar ficha" : "Abrir ficha"}
          <ChevronDown size={16} className="chev" />
        </span>
      </button>

      {aberta && (
        <div className="evento-ficha-corpo ccib-fade-in">
          <Secao titulo="Informações gerais" contagem={[evento.data, horario].filter(Boolean).join(" · ") || "a preencher"}>
            <div className="form-grid" style={{ padding: "4px 20px 8px 20px" }}>
              {campo("data", "Data", { placeholder: "dd/mm/aaaa" })}
              {campo("formato", "Formato", { type: "select", options: FORMATOS_EVENTO })}
              {campo("horaInicio", "Hora de início", { type: "time" })}
              {campo("horaFim", "Hora de término", { type: "time" })}
              {campo("duracao", "Tempo de duração", { placeholder: duracaoCalculada ? `Calculado: ${duracaoCalculada}` : "Ex: 3 horas, 2 dias" })}
              {campo("local", "Local / link", { placeholder: "Endereço ou link da transmissão" })}
              {campo("publico", "Público-alvo", { placeholder: "Ex: associados, jurídico, RH" })}
              {campo("responsavel", "Responsável na CCIB")}
              {campo("inscricao", "Link de inscrição", { placeholder: "https://..." })}
              {campo("meta", "Meta de participantes", { placeholder: "Ex: 80 pessoas" })}
              {campo("objetivo", "Objetivo do evento", { type: "textarea", full: true })}
              {campo("observacoes", "Observações", { type: "textarea", full: true })}
            </div>
          </Secao>

          <Secao titulo="Programação e temas" contagem={`${programacao.length} tema${programacao.length === 1 ? "" : "s"}`}>
            <SheetTable
              columns={COLUNAS_PROGRAMACAO}
              rows={programacao}
              onChange={(l) => set("programacao", l)}
              newRow={() => ({ id: newId("pg"), horario: "", tema: "", palestrante: "", empresa: "", duracao: "" })}
              addLabel="+ Adicionar tema"
              emptyText="Nenhum tema cadastrado ainda."
              minWidth={820}
            />
          </Secao>

          <Secao titulo="Empresas participantes" contagem={`${empresas.length} empresa${empresas.length === 1 ? "" : "s"} · ${confirmadas} confirmada${confirmadas === 1 ? "" : "s"}`}>
            <SheetTable
              columns={COLUNAS_EMPRESAS}
              rows={empresas}
              onChange={(l) => set("empresas", l)}
              newRow={() => ({ id: newId("em"), empresa: "", participacao: "Participante", contato: "", emailTelefone: "", status: "Convidada" })}
              addLabel="+ Adicionar empresa"
              emptyText="Nenhuma empresa cadastrada ainda."
              minWidth={860}
            />
          </Secao>
        </div>
      )}
    </div>
  );
}

function Secao({ titulo, contagem, children }) {
  const [aberta, setAberta] = useState(false);
  return (
    <div className={`evento-secao${aberta ? " aberta" : ""}`}>
      <button className="evento-secao-head" onClick={() => setAberta(!aberta)} aria-expanded={aberta}>
        <span className="section-title" style={{ margin: 0 }}>{titulo}</span>
        <span className="evento-secao-contagem">
          {contagem}
          <ChevronDown size={14} className="chev" />
        </span>
      </button>
      {aberta && <div className="evento-secao-corpo ccib-fade-in">{children}</div>}
    </div>
  );
}
