// Armazenamento dos dados da plataforma.
// Dentro do Claude (Artifact) usa window.storage, compartilhado entre usuários.
// Fora do Claude (ex.: npm run dev) usa o localStorage do navegador, local a cada máquina.

const localFallback = {
  async get(key) {
    const value = window.localStorage.getItem(key);
    return value === null ? null : { key, value };
  },
  async set(key, value) {
    window.localStorage.setItem(key, value);
    return { key, value };
  },
};

function backend() {
  return window.storage || localFallback;
}

export const storage = {
  get: (key, shared) => backend().get(key, shared),
  set: (key, value, shared) => backend().set(key, value, shared),
};
