import { continueRender, delayRender, staticFile } from "remotion";
import f400 from "@fontsource/inter/files/inter-latin-400-normal.woff2";
import f500 from "@fontsource/inter/files/inter-latin-500-normal.woff2";
import f700 from "@fontsource/inter/files/inter-latin-700-normal.woff2";
import f800 from "@fontsource/inter/files/inter-latin-800-normal.woff2";

export const FONTE = "QPInter, Inter, sans-serif";
void staticFile;

if (typeof document !== "undefined") {
  const h = delayRender("fonte Inter");
  Promise.all(
    ([[400, f400], [500, f500], [700, f700], [800, f800]] as const).map(([w, url]) => {
      const face = new FontFace("QPInter", `url(${url}) format('woff2')`, { weight: String(w) });
      document.fonts.add(face);
      return face.load();
    }),
  ).then(() => continueRender(h), () => continueRender(h));
}
