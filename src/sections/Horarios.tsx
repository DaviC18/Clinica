import { Accessibility, ExternalLink, Phone } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { Mapa } from '../components/Mapa.tsx'
import { conteudo } from '../data/conteudo.ts'
import { fatos } from '../data/fatos.ts'
import { interfaceTextos } from '../data/interface.ts'

const { titulo, tabela, endereco, telefone, mapaLink, acessibilidade, acolhimento } = conteudo.horarios
const rotulos = interfaceTextos.horarios

/** 0 = seg–sex, 1 = sábado, 2 = domingo: a ordem das linhas de docs/conteudo.md. */
function linhaDeHoje() {
  const dia = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short' }).format(new Date())
  if (dia === 'Sun') return 2
  return dia === 'Sat' ? 1 : 0
}

const semAssinatura = () => () => {}

export function Horarios() {
  // null no servidor e na hidratação: a primeira renderização é igual à do HTML pré-renderizado.
  const hoje = useSyncExternalStore(semAssinatura, linhaDeHoje, () => null)

  return (
    <section id="horarios" className="bg-porcelana px-gutter py-secao text-tinta">
      <div className="mx-auto max-w-pagina">
        <h2 className="font-display text-titulo-2 font-medium text-balance">{titulo}</h2>
        <div className="mt-bloco grid gap-10 md:grid-cols-2 xl:grid-cols-12">
          <div className="min-w-0 xl:col-span-5">
            <table className="w-full border-collapse text-left">
              <caption className="text-left text-corpo text-tinta-suave">{rotulos.legendaTabela}</caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">{rotulos.colunaDia}</th>
                  <th scope="col">{rotulos.colunaHorario}</th>
                </tr>
              </thead>
              <tbody>
                {tabela.map((linha, i) => (
                  <tr key={linha.dia} className="border-b border-nevoa">
                    <th scope="row" className="py-3 text-corpo font-semibold">
                      {linha.dia}
                      <span
                        className={`ml-2 rounded-full bg-tinta px-2 py-0.5 text-legal font-semibold text-porcelana ${hoje === i ? '' : 'hidden'}`}
                      >
                        {rotulos.hoje}
                      </span>
                    </th>
                    <td className="py-3 text-right text-corpo">{linha.horario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className="mt-8 font-display text-titulo-3">{rotulos.endereco}</h3>
            <address className="mt-3 text-corpo not-italic">{endereco}</address>
            <a
              href={fatos.mapa.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-toque items-center gap-2 text-corpo font-semibold text-cobalto-vivo underline underline-offset-4"
            >
              {mapaLink}
              <ExternalLink aria-hidden="true" className="size-5 shrink-0" />
            </a>
            <p className="flex flex-wrap items-center gap-2 text-corpo">
              <Phone aria-hidden="true" className="size-5 shrink-0" />
              <span className="sr-only">{rotulos.telefone}: </span>
              <a href={`tel:${fatos.telefone.tel}`} className="inline-flex min-h-toque items-center whitespace-nowrap font-semibold underline underline-offset-4">
                {telefone}
              </a>
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-6 xl:col-span-7">
            <div className="min-h-80 flex-1">
              <Mapa />
            </div>
            <div>
              <h3 className="flex flex-wrap items-center gap-2 font-display text-titulo-3">
                <Accessibility aria-hidden="true" className="size-6 shrink-0" />
                {rotulos.acessibilidade}
              </h3>
              <p className="mt-3 text-corpo">{acessibilidade}</p>
              <p className="mt-2 text-corpo text-tinta-suave">{acolhimento}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
