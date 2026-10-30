import React, { useEffect, useMemo, useRef, useState } from "react";
import { FileDown, Info } from "lucide-react";
import SheetTable from "./SheetTable";
import { newId } from "../lib/format";
import { FUNCOES_CERTIFICADO, certificadoPadrao, htmlCertificados, imprimirCertificados } from "../lib/certificado";

const COLUNAS = [
  { key: "nome", label: "Nome completo", placeholder: "Como deve sair no certificado" },
  { key: "funcao", label: "Participou como", type: "select", options: FUNCOES_CERTIFICADO, width: 190 },
  { key: "email", label: "E-mail (para vocês enviarem depois)", width: 260, placeholder: "opcional" },
];

// Aba "Certificados" do evento: modelo editável, lista de nomes, prévia e geração do PDF.
// Não envia nada: o PDF é baixado e a equipe distribui quando quiser.
export default function Certificados({ evento, onChange }) {
  const modelo = { ...certificadoPadrao(evento), ...(evento.certificado || {}) };
  const pessoas = evento.certificadoPessoas || [];
  const [selecionada, setSelecionada] = useState("");
  // A prévia é desenhada em tamanho A4 (1123 x 794 px) e reduzida para caber no quadro
  const quadro = useRef(null);
  const [escala, setEscala] = useState(0.5);
  useEffect(() => {
    if (!quadro.current) return;
    const obs = new ResizeObserver(([e]) => setEscala(e.contentRect.width / 1123));
    obs.observe(quadro.current);
    return () => obs.disconnect();
  }, []);

  const setModelo = (campo, valor) => onChange({ ...evento, certificado: { ...modelo, [campo]: valor } });
  const setAssinatura = (i, campo, valor) => {
    const assinaturas = modelo.assinaturas.map((a, j) => (j === i ? { ...a, [campo]: valor } : a));
    setModelo("assinaturas", assinaturas);
  };

  const valores = { evento: modelo.nomeEvento, data: modelo.data, local: modelo.local, carga: modelo.carga };
  const comNome = pessoas.filter((p) => (p.nome || "").trim());
  const pessoaPrevia = comNome.find((p) => p.id === selecionada) || comNome[0] || { nome: "", funcao: "Participante" };
  const previa = useMemo(() => htmlCertificados(modelo, [pessoaPrevia], valores), [JSON.stringify(modelo), JSON.stringify(pessoaPrevia)]);

  const campo = (nome, label, props = {}) => (
    <div className={`field${props.full ? " full" : ""}`}>
      <label htmlFor={`cert-${evento.id}-${nome}`}>{label}</label>
      {props.type === "textarea" ? (
        <textarea id={`cert-${evento.id}-${nome}`} value={modelo[nome] || ""} placeholder={props.placeholder} onChange={(e) => setModelo(nome, e.target.value)} />
      ) : (
        <input id={`cert-${evento.id}-${nome}`} value={modelo[nome] || ""} placeholder={props.placeholder} onChange={(e) => setModelo(nome, e.target.value)} />
      )}
      {props.hint && <span className="hint">{props.hint}</span>}
    </div>
  );

  return (
    <div className="certificados">
      <div className="banner navy" style={{ marginBottom: 18 }}>
        <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>Nada é enviado automaticamente.</strong> A plataforma só gera o PDF dos certificados. Na janela que abrir, escolha <strong>Salvar como PDF</strong> e depois envie para quem quiser.
        </div>
      </div>

      <div className="cert-grid">
        <div>
          <div className="section-title">1. Modelo do certificado</div>
          <div className="form-grid">
            {campo("titulo", "Título")}
            {campo("subtitulo", "Subtítulo", { placeholder: "Ex: de Participação" })}
            {campo("nomeEvento", "Nome do evento no certificado", { full: true })}
            {campo("data", "Data (por extenso)", { placeholder: "Ex: 18 de novembro de 2026" })}
            {campo("local", "Local", { placeholder: "Ex: Curitiba (PR) / formato online" })}
            {campo("carga", "Carga horária", { placeholder: "Ex: 4 horas" })}
            {campo("cidadeData", "Cidade e data de emissão", { placeholder: "Ex: Curitiba, 18 de novembro de 2026" })}
            {campo("texto", "Texto do certificado", {
              type: "textarea",
              full: true,
              hint: "Use {evento}, {funcao}, {data}, {local} e {carga}: a plataforma troca pelos dados acima e pela função de cada pessoa. O nome aparece em destaque logo acima.",
            })}
            {[0, 1].map((i) => (
              <React.Fragment key={i}>
                <div className="field">
                  <label htmlFor={`cert-${evento.id}-ass${i}`}>Assinatura {i + 1}: nome</label>
                  <input id={`cert-${evento.id}-ass${i}`} value={modelo.assinaturas[i]?.nome || ""} placeholder={i === 1 ? "Opcional" : "Nome de quem assina"} onChange={(e) => setAssinatura(i, "nome", e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor={`cert-${evento.id}-cargo${i}`}>Assinatura {i + 1}: cargo</label>
                  <input id={`cert-${evento.id}-cargo${i}`} value={modelo.assinaturas[i]?.cargo || ""} placeholder="Ex: Gerente Executivo, Regional Sul" onChange={(e) => setAssinatura(i, "cargo", e.target.value)} />
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div>
          <div className="section-title">Prévia</div>
          <div className="cert-previa" ref={quadro}>
            <iframe title="Prévia do certificado" srcDoc={previa} style={{ transform: `scale(${escala})` }} />
          </div>
          <p className="placeholder-note">Campos em amarelo ainda estão vazios.</p>
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 22 }}>2. Quem recebe</div>
      <SheetTable
        columns={COLUNAS}
        rows={pessoas}
        onChange={(l) => onChange({ ...evento, certificadoPessoas: l })}
        newRow={() => ({ id: newId("ct"), nome: "", funcao: "Participante", email: "" })}
        addLabel="+ Adicionar pessoa"
        emptyText="Nenhuma pessoa cadastrada ainda."
        minWidth={720}
      />

      <div className="section-title" style={{ marginTop: 22 }}>3. Gerar PDF</div>
      <div className="cert-acoes">
        <button className="btn gold" disabled={!comNome.length} onClick={() => imprimirCertificados(modelo, comNome, valores)}>
          <FileDown size={14} /> Gerar PDF de todos ({comNome.length})
        </button>
        <span className="cert-ou">ou</span>
        <select className="search" value={pessoaPrevia.id || ""} onChange={(e) => setSelecionada(e.target.value)} disabled={!comNome.length} aria-label="Escolher pessoa">
          {comNome.length === 0 && <option value="">Cadastre uma pessoa acima</option>}
          {comNome.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
        <button className="btn ghost" disabled={!comNome.length} onClick={() => imprimirCertificados(modelo, [pessoaPrevia], valores)}>
          <FileDown size={14} /> Gerar PDF desta pessoa
        </button>
        <button className="btn ghost" onClick={() => imprimirCertificados(modelo, [{ nome: "", funcao: "" }], valores)}>
          Baixar modelo em branco
        </button>
      </div>
    </div>
  );
}
