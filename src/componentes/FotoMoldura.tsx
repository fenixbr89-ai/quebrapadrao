import React from "react";
import { Img, staticFile } from "remotion";

export const FotoMoldura: React.FC<{ src: string; largura: number; altura: number; pb?: boolean; legenda?: string }> = ({
  src,
  largura,
  altura,
  pb = true,
  legenda,
}) => (
  <div
    style={{
      width: largura,
      height: altura,
      borderRadius: 26,
      border: "10px solid #1d1d1d",
      boxShadow: "0 40px 80px rgba(0,0,0,0.75), 0 0 0 2px #2c2c2c",
      overflow: "hidden",
      position: "relative",
      background: "#111",
    }}
  >
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: pb ? "grayscale(1) contrast(1.08)" : undefined }} />
    {legenda ? (
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "40px 24px 18px",
          background: "linear-gradient(0deg, rgba(0,0,0,0.85), rgba(0,0,0,0))",
          color: "#fff",
          fontSize: 30,
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        {legenda}
      </div>
    ) : null}
  </div>
);
