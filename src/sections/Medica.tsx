import { semPendencias } from '../components/semPendencias.ts'
import { TextoMarcado } from '../components/TextoMarcado.tsx'
import { conteudo } from '../data/conteudo.ts'
import { interfaceTextos } from '../data/interface.ts'

const { nome, registros, apresentacao, formacao, idiomas } = conteudo.medica
const rotulos = interfaceTextos.medica

export function Medica() {
  return (
    <section id="medica" className="bg-nevoa-clara px-gutter py-secao text-tinta">
      <div data-revelar className="mx-auto grid max-w-pagina grid-cols-1 items-start gap-8 xl:grid-cols-12 xl:gap-10">
        {/* Oval de lente, o mesmo desenho da lente do hero. */}
        <picture className="xl:col-span-4">
          <source srcSet="/img/dra-luciana-480.avif" type="image/avif" />
          <img
            src="/img/dra-luciana-480.webp"
            alt={`${interfaceTextos.fotoMedica} ${nome}`}
            width={480}
            height={600}
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full max-w-60 rounded-[50%] object-cover xl:max-w-none"
          />
        </picture>
        <div className="xl:col-span-8">
          <h2 className="font-display text-titulo-2 font-medium text-balance">{nome}</h2>
          <p className="mt-4 text-corpo text-tinta-suave">
            <TextoMarcado texto={registros} />
          </p>
          <p className="mt-6 max-w-texto text-corpo-g">{apresentacao}</p>
          <div className="mt-bloco grid gap-8 md:grid-cols-[2fr_1fr] md:gap-10">
            <div>
              <h3 className="font-display text-titulo-3">{rotulos.formacao}</h3>
              <ul className="mt-3 divide-y divide-nevoa">
                {formacao.filter(semPendencias).map((item) => (
                  <li key={item} className="py-3 text-corpo">
                    <TextoMarcado texto={item} />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-titulo-3">{rotulos.idiomas}</h3>
              <p className="mt-3 text-corpo">{idiomas}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
