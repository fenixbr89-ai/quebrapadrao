import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import type { VideoProps } from "./tipos";
import { calcularCenas, estimarTiming, FPS } from "./timing";
import { Fundo } from "./componentes/Fundo";
import { Legenda } from "./componentes/Legenda";
import { Visual } from "./cenas/Visual";
import { FotosIcones } from "./componentes/Icone3D";
import { Camera, FiltrosMovimento, TRANSICAO, transicaoDe } from "./componentes/Camera";
import type { Visual as V } from "./tipos";
import "./componentes/fonte";

/** Ícone da cena usado no primeiro plano desfocado (a cada 3 cenas). */
const MEIO = TRANSICAO / 2;

const iconeDaCena = (v: V): string | undefined =>
  v.tipo === "icone" ? v.nome : v.tipo === "icones" ? v.itens[0]?.nome : v.tipo === "navio" ? v.carga?.[0] : v.tipo === "foto" ? v.satelites?.[0] : v.tipo === "troca" ? v.vai[0] : undefined;

export const calcularMetadata: CalculateMetadataFunction<VideoProps> = ({ props }) => {
  const timing = props.timing ?? estimarTiming(props.roteiro);
  const cenas = calcularCenas(props.roteiro, timing, FPS);
  const ult = cenas[cenas.length - 1];
  return { durationInFrames: ult.inicioFrame + ult.duracaoFrames, props: { ...props, timing } };
};

export const Video: React.FC<VideoProps> = ({ roteiro, timing, audio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = timing ?? estimarTiming(roteiro);
  const cenas = calcularCenas(roteiro, t, fps);
  const tempo = frame / fps;
  return (
    <FotosIcones.Provider value={Object.fromEntries(Object.entries(roteiro.fotosIcones ?? {}).map(([k, v]) => [k, `${roteiro.slug}/${v}`]))}>
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Fundo />
      <FiltrosMovimento />
      {roteiro.cenas.map((c, i) => {
        const ultima = i === roteiro.cenas.length - 1;
        const fixa = c.visual.tipo === "final" || c.visual.tipo === "balao";
        return (
          // a transição fica centrada na troca de frase: começa MEIO antes, termina MEIO depois
          <Sequence
            key={c.id}
            from={cenas[i].inicioFrame - (i > 0 ? MEIO : 0)}
            durationInFrames={cenas[i].duracaoFrames + (i > 0 ? MEIO : 0) + (ultima ? 0 : MEIO)}
            name={c.id}
          >
            <Camera
              indice={i}
              duracao={cenas[i].duracaoFrames + (i > 0 ? MEIO : 0) - MEIO}
              entrada={i > 0 ? transicaoDe(i - 1) : null}
              saida={ultima ? null : transicaoDe(i)}
              primeiroPlano={i % 3 === 1 && !fixa ? iconeDaCena(c.visual) : undefined}
              suave={fixa}
            >
              <Visual v={c.visual} slug={roteiro.slug} roteiro={roteiro} />
            </Camera>
          </Sequence>
        );
      })}
      {roteiro.cenas.map((c, i) => (
        <Sequence key={`leg-${c.id}`} from={cenas[i].inicioFrame} durationInFrames={cenas[i].duracaoFrames} name={`legenda ${c.id}`}>
          <Legenda
            palavras={t.palavras.slice(cenas[i].palavraInicio, cenas[i].palavraFim)}
            destaques={c.destaques ?? []}
            tempo={tempo}
          />
        </Sequence>
      ))}
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
    </FotosIcones.Provider>
  );
};
