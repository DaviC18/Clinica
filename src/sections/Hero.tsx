import { Star } from 'lucide-react'
import { CtaWhatsApp } from '../components/CtaWhatsApp.tsx'
import { FendaHero } from '../components/FendaHero.tsx'
import { LinkLigar } from '../components/LinkLigar.tsx'
import { TextoMarcado } from '../components/TextoMarcado.tsx'
import { conteudo } from '../data/conteudo.ts'

const { eyebrow, titulo, subtitulo, medica, nota, ctaPrimario, ctaSecundario } = conteudo.hero

export function Hero() {
  return (
    <section id="hero" className="relative isolate flex min-h-svh flex-col overflow-hidden bg-noite text-porcelana">
      <FendaHero />
      <div className="relative z-10 flex flex-1 flex-col px-gutter">
        <div className="relative mx-auto flex w-full max-w-pagina flex-1 flex-col justify-end pt-24 pb-8 md:pt-28 xl:justify-center xl:pt-28 xl:pb-12">
          <div className="max-w-[34rem] xl:max-w-[41rem]">
            <h1 className="font-display text-hero font-medium text-balance">{titulo}</h1>
            <p className="mt-2 text-corpo text-nevoa md:mt-3 xl:text-corpo-g">{subtitulo}</p>
            <p className="mt-2 text-legal text-nevoa md:mt-3">
              <TextoMarcado texto={medica} />
            </p>
            <p className="mt-2 flex items-center gap-2 text-corpo font-semibold md:mt-3">
              <Star aria-hidden="true" className="size-5 shrink-0 fill-ambar text-ambar" />
              {nota}
            </p>
            <div className="mt-3 flex flex-col gap-1 md:mt-4 xl:mt-6 xl:flex-row xl:items-start xl:gap-6">
              <div className="flex flex-col gap-1.5">
                <CtaWhatsApp rotulo={ctaPrimario} className="w-full md:w-auto md:self-start" />
                <p className="text-corpo text-nevoa">{eyebrow}</p>
              </div>
              <LinkLigar rotulo={ctaSecundario} className="self-start focus-visible:outline-fluor xl:mt-3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
