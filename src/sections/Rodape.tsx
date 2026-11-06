import { semPendencias } from '../components/semPendencias.ts'
import { TextoMarcado } from '../components/TextoMarcado.tsx'
import { conteudo } from '../data/conteudo.ts'
import { fatos } from '../data/fatos.ts'
import { interfaceTextos } from '../data/interface.ts'

const dados = conteudo.rodape
const rotulos = interfaceTextos.rodape

const linkClasse = 'inline-flex min-h-toque max-w-full items-center [overflow-wrap:anywhere] underline underline-offset-4 focus-visible:outline-fluor'

export function Rodape() {
  return (
    <footer id="rodape" className="border-t border-cobalto bg-noite px-gutter pt-12 pb-12 text-nevoa md:pb-16">
      <div className="mx-auto grid max-w-pagina grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <p className="font-display text-titulo-3 text-porcelana">{dados.marca}</p>
          <address className="mt-3 text-legal not-italic">{dados.endereco}</address>
          <a href={`tel:${fatos.telefone.tel}`} className={`${linkClasse} whitespace-nowrap text-legal`}>
            {dados.telefone}
          </a>
        </div>
        <div className="flex flex-col items-start">
          <a href={fatos.redes.instagram} target="_blank" rel="noopener noreferrer" className={`${linkClasse} text-corpo`}>
            {`${rotulos.instagram} ${dados.instagram}`}
          </a>
          <a href={fatos.redes.facebook} target="_blank" rel="noopener noreferrer" className={`${linkClasse} text-corpo`}>
            {`${rotulos.facebook} ${dados.facebook}`}
          </a>
        </div>
        <div className="space-y-2 text-legal md:col-span-2 xl:col-span-1">
          <p>
            <TextoMarcado texto={dados.medica} />
          </p>
          <p>{`${rotulos.razaoSocial}: ${dados.razaoSocial}`}</p>
          <p>{`${rotulos.cnpj}: ${dados.cnpj}`}</p>
          {semPendencias(dados.registroCrm) && (
            <p>
              {`${rotulos.registroCrm}: `}
              <TextoMarcado texto={dados.registroCrm} />
            </p>
          )}
          {semPendencias(dados.diretorTecnico) && (
            <p>
              {`${rotulos.diretorTecnico}: `}
              <TextoMarcado texto={dados.diretorTecnico} />
            </p>
          )}
        </div>
        <p className="text-legal md:col-span-2 xl:col-span-3">{dados.aviso}</p>
      </div>
    </footer>
  )
}
