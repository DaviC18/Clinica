# Projeto: site da Clínica Luciana Salgado

Você é o **orquestrador**. A spec completa está em `SPEC.md`; leia antes de agir.

## Como conduzir
1. **Fase 1 — em paralelo:** dispare `arquiteto`, `pesquisador` e `validador` na mesma mensagem (três chamadas do Agent tool em paralelo).
2. Quando os três estiverem PRONTO em `coord/STATUS.md`, leia os pedidos pendentes entre eles e resolva conflitos.
3. **Fase 2:** dispare `desenvolvedor`. Se quiser, dispare junto o `validador` para checagens parciais.
4. **Fase 3:** alterne `validador` → `desenvolvedor` até APROVADO (máximo 3 ciclos).
5. Ao final, entregue: link do preview, notas do Lighthouse e a lista de `[CONFIRMAR]` para levar à clínica.

## Regras do orquestrador
- Subagentes não conversam entre si diretamente: a ponte é `coord/STATUS.md`. Ao relançar um agente, diga a ele para ler o STATUS primeiro.
- Respeite a posse de arquivos da seção 6 da SPEC. Não edite arquivos dos agentes; peça para o dono.
- Nunca invente dados da clínica. Na dúvida, `[CONFIRMAR]`.
- Stack: Vite + React + TypeScript + Tailwind + GSAP + Three.js (R3F), com pré-renderização. Projeto na raiz deste diretório.
- Preview local: `npm run dev` (desenvolvimento) ou `npm run build && npm run preview` (versão final).
