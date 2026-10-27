import { useEffect, useRef, useState } from "react";
import { storage, EVENTO_ATUALIZADO } from "./storage";

const ler = async (key) => {
  try {
    const r = await storage.get(key, true);
    return r && r.value ? JSON.parse(r.value) : [];
  } catch (e) {
    return [];
  }
};

// Lista guardada no banco compartilhado: carrega, recarrega quando outra pessoa altera
// (salvo se alguém estiver digitando) e grava com um pequeno atraso.
export function useListaCompartilhada(key) {
  const [lista, setLista] = useState(null);
  const carregar = useRef(null);
  const timer = useRef(null);
  const pendente = useRef(null);

  useEffect(() => {
    let vivo = true;
    carregar.current = async () => {
      const valor = await ler(key);
      if (vivo) setLista(valor);
    };
    carregar.current();
    let atrasado = false;
    const digitando = () => ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
    const tentar = () => {
      if (pendente.current || digitando()) { atrasado = true; return; }
      atrasado = false;
      if (carregar.current) carregar.current();
    };
    const aoAtualizar = (e) => { if (e.detail?.key === key) tentar(); };
    const aoSair = () => { if (atrasado) setTimeout(tentar, 400); };
    window.addEventListener(EVENTO_ATUALIZADO, aoAtualizar);
    document.addEventListener("focusout", aoSair);
    return () => {
      vivo = false;
      window.removeEventListener(EVENTO_ATUALIZADO, aoAtualizar);
      document.removeEventListener("focusout", aoSair);
      clearTimeout(timer.current);
      if (pendente.current) storage.set(key, JSON.stringify(pendente.current), true).catch(() => {});
    };
  }, [key]);

  const atualizar = (next) => {
    setLista(next);
    pendente.current = next;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      pendente.current = null;
      storage.set(key, JSON.stringify(next), true).catch(() => {});
    }, 400);
  };

  return [lista, atualizar];
}
