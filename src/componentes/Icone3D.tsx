import React from "react";
import type { Cor } from "../tipos";
import { Glifo } from "./Glifos";

/** Azulejo estilo "app icon" com volume: gradiente, brilho no topo, sombra embaixo. */
export const Icone3D: React.FC<{ nome: string; variante?: Cor; tamanho: number; desfoque?: number; style?: React.CSSProperties }> = ({
  nome,
  variante = "branco",
  tamanho,
  desfoque = 0,
  style,
}) => {
  const vermelho = variante === "vermelho";
  const raio = tamanho * 0.28;
  return (
    <div
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: raio,
        position: "relative",
        background: vermelho
          ? "linear-gradient(180deg, #ff6b62 0%, #E53935 45%, #a51b18 100%)"
          : "linear-gradient(180deg, #ffffff 0%, #ececec 45%, #bdbdbd 100%)",
        boxShadow: vermelho
          ? `0 ${tamanho * 0.12}px ${tamanho * 0.3}px rgba(229,57,53,0.35), 0 ${tamanho * 0.06}px ${tamanho * 0.1}px rgba(0,0,0,0.6), inset 0 -${tamanho * 0.06}px ${tamanho * 0.08}px rgba(0,0,0,0.25), inset 0 ${tamanho * 0.03}px ${tamanho * 0.04}px rgba(255,255,255,0.5)`
          : `0 ${tamanho * 0.12}px ${tamanho * 0.3}px rgba(0,0,0,0.7), inset 0 -${tamanho * 0.07}px ${tamanho * 0.08}px rgba(0,0,0,0.18), inset 0 ${tamanho * 0.03}px ${tamanho * 0.04}px rgba(255,255,255,0.9)`,
        filter: desfoque ? `blur(${desfoque}px)` : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: raio,
          background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 42%)",
        }}
      />
      <div style={{ filter: `drop-shadow(0 ${tamanho * 0.02}px ${tamanho * 0.02}px rgba(0,0,0,0.35))`, display: "flex" }}>
        <Glifo nome={nome} cor={vermelho ? "#ffffff" : "#1b1b1b"} contraste={vermelho ? "#E53935" : "#ececec"} tamanho={tamanho * 0.74} />
      </div>
    </div>
  );
};
