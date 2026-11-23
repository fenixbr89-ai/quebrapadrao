# Pipeline de vídeos @quebra.padrao — Design

Data: 2026-11-23 · Status: rascunho para aprovação

## 1. Intenção e o porquê

O @quebra.padrao é uma conta de Instagram de vídeos explicativos de ~1 minuto
("Te explicando coisas em 1 minuto — como funciona, por que acontece, como foi feito").
Hoje tem 7 posts, 108 seguidores, ~3,4 mil visualizações/30 dias.

O dono quer que **o Claude produza os vídeos de ponta a ponta** (pesquisa no Google,
roteiro, cenas, animação em Remotion, sincronização), ficando para ele apenas:
escolher o tema, aprovar o storyboard e gravar a narração. Quer também que o
crescimento da conta (escolha de temas, ganchos, legenda, hashtags, horários)
siga regras fixas.

Tudo vive no repositório `quebrapadrao`, organizado como uma **skill automatizada**:
qualquer sessão do Claude aberta nesse repositório sabe executar o fluxo sozinha.

## 2. Fluxo combinado (decidido pelo dono)

1. **Temas da semana** — Claude entrega 14 temas (2 vídeos/dia × 7 dias), cada um com
   gancho e uma linha de "por que tende a performar".
2. **Dono escolhe** um tema.
3. **Storyboard + texto da narração, juntos** — Claude pesquisa, escreve o roteiro e
   entrega uma imagem por cena (com a legenda daquela cena) + o texto completo da narração.
4. **Aprovação** — dono aprova ou pede para refazer telas específicas; só essas são refeitas.
5. **Narração** — dono grava e envia o áudio (a narração é a única coisa que ele cria).
6. **Animação sincronizada** — Claude transcreve o áudio para obter o tempo de cada palavra
   e faz a primeira animação já em cima do áudio: legenda palavra a palavra no tempo da voz,
   cada cena durando o trecho falado correspondente.
7. **Entrega** — MP4 1080×1920 + legenda do post + hashtags.

## 3. Objetivos, não-objetivos, anti-objetivos

**Objetivos**
- Cada vídeo novo = um arquivo de roteiro/cenas + assets; o estilo vem de componentes reutilizáveis.
- O que o dono aprova no storyboard é exatamente o que aparece no vídeo.
- Sincronia legenda↔voz precisa (palavra por palavra).
- Skill legível: um `CLAUDE.md` + skills em `.claude/skills/` descrevem o fluxo passo a passo.

**Não-objetivos**
- Postar automaticamente no Instagram (o dono posta).
- Gerar a narração (o dono grava).
- Usar o repositório `Remotion` ou `Instagramskill` (ficam parados).

**Anti-objetivos (seria fracasso mesmo funcionando)**
- Vídeo que não parece o do Titanic (cores, legenda, ícones).
- Copiar marca, logo ou paleta azul dos vídeos de referência Wizebot/Cervello.
- Legenda fora de sincronia com a voz.
- Storyboard aprovado diferente do vídeo final.
- Imagens com risco de direitos autorais quando há alternativa de domínio público.

## 4. Identidade visual (referência principal: vídeo do Titanic)

- **Fundo** preto com vinheta radial suave (centro levemente mais claro).
- **Paleta**: preto, branco, cinzas; **vermelho** (~#E53935) só para alerta/ênfase.
- **Legenda** na parte inferior-central, fonte sans-serif (estilo Inter), estilo karaokê:
  palavras ainda não faladas em cinza escuro, palavras faladas em branco, palavras-chave
  em **negrito branco** ou **vermelho**. 1–2 linhas por vez.
- **Fotos reais** (preto e branco quando históricas) em molduras arredondadas com borda
  escura e sombra, flutuando com leve movimento.
- **Ícones 3D** brancos (estilo "app icon" com volume) e vermelhos para alerta/cadeado;
  pequenos ícones-satélite desfocados ao redor do elemento principal.
- **Elementos gráficos** simples em linha branca (silhueta de navio, iceberg, velocímetro,
  barra de progresso preenchendo em vermelho, contador numérico).
- **Final fixo**: balão "você: <pergunta>?" + card "@quebra.padrao — Te explicando coisas
  em 1 minuto — [Seguir]" com legenda "E segue o @quebra.padrao".
- **Estrutura do roteiro**: gancho contra-intuitivo ("O Titanic não afundou…"),
  fatos em sequência, virada/conclusão, pergunta ao público, CTA de seguir.

### Técnicas de movimento extraídas de Wizebot/Cervello (só técnica, nunca marca/cor)
- Câmera inclinada em 3D (perspectiva/rotação em X/Y sobre cards e fotos).
- Profundidade de campo: elementos em primeiro plano desfocados passando rápido.
- Motion blur nas entradas rápidas.
- Cards de vidro (translúcido, borda clara, blur do fundo).
- Tipografia com pesos/tamanhos mistos (palavra-chave grande e grossa).
- Texto girando em círculo ao redor de um ícone.
- Raios de luz e anéis pulsando atrás do elemento principal.

## 5. Abordagens consideradas

**Storyboard**
- *A — quadros congelados do próprio Remotion* (**escolhida**): aprovado = final; refazer = ajustar uma cena.
- B — mockups gerados por IA: rápidos, porém o vídeo final divergiria do aprovado.

**Ícones 3D**
- *A — biblioteca fixa gerada uma vez por IA (Higgsfield), PNG transparente, reutilizada* (**escolhida**):
  mais fiel ao Titanic e consistente entre vídeos.
- B — ícones em código (SVG/CSS): grátis e infinitos, mas visual mais "chapado".
- (Descartada) gerar ícones novos por vídeo: inconsistência visual.

**Organização**
- Tudo no repositório `quebrapadrao` (**decidido pelo dono**), incluindo as regras de
  crescimento do Instagram. Repositórios `Remotion` e `Instagramskill` não são usados.

## 6. Estrutura do repositório (proposta)

```
quebrapadrao/
├── CLAUDE.md                      # ponto de entrada: o que é o projeto e o fluxo
├── .claude/skills/
│   ├── video-quebra-padrao/SKILL.md   # fluxo completo, passos 1–7, comandos
│   └── crescimento-instagram/SKILL.md # temas, ganchos, legenda, hashtags, horários, métricas
├── estilo/                         # guia visual (seção 4) + frames de referência
├── src/                            # projeto Remotion
│   ├── componentes/                # Legenda, FotoMoldura, Icone3D, CameraMove,
│   │                               # CardVidro, TextoCircular, Aneis, CardSeguir, Fundo...
│   ├── cenas/                      # tipos de cena reutilizáveis (foto, ícone, gráfico, contador, final)
│   └── Root.tsx                    # registra uma composição por vídeo
├── assets/icones/                  # biblioteca fixa de ícones 3D
├── videos/<AAAA-MM-DD-slug>/
│   ├── roteiro.json                # cenas, texto de cada cena, palavras-chave, assets
│   ├── narracao.txt                # texto para o dono gravar
│   ├── imagens/                    # fotos pesquisadas (+ fonte/licença)
│   ├── storyboard/                 # PNG por cena
│   ├── audio/                      # narração do dono
│   ├── timing.json                 # palavras com início/fim (da transcrição)
│   ├── post.md                     # legenda + hashtags
│   └── final.mp4                   # (fora do git)
├── temas/<AAAA-semana-NN>.md       # 14 temas da semana
└── scripts/                        # storyboard, transcrição/sincronia, render
```

## 7. Sincronização com a narração

- Transcrever o áudio com marcação de tempo por palavra (Whisper).
- Alinhar as palavras transcritas ao texto de `narracao.txt` (que é a fonte da grafia certa
  da legenda); a transcrição só fornece os tempos.
- Cada cena em `roteiro.json` corresponde a um trecho do texto; sua duração = do início da
  primeira palavra ao início do primeiro trecho da cena seguinte.
- Antes do áudio, o storyboard usa tempos estimados (só para gerar os quadros).

## 8. Restrições

- Formato 1080×1920, 30 fps, ~45–75 s.
- Execução em sessão de nuvem: Chromium disponível para render; registros npm/PyPI liberados.
- Hosts externos (Wikimedia, Google Imagens, Hugging Face para modelo Whisper) podem estar
  bloqueados pela política de rede — o builder deve verificar e, se preciso, pedir liberação.
- MP4 finais e áudios grandes não vão para o git (`.gitignore`), mas o vídeo é entregue ao dono.
- Ícones via Higgsfield consomem créditos da conta do dono — gerar a biblioteca uma vez.

## 9. Deixado para o builder

- Componentização exata e API de `roteiro.json`.
- Biblioteca Whisper específica e algoritmo de alinhamento.
- Lista inicial de ícones da biblioteca (sugestão: alerta, cadeado, chave, olho, binóculos,
  relógio, lua riscada, navio, cérebro, dinheiro, raio, check, X, interrogação).
- Fonte exata (Inter ou equivalente livre).

## 10. Decisões do Claude após revisão (dono pode corrigir)

- **Troca de arquivos**: o dono envia áudio pelo chat; Claude devolve storyboard e MP4 pelo chat.
  O estado de cada vídeo fica em `videos/<slug>/` para que uma sessão nova retome de onde parou.
- **Narração ≠ texto**: legenda segue o que foi falado (tempos da transcrição, grafia do texto);
  divergência grande → avisar o dono antes de seguir. "Aprovado = final" vale para o visual das cenas;
  durações mudam conforme a voz.
- **Direitos de imagem**: domínio público/licença livre primeiro (Wikimedia, acervos históricos);
  sem opção livre → trocar por ícone ou gráfico, nunca usar imagem protegida.
- **Regras de crescimento**: escritas pelo Claude (o `Instagramskill` está vazio); "por que tende a
  performar" é julgamento, refinado com prints do painel que o dono enviar.
- **Referências visuais**: quadros dos 3 vídeos salvos em `estilo/referencias/`.

## 11. Perguntas em aberto para o dono

- Música de fundo / efeitos sonoros: quem coloca?
- Orçamento de créditos Higgsfield para a biblioteca de ícones e para ícones novos no futuro.
