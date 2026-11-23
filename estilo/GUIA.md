# Guia de estilo — @quebra.padrao

**Referência principal: o vídeo do Titanic** (`referencias/titanic-prancha.jpg` e `referencias/titanic/quadro-NN.jpg`, um quadro a cada 2 s).
Wizebot e Cervello (`referencias/movimento-*`) são só referência de **técnica de movimento** — nunca copiar marca, logo ou a paleta azul/verde.

## Formato
- Vertical 1080×1920, 30 fps, 45–75 s (Titanic: 61 s).
- Só a narração no áudio. **Sem música e sem efeitos** — o dono adiciona depois no editor dele.

## Cores
- Fundo **preto** com vinheta radial suave (centro ~#1a1a1a → bordas #000).
- Branco, cinzas e **vermelho `#E53935`** como única cor de destaque, usada em **no máximo 2–3 momentos por vídeo** (palavra mais forte do gancho, número de impacto, perigo). Nunca como decoração. Nada de outras cores.
- Uma cena "clara" (fundo cinza) pode aparecer uma vez como quebra de ritmo (no Titanic: contagem "5" com iceberg).

## Legenda (o elemento mais importante)
- Inferior-central (~72% da altura), centralizada, sans-serif estilo **Inter**, ~44–48 px, no máximo 2 linhas.
- **Karaokê palavra por palavra no tempo exato da voz**: palavra ainda não falada em cinza bem escuro (quase invisível), palavra falada em branco.
- Palavras-chave em **negrito branco** ("**Titanic**", "**maior navio**", "**40**", "**iceberg**"); palavra de perigo em **negrito vermelho** ("**seis alertas**", "**aguentava.**").
- A legenda mostra só o trecho da frase atual, não o texto todo.

## Elementos visuais
- **Fotos reais** (P&B quando históricas) em molduras arredondadas (raio ~18 px, borda escura grossa, sombra), flutuando com leve movimento/zoom. Ex.: navio, iceberg, capitão, navio vizinho, bote.
- **Ícones 3D** estilo "app icon": azulejo arredondado com volume (brilho no topo, sombra embaixo), **branco** com símbolo escuro, ou **vermelho** com símbolo branco (alerta, cadeado). Pequenos ícones-satélite desfocados em volta do principal dão profundidade.
  - **Coisas reais = foto real P&B dentro do azulejo** (dono, 2026-11-23): café, cavalo, boi, tomate etc. viram foto livre em preto e branco recortada no ícone (`fotosIcones` no roteiro.json). Símbolos abstratos (alerta, X, setas, pessoa) continuam desenhados.
  - **Feitos em código** (CSS/SVG em Remotion). Não usar Higgsfield nem geração de imagem paga.
- **Gráficos em linha branca**: silhueta do navio e do iceberg numa linha d'água, velocímetro, casco com compartimentos enchendo de **vermelho**, anel com contador, número grande.
- **Foto recortada sem moldura** para o momento de maior impacto (Titanic: jornaleiro com "TITANIC DISASTER", quadro 26).
- **Grade de ícones** para proporção (botes: pessoas, metade em vermelho, quadro 23).
- **Repetição de alertas**: vários ícones vermelhos em volta de uma foto = "muitos avisos".
- **Final fixo** (ver `titanic/quadro-29.jpg` a `31`; o botão "Seguir" vira "Seguindo"): balão "você: <pergunta>?" + card com avatar "?", **@quebra.padrao**, "Te explicando coisas em 1 minuto" e botão **Seguir**. Legenda: "E segue o @quebra.padrao."
- Penúltima cena: "recapitulação" — foto central com os ícones das causas em volta.

## Movimento (técnicas a aplicar, vindas de Wizebot/Cervello)
- Câmera com leve deriva/zoom contínuo em toda cena; nada fica parado.
- Inclinação 3D (perspectiva) em fotos e cards ao entrar/sair.
- Profundidade de campo: elementos em primeiro plano desfocados cruzando a tela.
- Motion blur em entradas rápidas; transições por zoom/blur, não por corte seco.
- Cards de vidro (translúcidos, borda clara) para "notificações"/avisos.
- Texto girando em círculo em volta de um ícone; anéis pulsando e raios de luz atrás do elemento principal.
- Contadores animados para números (37 segundos, 1.500 pessoas).

## Roteiro
- ~150 palavras por minuto (Titanic: ~150 palavras em 61 s).
- Estrutura: **gancho que quebra o padrão** ("O Titanic não afundou só por causa de um iceberg.") → contexto em 1 frase → fatos curtos em sequência, um por cena → número de impacto → **virada** ("Não foi um erro só. Foram vários, ao mesmo tempo.") → **pergunta** ("Qual foi o pior? Comenta.") → "E segue o @quebra.padrao."
- Frases curtas, uma ideia por frase, cada frase vira uma cena.
- Modelo completo: `roteiro-modelo-titanic.md`.

## Imagens
- Só domínio público / licença livre (Wikimedia Commons, Library of Congress, acervos históricos). Registrar fonte e licença em `videos/<slug>/imagens/FONTES.md`.
- Sem imagem livre → usar ícone 3D ou gráfico no lugar.
