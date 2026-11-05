import { TextoMarcado } from '../components/TextoMarcado.tsx'
import { conteudo } from '../data/conteudo.ts'
import { interfaceTextos } from '../data/interface.ts'

const { titulo, nome, registros, apresentacao, foto, formacao, idiomas } = conteudo.medica
const rotulos = interfaceTextos.medica

export function Medica() {
  return (
    <section id="medica" className="bg-nevoa-clara px-gutter py-secao text-tinta">
      <div data-revelar className="mx-auto grid max-w-pagina gap-8 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <h2 className="font-display text-corpo-g text-tinta-suave">{titulo}</h2>
          <p className="mt-3 font-display text-titulo-2 font-medium text-balance">{nome}</p>
          <p className="mt-4 text-corpo text-tinta-suave">
            <TextoMarcado texto={registros} />
          </p>
          <p className="mt-4">
            <TextoMarcado texto={foto} />
          </p>
        </div>
        <div className="max-w-texto md:col-span-7">
          <p className="text-corpo-g">{apresentacao}</p>
          <h3 className="mt-8 font-display text-titulo-3">{rotulos.formacao}</h3>
          <ul className="mt-3 divide-y divide-nevoa">
            {formacao.map((item) => (
              <li key={item} className="py-3 text-corpo">
                <TextoMarcado texto={item} />
              </li>
            ))}
          </ul>
          <h3 className="mt-8 font-display text-titulo-3">{rotulos.idiomas}</h3>
          <p className="mt-3 text-corpo">{idiomas}</p>
        </div>
      </div>
    </section>
  )
}
