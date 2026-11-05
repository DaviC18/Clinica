import { MessageCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { conteudo } from '../data/conteudo.ts'
import { fatos } from '../data/fatos.ts'
import { Confirmar } from './Confirmar.tsx'
import { destinoWhatsapp } from './destinoWhatsapp.ts'

const { whatsapp } = fatos

type Props = {
  rotulo?: string
  /** Em fundo claro o botão fluor precisa de borda (contraste 1,4 sem ela). */
  fundoClaro?: boolean
  className?: string
}

export function CtaWhatsApp({ rotulo = conteudo.hero.ctaPrimario, fundoClaro = false, className = '' }: Props) {
  const destino = destinoWhatsapp(rotulo)
  return (
    <LinkWhatsapp
      destino={destino}
      className={`inline-flex min-h-toque flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full bg-fluor px-6 py-2.5 text-corpo font-semibold text-tinta shadow-flutuante transition-transform duration-rapido ease-foco hover:-translate-y-0.5 ${
        fundoClaro ? 'border border-tinta' : 'focus-visible:outline-fluor'
      } ${className}`}
    >
      <MessageCircle aria-hidden="true" className="size-6 shrink-0" />
      <span>{rotulo}</span>
      {!whatsapp.confirmado && <Confirmar>[CONFIRMAR]</Confirmar>}
    </LinkWhatsapp>
  )
}

type LinkProps = {
  destino: ReturnType<typeof destinoWhatsapp>
  className: string
  id?: string
  children: ReactNode
}

export function LinkWhatsapp({ destino, className, id, children }: LinkProps) {
  return (
    <a
      id={id}
      href={destino.href}
      aria-label={destino.ariaLabel}
      className={className}
      {...(destino.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}
