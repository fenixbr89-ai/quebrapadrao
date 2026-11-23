import type { Roteiro, Timing } from "./tipos";

export const FPS = 30;

export const tokenizar = (texto: string) => texto.split(/\s+/).filter(Boolean);
export const normalizar = (p: string) =>
  p.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9@.]/g, "").replace(/\.$/, "");

/** Tempos estimados (antes de existir narração): ~150 palavras/min, palavras longas duram mais. */
export function estimarTiming(roteiro: Roteiro, palavrasPorMinuto = 150): Timing {
  const todas = roteiro.cenas.flatMap((c) => tokenizar(c.texto).map((p, i, arr) => ({ p, fimCena: i === arr.length - 1 })));
  const pesos = todas.map(({ p }) => 2 + normalizar(p).length);
  const total = (todas.length / palavrasPorMinuto) * 60;
  const pausas = roteiro.cenas.length * 0.25;
  const porPeso = (total - pausas) / pesos.reduce((a, b) => a + b, 0);
  let t = 0.2;
  const palavras = todas.map(({ p, fimCena }, i) => {
    const inicio = t;
    const fim = t + pesos[i] * porPeso;
    t = fim + (fimCena ? 0.25 : 0);
    return { palavra: p, inicio, fim };
  });
  return { palavras, duracaoAudio: null };
}

export type CenaTempo = { inicioFrame: number; duracaoFrames: number; palavraInicio: number; palavraFim: number };

/** Cada cena começa quando sua primeira palavra é falada e vai até a próxima começar. */
export function calcularCenas(roteiro: Roteiro, timing: Timing, fps = FPS): CenaTempo[] {
  let idx = 0;
  const brutas = roteiro.cenas.map((c, i) => {
    const n = tokenizar(c.texto).length;
    const r = { palavraInicio: idx, palavraFim: idx + n, inicio: i === 0 ? 0 : timing.palavras[idx].inicio };
    idx += n;
    return r;
  });
  const ultimaFala = timing.palavras[timing.palavras.length - 1].fim;
  const fimTotal = Math.max(ultimaFala, timing.duracaoAudio ?? 0) + 1;
  return brutas.map((b, i) => {
    const inicioFrame = Math.round(b.inicio * fps);
    const fim = i + 1 < brutas.length ? Math.round(brutas[i + 1].inicio * fps) : Math.round(fimTotal * fps);
    return { inicioFrame, duracaoFrames: Math.max(1, fim - inicioFrame), palavraInicio: b.palavraInicio, palavraFim: b.palavraFim };
  });
}
