import { CtaWhatsApp } from '../components/CtaWhatsApp.tsx'
import { LinkLigar } from '../components/LinkLigar.tsx'
import { conteudo } from '../data/conteudo.ts'

const { titulo, texto, aviso, ctaPrimario, ctaSecundario } = conteudo.ctaFinal

export function CtaFinal() {
  return (
    <div className="bg-noite">
      {/* A faixa clara da seção anterior se fecha em fenda ao rolar (animations/iniciar.ts). */}
      <div data-cortina aria-hidden="true" className="h-[18svh] bg-nevoa-clara" />
      <section id="cta-final" className="px-gutter py-secao text-center text-porcelana">
        <div className="mx-auto flex max-w-texto flex-col items-center">
          <h2 className="font-display text-titulo-2 font-medium text-balance">{titulo}</h2>
          <p className="mt-4 text-corpo-g text-nevoa">{texto}</p>
          <CtaWhatsApp rotulo={ctaPrimario} className="mt-8 w-full md:w-auto" />
          <LinkLigar rotulo={ctaSecundario} className="mt-2 focus-visible:outline-fluor" />
          <p className="mt-6 text-legal text-nevoa">{aviso}</p>
        </div>
      </section>
    </div>
  )
}
