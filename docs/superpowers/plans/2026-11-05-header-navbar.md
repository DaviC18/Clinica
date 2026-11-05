# Header com navbar — plano

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Header fixo com logo, links de seção e CTA "Agendar".

**Architecture:** Componente `Header` montado antes de `<main>`. Estado local só para o menu mobile. Reutiliza `CtaWhatsApp`. Espaçamento compensa o header fixo.

**Tech Stack:** React 19, TypeScript, Tailwind 4, lucide-react.

**Spec:** `docs/superpowers/specs/2026-11-05-header-navbar-design.md`

## Global Constraints

- Sem dependência nova.
- WhatsApp não confirmado continua sem `wa.me`; CTA usa `tel:` e `[CONFIRMAR]`.
- Nenhum fato da clínica no JSX.
- `npm run build`, `npm run check` e `npm run lint` devem passar.

## Review Focus

- Header não cobre o eyebrow do hero em 375 px nem em 1280 px.
- Link de seção chega abaixo do header, não atrás dele.
- Menu mobile fecha ao escolher um link e não prende o foco.
- CTA do header mantém `aria-label` honesto quando o WhatsApp não está confirmado.
- Header não cria rolagem horizontal em 375 px.

---

### Task 1: Componente Header

**Files:**
- Create: `src/components/Header.tsx`
- Modify: `src/data/interface.ts`

**Interfaces:**
- Consumes: `conteudo.hero.ctaPrimario`, `CtaWhatsApp`, `interfaceTextos`.
- Produces: `export function Header()`.

- [ ] Criar `interfaceTextos.nav` com os seis rótulos e destinos.
- [ ] Criar `Header` fixo com logo, nav desktop, CTA e menu mobile.
- [ ] Rodar `npm run build` e confirmar 0.

### Task 2: Integração e espaçamento

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/sections/Hero.tsx`
- Modify: `src/styles/global.css`

- [ ] Montar `<Header />` antes de `<main>`.
- [ ] Subir o conteúdo do hero para não ficar sob o header.
- [ ] Adicionar `scroll-margin-top` nas seções e no rodapé.
- [ ] Rodar `npm run build`, `npm run check` e `npm run lint`.

### Task 3: Prova no navegador e docs

**Files:**
- Modify: `coord/STATUS.md`
- Modify: `docs/arquitetura.md`

- [ ] Abrir 375, 768 e 1280 px no Chrome headless.
- [ ] Conferir ausência de rolagem horizontal, menu abrindo e links chegando à seção.
- [ ] Registrar decisão 28 e o componente na arquitetura.
