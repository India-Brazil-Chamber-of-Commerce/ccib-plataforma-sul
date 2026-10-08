// Build usado pela Vercel nos dois projetos que apontam para este repositório.
// Se o projeto da Vercel for o de Compliance, gera a pasta compliance/ e copia o resultado para dist/.
// Assim a Plataforma de Compliance é publicada mesmo que o Root Directory do projeto fique na raiz.
// Em qualquer outro caso (Regional Sul, npm run build local), faz o build normal da Regional Sul.
import { execSync } from "node:child_process";
import { cpSync, rmSync } from "node:fs";

const urls = [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL].join(" ");
const ehCompliance = process.env.PLATAFORMA === "compliance" || /compliance/i.test(urls);
const run = (cmd) => execSync(cmd, { stdio: "inherit" });

if (ehCompliance) {
  console.log("Projeto de Compliance detectado: gerando compliance/ e copiando para dist/");
  run("npm ci --prefix compliance");
  run("npm run build --prefix compliance");
  rmSync("dist", { recursive: true, force: true });
  cpSync("compliance/dist", "dist", { recursive: true });
} else {
  run("npx vite build");
}
