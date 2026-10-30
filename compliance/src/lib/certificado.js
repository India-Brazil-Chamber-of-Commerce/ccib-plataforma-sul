// Monta o HTML dos certificados (A4 paisagem). O mesmo HTML serve para a prévia na tela
// e para a janela de impressão, onde o navegador gera o PDF ("Salvar como PDF").
// Nada é enviado a ninguém: quem distribui os certificados é a equipe.
import LOGO_URL from "../assets/logo-ccib.png";

export const TEXTO_PADRAO =
  "participou da {evento}, na qualidade de {funcao}, promovida pela Câmara de Comércio Índia Brasil (CCIB), realizada em {data}, em {local}, com carga horária de {carga}.";

export const FUNCOES_CERTIFICADO = ["Participante", "Palestrante", "Moderador(a)", "Organizador(a)", "Colaborador(a)"];

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

// "2026-11-18" vira "18 de novembro de 2026"
export function dataPorExtenso(iso) {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${Number(m[3])} de ${MESES[Number(m[2]) - 1]} de ${m[1]}` : "";
}

export function certificadoPadrao(evento) {
  return {
    titulo: "Certificado",
    subtitulo: "de Participação",
    nomeEvento: evento.evento || "",
    data: dataPorExtenso(evento.data) || evento.dataPrevista || "",
    local: evento.local || "",
    texto: TEXTO_PADRAO,
    carga: "",
    cidadeData: "",
    assinaturas: [
      { nome: "", cargo: "" },
      { nome: "", cargo: "" },
    ],
  };
}

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Troca {campo} pelo valor (em negrito) ou por um marcador visível quando estiver vazio
// Valor entre asteriscos (ex.: "*on-line*") sai em itálico; os demais saem em negrito
function preencher(texto, valores) {
  return esc(texto)
    .replace(/\{(\w+)\}/g, (m, campo) => {
      const v = String(valores[campo] || "").trim();
      if (!v) return `<span class="falta">[${campo}]</span>`;
      const italico = v.match(/^\*(.+)\*$/);
      // Valores curtos ("2 horas", "on-line") não quebram no meio da linha
      const nw = v.length <= 25 ? ' class="nw"' : "";
      return italico ? `<em${nw}>${esc(italico[1])}</em>` : `<strong${nw}>${esc(v)}</strong>`;
    })
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function pagina(modelo, pessoa, valores) {
  const assinaturas = (modelo.assinaturas || [])
    .filter((a, i) => i === 0 || a.nome || a.cargo)
    .map(
      (a) => `<div class="ass"><div class="linha"></div><div class="ass-nome">${esc(a.nome) || '<span class="falta">[nome]</span>'}</div><div class="ass-cargo">${esc(a.cargo) || '<span class="falta">[cargo]</span>'}</div></div>`
    )
    .join("");
  const v = { ...valores, nome: pessoa.nome, funcao: (pessoa.funcao || "").toLowerCase() };
  return `<section class="pagina">
  <div class="faixa"><div class="circulo"></div></div><div class="filete"></div>
  <div class="moldura"><div class="moldura2"></div></div>
  <div class="conteudo">
    <img class="logo" src="${new URL(LOGO_URL, window.location.href).href}" alt="Câmara de Comércio Índia Brasil">
    <div class="titulo">${esc(modelo.titulo)}</div>
    <div class="subtitulo">${esc(modelo.subtitulo)}</div>
    <div class="certificamos">Certificamos que</div>
    <div class="nome">${esc(pessoa.nome) || '<span class="falta">[Nome do colaborador]</span>'}</div>
    <p class="texto">${preencher(modelo.texto, v)}</p>
    <div class="cidade">${esc(modelo.cidadeData) || '<span class="falta">[Cidade], [dia] de [mês] de [ano]</span>'}</div>
    <div class="assinaturas">${assinaturas}</div>
  </div>
  <div class="rodape"></div>
</section>`;
}

const ESTILO = `
@page { size: A4 landscape; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: 'Inter', Arial, sans-serif; color: #1C2430; }
.pagina { position: relative; width: 297mm; height: 210mm; overflow: hidden; page-break-after: always; break-after: page; background: #fff; }
.pagina:last-child { page-break-after: auto; break-after: auto; }
.faixa { position: absolute; left: 0; top: 0; bottom: 0; width: 47mm; background: #10309A; overflow: hidden; }
.circulo { position: absolute; left: -47mm; top: -47mm; width: 94mm; height: 94mm; border-radius: 50%; background: #009245; }
.filete { position: absolute; left: 47mm; top: 0; bottom: 0; width: 2mm; background: #F77F1A; }
.moldura { position: absolute; left: 57mm; top: 8mm; right: 8mm; bottom: 8mm; border: 0.6mm solid #10309A; }
.moldura2 { position: absolute; inset: 2mm; border: 0.25mm solid #C8D2EB; }
.rodape { position: absolute; right: 10mm; bottom: 10mm; width: 44mm; height: 3mm; background: #009245; }
.conteudo { position: absolute; left: 70mm; right: 22mm; top: 18mm; bottom: 16mm; display: flex; flex-direction: column; align-items: center; text-align: center; }
.logo { height: 20mm; width: auto; margin-bottom: 7mm; }
.titulo { font-family: 'Fraunces', Georgia, serif; font-size: 44pt; font-weight: 700; color: #10309A; text-transform: uppercase; letter-spacing: 0.06em; line-height: 1; }
.subtitulo { font-size: 13pt; font-weight: 600; color: #009245; text-transform: uppercase; letter-spacing: 0.35em; margin-top: 3mm; }
.certificamos { font-size: 13pt; color: #4B5563; margin-top: 9mm; }
.nome { font-family: 'Fraunces', Georgia, serif; font-size: 28pt; font-weight: 600; color: #0B1E3D; margin-top: 3mm; padding: 0 8mm 2mm; border-bottom: 0.5mm solid #F77F1A; min-width: 60%; }
.texto { font-size: 12.5pt; line-height: 1.6; color: #1C2430; margin-top: 6mm; max-width: 175mm; }
.texto strong { color: #0B1E3D; }
.nw { white-space: nowrap; }
.cidade { font-size: 11pt; color: #4B5563; margin-top: 6mm; }
.assinaturas { display: flex; justify-content: center; gap: 22mm; margin-top: auto; width: 100%; }
.ass { width: 70mm; text-align: center; }
.linha { border-top: 0.3mm solid #1C2430; margin-bottom: 2mm; }
.ass-nome { font-size: 11pt; font-weight: 600; color: #0B1E3D; }
.ass-cargo { font-size: 9.5pt; color: #4B5563; margin-top: 0.5mm; }
.falta { color: #B8862E; font-weight: 600; }
@media print { .falta { color: #B8862E; } }
`;

const FONTES =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;600&display=swap" rel="stylesheet">';

export function htmlCertificados(modelo, pessoas, valores, { imprimir = false } = {}) {
  const lista = pessoas.length ? pessoas : [{ nome: "", funcao: "" }];
  const script = imprimir
    ? "<script>window.addEventListener('load',function(){(document.fonts?document.fonts.ready:Promise.resolve()).then(function(){setTimeout(function(){window.print();},300);});});<\/script>"
    : "";
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Certificados - ${esc(modelo.nomeEvento)}</title>${FONTES}<style>${ESTILO}</style></head><body>${lista
    .map((p) => pagina(modelo, p, valores))
    .join("")}${script}</body></html>`;
}

// Abre uma janela com os certificados e o diálogo de impressão (escolha "Salvar como PDF")
export function imprimirCertificados(modelo, pessoas, valores) {
  const janela = window.open("", "_blank");
  if (!janela) {
    window.alert("O navegador bloqueou a janela dos certificados. Permita pop-ups para este site e tente de novo.");
    return;
  }
  janela.document.open();
  janela.document.write(htmlCertificados(modelo, pessoas, valores, { imprimir: true }));
  janela.document.close();
}
