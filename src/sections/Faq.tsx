import { Plus } from 'lucide-react'
import { CtaWhatsApp } from '../components/CtaWhatsApp.tsx'
import { semPendencias } from '../components/semPendencias.ts'
import { TextoMarcado } from '../components/TextoMarcado.tsx'
import { conteudo } from '../data/conteudo.ts'

const { titulo } = conteudo.faq
// Pergunta sem resposta confirmada fica fora da página.
const itens = conteudo.faq.itens.filter((item) => semPendencias(item.resposta))

export function Faq() {
  return (
    <section id="faq" className="bg-nevoa-clara px-gutter pt-secao pb-12 text-tinta">
      <div className="mx-auto grid max-w-pagina grid-cols-1 gap-8 xl:grid-cols-12 xl:gap-10">
        <h2 className="font-display text-titulo-2 font-medium text-balance xl:col-span-4">{titulo}</h2>
        <div className="xl:col-span-8">
          {itens.map((item) => (
            <details key={item.pergunta} className="grupo-detalhes border-b border-nevoa">
              <summary className="flex min-h-toque cursor-pointer list-none items-center justify-between gap-4 py-3 text-corpo font-semibold">
                {item.pergunta}
                <Plus aria-hidden="true" className="seta-mais size-6 shrink-0 transition-transform duration-rapido ease-foco" />
              </summary>
              <p className="max-w-texto pb-4 text-corpo text-tinta-suave">
                <TextoMarcado texto={item.resposta} />
              </p>
            </details>
          ))}
          <CtaWhatsApp rotulo={conteudo.ctaFinal.ctaPrimario} fundoClaro className="mt-6 w-full md:w-auto" />
        </div>
      </div>
    </section>
  )
}
