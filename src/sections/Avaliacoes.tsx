import { ExternalLink, Star } from 'lucide-react'
import { conteudo } from '../data/conteudo.ts'
import { fatos } from '../data/fatos.ts'
import { interfaceTextos } from '../data/interface.ts'

const { titulo, resumo, link } = conteudo.avaliacoes
const { lista, urlGoogle } = fatos.avaliacoes
const [nota, ...restoDoResumo] = resumo.split(' ')
const ESTRELAS = [1, 2, 3, 4, 5]

function primeiroNome(autor: string) {
  return autor.trim().split(/\s+/)[0]
}

export function Avaliacoes() {
  const [destaque, ...demais] = lista
  return (
    <section id="avaliacoes" className="bg-cobalto px-gutter py-secao text-porcelana">
      <div data-revelar className="mx-auto max-w-pagina">
        {/* Sem depoimentos reais, o título não promete falas: a prova é a nota. */}
        <h2 className="font-display text-titulo-2 font-medium text-balance">
          {destaque ? titulo : interfaceTextos.avaliacoesSemFalas}
        </h2>
        <p className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="font-display text-nota font-medium">{nota}</span>
          <span className="flex flex-col gap-1 text-corpo-g font-semibold">
            <span aria-hidden="true" className="flex gap-1">
              {ESTRELAS.map((n) => (
                <Star key={n} className="size-6 fill-ambar text-ambar" />
              ))}
            </span>
            {restoDoResumo.join(' ')}
          </span>
        </p>
        {destaque && (
          <div className="mt-bloco grid gap-8 md:grid-cols-2 xl:grid-cols-12">
            <figure className="md:col-span-2 xl:col-span-5">
              <blockquote className="font-display text-titulo-3">{destaque.texto}</blockquote>
              <figcaption className="mt-3 text-corpo text-nevoa">{primeiroNome(destaque.autor)}</figcaption>
            </figure>
            <div className="grid gap-8 md:col-span-2 md:grid-cols-2 xl:col-span-7">
              {demais.map((d) => (
                <figure key={d.texto}>
                  <blockquote className="text-corpo-g">{d.texto}</blockquote>
                  <figcaption className="mt-3 text-corpo text-nevoa">{primeiroNome(d.autor)}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
        <a
          href={urlGoogle}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-bloco inline-flex min-h-toque w-full items-center justify-center gap-2 rounded-full border border-porcelana px-6 py-2.5 text-center text-corpo font-semibold transition-colors duration-rapido ease-foco hover:bg-porcelana hover:text-cobalto focus-visible:outline-fluor sm:w-auto"
        >
          {link}
          <ExternalLink aria-hidden="true" className="size-5 shrink-0" />
        </a>
      </div>
    </section>
  )
}
