import { useEffect, useRef, useState } from "react";
import { STORAGE_PROJECTS } from "../constants";
import { storage, EVENTO_ATUALIZADO } from "./storage";
import { SEED_PROJECTS, CORRIGIR_PROJETOS } from "../data/seeds";

// Listas do projeto que recebem itens novos da semente (por id do item)
const LISTAS_SEMENTE = ["participantes", "empresasVisitadas", "etapas", "custos", "patrocinios", "programacao"];

// Preenche os campos que ainda não existem no projeto salvo e acrescenta às listas os itens-semente
// novos. Os ids já aplicados ficam em _seedItens, para que um item removido na plataforma não volte.
export function mesclarSemente(p, seed) {
  const vistos = new Set(p._seedItens || []);
  const novo = { ...p };
  let alterou = false;
  Object.keys(seed).forEach((k) => {
    if (novo[k] === undefined) { novo[k] = seed[k]; alterou = true; }
    // Textos definidos depois na semente preenchem só campos ainda vazios no salvo
    else if (typeof seed[k] === "string" && seed[k] !== "" && novo[k] === "") { novo[k] = seed[k]; alterou = true; }
  });
  // Painel da missão: valores definidos na semente preenchem só os campos que ainda estão vazios no salvo
  if (seed.painelMissao && novo.painelMissao && typeof novo.painelMissao === "object") {
    Object.entries(seed.painelMissao).forEach(([k, v]) => {
      if (typeof v === "string" && v !== "" && (novo.painelMissao[k] === undefined || novo.painelMissao[k] === "")) {
        novo.painelMissao = { ...novo.painelMissao, [k]: v };
        alterou = true;
      }
    });
  }
  LISTAS_SEMENTE.forEach((k) => {
    const itensSeed = seed[k] || [];
    const atual = Array.isArray(novo[k]) ? novo[k] : [];
    const idsAtuais = new Set(atual.map((x) => x.id));
    const faltando = itensSeed.filter((x) => !idsAtuais.has(x.id) && !vistos.has(x.id));
    if (faltando.length) { novo[k] = [...atual, ...faltando]; alterou = true; }
    itensSeed.forEach((x) => {
      if (!vistos.has(x.id)) { vistos.add(x.id); alterou = true; }
    });
  });
  if (alterou) novo._seedItens = [...vistos];
  return [novo, alterou];
}

// Projetos salvos (mesclados com a semente) e função para atualizar e salvar.
// Usado pelas abas Projetos e Missões, que leem e gravam a mesma lista.
export function useProjetos() {
  const [projetos, setProjetos] = useState(null);
  const salvarTimer = useRef(null);
  const pendente = useRef(null);

  const carregar = useRef(null);
  useEffect(() => {
    let vivo = true;
    carregar.current = async () => {
      let salvos = [];
      try {
        const r = await storage.get(STORAGE_PROJECTS, true);
        salvos = r && r.value ? JSON.parse(r.value) : [];
      } catch (e) {
        salvos = [];
      }
      let mudou = false;
      const porId = new Map(SEED_PROJECTS.map((p) => [p.id, p]));
      const lista = salvos.map((p) => {
        const correcoes = CORRIGIR_PROJETOS[p.id];
        if (correcoes) {
          Object.entries(correcoes).forEach(([campo, { de, para }]) => {
            if (p[campo] === de) { p = { ...p, [campo]: para }; mudou = true; }
          });
        }
        const seed = porId.get(p.id);
        if (!seed) return p;
        const [mesclado, alterou] = mesclarSemente(p, seed);
        if (alterou) mudou = true;
        return mesclado;
      });
      const ids = new Set(salvos.map((p) => p.id));
      SEED_PROJECTS.filter((p) => !ids.has(p.id)).forEach((p) => { lista.push(p); mudou = true; });
      if (!vivo) return;
      setProjetos(lista);
      if (mudou) {
        try { await storage.set(STORAGE_PROJECTS, JSON.stringify(lista), true); } catch (e) { /* sem armazenamento */ }
      }
    };
    carregar.current();
    return () => { vivo = false; };
  }, []);

  // Alteração feita por outra pessoa (banco compartilhado): recarrega, salvo se houver edição
  // local ainda não gravada ou alguém digitando (aí recarrega ao sair do campo)
  useEffect(() => {
    let atrasado = false;
    const digitando = () => {
      const el = document.activeElement;
      return el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
    };
    const tentar = () => {
      if (pendente.current || digitando()) { atrasado = true; return; }
      atrasado = false;
      if (carregar.current) carregar.current();
    };
    const aoAtualizar = (e) => { if (e.detail?.key === STORAGE_PROJECTS) tentar(); };
    const aoSair = () => { if (atrasado) setTimeout(tentar, 400); };
    window.addEventListener(EVENTO_ATUALIZADO, aoAtualizar);
    document.addEventListener("focusout", aoSair);
    return () => {
      window.removeEventListener(EVENTO_ATUALIZADO, aoAtualizar);
      document.removeEventListener("focusout", aoSair);
    };
  }, []);

  // Grava na hora ao sair da aba, para não perder a última edição
  useEffect(() => () => {
    clearTimeout(salvarTimer.current);
    if (pendente.current) storage.set(STORAGE_PROJECTS, JSON.stringify(pendente.current), true).catch(() => {});
  }, []);

  const atualizar = (next) => {
    setProjetos(next);
    pendente.current = next;
    clearTimeout(salvarTimer.current);
    salvarTimer.current = setTimeout(() => {
      pendente.current = null;
      storage.set(STORAGE_PROJECTS, JSON.stringify(next), true).catch(() => {});
    }, 300);
  };

  return [projetos, atualizar];
}

export const ehMissao = (p) => !!(p && (p.missao || p.painelMissao));
