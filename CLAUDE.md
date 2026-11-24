# quebrapadrao

Repositório de produção dos vídeos do Instagram **@quebra.padrao** ("Te explicando coisas em 1 minuto").
O Claude faz tudo (pesquisa, roteiro, storyboard, animação em Remotion, sincronia); o dono só escolhe o tema, aprova o storyboard e grava a narração.

Quando o dono pedir um vídeo ou temas:
1. Siga a skill `.claude/skills/video-quebra-padrao/SKILL.md` (fluxo completo).
2. Para temas, ganchos, capa, legenda do post e métricas: `.claude/skills/crescimento-instagram/SKILL.md`.
3. Estilo visual: `estilo/GUIA.md`. **Desde 2026-11-23 o padrão fixo é o estilo do vídeo do café** (`estilo/referencias/cafe-prancha.jpg`, `videos/2026-11-23-brasil-nao-tinha-cafe/`), que segue a estrutura do Titanic (`estilo/roteiro-modelo-titanic.md`): fundo preto, vermelho #E53935 só em 2–3 momentos por vídeo. **Desde 2026-11-25: fotos COLORIDAS, mais fotos e menos desenhos; todo ser vivo/objeto real = foto colorida dentro do ícone 3D** (ver topo de `estilo/GUIA.md`).

Regras fixas: 1080×1920; fundo preto, interface branca/cinza + vermelho #E53935 só em 2–3 momentos fortes; fotos coloridas (P&B só se a original não tiver cor); coisas reais = foto colorida dentro do ícone; muitas fotos em moldura, poucos desenhos; legenda karaokê sincronizada com a voz; câmera 3D e transições suaves automáticas (`src/componentes/Camera.tsx`), sem elemento borrado na frente; logo do perfil (`estilo/marca/logo.png`) no card final; nada cortado na borda; sem música/efeitos; sem Higgsfield; imagens só livres; site bloqueado → pedir liberação ao dono. Fale com o dono em português simples.

`docs/superpowers/` guarda um design e um plano de um motor Remotion reutilizável — use como ideia ao construir os componentes, não é obrigatório seguir.
