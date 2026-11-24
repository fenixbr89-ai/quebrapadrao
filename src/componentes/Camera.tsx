import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Icone3D } from "./Icone3D";

/** Quadros de transição (sobreposição entre uma cena e a próxima). */
export const TRANSICAO = 18;

export type Transicao = "zoom" | "chicoteX" | "chicoteY" | "giro";
const SEQUENCIA: Transicao[] = ["zoom", "chicoteX", "zoom", "giro", "chicoteY"];
export const transicaoDe = (i: number): Transicao => SEQUENCIA[i % SEQUENCIA.length];

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const NIVEIS = [0, 4, 9, 16, 26, 40, 60];

/** Filtros SVG de desfoque direcional (motion blur) — renderizar uma vez no vídeo. */
export const FiltrosMovimento: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    {NIVEIS.slice(1).map((n, k) => (
      <React.Fragment key={n}>
        <filter id={`mbx${k + 1}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={`${n} 0`} />
        </filter>
        <filter id={`mby${k + 1}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={`0 ${n}`} />
        </filter>
      </React.Fragment>
    ))}
  </svg>
);
const borrao = (eixo: "x" | "y", intensidade: number) => {
  const k = Math.round(Math.max(0, Math.min(1, intensidade)) * (NIVEIS.length - 1));
  return k === 0 ? "" : `url(#mb${eixo}${k})`;
};

/** Estado visual de uma transição: p=0 cena parada, p=1 cena fora da tela. sentido: -1 entrando, +1 saindo. */
function estilo(tipo: Transicao, p: number, sentido: 1 | -1): React.CSSProperties {
  // Transições macias: a cena se dissolve na outra, sem "soco" de escala no final.
  if (p <= 0) return {};
  const fade = { opacity: 1 - p };
  switch (tipo) {
    case "zoom": {
      const escala = sentido === 1 ? 1 + p * 0.12 : 1 - p * 0.08;
      return { transform: `scale(${escala})`, filter: `blur(${p * 14}px)`, ...fade };
    }
    case "chicoteX":
      return { transform: `translateX(${-sentido * p * 260}px)`, filter: borrao("x", p), ...fade };
    case "chicoteY":
      return { transform: `translateY(${-sentido * p * 320}px)`, filter: borrao("y", p), ...fade };
    case "giro":
      return { transform: `rotateY(${sentido * p * 22}deg)`, filter: `blur(${p * 10}px)`, ...fade };
  }
}

/** Movimento contínuo da câmera durante a cena (variado por cena). */
function movimento(indice: number, q: number): string {
  switch (indice % 4) {
    case 0:
      return `scale(${1 + q * 0.1}) rotateX(${5 - q * 5}deg)`;
    case 1:
      return `rotateY(${8 - q * 14}deg) scale(${1.0 + q * 0.06})`;
    case 2:
      return `translateY(${36 - q * 72}px) rotateX(${-6 + q * 10}deg) scale(1.02)`;
    default:
      return `rotateZ(${-2 + q * 4}deg) scale(${1.08 - q * 0.08})`;
  }
}

/** Ícone grande e desfocado passando bem perto da câmera (profundidade de campo). */
const Primeiro: React.FC<{ nome: string; duracao: number; lado: number }> = ({ nome, duracao, lado }) => {
  const f = useCurrentFrame();
  const q = f / Math.max(1, duracao);
  const x = lado > 0 ? interpolate(q, [0, 1], [1250, -250]) : interpolate(q, [0, 1], [-250, 1250]);
  const y = interpolate(q, [0, 1], [1500, 1150]);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${lado * 14}deg)`, opacity: 0.85 }}>
      <Icone3D nome={nome} tamanho={360} desfoque={22} />
    </div>
  );
};

/** Envolve a cena: câmera 3D em movimento + transição de entrada/saída + elemento em primeiro plano. */
export const Camera: React.FC<{
  indice: number;
  duracao: number; // quadros da cena sem a sobreposição
  entrada: Transicao | null;
  saida: Transicao | null;
  primeiroPlano?: string;
  suave?: boolean;
  children: React.ReactNode;
}> = ({ indice, duracao, entrada, saida, primeiroPlano, suave, children }) => {
  const f = useCurrentFrame();
  const q = interpolate(f, [0, duracao + TRANSICAO], [0, 1], cl); // linear: nunca "para" antes da troca
  const suaviza = Easing.inOut(Easing.sin);
  const pIn = entrada ? interpolate(f, [0, TRANSICAO], [1, 0], { ...cl, easing: suaviza }) : 0;
  const pOut = saida ? interpolate(f, [duracao, duracao + TRANSICAO], [0, 1], { ...cl, easing: suaviza }) : 0;
  const t = pOut > 0 ? estilo(saida!, pOut, 1) : estilo(entrada ?? "zoom", pIn, -1);
  return (
    <AbsoluteFill style={{ perspective: 1400, perspectiveOrigin: "50% 38%" }}>
      <AbsoluteFill style={{ ...t, transformOrigin: "50% 36%", transformStyle: "preserve-3d" }}>
        <AbsoluteFill style={{ transform: suave ? `scale(${1 + q * 0.04})` : movimento(indice, q), transformOrigin: "50% 36%" }}>
          {children}
        </AbsoluteFill>
        {primeiroPlano ? <Primeiro nome={primeiroPlano} duracao={duracao + TRANSICAO} lado={indice % 2 ? 1 : -1} /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
