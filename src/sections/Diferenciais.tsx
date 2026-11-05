import type { CSSProperties } from 'react'
import { TextoMarcado } from '../components/TextoMarcado.tsx'
import { conteudo } from '../data/conteudo.ts'

const { titulo, linhas } = conteudo.diferenciais

export function Diferenciais() {
  return (
    // O fundo noite é o que aparece dos lados enquanto a fenda se abre (animations/iniciar.ts).
    <div className="bg-noite">
      <section id="diferenciais" className="text-tinta">
        {/* O gesto só recorta esta faixa: o texto entra na tela com a fenda já aberta. */}
        <div data-fenda aria-hidden="true" className="-mb-px h-[28svh] bg-porcelana" />
        <div className="bg-porcelana px-gutter pb-secao">
          <div className="mx-auto max-w-pagina">
            <h2 className="text-center font-display text-corpo-g text-tinta-suave xl:text-left">{titulo}</h2>
            <dl className="mt-bloco">
              {linhas.map((linha, i) => (
                <div
                  key={linha.titulo}
                  className="mx-auto max-w-texto py-4 text-center md:py-6 xl:grid xl:max-w-none xl:grid-cols-12 xl:items-baseline xl:gap-8 xl:border-t xl:border-nevoa xl:py-7 xl:text-left"
                >
                  <dt
                    className="linha-acuidade font-display font-medium text-balance xl:col-span-7"
                    style={{ '--passo': i } as CSSProperties}
                  >
                    {linha.titulo}
                  </dt>
                  <dd className="mt-2 text-corpo text-tinta-suave xl:col-span-5 xl:mt-0">
                    <TextoMarcado texto={linha.texto} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </div>
  )
}
