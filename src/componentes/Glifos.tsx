import React from "react";

/** Glifos em SVG (viewBox 0 0 100 100), desenhados numa cor só. */
type G = React.FC<{ c: string }>;

const Cafe: G = ({ c }) => (
  <g fill="none" stroke={c} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 44 h46 v12 a23 23 0 0 1 -46 0 z" fill={c} />
    <path d="M68 50 h5 a9 9 0 0 1 0 18 h-7" />
    <path d="M16 86 h62" />
    <path d="M36 18 q-5 7 0 13 M50 14 q-5 8 0 16 M64 18 q-5 7 0 13" strokeWidth={5} />
  </g>
);

const Boi: G = ({ c }) => (
  <g fill={c}>
    <path d="M14 26 q8 12 24 12 l-4 -9 q-12 2 -20 -3z" />
    <path d="M86 26 q-8 12 -24 12 l4 -9 q12 2 20 -3z" />
    <path d="M30 36 q20 -8 40 0 q4 16 -2 30 q-3 18 -18 18 q-15 0 -18 -18 q-6 -14 -2 -30z" />
    <path d="M30 40 q-14 -2 -18 6 q8 6 20 2z M70 40 q14 -2 18 6 q-8 6 -20 2z" />
  </g>
);
const BoiDetalhe: G = ({ c }) => (
  <g fill={c}>
    <circle cx="42" cy="50" r="3.5" />
    <circle cx="58" cy="50" r="3.5" />
    <ellipse cx="50" cy="74" rx="12" ry="8" opacity={0.35} />
    <circle cx="45" cy="74" r="2.4" />
    <circle cx="55" cy="74" r="2.4" />
  </g>
);

const Cana: G = ({ c }) => (
  <g fill="none" stroke={c} strokeLinecap="round">
    {[34, 50, 66].map((x, i) => (
      <g key={x} transform={`translate(${x} 0) rotate(${(i - 1) * 6} 0 90)`}>
        <path d="M0 90 V20" strokeWidth={9} />
        {[34, 52, 70].map((y) => (
          <path key={y} d={`M-6 ${y + i * 3} h12`} strokeWidth={3} stroke="#fff" opacity={0.0} />
        ))}
      </g>
    ))}
    <path d="M50 30 q16 -14 30 -12 q-12 10 -30 12z M34 36 q-16 -10 -26 -6 q12 8 26 6z" fill={c} strokeWidth={2} stroke={c} />
  </g>
);
const CanaNos: G = ({ c }) => (
  <g stroke={c} strokeWidth={3}>
    {[34, 50, 66].map((x, i) =>
      [40, 58, 76].map((y) => <path key={`${x}${y}`} d={`M${x - 5 + (i - 1) * ((90 - y) * 0.1)} ${y} h10`} />),
    )}
  </g>
);

const Navio: G = ({ c }) => (
  <g fill={c}>
    <path d="M10 64 h80 l-12 18 h-56z" />
    <rect x="48" y="12" width="4" height="52" />
    <path d="M30 22 q16 -4 18 0 v30 q-10 -4 -22 0 q4 -15 4 -30z" />
    <path d="M56 18 q14 -2 22 4 q-2 14 4 28 q-12 -4 -26 0z" />
    <path d="M52 10 l12 4 l-12 4z" />
  </g>
);

const Tomate: G = ({ c }) => (
  <g fill={c}>
    <path d="M50 30 c26 0 38 14 36 30 c-2 18 -18 28 -36 28 c-18 0 -34 -10 -36 -28 c-2 -16 10 -30 36 -30z" />
  </g>
);
const TomateFolha: G = ({ c }) => (
  <path d="M50 32 l-14 -8 l10 -2 l-6 -10 l10 6 l0 -10 l6 10 l8 -6 l-4 10 l12 0 z" fill={c} />
);

const Batata: G = ({ c }) => (
  <g fill={c}>
    <path d="M22 40 c6 -18 34 -22 48 -14 c16 8 20 28 10 42 c-10 16 -40 18 -54 6 c-10 -8 -8 -22 -4 -34z" />
  </g>
);
const BatataOlhos: G = ({ c }) => (
  <g fill={c}>
    <circle cx="38" cy="42" r="3" />
    <circle cx="60" cy="38" r="2.6" />
    <circle cx="66" cy="60" r="3" />
    <circle cx="42" cy="66" r="2.6" />
  </g>
);

const Chocolate: G = ({ c }) => (
  <g>
    <rect x="24" y="14" width="52" height="72" rx="6" fill={c} />
    <path d="M24 38 h52 M24 62 h52 M50 14 v72" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={4} />
    <path d="M24 60 l14 6 l10 -8 l14 8 l14 -6 v26 h-52z" fill={c} />
  </g>
);

const Virus: G = ({ c }) => (
  <g fill={c} stroke={c}>
    <circle cx="50" cy="50" r="22" />
    {Array.from({ length: 10 }).map((_, i) => {
      const a = (i / 10) * Math.PI * 2;
      const x1 = 50 + Math.cos(a) * 22;
      const y1 = 50 + Math.sin(a) * 22;
      const x2 = 50 + Math.cos(a) * 36;
      const y2 = 50 + Math.sin(a) * 36;
      return (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={5} />
          <circle cx={x2} cy={y2} r={5} />
        </g>
      );
    })}
  </g>
);

const Cavalo: G = ({ c }) => (
  <g fill={c}>
    <path d="M30 88 c-2 -16 2 -28 10 -36 c-6 -2 -14 2 -20 8 c-6 2 -10 -2 -8 -8 c4 -10 18 -22 28 -30 l-2 -10 l8 6 l4 -8 l4 10 c14 6 22 22 22 40 c0 10 -2 20 -4 28z" />
  </g>
);
const CavaloOlho: G = ({ c }) => <circle cx="44" cy="34" r="3.2" fill={c} />;

const Pessoa: G = ({ c }) => (
  <g fill={c}>
    <circle cx="50" cy="30" r="15" />
    <path d="M22 88 c0 -22 12 -34 28 -34 c16 0 28 12 28 34z" />
  </g>
);

const Alerta: G = ({ c }) => (
  <g>
    <path d="M50 14 L88 82 H12 Z" fill={c} strokeLinejoin="round" stroke={c} strokeWidth={8} />
    <rect x="46" y="38" width="8" height="24" rx="3" fill="#E53935" />
    <circle cx="50" cy="71" r="4.5" fill="#E53935" />
  </g>
);

const X: G = ({ c }) => (
  <path d="M26 26 L74 74 M74 26 L26 74" stroke={c} strokeWidth={13} strokeLinecap="round" />
);

const Flor: G = ({ c }) => (
  <g fill={c}>
    {Array.from({ length: 5 }).map((_, i) => (
      <ellipse key={i} cx="50" cy="28" rx="11" ry="16" transform={`rotate(${i * 72} 50 46)`} />
    ))}
    <circle cx="50" cy="46" r="9" fill="#ffffff" opacity={0.5} />
    <path d="M50 58 V92" stroke={c} strokeWidth={5} />
  </g>
);

const Globo: G = ({ c }) => (
  <g fill="none" stroke={c} strokeWidth={6}>
    <circle cx="50" cy="50" r="34" />
    <ellipse cx="50" cy="50" rx="14" ry="34" />
    <path d="M16 50 h68 M22 32 h56 M22 68 h56" strokeWidth={4} />
  </g>
);

const Troca: G = ({ c }) => (
  <g fill="none" stroke={c} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 36 h58 l-12 -12 M76 36 l-12 12" />
    <path d="M82 66 h-58 l12 -12 M24 66 l12 12" />
  </g>
);

const Prato: G = ({ c }) => (
  <g>
    <circle cx="50" cy="52" r="30" fill="none" stroke={c} strokeWidth={6} />
    <circle cx="50" cy="52" r="18" fill={c} opacity={0.25} />
    <path d="M12 22 v22 M8 22 v12 q4 6 8 0 v-12 M12 44 v40" stroke={c} strokeWidth={4} strokeLinecap="round" fill="none" />
    <path d="M88 22 q-8 10 0 26 v36" stroke={c} strokeWidth={5} strokeLinecap="round" fill="none" />
  </g>
);

const Interrogacao: G = ({ c }) => (
  <g>
    <path d="M34 36 q0 -18 16 -18 q16 0 16 16 q0 10 -10 16 q-6 4 -6 12 v4" fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" />
    <circle cx="50" cy="80" r="6" fill={c} />
  </g>
);

const Relogio: G = ({ c }) => (
  <g fill="none" stroke={c} strokeWidth={7} strokeLinecap="round">
    <circle cx="50" cy="50" r="32" />
    <path d="M50 30 V50 L64 60" />
  </g>
);


const Chuveiro: G = ({ c }) => (
  <g fill={c}>
    <rect x="44" y="6" width="12" height="22" rx="3" />
    <path d="M22 30 h56 l-6 22 h-44z" />
    {[30, 42, 54, 66].map((x) => (
      <rect key={x} x={x - 2} y="60" width="4" height="9" rx="2" />
    ))}
    {[34, 50, 64].map((x) => (
      <rect key={`b${x}`} x={x - 2} y="76" width="4" height="9" rx="2" />
    ))}
  </g>
);
const Gota: G = ({ c }) => <path d="M50 10 C66 34 78 48 78 64 a28 28 0 0 1 -56 0 C22 48 34 34 50 10z" fill={c} />;
const Raio: G = ({ c }) => <path d="M58 6 L22 56 h24 l-8 38 l40 -54 h-26z" fill={c} />;
const Terra: G = ({ c }) => (
  <g stroke={c} strokeWidth={8} strokeLinecap="round">
    <path d="M50 8 V46" />
    <path d="M18 48 H82 M30 64 H70 M42 80 H58" />
  </g>
);
const Disjuntor: G = ({ c }) => (
  <g>
    <rect x="22" y="8" width="56" height="84" rx="8" fill={c} />
    <rect x="38" y="22" width="24" height="36" rx="5" fill="#ffffff" opacity={0.9} />
    <rect x="41" y="25" width="18" height="16" rx="3" fill={c} />
    <text x="50" y="80" textAnchor="middle" fontSize="16" fontWeight="800" fill="#ffffff" fontFamily="sans-serif">DR</text>
  </g>
);
const Registro: G = ({ c }) => (
  <g fill={c}>
    <rect x="8" y="66" width="84" height="16" rx="6" />
    <rect x="42" y="40" width="16" height="30" rx="4" />
    <rect x="20" y="26" width="60" height="14" rx="7" />
    <circle cx="50" cy="33" r="11" />
  </g>
);
const Ferramenta: G = ({ c }) => (
  <g fill={c}>
    <path d="M70 10 a18 18 0 0 0 -22 24 L12 70 a8 8 0 0 0 0 12 l6 6 a8 8 0 0 0 12 0 L66 52 a18 18 0 0 0 24 -22 l-12 12 l-12 -4 l-4 -12z" />
  </g>
);
const Som: G = ({ c }) => (
  <g fill={c} stroke={c} strokeLinecap="round">
    <path d="M14 38 h16 l22 -18 v60 l-22 -18 h-16z" />
    <path d="M62 36 q8 14 0 28 M72 26 q16 24 0 48" fill="none" strokeWidth={7} />
  </g>
);
const Onibus: G = ({ c }) => (
  <g fill={c}>
    <rect x="12" y="16" width="76" height="58" rx="10" />
    <rect x="20" y="24" width="60" height="22" rx="3" fill="#ffffff" opacity={0.85} />
    <circle cx="30" cy="80" r="9" />
    <circle cx="70" cy="80" r="9" />
  </g>
);
const Vento: G = ({ c }) => (
  <g fill="none" stroke={c} strokeWidth={8} strokeLinecap="round">
    <path d="M10 36 h52 a12 12 0 1 0 -12 -12" />
    <path d="M10 56 h70 a12 12 0 1 1 -12 12" />
    <path d="M10 76 h34" />
  </g>
);
const Furacao: G = ({ c }) => (
  <g fill="none" stroke={c} strokeWidth={7} strokeLinecap="round">
    <path d="M50 50 m-6 0 a6 6 0 1 1 12 0 a14 14 0 0 1 -26 4 a24 24 0 0 1 44 -14 a34 34 0 0 1 -50 34" />
    <path d="M50 50 m6 0 a14 14 0 0 1 26 -4" />
  </g>
);
const Onda: G = ({ c }) => (
  <g fill="none" stroke={c} strokeWidth={8} strokeLinecap="round">
    <path d="M8 40 q10 -12 21 0 t21 0 t21 0 t21 0" />
    <path d="M8 62 q10 -12 21 0 t21 0 t21 0 t21 0" />
  </g>
);
const Sol: G = ({ c }) => (
  <g fill={c} stroke={c} strokeWidth={6} strokeLinecap="round">
    <circle cx="50" cy="50" r="18" />
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return <line key={i} x1={50 + Math.cos(a) * 28} y1={50 + Math.sin(a) * 28} x2={50 + Math.cos(a) * 40} y2={50 + Math.sin(a) * 40} />;
    })}
  </g>
);
const Lua: G = ({ c }) => <path d="M62 12 a38 38 0 1 0 26 52 a30 30 0 1 1 -26 -52z" fill={c} />;
const Seta: G = ({ c }) => <path d="M14 50 h60 M54 28 l22 22 l-22 22" stroke={c} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
const Polos: G = ({ c }) => (
  <g>
    <circle cx="50" cy="50" r="38" fill="none" stroke={c} strokeWidth={6} />
    <path d="M18 30 a38 38 0 0 1 64 0z" fill={c} />
    <path d="M18 70 a38 38 0 0 0 64 0z" fill={c} />
  </g>
);

export const glifos: Record<string, G[]> = {
  chuveiro: [Chuveiro],
  gota: [Gota],
  raio: [Raio],
  terra: [Terra],
  disjuntor: [Disjuntor],
  registro: [Registro],
  ferramenta: [Ferramenta],
  som: [Som],
  onibus: [Onibus],
  vento: [Vento],
  furacao: [Furacao],
  onda: [Onda],
  sol: [Sol],
  lua: [Lua],
  seta: [Seta],
  polos: [Polos],
  cafe: [Cafe],
  boi: [Boi, BoiDetalhe],
  cana: [Cana, CanaNos],
  navio: [Navio],
  tomate: [Tomate, TomateFolha],
  batata: [Batata, BatataOlhos],
  chocolate: [Chocolate],
  virus: [Virus],
  cavalo: [Cavalo, CavaloOlho],
  pessoa: [Pessoa],
  alerta: [Alerta],
  x: [X],
  flor: [Flor],
  globo: [Globo],
  troca: [Troca],
  prato: [Prato],
  interrogacao: [Interrogacao],
  relogio: [Relogio],
};

/** Cores reais das coisas que existem (camada principal, detalhe). Símbolos abstratos não entram aqui. */
export const coresNaturais: Record<string, [string, string]> = {
  cafe: ["#6F4A2F", "#6F4A2F"],
  boi: ["#7A4B2A", "#2B1A10"],
  cana: ["#7DAA3C", "#4E7424"],
  tomate: ["#D8432C", "#4E8A2E"],
  batata: ["#C79A5B", "#7E5A2C"],
  chocolate: ["#5A3520", "#5A3520"],
  cavalo: ["#8A5A32", "#24160C"],
  flor: ["#E58AA6", "#F4C542"],
};

/** Desenha um glifo; camadas de detalhe usam a cor de contraste (ou a cor real, se `natural`). */
export const Glifo: React.FC<{ nome: string; cor: string; contraste: string; tamanho: number; natural?: boolean }> = ({
  nome,
  cor,
  contraste,
  tamanho,
  natural,
}) => {
  const camadas = glifos[nome];
  if (!camadas) throw new Error(`Glifo inexistente: ${nome}`);
  const real = natural ? coresNaturais[nome] : undefined;
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 100 100">
      {camadas.map((C, i) => (
        <C key={i} c={real ? real[i === 0 ? 0 : 1] : i === 0 ? cor : contraste} />
      ))}
    </svg>
  );
};
