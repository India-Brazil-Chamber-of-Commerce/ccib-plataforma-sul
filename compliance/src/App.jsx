import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { STORAGE } from "./constants";
import { SEEDS } from "./data/seeds";
import { storage } from "./lib/storage";
import LOGO_URL from "./assets/logo-ccib.png";
import VisaoGeralTab from "./tabs/VisaoGeralTab";
import PoliticasTab from "./tabs/PoliticasTab";
import TreinamentosTab from "./tabs/TreinamentosTab";
import DueDiligenceTab from "./tabs/DueDiligenceTab";
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
      { id: "due", label: "Due diligence", Tab: DueDiligenceTab },
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
  const timers = useRef({});
  const pending = useRef({});

  useEffect(() => {
    (async () => {
      const entries = await Promise.all(
        Object.entries(STORAGE).map(async ([nome, key]) => {
          try {
            const r = await storage.get(key, true);
            if (r && r.value) return [nome, JSON.parse(r.value)];
          } catch (e) {
            console.error(`Falha ao carregar ${nome}`, e);
          }
          // Primeira vez: grava os dados iniciais
          try {
            await storage.set(key, JSON.stringify(SEEDS[nome]), true);
          } catch (e) {
            console.error(`Falha ao gravar dados iniciais de ${nome}`, e);
          }
          return [nome, SEEDS[nome]];
        })
      );
      setDb(Object.fromEntries(entries));
    })();
  }, []);

  const flush = useCallback(async (nome) => {
    const lista = pending.current[nome];
    delete pending.current[nome];
    delete timers.current[nome];
    try {
      await storage.set(STORAGE[nome], JSON.stringify(lista), true);
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
            {saveState === "salvando" ? "Salvando..." : saveState === "erro" ? "Erro ao salvar" : "Salvo"}
          </span>
        </div>
        <div className="content">
          <Atual db={db} save={save} />
        </div>
      </main>
    </div>
  );
}
