import React from "react";
import { Composition } from "remotion";
import { Video, calcularMetadata } from "./Video";
import type { VideoProps } from "./tipos";
import exemplo from "../videos/2026-11-23-brasil-nao-tinha-cafe/roteiro.json";

export const Root: React.FC = () => (
  <Composition
    id="Video"
    component={Video}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={1800}
    defaultProps={{ roteiro: exemplo, timing: null, audio: null } as VideoProps}
    calculateMetadata={calcularMetadata}
  />
);
