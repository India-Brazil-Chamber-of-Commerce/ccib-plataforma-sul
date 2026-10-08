import { WEB3FORMS_KEY } from "../constants";

// Envia o conteúdo de um formulário por e-mail via Web3Forms. Devolve true se o envio deu certo.
export async function enviarPorEmail(assunto, campos) {
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: assunto,
        from_name: "Plataforma de Compliance CCIB",
        ...campos,
      }),
    });
    const result = await res.json();
    return !!result.success;
  } catch {
    return false;
  }
}
