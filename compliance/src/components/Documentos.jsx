import React, { useState } from "react";
import { Paperclip, FileText, Trash2, Download, Loader2 } from "lucide-react";
import { storage } from "../lib/storage";
import { newId } from "../lib/format";

// Anexos guardados no banco da plataforma (protegido pela senha), nunca no código do site.
// Cada arquivo fica numa chave própria; o projeto guarda só a lista (nome, tamanho, data).
const LIMITE_MB = 3;
const chave = (id) => `ccib-compliance-arquivo-${id}`;

function lerComoBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.readAsDataURL(file);
  });
}

function tamanho(bytes) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function Documentos({ documentos = [], onChange }) {
  const [ocupado, setOcupado] = useState("");
  const [erro, setErro] = useState("");

  const enviar = async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    ev.target.value = "";
    if (!file) return;
    if (file.size > LIMITE_MB * 1024 * 1024) {
      setErro(`O arquivo tem ${tamanho(file.size)}. O limite é ${LIMITE_MB} MB.`);
      return;
    }
    setErro("");
    setOcupado("enviando");
    try {
      const id = newId("doc").replace(/[^a-z0-9-]/g, "");
      const dados = await lerComoBase64(file);
      await storage.set(chave(id), JSON.stringify({ nome: file.name, tipo: file.type || "application/octet-stream", dados }), true);
      onChange([...documentos, { id, nome: file.name, tipo: file.type, tamanho: file.size, data: new Date().toISOString().slice(0, 10) }]);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível enviar o arquivo. Tente de novo.");
    } finally {
      setOcupado("");
    }
  };

  const abrir = async (doc) => {
    setErro("");
    setOcupado(doc.id);
    try {
      const r = await storage.get(chave(doc.id), true);
      const arq = r && r.value ? JSON.parse(r.value) : null;
      if (!arq || !arq.dados) throw new Error("Arquivo não encontrado");
      const bytes = Uint8Array.from(atob(arq.dados), (c) => c.charCodeAt(0));
      // Baixa o arquivo com o nome original (abrir em aba nova é bloqueado depois de esperar a rede)
      const url = URL.createObjectURL(new Blob([bytes], { type: arq.tipo }));
      const link = document.createElement("a");
      link.href = url;
      link.download = arq.nome || doc.nome;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível abrir o arquivo.");
    } finally {
      setOcupado("");
    }
  };

  const remover = async (doc) => {
    if (!window.confirm(`Remover o anexo "${doc.nome}"?`)) return;
    onChange(documentos.filter((d) => d.id !== doc.id));
    try {
      await storage.set(chave(doc.id), "null", true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="projeto-tarefas" style={{ marginTop: 18 }}>
      <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 6 }}><Paperclip size={13} /> Documentos anexados</div>
      <ul className="tasklist">
        {documentos.length === 0 && <li><div className="txt"><span>Nenhum documento anexado.</span></div></li>}
        {documentos.map((d) => (
          <li key={d.id}>
            <FileText size={16} style={{ color: "var(--navy-800)", marginTop: 1, flexShrink: 0 }} />
            <div className="txt grow">
              <strong style={{ fontWeight: 600 }}>{d.nome}</strong>
              <span>{tamanho(d.tamanho || 0)}{d.data ? ` · anexado em ${d.data.split("-").reverse().join("/")}` : ""}</span>
            </div>
            <button className="icon-btn neutral" style={{ opacity: 1 }} title="Baixar" onClick={() => abrir(d)} disabled={!!ocupado}>
              {ocupado === d.id ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
            </button>
            <button className="icon-btn" title="Remover" onClick={() => remover(d)}><Trash2 size={13} /></button>
          </li>
        ))}
      </ul>
      <div className="add-inline" style={{ alignItems: "center" }}>
        <label className="btn ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: ocupado ? "wait" : "pointer" }}>
          {ocupado === "enviando" ? <Loader2 size={14} className="spin" /> : <Paperclip size={14} />} {ocupado === "enviando" ? "Enviando..." : "Anexar documento"}
          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*" onChange={enviar} style={{ display: "none" }} disabled={!!ocupado} />
        </label>
        <span style={{ fontSize: 12, color: "var(--ink-400)" }}>PDF, Word, Excel ou imagem, até {LIMITE_MB} MB. Fica no banco da plataforma, protegido pela senha.</span>
        {erro && <span style={{ color: "var(--red)", fontSize: 12.5 }}>{erro}</span>}
      </div>
    </div>
  );
}
