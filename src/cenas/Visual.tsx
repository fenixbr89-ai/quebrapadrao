import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import type { Roteiro, Visual as V } from "../tipos";
import { Icone3D } from "../componentes/Icone3D";
import { FotoMoldura } from "../componentes/FotoMoldura";
import { Balao, CardSeguir } from "../componentes/CardFinal";
import { FONTE } from "../componentes/fonte";

const CX = 540;
const CY = 660;
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Entrada com mola + desfoque (simula motion blur) e leve deriva de câmera durante toda a cena. */
const useEntrada = (atraso = 0) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - atraso, fps, config: { damping: 16, mass: 0.8 } });
  return { s, blur: (1 - s) * 18, f };
};

const Entra: React.FC<{ x: number; y: number; atraso?: number; children: React.ReactNode; de?: number; rot?: number }> = ({
  x,
  y,
  atraso = 0,
  children,
  de = 0.7,
  rot = 0,
}) => {
  const { s, blur } = useEntrada(atraso);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) perspective(1600px) rotateY(${(1 - s) * 18 + rot}deg) scale(${de + (1 - de) * s})`,
        opacity: Math.min(1, s * 1.4),
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

/** Ícones-satélite desfocados flutuando nos cantos (profundidade). */
const Satelites: React.FC<{ nomes: string[] }> = ({ nomes }) => {
  const f = useCurrentFrame();
  const pos = [
    [150, 260, 110, 7],
    [930, 1090, 90, 5],
    [900, 300, 70, 9],
    [170, 1080, 80, 6],
  ];
  return (
    <>
      {nomes.slice(0, 4).map((n, i) => {
        const [x, y, t, b] = pos[i];
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y + Math.sin((f + i * 20) / 25) * 12, transform: "translate(-50%,-50%) rotate(-8deg)", opacity: 0.75 }}>
            <Icone3D nome={n} tamanho={t} desfoque={b} />
          </div>
        );
      })}
    </>
  );
};

const Rotulo: React.FC<{ texto: string; y: number; x?: number; tam?: number; cor?: string }> = ({ texto, y, x = CX, tam = 40, cor = "#d8d8d8" }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", fontFamily: FONTE, fontWeight: 800, fontSize: tam, color: cor, letterSpacing: 4, whiteSpace: "nowrap" }}>
    {texto}
  </div>
);

const MarcaX: React.FC<{ tamanho: number }> = ({ tamanho }) => <Icone3D nome="x" tamanho={tamanho} />;

export const Visual: React.FC<{ v: V; slug: string; roteiro: Roteiro }> = ({ v, slug, roteiro }) => {
  const f = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();

  let conteudo: React.ReactNode = null;
  switch (v.tipo) {
    case "foto": {
      conteudo = (
        <>
          {v.satelites ? <Satelites nomes={v.satelites} /> : null}
          <Entra x={CX} y={CY}>
            <FotoMoldura src={`${slug}/${v.imagem}`} largura={760} altura={560} legenda={v.legenda} pb={v.pb ?? true} />
          </Entra>
          {(v.alertas ?? []).map((n, i) => {
            const pos = [
              [180, 420],
              [900, 470],
              [160, 860],
              [920, 900],
              [540, 330],
            ][i % 5];
            return (
              <Entra key={i} x={pos[0]} y={pos[1]} atraso={8 + i * 5} de={0.3}>
                <Icone3D nome={n} variante="vermelho" tamanho={120} />
              </Entra>
            );
          })}
        </>
      );
      break;
    }
    case "icone": {
      conteudo = (
        <>
          {v.satelites ? <Satelites nomes={v.satelites} /> : null}
          <Entra x={CX} y={CY}>
            <Icone3D nome={v.nome} variante={v.variante} tamanho={300} />
          </Entra>
          {v.marca ? (
            <Entra x={CX + 130} y={CY + 120} atraso={10} de={0.2}>
              <MarcaX tamanho={120} />
            </Entra>
          ) : null}
          {v.rotulo ? (
            <Entra x={CX} y={CY + 260} atraso={4}>
              <Rotulo texto={v.rotulo} y={0} x={0} />
            </Entra>
          ) : null}
        </>
      );
      break;
    }
    case "icones": {
      const n = v.itens.length;
      const gap = 330;
      conteudo = v.itens.map((it, i) => {
        const x = CX + (i - (n - 1) / 2) * gap;
        return (
          <React.Fragment key={i}>
            <Entra x={x} y={CY} atraso={i * 7}>
              <Icone3D nome={it.nome} variante={it.variante} tamanho={240} />
            </Entra>
            {it.marca ? (
              <Entra x={x + 95} y={CY + 95} atraso={i * 7 + 10} de={0.2}>
                <MarcaX tamanho={100} />
              </Entra>
            ) : null}
          </React.Fragment>
        );
      });
      break;
    }
    case "navio": {
      const x = interpolate(f, [0, d], [300, 700], cl);
      conteudo = (
        <>
          <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0 }}>
            <line x1={0} y1={CY + 120} x2={1080} y2={CY + 120} stroke="#cfcfcf" strokeWidth={3} />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <path key={i} d={`M${((i * 170 + f * 2) % 1240) - 80} ${CY + 150} q20 -10 40 0`} stroke="#5a5a5a" strokeWidth={3} fill="none" />
            ))}
          </svg>
          <div style={{ position: "absolute", left: x, top: CY - 40, transform: `translate(-50%,-50%) rotate(${Math.sin(f / 8) * 2}deg)` }}>
            <Icone3D nome="navio" variante={v.variante} tamanho={260} />
          </div>
          {(v.carga ?? []).map((n, i) => (
            <Entra key={i} x={x - 160 + i * 160} y={CY - 290} atraso={10 + i * 6} de={0.3}>
              <Icone3D nome={n} tamanho={110} variante="branco" />
            </Entra>
          ))}
        </>
      );
      break;
    }
    case "contador": {
      const p = interpolate(f, [2, Math.min(28, d * 0.6)], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
      const valor = Math.round(v.de + (v.para - v.de) * p);
      const r = 260;
      const circ = 2 * Math.PI * r;
      conteudo = (
        <>
          <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0 }}>
            <circle cx={CX} cy={CY} r={r} stroke="#262626" strokeWidth={22} fill="none" />
            <circle
              cx={CX}
              cy={CY}
              r={r}
              stroke="#ffffff"
              strokeWidth={22}
              fill="none"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - p)}
              strokeLinecap="round"
              transform={`rotate(-90 ${CX} ${CY})`}
            />
            <circle cx={CX} cy={CY} r={r + 60} stroke="#1a1a1a" strokeWidth={2} fill="none" />
          </svg>
          <Rotulo texto={String(valor)} y={CY + 10} tam={190} cor="#ffffff" />
          {v.rotulo ? <Rotulo texto={v.rotulo} y={CY + 130} tam={34} cor="#8a8a8a" /> : null}
          <Entra x={CX} y={CY - 190} atraso={2} de={0.4}>
            <Icone3D nome={v.nome} tamanho={130} />
          </Entra>
        </>
      );
      break;
    }
    case "rota": {
      const p = interpolate(f, [6, d * 0.8], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
      const a = { x: 250, y: CY - 170 };
      const b = { x: 780, y: CY + 230 };
      const c = { x: 860, y: CY - 220 };
      const pt = (t: number) => ({
        x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t ** 2 * b.x,
        y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t ** 2 * b.y,
      });
      const atual = pt(p);
      const caminho = `M${a.x} ${a.y} Q${c.x} ${c.y} ${b.x} ${b.y}`;
      conteudo = (
        <>
          <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0 }}>
            <path d={caminho} stroke="#3a3a3a" strokeWidth={5} strokeDasharray="4 18" strokeLinecap="round" fill="none" />
            <path d={caminho} stroke="#ffffff" strokeWidth={6} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
            <circle cx={a.x} cy={a.y} r={16} fill="#ffffff" />
            <circle cx={b.x} cy={b.y} r={16} fill="#ffffff" />
            <circle cx={b.x} cy={b.y} r={34 + Math.sin(f / 5) * 6} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.5} />
          </svg>
          <Rotulo texto={v.de} x={a.x} y={a.y + 60} tam={36} />
          <Rotulo texto={v.para} x={b.x} y={b.y + 125} tam={40} cor="#ffffff" />
          <div style={{ position: "absolute", left: atual.x, top: atual.y, transform: "translate(-50%,-50%)" }}>
            <Icone3D nome={v.nome} tamanho={150} />
          </div>
        </>
      );
      break;
    }
    case "troca": {
      const L = 200;
      const R = 880;
      const ciclo = 75;
      const viajante = (nomes: string[], de: number, para: number, y: number, off: number) =>
        nomes.map((n, i) => {
          const t = ((f + off + i * (ciclo / nomes.length)) % ciclo) / ciclo;
          const x = de + (para - de) * t;
          const op = interpolate(t, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
          return (
            <div key={`${n}${i}`} style={{ position: "absolute", left: x, top: y + Math.sin(t * Math.PI) * -40, transform: "translate(-50%,-50%)", opacity: op }}>
              <Icone3D nome={n} tamanho={100} />
            </div>
          );
        });
      const { s } = useEntradaFixa(f);
      conteudo = (
        <>
          <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0, opacity: s }}>
            {[L, R].map((x) => (
              <g key={x}>
                <circle cx={x} cy={CY} r={125} fill="#141414" stroke="#d0d0d0" strokeWidth={4} />
                <circle cx={x} cy={CY} r={158} fill="none" stroke="#262626" strokeWidth={2} />
              </g>
            ))}
            <path d={`M${L + 140} ${CY - 150} H${R - 140}`} stroke="#3a3a3a" strokeWidth={4} strokeDasharray="6 14" />
            <path d={`M${R - 140} ${CY + 150} H${L + 140}`} stroke="#3a3a3a" strokeWidth={4} strokeDasharray="6 14" />
          </svg>
          <Rotulo texto={v.esquerda} x={L} y={CY} tam={38} cor="#ffffff" />
          <Rotulo texto={v.direita} x={R} y={CY} tam={38} cor="#ffffff" />
          {viajante(v.vai, L + 150, R - 150, CY - 150, 0)}
          {viajante(v.volta, R - 150, L + 150, CY + 150, 37)}
        </>
      );
      break;
    }
    case "grade": {
      const cols = 5;
      const tam = 150;
      const gap = 30;
      const w = cols * tam + (cols - 1) * gap;
      const rows = Math.ceil(v.total / cols);
      const h = rows * tam + (rows - 1) * gap;
      conteudo = Array.from({ length: v.total }).map((_, i) => {
        const x = CX - w / 2 + (i % cols) * (tam + gap) + tam / 2;
        const y = CY - h / 2 + Math.floor(i / cols) * (tam + gap) + tam / 2;
        const vira = 14 + i * 3;
        const vermelho = i < v.vermelhos && f >= vira;
        return (
          <Entra key={i} x={x} y={y} atraso={i * 1.5} de={0.5}>
            <Icone3D nome={v.nome} variante={vermelho ? "vermelho" : "branco"} tamanho={tam} />
          </Entra>
        );
      });
      break;
    }
    case "recap": {
      const n = v.itens.length;
      conteudo = (
        <>
          {v.itens.map((it, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2 + f / 200;
            const r = 360;
            return (
              <Entra key={i} x={CX + Math.cos(a) * r} y={CY + Math.sin(a) * r * 0.95} atraso={4 + i * 3} de={0.3}>
                <Icone3D nome={it.nome} variante={it.variante} tamanho={130} />
              </Entra>
            );
          })}
          <Entra x={CX} y={CY}>
            <Icone3D nome={v.centro} tamanho={260} />
          </Entra>
        </>
      );
      break;
    }
    case "balao":
      conteudo = <Balao pergunta={roteiro.pergunta} y={CY - 90} />;
      break;
    case "final":
      conteudo = (
        <>
          <div style={{ opacity: 0.9 }}>
            <Balao pergunta={roteiro.pergunta} y={250} />
          </div>
          <CardSeguir y={520} />
        </>
      );
      break;
  }

  return (
    <AbsoluteFill>
      {conteudo}
    </AbsoluteFill>
  );
};

function useEntradaFixa(f: number) {
  return { s: interpolate(f, [0, 10], [0, 1], cl) };
}
