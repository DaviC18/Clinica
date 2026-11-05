import { fatos } from '../data/fatos.ts'
import { interfaceTextos } from '../data/interface.ts'

const { whatsapp, telefone } = fatos

/** Destino e nome acessível de qualquer CTA de WhatsApp. Decisão 4: sem número confirmado, liga. */
export function destinoWhatsapp(rotulo: string) {
  if (whatsapp.confirmado && whatsapp.href) {
    return { href: whatsapp.href, ariaLabel: undefined, externo: true }
  }
  return {
    href: `tel:${telefone.tel}`,
    ariaLabel: `${rotulo} [CONFIRMAR]: ${interfaceTextos.ctaLigaAviso} ${telefone.exibicao}`,
    externo: false,
  }
}
