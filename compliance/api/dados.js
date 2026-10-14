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

function banco() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
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
