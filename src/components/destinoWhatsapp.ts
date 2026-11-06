import { fatos } from '../data/fatos.ts'
import { interfaceTextos } from '../data/interface.ts'

const { whatsapp, telefone } = fatos

/** Destino e nome acessível de qualquer CTA de WhatsApp. Decisão 4: sem número confirmado, liga. */
export function destinoWhatsapp(rotulo: string) {
  if (whatsapp.confirmado && whatsapp.href) {
    return { href: whatsapp.href, rotulo, ariaLabel: undefined, externo: true }
  }
  // O botão liga: prometer WhatsApp no rótulo levaria o paciente ao lugar errado.
  const rotuloLigacao = rotulo.replace('pelo WhatsApp', 'por telefone')
  return {
    href: `tel:${telefone.tel}`,
    rotulo: rotuloLigacao,
    ariaLabel: `${rotuloLigacao}: ${interfaceTextos.ctaLigaAviso} ${telefone.exibicao}`,
    externo: false,
  }
}
