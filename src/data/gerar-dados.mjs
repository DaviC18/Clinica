// Gera src/data/fatos.ts e src/data/conteudo.ts a partir de docs/. Roda no prebuild.
// Falha de propósito (saída 1) se faltar campo: site sem dado é pior que build quebrado.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const AQUI = dirname(fileURLToPath(import.meta.url))
const DOCS = resolve(AQUI, '../../../docs')
const fatosJson = JSON.parse(readFileSync(join(DOCS, 'fatos.json'), 'utf8'))
const md = readFileSync(join(DOCS, 'conteudo.md'), 'utf8')

function falhar(mensagem) {
  console.error(`gerar-dados: ${mensagem}`)
  process.exit(1)
}

const digitos = (s) => String(s ?? '').replace(/\D/g, '')

// ------------------------------------------------------------------ WhatsApp

const { whatsapp } = fatosJson
const MARCADOR_WHATSAPP = '[CONFIRMAR: número de WhatsApp]'

function montarWhatsapp() {
  if (whatsapp.confirmado !== true) {
    // O candidato não pode entrar no bundle: não é fato confirmado.
    return { confirmado: false, numero: null, href: null }
  }
  // Decisão 19: só vale número real em valor. O candidato nunca é publicado.
  const proprios = digitos(whatsapp.valor)
  if (proprios.length < 10) {
    falhar(`whatsapp.confirmado=true exige número real em whatsapp.valor; recebido: ${whatsapp.valor}`)
  }
  const e164 = proprios.startsWith('55') ? proprios : `55${proprios}`
  const local = e164.slice(2)
  const numero = `(${local.slice(0, 2)}) ${local.slice(2, -4)}-${local.slice(-4)}`
  const href = `https://wa.me/${e164}?text=${encodeURIComponent(whatsapp.mensagem_padrao)}`
  return { confirmado: true, numero, href }
}

const dadosWhatsapp = montarWhatsapp()

// ------------------------------------------------------------------ conteudo.md

function secoes(texto) {
  const mapa = new Map()
  for (const bloco of texto.split(/^## /m).slice(1)) {
    const fim = bloco.indexOf('\n')
    mapa.set(bloco.slice(0, fim).trim(), bloco.slice(fim + 1))
  }
  return mapa
}

function campos(bloco) {
  const mapa = new Map()
  for (const m of bloco.matchAll(/^- \*\*(.+?):\*\* (.*)$/gm)) mapa.set(m[1], m[2].trim())
  return mapa
}

function resolver(valor) {
  if (!dadosWhatsapp.confirmado) return valor
  return valor.replaceAll(MARCADOR_WHATSAPP, dadosWhatsapp.numero)
}

const todas = secoes(md)

function secao(nome) {
  const bloco = todas.get(nome)
  if (bloco === undefined) falhar(`seção "${nome}" não encontrada em docs/conteudo.md`)
  const mapa = campos(bloco)
  return {
    bloco,
    mapa,
    pegar(chave) {
      const valor = mapa.get(chave)
      if (!valor) falhar(`campo "${chave}" não encontrado em ${nome}`)
      return resolver(valor)
    },
  }
}

const seo = secao('SEO')
const hero = secao('#hero')
const diferenciais = secao('#diferenciais')
const medica = secao('#medica')
const servicos = secao('#servicos')
const avaliacoes = secao('#avaliacoes')
const horarios = secao('#horarios')
const faq = secao('#faq')
const ctaFinal = secao('#cta-final')
const rodape = secao('#rodape')
const flutuante = secao('#whatsapp-float')
const alts = secao('Textos alternativos de imagem')

const linhasDiferenciais = [...diferenciais.mapa]
  .filter(([chave]) => chave !== 'título')
  .map(([titulo, texto]) => ({ titulo, texto: resolver(texto) }))
if (linhasDiferenciais.length !== 5) falhar(`#diferenciais com ${linhasDiferenciais.length} linhas; esperado 5`)

const formacao = /\*\*Formação\*\*\n\n((?:- .*\n)+)/.exec(medica.bloco)?.[1]
  .trim()
  .split('\n')
  .map((l) => l.slice(2).trim())
if (!formacao?.length) falhar('lista de formação não encontrada em #medica')
const idiomas = /^\*\*Idiomas:\*\* (.*)$/m.exec(medica.bloco)?.[1]?.trim()
if (!idiomas) falhar('idiomas não encontrados em #medica')

const tabela = [...horarios.bloco.matchAll(/^\| (.+?) \| (.+?) \|$/gm)]
  .map((m) => ({ dia: m[1], horario: m[2] }))
  .filter((l) => l.dia !== 'Dia' && !l.dia.startsWith('---'))
if (tabela.length !== 3) falhar(`tabela de horários com ${tabela.length} linhas; esperado 3`)

const perguntas = [...faq.bloco.matchAll(/^\*\*(.+\?)\*\*\n(.+)$/gm)].map((m) => ({
  pergunta: m[1].trim(),
  resposta: resolver(m[2].trim()),
}))
if (perguntas.length < 5 || perguntas.length > 7) falhar(`#faq com ${perguntas.length} perguntas; esperado 5 a 7`)

const conteudo = {
  seo: { titulo: seo.pegar('title'), descricao: seo.pegar('meta description') },
  hero: {
    eyebrow: hero.pegar('eyebrow'),
    titulo: hero.pegar('h1'),
    subtitulo: hero.pegar('subtítulo'),
    medica: hero.pegar('médica'),
    nota: hero.pegar('nota'),
    ctaPrimario: hero.pegar('CTA primário'),
    ctaSecundario: hero.pegar('CTA secundário'),
  },
  diferenciais: { titulo: diferenciais.pegar('título'), linhas: linhasDiferenciais },
  medica: {
    titulo: medica.pegar('título'),
    nome: medica.pegar('nome'),
    registros: medica.pegar('especialidade e registros'),
    apresentacao: medica.pegar('apresentação'),
    foto: medica.pegar('foto'),
    formacao: formacao.map(resolver),
    idiomas,
  },
  servicos: {
    titulo: servicos.pegar('título'),
    introducao: servicos.pegar('introdução'),
    cta: servicos.pegar('CTA'),
  },
  avaliacoes: {
    titulo: avaliacoes.pegar('título'),
    resumo: avaliacoes.pegar('resumo'),
    depoimentos: avaliacoes.pegar('depoimentos'),
    link: avaliacoes.pegar('link'),
  },
  horarios: {
    titulo: horarios.pegar('título'),
    tabela,
    endereco: horarios.pegar('endereço'),
    telefone: horarios.pegar('telefone'),
    mapaTitulo: horarios.pegar('mapa (título do iframe)'),
    mapaLink: horarios.pegar('link do mapa'),
    acessibilidade: horarios.pegar('acessibilidade'),
    acolhimento: horarios.pegar('acolhimento'),
  },
  faq: { titulo: faq.pegar('título'), itens: perguntas },
  ctaFinal: {
    titulo: ctaFinal.pegar('título'),
    texto: ctaFinal.pegar('texto'),
    aviso: ctaFinal.pegar('aviso'),
    ctaPrimario: ctaFinal.pegar('CTA primário'),
    ctaSecundario: ctaFinal.pegar('CTA secundário'),
  },
  rodape: {
    marca: rodape.pegar('marca'),
    razaoSocial: rodape.pegar('razão social'),
    cnpj: rodape.pegar('CNPJ'),
    registroCrm: rodape.pegar('registro no CRM'),
    medica: rodape.pegar('médica'),
    diretorTecnico: rodape.pegar('responsável técnica'),
    endereco: rodape.pegar('endereço'),
    telefone: rodape.pegar('telefone'),
    instagram: rodape.pegar('Instagram'),
    facebook: rodape.pegar('Facebook'),
    aviso: rodape.pegar('aviso'),
  },
  flutuante: { texto: flutuante.pegar('texto visível'), ariaLabel: flutuante.pegar('aria-label') },
  alt: { imagemOg: alts.pegar('imagem Open Graph') },
}

// Decisão 18: sem número confirmado, a meta description não promete WhatsApp.
if (!dadosWhatsapp.confirmado && /whats\s?app/i.test(conteudo.seo.descricao)) {
  falhar('meta description cita WhatsApp com whatsapp.confirmado=false (decisão 18)')
}

// ------------------------------------------------------------------ fatos.json

const { clinica, crm, redes, avaliacoes: notas, mapa } = fatosJson
const end = clinica.endereco.valor

for (const [rotulo, texto] of [
  ['#hero', conteudo.hero.ctaSecundario],
  ['#cta-final', conteudo.ctaFinal.ctaSecundario],
  ['#horarios', conteudo.horarios.telefone],
  ['#rodape', conteudo.rodape.telefone],
]) {
  if (digitos(texto) !== digitos(clinica.telefone_fixo.valor)) falhar(`telefone de ${rotulo} difere de fatos.json`)
}

function hora(texto) {
  const [abre, fecha] = texto.match(/\d{2}/g) ?? []
  if (!abre || !fecha) falhar(`horário ilegível em fatos.json: ${texto}`)
  return { abre: `${abre}:00`, fecha: `${fecha}:00` }
}

const fatos = {
  siteUrl: clinica.site_atual.url,
  nomeClinica: clinica.nome_curto.valor,
  nomeMedica: fatosJson.medica.nome.valor,
  crm: crm.valor,
  especialidade: clinica.especialidade.valor,
  telefone: { exibicao: clinica.telefone_fixo.valor, tel: clinica.telefone_fixo.tel },
  endereco: {
    linha: end.linha,
    bairro: end.bairro,
    cidade: end.cidade,
    uf: end.uf,
    cep: end.cep,
  },
  geo: { latitude: mapa.latitude, longitude: mapa.longitude },
  horario: {
    segSex: hora(clinica.horario.valor.seg_sex),
    sab: hora(clinica.horario.valor.sab),
    dom: hora(clinica.horario.valor.dom),
  },
  whatsapp: dadosWhatsapp,
  redes: { instagram: redes.instagram_clinica.url, facebook: redes.facebook.url },
  avaliacoes: {
    urlGoogle: notas.url_google,
    lista: notas.lista.map(({ autor, texto }) => ({ autor, texto })),
  },
  mapa: {
    url: mapa.url,
    urlIncorporacao: `https://www.google.com/maps?q=${encodeURIComponent(mapa.consulta)}&output=embed`,
  },
  servicos: fatosJson.servicos.map(({ grupo, nome, explicacao }) => ({ grupo, nome, explicacao })),
}

const AVISO = '// Gerado por src/data/gerar-dados.mjs a partir de docs/. Não editar à mão.\n'

function escrever(arquivo, nome, valor) {
  writeFileSync(join(AQUI, arquivo), `${AVISO}export const ${nome} = ${JSON.stringify(valor, null, 2)} as const\n`)
}

escrever('conteudo.ts', 'conteudo', conteudo)
writeFileSync(
  join(AQUI, 'fatos.ts'),
  `${AVISO}export type Whatsapp = { confirmado: boolean; numero: string | null; href: string | null }\n` +
    `export type Depoimento = { autor: string; texto: string }\n\n` +
    `const dados = ${JSON.stringify(fatos, null, 2)}\n\n` +
    `export const fatos = {\n  ...dados,\n  whatsapp: dados.whatsapp as Whatsapp,\n  avaliacoes: { ...dados.avaliacoes, lista: dados.avaliacoes.lista as Depoimento[] },\n}\n`,
)
console.log(`gerar-dados: ok, whatsapp.confirmado=${dadosWhatsapp.confirmado}`)
