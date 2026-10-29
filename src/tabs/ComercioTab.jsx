import React, { useMemo, useState } from "react";
import { Ship, Package, MapPin, BarChart3, FileSpreadsheet } from "lucide-react";
import { filterInputStyle, labelStyle } from "../styles";
import { COMERCIO_SUL_INDIA } from "../data/comercioSulIndia";

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

// Ranking com barra horizontal, valor e participação no total
function Ranking({ itens, total, cor, vazio }) {
  if (!itens.length) return <div style={{ fontSize: 13, color: "#8992A6" }}>{vazio}</div>;
  const max = Math.max(...itens.map((i) => i.valor));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {itens.map((i, n) => (
        <div key={i.chave} title={`${i.nome}: ${usd(i.valor)} (${total ? pct(i.valor / total) : "-"} do total)`}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: mono, fontSize: 10.5, color: "#8992A6", width: 18 }}>{n + 1}</span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: "#1B2438", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {i.nome}
              {i.extra && <span style={{ fontFamily: mono, fontSize: 10.5, color: "#8992A6", marginLeft: 6 }}>{i.extra}</span>}
            </span>
            <span style={{ fontFamily: mono, fontSize: 12, color: "#1B2438" }}>{usd(i.valor)}</span>
            <span style={{ fontFamily: mono, fontSize: 11.5, color: "#566175", width: 52, textAlign: "right" }}>{total ? pct(i.valor / total) : ""}</span>
          </div>
          <div style={{ marginLeft: 26, height: 8, background: "#F1F3F7", borderRadius: 4 }}>
            <div style={{ width: `${Math.max(1.5, (i.valor / max) * 100)}%`, height: "100%", background: cor, borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Exportações e importações por ano, lado a lado
function Evolucao({ anos, linhas }) {
  const max = Math.max(1, ...linhas.flatMap((l) => [l.exp, l.imp]));
  const alt = 160;
  return (
    <div>
      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#566175", marginBottom: 10 }}>
        {Object.entries(FLUXOS).map(([k, f]) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: f.cor }} /> {f.curto}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: alt + 26, borderBottom: "1px solid #D6DAE2", padding: "0 6px" }}>
        {linhas.map((l) => (
          <div key={l.ano} style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 4, height: "100%" }}>
            {[["exp", COR_EXP, "Exportações"], ["imp", COR_IMP, "Importações"]].map(([k, cor, nome]) => (
              <div key={k} title={`${l.ano} · ${nome}: ${usd(l[k])}`} style={{ width: "40%", maxWidth: 34, height: l[k] ? Math.max(3, (l[k] / max) * alt) : 0, background: cor, borderRadius: "4px 4px 0 0" }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 18, padding: "6px 6px 0" }}>
        {anos.map((a) => <span key={a} style={{ flex: 1, textAlign: "center", fontFamily: mono, fontSize: 11, color: "#566175" }}>{a}</span>)}
      </div>
    </div>
  );
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
    const s = new Set([...dados.totais, ...dados.produtos, ...dados.cidades].map((x) => x.ano).filter(Boolean));
    return [...s].sort((a, b) => a - b);
  }, [dados]);
  const [ano, setAno] = useState(() => (anos.length ? anos[anos.length - 1] : null));
  const [uf, setUf] = useState("sul");
  const [fluxo, setFluxo] = useState("exportacao");

  const temDados = anos.length > 0;
  const daUf = (x) => uf === "sul" || x.uf === uf;
  const doAno = (x) => x.ano === ano;

  const totais = dados.totais.filter((x) => doAno(x) && daUf(x));
  const tot = (f) => totais.filter((x) => x.fluxo === f);
  const exp = soma(tot("exportacao"));
  const imp = soma(tot("importacao"));
  const mundo = (f) => tot(f).reduce((s, x) => s + (Number(x.valorMundo) || 0), 0);
  const partExp = mundo("exportacao") ? exp / mundo("exportacao") : null;
  const partImp = mundo("importacao") ? imp / mundo("importacao") : null;

  // Agrupa por chave somando valores (para "Região Sul" juntar os três estados)
  const agrupar = (lista, chave, nome, extra) => {
    const m = new Map();
    lista.forEach((x) => {
      const k = chave(x);
      const atual = m.get(k) || { chave: k, nome: nome(x), extra: extra ? extra(x) : "", valor: 0 };
      atual.valor += Number(x.valor) || 0;
      m.set(k, atual);
    });
    return [...m.values()].sort((a, b) => b.valor - a.valor);
  };
  const produtos = agrupar(dados.produtos.filter((x) => doAno(x) && daUf(x) && x.fluxo === fluxo), (x) => x.codigo || x.produto, (x) => x.produto, (x) => x.codigo || "");
  const cidades = agrupar(dados.cidades.filter((x) => doAno(x) && daUf(x) && x.fluxo === fluxo), (x) => `${x.cidade}/${x.uf}`, (x) => x.cidade, (x) => (uf === "sul" ? x.uf : ""));
  const totalFluxo = fluxo === "exportacao" ? exp : imp;
  const baseRanking = totalFluxo || soma(produtos);

  const porEstado = UFS.map((e) => {
    const linhas = dados.totais.filter((x) => doAno(x) && x.uf === e.uf && x.fluxo === fluxo);
    const v = soma(linhas);
    const m = linhas.reduce((s, x) => s + (Number(x.valorMundo) || 0), 0);
    return { ...e, valor: v, part: m ? v / m : null };
  });
  const totalEstados = porEstado.reduce((s, e) => s + e.valor, 0);

  const evolucao = anos.map((a) => {
    const l = dados.totais.filter((x) => x.ano === a && daUf(x));
    return { ano: a, exp: soma(l.filter((x) => x.fluxo === "exportacao")), imp: soma(l.filter((x) => x.fluxo === "importacao")) };
  });

  const cor = FLUXOS[fluxo].cor;
  const nomeUf = uf === "sul" ? "Região Sul" : UFS.find((e) => e.uf === uf).nome;
  const deUf = uf === "sul" ? "da Região Sul" : UFS.find((e) => e.uf === uf).de;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 600, fontSize: 24, margin: 0, color: "#0B2545", display: "flex", alignItems: "center", gap: 10 }}>
            <Ship size={22} style={{ color: "#B8752E" }} /> Comércio Região Sul e Índia
          </h2>
          <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8992A6", marginTop: 4 }}>
            Paraná, Santa Catarina e Rio Grande do Sul · valores em US$ FOB{dados.fonte ? ` · fonte: ${dados.fonte}` : ""}{dados.atualizadoEm ? ` · atualizado em ${dados.atualizadoEm}` : ""}
          </div>
        </div>
        {temDados && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select aria-label="Ano" value={ano ?? ""} onChange={(e) => setAno(Number(e.target.value))} style={{ ...filterInputStyle, width: "auto" }}>
              {anos.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <select aria-label="Estado" value={uf} onChange={(e) => setUf(e.target.value)} style={{ ...filterInputStyle, width: "auto" }}>
              <option value="sul">Região Sul</option>
              {UFS.map((e) => <option key={e.uf} value={e.uf}>{e.nome}</option>)}
            </select>
            <div style={{ display: "flex", border: "1px solid #D6DAE2", borderRadius: 7, overflow: "hidden" }}>
              {Object.entries(FLUXOS).map(([k, f]) => (
                <button key={k} type="button" onClick={() => setFluxo(k)} style={{ border: "none", padding: "8px 14px", fontSize: 13, cursor: "pointer", background: fluxo === k ? f.cor : "transparent", color: fluxo === k ? "#FFFFFF" : "#566175", fontWeight: fluxo === k ? 600 : 400 }}>
                  {f.curto}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!temDados ? <SemDados /> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 14, marginBottom: 22 }}>
            <Kpi label={`Exportações para a Índia · ${ano}`} valor={usd(exp)} cor={COR_EXP} sub={partExp != null ? `${pct(partExp, 2)} das exportações ${deUf}` : nomeUf} />
            <Kpi label={`Importações da Índia · ${ano}`} valor={usd(imp)} cor={COR_IMP} sub={partImp != null ? `${pct(partImp, 2)} das importações ${deUf}` : nomeUf} />
            <Kpi label="Corrente de comércio" valor={usd(exp + imp)} cor="#B8752E" sub="exportações + importações" />
            <Kpi label="Saldo comercial" valor={usd(exp - imp)} cor={exp - imp >= 0 ? COR_EXP : "#C1502E"} sub={`${exp - imp >= 0 ? "superávit" : "déficit"} ${deUf} com a Índia`} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 18, marginBottom: 18 }}>
            <div style={card}>
              <Titulo icon={Package} extra={<span style={{ fontFamily: mono, fontSize: 10.5, color: "#8992A6" }}>% do total com a Índia</span>}>
                Principais produtos · {FLUXOS[fluxo].curto.toLowerCase()}
              </Titulo>
              <Ranking itens={produtos.slice(0, 10)} total={baseRanking} cor={cor} vazio="Sem dados de produtos para este filtro." />
            </div>
            <div style={card}>
              <Titulo icon={MapPin} extra={<span style={{ fontFamily: mono, fontSize: 10.5, color: "#8992A6" }}>% do total com a Índia</span>}>
                Cidades mais representativas
              </Titulo>
              <Ranking itens={cidades.slice(0, 10)} total={baseRanking} cor={cor} vazio="Sem dados de cidades para este filtro." />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 18 }}>
            <div style={card}>
              <Titulo icon={MapPin}>Por estado · {FLUXOS[fluxo].curto.toLowerCase()} {ano}</Titulo>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {porEstado.map((e) => (
                  <div key={e.uf} title={`${e.nome}: ${usd(e.valor)}`}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: e.cor }} />
                      <span style={{ flex: 1, fontSize: 13.5, color: "#1B2438" }}>{e.nome}</span>
                      <span style={{ fontFamily: mono, fontSize: 12.5, color: "#0B2545", fontWeight: 600 }}>{usd(e.valor)}</span>
                    </div>
                    <div style={{ height: 10, background: "#F1F3F7", borderRadius: 5 }}>
                      <div style={{ width: totalEstados ? `${(e.valor / totalEstados) * 100}%` : 0, height: "100%", background: e.cor, borderRadius: 5 }} />
                    </div>
                    <div style={{ fontSize: 11.5, color: "#8992A6", marginTop: 4 }}>
                      {totalEstados ? `${pct(e.valor / totalEstados)} do Sul` : ""}{e.part != null ? ` · Índia = ${pct(e.part, 2)} da pauta do estado` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={card}>
              <Titulo icon={BarChart3}>Evolução anual · {nomeUf}</Titulo>
              <Evolucao anos={anos} linhas={evolucao} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
