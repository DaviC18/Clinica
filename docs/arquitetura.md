# Arquitetura: site da Clínica Luciana Salgado

Dono: Arquiteto. Implementa a SPEC; se algo aqui conflitar com a SPEC, a SPEC vence.

**Estado deste documento.** O site anterior foi apagado de propósito e o projeto recomeçou de um scaffold novo de `npm create vite@latest`; a página já está implementada. Direção visual, layout e regras continuam valendo. Números marcados como do stub nas seções 7 e 8 são o piso do scaffold; quando o texto diz "site implementado", vêm do build atual. O que vem da rodada anterior aparece como "rodada anterior" e não vale como medição do código de hoje. O projeto passou a ocupar a raiz do repositório; referências de medição a `site/` são históricas.

## 1. Direção visual: "A fenda de luz"

**Cena de uso (hipótese de projeto, não dado da clínica).** Paciente mais velho, ou a filha que marca a consulta por ele, abre o site no celular depois de clicar em um anúncio, em ambiente claro, com pressa. Por isso: texto grande, contraste alto, WhatsApp visível sem rolar.

**Ideia.** O momento mais marcante de uma consulta de olhos é a lâmpada de fenda: sala escura, filtro de cobalto, uma fenda fina de luz atravessando uma lente. A página começa nessa sala e "acende a luz" ao rolar. O site de oftalmologia padrão é branco, azul-claro, foto de banco e grade de cartões; o oposto previsível é preto com dourado. Este não é nenhum dos dois, nem creme com serifa.

**As três assinaturas (e só estas três):**

1. **A fenda (3D, hero):** uma linha vertical de luz atravessa uma lente de vidro e se abre em leque discreto. Não há globo ocular: olho realista em close incomoda paciente.
2. **A abertura (GSAP):** ao sair do hero, a fenda se alarga até revelar `diferenciais`, que é a sala com a luz acesa. Em `cta-final` o gesto se inverte e a página volta ao escuro. É o único momento de scrub da página.
3. **A tabela (tipografia, `diferenciais`):** os cinco diferenciais são compostos como as linhas de uma tabela de acuidade, em tamanho decrescente. Todo paciente reconhece. Sem cartões com ícone.

**Acolhimento** vem da fonte de corpo, da foto da médica, da frase curta na linguagem do paciente, das formas redondas de lente nos botões e do espaço generoso. Não vem de cor pastel.

**Recusas:** cartões iguais de ícone + título + texto como estrutura da página; rótulo pequeno acima de título; numeração de seções; texto em gradiente; vidro decorativo; sombra colorida sem deslocamento; ícone desenhado à mão misturado com lucide; carrossel de depoimentos.

### Cor (estratégia: comprometida)

| Token | Valor | Papel |
|---|---|---|
| `noite` | `#0A1050` | Hero, `cta-final`, `rodape` |
| `cobalto` | `#16238F` | `avaliacoes` |
| `cobalto-vivo` | `#2A3DD6` | Link e foco em fundo claro |
| `porcelana` | `#F6F7FC` | Fundo claro principal |
| `nevoa-clara` | `#E7EAF8` | Fundo claro alternado |
| `nevoa` | `#C9D1F2` | Texto secundário em fundo escuro |
| `tinta` | `#0B1040` | Texto em fundo claro |
| `tinta-suave` | `#3E4678` | Texto secundário em fundo claro |
| `fluor` | `#84EB4F` | **Só ação primária.** Cor da fluoresceína sob filtro de cobalto; próxima o bastante do verde do WhatsApp |
| `ambar` | `#FFC56E` | Estrelas e calor da luz em fundo escuro |
| `fluor-escuro`, `ambar-escuro` | `#1F6B12`, `#8A5200` | Mesmos papéis em fundo claro, quando for texto ou ícone |

Contrastes calculados de novo sobre `tokens.css`: `porcelana/noite` 16,3; `nevoa/noite` 11,5; `nevoa/cobalto` 8,3; `tinta/fluor` 12,0; `ambar/noite` 11,2; `tinta/porcelana` 16,9; `tinta-suave/porcelana` 8,3; `tinta-suave/nevoa-clara` 7,4; `cobalto-vivo/porcelana` 7,2; `ambar-escuro/porcelana` 6,0; `fluor-escuro/porcelana` 6,2.

**Armadilha:** `fluor/porcelana` é 1,4. Em fundo claro, o botão `fluor` leva borda de 1 px `tinta` e texto `tinta`. Nunca use `fluor` como cor de texto ou ícone sobre fundo claro.

### Tipografia (2 famílias, self-hosted)

- **Corpo: Atkinson Hyperlegible Next.** Desenhada pelo Braille Institute para leitores com baixa visão, distingue letras e números parecidos. É a escolha certa para este público, não um enfeite.
- **Títulos: Hepta Slab, peso 300 a 500.** A serifa quadrada lembra as letras das tabelas de acuidade antigas e dá ao site uma voz que os concorrentes não têm. Testada em 375 px sobre `noite`: legível e com caráter.

Corpo nunca abaixo de 18 px no celular; só o texto legal desce a 15 px. Título máximo 84 px. Medida de leitura `max-w-texto` (38 rem). Títulos com `text-balance`; texto corrido com `text-wrap: pretty` (`p`, `li`, `dd`, `blockquote`, `figcaption`, `summary`), o que evita viúvas. O corpo usa `overflow-wrap: break-word`, nunca `anywhere`: palavra só parte quando não cabe. `SemQuebra` mantém telefone, CEP, CNPJ e palavras compostas inteiros no hífen.

**Números (F11).** O zero da Atkinson é cortado e lembra Ø, inclusive com `tnum`, e o arquivo instalado não tem variante sem corte (recursos: `ccmp frac pnum tnum kern mark mkmk`). Por isso os dígitos 0 a 9 usam a Hepta Slab em todo texto de corpo, sem terceira família e sem download extra: o `@font-face` `Numerais Hepta` em `tokens.css` reaproveita o mesmo arquivo latin dos títulos, com `unicode-range` só para dígitos e `size-adjust: 90%`.

- **Token:** `--fonte-corpo`, ou seja, as classes `font-corpo` e o padrão do `html`. Não há classe nova nem `<span>` em volta de número; dados de `src/data/` ficam como estão.
- **Não use `tabular-nums`:** o `tnum` da Hepta é largo e abre buracos em "07h–21h".
- **Não defina `font-family` fora dos tokens:** isso anula a troca dos dígitos.

## 2. Tokens

`src/styles/tokens.css` guarda os valores. `tailwind.config.ts` só aponta para `var(--…)`. Para mudar um valor, mude no `tokens.css`.

Tailwind 4 lê `tailwind.config.ts` via `@config` em `src/styles/global.css`. Mantenha a ordem das três primeiras linhas desse arquivo: `@import 'tailwindcss'`, `@import './tokens.css'`, `@config '../../tailwind.config.ts'`. O plugin é `@tailwindcss/vite`. As fontes são importadas por `tokens.css`, então não as importe de novo em `main.tsx`.

| Tipo | Classes |
|---|---|
| Texto | `text-legal`, `text-corpo`, `text-corpo-g`, `text-titulo-3`, `text-titulo-2`, `text-hero` |
| Fonte | `font-display`, `font-corpo` |
| Espaço | `px-gutter`, `py-secao`, `gap-bloco`, `min-h-toque`, `min-w-toque` (52 px) |
| Largura | `max-w-pagina` (76 rem), `max-w-texto` (38 rem) |
| Forma e sombra | `rounded-suave`, `rounded-full`, `shadow-flutuante` |
| Movimento | `duration-rapido`, `duration-medio`, `ease-foco` |

Pontos de quebra: padrão do Tailwind. Base é 375 px, `md` é 768 px, `xl` é 1280 px. Escreva sempre primeiro a base.

Superfícies do navegador já têm tema em `global.css` (`::selection`, foco). Em fundo escuro o foco usa `fluor`: aplique `focus-visible:outline-fluor` nas seções `noite` e `cobalto`.

## 3. Layout por ID

Ritmo de fundo: `hero` noite, `diferenciais` porcelana, `medica` nevoa-clara, `servicos` porcelana, `avaliacoes` cobalto, `horarios` porcelana, `faq` nevoa-clara, `cta-final` noite, `rodape` noite. Toda seção usa `px-gutter py-secao` e conteúdo em `mx-auto max-w-pagina`.

### `header`

- Componente `Header` montado antes de `<main>`; fixo no topo, fundo `noite`, borda inferior `cobalto`, `z-50`.
- **375:** marca (ícone de olho do favicon + nome oculto), botão de menu e, dentro do menu, os seis links e o CTA "Agendar".
- **768:** nome da clínica visível; CTA "Agendar" no header; menu ainda recolhido.
- **1024 a 1279:** menu recolhido, porque a lista completa ainda não cabe ao lado da marca e do CTA. O botão de menu continua visível.
- **1280 em diante (`xl`):** lista horizontal com Por que aqui, Sobre, Serviços, Avaliações, Horários e Dúvidas; menu deixa de aparecer.
- Links fecham o menu mobile ao clicar; `Escape` também fecha. `aria-expanded` e `aria-controls` no botão.
- O CTA reutiliza `CtaWhatsApp`: sem WhatsApp confirmado, aponta para `tel:` e mostra `[CONFIRMAR]`. No header ele usa `compacto` e `semIcone` para caber em uma linha de 52 px; no menu mobile mantém o ícone.
- Hero compensa o header com topo de 96 px (375) e 112 px (`md`); seções e rodapé usam `scroll-margin-top` de 4,5 rem (375) e 5,5 rem (`md`).

### `hero`

- **375:** `min-h-svh`, coluna, conteúdo alinhado embaixo (`justify-end`). Terço superior livre para a fenda. O hero não repete a marca. Ordem: `h1`, especialidade, nota 5,0 (606) com estrela `ambar`, CTA WhatsApp em largura total (`min-h-toque`), `eyebrow` logo abaixo do CTA, link "Ligar" por último. Em 375 × 667 cabe inteiro na primeira dobra; se não couber, reduza o espaço superior, nunca o CTA.
- **768:** mesma coluna, texto com `max-w-[34rem]`, fenda à direita.
- **1280:** duas colunas 7/5. Texto à esquerda centrado na vertical (`xl:justify-center`); CTAs em linha, com o telefone ao lado do CTA; `eyebrow` abaixo do CTA, dentro da coluna do botão; fenda ocupa a coluna direita de ponta a ponta na altura.
- CRM e RQE (ou `[CONFIRMAR]`) ficam junto do nome da médica e da especialidade, também no hero (regra CFM).
- O campo `eyebrow` de `conteudo.md` ("Oftalmologia em Volta Redonda/RJ") fica em `text-corpo`, logo abaixo do CTA de WhatsApp e separado do `h1`. Não volte para o topo do hero nem componha como rótulo pequeno colado acima do título. O hero não repete a marca: ela aparece no rodapé, no `<title>` e nos metadados.

### `diferenciais`

- **375:** cinco linhas centradas em Hepta Slab, tamanho decrescente: de `text-titulo-2` até `text-titulo-3` (nunca abaixo disso). Cada linha tem uma explicação curta em `text-corpo` `tinta-suave` logo abaixo. Sem ícones, sem caixas.
- **768:** igual, com mais respiro entre linhas.
- **1280:** `h2` à esquerda acima da tabela; cada linha ocupa a largura toda em 12 colunas, com o diferencial em 7/12 e a explicação em 5/12, alinhados pela base e separados por borda superior de 1 px `nevoa`.
- `h2` obrigatório, mesmo que discreto.

### Estado `[CONFIRMAR]`

Componente único `Confirmar`: fundo `ambar`, texto `tinta`, `rounded-suave`, peso 600, nunca escondido e nunca menor que `text-legal`.

**WhatsApp sem confirmação (estado atual de `fatos.json`):** um componente único `CtaWhatsApp` lê `whatsapp.confirmado`.

- `true`: `<a href="https://wa.me/...">`.
- `false`: sem nenhum link `wa.me`. O botão mantém o rótulo e a aparência `fluor`, contém o `Confirmar` visível e aponta para `tel:` do telefone fixo, para que o clique ainda gere contato. É o mesmo componente em `#hero` e `#cta-final`. Trocar o estado precisa ser só mudar `fatos.json`.

### `medica`

- **375:** foto retrato 4:5 sangrada nas laterais, depois nome em `text-titulo-2`, linha `Oftalmologista · CRM … · RQE …`, formação em lista ordenada no tempo, idiomas.
- **768:** foto 5/12 à esquerda, texto 7/12.
- **1280:** igual, com foto maior e fixa (`sticky`) enquanto o texto rola, se o texto for mais alto que a foto.
- Sem foto (decisão 18): nenhuma moldura vazia. `#medica` mostra nome e registros, com `[CONFIRMAR]` discreto para a foto. Reserve `width`/`height` só quando a imagem existir. Logo: o header usa o ícone de olho do favicon + nome (decisão 28); não há arquivo de logo da clínica.
- Itens de formação e idiomas com `[CONFIRMAR]` ficam na lista como estão em `conteudo.md`.

### `servicos`

- **375:** cinco grupos empilhados (Consultas, Cirurgia, Exames, Crianças, Pequenos procedimentos), cada um com `h3` e `<dl>`: termo em peso 600 + explicação curta. `Exames` mostra os 6 mais procurados e o restante dentro de `<details>` ("Ver todos os exames"); o conteúdo permanece no HTML para o Google.
- **768:** itens em duas colunas dentro de cada grupo.
- **1280:** nome do grupo fixo em coluna esquerda (3/12, `sticky`), itens em duas colunas à direita (9/12), linhas finas de 1 px `nevoa-clara` entre grupos.

### `avaliacoes`

- **375:** nota 5,0 e total, depois depoimentos empilhados. O primeiro em Hepta Slab `text-titulo-3`, os demais em `text-corpo-g`. Link para o Google ao final, com `min-h-toque`. Sem carrossel: paciente idoso não descobre gesto lateral.
- **768:** primeiro depoimento em largura total, demais em 2 colunas.
- **1280:** primeiro depoimento em 5/12 à esquerda, demais em 2 colunas à direita.

**Estado atual, sem depoimentos:** `avaliacoes.lista` está vazia de propósito. A seção mostra nota, total, `[CONFIRMAR]` e o link para o Google em destaque, com o placeholder de `conteudo.md`. Nunca escreva depoimento. Layout acima vale quando a lista chegar.

### `horarios`

- **375:** tabela real (`<table>`, `<caption>`, `scope`), endereço, link "Abrir no mapa", acessibilidade em lista, mapa abaixo.
- **768:** tabela e endereço lado a lado; mapa em largura total abaixo.
- **1280:** tabela e endereço em 5/12, mapa em 7/12 com a altura da coluna.
- Destaque do dia de hoje só depois da hidratação (`useEffect`), para não causar erro de hidratação.
- **Mapa:** fachada estática com botão "Carregar mapa"; o `<iframe>` entra só após o clique. Evita chamadas ao Google antes de consentimento e protege o Lighthouse. O link "Abrir no mapa" funciona sem isso.

### `faq`

- **375:** `<details>`/`<summary>` empilhados, `summary` com `min-h-toque` e ícone lucide `Plus` que gira com CSS.
- **768 e 1280:** coluna única `max-w-texto`; em 1280, título da seção à esquerda (4/12) e perguntas à direita (8/12).

### `cta-final`

- **Todas as larguras:** fundo `noite`, centralizado, `h2` em `text-titulo-2`, CTA WhatsApp, telefone como link `tel:`. Em 375 o CTA ocupa a largura total.

### `rodape`

- **375:** coluna: marca, endereço, Instagram, dados legais (`text-legal`). `pb-12`; sem botão flutuante, não há mais folga extra no pé.
- **768:** 2 colunas.
- **1280:** 3 colunas.

### Botão flutuante

Removido a pedido do usuário (decisão 27). `WhatsappFlutuante`, `#whatsapp-float`, a entrada `flutuante` de `conteudo.md` e o `pb-28` do rodapé não existem mais. Os CTAs de WhatsApp ficam em `#hero`, `#servicos`, `#cta-final` e `#faq`.

### Contrato de markup (pedido do Validador)

- Cada depoimento: `<figure>` dentro de `#avaliacoes`, com `<blockquote>` e o primeiro nome no `<figcaption>`.
- Cada pergunta do FAQ: `<details>`/`<summary>`.
- Nenhum `opacity:0` ou `visibility:hidden` inline no HTML pré-renderizado de `#hero`.
- Mapa: botão que carrega sob clique (permitido pelo Validador), com `loading="lazy"` no `<iframe>`.
- Um único `h1`, um `h2` por seção. `section` com o ID exato da SPEC.

### Limites de caracteres para o Pesquisador

O `conteudo.md` entregue cabe nestes limites, que são referência para ajustes futuros.

| Campo | Máximo | Motivo |
|---|---|---|
| `hero` título | 60 | 40 px em 375 cabem cerca de 16 caracteres por linha |
| `hero` subtítulo | 90 | CTA precisa caber na primeira dobra |
| `diferenciais` linha | 28 | Linha da tabela, idealmente em uma linha só |
| `diferenciais` explicação | 110 | |
| `medica` texto corrido | 420 | Formação vai em lista à parte |
| `servicos` explicação do termo | 170 | |
| `avaliacoes` depoimento | 280 | Texto literal: se passar, escolha outro; não corte sem `[…]` |
| `faq` pergunta / resposta | 60 / 240 | |
| `cta-final` título / apoio | 50 / 100 | |

## 4. Pré-renderização

**Solução: `vite-react-ssg` 0.9.2, entrada `vite-react-ssg/single-page`.** Provado sobre o scaffold novo, com Vite 8, React 19 e TS 6: `dist/index.html` traz o texto dentro de `#root` e `title` e `meta` no `<head>`. Em Chrome `--headless=new`, a página hidrata sem erro de hidratação, em `vite preview` e em `vite dev`. JSON-LD via `Head` está em `src/components/Metadados.tsx`, com `MedicalClinic` e `Physician`; foi validado no ciclo 1 sobre o JSON-LD do build: 0 erros e 0 avisos no validator.schema.org.

Regras:

- `src/main.tsx` precisa exportar `createRoot = ViteReactSSG(<App />)`, e `index.html` manter `<script type="module" src="/src/main.tsx">`.
- `build` é `tsc -b && vite-react-ssg build`, porque o scaffold usa project references. `dev` é `vite`.
- `prebuild` roda `src/data/gerar-dados.mjs` (decisão 10) quando o arquivo existe. Sem o arquivo, avisa e segue; com o arquivo, uma falha do gerador derruba o build (testado com saída 3). Não há `predev`: em `npm run dev`, rode `npm run prebuild` à mão depois de mudar `docs/`.
- `prebuild` usa `if [ -f ... ]` de shell POSIX. Funciona em Linux e na Vercel, não em cmd do Windows.
- **Metadados:** use `Head` de `vite-react-ssg/single-page`. Não instale `react-helmet-async` direto: o SSG traz a 1.3.0 embutida e coleta o `<head>` por ela. A 3.x no projeto criaria uma segunda instância que o SSG não enxerga. Por isso a SPEC é atendida pelo "equivalente do SSG".
- Sem `react-router-dom`: página única. É peer opcional do pacote.
- **Código de renderização roda em Node.** `window`, `document`, `matchMedia` e `localStorage` só dentro de `useEffect`. A primeira renderização no cliente precisa ser igual à do servidor.

## 5. 3D

Arquivos em `src/three/`. O único ponto de entrada é um `lazy(() => import('../three/Cena'))` montado por um componente porteiro (`components/PorteiroCena.tsx`).

**Camadas do hero, de trás para frente:**

1. Imagem estática da fenda (`public/img/fenda-*.avif` e `.webp`, `<picture>`), sempre presente no HTML. É o fallback e o que se vê antes do 3D. Gere capturando a própria cena em headless, para o fallback ser igual ao 3D. Largura máxima 800 px, 40 KB. Use `aria-hidden` e `alt=""`.
2. Canvas, `position:absolute`, `aria-hidden`, `pointer-events:none`, opacidade 0 até o primeiro quadro; depois transição CSS de 600 ms.
3. Texto e CTAs, que nunca dependem das camadas acima.

Imagem e canvas ficam no mesmo contêiner `.fenda-luz`, filho direto de `#hero`, com `mix-blend-mode: screen`. O fundo `noite` é a base; o preto da cena e as áreas escuras da imagem somam zero. A imagem estática sai por transição de opacidade de 600 ms quando o canvas fica pronto. Esse contêiner é o que sofre o `scale` decorativo do hero em `xl`; o canvas não vira uma camada separada.

**Decisão (Orquestrador, STATUS, item 8).** A meta de Performance da regra 4 foi medida em 88 sem a cena e 64 com a cena. Vale a regra 7: quem decide é um porteiro por capacidade real do aparelho. Celular fraco fica na imagem estática, sem baixar o chunk three. Adiar a cena só para sair da janela de medição não é aceito, porque melhora a nota sem reduzir o custo.

**Proibido detectar Lighthouse, PageSpeed, headless ou user agent.** O porteiro lê só capacidade, e a mesma regra vale para qualquer visitante.

**O porteiro decide em `useEffect`, nesta ordem, do teste mais barato ao mais caro. Se qualquer item falhar, fica a imagem e o chunk three não é baixado:**

1. `prefers-reduced-motion: reduce`.
2. `navigator.connection.saveData`, ou `effectiveType` `slow-2g`/`2g`.
3. `navigator.deviceMemory < 4` ou `hardwareConcurrency < 4`. API ausente não reprova (iOS não expõe `deviceMemory`).
4. Sonda WebGL: `getContext('webgl2', { failIfMajorPerformanceCaveat: true })` em canvas temporário, e recusa de renderer por software lido em `WEBGL_debug_renderer_info` (SwiftShader, llvmpipe e afins). A opção `failIfMajorPerformanceCaveat` sozinha não exclui SwiftShader no Chrome testado.
5. Sondagem curta de CPU, por último: laço de trabalho fixo medido com `performance.now()`, em `requestIdleCallback`, em uma tarefa abaixo de 50 ms. Resultado abaixo do limiar reprova.

Os itens 1 a 3 rodam na hidratação. Os itens 4 e 5 rodam em idle depois de `load`, em tarefas separadas.

**Sonda calibrada: limiar de 4,5 voltas/ms.** O porteiro mede a CPU com um laço fixo de aritmética e memória: **12 ms de aquecimento + 30 ms de medição**, e compara as voltas por ms com **4,5**. Abaixo disso, fica a imagem e o chunk three não é baixado. A sonda e o limiar não mudaram desde a calibração (STATUS do Desenvolvedor).

Medição em 5 aberturas por taxa de CPU, Chrome 157 `--headless=new` sobre `vite preview`, em um único notebook:

| Taxa de CPU | Aberturas aprovadas | Voltas/ms |
|---|---|---|
| 1x | 5 de 5 | 5,73 a 6,70 |
| 1,5x, 2x, 4x, 6x | 0 de 5 | máximo 4,13 |

O limiar de 4,5 separa as duas faixas. Continua sendo calibração de um único notebook, nunca de celular real, e depende do laço exato de `sondarCpu` em `PorteiroCena.tsx`: sonda reescrita exige recalibrar antes de reaproveitar o número.

**Margem O1 (ciclo 2).** A sonda deu **4,44 voltas/ms** sob CPU 4x via CDP, recusa por **0,06** contra o limiar de 4,5. No mesmo aparelho nominal a cena alternou entre carregar e ficar na imagem, mas as duas rotas passaram de 85 no Lighthouse (B 4x = 96). O limiar não mudou; fica registrada a margem estreita.

**Limitação conhecida da sonda:**

- O modo simulado do Lighthouse não desacelera a CPU real. A sonda vê a máquina inteira e aprova; o Lighthouse multiplica o custo depois. Sem detectar a ferramenta, o que é proibido, a sonda não tem como recusar nesse modo. Por isso a cena é medida com `--throttling-method=devtools` (decisão 13), e a nota simulada com GPU e cena vai explícita no relatório final.
- A sonda varia com a carga da máquina: a mesma máquina pode aprovar e recusar em aberturas seguidas. Quem recusa fica na imagem, sem erro. Para demonstração ao vivo, feche outros programas.
- Quantos celulares intermediários passam é hipótese não medida.

**Quando carregar:** quem passa carrega o three em idle depois de `load` (`requestIdleCallback`, `timeout: 2500`; sem ele, `setTimeout` de 300 ms), e só com o hero visível.

**Em execução:**

- `dpr={[1, 1.5]}`, sem sombras, sem pós-processamento.
- `resize={{ offsetSize: true }}` no `Canvas`: a medida vem de `offsetWidth`/`offsetHeight`, não do retângulo já transformado pelo `scale` do contêiner do hero.
- Sem `MeshTransmissionMaterial`: é caro no celular. A lente é `ShaderMaterial` próprio com refração simulada; o feixe é plano aditivo com shader.
- `frameloop` passa a `never` quando o hero sai da tela (`IntersectionObserver`) ou a aba fica oculta.
- Vigia de quadros: média abaixo de 24 fps nos primeiros 90 quadros desmonta o canvas e fica a imagem. Trate `webglcontextlost` do mesmo jeito.
- Use `drei` só com import nomeado e só se poupar código.

**Estado do drei.** Está instalado (10.7.9), porque a SPEC o lista na stack. A cena atual (`src/three/Cena.tsx`) não importa drei: o pacote fica no `package.json` e não entra no bundle. Medido no stub, `Float` somava 0,35 KB gzip ao chunk (243,0 contra 242,6 KB, pelo Vite), e quase todo o chunk é o three que o R3F arrasta. Importe `Float` só se o movimento pedir.

**Aviso conhecido.** Com three 0.187 e R3F 9.8.2, o console mostra `THREE.Clock: This module has been deprecated`, vindo de dentro do R3F. É `warning`, não `error`, e aparece só depois de carregar a cena. Sem ação até o R3F mudar.

**Medição (decisões 8 e 13):** relate sempre as duas notas do Lighthouse, dizendo qual é qual. A meta de Performance vale para o cenário sem cena, pelo comando de `docs/validacao.md`. A cena é medida com GPU real e CPU realmente limitada (`--throttling-method=devtools`). Lighthouse sem GPU ou com CPU limitada tende a reprovar no porteiro e mede a imagem: isso é consequência da capacidade, não detecção da ferramenta, e não vale como nota da cena. Medições do site implementado (STATUS): A sem cena 93; B com CPU 4x, porteiro recusa e mede a imagem 87; B com CPU 1x, cena carregada 90; C simulado com cena 72, que vai explícito no relatório ao usuário. A e B são do build final; C é anterior às correções do ciclo 1.

## 6. Animação (GSAP)

- `gsap` e `ScrollTrigger` entram por `import()` dentro de `useEffect`, depois da hidratação. Ficam fora do JS inicial.
- **Conteúdo visível por padrão.** Nada de `opacity-0` em CSS ou no HTML. Sem JS, tudo aparece.
- **Nenhuma animação em `#hero` ou em CTA.** Links são `<a href>` reais: funcionam antes de hidratar. Tweens só atingem `[data-revelar]`, e CTA nunca recebe esse atributo.
- Toda animação dentro de `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`.
- **Revelação abaixo da dobra:** `gsap.from` com `y: 16`, `opacity: 0`, até 500 ms, `power3.out`, `clearProps: 'all'`. Dispara uma vez por elemento, com `IntersectionObserver` e `unobserve` ao entrar. Só na `medica`, nos grupos de `servicos` e em `avaliacoes`. Não aplique em todas as seções da mesma forma.
- **Assinatura:** o gesto recorta uma faixa sem texto dentro de `#diferenciais`, não a seção. `[data-fenda]` é uma `div` `aria-hidden`, `h-[28svh]`, `bg-porcelana`, antes do conteúdo. O `clip-path` vai de `inset(0% calc(50% - 1px))` a `inset(0% calc(0% - 0px))`, com `scrub` do topo da faixa (`top bottom`) até o fim dela (`bottom bottom`), sem `pin`. O texto entra depois que a faixa termina, já aberta, e nunca é recortado.
- **Em `cta-final`:** `[data-cortina]`, `div` `aria-hidden`, `h-[18svh]`, `bg-nevoa-clara`, antes da seção, faz o inverso: de `inset(0% calc(0% - 0px))` a `inset(0% calc(50% - 1px))`, com `scrub` de `top 70%` a `bottom 40%`. A faixa se fecha em fenda e revela o `noite`.
- Sem JS ou com `prefers-reduced-motion`, as faixas não são recortadas: em `#diferenciais`, sobram 28svh de espaço claro antes do título; em `#cta-final`, a faixa clara de 18svh continua visível. É limite conhecido, registrado no STATUS.
- Limpeza: `mm.revert()` no retorno do efeito, junto com `observador.disconnect()`.

### Lenis: reprovado

Scroll nativo com `scroll-behavior: smooth` (já em `global.css`, só sem `prefers-reduced-motion`). Motivos: Lenis não atua em toque por padrão, então o ganho no celular é nulo; adiciona trabalho no thread principal a cada quadro; atrapalha ampliação, leitor de tela e a expectativa de quem rola devagar, que é o público deste site.

## 7. Orçamento de bundle

Medido com `npm run check` (gzip nível 9, base 1000). Salvo a linha de ScrollTrigger, que vem do site implementado, os números são do stub do scaffold novo e formam o piso; a página real somou seções, dados e ícones. **Inicial real = tudo que carrega sem interação antes do 3D e do GSAP.**

| Item | Medido | Teto |
|---|---|---|
| JS inicial: `app` 13,7 + `client` (react-dom) 62,9 + `scheduler` 1,6 + runtime 0,4 + inline 0,1 | 78,6 KB (stub, arredondado pelo check) | 200 KB |
| JS incondicional, tudo menos 3D (inicial + `gsap`) | 105,8 KB (stub) | 200 KB |
| CSS inicial | 3,3 KB (stub) | 25 KB |
| `gsap`, carga adiada, sem ScrollTrigger | 27,1 KB (stub) | 50 KB |
| `ScrollTrigger`, carga adiada, medido no site implementado | 17,4 KB | — |
| `three` + R3F + `Float` do drei, carga adiada | 240,2 KB (stub) | 280 KB |
| Fontes baixadas (latin): Atkinson 34 KB, Hepta Slab 71 KB | 105 KB | 120 KB |

No site implementado, o check mede 89,1 KB de JS inicial e 133,8 KB de JS sem 3D (`inicial + gsap`), abaixo dos tetos (STATUS do Desenvolvedor). ScrollTrigger foi medido no arquivo `ScrollTrigger-*.js` do build, em carga adiada junto de `gsap`. O `client` é carregado por `import()` dentro do `vite-react-ssg`, e uma contagem só do que está no HTML esconderia esse peso. `tests/checks.mjs` já soma `client` e `scheduler`.

**Fontes:** `font-display: swap`. Faça preload só de `hepta-slab-latin-wght-normal.woff2` (`import url from '...woff2?url'` e `<link rel="preload" as="font" crossorigin>` no `Head`). Se o CLS passar de 0,05, acrescente `@font-face` de fallback com `size-adjust` em `global.css`.

**Separação de chunks (`vite.config.ts`).** Nenhuma regra manual é necessária: o `lazy(() => import(...))` já põe three, R3F e drei em um chunk próprio, e o único `modulepreload` de `dist/index.html` é o runtime do Rolldown. Não crie `manualChunks` nem grupos em `codeSplitting` sem motivo. Na rodada anterior, um grupo manual puxou `react` para o chunk do three e o transformou em import estático com `modulepreload`. Depois de mudar qualquer coisa nessa área, confira `grep modulepreload dist/index.html`. O chunk leva o nome do arquivo importado; o check o reconhece pelo conteúdo.

`chunkSizeWarningLimit` está em 1000 KB porque o chunk da cena tem cerca de 925 KB sem gzip, por natureza, e sob o porteiro. O limite de verdade é a linha de `three` na tabela acima.

**Se o inicial crescer:** `lucide-react` só com import nomeado; imagens fora do JS; dados em `src/data/` sem duplicar `fatos.json` inteiro.

## 8. Bibliotecas e versões

Instaladas sem `--force`, sem `--legacy-peer-deps` e sem `overrides`, em Node 24.22 e npm 11.19. `npm ci` e build completo foram provados em cópia limpa.

| Pacote | Versão | Motivo |
|---|---|---|
| vite | 8.3.6 | Base (scaffold) |
| react, react-dom | 19.3.1, faixa `~19.3.1` | Base. A faixa fica em `~` porque o R3F 9.8.2 exige `<19.4`; `^` deixaria entrar 19.4 |
| typescript | 6.0.3, faixa `~6.0.3` | Base (scaffold). A 7.0.2 existe no npm, mas a base pedida é TS 6 |
| @vitejs/plugin-react | 6.2.1 | Base (scaffold) |
| tailwindcss, @tailwindcss/vite | 4.3.4 | Base; plugin aceita Vite 8 |
| gsap | 3.15.1 | Base |
| three, @types/three | 0.187.0 | Base |
| @react-three/fiber / drei | 9.8.2 / 10.7.9 | Base |
| vite-react-ssg | 0.9.2 | Pré-renderização; aceita Vite 8 e React 19 |
| lucide-react | 1.69.0 | Base |
| @fontsource-variable/atkinson-hyperlegible-next | 5.3.0 | Fonte de corpo |
| @fontsource-variable/hepta-slab | 5.3.0 | Fonte de títulos |

Nenhuma base precisou ser trocada, e nenhuma incompatibilidade exigiu contorno além da faixa do React.

**`npm audit`:** 10 moderadas, todas na mesma cadeia: `minimatch` (GHSA-g3hv-75wg-m249) via `eslint` e `typescript-eslint`, só de desenvolvimento, nada vai para `dist/`. Vieram com o scaffold. O `audit fix --force` rebaixaria o ESLint um major, então não foi aplicado.

**Nenhuma biblioteca fora da stack foi acrescentada.** `react-helmet-async` direto saiu, conforme a seção 4. Lenis não entra. `beasties` (CSS crítico inline) fica em reserva: só instale se o Lighthouse apontar CSS bloqueando a renderização; a versão exigida é `^0.1.0`.

## 9. Stubs substituídos e estado dos arquivos

- `index.html`: entregue; mantém `lang="pt-BR"` e o `<script type="module" src="/src/main.tsx">`.
- `src/main.tsx`: entregue; mantém o `export const createRoot = ViteReactSSG(...)`.
- `src/App.tsx`: substituído; monta `Header`, as seções, `Metadados` e `iniciarAnimacoes`.
- `src/three/Cena.tsx`: cena real; `CenaStub.tsx` não existe mais.
- `src/styles/global.css`: estendido, com as três primeiras linhas preservadas.

**Implementado:** `src/data/` (`fatos.ts`, `conteudo.ts`, `interface.ts`, `gerar-dados.mjs`), `src/sections/` (uma por ID), `src/components/`, `src/animations/` (`iniciar.ts`, `ocioso.ts`) e `src/three/` (`Cena.tsx`, `shaders.ts`).

**`public/`:** tem `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `img/fenda-800.avif`, `img/fenda-800.webp`, `img/og.jpg`, `robots.txt` e `sitemap.xml`. `/favicon.ico` não dá mais 404. O preload da Hepta (seção 7) está em `Metadados.tsx`.

O `check` roda sobre o build do site implementado.
