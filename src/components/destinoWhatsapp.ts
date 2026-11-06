import { fatos } from '../data/fatos.ts'
import { interfaceTextos } from '../data/interface.ts'

const { whatsapp, telefone } = fatos

/** Destino e nome acessível de qualquer CTA de WhatsApp. Decisão 4: sem número confirmado, liga. */
export function destinoWhatsapp(rotulo: string) {
  if (whatsapp.confirmado && whatsapp.href) {
    return { href: whatsapp.href, rotulo, ariaLabel: undefined, externo: true }
  }
  // O botão liga: o rótulo diz isso, e o número fica à vista de quem não usa discador.
  return {
    href: `tel:${telefone.tel}`,
    rotulo: `${interfaceTextos.ligar}: ${telefone.exibicao}`,
    ariaLabel: `${interfaceTextos.ligar}: ${telefone.exibicao}`,
    externo: false,
  }
}
