import React, { useEffect, useMemo, useRef, useState } from "react";
import { Ship, Package, MapPin, BarChart3, FileSpreadsheet, FileText } from "lucide-react";
import { filterInputStyle, labelStyle } from "../styles";
import { COMERCIO_SUL_INDIA } from "../data/comercioSulIndia";
import { PRODUTOS_SH4, DESCRICOES_SH4 } from "../data/comercioProdutos";
import { CIDADES, CIDADES_PRODUTOS } from "../data/comercioCidades";

// Nome curto do SH4 para o ranking (a descrição completa fica no texto ao passar o mouse)
function nomeCurto(desc) {
  const t = (desc || "").trim();
  if (t.length <= 90) return t;
  const corte = t.slice(0, 90).search(/[,;(]\s[^,;(]*$/);
  return (corte > 30 ? t.slice(0, corte) : t.slice(0, 87)).trim().replace(/[.,;]+$/, "") + "…";
}

const fluxoDe = (f) => (f === "e" ? "exportacao" : "importacao");
// Municípios e os principais produtos de cada um (consulta "Por Município" do Comex Stat)
const CIDADES_LISTA = Object.entries(CIDADES).flatMap(([uf, linhas]) => linhas.map(([ano, f, cidade, valor]) => ({ ano, uf, fluxo: fluxoDe(f), cidade, valor })));
const CIDADES_PROD = Object.entries(CIDADES_PRODUTOS).flatMap(([uf, linhas]) => linhas.map(([ano, f, cidade, codigo, valor]) => ({ ano, uf, fluxo: fluxoDe(f), cidade, codigo, valor })));

// Produtos de cada estado, no mesmo formato dos demais dados da aba
const PRODUTOS = Object.entries(PRODUTOS_SH4).flatMap(([uf, linhas]) =>
  linhas.map(([ano, f, codigo, valor]) => ({ ano, uf, fluxo: f === "e" ? "exportacao" : "importacao", codigo, produto: DESCRICOES_SH4[codigo] || codigo, valor }))
);

const mono = "'IBM Plex Mono', monospace";
const serif = "'Fraunces', serif";

const COR_EXP = "#0E7C3A";
const COR_IMP = "#2F6FB0";
const UFS = [
  { uf: "PR", nome: "Paraná", de: "do Paraná", cor: "#E8964F" },
  { uf: "SC", nome: "Santa Catarina", de: "de Santa Catarina", cor: "#6F8F68" },
  { uf: "RS", nome: "Rio Grande do Sul", de: "do Rio Grande do Sul", cor: "#5E7FA6" },
];
const FLUXOS = {
  exportacao: { label: "Exportações para a Índia", curto: "Exportações", cor: COR_EXP },
  importacao: { label: "Importações da Índia", curto: "Importações", cor: COR_IMP },
};

const card = { background: "#FFFFFF", border: "1px solid #E6E9EF", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 2px rgba(11,37,69,0.04), 0 8px 22px -8px rgba(11,37,69,0.12)" };

// US$ em formato curto: US$ 1,2 bi / US$ 345,6 mi / US$ 12,3 mil
function usd(v) {
  const n = Number(v) || 0;
  const a = Math.abs(n);
  const f = (x, d = 1) => x.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  if (a >= 1e9) return `US$ ${f(n / 1e9)} bi`;
  if (a >= 1e6) return `US$ ${f(n / 1e6)} mi`;
  if (a >= 1e3) return `US$ ${f(n / 1e3)} mil`;
  return `US$ ${f(n, 0)}`;
}
const pct = (v, d = 1) => `${(v * 100).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d })}%`;
const soma = (lista) => lista.reduce((s, x) => s + (Number(x.valor ?? x.valorIndia) || 0), 0);

function Titulo({ icon: Icon, children, extra }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
      {Icon && <Icon size={16} style={{ color: "#B8752E" }} />}
      <h3 style={{ fontFamily: serif, fontWeight: 600, fontSize: 17, margin: 0, color: "#0B2545", flex: 1 }}>{children}</h3>
      {extra}
    </div>
  );
}

function Kpi({ label, valor, sub, cor = "#0B2545" }) {
  return (
    <div style={{ ...card, padding: "14px 16px", borderTop: `3px solid ${cor}`, minWidth: 0 }}>
      <div style={{ ...labelStyle, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 26, color: "#0B2545", lineHeight: 1.1 }}>{valor}</div>
      {sub && <div style={{ fontSize: 11.5, color: "#8992A6", marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

const normalizar = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Variação percentual de um ano para o outro (null quando não há base de comparação)
const variacao = (atual, anterior) => (anterior ? (atual - anterior) / Math.abs(anterior) : null);
function Variacao({ v, parcial }) {
  if (parcial) return <span style={{ fontFamily: mono, fontSize: 11, color: "#8992A6" }}>ano parcial</span>;
  if (v == null) return <span style={{ fontFamily: mono, fontSize: 11, color: "#8992A6" }}>sem base</span>;
  const sobe = v >= 0;
  return (
    <span style={{ fontFamily: mono, fontSize: 11.5, fontWeight: 600, color: sobe ? COR_EXP : "#C1502E" }}>
      {sobe ? "▲" : "▼"} {pct(Math.abs(v))}
    </span>
  );
}

// Botões segmentados (exportações/importações, estados)
function Segmentos({ opcoes, valor, onChange, rotulo }) {
  return (
    <div role="group" aria-label={rotulo} style={{ display: "flex", border: "1px solid #D6DAE2", borderRadius: 7, overflow: "hidden", flexShrink: 0 }}>
      {opcoes.map((o) => {
        const ativo = valor === o.valor;
        return (
          <button key={o.valor} type="button" aria-pressed={ativo} onClick={() => onChange(o.valor)} style={{ border: "none", padding: "5px 11px", fontSize: 12, cursor: "pointer", background: ativo ? o.cor || "#0B2545" : "transparent", color: ativo ? "#FFFFFF" : "#566175", fontWeight: ativo ? 600 : 400 }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// Ranking com busca, barra horizontal, valor e participação no total.
// A posição mostrada é sempre a do ranking completo, mesmo com a busca ativa.
function Ranking({ itens, total, cor, vazio, detalhe, buscaPlaceholder, rodape }) {
  const [aberto, setAberto] = useState(null);
  const [busca, setBusca] = useState("");
  const [todos, setTodos] = useState(false);
  const q = normalizar(busca.trim());
  const filtrados = q ? itens.filter((i) => normalizar(`${i.nome} ${i.completo} ${i.chave} ${i.extra}`).includes(q)) : itens;
  const visiveis = q || todos ? filtrados : filtrados.slice(0, 10);
  const max = Math.max(1, ...itens.map((i) => i.valor));
  return (
    <div>
      {itens.length > 0 && (
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={buscaPlaceholder}
          aria-label={buscaPlaceholder}
          style={{ ...filterInputStyle, width: "100%", boxSizing: "border-box", padding: "6px 10px", fontSize: 12.5, marginBottom: 14 }}
        />
      )}
      {!itens.length ? <div style={{ fontSize: 13, color: "#8992A6" }}>{vazio}</div> : !visiveis.length ? (
        <div style={{ fontSize: 13, color: "#8992A6" }}>Nada encontrado para "{busca}".</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: q || todos ? 620 : "none", overflowY: q || todos ? "auto" : "visible", paddingRight: q || todos ? 4 : 0 }}>
          {visiveis.map((i) => (
            <div
              key={i.chave}
              title={`${i.completo || i.nome}: ${usd(i.valor)} (${total ? pct(i.valor / total) : "-"} do total)${detalhe ? " · clique para ver a pauta" : ""}`}
              onClick={detalhe ? () => setAberto(aberto === i.chave ? null : i.chave) : undefined}
              style={detalhe ? { cursor: "pointer", borderRadius: 8, background: aberto === i.chave ? "#F7F8FA" : "transparent", padding: aberto === i.chave ? "6px 6px 10px" : 0, margin: aberto === i.chave ? "-6px" : 0 } : undefined}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: mono, fontSize: 10.5, color: "#8992A6", width: 22 }}>{i.posicao}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: "#1B2438", lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {i.nome}
                  {i.extra && <span style={{ fontFamily: mono, fontSize: 10.5, color: "#8992A6", marginLeft: 6 }}>{i.extra}</span>}
                </span>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#1B2438" }}>{usd(i.valor)}</span>
                <span style={{ fontFamily: mono, fontSize: 11.5, color: "#566175", width: 52, textAlign: "right" }}>{total ? (i.valor / total < 0.001 ? "<0,1%" : pct(i.valor / total)) : ""}</span>
              </div>
              <div style={{ marginLeft: 30, height: 8, background: "#F1F3F7", borderRadius: 4 }}>
                <div style={{ width: `${Math.max(1.5, (i.valor / max) * 100)}%`, height: "100%", background: cor, borderRadius: 4 }} />
              </div>
              {detalhe && aberto === i.chave && <div style={{ marginLeft: 30, marginTop: 10 }} onClick={(e) => e.stopPropagation()}>{detalhe(i)}</div>}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        {!q && itens.length > 10 && (
          <button type="button" onClick={() => setTodos(!todos)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, color: "#2F6FB0", fontWeight: 500 }}>
            {todos ? "Mostrar só os 10 primeiros" : `Ver todos (${itens.length})`}
          </button>
        )}
        {q && <span style={{ fontSize: 11.5, color: "#8992A6" }}>{filtrados.length} de {itens.length}</span>}
        {rodape && <span style={{ fontSize: 11, color: "#8992A6", marginLeft: "auto" }}>{rodape}</span>}
      </div>
    </div>
  );
}

// Ticks "redondos" para o eixo de valores
function ticksDe(min, max, n = 4) {
  const bruto = (max - min) / n || 1;
  const mag = 10 ** Math.floor(Math.log10(bruto));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((p) => p >= bruto);
  const ini = Math.floor(min / passo) * passo;
  const out = [];
  for (let v = ini; v <= max + passo * 0.001; v += passo) out.push(Math.round(v / passo) * passo);
  if (out[out.length - 1] < max) out.push(out[out.length - 1] + passo);
  return out;
}

// Barra com a ponta arredondada e a base reta, apoiada no zero
function barra(x, y0, y1, w, r = 3) {
  const h = Math.abs(y1 - y0);
  if (h < 0.5) return "";
  const rr = Math.min(r, h, w / 2);
  const topo = Math.min(y0, y1);
  return `M${x},${y0} V${topo + rr} Q${x},${topo} ${x + rr},${topo} H${x + w - rr} Q${x + w},${topo} ${x + w},${topo + rr} V${y0} Z`;
}

const COR_SALDO = "#B8752E";
const PERIODOS = [{ valor: 5, label: "5 anos" }, { valor: 10, label: "10 anos" }, { valor: 0, label: "Todos" }];

// Exportações e importações por ano (barras), saldo (linha), variação e ano selecionado em destaque
function Evolucao({ linhas, parciais = [], anoSel, onAno }) {
  const [periodo, setPeriodo] = useState(10);
  const [hover, setHover] = useState(null);
  const [tabela, setTabela] = useState(false);
  const [largura, setLargura] = useState(900);
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setLargura(Math.max(300, Math.floor(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  // O período sempre inclui o ano selecionado nos filtros
  let vis = periodo ? linhas.slice(-periodo) : linhas;
  if (anoSel != null && !vis.some((l) => l.ano === anoSel)) {
    const i = linhas.findIndex((l) => l.ano === anoSel);
    vis = linhas.slice(i, i + (periodo || linhas.length));
  }
  const comp = [];
  linhas.forEach((l, i) => comp.push({ ...l, saldo: l.exp - l.imp, anterior: comp[i - 1] || null, parcial: parciais.includes(l.ano) }));
  const porAno = new Map(comp.map((l) => [l.ano, l]));
  const pontos = vis.map((l) => porAno.get(l.ano));

  const alt = 250, mE = 64, mD = 12, mT = 12, mB = 26;
  const larg = largura - mE - mD;
  const yMax = Math.max(1, ...pontos.flatMap((l) => [l.exp, l.imp, l.saldo]));
  const yMin = Math.min(0, ...pontos.map((l) => l.saldo));
  const ticks = ticksDe(yMin, yMax);
  const lo = ticks[0], hi = ticks[ticks.length - 1];
  const y = (v) => mT + (1 - (v - lo) / (hi - lo)) * (alt - mT - mB);
  const passo = larg / pontos.length;
  const bw = Math.max(3, Math.min(26, passo * 0.32));
  const cx = (i) => mE + passo * i + passo / 2;
  const poucos = pontos.length <= 12;
  const sel = porAno.get(anoSel);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#566175", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: COR_EXP }} /> Exportações</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: COR_IMP }} /> Importações</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 16, height: 2, background: COR_SALDO, position: "relative" }}><span style={{ position: "absolute", left: 4, top: -3, width: 8, height: 8, borderRadius: "50%", background: COR_SALDO }} /></span> Saldo (exp. − imp.)</span>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Segmentos rotulo="Período do gráfico" opcoes={PERIODOS} valor={periodo} onChange={setPeriodo} />
        </div>
      </div>

      <div ref={ref} style={{ position: "relative" }} onMouseLeave={() => setHover(null)}>
        <svg width={largura} height={alt} role="img" aria-label="Evolução anual das exportações, importações e saldo com a Índia" style={{ display: "block", maxWidth: "100%" }}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={mE} x2={largura - mD} y1={y(t)} y2={y(t)} stroke={t === 0 ? "#B7BEC9" : "#EEF0F4"} strokeWidth={1} />
              <text x={mE - 8} y={y(t) + 3.5} textAnchor="end" style={{ fontFamily: mono, fontSize: 10, fill: "#8992A6" }}>{usd(t).replace("US$ ", "")}</text>
            </g>
          ))}
          {pontos.map((l, i) => {
            const selecionado = l.ano === anoSel;
            const x = cx(i);
            return (
              <g key={l.ano} style={{ cursor: "pointer" }} onClick={() => onAno(l.ano)} onMouseEnter={() => setHover(i)}>
                <rect x={mE + passo * i + 1} y={mT - 6} width={passo - 2} height={alt - mT - mB + 6} rx={6} fill={selecionado ? "#FFF3E4" : hover === i ? "#F4F6F9" : "transparent"} />
                <g opacity={l.parcial ? 0.45 : 1}>
                  <path d={barra(x - bw - 1, y(0), y(l.exp), bw)} fill={COR_EXP} />
                  <path d={barra(x + 1, y(0), y(l.imp), bw)} fill={COR_IMP} />
                </g>
                <text x={x} y={alt - 8} textAnchor="middle" style={{ fontFamily: mono, fontSize: poucos ? 11 : 9.5, fill: selecionado ? "#0B2545" : "#566175", fontWeight: selecionado ? 700 : 400 }}>
                  {poucos || selecionado || i % 2 === (pontos.length - 1) % 2 ? (poucos ? l.ano : `'${String(l.ano).slice(2)}`) : ""}
                </text>
              </g>
            );
          })}
          <polyline points={pontos.map((l, i) => `${cx(i)},${y(l.saldo)}`).join(" ")} fill="none" stroke={COR_SALDO} strokeWidth={2} strokeLinejoin="round" style={{ pointerEvents: "none" }} />
          {pontos.map((l, i) => (
            <circle key={l.ano} cx={cx(i)} cy={y(l.saldo)} r={l.ano === anoSel ? 5.5 : 4} fill={COR_SALDO} stroke="#FFFFFF" strokeWidth={2} style={{ pointerEvents: "none" }} />
          ))}
        </svg>
        {hover != null && pontos[hover] && (() => {
          const l = pontos[hover];
          const x = cx(hover);
          const esquerda = x > largura - 270;
          return (
            <div style={{ position: "absolute", top: 6, left: esquerda ? x - 262 : x + 14, width: 248, background: "#FFFFFF", border: "1px solid #E6E9EF", borderRadius: 10, padding: "10px 12px", boxShadow: "0 8px 22px -8px rgba(11,37,69,0.25)", pointerEvents: "none", zIndex: 2 }}>
              <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, color: "#0B2545", marginBottom: 6 }}>{l.ano}{l.parcial ? " (parcial)" : ""}</div>
              {[["Exportações", l.exp, COR_EXP, l.anterior?.exp], ["Importações", l.imp, COR_IMP, l.anterior?.imp]].map(([n, v, c, ant]) => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#1B2438", marginBottom: 3 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                  <span style={{ flex: 1 }}>{n}</span>
                  <span style={{ fontFamily: mono, whiteSpace: "nowrap" }}>{usd(v)}</span>
                  <span style={{ width: 66, textAlign: "right", whiteSpace: "nowrap" }}><Variacao v={variacao(v, ant)} parcial={l.parcial} /></span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#1B2438", borderTop: "1px solid #EEF0F4", paddingTop: 5, marginTop: 4 }}>
                <span style={{ width: 8, height: 2, background: COR_SALDO }} />
                <span style={{ flex: 1 }}>Saldo</span>
                <span style={{ fontFamily: mono, fontWeight: 600 }}>{usd(l.saldo)}</span>
              </div>
              <div style={{ fontSize: 10.5, color: "#8992A6", marginTop: 6 }}>Clique para selecionar o ano</div>
            </div>
          );
        })()}
      </div>

      {sel && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))", gap: 10, marginTop: 14, background: "#FAFBFC", border: "1px solid #EEF0F4", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 15, color: "#0B2545", alignSelf: "center" }}>
            {sel.ano}{sel.parcial ? " (parcial)" : ""}
            <div style={{ fontFamily: mono, fontSize: 10, fontWeight: 400, color: "#8992A6", letterSpacing: "0.04em", marginTop: 2 }}>vs {sel.anterior ? sel.anterior.ano : "sem ano anterior"}</div>
          </div>
          {[["Exportações", sel.exp, sel.anterior?.exp], ["Importações", sel.imp, sel.anterior?.imp], ["Corrente", sel.exp + sel.imp, sel.anterior ? sel.anterior.exp + sel.anterior.imp : null], ["Saldo", sel.saldo, null]].map(([n, v, ant]) => (
            <div key={n}>
              <div style={{ ...labelStyle, marginBottom: 3 }}>{n}</div>
              <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 600, color: n === "Saldo" ? (v >= 0 ? COR_EXP : "#C1502E") : "#0B2545" }}>{usd(v)}</div>
              {n === "Saldo" ? (
                <span style={{ fontSize: 11, color: "#8992A6" }}>{sel.anterior ? `era ${usd(sel.anterior.saldo)}` : ""}</span>
              ) : <Variacao v={variacao(v, ant)} parcial={sel.parcial} />}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={() => setTabela(!tabela)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, color: "#2F6FB0", fontWeight: 500 }}>
          {tabela ? "Esconder tabela" : "Ver tabela ano a ano"}
        </button>
        {parciais.some((a) => pontos.some((l) => l.ano === a)) && (
          <span style={{ fontSize: 11.5, color: "#8992A6" }}>Barras mais claras: ano em andamento ({parciais.join(", ")}); a variação desse ano não é comparável.</span>
        )}
      </div>
      {tabela && (
        <div style={{ overflowX: "auto", marginTop: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ textAlign: "right", color: "#8992A6", fontFamily: mono, fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {["Ano", "Exportações", "Var.", "Importações", "Var.", "Corrente", "Saldo"].map((h, i) => <th key={i} style={{ padding: "6px 8px", borderBottom: "1px solid #E6E9EF", textAlign: i ? "right" : "left", fontWeight: 500 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[...comp].reverse().map((l) => (
                <tr key={l.ano} onClick={() => onAno(l.ano)} style={{ cursor: "pointer", background: l.ano === anoSel ? "#FFF3E4" : "transparent" }}>
                  <td style={{ padding: "5px 8px", fontFamily: mono, fontWeight: l.ano === anoSel ? 700 : 400 }}>{l.ano}{l.parcial ? "*" : ""}</td>
                  <td style={{ padding: "5px 8px", fontFamily: mono, textAlign: "right" }}>{usd(l.exp)}</td>
                  <td style={{ padding: "5px 8px", textAlign: "right" }}><Variacao v={variacao(l.exp, l.anterior?.exp)} parcial={l.parcial} /></td>
                  <td style={{ padding: "5px 8px", fontFamily: mono, textAlign: "right" }}>{usd(l.imp)}</td>
                  <td style={{ padding: "5px 8px", textAlign: "right" }}><Variacao v={variacao(l.imp, l.anterior?.imp)} parcial={l.parcial} /></td>
                  <td style={{ padding: "5px 8px", fontFamily: mono, textAlign: "right" }}>{usd(l.exp + l.imp)}</td>
                  <td style={{ padding: "5px 8px", fontFamily: mono, textAlign: "right", color: l.saldo >= 0 ? COR_EXP : "#C1502E" }}>{usd(l.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {parciais.length > 0 && <div style={{ fontSize: 11, color: "#8992A6", marginTop: 6 }}>* ano parcial</div>}
        </div>
      )}
    </div>
  );
}

// Resumo de uma página (estado ou Região Sul) para imprimir ou salvar em PDF, gerado direto dos dados da aba
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const mi = (v) => (v / 1e6).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
// Corta no fim de uma palavra, sem deixar pontuação solta
const cortar = (t, n) => (t.length <= n ? t : t.slice(0, n).replace(/\s+\S*$/, "").replace(/[\s.,;(]+$/, "") + "…");
const sinal = (v) => `${v > 0 ? "+" : ""}${mi(v)}`;
const varPct = (a, b) => (b ? `${a >= b ? "+" : ""}${(((a - b) / Math.abs(b)) * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%` : "");

function resumoHTML(ufSel, ano) {
  const dados = COMERCIO_SUL_INDIA;
  const parciais = dados.anosParciais || [];
  const ufs = ufSel === "sul" ? UFS.map((e) => e.uf) : [ufSel];
  const info = ufSel === "sul" ? { nome: "Região Sul", de: "da Região Sul" } : UFS.find((e) => e.uf === ufSel);
  const total = (a, f) => soma(dados.totais.filter((x) => x.ano === a && ufs.includes(x.uf) && x.fluxo === f));
  const totalSul = (a, f) => soma(dados.totais.filter((x) => x.ano === a && x.fluxo === f));
  const part = (f) => {
    let india = 0, mundo = 0;
    for (const u of ufs) {
      const l = dados.totais.find((x) => x.ano === ano && x.uf === u && x.fluxo === f);
      if (!l || !l.valorMundo) return null;
      const cid = CIDADES_LISTA.filter((x) => x.ano === ano && x.uf === u && x.fluxo === f);
      india += cid.length ? soma(cid) : Number(l.valorIndia) || 0;
      mundo += Number(l.valorMundo);
    }
    return mundo ? india / mundo : null;
  };
  const ant = ano - 1;
  const ultimo = Math.max(...dados.totais.map((x) => x.ano));
  const mostraParcial = parciais.includes(ultimo) && ultimo > ano;
  const linha = (a) => ({ e: total(a, "exportacao"), i: total(a, "importacao") });
  const [L0, L1, LP] = [linha(ant), linha(ano), linha(ultimo)];
  const pE = part("exportacao"), pI = part("importacao");

  const top = (lista, chave, n = 5) => {
    const m = new Map();
    lista.forEach((x) => m.set(chave(x), (m.get(chave(x)) || 0) + x.valor));
    const tot = [...m.values()].reduce((s, v) => s + v, 0);
    return { tot, itens: [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n) };
  };
  const prod = (f) => top(PRODUTOS.filter((x) => x.ano === ano && ufs.includes(x.uf) && x.fluxo === f), (x) => x.codigo);
  const cid = (f) => top(CIDADES_LISTA.filter((x) => x.ano === ano && ufs.includes(x.uf) && x.fluxo === f), (x) => (ufSel === "sul" ? `${x.cidade} (${x.uf})` : x.cidade));
  const [pe, pi] = [prod("exportacao"), prod("importacao")];
  const baseProd = (f) => (f === "exportacao" ? L1.e : L1.i);
  const linhasProd = [0, 1, 2, 3, 4].map((k) => {
    const c = (p, f) => {
      const it = p.itens[k];
      if (!it) return "<td></td><td></td><td></td>";
      return `<td>${esc(cortar(DESCRICOES_SH4[it[0]] || it[0], 62))} <span class="cod">${esc(it[0])}</span></td><td class="n">${mi(it[1])}</td><td class="n">${((it[1] / baseProd(f)) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}</td>`;
    };
    return `<tr>${c(pe, "exportacao")}${c(pi, "importacao")}</tr>`;
  }).join("");
  const listaCid = (r) => r.itens.map(([n, v]) => `${esc(n)} (${((v / r.tot) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%)`).join(", ");

  // Gráfico dos últimos 10 anos completos
  const anosG = [...new Set(dados.totais.map((x) => x.ano))].filter((a) => !parciais.includes(a) && a <= ano).sort((a, b) => a - b).slice(-10);
  const serie = anosG.map((a) => ({ a, ...linha(a) }));
  const W = 680, H = 150, mx = Math.max(1, ...serie.flatMap((s) => [s.e, s.i])), passo = (W - 40) / serie.length, bw = Math.min(16, passo * 0.3);
  const yv = (v) => H - 20 - (v / mx) * (H - 34);
  const svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}"><line x1="40" x2="${W}" y1="${H - 20}" y2="${H - 20}" stroke="#B7BEC9"/>
    <text x="36" y="${yv(mx) + 4}" text-anchor="end" class="ax">${mi(mx)}</text><text x="36" y="${H - 17}" text-anchor="end" class="ax">0</text>
    ${serie.map((s, i) => { const x = 40 + passo * i + passo / 2; return `<rect x="${x - bw - 1}" y="${yv(s.e)}" width="${bw}" height="${H - 20 - yv(s.e)}" rx="2" fill="${COR_EXP}"/><rect x="${x + 1}" y="${yv(s.i)}" width="${bw}" height="${H - 20 - yv(s.i)}" rx="2" fill="${COR_IMP}"/><text x="${x}" y="${H - 5}" text-anchor="middle" class="ax${s.a === ano ? " b" : ""}">${s.a}</text>`; }).join("")}
  </svg>`;
  const g0 = serie[0], gN = serie[serie.length - 1];
  const cresc = (a, b) => (b ? (a / b >= 2 ? `foram multiplicadas por ${(a / b).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}` : `${a >= b ? "cresceram" : "caíram"} ${Math.abs(Math.round(((a - b) / b) * 100))}%`) : "");
  const saldo = L1.e - L1.i;
  const partSul = ufSel === "sul" ? "" : ` O estado responde por ${((L1.e / totalSul(ano, "exportacao")) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% das exportações e ${((L1.i / totalSul(ano, "importacao")) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% das importações do Sul com a Índia.`;
  const pct2 = (v) => (v * 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Resumo ${esc(info.nome)} e Índia ${ano}</title>
<style>
@page { size: A4; margin: 12mm 14mm; }
* { box-sizing: border-box; }
body { font-family: "IBM Plex Sans", Arial, sans-serif; color: #1B2438; font-size: 10.5px; line-height: 1.4; margin: 0; }
.wrap { max-width: 190mm; margin: 0 auto; padding: 8px 0; }
.faixa { height: 4px; background: linear-gradient(to right, #FF9933 33%, #FFFFFF 33% 66%, #0E7C3A 66%); border: 1px solid #eee; }
header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #0B2545; padding: 8px 0 6px; margin-bottom: 10px; }
h1 { font-family: Georgia, serif; font-size: 20px; margin: 0; color: #0B2545; }
.org { font-size: 9px; letter-spacing: .12em; text-transform: uppercase; color: #B8752E; font-weight: 600; }
.meta { font-size: 9px; color: #566175; text-align: right; }
.lead { font-size: 11.5px; margin: 0 0 10px; }
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
.kpi { border: 1px solid #E6E9EF; border-top: 3px solid var(--c); border-radius: 6px; padding: 6px 8px; }
.kpi .l { font-size: 8.5px; text-transform: uppercase; letter-spacing: .06em; color: #8992A6; }
.kpi .v { font-family: Georgia, serif; font-size: 16px; font-weight: 600; color: #0B2545; }
.kpi .s { font-size: 9px; color: #566175; }
h2 { font-family: Georgia, serif; font-size: 12.5px; color: #0B2545; margin: 12px 0 5px; }
table { width: 100%; border-collapse: collapse; font-size: 9.8px; }
th { text-align: left; font-size: 8.5px; text-transform: uppercase; letter-spacing: .05em; color: #8992A6; border-bottom: 1px solid #D6DAE2; padding: 3px 4px; font-weight: 500; }
td { padding: 3px 4px; border-bottom: 1px solid #F1F3F7; vertical-align: top; }
.n { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cod { color: #8992A6; font-size: 8.5px; }
.ax { font-size: 9px; fill: #566175; } .ax.b { font-weight: 700; fill: #0B2545; }
.leg { font-size: 9px; color: #566175; } .leg span { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin: 0 4px 0 10px; vertical-align: middle; }
.fonte { margin-top: 12px; padding-top: 6px; border-top: 1px solid #E6E9EF; font-size: 8.5px; color: #8992A6; }
.pos { color: ${COR_EXP}; } .neg { color: #C1502E; }
@media screen { body { background: #F4F5F8; } .wrap { background: #fff; padding: 14mm; margin: 16px auto; box-shadow: 0 2px 12px rgba(0,0,0,.08); } }
</style></head><body><div class="wrap">
<div class="faixa"></div>
<header><div><div class="org">Câmara de Comércio Índia Brasil (CCIB) · Regional Sul</div><h1>${esc(info.nome)} e Índia: comércio exterior ${ano}${parciais.includes(ano) ? " (parcial)" : ""}</h1></div>
<div class="meta">Fonte: ${esc(dados.fonte)}<br>US$ FOB · atualizado em ${esc(dados.atualizadoEm)}</div></header>
<p class="lead">Em ${ano}, ${ufSel === "sul" ? "a Região Sul" : ufSel === "SC" ? info.nome : `o ${info.nome}`} exportou <b>US$ ${mi(L1.e)} mi</b> para a Índia (${varPct(L1.e, L0.e)} sobre ${ant}) e importou <b>US$ ${mi(L1.i)} mi</b> (${varPct(L1.i, L0.i)}), com ${saldo >= 0 ? "superávit" : "déficit"} de <b class="${saldo >= 0 ? "pos" : "neg"}">US$ ${mi(Math.abs(saldo))} mi</b>.${pE != null && pI != null ? ` A Índia representa ${pct2(pE)}% das exportações e ${pct2(pI)}% das importações ${info.de}.` : ""}${partSul}</p>
<div class="kpis">
<div class="kpi" style="--c:${COR_EXP}"><div class="l">Exportações</div><div class="v">US$ ${mi(L1.e)} mi</div><div class="s">${varPct(L1.e, L0.e)} vs ${ant}</div></div>
<div class="kpi" style="--c:${COR_IMP}"><div class="l">Importações</div><div class="v">US$ ${mi(L1.i)} mi</div><div class="s">${varPct(L1.i, L0.i)} vs ${ant}</div></div>
<div class="kpi" style="--c:#B8752E"><div class="l">Corrente</div><div class="v">US$ ${mi(L1.e + L1.i)} mi</div><div class="s">${varPct(L1.e + L1.i, L0.e + L0.i)} vs ${ant}</div></div>
<div class="kpi" style="--c:${saldo >= 0 ? COR_EXP : "#C1502E"}"><div class="l">Saldo</div><div class="v">US$ ${sinal(saldo)} mi</div><div class="s">era US$ ${sinal(L0.e - L0.i)} mi em ${ant}</div></div>
</div>
<h2>Evolução (US$ mi)</h2>
<table><thead><tr><th>Indicador</th><th class="n">${ant}</th><th class="n">${ano}</th><th class="n">Var.</th>${mostraParcial ? `<th class="n">${ultimo} (parcial)</th>` : ""}</tr></thead><tbody>
<tr><td>Exportações para a Índia</td><td class="n">${mi(L0.e)}</td><td class="n">${mi(L1.e)}</td><td class="n">${varPct(L1.e, L0.e)}</td>${mostraParcial ? `<td class="n">${mi(LP.e)}</td>` : ""}</tr>
<tr><td>Importações da Índia</td><td class="n">${mi(L0.i)}</td><td class="n">${mi(L1.i)}</td><td class="n">${varPct(L1.i, L0.i)}</td>${mostraParcial ? `<td class="n">${mi(LP.i)}</td>` : ""}</tr>
<tr><td>Corrente de comércio</td><td class="n">${mi(L0.e + L0.i)}</td><td class="n">${mi(L1.e + L1.i)}</td><td class="n">${varPct(L1.e + L1.i, L0.e + L0.i)}</td>${mostraParcial ? `<td class="n">${mi(LP.e + LP.i)}</td>` : ""}</tr>
<tr><td>Saldo</td><td class="n">${sinal(L0.e - L0.i)}</td><td class="n">${sinal(saldo)}</td><td></td>${mostraParcial ? `<td class="n">${sinal(LP.e - LP.i)}</td>` : ""}</tr>
</tbody></table>
<div style="margin-top:8px"><div class="leg"><span style="background:${COR_EXP}"></span>Exportações<span style="background:${COR_IMP}"></span>Importações · ${g0.a} a ${gN.a}: exportações ${cresc(gN.e, g0.e)}; importações ${cresc(gN.i, g0.i)}</div>${svg}</div>
<h2>Principais produtos ${ano} (SH4, US$ mi e % do total com a Índia)</h2>
<table><thead><tr><th>Exporta para a Índia</th><th class="n">US$ mi</th><th class="n">%</th><th>Importa da Índia</th><th class="n">US$ mi</th><th class="n">%</th></tr></thead><tbody>${linhasProd}</tbody></table>
<h2>Municípios ${ano} (% da soma municipal)</h2>
<p style="margin:0 0 3px"><b>Exportadores:</b> ${listaCid(cid("exportacao")) || "sem dados"}.</p>
<p style="margin:0"><b>Importadores:</b> ${listaCid(cid("importacao")) || "sem dados"}.</p>
<div class="fonte">Fonte: ${esc(dados.fonte)}, valores em US$ FOB. Totais e produtos pela UF de origem do produto; municípios pela sede da empresa (a soma das cidades pode diferir do total). Participação da Índia calculada sobre a base municipal do Comex Stat.${parciais.length ? ` ${parciais.join(", ")}: ano parcial.` : ""} Gerado pela Plataforma CCIB Regional Sul em ${new Date().toLocaleDateString("pt-BR")}.</div>
</div><script>window.onload=function(){setTimeout(function(){window.print()},300)}</script></body></html>`;
}

function abrirResumo(uf, ano) {
  const w = window.open("", "_blank");
  if (!w) { window.alert("O navegador bloqueou a nova janela. Permita pop-ups para esta página e tente de novo."); return; }
  w.document.open();
  w.document.write(resumoHTML(uf, ano));
  w.document.close();
}

function SemDados() {
  return (
    <div style={{ ...card, textAlign: "center", padding: "40px 24px" }}>
      <FileSpreadsheet size={30} style={{ color: "#B8752E", marginBottom: 10 }} />
      <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 19, color: "#0B2545", marginBottom: 8 }}>Aguardando os dados de comércio exterior</div>
      <div style={{ fontSize: 13.5, color: "#566175", maxWidth: 620, margin: "0 auto", lineHeight: 1.55 }}>
        Esta aba mostra o comércio do Paraná, Santa Catarina e Rio Grande do Sul com a Índia: valores exportados e importados,
        participação da Índia na pauta de cada estado, principais produtos, cidades mais representativas e a evolução por ano.
        Assim que os dados do Comex Stat forem carregados, os painéis aparecem aqui.
      </div>
    </div>
  );
}

export default function ComercioTab() {
  const dados = COMERCIO_SUL_INDIA;
  const anos = useMemo(() => {
    const s = new Set([...dados.totais, ...dados.produtos, ...PRODUTOS, ...dados.cidades].map((x) => x.ano).filter(Boolean));
    return [...s].sort((a, b) => a - b);
  }, [dados]);
  const parciais = dados.anosParciais || [];
  const completos = anos.filter((a) => !parciais.includes(a));
  const ufsComDados = UFS.filter((e) => [...dados.totais, ...dados.produtos, ...dados.cidades].some((x) => x.uf === e.uf));
  const [ano, setAno] = useState(() => (completos.length ? completos[completos.length - 1] : anos[anos.length - 1] ?? null));
  // Enquanto só houver um estado carregado, a aba abre nele
  const [uf, setUf] = useState(() => (ufsComDados.length === 1 ? ufsComDados[0].uf : "sul"));
  const rotuloAno = (a) => `${a}${parciais.includes(a) ? " (parcial)" : ""}`;
  const [fluxo, setFluxo] = useState("exportacao");
  const topo = useRef(null);

  const temDados = anos.length > 0;
  const daUf = (x) => uf === "sul" || x.uf === uf;
  const doAno = (x) => x.ano === ano;

  const totais = dados.totais.filter((x) => doAno(x) && daUf(x));
  const tot = (f) => totais.filter((x) => x.fluxo === f);
  const exp = soma(tot("exportacao"));
  const imp = soma(tot("importacao"));
  // Participação da Índia na pauta: o total com o mundo vem da consulta por município do Comex Stat,
  // então a Índia também é somada pelos municípios (mesma base); sem dados de cidades, usa o total do estado.
  const participacao = (ufs, f) => {
    let indiaBase = 0, mundoBase = 0;
    for (const u of ufs) {
      const linha = dados.totais.find((x) => doAno(x) && x.uf === u && x.fluxo === f);
      if (!linha || !linha.valorMundo) return null;
      const cid = CIDADES_LISTA.filter((x) => doAno(x) && x.uf === u && x.fluxo === f);
      indiaBase += cid.length ? soma(cid) : Number(linha.valorIndia) || 0;
      mundoBase += Number(linha.valorMundo);
    }
    return mundoBase ? indiaBase / mundoBase : null;
  };
  const ufsFiltro = uf === "sul" ? UFS.map((e) => e.uf) : [uf];
  const partExp = participacao(ufsFiltro, "exportacao");
  const partImp = participacao(ufsFiltro, "importacao");

  // Agrupa por chave somando valores (para "Região Sul" juntar os três estados); a posição é a do ranking completo
  const agrupar = (lista, chave, nome, extra) => {
    const m = new Map();
    lista.forEach((x) => {
      const k = chave(x);
      const atual = m.get(k) || { chave: k, nome: nome(x), completo: x.produto || x.cidade || "", extra: extra ? extra(x) : "", valor: 0 };
      atual.valor += Number(x.valor) || 0;
      m.set(k, atual);
    });
    return [...m.values()].sort((a, b) => b.valor - a.valor).map((x, i) => ({ ...x, posicao: i + 1 }));
  };
  const todosProdutos = [...dados.produtos, ...PRODUTOS];
  const ufsComProdutos = UFS.filter((e) => todosProdutos.some((x) => x.uf === e.uf));
  const produtos = agrupar(todosProdutos.filter((x) => doAno(x) && daUf(x) && x.fluxo === fluxo), (x) => x.codigo || x.produto, (x) => nomeCurto(x.produto), (x) => x.codigo || "");
  const todasCidades = [...dados.cidades, ...CIDADES_LISTA];
  const ufsComCidades = UFS.filter((e) => todasCidades.some((x) => x.uf === e.uf && x.fluxo === fluxo));
  const cidades = agrupar(todasCidades.filter((x) => doAno(x) && daUf(x) && x.fluxo === fluxo), (x) => `${x.cidade}/${x.uf}`, (x) => x.cidade, (x) => (uf === "sul" ? x.uf : ""));
  // Base do % das cidades: soma dos municípios (o município é o da empresa, não o da origem do produto)
  const totalCidades = cidades.reduce((s, c) => s + c.valor, 0);

  // Pauta comercial do município com a Índia no ano: exportações, importações, saldo e principais produtos de cada lado
  const pautaDaCidade = (c) => {
    const [nomeCid, ufCid] = c.chave.split("/");
    const valorDe = (f) => soma(CIDADES_LISTA.filter((x) => doAno(x) && x.uf === ufCid && x.cidade === nomeCid && x.fluxo === f));
    const e = valorDe("exportacao"), i = valorDe("importacao");
    const lado = (f, total) => {
      const lista = CIDADES_PROD.filter((x) => doAno(x) && x.fluxo === f && x.uf === ufCid && x.cidade === nomeCid).sort((a, b) => b.valor - a.valor);
      return (
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: FLUXOS[f].cor, marginBottom: 4, fontWeight: 600 }}>
            {f === "exportacao" ? "Exporta" : "Importa"} · {usd(total)}
          </div>
          {!lista.length ? <div style={{ fontSize: 12, color: "#8992A6" }}>{total ? "Sem detalhe de produtos." : "Nada neste ano."}</div> : lista.map((p) => (
            <div key={p.codigo} title={DESCRICOES_SH4[p.codigo] || p.codigo} style={{ display: "flex", gap: 6, fontSize: 12, color: "#566175", marginBottom: 2 }}>
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nomeCurto(DESCRICOES_SH4[p.codigo] || p.codigo)}</span>
              <span style={{ fontFamily: mono, fontSize: 11.5 }}>{usd(p.valor)}</span>
              <span style={{ fontFamily: mono, fontSize: 11, width: 36, textAlign: "right" }}>{total && p.valor / total < 0.01 ? "<1%" : total ? pct(p.valor / total, 0) : ""}</span>
            </div>
          ))}
        </div>
      );
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, cursor: "default" }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "#566175" }}>
          <span style={{ fontFamily: serif, fontWeight: 600, fontSize: 13.5, color: "#0B2545" }}>Pauta de {nomeCid} com a Índia · {rotuloAno(ano)}</span>
          <span>Corrente <b style={{ fontFamily: mono }}>{usd(e + i)}</b></span>
          <span>Saldo <b style={{ fontFamily: mono, color: e - i >= 0 ? COR_EXP : "#C1502E" }}>{usd(e - i)}</b></span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {lado("exportacao", e)}
          {lado("importacao", i)}
        </div>
      </div>
    );
  };
  const totalFluxo = fluxo === "exportacao" ? exp : imp;
  const baseRanking = totalFluxo || soma(produtos);

  const porEstado = UFS.map((e) => {
    const linhas = dados.totais.filter((x) => doAno(x) && x.uf === e.uf);
    const ex = soma(linhas.filter((x) => x.fluxo === "exportacao"));
    const im = soma(linhas.filter((x) => x.fluxo === "importacao"));
    return { ...e, exp: ex, imp: im, valor: fluxo === "exportacao" ? ex : im, part: participacao([e.uf], fluxo), semDados: !ufsComDados.some((u) => u.uf === e.uf) };
  });
  const totalEstados = porEstado.reduce((s, e) => s + e.valor, 0);
  const abrirPerfil = (novaUf) => {
    setUf(novaUf);
    if (topo.current) window.scrollTo({ top: topo.current.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
  };

  const evolucao = anos.map((a) => {
    const l = dados.totais.filter((x) => x.ano === a && daUf(x));
    return { ano: a, exp: soma(l.filter((x) => x.fluxo === "exportacao")), imp: soma(l.filter((x) => x.fluxo === "importacao")) };
  });

  const cor = FLUXOS[fluxo].cor;
  const nomeUf = uf === "sul" ? "Região Sul" : UFS.find((e) => e.uf === uf).nome;
  const deUf = uf === "sul" ? "da Região Sul" : UFS.find((e) => e.uf === uf).de;
  const opcoesFluxo = Object.entries(FLUXOS).map(([k, f]) => ({ valor: k, label: f.curto, cor: f.cor }));
  const opcoesUf = [{ valor: "sul", label: "Sul" }, ...UFS.map((e) => ({ valor: e.uf, label: e.uf }))];

  return (
    <div ref={topo}>
      <div style={{ flex: 1, minWidth: 240, marginBottom: 14 }}>
        <h2 style={{ fontFamily: serif, fontWeight: 600, fontSize: 24, margin: 0, color: "#0B2545", display: "flex", alignItems: "center", gap: 10 }}>
          <Ship size={22} style={{ color: "#B8752E" }} /> Comércio Região Sul e Índia
        </h2>
        <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8992A6", marginTop: 4 }}>
          Paraná, Santa Catarina e Rio Grande do Sul · valores em US$ FOB{dados.fonte ? ` · fonte: ${dados.fonte}` : ""}{dados.atualizadoEm ? ` · atualizado em ${dados.atualizadoEm}` : ""}
        </div>
      </div>

      {temDados && (
        // Filtros fixos no topo: todos os painéis abaixo respondem a eles
        <div className="ccib-comercio-filtros" style={{ position: "sticky", top: 75, zIndex: 20, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(6px)", borderBottom: "1px solid #EEF0F4", padding: "10px 0", marginBottom: 18, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <select aria-label="Ano" value={ano ?? ""} onChange={(e) => setAno(Number(e.target.value))} style={{ ...filterInputStyle, width: "auto", padding: "6px 10px" }}>
            {[...anos].reverse().map((a) => <option key={a} value={a}>{rotuloAno(a)}</option>)}
          </select>
          <select aria-label="Estado" value={uf} onChange={(e) => setUf(e.target.value)} style={{ ...filterInputStyle, width: "auto", padding: "6px 10px" }}>
            <option value="sul">Região Sul</option>
            {UFS.map((e) => <option key={e.uf} value={e.uf}>{e.nome}</option>)}
          </select>
          <Segmentos rotulo="Fluxo" opcoes={opcoesFluxo} valor={fluxo} onChange={setFluxo} />
          <button
            type="button"
            onClick={() => abrirResumo(uf, ano)}
            title={`Abre um resumo de uma página ${deUf} em ${rotuloAno(ano)} para imprimir ou salvar em PDF`}
            className="ccib-btn"
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#0B2545", color: "#FFFFFF", border: "1px solid #0B2545", borderRadius: 7, padding: "6px 12px", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}
          >
            <FileText size={14} /> Resumo de 1 página
          </button>
          <span style={{ fontSize: 12, color: "#8992A6", marginLeft: "auto" }}>
            Mostrando <b style={{ color: "#0B2545" }}>{nomeUf}</b> · <b style={{ color: "#0B2545" }}>{rotuloAno(ano)}</b> · <b style={{ color: cor }}>{FLUXOS[fluxo].curto.toLowerCase()}</b>
          </span>
        </div>
      )}

      {!temDados ? <SemDados /> : (
        <>
          {ufsComDados.length < UFS.length && (
            <div style={{ background: "#FFF7EE", border: "1px solid #F6DFC4", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#7A4E1C", marginBottom: 16 }}>
              Dados carregados até agora: {ufsComDados.map((e) => e.nome).join(", ")}. Totais por estado, sem produtos e cidades ainda.
              {uf === "sul" ? " Em \"Região Sul\", os números somam só os estados já carregados." : ""}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 14, marginBottom: 22 }}>
            <Kpi label={`Exportações para a Índia · ${rotuloAno(ano)}`} valor={usd(exp)} cor={COR_EXP} sub={partExp != null ? `${pct(partExp, 2)} das exportações ${deUf}` : nomeUf} />
            <Kpi label={`Importações da Índia · ${rotuloAno(ano)}`} valor={usd(imp)} cor={COR_IMP} sub={partImp != null ? `${pct(partImp, 2)} das importações ${deUf}` : nomeUf} />
            <Kpi label="Corrente de comércio" valor={usd(exp + imp)} cor="#B8752E" sub="exportações + importações" />
            <Kpi label="Saldo comercial" valor={usd(exp - imp)} cor={exp - imp >= 0 ? COR_EXP : "#C1502E"} sub={`${exp - imp >= 0 ? "superávit" : "déficit"} ${deUf} com a Índia`} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 18, marginBottom: 18 }}>
            <div style={card}>
              <Titulo icon={Package} extra={<Segmentos rotulo="Fluxo dos produtos" opcoes={opcoesFluxo} valor={fluxo} onChange={setFluxo} />}>
                Produtos · {nomeUf}
              </Titulo>
              {uf === "sul" && ufsComProdutos.length > 0 && ufsComProdutos.length < UFS.length && (
                <div style={{ fontSize: 11.5, color: "#B8752E", marginTop: -6, marginBottom: 12 }}>
                  Produtos carregados até agora: {ufsComProdutos.map((e) => e.nome).join(", ")}. O % é sobre o total da Região Sul.
                </div>
              )}
              <Ranking
                key={`p-${fluxo}`}
                itens={produtos}
                total={baseRanking}
                cor={cor}
                buscaPlaceholder="Buscar produto ou código SH4 (ex.: soja, 1201, motores)"
                rodape="% do total com a Índia · 40 principais SH4 de cada estado"
                vazio={ufsComProdutos.some((e) => uf === "sul" || e.uf === uf) ? "Sem dados de produtos para este filtro." : "Produtos deste estado ainda não carregados."}
              />
            </div>
            <div style={card}>
              <Titulo icon={MapPin} extra={<Segmentos rotulo="Estado das cidades" opcoes={opcoesUf} valor={uf} onChange={setUf} />}>
                Cidades · {FLUXOS[fluxo].curto.toLowerCase()}
              </Titulo>
              {cidades.length > 0 && (
                <div style={{ fontSize: 11.5, color: "#8992A6", marginTop: -6, marginBottom: 12, lineHeight: 1.45 }}>
                  {totalFluxo && Math.abs(totalCidades - totalFluxo) / totalFluxo < 0.005
                    ? `Município da empresa ${fluxo === "exportacao" ? "exportadora" : "importadora"}; a soma das cidades (${usd(totalCidades)}) bate com o total ${deUf}.`
                    : `Município da empresa ${fluxo === "exportacao" ? "exportadora" : "importadora"}, por isso a soma das cidades (${usd(totalCidades)}) difere do total por estado de origem do produto.`}{" "}
                  Clique num município para ver a pauta completa com a Índia.
                  {uf === "sul" && ufsComCidades.length < UFS.length ? ` Cidades carregadas até agora: ${ufsComCidades.map((e) => e.nome).join(", ")}.` : ""}
                </div>
              )}
              <Ranking
                key={`c-${fluxo}-${uf}`}
                itens={cidades}
                total={totalCidades}
                cor={cor}
                detalhe={pautaDaCidade}
                buscaPlaceholder="Buscar município"
                rodape="% do total dos municípios"
                vazio={ufsComCidades.some((e) => uf === "sul" || e.uf === uf) ? "Sem dados de cidades para este filtro." : `${FLUXOS[fluxo].curto} por cidade ${deUf} ainda não carregadas.`}
              />
            </div>
          </div>

          <div style={{ ...card, marginBottom: 18 }}>
            <Titulo
              icon={MapPin}
              extra={uf !== "sul" ? (
                <button type="button" onClick={() => abrirPerfil("sul")} style={{ background: "none", border: "1px solid #D6DAE2", borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontSize: 12, color: "#566175" }}>Ver Região Sul</button>
              ) : <span style={{ fontSize: 11.5, color: "#8992A6" }}>clique num estado para abrir o perfil</span>}
            >
              Por estado · {FLUXOS[fluxo].curto.toLowerCase()} {rotuloAno(ano)}
            </Titulo>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 12 }}>
              {porEstado.map((e) => {
                const ativo = uf === e.uf;
                return (
                  <button
                    key={e.uf}
                    type="button"
                    onClick={() => abrirPerfil(ativo ? "sul" : e.uf)}
                    aria-pressed={ativo}
                    title={ativo ? "Voltar para a Região Sul" : `Abrir o perfil ${e.de}`}
                    className="ccib-kpi"
                    style={{ textAlign: "left", cursor: "pointer", background: ativo ? "#FFF7EE" : "#FFFFFF", border: `1px solid ${ativo ? "#E8C29A" : "#E6E9EF"}`, borderTop: `3px solid ${e.cor}`, borderRadius: 10, padding: "12px 14px", fontFamily: "inherit" }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "#1B2438" }}>{e.nome}</span>
                      <span style={{ fontFamily: mono, fontSize: 13, color: e.semDados ? "#B7BEC9" : "#0B2545", fontWeight: 600 }}>{e.semDados ? "sem dados" : usd(e.valor)}</span>
                    </div>
                    <div style={{ height: 8, background: "#F1F3F7", borderRadius: 4 }}>
                      <div style={{ width: totalEstados ? `${(e.valor / totalEstados) * 100}%` : 0, height: "100%", background: e.cor, borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 11.5, color: "#8992A6", marginTop: 6, lineHeight: 1.5 }}>
                      {e.semDados ? "Dados ainda não carregados" : totalEstados && ufsComDados.length === UFS.length ? `${pct(e.valor / totalEstados)} do Sul` : ""}{e.part != null ? ` · Índia = ${pct(e.part, 2)} da pauta do estado` : ""}
                    </div>
                    {!e.semDados && (
                      <div style={{ display: "flex", gap: 10, fontFamily: mono, fontSize: 11, color: "#566175", marginTop: 4, flexWrap: "wrap" }}>
                        <span>exp {usd(e.exp)}</span><span>imp {usd(e.imp)}</span>
                        <span style={{ color: e.exp - e.imp >= 0 ? COR_EXP : "#C1502E" }}>saldo {usd(e.exp - e.imp)}</span>
                      </div>
                    )}
                    <div style={{ fontSize: 11.5, color: "#2F6FB0", marginTop: 8, fontWeight: 500 }}>{ativo ? "Perfil aberto · clique para voltar ao Sul" : "Ver perfil do estado →"}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={card}>
            <Titulo icon={BarChart3}>Evolução anual · {nomeUf}</Titulo>
            <Evolucao linhas={evolucao} parciais={parciais} anoSel={ano} onAno={setAno} />
          </div>
        </>
      )}
    </div>
  );
}
