import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import type { VideoProps } from "./tipos";
import { calcularCenas, estimarTiming, FPS } from "./timing";
import { Fundo } from "./componentes/Fundo";
import { Legenda } from "./componentes/Legenda";
import { Visual } from "./cenas/Visual";
import "./componentes/fonte";

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
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Fundo />
      {roteiro.cenas.map((c, i) => (
        <Sequence key={c.id} from={cenas[i].inicioFrame} durationInFrames={cenas[i].duracaoFrames} name={c.id}>
          <Visual v={c.visual} slug={roteiro.slug} roteiro={roteiro} />
          <Legenda
            palavras={t.palavras.slice(cenas[i].palavraInicio, cenas[i].palavraFim)}
            destaques={c.destaques ?? []}
            tempo={tempo}
          />
        </Sequence>
      ))}
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
