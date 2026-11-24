/** Uso: npm run render -- <slug>  →  videos/<slug>/final.mp4 (1080×1920, 30 fps, só a narração). */
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Roteiro, Timing } from "../src/tipos";
import { estimarTiming } from "../src/timing";

const raiz = path.resolve(import.meta.dirname, "..");
const slug = process.argv[2];
const pasta = path.join(raiz, "videos", slug);
const roteiro: Roteiro = JSON.parse(readFileSync(path.join(pasta, "roteiro.json"), "utf8"));
// --previa: sem narração, com tempos estimados → previa.mp4 (para o dono ver a animação antes de gravar)
const previa = process.argv.includes("--previa");
const nomeAudio = previa ? undefined : ["narracao.wav", "narracao.m4a", "narracao.mp3"].find((a) => existsSync(path.join(pasta, "audio", a)));
if (!previa && !nomeAudio) throw new Error("Sem áudio em videos/<slug>/audio/ (use --previa para uma prévia sem narração)");
const timing: Timing = previa ? estimarTiming(roteiro) : JSON.parse(readFileSync(path.join(pasta, "timing.json"), "utf8"));
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const nav = existsSync(browserExecutable) ? { browserExecutable } : {};

const serveUrl = await bundle({ entryPoint: path.join(raiz, "src/index.ts"), publicDir: path.join(raiz, "videos") });
const inputProps = { roteiro, timing, audio: nomeAudio ? `${slug}/audio/${nomeAudio}` : null };
const composition = await selectComposition({ serveUrl, id: "Video", inputProps, ...nav });
let ultimo = -10;
await renderMedia({
  composition, serveUrl, inputProps, codec: "h264", crf: 18, ...(nomeAudio ? { audioCodec: "aac" as const } : { muted: true }),
  outputLocation: path.join(pasta, previa ? "previa.mp4" : "final.mp4"), ...nav,
  onProgress: ({ progress }) => { if (progress * 100 - ultimo >= 10) { ultimo = progress * 100; console.log(`${Math.round(ultimo)}%`); } },
});
console.log("ok →", path.join(pasta, previa ? "previa.mp4" : "final.mp4"));
