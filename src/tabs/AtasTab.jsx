import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Plus, Trash2, Copy, Printer, Check, ChevronRight, Search, AlertTriangle, ClipboardList, CalendarClock, Building2,
  Pencil, X, Target, MessageSquare, Lightbulb, Handshake, ListChecks, Lock, CalendarDays, Clock, MapPin, User, Users, RotateCcw,
} from "lucide-react";
import { RESPONSAVEIS, STORAGE_ATAS, STORAGE_ATAS_SEMENTES } from "../constants";
import { SEED_ATAS, ACRESCENTAR_ATAS, SUBSTITUIR_ATAS } from "../data/seedAtas";
import { filterInputStyle } from "../styles";
import { SectionTitle } from "../components/ui";
import { useListaCompartilhada } from "../lib/useListaCompartilhada";

const mono = "'IBM Plex Mono', monospace";
const serif = "'Fraunces', serif";
const sans = "'IBM Plex Sans', sans-serif";

export const TIPOS_ATA = ["Prospecção", "Associação", "Renovação", "Patrocínio", "Serviços", "Parceria", "Missão / delegação", "Follow-up", "Outro"];

export const STATUS_ATA = {
  rascunho: { label: "Rascunho", color: "#B8752E" },
  finalizada: { label: "Finalizada", color: "#0E7C3A" },
};

// Seções de texto da ata, na ordem em que aparecem na tela, na cópia e na impressão
const SECOES = [
  { id: "objetivo", label: "Objetivo da reunião", curto: "Objetivo", icone: Target, cor: "#2F6FB0", dica: "Por que a reunião aconteceu e o que se esperava dela." },
  { id: "pontos", label: "O que foi conversado", curto: "Conversa", icone: MessageSquare, cor: "#0B2545", dica: "Escreva um assunto por linha. Cada linha vira um tópico." },
  { id: "oportunidades", label: "Oportunidades para a Câmara", curto: "Oportunidades", icone: Lightbulb, cor: "#0E7C3A", dica: "Associação, patrocínio, serviços, eventos, missões, contatos na Índia... Uma por linha." },
  { id: "decisoes", label: "O que ficou combinado", curto: "Combinados", icone: Handshake, cor: "#6A5ACD", dica: "Acordos entre as partes. Um por linha." },
  { id: "proximos", label: "Próximos passos", curto: "Próximos", icone: ListChecks, cor: "#2F6FB0", dica: "Um por linha. Se quiser, comece com quem cuida, ex.: Gustavo: enviar a proposta por e-mail." },
  { id: "observacoes", label: "Anotações internas", curto: "Internas", icone: Lock, cor: "#B8752E", dica: "Só a equipe vê. Não entram no texto copiado nem no PDF." },
];

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const QUEM_SUGESTOES = ["Bianca", "Gustavo", "Bianca e Gustavo", "Empresa"];

const novoId = (p) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const normalizar = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const somaDias = (iso, n) => {
  const [a, m, d] = iso.split("-").map(Number);
  const r = new Date(a, m - 1, d + n);
  return `${r.getFullYear()}-${String(r.getMonth() + 1).padStart(2, "0")}-${String(r.getDate()).padStart(2, "0")}`;
};
const dataBR = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : "");
const dataCurta = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : "");
const dataLonga = (iso) => {
  if (!iso) return "";
  const [a, m, d] = iso.split("-").map(Number);
  const dia = DIAS[new Date(a, m - 1, d).getDay()];
  return `${dia}, ${d} de ${["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"][m - 1]} de ${a}`;
};
const nomeResp = (id) => (RESPONSAVEIS.find((r) => r.id === id) || {}).label || "";
const corResp = (id) => (RESPONSAVEIS.find((r) => r.id === id) || {}).accent || "#8992A6";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const linhas = (t) => (t || "").split("\n").map((l) => l.replace(/^\s*[-•*]\s*/, "").trim()).filter(Boolean);
const pessoas = (t) => (t || "").split(/[,;\n]/).map((p) => p.trim()).filter(Boolean);
const acoesValidas = (ata) => (ata.acoes || []).filter((a) => a.texto && a.texto.trim());
// Atas antigas guardavam os próximos passos como lista de tarefas; aqui viram texto simples
const comProximos = (ata) =>
  ata.proximos !== undefined ? ata : { ...ata, proximos: acoesValidas(ata).map((a) => `${a.quem ? `${a.quem}: ` : ""}${a.texto.trim()}`).join("\n") };

export function novaAta(base = {}) {
  return {
    id: novoId("ata"),
    titulo: "",
    empresa: "",
    data: hojeISO(),
    horario: "",
    tipo: "Prospecção",
    responsavel: "ambos",
    participantesCcib: "",
    participantesEmpresa: "",
    local: "",
    objetivo: "",
    pontos: "",
    oportunidades: "",
    decisoes: "",
    proximos: "",
    observacoes: "",
    proximoContato: "",
    status: "rascunho",
    reuniaoId: "",
    criadaEm: Date.now(),
    atualizadaEm: Date.now(),
    ...base,
  };
}

// Monta uma ata a partir de uma reunião da aba Reuniões
export function ataDaReuniao(m) {
  return novaAta({
    titulo: m.nome || "",
    data: m.data || hojeISO(),
    horario: m.horario && m.horario !== "Dia inteiro" ? m.horario : "",
    responsavel: m.responsavel || "ambos",
    participantesEmpresa: m.participantes || "",
    local: m.local || "",
    reuniaoId: m.id,
  });
}


// Texto corrido para colar em e-mail ou Teams (sem as anotações internas)
function textoAta(ata) {
  const L = [];
  L.push("ATA DE REUNIÃO");
  L.push("Câmara de Comércio Índia Brasil (CCIB) · Regional Sul");
  L.push("");
  if (ata.titulo) L.push(`Reunião: ${ata.titulo}`);
  if (ata.empresa) L.push(`Empresa: ${ata.empresa}`);
  L.push(`Data: ${dataBR(ata.data)}${ata.horario ? `, ${ata.horario}` : ""}`);
  if (ata.local) L.push(`Local: ${ata.local}`);
  if (ata.participantesCcib) L.push(`Participantes CCIB: ${ata.participantesCcib}`);
  if (ata.participantesEmpresa) L.push(`Participantes da empresa: ${ata.participantesEmpresa}`);
  SECOES.filter((s) => s.id !== "observacoes").forEach((s) => {
    const ls = linhas(ata[s.id]);
    if (!ls.length) return;
    L.push("");
    L.push(s.label.toUpperCase());
    ls.forEach((l) => L.push(`- ${l}`));
  });
  if (ata.proximoContato) {
    L.push("");
    L.push(`Próximo contato: ${dataBR(ata.proximoContato)}`);
  }
  return L.join("\n");
}

function htmlAta(ata) {
  const bloco = (titulo, itens) =>
    itens.length ? `<h2>${esc(titulo)}</h2><ul>${itens.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "";
  const meta = [
    ["Empresa", ata.empresa],
    ["Data", `${dataBR(ata.data)}${ata.horario ? `, ${ata.horario}` : ""}`],
    ["Local", ata.local],
    ["Participantes CCIB", ata.participantesCcib],
    ["Participantes da empresa", ata.participantesEmpresa],
  ].filter(([, v]) => v);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Ata · ${esc(ata.titulo || ata.empresa || "Reunião")}</title>
<style>
@page { size: A4; margin: 16mm 16mm 14mm; }
body { font-family: "IBM Plex Sans", Arial, sans-serif; color: #1B2438; font-size: 11.5pt; line-height: 1.45; margin: 0; }
.faixa { height: 5px; background: linear-gradient(to right, #FF9933 0 33.3%, #FFFFFF 33.3% 66.6%, #0E7C3A 66.6%); border: 1px solid #E3E6EC; margin-bottom: 14px; }
.org { font-size: 8.5pt; letter-spacing: .14em; text-transform: uppercase; color: #B8752E; font-weight: 600; }
h1 { font-family: Georgia, serif; font-size: 18pt; color: #0B2545; margin: 4px 0 12px; }
.meta { display: grid; grid-template-columns: 170px 1fr; gap: 3px 12px; font-size: 10.5pt; margin-bottom: 8px; }
.meta b { color: #566175; font-weight: 600; }
h2 { font-size: 10pt; letter-spacing: .08em; text-transform: uppercase; color: #0E7C3A; border-bottom: 1px solid #E3E6EC; padding-bottom: 3px; margin: 16px 0 6px; }
ul { margin: 0; padding-left: 18px; } li { margin: 2px 0; }
table { width: 100%; border-collapse: collapse; font-size: 10.5pt; }
th, td { text-align: left; border-bottom: 1px solid #E3E6EC; padding: 5px 6px; vertical-align: top; }
th { font-size: 8.5pt; text-transform: uppercase; letter-spacing: .06em; color: #8992A6; }
.rodape { margin-top: 22px; font-size: 8.5pt; color: #8992A6; border-top: 1px solid #E3E6EC; padding-top: 6px; }
</style></head><body>
<div class="faixa"></div>
<div class="org">Câmara de Comércio Índia Brasil (CCIB) · Regional Sul</div>
<h1>Ata de reunião${ata.titulo ? `<br><span style="font-size:13pt;color:#566175">${esc(ata.titulo)}</span>` : ""}</h1>
<div class="meta">${meta.map(([k, v]) => `<b>${esc(k)}</b><span>${esc(v)}</span>`).join("")}</div>
${SECOES.filter((s) => s.id !== "observacoes").map((s) => bloco(s.label, linhas(ata[s.id]))).join("")}
${ata.proximoContato ? `<h2>Próximo contato</h2><div>${esc(dataBR(ata.proximoContato))}</div>` : ""}
<div class="rodape">India Brazil Chamber of Commerce (IBCC) · Regional Sul</div>
<script>window.onload = () => setTimeout(() => window.print(), 300);</script>
</body></html>`;
}

function imprimirAta(ata) {
  const w = window.open("", "_blank");
  if (!w) { window.alert("O navegador bloqueou a nova janela. Permita pop-ups para esta página e tente de novo."); return; }
  w.document.open();
  w.document.write(htmlAta(ata));
  w.document.close();
}

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
  } catch (e) {
    const t = document.createElement("textarea");
    t.value = texto;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
}

// ---------- peças visuais ----------

const campo = { ...filterInputStyle, width: "100%", boxSizing: "border-box", background: "#FFFFFF", fontSize: 13.5 };
const rotulo = { fontSize: 12, fontWeight: 600, color: "#566175", marginBottom: 6, display: "block" };
const botao = { display: "inline-flex", alignItems: "center", gap: 6, background: "#FFFFFF", color: "#0B2545", border: "1px solid #D6DAE2", borderRadius: 8, padding: "7px 13px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: sans };
const botaoPrincipal = { ...botao, background: "#0B2545", color: "#FFFFFF", border: "1px solid #0B2545" };
const botaoVerde = { ...botao, background: "#0E7C3A", color: "#FFFFFF", border: "1px solid #0E7C3A" };

function Pilula({ cor = "#566175", fundo, icone: Icone, children, title }) {
  return (
    <span title={title} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: cor, background: fundo || `${cor}14`, borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap", fontWeight: 500 }}>
      {Icone && <Icone size={12} />}
      {children}
    </span>
  );
}

// Caixa de texto que cresce sozinha conforme o conteúdo
function TextoLivre({ value, onChange, placeholder, fundo = "#FFFFFF", min = 76 }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(min, el.scrollHeight + 2)}px`;
  }, [value, min]);
  return (
    <textarea
      ref={ref}
      className="ccib-input"
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      rows={3}
      style={{ ...campo, resize: "none", overflow: "hidden", lineHeight: 1.6, fontFamily: sans, background: fundo, padding: "10px 12px" }}
    />
  );
}

// ---------- leitura da ata ----------

function SecaoLeitura({ secao, ata, editar }) {
  const Icone = secao.icone;
  const itens = linhas(ata[secao.id]);
  const interna = secao.id === "observacoes";
  if (!itens.length && interna) return null;
  return (
    <div style={{ background: interna ? "#FFFBF4" : "#FFFFFF", border: `1px solid ${interna ? "#F1DEC2" : "#E8EBF0"}`, borderRadius: 12, padding: "14px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: itens.length ? 10 : 4 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: `${secao.cor}14`, color: secao.cor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icone size={15} />
        </span>
        <span style={{ fontFamily: serif, fontSize: 16, fontWeight: 500, color: "#0B2545" }}>{secao.label}</span>
        {interna && <span style={{ fontSize: 11.5, color: "#B8752E", marginLeft: 4 }}>só a equipe vê</span>}
      </div>
      {itens.length ? (
        itens.length === 1 && secao.id === "objetivo" ? (
          <p style={{ margin: "0 0 0 37px", fontSize: 14, lineHeight: 1.6, color: "#1B2438" }}>{itens[0]}</p>
        ) : (
          <ul style={{ margin: 0, padding: "0 0 0 37px", listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
            {itens.map((t, i) => (
              <li key={i} style={{ position: "relative", fontSize: 14, lineHeight: 1.55, color: "#1B2438" }}>
                <span style={{ position: "absolute", left: -15, top: 9, width: 6, height: 6, borderRadius: 99, background: secao.cor, opacity: 0.7 }} />
                {t}
              </li>
            ))}
          </ul>
        )
      ) : (
        <button onClick={editar} style={{ marginLeft: 37, background: "transparent", border: "none", color: "#8992A6", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: sans }}>
          Nada registrado ainda. <span style={{ color: "#2F6FB0", textDecoration: "underline" }}>Adicionar</span>
        </button>
      )}
    </div>
  );
}

function Pessoas({ titulo, texto, cor }) {
  const lista = pessoas(texto);
  return (
    <div style={{ flex: "1 1 240px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#8992A6", marginBottom: 6 }}>{titulo}</div>
      {lista.length ? (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {lista.map((p) => (
            <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, background: "#FFFFFF", border: "1px solid #E3E6EC", borderRadius: 999, padding: "3px 10px 3px 4px", color: "#1B2438" }}>
              <span style={{ width: 20, height: 20, borderRadius: 99, background: `${cor}1A`, color: cor, fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {p.replace(/[^A-Za-zÀ-ÿ ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase()}
              </span>
              {p}
            </span>
          ))}
        </div>
      ) : (
        <span style={{ fontSize: 13, color: "#B7BEC9" }}>Não informado</span>
      )}
    </div>
  );
}

function LeituraAta({ ata, hoje, editar }) {
  const st = STATUS_ATA[ata.status] || STATUS_ATA.rascunho;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "#FFFFFF", border: "1px solid #E8EBF0", borderRadius: 12, padding: "16px 18px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {ata.data && <Pilula icone={CalendarDays} cor="#0B2545">{dataLonga(ata.data)}</Pilula>}
          {ata.horario && <Pilula icone={Clock} cor="#0B2545">{ata.horario}</Pilula>}
          {ata.local && <Pilula icone={MapPin} cor="#0B2545">{ata.local}</Pilula>}
          {ata.tipo && <Pilula cor="#6A5ACD">{ata.tipo}</Pilula>}
          <Pilula cor={corResp(ata.responsavel)}>Responsável: {nomeResp(ata.responsavel)}</Pilula>
          <Pilula cor={st.color}>{st.label}</Pilula>
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <Pessoas titulo="Pela CCIB" texto={ata.participantesCcib} cor="#0E7C3A" />
          <Pessoas titulo={ata.empresa ? `Por ${ata.empresa}` : "Pela empresa"} texto={ata.participantesEmpresa} cor="#B8752E" />
        </div>
        {ata.proximoContato && (
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: ata.proximoContato < hoje ? "#C1502E" : "#0B2545" }}>
            <CalendarClock size={15} /> Próximo contato: <b>{dataLonga(ata.proximoContato)}</b>
          </div>
        )}
      </div>
      {SECOES.filter((s) => s.id !== "observacoes").map((s) => <SecaoLeitura key={s.id} secao={s} ata={ata} editar={editar} />)}
      <SecaoLeitura secao={SECOES.find((s) => s.id === "observacoes")} ata={ata} editar={editar} />
    </div>
  );
}

// ---------- edição da ata ----------

function Bloco({ numero, titulo, children }) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E8EBF0", borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ width: 24, height: 24, borderRadius: 99, background: "#0B2545", color: "#FFFFFF", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{numero}</span>
        <span style={{ fontFamily: serif, fontSize: 16, fontWeight: 500, color: "#0B2545" }}>{titulo}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );
}

function Campo({ label, children, flex = 1, min = 160 }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", flex, minWidth: min }}>
      <span style={rotulo}>{label}</span>
      {children}
    </label>
  );
}

function EdicaoAta({ ata, set, hoje, concluir }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Bloco numero={1} titulo="Sobre a reunião">
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Campo label="Empresa ou instituição" flex={1} min={220}>
            <input className="ccib-input" style={campo} list="ccib-atas-empresas" value={ata.empresa} placeholder="Com quem foi a reunião?" onChange={(e) => set({ empresa: e.target.value })} />
          </Campo>
          <Campo label="Título" flex={2} min={240}>
            <input className="ccib-input" style={campo} value={ata.titulo} placeholder="Ex.: Apresentação da CCIB" onChange={(e) => set({ titulo: e.target.value })} />
          </Campo>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Campo label="Data" min={150} flex={0}>
            <input type="date" className="ccib-input" style={{ ...campo, colorScheme: "light", width: 170 }} value={ata.data} onChange={(e) => set({ data: e.target.value })} />
          </Campo>
          <Campo label="Horário" min={130} flex={0}>
            <input className="ccib-input" style={{ ...campo, width: 150 }} value={ata.horario} placeholder="10:00 – 11:00" onChange={(e) => set({ horario: e.target.value })} />
          </Campo>
          <Campo label="Onde" min={180}>
            <input className="ccib-input" style={campo} value={ata.local} placeholder="Presencial, Teams..." onChange={(e) => set({ local: e.target.value })} />
          </Campo>
        </div>
        <div>
          <span style={rotulo}>Tipo de reunião</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TIPOS_ATA.map((t) => (
              <button
                key={t}
                onClick={() => set({ tipo: t })}
                style={{ fontSize: 12.5, borderRadius: 99, padding: "5px 12px", cursor: "pointer", fontFamily: sans, border: `1px solid ${ata.tipo === t ? "#6A5ACD" : "#D6DAE2"}`, background: ata.tipo === t ? "#6A5ACD" : "#FFFFFF", color: ata.tipo === t ? "#FFFFFF" : "#566175" }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span style={rotulo}>Responsável na CCIB</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {RESPONSAVEIS.map((r) => (
              <button
                key={r.id}
                onClick={() => set({ responsavel: r.id })}
                style={{ fontSize: 12.5, borderRadius: 99, padding: "5px 12px", cursor: "pointer", fontFamily: sans, border: `1px solid ${ata.responsavel === r.id ? r.accent : "#D6DAE2"}`, background: ata.responsavel === r.id ? r.accent : "#FFFFFF", color: ata.responsavel === r.id ? "#FFFFFF" : "#566175" }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Campo label="Quem participou pela CCIB">
            <input className="ccib-input" style={campo} value={ata.participantesCcib} placeholder="Bianca Guimarães, Gustavo Bastos" onChange={(e) => set({ participantesCcib: e.target.value })} />
          </Campo>
          <Campo label="Quem participou pela empresa">
            <input className="ccib-input" style={campo} value={ata.participantesEmpresa} placeholder="Nome (cargo), separados por vírgula" onChange={(e) => set({ participantesEmpresa: e.target.value })} />
          </Campo>
        </div>
      </Bloco>

      <Bloco numero={2} titulo="O que aconteceu">
        {SECOES.map((s) => {
          const Icone = s.icone;
          return (
            <div key={s.id}>
              <span style={{ ...rotulo, display: "flex", alignItems: "center", gap: 6 }}>
                <Icone size={14} color={s.cor} /> {s.label}
              </span>
              <TextoLivre value={ata[s.id]} placeholder={s.dica} fundo={s.id === "observacoes" ? "#FFFBF4" : "#FFFFFF"} min={s.id === "pontos" ? 110 : 64} onChange={(e) => set({ [s.id]: e.target.value })} />
            </div>
          );
        })}
      </Bloco>

      <Bloco numero={3} titulo="Próximo contato">
        <Campo label="Quando falar de novo com a empresa (opcional)" flex={0} min={170}>
          <input type="date" className="ccib-input" style={{ ...campo, colorScheme: "light", width: 180 }} value={ata.proximoContato} onChange={(e) => set({ proximoContato: e.target.value })} />
        </Campo>
      </Bloco>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={concluir} className="ccib-btn" style={botaoPrincipal}>
          <Check size={15} /> Concluir edição
        </button>
      </div>
    </div>
  );
}

// ---------- ata aberta ----------

function AtaAberta({ ata, mudar, excluir, fechar, hoje, editando, setEditando, abrirEmpresaPorNome }) {
  const [copiado, setCopiado] = useState(false);
  const set = (patch) => mudar({ ...patch, atualizadaEm: Date.now() });
  const copiar = async () => {
    await copiarTexto(textoAta(ata));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };
  const temEmpresa = abrirEmpresaPorNome(ata.empresa, true);
  return (
    <div className="ccib-fade-in" style={{ borderTop: "1px solid #EEF1F5", padding: "14px 16px 18px", background: "#F6F7F9" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        {editando ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#B8752E", fontWeight: 600 }}>
            <Pencil size={14} /> Editando a ata (tudo é salvo automaticamente)
          </span>
        ) : (
          <>
            <button onClick={() => setEditando(true)} className="ccib-btn" style={botaoPrincipal}>
              <Pencil size={14} /> Editar
            </button>
            <button onClick={copiar} className="ccib-btn" style={botao} title="Copia a ata em texto para colar em e-mail ou Teams (sem as anotações internas)">
              {copiado ? <Check size={14} /> : <Copy size={14} />} {copiado ? "Copiada!" : "Copiar texto"}
            </button>
            <button onClick={() => imprimirAta(ata)} className="ccib-btn" style={botao} title="Abre a ata para imprimir ou salvar em PDF (sem as anotações internas)">
              <Printer size={14} /> PDF
            </button>
            {temEmpresa && (
              <button onClick={() => abrirEmpresaPorNome(ata.empresa)} className="ccib-btn" style={botao} title="Abrir a ficha da empresa na aba Empresas">
                <Building2 size={14} /> Ver empresa
              </button>
            )}
            {ata.status === "finalizada" ? (
              <button onClick={() => set({ status: "rascunho" })} className="ccib-btn" style={botao} title="Volta a ata para rascunho">
                <RotateCcw size={14} /> Reabrir
              </button>
            ) : (
              <button onClick={() => set({ status: "finalizada" })} className="ccib-btn" style={botaoVerde} title="Marca a ata como revisada e finalizada">
                <Check size={14} /> Finalizar
              </button>
            )}
          </>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button
            onClick={() => { if (window.confirm("Excluir esta ata? Essa ação não pode ser desfeita.")) excluir(); }}
            title="Excluir ata"
            className="ccib-icon-btn"
            style={{ ...botao, color: "#8992A6", padding: "7px 9px" }}
          >
            <Trash2 size={14} />
          </button>
          <button onClick={fechar} title="Fechar" className="ccib-btn" style={{ ...botao, padding: "7px 9px" }}>
            <X size={14} />
          </button>
        </div>
      </div>
      {editando ? (
        <EdicaoAta ata={ata} set={set} hoje={hoje} concluir={() => setEditando(false)} />
      ) : (
        <LeituraAta ata={ata} hoje={hoje} editar={() => setEditando(true)} />
      )}
    </div>
  );
}

// ---------- aba ----------

export default function AtasTab({ members = [], meetings = [], abrirEmpresa, novaDe, limparNovaDe }) {
  const [atas, setAtas] = useListaCompartilhada(STORAGE_ATAS);
  const [sementesAplicadas, setSementesAplicadas] = useListaCompartilhada(STORAGE_ATAS_SEMENTES);
  const [aberta, setAberta] = useState(null);
  const [editando, setEditando] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroResp, setFiltroResp] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [reuniaoBase, setReuniaoBase] = useState("");
  const hoje = hojeISO();
  const lista = useMemo(() => (atas || []).map(comProximos), [atas]);

  const abrir = (id, emEdicao = false) => {
    setAberta(id);
    setEditando(emEdicao);
  };
  const criar = (ata) => {
    setAtas([ata, ...lista]);
    abrir(ata.id, true);
  };
  const mudar = (id, patch) => setAtas(lista.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const excluir = (id) => {
    setAtas(lista.filter((a) => a.id !== id));
    abrir(null);
  };

  // Atas registradas pela equipe no código entram uma única vez (depois valem as edições e exclusões feitas aqui)
  useEffect(() => {
    if (atas === null || sementesAplicadas === null) return;
    const vistas = new Set(sementesAplicadas);
    const ids = new Set(atas.map((a) => a.id));
    const reunioes = new Set(atas.map((a) => a.reuniaoId).filter(Boolean));
    const novas = SEED_ATAS.filter((a) => {
      if (vistas.has(a.id) || ids.has(a.id) || (a.reuniaoId && reunioes.has(a.reuniaoId))) return false;
      if (a.reuniaoId) reunioes.add(a.reuniaoId);
      return true;
    });
    const marcar = SEED_ATAS.filter((a) => !vistas.has(a.id)).map((a) => a.id);
    // Linhas acrescentadas depois a uma ata já salva: entram uma vez, só as que ainda não estão lá
    let lista = novas.length ? [...novas, ...atas] : atas;
    let mudou = novas.length > 0;
    ACRESCENTAR_ATAS.forEach(({ chave, reuniaoId, campo, linhas: novasLinhas }) => {
      const marca = `linhas:${chave}`;
      if (vistas.has(marca)) return;
      marcar.push(marca);
      lista = lista.map((a) => {
        if (a.reuniaoId !== reuniaoId) return a;
        const atual = a[campo] || "";
        const existentes = new Set(linhas(atual).map(normalizar));
        const faltam = novasLinhas.filter((l) => !existentes.has(normalizar(l)));
        if (!faltam.length) return a;
        mudou = true;
        return { ...a, [campo]: [atual.trim(), ...faltam].filter(Boolean).join("\n"), atualizadaEm: Date.now() };
      });
    });
    SUBSTITUIR_ATAS.forEach(({ chave, reuniaoId, campo, de, para }) => {
      const marca = `troca:${chave}`;
      if (vistas.has(marca)) return;
      marcar.push(marca);
      lista = lista.map((a) => {
        if (a.reuniaoId !== reuniaoId || !(a[campo] || "").includes(de)) return a;
        mudou = true;
        return { ...a, [campo]: a[campo].split(de).join(para), atualizadaEm: Date.now() };
      });
    });
    if (mudou) setAtas(lista);
    if (marcar.length) setSementesAplicadas([...sementesAplicadas, ...marcar]);
  }, [atas, sementesAplicadas]);

  // Vindo do botão "Ata da reunião" da aba Reuniões: abre a ata existente ou cria uma nova
  useEffect(() => {
    if (!novaDe || atas === null) return;
    const existente = lista.find((a) => a.reuniaoId && a.reuniaoId === novaDe.id);
    if (existente) abrir(existente.id);
    else criar(ataDaReuniao(novaDe));
    if (limparNovaDe) limparNovaDe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [novaDe, atas === null]);

  const empresasPorNome = useMemo(() => {
    const m = new Map();
    members.forEach((x) => x.nome && m.set(normalizar(x.nome), x));
    return m;
  }, [members]);
  const abrirEmpresaPorNome = (nome, soVerificar) => {
    const m = empresasPorNome.get(normalizar(nome));
    if (soVerificar) return Boolean(m && abrirEmpresa);
    if (m && abrirEmpresa) abrirEmpresa(m.id);
    return true;
  };

  // Reuniões recentes (últimos 60 dias até hoje) que ainda não têm ata
  const reunioesSemAta = useMemo(() => {
    const comAta = new Set(lista.map((a) => a.reuniaoId).filter(Boolean));
    const inicio = somaDias(hoje, -60);
    return meetings
      .filter((m) => m.data && m.data >= inicio && m.data <= hoje && m.status !== "cancelada" && !comAta.has(m.id))
      .sort((a, b) => (b.data + (b.horario || "")).localeCompare(a.data + (a.horario || "")));
  }, [meetings, lista, hoje]);

  const filtradas = useMemo(() => {
    const q = normalizar(busca);
    return lista
      .filter((a) => filtroResp === "todos" || a.responsavel === filtroResp || a.responsavel === "ambos")
      .filter((a) => filtroStatus === "todos" || a.status === filtroStatus)
      .filter((a) => !q || normalizar([a.titulo, a.empresa, a.tipo, a.participantesCcib, a.participantesEmpresa, ...SECOES.map((s) => a[s.id])].join(" ")).includes(q))
      .sort((a, b) => (b.data || "").localeCompare(a.data || "") || (b.criadaEm || 0) - (a.criadaEm || 0));
  }, [lista, busca, filtroResp, filtroStatus]);

  const rascunhos = lista.filter((a) => a.status !== "finalizada").length;


  const card = { background: "#FFFFFF", border: "1px solid #E3E6EC", borderRadius: 12 };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 4 }}>
        <SectionTitle size={17}>Atas de reuniões</SectionTitle>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select
            className="ccib-input"
            style={{ ...filterInputStyle, background: "#FFFFFF", maxWidth: 300 }}
            value={reuniaoBase}
            onChange={(e) => {
              const m = meetings.find((x) => x.id === e.target.value);
              if (m) criar(ataDaReuniao(m));
              setReuniaoBase("");
            }}
            disabled={atas === null}
            title="Cria a ata já com título, data, horário, participantes e local da reunião"
          >
            <option value="">Criar a partir de uma reunião...</option>
            {reunioesSemAta.map((m) => (
              <option key={m.id} value={m.id}>{dataCurta(m.data)} · {m.nome}</option>
            ))}
          </select>
          <button onClick={() => criar(novaAta())} disabled={atas === null} className="ccib-btn" style={botaoPrincipal}>
            <Plus size={14} /> Nova ata
          </button>
        </div>
      </div>
      <p style={{ fontSize: 13.5, color: "#566175", margin: "0 0 16px", lineHeight: 1.5 }}>
        O que foi conversado com cada empresa, as oportunidades para a Câmara e os próximos passos. Clique numa ata para ler; use <b>Editar</b> para mudar.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {[
          ["atas", lista.length, "#0B2545", ClipboardList],
          ["em rascunho", rascunhos, "#B8752E", Pencil],
          ["finalizadas", lista.length - rascunhos, "#0E7C3A", Check],
        ].map(([rot, val, cor, Icone]) => (
          <div key={rot} style={{ ...card, flex: "1 1 170px", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: `${cor}14`, color: cor, display: "flex", alignItems: "center", justifyContent: "center" }}><Icone size={16} /></span>
            <span style={{ fontFamily: serif, fontSize: 22, fontWeight: 500, color: cor }}>{atas === null ? "…" : val}</span>
            <span style={{ fontSize: 13, color: "#566175" }}>{rot}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 260px" }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: 11, color: "#8992A6" }} />
          <input className="ccib-input" style={{ ...filterInputStyle, width: "100%", boxSizing: "border-box", paddingLeft: 32, background: "#FFFFFF" }} placeholder="Buscar por empresa, assunto ou pessoa..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["todos", "Todos"], ["bianca", "Bianca"], ["gustavo", "Gustavo"]].map(([id, label]) => (
            <button key={id} onClick={() => setFiltroResp(id)} style={{ fontSize: 12.5, borderRadius: 99, padding: "6px 12px", cursor: "pointer", fontFamily: sans, border: `1px solid ${filtroResp === id ? "#0B2545" : "#D6DAE2"}`, background: filtroResp === id ? "#0B2545" : "#FFFFFF", color: filtroResp === id ? "#FFFFFF" : "#566175" }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["todos", "Todas"], ["rascunho", "Rascunhos"], ["finalizada", "Finalizadas"]].map(([id, label]) => (
            <button key={id} onClick={() => setFiltroStatus(id)} style={{ fontSize: 12.5, borderRadius: 99, padding: "6px 12px", cursor: "pointer", fontFamily: sans, border: `1px solid ${filtroStatus === id ? "#0B2545" : "#D6DAE2"}`, background: filtroStatus === id ? "#0B2545" : "#FFFFFF", color: filtroStatus === id ? "#FFFFFF" : "#566175" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <datalist id="ccib-atas-empresas">
        {members.map((m) => m.nome && <option key={m.id} value={m.nome} />)}
      </datalist>

      {atas === null ? (
        <div style={{ color: "#8992A6", fontSize: 13, padding: "30px 0", textAlign: "center" }}>Carregando atas...</div>
      ) : filtradas.length === 0 ? (
        <div style={{ ...card, padding: "36px 24px", textAlign: "center", color: "#566175", fontSize: 14 }}>
          <ClipboardList size={28} color="#B8752E" style={{ marginBottom: 8 }} />
          <div>{lista.length ? "Nenhuma ata encontrada com esses filtros." : "Nenhuma ata registrada ainda. Clique em \"Nova ata\" ou crie a partir de uma reunião."}</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtradas.map((ata) => {
            const st = STATUS_ATA[ata.status] || STATUS_ATA.rascunho;
            const isOpen = aberta === ata.id;
            const resumo = linhas(ata.objetivo)[0] || linhas(ata.pontos)[0] || "";
            const principal = ata.empresa || ata.titulo || "(ata sem título)";
            const secundario = ata.empresa && ata.titulo && normalizar(ata.titulo) !== normalizar(ata.empresa) ? ata.titulo : "";
            return (
              <div key={ata.id} className="ccib-card" style={{ ...card, overflow: "hidden", borderColor: isOpen ? "#0B2545" : "#E3E6EC", boxShadow: isOpen ? "0 4px 18px rgba(11,37,69,0.08)" : "none" }}>
                <div onClick={() => (isOpen ? abrir(null) : abrir(ata.id))} style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 16px", cursor: "pointer", flexWrap: "wrap" }}>
                  <div style={{ width: 54, textAlign: "center", background: `${corResp(ata.responsavel)}12`, borderRadius: 10, padding: "6px 0", flexShrink: 0 }}>
                    <div style={{ fontFamily: serif, fontSize: 21, color: "#0B2545", lineHeight: 1 }}>{ata.data ? ata.data.slice(8, 10) : "--"}</div>
                    <div style={{ fontSize: 11, color: "#566175", marginTop: 3 }}>
                      {ata.data ? `${MESES[Number(ata.data.slice(5, 7)) - 1]}/${ata.data.slice(2, 4)}` : ""}
                    </div>
                  </div>
                  <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#0B2545" }}>{principal}</span>
                      {ata.tipo && <Pilula cor="#6A5ACD">{ata.tipo}</Pilula>}
                      <Pilula cor={st.color}>{st.label}</Pilula>
                    </div>
                    {secundario && <div style={{ fontSize: 13, color: "#566175", marginTop: 2 }}>{secundario}</div>}
                    {resumo && !isOpen && (
                      <div style={{ fontSize: 13, color: "#8992A6", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{resumo}</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <ChevronRight size={18} color="#8992A6" style={{ transition: "transform 0.15s", transform: isOpen ? "rotate(90deg)" : "none" }} />
                  </div>
                </div>
                {isOpen && (
                  <AtaAberta
                    ata={ata}
                    hoje={hoje}
                    editando={editando}
                    setEditando={setEditando}
                    mudar={(patch) => mudar(ata.id, patch)}
                    excluir={() => excluir(ata.id)}
                    fechar={() => abrir(null)}
                    abrirEmpresaPorNome={abrirEmpresaPorNome}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
