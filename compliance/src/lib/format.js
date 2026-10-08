export function newId(prefixo) {
  return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
