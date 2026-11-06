import { MessageCircle, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import { conteudo } from '../data/conteudo.ts'
import { destinoWhatsapp } from './destinoWhatsapp.ts'

type Props = {
  rotulo?: string
  /** Em fundo claro o botão fluor precisa de borda (contraste 1,4 sem ela). */
  fundoClaro?: boolean
  className?: string
  /** Versão para o header, com padding menor. */
  compacto?: boolean
  /** Recebe o pulso da cena 3D. Só o CTA do hero. */
  recebeLuz?: boolean
}

export function CtaWhatsApp({
  rotulo = conteudo.hero.ctaPrimario,
  fundoClaro = false,
  className = '',
  compacto = false,
  recebeLuz = false,
}: Props) {
  const destino = destinoWhatsapp(rotulo)
  const Icone = destino.externo ? MessageCircle : Phone
  return (
    <LinkWhatsapp
      destino={destino}
      className={`inline-flex min-h-toque max-w-full items-center justify-center rounded-full bg-fluor text-corpo font-semibold text-tinta shadow-flutuante transition-transform duration-rapido ease-foco hover:-translate-y-0.5 ${
        compacto ? 'gap-x-1.5 px-3 py-1.5' : 'gap-x-2 gap-y-1 px-4 py-2.5 sm:px-6'
      } ${fundoClaro ? 'border border-tinta' : 'focus-visible:outline-fluor'} ${recebeLuz ? 'relative' : ''} ${className}`}
    >
      {recebeLuz && (
        <span
          aria-hidden="true"
          className="cta-luz"
          onAnimationEnd={(evento) => evento.currentTarget.removeAttribute('data-ativa')}
        />
      )}
      <Icone aria-hidden="true" className="size-6 shrink-0" />
      <span className="min-w-0 text-center">{destino.rotulo}</span>
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
