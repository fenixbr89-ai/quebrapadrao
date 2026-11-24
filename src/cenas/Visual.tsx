import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import type { Roteiro, Visual as V } from "../tipos";
import { Icone3D } from "../componentes/Icone3D";
import { FotoMoldura } from "../componentes/FotoMoldura";
import { Balao, CardSeguir } from "../componentes/CardFinal";
import { FONTE } from "../componentes/fonte";

const CX = 540;
const CY = 660;
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Elementos com entrada até este quadro aparecem junto com a transição (sem animação própria). */
const ENTRADA_JUNTO_COM_TRANSICAO = 12;

/** Entrada lisa (sem mola: a mola passava do ponto e dava uma "batidinha") com desfoque de movimento. */
const useEntrada = (atraso = 0) => {
  const f = useCurrentFrame();
  // Quem já está na cena desde o início chega só com a transição da câmera.
  // Animar de novo aqui fazia o elemento "entrar duas vezes" (a batidinha).
  if (atraso <= ENTRADA_JUNTO_COM_TRANSICAO) return { s: 1, blur: 0, f };
  const s = interpolate(f, [atraso, atraso + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.22, 1, 0.36, 1) });
  return { s, blur: (1 - s) * 16, f };
};

/** Quadro (relativo à cena) em que cada palavra da legenda é falada. */
export type TempoPalavra = { norm: string; raw: string; frame: number };
export const TemposCena = React.createContext<TempoPalavra[]>([]);
const norm = (p: string) => p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
/** Quando a palavra é falada (um pouco antes, para o elemento já estar entrando); senão, o valor padrão. */
const useQuando = () => {
  const tempos = React.useContext(TemposCena);
  return (palavra: string | undefined, padrao: number) => {
    if (!palavra) return padrao;
    const primeira = palavra.split(/\s+/)[0].toLowerCase();
    const alvo = norm(primeira);
    // 1º tenta a grafia exata com pontuação ("você," ≠ "Você"), depois só as letras
    const t = tempos.find((x) => x.raw === primeira) ?? tempos.find((x) => x.norm === alvo) ?? tempos.find((x) => x.norm.startsWith(alvo));
    return t ? Math.max(0, t.frame - 4) : padrao;
  };
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
  const quando = useQuando();

  let conteudo: React.ReactNode = null;
  switch (v.tipo) {
    case "foto": {
      const tAlerta = quando(v.alertasPalavra, 8);
      conteudo = (
        <>
          {v.satelites ? <Satelites nomes={v.satelites} /> : null}
          <Entra x={CX} y={CY}>
            {v.girar ? (
              <div style={{ width: 600, height: 600, borderRadius: 300, overflow: "hidden", boxShadow: "0 0 80px rgba(120,170,255,0.25), 0 40px 80px rgba(0,0,0,0.7)" }}>
                <Img src={staticFile(`${slug}/${v.imagem}`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `rotate(${f * 1.2}deg) scale(1.08)` }} />
              </div>
            ) : (
              <FotoMoldura src={`${slug}/${v.imagem}`} largura={760} altura={560} legenda={v.legenda} pb={v.pb ?? false} zoom={interpolate(f, [0, d], [1, 1.14])} />
            )}
          </Entra>
          {(v.alertas ?? []).map((n, k) => {
            const pos = [
              [180, 420],
              [900, 470],
              [160, 860],
              [920, 900],
              [540, 330],
            ][k % 5];
            return (
              <Entra key={k} x={pos[0]} y={pos[1] + Math.sin((f + k * 15) / 10) * 8} atraso={tAlerta + k * 4} de={0.3}>
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
          <Entra x={CX} y={CY + Math.sin(f / 14) * 14}>
            <div style={{ transform: `perspective(900px) rotateY(${v.girar ? f * 4 : Math.sin(f / 18) * 14}deg) rotateZ(${Math.sin(f / 23) * 4}deg)` }}>
              <Icone3D nome={v.nome} variante={v.variante} tamanho={300} />
            </div>
          </Entra>
          {v.marca ? (
            <Entra x={CX + 130} y={CY + 120} atraso={quando(v.marcaPalavra, 10)} de={0.2}>
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
      const entradas = v.itens.map((it, k) => quando(it.palavra, k * 7));
      if (v.orbita) {
        // um entra e começa a girar; o próximo entra no mesmo ponto e vai atrás dele, em círculo
        const R = v.centro ? 330 : 280;
        const volta = 75; // quadros por volta
        conteudo = (
          <>
            <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0 }}>
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="#ffffff" strokeOpacity={0.18} strokeWidth={3} strokeDasharray="4 14" />
            </svg>
            {v.centro ? (
              <Entra x={CX} y={CY}>
                <div style={{ transform: `rotate(${f * 0.6}deg)` }}>
                  <Icone3D nome={v.centro} tamanho={260} />
                </div>
              </Entra>
            ) : null}
            {v.itens.map((it, k) => {
              const t0 = entradas[k];
              const ang = -Math.PI / 2 + Math.max(0, f - t0) * ((2 * Math.PI) / volta) - (v.centro ? 0 : 0);
              const x = CX + Math.cos(ang) * R;
              const y = CY + Math.sin(ang) * R;
              const vis = t0 <= ENTRADA_JUNTO_COM_TRANSICAO ? 1 : interpolate(f, [t0, t0 + 10], [0, 1], cl);
              return (
                <div key={k} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${0.4 + 0.6 * vis})`, opacity: vis, filter: vis < 1 ? `blur(${(1 - vis) * 12}px)` : undefined }}>
                  <Icone3D nome={it.nome} variante={it.variante} tamanho={v.centro ? 170 : 200} />
                </div>
              );
            })}
          </>
        );
        break;
      }
      const gap = n > 2 ? 300 : 330;
      conteudo = v.itens.map((it, k) => {
        const x = CX + (k - (n - 1) / 2) * gap;
        const y = CY + Math.sin((f + k * 12) / 12) * 16;
        return (
          <React.Fragment key={k}>
            <Entra x={x} y={y} atraso={entradas[k]}>
              <div style={{ transform: `perspective(900px) rotateY(${Math.sin((f + k * 20) / 16) * 16}deg)` }}>
                <Icone3D nome={it.nome} variante={it.variante} tamanho={n > 2 ? 220 : 240} />
              </div>
            </Entra>
            {it.marca ? (
              <Entra x={x + 95} y={y + 95} atraso={entradas[k] + 10} de={0.2}>
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
      // número grande sem anel (dono não gostou do círculo): ícone acima, número, linha e rótulo
      const t0c = quando(v.palavra, 2);
      const p = interpolate(f, [t0c, t0c + 26], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
      const valor = Math.round(v.de + (v.para - v.de) * p);
      const texto = (v.para >= 10000 || v.sufixo !== undefined ? valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : String(valor)) + (v.sufixo ?? "");
      const linha = interpolate(f, [6, 22], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
      conteudo = (
        <>
          <Entra x={CX} y={CY - 250} atraso={2} de={0.4}>
            <Icone3D nome={v.nome} tamanho={150} />
          </Entra>
          <Rotulo texto={texto} y={CY + 10} tam={texto.length >= 5 ? 190 : 240} cor="#ffffff" />
          <div style={{ position: "absolute", left: CX - 220 * linha, top: CY + 150, width: 440 * linha, height: 4, borderRadius: 2, background: "#5a5a5a" }} />
          {v.rotulo ? <Rotulo texto={v.rotulo} y={CY + 210} tam={36} cor="#9a9a9a" /> : null}
        </>
      );
      break;
    }
    case "rota": {
      const p = interpolate(f, [6, d * 0.8], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
      const a = { x: 330, y: CY - 170 };
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
          <Rotulo texto={v.de} x={Math.max(a.x, 260)} y={a.y - 115} tam={36} />
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
              <Entra key={i} x={CX + Math.cos(a) * r} y={CY + Math.sin(a) * r * 0.95} atraso={quando(it.palavra, 4 + i * 3)} de={0.3}>
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

    case "velocimetro": {
      // velocímetro em linha (igual Titanic): arco cinza, arco ativo branco→vermelho, ponteiro subindo
      const t0v = quando(v.palavra, 3);
      const p = interpolate(f, [t0v, t0v + 28], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
      const valor = Math.round(v.valor * p);
      const R = 270;
      const cy = CY + 60;
      const ang = (t: number) => Math.PI + t * Math.PI; // 180° → 360°
      const pt = (t: number, r: number) => [CX + Math.cos(ang(t)) * r, cy + Math.sin(ang(t)) * r];
      const arco = (t0: number, t1: number, r: number) => {
        const [x0, y0] = pt(t0, r);
        const [x1, y1] = pt(t1, r);
        return `M${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
      };
      const frac = Math.min(1, (v.valor / v.max) * p);
      const [nx, ny] = pt(frac, R - 40);
      const cor = v.vermelho && p > 0.6 ? "#E53935" : "#ffffff";
      const fmt = valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      conteudo = (
        <>
          {v.imagem ? (
            <div style={{ position: "absolute", left: CX, top: cy - R - 150, transform: "translate(-50%,-50%)", opacity: 0.9 }}>
              <FotoMoldura src={`${slug}/${v.imagem}`} largura={300} altura={200} />
            </div>
          ) : null}
          <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0 }}>
            <circle cx={CX} cy={cy} r={R + 40} fill="#141414" stroke="#262626" strokeWidth={3} />
            <path d={arco(0, 1, R)} stroke="#3a3a3a" strokeWidth={26} fill="none" strokeLinecap="round" />
            {frac > 0.001 ? <path d={arco(0, frac, R)} stroke={cor} strokeWidth={26} fill="none" strokeLinecap="round" /> : null}
            {Array.from({ length: 11 }).map((_, k) => {
              const [x0, y0] = pt(k / 10, R - 34);
              const [x1, y1] = pt(k / 10, R - (k % 5 === 0 ? 70 : 54));
              return <line key={k} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#6a6a6a" strokeWidth={4} strokeLinecap="round" />;
            })}
            <line x1={CX} y1={cy} x2={nx} y2={ny} stroke="#ffffff" strokeWidth={12} strokeLinecap="round" />
            <circle cx={CX} cy={cy} r={22} fill="#ffffff" />
          </svg>
          <Rotulo texto={fmt} y={cy + 120} tam={110} cor={cor} />
          <Rotulo texto={v.unidade ?? "KM/H"} y={cy + 200} tam={34} cor="#8a8a8a" />
        </>
      );
      break;
    }
    case "jato": {
      // chuveiro no alto; abaixo o jato: contínuo ou quebrado em gotas (com ar entre elas)
      const topo = 360;
      const base = 1150;
      conteudo = (
        <>
          <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0 }}>
            {v.gotas
              ? Array.from({ length: 5 }).map((_, col) =>
                  Array.from({ length: 9 }).map((__, k) => {
                    const fase = ((f * 9 + k * 95 + col * 37) % 860) / 860;
                    const y = topo + 150 + fase * (base - topo - 150);
                    const x = CX - 120 + col * 60 + Math.sin(k + col) * 6;
                    const r = 7 + (fase > 0.2 ? 6 : fase * 30);
                    return <ellipse key={`${col}-${k}`} cx={x} cy={y} rx={r * 0.8} ry={r} fill="#e8e8e8" opacity={0.9} />;
                  }),
                )
              : [0, 1, 2, 3, 4].map((col) => (
                  <rect key={col} x={CX - 126 + col * 60} y={topo + 150} width={12} height={base - topo - 150} rx={6} fill="#e8e8e8" opacity={0.85} />
                ))}
          </svg>
          <Entra x={CX} y={topo}>
            <Icone3D nome="chuveiro" tamanho={260} />
          </Entra>
          {v.raio ? (
            <Entra x={CX + 220} y={topo + 120} atraso={6} de={0.3}>
              <Icone3D nome="raio" tamanho={120} />
            </Entra>
          ) : null}
        </>
      );
      break;
    }
    case "vento": {
      conteudo = (
        <>
          <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0 }}>
            {Array.from({ length: 22 }).map((_, k) => {
              const y = 260 + ((k * 137) % 860);
              const comp = 160 + ((k * 53) % 240);
              const x = ((k * 211 + f * 55) % 1600) - 300;
              return <line key={k} x1={x} y1={y} x2={x + comp} y2={y} stroke="#ffffff" strokeOpacity={0.12 + ((k * 7) % 5) * 0.07} strokeWidth={4} strokeLinecap="round" />;
            })}
          </svg>
          {v.itens.map((n, i) => {
            const x = ((i * 380 + f * 38) % 1500) - 200;
            const y = 420 + i * 230 + Math.sin((f + i * 20) / 6) * 18;
            return (
              <div key={i} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${f * (6 + i * 3)}deg)`, filter: "url(#mbx2)" }}>
                <Icone3D nome={n} tamanho={150} />
              </div>
            );
          })}
        </>
      );
      break;
    }
    case "planeta": {
      const R = 300;
      const gira = v.modo === "girando" ? f * 2.2 : 0;
      conteudo = (
        <>
          <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0 }}>
            <defs>
              <clipPath id="disco">
                <circle cx={CX} cy={CY} r={R} />
              </clipPath>
              <pattern id="hach" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="18" stroke="#9a9a9a" strokeWidth="5" />
              </pattern>
            </defs>
            <circle cx={CX} cy={CY} r={R + 70} fill="none" stroke="#1f1f1f" strokeWidth={2} />
            <circle cx={CX} cy={CY} r={R} fill="#111" stroke="#e6e6e6" strokeWidth={6} />
            <g clipPath="url(#disco)">
              {v.modo === "polos" ? (
                <>
                  <rect x={CX - R} y={CY - R} width={2 * R} height={R * 0.75} fill="#e6e6e6" />
                  <rect x={CX - R} y={CY + R * 0.25} width={2 * R} height={R * 0.75} fill="#e6e6e6" />
                  <rect x={CX - R} y={CY - R * 0.25} width={2 * R} height={R * 0.5} fill="url(#hach)" />
                </>
              ) : (
                Array.from({ length: 7 }).map((_, k) => {
                  const fase = (((k / 7) * 360 + gira) % 360) * (Math.PI / 180);
                  const rx = Math.abs(Math.cos(fase)) * R;
                  const lado = Math.sin(fase) > 0 ? 1 : 0.35;
                  return <ellipse key={k} cx={CX} cy={CY} rx={rx} ry={R} fill="none" stroke="#e6e6e6" strokeOpacity={lado} strokeWidth={3} />;
                })
              )}
              {[-0.5, 0, 0.5].map((t) => (
                <ellipse key={t} cx={CX} cy={CY + t * R} rx={R * Math.sqrt(1 - t * t)} ry={14} fill="none" stroke="#e6e6e6" strokeOpacity={0.5} strokeWidth={3} />
              ))}
            </g>
            {v.modo === "girando" ? (
              <path d={`M${CX - R - 40} ${CY - 60} a ${R + 40} ${R + 40} 0 0 1 ${2 * R + 80} 0`} fill="none" stroke="#ffffff" strokeWidth={5} strokeDasharray="2 16" strokeLinecap="round" />
            ) : null}
          </svg>
          {v.modo === "polos" ? (
            <>
              <Rotulo texto="OCEANO" x={CX} y={CY - R * 0.62} tam={34} cor="#111" />
              <Rotulo texto="TERRA" x={CX} y={CY} tam={38} cor="#ffffff" />
              <Rotulo texto="OCEANO" x={CX} y={CY + R * 0.62} tam={34} cor="#111" />
            </>
          ) : null}
          {v.rotulo ? <Rotulo texto={v.rotulo} y={CY + R + 110} tam={38} /> : null}
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
