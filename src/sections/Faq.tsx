import { Plus } from 'lucide-react'
import { TextoMarcado } from '../components/TextoMarcado.tsx'
import { conteudo } from '../data/conteudo.ts'

const { titulo, itens } = conteudo.faq

export function Faq() {
  return (
    <section id="faq" className="bg-nevoa-clara px-gutter pt-secao pb-12 text-tinta">
      <div className="mx-auto grid max-w-pagina gap-8 xl:grid-cols-12 xl:gap-10">
        <h2 className="font-display text-titulo-2 font-medium text-balance xl:col-span-4">{titulo}</h2>
        <div className="max-w-texto xl:col-span-8">
          {itens.map((item) => (
            <details key={item.pergunta} className="grupo-detalhes border-b border-nevoa">
              <summary className="flex min-h-toque cursor-pointer list-none items-center justify-between gap-4 py-3 text-corpo font-semibold">
                {item.pergunta}
                <Plus aria-hidden="true" className="seta-mais size-6 shrink-0 transition-transform duration-rapido ease-foco" />
              </summary>
              <p className="pb-4 text-corpo text-tinta-suave">
                <TextoMarcado texto={item.resposta} />
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
