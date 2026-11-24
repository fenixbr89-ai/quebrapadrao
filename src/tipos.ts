export type Cor = "branco" | "vermelho";
export type Destaque = { palavra: string; cor: Cor };

/** Descrição do que aparece na tela em cada cena. */
export type Visual =
  | { tipo: "foto"; imagem: string; pb?: boolean; legenda?: string; satelites?: string[]; alertas?: string[] }
  | { tipo: "icone"; nome: string; variante?: Cor; rotulo?: string; satelites?: string[]; marca?: "x" }
  | { tipo: "icones"; itens: { nome: string; variante?: Cor; marca?: "x" }[] }
  | { tipo: "navio"; carga?: string[]; variante?: Cor }
  | { tipo: "contador"; de: number; para: number; nome: string; rotulo?: string; sufixo?: string }
  | { tipo: "jato"; gotas: boolean; raio?: boolean }
  | { tipo: "vento"; itens: string[] }
  | { tipo: "planeta"; modo: "girando" | "polos" | "parado"; rotulo?: string }
  | { tipo: "rota"; de: string; para: string; nome: string }
  | { tipo: "troca"; esquerda: string; direita: string; vai: string[]; volta: string[] }
  | { tipo: "grade"; total: number; vermelhos: number; nome: string }
  | { tipo: "recap"; centro: string; itens: { nome: string; variante?: Cor }[] }
  | { tipo: "balao" }
  | { tipo: "final" };

export type Cena = { id: string; texto: string; destaques?: Destaque[]; visual: Visual };
export type Roteiro = { slug: string; titulo: string; pergunta: string; fotosIcones?: Record<string, string>; cenas: Cena[] };

export type PalavraTempo = { palavra: string; inicio: number; fim: number };
export type Timing = { palavras: PalavraTempo[]; duracaoAudio: number | null };

export type VideoProps = { roteiro: Roteiro; timing: Timing | null; audio: string | null };
