import React, { useRef, useState } from "react";
import { Plus, X, ArrowLeft, ChevronRight, Plane, Wallet, TrendingUp, TrendingDown, Users, Receipt, Calculator, Scale, Coins, ImagePlus } from "lucide-react";
import { STATUS_PROJETO } from "../constants";
import { inputStyle, labelStyle, filterInputStyle } from "../styles";
import { Field } from "../components/ui";
import { formatDate } from "../lib/format";
import { useProjetos, ehMissao } from "../lib/useProjetos";
import { painelMissaoPadrao } from "../components/PainelMissao";
import { ProjetoDetalhe } from "./ProjetosTab";

const mono = "'IBM Plex Mono', monospace";
const serif = "'Fraunces', serif";

const card = {
  background: "#FFFFFF",
  border: "1px solid #E6E9EF",
  borderRadius: 16,
  boxShadow: "0 1px 2px rgba(11,37,69,0.05), 0 10px 28px -6px rgba(11,37,69,0.12)",
};
const secao = { ...card, padding: "18px 22px" };

// Cores das duas séries (validadas para daltonismo); os valores aparecem sempre escritos ao lado
const COR_RECEITA = "#2F6FB0";
const COR_CUSTO = "#E8742B";

const MOEDAS = ["BRL", "USD", "INR"];
const CATEGORIAS_CUSTO = ["Passagens", "Diárias", "Hospedagem", "Alimentação", "Transporte local", "Intérprete / tradução", "Inscrições / taxas", "Materiais", "Outros"];
const SITUACAO_CUSTO = {
  previsto: { label: "Previsto", color: "#B8752E" },
  pago: { label: "Pago", color: "#0E7C3A" },
};
const STATUS_PARTICIPANTE = {
  confirmada: { label: "Confirmada (pagante)", color: "#0E7C3A" },
  a_confirmar: { label: "A confirmar", color: "#B8752E" },
  nao_participa: { label: "Não participa", color: "#8992A6" },
};

const btnLinha = { display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "1px solid #0B2545", color: "#0B2545", borderRadius: 7, padding: "6px 12px", fontSize: 12.5, cursor: "pointer", flexShrink: 0 };
const btnRemover = { background: "transparent", border: "none", cursor: "pointer", color: "#B7BEC9", padding: 0, display: "flex", flexShrink: 0 };
const linhaItem = { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", background: "#FFFFFF", border: "1px solid #E6E9EF", borderRadius: 8, padding: "6px 10px" };
const inputLinha = { ...inputStyle, borderBottom: "none", padding: "2px" };
const inputNovo = { ...filterInputStyle, padding: "6px 10px", fontSize: 12.5 };
const novoId = (prefixo) => `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

// Aceita "1.234,56", "1234,56" e "1234.56"
export function num(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  let s = String(v ?? "").trim().replace(/[^\d.,-]/g, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (!/^-?\d+\.\d{1,2}$/.test(s)) s = s.replace(/\./g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}
const paraTexto = (n) => (n == null ? "" : String(Math.round(n * 100) / 100).replace(".", ","));

function dinheiro(n, moeda) {
  if (n == null) return "—";
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda || "BRL", maximumFractionDigits: Math.abs(n) >= 1000 ? 0 : 2 }).format(n);
  } catch (e) {
    return `${moeda} ${Math.round(n)}`;
  }
}

function periodo(p) {
  if (p.dataPrevista && p.dataFim && p.dataFim !== p.dataPrevista) return `${formatDate(p.dataPrevista)} a ${formatDate(p.dataFim)}`;
  if (p.dataPrevista) return formatDate(p.dataPrevista);
  return "Data a definir";
}

const totalCusto = (c) => {
  const q = num(c.quantidade);
  const u = num(c.valorUnitario);
  if (u != null) return (q != null ? q : 1) * u;
  return num(c.valor);
};

// Todas as contas da missão, na moeda da missão
export function calcularMissao(p) {
  const pm = { ...painelMissaoPadrao(), ...(p.painelMissao || {}) };
  const moeda = pm.moeda || "BRL";
  const valorBase = num(pm.valorParticipante);
  const meta = num(pm.metaContratacoes);
  const cambio = p.cambio || {};
  const converter = (v, m) => {
    if (v == null) return null;
    if (!m || m === moeda) return v;
    const taxa = num(cambio[m]);
    return taxa ? v * taxa : null;
  };

  const participantes = p.participantes || [];
  const pagantes = participantes.filter((x) => x.status === "confirmada");
  const valorDe = (x) => {
    const v = num(x.valorNegociado);
    return v != null ? v : valorBase;
  };
  const receitaParticipantes = pagantes.reduce((s, x) => s + (valorDe(x) || 0), 0);
  const extras = (p.receitasExtras || []).reduce((s, r) => s + (num(r.valor) || 0), 0);
  const arrecadado = receitaParticipantes + extras;

  const custos = p.custos || [];
  let gasto = 0;
  let gastoPago = 0;
  const semCambio = new Set();
  const porCategoria = {};
  custos.forEach((c) => {
    const t = totalCusto(c);
    if (t == null) return;
    const v = converter(t, c.moeda || "BRL");
    if (v == null) { semCambio.add(c.moeda); return; }
    gasto += v;
    if (c.situacao === "pago") gastoPago += v;
    const cat = c.categoria || "Outros";
    porCategoria[cat] = (porCategoria[cat] || 0) + v;
  });

  const resultado = arrecadado - gasto;
  const margem = arrecadado > 0 ? (resultado / arrecadado) * 100 : null;
  const custoPorPagante = pagantes.length ? gasto / pagantes.length : null;
  const equilibrio = valorBase ? Math.max(0, Math.ceil((gasto - extras) / valorBase)) : null;
  const temDados = arrecadado > 0 || gasto > 0;

  return { pm, moeda, valorBase, meta, participantes, pagantes, valorDe, receitaParticipantes, extras, arrecadado, gasto, gastoPago, semCambio: [...semCambio], porCategoria, resultado, margem, custoPorPagante, equilibrio, temDados, converter };
}

function Chip({ children, color = "#566175", bg = "#EEF1F5" }) {
  return <span style={{ fontFamily: mono, fontSize: 10.5, fontWeight: 600, color, background: bg, borderRadius: 999, padding: "3px 10px" }}>{children}</span>;
}

function TituloSecao({ icon: Icon, children, extra }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
      {Icon && <Icon size={16} style={{ color: "#B8752E" }} />}
      <h3 style={{ fontFamily: serif, fontWeight: 600, fontSize: 17, margin: 0, color: "#0B2545", flex: 1 }}>{children}</h3>
      {extra}
    </div>
  );
}

function Kpi({ label, valor, sub, cor = "#0B2545", icon: Icon }) {
  return (
    <div style={{ flex: "1 1 160px", background: "#FAFBFC", border: "1px solid #EEF1F5", borderTop: `3px solid ${cor}`, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, ...labelStyle, marginBottom: 6 }}>{Icon && <Icon size={12} style={{ color: cor }} />} {label}</div>
      <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 24, color: "#0B2545", lineHeight: 1.1 }}>{valor}</div>
      {sub && <div style={{ fontSize: 11.5, color: "#8992A6", marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

function Resultado({ valor, moeda, grande }) {
  if (valor == null) return <span>—</span>;
  const positivo = valor >= 0;
  const Icone = positivo ? TrendingUp : TrendingDown;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: positivo ? "#0E7C3A" : "#C1502E", fontWeight: 600 }}>
      <Icone size={grande ? 20 : 14} /> {dinheiro(valor, moeda)} <span style={{ fontSize: grande ? 12 : 10.5, fontFamily: mono, fontWeight: 600 }}>{positivo ? "lucro" : "prejuízo"}</span>
    </span>
  );
}

function Barra({ valor, max, cor, rotulo, titulo }) {
  const pct = max > 0 ? Math.max(valor > 0 ? 1.5 : 0, (valor / max) * 100) : 0;
  return (
    <div title={titulo} style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 12 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: cor, borderRadius: "0 4px 4px 0" }} />
      </div>
      <span style={{ fontFamily: mono, fontSize: 11.5, color: "#1B2438", minWidth: 96, textAlign: "right" }}>{rotulo}</span>
    </div>
  );
}

function Legenda() {
  return (
    <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#566175" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: COR_RECEITA }} /> Arrecadado</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: COR_CUSTO }} /> Gasto</span>
    </div>
  );
}

// Comparativo entre missões, em ordem de data: mostra a evolução de uma missão para a outra
function EvolucaoMissoes({ missoes, abrir }) {
  const comDados = missoes.filter((m) => m.c.temDados);
  const porMoeda = {};
  comDados.forEach((m) => { (porMoeda[m.c.moeda] = porMoeda[m.c.moeda] || []).push(m); });
  return (
    <div style={{ ...secao, marginBottom: 22 }}>
      <TituloSecao icon={TrendingUp} extra={<Legenda />}>Evolução das missões</TituloSecao>
      {comDados.length === 0 && (
        <div style={{ fontSize: 13, color: "#8992A6", lineHeight: 1.5 }}>
          Assim que houver valor por participante, empresas pagantes ou custos lançados, cada missão aparece aqui com o arrecadado, o gasto e o resultado, em ordem de data.
        </div>
      )}
      {Object.entries(porMoeda).map(([moeda, lista]) => {
        const max = Math.max(...lista.map((m) => Math.max(m.c.arrecadado, m.c.gasto)));
        return (
          <div key={moeda} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.keys(porMoeda).length > 1 && <div style={labelStyle}>Missões em {moeda}</div>}
            {lista.map((m) => (
              <div key={m.p.id} onClick={() => abrir(m.p.id)} className="ccib-row" style={{ cursor: "pointer", borderRadius: 8, padding: "4px 6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0B2545" }}>{m.p.nome || "(missão sem nome)"} <span style={{ fontFamily: mono, fontSize: 11, color: "#8992A6", fontWeight: 400 }}>{periodo(m.p)}</span></span>
                  <span style={{ fontSize: 12.5 }}><Resultado valor={m.c.resultado} moeda={moeda} /></span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Barra valor={m.c.arrecadado} max={max} cor={COR_RECEITA} rotulo={dinheiro(m.c.arrecadado, moeda)} titulo={`Arrecadado: ${dinheiro(m.c.arrecadado, moeda)}`} />
                  <Barra valor={m.c.gasto} max={max} cor={COR_CUSTO} rotulo={dinheiro(m.c.gasto, moeda)} titulo={`Gasto: ${dinheiro(m.c.gasto, moeda)}`} />
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// Logo da missão: a imagem é reduzida (até 320 px) e guardada junto com a missão
const LOGO_MAX = 320;
function lerLogo(arquivo) {
  return new Promise((resolve, reject) => {
    if (!arquivo || !arquivo.type.startsWith("image/")) return reject(new Error("Arquivo não é imagem"));
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Falha ao ler"));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Imagem inválida"));
      img.onload = () => {
        const escala = Math.min(1, LOGO_MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * escala));
        canvas.height = Math.max(1, Math.round(img.height * escala));
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const webp = canvas.toDataURL("image/webp", 0.9);
        resolve(webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png"));
      };
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

function LogoMissao({ logo, tamanho = 42, onChange }) {
  const ref = useRef(null);
  const [erro, setErro] = useState("");
  const escolher = async (e) => {
    const arquivo = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!arquivo) return;
    try {
      setErro("");
      onChange(await lerLogo(arquivo));
    } catch (err) {
      setErro("Não foi possível usar essa imagem.");
    }
  };
  const caixa = { width: logo ? "auto" : tamanho, minWidth: tamanho, maxWidth: tamanho * 2.2, padding: logo ? "0 6px" : 0, height: tamanho, borderRadius: tamanho > 60 ? 14 : 12, background: logo ? "#FFFFFF" : "#EAF1FA", border: logo ? "1px solid #E6E9EF" : "none", color: COR_RECEITA, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" };
  const imagem = logo ? <img src={logo} alt="Logo da missão" style={{ height: "86%", width: "auto", maxWidth: tamanho * 2.2 - 12, objectFit: "contain" }} /> : null;
  if (!onChange) return <span style={caixa}>{imagem || <Plane size={Math.round(tamanho * 0.48)} />}</span>;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
      <button onClick={() => ref.current && ref.current.click()} title={logo ? "Trocar logo" : "Adicionar logo"} style={{ ...caixa, cursor: "pointer", border: logo ? caixa.border : "1.5px dashed #9DB6D6", flexDirection: "column", gap: 4 }}>
        {imagem || (<><ImagePlus size={22} /><span style={{ fontSize: 10.5, fontWeight: 600 }}>Adicionar logo</span></>)}
      </button>
      <input ref={ref} type="file" accept="image/*" onChange={escolher} style={{ display: "none" }} />
      {logo && (
        <div style={{ display: "flex", gap: 10, fontSize: 11 }}>
          <button onClick={() => ref.current && ref.current.click()} style={{ background: "none", border: "none", padding: 0, color: "#2F6FB0", cursor: "pointer", fontSize: 11 }}>Trocar</button>
          <button onClick={() => { if (window.confirm("Remover a logo desta missão?")) onChange(null); }} style={{ background: "none", border: "none", padding: 0, color: "#B5533C", cursor: "pointer", fontSize: 11 }}>Remover</button>
        </div>
      )}
      {erro && <div style={{ fontSize: 11, color: "#B5533C", maxWidth: tamanho + 40, textAlign: "center" }}>{erro}</div>}
    </div>
  );
}

// Saldo final em verde (lucro) ou vermelho (prejuízo), sempre com ícone e texto
function SaldoFinal({ c }) {
  if (!c.temDados) {
    return <div style={{ marginTop: 10, fontSize: 12.5, color: "#8992A6", background: "#F7F8FA", borderRadius: 8, padding: "9px 12px" }}>Saldo final: sem valores lançados ainda</div>;
  }
  const lucro = c.resultado >= 0;
  const Icone = lucro ? TrendingUp : TrendingDown;
  const cor = lucro ? "#0E7C3A" : "#C1502E";
  return (
    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: lucro ? "#EAF5EE" : "#FBEDE8", border: `1px solid ${lucro ? "#BFDFCB" : "#F0C9BC"}`, borderRadius: 8, padding: "9px 12px", color: cor }}>
      <Icone size={18} />
      <span style={{ ...labelStyle, color: cor, marginBottom: 0 }}>Saldo final</span>
      <span style={{ fontFamily: serif, fontSize: 20, fontWeight: 600 }}>{dinheiro(c.resultado, c.moeda)}</span>
      <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 600 }}>{lucro ? "lucro" : "prejuízo"}{c.margem != null ? ` · margem ${Math.round(c.margem)}%` : ""}</span>
    </div>
  );
}

function MissaoResumo({ p, c, abrir }) {
  const status = STATUS_PROJETO[p.status] || STATUS_PROJETO.ideia;
  const meta = c.meta;
  const progresso = meta ? Math.min(100, Math.round((c.pagantes.length / meta) * 100)) : null;
  return (
    <div style={{ ...card, overflow: "hidden" }} className="ccib-fade-in">
      <div style={{ height: 4, background: status.color }} />
      <div onClick={abrir} className="ccib-row" style={{ padding: "16px 22px", cursor: "pointer", display: "flex", gap: 16, alignItems: "flex-start" }}>
        <LogoMissao logo={p.logo} tamanho={p.logo ? 64 : 42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 18, color: "#0B2545" }}>{p.nome || "(missão sem nome)"}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            <Chip color={status.color} bg={`${status.color}14`}>{status.label}</Chip>
            {p.local && <Chip>{p.local}</Chip>}
            <Chip color="#B8752E" bg="#FBF3EA">{periodo(p)}</Chip>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(118px, 1fr))", gap: 8, marginTop: 12 }}>
            {[
              ["Participantes", `${c.pagantes.length}${meta ? ` de ${meta}` : ""}`],
              ["Custo individual", dinheiro(c.custoPorPagante, c.moeda)],
              ["Arrecadado", dinheiro(c.arrecadado, c.moeda)],
              ["Passagens", dinheiro(c.porCategoria["Passagens"] || 0, c.moeda)],
              ["Diárias", dinheiro(c.porCategoria["Diárias"] || 0, c.moeda)],
              ["Hotel", dinheiro(c.porCategoria["Hospedagem"] || 0, c.moeda)],
              ["Gasto total", dinheiro(c.gasto, c.moeda)],
            ].map(([rotulo, valor]) => (
              <div key={rotulo} style={{ background: "#FAFBFC", border: "1px solid #EEF1F5", borderRadius: 8, padding: "7px 10px" }}>
                <div style={{ ...labelStyle, fontSize: 9, marginBottom: 2 }}>{rotulo}</div>
                <div style={{ fontFamily: mono, fontSize: 12.5, fontWeight: 600, color: "#0B2545" }}>{valor}</div>
              </div>
            ))}
          </div>
          <SaldoFinal c={c} />
          {progresso != null && (
            <div style={{ height: 6, background: "#EEF1F5", borderRadius: 4, marginTop: 10, maxWidth: 360, overflow: "hidden" }}>
              <div style={{ width: `${progresso}%`, height: "100%", background: "#0E7C3A", borderRadius: 4 }} />
            </div>
          )}
        </div>
        <ChevronRight size={18} style={{ color: "#8992A6", flexShrink: 0, marginTop: 4 }} />
      </div>
    </div>
  );
}

function MissaoDetalhe({ p, patch, voltar, abrirFicha }) {
  const c = calcularMissao(p);
  const { pm, moeda } = c;
  const status = STATUS_PROJETO[p.status] || STATUS_PROJETO.ideia;
  const participantes = c.participantes;
  const extras = p.receitasExtras || [];
  const custos = p.custos || [];
  const cambio = p.cambio || {};
  const moedasCusto = [...new Set(custos.map((x) => x.moeda || "BRL"))].filter((m) => m !== moeda);

  const setPainel = (mudanca) => patch({ painelMissao: { ...pm, ...mudanca } });
  const patchItem = (campo, lista, id, mudanca) => patch({ [campo]: lista.map((x) => (x.id === id ? { ...x, ...mudanca } : x)) });
  // Ao mudar quantidade ou valor unitário, o total fica gravado em "valor" (usado também na aba Projetos)
  const patchCusto = (cst, mudanca) => {
    const novo = { ...cst, ...mudanca };
    const q = num(novo.quantidade);
    const u = num(novo.valorUnitario);
    if (("quantidade" in mudanca || "valorUnitario" in mudanca) && u != null) novo.valor = paraTexto((q != null ? q : 1) * u);
    patch({ custos: custos.map((x) => (x.id === cst.id ? novo : x)) });
  };

  const [novoPart, setNovoPart] = useState({ empresa: "", representante: "" });
  const [novaReceita, setNovaReceita] = useState({ descricao: "", valor: "" });
  const [novoCusto, setNovoCusto] = useState({ categoria: "Passagens", descricao: "", quantidade: "", valorUnitario: "", moeda, situacao: "previsto" });
  const [simulados, setSimulados] = useState("");

  const addPart = () => {
    const empresa = novoPart.empresa.trim();
    if (!empresa) return;
    patch({ participantes: [...participantes, { id: novoId("pt"), empresa, representante: novoPart.representante.trim(), cargo: "", observacoes: "", status: "a_confirmar" }] });
    setNovoPart({ empresa: "", representante: "" });
  };
  const addReceita = () => {
    const descricao = novaReceita.descricao.trim();
    if (!descricao && !novaReceita.valor) return;
    patch({ receitasExtras: [...extras, { id: novoId("r"), descricao, valor: novaReceita.valor }] });
    setNovaReceita({ descricao: "", valor: "" });
  };
  const addCusto = () => {
    const q = num(novoCusto.quantidade);
    const u = num(novoCusto.valorUnitario);
    if (!novoCusto.descricao.trim() && u == null) return;
    const quantidade = novoCusto.quantidade || (u != null ? "1" : "");
    const total = u != null ? (q != null ? q : 1) * u : null;
    patch({ custos: [...custos, { id: novoId("c"), ...novoCusto, quantidade, descricao: novoCusto.descricao.trim(), valor: paraTexto(total) }] });
    setNovoCusto((s) => ({ ...s, descricao: "", quantidade: "", valorUnitario: "" }));
  };

  const nSim = num(simulados);
  const simArrecadado = nSim != null && c.valorBase != null ? nSim * c.valorBase + c.extras : null;
  const simResultado = simArrecadado != null ? simArrecadado - c.gasto : null;
  const maxCat = Math.max(0, ...Object.values(c.porCategoria));

  return (
    <div className="ccib-fade-in">
      <button onClick={voltar} className="ccib-btn" style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "#0B2545", fontSize: 13, cursor: "pointer", padding: "4px 0", marginBottom: 14 }}>
        <ArrowLeft size={15} /> Todas as missões
      </button>
      <div style={{ ...secao, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 18, borderLeft: "4px solid #B8752E" }}>
        <div style={{ flex: "1 1 260px", fontSize: 13, color: "#566175", lineHeight: 1.5 }}>
          <b style={{ color: "#0B2545" }}>Ficha completa da missão:</b> etapas, empresas visitadas, painel de contratações (cenários), resultados e notas.
        </div>
        <button onClick={abrirFicha} className="ccib-btn" style={btnLinha}>Abrir ficha completa <ChevronRight size={14} /></button>
      </div>

      {/* Cabeçalho e números principais */}
      <div style={{ ...card, overflow: "hidden", marginBottom: 18 }}>
        <div style={{ height: 4, background: status.color }} />
        <div style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
          <LogoMissao logo={p.logo} tamanho={96} onChange={(logo) => patch({ logo })} />
          <div style={{ flex: 1, minWidth: 0 }}>
          <input className="ccib-input" value={p.nome} placeholder="Nome da missão" onChange={(e) => patch({ nome: e.target.value })} style={{ ...inputStyle, fontFamily: serif, fontWeight: 600, fontSize: 24, color: "#0B2545", borderBottom: "1px solid transparent" }} />
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
            <Field label="Status">
              <select style={{ ...inputStyle, color: status.color, fontWeight: 600 }} value={p.status} onChange={(e) => patch({ status: e.target.value })}>
                {Object.entries(STATUS_PROJETO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
            <Field label="Destino">
              <input className="ccib-input" style={inputStyle} value={p.local || ""} placeholder="Ex: New Delhi, Índia" onChange={(e) => patch({ local: e.target.value })} />
            </Field>
            <Field label="Início">
              <input type="date" style={{ ...inputStyle, colorScheme: "light" }} value={p.dataPrevista || ""} onChange={(e) => patch({ dataPrevista: e.target.value })} />
            </Field>
            <Field label="Fim">
              <input type="date" style={{ ...inputStyle, colorScheme: "light" }} value={p.dataFim || ""} onChange={(e) => patch({ dataFim: e.target.value })} />
            </Field>
          </div>
          </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            <Kpi icon={Wallet} label="Valor arrecadado" valor={dinheiro(c.arrecadado, moeda)} cor={COR_RECEITA} sub={`${c.pagantes.length} pagante${c.pagantes.length === 1 ? "" : "s"}${c.extras ? " + outras receitas" : ""}`} />
            <Kpi icon={Receipt} label="Valor gasto" valor={dinheiro(c.gasto, moeda)} cor={COR_CUSTO} sub={`${dinheiro(c.gastoPago, moeda)} pago · ${dinheiro(c.gasto - c.gastoPago, moeda)} previsto`} />
            <Kpi icon={Scale} label="Saldo final" valor={c.temDados ? <Resultado valor={c.resultado} moeda={moeda} grande /> : "—"} cor={c.resultado >= 0 ? "#0E7C3A" : "#C1502E"} sub={c.margem != null ? `Margem de ${Math.round(c.margem)}% sobre o arrecadado` : "Sem receita lançada"} />
          </div>
          {c.semCambio.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12.5, color: "#B5533C", background: "#FBEFEC", borderRadius: 8, padding: "8px 12px" }}>
              Há custos em {c.semCambio.join(", ")} sem câmbio informado. Eles ficam fora do total até a taxa ser preenchida em "Câmbio", na seção de custos.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Receita */}
        <div style={secao}>
          <TituloSecao icon={Wallet} extra={<span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: "#0B2545" }}>{dinheiro(c.arrecadado, moeda)}</span>}>Valor arrecadado</TituloSecao>
          <div style={{ background: "#F3F7FC", borderLeft: `4px solid ${COR_RECEITA}`, borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ ...labelStyle, color: COR_RECEITA }}>Fórmula</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap", fontSize: 14, color: "#1B2438" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ ...labelStyle, marginBottom: 0 }}>Valor base por participante</span>
                <span style={{ display: "flex", gap: 6 }}>
                  <select value={moeda} onChange={(e) => setPainel({ moeda: e.target.value })} style={{ ...inputNovo, fontFamily: mono }}>
                    {MOEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input value={pm.valorParticipante || ""} inputMode="decimal" placeholder="0,00" onChange={(e) => setPainel({ valorParticipante: e.target.value })} style={{ ...inputNovo, width: 120, fontFamily: mono, fontSize: 13.5 }} />
                </span>
              </label>
              <span style={{ fontSize: 18, color: "#8992A6", paddingBottom: 6 }}>×</span>
              <div style={{ paddingBottom: 4 }}>
                <div style={{ ...labelStyle, marginBottom: 2 }}>Pagantes</div>
                <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 600 }}>{c.pagantes.length}</div>
              </div>
              {c.extras > 0 && (
                <>
                  <span style={{ fontSize: 18, color: "#8992A6", paddingBottom: 6 }}>+</span>
                  <div style={{ paddingBottom: 4 }}>
                    <div style={{ ...labelStyle, marginBottom: 2 }}>Outras receitas</div>
                    <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 600 }}>{dinheiro(c.extras, moeda)}</div>
                  </div>
                </>
              )}
              <span style={{ fontSize: 18, color: "#8992A6", paddingBottom: 6 }}>=</span>
              <div style={{ paddingBottom: 4 }}>
                <div style={{ ...labelStyle, marginBottom: 2 }}>Arrecadado</div>
                <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: "#0B2545" }}>{dinheiro(c.arrecadado, moeda)}</div>
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, marginLeft: "auto" }}>
                <span style={{ ...labelStyle, marginBottom: 0 }}>Meta de participantes</span>
                <input value={pm.metaContratacoes || ""} inputMode="numeric" placeholder="—" onChange={(e) => setPainel({ metaContratacoes: e.target.value })} style={{ ...inputNovo, width: 80, fontFamily: mono, fontSize: 13.5 }} />
              </label>
            </div>
            <div style={{ fontSize: 11.5, color: "#566175", marginTop: 8 }}>Cada empresa com status "Confirmada (pagante)" entra pelo valor base. Se uma empresa negociou outro valor, preencha a coluna "Valor negociado" dela.</div>
          </div>

          <div style={labelStyle}>Empresas participantes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {participantes.length === 0 && <div style={{ fontSize: 12.5, color: "#8992A6" }}>Nenhuma empresa cadastrada.</div>}
            {participantes.map((pt) => {
              const st = STATUS_PARTICIPANTE[pt.status] || STATUS_PARTICIPANTE.a_confirmar;
              const conta = pt.status === "confirmada" ? c.valorDe(pt) : null;
              return (
                <div key={pt.id} style={linhaItem}>
                  <input className="ccib-input" value={pt.empresa} placeholder="Empresa" onChange={(e) => patchItem("participantes", participantes, pt.id, { empresa: e.target.value })} style={{ ...inputLinha, flex: "2 1 150px", fontWeight: 600, color: "#0B2545" }} />
                  <input className="ccib-input" value={pt.representante || ""} placeholder="Representante" onChange={(e) => patchItem("participantes", participantes, pt.id, { representante: e.target.value })} style={{ ...inputLinha, flex: "2 1 140px" }} />
                  <select value={pt.status || "a_confirmar"} onChange={(e) => patchItem("participantes", participantes, pt.id, { status: e.target.value })} style={{ ...inputLinha, flex: "0 1 160px", fontSize: 12, fontWeight: 600, color: st.color }}>
                    {Object.entries(STATUS_PARTICIPANTE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <input className="ccib-input" value={pt.valorNegociado || ""} inputMode="decimal" placeholder="Valor negociado (opcional)" onChange={(e) => patchItem("participantes", participantes, pt.id, { valorNegociado: e.target.value })} style={{ ...inputLinha, flex: "1 1 150px", fontFamily: mono, fontSize: 12 }} />
                  <span style={{ fontFamily: mono, fontSize: 12, color: conta != null ? "#0B2545" : "#B7BEC9", minWidth: 90, textAlign: "right" }}>{conta != null ? dinheiro(conta, moeda) : "não conta"}</span>
                  <button onClick={() => patch({ participantes: participantes.filter((x) => x.id !== pt.id) })} title="Remover empresa" style={btnRemover}><X size={14} /></button>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            <input value={novoPart.empresa} placeholder="Empresa" onChange={(e) => setNovoPart((s) => ({ ...s, empresa: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addPart(); }} style={{ ...inputNovo, flex: "2 1 160px" }} />
            <input value={novoPart.representante} placeholder="Representante" onChange={(e) => setNovoPart((s) => ({ ...s, representante: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addPart(); }} style={{ ...inputNovo, flex: "2 1 160px" }} />
            <button onClick={addPart} className="ccib-btn" style={btnLinha}><Plus size={14} /> Empresa</button>
          </div>

          <div style={labelStyle}>Outras receitas (patrocínio, apoio institucional etc.)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {extras.map((r) => (
              <div key={r.id} style={linhaItem}>
                <input className="ccib-input" value={r.descricao} placeholder="Descrição" onChange={(e) => patchItem("receitasExtras", extras, r.id, { descricao: e.target.value })} style={{ ...inputLinha, flex: "3 1 200px" }} />
                <span style={{ fontFamily: mono, fontSize: 11, color: "#8992A6" }}>{moeda}</span>
                <input className="ccib-input" value={r.valor} inputMode="decimal" placeholder="0,00" onChange={(e) => patchItem("receitasExtras", extras, r.id, { valor: e.target.value })} style={{ ...inputLinha, flex: "0 1 120px", fontFamily: mono, textAlign: "right" }} />
                <button onClick={() => patch({ receitasExtras: extras.filter((x) => x.id !== r.id) })} title="Remover receita" style={btnRemover}><X size={14} /></button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input value={novaReceita.descricao} placeholder="Ex: Patrocínio" onChange={(e) => setNovaReceita((s) => ({ ...s, descricao: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addReceita(); }} style={{ ...inputNovo, flex: "3 1 200px" }} />
            <input value={novaReceita.valor} placeholder={`Valor (${moeda})`} inputMode="decimal" onChange={(e) => setNovaReceita((s) => ({ ...s, valor: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addReceita(); }} style={{ ...inputNovo, flex: "0 1 130px" }} />
            <button onClick={addReceita} className="ccib-btn" style={btnLinha}><Plus size={14} /> Receita</button>
          </div>
        </div>

        {/* Custos */}
        <div style={secao}>
          <TituloSecao icon={Receipt} extra={<span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: "#0B2545" }}>{dinheiro(c.gasto, moeda)}</span>}>Valor gasto</TituloSecao>
          <div style={{ fontSize: 11.5, color: "#566175", marginBottom: 10 }}>Cada custo é quantidade × valor unitário (ex.: 4 passagens × R$ 6.500, ou 8 diárias × R$ 350). Marque como "Pago" quando o pagamento sair.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {custos.length === 0 && <div style={{ fontSize: 12.5, color: "#8992A6" }}>Nenhum custo lançado.</div>}
            {custos.map((cst) => {
              const t = totalCusto(cst);
              const sit = SITUACAO_CUSTO[cst.situacao] || SITUACAO_CUSTO.previsto;
              return (
                <div key={cst.id} style={linhaItem}>
                  <select value={cst.categoria || "Outros"} onChange={(e) => patchCusto(cst, { categoria: e.target.value })} style={{ ...inputLinha, flex: "1 1 120px", fontSize: 12, color: "#566175" }}>
                    {[...new Set([...CATEGORIAS_CUSTO, cst.categoria || "Outros"])].map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <input className="ccib-input" value={cst.descricao || ""} placeholder="Descrição" onChange={(e) => patchCusto(cst, { descricao: e.target.value })} style={{ ...inputLinha, flex: "3 1 160px" }} />
                  <input className="ccib-input" value={cst.quantidade || ""} inputMode="decimal" placeholder="Qtd" title="Quantidade" onChange={(e) => patchCusto(cst, { quantidade: e.target.value })} style={{ ...inputLinha, flex: "0 0 48px", fontFamily: mono, textAlign: "center" }} />
                  <span style={{ color: "#8992A6", fontSize: 12 }}>×</span>
                  <select value={cst.moeda || "BRL"} onChange={(e) => patchCusto(cst, { moeda: e.target.value })} style={{ ...inputLinha, flex: "0 0 58px", fontFamily: mono, fontSize: 12 }}>
                    {MOEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input className="ccib-input" value={cst.valorUnitario ?? ""} inputMode="decimal" placeholder={cst.valor ? `${cst.valor}` : "Valor unit."} title="Valor unitário" onChange={(e) => patchCusto(cst, { valorUnitario: e.target.value })} style={{ ...inputLinha, flex: "0 1 100px", fontFamily: mono, textAlign: "right" }} />
                  <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: "#0B2545", minWidth: 96, textAlign: "right" }}>= {dinheiro(t, cst.moeda || "BRL")}</span>
                  <select value={cst.situacao || "previsto"} onChange={(e) => patchCusto(cst, { situacao: e.target.value })} style={{ ...inputLinha, flex: "0 0 84px", fontSize: 12, fontWeight: 600, color: sit.color }}>
                    {Object.entries(SITUACAO_CUSTO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <button onClick={() => patch({ custos: custos.filter((x) => x.id !== cst.id) })} title="Remover custo" style={btnRemover}><X size={14} /></button>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            <select value={novoCusto.categoria} onChange={(e) => setNovoCusto((s) => ({ ...s, categoria: e.target.value }))} style={{ ...inputNovo, flex: "1 1 130px" }}>
              {CATEGORIAS_CUSTO.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <input value={novoCusto.descricao} placeholder="Descrição (ex: GRU-DEL ida e volta)" onChange={(e) => setNovoCusto((s) => ({ ...s, descricao: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addCusto(); }} style={{ ...inputNovo, flex: "3 1 180px" }} />
            <input value={novoCusto.quantidade} placeholder="Qtd" inputMode="decimal" onChange={(e) => setNovoCusto((s) => ({ ...s, quantidade: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addCusto(); }} style={{ ...inputNovo, flex: "0 0 60px" }} />
            <select value={novoCusto.moeda} onChange={(e) => setNovoCusto((s) => ({ ...s, moeda: e.target.value }))} style={{ ...inputNovo, flex: "0 0 74px" }}>
              {MOEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <input value={novoCusto.valorUnitario} placeholder="Valor unitário" inputMode="decimal" onChange={(e) => setNovoCusto((s) => ({ ...s, valorUnitario: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addCusto(); }} style={{ ...inputNovo, flex: "0 1 120px" }} />
            <button onClick={addCusto} className="ccib-btn" style={btnLinha}><Plus size={14} /> Custo</button>
          </div>

          {moedasCusto.length > 0 && (
            <div style={{ background: "#FAFBFC", border: "1px solid #EEF1F5", borderRadius: 10, padding: "12px 14px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, ...labelStyle }}><Coins size={12} /> Câmbio para {moeda}</div>
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                {moedasCusto.map((m) => (
                  <label key={m} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#566175" }}>
                    1 {m} =
                    <input value={cambio[m] || ""} inputMode="decimal" placeholder="0,00" onChange={(e) => patch({ cambio: { ...cambio, [m]: e.target.value } })} style={{ ...inputNovo, width: 90, fontFamily: mono }} />
                    {moeda}
                  </label>
                ))}
              </div>
            </div>
          )}

          {Object.keys(c.porCategoria).length > 0 && (
            <>
              <div style={labelStyle}>Gasto por categoria ({moeda})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(c.porCategoria).sort((a, b) => b[1] - a[1]).map(([cat, v]) => (
                  <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 150, fontSize: 12.5, color: "#1B2438", flexShrink: 0 }}>{cat}</span>
                    <div style={{ flex: 1 }}><Barra valor={v} max={maxCat} cor={COR_CUSTO} rotulo={`${dinheiro(v, moeda)} · ${c.gasto ? Math.round((v / c.gasto) * 100) : 0}%`} titulo={`${cat}: ${dinheiro(v, moeda)}`} /></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Indicadores e simulação */}
        <div style={secao}>
          <TituloSecao icon={Calculator}>Indicadores e simulação</TituloSecao>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <Kpi icon={Scale} label="Ponto de equilíbrio" valor={c.equilibrio != null ? `${c.equilibrio} pagante${c.equilibrio === 1 ? "" : "s"}` : "—"} sub={c.equilibrio != null ? "Mínimo para cobrir o gasto atual" : "Preencha o valor base"} />
            <Kpi icon={Users} label="Custo individual" valor={dinheiro(c.custoPorPagante, moeda)} sub={c.pagantes.length ? `Gasto ÷ ${c.pagantes.length} pagante${c.pagantes.length === 1 ? "" : "s"}` : "Sem pagantes ainda"} />
            <Kpi icon={TrendingUp} label="Se bater a meta" valor={c.meta && c.valorBase != null ? dinheiro(c.meta * c.valorBase + c.extras - c.gasto, moeda) : "—"} sub={c.meta ? `Resultado com ${c.meta} pagantes e o gasto atual` : "Preencha a meta de participantes"} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: "#F7F8FA", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#566175" }}>
            <span>E se a missão tiver</span>
            <input value={simulados} inputMode="numeric" placeholder={String(c.meta || c.pagantes.length || 0)} onChange={(e) => setSimulados(e.target.value)} style={{ ...inputNovo, width: 64, fontFamily: mono, textAlign: "center" }} />
            <span>pagantes?</span>
            {simArrecadado != null ? (
              <span>Arrecadado <b style={{ color: "#0B2545" }}>{dinheiro(simArrecadado, moeda)}</b>, resultado <Resultado valor={simResultado} moeda={moeda} /></span>
            ) : (
              <span style={{ color: "#8992A6" }}>{c.valorBase == null ? "Preencha o valor base para simular." : "Digite um número."}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function novaMissao() {
  return {
    id: novoId("p"),
    nome: "",
    descricao: "",
    status: "planejamento",
    responsavel: "ambos",
    estado: "",
    local: "",
    dataPrevista: "",
    dataFim: "",
    parceiros: "",
    etapas: [],
    participantes: [],
    empresasVisitadas: [],
    custos: [],
    receitasExtras: [],
    cambio: {},
    painelMissao: painelMissaoPadrao(),
    missao: true,
    resultados: "",
    notas: "",
    createdAt: Date.now(),
  };
}

export default function MissoesTab({ abertaInicial, limparAbertaInicial }) {
  const [projetos, atualizar] = useProjetos();
  const [abertoId, setAbertoId] = useState(abertaInicial || null);
  const [ficha, setFicha] = useState(false);

  const abrir = (id) => {
    setAbertoId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const voltar = () => {
    setAbertoId(null);
    if (limparAbertaInicial) limparAbertaInicial();
  };

  if (!projetos) return <div style={{ color: "#8992A6", fontSize: 13 }}>Carregando missões…</div>;

  const aberta = abertoId && projetos.find((p) => p.id === abertoId);
  if (aberta) {
    const patchAberta = (mudanca) => atualizar(projetos.map((x) => (x.id === aberta.id ? { ...x, ...mudanca } : x)));
    if (ficha) {
      return (
        <ProjetoDetalhe
          key={`ficha-${aberta.id}`}
          p={aberta}
          patch={patchAberta}
          rotuloVoltar="Voltar ao financeiro da missão"
          voltar={() => { setFicha(false); window.scrollTo({ top: 0 }); }}
          abrirMissao={() => { setFicha(false); window.scrollTo({ top: 0 }); }}
          remover={() => {
            if (window.confirm(`Remover a missão "${aberta.nome || "sem nome"}"? Os dados dela serão apagados para todos.`)) {
              atualizar(projetos.filter((x) => x.id !== aberta.id));
              setFicha(false);
              voltar();
            }
          }}
        />
      );
    }
    return (
      <MissaoDetalhe
        key={aberta.id}
        p={aberta}
        voltar={voltar}
        abrirFicha={() => { setFicha(true); window.scrollTo({ top: 0 }); }}
        patch={patchAberta}
      />
    );
  }

  const missoes = projetos
    .filter(ehMissao)
    .map((p) => ({ p, c: calcularMissao(p) }))
    .sort((a, b) => (a.p.dataPrevista || "9999").localeCompare(b.p.dataPrevista || "9999"));

  const totais = {};
  missoes.forEach(({ c }) => {
    const t = (totais[c.moeda] = totais[c.moeda] || { arrecadado: 0, gasto: 0 });
    t.arrecadado += c.arrecadado;
    t.gasto += c.gasto;
  });
  const somar = (campo) => Object.entries(totais).filter(([, t]) => t[campo]).map(([m, t]) => dinheiro(t[campo], m)).join(" + ") || dinheiro(0, "BRL");
  const resultados = Object.entries(totais).filter(([, t]) => t.arrecadado || t.gasto);

  const adicionar = () => {
    const m = novaMissao();
    atualizar([...projetos, m]);
    abrir(m.id);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 600, fontSize: 24, margin: 0, color: "#0B2545" }}>Missões empresariais</h2>
          <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8992A6", marginTop: 4 }}>
            {missoes.length} miss{missoes.length === 1 ? "ão" : "ões"} · arrecadado, gasto e resultado
          </div>
        </div>
        <button onClick={adicionar} className="ccib-btn ccib-btn-solid" style={{ display: "flex", alignItems: "center", gap: 6, background: "#0B2545", color: "#FFFFFF", border: "1px solid #0B2545", borderRadius: 7, padding: "8px 16px", fontWeight: 500, fontSize: 13, cursor: "pointer" }}>
          <Plus size={15} /> Nova missão
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
        <Kpi icon={Wallet} label="Total arrecadado" valor={somar("arrecadado")} cor={COR_RECEITA} />
        <Kpi icon={Receipt} label="Total gasto" valor={somar("gasto")} cor={COR_CUSTO} />
        <Kpi
          icon={Scale}
          label="Saldo final acumulado"
          valor={resultados.length ? resultados.map(([m, t]) => <div key={m}><Resultado valor={t.arrecadado - t.gasto} moeda={m} grande /></div>) : "—"}
          cor="#0E7C3A"
        />
      </div>

      <EvolucaoMissoes missoes={missoes} abrir={abrir} />

      {missoes.length === 0 && <div style={{ padding: "30px 0", textAlign: "center", color: "#8992A6", fontSize: 13 }}>Nenhuma missão cadastrada.</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))", gap: 16 }}>
        {missoes.map(({ p, c }) => <MissaoResumo key={p.id} p={p} c={c} abrir={() => abrir(p.id)} />)}
      </div>
    </div>
  );
}
