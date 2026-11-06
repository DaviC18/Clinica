#!/usr/bin/env node
// Checks automáticos do site da Clínica Luciana Salgado. Dono: Validador.
//
// Uso: `npm run check` na raiz do projeto (script `node tests/checks.mjs`).
// Roda sobre dist/, sem dependências além do Node. Sai com 1 se algo falhar.
//
// Variáveis opcionais:
//   CHECK_DIST   caminho alternativo do dist (usado para testar este script)
//   CHECK_FATOS  caminho alternativo do fatos.json
//   CHECK_PACKAGE  caminho alternativo do package.json (padrão: ao lado do dist)
//
// Nenhum check depende de nome de arquivo ou chunk: chunks são reconhecidos pelo conteúdo,
// para o resultado não mudar com o bundler nem com a forma de pré-renderizar.
//
// Legenda da saída: PASS e FAIL contam para o resultado. AVISO e INFO não mudam o
// código de saída; servem para a revisão manual em docs/validacao.md.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');
const DIST = process.env.CHECK_DIST ? resolve(process.env.CHECK_DIST) : join(RAIZ, 'dist');
const FATOS_PATH = process.env.CHECK_FATOS ? resolve(process.env.CHECK_FATOS) : join(RAIZ, 'docs', 'fatos.json');
const PACKAGE_PATH = process.env.CHECK_PACKAGE ? resolve(process.env.CHECK_PACKAGE) : join(dirname(DIST), 'package.json');

const LIMITE_JS_GZIP = 200 * 1000; // 200 KB, base 1000 para errar a favor do limite da SPEC
const JANELA_NOME = 300; // caracteres em torno do nome da médica para achar CRM e RQE
// docs/conteudo.md usa as duas formas: [CONFIRMAR] e [CONFIRMAR: detalhe].
const FONTE_CONFIRMAR = '\\[CONFIRMAR(?::[^\\]]*)?\\]';
const RE_CONFIRMAR = new RegExp(FONTE_CONFIRMAR);
const temConfirmar = (s) => RE_CONFIRMAR.test(s);
const semMarcadores = (s) => s.replace(new RegExp(FONTE_CONFIRMAR, 'g'), ' ');

const IDS_SECAO = ['hero', 'diferenciais', 'medica', 'servicos', 'avaliacoes', 'horarios', 'faq', 'cta-final', 'rodape'];

// Fallback: SPEC seção 2, usado enquanto docs/fatos.json não existir.
const FATOS_SPEC = {
  nomeMedica: 'Dra. Luciana Salgado de Carvalho',
  telefone: '(24) 3512-0300',
  celular: '(24) 99226-5079',
  endereco: 'Rua 40, nº 20, Shopping 33, Torre 1, Sala 909, Vila Santa Cecília, Volta Redonda/RJ, 27260-200',
  cnpj: '30.861.073/0001-39',
  crm: { digitos: '52908452', valor: '52908452', confirmado: true },
  rqe: { digitos: null, valor: '', confirmado: false },
  whatsapp: null,
  candidatoWhatsapp: '5524992265079',
  nota: '5,0',
  totalAvaliacoes: '606',
  horario: { seg_sex: '07h–21h', sab: '08h–19h', dom: '08h–15h' },
  avaliacoes: null,
  urlGoogle: null,
  instagram: 'clinicadralucianasalgado',
  convenios: [],
  servicos: [],
  geo: null,
  aConfirmar: () => true,
  valores: '',
};

// ---------------------------------------------------------------- resultados

const resultados = [];
const avisos = [];
const infos = [];

function check(grupo, nome, ok, detalhe = '') {
  resultados.push({ grupo, nome, ok: Boolean(ok), detalhe });
}
const aviso = (msg) => avisos.push(msg);
const info = (msg) => infos.push(msg);

// ---------------------------------------------------------------- parser HTML

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'textarea', 'title']);
const SEM_TEXTO = new Set(['script', 'style', 'template', 'noscript', 'textarea']);
const INLINE = new Set(['a', 'abbr', 'b', 'bdi', 'bdo', 'cite', 'code', 'data', 'em', 'i', 'kbd', 'label', 'mark', 'q', 's', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'wbr']);
const ENTIDADES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', mdash: '—', ndash: '–',
  laquo: '«', raquo: '»', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', middot: '·', ordm: 'º', ordf: 'ª',
};

function decodificar(texto) {
  return texto.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (bruto, corpo) => {
    if (corpo[0] !== '#') return ENTIDADES[corpo.toLowerCase()] ?? bruto;
    const hex = corpo[1] === 'x' || corpo[1] === 'X';
    const codigo = Number.parseInt(corpo.slice(hex ? 2 : 1), hex ? 16 : 10);
    return Number.isFinite(codigo) ? String.fromCodePoint(codigo) : bruto;
  });
}

function fimDaTag(html, inicio) {
  let aspas = null;
  for (let i = inicio; i < html.length; i++) {
    const c = html[i];
    if (aspas) {
      if (c === aspas) aspas = null;
    } else if (c === '"' || c === "'") {
      aspas = c;
    } else if (c === '>') {
      return i;
    }
  }
  return -1;
}

function lerAtributos(trecho) {
  const attrs = {};
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  for (const m of trecho.matchAll(re)) {
    attrs[m[1].toLowerCase()] = decodificar(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return attrs;
}

function parseHtml(html) {
  const raiz = { tag: '#raiz', attrs: {}, filhos: [], pai: null };
  const pilha = [raiz];
  const topo = () => pilha[pilha.length - 1];
  const addTexto = (texto) => {
    if (texto) topo().filhos.push({ tag: '#texto', texto: decodificar(texto), pai: topo() });
  };
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt < 0) {
      addTexto(html.slice(i));
      break;
    }
    addTexto(html.slice(i, lt));
    if (html.startsWith('<!--', lt)) {
      const fim = html.indexOf('-->', lt + 4);
      i = fim < 0 ? html.length : fim + 3;
      continue;
    }
    if (html[lt + 1] === '!' || html[lt + 1] === '?') {
      const fim = html.indexOf('>', lt);
      i = fim < 0 ? html.length : fim + 1;
      continue;
    }
    const fechamento = /^<\/([a-zA-Z][^\s>]*)[^>]*>/.exec(html.slice(lt, lt + 200));
    if (fechamento) {
      const tag = fechamento[1].toLowerCase();
      for (let p = pilha.length - 1; p > 0; p--) {
        if (pilha[p].tag === tag) {
          pilha.length = p;
          break;
        }
      }
      i = lt + fechamento[0].length;
      continue;
    }
    const abertura = /^<([a-zA-Z][a-zA-Z0-9:-]*)/.exec(html.slice(lt, lt + 80));
    if (!abertura) {
      addTexto('<');
      i = lt + 1;
      continue;
    }
    const fim = fimDaTag(html, lt + abertura[0].length);
    if (fim < 0) break;
    const tag = abertura[1].toLowerCase();
    let corpo = html.slice(lt + abertura[0].length, fim);
    const autoFechada = corpo.trimEnd().endsWith('/');
    if (autoFechada) corpo = corpo.trimEnd().slice(0, -1);
    const no = { tag, attrs: lerAtributos(corpo), filhos: [], pai: topo() };
    topo().filhos.push(no);
    i = fim + 1;
    if (VOID.has(tag) || autoFechada) continue;
    if (RAW.has(tag)) {
      const re = new RegExp(`</${tag}\\s*>`, 'i');
      const resto = html.slice(i);
      const m = re.exec(resto);
      const bruto = m ? resto.slice(0, m.index) : resto;
      no.filhos.push({ tag: '#texto', texto: tag === 'title' || tag === 'textarea' ? decodificar(bruto) : bruto, pai: no });
      i += m ? m.index + m[0].length : resto.length;
      continue;
    }
    pilha.push(no);
  }
  return raiz;
}

function* percorrer(no) {
  yield no;
  for (const filho of no.filhos ?? []) yield* percorrer(filho);
}
const buscar = (no, teste) => [...percorrer(no)].filter((n) => n.tag !== '#texto' && teste(n));
const porTag = (no, ...tags) => buscar(no, (n) => tags.includes(n.tag));

function textoBruto(no, ignorar = SEM_TEXTO) {
  if (no.tag === '#texto') return no.texto;
  if (ignorar.has(no.tag)) return '';
  if (no.tag === 'br') return ' ';
  const dentro = (no.filhos ?? []).map((f) => textoBruto(f, ignorar)).join('');
  return INLINE.has(no.tag) || no.tag === '#raiz' ? dentro : ` ${dentro} `;
}
const limpar = (s) => s.replace(/[\s ]+/g, ' ').trim();
const texto = (no) => limpar(textoBruto(no));
const textoScript = (no) => no.filhos.map((f) => f.texto ?? '').join('');

/** Texto visível mais atributos lidos por humanos, leitor de tela ou buscador. */
function textoComAtributos(no) {
  const attrs = buscar(no, () => true).flatMap((n) =>
    ['alt', 'title', 'aria-label', 'placeholder'].map((a) => n.attrs[a]).filter(Boolean),
  );
  return limpar(`${textoBruto(no)} ${attrs.join(' ')}`);
}

function hrefs(no) {
  return buscar(no, (n) => n.tag === 'a' && n.attrs.href).map((n) => n.attrs.href);
}

// ---------------------------------------------------------------- utilitários

const digitos = (s) => String(s ?? '').replace(/\D/g, '');
const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const normalizar = (s) =>
  semAcento(String(s).replace(/[º°ª]/g, '').toLowerCase()).replace(/[^a-z0-9]+/g, ' ').trim();
const contem = (haystack, agulha) => normalizar(haystack).includes(normalizar(agulha));
const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regexDigitos = (d) => d.split('').join('[.\\-\\s/]?');
const contexto = (s, i, n, raio = 40) => limpar(s.slice(Math.max(0, i - raio), i + n + raio));
const kb = (n) => `${(n / 1000).toFixed(1)} KB`;

function arquivos(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const p = join(dir, nome);
    return statSync(p).isDirectory() ? arquivos(p) : [p];
  });
}

function caminhoNoDist(url) {
  if (!url || /^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return null;
  return join(DIST, url.replace(/[?#].*$/, '').replace(/^\.?\//, ''));
}

// ---------------------------------------------------------------- fatos.json

/**
 * Lê caminhos exatos do schema do Pesquisador. Campo ausente reprova: valor da SPEC
 * só vale quando o arquivo inteiro não existe, para fato divergente nunca passar calado.
 */
function carregarFatos() {
  if (!existsSync(FATOS_PATH)) {
    aviso('docs/fatos.json não existe; usando os valores da SPEC seção 2.');
    return { ...FATOS_SPEC, fonte: 'SPEC seção 2', existe: false };
  }
  let json;
  try {
    json = JSON.parse(readFileSync(FATOS_PATH, 'utf8'));
  } catch (e) {
    check('leitor', 'docs/fatos.json é JSON válido', false, e.message);
    return { ...FATOS_SPEC, fonte: 'SPEC seção 2 (fatos.json inválido)', existe: false };
  }
  const ausentes = [];
  const pegar = (caminho) => caminho.split('.').reduce((o, k) => o?.[k], json);
  const exigir = (caminho) => {
    const v = pegar(caminho);
    if (v === undefined || v === null || v === '') ausentes.push(caminho);
    return v;
  };
  const registro = (caminho) => {
    const valor = exigir(`${caminho}.valor`);
    const confirmado = exigir(`${caminho}.confirmado`) === true;
    const numero = digitos(valor);
    if (confirmado && !numero) ausentes.push(`${caminho}.valor com número real (confirmado=true)`);
    return { digitos: confirmado ? numero : null, confirmado, valor };
  };

  const end = exigir('clinica.endereco.valor') ?? {};
  const endereco = ['linha', 'bairro', 'cidade', 'uf', 'cep'].map((k) => exigir(`clinica.endereco.valor.${k}`)).join(', ');
  const horario = {};
  for (const k of ['seg_sex', 'sab', 'dom']) horario[k] = exigir(`clinica.horario.valor.${k}`);
  const whatsapp = registro('whatsapp');
  const lista = exigir('avaliacoes.lista');
  const invalidos = (Array.isArray(lista) ? lista : []).filter((a) => typeof a?.texto !== 'string' || typeof a?.autor !== 'string');
  if (!Array.isArray(lista) || invalidos.length) ausentes.push('avaliacoes.lista com itens {autor, texto}');

  const incoerentes = [];
  (function varrer(no, rota) {
    if (no === null || typeof no !== 'object') return;
    if ('status' in no && 'confirmado' in no && (no.status === 'confirmado') !== (no.confirmado === true)) incoerentes.push(rota);
    for (const [k, v] of Object.entries(no)) varrer(v, `${rota}.${k}`);
  })(json, 'fatos');

  const fatos = {
    fonte: FATOS_PATH,
    existe: true,
    nomeMedica: exigir('medica.nome.valor'),
    telefone: exigir('clinica.telefone_fixo.valor'),
    celular: exigir('clinica.celular.valor'),
    endereco,
    enderecoCep: end.cep,
    cnpj: exigir('clinica.cnpj.valor'),
    crm: registro('crm'),
    rqe: registro('rqe'),
    whatsapp: whatsapp.digitos,
    candidatoWhatsapp: digitos(pegar('whatsapp.candidato_e164')),
    nota: exigir('avaliacoes.nota'),
    totalAvaliacoes: String(exigir('avaliacoes.total')),
    horario,
    avaliacoes: Array.isArray(lista) ? lista.filter((a) => !invalidos.includes(a)) : [],
    urlGoogle: exigir('avaliacoes.url_google'),
    instagram: String(exigir('redes.instagram_clinica.valor') ?? '').replace(/^@/, ''),
    convenios: [pegar('clinica.convenios.valor')].flat().filter(Boolean).map(String),
    servicos: Array.isArray(json.servicos) ? json.servicos : [],
    geo: Number.isFinite(pegar('mapa.latitude')) && Number.isFinite(pegar('mapa.longitude')) ? { latitude: pegar('mapa.latitude'), longitude: pegar('mapa.longitude') } : null,
    registroClinica: digitos(pegar('clinica.registro_crm.valor')),
    aConfirmar: (caminho) => pegar(`${caminho}.confirmado`) !== true,
    valores: valoresDosFatos(json),
  };
  check('leitor', 'fatos.json: todos os campos usados pelos checks existem', !ausentes.length, ausentes.join(', '));
  check('leitor', 'fatos.json: status e confirmado coerentes', !incoerentes.length, incoerentes.join(', '));
  return fatos;
}

/** Só o que é dado publicável; notas, fontes e URLs do Pesquisador não contam como fato. */
function valoresDosFatos(json) {
  const saida = [String(json.avaliacoes?.total ?? ''), String(json.avaliacoes?.nota ?? '')];
  const coletar = (no) => {
    if (typeof no === 'string' || typeof no === 'number') saida.push(String(no));
    else if (Array.isArray(no)) no.forEach(coletar);
    else if (no && typeof no === 'object') Object.values(no).forEach(coletar);
  };
  (function descer(no) {
    if (no === null || typeof no !== 'object') return;
    for (const [k, v] of Object.entries(no)) {
      if (k === '_meta') continue;
      if (k === 'valor') coletar(v);
      else descer(v);
    }
  })(json);
  (json.servicos ?? []).forEach((x) => saida.push(String(x.nome ?? ''), String(x.explicacao ?? '')));
  return saida.join(' \n ');
}

// ---------------------------------------------------------------- checks

function checarSecoes(ctx) {
  const { ids, raiz } = ctx;
  const corpoHtml = porTag(raiz, 'body')[0] ?? raiz;
  const montagem = ids.get('root')?.[0] ?? corpoHtml;
  check('prerender', 'HTML pré-renderizado, não apenas contêiner vazio', texto(montagem).length > 500, `${texto(montagem).length} caracteres em ${montagem === corpoHtml ? '<body>' : '#root'}`);

  for (const id of IDS_SECAO) {
    const nos = ids.get(id) ?? [];
    const tamanho = nos[0] ? texto(nos[0]).length : 0;
    check('secoes', `#${id} presente uma vez, com texto real`, nos.length === 1 && tamanho >= 30, nos.length === 1 ? `${tamanho} caracteres` : `${nos.length} ocorrências`);
  }
}

function checarConteudoSecoes(ctx) {
  const { sec, fatos } = ctx;
  const t = (id) => (sec(id) ? texto(sec(id)) : '');

  const hero = t('hero');
  check('conteudo', '#hero: nome, especialidade, nota e total de avaliações',
    contem(hero, 'Luciana Salgado') && /oftalmolog/i.test(hero) && hero.includes(fatos.nota) && hero.includes(digitos(fatos.totalAvaliacoes)),
    `esperado nota ${fatos.nota} e ${fatos.totalAvaliacoes} avaliações`);
  if (sec('hero')) {
    const ocultos = buscar(sec('hero'), (n) => n.attrs.hidden !== undefined
      || /(opacity\s*:\s*0(\.0+)?\s*(;|$)|visibility\s*:\s*hidden|display\s*:\s*none)/i.test(n.attrs.style ?? '')
      || /(^|\s)(opacity-0|invisible)(\s|$)/.test(n.attrs.class ?? ''));
    const so3d = (n) => ['canvas', 'svg'].includes(n.tag) || n.attrs['aria-hidden'] === 'true';
    const problema = ocultos.filter((n) => !so3d(n));
    check('conteudo', '#hero: texto e CTAs não nascem ocultos no HTML (visíveis antes da animação)', !problema.length, problema.map((n) => `<${n.tag} style="${n.attrs.style ?? ''}" class="${n.attrs.class ?? ''}">`).join(', '));
    // Regra 7: a imagem é o que aparece sem WebGL e antes do 3D, então já vem no HTML.
    check('conteudo', '#hero: imagem estática já no HTML', porTag(sec('hero'), 'img', 'picture').length > 0);
    check('conteudo', '#hero: sem <canvas> no HTML pré-renderizado', !porTag(sec('hero'), 'canvas').length);
  }

  const dif = normalizar(t('diferenciais'));
  const faltam = [/domingo/, /catarata/, /idades|crianca/, /acessib|acessiv/].filter((p) => !p.test(dif)).map((p) => p.source);
  check('conteudo', '#diferenciais: domingo, catarata, idades, acessibilidade, nota', !faltam.length && t('diferenciais').includes(fatos.nota), faltam.length ? `faltam: ${faltam.join(', ')}` : '');

  const med = sec('medica');
  check('conteudo', '#medica: idiomas', /ingl[eê]s/i.test(t('medica')));
  check('conteudo', '#medica: formação (UniFOA e CBO)', /unifoa/i.test(t('medica')) && /\bCBO\b|Conselho Brasileiro de Oftalmologia/i.test(t('medica')));
  const temFoto = med && (porTag(med, 'img', 'picture').length > 0 || temConfirmar(textoComAtributos(med)));
  check('conteudo', '#medica: foto, ou [CONFIRMAR] enquanto não vier da clínica', temFoto);
  const imgSemAlt = med ? porTag(med, 'img').filter((n) => !n.attrs.alt) : [];
  check('conteudo', '#medica: foto com alt', !imgSemAlt.length);

  const serv = normalizar(t('servicos'));
  const grupos = ['consultas', 'cirurgia', 'exames', 'criancas', 'pequenos procedimentos'].filter((g) => !serv.includes(g));
  check('conteudo', '#servicos: cinco grupos da SPEC', !grupos.length, grupos.length ? `faltam: ${grupos.join(', ')}` : '');
  const servicos = fatos.servicos.filter((x) => x.nome);
  const confirmados = servicos.filter((x) => x.status === 'confirmado');
  // Serviço a confirmar fica fora da página enquanto os marcadores estiverem ocultos (decisão do dono).
  const semNome = confirmados.filter((x) => !serv.includes(normalizar(x.nome))).map((x) => x.nome);
  check('conteudo', `#servicos: todos os serviços confirmados de fatos.json (${confirmados.length})`, !semNome.length, semNome.join(' | '));
  const semExplicacao = confirmados.filter((x) => x.explicacao && !serv.includes(normalizar(x.explicacao))).map((x) => x.nome);
  check('conteudo', 'regra 5: serviço com a explicação curta de fatos.json', !semExplicacao.length, semExplicacao.join(' | '));

  const hor = t('horarios');
  const horaRe = (h) => `0?${Number(h)}(?:h| h| 00)?`;
  const horNorm = normalizar(hor);
  const diasErrados = [['seg_sex', 'seg'], ['sab', 'sab'], ['dom', 'dom']].filter(([chave, dia]) => {
    const [abre, fecha] = String(fatos.horario[chave] ?? '').match(/\d{1,2}/g) ?? [];
    return !new RegExp(`${dia}[a-z ]{0,30}\\b${horaRe(abre)} [a-z ]{0,6}\\b${horaRe(fecha)}\\b`).test(horNorm);
  });
  check('conteudo', '#horarios: cada dia com o horário dos fatos', !diasErrados.length, diasErrados.map(([c]) => `${c}: esperado ${fatos.horario[c]}`).join(', '));
  check('conteudo', '#horarios: endereço e acessibilidade', contem(hor, 'Volta Redonda') && /acess[ií]v|acessibilidade|cadeira de rodas/i.test(hor));
  check('conteudo', '#horarios: tabela real (<table>)', sec('horarios') && porTag(sec('horarios'), 'table').length > 0);

  if (sec('faq')) {
    const f = sec('faq');
    const blocos = [porTag(f, 'details'), porTag(f, 'dt'), porTag(f, 'h3')].find((l) => l.length);
    const total = blocos ? blocos.length : (t('faq').match(/\?/g) ?? []).length;
    check('conteudo', '#faq: 5 a 7 perguntas', total >= 5 && total <= 7, `${total} perguntas`);
  } else {
    check('conteudo', '#faq: 5 a 7 perguntas', false, 'seção ausente');
  }

  const rod = t('rodape');
  check('conteudo', '#rodape: CNPJ e endereço', digitos(rod).includes(digitos(fatos.cnpj)) && contem(rod, 'Volta Redonda'));
  const insta = sec('rodape') ? hrefs(sec('rodape')).filter((h) => h.toLowerCase().includes(`instagram.com/${fatos.instagram.toLowerCase()}`)) : [];
  check('conteudo', `#rodape: link para Instagram @${fatos.instagram}`, insta.length > 0);

  // Contrato de markup de docs/arquitetura.md, seção 3.
  const h1s = porTag(ctx.raiz, 'h1');
  check('conteudo', 'um único <h1>, dentro de #hero', h1s.length === 1 && Boolean(sec('hero')) && porTag(sec('hero'), 'h1').length === 1, `${h1s.length} encontrado(s)`);
  const semH2 = ['diferenciais', 'medica', 'servicos', 'avaliacoes', 'horarios', 'faq', 'cta-final'].filter((id) => !sec(id) || porTag(sec(id), 'h2').length !== 1);
  check('conteudo', 'um <h2> por seção', !semH2.length, semH2.join(', '));
}

const ENUM_ESPECIALIDADE = new Set(['Anesthesia', 'Audiology', 'Cardiovascular', 'CommunityHealth', 'Dentistry', 'Dermatologic', 'Dermatology', 'DietNutrition', 'Emergency', 'Endocrine', 'Gastroenterologic', 'Genetic', 'Geriatric', 'Gynecologic', 'Hematologic', 'Infectious', 'LaboratoryScience', 'Midwifery', 'Musculoskeletal', 'Neurologic', 'Nursing', 'Obstetric', 'OccupationalTherapy', 'Oncologic', 'Optometric', 'Otolaryngologic', 'Pathology', 'Pediatric', 'PharmacySpecialty', 'Physiotherapy', 'PlasticSurgery', 'Podiatric', 'PrimaryCare', 'Psychiatric', 'PublicHealth', 'Pulmonary', 'Radiography', 'Renal', 'RespiratoryTherapy', 'Rheumatologic', 'SpeechPathology', 'Surgical', 'Toxicologic', 'Urologic']);

function checarSeo(ctx) {
  const { raiz, ldBlocos } = ctx;
  const html = porTag(raiz, 'html')[0];
  check('seo', 'lang="pt-BR"', html?.attrs.lang === 'pt-BR', html?.attrs.lang ?? 'sem <html>');

  const titulos = porTag(raiz, 'title').filter((n) => !buscar(raiz, (s) => s.tag === 'svg').some((s) => porTag(s, 'title').includes(n)));
  const titulo = titulos[0] ? limpar(textoScript(titulos[0])) : '';
  check('seo', '<title> único e preenchido', titulos.length === 1 && titulo.length >= 10, titulo);
  check('seo', '<title> sem resíduo do scaffold', !/\b(vite|react|stub|scaffold)\b/i.test(titulo), titulo);
  // vite-react-ssg escreve <title> e metas antes do charset; o navegador só procura nos primeiros 1024 bytes.
  check('seo', '<meta charset> UTF-8 nos primeiros 1024 bytes', /<meta[^>]+charset=["']?utf-?8/i.test(Buffer.from(ctx.htmlBruto).subarray(0, 1024).toString('latin1')));

  const metas = porTag(raiz, 'meta');
  const meta = (attr, nome) => metas.find((m) => m.attrs[attr] === nome)?.attrs.content?.trim() ?? '';
  const descricao = meta('name', 'description');
  check('seo', 'meta description preenchida', descricao.length >= 50, `${descricao.length} caracteres`);
  if (descricao.length > 165) aviso(`meta description com ${descricao.length} caracteres pode ser cortada no Google.`);
  for (const prop of ['og:title', 'og:description', 'og:type', 'og:image']) {
    check('seo', `Open Graph: ${prop}`, meta('property', prop).length > 0, meta('property', prop).slice(0, 70));
  }
  const ogImagem = meta('property', 'og:image');
  if (ogImagem) {
    // WhatsApp e Facebook só leem URL absoluta; o arquivo precisa existir no deploy.
    check('seo', 'og:image com URL absoluta https', /^https:\/\//.test(ogImagem), ogImagem);
    const caminho = join(DIST, ogImagem.replace(/^https?:\/\/[^/]+/, '').replace(/[?#].*$/, ''));
    check('seo', 'og:image existe em dist', existsSync(caminho), relative(DIST, caminho));
  }
  if (!meta('property', 'og:url')) aviso('og:url ausente.');
  check('seo', 'meta viewport para celular', /width=device-width/.test(meta('name', 'viewport')));
  if (!buscar(raiz, (n) => n.tag === 'link' && n.attrs.rel === 'canonical').length) aviso('link canonical ausente.');

  const entradas = [];
  let jsonOk = ldBlocos.length > 0;
  for (const bloco of ldBlocos) {
    try {
      const dado = JSON.parse(textoScript(bloco));
      const fila = Array.isArray(dado) ? [...dado] : [dado];
      while (fila.length) {
        const item = fila.shift();
        if (Array.isArray(item?.['@graph'])) fila.push(...item['@graph']);
        if (item && typeof item === 'object') entradas.push(item);
      }
    } catch (e) {
      jsonOk = false;
      check('jsonld', 'bloco JSON-LD é JSON válido', false, e.message);
    }
  }
  check('jsonld', 'JSON-LD presente e válido', jsonOk, `${ldBlocos.length} bloco(s)`);
  const temTipo = (tipo) => entradas.filter((e) => [e['@type']].flat().includes(tipo));
  const clinica = temTipo('MedicalClinic')[0];
  check('jsonld', 'tipo MedicalClinic', Boolean(clinica));
  check('jsonld', 'tipo Physician', temTipo('Physician').length > 0);
  check('jsonld', '@context schema.org', ldBlocos.length > 0 && ldBlocos.every((b) => /schema\.org/.test(textoScript(b))));
  if (clinica) {
    const { fatos } = ctx;
    check('jsonld', 'telefone da clínica confere com os fatos', digitos(clinica.telephone).endsWith(digitos(fatos.telefone)), String(clinica.telephone));
    const cep = String(clinica.address?.postalCode ?? '');
    check('jsonld', 'CEP da clínica confere com os fatos', digitos(fatos.endereco).includes(digitos(cep)) && cep.length > 0, cep);
    const local = String(clinica.address?.addressLocality ?? '');
    check('jsonld', 'cidade da clínica confere com os fatos', local !== '' && contem(fatos.endereco, local), local);
    const nota = clinica.aggregateRating;
    if (nota) {
      const valor = Number(String(nota.ratingValue).replace(',', '.'));
      const iguais = digitos(nota.reviewCount ?? nota.ratingCount) === digitos(fatos.totalAvaliacoes) && valor === Number(String(fatos.nota).replace(',', '.'));
      check('jsonld', 'aggregateRating confere com os fatos', iguais, JSON.stringify(nota));
    }
  }
  // Erros que validator.schema.org acusa e o Google ignora em silêncio (ciclo 1, A2).
  const especialidades = entradas.flatMap((e) => [e.medicalSpecialty].flat()).filter(Boolean).map((v) => String(v).replace(/^https?:\/\/schema\.org\//, ''));
  const foraDoEnum = especialidades.filter((v) => !ENUM_ESPECIALIDADE.has(v));
  check('jsonld', 'medicalSpecialty só com valor do enum de schema.org', !foraDoEnum.length, foraDoEnum.join(', '));
  const idsMedicos = new Set(temTipo('Physician').map((m) => m['@id']).filter(Boolean));
  const employeeErrado = entradas.flatMap((e) => [e.employee].flat()).filter((v) => v && idsMedicos.has(v['@id']));
  check('jsonld', 'employee não aponta para Physician (employee exige Person)', !employeeErrado.length);
  check('jsonld', 'Physician sem worksFor (propriedade de Person)', !temTipo('Physician').some((m) => m.worksFor));
  const medicos = temTipo('Physician');
  if (medicos.length) {
    const nomeFato = ctx.fatos.nomeMedica;
    check('jsonld', 'Physician com o nome dos fatos', medicos.some((m) => contem(nomeFato, String(m.name ?? '-')) && String(m.name ?? '').length > 5), medicos.map((m) => m.name).join(', '));
  }
  const brutoLd = ldBlocos.map(textoScript).join(' ');
  // geo é opcional, mas só com as coordenadas de fatos.json.
  const { geo } = ctx.fatos;
  const coordenadas = [...brutoLd.matchAll(/"(latitude|longitude)"\s*:\s*"?(-?[\d.]+)/g)];
  check('jsonld', 'geo só com as coordenadas de fatos.json', (geo || !entradas.some((e) => e.geo)) && coordenadas.every(([, chave, valor]) => geo && Number(valor) === geo[chave]), coordenadas.map((m) => m[0]).join(', '));
  check('jsonld', 'sem depoimento em JSON-LD enquanto avaliacoes.lista estiver vazia', ctx.fatos.avaliacoes?.length !== 0 || !/"review"/i.test(brutoLd));
  check('jsonld', 'WhatsApp candidato fora do JSON-LD enquanto não confirmado', Boolean(ctx.fatos.whatsapp) || !digitos(brutoLd).includes(ctx.fatos.candidatoWhatsapp.slice(2)));
  check('seo', '"Integrativa" fora de título e JSON-LD (fatos: não é especialidade)', !/integrativa/i.test(`${titulo} ${brutoLd}`));
}

function checarPublic() {
  const sitemap = join(DIST, 'sitemap.xml');
  const robots = join(DIST, 'robots.txt');
  const xml = existsSync(sitemap) ? readFileSync(sitemap, 'utf8') : '';
  const txt = existsSync(robots) ? readFileSync(robots, 'utf8') : '';
  check('public', 'sitemap.xml em dist, com <urlset> e <loc> absoluto', /<urlset/.test(xml) && /<loc>https:\/\//.test(xml));
  check('public', 'robots.txt em dist, com User-agent', /user-agent/i.test(txt));
  check('public', 'robots.txt não bloqueia o site inteiro', txt !== '' && !/^\s*disallow:\s*\/\s*$/im.test(txt));
  if (txt && !/sitemap:/i.test(txt)) aviso('robots.txt não aponta para o sitemap.');
}

/** Tudo que o HTML carrega da própria origem precisa existir; nada de fonte de terceiros. */
function checarArquivos(ctx) {
  const { raiz } = ctx;
  const urls = [
    ...porTag(raiz, 'img', 'source', 'script').flatMap((n) => [n.attrs.src, ...(n.attrs.srcset ?? '').split(',').map((p) => p.trim().split(/\s+/)[0])]),
    ...porTag(raiz, 'link').filter((l) => l.attrs.rel !== 'canonical').map((l) => l.attrs.href),
  ].filter(Boolean);
  const quebrados = [...new Set(urls)].filter((u) => {
    const p = caminhoNoDist(u);
    return p && !existsSync(p);
  });
  check('public', 'arquivos locais citados no HTML existem em dist', !quebrados.length, quebrados.join(', '));
  const estilos = arquivos(DIST).filter((p) => p.endsWith('.css')).map((p) => readFileSync(p, 'utf8'));
  const terceiros = /fonts\.(googleapis|gstatic)\.com|use\.typekit\.net|fonts\.bunny\.net/i;
  const fontes = [urls.join(' '), ...estilos].filter((t) => terceiros.test(t));
  check('public', 'fontes self-hosted, sem CDN de fontes', !fontes.length);
  const residuos = arquivos(DIST).map((p) => relative(DIST, p)).filter((p) => /(^|\/)(vite|react|icons)\.svg$/.test(p));
  check('public', 'sem arquivos de exemplo do scaffold em dist', !residuos.length, residuos.join(', '));
}

function checarStack() {
  if (!existsSync(PACKAGE_PATH)) {
    aviso(`package.json não encontrado em ${PACKAGE_PATH}; scripts e dependências não verificados.`);
    return;
  }
  const pkg = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8'));
  const scripts = pkg.scripts ?? {};
  const semScript = ['dev', 'build', 'preview', 'check'].filter((n) => !scripts[n]);
  check('stack', 'scripts dev, build, preview, check', !semScript.length, semScript.join(', '));
  check('stack', 'script check roda tests/checks.mjs (decisão 3)', /tests\/checks\.mjs/.test(scripts.check ?? ''), scripts.check ?? '');
  if (!scripts.prebuild) aviso('script prebuild ausente (decisão 10): src/data pode ficar defasado de docs/.');
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const bases = ['vite', 'react', 'react-dom', 'typescript', 'tailwindcss', 'gsap', 'three', '@react-three/fiber', '@react-three/drei', 'lucide-react'];
  const semDep = bases.filter((d) => !deps[d]);
  check('stack', 'bases da SPEC seção 4 no package.json', !semDep.length, semDep.join(', '));
  if (!deps['vite-react-ssg']) aviso('vite-react-ssg ausente: conferir em docs/arquitetura.md, seção 4, qual pré-renderização vale.');
}

// Chunks reconhecidos só pelo conteúdo: nome e hash mudam com o bundler e com a pré-renderização.
const ASSINATURA_THREE = /\bWebGLRenderer\b|\bWebGLRenderTarget\b|\bTHREE\.|__THREE__|@react-three|__r3f\b/;
// vite-react-ssg entra no react-dom por import() dentro do entry. Sem somar esse chunk,
// o bundle pareceria ter 12,8 KB quando o navegador baixa 78,1 KB para hidratar (decisão 6).
const ASSINATURA_REACT_DOM = /__reactContainer|__reactFiber/;
// unstable_forceFrameRate só existe na definição do scheduler; o react-dom usa os outros unstable_*.
const ASSINATURA_SCHEDULER = /unstable_forceFrameRate/;

const conteudos = new Map();
function ler(p) {
  if (!conteudos.has(p)) conteudos.set(p, readFileSync(p, 'utf8'));
  return conteudos.get(p);
}

function importsEm(js, resolverCaminho) {
  const reEstatico = /(?:^|[;\s})/])(?:import|export)\s*(?:[^"'`;]*?\bfrom\s*)?["'`]((?:\.{1,2})?\/[^"'`]+\.m?js)["'`]/g;
  const reDinamico = /\bimport\(\s*["'`]((?:\.{1,2})?\/[^"'`]+\.m?js)["'`]\s*\)/g;
  const extrair = (re) => [...js.matchAll(re)].map((m) => resolverCaminho(m[1])).filter(existsSync);
  return { estaticos: extrair(reEstatico), dinamicos: extrair(reDinamico) };
}

const importsDe = (arquivo) => importsEm(ler(arquivo), (s) => (s.startsWith('/') ? join(DIST, s) : resolve(dirname(arquivo), s)));

function fechoEstatico(iniciais) {
  const vistos = new Set(iniciais);
  const fila = [...vistos];
  while (fila.length) {
    for (const dep of importsDe(fila.shift()).estaticos) {
      if (!vistos.has(dep)) {
        vistos.add(dep);
        fila.push(dep);
      }
    }
  }
  return vistos;
}

const ehChunkThree = (p) => ASSINATURA_THREE.test(ler(p));
const ehReactDom = (p) => ASSINATURA_REACT_DOM.test(ler(p));

/** Amplia o conjunto seguindo import() cujo alvo passa no teste, com seus imports estáticos. */
function seguirDinamicos(conjunto, aceita) {
  const saida = new Set(conjunto);
  let mudou = true;
  while (mudou) {
    mudou = false;
    for (const p of [...saida]) {
      for (const alvo of importsDe(p).dinamicos) {
        if (saida.has(alvo)) continue;
        const fecho = fechoEstatico([alvo]);
        if (!aceita(alvo, fecho)) continue;
        for (const dep of fecho) saida.add(dep);
        mudou = true;
      }
    }
  }
  return saida;
}

function checarBundle(ctx) {
  const { raiz } = ctx;
  const entradasDist = new Set();
  const faltando = [];
  const externos = [];

  const entradas = [
    ...porTag(raiz, 'script').filter((s) => s.attrs.src).map((s) => s.attrs.src),
    ...porTag(raiz, 'link')
      .filter((l) => l.attrs.rel === 'modulepreload' || (l.attrs.rel === 'preload' && l.attrs.as === 'script'))
      .map((l) => l.attrs.href),
  ];
  for (const url of entradas) {
    const p = caminhoNoDist(url);
    if (!p) externos.push(url);
    else if (existsSync(p)) entradasDist.add(p);
    else faltando.push(url);
  }
  // Pré-renderização pode iniciar o app por script inline, sem <script src>.
  for (const s of porTag(raiz, 'script').filter((n) => !n.attrs.src && !/json/.test(n.attrs.type ?? ''))) {
    const { estaticos, dinamicos } = importsEm(textoScript(s), (u) => join(DIST, u));
    for (const p of [...estaticos, ...dinamicos]) entradasDist.add(p);
  }

  // Inicial: HTML, imports estáticos e o react-dom da hidratação. Chunk lazy que só compartilha
  // o react-dom com o 3D não entra: quem tem Three.js no fecho nunca é inicial por este caminho.
  const iniciais = seguirDinamicos(fechoEstatico(entradasDist), (_alvo, fecho) => {
    const lista = [...fecho];
    return lista.some(ehReactDom) && !lista.some(ehChunkThree);
  });
  // Incondicional: numa landing page só o 3D é condicional; o resto chega a todo visitante.
  const incondicionais = seguirDinamicos(iniciais, (_alvo, fecho) => ![...fecho].some(ehChunkThree));

  const inline = porTag(raiz, 'script')
    .filter((s) => !s.attrs.src && !/json/.test(s.attrs.type ?? ''))
    .map(textoScript)
    .join('\n');
  const gz = (p) => gzipSync(readFileSync(p), { level: 9 }).length;
  const inlineGz = inline.trim() ? gzipSync(inline, { level: 9 }).length : 0;
  const soma = (conjunto) => [...conjunto].reduce((t, p) => t + gz(p), inlineGz);
  const totalInicial = soma(iniciais);
  const totalIncondicional = soma(incondicionais);

  check('bundle', 'arquivos referenciados no HTML existem em dist', !faltando.length, faltando.join(', '));
  check('bundle', 'existe JS inicial medível', iniciais.size > 0);
  check('bundle', 'react-dom da hidratação somado ao JS inicial', [...iniciais].some(ehReactDom), 'sem react-dom a medição não é confiável');
  check('bundle', 'scheduler somado ao JS inicial', [...iniciais].some((p) => ASSINATURA_SCHEDULER.test(ler(p))), 'decisão 6');
  check('bundle', `JS inicial ≤ ${kb(LIMITE_JS_GZIP)} gzip`, totalInicial <= LIMITE_JS_GZIP && iniciais.size > 0, `${kb(totalInicial)} em ${iniciais.size} arquivo(s) e ${kb(inlineGz)} inline`);
  check('bundle', `JS incondicional (tudo menos 3D) ≤ ${kb(LIMITE_JS_GZIP)} gzip`, totalIncondicional <= LIMITE_JS_GZIP && iniciais.size > 0, `${kb(totalIncondicional)} em ${incondicionais.size} arquivo(s)`);
  for (const p of iniciais) info(`JS inicial: ${relative(DIST, p)} = ${kb(gz(p))} gzip`);
  for (const p of incondicionais) if (!iniciais.has(p)) info(`JS depois da hidratação: ${relative(DIST, p)} = ${kb(gz(p))} gzip`);
  for (const url of externos) aviso(`Script externo no carregamento inicial, fora da medição: ${url}`);

  const css = porTag(raiz, 'link').filter((l) => l.attrs.rel === 'stylesheet').map((l) => caminhoNoDist(l.attrs.href)).filter((p) => p && existsSync(p));
  if (css.length) info(`CSS inicial: ${kb(css.reduce((t, p) => t + gz(p), 0))} gzip`);

  const todosJs = arquivos(DIST).filter((p) => /\.m?js$/.test(p));
  const iniciaisComThree = [...incondicionais].filter(ehChunkThree);
  const lazyComThree = todosJs.filter((p) => !incondicionais.has(p) && ehChunkThree(p));
  check('bundle', 'Three.js fora do JS inicial e incondicional (script, modulepreload, imports)', !iniciaisComThree.length, iniciaisComThree.map((p) => relative(DIST, p)).join(', '));
  check('bundle', 'Three.js existe em chunk lazy separado', lazyComThree.length > 0, lazyComThree.map((p) => relative(DIST, p)).join(', '));
}

function checarFormularios() {
  const htmls = arquivos(DIST).filter((p) => p.endsWith('.html'));
  const achados = [];
  for (const p of htmls) {
    const raiz = parseHtml(readFileSync(p, 'utf8'));
    for (const n of porTag(raiz, 'form', 'input', 'textarea', 'select')) achados.push(`<${n.tag}> em ${relative(DIST, p)}`);
  }
  check('lgpd', 'nenhum <form>, <input>, <textarea> ou <select> no HTML', !achados.length, achados.join(', '));
}

// Cada termo tem regex e, quando existe uso legítimo óbvio, uma exceção. Ocorrências
// liberadas pela exceção saem como INFO para conferência manual.
const B = '(?<![\\p{L}\\p{N}])';
const E = '(?![\\p{L}\\p{N}])';
const TERMOS = [
  {
    nome: '"o melhor" / "a melhor"',
    re: new RegExp(`${B}(?:[oa]s?|ao|aos|às|do|da|dos|das|no|na|nos|nas|pelo|pela)\\s+melhor(?:es)?${E}`, 'giu'),
    livre: (_antes, depois) => /^\s*(hor[aá]rio|dia|momento|forma|maneira|conduta)/i.test(depois),
  },
  {
    nome: '"melhor" sem artigo',
    re: new RegExp(`${B}melhor(?:es)?\\s+(?:cl[ií]nicas?|m[eé]dic[oa]s?|oftalmo\\p{L}*|cirurgi\\p{L}*|especialistas?|atendimentos?|tratamentos?)${E}`, 'giu'),
  },
  { nome: '"garantido"', re: new RegExp(`${B}garantid[oa]s?${E}`, 'giu') },
  {
    nome: '"garantia"',
    re: new RegExp(`${B}(?:garantias?|garantimos)${E}`, 'giu'),
    livre: (antes) => /(não|sem|nenhuma)(\s+\p{L}+)?\s*$/iu.test(antes),
  },
  {
    nome: '"antes e depois"',
    re: new RegExp(`${B}antes\\s*(?:e|x|&|/|-|–|vs\\.?)\\s*depois${E}`, 'giu'),
    // Decisão 9: só a sequência do teste de sobrecarga hídrica. "Antes e depois da cirurgia"
    // reprova de propósito: é o sentido de resultado que a resolução proíbe.
    livre: (_antes, depois) => /^\s*de\s+beber\s+[aá]gua\b/i.test(depois),
  },
  { nome: 'preço em R$', re: /R\$/gi },
  { nome: 'preço como chamariz', re: new RegExp(`${B}(?:promo[cç](?:[aã]o|[oõ]es)|descontos?|gr[aá]tis|gratuit[oa]s?|parcelamos)${E}`, 'giu') },
  {
    nome: '"referência"',
    re: new RegExp(`${B}refer[eê]ncias?${E}`, 'giu'),
    livre: (antes) => /(pontos?|valor|valores)\s+de\s*$/i.test(antes),
  },
  { nome: '"perfeito"', re: new RegExp(`${B}perfeit[oa]s?${E}`, 'giu') },
];
const TERMOS_AVISO = /(?<![\p{L}\p{N}])(100\s*%|sem dor|sem riscos?|exclusiv[oa]s?|l[ií]der|excel[eê]ncia|únic[oa]\s+(?:clínica|médica|em)|garant(?:e|em|ir)|cura(?:r|mos)?|definitiv[oa]s?|recupera[cç][aã]o r[aá]pida)(?![\p{L}\p{N}])/giu;

function checarCfm(ctx) {
  const { textoTotal } = ctx;
  for (const termo of TERMOS) {
    const proibidos = [];
    for (const m of textoTotal.matchAll(termo.re)) {
      const antes = textoTotal.slice(Math.max(0, m.index - 40), m.index);
      const depois = textoTotal.slice(m.index + m[0].length, m.index + m[0].length + 40);
      const trecho = contexto(textoTotal, m.index, m[0].length);
      if (termo.livre?.(antes, depois)) info(`Termo em contexto permitido (${termo.nome}): "${trecho}"`);
      else proibidos.push(trecho);
    }
    check('cfm', `sem ${termo.nome}`, !proibidos.length, proibidos.map((p) => `"${p}"`).join(' | '));
  }
  for (const m of textoTotal.matchAll(TERMOS_AVISO)) {
    aviso(`Revisar à mão (promessa ou superioridade?): "${contexto(textoTotal, m.index, m[0].length)}"`);
  }
}

const FATOS_A_CONFIRMAR = [
  { caminho: 'medica.fellowship_catarata', re: /HUNING|fellowship/gi, rotulo: 'fellowship' },
  { caminho: 'medica.especializacao', re: /PUC[-\s]?Rio/gi, rotulo: 'especialização PUC-Rio' },
  { caminho: 'medica.residencia_instituicao', re: /Gamboa/gi, rotulo: 'Hospital da Gamboa' },
  { caminho: 'medica.idiomas', re: /ingl[eê]s/gi, rotulo: 'idiomas' },
  { caminho: 'clinica.pagamento', re: /\bNFC\b|cart[aã]o de cr[eé]dito|d[eé]bito/gi, rotulo: 'pagamento' },
  { caminho: 'clinica.espaco_seguro_trans', re: /pessoas trans/gi, rotulo: 'espaço seguro trans' },
  { caminho: 'clinica.todas_as_idades', re: /todas as idades/gi, rotulo: 'todas as idades' },
];

function checarFatos(ctx) {
  const { sec, fatos, corpo, raiz, textoTotal } = ctx;
  const nome = fatos.nomeMedica;
  check('fatos', `nome da médica no HTML: ${nome}`, contem(corpo, nome));
  check('fatos', `telefone ${fatos.telefone} no HTML`, digitos(corpo).includes(digitos(fatos.telefone)));
  const tels = hrefs(raiz).filter((h) => h.startsWith('tel:'));
  check('fatos', 'link tel: com o telefone dos fatos', tels.some((h) => digitos(h).endsWith(digitos(fatos.telefone))), tels.join(', '));
  // Número de WhatsApp confirmado é fato, mesmo quando difere do celular dos diretórios.
  const telsValidos = [digitos(fatos.telefone), digitos(fatos.celular), ...(fatos.whatsapp ? [fatos.whatsapp.replace(/^55/, '')] : [])];
  const naLista = (d) => telsValidos.some((t) => d.endsWith(t));
  const telsVistos = (corpo.match(/\(?\b\d{2}\)?[\s.-]?\d{4,5}[\s.-]\d{4}(?!\d)/g) ?? []).filter((t) => !naLista(digitos(t)));
  check('fatos', 'nenhum telefone fora dos fatos (texto e tel:)', !telsVistos.length && tels.every((h) => naLista(digitos(h))), [...telsVistos, ...tels.filter((h) => !naLista(digitos(h)))].join(', '));
  const cortes = fatos.endereco.split(/[,;·/]| - /).map((p) => p.trim()).filter(Boolean);
  const faltaEndereco = cortes.filter((p) => !contem(corpo, p));
  check('fatos', 'endereço completo no HTML', !faltaEndereco.length, faltaEndereco.length ? `faltam: ${faltaEndereco.join(' | ')}` : '');
  check('fatos', `CNPJ ${fatos.cnpj} no HTML`, digitos(corpo).includes(digitos(fatos.cnpj)));
  const cnpjs = [...corpo.matchAll(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g)].map((m) => m[0]).filter((c) => digitos(c) !== digitos(fatos.cnpj));
  check('fatos', 'nenhum CNPJ diferente dos fatos', !cnpjs.length, cnpjs.join(', '));
  const totais = [...semMarcadores(corpo).matchAll(/(\d[\d.]*)\s+avalia[cç][oõ]es/gi)].map((m) => digitos(m[1])).filter((n) => n !== digitos(fatos.totalAvaliacoes));
  check('fatos', 'total de avaliações igual aos fatos em toda a página', !totais.length, totais.join(', '));

  // Registro confirmado exige o número exato; não confirmado exige o marcador, nunca outro número.
  const reRegistro = (sigla, reg) => (reg.confirmado
    ? new RegExp(`${sigla}[^\\d\\[]{0,20}${regexDigitos(reg.digitos)}(?!\\d)`, 'i')
    : new RegExp(`${sigla}(?:(?!CRM|RQE)[^\\[]){0,30}${FONTE_CONFIRMAR}`, 'i'));
  const primeiroNome = nome.replace(/^(Dra?\.?|Doutora)\s+/i, '').split(/\s+/)[0];
  const reDra = new RegExp(`(?:Dra\\.?|Doutora)\\s+${escapar(primeiroNome)}`, 'giu');
  const reCrm = reRegistro('CRM', fatos.crm);
  const reRqe = reRegistro('RQE', fatos.rqe);
  const esperado = (sigla, reg) => (reg.confirmado ? `esperado ${sigla} ${reg.digitos}` : `não confirmado: esperado ${sigla} [CONFIRMAR]`);

  for (const id of ['hero', 'medica', 'rodape']) {
    const t = sec(id) ? textoComAtributos(sec(id)) : '';
    const ocorrencias = [...t.matchAll(reDra)];
    const janelas = ocorrencias.map((m) => t.slice(Math.max(0, m.index - JANELA_NOME), m.index + JANELA_NOME));
    check('cfm', `#${id}: CRM junto do nome da médica`, janelas.some((j) => reCrm.test(j)), ocorrencias.length ? esperado('CRM', fatos.crm) : 'nome "Dra. ..." não encontrado na seção');
    check('cfm', `#${id}: RQE junto do nome da médica`, janelas.some((j) => reRqe.test(j)), esperado('RQE', fatos.rqe));
    check('cfm', `#${id}: especialidade junto do nome da médica`, janelas.some((j) => /oftalmolog/i.test(j)));
    // Resolução CFM 2.336/2023, art. 4º, I: a palavra "médica" acompanha o CRM (docs/conteudo.md).
    check('cfm', `#${id}: palavra "médica" junto do CRM`, janelas.some((j) => /m[eé]dic[ao][^\p{L}\p{N}]{0,5}CRM/iu.test(j)));
  }
  // Art. 5º, I, a e b: a clínica mostra o próprio registro e o Diretor Técnico-Médico.
  const rodape = sec('rodape') ? texto(sec('rodape')) : '';
  const dado = (rotulo, caminho, numero) => {
    const nome = caminho.split('.').pop();
    check('cfm', `#rodape: ${rotulo}`, contem(rodape, rotulo));
    if (fatos.aConfirmar(caminho)) check('cfm', `#rodape: ${nome} com [CONFIRMAR] enquanto não confirmado`, [...rodape.matchAll(new RegExp(FONTE_CONFIRMAR, 'g'))].some((m) => contem(m[0], rotulo)));
    else if (numero) check('cfm', `#rodape: ${nome} com o número dos fatos`, digitos(rodape).includes(numero));
  };
  dado('registro no CRM', 'clinica.registro_crm', fatos.registroClinica);
  dado('diretor técnico-médico', 'clinica.responsavel_tecnico');

  for (const [sigla, reg] of [['CRM', fatos.crm], ['RQE', fatos.rqe]]) {
    // Sem atravessar colchete: "[CONFIRMAR: registro no CRM da clínica] CNPJ 30..." não é um CRM.
    const vistos = [...textoTotal.matchAll(new RegExp(`${sigla}[^\\d\\[\\]]{0,20}(\\d[\\d.\\-/]*\\d)`, 'gi'))].map((m) => digitos(m[1]));
    const errados = vistos.filter((d) => d !== digitos(reg.valor));
    check('fatos', `nenhum ${sigla} diferente dos fatos em toda a página, inclusive JSON-LD`, !errados.length, errados.join(', '));
  }

  const conveniosRe = /(?<![\p{L}])(unimed|amil|bradesco sa[uú]de|sulam[eé]rica|hapvida|notredame|cassi|geap|porto sa[uú]de)(?![\p{L}])/giu;
  const citados = [...corpo.matchAll(conveniosRe)].map((m) => m[0]).filter((c) => !fatos.convenios.some((v) => contem(v, c)));
  check('fatos', 'nenhum convênio fora de clinica.convenios.valor', !citados.length, citados.join(', '));
  // F4: instrução interna de docs/ vazando para quem lê. Depois, resíduo do scaffold.
  const lixo = /lorem ipsum|\bundefined\b|\[object Object\]|\bTODO\b|\bNaN\b|Nota ao Desenvolvedor|a_confirmar|herdado_spec|\[CONFIRMAR:\s*(?:copiar|pedir|buscar|ver)\b|Stub do scaffold|Vite \+ React|Get started|count is\b/gi;
  const achados = [...corpo.matchAll(lixo)].map((m) => contexto(corpo, m.index, m[0].length));
  check('fatos', 'sem texto de teste ou dado quebrado', !achados.length, achados.join(' | '));

  // Fato a_confirmar só entra dentro do marcador ou com ele logo em seguida.
  for (const { caminho, re, rotulo } of FATOS_A_CONFIRMAR) {
    if (!fatos.aConfirmar(caminho)) continue;
    const marcadores = [...corpo.matchAll(new RegExp(FONTE_CONFIRMAR, 'g'))].map((m) => [m.index, m.index + m[0].length]);
    const marcado = (m) => {
      const fim = m.index + m[0].length;
      return marcadores.some(([a, b]) => (a <= m.index && fim <= b) || (a >= fim && a - fim <= 30));
    };
    const soltos = [...corpo.matchAll(re)].filter((m) => !marcado(m));
    check('fatos', `${rotulo}: só com [CONFIRMAR] por perto (${caminho})`, !soltos.length, soltos.map((m) => contexto(corpo, m.index, m[0].length)).join(' | '));
  }
  // F8: serviço a_confirmar só com marcador logo depois do nome.
  const secServ = sec('servicos') ? texto(sec('servicos')) : '';
  for (const s of fatos.servicos.filter((x) => x.nome && x.status !== 'confirmado')) {
    const achados = [...secServ.matchAll(new RegExp(`(?<!\\p{L})${escapar(s.nome)}(?!\\p{L})`, 'gu'))];
    const soltos = achados.filter((m) => !RE_CONFIRMAR.test(secServ.slice(m.index, m.index + m[0].length + 60)));
    check('fatos', `serviço a confirmar com [CONFIRMAR]: ${s.nome}`, !soltos.length, soltos.map((m) => contexto(secServ, m.index, m[0].length)).join(' | '));
  }
  // F7, regra 5: "fellowship" nunca aparece sem a explicação ao lado.
  const fellowship = [...corpo.matchAll(/fellowship/gi)].filter((m) => !/forma[cç][aã]o avan[cç]ada/i.test(corpo.slice(m.index, m.index + 60)));
  check('fatos', 'regra 5: "fellowship" com explicação ao lado', !fellowship.length, fellowship.map((m) => contexto(corpo, m.index, m[0].length)).join(' | '));
  if (fatos.aConfirmar('outras_profissionais.0')) {
    const erica = /(?<!\p{L})[EÉ]rica(?!\p{L})/u.test(corpo);
    check('fatos', 'Dra. Erica fora do site até a clínica confirmar', !erica);
  }
  if (fatos.aConfirmar('redes.instagram_medica')) {
    check('fatos', 'Instagram da médica sem link até confirmar', !hrefs(raiz).some((h) => /dra_lucianasalgado/i.test(h)));
  }

  if (fatos.valores) {
    const corridas = fatos.valores.match(/\d+/g) ?? [];
    const linhas = fatos.valores.split('\n').map(digitos);
    const conhecido = (n) => fatos.valores.includes(n) || corridas.includes(digitos(n)) || (n.length >= 4 && linhas.some((l) => l.includes(digitos(n))));
    const numeros = [...new Set(semMarcadores(corpo).match(/\d[\d.,/-]*\d/g) ?? [])].filter((n) => !conhecido(n));
    if (numeros.length) aviso(`Números no HTML que não estão em fatos.json: ${numeros.join(', ')}`);
  }
}

const aparaAspas = (s) => limpar(s).replace(/^[\s"'“”‘’«»…]+|[\s"'“”‘’«»…]+$/g, '');

function checarAvaliacoes(ctx) {
  const { sec, fatos } = ctx;
  const secao = sec('avaliacoes');
  if (!secao) {
    check('avaliacoes', '#avaliacoes presente', false);
    return;
  }
  const links = hrefs(secao);
  const google = fatos.urlGoogle
    ? links.filter((h) => h === fatos.urlGoogle)
    : links.filter((h) => /^https:\/\/([\w-]+\.)*(google\.[a-z.]+|g\.page|goo\.gl|g\.co|share\.google)\//i.test(h));
  check('avaliacoes', 'link para ver avaliações no Google', google.length > 0, fatos.urlGoogle ? 'esperado avaliacoes.url_google' : links.join(', '));
  const comRotulo = buscar(secao, (n) => n.tag === 'a' && google.includes(n.attrs.href) && /ver todas as avalia[cç][oõ]es no google/i.test(textoComAtributos(n)));
  check('avaliacoes', 'link com o texto "ver todas as avaliações no Google"', comRotulo.length > 0);

  const blocos = porTag(secao, 'blockquote', 'q', 'figcaption');
  const lista = fatos.avaliacoes;
  if (!lista) {
    aviso('docs/fatos.json não existe: depoimentos não foram comparados.');
    return;
  }
  if (!lista.length) {
    check('avaliacoes', 'avaliacoes.lista vazia: nenhum depoimento publicado (blockquote, q, figcaption)', !blocos.length, `${blocos.length} encontrado(s)`);
    // Marcadores ocultos por decisão do dono: sem falas, o título não pode prometê-las.
    check('avaliacoes', 'avaliacoes.lista vazia: título não promete falas de pacientes', !/o que dizem/i.test(texto(secao)));
    return;
  }
  const citacoes = porTag(secao, 'blockquote');
  check('avaliacoes', 'de 3 a 6 depoimentos em <blockquote>', citacoes.length >= 3 && citacoes.length <= 6, `${citacoes.length} encontrados`);
  const normais = lista.map((a) => ({ ...a, limpo: aparaAspas(a.texto) }));
  for (const bloco of citacoes) {
    const t = aparaAspas(texto(bloco));
    const igual = normais.find((a) => a.limpo === t);
    const trecho = normais.find((a) => t.length >= 20 && a.limpo.includes(t));
    const achado = igual ?? trecho;
    check('avaliacoes', `depoimento literal de fatos.json: "${t.slice(0, 50)}..."`, Boolean(achado), achado ? '' : 'texto não encontrado em fatos.json');
    if (!igual && trecho) info(`Depoimento é trecho, não o texto inteiro: "${t.slice(0, 60)}..."`);
    if (achado?.autor) {
      const cartao = (() => {
        for (let n = bloco; n && n !== secao; n = n.pai) if (['figure', 'li', 'article'].includes(n.tag)) return n;
        return bloco.pai;
      })();
      const tc = texto(cartao);
      const partes = achado.autor.trim().split(/\s+/);
      check('avaliacoes', `autor ${partes[0]}: primeiro nome no cartão`, tc.includes(partes[0]));
      if (partes.length > 1) check('avaliacoes', `autor ${partes[0]}: sem nome completo`, !tc.includes(achado.autor.trim()));
    }
  }
}

function checarWhatsapp(ctx) {
  const { raiz, sec, fatos, corpo } = ctx;
  const links = hrefs(raiz).filter((h) => /wa\.me|api\.whatsapp\.com|whatsapp:\/\//i.test(h));
  const numeros = [...new Set(links.map((h) => digitos(h.split('?')[0]) || digitos(/phone=(\d+)/.exec(h)?.[1])))];
  info(`Links de WhatsApp ativos: ${links.length ? links.join(' , ') : 'nenhum'}`);
  const alvos = [['#hero', sec('hero')], ['#cta-final', sec('cta-final')]];

  if (fatos.whatsapp) {
    const ok = numeros.length > 0 && numeros.every((n) => n.endsWith(fatos.whatsapp) || fatos.whatsapp.endsWith(n));
    check('whatsapp', 'links wa.me usam o número confirmado em fatos.json', ok, numeros.join(', '));
    const semLink = alvos.filter(([, no]) => !no || !hrefs(no).some((h) => /wa\.me|whatsapp/i.test(h))).map(([id]) => id);
    check('whatsapp', 'CTA de WhatsApp ativo em #hero e #cta-final', !semLink.length, semLink.join(', '));
    const marcaWhatsapp = new RegExp(FONTE_CONFIRMAR, 'g');
    const comConfirmar = alvos.filter(([, no]) => no && [...textoComAtributos(no).matchAll(marcaWhatsapp)].some((m) => /whatsapp/i.test(m[0]))).map(([id]) => id);
    check('whatsapp', 'número confirmado: sem [CONFIRMAR] de WhatsApp nos CTAs', !comConfirmar.length, comConfirmar.join(', '));
  } else {
    // Decisão 4 do orquestrador: sem confirmação, o CTA liga para o fixo e avisa que falta confirmar.
    check('whatsapp', 'sem número confirmado, nenhum link de WhatsApp ativo', !links.length, links.join(', '));
    for (const [id, no] of alvos) {
      // Marcadores ocultos por decisão do dono: a honestidade do CTA vem de dizer "Ligar" e mostrar o número.
      const cta = no ? buscar(no, (n) => n.tag === 'a' && String(n.attrs.href).startsWith('tel:')) : [];
      const certo = cta.filter((n) => digitos(n.attrs.href).endsWith(digitos(fatos.telefone)));
      check('whatsapp', `${id}: CTA tel: do fixo`, certo.length > 0, cta.map((n) => n.attrs.href).join(', '));
      const honesto = certo.filter((n) => /lig(ar|a|ue|ação)|telefone/i.test(n.attrs['aria-label'] ?? ''));
      check('whatsapp', `${id}: aria-label do CTA diz que liga`, honesto.length > 0, certo.map((n) => n.attrs['aria-label'] ?? 'sem aria-label').join(' | '));
      check('whatsapp', `${id}: número visível no CTA`, certo.some((n) => digitos(texto(n)).endsWith(digitos(fatos.telefone))));
    }
    const candidato = fatos.candidatoWhatsapp.slice(2);
    if (candidato) {
      const re = new RegExp(candidato.split('').join('\\D{0,3}'), 'g');
      const colados = [...corpo.matchAll(re)].filter((m) => /whats/i.test(corpo.slice(Math.max(0, m.index - 60), m.index + m[0].length + 60)));
      check('whatsapp', 'número candidato não exibido como WhatsApp', !colados.length, colados.map((m) => contexto(corpo, m.index, m[0].length)).join(' | '));
    }
    // F9: sem número confirmado, nenhuma frase promete WhatsApp sem o marcador por perto.
    const marcas = [...corpo.matchAll(new RegExp(FONTE_CONFIRMAR, 'g'))].map((m) => [m.index, m.index + m[0].length]);
    const soltos = [...corpo.matchAll(/whats\s?app/gi)].filter((m) => {
      const fim = m.index + m[0].length;
      // Janela curta: o marcador do CTA vizinho não pode cobrir uma frase solta (caso real de F9).
      return !marcas.some(([a, b]) => (a <= m.index && fim <= b) || (a >= fim && a - fim <= 15));
    });
    check('whatsapp', '"WhatsApp" só com [CONFIRMAR] por perto enquanto não confirmado', !soltos.length, soltos.map((m) => contexto(corpo, m.index, m[0].length)).join(' | '));
  }
  if (sec('hero')) {
    check('whatsapp', '#hero tem CTA de ligar (tel:)', hrefs(sec('hero')).some((h) => h.startsWith('tel:')));
  }
  // F10: controle por voz usa o rótulo visível, então ele precisa estar no aria-label.
  const rotulados = buscar(raiz, (n) => ['a', 'button'].includes(n.tag) && n.attrs['aria-label']);
  const divergentes = rotulados.filter((n) => {
    const visivel = normalizar(semMarcadores(texto(n)));
    return visivel && !normalizar(n.attrs['aria-label']).includes(visivel);
  });
  check('whatsapp', 'aria-label contém o rótulo visível', !divergentes.length, divergentes.map((n) => `"${texto(n)}" x "${n.attrs['aria-label']}"`).join(' | '));
}

function checarMapa(ctx) {
  const { raiz, sec } = ctx;
  const iframes = porTag(raiz, 'iframe').filter((f) => /google\.[a-z.]+\/maps|maps\.google|goo\.gl\/maps/i.test(f.attrs.src ?? f.attrs['data-src'] ?? ''));
  if (iframes.length) {
    check('mapa', 'iframe do Google Maps com loading="lazy"', iframes.every((f) => f.attrs.loading === 'lazy'));
    return;
  }
  const horarios = sec('horarios');
  // Link "Abrir no mapa" não conta: a SPEC pede mapa incorporado, carregado depois.
  const gatilhos = horarios ? buscar(horarios, (n) => n.tag === 'button' && /mapa|maps/i.test(textoComAtributos(n))) : [];
  check('mapa', 'botão que carrega o mapa em #horarios (sem iframe no HTML)', gatilhos.length > 0);
  // Só URL de incorporação decide: "iframe" existe no react-dom e a URL comum existe no link do mapa.
  const js = arquivos(DIST).filter((p) => /\.m?js$/.test(p) && !ehChunkThree(p)).map(ler);
  check('mapa', 'JS do site tem a URL de incorporação do Google Maps', js.some((t) => /output=embed|maps\/embed/i.test(t)));
}

function listarConfirmar(ctx) {
  const { raiz, ids, ldBlocos } = ctx;
  const nomeados = [...IDS_SECAO];
  const achados = new Set();
  const registrar = (onde, fonte) => {
    for (const m of fonte.matchAll(new RegExp(FONTE_CONFIRMAR, 'g'))) achados.add(`${onde}: ${m[0]}`);
  };
  for (const id of nomeados) {
    const no = ids.get(id)?.[0];
    if (no) registrar(`#${id}`, textoComAtributos(no));
  }
  const nosDeSecao = new Set(nomeados.flatMap((id) => ids.get(id) ?? []));
  const fora = (no) => {
    if (nosDeSecao.has(no)) return '';
    if (no.tag === '#texto') return no.texto;
    const proprio = ['alt', 'title', 'aria-label'].map((a) => no.attrs[a] ?? '').join(' ');
    return ` ${proprio} ${no.filhos.filter((f) => !SEM_TEXTO.has(f.tag)).map(fora).join('')}`;
  };
  registrar('fora das seções', limpar(fora(porTag(raiz, 'body')[0] ?? raiz)));
  ldBlocos.forEach((b) => registrar('JSON-LD', textoScript(b)));
  info(`[CONFIRMAR] encontrados: ${achados.size}`);
  for (const item of achados) info(`  ${item}`);
}

// ---------------------------------------------------------------- execução

function relatorio() {
  const grupos = [...new Set(resultados.map((r) => r.grupo))];
  for (const g of grupos) {
    console.log(`\n== ${g} ==`);
    for (const r of resultados.filter((x) => x.grupo === g)) {
      console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.nome}${r.detalhe ? `  (${r.detalhe})` : ''}`);
    }
  }
  if (avisos.length) {
    console.log('\n== avisos (não reprovam) ==');
    for (const a of avisos) console.log(`AVISO ${a}`);
  }
  if (infos.length) {
    console.log('\n== informação ==');
    for (const i of infos) console.log(`INFO  ${i}`);
  }
  const falhas = resultados.filter((r) => !r.ok);
  console.log(`\nResultado: ${resultados.length - falhas.length} de ${resultados.length} checks passaram; ${falhas.length} falha(s).`);
  process.exit(falhas.length ? 1 : 0);
}

function main() {
  const indice = join(DIST, 'index.html');
  if (!existsSync(DIST) || !existsSync(indice)) {
    console.error(`FAIL  dist não encontrado: ${indice}`);
    console.error('Rode `npm run build` na raiz do projeto antes de `npm run check`.');
    process.exit(1);
  }

  const fatos = carregarFatos();
  const htmlBruto = readFileSync(indice, 'utf8');
  const raiz = parseHtml(htmlBruto);
  const ids = new Map();
  for (const n of buscar(raiz, (x) => x.attrs.id)) ids.set(n.attrs.id, [...(ids.get(n.attrs.id) ?? []), n]);
  const sec = (id) => ids.get(id)?.[0] ?? null;

  const corpoNo = porTag(raiz, 'body')[0] ?? raiz;
  const ldBlocos = porTag(raiz, 'script').filter((s) => s.attrs.type === 'application/ld+json');
  const metas = porTag(raiz, 'meta').map((m) => m.attrs.content ?? '').filter((c) => !/^(width=|\w+$)/.test(c));
  const titulo = porTag(raiz, 'title').map(textoScript).join(' ');
  const corpo = textoComAtributos(corpoNo);
  const textoTotal = limpar([corpo, titulo, ...metas, ...ldBlocos.map(textoScript)].join(' '));

  const ctx = { raiz, ids, sec, fatos, corpo, textoTotal, ldBlocos, htmlBruto };
  console.log(`dist:  ${DIST}`);
  console.log(`fatos: ${fatos.fonte}`);

  checarSecoes(ctx);
  checarConteudoSecoes(ctx);
  checarSeo(ctx);
  checarPublic();
  checarArquivos(ctx);
  checarStack();
  checarBundle(ctx);
  checarFormularios();
  checarCfm(ctx);
  checarFatos(ctx);
  checarAvaliacoes(ctx);
  checarWhatsapp(ctx);
  checarMapa(ctx);
  listarConfirmar(ctx);
  relatorio();
}

main();
