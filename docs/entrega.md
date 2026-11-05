# Entrega — site da Clínica Luciana Salgado

Dono: Orquestrador. Estado: **fase 4, entrega final**. Ciclo 2 de validação **APROVADO**.

Documentos de apoio: `docs/arquitetura.md` (decisões técnicas), `docs/validacao.md` (provas e limites), `docs/pendencias-clinica.md` (o que falta receber da clínica).

## 1. Como rodar

Na raiz do repositório:

```bash
npm run build     # tsc -b + prebuild (gera src/data) + vite-react-ssg build
npm run check     # tests/checks.mjs sobre dist/
npm run lint
npm run preview   # serve dist/ em http://localhost:4173/
```

Node usado no build local: v24.22.1. O Vite 8 exige Node moderno; use a mesma versão em CI e na Vercel.

## 2. Números do ciclo 2

| Item | Resultado |
|---|---|
| `npm run build` | 0 erro, sem warning de TypeScript |
| `npm run lint` | 0 |
| `npm run check` | 141 de 141, 0 falha, 0 AVISO |
| JS inicial | 89,0 KB gzip |
| JS sem 3D | 133,7 KB |
| Chunk da cena | 245,2 KB gzip |
| CSS | 5,8 KB |
| Lighthouse A (sem cena) | Performance 100; A11y/BP/SEO 100 |
| Lighthouse B, CPU 4x (com cena) | Performance 96; A11y/BP/SEO 100 |
| Lighthouse B, CPU 2x | 99 |
| Lighthouse B, CPU 1x | 100 |
| Lighthouse C (simulado) | 90; não reprova, registrado |
| JSON-LD | 0 erro, 0 aviso no validator.schema.org |

## 3. O que está pronto

- Pré-renderização com `vite-react-ssg`: o HTML de `dist/` já contém o texto das seções.
- Seções com os IDs da SPEC: `hero`, `diferenciais`, `medica`, `servicos`, `avaliacoes`, `horarios`, `faq`, `cta-final`, `rodape`.
- Cena 3D do hero atrás de porteiro por capacidade: imagem estática por padrão; Three.js só em idle e só em aparelho aprovado.
- Animação de abertura e fechamento da fenda com GSAP/ScrollTrigger; sem movimento quando `prefers-reduced-motion` está ativo.
- WhatsApp, telefone, mapa sob clique, JSON-LD, `robots.txt`, `sitemap.xml`, favicons e `og.jpg`.
- Conteúdo factual vindo de `docs/fatos.json`; textos de `docs/conteudo.md`; nenhum fato da clínica escrito no JSX.
- `[CONFIRMAR]` visível onde falta confirmação da clínica.

## 4. Pendências antes de publicar

1. Responder os 18 marcadores visíveis e os itens fora do site em `docs/pendencias-clinica.md`.
2. Aplicar as respostas, rodar `npm run build && npm run check && npm run lint`.
3. Publicar e conferir o domínio.
4. Testar em celular real e em Safari/iOS.
5. Colher o aceite do usuário ou da clínica.

## 5. Publicação

O projeto é estático depois do build: a Vercel deve usar o preset **Vite**, com `npm run build` e saída em `dist/`. Não há rota de servidor nem rewrite obrigatório; a página é única e já sai pré-renderizada.

Checklist pós-deploy:

- `https://<domínio>/` responde 200 e mostra o texto sem JavaScript.
- `/robots.txt`, `/sitemap.xml`, `/img/og.jpg` e `/favicon.ico` respondem 200.
- O `index.html` publicado traz `title`, `meta description`, Open Graph e JSON-LD.
- Os CTAs de WhatsApp e telefone apontam para o destino correto.
- O mapa só carrega depois do clique.
- Lighthouse mobile no domínio real, cenários A e B.
- `clinicalucianasalgado.com` deixa de responder 404.

## 6. Limites conhecidos

- O1: a sonda de CPU deu 4,44 voltas/ms contra limiar 4,5 sob CPU 4x via CDP. O mesmo aparelho nominal alterna entre cena e imagem; as duas rotas passam de 85.
- O2: obsoleto. O botão flutuante foi removido a pedido do usuário (decisão 27); o rodapé voltou a `pb-12`.
- Lighthouse C = 90 é medição simulada; serve de registro, não de critério.
- Não houve teste em celular real, toque real, Safari ou iOS.
- As capturas de tela não foram lidas por imagem; a validação visual usou DOM, Lighthouse e rede.
- O conteúdo interno do iframe do Google Maps não foi verificado.
- `npm audit`: 10 moderadas, todas na cadeia de desenvolvimento do ESLint, vindas do scaffold; nenhuma vai para `dist/`.

## 7. Critério de pronto da SPEC

| Item | Estado |
|---|---|
| Seções da SPEC com IDs corretos | ok |
| `npm run build` sem erro ou warning TS | ok |
| `npm run check` | ok, 141/141 |
| Lighthouse mobile nas metas | ok (A 100; B 4x 96; A11y/BP/SEO 100) |
| HTML pré-renderizado com o texto | ok |
| Reduced motion e sem WebGL | ok |
| Fatos fora de `docs/fatos.json` | nenhum |
| `[CONFIRMAR]` listados no relatório | ok, em `docs/pendencias-clinica.md` |
| CRM e RQE junto do nome | CRM ok; RQE pendente da clínica |
| Testado em 375, 768 e 1280 px | ok |
| Validador marcou APROVADO | ok, ciclo 2 |
