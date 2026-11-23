import React from "react";
import type { Destaque, PalavraTempo } from "../tipos";
import { normalizar } from "../timing";
import { FONTE } from "./fonte";

const MAX_POR_BLOCO = 6;

/** Divide a frase em blocos curtos (máx. 2 linhas), preferindo quebrar depois de pontuação. */
export function blocos(n: number, palavras: string[]): [number, number][] {
  const out: [number, number][] = [];
  let ini = 0;
  while (ini < n) {
    let fim = Math.min(n, ini + MAX_POR_BLOCO);
    if (fim < n) {
      for (let k = fim; k > ini + 2; k--) {
        if (/[,.:?!]$/.test(palavras[k - 1])) {
          fim = k;
          break;
        }
      }
      if (n - fim < 2) fim = n; // evita sobrar 1 palavra sozinha
    }
    out.push([ini, fim]);
    ini = fim;
  }
  return out;
}

function corDestaque(i: number, palavras: string[], destaques: Destaque[]): Destaque["cor"] | null {
  for (const d of destaques) {
    const alvo = d.palavra.split(/\s+/).map(normalizar);
    for (let s = Math.max(0, i - alvo.length + 1); s <= i; s++) {
      if (alvo.every((a, k) => normalizar(palavras[s + k] ?? "") === a)) return d.cor;
    }
  }
  return null;
}

export const Legenda: React.FC<{ palavras: PalavraTempo[]; destaques: Destaque[]; tempo: number }> = ({ palavras, destaques, tempo }) => {
  const textos = palavras.map((p) => p.palavra);
  const bs = blocos(palavras.length, textos);
  let atual = 0;
  bs.forEach(([ini], k) => {
    if (palavras[ini].inicio <= tempo) atual = k;
  });
  const [ini, fim] = bs[atual];
  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        right: 110,
        top: 1330,
        textAlign: "center",
        fontFamily: FONTE,
        fontSize: 50,
        lineHeight: 1.28,
        letterSpacing: -0.3,
      }}
    >
      {palavras.slice(ini, fim).map((p, j) => {
        const i = ini + j;
        const falada = tempo >= p.inicio;
        const prog = Math.min(1, Math.max(0, (tempo - p.inicio) / 0.12));
        const d = corDestaque(i, textos, destaques);
        const cor = !falada ? "#2e2e2e" : d === "vermelho" ? "#E53935" : "#ffffff";
        return (
          <span
            key={i}
            style={{
              color: cor,
              fontWeight: d ? 800 : 500,
              display: "inline-block",
              marginRight: 13,
              transform: `translateY(${(1 - prog) * 6}px)`,
            }}
          >
            {p.palavra}
          </span>
        );
      })}
    </div>
  );
};
