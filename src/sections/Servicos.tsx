import { ChevronDown } from 'lucide-react'
import { CtaWhatsApp } from '../components/CtaWhatsApp.tsx'
import { semPendencias } from '../components/semPendencias.ts'
import { TextoMarcado } from '../components/TextoMarcado.tsx'
import { conteudo } from '../data/conteudo.ts'
import { fatos } from '../data/fatos.ts'
import { interfaceTextos } from '../data/interface.ts'

const { titulo, introducao, cta } = conteudo.servicos
const { verTodosExames, grupoExames, examesVisiveis } = interfaceTextos.servicos

type Servico = (typeof fatos.servicos)[number]

// Serviço sem explicação confirmada fica fora da página.
const servicos = fatos.servicos.filter((s) => semPendencias(s.explicacao))

const grupos = [...new Set<string>(servicos.map((s) => s.grupo))].map((nome) => ({
  nome,
  itens: servicos.filter((s) => s.grupo === nome),
}))

function ListaServicos({ itens }: { itens: readonly Servico[] }) {
  return (
    <dl className="grid gap-x-10 gap-y-5 md:grid-cols-2">
      {itens.map((s) => (
        <div key={s.nome}>
          <dt className="text-corpo font-semibold">{s.nome}</dt>
          <dd className="mt-1 text-corpo text-tinta-suave">
            <TextoMarcado texto={s.explicacao} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Grupo({ nome, itens }: { nome: string; itens: readonly Servico[] }) {
  const recolher = nome === grupoExames && itens.length > examesVisiveis
  return (
    <article data-revelar className="border-t border-nevoa py-8 xl:grid xl:grid-cols-12 xl:gap-10">
      <h3 className="font-display text-titulo-3 xl:sticky xl:top-8 xl:col-span-3 xl:self-start">{nome}</h3>
      <div className="mt-4 xl:col-span-9 xl:mt-0">
        <ListaServicos itens={recolher ? itens.slice(0, examesVisiveis) : itens} />
        {recolher && (
          <details className="grupo-detalhes mt-5">
            <summary className="inline-flex min-h-toque cursor-pointer list-none items-center gap-2 text-corpo font-semibold text-cobalto-vivo underline underline-offset-4">
              {verTodosExames}
              <ChevronDown aria-hidden="true" className="seta size-5 transition-transform duration-rapido ease-foco" />
            </summary>
            <div className="mt-4">
              <ListaServicos itens={itens.slice(examesVisiveis)} />
            </div>
          </details>
        )}
      </div>
    </article>
  )
}

export function Servicos() {
  return (
    <section id="servicos" className="bg-porcelana px-gutter py-secao text-tinta">
      <div className="mx-auto max-w-pagina">
        <h2 className="font-display text-titulo-2 font-medium text-balance">{titulo}</h2>
        <p className="mt-4 max-w-texto text-corpo-g text-tinta-suave">{introducao}</p>
        <div className="mt-bloco">
          {grupos.map((g) => (
            <Grupo key={g.nome} nome={g.nome} itens={g.itens} />
          ))}
        </div>
        <CtaWhatsApp rotulo={cta} fundoClaro className="mt-4 w-full md:w-auto" />
      </div>
    </section>
  )
}
