# Prompt para colar no Claude Code

Abra o terminal na pasta `clinica-luciana-salgado` e rode `claude`. Depois cole:

---

Leia SPEC.md e CLAUDE.md. Você é o orquestrador.

Comece a Fase 1 agora: dispare em paralelo, na mesma mensagem, os subagentes arquiteto, pesquisador e validador. Cada um deve ler SPEC.md e coord/STATUS.md antes de começar e atualizar só o próprio bloco no STATUS ao terminar.

Quando os três terminarem, me mostre um resumo curto (paleta escolhida, título do hero, itens [CONFIRMAR]) e siga para a Fase 2 com o desenvolvedor. Depois rode o ciclo de validação até o validador marcar APROVADO.

No final, sirva o site localmente e me diga como abrir no celular e no computador.

---

## Dica
Para conferir os agentes instalados, digite `/agents` no Claude Code. Os quatro (arquiteto, pesquisador, desenvolvedor, validador) devem aparecer como agentes do projeto.
