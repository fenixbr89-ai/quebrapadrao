/**
 * Uso: npm run storyboard -- <slug> [--cenas id1,id2]
 * Renderiza um quadro (70% da cena) de cada cena e monta storyboard/prancha.jpg.
 */
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { calcularCenas, estimarTiming } from "../src/timing";
import type { Roteiro, Timing } from "../src/tipos";

const raiz = path.resolve(import.meta.dirname, "..");
const slug = process.argv[2];
if (!slug) throw new Error("Informe o slug: npm run storyboard -- <slug>");
const i = process.argv.indexOf("--cenas");
const so = i > 0 ? process.argv[i + 1].split(",") : null;

const pasta = path.join(raiz, "videos", slug);
const roteiro: Roteiro = JSON.parse(readFileSync(path.join(pasta, "roteiro.json"), "utf8"));
const faltando = roteiro.cenas
  .map((c) => ("imagem" in c.visual ? c.visual.imagem : null))
  .filter((x): x is string => !!x && !existsSync(path.join(pasta, x)));
if (faltando.length) throw new Error(`Imagens ausentes: ${faltando.join(", ")}`);

const timingPath = path.join(pasta, "timing.json");
const timing: Timing = existsSync(timingPath) ? JSON.parse(readFileSync(timingPath, "utf8")) : estimarTiming(roteiro);
const cenas = calcularCenas(roteiro, timing);
writeFileSync(path.join(pasta, "narracao.txt"), roteiro.cenas.map((c) => c.texto).join("\n\n") + "\n");

const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const opcoesNavegador = existsSync(browserExecutable) ? { browserExecutable } : {};

const serveUrl = await bundle({ entryPoint: path.join(raiz, "src/index.ts"), publicDir: path.join(raiz, "videos") });
const inputProps = { roteiro, timing, audio: null };
const comp = await selectComposition({ serveUrl, id: "Video", inputProps, ...opcoesNavegador });
const saida = path.join(pasta, "storyboard");
mkdirSync(saida, { recursive: true });

const arquivos: string[] = [];
for (const [k, c] of roteiro.cenas.entries()) {
  const nome = path.join(saida, `${String(k + 1).padStart(2, "0")}-${c.id}.jpg`);
  arquivos.push(nome);
  if (so && !so.includes(c.id)) continue;
  const frame = cenas[k].inicioFrame + Math.floor(cenas[k].duracaoFrames * 0.7);
  await renderStill({ composition: comp, serveUrl, output: nome, frame, inputProps, imageFormat: "jpeg", jpegQuality: 88, ...opcoesNavegador });
  console.log("ok", path.basename(nome));
}

// prancha: 5 colunas, cada quadro reduzido
const colunas = 5;
const linhas = Math.ceil(arquivos.length / colunas);
execFileSync("ffmpeg", [
  "-loglevel", "error", "-y",
  ...arquivos.flatMap((a) => ["-i", a]),
  "-filter_complex",
  arquivos.map((_, j) => `[${j}]scale=270:480[s${j}]`).join(";") + ";" +
    arquivos.map((_, j) => `[s${j}]`).join("") +
    `xstack=inputs=${arquivos.length}:layout=${arquivos.map((_, j) => `${(j % colunas) * 270}_${Math.floor(j / colunas) * 480}`).join("|")}:fill=black`,
  "-frames:v", "1", "-q:v", "3",
  path.join(saida, "prancha.jpg"),
]);
console.log(`prancha: ${linhas} linhas → ${path.join(saida, "prancha.jpg")}`);
