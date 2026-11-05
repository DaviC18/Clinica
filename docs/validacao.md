# Validação do site da Clínica Luciana Salgado

Dono: Validador. Checklist derivado das seções 3, 4, 5 e 9 da `SPEC.md`.

**Estado: ciclo 2, APROVADO.** Resultados medidos no build de 19:49, com Chrome 157 `--headless=new` contra `npm run preview`. Detalhes em "Relatórios de ciclo". A rodada do código apagado está arquivada no fim do documento e vale só como armadilhas. **Nota de layout:** os relatórios dos ciclos 1 e 2 foram escritos quando o projeto ficava em `site/`; hoje ele ocupa a raiz do repositório. Caminhos `site/...` nesses relatórios são históricos.

## Como verificar

| Método | Comando | Observação |
|---|---|---|
| Auto | `npm run build && npm run check` | `tests/checks.mjs` sobre `dist/`. Sai com 1 se houver FAIL. AVISO e INFO não reprovam, mas são lidos em todo ciclo. Chunks são reconhecidos pelo conteúdo, nunca pelo nome. |
| Lighthouse | Ver "Medição de Performance" abaixo | Configuração mobile padrão. Rodar 3 vezes e registrar a mediana. |
| Navegador | Chrome `--headless=new` contra `npm run preview`, nunca contra `npm run dev` | Procedimentos P1 a P8. O Playwright MCP com janela aborta nesta máquina (decisão 7). |
| Leitura | Revisão humana do texto ou do código | Quando nenhuma ferramenta decide. |

Resultado de cada item: `pendente`, `ok`, `falha (ciclo N)`. Na coluna "Verificação", "Auto" cita o grupo do check na saída.

### Medição de Performance (decisões 8 e 13)

Servidor: `npm run build && npm run preview`. Sempre registrar os três cenários, dizendo qual é qual, e se a cena carregou em cada execução. Para saber se carregou, procure na rede do JSON o chunk que o check lista em "Three.js existe em chunk lazy separado".

| Cenário | Comando | Papel |
|---|---|---|
| A. Sem cena | `npx lighthouse http://localhost:4173 --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=/tmp/val-lh-a.json --chrome-flags="--headless"` | **Critério.** Performance ≥ 85. Também vale para Acessibilidade, Boas práticas e SEO ≥ 90. |
| B. Cena, CPU realmente limitada | Mesmo comando com `--throttling-method=devtools --chrome-flags="--headless=new --use-angle=gl --enable-gpu --ignore-gpu-blocklist"` | **Critério.** O modo simulado não desacelera a CPU, então a sonda do porteiro só enxerga o aparelho neste modo. Repetir com `--throttling.cpuSlowdownMultiplier` 4, 2 e 1. Toda série em que a cena carregar precisa dar ≥ 85. Série em que o porteiro recusar conta como imagem, não como nota da cena. |
| C. Cena, throttling simulado | Mesmas flags de GPU do cenário B, sem `--throttling-method` | **Não é critério, mas nunca fica escondida.** A nota vai no relatório do ciclo e no relatório final ao usuário, com a explicação do porquê. Referência no código apagado: 70. |

Proibido detectar Lighthouse, PageSpeed, headless ou user agent no código (decisão 8). Conferir com `grep -rniE 'lighthouse|pagespeed|headless|userAgent' src`, que não pode achar nada.

## Checklist

### SPEC 3: regras inegociáveis

| # | Item | Verificação | Resultado |
|---|---|---|---|
| R1.1 | Nome da médica, palavra "médica" junto do CRM, RQE (ou `[CONFIRMAR]`) e especialidade juntos em `#hero`, `#medica` e `#rodape` | Auto `cfm` | ok |
| R1.2 | Sem "o melhor", "a melhor", "melhor clínica" e afins, "garantido", "garantia", "antes e depois" (também `x`, `/`, `-`), R$, promoção, desconto, grátis, "referência", "perfeito", inclusive em alt, JSON-LD e depoimentos | Auto `cfm` | ok |
| R1.3 | Sem promessa de resultado escrita com outras palavras | Leitura de todo o texto; os AVISO do check dão a lista inicial | ok |
| R1.4 | Sem imagem de antes e depois | Leitura das imagens em `public` | ok |
| R1.5 | Exceção única de "antes e depois": "de beber água", no teste de sobrecarga hídrica (decisão 9). "Antes e depois da cirurgia" reprova | Auto `cfm` + Leitura dos INFO "Termo em contexto permitido" | ok |
| R1.6 | `#rodape` com registro da clínica no CRM e Diretor Técnico-Médico, com número ou `[CONFIRMAR]` (Resolução CFM 2.336/2023, art. 5º, I; `conteudo.md`) | Auto `cfm` | ok |
| R2.1 | Com `avaliacoes.lista` vazia: nenhum depoimento (blockquote, q, figcaption) e placeholder `[CONFIRMAR]` visível. Com lista preenchida: de 3 a 6, literais, com primeiro nome | Auto `avaliacoes` | ok |
| R2.2 | Link "ver todas as avaliações no Google", com esse texto | Auto `avaliacoes`; abrir o link em P6 | ok |
| R2.3 | Nenhum número, prêmio ou convênio fora de `fatos.json` | Auto `fatos` (telefone, CNPJ, CRM, RQE, total de avaliações e convênios conhecidos) + AVISO "Números no HTML" + Leitura | ok |
| R2.4 | Fato `a_confirmar` só dentro de `[CONFIRMAR: ...]` ou com o marcador logo depois (fellowship, PUC-Rio, Gamboa, pagamento, espaço seguro trans, todas as idades, PAM). Idiomas estão confirmados desde a revisão do Pesquisador; o check volta a exigir o marcador se `medica.idiomas` deixar de estar confirmado; Dra. Erica e Instagram da médica fora do site | Auto `fatos` | ok |
| R3.1 | Mobile first: 375 px sem rolagem horizontal, CTAs alcançáveis, nenhum elemento fixo cobrindo texto ou CTA | Navegador P1 | ok (ciclo 2) |
| R4.1 | Lighthouse mobile, cenário A (sem cena): Performance ≥ 85 | Lighthouse | ok |
| R4.2 | Lighthouse mobile, cenário A: Acessibilidade, Boas práticas e SEO ≥ 90 | Lighthouse | ok |
| R4.3 | Lighthouse mobile, cenário B (cena, `--throttling-method=devtools`): toda série com a cena carregada ≥ 85 | Lighthouse | ok |
| R4.4 | Lighthouse mobile, cenário C (cena, simulado): nota registrada e levada ao relatório final. Não reprova | Lighthouse | relatado: 90 (ciclo 2), não reprova |
| R4.5 | JS inicial ≤ 200 KB gzip, somando script, script inline, modulepreload, imports estáticos e o react-dom e o scheduler que o SSG carrega por `import()` (decisão 6). Teto também aplicado a todo o JS sem 3D, com GSAP | Auto `bundle` | ok |
| R4.6 | Three.js em chunk separado, fora de script, modulepreload e imports estáticos | Auto `bundle` | ok |
| R4.7 | Three.js carregado só depois do primeiro paint | Navegador P2 | ok |
| R4.8 | Texto e CTAs do hero aparecem antes de animação ou 3D | Auto `conteudo` (sem estilo ou classe que oculte no HTML) + Navegador P2 | ok |
| R5.1 | Termo técnico sempre com explicação curta | Auto `conteudo` (serviços) e `fatos` (fellowship) + Leitura de `#diferenciais` e `#faq` | ok |
| R6.1 | Sem `<form>`, `<input>`, `<textarea>`, `<select>` no HTML | Auto `lgpd` | ok |
| R6.2 | Nenhum formulário criado no cliente depois da hidratação | Navegador P3 | ok |
| R7.1 | `prefers-reduced-motion`: sem 3D e sem animação longa | Navegador P4 | ok |
| R7.2 | Sem WebGL ou em celular fraco: imagem estática no lugar da cena, por capacidade real (decisão 8) | Auto `conteudo` (imagem no HTML, sem canvas) + Navegador P5, P8 | ok |
| R7.3 | Animação não atrasa o clique no WhatsApp | Navegador P6 | ok |
| R7.4 | Com `whatsapp.confirmado=false` (decisão 4): nenhum `wa.me`; CTA `tel:` do fixo em `#hero`, `#cta-final` e `#whatsapp-float`, com `aria-label` que diz que liga e contém o rótulo visível; `[CONFIRMAR]` visível em `#hero` e `#cta-final`, só no `aria-label` no flutuante em tela estreita (decisão 11); nenhum "WhatsApp" solto no texto. Com `true`: `wa.me` do número dos fatos nos três | Auto `whatsapp` + Navegador P1 | ok |

### SPEC 4: stack

| # | Item | Verificação | Resultado |
|---|---|---|---|
| S1 | Vite, React, TypeScript, Tailwind, GSAP, Three.js, R3F e drei presentes; bibliotecas extras justificadas em `arquitetura.md` | Auto `stack` + Leitura de `package.json` | ok |
| S2 | HTML final pré-renderizado com o texto | Auto `prerender`, `secoes` | ok |
| S3 | Title, description, Open Graph, `lang="pt-BR"`, viewport, charset nos primeiros 1024 bytes | Auto `seo` | ok |
| S4 | JSON-LD válido com `MedicalClinic` e `Physician`, dados conferem; `geo` opcional, só com as coordenadas de `fatos.json`; sem erro em validator.schema.org | Auto `jsonld` + validador oficial | ok (ciclo 2): 0 erro, 0 aviso |
| S5 | `sitemap.xml`, `robots.txt` e arquivos citados no HTML em dist; nada do scaffold | Auto `public` | ok |
| S6 | Até 2 famílias de fonte, self-hosted | Auto `public` (sem CDN) + Navegador P7 + Leitura de `package.json` | ok |
| S7 | Scripts `dev`, `build`, `preview`, `check`; `prebuild` gera `src/data` (decisão 10) | Auto `stack` | ok |
| S8 | Texto da clínica só em `src/data/`, nunca direto no JSX | Leitura de `src/sections` e `src/components` | ok |

### SPEC 5: estrutura da página

| # | Item | Verificação | Resultado |
|---|---|---|---|
| E1 | `#hero`: nome, especialidade, nota, CTA WhatsApp e ligar | Auto `secoes`, `conteudo`, `whatsapp` | ok |
| E2 | `#diferenciais`: domingo, 5,0, catarata, idades, acessibilidade | Auto `conteudo` | ok |
| E3 | `#medica`: foto, formação, CRM/RQE, idiomas | Auto `conteudo`, `cfm`; formação completa por Leitura contra `fatos.json` | ok |
| E4 | `#servicos`: cinco grupos, todos os serviços de `fatos.json` | Auto `conteudo` | ok |
| E5 | `#avaliacoes`: 3 a 6 reais, link Google | Auto `avaliacoes` | ok |
| E6 | `#horarios`: `<table>`, endereço, mapa lazy, acessibilidade | Auto `conteudo`, `mapa` | ok |
| E7 | `#faq`: 5 a 7 perguntas | Auto `conteudo` | ok |
| E8 | `#cta-final`: chamada para WhatsApp | Auto `secoes`, `whatsapp` | ok |
| E9 | `#rodape`: CRM, RQE, CNPJ, Instagram, endereço | Auto `cfm`, `conteudo`, `fatos` | ok |
| E10 | `#whatsapp-float` fixo e visível em todas as telas | Auto `secoes` (presença) + Navegador P1 (posição fixa durante a rolagem) | ok |
| E11 | Um único `h1`, em `#hero`; um `h2` por seção de conteúdo | Auto `conteudo` | ok |

### SPEC 9: definição de pronto

| # | Item | Verificação | Resultado |
|---|---|---|---|
| D1 | Todas as seções com IDs corretos | Auto `secoes` | ok |
| D2 | `npm run build` sem erros nem warnings de TypeScript | Saída do build | ok |
| D3 | `npm run check` passa | Auto | ok (ciclo 2): 146 de 146 |
| D4 | Lighthouse dentro das metas | R4.1, R4.2, R4.3 | ok |
| D5 | `dist/` com o texto das seções | Auto `prerender`, `secoes` | ok |
| D6 | Reduced motion e sem WebGL: funciona e fica bonito | P4, P5 + Leitura dos screenshots | ok |
| D7 | Nenhum fato fora de `fatos.json`; `[CONFIRMAR]` listados no relatório | Auto (INFO) + R2.3 | ok |
| D8 | CRM e RQE junto do nome | Auto `cfm` | ok |
| D9 | Testado em 375, 768 e 1280 px | Navegador P1 | ok (ciclo 2) |
| D10 | Validador marcou APROVADO | `coord/STATUS.md` | sim: APROVADO no ciclo 2 |

## Procedimentos no navegador

Todos contra `npm run preview`, com Chrome `--headless=new` (decisão 7). Console sem erros em todos, inclusive de hidratação. Screenshots em /tmp com prefixo `val-`.

- **P1, larguras:** em 375, 768 e 1280 px, tirar screenshot por seção. Avaliar `document.documentElement.scrollWidth <= innerWidth`. Rolar até o fim e confirmar `#whatsapp-float` visível em `position: fixed`, sem cobrir CTA nem texto. Abaixo de 768 px, a etiqueta `[CONFIRMAR]` do flutuante não pode estar renderizada, e o `aria-label` mantém o marcador (decisão 11). Em 375 × 667, CTA do hero acima da dobra.
- **P2, ordem de carga:** com rede limitada (Slow 4G), registrar o momento do FCP e o da requisição do chunk com Three.js. O chunk só pode sair depois do FCP. Screenshot antes da cena carregar: texto e CTAs do hero já legíveis.
- **P3, formulários no cliente:** depois de hidratar e rolar a página inteira, `document.querySelectorAll('form,input,textarea,select').length` deve ser 0.
- **P4, reduced motion:** contexto com `reducedMotion: 'reduce'`. Sem `<canvas>` no DOM, chunk com Three.js não requisitado, nenhuma seção presa em opacidade 0, screenshot em 375 px.
- **P5, sem WebGL:** iniciar com `--disable-3d-apis` ou sobrescrever `HTMLCanvasElement.prototype.getContext` para retornar null em `webgl`. Imagem estática aparece, sem erro no console, conteúdo intacto.
- **P6, CTAs:** clicar no CTA do hero assim que a página responder, durante a animação de entrada, e confirmar que o clique não é bloqueado por camada sobreposta. Conferir `tel:`, link do Google e Instagram.
- **P7, rede:** listar requisições. Fontes só da própria origem, duas famílias, um único woff2 de títulos no latin, nenhum iframe do mapa antes do clique, nenhum 404. Depois do clique, iframe com `loading="lazy"`.
- **P8, porteiro (decisão 8):** com `addInitScript`, simular cada recusa isoladamente: `deviceMemory=2`, `hardwareConcurrency=2`, `connection.saveData=true`, `effectiveType='2g'`, CPU limitada por `Emulation.setCPUThrottlingRate` e WebGL por software. Em todas: sem canvas, chunk com Three.js não requisitado, imagem visível. Com GPU real e sem limitação, a cena entra, em idle depois de `load`. Conferir também a cena em 768 px, que ficou sem verificação no código apagado.

## Lista de `[CONFIRMAR]` para a clínica

19 marcadores no HTML do ciclo 2, saída de `npm run check` (o ciclo 1 também tinha 19):

- `#hero`, `#medica`, `#rodape`: RQE da Dra. Luciana
- `#hero`, `#servicos`, `#cta-final`, `#whatsapp-float`, `#faq`: número de WhatsApp
- `#diferenciais`, `#medica`: fellowship em catarata (HUNING, Porto Alegre)
- `#diferenciais`, `#faq`: idades atendidas
- `#medica`: foto da médica
- `#medica`: residência no Hospital da Gamboa/RJ
- `#medica`: especialização em Oftalmologia, PUC-Rio
- `#servicos`: significado da sigla PAM
- `#avaliacoes`: avaliações reais do Perfil do Google (publicar depende da clínica e da Codame, decisão 16)
- `#faq`: convênios aceitos
- `#rodape`: registro da clínica no CRM
- `#rodape`: nome, CRM e RQE do Diretor Técnico-Médico

Sem marcador no site, mas pendente com a clínica: **horário, porque o CNES registra seg-sex 08-18h, sem fim de semana (decisão 15), antes de ir ao ar**; total de 606 avaliações; CRM em conferência final. Lista completa em `confirmar_com_clinica`, no bloco do Pesquisador.

## Relatórios de ciclo

Modelo para cada falha: `ID do item | onde | o que está errado | o que deve mudar | dono`.

### Ciclo 1

Data: 2026-11-05
Build medido: `npm run build` próprio, em cópia de `site/` em /tmp, com fontes iguais às de `site/` (`diff` vazio). `site/` e `docs/fatos.json` não foram alterados.
Veredito: **REPROVADO.** Falham S4, D3, D9 e R3.1. A1 e A4 precisam entrar na mesma correção.

#### Medições

`npm run check`: 143 de 146. As 3 falhas são os checks de JSON-LD criados neste ciclo depois do validador oficial (A2). Antes deles: 143 de 143, sem AVISO.
Build: sai 0, sem warning. `tsc -b --force` sai 0. ESLint sem saída de erro.
JS: 89,0 KB gzip inicial; 133,7 KB sem 3D, com GSAP e ScrollTrigger; chunk da cena 241,4 KB; CSS 5,8 KB. Único modulepreload: runtime.
Charset: byte 149 do HTML, com Head completo. Prova que faltava.

| Cenário Lighthouse mobile | Performance (3 execuções) | Mediana | Cena | TBT | CLS | A11y / BP / SEO | Papel |
|---|---|---|---|---|---|---|---|
| A, sem cena | 92, 92, 93 | **92** | não, nas 3 | 323 a 344 ms | 0 | 100 / 100 / 100 | Critério: ok |
| B, GPU, devtools, CPU 4x | 85, 85, 86 | 85 | recusada nas 3 | 419 a 439 ms | 0,033 | 100 / 100 / 100 | Imagem, não é nota da cena |
| B, GPU, devtools, CPU 2x | 97, 94, 96 | 96 | recusada nas 3 | 94 a 186 ms | 0,033 | 100 / 100 / 100 | Imagem, não é nota da cena |
| B, GPU, devtools, CPU 1x | 91, 89, 92 | **91** | carregou nas 3 | 276 a 364 ms | 0,033 | 100 / 100 / 100 | Critério: ok |
| C, GPU, simulado | 72, 72, 70 | **72** | carregou nas 3 | 1,7 a 3,0 s | 0 | 100 / 100 / 100 | **Relatar ao usuário.** Não reprova |

Leitura:

- A única série com cena fica acima de 85. CPU 1,5x não foi medida no Lighthouse: o porteiro recusou em 5 de 5 aberturas em P8, então seria imagem.
- Os números do Desenvolvedor são compatíveis, com variação de execução: A 94 contra 92, B 4x 87 contra 85, B 1x 89 contra 91, C 72 igual. Nenhum critério muda.
- **Folga zero:** no aparelho que recebe a imagem com CPU 4x, a nota foi 85, 85 e 86. Passa porque esse cenário não é critério, mas é o retrato mais próximo de um celular intermediário.
- O cenário C dá 72 com TBT de 1,7 a 3 s. O modo simulado não desacelera a CPU, a sonda aprova, e o Lighthouse multiplica o custo depois. PageSpeed Insights usa esse modo, então quem testar o site lá pode ver nota parecida quando a máquina de teste aprovar a cena.

Procedimentos (Chrome 157 `--headless=new`, `vite preview`):

| Procedimento | Resultado |
|---|---|
| P1, 375 × 667, 375 × 812, 768, 1280 | Sem rolagem horizontal, sem alvo abaixo de 44 px, menor fonte 15 px, corpo 18 px. Flutuante fixo, sem etiqueta renderizada em 375 e com etiqueta a partir de 768. Fim da página sem texto coberto. **Em 375, flutuante sobre o CTA do hero: A3.** Capturas lidas por seção nas três larguras. |
| P1, 320 × 568, fora da SPEC | Sem rolagem horizontal. CTA termina em 608 px, abaixo da dobra. Registro, sem falha. |
| Cena | Canvas e chunk em 375, 768 e 1280, com captura. Em 768 estava sem prova na rodada anterior. |
| P2, Slow 4G | FCP 1.112 ms; chunk da cena em 1.754 ms. Texto e CTAs legíveis em 1,2 s. |
| P3, formulário no cliente | 0 depois de hidratar e rolar. |
| P4, reduced motion | `recusada:movimento-reduzido`, sem canvas, sem chunk da cena, sem opacidade presa, `clip-path` none. GSAP é baixado sem uso: A6. |
| P5, sem WebGL | `getContext` nulo e `--disable-3d-apis`: `recusada:sem-webgl`, imagem carregada, console limpo. |
| Sem JavaScript | Página inteira visível, CTA `tel:`. |
| P6, clique | CTA no topo e opacidade 1 em seis amostras de 558 a 2.608 ms. Toque no CTA e no flutuante chega ao `tel:`. Instagram, Facebook, Google Maps e URL de incorporação respondem 200. |
| P7, rede | Nada externo antes do clique. 2 woff2, um `hepta-slab-latin`. Nenhum 404. Iframe só depois do clique, com `loading="lazy"`. |
| P8, recusas | `deviceMemory` 2, `hardwareConcurrency` 2, `saveData`, `2g`, `slow-2g`, renderer simulado e SwiftShader real recusam sem baixar o chunk. |
| P8, CPU, 5 aberturas por taxa | 1x aprova 5 de 5 (5,73 a 6,70 voltas/ms). 1,5x, 2x, 4x e 6x recusam 5 de 5 (máximo 4,13). Limiar 4,5. |
| P8, em execução | Perda de contexto desmonta o canvas e devolve a imagem. Vigia de fps com CPU 60x desmonta em cerca de 20 s, com a imagem de volta. Chunk da cena pedido depois de `load`. |
| P8, proibição | `grep` de lighthouse, pagespeed, headless e userAgent em `site/src`: 0. |
| Console | Só o warning `THREE.Clock` (F13), com a cena. Sem erro de hidratação. |
| Leitura | Texto integral do HTML contra `fatos.json` e `conteudo.md`: sem fato fora, sem promessa de resultado. `og.jpg` 1200 × 630, sem antes e depois. Texto só em `src/data`, salvo as palavras "Instagram" e "Facebook" em `Rodape.tsx`, sem peso de falha. |
| FAQ e `details` | Abrem. Exames ocultos ficam no HTML. Foco visível de 3 px. |
| JSON-LD contra `fatos.json` | Nome, telefone, endereço, horário, `geo` e CRM conferem. Sem `aggregateRating`, sem RQE inventado, sem WhatsApp. **Validador oficial: 3 erros, 1 aviso: A2.** |

Só o flag `whatsapp.confirmado=true`, com valor ainda `[CONFIRMAR]`, em cópia: build sai 0 e publica o número candidato em 4 links `wa.me` e no FAQ. `npm run check` reprova com 14 falhas. Ver A1.

Com número real em `valor`, `status` e flag, em cópia: 4 links `wa.me`, candidato ausente do `dist`, check 133 de 133, depois da correção do check descrita abaixo.

#### Achados

ID | onde | o que está errado | o que deve mudar | dono

**P1, bloqueia**

- **A1** | `site/src/data/gerar-dados.mjs:30` | Com `confirmado=true` e `valor` sem número, o gerador cai em `candidato_e164` e publica como WhatsApp um número que ninguém confirmou. O build fica verde, e a Vercel roda o build, não o check. A saída de hoje não tem o problema; é armadilha armada para o dia da ativação. | Chamar `falhar()` quando `confirmado=true` e `valor` não tiver dígitos, sem usar o candidato. | Desenvolvedor. Orquestrador: a decisão 4 diz "trocar o flag"; passa a valer flag mais número em `valor`.
- **A2** | `site/src/components/Metadados.tsx:28`, `:44`, `:50`, `:54` | validator.schema.org acusa 3 erros e 1 aviso: `medicalSpecialty: "Ophthalmic"` não existe no enum, nas duas entidades; `employee` aponta para `Physician`, que não é `Person`; `worksFor` não é propriedade de `Physician`. Falha S4 e D3. | Tirar `medicalSpecialty`, `employee` e `worksFor`, ou ligar as entidades por propriedade válida, e passar no validador oficial. | Desenvolvedor

**P2, bloqueia em 375 px**

- **A3** | `site/src/sections/Hero.tsx:14`, `site/src/components/WhatsappFlutuante.tsx` | Em repouso, em 375 × 667 e 375 × 812, o flutuante sobe 8 px sobre o CTA principal. Verde sobre verde, os dois se fundem no canto, na primeira tela. Não cobre texto, e os dois ligam para o mesmo número, mas fere R3.1 e D9. | Subir o bloco do hero de 12 px ou mais em telas abaixo de `md`, conferindo a dobra de 375 × 667. | Desenvolvedor
- **A4** | `site/src/animations/iniciar.ts:31-38` | O gesto corta o texto de `#diferenciais`: "você encon", "que você encontra", e títulos e explicações com a lateral comida. Em 375 × 812, ainda há 12,5% de corte de cada lado a 122 px do fim, depois de quase toda a passagem. `arquitetura.md`, seção 6, pede conteúdo legível durante todo o gesto. Quem rola devagar, o público desta página, lê o texto cortado. **Desvio não aceito.** | Recortar só o fundo claro, com o texto fora do recorte, ou terminar o gesto antes de o título entrar. | Desenvolvedor; Arquiteto se mudar a seção 6

**P3, acabamento, não bloqueia**

- **A5** | `site/src/sections/Hero.tsx:14` | Em 1280, o texto do hero começa em 96 px e o das seções em 64 px: `px-gutter` está dentro do `max-w-pagina`. | Alinhar à regra das demais seções. | Desenvolvedor
- **A6** | `site/src/animations/iniciar.ts:13` | Com reduced motion, GSAP e ScrollTrigger são baixados (44,7 KB gzip) e nada anima. | Testar `matchMedia` antes do `import()`. | Desenvolvedor
- **A7** | `site/src/three/Cena.tsx` | Depois de `desmontada:lenta`, o desmonte perde o contexto e reescreve o motivo para `contexto-perdido`. Só afeta o diagnóstico em `dataset.cena`. | Ignorar a perda de contexto do próprio desmonte. | Desenvolvedor

#### Desvios relatados pelo Desenvolvedor

| Desvio | Julgamento |
|---|---|
| Topo do hero sem marca repetida | Aceito. O `h1` já é o nome, e a tela ganha espaço. Arquiteto pode registrar. |
| "Exames" mostra os 6 primeiros de `fatos.json` | Aceito. O site não diz "mais procurados", e os outros seguem no HTML. |
| JSON-LD sem `aggregateRating` | Aceito. Combina com a origem do 606, herdado da SPEC. |
| Cena sem `Float`, drei instalado e sem import | Aceito. A SPEC o lista na stack, e o bundle não o carrega. |
| CTA em 2 linhas em 375 | Aceito. Cabe na dobra, e o marcador sai com a confirmação. O espaço entra em A3. |
| CLS 0,033 nos cenários B | Aceito. Medido igual, abaixo do teto de 0,05 da seção 7. |
| Canonical, `og:url`, `og:image`, sitemap e robots no domínio que dá 404 | Aceito como limite. Antes de ir ao ar, o domínio precisa apontar para o deploy. Em preview da Vercel, a imagem de compartilhamento não aparece. |
| Etiqueta do flutuante escondida pelo `span` pai | Aceito. Largura 0 medida em 375. |
| Gesto recorta o texto | **Não aceito: A4.** |
| Trocar só o flag "não testado" | **Não aceito: A1.** Testado neste ciclo. |

"Hoje" aparece 3 vezes no HTML, com classe `hidden`, e só a linha do dia é exibida depois de hidratar. Sem peso de falha.

#### Correções em `tests/checks.mjs` neste ciclo

Fixture `/tmp/val-rest/run.mjs`: 181 casos, 0 erros.

- Número de WhatsApp confirmado diferente do celular reprovava sem motivo. Era falso positivo meu.
- Telefone colado em texto seguinte escapava da regex. Corrigido.
- Check novo para os 3 erros de A2. Antes dele o check dava 143 de 143 com JSON-LD inválido: **o check passando não provava S4**.

#### Impressiona no celular em 10 segundos?

Quase.

- **Primeira tela: forte.** Nome, nota e CTA em cerca de 1,1 s em Slow 4G. Lente e feixe são bonitos, e a imagem estática é quase igual à cena. As duas etiquetas restantes são obrigatórias enquanto a clínica não responde. O flutuante colado no CTA é o único defeito (A3).
- **Rolagem:** o gesto é a marca da página e chama atenção, mas custa a leitura do primeiro título (A4).
- **Limite honesto:** `#avaliacoes` sem depoimento e `#medica` sem foto e com várias etiquetas pesam na venda. Isso depende da clínica, não do código.

#### Limites: sem meio de verificação nesta máquina

Não contam como ok.

- Celular real, toque real, Safari e iOS. Fração de celulares que passa no porteiro segue hipótese: o limiar foi calibrado e conferido em um único notebook.
- Deploy na Vercel, domínio próprio e prévia de compartilhamento no WhatsApp ou no Facebook.
- Conteúdo interno do iframe do Google em navegador: a URL responde 200, o preview carregou sem erro.
- Variação entre máquinas: todas as notas são deste notebook, com carga de 1,6 a 2,2.
- Fatos: confronto com `fatos.json`, não com a clínica.

### Ciclo 2

Data: 2026-11-05. Build próprio de `site/` às 19:49; Lighthouse de 20:02 a 20:17; procedimentos de navegador de 19:55 a 20:01.
Build: `npm run build` sai 0, sem warning de TypeScript; `prebuild` regenerou `src/data` a partir de `docs/`; `npm run lint` sai 0. `docs/fatos.json` e `docs/conteudo.md` não foram tocados (hash `9eb1a3c1…fab7` e `5063bdcc…724d`, iguais aos do ciclo 1). `dist/index.html` com o texto das seções; charset no byte 148.
Veredito: **APROVADO.** S4, D3, D9 e R3.1 passam. A1 a A7 conferidos com prova. Sem regressão encontrada.

#### Medições

`npm run check`: **146 de 146, 0 falha, 0 AVISO.**
JS: **89,0 KB gzip inicial** (app 24,1 + client 62,9 + scheduler 1,6 + runtime 0,4); **133,7 KB gzip sem 3D** (soma gsap 27,3 e ScrollTrigger 17,4); chunk da cena **245,2 KB**; CSS 5,8 KB. `gzip -9` direto nos arquivos: 86,7 / 130,2 / 235,7 KB. Teto de 200 KB respeitado com folga. Único `modulepreload`: runtime. Charset no byte 148.
Carga da máquina durante as medições: 2,4 a 4,5; `benchmarkIndex` 1838 a 2342. Mais alta que a do ciclo 1 (1,6 a 2,2).

| Cenário Lighthouse mobile | Performance (3 execuções) | Mediana | Cena | TBT | CLS | A11y / BP / SEO | Papel |
|---|---|---|---|---|---|---|---|
| A, sem cena | 100, 100, 100 | **100** | não, nas 3 | 0 ms | 0 | 100 / 100 / 100 | Critério: ok |
| B, GPU, devtools, CPU 4x | 96, 95, 97 | **96** | sim, nas 3 | 170 a 210 ms | 0,031 | 100 / 100 / 100 | Critério: ok |
| B, GPU, devtools, CPU 2x | 99, 99, 99 | **99** | sim, nas 3 | 30 a 70 ms | 0,031 | 100 / 100 / 100 | Critério: ok |
| B, GPU, devtools, CPU 1x | 100, 100, 100 | **100** | sim, nas 3 | 0 a 10 ms | 0,031 | 100 / 100 / 100 | Critério: ok |
| C, GPU, simulado | 89, 92, 90 | **90** | sim, nas 3 | 360 a 460 ms | 0 | 100 / 100 / 100 | **Relatar ao usuário.** Não reprova |

Leitura:

- Toda série em que a cena carregou passou de 85, com a maior margem já medida nesta máquina. O cenário C subiu de 72 (ciclo 1) para 90; o TBT caiu de 1,7 a 3,0 s para 360 a 460 ms. As correções A6 (GSAP sob demanda) e A7 explicam parte da diferença; a carga da máquina também variou.
- Divergência com o Desenvolvedor, sem mudar critério: ele mediu 93 em A e recusa do porteiro em B 4x (imagem, 87). Aqui A deu 100 e B 4x carregou a cena nas 3, com 96. O limiar do porteiro está no fio: em P8, sob CPU 4x via CDP, a sonda deu **4,44 voltas/ms** contra limiar 4,5 — recusa por 0,06. O mesmo aparelho nominal alterna entre cena e imagem conforme a carga. As duas rotas passam da meta, mas a margem do limiar é o ponto frágil registrado abaixo.
- CLS 0,031 em B, igual ao ciclo 1 e abaixo do teto de 0,05 da seção 7 (`arquitetura.md`). CLS 0 em A e C.

#### Correções A1 a A7, com prova

| ID | Prova deste ciclo | Situação |
|---|---|---|
| A1 | Em cópia de `site/` + `docs/`: `whatsapp.confirmado=true` com `valor="[CONFIRMAR]"` faz `npm run prebuild` sair 1 com `gerar-dados: whatsapp.confirmado=true exige número real em whatsapp.valor; recebido: [CONFIRMAR]`, sem `dist`. Com `valor="(24) 90000-0000"` e `status=confirmado`: build 0, 4 links `wa.me/5524900000000`, candidato `99226-5079` ausente do `dist`, check 136 de 136. | ok |
| A2 | JSON-LD do `dist` sem `medicalSpecialty`, `employee` e `worksFor`; ligação por `member` da `MedicalClinic` para o `Physician`. `validator.schema.org` (API `/validate`, sem CAPTCHA): **0 erro, 0 aviso**. Nome, telefone, endereço, CEP, `geo`, horário e CRM conferem com `docs/fatos.json`. | ok |
| A3 | 375 × 667: CTA do hero termina em 579 px, flutuante começa em 587 px → **8 px de folga**, sem interseção; `colide: []`. Ligar fica em x 20–229 e o flutuante em 295–359: sem interseção. Também 8 px em 375 × 812, 360 × 740, 412 × 823 e 768 × 1024; 60 px em 1280. CTA inteiro acima da dobra em 375 × 667. | ok |
| A4 | Faixa `[data-fenda]` de 227 px em 375 × 812, **sem texto**; `clip-path` da `#diferenciais` é `none` nas 21 amostras de rolagem. A fenda chega a `inset(0%)` no instante em que o `h2` entra na viewport (y=251; título em 787, faixa termina em 788): o gesto acaba antes do título. **0** elementos de texto de `#diferenciais` com `scrollWidth > clientWidth`. `[data-cortina]` também sem texto. | ok |
| A5 | 1280: `h1` do hero começa em x=64 e o `h2` de `#diferenciais` também em 64. Em 768: 38 e 38. | ok |
| A6 | Reduced motion: `dataset.cena = recusada:movimento-reduzido`, **0 requisições** de gsap e ScrollTrigger, chunk da cena não pedido, sem canvas, nenhuma seção ou `[data-revelar]` presa em opacidade 0, `clip-path` none. | ok |
| A7 | Quadro lento de propósito (rAF a ~13 fps, sem mexer na sonda): `desmontada:lenta` em 7 s; 6 s depois o motivo **continua** `desmontada:lenta`, canvas removido, imagem volta a opacidade 1 — a perda de contexto do próprio desmonte não reescreve. Perda de contexto isolada: `desmontada:contexto-perdido`, estável. | ok |

#### Procedimentos no navegador

Chrome 157 `--headless=new`, `vite preview` em `http://localhost:4173`, sem erro de console. O único warning é `THREE.Clock` (F13, vindo do R3F; sem ação). Capturas em `/tmp/val-c2/`.

| Procedimento | Resultado |
|---|---|
| P1, 375 × 667, 375 × 812, 360 × 740, 412 × 823, 768 × 1024, 1280 × 800 | `scrollWidth == innerWidth` em todas. Flutuante `fixed`, 64 px, sem etiqueta renderizada abaixo de 768 (largura 0; `aria-label` mantém o `[CONFIRMAR]`) e com etiqueta a partir de 768. Nenhum alvo de toque abaixo de 44 px, menor fonte 15 px. Sem texto coberto no repouso, no fim da página nem no CTA do hero. CTA acima da dobra em 375 × 667. |
| P2, Slow 4G | FCP 400 ms; chunk da cena pedido em 640 ms, **depois** do FCP. Texto e CTAs do hero legíveis antes da cena. |
| P3 | Após hidratar e rolar a página: 0 `form,input,textarea,select`. |
| P4 | Ver A6. |
| P5 | `getContext` de WebGL nulo: `recusada:sem-webgl`, imagem com opacidade 1, sem canvas, console limpo. |
| P6 | Clique no CTA do hero 250 ms após o DOM pronto: opacidade 1, `elementFromPoint` devolve o próprio link, `href="tel:+552435120300"`; Google Maps e Instagram respondem. |
| P7 | Nada externo antes do clique; 2 woff2, ambos da origem (`hepta-slab-latin` e `atkinson-latin`); nenhum iframe; após o clique, iframe do Maps com `loading="lazy"`. Sem 404. |
| P8, recusas | `deviceMemory=2` → `memoria`; `hardwareConcurrency=2` → `nucleos`; `saveData` → `economia-de-dados`; `effectiveType=2g` → `rede-lenta`; SwiftShader → `webgl-por-software`. Todas sem canvas, sem chunk da cena, imagem opacidade 1. |
| P8, CPU | CPU 2x via CDP aprova (`cpu:12,56`) e a cena entra. CPU 4x via CDP recusa em `cpu:4,44` (limiar 4,5). No Lighthouse B 4x a cena carregou (ver acima). |
| P8, GPU real | Cena aprovada e canvas presente em 375, 768 e 1280; chunk pedido em ~171 a 173 ms, depois de `loadEventEnd` (27 a 29 ms). |
| Sem JavaScript | Texto do hero, seções e CTA `tel:` presentes; sem canvas; sem rolagem horizontal. |
| Grep proibido | `grep -rniE 'lighthouse\|pagespeed\|headless\|userAgent' site/src` → **0** (saída 1, nenhuma linha). |
| JSON-LD | Validador oficial, 0 erro e 0 aviso; dados conferem com `fatos.json`. |

#### Falhas e pendências

Nenhuma falha bloqueante. Duas observações, sem reprovação:

| # | onde | observação | dono |
|---|---|---|---|
| O1 | `site/src/components/PorteiroCena.tsx:8` | Limiar de 4,5 voltas/ms com margem de 0,06 na medição de CPU 4x. O mesmo aparelho nominal ora recebe a cena, ora a imagem. As duas rotas passam da meta, mas a calibração segue apoiada em um notebook. Registrar o comportamento; não é falha de critério. | Desenvolvedor / Arquiteto |
| O2 | `site/src/components/WhatsappFlutuante.tsx` | O botão fixo passa sobre texto durante a rolagem em 24 de 30 amostras em 375 px (é o comportamento normal de um FAB; não cobre CTA nem texto no repouso). Mantido como no ciclo 1. | — |

Regressões: nenhuma. JS inicial 89,0 KB (igual ao ciclo 1); chunk da cena 245,2 KB (era 241,4); CSS 5,8 KB (igual). Classe de `#whatsapp-float`, hero e gesto sem mudança de contrato.

#### Impressiona no celular em 10 segundos?

Sim.

- **Primeira tela:** FCP 0,8 s no cenário simulado e 400 ms em Slow 4G; nome, nota e CTA acima da dobra em 375 × 667, com 8 px entre o CTA e o flutuante. A cena entra depois do load ou cai para a imagem, e a imagem é próxima da cena.
- **Rolagem:** a fenda abre numa faixa sem texto e fecha antes do título; nenhum texto cortado em 21 amostras. A leitura deixou de ser penalizada.
- **Limite honesto:** `#avaliacoes` sem depoimento e `#medica` sem foto, com 19 `[CONFIRMAR]`, continuam pesando na venda. Depende da clínica.
- A leitura visual das capturas não pôde ser feita nesta sessão (o modelo do Validador não aceita imagem como entrada). O julgamento acima vem de medições de DOM, Lighthouse (A11y 100), rede e console, além da leitura visual do ciclo 1 nas áreas que não mudaram. Ver "Limites" abaixo.

#### Limites: sem meio de verificação nesta máquina

Não contam como ok.

- Leitura visual desta sessão: capturas geradas em `/tmp/val-c2/`, mas não lidas por imagem; a estética foi herdada da leitura do ciclo 1 e conferida por medição. Nenhuma captura foi inspecionada visualmente agora.
- Celular real, toque real, Safari e iOS; fração de celulares que passa no porteiro segue hipótese de um único notebook.
- Deploy na Vercel, domínio próprio e prévia de compartilhamento no WhatsApp ou no Facebook.
- Conteúdo interno do iframe do Google em navegador: a URL responde 200, o iframe carrega com `loading="lazy"`.
- Variação entre máquinas: carga de 2,4 a 4,5 nesta rodada; notas mais altas que as do ciclo 1 não devem ser lidas como ganho permanente.
- Fatos: confronto com `fatos.json`, não com a clínica.


### Ciclo 3

Data: pendente
`npm run check`: pendente
Lighthouse cenário A (Performance / Acessibilidade / Boas práticas / SEO): pendente
Lighthouse cenário B (Performance, multiplicador, cena carregou?): pendente
Lighthouse cenário C (Performance): pendente
JS inicial e JS sem 3D, gzip: pendente
Falhas: pendente
Impressiona no celular em 10 segundos (SPEC 1)? pendente
Veredito: pendente

## Arquivo: rodada anterior (código apagado)

**Nada aqui é resultado do site atual.** Tudo abaixo descreve o `site/` que o usuário apagou. Linhas de arquivo não existem mais. Serve só de lista de armadilhas para a nova rodada.

Última medição daquele código, para comparar ordem de grandeza: JS inicial 88,9 KB gzip, JS sem 3D 133,2 KB, Three.js 237,2 KB. Performance 88 sem cena; com cena, 92 sem limitar a CPU e 70 no modo simulado. A mesma build variou de 78 a 90 conforme a carga da máquina, então a folga sobre 85 é pequena.

| ID | Armadilha | Como conferir agora |
|---|---|---|
| F1 | Sem porteiro por capacidade, a cena entrava em qualquer aparelho com 4 núcleos, 4 GB e GPU: Performance 63, TBT 2 s | P8 e cenário B |
| F2 | Etiqueta `[CONFIRMAR]` do flutuante acompanhava a rolagem e cobria texto em 375 px | P1 (decisão 11) |
| F3 | Sem foto, moldura 4:5 virava bloco vazio de 470 px e parecia imagem quebrada | P1, leitura do screenshot de `#medica` |
| F4 | Instrução interna exposta ao visitante em `#avaliacoes` | Auto `fatos` |
| F5 | Três etiquetas âmbar na primeira tela de 375 px competiam com o CTA | P1, leitura do screenshot de `#hero` |
| F6 | Feixe de luz passava sobre o texto do eyebrow em 375 px | P1, com e sem cena |
| F7 | "Fellowship" sem explicação | Auto `fatos` |
| F8 | PAM afirmado como confirmado sem a clínica confirmar a sigla | Auto `fatos` |
| F9 | "Fale com a clínica pelo WhatsApp" sem marcador, com botão que liga | Auto `whatsapp` |
| F10 | Rótulo visível fora do `aria-label` atrapalhava controle por voz | Auto `whatsapp` |
| F11 | Zero cortado da Atkinson lembrava Ø em "5,0" e "606"; `tabular-nums` da Hepta abria buracos em "07h–21h" | P1, leitura do screenshot de `#hero` e `#horarios` |
| F12 | Títulos de `#diferenciais` em 1280 px centralizados ao lado de texto à esquerda, com hierarquia confusa | P1, leitura do screenshot |
| F13 | Warning `THREE.Clock` obsoleto no console, vindo de biblioteca | P2, console; sem ação se persistir |
| F14 | "Responsável técnica" com marcador "responsável técnico" | Auto `cfm`: o rótulo agora é "Diretor técnico-médico" |

Outras armadilhas da rodada anterior:

- `includeDependenciesRecursively` errado fez o Rolldown puxar `react` para o grupo three, e o chunk virou import estático. Auto `bundle`.
- GSAP na hidratação custou cerca de 580 ms de execução. Conferir em cenário A.
- Sonda de CPU varia com a carga da máquina. Fechar outros programas antes de medir e anotar `benchmarkIndex`.
- `vite-react-ssg` escreve `<title>` e metas antes do charset. Auto `seo`.
