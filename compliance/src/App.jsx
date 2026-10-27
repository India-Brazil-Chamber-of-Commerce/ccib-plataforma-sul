import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { STORAGE } from "./constants";
import { SEEDS, migrarEventos, aplicarConvites } from "./data/seeds";
import { storage } from "./lib/storage";
import LOGO_URL from "./assets/logo-ccib.png";
import VisaoGeralTab from "./tabs/VisaoGeralTab";
import PoliticasTab from "./tabs/PoliticasTab";
import TreinamentosTab from "./tabs/TreinamentosTab";
import ConflitosTab from "./tabs/ConflitosTab";
import BrindesTab from "./tabs/BrindesTab";
import AgentesPublicosTab from "./tabs/AgentesPublicosTab";
import PactoGlobalTab from "./tabs/PactoGlobalTab";
import EventosTab from "./tabs/EventosTab";
import DuvidasTab from "./tabs/DuvidasTab";
import DenunciasTab from "./tabs/DenunciasTab";
import "./styles.css";

const MENU = [
  { grupo: "Visão geral", itens: [{ id: "visao", label: "Compliance", Tab: VisaoGeralTab }] },
  {
    grupo: "Governança",
    itens: [
      { id: "politicas", label: "Políticas e documentos", Tab: PoliticasTab },
      { id: "treinamentos", label: "Treinamentos", Tab: TreinamentosTab },
      { id: "conflitos", label: "Conflitos de interesse", Tab: ConflitosTab },
      { id: "brindes", label: "Brindes e hospitalidades", Tab: BrindesTab },
      { id: "agentes", label: "Agentes Públicos", Tab: AgentesPublicosTab },
      { id: "pacto", label: "Pacto Global da ONU", Tab: PactoGlobalTab },
      { id: "eventos", label: "Eventos", Tab: EventosTab },
    ],
  },
  {
    grupo: "Canais",
    itens: [
      { id: "duvidas", label: "Canal de dúvidas", Tab: DuvidasTab },
      { id: "denuncias", label: "Canal de denúncias", Tab: DenunciasTab },
    ],
  },
];
const ITENS = MENU.flatMap((g) => g.itens);

// Espera um pouco antes de gravar, para não salvar a cada tecla digitada
const SAVE_DELAY_MS = 600;

export default function App() {
  const [tab, setTab] = useState("visao");
  const [db, setDb] = useState(null);
  const [saveState, setSaveState] = useState("salvo");
  const [compartilhado, setCompartilhado] = useState(false);
  const timers = useRef({});
  const pending = useRef({});

  const carregar = useCallback(async () => {
    const entries = await Promise.all(
      Object.entries(STORAGE).map(async ([nome, key]) => {
        try {
          const r = await storage.get(key, true);
          if (r && r.value) return [nome, JSON.parse(r.value)];
        } catch (e) {
          console.error(`Falha ao carregar ${nome}`, e);
        }
        if (SEEDS[nome] === undefined) return [nome, undefined];
        // Primeira vez: grava os dados iniciais
        try {
          await storage.set(key, JSON.stringify(SEEDS[nome]), true);
        } catch (e) {
          console.error(`Falha ao gravar dados iniciais de ${nome}`, e);
        }
        return [nome, SEEDS[nome]];
      })
    );
    const dados = Object.fromEntries(entries);
    if (dados.eventos === undefined) {
      dados.eventos = migrarEventos(dados.eventosFuturos, dados.eventosPassados);
      try {
        await storage.set(STORAGE.eventos, JSON.stringify(dados.eventos), true);
      } catch (e) {
        console.error("Falha ao gravar eventos", e);
      }
    }
    const convites = aplicarConvites(dados.eventos);
    if (convites.mudou) {
      dados.eventos = convites.lista;
      try {
        await storage.set(STORAGE.eventos, JSON.stringify(dados.eventos), true);
      } catch (e) {
        console.error("Falha ao gravar convites dos eventos", e);
      }
    }
    setDb(dados);
    setCompartilhado(storage.ehCompartilhado());
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Ao voltar para a aba, busca o que os colegas salvaram (se não houver edição pendente)
  useEffect(() => {
    const aoVoltar = () => {
      if (document.visibilityState === "visible" && Object.keys(pending.current).length === 0) carregar();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => document.removeEventListener("visibilitychange", aoVoltar);
  }, [carregar]);

  const flush = useCallback(async (nome) => {
    const lista = pending.current[nome];
    delete timers.current[nome];
    if (lista === undefined) return;
    try {
      await storage.set(STORAGE[nome], JSON.stringify(lista), true);
      // Só considera salvo se ninguém editou de novo enquanto gravava (evita recarregar por cima)
      if (pending.current[nome] === lista) delete pending.current[nome];
      if (Object.keys(pending.current).length === 0) setSaveState("salvo");
    } catch (e) {
      console.error(`Falha ao salvar ${nome}`, e);
      setSaveState("erro");
    }
  }, []);

  const save = useCallback(
    (nome, lista) => {
      setDb((prev) => ({ ...prev, [nome]: lista }));
      setSaveState("salvando");
      pending.current[nome] = lista;
      clearTimeout(timers.current[nome]);
      timers.current[nome] = setTimeout(() => flush(nome), SAVE_DELAY_MS);
    },
    [flush]
  );

  // Grava o que estiver pendente se a pessoa fechar a aba logo depois de editar
  useEffect(() => {
    const antesDeSair = () => Object.keys(pending.current).forEach((nome) => flush(nome));
    window.addEventListener("beforeunload", antesDeSair);
    return () => window.removeEventListener("beforeunload", antesDeSair);
  }, [flush]);

  if (!db) {
    return (
      <div className="loading">
        <Loader2 size={18} className="spin" /> Carregando plataforma...
      </div>
    );
  }

  const atual = ITENS.find((i) => i.id === tab) || ITENS[0];
  const Atual = atual.Tab;
  let numero = 0;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-logo" src={LOGO_URL} alt="Câmara de Comércio Índia Brasil" />
          <div className="brand-text">
            <p className="eyebrow">CCIB</p>
            <h1>Plataforma de Compliance</h1>
          </div>
        </div>
        <nav>
          {MENU.map((g) => (
            <React.Fragment key={g.grupo}>
              <div className="nav-group-label">{g.grupo}</div>
              {g.itens.map((i) => (
                <button
                  key={i.id}
                  className={`nav-item${i.id === tab ? " active" : ""}`}
                  onClick={() => {
                    setTab(i.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <span className="num">{String(++numero).padStart(2, "0")}</span>
                  {i.label}
                </button>
              ))}
            </React.Fragment>
          ))}
        </nav>
        <div className="sidebar-footer">Câmara de Comércio Índia Brasil (CCIB). Programa de integridade.</div>
      </aside>

      <main>
        <div className="topbar">
          <h2>{atual.label}</h2>
          <span className={`save-state${saveState === "erro" ? " err" : ""}`}>
            {saveState === "salvando" ? "Salvando..." : saveState === "erro" ? "Erro ao salvar" : compartilhado ? "Salvo para todos" : "Salvo neste navegador"}
          </span>
        </div>
        <div className="content">
          <Atual db={db} save={save} />
        </div>
      </main>
    </div>
  );
}
