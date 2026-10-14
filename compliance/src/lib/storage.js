// Armazenamento dos dados da plataforma.
// - Dentro do Claude (Artifact): window.storage, compartilhado entre usuários.
// - Na Vercel, com o banco conectado: /api/dados (Upstash Redis), compartilhado entre todos.
//   Uma cópia fica no navegador, usada se o banco estiver fora do ar.
// - Sem banco (ex.: npm run dev): só o localStorage do navegador, local a cada máquina.

const local = {
  async get(key) {
    const value = window.localStorage.getItem(key);
    return value === null ? null : { key, value };
  },
  async set(key, value) {
    window.localStorage.setItem(key, value);
    return { key, value };
  },
};

// null = ainda não sabemos; true/false depois da primeira resposta da API
let remotoDisponivel = null;

async function remotoGet(key) {
  const res = await fetch(`/api/dados?key=${encodeURIComponent(key)}`, { cache: "no-store" });
  if (res.status === 404 || res.status === 503) {
    remotoDisponivel = false;
    return undefined;
  }
  if (!res.ok) throw new Error(`Falha ao ler ${key} (${res.status})`);
  remotoDisponivel = true;
  return (await res.json()).value;
}

async function remotoSet(key, value) {
  const res = await fetch(`/api/dados?key=${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: value,
    // Permite terminar o envio mesmo se a aba for fechada (o navegador limita a 64 KB)
    keepalive: value.length < 60000,
  });
  if (!res.ok) throw new Error(`Falha ao salvar ${key} (${res.status})`);
}

const compartilhado = {
  async get(key) {
    if (remotoDisponivel === false) return local.get(key);
    let valor;
    try {
      valor = await remotoGet(key);
    } catch (e) {
      console.error(e);
      return local.get(key);
    }
    if (valor === undefined) return local.get(key);
    if (valor === null) {
      // Banco ainda vazio para este módulo: envia o que já existe neste navegador
      const existente = await local.get(key);
      if (existente) await remotoSet(key, existente.value);
      return existente;
    }
    window.localStorage.setItem(key, valor);
    return { key, value: valor };
  },
  async set(key, value) {
    await local.set(key, value);
    if (remotoDisponivel === false) return { key, value };
    await remotoSet(key, value);
    return { key, value };
  },
};

function backend() {
  return window.storage || compartilhado;
}

export const storage = {
  get: (key, shared) => backend().get(key, shared),
  set: (key, value, shared) => backend().set(key, value, shared),
  // true quando os dados estão no banco compartilhado (ou no Claude)
  ehCompartilhado: () => !!window.storage || remotoDisponivel === true,
};
