/** Uso: npm run render -- <slug>  →  videos/<slug>/final.mp4 (1080×1920, 30 fps, só a narração). */
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Roteiro, Timing } from "../src/tipos";

const raiz = path.resolve(import.meta.dirname, "..");
const slug = process.argv[2];
const pasta = path.join(raiz, "videos", slug);
const roteiro: Roteiro = JSON.parse(readFileSync(path.join(pasta, "roteiro.json"), "utf8"));
const timing: Timing = JSON.parse(readFileSync(path.join(pasta, "timing.json"), "utf8"));
const nomeAudio = ["narracao.wav", "narracao.m4a", "narracao.mp3"].find((a) => existsSync(path.join(pasta, "audio", a)));
if (!nomeAudio) throw new Error("Sem áudio em videos/<slug>/audio/");
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const nav = existsSync(browserExecutable) ? { browserExecutable } : {};

const serveUrl = await bundle({ entryPoint: path.join(raiz, "src/index.ts"), publicDir: path.join(raiz, "videos") });
const inputProps = { roteiro, timing, audio: `${slug}/audio/${nomeAudio}` };
const composition = await selectComposition({ serveUrl, id: "Video", inputProps, ...nav });
let ultimo = -10;
await renderMedia({
  composition, serveUrl, inputProps, codec: "h264", audioCodec: "aac", crf: 18,
  outputLocation: path.join(pasta, "final.mp4"), ...nav,
  onProgress: ({ progress }) => { if (progress * 100 - ultimo >= 10) { ultimo = progress * 100; console.log(`${Math.round(ultimo)}%`); } },
});
console.log("ok →", path.join(pasta, "final.mp4"));
