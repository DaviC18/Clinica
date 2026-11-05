import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { conteudo } from '../data/conteudo.ts'
import { fatos } from '../data/fatos.ts'
import { interfaceTextos } from '../data/interface.ts'

const { carregarMapa, avisoMapa } = interfaceTextos.horarios

/** Fachada sem chamada ao Google; o iframe entra só depois do clique. */
export function Mapa() {
  const [carregado, setCarregado] = useState(false)

  if (carregado) {
    return (
      <iframe
        title={conteudo.horarios.mapaTitulo}
        src={fatos.mapa.urlIncorporacao}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full min-h-80 w-full rounded-suave border-0"
      />
    )
  }

  return (
    <div className="flex h-full min-h-80 flex-col items-center justify-center gap-4 rounded-suave bg-noite p-6 text-center text-porcelana">
      <button
        type="button"
        onClick={() => setCarregado(true)}
        className="inline-flex min-h-toque items-center gap-2 rounded-full border border-porcelana px-6 text-corpo font-semibold transition-colors duration-rapido ease-foco hover:bg-porcelana hover:text-noite focus-visible:outline-fluor"
      >
        <MapPin aria-hidden="true" className="size-5" />
        {carregarMapa}
      </button>
      <p className="max-w-xs text-legal text-nevoa">{avisoMapa}</p>
    </div>
  )
}
