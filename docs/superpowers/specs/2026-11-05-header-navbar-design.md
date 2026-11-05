# Header com navbar — design

Data: 2026-11-05. Decisão 28. Aprovado pelo usuário: opção 1 (ícone do favicon como logo).

## Intenção

Dar orientação ao visitante: marca no topo, atalhos para as seções e um botão "Agendar" sempre à mão.

## Goals

- Header fixo no topo, visível durante a rolagem.
- Logo = ícone de olho do `public/favicon.svg` + nome da clínica.
- Links para `#diferenciais`, `#medica`, `#servicos`, `#avaliacoes`, `#horarios` e `#faq`.
- CTA "Agendar" reutilizando `CtaWhatsApp`, com o mesmo estado `[CONFIRMAR]` + `tel:`.
- No celular: botão de menu com os links e o CTA.

## Non-goals

- Não cria logo novo nem altera o favicon.
- Não muda conteúdo factual, WhatsApp ou rotas.
- Não adiciona dependência.

## Anti-goals

- Header que esconde o conteúdo do hero.
- Link de navegação sem destino existente.
- CTA que promete WhatsApp com número não confirmado.

## Abordagens

- **A. Header fixo com sobreposição (escolhida):** `position: fixed`, fundo `noite` translúcido e `scroll-margin-top` nas seções. Custo: ajuste de padding no hero. Ganho: navegação sempre visível.
- **B. Header sticky no fluxo:** empurra o hero e reduz a primeira dobra. Rejeitada.
- **C. Sidebar fixa:** ocupa largura em telas grandes e não combina com página única. Rejeitada.

## Decisões de implementação

- Componente `src/components/Header.tsx`; sem estado global.
- Mobile: `useState` para abrir/fechar; `aria-expanded`, `aria-controls`, fecha ao clicar em link e com `Esc`.
- Rótulos em `src/data/interface.ts` (texto de interface, não fato da clínica).
- Breakpoint `lg` para a lista horizontal; abaixo disso, menu.
- `CtaWhatsApp` no desktop a partir de `sm`; no celular, dentro do menu.
- Espaçamento: hero ganha topo para o header; seções ganham `scroll-margin-top`.
- Sem alteração em `tests/checks.mjs`; prova por build, check existente e DOM no Chrome headless.
