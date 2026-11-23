# quebrapadrao

Repositório de produção dos vídeos do Instagram **@quebra.padrao** ("Te explicando coisas em 1 minuto").
O Claude faz tudo (pesquisa, roteiro, storyboard, animação em Remotion, sincronia); o dono só escolhe o tema, aprova o storyboard e grava a narração.

Quando o dono pedir um vídeo ou temas:
1. Siga a skill `.claude/skills/video-quebra-padrao/SKILL.md` (fluxo completo).
2. Para temas, ganchos, capa, legenda do post e métricas: `.claude/skills/crescimento-instagram/SKILL.md`.
3. Estilo visual: `estilo/GUIA.md`. **Desde 2026-11-23 o padrão fixo é o estilo do vídeo do café** (`estilo/referencias/cafe-prancha.jpg`, `videos/2026-11-23-brasil-nao-tinha-cafe/`), que segue a estrutura do Titanic (`estilo/roteiro-modelo-titanic.md`): preto e branco, fotos reais P&B dentro dos ícones 3D, vermelho #E53935 só em 2–3 momentos por vídeo.

Regras fixas: 1080×1920; fundo preto, branco/cinza + vermelho #E53935 só em 2–3 momentos fortes (nenhuma outra cor); coisas reais = foto real P&B dentro do ícone; legenda karaokê sincronizada com a voz; sem música/efeitos; sem Higgsfield; imagens só livres; site bloqueado → pedir liberação ao dono. Fale com o dono em português simples.

`docs/superpowers/` guarda um design e um plano de um motor Remotion reutilizável — use como ideia ao construir os componentes, não é obrigatório seguir.
