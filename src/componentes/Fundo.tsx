import React from "react";
import { AbsoluteFill } from "remotion";

export const Fundo: React.FC<{ claro?: boolean }> = ({ claro }) => (
  <AbsoluteFill
    style={{
      background: claro
        ? "radial-gradient(ellipse at 50% 40%, #bdbdbd 0%, #8a8a8a 70%, #6e6e6e 100%)"
        : "radial-gradient(ellipse at 50% 42%, #1c1c1c 0%, #0b0b0b 55%, #000 100%)",
    }}
  />
);
