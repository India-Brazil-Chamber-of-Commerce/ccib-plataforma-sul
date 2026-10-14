// API de dados compartilhados da Plataforma de Compliance (Vercel Function).
// Guarda cada módulo da plataforma (chaves "ccib-compliance-*") no banco Upstash Redis
// conectado ao projeto na Vercel. O acesso já passa pela senha do middleware.
//
//   GET /api/dados?key=ccib-compliance-agentes-publicos  -> { value: "<json>" | null }
//   PUT /api/dados?key=ccib-compliance-agentes-publicos  (corpo: o texto JSON) -> { ok: true }
//
// Sem o banco configurado (ex.: projetos da Regional Sul), responde 503 e a plataforma
// continua usando o armazenamento do navegador.

const PREFIXO = "ccib-compliance-";
const LIMITE_BYTES = 5 * 1024 * 1024;

// A Vercel pode criar as variáveis do banco com um prefixo (ex.: "STORAGE_KV_REST_API_URL"),
// então procuramos qualquer par *KV_REST_API_URL / *KV_REST_API_TOKEN (ou *REDIS_REST_URL / *REDIS_REST_TOKEN).
function variaveisDoBanco() {
  const nomes = Object.keys(process.env);
  for (const [sufUrl, sufToken] of [["KV_REST_API_URL", "KV_REST_API_TOKEN"], ["REDIS_REST_URL", "REDIS_REST_TOKEN"]]) {
    for (const nomeUrl of nomes.filter((n) => n.endsWith(sufUrl))) {
      const nomeToken = nomeUrl.slice(0, -sufUrl.length) + sufToken;
      if (process.env[nomeUrl] && process.env[nomeToken]) return { nomeUrl, nomeToken };
    }
  }
  return null;
}

function banco() {
  const v = variaveisDoBanco();
  return v ? { url: process.env[v.nomeUrl], token: process.env[v.nomeToken] } : null;
}

async function comando(db, args) {
  const res = await fetch(db.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${db.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(data.error || `Upstash respondeu ${res.status}`);
  return data.result;
}

const json = (corpo, status = 200) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

function chave(request) {
  const key = new URL(request.url).searchParams.get("key") || "";
  return key.startsWith(PREFIXO) && /^[a-z0-9-]+$/.test(key) ? key : null;
}

export async function GET(request) {
  // Diagnóstico: /api/dados?status=1 mostra se o banco está conectado (sem revelar valores)
  if (new URL(request.url).searchParams.has("status")) {
    const v = variaveisDoBanco();
    const candidatas = Object.keys(process.env).filter((n) => /KV|REDIS|UPSTASH/.test(n));
    let teste = "sem banco";
    if (v) {
      try {
        await comando(banco(), ["PING"]);
        teste = "ok";
      } catch (e) {
        teste = `erro: ${e.message}`;
      }
    }
    return json({ banco: !!v, variavel: v ? v.nomeUrl : null, teste, variaveisEncontradas: candidatas });
  }
  const db = banco();
  if (!db) return json({ error: "Banco não configurado" }, 503);
  const key = chave(request);
  if (!key) return json({ error: "Chave inválida" }, 400);
  try {
    return json({ value: await comando(db, ["GET", key]) });
  } catch (e) {
    return json({ error: e.message }, 502);
  }
}

export async function PUT(request) {
  const db = banco();
  if (!db) return json({ error: "Banco não configurado" }, 503);
  const key = chave(request);
  if (!key) return json({ error: "Chave inválida" }, 400);
  const value = await request.text();
  if (value.length > LIMITE_BYTES) return json({ error: "Dados grandes demais" }, 413);
  try {
    JSON.parse(value);
  } catch {
    return json({ error: "Conteúdo não é JSON" }, 400);
  }
  try {
    await comando(db, ["SET", key, value]);
    return json({ ok: true });
  } catch (e) {
    return json({ error: e.message }, 502);
  }
}
