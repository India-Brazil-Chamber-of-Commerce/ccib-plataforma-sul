// Protege a plataforma publicada na Vercel com senha (HTTP Basic Auth).
// Roda no servidor da Vercel antes de entregar qualquer arquivo, então sem a senha
// nada do site (código ou dados) é baixado. Não afeta o uso dentro do Claude nem o npm run dev.
// A senha fica na variável de ambiente PLATAFORMA_SENHA, configurada no painel da Vercel.
import { next } from "@vercel/functions";

export const config = { runtime: "nodejs", matcher: "/:path*" };

const REALM = "Plataforma CCIB Compliance";

// Compara sem encerrar na primeira diferença, para não revelar a senha pelo tempo de resposta
function sameText(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function passwordFrom(request) {
  const [scheme, encoded] = (request.headers.get("authorization") || "").split(" ");
  if (scheme !== "Basic" || !encoded) return null;
  try {
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    return decoded.slice(decoded.indexOf(":") + 1);
  } catch {
    return null;
  }
}

export default function middleware(request) {
  const senha = process.env.PLATAFORMA_SENHA;
  if (!senha) {
    return new Response("Acesso bloqueado: a senha da plataforma ainda não foi configurada na Vercel.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const informada = passwordFrom(request);
  if (informada !== null && sameText(informada, senha)) return next();
  return new Response("Acesso restrito. Informe a senha da plataforma.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
