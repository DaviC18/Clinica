# Pendências com a clínica

Dono: Pesquisador / Orquestrador. Uso: enviar à clínica e usar as respostas para fechar o site.

Regra: nenhum item abaixo entra no site sem confirmação. Por decisão do dono, os marcadores `[CONFIRMAR]` seguem em `src/data/` como lista de pendências, mas não aparecem na página (`src/components/semPendencias.ts`): o trecho sem confirmação é omitido.

Mensagens prontas para enviar: `docs/mensagens-clinica.md` (WhatsApp, e-mail, formulário e lembrete).

## 1. Dados pendentes — 12 assuntos

**Bloqueiam a publicação:** itens 1, 2 e 3 (Resolução CFM 2.336/2023). `npm run check` mantém 7 falhas de propósito até esses dados chegarem.

O efeito de cada item na página está na coluna "Hoje na página".

| # | Assunto | O que confirmar | Onde entra | Hoje na página |
|---|---|---|---|---|
| 1 | RQE da Dra. Luciana | Número do RQE em Oftalmologia | `#hero`, `#medica`, `#rodape` | "RQE" omitido |
| 2 | Registro da clínica no CRM | Número de registro do estabelecimento no CRM | `#rodape` | Linha omitida |
| 3 | Diretor técnico-médico | Nome completo, CRM e RQE do responsável técnico | `#rodape` | Linha omitida |
| 4 | Foto da médica | Autorização de uso e versão em alta resolução | `#medica` | Recorte da foto enviada pelo dono em uso; original em `docs/fotos/` |
| 5 | Residência médica | Confirmar se foi no Hospital da Gamboa/RJ | `#medica`, formação | "Residência em Oftalmologia" sem instituição |
| 6 | Especialização | Confirmar Especialização em Oftalmologia pela PUC-Rio | `#medica`, formação | Omitida |
| 7 | Fellowship em catarata | Confirmar fellowship no HUNING, Porto Alegre | `#medica` e `#diferenciais` | Omitido |
| 8 | Idade de atendimento | Atende crianças? Qual idade mínima e máxima? | `#diferenciais` e `#faq` | Idades omitidas |
| 9 | Número de WhatsApp | Número oficial de WhatsApp da clínica | Header, `#hero`, `#servicos`, `#faq`, `#cta-final` | CTAs ligam para o fixo e dizem "Ligar" |
| 10 | Convênios | Lista de convênios aceitos; confirmar particular | `#faq` | Pergunta fora do FAQ |
| 11 | Depoimentos | Avaliações reais do Perfil do Google e autorização de republicação | `#avaliacoes` | Só a nota, com título "Nota dos pacientes no Google" |
| 12 | PAM | O que significa a sigla e o que o exame avalia | `#servicos` | Serviço fora da lista |

Aparecem no site sem conferência final (os três primeiros) ou seguem em aberto:

- Horário de funcionamento: a SPEC diz seg–sex 7h–21h, sábado 8h–19h e domingo 8h–15h; o CNES informa seg–sex 8h–18h. Confirmar a versão correta antes de publicar.
- Total de avaliações: o site usa 606, herdado da SPEC; o RadarUp mostrava 578 em retrato anterior. Conferir no Perfil do Google.
- CRM da médica: `52908452 RJ` precisa de conferência final.
- Formas de pagamento: a SPEC cita crédito, débito e NFC; a visualização aberta do Google não mostrou essa informação.
- Espaço seguro para pessoas trans: consta na SPEC, não foi exibido na visualização aberta.
- Venda de óculos: uma avaliação cita escolha de armação; confirmar se a clínica vende.
- Dra. Erica: aparece em avaliação, mas o CNES lista só a Dra. Luciana. Confirmar nome completo, CRM e vínculo antes de citar.
- Instagram da médica: `@dra_lucianasalgado` não pôde ser conferido por exigir login.

## 2. Como aplicar cada resposta

Arquivos-fonte:

- Fatos e status: `docs/fatos.json`.
- Texto publicado: `docs/conteudo.md`.
- Depois de editar: `npm run build`, `npm run check`, `npm run lint`.

### RQE

1. Em `docs/fatos.json`, preencher `rqe.valor`, `rqe.status = "confirmado"`, `rqe.confirmado = true`.
2. Em `docs/conteudo.md`, trocar os três `RQE [CONFIRMAR]` pelo número.
3. Incluir o RQE na meta description, conforme a nota ao Desenvolvedor no topo de `docs/conteudo.md`.
4. Rodar o build. O gerador falha se o campo obrigatório sumir.

### Registro da clínica e diretor técnico

1. Preencher `clinica.registro_crm` e `clinica.responsavel_tecnico` em `docs/fatos.json`.
2. Trocar os marcadores correspondentes em `docs/conteudo.md` (`#rodape`).
3. O rodapé precisa manter nome, CRM e RQE visíveis, conforme a Resolução CFM 2.336/2023.

### WhatsApp

1. Em `docs/fatos.json`, no bloco `whatsapp`:
   - `status`: `"confirmado"`;
   - `confirmado`: `true`;
   - `valor`: número real, com DDD. Exemplo de formato aceito: `(24) 90000-0000`.
2. Manter `mensagem_padrao`.
3. Rodar `npm run build`.
4. O gerador recusa `confirmado=true` com `valor` sem número. O candidato `(24) 99226-5079` nunca é publicado por conta própria.
5. Conferir que os CTAs passaram a usar `wa.me` e que o link "Ligar" voltou ao lado do botão.

### Foto da médica

1. Receber arquivo em alta resolução e autorização de uso.
2. Gerar `public/img/dra-luciana-480.webp` e `.avif` em 4:5, com o rosto ao centro. `src/sections/Medica.tsx` já renderiza a foto em oval.
3. Remover o marcador do campo `foto` em `docs/conteudo.md`.

### Depoimentos

1. Copiar o texto literal do Google, só com o primeiro nome do autor.
2. Aplicar as regras de seleção registradas em `docs/fatos.json` (`avaliacoes.regras_selecao`): sem promessa de resultado, sem dado de saúde identificável, sem elogio à técnica.
3. Preencher `avaliacoes.lista` em `docs/fatos.json` e remover o marcador de `docs/conteudo.md`. O título "O que dizem os pacientes" e as citações voltam sozinhos.
4. Guardar a autorização de republicação.

### PAM

1. Confirmar o significado e a descrição do exame.
2. Editar o item correspondente em `docs/fatos.json` (`servicos`, grupo Exames) e o texto em `docs/conteudo.md`.

## 3. Antes de publicar

- Nenhum `[CONFIRMAR]` deve restar no HTML de `dist/`.
- `npm run check` precisa fechar em 141 de 141.
- O rodapé precisa ter CRM, RQE e diretor técnico-médico: sem isso, não publicar.
- Os marcadores ainda estão no JS publicado (`dist/assets/`): não publicar antes de resolvê-los.
- O domínio precisa responder 200; hoje `clinicalucianasalgado.com` responde 404.
- Testar em celular real e Safari/iOS.
