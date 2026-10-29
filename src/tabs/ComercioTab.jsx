import React, { useMemo, useState } from "react";
import { Ship, Package, MapPin, BarChart3, FileSpreadsheet } from "lucide-react";
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

// Ranking com barra horizontal, valor e participação no total
function Ranking({ itens, total, cor, vazio, detalhe }) {
  const [aberto, setAberto] = useState(null);
  if (!itens.length) return <div style={{ fontSize: 13, color: "#8992A6" }}>{vazio}</div>;
  const max = Math.max(...itens.map((i) => i.valor));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {itens.map((i, n) => (
        <div
          key={i.chave}
          title={`${i.completo || i.nome}: ${usd(i.valor)} (${total ? pct(i.valor / total) : "-"} do total)${detalhe ? " · clique para ver os produtos" : ""}`}
          onClick={detalhe ? () => setAberto(aberto === i.chave ? null : i.chave) : undefined}
          style={detalhe ? { cursor: "pointer", borderRadius: 8, background: aberto === i.chave ? "#F7F8FA" : "transparent", padding: aberto === i.chave ? "6px 6px 8px" : 0, margin: aberto === i.chave ? "-6px" : 0 } : undefined}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: mono, fontSize: 10.5, color: "#8992A6", width: 18 }}>{n + 1}</span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: "#1B2438", lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {i.nome}
              {i.extra && <span style={{ fontFamily: mono, fontSize: 10.5, color: "#8992A6", marginLeft: 6 }}>{i.extra}</span>}
            </span>
            <span style={{ fontFamily: mono, fontSize: 12, color: "#1B2438" }}>{usd(i.valor)}</span>
            <span style={{ fontFamily: mono, fontSize: 11.5, color: "#566175", width: 52, textAlign: "right" }}>{total ? pct(i.valor / total) : ""}</span>
          </div>
          <div style={{ marginLeft: 26, height: 8, background: "#F1F3F7", borderRadius: 4 }}>
            <div style={{ width: `${Math.max(1.5, (i.valor / max) * 100)}%`, height: "100%", background: cor, borderRadius: 4 }} />
          </div>
          {detalhe && aberto === i.chave && <div style={{ marginLeft: 26, marginTop: 8 }}>{detalhe(i)}</div>}
        </div>
      ))}
    </div>
  );
}

// Exportações e importações por ano, lado a lado
function Evolucao({ anos, linhas, parciais = [] }) {
  const muitos = anos.length > 10;
  const gap = muitos ? 4 : 18;
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
      <div style={{ display: "flex", alignItems: "flex-end", gap, height: alt + 26, borderBottom: "1px solid #D6DAE2", padding: "0 6px" }}>
        {linhas.map((l) => {
          const parcial = parciais.includes(l.ano);
          return (
            <div key={l.ano} style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: muitos ? 1 : 4, height: "100%", opacity: parcial ? 0.45 : 1 }}>
              {[["exp", COR_EXP, "Exportações"], ["imp", COR_IMP, "Importações"]].map(([k, cor, nome]) => (
                <div key={k} title={`${l.ano}${parcial ? " (parcial)" : ""} · ${nome}: ${usd(l[k])}`} style={{ width: "46%", maxWidth: 34, height: l[k] ? Math.max(2, (l[k] / max) * alt) : 0, background: cor, borderRadius: muitos ? "2px 2px 0 0" : "4px 4px 0 0" }} />
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap, padding: "6px 6px 0" }}>
        {anos.map((a, i) => (
          <span key={a} style={{ flex: 1, minWidth: 0, textAlign: "center", fontFamily: mono, fontSize: muitos ? 9.5 : 11, color: "#566175", visibility: !muitos || i % 2 === (anos.length - 1) % 2 ? "visible" : "hidden" }}>
            {muitos ? `'${String(a).slice(2)}` : a}
          </span>
        ))}
      </div>
      {parciais.some((a) => anos.includes(a)) && (
        <div style={{ fontSize: 11.5, color: "#8992A6", marginTop: 8 }}>Barras mais claras: ano ainda em andamento ({parciais.filter((a) => anos.includes(a)).join(", ")}).</div>
      )}
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

  // Agrupa por chave somando valores (para "Região Sul" juntar os três estados)
  const agrupar = (lista, chave, nome, extra) => {
    const m = new Map();
    lista.forEach((x) => {
      const k = chave(x);
      const atual = m.get(k) || { chave: k, nome: nome(x), completo: x.produto || x.cidade || "", extra: extra ? extra(x) : "", valor: 0 };
      atual.valor += Number(x.valor) || 0;
      m.set(k, atual);
    });
    return [...m.values()].sort((a, b) => b.valor - a.valor);
  };
  const todosProdutos = [...dados.produtos, ...PRODUTOS];
  const ufsComProdutos = UFS.filter((e) => todosProdutos.some((x) => x.uf === e.uf));
  const produtos = agrupar(todosProdutos.filter((x) => doAno(x) && daUf(x) && x.fluxo === fluxo), (x) => x.codigo || x.produto, (x) => nomeCurto(x.produto), (x) => x.codigo || "");
  const todasCidades = [...dados.cidades, ...CIDADES_LISTA];
  const ufsComCidades = UFS.filter((e) => todasCidades.some((x) => x.uf === e.uf && x.fluxo === fluxo));
  const cidades = agrupar(todasCidades.filter((x) => doAno(x) && daUf(x) && x.fluxo === fluxo), (x) => `${x.cidade}/${x.uf}`, (x) => x.cidade, (x) => (uf === "sul" ? x.uf : ""));
  // Base do % das cidades: soma dos municípios (o município é o da empresa, não o da origem do produto)
  const totalCidades = cidades.reduce((s, c) => s + c.valor, 0);
  const produtosDaCidade = (c) => {
    const [nomeCid, ufCid] = c.chave.split("/");
    const lista = CIDADES_PROD.filter((x) => doAno(x) && x.fluxo === fluxo && x.uf === ufCid && x.cidade === nomeCid).sort((a, b) => b.valor - a.valor);
    if (!lista.length) return <div style={{ fontSize: 12, color: "#8992A6" }}>Sem detalhe de produtos para esta cidade.</div>;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8992A6" }}>Principais produtos de {nomeCid}</div>
        {lista.map((p) => (
          <div key={p.codigo} title={DESCRICOES_SH4[p.codigo] || p.codigo} style={{ display: "flex", gap: 8, fontSize: 12, color: "#566175" }}>
            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nomeCurto(DESCRICOES_SH4[p.codigo] || p.codigo)}</span>
            <span style={{ fontFamily: mono, fontSize: 11.5 }}>{usd(p.valor)}</span>
            <span style={{ fontFamily: mono, fontSize: 11, width: 44, textAlign: "right" }}>{p.valor / c.valor < 0.01 ? "<1%" : pct(p.valor / c.valor, 0)}</span>
          </div>
        ))}
      </div>
    );
  };
  const totalFluxo = fluxo === "exportacao" ? exp : imp;
  const baseRanking = totalFluxo || soma(produtos);

  const porEstado = UFS.map((e) => {
    const linhas = dados.totais.filter((x) => doAno(x) && x.uf === e.uf && x.fluxo === fluxo);
    const v = soma(linhas);
    return { ...e, valor: v, part: participacao([e.uf], fluxo), semDados: !ufsComDados.some((u) => u.uf === e.uf) };
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
              {[...anos].reverse().map((a) => <option key={a} value={a}>{rotuloAno(a)}</option>)}
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
              <Titulo icon={Package} extra={<span style={{ fontFamily: mono, fontSize: 10.5, color: "#8992A6" }}>% do total com a Índia</span>}>
                Principais produtos · {FLUXOS[fluxo].curto.toLowerCase()}
              </Titulo>
              {uf === "sul" && ufsComProdutos.length > 0 && ufsComProdutos.length < UFS.length && (
                <div style={{ fontSize: 11.5, color: "#B8752E", marginTop: -6, marginBottom: 12 }}>
                  Produtos carregados até agora: {ufsComProdutos.map((e) => e.nome).join(", ")}. O % é sobre o total da Região Sul.
                </div>
              )}
              <Ranking itens={produtos.slice(0, 10)} total={baseRanking} cor={cor} vazio={ufsComProdutos.some((e) => uf === "sul" || e.uf === uf) ? "Sem dados de produtos para este filtro." : "Produtos deste estado ainda não carregados."} />
            </div>
            <div style={card}>
              <Titulo icon={MapPin} extra={<span style={{ fontFamily: mono, fontSize: 10.5, color: "#8992A6" }}>% do total dos municípios</span>}>
                Cidades mais representativas · {FLUXOS[fluxo].curto.toLowerCase()}
              </Titulo>
              {cidades.length > 0 && (
                <div style={{ fontSize: 11.5, color: "#8992A6", marginTop: -6, marginBottom: 12, lineHeight: 1.45 }}>
                  {totalFluxo && Math.abs(totalCidades - totalFluxo) / totalFluxo < 0.005
                    ? `Município da empresa ${fluxo === "exportacao" ? "exportadora" : "importadora"}; a soma das cidades (${usd(totalCidades)}) bate com o total ${deUf}.`
                    : `Município da empresa ${fluxo === "exportacao" ? "exportadora" : "importadora"}, por isso a soma das cidades (${usd(totalCidades)}) difere do total por estado de origem do produto.`}{" "}
                  Clique numa cidade para ver o que ela {fluxo === "exportacao" ? "exporta" : "importa"}.
                  {uf === "sul" && ufsComCidades.length < UFS.length ? ` Cidades carregadas até agora: ${ufsComCidades.map((e) => e.nome).join(", ")}.` : ""}
                </div>
              )}
              <Ranking
                itens={cidades.slice(0, 10)}
                total={totalCidades}
                cor={cor}
                detalhe={produtosDaCidade}
                vazio={ufsComCidades.some((e) => uf === "sul" || e.uf === uf) ? "Sem dados de cidades para este filtro." : `${FLUXOS[fluxo].curto} por cidade ${uf === "sul" ? "da Região Sul" : UFS.find((e) => e.uf === uf).de} ainda não carregadas.`}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 18 }}>
            <div style={card}>
              <Titulo icon={MapPin}>Por estado · {FLUXOS[fluxo].curto.toLowerCase()} {rotuloAno(ano)}</Titulo>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {porEstado.map((e) => (
                  <div key={e.uf} title={`${e.nome}: ${usd(e.valor)}`}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: e.cor }} />
                      <span style={{ flex: 1, fontSize: 13.5, color: "#1B2438" }}>{e.nome}</span>
                      <span style={{ fontFamily: mono, fontSize: 12.5, color: e.semDados ? "#B7BEC9" : "#0B2545", fontWeight: 600 }}>{e.semDados ? "sem dados" : usd(e.valor)}</span>
                    </div>
                    <div style={{ height: 10, background: "#F1F3F7", borderRadius: 5 }}>
                      <div style={{ width: totalEstados ? `${(e.valor / totalEstados) * 100}%` : 0, height: "100%", background: e.cor, borderRadius: 5 }} />
                    </div>
                    <div style={{ fontSize: 11.5, color: "#8992A6", marginTop: 4 }}>
                      {e.semDados ? "Dados ainda não carregados" : totalEstados && ufsComDados.length === UFS.length ? `${pct(e.valor / totalEstados)} do Sul` : ""}{e.part != null ? ` · Índia = ${pct(e.part, 2)} da pauta do estado` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={card}>
              <Titulo icon={BarChart3}>Evolução anual · {nomeUf}</Titulo>
              <Evolucao anos={anos} linhas={evolucao} parciais={parciais} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
