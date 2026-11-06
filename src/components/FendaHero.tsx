import { useState } from 'react'
import { PorteiroCena } from './PorteiroCena.tsx'

/** Camadas de trás do hero: imagem no HTML, canvas por cima se o aparelho aguentar. */
export function FendaHero() {
  const [cenaPronta, setCenaPronta] = useState(false)
  const cruzar = `transition-opacity duration-[600ms] ${cenaPronta ? 'opacity-0' : ''}`
  return (
    <>
      <div aria-hidden="true" className="fenda-luz absolute inset-0 -z-10 overflow-hidden md:left-[34%] xl:left-[60%]">
        <div className="absolute inset-0 xl:origin-[65%_0%] xl:scale-125">
          <picture>
            <source srcSet="/img/fenda-800.avif" type="image/avif" />
            <source srcSet="/img/fenda-800.webp" type="image/webp" />
            <img
              src="/img/fenda-800.webp"
              alt=""
              width={800}
              height={1200}
              fetchPriority="high"
              className={`absolute inset-0 size-full object-cover ${cruzar}`}
            />
          </picture>
          <PorteiroCena aoPronta={setCenaPronta} />
        </div>
      </div>
      {/* Escurece a parte de baixo no celular: o texto nunca disputa com o leque de luz. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-3/4 bg-linear-to-b from-transparent via-noite/80 to-noite md:h-2/3 xl:hidden"
      />
      {/* No desktop o leque se dissolve no fundo em vez de bater na borda da seção. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 hidden h-1/3 bg-linear-to-b from-transparent to-noite xl:block"
      />
    </>
  )
}
