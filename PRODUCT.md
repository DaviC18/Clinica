# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Paciente mais velho, ou familiar que marca a consulta por ele, que abre o site no celular depois de clicar em um anúncio pago. Precisa entender rápido se a clínica resolve o problema dele e agendar sem esforço. Muitos têm visão reduzida.

## Product Purpose

Landing page da Clínica Luciana Salgado (oftalmologia, Volta Redonda/RJ). Substitui a página genérica do Google Business Profile que recebe os anúncios e o domínio `clinicalucianasalgado.com`, hoje em erro 404.

Neste momento o site é uma proposta: será mostrado à clínica como peça pronta, e precisa impressionar no celular em menos de 10 segundos. A publicação vem depois que a clínica enviar os dados pendentes.

Conversão principal: agendamento pelo WhatsApp. Caminho secundário: ligação.

## Positioning

- Nota 5,0 em 606 avaliações no Perfil do Google (nov/2026).
- Atende até domingo: seg-sex 7h-21h, sáb 8h-19h, dom 8h-15h.
- Atendimento pela própria médica, na clínica e na cirurgia.
- Espaço acessível para cadeira de rodas e que acolhe a comunidade LGBTQ+.

## Operating Context

O paciente chega por anúncio, decide no celular e agenda por mensagem ou telefone. O site não agenda nem coleta dados: a conversa acontece no WhatsApp ou na ligação.

## Capabilities and Constraints

- Publicidade médica (Resolução CFM nº 2.336/2023): nome da médica, CRM e RQE junto da especialidade. Sem promessa de resultado, antes e depois, preço como chamariz, "o melhor" ou "garantido".
- Nada inventado: fatos só de `docs/fatos.json`. Dúvida vira marcador `[CONFIRMAR]` em `src/data/`, não exibido na página (`src/components/semPendencias.ts`).
- LGPD: sem formulário que colete dados de saúde.
- Linguagem de paciente: termo técnico sempre com explicação curta.
- Desempenho: Lighthouse mobile ≥ 85 em Performance e ≥ 90 nas demais; bundle inicial ≤ 200 KB gzip; Three.js em chunk separado, depois do primeiro paint.
- Animação nunca atrasa o clique de agendar. Sem WebGL, em aparelho fraco ou com `prefers-reduced-motion`, a cena 3D vira imagem estática.
- Pendente com a clínica: número de WhatsApp, RQE, registro da clínica no CRM, diretor técnico-médico, convênios, idades atendidas, avaliações reais, parte da formação. Sem número de WhatsApp, há um só CTA: ligar para o fixo, com o número no botão.

## Brand Commitments

- Marca: Clínica de Olhos Luciana Salgado.
- Voz: frases curtas, em linguagem de paciente, sem superlativos.
- Sem globo ocular realista: olho em close incomoda paciente.

## Evidence on Hand

- Nota e total de avaliações do Perfil do Google.
- Fatos em `docs/fatos.json` e textos em `docs/conteudo.md`.
- Foto da médica fornecida pelo dono: recorte em `public/img/dra-luciana-480.*`, original em `docs/fotos/`. Uso depende de autorização dela.
- Ausentes, e proibido fabricar: depoimentos reais, logo em arquivo, convênios.

## Product Principles

1. Agendar vem primeiro: nada fica entre o paciente e o contato.
2. Confiança se prova com fatos verificáveis, nunca com promessa.
3. Legível para quem enxerga mal é o padrão, não uma exceção.
4. O impacto visual serve à clínica de olhos; nunca assusta nem atrasa.

## Accessibility & Inclusion

Público com visão reduzida: corpo mínimo de 18 px no celular, fonte Atkinson Hyperlegible Next, contraste WCAG AA, alvo de toque de 52 px, foco visível e respeito a `prefers-reduced-motion`.
