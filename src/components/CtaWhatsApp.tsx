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
  /** No header o ícone rouba a largura que o rótulo e o marcador precisam. */
  semIcone?: boolean
  /** Versão de uma linha para o header, com padding menor. */
  compacto?: boolean
}

export function CtaWhatsApp({
  rotulo = conteudo.hero.ctaPrimario,
  fundoClaro = false,
  className = '',
  semIcone = false,
  compacto = false,
}: Props) {
  const destino = destinoWhatsapp(rotulo)
  return (
    <LinkWhatsapp
      destino={destino}
      className={`inline-flex min-h-toque max-w-full flex-wrap items-center justify-center rounded-full bg-fluor text-corpo font-semibold text-tinta shadow-flutuante transition-transform duration-rapido ease-foco hover:-translate-y-0.5 ${
        compacto ? 'gap-x-1.5 px-3 py-1.5' : 'gap-x-2 gap-y-1 px-4 py-2.5 sm:px-6'
      } ${fundoClaro ? 'border border-tinta' : 'focus-visible:outline-fluor'} ${className}`}
    >
      {!semIcone && <MessageCircle aria-hidden="true" className="size-6 shrink-0" />}
      <span className="whitespace-nowrap">{rotulo}</span>
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
