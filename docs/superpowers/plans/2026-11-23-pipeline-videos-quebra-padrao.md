# Pipeline de vídeos @quebra.padrao — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um repositório `quebrapadrao` onde o Claude produz, por skill, vídeos 1080×1920 no estilo do Titanic: roteiro → storyboard (quadros do próprio Remotion) → narração do dono → vídeo sincronizado palavra a palavra.

**Architecture:** Uma única composição Remotion `Video` recebe por props o `roteiro.json` (cenas) e o `timing.json` (tempo de cada palavra) de `videos/<slug>/`. Lógica pura (schema, estimativa de tempos, alinhamento transcrição↔texto, duração das cenas) fica em `src/roteiro/` e `src/timing/`, com testes Vitest. Componentes visuais reutilizáveis em `src/componentes/`; scripts de CLI em `scripts/`; o fluxo humano vive em `.claude/skills/`.

**Tech Stack:** Remotion 4 + React 19 + TypeScript, zod, `@remotion/google-fonts` (Inter), Vitest, tsx (scripts), Python 3 + faster-whisper (transcrição), ffmpeg.

**Spec:** `docs/superpowers/specs/2026-11-23-pipeline-videos-quebra-padrao-design.md`

## Global Constraints

- Formato 1080×1920, 30 fps, vídeos de ~45–75 s.
- Paleta: preto/branco/cinzas; vermelho `#E53935` só para alerta/ênfase. Nunca a paleta azul/verde de Wizebot/Cervello.
- Fonte sans estilo Inter.
- Legenda karaokê: palavra futura cinza escuro, falada branca, destaque em negrito branco ou vermelho; 1–2 linhas.
- Final fixo: balão "você: <pergunta>?" + card "@quebra.padrao — Te explicando coisas em 1 minuto — [Seguir]".
- Ícones 3D feitos em código (sem Higgsfield nem geração paga de imagens, em nenhuma etapa).
- Sem música/efeitos: MP4 sai só com a narração.
- Imagens só de domínio público/licença livre; fonte e licença registradas; sem opção livre → ícone/gráfico.
- Legenda segue o que foi falado (tempos da transcrição), com a grafia de `narracao.txt`; divergência grande → avisar o dono.
- `final.mp4` e áudios ficam fora do git; estado de cada vídeo em `videos/<slug>/`.
- Textos voltados ao dono em português do Brasil.

## Review Focus

1. Narração com palavras puladas/improvisadas → alinhamento continua monotônico, palavras sem par recebem tempo interpolado, e `divergencia > 0.15` é reportada (teste na Task 2).
2. Números falados ("1912", "mil novecentos e doze", "40km/h") e pontuação/acentos → casamento normalizado não quebra (teste na Task 2).
3. Áudio mais longo que a última cena → o card final estende até o fim do áudio + 1 s (teste na Task 2).
4. Imagem referenciada no roteiro que não existe → erro claro com o caminho, antes de renderizar (teste na Task 1).
5. Texto de cena longo → legenda mostra janela de no máx. 2 linhas acompanhando a palavra atual, sem estourar a tela (verificado no still da Task 3).

---

## File Structure

```
package.json, tsconfig.json, remotion.config.ts, vitest.config.ts, .gitignore
CLAUDE.md
.claude/skills/video-quebra-padrao/SKILL.md
.claude/skills/crescimento-instagram/SKILL.md
estilo/GUIA.md, estilo/referencias/*.jpg
temas/MODELO.md
src/index.ts, src/Root.tsx
src/roteiro/schema.ts          # zod schema + tipos Roteiro/Cena; validarAssets()
src/timing/estimar.ts          # tempos estimados (pré-áudio)
src/timing/alinhar.ts          # transcrição ↔ texto
src/timing/cenas.ts            # duração/início de cada cena em frames
src/componentes/               # Fundo, Legenda, Camera, Icone3D, FotoMoldura, CardVidro,
                               # TextoCircular, Aneis, CardFinal
src/icones/glifos.tsx          # biblioteca de glifos SVG
src/cenas/                     # CenaFoto, CenaIcone, CenaGrafico, CenaContador, CenaFinal, index (registry)
src/Video.tsx                  # composição principal
scripts/storyboard.ts, scripts/transcrever.py, scripts/sincronizar.ts, scripts/render.ts, scripts/novo-video.ts
tests/*.test.ts
videos/<slug>/                 # roteiro.json, narracao.txt, imagens/, storyboard/, audio/, palavras.json, timing.json, post.md
```

`remotion.config.ts` define `Config.setPublicDir('./videos')`, então assets são `staticFile('<slug>/imagens/x.jpg')`.

---

### Task 1: Projeto Remotion + schema do roteiro

**Files:**
- Create: `package.json`, `tsconfig.json`, `remotion.config.ts`, `vitest.config.ts`, `.gitignore`, `src/index.ts`, `src/Root.tsx`, `src/roteiro/schema.ts`
- Test: `tests/schema.test.ts`

**Interfaces:**
- Produces:
  - `type Destaque = { palavra: string; cor: 'branco' | 'vermelho' }`
  - `type Cena = { id: string; texto: string; destaques: Destaque[]; tipo: 'foto' | 'icone' | 'grafico' | 'contador' | 'final'; props: Record<string, unknown> }`
  - `type Roteiro = { slug: string; titulo: string; pergunta: string; cenas: Cena[] }`
  - `roteiroSchema` (zod), `parseRoteiro(json: unknown): Roteiro`
  - `validarAssets(roteiro: Roteiro, raizVideos: string): string[]` — lista de caminhos ausentes (props `imagem`/`imagens` relativos a `videos/<slug>/`)
  - `type PalavraTempo = { palavra: string; inicio: number; fim: number }` (segundos), `type Timing = { palavras: PalavraTempo[]; duracaoAudio: number | null }`

- [ ] **Step 1:** Init: deps `remotion @remotion/cli @remotion/google-fonts react react-dom zod`; dev `typescript @types/react vitest tsx`. Scripts npm: `studio`, `test` (vitest run), `typecheck` (tsc --noEmit), `storyboard`, `sincronizar`, `render`, `novo`. `.gitignore`: `node_modules`, `out/`, `videos/*/final.mp4`, `videos/*/audio/`.
- [ ] **Step 2: Write failing tests** in `tests/schema.test.ts`:
  - `parseRoteiro` aceita um roteiro mínimo de 2 cenas e retorna tipado.
  - rejeita `tipo: 'xyz'` e `cor: 'azul'`.
  - rejeita roteiro cuja última cena não é `tipo: 'final'`.
  - `validarAssets` em diretório temporário com `imagens/a.jpg` presente e `imagens/b.jpg` ausente retorna `['<slug>/imagens/b.jpg']`.
- [ ] **Step 3:** Run `npm test` → FAIL (módulo inexistente).
- [ ] **Step 4:** Implement `src/roteiro/schema.ts`; `Root.tsx` registra composição vazia `Video` 1080×1920@30 (preenchida na Task 5).
- [ ] **Step 5:** Run `npm test && npm run typecheck` → PASS.
- [ ] **Step 6:** Commit `feat: projeto remotion e schema do roteiro`.

### Task 2: Tempos — estimativa, alinhamento e duração das cenas

**Files:**
- Create: `src/timing/estimar.ts`, `src/timing/alinhar.ts`, `src/timing/cenas.ts`
- Test: `tests/timing.test.ts`

**Interfaces:**
- Consumes: `Roteiro`, `PalavraTempo`, `Timing` (Task 1)
- Produces:
  - `tokenizar(texto: string): string[]` — divide por espaço mantendo pontuação na palavra (é o que a legenda mostra).
  - `normalizar(p: string): string` — minúsculas, sem acento, sem pontuação.
  - `estimarTiming(roteiro: Roteiro, palavrasPorMinuto = 170): Timing`
  - `alinhar(textoPalavras: string[], transcritas: PalavraTempo[]): { palavras: PalavraTempo[]; divergencia: number }` — saída tem exatamente `textoPalavras.length` itens, com grafia do texto.
  - `type CenaTempo = { id: string; inicioFrame: number; duracaoFrames: number; palavraInicio: number; palavraFim: number }`
  - `calcularCenas(roteiro: Roteiro, timing: Timing, fps = 30): CenaTempo[]`

- [ ] **Step 1: Write failing tests**:
  - `tokenizar('Em 1912, era o maior')` → `['Em','1912,','era','o','maior']`; `normalizar('Navio!')` → `'navio'`; `normalizar('Ação')` → `'acao'`.
  - `alinhar` com transcrição idêntica → tempos copiados, `divergencia === 0`.
  - `alinhar` com uma palavra pulada na fala → saída do mesmo tamanho do texto, tempo da palavra pulada interpolado entre vizinhas, tempos não-decrescentes, `divergencia > 0`.
  - `alinhar` com palavra improvisada extra na fala → ignorada; grafia do texto preservada.
  - `alinhar` onde texto tem `'1912,'` e transcrição `'mil','novecentos','e','doze'` → `'1912,'` recebe início de `'mil'` e fim de `'doze'` (sem par direto: interpolação pelo intervalo entre vizinhas casadas).
  - `alinhar` com metade das palavras diferentes → `divergencia > 0.15`.
  - `calcularCenas`: cena N começa no início da sua primeira palavra (cena 0 em frame 0); termina onde a próxima começa; última cena (final) dura até `max(fim da última palavra, duracaoAudio) + 1 s`; soma das durações = duração total.
  - `estimarTiming` de 170 palavras → última palavra termina em ~60 s (±1).
- [ ] **Step 2:** Run `npm test -- timing` → FAIL.
- [ ] **Step 3:** Implement. `alinhar`: alinhamento de sequência (DP de edição sobre `normalizar`) com custo de substituição 1, inserção/remoção 1; pares iguais copiam tempos; sem par → interpolação linear entre vizinhos casados. `divergencia` = (palavras do texto sem par) / total.
- [ ] **Step 4:** Run `npm test` → PASS.
- [ ] **Step 5:** Commit `feat: estimativa, alinhamento e tempos de cena`.

### Task 3: Base visual — Fundo, Legenda karaokê, Câmera

**Files:**
- Create: `src/componentes/Fundo.tsx`, `src/componentes/Legenda.tsx`, `src/componentes/Camera.tsx`, `src/componentes/fonte.ts`, `src/Catalogo.tsx` (composição de teste registrada em `Root.tsx`)
- Copy: quadros de referência para `estilo/referencias/` (titanic, wizebot, cervello — contact sheets já extraídos na sessão; reextrair com ffmpeg dos uploads se preciso)

**Interfaces:**
- Consumes: `PalavraTempo`, `Destaque`
- Produces:
  - `<Fundo />` — preto com vinheta radial (centro ~#1a1a1a → #000).
  - `<Legenda palavras={PalavraTempo[]} destaques={Destaque[]} tempoAtual={number} />` — posição inferior-central (~y 70%), largura máx 80%, Inter 46px; futura `#3a3a3a`, falada `#fff` peso 500, destaque peso 800 (`vermelho` → `#E53935`); entra com fade+subida de 8px por palavra; janela de no máx. 2 linhas.
  - `<Camera rotX? rotY? zoomDe? zoomPara? deriva?>{children}</Camera>` — perspectiva 1600px, interpola por `useCurrentFrame` na duração da Sequence; `profundidade` aplica blur proporcional a objetos marcados como frente.

- [ ] **Step 1:** Implement os 3 componentes e `Catalogo` mostrando legenda longa (frase de 30 palavras) sobre fundo.
- [ ] **Step 2: Verify:** `npx remotion still Catalogo out/catalogo-legenda.png --frame=60` e comparar ao lado de `estilo/referencias/titanic.jpg`: legenda no mesmo lugar, mesma hierarquia de cinza/branco/vermelho, no máx. 2 linhas.
- [ ] **Step 3:** `npm run typecheck` → PASS. Commit `feat: fundo, legenda karaokê e câmera`.

### Task 4: Ícones 3D em código e demais componentes

**Files:**
- Create: `src/icones/glifos.tsx`, `src/componentes/Icone3D.tsx`, `FotoMoldura.tsx`, `CardVidro.tsx`, `TextoCircular.tsx`, `Aneis.tsx`, `CardFinal.tsx` (em `src/componentes/`)

**Interfaces:**
- Produces:
  - `type NomeGlifo = 'alerta'|'cadeado'|'chave'|'olho'|'binoculos'|'relogio'|'lua-riscada'|'navio'|'cerebro'|'dinheiro'|'raio'|'check'|'x'|'interrogacao'|'velocimetro'`; `glifos: Record<NomeGlifo, React.FC<{cor: string}>>`
  - `<Icone3D nome={NomeGlifo} variante={'branco'|'vermelho'} tamanho={number} desfoque?={number} />` — azulejo raio 28% com gradiente vertical (branco: #fff→#cfcfcf; vermelho: #ff5a52→#b71c1c), brilho superior, sombra interna inferior, sombra externa longa; glifo escuro no branco, branco no vermelho.
  - `<FotoMoldura src={string} largura={number} pb?={boolean} />` — raio 18px, borda 6px #1c1c1c, sombra; `pb` aplica grayscale.
  - `<CardVidro>{children}</CardVidro>`, `<TextoCircular texto raio velocidade />`, `<Aneis cor />`, `<CardFinal pergunta={string} />` (balão "você" + card @quebra.padrao + botão Seguir, conforme Global Constraints).
- [ ] **Step 1:** Implement; adicionar ao `Catalogo` uma grade com todos os glifos nas duas variantes + cada componente.
- [ ] **Step 2: Verify:** `npx remotion still Catalogo out/catalogo-icones.png --frame=0` e comparar com os ícones de `estilo/referencias/titanic.jpg` (volume aparente, brilho, sombra). Ajustar até parecer "3D", não chapado.
- [ ] **Step 3:** `npm run typecheck` → PASS. Commit `feat: ícones 3D em código e componentes`.

### Task 5: Cenas e composição `Video`

**Files:**
- Create: `src/cenas/CenaFoto.tsx`, `CenaIcone.tsx`, `CenaGrafico.tsx`, `CenaContador.tsx`, `CenaFinal.tsx`, `src/cenas/index.ts`, `src/Video.tsx`
- Modify: `src/Root.tsx`
- Test: `tests/video-props.test.ts`

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces:
  - `type VideoProps = { roteiro: Roteiro; timing: Timing; audio: string | null }` (audio = caminho relativo a `videos/`)
  - `calcularMetadata(props: VideoProps)` exportado de `src/Video.tsx` e usado como `calculateMetadata` da composição `Video` → `durationInFrames` = soma de `calcularCenas`.
  - `cenas: Record<Cena['tipo'], React.FC<{cena: Cena; slug: string}>>`
  - props por tipo (validadas no schema da Task 1 — estender aqui): `foto {imagem, pb?, icones?: NomeGlifo[]}`, `icone {icone: NomeGlifo, variante, satelites?: NomeGlifo[], textoCircular?}`, `grafico {forma: 'navio'|'iceberg'|'barra'|'velocimetro', valor?}`, `contador {de, para, sufixo?}`, `final {}` (usa `roteiro.pergunta`).
- [ ] **Step 1: Failing test:** `calcularMetadata` de um `VideoProps` com timing estimado de 3 cenas retorna `durationInFrames` igual à soma de `calcularCenas`; com `audio` e `duracaoAudio: 62` retorna ≥ `63*30`.
- [ ] **Step 2:** Implement: `Video` = `<Fundo/>` + `<Series>` de cenas (cada uma dentro de `<Camera>` com movimento leve padrão) + `<Legenda>` global + `<Audio>` quando houver. Entrada de cada cena com zoom/blur curto (motion blur simulado).
- [ ] **Step 3:** `npm test && npm run typecheck` → PASS. Commit `feat: cenas e composição Video`.

### Task 6: Scripts — novo vídeo, storyboard, transcrição, sincronização, render

**Files:**
- Create: `scripts/novo-video.ts`, `scripts/storyboard.ts`, `scripts/transcrever.py`, `scripts/sincronizar.ts`, `scripts/render.ts`, `scripts/requirements.txt`

**Interfaces:**
- Consumes: `parseRoteiro`, `validarAssets`, `estimarTiming`, `alinhar`, `tokenizar`, `calcularCenas`.
- Produces (CLI):
  - `npm run novo -- <slug>` → cria `videos/<slug>/` com `roteiro.json` modelo, `imagens/`, `audio/`, `post.md` modelo.
  - `npm run storyboard -- <slug> [--cenas id1,id2]` → valida assets (aborta listando ausentes), usa timing estimado (ou `timing.json` se existir), renderiza `storyboard/<NN>-<id>.png` no frame de 70% de cada cena (só as cenas pedidas, se `--cenas`), monta `storyboard/prancha.jpg` (ffmpeg tile 3 colunas), e escreve `narracao.txt` = textos das cenas, um parágrafo por cena.
  - `python3 scripts/transcrever.py videos/<slug>/audio/<arquivo>` → `videos/<slug>/palavras.json` (`PalavraTempo[]`, faster-whisper modelo `small`, `language='pt'`, `word_timestamps=True`) + duração do áudio.
  - `npm run sincronizar -- <slug>` → `alinhar(tokenizar(todos os textos), palavras)` → `timing.json`; imprime `divergencia` e, se > 0.15, `ATENÇÃO: narração difere do texto` + palavras sem par.
  - `npm run render -- <slug>` → `videos/<slug>/final.mp4` (h264, 1080×1920, com áudio).
- [ ] **Step 1:** `pip install -r scripts/requirements.txt` (faster-whisper); confirmar download do modelo pelo Hugging Face.
- [ ] **Step 2:** Implement os scripts.
- [ ] **Step 3: Verify:** `npm run novo -- teste && npm run storyboard -- teste` gera PNGs e `prancha.jpg`; remover uma imagem e confirmar que aborta citando o caminho. Apagar `videos/teste`.
- [ ] **Step 4:** Commit `feat: scripts de storyboard, transcrição, sincronia e render`.

### Task 7: Piloto — refazer o Titanic de ponta a ponta

**Files:**
- Create: `videos/2026-11-23-titanic/*`

Valida o pipeline inteiro contra a referência, usando a narração real do vídeo original.
- [ ] **Step 1:** Extrair o áudio do Titanic original (`ffmpeg -i <upload titanic.mp4> -vn videos/2026-11-23-titanic/audio/narracao.m4a`) e transcrever para obter o texto; escrever `roteiro.json` com as cenas observadas no original (fotos do Titanic/iceberg/capitão Smith/Californian/bote salva-vidas baixadas do Wikimedia Commons com fonte+licença em `imagens/FONTES.md`).
- [ ] **Step 2:** `npm run storyboard -- 2026-11-23-titanic` e comparar a prancha com `estilo/referencias/titanic.jpg`.
- [ ] **Step 3:** `transcrever.py` + `sincronizar` → divergência esperada < 0.05; `render`.
- [ ] **Step 4: Verify:** extrair quadros do `final.mp4` em 5 tempos e conferir que a palavra acesa na legenda é a que está sendo falada (comparar com `palavras.json`). Enviar prancha + MP4 ao dono.
- [ ] **Step 5:** Commit (sem `final.mp4`/áudio) `feat: piloto Titanic`.

### Task 8: Skills, CLAUDE.md e guias

**Files:**
- Create: `CLAUDE.md`, `.claude/skills/video-quebra-padrao/SKILL.md`, `.claude/skills/crescimento-instagram/SKILL.md`, `estilo/GUIA.md`, `temas/MODELO.md`

- [ ] **Step 1:** `video-quebra-padrao/SKILL.md`: frontmatter com gatilhos ("novo vídeo", "temas da semana", "storyboard", "narração", áudio enviado); os 7 passos do spec, cada um com comandos exatos da Task 6, o que enviar ao dono (prancha + `narracao.txt` juntos; MP4 + `post.md`), como retomar pelo estado da pasta (`roteiro.json` sem storyboard → passo 3; storyboard sem áudio → aguardando narração; `timing.json` sem `final.mp4` → render), regras de imagem e de divergência, e como pedir liberação de rede ao dono.
- [ ] **Step 2:** `crescimento-instagram/SKILL.md`: como gerar os 14 temas (formato de `temas/MODELO.md`: tema, gancho, pergunta final, por que tende a performar); regras de gancho nos 2 primeiros segundos; capa com 3–5 palavras no centro (corte 3:4); priorizar temas "compartilháveis"; Testar reel; legenda com 1ª linha pesquisável + 3–5 hashtags de nicho; responder comentários na 1ª hora; fixar 3 melhores; leitura de prints do painel (retenção, envios, origem) para ajustar.
- [ ] **Step 3:** `estilo/GUIA.md` com a seção 4 do spec + referência aos quadros. `CLAUDE.md` curto apontando para as skills e o guia.
- [ ] **Step 4: Verify:** nova sessão do Claude no repo consegue, só lendo `CLAUDE.md`, dizer qual o próximo passo do vídeo piloto (checagem manual lendo como o builder).
- [ ] **Step 5:** Commit `docs: skills do pipeline e de crescimento` e push.
