import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTE } from "./fonte";
import { Glifo } from "./Glifos";

export const Balao: React.FC<{ pergunta: string; y: number }> = ({ pergunta, y }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 14 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 120,
        top: y,
        transform: `translateY(${(1 - s) * 40}px) scale(${0.9 + s * 0.1})`,
        opacity: s,
        background: "rgba(40,40,40,0.75)",
        border: "2px solid rgba(255,255,255,0.12)",
        borderRadius: 34,
        padding: "28px 34px",
        display: "flex",
        alignItems: "center",
        gap: 26,
        fontFamily: FONTE,
        boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ width: 84, height: 84, borderRadius: 42, background: "linear-gradient(180deg,#d9d9d9,#8f8f8f)", flexShrink: 0 }} />
      <div>
        <div style={{ color: "#9a9a9a", fontSize: 26, fontWeight: 500 }}>você</div>
        <div style={{ color: "#fff", fontSize: 38, fontWeight: 700, lineHeight: 1.2 }}>{pergunta}</div>
      </div>
    </div>
  );
};

export const CardSeguir: React.FC<{ y: number }> = ({ y }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 15 } });
  const clique = Math.min(durationInFrames - 10, 40);
  const seguindo = f >= clique;
  const aperto = interpolate(f, [clique - 4, clique, clique + 5], [1, 0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 150,
        right: 150,
        top: y,
        opacity: s,
        transform: `translateY(${(1 - s) * 60}px)`,
        background: "linear-gradient(180deg, #262626, #141414)",
        borderRadius: 44,
        border: "2px solid rgba(255,255,255,0.08)",
        padding: "70px 50px 54px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: FONTE,
        boxShadow: "0 50px 100px rgba(0,0,0,0.8)",
      }}
    >
      <div
        style={{
          width: 210,
          height: 210,
          borderRadius: 105,
          background: "#0c0c0c",
          border: "6px solid #e9e9e9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Glifo nome="interrogacao" cor="#e9e9e9" contraste="#e9e9e9" tamanho={150} />
      </div>
      <div style={{ color: "#fff", fontSize: 56, fontWeight: 800, marginTop: 34 }}>@quebra.padrao</div>
      <div style={{ color: "#a0a0a0", fontSize: 30, fontWeight: 500, marginTop: 10 }}>Te explicando coisas em 1 minuto</div>
      <div
        style={{
          marginTop: 44,
          width: "100%",
          padding: "26px 0",
          borderRadius: 20,
          textAlign: "center",
          fontSize: 38,
          fontWeight: 700,
          transform: `scale(${aperto})`,
          background: seguindo ? "#2f2f2f" : "#f2f2f2",
          color: seguindo ? "#fff" : "#111",
        }}
      >
        {seguindo ? "Seguindo" : "Seguir"}
      </div>
    </div>
  );
};
