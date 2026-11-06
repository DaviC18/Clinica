---
name: Clínica de Olhos Luciana Salgado
description: A sala escura da lâmpada de fenda que acende a luz ao rolar.
colors:
  noite: "#0a1050"
  cobalto: "#16238f"
  cobalto-vivo: "#2a3dd6"
  porcelana: "#f6f7fc"
  nevoa-clara: "#e7eaf8"
  nevoa: "#c9d1f2"
  tinta: "#0b1040"
  tinta-suave: "#3e4678"
  fluor: "#84eb4f"
typography:
  display:
    fontFamily: "Hepta Slab Variable, Georgia, serif"
    fontSize: "clamp(2.5rem, 1.4rem + 4.9vw, 5.25rem)"
    fontWeight: 400
    lineHeight: 1.05
  headline:
    fontFamily: "Hepta Slab Variable, Georgia, serif"
    fontSize: "clamp(2rem, 1.6rem + 1.9vw, 3.25rem)"
    fontWeight: 500
    lineHeight: 1.15
  title:
    fontFamily: "Hepta Slab Variable, Georgia, serif"
    fontSize: "clamp(1.5rem, 1.35rem + 0.7vw, 2rem)"
    fontWeight: 400
    lineHeight: 1.15
  body:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.55
rounded:
  suave: "0.5rem"
  lente: "9999px"
spacing:
  gutter: "clamp(1.25rem, 5vw, 4rem)"
  bloco: "clamp(2rem, 4vw, 3.5rem)"
  secao: "clamp(4rem, 9vw, 8rem)"
  toque: "3.25rem"
components:
  button-primary:
    backgroundColor: "{colors.fluor}"
    textColor: "{colors.tinta}"
    typography: "{typography.body}"
    rounded: "{rounded.lente}"
    height: "{spacing.toque}"
    padding: "10px 24px"
  button-ghost:
    textColor: "{colors.porcelana}"
    rounded: "{rounded.lente}"
    height: "{spacing.toque}"
    padding: "10px 24px"
---

# Design System: Clínica de Olhos Luciana Salgado

## Overview

**Creative North Star: "A fenda de luz"**

O momento mais marcante de uma consulta de olhos é a lâmpada de fenda: sala escura, filtro de cobalto, uma fenda fina de luz atravessando uma lente. A página começa nessa sala e acende a luz ao rolar. Foge dos dois clichês da categoria: branco com azul-claro e foto de banco, ou preto com dourado.

Acolhimento vem da fonte de corpo, da linguagem do paciente, das formas redondas de lente nos botões e do espaço generoso, não de cor pastel. O sistema é legível para quem enxerga mal antes de ser expressivo.

**Key Characteristics:**
- Três assinaturas, e só estas: a fenda no hero, a abertura no scroll e a tabela de acuidade.
- Alternância de seções escuras e claras, sem cartões.
- Um único acento luminoso, reservado à ação de agendar.

## Colors

Azul-noite de consultório escuro, porcelana de sala acesa e um verde fluorescente que só aparece para agir.

### Primary
- **Noite**: fundo do hero, do CTA final e do rodapé; a sala escura.
- **Cobalto**: seção de avaliações e bordas sobre o escuro; o filtro da lâmpada.
- **Cobalto Vivo**: links em fundo claro e foco visível.

### Secondary
- **Flúor**: fundo dos botões de agendar e seleção de texto.

### Neutral
- **Porcelana**: fundo claro principal.
- **Névoa Clara**: fundo das seções claras alternadas.
- **Névoa**: linhas divisórias no claro e texto secundário no escuro.
- **Tinta**: texto principal no claro.
- **Tinta Suave**: texto secundário no claro.

### Named Rules
**The Único Acento Rule.** Flúor existe para agendar. Nada decorativo usa essa cor.

## Typography

**Display Font:** Hepta Slab (com Georgia)
**Body Font:** Atkinson Hyperlegible Next (com system-ui)

**Character:** A serifa quadrada lembra as tabelas de acuidade antigas; a Atkinson foi desenhada pelo Braille Institute para baixa visão. Os dígitos vêm da Hepta Slab, porque o zero cortado da Atkinson lembra Ø.

### Hierarchy
- **Display**: nome da clínica no hero.
- **Headline**: títulos de seção.
- **Title**: subtítulos e grupos de serviços.
- **Body**: texto corrido, largura máxima de 38rem.
- **Label**: texto legal e rótulos; nunca abaixo disso.

### Named Rules
**The Dezoito Rule.** Corpo nunca fica abaixo de 18 px no celular; só o texto legal desce, até 15 px.

## Layout

Fluxo vertical em seções de largura total, com conteúdo limitado a 76rem por margens fluidas. Grade de 12 colunas a partir de `xl`, empilhada em mobile first. Em `diferenciais`, o mobile é centralizado como tabela de acuidade e o desktop vira linhas de tabela.

## Elevation & Depth

Plano por camadas de cor. A única sombra é a dos botões flutuantes; a profundidade vem da luz somada ao fundo escuro (`mix-blend-mode: screen`).

### Named Rules
**The Luz Soma Rule.** No escuro, profundidade vem de luz aditiva, nunca de sombra colorida ou vidro.

## Shapes

Botões têm forma de lente, totalmente redondos. Superfícies usam cantos suaves. Divisórias de 1 px separam listas; não há cartões.

## Components

### Buttons
- **Shape:** forma de lente, totalmente redonda, com altura mínima de toque.
- **Primary:** flúor com texto tinta; em fundo claro ganha borda tinta, pelo contraste.
- **Hover / Focus:** sobe 2 px em 150 ms; contorno de 3 px no foco.
- **Ghost:** contorno porcelana, preenche ao passar o mouse.

### Navigation
Header fixo sobre noite, com borda cobalto. Links em névoa clareiam no hover. Abaixo de `xl`, vira menu sanfonado com fechamento por Escape.

### A Fenda
Cena 3D no hero: um fio de luz entra numa lente de vidro e abre em leque, com um pulso a cada 7 s. Sem WebGL, em aparelho fraco ou com `prefers-reduced-motion`, vira imagem estática.

### A Tabela de Acuidade
Os diferenciais em tamanho decrescente, linha a linha, em Hepta Slab.

## Do's and Don'ts

### Do:
- **Do** manter o WhatsApp visível sem rolar no celular.
- **Do** usar scrub só na abertura e no fechamento da fenda.
- **Do** usar ícones de uma só família (lucide).

### Don't:
- **Don't** usar cartões iguais de ícone, título e texto como estrutura da página.
- **Don't** colocar rótulo pequeno acima de título nem numerar seções.
- **Don't** usar texto em gradiente, vidro decorativo ou sombra colorida sem deslocamento.
- **Don't** mostrar globo ocular realista.
- **Don't** usar carrossel de depoimentos.
