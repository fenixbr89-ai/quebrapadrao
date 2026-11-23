/**
 * Uso: npm run sincronizar -- <slug>
 * Alinha o texto do roteiro (grafia da legenda) com palavras.json (tempos da fala) → timing.json.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { normalizar, tokenizar } from "../src/timing";
import type { PalavraTempo, Roteiro } from "../src/tipos";

const UN = ["zero", "um", "dois", "tres", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const DZ = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CT = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function ate999(n: number): string[] {
  if (n === 100) return ["cem"];
  const out: string[] = [];
  const c = Math.floor(n / 100), r = n % 100;
  if (c) out.push(CT[c]);
  if (r) {
    if (out.length) out.push("e");
    if (r < 20) out.push(UN[r]);
    else {
      out.push(DZ[Math.floor(r / 10)]);
      if (r % 10) out.push("e", UN[r % 10]);
    }
  }
  return out;
}
export function porExtenso(n: number): string[] {
  if (n < 1000) return n === 0 ? ["zero"] : ate999(n);
  const m = Math.floor(n / 1000), r = n % 1000;
  const out = m === 1 ? ["mil"] : [...ate999(m), "mil"];
  if (r) {
    if (r < 100 || r % 100 === 0) out.push("e");
    out.push(...ate999(r));
  }
  return out;
}

/** Como uma palavra do texto soa (lista de palavras faladas normalizadas). */
function falado(token: string): string[] {
  return token
    .replace(/[@]/g, " ")
    .split(/[-.\s]+/)
    .filter(Boolean)
    .flatMap((p) => {
      const so = p.replace(/[^\d]/g, "");
      if (so && so === p.replace(/[,;:!?]/g, "")) return porExtenso(Number(so));
      const n = normalizar(p).replace(/[.@]/g, "");
      return n ? [n] : [];
    });
}

export function alinhar(texto: string[], fala: PalavraTempo[]) {
  // expande o texto em sub-palavras faladas, lembrando de qual token veio cada uma
  const sub: { w: string; tok: number }[] = [];
  texto.forEach((t, i) => falado(t).forEach((w) => sub.push({ w, tok: i })));
  const f = fala.map((p) => normalizar(p.palavra));
  const A = sub.length, B = f.length;
  const dp = Array.from({ length: A + 1 }, () => new Array<number>(B + 1).fill(0));
  for (let i = 0; i <= A; i++) dp[i][0] = i;
  for (let j = 0; j <= B; j++) dp[0][j] = j;
  for (let i = 1; i <= A; i++)
    for (let j = 1; j <= B; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (sub[i - 1].w === f[j - 1] ? 0 : 1.2));
  // volta: guarda pares (sub i ↔ fala j) com casamento exato ou substituição
  const par = new Array<number>(A).fill(-1);
  const exato = new Array<boolean>(A).fill(false);
  let i = A, j = B;
  while (i > 0 && j > 0) {
    const c = sub[i - 1].w === f[j - 1] ? 0 : 1.2;
    if (dp[i][j] === dp[i - 1][j - 1] + c) {
      par[i - 1] = j - 1;
      exato[i - 1] = c === 0;
      i--; j--;
    } else if (dp[i][j] === dp[i - 1][j] + 1) i--;
    else j--;
  }
  const tempos: (PalavraTempo | null)[] = texto.map((t, k) => {
    const js = sub.map((s, si) => (s.tok === k ? par[si] : -1)).filter((x) => x >= 0);
    if (!js.length) return null;
    return { palavra: t, inicio: fala[Math.min(...js)].inicio, fim: fala[Math.max(...js)].fim };
  });
  const semPar = texto.filter((_, k) => !sub.some((s, si) => s.tok === k && exato[si]));
  // interpola quem ficou sem par entre vizinhos
  for (let k = 0; k < texto.length; k++) {
    if (tempos[k]) continue;
    let a = k - 1; while (a >= 0 && !tempos[a]) a--;
    let b = k + 1; while (b < texto.length && !tempos[b]) b++;
    const t0 = a >= 0 ? tempos[a]!.fim : 0;
    const t1 = b < texto.length ? tempos[b]!.inicio : t0 + 0.4 * (b - a);
    const passo = (t1 - t0) / (b - a);
    tempos[k] = { palavra: texto[k], inicio: t0 + passo * (k - a - 1), fim: t0 + passo * (k - a) };
  }
  // garante ordem não-decrescente
  const out = tempos as PalavraTempo[];
  for (let k = 1; k < out.length; k++) if (out[k].inicio < out[k - 1].inicio) out[k].inicio = out[k - 1].inicio;
  return { palavras: out, divergencia: semPar.length / texto.length, semPar };
}

if (process.argv[1]?.endsWith("sincronizar.ts")) {
  const slug = process.argv[2];
  const pasta = path.resolve(import.meta.dirname, "..", "videos", slug);
  const roteiro: Roteiro = JSON.parse(readFileSync(path.join(pasta, "roteiro.json"), "utf8"));
  const fala: PalavraTempo[] = JSON.parse(readFileSync(path.join(pasta, "palavras.json"), "utf8"));
  const texto = roteiro.cenas.flatMap((c) => tokenizar(c.texto));
  const { palavras, divergencia, semPar } = alinhar(texto, fala);
  const audio = ["narracao.wav", "narracao.m4a", "narracao.mp3"].map((a) => path.join(pasta, "audio", a)).find(existsSync);
  const duracaoAudio = audio
    ? Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audio]).toString())
    : null;
  writeFileSync(path.join(pasta, "timing.json"), JSON.stringify({ palavras, duracaoAudio }, null, 1));
  console.log(`divergência: ${(divergencia * 100).toFixed(1)}%  (${semPar.length} palavras sem par exato: ${semPar.join(" ")})`);
  if (divergencia > 0.15) console.log("ATENÇÃO: narração difere bastante do texto — avisar o dono.");
}
