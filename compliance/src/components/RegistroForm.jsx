import React, { useState } from "react";
import { enviarPorEmail } from "../lib/web3forms";

// Formulário que (1) grava o registro na plataforma e (2) avisa por e-mail via Web3Forms.
// fields: [{ name, label, type: "text" | "date" | "time" | "select" | "textarea", options, placeholder, full, required }]
export default function RegistroForm({ title, fields, assunto, submitLabel = "Enviar", onRegistrar, salvaNaPlataforma = true }) {
  const inicial = () => Object.fromEntries(fields.map((f) => [f.name, f.type === "select" ? f.options[0] : ""]));
  const [values, setValues] = useState(inicial);
  const [status, setStatus] = useState({ tipo: "", texto: "" });
  const [enviando, setEnviando] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const faltando = fields.filter((f) => f.required && !String(values[f.name] || "").trim());
    if (faltando.length) {
      setStatus({ tipo: "error", texto: `Preencha: ${faltando.map((f) => f.label).join(", ")}.` });
      return;
    }
    setEnviando(true);
    setStatus({ tipo: "sending", texto: "Enviando..." });
    if (onRegistrar) onRegistrar(values);
    const campos = Object.fromEntries(fields.map((f) => [f.label, values[f.name] || "—"]));
    const ok = await enviarPorEmail(assunto, campos);
    const salvo = salvaNaPlataforma ? "Registrado na plataforma" : "Recebido";
    setStatus(
      ok
        ? { tipo: "success", texto: `${salvo} e enviado por e-mail.` }
        : { tipo: "error", texto: `${salvo}, mas o aviso por e-mail não foi enviado. Verifique a conexão.` }
    );
    setValues(inicial());
    setEnviando(false);
  };

  const set = (name, v) => setValues((prev) => ({ ...prev, [name]: v }));

  return (
    <div className="card">
      {title && <div className="card-head"><div className="section-title">{title}</div></div>}
      <form onSubmit={submit} style={{ padding: title ? "0 20px 20px 20px" : 20 }}>
        <div className="form-grid">
          {fields.map((f) => (
            <div key={f.name} className={`field${f.full ? " full" : ""}`}>
              <label htmlFor={`f-${assunto}-${f.name}`}>{f.label}</label>
              {f.type === "select" ? (
                <select id={`f-${assunto}-${f.name}`} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)}>
                  {f.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : f.type === "textarea" ? (
                <textarea id={`f-${assunto}-${f.name}`} value={values[f.name]} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
              ) : (
                <input id={`f-${assunto}-${f.name}`} type={f.type || "text"} value={values[f.name]} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
              )}
            </div>
          ))}
        </div>
        <button className="btn gold" type="submit" disabled={enviando}>{submitLabel}</button>
        <p className={`form-status ${status.tipo}`}>{status.texto}</p>
      </form>
    </div>
  );
}
