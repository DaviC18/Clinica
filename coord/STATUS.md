# STATUS — coordenação entre agentes

Cada agente edita **somente o próprio bloco**. Estados: PENDENTE · EM_ANDAMENTO · PRONTO · BLOQUEADO · APROVADO (só Validador).

## Orquestrador
fase_atual: 4 (entrega final; ciclo 2 APROVADO)
reinicio: o usuário apagou site/ de propósito e criou scaffold novo com npm create vite@latest (Vite 8, React 19, TS 6). Todo o código anterior saiu. Estados, medições e resultados registrados nos blocos abaixo antes deste reinício NÃO valem até o dono reescrever o bloco. docs/ e tests/ continuam. Decisões (1) a (25) continuam, salvo pedido de revisão.
pendencias_com_a_clinica: docs/pendencias-clinica.md (19 marcadores visíveis e itens fora do site).
decisoes: (1) .claude/agents vazio: papéis rodam como agentes general-purpose com prompt de papel. (2) Tokens em src/styles/tokens.css (SPEC seção 6 vence STATUS). (3) Script check do package.json: node tests/checks.mjs, rodado na raiz do projeto, sobre dist/. (4) Enquanto whatsapp.confirmado=false: CtaWhatsApp mantém rótulo e [CONFIRMAR] visível, href tel: do fixo, sem wa.me, aria-label honesto dizendo que liga; trocar o flag em fatos.json deve ativar wa.me em todos os CTAs. (5) Fatos com verificacao herdado_spec (606 avaliações, horário da semana) ficam no site e na lista da clínica. (6) Pendência do [Validador]: somar client-* e scheduler-* no check de bundle. (7) Playwright MCP com janela aborta nesta máquina: usar Chrome --headless=new. (8) Performance: 88 sem cena e 64 com cena não cumpre a regra 4. Não adiar a cena só para sair da janela do Lighthouse. Aplicar regra 7: porteiro por capacidade real (hardwareConcurrency, deviceMemory, saveData e sondagem curta de CPU), celular fraco fica na imagem estática; quem passa carrega three em idle depois do load. Proibido detectar Lighthouse ou user agent. Relatar sempre as duas medições. (9) "antes e depois de beber água" é falso positivo: Validador restringe o termo proibido ao sentido de resultado. (10) prebuild roda gerar-dados.mjs: Arquiteto. (11) F2: em telas estreitas #whatsapp-float não mostra etiqueta [CONFIRMAR]; marcador fica no aria-label; hero e cta-final seguem com marcador visível. (12) Ciclo 1: F4, F7, F8, F9, F14 para Pesquisador; F11 para Arquiteto; F1, F2, F3, F5, F6, F10, F12 para Desenvolvedor; F13 sem ação. (13) Critério da meta de Performance: cenário sem cena pelo comando de validacao.md; cena medida com CPU realmente limitada (--throttling-method=devtools), porque o modo simulado não desacelera a CPU e a sonda não tem o que ver. A nota simulada com GPU e cena (70) não passa em silêncio: vai explicitamente no relatório final ao usuário. (14) Exigências da Resolução CFM 2.336/2023 fora da SPEC valem: palavra médica junto do CRM, registro da clínica no CRM e Diretor Técnico-Médico, com [CONFIRMAR] onde faltar dado; checks do Validador ficam. A SPEC não muda sem o usuário. (15) Horário: mantém o texto da SPEC (decisão 5). A divergência com o CNES (seg-sex 08-18h) vai com destaque na lista da clínica, como pendência antes de ir ao ar. (16) #avaliacoes segue com placeholder e link para o Google. Publicar depoimentos depende da clínica e da consulta sugerida à Codame do CREMERJ. (17) Critério estrito do Validador aceito: "antes e depois" só na exceção de beber água; #hero com CRM, RQE e especialidade junto do nome. (18) Decisão 4 vale também para a meta description: sem "Agende pelo WhatsApp" enquanto whatsapp.confirmado=false. Sem foto, #medica não tem moldura vazia (F3). (19) Decisão 4 refinada: wa.me só com whatsapp.confirmado=true e número real em valor. Flag true com valor sem número derruba o build; o candidato nunca é publicado. (20) A4: corrigir no gesto e manter arquitetura.md seção 6. Ciclo 1: A1 a A7 para o Desenvolvedor. (21) Ciclo 2 APROVADO: S4, D3, D9 e R3.1 passam; check 146/146; Lighthouse A 100, B 4x 96, B 2x 99, B 1x 100, C 90; A11y/BP/SEO 100. (22) O1 aceito como limite conhecido: limiar 4,5 vs 4,44 voltas/ms sob CPU 4x via CDP; cena e imagem alternam no mesmo aparelho nominal, mas as duas rotas passam de 85. Sem mudança de código neste ciclo; margem registrada em arquitetura.md seção 5. (23) O2 aceito: FAB fixo passa sobre texto durante rolagem (24/30 amostras em 375), comportamento exigido pela SPEC 5; não cobre CTA nem texto no repouso. Sem ação. Superada pela decisão 27. (24) Relatório final deve citar C = 90 (não reprova), folga A3 de 8 px e limite de leitura visual das capturas (/tmp/val-c2, não lidas por imagem). (25) Layout mudou: o projeto saiu de site/ e ocupa a raiz do repositório; package.json, src/, public/, tests/ e docs/ são irmãos. check roda node tests/checks.mjs sobre dist/; gerar-dados lê ../../docs a partir de src/data/. Histórico Git preservado em .git na raiz. (26) Fase 4: entrega documentada em docs/entrega.md, docs/pendencias-clinica.md e docs/mensagens-clinica.md (WhatsApp, e-mail, formulário e lembrete). Publicação é estática (preset Vite, saída dist/) e só ocorre depois das respostas da clínica. (27) Botão flutuante "Agendar" removido a pedido do usuário: saíram WhatsappFlutuante, #whatsapp-float, a entrada flutuante de conteudo.md/gerar-dados e o pb extra do rodapé (agora pb-12 md:pb-16). SPEC 5 atualizada. Checks caíram de 146 para 141; [CONFIRMAR] de 19 para 18. CTAs de WhatsApp ficam em #hero, #servicos, #cta-final e #faq. (28) Header fixo com navbar: componente src/components/Header.tsx, logo = ícone de olho do favicon + "Clínica Luciana Salgado", links para #diferenciais, #medica, #servicos, #avaliacoes, #horarios e #faq, CTA "Agendar" com o mesmo estado [CONFIRMAR]/tel:. No celular, menu com os links e o CTA. Hero ganhou topo de 96/112 px e as seções ganharam scroll-margin-top. Marcadores [CONFIRMAR] passam de 18 para 19 (o CTA do header soma 1); check segue 141/141. Verificado em 375, 768, 1024 e 1280 px sem rolagem horizontal e sem colisão. (29) Responsividade e quebras de texto: `overflow-wrap` do body virou `break-word` (o `anywhere` partia palavras), texto corrido ganhou `text-wrap: pretty` (sem viúvas), `SemQuebra` mantém telefone/CEP/CNPJ/compostos inteiros no hífen, navbar passou de `lg` para `xl` (1024–1279 usa menu) e o CTA do header ficou compacto, sem ícone, em uma linha de 52 px. Auditado de 320 a 1920 px: zero transbordo, zero viúva, zero palavra partida; build 0, check 141/141, lint 0.
entrega: fase 4 iniciada. `docs/entrega.md` reúne estado, números, publicação e limites; `docs/pendencias-clinica.md` é a lista para a clínica; `docs/mensagens-clinica.md` tem WhatsApp, e-mail, formulário e lembrete prontos. Ciclo 2 APROVADO; pendências restantes são de conteúdo/clínica, deploy e teste em aparelho real, não de código.

## Arquiteto
estado: PRONTO
entregas: docs/arquitetura.md, package.json, package-lock.json, vite.config.ts, tailwind.config.ts, tsconfig.node.json (inclui tailwind.config.ts), src/styles/tokens.css. STUBS que o Desenvolvedor substitui: index.html, src/main.tsx, src/App.tsx, src/styles/global.css (estender; manter as 3 primeiras linhas). Atualizado no ciclo 2: docs/arquitetura.md (seções 3, 4, 5, 6, 7 e 9).
resultados: docs/arquitetura.md alinhada ao código do site implementado (seções 3, 4, 5, 6, 7 e 9); ciclo 2 APROVADO pelo Validador. Seção 5 registra a margem O1: sonda em 4,44 voltas/ms contra limiar 4,5 sob CPU 4x via CDP (recusa por 0,06), com a cena alternando entre carregar e imagem no mesmo aparelho nominal, e B 4x = 96 no Lighthouse. Seções 4 e 9 atualizadas para o JSON-LD validado e para os arquivos e public/ entregues.
check_sobre_o_stub: falha em conteúdo, como esperado (60 de 128 nesta rodada). Grupo bundle passa. A falha em prerender é o limite de tamanho sobre o texto curto do stub.
versoes: vite 8.3.6, react 19.3.1 (faixa ~19.3.1: R3F exige <19.4), typescript 6.0.3, tailwind 4.3.4, gsap 3.15.1, three 0.187.0, fiber 9.8.2, drei 10.7.9, vite-react-ssg 0.9.2, lucide-react 1.69.0. Lista completa em docs/arquitetura.md, seção 8.
pedidos_para: —
respostas:
- [Desenvolvedor] Todos os pedidos antigos atendidos: arquitetura lida; prebuild gerando src/data; public/ com favicon, robots.txt e sitemap.xml; porteiro reescrito com sonda de 4,5 voltas/ms.
- [Desenvolvedor] Pedido antigo atendido: seção 5 traz limiar, limitação da sonda e estado do drei. Medido agora: Float soma 0,35 KB gzip; sem import, o drei fica fora do bundle.
- [Validador] Pedido antigo de somar client e scheduler já está em tests/checks.mjs; números da seção 7 vêm do check.
- [Orquestrador] docs/arquitetura.md, linha 108, alinhada à decisão 18: sem foto, sem moldura vazia em #medica.
- [Validador] Pedido da linha 108 atendido.
- [Pesquisador] Conferido só no texto de arquitetura.md, sem render: nova linha do #rodape cabe em dados legais (text-legal) e o título de #diferenciais, de 30 caracteres, cabe no h2 sem limite fixado. Nenhuma mudança de layout. Rever em 375 px quando a página existir.
- [Validador] O1 registrado na seção 5: margem de 0,06, variação cena/imagem no mesmo CPU 4x, ambas as rotas acima de 85.
bloqueios: —
limites: THREE.Clock deprecated aparece no console ao carregar a cena, vindo do R3F; é warning, sem ação. npm audit: 10 moderadas, só na cadeia do ESLint (dev), vindas do scaffold, sem correção aplicada. Histórico do stub, superado no ciclo 2: JSON-LD e ScrollTrigger não exercitados e largura 375 não medida no navegador; o JSON-LD foi validado com 0 erro/0 aviso e a largura 375 foi testada.

## Pesquisador
estado: PRONTO
entregas: docs/fatos.json, docs/conteudo.md
mudancas_de_chave: só acréscimos. fatos.json: clinica.cnes, clinica.registro_crm, clinica.responsavel_tecnico.candidato e manual_url, mapa.latitude e mapa.longitude. conteudo.md: chave "registro no CRM" em #rodape. Nenhuma chave saiu ou mudou de nome. medica.idiomas passou a confirmado.
pedidos_para:
- [Orquestrador] DECIDIR (regra CFM): a seção #avaliacoes pode expor a clínica mesmo com depoimentos reais. Depoimento republicado conta como publicação da médica (art. 8º, §3º), e o Manual do CFM chama de reiterada a repostagem feita mais de duas vezes por semestre. O Manual fala de compartilhar, não trata de seção fixa em site. Sugestão: levar à clínica antes de publicar, com consulta à Codame do CREMERJ (art. 13, V).
- [Orquestrador] DECIDIR (horário): o CNES registra seg–sex 08:00–18:00, sem fim de semana, contra Seg–Sex 07h–21h, Sáb 08h–19h, Dom 08h–15h da SPEC. O CNES é antigo, mas "Aberto até domingo" é diferencial e resposta do FAQ. Mantive o texto pela decisão 5; a clínica precisa conferir antes de ir ao ar.
- [Orquestrador] A SPEC, regra 1, não cita três exigências da Resolução CFM 2.336/2023: palavra MÉDICO junto do CRM (art. 4º, I), registro da clínica no CRM (art. 5º, I, a) e Diretor Técnico-Médico com CRM e RQE (art. 5º, I, b). Já estão em conteudo.md, com [CONFIRMAR] onde falta dado.
- [Desenvolvedor] Não ative link wa.me: whatsapp.confirmado=false. Mostre [CONFIRMAR]; (24) 99226-5079 é só candidato em fatos.json. Ligar: (24) 3512-0300 é o caminho ativo.
- [Desenvolvedor] avaliacoes.lista está vazia de propósito. #avaliacoes mostra placeholder e link para o Google; não escreva depoimentos.
- [Desenvolvedor] Não use "Integrativa" como especialidade. Geo no JSON-LD só com mapa.latitude e mapa.longitude de fatos.json. Omita Dra. Erica, formas de pagamento e espaço seguro para pessoas trans. Idiomas agora saem sem [CONFIRMAR].
- [Desenvolvedor] Gerar src/data incluindo "registro no CRM" em #rodape. Registros da médica: Médica · CRM 52908452 RJ · Oftalmologista · RQE [CONFIRMAR]. Rótulo visível do diretor: "Diretor técnico-médico". Razão social sem "- ME".
- [Validador] Sugestão para checks.mjs: exigir "médica" junto do CRM em #hero, #medica e #rodape; exigir registro no CRM e diretor técnico-médico em #rodape, com número ou [CONFIRMAR].
- [Arquiteto] #rodape ganhou uma linha (registro no CRM) e a linha do diretor ficou maior. Título de #diferenciais agora é "O que você encontra na clínica". Conferir no layout.
respostas:
- [Validador] Formato aceito em docs/fatos.json: whatsapp, crm, rqe com valor e confirmado; avaliacoes com nota, total, lista. Critério de seleção de depoimentos em avaliacoes.regras_selecao.
pesquisa: resolução e Manual do CFM lidos nos arquivos oficiais. Exigência de diretor técnico-médico confirmada. CNES e Receita consultados. Avaliações do Google: 0 obtidas; Maps sem login é visualização limitada e a busca pediu CAPTCHA, não contornado. Total 606 segue só na SPEC; RadarUp mostra 578, sem data. Portal do CFM com reCAPTCHA, não contornado.
confirmar_com_clinica:
- Número de WhatsApp: (24) 99226-5079 é candidato de diretórios, sem confirmação
- RQE da Dra. Luciana (obrigatório, art. 4º, II)
- Número de registro da clínica no CRM (obrigatório, art. 5º, I, a)
- Diretor Técnico-Médico: nome, CRM e RQE (obrigatório, art. 5º, I, b). Candidata por indícios: Dra. Luciana
- CRM 52908452 RJ: conferência final (Rede Olhos e Ponto de Saúde batem)
- Convênios: quais planos aceita. CNES registra plano de saúde privado e particular, sem nomes, e não atende SUS
- Depoimentos: copiar 6 avaliações reais do Perfil do Google, com login (0 obtidas), e autorizar o uso conforme a decisão do orquestrador
- Horário completo: CNES diverge da SPEC; só quinta 07h–21h e nota 5,0 foram vistos no Maps
- Total de 606 avaliações: rever no Perfil do Google com login
- Formação: especialização PUC-Rio, residência no Hospital da Gamboa/RJ, fellowship em catarata HUNING (ausentes nas fontes citadas e no Lattes)
- Atende todas as idades? Idade mínima de atendimento
- Formas de pagamento: crédito, débito, NFC (não exibidas hoje)
- Espaço seguro para pessoas trans (não exibido hoje; texto não usado)
- Vende óculos? (não usado)
- Dra. Erica: nome completo, CRM, vínculo; CNES lista só a Dra. Luciana (não usada)
- Instagram da médica @dra_lucianasalgado (não verificado; não usado)
- Serviços só da Rede Olhos (pterígio, calázio, gonioscopia, ambliopia, olho seco, grau): confirmar se seguem oferecidos
- Sigla PAM: confirmar significado usado pela clínica
- Foto da médica, fotos em alta resolução e arquivo do logo
bloqueios: —

## Desenvolvedor
estado: PRONTO
ciclo: ciclo 2 APROVADO pelo Validador. Ciclo 1 (A1 a A7) encerrado. Nenhuma dependência nova; porteiro e limiar 4,5 voltas/ms sem mudança, sem recalibrar.
correcoes:
- A1: gerar-dados.mjs não usa mais candidato_e164. confirmado=true com menos de 10 dígitos em valor sai com 1 e mensagem clara (decisão 19).
- A2: JSON-LD sem medicalSpecialty, employee e worksFor. Ligação por member em MedicalClinic. Especialidade em description de Physician, vinda de fatos.json. Nenhum fato novo.
- A3: bloco do hero subiu 16 px abaixo de md e o espaçamento interno caiu 16 px; h1 ficou em 182 px.
- A4: decisão 20. O recorte saiu de #diferenciais inteiro e passou para uma faixa sem texto dentro da seção ([data-fenda], 28svh). O gesto termina quando a faixa acaba, antes de o título entrar. Em cta-final, a faixa [data-cortina] já não tinha texto.
- A5: px-gutter fora de max-w-pagina no hero: h1 e h2 das seções a 64 px em 1280.
- A6: matchMedia antes do import(): com reduced motion, GSAP e ScrollTrigger não são baixados.
- A7: Cena guarda só o primeiro motivo de desmonte.
- Fora da lista: "Instagram" e "Facebook" saíram de Rodape.tsx para src/data/interface.ts, como o Validador apontou.
resultados: build sem erro nem warning de TypeScript. lint sai 0. check 146 de 146, sem AVISO. JS inicial 89,1 KB gzip; JS sem 3D 133,8 KB. Inicial subiu 0,1 KB. validator.schema.org, API oficial, sobre o JSON-LD do build: 0 erros, 0 avisos.
- Ciclo 2, números do Validador: check 146 de 146; JS inicial 89,0 KB; sem 3D 133,7 KB; cena 245,2 KB; Lighthouse A 100, B 4x 96, B 2x 99, B 1x 100, C 90; A11y, BP e SEO 100.
lighthouse_mobile (mediana de 3, build final, load 2,3 a 3,7; Acessibilidade, Boas práticas e SEO 100 em todas):
- A, sem cena: Performance 93 (95, 90, 93), TBT 320 ms, CLS 0.
- B, CPU 4x: porteiro recusou nas 3, imagem. 87 (86, 88, 87), TBT 360 ms, CLS 0,031.
- B, CPU 1x: cena carregou nas 3. 90 (90, 90, 90), TBT 330 ms, CLS 0,031.
- C e B 2x não foram medidos de novo neste ciclo. Última nota de C: 72, nesta sessão, antes destas correções; o Validador mediu o mesmo 72.
provas:
- A1, em cópia: só o flag, com valor [CONFIRMAR]: saída 1, "whatsapp.confirmado=true exige número real em whatsapp.valor; recebido: [CONFIRMAR]", sem dist. Número de teste (24) 90000-0000 em valor: 4 wa.me com esse número, candidato ausente de dist, check 136 de 136. docs/fatos.json não foi tocado: hash 9eb1a3c1...fab7.
- A3: CTA termina em 579 e flutuante começa em 587 em 375 x 667; folga de 8 px também em 375 x 812, 360 x 740, 412 x 823 e 768 x 1024; 21 px em 1280. Sem interseção com CTA nem com Ligar.
- A4, 375 x 812, 21 amostras de rolagem a cada 40 px: seção sempre com clip-path none; faixa totalmente aberta em toda amostra com o h2 visível. Capturas lidas.
- A6: 0 requisições de gsap e ScrollTrigger com reduced motion.
- A7: CPU 60x dá desmontada:lenta; perda de contexto dá desmontada:contexto-perdido; canvas sai, imagem volta com opacidade 1.
- P4, P5 e P8 repetidos sem erro. Cena entrou em 412, 768 e 1280. Capturas a 375, 768 e 1280 lidas.
limites:
- Cena e limiar seguem sem medição em celular real; calibrados em um único notebook. Sem teste em Safari, iOS ou toque real. Deploy, domínio e prévia de compartilhamento sem verificação.
- Sonda varia com a carga. Em uma rodada, a cena foi recusada em uma abertura logo depois de outros testes.
- Execuções de A variaram de 90 a 95 com load mais alto. Mediana segue acima da meta. B 4x segue sem folga grande: 86 a 88.
- Sem JS ou com reduced motion, a faixa de 28svh fica como espaço claro antes do título de #diferenciais.
- Canonical, OG e sitemap dependem de clinicalucianasalgado.com, que hoje dá 404.
- Imagens e ícones vieram de scripts temporários, fora do repositório.
pedidos_para: —
respostas:
- [Validador] Ciclo 2 APROVADO. O1 aceito como limite conhecido: 4,44 vs 4,5 voltas/ms sob CPU 4x, cena/imagem alternam, ambas as rotas acima de 85; sem mudança de código neste ciclo.
- [Validador] A1 a A7 corrigidos, com provas acima.
- [Arquiteto] Sem pendência aberta de código.
- [Pesquisador] Sem mudança de conteúdo.
bloqueios: —

## Validador
estado: PRONTO
entregas: docs/validacao.md (relatório do ciclo 2), tests/checks.mjs (146 checks; sem mudança neste ciclo)
ciclo: 2
veredito: APROVADO. S4, D3, D9 e R3.1 passam. A1 a A7 conferidos com prova própria. Relatório em docs/validacao.md, seção Ciclo 2. Build próprio em site/ às 19:49; nenhum arquivo de site/src, site/package.json ou docs/fatos.json alterado.
resultados: build 0, sem warning de TypeScript; lint 0; prebuild gerou src/data; check 146 de 146, 0 falha, 0 AVISO. JS inicial 89,0 KB gzip; sem 3D 133,7 KB; cena 245,2 KB; CSS 5,8 KB. Charset byte 148. Lighthouse mobile (Chrome 157, preview, carga 2,4 a 4,5, mediana de 3): A sem cena 100, TBT 0 ms, CLS 0; B devtools CPU 4x com cena nas 3 = 96, TBT 170 a 210, CLS 0,031; B 2x = 99; B 1x = 100; C simulado = 90, TBT 360 a 460. A11y, Boas práticas e SEO 100 em todas. P1 a P8 executados sem falha; A3 com 8 px de folga (CTA 579, flutuante 587 em 375 x 667); A4 com 21 amostras e 0 texto cortado; A6 sem gsap em reduced motion; A7 mantém desmontada:lenta. JSON-LD no validador oficial: 0 erro, 0 aviso. Grep proibido: 0. Sem JS: texto e tel: ok.
pedidos_para:
- [Desenvolvedor] Nada bloqueante. O1: site/src/components/PorteiroCena.tsx:8, limiar 4,5 medido em 4,44 voltas/ms sob CPU 4x via CDP (recusa por 0,06); no Lighthouse B 4x a cena entrou e deu 96. O mesmo aparelho nominal alterna cena e imagem. As duas rotas passam; registrar a margem estreita, sem mudar código neste ciclo.
- [Arquiteto] O1, se atualizar a seção 5: anotar a margem de 0,06 e a variação cena/imagem no mesmo CPU 4x.
- [Orquestrador] Levar ao relatório final: cenário C = 90 (não reprova), A3 com 8 px de folga, e o limite de leitura visual desta sessão: capturas geradas em /tmp/val-c2, não lidas por imagem.
respostas:
- [Desenvolvedor] A1 a A7 confirmados: A1 falha o build com valor "[CONFIRMAR]" e publica 4 wa.me com número real; A2 passa no validador oficial; A3, A4, A5, A6 e A7 medidos. Divergência sem mudar critério: B 4x carregou a cena nas 3 aqui, contra imagem no relatório do Desenvolvedor; ambos acima de 85. O check 136 de 136 com número real se confirma depois de ajustar status=confirmado na cópia.
bloqueios: —
limites: leitura visual das capturas nesta sessão: o modelo do Validador não aceita imagem como entrada; julgamento por DOM, Lighthouse, rede e console, com a estética herdada da leitura do ciclo 1. Celular real, toque real, Safari e iOS; deploy na Vercel, domínio e prévia de compartilhamento; conteúdo interno do iframe do Maps; fatos confrontados com fatos.json, não com a clínica. Não contam como ok.
