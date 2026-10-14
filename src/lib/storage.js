// Armazenamento dos dados da plataforma.
// - Dentro do Claude (Artifact): window.storage, compartilhado entre usuários.
// - Na Vercel, com o banco conectado: /api/sul-dados (Upstash Redis), compartilhado entre todos.
//   O que uma pessoa altera aparece para as outras em até ~30 s (ou ao clicar em Recarregar).
//   Se duas pessoas salvam a mesma lista ao mesmo tempo, as alterações das duas são juntadas
//   item a item (por id), em vez de uma apagar a outra.
// - Sem banco (npm run dev, ou banco ainda não conectado): localStorage do navegador.
//   Uma cópia local também é mantida no modo compartilhado, como reserva.

const API = "/api/sul-dados";
const INTERVALO_SYNC = 30000;
export const EVENTO_ATUALIZADO = "ccib-dados-atualizados";

const local = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* sem espaço ou bloqueado: segue só com o banco */
    }
  },
};

// null = ainda não testado; true = banco compartilhado ativo; false = só navegador
let remotoAtivo = null;
const base = new Map(); // key -> { value, versao } última versão lida/gravada no banco
const filas = new Map(); // key -> Promise da gravação em andamento (grava uma de cada vez por chave)

export const modoCompartilhado = () => remotoAtivo === true;

async function api(method, query, { body, versao } = {}) {
  const res = await fetch(`${API}?${query}`, {
    method,
    cache: "no-store",
    headers: method === "PUT" ? { "Content-Type": "application/json", "X-Versao-Base": String(versao || 0) } : undefined,
    body,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

// ---- Junção de alterações (3 vias: versão base, a minha e a do banco) ----
const temId = (lista) => Array.isArray(lista) && lista.every((x) => x && typeof x === "object" && x.id != null);
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function juntarItem(b, meu, deles) {
  if (!b) return meu;
  const out = { ...deles };
  new Set([...Object.keys(meu), ...Object.keys(b)]).forEach((k) => {
    if (!igual(meu[k], b[k])) {
      if (meu[k] === undefined) delete out[k];
      else out[k] = meu[k];
    }
  });
  return out;
}

export function juntar(baseTxt, meuTxt, delesTxt) {
  if (delesTxt == null) return meuTxt;
  let b, meu, deles;
  try {
    b = baseTxt != null ? JSON.parse(baseTxt) : [];
    meu = JSON.parse(meuTxt);
    deles = JSON.parse(delesTxt);
  } catch (e) {
    return meuTxt;
  }
  if (!temId(meu) || !temId(deles) || !temId(b)) return meuTxt;
  const porId = (l) => new Map(l.map((x) => [x.id, x]));
  const mB = porId(b);
  const mMeu = porId(meu);
  const mDeles = porId(deles);
  const resultado = [];
  deles.forEach((d) => {
    const m = mMeu.get(d.id);
    const bb = mB.get(d.id);
    if (!m) {
      // Apaguei aqui (estava na base): fica apagado. Se nem estava na base, é novo deles: mantém.
      if (!bb) resultado.push(d);
      return;
    }
    resultado.push(igual(m, bb) ? d : juntarItem(bb, m, d));
  });
  // Itens novos meus (não estavam na base nem no banco)
  meu.forEach((m) => {
    if (!mDeles.has(m.id) && !mB.has(m.id)) resultado.push(m);
  });
  return JSON.stringify(resultado);
}

// Junta duas listas sem apagar nada: mantém a do banco e acrescenta os itens que só existem aqui
function acrescentarNovos(delesTxt, meuTxt) {
  try {
    const deles = JSON.parse(delesTxt);
    const meu = JSON.parse(meuTxt);
    if (!temId(deles) || !temId(meu)) return delesTxt;
    // Mesmo id, ou mesmo nome (e data) criado em outro navegador com id diferente: já existe
    const assinatura = (x) => (x.nome ? `${String(x.nome).trim().toLowerCase()}|${x.data || ""}` : null);
    const ids = new Set(deles.map((x) => x.id));
    const nomes = new Set(deles.map(assinatura).filter(Boolean));
    const novos = meu.filter((x) => !ids.has(x.id) && !(assinatura(x) && nomes.has(assinatura(x))));
    return novos.length ? JSON.stringify([...deles, ...novos]) : delesTxt;
  } catch (e) {
    return delesTxt;
  }
}

// ---- Leitura e gravação ----
async function lerRemoto(key) {
  const { status, data } = await api("GET", `key=${encodeURIComponent(key)}`);
  if (status !== 200) throw new Error(`HTTP ${status}`);
  return { value: data.value ?? null, versao: data.versao || 0 };
}

async function testarRemoto(key) {
  if (remotoAtivo !== null) return remotoAtivo;
  try {
    const r = await lerRemoto(key);
    remotoAtivo = true;
    return r;
  } catch (e) {
    remotoAtivo = false;
    return false;
  }
}

async function gravarRemoto(key, value) {
  let meu = value;
  for (let tentativa = 0; tentativa < 4; tentativa++) {
    const b = base.get(key) || { value: null, versao: 0 };
    const { status, data } = await api("PUT", `key=${encodeURIComponent(key)}`, { body: meu, versao: b.versao });
    if (status === 200) {
      base.set(key, { value: meu, versao: data.versao });
      if (meu !== value) avisar(key); // juntou com alterações de outra pessoa: a tela precisa recarregar
      return;
    }
    if (status !== 409) throw new Error(data.error || `HTTP ${status}`);
    meu = juntar(b.value, meu, data.value);
    base.set(key, { value: data.value, versao: data.versao });
    local.set(key, meu);
  }
  throw new Error("Não foi possível salvar: muitas alterações simultâneas.");
}

function avisar(key) {
  window.dispatchEvent(new CustomEvent(EVENTO_ATUALIZADO, { detail: { key } }));
}

const remoto = {
  async get(key) {
    const teste = await testarRemoto(key);
    if (!remotoAtivo) return null;
    const r = typeof teste === "object" && teste ? teste : await lerRemoto(key);
    base.set(key, r);
    // Primeira vez deste navegador com o banco: leva o que já estava salvo aqui, sem apagar nada
    const marca = `${key}:no-banco`;
    const meu = local.get(key);
    if (!local.get(marca) && meu != null) {
      const unido = r.value == null ? meu : acrescentarNovos(r.value, meu);
      if (unido !== r.value) await this.set(key, unido);
      local.set(marca, "1");
      if (unido !== r.value) return { key, value: unido };
    }
    local.set(marca, "1");
    if (r.value == null) return null;
    local.set(key, r.value);
    iniciarSync();
    return { key, value: r.value };
  },
  set(key, value) {
    local.set(key, value);
    const anterior = filas.get(key) || Promise.resolve();
    const atual = anterior.catch(() => {}).then(() => gravarRemoto(key, value));
    filas.set(key, atual);
    atual.finally(() => { if (filas.get(key) === atual) filas.delete(key); }).catch(() => {});
    iniciarSync();
    return atual.then(() => ({ key, value }));
  },
};

// ---- Busca periódica de alterações feitas por outras pessoas ----
let timerSync = null;
async function sincronizar() {
  if (!remotoAtivo || document.hidden || base.size === 0) return;
  try {
    const keys = [...base.keys()];
    const { status, data } = await api("GET", `versoes=${keys.map(encodeURIComponent).join(",")}`);
    if (status !== 200) return;
    for (const key of keys) {
      const nova = data.versoes?.[key] ?? 0;
      const b = base.get(key);
      if (!b || nova === b.versao || filas.has(key)) continue;
      const r = await lerRemoto(key);
      if (filas.has(key)) continue;
      base.set(key, r);
      if (r.value != null) local.set(key, r.value);
      avisar(key);
    }
  } catch (e) {
    /* sem conexão: tenta de novo no próximo ciclo */
  }
}
function iniciarSync() {
  if (timerSync || typeof window === "undefined") return;
  timerSync = setInterval(sincronizar, INTERVALO_SYNC);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) sincronizar(); });
}

// ---- Interface usada pela plataforma ----
const localBackend = {
  async get(key) {
    const value = local.get(key);
    return value === null ? null : { key, value };
  },
  async set(key, value) {
    local.set(key, value);
    return { key, value };
  },
};

function backend() {
  if (window.storage) return window.storage;
  return remotoAtivo === false ? localBackend : remoto;
}

export const storage = {
  async get(key, shared) {
    const b = backend();
    if (b === remoto) {
      const r = await remoto.get(key);
      if (remotoAtivo) return r;
      return localBackend.get(key);
    }
    return b.get(key, shared);
  },
  async set(key, value, shared) {
    const b = backend();
    if (b === remoto && remotoAtivo === null) await testarRemoto(key);
    if (b === remoto && remotoAtivo) return remoto.set(key, value);
    if (b === remoto) return localBackend.set(key, value);
    return b.set(key, value, shared);
  },
};
