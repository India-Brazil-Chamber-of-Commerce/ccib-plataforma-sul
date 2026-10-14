// API de dados compartilhados da Plataforma Regional Sul (Vercel Function).
// Guarda cada lista da plataforma (chaves "ccib-sul-*") no banco Upstash Redis conectado
// ao projeto na Vercel, para que o que uma pessoa altera apareça para todos.
// O acesso já passa pela senha do middleware.
//
//   GET /api/sul-dados?key=ccib-sul-projetos        -> { value: "<json>" | null, versao: n }
//   GET /api/sul-dados?versoes=ccib-sul-a,ccib-sul-b -> { versoes: { "ccib-sul-a": n, ... } }
//   PUT /api/sul-dados?key=ccib-sul-projetos  (cabeçalho X-Versao-Base: n; corpo: o texto JSON)
//       -> { ok: true, versao: n+1 }  ou  409 { conflito: true, value, versao } se outra pessoa
//          salvou antes (o navegador junta as duas versões e tenta de novo)
//
// Sem o banco configurado, responde 503 e a plataforma continua usando o armazenamento do navegador.

const PREFIXO = "ccib-sul-";
const LIMITE_BYTES = 5 * 1024 * 1024;

// Grava só se a versão no banco ainda for a que o navegador leu (sem perder alterações de outra pessoa)
const GRAVAR_SE_VERSAO = `
local atual = tonumber(redis.call('GET', KEYS[2]) or '0')
if atual ~= tonumber(ARGV[2]) then return -1 end
redis.call('SET', KEYS[1], ARGV[1])
return redis.call('INCR', KEYS[2])
`;

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

const chaveValida = (key) => typeof key === "string" && key.startsWith(PREFIXO) && /^[a-z0-9-]+$/.test(key);
const chaveVersao = (key) => `${key}:versao`;

export async function GET(request) {
  const db = banco();
  if (!db) return json({ error: "Banco não configurado" }, 503);
  const params = new URL(request.url).searchParams;
  try {
    if (params.has("versoes")) {
      const keys = params.get("versoes").split(",").filter(chaveValida).slice(0, 30);
      if (!keys.length) return json({ versoes: {} });
      const lista = await comando(db, ["MGET", ...keys.map(chaveVersao)]);
      return json({ versoes: Object.fromEntries(keys.map((k, i) => [k, Number(lista[i] || 0)])) });
    }
    const key = params.get("key");
    if (!chaveValida(key)) return json({ error: "Chave inválida" }, 400);
    const [value, versao] = await comando(db, ["MGET", key, chaveVersao(key)]);
    return json({ value, versao: Number(versao || 0) });
  } catch (e) {
    return json({ error: e.message }, 502);
  }
}

export async function PUT(request) {
  const db = banco();
  if (!db) return json({ error: "Banco não configurado" }, 503);
  const key = new URL(request.url).searchParams.get("key");
  if (!chaveValida(key)) return json({ error: "Chave inválida" }, 400);
  const base = Number(request.headers.get("x-versao-base") || 0);
  if (!Number.isInteger(base) || base < 0) return json({ error: "Versão inválida" }, 400);
  const value = await request.text();
  if (value.length > LIMITE_BYTES) return json({ error: "Dados grandes demais" }, 413);
  try {
    JSON.parse(value);
  } catch {
    return json({ error: "Conteúdo não é JSON" }, 400);
  }
  try {
    const versao = await comando(db, ["EVAL", GRAVAR_SE_VERSAO, "2", key, chaveVersao(key), value, String(base)]);
    if (Number(versao) === -1) {
      const [atual, versaoAtual] = await comando(db, ["MGET", key, chaveVersao(key)]);
      return json({ conflito: true, value: atual, versao: Number(versaoAtual || 0) }, 409);
    }
    return json({ ok: true, versao: Number(versao) });
  } catch (e) {
    return json({ error: e.message }, 502);
  }
}
