import { MessageCircle } from 'lucide-react'
import { conteudo } from '../data/conteudo.ts'
import { fatos } from '../data/fatos.ts'
import { Confirmar } from './Confirmar.tsx'
import { LinkWhatsapp } from './CtaWhatsApp.tsx'
import { destinoWhatsapp } from './destinoWhatsapp.ts'

// Decisão 11: abaixo de md não há etiqueta [CONFIRMAR]; o marcador fica no aria-label.
export function WhatsappFlutuante() {
  const { texto, ariaLabel } = conteudo.flutuante
  const destino = destinoWhatsapp(ariaLabel)
  return (
    <LinkWhatsapp
      id="whatsapp-float"
      destino={{ ...destino, ariaLabel: destino.ariaLabel ?? ariaLabel }}
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 inline-flex size-16 items-center justify-center gap-2 rounded-full bg-fluor text-tinta shadow-flutuante outline-offset-4 md:h-16 md:w-auto md:px-6"
    >
      <MessageCircle aria-hidden="true" className="size-8 shrink-0 md:size-7" />
      <span className="hidden text-corpo font-semibold md:inline">{texto}</span>
      {!fatos.whatsapp.confirmado && (
        <span className="hidden md:inline">
          <Confirmar>[CONFIRMAR]</Confirmar>
        </span>
      )}
    </LinkWhatsapp>
  )
}
