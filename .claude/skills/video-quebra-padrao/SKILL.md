---
name: video-quebra-padrao
description: Produz um vídeo do @quebra.padrao do tema até o MP4 sincronizado com a narração do dono. Use quando o dono pedir um vídeo sobre um tema, pedir temas da semana, aprovar/refazer storyboard, ou enviar um áudio de narração.
---

# Vídeo @quebra.padrao

Antes de tudo, leia `estilo/GUIA.md` e olhe `estilo/referencias/titanic-prancha.jpg` e `estilo/roteiro-modelo-titanic.md`.
**O estilo do vídeo do café (`estilo/referencias/cafe-prancha.jpg`) é o padrão fixo**, com estrutura de roteiro do Titanic. Reaproveite `src/` e copie o formato de `videos/2026-11-23-brasil-nao-tinha-cafe/roteiro.json` (cenas + `fotosIcones`). Fale com o dono em português, de forma simples.

## Fluxo (decidido pelo dono)

1. **Temas da semana** (se ele pedir): 14 temas = 2 por dia × 7 dias, no formato de `temas/MODELO.md`, salvos em `temas/AAAA-semana-NN.md`. Regras de escolha na skill `crescimento-instagram`.
2. **Ele escolhe o tema** (ou já chega pedindo um tema direto).
3. **Pesquisa + roteiro**: pesquise o tema na web (fatos verificáveis, números exatos). Escreva o roteiro no modelo do Titanic (~150 palavras/min, uma frase por cena, gancho que quebra o padrão, virada, pergunta, "E segue o @quebra.padrao.").
4. **Storyboard + texto juntos**: crie o projeto em `videos/AAAA-MM-DD-<slug>/` (Remotion, ver abaixo), renderize **um quadro de cada cena** com a legenda daquela cena e monte uma prancha. Envie ao dono **a prancha + o texto da narração (`narracao.txt`) na mesma mensagem**, para ele já poder gravar.
5. **Aprovação**: ele aprova ou pede para refazer telas específicas → refaça **só essas** e reenvie.
6. **Narração**: ele grava e envia o áudio. Salve em `videos/<slug>/audio/`.
7. **Animação sincronizada**: transcreva com `scripts/transcrever.py` (tempos por palavra), alinhe com o texto do roteiro e anime **direto em cima do áudio**: cada palavra da legenda acende no tempo exato da voz; cada cena dura o trecho falado dela. A legenda usa a **grafia do roteiro**, com os **tempos da fala**. Se ele improvisou/pulou muito (≳15% das palavras), avise antes de seguir.
8. **Entrega**: renderize `final.mp4` (1080×1920, 30 fps, só narração — **sem música/efeitos**) e envie com `post.md` (legenda do post + hashtags, regras na skill `crescimento-instagram`).

## Como construir no Remotion
- O projeto Remotion vive na raiz deste repositório. Se ainda não existir, crie (skills `remotion:*` ajudam). Reaproveite e melhore componentes já existentes em `src/` — nunca recomece do zero se já houver.
- Componentes esperados: fundo com vinheta, legenda karaokê, foto em moldura, ícone 3D em código (branco/vermelho), gráficos em linha, contador, card de vidro, texto circular, anéis, câmera 3D/profundidade, card final Seguir.
- Imagens: domínio público/licença livre (Wikimedia Commons, Library of Congress). Fonte e licença em `videos/<slug>/imagens/FONTES.md`. Sem imagem livre → ícone/gráfico.
- **Não usar Higgsfield** nem geração de imagem paga.
- Compare cada storyboard com `estilo/referencias/cafe-prancha.jpg` antes de enviar: se não parece com ele, ajuste.
- Coisas reais (animais, comidas, objetos) = foto livre P&B dentro do ícone (`fotosIcones`); símbolos (alerta, X, setas, pessoa) desenhados. Vermelho só em 2–3 momentos. Fotos CC BY-SA/GFDL: crédito na legenda do post.
- Storyboard: `npm run storyboard -- <slug> [--cenas id1,id2]`.

## Transcrição
`python3 scripts/transcrever.py <audio> <saida.json>` → lista `{palavra, inicio, fim}` em segundos (Vosk, modelo pt; instruções no próprio script). O Whisper via Hugging Face foi bloqueado pela rede do ambiente; o Vosk (alphacephei.com) funciona.

## Estado e retomada
Cada vídeo em `videos/<slug>/`: `roteiro.md`, `narracao.txt`, `imagens/`, `storyboard/`, `audio/`, `palavras.json`, `post.md`, `STATUS.md` (em qual passo está). Ao abrir uma sessão, leia `STATUS.md` dos vídeos em andamento e continue de onde parou. `final.mp4` e áudio ficam fora do git; entregue o MP4 ao dono pelo chat.

## Rede
Se algum site necessário estiver bloqueado, **peça ao dono para liberar** (ferramentas de ambiente), não contorne.
