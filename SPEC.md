# SPEC — Site da Clínica Luciana Salgado

Documento único de orientação. Todo agente lê este arquivo inteiro antes de começar e consulta `coord/STATUS.md` antes de cada entrega.

## 1. Objetivo

Construir uma landing page própria para a Clínica Luciana Salgado (oftalmologia, Volta Redonda/RJ) para substituir:

- a página genérica do Google Business Profile que hoje recebe os cliques dos anúncios pagos; e
- o domínio próprio `clinicalucianasalgado.com`, que hoje retorna erro 404.

O site é uma **peça de venda**: será mostrado à clínica como proposta pronta. Precisa impressionar no celular em menos de 10 segundos.

**Meta de conversão:** agendamento pelo WhatsApp. Ligação é o caminho secundário.

## 2. Fatos confirmados (fonte única da verdade)

Nada fora desta lista entra no site sem o Pesquisador confirmar e registrar em `docs/fatos.json`.

| Item | Valor | Fonte |
|---|---|---|
| Nome no Google | Clínica Luciana Salgado - Oftalmologia Clínica, Cirúrgica, Integrativa e Preventiva | Perfil do Google |
| Nome curto / marca | Clínica de Olhos Luciana Salgado | Instagram |
| Endereço | Rua 40, nº 20, Shopping 33, Torre 1, Sala 909, Vila Santa Cecília, Volta Redonda/RJ, 27260-200 | Perfil do Google |
| Telefone fixo | (24) 3512-0300 | Perfil do Google |
| Celular | (24) 99226-5079 | Diretórios (confirmar se é WhatsApp) |
| Horário | Seg–Sex 07h–21h · Sáb 08h–19h · Dom 08h–15h | Perfil do Google |
| Avaliações | 5,0 com 606 avaliações | Perfil do Google (nov/2026) |
| Médica | Dra. Luciana Salgado de Carvalho | Rede Olhos |
| CRM | 52908452 RJ | Rede Olhos (confirmar com a clínica) |
| RQE | **não encontrado** — pedir à clínica | — |
| Formação | Medicina (UniFOA, 2010); especialização em Oftalmologia (PUC-Rio); residência no Hospital da Gamboa/RJ; fellowship em catarata (HUNING, Porto Alegre); título de especialista CBO | Ponto de Saúde, Rede Olhos |
| Idiomas | Português e inglês | Ponto de Saúde |
| Outra profissional citada | Dra. Erica (em avaliação) | Avaliação no Google |
| Instagram | @clinicadralucianasalgado (clínica) · @dra_lucianasalgado (médica) | Busca |
| Acessibilidade | Entrada, assento, banheiro e estacionamento acessíveis para cadeira de rodas | Perfil do Google |
| Pagamento | Crédito, débito, NFC | Perfil do Google |
| Público | Acolhe comunidade LGBTQ+, espaço seguro para pessoas trans | Perfil do Google |
| Identidade visual | Logo com ícone de olho e o nome "Dra. Luciana Salgado" (ver fotos do perfil) | Fotos do Google |

**Serviços listados no perfil:** cirurgia de catarata; mapeamento de retina; acuidade visual e refração (grau); teste do olhinho (reflexo vermelho); PAM; ceratometria computadorizada; paquimetria ultrassônica; tonometria; biomicroscopia de segmento anterior; fundo de olho; teste de Schirmer (olho seco); teste de cores (Ishihara); curva de pressão intraocular; teste de sobrecarga hídrica; retirada de corpo estranho; epilação de cílios; retinografia colorida digital; injeção de triancinolona. Também: glaucoma (prevenção, diagnóstico e tratamento).

**A confirmar com a clínica** (usar placeholder visível `[CONFIRMAR]`): número de WhatsApp, RQE, convênios aceitos, se vendem óculos (uma avaliação cita escolha de armação), fotos em alta resolução e arquivo do logo.

## 3. Regras inegociáveis

1. **Publicidade médica (Resolução CFM nº 2.336/2023):** exibir nome da médica, CRM e RQE junto da especialidade. Sem promessa de resultado, sem antes e depois, sem preço como chamariz, sem termos como "o melhor" ou "garantido".
2. **Nada inventado.** Sem depoimentos fictícios, números, prêmios ou convênios que não estejam em `docs/fatos.json`. Depoimentos só os reais do Google, com primeiro nome e link "ver todas as avaliações no Google".
3. **Mobile first.** Testar em 375 px antes de qualquer outra largura.
4. **Rápido mesmo com 3D:** Lighthouse mobile ≥ 85 em Performance e ≥ 90 em Acessibilidade, Boas práticas e SEO. Bundle inicial ≤ 200 KB gzip; Three.js fica em chunk separado, carregado só depois do primeiro paint. O texto e os CTAs do hero aparecem antes de qualquer animação ou cena 3D.
7. **Movimento com critério:** respeitar `prefers-reduced-motion` (sem 3D e sem animações longas). Em celular fraco ou sem WebGL, a cena 3D cai para uma imagem estática. Animação nunca atrasa o clique no WhatsApp.
5. **Linguagem de paciente:** termo técnico sempre acompanhado de explicação curta ("Paquimetria: mede a espessura da córnea").
6. **LGPD:** sem formulário que colete dados de saúde. O agendamento acontece no WhatsApp.

## 4. Stack

Definida pelo cliente. O Arquiteto pode **acrescentar** bibliotecas quando necessário, registrando o motivo em `docs/arquitetura.md`, mas não trocar as bases.

- **Vite + React + TypeScript.**
- **Tailwind CSS** para estilos; tokens de design no tema do Tailwind.
- **GSAP** (com ScrollTrigger) para animações de entrada e scroll. Smooth scroll com **Lenis** se o Arquiteto aprovar.
- **Three.js** via **@react-three/fiber** e **@react-three/drei** para a cena 3D do hero (tema: olho, lente, refração da luz). Uma cena só, discreta e elegante.
- **Pré-renderização estática** (ex.: `vite-react-ssg` ou `vite-plugin-prerender`): o HTML final precisa vir com o texto pronto para o Google, não só um `<div id="root">` vazio.
- **react-helmet-async** (ou equivalente do SSG) para title, meta e JSON-LD.
- Ícones: `lucide-react`. Fontes: `@fontsource` (até 2 famílias, self-hosted).
- Deploy na Vercel.
- SEO local: `schema.org` dos tipos `MedicalClinic` e `Physician` em JSON-LD, Open Graph, `sitemap.xml` e `robots.txt` em `public/`.
- Scripts obrigatórios no `package.json`: `dev`, `build`, `preview`, `check` (roda `tests/checks.mjs` sobre `dist/`).

## 5. Estrutura da página (contrato entre agentes)

Cada seção tem um **ID fixo**. O Pesquisador escreve o texto por ID, o Arquiteto define o layout por ID, o Desenvolvedor implementa por ID e o Validador checa por ID.

| ID | Seção | Conteúdo mínimo |
|---|---|---|
| `hero` | Topo | Nome, especialidade, nota 5,0 (606 avaliações), CTA WhatsApp + ligar |
| `diferenciais` | Por que aqui | Aberto até domingo · avaliação 5,0 · catarata (fellowship) · todas as idades · acessibilidade |
| `medica` | Sobre a Dra. | Foto, formação, CRM/RQE, idiomas |
| `servicos` | Tratamentos e exames | Agrupados: Consultas · Cirurgia · Exames · Crianças · Pequenos procedimentos |
| `avaliacoes` | Depoimentos | 3 a 6 avaliações reais + link para o Google |
| `horarios` | Horário e local | Tabela de horários, endereço, mapa incorporado (lazy), acessibilidade |
| `faq` | Dúvidas | 5 a 7 perguntas (ex.: "Atendem crianças?", "Abrem domingo?") |
| `cta-final` | Fechamento | Chamada para agendar no WhatsApp |
| `rodape` | Rodapé | Dados legais (CRM, RQE, CNPJ 30.861.073/0001-39), Instagram, endereço |

Elemento fixo em todas as telas: botão flutuante de WhatsApp (`#whatsapp-float`).

## 6. Estrutura de arquivos e posse

**Cada arquivo tem um único dono.** Um agente nunca edita arquivo de outro dono; quando precisar de mudança, abre um pedido em `coord/STATUS.md`.

```
clinica-luciana-salgado/
├── SPEC.md                  # orquestrador (sessão principal)
├── coord/
│   └── STATUS.md            # todos escrevem, só no próprio bloco
├── docs/
│   ├── fatos.json           # Pesquisador
│   ├── conteudo.md          # Pesquisador
│   ├── arquitetura.md       # Arquiteto
│   └── validacao.md         # Validador
├── package.json              # Arquiteto cria; Desenvolvedor pode adicionar deps (avisando no STATUS)
├── vite.config.ts            # Arquiteto
├── tailwind.config.ts        # Arquiteto (tokens: cores, fontes, espaçamentos)
├── index.html                # Desenvolvedor
├── public/                   # Desenvolvedor (imagens, sitemap.xml, robots.txt)
├── tests/
│   └── checks.mjs            # Validador (roda sobre dist/ após o build)
└── src/
    ├── styles/tokens.css     # Arquiteto (variáveis CSS espelhando o tema)
    ├── data/fatos.ts         # Desenvolvedor (gerado a partir de docs/fatos.json)
    ├── data/conteudo.ts      # Desenvolvedor (gerado a partir de docs/conteudo.md)
    ├── sections/*.tsx        # Desenvolvedor (um arquivo por ID da seção 5)
    ├── components/*.tsx      # Desenvolvedor
    ├── three/*.tsx           # Desenvolvedor (cena 3D, carregada com lazy)
    └── animations/*.ts       # Desenvolvedor (timelines GSAP)
```

Texto e dados vivem só em `src/data/`. Componentes nunca têm texto da clínica escrito direto no JSX.

## 7. Fluxo em paralelo

```
Fase 1 (paralelo)   Pesquisador ─ fatos.json + conteudo.md
                    Arquiteto   ─ arquitetura.md + scaffold Vite + tema Tailwind
                    Validador   ─ validacao.md (checklist) + checks.mjs
                          │
                    [portão 1: os três marcam PRONTO no STATUS]
                          │
Fase 2              Desenvolvedor ─ projeto completo
                    Validador     ─ pode rodar checks parciais por seção
                          │
                    [portão 2: Desenvolvedor marca PRONTO]
                          │
Fase 3 (ciclo)      Validador → relatório → Desenvolvedor corrige → Validador
                    (máx. 3 ciclos; depois o orquestrador decide)
                          │
                    [portão 3: Validador marca APROVADO]
```

**Dependências mínimas:** o Desenvolvedor pode começar os componentes das seções com os IDs da seção 5 assim que o scaffold e o tema Tailwind existirem, sem esperar o texto final, e conectar `src/data/` quando `conteudo.md` chegar.

## 8. Protocolo de comunicação (`coord/STATUS.md`)

Cada agente tem um bloco próprio e só edita o seu:

```
## Pesquisador
estado: PENDENTE | EM_ANDAMENTO | PRONTO | BLOQUEADO
entregas: docs/fatos.json, docs/conteudo.md
pedidos_para: [Arquiteto] "Preciso de limite de caracteres no hero"
bloqueios: —
```

- Para pedir algo a outro agente: linha em `pedidos_para` com o destinatário entre colchetes.
- O destinatário responde no **próprio** bloco, em `respostas:`.
- Dúvida que só a clínica responde: vira `[CONFIRMAR]` no conteúdo e entra na lista do orquestrador. Ninguém para por causa disso.

## 9. Definição de pronto

- [ ] Todas as seções da tabela 5 implementadas com os IDs corretos.
- [ ] `npm run build` sem erros nem warnings de TypeScript.
- [ ] `npm run check` passa sem erro.
- [ ] Lighthouse mobile: Performance ≥ 85; Acessibilidade, Boas práticas e SEO ≥ 90.
- [ ] HTML de `dist/` contém o texto das seções (pré-renderizado).
- [ ] Com `prefers-reduced-motion` ativo e com WebGL desligado, o site funciona e fica bonito.
- [ ] Nenhum fato fora de `docs/fatos.json`; todo `[CONFIRMAR]` listado no relatório final.
- [ ] CRM e RQE visíveis (ou `[CONFIRMAR]`) junto do nome da médica.
- [ ] Testado em 375 px, 768 px e 1280 px.
- [ ] Validador marcou APROVADO em `coord/STATUS.md`.
