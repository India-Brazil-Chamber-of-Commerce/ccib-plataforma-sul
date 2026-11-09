import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Presentation, X } from "lucide-react";
import { SLIDES as JORNADA_2026 } from "./resumos/JornadaCompliance2026";
import "./resumo.css";

// Resumos visuais de eventos. A chave é um trecho do nome do evento (sem diferenciar maiúsculas).
const RESUMOS = [{ trecho: "jornada do compliance", slides: JORNADA_2026 }];

export function resumoDoEvento(evento) {
  const nome = (evento.evento || "").toLowerCase();
  const r = RESUMOS.find((x) => nome.includes(x.trecho));
  return r ? r.slides : null;
}

const LARGURA = 1280;
const ALTURA = 720;

// Desenha um slide em 1280 x 720 e reduz para caber na largura (e altura, se pedida) disponível
function SlideEscalado({ Slide, alturaMax }) {
  const caixa = useRef(null);
  const [escala, setEscala] = useState(0.5);
  useLayoutEffect(() => {
    const el = caixa.current;
    if (!el) return undefined;
    const medir = () => {
      const w = el.clientWidth;
      const porLargura = w / LARGURA;
      setEscala(alturaMax ? Math.min(porLargura, alturaMax / ALTURA) : porLargura);
    };
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, [alturaMax]);
  return (
    <div ref={caixa} className="sl-caixa" style={{ height: ALTURA * escala }}>
      <div className="sl-palco" style={{ width: LARGURA, height: ALTURA, transform: `scale(${escala})`, left: alturaMax ? `calc(50% - ${(LARGURA * escala) / 2}px)` : 0 }}>
        <Slide />
      </div>
    </div>
  );
}

function ModoApresentacao({ slides, inicio, onFechar }) {
  const [i, setI] = useState(inicio);
  const [altura, setAltura] = useState(window.innerHeight - 70);
  const raiz = useRef(null);
  const ir = useCallback((d) => setI((x) => Math.max(0, Math.min(slides.length - 1, x + d))), [slides.length]);

  useEffect(() => {
    const tecla = (e) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); ir(1); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); ir(-1); }
      if (e.key === "Home") setI(0);
      if (e.key === "End") setI(slides.length - 1);
      if (e.key === "Escape" && !document.fullscreenElement) onFechar();
    };
    const tamanho = () => setAltura(window.innerHeight - 70);
    window.addEventListener("keydown", tecla);
    window.addEventListener("resize", tamanho);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", tecla);
      window.removeEventListener("resize", tamanho);
      document.body.style.overflow = "";
    };
  }, [ir, onFechar, slides.length]);

  const telaCheia = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (raiz.current && raiz.current.requestFullscreen) raiz.current.requestFullscreen();
  };

  const { Slide } = slides[i];
  return (
    <div className="sl-modo" ref={raiz} role="dialog" aria-label="Apresentação do resumo">
      <div className="sl-modo-palco" onClick={(e) => { if (e.target === e.currentTarget) ir(1); }}>
        <SlideEscalado key={slides[i].id} Slide={Slide} alturaMax={altura} />
      </div>
      <div className="sl-modo-barra">
        <button onClick={() => ir(-1)} disabled={i === 0} aria-label="Slide anterior"><ChevronLeft size={20} /></button>
        <span>{i + 1} / {slides.length} · {slides[i].titulo}</span>
        <button onClick={() => ir(1)} disabled={i === slides.length - 1} aria-label="Próximo slide"><ChevronRight size={20} /></button>
        <span className="sl-modo-dica">Setas do teclado para navegar</span>
        <button onClick={telaCheia} aria-label="Tela cheia"><Maximize2 size={18} /></button>
        <button onClick={onFechar} aria-label="Fechar apresentação"><X size={20} /></button>
      </div>
    </div>
  );
}

// Página do resumo: todos os slides em sequência, com índice e botão para apresentar
export default function ResumoEvento({ slides }) {
  const [apresentando, setApresentando] = useState(null);
  return (
    <div className="resumo-evento">
      <div className="resumo-cab">
        <div>
          <div className="section-title" style={{ margin: 0 }}>Resumo dos painéis</div>
          <p className="resumo-sub">{slides.length} slides · role a página para ler ou apresente em tela cheia na reunião.</p>
        </div>
        <button className="btn primary" onClick={() => setApresentando(0)} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Presentation size={16} /> Apresentar
        </button>
      </div>
      <div className="resumo-indice">
        {slides.map((s, i) => (
          <a key={s.id} href={`#resumo-${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(`resumo-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
            <span>{i + 1}</span>{s.titulo}
          </a>
        ))}
      </div>
      <div className="resumo-slides">
        {slides.map((s, i) => (
          <div key={s.id} id={`resumo-${s.id}`} className="resumo-slide">
            <SlideEscalado Slide={s.Slide} />
            <button className="resumo-slide-apresentar" onClick={() => setApresentando(i)}><Presentation size={13} /> Apresentar a partir daqui</button>
          </div>
        ))}
      </div>
      {apresentando !== null && <ModoApresentacao slides={slides} inicio={apresentando} onFechar={() => setApresentando(null)} />}
    </div>
  );
}
